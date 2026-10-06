import { configureStoreSearch, defineMiddlewares, validateAndTransformBody } from '@medusajs/framework/http'
import { CrearReclamoSchema, ResponderReclamoSchema } from './reclamaciones-validadores'

// The product index declares filterable `status` and `sales_channel_ids`, so
// the route narrows it to published products in the key's sales channels.
export default defineMiddlewares({
  routes: [
    {
      method: ['POST'],
      matcher: '/store/search',
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },
    {
      method: ['POST'],
      matcher: '/store/reclamaciones',
      middlewares: [validateAndTransformBody(CrearReclamoSchema)],
    },
    {
      method: ['POST'],
      matcher: '/admin/reclamaciones/:id/responder',
      middlewares: [validateAndTransformBody(ResponderReclamoSchema)],
    },
  ],
})
