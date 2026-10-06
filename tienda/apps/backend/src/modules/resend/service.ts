import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils"
import type { Logger, ProviderSendNotificationDTO, ProviderSendNotificationResultsDTO } from "@medusajs/framework/types"

type Opciones = {
  apiKey: string
  /** Remitente. Sin dominio verificado en Resend solo funciona "onboarding@resend.dev". */
  from: string
}

/** Envía correos con la API de Resend (https://resend.com/docs/api-reference/emails/send-email). */
class ResendNotificationService extends AbstractNotificationProviderService {
  static identifier = "resend"

  protected logger_: Logger
  protected options_: Opciones

  static validateOptions(options: Record<string, unknown>) {
    if (!options.apiKey) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Falta RESEND_API_KEY")
    if (!options.from) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Falta EMAIL_FROM")
  }

  constructor({ logger }: { logger: Logger }, options: Opciones) {
    super()
    this.logger_ = logger
    this.options_ = options
  }

  async send(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
    const { to, content, from } = notification
    if (!content?.subject || !content.html) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `El correo "${notification.template}" no tiene asunto o HTML`)
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.options_.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: from ?? this.options_.from,
        to: [to],
        subject: content.subject,
        html: content.html,
        text: content.text,
      }),
    })
    const datos = (await res.json().catch(() => ({}))) as { id?: string; message?: string }
    if (!res.ok) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Resend rechazó el correo: ${datos.message ?? res.status}`)
    }
    this.logger_.info(`Correo "${notification.template}" enviado a ${to} (Resend ${datos.id})`)
    return { id: datos.id }
  }
}

export default ResendNotificationService
