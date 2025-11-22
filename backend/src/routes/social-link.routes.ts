/**
 * Social Link Routes
 * RESTful API routes for social media links management
 */

import express from 'express';
import {
  // Public endpoints
  getSocialLinks,
  getSocialLinkById,
  getSocialLinksByLocation,
  getSocialLinksByPlatform,
  getActiveSocialLinks,
  getPopularSocialLinks,
  trackSocialLinkClick,

  // Admin endpoints
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  getSocialLinkAnalytics,
  verifySocialLink,
  verifyAllSocialLinks,
  reorderSocialLinks,
  bulkUpdateSocialLinks,
  bulkDeleteSocialLinks,
  resetSocialLinkAnalytics,
  exportSocialLinks
} from '../controllers/social-link.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

// Get all social links (with filtering)
router.get('/', getSocialLinks);

// Get active social links
router.get('/active', getActiveSocialLinks);

// Get popular social links
router.get('/popular', getPopularSocialLinks);

// Get social links by location
router.get('/location/:location', getSocialLinksByLocation);

// Get social links by platform
router.get('/platform/:platform', getSocialLinksByPlatform);

// Track social link click
router.post('/track/:id', trackSocialLinkClick);

// Get social link by ID
router.get('/:id', getSocialLinkById);

// ============================================================================
// ADMIN ROUTES (Protected)
// ============================================================================

// Create social link
router.post('/', protect, restrictTo('admin', 'super_admin'), createSocialLink);

// Update social link
router.patch('/:id', protect, restrictTo('admin', 'super_admin'), updateSocialLink);

// Delete social link
router.delete('/:id', protect, restrictTo('admin', 'super_admin'), deleteSocialLink);

// Get analytics overview
router.get('/analytics/overview', protect, restrictTo('admin', 'super_admin'), getSocialLinkAnalytics);

// Verify social link accessibility
router.post('/verify/:id', protect, restrictTo('admin', 'super_admin'), verifySocialLink);

// Bulk verify all social links
router.post('/verify-all', protect, restrictTo('admin', 'super_admin'), verifyAllSocialLinks);

// Reorder social links
router.patch('/reorder', protect, restrictTo('admin', 'super_admin'), reorderSocialLinks);

// Bulk update social links
router.patch('/bulk-update', protect, restrictTo('admin', 'super_admin'), bulkUpdateSocialLinks);

// Bulk delete social links
router.delete('/bulk-delete', protect, restrictTo('admin', 'super_admin'), bulkDeleteSocialLinks);

// Reset social link analytics
router.post('/reset-analytics/:id', protect, restrictTo('admin', 'super_admin'), resetSocialLinkAnalytics);

// Export social links data
router.get('/export', protect, restrictTo('admin', 'super_admin'), exportSocialLinks);

export default router;
