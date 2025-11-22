import express from 'express';
import * as heroBannerController from '../controllers/hero-banner.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/hero-sections/page/:page', heroBannerController.getHeroSectionsByPage);
router.get('/banners/page/:page', heroBannerController.getBannersByPage);
router.get('/banners/page/:page/location/:location', heroBannerController.getBannersByPage);

// Protected admin routes
router.use(protect);
router.use(restrictTo('admin'));

// ==================== HERO SECTIONS ====================
router
  .route('/hero-sections')
  .get(heroBannerController.getHeroSections)
  .post(heroBannerController.createHeroSection);

router
  .route('/hero-sections/:id')
  .get(heroBannerController.getHeroSectionById)
  .patch(heroBannerController.updateHeroSection)
  .delete(heroBannerController.deleteHeroSection);

router.post('/hero-sections/:id/duplicate', heroBannerController.duplicateHeroSection);
router.patch('/hero-sections/:id/activate', heroBannerController.activateHeroSection);
router.patch('/hero-sections/:id/deactivate', heroBannerController.deactivateHeroSection);
router.post('/hero-sections/:id/schedule', heroBannerController.scheduleHeroSection);
router.post('/hero-sections/:id/impression', heroBannerController.trackHeroImpression);
router.post('/hero-sections/:id/click', heroBannerController.trackHeroClick);

// ==================== BANNERS ====================
router
  .route('/banners')
  .get(heroBannerController.getBanners)
  .post(heroBannerController.createBanner);

router
  .route('/banners/:id')
  .get(heroBannerController.getBannerById)
  .patch(heroBannerController.updateBanner)
  .delete(heroBannerController.deleteBanner);

router.post('/banners/:id/duplicate', heroBannerController.duplicateBanner);
router.patch('/banners/:id/activate', heroBannerController.activateBanner);
router.patch('/banners/:id/deactivate', heroBannerController.deactivateBanner);
router.post('/banners/:id/schedule', heroBannerController.scheduleBanner);
router.post('/banners/:id/impression', heroBannerController.trackBannerImpression);
router.post('/banners/:id/click', heroBannerController.trackBannerClick);
router.patch('/banners/order', heroBannerController.updateBannerOrder);
router.post('/banners/bulk-update', heroBannerController.bulkUpdateBanners);
router.post('/banners/bulk-delete', heroBannerController.bulkDeleteBanners);

// ==================== BANNER GROUPS ====================
router
  .route('/banner-groups')
  .get(heroBannerController.getBannerGroups)
  .post(heroBannerController.createBannerGroup);

router
  .route('/banner-groups/:id')
  .get(heroBannerController.getBannerGroupById)
  .patch(heroBannerController.updateBannerGroup)
  .delete(heroBannerController.deleteBannerGroup);

router.patch('/banner-groups/:id/activate', heroBannerController.activateBannerGroup);
router.patch('/banner-groups/:id/deactivate', heroBannerController.deactivateBannerGroup);

// ==================== ANALYTICS ====================
router.get('/analytics', heroBannerController.getHeroBannerAnalytics);

// ==================== A/B TESTING ====================
router.post('/ab-test', heroBannerController.createABTest);
router.get('/ab-test/:type/:id', heroBannerController.getABTestResults);
router.post('/ab-test/end', heroBannerController.endABTest);

export default router;
