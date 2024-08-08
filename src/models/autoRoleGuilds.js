import { model, Schema } from 'mongoose'

const autoRoleGuild = new Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String },
});

export default model('AutoRoleGuild', autoRoleGuild);