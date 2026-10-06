import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  // Resumen de opciones ("3 colores y 4 tallas") para saber qué hay sin abrir el producto.
  const resumen = (product.options ?? [])
    .map((o) => {
      const n = o.values?.length ?? 0
      const nombre = o.title.toLowerCase()
      if (!n) return null
      if (nombre === "color") return `${n} ${n === 1 ? "color" : "colores"}`
      if (nombre === "talla" || nombre === "size") return `${n} ${n === 1 ? "talla" : "tallas"}`
      return null
    })
    .filter(Boolean)
    .join(" y ")

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block">
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="mt-4 flex flex-col gap-1">
          <h3
            className="font-titulos text-lg font-bold leading-tight text-anil group-hover:text-cochinilla"
            data-testid="product-title"
          >
            {product.title}
          </h3>
          {resumen && <p className="text-sm text-ui-fg-muted">{resumen}</p>}
          <div className="flex items-center gap-x-2 font-semibold">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
