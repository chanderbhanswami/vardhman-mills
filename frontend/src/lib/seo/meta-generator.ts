/**
 * Meta Generator for Vardhman Mills Frontend
 * Advanced SEO meta tags generation and management
 */

import { Metadata } from 'next';

// Meta tag interfaces
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogImageAlt?: string;
  twitterImage?: string;
  noindex?: boolean;
  nofollow?: boolean;
  robots?: string;
  author?: string;
  publisher?: string;
  locale?: string;
  alternateLocales?: string[];
  siteName?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  price?: {
    amount: string;
    currency: string;
  };
  availability?: 'in stock' | 'out of stock' | 'preorder';
  brand?: string;
  category?: string;
  productId?: string;
  sku?: string;
  condition?: 'new' | 'used' | 'refurbished';
  rating?: {
    value: number;
    count: number;
    best?: number;
    worst?: number;
  };
}

// Breadcrumb interface
export interface BreadcrumbItem {
  name: string;
  url: string;
  position: number;
}

// Organization schema
export interface OrganizationSchema {
  name: string;
  url: string;
  logo: string;
  description?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint?: {
    telephone: string;
    contactType: string;
    email?: string;
  };
  sameAs?: string[];
}

// Product schema
export interface ProductSchema {
  name: string;
  image: string[];
  description: string;
  brand: string;
  sku: string;
  mpn?: string;
  offers: {
    price: string;
    priceCurrency: string;
    availability: string;
    seller: {
      name: string;
    };
    validFrom?: string;
    validThrough?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  review?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    reviewRating: {
      ratingValue: number;
      bestRating?: number;
    };
  }>;
  category?: string;
  color?: string;
  material?: string;
  size?: string;
  weight?: string;
  dimensions?: {
    width: string;
    height: string;
    depth: string;
  };
}

// Article schema
export interface ArticleSchema {
  headline: string;
  image: string[];
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo: string;
  };
  datePublished: string;
  dateModified: string;
  description: string;
  articleBody?: string;
  wordCount?: number;
  articleSection?: string;
  keywords?: string[];
}

// Default configuration for Vardhman Mills
export const DEFAULT_SEO_CONFIG: Partial<SEOConfig> = {
  siteName: 'Vardhman Mills',
  author: 'Vardhman Mills',
  publisher: 'Vardhman Mills',
  locale: 'en_IN',
  type: 'website',
  keywords: ['textiles', 'fabrics', 'manufacturing', 'quality fabrics', 'India'],
};

// Default organization schema
export const DEFAULT_ORGANIZATION: OrganizationSchema = {
  name: 'Vardhman Mills',
  url: 'https://vardhmantextiles.com',
  logo: 'https://vardhmantextiles.com/logo.png',
  description: 'Leading textile manufacturer in India, specializing in high-quality fabrics and textiles.',
  address: {
    streetAddress: 'Industrial Area',
    addressLocality: 'Ludhiana',
    addressRegion: 'Punjab',
    postalCode: '141008',
    addressCountry: 'IN',
  },
  contactPoint: {
    telephone: '+91-161-1234567',
    contactType: 'customer service',
    email: 'info@vardhmantextiles.com',
  },
  sameAs: [
    'https://www.facebook.com/vardhmantextiles',
    'https://www.linkedin.com/company/vardhman-textiles',
    'https://twitter.com/vardhmantextiles',
  ],
};

/**
 * Meta Generator Service
 */
export class MetaGenerator {
  private static instance: MetaGenerator;
  private baseUrl: string;
  private defaultConfig: Partial<SEOConfig>;

  private constructor(baseUrl: string = 'https://vardhmantextiles.com') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultConfig = DEFAULT_SEO_CONFIG;
  }

  static getInstance(baseUrl?: string): MetaGenerator {
    if (!MetaGenerator.instance) {
      MetaGenerator.instance = new MetaGenerator(baseUrl);
    }
    return MetaGenerator.instance;
  }

  /**
   * Update default configuration
   */
  updateDefaults(config: Partial<SEOConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  /**
   * Generate basic metadata
   */
  generateMetadata(config: SEOConfig): Metadata {
    const fullConfig = { ...this.defaultConfig, ...config };
    const canonical = fullConfig.canonical || this.baseUrl;

    // Basic metadata
    const metadata: Metadata = {
      title: fullConfig.title,
      description: fullConfig.description,
      keywords: fullConfig.keywords?.join(', '),
      authors: fullConfig.author ? [{ name: fullConfig.author }] : undefined,
      creator: fullConfig.author,
      publisher: fullConfig.publisher,
      robots: this.generateRobotsString(fullConfig),
      alternates: {
        canonical,
        languages: this.generateAlternateLanguages(fullConfig),
      },
      openGraph: {
        title: fullConfig.title,
        description: fullConfig.description,
        url: canonical,
        siteName: fullConfig.siteName,
        locale: fullConfig.locale || 'en_IN',
        type: (fullConfig.type === 'product' ? 'website' : fullConfig.type) || 'website',
        images: fullConfig.ogImage ? [{
          url: fullConfig.ogImage,
          alt: fullConfig.ogImageAlt || fullConfig.title,
          width: 1200,
          height: 630,
        }] : undefined,
        ...(fullConfig.publishedTime && { publishedTime: fullConfig.publishedTime }),
        ...(fullConfig.modifiedTime && { modifiedTime: fullConfig.modifiedTime }),
        ...(fullConfig.section && { section: fullConfig.section }),
        ...(fullConfig.tags && { tags: fullConfig.tags }),
      },
      twitter: {
        card: 'summary_large_image',
        site: '@vardhmantextiles',
        creator: '@vardhmantextiles',
        title: fullConfig.title,
        description: fullConfig.description,
        images: fullConfig.twitterImage || fullConfig.ogImage ? [{
          url: fullConfig.twitterImage || fullConfig.ogImage!,
          alt: fullConfig.ogImageAlt || fullConfig.title,
        }] : undefined,
      },
      other: this.generateAdditionalMeta(fullConfig),
    };

    return metadata;
  }

  /**
   * Generate product metadata
   */
  generateProductMetadata(config: SEOConfig & { 
    productSchema: ProductSchema;
  }): Metadata {
    const baseMetadata = this.generateMetadata({
      ...config,
      type: 'product',
    });

    // Add structured data
    const structuredData = this.generateProductStructuredData(config.productSchema);

    return {
      ...baseMetadata,
      openGraph: {
        ...baseMetadata.openGraph,
        type: 'website', // NextJS doesn't support product type, use website
      },
      other: {
        ...Object.fromEntries(
          Object.entries((baseMetadata.other as Record<string, string | number | (string | number)[]>) || {})
            .filter(([, value]) => value !== undefined)
        ),
        'application/ld+json': JSON.stringify(structuredData),
        ...(config.price?.amount && { 'product:price:amount': config.price.amount }),
        ...(config.price?.currency && { 'product:price:currency': config.price.currency }),
        ...(config.availability && { 'product:availability': config.availability }),
        ...(config.brand && { 'product:brand': config.brand }),
        ...(config.category && { 'product:category': config.category }),
        ...(config.condition && { 'product:condition': config.condition }),
      },
    };
  }

  /**
   * Generate article metadata
   */
  generateArticleMetadata(config: SEOConfig & {
    articleSchema: ArticleSchema;
  }): Metadata {
    const baseMetadata = this.generateMetadata({
      ...config,
      type: 'article',
    });

    // Add article-specific Open Graph tags
    const articleOG = {
      ...baseMetadata.openGraph,
      type: 'article' as const,
      'article:author': config.articleSchema.author.name,
      'article:published_time': config.articleSchema.datePublished,
      'article:modified_time': config.articleSchema.dateModified,
      'article:section': config.articleSchema.articleSection,
      'article:tag': config.articleSchema.keywords,
    };

    // Add structured data
    const structuredData = this.generateArticleStructuredData(config.articleSchema);

    return {
      ...baseMetadata,
      openGraph: articleOG,
      other: {
        ...Object.fromEntries(
          Object.entries((baseMetadata.other as Record<string, string | number | (string | number)[]>) || {})
            .filter(([, value]) => value !== undefined)
        ),
        'application/ld+json': JSON.stringify(structuredData),
      },
    };
  }

  /**
   * Generate breadcrumb metadata
   */
  generateBreadcrumbMetadata(breadcrumbs: BreadcrumbItem[]): Record<string, string> {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item) => ({
        '@type': 'ListItem',
        position: item.position,
        name: item.name,
        item: `${this.baseUrl}${item.url}`,
      })),
    };

    return {
      'application/ld+json': JSON.stringify(structuredData),
    };
  }

  /**
   * Generate FAQ structured data
   */
  generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>): Record<string, string> {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    return {
      'application/ld+json': JSON.stringify(structuredData),
    };
  }

  /**
   * Generate organization structured data
   */
  generateOrganizationStructuredData(org: OrganizationSchema = DEFAULT_ORGANIZATION): Record<string, string> {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: org.name,
      url: org.url,
      logo: org.logo,
      description: org.description,
      address: org.address ? {
        '@type': 'PostalAddress',
        streetAddress: org.address.streetAddress,
        addressLocality: org.address.addressLocality,
        addressRegion: org.address.addressRegion,
        postalCode: org.address.postalCode,
        addressCountry: org.address.addressCountry,
      } : undefined,
      contactPoint: org.contactPoint ? {
        '@type': 'ContactPoint',
        telephone: org.contactPoint.telephone,
        contactType: org.contactPoint.contactType,
        email: org.contactPoint.email,
      } : undefined,
      sameAs: org.sameAs,
    };

    return {
      'application/ld+json': JSON.stringify(structuredData),
    };
  }

  /**
   * Generate website structured data
   */
  generateWebsiteStructuredData(): Record<string, string> {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Vardhman Mills',
      url: this.baseUrl,
      description: 'Leading textile manufacturer in India',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };

    return {
      'application/ld+json': JSON.stringify(structuredData),
    };
  }

  /**
   * Generate local business structured data
   */
  generateLocalBusinessStructuredData(business: {
    name: string;
    address: OrganizationSchema['address'];
    telephone: string;
    openingHours: string[];
    priceRange?: string;
    paymentAccepted?: string[];
  }): Record<string, string> {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: business.name,
      address: {
        '@type': 'PostalAddress',
        ...business.address,
      },
      telephone: business.telephone,
      openingHours: business.openingHours,
      priceRange: business.priceRange,
      paymentAccepted: business.paymentAccepted,
    };

    return {
      'application/ld+json': JSON.stringify(structuredData),
    };
  }

  /**
   * Generate review structured data
   */
  generateReviewStructuredData(reviews: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  }>, itemReviewed: { name: string; type: string }): Record<string, string> {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Review',
      itemReviewed: {
        '@type': itemReviewed.type,
        name: itemReviewed.name,
      },
      author: reviews.map(review => ({
        '@type': 'Person',
        name: review.author,
      })),
      datePublished: reviews[0]?.datePublished,
      reviewBody: reviews[0]?.reviewBody,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: reviews[0]?.ratingValue,
        bestRating: reviews[0]?.bestRating || 5,
        worstRating: reviews[0]?.worstRating || 1,
      },
    };

    return {
      'application/ld+json': JSON.stringify(structuredData),
    };
  }

  /**
   * Private helper methods
   */
  private generateRobotsString(config: SEOConfig): string {
    if (config.robots) return config.robots;

    const robots: string[] = [];
    
    if (config.noindex) robots.push('noindex');
    else robots.push('index');
    
    if (config.nofollow) robots.push('nofollow');
    else robots.push('follow');

    return robots.join(', ');
  }

  private generateAlternateLanguages(config: SEOConfig): Record<string, string> | undefined {
    if (!config.alternateLocales) return undefined;

    const languages: Record<string, string> = {};
    config.alternateLocales.forEach(locale => {
      languages[locale] = `${this.baseUrl}/${locale}`;
    });

    return languages;
  }

  private generateAdditionalMeta(config: SEOConfig): Record<string, string> {
    const meta: Record<string, string> = {};

    // Article specific meta
    if (config.type === 'article') {
      if (config.author) meta['article:author'] = config.author;
      if (config.publishedTime) meta['article:published_time'] = config.publishedTime;
      if (config.modifiedTime) meta['article:modified_time'] = config.modifiedTime;
      if (config.section) meta['article:section'] = config.section;
      if (config.tags) meta['article:tag'] = config.tags.join(', ');
    }

    // Product specific meta
    if (config.type === 'product') {
      if (config.price) {
        meta['product:price:amount'] = config.price.amount;
        meta['product:price:currency'] = config.price.currency;
      }
      if (config.availability) meta['product:availability'] = config.availability;
      if (config.brand) meta['product:brand'] = config.brand;
      if (config.category) meta['product:category'] = config.category;
      if (config.condition) meta['product:condition'] = config.condition;
    }

    // Additional SEO meta
    meta['theme-color'] = '#1f2937';
    meta['msapplication-TileColor'] = '#1f2937';
    meta['apple-mobile-web-app-capable'] = 'yes';
    meta['apple-mobile-web-app-status-bar-style'] = 'default';
    meta['format-detection'] = 'telephone=no';

    return meta;
  }

  private generateProductStructuredData(product: ProductSchema): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.image,
      description: product.description,
      brand: {
        '@type': 'Brand',
        name: product.brand,
      },
      sku: product.sku,
      mpn: product.mpn,
      offers: {
        '@type': 'Offer',
        price: product.offers.price,
        priceCurrency: product.offers.priceCurrency,
        availability: `https://schema.org/${product.offers.availability}`,
        seller: {
          '@type': 'Organization',
          name: product.offers.seller.name,
        },
        validFrom: product.offers.validFrom,
        validThrough: product.offers.validThrough,
      },
      aggregateRating: product.aggregateRating ? {
        '@type': 'AggregateRating',
        ratingValue: product.aggregateRating.ratingValue,
        reviewCount: product.aggregateRating.reviewCount,
        bestRating: product.aggregateRating.bestRating || 5,
        worstRating: product.aggregateRating.worstRating || 1,
      } : undefined,
      review: product.review?.map(review => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author,
        },
        datePublished: review.datePublished,
        reviewBody: review.reviewBody,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.reviewRating.ratingValue,
          bestRating: review.reviewRating.bestRating || 5,
        },
      })),
      category: product.category,
      color: product.color,
      material: product.material,
      size: product.size,
      weight: product.weight,
      width: product.dimensions?.width,
      height: product.dimensions?.height,
      depth: product.dimensions?.depth,
    };
  }

  private generateArticleStructuredData(article: ArticleSchema): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.headline,
      image: article.image,
      author: {
        '@type': 'Person',
        name: article.author.name,
        url: article.author.url,
      },
      publisher: {
        '@type': 'Organization',
        name: article.publisher.name,
        logo: {
          '@type': 'ImageObject',
          url: article.publisher.logo,
        },
      },
      datePublished: article.datePublished,
      dateModified: article.dateModified,
      description: article.description,
      articleBody: article.articleBody,
      wordCount: article.wordCount,
      articleSection: article.articleSection,
      keywords: article.keywords?.join(', '),
    };
  }
}

// Utility functions
export const MetaUtils = {
  /**
   * Generate page title with site name
   */
  generateTitle: (title: string, siteName: string = 'Vardhman Mills'): string => {
    return `${title} | ${siteName}`;
  },

  /**
   * Truncate description to optimal length
   */
  truncateDescription: (description: string, maxLength: number = 160): string => {
    if (description.length <= maxLength) return description;
    
    const truncated = description.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 
      ? `${truncated.substring(0, lastSpace)}...`
      : `${truncated}...`;
  },

  /**
   * Generate keywords from text
   */
  extractKeywords: (text: string, count: number = 10): string[] => {
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
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([word]) => word);
  },

  /**
   * Validate meta configuration
   */
  validateConfig: (config: SEOConfig): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config.title) errors.push('Title is required');
    if (!config.description) errors.push('Description is required');
    if (config.title && config.title.length > 60) errors.push('Title should be under 60 characters');
    if (config.description && config.description.length > 160) errors.push('Description should be under 160 characters');

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Generate canonical URL
   */
  generateCanonical: (baseUrl: string, path: string): string => {
    const cleanBase = baseUrl.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  },

  /**
   * Generate Open Graph image URL
   */
  generateOGImage: (baseUrl: string, title: string, description?: string): string => {
    const params = new URLSearchParams({
      title,
      ...(description && { description }),
    });

    return `${baseUrl}/api/og?${params.toString()}`;
  },
};

// Export singleton instance
export const metaGenerator = MetaGenerator.getInstance();

export default MetaGenerator;