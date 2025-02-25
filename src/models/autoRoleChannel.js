import { model, Schema } from 'mongoose'

const autoRoleChannel = new Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String },
  status: {type: Boolean, default: false},
});

export default model('AutoRole-Channel', autoRoleChannel);