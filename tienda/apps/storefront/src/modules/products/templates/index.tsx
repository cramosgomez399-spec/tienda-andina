import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="content-container grid gap-10 py-8 small:grid-cols-[1.25fr_1fr] small:items-start small:gap-14 small:py-12"
        data-testid="product-container"
      >
        <ImageGallery images={images} />
        <div className="flex flex-col gap-y-8 small:sticky small:top-32">
          <ProductInfo product={product} />
          <div className="rounded-3xl border border-ui-border-base bg-white p-6">
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>
          <ul className="grid grid-cols-2 gap-3 text-sm">
            <li className="rounded-2xl bg-chillca-claro p-4">
              <span className="block font-bold text-chillca">Envío a todo el Perú</span>
              <span className="text-ui-fg-subtle">S/ 15, de 3 a 5 días</span>
            </li>
            <li className="rounded-2xl bg-qolle-claro p-4">
              <span className="block font-bold text-[#7a4f00]">Express Lima</span>
              <span className="text-ui-fg-subtle">S/ 25, en 24 horas</span>
            </li>
          </ul>
          <ProductTabs product={product} />
        </div>
      </div>
      <div
        className="bg-lana py-16 small:py-24"
        data-testid="related-products-container"
      >
        <div className="content-container">
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts product={product} countryCode={countryCode} />
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default ProductTemplate
