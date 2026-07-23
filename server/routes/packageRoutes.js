import express from 'express';
import {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  togglePackageActive,
  deletePackage,
} from '../controllers/packageController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', getPackages);
router.get('/:id', getPackage);

router.post('/', protect, authorize('admin', 'staff'), createPackage);
router.put('/:id', protect, authorize('admin', 'staff'), updatePackage);
router.patch(
  '/:id/toggle-active',
  protect,
  authorize('admin', 'staff'),
  togglePackageActive
);
router.delete('/:id', protect, authorize('admin', 'staff'), deletePackage);

export default router;
