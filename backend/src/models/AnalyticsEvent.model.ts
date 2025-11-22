import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Analytics Event Interface
 */
export interface IAnalyticsEvent extends Document {
  // Event Type
  type: 'page_view' | 'product_view' | 'add_to_cart' | 'purchase' | 'search' | 'click' | 'custom';
  name: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;

  // Page Data (for page views)
  page?: {
    url: string;
    title: string;
    referrer?: string;
    duration?: number;
    path?: string;
  };

  // Product Data (for product views/cart/purchases)
  product?: {
    productId: string;
    productName: string;
    categoryId?: string;
    price?: number;
    quantity?: number;
    variant?: string;
    brand?: string;
  };

  // Search Data
  search?: {
    query: string;
    resultsCount: number;
    filters?: Record<string, any>;
    sortBy?: string;
    page?: number;
  };

  // Purchase/Order Data
  order?: {
    orderId: string;
    totalAmount: number;
    currency: string;
    items?: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      categoryId?: string;
    }>;
    couponCode?: string;
    paymentMethod?: string;
  };

  // User Data
  user?: mongoose.Types.ObjectId;
  userId?: string; // For anonymous users
  sessionId: string;

  // Device & Location
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os?: string;
    browser?: string;
    userAgent?: string;
    screenResolution?: string;
  };

  location: {
    country?: string;
    city?: string;
    region?: string;
    timezone?: string;
    ipAddress?: string;
  };

  // Source & Campaign
  source?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    referrer?: string;
  };

  // Custom properties
  properties?: Record<string, any>;

  // Timestamps
  timestamp: Date;
  createdAt: Date;
}

/**
 * Analytics Event Model Interface
 */
export interface IAnalyticsEventModel extends Model<IAnalyticsEvent> {
  // Event tracking
  trackEvent(eventData: Partial<IAnalyticsEvent>): Promise<IAnalyticsEvent>;
  
  // User behavior
  getUserBehavior(userId: string, dateRange?: { start: Date; end: Date }): Promise<any>;
  getUserJourney(params: { userId?: string; sessionId?: string; dateRange?: { start: Date; end: Date } }): Promise<IAnalyticsEvent[]>;
  
  // Session analytics
  getSessionAnalytics(dateRange?: { start: Date; end: Date }): Promise<any>;
  
  // Product analytics
  getProductPerformance(params?: { productId?: string; categoryId?: string; dateRange?: { start: Date; end: Date } }): Promise<any>;
  getCategoryAnalytics(dateRange?: { start: Date; end: Date }): Promise<any>;
  
  // Revenue analytics
  getRevenueAnalytics(params?: { dateRange?: { start: Date; end: Date }; granularity?: 'hour' | 'day' | 'week' | 'month' }): Promise<any>;
  getConversionFunnel(dateRange?: { start: Date; end: Date }): Promise<any>;
  
  // Search analytics
  getSearchAnalytics(dateRange?: { start: Date; end: Date }): Promise<any>;
  
  // Dashboard
  getDashboardData(dateRange?: { start: Date; end: Date }): Promise<any>;
  
  // Real-time
  getRealTimeData(): Promise<any>;
  
  // Cleanup
  cleanupOldData(daysToKeep: number): Promise<number>;
}

/**
 * Analytics Event Schema
 */
const analyticsEventSchema = new Schema<IAnalyticsEvent, IAnalyticsEventModel>(
  {
    // Event Type
    type: {
      type: String,
      required: [true, 'Event type is required'],
      enum: ['page_view', 'product_view', 'add_to_cart', 'purchase', 'search', 'click', 'custom'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Event name is required'],
      maxlength: [200, 'Event name must not exceed 200 characters']
    },
    category: {
      type: String,
      maxlength: [100, 'Category must not exceed 100 characters']
    },
    action: {
      type: String,
      maxlength: [100, 'Action must not exceed 100 characters']
    },
    label: {
      type: String,
      maxlength: [200, 'Label must not exceed 200 characters']
    },
    value: {
      type: Number,
      min: 0
    },

    // Page Data
    page: {
      url: {
        type: String,
        maxlength: [2000, 'URL must not exceed 2000 characters']
      },
      title: {
        type: String,
        maxlength: [500, 'Title must not exceed 500 characters']
      },
      referrer: {
        type: String,
        maxlength: [2000, 'Referrer must not exceed 2000 characters']
      },
      duration: {
        type: Number,
        min: 0 // milliseconds
      },
      path: String
    },

    // Product Data
    product: {
      productId: {
        type: String,
        index: true
      },
      productName: String,
      categoryId: {
        type: String,
        index: true
      },
      price: {
        type: Number,
        min: 0
      },
      quantity: {
        type: Number,
        min: 1
      },
      variant: String,
      brand: String
    },

    // Search Data
    search: {
      query: {
        type: String,
        maxlength: [500, 'Query must not exceed 500 characters'],
        index: true
      },
      resultsCount: {
        type: Number,
        min: 0
      },
      filters: Schema.Types.Mixed,
      sortBy: String,
      page: {
        type: Number,
        min: 1
      }
    },

    // Order Data
    order: {
      orderId: {
        type: String,
        index: true
      },
      totalAmount: {
        type: Number,
        min: 0
      },
      currency: {
        type: String,
        default: 'USD'
      },
      items: [{
        productId: String,
        productName: String,
        quantity: Number,
        price: Number,
        categoryId: String
      }],
      couponCode: String,
      paymentMethod: String
    },

    // User Data
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    userId: {
      type: String, // For anonymous users
      index: true
    },
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      index: true
    },

    // Device & Location
    device: {
      type: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet'],
        default: 'desktop'
      },
      os: String,
      browser: String,
      userAgent: String,
      screenResolution: String
    },

    location: {
      country: String,
      city: String,
      region: String,
      timezone: String,
      ipAddress: String
    },

    // Source & Campaign
    source: {
      utm_source: String,
      utm_medium: String,
      utm_campaign: String,
      utm_term: String,
      utm_content: String,
      referrer: String
    },

    // Custom properties
    properties: Schema.Types.Mixed,

    // Timestamps
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
analyticsEventSchema.index({ type: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1, timestamp: 1 });
analyticsEventSchema.index({ 'product.productId': 1, timestamp: -1 });
analyticsEventSchema.index({ 'product.categoryId': 1, timestamp: -1 });
analyticsEventSchema.index({ 'search.query': 'text' });
analyticsEventSchema.index({ 'device.type': 1, timestamp: -1 });
analyticsEventSchema.index({ 'location.country': 1, timestamp: -1 });
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // 365 days TTL

/**
 * Track an event
 */
analyticsEventSchema.statics.trackEvent = async function (
  eventData: Partial<IAnalyticsEvent>
): Promise<IAnalyticsEvent> {
  return await this.create(eventData);
};

/**
 * Get user behavior
 */
analyticsEventSchema.statics.getUserBehavior = async function (
  userId: string,
  dateRange?: { start: Date; end: Date }
): Promise<any> {
  const query: any = {
    $or: [
      { user: userId },
      { userId: userId }
    ]
  };

  if (dateRange) {
    query.timestamp = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }

  const [overview, products, categories] = await Promise.all([
    // Overview stats
    this.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$sessionId'
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 }
        }
      }
    ]),

    // Most viewed products
    this.aggregate([
      {
        $match: {
          ...query,
          type: 'product_view'
        }
      },
      {
        $group: {
          _id: '$product.productId',
          name: { $first: '$product.productName' },
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]),

    // Favorite categories
    this.aggregate([
      {
        $match: {
          ...query,
          type: 'product_view'
        }
      },
      {
        $group: {
          _id: '$product.categoryId',
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ])
  ]);

  const pageViews = await this.countDocuments({ ...query, type: 'page_view' });
  const purchases = await this.countDocuments({ ...query, type: 'purchase' });

  return {
    totalSessions: overview[0]?.totalSessions || 0,
    totalPageViews: pageViews,
    totalPurchases: purchases,
    mostViewedProducts: products,
    favoriteCategories: categories
  };
};

/**
 * Get user journey
 */
analyticsEventSchema.statics.getUserJourney = async function (
  params: { userId?: string; sessionId?: string; dateRange?: { start: Date; end: Date } }
): Promise<any[]> {
  const query: any = {};

  if (params.userId) {
    query.$or = [
      { user: params.userId },
      { userId: params.userId }
    ];
  }

  if (params.sessionId) {
    query.sessionId = params.sessionId;
  }

  if (params.dateRange) {
    query.timestamp = {
      $gte: params.dateRange.start,
      $lte: params.dateRange.end
    };
  }

  return await this.find(query)
    .sort({ timestamp: 1 })
    .limit(1000)
    .lean();
};

/**
 * Get session analytics
 */
analyticsEventSchema.statics.getSessionAnalytics = async function (
  dateRange?: { start: Date; end: Date }
): Promise<any> {
  const query: any = {};

  if (dateRange) {
    query.timestamp = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }

  const [sessions, users, pageViews, topPages, deviceBreakdown] = await Promise.all([
    // Total sessions
    this.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$sessionId'
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 }
        }
      }
    ]),

    // Total users
    this.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $cond: [
              { $ifNull: ['$user', false] },
              '$user',
              '$userId'
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 }
        }
      }
    ]),

    // Page views
    this.countDocuments({ ...query, type: 'page_view' }),

    // Top pages
    this.aggregate([
      {
        $match: {
          ...query,
          type: 'page_view'
        }
      },
      {
        $group: {
          _id: '$page.url',
          title: { $first: '$page.title' },
          views: { $sum: 1 },
          averageDuration: { $avg: '$page.duration' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]),

    // Device breakdown
    this.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$device.type',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  return {
    totalSessions: sessions[0]?.totalSessions || 0,
    totalUsers: users[0]?.totalUsers || 0,
    totalPageViews: pageViews,
    topPages,
    deviceBreakdown: deviceBreakdown.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };
};

/**
 * Get product performance
 */
analyticsEventSchema.statics.getProductPerformance = async function (
  params?: { productId?: string; categoryId?: string; dateRange?: { start: Date; end: Date } }
): Promise<any[]> {
  const matchQuery: any = {
    type: { $in: ['product_view', 'add_to_cart', 'purchase'] }
  };

  if (params?.productId) {
    matchQuery['product.productId'] = params.productId;
  }

  if (params?.categoryId) {
    matchQuery['product.categoryId'] = params.categoryId;
  }

  if (params?.dateRange) {
    matchQuery.timestamp = {
      $gte: params.dateRange.start,
      $lte: params.dateRange.end
    };
  }

  return await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$product.productId',
        productName: { $first: '$product.productName' },
        category: { $first: '$product.categoryId' },
        brand: { $first: '$product.brand' },
        views: {
          $sum: {
            $cond: [{ $eq: ['$type', 'product_view'] }, 1, 0]
          }
        },
        addToCartCount: {
          $sum: {
            $cond: [{ $eq: ['$type', 'add_to_cart'] }, 1, 0]
          }
        },
        purchaseCount: {
          $sum: {
            $cond: [{ $eq: ['$type', 'purchase'] }, 1, 0]
          }
        },
        revenue: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'purchase'] },
              { $multiply: ['$product.price', '$product.quantity'] },
              0
            ]
          }
        }
      }
    },
    {
      $addFields: {
        conversionRate: {
          $cond: [
            { $gt: ['$views', 0] },
            { $multiply: [{ $divide: ['$purchaseCount', '$views'] }, 100] },
            0
          ]
        },
        addToCartRate: {
          $cond: [
            { $gt: ['$views', 0] },
            { $multiply: [{ $divide: ['$addToCartCount', '$views'] }, 100] },
            0
          ]
        }
      }
    },
    { $sort: { views: -1 } },
    { $limit: 50 }
  ]);
};

/**
 * Get category analytics
 */
analyticsEventSchema.statics.getCategoryAnalytics = async function (
  dateRange?: { start: Date; end: Date }
): Promise<any[]> {
  const matchQuery: any = {
    type: { $in: ['product_view', 'purchase'] },
    'product.categoryId': { $exists: true }
  };

  if (dateRange) {
    matchQuery.timestamp = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }

  return await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$product.categoryId',
        views: {
          $sum: {
            $cond: [{ $eq: ['$type', 'product_view'] }, 1, 0]
          }
        },
        purchases: {
          $sum: {
            $cond: [{ $eq: ['$type', 'purchase'] }, 1, 0]
          }
        },
        revenue: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'purchase'] },
              { $multiply: ['$product.price', '$product.quantity'] },
              0
            ]
          }
        }
      }
    },
    {
      $addFields: {
        conversionRate: {
          $cond: [
            { $gt: ['$views', 0] },
            { $multiply: [{ $divide: ['$purchases', '$views'] }, 100] },
            0
          ]
        }
      }
    },
    { $sort: { views: -1 } }
  ]);
};

/**
 * Get revenue analytics
 */
analyticsEventSchema.statics.getRevenueAnalytics = async function (
  params?: { dateRange?: { start: Date; end: Date }; granularity?: 'hour' | 'day' | 'week' | 'month' }
): Promise<any> {
  const matchQuery: any = { type: 'purchase' };

  if (params?.dateRange) {
    matchQuery.timestamp = {
      $gte: params.dateRange.start,
      $lte: params.dateRange.end
    };
  }

  const granularity = params?.granularity || 'day';
  const dateFormat: any = {
    hour: { $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp' } },
    day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
    week: { $dateToString: { format: '%Y-W%V', date: '$timestamp' } },
    month: { $dateToString: { format: '%Y-%m', date: '$timestamp' } }
  };

  const [overview, timeline, topProducts] = await Promise.all([
    // Overview
    this.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$order.totalAmount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$order.totalAmount' }
        }
      }
    ]),

    // Timeline
    this.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: dateFormat[granularity],
          revenue: { $sum: '$order.totalAmount' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$order.totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Top products
    this.aggregate([
      { $match: matchQuery },
      { $unwind: '$order.items' },
      {
        $group: {
          _id: '$order.items.productId',
          name: { $first: '$order.items.productName' },
          revenue: { $sum: { $multiply: ['$order.items.price', '$order.items.quantity'] } },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ])
  ]);

  return {
    totalRevenue: overview[0]?.totalRevenue || 0,
    totalOrders: overview[0]?.totalOrders || 0,
    averageOrderValue: overview[0]?.averageOrderValue || 0,
    timeline,
    topProducts
  };
};

/**
 * Get conversion funnel
 */
analyticsEventSchema.statics.getConversionFunnel = async function (
  dateRange?: { start: Date; end: Date }
): Promise<any> {
  const query: any = {};

  if (dateRange) {
    query.timestamp = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }

  const [visitors, productViews, addToCart, purchases] = await Promise.all([
    this.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $cond: [
              { $ifNull: ['$user', false] },
              '$user',
              '$userId'
            ]
          }
        }
      },
      { $count: 'total' }
    ]),
    
    this.aggregate([
      { $match: { ...query, type: 'product_view' } },
      {
        $group: {
          _id: {
            $cond: [
              { $ifNull: ['$user', false] },
              '$user',
              '$userId'
            ]
          }
        }
      },
      { $count: 'total' }
    ]),
    
    this.aggregate([
      { $match: { ...query, type: 'add_to_cart' } },
      {
        $group: {
          _id: {
            $cond: [
              { $ifNull: ['$user', false] },
              '$user',
              '$userId'
            ]
          }
        }
      },
      { $count: 'total' }
    ]),
    
    this.aggregate([
      { $match: { ...query, type: 'purchase' } },
      {
        $group: {
          _id: {
            $cond: [
              { $ifNull: ['$user', false] },
              '$user',
              '$userId'
            ]
          }
        }
      },
      { $count: 'total' }
    ])
  ]);

  const visitorCount = visitors[0]?.total || 1;
  const productViewCount = productViews[0]?.total || 0;
  const addToCartCount = addToCart[0]?.total || 0;
  const purchaseCount = purchases[0]?.total || 0;

  return {
    totalVisitors: visitorCount,
    steps: [
      {
        name: 'Visitors',
        users: visitorCount,
        conversionRate: 100,
        dropOffRate: 0
      },
      {
        name: 'Product Views',
        users: productViewCount,
        conversionRate: (productViewCount / visitorCount) * 100,
        dropOffRate: ((visitorCount - productViewCount) / visitorCount) * 100
      },
      {
        name: 'Add to Cart',
        users: addToCartCount,
        conversionRate: (addToCartCount / visitorCount) * 100,
        dropOffRate: ((productViewCount - addToCartCount) / productViewCount) * 100
      },
      {
        name: 'Purchase',
        users: purchaseCount,
        conversionRate: (purchaseCount / visitorCount) * 100,
        dropOffRate: ((addToCartCount - purchaseCount) / addToCartCount) * 100
      }
    ]
  };
};

/**
 * Get search analytics
 */
analyticsEventSchema.statics.getSearchAnalytics = async function (
  dateRange?: { start: Date; end: Date }
): Promise<any> {
  const matchQuery: any = { type: 'search' };

  if (dateRange) {
    matchQuery.timestamp = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }

  const [overview, topQueries, noResults] = await Promise.all([
    // Overview
    this.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSearches: { $sum: 1 },
          uniqueQueries: { $addToSet: '$search.query' },
          averageResults: { $avg: '$search.resultsCount' },
          zeroResults: {
            $sum: {
              $cond: [{ $eq: ['$search.resultsCount', 0] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          uniqueQueryCount: { $size: '$uniqueQueries' },
          zeroResultsRate: {
            $multiply: [{ $divide: ['$zeroResults', '$totalSearches'] }, 100]
          }
        }
      }
    ]),

    // Top queries
    this.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$search.query',
          count: { $sum: 1 },
          averageResults: { $avg: '$search.resultsCount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]),

    // No results queries
    this.aggregate([
      {
        $match: {
          ...matchQuery,
          'search.resultsCount': 0
        }
      },
      {
        $group: {
          _id: '$search.query',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
  ]);

  return {
    totalSearches: overview[0]?.totalSearches || 0,
    uniqueQueries: overview[0]?.uniqueQueryCount || 0,
    averageResultsPerSearch: overview[0]?.averageResults || 0,
    zeroResultsRate: overview[0]?.zeroResultsRate || 0,
    topQueries,
    noResultsQueries: noResults
  };
};

/**
 * Get dashboard data
 */
analyticsEventSchema.statics.getDashboardData = async function (
  dateRange?: { start: Date; end: Date }
): Promise<any> {
  const query: any = {};

  if (dateRange) {
    query.timestamp = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }

  const [sessions, pageViews, revenue, topPages, topProducts] = await Promise.all([
    // Sessions
    this.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$sessionId'
        }
      },
      { $count: 'total' }
    ]),

    // Page views
    this.countDocuments({ ...query, type: 'page_view' }),

    // Revenue
    this.aggregate([
      { $match: { ...query, type: 'purchase' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$order.totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]),

    // Top pages
    this.aggregate([
      { $match: { ...query, type: 'page_view' } },
      {
        $group: {
          _id: '$page.url',
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ]),

    // Top products
    this.aggregate([
      { $match: { ...query, type: 'product_view' } },
      {
        $group: {
          _id: '$product.productId',
          name: { $first: '$product.productName' },
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ])
  ]);

  return {
    overview: {
      totalSessions: sessions[0]?.total || 0,
      totalPageViews: pageViews,
      totalRevenue: revenue[0]?.totalRevenue || 0,
      totalOrders: revenue[0]?.totalOrders || 0
    },
    topPages,
    topProducts
  };
};

/**
 * Get real-time data
 */
analyticsEventSchema.statics.getRealTimeData = async function (): Promise<any> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const [activeUsers, pageViews, topPages, deviceBreakdown, recentEvents] = await Promise.all([
    // Active users
    this.aggregate([
      {
        $match: {
          timestamp: { $gte: fiveMinutesAgo }
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $ifNull: ['$user', false] },
              '$user',
              '$userId'
            ]
          }
        }
      },
      { $count: 'total' }
    ]),

    // Page views
    this.countDocuments({
      type: 'page_view',
      timestamp: { $gte: fiveMinutesAgo }
    }),

    // Top active pages
    this.aggregate([
      {
        $match: {
          type: 'page_view',
          timestamp: { $gte: fiveMinutesAgo }
        }
      },
      {
        $group: {
          _id: '$page.url',
          title: { $first: '$page.title' },
          activeUsers: { $sum: 1 }
        }
      },
      { $sort: { activeUsers: -1 } },
      { $limit: 5 }
    ]),

    // Device breakdown
    this.aggregate([
      {
        $match: {
          timestamp: { $gte: fiveMinutesAgo }
        }
      },
      {
        $group: {
          _id: '$device.type',
          count: { $sum: 1 }
        }
      }
    ]),

    // Recent events
    this.find({
      timestamp: { $gte: fiveMinutesAgo }
    })
      .sort({ timestamp: -1 })
      .limit(20)
      .select('type page.url location.country timestamp')
      .lean()
  ]);

  return {
    activeUsers: activeUsers[0]?.total || 0,
    activePageViews: pageViews,
    topActivePages: topPages,
    deviceBreakdown: deviceBreakdown.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    recentEvents
  };
};

/**
 * Cleanup old data
 */
analyticsEventSchema.statics.cleanupOldData = async function (
  daysToKeep: number = 365
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await this.deleteMany({
    timestamp: { $lt: cutoffDate }
  });

  return result.deletedCount;
};

// Create the model
const AnalyticsEvent = mongoose.model<IAnalyticsEvent, IAnalyticsEventModel>(
  'AnalyticsEvent',
  analyticsEventSchema
);

export default AnalyticsEvent;
