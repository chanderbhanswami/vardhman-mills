import { Request, Response, NextFunction } from 'express';
import FAQ from '../models/FAQ.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// ==================== PUBLIC FAQ OPERATIONS ====================

/**
 * Get all published FAQs
 * @route GET /api/v1/faqs
 * @access Public
 */
export const getAllFAQs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category, tag, sort = 'order' } = req.query;

    // Build query
    const query: any = { isPublished: true };

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    // Build sort
    let sortOption: any = {};
    switch (sort) {
      case 'views':
        sortOption = { views: -1 };
        break;
      case 'helpful':
        sortOption = { helpful: -1 };
        break;
      case 'recent':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { order: 1, createdAt: -1 };
    }

    const faqs = await FAQ.find(query)
      .sort(sortOption)
      .populate('relatedFAQs', 'question category slug')
      .lean();

    res.status(200).json({
      status: 'success',
      results: faqs.length,
      data: { faqs }
    });
  }
);

/**
 * Get single FAQ by ID
 * @route GET /api/v1/faqs/:id
 * @access Public
 */
export const getFAQ = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const faq = await FAQ.findById(req.params.id)
      .populate('relatedFAQs', 'question category slug')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!faq) {
      return next(new AppError('FAQ not found', 404));
    }

    // Only allow published FAQs for non-admin users
    if (!faq.isPublished && req.user?.role !== 'admin') {
      return next(new AppError('FAQ not found', 404));
    }

    // Increment views
    await faq.incrementViews();

    res.status(200).json({
      status: 'success',
      data: { faq }
    });
  }
);

/**
 * Search FAQs
 * @route GET /api/v1/faqs/search
 * @access Public
 */
export const searchFAQs = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { q, category } = req.query;

    if (!q || (q as string).trim().length === 0) {
      res.status(200).json({
        status: 'success',
        results: 0,
        data: { faqs: [] }
      });
      return;
    }

    const faqs = await FAQ.searchFAQs(q as string, category as string);

    res.status(200).json({
      status: 'success',
      results: faqs.length,
      data: { faqs }
    });
  }
);

/**
 * Get FAQs by category
 * @route GET /api/v1/faqs/category/:category
 * @access Public
 */
export const getFAQsByCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.params;

    const faqs = await FAQ.getByCategory(category);

    res.status(200).json({
      status: 'success',
      results: faqs.length,
      data: { faqs }
    });
  }
);

/**
 * Get all categories
 * @route GET /api/v1/faqs/categories
 * @access Public
 */
export const getCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await FAQ.getAllCategories();

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: { categories }
    });
  }
);

/**
 * Get most viewed FAQs
 * @route GET /api/v1/faqs/popular/most-viewed
 * @access Public
 */
export const getMostViewed = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10;

    const faqs = await FAQ.getMostViewed(limit);

    res.status(200).json({
      status: 'success',
      results: faqs.length,
      data: { faqs }
    });
  }
);

/**
 * Get most helpful FAQs
 * @route GET /api/v1/faqs/popular/most-helpful
 * @access Public
 */
export const getMostHelpful = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10;

    const faqs = await FAQ.getMostHelpful(limit);

    res.status(200).json({
      status: 'success',
      results: faqs.length,
      data: { faqs }
    });
  }
);

/**
 * Get FAQs by tags
 * @route GET /api/v1/faqs/tags/:tags
 * @access Public
 */
export const getFAQsByTags = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tags = (req.params.tags as string).split(',');

    const faqs = await FAQ.getByTags(tags);

    res.status(200).json({
      status: 'success',
      results: faqs.length,
      data: { faqs }
    });
  }
);

// ==================== FEEDBACK OPERATIONS ====================

/**
 * Mark FAQ as helpful
 * @route POST /api/v1/faqs/:id/helpful
 * @access Public
 */
export const markHelpful = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return next(new AppError('FAQ not found', 404));
    }

    await faq.markHelpful();

    res.status(200).json({
      status: 'success',
      data: { message: 'Thank you for your feedback!' }
    });
  }
);

/**
 * Mark FAQ as not helpful
 * @route POST /api/v1/faqs/:id/not-helpful
 * @access Public
 */
export const markNotHelpful = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return next(new AppError('FAQ not found', 404));
    }

    await faq.markNotHelpful();

    res.status(200).json({
      status: 'success',
      data: { message: 'Thank you for your feedback!' }
    });
  }
);

// ==================== ADMIN OPERATIONS ====================

/**
 * Get all FAQs (Admin - includes unpublished)
 * @route GET /api/v1/faqs/admin/all
 * @access Private/Admin
 */
export const getAllFAQsAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.isPublished !== undefined) {
      query.isPublished = req.query.isPublished === 'true';
    }

    if (req.query.search) {
      query.$or = [
        { question: { $regex: req.query.search, $options: 'i' } },
        { answer: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [faqs, total] = await Promise.all([
      FAQ.find(query)
        .sort({ order: 1, createdAt: -1 })
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .skip(skip)
        .limit(limit)
        .lean(),
      FAQ.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      results: faqs.length,
      data: {
        faqs,
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
 * Create FAQ
 * @route POST /api/v1/faqs
 * @access Private/Admin
 */
export const createFAQ = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const faqData = {
      ...req.body,
      createdBy: req.user?._id
    };

    const faq = await FAQ.create(faqData);

    res.status(201).json({
      status: 'success',
      data: { faq }
    });
  }
);

/**
 * Update FAQ
 * @route PATCH /api/v1/faqs/:id
 * @access Private/Admin
 */
export const updateFAQ = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const updateData = {
      ...req.body,
      updatedBy: req.user?._id
    };

    const faq = await FAQ.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!faq) {
      return next(new AppError('FAQ not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { faq }
    });
  }
);

/**
 * Delete FAQ
 * @route DELETE /api/v1/faqs/:id
 * @access Private/Admin
 */
export const deleteFAQ = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const faq = await FAQ.findByIdAndDelete(req.params.id);

    if (!faq) {
      return next(new AppError('FAQ not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

/**
 * Toggle FAQ publish status
 * @route PATCH /api/v1/faqs/:id/toggle-publish
 * @access Private/Admin
 */
export const togglePublish = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return next(new AppError('FAQ not found', 404));
    }

    faq.isPublished = !faq.isPublished;
    if (req.user?._id) {
      (faq as any).updatedBy = req.user._id;
    }
    await faq.save();

    res.status(200).json({
      status: 'success',
      data: { faq }
    });
  }
);

/**
 * Reorder FAQs
 * @route PATCH /api/v1/faqs/reorder
 * @access Private/Admin
 */
export const reorderFAQs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { faqIds } = req.body;

    if (!Array.isArray(faqIds) || faqIds.length === 0) {
      return next(new AppError('FAQ IDs array is required', 400));
    }

    await FAQ.reorderFAQs(faqIds);

    res.status(200).json({
      status: 'success',
      data: { message: 'FAQs reordered successfully' }
    });
  }
);

/**
 * Bulk update FAQs
 * @route PATCH /api/v1/faqs/bulk-update
 * @access Private/Admin
 */
export const bulkUpdateFAQs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { faqIds, updates } = req.body;

    if (!Array.isArray(faqIds) || faqIds.length === 0) {
      return next(new AppError('FAQ IDs array is required', 400));
    }

    if (!updates || Object.keys(updates).length === 0) {
      return next(new AppError('Updates object is required', 400));
    }

    const updateData = {
      ...updates,
      updatedBy: req.user?._id
    };

    const result = await FAQ.updateMany(
      { _id: { $in: faqIds } },
      { $set: updateData }
    );

    res.status(200).json({
      status: 'success',
      data: {
        message: `Updated ${result.modifiedCount} FAQs`,
        modifiedCount: result.modifiedCount
      }
    });
  }
);

/**
 * Bulk delete FAQs
 * @route DELETE /api/v1/faqs/bulk-delete
 * @access Private/Admin
 */
export const bulkDeleteFAQs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { faqIds } = req.body;

    if (!Array.isArray(faqIds) || faqIds.length === 0) {
      return next(new AppError('FAQ IDs array is required', 400));
    }

    const result = await FAQ.deleteMany({ _id: { $in: faqIds } });

    res.status(200).json({
      status: 'success',
      data: {
        message: `Deleted ${result.deletedCount} FAQs`,
        deletedCount: result.deletedCount
      }
    });
  }
);

/**
 * Get FAQ statistics
 * @route GET /api/v1/faqs/admin/stats
 * @access Private/Admin
 */
export const getFAQStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const [
      totalFAQs,
      publishedFAQs,
      unpublishedFAQs,
      categoryStats,
      mostViewed,
      mostHelpful
    ] = await Promise.all([
      FAQ.countDocuments(),
      FAQ.countDocuments({ isPublished: true }),
      FAQ.countDocuments({ isPublished: false }),
      FAQ.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            published: {
              $sum: { $cond: ['$isPublished', 1, 0] }
            }
          }
        },
        { $sort: { count: -1 } }
      ]),
      FAQ.getMostViewed(5),
      FAQ.getMostHelpful(5)
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          total: totalFAQs,
          published: publishedFAQs,
          unpublished: unpublishedFAQs,
          byCategory: categoryStats,
          mostViewed,
          mostHelpful
        }
      }
    });
  }
);

export default {
  // Public operations
  getAllFAQs,
  getFAQ,
  searchFAQs,
  getFAQsByCategory,
  getCategories,
  getMostViewed,
  getMostHelpful,
  getFAQsByTags,

  // Feedback operations
  markHelpful,
  markNotHelpful,

  // Admin operations
  getAllFAQsAdmin,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  togglePublish,
  reorderFAQs,
  bulkUpdateFAQs,
  bulkDeleteFAQs,
  getFAQStats
};
