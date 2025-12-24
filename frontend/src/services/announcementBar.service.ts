// ===== ANNOUNCEMENT BAR SERVICE =====
// Comprehensive announcement bar management with real-time updates
// Handles: display, user interactions, analytics, scheduling, multi-language

import { io, Socket } from 'socket.io-client';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { QueryClient } from '@tanstack/react-query';

import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { z } from 'zod';

// Types
import {
  AnnouncementBar,
  AnnouncementAnalytics,
  AnnouncementListResponse,
  AnnouncementPosition,
  AnnouncementPriority
} from '../types/announcementBar.types';
import { ID, Timestamp, Status, Language } from '../types/common.types';

// Define missing types
interface User {
  id: ID;
  email: string;
  name: string;
}

interface AnnouncementBarCreate extends Omit<AnnouncementBar, 'id' | 'createdAt' | 'updatedAt' | 'analytics' | 'status'> {
  isActive?: boolean;
}

interface AnnouncementBarUpdate extends Partial<AnnouncementBarCreate> {
  id: ID;
}

interface AnnouncementBarResponse {
  announcement: AnnouncementBar;
  analytics?: AnnouncementAnalytics;
}

interface AnnouncementBarSettings {
  id: string;
  enabled: boolean;
  position: AnnouncementPosition;
  animation: string;
  autoHide: boolean;
  autoHideDelay: number;
  showDismissButton: boolean;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementBarInteraction {
  id: ID;
  announcementId: ID;
  type: 'view' | 'click' | 'dismiss' | 'hover' | 'cta_click';
  userId?: ID;
  sessionId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface AnnouncementBarCampaign {
  id: ID;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementBarMetrics {
  views: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
}

interface AnnouncementBarABTest {
  id: ID;
  name: string;
  variants: AnnouncementBarVariant[];
  status: 'draft' | 'running' | 'completed';
  results?: Record<string, unknown>;
}

interface AnnouncementBarVariant {
  id: ID;
  name: string;
  config: Partial<AnnouncementBar>;
  trafficPercentage: number;
}



// Validation Schemas
const AnnouncementBarCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(1000, 'Content too long'),
  type: z.enum(['info', 'warning', 'success', 'error', 'promotion', 'announcement']),
  position: z.enum(['top', 'bottom', 'fixed-top', 'fixed-bottom']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  isActive: z.boolean().default(true),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  targeting: z.object({
    audiences: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    devices: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional()
  }).optional(),
  settings: z.object({
    isDismissible: z.boolean().default(true),
    autoHide: z.boolean().default(false),
    autoHideDelay: z.number().optional(),
    showOnce: z.boolean().default(false),
    frequencyCap: z.number().optional()
  }).optional()
});

const AnnouncementBarUpdateSchema = AnnouncementBarCreateSchema.partial().extend({
  id: z.string().min(1, 'ID is required')
});

const AnnouncementBarInteractionSchema = z.object({
  announcementId: z.string().min(1, 'Announcement ID is required'),
  type: z.enum(['view', 'click', 'dismiss', 'hover', 'cta_click']),
  userId: z.string().optional(),
  sessionId: z.string(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional()
});

// ===== SOCKET MANAGER =====
class AnnouncementBarSocketManager {
  private static instance: AnnouncementBarSocketManager;
  private socket: Socket | null = null;
  private connectionAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  static getInstance(): AnnouncementBarSocketManager {
    if (!AnnouncementBarSocketManager.instance) {
      AnnouncementBarSocketManager.instance = new AnnouncementBarSocketManager();
    }
    return AnnouncementBarSocketManager.instance;
  }

  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) return;

    this.isConnecting = true;
    
    try {
      const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      
      this.socket = io(`${serverUrl}/announcements`, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      });

      this.setupEventListeners();
      await this.waitForConnection();
      
    } catch (error) {
      console.error('Failed to connect to announcement socket:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to announcement socket');
      this.connectionAttempts = 0;
      AnnouncementBarService.handleSocketConnected();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from announcement socket');
      AnnouncementBarService.handleSocketDisconnected();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Announcement socket connection error:', error);
      this.connectionAttempts++;
      
      if (this.connectionAttempts >= this.maxReconnectAttempts) {
        toast.error('Failed to connect to real-time updates');
      }
    });

    // Announcement events
    this.socket.on('announcement:created', this.handleAnnouncementCreated.bind(this));
    this.socket.on('announcement:updated', this.handleAnnouncementUpdated.bind(this));
    this.socket.on('announcement:deleted', this.handleAnnouncementDeleted.bind(this));
    this.socket.on('announcement:activated', this.handleAnnouncementActivated.bind(this));
    this.socket.on('announcement:deactivated', this.handleAnnouncementDeactivated.bind(this));
    this.socket.on('announcement:scheduled', this.handleAnnouncementScheduled.bind(this));
    this.socket.on('announcement:expired', this.handleAnnouncementExpired.bind(this));

    // Analytics events
    this.socket.on('announcement:analytics_update', this.handleAnalyticsUpdate.bind(this));
    this.socket.on('announcement:interaction_batch', this.handleInteractionBatch.bind(this));

    // Campaign events
    this.socket.on('campaign:started', this.handleCampaignStarted.bind(this));
    this.socket.on('campaign:ended', this.handleCampaignEnded.bind(this));
    this.socket.on('campaign:performance_update', this.handleCampaignPerformanceUpdate.bind(this));

    // A/B Testing events
    this.socket.on('abtest:variant_assigned', this.handleABTestVariantAssigned.bind(this));
    this.socket.on('abtest:results_update', this.handleABTestResultsUpdate.bind(this));
  }

  private async waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      if (this.socket.connected) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      this.socket.once('connect', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.socket.once('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  // Event handlers
  private handleAnnouncementCreated(data: { announcement: AnnouncementBar }): void {
    AnnouncementBarService.handleAnnouncementCreated(data.announcement);
  }

  private handleAnnouncementUpdated(data: { announcement: AnnouncementBar }): void {
    AnnouncementBarService.handleAnnouncementUpdated(data.announcement);
  }

  private handleAnnouncementDeleted(data: { announcementId: ID }): void {
    AnnouncementBarService.handleAnnouncementDeleted(data.announcementId);
  }

  private handleAnnouncementActivated(data: { announcement: AnnouncementBar }): void {
    AnnouncementBarService.handleAnnouncementActivated(data.announcement);
  }

  private handleAnnouncementDeactivated(data: { announcementId: ID }): void {
    AnnouncementBarService.handleAnnouncementDeactivated(data.announcementId);
  }

  private handleAnnouncementScheduled(data: { announcement: AnnouncementBar }): void {
    AnnouncementBarService.handleAnnouncementScheduled(data.announcement);
  }

  private handleAnnouncementExpired(data: { announcementId: ID }): void {
    AnnouncementBarService.handleAnnouncementExpired(data.announcementId);
  }

  private handleAnalyticsUpdate(data: { announcementId: ID; analytics: AnnouncementAnalytics }): void {
    AnnouncementBarService.handleAnalyticsUpdate(data.announcementId, data.analytics);
  }

  private handleInteractionBatch(data: { interactions: AnnouncementBarInteraction[] }): void {
    AnnouncementBarService.handleInteractionBatch(data.interactions);
  }

  private handleCampaignStarted(data: { campaign: AnnouncementBarCampaign }): void {
    AnnouncementBarService.handleCampaignStarted(data.campaign);
  }

  private handleCampaignEnded(data: { campaignId: ID }): void {
    AnnouncementBarService.handleCampaignEnded(data.campaignId);
  }

  private handleCampaignPerformanceUpdate(data: { campaignId: ID; performance: AnnouncementBarMetrics }): void {
    AnnouncementBarService.handleCampaignPerformanceUpdate(data.campaignId, data.performance);
  }

  private handleABTestVariantAssigned(data: { userId: ID; variantId: ID; testId: ID }): void {
    AnnouncementBarService.handleABTestVariantAssigned(data.userId, data.variantId, data.testId);
  }

  private handleABTestResultsUpdate(data: { testId: ID; results: Record<string, unknown> }): void {
    AnnouncementBarService.handleABTestResultsUpdate(data.testId, data.results);
  }

  // Emit events
  emitUserInteraction(interaction: AnnouncementBarInteraction): void {
    if (this.socket?.connected) {
      this.socket.emit('user:interaction', interaction);
    }
  }

  emitViewStarted(announcementId: ID, userId?: ID): void {
    if (this.socket?.connected) {
      this.socket.emit('announcement:view_started', { announcementId, userId });
    }
  }

  emitViewEnded(announcementId: ID, userId?: ID, duration: number = 0): void {
    if (this.socket?.connected) {
      this.socket.emit('announcement:view_ended', { announcementId, userId, duration });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// ===== ANALYTICS MANAGER =====
class AnnouncementBarAnalyticsManager {
  private static instance: AnnouncementBarAnalyticsManager;
  private interactionQueue: AnnouncementBarInteraction[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  static getInstance(): AnnouncementBarAnalyticsManager {
    if (!AnnouncementBarAnalyticsManager.instance) {
      AnnouncementBarAnalyticsManager.instance = new AnnouncementBarAnalyticsManager();
    }
    return AnnouncementBarAnalyticsManager.instance;
  }

  constructor() {
    this.startBatchProcessor();
  }

  // Track interactions
  trackView(announcementId: ID, userId?: ID): void {
    this.queueInteraction({
      id: this.generateInteractionId(),
      announcementId,
      type: 'view',
      userId,
      sessionId: this.getSessionId(),
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    });
  }

  trackClick(announcementId: ID, element: string, userId?: ID): void {
    this.queueInteraction({
      id: this.generateInteractionId(),
      announcementId,
      type: 'click',
      userId,
      sessionId: this.getSessionId(),
      timestamp: new Date().toISOString(),
      metadata: {
        element,
        position: this.getElementPosition(element)
      }
    });
  }

  trackDismiss(announcementId: ID, method: string, userId?: ID): void {
    this.queueInteraction({
      id: this.generateInteractionId(),
      announcementId,
      type: 'dismiss',
      userId,
      sessionId: this.getSessionId(),
      timestamp: new Date().toISOString(),
      metadata: {
        dismissMethod: method,
        timeOnScreen: this.getTimeOnScreen(announcementId)
      }
    });
  }

  trackHover(announcementId: ID, duration: number, userId?: ID): void {
    this.queueInteraction({
      id: this.generateInteractionId(),
      announcementId,
      type: 'hover',
      userId,
      sessionId: this.getSessionId(),
      timestamp: new Date().toISOString(),
      metadata: {
        hoverDuration: duration
      }
    });
  }

  trackCTAClick(announcementId: ID, ctaId: string, ctaText: string, userId?: ID): void {
    this.queueInteraction({
      id: this.generateInteractionId(),
      announcementId,
      type: 'cta_click',
      userId,
      sessionId: this.getSessionId(),
      timestamp: new Date().toISOString(),
      metadata: {
        ctaId,
        ctaText,
        conversionValue: this.getConversionValue(ctaId)
      }
    });
  }

  // Batch processing
  private queueInteraction(interaction: AnnouncementBarInteraction): void {
    this.interactionQueue.push(interaction);
    
    if (this.interactionQueue.length >= this.batchSize) {
      this.flushInteractions();
    }
  }

  private startBatchProcessor(): void {
    this.flushTimer = setInterval(() => {
      if (this.interactionQueue.length > 0) {
        this.flushInteractions();
      }
    }, this.flushInterval);
  }

  private async flushInteractions(): Promise<void> {
    if (this.interactionQueue.length === 0) return;

    const batch = [...this.interactionQueue];
    this.interactionQueue = [];

    try {
      // Send to Socket.IO
      const socketManager = AnnouncementBarSocketManager.getInstance();
      if (socketManager.isConnected()) {
        batch.forEach(interaction => {
          socketManager.emitUserInteraction(interaction);
        });
      }

      // Send to analytics API
      await axios.post('/api/announcements/analytics/interactions', {
        interactions: batch
      });

    } catch (error) {
      console.error('Failed to flush interactions:', error);
      // Re-queue failed interactions
      this.interactionQueue.unshift(...batch);
    }
  }

  // Utility methods
  private generateInteractionId(): string {
    return `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('announcement_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('announcement_session_id', sessionId);
    }
    return sessionId;
  }

  private getElementPosition(element: string): { x: number; y: number } | undefined {
    const el = document.querySelector(`[data-element="${element}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      return { x: rect.left, y: rect.top };
    }
    return undefined;
  }

  private getTimeOnScreen(announcementId: ID): number {
    const key = `announcement_start_time_${announcementId}`;
    const startTime = sessionStorage.getItem(key);
    if (startTime) {
      return Date.now() - parseInt(startTime);
    }
    return 0;
  }

  private getConversionValue(ctaId: string): number {
    // Implement conversion value calculation based on CTA type
    const conversionMap: Record<string, number> = {
      'signup': 10,
      'purchase': 50,
      'download': 5,
      'contact': 15,
      'newsletter': 3
    };
    return conversionMap[ctaId] || 1;
  }

  // Cleanup
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flushInteractions();
  }
}

// ===== LOCAL STORAGE MANAGER =====
class AnnouncementBarLocalStorageManager {
  private static instance: AnnouncementBarLocalStorageManager;
  private storagePrefix = 'announcement_bar_';

  static getInstance(): AnnouncementBarLocalStorageManager {
    if (!AnnouncementBarLocalStorageManager.instance) {
      AnnouncementBarLocalStorageManager.instance = new AnnouncementBarLocalStorageManager();
    }
    return AnnouncementBarLocalStorageManager.instance;
  }

  // Dismissed announcements
  getDismissedAnnouncements(): ID[] {
    try {
      const dismissed = localStorage.getItem(`${this.storagePrefix}dismissed`);
      return dismissed ? JSON.parse(dismissed) : [];
    } catch {
      return [];
    }
  }

  addDismissedAnnouncement(announcementId: ID): void {
    const dismissed = this.getDismissedAnnouncements();
    if (!dismissed.includes(announcementId)) {
      dismissed.push(announcementId);
      localStorage.setItem(`${this.storagePrefix}dismissed`, JSON.stringify(dismissed));
    }
  }

  removeDismissedAnnouncement(announcementId: ID): void {
    const dismissed = this.getDismissedAnnouncements();
    const updated = dismissed.filter(id => id !== announcementId);
    localStorage.setItem(`${this.storagePrefix}dismissed`, JSON.stringify(updated));
  }

  clearDismissedAnnouncements(): void {
    localStorage.removeItem(`${this.storagePrefix}dismissed`);
  }

  // View tracking
  getViewedAnnouncements(): Record<ID, { count: number; lastViewed: Timestamp }> {
    try {
      const viewed = localStorage.getItem(`${this.storagePrefix}viewed`);
      return viewed ? JSON.parse(viewed) : {};
    } catch {
      return {};
    }
  }

  recordAnnouncementView(announcementId: ID): void {
    const viewed = this.getViewedAnnouncements();
    const current = viewed[announcementId] || { count: 0, lastViewed: '' };
    
    viewed[announcementId] = {
      count: current.count + 1,
      lastViewed: new Date().toISOString()
    };
    
    localStorage.setItem(`${this.storagePrefix}viewed`, JSON.stringify(viewed));
  }

  getAnnouncementViewCount(announcementId: ID): number {
    const viewed = this.getViewedAnnouncements();
    return viewed[announcementId]?.count || 0;
  }

  // User preferences
  getUserPreferences(): AnnouncementBarSettings {
    try {
      const prefs = localStorage.getItem(`${this.storagePrefix}preferences`);
      return prefs ? JSON.parse(prefs) : this.getDefaultPreferences();
    } catch {
      return this.getDefaultPreferences();
    }
  }

  updateUserPreferences(preferences: Partial<AnnouncementBarSettings>): void {
    const current = this.getUserPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(`${this.storagePrefix}preferences`, JSON.stringify(updated));
  }

  private getDefaultPreferences(): AnnouncementBarSettings {
    return {
      id: 'default',
      enabled: true,
      position: 'top',
      animation: 'slide',
      autoHide: false,
      autoHideDelay: 5000,
      showDismissButton: true,
      theme: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // A/B Test assignments
  getABTestAssignments(): Record<string, string> {
    try {
      const assignments = localStorage.getItem(`${this.storagePrefix}ab_tests`);
      return assignments ? JSON.parse(assignments) : {};
    } catch {
      return {};
    }
  }

  setABTestAssignment(testId: string, variantId: string): void {
    const assignments = this.getABTestAssignments();
    assignments[testId] = variantId;
    localStorage.setItem(`${this.storagePrefix}ab_tests`, JSON.stringify(assignments));
  }

  getABTestAssignment(testId: string): string | null {
    const assignments = this.getABTestAssignments();
    return assignments[testId] || null;
  }

  // Cleanup
  cleanup(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.storagePrefix)) {
        // Check if data is older than 30 days
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          const thirtyDaysAgo = dayjs().subtract(30, 'days').toISOString();
          
          if (data.timestamp && data.timestamp < thirtyDaysAgo) {
            localStorage.removeItem(key);
          }
        } catch {
          // Remove invalid data
          localStorage.removeItem(key);
        }
      }
    });
  }
}

// ===== MAIN SERVICE =====
class AnnouncementBarService {
  private static instance: AnnouncementBarService;
  private queryClient: QueryClient;
  private socketManager: AnnouncementBarSocketManager;
  private analyticsManager: AnnouncementBarAnalyticsManager;
  private storageManager: AnnouncementBarLocalStorageManager;
  private baseURL: string;
  private isInitialized = false;
  private currentUser?: User;

  // Debounced functions
  private debouncedTrackView = debounce(this.trackView.bind(this), 500);
  private debouncedTrackHover = debounce(this.trackHover.bind(this), 1000);

  static getInstance(): AnnouncementBarService {
    if (!AnnouncementBarService.instance) {
      AnnouncementBarService.instance = new AnnouncementBarService();
    }
    return AnnouncementBarService.instance;
  }

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    this.queryClient = new QueryClient();
    this.socketManager = AnnouncementBarSocketManager.getInstance();
    this.analyticsManager = AnnouncementBarAnalyticsManager.getInstance();
    this.storageManager = AnnouncementBarLocalStorageManager.getInstance();
  }

  // ===== INITIALIZATION =====
  async initialize(user?: User): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.currentUser = user;
      
      // Connect to socket
      await this.socketManager.connect();
      
      // Cleanup old data
      this.storageManager.cleanup();
      
      this.isInitialized = true;
      console.log('AnnouncementBarService initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize AnnouncementBarService:', error);
      throw error;
    }
  }

  // ===== CRUD OPERATIONS =====
  async getAnnouncements(options?: {
    page?: number;
    limit?: number;
    status?: Status;
    position?: AnnouncementPosition;
    priority?: AnnouncementPriority;
    type?: string;
  }): Promise<AnnouncementListResponse> {
    try {
      const params = new URLSearchParams();
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.status) params.append('status', options.status);
      if (options?.position) params.append('position', options.position);
      if (options?.priority) params.append('priority', options.priority);
      if (options?.type) params.append('type', options.type);

      const response = await axios.get(`${this.baseURL}/api/announcements?${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      throw this.handleAPIError(error);
    }
  }

  async getActiveAnnouncements(): Promise<AnnouncementBar[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/announcements/active`);
      const announcements = response.data.announcements || [];
      
      // Filter based on user preferences and dismissals
      const dismissed = this.storageManager.getDismissedAnnouncements();
      const preferences = this.storageManager.getUserPreferences();
      
      return announcements.filter((announcement: AnnouncementBar) => {
        // Skip dismissed announcements
        if (dismissed.includes(announcement.id)) return false;
        
        // Check user preferences
        if (!preferences.enabled) return false;
        
        // Check frequency cap (if implemented in future)
        // if (announcement.frequencyCap) {
        //   const viewCount = this.storageManager.getAnnouncementViewCount(announcement.id);
        //   if (viewCount >= announcement.frequencyCap.maxViews) return false;
        // }
        
        // Check scheduling
        if (announcement.schedule) {
          const now = dayjs();
          const startDate = dayjs(announcement.schedule.startDate);
          const endDate = announcement.schedule.endDate ? dayjs(announcement.schedule.endDate) : null;
          
          if (now.isBefore(startDate)) return false;
          if (endDate && now.isAfter(endDate)) return false;
        }
        
        return true;
      });
    } catch (error) {
      console.error('Failed to fetch active announcements:', error);
      throw this.handleAPIError(error);
    }
  }

  async getAnnouncementById(id: ID): Promise<AnnouncementBarResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/api/announcements/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch announcement ${id}:`, error);
      throw this.handleAPIError(error);
    }
  }

  async createAnnouncement(data: AnnouncementBarCreate): Promise<AnnouncementBar> {
    try {
      const validatedData = AnnouncementBarCreateSchema.parse(data);
      const response = await axios.post(`${this.baseURL}/api/announcements`, validatedData);
      
      const announcement = response.data.announcement;
      toast.success('Announcement created successfully');
      
      // Invalidate cache
      this.queryClient.invalidateQueries({ queryKey: ['announcements'] });
      
      return announcement;
    } catch (error) {
      console.error('Failed to create announcement:', error);
      toast.error('Failed to create announcement');
      throw this.handleAPIError(error);
    }
  }

  async updateAnnouncement(id: ID, data: AnnouncementBarUpdate): Promise<AnnouncementBar> {
    try {
      const validatedData = AnnouncementBarUpdateSchema.parse({ ...data, id });
      const response = await axios.put(`${this.baseURL}/api/announcements/${id}`, validatedData);
      
      const announcement = response.data.announcement;
      toast.success('Announcement updated successfully');
      
      // Invalidate cache
      this.queryClient.invalidateQueries({ queryKey: ['announcements'] });
      this.queryClient.invalidateQueries({ queryKey: ['announcement', id] });
      
      return announcement;
    } catch (error) {
      console.error(`Failed to update announcement ${id}:`, error);
      toast.error('Failed to update announcement');
      throw this.handleAPIError(error);
    }
  }

  async deleteAnnouncement(id: ID): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/api/announcements/${id}`);
      
      toast.success('Announcement deleted successfully');
      
      // Invalidate cache
      this.queryClient.invalidateQueries({ queryKey: ['announcements'] });
      this.queryClient.removeQueries({ queryKey: ['announcement', id] });
      
      // Remove from local storage
      this.storageManager.removeDismissedAnnouncement(id);
      
    } catch (error) {
      console.error(`Failed to delete announcement ${id}:`, error);
      toast.error('Failed to delete announcement');
      throw this.handleAPIError(error);
    }
  }

  // ===== INTERACTION METHODS =====
  async dismissAnnouncement(id: ID, method: string = 'manual'): Promise<void> {
    try {
      // Track dismissal
      this.analyticsManager.trackDismiss(id, method, this.currentUser?.id);
      
      // Store dismissal locally
      this.storageManager.addDismissedAnnouncement(id);
      
      // Notify server
      await axios.post(`${this.baseURL}/api/announcements/${id}/dismiss`, {
        method,
        userId: this.currentUser?.id,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate cache
      this.queryClient.invalidateQueries({ queryKey: ['announcements', 'active'] });
      
    } catch (error) {
      console.error(`Failed to dismiss announcement ${id}:`, error);
      // Don't throw - dismissal should work locally even if server fails
    }
  }

  viewAnnouncement(id: ID): void {
    // Record view locally
    this.storageManager.recordAnnouncementView(id);
    
    // Track view with debouncing
    this.debouncedTrackView(id);
    
    // Start view timer
    const key = `announcement_start_time_${id}`;
    sessionStorage.setItem(key, Date.now().toString());
    
    // Emit view started
    this.socketManager.emitViewStarted(id, this.currentUser?.id);
  }

  private trackView(id: ID): void {
    this.analyticsManager.trackView(id, this.currentUser?.id);
  }

  clickAnnouncement(id: ID, element: string): void {
    this.analyticsManager.trackClick(id, element, this.currentUser?.id);
  }

  hoverAnnouncement(id: ID, duration: number): void {
    this.debouncedTrackHover(id, duration);
  }

  private trackHover(id: ID, duration: number): void {
    this.analyticsManager.trackHover(id, duration, this.currentUser?.id);
  }

  clickCTA(id: ID, ctaId: string, ctaText: string): void {
    this.analyticsManager.trackCTAClick(id, ctaId, ctaText, this.currentUser?.id);
  }

  // ===== ANALYTICS =====
  async getAnnouncementAnalytics(id: ID, timeRange?: {
    startDate: string;
    endDate: string;
  }): Promise<AnnouncementAnalytics> {
    try {
      const params = new URLSearchParams();
      if (timeRange?.startDate) params.append('startDate', timeRange.startDate);
      if (timeRange?.endDate) params.append('endDate', timeRange.endDate);

      const response = await axios.get(`${this.baseURL}/api/announcements/${id}/analytics?${params}`);
      return response.data.analytics;
    } catch (error) {
      console.error(`Failed to fetch analytics for announcement ${id}:`, error);
      throw this.handleAPIError(error);
    }
  }

  async getGlobalAnalytics(timeRange?: {
    startDate: string;
    endDate: string;
  }): Promise<{
    totalViews: number;
    totalClicks: number;
    totalDismissals: number;
    averageCTR: number;
    topPerforming: AnnouncementBar[];
    performanceByPosition: Record<AnnouncementPosition, number>;
    performanceByType: Record<string, number>;
  }> {
    try {
      const params = new URLSearchParams();
      if (timeRange?.startDate) params.append('startDate', timeRange.startDate);
      if (timeRange?.endDate) params.append('endDate', timeRange.endDate);

      const response = await axios.get(`${this.baseURL}/api/announcements/analytics/global?${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch global analytics:', error);
      throw this.handleAPIError(error);
    }
  }

  // ===== A/B TESTING =====
  async createABTest(data: {
    name: string;
    description?: string;
    variants: AnnouncementBarVariant[];
    trafficSplit: number[];
    duration: number;
    primaryMetric: string;
  }): Promise<AnnouncementBarABTest> {
    try {
      const response = await axios.post(`${this.baseURL}/api/announcements/ab-tests`, data);
      const abTest = response.data.abTest;
      
      toast.success('A/B test created successfully');
      return abTest;
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      toast.error('Failed to create A/B test');
      throw this.handleAPIError(error);
    }
  }

  getABTestVariant(testId: string): string | null {
    return this.storageManager.getABTestAssignment(testId);
  }

  assignABTestVariant(testId: string, variantId: string): void {
    this.storageManager.setABTestAssignment(testId, variantId);
  }

  // ===== SETTINGS & PREFERENCES =====
  getUserPreferences(): AnnouncementBarSettings {
    return this.storageManager.getUserPreferences();
  }

  updateUserPreferences(preferences: Partial<AnnouncementBarSettings>): void {
    this.storageManager.updateUserPreferences(preferences);
    this.queryClient.invalidateQueries({ queryKey: ['announcements', 'active'] });
  }

  // ===== UTILITY METHODS =====
  static validateAnnouncementData(data: AnnouncementBarCreate): {
    isValid: boolean;
    errors: string[];
  } {
    try {
      AnnouncementBarCreateSchema.parse(data);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return { isValid: false, errors: ['Invalid data format'] };
    }
  }

  static formatAnnouncementContent(content: string, variables?: Record<string, string>): string {
    if (!variables) return content;
    
    let formatted = content;
    Object.entries(variables).forEach(([key, value]) => {
      formatted = formatted.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    return formatted;
  }

  static getAnnouncementPriority(announcement: AnnouncementBar): number {
    const priorityMap: Record<AnnouncementPriority, number> = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4,
      info: 5
    };
    return priorityMap[announcement.priority] || 4;
  }

  static shouldShowAnnouncement(
    announcement: AnnouncementBar,
    userContext: {
      userId?: ID;
      location?: string;
      device?: string;
      language?: Language;
    }
  ): boolean {
    // Check targeting rules
    if (announcement.targeting) {
      const { geographic, devices } = announcement.targeting;
      
      if (geographic?.countries && userContext.location && !geographic.countries.includes(userContext.location)) {
        return false;
      }
      
      if (devices?.deviceTypes && userContext.device && !devices.deviceTypes.includes(userContext.device as 'mobile' | 'desktop' | 'tablet')) {
        return false;
      }
    }
    
    return true;
  }

  // Utility method for future display rule evaluation
  // private static evaluateDisplayRule(rule: any, context: any): boolean {
  //   return true;
  // }

  // ===== SOCKET EVENT HANDLERS =====
  static handleSocketConnected(): void {
    console.log('Announcement socket connected');
  }

  static handleSocketDisconnected(): void {
    console.log('Announcement socket disconnected');
  }

  static handleAnnouncementCreated(announcement: AnnouncementBar): void {
    const instance = AnnouncementBarService.getInstance();
    instance.queryClient.invalidateQueries({ queryKey: ['announcements'] });
    
    if (announcement.status === 'active') {
      instance.queryClient.invalidateQueries({ queryKey: ['announcements', 'active'] });
      toast.success(`New announcement: ${announcement.title}`);
    }
  }

  static handleAnnouncementUpdated(announcement: AnnouncementBar): void {
    const instance = AnnouncementBarService.getInstance();
    instance.queryClient.setQueryData(['announcement', announcement.id], announcement);
    instance.queryClient.invalidateQueries({ queryKey: ['announcements'] });
    
    if (announcement.status === 'active') {
      instance.queryClient.invalidateQueries({ queryKey: ['announcements', 'active'] });
    }
  }

  static handleAnnouncementDeleted(announcementId: ID): void {
    const instance = AnnouncementBarService.getInstance();
    instance.queryClient.removeQueries({ queryKey: ['announcement', announcementId] });
    instance.queryClient.invalidateQueries({ queryKey: ['announcements'] });
    instance.queryClient.invalidateQueries({ queryKey: ['announcements', 'active'] });
  }

  static handleAnnouncementActivated(announcement: AnnouncementBar): void {
    const instance = AnnouncementBarService.getInstance();
    instance.queryClient.invalidateQueries({ queryKey: ['announcements', 'active'] });
    toast.success(`Announcement activated: ${announcement.title}`);
  }

  static handleAnnouncementDeactivated(announcementId: ID): void {
    console.log('Announcement deactivated:', announcementId);
    const instance = AnnouncementBarService.getInstance();
    instance.queryClient.invalidateQueries({ queryKey: ['announcements', 'active'] });
  }

  static handleAnnouncementScheduled(announcement: AnnouncementBar): void {
    const instance = AnnouncementBarService.getInstance();
    instance.queryClient.invalidateQueries({ queryKey: ['announcements'] });
    
    const startDate = dayjs(announcement.schedule?.startDate);
    toast.success(`Announcement scheduled for ${startDate.format('MMM D, YYYY')}`);
  }

  static handleAnnouncementExpired(announcementId: ID): void {
    console.log('Announcement expired:', announcementId);
    const instance = AnnouncementBarService.getInstance();
    instance.queryClient.invalidateQueries({ queryKey: ['announcements', 'active'] });
  }

  static handleAnalyticsUpdate(announcementId: ID, analytics: AnnouncementAnalytics): void {
    const instance = AnnouncementBarService.getInstance();
    instance.queryClient.setQueryData(['announcement', announcementId, 'analytics'], analytics);
  }

  static handleInteractionBatch(interactions: AnnouncementBarInteraction[]): void {
    // Handle batch interaction updates if needed
    console.log('Processing interaction batch:', interactions.length);
  }

  static handleCampaignStarted(campaign: AnnouncementBarCampaign): void {
    toast.success(`Campaign started: ${campaign.name}`);
  }

  static handleCampaignEnded(campaignId: ID): void {
    console.log(`Campaign ended: ${campaignId}`);
  }

  static handleCampaignPerformanceUpdate(campaignId: ID, performance: AnnouncementBarMetrics): void {
    console.log(`Campaign performance update: ${campaignId}`, performance);
  }

  static handleABTestVariantAssigned(userId: ID, variantId: ID, testId: ID): void {
    const instance = AnnouncementBarService.getInstance();
    if (instance.currentUser?.id === userId) {
      instance.assignABTestVariant(testId, variantId);
    }
  }

  static handleABTestResultsUpdate(testId: ID, results: unknown): void {
    console.log(`A/B test results update: ${testId}`, results);
  }

  // ===== ERROR HANDLING =====
  private handleAPIError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message || 'API request failed';
      return new Error(message);
    }
    
    if (error instanceof Error) {
      return error;
    }
    
    return new Error('Unknown error occurred');
  }

  // ===== CLEANUP =====
  destroy(): void {
    this.analyticsManager.destroy();
    this.socketManager.disconnect();
    this.queryClient.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
export default AnnouncementBarService.getInstance();

// Export class for testing
export { AnnouncementBarService };

// Export managers for advanced usage
export {
  AnnouncementBarSocketManager,
  AnnouncementBarAnalyticsManager,
  AnnouncementBarLocalStorageManager
};

// Export validation schemas
export {
  AnnouncementBarCreateSchema,
  AnnouncementBarUpdateSchema,
  AnnouncementBarInteractionSchema
};
