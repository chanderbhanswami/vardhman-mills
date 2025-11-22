import { useState, useCallback, useEffect } from 'react';

export interface SessionStorageOptions {
  defaultValue?: string;
  serializer?: {
    stringify: (value: unknown) => string;
    parse: (value: string) => unknown;
  };
  syncAcrossTabs?: boolean;
  onError?: (error: Error) => void;
}

export interface SessionStorageReturn<T> {
  value: T | null;
  setValue: (value: T | ((prev: T | null) => T)) => void;
  removeValue: () => void;
  clearStorage: () => void;
  error: Error | null;
  loading: boolean;
}

const isServer = typeof window === 'undefined';

const defaultSerializer = {
  stringify: JSON.stringify,
  parse: JSON.parse,
};

export const useSessionStorage = <T = string>(
  key: string,
  options: SessionStorageOptions = {}
): SessionStorageReturn<T> => {
  const {
    defaultValue,
    serializer = defaultSerializer,
    syncAcrossTabs = false,
    onError,
  } = options;

  const [value, setValueState] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  // Read from sessionStorage
  const readValue = useCallback((): T | null => {
    if (isServer) {
      return defaultValue ? (defaultValue as unknown as T) : null;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      
      if (item === null) {
        return defaultValue ? (defaultValue as unknown as T) : null;
      }

      return serializer.parse(item) as T;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to read from sessionStorage');
      setError(err);
      onError?.(err);
      return defaultValue ? (defaultValue as unknown as T) : null;
    }
  }, [key, defaultValue, serializer, onError]);

  // Write to sessionStorage
  const writeValue = useCallback(
    (newValue: T) => {
      if (isServer) {
        console.warn('SessionStorage is not available on the server');
        return;
      }

      try {
        const serializedValue = serializer.stringify(newValue);
        window.sessionStorage.setItem(key, serializedValue);
        setValueState(newValue);
        setError(null);

        // Trigger custom event for cross-tab sync
        if (syncAcrossTabs) {
          window.dispatchEvent(
            new CustomEvent('session-storage-changed', {
              detail: { key, value: serializedValue },
            })
          );
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to write to sessionStorage');
        setError(err);
        onError?.(err);
      }
    },
    [key, serializer, onError, syncAcrossTabs]
  );

  // Remove from sessionStorage
  const removeValue = useCallback(() => {
    if (isServer) {
      console.warn('SessionStorage is not available on the server');
      return;
    }

    try {
      window.sessionStorage.removeItem(key);
      setValueState(null);
      setError(null);

      if (syncAcrossTabs) {
        window.dispatchEvent(
          new CustomEvent('session-storage-changed', {
            detail: { key, value: null },
          })
        );
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to remove from sessionStorage');
      setError(err);
      onError?.(err);
    }
  }, [key, onError, syncAcrossTabs]);

  // Clear entire sessionStorage
  const clearStorage = useCallback(() => {
    if (isServer) {
      console.warn('SessionStorage is not available on the server');
      return;
    }

    try {
      window.sessionStorage.clear();
      setValueState(null);
      setError(null);

      if (syncAcrossTabs) {
        window.dispatchEvent(
          new CustomEvent('session-storage-cleared', {
            detail: {},
          })
        );
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to clear sessionStorage');
      setError(err);
      onError?.(err);
    }
  }, [onError, syncAcrossTabs]);

  // Set value with support for function updates
  const setValue = useCallback(
    (newValue: T | ((prev: T | null) => T)) => {
      try {
        const valueToSet = typeof newValue === 'function' 
          ? (newValue as (prev: T | null) => T)(value)
          : newValue;
        
        writeValue(valueToSet);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to update value');
        setError(err);
        onError?.(err);
      }
    },
    [value, writeValue, onError]
  );

  // Initialize value on mount
  useEffect(() => {
    const initialValue = readValue();
    setValueState(initialValue);
    setLoading(false);
  }, [readValue]);

  // Handle storage events for cross-tab sync
  useEffect(() => {
    if (isServer || !syncAcrossTabs) return;

    const handleStorageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string; value: string | null }>;
      
      if (customEvent.detail?.key === key) {
        try {
          if (customEvent.detail.value === null) {
            setValueState(null);
          } else {
            const parsedValue = serializer.parse(customEvent.detail.value) as T;
            setValueState(parsedValue);
          }
          setError(null);
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Failed to sync sessionStorage value');
          setError(err);
          onError?.(err);
        }
      }
    };

    const handleStorageClear = () => {
      setValueState(null);
      setError(null);
    };

    window.addEventListener('session-storage-changed', handleStorageChange);
    window.addEventListener('session-storage-cleared', handleStorageClear);

    return () => {
      window.removeEventListener('session-storage-changed', handleStorageChange);
      window.removeEventListener('session-storage-cleared', handleStorageClear);
    };
  }, [key, serializer, onError, syncAcrossTabs]);

  // Handle native storage events (for same-origin tabs)
  useEffect(() => {
    if (isServer) return;

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.storageArea !== window.sessionStorage || event.key !== key) {
        return;
      }

      try {
        if (event.newValue === null) {
          setValueState(null);
        } else {
          const parsedValue = serializer.parse(event.newValue) as T;
          setValueState(parsedValue);
        }
        setError(null);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to handle storage event');
        setError(err);
        onError?.(err);
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [key, serializer, onError]);

  return {
    value,
    setValue,
    removeValue,
    clearStorage,
    error,
    loading,
  };
};

// Specialized hooks for common data types
export const useSessionStorageString = (
  key: string,
  defaultValue?: string,
  options?: Omit<SessionStorageOptions, 'defaultValue'>
) => {
  return useSessionStorage<string>(key, {
    ...options,
    defaultValue,
    serializer: {
      stringify: (value) => String(value),
      parse: (value) => value,
    },
  });
};

export const useSessionStorageNumber = (
  key: string,
  defaultValue?: number,
  options?: Omit<SessionStorageOptions, 'defaultValue' | 'serializer'>
) => {
  return useSessionStorage<number>(key, {
    ...options,
    defaultValue: defaultValue?.toString(),
    serializer: {
      stringify: (value) => String(value),
      parse: (value) => {
        const parsed = Number(value);
        if (isNaN(parsed)) {
          throw new Error(`Invalid number: ${value}`);
        }
        return parsed;
      },
    },
  });
};

export const useSessionStorageBoolean = (
  key: string,
  defaultValue?: boolean,
  options?: Omit<SessionStorageOptions, 'defaultValue' | 'serializer'>
) => {
  return useSessionStorage<boolean>(key, {
    ...options,
    defaultValue: defaultValue?.toString(),
    serializer: {
      stringify: (value) => String(value),
      parse: (value) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        throw new Error(`Invalid boolean: ${value}`);
      },
    },
  });
};

export const useSessionStorageObject = <T extends Record<string, unknown>>(
  key: string,
  defaultValue?: T,
  options?: Omit<SessionStorageOptions, 'defaultValue'>
) => {
  return useSessionStorage<T>(key, {
    ...options,
    defaultValue: defaultValue ? JSON.stringify(defaultValue) : undefined,
  });
};

// Utility for batch session storage operations
export const sessionStorageManager = {
  getMultiple: (keys: string[]) => {
    if (isServer) return {};
    
    return keys.reduce((acc, key) => {
      try {
        const value = window.sessionStorage.getItem(key);
        acc[key] = value ? JSON.parse(value) : null;
      } catch {
        acc[key] = null;
      }
      return acc;
    }, {} as Record<string, unknown>);
  },

  setMultiple: (items: Record<string, unknown>) => {
    if (isServer) return;
    
    Object.entries(items).forEach(([key, value]) => {
      try {
        window.sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to set sessionStorage key '${key}':`, error);
      }
    });
  },

  removeMultiple: (keys: string[]) => {
    if (isServer) return;
    
    keys.forEach(key => {
      try {
        window.sessionStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove sessionStorage key '${key}':`, error);
      }
    });
  },
};

export default useSessionStorage;
