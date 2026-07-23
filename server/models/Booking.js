import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    // Stored as a plain date string (YYYY-MM-DD) for the booking day
    date: { type: String, required: true },
    // 24h "HH:mm" strings
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    totalPrice: { type: Number, required: true, min: 0 },
    // "walk-in" bookings are created by staff/admin for on-site customers
    isWalkIn: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Helpful compound index for availability lookups
bookingSchema.index({ station: 1, date: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
