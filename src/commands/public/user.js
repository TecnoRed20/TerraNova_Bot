import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

const toUTCDate = (date) => {
  return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()} ${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}:${date.getUTCSeconds().toString().padStart(2, '0')} UTC`
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Obtain information of the selected user or your own information.')
		.addUserOption(option => option.setName('target').setDescription('The user\'s information to show')),
	
	/**
   * @param {CommandInteraction} interaction
   */
	async execute(interaction) {
		const userId = interaction.options.getUser('target')?.id ?? interaction.user.id;
		const guild = interaction.member.guild;
		// https://old.discordjs.dev/#/docs/discord.js/14.11.0/class/GuildMember
		const member = await guild.members.fetch(userId);
		
		// Variables a mostrar
		const avatarURL = member.user.displayAvatarURL({ dynamic: true });
		const username = member.user.username + (member.user.discriminator !== '0' ? '#' + member.user.discriminator : '');
		// userId
		const nickname = member.nickname ?? 'No tiene';
		const createdAt = member.user.createdAt;
		const joinedAt = member.joinedAt;
		const roles = member.roles?.cache.map(rol => '`' + rol.name + '`').sort().join(', ');
		const userExecuteCommand = interaction.user.username + (interaction.user.discriminator !== '0' ? '#' + interaction.user.discriminator : '')
		const userExecuteCommandAvatarURL = interaction.user.displayAvatarURL({ dynamic: true });

		// await interaction.reply(`User name: ${username}`);

		const embed = {
			'color': 0x000128,
			'author': {
				'name': username,
				'icon_url': avatarURL
			},
			'thumbnail': {
				'url': avatarURL,
			},
			'fields': [
				{
					'name': ':id:',
					'value': userId,
					'inline': true
				},
				{
					'name': 'Apodo',
					'value': nickname,
					'inline': true
				},
				{
					'name': 'Creación de cuenta',
					'value': toUTCDate(createdAt),  
				},
				{
					'name': 'Fecha de ingreso',
					'value': toUTCDate(joinedAt),   
				},
				{
					'name': 'Roles',
					'value': roles
				}
			],
			'timestamp': new Date(),
			'footer': {
				'text': userExecuteCommand + ' | /user',
				'icon_url': userExecuteCommandAvatarURL,
			}
		};
		await interaction.reply({ embeds: [embed]});
	},
};
