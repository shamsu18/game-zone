import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Station extends Model {}

Station.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM('PS5', 'PC', 'VR', 'Pool', 'Snooker', 'Other'),
      allowNull: false,
    },
    image: { type: DataTypes.STRING, defaultValue: '' },
    pricePerHour: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    status: {
      type: DataTypes.ENUM('active', 'maintenance'),
      defaultValue: 'active',
    },
    description: { type: DataTypes.TEXT, defaultValue: '' },
  },
  {
    sequelize,
    modelName: 'Station',
    tableName: 'stations',
    timestamps: true,
  }
);

export default Station;
