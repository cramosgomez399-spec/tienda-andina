"use client"

import { HojaRegistrada, registrarReclamo } from "@lib/data/reclamaciones"
import { TIENDA } from "@lib/tienda"
import { Button, Heading, Text } from "@modules/common/components/ui"
import { useState } from "react"

type Errores = Record<string, string>

const DOCUMENTOS: Record<string, RegExp> = {
  DNI: /^\d{8}$/,
  CE: /^[A-Za-z0-9]{8,12}$/,
  PASAPORTE: /^[A-Za-z0-9]{6,12}$/,
  RUC: /^(10|15|17|20)\d{9}$/,
}

const fecha = (v: string) => new Date(v).toLocaleDateString("es-PE", { dateStyle: "long" })

const estiloCampo =
  "w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 txt-medium text-ui-fg-base focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive"

function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  children,
}: {
  id: string
  etiqueta: string
  error?: string
  ayuda?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-y-1">
      <label htmlFor={id} className="txt-compact-small-plus text-ui-fg-base">
        {etiqueta}
      </label>
      {children}
      {ayuda && !error && <span className="txt-compact-small text-ui-fg-muted">{ayuda}</span>}
      {error && (
        <span id={`${id}-error`} className="txt-compact-small text-ui-fg-error">
          {error}
        </span>
      )}
    </div>
  )
}

function validar(d: Record<string, any>): Errores {
  const e: Errores = {}
  if ((d.nombre ?? "").trim().length < 3) e.nombre = "Escribe tu nombre completo"
  if (!DOCUMENTOS[d.documento_tipo]?.test((d.documento_numero ?? "").trim()))
    e.documento_numero = `Número de ${d.documento_tipo} no válido`
  if ((d.domicilio ?? "").trim().length < 5) e.domicilio = "Escribe tu domicilio"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((d.email ?? "").trim())) e.email = "Ingresa un correo válido"
  if (d.es_menor && (d.apoderado ?? "").trim().length < 3) e.apoderado = "Indica el nombre de tu padre, madre o apoderado"
  if ((d.bien_descripcion ?? "").trim().length < 3) e.bien_descripcion = "Indica el producto o servicio"
  if (d.monto !== "" && d.monto !== undefined && !(Number(d.monto) >= 0)) e.monto = "Monto no válido"
  if ((d.detalle ?? "").trim().length < 10) e.detalle = "Cuéntanos qué pasó (mínimo 10 caracteres)"
  if ((d.pedido_consumidor ?? "").trim().length < 5) e.pedido_consumidor = "Indica qué solicitas"
  if (!d.acepta) e.acepta = "Confirma que los datos son correctos"
  return e
}

export default function FormularioReclamo() {
  const [errores, setErrores] = useState<Errores>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [esMenor, setEsMenor] = useState(false)
  const [hoja, setHoja] = useState<HojaRegistrada | null>(null)

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const f = new FormData(evento.currentTarget)
    const d: Record<string, any> = Object.fromEntries(f.entries())
    d.es_menor = f.get("es_menor") === "on"
    d.acepta = f.get("acepta") === "on"

    const encontrados = validar(d)
    setErrores(encontrados)
    setErrorGeneral(null)
    if (Object.keys(encontrados).length) {
      document.getElementById(Object.keys(encontrados)[0])?.focus()
      return
    }

    setEnviando(true)
    const resultado = await registrarReclamo({
      ...d,
      monto: d.monto === "" ? null : Number(d.monto),
      telefono: d.telefono || null,
      numero_pedido: d.numero_pedido || null,
      apoderado: d.es_menor ? d.apoderado : null,
    })
    setEnviando(false)
    if (resultado.ok) {
      setHoja(resultado.hoja)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      setErrorGeneral(resultado.error)
    }
  }

  if (hoja) {
    return (
      <div className="flex flex-col gap-y-4 rounded-lg border border-ui-border-base p-6" role="status">
        <Heading level="h2" className="text-2xl font-bold text-anil">
          Hoja n.º {hoja.codigo} registrada
        </Heading>
        <Text className="text-ui-fg-subtle">
          Enviamos una copia de tu hoja a <strong>{hoja.email}</strong>. Te responderemos a ese correo a más
          tardar el <strong>{fecha(hoja.plazo_respuesta)}</strong> (15 días hábiles).
        </Text>
        <Text className="txt-small text-ui-fg-muted">
          Guarda el número de hoja para cualquier consulta. Registrar un reclamo no impide acudir a otras vías
          de solución ni es requisito previo para presentar una denuncia ante el INDECOPI.
        </Text>
      </div>
    )
  }

  const err = (campo: string) =>
    errores[campo] ? { "aria-invalid": true, "aria-describedby": `${campo}-error` } : {}

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-y-8">
      <section className="flex flex-col gap-y-4">
        <Heading level="h2" className="text-2xl font-bold text-anil">
          1. Identificación del consumidor
        </Heading>
        <Campo id="nombre" etiqueta="Nombre completo" error={errores.nombre}>
          <input id="nombre" name="nombre" autoComplete="name" className={estiloCampo} {...err("nombre")} />
        </Campo>
        <div className="grid grid-cols-1 small:grid-cols-3 gap-4">
          <Campo id="documento_tipo" etiqueta="Tipo de documento">
            <select id="documento_tipo" name="documento_tipo" className={estiloCampo} defaultValue="DNI">
              <option value="DNI">DNI</option>
              <option value="CE">Carné de extranjería</option>
              <option value="PASAPORTE">Pasaporte</option>
              <option value="RUC">RUC</option>
            </select>
          </Campo>
          <div className="small:col-span-2">
            <Campo id="documento_numero" etiqueta="Número de documento" error={errores.documento_numero}>
              <input
                id="documento_numero"
                name="documento_numero"
                inputMode="numeric"
                className={estiloCampo}
                {...err("documento_numero")}
              />
            </Campo>
          </div>
        </div>
        <Campo id="domicilio" etiqueta="Domicilio" error={errores.domicilio}>
          <input id="domicilio" name="domicilio" autoComplete="street-address" className={estiloCampo} {...err("domicilio")} />
        </Campo>
        <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
          <Campo id="email" etiqueta="Correo electrónico" error={errores.email} ayuda="Aquí recibirás la copia y la respuesta">
            <input id="email" name="email" type="email" autoComplete="email" className={estiloCampo} {...err("email")} />
          </Campo>
          <Campo id="telefono" etiqueta="Teléfono (opcional)">
            <input id="telefono" name="telefono" type="tel" autoComplete="tel" className={estiloCampo} />
          </Campo>
        </div>
        <label className="flex items-center gap-x-2 txt-medium">
          <input type="checkbox" name="es_menor" checked={esMenor} onChange={(e) => setEsMenor(e.target.checked)} />
          Soy menor de edad
        </label>
        {esMenor && (
          <Campo id="apoderado" etiqueta="Nombre del padre, madre o apoderado" error={errores.apoderado}>
            <input id="apoderado" name="apoderado" className={estiloCampo} {...err("apoderado")} />
          </Campo>
        )}
      </section>

      <section className="flex flex-col gap-y-4">
        <Heading level="h2" className="text-2xl font-bold text-anil">
          2. Identificación del bien contratado
        </Heading>
        <fieldset className="flex gap-x-6">
          <legend className="sr-only">Tipo de bien</legend>
          <label className="flex items-center gap-x-2 txt-medium">
            <input type="radio" name="bien_tipo" value="producto" defaultChecked /> Producto
          </label>
          <label className="flex items-center gap-x-2 txt-medium">
            <input type="radio" name="bien_tipo" value="servicio" /> Servicio
          </label>
        </fieldset>
        <Campo id="bien_descripcion" etiqueta="Descripción" error={errores.bien_descripcion} ayuda="Ej.: Polerón Vintage talla M">
          <input id="bien_descripcion" name="bien_descripcion" className={estiloCampo} {...err("bien_descripcion")} />
        </Campo>
        <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
          <Campo id="monto" etiqueta="Monto reclamado en S/ (opcional)" error={errores.monto}>
            <input id="monto" name="monto" type="number" min="0" step="0.01" inputMode="decimal" className={estiloCampo} {...err("monto")} />
          </Campo>
          <Campo id="numero_pedido" etiqueta="N.º de pedido (opcional)">
            <input id="numero_pedido" name="numero_pedido" className={estiloCampo} />
          </Campo>
        </div>
      </section>

      <section className="flex flex-col gap-y-4">
        <Heading level="h2" className="text-2xl font-bold text-anil">
          3. Detalle de la reclamación
        </Heading>
        <fieldset className="flex flex-col gap-y-2">
          <legend className="txt-compact-small-plus mb-2">Tipo</legend>
          <label className="flex items-start gap-x-2 txt-medium">
            <input type="radio" name="tipo" value="reclamo" defaultChecked className="mt-1" />
            <span>
              <strong>Reclamo:</strong> disconformidad con los productos o servicios.
            </span>
          </label>
          <label className="flex items-start gap-x-2 txt-medium">
            <input type="radio" name="tipo" value="queja" className="mt-1" />
            <span>
              <strong>Queja:</strong> malestar o descontento con la atención al público.
            </span>
          </label>
        </fieldset>
        <Campo id="detalle" etiqueta="Detalle" error={errores.detalle}>
          <textarea id="detalle" name="detalle" rows={5} className={estiloCampo} {...err("detalle")} />
        </Campo>
        <Campo id="pedido_consumidor" etiqueta="Pedido" error={errores.pedido_consumidor} ayuda="¿Qué solicitas a la tienda?">
          <textarea id="pedido_consumidor" name="pedido_consumidor" rows={3} className={estiloCampo} {...err("pedido_consumidor")} />
        </Campo>
      </section>

      <div className="flex flex-col gap-y-4">
        <label className="flex items-start gap-x-2 txt-medium">
          <input type="checkbox" id="acepta" name="acepta" className="mt-1" {...err("acepta")} />
          <span>Declaro que los datos consignados son correctos.</span>
        </label>
        {errores.acepta && <span id="acepta-error" className="txt-compact-small text-ui-fg-error">{errores.acepta}</span>}
        {errorGeneral && (
          <div role="alert" className="rounded-md bg-ui-bg-subtle p-3 txt-medium text-ui-fg-error">
            {errorGeneral}
          </div>
        )}
        <Button type="submit" size="large" isLoading={enviando} className="self-start">
          Registrar hoja de reclamación
        </Button>
        <Text className="txt-small text-ui-fg-muted">
          {TIENDA.razonSocial} responderá en un plazo máximo de 15 días hábiles. La formulación del reclamo no
          impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una
          denuncia ante el INDECOPI.
        </Text>
      </div>
    </form>
  )
}
