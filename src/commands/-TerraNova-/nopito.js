import { SlashCommandBuilder, AttachmentBuilder, CommandInteraction } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nopito')
		.setDescription('Meme de "No tienes pito"')
    .addUserOption(option => 
      option
        .setName('target')
        .setDescription('Usuario')
        .setRequired(true)
    ),
	
  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const userTargetId = interaction.options.getUser('target').id;
    const userId = interaction.user.id
    try {
      const file = new AttachmentBuilder('/var/www/html/DiscordGif/No tiene pito.mp4');
      await interaction.reply({
        content: `<@${userId}> dice que <@${userTargetId}> no tiene pito.`,
        files: [file]
      });
    } catch (error) {
      await interaction.reply({
        content: `<@${userId}> dice que <@${userTargetId}> no tiene pito.`,
      });
    }
	},
};