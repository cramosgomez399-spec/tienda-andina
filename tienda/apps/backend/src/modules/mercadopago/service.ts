import { AbstractPaymentProvider, BigNumber, MedusaError, PaymentSessionStatus } from "@medusajs/framework/utils"
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import { MercadoPagoClient, MPPago, pagoQueCoincide } from "./client"

type Opciones = {
  accessToken: string
  /** URL HTTPS de la tienda a la que Mercado Pago devuelve al cliente (solo producción). */
  returnUrl?: string
  /** URL pública del webhook: https://<backend>/hooks/payment/mercadopago_mercadopago */
  webhookUrl?: string
  /** Texto que aparece en el estado de cuenta de la tarjeta (máx. 22 caracteres). */
  statementDescriptor?: string
}

/** Lo que guardamos en payment_session.data. */
type DatosSesion = {
  session_id: string
  preference_id?: string
  init_point?: string
  monto?: number
  moneda?: string
  pago_id?: number
  pago_estado?: MPPago["status"]
}

const aNumero = (monto: unknown) => Number(new BigNumber(monto as any).numeric)

/**
 * Proveedor de pagos de Mercado Pago con Checkout Pro.
 *
 * Flujo: initiatePayment crea una preferencia cuyo external_reference es el ID de la sesión de
 * Medusa → el cliente paga en Mercado Pago → authorizePayment busca en la API un pago aprobado con
 * esa referencia, por el mismo monto y moneda. Nunca se confía en lo que diga el navegador.
 */
class MercadoPagoProviderService extends AbstractPaymentProvider<Opciones> {
  static identifier = "mercadopago"

  protected logger_: Logger
  protected options_: Opciones
  protected mp: MercadoPagoClient

  static validateOptions(options: Record<string, unknown>) {
    if (!options.accessToken) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Falta MERCADOPAGO_ACCESS_TOKEN para el proveedor de Mercado Pago")
    }
  }

  constructor(container: { logger: Logger }, options: Opciones) {
    super(container, options)
    this.logger_ = container.logger
    this.options_ = options
    this.mp = new MercadoPagoClient(options.accessToken)
  }

  private async crearPreferencia(sessionId: string, monto: number, moneda: string, email?: string) {
    const devolverATienda = this.options_.returnUrl?.startsWith("https://")
    const preferencia = await this.mp.crearPreferencia(
      {
        items: [
          {
            id: sessionId,
            title: "Pedido en Tienda Andina",
            quantity: 1,
            unit_price: monto,
            currency_id: moneda.toUpperCase(),
          },
        ],
        external_reference: sessionId,
        metadata: { session_id: sessionId },
        statement_descriptor: this.options_.statementDescriptor ?? "TIENDA ANDINA",
        ...(email && { payer: { email } }),
        // Mercado Pago solo acepta URLs de retorno HTTPS; en local el storefront consulta el estado.
        ...(devolverATienda && {
          back_urls: {
            success: this.options_.returnUrl,
            pending: this.options_.returnUrl,
            failure: this.options_.returnUrl,
          },
          auto_return: "approved",
        }),
        ...(this.options_.webhookUrl && { notification_url: this.options_.webhookUrl }),
      },
      `${sessionId}-${monto}`
    )
    return preferencia
  }

  private async pagoValido(datos: DatosSesion): Promise<MPPago | undefined> {
    const pagos = await this.mp.buscarPagos(datos.session_id)
    return pagoQueCoincide(pagos, datos, (msg) => this.logger_.warn(msg))
  }

  private estadoMedusa(estado?: MPPago["status"]): PaymentSessionStatus {
    switch (estado) {
      case "approved":
        return PaymentSessionStatus.CAPTURED
      case "authorized":
        return PaymentSessionStatus.AUTHORIZED
      case "rejected":
        return PaymentSessionStatus.ERROR
      case "cancelled":
      case "refunded":
      case "charged_back":
        return PaymentSessionStatus.CANCELED
      default:
        return PaymentSessionStatus.PENDING
    }
  }

  async initiatePayment({ amount, currency_code, data, context }: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const sessionId = data?.session_id as string
    const monto = aNumero(amount)
    const preferencia = await this.crearPreferencia(sessionId, monto, currency_code, context?.customer?.email)
    const datos: DatosSesion = {
      session_id: sessionId,
      preference_id: preferencia.id,
      init_point: preferencia.init_point,
      monto,
      moneda: currency_code,
    }
    return { id: preferencia.id, data: datos }
  }

  async updatePayment({ amount, currency_code, data, context }: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const actual = data as DatosSesion
    const monto = aNumero(amount)
    if (actual.monto === monto && actual.moneda === currency_code && actual.preference_id) {
      return { data: actual }
    }
    // Cambió el total del carrito: se crea una preferencia nueva con la misma referencia.
    const preferencia = await this.crearPreferencia(actual.session_id, monto, currency_code, context?.customer?.email)
    return {
      data: { ...actual, preference_id: preferencia.id, init_point: preferencia.init_point, monto, moneda: currency_code },
    }
  }

  async authorizePayment({ data }: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const datos = data as DatosSesion
    const pago = await this.pagoValido(datos)
    if (!pago) {
      return { status: PaymentSessionStatus.PENDING, data: datos }
    }
    return {
      status: this.estadoMedusa(pago.status),
      data: { ...datos, pago_id: pago.id, pago_estado: pago.status },
    }
  }

  async getPaymentStatus({ data }: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const datos = data as DatosSesion
    const pago = await this.pagoValido(datos)
    if (pago) return { status: this.estadoMedusa(pago.status), data: { ...datos, pago_id: pago.id } }
    const [ultimo] = await this.mp.buscarPagos(datos.session_id)
    return { status: this.estadoMedusa(ultimo?.status), data: datos }
  }

  async capturePayment({ data }: CapturePaymentInput): Promise<CapturePaymentOutput> {
    // Checkout Pro captura automáticamente al aprobarse; no hay nada más que hacer.
    return { data }
  }

  async refundPayment({ amount, data, context }: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const datos = data as DatosSesion
    if (!datos.pago_id) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "No hay un pago de Mercado Pago que reembolsar")
    }
    const monto = aNumero(amount)
    const reembolso = await this.mp.reembolsar(datos.pago_id, monto, context?.idempotency_key ?? `${datos.pago_id}-${monto}`)
    return { data: { ...datos, ultimo_reembolso_id: reembolso.id } }
  }

  async cancelPayment({ data }: CancelPaymentInput): Promise<CancelPaymentOutput> {
    // Una preferencia sin pagar simplemente expira; los pagos aprobados se anulan con reembolso.
    return { data }
  }

  async deletePayment({ data }: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data }
  }

  async retrievePayment({ data }: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const datos = data as DatosSesion
    if (!datos.pago_id) return { data: datos }
    const pago = await this.mp.obtenerPago(datos.pago_id)
    return { data: { ...datos, pago_estado: pago.status } }
  }

  /**
   * Notificaciones de Mercado Pago (POST /hooks/payment/mercadopago_mercadopago).
   * Solo se usa el ID del aviso: el estado real siempre se consulta a la API.
   */
  async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    const cuerpo = (payload.data ?? {}) as { type?: string; topic?: string; data?: { id?: string | number }; id?: string | number }
    const tipo = cuerpo.type ?? cuerpo.topic
    const pagoId = cuerpo.data?.id ?? cuerpo.id
    if (tipo !== "payment" || !pagoId) return { action: "not_supported" }

    const pago = await this.mp.obtenerPago(pagoId)
    if (!pago.external_reference) return { action: "not_supported" }

    const datos = { session_id: pago.external_reference, amount: new BigNumber(pago.transaction_amount) }
    switch (pago.status) {
      case "approved":
        return { action: "captured", data: datos }
      case "authorized":
        return { action: "authorized", data: datos }
      case "pending":
      case "in_process":
        return { action: "pending", data: datos }
      default:
        // Un pago rechazado no cierra la sesión: el cliente puede reintentar en la misma preferencia.
        return { action: "not_supported" }
    }
  }
}

export default MercadoPagoProviderService
