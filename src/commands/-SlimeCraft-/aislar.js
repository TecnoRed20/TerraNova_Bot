import {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
  User,
  ChannelType,
  GuildMessageManager,
} from "discord.js";
import eLog from "../../utils/eLog";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("aislar")
    .setDescription("Elimina mensajes del usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subCmd) =>
      subCmd
        .setName("tag")
        .setDescription("Tag del ususario")
        .addUserOption((option) =>
          option.setName("usertag").setDescription("Usuario").setRequired(true)
        )
    )
    .addSubcommand((subCmd) =>
      subCmd
        .setName("id")
        .setDescription("Id del usuario")
        .addStringOption((option) =>
          option.setName("userid").setDescription("Usuario").setRequired(true)
        )
    ),
  
  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const Tag = interaction.options.getUser("usertag");
    const Id = interaction.options.get("userid");
    const userID = Tag ? Tag.id + "" : Id.value;
    const displayName = Tag ? Tag.displayName : userID;

    const channels = interaction.client.channels.cache;

    let messageResponse = await interaction.reply({
      content: `Se estan eliminando los mensajes de: ${displayName}`,
    });

    /**
     * @param {GuildMessageManager} messageManager
     */
    const fetchLast600 = async (messageManager) => {
      let iter = 0;
      let fetched;
      let lastId = null;
      while (iter <= 5) {
        fetched = await messageManager.fetch({
          limit: 100,
          cache: false,
          before: lastId,
        });
        lastId = fetched?.at(fetched.size - 1)?.id
          ? fetched?.at(fetched.size - 1)?.id
          : lastId;
        fetched.forEach(async (message) => {
          if (message.deletable && message.author.id == userID) {
            try {
              await message.delete();
            } catch (error) {
              return true;
            }
          }
        });
        iter++;
      }
    };

    const textTypes = [
      ChannelType.GuildText,
      ChannelType.PublicThread,
      ChannelType.PrivateThread,
    ];
    channels.forEach(async (channel) => {
      const dataChannel = await channel.fetch(true);
      if (textTypes.includes(dataChannel.type))
        await fetchLast600(dataChannel.messages);
    });

    // Un solo canal
    // const dataChannel = await channels.at(0).fetch(true)
    // await fetchLast600(dataChannel.messages)

    messageResponse.edit(
      `Se eliminaron los mensajes de: ${displayName}\nOperacion terminada 😄`
    );

    const guild = interaction.guild;
    const userMute = await guild.members.fetch(userID);
    // Aplica Mute
    if (interaction.guildId == "778926791339278357") {
      const roles = guild.roles;
      const muteRole = await roles.fetch("1122363295626711110", {
        cache: true,
      });
      try {
        userMute.roles.add(muteRole);
      } catch (err) {
        eLog("Clear MSG & Mute (Mute): ", err)
        return true;
      }
    }
    // Aisla el usuario durante 3 dias
    try {
      userMute.timeout(3 * 24 * 60 * 60 * 1000)
    } catch (err) {
      eLog("Clear MSG & Mute (Timeout): ", err)
      return true;
    }
  },
};
