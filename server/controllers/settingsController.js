import asyncHandler from 'express-async-handler';
import Settings from '../models/Settings.js';

// @desc    Get site settings (public)
// @route   GET /api/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json(settings);
});

// @desc    Update site settings / CMS content
// @route   PUT /api/settings
// @access  Admin
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();

  // Merge only known top-level fields
  const fields = [
    'siteName',
    'logoUrl',
    'contactPhone',
    'contactEmail',
    'address',
    'openingHours',
    'mapEmbedUrl',
    'socialLinks',
    'hero',
    'offers',
    'testimonials',
    'galleryImages',
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) settings[f] = req.body[f];
  });

  await settings.save();
  res.json(settings);
});
