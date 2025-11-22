/**
 * Notification Model - Comprehensive notification system for real-time updates
 * Frontend-optimized with full TypeScript support and validation
 */

import { ObjectId } from 'mongodb';
import { z } from 'zod';

/**
 * Notification Channel Schema
 */
export const NotificationChannelSchema = z.enum([
  'in_app',       // In-app notifications
  'email',        // Email notifications
  'sms',          // SMS notifications
  'push',         // Browser/mobile push notifications
  'webhook',      // Webhook notifications
  'slack',        // Slack notifications
  'discord',      // Discord notifications
  'telegram',     // Telegram notifications
]);

export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

/**
 * Notification Priority Schema
 */
export const NotificationPrioritySchema = z.enum([
  'low',          // Low priority - can be batched
  'normal',       // Normal priority - send when convenient
  'high',         // High priority - send immediately
  'urgent',       // Urgent - send immediately with alerts
  'critical',     // Critical - send immediately with all available channels
]);

export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

/**
 * Notification Type Schema
 */
export const NotificationTypeSchema = z.enum([
  // User-related notifications
  'user_welcome',
  'user_verification',
  'user_password_reset',
  'user_profile_updated',
  'user_account_deactivated',
  'user_login_suspicious',
  
  // Order-related notifications
  'order_created',
  'order_confirmed',
  'order_shipped',
  'order_delivered',
  'order_cancelled',
  'order_refunded',
  'order_payment_failed',
  
  // Product-related notifications
  'product_back_in_stock',
  'product_price_drop',
  'product_new_review',
  'product_low_stock',
  'product_discontinued',
  
  // Cart-related notifications
  'cart_abandoned',
  'cart_saved_item_sale',
  'cart_reminder',
  
  // Wishlist-related notifications
  'wishlist_item_sale',
  'wishlist_item_back_in_stock',
  'wishlist_item_price_drop',
  
  // Review-related notifications
  'review_approved',
  'review_rejected',
  'review_helpful',
  'review_response',
  
  // Newsletter-related notifications
  'newsletter_confirmation',
  'newsletter_unsubscribed',
  'newsletter_campaign_sent',
  
  // Blog-related notifications
  'blog_post_published',
  'blog_comment_posted',
  'blog_comment_reply',
  'blog_post_liked',
  
  // System notifications
  'system_maintenance',
  'system_update',
  'system_security_alert',
  'system_backup_completed',
  
  // Marketing notifications
  'promotion_started',
  'coupon_expiring',
  'loyalty_points_earned',
  'referral_bonus',
  
  // Administrative notifications
  'admin_new_order',
  'admin_low_inventory',
  'admin_user_registered',
  'admin_review_pending',
  'admin_system_error',
  
  // Custom notifications
  'custom',
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

/**
 * Notification Template Variables Schema
 */
export const NotificationVariablesSchema = z.record(z.string(), z.unknown()).default({});

export type NotificationVariables = z.infer<typeof NotificationVariablesSchema>;

/**
 * Notification Action Schema
 */
export const NotificationActionSchema = z.object({
  id: z.string(),
  label: z.string().max(50, 'Action label too long'),
  url: z.string().url('Invalid action URL').optional(),
  action: z.string().optional(), // Custom action type
  style: z.enum(['primary', 'secondary', 'success', 'warning', 'danger', 'info']).default('primary'),
  icon: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type NotificationAction = z.infer<typeof NotificationActionSchema>;

/**
 * Notification Delivery Schema
 */
export const NotificationDeliverySchema = z.object({
  channel: NotificationChannelSchema,
  status: z.enum(['pending', 'sending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked']).default('pending'),
  sentAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  openedAt: z.date().optional(),
  clickedAt: z.date().optional(),
  failedAt: z.date().optional(),
  error: z.string().optional(),
  retryCount: z.number().nonnegative().default(0),
  maxRetries: z.number().nonnegative().default(3),
  nextRetryAt: z.date().optional(),
  deliveryId: z.string().optional(), // External delivery service ID
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type NotificationDelivery = z.infer<typeof NotificationDeliverySchema>;

/**
 * Notification Schedule Schema
 */
export const NotificationScheduleSchema = z.object({
  scheduledFor: z.date(),
  timezone: z.string().default('UTC'),
  recurring: z.boolean().default(false),
  recurringPattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurringInterval: z.number().positive().optional(), // Every N days/weeks/months/years
  recurringEndDate: z.date().optional(),
  recurringCount: z.number().positive().optional(), // Number of occurrences
  status: z.enum(['scheduled', 'cancelled', 'completed']).default('scheduled'),
  processedAt: z.date().optional(),
});

export type NotificationSchedule = z.infer<typeof NotificationScheduleSchema>;

/**
 * Notification Analytics Schema
 */
export const NotificationAnalyticsSchema = z.object({
  totalSent: z.number().nonnegative().default(0),
  totalDelivered: z.number().nonnegative().default(0),
  totalOpened: z.number().nonnegative().default(0),
  totalClicked: z.number().nonnegative().default(0),
  totalFailed: z.number().nonnegative().default(0),
  deliveryRate: z.number().min(0).max(1).default(0),
  openRate: z.number().min(0).max(1).default(0),
  clickRate: z.number().min(0).max(1).default(0),
  failureRate: z.number().min(0).max(1).default(0),
  averageDeliveryTime: z.number().nonnegative().optional(), // in seconds
  averageOpenTime: z.number().nonnegative().optional(), // in seconds
  channelBreakdown: z.record(z.string(), z.number()).default({}),
  deviceBreakdown: z.object({
    desktop: z.number().default(0),
    mobile: z.number().default(0),
    tablet: z.number().default(0),
  }).default({
    desktop: 0,
    mobile: 0,
    tablet: 0,
  }),
  locationBreakdown: z.record(z.string(), z.number()).default({}),
  lastUpdated: z.date().optional(),
});

export type NotificationAnalytics = z.infer<typeof NotificationAnalyticsSchema>;

/**
 * Main Notification Schema
 */
export const NotificationSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  
  // Recipient information
  userId: z.string(), // Target user ID
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  deviceTokens: z.array(z.string()).default([]), // Push notification tokens
  
  // Notification content
  type: NotificationTypeSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  shortMessage: z.string().max(160, 'Short message too long').optional(), // For SMS
  richContent: z.string().optional(), // HTML content for rich notifications
  
  // Template and variables
  templateId: z.string().optional(),
  variables: NotificationVariablesSchema,
  
  // Visual and interaction
  icon: z.string().optional(),
  image: z.string().url('Invalid image URL').optional(),
  color: z.string().optional(), // Hex color code
  sound: z.string().optional(),
  badge: z.number().nonnegative().optional(),
  
  // Actions and links
  actions: z.array(NotificationActionSchema).default([]),
  clickUrl: z.string().url('Invalid click URL').optional(),
  deepLink: z.string().optional(), // Mobile deep link
  
  // Targeting and channels
  channels: z.array(NotificationChannelSchema).default(['in_app']),
  priority: NotificationPrioritySchema.default('normal'),
  category: z.string().optional(), // Notification category for grouping
  tags: z.array(z.string()).default([]),
  
  // Delivery management
  deliveries: z.array(NotificationDeliverySchema).default([]),
  schedule: NotificationScheduleSchema.optional(),
  
  // Status and tracking
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'delivered', 'failed', 'cancelled']).default('draft'),
  readAt: z.date().optional(),
  isRead: z.boolean().default(false),
  clickedAt: z.date().optional(),
  isClicked: z.boolean().default(false),
  dismissedAt: z.date().optional(),
  isDismissed: z.boolean().default(false),
  
  // Expiration and persistence
  expiresAt: z.date().optional(),
  persistAfterRead: z.boolean().default(true),
  autoDelete: z.boolean().default(false),
  deleteAfterDays: z.number().positive().optional(),
  
  // Analytics and tracking
  analytics: NotificationAnalyticsSchema.default({
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalFailed: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    failureRate: 0,
    channelBreakdown: {},
    deviceBreakdown: {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    },
    locationBreakdown: {},
  }),
  
  // Context and metadata
  context: z.object({
    orderId: z.string().optional(),
    productId: z.string().optional(),
    reviewId: z.string().optional(),
    blogId: z.string().optional(),
    campaignId: z.string().optional(),
    eventId: z.string().optional(),
    source: z.string().optional(), // Source that triggered the notification
  }).optional(),
  
  metadata: z.record(z.string(), z.unknown()).default({}),
  
  // User preferences override
  respectUserPreferences: z.boolean().default(true),
  forceDelivery: z.boolean().default(false), // Override user preferences for critical notifications
  
  // Grouping and threading
  groupId: z.string().optional(), // Group related notifications
  threadId: z.string().optional(), // Thread notifications together
  parentId: z.string().optional(), // Parent notification ID
  
  // A/B testing
  abTestId: z.string().optional(),
  abTestVariant: z.string().optional(),
  
  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  sentAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  deletedAt: z.date().optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;

/**
 * Create Notification Schema
 */
export const CreateNotificationSchema = NotificationSchema.omit({
  _id: true,
  analytics: true,
  deliveries: true,
  isRead: true,
  isClicked: true,
  isDismissed: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;

/**
 * Update Notification Schema
 */
export const UpdateNotificationSchema = NotificationSchema.partial().omit({
  _id: true,
  userId: true,
  createdAt: true,
});

export type UpdateNotificationInput = z.infer<typeof UpdateNotificationSchema>;

/**
 * Notification Filter Schema
 */
export const NotificationFilterSchema = z.object({
  userId: z.string().optional(),
  type: NotificationTypeSchema.optional(),
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'delivered', 'failed', 'cancelled']).optional(),
  priority: NotificationPrioritySchema.optional(),
  channels: z.array(NotificationChannelSchema).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isRead: z.boolean().optional(),
  isClicked: z.boolean().optional(),
  isDismissed: z.boolean().optional(),
  groupId: z.string().optional(),
  threadId: z.string().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  expiresAfter: z.date().optional(),
  expiresBefore: z.date().optional(),
  search: z.string().optional(),
  includeExpired: z.boolean().default(false),
  includeDeleted: z.boolean().default(false),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(1000).default(50),
  sortBy: z.enum(['created_at', 'updated_at', 'sent_at', 'priority', 'read_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeAnalytics: z.boolean().default(false),
  includeDeliveries: z.boolean().default(false),
});

export type NotificationFilter = z.infer<typeof NotificationFilterSchema>;

/**
 * Notification Template Schema
 */
export const NotificationTemplateSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string().min(1, 'Template name is required').max(100, 'Template name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  type: NotificationTypeSchema,
  channels: z.array(NotificationChannelSchema).default(['in_app']),
  priority: NotificationPrioritySchema.default('normal'),
  
  // Template content
  titleTemplate: z.string().min(1, 'Title template is required').max(200, 'Title template too long'),
  messageTemplate: z.string().min(1, 'Message template is required').max(1000, 'Message template too long'),
  shortMessageTemplate: z.string().max(160, 'Short message template too long').optional(),
  richContentTemplate: z.string().optional(),
  
  // Visual templates
  iconTemplate: z.string().optional(),
  imageTemplate: z.string().optional(),
  colorTemplate: z.string().optional(),
  
  // Action templates
  actionTemplates: z.array(z.object({
    id: z.string(),
    labelTemplate: z.string(),
    urlTemplate: z.string().optional(),
    actionTemplate: z.string().optional(),
    style: z.enum(['primary', 'secondary', 'success', 'warning', 'danger', 'info']).default('primary'),
  })).default([]),
  
  // Template variables
  requiredVariables: z.array(z.string()).default([]),
  optionalVariables: z.array(z.string()).default([]),
  defaultVariables: z.record(z.string(), z.unknown()).default({}),
  
  // Settings
  isActive: z.boolean().default(true),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  
  // Metadata
  version: z.number().positive().default(1),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type NotificationTemplate = z.infer<typeof NotificationTemplateSchema>;

/**
 * Notification Preferences Schema
 */
export const NotificationPreferencesSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.string(),
  
  // Global preferences
  globalEnabled: z.boolean().default(true),
  doNotDisturbEnabled: z.boolean().default(false),
  doNotDisturbStart: z.string().optional(), // Time in HH:MM format
  doNotDisturbEnd: z.string().optional(),
  timezone: z.string().default('UTC'),
  
  // Channel preferences
  channelPreferences: z.record(z.string(), z.object({
    enabled: z.boolean().default(true),
    quietHours: z.object({
      enabled: z.boolean().default(false),
      start: z.string().optional(), // HH:MM
      end: z.string().optional(), // HH:MM
    }).optional(),
    frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly', 'never']).default('immediate'),
    maxPerDay: z.number().positive().optional(),
  })).default({}),
  
  // Type preferences
  typePreferences: z.record(z.string(), z.object({
    enabled: z.boolean().default(true),
    channels: z.array(NotificationChannelSchema).default(['in_app']),
    priority: NotificationPrioritySchema.optional(),
  })).default({}),
  
  // Category preferences
  categoryPreferences: z.record(z.string(), z.object({
    enabled: z.boolean().default(true),
    channels: z.array(NotificationChannelSchema).default(['in_app']),
  })).default({}),
  
  // Language and localization
  language: z.string().default('en'),
  
  // Device preferences
  devicePreferences: z.object({
    desktop: z.object({
      enabled: z.boolean().default(true),
      showPreview: z.boolean().default(true),
      sound: z.boolean().default(true),
    }).default({
      enabled: true,
      showPreview: true,
      sound: true,
    }),
    mobile: z.object({
      enabled: z.boolean().default(true),
      showPreview: z.boolean().default(true),
      sound: z.boolean().default(true),
      vibration: z.boolean().default(true),
      badge: z.boolean().default(true),
    }).default({
      enabled: true,
      showPreview: true,
      sound: true,
      vibration: true,
      badge: true,
    }),
  }).default({
    desktop: {
      enabled: true,
      showPreview: true,
      sound: true,
    },
    mobile: {
      enabled: true,
      showPreview: true,
      sound: true,
      vibration: true,
      badge: true,
    },
  }),
  
  // Email preferences
  emailPreferences: z.object({
    frequency: z.enum(['immediate', 'hourly', 'daily']).default('immediate'),
    digest: z.boolean().default(false),
    unsubscribeAll: z.boolean().default(false),
  }).default({
    frequency: 'immediate',
    digest: false,
    unsubscribeAll: false,
  }),
  
  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

/**
 * Validation functions
 */
export const validateNotification = (data: unknown): Notification => {
  return NotificationSchema.parse(data);
};

export const validateCreateNotification = (data: unknown): CreateNotificationInput => {
  return CreateNotificationSchema.parse(data);
};

export const validateUpdateNotification = (data: unknown): UpdateNotificationInput => {
  return UpdateNotificationSchema.parse(data);
};

export const validateNotificationFilter = (data: unknown): NotificationFilter => {
  return NotificationFilterSchema.parse(data);
};

export const validateNotificationTemplate = (data: unknown): NotificationTemplate => {
  return NotificationTemplateSchema.parse(data);
};

export const validateNotificationPreferences = (data: unknown): NotificationPreferences => {
  return NotificationPreferencesSchema.parse(data);
};

/**
 * Notification utility functions
 */
export const notificationUtils = {
  /**
   * Create notification from template
   */
  createFromTemplate: (
    template: NotificationTemplate,
    variables: NotificationVariables,
    recipientData: {
      userId: string;
      email?: string;
      phone?: string;
    }
  ): CreateNotificationInput => {
    // Replace template variables
    const replaceVariables = (text: string): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
        return String(variables[variable] || match);
      });
    };
    
    const notification: CreateNotificationInput = {
      userId: recipientData.userId,
      email: recipientData.email,
      phone: recipientData.phone,
      type: template.type,
      title: replaceVariables(template.titleTemplate),
      message: replaceVariables(template.messageTemplate),
      shortMessage: template.shortMessageTemplate ? replaceVariables(template.shortMessageTemplate) : undefined,
      richContent: template.richContentTemplate ? replaceVariables(template.richContentTemplate) : undefined,
      channels: template.channels,
      priority: template.priority,
      status: 'draft' as const,
      variables,
      templateId: template._id?.toString(),
      category: template.category,
      tags: template.tags,
      icon: template.iconTemplate ? replaceVariables(template.iconTemplate) : undefined,
      image: template.imageTemplate ? replaceVariables(template.imageTemplate) : undefined,
      color: template.colorTemplate ? replaceVariables(template.colorTemplate) : undefined,
      actions: template.actionTemplates.map(actionTemplate => ({
        id: actionTemplate.id,
        label: replaceVariables(actionTemplate.labelTemplate),
        url: actionTemplate.urlTemplate ? replaceVariables(actionTemplate.urlTemplate) : undefined,
        action: actionTemplate.actionTemplate ? replaceVariables(actionTemplate.actionTemplate) : undefined,
        style: actionTemplate.style,
        metadata: {},
      })),
      deviceTokens: [],
      metadata: {},
      persistAfterRead: true,
      autoDelete: false,
      respectUserPreferences: true,
      forceDelivery: false,
    };
    
    return notification;
  },

  /**
   * Check if notification should be sent based on user preferences
   */
  shouldSendNotification: (
    notification: Notification,
    preferences: NotificationPreferences
  ): { shouldSend: boolean; allowedChannels: NotificationChannel[]; reason?: string } => {
    // Check global settings
    if (!preferences.globalEnabled) {
      return { shouldSend: false, allowedChannels: [], reason: 'Global notifications disabled' };
    }
    
    // Check force delivery for critical notifications
    if (notification.forceDelivery) {
      return { shouldSend: true, allowedChannels: notification.channels };
    }
    
    // Check type preferences
    const typePreference = preferences.typePreferences[notification.type];
    if (typePreference && !typePreference.enabled) {
      return { shouldSend: false, allowedChannels: [], reason: 'Notification type disabled' };
    }
    
    // Check category preferences
    if (notification.category) {
      const categoryPreference = preferences.categoryPreferences[notification.category];
      if (categoryPreference && !categoryPreference.enabled) {
        return { shouldSend: false, allowedChannels: [], reason: 'Notification category disabled' };
      }
    }
    
    // Check do not disturb
    if (preferences.doNotDisturbEnabled && preferences.doNotDisturbStart && preferences.doNotDisturbEnd) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime >= preferences.doNotDisturbStart && currentTime <= preferences.doNotDisturbEnd) {
        // Allow high priority notifications during DND
        if (notification.priority !== 'high' && notification.priority !== 'urgent' && notification.priority !== 'critical') {
          return { shouldSend: false, allowedChannels: [], reason: 'Do not disturb active' };
        }
      }
    }
    
    // Filter allowed channels based on preferences
    const allowedChannels = notification.channels.filter(channel => {
      const channelPreference = preferences.channelPreferences[channel];
      if (channelPreference && !channelPreference.enabled) {
        return false;
      }
      
      // Check quiet hours for the channel
      if (channelPreference?.quietHours?.enabled && channelPreference.quietHours.start && channelPreference.quietHours.end) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        if (currentTime >= channelPreference.quietHours.start && currentTime <= channelPreference.quietHours.end) {
          return notification.priority === 'urgent' || notification.priority === 'critical';
        }
      }
      
      return true;
    });
    
    if (typePreference?.channels && typePreference.channels.length > 0) {
      // Filter by type-specific channel preferences
      const filteredChannels = allowedChannels.filter(channel => 
        typePreference.channels.includes(channel)
      );
      return { 
        shouldSend: filteredChannels.length > 0, 
        allowedChannels: filteredChannels,
        reason: filteredChannels.length === 0 ? 'No allowed channels for this type' : undefined
      };
    }
    
    return { 
      shouldSend: allowedChannels.length > 0, 
      allowedChannels,
      reason: allowedChannels.length === 0 ? 'No allowed channels' : undefined
    };
  },

  /**
   * Mark notification as read
   */
  markAsRead: (notification: Notification): Notification => {
    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      notification.updatedAt = new Date();
      
      // Update analytics
      notification.analytics.totalOpened++;
      if (notification.analytics.totalSent > 0) {
        notification.analytics.openRate = notification.analytics.totalOpened / notification.analytics.totalSent;
      }
      notification.analytics.lastUpdated = new Date();
    }
    
    return notification;
  },

  /**
   * Mark notification as clicked
   */
  markAsClicked: (notification: Notification): Notification => {
    if (!notification.isClicked) {
      notification.isClicked = true;
      notification.clickedAt = new Date();
      notification.updatedAt = new Date();
      
      // Also mark as read if not already
      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
        notification.analytics.totalOpened++;
      }
      
      // Update analytics
      notification.analytics.totalClicked++;
      if (notification.analytics.totalSent > 0) {
        notification.analytics.clickRate = notification.analytics.totalClicked / notification.analytics.totalSent;
        notification.analytics.openRate = notification.analytics.totalOpened / notification.analytics.totalSent;
      }
      notification.analytics.lastUpdated = new Date();
    }
    
    return notification;
  },

  /**
   * Mark notification as dismissed
   */
  markAsDismissed: (notification: Notification): Notification => {
    if (!notification.isDismissed) {
      notification.isDismissed = true;
      notification.dismissedAt = new Date();
      notification.updatedAt = new Date();
    }
    
    return notification;
  },

  /**
   * Update delivery status
   */
  updateDeliveryStatus: (
    notification: Notification,
    channel: NotificationChannel,
    status: NotificationDelivery['status'],
    metadata?: Record<string, unknown>
  ): Notification => {
    const delivery = notification.deliveries.find(d => d.channel === channel);
    
    if (delivery) {
      delivery.status = status;
      delivery.metadata = { ...delivery.metadata, ...metadata };
      
      switch (status) {
        case 'sent':
          delivery.sentAt = new Date();
          notification.analytics.totalSent++;
          break;
        case 'delivered':
          delivery.deliveredAt = new Date();
          notification.analytics.totalDelivered++;
          if (!notification.deliveredAt) {
            notification.deliveredAt = new Date();
          }
          break;
        case 'opened':
          delivery.openedAt = new Date();
          break;
        case 'clicked':
          delivery.clickedAt = new Date();
          break;
        case 'failed':
          delivery.failedAt = new Date();
          delivery.retryCount++;
          notification.analytics.totalFailed++;
          break;
      }
      
      // Update overall notification status
      const allDeliveries = notification.deliveries;
      const sentCount = allDeliveries.filter(d => ['sent', 'delivered', 'opened', 'clicked'].includes(d.status)).length;
      const failedCount = allDeliveries.filter(d => d.status === 'failed').length;
      
      if (sentCount > 0 && sentCount + failedCount === allDeliveries.length) {
        notification.status = 'sent';
        if (!notification.sentAt) {
          notification.sentAt = new Date();
        }
      }
      
      if (allDeliveries.some(d => d.status === 'delivered')) {
        notification.status = 'delivered';
      }
      
      // Update analytics rates
      if (notification.analytics.totalSent > 0) {
        notification.analytics.deliveryRate = notification.analytics.totalDelivered / notification.analytics.totalSent;
        notification.analytics.failureRate = notification.analytics.totalFailed / notification.analytics.totalSent;
      }
      
      notification.analytics.lastUpdated = new Date();
      notification.updatedAt = new Date();
    }
    
    return notification;
  },

  /**
   * Filter notifications
   */
  filterNotifications: (notifications: Notification[], filter: Partial<NotificationFilter>): Notification[] => {
    const now = new Date();
    
    return notifications.filter(notification => {
      // Check if expired and should be excluded
      if (!filter.includeExpired && notification.expiresAt && notification.expiresAt < now) {
        return false;
      }
      
      // Check if deleted and should be excluded
      if (!filter.includeDeleted && notification.deletedAt) {
        return false;
      }
      
      if (filter.userId && notification.userId !== filter.userId) return false;
      if (filter.type && notification.type !== filter.type) return false;
      if (filter.status && notification.status !== filter.status) return false;
      if (filter.priority && notification.priority !== filter.priority) return false;
      if (filter.category && notification.category !== filter.category) return false;
      if (filter.isRead !== undefined && notification.isRead !== filter.isRead) return false;
      if (filter.isClicked !== undefined && notification.isClicked !== filter.isClicked) return false;
      if (filter.isDismissed !== undefined && notification.isDismissed !== filter.isDismissed) return false;
      if (filter.groupId && notification.groupId !== filter.groupId) return false;
      if (filter.threadId && notification.threadId !== filter.threadId) return false;
      
      if (filter.channels && filter.channels.length > 0) {
        const hasChannel = filter.channels.some(channel => notification.channels.includes(channel));
        if (!hasChannel) return false;
      }
      
      if (filter.tags && filter.tags.length > 0) {
        const hasTag = filter.tags.some(tag => notification.tags.includes(tag));
        if (!hasTag) return false;
      }
      
      if (filter.createdAfter && notification.createdAt < filter.createdAfter) return false;
      if (filter.createdBefore && notification.createdAt > filter.createdBefore) return false;
      if (filter.expiresAfter && (!notification.expiresAt || notification.expiresAt < filter.expiresAfter)) return false;
      if (filter.expiresBefore && (!notification.expiresAt || notification.expiresAt > filter.expiresBefore)) return false;
      
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        const searchableText = [
          notification.title,
          notification.message,
          notification.type,
          notification.category || '',
          ...notification.tags,
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      return true;
    });
  },

  /**
   * Sort notifications
   */
  sortNotifications: (notifications: Notification[], sortBy: NotificationFilter['sortBy'], sortOrder: NotificationFilter['sortOrder']): Notification[] => {
    return [...notifications].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'created_at':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updated_at':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'sent_at':
          const sentA = a.sentAt?.getTime() || 0;
          const sentB = b.sentAt?.getTime() || 0;
          comparison = sentA - sentB;
          break;
        case 'priority':
          const priorityOrder = { low: 1, normal: 2, high: 3, urgent: 4, critical: 5 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'read_at':
          const readA = a.readAt?.getTime() || 0;
          const readB = b.readAt?.getTime() || 0;
          comparison = readA - readB;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  },

  /**
   * Group notifications
   */
  groupNotifications: (notifications: Notification[], groupBy: 'type' | 'category' | 'date' | 'thread' | 'group'): Record<string, Notification[]> => {
    const groups: Record<string, Notification[]> = {};
    
    notifications.forEach(notification => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'type':
          groupKey = notification.type;
          break;
        case 'category':
          groupKey = notification.category || 'uncategorized';
          break;
        case 'date':
          groupKey = notification.createdAt.toDateString();
          break;
        case 'thread':
          groupKey = notification.threadId || 'unthreaded';
          break;
        case 'group':
          groupKey = notification.groupId || 'ungrouped';
          break;
        default:
          groupKey = 'all';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });
    
    return groups;
  },

  /**
   * Get notification summary
   */
  getNotificationSummary: (notifications: Notification[]) => {
    const now = new Date();
    const activeNotifications = notifications.filter(n => !n.expiresAt || n.expiresAt > now);
    
    return {
      total: notifications.length,
      active: activeNotifications.length,
      unread: activeNotifications.filter(n => !n.isRead).length,
      read: activeNotifications.filter(n => n.isRead).length,
      clicked: activeNotifications.filter(n => n.isClicked).length,
      dismissed: activeNotifications.filter(n => n.isDismissed).length,
      expired: notifications.filter(n => n.expiresAt && n.expiresAt <= now).length,
      byType: notificationUtils.groupNotifications(activeNotifications, 'type'),
      byPriority: {
        low: activeNotifications.filter(n => n.priority === 'low').length,
        normal: activeNotifications.filter(n => n.priority === 'normal').length,
        high: activeNotifications.filter(n => n.priority === 'high').length,
        urgent: activeNotifications.filter(n => n.priority === 'urgent').length,
        critical: activeNotifications.filter(n => n.priority === 'critical').length,
      },
      recentActivity: {
        lastHour: activeNotifications.filter(n => 
          n.createdAt > new Date(now.getTime() - 60 * 60 * 1000)
        ).length,
        today: activeNotifications.filter(n => 
          n.createdAt > new Date(now.getFullYear(), now.getMonth(), now.getDate())
        ).length,
        thisWeek: activeNotifications.filter(n => {
          const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return n.createdAt > weekStart;
        }).length,
      },
    };
  },

  /**
   * Schedule notification cleanup
   */
  getExpiredNotifications: (notifications: Notification[]): Notification[] => {
    const now = new Date();
    
    return notifications.filter(notification => {
      // Check explicit expiration
      if (notification.expiresAt && notification.expiresAt <= now) {
        return true;
      }
      
      // Check auto-delete after read
      if (notification.autoDelete && notification.isRead && notification.deleteAfterDays) {
        const deleteAfter = new Date(notification.readAt!.getTime() + notification.deleteAfterDays * 24 * 60 * 60 * 1000);
        if (deleteAfter <= now) {
          return true;
        }
      }
      
      return false;
    });
  },

  /**
   * Format for display
   */
  formatForDisplay: (notification: Notification) => {
    const timeAgo = (date: Date): string => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    };
    
    return {
      id: notification._id?.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      shortMessage: notification.shortMessage,
      priority: notification.priority,
      channels: notification.channels,
      icon: notification.icon,
      image: notification.image,
      color: notification.color,
      actions: notification.actions,
      clickUrl: notification.clickUrl,
      status: notification.status,
      isRead: notification.isRead,
      isClicked: notification.isClicked,
      isDismissed: notification.isDismissed,
      category: notification.category,
      tags: notification.tags,
      groupId: notification.groupId,
      threadId: notification.threadId,
      timeAgo: timeAgo(notification.createdAt),
      createdAt: notification.createdAt,
      readAt: notification.readAt,
      clickedAt: notification.clickedAt,
      expiresAt: notification.expiresAt,
      isExpired: notification.expiresAt ? notification.expiresAt <= new Date() : false,
      analytics: {
        totalSent: notification.analytics.totalSent,
        totalDelivered: notification.analytics.totalDelivered,
        totalOpened: notification.analytics.totalOpened,
        totalClicked: notification.analytics.totalClicked,
        deliveryRate: Math.round(notification.analytics.deliveryRate * 100),
        openRate: Math.round(notification.analytics.openRate * 100),
        clickRate: Math.round(notification.analytics.clickRate * 100),
      },
    };
  },

  /**
   * Generate unique notification ID
   */
  generateNotificationId: (): string => {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  },

  /**
   * Validate notification scheduling
   */
  validateSchedule: (schedule: NotificationSchedule): boolean => {
    const now = new Date();
    
    // Cannot schedule in the past
    if (schedule.scheduledFor <= now) {
      return false;
    }
    
    // Validate recurring pattern
    if (schedule.recurring) {
      if (!schedule.recurringPattern) return false;
      
      // End date must be after start date
      if (schedule.recurringEndDate && schedule.recurringEndDate <= schedule.scheduledFor) {
        return false;
      }
      
      // Must have either end date or count
      if (!schedule.recurringEndDate && !schedule.recurringCount) {
        return false;
      }
    }
    
    return true;
  },

  /**
   * Calculate next recurring date
   */
  calculateNextRecurringDate: (schedule: NotificationSchedule): Date | null => {
    if (!schedule.recurring || !schedule.recurringPattern) return null;
    
    const current = schedule.scheduledFor;
    const interval = schedule.recurringInterval || 1;
    
    switch (schedule.recurringPattern) {
      case 'daily':
        return new Date(current.getTime() + interval * 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(current.getTime() + interval * 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const nextMonth = new Date(current);
        nextMonth.setMonth(nextMonth.getMonth() + interval);
        return nextMonth;
      case 'yearly':
        const nextYear = new Date(current);
        nextYear.setFullYear(nextYear.getFullYear() + interval);
        return nextYear;
      default:
        return null;
    }
  },
};

/**
 * Default values
 */
export const defaultNotification: Partial<Notification> = {
  channels: ['in_app'],
  priority: 'normal',
  status: 'draft',
  isRead: false,
  isClicked: false,
  isDismissed: false,
  persistAfterRead: true,
  autoDelete: false,
  respectUserPreferences: true,
  forceDelivery: false,
  variables: {},
  tags: [],
  actions: [],
  deliveries: [],
  deviceTokens: [],
  metadata: {},
  analytics: {
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalFailed: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    failureRate: 0,
    channelBreakdown: {} as Record<string, number>,
    deviceBreakdown: {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    },
    locationBreakdown: {},
  },
};

export const defaultNotificationPreferences: Partial<NotificationPreferences> = {
  globalEnabled: true,
  doNotDisturbEnabled: false,
  timezone: 'UTC',
  language: 'en',
  categoryPreferences: {},
  devicePreferences: {
    desktop: {
      enabled: true,
      showPreview: true,
      sound: true,
    },
    mobile: {
      enabled: true,
      showPreview: true,
      sound: true,
      vibration: true,
      badge: true,
    },
  },
  emailPreferences: {
    frequency: 'immediate',
    digest: false,
    unsubscribeAll: false,
  },
};

const NotificationModel = {
  NotificationSchema,
  CreateNotificationSchema,
  UpdateNotificationSchema,
  NotificationFilterSchema,
  NotificationTemplateSchema,
  NotificationPreferencesSchema,
  NotificationChannelSchema,
  NotificationPrioritySchema,
  NotificationTypeSchema,
  NotificationDeliverySchema,
  NotificationScheduleSchema,
  NotificationAnalyticsSchema,
  NotificationActionSchema,
  validateNotification,
  validateCreateNotification,
  validateUpdateNotification,
  validateNotificationFilter,
  validateNotificationTemplate,
  validateNotificationPreferences,
  notificationUtils,
  defaultNotification,
  defaultNotificationPreferences,
};

export default NotificationModel;