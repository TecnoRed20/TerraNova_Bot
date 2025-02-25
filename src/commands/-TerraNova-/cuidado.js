import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cuidado')
    .setDescription('Invoca buitres vigilado'),

  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const userExecuteCommand = interaction.user.username + (interaction.user.discriminator !== '0' ? '#' + interaction.user.discriminator : '')
    const userExecuteCommandAvatarURL = interaction.user.displayAvatarURL({ dynamic: true });

    const embed = {
      'color': 0xFFFFFF,
      'image': {
        'url': 'http://tecnored.xyz/DiscordGif/atento.gif'
      },
      'timestamp': new Date(),
      'footer': {
        'text': userExecuteCommand + ' | /cuidado',
        'icon_url': userExecuteCommandAvatarURL,
      }
    };

    await interaction.reply({ embeds: [embed] });
  },
};