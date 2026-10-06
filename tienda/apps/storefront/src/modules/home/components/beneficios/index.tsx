import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Icono = ({ d }: { d: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
)

const BENEFICIOS = [
  {
    titulo: "Envíos a todo el Perú",
    texto: "Estándar S/ 15 (3 a 5 días). Express en Lima S/ 25 (24 horas).",
    icono:
      "M3 7h11v9H3zM14 10h4l3 3v3h-7M7.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
    color: "text-cochinilla",
  },
  {
    titulo: "Precio final, sin sorpresas",
    texto: "Todos los precios están en soles y ya incluyen el IGV del 18 %.",
    icono: "M4 4h16v16H4zM8 9h8M8 13h8M8 17h5",
    color: "text-chillca",
  },
  {
    titulo: "Pago protegido",
    texto: "Pagas en Mercado Pago. Tu pedido se confirma solo cuando el pago está aprobado.",
    icono: "M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6zM9 12l2 2 4-4",
    color: "text-anil",
  },
]

export default function Beneficios() {
  return (
    <section className="bg-anil-claro">
      <div className="content-container grid gap-10 py-14 small:grid-cols-[1fr_1fr_1fr_1.15fr] small:gap-8">
        {BENEFICIOS.map((b) => (
          <div key={b.titulo} className="flex flex-col gap-3">
            <span className={b.color}>
              <Icono d={b.icono} />
            </span>
            <h3 className="text-lg font-bold text-anil">{b.titulo}</h3>
            <p className="text-sm leading-relaxed text-ui-fg-subtle">{b.texto}</p>
          </div>
        ))}
        <div className="flex flex-col gap-3 rounded-3xl bg-anil p-6 text-white">
          <h3 className="text-lg font-bold">¿Algo salió mal con tu pedido?</h3>
          <p className="text-sm leading-relaxed text-white/80">
            Registra tu reclamo o queja en el Libro de Reclamaciones virtual. Te
            respondemos por correo en un máximo de 15 días hábiles.
          </p>
          <LocalizedClientLink
            href="/libro-de-reclamaciones"
            className="mt-auto self-start rounded-lg bg-qolle px-4 py-2.5 text-sm font-bold text-anil-oscuro hover:bg-white"
          >
            Abrir el Libro de Reclamaciones
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}
