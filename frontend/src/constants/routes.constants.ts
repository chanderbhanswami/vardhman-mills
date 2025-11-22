/**
 * Routes Constants - Vardhman Mills Frontend
 * Contains all application route definitions and navigation constants
 */

// Public Routes (accessible without authentication)
export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  FAQ: '/faq',
  SITEMAP: '/sitemap',
} as const;

// Authentication Routes
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  VERIFY_PHONE: '/auth/verify-phone',
  TWO_FACTOR: '/auth/two-factor',
} as const;

// Product Routes
export const PRODUCT_ROUTES = {
  LIST: '/products',
  DETAILS: (slug: string) => `/products/${slug}`,
  CATEGORY: (category: string) => `/products/category/${category}`,
  SEARCH: '/products/search',
  COMPARE: '/products/compare',
  REVIEWS: (slug: string) => `/products/${slug}/reviews`,
} as const;

// Category Routes
export const CATEGORY_ROUTES = {
  LIST: '/categories',
  DETAILS: (slug: string) => `/categories/${slug}`,
  SUBCATEGORY: (category: string, subcategory: string) => `/categories/${category}/${subcategory}`,
} as const;

// User Account Routes
export const ACCOUNT_ROUTES = {
  DASHBOARD: '/account',
  PROFILE: '/account/profile',
  ADDRESSES: '/account/addresses',
  ORDERS: '/account/orders',
  ORDER_DETAILS: (id: string) => `/account/orders/${id}`,
  WISHLIST: '/account/wishlist',
  REVIEWS: '/account/reviews',
  NOTIFICATIONS: '/account/notifications',
  SETTINGS: '/account/settings',
  SECURITY: '/account/security',
  PREFERENCES: '/account/preferences',
} as const;

// Shopping Routes
export const SHOPPING_ROUTES = {
  CART: '/cart',
  CHECKOUT: '/checkout',
  CHECKOUT_SUCCESS: '/checkout/success',
  CHECKOUT_CANCEL: '/checkout/cancel',
  PAYMENT: '/payment',
  ORDER_CONFIRMATION: (id: string) => `/order-confirmation/${id}`,
} as const;

// Blog Routes
export const BLOG_ROUTES = {
  LIST: '/blog',
  POST: (slug: string) => `/blog/${slug}`,
  CATEGORY: (category: string) => `/blog/category/${category}`,
  TAG: (tag: string) => `/blog/tag/${tag}`,
  AUTHOR: (author: string) => `/blog/author/${author}`,
  SEARCH: '/blog/search',
} as const;

// Support Routes
export const SUPPORT_ROUTES = {
  HELP: '/support',
  CHAT: '/support/chat',
  TICKETS: '/support/tickets',
  TICKET_DETAILS: (id: string) => `/support/tickets/${id}`,
  KNOWLEDGE_BASE: '/support/kb',
  KB_ARTICLE: (slug: string) => `/support/kb/${slug}`,
} as const;

// Search Routes
export const SEARCH_ROUTES = {
  GLOBAL: '/search',
  PRODUCTS: '/search/products',
  BLOG: '/search/blog',
  SUGGESTIONS: '/search/suggestions',
} as const;

// Legal Routes
export const LEGAL_ROUTES = {
  PRIVACY_POLICY: '/legal/privacy',
  TERMS_OF_SERVICE: '/legal/terms',
  COOKIES_POLICY: '/legal/cookies',
  REFUND_POLICY: '/legal/refund',
  SHIPPING_POLICY: '/legal/shipping',
} as const;

// API Routes (for internal use)
export const API_ROUTES = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  PRODUCTS: '/api/products',
  CART: '/api/cart',
  ORDERS: '/api/orders',
  PAYMENTS: '/api/payments',
  UPLOAD: '/api/upload',
} as const;

// External Routes
export const EXTERNAL_ROUTES = {
  FACEBOOK: 'https://facebook.com/vardhmanmills',
  TWITTER: 'https://twitter.com/vardhmanmills',
  INSTAGRAM: 'https://instagram.com/vardhmanmills',
  LINKEDIN: 'https://linkedin.com/company/vardhmanmills',
  YOUTUBE: 'https://youtube.com/vardhmanmills',
} as const;

// Admin Routes (for reference - separate admin panel)
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  PRODUCTS: '/admin/products',
  ORDERS: '/admin/orders',
  USERS: '/admin/users',
  ANALYTICS: '/admin/analytics',
  SETTINGS: '/admin/settings',
} as const;

// All Routes Combined
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...AUTH_ROUTES,
  ...ACCOUNT_ROUTES,
  ...SHOPPING_ROUTES,
  DASHBOARD: ACCOUNT_ROUTES.DASHBOARD,
  EMAIL_VERIFICATION: AUTH_ROUTES.VERIFY_EMAIL,
} as const;

// Protected Routes (require authentication)
export const PROTECTED_ROUTES = [
  ACCOUNT_ROUTES.DASHBOARD,
  ACCOUNT_ROUTES.PROFILE,
  ACCOUNT_ROUTES.ADDRESSES,
  ACCOUNT_ROUTES.ORDERS,
  ACCOUNT_ROUTES.WISHLIST,
  ACCOUNT_ROUTES.REVIEWS,
  ACCOUNT_ROUTES.NOTIFICATIONS,
  ACCOUNT_ROUTES.SETTINGS,
  ACCOUNT_ROUTES.SECURITY,
  ACCOUNT_ROUTES.PREFERENCES,
  SHOPPING_ROUTES.CHECKOUT,
] as const;

// Guest Only Routes (redirect if authenticated)
export const GUEST_ONLY_ROUTES = [
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.REGISTER,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.RESET_PASSWORD,
] as const;

// Navigation Menu Structure
export const NAVIGATION_MENU = {
  MAIN: [
    { label: 'Home', href: PUBLIC_ROUTES.HOME },
    { label: 'Products', href: PRODUCT_ROUTES.LIST },
    { label: 'Categories', href: CATEGORY_ROUTES.LIST },
    { label: 'Blog', href: BLOG_ROUTES.LIST },
    { label: 'About', href: PUBLIC_ROUTES.ABOUT },
    { label: 'Contact', href: PUBLIC_ROUTES.CONTACT },
  ],
  FOOTER: [
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: PUBLIC_ROUTES.ABOUT },
        { label: 'Contact', href: PUBLIC_ROUTES.CONTACT },
        { label: 'FAQ', href: PUBLIC_ROUTES.FAQ },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: LEGAL_ROUTES.PRIVACY_POLICY },
        { label: 'Terms of Service', href: LEGAL_ROUTES.TERMS_OF_SERVICE },
        { label: 'Refund Policy', href: LEGAL_ROUTES.REFUND_POLICY },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: SUPPORT_ROUTES.HELP },
        { label: 'Knowledge Base', href: SUPPORT_ROUTES.KNOWLEDGE_BASE },
      ],
    },
  ],
  ACCOUNT: [
    { label: 'Dashboard', href: ACCOUNT_ROUTES.DASHBOARD, icon: 'dashboard' },
    { label: 'Profile', href: ACCOUNT_ROUTES.PROFILE, icon: 'user' },
    { label: 'Orders', href: ACCOUNT_ROUTES.ORDERS, icon: 'orders' },
    { label: 'Wishlist', href: ACCOUNT_ROUTES.WISHLIST, icon: 'heart' },
    { label: 'Addresses', href: ACCOUNT_ROUTES.ADDRESSES, icon: 'location' },
    { label: 'Settings', href: ACCOUNT_ROUTES.SETTINGS, icon: 'settings' },
  ],
} as const;

// Breadcrumb Configuration
export const BREADCRUMB_CONFIG = {
  SEPARATOR: '/',
  HOME_LABEL: 'Home',
  SHOW_HOME: true,
  MAX_ITEMS: 5,
} as const;

export type PublicRoutes = typeof PUBLIC_ROUTES;
export type AuthRoutes = typeof AUTH_ROUTES;
export type AccountRoutes = typeof ACCOUNT_ROUTES;
export type ProductRoutes = typeof PRODUCT_ROUTES;
export type Routes = typeof ROUTES;