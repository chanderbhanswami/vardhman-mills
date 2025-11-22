import { useEffect, useState, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
  robots?: string;
  viewport?: string;
  lang?: string;
  author?: string;
  publisher?: string;
  alternateUrls?: { hreflang: string; href: string }[];
  structuredData?: object[];
}

export interface SEOConfig {
  defaultTitle: string;
  titleTemplate?: string;
  defaultDescription: string;
  defaultKeywords: string[];
  siteUrl: string;
  siteName: string;
  defaultOgImage: string;
  twitterSite: string;
  twitterCreator: string;
  defaultLang: string;
  defaultAuthor: string;
  defaultPublisher: string;
  defaultRobots: string;
  defaultViewport: string;
}

export interface UseSEOOptions {
  config?: Partial<SEOConfig>;
  autoUpdate?: boolean;
  trackPageViews?: boolean;
}

const DEFAULT_CONFIG: SEOConfig = {
  defaultTitle: 'Vardhman Mills - Premium Textiles & Fashion',
  titleTemplate: '%s | Vardhman Mills',
  defaultDescription: 'Discover premium quality textiles, clothing, and fashion accessories at Vardhman Mills. Experience comfort, style, and durability in every product.',
  defaultKeywords: ['textiles', 'clothing', 'fashion', 'premium quality', 'vardhman mills', 'india'],
  siteUrl: 'https://vardhmanmills.com',
  siteName: 'Vardhman Mills',
  defaultOgImage: 'https://vardhmanmills.com/images/og-default.jpg',
  twitterSite: '@vardhmanmills',
  twitterCreator: '@vardhmanmills',
  defaultLang: 'en',
  defaultAuthor: 'Vardhman Mills',
  defaultPublisher: 'Vardhman Mills',
  defaultRobots: 'index, follow',
  defaultViewport: 'width=device-width, initial-scale=1',
};

export const useSEO = (initialData?: Partial<SEOData>, options: UseSEOOptions = {}) => {
  const {
    config = {},
    autoUpdate = true,
    trackPageViews = true,
  } = options;

  const pathname = usePathname();
  const [seoData, setSeoData] = useState<SEOData>(() => ({
    title: '',
    description: '',
    ...initialData,
  }));

  // Merge config with defaults
  const finalConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config,
  }), [config]);

  // Generate complete SEO data
  const completeSeoData = useMemo((): SEOData => {
    const canonical = seoData.canonical || `${finalConfig.siteUrl}${pathname.split('?')[0]}`;
    
    // Process title with template
    let processedTitle = seoData.title || finalConfig.defaultTitle;
    if (finalConfig.titleTemplate && seoData.title && seoData.title !== finalConfig.defaultTitle) {
      processedTitle = finalConfig.titleTemplate.replace('%s', seoData.title);
    }

    return {
      title: processedTitle,
      description: seoData.description || finalConfig.defaultDescription,
      keywords: seoData.keywords || finalConfig.defaultKeywords,
      canonical,
      ogTitle: seoData.ogTitle || processedTitle,
      ogDescription: seoData.ogDescription || seoData.description || finalConfig.defaultDescription,
      ogImage: seoData.ogImage || finalConfig.defaultOgImage,
      ogUrl: seoData.ogUrl || canonical,
      ogType: seoData.ogType || 'website',
      twitterCard: seoData.twitterCard || 'summary_large_image',
      twitterTitle: seoData.twitterTitle || processedTitle,
      twitterDescription: seoData.twitterDescription || seoData.description || finalConfig.defaultDescription,
      twitterImage: seoData.twitterImage || seoData.ogImage || finalConfig.defaultOgImage,
      twitterSite: seoData.twitterSite || finalConfig.twitterSite,
      twitterCreator: seoData.twitterCreator || finalConfig.twitterCreator,
      robots: seoData.robots || finalConfig.defaultRobots,
      viewport: seoData.viewport || finalConfig.defaultViewport,
      lang: seoData.lang || finalConfig.defaultLang,
      author: seoData.author || finalConfig.defaultAuthor,
      publisher: seoData.publisher || finalConfig.defaultPublisher,
      alternateUrls: seoData.alternateUrls || [],
      structuredData: seoData.structuredData || [],
    };
  }, [seoData, finalConfig, pathname]);

  // Track page views
  useEffect(() => {
    if (trackPageViews) {
      // Simulate analytics tracking
      console.log('Page view tracked:', {
        path: pathname,
        title: completeSeoData.title,
        timestamp: new Date().toISOString(),
      });
    }
  }, [pathname, completeSeoData.title, trackPageViews]);

  // Update document title when not using Next.js Head
  useEffect(() => {
    if (autoUpdate && typeof document !== 'undefined') {
      document.title = completeSeoData.title;
    }
  }, [completeSeoData.title, autoUpdate]);

  // Generate JSON-LD structured data
  const jsonLdData = useMemo(() => {
    const baseStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: finalConfig.siteName,
      url: finalConfig.siteUrl,
      logo: finalConfig.defaultOgImage,
      sameAs: [
        'https://www.facebook.com/vardhmanmills',
        'https://www.instagram.com/vardhmanmills',
        'https://www.linkedin.com/company/vardhmanmills',
      ],
    };

    return [baseStructuredData, ...(completeSeoData.structuredData || [])];
  }, [finalConfig, completeSeoData.structuredData]);

  // Update SEO data
  const updateSEO = useCallback((newData: Partial<SEOData>) => {
    setSeoData(prev => ({
      ...prev,
      ...newData,
    }));
  }, []);

  // Reset to defaults
  const resetSEO = useCallback(() => {
    setSeoData({
      title: '',
      description: '',
      ...initialData,
    });
  }, [initialData]);

  // Specific update functions
  const updateTitle = useCallback((title: string) => {
    updateSEO({ title });
  }, [updateSEO]);

  const updateDescription = useCallback((description: string) => {
    updateSEO({ description });
  }, [updateSEO]);

  const updateKeywords = useCallback((keywords: string[]) => {
    updateSEO({ keywords });
  }, [updateSEO]);

  const updateOgData = useCallback((ogData: Partial<Pick<SEOData, 'ogTitle' | 'ogDescription' | 'ogImage' | 'ogUrl' | 'ogType'>>) => {
    updateSEO(ogData);
  }, [updateSEO]);

  const updateTwitterData = useCallback((twitterData: Partial<Pick<SEOData, 'twitterCard' | 'twitterTitle' | 'twitterDescription' | 'twitterImage' | 'twitterSite' | 'twitterCreator'>>) => {
    updateSEO(twitterData);
  }, [updateSEO]);

  const addStructuredData = useCallback((data: object) => {
    setSeoData(prev => ({
      ...prev,
      structuredData: [...(prev.structuredData || []), data],
    }));
  }, []);

  const removeStructuredData = useCallback((index: number) => {
    setSeoData(prev => ({
      ...prev,
      structuredData: prev.structuredData?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  // Page type helpers
  const setPageType = useCallback((type: 'home' | 'product' | 'category' | 'article' | 'contact' | 'about') => {
    switch (type) {
      case 'home':
        updateSEO({
          title: finalConfig.defaultTitle,
          ogType: 'website',
          twitterCard: 'summary_large_image',
        });
        break;
      case 'product':
        updateSEO({
          ogType: 'product',
          twitterCard: 'summary_large_image',
        });
        break;
      case 'category':
        updateSEO({
          ogType: 'website',
          twitterCard: 'summary',
        });
        break;
      case 'article':
        updateSEO({
          ogType: 'article',
          twitterCard: 'summary_large_image',
        });
        break;
      default:
        updateSEO({
          ogType: 'website',
          twitterCard: 'summary',
        });
    }
  }, [updateSEO, finalConfig.defaultTitle]);

  // Validation helpers
  const validateSEO = useCallback(() => {
    const issues: string[] = [];

    if (!completeSeoData.title) issues.push('Title is required');
    if (completeSeoData.title.length > 60) issues.push('Title should be under 60 characters');
    if (!completeSeoData.description) issues.push('Description is required');
    if (completeSeoData.description.length > 160) issues.push('Description should be under 160 characters');
    if (!completeSeoData.canonical) issues.push('Canonical URL is required');
    if (!completeSeoData.ogImage) issues.push('OG Image is required');

    return {
      isValid: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 15)),
    };
  }, [completeSeoData]);

  // Generate preview data
  const getPreviewData = useCallback(() => ({
    google: {
      title: completeSeoData.title,
      url: completeSeoData.canonical,
      description: completeSeoData.description,
    },
    facebook: {
      title: completeSeoData.ogTitle,
      description: completeSeoData.ogDescription,
      image: completeSeoData.ogImage,
      url: completeSeoData.ogUrl,
    },
    twitter: {
      title: completeSeoData.twitterTitle,
      description: completeSeoData.twitterDescription,
      image: completeSeoData.twitterImage,
      card: completeSeoData.twitterCard,
    },
  }), [completeSeoData]);

  // SEO Head data for components
  const getSEOHeadData = useCallback(() => ({
    title: completeSeoData.title,
    meta: [
      { name: 'description', content: completeSeoData.description },
      ...(completeSeoData.keywords ? [{ name: 'keywords', content: completeSeoData.keywords.join(', ') }] : []),
      { name: 'robots', content: completeSeoData.robots },
      { name: 'viewport', content: completeSeoData.viewport },
      { name: 'author', content: completeSeoData.author },
      { name: 'publisher', content: completeSeoData.publisher },
      { property: 'og:title', content: completeSeoData.ogTitle },
      { property: 'og:description', content: completeSeoData.ogDescription },
      { property: 'og:image', content: completeSeoData.ogImage },
      { property: 'og:url', content: completeSeoData.ogUrl },
      { property: 'og:type', content: completeSeoData.ogType },
      { property: 'og:site_name', content: finalConfig.siteName },
      { name: 'twitter:card', content: completeSeoData.twitterCard },
      { name: 'twitter:title', content: completeSeoData.twitterTitle },
      { name: 'twitter:description', content: completeSeoData.twitterDescription },
      { name: 'twitter:image', content: completeSeoData.twitterImage },
      { name: 'twitter:site', content: completeSeoData.twitterSite },
      { name: 'twitter:creator', content: completeSeoData.twitterCreator }
    ],
    links: [
      { rel: 'canonical', href: completeSeoData.canonical },
      ...(completeSeoData.alternateUrls?.map(alt => ({ rel: 'alternate', hrefLang: alt.hreflang, href: alt.href })) || [])
    ],
    structuredData: jsonLdData
  }), [completeSeoData, finalConfig.siteName, jsonLdData]);

  return {
    // SEO data
    seo: completeSeoData,
    config: finalConfig,
    
    // Head data
    getSEOHeadData,
    
    // Update functions
    updateSEO,
    updateTitle,
    updateDescription,
    updateKeywords,
    updateOgData,
    updateTwitterData,
    addStructuredData,
    removeStructuredData,
    resetSEO,
    
    // Page type helpers
    setPageType,
    
    // Validation
    validation: validateSEO(),
    
    // Preview data
    preview: getPreviewData(),
    
    // JSON-LD
    jsonLd: jsonLdData,
    
    // Raw data for custom implementations
    rawData: seoData,
  };
};

export default useSEO;
