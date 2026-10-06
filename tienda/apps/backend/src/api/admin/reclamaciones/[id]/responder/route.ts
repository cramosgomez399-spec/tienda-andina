import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { RECLAMACIONES_MODULE } from "../../../../../modules/reclamaciones"
import ReclamacionesService from "../../../../../modules/reclamaciones/service"

/** POST /admin/reclamaciones/:id/responder — registra la respuesta y la envía al consumidor. */
export async function POST(req: MedusaRequest<{ respuesta: string }>, res: MedusaResponse) {
  const reclamaciones: ReclamacionesService = req.scope.resolve(RECLAMACIONES_MODULE)
  const actual = await reclamaciones.retrieveReclamo(req.params.id)
  if (actual.estado === "respondido") {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Esta hoja ya fue respondida")
  }

  const reclamo = await reclamaciones.actualizarReclamos({
    id: actual.id,
    estado: "respondido",
    respuesta: req.validatedBody.respuesta,
    respondido_en: new Date(),
  })

  await req.scope.resolve(Modules.EVENT_BUS).emit({ name: "reclamo.respondido", data: { id: reclamo.id } })
  res.json({ reclamo })
}
