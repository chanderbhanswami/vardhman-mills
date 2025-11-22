import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { httpClient } from './client';
import { endpoints } from './endpoints';
import { ApiResponse, PaginationParams } from './types';

// ==================== Hero/Banner Management System ====================

export interface Hero {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  content?: string;
  type: 'slider' | 'video' | 'image' | 'product' | 'category' | 'promotion' | 'announcement';
  status: 'active' | 'inactive' | 'scheduled' | 'expired' | 'archive';
  priority: number;
  position: 'home' | 'category' | 'product' | 'checkout' | 'account' | 'custom';
  placement: 'header' | 'main' | 'sidebar' | 'footer' | 'overlay' | 'inline';
  
  // Visual Content
  media: {
    image?: {
      desktop: string;
      tablet?: string;
      mobile?: string;
      webp?: string;
      alt: string;
    };
    video?: {
      url: string;
      poster?: string;
      autoplay?: boolean;
      loop?: boolean;
      muted?: boolean;
    };
    animation?: {
      type: 'fade' | 'slide' | 'zoom' | 'parallax' | 'ken-burns';
      duration: number;
      delay?: number;
      direction?: 'left' | 'right' | 'up' | 'down';
    };
  };
  
  // Call to Action
  cta?: {
    text: string;
    url: string;
    type: 'primary' | 'secondary' | 'ghost' | 'link';
    target: '_self' | '_blank';
    tracking?: {
      event: string;
      category: string;
      label?: string;
      value?: number;
    };
  };
  
  // Secondary CTA
  secondaryCta?: {
    text: string;
    url: string;
    type: 'primary' | 'secondary' | 'ghost' | 'link';
    target: '_self' | '_blank';
  };
  
  // Styling & Layout
  design: {
    theme: 'light' | 'dark' | 'brand' | 'custom';
    layout: 'left' | 'center' | 'right' | 'overlay' | 'split';
    height: 'auto' | 'full' | 'custom';
    customHeight?: string;
    backgroundColor?: string;
    textColor?: string;
    overlay?: {
      enabled: boolean;
      color?: string;
      opacity?: number;
      gradient?: {
        type: 'linear' | 'radial';
        colors: string[];
        direction?: string;
      };
    };
    borderRadius?: string;
    shadow?: boolean;
    border?: {
      enabled: boolean;
      color?: string;
      width?: string;
      style?: 'solid' | 'dashed' | 'dotted';
    };
  };
  
  // Content Positioning
  contentAlignment: {
    horizontal: 'left' | 'center' | 'right';
    vertical: 'top' | 'center' | 'bottom';
  };
  
  // Responsive Settings
  responsive: {
    hideOnMobile?: boolean;
    hideOnTablet?: boolean;
    hideOnDesktop?: boolean;
    mobileTitle?: string;
    mobileSubtitle?: string;
    mobileDescription?: string;
  };
  
  // Targeting & Display Rules
  targeting?: {
    audience?: {
      userTypes?: ('guest' | 'registered' | 'premium' | 'vip')[];
      locations?: string[];
      languages?: string[];
      devices?: ('desktop' | 'tablet' | 'mobile')[];
    };
    timing?: {
      startDate?: Date;
      endDate?: Date;
      timeZone?: string;
      schedule?: {
        days: number[];
        startTime: string;
        endTime: string;
      };
    };
    conditions?: {
      pageViews?: { min?: number; max?: number };
      sessionDuration?: { min?: number; max?: number };
      purchaseHistory?: boolean;
      cartValue?: { min?: number; max?: number };
      referrer?: string[];
    };
  };
  
  // A/B Testing
  abTest?: {
    enabled: boolean;
    testId?: string;
    variant?: string;
    trafficSplit?: number;
    goalMetric?: 'clicks' | 'conversions' | 'engagement' | 'revenue';
  };
  
  // Performance & Analytics
  analytics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
    engagement: number;
    revenue?: number;
    bounceRate?: number;
    timeOnPage?: number;
  };
  
  // SEO & Accessibility
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    canonicalUrl?: string;
    structuredData?: Record<string, unknown>;
  };
  
  accessibility: {
    ariaLabel?: string;
    ariaDescription?: string;
    focusable: boolean;
    keyboardNavigation: boolean;
    screenReaderFriendly: boolean;
  };
  
  // Interactive Features
  interactions?: {
    parallax?: {
      enabled: boolean;
      speed?: number;
      direction?: 'vertical' | 'horizontal';
    };
    hover?: {
      enabled: boolean;
      effect?: 'zoom' | 'fade' | 'slide' | 'rotate' | 'brightness';
      duration?: number;
    };
    autoplay?: {
      enabled: boolean;
      interval?: number;
      pauseOnHover?: boolean;
    };
  };
  
  // Dynamic Content
  dynamicContent?: {
    enabled: boolean;
    dataSource?: 'products' | 'categories' | 'blog' | 'promotions' | 'api';
    filters?: Record<string, unknown>;
    template?: string;
    refreshInterval?: number;
  };
  
  // Personalization
  personalization?: {
    enabled: boolean;
    rules?: {
      condition: string;
      content: Partial<Hero>;
      priority: number;
    }[];
    aiOptimized?: boolean;
    learningEnabled?: boolean;
  };
  
  // Multi-language Support
  translations?: {
    [languageCode: string]: {
      title?: string;
      subtitle?: string;
      description?: string;
      content?: string;
      cta?: { text?: string; url?: string };
      secondaryCta?: { text?: string; url?: string };
    };
  };
  
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  publishedAt?: Date;
  publishedBy?: string;
  version: number;
  isTemplate: boolean;
  templateName?: string;
}

export interface HeroTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'promotional' | 'seasonal' | 'product' | 'brand' | 'event' | 'custom';
  type: 'slider' | 'video' | 'image' | 'product' | 'category' | 'promotion';
  preview: {
    image: string;
    thumbnail: string;
  };
  design: Hero['design'];
  contentStructure: {
    hasTitle: boolean;
    hasSubtitle: boolean;
    hasDescription: boolean;
    hasContent: boolean;
    hasCta: boolean;
    hasSecondaryCta: boolean;
    customFields?: {
      name: string;
      type: 'text' | 'url' | 'image' | 'color' | 'number' | 'boolean';
      required: boolean;
      defaultValue?: unknown;
    }[];
  };
  responsive: Hero['responsive'];
  interactions?: Hero['interactions'];
  isPublic: boolean;
  isRecommended: boolean;
  usageCount: number;
  rating: number;
  reviews?: {
    count: number;
    average: number;
  };
  compatibility: {
    positions: string[];
    placements: string[];
    themes: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
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

export interface EngagementPoint {
  x: number;
  y: number;
  type: 'click' | 'hover' | 'scroll' | 'view';
  timestamp: number;
  duration?: number;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  interactions: number;
}

export interface AbTestVariant {
  id: string;
  name: string;
  heroId: string;
  traffic: number;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
  };
  status: 'active' | 'paused' | 'completed';
}

export interface AbTestData {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: AbTestVariant[];
  winner?: string;
  confidence: number;
  startDate: string;
  endDate?: string;
}

export interface AbTestResult {
  testId: string;
  winner: AbTestVariant;
  confidence: number;
  improvementPercent: number;
  significanceLevel: number;
  results: {
    variant: AbTestVariant;
    metrics: Record<string, number>;
    improvement: number;
  }[];
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  suggestions?: string[];
}

export interface ValidationReport {
  valid: boolean;
  score: number;
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
  report: {
    accessibility: number;
    performance: number;
    seo: number;
    bestPractices: number;
  };
}

export interface OptimizationSuggestion {
  type: 'performance' | 'accessibility' | 'seo' | 'engagement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export interface ComplianceCheck {
  regulation: string;
  status: 'compliant' | 'non-compliant' | 'warning';
  description: string;
  requirements: string[];
}

export interface ComplianceReport {
  overall: 'compliant' | 'non-compliant' | 'partial';
  score: number;
  compliance: ComplianceCheck[];
  violations: ValidationIssue[];
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  headers?: Record<string, string>;
}

export interface HeroSchedule {
  id: string;
  heroId: string;
  name: string;
  description?: string;
  type: 'one-time' | 'recurring' | 'conditional';
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'failed';
  
  // Scheduling Rules
  schedule: {
    startDate: Date;
    endDate?: Date;
    timeZone: string;
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
      interval: number;
      days?: number[];
      endAfter?: { occurrences?: number; date?: Date };
    };
    timeSlots?: {
      startTime: string;
      endTime: string;
      days: number[];
    }[];
  };
  
  // Actions
  actions: {
    onStart: ('activate' | 'publish' | 'notify' | 'track')[];
    onEnd: ('deactivate' | 'archive' | 'notify' | 'track')[];
    customActions?: {
      type: string;
      config: Record<string, unknown>;
    }[];
  };
  
  // Conditions
  conditions?: {
    weather?: string[];
    traffic?: { min?: number; max?: number };
    inventory?: { productId: string; min?: number };
    userBehavior?: Record<string, unknown>;
    customConditions?: Record<string, unknown>;
  };
  
  executionHistory: {
    executedAt: Date;
    action: string;
    status: 'success' | 'failed' | 'partial';
    result?: Record<string, unknown>;
    error?: string;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface HeroCampaign {
  id: string;
  name: string;
  description?: string;
  type: 'marketing' | 'seasonal' | 'product-launch' | 'brand' | 'event' | 'a-b-test';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  
  heroes: {
    heroId: string;
    variant?: string;
    trafficSplit?: number;
    position?: string;
    priority?: number;
  }[];
  
  // Campaign Configuration
  config: {
    budget?: number;
    spent?: number;
    maxImpressions?: number;
    maxClicks?: number;
    targetAudience?: {
      userTypes?: ('guest' | 'registered' | 'premium' | 'vip')[];
      locations?: string[];
      languages?: string[];
      devices?: ('mobile' | 'desktop' | 'tablet')[];
    };
    geoTargeting?: {
      countries?: string[];
      regions?: string[];
      cities?: string[];
      exclude?: boolean;
    };
    deviceTargeting?: {
      desktop?: boolean;
      tablet?: boolean;
      mobile?: boolean;
    };
  };
  
  // Schedule
  schedule: {
    startDate: Date;
    endDate?: Date;
    timeZone: string;
    dayParting?: {
      enabled: boolean;
      schedule: {
        day: number;
        startTime: string;
        endTime: string;
      }[];
    };
  };
  
  // Goals & KPIs
  goals: {
    primary: {
      metric: 'impressions' | 'clicks' | 'conversions' | 'revenue' | 'engagement';
      target: number;
      achieved?: number;
    };
    secondary?: {
      metric: string;
      target: number;
      achieved?: number;
    }[];
  };
  
  // Performance Tracking
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    conversionRate: number;
    cpm: number;
    cpc: number;
    cpa: number;
    roas: number;
    engagement: {
      likes?: number;
      shares?: number;
      comments?: number;
      saves?: number;
    };
  };
  
  // A/B Testing
  abTesting?: {
    enabled: boolean;
    confidence: number;
    winner?: string;
    significanceThreshold: number;
    minSampleSize: number;
    variants: {
      heroId: string;
      name: string;
      trafficSplit: number;
    }[];
  };
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  completedAt?: Date;
}

export interface HeroAnalytics {
  // Overview Metrics
  totalHeroes: number;
  activeHeroes: number;
  scheduledHeroes: number;
  archivedHeroes: number;
  
  // Performance Metrics
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  averageCtr: number;
  averageConversionRate: number;
  averageEngagement: number;
  
  // Top Performers
  topPerformingHeroes: {
    heroId: string;
    title: string;
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    revenue: number;
  }[];
  
  topPerformingPositions: {
    position: string;
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
  }[];
  
  // Device Performance
  deviceBreakdown: {
    device: 'desktop' | 'tablet' | 'mobile';
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
  }[];
  
  // Time-based Analytics
  performanceOverTime: {
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }[];
  
  // A/B Test Results
  abTestResults?: {
    testId: string;
    status: 'running' | 'completed' | 'failed';
    winner?: string;
    confidence: number;
    variants: {
      heroId: string;
      name: string;
      impressions: number;
      conversions: number;
      conversionRate: number;
      significance: number;
    }[];
  }[];
  
  // Engagement Metrics
  engagementMetrics: {
    averageTimeOnPage: number;
    bounceRate: number;
    scrollDepth: number;
    interactionRate: number;
    socialShares: number;
  };
  
  // Content Performance
  contentAnalysis: {
    mostEffectiveCtaTexts: { text: string; conversions: number }[];
    bestPerformingImages: { url: string; clicks: number }[];
    optimalContentLength: { range: string; avgConversionRate: number }[];
  };
}

export interface HeroListParams extends PaginationParams {
  search?: string;
  status?: string | string[];
  type?: string | string[];
  position?: string | string[];
  placement?: string | string[];
  priority?: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  tags?: string[];
  isTemplate?: boolean;
  sortBy?: 'created' | 'updated' | 'priority' | 'impressions' | 'ctr' | 'conversions';
  sortOrder?: 'asc' | 'desc';
}

export interface HeroCreateRequest {
  title: string;
  subtitle?: string;
  description?: string;
  content?: string;
  type: Hero['type'];
  position: Hero['position'];
  placement: Hero['placement'];
  priority?: number;
  media: Hero['media'];
  cta?: Hero['cta'];
  secondaryCta?: Hero['secondaryCta'];
  design: Hero['design'];
  contentAlignment: Hero['contentAlignment'];
  responsive?: Hero['responsive'];
  targeting?: Hero['targeting'];
  abTest?: Hero['abTest'];
  seo?: Hero['seo'];
  accessibility: Hero['accessibility'];
  interactions?: Hero['interactions'];
  dynamicContent?: Hero['dynamicContent'];
  personalization?: Hero['personalization'];
  translations?: Hero['translations'];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface HeroBulkOperation {
  action: 'activate' | 'deactivate' | 'archive' | 'delete' | 'update' | 'duplicate' | 'export';
  heroIds: string[];
  data?: Partial<Hero>;
  options?: {
    preserveAnalytics?: boolean;
    updatePriorities?: boolean;
    notifyUsers?: boolean;
  };
}

// ==================== Hero API Service ====================

class HeroApi {
  // Basic CRUD Operations
  async getHeroes(params?: HeroListParams) {
    const response = await httpClient.get<ApiResponse<{ items: Hero[]; pagination: PaginationInfo }>>(
      endpoints.heroes.list,
      { params }
    );
    return response.data;
  }

  async getHeroById(id: string) {
    const response = await httpClient.get<ApiResponse<Hero>>(
      endpoints.heroes.byId(id)
    );
    return response.data;
  }

  async createHero(data: HeroCreateRequest) {
    const response = await httpClient.post<ApiResponse<Hero>>(
      endpoints.heroes.create,
      data
    );
    return response.data;
  }

  async updateHero(id: string, data: Partial<Hero>) {
    const response = await httpClient.put<ApiResponse<Hero>>(
      endpoints.heroes.update(id),
      data
    );
    return response.data;
  }

  async deleteHero(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.heroes.delete(id)
    );
    return response.data;
  }

  async duplicateHero(id: string, data?: { title?: string; position?: string }) {
    const response = await httpClient.post<ApiResponse<Hero>>(
      endpoints.heroes.duplicate(id),
      data
    );
    return response.data;
  }

  // Status Management
  async activateHero(id: string) {
    const response = await httpClient.patch<ApiResponse<Hero>>(
      endpoints.heroes.activate(id)
    );
    return response.data;
  }

  async deactivateHero(id: string) {
    const response = await httpClient.patch<ApiResponse<Hero>>(
      endpoints.heroes.deactivate(id)
    );
    return response.data;
  }

  async archiveHero(id: string) {
    const response = await httpClient.patch<ApiResponse<Hero>>(
      endpoints.heroes.archive(id)
    );
    return response.data;
  }

  async publishHero(id: string, publishDate?: Date) {
    const response = await httpClient.patch<ApiResponse<Hero>>(
      endpoints.heroes.publish(id),
      { publishDate }
    );
    return response.data;
  }

  async unpublishHero(id: string) {
    const response = await httpClient.patch<ApiResponse<Hero>>(
      endpoints.heroes.unpublish(id)
    );
    return response.data;
  }

  // Priority & Position Management
  async updatePriority(id: string, priority: number) {
    const response = await httpClient.patch<ApiResponse<Hero>>(
      endpoints.heroes.priority(id),
      { priority }
    );
    return response.data;
  }

  async reorderHeroes(data: { heroId: string; priority: number }[]) {
    const response = await httpClient.post<ApiResponse<Hero[]>>(
      endpoints.heroes.reorder,
      { heroes: data }
    );
    return response.data;
  }

  async moveHero(id: string, data: { position: string; placement: string }) {
    const response = await httpClient.patch<ApiResponse<Hero>>(
      endpoints.heroes.move(id),
      data
    );
    return response.data;
  }

  // Template Management
  async getTemplates(params?: {
    category?: string;
    type?: string;
    isPublic?: boolean;
    isRecommended?: boolean;
  }) {
    const response = await httpClient.get<ApiResponse<{ items: HeroTemplate[]; pagination: PaginationInfo }>>(
      endpoints.heroes.templates.list,
      { params }
    );
    return response.data;
  }

  async getTemplateById(id: string) {
    const response = await httpClient.get<ApiResponse<HeroTemplate>>(
      endpoints.heroes.templates.byId(id)
    );
    return response.data;
  }

  async createTemplate(data: Partial<HeroTemplate>) {
    const response = await httpClient.post<ApiResponse<HeroTemplate>>(
      endpoints.heroes.templates.create,
      data
    );
    return response.data;
  }

  async updateTemplate(id: string, data: Partial<HeroTemplate>) {
    const response = await httpClient.put<ApiResponse<HeroTemplate>>(
      endpoints.heroes.templates.update(id),
      data
    );
    return response.data;
  }

  async deleteTemplate(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.heroes.templates.delete(id)
    );
    return response.data;
  }

  async duplicateTemplate(id: string, data?: { name?: string }) {
    const response = await httpClient.post<ApiResponse<HeroTemplate>>(
      endpoints.heroes.templates.duplicate(id),
      data
    );
    return response.data;
  }

  async createHeroFromTemplate(templateId: string, data: Partial<Hero>) {
    const response = await httpClient.post<ApiResponse<Hero>>(
      endpoints.heroes.templates.createHero(templateId),
      data
    );
    return response.data;
  }

  // Bulk Operations
  async bulkOperation(operation: HeroBulkOperation) {
    const response = await httpClient.post<ApiResponse<{
      processed: number;
      failed: number;
      errors: string[];
      results: Hero[];
    }>>(endpoints.heroes.bulk, operation);
    return response.data;
  }

  async bulkActivate(heroIds: string[]) {
    return this.bulkOperation({
      action: 'activate',
      heroIds,
    });
  }

  async bulkDeactivate(heroIds: string[]) {
    return this.bulkOperation({
      action: 'deactivate',
      heroIds,
    });
  }

  async bulkArchive(heroIds: string[]) {
    return this.bulkOperation({
      action: 'archive',
      heroIds,
    });
  }

  async bulkDelete(heroIds: string[]) {
    return this.bulkOperation({
      action: 'delete',
      heroIds,
    });
  }

  async bulkUpdate(heroIds: string[], data: Partial<Hero>) {
    return this.bulkOperation({
      action: 'update',
      heroIds,
      data,
    });
  }

  // Scheduling
  async getSchedules(params?: {
    heroId?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await httpClient.get<ApiResponse<{ items: HeroSchedule[]; pagination: PaginationInfo }>>(
      endpoints.heroes.schedules.list,
      { params }
    );
    return response.data;
  }

  async getScheduleById(id: string) {
    const response = await httpClient.get<ApiResponse<HeroSchedule>>(
      endpoints.heroes.schedules.byId(id)
    );
    return response.data;
  }

  async createSchedule(data: Partial<HeroSchedule>) {
    const response = await httpClient.post<ApiResponse<HeroSchedule>>(
      endpoints.heroes.schedules.create,
      data
    );
    return response.data;
  }

  async updateSchedule(id: string, data: Partial<HeroSchedule>) {
    const response = await httpClient.put<ApiResponse<HeroSchedule>>(
      endpoints.heroes.schedules.update(id),
      data
    );
    return response.data;
  }

  async deleteSchedule(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.heroes.schedules.delete(id)
    );
    return response.data;
  }

  async activateSchedule(id: string) {
    const response = await httpClient.patch<ApiResponse<HeroSchedule>>(
      endpoints.heroes.schedules.activate(id)
    );
    return response.data;
  }

  async pauseSchedule(id: string) {
    const response = await httpClient.patch<ApiResponse<HeroSchedule>>(
      endpoints.heroes.schedules.pause(id)
    );
    return response.data;
  }

  // Campaign Management
  async getCampaigns(params?: {
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await httpClient.get<ApiResponse<{ items: HeroCampaign[]; pagination: PaginationInfo }>>(
      endpoints.heroes.campaigns.list,
      { params }
    );
    return response.data;
  }

  async getCampaignById(id: string) {
    const response = await httpClient.get<ApiResponse<HeroCampaign>>(
      endpoints.heroes.campaigns.byId(id)
    );
    return response.data;
  }

  async createCampaign(data: Partial<HeroCampaign>) {
    const response = await httpClient.post<ApiResponse<HeroCampaign>>(
      endpoints.heroes.campaigns.create,
      data
    );
    return response.data;
  }

  async updateCampaign(id: string, data: Partial<HeroCampaign>) {
    const response = await httpClient.put<ApiResponse<HeroCampaign>>(
      endpoints.heroes.campaigns.update(id),
      data
    );
    return response.data;
  }

  async deleteCampaign(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.heroes.campaigns.delete(id)
    );
    return response.data;
  }

  async startCampaign(id: string) {
    const response = await httpClient.patch<ApiResponse<HeroCampaign>>(
      endpoints.heroes.campaigns.start(id)
    );
    return response.data;
  }

  async pauseCampaign(id: string) {
    const response = await httpClient.patch<ApiResponse<HeroCampaign>>(
      endpoints.heroes.campaigns.pause(id)
    );
    return response.data;
  }

  async completeCampaign(id: string) {
    const response = await httpClient.patch<ApiResponse<HeroCampaign>>(
      endpoints.heroes.campaigns.complete(id)
    );
    return response.data;
  }

  // Analytics & Performance
  async getAnalytics(period?: string, filters?: {
    heroIds?: string[];
    positions?: string[];
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await httpClient.get<ApiResponse<HeroAnalytics>>(
      endpoints.heroes.analytics,
      { params: { period, ...filters } }
    );
    return response.data;
  }

  async getHeroPerformance(id: string, period?: string) {
    const response = await httpClient.get<ApiResponse<{
      impressions: number[];
      clicks: number[];
      conversions: number[];
      revenue: number[];
      timestamps: string[];
    }>>(endpoints.heroes.performance(id), { params: { period } });
    return response.data;
  }

  async getPerformanceReport(params?: {
    heroIds?: string[];
    groupBy?: 'day' | 'week' | 'month';
    metrics?: string[];
    startDate?: string;
    endDate?: string;
  }) {
    const response = await httpClient.get<ApiResponse<{
      data: AnalyticsDataPoint[];
      summary: Record<string, number>;
      insights: string[];
    }>>(endpoints.heroes.reports.performance, { params });
    return response.data;
  }

  async getEngagementReport(params?: {
    heroIds?: string[];
    period?: string;
    includeHeatmap?: boolean;
  }) {
    const response = await httpClient.get<ApiResponse<{
      engagement: EngagementPoint[];
      heatmap?: HeatmapPoint[];
      insights: string[];
    }>>(endpoints.heroes.reports.engagement, { params });
    return response.data;
  }

  // A/B Testing
  async createAbTest(data: {
    name: string;
    description?: string;
    heroIds: string[];
    trafficSplit: number[];
    goalMetric: string;
    minSampleSize?: number;
    maxDuration?: number;
  }) {
    const response = await httpClient.post<ApiResponse<{
      testId: string;
      status: string;
      variants: AbTestVariant[];
    }>>(endpoints.heroes.abTest.create, data);
    return response.data;
  }

  async getAbTests(params?: {
    status?: string;
    heroIds?: string[];
  }) {
    const response = await httpClient.get<ApiResponse<{ items: AbTestData[]; pagination: PaginationInfo }>>(
      endpoints.heroes.abTest.list,
      { params }
    );
    return response.data;
  }

  async getAbTestById(id: string) {
    const response = await httpClient.get<ApiResponse<AbTestData>>(
      endpoints.heroes.abTest.byId(id)
    );
    return response.data;
  }

  async updateAbTest(id: string, data: Partial<AbTestData>) {
    const response = await httpClient.put<ApiResponse<AbTestData>>(
      endpoints.heroes.abTest.update(id),
      data
    );
    return response.data;
  }

  async stopAbTest(id: string, winner?: string) {
    const response = await httpClient.patch<ApiResponse<AbTestData>>(
      endpoints.heroes.abTest.stop(id),
      { winner }
    );
    return response.data;
  }

  async getAbTestResults(id: string) {
    const response = await httpClient.get<ApiResponse<{
      results: AbTestResult[];
      winner?: string;
      confidence: number;
      recommendations: string[];
    }>>(endpoints.heroes.abTest.results(id));
    return response.data;
  }

  // Search & Filter
  async searchHeroes(query: string, params?: {
    type?: string;
    status?: string;
    position?: string;
    limit?: number;
  }) {
    const response = await httpClient.get<ApiResponse<{ items: Hero[]; pagination: PaginationInfo }>>(
      endpoints.heroes.search,
      { params: { q: query, ...params } }
    );
    return response.data;
  }

  async getFilters() {
    const response = await httpClient.get<ApiResponse<{
      types: string[];
      statuses: string[];
      positions: string[];
      placements: string[];
      tags: string[];
      creators: { id: string; name: string }[];
    }>>(endpoints.heroes.filters);
    return response.data;
  }

  // Preview & Testing
  async previewHero(id: string, params?: {
    device?: 'desktop' | 'tablet' | 'mobile';
    theme?: string;
    position?: string;
  }) {
    const response = await httpClient.get<ApiResponse<{
      html: string;
      css: string;
      assets: string[];
    }>>(endpoints.heroes.preview(id), { params });
    return response.data;
  }

  async testHero(id: string, data: {
    testType: 'responsive' | 'performance' | 'accessibility' | 'seo';
    options?: Record<string, unknown>;
  }) {
    const response = await httpClient.post<ApiResponse<{
      score: number;
      issues: ValidationIssue[];
      recommendations: string[];
      report: ValidationReport;
    }>>(endpoints.heroes.test(id), data);
    return response.data;
  }

  // Import/Export
  async importHeroes(data: {
    file: File;
    format: 'json' | 'csv';
    skipDuplicates?: boolean;
    preserveIds?: boolean;
  }) {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('format', data.format);
    if (data.skipDuplicates !== undefined) formData.append('skipDuplicates', String(data.skipDuplicates));
    if (data.preserveIds !== undefined) formData.append('preserveIds', String(data.preserveIds));

    const response = await httpClient.post<ApiResponse<{
      imported: number;
      skipped: number;
      errors: string[];
      heroes: Hero[];
    }>>(endpoints.heroes.import, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async exportHeroes(params?: {
    format?: 'json' | 'csv' | 'xlsx';
    heroIds?: string[];
    status?: string;
    type?: string;
    includeAnalytics?: boolean;
    includeMedia?: boolean;
  }) {
    const response = await httpClient.get<Blob>(
      endpoints.heroes.export,
      { 
        params,
        responseType: 'blob'
      }
    );
    return response.data;
  }

  // Optimization & AI
  async optimizeHero(id: string, data: {
    optimizeFor: 'ctr' | 'conversions' | 'engagement' | 'accessibility';
    options?: {
      preserveDesign?: boolean;
      generateVariants?: boolean;
      autoImplement?: boolean;
    };
  }) {
    const response = await httpClient.post<ApiResponse<{
      suggestions: OptimizationSuggestion[];
      variants?: Hero[];
      confidence: number;
    }>>(endpoints.heroes.optimize(id), data);
    return response.data;
  }

  async generateHeroFromAI(data: {
    prompt: string;
    type: Hero['type'];
    position: Hero['position'];
    templateId?: string;
    brand?: {
      colors: string[];
      fonts: string[];
      style: string;
    };
  }) {
    const response = await httpClient.post<ApiResponse<{
      hero: Hero;
      alternatives: Hero[];
      confidence: number;
    }>>(endpoints.heroes.aiGenerate, data);
    return response.data;
  }

  // Compliance & Validation
  async validateHero(id: string, checks?: {
    accessibility?: boolean;
    seo?: boolean;
    performance?: boolean;
    brand?: boolean;
  }) {
    const response = await httpClient.post<ApiResponse<{
      valid: boolean;
      issues: ValidationIssue[];
      warnings: ValidationIssue[];
      score: number;
    }>>(endpoints.heroes.validate(id), checks);
    return response.data;
  }

  async getComplianceReport(params?: {
    heroIds?: string[];
    standards?: string[];
  }) {
    const response = await httpClient.get<ApiResponse<{
      compliance: ComplianceCheck[];
      violations: ValidationIssue[];
      recommendations: string[];
    }>>(endpoints.heroes.compliance, { params });
    return response.data;
  }

  // Integration & Webhooks
  async getWebhookSettings() {
    const response = await httpClient.get<ApiResponse<{
      webhooks: WebhookConfig[];
    }>>(endpoints.heroes.webhooks);
    return response.data;
  }

  async updateWebhookSettings(data: {
    webhooks: {
      id?: string;
      url: string;
      events: string[];
      isActive: boolean;
      secret?: string;
    }[];
  }) {
    const response = await httpClient.post<ApiResponse<void>>(
      endpoints.heroes.updateWebhooks,
      data
    );
    return response.data;
  }
}

export const heroApi = new HeroApi();

// ==================== React Query Hooks ====================

// Hero Hooks
export const useHeroes = (params?: HeroListParams) => {
  return useQuery({
    queryKey: ['heroes', 'list', params],
    queryFn: () => heroApi.getHeroes(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useHeroById = (id: string) => {
  return useQuery({
    queryKey: ['heroes', 'detail', id],
    queryFn: () => heroApi.getHeroById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useHeroTemplates = (params?: {
  category?: string;
  type?: string;
  isPublic?: boolean;
  isRecommended?: boolean;
}) => {
  return useQuery({
    queryKey: ['heroes', 'templates', params],
    queryFn: () => heroApi.getTemplates(params),
    staleTime: 10 * 60 * 1000,
  });
};

export const useHeroTemplateById = (id: string) => {
  return useQuery({
    queryKey: ['heroes', 'templates', id],
    queryFn: () => heroApi.getTemplateById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

export const useHeroSchedules = (params?: {
  heroId?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['heroes', 'schedules', params],
    queryFn: () => heroApi.getSchedules(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useHeroScheduleById = (id: string) => {
  return useQuery({
    queryKey: ['heroes', 'schedules', id],
    queryFn: () => heroApi.getScheduleById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useHeroCampaigns = (params?: {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['heroes', 'campaigns', params],
    queryFn: () => heroApi.getCampaigns(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useHeroCampaignById = (id: string) => {
  return useQuery({
    queryKey: ['heroes', 'campaigns', id],
    queryFn: () => heroApi.getCampaignById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useHeroAnalytics = (period?: string, filters?: {
  heroIds?: string[];
  positions?: string[];
  type?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['heroes', 'analytics', period, filters],
    queryFn: () => heroApi.getAnalytics(period, filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useHeroPerformance = (id: string, period?: string) => {
  return useQuery({
    queryKey: ['heroes', 'performance', id, period],
    queryFn: () => heroApi.getHeroPerformance(id, period),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useHeroSearch = (query: string, params?: {
  type?: string;
  status?: string;
  position?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['heroes', 'search', query, params],
    queryFn: () => heroApi.searchHeroes(query, params),
    enabled: !!query.trim(),
    staleTime: 30 * 1000,
  });
};

export const useHeroFilters = () => {
  return useQuery({
    queryKey: ['heroes', 'filters'],
    queryFn: () => heroApi.getFilters(),
    staleTime: 30 * 60 * 1000,
  });
};

export const useHeroPreview = (id: string, params?: {
  device?: 'desktop' | 'tablet' | 'mobile';
  theme?: string;
  position?: string;
}) => {
  return useQuery({
    queryKey: ['heroes', 'preview', id, params],
    queryFn: () => heroApi.previewHero(id, params),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};

export const useAbTests = (params?: {
  status?: string;
  heroIds?: string[];
}) => {
  return useQuery({
    queryKey: ['heroes', 'abTests', params],
    queryFn: () => heroApi.getAbTests(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useAbTestById = (id: string) => {
  return useQuery({
    queryKey: ['heroes', 'abTests', id],
    queryFn: () => heroApi.getAbTestById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};

export const useAbTestResults = (id: string) => {
  return useQuery({
    queryKey: ['heroes', 'abTests', id, 'results'],
    queryFn: () => heroApi.getAbTestResults(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
};

export const useHeroWebhookSettings = () => {
  return useQuery({
    queryKey: ['heroes', 'webhooks'],
    queryFn: () => heroApi.getWebhookSettings(),
    staleTime: 10 * 60 * 1000,
  });
};

// ==================== Mutation Hooks ====================

export const useCreateHero = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: HeroCreateRequest) => heroApi.createHero(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
    },
  });
};

export const useUpdateHero = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Hero> }) => 
      heroApi.updateHero(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'detail', id] });
    },
  });
};

export const useDeleteHero = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => heroApi.deleteHero(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
    },
  });
};

export const useDuplicateHero = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { title?: string; position?: string } }) => 
      heroApi.duplicateHero(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
    },
  });
};

export const useActivateHero = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => heroApi.activateHero(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'detail', id] });
    },
  });
};

export const useDeactivateHero = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => heroApi.deactivateHero(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'detail', id] });
    },
  });
};

export const useArchiveHero = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => heroApi.archiveHero(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'detail', id] });
    },
  });
};

export const usePublishHero = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, publishDate }: { id: string; publishDate?: Date }) => 
      heroApi.publishHero(id, publishDate),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'detail', id] });
    },
  });
};

export const useUnpublishHero = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => heroApi.unpublishHero(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'detail', id] });
    },
  });
};

export const useUpdateHeroPriority = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: number }) => 
      heroApi.updatePriority(id, priority),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'detail', id] });
    },
  });
};

export const useReorderHeroes = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { heroId: string; priority: number }[]) => 
      heroApi.reorderHeroes(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
    },
  });
};

export const useMoveHero = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { position: string; placement: string } }) => 
      heroApi.moveHero(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'detail', id] });
    },
  });
};

// Template Mutations
export const useCreateHeroTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<HeroTemplate>) => heroApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'templates'] });
    },
  });
};

export const useUpdateHeroTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HeroTemplate> }) => 
      heroApi.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'templates'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'templates', id] });
    },
  });
};

export const useDeleteHeroTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => heroApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'templates'] });
    },
  });
};

export const useDuplicateHeroTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { name?: string } }) => 
      heroApi.duplicateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'templates'] });
    },
  });
};

export const useCreateHeroFromTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: Partial<Hero> }) => 
      heroApi.createHeroFromTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
    },
  });
};

// Bulk Operations
export const useBulkHeroOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (operation: HeroBulkOperation) => heroApi.bulkOperation(operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
    },
  });
};

// Schedule Mutations
export const useCreateHeroSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<HeroSchedule>) => heroApi.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'schedules'] });
    },
  });
};

export const useUpdateHeroSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HeroSchedule> }) => 
      heroApi.updateSchedule(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'schedules'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'schedules', id] });
    },
  });
};

export const useDeleteHeroSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => heroApi.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'schedules'] });
    },
  });
};

export const useActivateHeroSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => heroApi.activateSchedule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'schedules'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'schedules', id] });
    },
  });
};

export const usePauseHeroSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => heroApi.pauseSchedule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'schedules'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'schedules', id] });
    },
  });
};

// Campaign Mutations
export const useCreateHeroCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<HeroCampaign>) => heroApi.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'campaigns'] });
    },
  });
};

export const useUpdateHeroCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HeroCampaign> }) => 
      heroApi.updateCampaign(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'campaigns', id] });
    },
  });
};

export const useDeleteHeroCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => heroApi.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'campaigns'] });
    },
  });
};

export const useStartHeroCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => heroApi.startCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'campaigns', id] });
    },
  });
};

export const usePauseHeroCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => heroApi.pauseCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'campaigns', id] });
    },
  });
};

export const useCompleteHeroCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => heroApi.completeCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'campaigns', id] });
    },
  });
};

// A/B Testing Mutations
export const useCreateAbTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      heroIds: string[];
      trafficSplit: number[];
      goalMetric: string;
      minSampleSize?: number;
      maxDuration?: number;
    }) => heroApi.createAbTest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'abTests'] });
    },
  });
};

export const useUpdateAbTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AbTestData> }) => 
      heroApi.updateAbTest(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'abTests'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'abTests', id] });
    },
  });
};

export const useStopAbTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, winner }: { id: string; winner?: string }) => 
      heroApi.stopAbTest(id, winner),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'abTests'] });
      queryClient.invalidateQueries({ queryKey: ['heroes', 'abTests', id] });
    },
  });
};

// Testing & Optimization Mutations
export const useTestHero = () => {
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: {
        testType: 'responsive' | 'performance' | 'accessibility' | 'seo';
        options?: Record<string, unknown>;
      };
    }) => heroApi.testHero(id, data),
  });
};

export const useOptimizeHero = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: {
        optimizeFor: 'ctr' | 'conversions' | 'engagement' | 'accessibility';
        options?: {
          preserveDesign?: boolean;
          generateVariants?: boolean;
          autoImplement?: boolean;
        };
      };
    }) => heroApi.optimizeHero(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'detail', id] });
    },
  });
};

export const useGenerateHeroFromAI = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      prompt: string;
      type: Hero['type'];
      position: Hero['position'];
      templateId?: string;
      brand?: {
        colors: string[];
        fonts: string[];
        style: string;
      };
    }) => heroApi.generateHeroFromAI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
    },
  });
};

export const useValidateHero = () => {
  return useMutation({
    mutationFn: ({ id, checks }: {
      id: string;
      checks?: {
        accessibility?: boolean;
        seo?: boolean;
        performance?: boolean;
        brand?: boolean;
      };
    }) => heroApi.validateHero(id, checks),
  });
};

// Import/Export Mutations
export const useImportHeroes = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      file: File;
      format: 'json' | 'csv';
      skipDuplicates?: boolean;
      preserveIds?: boolean;
    }) => heroApi.importHeroes(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes'] });
    },
  });
};

export const useUpdateHeroWebhookSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      webhooks: {
        id?: string;
        url: string;
        events: string[];
        isActive: boolean;
        secret?: string;
      }[];
    }) => heroApi.updateWebhookSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroes', 'webhooks'] });
    },
  });
};

export default heroApi;
