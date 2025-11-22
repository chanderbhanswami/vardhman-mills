import { Router } from 'express';
import {
  getAllCategories,
  getCategory,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategoriesAdmin,
  bulkDeleteCategories,
  bulkToggleCategoryStatus
} from '../controllers/category.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../config/cloudinary.js';

const router = Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:slug', getCategory);

// Admin routes
router.use('/admin', protect, restrictTo('admin'));

router.route('/admin/all')
  .get(getAllCategoriesAdmin);

router.route('/admin/create')
  .post(uploadSingle('image'), createCategory);

router.route('/admin/:id')
  .get(getCategoryById)
  .patch(uploadSingle('image'), updateCategory)
  .delete(deleteCategory);

// Bulk operations
router.delete('/admin/bulk-delete', bulkDeleteCategories);
router.patch('/admin/bulk-toggle-status', bulkToggleCategoryStatus);

export default router;