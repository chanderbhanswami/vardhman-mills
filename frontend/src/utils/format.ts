/**
 * Format Utilities - Vardhman Mills Frontend
 * 
 * Utility functions for formatting dates, numbers, and other data types
 * This is a re-export from lib/format for backward compatibility
 * 
 * @module utils/format
 * @version 1.0.0
 */

export {
  formatDate,
  formatNumber,
  formatFileSize,
  formatDuration,
  formatCurrency,
  formatPercentage,
  formatRelativeTime,
  formatPhoneNumber,
  formatAddress,
  truncateText
} from '@/lib/format';

// Re-export types
export type { FormatAddressOptions } from '@/lib/format';
