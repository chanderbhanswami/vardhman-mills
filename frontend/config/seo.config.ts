/**
 * SEO Configuration
 * Comprehensive SEO and meta tags configuration
 * @module config/seo
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SEOConfig {
  default: DefaultSEO;
  pages: Record<string, PageSEO>;
  structured: StructuredDataConfig;
  openGraph: OpenGraphConfig;
  twitter: TwitterConfig;
  social: SocialConfig;
  sitemap: SitemapConfig;
  robots: RobotsConfig;
  schema: SchemaConfig;
}

export interface DefaultSEO {
  title: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
  author: string;
  language: string;
  locale: string;
  siteUrl: string;
  siteName: string;
  canonicalUrl?: string;
  images: ImageMeta[];
}

export interface ImageMeta {
  url: string;
  width: number;
  height: number;
  alt: string;
  type?: string;
}

export interface PageSEO {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  ogType?: string;
  ogImage?: ImageMeta;
  twitterCard?: string;
}

export interface StructuredDataConfig {
  organization: OrganizationSchema;
  website: WebsiteSchema;
  breadcrumb: boolean;
  product: boolean;
  review: boolean;
  offer: boolean;
}

export interface OrganizationSchema {
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  address: AddressSchema;
  contactPoint: ContactPointSchema[];
  sameAs: string[];
  foundingDate: string;
  founders: string[];
}

export interface AddressSchema {
  '@type': string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

export interface ContactPointSchema {
  '@type': string;
  telephone: string;
  contactType: string;
  email?: string;
  areaServed?: string;
  availableLanguage?: string[];
}

export interface WebsiteSchema {
  '@type': string;
  name: string;
  url: string;
  description: string;
  publisher: {
    '@type': string;
    name: string;
  };
  potentialAction?: PotentialAction;
}

export interface PotentialAction {
  '@type': string;
  target: {
    '@type': string;
    urlTemplate: string;
  };
  'query-input': string;
}

export interface OpenGraphConfig {
  type: string;
  siteName: string;
  locale: string;
  alternateLocales: string[];
  images: ImageMeta[];
  videos?: VideoMeta[];
}

export interface VideoMeta {
  url: string;
  secureUrl?: string;
  type?: string;
  width?: number;
  height?: number;
}

export interface TwitterConfig {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site: string;
  creator: string;
  images: ImageMeta[];
}

export interface SocialConfig {
  facebook: {
    appId: string;
    pageId: string;
  };
  instagram: {
    username: string;
  };
  twitter: {
    username: string;
  };
  linkedin: {
    companyId: string;
  };
}

export interface SitemapConfig {
  enabled: boolean;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  exclude: string[];
  include: string[];
  generateRobotsTxt: boolean;
}

export interface RobotsConfig {
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
  sitemap: string[];
}

export interface SchemaConfig {
  enabled: boolean;
  types: string[];
  customSchemas: Record<string, unknown>[];
}

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://vardhmanmills.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Vardhman Mills';
const FB_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID || '';
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// ============================================================================
// MAIN CONFIGURATION
// ============================================================================

export const seoConfig: SEOConfig = {
  // Default SEO Settings
  default: {
    title: 'Vardhman Mills - Premium Quality Textiles',
    titleTemplate: '%s | Vardhman Mills',
    description: 'Leading textile manufacturer offering premium quality fabrics, yarns, and textile products. Trusted since 1985 for excellence in textile manufacturing.',
    keywords: [
      'vardhman mills',
      'textile manufacturer',
      'quality fabrics',
      'textile products',
      'yarn supplier',
      'fabric supplier',
      'textile industry',
      'cotton fabrics',
      'synthetic fabrics',
      'textile wholesale',
    ],
    author: 'Vardhman Mills',
    language: 'en',
    locale: 'en_IN',
    siteUrl: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Vardhman Mills - Premium Quality Textiles',
        type: 'image/jpeg',
      },
    ],
  },

  // Page-Specific SEO
  pages: {
    home: {
      title: 'Home',
      description: 'Welcome to Vardhman Mills - Your trusted partner in premium quality textiles since 1985. Explore our wide range of fabrics and textile products.',
      keywords: ['home', 'textile manufacturer', 'fabric supplier'],
      ogType: 'website',
    },
    products: {
      title: 'Products',
      description: 'Browse our extensive collection of premium quality fabrics, yarns, and textile products. Find the perfect textile solution for your needs.',
      keywords: ['products', 'fabrics', 'textiles', 'yarn'],
      ogType: 'product.group',
    },
    about: {
      title: 'About Us',
      description: 'Learn about Vardhman Mills - A legacy of excellence in textile manufacturing since 1985. Discover our commitment to quality and innovation.',
      keywords: ['about', 'company', 'history', 'legacy'],
      ogType: 'website',
    },
    contact: {
      title: 'Contact Us',
      description: 'Get in touch with Vardhman Mills. Contact our team for inquiries about our textile products, wholesale orders, or partnership opportunities.',
      keywords: ['contact', 'support', 'customer service'],
      ogType: 'website',
    },
    blog: {
      title: 'Blog',
      description: 'Stay updated with the latest news, trends, and insights from the textile industry. Read expert articles from Vardhman Mills.',
      keywords: ['blog', 'news', 'textile industry', 'trends'],
      ogType: 'website',
    },
    cart: {
      title: 'Shopping Cart',
      description: 'Review your selected items and proceed to checkout. Secure and hassle-free shopping at Vardhman Mills.',
      keywords: ['cart', 'shopping cart', 'checkout'],
      noindex: true,
      nofollow: true,
    },
    checkout: {
      title: 'Checkout',
      description: 'Complete your order securely. Fast shipping and quality assurance guaranteed.',
      noindex: true,
      nofollow: true,
    },
    account: {
      title: 'My Account',
      description: 'Manage your Vardhman Mills account, orders, and preferences.',
      noindex: true,
      nofollow: true,
    },
  },

  // Structured Data Configuration
  structured: {
    organization: {
      '@type': 'Organization',
      name: 'Vardhman Textiles Mills Pvt. Ltd.',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: 'Leading textile manufacturer offering premium quality fabrics and textile products since 1985.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Industrial Area, Phase 2',
        addressLocality: 'Ludhiana',
        addressRegion: 'Punjab',
        postalCode: '141003',
        addressCountry: 'IN',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+91-161-2345678',
          contactType: 'Customer Service',
          email: 'support@vardhmanmills.com',
          areaServed: 'IN',
          availableLanguage: ['English', 'Hindi', 'Punjabi'],
        },
        {
          '@type': 'ContactPoint',
          telephone: '+91-161-2345679',
          contactType: 'Sales',
          email: 'sales@vardhmanmills.com',
          areaServed: 'IN',
          availableLanguage: ['English', 'Hindi'],
        },
      ],
      sameAs: [
        'https://facebook.com/vardhmanmills',
        'https://instagram.com/vardhmanmills',
        'https://twitter.com/vardhmanmills',
        'https://linkedin.com/company/vardhmanmills',
        'https://youtube.com/@vardhmanmills',
      ],
      foundingDate: '1985',
      founders: ['Vardhman Group'],
    },
    website: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: 'Premium quality textiles and fabric manufacturing',
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    breadcrumb: true,
    product: true,
    review: true,
    offer: true,
  },

  // Open Graph Configuration
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
    alternateLocales: ['hi_IN', 'pa_IN'],
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Vardhman Mills - Premium Quality Textiles',
        type: 'image/jpeg',
      },
      {
        url: `${SITE_URL}/og-image-square.jpg`,
        width: 1200,
        height: 1200,
        alt: 'Vardhman Mills Logo',
        type: 'image/jpeg',
      },
    ],
  },

  // Twitter Card Configuration
  twitter: {
    card: 'summary_large_image',
    site: '@vardhmanmills',
    creator: '@vardhmanmills',
    images: [
      {
        url: `${SITE_URL}/twitter-image.jpg`,
        width: 1200,
        height: 675,
        alt: 'Vardhman Mills - Premium Quality Textiles',
      },
    ],
  },

  // Social Media Configuration
  social: {
    facebook: {
      appId: FB_APP_ID,
      pageId: 'vardhmanmills',
    },
    instagram: {
      username: 'vardhmanmills',
    },
    twitter: {
      username: 'vardhmanmills',
    },
    linkedin: {
      companyId: 'vardhmanmills',
    },
  },

  // Sitemap Configuration
  sitemap: {
    enabled: true,
    changefreq: 'daily',
    priority: 0.7,
    exclude: [
      '/admin',
      '/admin/*',
      '/api',
      '/api/*',
      '/auth/*',
      '/account/*',
      '/checkout',
      '/cart',
      '/_next/*',
      '/static/*',
    ],
    include: [
      '/',
      '/products',
      '/products/*',
      '/categories',
      '/categories/*',
      '/about',
      '/contact',
      '/blog',
      '/blog/*',
    ],
    generateRobotsTxt: true,
  },

  // Robots.txt Configuration
  robots: {
    userAgent: '*',
    allow: [
      '/',
      '/products',
      '/categories',
      '/about',
      '/contact',
      '/blog',
    ],
    disallow: [
      '/admin',
      '/admin/*',
      '/api',
      '/api/*',
      '/auth',
      '/auth/*',
      '/account',
      '/account/*',
      '/checkout',
      '/cart',
      '/_next',
      '/static',
    ],
    crawlDelay: 0,
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/products-sitemap.xml`,
      `${SITE_URL}/blog-sitemap.xml`,
    ],
  },

  // Schema.org Configuration
  schema: {
    enabled: true,
    types: [
      'Organization',
      'WebSite',
      'WebPage',
      'BreadcrumbList',
      'Product',
      'Offer',
      'Review',
      'AggregateRating',
      'Article',
      'BlogPosting',
    ],
    customSchemas: [],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate page title
 */
export const generatePageTitle = (title: string): string => {
  if (!title) return seoConfig.default.title;
  return seoConfig.default.titleTemplate.replace('%s', title);
};

/**
 * Get page SEO config
 */
export const getPageSEO = (pageName: string): PageSEO | undefined => {
  return seoConfig.pages[pageName];
};

/**
 * Generate meta tags
 */
export const generateMetaTags = (page: PageSEO) => {
  const title = generatePageTitle(page.title);
  const description = page.description || seoConfig.default.description;
  const keywords = [...seoConfig.default.keywords, ...(page.keywords || [])];
  const canonical = page.canonical || `${seoConfig.default.siteUrl}/${page.title.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    title,
    description,
    keywords: keywords.join(', '),
    canonical,
    robots: `${page.noindex ? 'noindex' : 'index'},${page.nofollow ? 'nofollow' : 'follow'}`,
  };
};

/**
 * Generate Open Graph tags
 */
export const generateOGTags = (page: PageSEO) => {
  const title = generatePageTitle(page.title);
  const description = page.description || seoConfig.default.description;
  const image = page.ogImage || seoConfig.openGraph.images[0];

  return {
    'og:type': page.ogType || seoConfig.openGraph.type,
    'og:site_name': seoConfig.openGraph.siteName,
    'og:title': title,
    'og:description': description,
    'og:image': image.url,
    'og:image:width': image.width.toString(),
    'og:image:height': image.height.toString(),
    'og:image:alt': image.alt,
    'og:locale': seoConfig.openGraph.locale,
  };
};

/**
 * Generate Twitter Card tags
 */
export const generateTwitterTags = (page: PageSEO) => {
  const title = generatePageTitle(page.title);
  const description = page.description || seoConfig.default.description;
  const image = seoConfig.twitter.images[0];

  return {
    'twitter:card': page.twitterCard || seoConfig.twitter.card,
    'twitter:site': seoConfig.twitter.site,
    'twitter:creator': seoConfig.twitter.creator,
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image.url,
    'twitter:image:alt': image.alt,
  };
};

/**
 * Generate Organization schema
 */
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  ...seoConfig.structured.organization,
});

/**
 * Generate Website schema
 */
export const generateWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  ...seoConfig.structured.website,
});

/**
 * Generate Breadcrumb schema
 */
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${seoConfig.default.siteUrl}${item.url}`,
  })),
});

/**
 * Generate Product schema
 */
export const generateProductSchema = (product: {
  name: string;
  description: string;
  image: string[];
  sku: string;
  price: number;
  currency: string;
  availability: string;
  brand?: string;
  rating?: { value: number; count: number };
  url?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.image,
  sku: product.sku,
  brand: {
    '@type': 'Brand',
    name: product.brand || seoConfig.default.siteName,
  },
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: product.currency,
    availability: `https://schema.org/${product.availability}`,
    url: product.url || `${seoConfig.default.siteUrl}/products/${product.sku}`,
  },
  ...(product.rating && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating.value,
      reviewCount: product.rating.count,
    },
  }),
});

/**
 * Generate Article schema
 */
export const generateArticleSchema = (article: {
  title: string;
  description: string;
  image: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: article.title,
  description: article.description,
  image: article.image,
  author: {
    '@type': 'Person',
    name: article.author,
  },
  publisher: {
    '@type': 'Organization',
    name: seoConfig.default.siteName,
    logo: {
      '@type': 'ImageObject',
      url: `${seoConfig.default.siteUrl}/logo.png`,
    },
  },
  datePublished: article.datePublished,
  dateModified: article.dateModified || article.datePublished,
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': article.url,
  },
});

/**
 * Generate FAQ schema
 */
export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

/**
 * Generate robots.txt content
 */
export const generateRobotsTxt = (): string => {
  const { robots } = seoConfig;
  let content = `User-agent: ${robots.userAgent}\n`;

  robots.allow.forEach(path => {
    content += `Allow: ${path}\n`;
  });

  robots.disallow.forEach(path => {
    content += `Disallow: ${path}\n`;
  });

  if (robots.crawlDelay) {
    content += `Crawl-delay: ${robots.crawlDelay}\n`;
  }

  content += '\n';
  robots.sitemap.forEach(sitemap => {
    content += `Sitemap: ${sitemap}\n`;
  });

  return content;
};

/**
 * Generate canonical URL
 */
export const generateCanonicalURL = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${seoConfig.default.siteUrl}${cleanPath}`;
};

/**
 * Extract keywords from text
 */
export const extractKeywords = (text: string, maxKeywords: number = 10): string[] => {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);

  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
};

/**
 * Generate meta description from content
 */
export const generateMetaDescription = (content: string, maxLength: number = 160): string => {
  const stripped = content.replace(/<[^>]*>/g, '').trim();
  return stripped.length > maxLength ? `${stripped.substring(0, maxLength - 3)}...` : stripped;
};

/**
 * Validate SEO config
 */
export const validateSEOConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!seoConfig.default.title) {
    errors.push('Default title is required');
  }

  if (!seoConfig.default.description) {
    errors.push('Default description is required');
  }

  if (!seoConfig.default.siteUrl) {
    errors.push('Site URL is required');
  }

  if (seoConfig.default.images.length === 0) {
    errors.push('At least one default image is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Get structured data for page
 */
export const getStructuredData = (pageType: string, data?: unknown) => {
  const schemas: Array<Record<string, unknown>> = [
    generateOrganizationSchema(),
    generateWebsiteSchema(),
  ];

  if (pageType === 'product' && data) {
    const productData = data as Parameters<typeof generateProductSchema>[0];
    const productSchema = generateProductSchema(productData);
    schemas.push(productSchema as Record<string, unknown>);
  }

  if (pageType === 'article' && data) {
    const articleData = data as Parameters<typeof generateArticleSchema>[0];
    const articleSchema = generateArticleSchema(articleData);
    schemas.push(articleSchema as Record<string, unknown>);
  }

  return schemas;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default seoConfig;

export {
  SITE_URL,
  SITE_NAME,
  IS_PRODUCTION,
};
