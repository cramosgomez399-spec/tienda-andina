import { getBaseURL } from "@lib/util/env"
import { Metadata, Viewport } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: { default: "Tienda Andina", template: "%s | Tienda Andina" },
  description: "Ropa cómoda para el día a día. Envíos a todo el Perú con precios en soles e IGV incluido.",
}

// El diseño es solo claro: "only light" evita que el modo oscuro forzado de algunos
// navegadores móviles (Samsung Internet, Chrome Android) oscurezca el fondo y deje el texto ilegible.
export const viewport: Viewport = {
  colorScheme: "only light",
  themeColor: "#ffffff",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="es" data-mode="light">
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
