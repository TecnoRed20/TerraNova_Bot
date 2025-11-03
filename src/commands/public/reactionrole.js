import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, CommandInteraction, MessageFlags, disableValidators } from 'discord.js';
import AutoRoleChannel from '../../models/autoRoleChannel';
import AutoRoleReaction from '../../models/autoRoleReaction';
import eLog from '../../utils/eLog';

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
	
  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { options, guild } = interaction;
    const subCommandGroup = options.getSubcommandGroup();
    const subCommand = options.getSubcommand();

    if(subCommandGroup == 'channel') {
      if(subCommand == 'show') {
        let allChannel = await AutoRoleChannel.find({guildId: guild.id})
        if(!allChannel || allChannel.length == 0 ) {
          return interaction.reply({
            content: `No se encontró información para este servidor.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        const activeChannel = allChannel.find(x => x.status);
        const disableChannels = allChannel.filter(x => !x.status);

        const descActiveChannel = activeChannel ? 
          activeChannel.messageId ? 
            `https://discord.com/channels/${activeChannel.guildId}/${activeChannel.channelId}/${activeChannel.messageId}` :
            `<#${activeChannel.channelId}>` : 
          null

        const embedActiveChannel = new EmbedBuilder()
        .setColor(0x4CAF50)
        .setTitle("Activo")
        .setDescription(descActiveChannel)
        .setFooter({ text: interaction.user.username + (interaction.user.discriminator !== '0' ? '#' + interaction.user.discriminator : '') + ' | /reaction-role channel show', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
        
        const descDisableChannels = disableChannels.map(disableChannel => {
          if(disableChannel.messageId) {
            return `https://discord.com/channels/${disableChannel.guildId}/${disableChannel.channelId}/${disableChannel.messageId}`
          }
          return `<#${disableChannel.channelId}>`
        });

        const allDescDisableReactionChannel = descDisableChannels.join("\n");

        const embedDisableChannels = new EmbedBuilder()
        .setColor(0xF44336)
        .setTitle("Desactivos")
        .setDescription(allDescDisableReactionChannel != "" ? allDescDisableReactionChannel : null)
        .setFooter({ text: interaction.user.username + (interaction.user.discriminator !== '0' ? '#' + interaction.user.discriminator : '') + ' | /reaction-role channel show', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        return interaction.reply({
          embeds: [embedActiveChannel, embedDisableChannels],
          flags: MessageFlags.Ephemeral,
        });
      }
      else if(subCommand == 'set') {
        const channel = options.getChannel('channel')

        let activeChannel = await AutoRoleChannel.findOne({guildId: guild.id, status: true})
        let disableChannel =  await AutoRoleChannel.findOne({guildId: guild.id, channelId: channel.id, status: false})
        
        if(disableChannel) {
          disableChannel.status = true;
          await disableChannel.save()
        }
        else {
          new AutoRoleChannel({
            guildId: guild.id,
            channelId: channel.id,
            status: true,
          }).save()
        }

        if(activeChannel){
          activeChannel.status = false;
          await activeChannel.save()
        }

        return interaction.reply({
          content: `Se establecio el canal: ${channel}`,
          flags: MessageFlags.Ephemeral,
        });
      }
      else {
        return interaction.reply({
          content: `Comando no soportado`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
    else if(subCommandGroup == 'reaction')
    {
      if(subCommand == 'show') {
        const activeChannel = await AutoRoleChannel.findOne({guildId: guild.id, status: true})
        if(!activeChannel) {
          return interaction.reply({
            content: `No se encontró un canal activo para este servidor.`,
            flags: MessageFlags.Ephemeral,
          });
        }
        const activeChannelRef = activeChannel._id;
        const allReaction = await AutoRoleReaction.find({channelRef: activeChannelRef})
        
        const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Reaction Role')
        .setFooter({ text: interaction.user.username + (interaction.user.discriminator !== '0' ? '#' + interaction.user.discriminator : '') + ' | /reaction-role reaction show', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
        
        let reactionAvilable = ''
        if(allReaction.length > 0) {
          const groupedReactions = {};

          allReaction.forEach(reaction => {
            if (!groupedReactions[reaction.emoji]) {
              groupedReactions[reaction.emoji] = [];
            }
            groupedReactions[reaction.emoji].push(`<@&${reaction.roleId}>`);
          });

          reactionAvilable = Object.entries(groupedReactions)
            .map(([emoji, roles]) => `${emoji} -> ${roles.join(', ')}`)
            .join('\n');
        }
        else {
          reactionAvilable = '**No hay reaciones**'
        }
        embed.setDescription(reactionAvilable)

        return interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      }
      else if(subCommand == 'print') {
        const activeChannel = await AutoRoleChannel.findOne({guildId: guild.id, status: true})
        if(!activeChannel) {
          return interaction.reply({
            content: `No se encontró un canal activo para este servidor.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        const channel = await interaction.guild.channels.fetch(activeChannel.channelId);
        if(!channel) {
          return interaction.reply({
            content: `No se encontro el canal.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        if(activeChannel.messageId) {
          const message = await channel.messages.cache.find(msg => msg.id === activeChannel.messageId);
          if(message)
            await message.delete()
        }
    
        const allReaction = await AutoRoleReaction.find({channelRef: activeChannel._id})
        
        const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Reaction Role')
        
        let reactionAvilable = ''
        if(allReaction.length > 0) {
          const groupedReactions = {};

          allReaction.forEach(reaction => {
            if (!groupedReactions[reaction.emoji]) {
              groupedReactions[reaction.emoji] = [];
            }
            groupedReactions[reaction.emoji].push(`<@&${reaction.roleId}>`);
          });

          reactionAvilable = Object.entries(groupedReactions)
            .map(([emoji, roles]) => `${emoji} -> ${roles.join(', ')}`)
            .join('\n');
        }
        else {
          reactionAvilable = '**No hay reaciones**'
        }
        embed.setDescription(reactionAvilable)

        const message = await channel.send({ embeds: [embed] });

        activeChannel.messageId = message.id
        await activeChannel.save()

        // Añadir reacciones
        allReaction.forEach(async reaction => {
          await message.react(reaction.emoji).catch(err => {})
        })

        return interaction.reply({
          content: 'Operación realizada',
          flags: MessageFlags.Ephemeral,
        });
      }
      else if(subCommand == 'add') {
        const emoji = options.getString('emoji')
        const role = options.getRole('role')

        const activeChannel = await AutoRoleChannel.findOne({guildId: guild.id, status: true});
        if(!activeChannel) {
          return interaction.reply({
            content: `No se encontró un canal activo para este servidor.`,
            flags: MessageFlags.Ephemeral,
          });
        }
        const channelRef = activeChannel._id;

        const existReaction = await AutoRoleReaction.findOne({channelRef, roleId: role.id})
        if(existReaction) {
          return interaction.reply({
            content: `Ya existe una reacción para este rol en el canal activo.`,
            flags: MessageFlags.Ephemeral,
          });
        }
        else {
          new AutoRoleReaction({
            channelRef,
            roleId: role.id,
            emoji: emoji,
          }).save()

          return interaction.reply({
            content: `Se añadio el emoji ${emoji} para el rol ${role} en el canal activo <#${activeChannel.channelId}>`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }
      else if(subCommand == 'remove') {
        const role = options.getRole('role')

        const activeChannel = await AutoRoleChannel.findOne({guildId: guild.id, status: true});
        if(!activeChannel) {
          return interaction.reply({
            content: `No se encontró un canal activo para este servidor.`,
            flags: MessageFlags.Ephemeral,
          });
        }
        const channelRef = activeChannel._id;

        const reaction = await AutoRoleReaction.findOneAndDelete({channelRef, roleId: role.id})
        if (reaction) {
          return interaction.reply({
            content: `Se eliminó la reacción vinculada al rol ${role}`,
            flags: MessageFlags.Ephemeral,
          });
        } else {
          return interaction.reply({
            content: `No se encontró la reacción vinculada al rol ${role}`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }
      else {
        return interaction.reply({
          content: `Comando no soportado`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
    else {
      return interaction.reply({
        content: `Comando recibido :eyes:`,
        flags: MessageFlags.Ephemeral,
      });
    }

	},
};