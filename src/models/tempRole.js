import { model, Schema } from 'mongoose'

const tempRole = new Schema({
  guildId: { type: String, required: true },
  roleId: { type: String, required: true },
  userId: { type: String, required: true },
  expireAt: { type: Date, required: true },
});

export default model('TempRole', tempRole);