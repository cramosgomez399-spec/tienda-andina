import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { correoReclamoRegistrado, correoReclamoRespondido } from "../lib/correos"
import { RECLAMACIONES_MODULE } from "../modules/reclamaciones"
import ReclamacionesService from "../modules/reclamaciones/service"
import { codigoReclamo, DIAS_HABILES_RESPUESTA, sumarDiasHabiles } from "../modules/reclamaciones/utils"
import { TIENDA } from "../lib/tienda"

/**
 * reclamo.creado → constancia al consumidor (obligatoria) y aviso a atención al cliente.
 * reclamo.respondido → respuesta al consumidor.
 */
export default async function reclamoNotificar({ event, container }: SubscriberArgs<{ id: string }>) {
  const reclamaciones: ReclamacionesService = container.resolve(RECLAMACIONES_MODULE)
  const notificaciones = container.resolve(Modules.NOTIFICATION)

  const r = await reclamaciones.retrieveReclamo(event.data.id)
  const datos = {
    ...r,
    codigo: codigoReclamo(r.correlativo, r.created_at),
    plazo: sumarDiasHabiles(r.created_at, DIAS_HABILES_RESPUESTA),
  }

  if (event.name === "reclamo.respondido") {
    await notificaciones.createNotifications({
      to: r.email,
      channel: "email",
      template: "reclamo-respondido",
      content: correoReclamoRespondido(datos),
      resource_id: r.id,
      resource_type: "reclamo",
      idempotency_key: `reclamo-respondido-${r.id}`,
    })
    return
  }

  const constancia = correoReclamoRegistrado(datos)
  await notificaciones.createNotifications([
    {
      to: r.email,
      channel: "email",
      template: "reclamo-registrado",
      content: constancia,
      resource_id: r.id,
      resource_type: "reclamo",
      idempotency_key: `reclamo-registrado-${r.id}`,
    },
    {
      to: TIENDA.emailAtencion,
      channel: "email",
      template: "reclamo-registrado-interno",
      content: { ...constancia, subject: `[Nuevo ${r.tipo}] ${constancia.subject}` },
      resource_id: r.id,
      resource_type: "reclamo",
      idempotency_key: `reclamo-interno-${r.id}`,
    },
  ])
}

export const config: SubscriberConfig = {
  event: ["reclamo.creado", "reclamo.respondido"],
}
