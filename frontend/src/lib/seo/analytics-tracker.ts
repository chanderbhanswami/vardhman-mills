/**
 * Analytics Tracker for Vardhman Mills Frontend
 * Comprehensive analytics and tracking management for SEO
 */

// Analytics configuration interfaces
export interface GoogleAnalyticsConfig {
  trackingId: string;
  customDimensions?: Record<string, string | number>;
  customMetrics?: Record<string, number>;
  anonymizeIp?: boolean;
  allowAdFeatures?: boolean;
  siteSpeedSampleRate?: number;
  sampleRate?: number;
  cookieDomain?: string;
  cookieExpires?: number;
  userId?: string;
}

export interface GoogleTagManagerConfig {
  containerId: string;
  dataLayerName?: string;
  auth?: string;
  preview?: string;
  environment?: string;
  customEvents?: Record<string, unknown>;
}

export interface FacebookPixelConfig {
  pixelId: string;
  advancedMatching?: boolean;
  autoConfig?: boolean;
  debug?: boolean;
}

export interface HotjarConfig {
  siteId: string;
  version?: number;
  debug?: boolean;
}

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, unknown>;
}

export interface EcommerceEvent {
  transactionId: string;
  affiliation?: string;
  revenue: number;
  tax?: number;
  shipping?: number;
  currency?: string;
  items: EcommerceItem[];
}

export interface EcommerceItem {
  sku: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
}

export interface ConversionEvent {
  eventName: string;
  conversionValue?: number;
  currency?: string;
  customParameters?: Record<string, unknown>;
}

export interface AnalyticsConfig {
  googleAnalytics?: GoogleAnalyticsConfig;
  googleTagManager?: GoogleTagManagerConfig;
  facebookPixel?: FacebookPixelConfig;
  hotjar?: HotjarConfig;
  enableConsentMode?: boolean;
  consentTypes?: ('ad_storage' | 'analytics_storage' | 'functionality_storage' | 'personalization_storage' | 'security_storage')[];
  debugMode?: boolean;
}

// Analytics window type
type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
  fbq?: (...args: unknown[]) => void;
  hj?: (...args: unknown[]) => void;
};

// Helper to get typed window
const getAnalyticsWindow = (): AnalyticsWindow => window as AnalyticsWindow;

// Default configuration
export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  enableConsentMode: true,
  consentTypes: ['analytics_storage', 'ad_storage'],
  debugMode: false,
};

/**
 * Analytics Tracker Service
 */
export class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private config: AnalyticsConfig;
  private initialized: boolean = false;
  private consentGiven: boolean = false;

  private constructor(config: AnalyticsConfig = DEFAULT_ANALYTICS_CONFIG) {
    this.config = { ...DEFAULT_ANALYTICS_CONFIG, ...config };
  }

  static getInstance(config?: AnalyticsConfig): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker(config);
    }
    return AnalyticsTracker.instance;
  }

  /**
   * Initialize analytics tracking
   */
  initialize(): void {
    if (this.initialized) return;

    // Initialize Google Analytics
    if (this.config.googleAnalytics) {
      this.initializeGoogleAnalytics();
    }

    // Initialize Google Tag Manager
    if (this.config.googleTagManager) {
      this.initializeGoogleTagManager();
    }

    // Initialize Facebook Pixel
    if (this.config.facebookPixel) {
      this.initializeFacebookPixel();
    }

    // Initialize Hotjar
    if (this.config.hotjar) {
      this.initializeHotjar();
    }

    // Set up consent mode
    if (this.config.enableConsentMode) {
      this.initializeConsentMode();
    }

    this.initialized = true;
  }

  /**
   * Track page view
   */
  trackPageView(url?: string, title?: string): void {
    if (!this.initialized || !this.consentGiven) return;
    
    const win = getAnalyticsWindow();
    const pageData = {
      page_location: url || window.location.href,
      page_title: title || document.title,
      page_path: window.location.pathname,
    };

    // Google Analytics
    if (this.config.googleAnalytics && win.gtag) {
      win.gtag('config', this.config.googleAnalytics.trackingId, pageData);
    }

    // Google Tag Manager
    if (this.config.googleTagManager && win.dataLayer) {
      win.dataLayer.push({
        event: 'page_view',
        ...pageData,
      });
    }

    // Facebook Pixel
    if (this.config.facebookPixel && win.fbq) {
      win.fbq('track', 'PageView');
    }
  }

  /**
   * Track custom event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized || !this.consentGiven) return;

    const win = getAnalyticsWindow();

    // Google Analytics
    if (this.config.googleAnalytics && win.gtag) {
      win.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.customParameters,
      });
    }

    // Google Tag Manager
    if (this.config.googleTagManager && win.dataLayer) {
      win.dataLayer.push({
        event: 'custom_event',
        event_action: event.action,
        event_category: event.category,
        event_label: event.label,
        event_value: event.value,
        ...event.customParameters,
      });
    }

    // Facebook Pixel
    if (this.config.facebookPixel && win.fbq) {
      win.fbq('trackCustom', event.action, event.customParameters);
    }
  }

  /**
   * Track ecommerce event
   */
  trackEcommerce(event: EcommerceEvent): void {
    if (!this.initialized || !this.consentGiven) return;

    const win = getAnalyticsWindow();

    // Google Analytics Enhanced Ecommerce
    if (this.config.googleAnalytics && win.gtag) {
      win.gtag('event', 'purchase', {
        transaction_id: event.transactionId,
        affiliation: event.affiliation,
        value: event.revenue,
        currency: event.currency || 'INR',
        tax: event.tax,
        shipping: event.shipping,
        items: event.items.map(item => ({
          item_id: item.sku,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity,
        })),
      });
    }

    // Google Tag Manager
    if (this.config.googleTagManager && win.dataLayer) {
      win.dataLayer.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: event.transactionId,
          affiliation: event.affiliation,
          value: event.revenue,
          currency: event.currency || 'INR',
          items: event.items,
        },
      });
    }

    // Facebook Pixel
    if (this.config.facebookPixel && win.fbq) {
      win.fbq('track', 'Purchase', {
        value: event.revenue,
        currency: event.currency || 'INR',
        content_ids: event.items.map(item => item.sku),
        content_type: 'product',
      });
    }
  }

  /**
   * Track conversion
   */
  trackConversion(conversion: ConversionEvent): void {
    if (!this.initialized || !this.consentGiven) return;

    const win = getAnalyticsWindow();

    // Google Analytics
    if (this.config.googleAnalytics && win.gtag) {
      win.gtag('event', 'conversion', {
        send_to: this.config.googleAnalytics.trackingId,
        value: conversion.conversionValue,
        currency: conversion.currency || 'INR',
        ...conversion.customParameters,
      });
    }

    // Google Tag Manager
    if (this.config.googleTagManager && win.dataLayer) {
      win.dataLayer.push({
        event: 'conversion',
        conversion_name: conversion.eventName,
        conversion_value: conversion.conversionValue,
        conversion_currency: conversion.currency || 'INR',
        ...conversion.customParameters,
      });
    }
  }

  /**
   * Set user consent
   */
  setConsent(consent: Record<string, 'granted' | 'denied'>): void {
    this.consentGiven = Object.values(consent).some(value => value === 'granted');

    const win = getAnalyticsWindow();
    if (this.config.enableConsentMode && win.gtag) {
      win.gtag('consent', 'update', consent);
    }

    if (this.consentGiven && !this.initialized) {
      this.initialize();
    }
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    const win = getAnalyticsWindow();
    
    if (this.config.googleAnalytics && win.gtag) {
      win.gtag('config', this.config.googleAnalytics.trackingId, {
        user_id: userId,
      });
    }

    if (this.config.googleTagManager && win.dataLayer) {
      win.dataLayer.push({
        event: 'set_user_id',
        user_id: userId,
      });
    }
  }

  /**
   * Private initialization methods
   */
  private initializeGoogleAnalytics(): void {
    const config = this.config.googleAnalytics!;
    const win = getAnalyticsWindow();
    
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.trackingId}`;
    document.head.appendChild(script);

    // Initialize gtag
    win.dataLayer = win.dataLayer || [];
    win.gtag = function(...args: unknown[]) {
      win.dataLayer?.push(args);
    };

    win.gtag('js', new Date());
    win.gtag('config', config.trackingId, {
      anonymize_ip: config.anonymizeIp,
      allow_google_signals: config.allowAdFeatures,
      site_speed_sample_rate: config.siteSpeedSampleRate,
      sample_rate: config.sampleRate,
      cookie_domain: config.cookieDomain,
      cookie_expires: config.cookieExpires,
      user_id: config.userId,
      custom_map: config.customDimensions,
    });
  }

  private initializeGoogleTagManager(): void {
    const config = this.config.googleTagManager!;

    const win = getAnalyticsWindow();
    
    // Initialize dataLayer
    win.dataLayer = win.dataLayer || [];

    // Load GTM script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','${config.dataLayerName || 'dataLayer'}','${config.containerId}');
    `;
    document.head.appendChild(script);

    // Add noscript fallback
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${config.containerId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.appendChild(noscript);
  }

  private initializeFacebookPixel(): void {
    const config = this.config.facebookPixel!;

    // Load Facebook Pixel script
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window,document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
    `;
    document.head.appendChild(script);

    const win = getAnalyticsWindow();
    
    // Initialize pixel
    if (win.fbq) {
      win.fbq('init', config.pixelId, {
        em: config.advancedMatching ? 'email@example.com' : undefined,
      });

      if (config.debug) {
        win.fbq('set', 'debug', true);
      }
    }
  }

  private initializeHotjar(): void {
    const config = this.config.hotjar!;

    // Load Hotjar script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${config.siteId},hjsv:${config.version || 6}};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    `;
    document.head.appendChild(script);
  }

  private initializeConsentMode(): void {
    const win = getAnalyticsWindow();
    if (!win.gtag) return;

    // Set default consent state
    const defaultConsent: Record<string, 'granted' | 'denied'> = {};
    this.config.consentTypes?.forEach(type => {
      defaultConsent[type] = 'denied';
    });

    win.gtag('consent', 'default', defaultConsent);
  }
}



// Utility functions
export const AnalyticsUtils = {
  /**
   * Generate tracking parameters for URLs
   */
  generateTrackingParams: (
    source: string,
    medium: string,
    campaign: string,
    term?: string,
    content?: string
  ): string => {
    const params = new URLSearchParams({
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign,
    });

    if (term) params.set('utm_term', term);
    if (content) params.set('utm_content', content);

    return params.toString();
  },

  /**
   * Track form submission
   */
  trackFormSubmission: (formName: string, success: boolean = true): void => {
    analyticsTracker.trackEvent({
      action: success ? 'form_submit_success' : 'form_submit_error',
      category: 'form',
      label: formName,
      value: success ? 1 : 0,
    });
  },

  /**
   * Track file download
   */
  trackDownload: (fileName: string, fileType: string): void => {
    analyticsTracker.trackEvent({
      action: 'file_download',
      category: 'engagement',
      label: fileName,
      customParameters: {
        file_type: fileType,
      },
    });
  },

  /**
   * Track video interaction
   */
  trackVideo: (action: 'play' | 'pause' | 'complete', videoTitle: string, progress?: number): void => {
    analyticsTracker.trackEvent({
      action: `video_${action}`,
      category: 'video',
      label: videoTitle,
      value: progress,
    });
  },

  /**
   * Track scroll depth
   */
  trackScrollDepth: (percentage: number): void => {
    analyticsTracker.trackEvent({
      action: 'scroll_depth',
      category: 'engagement',
      label: `${percentage}%`,
      value: percentage,
    });
  },

  /**
   * Track search
   */
  trackSearch: (searchTerm: string, resultsCount: number): void => {
    analyticsTracker.trackEvent({
      action: 'search',
      category: 'engagement',
      label: searchTerm,
      value: resultsCount,
    });
  },

  /**
   * Track product interaction
   */
  trackProductView: (productId: string, productName: string, category?: string, price?: number): void => {
    analyticsTracker.trackEvent({
      action: 'view_item',
      category: 'ecommerce',
      label: productName,
      customParameters: {
        item_id: productId,
        item_name: productName,
        item_category: category,
        price: price,
        currency: 'INR',
      },
    });
  },

  /**
   * Track add to cart
   */
  trackAddToCart: (productId: string, productName: string, quantity: number = 1, price?: number): void => {
    analyticsTracker.trackEvent({
      action: 'add_to_cart',
      category: 'ecommerce',
      label: productName,
      value: price ? price * quantity : undefined,
      customParameters: {
        item_id: productId,
        item_name: productName,
        quantity: quantity,
        price: price,
        currency: 'INR',
      },
    });
  },
};

// Export singleton instance
export const analyticsTracker = AnalyticsTracker.getInstance();

export default AnalyticsTracker;