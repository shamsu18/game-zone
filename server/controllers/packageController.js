import asyncHandler from 'express-async-handler';
import Package from '../models/Package.js';

// @desc    Get packages (public sees active only)
// @route   GET /api/packages
// @access  Public
export const getPackages = asyncHandler(async (req, res) => {
  const filter = {};
  const isPrivileged = req.user && ['admin', 'staff'].includes(req.user.role);
  if (!isPrivileged || req.query.all !== 'true') {
    filter.active = true;
  }
  const packages = await Package.find(filter).sort({ createdAt: -1 });
  res.json(packages);
});

// @desc    Get one package
// @route   GET /api/packages/:id
// @access  Public
export const getPackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  res.json(pkg);
});

// @desc    Create package
// @route   POST /api/packages
// @access  Admin/Staff
export const createPackage = asyncHandler(async (req, res) => {
  const pkg = await Package.create(req.body);
  res.status(201).json(pkg);
});

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Admin/Staff
export const updatePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  res.json(pkg);
});

// @desc    Toggle active state
// @route   PATCH /api/packages/:id/toggle-active
// @access  Admin/Staff
export const togglePackageActive = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  pkg.active = !pkg.active;
  await pkg.save();
  res.json(pkg);
});

// @desc    Delete package
// @route   DELETE /api/packages/:id
// @access  Admin/Staff
export const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findByIdAndDelete(req.params.id);
  if (!pkg) {
    res.status(404);
    throw new Error('Package not found');
  }
  res.json({ message: 'Package deleted' });
});
