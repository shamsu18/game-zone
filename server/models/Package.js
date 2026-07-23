import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Package extends Model {}

Package.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    durationHours: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    discountPercent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    modelName: 'Package',
    tableName: 'packages',
    timestamps: true,
  }
);

export default Package;
