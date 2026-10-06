import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Cada categoría lleva el color de un tinte natural andino.
const TINTES = [
  { fondo: "bg-cochinilla-claro", texto: "text-cochinilla-oscuro", borde: "hover:ring-cochinilla" },
  { fondo: "bg-qolle-claro", texto: "text-[#7a4f00]", borde: "hover:ring-qolle" },
  { fondo: "bg-chillca-claro", texto: "text-chillca", borde: "hover:ring-chillca" },
  { fondo: "bg-anil-claro", texto: "text-anil", borde: "hover:ring-anil" },
]

export default function Categorias({
  categorias,
  productos,
}: {
  categorias: HttpTypes.StoreProductCategory[]
  productos: HttpTypes.StoreProduct[]
}) {
  if (!categorias.length) {
    return null
  }

  return (
    <section id="categorias" className="content-container scroll-mt-28 py-16 small:py-24">
      <div className="mb-10 flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-anil small:text-4xl">Compra por categoría</h2>
        <p className="text-ui-fg-subtle">Encuentra rápido lo que buscas.</p>
      </div>
      <ul className="grid grid-cols-2 gap-4 small:grid-cols-4 small:gap-6">
        {categorias.map((c, i) => {
          const tinte = TINTES[i % TINTES.length]
          const deEsta = productos.filter((p) =>
            p.categories?.some((pc) => pc.id === c.id)
          )
          const foto = deEsta.find((p) => p.thumbnail)?.thumbnail
          return (
            <li key={c.id}>
              <LocalizedClientLink
                href={`/categories/${c.handle}`}
                className={`group flex h-full flex-col overflow-hidden rounded-3xl ring-2 ring-transparent ${tinte.fondo} ${tinte.borde}`}
              >
                <div className="relative aspect-square">
                  {foto && (
                    <Image
                      src={foto}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  )}
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 px-5 pb-5 pt-3">
                  <h3 className={`text-xl font-bold small:text-2xl ${tinte.texto}`}>{c.name}</h3>
                  <span className="text-sm text-ui-fg-subtle">
                    {deEsta.length} {deEsta.length === 1 ? "modelo" : "modelos"}
                  </span>
                </div>
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
