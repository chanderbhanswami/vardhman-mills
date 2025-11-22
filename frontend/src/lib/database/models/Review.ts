/**
 * Review Model - Comprehensive product review and rating system
 * Frontend-optimized with full TypeScript support and validation
 */

import { ObjectId } from 'mongodb';
import { z } from 'zod';

/**
 * Review Media Schema
 */
export const ReviewMediaSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'video']),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  size: z.number().positive().optional(), // File size in bytes
  format: z.string().optional(),
  duration: z.number().positive().optional(), // For videos in seconds
  cloudinaryPublicId: z.string().optional(),
  uploadedAt: z.date().default(() => new Date()),
});

export type ReviewMedia = z.infer<typeof ReviewMediaSchema>;

/**
 * Review Response Schema
 */
export const ReviewResponseSchema = z.object({
  id: z.string(),
  userId: z.string(), // User who responded
  userType: z.enum(['customer', 'admin', 'seller', 'support']),
  message: z.string().min(1, 'Response message is required').max(1000, 'Response too long'),
  isOfficial: z.boolean().default(false), // Official response from company
  isPublic: z.boolean().default(true),
  helpful: z.number().nonnegative().default(0),
  notHelpful: z.number().nonnegative().default(0),
  flagCount: z.number().nonnegative().default(0),
  status: z.enum(['active', 'hidden', 'flagged', 'deleted']).default('active'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;

/**
 * Review Verification Schema
 */
export const ReviewVerificationSchema = z.object({
  isVerified: z.boolean().default(false),
  verifiedPurchase: z.boolean().default(false),
  purchaseOrderId: z.string().optional(),
  purchaseDate: z.date().optional(),
  deliveryDate: z.date().optional(),
  verificationMethod: z.enum(['purchase', 'manual', 'automated', 'thirdParty']).optional(),
  verifiedBy: z.string().optional(), // Admin user ID
  verifiedAt: z.date().optional(),
  verificationNotes: z.string().optional(),
});

export type ReviewVerification = z.infer<typeof ReviewVerificationSchema>;

/**
 * Review Moderation Schema
 */
export const ReviewModerationSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'flagged', 'under_review']).default('pending'),
  moderatedBy: z.string().optional(), // Admin user ID
  moderatedAt: z.date().optional(),
  moderationReason: z.string().optional(),
  moderationNotes: z.string().optional(),
  autoModerated: z.boolean().default(false),
  moderationScore: z.number().min(0).max(1).optional(), // AI moderation confidence
  flags: z.array(z.object({
    type: z.enum(['spam', 'inappropriate', 'fake', 'offensive', 'irrelevant', 'duplicate']),
    reportedBy: z.string(), // User ID
    reason: z.string().optional(),
    reportedAt: z.date().default(() => new Date()),
    status: z.enum(['pending', 'resolved', 'dismissed']).default('pending'),
  })).default([]),
  appealable: z.boolean().default(true),
  appeals: z.array(z.object({
    appealedBy: z.string(), // User ID
    reason: z.string(),
    status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
    reviewedBy: z.string().optional(),
    reviewedAt: z.date().optional(),
    appealedAt: z.date().default(() => new Date()),
  })).default([]),
});

export type ReviewModeration = z.infer<typeof ReviewModerationSchema>;

/**
 * Review Analytics Schema
 */
export const ReviewAnalyticsSchema = z.object({
  helpfulVotes: z.number().nonnegative().default(0),
  notHelpfulVotes: z.number().nonnegative().default(0),
  totalVotes: z.number().nonnegative().default(0),
  helpfulnessRatio: z.number().min(0).max(1).default(0),
  responseCount: z.number().nonnegative().default(0),
  views: z.number().nonnegative().default(0),
  uniqueViews: z.number().nonnegative().default(0),
  shares: z.number().nonnegative().default(0),
  bookmarks: z.number().nonnegative().default(0),
  reports: z.number().nonnegative().default(0),
  engagementScore: z.number().min(0).max(100).default(0),
  qualityScore: z.number().min(0).max(100).default(0),
  sentimentScore: z.number().min(-1).max(1).default(0), // -1 = negative, 0 = neutral, 1 = positive
  readingTime: z.number().positive().default(30), // Estimated reading time in seconds
  lastEngagement: z.date().optional(),
});

export type ReviewAnalytics = z.infer<typeof ReviewAnalyticsSchema>;

/**
 * Main Review Schema
 */
export const ReviewSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  productId: z.string().min(1, 'Product ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  orderId: z.string().optional(), // Order ID if verified purchase
  title: z.string().min(1, 'Review title is required').max(200, 'Title too long'),
  content: z.string().min(10, 'Review content too short').max(5000, 'Review content too long'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  
  // Detailed ratings
  ratings: z.object({
    overall: z.number().min(1).max(5),
    quality: z.number().min(1).max(5).optional(),
    value: z.number().min(1).max(5).optional(),
    shipping: z.number().min(1).max(5).optional(),
    service: z.number().min(1).max(5).optional(),
    design: z.number().min(1).max(5).optional(),
    durability: z.number().min(1).max(5).optional(),
    easeOfUse: z.number().min(1).max(5).optional(),
    comfort: z.number().min(1).max(5).optional(),
    sizing: z.number().min(1).max(5).optional(),
  }),
  
  // Pros and cons
  pros: z.array(z.string().max(200)).default([]),
  cons: z.array(z.string().max(200)).default([]),
  
  // Recommendation
  recommended: z.boolean().optional(),
  recommendationReason: z.string().max(500).optional(),
  
  // Product-specific data
  productVariant: z.object({
    size: z.string().optional(),
    color: z.string().optional(),
    material: z.string().optional(),
    style: z.string().optional(),
    sku: z.string().optional(),
  }).optional(),
  
  // Purchase context
  purchaseContext: z.object({
    purchaseDate: z.date().optional(),
    purchasePrice: z.number().positive().optional(),
    usageDuration: z.string().optional(), // e.g., "2 months", "1 year"
    purchaseLocation: z.enum(['online', 'store', 'other']).optional(),
    firstTimeUser: z.boolean().optional(),
    giftPurchase: z.boolean().default(false),
  }).optional(),
  
  // Media attachments
  media: z.array(ReviewMediaSchema).default([]),
  
  // Review metadata
  status: z.enum(['draft', 'published', 'hidden', 'deleted', 'flagged']).default('published'),
  visibility: z.enum(['public', 'private', 'friends_only']).default('public'),
  featured: z.boolean().default(false),
  pinned: z.boolean().default(false),
  
  // User information (at time of review)
  reviewerInfo: z.object({
    displayName: z.string().optional(),
    avatar: z.string().url().optional(),
    location: z.string().optional(),
    ageRange: z.string().optional(),
    verified: z.boolean().default(false),
    reviewCount: z.number().nonnegative().default(0),
    helpfulVotes: z.number().nonnegative().default(0),
    reviewerLevel: z.enum(['novice', 'regular', 'expert', 'influencer']).default('novice'),
    badges: z.array(z.string()).default([]),
  }).default(() => ({
    verified: false,
    reviewCount: 0,
    helpfulVotes: 0,
    reviewerLevel: 'novice' as const,
    badges: [],
  })),
  
  // Verification
  verification: ReviewVerificationSchema.default(() => ({
    isVerified: false,
    verifiedPurchase: false,
  })),
  
  // Moderation
  moderation: ReviewModerationSchema.default(() => ({
    status: 'pending' as const,
    autoModerated: false,
    flags: [],
    appealable: true,
    appeals: [],
  })),
  
  // Analytics
  analytics: ReviewAnalyticsSchema.default(() => ({
    helpfulVotes: 0,
    notHelpfulVotes: 0,
    totalVotes: 0,
    helpfulnessRatio: 0,
    responseCount: 0,
    views: 0,
    uniqueViews: 0,
    shares: 0,
    bookmarks: 0,
    reports: 0,
    engagementScore: 0,
    qualityScore: 0,
    sentimentScore: 0,
    readingTime: 30,
  })),
  
  // Responses
  responses: z.array(ReviewResponseSchema).default([]),
  
  // Tags and categories
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  
  // Language and localization
  language: z.string().default('en'),
  translatedFrom: z.string().optional(),
  translations: z.record(z.string(), z.object({
    title: z.string(),
    content: z.string(),
    translatedBy: z.enum(['user', 'auto', 'professional']),
    translatedAt: z.date(),
    confidence: z.number().min(0).max(1).optional(),
  })).optional(),
  
  // Custom fields
  customFields: z.record(z.string(), z.unknown()).default({}),
  
  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  publishedAt: z.date().optional(),
  deletedAt: z.date().optional(),
});

export type Review = z.infer<typeof ReviewSchema>;

/**
 * Create Review Schema
 */
export const CreateReviewSchema = ReviewSchema.omit({
  _id: true,
  analytics: true,
  responses: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  deletedAt: true,
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

/**
 * Update Review Schema
 */
export const UpdateReviewSchema = ReviewSchema.partial().omit({
  _id: true,
  productId: true,
  userId: true,
  createdAt: true,
});

export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;

/**
 * Review Filter Schema
 */
export const ReviewFilterSchema = z.object({
  productId: z.string().optional(),
  userId: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  minRating: z.number().min(1).max(5).optional(),
  maxRating: z.number().min(1).max(5).optional(),
  hasMedia: z.boolean().optional(),
  verified: z.boolean().optional(),
  recommended: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'hidden', 'deleted', 'flagged']).optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  language: z.string().optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
  helpfulnessThreshold: z.number().min(0).max(1).optional(),
  qualityScoreMin: z.number().min(0).max(100).optional(),
  sentimentFilter: z.enum(['positive', 'neutral', 'negative']).optional(),
  moderationStatus: z.enum(['pending', 'approved', 'rejected', 'flagged', 'under_review']).optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'rating', 'helpfulness', 'quality', 'engagement']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeResponses: z.boolean().default(true),
  includeAnalytics: z.boolean().default(false),
});

export type ReviewFilter = z.infer<typeof ReviewFilterSchema>;

/**
 * Review Statistics Schema
 */
export const ReviewStatsSchema = z.object({
  totalReviews: z.number(),
  averageRating: z.number(),
  ratingDistribution: z.object({
    1: z.number(),
    2: z.number(),
    3: z.number(),
    4: z.number(),
    5: z.number(),
  }),
  verifiedReviews: z.number(),
  reviewsWithMedia: z.number(),
  recommendationRate: z.number(),
  responseRate: z.number(),
  averageHelpfulness: z.number(),
  sentimentBreakdown: z.object({
    positive: z.number(),
    neutral: z.number(),
    negative: z.number(),
  }),
  topReviewers: z.array(z.object({
    userId: z.string(),
    reviewCount: z.number(),
    averageRating: z.number(),
    helpfulVotes: z.number(),
  })),
  recentTrends: z.array(z.object({
    period: z.string(),
    reviews: z.number(),
    averageRating: z.number(),
  })),
  qualityMetrics: z.object({
    averageWordCount: z.number(),
    mediaAttachmentRate: z.number(),
    responseEngagement: z.number(),
  }),
});

export type ReviewStats = z.infer<typeof ReviewStatsSchema>;

/**
 * Validation functions
 */
export const validateReview = (data: unknown): Review => {
  return ReviewSchema.parse(data);
};

export const validateCreateReview = (data: unknown): CreateReviewInput => {
  return CreateReviewSchema.parse(data);
};

export const validateUpdateReview = (data: unknown): UpdateReviewInput => {
  return UpdateReviewSchema.parse(data);
};

export const validateReviewFilter = (data: unknown): ReviewFilter => {
  return ReviewFilterSchema.parse(data);
};

/**
 * Review utility functions
 */
export const reviewUtils = {
  /**
   * Calculate overall rating from detailed ratings
   */
  calculateOverallRating: (ratings: Review['ratings']): number => {
    const ratingValues = Object.values(ratings).filter((rating): rating is number => 
      rating !== undefined && rating !== null
    );
    
    if (ratingValues.length === 0) return 0;
    
    const sum = ratingValues.reduce((acc, rating) => acc + rating, 0);
    return Math.round((sum / ratingValues.length) * 10) / 10;
  },

  /**
   * Calculate helpfulness ratio
   */
  calculateHelpfulness: (helpful: number, notHelpful: number): number => {
    const total = helpful + notHelpful;
    if (total === 0) return 0;
    return helpful / total;
  },

  /**
   * Calculate quality score
   */
  calculateQualityScore: (review: Review): number => {
    let score = 0;
    
    // Content length score (0-25 points)
    const contentLength = review.content.length;
    if (contentLength >= 100) score += 25;
    else if (contentLength >= 50) score += 15;
    else if (contentLength >= 20) score += 10;
    
    // Media attachments (0-15 points)
    if (review.media.length > 0) score += 15;
    
    // Detailed ratings (0-20 points)
    const detailedRatings = Object.keys(review.ratings).length - 1; // Exclude overall
    score += Math.min(detailedRatings * 3, 20);
    
    // Pros/cons (0-10 points)
    if (review.pros.length > 0 || review.cons.length > 0) score += 10;
    
    // Verified purchase (0-15 points)
    if (review.verification.verifiedPurchase) score += 15;
    
    // Title quality (0-10 points)
    if (review.title.length >= 20) score += 10;
    else if (review.title.length >= 10) score += 5;
    
    // Recommendation provided (0-5 points)
    if (review.recommended !== undefined) score += 5;
    
    return Math.min(score, 100);
  },

  /**
   * Calculate engagement score
   */
  calculateEngagementScore: (analytics: ReviewAnalytics): number => {
    const {
      helpfulVotes,
      notHelpfulVotes,
      views,
      responseCount,
      shares,
      bookmarks,
    } = analytics;
    
    if (views === 0) return 0;
    
    const totalInteractions = helpfulVotes + notHelpfulVotes + responseCount + shares + bookmarks;
    const engagementRate = totalInteractions / views;
    
    return Math.min(engagementRate * 100, 100);
  },

  /**
   * Estimate reading time
   */
  estimateReadingTime: (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = wordCount / wordsPerMinute;
    return Math.max(Math.ceil(minutes * 60), 30); // Minimum 30 seconds
  },

  /**
   * Generate review summary
   */
  generateSummary: (review: Review, maxLength: number = 150): string => {
    if (review.content.length <= maxLength) {
      return review.content;
    }
    
    const words = review.content.split(' ');
    let summary = '';
    
    for (const word of words) {
      if ((summary + word + '...').length > maxLength) break;
      summary += (summary ? ' ' : '') + word;
    }
    
    return summary + '...';
  },

  /**
   * Get review sentiment
   */
  getReviewSentiment: (sentimentScore: number): 'positive' | 'neutral' | 'negative' => {
    if (sentimentScore > 0.1) return 'positive';
    if (sentimentScore < -0.1) return 'negative';
    return 'neutral';
  },

  /**
   * Check if review can be edited
   */
  canEdit: (review: Review, currentUserId: string): boolean => {
    if (review.userId !== currentUserId) return false;
    if (review.status === 'deleted') return false;
    
    // Allow editing within 24 hours of creation
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return review.createdAt > oneDayAgo;
  },

  /**
   * Check if review can be deleted
   */
  canDelete: (review: Review, currentUserId: string, isAdmin: boolean = false): boolean => {
    if (isAdmin) return true;
    if (review.userId !== currentUserId) return false;
    return review.status !== 'deleted';
  },

  /**
   * Format review for display
   */
  formatForDisplay: (review: Review) => {
    return {
      id: review._id?.toString(),
      productId: review.productId,
      userId: review.userId,
      title: review.title,
      content: review.content,
      summary: reviewUtils.generateSummary(review),
      rating: review.rating,
      ratings: review.ratings,
      pros: review.pros,
      cons: review.cons,
      recommended: review.recommended,
      media: review.media,
      status: review.status,
      featured: review.featured,
      reviewer: review.reviewerInfo,
      verification: review.verification,
      analytics: {
        helpful: review.analytics.helpfulVotes,
        notHelpful: review.analytics.notHelpfulVotes,
        helpfulness: reviewUtils.calculateHelpfulness(
          review.analytics.helpfulVotes,
          review.analytics.notHelpfulVotes
        ),
        qualityScore: reviewUtils.calculateQualityScore(review),
        engagementScore: reviewUtils.calculateEngagementScore(review.analytics),
        sentiment: reviewUtils.getReviewSentiment(review.analytics.sentimentScore),
      },
      responses: review.responses.filter(r => r.status === 'active'),
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      publishedAt: review.publishedAt,
      readingTime: reviewUtils.estimateReadingTime(review.content),
    };
  },

  /**
   * Filter reviews by criteria
   */
  filterReviews: (reviews: Review[], filter: Partial<ReviewFilter>): Review[] => {
    return reviews.filter(review => {
      if (filter.productId && review.productId !== filter.productId) return false;
      if (filter.userId && review.userId !== filter.userId) return false;
      if (filter.rating && review.rating !== filter.rating) return false;
      if (filter.minRating && review.rating < filter.minRating) return false;
      if (filter.maxRating && review.rating > filter.maxRating) return false;
      if (filter.hasMedia !== undefined && (review.media.length > 0) !== filter.hasMedia) return false;
      if (filter.verified !== undefined && review.verification.isVerified !== filter.verified) return false;
      if (filter.recommended !== undefined && review.recommended !== filter.recommended) return false;
      if (filter.status && review.status !== filter.status) return false;
      if (filter.featured !== undefined && review.featured !== filter.featured) return false;
      if (filter.language && review.language !== filter.language) return false;
      
      if (filter.dateRange) {
        const reviewDate = review.createdAt;
        if (reviewDate < filter.dateRange.from || reviewDate > filter.dateRange.to) return false;
      }
      
      if (filter.helpfulnessThreshold) {
        const helpfulness = reviewUtils.calculateHelpfulness(
          review.analytics.helpfulVotes,
          review.analytics.notHelpfulVotes
        );
        if (helpfulness < filter.helpfulnessThreshold) return false;
      }
      
      if (filter.qualityScoreMin) {
        const qualityScore = reviewUtils.calculateQualityScore(review);
        if (qualityScore < filter.qualityScoreMin) return false;
      }
      
      if (filter.sentimentFilter) {
        const sentiment = reviewUtils.getReviewSentiment(review.analytics.sentimentScore);
        if (sentiment !== filter.sentimentFilter) return false;
      }
      
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        const searchableText = [
          review.title,
          review.content,
          ...review.pros,
          ...review.cons,
          ...review.tags,
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      if (filter.tags && filter.tags.length > 0) {
        const hasTag = filter.tags.some(tag => review.tags.includes(tag));
        if (!hasTag) return false;
      }
      
      return true;
    });
  },

  /**
   * Sort reviews
   */
  sortReviews: (reviews: Review[], sortBy: ReviewFilter['sortBy'], sortOrder: ReviewFilter['sortOrder']): Review[] => {
    return [...reviews].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'helpfulness':
          const helpfulnessA = reviewUtils.calculateHelpfulness(a.analytics.helpfulVotes, a.analytics.notHelpfulVotes);
          const helpfulnessB = reviewUtils.calculateHelpfulness(b.analytics.helpfulVotes, b.analytics.notHelpfulVotes);
          comparison = helpfulnessA - helpfulnessB;
          break;
        case 'quality':
          const qualityA = reviewUtils.calculateQualityScore(a);
          const qualityB = reviewUtils.calculateQualityScore(b);
          comparison = qualityA - qualityB;
          break;
        case 'engagement':
          const engagementA = reviewUtils.calculateEngagementScore(a.analytics);
          const engagementB = reviewUtils.calculateEngagementScore(b.analytics);
          comparison = engagementA - engagementB;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  },

  /**
   * Calculate review statistics
   */
  calculateStats: (reviews: Review[]): ReviewStats => {
    const totalReviews = reviews.length;
    
    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        verifiedReviews: 0,
        reviewsWithMedia: 0,
        recommendationRate: 0,
        responseRate: 0,
        averageHelpfulness: 0,
        sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
        topReviewers: [],
        recentTrends: [],
        qualityMetrics: {
          averageWordCount: 0,
          mediaAttachmentRate: 0,
          responseEngagement: 0,
        },
      };
    }
    
    // Basic stats
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;
    
    // Rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });
    
    // Other metrics
    const verifiedReviews = reviews.filter(r => r.verification.isVerified).length;
    const reviewsWithMedia = reviews.filter(r => r.media.length > 0).length;
    const recommendedReviews = reviews.filter(r => r.recommended === true).length;
    const reviewsWithResponses = reviews.filter(r => r.responses.length > 0).length;
    
    const totalHelpfulness = reviews.reduce((sum, review) => {
      return sum + reviewUtils.calculateHelpfulness(
        review.analytics.helpfulVotes,
        review.analytics.notHelpfulVotes
      );
    }, 0);
    
    // Sentiment breakdown
    const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 };
    reviews.forEach(review => {
      const sentiment = reviewUtils.getReviewSentiment(review.analytics.sentimentScore);
      sentimentBreakdown[sentiment]++;
    });
    
    // Quality metrics
    const totalWordCount = reviews.reduce((sum, review) => {
      return sum + review.content.split(/\s+/).length;
    }, 0);
    
    const totalResponses = reviews.reduce((sum, review) => sum + review.responses.length, 0);
    
    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      verifiedReviews,
      reviewsWithMedia,
      recommendationRate: recommendedReviews / totalReviews,
      responseRate: reviewsWithResponses / totalReviews,
      averageHelpfulness: totalHelpfulness / totalReviews,
      sentimentBreakdown,
      topReviewers: [], // Would need user aggregation
      recentTrends: [], // Would need time-based aggregation
      qualityMetrics: {
        averageWordCount: totalWordCount / totalReviews,
        mediaAttachmentRate: reviewsWithMedia / totalReviews,
        responseEngagement: totalResponses / totalReviews,
      },
    };
  },

  /**
   * Generate review permalink
   */
  generatePermalink: (review: Review, productSlug?: string): string => {
    const reviewId = review._id?.toString() || '';
    const baseUrl = productSlug ? `/products/${productSlug}` : `/products/${review.productId}`;
    return `${baseUrl}/reviews/${reviewId}`;
  },

  /**
   * Export review data
   */
  exportData: (reviews: Review[], format: 'json' | 'csv' = 'json') => {
    const exportData = reviews.map(review => ({
      id: review._id?.toString(),
      productId: review.productId,
      userId: review.userId,
      title: review.title,
      content: review.content,
      rating: review.rating,
      recommended: review.recommended,
      verified: review.verification.isVerified,
      helpful: review.analytics.helpfulVotes,
      notHelpful: review.analytics.notHelpfulVotes,
      status: review.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));
    
    return format === 'json' ? JSON.stringify(exportData, null, 2) : exportData;
  },
};

/**
 * Default review values
 */
export const defaultReview: Partial<Review> = {
  status: 'published',
  visibility: 'public',
  featured: false,
  pinned: false,
  pros: [],
  cons: [],
  media: [],
  tags: [],
  categories: [],
  language: 'en',
  customFields: {},
  responses: [],
  reviewerInfo: {
    verified: false,
    reviewCount: 0,
    helpfulVotes: 0,
    reviewerLevel: 'novice',
    badges: [],
  },
  verification: {
    isVerified: false,
    verifiedPurchase: false,
  },
  moderation: {
    status: 'pending',
    autoModerated: false,
    flags: [],
    appealable: true,
    appeals: [],
  },
  analytics: {
    helpfulVotes: 0,
    notHelpfulVotes: 0,
    totalVotes: 0,
    helpfulnessRatio: 0,
    responseCount: 0,
    views: 0,
    uniqueViews: 0,
    shares: 0,
    bookmarks: 0,
    reports: 0,
    engagementScore: 0,
    qualityScore: 0,
    sentimentScore: 0,
    readingTime: 30,
  },
};

const ReviewModel = {
  ReviewSchema,
  CreateReviewSchema,
  UpdateReviewSchema,
  ReviewFilterSchema,
  ReviewStatsSchema,
  ReviewMediaSchema,
  ReviewResponseSchema,
  ReviewVerificationSchema,
  ReviewModerationSchema,
  ReviewAnalyticsSchema,
  validateReview,
  validateCreateReview,
  validateUpdateReview,
  validateReviewFilter,
  reviewUtils,
  defaultReview,
};

export default ReviewModel;