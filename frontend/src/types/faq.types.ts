import {
  ID,
  Timestamp,
  BaseEntity,
  Status,
  Language,
  ImageAsset,
  VideoAsset,
  SEOData,
  PaginatedResponse,
  SearchFilters,
  Rating
} from './common.types';
import { User } from './user.types';

// Core FAQ Types
export interface FAQ extends BaseEntity {
  // Basic Information
  question: string;
  answer: string;
  shortAnswer?: string; // For quick preview
  
  // Categorization
  categoryId: ID;
  category: FAQCategory;
  subcategoryId?: ID;
  subcategory?: FAQSubcategory;
  
  // Content & Media
  media?: FAQMedia;
  relatedLinks?: FAQLink[];
  attachments?: FAQAttachment[];
  
  // Metadata
  status: Status;
  language: Language;
  priority: FAQPriority;
  visibility: FAQVisibility;
  
  // Analytics & Engagement
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  rating: Rating;
  searchKeywords: string[];
  tags: string[];
  
  // Content Management
  authorId?: ID;
  author?: User;
  lastModifiedBy?: ID;
  publishedAt?: Timestamp;
  expiresAt?: Timestamp;
  
  // SEO & Discovery
  seo: SEOData;
  slug: string;
  featuredImageId?: ID;
  featuredImage?: ImageAsset;
  
  // User Interaction
  userFeedback: FAQFeedback[];
  relatedFAQs: ID[];
  
  // Localization
  translations?: FAQTranslation[];
}

// FAQ Category Management
export interface FAQCategory extends BaseEntity {
  name: string;
  description?: string;
  slug: string;
  icon?: ImageAsset;
  color?: string;
  
  // Hierarchy
  parentId?: ID;
  parent?: FAQCategory;
  children?: FAQCategory[];
  level: number;
  path: string; // breadcrumb path
  
  // Content
  subcategories?: FAQSubcategory[];
  faqCount: number;
  
  // Display
  displayOrder: number;
  isVisible: boolean;
  isFeatured: boolean;
  
  // Metadata
  status: Status;
  language: Language;
  
  // SEO
  seo: SEOData;
  
  // Analytics
  viewCount: number;
  popularityScore: number;
}

export interface FAQSubcategory extends BaseEntity {
  name: string;
  description?: string;
  slug: string;
  categoryId: ID;
  category: FAQCategory;
  
  // Display
  displayOrder: number;
  isVisible: boolean;
  
  // Content
  faqCount: number;
  
  // Metadata
  status: Status;
  language: Language;
  
  // SEO
  seo: SEOData;
}

// FAQ Content Types
export interface FAQMedia {
  images?: ImageAsset[];
  videos?: VideoAsset[];
  diagrams?: ImageAsset[];
  screenshots?: ImageAsset[];
  thumbnails?: ImageAsset[];
}

export interface FAQLink {
  id: ID;
  title: string;
  url: string;
  type: 'internal' | 'external' | 'download' | 'video' | 'article';
  description?: string;
  isNewTab: boolean;
  displayOrder: number;
}

export interface FAQAttachment {
  id: ID;
  name: string;
  url: string;
  type: 'pdf' | 'doc' | 'image' | 'video' | 'other';
  size: number; // in bytes
  downloadCount: number;
  description?: string;
}

export interface FAQTranslation {
  language: Language;
  question: string;
  answer: string;
  shortAnswer?: string;
  isComplete: boolean;
  translatedBy?: ID;
  translatedAt: Timestamp;
}

// FAQ User Interaction
export interface FAQFeedback extends BaseEntity {
  faqId: ID;
  userId?: ID;
  user?: User;
  
  // Feedback Data
  isHelpful: boolean;
  rating?: number; // 1-5 stars
  comment?: string;
  category: FAQFeedbackCategory;
  
  // Interaction Context
  sessionId: string;
  searchQuery?: string;
  userAgent: string;
  ipAddress: string;
  
  // Response Tracking
  responseTime?: number; // time to find answer in seconds
  wasResolved: boolean;
  followUpAction?: FAQFollowUpAction;
  
  // Moderation
  isModerated: boolean;
  moderatorId?: ID;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
}

export interface FAQVote extends BaseEntity {
  faqId: ID;
  userId?: ID;
  type: 'helpful' | 'not_helpful';
  sessionId: string;
  ipAddress: string;
}

export interface FAQView extends BaseEntity {
  faqId: ID;
  userId?: ID;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  searchQuery?: string;
  timeSpent?: number; // in seconds
  scrollDepth?: number; // percentage
  exitType: 'bounce' | 'navigate' | 'search' | 'contact';
}

// FAQ Search & Discovery
export interface FAQSearch extends BaseEntity {
  query: string;
  userId?: ID;
  sessionId: string;
  
  // Search Context
  filters: FAQSearchFilters;
  results: FAQSearchResult[];
  resultCount: number;
  
  // User Interaction
  clickedResults: ID[];
  timeSpent: number;
  wasSuccessful: boolean;
  refinements: string[];
  
  // Technical Details
  ipAddress: string;
  userAgent: string;
  language: Language;
}

export interface FAQSearchFilters extends SearchFilters {
  categories?: ID[];
  subcategories?: ID[];
  languages?: Language[];
  dateRange?: {
    from: Timestamp;
    to: Timestamp;
  };
  difficulty?: FAQDifficulty[];
  hasMedia?: boolean;
  rating?: number;
  popularity?: 'high' | 'medium' | 'low';
}

export interface FAQSearchResult {
  faq: FAQ;
  relevanceScore: number;
  matchType: 'exact' | 'partial' | 'semantic' | 'keyword';
  highlightedSnippet: string;
  matchedKeywords: string[];
}

export interface FAQSuggestion {
  id: ID;
  query: string;
  type: 'autocomplete' | 'typo_correction' | 'alternative' | 'related';
  score: number;
  count: number; // how many times suggested
}

// FAQ Analytics & Reporting
export interface FAQAnalytics {
  faqId: ID;
  period: AnalyticsPeriod;
  
  // Engagement Metrics
  views: number;
  uniqueViews: number;
  helpfulVotes: number;
  notHelpfulVotes: number;
  avgRating: number;
  comments: number;
  
  // Search Metrics
  searchAppearances: number;
  searchClicks: number;
  clickThroughRate: number;
  avgPosition: number;
  topQueries: string[];
  
  // User Behavior
  avgTimeSpent: number;
  bounceRate: number;
  exitRate: number;
  scrollDepth: number;
  
  // Performance Indicators
  helpfulnessRatio: number;
  resolutionRate: number;
  userSatisfactionScore: number;
  popularityTrend: 'increasing' | 'decreasing' | 'stable';
  
  // Comparison Data
  comparisonData?: {
    previousPeriod: Partial<FAQAnalytics>;
    percentageChange: Record<string, number>;
    benchmark: Partial<FAQAnalytics>;
  };
}

export interface FAQCategoryAnalytics {
  categoryId: ID;
  period: AnalyticsPeriod;
  
  // Category Performance
  totalViews: number;
  totalFAQs: number;
  avgFAQRating: number;
  mostViewedFAQs: FAQ[];
  leastViewedFAQs: FAQ[];
  
  // User Engagement
  searchVolume: number;
  successRate: number;
  avgSessionDuration: number;
  bounceRate: number;
  
  // Content Health
  outdatedFAQs: number;
  lowRatedFAQs: number;
  gapsIdentified: FAQGap[];
  
  // Trends
  growthRate: number;
  seasonalTrends: SeasonalTrend[];
}

export interface FAQSystemAnalytics {
  period: AnalyticsPeriod;
  
  // Overall Performance
  totalFAQs: number;
  totalViews: number;
  totalSearches: number;
  avgResolutionRate: number;
  
  // User Experience
  userSatisfactionScore: number;
  avgSearchTime: number;
  avgAnswerFindTime: number;
  supportTicketReduction: number;
  
  // Content Quality
  avgFAQRating: number;
  contentFreshness: number;
  translationCoverage: number;
  mediaRichness: number;
  
  // Top Performers
  topCategories: FAQCategory[];
  topFAQs: FAQ[];
  topSearchQueries: string[];
  
  // Issues & Opportunities
  identifiedGaps: FAQGap[];
  improvementOpportunities: ImprovementOpportunity[];
  
  // Trends
  trafficTrends: TrafficTrend[];
  searchTrends: SearchTrend[];
  satisfactionTrends: SatisfactionTrend[];
}

// FAQ Content Management
export interface FAQTemplate {
  id: ID;
  name: string;
  description: string;
  category: string;
  
  // Template Structure
  questionTemplate: string;
  answerTemplate: string;
  requiredFields: string[];
  optionalFields: string[];
  
  // Formatting
  formatting: FAQFormatting;
  defaultTags: string[];
  defaultKeywords: string[];
  
  // Usage
  usageCount: number;
  isActive: boolean;
  
  // Metadata
  createdBy: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FAQFormatting {
  textStyle: 'plain' | 'markdown' | 'html';
  maxQuestionLength: number;
  maxAnswerLength: number;
  allowMedia: boolean;
  allowLinks: boolean;
  allowAttachments: boolean;
  requireImages: boolean;
  headingStyle: string;
  bulletStyle: string;
}

export interface FAQWorkflow {
  id: ID;
  name: string;
  description: string;
  
  // Workflow Steps
  steps: FAQWorkflowStep[];
  currentStep: number;
  
  // Rules & Triggers
  triggers: FAQWorkflowTrigger[];
  rules: FAQWorkflowRule[];
  
  // Assignment
  assignees: ID[];
  reviewers: ID[];
  approvers: ID[];
  
  // Tracking
  status: 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  
  // Metadata
  createdBy: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FAQWorkflowStep {
  id: ID;
  name: string;
  description: string;
  type: 'creation' | 'review' | 'approval' | 'translation' | 'publication';
  order: number;
  assigneeId?: ID;
  isCompleted: boolean;
  completedAt?: Timestamp;
  notes?: string;
}

export interface FAQWorkflowTrigger {
  id: ID;
  event: 'create' | 'update' | 'publish' | 'feedback' | 'rating';
  condition: Record<string, string | number | boolean>;
  action: string;
}

export interface FAQWorkflowRule {
  id: ID;
  name: string;
  condition: string;
  action: string;
  isActive: boolean;
}

// FAQ Intelligence & Automation
export interface FAQIntelligence {
  faqId: ID;
  
  // AI-Generated Insights
  topicClusters: string[];
  relatedQuestions: string[];
  suggestedImprovements: string[];
  contentGaps: string[];
  
  // Quality Assessment
  readabilityScore: number;
  clarityScore: number;
  completenessScore: number;
  accuracyScore: number;
  
  // Performance Predictions
  predictedViews: number;
  predictedRating: number;
  predictedHelpfulness: number;
  
  // Optimization Suggestions
  seoSuggestions: string[];
  contentSuggestions: string[];
  structureSuggestions: string[];
  
  // Last Analysis
  lastAnalyzedAt: Timestamp;
  analysisVersion: string;
}

export interface FAQAutoSuggestion {
  id: ID;
  type: 'new_faq' | 'update_existing' | 'merge_faqs' | 'split_faq';
  confidence: number;
  
  // Suggestion Data
  suggestedQuestion?: string;
  suggestedAnswer?: string;
  targetFAQId?: ID;
  suggestedChanges?: Record<string, string | number | boolean>;
  
  // Evidence
  basedOnQueries: string[];
  basedOnFeedback: FAQFeedback[];
  basedOnTickets: ID[];
  
  // Review Status
  status: 'pending' | 'reviewed' | 'implemented' | 'rejected';
  reviewedBy?: ID;
  reviewedAt?: Timestamp;
  implementedAt?: Timestamp;
  
  // Metadata
  generatedAt: Timestamp;
  algorithm: string;
  version: string;
}

// FAQ User Experience
export interface FAQUserJourney {
  sessionId: string;
  userId?: ID;
  
  // Journey Steps
  steps: FAQJourneyStep[];
  startTime: Timestamp;
  endTime?: Timestamp;
  duration?: number;
  
  // Outcomes
  wasSuccessful: boolean;
  resolution: FAQResolution;
  satisfaction: number;
  
  // Context
  entryPoint: string;
  exitPoint?: string;
  device: string;
  userAgent: string;
}

export interface FAQJourneyStep {
  id: ID;
  timestamp: Timestamp;
  action: FAQUserAction;
  target?: ID;
  duration: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface FAQPersonalization {
  userId: ID;
  
  // Preferences
  preferredCategories: ID[];
  preferredLanguages: Language[];
  displayPreferences: FAQDisplayPreferences;
  
  // Behavior History
  viewHistory: FAQViewHistory[];
  searchHistory: FAQSearchHistory[];
  interactionHistory: FAQInteraction[];
  
  // Recommendations
  recommendedFAQs: ID[];
  suggestedCategories: ID[];
  personalizedContent: FAQ[];
  
  // Learning
  expertise: Record<string, number>; // category -> expertise level
  interests: string[];
  behaviorPatterns: string[];
  
  // Customization
  bookmarkedFAQs: ID[];
  hiddenFAQs: ID[];
  customTags: string[];
  
  // Last Updated
  updatedAt: Timestamp;
}

export interface FAQDisplayPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  showImages: boolean;
  showVideos: boolean;
  showRelatedFAQs: boolean;
  showBreadcrumbs: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
}

// FAQ Integration Types
export interface FAQIntegration {
  id: ID;
  name: string;
  type: 'helpdesk' | 'chatbot' | 'search' | 'widget' | 'api';
  
  // Configuration
  config: Record<string, string | number | boolean>;
  endpoints: FAQEndpoint[];
  webhooks: FAQWebhook[];
  
  // Status
  isActive: boolean;
  lastSync?: Timestamp;
  syncStatus: 'success' | 'error' | 'pending';
  
  // Usage
  requestCount: number;
  errorCount: number;
  avgResponseTime: number;
  
  // Metadata
  createdBy: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FAQEndpoint {
  path: string;
  method: string;
  description: string;
  parameters: Record<string, string | number | boolean>;
  response: Record<string, string | number | boolean>;
}

export interface FAQWebhook {
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string;
  headers?: Record<string, string>;
}

export interface FAQWidget {
  id: ID;
  name: string;
  type: 'search' | 'popular' | 'category' | 'recent' | 'featured';
  
  // Configuration
  config: FAQWidgetConfig;
  style: FAQWidgetStyle;
  
  // Placement
  placement: 'sidebar' | 'footer' | 'header' | 'inline' | 'modal' | 'floating';
  pages: string[];
  rules: FAQDisplayRule[];
  
  // Analytics
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  
  // Status
  isActive: boolean;
  
  // Metadata
  createdBy: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FAQWidgetConfig {
  maxItems: number;
  showCategories: boolean;
  showSearch: boolean;
  showRatings: boolean;
  showViewCounts: boolean;
  autoRefresh: boolean;
  refreshInterval?: number;
  filters?: FAQSearchFilters;
}

export interface FAQWidgetStyle {
  theme: 'light' | 'dark' | 'brand';
  size: 'small' | 'medium' | 'large';
  layout: 'list' | 'grid' | 'carousel' | 'accordion';
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
  spacing?: Record<string, string>;
  customCSS?: string;
}

export interface FAQDisplayRule {
  condition: string;
  value: string | number | boolean;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
}

// FAQ Enums and Constants
export type FAQPriority = 'low' | 'normal' | 'high' | 'urgent';

export type FAQVisibility = 'public' | 'private' | 'restricted' | 'draft';

export type FAQDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type FAQFeedbackCategory = 
  | 'content_unclear'
  | 'content_outdated'
  | 'content_incorrect'
  | 'content_incomplete'
  | 'missing_information'
  | 'technical_issue'
  | 'suggestion'
  | 'general';

export type FAQFollowUpAction = 
  | 'contacted_support'
  | 'searched_more'
  | 'visited_related'
  | 'left_site'
  | 'made_purchase'
  | 'created_account'
  | 'none';

export type FAQUserAction = 
  | 'search'
  | 'view_faq'
  | 'vote_helpful'
  | 'vote_not_helpful'
  | 'leave_feedback'
  | 'share'
  | 'bookmark'
  | 'print'
  | 'navigate_category'
  | 'use_filter'
  | 'contact_support';

export type FAQResolution = 
  | 'found_answer'
  | 'partially_answered'
  | 'not_answered'
  | 'contacted_support'
  | 'abandoned';

export type AnalyticsPeriod = 
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom';

// FAQ Advanced Types
export interface FAQGap {
  id: ID;
  type: 'missing_topic' | 'insufficient_detail' | 'outdated_content' | 'broken_link';
  description: string;
  suggestedQueries: string[];
  priority: FAQPriority;
  evidence: {
    searchQueries: string[];
    feedbackComments: string[];
    supportTickets: ID[];
  };
  estimatedImpact: 'low' | 'medium' | 'high';
  detectedAt: Timestamp;
}

export interface ImprovementOpportunity {
  id: ID;
  type: 'content_update' | 'structure_improvement' | 'seo_optimization' | 'performance_boost';
  title: string;
  description: string;
  targetFAQs: ID[];
  estimatedEffort: 'low' | 'medium' | 'high';
  expectedBenefit: 'low' | 'medium' | 'high';
  priority: number;
  identifiedAt: Timestamp;
}

export interface TrafficTrend {
  period: string;
  views: number;
  change: number;
  changePercent: number;
}

export interface SearchTrend {
  query: string;
  volume: number;
  change: number;
  changePercent: number;
  successRate: number;
}

export interface SatisfactionTrend {
  period: string;
  averageRating: number;
  helpfulRatio: number;
  resolutionRate: number;
  change: number;
}

export interface SeasonalTrend {
  period: string;
  metric: string;
  value: number;
  seasonalIndex: number;
  forecast?: number;
}

export interface FAQViewHistory {
  faqId: ID;
  viewedAt: Timestamp;
  duration: number;
  wasHelpful?: boolean;
  rating?: number;
}

export interface FAQSearchHistory {
  query: string;
  searchedAt: Timestamp;
  resultCount: number;
  clickedResults: ID[];
  wasSuccessful: boolean;
}

export interface FAQInteraction {
  type: FAQUserAction;
  targetId?: ID;
  timestamp: Timestamp;
  metadata?: Record<string, string | number | boolean>;
}

// FAQ API Response Types
export interface FAQListResponse extends PaginatedResponse<FAQ> {
  categories: FAQCategory[];
  filters: FAQSearchFilters;
  suggestions?: FAQSuggestion[];
}

export interface FAQSearchResponse extends PaginatedResponse<FAQSearchResult> {
  query: string;
  suggestions: FAQSuggestion[];
  relatedQueries: string[];
  categories: FAQCategory[];
  filters: FAQSearchFilters;
  searchTime: number;
}

export interface FAQDetailsResponse {
  faq: FAQ;
  relatedFAQs: FAQ[];
  userInteraction?: {
    hasViewed: boolean;
    hasVoted: boolean;
    voteType?: 'helpful' | 'not_helpful';
    hasBookmarked: boolean;
    feedback?: FAQFeedback;
  };
  analytics?: FAQAnalytics;
}

// FAQ Form Types
export interface FAQCreateRequest {
  question: string;
  answer: string;
  shortAnswer?: string;
  categoryId: ID;
  subcategoryId?: ID;
  language: Language;
  priority: FAQPriority;
  visibility: FAQVisibility;
  tags: string[];
  searchKeywords: string[];
  media?: FAQMedia;
  relatedLinks?: Omit<FAQLink, 'id'>[];
  seo: Partial<SEOData>;
}

export interface FAQUpdateRequest extends Partial<FAQCreateRequest> {
  id: ID;
  status?: Status;
}

export interface FAQFeedbackRequest {
  faqId: ID;
  isHelpful: boolean;
  rating?: number;
  comment?: string;
  category: FAQFeedbackCategory;
  followUpAction?: FAQFollowUpAction;
}

export interface FAQSearchRequest {
  query?: string;
  filters?: FAQSearchFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeAnalytics?: boolean;
}

// FAQ Component Props
export interface FAQProps {
  faq: FAQ;
  showCategory?: boolean;
  showRating?: boolean;
  showActions?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  onVote?: (type: 'helpful' | 'not_helpful') => void;
  onFeedback?: (feedback: FAQFeedbackRequest) => void;
  className?: string;
}

export interface FAQListProps {
  faqs: FAQ[];
  loading?: boolean;
  error?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showCategories?: boolean;
  showPagination?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: (filters: FAQSearchFilters) => void;
  onPageChange?: (page: number) => void;
  className?: string;
}

export interface FAQSearchProps {
  initialQuery?: string;
  placeholder?: string;
  suggestions?: FAQSuggestion[];
  showSuggestions?: boolean;
  showFilters?: boolean;
  onSearch: (query: string, filters?: FAQSearchFilters) => void;
  onSuggestionClick?: (suggestion: FAQSuggestion) => void;
  className?: string;
}

export interface FAQCategoryProps {
  category: FAQCategory;
  showSubcategories?: boolean;
  showFAQCount?: boolean;
  layout?: 'list' | 'grid' | 'tree';
  onCategoryClick?: (category: FAQCategory) => void;
  className?: string;
}

export interface FAQWidgetProps {
  type: FAQWidget['type'];
  config: FAQWidgetConfig;
  style?: FAQWidgetStyle;
  className?: string;
}

// FAQ State Management
export interface FAQState {
  // Data
  faqs: FAQ[];
  categories: FAQCategory[];
  currentFAQ?: FAQ;
  
  // UI State
  loading: boolean;
  error?: string;
  searchQuery: string;
  filters: FAQSearchFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // User State
  userPreferences: FAQPersonalization;
  bookmarkedFAQs: ID[];
  viewHistory: FAQViewHistory[];
  
  // Cache
  cachedSearches: Record<string, FAQSearchResponse>;
  lastUpdated: Timestamp;
}

export interface FAQActions {
  // Data Actions
  fetchFAQs: (filters?: FAQSearchFilters) => Promise<void>;
  fetchFAQ: (id: ID) => Promise<void>;
  searchFAQs: (query: string, filters?: FAQSearchFilters) => Promise<void>;
  
  // Category Actions
  fetchCategories: () => Promise<void>;
  selectCategory: (categoryId: ID) => void;
  
  // User Actions
  voteFAQ: (faqId: ID, type: 'helpful' | 'not_helpful') => Promise<void>;
  submitFeedback: (feedback: FAQFeedbackRequest) => Promise<void>;
  bookmarkFAQ: (faqId: ID) => Promise<void>;
  unbookmarkFAQ: (faqId: ID) => Promise<void>;
  
  // UI Actions
  setSearchQuery: (query: string) => void;
  setFilters: (filters: FAQSearchFilters) => void;
  setPage: (page: number) => void;
  clearError: () => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<FAQPersonalization>) => Promise<void>;
}

// FAQ Context Types
export interface FAQContextValue extends FAQState {
  actions: FAQActions;
}

// FAQ Hook Return Types
export interface UseFAQReturn extends FAQState {
  actions: FAQActions;
  refetch: () => Promise<void>;
}

export interface UseFAQSearchReturn {
  results: FAQSearchResult[];
  loading: boolean;
  error?: string;
  search: (query: string, filters?: FAQSearchFilters) => Promise<void>;
  suggestions: FAQSuggestion[];
  clear: () => void;
}

export interface UseFAQAnalyticsReturn {
  analytics: FAQAnalytics | null;
  categoryAnalytics: FAQCategoryAnalytics | null;
  systemAnalytics: FAQSystemAnalytics | null;
  loading: boolean;
  error?: string;
  fetchAnalytics: (faqId?: ID, period?: AnalyticsPeriod) => Promise<void>;
  exportAnalytics: (format: 'csv' | 'pdf' | 'excel') => Promise<void>;
}
