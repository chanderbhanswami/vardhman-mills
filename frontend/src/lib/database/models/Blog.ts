/**
 * Blog Model - Comprehensive blog and content management system
 * Frontend-optimized with full TypeScript support and validation
 */

import { ObjectId } from 'mongodb';
import { z } from 'zod';

/**
 * Blog Media Schema
 */
export const BlogMediaSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'video', 'audio', 'document']),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  credit: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  size: z.number().positive().optional(), // File size in bytes
  format: z.string().optional(),
  duration: z.number().positive().optional(), // For videos/audio in seconds
  cloudinaryPublicId: z.string().optional(),
  uploadedAt: z.date().default(() => new Date()),
});

export type BlogMedia = z.infer<typeof BlogMediaSchema>;

/**
 * Blog Author Schema
 */
export const BlogAuthorSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  social: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
  }).default({}),
  role: z.enum(['admin', 'editor', 'author', 'contributor', 'guest']).default('author'),
  isVerified: z.boolean().default(false),
});

export type BlogAuthor = z.infer<typeof BlogAuthorSchema>;

/**
 * Blog SEO Schema
 */
export const BlogSEOSchema = z.object({
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
  ogType: z.string().default('article'),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().url().optional(),
  twitterCard: z.enum(['summary', 'summary_large_image', 'app', 'player']).default('summary_large_image'),
  structuredData: z.record(z.string(), z.unknown()).optional(),
  readingTime: z.number().positive().optional(), // in minutes
  wordCount: z.number().nonnegative().optional(),
});

export type BlogSEO = z.infer<typeof BlogSEOSchema>;

/**
 * Blog Analytics Schema
 */
export const BlogAnalyticsSchema = z.object({
  views: z.number().nonnegative().default(0),
  uniqueViews: z.number().nonnegative().default(0),
  likes: z.number().nonnegative().default(0),
  dislikes: z.number().nonnegative().default(0),
  shares: z.number().nonnegative().default(0),
  comments: z.number().nonnegative().default(0),
  bookmarks: z.number().nonnegative().default(0),
  averageTimeSpent: z.number().nonnegative().default(0), // in seconds
  bounceRate: z.number().min(0).max(1).default(0),
  shareBreakdown: z.object({
    facebook: z.number().default(0),
    twitter: z.number().default(0),
    linkedin: z.number().default(0),
    whatsapp: z.number().default(0),
    email: z.number().default(0),
    other: z.number().default(0),
  }).default(() => ({
    facebook: 0,
    twitter: 0,
    linkedin: 0,
    whatsapp: 0,
    email: 0,
    other: 0,
  })),
  topReferrers: z.array(z.object({
    source: z.string(),
    visits: z.number(),
  })).default([]),
  deviceBreakdown: z.object({
    desktop: z.number().default(0),
    mobile: z.number().default(0),
    tablet: z.number().default(0),
  }).default(() => ({
    desktop: 0,
    mobile: 0,
    tablet: 0,
  })),
  locationBreakdown: z.record(z.string(), z.number()).default({}),
  peakHours: z.array(z.number().min(0).max(23)).default([]),
  searchKeywords: z.array(z.object({
    keyword: z.string(),
    count: z.number(),
  })).default([]),
  engagementScore: z.number().min(0).max(100).default(0),
  lastUpdated: z.date().optional(),
});

export type BlogAnalytics = z.infer<typeof BlogAnalyticsSchema>;

/**
 * Blog Comment Schema
 */
export const BlogCommentSchema: z.ZodType<BlogComment> = z.object({
  id: z.string(),
  userId: z.string().optional(), // Optional for guest comments
  parentId: z.string().optional(), // For nested comments
  author: z.object({
    name: z.string().min(1, 'Author name is required'),
    email: z.string().email().optional(),
    avatar: z.string().url().optional(),
    website: z.string().url().optional(),
    isRegistered: z.boolean().default(false),
  }),
  content: z.string().min(1, 'Comment content is required').max(2000, 'Comment too long'),
  status: z.enum(['pending', 'approved', 'rejected', 'spam', 'deleted']).default('pending'),
  moderationReason: z.string().optional(),
  likes: z.number().nonnegative().default(0),
  dislikes: z.number().nonnegative().default(0),
  reports: z.number().nonnegative().default(0),
  isEdited: z.boolean().default(false),
  editedAt: z.date().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  replies: z.array(z.lazy(() => BlogCommentSchema)).default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type BlogComment = {
  id: string;
  userId?: string;
  parentId?: string;
  author: {
    name: string;
    email?: string;
    avatar?: string;
    website?: string;
    isRegistered: boolean;
  };
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam' | 'deleted';
  moderationReason?: string;
  likes: number;
  dislikes: number;
  reports: number;
  isEdited: boolean;
  editedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  replies: BlogComment[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Main Blog Schema
 */
export const BlogSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  title: z.string().min(1, 'Blog title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Blog content is required'),
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  
  // Author information
  author: BlogAuthorSchema,
  coAuthors: z.array(BlogAuthorSchema).default([]),
  
  // Content organization
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  series: z.object({
    name: z.string(),
    order: z.number().positive(),
    totalParts: z.number().positive(),
  }).optional(),
  
  // Media and visuals
  featuredImage: BlogMediaSchema.optional(),
  gallery: z.array(BlogMediaSchema).default([]),
  
  // Status and visibility
  status: z.enum(['draft', 'published', 'scheduled', 'archived', 'deleted']).default('draft'),
  visibility: z.enum(['public', 'private', 'password_protected', 'members_only']).default('public'),
  password: z.string().optional(), // For password protected posts
  
  // Scheduling
  publishedAt: z.date().optional(),
  scheduledAt: z.date().optional(),
  
  // Content settings
  allowComments: z.boolean().default(true),
  allowSharing: z.boolean().default(true),
  isPinned: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  
  // SEO and metadata
  seo: BlogSEOSchema,
  
  // Analytics
  analytics: BlogAnalyticsSchema.default(() => ({
    views: 0,
    uniqueViews: 0,
    likes: 0,
    dislikes: 0,
    shares: 0,
    comments: 0,
    bookmarks: 0,
    averageTimeSpent: 0,
    bounceRate: 0,
    shareBreakdown: {
      facebook: 0,
      twitter: 0,
      linkedin: 0,
      whatsapp: 0,
      email: 0,
      other: 0,
    },
    topReferrers: [],
    deviceBreakdown: {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    },
    locationBreakdown: {},
    peakHours: [],
    searchKeywords: [],
    engagementScore: 0,
  })),
  
  // Comments
  comments: z.array(BlogCommentSchema).default([]),
  commentSettings: z.object({
    requireApproval: z.boolean().default(true),
    requireRegistration: z.boolean().default(false),
    allowGuestComments: z.boolean().default(true),
    maxNestingLevel: z.number().min(0).max(10).default(3),
    autoCloseAfterDays: z.number().positive().optional(),
  }).default(() => ({
    requireApproval: true,
    requireRegistration: false,
    allowGuestComments: true,
    maxNestingLevel: 3,
  })),
  
  // Related content
  relatedPosts: z.array(z.string()).default([]), // Blog post IDs
  relatedProducts: z.array(z.string()).default([]), // Product IDs
  
  // Content formatting
  format: z.enum(['standard', 'gallery', 'video', 'audio', 'quote', 'link']).default('standard'),
  template: z.string().optional(), // Custom template
  
  // Monetization
  monetization: z.object({
    allowAds: z.boolean().default(true),
    adPlacement: z.array(z.enum(['top', 'middle', 'bottom', 'sidebar'])).default([]),
    sponsorship: z.object({
      isSponsored: z.boolean().default(false),
      sponsor: z.string().optional(),
      sponsorUrl: z.string().url().optional(),
      disclosureText: z.string().optional(),
    }).default(() => ({
      isSponsored: false,
    })),
    affiliate: z.object({
      hasAffiliateLinks: z.boolean().default(false),
      disclosureText: z.string().optional(),
    }).default(() => ({
      hasAffiliateLinks: false,
    })),
  }).default(() => ({
    allowAds: true,
    adPlacement: [],
    sponsorship: {
      isSponsored: false,
    },
    affiliate: {
      hasAffiliateLinks: false,
    },
  })),
  
  // Language and localization
  language: z.string().default('en'),
  translations: z.record(z.string(), z.object({
    title: z.string(),
    content: z.string(),
    excerpt: z.string().optional(),
    translatedBy: z.string().optional(),
    translatedAt: z.date(),
    status: z.enum(['draft', 'published', 'outdated']).default('draft'),
  })).optional(),
  
  // Custom fields
  customFields: z.record(z.string(), z.unknown()).default({}),
  
  // Timestamps and audit
  createdBy: z.string().optional(), // User ID
  updatedBy: z.string().optional(), // User ID
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  lastEditedAt: z.date().optional(),
  archivedAt: z.date().optional(),
  deletedAt: z.date().optional(),
});

export type Blog = z.infer<typeof BlogSchema>;

/**
 * Create Blog Schema
 */
export const CreateBlogSchema = BlogSchema.omit({
  _id: true,
  analytics: true,
  comments: true,
  createdAt: true,
  updatedAt: true,
  lastEditedAt: true,
  archivedAt: true,
  deletedAt: true,
});

export type CreateBlogInput = z.infer<typeof CreateBlogSchema>;

/**
 * Update Blog Schema
 */
export const UpdateBlogSchema = BlogSchema.partial().omit({
  _id: true,
  createdAt: true,
});

export type UpdateBlogInput = z.infer<typeof UpdateBlogSchema>;

/**
 * Blog Filter Schema
 */
export const BlogFilterSchema = z.object({
  authorId: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'archived', 'deleted']).optional(),
  visibility: z.enum(['public', 'private', 'password_protected', 'members_only']).optional(),
  featured: z.boolean().optional(),
  pinned: z.boolean().optional(),
  format: z.enum(['standard', 'gallery', 'video', 'audio', 'quote', 'link']).optional(),
  language: z.string().optional(),
  series: z.string().optional(),
  hasComments: z.boolean().optional(),
  hasFeaturedImage: z.boolean().optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
  search: z.string().optional(),
  minViews: z.number().nonnegative().optional(),
  minEngagement: z.number().min(0).max(100).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['created_at', 'updated_at', 'published_at', 'title', 'views', 'engagement']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeAnalytics: z.boolean().default(false),
  includeComments: z.boolean().default(false),
});

export type BlogFilter = z.infer<typeof BlogFilterSchema>;

/**
 * Blog Statistics Schema
 */
export const BlogStatsSchema = z.object({
  totalBlogs: z.number(),
  publishedBlogs: z.number(),
  draftBlogs: z.number(),
  totalViews: z.number(),
  totalComments: z.number(),
  averageEngagement: z.number(),
  topCategories: z.array(z.object({
    category: z.string(),
    count: z.number(),
    views: z.number(),
  })),
  topTags: z.array(z.object({
    tag: z.string(),
    count: z.number(),
    views: z.number(),
  })),
  topAuthors: z.array(z.object({
    authorId: z.string(),
    name: z.string(),
    blogCount: z.number(),
    totalViews: z.number(),
    averageEngagement: z.number(),
  })),
  contentMetrics: z.object({
    averageWordCount: z.number(),
    averageReadingTime: z.number(),
    postsWithImages: z.number(),
    postsWithVideos: z.number(),
  }),
  engagementMetrics: z.object({
    totalLikes: z.number(),
    totalShares: z.number(),
    averageComments: z.number(),
    commentApprovalRate: z.number(),
  }),
  monthlyTrends: z.array(z.object({
    month: z.string(),
    posts: z.number(),
    views: z.number(),
    engagement: z.number(),
  })),
});

export type BlogStats = z.infer<typeof BlogStatsSchema>;

/**
 * Validation functions
 */
export const validateBlog = (data: unknown): Blog => {
  return BlogSchema.parse(data);
};

export const validateCreateBlog = (data: unknown): CreateBlogInput => {
  return CreateBlogSchema.parse(data);
};

export const validateUpdateBlog = (data: unknown): UpdateBlogInput => {
  return UpdateBlogSchema.parse(data);
};

export const validateBlogFilter = (data: unknown): BlogFilter => {
  return BlogFilterSchema.parse(data);
};

/**
 * Blog utility functions
 */
export const blogUtils = {
  /**
   * Calculate reading time
   */
  calculateReadingTime: (content: string, wordsPerMinute: number = 200): number => {
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  },

  /**
   * Count words
   */
  countWords: (content: string): number => {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  },

  /**
   * Generate excerpt
   */
  generateExcerpt: (content: string, maxLength: number = 160): string => {
    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '');
    
    if (plainText.length <= maxLength) {
      return plainText;
    }
    
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  },

  /**
   * Generate slug from title
   */
  generateSlug: (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove multiple consecutive hyphens
      .trim()
      .substring(0, 60); // Limit length
  },

  /**
   * Calculate engagement score
   */
  calculateEngagementScore: (analytics: BlogAnalytics): number => {
    const { views, likes, shares, comments, averageTimeSpent } = analytics;
    
    if (views === 0) return 0;
    
    const likeRate = likes / views;
    const shareRate = shares / views;
    const commentRate = comments / views;
    const timeScore = Math.min(averageTimeSpent / 120, 1); // Normalize to 2 minutes max
    
    const score = (likeRate * 30) + (shareRate * 40) + (commentRate * 20) + (timeScore * 10);
    return Math.min(Math.round(score * 100), 100);
  },

  /**
   * Get published blogs
   */
  getPublishedBlogs: (blogs: Blog[]): Blog[] => {
    const now = new Date();
    return blogs.filter(blog => 
      blog.status === 'published' && 
      blog.visibility === 'public' &&
      (!blog.publishedAt || blog.publishedAt <= now)
    );
  },

  /**
   * Get featured blogs
   */
  getFeaturedBlogs: (blogs: Blog[], limit: number = 5): Blog[] => {
    return blogUtils.getPublishedBlogs(blogs)
      .filter(blog => blog.isFeatured)
      .sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0))
      .slice(0, limit);
  },

  /**
   * Get popular blogs
   */
  getPopularBlogs: (blogs: Blog[], limit: number = 10): Blog[] => {
    return blogUtils.getPublishedBlogs(blogs)
      .sort((a, b) => {
        const scoreA = blogUtils.calculateEngagementScore(a.analytics);
        const scoreB = blogUtils.calculateEngagementScore(b.analytics);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  },

  /**
   * Get related blogs
   */
  getRelatedBlogs: (targetBlog: Blog, allBlogs: Blog[], limit: number = 5): Blog[] => {
    const publishedBlogs = blogUtils.getPublishedBlogs(allBlogs)
      .filter(blog => blog._id?.toString() !== targetBlog._id?.toString());
    
    // Calculate relevance scores
    const scoredBlogs = publishedBlogs.map(blog => {
      let score = 0;
      
      // Same category bonus
      const commonCategories = blog.categories.filter(cat => targetBlog.categories.includes(cat));
      score += commonCategories.length * 3;
      
      // Same tags bonus
      const commonTags = blog.tags.filter(tag => targetBlog.tags.includes(tag));
      score += commonTags.length * 2;
      
      // Same author bonus
      if (blog.author.userId === targetBlog.author.userId) {
        score += 1;
      }
      
      // Same series bonus
      if (blog.series && targetBlog.series && blog.series.name === targetBlog.series.name) {
        score += 5;
      }
      
      return { blog, score };
    });
    
    return scoredBlogs
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.blog);
  },

  /**
   * Filter blogs
   */
  filterBlogs: (blogs: Blog[], filter: Partial<BlogFilter>): Blog[] => {
    return blogs.filter(blog => {
      if (filter.authorId && blog.author.userId !== filter.authorId) return false;
      if (filter.status && blog.status !== filter.status) return false;
      if (filter.visibility && blog.visibility !== filter.visibility) return false;
      if (filter.featured !== undefined && blog.isFeatured !== filter.featured) return false;
      if (filter.pinned !== undefined && blog.isPinned !== filter.pinned) return false;
      if (filter.format && blog.format !== filter.format) return false;
      if (filter.language && blog.language !== filter.language) return false;
      if (filter.series && (!blog.series || blog.series.name !== filter.series)) return false;
      if (filter.hasComments !== undefined && (blog.comments.length > 0) !== filter.hasComments) return false;
      if (filter.hasFeaturedImage !== undefined && !!blog.featuredImage !== filter.hasFeaturedImage) return false;
      
      if (filter.categories && filter.categories.length > 0) {
        const hasCategory = filter.categories.some(cat => blog.categories.includes(cat));
        if (!hasCategory) return false;
      }
      
      if (filter.tags && filter.tags.length > 0) {
        const hasTag = filter.tags.some(tag => blog.tags.includes(tag));
        if (!hasTag) return false;
      }
      
      if (filter.dateRange) {
        const dateToCheck = blog.publishedAt || blog.createdAt;
        if (dateToCheck < filter.dateRange.from || dateToCheck > filter.dateRange.to) {
          return false;
        }
      }
      
      if (filter.minViews && blog.analytics.views < filter.minViews) return false;
      
      if (filter.minEngagement) {
        const engagement = blogUtils.calculateEngagementScore(blog.analytics);
        if (engagement < filter.minEngagement) return false;
      }
      
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        const searchableText = [
          blog.title,
          blog.excerpt || '',
          blog.content,
          ...blog.categories,
          ...blog.tags,
          blog.author.name,
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      return true;
    });
  },

  /**
   * Sort blogs
   */
  sortBlogs: (blogs: Blog[], sortBy: BlogFilter['sortBy'], sortOrder: BlogFilter['sortOrder']): Blog[] => {
    return [...blogs].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'created_at':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updated_at':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'published_at':
          const pubA = a.publishedAt?.getTime() || 0;
          const pubB = b.publishedAt?.getTime() || 0;
          comparison = pubA - pubB;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'views':
          comparison = a.analytics.views - b.analytics.views;
          break;
        case 'engagement':
          const engagementA = blogUtils.calculateEngagementScore(a.analytics);
          const engagementB = blogUtils.calculateEngagementScore(b.analytics);
          comparison = engagementA - engagementB;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  },

  /**
   * Format blog for display
   */
  formatForDisplay: (blog: Blog, includeContent: boolean = false) => {
    const readingTime = blogUtils.calculateReadingTime(blog.content);
    const wordCount = blogUtils.countWords(blog.content);
    const engagementScore = blogUtils.calculateEngagementScore(blog.analytics);
    
    return {
      id: blog._id?.toString(),
      title: blog.title,
      excerpt: blog.excerpt || blogUtils.generateExcerpt(blog.content),
      content: includeContent ? blog.content : undefined,
      author: {
        name: blog.author.name,
        avatar: blog.author.avatar,
        bio: blog.author.bio,
        role: blog.author.role,
        isVerified: blog.author.isVerified,
      },
      coAuthors: blog.coAuthors,
      categories: blog.categories,
      tags: blog.tags,
      series: blog.series,
      featuredImage: blog.featuredImage,
      status: blog.status,
      visibility: blog.visibility,
      format: blog.format,
      isFeatured: blog.isFeatured,
      isPinned: blog.isPinned,
      allowComments: blog.allowComments,
      allowSharing: blog.allowSharing,
      seo: {
        slug: blog.seo.slug,
        title: blog.seo.title || blog.title,
        description: blog.seo.description || blog.excerpt,
        readingTime,
        wordCount,
      },
      analytics: {
        views: blog.analytics.views,
        likes: blog.analytics.likes,
        shares: blog.analytics.shares,
        comments: blog.comments.filter(c => c.status === 'approved').length,
        engagementScore,
      },
      url: blogUtils.generateUrl(blog),
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      publishedAt: blog.publishedAt,
    };
  },

  /**
   * Generate blog URL
   */
  generateUrl: (blog: Blog, baseUrl: string = ''): string => {
    return `${baseUrl}/blog/${blog.seo.slug}`;
  },

  /**
   * Generate SEO data
   */
  generateSEOData: (blog: Blog) => {
    const readingTime = blogUtils.calculateReadingTime(blog.content);
    const wordCount = blogUtils.countWords(blog.content);
    
    return {
      title: blog.seo.title || `${blog.title} | Vardhman Mills Blog`,
      description: blog.seo.description || blog.excerpt || blogUtils.generateExcerpt(blog.content),
      keywords: blog.seo.keywords.length > 0 ? blog.seo.keywords.join(', ') : blog.tags.join(', '),
      ogTitle: blog.seo.ogTitle || blog.title,
      ogDescription: blog.seo.ogDescription || blog.excerpt,
      ogImage: blog.seo.ogImage || blog.featuredImage?.url,
      ogType: blog.seo.ogType,
      twitterTitle: blog.seo.twitterTitle || blog.title,
      twitterDescription: blog.seo.twitterDescription || blog.excerpt,
      twitterImage: blog.seo.twitterImage || blog.featuredImage?.url,
      twitterCard: blog.seo.twitterCard,
      canonical: blog.seo.canonical || blogUtils.generateUrl(blog),
      structuredData: blog.seo.structuredData || {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blog.title,
        description: blog.excerpt,
        image: blog.featuredImage?.url,
        author: {
          '@type': 'Person',
          name: blog.author.name,
          url: blog.author.website,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Vardhman Mills',
          logo: {
            '@type': 'ImageObject',
            url: '/logo.png',
          },
        },
        datePublished: blog.publishedAt?.toISOString(),
        dateModified: blog.updatedAt.toISOString(),
        wordCount,
        readingTime: `PT${readingTime}M`,
        articleSection: blog.categories[0],
        keywords: blog.tags,
      },
      readingTime,
      wordCount,
    };
  },

  /**
   * Calculate blog statistics
   */
  calculateStats: (blogs: Blog[]): BlogStats => {
    if (blogs.length === 0) {
      return {
        totalBlogs: 0,
        publishedBlogs: 0,
        draftBlogs: 0,
        totalViews: 0,
        totalComments: 0,
        averageEngagement: 0,
        topCategories: [],
        topTags: [],
        topAuthors: [],
        contentMetrics: {
          averageWordCount: 0,
          averageReadingTime: 0,
          postsWithImages: 0,
          postsWithVideos: 0,
        },
        engagementMetrics: {
          totalLikes: 0,
          totalShares: 0,
          averageComments: 0,
          commentApprovalRate: 0,
        },
        monthlyTrends: [],
      };
    }
    
    const publishedBlogs = blogs.filter(blog => blog.status === 'published');
    const draftBlogs = blogs.filter(blog => blog.status === 'draft');
    
    const totalViews = blogs.reduce((sum, blog) => sum + blog.analytics.views, 0);
    const totalComments = blogs.reduce((sum, blog) => sum + blog.comments.length, 0);
    const totalLikes = blogs.reduce((sum, blog) => sum + blog.analytics.likes, 0);
    const totalShares = blogs.reduce((sum, blog) => sum + blog.analytics.shares, 0);
    
    const totalEngagement = blogs.reduce((sum, blog) => {
      return sum + blogUtils.calculateEngagementScore(blog.analytics);
    }, 0);
    const averageEngagement = totalEngagement / blogs.length;
    
    // Category stats
    const categoryStats: Record<string, { count: number; views: number }> = {};
    blogs.forEach(blog => {
      blog.categories.forEach(category => {
        if (!categoryStats[category]) {
          categoryStats[category] = { count: 0, views: 0 };
        }
        categoryStats[category].count++;
        categoryStats[category].views += blog.analytics.views;
      });
    });
    
    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Tag stats
    const tagStats: Record<string, { count: number; views: number }> = {};
    blogs.forEach(blog => {
      blog.tags.forEach(tag => {
        if (!tagStats[tag]) {
          tagStats[tag] = { count: 0, views: 0 };
        }
        tagStats[tag].count++;
        tagStats[tag].views += blog.analytics.views;
      });
    });
    
    const topTags = Object.entries(tagStats)
      .map(([tag, stats]) => ({ tag, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Author stats
    const authorStats: Record<string, { name: string; blogCount: number; totalViews: number; totalEngagement: number }> = {};
    blogs.forEach(blog => {
      const authorId = blog.author.userId;
      if (!authorStats[authorId]) {
        authorStats[authorId] = {
          name: blog.author.name,
          blogCount: 0,
          totalViews: 0,
          totalEngagement: 0,
        };
      }
      authorStats[authorId].blogCount++;
      authorStats[authorId].totalViews += blog.analytics.views;
      authorStats[authorId].totalEngagement += blogUtils.calculateEngagementScore(blog.analytics);
    });
    
    const topAuthors = Object.entries(authorStats)
      .map(([authorId, stats]) => ({
        authorId,
        name: stats.name,
        blogCount: stats.blogCount,
        totalViews: stats.totalViews,
        averageEngagement: stats.totalEngagement / stats.blogCount,
      }))
      .sort((a, b) => b.blogCount - a.blogCount)
      .slice(0, 10);
    
    // Content metrics
    const totalWordCount = blogs.reduce((sum, blog) => sum + blogUtils.countWords(blog.content), 0);
    const totalReadingTime = blogs.reduce((sum, blog) => sum + blogUtils.calculateReadingTime(blog.content), 0);
    const postsWithImages = blogs.filter(blog => blog.featuredImage || blog.gallery.length > 0).length;
    const postsWithVideos = blogs.filter(blog => 
      blog.gallery.some(media => media.type === 'video') || blog.format === 'video'
    ).length;
    
    // Comment approval rate
    const totalCommentCount = blogs.reduce((sum, blog) => sum + blog.comments.length, 0);
    const approvedComments = blogs.reduce((sum, blog) => 
      sum + blog.comments.filter(comment => comment.status === 'approved').length, 0
    );
    const commentApprovalRate = totalCommentCount > 0 ? approvedComments / totalCommentCount : 0;
    
    return {
      totalBlogs: blogs.length,
      publishedBlogs: publishedBlogs.length,
      draftBlogs: draftBlogs.length,
      totalViews,
      totalComments,
      averageEngagement,
      topCategories,
      topTags,
      topAuthors,
      contentMetrics: {
        averageWordCount: totalWordCount / blogs.length,
        averageReadingTime: totalReadingTime / blogs.length,
        postsWithImages,
        postsWithVideos,
      },
      engagementMetrics: {
        totalLikes,
        totalShares,
        averageComments: totalComments / blogs.length,
        commentApprovalRate,
      },
      monthlyTrends: [], // Would need time-based aggregation
    };
  },

  /**
   * Export blog data
   */
  exportData: (blogs: Blog[], format: 'json' | 'csv' = 'json') => {
    const exportData = blogs.map(blog => ({
      id: blog._id?.toString(),
      title: blog.title,
      author: blog.author.name,
      status: blog.status,
      categories: blog.categories.join(', '),
      tags: blog.tags.join(', '),
      views: blog.analytics.views,
      likes: blog.analytics.likes,
      shares: blog.analytics.shares,
      comments: blog.comments.length,
      wordCount: blogUtils.countWords(blog.content),
      readingTime: blogUtils.calculateReadingTime(blog.content),
      createdAt: blog.createdAt,
      publishedAt: blog.publishedAt,
      updatedAt: blog.updatedAt,
    }));
    
    return format === 'json' ? JSON.stringify(exportData, null, 2) : exportData;
  },
};

/**
 * Default blog values
 */
export const defaultBlog: Partial<Blog> = {
  status: 'draft',
  visibility: 'public',
  allowComments: true,
  allowSharing: true,
  isPinned: false,
  isFeatured: false,
  format: 'standard',
  language: 'en',
  categories: [],
  tags: [],
  coAuthors: [],
  gallery: [],
  comments: [],
  relatedPosts: [],
  relatedProducts: [],
  customFields: {},
  commentSettings: {
    requireApproval: true,
    requireRegistration: false,
    allowGuestComments: true,
    maxNestingLevel: 3,
  },
  monetization: {
    allowAds: true,
    adPlacement: [],
    sponsorship: {
      isSponsored: false,
    },
    affiliate: {
      hasAffiliateLinks: false,
    },
  },
  analytics: {
    views: 0,
    uniqueViews: 0,
    likes: 0,
    dislikes: 0,
    shares: 0,
    comments: 0,
    bookmarks: 0,
    averageTimeSpent: 0,
    bounceRate: 0,
    shareBreakdown: {
      facebook: 0,
      twitter: 0,
      linkedin: 0,
      whatsapp: 0,
      email: 0,
      other: 0,
    },
    topReferrers: [],
    deviceBreakdown: {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    },
    locationBreakdown: {},
    peakHours: [],
    searchKeywords: [],
    engagementScore: 0,
  },
};

const BlogModel = {
  BlogSchema,
  CreateBlogSchema,
  UpdateBlogSchema,
  BlogFilterSchema,
  BlogStatsSchema,
  BlogMediaSchema,
  BlogAuthorSchema,
  BlogSEOSchema,
  BlogAnalyticsSchema,
  BlogCommentSchema,
  validateBlog,
  validateCreateBlog,
  validateUpdateBlog,
  validateBlogFilter,
  blogUtils,
  defaultBlog,
};

export default BlogModel;