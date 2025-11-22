/**
 * Newsletter Schemas for Vardhman Mills Frontend
 * Zod schemas for newsletter subscription, management, and campaigns
 */

import { z } from 'zod';
import { commonValidations } from '../common';

// Newsletter subscription schema
export const newsletterSubscriptionSchema = z.object({
  email: commonValidations.email,
  
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .transform(val => val.trim())
    .optional(),
  
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .transform(val => val.trim())
    .optional(),
  
  phone: commonValidations.phone.optional(),
  
  interests: z
    .array(z.enum([
      'new_products',
      'sales_promotions',
      'company_news',
      'industry_updates',
      'textile_trends',
      'sustainability',
      'events',
      'tutorials',
      'behind_scenes',
      'customer_stories'
    ]))
    .min(1, 'Please select at least one interest category')
    .max(10, 'Maximum 10 interest categories allowed'),
  
  frequency: z.enum(['daily', 'weekly', 'bi_weekly', 'monthly']).default('weekly'),
  
  language: z.enum(['en', 'hi']).default('en'),
  
  customerType: z.enum(['individual', 'business', 'retailer', 'designer']).optional(),
  
  location: z.object({
    country: z.string().default('India'),
    state: z.string().min(2).max(50).optional(),
    city: z.string().min(2).max(50).optional(),
  }).optional(),
  
  source: z.enum([
    'website_popup',
    'footer_form',
    'checkout_page',
    'product_page',
    'social_media',
    'referral',
    'advertisement',
    'event',
    'other'
  ]).optional(),
  
  referralCode: z
    .string()
    .max(20, 'Referral code too long')
    .optional(),
  
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'You must accept the terms and conditions'),
  
  acceptPrivacy: z
    .boolean()
    .refine(val => val === true, 'You must accept the privacy policy'),
  
  allowThirdPartyEmails: z.boolean().default(false),
});

export type NewsletterSubscriptionData = z.infer<typeof newsletterSubscriptionSchema>;

// Newsletter unsubscription schema
export const newsletterUnsubscriptionSchema = z.object({
  email: commonValidations.email,
  
  token: z
    .string()
    .min(10, 'Invalid unsubscribe token')
    .max(100, 'Invalid unsubscribe token'),
  
  reason: z.enum([
    'too_frequent',
    'not_relevant',
    'never_subscribed',
    'privacy_concerns',
    'temporary_break',
    'changed_email',
    'other'
  ]).optional(),
  
  feedback: z
    .string()
    .max(1000, 'Feedback must not exceed 1000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  resubscribeOptions: z.object({
    interested: z.boolean().default(false),
    frequency: z.enum(['weekly', 'monthly']).optional(),
    interests: z.array(z.string()).max(5).optional(),
  }).optional(),
});

export type NewsletterUnsubscriptionData = z.infer<typeof newsletterUnsubscriptionSchema>;

// Newsletter preference update schema
export const updateNewsletterPreferencesSchema = z.object({
  email: commonValidations.email,
  
  token: z
    .string()
    .min(10, 'Invalid preference token')
    .max(100, 'Invalid preference token'),
  
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .transform(val => val.trim())
    .optional(),
  
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .transform(val => val.trim())
    .optional(),
  
  interests: z
    .array(z.enum([
      'new_products',
      'sales_promotions',
      'company_news',
      'industry_updates',
      'textile_trends',
      'sustainability',
      'events',
      'tutorials',
      'behind_scenes',
      'customer_stories'
    ]))
    .min(1, 'Please select at least one interest category')
    .max(10, 'Maximum 10 interest categories allowed'),
  
  frequency: z.enum(['daily', 'weekly', 'bi_weekly', 'monthly']),
  
  language: z.enum(['en', 'hi']),
  
  customerType: z.enum(['individual', 'business', 'retailer', 'designer']).optional(),
  
  allowThirdPartyEmails: z.boolean(),
});

export type UpdateNewsletterPreferencesData = z.infer<typeof updateNewsletterPreferencesSchema>;

// Newsletter campaign creation schema (admin)
export const createNewsletterCampaignSchema = z.object({
  name: z
    .string()
    .min(3, 'Campaign name must be at least 3 characters')
    .max(100, 'Campaign name must not exceed 100 characters')
    .transform(val => val.trim()),
  
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(150, 'Subject must not exceed 150 characters')
    .transform(val => val.trim()),
  
  previewText: z
    .string()
    .min(10, 'Preview text must be at least 10 characters')
    .max(200, 'Preview text must not exceed 200 characters')
    .transform(val => val.trim()),
  
  content: z.object({
    html: z.string().min(100, 'HTML content must be at least 100 characters'),
    text: z.string().min(100, 'Text content must be at least 100 characters'),
  }),
  
  templateId: z.string().optional(),
  
  segmentation: z.object({
    interests: z.array(z.string()).max(10).optional(),
    customerType: z.array(z.enum(['individual', 'business', 'retailer', 'designer'])).optional(),
    location: z.object({
      countries: z.array(z.string()).max(50).optional(),
      states: z.array(z.string()).max(50).optional(),
      cities: z.array(z.string()).max(200).optional(),
    }).optional(),
    subscriptionDate: z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }).optional(),
    engagement: z.enum(['high', 'medium', 'low', 'all']).default('all'),
    excludeUnengaged: z.boolean().default(false),
  }).optional(),
  
  scheduling: z.object({
    sendImmediately: z.boolean().default(false),
    scheduledDate: z.date().optional(),
    timezone: z.string().default('Asia/Kolkata'),
    optimizeTime: z.boolean().default(false),
  }),
  
  abTesting: z.object({
    enabled: z.boolean().default(false),
    variants: z.array(z.object({
      name: z.string().min(1),
      subject: z.string().min(5).max(150),
      percentage: z.number().min(10).max(90),
    })).max(3).optional(),
    testDuration: z.number().min(1).max(48).optional(), // hours
    winnerMetric: z.enum(['open_rate', 'click_rate', 'conversion_rate']).optional(),
  }).optional(),
  
  tracking: z.object({
    openTracking: z.boolean().default(true),
    clickTracking: z.boolean().default(true),
    utmTags: z.object({
      source: z.string().default('newsletter'),
      medium: z.string().default('email'),
      campaign: z.string().optional(),
      term: z.string().optional(),
      content: z.string().optional(),
    }).optional(),
  }).optional(),
  
  attachments: z
    .array(z.object({
      filename: z.string().min(1),
      url: z.string().url(),
      size: z.number().max(10 * 1024 * 1024), // 10MB
    }))
    .max(5, 'Maximum 5 attachments allowed')
    .optional(),
}).refine(
  data => {
    if (!data.scheduling.sendImmediately && !data.scheduling.scheduledDate) {
      return false;
    }
    return true;
  },
  {
    message: 'Either send immediately or provide a scheduled date',
    path: ['scheduling', 'scheduledDate'],
  }
);

export type CreateNewsletterCampaignData = z.infer<typeof createNewsletterCampaignSchema>;

// Newsletter analytics schema
export const newsletterAnalyticsSchema = z.object({
  campaignId: z.string().optional(),
  
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }).refine(
    data => data.startDate <= data.endDate,
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  ),
  
  metrics: z
    .array(z.enum([
      'subscribers',
      'sent',
      'delivered',
      'opened',
      'clicked',
      'unsubscribed',
      'bounced',
      'complaints',
      'conversions',
      'revenue'
    ]))
    .min(1, 'At least one metric is required')
    .max(10, 'Too many metrics selected'),
  
  groupBy: z.enum(['day', 'week', 'month', 'campaign']).default('day'),
  
  segmentBy: z.enum(['interests', 'location', 'customer_type', 'engagement']).optional(),
  
  includeDetails: z.boolean().default(false),
  
  compareWith: z.object({
    enabled: z.boolean().default(false),
    period: z.enum(['previous_period', 'previous_year', 'custom']).optional(),
    customRange: z.object({
      startDate: z.date(),
      endDate: z.date(),
    }).optional(),
  }).optional(),
});

export type NewsletterAnalyticsData = z.infer<typeof newsletterAnalyticsSchema>;

// Newsletter template schema (admin)
export const newsletterTemplateSchema = z.object({
  name: z
    .string()
    .min(3, 'Template name must be at least 3 characters')
    .max(100, 'Template name must not exceed 100 characters')
    .transform(val => val.trim()),
  
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  category: z.enum([
    'promotional',
    'informational',
    'welcome',
    'newsletter',
    'product_announcement',
    'event',
    'seasonal',
    'transactional'
  ]),
  
  htmlContent: z
    .string()
    .min(100, 'HTML content must be at least 100 characters'),
  
  textContent: z
    .string()
    .min(100, 'Text content must be at least 100 characters'),
  
  thumbnailImage: z
    .instanceof(File)
    .refine(file => file.size <= 1 * 1024 * 1024, 'Image size must be less than 1MB')
    .refine(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), 'Only JPEG, PNG, and WebP images are allowed')
    .optional(),
  
  variables: z
    .array(z.object({
      name: z.string().min(1),
      type: z.enum(['text', 'image', 'url', 'date', 'number']),
      required: z.boolean().default(false),
      defaultValue: z.string().optional(),
      description: z.string().optional(),
    }))
    .max(50, 'Maximum 50 variables allowed')
    .optional(),
  
  isActive: z.boolean().default(true),
  
  tags: z
    .array(z.string().min(1).max(30))
    .max(20, 'Maximum 20 tags allowed')
    .optional(),
});

export type NewsletterTemplateData = z.infer<typeof newsletterTemplateSchema>;

// Newsletter automation rule schema (admin)
export const newsletterAutomationRuleSchema = z.object({
  name: z
    .string()
    .min(3, 'Rule name must be at least 3 characters')
    .max(100, 'Rule name must not exceed 100 characters')
    .transform(val => val.trim()),
  
  trigger: z.object({
    type: z.enum([
      'subscription',
      'purchase',
      'cart_abandonment',
      'birthday',
      'anniversary',
      'engagement_drop',
      'custom_event'
    ]),
    conditions: z.object({
      delay: z.number().min(0).max(365).optional(), // days
      customerType: z.array(z.enum(['individual', 'business', 'retailer', 'designer'])).optional(),
      purchaseAmount: z.object({
        min: z.number().min(0).optional(),
        max: z.number().min(0).optional(),
      }).optional(),
      lastEngagement: z.number().min(1).max(365).optional(), // days
    }).optional(),
  }),
  
  actions: z.array(z.object({
    type: z.enum(['send_email', 'add_tag', 'move_segment', 'update_preferences']),
    templateId: z.string().optional(),
    delay: z.number().min(0).max(30).optional(), // days
    data: z.record(z.string(), z.any()).optional(),
  })).min(1, 'At least one action is required').max(10),
  
  isActive: z.boolean().default(true),
  
  startDate: z.date().optional(),
  
  endDate: z.date().optional(),
  
  maxExecutions: z.number().min(1).max(1000000).optional(),
});

export type NewsletterAutomationRuleData = z.infer<typeof newsletterAutomationRuleSchema>;

// Subscriber import schema (admin)
export const importSubscribersSchema = z.object({
  file: z
    .instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(file => ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type), 'Only CSV and Excel files are allowed'),
  
  mapping: z.object({
    email: z.number().min(0),
    firstName: z.number().min(0).optional(),
    lastName: z.number().min(0).optional(),
    phone: z.number().min(0).optional(),
    interests: z.number().min(0).optional(),
    customerType: z.number().min(0).optional(),
    location: z.number().min(0).optional(),
  }),
  
  options: z.object({
    hasHeader: z.boolean().default(true),
    skipDuplicates: z.boolean().default(true),
    updateExisting: z.boolean().default(false),
    defaultFrequency: z.enum(['weekly', 'monthly']).default('weekly'),
    defaultLanguage: z.enum(['en', 'hi']).default('en'),
    sendWelcomeEmail: z.boolean().default(false),
  }),
  
  listId: z.string().optional(),
  
  tags: z
    .array(z.string().min(1).max(30))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

export type ImportSubscribersData = z.infer<typeof importSubscribersSchema>;

// Newsletter list management schema (admin)
export const newsletterListSchema = z.object({
  name: z
    .string()
    .min(3, 'List name must be at least 3 characters')
    .max(100, 'List name must not exceed 100 characters')
    .transform(val => val.trim()),
  
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  isDefault: z.boolean().default(false),
  
  autoSubscribe: z.boolean().default(false),
  
  requireDoubleOptIn: z.boolean().default(true),
  
  welcomeEmailTemplate: z.string().optional(),
  
  tags: z
    .array(z.string().min(1).max(30))
    .max(20, 'Maximum 20 tags allowed')
    .optional(),
  
  segmentation: z.object({
    interests: z.array(z.string()).optional(),
    customerType: z.array(z.enum(['individual', 'business', 'retailer', 'designer'])).optional(),
    location: z.object({
      countries: z.array(z.string()).optional(),
      states: z.array(z.string()).optional(),
      cities: z.array(z.string()).optional(),
    }).optional(),
  }).optional(),
});

export type NewsletterListData = z.infer<typeof newsletterListSchema>;

// Export all schemas
export const newsletterSchemas = {
  subscription: newsletterSubscriptionSchema,
  unsubscription: newsletterUnsubscriptionSchema,
  updatePreferences: updateNewsletterPreferencesSchema,
  createCampaign: createNewsletterCampaignSchema,
  analytics: newsletterAnalyticsSchema,
  template: newsletterTemplateSchema,
  automationRule: newsletterAutomationRuleSchema,
  importSubscribers: importSubscribersSchema,
  list: newsletterListSchema,
};

export default newsletterSchemas;
