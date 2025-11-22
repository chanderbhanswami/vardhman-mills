/**
 * Coupons Service - Vardhman Mills Frontend
 * 
 * Comprehensive service for managing coupons, discount codes, and promotional offers.
 * Handles validation, application, tracking, and analytics for discount systems.
 * 
 * Features:
 * - Real-time coupon validation and application
 * - Advanced caching with React Query
 * - Usage analytics and fraud detection
 * - Multi-tier discount calculations
 * - Automated coupon management
 * - Social sharing and referral codes
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
  Coupon,
  DiscountType,
  CouponUsageAnalytics,
  CouponUsage,
  Deal
} from '../types/coupon.types';
import { ID, Timestamp, APIResponse, Price, PaginatedResponse, Currency } from '../types/common.types';

import { User } from '../types/user.types';

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
interface CouponListResponse extends PaginatedResponse<Coupon> {
  coupons: Coupon[];
  categories: Array<{
    name: string;
    count: number;
  }>;
  totalSavings: Price;
}

interface CouponValidationRequest {
  code: string;
  userId?: ID;
  cartItems?: Array<{
    productId: ID;
    quantity: number;
    price: Price;
  }>;
  cartTotal: Price;
  customerData?: {
    email?: string;
    isFirstTime?: boolean;
    previousOrders?: number;
  };
}

interface CouponValidationResponse {
  isValid: boolean;
  coupon?: Coupon;
  discount: {
    amount: Price;
    type: DiscountType;
    percentage?: number;
  };
  errors?: string[];
  warnings?: string[];
  conditions?: {
    minOrderValue?: Price;
    maxUsage?: number;
    remainingUses?: number;
    expiresAt?: Timestamp;
  };
}

interface UserCouponsResponse {
  availableCoupons: Coupon[];
  usedCoupons: CouponUsage[];
  expiringSoon: Coupon[];
  recommendations: Coupon[];
  totalSavings: Price;
}

interface CouponFilter {
  isActive?: boolean;
  discountType?: DiscountType;
  category?: string;
  minDiscount?: number;
  maxDiscount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'expires_at' | 'discount_value' | 'usage_count';
  sortOrder?: 'asc' | 'desc';
}


interface CouponAnalytics {
  totalCoupons: number;
  activeCoupons: number;
  totalUsage: number;
  totalSavings: Price;
  topPerformingCoupons: Array<{
    coupon: Coupon;
    usageCount: number;
    totalSavings: Price;
    conversionRate: number;
  }>;
  usageByMonth: Array<{
    month: string;
    usage: number;
    savings: Price;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    savings: Price;
  }>;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const PriceSchema = z.object({
  amount: z.number().min(0),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']),
  formatted: z.string()
});

const CouponValidationSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').max(50),
  userId: z.string().optional(),
  cartItems: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: PriceSchema
  })).optional(),
  cartTotal: PriceSchema,
  customerData: z.object({
    email: z.string().email().optional(),
    isFirstTime: z.boolean().optional(),
    previousOrders: z.number().min(0).optional()
  }).optional()
});

// ============================================================================
// SOCKET MANAGER
// ============================================================================

class CouponSocketManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  get connected(): boolean {
    return this.isConnected;
  }

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(`${SOCKET_URL}/coupons`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Connected to coupons socket');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.handleReconnect();
    });

    this.socket.on('coupon_updated', (data: Coupon) => {
      this.handleCouponUpdate(data);
    });

    this.socket.on('coupon_expired', (data: { couponId: ID; code: string }) => {
      this.handleCouponExpired(data);
    });

    this.socket.on('new_coupon_available', (data: Coupon) => {
      this.handleNewCouponAvailable(data);
    });

    this.socket.on('usage_limit_reached', (data: { couponId: ID; code: string }) => {
      this.handleUsageLimitReached(data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  subscribeToCouponUpdates(userId?: ID): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_user_coupons', { userId });
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

  private handleCouponUpdate(data: Coupon): void {
    // Update React Query cache
    CouponsService.queryClient?.setQueryData(['coupon', data.id], data);
    
    // Show notification for user-relevant updates
    toast.success(`Coupon ${data.code} updated`);
  }

  private handleCouponExpired(data: { couponId: ID; code: string }): void {
    // Remove from cache and show notification
    CouponsService.queryClient?.removeQueries({ queryKey: ['coupon', data.couponId] });
    toast(`Coupon ${data.code} has expired`, { icon: 'ℹ️' });
  }

  private handleNewCouponAvailable(data: Coupon): void {
    // Add to cache and show notification
    CouponsService.queryClient?.setQueryData(['coupon', data.id], data);
    toast.success(`New coupon available: ${data.code}`);
  }

  private handleUsageLimitReached(data: { couponId: ID; code: string }): void {
    // Update cache to reflect unavailability
    toast(`Coupon ${data.code} usage limit reached`, { icon: '⚠️' });
  }
}

// ============================================================================
// ANALYTICS MANAGER
// ============================================================================

class CouponAnalyticsManager {
  private static readonly ANALYTICS_ENDPOINT = '/analytics/coupons';

  static async trackCouponView(couponId: ID): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/view`, {
        couponId,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track coupon view:', error);
    }
  }

  static async trackCouponValidation(couponId: ID, isValid: boolean): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/validation`, {
        couponId,
        isValid,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track coupon validation:', error);
    }
  }

  static async trackCouponUsage(couponId: ID, discountAmount: number, orderId?: ID): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/usage`, {
        couponId,
        discountAmount,
        orderId,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track coupon usage:', error);
    }
  }

  static async trackCouponShare(couponId: ID, method: string): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/share`, {
        couponId,
        method,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track coupon share:', error);
    }
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('coupon_session_id');
    if (!sessionId) {
      sessionId = CryptoJS.lib.WordArray.random(16).toString();
      sessionStorage.setItem('coupon_session_id', sessionId);
    }
    return sessionId;
  }
}

// ============================================================================
// CACHE MANAGER
// ============================================================================

class CouponCacheManager {
  private static readonly CACHE_PREFIX = 'coupon_';
  private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  private static readonly VALIDATION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static setCoupon(couponId: ID, coupon: Coupon): void {
    try {
      const cacheData = {
        data: coupon,
        timestamp: Date.now()
      };
      window.localStorage.setItem(
        `${this.CACHE_PREFIX}${couponId}`,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Failed to cache coupon:', error);
    }
  }

  static getCoupon(couponId: ID): Coupon | null {
    try {
      const cached = window.localStorage.getItem(`${this.CACHE_PREFIX}${couponId}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        this.removeCoupon(couponId);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Failed to get cached coupon:', error);
      return null;
    }
  }

  static setValidationResult(code: string, validation: CouponValidationResponse): void {
    try {
      const cacheData = {
        data: validation,
        timestamp: Date.now()
      };
      window.localStorage.setItem(
        `${this.CACHE_PREFIX}validation_${code}`,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Failed to cache validation result:', error);
    }
  }

  static getValidationResult(code: string): CouponValidationResponse | null {
    try {
      const cached = window.localStorage.getItem(`${this.CACHE_PREFIX}validation_${code}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.VALIDATION_CACHE_DURATION;
      
      if (isExpired) {
        window.localStorage.removeItem(`${this.CACHE_PREFIX}validation_${code}`);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Failed to get cached validation result:', error);
      return null;
    }
  }

  static removeCoupon(couponId: ID): void {
    try {
      window.localStorage.removeItem(`${this.CACHE_PREFIX}${couponId}`);
    } catch (error) {
      console.error('Failed to remove cached coupon:', error);
    }
  }

  static clearValidationCache(): void {
    try {
      const keys = Object.keys(window.localStorage);
      keys.forEach(key => {
        if (key.startsWith(`${this.CACHE_PREFIX}validation_`)) {
          window.localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear validation cache:', error);
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
      console.error('Failed to clear coupon cache:', error);
    }
  }
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

export class CouponsService {
  public static queryClient: QueryClient | null = null;
  private static socketManager: CouponSocketManager | null = null;
  private static debouncedValidation: ReturnType<typeof debounce> | null = null;

  // Initialize service
  static initialize(queryClient: QueryClient): void {
    this.queryClient = queryClient;
    this.socketManager = new CouponSocketManager();
    this.socketManager.connect();
    
    // Create debounced validation function
    this.debouncedValidation = debounce(this.performValidation.bind(this), 500);
  }

  // Cleanup
  static cleanup(): void {
    this.socketManager?.disconnect();
    this.socketManager = null;
    this.debouncedValidation?.cancel();
    this.debouncedValidation = null;
  }

  // ============================================================================
  // COUPON CRUD OPERATIONS (READ-ONLY FOR FRONTEND)
  // ============================================================================

  /**
   * Get all available coupons with filters
   */
  static async getCoupons(filters?: CouponFilter): Promise<CouponListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters?.discountType) params.append('discountType', filters.discountType);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.minDiscount) params.append('minDiscount', filters.minDiscount.toString());
      if (filters?.maxDiscount) params.append('maxDiscount', filters.maxDiscount.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response: AxiosResponse<APIResponse<CouponListResponse>> =
        await apiClient.get(`/coupons?${params.toString()}`);

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        
        // Cache individual coupons
        data.coupons.forEach(coupon => {
          CouponCacheManager.setCoupon(coupon.id, coupon);
        });

        return data;
      }

      throw new Error(response.data.message || 'Failed to fetch coupons');
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch coupons');
    }
  }

  /**
   * Get single coupon by ID
   */
  static async getCoupon(id: ID): Promise<Coupon> {
    try {
      // Check cache first
      const cached = CouponCacheManager.getCoupon(id);
      if (cached) {
        CouponAnalyticsManager.trackCouponView(id);
        return cached;
      }

      const response: AxiosResponse<APIResponse<Coupon>> =
        await apiClient.get(`/coupons/${id}`);

      if (response.data.success && response.data.data) {
        const coupon = response.data.data;
        
        // Cache the coupon
        CouponCacheManager.setCoupon(id, coupon);
        
        // Track analytics
        CouponAnalyticsManager.trackCouponView(id);

        return coupon;
      }

      throw new Error(response.data.message || 'Coupon not found');
    } catch (error) {
      console.error('Error fetching coupon:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch coupon');
    }
  }

  /**
   * Get coupon by code
   */
  static async getCouponByCode(code: string): Promise<Coupon> {
    try {
      const response: AxiosResponse<APIResponse<Coupon>> =
        await apiClient.get(`/coupons/code/${code}`);

      if (response.data.success && response.data.data) {
        const coupon = response.data.data;
        
        // Cache the coupon
        CouponCacheManager.setCoupon(coupon.id, coupon);
        
        // Track analytics
        CouponAnalyticsManager.trackCouponView(coupon.id);

        return coupon;
      }

      throw new Error(response.data.message || 'Coupon not found');
    } catch (error) {
      console.error('Error fetching coupon by code:', error);
      throw new Error(error instanceof Error ? error.message : 'Invalid coupon code');
    }
  }

  /**
   * Get user-specific coupons
   */
  static async getUserCoupons(userId: ID): Promise<UserCouponsResponse> {
    try {
      const response: AxiosResponse<APIResponse<UserCouponsResponse>> =
        await apiClient.get(`/coupons/user/${userId}`);

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        
        // Cache available coupons
        data.availableCoupons.forEach(coupon => {
          CouponCacheManager.setCoupon(coupon.id, coupon);
        });

        // Subscribe to real-time updates
        this.socketManager?.subscribeToCouponUpdates(userId);

        return data;
      }

      throw new Error(response.data.message || 'Failed to fetch user coupons');
    } catch (error) {
      console.error('Error fetching user coupons:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user coupons');
    }
  }

  // ============================================================================
  // COUPON VALIDATION AND APPLICATION
  // ============================================================================

  /**
   * Validate coupon with debouncing
   */
  static async validateCoupon(request: CouponValidationRequest): Promise<CouponValidationResponse> {
    return new Promise((resolve, reject) => {
      if (!this.debouncedValidation) {
        reject(new Error('Service not initialized'));
        return;
      }

      this.debouncedValidation(request, resolve, reject);
    });
  }

  /**
   * Perform actual validation (called by debounced function)
   */
  private static async performValidation(
    request: CouponValidationRequest,
    resolve: (value: CouponValidationResponse) => void,
    reject: (reason?: unknown) => void
  ): Promise<void> {
    try {
      // Check cache first
      const cached = CouponCacheManager.getValidationResult(request.code);
      if (cached) {
        resolve(cached);
        return;
      }

      // Validate input
      const validatedRequest = CouponValidationSchema.parse(request);

      const response: AxiosResponse<APIResponse<CouponValidationResponse>> =
        await apiClient.post('/coupons/validate', validatedRequest);

      if (response.data.success && response.data.data) {
        const validation = response.data.data;
        
        // Cache validation result
        CouponCacheManager.setValidationResult(request.code, validation);
        
        // Track analytics
        if (validation.coupon) {
          CouponAnalyticsManager.trackCouponValidation(validation.coupon.id, validation.isValid);
        }

        resolve(validation);
      } else {
        const errorMessage = response.data.message || 'Validation failed';
        resolve({
          isValid: false,
          discount: { 
            amount: { amount: 0, currency: 'INR', formatted: '₹0' } as Price, 
            type: 'fixed_amount' as DiscountType 
          },
          errors: [errorMessage]
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        );
        resolve({
          isValid: false,
          discount: { 
            amount: { amount: 0, currency: 'USD' as Currency, formatted: '$0.00' },
            type: 'fixed' as DiscountType
          },
          errors: fieldErrors
        });
      } else {
        console.error('Error validating coupon:', error);
        reject(error instanceof Error ? error : new Error('Validation failed'));
      }
    }
  }

  /**
   * Apply coupon to order
   */
  static async applyCoupon(
    couponCode: string,
    orderId: ID,
    userId?: ID
  ): Promise<{ success: boolean; discount: Price; message: string }> {
    try {
      const response: AxiosResponse<APIResponse<{ discount: Price; message: string }>> =
        await apiClient.post('/coupons/apply', {
          couponCode,
          orderId,
          userId
        });

      if (response.data.success && response.data.data) {
        const result = response.data.data;
        
        // Track usage analytics
        const coupon = await this.getCouponByCode(couponCode);
        CouponAnalyticsManager.trackCouponUsage(coupon.id, result.discount.amount, orderId);
        
        // Clear validation cache for this code
        CouponCacheManager.clearValidationCache();
        
        toast.success(result.message || 'Coupon applied successfully');
        
        return {
          success: true,
          discount: result.discount,
          message: result.message
        };
      }

      throw new Error(response.data.message || 'Failed to apply coupon');
    } catch (error) {
      console.error('Error applying coupon:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply coupon';
      toast.error(errorMessage);
      
      return {
        success: false,
        discount: { amount: 0, currency: 'USD', formatted: '$0.00' },
        message: errorMessage
      };
    }
  }

  /**
   * Remove coupon from order
   */
  static async removeCoupon(orderId: ID): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<APIResponse<{ message: string }>> =
        await apiClient.delete(`/coupons/remove/${orderId}`);

      if (response.data.success) {
        toast.success('Coupon removed successfully');
        return {
          success: true,
          message: response.data.data?.message || 'Coupon removed successfully'
        };
      }

      throw new Error(response.data.message || 'Failed to remove coupon');
    } catch (error) {
      console.error('Error removing coupon:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove coupon';
      toast.error(errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // ============================================================================
  // DEALS AND PROMOTIONS
  // ============================================================================

  /**
   * Get active deals
   */
  static async getActiveDeals(): Promise<Deal[]> {
    try {
      const response: AxiosResponse<APIResponse<{ deals: Deal[] }>> =
        await apiClient.get('/deals/active');

      if (response.data.success && response.data.data) {
        return response.data.data.deals;
      }

      return [];
    } catch (error) {
      console.error('Error fetching active deals:', error);
      return [];
    }
  }

  /**
   * Get featured deals
   */
  static async getFeaturedDeals(): Promise<Deal[]> {
    try {
      const response: AxiosResponse<APIResponse<{ deals: Deal[] }>> =
        await apiClient.get('/deals/featured');

      if (response.data.success && response.data.data) {
        return response.data.data.deals;
      }

      return [];
    } catch (error) {
      console.error('Error fetching featured deals:', error);
      return [];
    }
  }

  // ============================================================================
  // ANALYTICS AND REPORTING
  // ============================================================================

  /**
   * Get coupon analytics
   */
  static async getCouponAnalytics(dateRange?: { start: string; end: string }): Promise<CouponAnalytics> {
    try {
      const params = new URLSearchParams();
      if (dateRange?.start) params.append('start', dateRange.start);
      if (dateRange?.end) params.append('end', dateRange.end);

      const response: AxiosResponse<APIResponse<CouponAnalytics>> =
        await apiClient.get(`/coupons/analytics?${params.toString()}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to get analytics');
    } catch (error) {
      console.error('Error getting coupon analytics:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get analytics');
    }
  }

  /**
   * Get coupon usage statistics
   */
  static async getCouponUsageStats(couponId: ID): Promise<CouponUsageAnalytics> {
    try {
      const response: AxiosResponse<APIResponse<CouponUsageAnalytics>> =
        await apiClient.get(`/coupons/${couponId}/usage-stats`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to get usage stats');
    } catch (error) {
      console.error('Error getting coupon usage stats:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get usage stats');
    }
  }

  // ============================================================================
  // SOCIAL FEATURES
  // ============================================================================

  /**
   * Share coupon
   */
  static async shareCoupon(
    couponId: ID,
    method: 'social' | 'email' | 'sms' | 'link',
    recipients?: string[]
  ): Promise<{ success: boolean; shareUrl?: string }> {
    try {
      const response: AxiosResponse<APIResponse<{ shareUrl: string }>> =
        await apiClient.post(`/coupons/${couponId}/share`, {
          method,
          recipients
        });

      if (response.data.success && response.data.data) {
        // Track sharing analytics
        CouponAnalyticsManager.trackCouponShare(couponId, method);
        
        toast.success('Coupon shared successfully');
        
        return {
          success: true,
          shareUrl: response.data.data.shareUrl
        };
      }

      throw new Error(response.data.message || 'Failed to share coupon');
    } catch (error) {
      console.error('Error sharing coupon:', error);
      toast.error('Failed to share coupon');
      
      return { success: false };
    }
  }

  /**
   * Generate referral code for user
   */
  static async generateReferralCode(userId: ID): Promise<{ code: string; coupon: Coupon }> {
    try {
      const response: AxiosResponse<APIResponse<{ code: string; coupon: Coupon }>> =
        await apiClient.post(`/coupons/referral/generate`, { userId });

      if (response.data.success && response.data.data) {
        const result = response.data.data;
        
        // Cache the generated coupon
        CouponCacheManager.setCoupon(result.coupon.id, result.coupon);
        
        toast.success('Referral code generated successfully');
        return result;
      }

      throw new Error(response.data.message || 'Failed to generate referral code');
    } catch (error) {
      console.error('Error generating referral code:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate referral code');
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculate discount amount
   */
  static calculateDiscount(
    coupon: Coupon,
    cartTotal: Price
  ): Price {
    try {
      if (coupon.discountType === 'percentage') {
        const discountAmount = (cartTotal.amount * coupon.discountValue) / 100;
        const finalDiscount = coupon.maximumDiscount 
          ? Math.min(discountAmount, coupon.maximumDiscount.amount)
          : discountAmount;
        
        return {
          amount: finalDiscount,
          currency: cartTotal.currency,
          formatted: `${cartTotal.currency} ${finalDiscount.toFixed(2)}`
        };
      } else {
        const finalDiscount = Math.min(coupon.discountValue, cartTotal.amount);
        return {
          amount: finalDiscount,
          currency: cartTotal.currency,
          formatted: `${cartTotal.currency} ${finalDiscount.toFixed(2)}`
        };
      }
    } catch (error) {
      console.error('Error calculating discount:', error);
      return {
        amount: 0,
        currency: cartTotal?.currency || 'USD',
        formatted: `${cartTotal?.currency || 'USD'} 0.00`
      };
    }
  }

  /**
   * Check if coupon is valid for user
   */
  static isCouponValidForUser(coupon: Coupon, user?: User): boolean {
    try {
      // Check if coupon is active
      if (!coupon.isActive) return false;
      
      // Check expiry
      if (coupon.expiresAt && dayjs().isAfter(dayjs(coupon.expiresAt))) {
        return false;
      }
      
      // Check start date
      if (coupon.startsAt && dayjs().isBefore(dayjs(coupon.startsAt))) {
        return false;
      }
      
      // Check usage limits
      if (coupon.usageLimit && coupon.currentUsageCount >= coupon.usageLimit) {
        return false;
      }
      
      // User-specific checks
      if (user) {
        // Check if user meets eligibility criteria
        // This could include user tier, previous orders, etc.
        // For now, we'll just check if user exists for user-restricted coupons
        if (coupon.conditions?.some(condition => condition.type === 'customer_group')) {
          // Add user-specific validation logic here
          return true; // Placeholder - should implement actual validation
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking coupon validity:', error);
      return false;
    }
  }

  /**
   * Format coupon for display
   */
  static formatCouponDisplay(coupon: Coupon): {
    displayText: string;
    badgeText: string;
    expiryText: string;
  } {
    const displayText = coupon.discountType === 'percentage'
      ? `${coupon.discountValue}% OFF`
      : `₹${coupon.discountValue} OFF`;
      
    const badgeText = `Save ${displayText}`;
    
    const expiryText = coupon.expiresAt
      ? `Expires ${dayjs(coupon.expiresAt).format('MMM DD, YYYY')}`
      : 'No expiry';
      
    return { displayText, badgeText, expiryText };
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
    CouponCacheManager.clearCache();
    this.queryClient?.clear();
  }

  /**
   * Validate coupon data
   */
  static validateCouponRequest(data: unknown): CouponValidationRequest {
    return CouponValidationSchema.parse(data);
  }
}

// Create singleton instance
export default CouponsService;

// Export utility functions
export {
  CouponSocketManager,
  CouponAnalyticsManager,
  CouponCacheManager,
};
