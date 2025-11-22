import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.model.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// ==================== REVIEW CRUD ====================

/**
 * Get all reviews for a product
 * GET /api/v1/products/:productId/reviews
 */
export const getProductReviews = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { productId } = req.params;
  const { rating, verified, withMedia, sortBy, page, limit } = req.query;

  const reviews = await Review.getProductReviews(
    new mongoose.Types.ObjectId(productId),
    {
      rating: rating ? parseInt(rating as string) : undefined,
      verified: verified === 'true',
      withMedia: withMedia === 'true',
      sortBy: sortBy || 'recent',
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10
    }
  );

  const total = await Review.countDocuments({
    product: productId,
    isApproved: true,
    isActive: true
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    data: { reviews }
  });
});

/**
 * Get a single review by ID
 * GET /api/v1/reviews/:id
 */
export const getReview = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  const review = await Review.findById(id)
    .populate('user', 'name avatar')
    .populate('product', 'name images slug')
    .populate('response.respondedBy', 'name role');

  if (!review || !review.isActive) {
    return next(new AppError('Review not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

/**
 * Get user's reviews
 * GET /api/v1/reviews/my-reviews
 */
export const getMyReviews = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?._id as unknown as mongoose.Types.ObjectId;
  const { page, limit } = req.query;

  const reviews = await Review.getUserReviews(userId, {
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 10
  });

  const total = await Review.countDocuments({
    user: userId,
    isActive: true
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    data: { reviews }
  });
});

/**
 * Create a new review
 * POST /api/v1/products/:productId/reviews
 */
export const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { productId } = req.params;
  const userId = req.user?._id as unknown as mongoose.Types.ObjectId;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    user: userId,
    product: productId
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this product', 400));
  }

  // Check if user purchased this product
  let isVerifiedPurchase = false;
  let orderId;

  if (req.body.orderId) {
    const order = await Order.findOne({
      _id: req.body.orderId,
      user: userId,
      'items.product': productId,
      status: 'delivered'
    });

    if (order) {
      isVerifiedPurchase = true;
      orderId = order._id;
    }
  }

  // Create review
  const reviewData = {
    user: userId,
    product: productId,
    order: orderId,
    rating: req.body.rating,
    title: req.body.title,
    comment: req.body.comment,
    images: req.body.images || [],
    videos: req.body.videos || [],
    pros: req.body.pros || [],
    cons: req.body.cons || [],
    wouldRecommend: req.body.wouldRecommend,
    isVerifiedPurchase
  };

  const review = await Review.create(reviewData);

  // Populate user and product
  await review.populate('user', 'name avatar');
  await review.populate('product', 'name images slug');

  res.status(201).json({
    status: 'success',
    data: { review }
  });
});

/**
 * Update a review
 * PATCH /api/v1/reviews/:id
 */
export const updateReview = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?._id;

  const review = await Review.findOne({
    _id: id,
    user: userId,
    isActive: true
  });

  if (!review) {
    return next(new AppError('Review not found or you do not have permission to edit it', 404));
  }

  // Update allowed fields
  const allowedUpdates = ['rating', 'title', 'comment', 'images', 'videos', 'pros', 'cons', 'wouldRecommend'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      (review as any)[field] = req.body[field];
    }
  });

  await review.save();

  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

/**
 * Delete a review
 * DELETE /api/v1/reviews/:id
 */
export const deleteReview = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?._id;

  const review = await Review.findOne({
    _id: id,
    user: userId
  });

  if (!review) {
    return next(new AppError('Review not found or you do not have permission to delete it', 404));
  }

  // Soft delete
  review.isActive = false;
  review.deletedAt = new Date();
  await review.save();

  res.status(200).json({
    status: 'success',
    message: 'Review deleted successfully'
  });
});

// ==================== VOTING SYSTEM ====================

/**
 * Vote on a review (helpful/unhelpful)
 * POST /api/v1/reviews/:id/vote
 */
export const voteReview = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { voteType } = req.body;
  const userId = req.user?._id as unknown as mongoose.Types.ObjectId;

  if (!['helpful', 'unhelpful'].includes(voteType)) {
    return next(new AppError('Vote type must be either "helpful" or "unhelpful"', 400));
  }

  const review = await Review.findById(id);

  if (!review || !review.isActive) {
    return next(new AppError('Review not found', 404));
  }

  await review.addVote(userId, voteType);

  res.status(200).json({
    status: 'success',
    data: {
      review,
      helpfulVotes: review.helpfulVotes,
      unhelpfulVotes: review.unhelpfulVotes
    }
  });
});

/**
 * Remove vote from a review
 * DELETE /api/v1/reviews/:id/vote
 */
export const removeVote = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?._id as unknown as mongoose.Types.ObjectId;

  const review = await Review.findById(id);

  if (!review || !review.isActive) {
    return next(new AppError('Review not found', 404));
  }

  await review.removeVote(userId);

  res.status(200).json({
    status: 'success',
    data: {
      helpfulVotes: review.helpfulVotes,
      unhelpfulVotes: review.unhelpfulVotes
    }
  });
});

// ==================== FLAGGING & MODERATION ====================

/**
 * Flag a review for moderation
 * POST /api/v1/reviews/:id/flag
 */
export const flagReview = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user?._id as unknown as mongoose.Types.ObjectId;

  if (!reason) {
    return next(new AppError('Please provide a reason for flagging', 400));
  }

  const review = await Review.findById(id);

  if (!review || !review.isActive) {
    return next(new AppError('Review not found', 404));
  }

  await review.flagReview(userId, reason);

  res.status(200).json({
    status: 'success',
    message: 'Review flagged successfully for moderation'
  });
});

/**
 * Get flagged reviews (admin only)
 * GET /api/v1/reviews/flagged
 */
export const getFlaggedReviews = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({
    isFlagged: true,
    isActive: true
  })
    .populate('user', 'name email avatar')
    .populate('product', 'name images slug')
    .populate('flaggedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({
    isFlagged: true,
    isActive: true
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: { reviews }
  });
});

// ==================== ADMIN RESPONSE ====================

/**
 * Add response to a review (admin/seller)
 * POST /api/v1/reviews/:id/response
 */
export const addResponse = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { text } = req.body;
  const adminId = req.user?._id as unknown as mongoose.Types.ObjectId;

  if (!text) {
    return next(new AppError('Response text is required', 400));
  }

  const review = await Review.findById(id);

  if (!review || !review.isActive) {
    return next(new AppError('Review not found', 404));
  }

  await review.addResponse(text, adminId);

  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

/**
 * Delete response from a review (admin/seller)
 * DELETE /api/v1/reviews/:id/response
 */
export const deleteResponse = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (!review || !review.isActive) {
    return next(new AppError('Review not found', 404));
  }

  review.response = undefined;
  await review.save();

  res.status(200).json({
    status: 'success',
    message: 'Response deleted successfully'
  });
});

// ==================== APPROVAL & MODERATION ====================

/**
 * Approve a review (admin only)
 * PATCH /api/v1/reviews/:id/approve
 */
export const approveReview = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const adminId = req.user?._id as unknown as mongoose.Types.ObjectId;

  const review = await Review.findById(id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  await review.approve(adminId);

  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

/**
 * Reject a review (admin only)
 * PATCH /api/v1/reviews/:id/reject
 */
export const rejectReview = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { reason } = req.body;
  const adminId = req.user?._id as unknown as mongoose.Types.ObjectId;

  if (!reason) {
    return next(new AppError('Please provide a reason for rejection', 400));
  }

  const review = await Review.findById(id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  await review.reject(adminId, reason);

  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

/**
 * Get pending reviews (admin only)
 * GET /api/v1/reviews/pending
 */
export const getPendingReviews = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({
    isApproved: false,
    isActive: true
  })
    .populate('user', 'name email avatar')
    .populate('product', 'name images slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({
    isApproved: false,
    isActive: true
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: { reviews }
  });
});

// ==================== STATISTICS & ANALYTICS ====================

/**
 * Get top helpful reviews for a product
 * GET /api/v1/products/:productId/reviews/top
 */
export const getTopReviews = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { productId } = req.params;
  const limit = parseInt(req.query.limit as string) || 5;

  const reviews = await Review.getTopReviews(
    new mongoose.Types.ObjectId(productId),
    limit
  );

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  });
});

/**
 * Get rating distribution for a product
 * GET /api/v1/products/:productId/reviews/distribution
 */
export const getRatingDistribution = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { productId } = req.params;

  const distribution = await Review.getRatingDistribution(
    new mongoose.Types.ObjectId(productId)
  );

  const total = Object.values(distribution).reduce((sum: number, count) => sum + (count as number), 0);

  const percentages: any = {};
  Object.keys(distribution).forEach(rating => {
    percentages[rating] = total > 0
      ? ((distribution[rating] / total) * 100).toFixed(1)
      : 0;
  });

  res.status(200).json({
    status: 'success',
    data: {
      distribution,
      percentages,
      total
    }
  });
});

/**
 * Get review statistics (admin)
 * GET /api/v1/reviews/stats
 */
export const getReviewStats = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const [
    totalReviews,
    approvedReviews,
    pendingReviews,
    flaggedReviews,
    verifiedReviews,
    reviewsWithMedia
  ] = await Promise.all([
    Review.countDocuments({ isActive: true }),
    Review.countDocuments({ isApproved: true, isActive: true }),
    Review.countDocuments({ isApproved: false, isActive: true }),
    Review.countDocuments({ isFlagged: true, isActive: true }),
    Review.countDocuments({ isVerifiedPurchase: true, isActive: true }),
    Review.countDocuments({
      isActive: true,
      $or: [
        { 'images.0': { $exists: true } },
        { 'videos.0': { $exists: true } }
      ]
    })
  ]);

  // Average rating across all products
  const avgRatingStats = await Review.aggregate([
    {
      $match: { isApproved: true, isActive: true }
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  // Most reviewed products
  const topProducts = await Review.aggregate([
    {
      $match: { isApproved: true, isActive: true }
    },
    {
      $group: {
        _id: '$product',
        reviewCount: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    },
    {
      $sort: { reviewCount: -1 }
    },
    {
      $limit: 10
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $project: {
        productId: '$_id',
        productName: '$product.name',
        productSlug: '$product.slug',
        reviewCount: 1,
        avgRating: { $round: ['$avgRating', 1] }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalReviews,
        approvedReviews,
        pendingReviews,
        flaggedReviews,
        verifiedReviews,
        reviewsWithMedia,
        averageRating: avgRatingStats.length > 0
          ? avgRatingStats[0].avgRating.toFixed(2)
          : 0
      },
      topProducts
    }
  });
});

// ==================== BULK OPERATIONS ====================

/**
 * Bulk approve reviews (admin only)
 * POST /api/v1/reviews/bulk-approve
 */
export const bulkApproveReviews = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { reviewIds } = req.body;
  const adminId = req.user?._id as unknown as mongoose.Types.ObjectId;

  if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
    return next(new AppError('Please provide an array of review IDs', 400));
  }

  const result = await Review.updateMany(
    { _id: { $in: reviewIds } },
    {
      isApproved: true,
      approvedBy: adminId,
      approvedAt: new Date(),
      isFlagged: false,
      flagReason: undefined,
      rejectionReason: undefined
    }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} reviews approved successfully`,
    data: {
      approvedCount: result.modifiedCount
    }
  });
});

/**
 * Bulk delete reviews (admin only)
 * DELETE /api/v1/reviews/bulk-delete
 */
export const bulkDeleteReviews = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { reviewIds } = req.body;

  if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
    return next(new AppError('Please provide an array of review IDs', 400));
  }

  const result = await Review.updateMany(
    { _id: { $in: reviewIds } },
    {
      isActive: false,
      deletedAt: new Date()
    }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} reviews deleted successfully`,
    data: {
      deletedCount: result.modifiedCount
    }
  });
});
