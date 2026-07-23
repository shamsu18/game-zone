import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';
import { User, Booking } from '../models/index.js';

// @desc    List customers
// @route   GET /api/users/customers
// @access  Admin/Staff
export const getCustomers = asyncHandler(async (req, res) => {
  const where = { role: 'customer' };
  if (req.query.search) {
    const like = { [Op.like]: `%${req.query.search}%` };
    where[Op.or] = [{ name: like }, { email: like }, { phone: like }];
  }
  const customers = await User.findAll({ where, order: [['createdAt', 'DESC']] });
  res.json(customers);
});

// @desc    Get a customer's booking history
// @route   GET /api/users/:id/bookings
// @access  Admin/Staff
export const getCustomerBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.findAll({
    where: { userId: req.params.id },
    include: [{ association: 'station', attributes: ['id', 'name', 'type'] }],
    order: [['date', 'DESC']],
  });
  res.json(bookings);
});

// @desc    Block / unblock a customer
// @route   PATCH /api/users/:id/block
// @access  Admin
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
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
  const staff = await User.findAll({
    where: { role: 'staff' },
    order: [['createdAt', 'DESC']],
  });
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
  const exists = await User.findOne({ where: { email: email.toLowerCase() } });
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
  const safe = await User.findByPk(staff.id);
  res.status(201).json(safe);
});

// @desc    Update a staff account (permissions / info)
// @route   PUT /api/users/staff/:id
// @access  Admin
export const updateStaff = asyncHandler(async (req, res) => {
  const staff = await User.findOne({ where: { id: req.params.id, role: 'staff' } });
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
  const staff = await User.findOne({ where: { id: req.params.id, role: 'staff' } });
  if (!staff) {
    res.status(404);
    throw new Error('Staff member not found');
  }
  await staff.destroy();
  res.json({ message: 'Staff account removed' });
});
