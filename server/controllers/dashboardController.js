import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';
import { Booking, Station, User } from '../models/index.js';

const todayStr = () => new Date().toISOString().slice(0, 10);

const dateNDaysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

// @desc    Dashboard summary stats
// @route   GET /api/dashboard/stats
// @access  Admin/Staff
export const getStats = asyncHandler(async (req, res) => {
  const today = todayStr();

  const todaysBookings = await Booking.findAll({ where: { date: today } });
  const todaysBookingsCount = todaysBookings.length;

  const todaysRevenue = todaysBookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  // Occupancy: booked hours today vs total available station-hours (13h window)
  const activeStations = await Station.count({ where: { status: 'active' } });
  const OPEN_HOURS = 13; // 10:00–23:00
  const bookedHours = todaysBookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => {
      const [sh, sm] = b.startTime.split(':').map(Number);
      const [eh, em] = b.endTime.split(':').map(Number);
      return sum + (eh * 60 + em - (sh * 60 + sm)) / 60;
    }, 0);
  const capacity = activeStations * OPEN_HOURS;
  const occupancyRate = capacity > 0 ? Math.round((bookedHours / capacity) * 100) : 0;

  const totalCustomers = await User.count({ where: { role: 'customer' } });

  res.json({
    todaysBookingsCount,
    todaysRevenue,
    occupancyRate,
    totalCustomers,
    activeStations,
  });
});

// @desc    Revenue for the last 7 days
// @route   GET /api/dashboard/revenue-7d
// @access  Admin/Staff
export const getRevenue7d = asyncHandler(async (req, res) => {
  const start = dateNDaysAgo(6);
  const bookings = await Booking.findAll({
    where: { date: { [Op.gte]: start }, paymentStatus: 'paid' },
  });

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = dateNDaysAgo(i);
    const revenue = bookings
      .filter((b) => b.date === d)
      .reduce((sum, b) => sum + b.totalPrice, 0);
    days.push({ date: d, revenue });
  }
  res.json(days);
});
