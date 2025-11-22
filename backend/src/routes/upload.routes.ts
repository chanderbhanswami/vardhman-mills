import express from 'express';
import multer from 'multer';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import * as uploadController from '../controllers/upload.controller.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB default
  }
});

// ============================================================================
// FILE UPLOAD ROUTES
// ============================================================================

/**
 * @route POST /api/v1/uploads
 * @desc Upload single file
 * @access Private
 */
router.post('/', protect, upload.single('file'), uploadController.uploadFile);

/**
 * @route POST /api/v1/uploads/multiple
 * @desc Upload multiple files
 * @access Private
 */
router.post('/multiple', protect, upload.array('files', 10), uploadController.uploadMultipleFiles);

/**
 * @route POST /api/v1/uploads/from-url
 * @desc Upload file from URL
 * @access Private
 */
router.post('/from-url', protect, uploadController.uploadFromUrl);

/**
 * @route GET /api/v1/uploads
 * @desc Get uploads with filters and pagination
 * @access Private
 */
router.get('/', protect, uploadController.getUploads);

/**
 * @route GET /api/v1/uploads/recent
 * @desc Get recent uploads
 * @access Private
 */
router.get('/recent', protect, uploadController.getRecentUploads);

/**
 * @route GET /api/v1/uploads/statistics
 * @desc Get upload statistics
 * @access Private
 */
router.get('/statistics', protect, uploadController.getUploadStatistics);

/**
 * @route GET /api/v1/uploads/storage-usage
 * @desc Get storage usage
 * @access Private
 */
router.get('/storage-usage', protect, uploadController.getStorageUsage);

/**
 * @route GET /api/v1/uploads/analytics
 * @desc Get upload analytics
 * @access Private
 */
router.get('/analytics', protect, uploadController.getUploadAnalytics);

/**
 * @route GET /api/v1/uploads/search
 * @desc Search uploads
 * @access Private
 */
router.get('/search', protect, uploadController.searchUploads);

/**
 * @route GET /api/v1/uploads/config
 * @desc Get upload configuration
 * @access Private
 */
router.get('/config', protect, uploadController.getUploadConfig);

/**
 * @route PATCH /api/v1/uploads/config
 * @desc Update upload configuration
 * @access Private (Admin)
 */
router.patch('/config', protect, restrictTo('admin', 'super_admin'), uploadController.updateUploadConfig);

/**
 * @route POST /api/v1/uploads/validate
 * @desc Validate file before upload
 * @access Private
 */
router.post('/validate', protect, uploadController.validateFile);

/**
 * @route GET /api/v1/uploads/:id
 * @desc Get upload by ID
 * @access Private
 */
router.get('/:id', protect, uploadController.getUpload);

/**
 * @route PATCH /api/v1/uploads/:id
 * @desc Update upload
 * @access Private
 */
router.patch('/:id', protect, uploadController.updateUpload);

/**
 * @route DELETE /api/v1/uploads/:id
 * @desc Delete upload
 * @access Private
 */
router.delete('/:id', protect, uploadController.deleteUpload);

// ============================================================================
// IMAGE PROCESSING ROUTES
// ============================================================================

/**
 * @route POST /api/v1/uploads/:id/resize
 * @desc Resize image
 * @access Private
 */
router.post('/:id/resize', protect, uploadController.resizeImage);

/**
 * @route POST /api/v1/uploads/:id/thumbnail
 * @desc Generate thumbnail
 * @access Private
 */
router.post('/:id/thumbnail', protect, uploadController.generateThumbnail);

/**
 * @route POST /api/v1/uploads/:id/optimize
 * @desc Optimize image
 * @access Private
 */
router.post('/:id/optimize', protect, uploadController.optimizeImage);

/**
 * @route POST /api/v1/uploads/:id/signed-url
 * @desc Generate signed URL
 * @access Private
 */
router.post('/:id/signed-url', protect, uploadController.generateSignedUrl);

// ============================================================================
// BULK OPERATIONS ROUTES
// ============================================================================

/**
 * @route POST /api/v1/uploads/bulk-delete
 * @desc Delete multiple uploads
 * @access Private
 */
router.post('/bulk-delete', protect, uploadController.deleteMultipleUploads);

/**
 * @route POST /api/v1/uploads/bulk-move
 * @desc Move multiple uploads to folder
 * @access Private
 */
router.post('/bulk-move', protect, uploadController.moveMultipleUploads);

/**
 * @route POST /api/v1/uploads/bulk-update
 * @desc Update multiple uploads
 * @access Private
 */
router.post('/bulk-update', protect, uploadController.updateMultipleUploads);

// ============================================================================
// FOLDER MANAGEMENT ROUTES
// ============================================================================

/**
 * @route GET /api/v1/uploads/folders
 * @desc Get folders
 * @access Private
 */
router.get('/folders', protect, uploadController.getFolders);

/**
 * @route POST /api/v1/uploads/folders
 * @desc Create folder
 * @access Private
 */
router.post('/folders', protect, uploadController.createFolder);

/**
 * @route PATCH /api/v1/uploads/folders/:id
 * @desc Update folder
 * @access Private
 */
router.patch('/folders/:id', protect, uploadController.updateFolder);

/**
 * @route DELETE /api/v1/uploads/folders/:id
 * @desc Delete folder
 * @access Private
 */
router.delete('/folders/:id', protect, uploadController.deleteFolder);

export default router;
