import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

// @desc    List customers
// @route   GET /api/users/customers
// @access  Admin/Staff
export const getCustomers = asyncHandler(async (req, res) => {
  const filter = { role: 'customer' };
  if (req.query.search) {
    const rx = new RegExp(req.query.search, 'i');
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const customers = await User.find(filter).sort({ createdAt: -1 });
  res.json(customers);
});

// @desc    Get a customer's booking history
// @route   GET /api/users/:id/bookings
// @access  Admin/Staff
export const getCustomerBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.params.id })
    .populate('station', 'name type')
    .sort({ date: -1 });
  res.json(bookings);
});

// @desc    Block / unblock a customer
// @route   PATCH /api/users/:id/block
// @access  Admin
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Admin accounts cannot be blocked');
  }
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json(user);
});

// ===== Staff management (admin only) =====

// @desc    List staff members
// @route   GET /api/users/staff
// @access  Admin
export const getStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: 'staff' }).sort({ createdAt: -1 });
  res.json(staff);
});

// @desc    Create a staff account
// @route   POST /api/users/staff
// @access  Admin
export const createStaff = asyncHandler(async (req, res) => {
  const { name, email, phone, password, permissions } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }
  const staff = await User.create({
    name,
    email,
    phone,
    password,
    role: 'staff',
    permissions: permissions || ['bookings', 'stations', 'tournaments'],
  });
  res.status(201).json(staff);
});

// @desc    Update a staff account (permissions / info)
// @route   PUT /api/users/staff/:id
// @access  Admin
export const updateStaff = asyncHandler(async (req, res) => {
  const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
  if (!staff) {
    res.status(404);
    throw new Error('Staff member not found');
  }
  const { name, phone, permissions, password } = req.body;
  if (name) staff.name = name;
  if (phone) staff.phone = phone;
  if (permissions) staff.permissions = permissions;
  if (password) staff.password = password;
  await staff.save();
  res.json(staff);
});

// @desc    Delete a staff account
// @route   DELETE /api/users/staff/:id
// @access  Admin
export const deleteStaff = asyncHandler(async (req, res) => {
  const staff = await User.findOneAndDelete({ _id: req.params.id, role: 'staff' });
  if (!staff) {
    res.status(404);
    throw new Error('Staff member not found');
  }
  res.json({ message: 'Staff account removed' });
});
