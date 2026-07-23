import express from 'express';
import {
  getStations,
  getStation,
  createStation,
  updateStation,
  toggleStationStatus,
  deleteStation,
} from '../controllers/stationController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', getStations);
router.get('/:id', getStation);

// Admin / staff only
router.post('/', protect, authorize('admin', 'staff'), createStation);
router.put('/:id', protect, authorize('admin', 'staff'), updateStation);
router.patch(
  '/:id/toggle-status',
  protect,
  authorize('admin', 'staff'),
  toggleStationStatus
);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteStation);

export default router;
