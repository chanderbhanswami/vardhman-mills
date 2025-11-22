import { Request, Response, NextFunction } from 'express';
import Logo from '../models/Logo.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { AuthRequest } from '../types/index.js';

// ==================== ANALYTICS & TRACKING ====================

/**
 * Get comprehensive analytics for a logo
 * @route GET /api/v1/logos/:id/analytics
 * @access Private/Admin
 */
export const getLogoAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('analytics');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    // Calculate derived metrics
    const analytics = logo.analytics || {
      impressions: 0,
      clicks: 0,
      hoverCount: 0,
      hoverDuration: 0
    };
    const ctr = analytics.impressions > 0 ? (analytics.clicks / analytics.impressions) * 100 : 0;
    const avgHoverDuration = analytics.hoverCount > 0 ? analytics.hoverDuration / analytics.hoverCount : 0;

    res.status(200).json({
      status: 'success',
      data: {
        analytics,
        derived: {
          ctr: parseFloat(ctr.toFixed(2)),
          avgHoverDuration: parseFloat(avgHoverDuration.toFixed(2))
        }
      }
    });
  }
);

/**
 * Track logo impression (view)
 * @route POST /api/v1/logos/:id/analytics/impression
 * @access Public
 */
export const trackLogoImpression = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { device, browser, country, city } = req.body;

    const updateData: any = {
      $inc: {
        'analytics.impressions': 1
      }
    };

    // Track device
    if (device && ['mobile', 'tablet', 'desktop'].includes(device)) {
      updateData.$inc[`analytics.deviceStats.${device}`] = 1;
    }

    // Track browser
    if (browser) {
      updateData.$inc[`analytics.browserStats.${browser}`] = 1;
    }

    // Track geography
    if (country) {
      updateData.$inc[`analytics.geoStats.countries.${country}`] = 1;
    }
    if (city) {
      updateData.$inc[`analytics.geoStats.cities.${city}`] = 1;
    }

    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, upsert: false }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { tracked: true }
    });
  }
);

/**
 * Track logo click
 * @route POST /api/v1/logos/:id/analytics/click
 * @access Public
 */
export const trackLogoClick = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { 'analytics.clicks': 1 }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { tracked: true }
    });
  }
);

/**
 * Track hover interaction
 * @route POST /api/v1/logos/:id/analytics/hover
 * @access Public
 */
export const trackLogoHover = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { duration } = req.body;

    if (duration === undefined || duration < 0) {
      return next(new AppError('Valid hover duration is required', 400));
    }

    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $inc: {
          'analytics.hoverCount': 1,
          'analytics.hoverDuration': duration
        }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { tracked: true }
    });
  }
);

/**
 * Track scroll interaction
 * @route POST /api/v1/logos/:id/analytics/scroll
 * @access Public
 */
export const trackScrollInteraction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { 'analytics.scrollInteractions': 1 }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { tracked: true }
    });
  }
);

/**
 * Update performance metrics (load time, render time, etc.)
 * @route POST /api/v1/logos/:id/analytics/performance
 * @access Public
 */
export const updatePerformanceMetrics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { loadTime, renderTime, lcp, cls, hasError } = req.body;

    const updateData: any = {};
    
    if (loadTime !== undefined) updateData['analytics.loadTime'] = loadTime;
    if (renderTime !== undefined) updateData['analytics.renderTime'] = renderTime;
    if (lcp !== undefined) updateData['analytics.lcp'] = lcp;
    if (cls !== undefined) updateData['analytics.cls'] = cls;
    
    if (hasError) {
      updateData.$inc = { 'analytics.errorRate': 1 };
    }

    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { updated: true }
    });
  }
);

/**
 * Update average view time
 * @route POST /api/v1/logos/:id/analytics/view-time
 * @access Public
 */
export const updateViewTime = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { duration } = req.body;

    if (duration === undefined || duration < 0) {
      return next(new AppError('Valid view duration is required', 400));
    }

    // Calculate new average view time
    const logo = await Logo.findById(req.params.id);
    
    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    const currentAvg = logo.analytics?.averageViewTime || 0;
    const impressions = logo.analytics?.impressions || 0;
    
    // Weighted average calculation
    const newAvg = impressions > 0 
      ? (currentAvg * impressions + duration) / (impressions + 1)
      : duration;

    if (!logo.analytics) {
      logo.analytics = {
        impressions: 0,
        clicks: 0,
        ctr: 0,
        loadTime: 0,
        renderTime: 0,
        lcp: 0,
        cls: 0,
        errorRate: 0,
        hoverCount: 0,
        hoverDuration: 0,
        averageViewTime: 0,
        scrollInteractions: 0,
        deviceStats: { mobile: 0, tablet: 0, desktop: 0 },
        browserStats: {},
        geoStats: { countries: {}, cities: {} }
      };
    }
    logo.analytics.averageViewTime = newAvg;
    
    await logo.save();

    res.status(200).json({
      status: 'success',
      data: { 
        averageViewTime: parseFloat(newAvg.toFixed(2))
      }
    });
  }
);

/**
 * Get device breakdown statistics
 * @route GET /api/v1/logos/:id/analytics/devices
 * @access Private/Admin
 */
export const getDeviceStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('analytics.deviceStats analytics.impressions');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    const deviceStats = logo.analytics?.deviceStats || { mobile: 0, tablet: 0, desktop: 0 };
    const totalImpressions = logo.analytics?.impressions || 0;

    const percentages = {
      mobile: totalImpressions > 0 ? (deviceStats.mobile / totalImpressions) * 100 : 0,
      tablet: totalImpressions > 0 ? (deviceStats.tablet / totalImpressions) * 100 : 0,
      desktop: totalImpressions > 0 ? (deviceStats.desktop / totalImpressions) * 100 : 0
    };

    res.status(200).json({
      status: 'success',
      data: {
        counts: deviceStats,
        percentages: {
          mobile: parseFloat(percentages.mobile.toFixed(2)),
          tablet: parseFloat(percentages.tablet.toFixed(2)),
          desktop: parseFloat(percentages.desktop.toFixed(2))
        },
        totalImpressions
      }
    });
  }
);

/**
 * Get browser breakdown statistics
 * @route GET /api/v1/logos/:id/analytics/browsers
 * @access Private/Admin
 */
export const getBrowserStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('analytics.browserStats analytics.impressions');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    const browserStats = logo.analytics?.browserStats || {};
    const totalImpressions = logo.analytics?.impressions || 0;

    // Calculate percentages
    const stats = Object.entries(browserStats).map(([browser, count]) => ({
      browser,
      count,
      percentage: totalImpressions > 0 ? parseFloat(((count as number / totalImpressions) * 100).toFixed(2)) : 0
    }));

    // Sort by count descending
    stats.sort((a, b) => b.count - a.count);

    res.status(200).json({
      status: 'success',
      data: {
        browsers: stats,
        totalImpressions
      }
    });
  }
);

/**
 * Get geographic statistics
 * @route GET /api/v1/logos/:id/analytics/geography
 * @access Private/Admin
 */
export const getGeographicStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('analytics.geoStats analytics.impressions');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    const geoStats = logo.analytics?.geoStats || { countries: {}, cities: {} };
    const totalImpressions = logo.analytics?.impressions || 0;

    // Process countries
    const countries = Object.entries(geoStats.countries || {}).map(([country, count]) => ({
      country,
      count,
      percentage: totalImpressions > 0 ? parseFloat(((count as number / totalImpressions) * 100).toFixed(2)) : 0
    }));
    countries.sort((a, b) => b.count - a.count);

    // Process cities
    const cities = Object.entries(geoStats.cities || {}).map(([city, count]) => ({
      city,
      count,
      percentage: totalImpressions > 0 ? parseFloat(((count as number / totalImpressions) * 100).toFixed(2)) : 0
    }));
    cities.sort((a, b) => b.count - a.count);

    res.status(200).json({
      status: 'success',
      data: {
        countries: countries.slice(0, 20), // Top 20
        cities: cities.slice(0, 20), // Top 20
        totalImpressions
      }
    });
  }
);

/**
 * Get performance metrics summary
 * @route GET /api/v1/logos/:id/analytics/performance-summary
 * @access Private/Admin
 */
export const getPerformanceSummary = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('analytics');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    const analytics = logo.analytics || {
      loadTime: 0,
      renderTime: 0,
      lcp: 0,
      cls: 0,
      errorRate: 0
    };

    // Performance scoring
    const scores = {
      loadTime: analytics.loadTime <= 500 ? 100 : Math.max(0, 100 - ((analytics.loadTime - 500) / 50)),
      renderTime: analytics.renderTime <= 200 ? 100 : Math.max(0, 100 - ((analytics.renderTime - 200) / 20)),
      lcp: analytics.lcp <= 2500 ? 100 : Math.max(0, 100 - ((analytics.lcp - 2500) / 250)),
      cls: analytics.cls <= 0.1 ? 100 : Math.max(0, 100 - ((analytics.cls - 0.1) * 100)),
      errorRate: Math.max(0, 100 - analytics.errorRate)
    };

    const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

    res.status(200).json({
      status: 'success',
      data: {
        metrics: {
          loadTime: analytics.loadTime,
          renderTime: analytics.renderTime,
          lcp: analytics.lcp,
          cls: analytics.cls,
          errorRate: analytics.errorRate
        },
        scores: {
          loadTime: parseFloat(scores.loadTime.toFixed(2)),
          renderTime: parseFloat(scores.renderTime.toFixed(2)),
          lcp: parseFloat(scores.lcp.toFixed(2)),
          cls: parseFloat(scores.cls.toFixed(2)),
          errorRate: parseFloat(scores.errorRate.toFixed(2)),
          overall: parseFloat(overallScore.toFixed(2))
        },
        rating: overallScore >= 90 ? 'excellent' : overallScore >= 75 ? 'good' : overallScore >= 50 ? 'fair' : 'poor'
      }
    });
  }
);

/**
 * Reset analytics (for testing purposes)
 * @route POST /api/v1/logos/:id/analytics/reset
 * @access Private/Admin
 */
export const resetAnalytics = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const logo = await Logo.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          analytics: {
            impressions: 0,
            clicks: 0,
            ctr: 0,
            loadTime: 0,
            renderTime: 0,
            lcp: 0,
            cls: 0,
            errorRate: 0,
            hoverCount: 0,
            hoverDuration: 0,
            averageViewTime: 0,
            scrollInteractions: 0,
            deviceStats: { mobile: 0, tablet: 0, desktop: 0 },
            browserStats: {},
            geoStats: { countries: {}, cities: {} }
          }
        }
      },
      { new: true }
    );

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { analytics: logo.analytics }
    });
  }
);

/**
 * Export analytics data
 * @route GET /api/v1/logos/:id/analytics/export
 * @access Private/Admin
 */
export const exportAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const logo = await Logo.findById(req.params.id).select('name analytics abTest');

    if (!logo) {
      return next(new AppError('Logo not found', 404));
    }

    const exportData = {
      logoId: logo._id,
      logoName: logo.name,
      exportDate: new Date(),
      analytics: logo.analytics,
      abTest: logo.abTest || null
    };

    res.status(200).json({
      status: 'success',
      data: exportData
    });
  }
);
