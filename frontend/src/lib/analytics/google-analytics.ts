/**
 * Google Analytics 4 (GA4) Integration for Vardhman Mills
 * Comprehensive tracking implementation with gtag
 */

// Configuration
const GA_CONFIG = {
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
  debug: process.env.NODE_ENV === 'development',
};

// Types for GA4 events
export interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, string | number | boolean>;
}

export interface GAEcommerceItem {
  item_id: string;
  item_name: string;
  affiliation?: string;
  coupon?: string;
  currency?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price?: number;
  quantity?: number;
}

export interface GAEcommerceEvent {
  currency: string;
  value: number;
  items: GAEcommerceItem[];
  transaction_id?: string;
  affiliation?: string;
  coupon?: string;
  shipping?: number;
  tax?: number;
}

export interface GAUserProperties {
  user_id?: string;
  customer_type?: 'new' | 'returning' | 'vip';
  membership_level?: string;
  preferred_language?: string;
  location?: string;
  age_group?: string;
  gender?: string;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

class GoogleAnalytics {
  private isInitialized = false;
  private measurementId: string;
  private debug: boolean;
  private queue: Array<() => void> = [];

  constructor(measurementId: string, debug = false) {
    this.measurementId = measurementId;
    this.debug = debug;
  }

  /**
   * Initialize Google Analytics
   */
  async init(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Load gtag script
      await this.loadGtagScript();

      // Configure gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };

      // Initialize GA4
      window.gtag?.('js', new Date());
      window.gtag?.('config', this.measurementId, {
        debug_mode: this.debug,
        send_page_view: false, // We'll handle page views manually
        cookie_flags: 'SameSite=None;Secure',
        anonymize_ip: true,
        allow_google_signals: true,
        allow_ad_personalization_signals: false,
      });

      this.isInitialized = true;

      // Process queued events
      this.processQueue();

      if (this.debug) {
        console.log('Google Analytics initialized:', this.measurementId);
      }
    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
    }
  }

  /**
   * Load Google Analytics script
   */
  private async loadGtagScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Process queued events
   */
  private processQueue(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) event();
    }
  }

  /**
   * Execute gtag command or queue it
   */
  private executeOrQueue(fn: () => void): void {
    if (this.isInitialized && window.gtag) {
      fn();
    } else {
      this.queue.push(fn);
    }
  }

  /**
   * Safe gtag wrapper
   */
  private gtag(...args: unknown[]): void {
    if (window.gtag) {
      window.gtag(...args);
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: GAUserProperties): void {
    this.executeOrQueue(() => {
      this.gtag('config', this.measurementId, {
        user_id: properties.user_id,
        custom_map: {
          customer_type: properties.customer_type,
          membership_level: properties.membership_level,
          preferred_language: properties.preferred_language,
          location: properties.location,
          age_group: properties.age_group,
          gender: properties.gender,
        },
      });

      if (this.debug) {
        console.log('GA: User properties set', properties);
      }
    });
  }

  /**
   * Track page view
   */
  trackPageView(page_title: string, page_location?: string): void {
    this.executeOrQueue(() => {
      this.gtag('event', 'page_view', {
        page_title,
        page_location: page_location || window.location.href,
        page_referrer: document.referrer,
      });

      if (this.debug) {
        console.log('GA: Page view tracked', { page_title, page_location });
      }
    });
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, parameters: Record<string, string | number | boolean> = {}): void {
    this.executeOrQueue(() => {
      this.gtag('event', eventName, {
        event_category: parameters.category || 'engagement',
        event_label: parameters.label,
        value: parameters.value,
        ...parameters,
      });

      if (this.debug) {
        console.log('GA: Event tracked', { eventName, parameters });
      }
    });
  }

  /**
   * Track search
   */
  trackSearch(searchTerm: string, category?: string): void {
    this.trackEvent('search', {
      category: 'engagement',
      label: searchTerm,
      search_term: searchTerm,
      ...(category && { search_category: category }),
    });
  }

  /**
   * Track user engagement
   */
  trackEngagement(engagementType: string, value?: number): void {
    this.trackEvent('engagement', {
      category: 'user_engagement',
      label: engagementType,
      ...(value !== undefined && { value }),
      engagement_type: engagementType,
    });
  }

  // E-commerce Events

  /**
   * Track item view
   */
  trackItemView(item: GAEcommerceItem): void {
    this.executeOrQueue(() => {
      this.gtag('event', 'view_item', {
        currency: 'INR',
        value: item.price || 0,
        items: [item],
      });

      if (this.debug) {
        console.log('GA: Item view tracked', item);
      }
    });
  }

  /**
   * Track item list view
   */
  trackItemListView(items: GAEcommerceItem[], listName: string): void {
    this.executeOrQueue(() => {
      this.gtag('event', 'view_item_list', {
        item_list_id: listName.toLowerCase().replace(/\s+/g, '_'),
        item_list_name: listName,
        items: items.slice(0, 10), // GA4 limit
      });

      if (this.debug) {
        console.log('GA: Item list view tracked', { listName, itemCount: items.length });
      }
    });
  }

  /**
   * Track add to cart
   */
  trackAddToCart(item: GAEcommerceItem): void {
    this.executeOrQueue(() => {
      this.gtag('event', 'add_to_cart', {
        currency: 'INR',
        value: (item.price || 0) * (item.quantity || 1),
        items: [item],
      });

      if (this.debug) {
        console.log('GA: Add to cart tracked', item);
      }
    });
  }

  /**
   * Track remove from cart
   */
  trackRemoveFromCart(item: GAEcommerceItem): void {
    this.executeOrQueue(() => {
      this.gtag('event', 'remove_from_cart', {
        currency: 'INR',
        value: (item.price || 0) * (item.quantity || 1),
        items: [item],
      });

      if (this.debug) {
        console.log('GA: Remove from cart tracked', item);
      }
    });
  }

  /**
   * Track cart view
   */
  trackViewCart(items: GAEcommerceItem[], totalValue: number): void {
    this.executeOrQueue(() => {
      this.gtag('event', 'view_cart', {
        currency: 'INR',
        value: totalValue,
        items,
      });

      if (this.debug) {
        console.log('GA: Cart view tracked', { itemCount: items.length, totalValue });
      }
    });
  }

  /**
   * Track begin checkout
   */
  trackBeginCheckout(items: GAEcommerceItem[], totalValue: number): void {
    this.executeOrQueue(() => {
      this.gtag('event', 'begin_checkout', {
        currency: 'INR',
        value: totalValue,
        items,
      });

      if (this.debug) {
        console.log('GA: Begin checkout tracked', { itemCount: items.length, totalValue });
      }
    });
  }

  /**
   * Track add payment info
   */
  trackAddPaymentInfo(paymentType: string, items: GAEcommerceItem[], totalValue: number): void {
    this.executeOrQueue(() => {
      this.gtag('event', 'add_payment_info', {
        currency: 'INR',
        value: totalValue,
        payment_type: paymentType,
        items,
      });

      if (this.debug) {
        console.log('GA: Add payment info tracked', { paymentType, totalValue });
      }
    });
  }

  /**
   * Track purchase
   */
  trackPurchase(ecommerce: GAEcommerceEvent): void {
    this.executeOrQueue(() => {
      this.gtag('event', 'purchase', {
        transaction_id: ecommerce.transaction_id,
        value: ecommerce.value,
        currency: ecommerce.currency,
        affiliation: ecommerce.affiliation || 'Vardhman Mills',
        coupon: ecommerce.coupon,
        shipping: ecommerce.shipping,
        tax: ecommerce.tax,
        items: ecommerce.items,
      });

      if (this.debug) {
        console.log('GA: Purchase tracked', ecommerce);
      }
    });
  }

  /**
   * Track refund
   */
  trackRefund(transactionId: string, value?: number, items?: GAEcommerceItem[]): void {
    this.executeOrQueue(() => {
      this.gtag('event', 'refund', {
        transaction_id: transactionId,
        value,
        currency: 'INR',
        items,
      });

      if (this.debug) {
        console.log('GA: Refund tracked', { transactionId, value });
      }
    });
  }

  // Custom Business Events

  /**
   * Track newsletter signup
   */
  trackNewsletterSignup(method: string): void {
    this.trackEvent('sign_up', {
      category: 'engagement',
      label: 'newsletter',
      method,
    });
  }

  /**
   * Track contact form submission
   */
  trackContactForm(formType: string): void {
    this.trackEvent('contact', {
      category: 'engagement',
      label: formType,
      form_type: formType,
    });
  }

  /**
   * Track catalog download
   */
  trackCatalogDownload(catalogType: string): void {
    this.trackEvent('file_download', {
      category: 'engagement',
      label: catalogType,
      file_type: 'catalog',
      catalog_type: catalogType,
    });
  }

  /**
   * Track social share
   */
  trackSocialShare(platform: string, contentType: string, contentId?: string): void {
    this.trackEvent('share', {
      category: 'engagement',
      label: platform,
      method: platform,
      content_type: contentType,
      ...(contentId && { content_id: contentId }),
    });
  }

  /**
   * Track video interaction
   */
  trackVideoPlay(videoTitle: string, videoDuration?: number): void {
    this.trackEvent('video_start', {
      category: 'engagement',
      label: videoTitle,
      video_title: videoTitle,
      ...(videoDuration !== undefined && { video_duration: videoDuration }),
    });
  }

  /**
   * Track user registration
   */
  trackUserRegistration(method: string): void {
    this.trackEvent('sign_up', {
      category: 'user',
      label: method,
      method,
    });
  }

  /**
   * Track user login
   */
  trackUserLogin(method: string): void {
    this.trackEvent('login', {
      category: 'user',
      label: method,
      method,
    });
  }

  /**
   * Set user ID for cross-device tracking
   */
  setUserId(userId: string): void {
    this.executeOrQueue(() => {
      this.gtag('config', this.measurementId, {
        user_id: userId,
      });

      if (this.debug) {
        console.log('GA: User ID set', userId);
      }
    });
  }

  /**
   * Track custom conversion
   */
  trackConversion(conversionName: string, value?: number, currency = 'INR'): void {
    this.executeOrQueue(() => {
      this.gtag('event', 'conversion', {
        send_to: `${this.measurementId}/${conversionName}`,
        value,
        currency,
      });

      if (this.debug) {
        console.log('GA: Conversion tracked', { conversionName, value });
      }
    });
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debug = enabled;
    if (this.isInitialized) {
      this.gtag('config', this.measurementId, {
        debug_mode: enabled,
      });
    }
  }
}

// Create singleton instance
export const googleAnalytics = new GoogleAnalytics(
  GA_CONFIG.measurementId,
  GA_CONFIG.debug
);

// Auto-initialize if measurement ID is available
if (typeof window !== 'undefined' && GA_CONFIG.measurementId !== 'G-XXXXXXXXXX') {
  googleAnalytics.init().catch(console.error);
}

export default googleAnalytics;
