import asyncHandler from 'express-async-handler';
import Station from '../models/Station.js';

// @desc    Get all stations (public sees active only unless ?all=true from admin)
// @route   GET /api/stations
// @access  Public
export const getStations = asyncHandler(async (req, res) => {
  const filter = {};
  const isPrivileged =
    req.user && ['admin', 'staff'].includes(req.user.role);

  if (!isPrivileged || req.query.all !== 'true') {
    filter.status = 'active';
  }
  if (req.query.type) filter.type = req.query.type;

  const stations = await Station.find(filter).sort({ createdAt: -1 });
  res.json(stations);
});

// @desc    Get a single station
// @route   GET /api/stations/:id
// @access  Public
export const getStation = asyncHandler(async (req, res) => {
  const station = await Station.findById(req.params.id);
  if (!station) {
    res.status(404);
    throw new Error('Station not found');
  }
  res.json(station);
});

// @desc    Create a station
// @route   POST /api/stations
// @access  Admin/Staff
export const createStation = asyncHandler(async (req, res) => {
  const station = await Station.create(req.body);
  res.status(201).json(station);
});

// @desc    Update a station
// @route   PUT /api/stations/:id
// @access  Admin/Staff
export const updateStation = asyncHandler(async (req, res) => {
  const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!station) {
    res.status(404);
    throw new Error('Station not found');
  }
  res.json(station);
});

// @desc    Toggle station status active <-> maintenance
// @route   PATCH /api/stations/:id/toggle-status
// @access  Admin/Staff
export const toggleStationStatus = asyncHandler(async (req, res) => {
  const station = await Station.findById(req.params.id);
  if (!station) {
    res.status(404);
    throw new Error('Station not found');
  }
  station.status = station.status === 'active' ? 'maintenance' : 'active';
  await station.save();
  res.json(station);
});

// @desc    Delete a station
// @route   DELETE /api/stations/:id
// @access  Admin/Staff
export const deleteStation = asyncHandler(async (req, res) => {
  const station = await Station.findByIdAndDelete(req.params.id);
  if (!station) {
    res.status(404);
    throw new Error('Station not found');
  }
  res.json({ message: 'Station deleted' });
});
