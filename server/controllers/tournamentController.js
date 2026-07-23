import asyncHandler from 'express-async-handler';
import { Tournament, User } from '../models/index.js';

// @desc    Get tournaments
// @route   GET /api/tournaments
// @access  Public
export const getTournaments = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  const tournaments = await Tournament.findAll({
    where,
    order: [['date', 'ASC']],
    include: [{ association: 'participants', attributes: ['id'], through: { attributes: [] } }],
  });
  res.json(tournaments);
});

// @desc    Get one tournament (with participants for admin)
// @route   GET /api/tournaments/:id
// @access  Public
export const getTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findByPk(req.params.id, {
    include: [
      {
        association: 'participants',
        attributes: ['id', 'name', 'email', 'phone'],
        through: { attributes: [] },
      },
    ],
  });
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
  const tournament = await Tournament.findByPk(req.params.id);
  if (!tournament) {
    res.status(404);
    throw new Error('Tournament not found');
  }
  await tournament.update(req.body);
  res.json(tournament);
});

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Admin/Staff
export const deleteTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findByPk(req.params.id);
  if (!tournament) {
    res.status(404);
    throw new Error('Tournament not found');
  }
  await tournament.destroy();
  res.json({ message: 'Tournament deleted' });
});

// @desc    Register the current user for a tournament
// @route   POST /api/tournaments/:id/register
// @access  Private
export const registerForTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findByPk(req.params.id);
  if (!tournament) {
    res.status(404);
    throw new Error('Tournament not found');
  }
  if (tournament.status === 'finished') {
    res.status(400);
    throw new Error('This tournament has already finished');
  }

  const already = await tournament.hasParticipant(req.user.id);
  if (already) {
    res.status(400);
    throw new Error('You are already registered for this tournament');
  }

  await tournament.addParticipant(req.user.id);

  const updated = await Tournament.findByPk(tournament.id, {
    include: [{ association: 'participants', attributes: ['id'], through: { attributes: [] } }],
  });
  res.json({ message: 'Registered successfully', tournament: updated });
});
