import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new customer
// @route   POST /api/auth/signup
// @access  Public
export const signup = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    phone,
    password, // hashed via virtual setter in the model
    role: 'customer',
  });

  res.status(201).json({
    user,
    token: generateToken(user._id),
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: (email || '').toLowerCase() }).select(
    '+passwordHash'
  );

  if (!user || !(await user.matchPassword(password || ''))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.isBlocked) {
    res.status(403);
    throw new Error('Your account has been blocked. Contact support.');
  }

  res.json({
    user,
    token: generateToken(user._id),
  });
});

// @desc    Get the current logged-in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @desc    Update own profile
// @route   PUT /api/auth/me
// @access  Private
export const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone, password } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (password) user.password = password;

  await user.save();
  res.json(user);
});
