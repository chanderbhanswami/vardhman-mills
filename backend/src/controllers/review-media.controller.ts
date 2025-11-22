import { Request, Response, NextFunction } from 'express';
import { ReviewMedia } from '../models/review-media.model.js';
import Review from '../models/Review.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { FilterQuery } from 'mongoose';
import { AuthRequest } from '../types/index.js';

// ==================== TYPES ====================

interface MediaQuery {
  reviewId?: string;
  type?: string;
  'moderation.status'?: string;
  featured?: boolean;
  tags?: { $in: string[] };
  'processing.status'?: string;
  'analytics.likes'?: { $gte: number };
}

// ==================== GET ALL MEDIA ====================

/**
 * Get all review media with filters
 * @route   GET /api/v1/review-media
 * @access  Public
 */
export const getAllMedia = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      reviewId,
      type,
      status,
      featured,
      tags,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query: MediaQuery = {};
    
    if (reviewId) query.reviewId = reviewId as string;
    if (type) query.type = type as string;
    if (status) query['moderation.status'] = status as string;
    if (featured === 'true') query.featured = true;
    if (tags) query.tags = { $in: (tags as string).split(',') };

    // Count total documents
    const total = await ReviewMedia.countDocuments(query as FilterQuery<typeof ReviewMedia>);

    // Execute query with pagination
    const media = await ReviewMedia.find(query as FilterQuery<typeof ReviewMedia>)
      .populate('reviewId', 'rating comment user product')
      .populate('moderation.moderatedBy', 'name email')
      .sort(sort as string)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: media.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: media
    });
  }
);

// ==================== GET SINGLE MEDIA ====================

/**
 * Get single review media by ID
 * @route   GET /api/v1/review-media/:id
 * @access  Public
 */
export const getMediaById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const media = await ReviewMedia.findById(req.params.id)
      .populate('reviewId', 'rating comment user product')
      .populate('moderation.moderatedBy', 'name email');

    if (!media) {
      return next(new AppError('Media not found', 404));
    }

    // Increment view count
    media.analytics.views += 1;
    await media.save();

    res.status(200).json({
      success: true,
      data: media
    });
  }
);

// ==================== CREATE MEDIA ====================

/**
 * Create new review media
 * @route   POST /api/v1/review-media
 * @access  Private
 */
export const createMedia = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { reviewId } = req.body;

    // Check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return next(new AppError('You can only add media to your own reviews', 403));
    }

    const media = await ReviewMedia.create(req.body);

    res.status(201).json({
      success: true,
      data: media
    });
  }
);

// ==================== UPDATE MEDIA ====================

/**
 * Update review media
 * @route   PATCH /api/v1/review-media/:id
 * @access  Private
 */
export const updateMedia = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let media = await ReviewMedia.findById(req.params.id).populate('review');

    if (!media) {
      return next(new AppError('Media not found', 404));
    }

    // Check permissions
    const review = media.review as any;
    if (review.user.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return next(new AppError('You can only update your own media', 403));
    }

    // Don't allow updating certain fields
    const { reviewId, url, cloudinaryId, ...updateData } = req.body;

    media = await ReviewMedia.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: media
    });
  }
);

// ==================== DELETE MEDIA ====================

/**
 * Delete review media
 * @route   DELETE /api/v1/review-media/:id
 * @access  Private
 */
export const deleteMedia = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const media = await ReviewMedia.findById(req.params.id).populate('review');

    if (!media) {
      return next(new AppError('Media not found', 404));
    }

    // Check permissions
    const review = media.review as any;
    if (review.user.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return next(new AppError('You can only delete your own media', 403));
    }

    await media.deleteOne();

    res.status(204).json({
      success: true,
      data: null
    });
  }
);

// ==================== BULK DELETE ====================

/**
 * Bulk delete review media
 * @route   DELETE /api/v1/review-media/bulk-delete
 * @access  Private (Admin)
 */
export const bulkDeleteMedia = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new AppError('Please provide media IDs to delete', 400));
    }

    const result = await ReviewMedia.deleteMany({
      _id: { $in: ids }
    });

    res.status(200).json({
      success: true,
      data: {
        deletedCount: result.deletedCount
      }
    });
  }
);

// ==================== OPTIMIZATION ====================

/**
 * Optimize single media
 * @route   POST /api/v1/review-media/:id/optimize
 * @access  Private (Admin)
 */
export const optimizeMedia = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const media = await ReviewMedia.findById(req.params.id);

    if (!media) {
      return next(new AppError('Media not found', 404));
    }

    // Update optimization status
    media.optimization.isOptimized = true;
    media.optimization.optimizedAt = new Date();
    
    // Calculate compression if provided
    if (req.body.compressedSize) {
      media.optimization.compressedSize = req.body.compressedSize;
      media.optimization.compressionRatio = 
        (media.optimization.originalSize - req.body.compressedSize) / media.optimization.originalSize;
    }

    if (req.body.formats) {
      media.optimization.formats = req.body.formats;
    }

    if (req.body.thumbnails) {
      media.optimization.thumbnails = req.body.thumbnails;
    }

    await media.save();

    res.status(200).json({
      success: true,
      data: media
    });
  }
);

/**
 * Bulk optimize media
 * @route   POST /api/v1/review-media/bulk-optimize
 * @access  Private (Admin)
 */
export const bulkOptimizeMedia = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new AppError('Please provide media IDs to optimize', 400));
    }

    const result = await ReviewMedia.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          'optimization.isOptimized': true,
          'optimization.optimizedAt': new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  }
);

// ==================== THUMBNAILS ====================

/**
 * Generate thumbnails for media
 * @route   POST /api/v1/review-media/:id/thumbnails
 * @access  Private (Admin)
 */
export const generateThumbnails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const media = await ReviewMedia.findById(req.params.id);

    if (!media) {
      return next(new AppError('Media not found', 404));
    }

    const { thumbnails } = req.body;

    if (!thumbnails || !Array.isArray(thumbnails)) {
      return next(new AppError('Please provide thumbnails array', 400));
    }

    media.optimization.thumbnails = thumbnails;
    await media.save();

    res.status(200).json({
      success: true,
      data: media
    });
  }
);

// ==================== FORMAT CONVERSION ====================

/**
 * Convert media format
 * @route   POST /api/v1/review-media/:id/convert
 * @access  Private (Admin)
 */
export const convertFormat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const media = await ReviewMedia.findById(req.params.id);

    if (!media) {
      return next(new AppError('Media not found', 404));
    }

    const { format, url, size } = req.body;

    if (!format || !url) {
      return next(new AppError('Please provide format and URL', 400));
    }

    // Add new format
    media.optimization.formats.push({
      format,
      url,
      size: size || 0,
      quality: 'medium'
    });

    await media.save();

    res.status(200).json({
      success: true,
      data: media
    });
  }
);

// ==================== WATERMARK ====================

/**
 * Add watermark to media
 * @route   POST /api/v1/review-media/:id/watermark
 * @access  Private (Admin)
 */
export const addWatermark = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const media = await ReviewMedia.findById(req.params.id);

    if (!media) {
      return next(new AppError('Media not found', 404));
    }

    const { text, image, position, opacity, size } = req.body;

    media.watermark = {
      enabled: true,
      text,
      imageUrl: image,
      position: position || 'bottom-right',
      opacity: opacity || 0.5
    };

    await media.save();

    res.status(200).json({
      success: true,
      data: media
    });
  }
);

/**
 * Remove watermark from media
 * @route   DELETE /api/v1/review-media/:id/watermark
 * @access  Private (Admin)
 */
export const removeWatermark = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const media = await ReviewMedia.findById(req.params.id);

    if (!media) {
      return next(new AppError('Media not found', 404));
    }

    if (media.watermark) {
      media.watermark.enabled = false;
    }
    await media.save();

    res.status(200).json({
      success: true,
      data: media
    });
  }
);

// ==================== MODERATION ====================

/**
 * Approve media
 * @route   POST /api/v1/review-media/:id/approve
 * @access  Private (Admin/Moderator)
 */
export const approveMedia = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const media = await ReviewMedia.findById(req.params.id);

    if (!media) {
      return next(new AppError('Media not found', 404));
    }

    media.moderation.status = 'approved';
    media.moderation.moderatedBy = req.user?._id as any;
    media.moderation.moderatedAt = new Date();
    media.moderation.humanReviewRequired = false;

    await media.save();

    res.status(200).json({
      success: true,
      data: media
    });
  }
);

/**
 * Reject media
 * @route   POST /api/v1/review-media/:id/reject
 * @access  Private (Admin/Moderator)
 */
export const rejectMedia = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const media = await ReviewMedia.findById(req.params.id);

    if (!media) {
      return next(new AppError('Media not found', 404));
    }

    const { reason } = req.body;

    if (!reason) {
      return next(new AppError('Please provide rejection reason', 400));
    }

    media.moderation.status = 'rejected';
    media.moderation.moderatedBy = req.user?._id as any;
    media.moderation.moderatedAt = new Date();
    media.moderation.rejectionReason = reason;
    media.moderation.humanReviewRequired = false;

    await media.save();

    res.status(200).json({
      success: true,
      data: media
    });
  }
);

/**
 * Flag media
 * @route   POST /api/v1/review-media/:id/flag
 * @access  Private
 */
export const flagMedia = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const media = await ReviewMedia.findById(req.params.id);

    if (!media) {
      return next(new AppError('Media not found', 404));
    }

    const { type, reason, severity } = req.body;

    if (!type || !reason) {
      return next(new AppError('Please provide flag type and reason', 400));
    }

    media.moderation.flags.push({
      type,
      reason,
      flaggedBy: req.user?._id as any,
      severity: severity || 'medium',
      status: 'open',
      flaggedAt: new Date()
    });

    media.moderation.status = 'flagged';
    media.moderation.humanReviewRequired = true;

    await media.save();

    res.status(200).json({
      success: true,
      data: media
    });
  }
);

/**
 * Unflag media
 * @route   POST /api/v1/review-media/:id/unflag
 * @access  Private (Admin/Moderator)
 */
export const unflagMedia = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const media = await ReviewMedia.findById(req.params.id);

    if (!media) {
      return next(new AppError('Media not found', 404));
    }

    media.moderation.status = 'approved';
    media.moderation.flags = [];
    media.moderation.humanReviewRequired = false;

    await media.save();

    res.status(200).json({
      success: true,
      data: media
    });
  }
);

/**
 * Get moderation queue
 * @route   GET /api/v1/review-media/moderation/queue
 * @access  Private (Admin/Moderator)
 */
export const getModerationQueue = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      status = 'pending',
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query: MediaQuery = {
      'moderation.status': status as string
    };

    const total = await ReviewMedia.countDocuments(query as FilterQuery<typeof ReviewMedia>);

    const media = await ReviewMedia.find(query as FilterQuery<typeof ReviewMedia>)
      .populate('reviewId', 'rating comment user product')
      .sort(sort as string)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: media.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: media
    });
  }
);

/**
 * Assign moderator to media
 * @route   POST /api/v1/review-media/:id/assign-moderator
 * @access  Private (Admin)
 */
export const assignModerator = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const media = await ReviewMedia.findById(req.params.id);

    if (!media) {
      return next(new AppError('Media not found', 404));
    }

    const { moderatorId } = req.body;

    if (!moderatorId) {
      return next(new AppError('Please provide moderator ID', 400));
    }

    media.moderation.moderatedBy = moderatorId;
    await media.save();

    res.status(200).json({
      success: true,
      data: media
    });
  }
);

/**
 * Bulk moderate media
 * @route   POST /api/v1/review-media/bulk-moderate
 * @access  Private (Admin/Moderator)
 */
export const bulkModerate = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { ids, action, reason } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new AppError('Please provide media IDs', 400));
    }

    if (!['approve', 'reject'].includes(action)) {
      return next(new AppError('Invalid action. Use approve or reject', 400));
    }

    const updateData: any = {
      'moderation.status': action === 'approve' ? 'approved' : 'rejected',
      'moderation.moderatedBy': req.user?._id,
      'moderation.moderatedAt': new Date(),
      'moderation.humanReviewRequired': false
    };

    if (action === 'reject' && reason) {
      updateData['moderation.rejectionReason'] = reason;
    }

    const result = await ReviewMedia.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  }
);

// ==================== ANALYTICS ====================

/**
 * Get media analytics
 * @route   GET /api/v1/review-media/analytics
 * @access  Private (Admin)
 */
export const getAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    const matchStage: any = {};
    
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
    }

    const analytics = await ReviewMedia.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalMedia: { $sum: 1 },
          totalImages: { $sum: { $cond: [{ $eq: ['$type', 'image'] }, 1, 0] } },
          totalVideos: { $sum: { $cond: [{ $eq: ['$type', 'video'] }, 1, 0] } },
          totalViews: { $sum: '$analytics.views' },
          totalLikes: { $sum: '$analytics.likes' },
          totalShares: { $sum: '$analytics.shares' },
          totalDownloads: { $sum: '$analytics.downloads' },
          totalReports: { $sum: '$analytics.reports' },
          avgEngagementRate: { $avg: '$analytics.engagementRate' },
          pending: { $sum: { $cond: [{ $eq: ['$moderation.status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$moderation.status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$moderation.status', 'rejected'] }, 1, 0] } },
          flagged: { $sum: { $cond: [{ $eq: ['$moderation.status', 'flagged'] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: analytics[0] || {}
    });
  }
);

/**
 * Get media statistics
 * @route   GET /api/v1/review-media/stats
 * @access  Private (Admin)
 */
export const getMediaStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { reviewId } = req.query;

    const matchStage: MediaQuery = {};
    if (reviewId) matchStage.reviewId = reviewId as string;

    const stats = await ReviewMedia.aggregate([
      { $match: matchStage as any },
      {
        $facet: {
          byType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalSize: { $sum: '$metadata.size' }
              }
            }
          ],
          byStatus: [
            {
              $group: {
                _id: '$moderation.status',
                count: { $sum: 1 }
              }
            }
          ],
          topPerforming: [
            { $sort: { 'analytics.engagementRate': -1 } },
            { $limit: 10 },
            {
              $project: {
                url: 1,
                type: 1,
                engagementRate: '$analytics.engagementRate',
                views: '$analytics.views',
                likes: '$analytics.likes'
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0]
    });
  }
);
