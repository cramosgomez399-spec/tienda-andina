# Tienda Andina — tienda online con Medusa.js

Demo de portafolio: tienda de ropa ficticia en soles (PEN) con IGV incluido, construida sobre
[Medusa 2](https://medusajs.com) (motor de e-commerce en Node) y su tienda en Next.js.

**En línea:**
- Tienda: https://tienda-andina.vercel.app
- API y panel de administración: https://tienda-andina-api.onrender.com/app
- Libro de Reclamaciones: https://tienda-andina.vercel.app/pe/libro-de-reclamaciones

Funciones: catálogo con tallas y colores, carrito, checkout con IGV, pagos con **Mercado Pago**
(modo prueba), correos de confirmación, **Libro de Reclamaciones** virtual (Ley 29571) con su sección en el panel.

## Producción (todo en planes gratuitos)

| Pieza | Servicio | Notas |
|---|---|---|
| Base de datos | Supabase `tienda-andina` (São Paulo) | Usuario propio `medusa`; las tablas no se exponen en la API pública de Supabase. Se pausa tras 7 días sin uso: reactivar desde el panel de Supabase |
| Backend + panel | Render `tienda-andina-api` (Virginia) | Se despliega solo con cada `git push` a `master`. Se duerme tras 15 min sin visitas (~1 min en despertar) |
| Tienda | Vercel `tienda-andina` | `cd tienda/apps/storefront && npx vercel deploy --prod` |

Secretos de producción: `produccion.local.env` (no se sube a git). Variables del backend en Render y de la tienda en Vercel.
Las migraciones nuevas se aplican desde la laptop apuntando `DATABASE_URL` a Supabase (`DATABASE_SSL=true npx medusa db:migrate`).
Si cambia el índice de búsqueda (`src/search/`), además: `DATABASE_SSL=true npx medusa db:migrate:search --execute-all-search` y reiniciar el backend (el índice se llena al arrancar). El índice guarda precios en PEN.

Diseño: paleta de tintes andinos (añil `#22306b`, cochinilla `#b8174e`, q'olle `#f4b23a`, chillca `#2e7d5b`) en `tailwind.config.js` y variables de Medusa en `globals.css`; títulos Bricolage Grotesque, texto Figtree. El panel abre en español por defecto (`src/admin/i18n/index.ts`).
Para correos reales: crear una clave en [Resend](https://resend.com) y agregar `RESEND_API_KEY` (y `EMAIL_FROM` con un dominio verificado) en Render.

## Estructura

```
tienda-online/
├── db/                         PostgreSQL 18 local (embedded-postgres, sin instalar nada en Windows)
│   ├── start.js                arranca la BD en el puerto 5433, codificación UTF-8
│   └── data/                   datos (ignorado en git)
└── tienda/
    ├── apps/backend/           API + panel de administración (Medusa)
    │   ├── medusa-config.ts    configuración
    │   └── src/
    │       ├── migration-scripts/initial-data-seed.ts   tienda, región Perú, IGV, envíos, catálogo, stock
    │       ├── api/            rutas propias de la API
    │       ├── modules/        módulos propios (lógica de negocio nueva)
    │       ├── workflows/      procesos de varios pasos con reversión automática
    │       ├── subscribers/    reacciones a eventos (p. ej. "pedido creado" → enviar correo)
    │       ├── jobs/           tareas programadas
    │       └── admin/          personalizaciones del panel
    └── apps/storefront/        tienda Next.js 15 (React 19), con dependencias propias
```

## Arrancar (tres terminales)

```bash
# 1. Base de datos
cd db && npm start

# 2. Backend + panel  → http://localhost:9000/app
cd tienda/apps/backend && npm run dev

# 3. Tienda           → http://localhost:8000/pe
cd tienda/apps/storefront && npm run dev
```

Las credenciales del panel local están en `credenciales-demo.local.md` (no se sube a git).

## Datos de la demo

- Región **Perú**, moneda **PEN**, precios **con IGV (18 %) incluido**.
- Envío estándar S/ 15 (3–5 días) y envío express Lima S/ 25 (24 h).
- 4 productos (polo, polerón, jogger, short) con variantes de talla/color y 50 unidades de stock cada una.
- Métodos de pago: **Mercado Pago** (Checkout Pro, modo prueba) y pago manual de demo.

## Pagos con Mercado Pago

Módulo propio en `tienda/apps/backend/src/modules/mercadopago/` (proveedor de pagos de Medusa).

```
Tienda (Next.js)                      Backend (Medusa)                         Mercado Pago
────────────────                      ────────────────                         ────────────
Elige "Mercado Pago"  ──────────────► initiatePayment: crea preferencia ─────► /checkout/preferences
                                      (external_reference = ID de la sesión,
                                       monto y moneda del carrito)
"Pagar con Mercado Pago" ─ abre ────────────────────────────────────────────► El cliente paga
Consulta cada 4 s     ──────────────► GET /store/mercadopago/estado ─────────► /v1/payments/search
Pago aprobado → placeOrder ─────────► authorizePayment: vuelve a buscar el
                                      pago y exige aprobado + mismo monto
                                      + misma moneda → crea el pedido
```

**Regla de seguridad:** el navegador nunca decide que algo se pagó. Medusa consulta a Mercado Pago al
completar el carrito; si no hay un pago aprobado por el monto exacto, rechaza el pedido.

**Configuración** (`tienda/apps/backend/.env`, ver `.env.template`):

| Variable | Uso |
|---|---|
| `MERCADOPAGO_ACCESS_TOKEN` | Credencial de **prueba** del panel de desarrolladores (sección *Credenciales de prueba*) |
| `MERCADOPAGO_PUBLIC_KEY` | Clave pública (para un futuro formulario de pago integrado) |
| `MERCADOPAGO_RETURN_URL` | Solo producción: URL **HTTPS** a la que Mercado Pago devuelve al cliente (con `localhost` no lo permite) |
| `MERCADOPAGO_WEBHOOK_URL` | Solo producción: `https://<backend>/hooks/payment/mercadopago_mercadopago` |

Después de configurar el token: reiniciar el backend y ejecutar
`npx medusa exec ./src/scripts/activar-mercadopago.ts` para habilitarlo en la región Perú.

**Probar un pago** (tarjetas publicadas por Mercado Pago, sin dinero real):

| Tarjeta | Número | CVV | Vence |
|---|---|---|---|
| Visa | 4009 1753 3280 6176 | 123 | 11/30 |
| Mastercard | 5031 7557 3453 0604 | 123 | 11/30 |

Titular **APRO** = pago aprobado · **OTHE** = rechazado · **CONT** = pendiente. DNI de prueba: 12345678.

## Problemas que se resolvieron al instalar (Windows)

| Problema | Causa | Solución |
|---|---|---|
| `Failed to load native binding` de SWC | `@swc/core` 1.16 rechaza cachés con permisos heredados de otros usuarios | Fijado `@swc/core@1.15.47` en `overrides` |
| Monedas no cargaban (`WIN1252`) | `initdb` en Windows usa la codificación del sistema | `initdbFlags: ['--encoding=UTF8', '--locale=C']` |
| "Objects are not valid as a React child" | La tienda (React 19) compartía librerías con el panel (React 18) | La tienda tiene su propio `node_modules`, fuera de los workspaces |
