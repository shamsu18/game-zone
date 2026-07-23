import asyncHandler from 'express-async-handler';

// @desc    Upload a single image (local storage for MVP)
// @route   POST /api/upload
// @access  Admin/Staff
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }
  // Public URL served from the static /uploads route
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});
