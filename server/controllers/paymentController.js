import asyncHandler from 'express-async-handler';
import { Booking } from '../models/index.js';

// @desc    Initiate a payment for a booking.
//          MVP: mock provider immediately returns a success URL.
// @route   POST /api/payments/initiate/:bookingId
// @access  Private (owner)
export const initiatePayment = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.bookingId, { include: [{ association: 'station' }] });
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const isOwner = booking.userId === req.user.id;
  const isPrivileged = ['admin', 'staff'].includes(req.user.role);
  if (!isOwner && !isPrivileged) {
    res.status(403);
    throw new Error('Not authorized to pay for this booking');
  }
  if (booking.paymentStatus === 'paid') {
    res.status(400);
    throw new Error('This booking is already paid');
  }

  const provider = process.env.PAYMENT_PROVIDER || 'mock';

  if (provider === 'mock') {
    return res.json({
      provider: 'mock',
      amount: booking.totalPrice,
      bookingId: booking.id,
      confirmUrl: `/api/payments/confirm/${booking.id}`,
      message: 'Mock payment session created. Confirm to mark as paid.',
    });
  }

  // Real SSLCommerz / bKash sandbox integration would build and return a
  // gateway redirect URL here. Left as a documented extension point.
  res.status(501);
  throw new Error(
    `Payment provider "${provider}" integration is not implemented yet. Use PAYMENT_PROVIDER=mock for now.`
  );
});

// @desc    Confirm a (mock) payment and mark booking paid + confirmed
// @route   POST /api/payments/confirm/:bookingId
// @access  Private (owner)
export const confirmPayment = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const isOwner = booking.userId === req.user.id;
  const isPrivileged = ['admin', 'staff'].includes(req.user.role);
  if (!isOwner && !isPrivileged) {
    res.status(403);
    throw new Error('Not authorized');
  }
  booking.paymentStatus = 'paid';
  if (booking.status === 'pending') booking.status = 'confirmed';
  await booking.save();
  res.json({ message: 'Payment successful', booking });
});

// @desc    Payment history (all bookings with payment info)
// @route   GET /api/payments
// @access  Admin/Staff
export const getPayments = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.paymentStatus) where.paymentStatus = req.query.paymentStatus;
  const bookings = await Booking.findAll({
    where,
    include: [
      { association: 'station', attributes: ['id', 'name', 'type'] },
      { association: 'user', attributes: ['id', 'name', 'email', 'phone'] },
    ],
    order: [['updatedAt', 'DESC']],
  });
  res.json(bookings);
});

// @desc    Mark a payment as refunded (admin)
// @route   PATCH /api/payments/:bookingId/refund
// @access  Admin
export const refundPayment = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.paymentStatus !== 'paid') {
    res.status(400);
    throw new Error('Only paid bookings can be refunded');
  }
  booking.paymentStatus = 'refunded';
  await booking.save();
  res.json({ message: 'Payment refunded', booking });
});

// @desc    Admin/staff manually mark a booking as paid
// @route   PATCH /api/payments/:bookingId/mark-paid
// @access  Admin/Staff
export const markPaid = asyncHandler(async (req, res) => {
  const booking = await Booking.findByPk(req.params.bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  booking.paymentStatus = 'paid';
  if (booking.status === 'pending') booking.status = 'confirmed';
  await booking.save();
  res.json({ message: 'Marked as paid', booking });
});
