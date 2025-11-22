/**
 * Date Utility Functions
 * Comprehensive date and time manipulation utilities using date-fns
 */

import {
  format,
  formatDistance,
  formatDistanceToNow,
  formatRelative,
  parseISO,
  isValid,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  min,
  max,
  closestTo,
  isWeekend,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval
} from 'date-fns';
import { enIN, enUS } from 'date-fns/locale';

export type DateInput = Date | string | number;
export type Locale = 'en-IN' | 'en-US';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DateFormatOptions {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export interface BusinessHours {
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

export interface Holiday {
  date: Date;
  name: string;
  type: 'national' | 'regional' | 'religious' | 'custom';
}

// Locale mapping
const LOCALE_MAP = {
  'en-IN': enIN,
  'en-US': enUS
};

/**
 * Safely parse date from various inputs
 */
export function parseDate(input: DateInput): Date | null {
  if (!input) return null;

  try {
    let date: Date;

    if (input instanceof Date) {
      date = input;
    } else if (typeof input === 'string') {
      // Try to parse ISO string first, then fallback to Date constructor
      date = input.includes('T') || input.includes('-') ? parseISO(input) : new Date(input);
    } else if (typeof input === 'number') {
      date = new Date(input);
    } else {
      return null;
    }

    return isValid(date) ? date : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Format date with various preset formats
 */
export function formatDate(
  date: DateInput,
  formatString = 'dd/MM/yyyy',
  options: DateFormatOptions = {}
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';

  const { locale = 'en-IN' } = options;

  try {
    return format(parsedDate, formatString, {
      locale: LOCALE_MAP[locale],
      weekStartsOn: options.weekStartsOn
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(
  date: DateInput,
  baseDate?: Date,
  options: DateFormatOptions = {}
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';

  const { locale = 'en-IN' } = options;

  try {
    if (baseDate) {
      return formatDistance(parsedDate, baseDate, {
        addSuffix: true,
        locale: LOCALE_MAP[locale]
      });
    } else {
      return formatDistanceToNow(parsedDate, {
        addSuffix: true,
        locale: LOCALE_MAP[locale]
      });
    }
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '';
  }
}

/**
 * Get relative date (e.g., "yesterday", "last Friday", "next Tuesday")
 */
export function getRelativeDate(
  date: DateInput,
  baseDate?: Date,
  options: DateFormatOptions = {}
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';

  const { locale = 'en-IN' } = options;
  const base = baseDate || new Date();

  try {
    return formatRelative(parsedDate, base, {
      locale: LOCALE_MAP[locale],
      weekStartsOn: options.weekStartsOn
    });
  } catch (error) {
    console.error('Error getting relative date:', error);
    return '';
  }
}

/**
 * Common date formatters
 */
export const formatters = {
  // Display formats
  short: (date: DateInput) => formatDate(date, 'dd/MM/yy'),
  medium: (date: DateInput) => formatDate(date, 'dd MMM yyyy'),
  long: (date: DateInput) => formatDate(date, 'dd MMMM yyyy'),
  full: (date: DateInput) => formatDate(date, 'EEEE, dd MMMM yyyy'),

  // Time formats
  time12: (date: DateInput) => formatDate(date, 'hh:mm a'),
  time24: (date: DateInput) => formatDate(date, 'HH:mm'),
  timeWithSeconds: (date: DateInput) => formatDate(date, 'HH:mm:ss'),

  // Combined date-time formats
  dateTime: (date: DateInput) => formatDate(date, 'dd/MM/yyyy HH:mm'),
  dateTime12: (date: DateInput) => formatDate(date, 'dd/MM/yyyy hh:mm a'),
  fullDateTime: (date: DateInput) => formatDate(date, 'EEEE, dd MMMM yyyy \'at\' hh:mm a'),

  // ISO formats
  iso: (date: DateInput) => {
    const parsed = parseDate(date);
    return parsed ? parsed.toISOString() : '';
  },
  isoDate: (date: DateInput) => formatDate(date, 'yyyy-MM-dd'),
  isoTime: (date: DateInput) => formatDate(date, 'HH:mm:ss'),

  // Relative formats
  relative: (date: DateInput) => getRelativeTime(date),
  relativeDate: (date: DateInput) => getRelativeDate(date),

  // Indian formats
  indian: (date: DateInput) => formatDate(date, 'dd/MM/yyyy'),
  indianLong: (date: DateInput) => formatDate(date, 'dd MMMM yyyy', { locale: 'en-IN' }),

  // Custom business formats
  orderDate: (date: DateInput) => formatDate(date, 'MMM dd, yyyy'),
  invoiceDate: (date: DateInput) => formatDate(date, 'dd-MMM-yyyy'),
  reportDate: (date: DateInput) => formatDate(date, 'MMMM yyyy'),
  
  // File naming safe format
  filename: (date: DateInput) => formatDate(date, 'yyyy-MM-dd_HH-mm-ss')
};

/**
 * Date comparison utilities
 */
export const compare = {
  isAfter: (date: DateInput, compareDate: DateInput): boolean => {
    const d1 = parseDate(date);
    const d2 = parseDate(compareDate);
    return d1 && d2 ? isAfter(d1, d2) : false;
  },

  isBefore: (date: DateInput, compareDate: DateInput): boolean => {
    const d1 = parseDate(date);
    const d2 = parseDate(compareDate);
    return d1 && d2 ? isBefore(d1, d2) : false;
  },

  isEqual: (date: DateInput, compareDate: DateInput): boolean => {
    const d1 = parseDate(date);
    const d2 = parseDate(compareDate);
    return d1 && d2 ? isEqual(d1, d2) : false;
  },

  isSameDay: (date: DateInput, compareDate: DateInput): boolean => {
    const d1 = parseDate(date);
    const d2 = parseDate(compareDate);
    return d1 && d2 ? isSameDay(d1, d2) : false;
  },

  isSameWeek: (date: DateInput, compareDate: DateInput): boolean => {
    const d1 = parseDate(date);
    const d2 = parseDate(compareDate);
    return d1 && d2 ? isSameWeek(d1, d2) : false;
  },

  isSameMonth: (date: DateInput, compareDate: DateInput): boolean => {
    const d1 = parseDate(date);
    const d2 = parseDate(compareDate);
    return d1 && d2 ? isSameMonth(d1, d2) : false;
  },

  isSameYear: (date: DateInput, compareDate: DateInput): boolean => {
    const d1 = parseDate(date);
    const d2 = parseDate(compareDate);
    return d1 && d2 ? isSameYear(d1, d2) : false;
  }
};

/**
 * Date manipulation utilities
 */
export const manipulate = {
  // Start/End of periods
  startOfDay: (date: DateInput): Date | null => {
    const parsed = parseDate(date);
    return parsed ? startOfDay(parsed) : null;
  },

  endOfDay: (date: DateInput): Date | null => {
    const parsed = parseDate(date);
    return parsed ? endOfDay(parsed) : null;
  },

  startOfWeek: (date: DateInput, weekStartsOn: 0 | 1 = 1): Date | null => {
    const parsed = parseDate(date);
    return parsed ? startOfWeek(parsed, { weekStartsOn }) : null;
  },

  endOfWeek: (date: DateInput, weekStartsOn: 0 | 1 = 1): Date | null => {
    const parsed = parseDate(date);
    return parsed ? endOfWeek(parsed, { weekStartsOn }) : null;
  },

  startOfMonth: (date: DateInput): Date | null => {
    const parsed = parseDate(date);
    return parsed ? startOfMonth(parsed) : null;
  },

  endOfMonth: (date: DateInput): Date | null => {
    const parsed = parseDate(date);
    return parsed ? endOfMonth(parsed) : null;
  },

  startOfYear: (date: DateInput): Date | null => {
    const parsed = parseDate(date);
    return parsed ? startOfYear(parsed) : null;
  },

  endOfYear: (date: DateInput): Date | null => {
    const parsed = parseDate(date);
    return parsed ? endOfYear(parsed) : null;
  },

  // Add/Subtract periods
  addDays: (date: DateInput, amount: number): Date | null => {
    const parsed = parseDate(date);
    return parsed ? addDays(parsed, amount) : null;
  },

  addWeeks: (date: DateInput, amount: number): Date | null => {
    const parsed = parseDate(date);
    return parsed ? addWeeks(parsed, amount) : null;
  },

  addMonths: (date: DateInput, amount: number): Date | null => {
    const parsed = parseDate(date);
    return parsed ? addMonths(parsed, amount) : null;
  },

  addYears: (date: DateInput, amount: number): Date | null => {
    const parsed = parseDate(date);
    return parsed ? addYears(parsed, amount) : null;
  },

  subDays: (date: DateInput, amount: number): Date | null => {
    const parsed = parseDate(date);
    return parsed ? subDays(parsed, amount) : null;
  },

  subWeeks: (date: DateInput, amount: number): Date | null => {
    const parsed = parseDate(date);
    return parsed ? subWeeks(parsed, amount) : null;
  },

  subMonths: (date: DateInput, amount: number): Date | null => {
    const parsed = parseDate(date);
    return parsed ? subMonths(parsed, amount) : null;
  },

  subYears: (date: DateInput, amount: number): Date | null => {
    const parsed = parseDate(date);
    return parsed ? subYears(parsed, amount) : null;
  }
};

/**
 * Date difference calculations
 */
export const difference = {
  inDays: (date1: DateInput, date2: DateInput): number => {
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    return d1 && d2 ? differenceInDays(d1, d2) : 0;
  },

  inWeeks: (date1: DateInput, date2: DateInput): number => {
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    return d1 && d2 ? differenceInWeeks(d1, d2) : 0;
  },

  inMonths: (date1: DateInput, date2: DateInput): number => {
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    return d1 && d2 ? differenceInMonths(d1, d2) : 0;
  },

  inYears: (date1: DateInput, date2: DateInput): number => {
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    return d1 && d2 ? differenceInYears(d1, d2) : 0;
  },

  inHours: (date1: DateInput, date2: DateInput): number => {
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    return d1 && d2 ? differenceInHours(d1, d2) : 0;
  },

  inMinutes: (date1: DateInput, date2: DateInput): number => {
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    return d1 && d2 ? differenceInMinutes(d1, d2) : 0;
  },

  inSeconds: (date1: DateInput, date2: DateInput): number => {
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    return d1 && d2 ? differenceInSeconds(d1, d2) : 0;
  }
};

/**
 * Date validation utilities
 */
export const validate = {
  isValid: (date: DateInput): boolean => {
    const parsed = parseDate(date);
    return parsed !== null;
  },

  isToday: (date: DateInput): boolean => {
    return compare.isSameDay(date, new Date());
  },

  isYesterday: (date: DateInput): boolean => {
    return compare.isSameDay(date, manipulate.subDays(new Date(), 1) || new Date());
  },

  isTomorrow: (date: DateInput): boolean => {
    return compare.isSameDay(date, manipulate.addDays(new Date(), 1) || new Date());
  },

  isThisWeek: (date: DateInput): boolean => {
    return compare.isSameWeek(date, new Date());
  },

  isThisMonth: (date: DateInput): boolean => {
    return compare.isSameMonth(date, new Date());
  },

  isThisYear: (date: DateInput): boolean => {
    return compare.isSameYear(date, new Date());
  },

  isPast: (date: DateInput): boolean => {
    return compare.isBefore(date, new Date());
  },

  isFuture: (date: DateInput): boolean => {
    return compare.isAfter(date, new Date());
  },

  isWeekend: (date: DateInput): boolean => {
    const parsed = parseDate(date);
    return parsed ? isWeekend(parsed) : false;
  },

  isWorkday: (date: DateInput): boolean => {
    return !validate.isWeekend(date);
  },

  isInRange: (date: DateInput, startDate: DateInput, endDate: DateInput): boolean => {
    const d = parseDate(date);
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (!d || !start || !end) return false;
    
    return (isEqual(d, start) || isAfter(d, start)) && 
           (isEqual(d, end) || isBefore(d, end));
  }
};

/**
 * Business date utilities
 */
export const business = {
  /**
   * Check if date is a business day (excluding weekends and holidays)
   */
  isBusinessDay: (date: DateInput, holidays: Holiday[] = []): boolean => {
    const parsed = parseDate(date);
    if (!parsed || isWeekend(parsed)) return false;

    return !holidays.some(holiday => isSameDay(parsed, holiday.date));
  },

  /**
   * Get next business day
   */
  getNextBusinessDay: (date: DateInput, holidays: Holiday[] = []): Date | null => {
    let current = parseDate(date);
    if (!current) return null;

    do {
      current = addDays(current, 1);
    } while (!business.isBusinessDay(current, holidays));

    return current;
  },

  /**
   * Get previous business day
   */
  getPreviousBusinessDay: (date: DateInput, holidays: Holiday[] = []): Date | null => {
    let current = parseDate(date);
    if (!current) return null;

    do {
      current = subDays(current, 1);
    } while (!business.isBusinessDay(current, holidays));

    return current;
  },

  /**
   * Count business days between dates
   */
  countBusinessDays: (
    startDate: DateInput,
    endDate: DateInput,
    holidays: Holiday[] = []
  ): number => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) return 0;

    let count = 0;
    let current = start;

    while (isBefore(current, end) || isSameDay(current, end)) {
      if (business.isBusinessDay(current, holidays)) {
        count++;
      }
      current = addDays(current, 1);
    }

    return count;
  },

  /**
   * Add business days
   */
  addBusinessDays: (
    date: DateInput,
    days: number,
    holidays: Holiday[] = []
  ): Date | null => {
    let current = parseDate(date);
    if (!current) return null;

    let added = 0;
    while (added < days) {
      current = addDays(current, 1);
      if (business.isBusinessDay(current, holidays)) {
        added++;
      }
    }

    return current;
  },

  /**
   * Check if current time is within business hours
   */
  isBusinessHours: (
    date: DateInput,
    businessHours: BusinessHours,
    holidays: Holiday[] = []
  ): boolean => {
    const parsed = parseDate(date);
    if (!parsed || !business.isBusinessDay(parsed, holidays)) return false;

    const timeString = formatDate(parsed, 'HH:mm');
    return timeString >= businessHours.start && timeString <= businessHours.end;
  }
};

/**
 * Date range utilities
 */
export const range = {
  /**
   * Create date range
   */
  create: (startDate: DateInput, endDate: DateInput): DateRange | null => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (!start || !end) return null;
    
    return {
      start: isBefore(start, end) ? start : end,
      end: isAfter(start, end) ? start : end
    };
  },

  /**
   * Get all dates in range
   */
  getDates: (startDate: DateInput, endDate: DateInput): Date[] => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (!start || !end) return [];
    
    return eachDayOfInterval({ start, end });
  },

  /**
   * Get all weeks in range
   */
  getWeeks: (startDate: DateInput, endDate: DateInput): Date[] => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (!start || !end) return [];
    
    return eachWeekOfInterval({ start, end });
  },

  /**
   * Get all months in range
   */
  getMonths: (startDate: DateInput, endDate: DateInput): Date[] => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (!start || !end) return [];
    
    return eachMonthOfInterval({ start, end });
  },

  /**
   * Get all years in range
   */
  getYears: (startDate: DateInput, endDate: DateInput): Date[] => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (!start || !end) return [];
    
    return eachYearOfInterval({ start, end });
  },

  /**
   * Check if ranges overlap
   */
  doRangesOverlap: (range1: DateRange, range2: DateRange): boolean => {
    return isBefore(range1.start, range2.end) && isAfter(range1.end, range2.start);
  },

  /**
   * Get range duration in days
   */
  getDuration: (range: DateRange): number => {
    return differenceInDays(range.end, range.start) + 1;
  },

  /**
   * Split range into smaller periods
   */
  split: (range: DateRange, period: 'day' | 'week' | 'month'): DateRange[] => {
    const ranges: DateRange[] = [];
    let current = range.start;

    while (isBefore(current, range.end) || isSameDay(current, range.end)) {
      let next: Date;
      
      switch (period) {
        case 'day':
          next = endOfDay(current);
          break;
        case 'week':
          next = endOfWeek(current);
          break;
        case 'month':
          next = endOfMonth(current);
          break;
        default:
          next = current;
      }

      if (isAfter(next, range.end)) {
        next = range.end;
      }

      ranges.push({ start: current, end: next });

      if (isSameDay(next, range.end)) break;
      
      current = addDays(next, 1);
    }

    return ranges;
  }
};

/**
 * Timezone utilities
 */
export const timezone = {
  /**
   * Get user's timezone
   */
  getUserTimezone: (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },

  /**
   * Convert date to user's timezone
   */
  toUserTimezone: (date: DateInput): Date | null => {
    const parsed = parseDate(date);
    if (!parsed) return null;
    
    // This is a simplified version - for production use a proper timezone library
    return new Date(parsed.toLocaleString());
  },

  /**
   * Get timezone offset
   */
  getOffset: (date: DateInput = new Date()): number => {
    const parsed = parseDate(date);
    return parsed ? parsed.getTimezoneOffset() : 0;
  }
};

/**
 * Age calculation utilities
 */
export const age = {
  /**
   * Calculate age in years
   */
  inYears: (birthDate: DateInput, referenceDate?: DateInput): number => {
    const birth = parseDate(birthDate);
    const reference = parseDate(referenceDate || new Date());
    
    if (!birth || !reference) return 0;
    
    return differenceInYears(reference, birth);
  },

  /**
   * Calculate age with more precision
   */
  precise: (birthDate: DateInput, referenceDate?: DateInput) => {
    const birth = parseDate(birthDate);
    const reference = parseDate(referenceDate || new Date());
    
    if (!birth || !reference) {
      return { years: 0, months: 0, days: 0 };
    }
    
    const years = differenceInYears(reference, birth);
    const monthsStart = addYears(birth, years);
    const months = differenceInMonths(reference, monthsStart);
    const daysStart = addMonths(monthsStart, months);
    const days = differenceInDays(reference, daysStart);
    
    return { years, months, days };
  }
};

/**
 * Date array utilities
 */
export const array = {
  /**
   * Find minimum date in array
   */
  min: (dates: DateInput[]): Date | null => {
    const validDates = dates.map(parseDate).filter(Boolean) as Date[];
    return validDates.length > 0 ? min(validDates) : null;
  },

  /**
   * Find maximum date in array
   */
  max: (dates: DateInput[]): Date | null => {
    const validDates = dates.map(parseDate).filter(Boolean) as Date[];
    return validDates.length > 0 ? max(validDates) : null;
  },

  /**
   * Find closest date to reference
   */
  closest: (dates: DateInput[], referenceDate: DateInput): Date | null => {
    const validDates = dates.map(parseDate).filter(Boolean) as Date[];
    const reference = parseDate(referenceDate);
    
    if (validDates.length === 0 || !reference) return null;
    
    const closest = closestTo(reference, validDates);
    return closest || null;
  },

  /**
   * Sort dates
   */
  sort: (dates: DateInput[], direction: 'asc' | 'desc' = 'asc'): Date[] => {
    const validDates = dates.map(parseDate).filter(Boolean) as Date[];
    
    return validDates.sort((a, b) => {
      if (direction === 'asc') {
        return isBefore(a, b) ? -1 : isAfter(a, b) ? 1 : 0;
      } else {
        return isAfter(a, b) ? -1 : isBefore(a, b) ? 1 : 0;
      }
    });
  },

  /**
   * Group dates by period
   */
  groupBy: (
    dates: DateInput[],
    period: 'day' | 'week' | 'month' | 'year'
  ): Record<string, Date[]> => {
    const validDates = dates.map(parseDate).filter(Boolean) as Date[];
    const groups: Record<string, Date[]> = {};

    validDates.forEach(date => {
      let key: string;
      
      switch (period) {
        case 'day':
          key = formatDate(date, 'yyyy-MM-dd');
          break;
        case 'week':
          key = formatDate(startOfWeek(date), 'yyyy-MM-dd');
          break;
        case 'month':
          key = formatDate(date, 'yyyy-MM');
          break;
        case 'year':
          key = formatDate(date, 'yyyy');
          break;
        default:
          key = formatDate(date, 'yyyy-MM-dd');
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(date);
    });

    return groups;
  }
};

// Common Indian holidays (you can extend this list)
export const INDIAN_HOLIDAYS: Holiday[] = [
  { date: new Date(2024, 0, 26), name: 'Republic Day', type: 'national' },
  { date: new Date(2024, 7, 15), name: 'Independence Day', type: 'national' },
  { date: new Date(2024, 9, 2), name: 'Gandhi Jayanti', type: 'national' },
  // Add more holidays as needed
];

// Alias exports for compatibility
export const formatDateTime = formatDate;
export const formatRelativeTime = getRelativeTime;
export const isValidDate = validate.isValid;

// Export default object with main utilities
const dateUtils = {
  parseDate,
  formatDate,
  formatDateTime,
  getRelativeTime,
  formatRelativeTime,
  getRelativeDate,
  isValidDate,
  formatters,
  compare,
  manipulate,
  difference,
  validate,
  business,
  range,
  timezone,
  age,
  array,
  INDIAN_HOLIDAYS
};

export default dateUtils;
