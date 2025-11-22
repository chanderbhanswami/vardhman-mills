import { Request, Response, NextFunction } from 'express';
import NewsletterSubscriber from '../models/NewsletterSubscriber.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import crypto from 'crypto';

// ==================== PUBLIC SUBSCRIPTION OPERATIONS ====================

/**
 * Subscribe to newsletter
 * @route POST /api/v1/newsletter/subscribe
 * @access Public
 */
export const subscribe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, firstName, lastName, preferences, source = 'website' } = req.body;

    // Check if already subscribed
    const existing = await NewsletterSubscriber.findByEmail(email);

    if (existing) {
      if (existing.status === 'active') {
        return next(new AppError('Email is already subscribed', 400));
      }
      
      // Resubscribe if previously unsubscribed
      if (existing.status === 'unsubscribed') {
        await existing.resubscribe();
        return res.status(200).json({
          status: 'success',
          data: {
            message: 'Welcome back! You have been resubscribed.',
            subscriber: existing
          }
        });
      }
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const subscriberData: any = {
      email,
      firstName,
      lastName,
      source,
      verificationToken,
      user: req.user?._id,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        referer: req.headers['referer']
      }
    };

    if (preferences) {
      subscriberData.preferences = preferences;
    }

    const subscriber = await NewsletterSubscriber.create(subscriberData);

    // TODO: Send verification email with verificationToken

    res.status(201).json({
      status: 'success',
      data: {
        message: 'Please check your email to verify your subscription',
        subscriber: {
          email: subscriber.email,
          status: subscriber.status
        }
      }
    });
  }
);

/**
 * Verify email subscription
 * @route GET /api/v1/newsletter/verify/:token
 * @access Public
 */
export const verifySubscription = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;

    const subscriber = await NewsletterSubscriber.findOne({
      verificationToken: token
    }).select('+verificationToken');

    if (!subscriber) {
      return next(new AppError('Invalid or expired verification token', 400));
    }

    if (subscriber.isVerified) {
      return res.status(200).json({
        status: 'success',
        data: { message: 'Email is already verified' }
      });
    }

    await subscriber.verify();

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Email verified successfully! Welcome to our newsletter.',
        subscriber
      }
    });
  }
);

/**
 * Unsubscribe from newsletter
 * @route POST /api/v1/newsletter/unsubscribe/:token
 * @access Public
 */
export const unsubscribe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { reason } = req.body;

    const subscriber = await NewsletterSubscriber.findOne({
      unsubscribeToken: token
    });

    if (!subscriber) {
      return next(new AppError('Invalid unsubscribe token', 400));
    }

    if (subscriber.status === 'unsubscribed') {
      return res.status(200).json({
        status: 'success',
        data: { message: 'You are already unsubscribed' }
      });
    }

    await subscriber.unsubscribe(reason);

    res.status(200).json({
      status: 'success',
      data: {
        message: 'You have been successfully unsubscribed',
        subscriber
      }
    });
  }
);

/**
 * Update subscription preferences
 * @route PATCH /api/v1/newsletter/preferences/:token
 * @access Public
 */
export const updatePreferences = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { frequency, categories } = req.body;

    const subscriber = await NewsletterSubscriber.findOne({
      unsubscribeToken: token
    });

    if (!subscriber) {
      return next(new AppError('Invalid token', 400));
    }

    await subscriber.updatePreferences({ frequency, categories });

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Preferences updated successfully',
        subscriber
      }
    });
  }
);

/**
 * Get subscription status
 * @route GET /api/v1/newsletter/status/:email
 * @access Public
 */
export const getSubscriptionStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.params;

    const subscriber = await NewsletterSubscriber.findByEmail(email);

    if (!subscriber) {
      res.status(200).json({
        status: 'success',
        data: {
          subscribed: false,
          message: 'Email is not subscribed'
        }
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        subscribed: subscriber.status === 'active',
        status: subscriber.status,
        isVerified: subscriber.isVerified,
        preferences: subscriber.preferences
      }
    });
  }
);

// ==================== ADMIN OPERATIONS ====================

/**
 * Get all subscribers (Admin)
 * @route GET /api/v1/newsletter/subscribers
 * @access Private/Admin
 */
export const getAllSubscribers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.isVerified !== undefined) {
      query.isVerified = req.query.isVerified === 'true';
    }

    if (req.query.source) {
      query.source = req.query.source;
    }

    if (req.query.tag) {
      query.tags = req.query.tag;
    }

    if (req.query.search) {
      query.$or = [
        { email: { $regex: req.query.search, $options: 'i' } },
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [subscribers, total] = await Promise.all([
      NewsletterSubscriber.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NewsletterSubscriber.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      results: subscribers.length,
      data: {
        subscribers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  }
);

/**
 * Get active subscribers (Admin)
 * @route GET /api/v1/newsletter/subscribers/active
 * @access Private/Admin
 */
export const getActiveSubscribers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.query;

    const subscribers = await NewsletterSubscriber.getActiveSubscribers(
      category as string
    );

    res.status(200).json({
      status: 'success',
      results: subscribers.length,
      data: { subscribers }
    });
  }
);

/**
 * Get subscribers by tags (Admin)
 * @route GET /api/v1/newsletter/subscribers/tags/:tags
 * @access Private/Admin
 */
export const getSubscribersByTags = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tags = (req.params.tags as string).split(',');

    const subscribers = await NewsletterSubscriber.getByTags(tags);

    res.status(200).json({
      status: 'success',
      results: subscribers.length,
      data: { subscribers }
    });
  }
);

/**
 * Get single subscriber (Admin)
 * @route GET /api/v1/newsletter/subscribers/:id
 * @access Private/Admin
 */
export const getSubscriber = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const subscriber = await NewsletterSubscriber.findById(req.params.id)
      .populate('user', 'name email');

    if (!subscriber) {
      return next(new AppError('Subscriber not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { subscriber }
    });
  }
);

/**
 * Update subscriber (Admin)
 * @route PATCH /api/v1/newsletter/subscribers/:id
 * @access Private/Admin
 */
export const updateSubscriber = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const subscriber = await NewsletterSubscriber.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!subscriber) {
      return next(new AppError('Subscriber not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { subscriber }
    });
  }
);

/**
 * Delete subscriber (Admin)
 * @route DELETE /api/v1/newsletter/subscribers/:id
 * @access Private/Admin
 */
export const deleteSubscriber = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const subscriber = await NewsletterSubscriber.findByIdAndDelete(
      req.params.id
    );

    if (!subscriber) {
      return next(new AppError('Subscriber not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

/**
 * Add tags to subscriber (Admin)
 * @route POST /api/v1/newsletter/subscribers/:id/tags
 * @access Private/Admin
 */
export const addTags = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tags } = req.body;

    if (!Array.isArray(tags) || tags.length === 0) {
      return next(new AppError('Tags array is required', 400));
    }

    const subscriber = await NewsletterSubscriber.findById(req.params.id);

    if (!subscriber) {
      return next(new AppError('Subscriber not found', 404));
    }

    // Add new tags (avoid duplicates)
    const newTags = tags.filter((tag) => !subscriber.tags.includes(tag));
    subscriber.tags.push(...newTags);
    await subscriber.save();

    res.status(200).json({
      status: 'success',
      data: { subscriber }
    });
  }
);

/**
 * Remove tags from subscriber (Admin)
 * @route DELETE /api/v1/newsletter/subscribers/:id/tags
 * @access Private/Admin
 */
export const removeTags = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tags } = req.body;

    if (!Array.isArray(tags) || tags.length === 0) {
      return next(new AppError('Tags array is required', 400));
    }

    const subscriber = await NewsletterSubscriber.findById(req.params.id);

    if (!subscriber) {
      return next(new AppError('Subscriber not found', 404));
    }

    subscriber.tags = subscriber.tags.filter((tag) => !tags.includes(tag));
    await subscriber.save();

    res.status(200).json({
      status: 'success',
      data: { subscriber }
    });
  }
);

/**
 * Bulk import subscribers (Admin)
 * @route POST /api/v1/newsletter/subscribers/bulk-import
 * @access Private/Admin
 */
export const bulkImport = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { subscribers } = req.body;

    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      return next(new AppError('Subscribers array is required', 400));
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as any[]
    };

    for (const data of subscribers) {
      try {
        const existing = await NewsletterSubscriber.findByEmail(data.email);
        
        if (existing) {
          results.skipped++;
          continue;
        }

        await NewsletterSubscriber.create({
          ...data,
          source: 'import',
          isVerified: data.isVerified || false
        });
        
        results.imported++;
      } catch (error: any) {
        results.errors.push({
          email: data.email,
          error: error.message
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        message: `Imported ${results.imported} subscribers, skipped ${results.skipped}`,
        results
      }
    });
  }
);

/**
 * Bulk update subscribers (Admin)
 * @route PATCH /api/v1/newsletter/subscribers/bulk-update
 * @access Private/Admin
 */
export const bulkUpdate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { subscriberIds, updates } = req.body;

    if (!Array.isArray(subscriberIds) || subscriberIds.length === 0) {
      return next(new AppError('Subscriber IDs array is required', 400));
    }

    if (!updates || Object.keys(updates).length === 0) {
      return next(new AppError('Updates object is required', 400));
    }

    const result = await NewsletterSubscriber.updateMany(
      { _id: { $in: subscriberIds } },
      { $set: updates }
    );

    res.status(200).json({
      status: 'success',
      data: {
        message: `Updated ${result.modifiedCount} subscribers`,
        modifiedCount: result.modifiedCount
      }
    });
  }
);

/**
 * Bulk delete subscribers (Admin)
 * @route DELETE /api/v1/newsletter/subscribers/bulk-delete
 * @access Private/Admin
 */
export const bulkDelete = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { subscriberIds } = req.body;

    if (!Array.isArray(subscriberIds) || subscriberIds.length === 0) {
      return next(new AppError('Subscriber IDs array is required', 400));
    }

    const result = await NewsletterSubscriber.deleteMany({
      _id: { $in: subscriberIds }
    });

    res.status(200).json({
      status: 'success',
      data: {
        message: `Deleted ${result.deletedCount} subscribers`,
        deletedCount: result.deletedCount
      }
    });
  }
);

/**
 * Get subscriber statistics (Admin)
 * @route GET /api/v1/newsletter/stats
 * @access Private/Admin
 */
export const getStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await NewsletterSubscriber.getSubscriberStats();

    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  }
);

/**
 * Cleanup unverified subscribers (Admin)
 * @route POST /api/v1/newsletter/cleanup
 * @access Private/Admin
 */
export const cleanupUnverified = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const days = parseInt(req.query.days as string) || 30;

    const deletedCount = await NewsletterSubscriber.cleanupUnverified(days);

    res.status(200).json({
      status: 'success',
      data: {
        message: `Deleted ${deletedCount} unverified subscribers older than ${days} days`,
        deletedCount
      }
    });
  }
);

/**
 * Export subscribers (Admin)
 * @route GET /api/v1/newsletter/export
 * @access Private/Admin
 */
export const exportSubscribers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status, isVerified } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const subscribers = await NewsletterSubscriber.find(query)
      .select('email firstName lastName status isVerified preferences tags createdAt')
      .lean();

    res.status(200).json({
      status: 'success',
      results: subscribers.length,
      data: { subscribers }
    });
  }
);

export default {
  // Public operations
  subscribe,
  verifySubscription,
  unsubscribe,
  updatePreferences,
  getSubscriptionStatus,

  // Admin operations
  getAllSubscribers,
  getActiveSubscribers,
  getSubscribersByTags,
  getSubscriber,
  updateSubscriber,
  deleteSubscriber,
  addTags,
  removeTags,
  bulkImport,
  bulkUpdate,
  bulkDelete,
  getStats,
  cleanupUnverified,
  exportSubscribers
};
