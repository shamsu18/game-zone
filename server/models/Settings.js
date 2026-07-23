import mongoose from 'mongoose';

// Single-document collection holding editable site-wide content.
const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'GameZone BD' },
    logoUrl: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    address: { type: String, default: '' },
    openingHours: { type: String, default: '10:00 AM – 11:00 PM' },
    mapEmbedUrl: { type: String, default: '' },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },
    // CMS content
    hero: {
      title: { type: String, default: 'Level Up Your Game at GameZone BD' },
      subtitle: {
        type: String,
        default: 'Book PS5, PC, VR & Pool tables by the hour. Play. Compete. Win.',
      },
      image: { type: String, default: '' },
      ctaText: { type: String, default: 'Book Now' },
    },
    offers: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        image: { type: String, default: '' },
      },
    ],
    testimonials: [
      {
        name: { type: String, default: '' },
        message: { type: String, default: '' },
        avatar: { type: String, default: '' },
      },
    ],
    galleryImages: [{ type: String }],
  },
  { timestamps: true }
);

// Convenience: always work with a single settings doc.
settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
