import { BaseEntity, ID, Timestamp, PaginatedResponse, APIResponse, APIError } from './common.types';

// Legal Policies Types - Comprehensive legal policies and compliance management system for e-commerce platform

// ===== CORE TYPES =====
export type PolicyType = 'privacy_policy' | 'terms_of_service' | 'cookie_policy' | 'refund_policy' | 'shipping_policy' | 'user_agreement' | 'data_protection' | 'compliance_policy' | 'accessibility_statement' | 'community_guidelines' | 'content_policy' | 'acceptable_use' | 'security_policy' | 'disclaimer' | 'copyright' | 'trademark' | 'custom';
export type PolicyStatus = 'draft' | 'review' | 'approved' | 'published' | 'deprecated' | 'archived';
export type ConsentType = 'essential' | 'analytics' | 'marketing' | 'personalization' | 'advertising' | 'social_media' | 'third_party' | 'custom';
export type ConsentStatus = 'pending' | 'granted' | 'denied' | 'withdrawn' | 'expired';
export type ComplianceFramework = 'gdpr' | 'ccpa' | 'lgpd' | 'pipeda' | 'coppa' | 'hipaa' | 'sox' | 'pci_dss' | 'iso_27001' | 'custom';
export type LegalJurisdiction = 'eu' | 'us' | 'ca' | 'uk' | 'au' | 'br' | 'in' | 'jp' | 'global' | 'custom';
export type NotificationType = 'email' | 'sms' | 'push' | 'in_app' | 'postal' | 'website_banner' | 'popup' | 'modal';
export type AuditAction = 'create' | 'update' | 'delete' | 'publish' | 'approve' | 'reject' | 'access' | 'download' | 'consent_change' | 'notification_sent';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type DataCategory = 'personal' | 'sensitive' | 'biometric' | 'financial' | 'health' | 'behavioral' | 'demographic' | 'technical' | 'preference';
export type ProcessingPurpose = 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
export type RetentionPeriod = '30_days' | '90_days' | '1_year' | '2_years' | '5_years' | '7_years' | '10_years' | 'indefinite' | 'custom';

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

export interface LocalizedContent {
  [locale: string]: string;
}

export interface ContactInfo {
  name: string;
  title?: string;
  email: string;
  phone?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface LegalEntity {
  name: string;
  registrationNumber?: string;
  taxId?: string;
  address: Address;
  contactInfo: ContactInfo;
  website?: string;
}

export interface ComplianceDate {
  effective: Timestamp;
  lastUpdated: Timestamp;
  nextReview: Timestamp;
  expires?: Timestamp;
}

// ===== MAIN LEGAL POLICY ENTITY =====
export interface LegalPolicy extends Omit<BaseEntity, 'version'> {
  id: ID;
  title: string;
  type: PolicyType;
  status: PolicyStatus;
  version: string;
  
  // Content
  content: PolicyContent;
  summary: string;
  keyChanges?: string[];
  
  // Legal Information
  legalEntity: LegalEntity;
  jurisdiction: LegalJurisdiction[];
  applicableRegions: string[];
  complianceFrameworks: ComplianceFramework[];
  
  // Dates & Versioning
  dates: ComplianceDate;
  versionHistory: PolicyVersion[];
  previousVersion?: ID;
  nextVersion?: ID;
  
  // Approval Workflow
  approvalWorkflow: ApprovalWorkflow;
  reviewers: PolicyReviewer[];
  approvals: PolicyApproval[];
  
  // User Communication
  notification: NotificationConfig;
  acknowledgmentRequired: boolean;
  userNotifications: UserNotification[];
  
  // Consent Management
  consentRequirements: ConsentRequirement[];
  dataProcessing: DataProcessingInfo[];
  
  // Compliance & Risk
  riskAssessment: RiskAssessment;
  complianceChecks: ComplianceCheck[];
  auditTrail: PolicyAuditEntry[];
  
  // Display & Presentation
  displayConfig: PolicyDisplayConfig;
  accessibility: AccessibilityConfig;
  translations: PolicyTranslation[];
  
  // Analytics & Tracking
  analytics: PolicyAnalytics;
  readTracking: ReadTrackingConfig;
  
  // Integration
  integrations: PolicyIntegration[];
  dependencies: PolicyDependency[];
  
  // Custom Fields
  tags: string[];
  categories: string[];
  customFields: Record<string, unknown>;
  metadata: Record<string, unknown>;
  
  // User Management
  createdBy: ID;
  updatedBy: ID;
  reviewedBy?: ID;
  approvedBy?: ID;
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  effectiveAt?: Timestamp;
  reviewedAt?: Timestamp;
  approvedAt?: Timestamp;
}

// ===== POLICY CONTENT =====
export interface PolicyContent {
  body: string;
  sections: PolicySection[];
  appendices: PolicyAppendix[];
  definitions: PolicyDefinition[];
  references: LegalReference[];
  
  // Formatting
  format: 'html' | 'markdown' | 'plain_text' | 'structured';
  toc: TableOfContents;
  footnotes: Footnote[];
  
  // Personalization
  dynamicContent: DynamicContentRule[];
  templates: ContentTemplate[];
}

export interface PolicySection {
  id: ID;
  title: string;
  content: string;
  order: number;
  type: 'introduction' | 'definition' | 'rights' | 'obligations' | 'procedures' | 'contact' | 'changes' | 'effective_date' | 'custom';
  isRequired: boolean;
  subsections?: PolicySubsection[];
  
  // Conditional Display
  displayConditions?: DisplayCondition[];
  userTypeRestrictions?: string[];
  jurisdictionRestrictions?: LegalJurisdiction[];
  
  // Metadata
  lastModified: Timestamp;
  modifiedBy: ID;
  reviewStatus: 'pending' | 'approved' | 'rejected';
}

export interface PolicySubsection {
  id: ID;
  title: string;
  content: string;
  order: number;
  parentSectionId: ID;
}

export interface PolicyAppendix {
  id: ID;
  title: string;
  content: string;
  type: 'form' | 'template' | 'schedule' | 'exhibit' | 'reference' | 'custom';
  isDownloadable: boolean;
  fileUrl?: string;
}

export interface PolicyDefinition {
  term: string;
  definition: string;
  aliases?: string[];
  category?: string;
  isHighlighted: boolean;
  references?: string[];
}

export interface LegalReference {
  type: 'statute' | 'regulation' | 'case_law' | 'guideline' | 'standard' | 'treaty';
  title: string;
  citation: string;
  url?: string;
  jurisdiction: LegalJurisdiction;
  effectiveDate?: Timestamp;
}

export interface TableOfContents {
  enabled: boolean;
  depth: number;
  style: 'numbered' | 'bulleted' | 'plain';
  position: 'top' | 'sidebar' | 'floating';
  items: TOCItem[];
}

export interface TOCItem {
  title: string;
  anchor: string;
  level: number;
  children?: TOCItem[];
}

export interface Footnote {
  id: string;
  content: string;
  position: number;
  references: string[];
}

export interface DynamicContentRule {
  id: ID;
  condition: ContentCondition;
  content: string;
  replacement?: string;
  isActive: boolean;
}

export interface ContentCondition {
  type: 'user_location' | 'user_type' | 'date_range' | 'compliance_framework' | 'custom';
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: unknown;
}

export interface ContentTemplate {
  id: ID;
  name: string;
  content: string;
  variables: TemplateVariable[];
  isDefault: boolean;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array';
  required: boolean;
  defaultValue?: unknown;
  description?: string;
}

export interface DisplayCondition {
  type: 'user_attribute' | 'geographic' | 'temporal' | 'consent_status' | 'custom';
  condition: string;
  value: unknown;
}

// ===== VERSIONING & APPROVAL =====
export interface PolicyVersion {
  id: ID;
  version: string;
  title: string;
  summary: string;
  changes: VersionChange[];
  status: PolicyStatus;
  
  // Dates
  createdAt: Timestamp;
  publishedAt?: Timestamp;
  effectiveAt?: Timestamp;
  deprecatedAt?: Timestamp;
  
  // Approval
  approvedBy?: ID;
  approvedAt?: Timestamp;
  
  // Content
  contentSnapshot: PolicyContent;
  
  // Migration
  migrationNotes?: string;
  compatibilityNotes?: string;
  
  // Analytics
  adoptionRate?: number;
  userNotificationsSent?: number;
  acknowledgmentRate?: number;
}

export interface VersionChange {
  type: 'addition' | 'modification' | 'deletion' | 'restructure';
  section: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  userNotificationRequired: boolean;
  reasonCode?: string;
}

export interface ApprovalWorkflow {
  enabled: boolean;
  steps: ApprovalStep[];
  currentStep?: number;
  isComplete: boolean;
  
  // Configuration
  requireAllApprovers: boolean;
  allowParallelApproval: boolean;
  escalationRules: EscalationRule[];
  
  // Timeline
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  deadline?: Timestamp;
}

export interface ApprovalStep {
  id: ID;
  name: string;
  order: number;
  requiredRole: string;
  approvers: ID[];
  
  // Status
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'skipped';
  isParallel: boolean;
  isOptional: boolean;
  
  // Timing
  estimatedDuration?: number;
  actualDuration?: number;
  deadline?: Timestamp;
  
  // Escalation
  escalationDelay?: number;
  escalationTo?: ID[];
}

export interface EscalationRule {
  triggerCondition: 'timeout' | 'rejection' | 'no_response' | 'custom';
  delay: number;
  escalateTo: ID[];
  notificationTemplate: string;
  isActive: boolean;
}

export interface PolicyReviewer {
  userId: ID;
  role: string;
  department: string;
  expertise: string[];
  isRequired: boolean;
  reviewStatus: 'assigned' | 'in_progress' | 'completed' | 'declined';
  assignedAt: Timestamp;
  completedAt?: Timestamp;
}

export interface PolicyApproval {
  id: ID;
  approverId: ID;
  stepId: ID;
  status: 'approved' | 'rejected' | 'conditional';
  
  // Feedback
  comments?: string;
  conditions?: ApprovalCondition[];
  attachments?: string[];
  
  // Timeline
  reviewStarted: Timestamp;
  reviewCompleted: Timestamp;
  
  // Digital Signature
  signature?: DigitalSignature;
}

export interface ApprovalCondition {
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Timestamp;
  assignedTo?: ID;
  status: 'open' | 'resolved' | 'waived';
}

export interface DigitalSignature {
  method: 'electronic' | 'digital_certificate' | 'biometric' | 'multi_factor';
  signatureData: string;
  timestamp: Timestamp;
  ipAddress: string;
  userAgent: string;
  certificateInfo?: CertificateInfo;
}

export interface CertificateInfo {
  issuer: string;
  serialNumber: string;
  validFrom: Timestamp;
  validTo: Timestamp;
  fingerprint: string;
}

// ===== CONSENT MANAGEMENT =====
export interface ConsentRequirement {
  id: ID;
  type: ConsentType;
  purpose: string;
  description: LocalizedContent;
  
  // Legal Basis
  legalBasis: ProcessingPurpose;
  complianceFramework: ComplianceFramework[];
  isRequired: boolean;
  
  // Data Processing
  dataCategories: DataCategory[];
  processingActivities: ProcessingActivity[];
  retentionPeriod: RetentionPeriod;
  customRetentionDays?: number;
  
  // Third Parties
  thirdPartySharing: ThirdPartySharing[];
  dataTransfers: DataTransfer[];
  
  // User Control
  canWithdraw: boolean;
  withdrawalMethod: string[];
  granularControl: boolean;
  
  // Configuration
  displayOrder: number;
  isActive: boolean;
  effectiveDate: Timestamp;
  expiryDate?: Timestamp;
}

export interface ProcessingActivity {
  activity: string;
  purpose: string;
  legalBasis: ProcessingPurpose;
  dataCategories: DataCategory[];
  isAutomated: boolean;
  hasProfilingImpact: boolean;
}

export interface ThirdPartySharing {
  partner: string;
  purpose: string;
  dataCategories: DataCategory[];
  legalBasis: ProcessingPurpose;
  country?: string;
  safeguards?: string[];
  userControl: boolean;
}

export interface DataTransfer {
  destination: string;
  mechanism: 'adequacy_decision' | 'standard_contractual_clauses' | 'binding_corporate_rules' | 'certification' | 'codes_of_conduct' | 'derogation';
  safeguards: string[];
  dataCategories: DataCategory[];
}

export interface DataProcessingInfo {
  purpose: string;
  legalBasis: ProcessingPurpose;
  dataCategories: DataCategory[];
  sources: DataSource[];
  recipients: DataRecipient[];
  retention: RetentionPolicy;
  security: SecurityMeasures;
  userRights: UserRight[];
}

export interface DataSource {
  type: 'direct_collection' | 'third_party' | 'public_sources' | 'derived' | 'inferred';
  description: string;
  categories: DataCategory[];
}

export interface DataRecipient {
  type: 'internal' | 'service_provider' | 'partner' | 'authority' | 'public';
  name: string;
  purpose: string;
  dataCategories: DataCategory[];
  country?: string;
}

export interface RetentionPolicy {
  period: RetentionPeriod;
  customDays?: number;
  criteria: string;
  disposalMethod: 'deletion' | 'anonymization' | 'archival';
  exceptions?: RetentionException[];
}

export interface RetentionException {
  condition: string;
  extendedPeriod: RetentionPeriod;
  justification: string;
}

export interface SecurityMeasures {
  technical: string[];
  organizational: string[];
  encryption: EncryptionInfo;
  access_control: AccessControlInfo;
  monitoring: MonitoringInfo;
}

export interface EncryptionInfo {
  inTransit: boolean;
  atRest: boolean;
  keyManagement: string;
  algorithms: string[];
}

export interface AccessControlInfo {
  authentication: string[];
  authorization: string;
  privilegedAccess: string;
  monitoring: boolean;
}

export interface MonitoringInfo {
  logging: boolean;
  alerting: boolean;
  incidentResponse: boolean;
  auditFrequency: string;
}

export interface UserRight {
  right: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection' | 'automated_decision_making';
  description: string;
  process: string;
  timeline: string;
  limitations?: string[];
}

// ===== NOTIFICATION & COMMUNICATION =====
export interface NotificationConfig {
  enabled: boolean;
  triggers: NotificationTrigger[];
  channels: NotificationChannel[];
  templates: NotificationTemplate[];
  
  // Timing
  scheduledNotifications: ScheduledNotification[];
  reminderSettings: ReminderSettings;
  
  // Targeting
  audience: NotificationAudience;
  personalization: PersonalizationConfig;
  
  // Compliance
  optOutMechanism: OptOutConfig;
  trackingSettings: NotificationTrackingConfig;
}

export interface NotificationTrigger {
  event: 'policy_created' | 'policy_updated' | 'policy_published' | 'consent_required' | 'consent_expired' | 'compliance_deadline' | 'custom';
  condition?: TriggerCondition;
  delay?: number;
  isActive: boolean;
}

export interface TriggerCondition {
  type: 'user_segment' | 'geographic' | 'temporal' | 'behavioral' | 'custom';
  criteria: Record<string, unknown>;
}

export interface NotificationChannel {
  type: NotificationType;
  isEnabled: boolean;
  priority: number;
  configuration: ChannelConfiguration;
  fallbackChannel?: NotificationType;
}

export interface ChannelConfiguration {
  templateId?: string;
  sender?: string;
  subject?: string;
  customSettings?: Record<string, unknown>;
}

export interface NotificationTemplate {
  id: ID;
  name: string;
  channel: NotificationType;
  subject?: string;
  content: LocalizedContent;
  variables: TemplateVariable[];
  
  // Design
  styling?: NotificationStyling;
  branding?: BrandingConfig;
  
  // Testing
  isDefault: boolean;
  isActive: boolean;
  testData?: Record<string, unknown>;
  
  // Performance
  deliveryRate?: number;
  openRate?: number;
  clickRate?: number;
}

export interface NotificationStyling {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  layout: string;
  customCSS?: string;
}

export interface BrandingConfig {
  logo?: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  footerText?: string;
  socialLinks?: SocialLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface ScheduledNotification {
  id: ID;
  type: 'immediate' | 'delayed' | 'recurring';
  scheduleTime?: Timestamp;
  recurrence?: RecurrencePattern;
  audience: NotificationAudience;
  templateId: ID;
  isActive: boolean;
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number;
  endDate?: Timestamp;
  occurrences?: number;
}

export interface ReminderSettings {
  enabled: boolean;
  intervals: number[];
  maxReminders: number;
  escalation: ReminderEscalation;
}

export interface ReminderEscalation {
  enabled: boolean;
  threshold: number;
  escalateTo: ID[];
  escalationTemplate: string;
}

export interface NotificationAudience {
  userSegments: string[];
  geographicFilters: GeographicFilter[];
  behavioralFilters: BehavioralFilter[];
  consentFilters: ConsentFilter[];
  exclusions: AudienceExclusion[];
}

export interface GeographicFilter {
  type: 'country' | 'region' | 'state' | 'city' | 'postal_code';
  values: string[];
  include: boolean;
}

export interface BehavioralFilter {
  type: 'last_login' | 'purchase_history' | 'engagement_level' | 'custom';
  criteria: Record<string, unknown>;
}

export interface ConsentFilter {
  consentType: ConsentType;
  status: ConsentStatus[];
  dateRange?: DateRange;
}

export interface DateRange {
  start: Timestamp;
  end: Timestamp;
}

export interface AudienceExclusion {
  type: 'user_id' | 'email' | 'segment' | 'custom';
  values: string[];
  reason: string;
}

export interface PersonalizationConfig {
  enabled: boolean;
  dataPoints: PersonalizationDataPoint[];
  fallbackContent: string;
  testingEnabled: boolean;
}

export interface PersonalizationDataPoint {
  field: string;
  source: 'user_profile' | 'behavior' | 'preferences' | 'custom';
  defaultValue?: string;
  transformation?: string;
}

export interface OptOutConfig {
  enabled: boolean;
  methods: string[];
  confirmationRequired: boolean;
  retentionPeriod: number;
  reSubscriptionAllowed: boolean;
}

export interface NotificationTrackingConfig {
  trackDelivery: boolean;
  trackOpens: boolean;
  trackClicks: boolean;
  trackUnsubscribes: boolean;
  retentionPeriod: number;
}

export interface UserNotification {
  id: ID;
  userId: ID;
  policyId: ID;
  type: NotificationType;
  content: string;
  
  // Status
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'bounced';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Interaction
  isRead: boolean;
  readAt?: Timestamp;
  acknowledgedAt?: Timestamp;
  clickedAt?: Timestamp;
  
  // Delivery
  sentAt?: Timestamp;
  deliveredAt?: Timestamp;
  attempts: number;
  maxAttempts: number;
  
  // Error Handling
  errorMessage?: string;
  retryAt?: Timestamp;
  
  // Metadata
  metadata: Record<string, unknown>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== COMPLIANCE & RISK =====
export interface RiskAssessment {
  id: ID;
  policyId: ID;
  overallRisk: RiskLevel;
  assessmentDate: Timestamp;
  assessedBy: ID;
  
  // Risk Categories
  privacyRisk: RiskEvaluation;
  securityRisk: RiskEvaluation;
  complianceRisk: RiskEvaluation;
  operationalRisk: RiskEvaluation;
  reputationalRisk: RiskEvaluation;
  
  // Mitigation
  mitigationStrategies: MitigationStrategy[];
  residualRisk: RiskLevel;
  
  // Review
  nextAssessment: Timestamp;
  reviewNotes: string;
  
  // Documentation
  attachments: string[];
  references: string[];
}

export interface RiskEvaluation {
  level: RiskLevel;
  score: number;
  factors: RiskFactor[];
  rationale: string;
  mitigations: string[];
}

export interface RiskFactor {
  factor: string;
  impact: RiskLevel;
  likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  description: string;
  evidence?: string[];
}

export interface MitigationStrategy {
  strategy: string;
  implementation: string;
  timeline: string;
  responsibleParty: ID;
  effectivenessRating: number;
  status: 'planned' | 'in_progress' | 'implemented' | 'verified';
}

export interface ComplianceCheck {
  id: ID;
  framework: ComplianceFramework;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable' | 'pending_review';
  
  // Evidence
  evidence: ComplianceEvidence[];
  gaps: ComplianceGap[];
  
  // Assessment
  assessedBy: ID;
  assessedAt: Timestamp;
  nextReview: Timestamp;
  
  // Documentation
  notes: string;
  remediation?: RemediationPlan;
}

export interface ComplianceEvidence {
  type: 'document' | 'process' | 'control' | 'audit' | 'certification';
  description: string;
  reference: string;
  verifiedAt: Timestamp;
  verifiedBy: ID;
}

export interface ComplianceGap {
  description: string;
  severity: RiskLevel;
  impact: string;
  recommendation: string;
  priority: number;
}

export interface RemediationPlan {
  actions: RemediationAction[];
  timeline: string;
  responsibleParty: ID;
  budget?: number;
  success_criteria: string[];
}

export interface RemediationAction {
  action: string;
  description: string;
  dueDate: Timestamp;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  assignedTo: ID;
  dependencies?: string[];
}

// ===== AUDIT & TRACKING =====
export interface PolicyAuditEntry {
  id: ID;
  policyId: ID;
  action: AuditAction;
  performedBy: ID;
  performedAt: Timestamp;
  
  // Context
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  
  // Details
  description: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  affectedFields?: string[];
  
  // Risk & Compliance
  riskLevel: RiskLevel;
  complianceImplications?: string[];
  
  // Additional Data
  metadata: Record<string, unknown>;
  correlationId?: string;
}

export interface ReadTrackingConfig {
  enabled: boolean;
  trackAnonymous: boolean;
  granularTracking: boolean;
  retentionPeriod: number;
  
  // Metrics
  trackScrollDepth: boolean;
  trackTimeSpent: boolean;
  trackSectionViews: boolean;
  trackDownloads: boolean;
  
  // Privacy
  anonymizationDelay: number;
  optOutRespected: boolean;
}

// ===== ANALYTICS & REPORTING =====
export interface PolicyAnalytics {
  id: ID;
  policyId: ID;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Timestamp;
  endDate: Timestamp;
  
  // Engagement Metrics
  totalViews: number;
  uniqueViews: number;
  averageTimeSpent: number;
  averageScrollDepth: number;
  sectionViewBreakdown: SectionViewMetric[];
  
  // User Behavior
  userSegmentBreakdown: UserSegmentMetric[];
  deviceBreakdown: DeviceMetric[];
  geographicBreakdown: GeographicMetric[];
  
  // Acknowledgment & Consent
  acknowledgmentRate: number;
  consentRates: ConsentMetric[];
  withdrawalRates: ConsentWithdrawalMetric[];
  
  // Notification Performance
  notificationMetrics: NotificationMetric[];
  
  // Compliance Metrics
  complianceScore: number;
  auditTrailMetrics: AuditMetric[];
  
  // Computed Fields
  computedAt: Timestamp;
  dataFreshness: number;
}

export interface SectionViewMetric {
  sectionId: ID;
  sectionTitle: string;
  views: number;
  uniqueViews: number;
  averageTimeSpent: number;
  exitRate: number;
}

export interface UserSegmentMetric {
  segment: string;
  userCount: number;
  viewRate: number;
  acknowledgmentRate: number;
  averageTimeSpent: number;
}

export interface DeviceMetric {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  userCount: number;
  viewRate: number;
  engagementRate: number;
}

export interface GeographicMetric {
  country: string;
  region?: string;
  userCount: number;
  viewRate: number;
  complianceRate: number;
}

export interface ConsentMetric {
  consentType: ConsentType;
  grantedCount: number;
  deniedCount: number;
  grantRate: number;
  conversionRate: number;
}

export interface ConsentWithdrawalMetric {
  consentType: ConsentType;
  withdrawalCount: number;
  withdrawalRate: number;
  reasonBreakdown: Record<string, number>;
}

export interface NotificationMetric {
  channel: NotificationType;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

export interface AuditMetric {
  action: AuditAction;
  count: number;
  frequency: number;
  averageResponseTime?: number;
}

// ===== DISPLAY & PRESENTATION =====
export interface PolicyDisplayConfig {
  layout: 'single_page' | 'multi_page' | 'tabbed' | 'accordion' | 'modal' | 'sidebar';
  theme: DisplayTheme;
  navigation: NavigationConfig;
  
  // Formatting
  typography: TypographyConfig;
  styling: StylingConfig;
  responsive: ResponsiveConfig;
  
  // Interaction
  printable: boolean;
  downloadable: boolean;
  shareable: boolean;
  bookmarkable: boolean;
  
  // User Experience
  progressIndicator: boolean;
  estimatedReadTime: boolean;
  sectionSummaries: boolean;
  highlightChanges: boolean;
}

export interface DisplayTheme {
  name: string;
  colors: ColorScheme;
  fonts: FontConfig;
  spacing: SpacingConfig;
  borders: BorderConfig;
  effects: EffectConfig;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  warning: string;
  error: string;
  success: string;
}

export interface FontConfig {
  primary: FontDefinition;
  secondary: FontDefinition;
  monospace: FontDefinition;
}

export interface FontDefinition {
  family: string;
  weights: number[];
  sizes: Record<string, string>;
  lineHeights: Record<string, number>;
}

export interface SpacingConfig {
  unit: number;
  scale: number[];
  sections: number;
  paragraphs: number;
}

export interface BorderConfig {
  radius: Record<string, number>;
  width: Record<string, number>;
  style: string;
}

export interface EffectConfig {
  shadows: Record<string, string>;
  transitions: Record<string, string>;
  animations: Record<string, string>;
}

export interface NavigationConfig {
  enabled: boolean;
  position: 'top' | 'left' | 'right' | 'bottom' | 'floating';
  style: 'tabs' | 'breadcrumbs' | 'sidebar' | 'dropdown';
  
  // Features
  search: boolean;
  jumpToSection: boolean;
  previousNext: boolean;
  progress: boolean;
  
  // Customization
  customItems: NavigationItem[];
}

export interface NavigationItem {
  label: string;
  url: string;
  icon?: string;
  order: number;
  isExternal: boolean;
}

export interface TypographyConfig {
  headings: HeadingConfig[];
  body: BodyTextConfig;
  links: LinkConfig;
  lists: ListConfig;
  code: CodeConfig;
}

export interface HeadingConfig {
  level: number;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  marginTop: string;
  marginBottom: string;
  color?: string;
}

export interface BodyTextConfig {
  fontSize: string;
  lineHeight: number;
  paragraphSpacing: string;
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
}

export interface LinkConfig {
  color: string;
  hoverColor: string;
  underline: boolean;
  decoration: string;
  openInNewTab: boolean;
}

export interface ListConfig {
  bulletStyle: string;
  numberStyle: string;
  indentation: string;
  spacing: string;
}

export interface CodeConfig {
  fontFamily: string;
  fontSize: string;
  backgroundColor: string;
  color: string;
  border: string;
  borderRadius: string;
  padding: string;
}

export interface StylingConfig {
  customCSS?: string;
  customJavaScript?: string;
  externalStylesheets?: string[];
  externalScripts?: string[];
}

export interface ResponsiveConfig {
  enabled: boolean;
  breakpoints: BreakpointConfig[];
  mobileOptimizations: MobileOptimization[];
}

export interface BreakpointConfig {
  name: string;
  minWidth: number;
  overrides: Record<string, unknown>;
}

export interface MobileOptimization {
  feature: string;
  enabled: boolean;
  configuration: Record<string, unknown>;
}

export interface AccessibilityConfig {
  wcagLevel: 'A' | 'AA' | 'AAA';
  features: AccessibilityFeature[];
  testing: AccessibilityTesting;
  
  // Screen Reader Support
  landmarks: boolean;
  headingStructure: boolean;
  altText: boolean;
  descriptions: boolean;
  
  // Keyboard Navigation
  focusManagement: boolean;
  skipLinks: boolean;
  tabOrder: boolean;
  
  // Visual
  highContrast: boolean;
  textScaling: boolean;
  colorBlindness: boolean;
  
  // Motor
  clickTargets: boolean;
  timeouts: boolean;
  animations: boolean;
}

export interface AccessibilityFeature {
  name: string;
  enabled: boolean;
  configuration: Record<string, unknown>;
  wcagCriterion: string;
}

export interface AccessibilityTesting {
  automated: boolean;
  manual: boolean;
  tools: string[];
  lastAudit?: Timestamp;
  issues: AccessibilityIssue[];
}

export interface AccessibilityIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  element?: string;
  guideline: string;
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'wont_fix';
}

// ===== LOCALIZATION =====
export interface PolicyTranslation {
  locale: string;
  isComplete: boolean;
  lastUpdated: Timestamp;
  translatedBy?: ID;
  reviewedBy?: ID;
  
  // Content
  title: string;
  summary: string;
  content: TranslatedContent;
  
  // Legal Adaptation
  legalAdaptations: LegalAdaptation[];
  localRegulations: LocalRegulation[];
  
  // Quality Assurance
  qualityScore?: number;
  reviewStatus: 'pending' | 'approved' | 'needs_revision';
  reviewNotes?: string;
}

export interface TranslatedContent {
  sections: TranslatedSection[];
  definitions: TranslatedDefinition[];
  appendices: TranslatedAppendix[];
  metadata: Record<string, string>;
}

export interface TranslatedSection {
  sectionId: ID;
  title: string;
  content: string;
  subsections?: TranslatedSubsection[];
}

export interface TranslatedSubsection {
  subsectionId: ID;
  title: string;
  content: string;
}

export interface TranslatedDefinition {
  term: string;
  definition: string;
  aliases?: string[];
}

export interface TranslatedAppendix {
  appendixId: ID;
  title: string;
  content: string;
}

export interface LegalAdaptation {
  section: string;
  adaptationType: 'content_change' | 'addition' | 'removal' | 'restructure';
  reason: string;
  localLaw?: string;
  adaptation: string;
}

export interface LocalRegulation {
  framework: string;
  regulation: string;
  impact: string;
  compliance_notes: string;
  references: string[];
}

// ===== INTEGRATION & DEPENDENCIES =====
export interface PolicyIntegration {
  type: 'consent_management' | 'user_preference' | 'notification' | 'analytics' | 'audit' | 'custom';
  provider: string;
  configuration: IntegrationConfig;
  status: 'active' | 'inactive' | 'error' | 'pending';
  
  // Data Flow
  dataMapping: DataMapping[];
  syncFrequency: string;
  lastSync?: Timestamp;
  
  // Error Handling
  errorCount: number;
  lastError?: IntegrationError;
  retryPolicy: RetryPolicy;
  
  // Security
  authentication: AuthenticationConfig;
  encryption: boolean;
  
  // Monitoring
  healthCheck: HealthCheckConfig;
  alerting: AlertingConfig;
}

export interface IntegrationConfig {
  endpoint?: string;
  apiKey?: string;
  settings: Record<string, unknown>;
  timeout: number;
  retries: number;
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  validation?: string;
  required: boolean;
}

export interface IntegrationError {
  timestamp: Timestamp;
  message: string;
  code: string;
  details: Record<string, unknown>;
  resolved: boolean;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number;
  maxDelay: number;
  jitter: boolean;
}

export interface AuthenticationConfig {
  type: 'api_key' | 'oauth' | 'jwt' | 'basic_auth' | 'custom';
  credentials: Record<string, string>;
  refreshable: boolean;
  expiresAt?: Timestamp;
}

export interface HealthCheckConfig {
  enabled: boolean;
  endpoint: string;
  interval: number;
  timeout: number;
  expectedResponse: unknown;
}

export interface AlertingConfig {
  enabled: boolean;
  channels: string[];
  thresholds: AlertThreshold[];
  escalation: AlertEscalation;
}

export interface AlertThreshold {
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  value: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface AlertEscalation {
  enabled: boolean;
  delay: number;
  escalateTo: string[];
  maxEscalations: number;
}

export interface PolicyDependency {
  dependentPolicyId: ID;
  dependencyType: 'requires' | 'conflicts_with' | 'related_to' | 'supersedes';
  description: string;
  isRequired: boolean;
  
  // Validation
  validationRules: DependencyValidation[];
  lastValidated?: Timestamp;
  isValid: boolean;
  
  // Impact
  impactLevel: 'low' | 'medium' | 'high';
  impactDescription: string;
}

export interface DependencyValidation {
  rule: string;
  description: string;
  isActive: boolean;
  lastChecked?: Timestamp;
  isValid: boolean;
  errorMessage?: string;
}

// ===== REQUEST/RESPONSE INTERFACES =====
export interface CreateLegalPolicyRequest {
  title: string;
  type: PolicyType;
  content: Partial<PolicyContent>;
  legalEntity: LegalEntity;
  jurisdiction: LegalJurisdiction[];
  complianceFrameworks?: ComplianceFramework[];
  status?: PolicyStatus;
  effectiveDate?: Timestamp;
  tags?: string[];
  categories?: string[];
  customFields?: Record<string, unknown>;
}

export interface UpdateLegalPolicyRequest {
  title?: string;
  content?: Partial<PolicyContent>;
  status?: PolicyStatus;
  jurisdiction?: LegalJurisdiction[];
  complianceFrameworks?: ComplianceFramework[];
  effectiveDate?: Timestamp;
  tags?: string[];
  categories?: string[];
  customFields?: Record<string, unknown>;
}

export interface LegalPolicyQueryParams extends PaginationParams, SortParams, FilterParams {
  type?: PolicyType[];
  status?: PolicyStatus[];
  jurisdiction?: LegalJurisdiction[];
  complianceFramework?: ComplianceFramework[];
  tags?: string[];
  categories?: string[];
  createdBy?: ID;
  effectiveDateRange?: DateRange;
  reviewDue?: boolean;
  hasTranslations?: boolean;
}

export interface ConsentRecordRequest {
  userId: ID;
  consentType: ConsentType;
  status: ConsentStatus;
  purpose?: string;
  source: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}

export interface ConsentWithdrawalRequest {
  userId: ID;
  consentType: ConsentType;
  reason?: string;
  source: string;
  ipAddress: string;
  userAgent: string;
}

export interface PolicyApprovalRequest {
  policyId: ID;
  stepId: ID;
  status: 'approved' | 'rejected' | 'conditional';
  comments?: string;
  conditions?: ApprovalCondition[];
}

export interface NotificationSendRequest {
  policyId: ID;
  templateId: ID;
  audience: NotificationAudience;
  scheduleTime?: Timestamp;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  customData?: Record<string, unknown>;
}

export type LegalPolicyResponse = APIResponse<LegalPolicy>;
export type LegalPolicyListResponse = APIResponse<PaginatedResponse<LegalPolicy>>;
export type ConsentResponse = APIResponse<{ success: boolean; consentId: ID }>;
export type PolicyAnalyticsResponse = APIResponse<PolicyAnalytics>;

// ===== HOOKS & STATE MANAGEMENT =====
export interface UseLegalPolicyHook {
  policy: LegalPolicy | null;
  isLoading: boolean;
  error: APIError | null;
  
  // Actions
  fetchPolicy: (id: ID) => Promise<void>;
  createPolicy: (data: CreateLegalPolicyRequest) => Promise<void>;
  updatePolicy: (id: ID, data: UpdateLegalPolicyRequest) => Promise<void>;
  deletePolicy: (id: ID) => Promise<void>;
  
  // Version Management
  createVersion: (id: ID, changes: VersionChange[]) => Promise<void>;
  publishVersion: (id: ID, version: string) => Promise<void>;
  rollbackVersion: (id: ID, version: string) => Promise<void>;
  
  // Approval Workflow
  submitForApproval: (id: ID) => Promise<void>;
  approvePolicy: (request: PolicyApprovalRequest) => Promise<void>;
  rejectPolicy: (request: PolicyApprovalRequest) => Promise<void>;
  
  // Consent Management
  recordConsent: (request: ConsentRecordRequest) => Promise<void>;
  withdrawConsent: (request: ConsentWithdrawalRequest) => Promise<void>;
  getUserConsents: (userId: ID) => Promise<void>;
  
  // Notifications
  sendNotification: (request: NotificationSendRequest) => Promise<void>;
  scheduleNotification: (request: NotificationSendRequest) => Promise<void>;
  
  // Analytics
  fetchAnalytics: (id: ID, period: string) => Promise<void>;
  trackView: (id: ID, section?: string) => void;
  trackAcknowledgment: (id: ID) => void;
  
  // Compliance
  runComplianceCheck: (id: ID, framework: ComplianceFramework) => Promise<void>;
  generateComplianceReport: (id: ID) => Promise<void>;
}

export interface UseLegalPolicyListHook {
  policies: LegalPolicy[];
  totalCount: number;
  isLoading: boolean;
  error: APIError | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Actions
  fetchPolicies: (params?: LegalPolicyQueryParams) => Promise<void>;
  refreshPolicies: () => Promise<void>;
  loadMore: () => Promise<void>;
  
  // Navigation
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  
  // Filtering & Sorting
  applyFilters: (filters: Partial<LegalPolicyQueryParams>) => Promise<void>;
  clearFilters: () => Promise<void>;
  updateSort: (sort: SortParams) => Promise<void>;
  
  // Bulk Operations
  bulkUpdate: (ids: ID[], data: UpdateLegalPolicyRequest) => Promise<void>;
  bulkDelete: (ids: ID[]) => Promise<void>;
  bulkStatusChange: (ids: ID[], status: PolicyStatus) => Promise<void>;
  bulkPublish: (ids: ID[]) => Promise<void>;
  
  // Search
  search: (query: string) => Promise<void>;
  clearSearch: () => Promise<void>;
}

// ===== COMPONENT PROPS =====
export interface LegalPolicyComponentProps {
  policyId?: ID;
  policy?: LegalPolicy;
  variant?: 'full' | 'summary' | 'minimal';
  showNavigation?: boolean;
  showProgress?: boolean;
  onAcknowledge?: (policyId: ID) => void;
  onConsentChange?: (consentType: ConsentType, status: ConsentStatus) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface PolicyViewerProps {
  policy: LegalPolicy;
  showTOC?: boolean;
  showSearch?: boolean;
  allowDownload?: boolean;
  allowPrint?: boolean;
  trackingEnabled?: boolean;
  onSectionView?: (sectionId: ID) => void;
  onComplete?: (timeSpent: number, scrollDepth: number) => void;
}

export interface ConsentManagerProps {
  requirements: ConsentRequirement[];
  userConsents?: Record<ConsentType, ConsentStatus>;
  onConsentChange: (consentType: ConsentType, status: ConsentStatus) => Promise<void>;
  layout?: 'modal' | 'inline' | 'banner' | 'sidebar';
  granularControl?: boolean;
  showPurposes?: boolean;
  allowWithdrawal?: boolean;
  className?: string;
}

export interface PolicyEditorProps {
  policy?: LegalPolicy;
  onSave: (policy: LegalPolicy) => Promise<void>;
  onCancel: () => void;
  onPreview: (policy: LegalPolicy) => void;
  templates?: PolicyTemplate[];
  isLoading?: boolean;
  readOnly?: boolean;
  className?: string;
}

export interface PolicyTemplate {
  id: ID;
  name: string;
  type: PolicyType;
  description?: string;
  jurisdiction: LegalJurisdiction[];
  complianceFrameworks: ComplianceFramework[];
  content: Partial<PolicyContent>;
  isDefault?: boolean;
  isPopular?: boolean;
}
