/**
 * API Module Index
 * Centralized exports for all API-related functionality
 */

// Core API Infrastructure
export { default as authHandler } from './auth-handler';
export { default as errorHandler } from './error-handler';
export { default as interceptors } from './interceptors';
export { default as endpoints } from './endpoints';
export { default as apiUtils } from './utils';
export { default as config } from './config';

// Types
export * from './types';

// Re-export core classes and functions for convenience
export { httpClient as HttpClient } from './client';
export { default as AuthHandler } from './auth-handler';
export { default as ErrorHandler } from './error-handler';

// Re-export commonly used utilities
export {
  buildUrl,
  buildPath,
  formatCurrency,
  formatDate,
  parseErrorMessage,
  debounce,
  throttle,
  storage,
} from './utils';

// Re-export configuration constants
export {
  API_CONFIG,
  HTTP_STATUS,
  API_ERROR_CODES,
  CACHE_KEYS,
  STORAGE_KEYS,
} from './config';

// Individual API Services (existing files)
export { default as aboutApi } from './aboutApi';
export { default as addressApi } from './addressApi';
export { default as analyticsApi } from './analyticsApi';
export { default as authApi } from './authApi';
// export { default as bestsellerApi } from './bestsellerApi';
export { default as brandApi } from './brandApi';
export { default as cartApi } from './cartApi';
export { default as categoryApi } from './categoryApi';
export { default as cmsApi } from './cmsApi';
export { default as collectionApi } from './collectionApi';
export { default as couponApi } from './couponApi';
export { default as dealApi } from './dealApi';
export { default as favoriteSectionApi } from './favoriteSectionApi';
export { default as featuredApi } from './featuredApi';
export { default as footerLogoApi } from './footerLogoApi';
export { default as headerLogoApi } from './headerLogoApi';
export { default as heroApi } from './heroApi';
export { default as inventoryApi } from './inventoryApi';
export { default as mediaApi } from './mediaApi';
export { default as newArrivalApi } from './newArrivalApi';
export { default as notificationApi } from './notificationApi';
export { default as orderApi } from './orderApi';
export { default as paymentApi } from './paymentApi';
export { default as paymentsApi } from './paymentsApi';
export { default as productApi } from './productApi';
export { default as reviewApi } from './reviewApi';
export { default as reviewMediaApi } from './reviewMediaApi';
export { default as reviewsRepliesApi } from './reviewsRepliesApi';
export { default as saleApi } from './saleApi';
export { default as shippingApi } from './shippingApi';
export { default as socialLinkApi } from './socialLinkApi';
export { default as uploadApi } from './uploadApi';
export { default as userApi } from './userApi';

// Export API modules without default exports (using different syntax)
// export * as seoApi from './seoApi';
// export * as giftCards from './gift-cards';
// export * as wishlist from './wishlist';
// export * as newsletter from './newsletter';
// export * as contact from './contact';
// export * as blog from './blog';
// export * as cart from './cart';
// export * as coupons from './coupons';
// export * as faq from './faq';
// export * as announcementBar from './announcementBar';

// Create a centralized API object (only with existing modules)
// export const api = {
//   about: aboutApi,
//   address: addressApi,
//   analytics: analyticsApi,
//   auth: authApi,
//   brand: brandApi,
//   cart: cartApi,
//   category: categoryApi,
//   cms: cmsApi,
//   collection: collectionApi,
//   coupon: couponApi,
//   deal: dealApi,
//   favoriteSection: favoriteSectionApi,
//   featured: featuredApi,
//   footerLogo: footerLogoApi,
//   headerLogo: headerLogoApi,
//   hero: heroApi,
//   inventory: inventoryApi,
//   media: mediaApi,
//   newArrival: newArrivalApi,
//   notification: notificationApi,
//   order: orderApi,
//   payment: paymentApi,
//   payments: paymentsApi,
//   product: productApi,
//   review: reviewApi,
//   reviewMedia: reviewMediaApi,
//   reviewsReplies: reviewsRepliesApi,
//   sale: saleApi,
//   shipping: shippingApi,
//   socialLink: socialLinkApi,
//   upload: uploadApi,
//   user: userApi,
// };

// Simplified API object with working exports
export const api = {};

// export default api;