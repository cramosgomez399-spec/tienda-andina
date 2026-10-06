import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { RECLAMACIONES_MODULE } from "../../../modules/reclamaciones"
import ReclamacionesService from "../../../modules/reclamaciones/service"
import { codigoReclamo, DIAS_HABILES_RESPUESTA, sumarDiasHabiles } from "../../../modules/reclamaciones/utils"
import type { CrearReclamo } from "../../reclamaciones-validadores"

/** POST /store/reclamaciones — registra una hoja del Libro de Reclamaciones virtual. */
export async function POST(req: MedusaRequest<CrearReclamo>, res: MedusaResponse) {
  const { acepta: _acepta, ...datos } = req.validatedBody
  const reclamaciones: ReclamacionesService = req.scope.resolve(RECLAMACIONES_MODULE)

  const reclamo = await reclamaciones.crearReclamos({
    ...datos,
    telefono: datos.telefono || null,
    apoderado: datos.es_menor ? datos.apoderado : null,
    numero_pedido: datos.numero_pedido || null,
    monto: datos.monto ?? null,
  })

  await req.scope.resolve(Modules.EVENT_BUS).emit({ name: "reclamo.creado", data: { id: reclamo.id } })

  res.status(201).json({
    codigo: codigoReclamo(reclamo.correlativo, reclamo.created_at),
    fecha: reclamo.created_at,
    plazo_respuesta: sumarDiasHabiles(reclamo.created_at, DIAS_HABILES_RESPUESTA),
    email: reclamo.email,
  })
}
