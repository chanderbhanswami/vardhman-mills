/**
 * Object Manipulation Utilities
 * Comprehensive utilities for working with JavaScript objects
 */

import { 
  isEqual as lodashIsEqual, 
  cloneDeep, 
  merge, 
  pick as lodashPick, 
  omit as lodashOmit, 
  get, 
  set, 
  has, 
  unset 
} from 'lodash';

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type PathType = string | (string | number)[];

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return cloneDeep(obj);
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends object>(...objects: Partial<T>[]): T {
  return merge({}, ...objects) as T;
}

/**
 * Check if two objects are deeply equal
 */
export function deepEqual<T>(obj1: T, obj2: T): boolean {
  return lodashIsEqual(obj1, obj2);
}

/**
 * Get nested property value safely
 */
export function getNestedValue<T = unknown>(obj: object, path: PathType, defaultValue?: T): T {
  return get(obj, path, defaultValue) as T;
}

/**
 * Set nested property value safely
 */
export function setNestedValue<T extends object>(obj: T, path: PathType, value: unknown): T {
  return set(obj, path, value);
}

/**
 * Check if nested property exists
 */
export function hasNestedProperty(obj: object, path: PathType): boolean {
  return has(obj, path);
}

/**
 * Delete nested property
 */
export function deleteNestedProperty<T extends object>(obj: T, path: PathType): boolean {
  return unset(obj, path);
}

/**
 * Pick specific properties from object
 */
export function pickProperties<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return lodashPick(obj, keys);
}

/**
 * Omit specific properties from object
 */
export function omitProperties<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  return lodashOmit(obj, keys);
}

/**
 * Flatten nested object
 */
export function flattenObject(obj: object, prefix = '', separator = '.'): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}${separator}${key}` : key;
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey, separator));
    } else {
      result[newKey] = value;
    }
  });
  
  return result;
}

/**
 * Unflatten object
 */
export function unflattenObject(obj: Record<string, unknown>, separator = '.'): object {
  const result: Record<string, unknown> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const keys = key.split(separator);
    let current = result;
    
    keys.forEach((k, index) => {
      if (index === keys.length - 1) {
        current[k] = value;
      } else {
        if (!current[k] || typeof current[k] !== 'object') {
          current[k] = {};
        }
        current = current[k] as Record<string, unknown>;
      }
    });
  });
  
  return result;
}

/**
 * Get all keys recursively
 */
export function getAllKeys(obj: object, prefix = '', separator = '.'): string[] {
  const keys: string[] = [];
  
  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}${separator}${key}` : key;
    keys.push(fullKey);
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey, separator));
    }
  });
  
  return keys;
}

/**
 * Get all values recursively
 */
export function getAllValues(obj: object): unknown[] {
  const values: unknown[] = [];
  
  Object.values(obj).forEach(value => {
    values.push(value);
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      values.push(...getAllValues(value));
    }
  });
  
  return values;
}

/**
 * Transform object values
 */
export function transformValues<T extends object, R>(
  obj: T,
  transformer: (value: unknown, key: string, obj: T) => R
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>;
  
  Object.entries(obj).forEach(([key, value]) => {
    result[key as keyof T] = transformer(value, key, obj);
  });
  
  return result;
}

/**
 * Transform object keys
 */
export function transformKeys<T extends object>(
  obj: T,
  transformer: (key: string, value: unknown, obj: T) => string
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = transformer(key, value, obj);
    result[newKey] = value;
  });
  
  return result;
}

/**
 * Filter object properties
 */
export function filterObject<T extends object>(
  obj: T,
  predicate: (value: unknown, key: string, obj: T) => boolean
): Partial<T> {
  const result = {} as Partial<T>;
  
  Object.entries(obj).forEach(([key, value]) => {
    if (predicate(value, key, obj)) {
      result[key as keyof T] = value;
    }
  });
  
  return result;
}

/**
 * Group object properties by a function
 */
export function groupObjectBy<T extends object>(
  obj: T,
  grouper: (value: unknown, key: string) => string
): Record<string, Partial<T>> {
  const groups: Record<string, Partial<T>> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const groupKey = grouper(value, key);
    
    if (!groups[groupKey]) {
      groups[groupKey] = {};
    }
    
    groups[groupKey][key as keyof T] = value;
  });
  
  return groups;
}

/**
 * Invert object (swap keys and values)
 */
export function invertObject<T extends Record<string, string | number>>(obj: T): Record<string, string> {
  const result: Record<string, string> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    result[String(value)] = key;
  });
  
  return result;
}

/**
 * Remove null/undefined values
 */
export function cleanObject<T extends object>(obj: T, options: {
  removeNull?: boolean;
  removeUndefined?: boolean;
  removeEmptyStrings?: boolean;
  removeEmptyObjects?: boolean;
  removeEmptyArrays?: boolean;
} = {}): Partial<T> {
  const {
    removeNull = true,
    removeUndefined = true,
    removeEmptyStrings = false,
    removeEmptyObjects = false,
    removeEmptyArrays = false
  } = options;
  
  const result = {} as Partial<T>;
  
  Object.entries(obj).forEach(([key, value]) => {
    let shouldRemove = false;
    
    if (removeNull && value === null) shouldRemove = true;
    if (removeUndefined && value === undefined) shouldRemove = true;
    if (removeEmptyStrings && value === '') shouldRemove = true;
    if (removeEmptyObjects && typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length === 0) shouldRemove = true;
    if (removeEmptyArrays && Array.isArray(value) && value.length === 0) shouldRemove = true;
    
    if (!shouldRemove) {
      result[key as keyof T] = value;
    }
  });
  
  return result;
}

/**
 * Deep clean object recursively
 */
export function deepCleanObject<T extends object>(obj: T, options: {
  removeNull?: boolean;
  removeUndefined?: boolean;
  removeEmptyStrings?: boolean;
  removeEmptyObjects?: boolean;
  removeEmptyArrays?: boolean;
} = {}): Partial<T> {
  const cleaned = cleanObject(obj, options);
  const result = {} as Partial<T>;
  
  Object.entries(cleaned).forEach(([key, value]) => {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const cleanedNested = deepCleanObject(value, options);
      if (Object.keys(cleanedNested).length > 0 || !options.removeEmptyObjects) {
        result[key as keyof T] = cleanedNested as T[keyof T];
      }
    } else {
      result[key as keyof T] = value as T[keyof T];
    }
  });
  
  return result;
}

/**
 * Check if object is empty
 */
export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Check if object is plain object (not array, date, etc.)
 */
export function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  return obj !== null && typeof obj === 'object' && obj.constructor === Object;
}

/**
 * Get object size (number of properties)
 */
export function getObjectSize(obj: object): number {
  return Object.keys(obj).length;
}

/**
 * Get deep object size (all nested properties)
 */
export function getDeepObjectSize(obj: object): number {
  let count = 0;
  
  Object.values(obj).forEach(value => {
    count++;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      count += getDeepObjectSize(value);
    }
  });
  
  return count;
}

/**
 * Convert object to query string
 */
export function objectToQueryString(obj: Record<string, unknown>, prefix = ''): string {
  const params: string[] = [];
  
  Object.entries(obj).forEach(([key, value]) => {
    const paramKey = prefix ? `${prefix}[${key}]` : key;
    
    if (value === null || value === undefined) {
      return;
    }
    
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        params.push(`${paramKey}[${index}]=${encodeURIComponent(String(item))}`);
      });
    } else if (typeof value === 'object') {
      params.push(objectToQueryString(value as Record<string, unknown>, paramKey));
    } else {
      params.push(`${paramKey}=${encodeURIComponent(String(value))}`);
    }
  });
  
  return params.filter(param => param.length > 0).join('&');
}

/**
 * Parse query string to object
 */
export function queryStringToObject(queryString: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const params = new URLSearchParams(queryString.startsWith('?') ? queryString.slice(1) : queryString);
  
  params.forEach((value, key) => {
    // Handle array notation
    if (key.includes('[') && key.includes(']')) {
      const match = key.match(/^([^[]+)\[(\d+)\]$/);
      if (match) {
        const [, arrayKey, index] = match;
        if (!result[arrayKey]) {
          result[arrayKey] = [];
        }
        (result[arrayKey] as unknown[])[parseInt(index)] = value;
        return;
      }
    }
    
    result[key] = value;
  });
  
  return result;
}

/**
 * Create object from key-value pairs
 */
export function fromEntries<T = unknown>(entries: [string, T][]): Record<string, T> {
  const result: Record<string, T> = {};
  
  entries.forEach(([key, value]) => {
    result[key] = value;
  });
  
  return result;
}

/**
 * Get object entries with proper typing
 */
export function getEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

/**
 * Sort object by keys
 */
export function sortObjectByKeys<T extends object>(obj: T): T {
  const sortedKeys = Object.keys(obj).sort();
  const result = {} as T;
  
  sortedKeys.forEach(key => {
    result[key as keyof T] = obj[key as keyof T];
  });
  
  return result;
}

/**
 * Sort object by values
 */
export function sortObjectByValues<T extends Record<string, string | number>>(
  obj: T,
  direction: 'asc' | 'desc' = 'asc'
): T {
  const entries = Object.entries(obj).sort(([, a], [, b]) => {
    if (direction === 'asc') {
      return a > b ? 1 : -1;
    }
    return a < b ? 1 : -1;
  });
  
  return fromEntries(entries) as T;
}

/**
 * Object utilities collection
 */
export const objectUtils = {
  deepClone,
  deepMerge,
  deepEqual,
  get: getNestedValue,
  set: setNestedValue,
  has: hasNestedProperty,
  delete: deleteNestedProperty,
  pick: pickProperties,
  omit: omitProperties,
  flatten: flattenObject,
  unflatten: unflattenObject,
  keys: getAllKeys,
  values: getAllValues,
  transformValues,
  transformKeys,
  filter: filterObject,
  groupBy: groupObjectBy,
  invert: invertObject,
  clean: cleanObject,
  deepClean: deepCleanObject,
  isEmpty: isEmptyObject,
  isPlain: isPlainObject,
  size: getObjectSize,
  deepSize: getDeepObjectSize,
  toQuery: objectToQueryString,
  fromQuery: queryStringToObject,
  fromEntries,
  entries: getEntries,
  sortByKeys: sortObjectByKeys,
  sortByValues: sortObjectByValues
};

// Alias exports for compatibility
export const pick = pickProperties;
export const omit = omitProperties;
export const isEmpty = isEmptyObject;
export const isEqual = deepEqual;

// Export default
const objectUtilities = {
  deepClone,
  deepMerge,
  deepEqual,
  getNestedValue,
  setNestedValue,
  hasNestedProperty,
  deleteNestedProperty,
  pickProperties,
  omitProperties,
  pick,
  omit,
  flattenObject,
  unflattenObject,
  getAllKeys,
  getAllValues,
  transformValues,
  transformKeys,
  filterObject,
  groupObjectBy,
  invertObject,
  cleanObject,
  deepCleanObject,
  isEmptyObject,
  isEmpty,
  isPlainObject,
  isEqual,
  getObjectSize,
  getDeepObjectSize,
  objectToQueryString,
  queryStringToObject,
  fromEntries,
  getEntries,
  sortObjectByKeys,
  sortObjectByValues,
  objectUtils
};

export default objectUtilities;
