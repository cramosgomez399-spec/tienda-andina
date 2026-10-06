// Cliente mínimo de la API REST de Mercado Pago (Checkout Pro + pagos).
// Docs: https://www.mercadopago.com.pe/developers/es/reference

const API = "https://api.mercadopago.com"

export type MPPreferencia = {
  id: string
  init_point: string
  sandbox_init_point?: string
}

export type MPPago = {
  id: number
  status:
    | "pending"
    | "approved"
    | "authorized"
    | "in_process"
    | "in_mediation"
    | "rejected"
    | "cancelled"
    | "refunded"
    | "charged_back"
  status_detail: string
  external_reference: string | null
  transaction_amount: number
  currency_id: string
  date_approved: string | null
  payment_method_id?: string
  payment_type_id?: string
}

/**
 * Pago que valida una sesión: aprobado (o autorizado) y por el mismo monto y moneda que se cobró.
 * Un pago con otro monto se ignora y se avisa: podría ser una preferencia manipulada.
 */
export function pagoQueCoincide(
  pagos: MPPago[],
  esperado: { session_id: string; monto?: number; moneda?: string },
  avisar?: (mensaje: string) => void
) {
  return pagos.find((p) => {
    if (p.status !== "approved" && p.status !== "authorized") return false
    const montoOk = esperado.monto === undefined || Math.abs(p.transaction_amount - esperado.monto) < 0.005
    const monedaOk = !esperado.moneda || p.currency_id === esperado.moneda.toUpperCase()
    if (!montoOk || !monedaOk) {
      avisar?.(
        `Mercado Pago: el pago ${p.id} de la sesión ${esperado.session_id} no coincide ` +
          `(${p.transaction_amount} ${p.currency_id}; se esperaba ${esperado.monto} ${esperado.moneda})`
      )
    }
    return montoOk && monedaOk
  })
}

export class MercadoPagoError extends Error {
  constructor(
    public status: number,
    public detalle: unknown
  ) {
    super(`Mercado Pago respondió ${status}: ${JSON.stringify(detalle)}`)
  }
}

export class MercadoPagoClient {
  constructor(private accessToken: string) {}

  private async request<T>(
    metodo: "GET" | "POST",
    ruta: string,
    cuerpo?: unknown,
    claveIdempotencia?: string
  ): Promise<T> {
    const res = await fetch(API + ruta, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...(claveIdempotencia && { "X-Idempotency-Key": claveIdempotencia }),
      },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
    const datos = await res.json().catch(() => null)
    if (!res.ok) throw new MercadoPagoError(res.status, datos)
    return datos as T
  }

  crearPreferencia(preferencia: Record<string, unknown>, claveIdempotencia: string) {
    return this.request<MPPreferencia>("POST", "/checkout/preferences", preferencia, claveIdempotencia)
  }

  obtenerPago(id: string | number) {
    return this.request<MPPago>("GET", `/v1/payments/${encodeURIComponent(String(id))}`)
  }

  /** Pagos asociados a una referencia externa (en esta tienda: el ID de la sesión de pago de Medusa). */
  async buscarPagos(externalReference: string) {
    const q = new URLSearchParams({
      external_reference: externalReference,
      sort: "date_created",
      criteria: "desc",
    })
    const { results } = await this.request<{ results: MPPago[] }>("GET", `/v1/payments/search?${q}`)
    return results
  }

  reembolsar(pagoId: string | number, monto: number, claveIdempotencia: string) {
    return this.request<{ id: number; status: string }>(
      "POST",
      `/v1/payments/${encodeURIComponent(String(pagoId))}/refunds`,
      { amount: monto },
      claveIdempotencia
    )
  }
}
