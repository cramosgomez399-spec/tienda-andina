import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { RECLAMACIONES_MODULE } from "../../../modules/reclamaciones"
import ReclamacionesService from "../../../modules/reclamaciones/service"
import { codigoReclamo, DIAS_HABILES_RESPUESTA, sumarDiasHabiles } from "../../../modules/reclamaciones/utils"

/** GET /admin/reclamaciones — hojas del libro, las más recientes primero. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const reclamaciones: ReclamacionesService = req.scope.resolve(RECLAMACIONES_MODULE)
  const [reclamos, count] = await reclamaciones.listarYContarReclamos({}, { order: { correlativo: "DESC" }, take: 200 })

  res.json({
    count,
    reclamaciones: reclamos.map((r) => ({
      ...r,
      codigo: codigoReclamo(r.correlativo, r.created_at),
      plazo_respuesta: sumarDiasHabiles(r.created_at, DIAS_HABILES_RESPUESTA),
    })),
  })
}
