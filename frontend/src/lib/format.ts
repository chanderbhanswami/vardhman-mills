// Format utility functions for file sizes, durations, and other common formats
import type { Address } from '@/types/user.types';

/**
 * Format address object to a single string
 */
export interface FormatAddressOptions {
  includeType?: boolean;
  includeName?: boolean;
  includePhone?: boolean;
  multiline?: boolean;
  short?: boolean;
}

export function formatAddress(
  address: Address | null | undefined, 
  options: FormatAddressOptions = {}
): string {
  if (!address) return '';
  
  const {
    includeType = false,
    includeName = true,
    includePhone = false,
    multiline = false,
    short = false
  } = options;
  
  const parts: string[] = [];
  const separator = multiline ? '\n' : ', ';
  
  // Add type label if requested
  if (includeType && address.type) {
    const typeLabel = address.label || address.type.charAt(0).toUpperCase() + address.type.slice(1);
    parts.push(typeLabel);
  }
  
  // Add name if requested
  if (includeName) {
    const name = address.name || 
                 (address.firstName && address.lastName 
                   ? `${address.firstName} ${address.lastName}`.trim()
                   : address.firstName || address.lastName || '');
    if (name) parts.push(name);
  }
  
  // Add phone if requested
  if (includePhone && address.phone) {
    parts.push(address.phone);
  }
  
  // Short format: Just city and state
  if (short) {
    const location = [address.city, address.state].filter(Boolean).join(', ');
    if (location) parts.push(location);
    return parts.join(separator);
  }
  
  // Full address lines
  const addressLines: string[] = [];
  
  // Main address line
  if (address.address) {
    addressLines.push(address.address);
  } else if (address.addressLine1) {
    addressLines.push(address.addressLine1);
    if (address.addressLine2) {
      addressLines.push(address.addressLine2);
    }
  }
  
  // Landmark
  if (address.landmark) {
    addressLines.push(`Near ${address.landmark}`);
  }
  
  // City, State, Postal Code
  const cityStateZip = [
    address.city,
    address.state,
    address.pincode || address.postalCode
  ].filter(Boolean).join(', ');
  
  if (cityStateZip) {
    addressLines.push(cityStateZip);
  }
  
  // Country
  if (address.country) {
    addressLines.push(address.country);
  }
  
  // Company if present
  if (address.company) {
    parts.push(address.company);
  }
  
  // Add all address lines
  parts.push(...addressLines);
  
  return parts.join(separator);
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format duration in seconds to human readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (minutes < 60) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format number to compact notation (1K, 1M, etc.)
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  
  const units = ['', 'K', 'M', 'B', 'T'];
  const unitIndex = Math.floor(Math.log10(num) / 3);
  const scaledNum = num / Math.pow(1000, unitIndex);
  
  return `${scaledNum.toFixed(scaledNum < 10 ? 1 : 0)}${units[unitIndex]}`;
}

/**
 * Format a number with thousands separator
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format date to relative time (2 hours ago, 3 days ago, etc.)
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
}

/**
 * Format percentage with proper precision
 */
export function formatPercentage(value: number, precision: number = 1): string {
  return `${value.toFixed(precision)}%`;
}

/**
 * Format currency with proper locale formatting
 */
export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Format phone number with proper formatting
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phoneNumber;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format list of items with proper conjunction
 */
export function formatList(items: string[], conjunction: string = 'and'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`;
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Convert camelCase to kebab-case
 */
export function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert kebab-case to camelCase
 */
export function camelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Generate a random ID
 */
export function generateId(length: number = 8): string {
  return Math.random().toString(36).substr(2, length);
}

/**
 * Format bytes per second to human readable format
 */
export function formatBandwidth(bytesPerSecond: number): string {
  const bits = bytesPerSecond * 8;
  const units = ['bps', 'Kbps', 'Mbps', 'Gbps'];
  const index = Math.floor(Math.log10(bits) / 3);
  const value = bits / Math.pow(1000, index);
  
  return `${value.toFixed(1)} ${units[index]}`;
}

/**
 * Format date to various formats
 */
export function formatDate(
  date: Date | string | number, 
  format: 'short' | 'long' | 'full' | 'relative' = 'long'
): string {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  if (format === 'relative') {
    return formatRelativeTime(d);
  }
  
  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  };
  
  return d.toLocaleDateString('en-US', optionsMap[format]);
}