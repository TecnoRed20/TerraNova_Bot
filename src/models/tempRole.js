const { model, Schema } = require('mongoose')

const tempRole = new Schema({
  guildId: { type: String, required: true },
  roleId: { type: String, required: true },
  userId: { type: String, required: true },
  expireAt: { type: Date, required: true },
});

module.exports = model('TempRole', tempRole);