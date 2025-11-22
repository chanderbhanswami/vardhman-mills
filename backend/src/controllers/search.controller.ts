import { Request, Response, NextFunction } from 'express';
import SearchQuery from '../models/SearchQuery.model.js';
import Product from '../models/Product.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// ==================== SEARCH OPERATIONS ====================

/**
 * Perform product search with tracking
 * @route POST /api/v1/search
 * @access Public
 */
export const searchProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query, filters = {}, source = 'header', device = 'desktop' } = req.body;

    if (!query || query.trim().length === 0) {
      return next(new AppError('Search query is required', 400));
    }

    // Build search query
    const searchQuery: any = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    // Apply filters
    if (filters.category) {
      searchQuery.category = filters.category;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      searchQuery.price = {};
      if (filters.minPrice !== undefined) searchQuery.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) searchQuery.price.$lte = filters.maxPrice;
    }

    if (filters.brands && filters.brands.length > 0) {
      searchQuery.brand = { $in: filters.brands };
    }

    if (filters.tags && filters.tags.length > 0) {
      searchQuery.tags = { $in: filters.tags };
    }

    if (filters.rating !== undefined) {
      searchQuery.averageRating = { $gte: filters.rating };
    }

    if (filters.inStock !== undefined) {
      searchQuery.stock = filters.inStock ? { $gt: 0 } : { $eq: 0 };
    }

    // Execute search
    const products = await Product.find(searchQuery)
      .select('name description price images averageRating stock category brand')
      .sort({ averageRating: -1, createdAt: -1 })
      .limit(50)
      .lean();

    // Track search
    const searchRecord = await SearchQuery.create({
      query,
      normalizedQuery: query.toLowerCase().trim(),
      filters,
      resultsCount: products.length,
      resultsFound: products.length > 0,
      topResults: products.slice(0, 5).map((p: any) => p._id),
      source,
      device,
      user: req.user?._id,
      sessionId: (req as any).sessionID || req.headers['x-session-id'] as string,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer']
    });

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products,
        searchId: searchRecord._id
      }
    });
  }
);

/**
 * Get search suggestions (autocomplete)
 * @route GET /api/v1/search/suggestions
 * @access Public
 */
export const getSearchSuggestions = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { q, limit = 10 } = req.query;

    if (!q || (q as string).trim().length < 2) {
      res.status(200).json({
        status: 'success',
        results: 0,
        data: { suggestions: [] }
      });
      return;
    }

    const suggestions = await SearchQuery.getSearchSuggestions(
      q as string,
      parseInt(limit as string)
    );

    res.status(200).json({
      status: 'success',
      results: suggestions.length,
      data: { suggestions }
    });
  }
);

/**
 * Get popular searches
 * @route GET /api/v1/search/popular
 * @access Public
 */
export const getPopularSearches = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const days = parseInt(req.query.days as string) || 30;

    const searches = await SearchQuery.getPopularSearches(limit, days);

    res.status(200).json({
      status: 'success',
      results: searches.length,
      data: { searches }
    });
  }
);

/**
 * Get trending searches
 * @route GET /api/v1/search/trending
 * @access Public
 */
export const getTrendingSearches = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const days = parseInt(req.query.days as string) || 7;

    const searches = await SearchQuery.getTrendingSearches(days);

    res.status(200).json({
      status: 'success',
      results: searches.length,
      data: { searches }
    });
  }
);

/**
 * Get related searches
 * @route GET /api/v1/search/related/:query
 * @access Public
 */
export const getRelatedSearches = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const searches = await SearchQuery.getRelatedSearches(query, limit);

    res.status(200).json({
      status: 'success',
      results: searches.length,
      data: { searches }
    });
  }
);

// ==================== INTERACTION TRACKING ====================

/**
 * Track search result click
 * @route POST /api/v1/search/:searchId/click
 * @access Public
 */
export const trackSearchClick = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { searchId } = req.params;
    const { productId, timeToClick } = req.body;

    if (!productId) {
      return next(new AppError('Product ID is required', 400));
    }

    const searchRecord = await SearchQuery.findById(searchId);

    if (!searchRecord) {
      return next(new AppError('Search record not found', 404));
    }

    await searchRecord.recordClick(productId, timeToClick || 0);

    res.status(200).json({
      status: 'success',
      data: { message: 'Click tracked successfully' }
    });
  }
);

/**
 * Track final product selection
 * @route POST /api/v1/search/:searchId/selection
 * @access Public
 */
export const trackSearchSelection = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { searchId } = req.params;
    const { productId } = req.body;

    if (!productId) {
      return next(new AppError('Product ID is required', 400));
    }

    const searchRecord = await SearchQuery.findById(searchId);

    if (!searchRecord) {
      return next(new AppError('Search record not found', 404));
    }

    await searchRecord.recordSelection(productId);

    res.status(200).json({
      status: 'success',
      data: { message: 'Selection tracked successfully' }
    });
  }
);

// ==================== ADMIN ANALYTICS ====================

/**
 * Get search analytics
 * @route GET /api/v1/search/analytics/overview
 * @access Private/Admin
 */
export const getSearchAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const stats = await SearchQuery.getSearchStats(start, end);

    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  }
);

/**
 * Get zero result searches
 * @route GET /api/v1/search/analytics/zero-results
 * @access Private/Admin
 */
export const getZeroResultSearches = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 20;

    const searches = await SearchQuery.getZeroResultSearches(limit);

    res.status(200).json({
      status: 'success',
      results: searches.length,
      data: { searches }
    });
  }
);

/**
 * Get all search queries (Admin)
 * @route GET /api/v1/search/queries
 * @access Private/Admin
 */
export const getAllSearchQueries = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    // Filters
    if (req.query.resultsFound !== undefined) {
      query.resultsFound = req.query.resultsFound === 'true';
    }

    if (req.query.clicked !== undefined) {
      query.clicked = req.query.clicked === 'true';
    }

    if (req.query.source) {
      query.source = req.query.source;
    }

    if (req.query.device) {
      query.device = req.query.device;
    }

    // Date range
    if (req.query.startDate || req.query.endDate) {
      query.searchedAt = {};
      if (req.query.startDate) {
        query.searchedAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        query.searchedAt.$lte = new Date(req.query.endDate as string);
      }
    }

    // Search
    if (req.query.search) {
      query.normalizedQuery = { $regex: req.query.search, $options: 'i' };
    }

    const [searches, total] = await Promise.all([
      SearchQuery.find(query)
        .populate('user', 'name email')
        .populate('topResults', 'name images price')
        .sort({ searchedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SearchQuery.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      results: searches.length,
      data: {
        searches,
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
 * Get single search query
 * @route GET /api/v1/search/queries/:id
 * @access Private/Admin
 */
export const getSearchQuery = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const search = await SearchQuery.findById(req.params.id)
      .populate('user', 'name email')
      .populate('topResults', 'name images price')
      .populate('clickedResults', 'name images price')
      .populate('selectedResult', 'name images price');

    if (!search) {
      return next(new AppError('Search query not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { search }
    });
  }
);

/**
 * Delete search query
 * @route DELETE /api/v1/search/queries/:id
 * @access Private/Admin
 */
export const deleteSearchQuery = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const search = await SearchQuery.findByIdAndDelete(req.params.id);

    if (!search) {
      return next(new AppError('Search query not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

// ==================== SYSTEM OPERATIONS ====================

/**
 * Cleanup old search queries
 * @route POST /api/v1/search/cleanup
 * @access Private/Admin
 */
export const cleanupOldSearches = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const days = parseInt(req.query.days as string) || 90;

    await SearchQuery.cleanupOldSearches(days);

    res.status(200).json({
      status: 'success',
      data: {
        message: `Searches older than ${days} days cleaned up successfully`
      }
    });
  }
);

export default {
  // Search Operations
  searchProducts,
  getSearchSuggestions,
  getPopularSearches,
  getTrendingSearches,
  getRelatedSearches,

  // Interaction Tracking
  trackSearchClick,
  trackSearchSelection,

  // Admin Analytics
  getSearchAnalytics,
  getZeroResultSearches,
  getAllSearchQueries,
  getSearchQuery,
  deleteSearchQuery,

  // System Operations
  cleanupOldSearches
};
