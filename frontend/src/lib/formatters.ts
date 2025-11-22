/**
 * Formatting utilities for the application
 */

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'INR')
 * @param locale - The locale for formatting (default: 'en-IN')
 */
export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Format a date
 * @param date - The date to format
 * @param format - The format style (default: 'medium')
 * @param locale - The locale for formatting (default: 'en-IN')
 */
export function formatDate(
  date: string | Date | number,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale: string = 'en-IN'
): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;

    const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
      short: { month: 'numeric', day: 'numeric', year: '2-digit' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' },
      full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    };
    
    const options = formatOptions[format];

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return String(date);
  }
}

/**
 * Format a date relative to now (e.g., "2 days ago")
 * @param date - The date to format
 * @param locale - The locale for formatting
 */
export function formatRelativeDate(date: string | Date | number, locale: string = 'en'): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    // Try to use Intl.RelativeTimeFormat for better localization
    try {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      
      if (diffInSeconds < 60) return rtf.format(0, 'second');
      if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
      if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
      if (diffInSeconds < 604800) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
      if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 604800), 'week');
      if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    } catch {
      // Fallback for browsers that don't support Intl.RelativeTimeFormat
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
      return `${Math.floor(diffInSeconds / 31536000)} years ago`;
    }
  } catch (error) {
    console.error('Relative date formatting error:', error);
    return String(date);
  }
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(
  num: number,
  locale: string = 'en-IN',
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(num);
  } catch (error) {
    console.error('Number formatting error:', error);
    return num.toString();
  }
}

/**
 * Format a percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 0,
  locale: string = 'en-IN'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  } catch (error) {
    console.error('Percentage formatting error:', error);
    return `${value.toFixed(decimals)}%`;
  }
}

/**
 * Format a phone number
 */
export function formatPhoneNumber(phone: string, countryCode: string = '+91'): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${countryCode} ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Format discount percentage
 */
export function formatDiscount(originalPrice: number, salePrice: number): string {
  const discount = ((originalPrice - salePrice) / originalPrice) * 100;
  return `${Math.round(discount)}% OFF`;
}

const formatters = {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  formatNumber,
  formatPercentage,
  formatPhoneNumber,
  formatFileSize,
  truncateText,
  formatDiscount,
};

export default formatters;
