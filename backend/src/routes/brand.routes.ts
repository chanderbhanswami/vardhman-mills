import express from 'express';
import * as brandController from '../controllers/brand.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/', brandController.getBrands);
router.get('/featured', brandController.getFeaturedBrands);
router.get('/search', brandController.searchBrands);
router.get('/suggestions', brandController.getBrandSuggestions);
router.get('/sitemap', brandController.generateBrandSitemap);
router.get('/performance', brandController.getBrandPerformanceComparison);
router.get('/market-share', brandController.getMarketShareAnalysis);
router.get('/slug/:slug', brandController.getBrandBySlug);
router.get('/:id', brandController.getBrandById);
router.get('/:id/products', brandController.getBrandProducts);
router.get('/:id/categories', brandController.getBrandCategories);
router.get('/:id/statistics', brandController.getBrandStatistics);
router.get('/:id/similar', brandController.getSimilarBrands);

// Admin routes (protected)
router.use(protect, restrictTo('admin'));

router.post('/', brandController.createBrand);
router.put('/:id', brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);

// Logo and banner uploads
router.post('/:id/logo', upload.single('logo'), brandController.uploadBrandLogo);
router.post('/:id/banner', upload.single('banner'), brandController.uploadBrandBanner);
router.delete('/:id/logo', brandController.deleteBrandLogo);
router.delete('/:id/banner', brandController.deleteBrandBanner);

// SEO
router.put('/:id/seo', brandController.updateBrandSEO);

// Admin operations
router.get('/admin/statistics', brandController.getAllBrandsStatistics);
router.post('/admin/bulk-update', brandController.bulkUpdateBrands);
router.post('/admin/bulk-delete', brandController.bulkDeleteBrands);
router.get('/admin/validate', brandController.validateBrandData);

export default router;
