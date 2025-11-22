// Featured Content Management Types

import type { ID, Timestamp, BaseEntity, ImageAsset } from './common.types';

export type FeaturedContentType = 'product' | 'category' | 'collection' | 'brand' | 'article' | 'video' | 'banner';

export type FeaturedSection = 'hero' | 'homepage' | 'category' | 'sidebar' | 'footer' | 'mobile';

export type FeaturedStatus = 'active' | 'inactive' | 'scheduled' | 'expired';

export type FeaturedVisibility = 'public' | 'member' | 'vip' | 'custom';

export interface FeaturedContent extends BaseEntity {
  type: FeaturedContentType;
  contentId: string;
  title: string;
  description?: string;
  image?: ImageAsset;
  section: FeaturedSection;
  position: number;
  priority: number;
  status: FeaturedStatus;
  visibility: FeaturedVisibility;
  targetAudience?: string[];
  startDate?: Timestamp;
  endDate?: Timestamp;
  rules?: FeaturedRule[];
  metadata?: Record<string, any>;
  displaySettings?: FeaturedDisplaySettings;
  performanceData?: FeaturedPerformance;
  createdBy?: ID;
  updatedBy?: ID;
}

export interface FeaturedRule {
  id: ID;
  type: 'time' | 'location' | 'device' | 'user_segment' | 'purchase_history' | 'custom';
  condition: string;
  value: any;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  isActive: boolean;
}

export interface FeaturedDisplaySettings {
  layout: 'card' | 'banner' | 'carousel' | 'grid' | 'list' | 'minimal';
  size: 'small' | 'medium' | 'large' | 'full';
  animation: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce';
  autoRotate: boolean;
  rotationInterval?: number;
  showTitle: boolean;
  showDescription: boolean;
  showCTA: boolean;
  ctaText?: string;
  ctaStyle?: string;
  theme: 'light' | 'dark' | 'brand' | 'custom';
  customCSS?: string;
}

export interface FeaturedPerformance {
  views: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
  revenue?: number;
  engagement: number;
  lastUpdated: Timestamp;
}

export interface FeaturedSectionConfig extends BaseEntity {
  name: string;
  type: FeaturedSection | 'custom';
  description?: string;
  maxItems: number;
  isActive: boolean;
  displaySettings: FeaturedDisplaySettings;
  contentTypes: FeaturedContentType[];
  rules?: FeaturedRule[];
}

export interface FeaturedTemplate extends BaseEntity {
  name: string;
  description?: string;
  type: FeaturedContentType;
  section: FeaturedSection;
  displaySettings: FeaturedDisplaySettings;
  defaultRules?: FeaturedRule[];
  isPublic: boolean;
  usageCount: number;
  createdBy: ID;
}

export interface FeaturedSchedule extends BaseEntity {
  name: string;
  description?: string;
  contentIds: ID[];
  schedule: {
    startDate: Timestamp;
    endDate?: Timestamp;
    timezone: string;
    recurring?: 'daily' | 'weekly' | 'monthly' | 'custom';
    recurringPattern?: string;
  };
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}

export interface FeaturedAnalytics {
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  averageCTR: number;
  averageConversionRate: number;
  totalRevenue: number;
  topPerformingContent: FeaturedContent[];
  performanceBySection: Record<string, FeaturedPerformance>;
  performanceByType: Record<string, FeaturedPerformance>;
  timeSeriesData: {
    date: string;
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }[];
}

export interface FeaturedABTest extends BaseEntity {
  name: string;
  description?: string;
  section: FeaturedSection;
  variants: {
    id: ID;
    name: string;
    content: FeaturedContent[];
    displaySettings?: FeaturedDisplaySettings;
    traffic: number;
  }[];
  trafficSplit: number[];
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: Timestamp;
  endDate?: Timestamp;
  metrics: {
    variantId: ID;
    views: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
  }[];
  winningVariant?: ID;
  confidence: number;
}

export interface FeaturedListParams {
  page?: number;
  limit?: number;
  search?: string;
  section?: FeaturedSection;
  type?: FeaturedContentType;
  status?: FeaturedStatus;
  visibility?: FeaturedVisibility;
  sortBy?: 'position' | 'priority' | 'created' | 'updated' | 'performance';
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface FeaturedBulkOperation {
  action: 'activate' | 'deactivate' | 'delete' | 'move' | 'schedule' | 'update_settings';
  ids: ID[];
  data?: any;
}

// Re-export common types used by Featured APIs
export type {
  ID,
  Timestamp,
  BaseEntity,
  ImageAsset,
  PaginatedResponse,
  APIResponse
} from './common.types';