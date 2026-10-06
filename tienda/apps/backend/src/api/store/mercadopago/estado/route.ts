import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { MercadoPagoClient, pagoQueCoincide } from "../../../../modules/mercadopago/client"

const PROVEEDOR = "pp_mercadopago_mercadopago"

/**
 * GET /store/mercadopago/estado?session_id=payses_...
 * La tienda lo consulta mientras el cliente paga en Mercado Pago. Solo informa si ya hay un pago
 * aprobado que coincida; el pedido se crea después, al completar el carrito (que vuelve a verificar).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const sessionId = req.query.session_id
  if (typeof sessionId !== "string" || !sessionId.startsWith("payses_")) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "session_id inválido")
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [sesion],
  } = await query.graph({
    entity: "payment_session",
    fields: ["id", "provider_id", "data"],
    filters: { id: sessionId },
  })
  if (!sesion || sesion.provider_id !== PROVEEDOR) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Sesión de pago no encontrada")
  }

  const datos = sesion.data as { session_id: string; monto?: number; moneda?: string }
  const mp = new MercadoPagoClient(process.env.MERCADOPAGO_ACCESS_TOKEN!)
  const pagos = await mp.buscarPagos(sesion.id)
  const aprobado = pagoQueCoincide(pagos, { ...datos, session_id: sesion.id })

  res.json({
    aprobado: !!aprobado,
    // Último intento, para mostrar mensajes como "tarjeta rechazada, intenta de nuevo".
    ultimo_estado: pagos[0]?.status ?? null,
    ultimo_detalle: pagos[0]?.status_detail ?? null,
  })
}
