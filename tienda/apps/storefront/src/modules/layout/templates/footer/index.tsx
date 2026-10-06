import { listCategories } from "@lib/data/categories"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/common/components/logo"

const enlace = "text-white/75 hover:text-qolle"

export default async function Footer() {
  const categorias = await listCategories().catch(() => [])
  const principales = categorias.filter((c) => !c.parent_category).slice(0, 6)

  return (
    <footer className="w-full bg-anil text-white">
      <div className="franja-tejida" aria-hidden="true" />
      <div className="content-container grid gap-12 py-16 small:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex max-w-xs flex-col gap-4">
          <LocalizedClientLink href="/" aria-label="Tienda Andina, inicio">
            <Logo claro />
          </LocalizedClientLink>
          <p className="text-sm leading-relaxed text-white/70">
            Ropa cómoda de algodón con envíos a todo el Perú. Precios en soles con IGV incluido.
          </p>
        </div>

        {principales.length > 0 && (
          <nav aria-label="Categorías" className="flex flex-col gap-3 text-sm">
            <h2 className="font-titulos text-base font-bold text-qolle">Categorías</h2>
            <ul className="flex flex-col gap-2" data-testid="footer-categories">
              {principales.map((c) => (
                <li key={c.id}>
                  <LocalizedClientLink className={enlace} href={`/categories/${c.handle}`} data-testid="category-link">
                    {c.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <nav aria-label="Tu compra" className="flex flex-col gap-3 text-sm">
          <h2 className="font-titulos text-base font-bold text-qolle">Tu compra</h2>
          <ul className="flex flex-col gap-2">
            <li>
              <LocalizedClientLink className={enlace} href="/store">Todos los productos</LocalizedClientLink>
            </li>
            <li>
              <LocalizedClientLink className={enlace} href="/cart">Carrito</LocalizedClientLink>
            </li>
            <li>
              <LocalizedClientLink className={enlace} href="/account">Mi cuenta y mis pedidos</LocalizedClientLink>
            </li>
          </ul>
        </nav>

        <nav aria-label="Ayuda" className="flex flex-col gap-3 text-sm">
          <h2 className="font-titulos text-base font-bold text-qolle">Ayuda</h2>
          <ul className="flex flex-col gap-2">
            <li>
              <LocalizedClientLink
                className={enlace}
                href="/libro-de-reclamaciones"
                data-testid="libro-reclamaciones-link"
              >
                Libro de Reclamaciones
              </LocalizedClientLink>
            </li>
            <li className="text-white/75">Envío estándar: S/ 15, de 3 a 5 días</li>
            <li className="text-white/75">Express Lima: S/ 25, en 24 horas</li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="content-container flex flex-col gap-2 py-6 text-xs text-white/55 small:flex-row small:justify-between">
          <p>© {new Date().getFullYear()} Tienda Andina. Todos los derechos reservados.</p>
          <p>Tienda de demostración: los pagos se hacen en modo de prueba.</p>
        </div>
      </div>
    </footer>
  )
}
