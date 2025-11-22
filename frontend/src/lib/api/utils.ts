import { PaginationParams, SearchParams, SortOption } from './types';

/**
 * API Utility Functions
 * Helper functions for API operations, URL building, data transformation, etc.
 */

/**
 * Build URL with query parameters
 */
export function buildUrl(baseUrl: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return baseUrl;

  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Build URL with path parameters
 */
export function buildPath(template: string, params: Record<string, string | number>): string {
  let result = template;
  
  Object.entries(params).forEach(([key, value]) => {
    const placeholder = `:${key}`;
    result = result.replace(placeholder, String(value));
  });

  return result;
}

/**
 * Build search parameters for API requests
 */
export function buildSearchParams(params: SearchParams): Record<string, string | number | boolean> {
  const searchParams: Record<string, string | number | boolean> = {};

  if (params.q) searchParams.q = params.q;
  if (params.category) searchParams.category = params.category;
  if (params.brand) searchParams.brand = params.brand;
  if (params.minPrice !== undefined) searchParams.minPrice = params.minPrice;
  if (params.maxPrice !== undefined) searchParams.maxPrice = params.maxPrice;
  if (params.inStock !== undefined) searchParams.inStock = params.inStock;
  if (params.featured !== undefined) searchParams.featured = params.featured;
  if (params.tags && params.tags.length > 0) searchParams.tags = params.tags.join(',');
  if (params.page) searchParams.page = params.page;
  if (params.limit) searchParams.limit = params.limit;
  if (params.sort) searchParams.sort = params.sort;
  if (params.order) searchParams.order = params.order;

  return searchParams;
}

/**
 * Build pagination parameters
 */
export function buildPaginationParams(params: PaginationParams): Record<string, string | number> {
  const paginationParams: Record<string, string | number> = {};

  if (params.page) paginationParams.page = params.page;
  if (params.limit) paginationParams.limit = params.limit;
  if (params.sort) paginationParams.sort = params.sort;
  if (params.order) paginationParams.order = params.order;

  return paginationParams;
}

/**
 * Parse API error messages
 */
export function parseErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    
    if (errorObj.message && typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    
    if (errorObj.error && typeof errorObj.error === 'string') {
      return errorObj.error;
    }
  }

  return 'An unexpected error occurred';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = 'INR', locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return dateObj.toLocaleDateString('en-IN', { ...defaultOptions, ...options });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const intervals = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.unit}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
}

/**
 * Debounce function for API calls
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function for API calls
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCallTime >= delay) {
      lastCallTime = now;
      func(...args);
    }
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as Record<string, unknown>;
    Object.keys(obj).forEach(key => {
      clonedObj[key] = deepClone((obj as Record<string, unknown>)[key]);
    });
    return clonedObj as T;
  }

  return obj;
}

/**
 * Merge objects deeply
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target } as Record<string, unknown>;

  Object.keys(source).forEach(key => {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) &&
        targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
      result[key] = deepMerge(targetValue as Record<string, unknown>, sourceValue as Record<string, unknown>);
    } else {
      result[key] = sourceValue;
    }
  });

  return result as T;
}

/**
 * Generate unique ID
 */
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Indian)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Extract text from HTML
 */
export function extractTextFromHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Convert string to slug
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Parse URL search parameters
 */
export function parseSearchParams(search: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(search);
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex === -1 ? '' : filename.substring(lastDotIndex + 1).toLowerCase();
}

/**
 * Check if file type is image
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const extension = getFileExtension(filename);
  return imageExtensions.includes(extension);
}

/**
 * Convert File to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Get browser info
 */
export function getBrowserInfo(): {
  name: string;
  version: string;
  platform: string;
} {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  // Browser detection
  if (userAgent.includes('Chrome')) browserName = 'Chrome';
  else if (userAgent.includes('Firefox')) browserName = 'Firefox';
  else if (userAgent.includes('Safari')) browserName = 'Safari';
  else if (userAgent.includes('Edge')) browserName = 'Edge';
  else if (userAgent.includes('Opera')) browserName = 'Opera';

  // Version extraction
  const versionMatch = userAgent.match(new RegExp(`${browserName}\\/(\\d+\\.\\d+)`));
  if (versionMatch) {
    browserVersion = versionMatch[1];
  }

  return {
    name: browserName,
    version: browserVersion,
    platform: navigator.platform,
  };
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Get common sort options for products
 */
export function getProductSortOptions(): SortOption[] {
  return [
    { value: 'name_asc', label: 'Name (A-Z)', field: 'name', order: 'asc' },
    { value: 'name_desc', label: 'Name (Z-A)', field: 'name', order: 'desc' },
    { value: 'price_asc', label: 'Price (Low to High)', field: 'price', order: 'asc' },
    { value: 'price_desc', label: 'Price (High to Low)', field: 'price', order: 'desc' },
    { value: 'created_desc', label: 'Newest First', field: 'createdAt', order: 'desc' },
    { value: 'created_asc', label: 'Oldest First', field: 'createdAt', order: 'asc' },
    { value: 'rating_desc', label: 'Highest Rated', field: 'rating', order: 'desc' },
    { value: 'popular', label: 'Most Popular', field: 'popularity', order: 'desc' },
  ];
}

/**
 * Storage utilities with error handling
 */
export const storage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  getJson: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  setJson: (key: string, value: unknown): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};

const apiUtils = {
  buildUrl,
  buildPath,
  buildSearchParams,
  buildPaginationParams,
  parseErrorMessage,
  formatFileSize,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  generateId,
  isValidEmail,
  isValidPhoneNumber,
  validatePassword,
  sanitizeHtml,
  extractTextFromHtml,
  truncateText,
  createSlug,
  parseSearchParams,
  getFileExtension,
  isImageFile,
  fileToBase64,
  downloadBlob,
  copyToClipboard,
  getBrowserInfo,
  isMobileDevice,
  getProductSortOptions,
  storage,
};

export default apiUtils;
