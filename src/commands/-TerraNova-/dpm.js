import { SlashCommandBuilder, CommandInteraction, ApplicationCommandOptionType } from 'discord.js';
import Product from '../../models/Product';
import Alert from '../../models/Alert';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dpm')
    .setDescription('Discord Price Monitoring - Configura una alerta de precio')
    .addStringOption(option => 
      option
        .setName('producto')
        .setDescription('Selecciona el producto a monitorear')
        .setRequired(true)
        // Las choices se cargarán dinámicamente cuando se registre el comando
    )
    .addNumberOption(option => 
      option
        .setName('precio')
        .setDescription('Precio umbral en EUR (ej: 55.00)')
        .setRequired(true)
        .setMinValue(0.01)
    ),

  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    try {
      // Obtener parámetros
      const productName = interaction.options.getString('producto');
      const thresholdPrice = interaction.options.getNumber('precio');
      const userId = interaction.user.id;
      
      // Buscar el producto por nombre
      const producto = await Product.findOne({ name: productName });
      
      if (!producto) {
        return interaction.reply({
          content: '❌ Producto no encontrado. El sistema aún no ha registrado este producto.',
          ephemeral: true
        });
      }
      
      // Insertar o actualizar alerta (upsert)
      await Alert.findOneAndUpdate(
        { product: producto._id, userId: userId },
        { thresholdPrice: thresholdPrice },
        { upsert: true, new: true }
      );
      
      return interaction.reply({
        content: `## ✅ Alerta configurada:\n` +
                 `**Producto:** ${producto.name}\n` +
                 `**Precio Umbral:** ${thresholdPrice.toFixed(2)} EUR\n\n` +
                 `Recibirás un DM cuando el precio sea ≤ ${thresholdPrice.toFixed(2)} EUR.`,
        ephemeral: true
      });
      
    } catch (error) {
      console.error('[Comando dpm] Error:', error);
      return interaction.reply({
        content: '❌ Error al configurar la alerta. Intenta de nuevo.',
        ephemeral: true
      });
    }
  },
};
