import express from 'express';
import {
  initiatePayment,
  confirmPayment,
  getPayments,
  refundPayment,
  markPaid,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/initiate/:bookingId', protect, initiatePayment);
router.post('/confirm/:bookingId', protect, confirmPayment);

router.get('/', protect, authorize('admin', 'staff'), getPayments);
router.patch('/:bookingId/mark-paid', protect, authorize('admin', 'staff'), markPaid);
router.patch('/:bookingId/refund', protect, authorize('admin'), refundPayment);

export default router;
