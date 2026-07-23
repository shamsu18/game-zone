import express from 'express';
import {
  getAvailability,
  createBooking,
  createWalkInBooking,
  getMyBookings,
  getAllBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
  deleteBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

// Public availability lookup
router.get('/availability', getAvailability);

// Customer
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);

// Admin / staff
router.get('/', protect, authorize('admin', 'staff'), getAllBookings);
router.post('/walk-in', protect, authorize('admin', 'staff'), createWalkInBooking);
router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'staff'),
  updateBookingStatus
);
router.delete('/:id', protect, authorize('admin'), deleteBooking);

// Owner or privileged
router.get('/:id', protect, getBooking);
router.patch('/:id/cancel', protect, cancelBooking);
router.patch('/:id/reschedule', protect, rescheduleBooking);

export default router;
