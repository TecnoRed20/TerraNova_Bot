import { model, Schema } from 'mongoose'

const mailPackageTracker = new Schema({
  companyId: { type: String, required: true },
  packageId: { type: String, required: true },
  userId: { type: String, required: true },
  intervalId: { type: String, required: false, default: null },
  expiredAt: { type: Date, required: false, default: null },
});

export default model('MailPackageTracker', mailPackageTracker);