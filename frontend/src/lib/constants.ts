/**
 * Application Constants
 * Central location for all app-wide constants
 */

// API Endpoints
export const API_ENDPOINTS = {
  // Products
  PRODUCTS: '/api/products',
  PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
  PRODUCT_BY_SLUG: (slug: string) => `/api/products/slug/${slug}`,
  PRODUCT_SEARCH: '/api/products/search',
  PRODUCT_FILTERS: '/api/products/filters',
  PRODUCT_CATEGORIES: '/api/products/categories',
  PRODUCT_REVIEWS: (id: string) => `/api/products/${id}/reviews`,
  
  // Cart
  CART: '/api/cart',
  CART_ADD: '/api/cart/items',  // Fixed: Use /items endpoint
  CART_REMOVE: (id: string) => `/api/cart/items/${id}`,  // Fixed: Use /items/:id with DELETE
  CART_UPDATE: (id: string) => `/api/cart/items/${id}`,  // Fixed: Use /items/:id with PUT
  CART_CLEAR: '/api/cart/clear',
  CART_CALCULATE_SHIPPING: '/api/cart/calculate-shipping',  // Fixed: Correct endpoint name
  CART_VALIDATE: '/api/cart/validate',
  CART_SYNC_GUEST: '/api/cart/sync-guest',
  CART_RECOMMENDATIONS: '/api/cart/recommendations',
  CART_SAVED: '/api/cart/saved',
  CART_SAVE: '/api/cart/save',
  
  // Wishlist
  WISHLIST: '/api/wishlist',
  WISHLIST_ADD: '/api/wishlist/items',  // Fixed: Use /items endpoint
  WISHLIST_REMOVE: (id: string) => `/api/wishlist/items/${id}`,  // Fixed: Use /items/:id with DELETE
  
  // Orders
  ORDERS: '/api/orders',
  ORDER_BY_ID: (id: string) => `/api/orders/${id}`,
  ORDER_TRACKING: (id: string) => `/api/orders/${id}/tracking`,  // Fixed: Use /tracking not /track
  ORDER_INVOICE: (id: string) => `/api/orders/${id}/invoice`,
  ORDER_CANCEL: (id: string) => `/api/orders/${id}/cancel`,
  
  // User
  USER_PROFILE: '/api/user/profile',
  USER_ADDRESSES: '/api/user/addresses',
  USER_ORDERS: '/api/user/orders',
  
  // Auth
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REFRESH: '/api/auth/refresh',
  
  // Checkout
  CHECKOUT: '/api/checkout',
  CHECKOUT_PAYMENT: '/api/checkout/payment',
  CHECKOUT_VALIDATE: '/api/checkout/validate',
  
  // Search
  SEARCH: '/api/search',
  SEARCH_SUGGESTIONS: '/api/search/suggestions',
} as const;

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Vardhman Mills',
  APP_DESCRIPTION: 'Premium Quality Bedsheets and Home Textiles',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  
  // Pagination
  PRODUCTS_PER_PAGE: 24,
  ORDERS_PER_PAGE: 10,
  REVIEWS_PER_PAGE: 10,
  
  // Cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Features
  ENABLE_WISHLIST: true,
  ENABLE_COMPARE: true,
  ENABLE_REVIEWS: true,
  ENABLE_QUICK_VIEW: true,
} as const;

// Product Constants
export const PRODUCT_CONSTANTS = {
  MIN_PRICE: 0,
  MAX_PRICE: 10000,
  MIN_THREAD_COUNT: 0,
  MAX_THREAD_COUNT: 1000,
  DEFAULT_CURRENCY: 'INR',
} as const;

// Filter Options
export const FILTER_OPTIONS = {
  CATEGORIES: ['Cotton', 'Silk', 'Linen', 'Wool', 'Synthetic'],
  COLORS: ['White', 'Blue', 'Red', 'Green', 'Yellow', 'Black', 'Pink', 'Purple', 'Beige', 'Grey'],
  SIZES: ['Single', 'Double', 'Queen', 'King'],
  MATERIALS: ['100% Cotton', 'Cotton Blend', 'Pure Silk', 'Linen Mix', 'Microfiber'],
  BRANDS: ['Vardhman Mills', 'Premium Collection', 'Luxury Line', 'Comfort Series'],
} as const;

// Sort Options
export const SORT_OPTIONS = {
  RELEVANCE: 'relevance',
  PRICE_LOW_HIGH: 'price-asc',
  PRICE_HIGH_LOW: 'price-desc',
  NAME_A_Z: 'name-asc',
  NAME_Z_A: 'name-desc',
  RATING: 'rating',
  NEWEST: 'newest',
  POPULARITY: 'popularity',
  DISCOUNT: 'discount',
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  WISHLIST: '/wishlist',
  ACCOUNT: '/account',
  LOGIN: '/login',
  REGISTER: '/register',
  QUICK_ORDER: '/quick-order',
} as const;

const allConstants = {
  API_ENDPOINTS,
  APP_CONFIG,
  PRODUCT_CONSTANTS,
  FILTER_OPTIONS,
  SORT_OPTIONS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  ROUTES,
};

export default allConstants;
