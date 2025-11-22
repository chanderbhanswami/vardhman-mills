/**
 * Centralized Utils Exports
 * 
 * Main entry point for all utility functions
 */

// Core utilities
export { cn } from './utils';

// Formatters
export { formatNumber, formatCurrency, formatPercentage, formatBytes } from './formatters';

// Date utilities
export { formatDate, formatDateTime, formatRelativeTime, isValidDate, parseDate } from './date';

// String utilities
export { 
  truncate, 
  capitalize, 
  slugify as slugifyString, 
  camelCase, 
  pascalCase, 
  kebabCase, 
  snakeCase 
} from './string';

// URL utilities
export { 
  buildUrl, 
  parseQueryString, 
  stringifyQueryString, 
  isValidUrl, 
  getUrlParams 
} from './url';

// Validators
export { 
  validateEmail, 
  validatePhone, 
  validatePassword, 
  validateRequired, 
  validatePattern 
} from './validators';

// Object utilities
export { 
  deepClone, 
  deepMerge, 
  pick, 
  omit, 
  isEmpty, 
  isEqual 
} from './object';

// Performance
export { debounce } from './debounce';
export { throttle } from './throttle';

// Storage
export { 
  storage, 
  sessionStorage as sessionStorageUtil, 
  localStorageAvailable 
} from './storage';

// Helpers
export { 
  generateId, 
  randomInt, 
  randomString, 
  sleep, 
  retry 
} from './helpers';

// SEO
export { generateMetaTags, generateStructuredData } from './seo';

// Image
export { 
  getImageUrl, 
  getOptimizedImageUrl, 
  getImageDimensions 
} from './image';

// Currency
export { formatPrice, parseCurrency } from './currency';

// Pricing utilities
export { 
  getProductPricing, 
  hasBulkPricing, 
  isEligibleForEMI, 
  calculateEMI, 
  getStockStatus,
  formatPrice as formatProductPrice
} from './pricing';

// Device Detection
export { isMobile, isTablet, isDesktop, getBrowserInfo } from './device-detection';

// Logger
export { logger } from './logger';
