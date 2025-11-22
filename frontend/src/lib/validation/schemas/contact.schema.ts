/**
 * Contact Schemas for Vardhman Mills Frontend
 * Zod schemas for contact forms, support tickets, and inquiries
 */

import { z } from 'zod';
import { commonValidations } from '../common';

// Basic contact form schema
export const contactFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .transform(val => val.trim()),
  
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .transform(val => val.trim()),
  
  email: commonValidations.email,
  
  phone: commonValidations.phone.optional(),
  
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must not exceed 200 characters')
    .transform(val => val.trim()),
  
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000, 'Message must not exceed 2000 characters')
    .transform(val => val.trim()),
  
  category: z.enum([
    'general',
    'sales',
    'support',
    'technical',
    'billing',
    'partnership',
    'media',
    'other'
  ]).default('general'),
  
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  
  preferredContact: z.enum(['email', 'phone', 'both']).default('email'),
  
  acceptPrivacy: z
    .boolean()
    .refine(val => val === true, 'You must accept the privacy policy'),
  
  allowMarketing: z.boolean().optional().default(false),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Support ticket schema
export const supportTicketSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(150, 'Title must not exceed 150 characters')
    .transform(val => val.trim()),
  
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must not exceed 5000 characters')
    .transform(val => val.trim()),
  
  category: z.enum([
    'technical_issue',
    'billing_inquiry',
    'product_question',
    'order_support',
    'account_issue',
    'shipping_problem',
    'return_refund',
    'feature_request',
    'bug_report',
    'other'
  ]),
  
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  
  severity: z.enum(['minor', 'moderate', 'major', 'critical']).default('moderate'),
  
  environment: z.object({
    browser: z.string().optional(),
    browserVersion: z.string().optional(),
    os: z.string().optional(),
    device: z.enum(['desktop', 'mobile', 'tablet']).optional(),
    screenResolution: z.string().optional(),
  }).optional(),
  
  stepsToReproduce: z
    .string()
    .max(2000, 'Steps to reproduce must not exceed 2000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  expectedResult: z
    .string()
    .max(1000, 'Expected result must not exceed 1000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  actualResult: z
    .string()
    .max(1000, 'Actual result must not exceed 1000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  attachments: z
    .array(z.instanceof(File))
    .max(5, 'Maximum 5 attachments allowed')
    .optional(),
  
  customerInfo: z.object({
    userId: z.string().optional(),
    orderNumber: z.string().optional(),
    accountEmail: commonValidations.email.optional(),
    phone: commonValidations.phone.optional(),
  }).optional(),
});

export type SupportTicketData = z.infer<typeof supportTicketSchema>;

// Newsletter subscription schema
export const newsletterSubscriptionSchema = z.object({
  email: commonValidations.email,
  
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  interests: z
    .array(z.enum([
      'new_products',
      'sales_promotions',
      'company_news',
      'industry_updates',
      'textile_trends',
      'sustainability',
      'events',
      'tutorials'
    ]))
    .min(1, 'Please select at least one interest')
    .max(8, 'Maximum 8 interests allowed'),
  
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  
  language: z.enum(['en', 'hi']).default('en'),
  
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'You must accept the terms and conditions'),
});

export type NewsletterSubscriptionData = z.infer<typeof newsletterSubscriptionSchema>;

// Bulk inquiry schema (for B2B customers)
export const bulkInquirySchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters')
    .transform(val => val.trim()),
  
  contactPerson: z
    .string()
    .min(2, 'Contact person name must be at least 2 characters')
    .max(50, 'Contact person name must not exceed 50 characters')
    .transform(val => val.trim()),
  
  designation: z
    .string()
    .min(2, 'Designation must be at least 2 characters')
    .max(50, 'Designation must not exceed 50 characters')
    .transform(val => val.trim()),
  
  email: commonValidations.email,
  
  phone: commonValidations.phone,
  
  businessType: z.enum([
    'retailer',
    'wholesaler',
    'distributor',
    'manufacturer',
    'export_house',
    'fashion_brand',
    'interior_designer',
    'architect',
    'other'
  ]),
  
  companySize: z.enum([
    'startup',
    'small_business',
    'medium_enterprise',
    'large_enterprise',
    'corporation'
  ]),
  
  annualVolume: z.enum([
    'less_than_10k',
    '10k_to_50k',
    '50k_to_100k',
    '100k_to_500k',
    '500k_to_1m',
    'more_than_1m'
  ]),
  
  products: z
    .array(z.enum([
      'cotton_fabric',
      'silk_fabric',
      'wool_fabric',
      'synthetic_fabric',
      'blend_fabric',
      'organic_fabric',
      'technical_textile',
      'home_textile',
      'apparels',
      'custom_weaving'
    ]))
    .min(1, 'Please select at least one product category')
    .max(10, 'Maximum 10 product categories allowed'),
  
  requirements: z
    .string()
    .min(50, 'Requirements must be at least 50 characters')
    .max(3000, 'Requirements must not exceed 3000 characters')
    .transform(val => val.trim()),
  
  timeline: z.enum([
    'immediate',
    'within_month',
    'within_quarter',
    'within_6months',
    'within_year',
    'flexible'
  ]),
  
  budget: z.enum([
    'less_than_1lakh',
    '1lakh_to_5lakh',
    '5lakh_to_10lakh',
    '10lakh_to_50lakh',
    '50lakh_to_1crore',
    'more_than_1crore'
  ]).optional(),
  
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters').max(200),
    city: z.string().min(2, 'City must be at least 2 characters').max(50),
    state: z.string().min(2, 'State is required').max(50),
    pincode: commonValidations.pincode,
    country: z.string().default('India'),
  }),
  
  gstNumber: commonValidations.gst.optional(),
  
  previousExperience: z
    .string()
    .max(1000, 'Previous experience must not exceed 1000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  referralSource: z.enum([
    'search_engine',
    'social_media',
    'referral',
    'advertisement',
    'trade_show',
    'website',
    'existing_customer',
    'other'
  ]).optional(),
  
  specialRequirements: z
    .string()
    .max(1000, 'Special requirements must not exceed 1000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  attachments: z
    .array(z.instanceof(File))
    .max(10, 'Maximum 10 attachments allowed')
    .optional(),
});

export type BulkInquiryData = z.infer<typeof bulkInquirySchema>;

// Callback request schema
export const callbackRequestSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .transform(val => val.trim()),
  
  phone: commonValidations.phone,
  
  email: commonValidations.email.optional(),
  
  purpose: z.enum([
    'product_inquiry',
    'technical_support',
    'sales_consultation',
    'partnership_discussion',
    'complaint_resolution',
    'general_inquiry',
    'other'
  ]),
  
  preferredTime: z.object({
    date: z.date().min(new Date(), 'Date must be in the future'),
    timeSlot: z.enum([
      '09:00-10:00',
      '10:00-11:00',
      '11:00-12:00',
      '12:00-13:00',
      '13:00-14:00',
      '14:00-15:00',
      '15:00-16:00',
      '16:00-17:00',
      '17:00-18:00'
    ]),
  }),
  
  alternativeTime: z.object({
    date: z.date().min(new Date(), 'Date must be in the future'),
    timeSlot: z.enum([
      '09:00-10:00',
      '10:00-11:00',
      '11:00-12:00',
      '12:00-13:00',
      '13:00-14:00',
      '14:00-15:00',
      '15:00-16:00',
      '16:00-17:00',
      '17:00-18:00'
    ]),
  }).optional(),
  
  briefDescription: z
    .string()
    .min(10, 'Brief description must be at least 10 characters')
    .max(500, 'Brief description must not exceed 500 characters')
    .transform(val => val.trim()),
  
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
});

export type CallbackRequestData = z.infer<typeof callbackRequestSchema>;

// Feedback schema
export const feedbackSchema = z.object({
  category: z.enum([
    'website_feedback',
    'product_feedback',
    'service_feedback',
    'delivery_feedback',
    'support_feedback',
    'suggestion',
    'complaint',
    'compliment'
  ]),
  
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5')
    .int('Rating must be a whole number'),
  
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters')
    .transform(val => val.trim()),
  
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .transform(val => val.trim()),
  
  customerInfo: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters')
      .transform(val => val.trim()),
    email: commonValidations.email.optional(),
    phone: commonValidations.phone.optional(),
    orderNumber: z.string().optional(),
  }),
  
  anonymous: z.boolean().default(false),
  
  allowPublic: z.boolean().default(false),
  
  wouldRecommend: z.boolean().optional(),
  
  improvements: z
    .array(z.enum([
      'website_design',
      'product_quality',
      'delivery_speed',
      'customer_support',
      'pricing',
      'product_variety',
      'user_experience',
      'mobile_app',
      'payment_options',
      'communication'
    ]))
    .max(5, 'Maximum 5 improvement areas allowed')
    .optional(),
  
  attachments: z
    .array(z.instanceof(File))
    .max(3, 'Maximum 3 attachments allowed')
    .optional(),
});

export type FeedbackData = z.infer<typeof feedbackSchema>;

// Quote request schema
export const quoteRequestSchema = z.object({
  customerInfo: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters')
      .transform(val => val.trim()),
    email: commonValidations.email,
    phone: commonValidations.phone,
    company: z
      .string()
      .max(100, 'Company name must not exceed 100 characters')
      .optional()
      .transform(val => val ? val.trim() : undefined),
  }),
  
  products: z
    .array(z.object({
      category: z.enum([
        'cotton_fabric',
        'silk_fabric',
        'wool_fabric',
        'synthetic_fabric',
        'blend_fabric',
        'organic_fabric',
        'technical_textile',
        'home_textile'
      ]),
      type: z.string().min(2, 'Product type is required').max(100),
      quantity: z
        .number()
        .min(1, 'Quantity must be at least 1')
        .max(1000000, 'Quantity too large'),
      unit: z.enum(['meters', 'yards', 'pieces', 'kg', 'tons']),
      specifications: z
        .string()
        .max(1000, 'Specifications must not exceed 1000 characters')
        .optional(),
      urgency: z.enum(['standard', 'urgent', 'rush']).default('standard'),
    }))
    .min(1, 'At least one product is required')
    .max(20, 'Maximum 20 products allowed'),
  
  deliveryInfo: z.object({
    address: z.object({
      street: z.string().min(5, 'Street address must be at least 5 characters').max(200),
      city: z.string().min(2, 'City must be at least 2 characters').max(50),
      state: z.string().min(2, 'State is required').max(50),
      pincode: commonValidations.pincode,
      country: z.string().default('India'),
    }),
    preferredDate: z.date().min(new Date(), 'Delivery date must be in the future'),
    urgency: z.enum(['standard', 'express', 'rush']).default('standard'),
  }),
  
  additionalRequirements: z
    .string()
    .max(2000, 'Additional requirements must not exceed 2000 characters')
    .optional()
    .transform(val => val ? val.trim() : undefined),
  
  budgetRange: z.enum([
    'less_than_10k',
    '10k_to_50k',
    '50k_to_1lakh',
    '1lakh_to_5lakh',
    '5lakh_to_10lakh',
    'more_than_10lakh'
  ]).optional(),
  
  attachments: z
    .array(z.instanceof(File))
    .max(5, 'Maximum 5 attachments allowed')
    .optional(),
});

export type QuoteRequestData = z.infer<typeof quoteRequestSchema>;

// Export all schemas
export const contactSchemas = {
  contactForm: contactFormSchema,
  supportTicket: supportTicketSchema,
  newsletterSubscription: newsletterSubscriptionSchema,
  bulkInquiry: bulkInquirySchema,
  callbackRequest: callbackRequestSchema,
  feedback: feedbackSchema,
  quoteRequest: quoteRequestSchema,
};

export default contactSchemas;
