import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';
import { Booking, Station, User } from '../models/index.js';
import { buildAvailability, overlaps, toMinutes } from '../utils/timeSlots.js';

// Fixed opening window used for slot generation. Adjust if hours change.
const OPEN = '10:00';
const CLOSE = '23:00';

// Standard includes so responses match the frontend shape (b.station, b.user)
const stationInclude = { association: 'station', attributes: ['id', 'name', 'type', 'image', 'pricePerHour'] };
const userInclude = { association: 'user', attributes: ['id', 'name', 'email', 'phone'] };

// @desc    Get available slots for a station on a date
// @route   GET /api/bookings/availability?station=&date=
// @access  Public
export const getAvailability = asyncHandler(async (req, res) => {
  const { station, date } = req.query;
  if (!station || !date) {
    res.status(400);
    throw new Error('station and date query params are required');
  }
  const stationDoc = await Station.findByPk(station);
  if (!stationDoc) {
    res.status(404);
    throw new Error('Station not found');
  }

  const existing = await Booking.findAll({ where: { stationId: station, date } });
  const slots = buildAvailability(existing, OPEN, CLOSE);
  res.json({ station: stationDoc, date, slots });
});

// Shared helper: verify a station is free for the interval, else throw.
const assertNoConflict = async (stationId, date, startTime, endTime, excludeId) => {
  const where = { stationId, date, status: { [Op.ne]: 'cancelled' } };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  const sameDay = await Booking.findAll({ where });
  const conflict = sameDay.some((b) =>
    overlaps(startTime, endTime, b.startTime, b.endTime)
  );
  if (conflict) {
    const err = new Error('This station is already booked for the selected time');
    err.statusCode = 409;
    throw err;
  }
};

// @desc    Create a booking for the current user
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req, res) => {
  const { station, date, startTime, endTime } = req.body;
  if (!station || !date || !startTime || !endTime) {
    res.status(400);
    throw new Error('station, date, startTime and endTime are required');
  }
  if (toMinutes(endTime) <= toMinutes(startTime)) {
    res.status(400);
    throw new Error('endTime must be after startTime');
  }

  const stationDoc = await Station.findByPk(station);
  if (!stationDoc) {
    res.status(404);
    throw new Error('Station not found');
  }
  if (stationDoc.status !== 'active') {
    res.status(400);
    throw new Error('This station is currently under maintenance');
  }

  try {
    await assertNoConflict(station, date, startTime, endTime);
  } catch (err) {
    res.status(err.statusCode || 409);
    throw err;
  }

  const hours = (toMinutes(endTime) - toMinutes(startTime)) / 60;
  const totalPrice = Math.round(hours * stationDoc.pricePerHour);

  const booking = await Booking.create({
    userId: req.user.id,
    stationId: station,
    date,
    startTime,
    endTime,
    totalPrice,
    status: 'pending',
    paymentStatus: 'unpaid',
  });

  const populated = await Booking.findByPk(booking.id, { include: [stationInclude] });
  res.status(201).json(populated);
});

// @desc    Create a walk-in booking (staff/admin)
// @route   POST /api/bookings/walk-in
// @access  Admin/Staff
export const createWalkInBooking = asyncHandler(async (req, res) => {
  const { station, date, startTime, endTime, customerName, customerPhone } = req.body;
  if (!station || !date || !startTime || !endTime) {
    res.status(400);
    throw new Error('station, date, startTime and endTime are required');
  }
  if (toMinutes(endTime) <= toMinutes(startTime)) {
    res.status(400);
    throw new Error('endTime must be after startTime');
  }

  const stationDoc = await Station.findByPk(station);
  if (!stationDoc) {
    res.status(404);
    throw new Error('Station not found');
  }

  try {
    await assertNoConflict(station, date, startTime, endTime);
  } catch (err) {
    res.status(err.statusCode || 409);
    throw err;
  }

  // Attribute the walk-in to a lightweight guest customer, else the staff user.
  let guest = null;
  if (customerPhone) {
    guest = await User.findOne({ where: { phone: customerPhone, role: 'customer' } });
    if (!guest) {
      guest = await User.create({
        name: customerName || 'Walk-in Guest',
        email: `guest_${Date.now()}@walkin.local`,
        phone: customerPhone,
        password: Math.random().toString(36).slice(2),
        role: 'customer',
      });
    }
  }

  const hours = (toMinutes(endTime) - toMinutes(startTime)) / 60;
  const totalPrice = Math.round(hours * stationDoc.pricePerHour);

  const booking = await Booking.create({
    userId: guest?.id || req.user.id,
    stationId: station,
    date,
    startTime,
    endTime,
    totalPrice,
    status: 'confirmed',
    paymentStatus: 'unpaid',
    isWalkIn: true,
    notes: customerName ? `Walk-in: ${customerName}` : 'Walk-in',
  });

  const populated = await Booking.findByPk(booking.id, {
    include: [
      { association: 'station', attributes: ['id', 'name', 'type'] },
      { association: 'user', attributes: ['id', 'name', 'phone'] },
    ],
  });
  res.status(201).json(populated);
});

// @desc    Get bookings of the current user
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.findAll({
    where: { userId: req.user.id },
    include: [{ association: 'station', attributes: ['id', 'name', 'type', 'image', 'pricePerHour'] }],
    order: [['date', 'DESC'], ['startTime', 'DESC']],
  });
  res.json(bookings);
});

// @desc    Get all bookings (admin/staff) with filters
// @route   GET /api/bookings?status=&date=&from=&to=
// @access  Admin/Staff
export const getAllBookings = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.paymentStatus) where.paymentStatus = req.query.paymentStatus;
  if (req.query.date) where.date = req.query.date;
  if (req.query.from || req.query.to) {
    where.date = {};
    if (req.query.from) where.date[Op.gte] = req.query.from;
    if (req.query.to) where.date[Op.lte] = req.query.to;
  }

  const bookings = await Booking.findAll({
    where,
    include: [
      { association: 'station', attributes: ['id', 'name', 'type'] },
      userInclude,
    ],
    order: [['date', 'DESC'], ['startTime', 'DESC']],
  });
  res.json(bookings);
});

// @desc    Get single booking (owner or admin/staff)
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.id, {
    include: [stationInclude, userInclude],
  });
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const isOwner = booking.userId === req.user.id;
  const isPrivileged = ['admin', 'staff'].includes(req.user.role);
  if (!isOwner && !isPrivileged) {
    res.status(403);
    throw new Error('Not authorized to view this booking');
  }
  res.json(booking);
});

// @desc    Update booking status (admin/staff)
// @route   PATCH /api/bookings/:id/status
// @access  Admin/Staff
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }
  const booking = await Booking.findByPk(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  booking.status = status;
  await booking.save();
  res.json(booking);
});

// @desc    Cancel own booking (customer) or admin/staff
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const isOwner = booking.userId === req.user.id;
  const isPrivileged = ['admin', 'staff'].includes(req.user.role);
  if (!isOwner && !isPrivileged) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }
  if (booking.status === 'completed') {
    res.status(400);
    throw new Error('Completed bookings cannot be cancelled');
  }
  booking.status = 'cancelled';
  await booking.save();
  res.json(booking);
});

// @desc    Reschedule own booking (customer) or admin/staff
// @route   PATCH /api/bookings/:id/reschedule
// @access  Private
export const rescheduleBooking = asyncHandler(async (req, res) => {
  const { date, startTime, endTime } = req.body;
  const booking = await Booking.findByPk(req.params.id, { include: [stationInclude] });
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const isOwner = booking.userId === req.user.id;
  const isPrivileged = ['admin', 'staff'].includes(req.user.role);
  if (!isOwner && !isPrivileged) {
    res.status(403);
    throw new Error('Not authorized to reschedule this booking');
  }
  if (booking.status === 'completed' || booking.status === 'cancelled') {
    res.status(400);
    throw new Error('This booking can no longer be rescheduled');
  }
  if (toMinutes(endTime) <= toMinutes(startTime)) {
    res.status(400);
    throw new Error('endTime must be after startTime');
  }

  try {
    await assertNoConflict(booking.stationId, date, startTime, endTime, booking.id);
  } catch (err) {
    res.status(err.statusCode || 409);
    throw err;
  }

  const hours = (toMinutes(endTime) - toMinutes(startTime)) / 60;
  booking.date = date;
  booking.startTime = startTime;
  booking.endTime = endTime;
  booking.totalPrice = Math.round(hours * booking.station.pricePerHour);
  await booking.save();
  res.json(booking);
});

// @desc    Delete a booking (admin only)
// @route   DELETE /api/bookings/:id
// @access  Admin
export const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  await booking.destroy();
  res.json({ message: 'Booking deleted' });
});
