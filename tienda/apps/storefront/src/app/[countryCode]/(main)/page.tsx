import { Metadata } from "next"

import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import Beneficios from "@modules/home/components/beneficios"
import Categorias from "@modules/home/components/categorias"
import ComoComprar from "@modules/home/components/como-comprar"
import Hero from "@modules/home/components/hero"
import Productos from "@modules/home/components/productos"

export const metadata: Metadata = {
  title: { absolute: "Tienda Andina — Ropa cómoda para el día a día" },
  description:
    "Ropa cómoda para el día a día. Envíos a todo el Perú con precios en soles e IGV incluido.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const [categorias, { response }] = await Promise.all([
    listCategories().catch(() => []),
    listProducts({
      regionId: region.id,
      queryParams: {
        limit: 12,
        fields: "*variants.calculated_price,*categories",
      },
    }),
  ])

  const principales = categorias.filter((c) => !c.parent_category)

  return (
    <>
      <Hero productos={response.products} />
      <Categorias categorias={principales} productos={response.products} />
      <Productos productos={response.products} region={region} />
      <ComoComprar />
      <Beneficios />
    </>
  )
}
