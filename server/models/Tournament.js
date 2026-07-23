import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    entryFee: { type: Number, default: 0, min: 0 },
    bannerImage: { type: String, default: '' },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'finished'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

const Tournament = mongoose.model('Tournament', tournamentSchema);
export default Tournament;
