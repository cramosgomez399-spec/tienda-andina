import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Fondo de cada tarjeta del collage: un tinte distinto para cada prenda.
const FONDOS = ["bg-qolle", "bg-cochinilla", "bg-chillca"]

const Hero = ({ productos }: { productos: HttpTypes.StoreProduct[] }) => {
  const collage = productos.filter((p) => p.thumbnail).slice(0, 3)

  return (
    <section className="relative overflow-hidden bg-anil text-white">
      <div className="content-container grid items-center gap-12 py-14 small:grid-cols-[1.1fr_1fr] small:py-20">
        <div className="flex max-w-xl flex-col gap-6">
          <h1 className="text-[2.6rem] font-extrabold leading-[1.02] small:text-[4.25rem]">
            Ropa cómoda para todos los días
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-white/80">
            Polos, polerones, joggers y shorts de algodón. Precios en soles con
            IGV incluido y envíos a todo el Perú.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <LocalizedClientLink
              href="/store"
              className="rounded-lg bg-cochinilla px-6 py-3.5 font-semibold text-white hover:bg-cochinilla-oscuro"
            >
              Ver toda la tienda
            </LocalizedClientLink>
            <a
              href="#categorias"
              className="rounded-lg border border-white/30 px-6 py-3.5 font-semibold text-white hover:border-white hover:bg-white/10"
            >
              Elegir por categoría
            </a>
          </div>
          <dl className="mt-4 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6 text-sm">
            <div>
              <dt className="text-white/60">Envío</dt>
              <dd className="font-titulos text-base font-bold text-qolle small:text-xl">desde S/ 15</dd>
            </div>
            <div>
              <dt className="text-white/60">Express Lima</dt>
              <dd className="font-titulos text-base font-bold text-qolle small:text-xl">24 horas</dd>
            </div>
            <div>
              <dt className="text-white/60">IGV</dt>
              <dd className="font-titulos text-base font-bold text-qolle small:text-xl">Incluido</dd>
            </div>
          </dl>
        </div>

        {collage.length > 0 && (
          <div className="relative grid h-[420px] grid-cols-2 grid-rows-2 gap-4 small:h-[520px]">
            {collage.map((p, i) => {
              const { cheapestPrice } = getProductPrice({ product: p })
              return (
                <LocalizedClientLink
                  key={p.id}
                  href={`/products/${p.handle}`}
                  className={`group relative overflow-hidden rounded-3xl ${FONDOS[i]} ${
                    i === 0 ? "row-span-2" : ""
                  }`}
                >
                  <Image
                    src={p.thumbnail!}
                    alt={p.title}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute bottom-3 left-3 right-3 flex flex-wrap items-baseline gap-x-2 rounded-2xl bg-white px-3 py-1.5 text-sm font-semibold text-anil shadow">
                    {p.title}
                    {cheapestPrice && (
                      <span className="text-cochinilla">{cheapestPrice.calculated_price}</span>
                    )}
                  </span>
                </LocalizedClientLink>
              )
            })}
          </div>
        )}
      </div>
      <div className="franja-tejida" aria-hidden="true" />
    </section>
  )
}

export default Hero
