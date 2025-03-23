import { Events, User, PartialUser, MessageReaction, PartialMessageReaction } from 'discord.js'; 
import AutoRoleReaction from '../models/autoRoleReaction';
import AutoRoleChannel from '../models/autoRoleChannel';
import eLog from '../utils/eLog';

module.exports = {
	name: Events.MessageReactionAdd,
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
    const guild = reaction.message.guild;
    const channelId = reaction.message.channelId;
    const messageId = reaction.message.id;
    const reactChannel = await AutoRoleChannel.findOne({guildId: guild.id, channelId, messageId });
    if(!reactChannel) return;
    const channelRef = reactChannel._id;
    
    const emoji = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name
    const allReactionDB = await AutoRoleReaction.find({channelRef: channelRef, emoji: emoji})
    if(!allReactionDB || allReactionDB.length == 0) {
      await reaction.remove();
      return;
    }
    
    const member = await guild.members.fetch(user.id)
    const roles = await Promise.all(
      allReactionDB.map(reactionDB => guild.roles.fetch(reactionDB.roleId))
    );
    
    try {
      await member.roles.add(roles)
    }
    catch(e) {
      return
    }
	},
};