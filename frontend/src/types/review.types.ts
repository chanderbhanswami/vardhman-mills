/**
 * Review and Rating Types - Vardhman Mills Frontend
 * 
 * Comprehensive type definitions for product reviews, ratings, feedback systems,
 * review moderation, analytics, and user-generated content management.
 * 
 * @version 1.0.0
 * @created 2024-01-12
 */

import { ID, Timestamp, BaseEntity, ImageAsset } from './common.types';
import type { ProductVariant } from './product.types';
import type { Order, OrderItem } from './order.types';

// ============================================================================
// REVIEW CORE TYPES
// ============================================================================

/**
 * Main product review structure
 */
export interface ProductReview extends BaseEntity {
  // Basic Information
  title: string;
  content: string;
  rating: number; // 1-5 stars
  
  // Author Information
  userId: ID;
  user: ReviewUser;
  authorName: string; // Display name or alias
  isVerifiedPurchaser: boolean;
  
  // Product Information
  productId: ID;
  product: ReviewProduct;
  variantId?: ID;
  variant?: ProductVariant;
  
  // Purchase Context
  orderId?: ID;
  order?: Order;
  orderItemId?: ID;
  orderItem?: OrderItem;
  purchaseDate?: Timestamp;
  
  // Media
  images: ReviewImage[];
  videos: ReviewVideo[];
  
  // Detailed Ratings
  detailedRatings: DetailedRating[];
  
  // Review Metadata
  helpfulVotes: number;
  unhelpfulVotes: number;
  reportCount: number;
  replyCount: number;
  
  // Moderation
  status: ReviewStatus;
  moderationInfo?: ReviewModeration;
  
  // Verification
  isVerified: boolean;
  verificationMethod?: VerificationMethod;
  verificationDate?: Timestamp;
  
  // Context
  reviewContext: ReviewContext;
  
  // Interaction
  likes: number;
  dislikes: number;
  shares: number;
  
  // Analytics
  viewCount: number;
  clickThroughCount: number;
  
  // Platform
  source: ReviewSource;
  isImported: boolean;
  importedFrom?: string;
  
  // Incentive
  incentive?: ReviewIncentive;
  
  // Response
  merchantResponse?: MerchantResponse;
  
  // Quality Score
  qualityScore: number; // 0-100
  qualityFactors: QualityFactor[];
  
  // Timestamps
  submittedAt: Timestamp;
  publishedAt?: Timestamp;
  lastModifiedAt?: Timestamp;
}

/**
 * Review status states
 */
export type ReviewStatus = 
  | 'pending'        // Awaiting moderation
  | 'approved'       // Published and visible
  | 'rejected'       // Rejected by moderation
  | 'flagged'        // Flagged for review
  | 'hidden'         // Hidden by admin
  | 'draft'          // User draft
  | 'archived'       // Archived/deleted
  | 'spam'           // Marked as spam
  | 'inappropriate'; // Inappropriate content

/**
 * Review verification methods
 */
export type VerificationMethod = 
  | 'purchase'       // Verified purchase
  | 'email'          // Email verification
  | 'phone'          // Phone verification
  | 'identity'       // Identity verification
  | 'manual'         // Manual verification
  | 'third_party'    // Third-party verification
  | 'social';        // Social media verification

/**
 * Review source platforms
 */
export type ReviewSource = 
  | 'website'        // Direct website review
  | 'mobile_app'     // Mobile app review
  | 'email'          // Email invitation
  | 'social_media'   // Social media
  | 'google'         // Google Reviews
  | 'facebook'       // Facebook Reviews
  | 'trustpilot'     // Trustpilot
  | 'amazon'         // Amazon Reviews
  | 'flipkart'       // Flipkart Reviews
  | 'myntra'         // Myntra Reviews
  | 'imported'       // Imported from other systems
  | 'api';           // API submission

// ============================================================================
// USER AND PRODUCT CONTEXT TYPES
// ============================================================================

/**
 * Simplified user info for reviews
 */
export interface ReviewUser {
  id: ID;
  displayName: string;
  avatar?: ImageAsset;
  isVerified: boolean;
  reviewCount: number;
  averageRating: number;
  helpfulVoteCount: number;
  badges: ReviewerBadge[];
  memberSince: Timestamp;
  lastActiveAt: Timestamp;
  location?: {
    city?: string;
    state?: string;
    country: string;
  };
  
  // Privacy settings
  showRealName: boolean;
  showLocation: boolean;
  showPurchaseHistory: boolean;
  
  // Reputation
  reputationScore: number;
  trustScore: number;
  expertiseAreas: string[];
}

/**
 * Reviewer badges and achievements
 */
export interface ReviewerBadge {
  id: ID;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: Timestamp;
  category: BadgeCategory;
  level?: number;
  requirements: BadgeRequirement[];
}

/**
 * Badge categories
 */
export type BadgeCategory = 
  | 'reviewer'       // Review-related badges
  | 'expert'         // Product expert badges
  | 'helpful'        // Helpful reviewer badges
  | 'verified'       // Verification badges
  | 'frequent'       // Frequent reviewer badges
  | 'quality'        // Quality content badges
  | 'early_adopter'  // Early adopter badges
  | 'influencer'     // Influencer badges
  | 'community';     // Community participation badges

/**
 * Badge requirements
 */
export interface BadgeRequirement {
  type: 'review_count' | 'helpful_votes' | 'rating_consistency' | 'media_uploads' | 'expertise_area' | 'verification_level';
  threshold: number;
  period?: 'all_time' | 'year' | 'month' | 'week';
}

/**
 * Simplified product info for reviews
 */
export interface ReviewProduct {
  id: ID;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category: string;
  images: ImageAsset[];
  
  // Review Summary
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
  
  // Pricing (for context)
  currentPrice: number;
  originalPrice?: number;
  currency: string;
}

/**
 * Rating distribution breakdown
 */
export interface RatingDistribution {
  5: number; // 5-star count
  4: number; // 4-star count
  3: number; // 3-star count
  2: number; // 2-star count
  1: number; // 1-star count
  total: number;
  average: number;
}

// ============================================================================
// DETAILED RATING TYPES
// ============================================================================

/**
 * Detailed aspect-based ratings
 */
export interface DetailedRating {
  aspect: RatingAspect;
  rating: number; // 1-5 stars
  weight: number; // Importance weight 0-1
  comment?: string;
}

/**
 * Rating aspects for different product categories
 */
export type RatingAspect = 
  // General aspects
  | 'overall_quality'
  | 'value_for_money'
  | 'design'
  | 'durability'
  | 'ease_of_use'
  | 'customer_service'
  | 'delivery_speed'
  | 'packaging'
  
  // Textile/Fashion specific
  | 'fabric_quality'
  | 'comfort'
  | 'fit'
  | 'color_accuracy'
  | 'stitching_quality'
  | 'shrinkage_resistance'
  | 'color_fastness'
  | 'breathability'
  | 'warmth'
  | 'softness'
  | 'style'
  | 'versatility'
  | 'size_accuracy'
  
  // Home textiles specific
  | 'absorbency'
  | 'thread_count'
  | 'wrinkle_resistance'
  | 'easy_care'
  | 'hypoallergenic'
  | 'antimicrobial'
  
  // Custom aspects
  | 'custom';

// ============================================================================
// MEDIA AND CONTENT TYPES
// ============================================================================

/**
 * Review image with metadata
 */
export interface ReviewImage extends ImageAsset {
  // Additional review-specific properties
  caption?: string;
  isBeforeAfter: boolean;
  beforeAfterType?: 'before' | 'after';
  context?: ImageContext;
  
  // Moderation
  isModerationApproved: boolean;
  moderationFlags: string[];
  
  // Analytics
  viewCount: number;
  likeCount: number;
  
  // Quality
  isHighQuality: boolean;
  qualityScore: number;
  
  // Usage rights
  hasUsageRights: boolean;
  canBeUsedForMarketing: boolean;
}

/**
 * Review video with metadata
 */
export interface ReviewVideo {
  id: ID;
  url: string;
  thumbnailUrl: string;
  duration: number; // seconds
  size: number; // bytes
  format: string;
  resolution: string;
  
  // Content
  title?: string;
  description?: string;
  transcript?: string;
  
  // Context
  context?: VideoContext;
  
  // Moderation
  isModerationApproved: boolean;
  moderationFlags: string[];
  
  // Analytics
  viewCount: number;
  playCount: number;
  averageWatchTime: number;
  
  // Quality
  isHighQuality: boolean;
  qualityScore: number;
  audioQuality: number;
  videoQuality: number;
  
  // Upload info
  uploadedAt: Timestamp;
  processedAt?: Timestamp;
  isProcessed: boolean;
}

/**
 * Image context types
 */
export type ImageContext = 
  | 'product_in_use'     // Product being used
  | 'product_unboxing'   // Unboxing experience
  | 'size_comparison'    // Size/scale reference
  | 'color_accuracy'     // Color representation
  | 'defect_damage'      // Showing defects/damage
  | 'installation'       // Installation process
  | 'before_after'       // Before/after comparison
  | 'styling'            // Fashion styling
  | 'fit_demonstration'  // Fit and sizing
  | 'texture_detail'     // Close-up texture
  | 'packaging'          // Product packaging
  | 'accessories'        // With accessories
  | 'lifestyle';         // Lifestyle context

/**
 * Video context types
 */
export type VideoContext = 
  | 'unboxing'          // Unboxing video
  | 'demonstration'     // Product demonstration
  | 'tutorial'          // How-to tutorial
  | 'comparison'        // Product comparison
  | 'styling'           // Styling video
  | 'fit_test'          // Fit and sizing test
  | 'durability_test'   // Testing durability
  | 'installation'      // Installation guide
  | 'maintenance'       // Care instructions
  | 'testimonial';      // Video testimonial

// ============================================================================
// REVIEW CONTEXT AND METADATA
// ============================================================================

/**
 * Review context and circumstances
 */
export interface ReviewContext {
  // Purchase context
  purchasePrice?: number;
  discountReceived?: number;
  purchaseChannel: 'online' | 'store' | 'marketplace' | 'wholesale' | 'other';
  
  // Usage context
  usageDuration?: number; // days
  usageFrequency: UsageFrequency;
  usageEnvironment?: string;
  usagePurpose: string[];
  
  // User demographics (anonymous)
  ageGroup?: AgeGroup;
  gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
  bodyType?: BodyType; // for clothing
  skinType?: SkinType; // for skincare/cosmetics
  
  // Seasonal context
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  climate?: 'tropical' | 'temperate' | 'arid' | 'polar';
  
  // Comparison context
  comparedWith?: string[]; // Other products compared
  previousExperience?: string; // Previous similar products
  
  // Occasion context
  occasion?: string[]; // When/where used
  
  // Size/fit context (for clothing)
  sizePurchased?: string;
  sizeUsuallyWear?: string;
  fitPreference?: 'tight' | 'fitted' | 'regular' | 'loose' | 'oversized';
  
  // Recommendation context
  wouldRecommend: boolean;
  recommendationReason?: string;
  recommendationAudience?: string[];
}

/**
 * Usage frequency options
 */
export type UsageFrequency = 
  | 'daily'
  | 'several_times_week'
  | 'weekly'
  | 'monthly'
  | 'occasionally'
  | 'rarely'
  | 'one_time';

/**
 * Age group classifications
 */
export type AgeGroup = 
  | 'under_18'
  | '18_24'
  | '25_34'
  | '35_44'
  | '45_54'
  | '55_64'
  | 'over_65';

/**
 * Body type classifications (for apparel)
 */
export type BodyType = 
  | 'petite'
  | 'tall'
  | 'plus_size'
  | 'athletic'
  | 'pear'
  | 'apple'
  | 'hourglass'
  | 'rectangle'
  | 'inverted_triangle';

/**
 * Skin type classifications
 */
export type SkinType = 
  | 'normal'
  | 'dry'
  | 'oily'
  | 'combination'
  | 'sensitive'
  | 'acne_prone'
  | 'mature';

// ============================================================================
// MODERATION AND QUALITY TYPES
// ============================================================================

/**
 * Review moderation information
 */
export interface ReviewModeration {
  // Moderation status
  status: ModerationStatus;
  moderatedBy?: ID;
  moderatedAt?: Timestamp;
  moderationReason?: string;
  moderationNotes?: string;
  
  // Automated checks
  automatedChecks: AutomatedCheck[];
  spamScore: number; // 0-100
  sentimentScore: number; // -1 to 1
  toxicityScore: number; // 0-100
  
  // Content analysis
  contentAnalysis: ContentAnalysis;
  
  // Flags and reports
  flags: ModerationFlag[];
  reports: ReviewReport[];
  
  // Review history
  moderationHistory: ModerationEvent[];
  
  // Appeals
  appeals: ModerationAppeal[];
}

/**
 * Moderation status
 */
export type ModerationStatus = 
  | 'pending'        // Awaiting moderation
  | 'auto_approved'  // Automatically approved
  | 'manual_approved' // Manually approved
  | 'rejected'       // Rejected
  | 'flagged'        // Flagged for review
  | 'appealed'       // Under appeal
  | 'escalated';     // Escalated to senior moderator

/**
 * Automated moderation checks
 */
export interface AutomatedCheck {
  type: AutomatedCheckType;
  passed: boolean;
  score: number; // 0-100
  confidence: number; // 0-100
  details?: string;
  timestamp: Timestamp;
}

/**
 * Types of automated checks
 */
export type AutomatedCheckType = 
  | 'spam_detection'
  | 'language_detection'
  | 'profanity_filter'
  | 'toxicity_check'
  | 'sentiment_analysis'
  | 'duplicate_detection'
  | 'fake_review_detection'
  | 'image_content_check'
  | 'video_content_check'
  | 'personal_info_detection'
  | 'competitor_mention'
  | 'url_link_check';

/**
 * Content analysis results
 */
export interface ContentAnalysis {
  // Language analysis
  language: string;
  languageConfidence: number;
  
  // Readability
  readabilityScore: number;
  wordCount: number;
  sentenceCount: number;
  
  // Sentiment
  overallSentiment: 'positive' | 'neutral' | 'negative';
  sentimentConfidence: number;
  emotionalTone: string[];
  
  // Topics
  extractedTopics: string[];
  productAspects: string[];
  
  // Quality indicators
  hasSpecificDetails: boolean;
  hasPersonalExperience: boolean;
  hasComparisons: boolean;
  hasRecommendations: boolean;
  
  // Potential issues
  potentialIssues: string[];
  warningFlags: string[];
}

/**
 * Moderation flags
 */
export interface ModerationFlag {
  type: FlagType;
  reason: string;
  flaggedBy?: ID; // User who flagged
  flaggedAt: Timestamp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved' | 'dismissed';
  resolvedBy?: ID;
  resolvedAt?: Timestamp;
  resolution?: string;
}

/**
 * Flag types
 */
export type FlagType = 
  | 'inappropriate_content'
  | 'spam'
  | 'fake_review'
  | 'offensive_language'
  | 'personal_information'
  | 'off_topic'
  | 'promotional_content'
  | 'copyright_violation'
  | 'competitor_sabotage'
  | 'incentivized_review'
  | 'review_bombing'
  | 'biased_review'
  | 'misleading_information';

/**
 * User reports on reviews
 */
export interface ReviewReport {
  id: ID;
  reportedBy: ID;
  reportType: FlagType;
  reason: string;
  additionalInfo?: string;
  reportedAt: Timestamp;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  investigatedBy?: ID;
  resolution?: string;
  resolvedAt?: Timestamp;
}

/**
 * Moderation event history
 */
export interface ModerationEvent {
  id: ID;
  action: ModerationAction;
  performedBy: ID;
  performedAt: Timestamp;
  reason?: string;
  notes?: string;
  previousStatus?: ModerationStatus;
  newStatus: ModerationStatus;
}

/**
 * Moderation actions
 */
export type ModerationAction = 
  | 'approve'
  | 'reject'
  | 'flag'
  | 'hide'
  | 'edit'
  | 'delete'
  | 'escalate'
  | 'request_revision'
  | 'restore'
  | 'ban_user'
  | 'verify'
  | 'feature';

/**
 * Moderation appeals
 */
export interface ModerationAppeal {
  id: ID;
  appealedBy: ID;
  appealedAt: Timestamp;
  reason: string;
  additionalInfo?: string;
  status: 'pending' | 'under_review' | 'approved' | 'denied';
  reviewedBy?: ID;
  reviewedAt?: Timestamp;
  response?: string;
  evidence?: AppealEvidence[];
}

/**
 * Appeal evidence
 */
export interface AppealEvidence {
  type: 'text' | 'image' | 'video' | 'document' | 'link';
  content: string;
  description?: string;
  uploadedAt: Timestamp;
}

/**
 * Quality factors for reviews
 */
export interface QualityFactor {
  factor: QualityFactorType;
  score: number; // 0-100
  weight: number; // 0-1
  description?: string;
}

/**
 * Quality factor types
 */
export type QualityFactorType = 
  | 'length_appropriateness'    // Content length is appropriate
  | 'specific_details'          // Contains specific product details
  | 'personal_experience'       // Shows personal experience
  | 'helpful_information'       // Provides helpful information
  | 'media_quality'            // Quality of uploaded media
  | 'writing_quality'          // Grammar, spelling, clarity
  | 'objectivity'              // Balanced and objective
  | 'originality'              // Original content
  | 'timeliness'               // Recent and relevant
  | 'verified_purchase'        // From verified purchase
  | 'expertise_level'          // Shows product knowledge
  | 'usage_duration'           // Long-term usage experience
  | 'comparison_value'         // Compares with alternatives
  | 'recommendation_clarity';  // Clear recommendation

// ============================================================================
// INCENTIVE AND REWARD TYPES
// ============================================================================

/**
 * Review incentive information
 */
export interface ReviewIncentive {
  // Incentive details
  type: IncentiveType;
  value?: number;
  description: string;
  
  // Campaign info
  campaignId?: ID;
  campaignName?: string;
  
  // Reward status
  isEarned: boolean;
  earnedAt?: Timestamp;
  claimedAt?: Timestamp;
  
  // Requirements
  requirements: IncentiveRequirement[];
  isQualified: boolean;
  
  // Disclosure
  mustDisclose: boolean;
  isDisclosed: boolean;
  disclosureText?: string;
}

/**
 * Types of review incentives
 */
export type IncentiveType = 
  | 'discount_coupon'    // Discount on future purchase
  | 'cashback'          // Cash reward
  | 'loyalty_points'    // Loyalty program points
  | 'free_product'      // Free product sample
  | 'early_access'      // Early access to products
  | 'contest_entry'     // Contest/sweepstakes entry
  | 'recognition'       // Public recognition/badge
  | 'none';             // No incentive

/**
 * Incentive requirements
 */
export interface IncentiveRequirement {
  type: 'minimum_length' | 'include_media' | 'verified_purchase' | 'minimum_rating' | 'specific_aspects';
  value?: number | string;
  description: string;
  isMet: boolean;
}

// ============================================================================
// MERCHANT RESPONSE TYPES
// ============================================================================

/**
 * Merchant response to reviews
 */
export interface MerchantResponse {
  id: ID;
  content: string;
  
  // Author
  respondedBy: ID;
  responderName: string;
  responderTitle?: string;
  
  // Timing
  respondedAt: Timestamp;
  responseTime: number; // Hours from review submission
  
  // Response details
  isPublic: boolean;
  responseType: ResponseType;
  tone: ResponseTone;
  
  // Actions offered
  actionsOffered: ResponseAction[];
  
  // Templates
  templateId?: ID;
  isTemplateUsed: boolean;
  
  // Moderation
  isModerationApproved: boolean;
  moderatedBy?: ID;
  moderatedAt?: Timestamp;
  
  // Analytics
  helpfulVotes: number;
  viewCount: number;
  
  // Follow-up
  followUpScheduled?: Timestamp;
  followUpCompleted?: boolean;
  
  // Effectiveness
  didResolveIssue?: boolean;
  customerSatisfaction?: number; // 1-5
}

/**
 * Response types
 */
export type ResponseType = 
  | 'appreciation'      // Thank you response
  | 'clarification'     // Providing clarification
  | 'apology'          // Apologizing for issues
  | 'resolution'       // Offering solution
  | 'information'      // Providing additional info
  | 'invitation'       // Inviting to contact
  | 'correction'       // Correcting misinformation
  | 'acknowledgment';  // Acknowledging feedback

/**
 * Response tone
 */
export type ResponseTone = 
  | 'professional'
  | 'friendly'
  | 'apologetic'
  | 'helpful'
  | 'empathetic'
  | 'grateful'
  | 'informative'
  | 'solution_focused';

/**
 * Actions offered in response
 */
export interface ResponseAction {
  type: ActionType;
  description: string;
  isCompleted?: boolean;
  completedAt?: Timestamp;
  trackingId?: string;
}

/**
 * Action types
 */
export type ActionType = 
  | 'refund'           // Offering refund
  | 'replacement'      // Offering replacement
  | 'discount'         // Offering discount
  | 'store_credit'     // Offering store credit
  | 'contact_support'  // Invitation to contact support
  | 'product_exchange' // Product exchange
  | 'quality_check'    // Quality assurance check
  | 'improvement'      // Product improvement commitment
  | 'education'        // Product education/guidance
  | 'feedback_collection'; // Request for more feedback

// ============================================================================
// REVIEW ANALYTICS AND INSIGHTS
// ============================================================================

/**
 * Review analytics and insights
 */
export interface ReviewAnalytics {
  // Overall metrics
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  
  // Time-based metrics
  reviewsThisMonth: number;
  reviewsLastMonth: number;
  monthlyGrowthRate: number;
  
  // Quality metrics
  averageQualityScore: number;
  verifiedPurchasePercentage: number;
  mediaUploadPercentage: number;
  
  // Engagement metrics
  averageHelpfulVotes: number;
  averageResponseTime: number; // hours
  responseRate: number; // percentage
  
  // Content analysis
  sentimentBreakdown: SentimentBreakdown;
  topMentionedAspects: AspectMention[];
  commonKeywords: KeywordMention[];
  
  // Reviewer insights
  topReviewers: TopReviewer[];
  newReviewerPercentage: number;
  repeatReviewerPercentage: number;
  
  // Product insights
  topRatedProducts: ProductRating[];
  mostReviewedProducts: ProductReviewCount[];
  improvementOpportunities: ImprovementOpportunity[];
  
  // Geographic insights
  reviewsByRegion: RegionMetrics[];
  
  // Moderation insights
  moderationRequired: number;
  spamDetected: number;
  flaggedReviews: number;
  
  // Business impact
  conversionImpact: ConversionImpact;
  revenueImpact?: RevenueImpact;
}

/**
 * Sentiment breakdown
 */
export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
}

/**
 * Aspect mentions in reviews
 */
export interface AspectMention {
  aspect: string;
  mentionCount: number;
  averageRating: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  trendDirection: 'improving' | 'declining' | 'stable';
}

/**
 * Keyword mentions
 */
export interface KeywordMention {
  keyword: string;
  count: number;
  sentiment: number; // -1 to 1
  context: string[];
}

/**
 * Top reviewer information
 */
export interface TopReviewer {
  userId: ID;
  displayName: string;
  reviewCount: number;
  averageRating: number;
  helpfulVoteCount: number;
  reputationScore: number;
}

/**
 * Product rating summary
 */
export interface ProductRating {
  productId: ID;
  productName: string;
  averageRating: number;
  reviewCount: number;
  trendDirection: 'improving' | 'declining' | 'stable';
}

/**
 * Product review count
 */
export interface ProductReviewCount {
  productId: ID;
  productName: string;
  reviewCount: number;
  averageRating: number;
  recentReviews: number; // Last 30 days
}

/**
 * Improvement opportunities
 */
export interface ImprovementOpportunity {
  area: string;
  issueCount: number;
  severityScore: number; // 1-10
  suggestedActions: string[];
  affectedProducts: ID[];
  estimatedImpact: 'low' | 'medium' | 'high';
}

/**
 * Regional metrics
 */
export interface RegionMetrics {
  region: string;
  reviewCount: number;
  averageRating: number;
  topConcerns: string[];
  satisfactionLevel: number; // 1-5
}

/**
 * Conversion impact
 */
export interface ConversionImpact {
  productsWithReviews: {
    conversionRate: number;
    averageOrderValue: number;
  };
  productsWithoutReviews: {
    conversionRate: number;
    averageOrderValue: number;
  };
  improvement: {
    conversionRateIncrease: number;
    averageOrderValueIncrease: number;
  };
}

/**
 * Revenue impact
 */
export interface RevenueImpact {
  attributedRevenue: number;
  period: 'month' | 'quarter' | 'year';
  revenuePerReview: number;
  returnOnInvestment: number;
}

// ============================================================================
// REVIEW COLLECTION AND CAMPAIGN TYPES
// ============================================================================

/**
 * Review collection campaign
 */
export interface ReviewCampaign extends BaseEntity {
  // Basic information
  name: string;
  description: string;
  type: CampaignType;
  
  // Targeting
  targetProducts: ID[];
  targetCategories: ID[];
  targetCustomers: CustomerSegment[];
  
  // Timing
  startDate: Timestamp;
  endDate?: Timestamp;
  isActive: boolean;
  
  // Invitation settings
  invitationSettings: InvitationSettings;
  
  // Incentives
  incentives: ReviewIncentive[];
  
  // Templates
  emailTemplates: EmailTemplate[];
  smsTemplates: SMSTemplate[];
  
  // Goals and metrics
  goals: CampaignGoal[];
  metrics: CampaignMetrics;
  
  // Automation
  automationRules: AutomationRule[];
  
  // Budget
  budget?: number;
  spentToDate?: number;
}

/**
 * Campaign types
 */
export type CampaignType = 
  | 'post_purchase'     // After purchase completion
  | 'product_launch'    // For new product launches
  | 'quality_assurance' // For quality feedback
  | 'seasonal'          // Seasonal campaigns
  | 'reactivation'      // For inactive customers
  | 'loyalty'           // For loyal customers
  | 'recovery'          // For negative feedback recovery
  | 'social_proof'      // For social proof building
  | 'competitive';      // Against competitor products

/**
 * Customer segments for targeting
 */
export interface CustomerSegment {
  segmentId: ID;
  name: string;
  criteria: SegmentCriteria;
  estimatedSize: number;
}

/**
 * Segment criteria
 */
export interface SegmentCriteria {
  // Purchase behavior
  totalOrders?: {
    min?: number;
    max?: number;
  };
  totalSpent?: {
    min?: number;
    max?: number;
  };
  lastPurchaseDate?: {
    after?: Timestamp;
    before?: Timestamp;
  };
  
  // Demographics
  ageRange?: {
    min: number;
    max: number;
  };
  location?: string[];
  
  // Engagement
  reviewHistory?: {
    hasReviewed: boolean;
    reviewCount?: number;
    lastReviewDate?: Timestamp;
  };
  
  // Product affinity
  preferredCategories?: string[];
  preferredBrands?: string[];
}

/**
 * Invitation settings
 */
export interface InvitationSettings {
  // Timing
  sendDelay: number; // days after purchase
  reminderSchedule: number[]; // days for reminders
  maxReminders: number;
  
  // Channels
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushNotificationEnabled: boolean;
  appNotificationEnabled: boolean;
  
  // Personalization
  personalizeContent: boolean;
  useProductImages: boolean;
  includeIncentives: boolean;
  
  // Frequency capping
  maxInvitationsPerMonth: number;
  respectUnsubscribe: boolean;
  
  // Language and localization
  defaultLanguage: string;
  supportedLanguages: string[];
  autoDetectLanguage: boolean;
}

/**
 * Email template for review invitations
 */
export interface EmailTemplate {
  id: ID;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  
  // Personalization
  variables: TemplateVariable[];
  
  // A/B testing
  isControl: boolean;
  variantId?: ID;
  
  // Performance
  sentCount: number;
  openRate: number;
  clickRate: number;
  reviewCompletionRate: number;
}

/**
 * SMS template for review invitations
 */
export interface SMSTemplate {
  id: ID;
  name: string;
  message: string;
  
  // Personalization
  variables: TemplateVariable[];
  
  // Performance
  sentCount: number;
  deliveryRate: number;
  clickRate: number;
  reviewCompletionRate: number;
}

/**
 * Template variables
 */
export interface TemplateVariable {
  name: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'url' | 'image';
  defaultValue?: string;
  isRequired: boolean;
}

/**
 * Campaign goals
 */
export interface CampaignGoal {
  metric: GoalMetric;
  target: number;
  current: number;
  isAchieved: boolean;
  deadline?: Timestamp;
}

/**
 * Goal metrics
 */
export type GoalMetric = 
  | 'review_count'
  | 'review_rate'
  | 'average_rating'
  | 'media_upload_rate'
  | 'quality_score'
  | 'response_rate'
  | 'conversion_impact'
  | 'customer_satisfaction';

/**
 * Campaign metrics and performance
 */
export interface CampaignMetrics {
  // Invitation metrics
  invitationsSent: number;
  emailsSent: number;
  smsSent: number;
  
  // Engagement metrics
  emailOpenRate: number;
  emailClickRate: number;
  smsClickRate: number;
  landingPageViews: number;
  
  // Conversion metrics
  reviewsSubmitted: number;
  reviewConversionRate: number;
  averageRating: number;
  
  // Quality metrics
  averageQualityScore: number;
  mediaUploadRate: number;
  verifiedPurchaseRate: number;
  
  // Cost metrics
  costPerReview: number;
  returnOnInvestment: number;
  
  // Time metrics
  averageTimeToSubmit: number; // hours
  campaignDuration: number; // days
  
  // Business impact
  estimatedRevenueImpact: number;
  conversionRateImprovement: number;
}

/**
 * Automation rules for campaigns
 */
export interface AutomationRule {
  id: ID;
  name: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  
  // Performance
  executionCount: number;
  successRate: number;
  lastExecuted?: Timestamp;
}

/**
 * Automation triggers
 */
export interface AutomationTrigger {
  type: TriggerType;
  config: Record<string, unknown>;
}

/**
 * Trigger types
 */
export type TriggerType = 
  | 'time_based'        // Scheduled trigger
  | 'event_based'       // Based on user action
  | 'metric_based'      // Based on performance metrics
  | 'condition_based'   // Based on custom conditions
  | 'manual';           // Manual trigger

/**
 * Automation conditions
 */
export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: string | number | boolean;
}

/**
 * Automation actions
 */
export interface AutomationAction {
  type: AutomationActionType;
  config: Record<string, unknown>;
}

/**
 * Automation action types
 */
export type AutomationActionType = 
  | 'send_invitation'   // Send review invitation
  | 'send_reminder'     // Send reminder
  | 'pause_campaign'    // Pause campaign
  | 'resume_campaign'   // Resume campaign
  | 'adjust_incentive'  // Adjust incentive
  | 'segment_customers' // Update customer segments
  | 'send_notification' // Send notification to team
  | 'escalate_issue'    // Escalate to management
  | 'update_settings';  // Update campaign settings

// ============================================================================
// API AND FORM TYPES
// ============================================================================

/**
 * Form data for submitting reviews
 */
export interface ReviewSubmissionForm {
  // Required fields
  productId: ID;
  variantId?: ID;
  rating: number;
  title: string;
  content: string;
  
  // Optional fields
  detailedRatings?: {
    aspect: RatingAspect;
    rating: number;
  }[];
  
  // Media uploads
  images?: File[];
  videos?: File[];
  
  // Context
  wouldRecommend?: boolean;
  usageDuration?: number;
  usageFrequency?: UsageFrequency;
  occasion?: string[];
  
  // Size/fit (for apparel)
  sizePurchased?: string;
  sizeUsuallyWear?: string;
  fitPreference?: string;
  
  // Privacy
  displayName?: string;
  showRealName?: boolean;
  allowMarketingUse?: boolean;
  
  // Verification
  orderNumber?: string;
  purchaseDate?: string;
  
  // Incentive acknowledgment
  incentiveReceived?: boolean;
  incentiveDisclosure?: string;
}

/**
 * Review update form
 */
export interface ReviewUpdateForm {
  title?: string;
  content?: string;
  rating?: number;
  detailedRatings?: {
    aspect: RatingAspect;
    rating: number;
  }[];
  wouldRecommend?: boolean;
  
  // Media updates
  addImages?: File[];
  removeImages?: ID[];
  addVideos?: File[];
  removeVideos?: ID[];
  
  // Privacy updates
  displayName?: string;
  showRealName?: boolean;
}

/**
 * Review list response
 */
export interface ReviewListResponse {
  reviews: ProductReview[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: ReviewFilters;
  sort: ReviewSort;
  aggregations: ReviewAggregations;
}

/**
 * Review filters
 */
export interface ReviewFilters {
  // Rating filters
  minRating?: number;
  maxRating?: number;
  ratings?: number[];
  
  // Content filters
  hasImages?: boolean;
  hasVideos?: boolean;
  hasDetailedRatings?: boolean;
  verifiedPurchaseOnly?: boolean;
  
  // Date filters
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  
  // User filters
  reviewerType?: ('all' | 'verified' | 'unverified' | 'frequent' | 'first_time')[];
  
  // Product filters
  productIds?: ID[];
  categoryIds?: ID[];
  brandIds?: ID[];
  
  // Quality filters
  minQualityScore?: number;
  minHelpfulVotes?: number;
  
  // Content filters
  searchQuery?: string;
  aspects?: RatingAspect[];
  sentiment?: ('positive' | 'neutral' | 'negative')[];
  
  // Status filters
  status?: ReviewStatus[];
  source?: ReviewSource[];
}

/**
 * Review sort options
 */
export interface ReviewSort {
  field: SortField;
  direction: 'asc' | 'desc';
}

/**
 * Sort fields
 */
export type SortField = 
  | 'createdAt'      // Date created
  | 'rating'         // Rating value
  | 'helpfulVotes'   // Helpful votes count
  | 'qualityScore'   // Quality score
  | 'verified'       // Verified purchase first
  | 'newest'         // Newest first
  | 'oldest'         // Oldest first
  | 'highest_rated'  // Highest rated first
  | 'lowest_rated'   // Lowest rated first
  | 'most_helpful'   // Most helpful first
  | 'with_media';    // With media first

/**
 * Review aggregations
 */
export interface ReviewAggregations {
  // Rating aggregations
  ratingDistribution: RatingDistribution;
  averageRating: number;
  
  // Aspect aggregations
  aspectRatings?: {
    [aspect: string]: {
      average: number;
      count: number;
    };
  };
  
  // Content aggregations
  withImagesCount: number;
  withVideosCount: number;
  verifiedPurchaseCount: number;
  
  // Quality aggregations
  averageQualityScore: number;
  highQualityCount: number; // Quality score > 80
  
  // Sentiment aggregations
  sentimentBreakdown: SentimentBreakdown;
  
  // Time aggregations
  reviewsByMonth: {
    [month: string]: number;
  };
}

// ============================================================================
// REVIEW WIDGETS AND DISPLAY TYPES
// ============================================================================

/**
 * Review widget configuration
 */
export interface ReviewWidget {
  id: ID;
  name: string;
  type: WidgetType;
  
  // Display settings
  displaySettings: WidgetDisplaySettings;
  
  // Content settings
  contentSettings: WidgetContentSettings;
  
  // Filtering
  filters: WidgetFilters;
  
  // Styling
  theme: WidgetTheme;
  
  // Behavior
  behavior: WidgetBehavior;
  
  // Installation
  embedCode: string;
  isActive: boolean;
  
  // Analytics
  viewCount: number;
  clickThroughRate: number;
  conversionRate: number;
}

/**
 * Widget types
 */
export type WidgetType = 
  | 'summary'        // Rating summary widget
  | 'latest'         // Latest reviews widget
  | 'featured'       // Featured reviews widget
  | 'carousel'       // Review carousel
  | 'grid'           // Review grid layout
  | 'list'           // Review list
  | 'floating'       // Floating review widget
  | 'sidebar'        // Sidebar widget
  | 'modal'          // Modal popup
  | 'inline'         // Inline with content
  | 'badges'         // Review badges/seals
  | 'comparison';    // Product comparison

/**
 * Widget display settings
 */
export interface WidgetDisplaySettings {
  // Layout
  layout: 'horizontal' | 'vertical' | 'grid' | 'carousel';
  maxReviews: number;
  showPagination: boolean;
  
  // Elements to show
  showRating: boolean;
  showReviewCount: boolean;
  showReviewText: boolean;
  showReviewerName: boolean;
  showReviewDate: boolean;
  showVerifiedBadge: boolean;
  showHelpfulVotes: boolean;
  showImages: boolean;
  showVideos: boolean;
  
  // Rating display
  ratingStyle: 'stars' | 'numbers' | 'both';
  starStyle: 'filled' | 'outlined' | 'custom';
  starColor: string;
  
  // Responsive
  responsive: boolean;
  mobileLayout?: 'stack' | 'slide' | 'collapse';
  
  // Animation
  enableAnimations: boolean;
  animationDuration: number;
}

/**
 * Widget content settings
 */
export interface WidgetContentSettings {
  // Content length
  maxTitleLength: number;
  maxContentLength: number;
  showFullContent: boolean;
  truncateText: boolean;
  
  // Content filtering
  minRating: number;
  requireVerifiedPurchase: boolean;
  requireImages: boolean;
  
  // Language
  language: string;
  showTranslation: boolean;
  
  // Freshness
  maxAge: number; // days
  prioritizeRecent: boolean;
}

/**
 * Widget filters
 */
export interface WidgetFilters {
  // Product filtering
  productIds?: ID[];
  categoryIds?: ID[];
  brandIds?: ID[];
  
  // Quality filtering
  minQualityScore?: number;
  featuredOnly?: boolean;
  
  // Content filtering
  aspects?: RatingAspect[];
  withMediaOnly?: boolean;
}

/**
 * Widget theme and styling
 */
export interface WidgetTheme {
  // Colors
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  
  // Typography
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  
  // Spacing
  padding: string;
  margin: string;
  borderRadius: string;
  
  // Custom CSS
  customCSS?: string;
  
  // Branding
  showBranding: boolean;
  brandingText?: string;
  logoUrl?: string;
}

/**
 * Widget behavior settings
 */
export interface WidgetBehavior {
  // Loading
  lazyLoad: boolean;
  loadingAnimation: boolean;
  
  // Interaction
  clickable: boolean;
  expandable: boolean;
  sortable: boolean;
  filterable: boolean;
  
  // Navigation
  enableSearch: boolean;
  enableSorting: boolean;
  enableFiltering: boolean;
  
  // Performance
  cacheTimeout: number; // minutes
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  
  // Analytics
  trackViews: boolean;
  trackClicks: boolean;
  trackEngagement: boolean;
}

// All types are exported inline, no additional exports needed
export default ProductReview;