import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';

export interface UseLocalStorageOptions<T> {
  defaultValue?: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  onError?: (error: Error) => void;
  syncAcrossTabs?: boolean;
  validateValue?: (value: unknown) => value is T;
  transformValue?: (value: T) => T;
  storageType?: 'localStorage' | 'sessionStorage';
}

export interface StorageState<T> {
  value: T;
  isLoading: boolean;
  error: Error | null;
  isAvailable: boolean;
  lastUpdated: Date | null;
  size: number;
}

export const useLocalStorage = <T>(
  key: string,
  options: UseLocalStorageOptions<T> = {}
) => {
  const {
    defaultValue,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError,
    syncAcrossTabs = false,
    validateValue,
    transformValue,
    storageType = 'localStorage',
  } = options;

  const storage = typeof window !== 'undefined' ? 
    (storageType === 'localStorage' ? window.localStorage : window.sessionStorage) : 
    null;

  // Check if storage is available
  const isStorageAvailable = useMemo(() => {
    if (!storage) return false;
    
    try {
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }, [storage]);

  // Initialize state
  const [state, setState] = useState<StorageState<T>>(() => {
    if (!isStorageAvailable || defaultValue === undefined) {
      return {
        value: defaultValue as T,
        isLoading: false,
        error: null,
        isAvailable: isStorageAvailable,
        lastUpdated: null,
        size: 0,
      };
    }

    try {
      const item = storage!.getItem(key);
      if (item === null) {
        return {
          value: defaultValue,
          isLoading: false,
          error: null,
          isAvailable: isStorageAvailable,
          lastUpdated: null,
          size: 0,
        };
      }

      const parsedValue = deserialize(item);
      const validatedValue = validateValue ? 
        (validateValue(parsedValue) ? parsedValue : defaultValue) : 
        parsedValue;
      const finalValue = transformValue ? transformValue(validatedValue) : validatedValue;

      return {
        value: finalValue,
        isLoading: false,
        error: null,
        isAvailable: isStorageAvailable,
        lastUpdated: new Date(),
        size: item.length,
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      if (onError) onError(errorObj);
      
      return {
        value: defaultValue as T,
        isLoading: false,
        error: errorObj,
        isAvailable: isStorageAvailable,
        lastUpdated: null,
        size: 0,
      };
    }
  });

  // Update storage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    if (!isStorageAvailable) {
      const error = new Error('Storage is not available');
      setState(prev => ({ ...prev, error }));
      if (onError) onError(error);
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const newValue = typeof value === 'function' 
        ? (value as (prev: T) => T)(state.value)
        : value;

      const processedValue = transformValue ? transformValue(newValue) : newValue;
      
      if (validateValue && !validateValue(processedValue)) {
        throw new Error(`Invalid value for key "${key}"`);
      }

      const serializedValue = serialize(processedValue);
      storage!.setItem(key, serializedValue);

      setState({
        value: processedValue,
        isLoading: false,
        error: null,
        isAvailable: isStorageAvailable,
        lastUpdated: new Date(),
        size: serializedValue.length,
      });

      // Dispatch custom event for cross-tab sync
      if (syncAcrossTabs && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(`storage-${key}`, {
          detail: { value: processedValue, timestamp: Date.now() }
        }));
      }

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorObj 
      }));
      if (onError) onError(errorObj);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageAvailable, state.value, serialize, validateValue, transformValue, key, syncAcrossTabs, onError]);

  // Remove from storage
  const removeValue = useCallback(() => {
    if (!isStorageAvailable) {
      const error = new Error('Storage is not available');
      setState(prev => ({ ...prev, error }));
      if (onError) onError(error);
      return;
    }

    try {
      storage!.removeItem(key);
      setState({
        value: defaultValue as T,
        isLoading: false,
        error: null,
        isAvailable: isStorageAvailable,
        lastUpdated: new Date(),
        size: 0,
      });

      // Dispatch custom event for cross-tab sync
      if (syncAcrossTabs && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(`storage-${key}`, {
          detail: { value: null, timestamp: Date.now() }
        }));
      }

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, error: errorObj }));
      if (onError) onError(errorObj);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageAvailable, defaultValue, key, syncAcrossTabs, onError]);

  // Clear all storage
  const clearStorage = useCallback(() => {
    if (!isStorageAvailable) {
      const error = new Error('Storage is not available');
      setState(prev => ({ ...prev, error }));
      if (onError) onError(error);
      return;
    }

    try {
      storage!.clear();
      setState({
        value: defaultValue as T,
        isLoading: false,
        error: null,
        isAvailable: isStorageAvailable,
        lastUpdated: new Date(),
        size: 0,
      });
      toast.success('Storage cleared successfully');
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, error: errorObj }));
      if (onError) onError(errorObj);
      toast.error('Failed to clear storage');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageAvailable, defaultValue, onError]);

  // Get storage size info
  const getStorageInfo = useCallback(() => {
    if (!isStorageAvailable) return null;

    try {
      const keys = Object.keys(storage!);
      let totalSize = 0;
      const items: Array<{ key: string; size: number; value: unknown }> = [];

      keys.forEach(storageKey => {
        const value = storage!.getItem(storageKey);
        if (value !== null) {
          const size = value.length;
          totalSize += size;
          try {
            items.push({
              key: storageKey,
              size,
              value: deserialize(value),
            });
          } catch {
            items.push({
              key: storageKey,
              size,
              value: value,
            });
          }
        }
      });

      return {
        totalItems: keys.length,
        totalSize,
        items: items.sort((a, b) => b.size - a.size),
        quota: isStorageAvailable ? getStorageQuota() : 0,
      };
    } catch (error) {
      if (onError) onError(error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageAvailable, deserialize, onError]);

  // Get storage quota
  const getStorageQuota = useCallback(() => {
    if (!isStorageAvailable) return 0;

    try {
      // Test storage quota by attempting to store data
      let size = 1024 * 1024; // Start with 1MB
      const testKey = '__quota_test__';
      
      while (size < 50 * 1024 * 1024) { // Test up to 50MB
        try {
          const testData = 'x'.repeat(size);
          storage!.setItem(testKey, testData);
          storage!.removeItem(testKey);
          size *= 2;
        } catch {
          break;
        }
      }
      
      return Math.floor(size / 2);
    } catch {
      return 0;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageAvailable]);

  // Check if key exists
  const hasKey = useCallback((checkKey?: string) => {
    if (!isStorageAvailable) return false;
    const keyToCheck = checkKey || key;
    return storage!.getItem(keyToCheck) !== null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageAvailable, key]);

  // Get all keys
  const getAllKeys = useCallback(() => {
    if (!isStorageAvailable) return [];
    return Object.keys(storage!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageAvailable]);

  // Backup storage data
  const backup = useCallback((keys?: string[]) => {
    if (!isStorageAvailable) return null;

    try {
      const keysToBackup = keys || getAllKeys();
      const backup: Record<string, string | null> = {};

      keysToBackup.forEach(backupKey => {
        backup[backupKey] = storage!.getItem(backupKey);
      });

      return {
        timestamp: new Date().toISOString(),
        data: backup,
        keys: keysToBackup,
        storageType,
      };
    } catch (error) {
      if (onError) onError(error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageAvailable, getAllKeys, storageType, onError]);

  // Restore from backup
  const restore = useCallback((backupData: ReturnType<typeof backup>) => {
    if (!isStorageAvailable || !backupData) {
      const error = new Error('Cannot restore: storage not available or invalid backup');
      if (onError) onError(error);
      return false;
    }

    try {
      Object.entries(backupData.data).forEach(([backupKey, value]) => {
        if (value !== null) {
          storage!.setItem(backupKey, value);
        }
      });

      // Refresh current value if it was in the backup
      if (backupData.keys.includes(key)) {
        const restoredItem = storage!.getItem(key);
        if (restoredItem !== null) {
          const parsedValue = deserialize(restoredItem);
          const validatedValue = validateValue ? 
            (validateValue(parsedValue) ? parsedValue : defaultValue) : 
            parsedValue;
          const finalValue = transformValue ? transformValue(validatedValue) : validatedValue;

          setState({
            value: finalValue as T,
            isLoading: false,
            error: null,
            isAvailable: isStorageAvailable,
            lastUpdated: new Date(),
            size: restoredItem.length,
          });
        }
      }

      toast.success('Storage restored successfully');
      return true;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      if (onError) onError(errorObj);
      toast.error('Failed to restore storage');
      return false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageAvailable, key, deserialize, validateValue, transformValue, defaultValue, onError]);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    if (!syncAcrossTabs || !isStorageAvailable) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const parsedValue = deserialize(e.newValue);
          const validatedValue = validateValue ? 
            (validateValue(parsedValue) ? parsedValue : defaultValue) : 
            parsedValue;
          const finalValue = transformValue ? transformValue(validatedValue) : validatedValue;

          setState({
            value: finalValue as T,
            isLoading: false,
            error: null,
            isAvailable: isStorageAvailable,
            lastUpdated: new Date(),
            size: e.newValue.length,
          });
        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          setState(prev => ({ ...prev, error: errorObj }));
          if (onError) onError(errorObj);
        }
      } else if (e.key === key && e.newValue === null) {
        // Key was removed
        setState({
          value: defaultValue as T,
          isLoading: false,
          error: null,
          isAvailable: isStorageAvailable,
          lastUpdated: new Date(),
          size: 0,
        });
      }
    };

    const handleCustomStorageEvent = (e: CustomEvent) => {
      if (e.detail.value === null) {
        setState({
          value: defaultValue as T,
          isLoading: false,
          error: null,
          isAvailable: isStorageAvailable,
          lastUpdated: new Date(),
          size: 0,
        });
      } else {
        const validatedValue = validateValue ? 
          (validateValue(e.detail.value) ? e.detail.value : defaultValue) : 
          e.detail.value;
        const finalValue = transformValue ? transformValue(validatedValue) : validatedValue;

        setState({
          value: finalValue as T,
          isLoading: false,
          error: null,
          isAvailable: isStorageAvailable,
          lastUpdated: new Date(e.detail.timestamp),
          size: serialize(finalValue).length,
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(`storage-${key}`, handleCustomStorageEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(`storage-${key}`, handleCustomStorageEvent as EventListener);
    };
  }, [syncAcrossTabs, isStorageAvailable, key, deserialize, validateValue, transformValue, defaultValue, serialize, onError]);

  // Computed values
  const computedValues = useMemo(() => {
    const isDefault = state.value === defaultValue;
    const hasValue = state.value !== null && state.value !== undefined;
    
    return {
      isDefault,
      hasValue,
      isEmpty: !hasValue,
      sizeInKB: Math.round(state.size / 1024 * 100) / 100,
      sizeInMB: Math.round(state.size / (1024 * 1024) * 100) / 100,
    };
  }, [state.value, state.size, defaultValue]);

  return {
    // Primary value and state
    value: state.value,
    setValue,
    
    // State information
    isLoading: state.isLoading,
    error: state.error,
    isAvailable: state.isAvailable,
    lastUpdated: state.lastUpdated,
    size: state.size,
    
    // Computed values
    ...computedValues,
    
    // Storage operations
    remove: removeValue,
    clear: clearStorage,
    
    // Utility functions
    hasKey,
    getAllKeys,
    getStorageInfo,
    getStorageQuota,
    
    // Backup and restore
    backup,
    restore,
    
    // Key management
    key,
    storageType,
    
    // Validation helpers
    isValidValue: (value: unknown): value is T => 
      validateValue ? validateValue(value) : true,
  };
};

export default useLocalStorage;