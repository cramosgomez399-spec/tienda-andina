import { getBaseURL } from "@lib/util/env"
import { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Figtree } from "next/font/google"
import "styles/globals.css"

// Bricolage para títulos (con carácter) y Figtree para el texto (muy legible en pantallas pequeñas).
const titulos = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-titulos",
  display: "swap",
})
const texto = Figtree({
  subsets: ["latin"],
  variable: "--font-texto",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: { default: "Tienda Andina", template: "%s | Tienda Andina" },
  description: "Ropa cómoda para el día a día. Envíos a todo el Perú con precios en soles e IGV incluido.",
}

// El diseño es solo claro: "only light" evita que el modo oscuro forzado de algunos
// navegadores móviles (Samsung Internet, Chrome Android) oscurezca el fondo y deje el texto ilegible.
export const viewport: Viewport = {
  colorScheme: "only light",
  themeColor: "#22306b",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="es" data-mode="light" className={`${titulos.variable} ${texto.variable}`}>
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
