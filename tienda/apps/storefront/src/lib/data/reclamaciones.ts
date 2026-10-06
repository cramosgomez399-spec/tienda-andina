"use server"

import { sdk } from "@lib/config"

export type HojaRegistrada = {
  codigo: string
  fecha: string
  plazo_respuesta: string
  email: string
}

export type ResultadoReclamo = { ok: true; hoja: HojaRegistrada } | { ok: false; error: string }

/** Registra la hoja en el backend. Los errores se devuelven como texto para mostrarlos en el formulario. */
export async function registrarReclamo(datos: Record<string, unknown>): Promise<ResultadoReclamo> {
  try {
    const hoja = await sdk.client.fetch<HojaRegistrada>("/store/reclamaciones", {
      method: "POST",
      body: datos,
    })
    return { ok: true, hoja }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message.replace(/^Invalid request:\s*/, "") : ""
    return { ok: false, error: mensaje || "No pudimos registrar tu hoja. Inténtalo de nuevo en unos minutos." }
  }
}
