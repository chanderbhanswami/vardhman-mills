/**
 * Email Constants - Vardhman Mills Frontend
 * Contains email-related configuration and templates
 */

// Email Configuration
export const EMAIL_CONFIG = {
  SMTP_HOST: process.env.NEXT_PUBLIC_SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.NEXT_PUBLIC_SMTP_PORT || '587'),
  FROM_EMAIL: process.env.NEXT_PUBLIC_FROM_EMAIL || 'noreply@vardhmanmills.com',
  FROM_NAME: 'Vardhman Mills',
  SUPPORT_EMAIL: 'support@vardhmanmills.com',
  INFO_EMAIL: 'info@vardhmanmills.com',
  SALES_EMAIL: 'sales@vardhmanmills.com',
} as const;

// Email Types
export const EMAIL_TYPES = {
  WELCOME: 'welcome',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
  ORDER_CONFIRMATION: 'order_confirmation',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  NEWSLETTER: 'newsletter',
  PROMOTIONAL: 'promotional',
  SUPPORT_TICKET: 'support_ticket',
  REVIEW_REQUEST: 'review_request',
  CART_ABANDONMENT: 'cart_abandonment',
  BACK_IN_STOCK: 'back_in_stock',
  PRICE_DROP: 'price_drop',
} as const;

// Email Templates
export const EMAIL_TEMPLATES = {
  WELCOME: {
    SUBJECT: 'Welcome to Vardhman Mills!',
    TEMPLATE_ID: 'welcome-template',
  },
  EMAIL_VERIFICATION: {
    SUBJECT: 'Verify Your Email Address',
    TEMPLATE_ID: 'email-verification-template',
  },
  PASSWORD_RESET: {
    SUBJECT: 'Reset Your Password',
    TEMPLATE_ID: 'password-reset-template',
  },
  ORDER_CONFIRMATION: {
    SUBJECT: 'Order Confirmation - #{orderId}',
    TEMPLATE_ID: 'order-confirmation-template',
  },
  ORDER_SHIPPED: {
    SUBJECT: 'Your Order Has Been Shipped - #{orderId}',
    TEMPLATE_ID: 'order-shipped-template',
  },
  ORDER_DELIVERED: {
    SUBJECT: 'Your Order Has Been Delivered - #{orderId}',
    TEMPLATE_ID: 'order-delivered-template',
  },
  ORDER_CANCELLED: {
    SUBJECT: 'Order Cancelled - #{orderId}',
    TEMPLATE_ID: 'order-cancelled-template',
  },
  NEWSLETTER: {
    SUBJECT: 'Vardhman Mills Newsletter',
    TEMPLATE_ID: 'newsletter-template',
  },
  PROMOTIONAL: {
    SUBJECT: 'Special Offer from Vardhman Mills',
    TEMPLATE_ID: 'promotional-template',
  },
  SUPPORT_TICKET: {
    SUBJECT: 'Support Ticket Created - #{ticketId}',
    TEMPLATE_ID: 'support-ticket-template',
  },
  REVIEW_REQUEST: {
    SUBJECT: 'How was your recent purchase?',
    TEMPLATE_ID: 'review-request-template',
  },
  CART_ABANDONMENT: {
    SUBJECT: 'Complete Your Purchase',
    TEMPLATE_ID: 'cart-abandonment-template',
  },
  BACK_IN_STOCK: {
    SUBJECT: 'Good News! Your Item is Back in Stock',
    TEMPLATE_ID: 'back-in-stock-template',
  },
  PRICE_DROP: {
    SUBJECT: 'Price Drop Alert!',
    TEMPLATE_ID: 'price-drop-template',
  },
} as const;

// Email Preferences
export const EMAIL_PREFERENCES = {
  MARKETING: 'marketing',
  TRANSACTIONAL: 'transactional',
  NEWSLETTERS: 'newsletters',
  PROMOTIONS: 'promotions',
  ORDER_UPDATES: 'order_updates',
  SECURITY_ALERTS: 'security_alerts',
  REVIEW_REQUESTS: 'review_requests',
  RECOMMENDATIONS: 'recommendations',
} as const;

// Email Frequency
export const EMAIL_FREQUENCY = {
  IMMEDIATE: 'immediate',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  NEVER: 'never',
} as const;

// Email Status
export const EMAIL_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  BOUNCED: 'bounced',
  OPENED: 'opened',
  CLICKED: 'clicked',
  UNSUBSCRIBED: 'unsubscribed',
} as const;

// Newsletter Categories
export const NEWSLETTER_CATEGORIES = {
  GENERAL: 'general',
  PRODUCTS: 'products',
  OFFERS: 'offers',
  BLOG: 'blog',
  EVENTS: 'events',
} as const;

// Email Validation
export const EMAIL_VALIDATION = {
  REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  MAX_LENGTH: 254,
  MIN_LENGTH: 5,
} as const;

// Unsubscribe Reasons
export const UNSUBSCRIBE_REASONS = {
  TOO_FREQUENT: 'too_frequent',
  NOT_RELEVANT: 'not_relevant',
  NEVER_SUBSCRIBED: 'never_subscribed',
  OTHER: 'other',
} as const;

export type EmailTypes = typeof EMAIL_TYPES;
export type EmailPreferences = typeof EMAIL_PREFERENCES;
export type EmailStatus = typeof EMAIL_STATUS;
export type EmailFrequency = typeof EMAIL_FREQUENCY;