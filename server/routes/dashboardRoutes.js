import express from 'express';
import { getStats, getRevenue7d } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin', 'staff'), getStats);
router.get('/revenue-7d', protect, authorize('admin', 'staff'), getRevenue7d);

export default router;
