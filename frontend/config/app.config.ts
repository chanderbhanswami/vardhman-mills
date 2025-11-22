/**
 * Application Configuration
 * Central configuration for all app-wide settings
 * @module config/app
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AppConfig {
  app: AppMetadata;
  api: APIConfig;
  features: FeaturesConfig;
  ui: UIConfig;
  localization: LocalizationConfig;
  cache: CacheConfig;
  limits: LimitsConfig;
  notifications: NotificationsConfig;
  social: SocialConfig;
}

export interface AppMetadata {
  name: string;
  fullName: string;
  version: string;
  description: string;
  tagline: string;
  company: CompanyInfo;
  contact: ContactInfo;
  links: AppLinks;
}

export interface CompanyInfo {
  name: string;
  legalName: string;
  founded: string;
  registration: string;
  gst: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
}

export interface ContactInfo {
  phone: string[];
  email: {
    support: string;
    sales: string;
    info: string;
    careers: string;
  };
  whatsapp: string;
  timing: string;
}

export interface AppLinks {
  website: string;
  admin: string;
  api: string;
  docs: string;
  support: string;
  terms: string;
  privacy: string;
  refund: string;
}

export interface APIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers: Record<string, string>;
  withCredentials: boolean;
  endpoints: APIEndpoints;
}

export interface APIEndpoints {
  auth: {
    login: string;
    register: string;
    logout: string;
    refresh: string;
    verify: string;
    forgotPassword: string;
    resetPassword: string;
    changePassword: string;
    profile: string;
  };
  products: {
    list: string;
    detail: string;
    search: string;
    categories: string;
    featured: string;
    related: string;
  };
  orders: {
    create: string;
    list: string;
    detail: string;
    cancel: string;
    track: string;
    invoice: string;
  };
  cart: {
    get: string;
    add: string;
    update: string;
    remove: string;
    clear: string;
  };
  payments: {
    initiate: string;
    verify: string;
    refund: string;
    status: string;
  };
  user: {
    profile: string;
    addresses: string;
    wishlist: string;
    reviews: string;
  };
  notifications: {
    get: string;
    markRead: string;
    preferences: string;
  };
}

export interface FeaturesConfig {
  authentication: {
    enabled: boolean;
    providers: {
      email: boolean;
      google: boolean;
      facebook: boolean;
      phone: boolean;
    };
    twoFactor: boolean;
    emailVerification: boolean;
    phoneVerification: boolean;
  };
  ecommerce: {
    enabled: boolean;
    guestCheckout: boolean;
    wishlist: boolean;
    reviews: boolean;
    ratings: boolean;
    productComparison: boolean;
    recentlyViewed: boolean;
    recommendedProducts: boolean;
  };
  payments: {
    razorpay: boolean;
    cod: boolean;
    upi: boolean;
    netBanking: boolean;
    cards: boolean;
    wallets: boolean;
  };
  shipping: {
    multipleAddresses: boolean;
    addressValidation: boolean;
    trackingEnabled: boolean;
    estimatedDelivery: boolean;
  };
  search: {
    enabled: boolean;
    autocomplete: boolean;
    filters: boolean;
    sorting: boolean;
    priceRange: boolean;
  };
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    inApp: boolean;
  };
  social: {
    sharing: boolean;
    socialLogin: boolean;
    referrals: boolean;
  };
  analytics: {
    googleAnalytics: boolean;
    googleTagManager: boolean;
    facebookPixel: boolean;
    customEvents: boolean;
  };
  pwa: {
    enabled: boolean;
    installPrompt: boolean;
    offlineMode: boolean;
    backgroundSync: boolean;
  };
}

export interface UIConfig {
  theme: {
    default: 'light' | 'dark' | 'auto';
    available: Array<'light' | 'dark'>;
    storageKey: string;
  };
  layout: {
    maxWidth: string;
    headerHeight: string;
    footerHeight: string;
    sidebarWidth: string;
  };
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
  responsiveness: {
    breakpoints: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      '2xl': number;
    };
  };
  toast: {
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    duration: number;
    maxToasts: number;
  };
  modal: {
    closeOnOutsideClick: boolean;
    closeOnEscape: boolean;
    showCloseButton: boolean;
  };
  pagination: {
    defaultPageSize: number;
    pageSizeOptions: number[];
  };
  imageOptimization: {
    enabled: boolean;
    quality: number;
    formats: string[];
    sizes: number[];
  };
}

export interface LocalizationConfig {
  defaultLocale: string;
  locales: string[];
  fallbackLocale: string;
  currency: {
    code: string;
    symbol: string;
    position: 'before' | 'after';
  };
  dateFormat: string;
  timeFormat: string;
  timezone: string;
}

export interface CacheConfig {
  enabled: boolean;
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  ttl: {
    static: number;
    api: number;
    images: number;
  };
  storage: {
    type: 'localStorage' | 'sessionStorage' | 'indexedDB';
    prefix: string;
  };
}

export interface LimitsConfig {
  upload: {
    maxFileSize: number; // in bytes
    maxFiles: number;
    allowedTypes: string[];
  };
  cart: {
    maxItems: number;
    maxQuantityPerItem: number;
  };
  wishlist: {
    maxItems: number;
  };
  addresses: {
    maxAddresses: number;
  };
  reviews: {
    maxLength: number;
    minLength: number;
  };
  password: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

export interface NotificationsConfig {
  enabled: boolean;
  types: {
    orderConfirmation: boolean;
    orderShipped: boolean;
    orderDelivered: boolean;
    paymentSuccess: boolean;
    paymentFailed: boolean;
    promotions: boolean;
    priceDrops: boolean;
    backInStock: boolean;
    newsletter: boolean;
  };
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    whatsapp: boolean;
  };
}

export interface SocialConfig {
  platforms: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
    whatsapp: string;
  };
  sharing: {
    enabled: boolean;
    platforms: string[];
  };
}

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const IS_DEVELOPMENT = NODE_ENV === 'development';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);

// App Configuration
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Vardhman Mills';
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Feature Flags
const ENABLE_PWA = process.env.NEXT_PUBLIC_ENABLE_PWA === 'true';
const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

// ============================================================================
// MAIN CONFIGURATION
// ============================================================================

export const appConfig: AppConfig = {
  // Application Metadata
  app: {
    name: APP_NAME,
    fullName: 'Vardhman Textiles Mills',
    version: APP_VERSION,
    description: 'Premium textile manufacturing and e-commerce platform',
    tagline: 'Quality Textiles Since 1985',
    
    company: {
      name: 'Vardhman Textiles',
      legalName: 'Vardhman Textiles Mills Pvt. Ltd.',
      founded: '1985',
      registration: 'CIN: U17110PB1985PTC006789',
      gst: 'GST: 03AAAAA0000A1Z5',
      address: {
        street: 'Industrial Area, Phase 2',
        city: 'Ludhiana',
        state: 'Punjab',
        country: 'India',
        pincode: '141003',
      },
    },

    contact: {
      phone: ['+91-161-2345678', '+91-161-2345679'],
      email: {
        support: 'support@vardhmanmills.com',
        sales: 'sales@vardhmanmills.com',
        info: 'info@vardhmanmills.com',
        careers: 'careers@vardhmanmills.com',
      },
      whatsapp: '+91-9876543210',
      timing: 'Mon-Sat: 9:00 AM - 6:00 PM IST',
    },

    links: {
      website: APP_URL,
      admin: `${APP_URL}/admin`,
      api: API_BASE_URL,
      docs: `${APP_URL}/docs`,
      support: `${APP_URL}/support`,
      terms: `${APP_URL}/terms`,
      privacy: `${APP_URL}/privacy`,
      refund: `${APP_URL}/refund-policy`,
    },
  },

  // API Configuration
  api: {
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    retryAttempts: 3,
    retryDelay: 1000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: true,

    endpoints: {
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        logout: '/api/auth/logout',
        refresh: '/api/auth/refresh',
        verify: '/api/auth/verify-email',
        forgotPassword: '/api/auth/forgot-password',
        resetPassword: '/api/auth/reset-password',
        changePassword: '/api/auth/change-password',
        profile: '/api/auth/profile',
      },
      products: {
        list: '/api/products',
        detail: '/api/products/:id',
        search: '/api/products/search',
        categories: '/api/products/categories',
        featured: '/api/products/featured',
        related: '/api/products/:id/related',
      },
      orders: {
        create: '/api/orders',
        list: '/api/orders',
        detail: '/api/orders/:id',
        cancel: '/api/orders/:id/cancel',
        track: '/api/orders/:id/track',
        invoice: '/api/orders/:id/invoice',
      },
      cart: {
        get: '/api/cart',
        add: '/api/cart/add',
        update: '/api/cart/update',
        remove: '/api/cart/remove',
        clear: '/api/cart/clear',
      },
      payments: {
        initiate: '/api/payments/initiate',
        verify: '/api/payments/verify',
        refund: '/api/payments/refund',
        status: '/api/payments/:id/status',
      },
      user: {
        profile: '/api/user/profile',
        addresses: '/api/user/addresses',
        wishlist: '/api/user/wishlist',
        reviews: '/api/user/reviews',
      },
      notifications: {
        get: '/api/notifications',
        markRead: '/api/notifications/:id/read',
        preferences: '/api/notifications/preferences',
      },
    },
  },

  // Features Configuration
  features: {
    authentication: {
      enabled: true,
      providers: {
        email: true,
        google: true,
        facebook: false,
        phone: true,
      },
      twoFactor: false,
      emailVerification: true,
      phoneVerification: false,
    },

    ecommerce: {
      enabled: true,
      guestCheckout: true,
      wishlist: true,
      reviews: true,
      ratings: true,
      productComparison: true,
      recentlyViewed: true,
      recommendedProducts: true,
    },

    payments: {
      razorpay: true,
      cod: true,
      upi: true,
      netBanking: true,
      cards: true,
      wallets: true,
    },

    shipping: {
      multipleAddresses: true,
      addressValidation: true,
      trackingEnabled: true,
      estimatedDelivery: true,
    },

    search: {
      enabled: true,
      autocomplete: true,
      filters: true,
      sorting: true,
      priceRange: true,
    },

    notifications: {
      push: true,
      email: true,
      sms: true,
      whatsapp: true,
      inApp: true,
    },

    social: {
      sharing: true,
      socialLogin: true,
      referrals: false,
    },

    analytics: {
      googleAnalytics: ENABLE_ANALYTICS,
      googleTagManager: true,
      facebookPixel: false,
      customEvents: true,
    },

    pwa: {
      enabled: ENABLE_PWA,
      installPrompt: true,
      offlineMode: true,
      backgroundSync: true,
    },
  },

  // UI Configuration
  ui: {
    theme: {
      default: 'light',
      available: ['light', 'dark'],
      storageKey: 'vardhman-theme',
    },

    layout: {
      maxWidth: '1440px',
      headerHeight: '80px',
      footerHeight: '320px',
      sidebarWidth: '280px',
    },

    animations: {
      enabled: true,
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },

    responsiveness: {
      breakpoints: {
        xs: 320,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
      },
    },

    toast: {
      position: 'top-right',
      duration: 5000,
      maxToasts: 5,
    },

    modal: {
      closeOnOutsideClick: true,
      closeOnEscape: true,
      showCloseButton: true,
    },

    pagination: {
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50, 100],
    },

    imageOptimization: {
      enabled: true,
      quality: 85,
      formats: ['webp', 'avif', 'jpeg'],
      sizes: [320, 640, 768, 1024, 1280, 1920],
    },
  },

  // Localization Configuration
  localization: {
    defaultLocale: 'en-IN',
    locales: ['en-IN', 'hi-IN', 'pa-IN'],
    fallbackLocale: 'en-IN',
    currency: {
      code: 'INR',
      symbol: '₹',
      position: 'before',
    },
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'hh:mm A',
    timezone: 'Asia/Kolkata',
  },

  // Cache Configuration
  cache: {
    enabled: IS_PRODUCTION,
    strategy: 'stale-while-revalidate',
    ttl: {
      static: 86400, // 24 hours
      api: 300, // 5 minutes
      images: 604800, // 7 days
    },
    storage: {
      type: 'localStorage',
      prefix: 'vardhman_',
    },
  },

  // Limits Configuration
  limits: {
    upload: {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    },

    cart: {
      maxItems: 50,
      maxQuantityPerItem: 999,
    },

    wishlist: {
      maxItems: 100,
    },

    addresses: {
      maxAddresses: 10,
    },

    reviews: {
      maxLength: 1000,
      minLength: 10,
    },

    password: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
  },

  // Notifications Configuration
  notifications: {
    enabled: true,
    types: {
      orderConfirmation: true,
      orderShipped: true,
      orderDelivered: true,
      paymentSuccess: true,
      paymentFailed: true,
      promotions: true,
      priceDrops: true,
      backInStock: true,
      newsletter: true,
    },
    channels: {
      email: true,
      sms: true,
      push: true,
      whatsapp: true,
    },
  },

  // Social Configuration
  social: {
    platforms: {
      facebook: 'https://facebook.com/vardhmanmills',
      instagram: 'https://instagram.com/vardhmanmills',
      twitter: 'https://twitter.com/vardhmanmills',
      linkedin: 'https://linkedin.com/company/vardhmanmills',
      youtube: 'https://youtube.com/@vardhmanmills',
      whatsapp: 'https://wa.me/919876543210',
    },
    sharing: {
      enabled: true,
      platforms: ['facebook', 'twitter', 'whatsapp', 'linkedin', 'email'],
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: string): boolean => {
  const keys = feature.split('.');
  let value: unknown = appConfig.features;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return false;
    }
  }
  
  return value === true;
};

/**
 * Get API endpoint URL
 */
export const getAPIEndpoint = (endpoint: string, params?: Record<string, string>): string => {
  const keys = endpoint.split('.');
  let url: unknown = appConfig.api.endpoints;
  
  for (const key of keys) {
    if (url && typeof url === 'object' && key in url) {
      url = (url as Record<string, unknown>)[key];
    }
  }
  
  if (typeof url !== 'string') {
    throw new Error(`Invalid endpoint: ${endpoint}`);
  }
  
  // Replace URL parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = (url as string).replace(`:${key}`, value);
    });
  }
  
  return `${appConfig.api.baseURL}${url}`;
};

/**
 * Get full URL
 */
export const getFullURL = (path: string): string => {
  return `${appConfig.app.links.website}${path}`;
};

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  return IS_PRODUCTION;
};

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => {
  return IS_DEVELOPMENT;
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number): string => {
  const { symbol, position } = appConfig.localization.currency;
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return position === 'before' ? `${symbol}${formatted}` : `${formatted}${symbol}`;
};

/**
 * Get contact info
 */
export const getContactInfo = () => appConfig.app.contact;

/**
 * Get company info
 */
export const getCompanyInfo = () => appConfig.app.company;

/**
 * Get social links
 */
export const getSocialLinks = () => appConfig.social.platforms;

// ============================================================================
// EXPORTS
// ============================================================================

export default appConfig;

export {
  NODE_ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  API_BASE_URL,
  APP_NAME,
  APP_VERSION,
  APP_URL,
};
