import { Request, Response, NextFunction } from 'express';
import HeroSection from '../models/hero-section.model.js';
import Banner from '../models/banner.model.js';
import BannerGroup from '../models/banner-group.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// ==================== HERO SECTIONS ====================

export const getHeroSections = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sort = '-position.priority',
    status,
    positionPage,
    isActive,
    search
  } = req.query;

  const filter: any = {};

  if (status) filter.status = status;
  if (positionPage) filter['position.page'] = positionPage;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { subtitle: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await HeroSection.countDocuments(filter);

  const heroSections = await HeroSection.find(filter)
    .sort(sort as string)
    .skip(skip)
    .limit(Number(limit))
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    results: heroSections.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { heroSections }
  });
});

export const getHeroSectionById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const heroSection = await HeroSection.findById(req.params.id)
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!heroSection) {
    return next(new AppError('Hero section not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { heroSection }
  });
});

export const getHeroSectionsByPage = catchAsync(async (req: Request, res: Response) => {
  const { page } = req.params;
  const now = new Date();

  const heroSections = await HeroSection.find({
    'position.page': page,
    isActive: true,
    status: 'active',
    $and: [
      {
        $or: [
          { publishAt: { $lte: now } },
          { publishAt: { $exists: false } }
        ]
      },
      {
        $or: [
          { expiresAt: { $gt: now } },
          { expiresAt: { $exists: false } }
        ]
      }
    ]
  })
    .sort('position.priority')
    .select('-createdBy -updatedBy');

  res.status(200).json({
    status: 'success',
    results: heroSections.length,
    data: { heroSections }
  });
});

export const createHeroSection = catchAsync(async (req: Request, res: Response) => {
  const heroSectionData = {
    ...req.body,
    createdBy: req.user?._id
  };

  const heroSection = await HeroSection.create(heroSectionData);

  res.status(201).json({
    status: 'success',
    data: { heroSection }
  });
});

export const updateHeroSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const heroSection = await HeroSection.findById(req.params.id);

  if (!heroSection) {
    return next(new AppError('Hero section not found', 404));
  }

  heroSection.updatedBy = req.user?._id as any;
  Object.assign(heroSection, req.body);

  await heroSection.save();

  res.status(200).json({
    status: 'success',
    data: { heroSection }
  });
});

export const deleteHeroSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const heroSection = await HeroSection.findByIdAndDelete(req.params.id);

  if (!heroSection) {
    return next(new AppError('Hero section not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const activateHeroSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const heroSection = await HeroSection.findById(req.params.id);

  if (!heroSection) {
    return next(new AppError('Hero section not found', 404));
  }

  heroSection.isActive = true;
  heroSection.status = 'active';
  await heroSection.save();

  res.status(200).json({
    status: 'success',
    data: { heroSection }
  });
});

export const deactivateHeroSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const heroSection = await HeroSection.findById(req.params.id);

  if (!heroSection) {
    return next(new AppError('Hero section not found', 404));
  }

  heroSection.isActive = false;
  heroSection.status = 'paused';
  await heroSection.save();

  res.status(200).json({
    status: 'success',
    data: { heroSection }
  });
});

export const duplicateHeroSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const originalHero = await HeroSection.findById(req.params.id);

  if (!originalHero) {
    return next(new AppError('Hero section not found', 404));
  }

  const heroData: any = originalHero.toObject();
  delete heroData._id;
  delete heroData.createdAt;
  delete heroData.updatedAt;

  heroData.title = `${heroData.title} (Copy)`;
  heroData.status = 'draft';
  heroData.isActive = false;
  heroData.createdBy = req.user?._id as any;

  const newHero = await HeroSection.create(heroData);

  res.status(201).json({
    status: 'success',
    data: { heroSection: newHero }
  });
});

export const trackHeroImpression = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const heroSection = await HeroSection.findById(req.params.id);

  if (!heroSection) {
    return next(new AppError('Hero section not found', 404));
  }

  heroSection.analytics.impressions += 1;
  await heroSection.save();

  res.status(200).json({
    status: 'success',
    data: { heroSection }
  });
});

export const trackHeroClick = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const heroSection = await HeroSection.findById(req.params.id);

  if (!heroSection) {
    return next(new AppError('Hero section not found', 404));
  }

  heroSection.analytics.clicks += 1;
  
  if (heroSection.analytics.impressions > 0) {
    heroSection.analytics.ctr = (heroSection.analytics.clicks / heroSection.analytics.impressions) * 100;
  }

  await heroSection.save();

  res.status(200).json({
    status: 'success',
    data: { heroSection }
  });
});

// ==================== BANNERS ====================

export const getBanners = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sort = '-position.priority',
    status,
    type,
    positionPage,
    positionLocation,
    groupId,
    isActive,
    search
  } = req.query;

  const filter: any = {};

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (positionPage) filter['position.page'] = positionPage;
  if (positionLocation) filter['position.location'] = positionLocation;
  if (groupId) filter.groupId = groupId;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Banner.countDocuments(filter);

  const banners = await Banner.find(filter)
    .sort(sort as string)
    .skip(skip)
    .limit(Number(limit))
    .populate('groupId', 'name type')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    results: banners.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { banners }
  });
});

export const getBannerById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const banner = await Banner.findById(req.params.id)
    .populate('groupId', 'name type settings')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!banner) {
    return next(new AppError('Banner not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { banner }
  });
});

export const getBannersByPage = catchAsync(async (req: Request, res: Response) => {
  const { page, location } = req.params;
  const now = new Date();

  const filter: any = {
    'position.page': page,
    isActive: true,
    status: 'active',
    $and: [
      {
        $or: [
          { publishAt: { $lte: now } },
          { publishAt: { $exists: false } }
        ]
      },
      {
        $or: [
          { expiresAt: { $gt: now } },
          { expiresAt: { $exists: false } }
        ]
      }
    ]
  };

  if (location) {
    filter['position.location'] = location;
  }

  const banners = await Banner.find(filter)
    .sort('position.priority sortOrder')
    .select('-createdBy -updatedBy');

  res.status(200).json({
    status: 'success',
    results: banners.length,
    data: { banners }
  });
});

export const createBanner = catchAsync(async (req: Request, res: Response) => {
  const bannerData = {
    ...req.body,
    createdBy: req.user?._id
  };

  const banner = await Banner.create(bannerData);

  res.status(201).json({
    status: 'success',
    data: { banner }
  });
});

export const updateBanner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new AppError('Banner not found', 404));
  }

  banner.updatedBy = req.user?._id as any;
  Object.assign(banner, req.body);

  await banner.save();

  res.status(200).json({
    status: 'success',
    data: { banner }
  });
});

export const deleteBanner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);

  if (!banner) {
    return next(new AppError('Banner not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const activateBanner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new AppError('Banner not found', 404));
  }

  banner.isActive = true;
  banner.status = 'active';
  await banner.save();

  res.status(200).json({
    status: 'success',
    data: { banner }
  });
});

export const deactivateBanner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new AppError('Banner not found', 404));
  }

  banner.isActive = false;
  banner.status = 'paused';
  await banner.save();

  res.status(200).json({
    status: 'success',
    data: { banner }
  });
});

export const duplicateBanner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const originalBanner = await Banner.findById(req.params.id);

  if (!originalBanner) {
    return next(new AppError('Banner not found', 404));
  }

  const bannerData: any = originalBanner.toObject();
  delete bannerData._id;
  delete bannerData.createdAt;
  delete bannerData.updatedAt;

  bannerData.name = `${bannerData.name} (Copy)`;
  bannerData.status = 'draft';
  bannerData.isActive = false;
  bannerData.createdBy = req.user?._id as any;
  bannerData.analytics = {
    impressions: 0,
    clicks: 0,
    uniqueViews: 0,
    conversions: 0,
    revenue: 0
  };

  const newBanner = await Banner.create(bannerData);

  res.status(201).json({
    status: 'success',
    data: { banner: newBanner }
  });
});

export const trackBannerImpression = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new AppError('Banner not found', 404));
  }

  banner.analytics.impressions += 1;
  banner.analytics.lastViewedAt = new Date();
  await banner.save();

  res.status(200).json({
    status: 'success',
    data: { banner }
  });
});

export const trackBannerClick = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new AppError('Banner not found', 404));
  }

  banner.analytics.clicks += 1;
  
  if (banner.analytics.impressions > 0) {
    banner.analytics.ctr = (banner.analytics.clicks / banner.analytics.impressions) * 100;
  }

  await banner.save();

  res.status(200).json({
    status: 'success',
    data: { banner }
  });
});

export const updateBannerOrder = catchAsync(async (req: Request, res: Response) => {
  const { banners } = req.body; // Array of { id, sortOrder }

  const updatePromises = banners.map((item: any) =>
    Banner.findByIdAndUpdate(item.id, { sortOrder: item.sortOrder })
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    status: 'success',
    message: 'Banner order updated successfully'
  });
});

export const bulkUpdateBanners = catchAsync(async (req: Request, res: Response) => {
  const { ids, updates } = req.body;

  const result = await Banner.updateMany(
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

export const bulkDeleteBanners = catchAsync(async (req: Request, res: Response) => {
  const { ids } = req.body;

  const result = await Banner.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    status: 'success',
    data: { deletedCount: result.deletedCount }
  });
});

// ==================== BANNER GROUPS ====================

export const getBannerGroups = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    status,
    type,
    positionPage,
    isActive
  } = req.query;

  const filter: any = {};

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (positionPage) filter['position.page'] = positionPage;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const total = await BannerGroup.countDocuments(filter);

  const bannerGroups = await BannerGroup.find(filter)
    .sort(sort as string)
    .skip(skip)
    .limit(Number(limit))
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    results: bannerGroups.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { bannerGroups }
  });
});

export const getBannerGroupById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const bannerGroup = await BannerGroup.findById(req.params.id)
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!bannerGroup) {
    return next(new AppError('Banner group not found', 404));
  }

  // Get banners in this group
  const banners = await Banner.find({ groupId: bannerGroup._id })
    .sort('sortOrder')
    .select('-createdBy -updatedBy');

  res.status(200).json({
    status: 'success',
    data: { 
      bannerGroup,
      banners
    }
  });
});

export const createBannerGroup = catchAsync(async (req: Request, res: Response) => {
  const bannerGroupData = {
    ...req.body,
    createdBy: req.user?._id
  };

  const bannerGroup = await BannerGroup.create(bannerGroupData);

  res.status(201).json({
    status: 'success',
    data: { bannerGroup }
  });
});

export const updateBannerGroup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const bannerGroup = await BannerGroup.findById(req.params.id);

  if (!bannerGroup) {
    return next(new AppError('Banner group not found', 404));
  }

  bannerGroup.updatedBy = req.user?._id as any;
  Object.assign(bannerGroup, req.body);

  await bannerGroup.save();

  res.status(200).json({
    status: 'success',
    data: { bannerGroup }
  });
});

export const deleteBannerGroup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const bannerGroup = await BannerGroup.findById(req.params.id);

  if (!bannerGroup) {
    return next(new AppError('Banner group not found', 404));
  }

  // Check if group has banners
  const bannerCount = await Banner.countDocuments({ groupId: bannerGroup._id });
  
  if (bannerCount > 0) {
    return next(new AppError('Cannot delete group with active banners. Remove or reassign banners first.', 400));
  }

  await bannerGroup.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const activateBannerGroup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const bannerGroup = await BannerGroup.findById(req.params.id);

  if (!bannerGroup) {
    return next(new AppError('Banner group not found', 404));
  }

  bannerGroup.isActive = true;
  bannerGroup.status = 'active';
  await bannerGroup.save();

  res.status(200).json({
    status: 'success',
    data: { bannerGroup }
  });
});

export const deactivateBannerGroup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const bannerGroup = await BannerGroup.findById(req.params.id);

  if (!bannerGroup) {
    return next(new AppError('Banner group not found', 404));
  }

  bannerGroup.isActive = false;
  bannerGroup.status = 'paused';
  await bannerGroup.save();

  res.status(200).json({
    status: 'success',
    data: { bannerGroup }
  });
});

// ==================== ANALYTICS ====================

export const getHeroBannerAnalytics = catchAsync(async (req: Request, res: Response) => {
  const [
    totalHeroSections,
    activeHeroSections,
    totalBanners,
    activeBanners,
    totalBannerGroups,
    activeBannerGroups,
    heroStats,
    bannerStats,
    topHeroSections,
    topBanners
  ] = await Promise.all([
    HeroSection.countDocuments(),
    HeroSection.countDocuments({ isActive: true, status: 'active' }),
    Banner.countDocuments(),
    Banner.countDocuments({ isActive: true, status: 'active' }),
    BannerGroup.countDocuments(),
    BannerGroup.countDocuments({ isActive: true, status: 'active' }),
    
    HeroSection.aggregate([
      {
        $group: {
          _id: null,
          totalImpressions: { $sum: '$analytics.impressions' },
          totalClicks: { $sum: '$analytics.clicks' }
        }
      }
    ]),
    
    Banner.aggregate([
      {
        $group: {
          _id: null,
          totalImpressions: { $sum: '$analytics.impressions' },
          totalClicks: { $sum: '$analytics.clicks' },
          totalConversions: { $sum: '$analytics.conversions' },
          totalRevenue: { $sum: '$analytics.revenue' }
        }
      }
    ]),
    
    HeroSection.find({ isActive: true })
      .sort('-analytics.clicks')
      .limit(5)
      .select('title analytics'),
    
    Banner.find({ isActive: true })
      .sort('-analytics.clicks')
      .limit(5)
      .select('name analytics')
  ]);

  const heroAnalytics = heroStats[0] || { totalImpressions: 0, totalClicks: 0 };
  const bannerAnalytics = bannerStats[0] || { totalImpressions: 0, totalClicks: 0, totalConversions: 0, totalRevenue: 0 };

  res.status(200).json({
    status: 'success',
    data: {
      heroSections: {
        total: totalHeroSections,
        active: activeHeroSections,
        analytics: {
          ...heroAnalytics,
          averageCTR: heroAnalytics.totalImpressions > 0 
            ? (heroAnalytics.totalClicks / heroAnalytics.totalImpressions * 100).toFixed(2)
            : 0
        }
      },
      banners: {
        total: totalBanners,
        active: activeBanners,
        analytics: {
          ...bannerAnalytics,
          averageCTR: bannerAnalytics.totalImpressions > 0
            ? (bannerAnalytics.totalClicks / bannerAnalytics.totalImpressions * 100).toFixed(2)
            : 0
        }
      },
      bannerGroups: {
        total: totalBannerGroups,
        active: activeBannerGroups
      },
      topPerformers: {
        heroSections: topHeroSections,
        banners: topBanners
      }
    }
  });
});

// ==================== A/B TESTING ====================

export const createABTest = catchAsync(async (req: Request, res: Response) => {
  const { type, originalId, variantData } = req.body; // type: 'hero' or 'banner'

  let original: any;
  let Variant: any;

  if (type === 'hero') {
    original = await HeroSection.findById(originalId);
    Variant = HeroSection;
  } else {
    original = await Banner.findById(originalId);
    Variant = Banner;
  }

  if (!original) {
    return res.status(404).json({
      status: 'error',
      message: `${type} not found`
    });
  }

  // Create variant
  const variantObj: any = original.toObject();
  delete variantObj._id;
  delete variantObj.createdAt;
  delete variantObj.updatedAt;

  Object.assign(variantObj, variantData);
  variantObj.abTest = {
    enabled: true,
    variantId: original._id,
    trafficPercentage: variantData.trafficPercentage || 50
  };
  variantObj.status = 'active';
  variantObj.createdBy = req.user?._id as any;

  const variant = await Variant.create(variantObj);

  // Update original with A/B test info
  original.abTest = {
    enabled: true,
    variantId: variant._id,
    trafficPercentage: 100 - (variantData.trafficPercentage || 50)
  };
  await original.save();

  return res.status(201).json({
    status: 'success',
    data: { 
      original,
      variant
    }
  });
});

export const getABTestResults = catchAsync(async (req: Request, res: Response) => {
  const { type, id } = req.params;

  let Model: any;
  if (type === 'hero') {
    Model = HeroSection;
  } else {
    Model = Banner;
  }

  const original = await Model.findById(id);
  if (!original || !original.abTest?.enabled) {
    return res.status(404).json({
      status: 'error',
      message: 'A/B test not found'
    });
  }

  const variant = await Model.findById(original.abTest.variantId);

  const results = {
    original: {
      id: original._id,
      impressions: original.analytics.impressions,
      clicks: original.analytics.clicks,
      ctr: original.analytics.ctr || 0,
      trafficPercentage: original.abTest.trafficPercentage
    },
    variant: variant ? {
      id: variant._id,
      impressions: variant.analytics.impressions,
      clicks: variant.analytics.clicks,
      ctr: variant.analytics.ctr || 0,
      trafficPercentage: variant.abTest.trafficPercentage
    } : null,
    winner: null as any
  };

  // Determine winner (simple comparison)
  if (variant && results.variant && results.original.ctr && results.variant.ctr) {
    results.winner = results.original.ctr > results.variant.ctr ? 'original' : 'variant';
  }

  return res.status(200).json({
    status: 'success',
    data: results
  });
});

export const endABTest = catchAsync(async (req: Request, res: Response) => {
  const { type, id, winner } = req.body; // winner: 'original' or 'variant'

  let Model: any;
  if (type === 'hero') {
    Model = HeroSection;
  } else {
    Model = Banner;
  }

  const original = await Model.findById(id);
  if (!original || !original.abTest?.enabled) {
    return res.status(404).json({
      status: 'error',
      message: 'A/B test not found'
    });
  }

  const variant = await Model.findById(original.abTest.variantId);

  if (winner === 'variant' && variant) {
    // Make variant the new original
    original.abTest.enabled = false;
    await original.save();
    
    variant.abTest.enabled = false;
    await variant.save();
  } else {
    // Keep original, disable variant
    original.abTest.enabled = false;
    await original.save();
    
    if (variant) {
      variant.isActive = false;
      variant.status = 'archived';
      await variant.save();
    }
  }

  return res.status(200).json({
    status: 'success',
    message: 'A/B test ended successfully'
  });
});

// ==================== SCHEDULING ====================

export const scheduleHeroSection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { publishAt, expiresAt } = req.body;
  
  const heroSection = await HeroSection.findById(req.params.id);
  if (!heroSection) {
    return next(new AppError('Hero section not found', 404));
  }

  heroSection.status = 'scheduled';
  heroSection.publishAt = publishAt ? new Date(publishAt) : undefined;
  heroSection.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
  
  await heroSection.save();

  res.status(200).json({
    status: 'success',
    data: { heroSection }
  });
});

export const scheduleBanner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { publishAt, expiresAt } = req.body;
  
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    return next(new AppError('Banner not found', 404));
  }

  banner.status = 'scheduled';
  banner.publishAt = publishAt ? new Date(publishAt) : undefined;
  banner.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
  
  await banner.save();

  res.status(200).json({
    status: 'success',
    data: { banner }
  });
});
