import { model, Schema } from 'mongoose';

const priceHistorySchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  price: {
    type: Number,
    default: null
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  inStock: {
    type: Boolean,
    required: true
  },
  merchantSlug: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Índice para búsquedas rápidas
priceHistorySchema.index({ product: 1, timestamp: -1 });

export default model('PriceHistory', priceHistorySchema);
