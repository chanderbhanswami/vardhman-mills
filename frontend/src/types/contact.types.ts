/**
 * Contact and Support Types - Vardhman Mills Frontend
 * 
 * Comprehensive type definitions for contact forms, support tickets,
 * customer service, help systems, and communication channels.
 * 
 * @version 1.0.0
 * @created 2024-01-12
 */

import { ID, Timestamp, BaseEntity } from './common.types';

// ============================================================================
// CONTACT FORM TYPES
// ============================================================================

/**
 * Contact form submission
 */
export interface ContactForm extends BaseEntity {
  // Form Type
  formType: ContactFormType;
  
  // Sender Information
  sender: ContactSender;
  
  // Message Content
  subject: string;
  message: string;
  category: ContactCategory;
  priority: ContactPriority;
  
  // Contact Preferences
  preferredContactMethod: ContactMethod;
  preferredTime?: TimePreference;
  language: string;
  
  // Context Information
  context: ContactContext;
  
  // Attachments
  attachments: ContactAttachment[];
  
  // Follow-up
  followUp: ContactFollowUp;
  
  // Processing Status
  status: ContactStatus;
  
  // Assignment
  assignedTo?: ID; // Staff member ID
  department?: ContactDepartment;
  
  // Response Information
  response?: ContactResponse;
  
  // Analytics
  analytics: ContactAnalytics;
  
  // Privacy and Consent
  consent: ContactConsent;
}

/**
 * Types of contact forms
 */
export type ContactFormType = 
  | 'general_inquiry'    // General questions
  | 'product_inquiry'    // Product-specific questions
  | 'order_inquiry'      // Order-related questions
  | 'technical_support'  // Technical help
  | 'complaint'          // Complaints and issues
  | 'feedback'           // Feedback and suggestions
  | 'wholesale_inquiry'  // Wholesale/bulk inquiries
  | 'partnership'        // Partnership proposals
  | 'press_media'        // Media inquiries
  | 'careers'            // Job-related queries
  | 'return_refund'      // Returns and refunds
  | 'custom_order'       // Custom/bespoke orders
  | 'quote_request'      // Price quotations
  | 'callback_request'   // Request for callback
  | 'store_visit'        // Store visit inquiries
  | 'other';             // Other inquiries

/**
 * Sender information
 */
export interface ContactSender {
  // Basic Information
  name: string;
  email: string;
  phone?: string;
  
  // Optional Information
  company?: string;
  designation?: string;
  website?: string;
  
  // Location
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  
  // User Context
  isRegistered: boolean;
  userId?: ID;
  customerType?: 'individual' | 'business' | 'wholesale' | 'retail' | 'government';
  
  // Relationship
  isExistingCustomer: boolean;
  customerSince?: Timestamp;
  orderHistory?: number; // Number of previous orders
  
  // Communication History
  previousContacts: number;
  lastContactDate?: Timestamp;
  preferredLanguage: string;
}

/**
 * Contact categories for organization
 */
export type ContactCategory = 
  | 'product_info'       // Product information
  | 'pricing'            // Pricing inquiries
  | 'availability'       // Stock availability
  | 'shipping'           // Shipping and delivery
  | 'payment'            // Payment issues
  | 'order_status'       // Order tracking
  | 'returns'            // Returns and exchanges
  | 'quality'            // Quality concerns
  | 'technical'          // Technical support
  | 'account'            // Account management
  | 'billing'            // Billing questions
  | 'wholesale'          // Wholesale inquiries
  | 'partnership'        // Business partnerships
  | 'marketing'          // Marketing collaboration
  | 'feedback'           // General feedback
  | 'complaint'          // Complaints
  | 'suggestion'         // Suggestions
  | 'other';             // Uncategorized

/**
 * Contact priority levels
 */
export type ContactPriority = 
  | 'urgent'     // Requires immediate attention
  | 'high'       // High priority
  | 'medium'     // Standard priority
  | 'low';       // Low priority

/**
 * Preferred contact methods
 */
export type ContactMethod = 
  | 'email'      // Email response
  | 'phone'      // Phone call
  | 'whatsapp'   // WhatsApp message
  | 'sms'        // SMS text
  | 'callback'   // Request callback
  | 'in_person'  // In-person meeting
  | 'video_call' // Video conference
  | 'any';       // Any method

/**
 * Time preferences for contact
 */
export interface TimePreference {
  // Preferred Days
  preferredDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  
  // Preferred Time Slots
  preferredTimeSlots: {
    start: string; // "09:00"
    end: string;   // "17:00"
  }[];
  
  // Timezone
  timezone: string;
  
  // Urgency
  isUrgent: boolean;
  availableImmediately: boolean;
  
  // Constraints
  notAvailable?: {
    dates: string[]; // ISO date strings
    timeSlots: {
      start: string;
      end: string;
    }[];
  };
}

/**
 * Contact context information
 */
export interface ContactContext {
  // Source Information
  source: ContactSource;
  referrer?: string;
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  
  // Page Context
  currentPage?: string;
  previousPage?: string;
  sessionDuration?: number;
  
  // Product Context
  relatedProducts?: ID[];
  currentProduct?: ID;
  cartProducts?: ID[];
  wishlistProducts?: ID[];
  
  // Order Context
  relatedOrder?: ID;
  orderValue?: number;
  orderDate?: Timestamp;
  
  // Device Information
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    screenResolution?: string;
  };
  
  // Location
  ipLocation?: {
    country: string;
    state: string;
    city: string;
  };
  
  // Session Information
  sessionId: string;
  isFirstVisit: boolean;
  pageViews: number;
  timeOnSite: number;
}

/**
 * Contact source channels
 */
export type ContactSource = 
  | 'website'        // Direct website form
  | 'mobile_app'     // Mobile application
  | 'email'          // Email inquiry
  | 'phone'          // Phone call
  | 'whatsapp'       // WhatsApp
  | 'social_media'   // Social media platforms
  | 'advertisement'  // From ads
  | 'referral'       // Referral from friend
  | 'search_engine'  // Search engine
  | 'direct'         // Direct contact
  | 'store_visit'    // Physical store
  | 'trade_show'     // Trade shows/events
  | 'print_media'    // Print advertisements
  | 'other';         // Other sources

/**
 * Contact attachment
 */
export interface ContactAttachment {
  id: ID;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  
  // Storage
  url: string;
  thumbnailUrl?: string;
  
  // Metadata
  description?: string;
  category: 'image' | 'document' | 'video' | 'audio' | 'other';
  
  // Validation
  isValidated: boolean;
  isVirusFree: boolean;
  
  // Processing
  isProcessed: boolean;
  ocrText?: string; // If image contains text
  
  // Security
  accessLevel: 'public' | 'private' | 'restricted';
  
  // Timestamps
  uploadedAt: Timestamp;
  expiresAt?: Timestamp;
}

/**
 * Contact follow-up configuration
 */
export interface ContactFollowUp {
  // Follow-up Preferences
  wantsFollowUp: boolean;
  followUpMethod: ContactMethod;
  followUpFrequency: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'as_needed';
  
  // Scheduled Follow-ups
  scheduledFollowUps: ScheduledFollowUp[];
  
  // Auto-responses
  autoResponseEnabled: boolean;
  autoResponseTemplate?: string;
  
  // Escalation
  escalationRequired: boolean;
  escalationCriteria?: string;
  escalationLevel?: number;
  
  // Reminders
  reminderSettings: {
    enabled: boolean;
    intervals: number[]; // Hours after submission
    maxReminders: number;
  };
}

/**
 * Scheduled follow-up
 */
export interface ScheduledFollowUp {
  id: ID;
  scheduledAt: Timestamp;
  type: 'reminder' | 'check_in' | 'resolution_check' | 'feedback_request' | 'escalation';
  method: ContactMethod;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  
  // Content
  subject?: string;
  message?: string;
  template?: string;
  
  // Execution
  executedAt?: Timestamp;
  executedBy?: 'system' | 'staff';
  
  // Response
  responseReceived: boolean;
  responseAt?: Timestamp;
  responseContent?: string;
}

// ============================================================================
// STATUS AND PROCESSING TYPES
// ============================================================================

/**
 * Contact processing status
 */
export type ContactStatus = 
  | 'submitted'      // Just submitted
  | 'received'       // Received and logged
  | 'reviewing'      // Under review
  | 'assigned'       // Assigned to staff
  | 'investigating'  // Investigation in progress
  | 'pending_info'   // Waiting for more information
  | 'in_progress'    // Being worked on
  | 'escalated'      // Escalated to higher level
  | 'resolved'       // Issue resolved
  | 'closed'         // Case closed
  | 'follow_up'      // Follow-up required
  | 'cancelled'      // Cancelled by user
  | 'spam'           // Marked as spam
  | 'duplicate';     // Duplicate submission

/**
 * Contact departments for routing
 */
export type ContactDepartment = 
  | 'customer_service'  // General customer service
  | 'technical_support' // Technical support team
  | 'sales'            // Sales department
  | 'billing'          // Billing department
  | 'shipping'         // Shipping and logistics
  | 'quality'          // Quality assurance
  | 'returns'          // Returns and refunds
  | 'wholesale'        // Wholesale team
  | 'marketing'        // Marketing department
  | 'management'       // Management team
  | 'legal'            // Legal department
  | 'hr'               // Human resources
  | 'it'               // IT department
  | 'procurement'      // Procurement team
  | 'general';         // General inquiries

/**
 * Contact response from staff
 */
export interface ContactResponse {
  // Response Information
  respondedBy: ID; // Staff member ID
  respondedAt: Timestamp;
  
  // Response Content
  subject: string;
  message: string;
  isPublic: boolean; // Can be shared with customer
  
  // Response Type
  responseType: ContactResponseType;
  
  // Resolution Information
  isResolved: boolean;
  resolutionSummary?: string;
  resolutionCategory?: string;
  
  // Follow-up Required
  requiresFollowUp: boolean;
  followUpDate?: Timestamp;
  followUpNotes?: string;
  
  // Attachments
  attachments: ContactAttachment[];
  
  // Internal Notes
  internalNotes?: string;
  
  // Satisfaction
  satisfactionSurvey?: ContactSatisfactionSurvey;
  
  // Escalation
  escalationReason?: string;
  escalatedTo?: ID;
  escalatedAt?: Timestamp;
}

/**
 * Types of contact responses
 */
export type ContactResponseType = 
  | 'initial_response'   // First response
  | 'clarification'      // Asking for clarification
  | 'information'        // Providing information
  | 'solution'           // Providing solution
  | 'partial_solution'   // Partial solution
  | 'workaround'         // Temporary workaround
  | 'escalation'         // Escalating to another team
  | 'follow_up'          // Follow-up response
  | 'resolution'         // Final resolution
  | 'closure'            // Closing the case
  | 'acknowledgment'     // Acknowledging receipt
  | 'auto_response';     // Automated response

/**
 * Customer satisfaction survey
 */
export interface ContactSatisfactionSurvey {
  // Ratings
  overallSatisfaction: number; // 1-5
  responseTime: number; // 1-5
  helpfulness: number; // 1-5
  professionalism: number; // 1-5
  knowledgeLevel: number; // 1-5
  
  // Resolution
  wasResolved: boolean;
  resolutionSatisfaction?: number; // 1-5
  
  // Feedback
  feedback?: string;
  suggestions?: string;
  
  // Likelihood
  likelyToRecommend: number; // 1-10 (NPS)
  likelyToContactAgain: number; // 1-5
  
  // Follow-up
  wantsFollowUp: boolean;
  
  // Metadata
  submittedAt: Timestamp;
  channel: string; // How survey was sent
}

// ============================================================================
// SUPPORT TICKET TYPES
// ============================================================================

/**
 * Support ticket system
 */
export interface SupportTicket extends BaseEntity {
  // Ticket Information
  ticketNumber: string;
  title: string;
  description: string;
  
  // Classification
  category: TicketCategory;
  subcategory?: string;
  priority: TicketPriority;
  severity: TicketSeverity;
  type: TicketType;
  
  // Customer Information
  customer: TicketCustomer;
  
  // Assignment
  assignedTo?: ID; // Support agent ID
  assignedTeam?: string;
  department: ContactDepartment;
  
  // Status Tracking
  status: TicketStatus;
  statusHistory: TicketStatusHistory[];
  
  // Communication
  messages: TicketMessage[];
  
  // Resolution
  resolution?: TicketResolution;
  
  // Escalation
  escalation?: TicketEscalation;
  
  // Time Tracking
  timeTracking: TicketTimeTracking;
  
  // Tags and Labels
  tags: string[];
  labels: TicketLabel[];
  
  // Attachments
  attachments: ContactAttachment[];
  
  // Knowledge Base
  relatedArticles?: ID[];
  suggestedSolutions?: string[];
  
  // SLA Information
  sla: TicketSLA;
  
  // Analytics
  analytics: TicketAnalytics;
}

/**
 * Support ticket categories
 */
export type TicketCategory = 
  | 'product_defect'     // Product quality issues
  | 'order_issue'        // Order problems
  | 'delivery_issue'     // Shipping/delivery problems
  | 'payment_issue'      // Payment problems
  | 'account_issue'      // Account access problems
  | 'website_bug'        // Website technical issues
  | 'feature_request'    // Feature requests
  | 'billing_dispute'    // Billing disputes
  | 'refund_request'     // Refund requests
  | 'exchange_request'   // Exchange requests
  | 'information_request'// Information requests
  | 'complaint'          // General complaints
  | 'compliment'         // Positive feedback
  | 'security_issue'     // Security concerns
  | 'accessibility'      // Accessibility issues
  | 'other';             // Other issues

/**
 * Ticket priority levels
 */
export type TicketPriority = 
  | 'critical'   // Business-critical issues
  | 'high'       // High priority
  | 'medium'     // Standard priority
  | 'low';       // Low priority

/**
 * Ticket severity levels
 */
export type TicketSeverity = 
  | 'blocker'    // Complete blocking issue
  | 'major'      // Major functionality affected
  | 'minor'      // Minor inconvenience
  | 'trivial'    // Cosmetic or trivial issues
  | 'enhancement'; // Enhancement requests

/**
 * Types of support tickets
 */
export type TicketType = 
  | 'incident'   // Unplanned service interruption
  | 'request'    // Service request
  | 'problem'    // Root cause of incidents
  | 'change'     // Change request
  | 'question'   // Question or inquiry
  | 'task';      // Task to be completed

/**
 * Customer information in ticket
 */
export interface TicketCustomer {
  // Basic Information
  customerId?: ID;
  name: string;
  email: string;
  phone?: string;
  
  // Account Information
  accountType: 'guest' | 'registered' | 'premium' | 'wholesale' | 'enterprise';
  loyaltyTier?: string;
  
  // History
  previousTickets: number;
  averageResolutionTime: number;
  satisfactionScore: number;
  
  // Preferences
  communicationPreferences: {
    method: ContactMethod;
    language: string;
    timezone: string;
  };
  
  // Context
  recentOrders?: ID[];
  accountValue?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Ticket status tracking
 */
export type TicketStatus = 
  | 'new'           // Newly created
  | 'open'          // Open and assigned
  | 'pending'       // Waiting for customer response
  | 'hold'          // On hold
  | 'in_progress'   // Being worked on
  | 'escalated'     // Escalated
  | 'resolved'      // Resolved
  | 'closed'        // Closed
  | 'cancelled'     // Cancelled
  | 'merged'        // Merged with another ticket
  | 'duplicate';    // Duplicate ticket

/**
 * Ticket status history
 */
export interface TicketStatusHistory {
  id: ID;
  status: TicketStatus;
  changedBy: ID;
  changedAt: Timestamp;
  reason?: string;
  notes?: string;
  
  // Duration in previous status
  durationInPreviousStatus?: number; // milliseconds
  
  // Automated or manual change
  isAutomated: boolean;
  automationReason?: string;
}

/**
 * Ticket message/communication
 */
export interface TicketMessage extends BaseEntity {
  ticketId: ID;
  
  // Sender Information
  senderId: ID;
  senderType: 'customer' | 'agent' | 'system';
  senderName: string;
  senderEmail?: string;
  
  // Message Content
  subject?: string;
  content: string;
  contentType: 'text' | 'html' | 'markdown';
  
  // Visibility
  isPublic: boolean; // Visible to customer
  isInternal: boolean; // Internal note
  
  // Type
  messageType: TicketMessageType;
  
  // Attachments
  attachments: ContactAttachment[];
  
  // Read Status
  isRead: boolean;
  readAt?: Timestamp;
  readBy?: ID[];
  
  // Channel
  channel: 'email' | 'web' | 'phone' | 'chat' | 'whatsapp' | 'api' | 'system';
  
  // Threading
  parentMessageId?: ID;
  replies?: TicketMessage[];
  
  // Metadata
  metadata: {
    [key: string]: unknown;
  };
}

/**
 * Types of ticket messages
 */
export type TicketMessageType = 
  | 'initial'        // Initial ticket creation
  | 'response'       // Response to customer
  | 'update'         // Status update
  | 'clarification'  // Asking for clarification
  | 'information'    // Providing information
  | 'internal_note'  // Internal team note
  | 'escalation'     // Escalation notice
  | 'resolution'     // Resolution message
  | 'closure'        // Closure notice
  | 'reopening'      // Ticket reopened
  | 'system'         // System-generated message
  | 'auto_response'; // Automated response

/**
 * Ticket resolution information
 */
export interface TicketResolution {
  // Resolution Details
  resolvedBy: ID;
  resolvedAt: Timestamp;
  
  // Resolution Content
  summary: string;
  solution: string;
  category: ResolutionCategory;
  
  // Root Cause
  rootCause?: string;
  rootCauseCategory?: string;
  
  // Solution Type
  solutionType: SolutionType;
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Timestamp;
  followUpNotes?: string;
  
  // Customer Feedback
  customerSatisfaction?: ContactSatisfactionSurvey;
  
  // Knowledge Base
  addedToKB: boolean;
  kbArticleId?: ID;
  
  // Time Metrics
  resolutionTime: number; // Total time to resolve
  firstResponseTime: number; // Time to first response
  
  // Verification
  isVerified: boolean;
  verifiedBy?: ID;
  verifiedAt?: Timestamp;
}

/**
 * Resolution categories
 */
export type ResolutionCategory = 
  | 'user_error'         // User misunderstanding
  | 'product_defect'     // Actual product issue
  | 'system_error'       // System/website issue
  | 'process_improvement'// Process needs improvement
  | 'policy_clarification'// Policy clarification
  | 'training_needed'    // User needs training
  | 'feature_limitation' // Current feature limitation
  | 'configuration'      // Configuration issue
  | 'data_issue'         // Data problem
  | 'integration_issue'  // Third-party integration
  | 'performance'        // Performance issue
  | 'other';             // Other resolution

/**
 * Solution types
 */
export type SolutionType = 
  | 'immediate'      // Immediate solution provided
  | 'workaround'     // Temporary workaround
  | 'escalation'     // Escalated for solution
  | 'development'    // Requires development work
  | 'policy_change'  // Policy change needed
  | 'documentation'  // Documentation update
  | 'training'       // Training material needed
  | 'no_action'      // No action required
  | 'duplicate'      // Duplicate of existing issue
  | 'invalid';       // Invalid request

/**
 * Ticket escalation information
 */
export interface TicketEscalation {
  // Escalation Details
  escalatedBy: ID;
  escalatedTo: ID;
  escalatedAt: Timestamp;
  
  // Escalation Reason
  reason: EscalationReason;
  description: string;
  
  // Target Response Time
  targetResponseTime?: number;
  targetResolutionTime?: number;
  
  // Escalation Level
  level: number; // 1, 2, 3, etc.
  maxLevel: number;
  
  // Approval
  requiresApproval: boolean;
  approvedBy?: ID;
  approvedAt?: Timestamp;
  
  // History
  escalationHistory: {
    level: number;
    escalatedTo: ID;
    escalatedAt: Timestamp;
    reason: string;
  }[];
}

/**
 * Escalation reasons
 */
export type EscalationReason = 
  | 'sla_breach'         // SLA time exceeded
  | 'complex_issue'      // Issue too complex
  | 'customer_request'   // Customer requested escalation
  | 'high_value_customer'// High-value customer
  | 'critical_issue'     // Critical business impact
  | 'unresolved'         // Cannot resolve at current level
  | 'policy_exception'   // Policy exception needed
  | 'technical_expertise'// Specialized knowledge needed
  | 'management_decision'// Management decision required
  | 'legal_issue'        // Legal implications
  | 'escalation_policy'; // Automatic escalation policy

/**
 * Time tracking for tickets
 */
export interface TicketTimeTracking {
  // Response Times
  firstResponseTime?: number; // Time to first response
  averageResponseTime: number;
  lastResponseTime?: number;
  
  // Resolution Time
  totalResolutionTime?: number;
  actualWorkTime: number; // Time actively worked
  waitingTime: number; // Time waiting for customer
  
  // SLA Times
  slaResponseTime: number; // SLA target for response
  slaResolutionTime: number; // SLA target for resolution
  
  // Breach Information
  responseTimeBreach: boolean;
  resolutionTimeBreach: boolean;
  breachReason?: string;
  
  // Working Hours
  workingHoursOnly: boolean;
  holidays: string[]; // Holidays to exclude
  timeZone: string;
  
  // Tracking History
  timeEntries: TimeEntry[];
}

/**
 * Time entry for detailed tracking
 */
export interface TimeEntry {
  id: ID;
  startTime: Timestamp;
  endTime?: Timestamp;
  duration: number; // milliseconds
  
  // Activity
  activity: TimeActivity;
  description?: string;
  
  // Agent
  agentId: ID;
  agentName: string;
  
  // Billable
  isBillable: boolean;
  hourlyRate?: number;
  cost?: number;
}

/**
 * Time tracking activities
 */
export type TimeActivity = 
  | 'research'       // Researching the issue
  | 'communication'  // Communicating with customer
  | 'testing'        // Testing solutions
  | 'documentation'  // Documenting the issue
  | 'coordination'   // Coordinating with team
  | 'escalation'     // Escalation activities
  | 'training'       // Training or learning
  | 'waiting'        // Waiting for response
  | 'other';         // Other activities

/**
 * Ticket label for categorization
 */
export interface TicketLabel {
  id: ID;
  name: string;
  color: string;
  description?: string;
  category: 'priority' | 'type' | 'department' | 'skill' | 'product' | 'custom';
  
  // Auto-assignment
  isAutoAssigned: boolean;
  autoAssignmentRules?: string[];
  
  // Analytics
  usageCount: number;
  
  // Permissions
  canBeAddedBy: ('customer' | 'agent' | 'manager')[];
  canBeRemovedBy: ('customer' | 'agent' | 'manager')[];
}

/**
 * Service Level Agreement information
 */
export interface TicketSLA {
  // SLA Definitions
  responseTime: number; // Expected response time (hours)
  resolutionTime: number; // Expected resolution time (hours)
  
  // Current Status
  isWithinSLA: boolean;
  slaBreachRisk: 'none' | 'low' | 'medium' | 'high';
  
  // Time Remaining
  responseTimeRemaining?: number;
  resolutionTimeRemaining?: number;
  
  // Breach Information
  responseTimeBreach: boolean;
  resolutionTimeBreach: boolean;
  breachHistory: SLABreach[];
  
  // SLA Type
  slaType: 'standard' | 'premium' | 'enterprise' | 'custom';
  
  // Business Hours
  businessHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
    timezone: string;
    workingDays: string[]; // ["monday", "tuesday", ...]
    holidays: string[]; // ISO date strings
  };
  
  // Escalation Policy
  escalationPolicy: {
    level1: number; // Hours before level 1 escalation
    level2: number; // Hours before level 2 escalation
    level3: number; // Hours before level 3 escalation
  };
}

/**
 * SLA breach record
 */
export interface SLABreach {
  type: 'response' | 'resolution';
  breachedAt: Timestamp;
  targetTime: number;
  actualTime: number;
  breachDuration: number;
  reason?: string;
  
  // Impact
  impact: 'low' | 'medium' | 'high' | 'critical';
  
  // Notifications
  notificationsSent: {
    recipient: ID;
    sentAt: Timestamp;
    method: string;
  }[];
}

// ============================================================================
// ANALYTICS AND REPORTING TYPES
// ============================================================================

/**
 * Contact analytics data
 */
export interface ContactAnalytics {
  // Basic Metrics
  viewCount: number;
  responseCount: number;
  resolutionTime?: number;
  
  // Engagement
  engagement: {
    openRate: number;
    responseRate: number;
    clickThroughRate: number;
  };
  
  // Conversion
  conversion: {
    contactToCustomer: boolean;
    contactToSale: boolean;
    saleValue?: number;
  };
  
  // Satisfaction
  satisfaction?: {
    rating: number;
    npsScore?: number;
    feedback?: string;
  };
  
  // Channel Performance
  channelEffectiveness: number; // 0-1
  
  // Cost
  handlingCost?: number;
  resolutionCost?: number;
  
  // Quality
  qualityScore?: number; // 0-100
  
  // Follow-up Success
  followUpSuccess: boolean;
  followUpEffectiveness?: number;
}

/**
 * Ticket analytics data
 */
export interface TicketAnalytics {
  // Performance Metrics
  resolutionEfficiency: number; // 0-1
  customerSatisfactionScore: number; // 1-5
  agentPerformanceScore: number; // 0-100
  
  // Time Metrics
  timeToFirstResponse: number;
  timeToResolution: number;
  totalTouchPoints: number;
  
  // Quality Metrics
  firstCallResolution: boolean;
  escalationCount: number;
  reopenCount: number;
  
  // Business Impact
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  revenueImpact?: number;
  customerRetentionImpact: number; // -1 to 1
  
  // Channel Effectiveness
  channelEffectiveness: number; // 0-1
  
  // Knowledge Base
  kbArticlesUsed: ID[];
  kbEffectiveness?: number;
  
  // Team Performance
  teamCollaboration: number; // 0-1
  skillGaps?: string[];
  
  // Automation
  automationOpportunities?: string[];
  automationSuccess?: number; // 0-1
}

/**
 * Privacy and consent information
 */
export interface ContactConsent {
  // Data Processing Consent
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  thirdPartySharing: boolean;
  
  // Communication Consent
  emailConsent: boolean;
  smsConsent: boolean;
  phoneConsent: boolean;
  
  // Consent Details
  consentGivenAt: Timestamp;
  consentVersion: string;
  ipAddress: string;
  userAgent: string;
  
  // Consent Source
  consentSource: 'explicit' | 'implicit' | 'legitimate_interest' | 'opt_in' | 'pre_checked';
  
  // Withdrawal
  canWithdraw: boolean;
  withdrawnAt?: Timestamp;
  withdrawalReason?: string;
  
  // Data Retention
  dataRetentionPeriod: number; // Days
  autoDeleteAt: Timestamp;
  
  // Compliance
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  localLawCompliant: boolean;
  
  // Audit Trail
  auditTrail: ConsentAuditEntry[];
}

/**
 * Consent audit entry
 */
export interface ConsentAuditEntry {
  action: 'given' | 'updated' | 'withdrawn' | 'expired' | 'renewed';
  timestamp: Timestamp;
  source: string;
  details: string;
  ipAddress: string;
  userAgent: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Contact list response
 */
export interface ContactListResponse {
  contacts: ContactForm[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: ContactFilters;
  summary: ContactSummary;
}

/**
 * Filters for contact queries
 */
export interface ContactFilters {
  // Date Range
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  
  // Status
  status?: ContactStatus[];
  
  // Type and Category
  formType?: ContactFormType[];
  category?: ContactCategory[];
  priority?: ContactPriority[];
  
  // Department and Assignment
  department?: ContactDepartment[];
  assignedTo?: ID[];
  
  // Customer Type
  customerType?: ('individual' | 'business' | 'wholesale' | 'retail' | 'government')[];
  
  // Source
  source?: ContactSource[];
  
  // Response Status
  hasResponse?: boolean;
  isResolved?: boolean;
  
  // Search
  searchTerm?: string;
  searchFields?: ('subject' | 'message' | 'sender_name' | 'sender_email')[];
  
  // Sorting
  sortBy?: 'created_at' | 'updated_at' | 'priority' | 'status' | 'response_time';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Contact summary statistics
 */
export interface ContactSummary {
  // Volume
  totalContacts: number;
  newContacts: number;
  resolvedContacts: number;
  pendingContacts: number;
  
  // Response Times
  averageResponseTime: number;
  averageResolutionTime: number;
  
  // Satisfaction
  averageSatisfaction: number;
  npsScore: number;
  
  // Categories
  topCategories: {
    category: ContactCategory;
    count: number;
    percentage: number;
  }[];
  
  // Trends
  trends: {
    contactVolume: 'increasing' | 'decreasing' | 'stable';
    responseTime: 'improving' | 'declining' | 'stable';
    satisfaction: 'improving' | 'declining' | 'stable';
  };
  
  // Performance
  slaCompliance: number; // Percentage
  firstContactResolution: number; // Percentage
  escalationRate: number; // Percentage
}

/**
 * Support ticket list response
 */
export interface TicketListResponse {
  tickets: SupportTicket[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: TicketFilters;
  summary: TicketSummary;
}

/**
 * Filters for ticket queries
 */
export interface TicketFilters extends ContactFilters {
  // Ticket-specific filters
  ticketNumber?: string;
  severity?: TicketSeverity[];
  type?: TicketType[];
  
  // SLA Status
  slaStatus?: ('within_sla' | 'sla_risk' | 'sla_breach')[];
  
  // Escalation
  isEscalated?: boolean;
  escalationLevel?: number[];
  
  // Tags
  tags?: string[];
  labels?: ID[];
  
  // Time Tracking
  hasTimeTracking?: boolean;
  timeSpentRange?: {
    min: number;
    max: number;
  };
}

/**
 * Ticket summary statistics
 */
export interface TicketSummary extends ContactSummary {
  // Ticket-specific metrics
  averageTicketsPerCustomer: number;
  reopenRate: number;
  escalationRate: number;
  
  // SLA Performance
  slaResponseCompliance: number;
  slaResolutionCompliance: number;
  
  // Agent Performance
  agentPerformance: {
    agentId: ID;
    agentName: string;
    ticketsHandled: number;
    averageResolutionTime: number;
    satisfactionScore: number;
  }[];
  
  // Category Performance
  categoryPerformance: {
    category: TicketCategory;
    volume: number;
    averageResolutionTime: number;
    satisfactionScore: number;
    slaCompliance: number;
  }[];
}

// All types are exported inline
export default ContactForm;
