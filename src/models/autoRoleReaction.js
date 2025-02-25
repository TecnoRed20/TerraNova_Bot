import { model, Schema } from 'mongoose'

const autoRoleReaction = new Schema({
  channelRef: { type: Schema.Types.ObjectId, ref: "AutoRole-Channel" },
  roleId: { type: String, required: true },
  emoji: { type: String, required: true },
});

export default model('AutoRole-Reaction', autoRoleReaction);