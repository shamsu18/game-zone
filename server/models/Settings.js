import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

// Single-row table holding editable site-wide content (id is always 1).
class Settings extends Model {
  // Convenience: always work with the single settings row.
  static async getSingleton() {
    let doc = await this.findByPk(1);
    if (!doc) doc = await this.create({ id: 1 });
    return doc;
  }
}

Settings.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
    siteName: { type: DataTypes.STRING, defaultValue: 'GameZone BD' },
    logoUrl: { type: DataTypes.STRING, defaultValue: '' },
    contactPhone: { type: DataTypes.STRING, defaultValue: '' },
    contactEmail: { type: DataTypes.STRING, defaultValue: '' },
    address: { type: DataTypes.TEXT, defaultValue: '' },
    openingHours: { type: DataTypes.STRING, defaultValue: '10:00 AM – 11:00 PM' },
    mapEmbedUrl: { type: DataTypes.TEXT, defaultValue: '' },
    // JSON columns for nested / list content
    socialLinks: {
      type: DataTypes.JSON,
      defaultValue: { facebook: '', instagram: '', whatsapp: '' },
    },
    hero: {
      type: DataTypes.JSON,
      defaultValue: {
        title: 'Level Up Your Game at GameZone BD',
        subtitle: 'Book PS5, PC, VR & Pool tables by the hour. Play. Compete. Win.',
        image: '',
        ctaText: 'Book Now',
      },
    },
    offers: { type: DataTypes.JSON, defaultValue: [] },
    testimonials: { type: DataTypes.JSON, defaultValue: [] },
    galleryImages: { type: DataTypes.JSON, defaultValue: [] },
  },
  {
    sequelize,
    modelName: 'Settings',
    tableName: 'settings',
    timestamps: true,
  }
);

export default Settings;
