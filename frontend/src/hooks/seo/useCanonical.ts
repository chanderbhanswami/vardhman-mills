import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';

export interface CanonicalConfig {
  baseUrl: string;
  removeTrailingSlash?: boolean;
  removeQueryParams?: boolean;
  forceHttps?: boolean;
  customPath?: string;
}

export interface UseCanonicalOptions {
  config?: Partial<CanonicalConfig>;
  disabled?: boolean;
  priority?: number;
}

const DEFAULT_CONFIG: CanonicalConfig = {
  baseUrl: 'https://vardhmanmills.com',
  removeTrailingSlash: true,
  removeQueryParams: true,
  forceHttps: true,
};

export const useCanonical = (options: UseCanonicalOptions = {}) => {
  const { config = {}, disabled = false, priority = 1 } = options;
  const pathname = usePathname();
  
  // Merge config with defaults
  const finalConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config,
  }), [config]);

  // Generate canonical URL
  const canonicalUrl = useMemo(() => {
    if (disabled) return null;

    let url = finalConfig.baseUrl;
    
    // Force HTTPS if needed
    if (finalConfig.forceHttps && !url.startsWith('https://')) {
      url = url.replace(/^https?:\/\//, 'https://');
    }

    // Use custom path or router path
    let path = finalConfig.customPath || pathname;

    // Remove query parameters if configured
    if (finalConfig.removeQueryParams && path.includes('?')) {
      path = path.split('?')[0];
    }

    // Remove hash fragment
    if (path.includes('#')) {
      path = path.split('#')[0];
    }

    // Handle trailing slash
    if (finalConfig.removeTrailingSlash) {
      path = path.replace(/\/$/, '') || '/';
    } else if (!path.endsWith('/') && path !== '/') {
      path += '/';
    }

    // Combine base URL and path
    const fullUrl = url + path;

    return fullUrl;
  }, [finalConfig, pathname, disabled]);

  // Update canonical link in head
  useEffect(() => {
    if (!canonicalUrl || disabled) {
      return;
    }

    // Remove existing canonical link
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Create new canonical link
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = canonicalUrl;
    
    // Set priority (for multiple canonical hooks)
    canonicalLink.setAttribute('data-priority', priority.toString());

    // Insert into head
    document.head.appendChild(canonicalLink);

    // Cleanup function
    return () => {
      const linkToRemove = document.querySelector(`link[rel="canonical"][href="${canonicalUrl}"]`);
      if (linkToRemove) {
        linkToRemove.remove();
      }
    };
  }, [canonicalUrl, disabled, priority]);

  // Utility functions
  const updateCanonicalUrl = (newPath: string) => {
    let url = finalConfig.baseUrl;
    
    if (finalConfig.forceHttps && !url.startsWith('https://')) {
      url = url.replace(/^https?:\/\//, 'https://');
    }

    if (finalConfig.removeTrailingSlash) {
      newPath = newPath.replace(/\/$/, '') || '/';
    } else if (!newPath.endsWith('/') && newPath !== '/') {
      newPath += '/';
    }

    const fullUrl = url + newPath;

    // Update existing canonical link
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.setAttribute('href', fullUrl);
    }

    return fullUrl;
  };

  const getCanonicalForPath = (path: string): string => {
    let url = finalConfig.baseUrl;
    
    if (finalConfig.forceHttps && !url.startsWith('https://')) {
      url = url.replace(/^https?:\/\//, 'https://');
    }

    // Remove query parameters if configured
    if (finalConfig.removeQueryParams && path.includes('?')) {
      path = path.split('?')[0];
    }

    // Remove hash fragment
    if (path.includes('#')) {
      path = path.split('#')[0];
    }

    // Handle trailing slash
    if (finalConfig.removeTrailingSlash) {
      path = path.replace(/\/$/, '') || '/';
    } else if (!path.endsWith('/') && path !== '/') {
      path += '/';
    }

    return url + path;
  };

  const isCanonicalSet = (): boolean => {
    return !!document.querySelector('link[rel="canonical"]');
  };

  const getCurrentCanonical = (): string | null => {
    const canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    return canonicalLink?.href || null;
  };

  const removeCanonical = () => {
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }
  };

  // Validation functions
  const validateCanonicalUrl = (url: string): boolean => {
    try {
      const urlObject = new URL(url);
      return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const getCanonicalStatus = () => {
    const currentCanonical = getCurrentCanonical();
    
    return {
      isSet: isCanonicalSet(),
      url: currentCanonical,
      isValid: currentCanonical ? validateCanonicalUrl(currentCanonical) : false,
      matches: currentCanonical === canonicalUrl,
      config: finalConfig,
    };
  };

  // Alternative URL generators
  const getAlternativeUrls = () => {
    if (!canonicalUrl) return {};

    const baseWithoutTrailing = canonicalUrl.replace(/\/$/, '');
    const baseWithTrailing = canonicalUrl.endsWith('/') ? canonicalUrl : canonicalUrl + '/';

    return {
      canonical: canonicalUrl,
      withTrailingSlash: baseWithTrailing,
      withoutTrailingSlash: baseWithoutTrailing,
      withQueryParams: pathname.includes('?') 
        ? finalConfig.baseUrl + pathname 
        : canonicalUrl,
      absolute: canonicalUrl,
      relative: canonicalUrl.replace(finalConfig.baseUrl, ''),
    };
  };

  return {
    // Primary canonical URL
    canonicalUrl,
    
    // Configuration
    config: finalConfig,
    
    // Status and validation
    status: getCanonicalStatus(),
    isSet: isCanonicalSet(),
    isValid: canonicalUrl ? validateCanonicalUrl(canonicalUrl) : false,
    
    // Utility functions
    updateCanonicalUrl,
    getCanonicalForPath,
    getCurrentCanonical,
    removeCanonical,
    validateCanonicalUrl,
    
    // Alternative URLs
    alternatives: getAlternativeUrls(),
    
    // Debugging helpers
    debug: {
      routerPath: pathname,
      configuredPath: finalConfig.customPath,
      baseUrl: finalConfig.baseUrl,
      finalUrl: canonicalUrl,
      disabled,
      priority,
    },
  };
};

export default useCanonical;
