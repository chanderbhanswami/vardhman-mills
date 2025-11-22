/**
 * Product Schemas for Vardhman Mills Frontend
 * Zod schemas for product creation, management, and catalog operations
 */

import { z } from 'zod';

// Product variant schema
export const productVariantSchema = z.object({
  sku: z
    .string()
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU must not exceed 50 characters')
    .regex(/^[A-Z0-9-_]+$/, 'SKU can only contain uppercase letters, numbers, hyphens, and underscores')
    .transform(val => val.toUpperCase()),
  
  name: z
    .string()
    .min(2, 'Variant name must be at least 2 characters')
    .max(100, 'Variant name must not exceed 100 characters')
    .transform(val => val.trim()),
  
  specifications: z.object({
    color: z.string().max(50).optional(),
    size: z.string().max(50).optional(),
    material: z.string().max(100).optional(),
    pattern: z.string().max(100).optional(),
    weight: z.number().min(0).optional(),
    dimensions: z.object({
      length: z.number().min(0),
      width: z.number().min(0),
      height: z.number().min(0),
      unit: z.enum(['cm', 'inch', 'mm']).default('cm'),
    }).optional(),
    threadCount: z.number().min(1).max(2000).optional(),
    gsm: z.number().min(1).max(1000).optional(),
  }).optional(),
  
  pricing: z.object({
    cost: z.number().min(0, 'Cost must be non-negative'),
    price: z.number().min(0, 'Price must be non-negative'),
    salePrice: z.number().min(0, 'Sale price must be non-negative').optional(),
    wholesale: z.number().min(0, 'Wholesale price must be non-negative').optional(),
    margin: z.number().min(0).max(100).optional(),
  }),
  
  inventory: z.object({
    quantity: z.number().min(0, 'Quantity must be non-negative').int(),
    reserved: z.number().min(0, 'Reserved quantity must be non-negative').int().default(0),
    available: z.number().min(0, 'Available quantity must be non-negative').int(),
    lowStockThreshold: z.number().min(0).int().default(10),
    trackInventory: z.boolean().default(true),
    allowBackorder: z.boolean().default(false),
  }),
  
  images: z
    .array(z.object({
      url: z.string().url('Invalid image URL'),
      alt: z.string().max(200).optional(),
      isPrimary: z.boolean().default(false),
      sortOrder: z.number().min(0).int().default(0),
    }))
    .max(10, 'Maximum 10 images allowed per variant'),
  
  isActive: z.boolean().default(true),
  
  isDefault: z.boolean().default(false),
}).refine(
  data => {
    if (data.pricing.salePrice && data.pricing.salePrice >= data.pricing.price) {
      return false;
    }
    return true;
  },
  {
    message: 'Sale price must be less than regular price',
    path: ['pricing', 'salePrice'],
  }
).refine(
  data => {
    if (data.inventory.trackInventory) {
      return data.inventory.available <= data.inventory.quantity - data.inventory.reserved;
    }
    return true;
  },
  {
    message: 'Available quantity cannot exceed total quantity minus reserved',
    path: ['inventory', 'available'],
  }
);

export type ProductVariantData = z.infer<typeof productVariantSchema>;

// Product category schema
export const productCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must not exceed 100 characters')
    .transform(val => val.trim()),
  
  slug: z
    .string()
    .min(2, 'Category slug must be at least 2 characters')
    .max(100, 'Category slug must not exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .transform(val => val.toLowerCase()),
  
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  parentId: z.string().optional(),
  
  level: z.number().min(0).max(5).int().default(0),
  
  sortOrder: z.number().min(0).int().default(0),
  
  image: z.object({
    url: z.string().url('Invalid image URL'),
    alt: z.string().max(200).optional(),
  }).optional(),
  
  seo: z.object({
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    keywords: z.array(z.string().max(50)).max(20).optional(),
  }).optional(),
  
  isActive: z.boolean().default(true),
  
  isFeatured: z.boolean().default(false),
});

export type ProductCategoryData = z.infer<typeof productCategorySchema>;

// Product creation schema
export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(200, 'Product name must not exceed 200 characters')
    .transform(val => val.trim()),
  
  slug: z
    .string()
    .min(3, 'Product slug must be at least 3 characters')
    .max(200, 'Product slug must not exceed 200 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .transform(val => val.toLowerCase()),
  
  shortDescription: z
    .string()
    .min(10, 'Short description must be at least 10 characters')
    .max(300, 'Short description must not exceed 300 characters')
    .transform(val => val.trim()),
  
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must not exceed 5000 characters')
    .transform(val => val.trim()),
  
  features: z
    .array(z.string().min(1).max(200))
    .max(20, 'Maximum 20 features allowed')
    .optional(),
  
  specifications: z.record(z.string(), z.string()).optional(),
  
  categories: z
    .array(z.string().min(1))
    .min(1, 'At least one category is required')
    .max(10, 'Maximum 10 categories allowed'),
  
  tags: z
    .array(z.string().min(1).max(50))
    .max(20, 'Maximum 20 tags allowed')
    .optional(),
  
  brand: z
    .string()
    .min(1, 'Brand is required')
    .max(100, 'Brand must not exceed 100 characters')
    .transform(val => val.trim()),
  
  manufacturer: z
    .string()
    .max(100, 'Manufacturer must not exceed 100 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  variants: z
    .array(productVariantSchema)
    .min(1, 'At least one variant is required')
    .max(50, 'Maximum 50 variants allowed'),
  
  images: z
    .array(z.object({
      url: z.string().url('Invalid image URL'),
      alt: z.string().max(200).optional(),
      isPrimary: z.boolean().default(false),
      sortOrder: z.number().min(0).int().default(0),
    }))
    .min(1, 'At least one image is required')
    .max(20, 'Maximum 20 images allowed'),
  
  seo: z.object({
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    keywords: z.array(z.string().max(50)).max(20).optional(),
    canonicalUrl: z.string().url().optional(),
  }).optional(),
  
  shipping: z.object({
    weight: z.number().min(0, 'Weight must be non-negative'),
    dimensions: z.object({
      length: z.number().min(0),
      width: z.number().min(0),
      height: z.number().min(0),
      unit: z.enum(['cm', 'inch', 'mm']).default('cm'),
    }),
    fragile: z.boolean().default(false),
    hazardous: z.boolean().default(false),
    requiresSpecialHandling: z.boolean().default(false),
    freeShipping: z.boolean().default(false),
    shippingClass: z.string().max(50).optional(),
  }),
  
  pricing: z.object({
    minPrice: z.number().min(0, 'Minimum price must be non-negative'),
    maxPrice: z.number().min(0, 'Maximum price must be non-negative'),
    taxClass: z.string().max(50).optional(),
    taxable: z.boolean().default(true),
  }),
  
  availability: z.object({
    status: z.enum(['in_stock', 'out_of_stock', 'backorder', 'discontinued']).default('in_stock'),
    launchDate: z.date().optional(),
    discontinueDate: z.date().optional(),
    preOrder: z.boolean().default(false),
    preOrderDate: z.date().optional(),
  }),
  
  customization: z.object({
    allowCustomization: z.boolean().default(false),
    customFields: z.array(z.object({
      name: z.string().min(1).max(100),
      type: z.enum(['text', 'textarea', 'select', 'multiselect', 'number', 'date', 'file']),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
      validation: z.string().optional(),
    })).max(10).optional(),
    customizationFee: z.number().min(0).optional(),
  }).optional(),
  
  bulk: z.object({
    allowBulkOrder: z.boolean().default(false),
    minBulkQuantity: z.number().min(1).int().optional(),
    bulkDiscounts: z.array(z.object({
      quantity: z.number().min(1).int(),
      discount: z.number().min(0).max(100),
      type: z.enum(['percentage', 'fixed']).default('percentage'),
    })).max(5).optional(),
  }).optional(),
  
  isActive: z.boolean().default(true),
  
  isFeatured: z.boolean().default(false),
  
  isDigital: z.boolean().default(false),
  
  requiresShipping: z.boolean().default(true),
}).refine(
  data => data.pricing.minPrice <= data.pricing.maxPrice,
  {
    message: 'Minimum price must be less than or equal to maximum price',
    path: ['pricing', 'maxPrice'],
  }
).refine(
  data => {
    const primaryImages = data.images.filter(img => img.isPrimary);
    return primaryImages.length <= 1;
  },
  {
    message: 'Only one image can be marked as primary',
    path: ['images'],
  }
).refine(
  data => {
    if (data.availability.preOrder && !data.availability.preOrderDate) {
      return false;
    }
    return true;
  },
  {
    message: 'Pre-order date is required for pre-order products',
    path: ['availability', 'preOrderDate'],
  }
);

export type CreateProductData = z.infer<typeof createProductSchema>;

// Product update schema
export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().min(1, 'Product ID is required'),
});

export type UpdateProductData = z.infer<typeof updateProductSchema>;

// Product search/filter schema
export const productSearchSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query too long')
    .optional(),
  
  filters: z.object({
    categories: z.array(z.string()).optional(),
    
    brands: z.array(z.string()).optional(),
    
    priceRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
    }).refine(
      data => data.min <= data.max,
      'Minimum price must be less than or equal to maximum price'
    ).optional(),
    
    inStock: z.boolean().optional(),
    
    onSale: z.boolean().optional(),
    
    featured: z.boolean().optional(),
    
    ratings: z.object({
      min: z.number().min(0).max(5),
      max: z.number().min(0).max(5),
    }).refine(
      data => data.min <= data.max,
      'Minimum rating must be less than or equal to maximum rating'
    ).optional(),
    
    attributes: z.record(z.string(), z.array(z.string())).optional(),
    
    tags: z.array(z.string()).optional(),
    
    availability: z.array(z.enum([
      'in_stock',
      'out_of_stock',
      'backorder',
      'discontinued'
    ])).optional(),
    
    dateRange: z.object({
      startDate: z.date(),
      endDate: z.date(),
    }).refine(
      data => data.startDate <= data.endDate,
      'Start date must be before or equal to end date'
    ).optional(),
    
    hasImages: z.boolean().optional(),
    
    hasVariants: z.boolean().optional(),
    
    isDigital: z.boolean().optional(),
    
    requiresShipping: z.boolean().optional(),
    
    freeShipping: z.boolean().optional(),
    
    customizable: z.boolean().optional(),
    
    bulkOrdersAllowed: z.boolean().optional(),
  }).optional(),
  
  sortBy: z.enum([
    'relevance',
    'name_asc',
    'name_desc',
    'price_asc',
    'price_desc',
    'rating_desc',
    'date_desc',
    'date_asc',
    'popularity',
    'sales_desc'
  ]).default('relevance'),
  
  page: z.number().min(1).default(1),
  
  limit: z.number().min(1).max(100).default(20),
  
  includeVariants: z.boolean().default(false),
  
  includeCategories: z.boolean().default(false),
  
  includeReviews: z.boolean().default(false),
});

export type ProductSearchData = z.infer<typeof productSearchSchema>;

// Product review schema
export const productReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  
  variantId: z.string().optional(),
  
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5')
    .int('Rating must be a whole number'),
  
  title: z
    .string()
    .min(5, 'Review title must be at least 5 characters')
    .max(100, 'Review title must not exceed 100 characters')
    .transform(val => val.trim()),
  
  comment: z
    .string()
    .min(10, 'Review comment must be at least 10 characters')
    .max(2000, 'Review comment must not exceed 2000 characters')
    .transform(val => val.trim()),
  
  pros: z
    .array(z.string().min(1).max(200))
    .max(10, 'Maximum 10 pros allowed')
    .optional(),
  
  cons: z
    .array(z.string().min(1).max(200))
    .max(10, 'Maximum 10 cons allowed')
    .optional(),
  
  images: z
    .array(z.instanceof(File))
    .max(5, 'Maximum 5 images allowed')
    .optional(),
  
  verified: z.boolean().default(false),
  
  anonymous: z.boolean().default(false),
  
  wouldRecommend: z.boolean().optional(),
  
  usageContext: z.enum([
    'personal',
    'business',
    'gift',
    'professional',
    'other'
  ]).optional(),
  
  purchaseDate: z.date().optional(),
});

export type ProductReviewData = z.infer<typeof productReviewSchema>;

// Product comparison schema
export const productComparisonSchema = z.object({
  productIds: z
    .array(z.string().min(1))
    .min(2, 'At least 2 products required for comparison')
    .max(4, 'Maximum 4 products allowed for comparison'),
  
  attributes: z
    .array(z.string().min(1))
    .min(1, 'At least one attribute required')
    .max(20, 'Maximum 20 attributes allowed')
    .optional(),
  
  includeVariants: z.boolean().default(false),
  
  includeReviews: z.boolean().default(false),
  
  includePricing: z.boolean().default(true),
});

export type ProductComparisonData = z.infer<typeof productComparisonSchema>;

// Product analytics schema
export const productAnalyticsSchema = z.object({
  productIds: z.array(z.string().min(1)).optional(),
  
  categoryIds: z.array(z.string().min(1)).optional(),
  
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }).refine(
    data => data.startDate <= data.endDate,
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  ),
  
  metrics: z
    .array(z.enum([
      'views',
      'sales',
      'revenue',
      'conversion_rate',
      'cart_additions',
      'wishlist_additions',
      'reviews',
      'average_rating',
      'return_rate',
      'inventory_turnover'
    ]))
    .min(1, 'At least one metric is required')
    .max(10, 'Too many metrics selected'),
  
  groupBy: z.enum(['day', 'week', 'month', 'quarter']).default('day'),
  
  segmentBy: z.enum([
    'category',
    'brand',
    'price_range',
    'customer_segment',
    'location',
    'device'
  ]).optional(),
  
  includeComparison: z.boolean().default(false),
  
  includeDetails: z.boolean().default(false),
});

export type ProductAnalyticsData = z.infer<typeof productAnalyticsSchema>;

// Bulk product operations schema
export const bulkProductOperationSchema = z.object({
  operation: z.enum([
    'activate',
    'deactivate',
    'delete',
    'update_category',
    'update_pricing',
    'update_inventory',
    'feature',
    'unfeature',
    'export'
  ]),
  
  productIds: z
    .array(z.string().min(1))
    .min(1, 'At least one product required')
    .max(1000, 'Maximum 1000 products allowed'),
  
  data: z.object({
    categoryIds: z.array(z.string()).optional(),
    
    pricing: z.object({
      adjustment: z.number(),
      type: z.enum(['percentage', 'fixed']),
      applyTo: z.enum(['price', 'sale_price', 'wholesale']),
    }).optional(),
    
    inventory: z.object({
      adjustment: z.number().int(),
      type: z.enum(['set', 'add', 'subtract']),
    }).optional(),
    
    fields: z.record(z.string(), z.any()).optional(),
  }).optional(),
  
  filters: z.object({
    categories: z.array(z.string()).optional(),
    brands: z.array(z.string()).optional(),
    status: z.array(z.string()).optional(),
    priceRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
    }).optional(),
  }).optional(),
  
  dryRun: z.boolean().default(false),
});

export type BulkProductOperationData = z.infer<typeof bulkProductOperationSchema>;

// Export all schemas
export const productSchemas = {
  productVariant: productVariantSchema,
  productCategory: productCategorySchema,
  createProduct: createProductSchema,
  updateProduct: updateProductSchema,
  productSearch: productSearchSchema,
  productReview: productReviewSchema,
  productComparison: productComparisonSchema,
  productAnalytics: productAnalyticsSchema,
  bulkProductOperation: bulkProductOperationSchema,
};

export default productSchemas;
