import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"

// Activa Mercado Pago en la región Perú, manteniendo el pago manual de demo.
// Se puede ejecutar varias veces: npx medusa exec ./src/scripts/activar-mercadopago.ts
export default async function activarMercadoPago({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: proveedores } = await query.graph({ entity: "payment_provider", fields: ["id", "is_enabled"] })
  if (!proveedores.some((p) => p.id === "pp_mercadopago_mercadopago")) {
    throw new Error("Mercado Pago no está registrado: revisa MERCADOPAGO_ACCESS_TOKEN en .env y reinicia el backend")
  }

  const { data: regiones } = await query.graph({
    entity: "region",
    fields: ["id", "name", "payment_providers.id"],
    filters: { name: "Perú" },
  })
  const region = regiones[0]
  if (!region) throw new Error("No existe la región Perú")

  await updateRegionsWorkflow(container).run({
    input: {
      selector: { id: region.id },
      update: { payment_providers: ["pp_mercadopago_mercadopago", "pp_system_default"] },
    },
  })
  logger.info(`Mercado Pago activado en la región ${region.name}.`)
}
