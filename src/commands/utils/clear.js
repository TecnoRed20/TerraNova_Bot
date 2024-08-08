import { SlashCommandBuilder, CommandInteraction, PermissionFlagsBits, User, ChannelType, GuildMessageManager } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Elimina mensajes del canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de mensajes a borrar")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    ),

  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    /**
     * @type {int}
     */
    const msgAmount = interaction.options.getInteger("cantidad");

    if (msgAmount > 0) {
      interaction.channel.bulkDelete(msgAmount, true).then(() => {
        return interaction.reply({
          content: `Se eliminaron ${msgAmount} mensajes :broom:`,
          ephemeral: true,
        });
      });
    }
  },
};
