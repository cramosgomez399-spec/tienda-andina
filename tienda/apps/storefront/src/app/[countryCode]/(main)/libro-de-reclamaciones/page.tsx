import { TIENDA } from "@lib/tienda"
import { Heading, Text } from "@modules/common/components/ui"
import FormularioReclamo from "@modules/reclamaciones/formulario"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Libro de Reclamaciones",
  description: "Registra un reclamo o una queja. Te responderemos en un plazo máximo de 15 días hábiles.",
}

export default function LibroDeReclamaciones() {
  const hoy = new Date().toLocaleDateString("es-PE", { dateStyle: "long", timeZone: "America/Lima" })

  return (
    <div className="content-container py-12 small:py-16">
      <div className="mx-auto max-w-2xl flex flex-col gap-y-8">
        <header className="flex flex-col gap-y-2">
          <Heading level="h1" className="text-3xl">
            Libro de Reclamaciones
          </Heading>
          <Text className="text-ui-fg-subtle">
            Conforme al Código de Protección y Defensa del Consumidor, contamos con un Libro de Reclamaciones
            virtual a tu disposición.
          </Text>
        </header>

        <dl className="grid grid-cols-1 small:grid-cols-2 gap-4 rounded-lg bg-ui-bg-subtle p-4 txt-small">
          <div>
            <dt className="text-ui-fg-muted">Proveedor</dt>
            <dd>{TIENDA.razonSocial}</dd>
          </div>
          <div>
            <dt className="text-ui-fg-muted">RUC</dt>
            <dd>{TIENDA.ruc}</dd>
          </div>
          <div>
            <dt className="text-ui-fg-muted">Domicilio</dt>
            <dd>{TIENDA.direccion}</dd>
          </div>
          <div>
            <dt className="text-ui-fg-muted">Fecha</dt>
            <dd>{hoy}</dd>
          </div>
        </dl>

        <FormularioReclamo />
      </div>
    </div>
  )
}
