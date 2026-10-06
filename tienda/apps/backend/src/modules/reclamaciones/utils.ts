/** Número visible de la hoja: 2026-000001. */
export const codigoReclamo = (correlativo: number, fecha: Date | string) =>
  `${new Date(fecha).getFullYear()}-${String(correlativo).padStart(6, "0")}`

/** Plazo legal de respuesta: 15 días hábiles (Ley 31435, que modifica el art. 24 del Código). */
export const DIAS_HABILES_RESPUESTA = 15

/** Suma días hábiles (lunes a viernes; no descuenta feriados). */
export function sumarDiasHabiles(desde: Date | string, dias: number) {
  const fecha = new Date(desde)
  let restantes = dias
  while (restantes > 0) {
    fecha.setDate(fecha.getDate() + 1)
    const dia = fecha.getDay()
    if (dia !== 0 && dia !== 6) restantes--
  }
  return fecha
}
