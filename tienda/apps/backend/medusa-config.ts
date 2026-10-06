import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
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
