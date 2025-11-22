/**
 * Text and Number Formatting Utilities
 * Comprehensive formatting functions for various data types
 */

/**
 * Format phone numbers
 */
export function formatPhoneNumber(phone: string, format: 'international' | 'national' | 'indian' = 'indian'): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  if (format === 'indian') {
    // Indian phone number format: +91 98765 43210
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
    if (cleaned.length === 13 && cleaned.startsWith('91')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
  }
  
  if (format === 'international') {
    // Generic international format
    if (cleaned.length >= 10) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
  }
  
  if (format === 'national') {
    // National format without country code
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
  }
  
  return phone; // Return original if no format matches
}

/**
 * Format credit card numbers
 */
export function formatCreditCard(cardNumber: string, separator = ' '): string {
  const cleaned = cardNumber.replace(/\s/g, '').replace(/[^0-9]/gi, '');
  const matches = cleaned.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  
  if (parts.length) {
    return parts.join(separator);
  } else {
    return cardNumber;
  }
}

/**
 * Format file sizes
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format numbers with commas
 */
export function formatNumber(num: number, options: {
  decimals?: number;
  separator?: string;
  decimalSeparator?: string;
} = {}): string {
  const { decimals = 0, separator = ',', decimalSeparator = '.' } = options;
  
  const fixed = num.toFixed(decimals);
  const parts = fixed.split('.');
  
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  
  return parts.join(decimalSeparator);
}

/**
 * Format Indian numbers (Lakhs and Crores)
 */
export function formatIndianNumber(num: number, decimals = 0): string {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(decimals) + ' Cr';
  } else if (num >= 100000) {
    return (num / 100000).toFixed(decimals) + ' L';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + ' K';
  }
  return num.toString();
}

/**
 * Format percentages
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format currency (alias for formatNumber with currency symbol)
 */
export function formatCurrency(amount: number, currency = 'INR', decimals = 2): string {
  const formatted = formatNumber(amount, { decimals });
  
  switch (currency) {
    case 'INR':
      return `₹${formatted}`;
    case 'USD':
      return `$${formatted}`;
    case 'EUR':
      return `€${formatted}`;
    case 'GBP':
      return `£${formatted}`;
    default:
      return `${currency} ${formatted}`;
  }
}

/**
 * Format bytes (alias for formatFileSize)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  return formatFileSize(bytes, decimals);
}

/**
 * Format names (title case)
 */
export function formatName(name: string): string {
  return name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format addresses
 */
export function formatAddress(address: {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}, format: 'single-line' | 'multi-line' = 'multi-line'): string {
  const parts = [];
  
  if (address.line1) parts.push(address.line1);
  if (address.line2) parts.push(address.line2);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.country) parts.push(address.country);
  
  if (format === 'single-line') {
    return parts.join(', ');
  }
  
  return parts.join('\n');
}

/**
 * Format text to sentence case
 */
export function toSentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format text to title case
 */
export function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Format text to camel case
 */
export function toCamelCase(text: string): string {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * Format text to pascal case
 */
export function toPascalCase(text: string): string {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
      return word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * Format text to kebab case
 */
export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Format text to snake case
 */
export function toSnakeCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Truncate text by words
 */
export function truncateWords(text: string, maxWords: number, suffix = '...'): string {
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + suffix;
}

/**
 * Format duration (seconds to human readable)
 */
export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const parts = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
  
  return parts.join(' ');
}

/**
 * Format time from seconds to HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format bytes to bandwidth (Mbps, Gbps, etc.)
 */
export function formatBandwidth(bytesPerSecond: number): string {
  const bits = bytesPerSecond * 8;
  const units = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
  
  let value = bits;
  let unitIndex = 0;
  
  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }
  
  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format social media handles
 */
export function formatSocialHandle(handle: string, platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin'): string {
  const cleanHandle = handle.replace(/[@#]/g, '');
  
  switch (platform) {
    case 'twitter':
      return `@${cleanHandle}`;
    case 'instagram':
      return `@${cleanHandle}`;
    case 'facebook':
      return cleanHandle;
    case 'linkedin':
      return `/in/${cleanHandle}`;
    default:
      return cleanHandle;
  }
}

/**
 * Format hashtags
 */
export function formatHashtag(tag: string): string {
  const cleanTag = tag.replace(/[^a-zA-Z0-9]/g, '');
  return `#${cleanTag}`;
}

/**
 * Format URLs
 */
export function formatUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Format email addresses (mask for privacy)
 */
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (!username || !domain) return email;
  
  const maskedUsername = username.length > 2 
    ? username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1)
    : username;
    
  return `${maskedUsername}@${domain}`;
}

/**
 * Format credit card for display (mask middle digits)
 */
export function maskCreditCard(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 8) return cardNumber;
  
  const first4 = cleaned.slice(0, 4);
  const last4 = cleaned.slice(-4);
  const middle = '*'.repeat(cleaned.length - 8);
  
  return `${first4} ${middle} ${last4}`;
}

/**
 * Format PAN number (Indian tax ID)
 */
export function formatPAN(pan: string): string {
  const cleaned = pan.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return pan;
}

/**
 * Format Aadhaar number (Indian ID)
 */
export function formatAadhaar(aadhaar: string): string {
  const cleaned = aadhaar.replace(/\D/g, '');
  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
  }
  return aadhaar;
}

/**
 * Format GST number (Indian tax number)
 */
export function formatGST(gst: string): string {
  const cleaned = gst.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length === 15) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 12)}-${cleaned.slice(12)}`;
  }
  return gst;
}

/**
 * Format vehicle registration number
 */
export function formatVehicleNumber(number: string): string {
  const cleaned = number.toUpperCase().replace(/[^A-Z0-9]/g, '');
  // Indian format: XX-00-XX-0000
  if (cleaned.length >= 8) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6)}`;
  }
  return number;
}

/**
 * Formatting utilities object
 */
export const format = {
  phone: formatPhoneNumber,
  creditCard: formatCreditCard,
  fileSize: formatFileSize,
  number: formatNumber,
  indianNumber: formatIndianNumber,
  percentage: formatPercentage,
  name: formatName,
  address: formatAddress,
  duration: formatDuration,
  time: formatTime,
  bandwidth: formatBandwidth,
  socialHandle: formatSocialHandle,
  hashtag: formatHashtag,
  url: formatUrl,
  pan: formatPAN,
  aadhaar: formatAadhaar,
  gst: formatGST,
  vehicle: formatVehicleNumber
};

/**
 * Text case utilities
 */
export const textCase = {
  sentence: toSentenceCase,
  title: toTitleCase,
  camel: toCamelCase,
  pascal: toPascalCase,
  kebab: toKebabCase,
  snake: toSnakeCase
};

/**
 * Text utilities
 */
export const text = {
  truncate: truncateText,
  truncateWords: truncateWords,
  maskEmail,
  maskCreditCard
};

// Export default
const formattersUtils = {
  formatPhoneNumber,
  formatCreditCard,
  formatFileSize,
  formatNumber,
  formatIndianNumber,
  formatPercentage,
  formatName,
  formatAddress,
  toSentenceCase,
  toTitleCase,
  toCamelCase,
  toPascalCase,
  toKebabCase,
  toSnakeCase,
  truncateText,
  truncateWords,
  formatDuration,
  formatTime,
  formatBandwidth,
  formatSocialHandle,
  formatHashtag,
  formatUrl,
  maskEmail,
  maskCreditCard,
  formatPAN,
  formatAadhaar,
  formatGST,
  formatVehicleNumber,
  format,
  textCase,
  text
};

export default formattersUtils;
