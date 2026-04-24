import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import Alert from '../../models/Alert';
import Product from '../../models/Product';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dpm-list')
    .setDescription('Discord Price Monitoring - Ver alertas configuradas y productos disponibles'),

  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      
      // Obtener las alertas del usuario
      const alertas = await Alert.find({ userId: userId })
        .populate('product')
        .sort({ createdAt: -1 });
      
      // Obtener todos los productos disponibles
      const productosDisponibles = await Product.find({})
        .sort({ name: 1 });
      
      let mensaje = '';
      
      // Sección de alertas configuradas
      if (alertas.length === 0) {
        mensaje += '## 📭 **Tus Alertas Configuradas:**\n';
        mensaje += 'No tienes alertas configuradas.\n\n';
      } else {
        mensaje += '## 🔔 **Tus Alertas Configuradas:**\n';
        alertas.forEach((alerta, index) => {
          mensaje += `${index + 1}. **${alerta.product.name}**\n`;
          mensaje += `   └ Umbral: ${alerta.thresholdPrice.toFixed(2)} EUR\n`;
        });
      }
      
      // Sección de productos disponibles
      mensaje += '\n## 📦 **Productos Disponibles para Monitorear:**\n';
      
      if (productosDisponibles.length === 0) {
        mensaje += 'No hay productos disponibles en el sistema.\n\n';
      } else {
        productosDisponibles.forEach((producto, index) => {
          // Verificar si el usuario ya tiene una alerta para este producto
          const tieneAlerta = alertas.some(
            alerta => alerta.product._id.toString() === producto._id.toString()
          );
          mensaje += `- **${producto.name}**\n`;
        });
      }
      
      mensaje += '\nUsa `/dpm` para crear o modificar una alerta.';
      
      return interaction.reply({
        content: mensaje,
        ephemeral: true
      });
      
    } catch (error) {
      console.error('[Comando dpm-list] Error:', error);
      return interaction.reply({
        content: '❌ Error al obtener las alertas. Intenta de nuevo.',
        ephemeral: true
      });
    }
  },
};
