import asyncHandler from 'express-async-handler';
import Tournament from '../models/Tournament.js';

// @desc    Get tournaments
// @route   GET /api/tournaments
// @access  Public
export const getTournaments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const tournaments = await Tournament.find(filter).sort({ date: 1 });
  res.json(tournaments);
});

// @desc    Get one tournament (with participants for admin)
// @route   GET /api/tournaments/:id
// @access  Public
export const getTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id).populate(
    'participants',
    'name email phone'
  );
  if (!tournament) {
    res.status(404);
    throw new Error('Tournament not found');
  }
  res.json(tournament);
});

// @desc    Create tournament
// @route   POST /api/tournaments
// @access  Admin/Staff
export const createTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.create(req.body);
  res.status(201).json(tournament);
});

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Admin/Staff
export const updateTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!tournament) {
    res.status(404);
    throw new Error('Tournament not found');
  }
  res.json(tournament);
});

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Admin/Staff
export const deleteTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findByIdAndDelete(req.params.id);
  if (!tournament) {
    res.status(404);
    throw new Error('Tournament not found');
  }
  res.json({ message: 'Tournament deleted' });
});

// @desc    Register the current user for a tournament
// @route   POST /api/tournaments/:id/register
// @access  Private
export const registerForTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) {
    res.status(404);
    throw new Error('Tournament not found');
  }
  if (tournament.status === 'finished') {
    res.status(400);
    throw new Error('This tournament has already finished');
  }
  if (tournament.participants.some((p) => p.equals(req.user._id))) {
    res.status(400);
    throw new Error('You are already registered for this tournament');
  }
  tournament.participants.push(req.user._id);
  await tournament.save();
  res.json({ message: 'Registered successfully', tournament });
});
