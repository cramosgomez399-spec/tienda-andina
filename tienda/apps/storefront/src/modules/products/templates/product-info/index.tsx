import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const categoria = product.categories?.[0]

  return (
    <div id="product-info" className="flex flex-col gap-y-4">
      <nav aria-label="Ruta" className="text-sm text-ui-fg-muted">
        <LocalizedClientLink href="/store" className="hover:text-cochinilla">
          Tienda
        </LocalizedClientLink>
        {categoria && (
          <>
            <span className="mx-2" aria-hidden="true">/</span>
            <LocalizedClientLink
              href={`/categories/${categoria.handle}`}
              className="hover:text-cochinilla"
            >
              {categoria.name}
            </LocalizedClientLink>
          </>
        )}
      </nav>
      <h1
        className="text-4xl font-extrabold leading-[1.05] text-anil small:text-5xl"
        data-testid="product-title"
      >
        {product.title}
      </h1>
      <p
        className="max-w-prose text-lg leading-relaxed text-ui-fg-subtle whitespace-pre-line"
        data-testid="product-description"
      >
        {product.description}
      </p>
    </div>
  )
}

export default ProductInfo
