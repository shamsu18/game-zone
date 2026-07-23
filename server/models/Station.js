import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['PS5', 'PC', 'VR', 'Pool', 'Snooker', 'Other'],
      required: true,
    },
    image: { type: String, default: '' },
    pricePerHour: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['active', 'maintenance'],
      default: 'active',
    },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

const Station = mongoose.model('Station', stationSchema);
export default Station;
