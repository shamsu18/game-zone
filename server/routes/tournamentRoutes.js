import express from 'express';
import {
  getTournaments,
  getTournament,
  createTournament,
  updateTournament,
  deleteTournament,
  registerForTournament,
} from '../controllers/tournamentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', getTournaments);
router.get('/:id', getTournament);
router.post('/:id/register', protect, registerForTournament);

router.post('/', protect, authorize('admin', 'staff'), createTournament);
router.put('/:id', protect, authorize('admin', 'staff'), updateTournament);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteTournament);

export default router;
