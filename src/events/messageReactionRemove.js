import { Events, User, PartialUser, MessageReaction, PartialMessageReaction } from 'discord.js'; 
import autoRoleReaction from '../models/autoRoleReaction';
import autoRoleGuilds from '../models/autoRoleGuilds'
import eLog from '../eLog';

module.exports = {
	name: Events.MessageReactionRemove,
  once: false,
  /**
   * @param {MessageReaction | PartialMessageReaction} reaction 
   * @param {User | PartialUser} user 
   */
	async execute(reaction, user) {
		if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        eLog('Algo salió mal al obtener el mensaje:', error);
        return;
      }
    }

    if(user.bot) return;
    const guild = reaction.message.guild
    const guildDB = await autoRoleGuilds.findOne({guildId: guild.id, channelId: reaction.message.channelId})
    if(!guildDB) return;

    const emoji = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name
    const data = await autoRoleReaction.findOne({guildId: guild.id, emoji: emoji})
    if(!data) return;
    
    const member = await guild.members.fetch(user.id)
    const role = await guild.roles.fetch(data.roleId)
    
    try {
      member.roles.remove(role)
    }
    catch(e) {
      return
    }
	},
};