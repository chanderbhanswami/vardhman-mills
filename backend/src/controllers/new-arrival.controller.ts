import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import NewArrival from '../models/new-arrival.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// ==================== PUBLIC ENDPOINTS ====================

/**
 * Get all new arrivals with comprehensive filtering
 * @route GET /api/v1/new-arrivals
 * @access Public
 */
export const getNewArrivals = catchAsync(async (req: Request, res: Response) => {
  const {
    categoryId,
    brandId,
    collectionId,
    isFeatured,
    isPriority,
    isTrending,
    stockStatus,
    isActive = 'true',
    showExpired = 'false',
    page = '1',
    limit = '20',
    sortBy = 'arrivalDate',
    sortOrder = 'desc',
    search
  } = req.query;

  // Build filter
  const filter: any = {};
  
  if (isActive !== 'all') {
    filter.isActive = isActive === 'true';
  }
  
  if (showExpired !== 'true') {
    filter.isExpired = false;
    filter.isNew = true;
  }
  
  if (categoryId) filter.categoryId = categoryId;
  if (brandId) filter.brandId = brandId;
  if (collectionId) filter.collectionIds = collectionId;
  if (isFeatured) filter.isFeatured = isFeatured === 'true';
  if (isPriority) filter.isPriority = isPriority === 'true';
  if (isTrending) filter['trending.isTrending'] = isTrending === 'true';
  if (stockStatus) filter.stockStatus = stockStatus;
  
  // Date filtering (only show launched items)
  const now = new Date();
  filter.launchDate = { $lte: now };
  
  // Search
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { launchMessage: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search as string, 'i')] } }
    ];
  }
  
  // Pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;
  
  // Sorting
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
  
  const newArrivals = await NewArrival.find(filter)
    .populate('productId', 'name slug price images stock')
    .populate('categoryId', 'name slug')
    .populate('brandId', 'name slug logo')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);
  
  const total = await NewArrival.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: newArrivals.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    data: newArrivals
  });
});

/**
 * Get single new arrival by ID
 * @route GET /api/v1/new-arrivals/:id
 * @access Public
 */
export const getNewArrivalById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newArrival = await NewArrival.findById(req.params.id)
    .populate('productId')
    .populate('categoryId')
    .populate('brandId')
    .populate('collectionIds');
  
  if (!newArrival) {
    return next(new AppError('New arrival not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: newArrival
  });
});

/**
 * Get featured new arrivals
 * @route GET /api/v1/new-arrivals/featured
 * @access Public
 */
export const getFeaturedNewArrivals = catchAsync(async (req: Request, res: Response) => {
  const { limit = '10' } = req.query;
  
  const now = new Date();
  const newArrivals = await NewArrival.find({
    isActive: true,
    isFeatured: true,
    isNew: true,
    isExpired: false,
    launchDate: { $lte: now }
  })
    .populate('productId', 'name slug price images stock')
    .populate('categoryId', 'name slug')
    .populate('brandId', 'name slug logo')
    .sort({ displayOrder: 1, arrivalDate: -1 })
    .limit(parseInt(limit as string));
  
  res.status(200).json({
    success: true,
    count: newArrivals.length,
    data: newArrivals
  });
});

/**
 * Get trending new arrivals
 * @route GET /api/v1/new-arrivals/trending
 * @access Public
 */
export const getTrendingNewArrivals = catchAsync(async (req: Request, res: Response) => {
  const { limit = '10' } = req.query;
  
  const newArrivals = await (NewArrival as any).getTrendingNewArrivals(parseInt(limit as string));
  
  res.status(200).json({
    success: true,
    count: newArrivals.length,
    data: newArrivals
  });
});

/**
 * Get new arrivals by category
 * @route GET /api/v1/new-arrivals/category/:categoryId
 * @access Public
 */
export const getNewArrivalsByCategory = catchAsync(async (req: Request, res: Response) => {
  const { limit = '10' } = req.query;
  const { categoryId } = req.params;
  
  const now = new Date();
  const newArrivals = await NewArrival.find({
    categoryId,
    isActive: true,
    isNew: true,
    isExpired: false,
    launchDate: { $lte: now }
  })
    .populate('productId', 'name slug price images stock')
    .populate('brandId', 'name slug logo')
    .sort({ arrivalDate: -1, displayOrder: 1 })
    .limit(parseInt(limit as string));
  
  res.status(200).json({
    success: true,
    count: newArrivals.length,
    data: newArrivals
  });
});

/**
 * Get new arrivals by brand
 * @route GET /api/v1/new-arrivals/brand/:brandId
 * @access Public
 */
export const getNewArrivalsByBrand = catchAsync(async (req: Request, res: Response) => {
  const { limit = '10' } = req.query;
  const { brandId } = req.params;
  
  const now = new Date();
  const newArrivals = await NewArrival.find({
    brandId,
    isActive: true,
    isNew: true,
    isExpired: false,
    launchDate: { $lte: now }
  })
    .populate('productId', 'name slug price images stock')
    .populate('categoryId', 'name slug')
    .sort({ arrivalDate: -1, displayOrder: 1 })
    .limit(parseInt(limit as string));
  
  res.status(200).json({
    success: true,
    count: newArrivals.length,
    data: newArrivals
  });
});

/**
 * Get priority new arrivals (spotlight items)
 * @route GET /api/v1/new-arrivals/priority
 * @access Public
 */
export const getPriorityNewArrivals = catchAsync(async (req: Request, res: Response) => {
  const { limit = '5' } = req.query;
  
  const now = new Date();
  const newArrivals = await NewArrival.find({
    isActive: true,
    isPriority: true,
    isNew: true,
    isExpired: false,
    launchDate: { $lte: now }
  })
    .populate('productId', 'name slug price images stock')
    .populate('categoryId', 'name slug')
    .populate('brandId', 'name slug logo')
    .sort({ displayOrder: 1, 'trending.trendScore': -1 })
    .limit(parseInt(limit as string));
  
  res.status(200).json({
    success: true,
    count: newArrivals.length,
    data: newArrivals
  });
});

/**
 * Get upcoming/pre-launch new arrivals
 * @route GET /api/v1/new-arrivals/upcoming
 * @access Public
 */
export const getUpcomingNewArrivals = catchAsync(async (req: Request, res: Response) => {
  const { limit = '10' } = req.query;
  
  const now = new Date();
  const newArrivals = await NewArrival.find({
    isActive: true,
    isPreLaunch: true,
    launchDate: { $gt: now }
  })
    .populate('productId', 'name slug price images')
    .populate('categoryId', 'name slug')
    .populate('brandId', 'name slug logo')
    .sort({ launchDate: 1 })
    .limit(parseInt(limit as string));
  
  res.status(200).json({
    success: true,
    count: newArrivals.length,
    data: newArrivals
  });
});

// ==================== ADMIN ENDPOINTS ====================

/**
 * Create new arrival
 * @route POST /api/v1/new-arrivals
 * @access Admin
 */
export const createNewArrival = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if product exists
  const { productId } = req.body;
  
  // Check for duplicate
  const existing = await NewArrival.findOne({ productId });
  if (existing) {
    res.status(400).json({
      success: false,
      message: 'New arrival already exists for this product'
    });
    return;
  }
  
  // Create new arrival
  const newArrival = await NewArrival.create({
    ...req.body,
    createdBy: req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : undefined
  });
  
  await newArrival.populate('productId categoryId brandId');
  
  res.status(201).json({
    success: true,
    message: 'New arrival created successfully',
    data: newArrival
  });
});

/**
 * Update new arrival
 * @route PATCH /api/v1/new-arrivals/:id
 * @access Admin
 */
export const updateNewArrival = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newArrival = await NewArrival.findById(req.params.id);
  
  if (!newArrival) {
    return next(new AppError('New arrival not found', 404));
  }
  
  Object.assign(newArrival, req.body);
  if (req.user?._id) {
    newArrival.updatedBy = new mongoose.Types.ObjectId(req.user._id);
  }
  await newArrival.save();
  
  await newArrival.populate('productId categoryId brandId');
  
  res.status(200).json({
    success: true,
    message: 'New arrival updated successfully',
    data: newArrival
  });
});

/**
 * Delete new arrival
 * @route DELETE /api/v1/new-arrivals/:id
 * @access Admin
 */
export const deleteNewArrival = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newArrival = await NewArrival.findById(req.params.id);
  
  if (!newArrival) {
    return next(new AppError('New arrival not found', 404));
  }
  
  await newArrival.deleteOne();
  
  res.status(204).json({
    success: true,
    message: 'New arrival deleted successfully'
  });
});

/**
 * Get new arrival analytics
 * @route GET /api/v1/new-arrivals/analytics/overview
 * @access Admin
 */
export const getNewArrivalAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { days = '30' } = req.query;
  const daysNum = parseInt(days as string);
  
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysNum);
  
  // Summary stats
  const totalNewArrivals = await NewArrival.countDocuments();
  const activeNewArrivals = await NewArrival.countDocuments({ isActive: true, isNew: true, isExpired: false });
  const featuredCount = await NewArrival.countDocuments({ isFeatured: true, isActive: true });
  const trendingCount = await NewArrival.countDocuments({ 'trending.isTrending': true, isActive: true });
  const expiredCount = await NewArrival.countDocuments({ isExpired: true });
  const upcomingCount = await NewArrival.countDocuments({ isPreLaunch: true, isActive: true });
  
  // Performance metrics aggregation
  const performanceMetrics = await NewArrival.aggregate([
    {
      $match: {
        arrivalDate: { $gte: dateThreshold }
      }
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: '$metrics.views' },
        totalClicks: { $sum: '$metrics.clicks' },
        totalPurchases: { $sum: '$metrics.purchases' },
        totalWishlists: { $sum: '$metrics.wishlists' },
        totalAddToCarts: { $sum: '$metrics.addToCart' },
        averageCTR: { $avg: '$metrics.clickThroughRate' },
        averageConversionRate: { $avg: '$metrics.conversionRate' },
        averageRating: { $avg: '$metrics.averageRating' }
      }
    }
  ]);
  
  // Category distribution
  const categoryStats = await NewArrival.aggregate([
    {
      $match: { isActive: true, isNew: true }
    },
    {
      $group: {
        _id: '$categoryId',
        count: { $sum: 1 },
        totalViews: { $sum: '$metrics.views' },
        totalPurchases: { $sum: '$metrics.purchases' }
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
    {
      $unwind: '$category'
    },
    {
      $project: {
        categoryId: '$_id',
        categoryName: '$category.name',
        count: 1,
        totalViews: 1,
        totalPurchases: 1
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);
  
  // Brand distribution
  const brandStats = await NewArrival.aggregate([
    {
      $match: { isActive: true, isNew: true }
    },
    {
      $group: {
        _id: '$brandId',
        count: { $sum: 1 },
        totalViews: { $sum: '$metrics.views' },
        totalPurchases: { $sum: '$metrics.purchases' }
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
    {
      $unwind: '$brand'
    },
    {
      $project: {
        brandId: '$_id',
        brandName: '$brand.name',
        count: 1,
        totalViews: 1,
        totalPurchases: 1
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);
  
  // Top performers
  const topPerformers = await NewArrival.find({
    isActive: true,
    isNew: true
  })
    .populate('productId', 'name slug price images')
    .sort({ 'metrics.purchases': -1 })
    .limit(10)
    .select('productId metrics trending');
  
  // Trending analysis
  const trendingStats = await NewArrival.aggregate([
    {
      $match: { isActive: true, isNew: true }
    },
    {
      $group: {
        _id: '$trending.trendDirection',
        count: { $sum: 1 },
        averageTrendScore: { $avg: '$trending.trendScore' }
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalNewArrivals,
        activeNewArrivals,
        featuredCount,
        trendingCount,
        expiredCount,
        upcomingCount,
        period: `Last ${daysNum} days`
      },
      performance: performanceMetrics[0] || {},
      categoryDistribution: categoryStats,
      brandDistribution: brandStats,
      topPerformers,
      trendingAnalysis: trendingStats
    }
  });
});

/**
 * Update new arrival metrics (views, clicks, etc.)
 * @route PATCH /api/v1/new-arrivals/:id/metrics
 * @access Admin
 */
export const updateNewArrivalMetrics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { metricType, increment = 1 } = req.body;
  
  const validMetrics = ['views', 'clicks', 'addToCart', 'purchases', 'wishlists', 'shares'];
  
  if (!validMetrics.includes(metricType)) {
    res.status(400).json({
      success: false,
      message: 'Invalid metric type'
    });
    return;
  }
  
  const newArrival = await NewArrival.findByIdAndUpdate(
    id,
    { $inc: { [`metrics.${metricType}`]: increment } },
    { new: true }
  );
  
  if (!newArrival) {
    return next(new AppError('New arrival not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Metrics updated successfully',
    data: newArrival
  });
});

/**
 * Bulk update new arrivals
 * @route PATCH /api/v1/new-arrivals/bulk-update
 * @access Admin
 */
export const bulkUpdateNewArrivals = catchAsync(async (req: Request, res: Response) => {
  const { ids, updates } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Please provide an array of new arrival IDs'
    });
    return;
  }
  
  const result = await NewArrival.updateMany(
    { _id: { $in: ids } },
    { ...updates, updatedBy: req.user?._id }
  );
  
  res.status(200).json({
    success: true,
    message: 'New arrivals updated successfully',
    data: {
      matched: result.matchedCount,
      modified: result.modifiedCount
    }
  });
});

/**
 * Bulk delete new arrivals
 * @route DELETE /api/v1/new-arrivals/bulk-delete
 * @access Admin
 */
export const bulkDeleteNewArrivals = catchAsync(async (req: Request, res: Response) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Please provide an array of new arrival IDs'
    });
    return;
  }
  
  const result = await NewArrival.deleteMany({ _id: { $in: ids } });
  
  res.status(200).json({
    success: true,
    message: 'New arrivals deleted successfully',
    data: {
      deletedCount: result.deletedCount
    }
  });
});

/**
 * Expire old new arrivals (batch job)
 * @route POST /api/v1/new-arrivals/expire-old
 * @access Admin
 */
export const expireOldNewArrivals = catchAsync(async (req: Request, res: Response) => {
  const now = new Date();
  
  // Find and expire new arrivals past their expiry date
  const result = await NewArrival.updateMany(
    {
      isNew: true,
      isExpired: false,
      $or: [
        { expiryDate: { $lt: now } },
        {
          expiryDate: { $exists: false },
          $expr: {
            $lt: [
              { $add: ['$arrivalDate', { $multiply: ['$autoExpireDays', 24 * 60 * 60 * 1000] }] },
              now
            ]
          }
        }
      ]
    },
    {
      isExpired: true,
      isNew: false,
      updatedBy: req.user?._id
    }
  );
  
  res.status(200).json({
    success: true,
    message: 'Old new arrivals expired successfully',
    data: {
      expiredCount: result.modifiedCount
    }
  });
});

/**
 * Send notifications for new arrivals
 * @route POST /api/v1/new-arrivals/:id/notify
 * @access Admin
 */
export const sendNewArrivalNotifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { channels = ['email'] } = req.body; // email, push, sms
  
  const newArrival = await NewArrival.findById(id);
  
  if (!newArrival) {
    return next(new AppError('New arrival not found', 404));
  }
  
  // TODO: Implement actual notification logic here
  // This is a placeholder for integration with notification service
  
  const notificationUpdates: any = {
    'notifications.notificationDate': new Date()
  };
  
  if (channels.includes('email')) notificationUpdates['notifications.emailSent'] = true;
  if (channels.includes('push')) notificationUpdates['notifications.pushSent'] = true;
  if (channels.includes('sms')) notificationUpdates['notifications.smsSent'] = true;
  
  await NewArrival.findByIdAndUpdate(id, notificationUpdates);
  
  res.status(200).json({
    success: true,
    message: 'Notifications sent successfully',
    data: {
      channels,
      sentAt: new Date()
    }
  });
});

/**
 * Update display order
 * @route PATCH /api/v1/new-arrivals/update-order
 * @access Admin
 */
export const updateDisplayOrder = catchAsync(async (req: Request, res: Response) => {
  const { items } = req.body; // [{ id, displayOrder }]
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Please provide an array of items with id and displayOrder'
    });
    return;
  }
  
  const bulkOps = items.map(item => ({
    updateOne: {
      filter: { _id: item.id },
      update: { displayOrder: item.displayOrder, updatedBy: req.user?._id }
    }
  }));
  
  const result = await NewArrival.bulkWrite(bulkOps);
  
  res.status(200).json({
    success: true,
    message: 'Display order updated successfully',
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});
