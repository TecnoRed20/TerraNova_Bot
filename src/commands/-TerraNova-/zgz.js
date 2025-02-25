import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('zgz')
		.setDescription('Meme de animal con ojos grandes (Referido a ZgZ)'),
  
  /**
   * @param {CommandInteraction} interaction 
   */
  async execute(interaction) {
    const userExecuteCommand = interaction.user.username + (interaction.user.discriminator !== '0' ? '#' + interaction.user.discriminator : '')
		const userExecuteCommandAvatarURL = interaction.user.displayAvatarURL({ dynamic: true });

    const embed = {
      'color': 0x705202,
      'image':  {
        'url': 'http://tecnored.xyz/DiscordGif/zgz.gif'
      },
      'timestamp': new Date(),
      'footer': {
        'text': userExecuteCommand + ' | /zgz',
        'icon_url': userExecuteCommandAvatarURL,
      }
    };

		await interaction.reply({ embeds: [embed]});
	},
};