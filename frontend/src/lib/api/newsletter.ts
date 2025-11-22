import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { httpClient } from './client';
import { endpoints } from './endpoints';
import { ApiResponse } from './types';

// Newsletter Subscription Types
export interface NewsletterSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  
  // Subscription Management
  status: 'active' | 'inactive' | 'unsubscribed' | 'pending' | 'bounced' | 'complained';
  subscriptionDate: Date;
  confirmationDate?: Date;
  unsubscribeDate?: Date;
  lastEmailDate?: Date;
  
  // Preferences & Segmentation
  preferences: {
    categories: string[];
    frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
    format: 'html' | 'text' | 'both';
    language: string;
    timezone: string;
  };
  
  // Demographics & Targeting
  demographics: {
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    location?: {
      country: string;
      state?: string;
      city?: string;
      postalCode?: string;
    };
    interests: string[];
    customerType?: 'prospect' | 'customer' | 'vip' | 'inactive';
  };
  
  // Engagement Tracking
  engagement: {
    totalEmails: number;
    openRate: number;
    clickRate: number;
    lastOpenDate?: Date;
    lastClickDate?: Date;
    engagementScore: number;
    averageOpenTime: number;
    preferredSendTime?: string;
  };
  
  // Technical Data
  source: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  
  // Compliance & Privacy
  gdprConsent: boolean;
  marketingConsent: boolean;
  dataProcessingConsent: boolean;
  consentDate: Date;
  consentMethod: 'opt-in' | 'double-opt-in' | 'imported' | 'api';
  
  // Custom Fields
  customFields: Record<string, unknown>;
  tags: string[];
  
  // System Fields
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Newsletter Campaign Types
export interface NewsletterCampaign {
  id: string;
  name: string;
  subject: string;
  preheader?: string;
  content: {
    html: string;
    text: string;
    template?: string;
    design: Record<string, unknown>;
  };
  
  // Scheduling & Automation
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled' | 'failed';
  sendDate?: Date;
  timezone: string;
  isAutomated: boolean;
  automationTrigger?: {
    type: 'welcome' | 'birthday' | 'anniversary' | 'abandoned-cart' | 'purchase' | 'custom';
    delay?: number;
    conditions: Record<string, unknown>;
  };
  
  // Targeting & Segmentation
  audience: {
    segmentIds: string[];
    filterCriteria: Record<string, unknown>;
    excludeSegments?: string[];
    testGroup?: {
      percentage: number;
      type: 'random' | 'engagement' | 'demographics';
    };
  };
  
  // A/B Testing
  abTest?: {
    enabled: boolean;
    type: 'subject' | 'content' | 'send-time' | 'from-name';
    variants: {
      id: string;
      name: string;
      percentage: number;
      subject?: string;
      content?: string;
      fromName?: string;
      sendTime?: string;
    }[];
    testDuration: number;
    winnerCriteria: 'open-rate' | 'click-rate' | 'conversion-rate';
    winnerSelected?: string;
  };
  
  // Performance & Analytics
  stats: {
    totalSent: number;
    delivered: number;
    bounced: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    complained: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
    complaintRate: number;
    revenue?: number;
    conversions?: number;
  };
  
  // Configuration
  settings: {
    fromName: string;
    fromEmail: string;
    replyTo?: string;
    trackOpens: boolean;
    trackClicks: boolean;
    trackConversions: boolean;
    enableUnsubscribe: boolean;
    customUnsubscribeUrl?: string;
    enableSocialSharing: boolean;
    enableForwarding: boolean;
  };
  
  // System Fields
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
}

// Newsletter Template Types
export interface NewsletterTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'welcome' | 'promotional' | 'newsletter' | 'transactional' | 'event' | 'seasonal' | 'custom';
  type: 'basic' | 'advanced' | 'premium';
  
  // Template Structure
  structure: {
    layout: 'single-column' | 'two-column' | 'three-column' | 'mixed';
    sections: {
      id: string;
      type: 'header' | 'hero' | 'content' | 'product' | 'cta' | 'footer' | 'social';
      content: Record<string, unknown>;
      styling: Record<string, unknown>;
    }[];
  };
  
  // Design & Styling
  design: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    fonts: {
      heading: string;
      body: string;
      sizes: Record<string, string>;
    };
    spacing: Record<string, string>;
    borderRadius: string;
    customCSS?: string;
  };
  
  // Content & Variables
  content: {
    html: string;
    text: string;
    variables: {
      name: string;
      type: 'text' | 'image' | 'link' | 'product' | 'custom';
      defaultValue?: string;
      required: boolean;
    }[];
  };
  
  // Usage & Performance
  usage: {
    timesUsed: number;
    lastUsed?: Date;
    avgOpenRate: number;
    avgClickRate: number;
    avgConversionRate: number;
    rating: number;
    reviews: number;
  };
  
  // Compatibility & Requirements
  compatibility: {
    emailClients: string[];
    devices: ('desktop' | 'mobile' | 'tablet')[];
    darkMode: boolean;
    accessibility: boolean;
  };
  
  // Preview & Testing
  preview: {
    desktop: string;
    mobile: string;
    darkMode?: string;
  };
  
  // System Fields
  isPublic: boolean;
  isSystem: boolean;
  status: 'active' | 'inactive' | 'deprecated';
  version: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Newsletter Segment Types
export interface NewsletterSegment {
  id: string;
  name: string;
  description?: string;
  
  // Segmentation Rules
  criteria: {
    conditions: {
      field: string;
      operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'greater-than' | 'less-than' | 'in' | 'not-in';
      value: unknown;
      logicalOperator?: 'AND' | 'OR';
    }[];
    customFilters?: Record<string, unknown>;
  };
  
  // Segment Statistics
  stats: {
    totalSubscribers: number;
    activeSubscribers: number;
    avgOpenRate: number;
    avgClickRate: number;
    growthRate: number;
    lastUpdated: Date;
  };
  
  // Automation & Campaigns
  associatedCampaigns: string[];
  automationRules: {
    addTriggers: string[];
    removeTriggers: string[];
    actions: Record<string, unknown>;
  };
  
  // System Fields
  isActive: boolean;
  isDynamic: boolean;
  lastCalculated: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Newsletter Analytics Types
export interface NewsletterAnalytics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  
  // Overall Performance
  overview: {
    totalSubscribers: number;
    activeSubscribers: number;
    totalCampaigns: number;
    emailsSent: number;
    avgOpenRate: number;
    avgClickRate: number;
    avgUnsubscribeRate: number;
    revenue: number;
    conversions: number;
    roi: number;
  };
  
  // Growth Metrics
  growth: {
    newSubscribers: number;
    unsubscribes: number;
    netGrowth: number;
    growthRate: number;
    churnRate: number;
  };
  
  // Engagement Analysis
  engagement: {
    topPerformingCampaigns: Array<{
      id: string;
      name: string;
      openRate: number;
      clickRate: number;
      conversions: number;
    }>;
    engagementTrends: Array<{
      date: string;
      opens: number;
      clicks: number;
      conversions: number;
    }>;
    deviceBreakdown: Record<string, number>;
    locationBreakdown: Record<string, number>;
  };
  
  // Revenue Analytics
  revenue: {
    totalRevenue: number;
    revenuePerEmail: number;
    revenuePerSubscriber: number;
    conversionValue: number;
    campaignROI: Array<{
      campaignId: string;
      name: string;
      cost: number;
      revenue: number;
      roi: number;
    }>;
  };
}

// Additional Type Interfaces for TypeScript Safety
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AnalyticsDataPoint {
  date: string;
  value: number;
  metric: string;
  additionalData?: Record<string, unknown>;
}

export interface EngagementMetric {
  metric: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CampaignPerformance {
  campaignId: string;
  name: string;
  metrics: Record<string, number>;
  comparison: Record<string, number>;
}

export interface SubscriberActivity {
  subscriberId: string;
  email: string;
  activity: 'subscribed' | 'unsubscribed' | 'opened' | 'clicked' | 'bounced' | 'complained';
  timestamp: Date;
  campaignId?: string;
  details?: Record<string, unknown>;
}

export interface EmailValidationResult {
  email: string;
  isValid: boolean;
  reason?: string;
  suggestions?: string[];
  riskScore: number;
}

export interface ListCleaningResult {
  totalProcessed: number;
  validEmails: number;
  invalidEmails: number;
  riskyEmails: number;
  duplicates: number;
  removedEmails: string[];
  warnings: string[];
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: string;
  steps: Array<{
    id: string;
    type: 'email' | 'wait' | 'condition' | 'action';
    config: Record<string, unknown>;
  }>;
  status: 'active' | 'inactive' | 'draft';
  stats: {
    triggered: number;
    completed: number;
    conversionRate: number;
  };
}

export interface DeliverabilityReport {
  overall: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  score: number;
  factors: {
    authentication: number;
    reputation: number;
    content: number;
    engagement: number;
  };
  recommendations: string[];
  issues: Array<{
    type: 'warning' | 'error';
    message: string;
    impact: 'low' | 'medium' | 'high';
    solution: string;
  }>;
}

// API Parameter Types
interface NewsletterListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string[];
  segmentId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface SubscriberFilters {
  status?: NewsletterSubscriber['status'][];
  segments?: string[];
  engagement?: 'high' | 'medium' | 'low';
  source?: string[];
  location?: string;
  signupDateFrom?: string;
  signupDateTo?: string;
  lastActivityFrom?: string;
  lastActivityTo?: string;
}

interface CampaignFilters {
  status?: NewsletterCampaign['status'][];
  type?: string[];
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  performance?: 'high' | 'medium' | 'low';
}

interface TemplateFilters {
  category?: NewsletterTemplate['category'][];
  type?: NewsletterTemplate['type'];
  isPublic?: boolean;
  rating?: number;
  compatibility?: string[];
}

// Newsletter API Service Class
class NewsletterApi {
  // Subscriber Management
  async getSubscribers(params?: NewsletterListParams & SubscriberFilters) {
    const response = await httpClient.get<ApiResponse<{ items: NewsletterSubscriber[]; pagination: PaginationInfo }>>(
      endpoints.newsletter.subscribers.list,
      { params }
    );
    return response.data;
  }

  async getSubscriber(id: string) {
    const response = await httpClient.get<ApiResponse<NewsletterSubscriber>>(
      endpoints.newsletter.subscribers.byId(id)
    );
    return response.data;
  }

  async createSubscriber(data: Partial<NewsletterSubscriber>) {
    const response = await httpClient.post<ApiResponse<NewsletterSubscriber>>(
      endpoints.newsletter.subscribers.create,
      data
    );
    return response.data;
  }

  async updateSubscriber(id: string, data: Partial<NewsletterSubscriber>) {
    const response = await httpClient.put<ApiResponse<NewsletterSubscriber>>(
      endpoints.newsletter.subscribers.update(id),
      data
    );
    return response.data;
  }

  async deleteSubscriber(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.newsletter.subscribers.delete(id)
    );
    return response.data;
  }

  async subscribeEmail(email: string, data?: Partial<NewsletterSubscriber>) {
    const response = await httpClient.post<ApiResponse<NewsletterSubscriber>>(
      endpoints.newsletter.subscribe,
      { email, ...data }
    );
    return response.data;
  }

  async unsubscribeEmail(email: string, reason?: string) {
    const response = await httpClient.post<ApiResponse<void>>(
      endpoints.newsletter.unsubscribe,
      { email, reason }
    );
    return response.data;
  }

  async confirmSubscription(token: string) {
    const response = await httpClient.post<ApiResponse<NewsletterSubscriber>>(
      endpoints.newsletter.confirm,
      { token }
    );
    return response.data;
  }

  async updatePreferences(id: string, preferences: Partial<NewsletterSubscriber['preferences']>) {
    const response = await httpClient.patch<ApiResponse<NewsletterSubscriber>>(
      endpoints.newsletter.subscribers.preferences(id),
      preferences
    );
    return response.data;
  }

  // Bulk Subscriber Operations
  async bulkSubscriberOperation(
    operation: 'delete' | 'update' | 'segment' | 'export',
    subscriberIds: string[],
    data?: Record<string, unknown>
  ) {
    const response = await httpClient.post<ApiResponse<{
      success: number;
      failed: number;
      errors: string[];
    }>>(
      endpoints.newsletter.subscribers.bulk,
      { operation, subscriberIds, data }
    );
    return response.data;
  }

  async importSubscribers(file: File, mapping: Record<string, string>, options?: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
    segmentId?: string;
    sendWelcome?: boolean;
  }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await httpClient.post<ApiResponse<{
      imported: number;
      skipped: number;
      errors: string[];
    }>>(
      endpoints.newsletter.subscribers.import,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }

  async exportSubscribers(params?: SubscriberFilters & {
    format?: 'csv' | 'xlsx' | 'json';
    fields?: string[];
  }) {
    const response = await httpClient.get(
      endpoints.newsletter.subscribers.export,
      { params, responseType: 'blob' }
    );
    return response.data;
  }

  // Campaign Management
  async getCampaigns(params?: NewsletterListParams & CampaignFilters) {
    const response = await httpClient.get<ApiResponse<{ items: NewsletterCampaign[]; pagination: PaginationInfo }>>(
      endpoints.newsletter.campaigns.list,
      { params }
    );
    return response.data;
  }

  async getCampaign(id: string) {
    const response = await httpClient.get<ApiResponse<NewsletterCampaign>>(
      endpoints.newsletter.campaigns.byId(id)
    );
    return response.data;
  }

  async createCampaign(data: Partial<NewsletterCampaign>) {
    const response = await httpClient.post<ApiResponse<NewsletterCampaign>>(
      endpoints.newsletter.campaigns.create,
      data
    );
    return response.data;
  }

  async updateCampaign(id: string, data: Partial<NewsletterCampaign>) {
    const response = await httpClient.put<ApiResponse<NewsletterCampaign>>(
      endpoints.newsletter.campaigns.update(id),
      data
    );
    return response.data;
  }

  async deleteCampaign(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.newsletter.campaigns.delete(id)
    );
    return response.data;
  }

  async duplicateCampaign(id: string, name?: string) {
    const response = await httpClient.post<ApiResponse<NewsletterCampaign>>(
      endpoints.newsletter.campaigns.duplicate(id),
      { name }
    );
    return response.data;
  }

  // Campaign Operations
  async sendCampaign(id: string, options?: {
    sendTime?: Date;
    testEmails?: string[];
    testPercentage?: number;
  }) {
    const response = await httpClient.post<ApiResponse<{
      campaignId: string;
      scheduled: boolean;
      estimatedSendTime: Date;
      recipientCount: number;
    }>>(
      endpoints.newsletter.campaigns.send(id),
      options
    );
    return response.data;
  }

  async pauseCampaign(id: string) {
    const response = await httpClient.patch<ApiResponse<NewsletterCampaign>>(
      endpoints.newsletter.campaigns.pause(id)
    );
    return response.data;
  }

  async resumeCampaign(id: string) {
    const response = await httpClient.patch<ApiResponse<NewsletterCampaign>>(
      endpoints.newsletter.campaigns.resume(id)
    );
    return response.data;
  }

  async cancelCampaign(id: string) {
    const response = await httpClient.patch<ApiResponse<NewsletterCampaign>>(
      endpoints.newsletter.campaigns.cancel(id)
    );
    return response.data;
  }

  async testCampaign(id: string, testEmails: string[]) {
    const response = await httpClient.post<ApiResponse<{
      sent: number;
      failed: number;
      errors: string[];
    }>>(
      endpoints.newsletter.campaigns.test(id),
      { emails: testEmails }
    );
    return response.data;
  }

  // A/B Testing
  async createAbTest(campaignId: string, testConfig: NewsletterCampaign['abTest']) {
    const response = await httpClient.post<ApiResponse<NewsletterCampaign>>(
      endpoints.newsletter.abTest.create,
      { campaignId, ...testConfig }
    );
    return response.data;
  }

  async getAbTestResults(campaignId: string) {
    const response = await httpClient.get<ApiResponse<{
      testId: string;
      status: string;
      variants: Array<{
        id: string;
        name: string;
        metrics: Record<string, number>;
        performance: number;
      }>;
      winner?: string;
      confidence: number;
      recommendations: string[];
    }>>(
      endpoints.newsletter.abTest.results(campaignId)
    );
    return response.data;
  }

  async selectAbTestWinner(campaignId: string, winnerVariantId: string) {
    const response = await httpClient.post<ApiResponse<NewsletterCampaign>>(
      endpoints.newsletter.abTest.selectWinner,
      { campaignId, winnerVariantId }
    );
    return response.data;
  }

  // Template Management
  async getTemplates(params?: NewsletterListParams & TemplateFilters) {
    const response = await httpClient.get<ApiResponse<{ items: NewsletterTemplate[]; pagination: PaginationInfo }>>(
      endpoints.newsletter.templates.list,
      { params }
    );
    return response.data;
  }

  async getTemplate(id: string) {
    const response = await httpClient.get<ApiResponse<NewsletterTemplate>>(
      endpoints.newsletter.templates.byId(id)
    );
    return response.data;
  }

  async createTemplate(data: Partial<NewsletterTemplate>) {
    const response = await httpClient.post<ApiResponse<NewsletterTemplate>>(
      endpoints.newsletter.templates.create,
      data
    );
    return response.data;
  }

  async updateTemplate(id: string, data: Partial<NewsletterTemplate>) {
    const response = await httpClient.put<ApiResponse<NewsletterTemplate>>(
      endpoints.newsletter.templates.update(id),
      data
    );
    return response.data;
  }

  async deleteTemplate(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.newsletter.templates.delete(id)
    );
    return response.data;
  }

  async duplicateTemplate(id: string, name?: string) {
    const response = await httpClient.post<ApiResponse<NewsletterTemplate>>(
      endpoints.newsletter.templates.duplicate(id),
      { name }
    );
    return response.data;
  }

  async previewTemplate(id: string, variables?: Record<string, unknown>) {
    const response = await httpClient.post<ApiResponse<{
      html: string;
      text: string;
      subject?: string;
    }>>(
      endpoints.newsletter.templates.preview(id),
      { variables }
    );
    return response.data;
  }

  // Segment Management
  async getSegments(params?: NewsletterListParams) {
    const response = await httpClient.get<ApiResponse<{ items: NewsletterSegment[]; pagination: PaginationInfo }>>(
      endpoints.newsletter.segments.list,
      { params }
    );
    return response.data;
  }

  async getSegment(id: string) {
    const response = await httpClient.get<ApiResponse<NewsletterSegment>>(
      endpoints.newsletter.segments.byId(id)
    );
    return response.data;
  }

  async createSegment(data: Partial<NewsletterSegment>) {
    const response = await httpClient.post<ApiResponse<NewsletterSegment>>(
      endpoints.newsletter.segments.create,
      data
    );
    return response.data;
  }

  async updateSegment(id: string, data: Partial<NewsletterSegment>) {
    const response = await httpClient.put<ApiResponse<NewsletterSegment>>(
      endpoints.newsletter.segments.update(id),
      data
    );
    return response.data;
  }

  async deleteSegment(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.newsletter.segments.delete(id)
    );
    return response.data;
  }

  async refreshSegment(id: string) {
    const response = await httpClient.post<ApiResponse<{
      segmentId: string;
      subscribersCount: number;
      changes: {
        added: number;
        removed: number;
      };
    }>>(
      endpoints.newsletter.segments.refresh(id)
    );
    return response.data;
  }

  async getSegmentSubscribers(id: string, params?: NewsletterListParams) {
    const response = await httpClient.get<ApiResponse<{ items: NewsletterSubscriber[]; pagination: PaginationInfo }>>(
      endpoints.newsletter.segments.subscribers(id),
      { params }
    );
    return response.data;
  }

  // Analytics & Reporting
  async getAnalytics(params?: {
    period?: NewsletterAnalytics['period'];
    dateFrom?: string;
    dateTo?: string;
    campaignIds?: string[];
    segmentIds?: string[];
  }) {
    const response = await httpClient.get<ApiResponse<NewsletterAnalytics>>(
      endpoints.newsletter.analytics,
      { params }
    );
    return response.data;
  }

  async getCampaignAnalytics(campaignId: string) {
    const response = await httpClient.get<ApiResponse<{
      campaign: NewsletterCampaign;
      performance: {
        timeline: AnalyticsDataPoint[];
        engagement: EngagementMetric[];
        demographics: Record<string, number>;
        devices: Record<string, number>;
        locations: Record<string, number>;
      };
      comparison: {
        industry: Record<string, number>;
        previous: Record<string, number>;
      };
      recommendations: string[];
    }>>(
      endpoints.newsletter.campaigns.analytics(campaignId)
    );
    return response.data;
  }

  async getReports(type: 'performance' | 'growth' | 'engagement' | 'revenue', params?: {
    period?: string;
    dateFrom?: string;
    dateTo?: string;
    format?: 'json' | 'csv' | 'pdf';
  }) {
    const response = await httpClient.get<ApiResponse<{
      type: string;
      data: AnalyticsDataPoint[];
      summary: Record<string, number>;
      insights: string[];
    }>>(
      endpoints.newsletter.reports[type],
      { params }
    );
    return response.data;
  }

  // Automation & Workflows
  async getAutomations(params?: NewsletterListParams) {
    const response = await httpClient.get<ApiResponse<{ items: AutomationWorkflow[]; pagination: PaginationInfo }>>(
      endpoints.newsletter.automations.list,
      { params }
    );
    return response.data;
  }

  async createAutomation(data: Partial<AutomationWorkflow>) {
    const response = await httpClient.post<ApiResponse<AutomationWorkflow>>(
      endpoints.newsletter.automations.create,
      data
    );
    return response.data;
  }

  async updateAutomation(id: string, data: Partial<AutomationWorkflow>) {
    const response = await httpClient.put<ApiResponse<AutomationWorkflow>>(
      endpoints.newsletter.automations.update(id),
      data
    );
    return response.data;
  }

  async toggleAutomation(id: string, active: boolean) {
    const response = await httpClient.patch<ApiResponse<AutomationWorkflow>>(
      endpoints.newsletter.automations.toggle(id),
      { active }
    );
    return response.data;
  }

  // Email Validation & List Cleaning
  async validateEmail(email: string) {
    const response = await httpClient.post<ApiResponse<EmailValidationResult>>(
      endpoints.newsletter.validation.email,
      { email }
    );
    return response.data;
  }

  async cleanList(segmentId?: string, options?: {
    removeInvalid?: boolean;
    removeRisky?: boolean;
    removeDuplicates?: boolean;
    removeInactive?: boolean;
    inactiveDays?: number;
  }) {
    const response = await httpClient.post<ApiResponse<ListCleaningResult>>(
      endpoints.newsletter.validation.cleanList,
      { segmentId, options }
    );
    return response.data;
  }

  // Deliverability & Compliance
  async getDeliverabilityReport() {
    const response = await httpClient.get<ApiResponse<DeliverabilityReport>>(
      endpoints.newsletter.deliverability.report
    );
    return response.data;
  }

  async checkCompliance(campaignId: string, checks?: string[]) {
    const response = await httpClient.post<ApiResponse<{
      compliant: boolean;
      issues: Array<{
        type: 'error' | 'warning';
        regulation: string;
        message: string;
        suggestions: string[];
      }>;
      score: number;
    }>>(
      endpoints.newsletter.compliance.check,
      { campaignId, checks }
    );
    return response.data;
  }

  // Search & Advanced Filtering
  async searchSubscribers(query: string, filters?: SubscriberFilters) {
    const response = await httpClient.get<ApiResponse<{ items: NewsletterSubscriber[]; pagination: PaginationInfo }>>(
      endpoints.newsletter.search,
      { params: { q: query, ...filters } }
    );
    return response.data;
  }

  // Activity & Engagement Tracking
  async getSubscriberActivity(subscriberId: string, params?: {
    limit?: number;
    activityType?: SubscriberActivity['activity'][];
    dateFrom?: string;
    dateTo?: string;
  }) {
    const response = await httpClient.get<ApiResponse<{ items: SubscriberActivity[]; pagination: PaginationInfo }>>(
      endpoints.newsletter.subscribers.activity(subscriberId),
      { params }
    );
    return response.data;
  }

  async trackEvent(subscriberId: string, event: {
    type: 'open' | 'click' | 'conversion' | 'custom';
    campaignId?: string;
    url?: string;
    value?: number;
    metadata?: Record<string, unknown>;
  }) {
    const response = await httpClient.post<ApiResponse<void>>(
      endpoints.newsletter.tracking.event,
      { subscriberId, ...event }
    );
    return response.data;
  }
}

// Create API instance
const newsletterApi = new NewsletterApi();

// React Query Hooks

// Subscriber Hooks
export const useSubscribers = (params?: NewsletterListParams & SubscriberFilters) => {
  return useQuery({
    queryKey: ['newsletter', 'subscribers', 'list', params],
    queryFn: () => newsletterApi.getSubscribers(params),
    enabled: true,
  });
};

export const useInfiniteSubscribers = (params?: NewsletterListParams & SubscriberFilters) => {
  return useInfiniteQuery({
    queryKey: ['newsletter', 'subscribers', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => newsletterApi.getSubscribers({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data?.pagination) return undefined;
      const { pagination } = lastPage.data;
      return pagination.hasNext ? pagination.page + 1 : undefined;
    },
  });
};

export const useSubscriber = (id: string) => {
  return useQuery({
    queryKey: ['newsletter', 'subscribers', 'detail', id],
    queryFn: () => newsletterApi.getSubscriber(id),
    enabled: !!id,
  });
};

export const useCreateSubscriber = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<NewsletterSubscriber>) => newsletterApi.createSubscriber(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'analytics'] });
    },
  });
};

export const useUpdateSubscriber = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewsletterSubscriber> }) =>
      newsletterApi.updateSubscriber(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'subscribers', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'analytics'] });
    },
  });
};

export const useDeleteSubscriber = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => newsletterApi.deleteSubscriber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'analytics'] });
    },
  });
};

export const useSubscribeEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, data }: { email: string; data?: Partial<NewsletterSubscriber> }) =>
      newsletterApi.subscribeEmail(email, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'analytics'] });
    },
  });
};

export const useUnsubscribeEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, reason }: { email: string; reason?: string }) =>
      newsletterApi.unsubscribeEmail(email, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'analytics'] });
    },
  });
};

export const useConfirmSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (token: string) => newsletterApi.confirmSubscription(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'analytics'] });
    },
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, preferences }: { id: string; preferences: Partial<NewsletterSubscriber['preferences']> }) =>
      newsletterApi.updatePreferences(id, preferences),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'subscribers', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'subscribers'] });
    },
  });
};

// Bulk Operations Hooks
export const useBulkSubscriberOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ operation, subscriberIds, data }: {
      operation: 'delete' | 'update' | 'segment' | 'export';
      subscriberIds: string[];
      data?: Record<string, unknown>;
    }) => newsletterApi.bulkSubscriberOperation(operation, subscriberIds, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'analytics'] });
    },
  });
};

export const useImportSubscribers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, mapping, options }: {
      file: File;
      mapping: Record<string, string>;
      options?: {
        skipDuplicates?: boolean;
        updateExisting?: boolean;
        segmentId?: string;
        sendWelcome?: boolean;
      };
    }) => newsletterApi.importSubscribers(file, mapping, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'analytics'] });
    },
  });
};

export const useExportSubscribers = () => {
  return useMutation({
    mutationFn: (params?: SubscriberFilters & {
      format?: 'csv' | 'xlsx' | 'json';
      fields?: string[];
    }) => newsletterApi.exportSubscribers(params),
  });
};

// Campaign Hooks
export const useCampaigns = (params?: NewsletterListParams & CampaignFilters) => {
  return useQuery({
    queryKey: ['newsletter', 'campaigns', 'list', params],
    queryFn: () => newsletterApi.getCampaigns(params),
    enabled: true,
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['newsletter', 'campaigns', 'detail', id],
    queryFn: () => newsletterApi.getCampaign(id),
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<NewsletterCampaign>) => newsletterApi.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'campaigns'] });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewsletterCampaign> }) =>
      newsletterApi.updateCampaign(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'campaigns', 'detail', id] });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => newsletterApi.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'campaigns'] });
    },
  });
};

export const useDuplicateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      newsletterApi.duplicateCampaign(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'campaigns'] });
    },
  });
};

// Campaign Operations Hooks
export const useSendCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, options }: {
      id: string;
      options?: {
        sendTime?: Date;
        testEmails?: string[];
        testPercentage?: number;
      };
    }) => newsletterApi.sendCampaign(id, options),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'campaigns', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'analytics'] });
    },
  });
};

export const usePauseCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => newsletterApi.pauseCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'campaigns', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'campaigns'] });
    },
  });
};

export const useResumeCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => newsletterApi.resumeCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'campaigns', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'campaigns'] });
    },
  });
};

export const useCancelCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => newsletterApi.cancelCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'campaigns', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'campaigns'] });
    },
  });
};

export const useTestCampaign = () => {
  return useMutation({
    mutationFn: ({ id, testEmails }: { id: string; testEmails: string[] }) =>
      newsletterApi.testCampaign(id, testEmails),
  });
};

// A/B Testing Hooks
export const useCreateAbTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ campaignId, testConfig }: {
      campaignId: string;
      testConfig: NewsletterCampaign['abTest'];
    }) => newsletterApi.createAbTest(campaignId, testConfig),
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'campaigns', 'detail', campaignId] });
    },
  });
};

export const useAbTestResults = (campaignId: string) => {
  return useQuery({
    queryKey: ['newsletter', 'abtest', 'results', campaignId],
    queryFn: () => newsletterApi.getAbTestResults(campaignId),
    enabled: !!campaignId,
  });
};

export const useSelectAbTestWinner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ campaignId, winnerVariantId }: {
      campaignId: string;
      winnerVariantId: string;
    }) => newsletterApi.selectAbTestWinner(campaignId, winnerVariantId),
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'campaigns', 'detail', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'abtest', 'results', campaignId] });
    },
  });
};

// Template Hooks
export const useTemplates = (params?: NewsletterListParams & TemplateFilters) => {
  return useQuery({
    queryKey: ['newsletter', 'templates', 'list', params],
    queryFn: () => newsletterApi.getTemplates(params),
    enabled: true,
  });
};

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ['newsletter', 'templates', 'detail', id],
    queryFn: () => newsletterApi.getTemplate(id),
    enabled: !!id,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<NewsletterTemplate>) => newsletterApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'templates'] });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewsletterTemplate> }) =>
      newsletterApi.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'templates'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'templates', 'detail', id] });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => newsletterApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'templates'] });
    },
  });
};

export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      newsletterApi.duplicateTemplate(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'templates'] });
    },
  });
};

export const usePreviewTemplate = () => {
  return useMutation({
    mutationFn: ({ id, variables }: { id: string; variables?: Record<string, unknown> }) =>
      newsletterApi.previewTemplate(id, variables),
  });
};

// Segment Hooks
export const useSegments = (params?: NewsletterListParams) => {
  return useQuery({
    queryKey: ['newsletter', 'segments', 'list', params],
    queryFn: () => newsletterApi.getSegments(params),
    enabled: true,
  });
};

export const useSegment = (id: string) => {
  return useQuery({
    queryKey: ['newsletter', 'segments', 'detail', id],
    queryFn: () => newsletterApi.getSegment(id),
    enabled: !!id,
  });
};

export const useCreateSegment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<NewsletterSegment>) => newsletterApi.createSegment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'segments'] });
    },
  });
};

export const useUpdateSegment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewsletterSegment> }) =>
      newsletterApi.updateSegment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'segments'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'segments', 'detail', id] });
    },
  });
};

export const useDeleteSegment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => newsletterApi.deleteSegment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'segments'] });
    },
  });
};

export const useRefreshSegment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => newsletterApi.refreshSegment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'segments', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'segments'] });
    },
  });
};

export const useSegmentSubscribers = (id: string, params?: NewsletterListParams) => {
  return useQuery({
    queryKey: ['newsletter', 'segments', 'subscribers', id, params],
    queryFn: () => newsletterApi.getSegmentSubscribers(id, params),
    enabled: !!id,
  });
};

// Analytics Hooks
export const useNewsletterAnalytics = (params?: {
  period?: NewsletterAnalytics['period'];
  dateFrom?: string;
  dateTo?: string;
  campaignIds?: string[];
  segmentIds?: string[];
}) => {
  return useQuery({
    queryKey: ['newsletter', 'analytics', params],
    queryFn: () => newsletterApi.getAnalytics(params),
    enabled: true,
  });
};

export const useCampaignAnalytics = (campaignId: string) => {
  return useQuery({
    queryKey: ['newsletter', 'campaigns', 'analytics', campaignId],
    queryFn: () => newsletterApi.getCampaignAnalytics(campaignId),
    enabled: !!campaignId,
  });
};

export const useNewsletterReports = (type: 'performance' | 'growth' | 'engagement' | 'revenue', params?: {
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  format?: 'json' | 'csv' | 'pdf';
}) => {
  return useQuery({
    queryKey: ['newsletter', 'reports', type, params],
    queryFn: () => newsletterApi.getReports(type, params),
    enabled: true,
  });
};

// Automation Hooks
export const useAutomations = (params?: NewsletterListParams) => {
  return useQuery({
    queryKey: ['newsletter', 'automations', 'list', params],
    queryFn: () => newsletterApi.getAutomations(params),
    enabled: true,
  });
};

export const useCreateAutomation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<AutomationWorkflow>) => newsletterApi.createAutomation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'automations'] });
    },
  });
};

export const useUpdateAutomation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AutomationWorkflow> }) =>
      newsletterApi.updateAutomation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'automations'] });
    },
  });
};

export const useToggleAutomation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      newsletterApi.toggleAutomation(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'automations'] });
    },
  });
};

// Validation & Deliverability Hooks
export const useValidateEmail = () => {
  return useMutation({
    mutationFn: (email: string) => newsletterApi.validateEmail(email),
  });
};

export const useCleanList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ segmentId, options }: {
      segmentId?: string;
      options?: {
        removeInvalid?: boolean;
        removeRisky?: boolean;
        removeDuplicates?: boolean;
        removeInactive?: boolean;
        inactiveDays?: number;
      };
    }) => newsletterApi.cleanList(segmentId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'segments'] });
    },
  });
};

export const useDeliverabilityReport = () => {
  return useQuery({
    queryKey: ['newsletter', 'deliverability', 'report'],
    queryFn: () => newsletterApi.getDeliverabilityReport(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useCheckCompliance = () => {
  return useMutation({
    mutationFn: ({ campaignId, checks }: { campaignId: string; checks?: string[] }) =>
      newsletterApi.checkCompliance(campaignId, checks),
  });
};

// Search & Activity Hooks
export const useSearchSubscribers = (query: string, filters?: SubscriberFilters) => {
  return useQuery({
    queryKey: ['newsletter', 'search', 'subscribers', query, filters],
    queryFn: () => newsletterApi.searchSubscribers(query, filters),
    enabled: !!query.trim(),
  });
};

export const useSubscriberActivity = (subscriberId: string, params?: {
  limit?: number;
  activityType?: SubscriberActivity['activity'][];
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['newsletter', 'subscribers', 'activity', subscriberId, params],
    queryFn: () => newsletterApi.getSubscriberActivity(subscriberId, params),
    enabled: !!subscriberId,
  });
};

export const useTrackEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ subscriberId, event }: {
      subscriberId: string;
      event: {
        type: 'open' | 'click' | 'conversion' | 'custom';
        campaignId?: string;
        url?: string;
        value?: number;
        metadata?: Record<string, unknown>;
      };
    }) => newsletterApi.trackEvent(subscriberId, event),
    onSuccess: (_, { subscriberId }) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'subscribers', 'detail', subscriberId] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'subscribers', 'activity', subscriberId] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', 'analytics'] });
    },
  });
};

export default newsletterApi;
