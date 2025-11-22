/**
 * Conversion Tracking for Vardhman Mills
 * Advanced conversion tracking and funnel analysis
 */

import { googleAnalytics } from './google-analytics';
import { facebookPixel } from './facebook-pixel';
import { eventTracker } from './event-tracking';

// Configuration
const CONVERSION_CONFIG = {
  enableGA: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? true : false,
  enableFB: process.env.NEXT_PUBLIC_FB_PIXEL_ID ? true : false,
  debug: process.env.NODE_ENV === 'development',
  funnelStorageKey: 'vm_funnel_data',
  sessionStorageKey: 'vm_session_data',
};

// Conversion Types
export interface ConversionGoal {
  id: string;
  name: string;
  value: number;
  currency: string;
  category: string;
  description?: string;
}

export interface FunnelStep {
  id: string;
  name: string;
  timestamp: number;
  value?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface ConversionEvent {
  goalId: string;
  goalName: string;
  value: number;
  currency: string;
  transactionId?: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
  attribution?: {
    source: string;
    medium: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  customParameters?: Record<string, string | number | boolean>;
}

export interface SessionData {
  sessionId: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: number;
  source: string;
  medium: string;
  campaign?: string;
  landingPage: string;
  userAgent: string;
  referrer: string;
}

export interface FunnelData {
  sessionId: string;
  userId?: string;
  steps: FunnelStep[];
  startTime: number;
  lastUpdate: number;
  completed: boolean;
  abandonedAt?: string;
}

// Predefined Conversion Goals
export const CONVERSION_GOALS = {
  PURCHASE: {
    id: 'purchase',
    name: 'Purchase',
    value: 0, // Dynamic
    currency: 'INR',
    category: 'ecommerce',
    description: 'Product purchase completion',
  },
  LEAD_GENERATION: {
    id: 'lead_generation',
    name: 'Lead Generation',
    value: 50,
    currency: 'INR',
    category: 'lead',
    description: 'Contact form submission or inquiry',
  },
  SAMPLE_REQUEST: {
    id: 'sample_request',
    name: 'Sample Request',
    value: 25,
    currency: 'INR',
    category: 'lead',
    description: 'Product sample request',
  },
  QUOTE_REQUEST: {
    id: 'quote_request',
    name: 'Quote Request',
    value: 75,
    currency: 'INR',
    category: 'lead',
    description: 'Price quote request',
  },
  NEWSLETTER_SIGNUP: {
    id: 'newsletter_signup',
    name: 'Newsletter Signup',
    value: 10,
    currency: 'INR',
    category: 'engagement',
    description: 'Newsletter subscription',
  },
  CATALOG_DOWNLOAD: {
    id: 'catalog_download',
    name: 'Catalog Download',
    value: 15,
    currency: 'INR',
    category: 'engagement',
    description: 'Product catalog download',
  },
  BULK_INQUIRY: {
    id: 'bulk_inquiry',
    name: 'Bulk Inquiry',
    value: 100,
    currency: 'INR',
    category: 'lead',
    description: 'Bulk order inquiry',
  },
} as const;

// Funnel Definitions
export const FUNNELS = {
  PURCHASE: {
    id: 'purchase_funnel',
    name: 'Purchase Funnel',
    steps: [
      'product_view',
      'add_to_cart',
      'checkout_start',
      'payment_info',
      'purchase_complete',
    ],
  },
  LEAD: {
    id: 'lead_funnel',
    name: 'Lead Generation Funnel',
    steps: [
      'landing_page',
      'form_view',
      'form_start',
      'form_complete',
    ],
  },
  SAMPLE: {
    id: 'sample_funnel',
    name: 'Sample Request Funnel',
    steps: [
      'product_view',
      'sample_button_click',
      'sample_form',
      'sample_request_complete',
    ],
  },
} as const;

class ConversionTracker {
  private debug: boolean;
  private enableGA: boolean;
  private enableFB: boolean;
  private sessionData: SessionData | null = null;
  private funnelData: Map<string, FunnelData> = new Map();

  constructor(config: typeof CONVERSION_CONFIG) {
    this.debug = config.debug;
    this.enableGA = config.enableGA;
    this.enableFB = config.enableFB;

    if (typeof window !== 'undefined') {
      this.initializeSession();
      this.loadFunnelData();
    }
  }

  /**
   * Initialize user session
   */
  private initializeSession(): void {
    try {
      const existingSession = localStorage.getItem(CONVERSION_CONFIG.sessionStorageKey);
      const urlParams = new URLSearchParams(window.location.search);

      if (existingSession) {
        this.sessionData = JSON.parse(existingSession);
        if (this.sessionData) {
          this.sessionData.lastActivity = Date.now();
          this.sessionData.pageViews++;
        }
      } else {
        this.sessionData = {
          sessionId: this.generateSessionId(),
          startTime: Date.now(),
          lastActivity: Date.now(),
          pageViews: 1,
          events: 0,
          source: urlParams.get('utm_source') || document.referrer || 'direct',
          medium: urlParams.get('utm_medium') || 'organic',
          campaign: urlParams.get('utm_campaign') || undefined,
          landingPage: window.location.pathname,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        };
      }

      this.saveSessionData();

      if (this.debug) {
        console.log('ConversionTracker: Session initialized', this.sessionData);
      }
    } catch (error) {
      console.error('ConversionTracker: Failed to initialize session', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `vm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save session data to localStorage
   */
  private saveSessionData(): void {
    if (this.sessionData && typeof window !== 'undefined') {
      localStorage.setItem(CONVERSION_CONFIG.sessionStorageKey, JSON.stringify(this.sessionData));
    }
  }

  /**
   * Load funnel data from localStorage
   */
  private loadFunnelData(): void {
    try {
      const data = localStorage.getItem(CONVERSION_CONFIG.funnelStorageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.funnelData = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('ConversionTracker: Failed to load funnel data', error);
    }
  }

  /**
   * Save funnel data to localStorage
   */
  private saveFunnelData(): void {
    try {
      const data = Object.fromEntries(this.funnelData);
      localStorage.setItem(CONVERSION_CONFIG.funnelStorageKey, JSON.stringify(data));
    } catch (error) {
      console.error('ConversionTracker: Failed to save funnel data', error);
    }
  }

  /**
   * Track a conversion event
   */
  trackConversion(conversion: Omit<ConversionEvent, 'sessionId' | 'timestamp'>): void {
    try {
      if (!this.sessionData) {
        console.warn('ConversionTracker: No session data available');
        return;
      }

      const conversionEvent: ConversionEvent = {
        ...conversion,
        sessionId: this.sessionData.sessionId,
        timestamp: Date.now(),
        attribution: {
          source: this.sessionData.source,
          medium: this.sessionData.medium,
          campaign: this.sessionData.campaign,
        },
      };

      // Track with Google Analytics
      if (this.enableGA) {
        googleAnalytics.trackConversion(conversion.goalId, conversion.value, conversion.currency);
      }

      // Track with Facebook Pixel
      if (this.enableFB) {
        if (conversion.goalId === 'purchase') {
          facebookPixel.trackEvent('Purchase', {
            value: conversion.value,
            currency: conversion.currency,
            content_type: 'product',
          });
        } else {
          facebookPixel.trackEvent('CompleteRegistration', {
            value: conversion.value,
            currency: conversion.currency,
            content_name: conversion.goalName,
          });
        }
      }

      // Track with event tracker
      eventTracker.track({
        action: 'conversion',
        category: 'goal',
        label: conversion.goalName,
        value: conversion.value,
        customParameters: {
          goal_id: conversion.goalId,
          transaction_id: conversion.transactionId || '',
          user_id: conversion.userId || '',
          ...conversion.customParameters,
        },
      });

      // Update session data
      this.sessionData.events++;
      this.sessionData.lastActivity = Date.now();
      this.saveSessionData();

      if (this.debug) {
        console.log('ConversionTracker: Conversion tracked', conversionEvent);
      }
    } catch (error) {
      console.error('ConversionTracker: Failed to track conversion', error);
    }
  }

  /**
   * Track funnel step
   */
  trackFunnelStep(funnelId: string, stepId: string, value?: number, metadata?: Record<string, string | number | boolean>): void {
    try {
      if (!this.sessionData) {
        console.warn('ConversionTracker: No session data available');
        return;
      }

      let funnel = this.funnelData.get(funnelId);

      if (!funnel) {
        funnel = {
          sessionId: this.sessionData.sessionId,
          userId: undefined,
          steps: [],
          startTime: Date.now(),
          lastUpdate: Date.now(),
          completed: false,
        };
        this.funnelData.set(funnelId, funnel);
      }

      // Add step if not already present
      const existingStep = funnel.steps.find(step => step.id === stepId);
      if (!existingStep) {
        const step: FunnelStep = {
          id: stepId,
          name: stepId,
          timestamp: Date.now(),
          value,
          metadata,
        };

        funnel.steps.push(step);
        funnel.lastUpdate = Date.now();

        // Check if funnel is completed
        const funnelDefinition = Object.values(FUNNELS).find(f => f.id === funnelId);
        if (funnelDefinition && funnel.steps.length === funnelDefinition.steps.length) {
          funnel.completed = true;
        }

        this.saveFunnelData();

        // Track step with analytics
        eventTracker.track({
          action: 'funnel_step',
          category: 'funnel',
          label: `${funnelId}_${stepId}`,
          value,
          customParameters: {
            funnel_id: funnelId,
            step_id: stepId,
            step_number: funnel.steps.length,
            ...metadata,
          },
        });

        if (this.debug) {
          console.log('ConversionTracker: Funnel step tracked', { funnelId, stepId, value, metadata });
        }
      }
    } catch (error) {
      console.error('ConversionTracker: Failed to track funnel step', error);
    }
  }

  /**
   * Get funnel completion rate
   */
  getFunnelCompletionRate(funnelId: string): number {
    const funnel = this.funnelData.get(funnelId);
    if (!funnel) return 0;

    const funnelDefinition = Object.values(FUNNELS).find(f => f.id === funnelId);
    if (!funnelDefinition) return 0;

    return (funnel.steps.length / funnelDefinition.steps.length) * 100;
  }

  /**
   * Get funnel drop-off points
   */
  getFunnelDropoff(funnelId: string): string[] {
    const funnel = this.funnelData.get(funnelId);
    if (!funnel) return [];

    const funnelDefinition = Object.values(FUNNELS).find(f => f.id === funnelId);
    if (!funnelDefinition) return [];

    const completedSteps = funnel.steps.map(step => step.id);
    return funnelDefinition.steps.filter(step => !completedSteps.includes(step));
  }

  /**
   * Track attribution
   */
  trackAttribution(source: string, medium: string, campaign?: string, content?: string, term?: string): void {
    if (this.sessionData) {
      this.sessionData.source = source;
      this.sessionData.medium = medium;
      this.sessionData.campaign = campaign;
      this.saveSessionData();

      eventTracker.track({
        action: 'attribution',
        category: 'marketing',
        label: `${source}_${medium}`,
        customParameters: {
          source,
          medium,
          campaign: campaign || '',
          content: content || '',
          term: term || '',
        },
      });

      if (this.debug) {
        console.log('ConversionTracker: Attribution tracked', { source, medium, campaign, content, term });
      }
    }
  }

  // Business-specific conversion tracking methods

  /**
   * Track purchase conversion
   */
  trackPurchaseConversion(transactionId: string, value: number, items?: unknown[]): void {
    this.trackConversion({
      goalId: CONVERSION_GOALS.PURCHASE.id,
      goalName: CONVERSION_GOALS.PURCHASE.name,
      value,
      currency: CONVERSION_GOALS.PURCHASE.currency,
      transactionId,
      customParameters: {
        item_count: items?.length || 0,
      },
    });

    // Complete purchase funnel
    this.trackFunnelStep(FUNNELS.PURCHASE.id, 'purchase_complete', value);
  }

  /**
   * Track lead generation conversion
   */
  trackLeadConversion(leadType: string, source: string, value?: number): void {
    this.trackConversion({
      goalId: CONVERSION_GOALS.LEAD_GENERATION.id,
      goalName: CONVERSION_GOALS.LEAD_GENERATION.name,
      value: value || CONVERSION_GOALS.LEAD_GENERATION.value,
      currency: CONVERSION_GOALS.LEAD_GENERATION.currency,
      customParameters: {
        lead_type: leadType,
        lead_source: source,
      },
    });

    // Complete lead funnel
    this.trackFunnelStep(FUNNELS.LEAD.id, 'form_complete', value);
  }

  /**
   * Track sample request conversion
   */
  trackSampleRequestConversion(productId: string, productName: string): void {
    this.trackConversion({
      goalId: CONVERSION_GOALS.SAMPLE_REQUEST.id,
      goalName: CONVERSION_GOALS.SAMPLE_REQUEST.name,
      value: CONVERSION_GOALS.SAMPLE_REQUEST.value,
      currency: CONVERSION_GOALS.SAMPLE_REQUEST.currency,
      customParameters: {
        product_id: productId,
        product_name: productName,
      },
    });

    // Complete sample funnel
    this.trackFunnelStep(FUNNELS.SAMPLE.id, 'sample_request_complete');
  }

  /**
   * Track quote request conversion
   */
  trackQuoteRequestConversion(productIds: string[], totalValue?: number): void {
    this.trackConversion({
      goalId: CONVERSION_GOALS.QUOTE_REQUEST.id,
      goalName: CONVERSION_GOALS.QUOTE_REQUEST.name,
      value: totalValue || CONVERSION_GOALS.QUOTE_REQUEST.value,
      currency: CONVERSION_GOALS.QUOTE_REQUEST.currency,
      customParameters: {
        product_count: productIds.length,
        product_ids: productIds.join(','),
      },
    });
  }

  /**
   * Track newsletter signup conversion
   */
  trackNewsletterConversion(source: string): void {
    this.trackConversion({
      goalId: CONVERSION_GOALS.NEWSLETTER_SIGNUP.id,
      goalName: CONVERSION_GOALS.NEWSLETTER_SIGNUP.name,
      value: CONVERSION_GOALS.NEWSLETTER_SIGNUP.value,
      currency: CONVERSION_GOALS.NEWSLETTER_SIGNUP.currency,
      customParameters: {
        signup_source: source,
      },
    });
  }

  /**
   * Track catalog download conversion
   */
  trackCatalogDownloadConversion(catalogName: string, fileType: string): void {
    this.trackConversion({
      goalId: CONVERSION_GOALS.CATALOG_DOWNLOAD.id,
      goalName: CONVERSION_GOALS.CATALOG_DOWNLOAD.name,
      value: CONVERSION_GOALS.CATALOG_DOWNLOAD.value,
      currency: CONVERSION_GOALS.CATALOG_DOWNLOAD.currency,
      customParameters: {
        catalog_name: catalogName,
        file_type: fileType,
      },
    });
  }

  /**
   * Track bulk inquiry conversion
   */
  trackBulkInquiryConversion(category: string, estimatedValue?: number): void {
    this.trackConversion({
      goalId: CONVERSION_GOALS.BULK_INQUIRY.id,
      goalName: CONVERSION_GOALS.BULK_INQUIRY.name,
      value: estimatedValue || CONVERSION_GOALS.BULK_INQUIRY.value,
      currency: CONVERSION_GOALS.BULK_INQUIRY.currency,
      customParameters: {
        inquiry_category: category,
        estimated_value: estimatedValue || 0,
      },
    });
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string): void {
    if (this.sessionData) {
      // Update session data
      this.sessionData.lastActivity = Date.now();
      this.saveSessionData();

      // Update funnel data
      this.funnelData.forEach(funnel => {
        funnel.userId = userId;
      });
      this.saveFunnelData();

      // Set user ID in analytics
      if (this.enableGA) {
        googleAnalytics.setUserId(userId);
      }

      if (this.debug) {
        console.log('ConversionTracker: User ID set', userId);
      }
    }
  }

  /**
   * Get session data
   */
  getSessionData(): SessionData | null {
    return this.sessionData;
  }

  /**
   * Get funnel data
   */
  getFunnelData(funnelId?: string): FunnelData | Map<string, FunnelData> | null {
    if (funnelId) {
      return this.funnelData.get(funnelId) || null;
    }
    return this.funnelData;
  }

  /**
   * Clear all tracking data
   */
  clearData(): void {
    this.funnelData.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CONVERSION_CONFIG.funnelStorageKey);
      localStorage.removeItem(CONVERSION_CONFIG.sessionStorageKey);
    }
    this.sessionData = null;

    if (this.debug) {
      console.log('ConversionTracker: All data cleared');
    }
  }

  /**
   * Set debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debug = enabled;
  }

  /**
   * Check if tracking is enabled
   */
  isEnabled(): { ga: boolean; fb: boolean } {
    return {
      ga: this.enableGA,
      fb: this.enableFB,
    };
  }
}

// Create singleton instance
export const conversionTracker = new ConversionTracker(CONVERSION_CONFIG);

export default conversionTracker;
