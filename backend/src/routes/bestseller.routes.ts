import express from 'express';
import {
  getBestsellers,
  getBestsellerById,
  getFeaturedBestsellers,
  getBestsellersByCategory,
  getBestsellersByBrand,
  getBestsellerTrends,
  createBestseller,
  updateBestseller,
  deleteBestseller,
  getBestsellerAnalytics,
  syncBestsellers,
  bulkUpdateBestsellers,
  bulkDeleteBestsellers,
  updateBestsellerRanks
} from '../controllers/bestseller.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getBestsellers);
router.get('/featured', getFeaturedBestsellers);
router.get('/trends', getBestsellerTrends);
router.get('/category/:categoryId', getBestsellersByCategory);
router.get('/brand/:brandId', getBestsellersByBrand);
router.get('/:id', getBestsellerById);

// Protected routes (Admin only)
router.use(protect);
router.use(restrictTo('admin', 'super-admin'));

router.post('/', createBestseller);
router.patch('/:id', updateBestseller);
router.delete('/:id', deleteBestseller);

// Analytics and management
router.get('/analytics/overview', getBestsellerAnalytics);
router.post('/sync', syncBestsellers);
router.patch('/bulk-update', bulkUpdateBestsellers);
router.delete('/bulk-delete', bulkDeleteBestsellers);
router.patch('/update-ranks', updateBestsellerRanks);

export default router;
