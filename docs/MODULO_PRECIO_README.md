# Módulo de Monitoreo de Precios - Discord Nitro

## 📋 Descripción

Módulo automático que monitorea el precio de **Discord Nitro - 1 Year** en Eneba cada 30 minutos y envía alertas personalizadas por DM a los usuarios cuando el precio alcanza su umbral configurado.

## 🚀 Características

- ✅ Monitoreo automático cada 30 minutos
- ✅ Alertas personalizadas por DM
- ✅ Historial completo de precios
- ✅ Detección de productos sin stock
- ✅ Sistema de alertas inteligente (solo notifica cuando cruza el umbral)

## 📂 Archivos del Módulo

### Modelos (MongoDB)
- `src/models/Product.js` - Productos monitoreados
- `src/models/PriceHistory.js` - Historial de precios
- `src/models/Alert.js` - Alertas configuradas por usuarios

### Módulo Principal
- `src/modules/discordPriceMonitor.js` - Lógica de monitoreo y alertas

### Comandos (Solo TerraNova)
- `src/commands/-TerraNova-/dpm.js` - Configurar alerta
- `src/commands/-TerraNova-/dpm-list.js` - Ver mis alertas
- `src/commands/-TerraNova-/dpm-remove.js` - Eliminar alerta

## 🎮 Comandos de Discord

### `/dpm` - Configurar Alerta
Configura una alerta de precio personalizada.

**Parámetros:**
- `producto`: Nombre del producto (ej: "Discord Nitro - 1 Year Subscription Key GLOBAL")
- `precio`: Precio umbral en EUR (ej: 55.00)

**Ejemplo:**
```
/dpm producto:Discord Nitro - 1 Year Subscription Key GLOBAL precio:55.00
```

**Nota:** El producto debe existir en la base de datos (el sistema lo crea automáticamente en la primera consulta).

### `/dpm-list` - Ver Alertas y Productos Disponibles
Muestra todas tus alertas configuradas y lista todos los productos disponibles en el sistema para monitorear.

**Características:**
- 🔔 Lista tus alertas activas con su umbral de precio
- 📦 Muestra todos los productos disponibles en el sistema

**Ejemplo:**
```
/dpm-list
```

**Respuesta ejemplo:**
```
🔔 Tus Alertas Configuradas:

1. Discord Nitro - 1 Year Subscription Key GLOBAL
   └ Umbral: 55.00 EUR

📦 Productos Disponibles para Monitorear:

Discord Nitro - 1 Year Subscription Key GLOBAL
Discord Nitro - 1 Month Subscription Key GLOBAL


Usa /dpm para crear o modificar una alerta.
```

### `/dpm-remove` - Eliminar Alerta
Elimina una alerta configurada.

**Parámetros:**
- `producto`: Nombre del producto

**Ejemplo:**
```
/dpm-remove producto:Discord Nitro - 1 Year Subscription Key GLOBAL
```

## 🔧 Funcionamiento Técnico

### Flujo de Monitoreo

1. **Cada 30 minutos**, el módulo consulta la API de Eneba
2. **Extrae** el precio del primer producto que coincida con "Discord Nitro - 1 Year"
3. **Guarda** el precio en el historial (`PriceHistory`)
4. **Verifica** todas las alertas configuradas
5. **Envía DM** solo si:
   - Precio actual ≤ umbral configurado
   - Y el precio anterior era > umbral (cambio de estado)

### Ejemplo de Alerta

```
🎉 ¡Alerta de Precio!

Producto: Discord Nitro - 1 Year Subscription Key GLOBAL
Precio Actual: 54.99 EUR
Tu Umbral: 55.00 EUR
Enlace: https://www.eneba.com/[producto]/[vendedor]
```

## 📊 Base de Datos

### Colección: `products`
```javascript
{
  _id: ObjectId,
  name: "Discord Nitro - 1 Year Subscription Key GLOBAL",
  slug: "other-discord-nitro-1-year-subscription-key-global",
  createdAt: Date,
  updatedAt: Date
}
```

### Colección: `pricehistories`
```javascript
{
  _id: ObjectId,
  product: ObjectId (ref: Product),
  price: 68.41,           // null si no hay stock
  currency: "EUR",
  inStock: true,
  merchantSlug: "codesful",
  timestamp: Date
}
```

### Colección: `alerts`
```javascript
{
  _id: ObjectId,
  product: ObjectId (ref: Product),
  userId: "123456789",    // Discord User ID
  thresholdPrice: 55.00,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔍 Logs del Sistema

El módulo genera logs con el prefijo `[DPM]` (Discord Price Monitor):

```
[DPM] Módulo de monitoreo de precios iniciado (cada 30 minutos)
[DPM] Consultando precio de Discord Nitro...
[DPM] Producto creado: Discord Nitro - 1 Year Subscription Key GLOBAL
[DPM] Precio guardado: Discord Nitro - 1 Year... - 68.41 EUR
[DPM] Notificación enviada a 123456789 para Discord Nitro...
[DPM] Producto sin stock: Discord Nitro...
```

## ⚠️ Manejo de Errores

- **API no responde**: Se registra el error y espera 30 minutos para el siguiente intento
- **Sin stock**: Se guarda el registro con `inStock: false` y no se envían alertas
- **DM bloqueados**: Se registra el error pero continúa con las demás alertas
- **Producto no encontrado**: El usuario recibe un mensaje indicando que debe esperar a que el sistema registre el producto

## 🚀 Inicialización

El módulo se inicializa automáticamente cuando el bot arranca (evento `ready`):

```javascript
// En src/events/ready.js
import iniciarMonitoreoPrecios from '../modules/discordPriceMonitor';

// ...
iniciarMonitoreoPrecios(client);
```

## 📝 Notas Importantes

1. **Permisos**: Los comandos solo están disponibles en el servidor de TerraNova (por estar en la carpeta `-TerraNova-`)
2. **Productos**: El sistema crea productos automáticamente en la primera consulta a la API
3. **Alertas**: Un usuario puede tener solo una alerta por producto (se actualiza si ya existe)
4. **Intervalo**: El monitoreo ocurre cada 30 minutos (configurable en el código)
5. **API de Eneba**: Si la API cambia su estructura, puede ser necesario actualizar el módulo

## 🛠️ Mantenimiento

### Ver productos monitoreados
```javascript
const productos = await Product.find({});
console.log(productos);
```

### Ver historial de un producto
```javascript
const historial = await PriceHistory.find({ product: productId })
  .sort({ timestamp: -1 })
  .limit(50);
```

### Ver todas las alertas activas
```javascript
const alertas = await Alert.find({})
  .populate('product')
  .sort({ createdAt: -1 });
```

## 📈 Próximas Mejoras (Opcionales)

- [ ] Autocompletar dinámico en comandos
- [ ] Comando de administración para agregar productos manualmente
- [ ] Gráficas de evolución de precios
- [ ] Notificaciones cuando vuelve a haber stock
- [ ] Monitoreo de múltiples productos
- [ ] Configuración de intervalos personalizados

---

**Desarrollado para TerraNova Bot v3.1.0**
