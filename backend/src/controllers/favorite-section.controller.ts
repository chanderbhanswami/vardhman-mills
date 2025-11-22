import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import FavoriteSection from '../models/favorite-section.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// ==================== PUBLIC ENDPOINTS ====================

/**
 * Get all favorite sections with filtering
 * @route GET /api/v1/favorite-sections
 * @access Public
 */
export const getFavoriteSections = catchAsync(async (req: Request, res: Response) => {
  const {
    status = 'published',
    visibility = 'public',
    page: placementPage,
    position,
    contentType,
    tags,
    search,
    sortBy = 'priority',
    sortOrder = 'desc',
    page = '1',
    limit = '20'
  } = req.query;

  // Build filter
  const filter: any = {};
  
  if (status && status !== 'all') {
    filter.status = status;
  }
  
  if (visibility && visibility !== 'all') {
    filter.visibility = visibility;
  }
  
  if (placementPage) {
    filter['placement.page'] = placementPage;
  }
  
  if (position) {
    filter['placement.position'] = position;
  }
  
  if (contentType) {
    filter.contentType = contentType;
  }
  
  if (tags) {
    const tagsArray = typeof tags === 'string' ? tags.split(',') : tags;
    filter.tags = { $in: tagsArray };
  }
  
  // Search
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Active sections only for public
  if (status === 'published') {
    const now = new Date();
    filter.$and = [
      {
        $or: [
          { 'schedule.startDate': { $exists: false } },
          { 'schedule.startDate': { $lte: now } }
        ]
      },
      {
        $or: [
          { 'schedule.endDate': { $exists: false } },
          { 'schedule.endDate': { $gte: now } }
        ]
      }
    ];
  }
  
  // Pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;
  
  // Sorting
  const sortOptions: any = {};
  if (sortBy === 'priority') {
    sortOptions.priority = sortOrder === 'asc' ? 1 : -1;
    sortOptions.displayOrder = 1;
  } else {
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
  }
  
  const sections = await FavoriteSection.find(filter)
    .populate('createdBy', 'name email')
    .populate('contentIds')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);
  
  const total = await FavoriteSection.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: sections.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    data: sections
  });
});

/**
 * Get single favorite section by ID or slug
 * @route GET /api/v1/favorite-sections/:identifier
 * @access Public
 */
export const getFavoriteSectionByIdOrSlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { identifier } = req.params;
  
  const query = mongoose.isValidObjectId(identifier)
    ? { _id: identifier }
    : { slug: identifier };
  
  const section = await FavoriteSection.findOne(query)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .populate('contentIds');
  
  if (!section) {
    return next(new AppError('Favorite section not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: section
  });
});

/**
 * Get sections by page placement
 * @route GET /api/v1/favorite-sections/placement/:page
 * @access Public
 */
export const getSectionsByPlacement = catchAsync(async (req: Request, res: Response) => {
  const { page: placementPage } = req.params;
  const { position, limit = '10' } = req.query;
  
  const sections = await (FavoriteSection as any).getPublishedSections(placementPage, parseInt(limit as string));
  
  // Filter by position if specified
  let filteredSections = sections;
  if (position) {
    filteredSections = sections.filter((s: any) => s.placement.position === position);
  }
  
  res.status(200).json({
    success: true,
    count: filteredSections.length,
    data: filteredSections
  });
});

/**
 * Track impression for a section
 * @route POST /api/v1/favorite-sections/:id/impression
 * @access Public
 */
export const trackImpression = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { variantId } = req.body;
  
  const updateQuery: any = { $inc: { 'tracking.impressions': 1 } };
  
  // Track variant impression if A/B testing is enabled
  if (variantId) {
    updateQuery.$inc['abTest.variants.$[variant].impressions'] = 1;
  }
  
  const section = await FavoriteSection.findByIdAndUpdate(
    id,
    updateQuery,
    {
      new: true,
      arrayFilters: variantId ? [{ 'variant.id': variantId }] : undefined
    }
  );
  
  if (!section) {
    return next(new AppError('Favorite section not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Impression tracked',
    data: {
      impressions: section.tracking.impressions
    }
  });
});

/**
 * Track click for a section
 * @route POST /api/v1/favorite-sections/:id/click
 * @access Public
 */
export const trackClick = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { variantId } = req.body;
  
  const updateQuery: any = { $inc: { 'tracking.clicks': 1 } };
  
  // Track variant click if A/B testing is enabled
  if (variantId) {
    updateQuery.$inc['abTest.variants.$[variant].clicks'] = 1;
  }
  
  const section = await FavoriteSection.findByIdAndUpdate(
    id,
    updateQuery,
    {
      new: true,
      arrayFilters: variantId ? [{ 'variant.id': variantId }] : undefined
    }
  );
  
  if (!section) {
    return next(new AppError('Favorite section not found', 404));
  }
  
  // Recalculate CTR
  if (section.tracking.impressions > 0) {
    section.tracking.clickThroughRate = (section.tracking.clicks / section.tracking.impressions) * 100;
    await section.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Click tracked',
    data: {
      clicks: section.tracking.clicks,
      clickThroughRate: section.tracking.clickThroughRate
    }
  });
});

// ==================== ADMIN ENDPOINTS ====================

/**
 * Create favorite section
 * @route POST /api/v1/favorite-sections
 * @access Admin
 */
export const createFavoriteSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check for duplicate slug
  const { slug } = req.body;
  const existing = await FavoriteSection.findOne({ slug });
  
  if (existing) {
    res.status(400).json({
      success: false,
      message: 'A section with this slug already exists'
    });
    return;
  }
  
  // Create section
  const section = await FavoriteSection.create({
    ...req.body,
    createdBy: req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : undefined
  });
  
  await section.populate('createdBy', 'name email');
  
  res.status(201).json({
    success: true,
    message: 'Favorite section created successfully',
    data: section
  });
});

/**
 * Update favorite section
 * @route PATCH /api/v1/favorite-sections/:id
 * @access Admin
 */
export const updateFavoriteSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const section = await FavoriteSection.findById(req.params.id);
  
  if (!section) {
    return next(new AppError('Favorite section not found', 404));
  }
  
  // Check slug uniqueness if updating slug
  if (req.body.slug && req.body.slug !== section.slug) {
    const existing = await FavoriteSection.findOne({ slug: req.body.slug });
    if (existing) {
      res.status(400).json({
        success: false,
        message: 'A section with this slug already exists'
      });
      return;
    }
  }
  
  Object.assign(section, req.body);
  if (req.user?._id) {
    section.updatedBy = new mongoose.Types.ObjectId(req.user._id);
    section.lastModifiedBy = new mongoose.Types.ObjectId(req.user._id);
  }
  await section.save();
  
  await section.populate('createdBy updatedBy', 'name email');
  
  res.status(200).json({
    success: true,
    message: 'Favorite section updated successfully',
    data: section
  });
});

/**
 * Delete favorite section
 * @route DELETE /api/v1/favorite-sections/:id
 * @access Admin
 */
export const deleteFavoriteSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const section = await FavoriteSection.findById(req.params.id);
  
  if (!section) {
    return next(new AppError('Favorite section not found', 404));
  }
  
  await section.deleteOne();
  
  res.status(204).json({
    success: true,
    message: 'Favorite section deleted successfully'
  });
});

/**
 * Publish favorite section
 * @route PATCH /api/v1/favorite-sections/:id/publish
 * @access Admin
 */
export const publishFavoriteSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const section = await FavoriteSection.findById(req.params.id);
  
  if (!section) {
    return next(new AppError('Favorite section not found', 404));
  }
  
  section.status = 'published';
  section.publishedAt = new Date();
  if (req.user?._id) {
    section.updatedBy = new mongoose.Types.ObjectId(req.user._id);
  }
  await section.save();
  
  res.status(200).json({
    success: true,
    message: 'Favorite section published successfully',
    data: section
  });
});

/**
 * Archive favorite section
 * @route PATCH /api/v1/favorite-sections/:id/archive
 * @access Admin
 */
export const archiveFavoriteSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const section = await FavoriteSection.findById(req.params.id);
  
  if (!section) {
    return next(new AppError('Favorite section not found', 404));
  }
  
  section.status = 'archived';
  section.archivedAt = new Date();
  if (req.user?._id) {
    section.updatedBy = new mongoose.Types.ObjectId(req.user._id);
  }
  await section.save();
  
  res.status(200).json({
    success: true,
    message: 'Favorite section archived successfully',
    data: section
  });
});

/**
 * Duplicate favorite section
 * @route POST /api/v1/favorite-sections/:id/duplicate
 * @access Admin
 */
export const duplicateFavoriteSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const original = await FavoriteSection.findById(req.params.id);
  
  if (!original) {
    return next(new AppError('Favorite section not found', 404));
  }
  
  // Create duplicate with modified slug and title
  const duplicateData: any = original.toObject();
  delete duplicateData._id;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;
  
  duplicateData.title = `${duplicateData.title} (Copy)`;
  duplicateData.slug = `${duplicateData.slug}-copy-${Date.now()}`;
  duplicateData.status = 'draft';
  duplicateData.publishedAt = undefined;
  duplicateData.createdBy = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : duplicateData.createdBy;
  
  const duplicate = await FavoriteSection.create(duplicateData);
  
  res.status(201).json({
    success: true,
    message: 'Favorite section duplicated successfully',
    data: duplicate
  });
});

/**
 * Reorder sections
 * @route PATCH /api/v1/favorite-sections/reorder
 * @access Admin
 */
export const reorderSections = catchAsync(async (req: Request, res: Response) => {
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
      update: { 
        displayOrder: item.displayOrder,
        updatedBy: req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : undefined
      }
    }
  }));
  
  const result = await FavoriteSection.bulkWrite(bulkOps);
  
  res.status(200).json({
    success: true,
    message: 'Sections reordered successfully',
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

/**
 * Get section analytics
 * @route GET /api/v1/favorite-sections/analytics/overview
 * @access Admin
 */
export const getSectionAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { days = '30' } = req.query;
  const daysNum = parseInt(days as string);
  
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysNum);
  
  // Summary stats
  const totalSections = await FavoriteSection.countDocuments();
  const publishedSections = await FavoriteSection.countDocuments({ status: 'published' });
  const draftSections = await FavoriteSection.countDocuments({ status: 'draft' });
  const scheduledSections = await FavoriteSection.countDocuments({ status: 'scheduled' });
  const archivedSections = await FavoriteSection.countDocuments({ status: 'archived' });
  
  // Performance metrics
  const performanceMetrics = await FavoriteSection.aggregate([
    {
      $match: {
        createdAt: { $gte: dateThreshold }
      }
    },
    {
      $group: {
        _id: null,
        totalImpressions: { $sum: '$tracking.impressions' },
        totalClicks: { $sum: '$tracking.clicks' },
        averageCTR: { $avg: '$tracking.clickThroughRate' },
        sectionsWithABTest: { $sum: { $cond: ['$abTest.enabled', 1, 0] } }
      }
    }
  ]);
  
  // Sections by content type
  const contentTypeStats = await FavoriteSection.aggregate([
    {
      $group: {
        _id: '$contentType',
        count: { $sum: 1 },
        totalImpressions: { $sum: '$tracking.impressions' },
        totalClicks: { $sum: '$tracking.clicks' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  // Sections by placement
  const placementStats = await FavoriteSection.aggregate([
    {
      $group: {
        _id: '$placement.page',
        count: { $sum: 1 },
        totalImpressions: { $sum: '$tracking.impressions' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  // Top performing sections
  const topPerformers = await FavoriteSection.find({
    status: 'published'
  })
    .sort({ 'tracking.clicks': -1 })
    .limit(10)
    .select('title slug tracking placement contentType')
    .populate('createdBy', 'name');
  
  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalSections,
        publishedSections,
        draftSections,
        scheduledSections,
        archivedSections,
        period: `Last ${daysNum} days`
      },
      performance: performanceMetrics[0] || {},
      contentTypeDistribution: contentTypeStats,
      placementDistribution: placementStats,
      topPerformers
    }
  });
});

/**
 * A/B Test: Start test
 * @route POST /api/v1/favorite-sections/:id/ab-test/start
 * @access Admin
 */
export const startABTest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const section = await FavoriteSection.findById(req.params.id);
  
  if (!section) {
    return next(new AppError('Favorite section not found', 404));
  }
  
  if (!section.abTest || section.abTest.variants.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Please configure A/B test variants first'
    });
    return;
  }
  
  section.abTest.enabled = true;
  section.abTest.testStartDate = new Date();
  if (req.user?._id) {
    section.updatedBy = new mongoose.Types.ObjectId(req.user._id);
  }
  await section.save();
  
  res.status(200).json({
    success: true,
    message: 'A/B test started successfully',
    data: section
  });
});

/**
 * A/B Test: End test and select winner
 * @route POST /api/v1/favorite-sections/:id/ab-test/end
 * @access Admin
 */
export const endABTest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { winnerVariantId } = req.body;
  const section = await FavoriteSection.findById(req.params.id);
  
  if (!section) {
    return next(new AppError('Favorite section not found', 404));
  }
  
  if (!section.abTest?.enabled) {
    res.status(400).json({
      success: false,
      message: 'No active A/B test found'
    });
    return;
  }
  
  section.abTest.enabled = false;
  section.abTest.testEndDate = new Date();
  section.abTest.winnerVariant = winnerVariantId;
  if (req.user?._id) {
    section.updatedBy = new mongoose.Types.ObjectId(req.user._id);
  }
  await section.save();
  
  res.status(200).json({
    success: true,
    message: 'A/B test ended successfully',
    data: section
  });
});

/**
 * Bulk update sections
 * @route PATCH /api/v1/favorite-sections/bulk-update
 * @access Admin
 */
export const bulkUpdateSections = catchAsync(async (req: Request, res: Response) => {
  const { ids, updates } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Please provide an array of section IDs'
    });
    return;
  }
  
  const result = await FavoriteSection.updateMany(
    { _id: { $in: ids } },
    { 
      ...updates,
      updatedBy: req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : undefined
    }
  );
  
  res.status(200).json({
    success: true,
    message: 'Sections updated successfully',
    data: {
      matched: result.matchedCount,
      modified: result.modifiedCount
    }
  });
});

/**
 * Bulk delete sections
 * @route DELETE /api/v1/favorite-sections/bulk-delete
 * @access Admin
 */
export const bulkDeleteSections = catchAsync(async (req: Request, res: Response) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Please provide an array of section IDs'
    });
    return;
  }
  
  const result = await FavoriteSection.deleteMany({ _id: { $in: ids } });
  
  res.status(200).json({
    success: true,
    message: 'Sections deleted successfully',
    data: {
      deletedCount: result.deletedCount
    }
  });
});
