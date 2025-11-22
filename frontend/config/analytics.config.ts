/**
 * Analytics Configuration
 * Comprehensive analytics setup for Google Analytics, GTM, and custom tracking
 * @module config/analytics
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AnalyticsConfig {
  googleAnalytics: GoogleAnalyticsConfig;
  googleTagManager: GoogleTagManagerConfig;
  customEvents: CustomEventsConfig;
  tracking: TrackingConfig;
  consent: ConsentConfig;
  performance: PerformanceConfig;
}

export interface GoogleAnalyticsConfig {
  enabled: boolean;
  measurementId: string;
  debug: boolean;
  anonymizeIp: boolean;
  cookieExpires: number;
  siteSpeedSampleRate: number;
  allowAdFeatures: boolean;
  allowGoogleSignals: boolean;
}

export interface GoogleTagManagerConfig {
  enabled: boolean;
  containerId: string;
  auth?: string;
  preview?: string;
  dataLayer: string;
  debug: boolean;
}

export interface CustomEventsConfig {
  enabled: boolean;
  categories: {
    ecommerce: boolean;
    userEngagement: boolean;
    navigation: boolean;
    forms: boolean;
    errors: boolean;
    performance: boolean;
  };
}

export interface TrackingConfig {
  pageViews: {
    enabled: boolean;
    includeSearchParams: boolean;
    excludeParams: string[];
  };
  outboundLinks: {
    enabled: boolean;
    domains: string[];
  };
  downloads: {
    enabled: boolean;
    extensions: string[];
  };
  scrollDepth: {
    enabled: boolean;
    thresholds: number[];
  };
  videoTracking: {
    enabled: boolean;
    providers: string[];
  };
}

export interface ConsentConfig {
  enabled: boolean;
  mode: 'opt-in' | 'opt-out';
  categories: {
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
    necessary: boolean;
  };
  cookieDomain?: string;
  cookiePath: string;
  cookieExpires: number;
}

export interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number;
  metrics: {
    FCP: boolean; // First Contentful Paint
    LCP: boolean; // Largest Contentful Paint
    FID: boolean; // First Input Delay
    CLS: boolean; // Cumulative Layout Shift
    TTFB: boolean; // Time to First Byte
  };
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export type AnalyticsEvent = 
  | 'page_view'
  | 'click'
  | 'form_submit'
  | 'form_error'
  | 'search'
  | 'login'
  | 'signup'
  | 'logout'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'add_payment_info'
  | 'add_shipping_info'
  | 'purchase'
  | 'refund'
  | 'view_item'
  | 'view_item_list'
  | 'select_item'
  | 'add_to_wishlist'
  | 'share'
  | 'video_start'
  | 'video_progress'
  | 'video_complete'
  | 'download'
  | 'outbound_link'
  | 'scroll_depth'
  | 'error'
  | 'exception'
  | 'timing_complete';

export interface EventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  currency?: string;
  items?: Array<Record<string, unknown>>;
  transaction_id?: string;
  [key: string]: string | number | boolean | Array<Record<string, unknown>> | undefined;
}

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || 'GTM-MS3GZPMK';
const GTM_AUTH = process.env.NEXT_PUBLIC_GTM_AUTH;
const GTM_PREVIEW = process.env.NEXT_PUBLIC_GTM_PREVIEW;
const NODE_ENV = process.env.NODE_ENV || 'development';
const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

// ============================================================================
// MAIN CONFIGURATION
// ============================================================================

export const analyticsConfig: AnalyticsConfig = {
  // Google Analytics 4 Configuration
  googleAnalytics: {
    enabled: ENABLE_ANALYTICS && NODE_ENV === 'production',
    measurementId: GA_MEASUREMENT_ID,
    debug: NODE_ENV === 'development',
    anonymizeIp: true,
    cookieExpires: 63072000, // 2 years in seconds
    siteSpeedSampleRate: 100, // 100% in development, adjust for production
    allowAdFeatures: true,
    allowGoogleSignals: true,
  },

  // Google Tag Manager Configuration
  googleTagManager: {
    enabled: true, // GTM is always enabled as per your setup
    containerId: GTM_CONTAINER_ID,
    auth: GTM_AUTH,
    preview: GTM_PREVIEW,
    dataLayer: 'dataLayer',
    debug: NODE_ENV === 'development',
  },

  // Custom Event Tracking Configuration
  customEvents: {
    enabled: true,
    categories: {
      ecommerce: true,
      userEngagement: true,
      navigation: true,
      forms: true,
      errors: true,
      performance: true,
    },
  },

  // Advanced Tracking Configuration
  tracking: {
    // Page View Tracking
    pageViews: {
      enabled: true,
      includeSearchParams: true,
      excludeParams: ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid'],
    },

    // Outbound Link Tracking
    outboundLinks: {
      enabled: true,
      domains: ['external-partner.com', 'payment-gateway.com'],
    },

    // File Download Tracking
    downloads: {
      enabled: true,
      extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'rar', 'csv'],
    },

    // Scroll Depth Tracking
    scrollDepth: {
      enabled: true,
      thresholds: [25, 50, 75, 100],
    },

    // Video Tracking
    videoTracking: {
      enabled: true,
      providers: ['youtube', 'vimeo', 'html5'],
    },
  },

  // Cookie Consent Configuration
  consent: {
    enabled: true,
    mode: 'opt-in', // GDPR compliant
    categories: {
      analytics: false, // Requires consent
      marketing: false, // Requires consent
      preferences: true, // Usually allowed
      necessary: true, // Always allowed
    },
    cookieDomain: process.env.NEXT_PUBLIC_DOMAIN,
    cookiePath: '/',
    cookieExpires: 365, // Days
  },

  // Performance Monitoring Configuration
  performance: {
    enabled: true,
    sampleRate: NODE_ENV === 'development' ? 100 : 10, // 10% in production
    metrics: {
      FCP: true,
      LCP: true,
      FID: true,
      CLS: true,
      TTFB: true,
    },
  },
};

// ============================================================================
// E-COMMERCE TRACKING CONFIGURATION
// ============================================================================

export const ecommerceConfig = {
  currency: 'INR',
  affiliation: 'Vardhman Mills',
  
  // Enhanced Ecommerce Events
  enhancedEcommerce: {
    productImpressions: true,
    productClicks: true,
    productDetailViews: true,
    addToCart: true,
    removeFromCart: true,
    checkoutSteps: true,
    purchases: true,
    refunds: true,
  },

  // Product List Tracking
  productLists: {
    'Homepage': 'Home Page Products',
    'Category': 'Category Listing',
    'Search': 'Search Results',
    'Related': 'Related Products',
    'Recommendations': 'Recommended Products',
  },

  // Checkout Steps
  checkoutSteps: {
    1: 'Cart Review',
    2: 'Shipping Information',
    3: 'Payment Information',
    4: 'Order Review',
    5: 'Order Confirmation',
  },
};

// ============================================================================
// USER ENGAGEMENT TRACKING
// ============================================================================

export const engagementConfig = {
  // Session Duration Thresholds (in seconds)
  sessionDuration: {
    short: 30,
    medium: 180,
    long: 600,
  },

  // Scroll Depth Tracking
  scrollTracking: {
    enabled: true,
    granular: false, // If true, tracks every 10%
    thresholds: [25, 50, 75, 100],
  },

  // Click Tracking
  clickTracking: {
    buttons: true,
    links: true,
    images: true,
    videos: true,
  },

  // Form Tracking
  formTracking: {
    submissions: true,
    errors: true,
    abandonments: true,
    fieldInteractions: false, // Privacy consideration
  },
};

// ============================================================================
// CUSTOM DIMENSIONS & METRICS
// ============================================================================

export const customDimensions = {
  user_type: 'dimension1', // 'guest', 'registered', 'premium'
  user_id: 'dimension2',
  customer_lifetime_value: 'dimension3',
  user_login_status: 'dimension4',
  cart_value_range: 'dimension5',
  product_category: 'dimension6',
  product_brand: 'dimension7',
  page_type: 'dimension8', // 'home', 'product', 'category', 'cart', 'checkout'
  device_category: 'dimension9',
  session_quality: 'dimension10',
};

export const customMetrics = {
  load_time: 'metric1',
  server_response_time: 'metric2',
  cart_value: 'metric3',
  product_views: 'metric4',
  wishlist_adds: 'metric5',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if analytics is enabled and ready
 */
export const isAnalyticsEnabled = (): boolean => {
  return analyticsConfig.googleAnalytics.enabled || analyticsConfig.googleTagManager.enabled;
};

/**
 * Check if consent is granted for analytics
 */
export const hasAnalyticsConsent = (): boolean => {
  if (!analyticsConfig.consent.enabled) return true;
  
  // Check localStorage for consent
  if (typeof window !== 'undefined') {
    const consent = localStorage.getItem('analytics_consent');
    return consent === 'granted';
  }
  
  return false;
};

/**
 * Get GTM script URL
 */
export const getGTMScriptUrl = (): string => {
  const { containerId, auth, preview } = analyticsConfig.googleTagManager;
  let url = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
  
  if (auth && preview) {
    url += `&gtm_auth=${auth}&gtm_preview=${preview}&gtm_cookies_win=x`;
  }
  
  return url;
};

/**
 * Get GA script URL
 */
export const getGAScriptUrl = (): string => {
  return `https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.googleAnalytics.measurementId}`;
};

/**
 * Initialize dataLayer
 */
export const initDataLayer = (): void => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });
  }
};

/**
 * Push event to dataLayer
 */
export const pushToDataLayer = (data: Record<string, unknown>): void => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(data);
  }
};

/**
 * Track page view
 */
export const trackPageView = (url: string, title?: string): void => {
  if (!hasAnalyticsConsent()) return;

  pushToDataLayer({
    event: 'page_view',
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
  });
};

/**
 * Track custom event
 */
export const trackEvent = (
  eventName: AnalyticsEvent,
  params?: EventParams
): void => {
  if (!hasAnalyticsConsent()) return;

  pushToDataLayer({
    event: eventName,
    ...params,
  });
};

/**
 * Track ecommerce event
 */
export const trackEcommerceEvent = (
  eventName: string,
  ecommerceData: Record<string, unknown>
): void => {
  if (!hasAnalyticsConsent()) return;

  pushToDataLayer({
    event: eventName,
    ecommerce: ecommerceData,
  });
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, unknown>): void => {
  if (!hasAnalyticsConsent()) return;

  pushToDataLayer({
    event: 'set_user_properties',
    user_properties: properties,
  });
};

/**
 * Grant consent
 */
export const grantConsent = (consentTypes: string[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('analytics_consent', 'granted');
    
    const consentObj: Record<string, 'granted'> = {};
    consentTypes.forEach(type => {
      consentObj[type] = 'granted';
    });

    pushToDataLayer({
      event: 'consent_update',
      ...consentObj,
    });
  }
};

/**
 * Revoke consent
 */
export const revokeConsent = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('analytics_consent', 'denied');
    
    pushToDataLayer({
      event: 'consent_update',
      analytics_storage: 'denied',
      ad_storage: 'denied',
    });
  }
};

// ============================================================================
// TYPE AUGMENTATION
// ============================================================================

export interface DataLayerItem {
  event?: string;
  [key: string]: unknown;
}

export type GtagFunction = (...args: Array<string | Date | Record<string, unknown>>) => void;

// Note: Window interface is extended in multiple files
// This declaration merges with existing Window interface declarations
declare global {
  interface Window {
    dataLayer?: DataLayerItem[] | unknown[];
    gtag?: GtagFunction | ((...args: unknown[]) => void);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default analyticsConfig;

export {
  GA_MEASUREMENT_ID,
  GTM_CONTAINER_ID,
  NODE_ENV,
};
