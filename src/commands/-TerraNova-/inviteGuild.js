import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  InteractionCollector,
  BaseGuildTextChannel,
  ComponentType,
  CommandInteraction
} from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite-guild')
    .setDescription('Permite generar un enlace de invitación para el servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    if (interaction.user.id != "407503165051895809") {
      await interaction.reply({
        content: `Este comando solo lo puede ejecutar el dueño del bot`,
        ephemeral: true,
      });
    }
    else {   // ********************************************** \\
      /**
       * @typedef {Object} GuildInfo
       * @property {string} label - La etiqueta del objeto.
       * @property {string} value - El valor del objeto.
       */
      /**
       * @type {GuildInfo[]}
       */
      const allGuilds = interaction.client.guilds.cache
        .map((guild, id) => {
          if (id !== "428709689073729537") // Ignore TerraNova
            return {
              label: guild.name,
              value: guild.id
            }
          else
            return null
        })
        .filter(x => x != null);

      if (allGuilds.length == 0) {
        return interaction.reply({
          content: `El bot está solo en TerraNova`,
          ephemeral: true,
        });
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(interaction.id)
        .setPlaceholder("Seleccione el servidor para generar un enlace de invitación")
        .setMinValues(0)
        .setMaxValues(1)
        .addOptions(allGuilds.map((guild) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(guild.label)
            .setDescription("   ")
            .setValue(guild.value)
        ));

      const actionRow = new ActionRowBuilder().addComponents(selectMenu);

      /**
       * @type {BaseGuildTextChannel}
       */
      const replay = await interaction.reply({
        components: [actionRow]
      });

      /**
       * @type {InteractionCollector}
       */
      const collector = replay.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
        time: 15_000,
      })


      collector.on('collect', async (interaction_) => {
        const guild_to_invite = interaction.client.guilds.cache.get(interaction_.values[0]);
        // console.log(guild_to_leave);
        if (guild_to_invite == null)
          return interaction_.reply({
            content: `No se puedo encontrar ese servidor.`,
            ephemeral: true,
          });

        // Buscar un canal de texto donde el bot tenga permisos para crear invitaciones
        const channel = guild_to_invite.channels.cache.find(ch => 
          ch.isTextBased() && 
          ch.permissionsFor(guild_to_invite.members.me)?.has(PermissionFlagsBits.CreateInstantInvite)
        );

        if (!channel) {
          return interaction_.reply({
            content: `No se pudo encontrar un canal válido para crear la invitación en ${guild_to_invite.name}`,
            ephemeral: true,
          });
        }

        try {
          const invite = await channel.createInvite({
            maxAge: 15, // Expira a los 15 segundos
            maxUses: 1, // Solo se puede usar una vez
          });

          return interaction_.reply({
            content: `Enlace de invitación para **${guild_to_invite.name}**:\n${invite.url}`,
            ephemeral: true,
          });
        } catch (error) {
          console.error('Error creando invitación:', error);
          return interaction_.reply({
            content: `Error al generar el enlace de invitación para ${guild_to_invite.name}`,
            ephemeral: true,
          });
        }
      })
    }
  },
};