/**
 * SEO Constants - Vardhman Mills Frontend
 * Contains SEO-related configuration and metadata
 */

// Site Configuration
export const SITE_CONFIG = {
  SITE_NAME: 'Vardhman Mills',
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://vardhmanmills.com',
  SITE_TITLE: 'Vardhman Mills - Premium Textile Manufacturing',
  SITE_DESCRIPTION: 'Leading textile manufacturer specializing in premium cotton, polyester, and blended fabrics. Quality textiles for fashion, home, and industrial applications.',
  SITE_KEYWORDS: 'textiles, cotton, polyester, fabric, manufacturing, premium quality, fashion textiles, home textiles, industrial fabrics',
  COMPANY_NAME: 'Vardhman Mills Pvt. Ltd.',
  FOUNDED_YEAR: 1985,
  CONTACT_EMAIL: 'info@vardhmanmills.com',
  CONTACT_PHONE: '+91-11-1234567890',
} as const;

// Default Meta Tags
export const DEFAULT_META = {
  TITLE: 'Vardhman Mills - Premium Textile Manufacturing',
  DESCRIPTION: 'Leading textile manufacturer specializing in premium cotton, polyester, and blended fabrics. Quality textiles for fashion, home, and industrial applications.',
  KEYWORDS: [
    'textiles',
    'cotton fabric',
    'polyester fabric',
    'textile manufacturing',
    'premium fabrics',
    'fashion textiles',
    'home textiles',
    'industrial fabrics',
    'sustainable textiles',
    'quality fabrics',
  ],
  AUTHOR: 'Vardhman Mills',
  ROBOTS: 'index, follow',
  VIEWPORT: 'width=device-width, initial-scale=1',
} as const;

// Open Graph Configuration
export const OG_CONFIG = {
  TYPE: 'website',
  LOCALE: 'en_US',
  SITE_NAME: 'Vardhman Mills',
  IMAGE: '/images/og-image.jpg',
  IMAGE_WIDTH: 1200,
  IMAGE_HEIGHT: 630,
  IMAGE_ALT: 'Vardhman Mills - Premium Textile Manufacturing',
} as const;

// Twitter Card Configuration
export const TWITTER_CONFIG = {
  CARD: 'summary_large_image',
  SITE: '@vardhmanmills',
  CREATOR: '@vardhmanmills',
  IMAGE: '/images/twitter-image.jpg',
} as const;

// JSON-LD Schema Types
export const SCHEMA_TYPES = {
  ORGANIZATION: 'Organization',
  WEBSITE: 'WebSite',
  PRODUCT: 'Product',
  BREADCRUMB_LIST: 'BreadcrumbList',
  FAQ_PAGE: 'FAQPage',
  ARTICLE: 'Article',
  BLOG_POSTING: 'BlogPosting',
  REVIEW: 'Review',
  AGGREGATE_RATING: 'AggregateRating',
  OFFER: 'Offer',
} as const;

// Organization Schema
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Vardhman Mills',
  url: 'https://vardhmanmills.com',
  logo: 'https://vardhmanmills.com/images/logo.png',
  description: 'Leading textile manufacturer specializing in premium fabrics',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Industrial Area',
    addressLocality: 'Mumbai',
    addressRegion: 'Maharashtra',
    postalCode: '400001',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-11-1234567890',
    contactType: 'customer service',
  },
  sameAs: [
    'https://www.facebook.com/vardhmanmills',
    'https://www.twitter.com/vardhmanmills',
    'https://www.linkedin.com/company/vardhman-mills',
    'https://www.instagram.com/vardhmanmills',
  ],
} as const;

// Website Schema
export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Vardhman Mills',
  url: 'https://vardhmanmills.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://vardhmanmills.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
} as const;

// Page Types
export const PAGE_TYPES = {
  HOME: 'home',
  ABOUT: 'about',
  PRODUCTS: 'products',
  PRODUCT_DETAIL: 'product_detail',
  CATEGORY: 'category',
  BLOG: 'blog',
  BLOG_POST: 'blog_post',
  CONTACT: 'contact',
  SEARCH: 'search',
  CART: 'cart',
  CHECKOUT: 'checkout',
  ACCOUNT: 'account',
  NOT_FOUND: '404',
} as const;

// Meta Templates
export const META_TEMPLATES = {
  [PAGE_TYPES.HOME]: {
    title: 'Vardhman Mills - Premium Textile Manufacturing',
    description: 'Leading textile manufacturer specializing in premium cotton, polyester, and blended fabrics. Quality textiles for fashion, home, and industrial applications.',
  },
  [PAGE_TYPES.ABOUT]: {
    title: 'About Us - Vardhman Mills',
    description: 'Learn about Vardhman Mills, our history, mission, and commitment to quality textile manufacturing since 1985.',
  },
  [PAGE_TYPES.PRODUCTS]: {
    title: 'Premium Fabrics & Textiles - Vardhman Mills',
    description: 'Explore our extensive range of premium cotton, polyester, silk, and blended fabrics. High-quality textiles for all your needs.',
  },
  [PAGE_TYPES.BLOG]: {
    title: 'Textile Industry News & Insights - Vardhman Mills Blog',
    description: 'Stay updated with the latest trends, innovations, and insights in the textile industry. Expert articles and industry news.',
  },
  [PAGE_TYPES.CONTACT]: {
    title: 'Contact Us - Vardhman Mills',
    description: 'Get in touch with Vardhman Mills. Contact information, locations, and inquiry forms for our textile products and services.',
  },
} as const;

// Canonical URL Configuration
export const CANONICAL_CONFIG = {
  ENABLE: true,
  TRAILING_SLASH: false,
  LOWERCASE: true,
  REMOVE_QUERY_PARAMS: ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid'],
} as const;

// Sitemap Configuration
export const SITEMAP_CONFIG = {
  CHANGE_FREQUENCY: {
    HOME: 'daily',
    PRODUCTS: 'weekly',
    CATEGORIES: 'weekly',
    BLOG: 'daily',
    STATIC_PAGES: 'monthly',
  },
  PRIORITY: {
    HOME: 1.0,
    MAIN_CATEGORIES: 0.9,
    PRODUCTS: 0.8,
    SUB_CATEGORIES: 0.7,
    BLOG_POSTS: 0.6,
    STATIC_PAGES: 0.5,
  },
  EXCLUDE_PATHS: ['/admin', '/api', '/private'],
} as const;

// Robots.txt Configuration
export const ROBOTS_CONFIG = {
  USER_AGENT: '*',
  ALLOW: ['/', '/products', '/categories', '/blog'],
  DISALLOW: ['/admin', '/api', '/private', '/checkout', '/account'],
  SITEMAP: 'https://vardhmanmills.com/sitemap.xml',
  CRAWL_DELAY: 1,
} as const;

// SEO Rules
export const SEO_RULES = {
  TITLE: {
    MIN_LENGTH: 30,
    MAX_LENGTH: 60,
    INCLUDE_BRAND: true,
    SEPARATOR: ' - ',
  },
  DESCRIPTION: {
    MIN_LENGTH: 120,
    MAX_LENGTH: 160,
    INCLUDE_KEYWORDS: true,
    INCLUDE_CTA: true,
  },
  KEYWORDS: {
    MIN_COUNT: 5,
    MAX_COUNT: 15,
    AVOID_STUFFING: true,
  },
  HEADINGS: {
    H1_COUNT: 1,
    H2_MIN_COUNT: 2,
    HIERARCHY: true,
  },
  IMAGES: {
    REQUIRE_ALT: true,
    OPTIMIZE_SIZE: true,
    USE_NEXT_GEN_FORMAT: true,
  },
  URLS: {
    USE_HYPHENS: true,
    LOWERCASE: true,
    DESCRIPTIVE: true,
    MAX_LENGTH: 100,
  },
} as const;

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  GOOGLE_ANALYTICS: {
    TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
    ENHANCED_ECOMMERCE: true,
    DEMOGRAPHICS: true,
  },
  GOOGLE_TAG_MANAGER: {
    CONTAINER_ID: process.env.NEXT_PUBLIC_GTM_ID,
  },
  FACEBOOK_PIXEL: {
    PIXEL_ID: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
  },
} as const;

export type PageTypes = typeof PAGE_TYPES;
export type SchemaTypes = typeof SCHEMA_TYPES;