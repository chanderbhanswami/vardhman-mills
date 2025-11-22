/**
 * Event Tracking Utilities for Vardhman Mills
 * Centralized event tracking with multiple analytics providers
 */

import { googleAnalytics } from './google-analytics';
import { facebookPixel } from './facebook-pixel';

// Configuration
const TRACKING_CONFIG = {
  enableGA: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? true : false,
  enableFB: process.env.NEXT_PUBLIC_FB_PIXEL_ID ? true : false,
  debug: process.env.NODE_ENV === 'development',
};

// Event Types
export interface TrackingEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, string | number | boolean>;
}

export interface EcommerceTrackingItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_brand?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
  currency?: string;
  index?: number;
  discount?: number;
  affiliation?: string;
  coupon?: string;
  creative_name?: string;
  creative_slot?: string;
  location_id?: string;
  promotion_id?: string;
  promotion_name?: string;
}

export interface EcommerceTrackingEvent {
  transaction_id?: string;
  value: number;
  currency: string;
  items: EcommerceTrackingItem[];
  coupon?: string;
  shipping?: number;
  tax?: number;
  affiliation?: string;
}

export interface UserProperties {
  user_id?: string;
  customer_id?: string;
  user_type?: 'guest' | 'registered' | 'premium';
  membership_level?: string;
  total_orders?: number;
  total_value?: number;
  registration_date?: string;
  last_login?: string;
  preferred_language?: string;
}

// Event Categories
const EVENT_CATEGORIES = {
  ECOMMERCE: 'ecommerce',
  ENGAGEMENT: 'engagement',
  NAVIGATION: 'navigation',
  FORM: 'form',
  DOWNLOAD: 'download',
  VIDEO: 'video',
  SOCIAL: 'social',
  SEARCH: 'search',
  ERROR: 'error',
  PERFORMANCE: 'performance',
  BUSINESS: 'business',
} as const;

// Event Actions
const EVENT_ACTIONS = {
  // E-commerce
  VIEW_ITEM: 'view_item',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  VIEW_CART: 'view_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  ADD_PAYMENT_INFO: 'add_payment_info',
  PURCHASE: 'purchase',
  REFUND: 'refund',
  
  // Engagement
  CLICK: 'click',
  SCROLL: 'scroll',
  TIME_ON_PAGE: 'time_on_page',
  BOUNCE: 'bounce',
  
  // Navigation
  PAGE_VIEW: 'page_view',
  NAVIGATE: 'navigate',
  BACK_BUTTON: 'back_button',
  
  // Forms
  FORM_START: 'form_start',
  FORM_SUBMIT: 'form_submit',
  FORM_ERROR: 'form_error',
  
  // Downloads
  DOWNLOAD_START: 'download_start',
  DOWNLOAD_COMPLETE: 'download_complete',
  
  // Video
  VIDEO_PLAY: 'video_play',
  VIDEO_PAUSE: 'video_pause',
  VIDEO_COMPLETE: 'video_complete',
  
  // Social
  SHARE: 'share',
  LIKE: 'like',
  COMMENT: 'comment',
  
  // Search
  SEARCH: 'search',
  SEARCH_RESULTS: 'search_results',
  
  // Business specific
  REQUEST_QUOTE: 'request_quote',
  REQUEST_SAMPLE: 'request_sample',
  VIEW_CATALOG: 'view_catalog',
  CONTACT_INQUIRY: 'contact_inquiry',
} as const;

class EventTracker {
  private debug: boolean;
  private enableGA: boolean;
  private enableFB: boolean;

  constructor(config: typeof TRACKING_CONFIG) {
    this.debug = config.debug;
    this.enableGA = config.enableGA;
    this.enableFB = config.enableFB;
  }

  /**
   * Track a generic event across all enabled platforms
   */
  track(event: TrackingEvent): void {
    try {
      if (this.debug) {
        console.log('EventTracker: Tracking event', event);
      }

      // Track with Google Analytics
      if (this.enableGA) {
        googleAnalytics.trackEvent(
          event.action,
          {
            event_category: event.category,
            ...(event.label && { event_label: event.label }),
            ...(event.value !== undefined && { value: event.value }),
            ...event.customParameters,
          }
        );
      }

      // Track with Facebook Pixel
      if (this.enableFB) {
        facebookPixel.trackEvent(event.action, {
          category: event.category,
          label: event.label || '',
          value: event.value || 0,
          ...event.customParameters,
        });
      }
    } catch (error) {
      console.error('EventTracker: Failed to track event', error);
    }
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string): void {
    try {
      if (this.enableGA) {
        googleAnalytics.trackPageView(path, title);
      }

      if (this.enableFB) {
        facebookPixel.trackPageView();
      }

      if (this.debug) {
        console.log('EventTracker: Page view tracked', { path, title });
      }
    } catch (error) {
      console.error('EventTracker: Failed to track page view', error);
    }
  }

  /**
   * Track e-commerce events
   */
  trackEcommerce(eventName: string, ecommerce: EcommerceTrackingEvent): void {
    try {
      if (this.enableGA) {
        // Track simplified events with GA
        googleAnalytics.trackEvent(eventName, {
          value: ecommerce.value,
          currency: ecommerce.currency,
          transaction_id: ecommerce.transaction_id || '',
          num_items: ecommerce.items.length,
        });
      }

      if (this.enableFB) {
        // Convert to Facebook format
        const fbItems = ecommerce.items.map(item => ({
          content_id: item.item_id,
          content_name: item.item_name,
          content_category: item.item_category,
          content_type: 'product',
          brand: item.item_brand,
          value: item.price || 0,
          currency: item.currency || 'INR',
          quantity: item.quantity || 1,
        }));

        const fbEvent = {
          content_ids: ecommerce.items.map(item => item.item_id),
          content_type: 'product',
          value: ecommerce.value,
          currency: ecommerce.currency,
          num_items: ecommerce.items.length,
          contents: fbItems,
        };

        switch (eventName) {
          case 'view_item':
            if (fbItems[0]) facebookPixel.trackViewContent(fbItems[0]);
            break;
          case 'add_to_cart':
            if (fbItems[0]) facebookPixel.trackAddToCart(fbItems[0]);
            break;
          case 'begin_checkout':
            facebookPixel.trackInitiateCheckout(fbEvent);
            break;
          case 'add_payment_info':
            facebookPixel.trackAddPaymentInfo(fbEvent);
            break;
          case 'purchase':
            facebookPixel.trackPurchase(fbEvent);
            break;
          default:
            facebookPixel.trackEvent(eventName, {
              value: fbEvent.value,
              currency: fbEvent.currency,
              content_type: fbEvent.content_type,
              num_items: fbEvent.num_items,
            });
        }
      }

      if (this.debug) {
        console.log('EventTracker: E-commerce event tracked', { eventName, ecommerce });
      }
    } catch (error) {
      console.error('EventTracker: Failed to track e-commerce event', error);
    }
  }

  /**
   * Track user properties
   */
  trackUser(userId: string, properties: UserProperties): void {
    try {
      if (this.enableGA) {
        googleAnalytics.setUserId(userId);
        googleAnalytics.setUserProperties(properties);
      }

      if (this.enableFB) {
        facebookPixel.setUserData({
          email: properties.customer_id,
        });
      }

      if (this.debug) {
        console.log('EventTracker: User tracked', { userId, properties });
      }
    } catch (error) {
      console.error('EventTracker: Failed to track user', error);
    }
  }

  // Convenience methods for common events

  /**
   * Track button/link clicks
   */
  trackClick(elementName: string, location?: string): void {
    this.track({
      action: EVENT_ACTIONS.CLICK,
      category: EVENT_CATEGORIES.ENGAGEMENT,
      label: elementName,
      customParameters: {
        location: location || '',
      },
    });
  }

  /**
   * Track form interactions
   */
  trackFormStart(formName: string): void {
    this.track({
      action: EVENT_ACTIONS.FORM_START,
      category: EVENT_CATEGORIES.FORM,
      label: formName,
    });
  }

  trackFormSubmit(formName: string, success = true): void {
    this.track({
      action: EVENT_ACTIONS.FORM_SUBMIT,
      category: EVENT_CATEGORIES.FORM,
      label: formName,
      customParameters: {
        success,
      },
    });
  }

  trackFormError(formName: string, errorType: string): void {
    this.track({
      action: EVENT_ACTIONS.FORM_ERROR,
      category: EVENT_CATEGORIES.FORM,
      label: formName,
      customParameters: {
        error_type: errorType,
      },
    });
  }

  /**
   * Track downloads
   */
  trackDownload(fileName: string, fileType: string, fileSize?: number): void {
    this.track({
      action: EVENT_ACTIONS.DOWNLOAD_START,
      category: EVENT_CATEGORIES.DOWNLOAD,
      label: fileName,
      customParameters: {
        file_type: fileType,
        file_size: fileSize || 0,
      },
    });

    // Also track with Facebook Pixel
    if (this.enableFB) {
      facebookPixel.trackDownload(fileName, fileType);
    }
  }

  /**
   * Track search
   */
  trackSearch(query: string, resultsCount?: number, category?: string): void {
    this.track({
      action: EVENT_ACTIONS.SEARCH,
      category: EVENT_CATEGORIES.SEARCH,
      label: query,
      value: resultsCount,
      customParameters: {
        search_category: category || '',
      },
    });

    // Also track with Facebook Pixel
    if (this.enableFB) {
      facebookPixel.trackSearch(query, category);
    }
  }

  /**
   * Track video interactions
   */
  trackVideoPlay(videoTitle: string, duration?: number): void {
    this.track({
      action: EVENT_ACTIONS.VIDEO_PLAY,
      category: EVENT_CATEGORIES.VIDEO,
      label: videoTitle,
      value: duration,
    });

    // Also track with Facebook Pixel
    if (this.enableFB) {
      facebookPixel.trackVideoView(videoTitle, duration);
    }
  }

  trackVideoComplete(videoTitle: string, duration?: number): void {
    this.track({
      action: EVENT_ACTIONS.VIDEO_COMPLETE,
      category: EVENT_CATEGORIES.VIDEO,
      label: videoTitle,
      value: duration,
    });
  }

  /**
   * Track social sharing
   */
  trackShare(platform: string, contentType: string, contentId?: string): void {
    this.track({
      action: EVENT_ACTIONS.SHARE,
      category: EVENT_CATEGORIES.SOCIAL,
      label: platform,
      customParameters: {
        content_type: contentType,
        content_id: contentId || '',
      },
    });

    // Also track with Facebook Pixel
    if (this.enableFB) {
      facebookPixel.trackShare(contentType, contentId);
    }
  }

  /**
   * Track errors
   */
  trackError(errorType: string, errorMessage: string, location?: string): void {
    this.track({
      action: 'error',
      category: EVENT_CATEGORIES.ERROR,
      label: errorType,
      customParameters: {
        error_message: errorMessage,
        location: location || '',
      },
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, unit?: string): void {
    this.track({
      action: metric,
      category: EVENT_CATEGORIES.PERFORMANCE,
      value,
      customParameters: {
        unit: unit || 'ms',
      },
    });
  }

  // Business-specific tracking methods

  /**
   * Track catalog viewing
   */
  trackCatalogView(catalogName: string, category?: string): void {
    this.track({
      action: EVENT_ACTIONS.VIEW_CATALOG,
      category: EVENT_CATEGORIES.BUSINESS,
      label: catalogName,
      customParameters: {
        catalog_category: category || '',
      },
    });

    // Also track with Facebook Pixel
    if (this.enableFB) {
      facebookPixel.trackViewCatalog(catalogName);
    }
  }

  /**
   * Track sample requests
   */
  trackSampleRequest(productId: string, productName: string, quantity?: number): void {
    this.track({
      action: EVENT_ACTIONS.REQUEST_SAMPLE,
      category: EVENT_CATEGORIES.BUSINESS,
      label: productName,
      value: quantity,
      customParameters: {
        product_id: productId,
      },
    });

    // Also track with Facebook Pixel
    if (this.enableFB) {
      facebookPixel.trackRequestSample(productId, productName);
    }
  }

  /**
   * Track quote requests
   */
  trackQuoteRequest(productIds: string[], totalValue?: number, quantity?: number): void {
    this.track({
      action: EVENT_ACTIONS.REQUEST_QUOTE,
      category: EVENT_CATEGORIES.BUSINESS,
      value: totalValue,
      customParameters: {
        product_count: productIds.length,
        quantity: quantity || 0,
      },
    });

    // Also track with Facebook Pixel
    if (this.enableFB) {
      facebookPixel.trackRequestQuote(productIds, totalValue);
    }
  }

  /**
   * Track contact inquiries
   */
  trackContactInquiry(inquiryType: string, source?: string): void {
    this.track({
      action: EVENT_ACTIONS.CONTACT_INQUIRY,
      category: EVENT_CATEGORIES.BUSINESS,
      label: inquiryType,
      customParameters: {
        source: source || '',
      },
    });

    // Also track with Facebook Pixel
    if (this.enableFB) {
      facebookPixel.trackContact(inquiryType);
    }
  }

  /**
   * Track newsletter signups
   */
  trackNewsletterSignup(source: string): void {
    this.track({
      action: 'newsletter_signup',
      category: EVENT_CATEGORIES.ENGAGEMENT,
      label: source,
    });

    // Also track with Facebook Pixel
    if (this.enableFB) {
      facebookPixel.trackNewsletterSignup(source);
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
export const eventTracker = new EventTracker(TRACKING_CONFIG);

// Export constants for use in components
export {
  EVENT_CATEGORIES,
  EVENT_ACTIONS,
};

export default eventTracker;
