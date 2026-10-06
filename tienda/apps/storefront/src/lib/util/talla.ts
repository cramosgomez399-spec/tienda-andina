const TALLAS = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]

/** Posición de una talla de ropa (S < M < L…); cualquier otro valor va al final. */
export const ordenTalla = (valor: string) => {
  const i = TALLAS.indexOf(valor.trim().toUpperCase())
  return i === -1 ? TALLAS.length : i
}

/** Ordena tallas de menor a mayor; el sort es estable, así que el resto de valores mantiene su orden. */
export const compararTallas = (a: string, b: string) => ordenTalla(a) - ordenTalla(b)
