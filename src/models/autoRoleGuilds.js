const { model, Schema } = require('mongoose')

const autoRoleGuild = new Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String },
});

module.exports = model('AutoRoleGuild', autoRoleGuild);