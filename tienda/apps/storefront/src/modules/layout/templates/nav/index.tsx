import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/common/components/logo"
import CartButton from "@modules/layout/components/cart-button"
import Search from "@modules/layout/components/search"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale, categorias] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    listCategories().catch(() => []),
  ])

  const principales = categorias.filter((c) => !c.parent_category).slice(0, 5)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <div className="bg-anil text-white">
        <ul className="content-container flex h-9 items-center justify-center gap-x-8 text-xs font-medium small:justify-between">
          <li className="whitespace-nowrap">Envíos a todo el Perú desde S/ 15</li>
          <li className="hidden small:block">Express en Lima: llega en 24 horas</li>
          <li className="hidden small:block">Paga seguro con Mercado Pago</li>
        </ul>
      </div>
      <header className="relative h-16 mx-auto border-b bg-white/95 backdrop-blur border-ui-border-base">
        <nav className="content-container text-ui-fg-subtle flex items-center justify-between gap-x-3 w-full h-full text-sm small:gap-x-6">
          <div className="flex items-center gap-x-3 h-full min-w-0">
            <div className="h-full small:hidden">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>
            <LocalizedClientLink href="/" aria-label="Tienda Andina, inicio" data-testid="nav-store-link">
              <Logo />
            </LocalizedClientLink>
          </div>

          <ul className="hidden small:flex items-center gap-x-1 h-full font-medium">
            <li>
              <LocalizedClientLink
                href="/store"
                className="rounded-full px-3 py-2 hover:bg-lana hover:text-anil"
              >
                Todo
              </LocalizedClientLink>
            </li>
            {principales.map((c) => (
              <li key={c.id}>
                <LocalizedClientLink
                  href={`/categories/${c.handle}`}
                  className="rounded-full px-3 py-2 hover:bg-lana hover:text-anil"
                >
                  {c.name}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-x-3 h-full justify-end small:gap-x-5">
            <Search />
            <LocalizedClientLink
              className="hidden small:block font-medium hover:text-anil"
              href="/account"
              data-testid="nav-account-link"
            >
              Mi cuenta
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="inline-flex items-center gap-2 rounded-full bg-anil px-4 py-2 font-semibold text-white"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Carrito
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
