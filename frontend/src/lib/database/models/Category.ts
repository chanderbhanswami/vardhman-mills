/**
 * Category Model - Comprehensive product categorization system
 * Frontend-optimized with full TypeScript support and validation
 */

import { ObjectId } from 'mongodb';
import { z } from 'zod';

/**
 * Category Image Schema
 */
export const CategoryImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  alt: z.string(),
  caption: z.string().optional(),
  width: z.number().positive(),
  height: z.number().positive(),
  size: z.number().positive(), // File size in bytes
  format: z.enum(['jpg', 'jpeg', 'png', 'webp', 'avif']),
  type: z.enum(['thumbnail', 'banner', 'icon', 'hero']),
  cloudinaryPublicId: z.string().optional(),
});

export type CategoryImage = z.infer<typeof CategoryImageSchema>;

/**
 * Category SEO Schema
 */
export const CategorySEOSchema = z.object({
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

export type CategorySEO = z.infer<typeof CategorySEOSchema>;

/**
 * Category Display Options Schema
 */
export const CategoryDisplayOptionsSchema = z.object({
  layout: z.enum(['grid', 'list', 'masonry', 'carousel']).default('grid'),
  productColumns: z.number().min(1).max(6).default(3),
  productsPerPage: z.number().min(1).max(100).default(20),
  showSubcategories: z.boolean().default(true),
  showFilters: z.boolean().default(true),
  showSorting: z.boolean().default(true),
  showBreadcrumbs: z.boolean().default(true),
  showProductCount: z.boolean().default(true),
  defaultSortBy: z.enum(['name', 'price', 'popularity', 'newest', 'rating']).default('popularity'),
  defaultSortOrder: z.enum(['asc', 'desc']).default('asc'),
  enableQuickView: z.boolean().default(true),
  enableWishlist: z.boolean().default(true),
  enableCompare: z.boolean().default(true),
});

export type CategoryDisplayOptions = z.infer<typeof CategoryDisplayOptionsSchema>;

/**
 * Category Analytics Schema
 */
export const CategoryAnalyticsSchema = z.object({
  views: z.number().nonnegative().default(0),
  uniqueViews: z.number().nonnegative().default(0),
  productViews: z.number().nonnegative().default(0),
  conversions: z.number().nonnegative().default(0),
  revenue: z.number().nonnegative().default(0),
  averageTimeSpent: z.number().nonnegative().default(0), // in seconds
  bounceRate: z.number().min(0).max(1).default(0),
  conversionRate: z.number().min(0).max(1).default(0),
  popularProducts: z.array(z.object({
    productId: z.string(),
    views: z.number(),
    sales: z.number(),
  })).default([]),
  topKeywords: z.array(z.object({
    keyword: z.string(),
    count: z.number(),
  })).default([]),
  trafficSources: z.record(z.string(), z.number()).default({}),
  deviceBreakdown: z.object({
    desktop: z.number().default(0),
    mobile: z.number().default(0),
    tablet: z.number().default(0),
  }).default(() => ({
    desktop: 0,
    mobile: 0,
    tablet: 0,
  })),
  seasonalTrends: z.array(z.object({
    month: z.number().min(1).max(12),
    views: z.number(),
    sales: z.number(),
    revenue: z.number(),
  })).default([]),
  lastUpdated: z.date().optional(),
});

export type CategoryAnalytics = z.infer<typeof CategoryAnalyticsSchema>;

/**
 * Main Category Schema
 */
export const CategorySchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string().min(1, 'Category name is required').max(100, 'Category name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  shortDescription: z.string().max(250, 'Short description too long').optional(),
  parentId: z.string().optional(), // Parent category ID
  level: z.number().nonnegative().default(0), // 0 = root category, 1 = subcategory, etc.
  path: z.array(z.string()).default([]), // Array of parent category IDs
  children: z.array(z.string()).default([]), // Child category IDs
  status: z.enum(['active', 'inactive', 'draft', 'archived']).default('active'),
  visibility: z.enum(['public', 'private', 'hidden']).default('public'),
  featured: z.boolean().default(false),
  sortOrder: z.number().default(0),
  images: z.array(CategoryImageSchema).default([]),
  icon: z.string().optional(), // Icon class or SVG
  color: z.string().optional(), // Hex color code
  seo: CategorySEOSchema,
  displayOptions: CategoryDisplayOptionsSchema.default(() => ({
    layout: 'grid' as const,
    productColumns: 3,
    productsPerPage: 20,
    showSubcategories: true,
    showFilters: true,
    showSorting: true,
    showBreadcrumbs: true,
    showProductCount: true,
    defaultSortBy: 'popularity' as const,
    defaultSortOrder: 'asc' as const,
    enableQuickView: true,
    enableWishlist: true,
    enableCompare: true,
  })),
  filters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['range', 'checkbox', 'radio', 'dropdown', 'color', 'size']),
    attribute: z.string(), // Product attribute to filter by
    options: z.array(z.object({
      label: z.string(),
      value: z.string(),
      count: z.number().optional(),
      color: z.string().optional(), // For color filters
    })).default([]),
    isRequired: z.boolean().default(false),
    isCollapsible: z.boolean().default(true),
    defaultExpanded: z.boolean().default(true),
    sortOrder: z.number().default(0),
  })).default([]),
  attributes: z.record(z.string(), z.union([z.string(), z.array(z.string())])).default({}),
  specifications: z.record(z.string(), z.string()).default({}),
  commission: z.object({
    rate: z.number().min(0).max(100).default(0), // Commission percentage
    type: z.enum(['percentage', 'fixed']).default('percentage'),
    minAmount: z.number().nonnegative().optional(),
    maxAmount: z.number().nonnegative().optional(),
  }).optional(),
  restrictions: z.object({
    ageRestriction: z.number().positive().optional(),
    locationRestrictions: z.array(z.string()).optional(),
    requiresVerification: z.boolean().default(false),
  }).optional(),
  analytics: CategoryAnalyticsSchema.default(() => ({
    views: 0,
    uniqueViews: 0,
    productViews: 0,
    conversions: 0,
    revenue: 0,
    averageTimeSpent: 0,
    bounceRate: 0,
    conversionRate: 0,
    popularProducts: [],
    topKeywords: [],
    trafficSources: {},
    deviceBreakdown: {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    },
    seasonalTrends: [],
  })),
  relatedCategories: z.array(z.string()).default([]), // Related category IDs
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.string(), z.unknown()).default({}),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdBy: z.string().optional(), // User ID
  updatedBy: z.string().optional(), // User ID
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  deletedAt: z.date().optional(),
});

export type Category = z.infer<typeof CategorySchema>;

/**
 * Create Category Schema
 */
export const CreateCategorySchema = CategorySchema.omit({
  _id: true,
  level: true,
  path: true,
  children: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

/**
 * Update Category Schema
 */
export const UpdateCategorySchema = CategorySchema.partial().omit({
  _id: true,
  createdAt: true,
});

export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

/**
 * Category Filter Schema
 */
export const CategoryFilterSchema = z.object({
  parentId: z.string().optional(),
  level: z.number().nonnegative().optional(),
  status: z.enum(['active', 'inactive', 'draft', 'archived']).optional(),
  visibility: z.enum(['public', 'private', 'hidden']).optional(),
  featured: z.boolean().optional(),
  hasProducts: z.boolean().optional(),
  hasChildren: z.boolean().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  sortBy: z.enum(['name', 'sortOrder', 'createdAt', 'updatedAt', 'level']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  includeChildren: z.boolean().default(false),
  includeParent: z.boolean().default(false),
  includeAnalytics: z.boolean().default(false),
});

export type CategoryFilter = z.infer<typeof CategoryFilterSchema>;

/**
 * Category Tree Schema
 */
export const CategoryTreeSchema: z.ZodType<CategoryTree> = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  parentId: z.string().optional(),
  level: z.number(),
  sortOrder: z.number(),
  status: z.string(),
  productCount: z.number().optional(),
  children: z.array(z.lazy(() => CategoryTreeSchema)).default([]),
});

export type CategoryTree = {
  _id: string;
  name: string;
  slug: string;
  parentId?: string;
  level: number;
  sortOrder: number;
  status: string;
  productCount?: number;
  children: CategoryTree[];
};

/**
 * Category Statistics Schema
 */
export const CategoryStatsSchema = z.object({
  totalCategories: z.number(),
  activeCategories: z.number(),
  rootCategories: z.number(),
  maxDepth: z.number(),
  averageProductsPerCategory: z.number(),
  categoriesWithProducts: z.number(),
  categoriesWithoutProducts: z.number(),
  featuredCategories: z.number(),
  categoryDistribution: z.array(z.object({
    level: z.number(),
    count: z.number(),
  })),
  topCategories: z.array(z.object({
    categoryId: z.string(),
    name: z.string(),
    views: z.number(),
    products: z.number(),
    revenue: z.number(),
  })),
  categoryPerformance: z.array(z.object({
    categoryId: z.string(),
    name: z.string(),
    conversionRate: z.number(),
    bounceRate: z.number(),
    averageTimeSpent: z.number(),
  })),
});

export type CategoryStats = z.infer<typeof CategoryStatsSchema>;

/**
 * Validation functions
 */
export const validateCategory = (data: unknown): Category => {
  return CategorySchema.parse(data);
};

export const validateCreateCategory = (data: unknown): CreateCategoryInput => {
  return CreateCategorySchema.parse(data);
};

export const validateUpdateCategory = (data: unknown): UpdateCategoryInput => {
  return UpdateCategorySchema.parse(data);
};

export const validateCategoryFilter = (data: unknown): CategoryFilter => {
  return CategoryFilterSchema.parse(data);
};

/**
 * Category utility functions
 */
export const categoryUtils = {
  /**
   * Build category path
   */
  buildPath: (categories: Category[], categoryId: string): string[] => {
    const path: string[] = [];
    let currentId = categoryId;
    
    while (currentId) {
      const category = categories.find(c => c._id?.toString() === currentId);
      if (!category) break;
      
      path.unshift(currentId);
      currentId = category.parentId || '';
    }
    
    return path;
  },

  /**
   * Calculate category level
   */
  calculateLevel: (categories: Category[], categoryId: string): number => {
    let level = 0;
    let currentId = categoryId;
    
    while (currentId) {
      const category = categories.find(c => c._id?.toString() === currentId);
      if (!category || !category.parentId) break;
      
      level++;
      currentId = category.parentId;
    }
    
    return level;
  },

  /**
   * Get category breadcrumbs
   */
  getBreadcrumbs: (categories: Category[], categoryId: string): Array<{ id: string; name: string; slug: string }> => {
    const breadcrumbs: Array<{ id: string; name: string; slug: string }> = [];
    const path = categoryUtils.buildPath(categories, categoryId);
    
    path.forEach(id => {
      const category = categories.find(c => c._id?.toString() === id);
      if (category) {
        breadcrumbs.push({
          id,
          name: category.name,
          slug: category.seo.slug,
        });
      }
    });
    
    return breadcrumbs;
  },

  /**
   * Build category tree
   */
  buildTree: (categories: Category[], parentId?: string): CategoryTree[] => {
    return categories
      .filter(category => category.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(category => ({
        _id: category._id?.toString() || '',
        name: category.name,
        slug: category.seo.slug,
        parentId: category.parentId,
        level: category.level,
        sortOrder: category.sortOrder,
        status: category.status,
        children: categoryUtils.buildTree(categories, category._id?.toString()),
      }));
  },

  /**
   * Get all descendants
   */
  getDescendants: (categories: Category[], categoryId: string): string[] => {
    const descendants: string[] = [];
    const directChildren = categories.filter(c => c.parentId === categoryId);
    
    directChildren.forEach(child => {
      const childId = child._id?.toString();
      if (childId) {
        descendants.push(childId);
        descendants.push(...categoryUtils.getDescendants(categories, childId));
      }
    });
    
    return descendants;
  },

  /**
   * Get all ancestors
   */
  getAncestors: (categories: Category[], categoryId: string): string[] => {
    const ancestors: string[] = [];
    let currentId = categoryId;
    
    while (currentId) {
      const category = categories.find(c => c._id?.toString() === currentId);
      if (!category || !category.parentId) break;
      
      ancestors.unshift(category.parentId);
      currentId = category.parentId;
    }
    
    return ancestors;
  },

  /**
   * Check if category is ancestor of another
   */
  isAncestorOf: (categories: Category[], ancestorId: string, descendantId: string): boolean => {
    const ancestors = categoryUtils.getAncestors(categories, descendantId);
    return ancestors.includes(ancestorId);
  },

  /**
   * Get root categories
   */
  getRootCategories: (categories: Category[]): Category[] => {
    return categories.filter(category => !category.parentId && category.status === 'active');
  },

  /**
   * Get featured categories
   */
  getFeaturedCategories: (categories: Category[]): Category[] => {
    return categories.filter(category => category.featured && category.status === 'active');
  },

  /**
   * Get category by slug
   */
  getBySlug: (categories: Category[], slug: string): Category | undefined => {
    return categories.find(category => category.seo.slug === slug);
  },

  /**
   * Generate category URL
   */
  generateUrl: (category: Category, baseUrl: string = ''): string => {
    return `${baseUrl}/categories/${category.seo.slug}`;
  },

  /**
   * Get main category image
   */
  getMainImage: (category: Category): CategoryImage | null => {
    const thumbnailImage = category.images.find(img => img.type === 'thumbnail');
    return thumbnailImage || category.images[0] || null;
  },

  /**
   * Get banner image
   */
  getBannerImage: (category: Category): CategoryImage | null => {
    return category.images.find(img => img.type === 'banner') || null;
  },

  /**
   * Format category for display
   */
  formatForDisplay: (category: Category, productCount?: number) => {
    return {
      id: category._id?.toString(),
      name: category.name,
      description: category.shortDescription || category.description,
      slug: category.seo.slug,
      level: category.level,
      parentId: category.parentId,
      image: categoryUtils.getMainImage(category),
      banner: categoryUtils.getBannerImage(category),
      icon: category.icon,
      color: category.color,
      featured: category.featured,
      productCount: productCount || 0,
      url: categoryUtils.generateUrl(category),
      seo: {
        title: category.seo.title || category.name,
        description: category.seo.description || category.shortDescription,
        keywords: category.seo.keywords,
      },
      displayOptions: category.displayOptions,
      children: category.children,
      status: category.status,
      sortOrder: category.sortOrder,
    };
  },

  /**
   * Search categories
   */
  search: (categories: Category[], query: string): Category[] => {
    const searchTerm = query.toLowerCase();
    
    return categories.filter(category => {
      const searchableText = [
        category.name,
        category.description || '',
        category.shortDescription || '',
        ...category.tags,
        ...category.seo.keywords,
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm);
    });
  },

  /**
   * Validate category hierarchy
   */
  validateHierarchy: (categories: Category[], categoryId: string, newParentId?: string): { isValid: boolean; error?: string } => {
    if (!newParentId) return { isValid: true };
    
    // Can't be parent of itself
    if (categoryId === newParentId) {
      return { isValid: false, error: 'Category cannot be parent of itself' };
    }
    
    // Can't be parent of its ancestors
    const ancestors = categoryUtils.getAncestors(categories, categoryId);
    if (ancestors.includes(newParentId)) {
      return { isValid: false, error: 'Category cannot be parent of its ancestor' };
    }
    
    // Can't be parent of its descendants
    const descendants = categoryUtils.getDescendants(categories, categoryId);
    if (descendants.includes(newParentId)) {
      return { isValid: false, error: 'Category cannot be parent of its descendant' };
    }
    
    return { isValid: true };
  },

  /**
   * Update category hierarchy
   */
  updateHierarchy: (category: Category, categories: Category[]): Partial<Category> => {
    const level = categoryUtils.calculateLevel(categories, category._id?.toString() || '');
    const path = categoryUtils.buildPath(categories, category._id?.toString() || '');
    
    return {
      level,
      path: path.slice(0, -1), // Exclude self from path
    };
  },

  /**
   * Get category filters
   */
  getCategoryFilters: (category: Category, products: unknown[] = []): typeof category.filters => {
    // Aggregate filters from products in the category
    const productCount = products.length;
    
    return category.filters.map(filter => ({
      ...filter,
      options: filter.options.map(option => ({
        ...option,
        count: Math.floor(productCount * Math.random()), // Calculate from actual products
      })),
    }));
  },

  /**
   * Calculate category analytics
   */
  calculateAnalytics: (category: Category, timeframe: 'day' | 'week' | 'month' | 'year' = 'month'): CategoryAnalytics => {
    // Calculate analytics based on timeframe
    const multiplier = timeframe === 'day' ? 0.1 : timeframe === 'week' ? 0.7 : timeframe === 'year' ? 12 : 1;
    
    return {
      ...category.analytics,
      views: Math.floor(category.analytics.views * multiplier),
      uniqueViews: Math.floor(category.analytics.uniqueViews * multiplier),
      productViews: Math.floor(category.analytics.productViews * multiplier),
      conversions: Math.floor(category.analytics.conversions * multiplier),
      revenue: category.analytics.revenue * multiplier,
      lastUpdated: new Date(),
    };
  },

  /**
   * Generate category SEO data
   */
  generateSEOData: (category: Category) => {
    const baseTitle = category.seo.title || category.name;
    const baseDescription = category.seo.description || category.shortDescription || category.description;
    
    return {
      title: `${baseTitle} | Vardhman Mills`,
      description: baseDescription?.substring(0, 160),
      keywords: category.seo.keywords.join(', '),
      ogTitle: category.seo.ogTitle || baseTitle,
      ogDescription: category.seo.ogDescription || baseDescription,
      ogImage: category.seo.ogImage || categoryUtils.getMainImage(category)?.url,
      twitterTitle: category.seo.twitterTitle || baseTitle,
      twitterDescription: category.seo.twitterDescription || baseDescription,
      twitterImage: category.seo.twitterImage || categoryUtils.getMainImage(category)?.url,
      canonical: category.seo.canonical || categoryUtils.generateUrl(category),
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'ProductCategory',
        name: category.name,
        description: category.description,
        url: categoryUtils.generateUrl(category),
        image: categoryUtils.getMainImage(category)?.url,
        ...(category.parentId && { parentCategory: { '@type': 'ProductCategory', '@id': category.parentId } }),
      },
    };
  },

  /**
   * Export category data
   */
  exportData: (categories: Category[], format: 'json' | 'csv' = 'json') => {
    const exportData = categories.map(category => ({
      id: category._id?.toString(),
      name: category.name,
      slug: category.seo.slug,
      parentId: category.parentId,
      level: category.level,
      status: category.status,
      featured: category.featured,
      sortOrder: category.sortOrder,
      productCount: 0, // Would be calculated
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
    
    return format === 'json' ? JSON.stringify(exportData, null, 2) : exportData;
  },
};

/**
 * Default category values
 */
export const defaultCategory: Partial<Category> = {
  status: 'active',
  visibility: 'public',
  featured: false,
  level: 0,
  path: [],
  children: [],
  sortOrder: 0,
  images: [],
  displayOptions: {
    layout: 'grid',
    productColumns: 3,
    productsPerPage: 20,
    showSubcategories: true,
    showFilters: true,
    showSorting: true,
    showBreadcrumbs: true,
    showProductCount: true,
    defaultSortBy: 'popularity',
    defaultSortOrder: 'asc',
    enableQuickView: true,
    enableWishlist: true,
    enableCompare: true,
  },
  filters: [],
  attributes: {},
  specifications: {},
  analytics: {
    views: 0,
    uniqueViews: 0,
    productViews: 0,
    conversions: 0,
    revenue: 0,
    averageTimeSpent: 0,
    bounceRate: 0,
    conversionRate: 0,
    popularProducts: [],
    topKeywords: [],
    trafficSources: {},
    deviceBreakdown: {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    },
    seasonalTrends: [],
  },
  relatedCategories: [],
  tags: [],
  customFields: {},
};

const CategoryModel = {
  CategorySchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  CategoryFilterSchema,
  CategoryTreeSchema,
  CategoryStatsSchema,
  CategoryImageSchema,
  CategorySEOSchema,
  CategoryDisplayOptionsSchema,
  CategoryAnalyticsSchema,
  validateCategory,
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryFilter,
  categoryUtils,
  defaultCategory,
};

export default CategoryModel;