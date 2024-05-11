const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const autoRoleGuilds = require('../../models/autoRoleGuilds');
const autoRoleReaction = require('../../models/autoRoleReaction');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reaction-role')
		.setDescription('Para configurar la reación y asignación de roles')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommandGroup(channelGroup =>
      channelGroup.setName('channel')
      .setDescription('Controla el canal donde el bot administrará las reacciones')
      .addSubcommand(show =>
        show.setName('show')
        .setDescription('Muestra el canal configurado')
      )
      .addSubcommand(set =>
        set.setName('set')
        .setDescription('Establece el canal')
        .addChannelOption(opcion =>
          opcion.setName('channel')
          .setDescription('Canal')
          .setRequired(true)
        )
      )
    )
    .addSubcommandGroup(reaction =>
      reaction.setName('reaction')
      .setDescription('Controla las reacciones asociadas el mensaje')
      .addSubcommand(show =>
        show.setName('show')
        .setDescription('Muestra las reacciones actuales')
      )
      .addSubcommand(print =>
        print.setName('print')
        .setDescription('Muestra el embed en el canal configurado')
      )
      .addSubcommand(add =>
        add.setName('add')
        .setDescription('Añade una nueva reacción')
        .addStringOption(emoji =>
          emoji.setName('emoji')
          .setDescription('Emoji a usar')
          .setRequired(true)
        )
        .addRoleOption(role =>
          role.setName('role')
          .setDescription('Rol a asignar')
          .setRequired(true)
        )
      )
      .addSubcommand(remove =>
        remove.setName('remove')
        .setDescription('Elimina una racción de la lista')
        .addRoleOption(role =>
          role.setName('role')
          .setDescription('Rol a eliminar de la lista')
          .setRequired(true)
        )
      )
    ),
	async execute(interaction) {
    const { options, guild } = interaction;
    const subCommandGroup = options.getSubcommandGroup();
    const subCommand = options.getSubcommand();
    //console.log("Sub Command Group: " + subCommandGroup)
    //console.log("Sub Command: " + subCommand)


    if(subCommandGroup == 'channel') {
      if(subCommand == 'show') {
        let data = await autoRoleGuilds.findOne({guildId: guild.id})
        if(!data)
          return interaction.reply({
            content: `No hay información de este servidor: ${guild.id}`,
            ephemeral: true,
          });
        return interaction.reply({
          content: `El canal establecido es: <#${data.channelId}>`,
          ephemeral: true,
        });
      }
      else if(subCommand == 'set') {
        const channel = options.getChannel('channel')

        let data = await autoRoleGuilds.findOne({guildId: guild.id})
        if(data){
          data.channelId = channel.id
          await data.save()
        }
        else {
          new autoRoleGuilds({
            guildId: guild.id,
            channelId: channel.id
          }).save()
        }
        return interaction.reply({
          content: `Se establecio el canal: ${channel}`,
          ephemeral: true,
        });
      }
      else {
        return interaction.reply({
          content: `Comando no soportado`,
          ephemeral: true,
        });
      }
    }
    else if(subCommandGroup == 'reaction')
    {
      if(subCommand == 'show') {
        const data = await autoRoleReaction.find({guildId: guild.id})
        const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Reaction Role')
        .setFooter({ text: interaction.user.username + (interaction.user.discriminator !== '0' ? '#' + interaction.user.discriminator : '') + ' | /reaction-role reaction show', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
        
        let reactionAvilable = ''
        if(data.length > 0) {
          reactionAvilable = data.map(reaction => {
            return `${reaction.emoji} - > <@&${reaction.roleId}>`
          }).join('\n')
        }
        else {
          reactionAvilable = '**No hay reaciones**'
        }
        embed.setDescription(reactionAvilable)

        return interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }
      else if(subCommand == 'print') {
        const guildDB = await autoRoleGuilds.findOne({guildId: guild.id})
        const channel = await interaction.guild.channels.fetch(guildDB.channelId);
        if(!channel) {
          return interaction.reply({
            content: `Canal no encontrado...`,
            ephemeral: true,
          });
        }

        if(guildDB.messageId) {
          const message = await channel.messages.cache.find(msg => msg.id === guildDB.messageId);
          if(message)
            message.delete()
        }
    
        const data = await autoRoleReaction.find({guildId: guild.id})
        const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Reaction Role')
        
        let reactionAvilable = ''
        if(data.length > 0) {
          reactionAvilable = data.map(reaction => {
            return `${reaction.emoji} - > <@&${reaction.roleId}>`
          }).join('\n')
        }
        else {
          reactionAvilable = '**No hay reaciones**'
        }
        embed.setDescription(reactionAvilable)

        const message = await channel.send({ embeds: [embed] });

        guildDB.messageId = message.id
        await guildDB.save()

        // Añadir reacciones
        data.forEach(async reaction => {
          await message.react(reaction.emoji).catch(err => {})
        })

        return interaction.reply({
          content: 'Operación realizada',
          ephemeral: true,
        });
      }
      else if(subCommand == 'add') {
        const emoji = options.getString('emoji')
        const role = options.getRole('role')
        const exist = await autoRoleReaction.find({guildId: guild.id, roleId: role.id})
        if(exist.length > 0) {
          return interaction.reply({
            content: `Ya existe una reacción para este rol`,
            ephemeral: true,
          });
        }
        else{
          new autoRoleReaction({
            guildId: guild.id,
            roleId: role.id,
            emoji: emoji,
          }).save()
          return interaction.reply({
            content: `Se añadio el emoji ${emoji} para el rol ${role}`,
            ephemeral: true,
          });
        }
      }
      else if(subCommand == 'remove') {
        const role = options.getRole('role')
        const data = await autoRoleReaction.findOneAndDelete({guildId: guild.id, roleId: role.id})
        if (data) {
          return interaction.reply({
            content: `Se eliminó el rol ${role}`,
            ephemeral: true,
          });
        } else {
          return interaction.reply({
            content: `No se encontró el rol ${role}`,
            ephemeral: true,
          });
        }
      }
      else {
        return interaction.reply({
          content: `Comando no soportado`,
          ephemeral: true,
        });
      }
    }
    else {
      return interaction.reply({
        content: `Comando recibido :eyes:`,
        ephemeral: true,
      });
    }

	},
};