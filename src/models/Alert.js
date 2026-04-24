import { model, Schema } from 'mongoose';

const alertSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  thresholdPrice: {
    type: Number,
    required: true,
    min: 0.01
  }
}, {
  timestamps: true
});

// Índice único: un usuario solo puede tener una alerta por producto
alertSchema.index({ product: 1, userId: 1 }, { unique: true });

export default model('Alert', alertSchema);
