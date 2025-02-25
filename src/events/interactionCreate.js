import { Events, BaseInteraction } from 'discord.js';
import eLog from '../utils/eLog';

module.exports = {
	name: Events.InteractionCreate,
  once: false,
  /**
   * @param {BaseInteraction} interaction 
   */
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			eLog(`[${interaction.guild.name}] Comando ${interaction.commandName} no encontrado.`);
			return;
		}

		try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
			eLog(`[${interaction.guild.name}] ${error}.`);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: '¡Hubo un error al ejecutar este comando!', ephemeral: true });
      } else {
        await interaction.reply({ content: '¡Hubo un error al ejecutar este comando!', ephemeral: true });
      }
    }
	},
};