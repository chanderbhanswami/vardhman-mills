/**
 * SEO Utilities
 * Comprehensive SEO optimization helpers for meta tags, structured data, and search engine optimization
 */

import { Metadata } from 'next';

// Types
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  siteName?: string;
  locale?: string;
  alternateLocales?: string[];
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  category?: string;
  tags?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface StructuredDataConfig {
  type: 'Website' | 'Organization' | 'Product' | 'Article' | 'BreadcrumbList' | 'LocalBusiness' | 'Review' | 'FAQ';
  data: Record<string, unknown>;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Generate Next.js metadata object from SEO config
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords,
    canonical,
    ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    siteName,
    locale = 'en_US',
    alternateLocales,
    author,
    publishedDate,
    modifiedDate,
    noIndex = false,
    noFollow = false
  } = config;

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords?.join(', '),
    authors: author ? [{ name: author }] : undefined,
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: ogType,
      title,
      description,
      siteName,
      locale,
      alternateLocale: alternateLocales,
      images: ogImage ? [{ url: ogImage, alt: title }] : undefined,
      publishedTime: publishedDate,
      modifiedTime: modifiedDate,
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: canonical,
    },
  };

  return metadata;
}

/**
 * Generate structured data JSON-LD
 */
export function generateStructuredData(config: StructuredDataConfig): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': config.type,
    ...config.data,
  };

  return JSON.stringify(structuredData, null, 2);
}

/**
 * Generate website structured data
 */
export function generateWebsiteStructuredData(config: {
  name: string;
  url: string;
  description?: string;
  logo?: string;
  sameAs?: string[];
}): string {
  return generateStructuredData({
    type: 'Website',
    data: {
      name: config.name,
      url: config.url,
      description: config.description,
      image: config.logo,
      sameAs: config.sameAs,
    },
  });
}

/**
 * Generate organization structured data
 */
export function generateOrganizationStructuredData(config: {
  name: string;
  url: string;
  logo?: string;
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
}): string {
  return generateStructuredData({
    type: 'Organization',
    data: config,
  });
}

/**
 * Generate product structured data
 */
export function generateProductStructuredData(config: {
  name: string;
  description: string;
  image?: string[];
  brand?: string;
  sku?: string;
  mpn?: string;
  offers: {
    price: number;
    priceCurrency: string;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder';
    url?: string;
    seller?: {
      name: string;
      url?: string;
    };
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  review?: Array<{
    reviewRating: {
      ratingValue: number;
      bestRating?: number;
    };
    author: {
      name: string;
    };
    reviewBody?: string;
    datePublished?: string;
  }>;
}): string {
  return generateStructuredData({
    type: 'Product',
    data: config,
  });
}

/**
 * Generate article structured data
 */
export function generateArticleStructuredData(config: {
  headline: string;
  description: string;
  image?: string[];
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo?: {
      url: string;
      width?: number;
      height?: number;
    };
  };
  datePublished: string;
  dateModified?: string;
  articleSection?: string;
  keywords?: string[];
}): string {
  return generateStructuredData({
    type: 'Article',
    data: config,
  });
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: BreadcrumbItem[]): string {
  const listItems = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  }));

  return generateStructuredData({
    type: 'BreadcrumbList',
    data: {
      itemListElement: listItems,
    },
  });
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: FAQItem[]): string {
  const mainEntity = faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  }));

  return generateStructuredData({
    type: 'FAQ',
    data: {
      mainEntity,
    },
  });
}

/**
 * Generate local business structured data
 */
export function generateLocalBusinessStructuredData(config: {
  name: string;
  image?: string[];
  telephone: string;
  email?: string;
  url?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  priceRange?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}): string {
  return generateStructuredData({
    type: 'LocalBusiness',
    data: config,
  });
}

/**
 * Optimize title for SEO
 */
export function optimizeTitle(title: string, siteName?: string, maxLength = 60): string {
  let optimizedTitle = title.trim();
  
  // Add site name if provided and title doesn't already contain it
  if (siteName && !optimizedTitle.toLowerCase().includes(siteName.toLowerCase())) {
    const separator = ' | ';
    const titleWithSite = `${optimizedTitle}${separator}${siteName}`;
    
    if (titleWithSite.length <= maxLength) {
      optimizedTitle = titleWithSite;
    }
  }
  
  // Truncate if too long
  if (optimizedTitle.length > maxLength) {
    optimizedTitle = optimizedTitle.substring(0, maxLength - 3) + '...';
  }
  
  return optimizedTitle;
}

/**
 * Optimize description for SEO
 */
export function optimizeDescription(description: string, maxLength = 160): string {
  let optimizedDescription = description.trim();
  
  // Remove extra whitespace
  optimizedDescription = optimizedDescription.replace(/\s+/g, ' ');
  
  // Truncate if too long
  if (optimizedDescription.length > maxLength) {
    optimizedDescription = optimizedDescription.substring(0, maxLength - 3) + '...';
  }
  
  return optimizedDescription;
}

/**
 * Generate keywords from content
 */
export function generateKeywords(content: string, maxKeywords = 10): string[] {
  // Remove HTML tags and special characters
  const cleanContent = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .toLowerCase();
  
  // Split into words and filter
  const words = cleanContent
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !isStopWord(word));
  
  // Count word frequency
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Check if word is a stop word
 */
function isStopWord(word: string): boolean {
  const stopWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
  ];
  
  return stopWords.includes(word.toLowerCase());
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validate meta description length
 */
export function validateMetaDescription(description: string): {
  isValid: boolean;
  length: number;
  recommendation: string;
} {
  const length = description.length;
  let isValid = true;
  let recommendation = '';
  
  if (length < 120) {
    isValid = false;
    recommendation = 'Meta description is too short. Aim for 120-160 characters.';
  } else if (length > 160) {
    isValid = false;
    recommendation = 'Meta description is too long. Keep it under 160 characters.';
  } else {
    recommendation = 'Meta description length is optimal.';
  }
  
  return { isValid, length, recommendation };
}

/**
 * Validate title length
 */
export function validateTitle(title: string): {
  isValid: boolean;
  length: number;
  recommendation: string;
} {
  const length = title.length;
  let isValid = true;
  let recommendation = '';
  
  if (length < 30) {
    isValid = false;
    recommendation = 'Title is too short. Aim for 30-60 characters.';
  } else if (length > 60) {
    isValid = false;
    recommendation = 'Title is too long. Keep it under 60 characters.';
  } else {
    recommendation = 'Title length is optimal.';
  }
  
  return { isValid, length, recommendation };
}

/**
 * Generate canonical URL
 */
export function generateCanonicalURL(baseURL: string, path: string): string {
  // Remove trailing slash from baseURL and leading slash from path
  const cleanBaseURL = baseURL.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  
  return `${cleanBaseURL}/${cleanPath}`;
}

/**
 * Generate robots meta content
 */
export function generateRobotsMeta(options: {
  index?: boolean;
  follow?: boolean;
  archive?: boolean;
  snippet?: boolean;
  imageIndex?: boolean;
}): string {
  const {
    index = true,
    follow = true,
    archive = true,
    snippet = true,
    imageIndex = true
  } = options;
  
  const directives: string[] = [];
  
  directives.push(index ? 'index' : 'noindex');
  directives.push(follow ? 'follow' : 'nofollow');
  
  if (!archive) directives.push('noarchive');
  if (!snippet) directives.push('nosnippet');
  if (!imageIndex) directives.push('noimageindex');
  
  return directives.join(', ');
}

/**
 * Extract text content from HTML
 */
export function extractTextContent(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate reading time
 */
export function calculateReadingTime(content: string, wordsPerMinute = 200): {
  minutes: number;
  seconds: number;
  text: string;
} {
  const text = extractTextContent(content);
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const minutes = Math.floor(wordCount / wordsPerMinute);
  const seconds = Math.round((wordCount % wordsPerMinute) / wordsPerMinute * 60);
  
  let readingTimeText = '';
  if (minutes > 0) {
    readingTimeText = `${minutes} min`;
    if (seconds > 30) readingTimeText += ` ${Math.round(seconds / 10) * 10} sec`;
  } else {
    readingTimeText = `${Math.max(1, Math.round(seconds / 10) * 10)} sec`;
  }
  
  return {
    minutes,
    seconds,
    text: readingTimeText
  };
}

// Alias exports for compatibility
export const generateMetaTags = generateMetadata;

/**
 * SEO utilities collection
 */
export const seoUtils = {
  generateMetadata,
  generateMetaTags,
  generateStructuredData,
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
  generateProductStructuredData,
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
  generateFAQStructuredData,
  generateLocalBusinessStructuredData,
  optimizeTitle,
  optimizeDescription,
  generateKeywords,
  generateSlug,
  validateMetaDescription,
  validateTitle,
  generateCanonicalURL,
  generateRobotsMeta,
  extractTextContent,
  calculateReadingTime
};

// Export default
const seoUtilities = {
  generateMetadata,
  generateStructuredData,
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
  generateProductStructuredData,
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
  generateFAQStructuredData,
  generateLocalBusinessStructuredData,
  optimizeTitle,
  optimizeDescription,
  generateKeywords,
  generateSlug,
  validateMetaDescription,
  validateTitle,
  generateCanonicalURL,
  generateRobotsMeta,
  extractTextContent,
  calculateReadingTime,
  seoUtils
};

export default seoUtilities;
