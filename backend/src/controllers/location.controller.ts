import { Request, Response, NextFunction } from 'express';
import { Location, Region } from '../models/location.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// ==================== LOCATIONS ====================

export const getLocations = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    status,
    type,
    isActive,
    isFeatured,
    regionId,
    city,
    state,
    country,
    search
  } = req.query;

  const filter: any = {};

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
  if (regionId) filter.regionId = regionId;
  if (city) filter['address.city'] = { $regex: city, $options: 'i' };
  if (state) filter['address.state'] = { $regex: state, $options: 'i' };
  if (country) filter['address.country'] = { $regex: country, $options: 'i' };
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } },
      { 'address.state': { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Location.countDocuments(filter);

  const locations = await Location.find(filter)
    .sort(sort as string)
    .skip(skip)
    .limit(Number(limit))
    .populate('regionId', 'name slug code')
    .populate('managerId', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    results: locations.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { locations }
  });
});

export const getLocationById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const location = await Location.findById(req.params.id)
    .populate('regionId', 'name slug code')
    .populate('managerId', 'firstName lastName email phone')
    .populate('staff', 'firstName lastName email phone role')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  // Increment views
  location.analytics.views += 1;
  await location.save();

  res.status(200).json({
    status: 'success',
    data: { location }
  });
});

export const getLocationBySlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;

  const location = await Location.findOne({ slug, status: 'active', isActive: true })
    .populate('regionId', 'name slug code')
    .populate('managerId', 'firstName lastName email phone');

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  // Increment views
  location.analytics.views += 1;
  await location.save();

  res.status(200).json({
    status: 'success',
    data: { location }
  });
});

export const getNearbyLocations = catchAsync(async (req: Request, res: Response) => {
  const { latitude, longitude, radius = 10, limit = 10 } = req.query;

  if (!latitude || !longitude) {
    throw new AppError('Latitude and longitude are required', 400);
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  const radiusInKm = Number(radius);

  // Calculate using Haversine formula
  const locations = await Location.find({
    status: 'active',
    isActive: true,
    'settings.showOnStoreFinder': true
  });

  const nearbyLocations = locations
    .map(location => {
      const distance = calculateDistance(
        lat,
        lng,
        location.coordinates.latitude,
        location.coordinates.longitude
      );
      return { ...location.toObject(), distance };
    })
    .filter(location => location.distance <= radiusInKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, Number(limit));

  res.status(200).json({
    status: 'success',
    results: nearbyLocations.length,
    data: { locations: nearbyLocations }
  });
});

export const createLocation = catchAsync(async (req: Request, res: Response) => {
  const locationData = {
    ...req.body,
    createdBy: req.user?._id
  };

  const location = await Location.create(locationData);

  // Update region stats if regionId provided
  if (location.regionId) {
    await updateRegionStats(location.regionId as any);
  }

  res.status(201).json({
    status: 'success',
    data: { location }
  });
});

export const updateLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  const oldRegionId = location.regionId;
  
  location.updatedBy = req.user?._id as any;
  Object.assign(location, req.body);

  await location.save();

  // Update region stats if region changed
  if (oldRegionId && oldRegionId.toString() !== location.regionId?.toString()) {
    await updateRegionStats(oldRegionId as any);
    if (location.regionId) {
      await updateRegionStats(location.regionId as any);
    }
  } else if (location.regionId) {
    await updateRegionStats(location.regionId as any);
  }

  res.status(200).json({
    status: 'success',
    data: { location }
  });
});

export const deleteLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  const regionId = location.regionId;

  await location.deleteOne();

  // Update region stats
  if (regionId) {
    await updateRegionStats(regionId as any);
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const activateLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  location.isActive = true;
  location.status = 'active';
  await location.save();

  res.status(200).json({
    status: 'success',
    data: { location }
  });
});

export const deactivateLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  location.isActive = false;
  location.status = 'inactive';
  await location.save();

  res.status(200).json({
    status: 'success',
    data: { location }
  });
});

// ==================== REGIONS ====================

export const getRegions = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sort = 'displayOrder',
    status,
    type,
    isActive,
    parentRegionId,
    search
  } = req.query;

  const filter: any = {};

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (parentRegionId) filter.parentRegionId = parentRegionId === 'null' ? null : parentRegionId;
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Region.countDocuments(filter);

  const regions = await Region.find(filter)
    .sort(sort as string)
    .skip(skip)
    .limit(Number(limit))
    .populate('parentRegionId', 'name slug code type')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    results: regions.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { regions }
  });
});

export const getRegionById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const region = await Region.findById(req.params.id)
    .populate('parentRegionId', 'name slug code type')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email')
    .populate('childRegions')
    .populate('locations');

  if (!region) {
    return next(new AppError('Region not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { region }
  });
});

export const getRegionBySlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;

  const region = await Region.findOne({ slug, status: 'active', isActive: true })
    .populate('parentRegionId', 'name slug code type')
    .populate('childRegions')
    .populate('locations');

  if (!region) {
    return next(new AppError('Region not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { region }
  });
});

export const createRegion = catchAsync(async (req: Request, res: Response) => {
  const regionData = {
    ...req.body,
    createdBy: req.user?._id
  };

  const region = await Region.create(regionData);

  res.status(201).json({
    status: 'success',
    data: { region }
  });
});

export const updateRegion = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const region = await Region.findById(req.params.id);

  if (!region) {
    return next(new AppError('Region not found', 404));
  }

  region.updatedBy = req.user?._id as any;
  Object.assign(region, req.body);

  await region.save();

  res.status(200).json({
    status: 'success',
    data: { region }
  });
});

export const deleteRegion = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const region = await Region.findById(req.params.id);

  if (!region) {
    return next(new AppError('Region not found', 404));
  }

  // Check if region has locations
  const locationsCount = await Location.countDocuments({ regionId: region._id });
  
  if (locationsCount > 0) {
    return next(new AppError('Cannot delete region with existing locations. Please reassign or delete locations first.', 400));
  }

  // Check if region has child regions
  const childRegionsCount = await Region.countDocuments({ parentRegionId: region._id });
  
  if (childRegionsCount > 0) {
    return next(new AppError('Cannot delete region with child regions. Please delete child regions first.', 400));
  }

  await region.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// ==================== TRACKING ====================

export const trackLocationClick = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  location.analytics.clicks += 1;
  await location.save();

  res.status(200).json({
    status: 'success',
    data: { location }
  });
});

export const trackDirections = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  location.analytics.directions += 1;
  await location.save();

  res.status(200).json({
    status: 'success',
    data: { location }
  });
});

export const trackCall = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  location.analytics.calls += 1;
  await location.save();

  res.status(200).json({
    status: 'success',
    data: { location }
  });
});

// ==================== ANALYTICS ====================

export const getLocationAnalytics = catchAsync(async (req: Request, res: Response) => {
  const [
    totalLocations,
    activeLocations,
    byType,
    topLocations,
    totalViews,
    totalClicks
  ] = await Promise.all([
    Location.countDocuments(),
    Location.countDocuments({ isActive: true, status: 'active' }),
    Location.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    Location.find({ isActive: true })
      .sort('-analytics.views')
      .limit(10)
      .select('name slug type address analytics')
      .populate('regionId', 'name slug'),
    Location.aggregate([
      { $group: { _id: null, total: { $sum: '$analytics.views' } } }
    ]),
    Location.aggregate([
      { $group: { _id: null, total: { $sum: '$analytics.clicks' } } }
    ])
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      locations: {
        total: totalLocations,
        active: activeLocations,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as any)
      },
      analytics: {
        totalViews: totalViews[0]?.total || 0,
        totalClicks: totalClicks[0]?.total || 0
      },
      topLocations
    }
  });
});

export const getRegionAnalytics = catchAsync(async (req: Request, res: Response) => {
  const [
    totalRegions,
    activeRegions,
    byType,
    topRegions
  ] = await Promise.all([
    Region.countDocuments(),
    Region.countDocuments({ isActive: true, status: 'active' }),
    Region.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    Region.find({ isActive: true })
      .sort('-stats.totalRevenue')
      .limit(10)
      .select('name slug code stats')
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      regions: {
        total: totalRegions,
        active: activeRegions,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as any)
      },
      topRegions
    }
  });
});

// ==================== HELPER FUNCTIONS ====================

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

async function updateRegionStats(regionId: string) {
  const locations = await Location.countDocuments({ regionId, isActive: true });
  
  await Region.findByIdAndUpdate(regionId, {
    'stats.totalLocations': locations
  });
}

// ==================== BULK OPERATIONS ====================

export const bulkUpdateLocations = catchAsync(async (req: Request, res: Response) => {
  const { ids, updates } = req.body;

  const result = await Location.updateMany(
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

export const bulkDeleteLocations = catchAsync(async (req: Request, res: Response) => {
  const { ids } = req.body;

  const result = await Location.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    status: 'success',
    data: { deletedCount: result.deletedCount }
  });
});
