import { BaseEntity, ID, Timestamp, ImageAsset, PaginatedResponse, APIResponse, APIError } from './common.types';

// Social Link Types - Simple social media integration types for e-commerce platform

// ===== CORE TYPES =====
export type SocialPlatform = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'pinterest' | 'snapchat' | 'whatsapp' | 'telegram' | 'discord' | 'reddit' | 'custom';
export type LinkStatus = 'active' | 'inactive' | 'pending' | 'error';
export type DisplayStyle = 'icon_only' | 'text_only' | 'icon_text' | 'button' | 'badge';
export type LinkType = 'profile' | 'page' | 'group' | 'post' | 'video' | 'campaign' | 'custom';

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

// ===== MAIN SOCIAL LINK ENTITY =====
export interface SocialLink extends BaseEntity {
  id: ID;
  platform: SocialPlatform;
  name: string;
  url: string;
  username?: string;
  type: LinkType;
  status: LinkStatus;
  
  // Display Properties
  displayName: string;
  description?: string;
  icon: ImageAsset;
  customIcon?: ImageAsset;
  displayStyle: DisplayStyle;
  displayOrder: number;
  
  // Styling
  color: string;
  hoverColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  size: 'small' | 'medium' | 'large' | 'custom';
  customSize?: {
    width: number;
    height: number;
  };
  
  // Behavior
  openInNewTab: boolean;
  isVerified: boolean;
  isPublic: boolean;
  trackClicks: boolean;
  
  // Analytics
  clickCount: number;
  lastClicked?: Timestamp;
  
  // Placement
  placements: LinkPlacement[];
  
  // Custom Fields
  tags: string[];
  customFields: Record<string, unknown>;
  metadata: Record<string, unknown>;
  
  // User Management
  createdBy: ID;
  updatedBy: ID;
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== PLACEMENT & DISPLAY =====
export interface LinkPlacement {
  location: 'header' | 'footer' | 'sidebar' | 'floating' | 'contact_page' | 'about_page' | 'product_page' | 'custom';
  position: number;
  isVisible: boolean;
  responsiveSettings: ResponsiveSettings;
}

export interface ResponsiveSettings {
  desktop: DeviceSettings;
  tablet: DeviceSettings;
  mobile: DeviceSettings;
}

export interface DeviceSettings {
  isVisible: boolean;
  size?: 'small' | 'medium' | 'large';
  displayStyle?: DisplayStyle;
}

// ===== SOCIAL LINK GROUP =====
export interface SocialLinkGroup {
  id: ID;
  name: string;
  description?: string;
  links: ID[];
  
  // Display Properties
  layout: 'horizontal' | 'vertical' | 'grid' | 'circular';
  spacing: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
  
  // Styling
  containerStyle: ContainerStyle;
  groupAnimation?: AnimationSettings;
  
  // Placement
  placements: LinkPlacement[];
  
  // Status
  isActive: boolean;
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: ID;
  updatedBy: ID;
}

export interface ContainerStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  shadow?: string;
}

export interface AnimationSettings {
  type: 'none' | 'fade' | 'slide' | 'bounce' | 'pulse' | 'rotate';
  duration: number;
  delay: number;
  easing: 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out';
}

// ===== ANALYTICS =====
export interface SocialLinkAnalytics {
  id: ID;
  linkId?: ID;
  groupId?: ID;
  period: 'daily' | 'weekly' | 'monthly';
  date: Timestamp;
  
  // Click Metrics
  totalClicks: number;
  uniqueClicks: number;
  clickThroughRate: number;
  
  // Platform Performance
  platformBreakdown: PlatformMetric[];
  
  // Device & Location
  deviceBreakdown: DeviceMetric[];
  countryBreakdown: CountryMetric[];
  
  // Time-based
  hourlyBreakdown: TimeMetric[];
  
  // Referrer Data
  referrerBreakdown: ReferrerMetric[];
}

export interface PlatformMetric {
  platform: SocialPlatform;
  clicks: number;
  uniqueClicks: number;
  conversionRate: number;
}

export interface DeviceMetric {
  device: 'desktop' | 'mobile' | 'tablet';
  clicks: number;
  percentage: number;
}

export interface CountryMetric {
  country: string;
  clicks: number;
  percentage: number;
}

export interface TimeMetric {
  hour: number;
  clicks: number;
}

export interface ReferrerMetric {
  referrer: string;
  clicks: number;
  percentage: number;
}

// ===== INTEGRATION SETTINGS =====
export interface SocialIntegration {
  id: ID;
  platform: SocialPlatform;
  isEnabled: boolean;
  
  // API Configuration
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Timestamp;
  
  // Integration Features
  features: IntegrationFeature[];
  
  // Sync Settings
  autoSync: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  lastSync?: Timestamp;
  
  // Error Handling
  errorCount: number;
  lastError?: IntegrationError;
  
  // Configuration
  settings: Record<string, unknown>;
  
  // Timeline
  connectedAt: Timestamp;
  updatedAt: Timestamp;
}

export interface IntegrationFeature {
  feature: 'share_products' | 'login_with_social' | 'import_contacts' | 'post_reviews' | 'sync_profile' | 'track_conversions';
  isEnabled: boolean;
  configuration: Record<string, unknown>;
}

export interface IntegrationError {
  timestamp: Timestamp;
  message: string;
  code: string;
  details: Record<string, unknown>;
}

// ===== REQUEST/RESPONSE INTERFACES =====
export interface CreateSocialLinkRequest {
  platform: SocialPlatform;
  name: string;
  url: string;
  username?: string;
  type?: LinkType;
  displayName: string;
  description?: string;
  displayStyle?: DisplayStyle;
  displayOrder?: number;
  openInNewTab?: boolean;
  placements?: LinkPlacement[];
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export interface UpdateSocialLinkRequest {
  name?: string;
  url?: string;
  username?: string;
  displayName?: string;
  description?: string;
  status?: LinkStatus;
  displayStyle?: DisplayStyle;
  displayOrder?: number;
  openInNewTab?: boolean;
  isPublic?: boolean;
  placements?: LinkPlacement[];
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export interface SocialLinkQueryParams extends PaginationParams, SortParams, FilterParams {
  platform?: SocialPlatform[];
  status?: LinkStatus[];
  type?: LinkType[];
  placement?: string[];
  isPublic?: boolean;
  isVerified?: boolean;
}

export interface CreateSocialLinkGroupRequest {
  name: string;
  description?: string;
  links: ID[];
  layout?: 'horizontal' | 'vertical' | 'grid' | 'circular';
  placements?: LinkPlacement[];
}

export interface UpdateSocialLinkGroupRequest {
  name?: string;
  description?: string;
  links?: ID[];
  layout?: 'horizontal' | 'vertical' | 'grid' | 'circular';
  isActive?: boolean;
  placements?: LinkPlacement[];
}

export type SocialLinkResponse = APIResponse<SocialLink>;
export type SocialLinkListResponse = APIResponse<PaginatedResponse<SocialLink>>;
export type SocialLinkGroupResponse = APIResponse<SocialLinkGroup>;
export type SocialLinkAnalyticsResponse = APIResponse<SocialLinkAnalytics>;

// ===== HOOKS & STATE MANAGEMENT =====
export interface UseSocialLinksHook {
  links: SocialLink[];
  groups: SocialLinkGroup[];
  isLoading: boolean;
  error: APIError | null;
  
  // Link Actions
  fetchLinks: (params?: SocialLinkQueryParams) => Promise<void>;
  createLink: (data: CreateSocialLinkRequest) => Promise<void>;
  updateLink: (id: ID, data: UpdateSocialLinkRequest) => Promise<void>;
  deleteLink: (id: ID) => Promise<void>;
  
  // Group Actions
  createGroup: (data: CreateSocialLinkGroupRequest) => Promise<void>;
  updateGroup: (id: ID, data: UpdateSocialLinkGroupRequest) => Promise<void>;
  deleteGroup: (id: ID) => Promise<void>;
  
  // Ordering
  reorderLinks: (linkIds: ID[]) => Promise<void>;
  reorderGroups: (groupIds: ID[]) => Promise<void>;
  
  // Analytics
  trackClick: (linkId: ID) => void;
  fetchAnalytics: (linkId?: ID, period?: string) => Promise<void>;
  
  // Bulk Operations
  bulkUpdate: (ids: ID[], data: UpdateSocialLinkRequest) => Promise<void>;
  bulkDelete: (ids: ID[]) => Promise<void>;
  bulkStatusChange: (ids: ID[], status: LinkStatus) => Promise<void>;
}

export interface UseSocialIntegrationHook {
  integrations: SocialIntegration[];
  isLoading: boolean;
  error: APIError | null;
  
  // Actions
  connectPlatform: (platform: SocialPlatform, credentials: Record<string, string>) => Promise<void>;
  disconnectPlatform: (platform: SocialPlatform) => Promise<void>;
  refreshToken: (platform: SocialPlatform) => Promise<void>;
  syncPlatform: (platform: SocialPlatform) => Promise<void>;
  
  // Configuration
  updateIntegration: (platform: SocialPlatform, settings: Record<string, unknown>) => Promise<void>;
  toggleFeature: (platform: SocialPlatform, feature: string, enabled: boolean) => Promise<void>;
}

// ===== COMPONENT PROPS =====
export interface SocialLinksComponentProps {
  groupId?: ID;
  links?: SocialLink[];
  layout?: 'horizontal' | 'vertical' | 'grid' | 'circular';
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  animated?: boolean;
  placement?: string;
  onLinkClick?: (link: SocialLink) => void;
  className?: string;
}

export interface SocialLinkItemProps {
  link: SocialLink;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  animated?: boolean;
  onClick?: (link: SocialLink) => void;
  className?: string;
}

export interface SocialLinkManagerProps {
  onSave: (links: SocialLink[]) => Promise<void>;
  initialLinks?: SocialLink[];
  allowedPlatforms?: SocialPlatform[];
  maxLinks?: number;
  className?: string;
}

export interface SocialShareButtonProps {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  platforms?: SocialPlatform[];
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  onShare?: (platform: SocialPlatform) => void;
  className?: string;
}
