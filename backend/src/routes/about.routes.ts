import express from 'express';
import * as aboutController from '../controllers/about.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes - Company Info
router.get('/company', aboutController.getCompanyInfo);

// Public routes - History
router.get('/history', aboutController.getHistory);
router.get('/history/:id', aboutController.getHistoryById);

// Public routes - Team
router.get('/team', aboutController.getTeamMembers);
router.get('/team/featured', aboutController.getFeaturedTeamMembers);
router.get('/team/:id', aboutController.getTeamMember);

// Public routes - Awards
router.get('/awards', aboutController.getAwards);
router.get('/awards/:id', aboutController.getAwardById);

// Public routes - Locations
router.get('/locations', aboutController.getLocations);
router.get('/locations/:id', aboutController.getLocationById);

// Public routes - Statistics
router.get('/stats', aboutController.getCompanyStats);

// Admin routes (protected)
router.use(protect, restrictTo('admin'));

// Admin - Company Info
router.put('/company', aboutController.updateCompanyInfo);

// Admin - History
router.post('/history', aboutController.createHistoryEntry);
router.put('/history/:id', aboutController.updateHistoryEntry);
router.delete('/history/:id', aboutController.deleteHistoryEntry);

// Admin - Team
router.post('/team', aboutController.createTeamMember);
router.put('/team/:id', aboutController.updateTeamMember);
router.delete('/team/:id', aboutController.deleteTeamMember);
router.post('/team/:id/image', upload.single('image'), aboutController.uploadTeamMemberImage);

// Admin - Awards
router.post('/awards', aboutController.createAward);
router.put('/awards/:id', aboutController.updateAward);
router.delete('/awards/:id', aboutController.deleteAward);

// Admin - Locations
router.post('/locations', aboutController.createLocation);
router.put('/locations/:id', aboutController.updateLocation);
router.delete('/locations/:id', aboutController.deleteLocation);

// Admin - Statistics
router.put('/stats', aboutController.updateCompanyStats);

// Admin - Overview
router.get('/admin/overview', aboutController.getOverviewStats);
router.get('/admin/departments', aboutController.getDepartments);

export default router;
