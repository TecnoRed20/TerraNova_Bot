import { SlashCommandBuilder, ChannelType, CommandInteraction } from 'discord.js';

const toUTCDate = (date) => {
  return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()} ${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}:${date.getUTCSeconds().toString().padStart(2, '0')} UTC`
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	
  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
		// Variables a mostrar
		const name = interaction.guild.name;
		const iconURL = interaction.guild.iconURL();
		const ownerId = interaction.guild.ownerId;
		const boostLevel = interaction.guild.premiumTier;
		const createdAt = interaction.guild.createdAt;
		const numRoles = interaction.guild.roles.cache.size;
		const membersTotal = interaction.guild.memberCount;
		const memberBots = interaction.guild.members.cache.filter(member => member.user.bot).size;
		const memberUsers = membersTotal - memberBots;
		const memberOnline = interaction.guild.presences.cache.filter(presence => presence.status !== 'offline' && !presence.user.bot).size;
		const categoriesTotal = interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).size;
		const channelsText = interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size;
		const channelsVoice = interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size;
		const channelsTotal = channelsText + channelsVoice;

		const userExecuteCommand = interaction.user.username + (interaction.user.discriminator !== '0' ? '#' + interaction.user.discriminator : '')
		const userExecuteCommandAvatarURL = interaction.user.displayAvatarURL({ dynamic: true });


		const embed = {
      'color': 0x000128,
      'author': {
        'name': name,
        'icon_url': iconURL
      },
      'fields': [
        {
          'name': ':crown: Dueño',
          'value': `<@${ownerId}>`,
          'inline': true
        },
        {
          'name': ':sparkles: Nivel de Boost',
          'value': boostLevel,
          'inline': true
        },
        {
          'name': ':calendar: Creado el',
          'value': toUTCDate(createdAt),
          'inline': true
        },
        {
          'name': ':closed_lock_with_key: Roles totales',
          'value': numRoles,
          'inline': true
        },
        {
          'name': ':busts_in_silhouette: Miembros',
          'value': membersTotal + ' miembros:\n' + memberBots +' bots, ' + memberUsers + ' usuarios\n' + memberOnline + ' en línea',
          'inline': true
        },
        {
            'name': ':speech_balloon: Canales Totales',
            'value': categoriesTotal + ' categorías\n' + channelsTotal + ' canales totales:\n' + channelsText + ' texto | ' + channelsVoice + ' voz',
          'inline': true
        }
      ],
      'timestamp': new Date(),
      'footer': {
				'text': userExecuteCommand + ' | /server',
				'icon_url': userExecuteCommandAvatarURL,
			}
    };
		await interaction.reply({ embeds: [embed]});
	},
};