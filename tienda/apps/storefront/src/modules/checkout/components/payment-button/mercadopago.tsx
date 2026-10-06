"use client"

import { isMercadoPago } from "@lib/constants"
import { sdk } from "@lib/config"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button, Text } from "@modules/common/components/ui"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import ErrorMessage from "../error-message"

type EstadoPago = { aprobado: boolean; ultimo_estado: string | null }

const INTERVALO_MS = 4000
const SIN_PAGO_APROBADO =
  "Todavía no vemos un pago aprobado en Mercado Pago. Si ya pagaste, espera unos segundos: esta página se actualiza sola."

/**
 * Checkout Pro: abre el pago de Mercado Pago en otra pestaña y consulta al backend hasta que el
 * pago esté aprobado; entonces completa el carrito. El backend vuelve a verificar el pago con la API
 * de Mercado Pago al completar, así que este componente nunca decide por sí solo que algo se pagó.
 */
const MercadoPagoPaymentButton = ({
  cart,
  notReady,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
}) => {
  const sesion = cart.payment_collection?.payment_sessions?.find((s) =>
    isMercadoPago(s.provider_id)
  )
  const initPoint = sesion?.data?.init_point as string | undefined
  const searchParams = useSearchParams()

  // Si Mercado Pago nos devolvió aquí (producción con HTTPS), se empieza esperando la confirmación.
  const volvioDeMercadoPago = searchParams.has("payment_id") || searchParams.has("collection_status")
  const [esperando, setEsperando] = useState(volvioDeMercadoPago)
  const [confirmando, setConfirmando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const enCurso = useRef(false)

  const confirmarPedido = useCallback(async () => {
    if (enCurso.current) return
    enCurso.current = true
    setConfirmando(true)
    setError(null)
    try {
      // Si el pago está aprobado, placeOrder redirige a la página de confirmación. Si no, el backend
      // rechaza completar el carrito (no hay pago verificado) y se informa sin tratarlo como fallo.
      await placeOrder()
      setAviso(SIN_PAGO_APROBADO)
    } catch {
      setAviso(SIN_PAGO_APROBADO)
    } finally {
      enCurso.current = false
      setConfirmando(false)
    }
  }, [])

  useEffect(() => {
    if (!esperando || !sesion?.id) return
    let activo = true

    const revisar = async () => {
      try {
        const estado = await sdk.client.fetch<EstadoPago>("/store/mercadopago/estado", {
          query: { session_id: sesion.id },
        })
        if (!activo) return
        if (estado.aprobado) {
          setAviso("¡Pago aprobado! Estamos registrando tu pedido…")
          confirmarPedido()
        } else if (estado.ultimo_estado === "rejected") {
          setAviso("Mercado Pago rechazó el último intento. Puedes intentarlo otra vez con otro medio de pago.")
        } else if (estado.ultimo_estado === "pending" || estado.ultimo_estado === "in_process") {
          setAviso("Tu pago está en revisión en Mercado Pago. Esta página se actualizará sola.")
        }
      } catch {
        // Un fallo de red puntual no detiene la espera; se reintenta en el siguiente ciclo.
      }
    }

    revisar()
    const timer = setInterval(revisar, INTERVALO_MS)
    return () => {
      activo = false
      clearInterval(timer)
    }
  }, [esperando, sesion?.id, confirmarPedido])

  const abrirMercadoPago = () => {
    if (!initPoint) {
      setError("No se pudo preparar el pago. Vuelve al paso de pago y elige Mercado Pago otra vez.")
      return
    }
    window.open(initPoint, "_blank", "noopener")
    setAviso("Completa el pago en la pestaña de Mercado Pago. Cuando se apruebe, tu pedido se confirmará aquí automáticamente.")
    setEsperando(true)
  }

  return (
    <div className="flex flex-col gap-y-3">
      {!esperando ? (
        <Button
          disabled={notReady || !initPoint}
          onClick={abrirMercadoPago}
          size="large"
          data-testid="submit-order-button"
        >
          Pagar con Mercado Pago
        </Button>
      ) : (
        <div className="flex flex-col small:flex-row gap-3">
          <Button
            onClick={confirmarPedido}
            isLoading={confirmando}
            size="large"
            data-testid="mercadopago-confirm-button"
          >
            Ya pagué, confirmar pedido
          </Button>
          <Button variant="secondary" size="large" onClick={abrirMercadoPago}>
            Abrir Mercado Pago otra vez
          </Button>
        </div>
      )}
      {aviso && (
        <Text className="txt-medium text-ui-fg-subtle" role="status" aria-live="polite">
          {aviso}
        </Text>
      )}
      <ErrorMessage error={error} data-testid="mercadopago-payment-error-message" />
    </div>
  )
}

export default MercadoPagoPaymentButton
