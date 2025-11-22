import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { 
  ApiResponse, 
  PaginationParams,
  SearchParams 
} from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildPaginationParams, buildSearchParams } from './utils';

/**
 * Notification API Service
 * Handles notifications, email marketing, push notifications, and communication preferences
 */

interface NotificationData {
  orderId?: string;
  paymentId?: string;
  userId?: string;
  url?: string;
  [key: string]: unknown;
}

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'promotion' | 'system' | 'security' | 'reminder' | 'news';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: NotificationData;
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  expiresAt?: string;
  createdAt: string;
  readAt?: string;
}

interface NotificationPreferences {
  email: {
    orders: boolean;
    promotions: boolean;
    newsletters: boolean;
    security: boolean;
    reminders: boolean;
    productUpdates: boolean;
  };
  push: {
    orders: boolean;
    promotions: boolean;
    security: boolean;
    reminders: boolean;
    news: boolean;
  };
  sms: {
    orders: boolean;
    security: boolean;
    reminders: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'welcome' | 'order_confirmation' | 'shipping' | 'promotion' | 'newsletter' | 'password_reset';
  isActive: boolean;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

interface CampaignFilters {
  userType?: string;
  lastOrderDate?: string;
  totalSpent?: number;
  location?: string;
  [key: string]: unknown;
}

interface SystemSettings {
  emailProvider?: string;
  pushEnabled?: boolean;
  smsEnabled?: boolean;
  [key: string]: unknown;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  templateId?: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  targetAudience: {
    segments: string[];
    filters: CampaignFilters;
    excludeUnsubscribed: boolean;
  };
  scheduledAt?: string;
  sentAt?: string;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  createdAt: string;
  updatedAt: string;
}

class NotificationApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // User Notifications

  // Get user notifications
  async getNotifications(params?: PaginationParams & {
    type?: string;
    isRead?: boolean;
    priority?: string;
  }): Promise<ApiResponse<Notification[]>> {
    const queryParams = {
      ...buildPaginationParams(params || {}),
      ...(params?.type && { type: params.type }),
      ...(params?.isRead !== undefined && { isRead: params.isRead }),
      ...(params?.priority && { priority: params.priority }),
    };
    
    return this.client.get<Notification[]>(endpoints.notifications.list, { params: queryParams });
  }

  // Get unread notifications count
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return this.client.get<{ count: number }>(endpoints.notifications.unreadCount);
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.notifications.markRead(notificationId));
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<ApiResponse<{ message: string; count: number }>> {
    return this.client.post<{ message: string; count: number }>(endpoints.notifications.markAllRead);
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.notifications.delete(notificationId));
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<ApiResponse<{ message: string; count: number }>> {
    return this.client.delete<{ message: string; count: number }>(endpoints.notifications.clear);
  }

  // Notification Preferences

  // Get notification preferences
  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return this.client.get<NotificationPreferences>(endpoints.notifications.preferences);
  }

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> {
    return this.client.put<NotificationPreferences>(endpoints.notifications.preferences, preferences);
  }

  // Update specific preference category
  async updateEmailPreferences(emailPrefs: Partial<NotificationPreferences['email']>): Promise<ApiResponse<NotificationPreferences>> {
    return this.client.put<NotificationPreferences>(endpoints.notifications.emailPreferences, { email: emailPrefs });
  }

  async updatePushPreferences(pushPrefs: Partial<NotificationPreferences['push']>): Promise<ApiResponse<NotificationPreferences>> {
    return this.client.put<NotificationPreferences>(endpoints.notifications.pushPreferences, { push: pushPrefs });
  }

  async updateSmsPreferences(smsPrefs: Partial<NotificationPreferences['sms']>): Promise<ApiResponse<NotificationPreferences>> {
    return this.client.put<NotificationPreferences>(endpoints.notifications.smsPreferences, { sms: smsPrefs });
  }

  // Push Notification Subscription

  // Subscribe to push notifications
  async subscribePush(subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
    userAgent?: string;
  }): Promise<ApiResponse<{ message: string; subscriptionId: string }>> {
    return this.client.post<{ message: string; subscriptionId: string }>(endpoints.notifications.subscribePush, subscription);
  }

  // Unsubscribe from push notifications
  async unsubscribePush(subscriptionId?: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.notifications.unsubscribePush, {
      params: subscriptionId ? { subscriptionId } : {},
    });
  }

  // Test push notification
  async testPushNotification(): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.notifications.testPush);
  }

  // Email Subscription Management

  // Subscribe to newsletter
  async subscribeNewsletter(email: string, preferences?: {
    categories?: string[];
    frequency?: string;
  }): Promise<ApiResponse<{ message: string; subscriptionId: string }>> {
    return this.client.post<{ message: string; subscriptionId: string }>(endpoints.notifications.subscribeNewsletter, {
      email,
      ...preferences,
    });
  }

  // Unsubscribe from newsletter
  async unsubscribeNewsletter(token?: string, email?: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.notifications.unsubscribeNewsletter, {
      token,
      email,
    });
  }

  // Update newsletter preferences
  async updateNewsletterPreferences(preferences: {
    categories?: string[];
    frequency?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return this.client.put<{ message: string }>(endpoints.notifications.newsletterPreferences, preferences);
  }

  // Get newsletter categories
  async getNewsletterCategories(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    isDefault: boolean;
  }>>> {
    return this.client.get<Array<{
      id: string;
      name: string;
      description: string;
      isDefault: boolean;
    }>>(endpoints.notifications.newsletterCategories);
  }

  // SMS Notifications

  // Verify phone number for SMS
  async verifyPhoneForSms(phone: string): Promise<ApiResponse<{ message: string; verificationId: string }>> {
    return this.client.post<{ message: string; verificationId: string }>(endpoints.notifications.verifyPhone, { phone });
  }

  // Confirm phone verification
  async confirmPhoneVerification(verificationId: string, code: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.notifications.confirmPhone, {
      verificationId,
      code,
    });
  }

  // Remove phone number
  async removePhone(): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.notifications.removePhone);
  }

  // Notification History

  // Get notification history
  async getNotificationHistory(params?: PaginationParams & {
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    status: 'sent' | 'delivered' | 'failed' | 'read';
    channel: 'email' | 'push' | 'sms' | 'in_app';
    sentAt: string;
    deliveredAt?: string;
    readAt?: string;
    failureReason?: string;
  }>>> {
    const queryParams = {
      ...buildPaginationParams(params || {}),
      ...(params?.type && { type: params.type }),
      ...(params?.dateFrom && { dateFrom: params.dateFrom }),
      ...(params?.dateTo && { dateTo: params.dateTo }),
    };
    
    return this.client.get<Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      status: 'sent' | 'delivered' | 'failed' | 'read';
      channel: 'email' | 'push' | 'sms' | 'in_app';
      sentAt: string;
      deliveredAt?: string;
      readAt?: string;
      failureReason?: string;
    }>>(endpoints.notifications.history, { params: queryParams });
  }

  // Analytics

  // Get notification analytics
  async getNotificationAnalytics(period?: string): Promise<ApiResponse<{
    totalSent: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
    byChannel: Record<string, {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
    }>;
    byType: Record<string, number>;
    trends: Array<{
      date: string;
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
    }>;
  }>> {
    const params = period ? { period } : {};
    return this.client.get<{
      totalSent: number;
      deliveryRate: number;
      openRate: number;
      clickRate: number;
      unsubscribeRate: number;
      byChannel: Record<string, {
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
      }>;
      byType: Record<string, number>;
      trends: Array<{
        date: string;
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
      }>;
    }>(endpoints.notifications.analytics, { params });
  }

  // Admin Operations

  // Send notification to user (Admin)
  async sendNotificationToUser(userId: string, notification: {
    type: string;
    title: string;
    message: string;
    priority?: string;
    data?: NotificationData;
    actionUrl?: string;
    actionText?: string;
    imageUrl?: string;
    channels?: string[];
    expiresAt?: string;
  }): Promise<ApiResponse<{ message: string; notificationId: string }>> {
    return this.client.post<{ message: string; notificationId: string }>(
      endpoints.notifications.admin.sendToUser(userId),
      notification
    );
  }

  // Send bulk notification (Admin)
  async sendBulkNotification(notification: {
    type: string;
    title: string;
    message: string;
    priority?: string;
    data?: NotificationData;
    actionUrl?: string;
    actionText?: string;
    imageUrl?: string;
    channels?: string[];
    expiresAt?: string;
    targetAudience: {
      segments?: string[];
      filters?: CampaignFilters;
      userIds?: string[];
    };
  }): Promise<ApiResponse<{ message: string; campaignId: string; targetCount: number }>> {
    return this.client.post<{ message: string; campaignId: string; targetCount: number }>(
      endpoints.notifications.admin.sendBulk,
      notification
    );
  }

  // Email Template Management (Admin)

  // Get email templates
  async getEmailTemplates(params?: SearchParams & PaginationParams): Promise<ApiResponse<EmailTemplate[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
    };
    
    return this.client.get<EmailTemplate[]>(endpoints.notifications.admin.templates, { params: queryParams });
  }

  // Get email template by ID
  async getEmailTemplate(templateId: string): Promise<ApiResponse<EmailTemplate>> {
    return this.client.get<EmailTemplate>(endpoints.notifications.admin.templateById(templateId));
  }

  // Create email template
  async createEmailTemplate(template: {
    name: string;
    subject: string;
    content: string;
    type: string;
    variables?: string[];
  }): Promise<ApiResponse<EmailTemplate>> {
    return this.client.post<EmailTemplate>(endpoints.notifications.admin.templates, template);
  }

  // Update email template
  async updateEmailTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<ApiResponse<EmailTemplate>> {
    return this.client.put<EmailTemplate>(endpoints.notifications.admin.templateById(templateId), updates);
  }

  // Delete email template
  async deleteEmailTemplate(templateId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.notifications.admin.templateById(templateId));
  }

  // Email Campaign Management (Admin)

  // Get email campaigns
  async getEmailCampaigns(params?: SearchParams & PaginationParams & {
    status?: string;
  }): Promise<ApiResponse<EmailCampaign[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.status && { status: params.status }),
    };
    
    return this.client.get<EmailCampaign[]>(endpoints.notifications.admin.campaigns, { params: queryParams });
  }

  // Get email campaign by ID
  async getEmailCampaign(campaignId: string): Promise<ApiResponse<EmailCampaign>> {
    return this.client.get<EmailCampaign>(endpoints.notifications.admin.campaignById(campaignId));
  }

  // Create email campaign
  async createEmailCampaign(campaign: {
    name: string;
    subject: string;
    templateId?: string;
    content?: string;
    targetAudience: {
      segments?: string[];
      filters?: CampaignFilters;
      excludeUnsubscribed?: boolean;
    };
    scheduledAt?: string;
  }): Promise<ApiResponse<EmailCampaign>> {
    return this.client.post<EmailCampaign>(endpoints.notifications.admin.campaigns, campaign);
  }

  // Update email campaign
  async updateEmailCampaign(campaignId: string, updates: Partial<EmailCampaign>): Promise<ApiResponse<EmailCampaign>> {
    return this.client.put<EmailCampaign>(endpoints.notifications.admin.campaignById(campaignId), updates);
  }

  // Send email campaign
  async sendEmailCampaign(campaignId: string): Promise<ApiResponse<{ message: string; targetCount: number }>> {
    return this.client.post<{ message: string; targetCount: number }>(
      endpoints.notifications.admin.sendCampaign(campaignId)
    );
  }

  // Pause email campaign
  async pauseEmailCampaign(campaignId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.notifications.admin.pauseCampaign(campaignId));
  }

  // Resume email campaign
  async resumeEmailCampaign(campaignId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.notifications.admin.resumeCampaign(campaignId));
  }

  // Cancel email campaign
  async cancelEmailCampaign(campaignId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.notifications.admin.cancelCampaign(campaignId));
  }

  // Delete email campaign
  async deleteEmailCampaign(campaignId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.notifications.admin.campaignById(campaignId));
  }

  // Get campaign statistics
  async getCampaignStatistics(campaignId: string): Promise<ApiResponse<{
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    unsubscribeRate: number;
    timeline: Array<{
      date: string;
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
    }>;
  }>> {
    return this.client.get<{
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      bounced: number;
      unsubscribed: number;
      deliveryRate: number;
      openRate: number;
      clickRate: number;
      bounceRate: number;
      unsubscribeRate: number;
      timeline: Array<{
        date: string;
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
      }>;
    }>(endpoints.notifications.admin.campaignStats(campaignId));
  }

  // System Notifications (Admin)

  // Get system notification settings
  async getSystemSettings(): Promise<ApiResponse<{
    emailSettings: {
      smtpHost: string;
      smtpPort: number;
      smtpSecure: boolean;
      fromName: string;
      fromEmail: string;
      replyToEmail: string;
    };
    pushSettings: {
      vapidPublicKey: string;
      fcmServerKey: string;
    };
    smsSettings: {
      provider: string;
      apiKey: string;
      sender: string;
    };
    defaultSettings: {
      retryAttempts: number;
      retryDelay: number;
      batchSize: number;
    };
  }>> {
    return this.client.get<{
      emailSettings: {
        smtpHost: string;
        smtpPort: number;
        smtpSecure: boolean;
        fromName: string;
        fromEmail: string;
        replyToEmail: string;
      };
      pushSettings: {
        vapidPublicKey: string;
        fcmServerKey: string;
      };
      smsSettings: {
        provider: string;
        apiKey: string;
        sender: string;
      };
      defaultSettings: {
        retryAttempts: number;
        retryDelay: number;
        batchSize: number;
      };
    }>(endpoints.notifications.admin.systemSettings);
  }

  // Update system notification settings
  async updateSystemSettings(settings: SystemSettings): Promise<ApiResponse<{ message: string }>> {
    return this.client.put<{ message: string }>(endpoints.notifications.admin.systemSettings, settings);
  }

  // Test notification system
  async testNotificationSystem(testType: 'email' | 'push' | 'sms', testData: {
    recipient: string;
    message?: string;
  }): Promise<ApiResponse<{ message: string; success: boolean }>> {
    return this.client.post<{ message: string; success: boolean }>(
      endpoints.notifications.admin.testSystem,
      { testType, ...testData }
    );
  }

  // Get notification queue status
  async getQueueStatus(): Promise<ApiResponse<{
    pending: number;
    processing: number;
    failed: number;
    completed: number;
    queues: Record<string, {
      active: number;
      waiting: number;
      failed: number;
      delayed: number;
    }>;
  }>> {
    return this.client.get<{
      pending: number;
      processing: number;
      failed: number;
      completed: number;
      queues: Record<string, {
        active: number;
        waiting: number;
        failed: number;
        delayed: number;
      }>;
    }>(endpoints.notifications.admin.queueStatus);
  }

  // Export notification data
  async exportNotificationData(params?: {
    format?: 'csv' | 'xlsx' | 'json';
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<Blob>> {
    return this.client.get<Blob>(endpoints.notifications.admin.export, {
      params: params || {},
      responseType: 'blob',
    });
  }
}

// Create service instance
const notificationApiService = new NotificationApiService();

// React Query Hooks

// User Notifications
export const useNotifications = (params?: PaginationParams & {
  type?: string;
  isRead?: boolean;
  priority?: string;
}) => {
  return useQuery({
    queryKey: ['notifications', 'list', params],
    queryFn: () => notificationApiService.getNotifications(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationApiService.getUnreadCount(),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: () => notificationApiService.getPreferences(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useNotificationHistory = (params?: PaginationParams & {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['notifications', 'history', params],
    queryFn: () => notificationApiService.getNotificationHistory(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useNotificationAnalytics = (period?: string) => {
  return useQuery({
    queryKey: ['notifications', 'analytics', period],
    queryFn: () => notificationApiService.getNotificationAnalytics(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useNewsletterCategories = () => {
  return useQuery({
    queryKey: ['notifications', 'newsletter-categories'],
    queryFn: () => notificationApiService.getNewsletterCategories(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// Admin Hooks
export const useEmailTemplates = (params?: SearchParams & PaginationParams) => {
  return useQuery({
    queryKey: ['notifications', 'admin', 'templates', params],
    queryFn: () => notificationApiService.getEmailTemplates(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEmailTemplate = (templateId: string) => {
  return useQuery({
    queryKey: ['notifications', 'admin', 'template', templateId],
    queryFn: () => notificationApiService.getEmailTemplate(templateId),
    enabled: !!templateId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useEmailCampaigns = (params?: SearchParams & PaginationParams & {
  status?: string;
}) => {
  return useQuery({
    queryKey: ['notifications', 'admin', 'campaigns', params],
    queryFn: () => notificationApiService.getEmailCampaigns(params),
    staleTime: 30 * 1000, // 30 seconds for campaigns
  });
};

export const useEmailCampaign = (campaignId: string) => {
  return useQuery({
    queryKey: ['notifications', 'admin', 'campaign', campaignId],
    queryFn: () => notificationApiService.getEmailCampaign(campaignId),
    enabled: !!campaignId,
    staleTime: 30 * 1000,
  });
};

export const useCampaignStatistics = (campaignId: string) => {
  return useQuery({
    queryKey: ['notifications', 'admin', 'campaign-stats', campaignId],
    queryFn: () => notificationApiService.getCampaignStatistics(campaignId),
    enabled: !!campaignId,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ['notifications', 'admin', 'system-settings'],
    queryFn: () => notificationApiService.getSystemSettings(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useQueueStatus = () => {
  return useQuery({
    queryKey: ['notifications', 'admin', 'queue-status'],
    queryFn: () => notificationApiService.getQueueStatus(),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

// Mutation Hooks

// User Actions
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => notificationApiService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationApiService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => notificationApiService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationApiService.clearAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (preferences: Partial<NotificationPreferences>) => 
      notificationApiService.updatePreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    },
  });
};

export const useUpdateEmailPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (emailPrefs: Partial<NotificationPreferences['email']>) => 
      notificationApiService.updateEmailPreferences(emailPrefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    },
  });
};

export const useUpdatePushPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pushPrefs: Partial<NotificationPreferences['push']>) => 
      notificationApiService.updatePushPreferences(pushPrefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    },
  });
};

export const useUpdateSmsPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (smsPrefs: Partial<NotificationPreferences['sms']>) => 
      notificationApiService.updateSmsPreferences(smsPrefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    },
  });
};

// Push Notifications
export const useSubscribePush = () => {
  return useMutation({
    mutationFn: (subscription: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
      userAgent?: string;
    }) => notificationApiService.subscribePush(subscription),
  });
};

export const useUnsubscribePush = () => {
  return useMutation({
    mutationFn: (subscriptionId?: string) => notificationApiService.unsubscribePush(subscriptionId),
  });
};

export const useTestPushNotification = () => {
  return useMutation({
    mutationFn: () => notificationApiService.testPushNotification(),
  });
};

// Newsletter
export const useSubscribeNewsletter = () => {
  return useMutation({
    mutationFn: ({ email, preferences }: {
      email: string;
      preferences?: {
        categories?: string[];
        frequency?: string;
      };
    }) => notificationApiService.subscribeNewsletter(email, preferences),
  });
};

export const useUnsubscribeNewsletter = () => {
  return useMutation({
    mutationFn: ({ token, email }: {
      token?: string;
      email?: string;
    }) => notificationApiService.unsubscribeNewsletter(token, email),
  });
};

export const useUpdateNewsletterPreferences = () => {
  return useMutation({
    mutationFn: (preferences: {
      categories?: string[];
      frequency?: string;
    }) => notificationApiService.updateNewsletterPreferences(preferences),
  });
};

// SMS
export const useVerifyPhoneForSms = () => {
  return useMutation({
    mutationFn: (phone: string) => notificationApiService.verifyPhoneForSms(phone),
  });
};

export const useConfirmPhoneVerification = () => {
  return useMutation({
    mutationFn: ({ verificationId, code }: {
      verificationId: string;
      code: string;
    }) => notificationApiService.confirmPhoneVerification(verificationId, code),
  });
};

export const useRemovePhone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationApiService.removePhone(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    },
  });
};

// Admin Mutations
export const useSendNotificationToUser = () => {
  return useMutation({
    mutationFn: ({ userId, notification }: {
      userId: string;
      notification: {
        type: string;
        title: string;
        message: string;
        priority?: string;
        data?: NotificationData;
        actionUrl?: string;
        actionText?: string;
        imageUrl?: string;
        channels?: string[];
        expiresAt?: string;
      };
    }) => notificationApiService.sendNotificationToUser(userId, notification),
  });
};

export const useSendBulkNotification = () => {
  return useMutation({
    mutationFn: (notification: {
      type: string;
      title: string;
      message: string;
      priority?: string;
      data?: NotificationData;
      actionUrl?: string;
      actionText?: string;
      imageUrl?: string;
      channels?: string[];
      expiresAt?: string;
      targetAudience: {
        segments?: string[];
        filters?: CampaignFilters;
        userIds?: string[];
      };
    }) => notificationApiService.sendBulkNotification(notification),
  });
};

// Email Template Management
export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (template: {
      name: string;
      subject: string;
      content: string;
      type: string;
      variables?: string[];
    }) => notificationApiService.createEmailTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'templates'] });
    },
  });
};

export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, updates }: {
      templateId: string;
      updates: Partial<EmailTemplate>;
    }) => notificationApiService.updateEmailTemplate(templateId, updates),
    onSuccess: (_, { templateId }) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'templates'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'template', templateId] });
    },
  });
};

export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (templateId: string) => notificationApiService.deleteEmailTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'templates'] });
    },
  });
};

// Email Campaign Management
export const useCreateEmailCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campaign: {
      name: string;
      subject: string;
      templateId?: string;
      content?: string;
      targetAudience: {
        segments?: string[];
        filters?: CampaignFilters;
        excludeUnsubscribed?: boolean;
      };
      scheduledAt?: string;
    }) => notificationApiService.createEmailCampaign(campaign),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'campaigns'] });
    },
  });
};

export const useUpdateEmailCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ campaignId, updates }: {
      campaignId: string;
      updates: Partial<EmailCampaign>;
    }) => notificationApiService.updateEmailCampaign(campaignId, updates),
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'campaign', campaignId] });
    },
  });
};

export const useSendEmailCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campaignId: string) => notificationApiService.sendEmailCampaign(campaignId),
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'campaigns'] });
    },
  });
};

export const usePauseEmailCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campaignId: string) => notificationApiService.pauseEmailCampaign(campaignId),
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'campaign', campaignId] });
    },
  });
};

export const useResumeEmailCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campaignId: string) => notificationApiService.resumeEmailCampaign(campaignId),
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'campaign', campaignId] });
    },
  });
};

export const useCancelEmailCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campaignId: string) => notificationApiService.cancelEmailCampaign(campaignId),
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'campaign', campaignId] });
    },
  });
};

export const useDeleteEmailCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campaignId: string) => notificationApiService.deleteEmailCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'campaigns'] });
    },
  });
};

// System Administration
export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: SystemSettings) => notificationApiService.updateSystemSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'admin', 'system-settings'] });
    },
  });
};

export const useTestNotificationSystem = () => {
  return useMutation({
    mutationFn: ({ testType, testData }: {
      testType: 'email' | 'push' | 'sms';
      testData: {
        recipient: string;
        message?: string;
      };
    }) => notificationApiService.testNotificationSystem(testType, testData),
  });
};

export const useExportNotificationData = () => {
  return useMutation({
    mutationFn: (params?: {
      format?: 'csv' | 'xlsx' | 'json';
      type?: string;
      dateFrom?: string;
      dateTo?: string;
    }) => notificationApiService.exportNotificationData(params),
  });
};

export default notificationApiService;
