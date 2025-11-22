import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Wishlist, { IWishlist, WishlistItemPriority } from '../models/Wishlist.model.js';
import Product, { IProduct } from '../models/Product.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// ============================================================================
// BASIC CRUD OPERATIONS
// ============================================================================

/**
 * Get user's wishlist with all items populated
 * GET /api/v1/wishlist
 */
export const getWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  
  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  // Find or create default wishlist
  let wishlist = await Wishlist.findOne({ user: userId, isDefault: true })
    .populate({
      path: 'items.product',
      select: 'name price images stock category brand rating discount'
    })
    .populate('user', 'name email');

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      name: 'My Wishlist',
      isDefault: true
    });
  }

  // Calculate additional metrics
  const items = wishlist.items.map((item, index) => {
    const product = item.product as any;
    const currentPrice = product?.price || item.priceWhenAdded;
    const priceChange = currentPrice - item.priceWhenAdded;
    const priceChangePercent = (priceChange / item.priceWhenAdded) * 100;

    return {
      id: product?._id || index,
      product,
      addedAt: item.addedAt,
      priority: item.priority,
      notes: item.notes,
      priceWhenAdded: item.priceWhenAdded,
      currentPrice,
      priceChange,
      priceChangePercent: priceChangePercent.toFixed(2),
      notifyOnPriceChange: item.notifyOnPriceChange,
      notifyOnStockAvailable: item.notifyOnStockAvailable
    };
  });

  res.status(200).json({
    success: true,
    data: {
      wishlist: {
        ...wishlist.toObject(),
        items
      },
      itemCount: wishlist.itemCount,
      totalValue: wishlist.totalValue,
      lastUpdated: wishlist.lastActivityAt
    }
  });
});

/**
 * Get wishlist item count
 * GET /api/v1/wishlist/count
 */
export const getWishlistCount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  
  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const wishlist = await Wishlist.findOne({ user: userId, isDefault: true }).select('items');
  
  res.status(200).json({
    success: true,
    data: {
      count: wishlist ? wishlist.items.length : 0
    }
  });
});

/**
 * Add product to wishlist
 * POST /api/v1/wishlist/add
 */
export const addToWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const { productId, priority, notes, notifyOnPriceChange, notifyOnStockAvailable } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!productId) {
    return next(new AppError('Product ID is required', 400));
  }

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Find or create default wishlist
  let wishlist = await Wishlist.findOne({ user: userId, isDefault: true });
  
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      name: 'My Wishlist',
      isDefault: true
    });
  }

  // Add item to wishlist
  await wishlist.addItem(new mongoose.Types.ObjectId(productId), {
    priority: priority || WishlistItemPriority.MEDIUM,
    notes,
    notifyOnPriceChange: notifyOnPriceChange || false,
    notifyOnStockAvailable: notifyOnStockAvailable || false
  });

  // Populate the product details
  await wishlist.populate('items.product', 'name price images stock');

  // Find the added item
  const addedItem = wishlist.items.find(
    item => (item.product as any)._id.toString() === productId
  );

  res.status(201).json({
    success: true,
    message: 'Added to wishlist',
    data: {
      item: addedItem,
      wishlist: {
        itemCount: wishlist.itemCount,
        totalValue: wishlist.totalValue
      }
    }
  });
});

/**
 * Remove item from wishlist
 * DELETE /api/v1/wishlist/remove/:itemId
 */
export const removeFromWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const { itemId } = req.params;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const wishlist = await Wishlist.findOne({ user: userId, isDefault: true });
  
  if (!wishlist) {
    return next(new AppError('Wishlist not found', 404));
  }

  // Remove item by product ID or item index
  const removed = await wishlist.removeItem(new mongoose.Types.ObjectId(itemId));

  if (!removed) {
    return next(new AppError('Item not found in wishlist', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Removed from wishlist',
    data: {
      itemCount: wishlist.itemCount,
      totalValue: wishlist.totalValue
    }
  });
});

/**
 * Clear entire wishlist
 * DELETE /api/v1/wishlist/clear
 */
export const clearWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const wishlist = await Wishlist.findOne({ user: userId, isDefault: true });
  
  if (!wishlist) {
    return next(new AppError('Wishlist not found', 404));
  }

  await wishlist.clearItems();

  res.status(200).json({
    success: true,
    message: 'Wishlist cleared'
  });
});

/**
 * Check if product is in wishlist
 * GET /api/v1/wishlist/check/:productId
 */
export const isInWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const { productId } = req.params;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const wishlist = await Wishlist.findOne({ user: userId, isDefault: true });
  
  const inWishlist = wishlist ? wishlist.hasItem(new mongoose.Types.ObjectId(productId)) : false;
  
  const item = inWishlist 
    ? wishlist!.items.find(i => i.product.toString() === productId)
    : null;

  res.status(200).json({
    success: true,
    data: {
      inWishlist,
      itemId: item?.product?.toString() || null
    }
  });
});

/**
 * Toggle product in wishlist (add if not present, remove if present)
 * POST /api/v1/wishlist/toggle
 */
export const toggleWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const { productId } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!productId) {
    return next(new AppError('Product ID is required', 400));
  }

  // Find or create default wishlist
  let wishlist = await Wishlist.findOne({ user: userId, isDefault: true });
  
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      name: 'My Wishlist',
      isDefault: true
    });
  }

  const hasItem = wishlist.hasItem(new mongoose.Types.ObjectId(productId));

  if (hasItem) {
    // Remove item
    await wishlist.removeItem(new mongoose.Types.ObjectId(productId));
    
    res.status(200).json({
      success: true,
      data: {
        action: 'removed',
        itemCount: wishlist.itemCount
      }
    });
  } else {
    // Add item
    await wishlist.addItem(new mongoose.Types.ObjectId(productId));
    await wishlist.populate('items.product', 'name price images');
    
    const addedItem = wishlist.items.find(
      item => (item.product as any)._id.toString() === productId
    );
    
    res.status(200).json({
      success: true,
      data: {
        action: 'added',
        item: addedItem,
        itemCount: wishlist.itemCount
      }
    });
  }
});

// ============================================================================
// ADVANCED FEATURES
// ============================================================================

/**
 * Share wishlist
 * POST /api/v1/wishlist/share
 */
export const shareWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const { isPublic = true, allowCollaboration = false, expiresAt } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const wishlist = await Wishlist.findOne({ user: userId, isDefault: true });
  
  if (!wishlist) {
    return next(new AppError('Wishlist not found', 404));
  }

  wishlist.isPublic = isPublic;
  wishlist.allowCollaboration = allowCollaboration;
  
  if (expiresAt) {
    wishlist.expiresAt = new Date(expiresAt);
  }

  const shareCode = await wishlist.generateShareCode();

  res.status(200).json({
    success: true,
    message: 'Wishlist shared successfully',
    data: {
      shareCode,
      shareUrl: wishlist.shareUrl
    }
  });
});

/**
 * Get shared wishlist by share code
 * GET /api/v1/wishlist/shared/:shareCode
 */
export const getSharedWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { shareCode } = req.params;

  const wishlist = await (Wishlist as any).findByShareCode(shareCode)
    .populate({
      path: 'items.product',
      select: 'name price images stock category brand rating'
    })
    .populate('user', 'name');

  if (!wishlist) {
    return next(new AppError('Shared wishlist not found or expired', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      wishlist: {
        name: wishlist.name,
        description: wishlist.description,
        owner: wishlist.user,
        items: wishlist.items,
        itemCount: wishlist.itemCount,
        createdAt: wishlist.createdAt
      }
    }
  });
});

/**
 * Move item to cart
 * POST /api/v1/wishlist/items/:itemId/move-to-cart
 */
export const moveToCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const { itemId } = req.params;
  const { quantity = 1 } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const wishlist = await Wishlist.findOne({ user: userId, isDefault: true })
    .populate('items.product');
  
  if (!wishlist) {
    return next(new AppError('Wishlist not found', 404));
  }

  const item = wishlist.items.find(
    i => i.product.toString() === itemId || (i as any)._id?.toString() === itemId
  );

  if (!item) {
    return next(new AppError('Item not found in wishlist', 404));
  }

  // TODO: Add to cart logic here
  // For now, just remove from wishlist
  await wishlist.removeItem(item.product as mongoose.Types.ObjectId);

  res.status(200).json({
    success: true,
    message: 'Moved to cart',
    data: {
      productId: item.product,
      quantity
    }
  });
});

/**
 * Get wishlist recommendations based on current items
 * GET /api/v1/wishlist/recommendations
 */
export const getRecommendations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const { limit = 10 } = req.query;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const wishlist = await Wishlist.findOne({ user: userId, isDefault: true })
    .populate('items.product', 'category brand');
  
  if (!wishlist || wishlist.items.length === 0) {
    // Return popular products if wishlist is empty
    const recommendations = await Product.find({ isActive: true })
      .sort('-rating -soldCount')
      .limit(Number(limit))
      .select('name price images rating category brand');
    
    return res.status(200).json({
      success: true,
      data: { recommendations }
    });
  }

  // Get categories and brands from wishlist items
  const categories = new Set<string>();
  const brands = new Set<string>();

  wishlist.items.forEach(item => {
    const product = item.product as any;
    if (product?.category) categories.add(product.category.toString());
    if (product?.brand) brands.add(product.brand);
  });

  // Find similar products
  const recommendations = await Product.find({
    isActive: true,
    _id: { $nin: wishlist.items.map(i => i.product) },
    $or: [
      { category: { $in: Array.from(categories) } },
      { brand: { $in: Array.from(brands) } }
    ]
  })
    .sort('-rating -soldCount')
    .limit(Number(limit))
    .select('name price images rating category brand discount');

  res.status(200).json({
    success: true,
    data: { recommendations }
  });
});

/**
 * Get similar products to a specific wishlist item
 * GET /api/v1/wishlist/items/:itemId/similar
 */
export const getSimilarProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const { itemId } = req.params;
  const { limit = 5 } = req.query;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const wishlist = await Wishlist.findOne({ user: userId, isDefault: true })
    .populate('items.product');
  
  if (!wishlist) {
    return next(new AppError('Wishlist not found', 404));
  }

  const item = wishlist.items.find(
    i => (i.product as any)._id?.toString() === itemId
  );

  if (!item) {
    return next(new AppError('Item not found in wishlist', 404));
  }

  const product = item.product as any;

  // Find similar products
  const similarProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true
  })
    .sort('-rating')
    .limit(Number(limit))
    .select('name price images rating brand discount');

  res.status(200).json({
    success: true,
    data: { similarProducts }
  });
});

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk add products to wishlist
 * POST /api/v1/wishlist/bulk/add
 */
export const bulkAddToWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const { productIds } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return next(new AppError('Product IDs array is required', 400));
  }

  // Find or create default wishlist
  let wishlist = await Wishlist.findOne({ user: userId, isDefault: true });
  
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      name: 'My Wishlist',
      isDefault: true
    });
  }

  // Add all products
  const addedItems = [];
  for (const productId of productIds) {
    try {
      await wishlist.addItem(new mongoose.Types.ObjectId(productId));
      addedItems.push(productId);
    } catch (error) {
      console.error(`Failed to add product ${productId}:`, error);
    }
  }

  await wishlist.populate('items.product', 'name price images');

  res.status(200).json({
    success: true,
    message: `Added ${addedItems.length} items to wishlist`,
    data: {
      addedCount: addedItems.length,
      itemCount: wishlist.itemCount
    }
  });
});

/**
 * Bulk remove items from wishlist
 * DELETE /api/v1/wishlist/bulk/remove
 */
export const bulkRemoveFromWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const { itemIds } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
    return next(new AppError('Item IDs array is required', 400));
  }

  const wishlist = await Wishlist.findOne({ user: userId, isDefault: true });
  
  if (!wishlist) {
    return next(new AppError('Wishlist not found', 404));
  }

  // Remove all items
  let removedCount = 0;
  for (const itemId of itemIds) {
    const removed = await wishlist.removeItem(new mongoose.Types.ObjectId(itemId));
    if (removed) removedCount++;
  }

  res.status(200).json({
    success: true,
    message: `Removed ${removedCount} items from wishlist`,
    data: {
      removedCount,
      itemCount: wishlist.itemCount
    }
  });
});

/**
 * Bulk move items to cart
 * POST /api/v1/wishlist/bulk/move-to-cart
 */
export const bulkMoveToCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const { itemIds } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
    return next(new AppError('Item IDs array is required', 400));
  }

  const wishlist = await Wishlist.findOne({ user: userId, isDefault: true });
  
  if (!wishlist) {
    return next(new AppError('Wishlist not found', 404));
  }

  // TODO: Add items to cart
  // For now, just remove from wishlist
  let movedCount = 0;
  for (const itemId of itemIds) {
    const removed = await wishlist.removeItem(new mongoose.Types.ObjectId(itemId));
    if (removed) movedCount++;
  }

  res.status(200).json({
    success: true,
    message: `Moved ${movedCount} items to cart`,
    data: {
      movedCount,
      itemCount: wishlist.itemCount
    }
  });
});

// ============================================================================
// SEARCH & ANALYTICS
// ============================================================================

/**
 * Search wishlist items
 * GET /api/v1/wishlist/search
 */
export const searchWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const { query, category, priceRange, inStock } = req.query;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const wishlist = await Wishlist.findOne({ user: userId, isDefault: true })
    .populate({
      path: 'items.product',
      match: {
        ...(query && { name: { $regex: query, $options: 'i' } }),
        ...(category && { category }),
        ...(inStock && { stock: { $gt: 0 } })
      }
    });
  
  if (!wishlist) {
    return next(new AppError('Wishlist not found', 404));
  }

  // Filter by price range
  let filteredItems = wishlist.items.filter(item => item.product !== null);
  
  if (priceRange) {
    const { min, max } = JSON.parse(priceRange as string);
    filteredItems = filteredItems.filter(item => {
      const price = (item.product as any).price;
      return price >= min && price <= max;
    });
  }

  res.status(200).json({
    success: true,
    data: {
      items: filteredItems,
      count: filteredItems.length
    }
  });
});

/**
 * Get wishlist analytics
 * GET /api/v1/wishlist/analytics
 */
export const getWishlistAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const wishlist = await Wishlist.findOne({ user: userId, isDefault: true })
    .populate('items.product', 'name price category stock');
  
  if (!wishlist) {
    return res.status(200).json({
      success: true,
      data: {
        totalItems: 0,
        totalValue: 0,
        categoryBreakdown: [],
        recentActivity: []
      }
    });
  }

  // Category breakdown
  const categoryMap = new Map<string, { count: number; value: number }>();
  
  wishlist.items.forEach(item => {
    const product = item.product as any;
    if (product) {
      const categoryName = product.category?.name || 'Uncategorized';
      const existing = categoryMap.get(categoryName) || { count: 0, value: 0 };
      categoryMap.set(categoryName, {
        count: existing.count + 1,
        value: existing.value + product.price
      });
    }
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    ...data
  }));

  // Recent activity
  const recentActivity = wishlist.items
    .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
    .slice(0, 10)
    .map(item => ({
      action: 'added',
      productName: (item.product as any)?.name || 'Unknown',
      date: item.addedAt
    }));

  res.status(200).json({
    success: true,
    data: {
      totalItems: wishlist.itemCount,
      totalValue: wishlist.totalValue,
      categoryBreakdown,
      recentActivity
    }
  });
});

// ============================================================================
// EXPORT & IMPORT
// ============================================================================

/**
 * Export wishlist
 * POST /api/v1/wishlist/export
 */
export const exportWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const { format = 'json' } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const wishlist = await Wishlist.findOne({ user: userId, isDefault: true })
    .populate('items.product', 'name price images sku');
  
  if (!wishlist) {
    return next(new AppError('Wishlist not found', 404));
  }

  if (format === 'json') {
    res.status(200).json({
      success: true,
      data: {
        downloadUrl: '/api/v1/wishlist/download/json',
        wishlist: wishlist.toObject()
      }
    });
  } else if (format === 'csv') {
    // TODO: Generate CSV
    res.status(200).json({
      success: true,
      data: {
        downloadUrl: '/api/v1/wishlist/download/csv'
      }
    });
  } else {
    return next(new AppError('Invalid format. Use json or csv', 400));
  }
});

/**
 * Import wishlist
 * POST /api/v1/wishlist/import
 */
export const importWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const { productIds } = req.body;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!productIds || !Array.isArray(productIds)) {
    return next(new AppError('Product IDs array is required', 400));
  }

  let wishlist = await Wishlist.findOne({ user: userId, isDefault: true });
  
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      name: 'My Wishlist',
      isDefault: true
    });
  }

  let imported = 0;
  const errors: string[] = [];

  for (const productId of productIds) {
    try {
      await wishlist.addItem(new mongoose.Types.ObjectId(productId));
      imported++;
    } catch (error) {
      errors.push(`Failed to import product ${productId}`);
    }
  }

  res.status(200).json({
    success: true,
    message: `Imported ${imported} items`,
    data: {
      imported,
      errors
    }
  });
});
