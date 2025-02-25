import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nomessirve')
		.setDescription('Meme de No-Messi-rve'),
	
  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const userExecuteCommand = interaction.user.username + (interaction.user.discriminator !== '0' ? '#' + interaction.user.discriminator : '')
		const userExecuteCommandAvatarURL = interaction.user.displayAvatarURL({ dynamic: true });

    const embed = {
      'color': 0xF55452,
      'image':  {
        'url': 'http://tecnored.xyz/DiscordGif/nomessirve.gif'
      },
      'timestamp': new Date(),
      'footer': {
        'text': userExecuteCommand + ' | /nomessirve',
        'icon_url': userExecuteCommandAvatarURL,
      }
    };

		await interaction.reply({ embeds: [embed]});
	},
};