import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import Product from '../../models/Product';
import Alert from '../../models/Alert';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dpm-remove')
    .setDescription('Discord Price Monitoring - Elimina una alerta de precio')
    .addStringOption(option => 
      option
        .setName('producto')
        .setDescription('Selecciona el producto')
        .setRequired(true)
    ),

  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    try {
      const productName = interaction.options.getString('producto');
      const userId = interaction.user.id;
      
      // Buscar el producto por nombre
      const producto = await Product.findOne({ name: productName });
      
      if (!producto) {
        return interaction.reply({
          content: '❌ Producto no encontrado.',
          ephemeral: true
        });
      }
      
      const resultado = await Alert.findOneAndDelete({
        product: producto._id,
        userId: userId
      });
      
      if (!resultado) {
        return interaction.reply({
          content: '❌ No tienes una alerta configurada para este producto.',
          ephemeral: true
        });
      }
      
      return interaction.reply({
        content: `✅ Alerta eliminada para **${producto.name}**`,
        ephemeral: true
      });
      
    } catch (error) {
      console.error('[Comando dpm-remove] Error:', error);
      return interaction.reply({
        content: '❌ Error al eliminar la alerta. Intenta de nuevo.',
        ephemeral: true
      });
    }
  },
};
