import { 
  ID, 
  Timestamp, 
  BaseEntity 
} from './common.types';

// User Preferences Types
export interface UserPreferences extends BaseEntity {
  userId: ID;
  
  // Shopping Preferences
  shopping: ShoppingPreferences;
  
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
  
  // Personalization Preferences
  personalization: PersonalizationPreferences;
}

export interface ShoppingPreferences {
  // Category Preferences
  preferredCategories: ID[];
  dislikedCategories: ID[];
  
  // Brand Preferences
  preferredBrands: ID[];
  dislikedBrands: ID[];
  
  // Price Preferences
  preferredPriceRange: {
    min: number;
    max: number;
  };
  budgetAlert: boolean;
  budgetLimit?: number;
  
  // Style Preferences
  preferredColors: string[];
  preferredMaterials: string[];
  preferredStyles: string[];
  
  // Size Preferences
  defaultSizes: {
    [category: string]: string;
  };
  
  // Room Preferences (for home furnishing)
  roomTypes: RoomType[];
  homeStyle: HomeStyle[];
  
  // Quality Preferences
  preferredQualityLevel: 'budget' | 'mid_range' | 'premium' | 'luxury';
  ecoFriendlyOnly: boolean;
  sustainabilityImportant: boolean;
  
  // Delivery Preferences
  preferredDeliveryTime: 'morning' | 'afternoon' | 'evening' | 'anytime';
  deliveryInstructions: string;
  assemblyService: boolean;
  installationService: boolean;
  
  // Purchase Behavior
  impulseControlMode: boolean;
  wishlistReminders: boolean;
  priceDropAlerts: boolean;
  stockAlerts: boolean;
  
  // Recommendations
  showRecommendations: boolean;
  recommendationTypes: RecommendationType[];
  diversityInRecommendations: boolean;
}

export type RoomType = 
  | 'living_room'
  | 'bedroom'
  | 'dining_room'
  | 'kitchen'
  | 'bathroom'
  | 'home_office'
  | 'guest_room'
  | 'kids_room'
  | 'balcony'
  | 'garden'
  | 'basement'
  | 'attic'
  | 'garage';

export type HomeStyle = 
  | 'modern'
  | 'contemporary'
  | 'traditional'
  | 'rustic'
  | 'industrial'
  | 'scandinavian'
  | 'bohemian'
  | 'minimalist'
  | 'vintage'
  | 'eclectic'
  | 'art_deco'
  | 'mid_century'
  | 'colonial'
  | 'farmhouse'
  | 'mediterranean';

export type RecommendationType = 
  | 'similar_products'
  | 'trending_items'
  | 'price_based'
  | 'brand_based'
  | 'category_based'
  | 'seasonal'
  | 'new_arrivals'
  | 'frequently_bought_together'
  | 'recently_viewed'
  | 'wishlist_based';

export interface NotificationPreferences {
  // Order Notifications
  orderUpdates: NotificationChannel;
  orderConfirmation: NotificationChannel;
  shippingUpdates: NotificationChannel;
  deliveryNotifications: NotificationChannel;
  
  // Marketing Notifications
  marketingOffers: NotificationChannel;
  salesAndDiscounts: NotificationChannel;
  newArrivals: NotificationChannel;
  seasonalOffers: NotificationChannel;
  flashSales: NotificationChannel;
  
  // Product Notifications
  priceAlerts: NotificationChannel;
  stockAlerts: NotificationChannel;
  wishlistUpdates: NotificationChannel;
  backInStock: NotificationChannel;
  
  // Social Notifications
  reviewReminders: NotificationChannel;
  reviewResponses: NotificationChannel;
  socialShares: NotificationChannel;
  friendActivity: NotificationChannel;
  
  // Account Notifications
  securityAlerts: NotificationChannel;
  passwordChanges: NotificationChannel;
  loginAttempts: NotificationChannel;
  accountUpdates: NotificationChannel;
  
  // Newsletter & Content
  newsletter: NotificationChannel;
  blogUpdates: NotificationChannel;
  expertTips: NotificationChannel;
  decoratingIdeas: NotificationChannel;
  
  // Timing Preferences
  frequency: NotificationFrequency;
  quietHours: QuietHours;
  weekendNotifications: boolean;
  holidayNotifications: boolean;
  
  // Advanced Settings
  groupSimilar: boolean;
  summaryMode: boolean;
  urgentOnly: boolean;
}

export interface NotificationChannel {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

export type NotificationFrequency = 
  | 'immediate'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'custom';

export interface QuietHours {
  enabled: boolean;
  start: string; // HH:MM format
  end: string; // HH:MM format
  timezone: string;
  weekdaysOnly: boolean;
}

export interface DisplayPreferences {
  // Theme and Appearance
  theme: 'light' | 'dark' | 'auto' | 'high_contrast';
  colorScheme: 'default' | 'warm' | 'cool' | 'vibrant' | 'muted';
  
  // Language and Locale
  language: 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'gu' | 'mr' | 'kn';
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  timezone: string;
  
  // Date and Time Formats
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD-MM-YYYY';
  timeFormat: '12h' | '24h';
  
  // Product Display
  productsPerPage: number;
  defaultView: 'grid' | 'list' | 'card';
  defaultSort: ProductSortOption;
  showOutOfStock: boolean;
  showPriceHistory: boolean;
  showReviews: boolean;
  showRatings: boolean;
  showComparisons: boolean;
  
  // Media Preferences
  autoPlayVideos: boolean;
  showAnimations: boolean;
  highQualityImages: boolean;
  showProductVideos: boolean;
  showARPreview: boolean;
  
  // Layout Preferences
  compactLayout: boolean;
  showSidebar: boolean;
  stickyHeader: boolean;
  breadcrumbNavigation: boolean;
  
  // Information Display
  showRecommendations: boolean;
  showRelatedProducts: boolean;
  showFrequentlyBought: boolean;
  showRecentlyViewed: boolean;
  showPriceComparison: boolean;
  showDeliveryEstimate: boolean;
  showStockLevels: boolean;
}

export type ProductSortOption = 
  | 'relevance'
  | 'price_low_to_high'
  | 'price_high_to_low'
  | 'newest_first'
  | 'oldest_first'
  | 'rating_high_to_low'
  | 'rating_low_to_high'
  | 'popularity'
  | 'discount'
  | 'name_a_to_z'
  | 'name_z_to_a';

export interface PrivacyPreferences {
  // Profile Privacy
  profileVisibility: 'public' | 'private' | 'friends_only';
  showName: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  
  // Activity Privacy
  showPurchaseHistory: boolean;
  showWishlist: boolean;
  showReviews: boolean;
  showRatings: boolean;
  showActivity: boolean;
  showBrowsingHistory: boolean;
  
  // Data Collection
  allowPersonalization: boolean;
  allowBehaviorTracking: boolean;
  allowLocationTracking: boolean;
  allowCookies: boolean;
  allowAnalytics: boolean;
  allowPerformanceTracking: boolean;
  
  // Third Party Sharing
  allowDataSharing: boolean;
  allowMarketingPartners: boolean;
  allowSocialIntegration: boolean;
  allowRecommendationSharing: boolean;
  
  // Search and Recommendations
  personalizedSearch: boolean;
  personalizedRecommendations: boolean;
  crossDeviceTracking: boolean;
  
  // Advertising
  personalizedAds: boolean;
  adTracking: boolean;
  socialAds: boolean;
  
  // Data Retention
  dataRetentionPeriod: number; // days
  autoDeleteHistory: boolean;
  exportDataOption: boolean;
  deleteAccountOption: boolean;
}

export interface CommunicationPreferences {
  // Preferred Communication
  preferredChannel: 'email' | 'sms' | 'phone' | 'chat' | 'app';
  secondaryChannel?: 'email' | 'sms' | 'phone' | 'chat' | 'app';
  
  // Timing Preferences
  contactTimePreference: 'morning' | 'afternoon' | 'evening' | 'anytime';
  preferredDays: string[]; // ['monday', 'tuesday', ...]
  
  // Language Preference
  languagePreference: 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'gu' | 'mr' | 'kn';
  dialectPreference?: string;
  
  // Communication Types
  allowSurveys: boolean;
  allowFeedbackRequests: boolean;
  allowPromotionalCalls: boolean;
  allowMarketResearch: boolean;
  allowCustomerService: boolean;
  
  // Content Subscriptions
  subscriptions: ContentSubscriptions;
  
  // Response Preferences
  responseTimeExpectation: '1hour' | '24hours' | '48hours' | '1week';
  preferredResponseFormat: 'brief' | 'detailed' | 'technical' | 'simple';
  
  // Social Communication
  allowSocialSharing: boolean;
  allowReviewSharing: boolean;
  allowReferrals: boolean;
}

export interface ContentSubscriptions {
  newsletter: boolean;
  productUpdates: boolean;
  tipsAndTutorials: boolean;
  industryNews: boolean;
  expertAdvice: boolean;
  decoratingIdeas: boolean;
  seasonalGuides: boolean;
  maintenanceTips: boolean;
  salesAlerts: boolean;
  eventInvites: boolean;
  catalogRequests: boolean;
  surveyInvites: boolean;
}

export interface AccessibilityPreferences {
  // Visual Accessibility
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  fontSize: FontSize;
  fontFamily: 'default' | 'dyslexic_friendly' | 'serif' | 'sans_serif';
  lineSpacing: 'normal' | 'increased' | 'double';
  
  // Motor Accessibility
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  stickyKeys: boolean;
  oneHandedMode: boolean;
  voiceNavigation: boolean;
  
  // Cognitive Accessibility
  simplifiedLayout: boolean;
  reducedComplexity: boolean;
  focusIndicator: boolean;
  timeoutExtension: boolean;
  autoSave: boolean;
  
  // Color and Visual
  colorBlindFriendly: boolean;
  colorFilters: ColorFilter[];
  contrastLevel: 'normal' | 'high' | 'maximum';
  
  // Audio and Video
  audioDescriptions: boolean;
  closedCaptions: boolean;
  signLanguage: boolean;
  audioControls: boolean;
  
  // Navigation
  skipLinks: boolean;
  landmarkNavigation: boolean;
  headingNavigation: boolean;
  breadcrumbsAlways: boolean;
  
  // Input Methods
  alternativeInput: boolean;
  gestureAlternatives: boolean;
  voiceCommands: boolean;
  eyeTracking: boolean;
}

export type FontSize = 
  | 'small'
  | 'medium'
  | 'large'
  | 'extra_large'
  | 'huge';

export type ColorFilter = 
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia'
  | 'blue_light_filter'
  | 'grayscale';

export interface PersonalizationPreferences {
  // AI and Machine Learning
  enableAI: boolean;
  aiRecommendations: boolean;
  aiChatbot: boolean;
  aiImageSearch: boolean;
  aiStyleAdvice: boolean;
  
  // Recommendation Settings
  recommendationAccuracy: 'basic' | 'moderate' | 'advanced' | 'maximum';
  includeNewBrands: boolean;
  exploreSimilarStyles: boolean;
  crossCategoryRecommendations: boolean;
  
  // Learning Preferences
  learnFromBrowsing: boolean;
  learnFromPurchases: boolean;
  learnFromWishlist: boolean;
  learnFromReviews: boolean;
  learnFromSearches: boolean;
  
  // Data Usage
  useHistoricalData: boolean;
  useDemographicData: boolean;
  useLocationData: boolean;
  useDeviceData: boolean;
  useSocialData: boolean;
  
  // Personalization Scope
  personalizeHomePage: boolean;
  personalizeSearch: boolean;
  personalizeCategories: boolean;
  personalizeEmails: boolean;
  personalizeAds: boolean;
  
  // Algorithm Preferences
  diversityLevel: 'low' | 'medium' | 'high';
  noveltyLevel: 'conservative' | 'moderate' | 'adventurous';
  serendipityEnabled: boolean;
  
  // Feedback and Training
  provideFeedback: boolean;
  correctRecommendations: boolean;
  rateRecommendations: boolean;
  explainPreferences: boolean;
}

// Preference Templates and Presets
export interface PreferenceTemplate {
  id: ID;
  name: string;
  description: string;
  category: 'shopping' | 'accessibility' | 'privacy' | 'general';
  
  // Template Data
  preferences: Partial<UserPreferences>;
  
  // Metadata
  isDefault: boolean;
  isPopular: boolean;
  userCount: number;
  
  // Tags
  tags: string[];
  
  // Targeting
  targetAudience: string[];
  recommendedFor: string[];
}

// Preference Sync and Backup
export interface PreferenceSync {
  userId: ID;
  
  // Sync Settings
  syncEnabled: boolean;
  syncDevices: boolean;
  syncBrowsers: boolean;
  
  // Last Sync
  lastSyncAt: Timestamp;
  syncVersion: number;
  
  // Conflicts
  hasConflicts: boolean;
  conflictResolution: 'manual' | 'latest_wins' | 'device_priority';
  
  // Backup
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  lastBackupAt: Timestamp;
}

// Preference Analytics
export interface PreferenceAnalytics {
  userId: ID;
  
  // Change History
  changeCount: number;
  lastChangedAt: Timestamp;
  frequentlyChangedSettings: string[];
  
  // Usage Patterns
  mostUsedFeatures: string[];
  leastUsedFeatures: string[];
  featureAdoptionRate: Record<string, number>;
  
  // Personalization Effectiveness
  recommendationAcceptanceRate: number;
  personalizationSatisfaction: number;
  preferenceStability: number;
  
  // Comparison with Others
  similarUsers: ID[];
  uniquePreferences: string[];
  popularPreferences: string[];
}