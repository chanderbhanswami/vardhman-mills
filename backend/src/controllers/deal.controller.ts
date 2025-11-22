import { Request, Response, NextFunction } from 'express';
import Deal from '../models/Deal.model.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

// ==================== CRUD OPERATIONS ====================

/**
 * Get all deals with filtering and pagination
 * @route GET /api/v1/deals
 * @access Public
 */
export const getDeals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      type,
      status,
      isFlashSale,
      isFeatured,
      applicableTo,
      page = 1,
      limit = 10,
      sort = '-priority -createdAt'
    } = req.query;

    const query: any = { isActive: true, deletedAt: { $exists: false } };

    // Apply filters
    if (type) query.type = type;
    if (status) query.status = status;
    if (isFlashSale !== undefined) query.isFlashSale = isFlashSale === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (applicableTo) query.applicableTo = applicableTo;

    // Date filters for active deals
    if (status === 'active') {
      const now = new Date();
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [deals, total] = await Promise.all([
      Deal.find(query)
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .populate('products', 'name price images')
        .populate('categories', 'name')
        .populate('brands', 'name')
        .populate('createdBy', 'name email'),
      Deal.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: deals.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: deals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single deal by ID
 * @route GET /api/v1/deals/:id
 * @access Public
 */
export const getDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('products', 'name price images stock')
      .populate('categories', 'name description')
      .populate('brands', 'name logo')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!deal || deal.deletedAt) {
      return next(new AppError('Deal not found', 404));
    }

    // Increment view count
    deal.views += 1;
    await deal.save();

    res.status(200).json({
      success: true,
      data: deal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new deal
 * @route POST /api/v1/deals
 * @access Admin
 */
export const createDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate product/category/brand existence
    if (req.body.applicableTo === 'specific' && req.body.products) {
      const productCount = await Product.countDocuments({
        _id: { $in: req.body.products }
      });
      if (productCount !== req.body.products.length) {
        return next(new AppError('One or more products not found', 404));
      }
    }

    if (req.body.applicableTo === 'category' && req.body.categories) {
      const categoryCount = await Category.countDocuments({
        _id: { $in: req.body.categories }
      });
      if (categoryCount !== req.body.categories.length) {
        return next(new AppError('One or more categories not found', 404));
      }
    }

    const deal = await Deal.create({
      ...req.body,
      createdBy: req.user?._id as unknown as mongoose.Types.ObjectId
    });

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: deal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update deal
 * @route PATCH /api/v1/deals/:id
 * @access Admin
 */
export const updateDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal || deal.deletedAt) {
      return next(new AppError('Deal not found', 404));
    }

    // Don't allow updating certain fields if deal is active
    if (deal.status === 'active' && deal.usageCount > 0) {
      const restrictedFields = ['type', 'discountValue', 'applicableTo'];
      const hasRestrictedUpdates = restrictedFields.some(
        field => req.body[field] !== undefined
      );
      
      if (hasRestrictedUpdates) {
        return next(
          new AppError(
            'Cannot modify discount configuration of an active deal with usage',
            400
          )
        );
      }
    }

    Object.assign(deal, req.body);
    deal.updatedBy = req.user?._id as unknown as mongoose.Types.ObjectId;
    await deal.save();

    res.status(200).json({
      success: true,
      message: 'Deal updated successfully',
      data: deal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete deal (soft delete)
 * @route DELETE /api/v1/deals/:id
 * @access Admin
 */
export const deleteDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal || deal.deletedAt) {
      return next(new AppError('Deal not found', 404));
    }

    deal.deletedAt = new Date();
    deal.isActive = false;
    deal.status = 'cancelled';
    await deal.save();

    res.status(200).json({
      success: true,
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DEAL STATUS MANAGEMENT ====================

/**
 * Activate deal
 * @route PATCH /api/v1/deals/:id/activate
 * @access Admin
 */
export const activateDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal || deal.deletedAt) {
      return next(new AppError('Deal not found', 404));
    }

    // Check if deal can be activated
    const now = new Date();
    if (deal.endDate < now) {
      return next(new AppError('Cannot activate an expired deal', 400));
    }

    await deal.activate();

    res.status(200).json({
      success: true,
      message: 'Deal activated successfully',
      data: deal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Pause deal
 * @route PATCH /api/v1/deals/:id/pause
 * @access Admin
 */
export const pauseDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal || deal.deletedAt) {
      return next(new AppError('Deal not found', 404));
    }

    if (deal.status !== 'active') {
      return next(new AppError('Only active deals can be paused', 400));
    }

    await deal.pause();

    res.status(200).json({
      success: true,
      message: 'Deal paused successfully',
      data: deal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel deal
 * @route PATCH /api/v1/deals/:id/cancel
 * @access Admin
 */
export const cancelDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal || deal.deletedAt) {
      return next(new AppError('Deal not found', 404));
    }

    if (deal.status === 'cancelled') {
      return next(new AppError('Deal is already cancelled', 400));
    }

    await deal.cancel();

    res.status(200).json({
      success: true,
      message: 'Deal cancelled successfully',
      data: deal
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DEAL ELIGIBILITY ====================

/**
 * Check if product is eligible for deal
 * @route GET /api/v1/deals/check-eligibility/:productId
 * @access Public
 */
export const checkEligibility = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const deal = await Deal.getActiveDeal(
      productId as unknown as mongoose.Types.ObjectId
    );

    if (!deal) {
      res.status(200).json({
        success: true,
        eligible: false,
        message: 'No active deals for this product'
      });
      return;
    }

    // Check if product is not in excluded list
    if (
      deal.excludedProducts &&
      deal.excludedProducts.some(id => id.toString() === productId)
    ) {
      res.status(200).json({
        success: true,
        eligible: false,
        message: 'Product is excluded from this deal'
      });
      return;
    }

    res.status(200).json({
      success: true,
      eligible: true,
      deal: {
        id: deal._id,
        name: deal.name,
        type: deal.type,
        discountValue: deal.discountValue,
        badge: deal.badge,
        endDate: deal.endDate
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate discount for cart
 * @route POST /api/v1/deals/calculate-discount
 * @access Private
 */
export const calculateDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dealId, orderValue, quantity } = req.body;

    if (!dealId || !orderValue) {
      return next(new AppError('Deal ID and order value are required', 400));
    }

    const deal = await Deal.findById(dealId);

    if (!deal || !deal.isValid()) {
      return next(new AppError('Deal is not valid', 400));
    }

    // Check if user can use this deal
    if (req.user) {
      const canUse = await deal.canBeUsedBy(
        req.user._id as unknown as mongoose.Types.ObjectId
      );
      if (!canUse) {
        return next(new AppError('You have reached the usage limit for this deal', 400));
      }
    }

    const discount = deal.calculateDiscount(orderValue, quantity);

    res.status(200).json({
      success: true,
      data: {
        dealId: deal._id,
        dealName: deal.name,
        orderValue,
        discount,
        finalAmount: orderValue - discount
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DEAL TRACKING ====================

/**
 * Track deal click
 * @route POST /api/v1/deals/:id/click
 * @access Public
 */
export const trackClick = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal || deal.deletedAt) {
      return next(new AppError('Deal not found', 404));
    }

    deal.clicks += 1;
    await deal.save();

    res.status(200).json({
      success: true,
      message: 'Click tracked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== FLASH SALES ====================

/**
 * Get active flash sales
 * @route GET /api/v1/deals/flash-sales
 * @access Public
 */
export const getFlashSales = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const flashSales = await Deal.getFlashSales();

    res.status(200).json({
      success: true,
      count: flashSales.length,
      data: flashSales
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get upcoming deals
 * @route GET /api/v1/deals/upcoming
 * @access Public
 */
export const getUpcomingDeals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    const deals = await Deal.getUpcomingDeals(parseInt(limit as string));

    res.status(200).json({
      success: true,
      count: deals.length,
      data: deals
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ANALYTICS ====================

/**
 * Get deal statistics
 * @route GET /api/v1/deals/:id/statistics
 * @access Admin
 */
export const getDealStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await Deal.getDealStatistics(
      req.params.id as unknown as mongoose.Types.ObjectId
    );

    if (!stats) {
      return next(new AppError('Deal not found', 404));
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top performing deals
 * @route GET /api/v1/deals/top-performing
 * @access Admin
 */
export const getTopDeals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    const deals = await Deal.getTopDeals(parseInt(limit as string));

    res.status(200).json({
      success: true,
      count: deals.length,
      data: deals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive deal analytics
 * @route GET /api/v1/deals/admin/analytics
 * @access Admin
 */
export const getDealAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalDeals,
      activeDeals,
      scheduledDeals,
      expiredDeals,
      flashSales,
      topDeals,
      revenueStats
    ] = await Promise.all([
      Deal.countDocuments({ deletedAt: { $exists: false } }),
      Deal.countDocuments({ status: 'active', isActive: true }),
      Deal.countDocuments({ status: 'scheduled' }),
      Deal.countDocuments({ status: 'expired' }),
      Deal.countDocuments({ isFlashSale: true, status: 'active' }),
      Deal.getTopDeals(5),
      Deal.aggregate([
        {
          $match: {
            deletedAt: { $exists: false }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$revenue' },
            totalConversions: { $sum: '$conversions' },
            totalClicks: { $sum: '$clicks' },
            totalViews: { $sum: '$views' }
          }
        }
      ])
    ]);

    const revenue = revenueStats[0] || {
      totalRevenue: 0,
      totalConversions: 0,
      totalClicks: 0,
      totalViews: 0
    };

    // Deal type distribution
    const typeDistribution = await Deal.aggregate([
      {
        $match: {
          deletedAt: { $exists: false }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          revenue: { $sum: '$revenue' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDeals,
          activeDeals,
          scheduledDeals,
          expiredDeals,
          flashSales
        },
        performance: {
          totalRevenue: revenue.totalRevenue,
          totalConversions: revenue.totalConversions,
          totalClicks: revenue.totalClicks,
          totalViews: revenue.totalViews,
          avgConversionRate:
            revenue.totalClicks > 0
              ? (revenue.totalConversions / revenue.totalClicks) * 100
              : 0
        },
        topDeals: topDeals.map(deal => ({
          id: deal._id,
          name: deal.name,
          type: deal.type,
          conversions: deal.conversions,
          revenue: deal.revenue,
          conversionRate: deal.clicks > 0 ? (deal.conversions / deal.clicks) * 100 : 0
        })),
        typeDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== BULK OPERATIONS ====================

/**
 * Bulk activate deals
 * @route POST /api/v1/deals/bulk-activate
 * @access Admin
 */
export const bulkActivateDeals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dealIds } = req.body;

    if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
      return next(new AppError('Deal IDs array is required', 400));
    }

    const now = new Date();
    const result = await Deal.updateMany(
      {
        _id: { $in: dealIds },
        deletedAt: { $exists: false },
        endDate: { $gte: now }
      },
      {
        status: 'active',
        isActive: true
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} deals activated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk pause deals
 * @route POST /api/v1/deals/bulk-pause
 * @access Admin
 */
export const bulkPauseDeals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dealIds } = req.body;

    if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
      return next(new AppError('Deal IDs array is required', 400));
    }

    const result = await Deal.updateMany(
      {
        _id: { $in: dealIds },
        deletedAt: { $exists: false },
        status: 'active'
      },
      {
        status: 'paused',
        isActive: false
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} deals paused successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk delete deals
 * @route DELETE /api/v1/deals/bulk-delete
 * @access Admin
 */
export const bulkDeleteDeals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dealIds } = req.body;

    if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
      return next(new AppError('Deal IDs array is required', 400));
    }

    const result = await Deal.updateMany(
      {
        _id: { $in: dealIds },
        deletedAt: { $exists: false }
      },
      {
        deletedAt: new Date(),
        status: 'cancelled',
        isActive: false
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} deals deleted successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

// ==================== SYSTEM OPERATIONS ====================

/**
 * Update deal statuses (scheduled -> active, active -> expired)
 * @route POST /api/v1/deals/system/update-statuses
 * @access Admin
 */
export const updateDealStatuses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await Deal.checkAndUpdateStatus();

    res.status(200).json({
      success: true,
      message: 'Deal statuses updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
