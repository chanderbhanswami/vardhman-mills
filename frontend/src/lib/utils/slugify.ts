/**
 * Slugify Utilities
 * Comprehensive URL slug generation, sanitization, and manipulation functions
 */

// Types
export interface SlugifyOptions {
  separator?: string;
  lowercase?: boolean;
  strict?: boolean;
  trim?: boolean;
  maxLength?: number;
  locale?: string;
  replacement?: Record<string, string>;
  remove?: RegExp;
  preserveLeadingUnderscore?: boolean;
  preserveTrailingDash?: boolean;
}

// Default character replacements for different languages
const DEFAULT_REPLACEMENTS: Record<string, string> = {
  // Latin characters with diacritics
  'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'AE',
  'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'ae',
  'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
  'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
  'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
  'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
  'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ø': 'O',
  'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o',
  'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
  'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
  'Ý': 'Y', 'ý': 'y', 'ÿ': 'y',
  'Ñ': 'N', 'ñ': 'n',
  'Ç': 'C', 'ç': 'c',
  'ß': 'ss',
  // Polish (characters not in Latin set)
  'ą': 'a', 'Ą': 'A',
  'ć': 'c', 'Ć': 'C',
  'ę': 'e', 'Ę': 'E',
  'ł': 'l', 'Ł': 'L',
  'ń': 'n', 'Ń': 'N',
  'ś': 's', 'Ś': 'S',
  'ź': 'z', 'Ź': 'Z',
  'ż': 'z', 'Ż': 'Z',
  // Czech
  'č': 'c', 'Č': 'C',
  'ď': 'd', 'Ď': 'D',
  'ě': 'e', 'Ě': 'E',
  'ň': 'n', 'Ň': 'N',
  'ř': 'r', 'Ř': 'R',
  'š': 's', 'Š': 'S',
  'ť': 't', 'Ť': 'T',
  'ů': 'u', 'Ů': 'U',
  'ž': 'z', 'Ž': 'Z',
  // Russian (Cyrillic)
  'а': 'a', 'А': 'A',
  'б': 'b', 'Б': 'B',
  'в': 'v', 'В': 'V',
  'г': 'g', 'Г': 'G',
  'д': 'd', 'Д': 'D',
  'е': 'e', 'Е': 'E',
  'ё': 'yo', 'Ё': 'Yo',
  'ж': 'zh', 'Ж': 'Zh',
  'з': 'z', 'З': 'Z',
  'и': 'i', 'И': 'I',
  'й': 'y', 'Й': 'Y',
  'к': 'k', 'К': 'K',
  'л': 'l', 'Л': 'L',
  'м': 'm', 'М': 'M',
  'н': 'n', 'Н': 'N',
  'о': 'o', 'О': 'O',
  'п': 'p', 'П': 'P',
  'р': 'r', 'Р': 'R',
  'с': 's', 'С': 'S',
  'т': 't', 'Т': 'T',
  'у': 'u', 'У': 'U',
  'ф': 'f', 'Ф': 'F',
  'х': 'h', 'Х': 'H',
  'ц': 'ts', 'Ц': 'Ts',
  'ч': 'ch', 'Ч': 'Ch',
  'ш': 'sh', 'Ш': 'Sh',
  'щ': 'sch', 'Щ': 'Sch',
  'ъ': '', 'Ъ': '',
  'ы': 'y', 'Ы': 'Y',
  'ь': '', 'Ь': '',
  'э': 'e', 'Э': 'E',
  'ю': 'yu', 'Ю': 'Yu',
  'я': 'ya', 'Я': 'Ya',
  // Greek
  'α': 'a', 'Α': 'A',
  'β': 'b', 'Β': 'B',
  'γ': 'g', 'Γ': 'G',
  'δ': 'd', 'Δ': 'D',
  'ε': 'e', 'Ε': 'E',
  'ζ': 'z', 'Ζ': 'Z',
  'η': 'h', 'Η': 'H',
  'θ': 'th', 'Θ': 'Th',
  'ι': 'i', 'Ι': 'I',
  'κ': 'k', 'Κ': 'K',
  'λ': 'l', 'Λ': 'L',
  'μ': 'm', 'Μ': 'M',
  'ν': 'n', 'Ν': 'N',
  'ξ': 'ks', 'Ξ': 'Ks',
  'ο': 'o', 'Ο': 'O',
  'π': 'p', 'Π': 'P',
  'ρ': 'r', 'Ρ': 'R',
  'σ': 's', 'Σ': 'S',
  'τ': 't', 'Τ': 'T',
  'υ': 'y', 'Υ': 'Y',
  'φ': 'f', 'Φ': 'F',
  'χ': 'ch', 'Χ': 'Ch',
  'ψ': 'ps', 'Ψ': 'Ps',
  'ω': 'w', 'Ω': 'W',
  // Arabic
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa',
  'ب': 'b', 'ت': 't', 'ث': 'th',
  'ج': 'g', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'th', 'ر': 'r',
  'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd', 'ط': 't',
  'ظ': 'th', 'ع': 'aa', 'غ': 'gh',
  'ف': 'f', 'ق': 'k', 'ك': 'k',
  'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'o', 'ي': 'y',
  // Special characters
  '&': 'and',
  '@': 'at',
  '#': 'hash',
  '%': 'percent',
  '+': 'plus',
  '=': 'equals',
  '<': 'lt',
  '>': 'gt',
  '|': 'or',
  '\\': 'slash',
  '/': 'slash',
  '"': 'quote',
  "'": 'quote',
  '`': 'tick',
  '~': 'tilde',
  '^': 'caret',
  '(': '',
  ')': '',
  '[': '',
  ']': '',
  '{': '',
  '}': '',
  '!': '',
  '?': '',
  ':': '',
  ';': '',
  ',': '',
  '.': '',
  '…': '',
  '–': '-',
  '—': '-',
  '\u2018': '', // Left single quotation mark
  '\u2019': '', // Right single quotation mark
  '\u201C': '', // Left double quotation mark
  '\u201D': '', // Right double quotation mark
  '«': '',
  '»': '',
  '§': 'section',
  '¶': 'paragraph',
  '©': 'copyright',
  '®': 'registered',
  '™': 'trademark',
  '€': 'euro',
  '£': 'pound',
  '$': 'dollar',
  '¥': 'yen',
  '₹': 'rupee'
};

/**
 * Main slugify function with comprehensive options
 */
export function slugify(input: string, options: SlugifyOptions = {}): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const {
    separator = '-',
    lowercase = true,
    strict = false,
    trim = true,
    maxLength,
    replacement = {},
    remove,
    preserveLeadingUnderscore = false,
    preserveTrailingDash = false
  } = options;

  let result = input;

  // Preserve leading underscore if requested
  const hasLeadingUnderscore = preserveLeadingUnderscore && result.startsWith('_');
  if (hasLeadingUnderscore) {
    result = result.substring(1);
  }

  // Preserve trailing dash if requested
  const hasTrailingDash = preserveTrailingDash && result.endsWith('-');
  if (hasTrailingDash) {
    result = result.slice(0, -1);
  }

  // Apply custom replacements first
  const allReplacements = { ...DEFAULT_REPLACEMENTS, ...replacement };
  Object.entries(allReplacements).forEach(([char, replace]) => {
    result = result.replace(new RegExp(char, 'g'), replace);
  });

  // Apply Unicode normalization
  result = result.normalize('NFD');

  // Remove diacritics
  result = result.replace(/[\u0300-\u036f]/g, '');

  // Convert to lowercase if requested
  if (lowercase) {
    result = result.toLowerCase();
  }

  // Remove specified characters
  if (remove) {
    result = result.replace(remove, '');
  }

  // In strict mode, remove all non-alphanumeric characters except separators
  if (strict) {
    result = result.replace(/[^a-zA-Z0-9\s\-_]/g, '');
  } else {
    // Remove remaining special characters
    result = result.replace(/[^\w\s\-_]/g, '');
  }

  // Replace whitespace and multiple separators with single separator
  result = result.replace(/[\s\-_]+/g, separator);

  // Remove leading and trailing separators if trim is enabled
  if (trim) {
    const separatorRegex = new RegExp(`^\\${separator}+|\\${separator}+$`, 'g');
    result = result.replace(separatorRegex, '');
  }

  // Restore leading underscore if it was preserved
  if (hasLeadingUnderscore) {
    result = '_' + result;
  }

  // Restore trailing dash if it was preserved
  if (hasTrailingDash) {
    result = result + '-';
  }

  // Apply max length limit
  if (maxLength && result.length > maxLength) {
    result = result.substring(0, maxLength);
    
    // Remove trailing separator after truncation
    if (trim) {
      const separatorRegex = new RegExp(`\\${separator}+$`, 'g');
      result = result.replace(separatorRegex, '');
    }
  }

  return result;
}

/**
 * Simple slugify with default settings
 */
export function simpleSlugify(input: string): string {
  return slugify(input, {
    lowercase: true,
    strict: true,
    separator: '-',
    trim: true
  });
}

/**
 * URL-safe slugify (removes all special characters)
 */
export function urlSlugify(input: string): string {
  return slugify(input, {
    lowercase: true,
    strict: true,
    separator: '-',
    trim: true,
    remove: /[^\w\s\-]/g
  });
}

/**
 * Filename-safe slugify
 */
export function filenameSlugify(input: string): string {
  return slugify(input, {
    lowercase: true,
    separator: '_',
    trim: true,
    remove: /[<>:"/\\|?*]/g,
    replacement: {
      ' ': '_'
    }
  });
}

/**
 * Create slug with unique suffix if needed
 */
export function uniqueSlugify(input: string, existingSlugs: string[], options: SlugifyOptions = {}): string {
  const baseSlug = slugify(input, options);
  
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  return uniqueSlug;
}

/**
 * Reverse slugify (convert slug back to readable text)
 */
export function unslugify(slug: string, separator = '-'): string {
  if (!slug) return '';
  
  return slug
    .split(separator)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string, options: {
  minLength?: number;
  maxLength?: number;
  allowNumbers?: boolean;
  allowUnderscore?: boolean;
  customPattern?: RegExp;
} = {}): { isValid: boolean; errors: string[] } {
  const {
    minLength = 1,
    maxLength = 100,
    allowNumbers = true,
    allowUnderscore = false,
    customPattern
  } = options;
  
  const errors: string[] = [];
  
  // Check length
  if (slug.length < minLength) {
    errors.push(`Slug must be at least ${minLength} characters long`);
  }
  
  if (slug.length > maxLength) {
    errors.push(`Slug must be no more than ${maxLength} characters long`);
  }
  
  // Check format
  if (customPattern) {
    if (!customPattern.test(slug)) {
      errors.push('Slug does not match the required pattern');
    }
  } else {
    let pattern = '^[a-z]';
    pattern += allowNumbers ? '[a-z0-9]' : '[a-z]';
    pattern += allowUnderscore ? '*(-[a-z0-9_]+)*' : '*(-[a-z0-9]+)*';
    pattern += '$';
    
    const regex = new RegExp(pattern);
    if (!regex.test(slug)) {
      errors.push('Slug contains invalid characters or format');
    }
  }
  
  // Check for consecutive separators
  if (slug.includes('--')) {
    errors.push('Slug cannot contain consecutive dashes');
  }
  
  // Check for leading/trailing separators
  if (slug.startsWith('-') || slug.endsWith('-')) {
    errors.push('Slug cannot start or end with a dash');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate multiple slug variations
 */
export function generateSlugVariations(input: string, count = 5): string[] {
  const variations: string[] = [];
  const baseSlug = slugify(input);
  
  variations.push(baseSlug);
  
  // Add variations with different separators
  if (count > 1) {
    variations.push(slugify(input, { separator: '_' }));
  }
  
  // Add shorter version
  if (count > 2 && baseSlug.length > 20) {
    const words = input.split(/\s+/);
    const shortVersion = words.slice(0, Math.min(3, words.length)).join(' ');
    variations.push(slugify(shortVersion));
  }
  
  // Add version without articles
  if (count > 3) {
    const withoutArticles = input.replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/gi, ' ');
    const cleanedSlug = slugify(withoutArticles);
    if (cleanedSlug !== baseSlug) {
      variations.push(cleanedSlug);
    }
  }
  
  // Add abbreviated version
  if (count > 4) {
    const words = input.split(/\s+/);
    if (words.length > 2) {
      const abbreviated = words.map(word => word.charAt(0)).join('');
      variations.push(slugify(abbreviated));
    }
  }
  
  return variations.slice(0, count);
}

/**
 * Extract slug from URL
 */
export function extractSlugFromURL(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
    return pathParts[pathParts.length - 1] || '';
  } catch {
    // If URL parsing fails, try to extract from string
    const parts = url.split('/').filter(part => part.length > 0);
    return parts[parts.length - 1] || '';
  }
}

/**
 * Generate breadcrumb slugs from path
 */
export function generateBreadcrumbSlugs(path: string): Array<{ slug: string; title: string }> {
  const parts = path.split('/').filter(part => part.length > 0);
  
  return parts.map(part => ({
    slug: part,
    title: unslugify(part)
  }));
}

/**
 * Slugify with language-specific rules
 */
export function slugifyWithLocale(input: string, locale = 'en', options: SlugifyOptions = {}): string {
  const localeReplacements: Record<string, Record<string, string>> = {
    'de': {
      'ü': 'ue', 'Ü': 'Ue',
      'ä': 'ae', 'Ä': 'Ae',
      'ö': 'oe', 'Ö': 'Oe',
      'ß': 'ss'
    },
    'es': {
      'ñ': 'n', 'Ñ': 'N'
    },
    'fr': {
      'ç': 'c', 'Ç': 'C'
    },
    'it': {
      'à': 'a', 'è': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u'
    }
  };
  
  const localeSpecificReplacements = localeReplacements[locale] || {};
  
  return slugify(input, {
    ...options,
    replacement: {
      ...localeSpecificReplacements,
      ...options.replacement
    }
  });
}

/**
 * Slugify utilities collection
 */
export const slugifyUtils = {
  slugify,
  simpleSlugify,
  urlSlugify,
  filenameSlugify,
  uniqueSlugify,
  unslugify,
  validateSlug,
  generateSlugVariations,
  extractSlugFromURL,
  generateBreadcrumbSlugs,
  slugifyWithLocale,
  DEFAULT_REPLACEMENTS
};

// Export default
const slugifyUtilities = {
  slugify,
  simpleSlugify,
  urlSlugify,
  filenameSlugify,
  uniqueSlugify,
  unslugify,
  validateSlug,
  generateSlugVariations,
  extractSlugFromURL,
  generateBreadcrumbSlugs,
  slugifyWithLocale,
  slugifyUtils,
  DEFAULT_REPLACEMENTS
};

export default slugifyUtilities;
