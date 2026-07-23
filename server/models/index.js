import sequelize from '../config/db.js';
import User from './User.js';
import Station from './Station.js';
import Booking from './Booking.js';
import Package from './Package.js';
import Tournament from './Tournament.js';
import Settings from './Settings.js';

// ===== Associations =====

// Booking → User / Station (aliases match the frontend: b.user, b.station)
Booking.belongsTo(User, { as: 'user', foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Booking, { as: 'bookings', foreignKey: 'userId' });

Booking.belongsTo(Station, { as: 'station', foreignKey: 'stationId', onDelete: 'CASCADE' });
Station.hasMany(Booking, { as: 'bookings', foreignKey: 'stationId' });

// Tournament ↔ User (participants) many-to-many
Tournament.belongsToMany(User, {
  through: 'tournament_participants',
  as: 'participants',
  foreignKey: 'tournamentId',
  otherKey: 'userId',
});
User.belongsToMany(Tournament, {
  through: 'tournament_participants',
  as: 'tournaments',
  foreignKey: 'userId',
  otherKey: 'tournamentId',
});

export { sequelize, User, Station, Booking, Package, Tournament, Settings };
