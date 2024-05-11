const { Events, Message } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
  once: false,
  /**
   * 
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
	},
};