import { Request, Response, NextFunction } from 'express';
import FeaturedContent from '../models/featured-content.model.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import Collection from '../models/collection.model.js';
import Brand from '../models/brand.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// ==================== FEATURED CONTENT MANAGEMENT ====================

export const getFeaturedContents = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sort = '-priority,-createdAt',
    status,
    contentType,
    placement,
    isActive,
    search
  } = req.query;

  const filter: any = {};

  if (status) filter.status = status;
  if (contentType) filter.contentType = contentType;
  if (placement) filter['displaySettings.placement'] = placement;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await FeaturedContent.countDocuments(filter);

  const contents = await FeaturedContent.find(filter)
    .sort(sort as string)
    .skip(skip)
    .limit(Number(limit))
    .populate('productId', 'name slug images price')
    .populate('categoryId', 'name slug image')
    .populate('collectionId', 'name slug image')
    .populate('brandId', 'name slug logo')
    .populate('blogId', 'title slug image')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    results: contents.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { contents }
  });
});

export const getFeaturedContentById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const content = await FeaturedContent.findById(req.params.id)
    .populate('productId')
    .populate('categoryId')
    .populate('collectionId')
    .populate('brandId')
    .populate('blogId')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!content) {
    return next(new AppError('Featured content not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { content }
  });
});

export const getFeaturedContentByPlacement = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { placement } = req.params;
  const { section, device, userRole, location, language } = req.query;

  const contents = await (FeaturedContent as any).getActiveByPlacement(placement, {
    section: section as string,
    device: device as string,
    userRole: userRole as string,
    location: location as string,
    language: language as string
  });

  // Increment impressions
  if (contents.length > 0) {
    const contentIds = contents.map((c: any) => c._id);
    await FeaturedContent.updateMany(
      { _id: { $in: contentIds } },
      { 
        $inc: { 'analytics.impressions': 1 },
        $set: { 'analytics.lastImpressionAt': new Date() }
      }
    );
  }

  res.status(200).json({
    status: 'success',
    results: contents.length,
    data: { contents }
  });
});

export const createFeaturedContent = catchAsync(async (req: Request, res: Response) => {
  const contentData = {
    ...req.body,
    createdBy: req.user?._id
  };

  const content = await FeaturedContent.create(contentData);

  res.status(201).json({
    status: 'success',
    data: { content }
  });
});

export const updateFeaturedContent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const content = await FeaturedContent.findById(req.params.id);

  if (!content) {
    return next(new AppError('Featured content not found', 404));
  }

  content.updatedBy = req.user?._id as any;
  Object.assign(content, req.body);

  await content.save();

  res.status(200).json({
    status: 'success',
    data: { content }
  });
});

export const deleteFeaturedContent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const content = await FeaturedContent.findByIdAndDelete(req.params.id);

  if (!content) {
    return next(new AppError('Featured content not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// ==================== STATUS MANAGEMENT ====================

export const activateFeaturedContent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const content = await FeaturedContent.findById(req.params.id);

  if (!content) {
    return next(new AppError('Featured content not found', 404));
  }

  content.isActive = true;
  content.status = 'active';
  if (!content.publishAt) {
    content.publishAt = new Date();
  }
  await content.save();

  res.status(200).json({
    status: 'success',
    data: { content }
  });
});

export const deactivateFeaturedContent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const content = await FeaturedContent.findById(req.params.id);

  if (!content) {
    return next(new AppError('Featured content not found', 404));
  }

  content.isActive = false;
  content.status = 'paused';
  await content.save();

  res.status(200).json({
    status: 'success',
    data: { content }
  });
});

export const duplicateFeaturedContent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const originalContent = await FeaturedContent.findById(req.params.id);

  if (!originalContent) {
    return next(new AppError('Featured content not found', 404));
  }

  const contentData: any = originalContent.toObject();
  delete contentData._id;
  delete contentData.createdAt;
  delete contentData.updatedAt;

  contentData.name = `${contentData.name} (Copy)`;
  contentData.status = 'draft';
  contentData.isActive = false;
  contentData.createdBy = req.user?._id as any;
  contentData.analytics = {
    impressions: 0,
    clicks: 0,
    ctr: 0,
    conversions: 0,
    revenue: 0
  };

  const newContent = await FeaturedContent.create(contentData);

  res.status(201).json({
    status: 'success',
    data: { content: newContent }
  });
});

// ==================== SCHEDULING ====================

export const scheduleFeaturedContent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { publishAt, expiresAt } = req.body;

  const content = await FeaturedContent.findById(req.params.id);

  if (!content) {
    return next(new AppError('Featured content not found', 404));
  }

  if (publishAt) content.publishAt = new Date(publishAt);
  if (expiresAt) content.expiresAt = new Date(expiresAt);

  if (publishAt && new Date(publishAt) > new Date()) {
    content.status = 'scheduled';
  } else if (content.isActive) {
    content.status = 'active';
  }

  await content.save();

  res.status(200).json({
    status: 'success',
    data: { content }
  });
});

// ==================== POSITION MANAGEMENT ====================

export const updatePosition = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { position } = req.body;

  const content = await FeaturedContent.findById(req.params.id);

  if (!content) {
    return next(new AppError('Featured content not found', 404));
  }

  content.displaySettings.position = position;
  await content.save();

  res.status(200).json({
    status: 'success',
    data: { content }
  });
});

export const reorderContents = catchAsync(async (req: Request, res: Response) => {
  const { contentIds } = req.body; // Array of content IDs in desired order

  const updatePromises = contentIds.map((id: string, index: number) =>
    FeaturedContent.findByIdAndUpdate(id, {
      'displaySettings.position': index
    })
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    status: 'success',
    message: 'Content order updated successfully'
  });
});

// ==================== ANALYTICS ====================

export const trackImpression = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const content = await FeaturedContent.findById(req.params.id);

  if (!content) {
    return next(new AppError('Featured content not found', 404));
  }

  content.analytics.impressions += 1;
  content.analytics.lastImpressionAt = new Date();
  await content.save();

  res.status(200).json({
    status: 'success',
    data: { content }
  });
});

export const trackClick = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const content = await FeaturedContent.findById(req.params.id);

  if (!content) {
    return next(new AppError('Featured content not found', 404));
  }

  content.analytics.clicks += 1;
  content.analytics.lastClickAt = new Date();
  await content.save();

  res.status(200).json({
    status: 'success',
    data: { content }
  });
});

export const trackConversion = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { revenue = 0 } = req.body;

  const content = await FeaturedContent.findById(req.params.id);

  if (!content) {
    return next(new AppError('Featured content not found', 404));
  }

  content.analytics.conversions += 1;
  content.analytics.revenue += revenue;
  await content.save();

  res.status(200).json({
    status: 'success',
    data: { content }
  });
});

export const getFeaturedContentAnalytics = catchAsync(async (req: Request, res: Response) => {
  const [
    totalContents,
    activeContents,
    scheduledContents,
    expiredContents,
    byContentType,
    byPlacement,
    topPerformers
  ] = await Promise.all([
    FeaturedContent.countDocuments(),
    FeaturedContent.countDocuments({ isActive: true, status: 'active' }),
    FeaturedContent.countDocuments({ status: 'scheduled' }),
    FeaturedContent.countDocuments({ status: 'expired' }),
    FeaturedContent.aggregate([
      { $group: { _id: '$contentType', count: { $sum: 1 } } }
    ]),
    FeaturedContent.aggregate([
      { $group: { _id: '$displaySettings.placement', count: { $sum: 1 } } }
    ]),
    FeaturedContent.find({ isActive: true })
      .sort('-analytics.ctr')
      .limit(10)
      .select('name contentType analytics displaySettings')
  ]);

  const totalImpressions = await FeaturedContent.aggregate([
    { $group: { _id: null, total: { $sum: '$analytics.impressions' } } }
  ]);

  const totalClicks = await FeaturedContent.aggregate([
    { $group: { _id: null, total: { $sum: '$analytics.clicks' } } }
  ]);

  const totalConversions = await FeaturedContent.aggregate([
    { $group: { _id: null, total: { $sum: '$analytics.conversions' } } }
  ]);

  const totalRevenue = await FeaturedContent.aggregate([
    { $group: { _id: null, total: { $sum: '$analytics.revenue' } } }
  ]);

  const avgCTR = totalImpressions[0]?.total > 0 
    ? (totalClicks[0]?.total / totalImpressions[0]?.total) * 100 
    : 0;

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        total: totalContents,
        active: activeContents,
        scheduled: scheduledContents,
        expired: expiredContents
      },
      byContentType: byContentType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byPlacement: byPlacement.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      analytics: {
        totalImpressions: totalImpressions[0]?.total || 0,
        totalClicks: totalClicks[0]?.total || 0,
        totalConversions: totalConversions[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        averageCTR: avgCTR.toFixed(2)
      },
      topPerformers
    }
  });
});

export const getContentStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const content = await FeaturedContent.findById(req.params.id);

  if (!content) {
    return next(new AppError('Featured content not found', 404));
  }

  const conversionRate = content.analytics.clicks > 0 
    ? ((content.analytics.conversions / content.analytics.clicks) * 100).toFixed(2)
    : 0;

  res.status(200).json({
    status: 'success',
    data: {
      content: {
        id: content._id,
        name: content.name,
        contentType: content.contentType,
        placement: content.displaySettings.placement
      },
      stats: {
        impressions: content.analytics.impressions,
        clicks: content.analytics.clicks,
        ctr: content.analytics.ctr.toFixed(2),
        conversions: content.analytics.conversions,
        revenue: content.analytics.revenue,
        conversionRate,
        lastImpressionAt: content.analytics.lastImpressionAt,
        lastClickAt: content.analytics.lastClickAt
      }
    }
  });
});

// ==================== A/B TESTING ====================

export const createABTest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const originalContent = await FeaturedContent.findById(req.params.id);

  if (!originalContent) {
    return next(new AppError('Featured content not found', 404));
  }

  const { variantName, trafficPercentage = 50, conversionGoal = 'clicks' } = req.body;

  // Create variant
  const variantData: any = originalContent.toObject();
  delete variantData._id;
  delete variantData.createdAt;
  delete variantData.updatedAt;

  const testId = `test-${Date.now()}`;

  variantData.name = `${originalContent.name} - ${variantName}`;
  variantData.abTest = {
    enabled: true,
    testId,
    variantName,
    trafficPercentage,
    conversionGoal
  };
  variantData.createdBy = req.user?._id as any;
  variantData.analytics = {
    impressions: 0,
    clicks: 0,
    ctr: 0,
    conversions: 0,
    revenue: 0
  };

  // Apply variant changes from request body
  if (req.body.changes) {
    Object.assign(variantData, req.body.changes);
  }

  const variant = await FeaturedContent.create(variantData);

  // Update original with test info
  originalContent.abTest = {
    enabled: true,
    testId,
    variantName: 'original',
    trafficPercentage: 100 - trafficPercentage,
    conversionGoal
  };
  await originalContent.save();

  res.status(201).json({
    status: 'success',
    data: {
      original: originalContent,
      variant
    }
  });
});

export const getABTestResults = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { testId } = req.params;

  const contents = await FeaturedContent.find({ 'abTest.testId': testId });

  if (contents.length === 0) {
    return next(new AppError('A/B test not found', 404));
  }

  const results = contents.map(c => ({
    id: c._id,
    name: c.name,
    variantName: c.abTest?.variantName,
    trafficPercentage: c.abTest?.trafficPercentage,
    impressions: c.analytics.impressions,
    clicks: c.analytics.clicks,
    ctr: c.analytics.ctr,
    conversions: c.analytics.conversions,
    revenue: c.analytics.revenue
  }));

  // Determine winner based on conversion goal
  const goal = contents[0].abTest?.conversionGoal || 'clicks';
  let winner: any = null;

  if (goal === 'clicks') {
    winner = results.reduce((prev, current) => 
      (current.clicks > prev.clicks) ? current : prev
    );
  } else if (goal === 'purchases' || goal === 'signups') {
    winner = results.reduce((prev, current) => 
      (current.conversions > prev.conversions) ? current : prev
    );
  } else if (goal === 'views') {
    winner = results.reduce((prev, current) => 
      (current.impressions > prev.impressions) ? current : prev
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      testId,
      conversionGoal: goal,
      results,
      winner
    }
  });
});

export const endABTest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { testId } = req.params;
  const { winnerId } = req.body;

  const contents = await FeaturedContent.find({ 'abTest.testId': testId });

  if (contents.length === 0) {
    return next(new AppError('A/B test not found', 404));
  }

  // Deactivate losers, keep winner active
  const updatePromises = contents.map(async (content) => {
    if (content._id && content._id.toString() === winnerId) {
      content.abTest = { enabled: false };
      content.isActive = true;
      content.status = 'active';
    } else {
      content.isActive = false;
      content.status = 'archived';
    }
    return content.save();
  });

  await Promise.all(updatePromises);

  res.status(200).json({
    status: 'success',
    message: 'A/B test ended successfully',
    data: { winnerId }
  });
});

// ==================== BULK OPERATIONS ====================

export const bulkUpdateContents = catchAsync(async (req: Request, res: Response) => {
  const { ids, updates } = req.body;

  const result = await FeaturedContent.updateMany(
    { _id: { $in: ids } },
    { $set: updates }
  );

  res.status(200).json({
    status: 'success',
    data: {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    }
  });
});

export const bulkDeleteContents = catchAsync(async (req: Request, res: Response) => {
  const { ids } = req.body;

  const result = await FeaturedContent.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    status: 'success',
    data: { deletedCount: result.deletedCount }
  });
});

// ==================== CONTENT VALIDATION ====================

export const validateContent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { contentType, contentId } = req.body;

  let contentExists = false;
  let contentData: any = null;

  switch (contentType) {
    case 'product':
      contentData = await Product.findById(contentId);
      break;
    case 'category':
      contentData = await Category.findById(contentId);
      break;
    case 'collection':
      contentData = await Collection.findById(contentId);
      break;
    case 'brand':
      contentData = await Brand.findById(contentId);
      break;
    default:
      break;
  }

  contentExists = !!contentData;

  res.status(200).json({
    status: 'success',
    data: {
      valid: contentExists,
      content: contentData
    }
  });
});
