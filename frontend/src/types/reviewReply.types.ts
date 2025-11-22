import { BaseEntity, ID, Timestamp, ImageAsset, PaginatedResponse, APIResponse, APIError } from './common.types';
import { User } from './user.types';

// Review Reply Types - Comprehensive review response and management system for e-commerce platform

// ===== CORE TYPES =====
export type ReplyStatus = 'draft' | 'published' | 'pending_review' | 'archived' | 'deleted' | 'flagged' | 'hidden';
export type ReplyType = 'public' | 'private' | 'internal_note' | 'escalation' | 'resolution' | 'follow_up';
export type ReviewSentiment = 'positive' | 'negative' | 'neutral' | 'mixed';
export type ResponsePriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';
export type ResponseTone = 'professional' | 'friendly' | 'apologetic' | 'grateful' | 'informative' | 'empathetic';
export type AutomationAction = 'auto_reply' | 'escalate' | 'flag_for_review' | 'assign_agent' | 'send_notification' | 'update_status';
export type ModerationResult = 'approved' | 'rejected' | 'requires_edit' | 'flagged' | 'pending';
export type ResponseChannel = 'website' | 'email' | 'sms' | 'social_media' | 'mobile_app' | 'in_store';
export type EscalationLevel = 'level_1' | 'level_2' | 'level_3' | 'executive' | 'legal';
export type ReplySource = 'manual' | 'template' | 'ai_generated' | 'bulk_action' | 'automated_workflow';
export type QualityScore = 'excellent' | 'good' | 'fair' | 'poor' | 'unrated';

// ===== BASIC INTERFACES =====
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: unknown;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  name?: string;
  preferredChannel?: ResponseChannel;
}

export interface Location {
  country?: string;
  region?: string;
  city?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Attachment {
  id: ID;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Timestamp;
  uploadedBy: ID;
}

// ===== MAIN REVIEW REPLY ENTITY =====
export interface ReviewReply extends BaseEntity {
  id: ID;
  reviewId: ID;
  parentReplyId?: ID; // For threaded replies
  
  // Content
  content: string;
  originalContent?: string; // Before moderation edits
  summary?: string;
  
  // Classification
  type: ReplyType;
  status: ReplyStatus;
  priority: ResponsePriority;
  tone: ResponseTone;
  source: ReplySource;
  
  // Authorship
  authorId?: ID; // User who wrote the reply
  authorName?: string;
  authorRole?: string;
  isBusinessOwner: boolean;
  isVerifiedPurchaser: boolean;
  
  // Response Management
  responseTeam: ResponseTeamInfo;
  assignedAgent?: ID;
  responseTime?: number; // in minutes
  escalationLevel?: EscalationLevel;
  
  // Approval & Moderation
  moderation: ModerationInfo;
  approvalWorkflow?: ApprovalWorkflow;
  qualityScore?: QualityScore;
  
  // Engagement & Analytics
  analytics: ReplyAnalytics;
  interactions: ReplyInteraction[];
  
  // Visibility & Targeting
  visibility: VisibilitySettings;
  audience: AudienceSettings;
  
  // Follow-up & Resolution
  followUp: FollowUpInfo;
  resolution?: ResolutionInfo;
  relatedIssues: ID[];
  
  // Personalization
  personalization: PersonalizationData;
  customerContext: CustomerContext;
  
  // Attachments & Media
  attachments: Attachment[];
  media: ImageAsset[];
  
  // Automation & AI
  automation: AutomationInfo;
  aiAssistance: AIAssistanceInfo;
  
  // Compliance & Legal
  compliance: ComplianceInfo;
  legalReview?: LegalReviewInfo;
  
  // Localization
  language: string;
  translations: ReplyTranslation[];
  
  // Timeline & Versioning
  responseDeadline?: Timestamp;
  publishedAt?: Timestamp;
  lastEditedAt?: Timestamp;
  scheduledAt?: Timestamp;
  
  // Custom Fields
  tags: string[];
  categories: string[];
  customFields: Record<string, unknown>;
  metadata: Record<string, unknown>;
  
  // User Management
  createdBy: ID;
  updatedBy: ID;
  approvedBy?: ID;
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== RESPONSE TEAM & MANAGEMENT =====
export interface ResponseTeamInfo {
  department: string;
  team: string;
  shift: string;
  primaryAgent: ID;
  backupAgents: ID[];
  supervisor: ID;
  
  // Capacity & Workload
  currentWorkload: number;
  maxCapacity: number;
  responseTimeTarget: number;
  escalationThreshold: number;
  
  // Performance
  averageResponseTime: number;
  qualityRating: number;
  customerSatisfaction: number;
  resolutionRate: number;
}

export interface ModerationInfo {
  isRequired: boolean;
  status: ModerationResult;
  moderatorId?: ID;
  moderationRules: ModerationRule[];
  
  // Review Process
  reviewedAt?: Timestamp;
  reviewNotes?: string;
  changesRequested?: string[];
  approvalHistory: ModerationHistory[];
  
  // Content Analysis
  contentAnalysis: ContentAnalysis;
  riskAssessment: RiskAssessment;
  
  // Flags & Warnings
  flags: ContentFlag[];
  warnings: ContentWarning[];
  
  // Quality Assurance
  qualityChecks: QualityCheck[];
  improvementSuggestions: string[];
}

export interface ModerationRule {
  id: ID;
  name: string;
  description: string;
  type: 'content_filter' | 'sentiment_check' | 'length_validation' | 'tone_analysis' | 'custom';
  isActive: boolean;
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: 'flag' | 'block' | 'require_review' | 'auto_edit' | 'escalate';
}

export interface ModerationHistory {
  timestamp: Timestamp;
  moderatorId: ID;
  action: string;
  result: ModerationResult;
  notes?: string;
  changes?: Record<string, unknown>;
}

export interface ContentAnalysis {
  sentiment: ReviewSentiment;
  tone: ResponseTone;
  professionalism: number; // 0-100
  helpfulness: number; // 0-100
  clarity: number; // 0-100
  
  // Content Metrics
  wordCount: number;
  readabilityScore: number;
  grammarScore: number;
  
  // Risk Indicators
  containsPersonalInfo: boolean;
  containsPromises: boolean;
  containsLinks: boolean;
  potentialLegalIssues: string[];
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigationActions: string[];
  requiresLegalReview: boolean;
  requiresExecutiveApproval: boolean;
}

export interface RiskFactor {
  type: 'legal' | 'brand' | 'customer_service' | 'compliance' | 'reputation';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1
  impact: number; // 0-1
}

export interface ContentFlag {
  type: 'inappropriate_content' | 'personal_info' | 'legal_concern' | 'brand_risk' | 'policy_violation';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  flaggedBy: 'system' | 'moderator' | 'user_report';
  flaggedAt: Timestamp;
  resolved: boolean;
  resolutionNotes?: string;
}

export interface ContentWarning {
  type: 'tone' | 'length' | 'grammar' | 'accuracy' | 'completeness';
  message: string;
  suggestion: string;
  canOverride: boolean;
}

export interface QualityCheck {
  dimension: 'accuracy' | 'completeness' | 'helpfulness' | 'professionalism' | 'timeliness';
  score: number; // 0-100
  feedback: string;
  improvementAreas: string[];
}

export interface ApprovalWorkflow {
  steps: ApprovalStep[];
  currentStep: number;
  isComplete: boolean;
  finalApproval?: FinalApproval;
}

export interface ApprovalStep {
  stepNumber: number;
  approverRole: string;
  approverId?: ID;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  notes?: string;
  timestamp?: Timestamp;
  isRequired: boolean;
}

export interface FinalApproval {
  approverId: ID;
  approvedAt: Timestamp;
  notes?: string;
  conditions?: string[];
  expiresAt?: Timestamp;
}

// ===== ANALYTICS & ENGAGEMENT =====
export interface ReplyAnalytics {
  // Engagement Metrics
  views: number;
  likes: number;
  dislikes: number;
  shares: number;
  helpful_votes: number;
  not_helpful_votes: number;
  
  // Interaction Metrics
  clickThroughRate: number;
  engagementRate: number;
  responseRate: number;
  satisfactionScore: number;
  
  // Performance Metrics
  responseTime: number;
  resolutionTime: number;
  escalationCount: number;
  editCount: number;
  
  // Audience Metrics
  reachCount: number;
  impressionCount: number;
  conversionCount: number;
  
  // Quality Metrics
  qualityScore: number;
  moderationScore: number;
  customerSatisfactionScore: number;
  
  // Computed Fields
  computedAt: Timestamp;
  lastUpdated: Timestamp;
}

export interface ReplyInteraction {
  id: ID;
  userId?: ID;
  type: 'view' | 'like' | 'dislike' | 'share' | 'helpful' | 'not_helpful' | 'report' | 'reply';
  timestamp: Timestamp;
  source: ResponseChannel;
  
  // Context
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  
  // Additional Data
  metadata: Record<string, unknown>;
}

// ===== VISIBILITY & AUDIENCE =====
export interface VisibilitySettings {
  isPublic: boolean;
  isSearchable: boolean;
  showOnProfile: boolean;
  showInFeed: boolean;
  
  // Platform Visibility
  platforms: PlatformVisibility[];
  
  // Geographic Restrictions
  geoRestrictions: GeoRestriction[];
  
  // Time-based Visibility
  publishDate?: Timestamp;
  hideDate?: Timestamp;
  
  // Access Control
  accessLevel: 'public' | 'registered_users' | 'customers_only' | 'private';
  allowedUserGroups: string[];
}

export interface PlatformVisibility {
  platform: 'website' | 'mobile_app' | 'social_media' | 'email' | 'sms';
  isVisible: boolean;
  customSettings?: Record<string, unknown>;
}

export interface GeoRestriction {
  type: 'include' | 'exclude';
  countries: string[];
  regions?: string[];
  reason?: string;
}

export interface AudienceSettings {
  targetAudience: string[];
  excludeAudience: string[];
  
  // Demographic Targeting
  ageRange?: AgeRange;
  genderPreference?: 'all' | 'male' | 'female' | 'other';
  locationTargeting?: Location[];
  
  // Behavioral Targeting
  customerSegments: string[];
  purchaseHistory?: PurchaseHistoryFilter;
  engagementLevel?: 'high' | 'medium' | 'low' | 'all';
  
  // Preference Targeting
  languagePreferences: string[];
  communicationPreferences: ResponseChannel[];
  interestCategories: string[];
}

export interface AgeRange {
  min: number;
  max: number;
}

export interface PurchaseHistoryFilter {
  hasOrderHistory: boolean;
  orderValue?: {
    min: number;
    max: number;
  };
  orderCount?: {
    min: number;
    max: number;
  };
  lastOrderDate?: {
    after: Timestamp;
    before: Timestamp;
  };
}

// ===== FOLLOW-UP & RESOLUTION =====
export interface FollowUpInfo {
  isRequired: boolean;
  followUpDate?: Timestamp;
  followUpType: 'automatic' | 'manual' | 'conditional';
  
  // Follow-up Actions
  actions: FollowUpAction[];
  reminders: FollowUpReminder[];
  
  // Escalation
  escalationRules: EscalationRule[];
  currentEscalationLevel: EscalationLevel;
  
  // Completion
  isComplete: boolean;
  completedAt?: Timestamp;
  completionNotes?: string;
}

export interface FollowUpAction {
  type: 'send_email' | 'make_call' | 'send_sms' | 'schedule_meeting' | 'create_ticket' | 'update_status';
  description: string;
  dueDate: Timestamp;
  assignedTo: ID;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: ResponsePriority;
  metadata: Record<string, unknown>;
}

export interface FollowUpReminder {
  id: ID;
  reminderDate: Timestamp;
  message: string;
  recipientId: ID;
  channel: ResponseChannel;
  isSent: boolean;
  sentAt?: Timestamp;
}

export interface EscalationRule {
  trigger: 'time_based' | 'satisfaction_score' | 'complexity' | 'customer_type' | 'manual';
  condition: Record<string, unknown>;
  escalateTo: EscalationLevel;
  action: AutomationAction;
  isActive: boolean;
}

export interface ResolutionInfo {
  isResolved: boolean;
  resolutionType: 'information_provided' | 'issue_fixed' | 'refund_processed' | 'replacement_sent' | 'policy_explained' | 'other';
  resolutionDetails: string;
  resolutionDate?: Timestamp;
  resolvedBy: ID;
  
  // Customer Feedback
  customerSatisfied: boolean;
  satisfactionScore?: number;
  customerFeedback?: string;
  
  // Follow-up Required
  requiresFollowUp: boolean;
  followUpDate?: Timestamp;
  followUpReason?: string;
  
  // Resolution Metrics
  timeToResolution: number; // minutes
  touchpointCount: number;
  escalationCount: number;
}

// ===== PERSONALIZATION & CONTEXT =====
export interface PersonalizationData {
  customerTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'vip';
  preferredLanguage: string;
  communicationStyle: 'formal' | 'casual' | 'technical' | 'simple';
  responsePreferences: ResponsePreferences;
  
  // Historical Context
  previousInteractions: PreviousInteraction[];
  commonIssues: string[];
  satisfactionTrend: 'improving' | 'declining' | 'stable';
  
  // Behavioral Insights
  responseTimeExpectation: number; // minutes
  preferredChannels: ResponseChannel[];
  bestContactTime: TimePreference;
}

export interface ResponsePreferences {
  wantsDetailedExplanations: boolean;
  prefersQuickResponses: boolean;
  likesPersonalTouch: boolean;
  wantsFollowUp: boolean;
  prefersPhone: boolean;
  prefersEmail: boolean;
  prefersChat: boolean;
}

export interface PreviousInteraction {
  date: Timestamp;
  type: 'support' | 'complaint' | 'inquiry' | 'compliment' | 'suggestion';
  summary: string;
  resolution: string;
  satisfactionScore?: number;
  agent: ID;
}

export interface TimePreference {
  timezone: string;
  preferredDays: string[];
  preferredHours: {
    start: string;
    end: string;
  };
  avoidDays?: string[];
}

export interface CustomerContext {
  // Customer Information
  customerId?: ID;
  customerType: 'new' | 'returning' | 'vip' | 'problematic' | 'advocate';
  loyaltyLevel: number;
  lifetimeValue: number;
  
  // Purchase Context
  recentOrders: RecentOrder[];
  productOwnership: ProductOwnership[];
  warrantyStatus: WarrantyInfo[];
  
  // Interaction History
  supportTickets: SupportTicketSummary[];
  reviewHistory: ReviewHistorySummary;
  communicationHistory: CommunicationHistory;
  
  // Risk & Compliance
  riskProfile: 'low' | 'medium' | 'high';
  fraudIndicators: string[];
  complianceFlags: string[];
}

export interface RecentOrder {
  orderId: ID;
  orderDate: Timestamp;
  orderValue: number;
  status: string;
  products: OrderProduct[];
}

export interface OrderProduct {
  productId: ID;
  productName: string;
  category: string;
  quantity: number;
  price: number;
}

export interface ProductOwnership {
  productId: ID;
  productName: string;
  purchaseDate: Timestamp;
  warrantyExpiry?: Timestamp;
  registrationStatus: 'registered' | 'unregistered';
}

export interface WarrantyInfo {
  productId: ID;
  warrantyType: string;
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: boolean;
  claimHistory: WarrantyClaim[];
}

export interface WarrantyClaim {
  claimId: ID;
  claimDate: Timestamp;
  issue: string;
  status: string;
  resolution?: string;
}

export interface SupportTicketSummary {
  ticketId: ID;
  date: Timestamp;
  category: string;
  status: string;
  satisfaction?: number;
  resolutionTime: number;
}

export interface ReviewHistorySummary {
  totalReviews: number;
  averageRating: number;
  recentReviews: RecentReview[];
  reviewTrends: ReviewTrend[];
}

export interface RecentReview {
  reviewId: ID;
  productId: ID;
  rating: number;
  date: Timestamp;
  verified: boolean;
}

export interface ReviewTrend {
  period: string;
  averageRating: number;
  reviewCount: number;
  sentiment: ReviewSentiment;
}

export interface CommunicationHistory {
  totalContacts: number;
  preferredChannel: ResponseChannel;
  responseRate: number;
  lastContact: Timestamp;
  communicationProfile: CommunicationProfile;
}

export interface CommunicationProfile {
  responsiveness: 'high' | 'medium' | 'low';
  preferredTone: ResponseTone;
  communicationFrequency: 'daily' | 'weekly' | 'monthly' | 'as_needed';
  optInChannels: ResponseChannel[];
  optOutChannels: ResponseChannel[];
}

// ===== AUTOMATION & AI =====
export interface AutomationInfo {
  // Automation Rules
  triggeredRules: TriggeredRule[];
  automationLevel: 'none' | 'basic' | 'advanced' | 'full';
  
  // Workflow
  workflowId?: ID;
  workflowStep?: number;
  nextActions: AutomatedAction[];
  
  // Scheduling
  isScheduled: boolean;
  scheduledActions: ScheduledAction[];
  
  // Conditions
  conditions: AutomationCondition[];
  triggers: AutomationTrigger[];
}

export interface TriggeredRule {
  ruleId: ID;
  ruleName: string;
  triggeredAt: Timestamp;
  action: AutomationAction;
  result: 'success' | 'failure' | 'pending';
  errorMessage?: string;
}

export interface AutomatedAction {
  type: AutomationAction;
  description: string;
  priority: ResponsePriority;
  scheduledFor?: Timestamp;
  parameters: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ScheduledAction {
  actionType: AutomationAction;
  scheduledTime: Timestamp;
  description: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  isActive: boolean;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'ends_with';
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

export interface AutomationTrigger {
  event: 'review_submitted' | 'rating_threshold' | 'time_elapsed' | 'keyword_detected' | 'sentiment_change';
  condition?: AutomationCondition;
  action: AutomationAction;
  isActive: boolean;
}

export interface AIAssistanceInfo {
  // AI Features
  aiSuggestions: AISuggestion[];
  sentimentAnalysis: SentimentAnalysis;
  responseRecommendations: ResponseRecommendation[];
  
  // Language Processing
  languageDetection: LanguageDetection;
  translationSuggestions: TranslationSuggestion[];
  
  // Content Generation
  generatedContent: GeneratedContent[];
  templateSuggestions: TemplateSuggestion[];
  
  // Quality Assistance
  qualityInsights: QualityInsight[];
  improvementSuggestions: ImprovementSuggestion[];
  
  // Predictive Analytics
  satisfactionPrediction: SatisfactionPrediction;
  escalationRisk: EscalationRisk;
}

export interface AISuggestion {
  type: 'response_tone' | 'content_improvement' | 'personalization' | 'escalation' | 'follow_up';
  suggestion: string;
  confidence: number; // 0-1
  reasoning: string;
  isAccepted?: boolean;
}

export interface SentimentAnalysis {
  overallSentiment: ReviewSentiment;
  confidence: number;
  emotionalIndicators: EmotionalIndicator[];
  keyPhrases: KeyPhrase[];
  urgencyScore: number; // 0-1
}

export interface EmotionalIndicator {
  emotion: 'joy' | 'anger' | 'sadness' | 'fear' | 'surprise' | 'disgust' | 'trust' | 'anticipation';
  intensity: number; // 0-1
  textEvidence: string[];
}

export interface KeyPhrase {
  phrase: string;
  sentiment: ReviewSentiment;
  importance: number; // 0-1
  category: string;
}

export interface ResponseRecommendation {
  type: 'template' | 'custom' | 'escalation' | 'resolution';
  content: string;
  tone: ResponseTone;
  priority: ResponsePriority;
  confidence: number;
  reasoning: string;
}

export interface LanguageDetection {
  detectedLanguage: string;
  confidence: number;
  alternativeLanguages: AlternativeLanguage[];
}

export interface AlternativeLanguage {
  language: string;
  confidence: number;
}

export interface TranslationSuggestion {
  targetLanguage: string;
  translatedContent: string;
  confidence: number;
  translationService: string;
}

export interface GeneratedContent {
  type: 'full_response' | 'partial_response' | 'summary' | 'follow_up';
  content: string;
  tone: ResponseTone;
  confidence: number;
  generationMethod: 'template_based' | 'ai_generated' | 'hybrid';
}

export interface TemplateSuggestion {
  templateId: ID;
  templateName: string;
  matchScore: number;
  customizations: TemplateCustomization[];
}

export interface TemplateCustomization {
  field: string;
  suggestedValue: string;
  reasoning: string;
}

export interface QualityInsight {
  dimension: 'clarity' | 'completeness' | 'tone' | 'accuracy' | 'helpfulness';
  score: number; // 0-100
  feedback: string;
  improvementSuggestion: string;
}

export interface ImprovementSuggestion {
  category: 'content' | 'structure' | 'tone' | 'personalization' | 'action_items';
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
}

export interface SatisfactionPrediction {
  predictedScore: number; // 0-5
  confidence: number; // 0-1
  factors: PredictionFactor[];
  recommendations: string[];
}

export interface PredictionFactor {
  factor: string;
  impact: number; // -1 to 1
  description: string;
}

export interface EscalationRisk {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1
  riskFactors: string[];
  preventionActions: string[];
}

// ===== COMPLIANCE & LEGAL =====
export interface ComplianceInfo {
  requiresCompliance: boolean;
  complianceFrameworks: string[];
  dataHandling: DataHandlingInfo;
  retentionPolicy: RetentionPolicy;
  
  // Privacy & Security
  containsPersonalData: boolean;
  dataCategories: string[];
  processingPurposes: string[];
  
  // Regulatory Requirements
  regulatoryRequirements: RegulatoryRequirement[];
  complianceChecks: ComplianceCheck[];
  
  // Audit Trail
  auditEvents: AuditEvent[];
}

export interface DataHandlingInfo {
  dataTypes: string[];
  processingBasis: string[];
  storageLocation: string;
  encryptionLevel: string;
  accessControls: AccessControl[];
}

export interface AccessControl {
  role: string;
  permissions: string[];
  conditions: string[];
}

export interface RetentionPolicy {
  retentionPeriod: number; // days
  archivalDate?: Timestamp;
  deletionDate?: Timestamp;
  retentionReason: string;
  exceptions?: string[];
}

export interface RegulatoryRequirement {
  framework: string;
  requirement: string;
  compliance_status: 'compliant' | 'non_compliant' | 'pending_review';
  evidence: string[];
  lastChecked: Timestamp;
}

export interface ComplianceCheck {
  checkType: string;
  status: 'passed' | 'failed' | 'warning' | 'not_applicable';
  details: string;
  timestamp: Timestamp;
  remediation?: string;
}

export interface AuditEvent {
  eventType: string;
  timestamp: Timestamp;
  userId: ID;
  action: string;
  details: Record<string, unknown>;
  ipAddress: string;
}

export interface LegalReviewInfo {
  isRequired: boolean;
  reviewerId?: ID;
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'requires_modification';
  reviewDate?: Timestamp;
  legalNotes?: string;
  
  // Risk Assessment
  legalRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  mitigationActions: string[];
  
  // Approval
  approvalRequired: boolean;
  approvedBy?: ID;
  approvalDate?: Timestamp;
  conditions?: string[];
}

// ===== LOCALIZATION =====
export interface ReplyTranslation {
  language: string;
  content: string;
  isComplete: boolean;
  translatedBy?: ID;
  translationMethod: 'human' | 'machine' | 'hybrid';
  qualityScore?: number;
  
  // Review Process
  reviewStatus: 'pending' | 'approved' | 'needs_revision';
  reviewedBy?: ID;
  reviewNotes?: string;
  
  // Cultural Adaptation
  culturalAdaptations: CulturalAdaptation[];
  localizations: LocalizationInfo[];
  
  // Timeline
  translatedAt: Timestamp;
  lastUpdated: Timestamp;
}

export interface CulturalAdaptation {
  aspect: 'tone' | 'formality' | 'cultural_reference' | 'business_practice' | 'legal_requirement';
  original: string;
  adaptation: string;
  reason: string;
}

export interface LocalizationInfo {
  region: string;
  modifications: LocalizationModification[];
  localRegulations: string[];
  culturalConsiderations: string[];
}

export interface LocalizationModification {
  type: 'content' | 'tone' | 'structure' | 'legal_disclaimer' | 'contact_info';
  modification: string;
  reason: string;
}

// ===== REQUEST/RESPONSE INTERFACES =====
export interface CreateReviewReplyRequest {
  reviewId: ID;
  content: string;
  type?: ReplyType;
  tone?: ResponseTone;
  priority?: ResponsePriority;
  isPublic?: boolean;
  parentReplyId?: ID;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export interface UpdateReviewReplyRequest {
  content?: string;
  status?: ReplyStatus;
  type?: ReplyType;
  tone?: ResponseTone;
  priority?: ResponsePriority;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export interface ReviewReplyQueryParams extends PaginationParams, SortParams, FilterParams {
  reviewId?: ID;
  status?: ReplyStatus[];
  type?: ReplyType[];
  priority?: ResponsePriority[];
  tone?: ResponseTone[];
  assignedAgent?: ID;
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  hasEscalation?: boolean;
  isResolved?: boolean;
  language?: string;
}

export interface BulkReplyRequest {
  reviewIds: ID[];
  content: string;
  type: ReplyType;
  tone?: ResponseTone;
  useTemplate?: boolean;
  templateId?: ID;
  personalize?: boolean;
}

export interface ReplyApprovalRequest {
  replyId: ID;
  action: 'approve' | 'reject' | 'request_changes';
  notes?: string;
  conditions?: string[];
}

export interface EscalationRequest {
  replyId: ID;
  escalationLevel: EscalationLevel;
  reason: string;
  urgency: ResponsePriority;
  assignTo?: ID;
  notes?: string;
}

export type ReviewReplyResponse = APIResponse<ReviewReply>;
export type ReviewReplyListResponse = APIResponse<PaginatedResponse<ReviewReply>>;
export type ReplyAnalyticsResponse = APIResponse<ReplyAnalytics>;

// ===== HOOKS & STATE MANAGEMENT =====
export interface UseReviewReplyHook {
  reply: ReviewReply | null;
  isLoading: boolean;
  error: APIError | null;
  
  // Actions
  fetchReply: (id: ID) => Promise<void>;
  createReply: (data: CreateReviewReplyRequest) => Promise<void>;
  updateReply: (id: ID, data: UpdateReviewReplyRequest) => Promise<void>;
  deleteReply: (id: ID) => Promise<void>;
  
  // Status Management
  publishReply: (id: ID) => Promise<void>;
  draftReply: (id: ID) => Promise<void>;
  archiveReply: (id: ID) => Promise<void>;
  
  // Approval & Moderation
  submitForApproval: (id: ID) => Promise<void>;
  approveReply: (request: ReplyApprovalRequest) => Promise<void>;
  rejectReply: (request: ReplyApprovalRequest) => Promise<void>;
  
  // Escalation
  escalateReply: (request: EscalationRequest) => Promise<void>;
  assignAgent: (id: ID, agentId: ID) => Promise<void>;
  
  // AI Assistance
  generateSuggestions: (id: ID) => Promise<void>;
  analyzeSentiment: (id: ID) => Promise<void>;
  getResponseRecommendations: (id: ID) => Promise<void>;
  
  // Analytics
  trackInteraction: (id: ID, type: string) => void;
  fetchAnalytics: (id: ID) => Promise<void>;
  
  // Templates
  applyTemplate: (id: ID, templateId: ID) => Promise<void>;
  saveAsTemplate: (id: ID, templateName: string) => Promise<void>;
}

export interface UseReviewReplyListHook {
  replies: ReviewReply[];
  totalCount: number;
  isLoading: boolean;
  error: APIError | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Actions
  fetchReplies: (params?: ReviewReplyQueryParams) => Promise<void>;
  refreshReplies: () => Promise<void>;
  loadMore: () => Promise<void>;
  
  // Navigation
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  
  // Filtering & Sorting
  applyFilters: (filters: Partial<ReviewReplyQueryParams>) => Promise<void>;
  clearFilters: () => Promise<void>;
  updateSort: (sort: SortParams) => Promise<void>;
  
  // Bulk Operations
  bulkReply: (request: BulkReplyRequest) => Promise<void>;
  bulkApprove: (ids: ID[]) => Promise<void>;
  bulkReject: (ids: ID[]) => Promise<void>;
  bulkAssign: (ids: ID[], agentId: ID) => Promise<void>;
  bulkStatusChange: (ids: ID[], status: ReplyStatus) => Promise<void>;
  
  // Search
  search: (query: string) => Promise<void>;
  clearSearch: () => Promise<void>;
}

// ===== COMPONENT PROPS =====
export interface ReviewReplyComponentProps {
  replyId?: ID;
  reply?: ReviewReply;
  reviewId?: ID;
  showModeration?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  onEdit?: (reply: ReviewReply) => void;
  onDelete?: (replyId: ID) => void;
  onEscalate?: (replyId: ID) => void;
  className?: string;
}

export interface ReplyEditorProps {
  reply?: ReviewReply;
  reviewId?: ID;
  parentReplyId?: ID;
  onSave: (reply: ReviewReply) => Promise<void>;
  onCancel: () => void;
  templates?: ReplyTemplate[];
  aiSuggestionsEnabled?: boolean;
  moderationEnabled?: boolean;
  className?: string;
}

export interface ReplyModerationProps {
  reply: ReviewReply;
  onApprove: (notes?: string) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onRequestChanges: (changes: string[]) => Promise<void>;
  showDetails?: boolean;
  className?: string;
}

export interface BulkReplyManagerProps {
  selectedReviews: ID[];
  onBulkReply: (request: BulkReplyRequest) => Promise<void>;
  templates?: ReplyTemplate[];
  allowPersonalization?: boolean;
  className?: string;
}

export interface ReplyTemplate {
  id: ID;
  name: string;
  content: string;
  type: ReplyType;
  tone: ResponseTone;
  category: string;
  variables: TemplateVariable[];
  isDefault?: boolean;
  isPopular?: boolean;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  defaultValue?: string;
  options?: string[];
  required: boolean;
  description?: string;
}

// ===== TYPE USAGE TO AVOID WARNINGS =====
export interface ReviewReplyTypeUsage {
  user: User;
}
