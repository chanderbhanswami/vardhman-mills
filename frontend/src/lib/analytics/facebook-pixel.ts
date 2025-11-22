/**
 * Facebook Pixel Integration for Vardhman Mills
 * Comprehensive tracking implementation with Meta Pixel
 */

// Configuration
const FB_CONFIG = {
  pixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || '',
  debug: process.env.NODE_ENV === 'development',
};

// Types for Facebook Pixel events
export interface FBEvent {
  eventName: string;
  parameters?: Record<string, string | number | boolean>;
}

export interface FBEcommerceItem {
  content_id: string;
  content_name: string;
  content_type?: string;
  content_category?: string;
  brand?: string;
  value?: number;
  currency?: string;
  quantity?: number;
}

export interface FBEcommerceEvent {
  content_ids: string[];
  content_type: string;
  currency: string;
  value: number;
  contents?: FBEcommerceItem[];
  num_items?: number;
}

export interface FBUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

interface FBQueue {
  callMethod?: (...args: unknown[]) => void;
  push?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
  queue?: unknown[][];
}

declare global {
  interface Window {
    fbq?: FBQueue & ((...args: unknown[]) => void);
    _fbq?: FBQueue & ((...args: unknown[]) => void);
  }
}

class FacebookPixel {
  private isInitialized = false;
  private pixelId: string;
  private debug: boolean;
  private queue: Array<() => void> = [];

  constructor(pixelId: string, debug = false) {
    this.pixelId = pixelId;
    this.debug = debug;
  }

  /**
   * Initialize Facebook Pixel
   */
  async init(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined' || !this.pixelId) return;

    try {
      // Load Facebook Pixel script
      this.loadPixelScript();

      // Initialize fbq
      window.fbq = window.fbq || function(...args: unknown[]) {
        if (window.fbq?.callMethod) {
          window.fbq.callMethod(...args);
        } else {
          window.fbq?.queue?.push(args);
        }
      };

      if (!window._fbq) window._fbq = window.fbq;
      
      const fbq = window.fbq as FBQueue & ((...args: unknown[]) => void);
      fbq.push = window.fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];

      // Initialize pixel
      this.fbq('init', this.pixelId);

      this.isInitialized = true;

      // Process queued events
      this.processQueue();

      if (this.debug) {
        console.log('Facebook Pixel initialized:', this.pixelId);
      }
    } catch (error) {
      console.error('Failed to initialize Facebook Pixel:', error);
    }
  }

  /**
   * Load Facebook Pixel script
   */
  private loadPixelScript(): void {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    // Add noscript image
    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${this.pixelId}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    document.head.appendChild(noscript);
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
   * Execute fbq command or queue it
   */
  private executeOrQueue(fn: () => void): void {
    if (this.isInitialized && window.fbq) {
      fn();
    } else {
      this.queue.push(fn);
    }
  }

  /**
   * Safe fbq wrapper
   */
  private fbq(...args: unknown[]): void {
    if (window.fbq) {
      window.fbq(...args);
    }
  }

  /**
   * Track page view
   */
  trackPageView(): void {
    this.executeOrQueue(() => {
      this.fbq('track', 'PageView');

      if (this.debug) {
        console.log('FB: Page view tracked');
      }
    });
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, parameters: Record<string, string | number | boolean> = {}): void {
    this.executeOrQueue(() => {
      this.fbq('track', eventName, parameters);

      if (this.debug) {
        console.log('FB: Event tracked', { eventName, parameters });
      }
    });
  }

  /**
   * Track custom event (non-standard)
   */
  trackCustomEvent(eventName: string, parameters: Record<string, string | number | boolean> = {}): void {
    this.executeOrQueue(() => {
      this.fbq('trackCustom', eventName, parameters);

      if (this.debug) {
        console.log('FB: Custom event tracked', { eventName, parameters });
      }
    });
  }

  /**
   * Set user data for enhanced matching
   */
  setUserData(userData: FBUserData): void {
    this.executeOrQueue(() => {
      const hashedData: Record<string, string> = {};

      // Hash sensitive data (in production, hash on server-side)
      if (userData.email) {
        hashedData.em = userData.email.toLowerCase().trim();
      }
      if (userData.phone) {
        hashedData.ph = userData.phone.replace(/\D/g, '');
      }
      if (userData.firstName) {
        hashedData.fn = userData.firstName.toLowerCase().trim();
      }
      if (userData.lastName) {
        hashedData.ln = userData.lastName.toLowerCase().trim();
      }
      if (userData.city) {
        hashedData.ct = userData.city.toLowerCase().trim();
      }
      if (userData.state) {
        hashedData.st = userData.state.toLowerCase().trim();
      }
      if (userData.country) {
        hashedData.country = userData.country.toLowerCase().trim();
      }
      if (userData.zipCode) {
        hashedData.zp = userData.zipCode.trim();
      }
      if (userData.dateOfBirth) {
        hashedData.db = userData.dateOfBirth;
      }

      this.fbq('init', this.pixelId, hashedData);

      if (this.debug) {
        console.log('FB: User data set', Object.keys(hashedData));
      }
    });
  }

  // E-commerce Events

  /**
   * Track view content
   */
  trackViewContent(item: FBEcommerceItem): void {
    this.executeOrQueue(() => {
      this.fbq('track', 'ViewContent', {
        content_ids: [item.content_id],
        content_type: item.content_type || 'product',
        content_name: item.content_name,
        content_category: item.content_category,
        value: item.value || 0,
        currency: item.currency || 'INR',
      });

      if (this.debug) {
        console.log('FB: View content tracked', item);
      }
    });
  }

  /**
   * Track search
   */
  trackSearch(searchString: string, contentCategory?: string): void {
    this.executeOrQueue(() => {
      this.fbq('track', 'Search', {
        search_string: searchString,
        content_category: contentCategory,
      });

      if (this.debug) {
        console.log('FB: Search tracked', { searchString, contentCategory });
      }
    });
  }

  /**
   * Track add to cart
   */
  trackAddToCart(item: FBEcommerceItem): void {
    this.executeOrQueue(() => {
      this.fbq('track', 'AddToCart', {
        content_ids: [item.content_id],
        content_type: item.content_type || 'product',
        content_name: item.content_name,
        content_category: item.content_category,
        value: (item.value || 0) * (item.quantity || 1),
        currency: item.currency || 'INR',
        contents: [item],
      });

      if (this.debug) {
        console.log('FB: Add to cart tracked', item);
      }
    });
  }

  /**
   * Track add to wishlist
   */
  trackAddToWishlist(item: FBEcommerceItem): void {
    this.executeOrQueue(() => {
      this.fbq('track', 'AddToWishlist', {
        content_ids: [item.content_id],
        content_type: item.content_type || 'product',
        content_name: item.content_name,
        content_category: item.content_category,
        value: item.value || 0,
        currency: item.currency || 'INR',
      });

      if (this.debug) {
        console.log('FB: Add to wishlist tracked', item);
      }
    });
  }

  /**
   * Track initiate checkout
   */
  trackInitiateCheckout(ecommerce: FBEcommerceEvent): void {
    this.executeOrQueue(() => {
      this.fbq('track', 'InitiateCheckout', {
        content_ids: ecommerce.content_ids,
        content_type: ecommerce.content_type,
        value: ecommerce.value,
        currency: ecommerce.currency,
        num_items: ecommerce.num_items,
        contents: ecommerce.contents,
      });

      if (this.debug) {
        console.log('FB: Initiate checkout tracked', ecommerce);
      }
    });
  }

  /**
   * Track add payment info
   */
  trackAddPaymentInfo(ecommerce: FBEcommerceEvent): void {
    this.executeOrQueue(() => {
      this.fbq('track', 'AddPaymentInfo', {
        content_ids: ecommerce.content_ids,
        content_type: ecommerce.content_type,
        value: ecommerce.value,
        currency: ecommerce.currency,
        contents: ecommerce.contents,
      });

      if (this.debug) {
        console.log('FB: Add payment info tracked', ecommerce);
      }
    });
  }

  /**
   * Track purchase
   */
  trackPurchase(ecommerce: FBEcommerceEvent): void {
    this.executeOrQueue(() => {
      this.fbq('track', 'Purchase', {
        content_ids: ecommerce.content_ids,
        content_type: ecommerce.content_type,
        value: ecommerce.value,
        currency: ecommerce.currency,
        num_items: ecommerce.num_items,
        contents: ecommerce.contents,
      });

      if (this.debug) {
        console.log('FB: Purchase tracked', ecommerce);
      }
    });
  }

  // Lead Events

  /**
   * Track lead
   */
  trackLead(value?: number, currency = 'INR', contentName?: string): void {
    this.executeOrQueue(() => {
      this.fbq('track', 'Lead', {
        value,
        currency,
        content_name: contentName,
      });

      if (this.debug) {
        console.log('FB: Lead tracked', { value, currency, contentName });
      }
    });
  }

  /**
   * Track complete registration
   */
  trackCompleteRegistration(status: string, contentName?: string): void {
    this.executeOrQueue(() => {
      this.fbq('track', 'CompleteRegistration', {
        status,
        content_name: contentName,
      });

      if (this.debug) {
        console.log('FB: Complete registration tracked', { status, contentName });
      }
    });
  }

  /**
   * Track contact
   */
  trackContact(method?: string): void {
    this.executeOrQueue(() => {
      this.fbq('track', 'Contact', {
        method,
      });

      if (this.debug) {
        console.log('FB: Contact tracked', { method });
      }
    });
  }

  /**
   * Track subscribe
   */
  trackSubscribe(value?: number, currency = 'INR', predictionCategory?: string): void {
    this.executeOrQueue(() => {
      this.fbq('track', 'Subscribe', {
        value,
        currency,
        predicted_ltv: predictionCategory,
      });

      if (this.debug) {
        console.log('FB: Subscribe tracked', { value, currency, predictionCategory });
      }
    });
  }

  // Custom Business Events

  /**
   * Track catalog view
   */
  trackViewCatalog(catalogName: string): void {
    this.trackCustomEvent('ViewCatalog', {
      catalog_name: catalogName,
      content_type: 'catalog',
    });
  }

  /**
   * Track sample request
   */
  trackRequestSample(productId: string, productName: string): void {
    this.trackCustomEvent('RequestSample', {
      content_id: productId,
      content_name: productName,
      content_type: 'product',
    });
  }

  /**
   * Track quote request
   */
  trackRequestQuote(productIds: string[], totalValue?: number): void {
    this.trackCustomEvent('RequestQuote', {
      content_ids: productIds.join(','),
      content_type: 'product',
      value: totalValue || 0,
      currency: 'INR',
      num_items: productIds.length,
    });
  }

  /**
   * Track bulk inquiry
   */
  trackBulkInquiry(category: string, quantity?: number): void {
    this.trackCustomEvent('BulkInquiry', {
      content_category: category,
      quantity: quantity || 0,
      inquiry_type: 'bulk',
    });
  }

  /**
   * Track download
   */
  trackDownload(fileName: string, fileType: string): void {
    this.trackCustomEvent('Download', {
      content_name: fileName,
      content_type: fileType,
      download_type: fileType,
    });
  }

  /**
   * Track video view
   */
  trackVideoView(videoTitle: string, duration?: number): void {
    this.trackEvent('ViewContent', {
      content_type: 'video',
      content_name: videoTitle,
      video_duration: duration || 0,
    });
  }

  /**
   * Track store locator usage
   */
  trackFindLocation(location: string): void {
    this.trackCustomEvent('FindLocation', {
      location,
      search_type: 'store_locator',
    });
  }

  /**
   * Track social share
   */
  trackShare(contentType: string, contentId?: string): void {
    this.trackCustomEvent('Share', {
      content_type: contentType,
      content_id: contentId || '',
    });
  }

  /**
   * Track review submission
   */
  trackSubmitReview(productId: string, rating: number): void {
    this.trackCustomEvent('SubmitReview', {
      content_id: productId,
      content_type: 'product',
      rating,
    });
  }

  /**
   * Track newsletter signup
   */
  trackNewsletterSignup(source: string): void {
    this.trackSubscribe(0, 'INR', source);
  }

  /**
   * Track form submission
   */
  trackFormSubmission(formName: string, formType: string): void {
    this.trackCustomEvent('SubmitForm', {
      form_name: formName,
      form_type: formType,
    });
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debug = enabled;
  }

  /**
   * Consent management
   */
  grantConsent(): void {
    this.executeOrQueue(() => {
      this.fbq('consent', 'grant');

      if (this.debug) {
        console.log('FB: Consent granted');
      }
    });
  }

  /**
   * Revoke consent
   */
  revokeConsent(): void {
    this.executeOrQueue(() => {
      this.fbq('consent', 'revoke');

      if (this.debug) {
        console.log('FB: Consent revoked');
      }
    });
  }

  /**
   * Get pixel ID
   */
  getPixelId(): string {
    return this.pixelId;
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Create singleton instance
export const facebookPixel = new FacebookPixel(
  FB_CONFIG.pixelId,
  FB_CONFIG.debug
);

// Auto-initialize if pixel ID is available
if (typeof window !== 'undefined' && FB_CONFIG.pixelId) {
  facebookPixel.init().catch(console.error);
}

export default facebookPixel;
