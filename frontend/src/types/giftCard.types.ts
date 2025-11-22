import {
  ID,
  Timestamp,
  BaseEntity,
  Status,
  Currency,
  Price,
  ImageAsset,
  PaginatedResponse,
  SearchFilters
} from './common.types';
import { User } from './user.types';
import { Order } from './order.types';
import { Product } from './product.types';

// Core Gift Card Types
export interface GiftCard extends BaseEntity {
  // Basic Information
  code: string;
  type: GiftCardType;
  title: string;
  description?: string;
  
  // Financial Details
  denomination: number;
  currency: Currency;
  balance: number;
  originalAmount: number;
  
  // Visual Design
  design: GiftCardDesign;
  customization: GiftCardCustomization;
  
  // Ownership & Transfer
  purchaserId?: ID;
  purchaser?: User;
  recipientId?: ID;
  recipient?: User;
  recipientEmail?: string;
  recipientPhone?: string;
  
  // Activation & Validity
  status: GiftCardStatus;
  isActive: boolean;
  activatedAt?: Timestamp;
  expiresAt?: Timestamp;
  neverExpires: boolean;
  
  // Usage Restrictions
  restrictions: GiftCardRestrictions;
  applicableProducts: ID[];
  applicableCategories: ID[];
  excludedProducts: ID[];
  excludedCategories: ID[];
  
  // Transaction History
  transactions: GiftCardTransaction[];
  totalUsed: number;
  usageCount: number;
  lastUsedAt?: Timestamp;
  
  // Security
  securityFeatures: SecurityFeatures;
  fraudChecks: FraudCheck[];
  
  // Delivery
  deliveryMethod: DeliveryMethod;
  deliveryStatus: DeliveryStatus;
  deliveryDetails: DeliveryDetails;
  
  // Marketing & Campaigns
  campaignId?: ID;
  promotionCode?: string;
  bonusAmount?: number;
  
  // Metadata
  sourceChannel: SourceChannel;
  purchaseOrderId?: ID;
  giftMessage?: string;
  senderName?: string;
  
  // Analytics
  analytics: GiftCardAnalytics;
  
  // Legal & Compliance
  termsAccepted: boolean;
  termsVersion: string;
  complianceData: ComplianceData;
}

export interface GiftCardDesign extends BaseEntity {
  // Basic Information
  name: string;
  description?: string;
  category: DesignCategory;
  
  // Visual Elements
  template: DesignTemplate;
  backgroundImage?: ImageAsset;
  foregroundElements: DesignElement[];
  colorScheme: ColorScheme;
  typography: TypographyStyle;
  
  // Customization Options
  customizationOptions: CustomizationOption[];
  allowCustomText: boolean;
  allowCustomImages: boolean;
  allowRecipientPhoto: boolean;
  
  // Occasions & Themes
  occasions: Occasion[];
  themes: Theme[];
  tags: string[];
  
  // Seasonal & Special
  isSeasonalDesign: boolean;
  seasonalPeriod?: SeasonalPeriod;
  isLimitedEdition: boolean;
  limitedEditionDetails?: LimitedEditionDetails;
  
  // Accessibility
  accessibilityFeatures: AccessibilityFeature[];
  
  // Usage & Popularity
  usageCount: number;
  popularityScore: number;
  rating: number;
  
  // Status
  status: Status;
  isActive: boolean;
  isDefault: boolean;
  
  // Metadata
  createdBy: ID;
  approvedBy?: ID;
  approvedAt?: Timestamp;
}

export interface GiftCardProgram extends BaseEntity {
  // Program Details
  name: string;
  description?: string;
  type: ProgramType;
  
  // Configuration
  denominations: Denomination[];
  customAmountAllowed: boolean;
  minCustomAmount?: number;
  maxCustomAmount?: number;
  
  // Validity & Expiration
  defaultValidityPeriod: number; // in days
  maxValidityPeriod?: number;
  allowNeverExpires: boolean;
  expirationWarningPeriod: number;
  
  // Fees & Charges
  fees: Fee[];
  reloadingFee?: number;
  inactivityFee?: number;
  replacementFee?: number;
  
  // Features & Benefits
  features: ProgramFeature[];
  benefits: ProgramBenefit[];
  rewards: RewardProgram[];
  
  // Restrictions & Rules
  globalRestrictions: GlobalRestriction[];
  usageRules: UsageRule[];
  transferRules: TransferRule[];
  
  // Marketing
  promotions: GiftCardPromotion[];
  campaigns: MarketingCampaign[];
  
  // Compliance
  complianceRequirements: ComplianceRequirement[];
  legalTerms: LegalTerm[];
  
  // Analytics & Reporting
  analyticsEnabled: boolean;
  reportingFrequency: ReportingFrequency;
  
  // Status
  status: Status;
  isActive: boolean;
  launchedAt?: Timestamp;
  
  // Metadata
  managedBy: ID[];
  lastReviewDate?: Timestamp;
  nextReviewDate?: Timestamp;
}

// Transaction & Financial Types
export interface GiftCardTransaction extends BaseEntity {
  // Transaction Details
  giftCardId: ID;
  giftCard?: GiftCard;
  type: TransactionType;
  amount: number;
  currency: Currency;
  
  // Related Entities
  orderId?: ID;
  order?: Order;
  userId?: ID;
  user?: User;
  
  // Transaction Context
  description: string;
  reference: string;
  channel: TransactionChannel;
  location?: TransactionLocation;
  
  // Processing Details
  status: TransactionStatus;
  processedAt?: Timestamp;
  processingTime?: number;
  
  // Balance Information
  balanceBefore: number;
  balanceAfter: number;
  
  // Security & Verification
  authorizationCode?: string;
  verificationMethod: VerificationMethod;
  ipAddress?: string;
  deviceFingerprint?: string;
  
  // Metadata
  metadata: TransactionMetadata;
  notes?: string;
  
  // Reversal Information
  isReversed: boolean;
  reversedAt?: Timestamp;
  reversalReason?: string;
  reversalTransactionId?: ID;
}

export interface GiftCardBalance {
  giftCardId: ID;
  currentBalance: number;
  originalAmount: number;
  totalUsed: number;
  totalReloaded: number;
  currency: Currency;
  lastUpdated: Timestamp;
  
  // Pending Transactions
  pendingDebits: number;
  pendingCredits: number;
  availableBalance: number;
  
  // Projections
  projectedBalance?: number;
  balanceHistory: BalanceHistoryEntry[];
  
  // Alerts & Notifications
  lowBalanceThreshold?: number;
  lowBalanceAlert: boolean;
  zeroBalanceAlert: boolean;
  
  // Security
  lastBalanceCheck: Timestamp;
  balanceVerification: BalanceVerification;
}

export interface GiftCardReload extends BaseEntity {
  // Reload Details
  giftCardId: ID;
  giftCard?: GiftCard;
  amount: number;
  currency: Currency;
  
  // Payment Information
  paymentMethod: PaymentMethod;
  paymentReference: string;
  
  // User Information
  reloadedBy: ID;
  user?: User;
  
  // Processing
  status: ReloadStatus;
  processedAt?: Timestamp;
  
  // Fees
  reloadFee: number;
  totalCharged: number;
  
  // Verification
  verificationRequired: boolean;
  verificationMethod?: VerificationMethod;
  verificationStatus?: VerificationStatus;
  
  // Metadata
  channel: TransactionChannel;
  location?: TransactionLocation;
  notes?: string;
}

// Security & Fraud Prevention
export interface SecurityFeatures {
  // PIN & Authentication
  hasPIN: boolean;
  pinRequired: boolean;
  pinHash?: string;
  pinAttempts: number;
  maxPinAttempts: number;
  isLockedDueToPIN: boolean;
  
  // Two-Factor Authentication
  twoFactorEnabled: boolean;
  twoFactorMethod?: TwoFactorMethod;
  
  // Verification
  phoneVerification: boolean;
  emailVerification: boolean;
  identityVerification: boolean;
  
  // Security Questions
  securityQuestions: SecurityQuestion[];
  
  // Monitoring
  fraudMonitoring: boolean;
  velocityChecks: boolean;
  locationChecks: boolean;
  deviceTracking: boolean;
  
  // Encryption
  encryptionLevel: EncryptionLevel;
  tokenization: boolean;
  
  // Backup & Recovery
  backupCodes: string[];
  recoveryMethods: RecoveryMethod[];
}

export interface FraudCheck extends BaseEntity {
  // Check Details
  giftCardId: ID;
  checkType: FraudCheckType;
  result: FraudCheckResult;
  riskScore: number;
  
  // Trigger Information
  triggeredBy: FraudTrigger;
  triggerValue?: string;
  
  // Analysis
  riskFactors: RiskFactor[];
  anomalies: Anomaly[];
  patterns: FraudPattern[];
  
  // Decision
  action: FraudAction;
  autoResolved: boolean;
  reviewRequired: boolean;
  reviewedBy?: ID;
  reviewedAt?: Timestamp;
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  location?: GeoLocation;
  
  // Follow-up
  escalated: boolean;
  escalatedTo?: ID;
  resolution?: FraudResolution;
  resolutionNotes?: string;
}

// Delivery & Distribution
export interface DeliveryDetails {
  // Method Configuration
  method: DeliveryMethod;
  scheduledDelivery: boolean;
  deliveryDate?: Timestamp;
  deliveryTime?: string;
  
  // Recipient Information
  recipientInfo: RecipientInfo;
  deliveryAddress?: DeliveryAddress;
  
  // Digital Delivery
  emailTemplate?: EmailTemplate;
  smsTemplate?: SMSTemplate;
  
  // Physical Delivery
  shippingMethod?: ShippingMethod;
  trackingNumber?: string;
  carrier?: string;
  
  // Status Tracking
  deliveryAttempts: DeliveryAttempt[];
  deliveredAt?: Timestamp;
  confirmationRequired: boolean;
  confirmationReceived: boolean;
  
  // Customization
  personalMessage?: string;
  senderName?: string;
  wrappingOptions?: WrappingOption[];
  
  // Notifications
  deliveryNotifications: DeliveryNotification[];
  reminderNotifications: ReminderNotification[];
}

export interface GiftCardCustomization {
  // Personal Message
  hasPersonalMessage: boolean;
  personalMessage?: string;
  messageFont?: string;
  messageColor?: string;
  messagePosition?: MessagePosition;
  
  // Recipient Information
  recipientName?: string;
  senderName?: string;
  occasion?: string;
  
  // Visual Customization
  customBackground?: ImageAsset;
  customForeground?: ImageAsset;
  recipientPhoto?: ImageAsset;
  logoCustomization?: LogoCustomization;
  
  // Text Customization
  customTitle?: string;
  customSubtitle?: string;
  fontFamily?: string;
  fontSize?: string;
  textColor?: string;
  
  // Layout Customization
  layoutTemplate?: string;
  elementPositions?: ElementPosition[];
  
  // Branding
  corporateBranding?: CorporateBranding;
  brandingElements?: BrandingElement[];
  
  // Preview & Approval
  previewGenerated: boolean;
  previewUrl?: string;
  approvalRequired: boolean;
  approvedAt?: Timestamp;
  approvedBy?: ID;
}

// Analytics & Reporting
export interface GiftCardAnalytics {
  giftCardId: ID;
  
  // Usage Analytics
  usageFrequency: UsageFrequency;
  usagePattern: UsagePattern;
  spendingBehavior: SpendingBehavior;
  
  // Timing Analytics
  timeToFirstUse?: number;
  averageTransactionAmount: number;
  preferredUsageTimes: PreferredTime[];
  seasonalUsage: SeasonalUsage[];
  
  // Channel Analytics
  usageChannels: ChannelUsage[];
  preferredChannels: string[];
  
  // Product Analytics
  preferredCategories: CategoryUsage[];
  productAffinities: ProductAffinity[];
  
  // Geographic Analytics
  usageLocations: LocationUsage[];
  travelUsage: TravelUsage[];
  
  // Recipient Analytics
  recipientBehavior?: RecipientBehavior;
  giftingSuccess: GiftingSuccess;
  
  // Predictive Analytics
  churnProbability: number;
  lifetimeValuePrediction: number;
  recommendedActions: RecommendedAction[];
  
  // Last Updated
  lastUpdated: Timestamp;
  dataQuality: DataQuality;
}

export interface GiftCardSystemAnalytics {
  period: AnalyticsPeriod;
  
  // Volume Metrics
  totalGiftCards: number;
  newGiftCards: number;
  activeGiftCards: number;
  expiredGiftCards: number;
  
  // Financial Metrics
  totalValue: number;
  totalSold: number;
  totalRedeemed: number;
  outstandingLiability: number;
  
  // Usage Metrics
  redemptionRate: number;
  averageTimeToRedemption: number;
  partialRedemptionRate: number;
  fullRedemptionRate: number;
  
  // Performance Metrics
  conversionRate: number;
  repeatPurchaseRate: number;
  giftingSuccessRate: number;
  customerSatisfactionScore: number;
  
  // Channel Performance
  channelPerformance: ChannelPerformance[];
  topPerformingChannels: string[];
  
  // Design Performance
  designPerformance: DesignPerformance[];
  popularDesigns: GiftCardDesign[];
  
  // Fraud & Security
  fraudRate: number;
  securityIncidents: number;
  suspiciousActivities: number;
  
  // Trends
  salesTrends: SalesTrend[];
  usageTrends: UsageTrend[];
  seasonalPatterns: SeasonalPattern[];
  
  // Comparison
  periodComparison: PeriodComparison;
  benchmarkComparison: BenchmarkComparison;
}

// Campaign & Marketing Types
export interface GiftCardPromotion extends BaseEntity {
  // Basic Information
  name: string;
  description?: string;
  type: PromotionType;
  
  // Timing
  startDate: Timestamp;
  endDate?: Timestamp;
  timezone: string;
  
  // Conditions
  eligibilityRules: EligibilityRule[];
  minimumPurchase?: number;
  maximumPurchase?: number;
  
  // Benefits
  discountType: DiscountType;
  discountValue: number;
  bonusAmount?: number;
  freeShipping?: boolean;
  
  // Targeting
  targetAudience: TargetAudience[];
  geographicRestrictions: string[];
  channelRestrictions: string[];
  
  // Usage Limits
  usageLimit?: number;
  usagePerCustomer?: number;
  totalBudget?: number;
  
  // Performance
  totalUsage: number;
  totalRevenue: number;
  totalSavings: number;
  conversionRate: number;
  
  // Status
  status: Status;
  isActive: boolean;
  
  // Metadata
  createdBy: ID;
  approvedBy?: ID;
  campaignManager?: ID;
}

export interface MarketingCampaign extends BaseEntity {
  // Campaign Details
  name: string;
  description?: string;
  type: CampaignType;
  objective: CampaignObjective;
  
  // Timing
  plannedStartDate: Timestamp;
  actualStartDate?: Timestamp;
  plannedEndDate?: Timestamp;
  actualEndDate?: Timestamp;
  
  // Budget & Resources
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  teamMembers: TeamMember[];
  
  // Targeting & Segmentation
  targetSegments: TargetSegment[];
  personalizedContent: boolean;
  abTestingEnabled: boolean;
  
  // Channels & Tactics
  channels: MarketingChannel[];
  tactics: MarketingTactic[];
  content: CampaignContent[];
  
  // Performance Tracking
  kpis: CampaignKPI[];
  goals: CampaignGoal[];
  actualPerformance: CampaignPerformance;
  
  // Attribution
  attributionModel: AttributionModel;
  touchpointTracking: boolean;
  crossChannelAttribution: boolean;
  
  // Status & Approval
  status: CampaignStatus;
  approvalStatus: ApprovalStatus;
  approvalWorkflow: ApprovalWorkflow[];
  
  // Metadata
  campaignManager: ID;
  stakeholders: ID[];
  externalAgency?: string;
}

// Redemption & Usage Types
export interface GiftCardRedemption extends BaseEntity {
  // Redemption Details
  giftCardId: ID;
  giftCard?: GiftCard;
  amount: number;
  currency: Currency;
  
  // Order Information
  orderId: ID;
  order?: Order;
  appliedProducts: ID[];
  
  // User Information
  redeemedBy: ID;
  user?: User;
  
  // Processing
  status: RedemptionStatus;
  processedAt?: Timestamp;
  
  // Validation
  validationChecks: ValidationCheck[];
  balanceVerified: boolean;
  authorizationCode: string;
  
  // Channel & Location
  channel: RedemptionChannel;
  storeLocation?: StoreLocation;
  onlineSession?: OnlineSession;
  
  // Partial Redemption
  isPartialRedemption: boolean;
  remainingBalance: number;
  
  // Metadata
  metadata: RedemptionMetadata;
  notes?: string;
}

export interface GiftCardValidation {
  giftCardId: ID;
  code: string;
  
  // Validation Results
  isValid: boolean;
  isActive: boolean;
  hasBalance: boolean;
  isExpired: boolean;
  
  // Balance Information
  availableBalance: number;
  currency: Currency;
  
  // Restrictions
  applicableToCart: boolean;
  restrictionViolations: RestrictionViolation[];
  
  // Security
  securityChecks: SecurityCheck[];
  fraudScore: number;
  
  // Metadata
  validatedAt: Timestamp;
  validatedBy?: ID;
  ipAddress?: string;
  sessionId?: string;
}

// Integration & API Types
export interface GiftCardAPI {
  // Gift Card Operations
  create: (request: GiftCardCreateRequest) => Promise<GiftCard>;
  get: (id: ID) => Promise<GiftCard>;
  update: (id: ID, request: GiftCardUpdateRequest) => Promise<GiftCard>;
  delete: (id: ID) => Promise<void>;
  
  // Balance Operations
  getBalance: (code: string) => Promise<GiftCardBalance>;
  reload: (code: string, amount: number) => Promise<GiftCardReload>;
  
  // Transaction Operations
  redeem: (code: string, amount: number, orderId: ID) => Promise<GiftCardRedemption>;
  refund: (transactionId: ID, amount: number) => Promise<GiftCardTransaction>;
  
  // Validation Operations
  validate: (code: string) => Promise<GiftCardValidation>;
  checkBalance: (code: string) => Promise<number>;
  
  // Bulk Operations
  bulkCreate: (requests: GiftCardCreateRequest[]) => Promise<GiftCard[]>;
  bulkActivate: (codes: string[]) => Promise<boolean>;
  bulkDeactivate: (codes: string[]) => Promise<boolean>;
  
  // Reporting Operations
  getAnalytics: (period: AnalyticsPeriod) => Promise<GiftCardSystemAnalytics>;
  exportTransactions: (filters: TransactionFilters) => Promise<string>;
  generateReport: (type: ReportType, filters: ReportFilters) => Promise<Report>;
}

// Enums and Constants
export type GiftCardType = 
  | 'digital'
  | 'physical'
  | 'hybrid'
  | 'corporate'
  | 'promotional'
  | 'reward'
  | 'loyalty';

export type GiftCardStatus = 
  | 'pending'
  | 'active'
  | 'inactive'
  | 'expired'
  | 'used'
  | 'cancelled'
  | 'fraudulent'
  | 'locked';

export type TransactionType = 
  | 'purchase'
  | 'redemption'
  | 'reload'
  | 'refund'
  | 'transfer'
  | 'expiration'
  | 'fee'
  | 'bonus';

export type TransactionStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'reversed';

export type DeliveryMethod = 
  | 'email'
  | 'sms'
  | 'physical_mail'
  | 'in_store_pickup'
  | 'digital_download'
  | 'mobile_app'
  | 'social_media';

export type DeliveryStatus = 
  | 'pending'
  | 'scheduled'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'returned';

export type SourceChannel = 
  | 'website'
  | 'mobile_app'
  | 'in_store'
  | 'call_center'
  | 'partner'
  | 'affiliate'
  | 'social_media';

export type PromotionType = 
  | 'percentage_discount'
  | 'fixed_amount_discount'
  | 'bonus_amount'
  | 'buy_one_get_one'
  | 'free_shipping'
  | 'bulk_discount';

export type CampaignType = 
  | 'acquisition'
  | 'retention'
  | 'reactivation'
  | 'seasonal'
  | 'product_launch'
  | 'brand_awareness';

export type RedemptionStatus = 
  | 'successful'
  | 'failed'
  | 'partial'
  | 'pending_approval'
  | 'reversed';

export type FraudCheckType = 
  | 'velocity_check'
  | 'location_check'
  | 'device_check'
  | 'pattern_analysis'
  | 'risk_scoring'
  | 'manual_review';

export type FraudCheckResult = 
  | 'pass'
  | 'fail'
  | 'warning'
  | 'review_required'
  | 'escalated';

export type VerificationMethod = 
  | 'pin'
  | 'sms'
  | 'email'
  | 'biometric'
  | 'security_question'
  | 'two_factor';

export type EncryptionLevel = 
  | 'basic'
  | 'standard'
  | 'advanced'
  | 'military_grade';

export type AnalyticsPeriod = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom';

// Essential Missing Type Definitions
export interface GiftCardRestrictions {
  minAmount?: number;
  maxAmount?: number;
  allowPartialRedemption: boolean;
  allowReloading: boolean;
  allowTransfer: boolean;
  expirationExtensible: boolean;
  usageLocations: string[];
  excludedDays: string[];
  combinableWithOffers: boolean;
}

export interface ComplianceData {
  region: string;
  regulations: string[];
  lastAudit?: Timestamp;
  complianceScore: number;
  violations: string[];
  remedialActions: string[];
}

export type DesignCategory = 
  | 'seasonal'
  | 'occasion'
  | 'corporate'
  | 'themed'
  | 'minimalist'
  | 'premium'
  | 'fun'
  | 'classic';

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

export interface TypographyStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
  textAlign: 'left' | 'center' | 'right';
}

export type Occasion = 
  | 'birthday'
  | 'wedding'
  | 'graduation'
  | 'holiday'
  | 'anniversary'
  | 'congratulations'
  | 'thank_you'
  | 'general';

export type Theme = 
  | 'elegant'
  | 'modern'
  | 'vintage'
  | 'playful'
  | 'professional'
  | 'festive'
  | 'nature'
  | 'abstract';

export interface SeasonalPeriod {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: boolean;
}

export interface LimitedEditionDetails {
  totalAvailable: number;
  remaining: number;
  launchDate: Timestamp;
  endDate?: Timestamp;
  exclusivityLevel: 'limited' | 'rare' | 'ultra_rare';
}

export interface AccessibilityFeature {
  feature: string;
  description: string;
  enabled: boolean;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

export type ProgramType = 
  | 'standard'
  | 'premium'
  | 'corporate'
  | 'loyalty'
  | 'promotional'
  | 'seasonal';

export interface Fee {
  type: string;
  amount: number;
  currency: Currency;
  description: string;
  isPercentage: boolean;
  waivable: boolean;
}

export interface ProgramFeature {
  name: string;
  description: string;
  isIncluded: boolean;
  additionalCost?: number;
}

export interface ProgramBenefit {
  type: string;
  description: string;
  value: string;
  conditions?: string[];
}

export interface RewardProgram {
  name: string;
  pointsPerDollar: number;
  redemptionTiers: RedemptionTier[];
  bonusOffers: BonusOffer[];
}

export interface RedemptionTier {
  minPoints: number;
  rewardValue: number;
  rewardType: string;
}

export interface BonusOffer {
  description: string;
  multiplier: number;
  validUntil: Timestamp;
  conditions: string[];
}

export interface GlobalRestriction {
  type: string;
  description: string;
  enforcement: 'hard' | 'soft';
  exemptions?: string[];
}

export interface UsageRule {
  rule: string;
  description: string;
  priority: number;
  isActive: boolean;
}

export interface TransferRule {
  allowTransfer: boolean;
  maxTransfers?: number;
  transferFee?: number;
  verificationRequired: boolean;
}

export interface ComplianceRequirement {
  regulation: string;
  description: string;
  mandatory: boolean;
  deadline?: Timestamp;
}

export interface LegalTerm {
  section: string;
  content: string;
  version: string;
  lastUpdated: Timestamp;
}

export type ReportingFrequency = 
  | 'real_time'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly';

export type TransactionChannel = 
  | 'online'
  | 'mobile'
  | 'in_store'
  | 'phone'
  | 'kiosk'
  | 'api';

export interface TransactionLocation {
  storeId?: string;
  storeName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export type ReloadStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type VerificationStatus = 
  | 'not_required'
  | 'pending'
  | 'verified'
  | 'failed'
  | 'expired';

export type PaymentMethod = 
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'digital_wallet'
  | 'cash'
  | 'check';

export type TwoFactorMethod = 
  | 'sms'
  | 'email'
  | 'authenticator'
  | 'hardware_token'
  | 'biometric';

export interface SecurityQuestion {
  question: string;
  answerHash: string;
  attempts: number;
  maxAttempts: number;
}

export type RecoveryMethod = 
  | 'email'
  | 'sms'
  | 'security_questions'
  | 'backup_codes'
  | 'support_contact';

export type FraudTrigger = 
  | 'high_velocity'
  | 'unusual_location'
  | 'new_device'
  | 'large_amount'
  | 'suspicious_pattern'
  | 'blacklisted_ip';

export interface RiskFactor {
  factor: string;
  weight: number;
  value: string | number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Anomaly {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface FraudPattern {
  pattern: string;
  frequency: number;
  lastSeen: Timestamp;
  riskScore: number;
}

export type FraudAction = 
  | 'allow'
  | 'block'
  | 'review'
  | 'challenge'
  | 'limit'
  | 'monitor';

export interface FraudResolution {
  decision: 'approved' | 'denied' | 'restricted';
  reason: string;
  actions: string[];
  reviewer: ID;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

// Complex Data Types
export interface RecipientInfo {
  name: string;
  email?: string;
  phone?: string;
  preferredContactMethod: 'email' | 'sms' | 'phone';
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isResidential: boolean;
}

export interface EmailTemplate {
  templateId: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  attachments?: string[];
}

export interface SMSTemplate {
  templateId: string;
  message: string;
  mediaUrl?: string;
}

export type ShippingMethod = 
  | 'standard'
  | 'expedited'
  | 'overnight'
  | 'two_day'
  | 'ground'
  | 'priority';

export interface DeliveryAttempt {
  attemptNumber: number;
  timestamp: Timestamp;
  status: 'successful' | 'failed' | 'refused';
  reason?: string;
  signature?: string;
}

export interface WrappingOption {
  type: string;
  description: string;
  cost: number;
  image?: ImageAsset;
}

export interface DeliveryNotification {
  type: 'sent' | 'delivered' | 'failed';
  channel: 'email' | 'sms' | 'push';
  timestamp: Timestamp;
  details?: string;
}

export interface ReminderNotification {
  scheduledFor: Timestamp;
  sent: boolean;
  sentAt?: Timestamp;
  channel: 'email' | 'sms' | 'push';
}

export type MessagePosition = 
  | 'top'
  | 'center'
  | 'bottom'
  | 'left'
  | 'right'
  | 'custom';

export interface LogoCustomization {
  enabled: boolean;
  position: MessagePosition;
  size: 'small' | 'medium' | 'large';
  opacity: number;
}

export interface ElementPosition {
  element: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CorporateBranding {
  companyLogo: ImageAsset;
  companyColors: string[];
  brandGuidelines: string;
  approvalRequired: boolean;
}

export interface BrandingElement {
  type: string;
  content: string;
  position: ElementPosition;
  style: Record<string, string>;
}

// Analytics Supporting Types
export interface UsageFrequency {
  daily: number;
  weekly: number;
  monthly: number;
  perTransaction: number;
}

export interface UsagePattern {
  peakHours: number[];
  peakDays: string[];
  seasonalTrends: string[];
  patterns: string[];
}

export interface SpendingBehavior {
  averageTransaction: number;
  medianTransaction: number;
  largestTransaction: number;
  smallestTransaction: number;
  transactionDistribution: Record<string, number>;
}

export interface PreferredTime {
  hour: number;
  frequency: number;
  dayOfWeek: string;
}

export interface SeasonalUsage {
  season: string;
  usage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ChannelUsage {
  channel: string;
  usage: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface CategoryUsage {
  category: string;
  usage: number;
  amount: number;
  frequency: number;
}

export interface ProductAffinity {
  productId: ID;
  affinityScore: number;
  purchaseFrequency: number;
  lastPurchase: Timestamp;
}

export interface LocationUsage {
  location: string;
  usage: number;
  amount: number;
  frequency: number;
}

export interface TravelUsage {
  isFrequentTraveler: boolean;
  cities: string[];
  countries: string[];
  travelPattern: string;
}

export interface RecipientBehavior {
  timeToFirstUse: number;
  redemptionRate: number;
  satisfactionScore: number;
  repeatGiftReceiver: boolean;
}

export interface GiftingSuccess {
  wasRedeemed: boolean;
  timeToRedemption?: number;
  recipientSatisfaction?: number;
  giftingOccasion?: string;
}

export interface RecommendedAction {
  action: string;
  priority: 'low' | 'medium' | 'high';
  expectedImpact: string;
  confidence: number;
}

export interface DataQuality {
  completeness: number;
  accuracy: number;
  timeliness: number;
  consistency: number;
  lastValidation: Timestamp;
}

// Complex Data Types (continued due to length constraints)
export interface DesignTemplate {
  id: ID;
  name: string;
  category: string;
  layout: LayoutConfiguration;
  elements: TemplateElement[];
  responsive: boolean;
  customizable: boolean;
}

export interface DesignElement {
  id: ID;
  type: ElementType;
  position: Position;
  properties: ElementProperties;
  constraints: ElementConstraints;
}

export interface CustomizationOption {
  id: ID;
  name: string;
  type: CustomizationType;
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: OptionValue[];
}

export interface Denomination {
  value: number;
  currency: Currency;
  isPopular: boolean;
  displayOrder: number;
  availability: DenominationAvailability;
}

export interface TransactionMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  sessionId?: string;
  referrer?: string;
  campaignId?: string;
  source?: string;
  medium?: string;
}

export interface BalanceHistoryEntry {
  timestamp: Timestamp;
  balance: number;
  change: number;
  transactionId?: ID;
  type: TransactionType;
}

// Form & Request Types
export interface GiftCardCreateRequest {
  type: GiftCardType;
  denomination?: number;
  customAmount?: number;
  designId: ID;
  customization?: Partial<GiftCardCustomization>;
  recipientEmail?: string;
  recipientPhone?: string;
  deliveryMethod: DeliveryMethod;
  deliveryDate?: Timestamp;
  giftMessage?: string;
  senderName?: string;
  campaignCode?: string;
}

export interface GiftCardUpdateRequest {
  status?: GiftCardStatus;
  recipientEmail?: string;
  recipientPhone?: string;
  deliveryDate?: Timestamp;
  giftMessage?: string;
  customization?: Partial<GiftCardCustomization>;
}

// Additional Supporting Types
export interface ElementType {
  name: string;
  category: string;
  properties: string[];
}

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface ElementProperties {
  [key: string]: string | number | boolean;
}

export interface ElementConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
  resizable: boolean;
  moveable: boolean;
}

export interface CustomizationType {
  name: string;
  inputType: 'text' | 'number' | 'color' | 'image' | 'select' | 'boolean';
  validation?: ValidationRule[];
}

export interface OptionValue {
  label: string;
  value: string | number | boolean;
  preview?: ImageAsset;
  price?: number;
}

export interface DenominationAvailability {
  isAvailable: boolean;
  stockLevel?: number;
  maxQuantity?: number;
  restrictions?: string[];
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: string | number;
  message: string;
}

export interface LayoutConfiguration {
  width: number;
  height: number;
  dpi: number;
  format: 'portrait' | 'landscape' | 'square';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface TemplateElement {
  id: ID;
  type: string;
  name: string;
  position: Position;
  style: Record<string, string | number>;
  content?: string;
  editable: boolean;
  required: boolean;
}

// Component Props
export interface GiftCardProps {
  giftCard?: GiftCard;
  design?: GiftCardDesign;
  preview?: boolean;
  interactive?: boolean;
  showBalance?: boolean;
  showCode?: boolean;
  onRedeem?: (code: string, amount: number) => void;
  onTransfer?: (code: string, recipientEmail: string) => void;
  className?: string;
}

export interface GiftCardDesignProps {
  design: GiftCardDesign;
  customization?: GiftCardCustomization;
  preview?: boolean;
  editable?: boolean;
  onCustomizationChange?: (customization: GiftCardCustomization) => void;
  className?: string;
}

// Hook Return Types
export interface UseGiftCardReturn {
  giftCard?: GiftCard;
  balance?: GiftCardBalance;
  transactions: GiftCardTransaction[];
  loading: boolean;
  error?: string;
  redeem: (amount: number, orderId: ID) => Promise<void>;
  reload: (amount: number) => Promise<void>;
  transfer: (recipientEmail: string) => Promise<void>;
  checkBalance: () => Promise<number>;
  getTransactionHistory: () => Promise<GiftCardTransaction[]>;
}

export interface UseGiftCardProgramReturn {
  programs: GiftCardProgram[];
  designs: GiftCardDesign[];
  loading: boolean;
  error?: string;
  createGiftCard: (request: GiftCardCreateRequest) => Promise<GiftCard>;
  validateGiftCard: (code: string) => Promise<GiftCardValidation>;
  getAnalytics: (period: AnalyticsPeriod) => Promise<GiftCardSystemAnalytics>;
}

// State Management
export interface GiftCardState {
  // Data
  giftCards: GiftCard[];
  programs: GiftCardProgram[];
  designs: GiftCardDesign[];
  currentGiftCard?: GiftCard;
  
  // UI State
  loading: boolean;
  error?: string;
  filters: GiftCardFilters;
  
  // Analytics
  analytics?: GiftCardSystemAnalytics;
  
  // Cache
  lastUpdated: Timestamp;
}

export interface GiftCardFilters extends SearchFilters {
  status?: GiftCardStatus[];
  type?: GiftCardType[];
  balanceRange?: {
    min: number;
    max: number;
  };
  expirationDate?: {
    from: Timestamp;
    to: Timestamp;
  };
  hasBalance?: boolean;
  isExpired?: boolean;
}

export interface GiftCardActions {
  // CRUD Operations
  createGiftCard: (request: GiftCardCreateRequest) => Promise<void>;
  updateGiftCard: (id: ID, request: GiftCardUpdateRequest) => Promise<void>;
  activateGiftCard: (id: ID) => Promise<void>;
  deactivateGiftCard: (id: ID) => Promise<void>;
  
  // Balance Operations
  reloadGiftCard: (id: ID, amount: number) => Promise<void>;
  checkBalance: (code: string) => Promise<number>;
  
  // Transaction Operations
  redeemGiftCard: (code: string, amount: number, orderId: ID) => Promise<void>;
  transferGiftCard: (id: ID, recipientEmail: string) => Promise<void>;
  
  // Validation Operations
  validateGiftCard: (code: string) => Promise<GiftCardValidation>;
  
  // UI Operations
  setFilters: (filters: GiftCardFilters) => void;
  clearError: () => void;
  
  // Analytics
  fetchAnalytics: (period: AnalyticsPeriod) => Promise<void>;
}

// API Response Types
export interface GiftCardListResponse extends PaginatedResponse<GiftCard> {
  programs: GiftCardProgram[];
  designs: GiftCardDesign[];
  analytics?: GiftCardSystemAnalytics;
}

export interface GiftCardDetailsResponse {
  giftCard: GiftCard;
  balance: GiftCardBalance;
  transactions: GiftCardTransaction[];
  analytics?: GiftCardAnalytics;
}

// ===== MISSING TYPES =====
export interface BalanceVerification {
  id: ID;
  verified: boolean;
  verificationMethod: string;
  timestamp: Timestamp;
}

export interface ChannelPerformance {
  channel: string;
  sales: number;
  revenue: number;
  conversionRate: number;
}

export interface DesignPerformance {
  designId: ID;
  name: string;
  usage: number;
  popularity: number;
}

export interface SalesTrend {
  period: string;
  sales: number;
  revenue: number;
  growth: number;
}

export interface UsageTrend {
  period: string;
  usage: number;
  activeCards: number;
}

export interface SeasonalPattern {
  season: string;
  salesIndex: number;
  popularCategories: string[];
}

export interface PeriodComparison {
  current: number;
  previous: number;
  growth: number;
}

export interface BenchmarkComparison {
  current: number;
  benchmark: number;
  performance: number;
}

export interface EligibilityRule {
  id: ID;
  name: string;
  condition: string;
  value: unknown;
}

export interface DiscountType {
  type: string;
  value: number;
  maxDiscount?: number;
}

export interface TargetAudience {
  segment: string;
  criteria: Record<string, unknown>;
}

export interface CampaignObjective {
  type: string;
  target: number;
  metric: string;
}

export interface TeamMember {
  id: ID;
  name: string;
  role: string;
  permissions: string[];
}

export interface TargetSegment {
  id: ID;
  name: string;
  criteria: Record<string, unknown>;
  size: number;
}

export interface MarketingChannel {
  id: ID;
  name: string;
  type: string;
  config: Record<string, unknown>;
}

export interface MarketingTactic {
  id: ID;
  name: string;
  description: string;
  channels: ID[];
}

export interface CampaignContent {
  id: ID;
  type: string;
  title: string;
  content: string;
  assets: ImageAsset[];
}

export interface CampaignKPI {
  id: ID;
  name: string;
  target: number;
  actual?: number;
  unit: string;
}

export interface CampaignGoal {
  id: ID;
  description: string;
  target: number;
  achieved?: number;
}

export interface CampaignPerformance {
  clicks: number;
  impressions: number;
  conversions: number;
  revenue: number;
  ctr: number;
  roas: number;
}

export interface AttributionModel {
  type: string;
  config: Record<string, unknown>;
}

export interface CampaignStatus {
  status: string;
  startDate: Timestamp;
  endDate?: Timestamp;
}

export interface ApprovalStatus {
  status: string;
  approvedBy?: ID;
  approvedAt?: Timestamp;
  comments?: string;
}

export interface ApprovalWorkflow {
  step: number;
  approver: ID;
  required: boolean;
  completed: boolean;
}

export interface ValidationCheck {
  type: string;
  passed: boolean;
  message?: string;
}

export interface RedemptionChannel {
  type: string;
  name: string;
  available: boolean;
}

export interface StoreLocation {
  id: ID;
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number };
}

export interface OnlineSession {
  sessionId: string;
  userAgent: string;
  ipAddress: string;
  timestamp: Timestamp;
}

export interface RedemptionMetadata {
  source: string;
  campaign?: ID;
  referrer?: string;
  userAgent?: string;
}

export interface RestrictionViolation {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SecurityCheck {
  type: string;
  passed: boolean;
  score?: number;
  details?: string;
}

export interface TransactionFilters {
  dateRange?: { start: Timestamp; end: Timestamp };
  status?: string[];
  type?: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface ReportType {
  name: string;
  format: string;
  template: string;
}

export interface ReportFilters {
  period: string;
  includeDetails: boolean;
  groupBy?: string;
}

export interface Report {
  id: ID;
  type: string;
  data: unknown;
  generatedAt: Timestamp;
  format: string;
}

// ===== TYPE USAGE TO AVOID WARNINGS =====
export interface GiftCardTypeUsage {
  price: Price;
  product: Product;
}
