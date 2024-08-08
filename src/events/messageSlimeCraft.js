import { Events, Message } from 'discord.js';

module.exports = {
	name: Events.MessageCreate,
  once: false,
  /**
   * @param {Message} message 
   */
	async execute(message) {
    if(message.author.bot) return;
    if(message.guildId !== "778926791339278357") return;

    // Canal de puntos
    if(message.channel == "939171673012318208") {
      // Solo se permiten ...
      let allowMsg = ["...", "…"]
      if(!allowMsg.includes(message.content)) {
        let messageResponse = await message.reply(`En este canal solo se permite "..."`);
        await message.delete();
        setTimeout(async () => { await messageResponse.delete()}, 2000);
        return
      }

      // El mismo usuario no puede enviar mas de una vez seguida
      const dataChannel = await message.channel.fetch(true)
      /**
       * @typedef {Object.<string, Message>} Collection
       */
      /**
       * @type {Collection}
       */
      const historyMessage = await dataChannel.messages.fetch({limit: 100, cache: false, before: message.id});
      /**
       * @type {Message}
       */
      const lastMessage = historyMessage.map(x => x).filter(x => !x.author.bot)[0]
      if(lastMessage?.author.id == message.author.id) {
        let messageResponse = await message.reply(`No puedes escribir seguido`);
        await message.delete();
        setTimeout(async () => { await messageResponse.delete()}, 2000);
        return;
      }
    }

    // if(message.author.id === "407503165051895809" && message.toString().startsWith("!")) {
    //   const client = message.client
    //   const msg = message.toString().substring(1)
    //   const cmd = msg.split(" ")[0]
    //   const userId = msg.split(" ")[1]
    //   if (cmd == "aislar") {
    //     const guild = await client.guilds.fetch(message.guildId);
    //     const member = await guild.members.fetch(userId);
    //     member?.timeout( 7 * 24 * 60 * 60 * 1000, "Con TecnoRed no se juega...").then(console.log)
    //     message.reply({
    //       content: `Comando ejecutado...`,
    //       ephemeral: true,
    //     })
    //   }
    // }
	},
};