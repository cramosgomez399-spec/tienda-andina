import { MedusaService } from "@medusajs/framework/utils"
import Reclamo from "./models/reclamo"

/**
 * Los tipos de Medusa pluralizan el modelo como "Reclamoes", pero en ejecución los métodos se llaman
 * "...Reclamos". Estos alias usan el nombre real y conservan la firma tipada.
 */
class ReclamacionesService extends MedusaService({ Reclamo }) {
  crearReclamos: ReclamacionesService["createReclamoes"] = ((...args: unknown[]) =>
    (this as any).createReclamos(...args)) as any

  listarYContarReclamos: ReclamacionesService["listAndCountReclamoes"] = ((...args: unknown[]) =>
    (this as any).listAndCountReclamos(...args)) as any

  actualizarReclamos: ReclamacionesService["updateReclamoes"] = ((...args: unknown[]) =>
    (this as any).updateReclamos(...args)) as any
}

export default ReclamacionesService
