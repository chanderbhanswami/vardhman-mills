/**
 * Review Schemas for Vardhman Mills Frontend
 * Zod schemas for product reviews, ratings, and feedback management
 */

import { z } from 'zod';

// Review rating breakdown schema
export const ratingBreakdownSchema = z.object({
  overall: z
    .number()
    .min(1, 'Overall rating must be at least 1')
    .max(5, 'Overall rating must not exceed 5')
    .int('Overall rating must be a whole number'),
  
  quality: z
    .number()
    .min(1, 'Quality rating must be at least 1')
    .max(5, 'Quality rating must not exceed 5')
    .int('Quality rating must be a whole number')
    .optional(),
  
  value: z
    .number()
    .min(1, 'Value rating must be at least 1')
    .max(5, 'Value rating must not exceed 5')
    .int('Value rating must be a whole number')
    .optional(),
  
  delivery: z
    .number()
    .min(1, 'Delivery rating must be at least 1')
    .max(5, 'Delivery rating must not exceed 5')
    .int('Delivery rating must be a whole number')
    .optional(),
  
  service: z
    .number()
    .min(1, 'Service rating must be at least 1')
    .max(5, 'Service rating must not exceed 5')
    .int('Service rating must be a whole number')
    .optional(),
  
  design: z
    .number()
    .min(1, 'Design rating must be at least 1')
    .max(5, 'Design rating must not exceed 5')
    .int('Design rating must be a whole number')
    .optional(),
  
  durability: z
    .number()
    .min(1, 'Durability rating must be at least 1')
    .max(5, 'Durability rating must not exceed 5')
    .int('Durability rating must be a whole number')
    .optional(),
});

export type RatingBreakdownData = z.infer<typeof ratingBreakdownSchema>;

// Review media schema
export const reviewMediaSchema = z.object({
  type: z.enum(['image', 'video']),
  
  url: z.string().url('Invalid media URL'),
  
  thumbnail: z.string().url('Invalid thumbnail URL').optional(),
  
  alt: z
    .string()
    .max(200, 'Alt text must not exceed 200 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  caption: z
    .string()
    .max(500, 'Caption must not exceed 500 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  size: z.number().min(0).max(10485760).optional(), // 10MB max
  
  duration: z.number().min(0).max(300).optional(), // 5 minutes max for videos
  
  sortOrder: z.number().min(0).int().default(0),
});

export type ReviewMediaData = z.infer<typeof reviewMediaSchema>;

// Product review creation schema
export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  
  variantId: z.string().optional(),
  
  orderId: z.string().optional(),
  
  ratings: ratingBreakdownSchema,
  
  title: z
    .string()
    .min(5, 'Review title must be at least 5 characters')
    .max(150, 'Review title must not exceed 150 characters')
    .transform(val => val.trim()),
  
  comment: z
    .string()
    .min(20, 'Review comment must be at least 20 characters')
    .max(3000, 'Review comment must not exceed 3000 characters')
    .transform(val => val.trim()),
  
  pros: z
    .array(z.string().min(1).max(200).transform(val => val.trim()))
    .max(10, 'Maximum 10 pros allowed')
    .optional(),
  
  cons: z
    .array(z.string().min(1).max(200).transform(val => val.trim()))
    .max(10, 'Maximum 10 cons allowed')
    .optional(),
  
  media: z
    .array(reviewMediaSchema)
    .max(8, 'Maximum 8 media files allowed')
    .optional(),
  
  purchaseVerified: z.boolean().default(false),
  
  anonymous: z.boolean().default(false),
  
  wouldRecommend: z.boolean().optional(),
  
  wouldPurchaseAgain: z.boolean().optional(),
  
  usageContext: z.enum([
    'personal',
    'business',
    'gift',
    'professional',
    'hospitality',
    'healthcare',
    'education',
    'other'
  ]).optional(),
  
  usageDuration: z.enum([
    'less_than_week',
    'week_to_month',
    'month_to_three_months',
    'three_to_six_months',
    'six_months_to_year',
    'more_than_year'
  ]).optional(),
  
  userProfile: z.object({
    ageGroup: z.enum([
      '18-24',
      '25-34',
      '35-44',
      '45-54',
      '55-64',
      '65+'
    ]).optional(),
    
    profession: z.enum([
      'student',
      'professional',
      'business_owner',
      'homemaker',
      'retired',
      'other'
    ]).optional(),
    
    location: z.string().max(100).optional(),
  }).optional(),
  
  helpfulVotes: z.number().min(0).int().default(0),
  
  flaggedCount: z.number().min(0).int().default(0),
  
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  
  tags: z
    .array(z.string().min(1).max(50))
    .max(15, 'Maximum 15 tags allowed')
    .optional(),
  
  isIncentivized: z.boolean().default(false),
  
  incentiveType: z.enum([
    'discount',
    'free_product',
    'cashback',
    'loyalty_points',
    'other'
  ]).optional(),
});

export type CreateReviewData = z.infer<typeof createReviewSchema>;

// Review update schema
export const updateReviewSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  
  title: z
    .string()
    .min(5, 'Review title must be at least 5 characters')
    .max(150, 'Review title must not exceed 150 characters')
    .transform(val => val.trim())
    .optional(),
  
  comment: z
    .string()
    .min(20, 'Review comment must be at least 20 characters')
    .max(3000, 'Review comment must not exceed 3000 characters')
    .transform(val => val.trim())
    .optional(),
  
  ratings: ratingBreakdownSchema.partial().optional(),
  
  pros: z
    .array(z.string().min(1).max(200).transform(val => val.trim()))
    .max(10, 'Maximum 10 pros allowed')
    .optional(),
  
  cons: z
    .array(z.string().min(1).max(200).transform(val => val.trim()))
    .max(10, 'Maximum 10 cons allowed')
    .optional(),
  
  media: z
    .array(reviewMediaSchema)
    .max(8, 'Maximum 8 media files allowed')
    .optional(),
  
  wouldRecommend: z.boolean().optional(),
  
  wouldPurchaseAgain: z.boolean().optional(),
  
  tags: z
    .array(z.string().min(1).max(50))
    .max(15, 'Maximum 15 tags allowed')
    .optional(),
});

export type UpdateReviewData = z.infer<typeof updateReviewSchema>;

// Review moderation schema
export const moderateReviewSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  
  action: z.enum(['approve', 'reject', 'flag', 'unflag', 'feature', 'unfeature']),
  
  moderatorNotes: z
    .string()
    .max(1000, 'Moderator notes must not exceed 1000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  rejectionReason: z.enum([
    'inappropriate_content',
    'spam',
    'fake_review',
    'off_topic',
    'personal_information',
    'profanity',
    'copyright_violation',
    'other'
  ]).optional(),
  
  customReason: z
    .string()
    .max(500, 'Custom reason must not exceed 500 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  notifyUser: z.boolean().default(true),
  
  autoModeration: z.boolean().default(false),
});

export type ModerateReviewData = z.infer<typeof moderateReviewSchema>;

// Review response schema (merchant response)
export const reviewResponseSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  
  response: z
    .string()
    .min(10, 'Response must be at least 10 characters')
    .max(1500, 'Response must not exceed 1500 characters')
    .transform(val => val.trim()),
  
  respondentName: z
    .string()
    .min(2, 'Respondent name must be at least 2 characters')
    .max(100, 'Respondent name must not exceed 100 characters')
    .transform(val => val.trim()),
  
  respondentTitle: z
    .string()
    .max(100, 'Respondent title must not exceed 100 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  isOfficial: z.boolean().default(true),
  
  isPublic: z.boolean().default(true),
  
  autoResponse: z.boolean().default(false),
  
  templateId: z.string().optional(),
});

export type ReviewResponseData = z.infer<typeof reviewResponseSchema>;

// Review search/filter schema
export const reviewSearchSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query too long')
    .optional(),
  
  filters: z.object({
    productIds: z.array(z.string()).optional(),
    
    categoryIds: z.array(z.string()).optional(),
    
    ratings: z.object({
      min: z.number().min(1).max(5),
      max: z.number().min(1).max(5),
    }).refine(
      data => data.min <= data.max,
      'Minimum rating must be less than or equal to maximum rating'
    ).optional(),
    
    verified: z.boolean().optional(),
    
    hasMedia: z.boolean().optional(),
    
    mediaType: z.enum(['image', 'video']).optional(),
    
    status: z.array(z.enum([
      'pending',
      'approved',
      'rejected',
      'flagged',
      'featured'
    ])).optional(),
    
    sentiment: z.array(z.enum(['positive', 'neutral', 'negative'])).optional(),
    
    dateRange: z.object({
      startDate: z.date(),
      endDate: z.date(),
    }).refine(
      data => data.startDate <= data.endDate,
      'Start date must be before or equal to end date'
    ).optional(),
    
    usageContext: z.array(z.enum([
      'personal',
      'business',
      'gift',
      'professional',
      'hospitality',
      'healthcare',
      'education',
      'other'
    ])).optional(),
    
    usageDuration: z.array(z.enum([
      'less_than_week',
      'week_to_month',
      'month_to_three_months',
      'three_to_six_months',
      'six_months_to_year',
      'more_than_year'
    ])).optional(),
    
    wouldRecommend: z.boolean().optional(),
    
    hasResponse: z.boolean().optional(),
    
    helpfulVotes: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
    }).optional(),
    
    tags: z.array(z.string()).optional(),
    
    userIds: z.array(z.string()).optional(),
    
    anonymous: z.boolean().optional(),
    
    incentivized: z.boolean().optional(),
  }).optional(),
  
  sortBy: z.enum([
    'date_desc',
    'date_asc',
    'rating_desc',
    'rating_asc',
    'helpful_desc',
    'helpful_asc',
    'relevance'
  ]).default('date_desc'),
  
  page: z.number().min(1).default(1),
  
  limit: z.number().min(1).max(100).default(20),
  
  includeResponses: z.boolean().default(false),
  
  includeMedia: z.boolean().default(false),
  
  includeUserProfile: z.boolean().default(false),
});

export type ReviewSearchData = z.infer<typeof reviewSearchSchema>;

// Review analytics schema
export const reviewAnalyticsSchema = z.object({
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
      'total_reviews',
      'average_rating',
      'rating_distribution',
      'sentiment_analysis',
      'response_rate',
      'helpful_votes',
      'media_uploads',
      'verification_rate',
      'recommendation_rate'
    ]))
    .min(1, 'At least one metric is required')
    .max(9, 'Too many metrics selected'),
  
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'product', 'category']).default('month'),
  
  segmentBy: z.enum([
    'rating',
    'verification_status',
    'sentiment',
    'usage_context',
    'user_profile',
    'incentive_type'
  ]).optional(),
  
  includeComparison: z.boolean().default(false),
  
  includeDetails: z.boolean().default(false),
  
  includeTopReviews: z.boolean().default(false),
  
  includeKeywords: z.boolean().default(false),
});

export type ReviewAnalyticsData = z.infer<typeof reviewAnalyticsSchema>;

// Review voting schema
export const reviewVotingSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  
  voteType: z.enum(['helpful', 'not_helpful']),
  
  reason: z.enum([
    'informative',
    'detailed',
    'honest',
    'relevant',
    'not_relevant',
    'unclear',
    'biased',
    'spam'
  ]).optional(),
  
  comment: z
    .string()
    .max(500, 'Comment must not exceed 500 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
});

export type ReviewVotingData = z.infer<typeof reviewVotingSchema>;

// Review report schema
export const reportReviewSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  
  reason: z.enum([
    'inappropriate_content',
    'spam',
    'fake_review',
    'harassment',
    'personal_information',
    'profanity',
    'copyright_violation',
    'off_topic',
    'misleading',
    'other'
  ]),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .transform(val => val.trim()),
  
  evidence: z
    .array(reviewMediaSchema)
    .max(3, 'Maximum 3 evidence files allowed')
    .optional(),
  
  anonymous: z.boolean().default(false),
});

export type ReportReviewData = z.infer<typeof reportReviewSchema>;

// Bulk review operations schema
export const bulkReviewOperationSchema = z.object({
  operation: z.enum([
    'approve',
    'reject',
    'flag',
    'unflag',
    'feature',
    'unfeature',
    'delete',
    'export'
  ]),
  
  reviewIds: z
    .array(z.string().min(1))
    .min(1, 'At least one review required')
    .max(500, 'Maximum 500 reviews allowed'),
  
  moderatorNotes: z
    .string()
    .max(1000, 'Moderator notes must not exceed 1000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  rejectionReason: z.enum([
    'inappropriate_content',
    'spam',
    'fake_review',
    'off_topic',
    'personal_information',
    'profanity',
    'copyright_violation',
    'other'
  ]).optional(),
  
  notifyUsers: z.boolean().default(true),
  
  autoModeration: z.boolean().default(false),
  
  filters: z.object({
    productIds: z.array(z.string()).optional(),
    ratings: z.array(z.number().min(1).max(5)).optional(),
    status: z.array(z.string()).optional(),
    dateRange: z.object({
      startDate: z.date(),
      endDate: z.date(),
    }).optional(),
  }).optional(),
  
  dryRun: z.boolean().default(false),
});

export type BulkReviewOperationData = z.infer<typeof bulkReviewOperationSchema>;

// Review template schema (for merchant responses)
export const reviewResponseTemplateSchema = z.object({
  name: z
    .string()
    .min(3, 'Template name must be at least 3 characters')
    .max(100, 'Template name must not exceed 100 characters')
    .transform(val => val.trim()),
  
  title: z
    .string()
    .min(5, 'Template title must be at least 5 characters')
    .max(150, 'Template title must not exceed 150 characters')
    .transform(val => val.trim()),
  
  content: z
    .string()
    .min(20, 'Template content must be at least 20 characters')
    .max(1500, 'Template content must not exceed 1500 characters')
    .transform(val => val.trim()),
  
  variables: z
    .array(z.string().min(1).max(50))
    .max(10, 'Maximum 10 variables allowed')
    .optional(),
  
  category: z.enum([
    'positive',
    'negative',
    'neutral',
    'complaint',
    'question',
    'appreciation',
    'general'
  ]),
  
  rating: z.enum(['all', '1', '2', '3', '4', '5']).default('all'),
  
  isActive: z.boolean().default(true),
  
  isDefault: z.boolean().default(false),
  
  autoApply: z.boolean().default(false),
  
  conditions: z.object({
    ratingRange: z.object({
      min: z.number().min(1).max(5),
      max: z.number().min(1).max(5),
    }).optional(),
    keywords: z.array(z.string()).optional(),
    sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  }).optional(),
});

export type ReviewResponseTemplateData = z.infer<typeof reviewResponseTemplateSchema>;

// Export all schemas
export const reviewSchemas = {
  ratingBreakdown: ratingBreakdownSchema,
  reviewMedia: reviewMediaSchema,
  createReview: createReviewSchema,
  updateReview: updateReviewSchema,
  moderateReview: moderateReviewSchema,
  reviewResponse: reviewResponseSchema,
  reviewSearch: reviewSearchSchema,
  reviewAnalytics: reviewAnalyticsSchema,
  reviewVoting: reviewVotingSchema,
  reportReview: reportReviewSchema,
  bulkReviewOperation: bulkReviewOperationSchema,
  reviewResponseTemplate: reviewResponseTemplateSchema,
};

export default reviewSchemas;
