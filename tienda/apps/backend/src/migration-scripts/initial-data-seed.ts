import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

// Datos iniciales de "Tienda Andina", una tienda ficticia de ropa para el portafolio.
// Precios en soles con IGV incluido (como se muestran en Perú) y referencia en dólares.

const IMG = "https://medusa-public-images.s3.eu-west-1.amazonaws.com";
const TALLAS = ["S", "M", "L", "XL"];
const STOCK_INICIAL = 50;

type Precio = { pen: number; usd: number };

const precios = ({ pen, usd }: Precio) => [
  { amount: pen, currency_code: "pen" },
  { amount: usd, currency_code: "usd" },
];

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  logger.info("Creando tienda y canal de venta...");
  const {
    result: [canalWeb],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        { name: "Tienda web", description: "Ventas desde la tienda en línea" },
      ],
    },
  });

  const {
    result: [clavePublica],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        { title: "Clave pública de la tienda web", type: "publishable", created_by: "" },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: clavePublica.id, add: [canalWeb.id] },
  });

  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Tienda Andina",
          supported_currencies: [
            { currency_code: "pen", is_default: true, is_tax_inclusive: true },
            { currency_code: "usd", is_default: false },
          ],
          default_sales_channel_id: canalWeb.id,
        },
      ],
    },
  });

  logger.info("Creando región Perú con IGV...");
  const {
    result: [region],
  } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Perú",
          currency_code: "pen",
          countries: ["pe"],
          payment_providers: ["pp_system_default"],
          is_tax_inclusive: true,
        },
      ],
    },
  });

  await createTaxRegionsWorkflow(container).run({
    input: [
      {
        country_code: "pe",
        provider_id: "tp_system",
        default_tax_rate: { name: "IGV", code: "IGV", rate: 18 },
      },
    ],
  });

  logger.info("Creando almacén y envíos...");
  const {
    result: [almacen],
  } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: "Almacén Lima",
          address: { city: "Lima", country_code: "PE", address_1: "" },
        },
      ],
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: almacen.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  });

  // Medusa crea el perfil de envío por defecto en una migración propia.
  const {
    data: [perfilEnvio],
  } = await query.graph({ entity: "shipping_profile", fields: ["id"] });

  const zonaEnvio = await fulfillmentModuleService.createFulfillmentSets({
    name: "Despachos desde Lima",
    type: "shipping",
    service_zones: [
      { name: "Perú", geo_zones: [{ country_code: "pe", type: "country" }] },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: almacen.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: zonaEnvio.id },
  });

  const reglasTienda = [
    { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
    { attribute: "is_return", value: "false", operator: "eq" as const },
  ];

  const opcionEnvio = (
    nombre: string,
    code: string,
    descripcion: string,
    precio: Precio
  ) => ({
    name: nombre,
    price_type: "flat" as const,
    provider_id: "manual_manual",
    service_zone_id: zonaEnvio.service_zones[0].id,
    shipping_profile_id: perfilEnvio.id,
    type: { label: nombre, description: descripcion, code },
    prices: [...precios(precio), { region_id: region.id, amount: precio.pen }],
    rules: reglasTienda,
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      opcionEnvio("Envío estándar", "estandar", "A todo el Perú en 3 a 5 días hábiles.", { pen: 15, usd: 4 }),
      opcionEnvio("Envío express Lima", "express", "Lima Metropolitana en 24 horas.", { pen: 25, usd: 7 }),
    ],
  });

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: almacen.id, add: [canalWeb.id] },
  });

  logger.info("Creando catálogo...");
  const { result: categorias } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: ["Polos", "Polerones", "Pantalones", "Shorts"].map((name) => ({
        name,
        is_active: true,
      })),
    },
  });
  const categoria = (nombre: string) => categorias.find((c) => c.name === nombre)!.id;

  const { result: opciones } = await createProductOptionsWorkflow(container).run({
    input: {
      product_options: [
        { title: "Talla", values: TALLAS },
        { title: "Color", values: ["Negro", "Blanco"] },
      ],
    },
  });
  const opcionTalla = opciones.find((o) => o.title === "Talla")!;
  const opcionColor = opciones.find((o) => o.title === "Color")!;

  const porTalla = (prefijo: string, precio: Precio) =>
    TALLAS.map((talla) => ({
      title: talla,
      sku: `${prefijo}-${talla}`,
      options: { Talla: talla },
      prices: precios(precio),
    }));

  const productoBase = {
    status: ProductStatus.PUBLISHED,
    shipping_profile_id: perfilEnvio.id,
    weight: 400,
    sales_channels: [{ id: canalWeb.id }],
  };

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          ...productoBase,
          title: "Polo Clásico Algodón",
          handle: "polo-clasico",
          description:
            "Polo de algodón peinado, corte regular y cuello reforzado. El básico que combina con todo.",
          category_ids: [categoria("Polos")],
          images: ["tee-black-front", "tee-black-back", "tee-white-front", "tee-white-back"].map(
            (n) => ({ url: `${IMG}/${n}.png` })
          ),
          options: [{ id: opcionTalla.id }, { id: opcionColor.id }],
          variants: TALLAS.flatMap((talla) =>
            ["Negro", "Blanco"].map((color) => ({
              title: `${talla} / ${color}`,
              sku: `POLO-${talla}-${color.toUpperCase()}`,
              options: { Talla: talla, Color: color },
              prices: precios({ pen: 59.9, usd: 16 }),
            }))
          ),
        },
        {
          ...productoBase,
          title: "Polerón Vintage",
          handle: "poleron-vintage",
          description:
            "Polerón de felpa con lavado vintage. Abrigador para las mañanas frías sin perder estilo.",
          category_ids: [categoria("Polerones")],
          images: ["sweatshirt-vintage-front", "sweatshirt-vintage-back"].map((n) => ({
            url: `${IMG}/${n}.png`,
          })),
          options: [{ id: opcionTalla.id }],
          variants: porTalla("POLERON", { pen: 129.9, usd: 35 }),
        },
        {
          ...productoBase,
          title: "Jogger Gris",
          handle: "jogger-gris",
          description:
            "Jogger de algodón con pretina elástica y bolsillos laterales. Comodidad para todo el día.",
          category_ids: [categoria("Pantalones")],
          images: ["sweatpants-gray-front", "sweatpants-gray-back"].map((n) => ({
            url: `${IMG}/${n}.png`,
          })),
          options: [{ id: opcionTalla.id }],
          variants: porTalla("JOGGER", { pen: 99.9, usd: 27 }),
        },
        {
          ...productoBase,
          title: "Short Vintage",
          handle: "short-vintage",
          description:
            "Short de algodón con lavado vintage, ideal para el verano limeño.",
          category_ids: [categoria("Shorts")],
          images: ["shorts-vintage-front", "shorts-vintage-back"].map((n) => ({
            url: `${IMG}/${n}.png`,
          })),
          options: [{ id: opcionTalla.id }],
          variants: porTalla("SHORT", { pen: 69.9, usd: 19 }),
        },
      ],
    },
  });

  logger.info("Cargando stock inicial...");
  const { data: items } = await query.graph({ entity: "inventory_item", fields: ["id"] });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: items.map((item) => ({
        location_id: almacen.id,
        stocked_quantity: STOCK_INICIAL,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info("Datos iniciales de Tienda Andina listos.");
}
