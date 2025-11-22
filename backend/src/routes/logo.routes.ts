import express from 'express';
import {
  getAllLogos,
  getLogo,
  createLogo,
  updateLogo,
  deleteLogo,
  activateLogo,
  deactivateLogo,
  setPrimaryLogo,
  addVariant,
  removeVariant,
  getVariants,
  createVersion,
  getVersionHistory,
  revertToVersion,
  getActiveLogo,
  getPrimaryLogos,
  getLogosByType,
  getLogoStats,
  getLogoUsage,
  bulkUpdateLogos,
  bulkDeleteLogos
} from '../controllers/logo.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * Get active logo by type (for frontend display)
 */
router.get('/public/type/:type', getActiveLogo);

/**
 * Get all primary logos
 */
router.get('/public/primary', getPrimaryLogos);

/**
 * Get logos by type
 */
router.get('/public/by-type/:type', getLogosByType);

/**
 * Get logo variants (public access for CDN/display)
 */
router.get('/:id/variants', getVariants);

// ==================== PROTECTED ROUTES (Admin Only) ====================

// Protect all routes after this middleware
router.use(protect);
router.use(restrictTo('admin'));

/**
 * CRUD operations
 */
router
  .route('/')
  .get(getAllLogos)
  .post(createLogo);

router
  .route('/:id')
  .get(getLogo)
  .put(updateLogo)
  .delete(deleteLogo);

/**
 * Status management
 */
router.post('/:id/activate', activateLogo);
router.post('/:id/deactivate', deactivateLogo);
router.post('/:id/set-primary', setPrimaryLogo);

/**
 * Variant management
 */
router.post('/:id/variants', addVariant);
router.delete('/:id/variants/:variantName', removeVariant);

/**
 * Version management
 */
router.post('/:id/new-version', createVersion);
router.get('/:id/versions', getVersionHistory);
router.post('/:id/restore/:versionId', revertToVersion);

/**
 * Analytics & Usage
 */
router.get('/stats/overview', getLogoStats);
router.get('/:id/usage', getLogoUsage);

/**
 * System operations
 */
router.post('/bulk-update', bulkUpdateLogos);
router.post('/bulk-delete', bulkDeleteLogos);

export default router;
