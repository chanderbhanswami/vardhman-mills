import express from 'express';
import {
  getPosts,
  getPost,
  searchPosts,
  getFeaturedPosts,
  getPopularPosts,
  getRelatedPosts,
  getPostsByCategory,
  getPostsByTag,
  getPostsByAuthor,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  archivePost,
  toggleLikePost,
  sharePost,
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  approveComment,
  flagComment,
  toggleLikeComment,
  getPendingComments,
  getBlogAnalytics,
  getAllTags,
  updateScheduledPosts
} from '../controllers/blog.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Posts
router.get('/posts', getPosts);
router.get('/posts/featured', getFeaturedPosts);
router.get('/posts/popular', getPopularPosts);
router.get('/posts/search/:query', searchPosts);
router.get('/posts/:slug', getPost);
router.get('/posts/:id/related', getRelatedPosts);
router.post('/posts/:id/share', sharePost);

// Categories
router.get('/categories', getCategories);
router.get('/categories/:id', getCategory);
router.get('/categories/:categoryId/posts', getPostsByCategory);

// Tags
router.get('/tags', getAllTags);
router.get('/tags/:tag/posts', getPostsByTag);

// Authors
router.get('/authors/:authorId/posts', getPostsByAuthor);

// Comments
router.get('/posts/:postId/comments', getPostComments);

// ==================== PROTECTED ROUTES ====================

// Post interactions
router.post('/posts/:id/like', protect, toggleLikePost);

// Comments
router.post('/posts/:postId/comments', protect, createComment);
router.patch('/comments/:id', protect, updateComment);
router.delete('/comments/:id', protect, deleteComment);
router.post('/comments/:id/like', protect, toggleLikeComment);
router.post('/comments/:id/flag', protect, flagComment);

// ==================== ADMIN/AUTHOR ROUTES ====================

// Post management
router.post('/posts', protect, restrictTo('admin', 'author'), createPost);
router.patch('/posts/:id', protect, restrictTo('admin', 'author'), updatePost);
router.delete('/posts/:id', protect, restrictTo('admin', 'author'), deletePost);
router.patch('/posts/:id/publish', protect, restrictTo('admin', 'author'), publishPost);

// ==================== ADMIN ONLY ROUTES ====================

// Post management
router.patch('/posts/:id/archive', protect, restrictTo('admin'), archivePost);

// Category management
router.post('/categories', protect, restrictTo('admin'), createCategory);
router.patch('/categories/:id', protect, restrictTo('admin'), updateCategory);
router.delete('/categories/:id', protect, restrictTo('admin'), deleteCategory);

// Comment moderation
router.patch('/comments/:id/approve', protect, restrictTo('admin'), approveComment);
router.get('/admin/comments/pending', protect, restrictTo('admin'), getPendingComments);

// Analytics
router.get('/admin/analytics', protect, restrictTo('admin'), getBlogAnalytics);

// System operations
router.post('/admin/update-scheduled', protect, restrictTo('admin'), updateScheduledPosts);

export default router;
