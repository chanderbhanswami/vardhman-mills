/**
 * Wishlist Model - Comprehensive wishlist and favorites system
 * Frontend-optimized with full TypeScript support and validation
 */

import { ObjectId } from 'mongodb';
import { z } from 'zod';

/**
 * Wishlist Item Schema
 */
export const WishlistItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  productSlug: z.string(),
  productImage: z.string().url().optional(),
  productPrice: z.number().positive(),
  productSalePrice: z.number().positive().optional(),
  productSku: z.string().optional(),
  productStatus: z.enum(['active', 'inactive', 'out_of_stock', 'discontinued']).default('active'),
  variant: z.object({
    size: z.string().optional(),
    color: z.string().optional(),
    material: z.string().optional(),
    style: z.string().optional(),
    sku: z.string().optional(),
  }).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  notes: z.string().max(500, 'Notes too long').optional(),
  priceAlert: z.object({
    enabled: z.boolean().default(false),
    targetPrice: z.number().positive().optional(),
    notified: z.boolean().default(false),
    lastNotifiedAt: z.date().optional(),
  }).default(() => ({
    enabled: false,
    notified: false,
  })),
  stockAlert: z.object({
    enabled: z.boolean().default(false),
    notified: z.boolean().default(false),
    lastNotifiedAt: z.date().optional(),
  }).default(() => ({
    enabled: false,
    notified: false,
  })),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.string(), z.unknown()).default({}),
  addedAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  lastViewedAt: z.date().optional(),
});

export type WishlistItem = z.infer<typeof WishlistItemSchema>;

/**
 * Wishlist Analytics Schema
 */
export const WishlistAnalyticsSchema = z.object({
  totalItems: z.number().nonnegative().default(0),
  totalValue: z.number().nonnegative().default(0),
  totalSavings: z.number().nonnegative().default(0), // From sale prices
  averageItemPrice: z.number().nonnegative().default(0),
  itemsByPriority: z.object({
    low: z.number().default(0),
    medium: z.number().default(0),
    high: z.number().default(0),
    urgent: z.number().default(0),
  }).default(() => ({
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  })),
  itemsByStatus: z.object({
    active: z.number().default(0),
    inactive: z.number().default(0),
    out_of_stock: z.number().default(0),
    discontinued: z.number().default(0),
  }).default(() => ({
    active: 0,
    inactive: 0,
    out_of_stock: 0,
    discontinued: 0,
  })),
  priceAlerts: z.number().nonnegative().default(0),
  stockAlerts: z.number().nonnegative().default(0),
  recentlyAdded: z.number().nonnegative().default(0), // Items added in last 7 days
  oldestItem: z.date().optional(),
  newestItem: z.date().optional(),
  conversionRate: z.number().min(0).max(1).default(0), // Items purchased vs total items
  shareCount: z.number().nonnegative().default(0),
  views: z.number().nonnegative().default(0),
  lastUpdated: z.date().optional(),
});

export type WishlistAnalytics = z.infer<typeof WishlistAnalyticsSchema>;

/**
 * Wishlist Sharing Schema
 */
export const WishlistSharingSchema = z.object({
  isPublic: z.boolean().default(false),
  shareToken: z.string().optional(),
  sharedWith: z.array(z.object({
    userId: z.string().optional(),
    email: z.string().email().optional(),
    sharedAt: z.date().default(() => new Date()),
    permissions: z.enum(['view', 'edit']).default('view'),
    accepted: z.boolean().default(false),
    acceptedAt: z.date().optional(),
  })).default([]),
  shareSettings: z.object({
    allowComments: z.boolean().default(false),
    allowCopy: z.boolean().default(true),
    allowPurchase: z.boolean().default(true),
    requireAuth: z.boolean().default(false),
    expiresAt: z.date().optional(),
  }).default(() => ({
    allowComments: false,
    allowCopy: true,
    allowPurchase: true,
    requireAuth: false,
  })),
  shareCount: z.number().nonnegative().default(0),
  views: z.number().nonnegative().default(0),
  uniqueViews: z.number().nonnegative().default(0),
});

export type WishlistSharing = z.infer<typeof WishlistSharingSchema>;

/**
 * Main Wishlist Schema
 */
export const WishlistSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Wishlist name is required').max(100, 'Name too long').default('My Wishlist'),
  description: z.string().max(500, 'Description too long').optional(),
  type: z.enum(['default', 'wedding', 'birthday', 'holiday', 'baby_shower', 'custom']).default('default'),
  status: z.enum(['active', 'archived', 'private', 'deleted']).default('active'),
  visibility: z.enum(['private', 'public', 'friends', 'family']).default('private'),
  
  // Items
  items: z.array(WishlistItemSchema).default([]),
  
  // Organization
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  color: z.string().optional(), // Hex color for organization
  icon: z.string().optional(), // Icon identifier
  sortOrder: z.number().default(0),
  
  // Event details (for event-based wishlists)
  event: z.object({
    name: z.string().optional(),
    date: z.date().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    registryId: z.string().optional(), // External registry ID
  }).optional(),
  
  // Sharing and collaboration
  sharing: WishlistSharingSchema.default(() => ({
    isPublic: false,
    sharedWith: [],
    shareSettings: {
      allowComments: false,
      allowCopy: true,
      allowPurchase: true,
      requireAuth: false,
    },
    shareCount: 0,
    views: 0,
    uniqueViews: 0,
  })),
  
  // Analytics
  analytics: WishlistAnalyticsSchema.default(() => ({
    totalItems: 0,
    totalValue: 0,
    totalSavings: 0,
    averageItemPrice: 0,
    itemsByPriority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    },
    itemsByStatus: {
      active: 0,
      inactive: 0,
      out_of_stock: 0,
      discontinued: 0,
    },
    priceAlerts: 0,
    stockAlerts: 0,
    recentlyAdded: 0,
    conversionRate: 0,
    shareCount: 0,
    views: 0,
  })),
  
  // Notifications
  notifications: z.object({
    priceDrops: z.boolean().default(true),
    backInStock: z.boolean().default(true),
    saleAlerts: z.boolean().default(true),
    reminders: z.boolean().default(false),
    sharing: z.boolean().default(true),
  }).default(() => ({
    priceDrops: true,
    backInStock: true,
    saleAlerts: true,
    reminders: false,
    sharing: true,
  })),
  
  // Settings
  settings: z.object({
    autoRemoveOutOfStock: z.boolean().default(false),
    autoRemovePurchased: z.boolean().default(false),
    maxItems: z.number().positive().default(1000),
    defaultPriority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    sortBy: z.enum(['added_date', 'name', 'price', 'priority', 'updated_date']).default('added_date'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    showPrices: z.boolean().default(true),
    showNotes: z.boolean().default(true),
    compactView: z.boolean().default(false),
  }).default(() => ({
    autoRemoveOutOfStock: false,
    autoRemovePurchased: false,
    maxItems: 1000,
    defaultPriority: 'medium' as const,
    sortBy: 'added_date' as const,
    sortOrder: 'desc' as const,
    showPrices: true,
    showNotes: true,
    compactView: false,
  })),
  
  // Custom fields
  customFields: z.record(z.string(), z.unknown()).default({}),
  
  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  lastAccessedAt: z.date().optional(),
  archivedAt: z.date().optional(),
  deletedAt: z.date().optional(),
});

export type Wishlist = z.infer<typeof WishlistSchema>;

/**
 * Create Wishlist Schema
 */
export const CreateWishlistSchema = WishlistSchema.omit({
  _id: true,
  analytics: true,
  createdAt: true,
  updatedAt: true,
  lastAccessedAt: true,
  archivedAt: true,
  deletedAt: true,
});

export type CreateWishlistInput = z.infer<typeof CreateWishlistSchema>;

/**
 * Update Wishlist Schema
 */
export const UpdateWishlistSchema = WishlistSchema.partial().omit({
  _id: true,
  userId: true,
  createdAt: true,
});

export type UpdateWishlistInput = z.infer<typeof UpdateWishlistSchema>;

/**
 * Add Item to Wishlist Schema
 */
export const AddWishlistItemSchema = WishlistItemSchema.omit({
  addedAt: true,
  updatedAt: true,
  lastViewedAt: true,
});

export type AddWishlistItemInput = z.infer<typeof AddWishlistItemSchema>;

/**
 * Wishlist Filter Schema
 */
export const WishlistFilterSchema = z.object({
  userId: z.string().optional(),
  type: z.enum(['default', 'wedding', 'birthday', 'holiday', 'baby_shower', 'custom']).optional(),
  status: z.enum(['active', 'archived', 'private', 'deleted']).optional(),
  visibility: z.enum(['private', 'public', 'friends', 'family']).optional(),
  hasItems: z.boolean().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
  minValue: z.number().nonnegative().optional(),
  maxValue: z.number().nonnegative().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'created_at', 'updated_at', 'item_count', 'total_value']).default('updated_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeItems: z.boolean().default(true),
  includeAnalytics: z.boolean().default(false),
});

export type WishlistFilter = z.infer<typeof WishlistFilterSchema>;

/**
 * Wishlist Statistics Schema
 */
export const WishlistStatsSchema = z.object({
  totalWishlists: z.number(),
  totalItems: z.number(),
  totalValue: z.number(),
  averageItemsPerWishlist: z.number(),
  averageWishlistValue: z.number(),
  mostPopularCategories: z.array(z.object({
    category: z.string(),
    count: z.number(),
  })),
  wishlistsByType: z.record(z.string(), z.number()),
  conversionMetrics: z.object({
    totalPurchases: z.number(),
    conversionRate: z.number(),
    averageTimeToConversion: z.number(), // in days
  }),
  priceAlertMetrics: z.object({
    totalAlerts: z.number(),
    triggeredAlerts: z.number(),
    alertConversionRate: z.number(),
  }),
  sharingMetrics: z.object({
    publicWishlists: z.number(),
    sharedWishlists: z.number(),
    totalShares: z.number(),
    averageViews: z.number(),
  }),
});

export type WishlistStats = z.infer<typeof WishlistStatsSchema>;

/**
 * Validation functions
 */
export const validateWishlist = (data: unknown): Wishlist => {
  return WishlistSchema.parse(data);
};

export const validateCreateWishlist = (data: unknown): CreateWishlistInput => {
  return CreateWishlistSchema.parse(data);
};

export const validateUpdateWishlist = (data: unknown): UpdateWishlistInput => {
  return UpdateWishlistSchema.parse(data);
};

export const validateAddWishlistItem = (data: unknown): AddWishlistItemInput => {
  return AddWishlistItemSchema.parse(data);
};

export const validateWishlistFilter = (data: unknown): WishlistFilter => {
  return WishlistFilterSchema.parse(data);
};

/**
 * Wishlist utility functions
 */
export const wishlistUtils = {
  /**
   * Calculate wishlist analytics
   */
  calculateAnalytics: (wishlist: Wishlist): WishlistAnalytics => {
    const items = wishlist.items.filter(item => item.productStatus !== 'discontinued');
    
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.productSalePrice || item.productPrice), 0);
    const totalSavings = items.reduce((sum, item) => {
      if (item.productSalePrice && item.productSalePrice < item.productPrice) {
        return sum + (item.productPrice - item.productSalePrice);
      }
      return sum;
    }, 0);
    
    const averageItemPrice = totalItems > 0 ? totalValue / totalItems : 0;
    
    // Group by priority
    const itemsByPriority = items.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    }, { low: 0, medium: 0, high: 0, urgent: 0 });
    
    // Group by status
    const itemsByStatus = items.reduce((acc, item) => {
      acc[item.productStatus] = (acc[item.productStatus] || 0) + 1;
      return acc;
    }, { active: 0, inactive: 0, out_of_stock: 0, discontinued: 0 });
    
    // Count alerts
    const priceAlerts = items.filter(item => item.priceAlert.enabled).length;
    const stockAlerts = items.filter(item => item.stockAlert.enabled).length;
    
    // Recent items (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentlyAdded = items.filter(item => item.addedAt > sevenDaysAgo).length;
    
    // Oldest and newest items
    const sortedByDate = [...items].sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime());
    const oldestItem = sortedByDate[0]?.addedAt;
    const newestItem = sortedByDate[sortedByDate.length - 1]?.addedAt;
    
    return {
      totalItems,
      totalValue: Math.round(totalValue * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
      averageItemPrice: Math.round(averageItemPrice * 100) / 100,
      itemsByPriority,
      itemsByStatus,
      priceAlerts,
      stockAlerts,
      recentlyAdded,
      oldestItem,
      newestItem,
      conversionRate: 0, // Would need purchase data
      shareCount: wishlist.sharing.shareCount,
      views: wishlist.sharing.views,
      lastUpdated: new Date(),
    };
  },

  /**
   * Add item to wishlist
   */
  addItem: (wishlist: Wishlist, item: AddWishlistItemInput): Wishlist => {
    // Check if item already exists
    const existingItemIndex = wishlist.items.findIndex(
      existing => existing.productId === item.productId && 
      JSON.stringify(existing.variant) === JSON.stringify(item.variant)
    );
    
    if (existingItemIndex !== -1) {
      // Update existing item
      wishlist.items[existingItemIndex] = {
        ...wishlist.items[existingItemIndex],
        ...item,
        updatedAt: new Date(),
      };
    } else {
      // Check max items limit
      if (wishlist.items.length >= wishlist.settings.maxItems) {
        throw new Error(`Cannot add more than ${wishlist.settings.maxItems} items to wishlist`);
      }
      
      // Add new item
      const newItem: WishlistItem = {
        ...item,
        addedAt: new Date(),
        updatedAt: new Date(),
        priceAlert: item.priceAlert || { enabled: false, notified: false },
        stockAlert: item.stockAlert || { enabled: false, notified: false },
        tags: item.tags || [],
        customFields: item.customFields || {},
      };
      
      wishlist.items.push(newItem);
    }
    
    wishlist.updatedAt = new Date();
    wishlist.analytics = wishlistUtils.calculateAnalytics(wishlist);
    
    return wishlist;
  },

  /**
   * Remove item from wishlist
   */
  removeItem: (wishlist: Wishlist, productId: string, variant?: WishlistItem['variant']): Wishlist => {
    const itemIndex = wishlist.items.findIndex(
      item => item.productId === productId && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );
    
    if (itemIndex !== -1) {
      wishlist.items.splice(itemIndex, 1);
      wishlist.updatedAt = new Date();
      wishlist.analytics = wishlistUtils.calculateAnalytics(wishlist);
    }
    
    return wishlist;
  },

  /**
   * Update item in wishlist
   */
  updateItem: (wishlist: Wishlist, productId: string, updates: Partial<WishlistItem>, variant?: WishlistItem['variant']): Wishlist => {
    const itemIndex = wishlist.items.findIndex(
      item => item.productId === productId && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );
    
    if (itemIndex !== -1) {
      wishlist.items[itemIndex] = {
        ...wishlist.items[itemIndex],
        ...updates,
        updatedAt: new Date(),
      };
      
      wishlist.updatedAt = new Date();
      wishlist.analytics = wishlistUtils.calculateAnalytics(wishlist);
    }
    
    return wishlist;
  },

  /**
   * Sort wishlist items
   */
  sortItems: (items: WishlistItem[], sortBy: string, sortOrder: 'asc' | 'desc'): WishlistItem[] => {
    return [...items].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'added_date':
          comparison = a.addedAt.getTime() - b.addedAt.getTime();
          break;
        case 'name':
          comparison = a.productName.localeCompare(b.productName);
          break;
        case 'price':
          const priceA = a.productSalePrice || a.productPrice;
          const priceB = b.productSalePrice || b.productPrice;
          comparison = priceA - priceB;
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'updated_date':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  },

  /**
   * Filter wishlist items
   */
  filterItems: (items: WishlistItem[], filters: {
    status?: WishlistItem['productStatus'];
    priority?: WishlistItem['priority'];
    hasAlert?: boolean;
    search?: string;
    tags?: string[];
    priceRange?: { min: number; max: number };
  }): WishlistItem[] => {
    return items.filter(item => {
      if (filters.status && item.productStatus !== filters.status) return false;
      if (filters.priority && item.priority !== filters.priority) return false;
      if (filters.hasAlert !== undefined) {
        const hasAlert = item.priceAlert.enabled || item.stockAlert.enabled;
        if (hasAlert !== filters.hasAlert) return false;
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchText = [item.productName, item.notes || '', ...item.tags].join(' ').toLowerCase();
        if (!searchText.includes(searchTerm)) return false;
      }
      
      if (filters.tags && filters.tags.length > 0) {
        const hasTag = filters.tags.some(tag => item.tags.includes(tag));
        if (!hasTag) return false;
      }
      
      if (filters.priceRange) {
        const price = item.productSalePrice || item.productPrice;
        if (price < filters.priceRange.min || price > filters.priceRange.max) return false;
      }
      
      return true;
    });
  },

  /**
   * Generate share token
   */
  generateShareToken: (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },

  /**
   * Share wishlist
   */
  shareWishlist: (wishlist: Wishlist, shareWith: string[], permissions: 'view' | 'edit' = 'view'): Wishlist => {
    if (!wishlist.sharing.shareToken) {
      wishlist.sharing.shareToken = wishlistUtils.generateShareToken();
    }
    
    shareWith.forEach(email => {
      const existingShare = wishlist.sharing.sharedWith.find(share => share.email === email);
      if (!existingShare) {
        wishlist.sharing.sharedWith.push({
          email,
          sharedAt: new Date(),
          permissions,
          accepted: false,
        });
      }
    });
    
    wishlist.sharing.shareCount = wishlist.sharing.sharedWith.length;
    wishlist.updatedAt = new Date();
    
    return wishlist;
  },

  /**
   * Make wishlist public
   */
  makePublic: (wishlist: Wishlist): Wishlist => {
    wishlist.sharing.isPublic = true;
    wishlist.visibility = 'public';
    
    if (!wishlist.sharing.shareToken) {
      wishlist.sharing.shareToken = wishlistUtils.generateShareToken();
    }
    
    wishlist.updatedAt = new Date();
    return wishlist;
  },

  /**
   * Get public URL
   */
  getPublicUrl: (wishlist: Wishlist, baseUrl: string = ''): string => {
    if (!wishlist.sharing.shareToken) return '';
    return `${baseUrl}/wishlists/shared/${wishlist.sharing.shareToken}`;
  },

  /**
   * Format wishlist for display
   */
  formatForDisplay: (wishlist: Wishlist, includeItems: boolean = true) => {
    const analytics = wishlistUtils.calculateAnalytics(wishlist);
    
    return {
      id: wishlist._id?.toString(),
      name: wishlist.name,
      description: wishlist.description,
      type: wishlist.type,
      status: wishlist.status,
      visibility: wishlist.visibility,
      itemCount: analytics.totalItems,
      totalValue: analytics.totalValue,
      totalSavings: analytics.totalSavings,
      color: wishlist.color,
      icon: wishlist.icon,
      items: includeItems ? wishlist.items.map(item => ({
        ...item,
        currentPrice: item.productSalePrice || item.productPrice,
        savings: item.productSalePrice ? item.productPrice - item.productSalePrice : 0,
        onSale: !!item.productSalePrice && item.productSalePrice < item.productPrice,
      })) : [],
      event: wishlist.event,
      sharing: {
        isPublic: wishlist.sharing.isPublic,
        shareUrl: wishlist.sharing.shareToken ? wishlistUtils.getPublicUrl(wishlist) : null,
        shareCount: wishlist.sharing.shareCount,
        views: wishlist.sharing.views,
      },
      analytics,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
      lastAccessedAt: wishlist.lastAccessedAt,
    };
  },

  /**
   * Get price alerts
   */
  getPriceAlerts: (wishlists: Wishlist[]): Array<{ wishlistId: string; item: WishlistItem }> => {
    const alerts: Array<{ wishlistId: string; item: WishlistItem }> = [];
    
    wishlists.forEach(wishlist => {
      wishlist.items.forEach(item => {
        if (item.priceAlert.enabled && item.priceAlert.targetPrice) {
          const currentPrice = item.productSalePrice || item.productPrice;
          if (currentPrice <= item.priceAlert.targetPrice && !item.priceAlert.notified) {
            alerts.push({ wishlistId: wishlist._id?.toString() || '', item });
          }
        }
      });
    });
    
    return alerts;
  },

  /**
   * Get stock alerts
   */
  getStockAlerts: (wishlists: Wishlist[]): Array<{ wishlistId: string; item: WishlistItem }> => {
    const alerts: Array<{ wishlistId: string; item: WishlistItem }> = [];
    
    wishlists.forEach(wishlist => {
      wishlist.items.forEach(item => {
        if (item.stockAlert.enabled && 
            item.productStatus === 'active' && 
            !item.stockAlert.notified) {
          alerts.push({ wishlistId: wishlist._id?.toString() || '', item });
        }
      });
    });
    
    return alerts;
  },

  /**
   * Clean up wishlist
   */
  cleanup: (wishlist: Wishlist): Wishlist => {
    if (wishlist.settings.autoRemoveOutOfStock) {
      wishlist.items = wishlist.items.filter(item => item.productStatus !== 'out_of_stock');
    }
    
    // Remove discontinued items
    wishlist.items = wishlist.items.filter(item => item.productStatus !== 'discontinued');
    
    wishlist.analytics = wishlistUtils.calculateAnalytics(wishlist);
    wishlist.updatedAt = new Date();
    
    return wishlist;
  },

  /**
   * Merge wishlists
   */
  merge: (targetWishlist: Wishlist, sourceWishlist: Wishlist): Wishlist => {
    sourceWishlist.items.forEach(sourceItem => {
      const existingItem = targetWishlist.items.find(
        targetItem => targetItem.productId === sourceItem.productId &&
        JSON.stringify(targetItem.variant) === JSON.stringify(sourceItem.variant)
      );
      
      if (!existingItem) {
        targetWishlist.items.push(sourceItem);
      }
    });
    
    // Merge tags
    const tagSet = new Set([...targetWishlist.tags, ...sourceWishlist.tags]);
    targetWishlist.tags = Array.from(tagSet);
    
    targetWishlist.analytics = wishlistUtils.calculateAnalytics(targetWishlist);
    targetWishlist.updatedAt = new Date();
    
    return targetWishlist;
  },

  /**
   * Export wishlist data
   */
  exportData: (wishlist: Wishlist, format: 'json' | 'csv' = 'json') => {
    const exportData = {
      wishlist: {
        name: wishlist.name,
        description: wishlist.description,
        type: wishlist.type,
        createdAt: wishlist.createdAt,
        totalItems: wishlist.items.length,
        totalValue: wishlistUtils.calculateAnalytics(wishlist).totalValue,
      },
      items: wishlist.items.map(item => ({
        productName: item.productName,
        productPrice: item.productPrice,
        productSalePrice: item.productSalePrice,
        priority: item.priority,
        notes: item.notes,
        variant: item.variant,
        addedAt: item.addedAt,
        priceAlert: item.priceAlert.enabled ? item.priceAlert.targetPrice : null,
        stockAlert: item.stockAlert.enabled,
      })),
    };
    
    return format === 'json' ? JSON.stringify(exportData, null, 2) : exportData;
  },

  /**
   * Search wishlists
   */
  search: (wishlists: Wishlist[], query: string): Wishlist[] => {
    const searchTerm = query.toLowerCase();
    
    return wishlists.filter(wishlist => {
      const searchableText = [
        wishlist.name,
        wishlist.description || '',
        ...wishlist.tags,
        ...wishlist.categories,
        ...wishlist.items.map(item => item.productName),
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm);
    });
  },
};

/**
 * Default wishlist values
 */
export const defaultWishlist: Partial<Wishlist> = {
  name: 'My Wishlist',
  type: 'default',
  status: 'active',
  visibility: 'private',
  items: [],
  categories: [],
  tags: [],
  sortOrder: 0,
  sharing: {
    isPublic: false,
    sharedWith: [],
    shareSettings: {
      allowComments: false,
      allowCopy: true,
      allowPurchase: true,
      requireAuth: false,
    },
    shareCount: 0,
    views: 0,
    uniqueViews: 0,
  },
  notifications: {
    priceDrops: true,
    backInStock: true,
    saleAlerts: true,
    reminders: false,
    sharing: true,
  },
  settings: {
    autoRemoveOutOfStock: false,
    autoRemovePurchased: false,
    maxItems: 1000,
    defaultPriority: 'medium',
    sortBy: 'added_date',
    sortOrder: 'desc',
    showPrices: true,
    showNotes: true,
    compactView: false,
  },
  customFields: {},
};

const WishlistModel = {
  WishlistSchema,
  CreateWishlistSchema,
  UpdateWishlistSchema,
  AddWishlistItemSchema,
  WishlistFilterSchema,
  WishlistStatsSchema,
  WishlistItemSchema,
  WishlistAnalyticsSchema,
  WishlistSharingSchema,
  validateWishlist,
  validateCreateWishlist,
  validateUpdateWishlist,
  validateAddWishlistItem,
  validateWishlistFilter,
  wishlistUtils,
  defaultWishlist,
};

export default WishlistModel;