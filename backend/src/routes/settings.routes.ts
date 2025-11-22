import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import {
  getCategorySettings,
  getAllSettings,
  updateCategorySettings,
  getSettingValue,
  updateSetting,
  deleteSetting,
  initializeDefaultSettings,
  exportSettings,
  importSettings
} from '../controllers/settings.controller.js';
import { validateSettings } from '../validators/settings.validator.js';

const router = Router();

// Protect all routes
router.use(protect);

// Public routes (authenticated users)
router.get('/category/:category', getCategorySettings);
router.get('/:category/:key', getSettingValue);

// User-specific settings
router.patch('/category/:category', validateSettings, updateCategorySettings);
router.patch('/:category/:key', updateSetting);

// Admin only routes
router.use(restrictTo('admin'));

router.get('/', getAllSettings);
router.delete('/:category/:key', deleteSetting);

// Admin management routes
router.post('/initialize', initializeDefaultSettings);
router.get('/export', exportSettings);
router.post('/import', importSettings);

export default router;
