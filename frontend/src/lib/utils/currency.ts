/**
 * Currency Utility Functions
 * Comprehensive currency formatting and conversion utilities
 */

import { Currency } from '@/types/common.types';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  symbolPosition: 'before' | 'after';
  spaceAfterSymbol: boolean;
}

export interface ConversionRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
}

export interface FormatOptions {
  currency?: Currency;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
  currencyDisplay?: 'symbol' | 'code' | 'name';
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  compactDisplay?: 'short' | 'long';
  showSymbol?: boolean;
  showCode?: boolean;
  customSymbol?: string;
}

// Currency configurations
export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    spaceAfterSymbol: false
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    spaceAfterSymbol: false
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimalPlaces: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolPosition: 'after',
    spaceAfterSymbol: true
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    spaceAfterSymbol: false
  }
};

// Indian number formatting (lakhs, crores)
export const INDIAN_NUMBER_WORDS = [
  { value: 10000000, word: 'crore' },
  { value: 100000, word: 'lakh' },
  { value: 1000, word: 'thousand' }
];

/**
 * Format currency using native Intl.NumberFormat
 */
export function formatCurrency(
  amount: number,
  options: FormatOptions = {}
): string {
  const {
    currency = 'INR',
    locale = 'en-IN',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    useGrouping = true,
    currencyDisplay = 'symbol',
    notation = 'standard',
    compactDisplay = 'short',
    showSymbol = true,
    showCode = false,
    customSymbol
  } = options;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping,
      currencyDisplay,
      notation,
      compactDisplay
    });

    let formatted = formatter.format(amount);

    // Apply custom symbol if provided
    if (customSymbol && showSymbol) {
      const config = CURRENCY_CONFIGS[currency];
      if (config) {
        formatted = formatted.replace(config.symbol, customSymbol);
      }
    }

    // Add currency code if requested
    if (showCode && !showSymbol) {
      formatted = `${formatted} ${currency}`;
    }

    return formatted;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount}`;
  }
}

/**
 * Format currency in Indian style (with lakhs and crores)
 */
export function formatIndianCurrency(
  amount: number,
  options: Omit<FormatOptions, 'locale'> = {}
): string {
  return formatCurrency(amount, {
    ...options,
    locale: 'en-IN',
    currency: 'INR'
  });
}

/**
 * Format currency with custom configuration
 */
export function formatCurrencyCustom(
  amount: number,
  currencyCode: string,
  config?: Partial<CurrencyConfig>
): string {
  const currencyConfig = {
    ...CURRENCY_CONFIGS[currencyCode],
    ...config
  };

  if (!currencyConfig) {
    return `${amount} ${currencyCode}`;
  }

  // Format the number with appropriate separators
  const absAmount = Math.abs(amount);
  const [integerPart, decimalPart = ''] = absAmount.toFixed(currencyConfig.decimalPlaces).split('.');

  // Add thousands separators
  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    currencyConfig.thousandsSeparator
  );

  // Combine parts
  let formattedAmount = formattedInteger;
  if (currencyConfig.decimalPlaces > 0 && decimalPart) {
    formattedAmount += currencyConfig.decimalSeparator + decimalPart;
  }

  // Add currency symbol
  const space = currencyConfig.spaceAfterSymbol ? ' ' : '';
  if (currencyConfig.symbolPosition === 'before') {
    formattedAmount = `${currencyConfig.symbol}${space}${formattedAmount}`;
  } else {
    formattedAmount = `${formattedAmount}${space}${currencyConfig.symbol}`;
  }

  // Add negative sign if needed
  if (amount < 0) {
    formattedAmount = `-${formattedAmount}`;
  }

  return formattedAmount;
}

/**
 * Format compact currency (e.g., 1.2K, 1.5M, 2.3B)
 */
export function formatCompactCurrency(
  amount: number,
  currency: Currency = 'INR',
  locale = 'en-IN'
): string {
  return formatCurrency(amount, {
    currency,
    locale,
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  });
}

/**
 * Format currency for Indian context with words (lakhs, crores)
 */
export function formatIndianCurrencyWithWords(
  amount: number,
  includeSymbol = true
): string {
  if (amount === 0) return includeSymbol ? '₹0' : '0';

  const absAmount = Math.abs(amount);
  const symbol = includeSymbol ? '₹' : '';
  const sign = amount < 0 ? '-' : '';

  for (const { value, word } of INDIAN_NUMBER_WORDS) {
    if (absAmount >= value) {
      const quotient = absAmount / value;
      const remainder = absAmount % value;

      let result = `${sign}${symbol}${quotient.toFixed(quotient >= 100 ? 0 : 1)} ${word}`;
      
      if (remainder >= 1000) {
        const remainderFormatted = formatIndianCurrencyWithWords(remainder, false);
        result += ` ${remainderFormatted}`;
      }
      
      return result;
    }
  }

  return `${sign}${symbol}${absAmount.toLocaleString('en-IN')}`;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(
  currencyString: string,
  currency: Currency = 'INR'
): number | null {
  if (!currencyString || typeof currencyString !== 'string') {
    return null;
  }

  try {
    const config = CURRENCY_CONFIGS[currency];
    let cleaned = currencyString.trim();

    // Remove currency symbol and code
    if (config) {
      cleaned = cleaned.replace(new RegExp(`[${config.symbol}]`, 'g'), '');
    }
    cleaned = cleaned.replace(new RegExp(`\\b${currency}\\b`, 'gi'), '');

    // Remove thousands separators and normalize decimal separators
    if (config) {
      cleaned = cleaned.replace(new RegExp(`[${config.thousandsSeparator}]`, 'g'), '');
      if (config.decimalSeparator !== '.') {
        cleaned = cleaned.replace(config.decimalSeparator, '.');
      }
    }

    // Remove any remaining non-numeric characters except decimal point and minus
    cleaned = cleaned.replace(/[^\d.-]/g, '');

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  } catch (error) {
    console.error('Error parsing currency:', error);
    return null;
  }
}

/**
 * Convert between currencies (requires exchange rates)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) return amount;
  return amount * exchangeRate;
}

/**
 * Format price range
 */
export function formatPriceRange(
  minPrice: number,
  maxPrice: number,
  currency: Currency = 'INR',
  options: FormatOptions = {}
): string {
  if (minPrice === maxPrice) {
    return formatCurrency(minPrice, { currency, ...options });
  }

  const formattedMin = formatCurrency(minPrice, { currency, ...options });
  const formattedMax = formatCurrency(maxPrice, { currency, ...options });

  return `${formattedMin} - ${formattedMax}`;
}

/**
 * Calculate discount amount
 */
export function calculateDiscountAmount(
  originalPrice: number,
  discountedPrice: number
): number {
  return Math.max(0, originalPrice - discountedPrice);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number
): number {
  if (originalPrice <= 0) return 0;
  const discount = calculateDiscountAmount(originalPrice, discountedPrice);
  return Math.round((discount / originalPrice) * 100);
}

/**
 * Apply discount to price
 */
export function applyDiscount(
  originalPrice: number,
  discountPercentage: number
): number {
  if (discountPercentage <= 0) return originalPrice;
  if (discountPercentage >= 100) return 0;
  
  const discountAmount = (originalPrice * discountPercentage) / 100;
  return Math.max(0, originalPrice - discountAmount);
}

/**
 * Format discount display
 */
export function formatDiscount(
  originalPrice: number,
  discountedPrice: number,
  currency: Currency = 'INR',
  showBoth = true
): string {
  const discountAmount = calculateDiscountAmount(originalPrice, discountedPrice);
  const discountPercentage = calculateDiscountPercentage(originalPrice, discountedPrice);

  if (discountAmount === 0) {
    return formatCurrency(originalPrice, { currency });
  }

  const formattedOriginal = formatCurrency(originalPrice, { currency });
  const formattedDiscounted = formatCurrency(discountedPrice, { currency });
  const formattedDiscountAmount = formatCurrency(discountAmount, { currency });

  if (showBoth) {
    return `${formattedDiscounted} (Save ${formattedDiscountAmount} - ${discountPercentage}% off from ${formattedOriginal})`;
  }

  return `${formattedDiscounted} (${discountPercentage}% off)`;
}

/**
 * Round currency to nearest valid unit
 */
export function roundCurrency(
  amount: number,
  currency: Currency = 'INR',
  roundingMethod: 'round' | 'floor' | 'ceil' = 'round'
): number {
  const config = CURRENCY_CONFIGS[currency];
  if (!config) return amount;

  const multiplier = Math.pow(10, config.decimalPlaces);
  
  switch (roundingMethod) {
    case 'floor':
      return Math.floor(amount * multiplier) / multiplier;
    case 'ceil':
      return Math.ceil(amount * multiplier) / multiplier;
    default:
      return Math.round(amount * multiplier) / multiplier;
  }
}

/**
 * Format currency for different contexts
 */
export const formatters = {
  /**
   * Format for product display
   */
  product: (amount: number, currency: Currency = 'INR'): string => {
    return formatCurrency(amount, {
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  },

  /**
   * Format for cart/checkout
   */
  checkout: (amount: number, currency: Currency = 'INR'): string => {
    return formatCurrency(amount, {
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  /**
   * Format for accounting/reports
   */
  accounting: (amount: number, currency: Currency = 'INR'): string => {
    return formatCurrency(amount, {
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    });
  },

  /**
   * Format for display in limited space
   */
  compact: (amount: number, currency: Currency = 'INR'): string => {
    return formatCompactCurrency(amount, currency);
  },

  /**
   * Format for Indian context
   */
  indian: (amount: number): string => {
    return formatIndianCurrency(amount);
  },

  /**
   * Format with words for large amounts
   */
  indianWords: (amount: number): string => {
    return formatIndianCurrencyWithWords(amount);
  }
};

/**
 * Currency validation utilities
 */
export const validation = {
  /**
   * Check if currency code is valid
   */
  isValidCurrency: (currency: string): currency is Currency => {
    return Object.keys(CURRENCY_CONFIGS).includes(currency);
  },

  /**
   * Check if amount is valid
   */
  isValidAmount: (amount: unknown): amount is number => {
    return typeof amount === 'number' && !isNaN(amount) && isFinite(amount);
  },

  /**
   * Validate currency string format
   */
  isValidCurrencyString: (
    currencyString: string,
    currency: Currency = 'INR'
  ): boolean => {
    return parseCurrency(currencyString, currency) !== null;
  },

  /**
   * Check if amount is positive
   */
  isPositiveAmount: (amount: number): boolean => {
    return validation.isValidAmount(amount) && amount > 0;
  },

  /**
   * Check if amount is non-negative
   */
  isNonNegativeAmount: (amount: number): boolean => {
    return validation.isValidAmount(amount) && amount >= 0;
  }
};

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_CONFIGS[currency]?.symbol || currency;
}

/**
 * Get currency name
 */
export function getCurrencyName(currency: Currency): string {
  return CURRENCY_CONFIGS[currency]?.name || currency;
}

/**
 * Get supported currencies
 */
export function getSupportedCurrencies(): Currency[] {
  return Object.keys(CURRENCY_CONFIGS) as Currency[];
}

/**
 * Format tax amount
 */
export function formatTax(
  baseAmount: number,
  taxPercentage: number,
  currency: Currency = 'INR'
): {
  baseAmount: string;
  taxAmount: string;
  totalAmount: string;
  formattedTax: string;
} {
  const taxAmount = (baseAmount * taxPercentage) / 100;
  const totalAmount = baseAmount + taxAmount;

  return {
    baseAmount: formatCurrency(baseAmount, { currency }),
    taxAmount: formatCurrency(taxAmount, { currency }),
    totalAmount: formatCurrency(totalAmount, { currency }),
    formattedTax: `${taxPercentage}%`
  };
}

/**
 * Format shipping cost
 */
export function formatShipping(
  shippingCost: number,
  currency: Currency = 'INR',
  freeShippingThreshold?: number
): string {
  if (shippingCost === 0) {
    return 'Free Shipping';
  }

  const formatted = formatCurrency(shippingCost, { currency });
  
  if (freeShippingThreshold && freeShippingThreshold > 0) {
    const thresholdFormatted = formatCurrency(freeShippingThreshold, { currency });
    return `${formatted} (Free shipping on orders over ${thresholdFormatted})`;
  }

  return formatted;
}

// Alias exports for compatibility
export const formatPrice = formatCurrency;

// Export default object with main functions
const currencyUtils = {
  formatCurrency,
  formatPrice,
  formatIndianCurrency,
  formatCurrencyCustom,
  formatCompactCurrency,
  formatIndianCurrencyWithWords,
  parseCurrency,
  convertCurrency,
  formatPriceRange,
  calculateDiscountAmount,
  calculateDiscountPercentage,
  applyDiscount,
  formatDiscount,
  roundCurrency,
  getCurrencySymbol,
  getCurrencyName,
  getSupportedCurrencies,
  formatTax,
  formatShipping,
  formatters,
  validation,
  CURRENCY_CONFIGS,
  INDIAN_NUMBER_WORDS
};

export default currencyUtils;
