import { BaseEntity, ID, Timestamp, ImageAsset, PaginatedResponse, APIResponse, APIError, FileUpload, ValidationError, AuditLog, Permission } from './common.types';
import { User } from './user.types';

// Help System Types - Comprehensive help and support system for e-commerce platform

// ===== CORE TYPES =====
export type Priority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';
export type HelpStatus = 'draft' | 'published' | 'archived' | 'deprecated';
export type TicketStatus = 'open' | 'pending' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed' | 'escalated';
export type TicketType = 'question' | 'issue' | 'bug_report' | 'feature_request' | 'complaint' | 'compliment' | 'general';
export type SupportChannel = 'email' | 'chat' | 'phone' | 'form' | 'social_media' | 'in_app';
export type ChatStatus = 'waiting' | 'active' | 'ended' | 'transferred';
export type AgentStatus = 'available' | 'busy' | 'away' | 'offline';
export type SatisfactionRating = 1 | 2 | 3 | 4 | 5;
export type ArticleType = 'faq' | 'tutorial' | 'troubleshooting' | 'policy' | 'guide' | 'announcement';

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

export interface SearchParams {
  query: string;
  filters?: FilterParams;
  sort?: SortParams;
  pagination?: PaginationParams;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  name?: string;
  company?: string;
}

export interface Attachment {
  id: ID;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: Timestamp;
  uploadedBy: ID;
}

export interface Tag {
  id: ID;
  name: string;
  color?: string;
  description?: string;
}

export interface Category {
  id: ID;
  name: string;
  description?: string;
  icon?: string;
  parentId?: ID;
  order: number;
  isActive: boolean;
}

export interface Rating {
  userId: ID;
  rating: SatisfactionRating;
  comment?: string;
  createdAt: Timestamp;
}

export interface Feedback {
  id: ID;
  type: 'positive' | 'negative' | 'neutral';
  content: string;
  userId?: ID;
  metadata: Record<string, unknown>;
  createdAt: Timestamp;
}

// ===== MAIN HELP ARTICLE ENTITY =====
export interface HelpArticle extends BaseEntity {
  id: ID;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  type: ArticleType;
  categoryId: ID;
  category: Category;
  
  // Content Management
  htmlContent: string;
  markdownContent?: string;
  searchableContent: string;
  
  // Organization
  tags: Tag[];
  relatedArticles: ID[];
  prerequisites: ID[];
  
  // Publishing
  status: HelpStatus;
  publishedAt?: Timestamp;
  lastReviewedAt?: Timestamp;
  reviewedBy?: ID;
  
  // Visibility & Access
  isPublic: boolean;
  visibility: ArticleVisibility;
  accessControl: AccessControl;
  
  // SEO & Discovery
  seo: SEOConfig;
  searchKeywords: string[];
  
  // User Interaction
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  
  // Feedback & Analytics
  ratings: Rating[];
  averageRating: number;
  feedback: Feedback[];
  analytics: ArticleAnalytics;
  
  // Localization
  locale: string;
  translations: Translation[];
  
  // Media & Assets
  featuredImage?: ImageAsset;
  attachments: Attachment[];
  videoContent?: VideoContent[];
  
  // Workflow & Approval
  workflow: ArticleWorkflow;
  approvalHistory: ApprovalRecord[];
  
  // Technical Metadata
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  lastUpdatedBy: ID;
  
  // User Management
  createdBy: ID;
  updatedBy: ID;
  assignedTo?: ID;
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Custom Fields
  customFields: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

// ===== SUPPORT TICKET SYSTEM =====
export interface SupportTicket extends BaseEntity {
  id: ID;
  ticketNumber: string;
  subject: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: Priority;
  
  // Customer Information
  customerId?: ID;
  customer?: User;
  contactInfo: ContactInfo;
  
  // Assignment & Ownership
  assignedTo?: ID;
  assignedAgent?: SupportAgent;
  department?: Department;
  teamId?: ID;
  
  // Communication Channel
  channel: SupportChannel;
  sourceUrl?: string;
  sourceMetadata: Record<string, unknown>;
  
  // Content & Communication
  messages: TicketMessage[];
  attachments: Attachment[];
  internalNotes: InternalNote[];
  
  // Categorization
  categoryId?: ID;
  category?: Category;
  tags: Tag[];
  
  // Time Tracking
  firstResponseAt?: Timestamp;
  lastResponseAt?: Timestamp;
  resolvedAt?: Timestamp;
  closedAt?: Timestamp;
  
  // SLA & Metrics
  sla: SLAConfig;
  metrics: TicketMetrics;
  escalationHistory: EscalationRecord[];
  
  // Resolution
  resolution?: TicketResolution;
  resolutionType?: 'solved' | 'workaround' | 'duplicate' | 'not_reproducible' | 'wont_fix';
  
  // Customer Satisfaction
  satisfaction?: CustomerSatisfaction;
  feedback?: CustomerFeedback;
  
  // Related Items
  relatedTickets: ID[];
  relatedArticles: ID[];
  duplicateOf?: ID;
  
  // Workflow & Automation
  automationRules: AutomationRule[];
  workflowSteps: WorkflowStep[];
  
  // User Management
  createdBy: ID;
  updatedBy: ID;
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Custom Fields
  customFields: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

// ===== LIVE CHAT SYSTEM =====
export interface ChatSession extends BaseEntity {
  id: ID;
  sessionId: string;
  status: ChatStatus;
  
  // Participants
  customerId?: ID;
  customer?: User;
  agentId?: ID;
  agent?: SupportAgent;
  
  // Session Management
  startedAt: Timestamp;
  endedAt?: Timestamp;
  duration?: number;
  
  // Communication
  messages: ChatMessage[];
  typing: TypingIndicator[];
  
  // Transfer & Escalation
  transferHistory: TransferRecord[];
  escalationLevel: number;
  
  // Context & Metadata
  pageUrl?: string;
  userAgent?: string;
  referrer?: string;
  geoLocation?: GeoLocation;
  deviceInfo?: DeviceInfo;
  
  // Queue Management
  queuePosition?: number;
  estimatedWaitTime?: number;
  waitStartTime?: Timestamp;
  
  // Satisfaction & Feedback
  rating?: SatisfactionRating;
  feedback?: string;
  transcript?: string;
  
  // Files & Attachments
  attachments: Attachment[];
  screenShares: ScreenShare[];
  
  // Analytics
  analytics: ChatAnalytics;
  
  // Custom Fields
  tags: Tag[];
  customFields: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

// ===== KNOWLEDGE BASE SYSTEM =====
export interface KnowledgeBase extends BaseEntity {
  id: ID;
  name: string;
  description?: string;
  slug: string;
  
  // Organization
  categories: Category[];
  articles: HelpArticle[];
  structure: KBStructure;
  
  // Configuration
  settings: KBSettings;
  theme: KBTheme;
  branding: KBBranding;
  
  // Access Control
  isPublic: boolean;
  accessControl: AccessControl;
  permissions: Permission[];
  
  // Search & Discovery
  searchConfig: SearchConfig;
  searchAnalytics: SearchAnalytics;
  
  // Localization
  defaultLocale: string;
  supportedLocales: string[];
  
  // Analytics
  analytics: KBAnalytics;
  
  // SEO & Meta
  seo: SEOConfig;
  
  // User Management
  createdBy: ID;
  updatedBy: ID;
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Custom Fields
  customFields: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

// ===== SUPPORT AGENTS & DEPARTMENTS =====
export interface SupportAgent extends BaseEntity {
  id: ID;
  userId: ID;
  user: User;
  
  // Agent Profile
  displayName: string;
  title?: string;
  bio?: string;
  avatar?: ImageAsset;
  
  // Status & Availability
  status: AgentStatus;
  isOnline: boolean;
  lastActiveAt: Timestamp;
  
  // Skills & Expertise
  skills: Skill[];
  languages: string[];
  expertise: string[];
  
  // Department & Team
  departmentId: ID;
  department: Department;
  teamIds: ID[];
  teams: Team[];
  
  // Workload & Capacity
  maxConcurrentChats: number;
  maxConcurrentTickets: number;
  currentWorkload: AgentWorkload;
  
  // Performance Metrics
  metrics: AgentMetrics;
  performance: PerformanceMetrics;
  
  // Permissions & Access
  permissions: Permission[];
  accessLevel: 'basic' | 'advanced' | 'admin';
  
  // Schedule & Availability
  schedule: WorkSchedule;
  timeZone: string;
  
  // User Management
  createdBy: ID;
  updatedBy: ID;
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Custom Fields
  customFields: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface Department extends BaseEntity {
  id: ID;
  name: string;
  description?: string;
  
  // Organization
  parentId?: ID;
  children: Department[];
  
  // Management
  managerId?: ID;
  manager?: SupportAgent;
  agents: SupportAgent[];
  
  // Configuration
  settings: DepartmentSettings;
  businessHours: BusinessHours;
  
  // Contact Information
  email?: string;
  phone?: string;
  
  // User Management
  createdBy: ID;
  updatedBy: ID;
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Custom Fields
  customFields: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

// ===== SUPPORTING INTERFACES =====
export interface ArticleVisibility {
  type: 'public' | 'private' | 'restricted';
  allowedRoles?: string[];
  allowedUsers?: ID[];
  restrictedCountries?: string[];
}

export interface AccessControl {
  requireLogin: boolean;
  allowedRoles: string[];
  allowedUsers: ID[];
  restrictions: AccessRestriction[];
}

export interface AccessRestriction {
  type: string;
  value: unknown;
  message?: string;
}

export interface SEOConfig {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface ArticleAnalytics {
  totalViews: number;
  uniqueViews: number;
  averageTimeSpent: number;
  bounceRate: number;
  searchQueries: string[];
  conversionRate: number;
  exitPoints: string[];
  popularSections: string[];
}

export interface Translation {
  locale: string;
  title: string;
  content: string;
  excerpt?: string;
  translatedBy?: ID;
  translatedAt: Timestamp;
  status: 'draft' | 'published' | 'needs_review';
}

export interface VideoContent {
  id: ID;
  title: string;
  url: string;
  duration: number;
  thumbnail?: ImageAsset;
  captions?: Caption[];
}

export interface Caption {
  language: string;
  url: string;
  isDefault: boolean;
}

export interface ArticleWorkflow {
  currentStep: string;
  steps: WorkflowStep[];
  approvers: ID[];
  requiresApproval: boolean;
}

export interface WorkflowStep {
  id: ID;
  name: string;
  type: string;
  status: 'pending' | 'completed' | 'skipped';
  assignee?: ID;
  completedAt?: Timestamp;
  completedBy?: ID;
}

export interface ApprovalRecord {
  id: ID;
  approverId: ID;
  approver: User;
  decision: 'approved' | 'rejected' | 'pending';
  comments?: string;
  approvedAt?: Timestamp;
}

export interface TicketMessage {
  id: ID;
  content: string;
  isInternal: boolean;
  sender: MessageSender;
  sentAt: Timestamp;
  attachments: Attachment[];
  messageType: 'text' | 'html' | 'system';
  metadata: Record<string, unknown>;
}

export interface MessageSender {
  id: ID;
  type: 'customer' | 'agent' | 'system';
  name: string;
  email?: string;
  avatar?: string;
}

export interface InternalNote {
  id: ID;
  content: string;
  authorId: ID;
  author: SupportAgent;
  createdAt: Timestamp;
  visibility: 'private' | 'team' | 'department';
}

export interface SLAConfig {
  firstResponseTime: number; // minutes
  resolutionTime: number; // minutes
  businessHoursOnly: boolean;
  escalationLevels: EscalationLevel[];
}

export interface EscalationLevel {
  level: number;
  triggerAfter: number; // minutes
  assignTo: ID[];
  notifyUsers: ID[];
}

export interface TicketMetrics {
  firstResponseTime?: number;
  resolutionTime?: number;
  totalAgentTime: number;
  numberOfReplies: number;
  escalationCount: number;
  reopenCount: number;
}

export interface EscalationRecord {
  id: ID;
  level: number;
  reason: string;
  escalatedBy: ID;
  escalatedTo: ID;
  escalatedAt: Timestamp;
  resolved: boolean;
  resolvedAt?: Timestamp;
}

export interface TicketResolution {
  summary: string;
  details?: string;
  resolvedBy: ID;
  resolver: SupportAgent;
  resolvedAt: Timestamp;
  timeToResolve: number;
}

export interface CustomerSatisfaction {
  rating: SatisfactionRating;
  feedback?: string;
  submittedAt: Timestamp;
  followUpRequested: boolean;
}

export interface CustomerFeedback {
  rating: SatisfactionRating;
  comment?: string;
  categories: string[];
  submittedAt: Timestamp;
  isPublic: boolean;
}

export interface AutomationRule {
  id: ID;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
}

export interface AutomationTrigger {
  type: string;
  event: string;
  conditions: Record<string, unknown>;
}

export interface AutomationCondition {
  field: string;
  operator: string;
  value: unknown;
}

export interface AutomationAction {
  type: string;
  parameters: Record<string, unknown>;
}

export interface ChatMessage {
  id: ID;
  content: string;
  sender: MessageSender;
  sentAt: Timestamp;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments: Attachment[];
  isRead: boolean;
  readAt?: Timestamp;
}

export interface TypingIndicator {
  userId: ID;
  isTyping: boolean;
  lastTypingAt: Timestamp;
}

export interface TransferRecord {
  id: ID;
  fromAgent: ID;
  toAgent: ID;
  reason: string;
  transferredAt: Timestamp;
  acceptedAt?: Timestamp;
  notes?: string;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  screenResolution: string;
}

export interface ScreenShare {
  id: ID;
  url: string;
  startedAt: Timestamp;
  endedAt?: Timestamp;
  duration?: number;
}

export interface ChatAnalytics {
  duration: number;
  messageCount: number;
  responseTime: number;
  resolutionTime?: number;
  transferCount: number;
  escalationCount: number;
}

export interface KBStructure {
  categories: CategoryNode[];
  maxDepth: number;
  totalArticles: number;
}

export interface CategoryNode {
  category: Category;
  children: CategoryNode[];
  articleCount: number;
}

export interface KBSettings {
  allowComments: boolean;
  allowRatings: boolean;
  allowSuggestions: boolean;
  moderateComments: boolean;
  enableSearch: boolean;
  enableAnalytics: boolean;
}

export interface KBTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  customCSS?: string;
  layout: 'sidebar' | 'centered' | 'grid';
}

export interface KBBranding {
  logo?: ImageAsset;
  favicon?: ImageAsset;
  companyName: string;
  headerText?: string;
  footerText?: string;
}

export interface SearchConfig {
  enabled: boolean;
  suggestionsEnabled: boolean;
  highlightEnabled: boolean;
  fuzzySearchEnabled: boolean;
  synonyms: Synonym[];
}

export interface Synonym {
  term: string;
  synonyms: string[];
}

export interface SearchAnalytics {
  totalSearches: number;
  topQueries: SearchQuery[];
  noResultsQueries: string[];
  clickThroughRate: number;
}

export interface SearchQuery {
  query: string;
  count: number;
  resultsCount: number;
  clickThroughRate: number;
}

export interface KBAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  topArticles: PopularArticle[];
  topCategories: PopularCategory[];
  searchMetrics: SearchAnalytics;
}

export interface PopularArticle {
  articleId: ID;
  title: string;
  views: number;
  rating: number;
}

export interface PopularCategory {
  categoryId: ID;
  name: string;
  views: number;
  articleCount: number;
}

export interface Skill {
  id: ID;
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
  category: string;
}

export interface Team {
  id: ID;
  name: string;
  description?: string;
  leaderId?: ID;
  members: ID[];
}

export interface AgentWorkload {
  activeTickets: number;
  activeChats: number;
  utilization: number;
  lastUpdated: Timestamp;
}

export interface AgentMetrics {
  totalTicketsHandled: number;
  averageResolutionTime: number;
  customerSatisfactionRating: number;
  firstContactResolutionRate: number;
  totalChatsSessions: number;
  averageChatDuration: number;
}

export interface PerformanceMetrics {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  ticketMetrics: TicketPerformanceMetrics;
  chatMetrics: ChatPerformanceMetrics;
  satisfactionMetrics: SatisfactionMetrics;
}

export interface TicketPerformanceMetrics {
  totalTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  firstContactResolution: number;
  escalationRate: number;
}

export interface ChatPerformanceMetrics {
  totalChats: number;
  averageChatDuration: number;
  averageResponseTime: number;
  transferRate: number;
  abandonmentRate: number;
}

export interface SatisfactionMetrics {
  averageRating: number;
  responseRate: number;
  promoterScore: number;
  detractorScore: number;
}

export interface WorkSchedule {
  timezone: string;
  workDays: WorkDay[];
  holidays: Holiday[];
  breaks: Break[];
}

export interface WorkDay {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  isWorkingDay: boolean;
}

export interface Holiday {
  date: string;
  name: string;
  type: 'public' | 'company' | 'personal';
}

export interface Break {
  startTime: string;
  endTime: string;
  type: 'lunch' | 'coffee' | 'other';
}

export interface DepartmentSettings {
  autoAssignment: boolean;
  roundRobinAssignment: boolean;
  workloadBalancing: boolean;
  escalationEnabled: boolean;
  slaEnabled: boolean;
}

export interface BusinessHours {
  timezone: string;
  schedule: BusinessDay[];
  holidays: Holiday[];
}

export interface BusinessDay {
  day: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

// ===== REQUEST/RESPONSE INTERFACES =====
export interface CreateHelpArticleRequest {
  title: string;
  content: string;
  excerpt?: string;
  type: ArticleType;
  categoryId: ID;
  tags?: string[];
  isPublic?: boolean;
  status?: HelpStatus;
  seo?: Partial<SEOConfig>;
  customFields?: Record<string, unknown>;
}

export interface UpdateHelpArticleRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  type?: ArticleType;
  categoryId?: ID;
  tags?: string[];
  isPublic?: boolean;
  status?: HelpStatus;
  seo?: Partial<SEOConfig>;
  customFields?: Record<string, unknown>;
}

export interface CreateSupportTicketRequest {
  subject: string;
  description: string;
  type: TicketType;
  priority?: Priority;
  categoryId?: ID;
  channel: SupportChannel;
  contactInfo: ContactInfo;
  attachments?: FileUpload[];
  customFields?: Record<string, unknown>;
}

export interface UpdateSupportTicketRequest {
  subject?: string;
  description?: string;
  type?: TicketType;
  priority?: Priority;
  status?: TicketStatus;
  assignedTo?: ID;
  categoryId?: ID;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export interface HelpQueryParams extends PaginationParams, SortParams, FilterParams {
  type?: ArticleType[];
  status?: HelpStatus[];
  categoryId?: ID;
  tags?: string[];
  search?: string;
  locale?: string;
  isPublic?: boolean;
  createdBy?: ID;
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
}

export interface TicketQueryParams extends PaginationParams, SortParams, FilterParams {
  status?: TicketStatus[];
  type?: TicketType[];
  priority?: Priority[];
  assignedTo?: ID;
  customerId?: ID;
  categoryId?: ID;
  channel?: SupportChannel[];
  tags?: string[];
  search?: string;
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
}

export type HelpArticleResponse = APIResponse<HelpArticle>;
export type HelpArticleListResponse = APIResponse<PaginatedResponse<HelpArticle>>;
export type SupportTicketResponse = APIResponse<SupportTicket>;
export type SupportTicketListResponse = APIResponse<PaginatedResponse<SupportTicket>>;
export type ChatSessionResponse = APIResponse<ChatSession>;
export type KnowledgeBaseResponse = APIResponse<KnowledgeBase>;

// ===== HOOKS & STATE MANAGEMENT =====
export interface UseHelpArticleHook {
  article: HelpArticle | null;
  isLoading: boolean;
  error: APIError | null;
  
  // Actions
  fetchArticle: (id: ID) => Promise<void>;
  createArticle: (data: CreateHelpArticleRequest) => Promise<void>;
  updateArticle: (id: ID, data: UpdateHelpArticleRequest) => Promise<void>;
  deleteArticle: (id: ID) => Promise<void>;
  publishArticle: (id: ID) => Promise<void>;
  
  // Interactions
  likeArticle: (id: ID) => Promise<void>;
  dislikeArticle: (id: ID) => Promise<void>;
  rateArticle: (id: ID, rating: SatisfactionRating) => Promise<void>;
  reportHelpful: (id: ID, helpful: boolean) => Promise<void>;
  
  // Analytics
  trackView: (id: ID) => void;
  trackTimeSpent: (id: ID, duration: number) => void;
}

export interface UseHelpArticleListHook {
  articles: HelpArticle[];
  totalCount: number;
  isLoading: boolean;
  error: APIError | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Actions
  fetchArticles: (params?: HelpQueryParams) => Promise<void>;
  refreshArticles: () => Promise<void>;
  loadMore: () => Promise<void>;
  
  // Navigation
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  
  // Filtering & Sorting
  applyFilters: (filters: Partial<HelpQueryParams>) => Promise<void>;
  clearFilters: () => Promise<void>;
  updateSort: (sort: SortParams) => Promise<void>;
  
  // Search
  search: (query: string) => Promise<void>;
  clearSearch: () => Promise<void>;
}

export interface UseSupportTicketHook {
  ticket: SupportTicket | null;
  isLoading: boolean;
  error: APIError | null;
  
  // Actions
  fetchTicket: (id: ID) => Promise<void>;
  createTicket: (data: CreateSupportTicketRequest) => Promise<void>;
  updateTicket: (id: ID, data: UpdateSupportTicketRequest) => Promise<void>;
  deleteTicket: (id: ID) => Promise<void>;
  
  // Communication
  addMessage: (id: ID, message: string, attachments?: File[]) => Promise<void>;
  addInternalNote: (id: ID, note: string) => Promise<void>;
  
  // Status Management
  assignTicket: (id: ID, agentId: ID) => Promise<void>;
  escalateTicket: (id: ID, reason: string) => Promise<void>;
  resolveTicket: (id: ID, resolution: string) => Promise<void>;
  closeTicket: (id: ID) => Promise<void>;
  reopenTicket: (id: ID, reason: string) => Promise<void>;
  
  // Customer Actions
  rateSatisfaction: (id: ID, rating: SatisfactionRating, feedback?: string) => Promise<void>;
}

export interface UseChatSessionHook {
  session: ChatSession | null;
  isLoading: boolean;
  error: APIError | null;
  isConnected: boolean;
  
  // Actions
  startChat: () => Promise<void>;
  endChat: () => Promise<void>;
  joinQueue: () => Promise<void>;
  leaveQueue: () => Promise<void>;
  
  // Messaging
  sendMessage: (message: string, attachments?: File[]) => Promise<void>;
  markAsRead: (messageId: ID) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  
  // Transfer & Escalation
  requestTransfer: (reason: string) => Promise<void>;
  acceptTransfer: () => Promise<void>;
  escalateChat: (reason: string) => Promise<void>;
  
  // Feedback
  rateSession: (rating: SatisfactionRating, feedback?: string) => Promise<void>;
  requestTranscript: () => Promise<void>;
}

// ===== COMPONENT PROPS =====
export interface HelpArticleProps {
  articleId?: ID;
  showRelated?: boolean;
  showRating?: boolean;
  showComments?: boolean;
  showTOC?: boolean;
  allowEdit?: boolean;
  className?: string;
  onView?: (article: HelpArticle) => void;
  onLike?: (article: HelpArticle) => void;
  onDislike?: (article: HelpArticle) => void;
  onRate?: (article: HelpArticle, rating: SatisfactionRating) => void;
}

export interface SupportTicketFormProps {
  initialData?: Partial<CreateSupportTicketRequest>;
  categories?: Category[];
  onSubmit: (data: CreateSupportTicketRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  showContactInfo?: boolean;
  allowAttachments?: boolean;
  className?: string;
}

export interface ChatWidgetProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  theme?: 'light' | 'dark' | 'auto';
  showOfflineForm?: boolean;
  offlineMessage?: string;
  className?: string;
  customStyles?: React.CSSProperties;
}

export interface KnowledgeBaseProps {
  kbId?: ID;
  showSearch?: boolean;
  showCategories?: boolean;
  showPopularArticles?: boolean;
  layout?: 'sidebar' | 'centered' | 'grid';
  maxArticles?: number;
  className?: string;
  onArticleClick?: (article: HelpArticle) => void;
  onCategoryClick?: (category: Category) => void;
}

// ===== TYPE USAGE TO AVOID WARNINGS =====
export interface HelpTypeUsage {
  validationError: ValidationError;
  auditLog: AuditLog;
}
