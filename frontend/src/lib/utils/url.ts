/**
 * URL Utilities
 * Comprehensive URL parsing, validation, manipulation, and construction functions
 */

// Types
export interface ParsedURL {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  searchParams: Record<string, string>;
  pathSegments: string[];
}

export interface URLBuilderOptions {
  protocol?: string;
  hostname?: string;
  port?: number | string;
  pathname?: string;
  searchParams?: Record<string, string | number | boolean>;
  hash?: string;
}

/**
 * Check if URL is valid
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if URL is absolute
 */
export function isAbsoluteURL(url: string): boolean {
  return /^https?:\/\//.test(url);
}

/**
 * Check if URL is relative
 */
export function isRelativeURL(url: string): boolean {
  return !isAbsoluteURL(url) && !url.startsWith('//');
}

/**
 * Parse URL into components
 */
export function parseURL(url: string): ParsedURL | null {
  try {
    const urlObj = new URL(url);
    const searchParams: Record<string, string> = {};
    
    urlObj.searchParams.forEach((value, key) => {
      searchParams[key] = value;
    });

    return {
      protocol: urlObj.protocol,
      host: urlObj.host,
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      origin: urlObj.origin,
      searchParams,
      pathSegments: urlObj.pathname.split('/').filter(segment => segment.length > 0)
    };
  } catch {
    return null;
  }
}

/**
 * Build URL from components
 */
export function buildURL(options: URLBuilderOptions): string {
  const {
    protocol = 'https',
    hostname = 'localhost',
    port,
    pathname = '',
    searchParams = {},
    hash = ''
  } = options;

  let url = `${protocol}://${hostname}`;
  
  if (port) {
    url += `:${port}`;
  }
  
  if (pathname) {
    const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    url += cleanPath;
  }
  
  // Add search parameters
  const searchParamsArray: string[] = [];
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParamsArray.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  });
  
  if (searchParamsArray.length > 0) {
    url += `?${searchParamsArray.join('&')}`;
  }
  
  if (hash) {
    const cleanHash = hash.startsWith('#') ? hash : `#${hash}`;
    url += cleanHash;
  }
  
  return url;
}

/**
 * Add query parameters to URL
 */
export function addQueryParams(url: string, params: Record<string, string | number | boolean>): string {
  try {
    const urlObj = new URL(url);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        urlObj.searchParams.set(key, String(value));
      }
    });
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Remove query parameters from URL
 */
export function removeQueryParams(url: string, params: string[]): string {
  try {
    const urlObj = new URL(url);
    
    params.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Get query parameter value
 */
export function getQueryParam(url: string, param: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get(param);
  } catch {
    return null;
  }
}

/**
 * Get all query parameters
 */
export function getQueryParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } catch {
    // Fallback for invalid URLs
    const searchString = url.includes('?') ? url.split('?')[1] : '';
    if (searchString) {
      const pairs = searchString.split('&');
      pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) {
          params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
      });
    }
  }
  
  return params;
}

/**
 * Join URL paths safely
 */
export function joinPaths(...paths: string[]): string {
  return paths
    .map((path, index) => {
      // Remove leading slash from all except first
      if (index > 0 && path.startsWith('/')) {
        path = path.substring(1);
      }
      // Remove trailing slash from all except last (if it originally had one)
      if (index < paths.length - 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
      }
      return path;
    })
    .filter(path => path.length > 0)
    .join('/');
}

/**
 * Resolve relative URL against base URL
 */
export function resolveURL(base: string, relative: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

/**
 * Get base URL (protocol + hostname + port)
 */
export function getBaseURL(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.origin;
  } catch {
    return '';
  }
}

/**
 * Get domain from URL
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Get subdomain from URL
 */
export function getSubdomain(url: string): string {
  try {
    const hostname = getDomain(url);
    const parts = hostname.split('.');
    
    // Return subdomain if there are more than 2 parts (e.g., sub.example.com)
    if (parts.length > 2) {
      return parts.slice(0, -2).join('.');
    }
    
    return '';
  } catch {
    return '';
  }
}

/**
 * Get top-level domain from URL
 */
export function getTLD(url: string): string {
  try {
    const hostname = getDomain(url);
    const parts = hostname.split('.');
    return parts[parts.length - 1] || '';
  } catch {
    return '';
  }
}

/**
 * Normalize URL (remove trailing slashes, convert to lowercase, etc.)
 */
export function normalizeURL(url: string, options: {
  removeTrailingSlash?: boolean;
  lowercase?: boolean;
  removeDefaultPort?: boolean;
  sortParams?: boolean;
} = {}): string {
  const {
    removeTrailingSlash = true,
    lowercase = true,
    removeDefaultPort = true,
    sortParams = false
  } = options;

  try {
    const urlObj = new URL(url);
    
    // Convert to lowercase
    if (lowercase) {
      urlObj.protocol = urlObj.protocol.toLowerCase();
      urlObj.hostname = urlObj.hostname.toLowerCase();
    }
    
    // Remove default ports
    if (removeDefaultPort) {
      if ((urlObj.protocol === 'http:' && urlObj.port === '80') ||
          (urlObj.protocol === 'https:' && urlObj.port === '443')) {
        urlObj.port = '';
      }
    }
    
    // Remove trailing slash from pathname
    if (removeTrailingSlash && urlObj.pathname.endsWith('/') && urlObj.pathname.length > 1) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    
    // Sort query parameters
    if (sortParams) {
      const params = new URLSearchParams(urlObj.search);
      const sortedParams = new URLSearchParams();
      
      Array.from(params.keys()).sort().forEach(key => {
        params.getAll(key).forEach(value => {
          sortedParams.append(key, value);
        });
      });
      
      urlObj.search = sortedParams.toString();
    }
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Check if two URLs are the same (after normalization)
 */
export function isSameURL(url1: string, url2: string): boolean {
  try {
    const normalized1 = normalizeURL(url1, { sortParams: true });
    const normalized2 = normalizeURL(url2, { sortParams: true });
    return normalized1 === normalized2;
  } catch {
    return false;
  }
}

/**
 * Extract file extension from URL
 */
export function getFileExtension(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastDot = pathname.lastIndexOf('.');
    const lastSlash = pathname.lastIndexOf('/');
    
    if (lastDot > lastSlash && lastDot !== -1) {
      return pathname.substring(lastDot + 1).toLowerCase();
    }
    
    return '';
  } catch {
    return '';
  }
}

/**
 * Get filename from URL
 */
export function getFilename(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split('/');
    return parts[parts.length - 1] || '';
  } catch {
    return '';
  }
}

/**
 * Check if URL points to an image
 */
export function isImageURL(url: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'];
  const extension = getFileExtension(url);
  return imageExtensions.includes(extension);
}

/**
 * Check if URL points to a video
 */
export function isVideoURL(url: string): boolean {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'];
  const extension = getFileExtension(url);
  return videoExtensions.includes(extension);
}

/**
 * Check if URL points to an audio file
 */
export function isAudioURL(url: string): boolean {
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'];
  const extension = getFileExtension(url);
  return audioExtensions.includes(extension);
}

/**
 * Generate safe filename from URL
 */
export function urlToSafeFilename(url: string): string {
  try {
    const urlObj = new URL(url);
    let filename = urlObj.hostname + urlObj.pathname;
    
    // Replace unsafe characters
    filename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Remove multiple underscores
    filename = filename.replace(/_+/g, '_');
    
    // Remove leading/trailing underscores
    filename = filename.replace(/^_+|_+$/g, '');
    
    return filename || 'url';
  } catch {
    return 'invalid_url';
  }
}

/**
 * Shorten URL for display
 */
export function shortenURL(url: string, maxLength = 50): string {
  if (url.length <= maxLength) return url;
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const pathname = urlObj.pathname;
    
    if (domain.length >= maxLength - 3) {
      return domain.substring(0, maxLength - 3) + '...';
    }
    
    const availableLength = maxLength - domain.length - 3; // 3 for "..."
    
    if (pathname.length <= availableLength) {
      return domain + pathname;
    }
    
    return domain + pathname.substring(0, availableLength) + '...';
  } catch {
    return url.substring(0, maxLength - 3) + '...';
  }
}

/**
 * Convert relative URL to absolute using current location
 */
export function makeAbsolute(relativeURL: string): string {
  if (typeof window === 'undefined') return relativeURL;
  
  try {
    return new URL(relativeURL, window.location.href).href;
  } catch {
    return relativeURL;
  }
}

/**
 * Get current page URL (client-side only)
 */
export function getCurrentURL(): string {
  if (typeof window === 'undefined') return '';
  return window.location.href;
}

/**
 * Update current URL without page reload (client-side only)
 */
export function updateURL(url: string, replace = false): void {
  if (typeof window === 'undefined') return;
  
  if (replace) {
    window.history.replaceState({}, '', url);
  } else {
    window.history.pushState({}, '', url);
  }
}

/**
 * Parse URL hash into object
 */
export function parseHash(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  
  if (!hash) return params;
  
  const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;
  
  if (cleanHash.includes('=')) {
    // Parse as query string format (#key1=value1&key2=value2)
    const pairs = cleanHash.split('&');
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    });
  } else if (cleanHash.includes('/')) {
    // Parse as path format (#/path/to/resource)
    const segments = cleanHash.split('/').filter(s => s.length > 0);
    segments.forEach((segment, index) => {
      params[`segment${index}`] = decodeURIComponent(segment);
    });
  } else {
    // Simple hash value
    params.hash = decodeURIComponent(cleanHash);
  }
  
  return params;
}

/**
 * Build hash string from object
 */
export function buildHash(params: Record<string, string | number>): string {
  const pairs: string[] = [];
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  });
  
  return pairs.length > 0 ? `#${pairs.join('&')}` : '';
}

// Alias exports for compatibility
export const buildUrl = buildURL;
export const parseQueryString = getQueryParams;
export const stringifyQueryString = (params: Record<string, string | number | boolean>): string => {
  const pairs: string[] = [];
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  });
  return pairs.join('&');
};
export const isValidUrl = isValidURL;
export const getUrlParams = getQueryParams;

/**
 * URL utilities collection
 */
export const urlUtils = {
  isValidURL,
  isAbsoluteURL,
  isRelativeURL,
  parseURL,
  buildURL,
  addQueryParams,
  removeQueryParams,
  getQueryParam,
  getQueryParams,
  joinPaths,
  resolveURL,
  getBaseURL,
  getDomain,
  getSubdomain,
  getTLD,
  normalizeURL,
  isSameURL,
  getFileExtension,
  getFilename,
  isImageURL,
  isVideoURL,
  isAudioURL,
  urlToSafeFilename,
  shortenURL,
  makeAbsolute,
  getCurrentURL,
  updateURL,
  parseHash,
  buildHash
};

// Export default
const urlUtilities = {
  isValidURL,
  isAbsoluteURL,
  isRelativeURL,
  parseURL,
  buildURL,
  addQueryParams,
  removeQueryParams,
  getQueryParam,
  getQueryParams,
  joinPaths,
  resolveURL,
  getBaseURL,
  getDomain,
  getSubdomain,
  getTLD,
  normalizeURL,
  isSameURL,
  getFileExtension,
  getFilename,
  isImageURL,
  isVideoURL,
  isAudioURL,
  urlToSafeFilename,
  shortenURL,
  makeAbsolute,
  getCurrentURL,
  updateURL,
  parseHash,
  buildHash,
  urlUtils
};

export default urlUtilities;
