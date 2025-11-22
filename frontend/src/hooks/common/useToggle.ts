import { useState, useCallback } from 'react';

export interface ToggleReturn {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: (value: boolean) => void;
}

export const useToggle = (initialValue: boolean = false): ToggleReturn => {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  const setValueCallback = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue: setValueCallback,
  };
};

// Multi-toggle hook for managing multiple boolean states
export const useMultiToggle = <T extends string>(
  keys: T[],
  initialValues?: Partial<Record<T, boolean>>
) => {
  const [values, setValues] = useState<Record<T, boolean>>(() => {
    const initial = {} as Record<T, boolean>;
    keys.forEach(key => {
      initial[key] = initialValues?.[key] ?? false;
    });
    return initial;
  });

  const toggle = useCallback((key: T) => {
    setValues(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const setTrue = useCallback((key: T) => {
    setValues(prev => ({
      ...prev,
      [key]: true,
    }));
  }, []);

  const setFalse = useCallback((key: T) => {
    setValues(prev => ({
      ...prev,
      [key]: false,
    }));
  }, []);

  const setValue = useCallback((key: T, value: boolean) => {
    setValues(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const toggleAll = useCallback(() => {
    setValues(prev => {
      const newValues = {} as Record<T, boolean>;
      keys.forEach(key => {
        newValues[key] = !prev[key];
      });
      return newValues;
    });
  }, [keys]);

  const setAllTrue = useCallback(() => {
    setValues(() => {
      const newValues = {} as Record<T, boolean>;
      keys.forEach(key => {
        newValues[key] = true;
      });
      return newValues;
    });
  }, [keys]);

  const setAllFalse = useCallback(() => {
    setValues(() => {
      const newValues = {} as Record<T, boolean>;
      keys.forEach(key => {
        newValues[key] = false;
      });
      return newValues;
    });
  }, [keys]);

  const someTrue = Object.values(values).some(Boolean);
  const allTrue = Object.values(values).every(Boolean);
  const someSelected = someTrue && !allTrue;

  return {
    values,
    toggle,
    setTrue,
    setFalse,
    setValue,
    toggleAll,
    setAllTrue,
    setAllFalse,
    someTrue,
    allTrue,
    someSelected,
  };
};

// Toggle with timeout (auto-reset)
export const useTemporaryToggle = (
  timeout: number = 3000,
  initialValue: boolean = false
) => {
  const { value, toggle, setTrue, setFalse, setValue } = useToggle(initialValue);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const toggleWithTimeout = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    toggle();

    if (!value) { // Will become true after toggle
      const id = setTimeout(() => {
        setFalse();
        setTimeoutId(null);
      }, timeout);
      setTimeoutId(id);
    }
  }, [value, toggle, setFalse, timeout, timeoutId]);

  const setTrueWithTimeout = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setTrue();
    const id = setTimeout(() => {
      setFalse();
      setTimeoutId(null);
    }, timeout);
    setTimeoutId(id);
  }, [setTrue, setFalse, timeout, timeoutId]);

  const cancel = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  return {
    value,
    toggle: toggleWithTimeout,
    setTrue: setTrueWithTimeout,
    setFalse: () => {
      cancel();
      setFalse();
    },
    setValue,
    cancel,
    hasTimeout: timeoutId !== null,
  };
};

// Toggle with confirmation
export const useConfirmToggle = (
  confirmMessage?: string,
  initialValue: boolean = false
) => {
  const { value, toggle, setTrue, setFalse, setValue } = useToggle(initialValue);

  const toggleWithConfirm = useCallback(() => {
    if (value && confirmMessage) {
      if (window.confirm(confirmMessage)) {
        toggle();
      }
    } else {
      toggle();
    }
  }, [value, toggle, confirmMessage]);

  const setFalseWithConfirm = useCallback(() => {
    if (value && confirmMessage) {
      if (window.confirm(confirmMessage)) {
        setFalse();
      }
    } else {
      setFalse();
    }
  }, [value, setFalse, confirmMessage]);

  return {
    value,
    toggle: toggleWithConfirm,
    setTrue,
    setFalse: setFalseWithConfirm,
    setValue,
  };
};

// Boolean state machine
export type ToggleState = 'idle' | 'loading' | 'success' | 'error';

export const useAsyncToggle = (
  asyncFn?: (newValue: boolean) => Promise<void>
) => {
  const [value, setValue] = useState<boolean>(false);
  const [state, setState] = useState<ToggleState>('idle');
  const [error, setError] = useState<Error | null>(null);

  const toggle = useCallback(async () => {
    if (state === 'loading') return;

    const newValue = !value;
    setState('loading');
    setError(null);

    try {
      if (asyncFn) {
        await asyncFn(newValue);
      }
      setValue(newValue);
      setState('success');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Toggle failed');
      setError(error);
      setState('error');
    }
  }, [value, state, asyncFn]);

  const setTrue = useCallback(async () => {
    if (state === 'loading' || value) return;

    setState('loading');
    setError(null);

    try {
      if (asyncFn) {
        await asyncFn(true);
      }
      setValue(true);
      setState('success');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Set true failed');
      setError(error);
      setState('error');
    }
  }, [value, state, asyncFn]);

  const setFalse = useCallback(async () => {
    if (state === 'loading' || !value) return;

    setState('loading');
    setError(null);

    try {
      if (asyncFn) {
        await asyncFn(false);
      }
      setValue(false);
      setState('success');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Set false failed');
      setError(error);
      setState('error');
    }
  }, [value, state, asyncFn]);

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
  }, []);

  return {
    value,
    state,
    error,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    toggle,
    setTrue,
    setFalse,
    reset,
  };
};

export default useToggle;
