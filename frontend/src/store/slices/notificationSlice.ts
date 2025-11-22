import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // Duration in milliseconds, 0 for permanent
  timestamp: number;
  isRead: boolean;
  actions?: {
    label: string;
    action: string;
    payload?: Record<string, unknown>;
  }[];
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isEnabled: boolean;
  preferences: {
    showToasts: boolean;
    playSound: boolean;
    maxNotifications: number;
    defaultDuration: number;
  };
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isEnabled: true,
  preferences: {
    showToasts: true,
    playSound: false,
    maxNotifications: 50,
    defaultDuration: 5000,
  },
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'timestamp' | 'isRead'>>) => {
      const notification: Notification = {
        ...action.payload,
        timestamp: Date.now(),
        isRead: false,
        duration: action.payload.duration ?? state.preferences.defaultDuration,
      };

      // Add to beginning of array
      state.notifications.unshift(notification);
      state.unreadCount += 1;

      // Limit number of notifications
      if (state.notifications.length > state.preferences.maxNotifications) {
        const removed = state.notifications.splice(state.preferences.maxNotifications);
        // Decrease unread count for removed unread notifications
        const removedUnread = removed.filter(n => !n.isRead).length;
        state.unreadCount = Math.max(0, state.unreadCount - removedUnread);
      }
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    clearNotificationsByType: (state, action: PayloadAction<NotificationType>) => {
      const removedNotifications = state.notifications.filter(n => n.type === action.payload);
      const removedUnreadCount = removedNotifications.filter(n => !n.isRead).length;
      
      state.notifications = state.notifications.filter(n => n.type !== action.payload);
      state.unreadCount = Math.max(0, state.unreadCount - removedUnreadCount);
    },

    updateNotificationPreferences: (state, action: PayloadAction<Partial<NotificationState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

    setNotificationEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload;
    },

    // Batch operations
    addMultipleNotifications: (state, action: PayloadAction<Omit<Notification, 'timestamp' | 'isRead'>[]>) => {
      const notifications = action.payload.map(notif => ({
        ...notif,
        timestamp: Date.now(),
        isRead: false,
        duration: notif.duration ?? state.preferences.defaultDuration,
      }));

      state.notifications.unshift(...notifications);
      state.unreadCount += notifications.length;

      // Limit number of notifications
      if (state.notifications.length > state.preferences.maxNotifications) {
        const removed = state.notifications.splice(state.preferences.maxNotifications);
        const removedUnread = removed.filter(n => !n.isRead).length;
        state.unreadCount = Math.max(0, state.unreadCount - removedUnread);
      }
    },

    // Auto-dismiss expired notifications
    dismissExpiredNotifications: (state) => {
      const now = Date.now();
      const validNotifications = state.notifications.filter(notification => {
        if (notification.duration === 0) return true; // Permanent notifications
        return (now - notification.timestamp) < (notification.duration || 0);
      });

      const expiredNotifications = state.notifications.filter(notification => {
        if (notification.duration === 0) return false;
        return (now - notification.timestamp) >= (notification.duration || 0);
      });

      const expiredUnreadCount = expiredNotifications.filter(n => !n.isRead).length;
      
      state.notifications = validNotifications;
      state.unreadCount = Math.max(0, state.unreadCount - expiredUnreadCount);
    },
  },
});

export const {
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  clearNotificationsByType,
  updateNotificationPreferences,
  setNotificationEnabled,
  addMultipleNotifications,
  dismissExpiredNotifications,
} = notificationSlice.actions;

// Selectors
export const selectNotifications = (state: { notification: NotificationState }) => state.notification.notifications;
export const selectUnreadCount = (state: { notification: NotificationState }) => state.notification.unreadCount;
export const selectNotificationPreferences = (state: { notification: NotificationState }) => state.notification.preferences;
export const selectIsNotificationEnabled = (state: { notification: NotificationState }) => state.notification.isEnabled;

// Selector for notifications by type
export const selectNotificationsByType = (type: NotificationType) => 
  (state: { notification: NotificationState }) => 
    state.notification.notifications.filter(n => n.type === type);

// Selector for recent notifications
export const selectRecentNotifications = (minutes: number = 30) =>
  (state: { notification: NotificationState }) => {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return state.notification.notifications.filter(n => n.timestamp > cutoff);
  };

export default notificationSlice.reducer;

// Utility functions for creating notifications
export const createSuccessNotification = (title: string, message: string): Omit<Notification, 'timestamp' | 'isRead'> => ({
  id: `success-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type: 'success',
  title,
  message,
  duration: 4000,
});

export const createErrorNotification = (title: string, message: string): Omit<Notification, 'timestamp' | 'isRead'> => ({
  id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type: 'error',
  title,
  message,
  duration: 6000,
});

export const createWarningNotification = (title: string, message: string): Omit<Notification, 'timestamp' | 'isRead'> => ({
  id: `warning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type: 'warning',
  title,
  message,
  duration: 5000,
});

export const createInfoNotification = (title: string, message: string): Omit<Notification, 'timestamp' | 'isRead'> => ({
  id: `info-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type: 'info',
  title,
  message,
  duration: 4000,
});
