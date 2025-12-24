import { Request, Response, NextFunction } from 'express';
import Collection from '../models/collection.model.js';
import Product from '../models/Product.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// ==================== COLLECTIONS ====================

export const getCollections = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    status,
    type,
    isActive,
    isFeatured,
    search
  } = req.query;

  // Default filter for public access - show only active collections
  const filter: any = {
    isActive: true
  };

  // Override defaults if explicitly specified
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Collection.countDocuments(filter);

  const collections = await Collection.find(filter)
    .sort(sort as string)
    .skip(skip)
    .limit(Number(limit))
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    results: collections.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: collections  // Return collections array directly, not wrapped in object
  });
});

export const getCollectionById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const collection = await Collection.findById(req.params.id)
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email')
    .populate('manualProducts')
    .populate('featuredProducts');

  if (!collection) {
    return next(new AppError('Collection not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { collection }
  });
});

export const getCollectionBySlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;

  const collection = await Collection.findOne({ slug, status: 'active' });

  if (!collection) {
    return next(new AppError('Collection not found', 404));
  }

  // Increment views
  collection.analytics.views += 1;
  await collection.save();

  // Get products for this collection
  let products: any[] = [];

  if (collection.type === 'manual') {
    products = await Product.find({
      _id: { $in: collection.manualProducts },
      isActive: true
    });
  } else if (collection.type === 'automatic' && collection.automaticRules) {
    const query = (Collection as any).buildQueryFromRules(
      collection.automaticRules.rules,
      collection.automaticRules.matchType
    );

    products = await Product.find({
      ...query,
      isActive: true
    })
      .sort(collection.automaticRules.sortOrder === 'asc' ? collection.automaticRules.sortBy : `-${collection.automaticRules.sortBy}`)
      .limit(collection.automaticRules.maxProducts || 100);
  } else if (collection.type === 'hybrid') {
    // Get featured products first
    const featured = await Product.find({
      _id: { $in: collection.featuredProducts },
      isActive: true
    });

    // Then get automatic products
    if (collection.automaticRules) {
      const query = (Collection as any).buildQueryFromRules(
        collection.automaticRules.rules,
        collection.automaticRules.matchType
      );

      const automatic = await Product.find({
        ...query,
        _id: { $nin: collection.featuredProducts },
        isActive: true
      })
        .sort(collection.automaticRules.sortOrder === 'asc' ? collection.automaticRules.sortBy : `-${collection.automaticRules.sortBy}`)
        .limit((collection.automaticRules.maxProducts || 100) - featured.length);

      products = [...featured, ...automatic];
    } else {
      products = featured;
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      collection,
      products,
      productCount: products.length
    }
  });
});

export const createCollection = catchAsync(async (req: Request, res: Response) => {
  const collectionData = {
    ...req.body,
    createdBy: req.user?._id
  };

  const collection = await Collection.create(collectionData);

  // If automatic or hybrid, update cached products
  if (collection.type === 'automatic' || collection.type === 'hybrid') {
    await updateCollectionProducts(collection._id as string);
  }

  res.status(201).json({
    status: 'success',
    data: { collection }
  });
});

export const updateCollection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    return next(new AppError('Collection not found', 404));
  }

  collection.updatedBy = req.user?._id as any;
  Object.assign(collection, req.body);

  await collection.save();

  // If rules changed, update cached products
  if (collection.type === 'automatic' || collection.type === 'hybrid') {
    await updateCollectionProducts(collection._id as string);
  }

  res.status(200).json({
    status: 'success',
    data: { collection }
  });
});

export const deleteCollection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const collection = await Collection.findByIdAndDelete(req.params.id);

  if (!collection) {
    return next(new AppError('Collection not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const activateCollection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    return next(new AppError('Collection not found', 404));
  }

  collection.isActive = true;
  collection.status = 'active';
  await collection.save();

  res.status(200).json({
    status: 'success',
    data: { collection }
  });
});

export const deactivateCollection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    return next(new AppError('Collection not found', 404));
  }

  collection.isActive = false;
  collection.status = 'draft';
  await collection.save();

  res.status(200).json({
    status: 'success',
    data: { collection }
  });
});

export const duplicateCollection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const originalCollection = await Collection.findById(req.params.id);

  if (!originalCollection) {
    return next(new AppError('Collection not found', 404));
  }

  const collectionData: any = originalCollection.toObject();
  delete collectionData._id;
  delete collectionData.createdAt;
  delete collectionData.updatedAt;

  collectionData.name = `${collectionData.name} (Copy)`;
  collectionData.slug = `${collectionData.slug}-copy`;
  collectionData.status = 'draft';
  collectionData.isActive = false;
  collectionData.createdBy = req.user?._id as any;
  collectionData.analytics = {
    views: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
    productsSold: 0
  };

  const newCollection = await Collection.create(collectionData);

  res.status(201).json({
    status: 'success',
    data: { collection: newCollection }
  });
});

// ==================== PRODUCT MANAGEMENT ====================

export const addProductsToCollection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { productIds } = req.body;

  const collection = await Collection.findById(id);

  if (!collection) {
    return next(new AppError('Collection not found', 404));
  }

  if (collection.type !== 'manual' && collection.type !== 'hybrid') {
    return next(new AppError('Can only add products to manual or hybrid collections', 400));
  }

  // Add products (avoid duplicates)
  const currentProducts = collection.manualProducts?.map(p => p.toString()) || [];
  const newProducts = productIds.filter((id: string) => !currentProducts.includes(id));

  collection.manualProducts = [...(collection.manualProducts || []), ...newProducts] as any;
  await collection.save();

  res.status(200).json({
    status: 'success',
    data: { collection }
  });
});

export const removeProductsFromCollection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { productIds } = req.body;

  const collection = await Collection.findById(id);

  if (!collection) {
    return next(new AppError('Collection not found', 404));
  }

  if (collection.type !== 'manual' && collection.type !== 'hybrid') {
    return next(new AppError('Can only remove products from manual or hybrid collections', 400));
  }

  collection.manualProducts = collection.manualProducts?.filter(
    p => !productIds.includes(p.toString())
  ) as any;

  await collection.save();

  res.status(200).json({
    status: 'success',
    data: { collection }
  });
});

export const reorderProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { productIds } = req.body; // Array of product IDs in desired order

  const collection = await Collection.findById(id);

  if (!collection) {
    return next(new AppError('Collection not found', 404));
  }

  if (collection.type !== 'manual' && collection.type !== 'hybrid') {
    return next(new AppError('Can only reorder products in manual or hybrid collections', 400));
  }

  collection.manualProducts = productIds as any;
  await collection.save();

  res.status(200).json({
    status: 'success',
    data: { collection }
  });
});

export const getCollectionProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const {
    page = 1,
    limit = 12,
    sort = '-createdAt'
  } = req.query;

  const collection = await Collection.findById(id);

  if (!collection) {
    return next(new AppError('Collection not found', 404));
  }

  let products: any[] = [];
  let total = 0;

  if (collection.type === 'manual') {
    total = collection.manualProducts?.length || 0;
    const skip = (Number(page) - 1) * Number(limit);

    products = await Product.find({
      _id: { $in: collection.manualProducts }
    })
      .sort(sort as string)
      .skip(skip)
      .limit(Number(limit));
  } else if (collection.type === 'automatic' && collection.automaticRules) {
    const query = (Collection as any).buildQueryFromRules(
      collection.automaticRules.rules,
      collection.automaticRules.matchType
    );

    total = await Product.countDocuments(query);
    const skip = (Number(page) - 1) * Number(limit);

    products = await Product.find(query)
      .sort(collection.automaticRules.sortOrder === 'asc' ? collection.automaticRules.sortBy : `-${collection.automaticRules.sortBy}`)
      .skip(skip)
      .limit(Number(limit));
  }

  res.status(200).json({
    status: 'success',
    results: products.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: { products }
  });
});

// ==================== AUTO-UPDATE ====================

export const updateCollectionProducts = async (collectionId: string) => {
  const collection = await Collection.findById(collectionId);

  if (!collection || (collection.type !== 'automatic' && collection.type !== 'hybrid')) {
    return;
  }

  if (!collection.automaticRules) {
    return;
  }

  const query = (Collection as any).buildQueryFromRules(
    collection.automaticRules.rules,
    collection.automaticRules.matchType
  );

  const products = await Product.find({
    ...query,
    isActive: true
  })
    .sort(collection.automaticRules.sortOrder === 'asc' ? collection.automaticRules.sortBy : `-${collection.automaticRules.sortBy}`)
    .limit(collection.automaticRules.maxProducts || 100)
    .select('_id');

  collection.cachedProducts = products.map(p => p._id) as any;
  collection.cachedProductCount = products.length;
  collection.lastCacheUpdate = new Date();

  await collection.save();
};

export const refreshCollectionProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const collection = await Collection.findById(id);

  if (!collection) {
    return next(new AppError('Collection not found', 404));
  }

  if (collection.type !== 'automatic' && collection.type !== 'hybrid') {
    return next(new AppError('Can only refresh automatic or hybrid collections', 400));
  }

  await updateCollectionProducts(id);

  const updatedCollection = await Collection.findById(id);

  res.status(200).json({
    status: 'success',
    message: 'Collection products refreshed successfully',
    data: { collection: updatedCollection }
  });
});

export const refreshAllCollections = catchAsync(async (req: Request, res: Response) => {
  const collections = await Collection.find({
    type: { $in: ['automatic', 'hybrid'] },
    autoUpdateEnabled: true,
    isActive: true
  });

  const updatePromises = collections.map(c => updateCollectionProducts(c._id as string));
  await Promise.all(updatePromises);

  res.status(200).json({
    status: 'success',
    message: `Refreshed ${collections.length} collections`,
    data: { count: collections.length }
  });
});

// ==================== RULES MANAGEMENT ====================

export const validateRules = catchAsync(async (req: Request, res: Response) => {
  const { rules, matchType } = req.body;

  try {
    const query = (Collection as any).buildQueryFromRules(rules, matchType);

    const count = await Product.countDocuments(query);
    const sampleProducts = await Product.find(query).limit(5);

    res.status(200).json({
      status: 'success',
      data: {
        isValid: true,
        matchingProducts: count,
        sampleProducts
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid rules',
      error: error.message
    });
  }
});

// ==================== ANALYTICS ====================

export const getCollectionAnalytics = catchAsync(async (req: Request, res: Response) => {
  const [
    totalCollections,
    activeCollections,
    manualCollections,
    automaticCollections,
    hybridCollections,
    featuredCollections,
    topCollections
  ] = await Promise.all([
    Collection.countDocuments(),
    Collection.countDocuments({ isActive: true, status: 'active' }),
    Collection.countDocuments({ type: 'manual' }),
    Collection.countDocuments({ type: 'automatic' }),
    Collection.countDocuments({ type: 'hybrid' }),
    Collection.countDocuments({ isFeatured: true }),
    Collection.find({ isActive: true })
      .sort('-analytics.views')
      .limit(10)
      .select('name slug analytics')
  ]);

  const totalViews = await Collection.aggregate([
    { $group: { _id: null, total: { $sum: '$analytics.views' } } }
  ]);

  const totalRevenue = await Collection.aggregate([
    { $group: { _id: null, total: { $sum: '$analytics.revenue' } } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      collections: {
        total: totalCollections,
        active: activeCollections,
        featured: featuredCollections,
        byType: {
          manual: manualCollections,
          automatic: automaticCollections,
          hybrid: hybridCollections
        }
      },
      analytics: {
        totalViews: totalViews[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      topCollections
    }
  });
});

export const getCollectionStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const collection = await Collection.findById(id);

  if (!collection) {
    return next(new AppError('Collection not found', 404));
  }

  let productCount = 0;

  if (collection.type === 'manual') {
    productCount = collection.manualProducts?.length || 0;
  } else if (collection.cachedProductCount !== undefined) {
    productCount = collection.cachedProductCount;
  } else {
    // Calculate on the fly
    if (collection.automaticRules) {
      const query = (Collection as any).buildQueryFromRules(
        collection.automaticRules.rules,
        collection.automaticRules.matchType
      );
      productCount = await Product.countDocuments(query);
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      collection: {
        id: collection._id,
        name: collection.name,
        slug: collection.slug,
        type: collection.type
      },
      stats: {
        productCount,
        views: collection.analytics.views,
        clicks: collection.analytics.clicks,
        conversions: collection.analytics.conversions,
        revenue: collection.analytics.revenue,
        productsSold: collection.analytics.productsSold,
        conversionRate: collection.analytics.views > 0
          ? ((collection.analytics.conversions / collection.analytics.views) * 100).toFixed(2)
          : 0
      }
    }
  });
});

// ==================== TRACKING ====================

export const trackCollectionView = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    return next(new AppError('Collection not found', 404));
  }

  collection.analytics.views += 1;
  await collection.save();

  res.status(200).json({
    status: 'success',
    data: { collection }
  });
});

export const trackCollectionClick = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    return next(new AppError('Collection not found', 404));
  }

  collection.analytics.clicks += 1;
  await collection.save();

  res.status(200).json({
    status: 'success',
    data: { collection }
  });
});

// ==================== BULK OPERATIONS ====================

export const bulkUpdateCollections = catchAsync(async (req: Request, res: Response) => {
  const { ids, updates } = req.body;

  const result = await Collection.updateMany(
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

export const bulkDeleteCollections = catchAsync(async (req: Request, res: Response) => {
  const { ids } = req.body;

  const result = await Collection.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    status: 'success',
    data: { deletedCount: result.deletedCount }
  });
});
