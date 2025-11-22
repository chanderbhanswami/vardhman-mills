/**
 * Notification System - Main Export Index
 * Comprehensive notification system with 10 feature-rich components
 */

// Core notification components
export { default as NotificationBell } from './NotificationCenter/NotificationBell';
export { default as NotificationCenter } from './NotificationCenter/NotificationCenter';
export { default as NotificationCount } from './NotificationCenter/NotificationCount';
export { default as NotificationDropdown } from './NotificationCenter/NotificationDropdown';

// Context and providers
export { default as NotificationProvider, useNotificationContext as useNotifications } from './NotificationCenter/NotificationProvider';
export { default as ToastProvider, useToast, withToast, createToastInstance } from './ToastNotifications/ToastProvider';

// Permission and push notifications
export { default as NotificationPermission } from './NotificationPermission';
export { default as PushNotificationManager } from './PushNotifications/PushNotificationManager';

// Toast system
export { default as Toast } from './ToastNotifications/Toast';
export { default as ToastContainer } from './ToastNotifications/ToastContainer';
export { useToast as useToastContainer } from './ToastNotifications/ToastContainer';

// Settings and configuration
export { default as NotificationSettings } from './NotificationSettings';

// Types exports from notification types
export type { 
  Notification,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  NotificationTemplate,
  NotificationFilter,
  NotificationPreferences,
  NotificationAnalytics,
  NotificationTracking,
  NotificationAttachment,
  NotificationAction,
  NotificationQueue
} from '@/types/notification.types';

// Toast types
export type {
  ToastProps,
  ToastType,
  ToastPosition,
  ToastAnimation,
  ToastStyle,
  ToastAction
} from './ToastNotifications/Toast';

// Container types
export type {
  ToastContainerProps,
  ToastGroup,
  ToastContainerState
} from './ToastNotifications/ToastContainer';

// Provider types
export type {
  ToastContextValue,
  ToastStats,
  ToastProviderProps
} from './ToastNotifications/ToastProvider';

// Permission types
export type {
  NotificationPermissionProps
} from './NotificationPermission';

// Push notification types
export type {
  PushSubscription,
  VapidKeys
} from './PushNotifications/PushNotificationManager';

// Utility functions and helpers
export {
  createSuccessToast,
  createErrorToast,
  createWarningToast,
  createInfoToast,
  createLoadingToast
} from './ToastNotifications/Toast';

// Constants
export const NOTIFICATION_TYPES = ['success', 'error', 'warning', 'info', 'loading'] as const;
export const TOAST_POSITIONS = [
  'top-left', 
  'top-center', 
  'top-right', 
  'bottom-left', 
  'bottom-center', 
  'bottom-right', 
  'center'
] as const;
export const TOAST_ANIMATIONS = ['slide', 'fade', 'scale', 'bounce', 'flip', 'swing'] as const;
export const TOAST_STYLES = ['filled', 'outlined', 'minimal', 'glass', 'gradient'] as const;
export const NOTIFICATION_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;

// Default configurations
export const DEFAULT_NOTIFICATION_SETTINGS = {
  position: 'top-right' as const,
  animation: 'slide' as const,
  style: 'filled' as const,
  duration: 5000,
  maxToasts: 5,
  enableQueue: true,
  enableStacking: true,
  enableDuplicateDetection: true,
  pauseOnHover: true,
  enableA11y: true
};

// Version information
export const NOTIFICATION_SYSTEM_VERSION = '1.0.0';
export const NOTIFICATION_SYSTEM_BUILD = new Date().toISOString();

/**
 * Notification System Summary:
 * 
 * This comprehensive notification system includes 10 feature-rich components:
 * 
 * 1. NotificationBell - Interactive bell icon with count indicator
 * 2. NotificationCenter - Main notification management interface
 * 3. NotificationCount - Standalone count display component
 * 4. NotificationDropdown - Advanced dropdown with filtering and actions
 * 5. NotificationProvider - Global context provider with state management
 * 6. NotificationPermission - Permission management with browser guides
 * 7. PushNotificationManager - Service worker and push notification handling
 * 8. Toast - Individual toast notification component with animations
 * 9. ToastContainer - Container for managing multiple toasts with queuing
 * 10. ToastProvider - Toast context provider with utility methods
 * 11. NotificationSettings - Comprehensive settings panel
 * 
 * Features:
 * - Real-time WebSocket integration
 * - Push notification support with service workers
 * - Advanced toast system with animations and positioning
 * - Comprehensive settings and preferences management
 * - Analytics and tracking capabilities
 * - Accessibility support (WCAG compliance)
 * - Keyboard navigation and screen reader support
 * - Multi-theme support (light/dark/auto)
 * - Export/import configuration
 * - Batch operations and queuing
 * - Sound and vibration support
 * - Advanced filtering and sorting
 * - Template system for reusable notifications
 * - Comprehensive logging and debugging
 * - TypeScript support with full type safety
 */