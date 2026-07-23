import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Booking extends Model {}

Booking.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    stationId: { type: DataTypes.INTEGER, allowNull: false },
    // Booking day as YYYY-MM-DD (DATEONLY returns a plain date string)
    date: { type: DataTypes.DATEONLY, allowNull: false },
    // 24h "HH:mm" strings
    startTime: { type: DataTypes.STRING, allowNull: false },
    endTime: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
      defaultValue: 'pending',
    },
    paymentStatus: {
      type: DataTypes.ENUM('unpaid', 'paid', 'refunded'),
      defaultValue: 'unpaid',
    },
    totalPrice: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    isWalkIn: { type: DataTypes.BOOLEAN, defaultValue: false },
    notes: { type: DataTypes.STRING, defaultValue: '' },
  },
  {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    timestamps: true,
    indexes: [{ fields: ['stationId', 'date'] }],
  }
);

export default Booking;
