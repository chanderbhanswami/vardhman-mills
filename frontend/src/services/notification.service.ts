/**
 * Notification Service
 * 
 * API service for managing push notifications
 * 
 * Features:
 * - Save/remove FCM tokens
 * - Subscribe/unsubscribe to topics
 * - Send test notifications
 * - Get notification history
 * - Mark notifications as read
 * - Get notification preferences
 */

import { apiClient } from '@/lib/api-client';

const BASE_URL = '/api/notifications';

// ============================================
// TYPES
// ============================================

export interface NotificationToken {
  token: string;
  deviceInfo?: {
    deviceId?: string;
    platform?: 'web' | 'android' | 'ios';
    userAgent?: string;
  };
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  priceDrops: boolean;
  backInStock: boolean;
  newsletter: boolean;
  cartReminders: boolean;
  reviewRequests: boolean;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
  imageUrl?: string;
}

export interface SendNotificationPayload {
  title: string;
  body: string;
  image?: string;
  data?: Record<string, string>;
  link?: string;
}

// ============================================
// TOKEN MANAGEMENT
// ============================================

/**
 * Save FCM token to backend
 */
export async function saveNotificationToken(
  token: string,
  deviceInfo?: NotificationToken['deviceInfo']
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(`${BASE_URL}/tokens`, {
      token,
      deviceInfo: deviceInfo || {
        platform: 'web',
        userAgent: navigator.userAgent,
      },
    });

    return response.data as { success: boolean; message: string };
  } catch (error) {
    console.error('Error saving notification token:', error);
    throw error;
  }
}

/**
 * Remove FCM token from backend
 */
export async function removeNotificationToken(
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`${BASE_URL}/tokens/${token}`);
    return response.data as { success: boolean; message: string };
  } catch (error) {
    console.error('Error removing notification token:', error);
    throw error;
  }
}

/**
 * Get all user tokens
 */
export async function getUserTokens(): Promise<NotificationToken[]> {
  try {
    const response = await apiClient.get<{ tokens: NotificationToken[] }>(`${BASE_URL}/tokens`);
    return (response.data as { tokens: NotificationToken[] }).tokens || [];
  } catch (error) {
    console.error('Error getting user tokens:', error);
    throw error;
  }
}

// ============================================
// TOPIC MANAGEMENT
// ============================================

/**
 * Subscribe to notification topic
 */
export async function subscribeTopic(
  token: string,
  topic: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(`${BASE_URL}/topics/subscribe`, {
      token,
      topic,
    });
    return response.data as { success: boolean; message: string };
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    throw error;
  }
}

/**
 * Unsubscribe from notification topic
 */
export async function unsubscribeTopic(
  token: string,
  topic: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(`${BASE_URL}/topics/unsubscribe`, {
      token,
      topic,
    });
    return response.data as { success: boolean; message: string };
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    throw error;
  }
}

/**
 * Get subscribed topics
 */
export async function getSubscribedTopics(): Promise<string[]> {
  try {
    const response = await apiClient.get<{ topics: string[] }>(`${BASE_URL}/topics`);
    return (response.data as { topics: string[] }).topics || [];
  } catch (error) {
    console.error('Error getting subscribed topics:', error);
    return [];
  }
}

// ============================================
// NOTIFICATION HISTORY
// ============================================

/**
 * Get notification history
 */
export async function getNotificationHistory(
  limit: number = 50,
  offset: number = 0
): Promise<{
  notifications: Notification[];
  total: number;
  unreadCount: number;
}> {
  try {
    const response = await apiClient.get<{
      notifications: Notification[];
      total: number;
      unreadCount: number;
    }>(`${BASE_URL}/history`, {
      params: { limit, offset },
    });
    return response.data as {
      notifications: Notification[];
      total: number;
      unreadCount: number;
    };
  } catch (error) {
    console.error('Error getting notification history:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<{ success: boolean }> {
  try {
    const response = await apiClient.patch<{ success: boolean }>(
      `${BASE_URL}/${notificationId}/read`
    );
    return response.data as { success: boolean };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<{ success: boolean; count: number }> {
  try {
    const response = await apiClient.patch<{ success: boolean; count: number }>(`${BASE_URL}/read-all`);
    return response.data as { success: boolean; count: number };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<{ success: boolean }> {
  try {
    const response = await apiClient.delete<{ success: boolean }>(`${BASE_URL}/${notificationId}`);
    return response.data as { success: boolean };
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(): Promise<{ success: boolean; count: number }> {
  try {
    const response = await apiClient.delete<{ success: boolean; count: number }>(`${BASE_URL}/all`);
    return response.data as { success: boolean; count: number };
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const response = await apiClient.get<{ count: number }>(`${BASE_URL}/unread-count`);
    return (response.data as { count: number }).count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

// ============================================
// PREFERENCES
// ============================================

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const response = await apiClient.get<{ preferences: NotificationPreferences }>(`${BASE_URL}/preferences`);
    return (response.data as { preferences: NotificationPreferences }).preferences;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    throw error;
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<{ success: boolean; preferences: NotificationPreferences }> {
  try {
    const response = await apiClient.put<{ success: boolean; preferences: NotificationPreferences }>(
      `${BASE_URL}/preferences`, 
      preferences
    );
    return response.data as { success: boolean; preferences: NotificationPreferences };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}

// ============================================
// SEND NOTIFICATIONS (Admin/Testing)
// ============================================

/**
 * Send test notification to current user
 */
export async function sendTestNotification(
  payload: SendNotificationPayload
): Promise<{ success: boolean; messageId: string }> {
  try {
    const response = await apiClient.post<{ success: boolean; messageId: string }>(`${BASE_URL}/test`, payload);
    return response.data as { success: boolean; messageId: string };
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
}

/**
 * Send notification to specific user (admin only)
 */
export async function sendNotificationToUser(
  userId: string,
  payload: SendNotificationPayload
): Promise<{ success: boolean; messageId: string }> {
  try {
    const response = await apiClient.post<{ success: boolean; messageId: string }>(
      `${BASE_URL}/send/${userId}`, 
      payload
    );
    return response.data as { success: boolean; messageId: string };
  } catch (error) {
    console.error('Error sending notification to user:', error);
    throw error;
  }
}

/**
 * Send notification to topic (admin only)
 */
export async function sendNotificationToTopic(
  topic: string,
  payload: SendNotificationPayload
): Promise<{ success: boolean; messageId: string }> {
  try {
    const response = await apiClient.post<{ success: boolean; messageId: string }>(
      `${BASE_URL}/send/topic/${topic}`, 
      payload
    );
    return response.data as { success: boolean; messageId: string };
  } catch (error) {
    console.error('Error sending notification to topic:', error);
    throw error;
  }
}

/**
 * Send bulk notifications (admin only)
 */
export async function sendBulkNotifications(
  userIds: string[],
  payload: SendNotificationPayload
): Promise<{
  success: boolean;
  successCount: number;
  failureCount: number;
}> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      successCount: number;
      failureCount: number;
    }>(`${BASE_URL}/send/bulk`, {
      userIds,
      ...payload,
    });
    return response.data as {
      success: boolean;
      successCount: number;
      failureCount: number;
    };
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Track notification click
 */
export async function trackNotificationClick(
  notificationId: string,
  action?: string
): Promise<void> {
  try {
    await apiClient.post(`${BASE_URL}/analytics/click`, {
      notificationId,
      action: action || 'default',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error tracking notification click:', error);
  }
}

/**
 * Track notification dismiss
 */
export async function trackNotificationDismiss(
  notificationId: string
): Promise<void> {
  try {
    await apiClient.post(`${BASE_URL}/analytics/dismiss`, {
      notificationId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error tracking notification dismiss:', error);
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(
  startDate?: string,
  endDate?: string
): Promise<{
  sent: number;
  delivered: number;
  clicked: number;
  dismissed: number;
}> {
  try {
    const response = await apiClient.get<{
      stats: {
        sent: number;
        delivered: number;
        clicked: number;
        dismissed: number;
      };
    }>(`${BASE_URL}/analytics/stats`, {
      params: { startDate, endDate },
    });
    return (response.data as {
      stats: {
        sent: number;
        delivered: number;
        clicked: number;
        dismissed: number;
      };
    }).stats;
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return { sent: 0, delivered: 0, clicked: 0, dismissed: 0 };
  }
}

// ============================================
// EXPORT
// ============================================

const notificationService = {
  saveNotificationToken,
  removeNotificationToken,
  getUserTokens,
  subscribeTopic,
  unsubscribeTopic,
  getSubscribedTopics,
  getNotificationHistory,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestNotification,
  sendNotificationToUser,
  sendNotificationToTopic,
  sendBulkNotifications,
  trackNotificationClick,
  trackNotificationDismiss,
  getNotificationStats,
};

export default notificationService;
