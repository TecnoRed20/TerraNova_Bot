const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(interaction) {
    setInterval(async () => {
      const options = [
        {
          type: ActivityType.Watching,
          text: `${interaction.guilds?.cache?.size} servidor/es`,
          status: "online",
        },
        {
          type: ActivityType.Listening,
          text: "comandos",
          status: "idle",
        },
        {
          type: ActivityType.Playing,
          text: "Discord.js",
          status: "dnd",
        },
      ];

      const option = Math.floor(Math.random() * options.length);

      interaction.user.setPresence({
        activities: [{
          name: options[option].text,
          type: options[option].type,
        }],
        status: options[option].status,
      });
    }, 15 * 1000);
    console.log(`Estoy listo! Conectado como ${interaction.user.tag}`);

    // Cargar Roles Temporales desde BBDD
  },
};
