import express from 'express';
import {
  getCustomers,
  getCustomerBookings,
  toggleBlockUser,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

// Customers — admin & staff
router.get('/customers', protect, authorize('admin', 'staff'), getCustomers);
router.get(
  '/:id/bookings',
  protect,
  authorize('admin', 'staff'),
  getCustomerBookings
);
router.patch('/:id/block', protect, authorize('admin'), toggleBlockUser);

// Staff management — admin only
router.get('/staff', protect, authorize('admin'), getStaff);
router.post('/staff', protect, authorize('admin'), createStaff);
router.put('/staff/:id', protect, authorize('admin'), updateStaff);
router.delete('/staff/:id', protect, authorize('admin'), deleteStaff);

export default router;
