import { Router } from 'express';
import {
  getAllProducts,
  getProduct,
  getProductById,
  getFeaturedProducts,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  updateProductReview,
  deleteProductReview,
  getAllProductsAdmin,
  getProductStats,
  bulkDeleteProducts,
  bulkToggleProductStatus,
  bulkToggleProductFeatured,
  getProductStock,
  bulkCheckStock
} from '../controllers/product.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { uploadMultiple, uploadFields, uploadProductFields, uploadDebug } from '../config/cloudinary.js';

const router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);

// Bulk stock check (POST route before /:id routes)
router.post('/stock/bulk-check', bulkCheckStock);

// Admin routes - MOVED UP to avoid conflicts
router.get('/admin/all', protect, restrictTo('admin'), getAllProductsAdmin);
router.get('/admin/stats', protect, restrictTo('admin'), getProductStats);
// Debug middleware to log request details
const debugMulter = (req: any, res: any, next: any) => {
  console.log('=== MULTER DEBUG MIDDLEWARE ===');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  next();
};

router.post('/admin/create', protect, restrictTo('admin'), debugMulter, uploadDebug(), createProduct);
router.patch('/admin/:id', protect, restrictTo('admin'), debugMulter, uploadDebug(), updateProduct);
router.delete('/admin/:id', protect, restrictTo('admin'), deleteProduct);

// Bulk operations
router.delete('/admin/bulk-delete', protect, restrictTo('admin'), bulkDeleteProducts);
router.patch('/admin/bulk-toggle-status', protect, restrictTo('admin'), bulkToggleProductStatus);
router.patch('/admin/bulk-toggle-featured', protect, restrictTo('admin'), bulkToggleProductFeatured);

// Product by ID route (specific route before slug route)
router.get('/id/:id', getProductById);
router.get('/:id/related', getRelatedProducts);
router.get('/:id/stock', getProductStock);

// Review routes (require authentication)
router.post('/:productId/reviews', protect, addProductReview);
router.patch('/:productId/reviews/:reviewId', protect, updateProductReview);
router.delete('/:productId/reviews/:reviewId', protect, deleteProductReview);

// Product by slug route (MUST BE LAST to avoid conflicts)
router.get('/:slug', getProduct);

export default router;