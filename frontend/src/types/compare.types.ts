/**
 * Product Comparison Types - Vardhman Mills Frontend
 * 
 * Comprehensive type definitions for product comparison functionality,
 * comparison tables, feature analysis, and decision support tools.
 * 
 * @version 1.0.0
 * @created 2024-01-12
 */

import { ID, Timestamp, BaseEntity, ImageAsset, Price, Rating } from './common.types';
import { Product, ProductVariant } from './product.types';

// ============================================================================
// COMPARISON CORE TYPES
// ============================================================================

/**
 * Product comparison structure
 */
export interface ProductComparison extends BaseEntity {
  // Basic Information
  name: string;
  description?: string;
  
  // Products Being Compared
  products: ComparisonProduct[];
  maxProducts: number;
  
  // User Information
  userId?: ID; // If logged in user
  isPublic: boolean;
  isShared: boolean;
  
  // Comparison Configuration
  config: ComparisonConfig;
  
  // Comparison Results
  results: ComparisonResults;
  
  // Sharing
  shareData?: ComparisonShareData;
  
  // Analytics
  analytics: ComparisonAnalytics;
  
  // Status
  status: 'active' | 'archived' | 'shared' | 'expired';
  
  // Timestamps
  lastModified: Timestamp;
  expiresAt?: Timestamp;
}

/**
 * Product in comparison with additional metadata
 */
export interface ComparisonProduct {
  // Product Reference
  productId: ID;
  variantId?: ID;
  product?: Product; // Populated product data
  variant?: ProductVariant;
  
  // Comparison Metadata
  addedAt: Timestamp;
  addedBy?: ID;
  position: number;
  
  // Custom Labels
  customLabel?: string;
  customNotes?: string;
  
  // Highlighting
  isHighlighted: boolean;
  highlightReason?: string;
  
  // User Preferences
  userRating?: number;
  userNotes?: string;
  isFavorite: boolean;
  
  // Context
  comparisonContext: {
    priceAtComparison: Price;
    availabilityAtComparison: string;
    ratingAtComparison: Rating;
  };
}

/**
 * Comparison configuration settings
 */
export interface ComparisonConfig {
  // Display Settings
  displayMode: ComparisonDisplayMode;
  layout: ComparisonLayout;
  
  // Feature Selection
  includedFeatures: ComparisonFeature[];
  excludedFeatures: string[];
  customFeatures: CustomComparisonFeature[];
  
  // Grouping and Organization
  featureGroups: FeatureGroup[];
  showOnlyDifferences: boolean;
  highlightBestValues: boolean;
  
  // Scoring
  enableScoring: boolean;
  scoringWeights: ScoringWeights;
  
  // Visual Settings
  theme: 'default' | 'minimal' | 'detailed' | 'mobile';
  showImages: boolean;
  showPrices: boolean;
  showRatings: boolean;
  showAvailability: boolean;
  
  // Interaction
  allowUserRatings: boolean;
  allowUserNotes: boolean;
  enableSorting: boolean;
  enableFiltering: boolean;
}

/**
 * Comparison display modes
 */
export type ComparisonDisplayMode = 
  | 'table'        // Traditional comparison table
  | 'cards'        // Card-based layout
  | 'side_by_side' // Side-by-side comparison
  | 'carousel'     // Swipeable carousel
  | 'matrix'       // Matrix view
  | 'detailed';    // Detailed analysis view

/**
 * Comparison layout options
 */
export type ComparisonLayout = 
  | 'horizontal'   // Products in columns
  | 'vertical'     // Products in rows
  | 'grid'         // Grid layout
  | 'accordion'    // Expandable sections
  | 'tabs'         // Tabbed interface
  | 'responsive';  // Adaptive layout

// ============================================================================
// FEATURE AND SPECIFICATION TYPES
// ============================================================================

/**
 * Comparison feature definition
 */
export interface ComparisonFeature {
  id: ID;
  name: string;
  category: FeatureCategory;
  type: FeatureType;
  
  // Display
  displayName: string;
  description?: string;
  unit?: string;
  
  // Comparison Logic
  comparisonType: ComparisonType;
  weight: number; // For scoring (0-1)
  isImportant: boolean;
  
  // Data Source
  sourceField: string;
  transformFunction?: string;
  
  // Display Settings
  format: FeatureFormat;
  showInSummary: boolean;
  allowUserInput: boolean;
  
  // Validation
  validationRules?: ValidationRule[];
  
  // Help and Context
  tooltip?: string;
  helpText?: string;
  moreInfoUrl?: string;
}

/**
 * Feature categories for organization
 */
export type FeatureCategory = 
  | 'basic_info'      // Name, brand, model
  | 'pricing'         // Price, discounts, offers
  | 'specifications'  // Technical specs
  | 'dimensions'      // Size, weight, measurements
  | 'materials'       // Materials, finishes, quality
  | 'features'        // Features and capabilities
  | 'performance'     // Performance metrics
  | 'design'          // Aesthetic properties
  | 'availability'    // Stock, delivery, warranty
  | 'reviews'         // Ratings and reviews
  | 'sustainability'  // Environmental impact
  | 'care'           // Maintenance, care instructions
  | 'custom';        // User-defined

/**
 * Feature data types
 */
export type FeatureType = 
  | 'text'           // Text value
  | 'number'         // Numeric value
  | 'boolean'        // Yes/No or True/False
  | 'enum'           // Predefined options
  | 'price'          // Monetary value
  | 'rating'         // Star rating
  | 'percentage'     // Percentage value
  | 'date'           // Date value
  | 'image'          // Image asset
  | 'list'           // List of values
  | 'object'         // Complex object
  | 'range';         // Value range

/**
 * How features should be compared
 */
export type ComparisonType = 
  | 'exact_match'    // Exact value comparison
  | 'numeric'        // Numeric comparison (higher/lower better)
  | 'categorical'    // Category-based comparison
  | 'boolean'        // Boolean comparison
  | 'textual'        // Text similarity
  | 'custom'         // Custom comparison logic
  | 'user_preference'; // User-defined preference

/**
 * Feature display formatting
 */
export interface FeatureFormat {
  type: 'text' | 'number' | 'currency' | 'percentage' | 'boolean' | 'badge' | 'progress' | 'custom';
  precision?: number;
  currency?: string;
  suffix?: string;
  prefix?: string;
  customFormatter?: string;
  
  // Visual formatting
  colorCoding?: {
    excellent: string;
    good: string;
    average: string;
    poor: string;
  };
  
  // Icon mapping
  iconMapping?: {
    [value: string]: string;
  };
}

/**
 * Custom feature defined by user
 */
export interface CustomComparisonFeature extends ComparisonFeature {
  // Custom Properties
  isUserDefined: true;
  createdBy: ID;
  
  // Data Input
  userValues: {
    [productId: string]: unknown;
  };
  
  // Validation
  isValidated: boolean;
  validationNotes?: string;
}

/**
 * Feature grouping for organization
 */
export interface FeatureGroup {
  id: ID;
  name: string;
  description?: string;
  features: string[]; // Feature IDs
  order: number;
  
  // Display
  isCollapsible: boolean;
  isExpandedByDefault: boolean;
  icon?: string;
  color?: string;
  
  // Behavior
  showSummary: boolean;
  enableGroupScoring: boolean;
}

/**
 * Validation rule for feature values
 */
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'range' | 'pattern' | 'custom';
  value: unknown;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// ============================================================================
// SCORING AND RANKING TYPES
// ============================================================================

/**
 * Scoring weights for different feature categories
 */
export interface ScoringWeights {
  // Category Weights
  categories: {
    [category: string]: number;
  };
  
  // Individual Feature Weights
  features: {
    [featureId: string]: number;
  };
  
  // User Preferences
  userPreferences: {
    priceImportance: number;      // 0-1
    qualityImportance: number;    // 0-1
    featuresImportance: number;   // 0-1
    designImportance: number;     // 0-1
    brandImportance: number;      // 0-1
  };
  
  // Scoring Algorithm
  algorithm: 'weighted_average' | 'multiplicative' | 'custom';
  customAlgorithm?: string;
}

/**
 * Comparison results and analysis
 */
export interface ComparisonResults {
  // Overall Scores
  overallScores: ProductScore[];
  
  // Category Scores
  categoryScores: {
    [category: string]: ProductScore[];
  };
  
  // Feature Analysis
  featureAnalysis: FeatureAnalysis[];
  
  // Recommendations
  recommendations: ComparisonRecommendation[];
  
  // Summary
  summary: ComparisonSummary;
  
  // Decision Support
  decisionSupport: DecisionSupport;
  
  // Last Calculated
  lastCalculated: Timestamp;
}

/**
 * Product score information
 */
export interface ProductScore {
  productId: ID;
  score: number; // 0-100
  rank: number;
  
  // Score Breakdown
  breakdown: {
    [category: string]: {
      score: number;
      weight: number;
      contribution: number;
    };
  };
  
  // Strengths and Weaknesses
  strengths: string[];
  weaknesses: string[];
  
  // Confidence
  confidence: number; // 0-1
}

/**
 * Analysis of individual features across products
 */
export interface FeatureAnalysis {
  featureId: string;
  featureName: string;
  
  // Value Distribution
  values: {
    productId: ID;
    value: unknown;
    normalizedValue: number;
    rank: number;
  }[];
  
  // Statistics
  statistics: {
    min: unknown;
    max: unknown;
    average?: number;
    median?: number;
    mode?: unknown;
    variance?: number;
  };
  
  // Insights
  insights: {
    bestValue: unknown;
    worstValue: unknown;
    mostCommon: unknown;
    outliers: unknown[];
  };
  
  // Recommendations
  recommendation: string;
  importance: 'high' | 'medium' | 'low';
}

/**
 * AI-generated recommendations
 */
export interface ComparisonRecommendation {
  id: ID;
  type: RecommendationType;
  title: string;
  description: string;
  
  // Target
  productId?: ID; // Specific product recommendation
  products?: ID[]; // Multiple products
  
  // Reasoning
  reasoning: string[];
  confidence: number; // 0-1
  
  // Context
  userProfile?: string;
  useCase?: string;
  budget?: Price;
  
  // Actions
  suggestedActions: RecommendationAction[];
  
  // Metadata
  source: 'ai' | 'rules' | 'user_behavior' | 'expert';
  priority: 'high' | 'medium' | 'low';
}

/**
 * Types of recommendations
 */
export type RecommendationType = 
  | 'best_overall'      // Best overall choice
  | 'best_value'        // Best value for money
  | 'best_features'     // Most features
  | 'best_quality'      // Highest quality
  | 'best_budget'       // Best for budget
  | 'most_popular'      // Most popular choice
  | 'most_suitable'     // Most suitable for user
  | 'alternative'       // Alternative suggestion
  | 'upgrade'          // Upgrade recommendation
  | 'bundle'           // Bundle recommendation
  | 'custom';          // Custom recommendation

/**
 * Recommended actions for users
 */
export interface RecommendationAction {
  type: 'view_product' | 'add_to_cart' | 'save_for_later' | 'get_quote' | 'contact_expert' | 'read_reviews';
  label: string;
  url?: string;
  productId?: ID;
  trackingData?: Record<string, unknown>;
}

/**
 * Comparison summary for quick insights
 */
export interface ComparisonSummary {
  // Winner Analysis
  overallWinner: ID;
  categoryWinners: {
    [category: string]: ID;
  };
  
  // Key Differences
  keyDifferences: {
    feature: string;
    difference: string;
    significance: 'high' | 'medium' | 'low';
  }[];
  
  // Price Analysis
  priceAnalysis: {
    cheapest: ID;
    mostExpensive: ID;
    priceRange: {
      min: number;
      max: number;
    };
    averagePrice: number;
    bestValue: ID;
  };
  
  // Feature Coverage
  featureCoverage: {
    totalFeatures: number;
    sharedFeatures: number;
    uniqueFeatures: {
      productId: ID;
      features: string[];
    }[];
  };
  
  // User Fit
  userFitScores?: {
    productId: ID;
    fitScore: number; // 0-100
    reasons: string[];
  }[];
}

/**
 * Decision support data and tools
 */
export interface DecisionSupport {
  // Decision Tree
  decisionTree?: DecisionNode[];
  
  // What-If Analysis
  scenarios: ComparisonScenario[];
  
  // Trade-off Analysis
  tradeoffs: TradeoffAnalysis[];
  
  // Risk Assessment
  risks: RiskAssessment[];
  
  // Next Steps
  nextSteps: string[];
  
  // Expert Insights
  expertInsights?: ExpertInsight[];
}

/**
 * Decision tree node for guided decision making
 */
export interface DecisionNode {
  id: ID;
  question: string;
  type: 'feature' | 'preference' | 'constraint' | 'use_case';
  
  // Options
  options: {
    value: unknown;
    label: string;
    nextNodeId?: ID;
    recommendation?: ID; // Product ID
  }[];
  
  // Context
  explanation?: string;
  importance: 'high' | 'medium' | 'low';
}

/**
 * Comparison scenario for what-if analysis
 */
export interface ComparisonScenario {
  id: ID;
  name: string;
  description: string;
  
  // Parameter Changes
  parameterChanges: {
    [featureId: string]: unknown;
  };
  
  // Weight Changes
  weightChanges?: {
    [category: string]: number;
  };
  
  // Results
  results: ComparisonResults;
  
  // Impact Analysis
  impact: {
    rankingChanges: {
      productId: ID;
      oldRank: number;
      newRank: number;
    }[];
    significantChanges: string[];
  };
}

/**
 * Trade-off analysis between products
 */
export interface TradeoffAnalysis {
  feature1: string;
  feature2: string;
  
  // Trade-off Data
  tradeoffs: {
    productId: ID;
    feature1Value: unknown;
    feature2Value: unknown;
    tradeoffScore: number; // How good the trade-off is
  }[];
  
  // Analysis
  analysis: string;
  recommendation: string;
}

/**
 * Risk assessment for product choices
 */
export interface RiskAssessment {
  productId: ID;
  risks: {
    type: 'availability' | 'price_volatility' | 'quality' | 'support' | 'compatibility' | 'obsolescence';
    level: 'low' | 'medium' | 'high';
    description: string;
    mitigation?: string;
  }[];
  overallRisk: 'low' | 'medium' | 'high';
}

/**
 * Expert insights and professional opinions
 */
export interface ExpertInsight {
  id: ID;
  expertName: string;
  expertise: string;
  
  // Insight Content
  title: string;
  content: string;
  recommendation?: ID; // Product ID
  
  // Credibility
  credibilityScore: number; // 1-10
  verificationStatus: 'verified' | 'pending' | 'unverified';
  
  // Context
  useCase?: string;
  targetAudience?: string;
  
  // Timestamps
  publishedAt: Timestamp;
  updatedAt?: Timestamp;
}

// ============================================================================
// SHARING AND COLLABORATION TYPES
// ============================================================================

/**
 * Comparison sharing configuration
 */
export interface ComparisonShareData {
  // Sharing Settings
  isPublic: boolean;
  shareUrl: string;
  shareCode: string;
  
  // Access Control
  accessLevel: 'view' | 'comment' | 'edit';
  allowedUsers?: ID[];
  requiresLogin: boolean;
  
  // Sharing Stats
  shareCount: number;
  viewCount: number;
  
  // Social Sharing
  socialShares: {
    [platform: string]: number;
  };
  
  // Expiration
  expiresAt?: Timestamp;
  isExpired: boolean;
  
  // Permissions
  canDownload: boolean;
  canPrint: boolean;
  canEmbed: boolean;
  
  // Tracking
  sharedAt: Timestamp;
  sharedBy: ID;
  lastAccessed: Timestamp;
}

/**
 * Collaborative comparison features
 */
export interface ComparisonCollaboration {
  // Collaborators
  collaborators: ComparisonCollaborator[];
  
  // Comments and Discussions
  comments: ComparisonComment[];
  
  // Voting and Ratings
  votes: ComparisonVote[];
  
  // Version History
  versions: ComparisonVersion[];
  
  // Real-time Features
  liveUsers: LiveUser[];
  liveUpdates: LiveUpdate[];
}

/**
 * Comparison collaborator information
 */
export interface ComparisonCollaborator {
  userId: ID;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  invitedAt: Timestamp;
  lastActive: Timestamp;
  
  // Permissions
  canEdit: boolean;
  canInvite: boolean;
  canDelete: boolean;
  
  // Activity
  contributions: number;
  commentsCount: number;
  votesCount: number;
}

/**
 * Comment on comparison
 */
export interface ComparisonComment extends BaseEntity {
  comparisonId: ID;
  userId: ID;
  content: string;
  
  // Context
  productId?: ID; // Comment on specific product
  featureId?: string; // Comment on specific feature
  
  // Thread
  parentId?: ID;
  replies?: ComparisonComment[];
  
  // Engagement
  likes: number;
  replies_count: number;
  
  // Status
  isResolved: boolean;
  isPinned: boolean;
}

/**
 * Vote on product or feature
 */
export interface ComparisonVote {
  id: ID;
  comparisonId: ID;
  userId: ID;
  
  // Vote Target
  productId?: ID;
  featureId?: string;
  
  // Vote Data
  voteType: 'like' | 'dislike' | 'rating' | 'ranking';
  value: number;
  
  // Context
  reason?: string;
  confidence: number; // 0-1
  
  // Timestamps
  votedAt: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Comparison version for history tracking
 */
export interface ComparisonVersion {
  id: ID;
  comparisonId: ID;
  version: number;
  
  // Changes
  changesSummary: string;
  changedBy: ID;
  changeType: 'products_added' | 'products_removed' | 'config_changed' | 'features_modified';
  
  // Snapshot
  snapshot: Partial<ProductComparison>;
  
  // Metadata
  createdAt: Timestamp;
  isBackup: boolean;
  canRestore: boolean;
}

/**
 * Live user presence
 */
export interface LiveUser {
  userId: ID;
  username: string;
  avatar?: ImageAsset;
  
  // Activity
  lastSeen: Timestamp;
  currentActivity: 'viewing' | 'editing' | 'commenting' | 'idle';
  currentSection?: string;
  
  // Display
  cursorPosition?: {
    x: number;
    y: number;
  };
  color: string;
}

/**
 * Live update for real-time collaboration
 */
export interface LiveUpdate {
  id: ID;
  type: 'user_joined' | 'user_left' | 'product_added' | 'product_removed' | 'comment_added' | 'vote_cast';
  userId: ID;
  timestamp: Timestamp;
  data: Record<string, unknown>;
}

// ============================================================================
// ANALYTICS AND TRACKING TYPES
// ============================================================================

/**
 * Comparison analytics data
 */
export interface ComparisonAnalytics {
  // Usage Metrics
  usage: ComparisonUsageMetrics;
  
  // Engagement Metrics
  engagement: ComparisonEngagementMetrics;
  
  // Product Performance
  productPerformance: ProductComparisonMetrics[];
  
  // Feature Analysis
  featureAnalytics: FeatureAnalyticsData[];
  
  // User Behavior
  userBehavior: ComparisonUserBehavior;
  
  // Conversion Metrics
  conversion: ComparisonConversionMetrics;
  
  // Last Updated
  lastUpdated: Timestamp;
}

/**
 * Comparison usage statistics
 */
export interface ComparisonUsageMetrics {
  // Basic Usage
  totalViews: number;
  uniqueViews: number;
  totalTimeSpent: number;
  averageSessionDuration: number;
  
  // User Engagement
  shareCount: number;
  saveCount: number;
  printCount: number;
  downloadCount: number;
  
  // Collaboration
  collaboratorCount: number;
  commentCount: number;
  voteCount: number;
  
  // Feature Usage
  featureInteractions: {
    [featureId: string]: number;
  };
  
  // Device Usage
  deviceBreakdown: {
    [device: string]: number;
  };
}

/**
 * Engagement-specific metrics
 */
export interface ComparisonEngagementMetrics {
  // Interaction Depth
  scrollDepth: number;
  featureExpansions: number;
  filterUsage: number;
  sortUsage: number;
  
  // Content Engagement
  imageViews: number;
  linkClicks: number;
  tooltipViews: number;
  
  // Comparison Actions
  productSwaps: number;
  comparisonResets: number;
  configChanges: number;
  
  // Exit Behavior
  exitPoints: {
    [section: string]: number;
  };
  bounceRate: number;
}

/**
 * Product performance in comparisons
 */
export interface ProductComparisonMetrics {
  productId: ID;
  
  // Inclusion Metrics
  timesCompared: number;
  comparisonWins: number;
  averageRank: number;
  
  // User Actions
  timesViewed: number;
  timesClicked: number;
  timesShared: number;
  timesAddedToCart: number;
  
  // Performance Scores
  averageUserRating: number;
  expertRating: number;
  algorithmScore: number;
  
  // Context
  popularComparisons: {
    comparedWith: ID[];
    frequency: number;
  }[];
  
  // Trends
  trendDirection: 'up' | 'down' | 'stable';
  trendStrength: number;
}

/**
 * Feature analytics data
 */
export interface FeatureAnalyticsData {
  featureId: string;
  
  // Usage
  viewCount: number;
  interactionCount: number;
  filterUsage: number;
  
  // Impact
  decisionImpact: number; // How much this feature influences decisions
  correlationWithPurchase: number; // -1 to 1
  
  // User Behavior
  averageTimeViewing: number;
  tooltipUsage: number;
  customizations: number;
  
  // Performance
  accuracyScore: number; // How accurate the data is
  completenessScore: number; // How complete the data is
  userSatisfaction: number; // User satisfaction with this feature
}

/**
 * User behavior patterns in comparisons
 */
export interface ComparisonUserBehavior {
  // Navigation Patterns
  navigationFlow: {
    from: string;
    to: string;
    frequency: number;
  }[];
  
  // Attention Heatmap
  attentionHeatmap: {
    section: string;
    attention: number; // 0-1
  }[];
  
  // Decision Patterns
  decisionPatterns: {
    pattern: string;
    frequency: number;
    averageTime: number;
  }[];
  
  // Feature Preferences
  featurePreferences: {
    [featureCategory: string]: number;
  };
  
  // Comparison Strategies
  comparisonStrategies: {
    strategy: 'systematic' | 'focused' | 'exploratory' | 'quick_scan';
    frequency: number;
  }[];
}

/**
 * Conversion metrics for comparisons
 */
export interface ComparisonConversionMetrics {
  // Purchase Conversions
  totalConversions: number;
  conversionRate: number;
  averageOrderValue: number;
  revenueAttribution: number;
  
  // Conversion by Product
  productConversions: {
    productId: ID;
    conversions: number;
    conversionRate: number;
    revenue: number;
  }[];
  
  // Conversion Funnel
  funnelSteps: {
    step: string;
    users: number;
    conversionRate: number;
  }[];
  
  // Time to Conversion
  averageTimeToConversion: number;
  conversionTimeDistribution: {
    [timeRange: string]: number;
  };
  
  // Assisted Conversions
  assistedConversions: number;
  assistedRevenue: number;
  
  // Attribution
  attributionModel: 'first_touch' | 'last_touch' | 'linear' | 'time_decay';
  attributionWeight: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * API response for comparison list
 */
export interface ComparisonListResponse {
  comparisons: ProductComparison[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: ComparisonFilters;
}

/**
 * Filters for comparison queries
 */
export interface ComparisonFilters {
  // User Filters
  userId?: ID;
  isPublic?: boolean;
  isShared?: boolean;
  
  // Product Filters
  productIds?: ID[];
  categories?: ID[];
  brands?: ID[];
  priceRange?: {
    min: number;
    max: number;
  };
  
  // Date Filters
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  
  // Status Filters
  status?: ('active' | 'archived' | 'shared' | 'expired')[];
  
  // Feature Filters
  hasScoring?: boolean;
  hasRecommendations?: boolean;
  
  // Sorting
  sortBy?: 'created_at' | 'updated_at' | 'name' | 'product_count' | 'views';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Popular comparisons response
 */
export interface PopularComparisonsResponse {
  // Popular Product Combinations
  popularCombinations: {
    products: ID[];
    comparisonCount: number;
    conversionRate: number;
  }[];
  
  // Trending Comparisons
  trendingComparisons: ProductComparison[];
  
  // Featured Comparisons
  featuredComparisons: ProductComparison[];
  
  // Category-wise Popular
  categoryPopular: {
    categoryId: ID;
    categoryName: string;
    comparisons: ProductComparison[];
  }[];
}

// All types are exported inline
export default ProductComparison;
