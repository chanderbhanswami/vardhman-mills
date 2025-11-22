import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Sale from '../models/Sale.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// ==================== CRUD OPERATIONS ====================

/**
 * Get all sales (Admin)
 * @route GET /api/v1/sales
 * @access Private/Admin
 */
export const getAllSales = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    // Filters
    if (req.query.type) {
      query.type = req.query.type;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    if (req.query.isPublished !== undefined) {
      query.isPublished = req.query.isPublished === 'true';
    }

    if (req.query.isFeatured !== undefined) {
      query.isFeatured = req.query.isFeatured === 'true';
    }

    // Search
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate('createdBy', 'name email')
        .populate('targeting.products', 'name price')
        .populate('targeting.categories', 'name')
        .sort({ 'display.priority': -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Sale.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      results: sales.length,
      data: {
        sales,
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
 * Get single sale
 * @route GET /api/v1/sales/:id
 * @access Private/Admin
 */
export const getSale = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sale = await Sale.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('targeting.products', 'name price images')
      .populate('targeting.categories', 'name');

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { sale }
    });
  }
);

/**
 * Create sale
 * @route POST /api/v1/sales
 * @access Private/Admin
 */
export const createSale = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    req.body.createdBy = req.user._id;

    // Validate dates
    if (new Date(req.body.endDate) <= new Date(req.body.startDate)) {
      return next(new AppError('End date must be after start date', 400));
    }

    const sale = await Sale.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { sale }
    });
  }
);

/**
 * Update sale
 * @route PUT /api/v1/sales/:id
 * @access Private/Admin
 */
export const updateSale = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    delete req.body.createdBy;
    delete req.body.analytics;

    // Validate dates if provided
    if (req.body.startDate && req.body.endDate) {
      if (new Date(req.body.endDate) <= new Date(req.body.startDate)) {
        return next(new AppError('End date must be after start date', 400));
      }
    }

    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { sale }
    });
  }
);

/**
 * Delete sale
 * @route DELETE /api/v1/sales/:id
 * @access Private/Admin
 */
export const deleteSale = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sale = await Sale.findByIdAndDelete(req.params.id);

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

// ==================== STATUS MANAGEMENT ====================

/**
 * Activate sale
 * @route POST /api/v1/sales/:id/activate
 * @access Private/Admin
 */
export const activateSale = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    await sale.activate();

    res.status(200).json({
      status: 'success',
      data: { sale }
    });
  }
);

/**
 * Deactivate sale
 * @route POST /api/v1/sales/:id/deactivate
 * @access Private/Admin
 */
export const deactivateSale = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    await sale.deactivate();

    res.status(200).json({
      status: 'success',
      data: { sale }
    });
  }
);

/**
 * Publish sale
 * @route POST /api/v1/sales/:id/publish
 * @access Private/Admin
 */
export const publishSale = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    await sale.publish();

    res.status(200).json({
      status: 'success',
      data: { sale }
    });
  }
);

/**
 * Unpublish sale
 * @route POST /api/v1/sales/:id/unpublish
 * @access Private/Admin
 */
export const unpublishSale = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    await sale.unpublish();

    res.status(200).json({
      status: 'success',
      data: { sale }
    });
  }
);

/**
 * Toggle featured status
 * @route POST /api/v1/sales/:id/toggle-featured
 * @access Private/Admin
 */
export const toggleFeatured = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    sale.isFeatured = !sale.isFeatured;
    await sale.save();

    res.status(200).json({
      status: 'success',
      data: { sale }
    });
  }
);

// ==================== PUBLIC ACCESS ====================

/**
 * Get active sales (Public)
 * @route GET /api/v1/sales/active
 * @access Public
 */
export const getActiveSales = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const options: any = {};

    if (req.query.type) {
      options.type = req.query.type;
    }

    if (req.query.category) {
      options.category = req.query.category;
    }

    const sales = await Sale.getActiveSales(options);

    res.status(200).json({
      status: 'success',
      results: sales.length,
      data: { sales }
    });
  }
);

/**
 * Get featured sales (Public)
 * @route GET /api/v1/sales/featured
 * @access Public
 */
export const getFeaturedSales = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sales = await Sale.getFeaturedSales();

    res.status(200).json({
      status: 'success',
      results: sales.length,
      data: { sales }
    });
  }
);

/**
 * Get upcoming sales (Public)
 * @route GET /api/v1/sales/upcoming
 * @access Public
 */
export const getUpcomingSales = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sales = await Sale.getUpcomingSales();

    res.status(200).json({
      status: 'success',
      results: sales.length,
      data: { sales }
    });
  }
);

/**
 * Get sales by type (Public)
 * @route GET /api/v1/sales/type/:type
 * @access Public
 */
export const getSalesByType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sales = await Sale.getSalesByType(req.params.type);

    res.status(200).json({
      status: 'success',
      results: sales.length,
      data: { sales }
    });
  }
);

/**
 * Get sale by slug (Public)
 * @route GET /api/v1/sales/slug/:slug
 * @access Public
 */
export const getSaleBySlug = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sale = await Sale.findOne({ slug: req.params.slug, isPublished: true })
      .populate('targeting.products', 'name price images')
      .populate('targeting.categories', 'name');

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    // Increment views
    await sale.incrementViews();

    res.status(200).json({
      status: 'success',
      data: { sale }
    });
  }
);

/**
 * Get sales for product (Public)
 * @route GET /api/v1/sales/product/:productId
 * @access Public
 */
export const getSalesForProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sales = await Sale.getSalesForProduct(req.params.productId as any);

    res.status(200).json({
      status: 'success',
      results: sales.length,
      data: { sales }
    });
  }
);

/**
 * Check if sale applicable (Public)
 * @route POST /api/v1/sales/:id/check
 * @access Public
 */
export const checkSaleApplicable = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    const userId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : undefined;
    const result = await sale.canBeApplied(userId);

    res.status(200).json({
      status: 'success',
      data: result
    });
  }
);

/**
 * Calculate discount (Public)
 * @route POST /api/v1/sales/:id/calculate
 * @access Public
 */
export const calculateDiscount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    const { originalPrice } = req.body;

    if (!originalPrice || originalPrice <= 0) {
      return next(new AppError('Valid original price is required', 400));
    }

    const discount = sale.calculateDiscount(originalPrice);
    const finalPrice = originalPrice - discount;

    res.status(200).json({
      status: 'success',
      data: {
        originalPrice,
        discount,
        finalPrice,
        discountPercentage: ((discount / originalPrice) * 100).toFixed(2)
      }
    });
  }
);

// ==================== ANALYTICS ====================

/**
 * Get sale statistics (Admin)
 * @route GET /api/v1/sales/stats/overview
 * @access Private/Admin
 */
export const getSaleStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const [
      total,
      active,
      published,
      featured,
      byType,
      topPerforming
    ] = await Promise.all([
      Sale.countDocuments(),
      
      Sale.countDocuments({
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }),
      
      Sale.countDocuments({ isPublished: true }),
      
      Sale.countDocuments({ isFeatured: true }),
      
      Sale.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            totalRevenue: { $sum: '$analytics.revenue' },
            totalViews: { $sum: '$analytics.views' },
            totalApplied: { $sum: '$analytics.appliedCount' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]),
      
      Sale.find({ 'analytics.appliedCount': { $gt: 0 } })
        .select('name type analytics display.priority')
        .sort({ 'analytics.revenue': -1 })
        .limit(10)
        .lean()
    ]);

    const allSales: any = await Sale.find().select('analytics').lean();
    const totalRevenue = allSales.reduce((sum: number, s: any) => sum + s.analytics.revenue, 0);
    const totalViews = allSales.reduce((sum: number, s: any) => sum + s.analytics.views, 0);
    const totalApplied = allSales.reduce((sum: number, s: any) => sum + s.analytics.appliedCount, 0);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          total,
          active,
          published,
          featured,
          inactive: total - active
        },
        engagement: {
          totalViews,
          totalApplied,
          totalRevenue,
          averageConversionRate: totalViews > 0 ? ((totalApplied / totalViews) * 100).toFixed(2) : 0
        },
        byType,
        topPerforming
      }
    });
  }
);

/**
 * Get sale analytics (Admin)
 * @route GET /api/v1/sales/:id/analytics
 * @access Private/Admin
 */
export const getSaleAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    const analytics = {
      views: sale.analytics.views,
      appliedCount: sale.analytics.appliedCount,
      revenue: sale.analytics.revenue,
      itemsSold: sale.analytics.itemsSold,
      averageOrderValue: sale.analytics.averageOrderValue,
      conversionRate: (sale as any).conversionRate,
      usagePercentage: (sale as any).usagePercentage,
      daysRemaining: (sale as any).daysRemaining,
      status: (sale as any).status
    };

    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  }
);

// ==================== SYSTEM OPERATIONS ====================

/**
 * Cleanup expired sales (Admin)
 * @route POST /api/v1/sales/cleanup
 * @access Private/Admin
 */
export const cleanupExpiredSales = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await Sale.deactivateExpired();

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Expired sales deactivated successfully'
      }
    });
  }
);

/**
 * Activate scheduled sales (Admin)
 * @route POST /api/v1/sales/activate-scheduled
 * @access Private/Admin
 */
export const activateScheduledSales = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await Sale.activateScheduled();

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Scheduled sales activated successfully'
      }
    });
  }
);

/**
 * Duplicate sale (Admin)
 * @route POST /api/v1/sales/:id/duplicate
 * @access Private/Admin
 */
export const duplicateSale = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const original = await Sale.findById(req.params.id);

    if (!original) {
      return next(new AppError('Sale not found', 404));
    }

    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const duplicate = new Sale({
      ...original.toObject(),
      _id: undefined,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${Date.now()}`,
      isActive: false,
      isPublished: false,
      isFeatured: false,
      analytics: {
        views: 0,
        appliedCount: 0,
        revenue: 0,
        itemsSold: 0,
        averageOrderValue: 0
      },
      limits: {
        maxUses: original.limits.maxUses,
        maxUsesPerUser: original.limits.maxUsesPerUser,
        currentUses: 0
      },
      createdBy: req.user._id,
      createdAt: undefined,
      updatedAt: undefined
    });

    await duplicate.save();

    res.status(201).json({
      status: 'success',
      data: { sale: duplicate }
    });
  }
);

export default {
  // CRUD
  getAllSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,

  // Status Management
  activateSale,
  deactivateSale,
  publishSale,
  unpublishSale,
  toggleFeatured,

  // Public Access
  getActiveSales,
  getFeaturedSales,
  getUpcomingSales,
  getSalesByType,
  getSaleBySlug,
  getSalesForProduct,
  checkSaleApplicable,
  calculateDiscount,

  // Analytics
  getSaleStats,
  getSaleAnalytics,

  // System Operations
  cleanupExpiredSales,
  activateScheduledSales,
  duplicateSale
};
