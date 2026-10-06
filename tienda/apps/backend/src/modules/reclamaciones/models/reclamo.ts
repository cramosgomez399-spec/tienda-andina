import { model } from "@medusajs/framework/utils"

/**
 * Hoja del Libro de Reclamaciones virtual (Código de Protección y Defensa del Consumidor,
 * Ley 29571, y su reglamento). Cada hoja tiene un número correlativo y no se borra.
 */
const Reclamo = model.define("reclamo", {
  id: model.id({ prefix: "recl" }).primaryKey(),
  correlativo: model.autoincrement(),

  // Reclamo: disconformidad con el producto o servicio. Queja: malestar con la atención.
  tipo: model.enum(["reclamo", "queja"]),

  // Consumidor
  nombre: model.text(),
  documento_tipo: model.enum(["DNI", "CE", "PASAPORTE", "RUC"]),
  documento_numero: model.text(),
  domicilio: model.text(),
  telefono: model.text().nullable(),
  email: model.text(),
  es_menor: model.boolean().default(false),
  apoderado: model.text().nullable(),

  // Bien contratado
  bien_tipo: model.enum(["producto", "servicio"]),
  bien_descripcion: model.text(),
  monto: model.bigNumber().nullable(),
  numero_pedido: model.text().nullable(),

  // Detalle
  detalle: model.text(),
  pedido_consumidor: model.text(),

  // Atención por parte de la tienda
  estado: model.enum(["pendiente", "respondido"]).default("pendiente"),
  respuesta: model.text().nullable(),
  respondido_en: model.dateTime().nullable(),
})

export default Reclamo
