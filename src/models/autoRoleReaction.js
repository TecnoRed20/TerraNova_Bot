const { model, Schema } = require('mongoose')

const autoRoleReaction = new Schema({
  guildId: { type: String, required: true },
  roleId: { type: String, required: true },
  emoji: { type: String, required: true },
});

module.exports = model('AutoRoleReaction', autoRoleReaction);