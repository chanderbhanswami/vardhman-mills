/**
 * String Manipulation Utilities
 * Comprehensive string processing and manipulation functions
 */

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert to title case
 */
export function titleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Convert to camel case
 */
export function camelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * Convert to pascal case
 */
export function pascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '');
}

/**
 * Convert to kebab case
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Convert to snake case
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

/**
 * Remove all whitespace
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s+/g, '');
}

/**
 * Remove extra whitespace (normalize spacing)
 */
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Truncate string by words
 */
export function truncateWords(str: string, wordCount: number, suffix = '...'): string {
  const words = str.split(/\s+/);
  if (words.length <= wordCount) return str;
  return words.slice(0, wordCount).join(' ') + suffix;
}

/**
 * Pad string with characters
 */
export function pad(str: string, length: number, char = ' ', direction: 'left' | 'right' | 'both' = 'right'): string {
  if (str.length >= length) return str;
  
  const padLength = length - str.length;
  const padString = char.repeat(Math.ceil(padLength / char.length)).slice(0, padLength);
  
  switch (direction) {
    case 'left':
      return padString + str;
    case 'both':
      const leftPad = Math.floor(padLength / 2);
      const rightPad = padLength - leftPad;
      return char.repeat(leftPad) + str + char.repeat(rightPad);
    default:
      return str + padString;
  }
}

/**
 * Count words in string
 */
export function wordCount(str: string): number {
  return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Count characters (excluding spaces)
 */
export function charCount(str: string, includeSpaces = true): number {
  return includeSpaces ? str.length : str.replace(/\s/g, '').length;
}

/**
 * Reverse string
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Check if string is palindrome
 */
export function isPalindrome(str: string): boolean {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === reverse(cleaned);
}

/**
 * Remove diacritics/accents from string
 */
export function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Slugify string for URLs
 */
export function slugify(str: string): string {
  return removeDiacritics(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract numbers from string
 */
export function extractNumbers(str: string): number[] {
  const matches = str.match(/\d+/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Extract emails from string
 */
export function extractEmails(str: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return str.match(emailRegex) || [];
}

/**
 * Extract URLs from string
 */
export function extractUrls(str: string): string[] {
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  return str.match(urlRegex) || [];
}

/**
 * Extract phone numbers from string
 */
export function extractPhoneNumbers(str: string): string[] {
  const phoneRegex = /(?:\+?1[-.\s]?)?(?:\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})|(?:\+91[-.\s]?[0-9]{10})/g;
  return str.match(phoneRegex) || [];
}

/**
 * Mask sensitive information
 */
export function mask(str: string, visibleStart = 2, visibleEnd = 2, maskChar = '*'): string {
  if (str.length <= visibleStart + visibleEnd) return str;
  
  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const masked = maskChar.repeat(str.length - visibleStart - visibleEnd);
  
  return start + masked + end;
}

/**
 * Generate random string
 */
export function randomString(length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Escape HTML characters
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return str.replace(/[&<>"'/]/g, (match) => htmlEscapes[match]);
}

/**
 * Unescape HTML characters
 */
export function unescapeHtml(str: string): string {
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/'
  };
  
  return str.replace(/&(?:amp|lt|gt|quot|#x27|#x2F);/g, (match) => htmlUnescapes[match]);
}

/**
 * Strip HTML tags
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Highlight search terms in text
 */
export function highlight(text: string, searchTerm: string, className = 'highlight'): string {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, `<mark class="${className}">$1</mark>`);
}

/**
 * Split string into chunks
 */
export function chunk(str: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}

/**
 * Repeat string n times
 */
export function repeat(str: string, count: number): string {
  return str.repeat(Math.max(0, count));
}

/**
 * Insert string at position
 */
export function insert(str: string, index: number, insertion: string): string {
  return str.slice(0, index) + insertion + str.slice(index);
}

/**
 * Remove substring at position
 */
export function remove(str: string, start: number, length: number): string {
  return str.slice(0, start) + str.slice(start + length);
}

/**
 * Replace all occurrences
 */
export function replaceAll(str: string, search: string, replacement: string): string {
  return str.split(search).join(replacement);
}

/**
 * Count occurrences of substring
 */
export function countOccurrences(str: string, search: string): number {
  return (str.match(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
}

/**
 * Check if string contains only letters
 */
export function isAlpha(str: string): boolean {
  return /^[a-zA-Z]+$/.test(str);
}

/**
 * Check if string contains only numbers
 */
export function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}

/**
 * Check if string contains only alphanumeric characters
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Check if string is valid email
 */
export function isEmail(str: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(str);
}

/**
 * Check if string is valid URL
 */
export function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is valid JSON
 */
export function isJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * String similarity (0-1 scale based on Levenshtein distance)
 */
export function similarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1, str2);
  return (maxLength - distance) / maxLength;
}

/**
 * Fuzzy search in array of strings
 */
export function fuzzySearch(query: string, items: string[], threshold = 0.6): string[] {
  return items
    .map(item => ({ item, score: similarity(query.toLowerCase(), item.toLowerCase()) }))
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

/**
 * Format string template with variables
 */
export function template(str: string, variables: Record<string, unknown>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}

/**
 * Pluralize word based on count
 */
export function pluralize(word: string, count: number, plural?: string): string {
  if (count === 1) return word;
  
  if (plural) return plural;
  
  // Simple pluralization rules
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  } else if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
    return word + 'es';
  } else {
    return word + 's';
  }
}

/**
 * String utilities collection
 */
export const stringUtils = {
  capitalize,
  titleCase,
  camelCase,
  pascalCase,
  kebabCase,
  snakeCase,
  removeWhitespace,
  normalizeWhitespace,
  truncate,
  truncateWords,
  pad,
  wordCount,
  charCount,
  reverse,
  isPalindrome,
  removeDiacritics,
  slugify,
  extractNumbers,
  extractEmails,
  extractUrls,
  extractPhoneNumbers,
  mask,
  randomString,
  escapeHtml,
  unescapeHtml,
  stripHtml,
  highlight,
  chunk,
  repeat,
  insert,
  remove,
  replaceAll,
  countOccurrences,
  isAlpha,
  isNumeric,
  isAlphanumeric,
  isEmail,
  isUrl,
  isJson,
  levenshteinDistance,
  similarity,
  fuzzySearch,
  template,
  pluralize
};

// Export default
const stringUtilities = {
  capitalize,
  titleCase,
  camelCase,
  pascalCase,
  kebabCase,
  snakeCase,
  removeWhitespace,
  normalizeWhitespace,
  truncate,
  truncateWords,
  pad,
  wordCount,
  charCount,
  reverse,
  isPalindrome,
  removeDiacritics,
  slugify,
  extractNumbers,
  extractEmails,
  extractUrls,
  extractPhoneNumbers,
  mask,
  randomString,
  escapeHtml,
  unescapeHtml,
  stripHtml,
  highlight,
  chunk,
  repeat,
  insert,
  remove,
  replaceAll,
  countOccurrences,
  isAlpha,
  isNumeric,
  isAlphanumeric,
  isEmail,
  isUrl,
  isJson,
  levenshteinDistance,
  similarity,
  fuzzySearch,
  template,
  pluralize,
  stringUtils
};

export default stringUtilities;
