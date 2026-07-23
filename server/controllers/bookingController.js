import asyncHandler from 'express-async-handler';
import Booking from '../models/Booking.js';
import Station from '../models/Station.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import { buildAvailability, overlaps, toMinutes } from '../utils/timeSlots.js';

// Parse opening hours like "10:00 AM – 11:00 PM" is not reliable, so we use
// fixed defaults for slot generation. Admins can adjust in code if needed.
const OPEN = '10:00';
const CLOSE = '23:00';

// @desc    Get available slots for a station on a date
// @route   GET /api/bookings/availability?station=&date=
// @access  Public
export const getAvailability = asyncHandler(async (req, res) => {
  const { station, date } = req.query;
  if (!station || !date) {
    res.status(400);
    throw new Error('station and date query params are required');
  }
  const stationDoc = await Station.findById(station);
  if (!stationDoc) {
    res.status(404);
    throw new Error('Station not found');
  }

  const existing = await Booking.find({ station, date });
  const slots = buildAvailability(existing, OPEN, CLOSE);
  res.json({ station: stationDoc, date, slots });
});

// Shared helper: verify a station is free for the interval, else throw.
const assertNoConflict = async (stationId, date, startTime, endTime, excludeId) => {
  const query = { station: stationId, date, status: { $ne: 'cancelled' } };
  if (excludeId) query._id = { $ne: excludeId };
  const sameDay = await Booking.find(query);
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

  const stationDoc = await Station.findById(station);
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
    user: req.user._id,
    station,
    date,
    startTime,
    endTime,
    totalPrice,
    status: 'pending',
    paymentStatus: 'unpaid',
  });

  const populated = await booking.populate('station', 'name type pricePerHour image');
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

  const stationDoc = await Station.findById(station);
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

  // Attribute the walk-in to a lightweight guest user record or the staff user.
  let guest = null;
  if (customerPhone) {
    guest = await User.findOne({ phone: customerPhone, role: 'customer' });
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
    user: guest?._id || req.user._id,
    station,
    date,
    startTime,
    endTime,
    totalPrice,
    status: 'confirmed',
    paymentStatus: 'unpaid',
    isWalkIn: true,
    notes: customerName ? `Walk-in: ${customerName}` : 'Walk-in',
  });

  const populated = await booking.populate([
    { path: 'station', select: 'name type' },
    { path: 'user', select: 'name phone' },
  ]);
  res.status(201).json(populated);
});

// @desc    Get bookings of the current user
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('station', 'name type image pricePerHour')
    .sort({ date: -1, startTime: -1 });
  res.json(bookings);
});

// @desc    Get all bookings (admin/staff) with filters
// @route   GET /api/bookings?status=&date=&from=&to=
// @access  Admin/Staff
export const getAllBookings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.date) filter.date = req.query.date;
  if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = req.query.from;
    if (req.query.to) filter.date.$lte = req.query.to;
  }

  const bookings = await Booking.find(filter)
    .populate('station', 'name type')
    .populate('user', 'name email phone')
    .sort({ date: -1, startTime: -1 });
  res.json(bookings);
});

// @desc    Get single booking (owner or admin/staff)
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('station', 'name type image pricePerHour')
    .populate('user', 'name email phone');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const isOwner = booking.user._id.equals(req.user._id);
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
  const booking = await Booking.findById(req.params.id);
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
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const isOwner = booking.user.equals(req.user._id);
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
  const booking = await Booking.findById(req.params.id).populate('station');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const isOwner = booking.user.equals(req.user._id);
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
    await assertNoConflict(booking.station._id, date, startTime, endTime, booking._id);
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
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  res.json({ message: 'Booking deleted' });
});
