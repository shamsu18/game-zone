import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('admin', 'staff'),
  upload.single('image'),
  uploadImage
);

export default router;
