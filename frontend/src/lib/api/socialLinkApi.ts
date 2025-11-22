/**
 * Social Links API Client
 * Comprehensive social media links management system
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type {
  ApiResponse,
} from './types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

/**
 * Social Link Platform Types
 */
export type SocialPlatform = 
  | 'facebook' 
  | 'twitter' 
  | 'instagram' 
  | 'linkedin' 
  | 'youtube' 
  | 'pinterest' 
  | 'tiktok' 
  | 'snapchat' 
  | 'whatsapp' 
  | 'telegram' 
  | 'discord' 
  | 'reddit' 
  | 'github' 
  | 'behance' 
  | 'dribbble'
  | 'medium'
  | 'blog'
  | 'website'
  | 'email'
  | 'phone'
  | 'other';

/**
 * Social Link Interface
 */
export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  title: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  displayOrder: number;
  openInNewTab: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Social Link with Analytics
 */
export interface SocialLinkDetailed extends SocialLink {
  analytics: {
    clicks: number;
    uniqueClicks: number;
    clicksThisMonth: number;
    clicksThisWeek: number;
    clicksToday: number;
    averageClicksPerDay: number;
    topReferrers: Array<{
      source: string;
      clicks: number;
      percentage: number;
    }>;
    clicksByCountry: Array<{
      country: string;
      clicks: number;
      percentage: number;
    }>;
    clicksByDevice: Array<{
      device: string;
      clicks: number;
      percentage: number;
    }>;
    recentClicks: Array<{
      timestamp: string;
      referrer?: string;
      userAgent: string;
      country?: string;
      city?: string;
    }>;
  };
  engagement: {
    engagementRate: number;
    averageTimeOnSite: number;
    bounceRate: number;
    conversionRate: number;
  };
  seo: {
    isNoFollow: boolean;
    isNoIndex: boolean;
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
  };
}

/**
 * Social Links Group
 */
export interface SocialLinksGroup {
  id: string;
  name: string;
  description?: string;
  links: SocialLink[];
  displayLocation: 'header' | 'footer' | 'sidebar' | 'all' | 'custom';
  theme: {
    style: 'default' | 'minimal' | 'colorful' | 'professional' | 'creative';
    size: 'small' | 'medium' | 'large';
    shape: 'square' | 'rounded' | 'circle';
    colors: {
      background?: string;
      text?: string;
      hover?: string;
      border?: string;
    };
  };
  settings: {
    showLabels: boolean;
    showTooltips: boolean;
    animateOnHover: boolean;
    showFollowerCount: boolean;
    enableTracking: boolean;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Social Links Configuration
 */
export interface SocialLinksConfig {
  globalSettings: {
    enableTracking: boolean;
    enableAnalytics: boolean;
    defaultNewTab: boolean;
    showVerificationBadge: boolean;
    enableSEOOptimization: boolean;
    enableAutomaticIcons: boolean;
  };
  displaySettings: {
    defaultTheme: {
      style: string;
      size: string;
      shape: string;
    };
    responsiveBreakpoints: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
    animationSettings: {
      enableAnimations: boolean;
      animationType: 'fade' | 'slide' | 'bounce' | 'zoom';
      animationDuration: number;
    };
  };
  integrations: {
    googleAnalytics: {
      enabled: boolean;
      trackingId?: string;
      eventCategory: string;
    };
    facebookPixel: {
      enabled: boolean;
      pixelId?: string;
    };
    customTracking: {
      enabled: boolean;
      scripts: Array<{
        name: string;
        code: string;
        position: 'head' | 'body';
      }>;
    };
  };
}

/**
 * Social Links Analytics Summary
 */
export interface SocialLinksAnalytics {
  overview: {
    totalLinks: number;
    activeLinks: number;
    totalClicks: number;
    uniqueClicks: number;
    averageClicksPerLink: number;
    topPerformingPlatform: string;
    engagementRate: number;
  };
  timeRange: {
    today: { clicks: number; uniqueClicks: number };
    thisWeek: { clicks: number; uniqueClicks: number };
    thisMonth: { clicks: number; uniqueClicks: number };
    thisYear: { clicks: number; uniqueClicks: number };
  };
  platformBreakdown: Array<{
    platform: SocialPlatform;
    clicks: number;
    uniqueClicks: number;
    percentage: number;
    growth: number;
  }>;
  geographicData: Array<{
    country: string;
    clicks: number;
    percentage: number;
  }>;
  deviceData: Array<{
    device: string;
    clicks: number;
    percentage: number;
  }>;
  referrerData: Array<{
    source: string;
    clicks: number;
    percentage: number;
  }>;
  trends: Array<{
    date: string;
    clicks: number;
    uniqueClicks: number;
  }>;
}

/**
 * Social Links API Service Class
 */
export class SocialLinksApiService {
  private baseUrl = '/api/v1/social-links';

  // ============================================================================
  // BASIC CRUD OPERATIONS
  // ============================================================================

  /**
   * Get all social links
   */
  async getSocialLinks(params?: {
    group?: string;
    platform?: SocialPlatform;
    isActive?: boolean;
    includeAnalytics?: boolean;
  }): Promise<ApiResponse<SocialLinkDetailed[]>> {
    return httpClient.get(endpoints.site.socialLinks, { params });
  }

  /**
   * Get social link by ID
   */
  async getSocialLink(id: string, includeAnalytics: boolean = false): Promise<ApiResponse<SocialLinkDetailed>> {
    return httpClient.get(`${this.baseUrl}/${id}`, { 
      params: { includeAnalytics } 
    });
  }

  /**
   * Create new social link
   */
  async createSocialLink(data: Omit<SocialLink, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SocialLink>> {
    return httpClient.post(this.baseUrl, data);
  }

  /**
   * Update social link
   */
  async updateSocialLink(
    id: string, 
    updates: Partial<Omit<SocialLink, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<SocialLink>> {
    return httpClient.put(`${this.baseUrl}/${id}`, updates);
  }

  /**
   * Delete social link
   */
  async deleteSocialLink(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Duplicate social link
   */
  async duplicateSocialLink(id: string, updates?: Partial<Pick<SocialLink, 'title' | 'url'>>): Promise<ApiResponse<SocialLink>> {
    return httpClient.post(`${this.baseUrl}/${id}/duplicate`, updates);
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Create multiple social links
   */
  async createMultipleSocialLinks(links: Array<Omit<SocialLink, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<SocialLink[]>> {
    return httpClient.post(`${this.baseUrl}/bulk`, { links });
  }

  /**
   * Update multiple social links
   */
  async updateMultipleSocialLinks(updates: Array<{
    id: string;
    data: Partial<Omit<SocialLink, 'id' | 'createdAt' | 'updatedAt'>>;
  }>): Promise<ApiResponse<SocialLink[]>> {
    return httpClient.put(`${this.baseUrl}/bulk`, { updates });
  }

  /**
   * Delete multiple social links
   */
  async deleteMultipleSocialLinks(ids: string[]): Promise<ApiResponse<void>> {
    return httpClient.delete(`${this.baseUrl}/bulk`, { data: { ids } });
  }

  /**
   * Reorder social links
   */
  async reorderSocialLinks(orderedIds: string[]): Promise<ApiResponse<SocialLink[]>> {
    return httpClient.put(`${this.baseUrl}/reorder`, { orderedIds });
  }

  /**
   * Toggle multiple social links active status
   */
  async toggleMultipleSocialLinks(ids: string[], isActive: boolean): Promise<ApiResponse<SocialLink[]>> {
    return httpClient.put(`${this.baseUrl}/bulk/toggle`, { ids, isActive });
  }

  // ============================================================================
  // GROUPS MANAGEMENT
  // ============================================================================

  /**
   * Get all social links groups
   */
  async getSocialLinksGroups(): Promise<ApiResponse<SocialLinksGroup[]>> {
    return httpClient.get(`${this.baseUrl}/groups`);
  }

  /**
   * Get social links group by ID
   */
  async getSocialLinksGroup(id: string): Promise<ApiResponse<SocialLinksGroup>> {
    return httpClient.get(`${this.baseUrl}/groups/${id}`);
  }

  /**
   * Create social links group
   */
  async createSocialLinksGroup(data: Omit<SocialLinksGroup, 'id' | 'links' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SocialLinksGroup>> {
    return httpClient.post(`${this.baseUrl}/groups`, data);
  }

  /**
   * Update social links group
   */
  async updateSocialLinksGroup(
    id: string,
    updates: Partial<Omit<SocialLinksGroup, 'id' | 'links' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<SocialLinksGroup>> {
    return httpClient.put(`${this.baseUrl}/groups/${id}`, updates);
  }

  /**
   * Delete social links group
   */
  async deleteSocialLinksGroup(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete(`${this.baseUrl}/groups/${id}`);
  }

  /**
   * Add links to group
   */
  async addLinksToGroup(groupId: string, linkIds: string[]): Promise<ApiResponse<SocialLinksGroup>> {
    return httpClient.post(`${this.baseUrl}/groups/${groupId}/links`, { linkIds });
  }

  /**
   * Remove links from group
   */
  async removeLinksFromGroup(groupId: string, linkIds: string[]): Promise<ApiResponse<SocialLinksGroup>> {
    return httpClient.delete(`${this.baseUrl}/groups/${groupId}/links`, { data: { linkIds } });
  }

  // ============================================================================
  // ANALYTICS & TRACKING
  // ============================================================================

  /**
   * Track social link click
   */
  async trackClick(linkId: string, metadata?: {
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<ApiResponse<void>> {
    return httpClient.post(`${this.baseUrl}/${linkId}/track`, metadata);
  }

  /**
   * Get social link analytics
   */
  async getSocialLinkAnalytics(
    linkId: string,
    params?: {
      period?: '7d' | '30d' | '90d' | '1y' | 'all';
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ApiResponse<SocialLinkDetailed['analytics']>> {
    return httpClient.get(`${this.baseUrl}/${linkId}/analytics`, { params });
  }

  /**
   * Get overall social links analytics
   */
  async getOverallAnalytics(params?: {
    period?: '7d' | '30d' | '90d' | '1y' | 'all';
    startDate?: string;
    endDate?: string;
    groupId?: string;
  }): Promise<ApiResponse<SocialLinksAnalytics>> {
    return httpClient.get(`${this.baseUrl}/analytics`, { params });
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(): Promise<ApiResponse<{
    totalClicks: number;
    uniqueClicks: number;
    topPlatform: SocialPlatform;
    engagementRate: number;
    growthRate: number;
  }>> {
    return httpClient.get(`${this.baseUrl}/analytics/summary`);
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(params: {
    linkIds?: string[];
    period?: '7d' | '30d' | '90d' | '1y' | 'all';
    format: 'csv' | 'excel' | 'json';
    includeDetailedData?: boolean;
  }): Promise<ApiResponse<{ downloadUrl: string }>> {
    return httpClient.post(`${this.baseUrl}/analytics/export`, params);
  }

  // ============================================================================
  // CONFIGURATION & SETTINGS
  // ============================================================================

  /**
   * Get social links configuration
   */
  async getConfiguration(): Promise<ApiResponse<SocialLinksConfig>> {
    return httpClient.get(`${this.baseUrl}/config`);
  }

  /**
   * Update social links configuration
   */
  async updateConfiguration(config: Partial<SocialLinksConfig>): Promise<ApiResponse<SocialLinksConfig>> {
    return httpClient.put(`${this.baseUrl}/config`, config);
  }

  /**
   * Reset configuration to defaults
   */
  async resetConfiguration(): Promise<ApiResponse<SocialLinksConfig>> {
    return httpClient.post(`${this.baseUrl}/config/reset`);
  }

  // ============================================================================
  // VERIFICATION & VALIDATION
  // ============================================================================

  /**
   * Verify social link URL
   */
  async verifySocialLink(id: string): Promise<ApiResponse<{
    isValid: boolean;
    isAccessible: boolean;
    responseTime: number;
    statusCode: number;
    error?: string;
  }>> {
    return httpClient.post(`${this.baseUrl}/${id}/verify`);
  }

  /**
   * Verify multiple social links
   */
  async verifyMultipleSocialLinks(ids: string[]): Promise<ApiResponse<Array<{
    id: string;
    isValid: boolean;
    isAccessible: boolean;
    responseTime: number;
    statusCode: number;
    error?: string;
  }>>> {
    return httpClient.post(`${this.baseUrl}/verify/bulk`, { ids });
  }

  /**
   * Validate social link URL format
   */
  async validateUrl(url: string, platform: SocialPlatform): Promise<ApiResponse<{
    isValid: boolean;
    suggestedUrl?: string;
    errors: string[];
  }>> {
    return httpClient.post(`${this.baseUrl}/validate-url`, { url, platform });
  }

  // ============================================================================
  // PLATFORM-SPECIFIC OPERATIONS
  // ============================================================================

  /**
   * Get available social platforms
   */
  async getAvailablePlatforms(): Promise<ApiResponse<Array<{
    platform: SocialPlatform;
    name: string;
    icon: string;
    color: string;
    urlPattern: string;
    isPopular: boolean;
  }>>> {
    return httpClient.get(`${this.baseUrl}/platforms`);
  }

  /**
   * Get platform-specific settings
   */
  async getPlatformSettings(platform: SocialPlatform): Promise<ApiResponse<{
    urlPattern: string;
    validationRules: string[];
    iconOptions: string[];
    suggestedSizes: string[];
    bestPractices: string[];
  }>> {
    return httpClient.get(`${this.baseUrl}/platforms/${platform}/settings`);
  }

  /**
   * Get social media profile info
   */
  async getProfileInfo(url: string): Promise<ApiResponse<{
    platform: SocialPlatform;
    username?: string;
    displayName?: string;
    description?: string;
    profileImage?: string;
    followerCount?: number;
    isVerified?: boolean;
    lastUpdated: string;
  }>> {
    return httpClient.post(`${this.baseUrl}/profile-info`, { url });
  }

  // ============================================================================
  // TEMPLATES & PRESETS
  // ============================================================================

  /**
   * Get social links templates
   */
  async getTemplates(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    platforms: SocialPlatform[];
    preview: string;
    settings: Partial<SocialLinksGroup['theme']>;
  }>>> {
    return httpClient.get(`${this.baseUrl}/templates`);
  }

  /**
   * Apply template to social links group
   */
  async applyTemplate(groupId: string, templateId: string): Promise<ApiResponse<SocialLinksGroup>> {
    return httpClient.post(`${this.baseUrl}/groups/${groupId}/apply-template`, { templateId });
  }

  /**
   * Create template from existing group
   */
  async createTemplate(groupId: string, templateData: {
    name: string;
    description: string;
    category: string;
  }): Promise<ApiResponse<{ id: string; name: string }>> {
    return httpClient.post(`${this.baseUrl}/templates`, { groupId, ...templateData });
  }

  // ============================================================================
  // IMPORT/EXPORT
  // ============================================================================

  /**
   * Export social links
   */
  async exportSocialLinks(params?: {
    groupId?: string;
    format: 'json' | 'csv' | 'xml';
    includeAnalytics?: boolean;
  }): Promise<ApiResponse<{ downloadUrl: string }>> {
    return httpClient.post(`${this.baseUrl}/export`, params);
  }

  /**
   * Import social links
   */
  async importSocialLinks(file: File, options?: {
    groupId?: string;
    mergeStrategy: 'replace' | 'merge' | 'append';
    validateUrls: boolean;
  }): Promise<ApiResponse<{
    imported: number;
    updated: number;
    errors: Array<{ row: number; message: string }>;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }
    return httpClient.post(`${this.baseUrl}/import`, formData);
  }

  // ============================================================================
  // SEARCH & FILTERING
  // ============================================================================

  /**
   * Search social links
   */
  async searchSocialLinks(params: {
    query: string;
    platform?: SocialPlatform;
    isActive?: boolean;
    groupId?: string;
    limit?: number;
  }): Promise<ApiResponse<SocialLink[]>> {
    return httpClient.get(`${this.baseUrl}/search`, { params });
  }

  /**
   * Get social links by platform
   */
  async getSocialLinksByPlatform(platform: SocialPlatform): Promise<ApiResponse<SocialLink[]>> {
    return httpClient.get(`${this.baseUrl}/platform/${platform}`);
  }

  /**
   * Get popular social links
   */
  async getPopularSocialLinks(limit: number = 10): Promise<ApiResponse<SocialLinkDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/popular`, { params: { limit } });
  }
}

// Create service instance
export const socialLinksService = new SocialLinksApiService();

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * Cache keys for social links queries
 */
export const SOCIAL_LINKS_CACHE_KEYS = {
  all: ['socialLinks'] as const,
  lists: () => [...SOCIAL_LINKS_CACHE_KEYS.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...SOCIAL_LINKS_CACHE_KEYS.lists(), filters] as const,
  details: () => [...SOCIAL_LINKS_CACHE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SOCIAL_LINKS_CACHE_KEYS.details(), id] as const,
  groups: () => [...SOCIAL_LINKS_CACHE_KEYS.all, 'groups'] as const,
  group: (id: string) => [...SOCIAL_LINKS_CACHE_KEYS.groups(), id] as const,
  analytics: () => [...SOCIAL_LINKS_CACHE_KEYS.all, 'analytics'] as const,
  config: () => [...SOCIAL_LINKS_CACHE_KEYS.all, 'config'] as const,
  platforms: () => [...SOCIAL_LINKS_CACHE_KEYS.all, 'platforms'] as const,
  templates: () => [...SOCIAL_LINKS_CACHE_KEYS.all, 'templates'] as const,
};

/**
 * Get all social links
 */
export const useSocialLinks = (
  params?: Parameters<typeof socialLinksService.getSocialLinks>[0],
  options?: UseQueryOptions<ApiResponse<SocialLinkDetailed[]>>
) => {
  return useQuery({
    queryKey: SOCIAL_LINKS_CACHE_KEYS.list(params || {}),
    queryFn: () => socialLinksService.getSocialLinks(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Get social link by ID
 */
export const useSocialLink = (
  id: string,
  includeAnalytics: boolean = false,
  options?: UseQueryOptions<ApiResponse<SocialLinkDetailed>>
) => {
  return useQuery({
    queryKey: SOCIAL_LINKS_CACHE_KEYS.detail(id),
    queryFn: () => socialLinksService.getSocialLink(id, includeAnalytics),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Get social links groups
 */
export const useSocialLinksGroups = (options?: UseQueryOptions<ApiResponse<SocialLinksGroup[]>>) => {
  return useQuery({
    queryKey: SOCIAL_LINKS_CACHE_KEYS.groups(),
    queryFn: () => socialLinksService.getSocialLinksGroups(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Get social links analytics
 */
export const useSocialLinksAnalytics = (
  params?: Parameters<typeof socialLinksService.getOverallAnalytics>[0],
  options?: UseQueryOptions<ApiResponse<SocialLinksAnalytics>>
) => {
  return useQuery({
    queryKey: [...SOCIAL_LINKS_CACHE_KEYS.analytics(), params || {}],
    queryFn: () => socialLinksService.getOverallAnalytics(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

/**
 * Get social links configuration
 */
export const useSocialLinksConfig = (options?: UseQueryOptions<ApiResponse<SocialLinksConfig>>) => {
  return useQuery({
    queryKey: SOCIAL_LINKS_CACHE_KEYS.config(),
    queryFn: () => socialLinksService.getConfiguration(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

/**
 * Create social link mutation
 */
export const useCreateSocialLink = (options?: UseMutationOptions<
  ApiResponse<SocialLink>,
  Error,
  Parameters<typeof socialLinksService.createSocialLink>[0]
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => socialLinksService.createSocialLink(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_LINKS_CACHE_KEYS.all });
      toast.success('Social link created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create social link');
      console.error('Create social link error:', error);
    },
    ...options,
  });
};

/**
 * Update social link mutation
 */
export const useUpdateSocialLink = (options?: UseMutationOptions<
  ApiResponse<SocialLink>,
  Error,
  { id: string; updates: Parameters<typeof socialLinksService.updateSocialLink>[1] }
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => socialLinksService.updateSocialLink(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_LINKS_CACHE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SOCIAL_LINKS_CACHE_KEYS.detail(id) });
      toast.success('Social link updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update social link');
      console.error('Update social link error:', error);
    },
    ...options,
  });
};

/**
 * Delete social link mutation
 */
export const useDeleteSocialLink = (options?: UseMutationOptions<
  ApiResponse<void>,
  Error,
  string
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => socialLinksService.deleteSocialLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_LINKS_CACHE_KEYS.all });
      toast.success('Social link deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete social link');
      console.error('Delete social link error:', error);
    },
    ...options,
  });
};

/**
 * Reorder social links mutation
 */
export const useReorderSocialLinks = (options?: UseMutationOptions<
  ApiResponse<SocialLink[]>,
  Error,
  string[]
>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds) => socialLinksService.reorderSocialLinks(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_LINKS_CACHE_KEYS.all });
      toast.success('Social links reordered successfully');
    },
    onError: (error) => {
      toast.error('Failed to reorder social links');
      console.error('Reorder social links error:', error);
    },
    ...options,
  });
};

/**
 * Track social link click mutation
 */
export const useTrackSocialLinkClick = (options?: UseMutationOptions<
  ApiResponse<void>,
  Error,
  { linkId: string; metadata?: Parameters<typeof socialLinksService.trackClick>[1] }
>) => {
  return useMutation({
    mutationFn: ({ linkId, metadata }) => socialLinksService.trackClick(linkId, metadata),
    onError: (error) => {
      console.error('Track social link click error:', error);
    },
    ...options,
  });
};

export default socialLinksService;
