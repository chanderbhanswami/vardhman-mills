/**
 * Gift Cards Service - Vardhman Mills Frontend
 * 
 * Comprehensive service for managing gift cards, digital vouchers, and gift card operations.
 * Handles purchasing, redemption, balance checking, and gift card lifecycle management.
 * 
 * Features:
 * - Real-time balance updates with Socket.IO
 * - Secure gift card validation and redemption
 * - Advanced caching with React Query
 * - Transaction history and analytics
 * - Digital gift card delivery
 * - Fraud prevention and security
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
  GiftCard,
  GiftCardStatus,
  GiftCardType,
  GiftCardTransaction,
  GiftCardDesign,
  DesignTemplate,
  DeliveryMethod,
  GiftCardAnalytics,
  GiftCardRedemption
} from '../types/giftCard.types';
import { ID, Timestamp, APIResponse, Price, PaginatedResponse } from '../types/common.types';


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
interface GiftCardPurchaseRequest {
  recipientEmail?: string;
  recipientName?: string;
  senderName: string;
  senderEmail: string;
  amount: number;
  design: string;
  template?: string;
  personalMessage?: string;
  deliveryMethod: DeliveryMethod;
  deliveryDate?: string;
  isPhysical?: boolean;
}

interface GiftCardRedemptionRequest {
  code: string;
  amount?: number;
  orderId?: ID;
  userId?: ID;
}

interface GiftCardBalanceResponse {
  balance: Price;
  isValid: boolean;
  expiresAt?: Timestamp;
  transactions: GiftCardTransaction[];
}

interface GiftCardListResponse extends PaginatedResponse<GiftCard> {
  giftCards: GiftCard[];
  totalValue: Price;
  categories: Array<{
    status: GiftCardStatus;
    count: number;
  }>;
}

interface UserGiftCardsResponse {
  ownedCards: GiftCard[];
  receivedCards: GiftCard[];
  purchasedCards: GiftCard[];
  totalBalance: Price;
  recentTransactions: GiftCardTransaction[];
}

interface GiftCardFilter {
  status?: GiftCardStatus;
  type?: GiftCardType;
  userId?: ID;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'amount' | 'expires_at' | 'balance';
  sortOrder?: 'asc' | 'desc';
}

interface GiftCardValidationResponse {
  isValid: boolean;
  balance: Price;
  expiresAt?: Timestamp;
  restrictions?: string[];
  canRedeem: boolean;
  remainingAmount: Price;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const GiftCardPurchaseSchema = z.object({
  recipientEmail: z.string().email().optional(),
  recipientName: z.string().min(1).optional(),
  senderName: z.string().min(1, 'Sender name is required'),
  senderEmail: z.string().email('Valid email is required'),
  amount: z.number().min(100, 'Minimum amount is ₹100').max(50000, 'Maximum amount is ₹50,000'),
  design: z.string().min(1, 'Design is required'),
  template: z.string().optional(),
  personalMessage: z.string().max(500, 'Message too long').optional(),
  deliveryMethod: z.enum(['email', 'sms', 'physical_mail', 'in_store_pickup', 'digital_download']),
  deliveryDate: z.string().optional(),
  isPhysical: z.boolean().default(false)
});

const GiftCardRedemptionSchema = z.object({
  code: z.string().min(1, 'Gift card code is required'),
  amount: z.number().min(1).optional(),
  orderId: z.string().optional(),
  userId: z.string().optional()
});

// ============================================================================
// SOCKET MANAGER
// ============================================================================

class GiftCardSocketManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  get connected(): boolean {
    return this.isConnected;
  }

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(`${SOCKET_URL}/giftcards`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Connected to gift cards socket');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.handleReconnect();
    });

    this.socket.on('balance_updated', (data: { cardId: ID; newBalance: Price }) => {
      this.handleBalanceUpdate(data);
    });

    this.socket.on('gift_card_redeemed', (data: { cardId: ID; amount: Price; transaction: GiftCardTransaction }) => {
      this.handleGiftCardRedeemed(data);
    });

    this.socket.on('gift_card_expired', (data: { cardId: ID; code: string }) => {
      this.handleGiftCardExpired(data);
    });

    this.socket.on('new_gift_card', (data: GiftCard) => {
      this.handleNewGiftCard(data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  subscribeToUserCards(userId: ID): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_user_cards', { userId });
    }
  }

  subscribeToCard(cardId: ID): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_card', { cardId });
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

  private handleBalanceUpdate(data: { cardId: ID; newBalance: Price }): void {
    // Update React Query cache
    GiftCardsService.queryClient?.setQueryData(['giftcard', data.cardId], (old: GiftCard | undefined) => 
      old ? { ...old, currentBalance: data.newBalance } : old
    );
    
    toast.success('Gift card balance updated');
  }

  private handleGiftCardRedeemed(data: { cardId: ID; amount: Price; transaction: GiftCardTransaction }): void {
    // Update cache with new transaction
    GiftCardsService.queryClient?.invalidateQueries({ queryKey: ['giftcard', data.cardId] });
    
    toast.success(`Gift card redeemed: ${data.amount}`);
  }

  private handleGiftCardExpired(data: { cardId: ID; code: string }): void {
    // Update cache to reflect expired status
    GiftCardsService.queryClient?.setQueryData(['giftcard', data.cardId], (old: GiftCard | undefined) => 
      old ? { ...old, status: 'expired' as GiftCardStatus } : old
    );
    
    toast(`Gift card ${data.code} has expired`, { icon: '⏰' });
  }

  private handleNewGiftCard(data: GiftCard): void {
    // Add to cache
    GiftCardsService.queryClient?.setQueryData(['giftcard', data.id], data);
    
    toast.success('New gift card received!');
  }
}

// ============================================================================
// ANALYTICS MANAGER
// ============================================================================

class GiftCardAnalyticsManager {
  private static readonly ANALYTICS_ENDPOINT = '/analytics/giftcards';

  static async trackGiftCardView(cardId: ID): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/view`, {
        cardId,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track gift card view:', error);
    }
  }

  static async trackGiftCardPurchase(cardId: ID, amount: number): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/purchase`, {
        cardId,
        amount,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track gift card purchase:', error);
    }
  }

  static async trackGiftCardRedemption(cardId: ID, amount: number): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/redemption`, {
        cardId,
        amount,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track gift card redemption:', error);
    }
  }

  static async trackBalanceCheck(cardId: ID): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/balance-check`, {
        cardId,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track balance check:', error);
    }
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('giftcard_session_id');
    if (!sessionId) {
      sessionId = CryptoJS.lib.WordArray.random(16).toString();
      sessionStorage.setItem('giftcard_session_id', sessionId);
    }
    return sessionId;
  }
}

// ============================================================================
// CACHE MANAGER
// ============================================================================

class GiftCardCacheManager {
  private static readonly CACHE_PREFIX = 'giftcard_';
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private static readonly BALANCE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static setGiftCard(cardId: ID, giftCard: GiftCard): void {
    try {
      const cacheData = {
        data: giftCard,
        timestamp: Date.now()
      };
      window.localStorage.setItem(
        `${this.CACHE_PREFIX}${cardId}`,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Failed to cache gift card:', error);
    }
  }

  static getGiftCard(cardId: ID): GiftCard | null {
    try {
      const cached = window.localStorage.getItem(`${this.CACHE_PREFIX}${cardId}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        this.removeGiftCard(cardId);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Failed to get cached gift card:', error);
      return null;
    }
  }

  static setBalance(code: string, balance: GiftCardBalanceResponse): void {
    try {
      const cacheData = {
        data: balance,
        timestamp: Date.now()
      };
      window.localStorage.setItem(
        `${this.CACHE_PREFIX}balance_${code}`,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Failed to cache balance:', error);
    }
  }

  static getBalance(code: string): GiftCardBalanceResponse | null {
    try {
      const cached = window.localStorage.getItem(`${this.CACHE_PREFIX}balance_${code}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.BALANCE_CACHE_DURATION;
      
      if (isExpired) {
        window.localStorage.removeItem(`${this.CACHE_PREFIX}balance_${code}`);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Failed to get cached balance:', error);
      return null;
    }
  }

  static removeGiftCard(cardId: ID): void {
    try {
      window.localStorage.removeItem(`${this.CACHE_PREFIX}${cardId}`);
    } catch (error) {
      console.error('Failed to remove cached gift card:', error);
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
      console.error('Failed to clear gift card cache:', error);
    }
  }
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

export class GiftCardsService {
  public static queryClient: QueryClient | null = null;
  private static socketManager: GiftCardSocketManager | null = null;
  private static debouncedBalanceCheck: ReturnType<typeof debounce> | null = null;

  // Initialize service
  static initialize(queryClient: QueryClient): void {
    this.queryClient = queryClient;
    this.socketManager = new GiftCardSocketManager();
    this.socketManager.connect();
    
    // Create debounced balance check function
    this.debouncedBalanceCheck = debounce(this.performBalanceCheck.bind(this), 1000);
  }

  // Cleanup
  static cleanup(): void {
    this.socketManager?.disconnect();
    this.socketManager = null;
    this.debouncedBalanceCheck?.cancel();
    this.debouncedBalanceCheck = null;
  }

  // ============================================================================
  // GIFT CARD OPERATIONS (READ-ONLY FOR FRONTEND)
  // ============================================================================

  /**
   * Get all gift cards with filters
   */
  static async getGiftCards(filters?: GiftCardFilter): Promise<GiftCardListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
      if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response: AxiosResponse<APIResponse<GiftCardListResponse>> =
        await apiClient.get(`/giftcards?${params.toString()}`);

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        
        // Cache individual gift cards
        data.giftCards.forEach(card => {
          GiftCardCacheManager.setGiftCard(card.id, card);
        });

        return data;
      }

      throw new Error(response.data.message || 'Failed to fetch gift cards');
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch gift cards');
    }
  }

  /**
   * Get single gift card by ID
   */
  static async getGiftCard(id: ID): Promise<GiftCard> {
    try {
      // Check cache first
      const cached = GiftCardCacheManager.getGiftCard(id);
      if (cached) {
        GiftCardAnalyticsManager.trackGiftCardView(id);
        return cached;
      }

      const response: AxiosResponse<APIResponse<GiftCard>> =
        await apiClient.get(`/giftcards/${id}`);

      if (response.data.success && response.data.data) {
        const giftCard = response.data.data;
        
        // Cache the gift card
        GiftCardCacheManager.setGiftCard(id, giftCard);
        
        // Track analytics
        GiftCardAnalyticsManager.trackGiftCardView(id);
        
        // Subscribe to real-time updates
        this.socketManager?.subscribeToCard(id);

        return giftCard;
      }

      throw new Error(response.data.message || 'Gift card not found');
    } catch (error) {
      console.error('Error fetching gift card:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch gift card');
    }
  }

  /**
   * Get user's gift cards
   */
  static async getUserGiftCards(userId: ID): Promise<UserGiftCardsResponse> {
    try {
      const response: AxiosResponse<APIResponse<UserGiftCardsResponse>> =
        await apiClient.get(`/giftcards/user/${userId}`);

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        
        // Cache gift cards
        [...data.ownedCards, ...data.receivedCards, ...data.purchasedCards].forEach(card => {
          GiftCardCacheManager.setGiftCard(card.id, card);
        });

        // Subscribe to real-time updates
        this.socketManager?.subscribeToUserCards(userId);

        return data;
      }

      throw new Error(response.data.message || 'Failed to fetch user gift cards');
    } catch (error) {
      console.error('Error fetching user gift cards:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user gift cards');
    }
  }

  // ============================================================================
  // GIFT CARD PURCHASING
  // ============================================================================

  /**
   * Purchase gift card
   */
  static async purchaseGiftCard(request: GiftCardPurchaseRequest): Promise<GiftCard> {
    try {
      // Validate input
      const validatedRequest = GiftCardPurchaseSchema.parse(request);

      const response: AxiosResponse<APIResponse<GiftCard>> =
        await apiClient.post('/giftcards/purchase', validatedRequest);

      if (response.data.success && response.data.data) {
        const giftCard = response.data.data;
        
        // Cache the new gift card
        GiftCardCacheManager.setGiftCard(giftCard.id, giftCard);
        
        // Track analytics
        GiftCardAnalyticsManager.trackGiftCardPurchase(giftCard.id, validatedRequest.amount);
        
        // Invalidate list cache
        this.queryClient?.invalidateQueries({ queryKey: ['giftcards'] });
        
        toast.success('Gift card purchased successfully');
        return giftCard;
      }

      throw new Error(response.data.message || 'Failed to purchase gift card');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        ).join(', ');
        throw new Error(`Validation failed: ${fieldErrors}`);
      }
      
      console.error('Error purchasing gift card:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to purchase gift card');
    }
  }

  // ============================================================================
  // GIFT CARD VALIDATION AND BALANCE
  // ============================================================================

  /**
   * Check gift card balance with debouncing
   */
  static async checkBalance(code: string): Promise<GiftCardBalanceResponse> {
    return new Promise((resolve, reject) => {
      if (!this.debouncedBalanceCheck) {
        reject(new Error('Service not initialized'));
        return;
      }

      this.debouncedBalanceCheck(code, resolve, reject);
    });
  }

  /**
   * Perform actual balance check (called by debounced function)
   */
  private static async performBalanceCheck(
    code: string,
    resolve: (value: GiftCardBalanceResponse) => void,
    reject: (reason?: unknown) => void
  ): Promise<void> {
    try {
      // Check cache first
      const cached = GiftCardCacheManager.getBalance(code);
      if (cached) {
        resolve(cached);
        return;
      }

      const response: AxiosResponse<APIResponse<GiftCardBalanceResponse>> =
        await apiClient.get(`/giftcards/balance/${code}`);

      if (response.data.success && response.data.data) {
        const balance = response.data.data;
        
        // Cache balance result
        GiftCardCacheManager.setBalance(code, balance);
        
        // Track analytics if valid
        if (balance.isValid) {
          // We need card ID for analytics, which we might not have from code lookup
          // GiftCardAnalyticsManager.trackBalanceCheck(cardId);
        }

        resolve(balance);
      } else {
        resolve({
          balance: { amount: 0, currency: 'INR', formatted: '₹0' } as Price,
          isValid: false,
          transactions: []
        });
      }
    } catch (error) {
      console.error('Error checking balance:', error);
      reject(error instanceof Error ? error : new Error('Balance check failed'));
    }
  }

  /**
   * Validate gift card
   */
  static async validateGiftCard(code: string): Promise<GiftCardValidationResponse> {
    try {
      const response: AxiosResponse<APIResponse<GiftCardValidationResponse>> =
        await apiClient.post('/giftcards/validate', { code });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return {
        isValid: false,
        balance: { amount: 0, currency: 'INR', formatted: '₹0' } as Price,
        canRedeem: false,
        remainingAmount: { amount: 0, currency: 'INR', formatted: '₹0' } as Price
      };
    } catch (error) {
      console.error('Error validating gift card:', error);
      return {
        isValid: false,
        balance: { amount: 0, currency: 'INR', formatted: '₹0' } as Price,
        canRedeem: false,
        remainingAmount: { amount: 0, currency: 'INR', formatted: '₹0' } as Price
      };
    }
  }

  // ============================================================================
  // GIFT CARD REDEMPTION
  // ============================================================================

  /**
   * Redeem gift card
   */
  static async redeemGiftCard(request: GiftCardRedemptionRequest): Promise<GiftCardRedemption> {
    try {
      // Validate input
      const validatedRequest = GiftCardRedemptionSchema.parse(request);

      const response: AxiosResponse<APIResponse<GiftCardRedemption>> =
        await apiClient.post('/giftcards/redeem', validatedRequest);

      if (response.data.success && response.data.data) {
        const redemption = response.data.data;
        
        // Track analytics
        if (validatedRequest.amount) {
          // GiftCardAnalyticsManager.trackGiftCardRedemption(cardId, validatedRequest.amount);
        }
        
        // Clear balance cache for this code
        const keys = Object.keys(window.localStorage);
        keys.forEach(key => {
          if (key.includes(`balance_${validatedRequest.code}`)) {
            window.localStorage.removeItem(key);
          }
        });
        
        toast.success('Gift card redeemed successfully');
        return redemption;
      }

      throw new Error(response.data.message || 'Failed to redeem gift card');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        ).join(', ');
        throw new Error(`Validation failed: ${fieldErrors}`);
      }
      
      console.error('Error redeeming gift card:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to redeem gift card');
    }
  }

  // ============================================================================
  // GIFT CARD DESIGNS AND TEMPLATES
  // ============================================================================

  /**
   * Get available gift card designs
   */
  static async getGiftCardDesigns(): Promise<GiftCardDesign[]> {
    try {
      const response: AxiosResponse<APIResponse<{ designs: GiftCardDesign[] }>> =
        await apiClient.get('/giftcards/designs');

      if (response.data.success && response.data.data) {
        return response.data.data.designs;
      }

      return [];
    } catch (error) {
      console.error('Error fetching gift card designs:', error);
      return [];
    }
  }

  /**
   * Get gift card templates
   */
  static async getGiftCardTemplates(): Promise<DesignTemplate[]> {
    try {
      const response: AxiosResponse<APIResponse<{ templates: DesignTemplate[] }>> =
        await apiClient.get('/giftcards/templates');

      if (response.data.success && response.data.data) {
        return response.data.data.templates;
      }

      return [];
    } catch (error) {
      console.error('Error fetching gift card templates:', error);
      return [];
    }
  }

  // ============================================================================
  // ANALYTICS AND REPORTING
  // ============================================================================

  /**
   * Get gift card analytics
   */
  static async getGiftCardAnalytics(dateRange?: { start: string; end: string }): Promise<GiftCardAnalytics> {
    try {
      const params = new URLSearchParams();
      if (dateRange?.start) params.append('start', dateRange.start);
      if (dateRange?.end) params.append('end', dateRange.end);

      const response: AxiosResponse<APIResponse<GiftCardAnalytics>> =
        await apiClient.get(`/giftcards/analytics?${params.toString()}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to get analytics');
    } catch (error) {
      console.error('Error getting gift card analytics:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get analytics');
    }
  }

  /**
   * Get gift card transaction history
   */
  static async getGiftCardTransactions(cardId: ID): Promise<GiftCardTransaction[]> {
    try {
      const response: AxiosResponse<APIResponse<{ transactions: GiftCardTransaction[] }>> =
        await apiClient.get(`/giftcards/${cardId}/transactions`);

      if (response.data.success && response.data.data) {
        return response.data.data.transactions;
      }

      return [];
    } catch (error) {
      console.error('Error fetching gift card transactions:', error);
      return [];
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Format gift card code for display
   */
  static formatGiftCardCode(code: string): string {
    // Format like XXXX-XXXX-XXXX-XXXX
    return code.replace(/(.{4})/g, '$1-').slice(0, -1);
  }

  /**
   * Validate gift card code format
   */
  static isValidGiftCardCode(code: string): boolean {
    // Basic validation - adjust pattern as needed
    const pattern = /^[A-Z0-9]{16}$/;
    return pattern.test(code.replace(/-/g, ''));
  }

  /**
   * Check if gift card is expired
   */
  static isGiftCardExpired(giftCard: GiftCard): boolean {
    if (!giftCard.expiresAt) return false;
    return dayjs().isAfter(dayjs(giftCard.expiresAt));
  }

  /**
   * Get gift card status display
   */
  static getGiftCardStatusDisplay(status: GiftCardStatus): {
    label: string;
    color: string;
    icon: string;
  } {
    const statusMap = {
      active: { label: 'Active', color: 'green', icon: '✅' },
      inactive: { label: 'Inactive', color: 'gray', icon: '⭕' },
      used: { label: 'Used', color: 'gray', icon: '✨' },
      expired: { label: 'Expired', color: 'red', icon: '⏰' },
      cancelled: { label: 'Cancelled', color: 'red', icon: '❌' },
      pending: { label: 'Pending', color: 'yellow', icon: '⏳' },
      fraudulent: { label: 'Fraudulent', color: 'red', icon: '🚫' },
      locked: { label: 'Locked', color: 'orange', icon: '🔒' }
    };

    return statusMap[status] || statusMap.active;
  }

  /**
   * Calculate gift card usage percentage
   */
  static calculateUsagePercentage(giftCard: GiftCard): number {
    if (!giftCard.originalAmount || giftCard.originalAmount === 0) return 0;
    
    const used = giftCard.originalAmount - giftCard.balance;
    return Math.round((used / giftCard.originalAmount) * 100);
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
    GiftCardCacheManager.clearCache();
    this.queryClient?.clear();
  }

  /**
   * Validate purchase request
   */
  static validatePurchaseRequest(data: unknown): GiftCardPurchaseRequest {
    return GiftCardPurchaseSchema.parse(data);
  }

  /**
   * Validate redemption request
   */
  static validateRedemptionRequest(data: unknown): GiftCardRedemptionRequest {
    return GiftCardRedemptionSchema.parse(data);
  }
}

// Create singleton instance
export default GiftCardsService;

// Export utility functions
export {
  GiftCardSocketManager,
  GiftCardAnalyticsManager,
  GiftCardCacheManager,
};

