import { Request, Response, NextFunction } from 'express';
import Logo from '../models/Logo.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { AuthRequest } from '../types/index.js';

// ==================== PERFORMANCE CONFIGURATION ====================

/**
 * Get performance configuration
 * @route GET /api/v1/logos/:id/performance
 * @access Public
 */
export const getPerformanceConfig = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('performance');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { performance: logo.performance || null }
    });
  }
);

/**
 * Update performance configuration
 * @route PATCH /api/v1/logos/:id/performance
 * @access Private/Admin
 */
export const updatePerformanceConfig = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { lazyLoading, preconnect, prefetch, priority, optimization, caching } = req.body;

    const updateData: any = {};
    if (lazyLoading !== undefined) updateData['performance.lazyLoading'] = lazyLoading;
    if (preconnect) updateData['performance.preconnect'] = preconnect;
    if (prefetch !== undefined) updateData['performance.prefetch'] = prefetch;
    if (priority) updateData['performance.priority'] = priority;
    if (optimization) updateData['performance.optimization'] = optimization;
    if (caching) updateData['performance.caching'] = caching;

    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { logo }
    });
  }
);

/**
 * Update image optimization settings
 * @route PATCH /api/v1/logos/:id/performance/optimization
 * @access Private/Admin
 */
export const updateOptimizationSettings = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { 'performance.optimization': req.body }
      },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { optimization: logo.performance?.optimization }
    });
  }
);

/**
 * Update caching strategy
 * @route PATCH /api/v1/logos/:id/performance/caching
 * @access Private/Admin
 */
export const updateCachingStrategy = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { 'performance.caching': req.body }
      },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { caching: logo.performance?.caching }
    });
  }
);

/**
 * Enable lazy loading
 * @route POST /api/v1/logos/:id/performance/lazy-loading/enable
 * @access Private/Admin
 */
export const enableLazyLoading = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { 'performance.lazyLoading': true }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { lazyLoading: logo.performance?.lazyLoading }
    });
  }
);

/**
 * Disable lazy loading
 * @route POST /api/v1/logos/:id/performance/lazy-loading/disable
 * @access Private/Admin
 */
export const disableLazyLoading = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { 'performance.lazyLoading': false }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { lazyLoading: logo.performance?.lazyLoading }
    });
  }
);

/**
 * Set loading priority
 * @route PATCH /api/v1/logos/:id/performance/priority
 * @access Private/Admin
 */
export const setLoadingPriority = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { priority } = req.body;

    if (!['high', 'normal', 'low'].includes(priority)) {
      return next(new AppError('Invalid priority. Must be high, normal, or low', 400));
    }

    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { 'performance.priority': priority }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { priority: logo.performance?.priority }
    });
  }
);

/**
 * Add preconnect origins
 * @route POST /api/v1/logos/:id/performance/preconnect
 * @access Private/Admin
 */
export const addPreconnectOrigins = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { origins } = req.body;

    if (!Array.isArray(origins) || origins.length === 0) {
      return next(new AppError('Origins must be a non-empty array', 400));
    }

    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { 'performance.preconnect': { $each: origins } }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { preconnect: logo.performance?.preconnect }
    });
  }
);

/**
 * Remove preconnect origin
 * @route DELETE /api/v1/logos/:id/performance/preconnect/:origin
 * @access Private/Admin
 */
export const removePreconnectOrigin = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { origin } = req.params;

    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { 'performance.preconnect': origin }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { preconnect: logo.performance?.preconnect }
    });
  }
);

/**
 * Reset performance settings to defaults
 * @route DELETE /api/v1/logos/:id/performance
 * @access Private/Admin
 */
export const resetPerformanceSettings = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $unset: { performance: '' }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { logo }
    });
  }
);

/**
 * Get performance recommendations
 * @route GET /api/v1/logos/:id/performance/recommendations
 * @access Private/Admin
 */
export const getPerformanceRecommendations = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id);

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    const recommendations: string[] = [];
    const performance = logo.performance;

    // Check lazy loading
    if (!performance?.lazyLoading) {
      recommendations.push('Enable lazy loading to improve initial page load time');
    }

    // Check image optimization
    if (!performance?.optimization?.webp) {
      recommendations.push('Enable WebP format for better compression and quality');
    }

    if (!performance?.optimization?.avif) {
      recommendations.push('Enable AVIF format for the best compression ratios');
    }

    if (!performance?.optimization?.progressive) {
      recommendations.push('Enable progressive loading for better perceived performance');
    }

    // Check caching
    if (!performance?.caching?.enabled) {
      recommendations.push('Enable caching to reduce server load and improve load times');
    } else if (performance.caching.ttl < 86400) {
      recommendations.push('Consider increasing cache TTL to at least 24 hours');
    }

    // Check priority
    if (performance?.priority === 'low') {
      recommendations.push('Consider upgrading priority to "normal" or "high" for above-the-fold logos');
    }

    // Check preconnect
    if (!performance?.preconnect || performance.preconnect.length === 0) {
      recommendations.push('Add preconnect hints for CDN domains to reduce DNS lookup time');
    }

    res.status(200).json({
      status: 'success',
      data: {
        recommendations,
        currentSettings: performance,
        score: Math.max(0, 100 - (recommendations.length * 10))
      }
    });
  }
);
