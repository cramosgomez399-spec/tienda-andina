import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Rombo } from "@modules/common/components/logo"

const EmptyCartMessage = () => {
  return (
    <div
      className="mx-auto flex max-w-md flex-col items-center gap-5 py-24 text-center small:py-32"
      data-testid="empty-cart-message"
    >
      <Rombo className="h-16 w-16" />
      <h1 className="text-4xl font-extrabold text-anil">Tu carrito está vacío</h1>
      <p className="text-lg text-ui-fg-subtle">
        Elige una prenda, escoge tu talla y aparecerá aquí lista para pagar.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <LocalizedClientLink
          href="/store"
          className="rounded-lg bg-cochinilla px-6 py-3.5 font-semibold text-white hover:bg-cochinilla-oscuro"
        >
          Ver productos
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/"
          className="rounded-lg border border-anil/25 px-6 py-3.5 font-semibold text-anil hover:border-anil"
        >
          Volver al inicio
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
