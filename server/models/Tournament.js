import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Tournament extends Model {}

Tournament.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    date: { type: DataTypes.DATE, allowNull: false },
    entryFee: { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0 } },
    bannerImage: { type: DataTypes.STRING, defaultValue: '' },
    status: {
      type: DataTypes.ENUM('upcoming', 'ongoing', 'finished'),
      defaultValue: 'upcoming',
    },
  },
  {
    sequelize,
    modelName: 'Tournament',
    tableName: 'tournaments',
    timestamps: true,
  }
);

export default Tournament;
