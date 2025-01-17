import { Events, Message, MessageActivityType } from 'discord.js';
import eLog from "../utils/eLog"
import timestamp from '../utils/timestamp';

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

    // Canal de Skins (Halloween)
    if(message.channel == "1298389225128857630") {
      if(message.attachments.size == 0) return;
      try {
        await message.react('<:x_zyes:1228364017223860225>')
        await message.react('<a:ahw_fantasma:1297660527597846549>')
        await message.react('<:x_zno:1228364030469607565>')
      } catch (error) {
        eLog("SlimeCraft - Halloween - " + error)
      }
    }

    if(message.author.id === "407503165051895809" && message.toString().startsWith("!")) {
      const client = message.client
      const msg = message.toString().substring(1)
      const guildId = message.guildId
      const cmd = msg.split(" ")[0]
      const userId = msg.split(" ")[1]
      let notify = false;
      if (cmd == "aislar") {
        notify = true;
        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);
        if(member) {
          member?.timeout( 7 * 24 * 60 * 60 * 1000, "Replanteate tu comportamiento")
            .then(res => {
              eLog("Usuario " + member.displayName + " aislado por 7 dias")
            })
        }
        else {
          eLog("No se encontro el usuario con Id: " + userId)
        }
      }

      if(notify) {
        const user = await client.users.fetch("407503165051895809") // TecnoRed
        const mdChannel = await user.createDM(true);
  
        mdChannel.send(`${timestamp()} [Slimecraft] Comando ejecutado: ${cmd}`)
        await message.delete()
      }
    }
	},
};