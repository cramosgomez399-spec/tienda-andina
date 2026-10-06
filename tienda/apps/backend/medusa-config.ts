import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // Bases de datos administradas (Supabase) exigen SSL; en local no se usa.
    databaseDriverOptions:
      process.env.DATABASE_SSL === 'true'
        ? { connection: { ssl: { rejectUnauthorized: false } } }
        : {},
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  admin: {
    // Permite servir solo la API si el servidor no tiene memoria para compilar el panel.
    disable: process.env.DISABLE_ADMIN === 'true',
  },
  modules: [
    {
      resolve: './src/modules/reclamaciones',
    },
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        // Con RESEND_API_KEY los correos salen de verdad; sin ella se registran en el log del servidor.
        providers: [
          process.env.RESEND_API_KEY
            ? {
                resolve: './src/modules/resend',
                id: 'resend',
                options: {
                  channels: ['email'],
                  apiKey: process.env.RESEND_API_KEY,
                  from: process.env.EMAIL_FROM ?? 'Tienda Andina <onboarding@resend.dev>',
                },
              }
            : {
                resolve: '@medusajs/medusa/notification-local',
                id: 'local',
                options: { channels: ['email'] },
              },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        // Mercado Pago (Checkout Pro) solo se registra si hay token; el pago manual del sistema
        // (pp_system_default) siempre está disponible.
        providers: process.env.MERCADOPAGO_ACCESS_TOKEN
          ? [
              {
                resolve: './src/modules/mercadopago',
                id: 'mercadopago',
                options: {
                  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
                  returnUrl: process.env.MERCADOPAGO_RETURN_URL,
                  webhookUrl: process.env.MERCADOPAGO_WEBHOOK_URL,
                },
              },
            ]
          : [],
      },
    },
  ],
})
