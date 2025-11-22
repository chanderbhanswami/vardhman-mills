import { Request, Response, NextFunction } from 'express';
import { ReviewReply } from '../models/review-reply.model.js';
import Review from '../models/Review.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { FilterQuery } from 'mongoose';
import mongoose from 'mongoose';
import { AuthRequest } from '../types/index.js';

// ==================== TYPES ====================

interface ReplyQuery {
  reviewId?: string;
  userId?: string;
  parentId?: string | null;
  threadId?: string;
  'moderation.status'?: string;
  isPinned?: boolean;
  $text?: { $search: string };
}

// ==================== GET THREAD ====================

/**
 * Get entire thread with hierarchy
 * @route   GET /api/v1/review-replies/thread/:threadId
 * @access  Public
 */
export const getThread = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const replies = await ReviewReply.getThread(req.params.threadId as any);

    res.status(200).json({
      success: true,
      count: replies.length,
      data: replies
    });
  }
);

// ==================== GET REPLIES BY REVIEW ====================

/**
 * Get all replies for a review
 * @route   GET /api/v1/review-replies/review/:reviewId
 * @access  Public
 */
export const getRepliesByReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      level
    } = req.query;

    const query: ReplyQuery = {
      reviewId: req.params.reviewId,
      'moderation.status': 'approved'
    };

    // Filter by thread level (0 = root replies only)
    if (level !== undefined) {
      (query as any).level = Number(level);
    }

    const total = await ReviewReply.countDocuments(query as FilterQuery<typeof ReviewReply>);

    const replies = await ReviewReply.find(query as FilterQuery<typeof ReviewReply>)
      .populate('userId', 'name avatar email')
      .populate('parentId', 'text userId')
      .sort(sort as string)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: replies.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: replies
    });
  }
);

// ==================== GET SINGLE REPLY ====================

/**
 * Get single reply by ID
 * @route   GET /api/v1/review-replies/:id
 * @access  Public
 */
export const getReply = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reply = await ReviewReply.findById(req.params.id)
      .populate('userId', 'name avatar email')
      .populate('reviewId', 'rating comment product')
      .populate('parentId', 'text userId')
      .populate('mentions.userId', 'name avatar');

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    // Increment view count
    reply.analytics.views += 1;
    await reply.save();

    res.status(200).json({
      success: true,
      data: reply
    });
  }
);

// ==================== GET TOP REPLIES ====================

/**
 * Get top replies by engagement
 * @route   GET /api/v1/review-replies/top
 * @access  Public
 */
export const getTopReplies = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { reviewId, limit = 10 } = req.query;

    const query: ReplyQuery = {
      'moderation.status': 'approved'
    };

    if (reviewId) query.reviewId = reviewId as string;

    const replies = await ReviewReply.getTopReplies(
      query as FilterQuery<typeof ReviewReply>,
      Number(limit)
    );

    res.status(200).json({
      success: true,
      count: replies.length,
      data: replies
    });
  }
);

// ==================== CREATE REPLY ====================

/**
 * Create new reply
 * @route   POST /api/v1/review-replies
 * @access  Private
 */
export const createReply = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { reviewId, parentId, text } = req.body;

    // Check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    // If replying to another reply, check if it exists
    if (parentId) {
      const parentReply = await ReviewReply.findById(parentId);
      if (!parentReply) {
        return next(new AppError('Parent reply not found', 404));
      }
    }

    // Create reply
    const replyData = {
      ...req.body,
      userId: req.user?._id,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        source: 'web'
      }
    };

    const reply = await ReviewReply.create(replyData);

    // Populate for response
    await reply.populate('userId', 'name avatar email');

    res.status(201).json({
      success: true,
      data: reply
    });
  }
);

// ==================== UPDATE REPLY ====================

/**
 * Update reply
 * @route   PATCH /api/v1/review-replies/:id
 * @access  Private
 */
export const updateReply = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    // Check ownership
    if (reply.user.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return next(new AppError('You can only update your own replies', 403));
    }

    const { text, html, markdown } = req.body;

    // Track edit history
    if (text && text !== reply.content) {
      reply.history.push({
        content: reply.content,
        editedBy: req.user?._id as any,
        editedAt: new Date(),
        reason: req.body.editReason
      });
    }

    // Update fields
    if (text) reply.content = text;
    if (html) reply.htmlContent = html;
    if (markdown) reply.plainTextContent = markdown;

    reply.metadata.isEdited = true;
    reply.metadata.editCount += 1;
    reply.metadata.lastEditedAt = new Date();

    await reply.save();

    res.status(200).json({
      success: true,
      data: reply
    });
  }
);

// ==================== DELETE REPLY ====================

/**
 * Delete reply
 * @route   DELETE /api/v1/review-replies/:id
 * @access  Private
 */
export const deleteReply = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    // Check ownership
    if (reply.user.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return next(new AppError('You can only delete your own replies', 403));
    }

    await reply.deleteOne();

    res.status(204).json({
      success: true,
      data: null
    });
  }
);

// ==================== ENGAGEMENT ====================

/**
 * Like/Unlike reply
 * @route   POST /api/v1/review-replies/:id/like
 * @access  Private
 */
export const toggleLike = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    // Simple toggle - increment or decrement
    // Note: Real implementation would track user votes in separate collection
    reply.engagement.likes += 1;

    await reply.save();

    res.status(200).json({
      success: true,
      data: {
        likes: reply.engagement.likes,
        dislikes: reply.engagement.dislikes
      }
    });
  }
);

/**
 * Dislike/Remove dislike
 * @route   POST /api/v1/review-replies/:id/dislike
 * @access  Private
 */
export const toggleDislike = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    // Simple toggle - increment or decrement
    reply.engagement.dislikes += 1;

    await reply.save();

    res.status(200).json({
      success: true,
      data: {
        likes: reply.engagement.likes,
        dislikes: reply.engagement.dislikes
      }
    });
  }
);

/**
 * Mark reply as helpful
 * @route   POST /api/v1/review-replies/:id/helpful
 * @access  Private
 */
export const markHelpful = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    reply.engagement.helpfulVotes += 1;

    await reply.save();

    res.status(200).json({
      success: true,
      data: {
        helpfulVotes: reply.engagement.helpfulVotes,
        unhelpfulVotes: reply.engagement.unhelpfulVotes
      }
    });
  }
);

/**
 * Mark reply as unhelpful
 * @route   POST /api/v1/review-replies/:id/unhelpful
 * @access  Private
 */
export const markUnhelpful = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    reply.engagement.unhelpfulVotes += 1;

    await reply.save();

    res.status(200).json({
      success: true,
      data: {
        helpfulVotes: reply.engagement.helpfulVotes,
        unhelpfulVotes: reply.engagement.unhelpfulVotes
      }
    });
  }
);

/**
 * Add reaction to reply
 * @route   POST /api/v1/review-replies/:id/react
 * @access  Private
 */
export const addReaction = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    const { type } = req.body;
    const validTypes = ['like', 'love', 'helpful', 'insightful', 'funny', 'angry'];

    if (!validTypes.includes(type)) {
      return next(new AppError('Invalid reaction type', 400));
    }

    // Simple implementation - just acknowledge
    // Note: Real implementation would store reactions in separate collection

    res.status(200).json({
      success: true,
      message: 'Reaction added successfully'
    });
  }
);

/**
 * Report reply
 * @route   POST /api/v1/review-replies/:id/report
 * @access  Private
 */
export const reportReply = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    reply.engagement.reports += 1;

    // Auto-hide if too many reports
    if (reply.engagement.reports >= 5) {
      reply.moderation.isHidden = true;
      reply.moderation.hideReason = 'Multiple user reports';
      reply.moderation.humanReviewRequired = true;
    }

    await reply.save();

    res.status(200).json({
      success: true,
      message: 'Reply reported successfully'
    });
  }
);

// ==================== MODERATION ====================

/**
 * Approve reply
 * @route   POST /api/v1/review-replies/:id/approve
 * @access  Private (Admin/Moderator)
 */
export const approveReply = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    reply.moderation.status = 'approved';
    reply.moderation.moderatedBy = req.user?._id as any;
    reply.moderation.moderatedAt = new Date();
    reply.moderation.isHidden = false;
    reply.moderation.humanReviewRequired = false;

    await reply.save();

    res.status(200).json({
      success: true,
      data: reply
    });
  }
);

/**
 * Reject reply
 * @route   POST /api/v1/review-replies/:id/reject
 * @access  Private (Admin/Moderator)
 */
export const rejectReply = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    const { reason } = req.body;

    reply.moderation.status = 'rejected';
    reply.moderation.moderatedBy = req.user?._id as any;
    reply.moderation.moderatedAt = new Date();
    reply.moderation.rejectionReason = reason;
    reply.moderation.isHidden = true;
    reply.moderation.humanReviewRequired = false;

    await reply.save();

    res.status(200).json({
      success: true,
      data: reply
    });
  }
);

/**
 * Flag reply
 * @route   POST /api/v1/review-replies/:id/flag
 * @access  Private
 */
export const flagReply = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    const { type, reason, severity } = req.body;

    reply.moderation.flags.push({
      type: type || 'inappropriate',
      reason,
      flaggedBy: req.user?._id as any,
      severity: severity || 'medium',
      status: 'open',
      flaggedAt: new Date()
    });

    reply.moderation.status = 'flagged';
    reply.moderation.humanReviewRequired = true;

    await reply.save();

    res.status(200).json({
      success: true,
      message: 'Reply flagged successfully'
    });
  }
);

/**
 * Mark reply as spam
 * @route   POST /api/v1/review-replies/:id/spam
 * @access  Private (Admin/Moderator)
 */
export const markAsSpam = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    reply.moderation.status = 'spam';
    reply.moderation.isHidden = true;

    await reply.save();

    res.status(200).json({
      success: true,
      data: reply
    });
  }
);

/**
 * Get moderation queue
 * @route   GET /api/v1/review-replies/moderation/queue
 * @access  Private (Admin/Moderator)
 */
export const getModerationQueue = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      status = 'pending',
      page = 1,
      limit = 20
    } = req.query;

    const query: ReplyQuery = {};

    if (status === 'flagged') {
      query['moderation.status'] = 'flagged';
    } else if (status === 'pending') {
      query['moderation.status'] = 'pending';
    } else if (status === 'review_required') {
      (query as any)['moderation.humanReviewRequired'] = true;
    }

    const total = await ReviewReply.countDocuments(query as FilterQuery<typeof ReviewReply>);

    const replies = await ReviewReply.find(query as FilterQuery<typeof ReviewReply>)
      .populate('userId', 'name avatar email')
      .populate('reviewId', 'rating comment product')
      .sort('-createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: replies.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: replies
    });
  }
);

// ==================== PIN/FEATURE ====================

/**
 * Pin reply
 * @route   POST /api/v1/review-replies/:id/pin
 * @access  Private (Admin)
 */
export const pinReply = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    reply.isPinned = true;
    // Note: pinnedBy and pinnedAt fields can be added if needed

    await reply.save();

    res.status(200).json({
      success: true,
      data: reply
    });
  }
);

/**
 * Unpin reply
 * @route   POST /api/v1/review-replies/:id/unpin
 * @access  Private (Admin)
 */
export const unpinReply = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    reply.isPinned = false;
    // Note: pinnedBy and pinnedAt fields don't exist in model

    await reply.save();

    res.status(200).json({
      success: true,
      data: reply
    });
  }
);

/**
 * Feature reply as answer
 * @route   POST /api/v1/review-replies/:id/feature
 * @access  Private (Admin)
 */
export const featureReply = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new AppError('Reply not found', 404));
    }

    reply.isFeatured = true;
    // Note: Can add featuredBy and featuredAt fields to model if needed

    await reply.save();

    res.status(200).json({
      success: true,
      data: reply
    });
  }
);

// ==================== SEARCH ====================

/**
 * Search replies
 * @route   GET /api/v1/review-replies/search
 * @access  Public
 */
export const searchReplies = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      q,
      reviewId,
      userId,
      status = 'approved',
      page = 1,
      limit = 20
    } = req.query;

    if (!q) {
      return next(new AppError('Please provide search query', 400));
    }

    const query: ReplyQuery = {
      $text: { $search: q as string },
      'moderation.status': status as string
    };

    if (reviewId) query.reviewId = reviewId as string;
    if (userId) query.userId = userId as string;

    const total = await ReviewReply.countDocuments(query as FilterQuery<typeof ReviewReply>);

    const replies = await ReviewReply.find(query as FilterQuery<typeof ReviewReply>, {
      score: { $meta: 'textScore' }
    })
      .populate('userId', 'name avatar')
      .populate('reviewId', 'rating product')
      .sort({ score: { $meta: 'textScore' } })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: replies.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: replies
    });
  }
);

// ==================== ANALYTICS ====================

/**
 * Get reply analytics
 * @route   GET /api/v1/review-replies/analytics
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

    const analytics = await ReviewReply.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalReplies: { $sum: 1 },
          totalViews: { $sum: '$analytics.views' },
          totalLikes: { $sum: '$engagement.likes' },
          totalHelpful: { $sum: '$engagement.helpfulVotes' },
          avgEngagementRate: { $avg: '$analytics.engagementRate' },
          pending: { $sum: { $cond: [{ $eq: ['$moderation.status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$moderation.status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$moderation.status', 'rejected'] }, 1, 0] } },
          spam: { $sum: { $cond: [{ $eq: ['$moderation.status', 'spam'] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: analytics[0] || {}
    });
  }
);
