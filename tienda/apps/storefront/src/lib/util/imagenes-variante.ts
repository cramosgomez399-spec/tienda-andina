import { HttpTypes } from "@medusajs/types"

// Fotos del producto para la variante elegida (por ejemplo, solo las del polo negro).
// Si la variante no tiene fotos propias, se muestran todas las del producto.
export function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string | null
) {
  if (!selectedVariantId || !product.variants) {
    return product.images ?? []
  }

  const variant = product.variants.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images ?? []
  }

  const imageIdsMap = new Map(variant.images.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? []
}
