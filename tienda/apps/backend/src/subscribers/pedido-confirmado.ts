import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { correoPedidoConfirmado } from "../lib/correos"

/** Al crearse un pedido, envía la confirmación al cliente. */
export default async function pedidoConfirmado({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const {
    data: [pedido],
  } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "created_at",
      "email",
      "subtotal",
      "shipping_total",
      "tax_total",
      "total",
      "items.title",
      "items.variant_title",
      "items.quantity",
      "items.total",
      "shipping_address.first_name",
      "shipping_address.address_1",
      "shipping_address.city",
      "shipping_methods.name",
    ],
    filters: { id: data.id },
  })
  if (!pedido?.email) {
    logger.warn(`Pedido ${data.id} sin correo: no se envía confirmación`)
    return
  }

  await container.resolve(Modules.NOTIFICATION).createNotifications({
    to: pedido.email,
    channel: "email",
    template: "pedido-confirmado",
    content: correoPedidoConfirmado(pedido as any),
    resource_id: pedido.id,
    resource_type: "order",
    idempotency_key: `pedido-confirmado-${pedido.id}`,
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
