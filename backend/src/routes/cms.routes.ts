import express from 'express';
import * as cmsController from '../controllers/cms.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/pages/slug/:slug', cmsController.getPageBySlug);
router.get('/menus/location/:location', cmsController.getMenuByLocation);
router.get('/widgets/page/:pageSlug', cmsController.getWidgetsForPage);
router.get('/settings', cmsController.getSettings);
router.get('/sitemap', cmsController.generateSitemap);
router.get('/robots', cmsController.generateRobotsTxt);

// Protected admin routes
router.use(protect);
router.use(restrictTo('admin'));

// ==================== PAGES ====================
router
  .route('/pages')
  .get(cmsController.getPages)
  .post(cmsController.createPage);

router
  .route('/pages/:id')
  .get(cmsController.getPageById)
  .patch(cmsController.updatePage)
  .delete(cmsController.deletePage);

router.post('/pages/:id/duplicate', cmsController.duplicatePage);
router.patch('/pages/:id/publish', cmsController.publishPage);
router.patch('/pages/:id/unpublish', cmsController.unpublishPage);
router.get('/pages/:id/versions', cmsController.getPageVersions);
router.post('/pages/:id/versions/:versionId/restore', cmsController.restorePageVersion);
router.post('/pages/bulk-update', cmsController.bulkUpdatePages);
router.post('/pages/bulk-delete', cmsController.bulkDeletePages);
router.get('/pages/:id/seo-preview', cmsController.getPageSEOPreview);

// ==================== TEMPLATES ====================
router
  .route('/templates')
  .get(cmsController.getTemplates)
  .post(cmsController.createTemplate);

router
  .route('/templates/:id')
  .get(cmsController.getTemplateById)
  .patch(cmsController.updateTemplate)
  .delete(cmsController.deleteTemplate);

router.post('/templates/:id/duplicate', cmsController.duplicateTemplate);
router.post('/templates/:id/increment-usage', cmsController.incrementTemplateUsage);

// ==================== MENUS ====================
router
  .route('/menus')
  .get(cmsController.getMenus)
  .post(cmsController.createMenu);

router
  .route('/menus/:id')
  .get(cmsController.getMenuById)
  .patch(cmsController.updateMenu)
  .delete(cmsController.deleteMenu);

// ==================== WIDGETS ====================
router
  .route('/widgets')
  .get(cmsController.getWidgets)
  .post(cmsController.createWidget);

router
  .route('/widgets/:id')
  .get(cmsController.getWidgetById)
  .patch(cmsController.updateWidget)
  .delete(cmsController.deleteWidget);

router.post('/widgets/:id/impression', cmsController.trackWidgetImpression);
router.post('/widgets/:id/click', cmsController.trackWidgetClick);

// ==================== SETTINGS ====================
router.patch('/settings', cmsController.updateSettings);

// ==================== ANALYTICS ====================
router.get('/analytics', cmsController.getCMSAnalytics);

// ==================== MEDIA ====================
router.post('/media/upload', uploadSingle('file'), cmsController.uploadMedia);
router.delete('/media/:publicId', cmsController.deleteMedia);
router.get('/media/library', cmsController.getMediaLibrary);
router.post('/media/optimize', cmsController.optimizeImage);

export default router;
