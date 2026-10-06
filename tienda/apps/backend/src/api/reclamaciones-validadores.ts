import { z } from "@medusajs/framework/zod"

const texto = (min: number, max: number, campo: string) =>
  z
    .string({ error: `${campo} es obligatorio` })
    .trim()
    .min(min, `${campo} debe tener al menos ${min} caracteres`)
    .max(max, `${campo} no puede pasar de ${max} caracteres`)

const DOCUMENTOS = {
  DNI: /^\d{8}$/,
  CE: /^[A-Za-z0-9]{8,12}$/,
  PASAPORTE: /^[A-Za-z0-9]{6,12}$/,
  RUC: /^(10|15|17|20)\d{9}$/,
}

export const CrearReclamoSchema = z
  .object({
    tipo: z.enum(["reclamo", "queja"]),
    nombre: texto(3, 120, "El nombre"),
    documento_tipo: z.enum(["DNI", "CE", "PASAPORTE", "RUC"]),
    documento_numero: z.string().trim(),
    domicilio: texto(5, 200, "El domicilio"),
    telefono: z.string().trim().max(20).optional().nullable(),
    email: z.string().trim().email("Ingresa un correo válido").max(150),
    es_menor: z.boolean().default(false),
    apoderado: z.string().trim().max(120).optional().nullable(),
    bien_tipo: z.enum(["producto", "servicio"]),
    bien_descripcion: texto(3, 300, "La descripción del bien"),
    monto: z.number().nonnegative().max(1_000_000).optional().nullable(),
    numero_pedido: z.string().trim().max(30).optional().nullable(),
    detalle: texto(10, 3000, "El detalle"),
    pedido_consumidor: texto(5, 2000, "El pedido"),
    acepta: z.literal(true, { error: "Debes confirmar que los datos son correctos" }),
  })
  .superRefine((d, ctx) => {
    if (!DOCUMENTOS[d.documento_tipo].test(d.documento_numero)) {
      ctx.addIssue({ code: "custom", path: ["documento_numero"], message: `Número de ${d.documento_tipo} no válido` })
    }
    if (d.es_menor && !d.apoderado) {
      ctx.addIssue({ code: "custom", path: ["apoderado"], message: "Si eres menor de edad, indica a tu padre, madre o apoderado" })
    }
  })

export type CrearReclamo = z.infer<typeof CrearReclamoSchema>

export const ResponderReclamoSchema = z.object({
  respuesta: texto(10, 5000, "La respuesta"),
})
