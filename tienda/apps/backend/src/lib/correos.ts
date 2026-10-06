import { TIENDA } from "./tienda"

// Plantillas de correo. Todo dato ingresado por clientes pasa por `e()` para evitar inyección de HTML.

const e = (valor: unknown) =>
  String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const soles = (monto: unknown) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(Number(monto ?? 0))

const fecha = (valor: Date | string) =>
  new Date(valor).toLocaleDateString("es-PE", { dateStyle: "long", timeZone: "America/Lima" })

export type Correo = { subject: string; html: string; text: string }

function plantilla(titulo: string, cuerpo: string) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f5f6f8;font-family:Arial,Helvetica,sans-serif;color:#1c2330">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #dfe3ea;border-radius:12px">
<tr><td style="padding:24px 28px;border-bottom:1px solid #dfe3ea;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#667085">${e(TIENDA.nombre)}</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:22px">${e(titulo)}</h1>
${cuerpo}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #dfe3ea;font-size:12px;color:#667085">
${e(TIENDA.razonSocial)} · RUC ${e(TIENDA.ruc)} · ${e(TIENDA.direccion)}<br>
Precios en soles con IGV incluido.
</td></tr></table></td></tr></table></body></html>`
}

const parrafo = (html: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.5">${html}</p>`
const fila = (etiqueta: string, valor: string) =>
  `<tr><td style="padding:6px 0;color:#667085;font-size:14px">${e(etiqueta)}</td><td style="padding:6px 0;text-align:right;font-size:14px">${valor}</td></tr>`

type PedidoCorreo = {
  display_id: number
  created_at: Date | string
  email: string
  items: { title: string; variant_title?: string | null; quantity: number; total: unknown }[]
  subtotal: unknown
  shipping_total: unknown
  tax_total: unknown
  total: unknown
  shipping_address?: { first_name?: string | null; address_1?: string | null; city?: string | null } | null
  shipping_methods?: { name: string }[]
}

export function correoPedidoConfirmado(pedido: PedidoCorreo): Correo {
  const nombre = pedido.shipping_address?.first_name ?? ""
  const lineas = pedido.items
    .map((i) =>
      fila(`${i.quantity} × ${i.title}${i.variant_title ? ` (${i.variant_title})` : ""}`, e(soles(i.total)))
    )
    .join("")
  const cuerpo =
    parrafo(`Hola ${e(nombre)}, recibimos tu pedido <strong>n.º ${e(pedido.display_id)}</strong> del ${e(fecha(pedido.created_at))}. Te avisaremos cuando salga a despacho.`) +
    `<table role="presentation" width="100%" style="border-collapse:collapse;margin:8px 0 18px">${lineas}
      <tr><td colspan="2" style="border-top:1px solid #dfe3ea"></td></tr>
      ${fila("Envío", e(soles(pedido.shipping_total)))}
      ${fila("IGV (incluido)", e(soles(pedido.tax_total)))}
      <tr><td style="padding:8px 0;font-weight:bold">Total</td><td style="padding:8px 0;text-align:right;font-weight:bold">${e(soles(pedido.total))}</td></tr>
    </table>` +
    parrafo(`<strong>Envío:</strong> ${e(pedido.shipping_methods?.[0]?.name ?? "")} a ${e(pedido.shipping_address?.address_1)}, ${e(pedido.shipping_address?.city)}.`) +
    parrafo(`¿Algún problema? Escríbenos a ${e(TIENDA.emailAtencion)}.`)

  return {
    subject: `Pedido n.º ${pedido.display_id} confirmado · ${TIENDA.nombre}`,
    html: plantilla("¡Gracias por tu compra!", cuerpo),
    text: `Recibimos tu pedido n.º ${pedido.display_id}. Total: ${soles(pedido.total)}.`,
  }
}

type ReclamoCorreo = {
  codigo: string
  tipo: string
  created_at: Date | string
  plazo: Date
  nombre: string
  documento_tipo: string
  documento_numero: string
  domicilio: string
  telefono?: string | null
  email: string
  apoderado?: string | null
  bien_tipo: string
  bien_descripcion: string
  monto?: unknown
  numero_pedido?: string | null
  detalle: string
  pedido_consumidor: string
  respuesta?: string | null
  respondido_en?: Date | string | null
}

function fichaReclamo(r: ReclamoCorreo) {
  return `<table role="presentation" width="100%" style="border-collapse:collapse;margin:8px 0 18px">
    ${fila("Hoja n.º", `<strong>${e(r.codigo)}</strong>`)}
    ${fila("Fecha", e(fecha(r.created_at)))}
    ${fila("Tipo", e(r.tipo === "queja" ? "Queja" : "Reclamo"))}
    ${fila("Consumidor", e(r.nombre))}
    ${fila("Documento", e(`${r.documento_tipo} ${r.documento_numero}`))}
    ${fila("Domicilio", e(r.domicilio))}
    ${r.telefono ? fila("Teléfono", e(r.telefono)) : ""}
    ${fila("Correo", e(r.email))}
    ${r.apoderado ? fila("Padre, madre o apoderado", e(r.apoderado)) : ""}
    ${fila("Bien contratado", e(`${r.bien_tipo === "servicio" ? "Servicio" : "Producto"}: ${r.bien_descripcion}`))}
    ${r.monto ? fila("Monto reclamado", e(soles(r.monto))) : ""}
    ${r.numero_pedido ? fila("N.º de pedido", e(r.numero_pedido)) : ""}
  </table>
  <p style="margin:0 0 6px;font-size:14px;color:#667085">Detalle</p>
  <p style="margin:0 0 14px;font-size:15px;line-height:1.5;white-space:pre-wrap">${e(r.detalle)}</p>
  <p style="margin:0 0 6px;font-size:14px;color:#667085">Pedido del consumidor</p>
  <p style="margin:0 0 14px;font-size:15px;line-height:1.5;white-space:pre-wrap">${e(r.pedido_consumidor)}</p>`
}

/** Constancia que la ley exige enviar al consumidor al registrar la hoja. */
export function correoReclamoRegistrado(r: ReclamoCorreo): Correo {
  const cuerpo =
    parrafo(`Registramos tu ${r.tipo === "queja" ? "queja" : "reclamo"} en nuestro Libro de Reclamaciones. Esta es tu constancia.`) +
    fichaReclamo(r) +
    parrafo(`Te responderemos a este correo a más tardar el <strong>${e(fecha(r.plazo))}</strong> (15 días hábiles).`) +
    parrafo(`<small style="color:#667085">La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.</small>`)
  return {
    subject: `Constancia de ${r.tipo} n.º ${r.codigo} · ${TIENDA.nombre}`,
    html: plantilla("Libro de Reclamaciones", cuerpo),
    text: `Registramos tu ${r.tipo} n.º ${r.codigo}. Te responderemos a más tardar el ${fecha(r.plazo)}.`,
  }
}

export function correoReclamoRespondido(r: ReclamoCorreo): Correo {
  const cuerpo =
    parrafo(`Hola ${e(r.nombre)}, esta es nuestra respuesta a tu ${r.tipo === "queja" ? "queja" : "reclamo"} n.º <strong>${e(r.codigo)}</strong>.`) +
    `<div style="margin:0 0 18px;padding:16px;background:#f5f6f8;border-radius:8px;font-size:15px;line-height:1.5;white-space:pre-wrap">${e(r.respuesta)}</div>` +
    parrafo(`Fecha de respuesta: ${e(fecha(r.respondido_en ?? new Date()))}.`) +
    `<p style="margin:16px 0 6px;font-size:13px;color:#667085">Copia de tu hoja de reclamación:</p>` +
    fichaReclamo(r)
  return {
    subject: `Respuesta a tu ${r.tipo} n.º ${r.codigo} · ${TIENDA.nombre}`,
    html: plantilla("Respuesta del Libro de Reclamaciones", cuerpo),
    text: `Respuesta a tu ${r.tipo} n.º ${r.codigo}: ${r.respuesta ?? ""}`,
  }
}
