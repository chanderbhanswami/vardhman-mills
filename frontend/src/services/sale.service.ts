/**
 * Sales Service - Vardhman Mills Frontend
 * 
 * Comprehensive service for managing sales campaigns, promotional events, flash sales,
 * and marketing campaigns. Handles real-time sales tracking, analytics, and user engagement.
 * 
 * Features:
 * - Real-time sales updates with Socket.IO
 * - Advanced caching with React Query
 * - Sales performance analytics
 * - Campaign management and scheduling
 * - User behavior tracking
 * - A/B testing for sales campaigns
 * 
 * @version 1.0.0
 * @created 2024-01-12
 */

import { QueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { z } from 'zod';
import axios, { AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import CryptoJS from 'crypto-js';

// Types
import {
  Sale,
  SaleType,
  SaleStatus,
  SaleAnalytics,
  FlashSale,

  BasicSaleMetrics,
  SalePerformanceMetrics
} from '../types/sale.types';
import { ID, Timestamp, APIResponse, Price, PaginatedResponse } from '../types/common.types';
import { Product } from '../types/product.types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
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
interface SaleListResponse extends PaginatedResponse<Sale> {
  sales: Sale[];
  activeSales: Sale[];
  upcomingSales: Sale[];
  totalDiscountOffered: Price;
  categories: Array<{
    type: SaleType;
    count: number;
  }>;
}

interface UserSalesResponse {
  availableSales: Sale[];
  personalizedOffers: Sale[];
  recentlyViewed: Sale[];
  recommendations: Sale[];
  flashSales: FlashSale[];
  totalPotentialSavings: Price;
}

interface SaleFilter {
  status?: SaleStatus;
  type?: SaleType;
  category?: string;
  minDiscount?: number;
  maxDiscount?: number;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'start_date' | 'end_date' | 'discount_value' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

interface SaleParticipationRequest {
  saleId: ID;
  userId?: ID;
  productIds?: ID[];
  quantity?: number;
  sessionData?: Record<string, unknown>;
}

interface SaleParticipationResponse {
  success: boolean;
  sale: Sale;
  eligibleProducts: Product[];
  appliedDiscount: Price;
  restrictions?: string[];
  message: string;
}

interface FlashSaleCountdown {
  saleId: ID;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  isStarted: boolean;
  isEnded: boolean;
  participantsCount: number;
  productsLeft: number;
}

interface SaleMetrics {
  basic: BasicSaleMetrics;
  performance: SalePerformanceMetrics;
  revenue: number;
  participants: number;
  conversionRate: number;
  averageOrderValue: number;
}

interface CampaignPerformance {
  totalRevenue: number;
  totalSales: number;
  averageConversion: number;
  bestPerformingSale: Sale;
  worstPerformingSale: Sale;
  overallROI: number;
  periodComparison: {
    current: SaleMetrics;
    previous: SaleMetrics;
    growth: number;
  };
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const SaleParticipationSchema = z.object({
  saleId: z.string().min(1, 'Sale ID is required'),
  userId: z.string().optional(),
  productIds: z.array(z.string()).optional(),
  quantity: z.number().min(1).optional(),
  sessionData: z.record(z.string(), z.unknown()).optional()
});

// ============================================================================
// SOCKET MANAGER
// ============================================================================

class SalesSocketManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  get connected(): boolean {
    return this.isConnected;
  }

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(`${SOCKET_URL}/sales`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Connected to sales socket');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.handleReconnect();
    });

    this.socket.on('sale_started', (data: Sale) => {
      this.handleSaleStarted(data);
    });

    this.socket.on('sale_ended', (data: { saleId: ID; saleName: string }) => {
      this.handleSaleEnded(data);
    });

    this.socket.on('flash_sale_update', (data: FlashSaleCountdown) => {
      this.handleFlashSaleUpdate(data);
    });

    this.socket.on('sale_metrics_update', (data: { saleId: ID; metrics: SaleMetrics }) => {
      this.handleSaleMetricsUpdate(data);
    });

    this.socket.on('new_personalized_offer', (data: Sale) => {
      this.handleNewPersonalizedOffer(data);
    });

    this.socket.on('sale_participation_update', (data: { saleId: ID; participantsCount: number }) => {
      this.handleSaleParticipationUpdate(data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  subscribeToSale(saleId: ID): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_sale', { saleId });
    }
  }

  subscribeToUserOffers(userId?: ID): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_user_offers', { userId });
    }
  }

  subscribeToFlashSales(): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_flash_sales');
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

  private handleSaleStarted(data: Sale): void {
    // Update React Query cache
    SalesService.queryClient?.setQueryData(['sale', data.id], data);
    SalesService.queryClient?.invalidateQueries({ queryKey: ['sales'] });
    
    toast.success(`Sale started: ${data.name}`, { icon: '🎉' });
  }

  private handleSaleEnded(data: { saleId: ID; saleName: string }): void {
    // Update cache to reflect ended status
    SalesService.queryClient?.setQueryData(['sale', data.saleId], (old: Sale | undefined) => 
      old ? { ...old, status: 'ended' as SaleStatus } : old
    );
    
    toast(`Sale ended: ${data.saleName}`, { icon: '⏰' });
  }

  private handleFlashSaleUpdate(data: FlashSaleCountdown): void {
    // Update flash sale countdown cache
    SalesService.queryClient?.setQueryData(['flash_sale_countdown', data.saleId], data);
  }

  private handleSaleMetricsUpdate(data: { saleId: ID; metrics: SaleMetrics }): void {
    // Update sale metrics in cache
    SalesService.queryClient?.setQueryData(['sale_metrics', data.saleId], data.metrics);
  }

  private handleNewPersonalizedOffer(data: Sale): void {
    // Add to personalized offers cache
    SalesService.queryClient?.setQueryData(['sale', data.id], data);
    
    toast.success(`New offer available: ${data.name}`, { icon: '🎁' });
  }

  private handleSaleParticipationUpdate(data: { saleId: ID; participantsCount: number }): void {
    // Update participation count in sale data
    SalesService.queryClient?.setQueryData(['sale', data.saleId], (old: Sale | undefined) => 
      old ? { ...old, participantsCount: data.participantsCount } : old
    );
  }
}

// ============================================================================
// ANALYTICS MANAGER
// ============================================================================

class SalesAnalyticsManager {
  private static readonly ANALYTICS_ENDPOINT = '/analytics/sales';

  // Debounced tracking methods
  static debouncedTrackSaleView = debounce(async (saleId: ID) => {
    await SalesAnalyticsManager.trackSaleView(saleId);
  }, 1000);

  static async trackSaleView(saleId: ID): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/view`, {
        saleId,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track sale view:', error);
    }
  }

  static async trackSaleParticipation(saleId: ID, participationType: string): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/participation`, {
        saleId,
        participationType,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track sale participation:', error);
    }
  }

  static async trackSaleConversion(saleId: ID, conversionValue: number, orderId?: ID): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/conversion`, {
        saleId,
        conversionValue,
        orderId,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track sale conversion:', error);
    }
  }

  static async trackSaleShare(saleId: ID, method: string): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/share`, {
        saleId,
        method,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track sale share:', error);
    }
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('sales_session_id');
    if (!sessionId) {
      sessionId = CryptoJS.lib.WordArray.random(16).toString();
      sessionStorage.setItem('sales_session_id', sessionId);
    }
    return sessionId;
  }
}

// ============================================================================
// CACHE MANAGER
// ============================================================================

class SalesCacheManager {
  private static readonly CACHE_PREFIX = 'sale_';
  private static readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
  private static readonly FLASH_SALE_CACHE_DURATION = 1 * 60 * 1000; // 1 minute for flash sales

  static setSale(saleId: ID, sale: Sale): void {
    try {
      const cacheData = {
        data: sale,
        timestamp: Date.now()
      };
      window.localStorage.setItem(
        `${this.CACHE_PREFIX}${saleId}`,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Failed to cache sale:', error);
    }
  }

  static getSale(saleId: ID): Sale | null {
    try {
      const cached = window.localStorage.getItem(`${this.CACHE_PREFIX}${saleId}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        this.removeSale(saleId);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Failed to get cached sale:', error);
      return null;
    }
  }

  static setFlashSaleCountdown(saleId: ID, countdown: FlashSaleCountdown): void {
    try {
      const cacheData = {
        data: countdown,
        timestamp: Date.now()
      };
      window.localStorage.setItem(
        `${this.CACHE_PREFIX}countdown_${saleId}`,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Failed to cache flash sale countdown:', error);
    }
  }

  static getFlashSaleCountdown(saleId: ID): FlashSaleCountdown | null {
    try {
      const cached = window.localStorage.getItem(`${this.CACHE_PREFIX}countdown_${saleId}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.FLASH_SALE_CACHE_DURATION;
      
      if (isExpired) {
        window.localStorage.removeItem(`${this.CACHE_PREFIX}countdown_${saleId}`);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Failed to get cached flash sale countdown:', error);
      return null;
    }
  }

  static removeSale(saleId: ID): void {
    try {
      window.localStorage.removeItem(`${this.CACHE_PREFIX}${saleId}`);
    } catch (error) {
      console.error('Failed to remove cached sale:', error);
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
      console.error('Failed to clear sales cache:', error);
    }
  }
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

export class SalesService {
  public static queryClient: QueryClient | null = null;
  private static socketManager: SalesSocketManager | null = null;

  // Initialize service
  static initialize(queryClient: QueryClient): void {
    this.queryClient = queryClient;
    this.socketManager = new SalesSocketManager();
    this.socketManager.connect();
  }

  // Cleanup
  static cleanup(): void {
    this.socketManager?.disconnect();
    this.socketManager = null;
  }

  // ============================================================================
  // SALES CRUD OPERATIONS (READ-ONLY FOR FRONTEND)
  // ============================================================================

  /**
   * Get all available sales with filters
   */
  static async getSales(filters?: SaleFilter): Promise<SaleListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.minDiscount) params.append('minDiscount', filters.minDiscount.toString());
      if (filters?.maxDiscount) params.append('maxDiscount', filters.maxDiscount.toString());
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response: AxiosResponse<APIResponse<SaleListResponse>> =
        await apiClient.get(`/sales?${params.toString()}`);

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        
        // Cache individual sales
        data.sales.forEach(sale => {
          SalesCacheManager.setSale(sale.id, sale);
        });

        return data;
      }

      throw new Error(response.data.message || 'Failed to fetch sales');
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch sales');
    }
  }

  /**
   * Get single sale by ID
   */
  static async getSale(id: ID): Promise<Sale> {
    try {
      // Check cache first
      const cached = SalesCacheManager.getSale(id);
      if (cached) {
        SalesAnalyticsManager.trackSaleView(id);
        return cached;
      }

      const response: AxiosResponse<APIResponse<Sale>> =
        await apiClient.get(`/sales/${id}`);

      if (response.data.success && response.data.data) {
        const sale = response.data.data;
        
        // Cache the sale
        SalesCacheManager.setSale(id, sale);
        
        // Track analytics
        SalesAnalyticsManager.trackSaleView(id);
        
        // Subscribe to real-time updates
        this.socketManager?.subscribeToSale(id);

        return sale;
      }

      throw new Error(response.data.message || 'Sale not found');
    } catch (error) {
      console.error('Error fetching sale:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch sale');
    }
  }

  /**
   * Get user-specific sales and offers
   */
  static async getUserSales(userId?: ID): Promise<UserSalesResponse> {
    try {
      const endpoint = userId ? `/sales/user/${userId}` : '/sales/user';
      const response: AxiosResponse<APIResponse<UserSalesResponse>> =
        await apiClient.get(endpoint);

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        
        // Cache available sales
        data.availableSales.forEach(sale => {
          SalesCacheManager.setSale(sale.id, sale);
        });

        // Subscribe to real-time updates
        this.socketManager?.subscribeToUserOffers(userId);

        return data;
      }

      throw new Error(response.data.message || 'Failed to fetch user sales');
    } catch (error) {
      console.error('Error fetching user sales:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user sales');
    }
  }

  /**
   * Get active flash sales
   */
  static async getFlashSales(): Promise<FlashSale[]> {
    try {
      const response: AxiosResponse<APIResponse<{ flashSales: FlashSale[] }>> =
        await apiClient.get('/sales/flash');

      if (response.data.success && response.data.data) {
        const flashSales = response.data.data.flashSales;
        
        // Subscribe to flash sale updates
        this.socketManager?.subscribeToFlashSales();

        return flashSales;
      }

      return [];
    } catch (error) {
      console.error('Error fetching flash sales:', error);
      return [];
    }
  }

  // ============================================================================
  // SALE PARTICIPATION
  // ============================================================================

  /**
   * Participate in a sale
   */
  static async participateInSale(request: SaleParticipationRequest): Promise<SaleParticipationResponse> {
    try {
      // Validate input
      const validatedRequest = SaleParticipationSchema.parse(request);

      const response: AxiosResponse<APIResponse<SaleParticipationResponse>> =
        await apiClient.post('/sales/participate', validatedRequest);

      if (response.data.success && response.data.data) {
        const result = response.data.data;
        
        // Track analytics
        SalesAnalyticsManager.trackSaleParticipation(validatedRequest.saleId, 'direct');
        
        // Update sale cache with latest data
        SalesCacheManager.setSale(result.sale.id, result.sale);
        
        toast.success(result.message || 'Successfully joined the sale');
        return result;
      }

      throw new Error(response.data.message || 'Failed to participate in sale');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        ).join(', ');
        throw new Error(`Validation failed: ${fieldErrors}`);
      }
      
      console.error('Error participating in sale:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to participate in sale');
    }
  }

  /**
   * Check sale eligibility
   */
  static async checkSaleEligibility(saleId: ID, userId?: ID): Promise<{
    isEligible: boolean;
    reasons?: string[];
    requirements?: string[];
  }> {
    try {
      const response: AxiosResponse<APIResponse<{
        isEligible: boolean;
        reasons?: string[];
        requirements?: string[];
      }>> = await apiClient.post('/sales/check-eligibility', { saleId, userId });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return {
        isEligible: false,
        reasons: ['Unable to check eligibility']
      };
    } catch (error) {
      console.error('Error checking sale eligibility:', error);
      return {
        isEligible: false,
        reasons: ['Error checking eligibility']
      };
    }
  }

  // ============================================================================
  // FLASH SALE FEATURES
  // ============================================================================

  /**
   * Get flash sale countdown
   */
  static async getFlashSaleCountdown(saleId: ID): Promise<FlashSaleCountdown> {
    try {
      // Check cache first
      const cached = SalesCacheManager.getFlashSaleCountdown(saleId);
      if (cached) {
        return cached;
      }

      const response: AxiosResponse<APIResponse<FlashSaleCountdown>> =
        await apiClient.get(`/sales/${saleId}/countdown`);

      if (response.data.success && response.data.data) {
        const countdown = response.data.data;
        
        // Cache the countdown (short duration due to time sensitivity)
        SalesCacheManager.setFlashSaleCountdown(saleId, countdown);

        return countdown;
      }

      throw new Error(response.data.message || 'Failed to get countdown');
    } catch (error) {
      console.error('Error getting flash sale countdown:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get countdown');
    }
  }

  /**
   * Subscribe to flash sale notifications
   */
  static async subscribeToFlashSale(saleId: ID, userId?: ID): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<APIResponse<{ message: string }>> =
        await apiClient.post(`/sales/${saleId}/subscribe`, { userId });

      if (response.data.success) {
        toast.success('Subscribed to flash sale notifications');
        return {
          success: true,
          message: response.data.data?.message || 'Successfully subscribed'
        };
      }

      throw new Error(response.data.message || 'Failed to subscribe');
    } catch (error) {
      console.error('Error subscribing to flash sale:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to subscribe'
      };
    }
  }

  // ============================================================================
  // SOCIAL FEATURES
  // ============================================================================

  /**
   * Share sale
   */
  static async shareSale(
    saleId: ID,
    method: 'social' | 'email' | 'sms' | 'link',
    recipients?: string[]
  ): Promise<{ success: boolean; shareUrl?: string }> {
    try {
      const response: AxiosResponse<APIResponse<{ shareUrl: string }>> =
        await apiClient.post(`/sales/${saleId}/share`, {
          method,
          recipients
        });

      if (response.data.success && response.data.data) {
        // Track sharing analytics
        SalesAnalyticsManager.trackSaleShare(saleId, method);
        
        toast.success('Sale shared successfully');
        
        return {
          success: true,
          shareUrl: response.data.data.shareUrl
        };
      }

      throw new Error(response.data.message || 'Failed to share sale');
    } catch (error) {
      console.error('Error sharing sale:', error);
      toast.error('Failed to share sale');
      
      return { success: false };
    }
  }

  /**
   * Get sale referral code
   */
  static async getSaleReferralCode(saleId: ID, userId: ID): Promise<{ code: string; shareUrl: string }> {
    try {
      const response: AxiosResponse<APIResponse<{ code: string; shareUrl: string }>> =
        await apiClient.post(`/sales/${saleId}/referral-code`, { userId });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to get referral code');
    } catch (error) {
      console.error('Error getting sale referral code:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get referral code');
    }
  }

  // ============================================================================
  // ANALYTICS AND REPORTING
  // ============================================================================

  /**
   * Get sale analytics
   */
  static async getSaleAnalytics(saleId: ID): Promise<SaleAnalytics> {
    try {
      const response: AxiosResponse<APIResponse<SaleAnalytics>> =
        await apiClient.get(`/sales/${saleId}/analytics`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to get analytics');
    } catch (error) {
      console.error('Error getting sale analytics:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get analytics');
    }
  }

  /**
   * Get sale metrics (real-time)
   */
  static async getSaleMetrics(saleId: ID): Promise<SaleMetrics> {
    try {
      const response: AxiosResponse<APIResponse<SaleMetrics>> =
        await apiClient.get(`/sales/${saleId}/metrics`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to get metrics');
    } catch (error) {
      console.error('Error getting sale metrics:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get metrics');
    }
  }

  /**
   * Get campaign performance
   */
  static async getCampaignPerformance(dateRange?: { start: string; end: string }): Promise<CampaignPerformance> {
    try {
      const params = new URLSearchParams();
      if (dateRange?.start) params.append('start', dateRange.start);
      if (dateRange?.end) params.append('end', dateRange.end);

      const response: AxiosResponse<APIResponse<CampaignPerformance>> =
        await apiClient.get(`/sales/campaign-performance?${params.toString()}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to get campaign performance');
    } catch (error) {
      console.error('Error getting campaign performance:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get campaign performance');
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculate sale discount
   */
  static calculateSaleDiscount(sale: Sale, originalPrice: Price): Price {
    try {
      // Use the first discount rule as primary discount
      const primaryRule = sale.discountRules?.[0];
      if (!primaryRule) {
        return { amount: 0, currency: originalPrice.currency, formatted: '₹0' };
      }

      if (primaryRule.type === 'percentage') {
        const discountAmount = (originalPrice.amount * primaryRule.discount.value) / 100;
        const maxDiscount = primaryRule.discount.maxDiscount || discountAmount;
        const finalDiscount = Math.min(discountAmount, maxDiscount);
        return {
          amount: finalDiscount,
          currency: originalPrice.currency,
          formatted: `₹${finalDiscount.toFixed(2)}`
        };
      } else if (primaryRule.type === 'fixed_amount') {
        const discountAmount = Math.min(primaryRule.discount.value, originalPrice.amount);
        return {
          amount: discountAmount,
          currency: originalPrice.currency,
          formatted: `₹${discountAmount.toFixed(2)}`
        };
      }
      
      return { amount: 0, currency: originalPrice.currency, formatted: '₹0' };
    } catch (error) {
      console.error('Error calculating sale discount:', error);
      return { amount: 0, currency: originalPrice.currency, formatted: '₹0' };
    }
  }

  /**
   * Check if sale is active
   */
  static isSaleActive(sale: Sale): boolean {
    const now = dayjs();
    const startDate = dayjs(sale.schedule.startDate);
    const endDate = dayjs(sale.schedule.endDate);
    
    return (
      sale.status === 'active' &&
      now.isAfter(startDate) &&
      now.isBefore(endDate) &&
      sale.visibility !== 'hidden'
    );
  }

  /**
   * Get sale time remaining
   */
  static getSaleTimeRemaining(sale: Sale): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  } {
    const now = dayjs();
    const endDate = dayjs(sale.schedule.endDate);
    const diff = endDate.diff(now, 'second');
    
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }
    
    const days = Math.floor(diff / (24 * 60 * 60));
    const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((diff % (60 * 60)) / 60);
    const seconds = diff % 60;
    
    return { days, hours, minutes, seconds, totalSeconds: diff };
  }

  /**
   * Get sale status display
   */
  static getSaleStatusDisplay(status: SaleStatus): {
    label: string;
    color: string;
    icon: string;
  } {
    const statusMap: Record<SaleStatus, { label: string; color: string; icon: string }> = {
      draft: { label: 'Draft', color: 'gray', icon: '📝' },
      active: { label: 'Active', color: 'green', icon: '✅' },
      scheduled: { label: 'Scheduled', color: 'blue', icon: '📅' },
      paused: { label: 'Paused', color: 'yellow', icon: '⏸️' },
      ended: { label: 'Ended', color: 'red', icon: '🔚' },
      cancelled: { label: 'Cancelled', color: 'red', icon: '❌' },
      expired: { label: 'Expired', color: 'orange', icon: '⏰' },
      sold_out: { label: 'Sold Out', color: 'purple', icon: '🎯' },
      archived: { label: 'Archived', color: 'gray', icon: '📦' }
    };

    return statusMap[status] || statusMap.draft;
  }

  /**
   * Format sale display
   */
  static formatSaleDisplay(sale: Sale): {
    discountText: string;
    badgeText: string;
    timeText: string;
  } {
    // Use the primary discount rule for display
    const primaryRule = sale.discountRules?.[0];
    let discountText = 'Sale Price';
    
    if (primaryRule) {
      discountText = primaryRule.type === 'percentage'
        ? `${primaryRule.discount.value}% OFF`
        : `₹${primaryRule.discount.value} OFF`;
    }
      
    const badgeText = `Save ${discountText}`;
    
    const timeRemaining = this.getSaleTimeRemaining(sale);
    const timeText = timeRemaining.totalSeconds > 0
      ? `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m left`
      : 'Sale ended';
      
    return { discountText, badgeText, timeText };
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
    SalesCacheManager.clearCache();
    this.queryClient?.clear();
  }

  /**
   * Validate participation request
   */
  static validateParticipationRequest(data: unknown): SaleParticipationRequest {
    return SaleParticipationSchema.parse(data);
  }
}

// Create singleton instance
export default SalesService;

// Export utility functions
export {
  SalesSocketManager,
  SalesAnalyticsManager,
  SalesCacheManager,
};
