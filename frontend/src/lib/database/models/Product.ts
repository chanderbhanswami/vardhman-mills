/**
 * Product Model - Comprehensive e-commerce product management
 * Frontend-optimized with full TypeScript support and validation
 */

import { ObjectId } from 'mongodb';
import { z } from 'zod';

/**
 * Product Image Schema
 */
export const ProductImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  alt: z.string(),
  caption: z.string().optional(),
  width: z.number().positive(),
  height: z.number().positive(),
  size: z.number().positive(), // File size in bytes
  format: z.enum(['jpg', 'jpeg', 'png', 'webp', 'avif']),
  isMain: z.boolean().default(false),
  sortOrder: z.number().default(0),
  cloudinaryPublicId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ProductImage = z.infer<typeof ProductImageSchema>;

/**
 * Product Variant Schema
 */
export const ProductVariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  barcode: z.string().optional(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.enum(['cm', 'inch', 'mm']).default('cm'),
  }).optional(),
  inventory: z.object({
    quantity: z.number().nonnegative().default(0),
    reserved: z.number().nonnegative().default(0),
    available: z.number().nonnegative().default(0),
    lowStockThreshold: z.number().nonnegative().default(5),
    trackInventory: z.boolean().default(true),
    allowBackorder: z.boolean().default(false),
    stockStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued']).default('in_stock'),
  }),
  attributes: z.record(z.string(), z.string()), // e.g., { color: 'red', size: 'L' }
  images: z.array(ProductImageSchema).default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ProductVariant = z.infer<typeof ProductVariantSchema>;

/**
 * Product SEO Schema
 */
export const ProductSEOSchema = z.object({
  title: z.string().max(60, 'SEO title too long').optional(),
  description: z.string().max(160, 'SEO description too long').optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  keywords: z.array(z.string()).default([]),
  canonical: z.string().url().optional(),
  noindex: z.boolean().default(false),
  nofollow: z.boolean().default(false),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().url().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().url().optional(),
  structuredData: z.record(z.string(), z.unknown()).optional(),
});

export type ProductSEO = z.infer<typeof ProductSEOSchema>;

/**
 * Product Shipping Schema
 */
export const ProductShippingSchema = z.object({
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.enum(['cm', 'inch', 'mm']).default('cm'),
  }).optional(),
  shippingClass: z.string().optional(),
  freeShipping: z.boolean().default(false),
  separateShipping: z.boolean().default(false),
  shippingCost: z.number().nonnegative().optional(),
  handlingTime: z.object({
    min: z.number().nonnegative().default(1),
    max: z.number().nonnegative().default(3),
    unit: z.enum(['days', 'weeks']).default('days'),
  }).optional(),
  restrictions: z.object({
    countries: z.array(z.string()).optional(),
    states: z.array(z.string()).optional(),
    hazardous: z.boolean().default(false),
    fragile: z.boolean().default(false),
    perishable: z.boolean().default(false),
  }).optional(),
});

export type ProductShipping = z.infer<typeof ProductShippingSchema>;

/**
 * Product Analytics Schema
 */
export const ProductAnalyticsSchema = z.object({
  views: z.number().nonnegative().default(0),
  purchases: z.number().nonnegative().default(0),
  addToCart: z.number().nonnegative().default(0),
  addToWishlist: z.number().nonnegative().default(0),
  shares: z.number().nonnegative().default(0),
  reviews: z.number().nonnegative().default(0),
  averageRating: z.number().min(0).max(5).default(0),
  totalRating: z.number().nonnegative().default(0),
  conversionRate: z.number().min(0).max(1).default(0),
  revenue: z.number().nonnegative().default(0),
  refunds: z.number().nonnegative().default(0),
  returns: z.number().nonnegative().default(0),
  lastViewed: z.date().optional(),
  lastPurchased: z.date().optional(),
  popularityScore: z.number().nonnegative().default(0),
  trendingScore: z.number().nonnegative().default(0),
  searchRanking: z.number().nonnegative().default(0),
  seasonalityData: z.array(z.object({
    month: z.number().min(1).max(12),
    multiplier: z.number().positive().default(1),
  })).optional(),
  competitorPricing: z.array(z.object({
    competitor: z.string(),
    price: z.number().positive(),
    url: z.string().url().optional(),
    lastUpdated: z.date(),
  })).optional(),
});

export type ProductAnalytics = z.infer<typeof ProductAnalyticsSchema>;

/**
 * Main Product Schema
 */
export const ProductSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string().min(1, 'Product name is required').max(200, 'Product name too long'),
  description: z.string().min(10, 'Description too short').max(5000, 'Description too long'),
  shortDescription: z.string().max(500, 'Short description too long').optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  brand: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  category: z.string().min(1, 'Category is required'), // Category ID
  subcategories: z.array(z.string()).default([]), // Subcategory IDs
  tags: z.array(z.string()).default([]),
  type: z.enum(['simple', 'variable', 'digital', 'subscription', 'bundle']).default('simple'),
  status: z.enum(['active', 'inactive', 'draft', 'archived', 'out_of_stock']).default('draft'),
  visibility: z.enum(['public', 'private', 'password_protected', 'hidden']).default('public'),
  password: z.string().optional(), // For password-protected products
  featured: z.boolean().default(false),
  price: z.number().positive().optional(), // Base price for simple products
  salePrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  currency: z.string().default('INR'),
  taxable: z.boolean().default(true),
  taxClass: z.string().optional(),
  variants: z.array(ProductVariantSchema).default([]),
  images: z.array(ProductImageSchema).default([]),
  gallery: z.array(ProductImageSchema).default([]),
  attributes: z.record(z.string(), z.union([z.string(), z.array(z.string())])).default({}),
  specifications: z.record(z.string(), z.string()).default({}),
  features: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  usageInstructions: z.string().optional(),
  warranty: z.object({
    duration: z.number().positive().optional(),
    unit: z.enum(['days', 'months', 'years']).optional(),
    description: z.string().optional(),
    provider: z.string().optional(),
    coverage: z.array(z.string()).optional(),
  }).optional(),
  inventory: z.object({
    quantity: z.number().nonnegative().default(0),
    reserved: z.number().nonnegative().default(0),
    available: z.number().nonnegative().default(0),
    lowStockThreshold: z.number().nonnegative().default(5),
    trackInventory: z.boolean().default(true),
    allowBackorder: z.boolean().default(false),
    stockStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued']).default('in_stock'),
    locations: z.array(z.object({
      warehouse: z.string(),
      quantity: z.number().nonnegative(),
    })).default([]),
  }),
  seo: ProductSEOSchema,
  shipping: ProductShippingSchema.default(() => ({
    freeShipping: false,
    separateShipping: false,
  })),
  analytics: ProductAnalyticsSchema.default(() => ({
    views: 0,
    purchases: 0,
    addToCart: 0,
    addToWishlist: 0,
    shares: 0,
    reviews: 0,
    averageRating: 0,
    totalRating: 0,
    conversionRate: 0,
    revenue: 0,
    refunds: 0,
    returns: 0,
    popularityScore: 0,
    trendingScore: 0,
    searchRanking: 0,
  })),
  relatedProducts: z.array(z.string()).default([]), // Product IDs
  crossSells: z.array(z.string()).default([]), // Product IDs
  upSells: z.array(z.string()).default([]), // Product IDs
  bundleProducts: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive().default(1),
    discount: z.number().min(0).max(100).default(0),
  })).default([]),
  customFields: z.record(z.string(), z.unknown()).default({}),
  downloadableFiles: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url(),
    fileSize: z.number().positive(),
    downloadLimit: z.number().positive().optional(),
    expirationDays: z.number().positive().optional(),
  })).default([]),
  subscriptionOptions: z.object({
    billingInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
    billingIntervalCount: z.number().positive().default(1),
    trialPeriod: z.number().nonnegative().default(0),
    trialPeriodUnit: z.enum(['days', 'weeks', 'months']).default('days'),
    setupFee: z.number().nonnegative().default(0),
    cancellationPolicy: z.string().optional(),
  }).optional(),
  restrictions: z.object({
    ageRestriction: z.number().positive().optional(),
    locationRestrictions: z.array(z.string()).optional(),
    requiresVerification: z.boolean().default(false),
    maxQuantityPerOrder: z.number().positive().optional(),
    minQuantityPerOrder: z.number().positive().default(1),
  }).optional(),
  qualityAssurance: z.object({
    certifications: z.array(z.string()).default([]),
    testReports: z.array(z.object({
      name: z.string(),
      url: z.string().url(),
      date: z.date(),
    })).default([]),
    complianceStandards: z.array(z.string()).default([]),
    safetyWarnings: z.array(z.string()).default([]),
  }).optional(),
  sustainability: z.object({
    ecoFriendly: z.boolean().default(false),
    recyclable: z.boolean().default(false),
    carbonNeutral: z.boolean().default(false),
    sustainabilityScore: z.number().min(0).max(100).optional(),
    certifications: z.array(z.string()).default([]),
    packagingMaterial: z.string().optional(),
  }).optional(),
  availability: z.object({
    availableFrom: z.date().optional(),
    availableUntil: z.date().optional(),
    preOrder: z.boolean().default(false),
    preOrderDate: z.date().optional(),
    backOrder: z.boolean().default(false),
    estimatedRestockDate: z.date().optional(),
    seasonalAvailability: z.array(z.object({
      season: z.string(),
      available: z.boolean(),
    })).optional(),
  }).optional(),
  pricing: z.object({
    msrp: z.number().positive().optional(), // Manufacturer's Suggested Retail Price
    wholesalePrice: z.number().positive().optional(),
    discountRules: z.array(z.object({
      type: z.enum(['percentage', 'fixed', 'bogo', 'volume']),
      value: z.number().positive(),
      conditions: z.record(z.string(), z.unknown()),
      validFrom: z.date().optional(),
      validUntil: z.date().optional(),
    })).default([]),
    priceHistory: z.array(z.object({
      price: z.number().positive(),
      date: z.date(),
      reason: z.string().optional(),
    })).default([]),
    dynamicPricing: z.object({
      enabled: z.boolean().default(false),
      rules: z.array(z.record(z.string(), z.unknown())).default([]),
    }).optional(),
  }).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdBy: z.string().optional(), // User ID
  updatedBy: z.string().optional(), // User ID
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  publishedAt: z.date().optional(),
  deletedAt: z.date().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

/**
 * Create Product Schema
 */
export const CreateProductSchema = ProductSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  deletedAt: true,
}).extend({
  publishNow: z.boolean().default(false),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

/**
 * Update Product Schema
 */
export const UpdateProductSchema = ProductSchema.partial().omit({
  _id: true,
  createdAt: true,
});

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

/**
 * Product Filter Schema
 */
export const ProductFilterSchema = z.object({
  category: z.string().optional(),
  subcategories: z.array(z.string()).optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'draft', 'archived', 'out_of_stock']).optional(),
  type: z.enum(['simple', 'variable', 'digital', 'subscription', 'bundle']).optional(),
  featured: z.boolean().optional(),
  inStock: z.boolean().optional(),
  onSale: z.boolean().optional(),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().nonnegative().optional(),
  rating: z.number().min(0).max(5).optional(),
  availability: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'pre_order', 'back_order']).optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  search: z.string().optional(),
  attributes: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum([
    'name', 'price', 'createdAt', 'updatedAt', 'popularity', 'rating', 'sales', 'views'
  ]).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeVariants: z.boolean().default(false),
  includeImages: z.boolean().default(true),
  includeAnalytics: z.boolean().default(false),
});

export type ProductFilter = z.infer<typeof ProductFilterSchema>;

/**
 * Product Search Schema
 */
export const ProductSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: ProductFilterSchema.omit({ search: true }).optional(),
  facets: z.array(z.enum([
    'category', 'brand', 'price', 'rating', 'availability', 'attributes'
  ])).optional(),
  suggestions: z.boolean().default(false),
  typoTolerance: z.boolean().default(true),
  synonyms: z.boolean().default(true),
});

export type ProductSearchInput = z.infer<typeof ProductSearchSchema>;

/**
 * Product Bulk Update Schema
 */
export const ProductBulkUpdateSchema = z.object({
  productIds: z.array(z.string()).min(1, 'At least one product ID is required'),
  updates: UpdateProductSchema,
  operation: z.enum(['update', 'delete', 'archive', 'activate', 'feature', 'unfeature']),
});

export type ProductBulkUpdateInput = z.infer<typeof ProductBulkUpdateSchema>;

/**
 * Product Import Schema
 */
export const ProductImportSchema = z.object({
  products: z.array(CreateProductSchema),
  updateExisting: z.boolean().default(false),
  skipErrors: z.boolean().default(false),
  dryRun: z.boolean().default(false),
});

export type ProductImportInput = z.infer<typeof ProductImportSchema>;

/**
 * Product Export Schema
 */
export const ProductExportSchema = z.object({
  filters: ProductFilterSchema.optional(),
  format: z.enum(['csv', 'xlsx', 'json']).default('csv'),
  fields: z.array(z.string()).optional(),
  includeVariants: z.boolean().default(true),
  includeImages: z.boolean().default(false),
});

export type ProductExportInput = z.infer<typeof ProductExportSchema>;

/**
 * Validation functions
 */
export const validateProduct = (data: unknown): Product => {
  return ProductSchema.parse(data);
};

export const validateCreateProduct = (data: unknown): CreateProductInput => {
  return CreateProductSchema.parse(data);
};

export const validateUpdateProduct = (data: unknown): UpdateProductInput => {
  return UpdateProductSchema.parse(data);
};

export const validateProductFilter = (data: unknown): ProductFilter => {
  return ProductFilterSchema.parse(data);
};

export const validateProductSearch = (data: unknown): ProductSearchInput => {
  return ProductSearchSchema.parse(data);
};

export const validateProductBulkUpdate = (data: unknown): ProductBulkUpdateInput => {
  return ProductBulkUpdateSchema.parse(data);
};

export const validateProductImport = (data: unknown): ProductImportInput => {
  return ProductImportSchema.parse(data);
};

export const validateProductExport = (data: unknown): ProductExportInput => {
  return ProductExportSchema.parse(data);
};

/**
 * Product utility functions
 */
export const productUtils = {
  /**
   * Calculate final price including sale price
   */
  getFinalPrice: (product: Product, variantId?: string): number => {
    if (product.type === 'variable' && variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) {
        return variant.salePrice || variant.price;
      }
    }
    
    if (product.type === 'simple') {
      return product.salePrice || product.price || 0;
    }
    
    // For variable products without variant, return base price
    return product.salePrice || product.price || 0;
  },

  /**
   * Calculate discount percentage
   */
  getDiscountPercentage: (product: Product, variantId?: string): number => {
    const originalPrice = product.type === 'variable' && variantId
      ? product.variants.find(v => v.id === variantId)?.price || 0
      : product.price || 0;
      
    const salePrice = product.type === 'variable' && variantId
      ? product.variants.find(v => v.id === variantId)?.salePrice
      : product.salePrice;

    if (!salePrice || salePrice >= originalPrice) return 0;
    
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  },

  /**
   * Check if product is on sale
   */
  isOnSale: (product: Product, variantId?: string): boolean => {
    if (product.type === 'variable' && variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      return variant ? !!variant.salePrice && variant.salePrice < variant.price : false;
    }
    
    return !!product.salePrice && product.salePrice < (product.price || 0);
  },

  /**
   * Check if product is in stock
   */
  isInStock: (product: Product, variantId?: string): boolean => {
    if (product.type === 'variable' && variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      return variant ? variant.inventory.available > 0 : false;
    }
    
    return product.inventory.available > 0;
  },

  /**
   * Get stock status
   */
  getStockStatus: (product: Product, variantId?: string): string => {
    const inventory = product.type === 'variable' && variantId
      ? product.variants.find(v => v.id === variantId)?.inventory
      : product.inventory;

    if (!inventory) return 'out_of_stock';
    
    if (inventory.available <= 0) return 'out_of_stock';
    if (inventory.available <= inventory.lowStockThreshold) return 'low_stock';
    return 'in_stock';
  },

  /**
   * Get main product image
   */
  getMainImage: (product: Product): ProductImage | null => {
    const mainImage = product.images.find(img => img.isMain);
    return mainImage || product.images[0] || null;
  },

  /**
   * Get all product images including variants
   */
  getAllImages: (product: Product, variantId?: string): ProductImage[] => {
    let images = [...product.images];
    
    if (product.type === 'variable' && variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant && variant.images.length > 0) {
        images = [...variant.images, ...images];
      }
    }
    
    return images.sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0) || a.sortOrder - b.sortOrder);
  },

  /**
   * Get product rating summary
   */
  getRatingSummary: (product: Product) => {
    return {
      average: product.analytics.averageRating,
      total: product.analytics.reviews,
      distribution: {
        5: 0, // This would be calculated from actual reviews
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    };
  },

  /**
   * Format product for display
   */
  formatForDisplay: (product: Product, variantId?: string) => {
    const finalPrice = productUtils.getFinalPrice(product, variantId);
    const originalPrice = product.type === 'variable' && variantId
      ? product.variants.find(v => v.id === variantId)?.price || 0
      : product.price || 0;
    
    return {
      id: product._id?.toString(),
      name: product.name,
      description: product.shortDescription || product.description,
      slug: product.seo.slug,
      image: productUtils.getMainImage(product),
      images: productUtils.getAllImages(product, variantId),
      price: {
        current: finalPrice,
        original: originalPrice,
        currency: product.currency,
        formatted: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: product.currency,
        }).format(finalPrice),
      },
      discount: {
        percentage: productUtils.getDiscountPercentage(product, variantId),
        amount: originalPrice - finalPrice,
        isOnSale: productUtils.isOnSale(product, variantId),
      },
      stock: {
        status: productUtils.getStockStatus(product, variantId),
        quantity: product.type === 'variable' && variantId
          ? product.variants.find(v => v.id === variantId)?.inventory.available || 0
          : product.inventory.available,
        inStock: productUtils.isInStock(product, variantId),
      },
      rating: productUtils.getRatingSummary(product),
      badges: productUtils.getBadges(product),
      features: product.features,
      brand: product.brand,
      category: product.category,
      tags: product.tags,
      featured: product.featured,
      variants: product.variants.map(v => ({
        id: v.id,
        name: v.name,
        attributes: v.attributes,
        price: v.salePrice || v.price,
        inStock: v.inventory.available > 0,
      })),
    };
  },

  /**
   * Get product badges
   */
  getBadges: (product: Product): string[] => {
    const badges: string[] = [];
    
    if (product.featured) badges.push('Featured');
    if (productUtils.isOnSale(product)) badges.push('Sale');
    // Check if product is newly created (within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (product.createdAt > thirtyDaysAgo) badges.push('New');
    if (product.sustainability?.ecoFriendly) badges.push('Eco-Friendly');
    if (product.analytics.averageRating >= 4.5) badges.push('Top Rated');
    if (product.inventory.quantity <= product.inventory.lowStockThreshold) {
      badges.push('Limited Stock');
    }
    
    return badges;
  },

  /**
   * Generate product URL
   */
  generateUrl: (product: Product, baseUrl: string = ''): string => {
    return `${baseUrl}/products/${product.seo.slug}`;
  },

  /**
   * Check if product is available
   */
  isAvailable: (product: Product): boolean => {
    const now = new Date();
    
    if (product.status !== 'active') return false;
    if (product.availability?.availableFrom && product.availability.availableFrom > now) return false;
    if (product.availability?.availableUntil && product.availability.availableUntil < now) return false;
    
    return true;
  },

  /**
   * Get product variants with stock
   */
  getAvailableVariants: (product: Product): ProductVariant[] => {
    return product.variants.filter(variant => 
      variant.isActive && variant.inventory.available > 0
    );
  },

  /**
   * Calculate shipping for product
   */
  calculateShipping: (product: Product, quantity: number = 1): number => {
    if (product.shipping.freeShipping) return 0;
    return (product.shipping.shippingCost || 0) * quantity;
  },

  /**
   * Get product attributes for filtering
   */
  getFilterableAttributes: (product: Product): Record<string, string[]> => {
    const attributes: Record<string, string[]> = {};
    
    // Add product-level attributes
    Object.entries(product.attributes).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        attributes[key] = value;
      } else {
        attributes[key] = [value];
      }
    });
    
    // Add variant attributes
    product.variants.forEach(variant => {
      Object.entries(variant.attributes).forEach(([key, value]) => {
        if (!attributes[key]) {
          attributes[key] = [];
        }
        if (!attributes[key].includes(value)) {
          attributes[key].push(value);
        }
      });
    });
    
    return attributes;
  },

  /**
   * Search products by query
   */
  searchScore: (product: Product, query: string): number => {
    const searchableText = [
      product.name,
      product.description,
      product.shortDescription || '',
      product.brand || '',
      ...product.tags,
      ...product.features,
      Object.values(product.attributes).flat(),
    ].join(' ').toLowerCase();
    
    const queryLower = query.toLowerCase();
    const words = queryLower.split(' ');
    
    let score = 0;
    
    // Exact match in name gets highest score
    if (product.name.toLowerCase().includes(queryLower)) {
      score += 100;
    }
    
    // Partial matches in name
    words.forEach(word => {
      if (product.name.toLowerCase().includes(word)) {
        score += 50;
      }
    });
    
    // Matches in other fields
    words.forEach(word => {
      const occurrences = (searchableText.match(new RegExp(word, 'g')) || []).length;
      score += occurrences * 10;
    });
    
    return score;
  },

  /**
   * Generate product SEO data
   */
  generateSEOData: (product: Product) => {
    const baseTitle = product.seo.title || product.name;
    const baseDescription = product.seo.description || product.shortDescription || product.description.substring(0, 160);
    
    return {
      title: `${baseTitle} | Vardhman Mills`,
      description: baseDescription,
      keywords: product.seo.keywords.join(', '),
      ogTitle: product.seo.ogTitle || baseTitle,
      ogDescription: product.seo.ogDescription || baseDescription,
      ogImage: product.seo.ogImage || productUtils.getMainImage(product)?.url,
      twitterTitle: product.seo.twitterTitle || baseTitle,
      twitterDescription: product.seo.twitterDescription || baseDescription,
      twitterImage: product.seo.twitterImage || productUtils.getMainImage(product)?.url,
      canonical: product.seo.canonical || productUtils.generateUrl(product),
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
        offers: {
          '@type': 'Offer',
          price: productUtils.getFinalPrice(product),
          priceCurrency: product.currency,
          availability: productUtils.isInStock(product) 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
        },
        aggregateRating: product.analytics.reviews > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: product.analytics.averageRating,
          reviewCount: product.analytics.reviews,
        } : undefined,
        image: productUtils.getAllImages(product).map(img => img.url),
      },
    };
  },
};

/**
 * Default product values
 */
export const defaultProduct: Partial<Product> = {
  type: 'simple',
  status: 'draft',
  visibility: 'public',
  featured: false,
  currency: 'INR',
  taxable: true,
  variants: [],
  images: [],
  gallery: [],
  attributes: {},
  specifications: {},
  features: [],
  benefits: [],
  inventory: {
    quantity: 0,
    reserved: 0,
    available: 0,
    lowStockThreshold: 5,
    trackInventory: true,
    allowBackorder: false,
    stockStatus: 'out_of_stock',
    locations: [],
  },
  shipping: {
    weight: undefined,
    dimensions: undefined,
    freeShipping: false,
    separateShipping: false,
  },
  analytics: {
    views: 0,
    purchases: 0,
    addToCart: 0,
    addToWishlist: 0,
    shares: 0,
    reviews: 0,
    averageRating: 0,
    totalRating: 0,
    conversionRate: 0,
    revenue: 0,
    refunds: 0,
    returns: 0,
    popularityScore: 0,
    trendingScore: 0,
    searchRanking: 0,
  },
  relatedProducts: [],
  crossSells: [],
  upSells: [],
  bundleProducts: [],
  customFields: {},
  downloadableFiles: [],
  tags: [],
};

const ProductModel = {
  ProductSchema,
  CreateProductSchema,
  UpdateProductSchema,
  ProductFilterSchema,
  ProductSearchSchema,
  ProductBulkUpdateSchema,
  ProductImportSchema,
  ProductExportSchema,
  ProductImageSchema,
  ProductVariantSchema,
  ProductSEOSchema,
  ProductShippingSchema,
  ProductAnalyticsSchema,
  validateProduct,
  validateCreateProduct,
  validateUpdateProduct,
  validateProductFilter,
  validateProductSearch,
  validateProductBulkUpdate,
  validateProductImport,
  validateProductExport,
  productUtils,
  defaultProduct,
};

export default ProductModel;