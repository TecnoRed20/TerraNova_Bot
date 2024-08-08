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
    .setName('leave-guild')
    .setDescription('Permite sacar al bot de un server')
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
          if (id !== "428709689073729537")
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
        .setPlaceholder("Seleccione el servidor ha abandonar")
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


      collector.on('collect', (interaction_) => {
        const guild_to_leave = interaction.client.guilds.cache.get(interaction_.values[0]);
        // console.log(guild_to_leave);
        if (guild_to_leave == null)
          return interaction_.reply({
            content: `No se puedo encontrar ese servidor.`,
            ephemeral: true,
          });

        guild_to_leave.leave()
        return interaction_.reply({
          content: `Saliste del servidor ${guild_to_leave.name}`,
        });
      })
    }
  },
};