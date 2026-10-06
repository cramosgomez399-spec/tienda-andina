import { HttpTypes } from "@medusajs/types"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

export default function Productos({
  productos,
  region,
}: {
  productos: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}) {
  if (!productos.length) {
    return null
  }

  return (
    <section className="bg-lana">
      <div className="content-container py-16 small:py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-anil small:text-4xl">Nuestros productos</h2>
            <p className="text-ui-fg-subtle">Elige talla y color dentro de cada producto.</p>
          </div>
          <LocalizedClientLink
            href="/store"
            className="rounded-lg border border-anil/25 bg-white px-5 py-3 font-semibold text-anil hover:border-anil"
          >
            Ver la tienda completa
          </LocalizedClientLink>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 small:grid-cols-4 small:gap-x-6">
          {productos.slice(0, 8).map((p) => (
            <li key={p.id}>
              <ProductPreview product={p} region={region} isFeatured />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
