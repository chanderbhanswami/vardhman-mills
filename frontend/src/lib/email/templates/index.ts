/**
 * Email Templates Index
 * Central export for all email templates
 */

// Authentication & Security Templates
export * from './2fa_code';
export * from './account_created';
export * from './account_locked';
export * from './login_notification';
export * from './login_otp';
export * from './password_changed';
export * from './reset-password';
export * from './verification';
export * from './welcome';

// Order Management Templates
export * from './order-confirmation';
export * from './order-cancellation';
export * from './order-refund';

// Shipping & Delivery Templates
export * from './delivery-confirmation';
export * from './shipping-update';
export * from './deliverd-items-review';

// Business Templates
export * from './invoice';

// Newsletter Templates
export * from './newsletter_welcome';
export * from './newsletter_confirmation';
export * from './newsletter_unsubscribe';

// Marketing Templates
export * from './new_lauch';

// Template Registry for Dynamic Loading
export const EMAIL_TEMPLATES = {
  // Authentication & Security
  '2fa_code': () => import('./2fa_code'),
  'account_created': () => import('./account_created'),
  'account_locked': () => import('./account_locked'),
  'login_notification': () => import('./login_notification'),
  'login_otp': () => import('./login_otp'),
  'password_changed': () => import('./password_changed'),
  'reset_password': () => import('./reset-password'),
  'verification': () => import('./verification'),
  'welcome': () => import('./welcome'),

  // Order Management
  'order_confirmation': () => import('./order-confirmation'),
  'order_cancellation': () => import('./order-cancellation'),
  'order_refund': () => import('./order-refund'),

  // Shipping & Delivery
  'delivery_confirmation': () => import('./delivery-confirmation'),
  'shipping_update': () => import('./shipping-update'),
  'delivered_items_review': () => import('./deliverd-items-review'),

  // Business
  'invoice': () => import('./invoice'),

  // Newsletter
  'newsletter_welcome': () => import('./newsletter_welcome'),
  'newsletter_confirmation': () => import('./newsletter_confirmation'),
  'newsletter_unsubscribe': () => import('./newsletter_unsubscribe'),

  // Marketing
  'new_launch': () => import('./new_lauch'),
} as const;

export type EmailTemplateType = keyof typeof EMAIL_TEMPLATES;

/**
 * Dynamic template loader
 */
export async function loadEmailTemplate(templateName: EmailTemplateType) {
  const templateModule = await EMAIL_TEMPLATES[templateName]();
  return templateModule.default || templateModule;
}

/**
 * Get all available template names
 */
export function getAvailableTemplates(): EmailTemplateType[] {
  return Object.keys(EMAIL_TEMPLATES) as EmailTemplateType[];
}

/**
 * Template categories for organization
 */
export const TEMPLATE_CATEGORIES = {
  AUTHENTICATION: [
    '2fa_code', 'account_created', 'account_locked', 'login_notification', 
    'login_otp', 'password_changed', 'reset_password', 'verification', 'welcome'
  ],
  ORDER_MANAGEMENT: [
    'order_confirmation', 'order_cancellation', 'order_refund'
  ],
  SHIPPING_DELIVERY: [
    'delivery_confirmation', 'shipping_update', 'delivered_items_review'
  ],
  BUSINESS: [
    'invoice'
  ],
  NEWSLETTER: [
    'newsletter_welcome', 'newsletter_confirmation', 'newsletter_unsubscribe'
  ],
  MARKETING: [
    'new_launch'
  ]
} as const;

export default EMAIL_TEMPLATES;