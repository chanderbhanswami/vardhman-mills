import { Request, Response, NextFunction } from 'express';
import AnalyticsEvent from '../models/AnalyticsEvent.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

/**
 * Track a generic event
 */
export const trackEvent = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { type, name, properties, url, referrer } = req.body;

    // Extract session ID from headers or cookies
    const sessionId = req.headers['x-session-id'] as string || req.cookies?.sessionId || `anon-${Date.now()}`;

    // Extract device info from user agent
    const userAgent = req.headers['user-agent'] as string || '';
    const device = {
      type: /mobile/i.test(userAgent) ? 'mobile' as const : /tablet/i.test(userAgent) ? 'tablet' as const : 'desktop' as const,
      userAgent
    };

    // Extract location from IP (in production, use geolocation service)
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || '';

    const event = await AnalyticsEvent.trackEvent({
      type,
      name,
      sessionId,
      user: (req as any).user?._id,
      userId: (req as any).user?._id?.toString() || sessionId,
      device,
      location: { ipAddress },
      properties,
      timestamp: new Date()
    });

    res.status(201).json({
      status: 'success',
      data: {
        message: 'Event tracked successfully',
        eventId: event._id
      }
    });
  }
);

/**
 * Track page view
 */
export const trackPageView = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { url, title, referrer, duration, properties } = req.body;

    const sessionId = req.headers['x-session-id'] as string || req.cookies?.sessionId || `anon-${Date.now()}`;
    const userAgent = req.headers['user-agent'] as string || '';
    const device = {
      type: /mobile/i.test(userAgent) ? 'mobile' as const : /tablet/i.test(userAgent) ? 'tablet' as const : 'desktop' as const,
      userAgent
    };
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || '';

    const event = await AnalyticsEvent.trackEvent({
      type: 'page_view',
      name: 'Page View',
      sessionId,
      user: (req as any).user?._id,
      userId: (req as any).user?._id?.toString() || sessionId,
      page: {
        url,
        title,
        referrer,
        duration,
        path: new URL(url).pathname
      },
      device,
      location: { ipAddress },
      properties,
      timestamp: new Date()
    });

    res.status(201).json({
      status: 'success',
      data: {
        message: 'Page view tracked',
        eventId: event._id
      }
    });
  }
);

/**
 * Track product view
 */
export const trackProductView = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { productId, productName, categoryId, price, brand, properties } = req.body;

    const sessionId = req.headers['x-session-id'] as string || req.cookies?.sessionId || `anon-${Date.now()}`;
    const userAgent = req.headers['user-agent'] as string || '';
    const device = {
      type: /mobile/i.test(userAgent) ? 'mobile' as const : /tablet/i.test(userAgent) ? 'tablet' as const : 'desktop' as const,
      userAgent
    };
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || '';

    const event = await AnalyticsEvent.trackEvent({
      type: 'product_view',
      name: 'Product View',
      sessionId,
      user: (req as any).user?._id,
      userId: (req as any).user?._id?.toString() || sessionId,
      product: {
        productId,
        productName,
        categoryId,
        price,
        brand
      },
      device,
      location: { ipAddress },
      properties,
      timestamp: new Date()
    });

    res.status(201).json({
      status: 'success',
      data: {
        message: 'Product view tracked',
        eventId: event._id
      }
    });
  }
);

/**
 * Track add to cart
 */
export const trackAddToCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { productId, productName, quantity, price, categoryId, variant, properties } = req.body;

    const sessionId = req.headers['x-session-id'] as string || req.cookies?.sessionId || `anon-${Date.now()}`;
    const userAgent = req.headers['user-agent'] as string || '';
    const device = {
      type: /mobile/i.test(userAgent) ? 'mobile' as const : /tablet/i.test(userAgent) ? 'tablet' as const : 'desktop' as const,
      userAgent
    };
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || '';

    const event = await AnalyticsEvent.trackEvent({
      type: 'add_to_cart',
      name: 'Add to Cart',
      sessionId,
      user: (req as any).user?._id,
      userId: (req as any).user?._id?.toString() || sessionId,
      product: {
        productId,
        productName,
        quantity,
        price,
        categoryId,
        variant
      },
      device,
      location: { ipAddress },
      properties,
      timestamp: new Date()
    });

    res.status(201).json({
      status: 'success',
      data: {
        message: 'Add to cart tracked',
        eventId: event._id
      }
    });
  }
);

/**
 * Track purchase
 */
export const trackPurchase = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { orderId, totalAmount, currency, items, couponCode, paymentMethod, properties } = req.body;

    const sessionId = req.headers['x-session-id'] as string || req.cookies?.sessionId || `anon-${Date.now()}`;
    const userAgent = req.headers['user-agent'] as string || '';
    const device = {
      type: /mobile/i.test(userAgent) ? 'mobile' as const : /tablet/i.test(userAgent) ? 'tablet' as const : 'desktop' as const,
      userAgent
    };
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || '';

    const event = await AnalyticsEvent.trackEvent({
      type: 'purchase',
      name: 'Purchase',
      sessionId,
      user: (req as any).user?._id,
      userId: (req as any).user?._id?.toString() || sessionId,
      order: {
        orderId,
        totalAmount,
        currency: currency || 'USD',
        items,
        couponCode,
        paymentMethod
      },
      device,
      location: { ipAddress },
      properties,
      timestamp: new Date()
    });

    res.status(201).json({
      status: 'success',
      data: {
        message: 'Purchase tracked',
        eventId: event._id
      }
    });
  }
);

/**
 * Track search
 */
export const trackSearch = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { query, resultsCount, filters, sortBy, page, properties } = req.body;

    const sessionId = req.headers['x-session-id'] as string || req.cookies?.sessionId || `anon-${Date.now()}`;
    const userAgent = req.headers['user-agent'] as string || '';
    const device = {
      type: /mobile/i.test(userAgent) ? 'mobile' as const : /tablet/i.test(userAgent) ? 'tablet' as const : 'desktop' as const,
      userAgent
    };
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || '';

    const event = await AnalyticsEvent.trackEvent({
      type: 'search',
      name: 'Search',
      sessionId,
      user: (req as any).user?._id,
      userId: (req as any).user?._id?.toString() || sessionId,
      search: {
        query,
        resultsCount,
        filters,
        sortBy,
        page
      },
      device,
      location: { ipAddress },
      properties,
      timestamp: new Date()
    });

    res.status(201).json({
      status: 'success',
      data: {
        message: 'Search tracked',
        eventId: event._id
      }
    });
  }
);

/**
 * Track custom event
 */
export const trackCustomEvent = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, category, action, label, value, properties } = req.body;

    const sessionId = req.headers['x-session-id'] as string || req.cookies?.sessionId || `anon-${Date.now()}`;
    const userAgent = req.headers['user-agent'] as string || '';
    const device = {
      type: /mobile/i.test(userAgent) ? 'mobile' as const : /tablet/i.test(userAgent) ? 'tablet' as const : 'desktop' as const,
      userAgent
    };
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || '';

    const event = await AnalyticsEvent.trackEvent({
      type: 'custom',
      name,
      category,
      action,
      label,
      value,
      sessionId,
      user: (req as any).user?._id,
      userId: (req as any).user?._id?.toString() || sessionId,
      device,
      location: { ipAddress },
      properties,
      timestamp: new Date()
    });

    res.status(201).json({
      status: 'success',
      data: {
        message: 'Custom event tracked',
        eventId: event._id
      }
    });
  }
);

/**
 * Batch track events
 */
export const batchTrackEvents = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return next(new AppError('Events array is required', 400));
    }

    const sessionId = req.headers['x-session-id'] as string || req.cookies?.sessionId || `anon-${Date.now()}`;
    const userAgent = req.headers['user-agent'] as string || '';
    const device = {
      type: /mobile/i.test(userAgent) ? 'mobile' as const : /tablet/i.test(userAgent) ? 'tablet' as const : 'desktop' as const,
      userAgent
    };
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || '';

    const bulkEvents = events.map((event: any) => ({
      ...event,
      sessionId,
      user: (req as any).user?._id,
      userId: (req as any).user?._id?.toString() || sessionId,
      device,
      location: { ipAddress },
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date()
    }));

    await AnalyticsEvent.insertMany(bulkEvents);

    res.status(201).json({
      status: 'success',
      data: {
        message: 'Events tracked successfully',
        processedCount: bulkEvents.length
      }
    });
  }
);

/**
 * Get user behavior
 */
export const getUserBehavior = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.query;
    const { startDate, endDate } = req.query;

    const dateRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    } : undefined;

    const targetUserId = userId || (req as any).user?._id?.toString();

    if (!targetUserId) {
      return next(new AppError('User ID is required', 400));
    }

    const behavior = await AnalyticsEvent.getUserBehavior(targetUserId, dateRange);

    res.status(200).json({
      status: 'success',
      data: behavior
    });
  }
);

/**
 * Get user journey
 */
export const getUserJourney = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId, sessionId, startDate, endDate } = req.query;

    const dateRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    } : undefined;

    const journey = await AnalyticsEvent.getUserJourney({
      userId: userId as string,
      sessionId: sessionId as string,
      dateRange
    });

    res.status(200).json({
      status: 'success',
      results: journey.length,
      data: journey
    });
  }
);

/**
 * Get session analytics
 */
export const getSessionAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { startDate, endDate } = req.query;

    const dateRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    } : undefined;

    const analytics = await AnalyticsEvent.getSessionAnalytics(dateRange);

    res.status(200).json({
      status: 'success',
      data: analytics
    });
  }
);

/**
 * Get product performance
 */
export const getProductPerformance = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { productId, categoryId, startDate, endDate } = req.query;

    const dateRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    } : undefined;

    const performance = await AnalyticsEvent.getProductPerformance({
      productId: productId as string,
      categoryId: categoryId as string,
      dateRange
    });

    res.status(200).json({
      status: 'success',
      results: performance.length,
      data: performance
    });
  }
);

/**
 * Get category analytics
 */
export const getCategoryAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { startDate, endDate } = req.query;

    const dateRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    } : undefined;

    const analytics = await AnalyticsEvent.getCategoryAnalytics(dateRange);

    res.status(200).json({
      status: 'success',
      results: analytics.length,
      data: analytics
    });
  }
);

/**
 * Get revenue analytics
 */
export const getRevenueAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { startDate, endDate, granularity } = req.query;

    const dateRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    } : undefined;

    const analytics = await AnalyticsEvent.getRevenueAnalytics({
      dateRange,
      granularity: granularity as 'hour' | 'day' | 'week' | 'month'
    });

    res.status(200).json({
      status: 'success',
      data: analytics
    });
  }
);

/**
 * Get conversion funnel
 */
export const getConversionFunnel = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { startDate, endDate } = req.query;

    const dateRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    } : undefined;

    const funnel = await AnalyticsEvent.getConversionFunnel(dateRange);

    res.status(200).json({
      status: 'success',
      data: funnel
    });
  }
);

/**
 * Get search analytics
 */
export const getSearchAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { startDate, endDate } = req.query;

    const dateRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    } : undefined;

    const analytics = await AnalyticsEvent.getSearchAnalytics(dateRange);

    res.status(200).json({
      status: 'success',
      data: analytics
    });
  }
);

/**
 * Get dashboard data
 */
export const getDashboard = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { startDate, endDate } = req.query;

    const dateRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    } : undefined;

    const dashboard = await AnalyticsEvent.getDashboardData(dateRange);

    res.status(200).json({
      status: 'success',
      data: dashboard
    });
  }
);

/**
 * Get real-time data
 */
export const getRealTimeData = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const realtime = await AnalyticsEvent.getRealTimeData();

    res.status(200).json({
      status: 'success',
      data: realtime
    });
  }
);

/**
 * Export analytics data
 */
export const exportData = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { type, startDate, endDate, format } = req.query;

    if (!type || !startDate || !endDate) {
      return next(new AppError('Type, start date, and end date are required', 400));
    }

    const dateRange = {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    };

    let query: any = {
      timestamp: {
        $gte: dateRange.start,
        $lte: dateRange.end
      }
    };

    if (type !== 'events') {
      query.type = type;
    }

    const data = await AnalyticsEvent.find(query)
      .sort({ timestamp: -1 })
      .limit(10000)
      .lean();

    // In production, implement proper CSV/XLSX conversion
    res.status(200).json({
      status: 'success',
      results: data.length,
      data
    });
  }
);

/**
 * Admin: Get system analytics
 */
export const getSystemAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const [totalEvents, last30Days, last90Days, last365Days] = await Promise.all([
      AnalyticsEvent.countDocuments(),
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
      }),
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
      })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        dataPoints: totalEvents,
        retention: {
          days30: last30Days,
          days90: last90Days,
          days365: last365Days
        },
        performance: {
          averageProcessingTime: 50, // Mock data
          eventsPerSecond: 100,
          errorRate: 0.01
        }
      }
    });
  }
);

/**
 * Admin: Cleanup old data
 */
export const cleanupData = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { olderThan, dryRun } = req.query;

    if (!olderThan) {
      return next(new AppError('olderThan date is required', 400));
    }

    const cutoffDate = new Date(olderThan as string);
    const query = { timestamp: { $lt: cutoffDate } };

    if (dryRun === 'true') {
      const count = await AnalyticsEvent.countDocuments(query);
      res.status(200).json({
        status: 'success',
        data: {
          message: 'Dry run completed',
          recordsAffected: count
        }
      });
      return;
    }

    const result = await AnalyticsEvent.deleteMany(query);

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Data cleanup completed',
        recordsAffected: result.deletedCount
      }
    });
  }
);

/**
 * Create custom report (placeholder)
 */
export const createCustomReport = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Placeholder - implement custom report logic
    res.status(201).json({
      status: 'success',
      data: {
        message: 'Custom report creation not yet implemented',
        report: req.body
      }
    });
  }
);

/**
 * Get custom report (placeholder)
 */
export const getCustomReport = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    // Placeholder - implement custom report retrieval
    res.status(200).json({
      status: 'success',
      data: {
        message: 'Custom report retrieval not yet implemented',
        reportId: id
      }
    });
  }
);

/**
 * Admin: Get/Update analytics settings (placeholder)
 */
export const getSettings = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Placeholder - return default settings
    res.status(200).json({
      status: 'success',
      data: {
        retention: {
          eventData: 365,
          userData: 730,
          reportData: 365
        },
        sampling: {
          enabled: false,
          rate: 100
        },
        privacy: {
          anonymizeIp: true,
          cookieConsent: true,
          dataProcessingConsent: true
        },
        tracking: {
          enabledEvents: ['page_view', 'product_view', 'add_to_cart', 'purchase', 'search'],
          enabledDimensions: ['device', 'location', 'source'],
          customDimensions: []
        }
      }
    });
  }
);

export const updateSettings = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Placeholder - implement settings update
    res.status(200).json({
      status: 'success',
      data: {
        message: 'Settings updated successfully',
        settings: req.body
      }
    });
  }
);
