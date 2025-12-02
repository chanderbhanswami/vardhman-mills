/**
 * Product Comparison Service - Vardhman Mills Frontend
 * 
 * Comprehensive service for product comparison functionality including
 * comparison tables, feature analysis, decision support, and collaborative comparison.
 * 
 * Features:
 * - Real-time collaborative comparison with Socket.IO
 * - Advanced caching with React Query
 * - Analytics and user behavior tracking
 * - AI-powered comparison insights
 * - Social sharing and collaboration
 * - Export functionality
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
  ProductComparison,
  ComparisonAnalytics,
  ComparisonShareData,
  ComparisonListResponse,
  ComparisonFilters,
  ComparisonRecommendation
} from '../types/compare.types';
import { ID, Timestamp, APIResponse } from '../types/common.types';
import { Product } from '../types/product.types';

// Interface definitions for missing types
interface ComparisonCreateRequest {
  name: string;
  description?: string;
  products: string[];
  config: {
    showPrices?: boolean;
    showRatings?: boolean;
    showImages?: boolean;
    categories?: string[];
    customFields?: string[];
  };
  isPublic?: boolean;
}

interface ComparisonUpdateRequest extends Partial<ComparisonCreateRequest> {
  // Add specific update fields if needed
  lastModified?: Timestamp;
}

interface UserComparisonsResponse {
  comparisons: ProductComparison[];
  total: number;
  recentActivity: Array<{
    comparisonId: ID;
    action: string;
    timestamp: Timestamp;
  }>;
}

interface ComparisonFilter extends ComparisonFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'product_count' | 'views';
  sortOrder?: 'asc' | 'desc';
}

type ComparisonExportFormat = 'pdf' | 'excel' | 'csv';

interface CollaborativeSession {
  comparisonId: ID;
  participants: Array<{
    userId: ID;
    name: string;
    avatar?: string;
  }>;
  activeUsers: ID[];
  lastActivity: Timestamp;
}

interface ComparisonInsight {
  type: 'strength' | 'weakness' | 'recommendation' | 'alert';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  productIds?: ID[];
}

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

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const ComparisonCreateSchema = z.object({
  name: z.string().min(1, 'Comparison name is required').max(100),
  description: z.string().optional(),
  products: z.array(z.string()).min(2, 'At least 2 products required').max(10),
  config: z.object({
    showPrices: z.boolean().default(true),
    showRatings: z.boolean().default(true),
    showImages: z.boolean().default(true),
    categories: z.array(z.string()).optional(),
    customFields: z.array(z.string()).optional()
  }),
  isPublic: z.boolean().default(false)
});

const ComparisonUpdateSchema = ComparisonCreateSchema.partial();

// ============================================================================
// SOCKET MANAGER
// ============================================================================

class ComparisonSocketManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  get connected(): boolean {
    return this.isConnected;
  }

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(`${SOCKET_URL}/comparison`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Connected to comparison socket');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.handleReconnect();
    });

    this.socket.on('comparison_updated', (data: ProductComparison) => {
      this.handleComparisonUpdate(data);
    });

    this.socket.on('collaborative_update', (data: CollaborativeSession) => {
      this.handleCollaborativeUpdate(data);
    });

    this.socket.on('comparison_shared', (data: { comparisonId: ID; shareData: ComparisonShareData }) => {
      this.handleComparisonShared(data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinComparison(comparisonId: ID): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_comparison', { comparisonId });
    }
  }

  leaveComparison(comparisonId: ID): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_comparison', { comparisonId });
    }
  }

  // Debounced version to prevent excessive socket emissions
  shareUpdateDebounced = debounce((comparisonId: ID, update: Partial<ProductComparison>) => {
    this.shareUpdate(comparisonId, update);
  }, 500);

  shareUpdate(comparisonId: ID, update: Partial<ProductComparison>): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('comparison_update', { comparisonId, update });
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

  private handleComparisonUpdate(data: ProductComparison): void {
    // Update React Query cache
    ComparisonService.queryClient?.setQueryData(['comparison', data.id], data);
    
    // Show notification
    toast.success('Comparison updated');
  }

  private handleCollaborativeUpdate(data: CollaborativeSession): void {
    // Handle collaborative session updates
    ComparisonService.queryClient?.setQueryData(['collaborative_session', data.comparisonId], data);
  }

  private handleComparisonShared(data: { comparisonId: ID; shareData: ComparisonShareData }): void {
    // Handle comparison sharing events
    console.log('Comparison shared:', data.comparisonId, data.shareData);
    toast.success('Comparison shared successfully');
  }
}

// ============================================================================
// ANALYTICS MANAGER
// ============================================================================

class ComparisonAnalyticsManager {
  private static readonly ANALYTICS_ENDPOINT = '/analytics/comparison';

  static async trackComparisonView(comparisonId: ID): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/view`, {
        comparisonId,
        timestamp: dayjs().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track comparison view:', error);
    }
  }

  static async trackProductAdd(comparisonId: ID, productId: ID): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/product-add`, {
        comparisonId,
        productId,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track product add:', error);
    }
  }

  static async trackProductRemove(comparisonId: ID, productId: ID): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/product-remove`, {
        comparisonId,
        productId,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track product remove:', error);
    }
  }

  static async trackComparisonShare(comparisonId: ID, method: string): Promise<void> {
    try {
      await apiClient.post(`${this.ANALYTICS_ENDPOINT}/share`, {
        comparisonId,
        method,
        timestamp: new Date().toISOString() as Timestamp,
        sessionId: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track comparison share:', error);
    }
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('comparison_session_id');
    if (!sessionId) {
      sessionId = CryptoJS.lib.WordArray.random(16).toString();
      sessionStorage.setItem('comparison_session_id', sessionId);
    }
    return sessionId;
  }
}

// ============================================================================
// CACHE MANAGER
// ============================================================================

class ComparisonCacheManager {
  private static readonly CACHE_PREFIX = 'comparison_';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static setComparison(comparisonId: ID, comparison: ProductComparison): void {
    try {
      const cacheData = {
        data: comparison,
        timestamp: Date.now()
      };
      window.localStorage.setItem(
        `${this.CACHE_PREFIX}${comparisonId}`,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Failed to cache comparison:', error);
    }
  }

  static getComparison(comparisonId: ID): ProductComparison | null {
    try {
      const cached = window.localStorage.getItem(`${this.CACHE_PREFIX}${comparisonId}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        this.removeComparison(comparisonId);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Failed to get cached comparison:', error);
      return null;
    }
  }

  static removeComparison(comparisonId: ID): void {
    try {
      window.localStorage.removeItem(`${this.CACHE_PREFIX}${comparisonId}`);
    } catch (error) {
      console.error('Failed to remove cached comparison:', error);
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
      console.error('Failed to clear comparison cache:', error);
    }
  }
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

export class ComparisonService {
  public static queryClient: QueryClient | null = null;
  private static socketManager: ComparisonSocketManager | null = null;

  // Initialize service
  static initialize(queryClient: QueryClient): void {
    this.queryClient = queryClient;
    this.socketManager = new ComparisonSocketManager();
    this.socketManager.connect();
  }

  // Cleanup
  static cleanup(): void {
    this.socketManager?.disconnect();
    this.socketManager = null;
  }

  // ============================================================================
  // COMPARISON CRUD OPERATIONS
  // ============================================================================

  /**
   * Get all comparisons with filters
   */
  static async getComparisons(filters?: ComparisonFilter): Promise<ComparisonListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.status) params.append('status', Array.isArray(filters.status) ? filters.status.join(',') : filters.status);
      if (filters?.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response: AxiosResponse<APIResponse<ComparisonListResponse>> =
        await apiClient.get(`/comparisons?${params.toString()}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch comparisons');
    } catch (error) {
      console.error('Error fetching comparisons:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch comparisons');
    }
  }

  /**
   * Get user's comparisons
   */
  static async getUserComparisons(userId: ID): Promise<UserComparisonsResponse> {
    try {
      const response: AxiosResponse<APIResponse<UserComparisonsResponse>> =
        await apiClient.get(`/comparisons/user/${userId}`);

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        
        // Cache comparisons
        data.comparisons.forEach(comparison => {
          ComparisonCacheManager.setComparison(comparison.id, comparison);
        });

        // Track analytics
        ComparisonAnalyticsManager.trackComparisonView(userId);

        return data;
      }

      throw new Error(response.data.message || 'Failed to fetch user comparisons');
    } catch (error) {
      console.error('Error fetching user comparisons:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user comparisons');
    }
  }

  /**
   * Get single comparison by ID
   */
  static async getComparison(id: ID): Promise<ProductComparison> {
    try {
      // Check cache first
      const cached = ComparisonCacheManager.getComparison(id);
      if (cached) {
        ComparisonAnalyticsManager.trackComparisonView(id);
        return cached;
      }

      const response: AxiosResponse<APIResponse<ProductComparison>> =
        await apiClient.get(`/comparisons/${id}`);

      if (response.data.success && response.data.data) {
        const comparison = response.data.data;
        
        // Cache the comparison
        ComparisonCacheManager.setComparison(id, comparison);
        
        // Track analytics
        ComparisonAnalyticsManager.trackComparisonView(id);
        
        // Join socket room for real-time updates
        this.socketManager?.joinComparison(id);

        return comparison;
      }

      throw new Error(response.data.message || 'Comparison not found');
    } catch (error) {
      console.error('Error fetching comparison:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch comparison');
    }
  }

  /**
   * Create new comparison
   */
  static async createComparison(data: ComparisonCreateRequest): Promise<ProductComparison> {
    try {
      // Validate input
      const validatedData = ComparisonCreateSchema.parse(data);

      const response: AxiosResponse<APIResponse<ProductComparison>> =
        await apiClient.post('/comparisons', validatedData);

      if (response.data.success && response.data.data) {
        const comparison = response.data.data;
        
        // Cache the new comparison
        ComparisonCacheManager.setComparison(comparison.id, comparison);
        
        // Invalidate list cache
        this.queryClient?.invalidateQueries({ queryKey: ['comparisons'] });
        
        // Join socket room
        this.socketManager?.joinComparison(comparison.id);
        
        toast.success('Comparison created successfully');
        return comparison;
      }

      throw new Error(response.data.message || 'Failed to create comparison');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        ).join(', ');
        throw new Error(`Validation failed: ${fieldErrors}`);
      }
      
      console.error('Error creating comparison:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create comparison');
    }
  }

  /**
   * Update comparison
   */
  static async updateComparison(id: ID, data: ComparisonUpdateRequest): Promise<ProductComparison> {
    try {
      // Validate input
      const validatedData = ComparisonUpdateSchema.parse(data);

      const response: AxiosResponse<APIResponse<ProductComparison>> =
        await apiClient.put(`/comparisons/${id}`, validatedData);

      if (response.data.success && response.data.data) {
        const comparison = response.data.data;
        
        // Update cache
        ComparisonCacheManager.setComparison(id, comparison);
        
        // Update React Query cache
        this.queryClient?.setQueryData(['comparison', id], comparison);
        
        // Broadcast update via socket
        this.socketManager?.shareUpdate(id, comparison);
        
        toast.success('Comparison updated successfully');
        return comparison;
      }

      throw new Error(response.data.message || 'Failed to update comparison');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        ).join(', ');
        throw new Error(`Validation failed: ${fieldErrors}`);
      }
      
      console.error('Error updating comparison:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update comparison');
    }
  }

  /**
   * Delete comparison
   */
  static async deleteComparison(id: ID): Promise<void> {
    try {
      const response: AxiosResponse<APIResponse<null>> =
        await apiClient.delete(`/comparisons/${id}`);

      if (response.data.success) {
        // Remove from cache
        ComparisonCacheManager.removeComparison(id);
        
        // Invalidate queries
        this.queryClient?.invalidateQueries({ queryKey: ['comparisons'] });
        this.queryClient?.removeQueries({ queryKey: ['comparison', id] });
        
        // Leave socket room
        this.socketManager?.leaveComparison(id);
        
        toast.success('Comparison deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete comparison');
      }
    } catch (error) {
      console.error('Error deleting comparison:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete comparison');
    }
  }

  // ============================================================================
  // PRODUCT MANAGEMENT
  // ============================================================================

  /**
   * Add product to comparison
   */
  static async addProductToComparison(comparisonId: ID, productId: ID): Promise<ProductComparison> {
    try {
      const response: AxiosResponse<APIResponse<ProductComparison>> =
        await apiClient.post(`/comparisons/${comparisonId}/products`, { productId });

      if (response.data.success && response.data.data) {
        const comparison = response.data.data;
        
        // Update cache
        ComparisonCacheManager.setComparison(comparisonId, comparison);
        
        // Update React Query cache
        this.queryClient?.setQueryData(['comparison', comparisonId], comparison);
        
        // Track analytics
        ComparisonAnalyticsManager.trackProductAdd(comparisonId, productId);
        
        // Broadcast update
        this.socketManager?.shareUpdate(comparisonId, comparison);
        
        toast.success('Product added to comparison');
        return comparison;
      }

      throw new Error(response.data.message || 'Failed to add product');
    } catch (error) {
      console.error('Error adding product to comparison:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to add product');
    }
  }

  /**
   * Remove product from comparison
   */
  static async removeProductFromComparison(comparisonId: ID, productId: ID): Promise<ProductComparison> {
    try {
      const response: AxiosResponse<APIResponse<ProductComparison>> =
        await apiClient.delete(`/comparisons/${comparisonId}/products/${productId}`);

      if (response.data.success && response.data.data) {
        const comparison = response.data.data;
        
        // Update cache
        ComparisonCacheManager.setComparison(comparisonId, comparison);
        
        // Update React Query cache
        this.queryClient?.setQueryData(['comparison', comparisonId], comparison);
        
        // Track analytics
        ComparisonAnalyticsManager.trackProductRemove(comparisonId, productId);
        
        // Broadcast update
        this.socketManager?.shareUpdate(comparisonId, comparison);
        
        toast.success('Product removed from comparison');
        return comparison;
      }

      throw new Error(response.data.message || 'Failed to remove product');
    } catch (error) {
      console.error('Error removing product from comparison:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to remove product');
    }
  }

  // ============================================================================
  // SHARING AND COLLABORATION
  // ============================================================================

  /**
   * Share comparison
   */
  static async shareComparison(comparisonId: ID, shareData: Omit<ComparisonShareData, 'shareId' | 'shareUrl'>): Promise<ComparisonShareData> {
    try {
      const response: AxiosResponse<APIResponse<ComparisonShareData>> =
        await apiClient.post(`/comparisons/${comparisonId}/share`, shareData);

      if (response.data.success && response.data.data) {
        const shareResult = response.data.data;
        
        // Track analytics
        ComparisonAnalyticsManager.trackComparisonShare(comparisonId, 'share');
        
        toast.success('Comparison shared successfully');
        return shareResult;
      }

      throw new Error(response.data.message || 'Failed to share comparison');
    } catch (error) {
      console.error('Error sharing comparison:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to share comparison');
    }
  }

  /**
   * Get shared comparison
   */
  static async getSharedComparison(shareId: string): Promise<ProductComparison> {
    try {
      const response: AxiosResponse<APIResponse<ProductComparison>> =
        await apiClient.get(`/comparisons/shared/${shareId}`);

      if (response.data.success && response.data.data) {
        const comparison = response.data.data;
        
        // Track view
        ComparisonAnalyticsManager.trackComparisonView(comparison.id);
        
        return comparison;
      }

      throw new Error(response.data.message || 'Shared comparison not found');
    } catch (error) {
      console.error('Error fetching shared comparison:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch shared comparison');
    }
  }

  // ============================================================================
  // EXPORT FUNCTIONALITY
  // ============================================================================

  /**
   * Export comparison
   */
  static async exportComparison(comparisonId: ID, format: ComparisonExportFormat): Promise<Blob> {
    try {
      const response = await apiClient.get(`/comparisons/${comparisonId}/export`, {
        params: { format },
        responseType: 'blob'
      });

      return new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              'text/csv'
      });
    } catch (error) {
      console.error('Error exporting comparison:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to export comparison');
    }
  }

  // ============================================================================
  // AI INSIGHTS AND RECOMMENDATIONS
  // ============================================================================

  /**
   * Get AI insights for comparison
   */
  static async getComparisonInsights(comparisonId: ID): Promise<ComparisonInsight[]> {
    try {
      const response: AxiosResponse<APIResponse<ComparisonInsight[]>> =
        await apiClient.get(`/comparisons/${comparisonId}/insights`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to get insights');
    } catch (error) {
      console.error('Error getting comparison insights:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get insights');
    }
  }

  /**
   * Get product recommendations based on comparison
   */
  static async getRecommendations(comparisonId: ID): Promise<ComparisonRecommendation[]> {
    try {
      const response: AxiosResponse<APIResponse<ComparisonRecommendation[]>> =
        await apiClient.get(`/comparisons/${comparisonId}/recommendations`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to get recommendations');
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get recommendations');
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get comparison analytics
   */
  static async getComparisonAnalytics(comparisonId: ID): Promise<ComparisonAnalytics> {
    try {
      const response: AxiosResponse<APIResponse<ComparisonAnalytics>> =
        await apiClient.get(`/comparisons/${comparisonId}/analytics`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to get analytics');
    } catch (error) {
      console.error('Error getting comparison analytics:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get analytics');
    }
  }

  /**
   * Search products for comparison
   */
  static async searchProducts(query: string, filters?: Record<string, unknown>): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('limit', '20');
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response: AxiosResponse<APIResponse<{ products: Product[] }>> =
        await apiClient.get(`/products/search?${params.toString()}`);

      if (response.data.success && response.data.data) {
        return response.data.data.products;
      }

      return [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  /**
   * Validate comparison data
   */
  static validateComparisonData(data: unknown): ComparisonCreateRequest {
    return ComparisonCreateSchema.parse(data);
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
    ComparisonCacheManager.clearCache();
    this.queryClient?.clear();
  }
}

// Create singleton instance
export default ComparisonService;

// Export utility functions
export {
  ComparisonSocketManager,
  ComparisonAnalyticsManager,
  ComparisonCacheManager,
};

