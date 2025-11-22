/**
 * Array Utility Functions
 * Comprehensive collection of array manipulation and processing utilities
 */

import { ID } from '@/types/common.types';

/**
 * Remove duplicate items from an array
 */
export function removeDuplicates<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Remove duplicate objects by a specific key
 */
export function removeDuplicatesByKey<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Group array items by a specific key
 */
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Group array items by a custom function
 */
export function groupByFn<T>(
  array: T[],
  groupFn: (item: T) => string
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = groupFn(item);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by a specific key
 */
export function sortBy<T, K extends keyof T>(
  array: T[],
  key: K,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Sort array by multiple keys
 */
export function sortByMultiple<T>(
  array: T[],
  sortKeys: Array<{ key: keyof T; direction?: 'asc' | 'desc' }>
): T[] {
  return [...array].sort((a, b) => {
    for (const { key, direction = 'asc' } of sortKeys) {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Sort array by custom function
 */
export function sortByFn<T>(
  array: T[],
  sortFn: (item: T) => string | number,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = sortFn(a);
    const bVal = sortFn(b);
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Chunk array into smaller arrays of specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) return [];
  
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flatten nested arrays
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce<T[]>((acc, val) => {
    return acc.concat(Array.isArray(val) ? flatten(val) : val);
  }, []);
}

/**
 * Get unique values from multiple arrays
 */
export function union<T>(...arrays: T[][]): T[] {
  return removeDuplicates(flatten(arrays));
}

/**
 * Get intersection of multiple arrays
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];
  
  return arrays.reduce((acc, current) =>
    acc.filter(item => current.includes(item))
  );
}

/**
 * Get difference between arrays (items in first array but not in others)
 */
export function difference<T>(array: T[], ...arrays: T[][]): T[] {
  const otherItems = new Set(flatten(arrays));
  return array.filter(item => !otherItems.has(item));
}

/**
 * Shuffle array randomly
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random item from array
 */
export function sample<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get multiple random items from array
 */
export function sampleSize<T>(array: T[], size: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(size, array.length));
}

/**
 * Move item from one index to another
 */
export function moveItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Insert item at specific index
 */
export function insertAt<T>(array: T[], index: number, item: T): T[] {
  const result = [...array];
  result.splice(index, 0, item);
  return result;
}

/**
 * Remove item at specific index
 */
export function removeAt<T>(array: T[], index: number): T[] {
  const result = [...array];
  result.splice(index, 1);
  return result;
}

/**
 * Update item at specific index
 */
export function updateAt<T>(array: T[], index: number, item: T): T[] {
  const result = [...array];
  result[index] = item;
  return result;
}

/**
 * Find item by ID
 */
export function findById<T extends { id: ID }>(array: T[], id: ID): T | undefined {
  return array.find(item => item.id === id);
}

/**
 * Find index by ID
 */
export function findIndexById<T extends { id: ID }>(array: T[], id: ID): number {
  return array.findIndex(item => item.id === id);
}

/**
 * Remove item by ID
 */
export function removeById<T extends { id: ID }>(array: T[], id: ID): T[] {
  return array.filter(item => item.id !== id);
}

/**
 * Update item by ID
 */
export function updateById<T extends { id: ID }>(
  array: T[],
  id: ID,
  updates: Partial<T>
): T[] {
  return array.map(item =>
    item.id === id ? { ...item, ...updates } : item
  );
}

/**
 * Toggle item in array (add if not present, remove if present)
 */
export function toggle<T>(array: T[], item: T): T[] {
  const index = array.indexOf(item);
  if (index === -1) {
    return [...array, item];
  } else {
    return array.filter((_, i) => i !== index);
  }
}

/**
 * Check if array is empty
 */
export function isEmpty<T>(array: T[]): boolean {
  return array.length === 0;
}

/**
 * Check if array is not empty
 */
export function isNotEmpty<T>(array: T[]): boolean {
  return array.length > 0;
}

/**
 * Get first item
 */
export function first<T>(array: T[]): T | undefined {
  return array[0];
}

/**
 * Get last item
 */
export function last<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

/**
 * Get items except first
 */
export function tail<T>(array: T[]): T[] {
  return array.slice(1);
}

/**
 * Get items except last
 */
export function initial<T>(array: T[]): T[] {
  return array.slice(0, -1);
}

/**
 * Take first n items
 */
export function take<T>(array: T[], count: number): T[] {
  return array.slice(0, count);
}

/**
 * Take last n items
 */
export function takeLast<T>(array: T[], count: number): T[] {
  return array.slice(-count);
}

/**
 * Drop first n items
 */
export function drop<T>(array: T[], count: number): T[] {
  return array.slice(count);
}

/**
 * Drop last n items
 */
export function dropLast<T>(array: T[], count: number): T[] {
  return array.slice(0, -count);
}

/**
 * Partition array based on predicate
 */
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  
  array.forEach(item => {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  });
  
  return [truthy, falsy];
}

/**
 * Count items matching predicate
 */
export function countBy<T>(array: T[], predicate: (item: T) => boolean): number {
  return array.filter(predicate).length;
}

/**
 * Sum array of numbers
 */
export function sum(array: number[]): number {
  return array.reduce((acc, val) => acc + val, 0);
}

/**
 * Sum array by property
 */
export function sumBy<T>(array: T[], key: keyof T): number {
  return array.reduce((acc, item) => {
    const value = item[key];
    return acc + (typeof value === 'number' ? value : 0);
  }, 0);
}

/**
 * Get average of array
 */
export function average(array: number[]): number {
  return isEmpty(array) ? 0 : sum(array) / array.length;
}

/**
 * Get average by property
 */
export function averageBy<T>(array: T[], key: keyof T): number {
  return isEmpty(array) ? 0 : sumBy(array, key) / array.length;
}

/**
 * Get minimum value
 */
export function min(array: number[]): number | undefined {
  return isEmpty(array) ? undefined : Math.min(...array);
}

/**
 * Get maximum value
 */
export function max(array: number[]): number | undefined {
  return isEmpty(array) ? undefined : Math.max(...array);
}

/**
 * Get minimum by property
 */
export function minBy<T>(array: T[], key: keyof T): T | undefined {
  if (isEmpty(array)) return undefined;
  
  return array.reduce((min, current) => {
    const currentVal = current[key];
    const minVal = min[key];
    return currentVal < minVal ? current : min;
  });
}

/**
 * Get maximum by property
 */
export function maxBy<T>(array: T[], key: keyof T): T | undefined {
  if (isEmpty(array)) return undefined;
  
  return array.reduce((max, current) => {
    const currentVal = current[key];
    const maxVal = max[key];
    return currentVal > maxVal ? current : max;
  });
}

/**
 * Create range of numbers
 */
export function range(start: number, end: number, step = 1): number[] {
  const result: number[] = [];
  
  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
  } else if (step < 0) {
    for (let i = start; i > end; i += step) {
      result.push(i);
    }
  }
  
  return result;
}

/**
 * Zip multiple arrays together
 */
export function zip<T>(...arrays: T[][]): T[][] {
  const maxLength = Math.max(...arrays.map(arr => arr.length));
  const result: T[][] = [];
  
  for (let i = 0; i < maxLength; i++) {
    result.push(arrays.map(arr => arr[i]));
  }
  
  return result;
}

/**
 * Create array with repeated value
 */
export function repeat<T>(value: T, count: number): T[] {
  return Array(count).fill(value);
}

/**
 * Check if two arrays are equal (shallow comparison)
 */
export function isEqual<T>(array1: T[], array2: T[]): boolean {
  if (array1.length !== array2.length) return false;
  return array1.every((item, index) => item === array2[index]);
}

/**
 * Check if two arrays are equal (deep comparison)
 */
export function isDeepEqual<T>(array1: T[], array2: T[]): boolean {
  if (array1.length !== array2.length) return false;
  return array1.every((item, index) => 
    JSON.stringify(item) === JSON.stringify(array2[index])
  );
}

/**
 * Compact array (remove falsy values)
 */
export function compact<T>(array: (T | null | undefined | false | 0 | '')[]): T[] {
  return array.filter(Boolean) as T[];
}

/**
 * Split array into two based on predicate
 */
export function split<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const left: T[] = [];
  const right: T[] = [];
  
  let foundSplit = false;
  
  array.forEach(item => {
    if (!foundSplit && predicate(item)) {
      foundSplit = true;
      return;
    }
    
    if (foundSplit) {
      right.push(item);
    } else {
      left.push(item);
    }
  });
  
  return [left, right];
}

/**
 * Async map with concurrency control
 */
export async function asyncMap<T, R>(
  array: T[],
  asyncFn: (item: T, index: number) => Promise<R>,
  concurrency = 1
): Promise<R[]> {
  const results: R[] = new Array(array.length);
  
  for (let i = 0; i < array.length; i += concurrency) {
    const batch = array.slice(i, i + concurrency);
    const batchPromises = batch.map((item, batchIndex) =>
      asyncFn(item, i + batchIndex)
    );
    
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach((result, batchIndex) => {
      results[i + batchIndex] = result;
    });
  }
  
  return results;
}

/**
 * Async filter
 */
export async function asyncFilter<T>(
  array: T[],
  asyncPredicate: (item: T) => Promise<boolean>
): Promise<T[]> {
  const results = await Promise.all(
    array.map(async (item) => ({
      item,
      keep: await asyncPredicate(item)
    }))
  );
  
  return results.filter(({ keep }) => keep).map(({ item }) => item);
}

/**
 * Create lookup map from array
 */
export function toLookup<T, K extends keyof T>(
  array: T[],
  key: K
): Map<T[K], T> {
  const map = new Map<T[K], T>();
  array.forEach(item => {
    map.set(item[key], item);
  });
  return map;
}

/**
 * Create grouped lookup map from array
 */
export function toGroupedLookup<T, K extends keyof T>(
  array: T[],
  key: K
): Map<T[K], T[]> {
  const map = new Map<T[K], T[]>();
  array.forEach(item => {
    const keyValue = item[key];
    if (!map.has(keyValue)) {
      map.set(keyValue, []);
    }
    map.get(keyValue)!.push(item);
  });
  return map;
}

/**
 * Get frequency count of items
 */
export function frequency<T>(array: T[]): Map<T, number> {
  const freq = new Map<T, number>();
  array.forEach(item => {
    freq.set(item, (freq.get(item) || 0) + 1);
  });
  return freq;
}

/**
 * Get most frequent item
 */
export function mode<T>(array: T[]): T | undefined {
  if (isEmpty(array)) return undefined;
  
  const freq = frequency(array);
  let maxCount = 0;
  let mode: T | undefined;
  
  freq.forEach((count, item) => {
    if (count > maxCount) {
      maxCount = count;
      mode = item;
    }
  });
  
  return mode;
}
