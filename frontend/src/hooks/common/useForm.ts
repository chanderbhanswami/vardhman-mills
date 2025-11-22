import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export interface ValidationRule<T = unknown> {
  required?: boolean | string;
  min?: number | string;
  max?: number | string;
  minLength?: number | string;
  maxLength?: number | string;
  pattern?: RegExp | string;
  validate?: (value: T) => boolean | string;
  asyncValidate?: (value: T) => Promise<boolean | string>;
}

export interface FieldConfig<T = unknown> {
  initialValue?: T;
  rules?: ValidationRule<T>;
  transform?: (value: unknown) => T;
  debounceMs?: number;
}

export interface FormConfig<T extends Record<string, unknown> = Record<string, unknown>> {
  initialValues?: Partial<T>;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit' | 'all';
  revalidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
  shouldUnregister?: boolean;
  delayError?: number;
  focusError?: boolean;
  enableToasts?: boolean;
}

export interface FormState<T extends Record<string, unknown> = Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
}

export interface FieldState {
  value: unknown;
  error?: string;
  touched: boolean;
  isDirty: boolean;
}

export interface FormReturn<T extends Record<string, unknown> = Record<string, unknown>> {
  // State
  formState: FormState<T>;
  
  // Field methods
  register: (name: keyof T, config?: FieldConfig) => {
    name: string;
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    error?: string;
  };
  
  setValue: (name: keyof T, value: unknown, options?: { shouldValidate?: boolean; shouldTouch?: boolean }) => void;
  getValue: (name: keyof T) => unknown;
  
  // Validation methods
  validateField: (name: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  clearError: (name: keyof T) => void;
  clearErrors: () => void;
  
  // Form methods
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
  reset: (values?: Partial<T>) => void;
  
  // Utility methods
  getFieldState: (name: keyof T) => FieldState;
  watch: (names?: (keyof T)[]) => Partial<T>;
}

const validateValue = async (value: unknown, rules: ValidationRule): Promise<string | null> => {
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return typeof rules.required === 'string' ? rules.required : 'This field is required';
  }

  if (value) {
    // Type validation
    if (typeof rules.min === 'number' && typeof value === 'number' && value < rules.min) {
      return `Value must be at least ${rules.min}`;
    }
    
    if (typeof rules.max === 'number' && typeof value === 'number' && value > rules.max) {
      return `Value must be at most ${rules.max}`;
    }
    
    if (typeof rules.minLength === 'number' && typeof value === 'string' && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }
    
    if (typeof rules.maxLength === 'number' && typeof value === 'string' && value.length > rules.maxLength) {
      return `Must be at most ${rules.maxLength} characters`;
    }
    
    if (rules.pattern) {
      const regex = typeof rules.pattern === 'string' ? new RegExp(rules.pattern) : rules.pattern;
      if (typeof value === 'string' && !regex.test(value)) {
        return 'Invalid format';
      }
    }
    
    // Custom validation
    if (rules.validate) {
      const result = rules.validate(value);
      if (typeof result === 'string') return result;
      if (result === false) return 'Invalid value';
    }
    
    // Async validation
    if (rules.asyncValidate) {
      const result = await rules.asyncValidate(value);
      if (typeof result === 'string') return result;
      if (result === false) return 'Invalid value';
    }
  }
  
  return null;
};

export const useForm = <T extends Record<string, unknown> = Record<string, unknown>>(
  config: FormConfig<T> = {}
): FormReturn<T> => {
  const {
    initialValues = {} as Partial<T>,
    validationMode = 'onChange',
    revalidateMode = 'onChange',
    enableToasts = false,
    focusError = true,
  } = config;

  const [formState, setFormState] = useState<FormState<T>>(() => ({
    values: { ...initialValues } as T,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValidating: false,
    isValid: true,
    isDirty: false,
    submitCount: 0,
  }));

  const fieldsConfigRef = useRef<Record<keyof T, FieldConfig>>(({} as Record<keyof T, FieldConfig>));
  const validationTimeoutsRef = useRef<Record<keyof T, NodeJS.Timeout>>({} as Record<keyof T, NodeJS.Timeout>);
  const initialValuesRef = useRef(initialValues);

  // Update form state helper
  const updateFormState = useCallback((updater: (prev: FormState<T>) => FormState<T>) => {
    setFormState(prev => {
      const newState = updater(prev);
      const hasErrors = Object.keys(newState.errors).length > 0;
      const isDirty = JSON.stringify(newState.values) !== JSON.stringify(initialValuesRef.current);
      
      return {
        ...newState,
        isValid: !hasErrors,
        isDirty,
      };
    });
  }, []);

  // Validate single field
  const validateField = useCallback(async (name: keyof T): Promise<boolean> => {
    const value = formState.values[name];
    const rules = fieldsConfigRef.current[name]?.rules;
    
    if (!rules) return true;
    
    updateFormState(prev => ({ ...prev, isValidating: true }));
    
    try {
      const error = await validateValue(value, rules);
      
      updateFormState(prev => ({
        ...prev,
        errors: error 
          ? { ...prev.errors, [name]: error }
          : { ...prev.errors, [name]: undefined },
        isValidating: false,
      }));
      
      return !error;
    } catch (err) {
      console.error('Validation error:', err);
      updateFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, [name]: 'Validation error' },
        isValidating: false,
      }));
      return false;
    }
  }, [formState.values, updateFormState]);

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    updateFormState(prev => ({ ...prev, isValidating: true }));
    
    const validationPromises = Object.keys(fieldsConfigRef.current).map(async (fieldName) => {
      const name = fieldName as keyof T;
      return { name, isValid: await validateField(name) };
    });
    
    const results = await Promise.all(validationPromises);
    const isValid = results.every(result => result.isValid);
    
    updateFormState(prev => ({ ...prev, isValidating: false }));
    
    return isValid;
  }, [validateField, updateFormState]);

  // Set field value
  const setValue = useCallback(
    (name: keyof T, value: unknown, options: { shouldValidate?: boolean; shouldTouch?: boolean } = {}) => {
      const { shouldValidate = validationMode === 'onChange', shouldTouch = true } = options;
      const fieldConfig = fieldsConfigRef.current[name];
      const transformedValue = fieldConfig?.transform ? fieldConfig.transform(value) : value;
      
      updateFormState(prev => ({
        ...prev,
        values: { ...prev.values, [name]: transformedValue },
        touched: shouldTouch ? { ...prev.touched, [name]: true } : prev.touched,
      }));
      
      if (shouldValidate) {
        // Debounced validation
        const debounceMs = fieldConfig?.debounceMs || 300;
        
        if (validationTimeoutsRef.current[name]) {
          clearTimeout(validationTimeoutsRef.current[name]);
        }
        
        validationTimeoutsRef.current[name] = setTimeout(() => {
          validateField(name);
        }, debounceMs);
      }
    },
    [validationMode, updateFormState, validateField]
  );

  // Get field value
  const getValue = useCallback((name: keyof T) => {
    return formState.values[name];
  }, [formState.values]);

  // Register field
  const register = useCallback(
    (name: keyof T, fieldConfig: FieldConfig = {}) => {
      fieldsConfigRef.current[name] = fieldConfig;
      
      // Set initial value if provided
      if (fieldConfig.initialValue !== undefined && formState.values[name] === undefined) {
        setValue(name, fieldConfig.initialValue, { shouldValidate: false, shouldTouch: false });
      }
      
      return {
        name: String(name),
        value: formState.values[name] || '',
        onChange: (value: unknown) => setValue(name, value),
        onBlur: () => {
          updateFormState(prev => ({ ...prev, touched: { ...prev.touched, [name]: true } }));
          if (validationMode === 'onBlur' || revalidateMode === 'onBlur') {
            validateField(name);
          }
        },
        error: formState.errors[name],
      };
    },
    [formState.values, formState.errors, setValue, updateFormState, validateField, validationMode, revalidateMode]
  );

  // Clear single error
  const clearError = useCallback((name: keyof T) => {
    updateFormState(prev => ({ ...prev, errors: { ...prev.errors, [name]: undefined } }));
  }, [updateFormState]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    updateFormState(prev => ({ ...prev, errors: {} }));
  }, [updateFormState]);

  // Handle form submission
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => {
      return async (e?: React.FormEvent) => {
        e?.preventDefault();
        
        updateFormState(prev => ({ ...prev, submitCount: prev.submitCount + 1, isSubmitting: true }));
        
        try {
          const isValid = await validateForm();
          
          if (isValid) {
            await onSubmit(formState.values);
            
            if (enableToasts) {
              toast.success('Form submitted successfully');
            }
          } else {
            if (enableToasts) {
              toast.error('Please fix the errors in the form');
            }
            
            // Focus first error field
            if (focusError) {
              const firstErrorField = Object.keys(formState.errors)[0];
              if (firstErrorField) {
                const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
                element?.focus();
              }
            }
          }
        } catch (error) {
          if (enableToasts) {
            toast.error(error instanceof Error ? error.message : 'Submission failed');
          }
        } finally {
          updateFormState(prev => ({ ...prev, isSubmitting: false }));
        }
      };
    },
    [formState.values, formState.errors, updateFormState, validateForm, enableToasts, focusError]
  );

  // Reset form
  const reset = useCallback((values?: Partial<T>) => {
    const resetValues = values || initialValuesRef.current;
    
    // Clear all validation timeouts
    Object.values(validationTimeoutsRef.current).forEach(timeout => {
      clearTimeout(timeout);
    });
    validationTimeoutsRef.current = {} as Record<keyof T, NodeJS.Timeout>;
    
    setFormState({
      values: { ...resetValues } as T,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValidating: false,
      isValid: true,
      isDirty: false,
      submitCount: 0,
    });
  }, []);

  // Get field state
  const getFieldState = useCallback((name: keyof T): FieldState => {
    return {
      value: formState.values[name],
      error: formState.errors[name],
      touched: Boolean(formState.touched[name]),
      isDirty: formState.values[name] !== initialValuesRef.current[name],
    };
  }, [formState]);

  // Watch specific fields
  const watch = useCallback((names?: (keyof T)[]): Partial<T> => {
    if (!names) return formState.values;
    
    const watched: Partial<T> = {};
    names.forEach(name => {
      watched[name] = formState.values[name];
    });
    
    return watched;
  }, [formState.values]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(validationTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return {
    formState,
    register,
    setValue,
    getValue,
    validateField,
    validateForm,
    clearError,
    clearErrors,
    handleSubmit,
    reset,
    getFieldState,
    watch,
  };
};

export default useForm;