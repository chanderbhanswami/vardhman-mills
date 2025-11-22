import express from 'express';
import * as locationController from '../controllers/location.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/v1/locations/nearby
 * @desc    Get nearby locations (public)
 * @access  Public
 */
router.get('/nearby', locationController.getNearbyLocations);

/**
 * @route   GET /api/v1/locations/slug/:slug
 * @desc    Get location by slug (public)
 * @access  Public
 */
router.get('/slug/:slug', locationController.getLocationBySlug);

/**
 * @route   GET /api/v1/locations/regions/slug/:slug
 * @desc    Get region by slug (public)
 * @access  Public
 */
router.get('/regions/slug/:slug', locationController.getRegionBySlug);

// ==================== ADMIN ROUTES ====================

// Protect all routes after this middleware
router.use(protect, restrictTo('admin', 'super-admin'));

/**
 * @route   GET /api/v1/locations
 * @desc    Get all locations with filters
 * @access  Admin
 */
router.get('/', locationController.getLocations);

/**
 * @route   POST /api/v1/locations
 * @desc    Create new location
 * @access  Admin
 */
router.post('/', locationController.createLocation);

/**
 * @route   GET /api/v1/locations/analytics
 * @desc    Get location analytics dashboard
 * @access  Admin
 */
router.get('/analytics', locationController.getLocationAnalytics);

/**
 * @route   POST /api/v1/locations/bulk-update
 * @desc    Bulk update locations
 * @access  Admin
 */
router.post('/bulk-update', locationController.bulkUpdateLocations);

/**
 * @route   POST /api/v1/locations/bulk-delete
 * @desc    Bulk delete locations
 * @access  Admin
 */
router.post('/bulk-delete', locationController.bulkDeleteLocations);

/**
 * @route   GET /api/v1/locations/:id
 * @desc    Get location by ID
 * @access  Admin
 */
router.get('/:id', locationController.getLocationById);

/**
 * @route   PATCH /api/v1/locations/:id
 * @desc    Update location
 * @access  Admin
 */
router.patch('/:id', locationController.updateLocation);

/**
 * @route   DELETE /api/v1/locations/:id
 * @desc    Delete location
 * @access  Admin
 */
router.delete('/:id', locationController.deleteLocation);

/**
 * @route   PATCH /api/v1/locations/:id/activate
 * @desc    Activate location
 * @access  Admin
 */
router.patch('/:id/activate', locationController.activateLocation);

/**
 * @route   PATCH /api/v1/locations/:id/deactivate
 * @desc    Deactivate location
 * @access  Admin
 */
router.patch('/:id/deactivate', locationController.deactivateLocation);

/**
 * @route   POST /api/v1/locations/:id/track/click
 * @desc    Track location click
 * @access  Public
 */
router.post('/:id/track/click', locationController.trackLocationClick);

/**
 * @route   POST /api/v1/locations/:id/track/directions
 * @desc    Track directions request
 * @access  Public
 */
router.post('/:id/track/directions', locationController.trackDirections);

/**
 * @route   POST /api/v1/locations/:id/track/call
 * @desc    Track phone call
 * @access  Public
 */
router.post('/:id/track/call', locationController.trackCall);

// ==================== REGION ROUTES ====================

/**
 * @route   GET /api/v1/locations/regions
 * @desc    Get all regions with filters
 * @access  Admin
 */
router.get('/regions', locationController.getRegions);

/**
 * @route   POST /api/v1/locations/regions
 * @desc    Create new region
 * @access  Admin
 */
router.post('/regions', locationController.createRegion);

/**
 * @route   GET /api/v1/locations/regions/analytics
 * @desc    Get region analytics dashboard
 * @access  Admin
 */
router.get('/regions/analytics', locationController.getRegionAnalytics);

/**
 * @route   GET /api/v1/locations/regions/:id
 * @desc    Get region by ID
 * @access  Admin
 */
router.get('/regions/:id', locationController.getRegionById);

/**
 * @route   PATCH /api/v1/locations/regions/:id
 * @desc    Update region
 * @access  Admin
 */
router.patch('/regions/:id', locationController.updateRegion);

/**
 * @route   DELETE /api/v1/locations/regions/:id
 * @desc    Delete region
 * @access  Admin
 */
router.delete('/regions/:id', locationController.deleteRegion);

export default router;
