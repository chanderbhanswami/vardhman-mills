import { 
  ID, 
  Timestamp, 
  BaseEntity, 
  ImageAsset, 
  Price
} from './common.types';
import type { Product, ProductVariant } from './product.types';
import type { User } from './user.types';

// Wishlist Types
export interface Wishlist extends BaseEntity {
  userId: ID;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  shareUrl?: string;
  
  // Items
  items: WishlistItem[];
  itemCount: number;
  
  // Sharing
  sharedWith: WishlistShare[];
  
  // Analytics
  viewCount: number;
  shareCount: number;
}

export interface WishlistItem extends BaseEntity {
  wishlistId: ID;
  productId: ID;
  product: Product;
  variantId?: ID;
  variant?: ProductVariant;
  
  // Metadata
  addedAt: Timestamp;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Notifications
  priceAlertEnabled: boolean;
  stockAlertEnabled: boolean;
  originalPrice?: Price;
  
  // Status
  isAvailable: boolean;
  priceChanged: boolean;
  priceChangePercentage?: number;
}

export interface WishlistShare {
  id: ID;
  wishlistId: ID;
  recipientEmail: string;
  recipientName?: string;
  message?: string;
  sharedAt: Timestamp;
  viewedAt?: Timestamp;
  isViewed: boolean;
  accessLevel: 'view' | 'collaborate';
}

export interface WishlistFilters {
  isPublic?: boolean;
  hasItems?: boolean;
  search?: string;
  sortBy?: 'created_at' | 'updated_at' | 'name' | 'item_count';
  sortOrder?: 'asc' | 'desc';
}

// Reviews and Ratings Types
export interface Review extends BaseEntity {
  // Basic Information
  userId: ID;
  user: ReviewUser;
  productId: ID;
  product: Product;
  variantId?: ID;
  variant?: ProductVariant;
  orderId?: ID;
  orderItemId?: ID;
  
  // Review Content
  rating: number; // 1-5
  title: string;
  content: string;
  
  // Media
  images: ImageAsset[];
  videos?: VideoAsset[];
  
  // Status
  status: ReviewStatus;
  isVerified: boolean; // verified purchase
  
  // Moderation
  moderationStatus: ModerationStatus;
  moderatedBy?: ID;
  moderatedAt?: Timestamp;
  moderationNotes?: string;
  
  // Engagement
  helpfulCount: number;
  notHelpfulCount: number;
  reportCount: number;
  
  // Responses
  replies: ReviewReply[];
  vendorResponse?: VendorResponse;
  
  // Metadata
  isEdited: boolean;
  editedAt?: Timestamp;
  ipAddress?: string;
  userAgent?: string;
  
  // Analytics
  viewCount: number;
}

export interface ReviewUser {
  id: ID;
  firstName: string;
  lastName: string;
  avatar?: ImageAsset;
  isVerified: boolean;
  reviewCount: number;
  averageRating: number;
  displayName?: string;
}

export type ReviewStatus = 
  | 'draft'
  | 'published'
  | 'hidden'
  | 'deleted'
  | 'flagged'
  | 'under_review';

export type ModerationStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'auto_approved'
  | 'requires_review'
  | 'spam'
  | 'inappropriate';

export interface ReviewReply extends BaseEntity {
  reviewId: ID;
  userId: ID;
  user: ReviewUser;
  content: string;
  
  // Status
  status: ReviewStatus;
  moderationStatus: ModerationStatus;
  
  // Parent Reply (for nested replies)
  parentReplyId?: ID;
  parentReply?: ReviewReply;
  
  // Engagement
  helpfulCount: number;
  reportCount: number;
  
  // Metadata
  isEdited: boolean;
  editedAt?: Timestamp;
}

export interface VendorResponse extends BaseEntity {
  reviewId: ID;
  respondedBy: ID;
  responderName: string;
  responderRole: 'admin' | 'vendor' | 'customer_service';
  content: string;
  
  // Status
  isPublished: boolean;
  publishedAt?: Timestamp;
  
  // Metadata
  isEdited: boolean;
  editedAt?: Timestamp;
}

export interface ReviewForm {
  productId: ID;
  variantId?: ID;
  orderId?: ID;
  orderItemId?: ID;
  rating: number;
  title: string;
  content: string;
  images?: File[];
  videos?: File[];
  recommend: boolean;
}

export interface ReviewFilters {
  productId?: ID;
  userId?: ID;
  rating?: number[];
  status?: ReviewStatus[];
  moderationStatus?: ModerationStatus[];
  isVerified?: boolean;
  hasImages?: boolean;
  hasVideos?: boolean;
  dateRange?: {
    from: Timestamp;
    to: Timestamp;
  };
  search?: string;
  sortBy?: 'created_at' | 'rating' | 'helpful_count' | 'view_count';
  sortOrder?: 'asc' | 'desc';
}

export interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  verifiedPurchasePercentage: number;
  responseRate: number;
  helpfulnessRate: number;
  reviewsWithImages: number;
  reviewsWithVideos: number;
  topKeywords: Array<{
    keyword: string;
    count: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  sentimentAnalysis: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

// Address Management Types
export interface AddressBook {
  userId: ID;
  addresses: UserAddress[];
  defaultShippingAddressId?: ID;
  defaultBillingAddressId?: ID;
}

export interface UserAddress extends BaseEntity {
  userId: ID;
  
  // Address Type
  type: AddressType;
  label?: string;
  
  // Contact Information
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  email?: string;
  
  // Address Details
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
  
  // Preferences
  isDefault: boolean;
  isVerified: boolean;
  
  // Usage Tracking
  lastUsedAt?: Timestamp;
  usageCount: number;
  
  // Delivery Instructions
  deliveryInstructions?: string;
  specialInstructions?: string;
  
  // Validation
  validationStatus: AddressValidationStatus;
  validationNotes?: string;
}

export type AddressType = 
  | 'home'
  | 'office'
  | 'apartment'
  | 'business'
  | 'po_box'
  | 'hotel'
  | 'other';

export type AddressValidationStatus = 
  | 'valid'
  | 'invalid'
  | 'unverified'
  | 'requires_correction'
  | 'delivery_failed';

export interface AddressForm {
  type: AddressType;
  label?: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
  isDefault: boolean;
  deliveryInstructions?: string;
  specialInstructions?: string;
}

// User Preferences Types
export interface UserPreferences extends BaseEntity {
  userId: ID;
  
  // Shopping Preferences
  preferredCategories: ID[];
  preferredBrands: ID[];
  preferredPriceRange: {
    min: number;
    max: number;
  };
  preferredColors: string[];
  preferredSizes: string[];
  
  // Notification Preferences
  notifications: NotificationPreferences;
  
  // Display Preferences
  display: DisplayPreferences;
  
  // Privacy Preferences
  privacy: PrivacyPreferences;
  
  // Communication Preferences
  communication: CommunicationPreferences;
  
  // Accessibility Preferences
  accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
  orderUpdates: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  marketingOffers: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  priceAlerts: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  stockAlerts: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  newArrivals: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  salesAndDiscounts: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  reviewReminders: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  wishlistUpdates: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

export interface DisplayPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'hi';
  currency: 'INR' | 'USD';
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  productsPerPage: number;
  defaultSort: 'relevance' | 'price_low' | 'price_high' | 'newest' | 'rating';
  showOutOfStock: boolean;
  autoPlayVideos: boolean;
  showRecommendations: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'friends_only';
  showPurchaseHistory: boolean;
  showWishlist: boolean;
  showReviews: boolean;
  allowPersonalization: boolean;
  allowDataCollection: boolean;
  allowThirdPartySharing: boolean;
  allowLocationTracking: boolean;
  allowCookies: boolean;
  allowAnalytics: boolean;
  allowMarketing: boolean;
}

export interface CommunicationPreferences {
  preferredChannel: 'email' | 'sms' | 'phone' | 'app';
  contactTimePreference: 'morning' | 'afternoon' | 'evening' | 'anytime';
  languagePreference: 'en' | 'hi';
  allowSurveys: boolean;
  allowFeedbackRequests: boolean;
  allowPromotionalCalls: boolean;
  allowMarketResearch: boolean;
  subscriptions: {
    newsletter: boolean;
    productUpdates: boolean;
    tipsAndTutorials: boolean;
    industryNews: boolean;
    expertAdvice: boolean;
  };
}

export interface AccessibilityPreferences {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  colorBlindFriendly: boolean;
  audioDescriptions: boolean;
  closedCaptions: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra_large';
  focusIndicator: boolean;
}

// User Activity and History Types
export interface UserActivity extends BaseEntity {
  userId: ID;
  type: ActivityType;
  entityType: string;
  entityId: ID;
  
  // Activity Details
  description: string;
  metadata: Record<string, string | number | boolean>;
  
  // Context
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  
  // Location
  location?: {
    country?: string;
    state?: string;
    city?: string;
  };
  
  // Performance
  loadTime?: number;
  
  // Source
  source: 'web' | 'mobile' | 'app' | 'api';
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export type ActivityType = 
  | 'page_view'
  | 'product_view'
  | 'search'
  | 'filter_applied'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'add_to_wishlist'
  | 'remove_from_wishlist'
  | 'start_checkout'
  | 'complete_checkout'
  | 'abandon_cart'
  | 'review_written'
  | 'review_helpful'
  | 'share_product'
  | 'save_product'
  | 'compare_products'
  | 'contact_support'
  | 'newsletter_signup'
  | 'account_created'
  | 'profile_updated'
  | 'password_changed'
  | 'logout'
  | 'session_timeout';

export interface BrowsingHistory extends BaseEntity {
  userId: ID;
  productId: ID;
  product: Product;
  variantId?: ID;
  variant?: ProductVariant;
  
  // Visit Details
  viewedAt: Timestamp;
  viewDuration: number; // seconds
  source: string;
  
  // Interaction
  interactionLevel: 'view' | 'engage' | 'deep_view';
  scrollDepth: number; // percentage
  clickedElements: string[];
  
  // Context
  sessionId: string;
  referrer?: string;
  searchQuery?: string;
}

export interface SearchHistory extends BaseEntity {
  userId: ID;
  query: string;
  filters?: Record<string, string | number | boolean>;
  
  // Results
  resultCount: number;
  clickedProducts: ID[];
  
  // Context
  sessionId: string;
  source: 'search_bar' | 'voice_search' | 'barcode_scan' | 'image_search';
  
  // Performance
  searchTime: number; // milliseconds
  resultClickedAt?: Timestamp;
  
  // Success Metrics
  hasResults: boolean;
  hasClicks: boolean;
  leadToConversion: boolean;
}

// Comparison Types
export interface ProductComparison extends BaseEntity {
  userId: ID;
  name?: string;
  products: ComparisonProduct[];
  
  // Metadata
  isPublic: boolean;
  shareUrl?: string;
  
  // Analytics
  viewCount: number;
  shareCount: number;
}

export interface ComparisonProduct {
  productId: ID;
  product: Product;
  variantId?: ID;
  variant?: ProductVariant;
  addedAt: Timestamp;
  notes?: string;
}

// Social Features
export interface ProductShare extends BaseEntity {
  userId: ID;
  user: User;
  productId: ID;
  product: Product;
  
  // Share Details
  platform: SharePlatform;
  shareUrl: string;
  message?: string;
  
  // Analytics
  clicks: number;
  conversions: number;
  
  // Context
  source: 'product_page' | 'wishlist' | 'comparison' | 'cart';
}

export type SharePlatform = 
  | 'facebook'
  | 'twitter'
  | 'instagram'
  | 'whatsapp'
  | 'telegram'
  | 'linkedin'
  | 'pinterest'
  | 'email'
  | 'sms'
  | 'copy_link'
  | 'qr_code';

// Loyalty and Rewards (User Perspective)
export interface UserLoyalty extends BaseEntity {
  userId: ID;
  programId: ID;
  
  // Points
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  currentBalance: number;
  
  // Tier
  currentTier: string;
  tierProgress: {
    currentPoints: number;
    nextTierPoints: number;
    percentage: number;
  };
  
  // History
  transactions: LoyaltyTransaction[];
  rewards: RedeemedReward[];
  
  // Status
  isActive: boolean;
  enrolledAt: Timestamp;
  lastActivityAt: Timestamp;
}

export interface LoyaltyTransaction extends BaseEntity {
  userId: ID;
  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  points: number;
  balance: number;
  
  // Source
  source: LoyaltySource;
  sourceId?: ID; // order ID, review ID, etc.
  
  // Details
  description: string;
  expiresAt?: Timestamp;
  
  // Metadata
  multiplier?: number;
  bonusPoints?: number;
}

export type LoyaltySource = 
  | 'purchase'
  | 'review'
  | 'referral'
  | 'birthday'
  | 'anniversary'
  | 'social_share'
  | 'survey'
  | 'bonus'
  | 'adjustment'
  | 'redemption'
  | 'expiry';

export interface RedeemedReward extends BaseEntity {
  userId: ID;
  rewardId: ID;
  rewardName: string;
  pointsCost: number;
  
  // Status
  status: 'pending' | 'active' | 'used' | 'expired' | 'cancelled';
  
  // Usage
  redeemedAt: Timestamp;
  usedAt?: Timestamp;
  expiresAt?: Timestamp;
  
  // Details
  couponCode?: string;
  instructions?: string;
  
  // Order Association
  orderId?: ID;
}

// Recommendations
export interface UserRecommendations {
  userId: ID;
  
  // Product Recommendations
  forYou: ProductRecommendation[];
  trending: ProductRecommendation[];
  newArrivals: ProductRecommendation[];
  similarToPurchased: ProductRecommendation[];
  basedOnWishlist: ProductRecommendation[];
  frequentlyBoughtTogether: ProductRecommendation[];
  
  // Category Recommendations
  suggestedCategories: CategoryRecommendation[];
  
  // Brand Recommendations
  suggestedBrands: BrandRecommendation[];
  
  // Last Updated
  lastUpdated: Timestamp;
  
  // Personalization Score
  personalizationScore: number;
}

export interface ProductRecommendation {
  productId: ID;
  product: Product;
  score: number;
  reason: string;
  reasonType: RecommendationReason;
  
  // Context
  context?: {
    sourceProductId?: ID;
    sourceCategory?: ID;
    sourceBrand?: ID;
  };
}

export type RecommendationReason = 
  | 'frequently_bought_together'
  | 'customers_also_viewed'
  | 'similar_products'
  | 'trending_in_category'
  | 'based_on_purchases'
  | 'based_on_wishlist'
  | 'based_on_browsing'
  | 'seasonal_trend'
  | 'price_match'
  | 'brand_affinity'
  | 'category_preference'
  | 'ai_recommendation';

export interface CategoryRecommendation {
  categoryId: ID;
  categoryName: string;
  score: number;
  reason: string;
  productCount: number;
}

export interface BrandRecommendation {
  brandId: ID;
  brandName: string;
  score: number;
  reason: string;
  productCount: number;
  logo?: ImageAsset;
}

// For imports since they're referenced
interface VideoAsset {
  id: ID;
  url: string;
  title?: string;
}
