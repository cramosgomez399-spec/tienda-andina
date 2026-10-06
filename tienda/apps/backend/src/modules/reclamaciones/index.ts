import { Module } from "@medusajs/framework/utils"
import ReclamacionesService from "./service"

export const RECLAMACIONES_MODULE = "reclamaciones"

export default Module(RECLAMACIONES_MODULE, {
  service: ReclamacionesService,
})
