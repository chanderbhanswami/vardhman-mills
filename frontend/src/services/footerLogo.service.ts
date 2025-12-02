/**
 * Footer Logo Service - Vardhman Mills Frontend
 * 
 * Comprehensive service for managing footer logos, brand assets, and footer branding.
 * Handles logo display, analytics tracking, configuration management, and real-time updates.
 * 
 * Features:
 * - Real-time logo updates with Socket.IO
 * - Advanced caching with React Query
 * - Logo impression and click analytics
 * - Multi-variant logo support
 * - Performance optimization
 * - A/B testing for logo variants
 * 
 * @version 1.0.0
 * @created 2024-01-12
 */

import { QueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { z } from 'zod';
import axios, { AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

import { debounce } from 'lodash';
import CryptoJS from 'crypto-js';

// Types
import {
  FooterLogo,
  FooterPosition,
  LogoType
} from '../types/footerLogo.types';
import { ID, Timestamp, APIResponse, ImageAsset } from '../types/common.types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interface definitions for missing types
interface FooterLogoFetchResponse {
  success: boolean;
  data: {
    logo: FooterLogo;
    variants: FooterLogo[];
    config: FooterLogoConfig;
  };
  message: string;
}

interface FooterLogosListResponse {
  success: boolean;
  data: {
    logos: FooterLogo[];
    active: FooterLogo;
    config: FooterLogoConfig;
    analytics: FooterLogoAnalytics;
  };
  message: string;
}

interface FooterLogoConfig {
  maxWidth: number;
  maxHeight: number;
  allowedFormats: string[];
  compressionQuality: number;
  lazyLoading: boolean;
  retina: boolean;
  fallbackLogo: string;
  position: FooterPosition;
  alignment: 'left' | 'center' | 'right';
  spacing: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  responsive: {
    mobile: FooterLogoResponsiveConfig;
    tablet: FooterLogoResponsiveConfig;
    desktop: FooterLogoResponsiveConfig;
  };
}

interface FooterLogoResponsiveConfig {
  width: number;
  height: number;
  position: FooterPosition;
  visible: boolean;
}

interface FooterLogoAnalytics {
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate: number;
  uniqueViews: number;
  averageViewDuration: number;
  topPerformingVariant: FooterLogo;
  dailyStats: Array<{
    date: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    impressions: number;
    clicks: number;
    percentage: number;
  }>;
  geographicBreakdown: Array<{
    country: string;
    impressions: number;
    clicks: number;
    percentage: number;
  }>;
}

interface FooterLogoFilter {
  status?: 'active' | 'inactive' | 'draft';
  type?: 'primary' | 'secondary' | 'promotional';
  position?: FooterPosition;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'updated_at' | 'impressions' | 'clicks' | 'name';
  sortOrder?: 'asc' | 'desc';
}

interface FooterLogoVariant {
  id: ID;
  name: string;
  logoId: ID;
  image: ImageAsset;
  config: Partial<FooterLogoConfig>;
  isActive: boolean;
  testWeight: number;
  performance: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversionRate: number;
  };
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const FooterLogoTrackingSchema = z.object({
  logoId: z.string().min(1, 'Logo ID is required'),
  action: z.enum(['impression', 'click', 'view', 'hover']),
  context: z.object({
    page: z.string().optional(),
    section: z.string().optional(),
    device: z.string().optional(),
    userAgent: z.string().optional()
  }).optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

// ============================================================================
// SOCKET MANAGER
// ============================================================================

class FooterLogoSocketManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  get connected(): boolean {
    return this.isConnected;
  }

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(`${SOCKET_URL}/footer-logos`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Connected to footer logo socket');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.handleReconnect();
    });

    this.socket.on('logo_updated', (data: FooterLogo) => {
      this.handleLogoUpdate(data);
    });

    this.socket.on('logo_activated', (data: { logoId: ID; logo: FooterLogo }) => {
      this.handleLogoActivation(data);
    });

    this.socket.on('config_updated', (data: FooterLogoConfig) => {
      this.handleConfigUpdate(data);
    });

    this.socket.on('analytics_update', (data: FooterLogoAnalytics) => {
      this.handleAnalyticsUpdate(data);
    });

    this.socket.on('variant_test_started', (data: { logoId: ID; variants: FooterLogoVariant[] }) => {
      this.handleVariantTestStart(data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  subscribeToLogo(logoId: ID): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_logo', { logoId });
    }
  }

  subscribeToAnalytics(): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_analytics');
    }
  }

  emit(event: string, data: unknown): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    }
  }

  private handleLogoUpdate(data: FooterLogo): void {
    // Update React Query cache
    FooterLogoService.queryClient?.setQueryData(['footer_logo', data.id], data);
    FooterLogoService.queryClient?.invalidateQueries({ queryKey: ['footer_logos'] });
    
    toast.success('Footer logo updated');
  }

  private handleLogoActivation(data: { logoId: ID; logo: FooterLogo }): void {
    // Update active logo cache
    FooterLogoService.queryClient?.setQueryData(['active_footer_logo'], data.logo);
    FooterLogoService.queryClient?.invalidateQueries({ queryKey: ['footer_logos'] });
    
    toast.success('Active footer logo changed');
  }

  private handleConfigUpdate(data: FooterLogoConfig): void {
    // Update config cache
    FooterLogoService.queryClient?.setQueryData(['footer_logo_config'], data);
  }

  private handleAnalyticsUpdate(data: FooterLogoAnalytics): void {
    // Update analytics cache
    FooterLogoService.queryClient?.setQueryData(['footer_logo_analytics'], data);
  }

  private handleVariantTestStart(data: { logoId: ID; variants: FooterLogoVariant[] }): void {
    // Update variants cache
    FooterLogoService.queryClient?.setQueryData(['footer_logo_variants', data.logoId], data.variants);
    
    toast('A/B test started for footer logo', { icon: '🧪' });
  }
}

// ============================================================================
// ANALYTICS MANAGER
// ============================================================================

class FooterLogoAnalyticsManager {
  private static readonly ANALYTICS_ENDPOINT = '/analytics/footer-logos';

  static async trackImpression(logoId: ID, context?: Record<string, unknown>): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/impression`, {
        logoId,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId(),
        context: {
          page: window.location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          ...context
        }
      });
    } catch (error) {
      console.error('Failed to track footer logo impression:', error);
    }
  }

  static async trackClick(logoId: ID, context?: Record<string, unknown>): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/click`, {
        logoId,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId(),
        context: {
          page: window.location.pathname,
          clickPosition: context?.clickPosition,
          userAgent: navigator.userAgent,
          ...context
        }
      });
    } catch (error) {
      console.error('Failed to track footer logo click:', error);
    }
  }

  static async trackHover(logoId: ID, duration: number): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/hover`, {
        logoId,
        duration,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track footer logo hover:', error);
    }
  }

  static async trackView(logoId: ID, viewDuration: number): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/view`, {
        logoId,
        viewDuration,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track footer logo view:', error);
    }
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('footer_logo_session_id');
    if (!sessionId) {
      sessionId = CryptoJS.lib.WordArray.random(16).toString();
      sessionStorage.setItem('footer_logo_session_id', sessionId);
    }
    return sessionId;
  }
}

// ============================================================================
// CACHE MANAGER
// ============================================================================

class FooterLogoCacheManager {
  private static readonly CACHE_PREFIX = 'footer_logo_';
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private static readonly ACTIVE_LOGO_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  static setLogo(logoId: ID, logo: FooterLogo): void {
    try {
      const cacheData = {
        data: logo,
        timestamp: Date.now()
      };
      window.localStorage.setItem(
        `${this.CACHE_PREFIX}${logoId}`,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Failed to cache footer logo:', error);
    }
  }

  static getLogo(logoId: ID): FooterLogo | null {
    try {
      const cached = window.localStorage.getItem(`${this.CACHE_PREFIX}${logoId}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        this.removeLogo(logoId);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Failed to get cached footer logo:', error);
      return null;
    }
  }

  static setActiveLogo(logo: FooterLogo): void {
    try {
      const cacheData = {
        data: logo,
        timestamp: Date.now()
      };
      window.localStorage.setItem(
        `${this.CACHE_PREFIX}active`,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Failed to cache active footer logo:', error);
    }
  }

  static getActiveLogo(): FooterLogo | null {
    try {
      const cached = window.localStorage.getItem(`${this.CACHE_PREFIX}active`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.ACTIVE_LOGO_CACHE_DURATION;
      
      if (isExpired) {
        window.localStorage.removeItem(`${this.CACHE_PREFIX}active`);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Failed to get cached active footer logo:', error);
      return null;
    }
  }

  static setConfig(config: FooterLogoConfig): void {
    try {
      const cacheData = {
        data: config,
        timestamp: Date.now()
      };
      window.localStorage.setItem(
        `${this.CACHE_PREFIX}config`,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Failed to cache footer logo config:', error);
    }
  }

  static getConfig(): FooterLogoConfig | null {
    try {
      const cached = window.localStorage.getItem(`${this.CACHE_PREFIX}config`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        window.localStorage.removeItem(`${this.CACHE_PREFIX}config`);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Failed to get cached footer logo config:', error);
      return null;
    }
  }

  static removeLogo(logoId: ID): void {
    try {
      window.localStorage.removeItem(`${this.CACHE_PREFIX}${logoId}`);
    } catch (error) {
      console.error('Failed to remove cached footer logo:', error);
    }
  }

  static clearCache(): void {
    try {
      const keys = Object.keys(window.localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          window.localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear footer logo cache:', error);
    }
  }
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

export class FooterLogoService {
  public static queryClient: QueryClient | null = null;
  private static socketManager: FooterLogoSocketManager | null = null;
  private static debouncedTrackImpression: ReturnType<typeof debounce> | null = null;

  // Initialize service
  static initialize(queryClient: QueryClient): void {
    this.queryClient = queryClient;
    this.socketManager = new FooterLogoSocketManager();
    this.socketManager.connect();

    // Initialize debounced impression tracking
    this.debouncedTrackImpression = debounce(
      (logoId: ID, context?: Record<string, unknown>) => {
        FooterLogoAnalyticsManager.trackImpression(logoId, context);
      },
      1000 // Track impressions at most once per second
    );
  }

  // Cleanup
  static cleanup(): void {
    this.socketManager?.disconnect();
    this.socketManager = null;
    this.debouncedTrackImpression = null;
  }

  // ============================================================================
  // LOGO RETRIEVAL
  // ============================================================================

  /**
   * Get active footer logo for display
   */
  static async getActiveLogo(): Promise<FooterLogoFetchResponse> {
    try {
      // Check cache first
      const cached = FooterLogoCacheManager.getActiveLogo();
      if (cached) {
        // Track impression (debounced)
        this.debouncedTrackImpression?.(cached.id);
        
        return {
          success: true,
          data: {
            logo: cached,
            variants: [],
            config: FooterLogoCacheManager.getConfig() || this.getDefaultConfig()
          },
          message: 'Active footer logo retrieved from cache'
        };
      }

      const response: AxiosResponse<APIResponse<FooterLogoFetchResponse['data']>> =
        await apiClient.get('/footer-logos/active');

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        
        // Cache the active logo and config
        FooterLogoCacheManager.setActiveLogo(data.logo);
        if (data.config) {
          FooterLogoCacheManager.setConfig(data.config);
        }
        
        // Track impression (debounced)
        this.debouncedTrackImpression?.(data.logo.id);
        
        // Subscribe to real-time updates
        this.socketManager?.subscribeToLogo(data.logo.id);

        return {
          success: true,
          data,
          message: 'Active footer logo retrieved successfully'
        };
      }

      throw new Error(response.data.message || 'Failed to fetch active footer logo');
    } catch (error) {
      console.error('Error fetching active footer logo:', error);
      
      // Return fallback logo if available
      const fallbackLogo = this.getFallbackLogo();
      if (fallbackLogo) {
        return {
          success: true,
          data: {
            logo: fallbackLogo,
            variants: [],
            config: this.getDefaultConfig()
          },
          message: 'Using fallback footer logo'
        };
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch active footer logo');
    }
  }

  /**
   * Get footer logo configuration
   */
  static async getLogoConfig(): Promise<FooterLogosListResponse> {
    try {
      // Check cache first
      const cachedConfig = FooterLogoCacheManager.getConfig();
      if (cachedConfig) {
        return {
          success: true,
          data: {
            logos: [],
            active: FooterLogoCacheManager.getActiveLogo()!,
            config: cachedConfig,
            analytics: await this.getCachedAnalytics()
          },
          message: 'Footer logo config retrieved from cache'
        };
      }

      const response: AxiosResponse<APIResponse<FooterLogosListResponse['data']>> =
        await apiClient.get('/footer-logos/config');

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        
        // Cache the config
        FooterLogoCacheManager.setConfig(data.config);
        if (data.active) {
          FooterLogoCacheManager.setActiveLogo(data.active);
        }

        return {
          success: true,
          data,
          message: 'Footer logo config retrieved successfully'
        };
      }

      throw new Error(response.data.message || 'Failed to fetch footer logo config');
    } catch (error) {
      console.error('Error fetching footer logo config:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch footer logo config');
    }
  }

  /**
   * Get all footer logos with filters
   */
  static async getFooterLogos(filters?: FooterLogoFilter): Promise<FooterLogosListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.position) params.append('position', filters.position);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response: AxiosResponse<APIResponse<FooterLogosListResponse['data']>> =
        await apiClient.get(`/footer-logos?${params.toString()}`);

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        
        // Cache individual logos
        data.logos.forEach(logo => {
          FooterLogoCacheManager.setLogo(logo.id, logo);
        });

        // Cache active logo and config
        if (data.active) {
          FooterLogoCacheManager.setActiveLogo(data.active);
        }
        if (data.config) {
          FooterLogoCacheManager.setConfig(data.config);
        }

        return {
          success: true,
          data,
          message: 'Footer logos retrieved successfully'
        };
      }

      throw new Error(response.data.message || 'Failed to fetch footer logos');
    } catch (error) {
      console.error('Error fetching footer logos:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch footer logos');
    }
  }

  // ============================================================================
  // ANALYTICS TRACKING
  // ============================================================================

  /**
   * Track logo impression
   */
  static async trackImpression(logoId: ID, context?: Record<string, unknown>): Promise<void> {
    try {
      // Use debounced tracking to avoid spam
      this.debouncedTrackImpression?.(logoId, context);
    } catch (error) {
      console.error('Error tracking footer logo impression:', error);
    }
  }

  /**
   * Track logo click
   */
  static async trackClick(logoId: ID, context?: Record<string, unknown>): Promise<void> {
    try {
      await FooterLogoAnalyticsManager.trackClick(logoId, context);
      toast.success('Click tracked', { duration: 1000 });
    } catch (error) {
      console.error('Error tracking footer logo click:', error);
    }
  }

  /**
   * Track logo hover
   */
  static async trackHover(logoId: ID, duration: number): Promise<void> {
    try {
      if (duration > 500) { // Only track hovers longer than 500ms
        await FooterLogoAnalyticsManager.trackHover(logoId, duration);
      }
    } catch (error) {
      console.error('Error tracking footer logo hover:', error);
    }
  }

  /**
   * Track logo view duration
   */
  static async trackView(logoId: ID, viewDuration: number): Promise<void> {
    try {
      if (viewDuration > 1000) { // Only track views longer than 1 second
        await FooterLogoAnalyticsManager.trackView(logoId, viewDuration);
      }
    } catch (error) {
      console.error('Error tracking footer logo view:', error);
    }
  }

  // ============================================================================
  // LOGO VARIANTS AND A/B TESTING
  // ============================================================================

  /**
   * Get logo variants for A/B testing
   */
  static async getLogoVariants(logoId: ID): Promise<FooterLogoVariant[]> {
    try {
      const response: AxiosResponse<APIResponse<{ variants: FooterLogoVariant[] }>> =
        await apiClient.get(`/footer-logos/${logoId}/variants`);

      if (response.data.success && response.data.data) {
        return response.data.data.variants;
      }

      return [];
    } catch (error) {
      console.error('Error fetching footer logo variants:', error);
      return [];
    }
  }

  /**
   * Get optimal logo variant based on A/B testing
   */
  static async getOptimalVariant(logoId: ID, context?: Record<string, unknown>): Promise<FooterLogoVariant | null> {
    try {
      const response: AxiosResponse<APIResponse<{ variant: FooterLogoVariant }>> =
        await apiClient.post(`/footer-logos/${logoId}/optimal-variant`, { context });

      if (response.data.success && response.data.data) {
        return response.data.data.variant;
      }

      return null;
    } catch (error) {
      console.error('Error fetching optimal footer logo variant:', error);
      return null;
    }
  }

  // ============================================================================
  // ANALYTICS RETRIEVAL
  // ============================================================================

  /**
   * Get footer logo analytics
   */
  static async getAnalytics(dateRange?: { start: string; end: string }): Promise<FooterLogoAnalytics> {
    try {
      const params = new URLSearchParams();
      if (dateRange?.start) params.append('start', dateRange.start);
      if (dateRange?.end) params.append('end', dateRange.end);

      const response: AxiosResponse<APIResponse<FooterLogoAnalytics>> =
        await apiClient.get(`/footer-logos/analytics?${params.toString()}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to get analytics');
    } catch (error) {
      console.error('Error getting footer logo analytics:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get analytics');
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get default footer logo configuration
   */
  private static getDefaultConfig(): FooterLogoConfig {
    return {
      maxWidth: 200,
      maxHeight: 80,
      allowedFormats: ['png', 'jpg', 'svg', 'webp'],
      compressionQuality: 85,
      lazyLoading: true,
      retina: true,
      fallbackLogo: '/images/fallback-logo.png',
      position: 'center' as FooterPosition,
      alignment: 'center',
      spacing: {
        top: 20,
        bottom: 20,
        left: 0,
        right: 0
      },
      responsive: {
        mobile: {
          width: 120,
          height: 48,
          position: 'center' as FooterPosition,
          visible: true
        },
        tablet: {
          width: 160,
          height: 64,
          position: 'center' as FooterPosition,
          visible: true
        },
        desktop: {
          width: 200,
          height: 80,
          position: 'center' as FooterPosition,
          visible: true
        }
      }
    };
  }

  /**
   * Get fallback footer logo
   */
  private static getFallbackLogo(): FooterLogo | null {
    try {
      return {
        id: 'fallback',
        name: 'Fallback Logo',
        description: 'Default fallback logo for footer',
        type: 'primary_brand' as LogoType,
        category: 'brand',
        primaryLogo: {
          id: 'fallback-logo',
          url: '/images/fallback-footer-logo.png',
          alt: 'Vardhman Mills',
          width: 200,
          height: 80,
          format: 'png',
          size: 5120,
          title: 'Vardhman Mills Logo',



        },
        responsiveVariants: [],
        brandGuidelines: {
          minSize: { width: 100, height: 40 },
          maxSize: { width: 400, height: 160 },
          clearSpace: { top: 10, right: 10, bottom: 10, left: 10 },
          primaryColors: ['#000000'],
          secondaryColors: [],
          accentColors: [],
          backgroundColors: ['#ffffff'],
          restrictedColors: [],
          usageRules: [],
          prohibitedUses: [],
          contextualGuidelines: [],
          brandPersonality: [],
          communicationGuidelines: [],
          toneOfVoice: 'Professional'
        },
        colorScheme: {
          primary: '#000000',
          primaryLight: '#333333',
          primaryDark: '#000000',
          backgroundLight: '#ffffff',
          backgroundDark: '#000000',
          textOnLight: '#000000',
          textOnDark: '#ffffff',
          lightModeColors: {},
          darkModeColors: {},
          contrastRatios: [],
          wcagCompliance: 'AA'
        },
        typography: {
          primaryFont: 'Arial',
          fallbackFonts: ['Helvetica', 'sans-serif'],
          fontDisplay: 'swap',
          preloadFonts: false,
          fontWeights: {},
          fontSizes: {},
          lineHeights: {},
          letterSpacing: {},
          responsiveScaling: [],
          readabilitySettings: {
            minFontSize: '12px',
            maxLineLength: '80ch',
            optimalLineHeight: 1.5,
            paragraphSpacing: '16px'
          }
        },
        displaySettings: {
          layout: 'single_column',
          columns: 1,
          maxWidth: '200px',
          padding: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
          margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
          background: { opacity: 1 },
          border: { width: '0px', style: 'none', color: 'transparent', radius: '0px' },
          shadow: { enabled: false, offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
          itemSpacing: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
          sectionSpacing: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
          responsiveSettings: {},
          hideOnMobile: false,
          stackOnMobile: false,
          animations: {
            entranceAnimation: 'fade_in',
            entranceDelay: 0,
            entranceDuration: 300,
            exitDuration: 200,
            hoverDuration: 200,
            loadingDuration: 1000,
            scrollAnimations: [],
            useGPUAcceleration: true,
            respectMotionPreferences: true,
            easingFunction: 'ease'
          },
          transitions: { property: 'all', duration: 200, easing: 'ease', delay: 0 },
          ariaLabel: 'Footer Logo',
          landmarks: true
        },
        position: 'center',
        alignment: 'center',
        size: 'md',
        visibilityRules: [],
        showOnPages: [],
        hideOnPages: [],
        behavior: {
          clickAction: 'home',
          openInNewTab: false,
          trackClicks: true,
          hoverEnabled: true,
          hoverAnimation: 'scale',
          hoverScale: 1.05,
          hoverOpacity: 1,
          lazyLoading: true,
          preload: false,
          scrollEffects: [],
          parallaxEnabled: false,
          stickyBehavior: { enabled: false, offset: '0px', zIndex: 1 },
          activeState: { opacity: 1, scale: 1 },
          focusState: { opacity: 1, scale: 1 },
          disabledState: { opacity: 0.5, scale: 1 }
        },
        interactionSettings: {
          onHover: [],
          onClick: [],
          onDoubleClick: [],
          onTouch: [],
          onSwipe: [],
          onLongPress: [],
          onKeyPress: [],
          onFocus: [],
          onBlur: [],
          customEvents: [],
          trackInteractions: true,
          analyticsEvents: []
        },
        animationSettings: {
          entranceAnimation: 'fade_in',
          entranceDelay: 0,
          entranceDuration: 300,
          exitDuration: 200,
          hoverDuration: 200,
          loadingDuration: 1000,
          scrollAnimations: [],
          useGPUAcceleration: true,
          respectMotionPreferences: true,
          easingFunction: 'ease'
        },
        linkSettings: {
          target: '_self',
          rel: [],
          queryParams: {},
          conditionalLinks: [],
          noFollow: false,
          noOpener: false,
          noReferrer: false,
          trackingParams: [],
          utmParameters: {}
        },
        trackingSettings: {
          googleAnalyticsEnabled: false,
          customAnalytics: [],
          eventTracking: [],
          goalTracking: [],
          performanceTracking: { enabled: false, metrics: [], sampling: 1, thresholds: {} },
          errorTracking: { enabled: false, captureJSErrors: false, captureNetworkErrors: false, captureConsoleErrors: false, sampling: 1 },
          heatmapTracking: false,
          userJourneyTracking: false,
          respectDoNotTrack: true,
          cookieConsent: true,
          dataRetention: { duration: 30, anonymizeAfter: 90, deleteAfter: 365, exportBeforeDelete: false }
        },
        legalInfo: {
          owner: 'Vardhman Mills',
          ownerType: 'company',
          registeredTrademark: true,
          usageRights: [],
          licensingInfo: { licenseType: 'proprietary', licenseText: 'All rights reserved', renewalRequired: false },
          restrictions: [],
          complianceRequirements: [],
          legalNotices: [],
          disclaimers: [],
          attributionRequired: false
        },
        copyrightInfo: {
          copyrightYear: 2024,
          copyrightHolder: 'Vardhman Mills',
          copyrightNotice: '© 2024 Vardhman Mills. All rights reserved.',
          terms: [],
          duration: 'Perpetual',
          transferability: false,
          internationalProtection: true,
          protectedCountries: ['IN', 'US'],
          enforcementPolicy: 'Strict enforcement of all intellectual property rights',
          contactInfo: { name: 'Legal Team', email: 'legal@vardhmanmills.com' }
        },
        usageRights: {
          permittedUses: [],
          commercialUse: true,
          modificationsAllowed: false,
          redistributionAllowed: false,
          restrictions: [],
          geographicRestrictions: [],
          timeRestrictions: [],
          attributionRequired: false,
          attributionFormat: '',
          licenseType: 'proprietary',
          licenseText: 'All rights reserved',
          sublicensingAllowed: false
        },
        status: 'active',
        language: 'en',
        version: '1.0.0',
        analytics: {
          impressions: 0,
          clicks: 0,
          clickThroughRate: 0,
          hoverCount: 0,
          averageHoverTime: 0,
          uniqueInteractions: 0,
          loadTime: 0,
          errorRate: 0,
          successRate: 100,
          scrollDepth: 0,
          timeInView: 0,
          bounceRate: 0,
          conversions: 0,
          conversionRate: 0,
          goalCompletions: [],
          renderTime: 0,
          bandwidthUsage: 0,
          cacheHitRate: 100,
          benchmarkComparison: { industry: 'Manufacturing', metric: 'CTR', ourValue: 0, industryAverage: 2.5, percentile: 50 },
          historicalTrends: [],
          deviceAnalytics: [],
          locationAnalytics: [],
          timeAnalytics: [],
          lastUpdated: new Date().toISOString() as Timestamp,
          dataFreshness: 0
        },
        seo: {
          title: 'Vardhman Mills Footer Logo',
          description: 'Official footer logo of Vardhman Mills',
          keywords: ['Vardhman Mills', 'Logo', 'Footer'],
          structuredData: {}
        },
        createdAt: new Date().toISOString() as Timestamp,
        updatedAt: new Date().toISOString() as Timestamp
      };
    } catch (error) {
      console.error('Failed to create fallback logo:', error);
      return null;
    }
  }

  /**
   * Get cached analytics or return empty analytics
   */
  private static async getCachedAnalytics(): Promise<FooterLogoAnalytics> {
    return {
      totalImpressions: 0,
      totalClicks: 0,
      clickThroughRate: 0,
      uniqueViews: 0,
      averageViewDuration: 0,
      topPerformingVariant: this.getFallbackLogo()!,
      dailyStats: [],
      deviceBreakdown: [],
      geographicBreakdown: []
    };
  }

  /**
   * Check if logo should be displayed based on configuration
   */
  static shouldDisplayLogo(config: FooterLogoConfig, deviceType: 'mobile' | 'tablet' | 'desktop'): boolean {
    return config.responsive[deviceType]?.visible ?? true;
  }

  /**
   * Get responsive logo dimensions
   */
  static getResponsiveDimensions(config: FooterLogoConfig, deviceType: 'mobile' | 'tablet' | 'desktop'): {
    width: number;
    height: number;
  } {
    const responsive = config.responsive[deviceType];
    return {
      width: responsive?.width ?? config.maxWidth,
      height: responsive?.height ?? config.maxHeight
    };
  }

  /**
   * Get logo position for device
   */
  static getLogoPosition(config: FooterLogoConfig, deviceType: 'mobile' | 'tablet' | 'desktop'): FooterPosition {
    return config.responsive[deviceType]?.position ?? config.position;
  }

  /**
   * Generate optimized logo URL
   */
  static getOptimizedLogoUrl(logo: FooterLogo, width: number, height: number, format?: string): string {
    try {
      const baseUrl = logo.primaryLogo.url;
      const params = new URLSearchParams();
      
      params.append('w', width.toString());
      params.append('h', height.toString());
      if (format) params.append('f', format);
      params.append('q', '85'); // Quality
      
      return `${baseUrl}?${params.toString()}`;
    } catch (error) {
      console.error('Error generating optimized logo URL:', error);
      return logo.primaryLogo.url;
    }
  }

  /**
   * Get socket connection status
   */
  static isSocketConnected(): boolean {
    return this.socketManager?.connected || false;
  }

  /**
   * Clear all caches
   */
  static clearCache(): void {
    FooterLogoCacheManager.clearCache();
    this.queryClient?.clear();
  }

  /**
   * Validate tracking data
   */
  static validateTrackingData(data: unknown): boolean {
    try {
      FooterLogoTrackingSchema.parse(data);
      return true;
    } catch (error) {
      console.error('Invalid tracking data:', error);
      return false;
    }
  }
}

// Create singleton instance
export default FooterLogoService;

// Export utility functions
export {
  FooterLogoSocketManager,
  FooterLogoAnalyticsManager,
  FooterLogoCacheManager,
};

// Export interfaces for external use
export type {
  FooterLogoFetchResponse,
  FooterLogosListResponse,
  FooterLogoConfig,
  FooterLogoAnalytics,
  FooterLogoFilter,
  FooterLogoVariant
};

