import { clx } from "@modules/common/components/ui"

// Rombo escalonado de la marca, tomado de los motivos de los tejidos andinos.
export const Rombo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" className={clx("shrink-0", className)}>
    <path d="M16 1 31 16 16 31 1 16z" fill="#b8174e" />
    <path d="M16 7 25 16 16 25 7 16z" fill="#f4b23a" />
    <path d="M16 12 20 16 16 20 12 16z" fill="#22306b" />
  </svg>
)

const Logo = ({ claro = false }: { claro?: boolean }) => (
  <span className="inline-flex items-center gap-2">
    <Rombo className="h-7 w-7" />
    <span
      className={clx(
        "font-titulos whitespace-nowrap text-lg font-bold leading-none small:text-xl",
        claro ? "text-white" : "text-anil"
      )}
    >
      Tienda Andina
    </span>
  </span>
)

export default Logo
