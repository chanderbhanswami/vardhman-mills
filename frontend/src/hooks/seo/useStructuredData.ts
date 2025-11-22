import { useState, useCallback, useMemo } from 'react';

export interface BreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

export interface ProductStructuredData {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description: string;
  image: string[];
  brand: {
    '@type': 'Brand';
    name: string;
  };
  sku: string;
  mpn?: string;
  offers: {
    '@type': 'Offer';
    url: string;
    priceCurrency: string;
    price: number;
    availability: string;
    seller: {
      '@type': 'Organization';
      name: string;
    };
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  review?: Array<{
    '@type': 'Review';
    author: {
      '@type': 'Person';
      name: string;
    };
    datePublished: string;
    reviewBody: string;
    reviewRating: {
      '@type': 'Rating';
      ratingValue: number;
      bestRating?: number;
      worstRating?: number;
    };
  }>;
}

export interface OrganizationStructuredData {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description?: string;
  foundingDate?: string;
  address?: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone: string;
    contactType: string;
    email?: string;
  };
  sameAs?: string[];
}

export interface ArticleStructuredData {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  image: string[];
  author: {
    '@type': 'Person';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  datePublished: string;
  dateModified?: string;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
}

export interface WebsiteStructuredData {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
}

export interface FAQStructuredData {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

export type StructuredDataType = 
  | ProductStructuredData
  | OrganizationStructuredData
  | ArticleStructuredData
  | WebsiteStructuredData
  | FAQStructuredData
  | Record<string, unknown>;

export interface UseStructuredDataOptions {
  autoInject?: boolean;
  validateSchema?: boolean;
}

export const useStructuredData = (options: UseStructuredDataOptions = {}) => {
  const { autoInject = true, validateSchema = true } = options;
  
  const [structuredDataItems, setStructuredDataItems] = useState<StructuredDataType[]>([]);

  // Validate structured data
  const isValidStructuredData = useCallback((data: StructuredDataType): boolean => {
    if (!data || typeof data !== 'object') return false;
    
    const requiredFields = ['@context', '@type'];
    return requiredFields.every(field => field in data);
  }, []);

  // Inject structured data into DOM
  const injectStructuredData = useCallback((data: StructuredDataType) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data, null, 2);
    script.setAttribute('data-structured-data', 'true');
    document.head.appendChild(script);
  }, []);

  // Remove injected structured data
  const removeInjectedStructuredData = useCallback((index: number) => {
    const scripts = document.querySelectorAll('script[data-structured-data="true"]');
    if (scripts[index]) {
      scripts[index].remove();
    }
  }, []);

  // Clear all injected structured data
  const clearAllInjectedStructuredData = useCallback(() => {
    const scripts = document.querySelectorAll('script[data-structured-data="true"]');
    scripts.forEach(script => script.remove());
  }, []);

  // Add structured data item
  const addStructuredData = useCallback((data: StructuredDataType) => {
    if (validateSchema && !isValidStructuredData(data)) {
      console.warn('Invalid structured data:', data);
      return false;
    }

    setStructuredDataItems(prev => [...prev, data]);

    if (autoInject && typeof document !== 'undefined') {
      injectStructuredData(data);
    }

    return true;
  }, [autoInject, validateSchema, isValidStructuredData, injectStructuredData]);

  // Remove structured data item
  const removeStructuredData = useCallback((index: number) => {
    setStructuredDataItems(prev => prev.filter((_, i) => i !== index));
    
    if (autoInject && typeof document !== 'undefined') {
      removeInjectedStructuredData(index);
    }
  }, [autoInject, removeInjectedStructuredData]);

  // Clear all structured data
  const clearStructuredData = useCallback(() => {
    setStructuredDataItems([]);
    
    if (autoInject && typeof document !== 'undefined') {
      clearAllInjectedStructuredData();
    }
  }, [autoInject, clearAllInjectedStructuredData]);

  // Create specific structured data types
  const createProductData = useCallback((product: {
    name: string;
    description: string;
    image: string | string[];
    brand: string;
    sku: string;
    mpn?: string;
    url: string;
    price: number;
    currency?: string;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder' | 'BackOrder';
    seller?: string;
    rating?: {
      value: number;
      count: number;
      best?: number;
      worst?: number;
    };
    reviews?: Array<{
      author: string;
      date: string;
      body: string;
      rating: number;
    }>;
  }): ProductStructuredData => {
    const images = Array.isArray(product.image) ? product.image : [product.image];
    
    const productData: ProductStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: images,
      brand: {
        '@type': 'Brand',
        name: product.brand,
      },
      sku: product.sku,
      offers: {
        '@type': 'Offer',
        url: product.url,
        priceCurrency: product.currency || 'INR',
        price: product.price,
        availability: `https://schema.org/${product.availability}`,
        seller: {
          '@type': 'Organization',
          name: product.seller || 'Vardhman Mills',
        },
      },
    };

    if (product.mpn) {
      productData.mpn = product.mpn;
    }

    if (product.rating) {
      productData.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating.value,
        reviewCount: product.rating.count,
        bestRating: product.rating.best || 5,
        worstRating: product.rating.worst || 1,
      };
    }

    if (product.reviews && product.reviews.length > 0) {
      productData.review = product.reviews.map(review => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author,
        },
        datePublished: review.date,
        reviewBody: review.body,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: product.rating?.best || 5,
          worstRating: product.rating?.worst || 1,
        },
      }));
    }

    return productData;
  }, []);

  const createOrganizationData = useCallback((org: {
    name: string;
    url: string;
    logo: string;
    description?: string;
    foundingDate?: string;
    address?: {
      street: string;
      city: string;
      region: string;
      postalCode: string;
      country: string;
    };
    contact?: {
      phone: string;
      email?: string;
      type?: string;
    };
    socialMedia?: string[];
  }): OrganizationStructuredData => {
    const orgData: OrganizationStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: org.name,
      url: org.url,
      logo: org.logo,
    };

    if (org.description) orgData.description = org.description;
    if (org.foundingDate) orgData.foundingDate = org.foundingDate;

    if (org.address) {
      orgData.address = {
        '@type': 'PostalAddress',
        streetAddress: org.address.street,
        addressLocality: org.address.city,
        addressRegion: org.address.region,
        postalCode: org.address.postalCode,
        addressCountry: org.address.country,
      };
    }

    if (org.contact) {
      orgData.contactPoint = {
        '@type': 'ContactPoint',
        telephone: org.contact.phone,
        contactType: org.contact.type || 'customer service',
      };
      if (org.contact.email) {
        orgData.contactPoint.email = org.contact.email;
      }
    }

    if (org.socialMedia) {
      orgData.sameAs = org.socialMedia;
    }

    return orgData;
  }, []);

  const createBreadcrumbData = useCallback((items: Array<{ name: string; url?: string }>): Record<string, unknown> => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  }), []);

  const createWebsiteData = useCallback((website: {
    name: string;
    url: string;
    description?: string;
    searchUrl?: string;
  }): WebsiteStructuredData => {
    const websiteData: WebsiteStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: website.name,
      url: website.url,
    };

    if (website.description) {
      websiteData.description = website.description;
    }

    if (website.searchUrl) {
      websiteData.potentialAction = {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: website.searchUrl,
        },
        'query-input': 'required name=search_term_string',
      };
    }

    return websiteData;
  }, []);

  const createFAQData = useCallback((faqs: Array<{ question: string; answer: string }>): FAQStructuredData => ({
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
  }), []);

  const createArticleData = useCallback((article: {
    headline: string;
    description: string;
    image: string | string[];
    author: string;
    publisher: string;
    publisherLogo: string;
    datePublished: string;
    dateModified?: string;
    url: string;
  }): ArticleStructuredData => {
    const images = Array.isArray(article.image) ? article.image : [article.image];
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.headline,
      description: article.description,
      image: images,
      author: {
        '@type': 'Person',
        name: article.author,
      },
      publisher: {
        '@type': 'Organization',
        name: article.publisher,
        logo: {
          '@type': 'ImageObject',
          url: article.publisherLogo,
        },
      },
      datePublished: article.datePublished,
      ...(article.dateModified && { dateModified: article.dateModified }),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': article.url,
      },
    };
  }, []);

  // Get all structured data as JSON-LD strings
  const getJSONLD = useMemo(() => {
    return structuredDataItems.map(item => JSON.stringify(item, null, 2));
  }, [structuredDataItems]);

  // Validate all structured data
  const validateAll = useCallback(() => {
    const results = structuredDataItems.map((item, index) => ({
      index,
      isValid: isValidStructuredData(item),
      data: item,
    }));

    const validCount = results.filter(r => r.isValid).length;
    const invalidCount = results.length - validCount;

    return {
      results,
      summary: {
        total: results.length,
        valid: validCount,
        invalid: invalidCount,
        isAllValid: invalidCount === 0,
      },
    };
  }, [structuredDataItems, isValidStructuredData]);

  return {
    // Data
    structuredData: structuredDataItems,
    
    // Actions
    addStructuredData,
    removeStructuredData,
    clearStructuredData,
    
    // Creators
    createProductData,
    createOrganizationData,
    createBreadcrumbData,
    createWebsiteData,
    createFAQData,
    createArticleData,
    
    // Validation
    validateAll,
    isValidStructuredData,
    
    // Export
    getJSONLD,
    
    // Stats
    stats: {
      count: structuredDataItems.length,
      types: Array.from(new Set(structuredDataItems.map(item => item['@type']).filter(Boolean))),
    },
  };
};

export default useStructuredData;
