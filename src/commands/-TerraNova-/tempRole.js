import { SlashCommandBuilder, PermissionFlagsBits, Role, User, CommandInteraction } from 'discord.js';
import tempRole from '../../models/tempRole';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('temp-role')
		.setDescription('Dar roles temporales')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(option => 
      option
        .setName('user')
        .setDescription('Usuario')
        .setRequired(true)
    )
    .addRoleOption(option => 
      option
        .setName('role')
        .setDescription('Role')
        .setRequired(true)
    )
    .addIntegerOption(option => 
      option
        .setName('amount')
        .setDescription('Cantidad')
        .setRequired(true)
    )
    .addStringOption(option => 
      option
        .setName('unit')
        .setDescription('Unidad')
        .addChoices({name: "Segundo", value: "1000"})
        .addChoices({name: "Minuto", value: `${(60 * 1000)}`})
        .addChoices({name: "Hora", value:  `${(60 * 60 * 1000)}`})
        .addChoices({name: "Dia", value:  `${(24 * 60 * 60 * 1000)}`})
        .addChoices({name: "Mes", value:  `${(30 * 24 * 60 * 60 * 1000)}`})
        .setRequired(true)
    ),
  
  /**
   * @param {CommandInteraction} interaction 
   */
	async execute(interaction) {
    const guild = interaction.guild;
    /**
     * @type {User}
     */
    const user = interaction.options.getUser('user');
    /**
     * @type {Role} 
     */
    const role = interaction.options.getRole('role');
    const amount = interaction.options.getInteger('amount')
    const unit = interaction.options.getString('unit')
    const expireAt = new Date(Date.now() + amount * (parseInt(unit)));
    const member = await guild.members.fetch(user.id);

    const existTempRoleActive = await tempRole.exists({guildId: guild.id, userId: user.id, roleId: role.id, expireAt: { $gt: Date.now() }})

    if(existTempRoleActive) {
      return interaction.reply({
        content: 'Este usuario ya tiene este rol asigando',
        ephemeral: true,
      });
    }
    
    // Añadimos el Role
    if(!member.roles.cache.has(role.id)) {
      await member.roles.add(role.id)
    }
    else {
      return interaction.reply({
        content: 'Ya tiene el rol permanente',
        ephemeral: true,
      });
    }
    
    // Añadimos el registro
    await new tempRole({
      guildId: guild.id,
      userId: user.id,
      roleId: role.id,
      expireAt: expireAt,
    }).save()

    setTimeout(() => {
      // Eliminamos el Role
      member.roles.remove(role.id)
    }, amount * (parseInt(unit)))

    return interaction.reply({
      content: 'Se le dio el rol ya papa',
      ephemeral: true,
    });
	},
};