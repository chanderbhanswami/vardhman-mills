import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

// Display Configuration Controllers
import {
  getDisplayConfig,
  updateDisplayConfig,
  resetDisplayConfig,
  getStyling,
  updateStyling,
  updateHoverEffects,
  updateScrollEffects,
  getResponsiveConfig,
  updateResponsiveConfig,
  updateMobileConfig,
  updateTabletConfig,
  updateDesktopConfig,
  getLinkConfig,
  updateLinkConfig,
  getNavigationConfig,
  updateNavigationConfig
} from '../controllers/logo-display.controller.js';

// Animation Controllers
import {
  getAnimationConfig,
  updateAnimationConfig,
  updateEntranceAnimation,
  updateLoadingAnimation,
  updateInteractionAnimations,
  updateScrollAnimation,
  disableAllAnimations,
  resetAnimations
} from '../controllers/logo-animation.controller.js';

// Performance Controllers
import {
  getPerformanceConfig,
  updatePerformanceConfig,
  updateOptimizationSettings,
  updateCachingStrategy,
  enableLazyLoading,
  disableLazyLoading,
  setLoadingPriority,
  addPreconnectOrigins,
  removePreconnectOrigin,
  resetPerformanceSettings,
  getPerformanceRecommendations
} from '../controllers/logo-performance.controller.js';

// A/B Testing Controllers
import {
  getABTest,
  createABTest,
  updateABTestVariant,
  addABTestVariant,
  removeABTestVariant,
  trackImpression,
  trackClick,
  trackConversion,
  getABTestResults,
  setABTestWinner,
  stopABTest,
  deleteABTest
} from '../controllers/logo-abtest.controller.js';

// Analytics Controllers
import {
  getLogoAnalytics,
  trackLogoImpression,
  trackLogoClick,
  trackLogoHover,
  trackScrollInteraction,
  updatePerformanceMetrics,
  updateViewTime,
  getDeviceStats,
  getBrowserStats,
  getGeographicStats,
  getPerformanceSummary,
  resetAnalytics,
  exportAnalytics
} from '../controllers/logo-analytics.controller.js';

const router = express.Router();

// ==================== PUBLIC ROUTES (Tracking & Display) ====================

/**
 * Display Configuration (Public read for frontend)
 */
router.get('/:id/display-config', getDisplayConfig);
router.get('/:id/styling', getStyling);
router.get('/:id/responsive', getResponsiveConfig);
router.get('/:id/link-config', getLinkConfig);
router.get('/:id/navigation', getNavigationConfig);
router.get('/:id/animation', getAnimationConfig);
router.get('/:id/performance', getPerformanceConfig);

/**
 * Public Analytics Tracking (for frontend usage tracking)
 */
router.post('/:id/analytics/impression', trackLogoImpression);
router.post('/:id/analytics/click', trackLogoClick);
router.post('/:id/analytics/hover', trackLogoHover);
router.post('/:id/analytics/scroll', trackScrollInteraction);
router.post('/:id/analytics/performance', updatePerformanceMetrics);
router.post('/:id/analytics/view-time', updateViewTime);

/**
 * A/B Testing Tracking (Public for variant tracking)
 */
router.post('/:id/ab-test/track/impression', trackImpression);
router.post('/:id/ab-test/track/click', trackClick);
router.post('/:id/ab-test/track/conversion', trackConversion);

// ==================== PROTECTED ROUTES (Admin Only) ====================

// Protect all routes after this middleware
router.use(protect);
router.use(restrictTo('admin'));

/**
 * Display Configuration Management
 */
router.patch('/:id/display-config', updateDisplayConfig);
router.delete('/:id/display-config', resetDisplayConfig);

/**
 * Styling Management
 */
router.patch('/:id/styling', updateStyling);
router.patch('/:id/styling/hover-effects', updateHoverEffects);
router.patch('/:id/styling/scroll-effects', updateScrollEffects);

/**
 * Responsive Configuration Management
 */
router.patch('/:id/responsive', updateResponsiveConfig);
router.patch('/:id/responsive/mobile', updateMobileConfig);
router.patch('/:id/responsive/tablet', updateTabletConfig);
router.patch('/:id/responsive/desktop', updateDesktopConfig);

/**
 * Link Configuration Management
 */
router.patch('/:id/link-config', updateLinkConfig);

/**
 * Navigation Integration Management
 */
router.patch('/:id/navigation', updateNavigationConfig);

/**
 * Animation Management
 */
router.patch('/:id/animation', updateAnimationConfig);
router.patch('/:id/animation/entrance', updateEntranceAnimation);
router.patch('/:id/animation/loading', updateLoadingAnimation);
router.patch('/:id/animation/interactions', updateInteractionAnimations);
router.patch('/:id/animation/scroll', updateScrollAnimation);
router.post('/:id/animation/disable-all', disableAllAnimations);
router.delete('/:id/animation', resetAnimations);

/**
 * Performance Optimization Management
 */
router.patch('/:id/performance', updatePerformanceConfig);
router.patch('/:id/performance/optimization', updateOptimizationSettings);
router.patch('/:id/performance/caching', updateCachingStrategy);
router.post('/:id/performance/lazy-loading/enable', enableLazyLoading);
router.post('/:id/performance/lazy-loading/disable', disableLazyLoading);
router.patch('/:id/performance/priority', setLoadingPriority);
router.post('/:id/performance/preconnect', addPreconnectOrigins);
router.delete('/:id/performance/preconnect/:origin', removePreconnectOrigin);
router.delete('/:id/performance', resetPerformanceSettings);
router.get('/:id/performance/recommendations', getPerformanceRecommendations);

/**
 * A/B Testing Management
 */
router.get('/:id/ab-test', getABTest);
router.post('/:id/ab-test', createABTest);
router.patch('/:id/ab-test/variants/:variantId', updateABTestVariant);
router.post('/:id/ab-test/variants', addABTestVariant);
router.delete('/:id/ab-test/variants/:variantId', removeABTestVariant);
router.get('/:id/ab-test/results', getABTestResults);
router.post('/:id/ab-test/winner', setABTestWinner);
router.post('/:id/ab-test/stop', stopABTest);
router.delete('/:id/ab-test', deleteABTest);

/**
 * Analytics & Reporting
 */
router.get('/:id/analytics', getLogoAnalytics);
router.get('/:id/analytics/devices', getDeviceStats);
router.get('/:id/analytics/browsers', getBrowserStats);
router.get('/:id/analytics/geography', getGeographicStats);
router.get('/:id/analytics/performance-summary', getPerformanceSummary);
router.post('/:id/analytics/reset', resetAnalytics);
router.get('/:id/analytics/export', exportAnalytics);

export default router;
