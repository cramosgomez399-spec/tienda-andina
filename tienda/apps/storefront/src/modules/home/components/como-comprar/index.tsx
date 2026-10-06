// Los pasos son una secuencia real de compra, por eso van numerados.
const PASOS = [
  {
    titulo: "Elige tu prenda",
    texto: "Escoge talla y color. Verás el precio final con IGV antes de agregarla al carrito.",
  },
  {
    titulo: "Paga con Mercado Pago",
    texto: "Con tarjeta de crédito o débito, en la página segura de Mercado Pago. Nosotros no vemos ni guardamos los datos de tu tarjeta.",
  },
  {
    titulo: "Recíbela en casa",
    texto: "Envío estándar a todo el Perú en 3 a 5 días, o express en Lima en 24 horas. Te avisamos por correo.",
  },
]

export default function ComoComprar() {
  return (
    <section className="content-container py-16 small:py-24">
      <h2 className="mb-10 text-3xl font-bold text-anil small:text-4xl">Así de fácil es comprar</h2>
      <ol className="grid gap-8 small:grid-cols-3 small:gap-10">
        {PASOS.map((paso, i) => (
          <li key={paso.titulo} className="flex gap-5">
            <span
              className="font-titulos grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cochinilla text-2xl font-extrabold text-white"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-xl font-bold text-anil">{paso.titulo}</h3>
              <p className="leading-relaxed text-ui-fg-subtle">{paso.texto}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
