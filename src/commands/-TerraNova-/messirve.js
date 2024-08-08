import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('messirve')
    .setDescription('Meme de Messi-rve'),

  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const userExecuteCommand = interaction.user.username + (interaction.user.discriminator !== '0' ? '#' + interaction.user.discriminator : '')
    const userExecuteCommandAvatarURL = interaction.user.displayAvatarURL({ dynamic: true });

    const embed = {
      'color': 0x99F02B,
      'image': {
        'url': 'http://tecnored.xyz/DiscordGif/messirve.gif'
      },
      'timestamp': new Date(),
      'footer': {
        'text': userExecuteCommand + ' | /messirve',
        'icon_url': userExecuteCommandAvatarURL,
      }
    };

    await interaction.reply({ embeds: [embed] });
  },
};