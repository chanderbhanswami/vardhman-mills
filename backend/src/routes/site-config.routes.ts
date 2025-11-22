import express from 'express';
import {
  getSiteConfig,
  getPublicSiteConfig,
  createSiteConfig,
  updateSiteConfig,
  updateSiteConfigSection,
  getSocialMedia,
  updateSocialMedia,
  getMaintenanceStatus,
  toggleMaintenanceMode,
  getSEOSettings,
  updateSEOSettings,
  getPaymentSettings,
  updatePaymentSettings,
  getThemeSettings,
  updateThemeSettings,
  deleteSiteConfig
} from '../controllers/site-config.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicSiteConfig);
router.get('/social', getSocialMedia);
router.get('/maintenance', getMaintenanceStatus);
router.get('/seo', getSEOSettings);
router.get('/payment', getPaymentSettings);
router.get('/theme', getThemeSettings);

// Protected routes (Admin only)
router.use(protect);
router.use(restrictTo('admin', 'super-admin'));

router
  .route('/')
  .get(getSiteConfig)
  .post(createSiteConfig)
  .patch(updateSiteConfig)
  .delete(deleteSiteConfig);

router.patch('/:section', updateSiteConfigSection);
router.patch('/social/update', updateSocialMedia);
router.patch('/maintenance/toggle', toggleMaintenanceMode);
router.patch('/seo/update', updateSEOSettings);
router.patch('/payment/update', updatePaymentSettings);
router.patch('/theme/update', updateThemeSettings);

export default router;
