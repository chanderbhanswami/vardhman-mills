import { Request, Response, NextFunction } from 'express';
import Bestseller from '../models/bestseller.model.js';
import Product from '../models/Product.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

// ==================== PUBLIC ROUTES ====================

/**
 * Get bestsellers list
 * @route GET /api/v1/bestsellers
 * @access Public
 */
export const getBestsellers = catchAsync(async (req: Request, res: Response) => {
  const {
    categoryId,
    brandId,
    page = 1,
    limit = 12,
    isActive = 'true',
    search
  } = req.query;

  const filter: any = {
    isActive: isActive === 'true',
    isFeatured: true // Only feature products
  };

  if (categoryId) filter.category = categoryId;
  if (brandId) filter.brand = brandId;

  // Search filter
  if (search) {
    const searchRegex = new RegExp(search as string, 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { 'seo.keywords': searchRegex }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  // Query main Product collection sorted by salesCount (highest first)
  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .sort({ salesCount: -1, rating: -1 }) // Sort by sales, then rating
    .skip(skip)
    .limit(Number(limit));

  const total = await Product.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    data: products
  });
});

/**
 * Get single bestseller by ID
 * @route GET /api/v1/bestsellers/:id
 * @access Public
 */
export const getBestsellerById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const bestseller = await Bestseller.findById(req.params.id)
    .populate('productId')
    .populate('categoryId', 'name slug')
    .populate('brandId', 'name slug logo');

  if (!bestseller) {
    return next(new AppError('Bestseller not found', 404));
  }

  res.status(200).json({
    success: true,
    data: bestseller
  });
});

/**
 * Get featured bestsellers
 * @route GET /api/v1/bestsellers/featured
 * @access Public
 */
export const getFeaturedBestsellers = catchAsync(async (req: Request, res: Response) => {
  const { period = 'monthly', limit = 10 } = req.query;

  const now = new Date();
  const bestsellers = await Bestseller.find({
    period,
    isActive: true,
    isFeatured: true,
    periodStartDate: { $lte: now },
    periodEndDate: { $gte: now }
  })
    .populate('productId', 'name slug images price inStock')
    .populate('categoryId', 'name slug')
    .populate('brandId', 'name slug logo')
    .sort({ rank: 1 })
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: bestsellers.length,
    data: bestsellers
  });
});

/**
 * Get top bestsellers by category
 * @route GET /api/v1/bestsellers/category/:categoryId
 * @access Public
 */
export const getBestsellersByCategory = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const { period = 'monthly', limit = 10 } = req.query;

  const now = new Date();
  const bestsellers = await Bestseller.find({
    categoryId,
    period,
    isActive: true,
    periodStartDate: { $lte: now },
    periodEndDate: { $gte: now }
  })
    .populate('productId', 'name slug images price inStock')
    .populate('brandId', 'name slug logo')
    .sort({ rank: 1 })
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: bestsellers.length,
    data: bestsellers
  });
});

/**
 * Get top bestsellers by brand
 * @route GET /api/v1/bestsellers/brand/:brandId
 * @access Public
 */
export const getBestsellersByBrand = catchAsync(async (req: Request, res: Response) => {
  const { brandId } = req.params;
  const { period = 'monthly', limit = 10 } = req.query;

  const now = new Date();
  const bestsellers = await Bestseller.find({
    brandId,
    period,
    isActive: true,
    periodStartDate: { $lte: now },
    periodEndDate: { $gte: now }
  })
    .populate('productId', 'name slug images price inStock')
    .populate('categoryId', 'name slug')
    .sort({ rank: 1 })
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: bestsellers.length,
    data: bestsellers
  });
});

/**
 * Get bestseller trends
 * @route GET /api/v1/bestsellers/trends
 * @access Public
 */
export const getBestsellerTrends = catchAsync(async (req: Request, res: Response) => {
  const { period = 'monthly', limit = 20 } = req.query;

  const now = new Date();
  const bestsellers = await Bestseller.find({
    period,
    isActive: true,
    periodStartDate: { $lte: now },
    periodEndDate: { $gte: now }
  })
    .populate('productId', 'name slug images price')
    .sort({ 'trends.salesChangePercentage': -1 })
    .limit(Number(limit));

  const trending = bestsellers.filter(b => b.trends.salesTrend === 'up');
  const declining = bestsellers.filter(b => b.trends.salesTrend === 'down');
  const stable = bestsellers.filter(b => b.trends.salesTrend === 'stable');

  res.status(200).json({
    success: true,
    data: {
      trending,
      declining,
      stable,
      summary: {
        totalTrending: trending.length,
        totalDeclining: declining.length,
        totalStable: stable.length
      }
    }
  });
});

// ==================== ADMIN ROUTES ====================

/**
 * Create new bestseller entry
 * @route POST /api/v1/bestsellers
 * @access Private (Admin)
 */
export const createBestseller = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if product exists
  const product = await Product.findById(req.body.productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check for duplicate entry
  const existing = await Bestseller.findOne({
    productId: req.body.productId,
    period: req.body.period
  });

  if (existing) {
    return next(new AppError('Bestseller entry already exists for this product and period', 400));
  }

  const bestseller = await Bestseller.create({
    ...req.body,
    createdBy: req.user?._id
  });

  res.status(201).json({
    success: true,
    data: bestseller
  });
});

/**
 * Update bestseller entry
 * @route PATCH /api/v1/bestsellers/:id
 * @access Private (Admin)
 */
export const updateBestseller = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const bestseller = await Bestseller.findById(req.params.id);

  if (!bestseller) {
    return next(new AppError('Bestseller not found', 404));
  }

  // Store previous rank before update
  if (req.body.rank && req.body.rank !== bestseller.rank) {
    bestseller.previousRank = bestseller.rank;
  }

  Object.assign(bestseller, req.body);
  bestseller.updatedBy = req.user?._id as any;
  await bestseller.save();

  res.status(200).json({
    success: true,
    data: bestseller
  });
});

/**
 * Delete bestseller entry
 * @route DELETE /api/v1/bestsellers/:id
 * @access Private (Admin)
 */
export const deleteBestseller = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const bestseller = await Bestseller.findById(req.params.id);

  if (!bestseller) {
    return next(new AppError('Bestseller not found', 404));
  }

  await bestseller.deleteOne();

  res.status(204).json({
    success: true,
    data: null
  });
});

/**
 * Get bestseller analytics
 * @route GET /api/v1/bestsellers/analytics/overview
 * @access Private (Admin)
 */
export const getBestsellerAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { period = 'monthly' } = req.query;

  const now = new Date();
  const filter = {
    period,
    isActive: true,
    periodStartDate: { $lte: now },
    periodEndDate: { $gte: now }
  };

  // Total statistics
  const totalBestsellers = await Bestseller.countDocuments(filter);
  const activeBestsellers = await Bestseller.countDocuments({ ...filter, isActive: true });
  const featuredBestsellers = await Bestseller.countDocuments({ ...filter, isFeatured: true });

  // Revenue and sales
  const revenueStats = await Bestseller.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$revenue' },
        totalSales: { $sum: '$salesCount' },
        averageRevenue: { $avg: '$revenue' },
        averageSales: { $avg: '$salesCount' },
        totalViews: { $sum: '$views' },
        totalConversions: { $sum: '$conversions' }
      }
    }
  ]);

  // Category distribution
  const categoryStats = await Bestseller.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$categoryId',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$revenue' },
        totalSales: { $sum: '$salesCount' }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 }
  ]);

  // Brand distribution
  const brandStats = await Bestseller.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$brandId',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$revenue' },
        totalSales: { $sum: '$salesCount' }
      }
    },
    {
      $lookup: {
        from: 'brands',
        localField: '_id',
        foreignField: '_id',
        as: 'brand'
      }
    },
    { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 }
  ]);

  // Trend analysis
  const trendStats = await Bestseller.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$trends.salesTrend',
        count: { $sum: 1 },
        averageChange: { $avg: '$trends.salesChangePercentage' }
      }
    }
  ]);

  // Top performers
  const topPerformers = await Bestseller.find(filter)
    .populate('productId', 'name slug images')
    .sort({ revenue: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalBestsellers,
        activeBestsellers,
        featuredBestsellers,
        ...((revenueStats[0] || {}) as object)
      },
      categoryDistribution: categoryStats,
      brandDistribution: brandStats,
      trendAnalysis: trendStats,
      topPerformers
    }
  });
});

/**
 * Sync bestsellers from sales data
 * @route POST /api/v1/bestsellers/sync
 * @access Private (Admin)
 */
export const syncBestsellers = catchAsync(async (req: Request, res: Response) => {
  const { period = 'monthly', limit = 100 } = req.body;

  // Calculate period dates
  const now = new Date();
  let periodStartDate: Date;
  let periodEndDate = now;

  switch (period) {
    case 'daily':
      periodStartDate = new Date(now.setHours(0, 0, 0, 0));
      periodEndDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'weekly':
      periodStartDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'monthly':
      periodStartDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'quarterly':
      periodStartDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case 'yearly':
      periodStartDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      periodStartDate = new Date(now.setMonth(now.getMonth() - 1));
  }

  // This is a placeholder - in reality, you'd aggregate from orders collection
  // For now, update lastSyncedAt on existing bestsellers
  await Bestseller.updateMany(
    { period },
    { lastSyncedAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: `Bestsellers synced for ${period} period`,
    data: {
      period,
      periodStartDate,
      periodEndDate,
      syncedAt: new Date()
    }
  });
});

/**
 * Bulk update bestsellers
 * @route PATCH /api/v1/bestsellers/bulk-update
 * @access Private (Admin)
 */
export const bulkUpdateBestsellers = catchAsync(async (req: Request, res: Response) => {
  const { ids, updates } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Please provide an array of bestseller IDs'
    });
    return;
  }

  const result = await Bestseller.updateMany(
    { _id: { $in: ids } },
    { ...updates, updatedBy: req.user?._id, updatedAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: `Updated ${result.modifiedCount} bestsellers`,
    data: {
      matched: result.matchedCount,
      modified: result.modifiedCount
    }
  });
});

/**
 * Bulk delete bestsellers
 * @route DELETE /api/v1/bestsellers/bulk-delete
 * @access Private (Admin)
 */
export const bulkDeleteBestsellers = catchAsync(async (req: Request, res: Response) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Please provide an array of bestseller IDs'
    });
    return;
  }

  const result = await Bestseller.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    message: `Deleted ${result.deletedCount} bestsellers`,
    data: {
      deletedCount: result.deletedCount
    }
  });
});

/**
 * Update bestseller ranks
 * @route PATCH /api/v1/bestsellers/update-ranks
 * @access Private (Admin)
 */
export const updateBestsellerRanks = catchAsync(async (req: Request, res: Response) => {
  const { rankings } = req.body; // Array of { id, rank }

  if (!rankings || !Array.isArray(rankings) || rankings.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Please provide rankings array with id and rank'
    });
    return;
  }

  const bulkOps = rankings.map((item: any) => ({
    updateOne: {
      filter: { _id: item.id },
      update: {
        $set: {
          previousRank: '$rank',
          rank: item.rank,
          updatedBy: req.user?._id,
          updatedAt: new Date()
        }
      }
    }
  }));

  const result = await Bestseller.bulkWrite(bulkOps);

  res.status(200).json({
    success: true,
    message: 'Bestseller ranks updated',
    data: {
      modified: result.modifiedCount
    }
  });
});
