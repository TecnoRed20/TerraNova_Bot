import { model, Schema } from 'mongoose'

const autoRoleReaction = new Schema({
  guildId: { type: String, required: true },
  roleId: { type: String, required: true },
  emoji: { type: String, required: true },
});

export default model('AutoRoleReaction', autoRoleReaction);