// Datos de la empresa que aparecen en correos y en el Libro de Reclamaciones.
// Tienda Andina es una tienda ficticia de portafolio: estos datos son de demostración.
export const TIENDA = {
  nombre: "Tienda Andina",
  razonSocial: "Tienda Andina S.A.C. (empresa ficticia de demostración)",
  ruc: "20000000001 (ficticio)",
  direccion: "Lima, Perú (dirección de demostración)",
  emailAtencion: process.env.EMAIL_ATENCION ?? "atencion@tienda-andina.test",
  urlTienda: process.env.STOREFRONT_URL ?? "http://localhost:8000",
}
