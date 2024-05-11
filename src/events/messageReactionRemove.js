const { Events } = require('discord.js');
const autoRoleReaction = require('../models/autoRoleReaction');
const autoRoleGuilds = require('../models/autoRoleGuilds');

module.exports = {
	name: Events.MessageReactionRemove,
  once: false,
	async execute(reaction, user) {
		if (reaction.partial) {
      // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('Something went wrong when fetching the message:', error);
        // Return as `reaction.message.author` may be undefined/null
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