import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    durationHours: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Package = mongoose.model('Package', packageSchema);
export default Package;
