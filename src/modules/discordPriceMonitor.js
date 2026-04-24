import Product from '../models/Product';
import PriceHistory from '../models/PriceHistory';
import Alert from '../models/Alert';
import eLog from '../utils/eLog';

/**
 * Consulta la API de Eneba para obtener el precio actual de Discord Nitro
 */
async function consultarAPIEneba() {
  try {
    const response = await fetch("https://graphql.eneba.com/graphql/", {
      method: "POST",
      headers: {
        "accept": "*/*",
        "accept-language": "en",
        "content-type": "application/json",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "Referer": "https://www.eneba.com/"
      },
      body: JSON.stringify({
        operationName: "Store",
        variables: {
          currency: "EUR",
          context: {
            country: "ES",
            region: "spain",
            language: "en"
          },
          searchType: "STORE_GAMES",
          text: "Discord Nitro - 1 Year",
          sortBy: "DATE_DESC",
          first: 20,
          price: {
            currency: "EUR"
          },
          store: "codesful",
          url: "/vendor/codesful",
          redirectUrl: "https://www.eneba.com/vendor/codesful"
        },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: "7b3ccd983c2190c06f2bf3cfb4fa00291dc18ae337c4354aa115a63c8b74392d_71f9cc578a6d7d5396b0f58e2fc617e21f5fda986fbda2595e1d5f89b7446af1003526e8af63d4d0c79d4934e14c2d5dc1be8c677d75e0df84f3d44a4b2ccc02"
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    eLog(`[DPM] Error al consultar API de Eneba: ${error.message}`);
    throw error;
  }
}

/**
 * Procesa la respuesta de la API y extrae los datos del producto
 */
async function procesarRespuestaAPI(data) {
  // Validar que hay resultados
  if (!data?.data?.search?.results?.edges || data.data.search.results.edges.length === 0) {
    throw new Error('No se encontraron productos en la respuesta');
  }

  // Obtener el primer producto (ordenado por fecha descendente)
  const firstProduct = data.data.search.results.edges[0].node;

  // Extraer datos
  const productData = {
    name: firstProduct.name,
    slug: firstProduct.slug,
    inStock: firstProduct.cheapestAuction !== null,
    price: null,
    currency: null,
    merchantSlug: null
  };

  // Si hay stock, extraer información de precio
  if (productData.inStock) {
    productData.price = firstProduct.cheapestAuction.price.amount / 100;
    productData.currency = firstProduct.cheapestAuction.price.currency;
    productData.merchantSlug = firstProduct.cheapestAuction.merchant.slug;
  }

  return productData;
}

/**
 * Envía una alerta por DM al usuario
 */
async function enviarAlerta(client, userId, productData, precioActual, umbral) {
  const url = `https://www.eneba.com/${productData.slug}/${productData.merchantSlug}`;
  
  const mensaje = `🎉 **¡Alerta de Precio!**\n\n` +
    `**Producto:** ${productData.name}\n` +
    `**Precio Actual:** ${precioActual.toFixed(2)} EUR\n` +
    `**Tu Umbral:** ${umbral.toFixed(2)} EUR\n` +
    `**Enlace:** ${url}`;
  
  try {
    const user = await client.users.fetch(userId);
    await user.send(mensaje);
    eLog(`[DPM] Notificación enviada a ${userId} para ${productData.name}`);
  } catch (error) {
    eLog(`[DPM] Error al enviar DM a ${userId}: ${error.message}`);
  }
}

/**
 * Verifica las alertas configuradas y envía notificaciones si es necesario
 */
async function verificarAlertas(client, productId, precioActual, inStock, productData) {
  // No procesar alertas si no hay stock
  if (!inStock) return;
  
  // Obtener todas las alertas configuradas para este producto
  const alertas = await Alert.find({ product: productId });
  
  // Si no hay alertas configuradas, salir
  if (alertas.length === 0) return;
  
  // Obtener el precio anterior (el último registro antes del actual)
  const registroAnterior = await PriceHistory
    .findOne({ product: productId })
    .sort({ timestamp: -1 })
    .skip(1);
  
  const precioAnterior = registroAnterior?.price;
  
  // Iterar cada alerta y verificar si debe notificar
  for (const alerta of alertas) {
    const umbral = alerta.thresholdPrice;
    
    // Verificar si debe enviar notificación:
    // 1. Precio actual <= umbral Y
    // 2. (No hay precio anterior O precio anterior > umbral)
    const debeNotificar = 
      precioActual <= umbral && 
      (!precioAnterior || precioAnterior > umbral);
    
    if (debeNotificar) {
      await enviarAlerta(client, alerta.userId, productData, precioActual, umbral);
    }
  }
}

/**
 * Guarda el precio en la base de datos
 */
async function guardarPrecio(client, productData) {
  // 1. Buscar o crear producto en MongoDB
  let product = await Product.findOne({ name: productData.name });
  
  if (!product) {
    product = await Product.create({
      name: productData.name,
      slug: productData.slug
    });
    eLog(`[DPM] Producto creado: ${productData.name}`);
  }
  
  // 2. Determinar si hay stock
  const inStock = productData.inStock;
  
  // 3. Preparar datos
  let precio = null;
  let moneda = 'EUR';
  let merchantSlug = null;
  
  if (inStock) {
    precio = productData.price;
    moneda = productData.currency;
    merchantSlug = productData.merchantSlug;
  }
  
  // 4. Insertar en PriceHistory
  await PriceHistory.create({
    product: product._id,
    price: precio,
    currency: moneda,
    inStock: inStock,
    merchantSlug: merchantSlug
  });
  
  if (inStock) {
    eLog(`[DPM] Precio guardado: ${productData.name} - ${precio.toFixed(2)} ${moneda}`);
  } else {
    eLog(`[DPM] Producto sin stock: ${productData.name}`);
  }
  
  // 5. Verificar alertas configuradas
  await verificarAlertas(client, product._id, precio, inStock, productData);
}

/**
 * Ejecuta la recolección de precio
 */
async function ejecutarRecoleccionPrecio(client) {
  try {
    eLog('[DPM] Consultando precio de Discord Nitro...');
    const data = await consultarAPIEneba();
    const productData = await procesarRespuestaAPI(data);
    await guardarPrecio(client, productData);
  } catch (error) {
    eLog(`[DPM] Error en recolección de precio: ${error.message}`);
  }
}

/**
 * Inicia el monitoreo de precios
 */
export default function iniciarMonitoreoPrecios(client) {
  // Ejecutar inmediatamente al iniciar
  ejecutarRecoleccionPrecio(client);
  
  // Luego cada 30 minutos (1800000 ms)
  setInterval(() => {
    ejecutarRecoleccionPrecio(client);
  }, 30 * 60 * 1000);
  
  eLog('[DPM] Módulo de monitoreo de precios iniciado (cada 30 minutos)');
}
