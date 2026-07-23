import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, sequelize } from './config/db.js';
import './models/index.js'; // register models + associations

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  // Create/update tables to match the models. Use migrations for real prod.
  await sequelize.sync({ alter: process.env.DB_SYNC_ALTER === 'true' });
  console.log('✔ Database schema synced');

  app.listen(PORT, () => {
    console.log(`✔ GameZone BD API running on http://localhost:${PORT}`);
  });
};

start();
