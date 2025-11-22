import { useState, useCallback, useMemo } from 'react';

export type ValidationRule<T = unknown> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
  custom?: (value: T) => string | null;
  equalTo?: string;
  notEqualTo?: string;
  arrayMinLength?: number;
  arrayMaxLength?: number;
  fileSize?: number;
  fileType?: string[];
};

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  firstError?: ValidationError;
}

export interface ValidationReturn<T> {
  errors: Record<keyof T, string>;
  isValid: boolean;
  hasErrors: boolean;
  validate: (data: T) => ValidationResult;
  validateField: (field: keyof T, value: T[keyof T], allData?: T) => string | null;
  clearErrors: () => void;
  clearFieldError: (field: keyof T) => void;
  setFieldError: (field: keyof T, error: string) => void;
  getFieldError: (field: keyof T) => string | undefined;
  isFieldValid: (field: keyof T) => boolean;
}

const validateValue = <T>(
  value: T,
  rules: ValidationRule<T>,
  fieldName: string,
  allData?: Record<string, unknown>
): string | null => {
  if (rules.required) {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`;
    }
    if (Array.isArray(value) && value.length === 0) {
      return `${fieldName} is required`;
    }
  }

  if (!rules.required && (value === null || value === undefined || value === '')) {
    return null;
  }

  if (typeof value === 'string') {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }
    
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      return `${fieldName} must be no more than ${rules.maxLength} characters`;
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      return `${fieldName} format is invalid`;
    }
    
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `${fieldName} must be a valid email address`;
      }
    }
    
    if (rules.url) {
      try {
        new URL(value);
      } catch {
        return `${fieldName} must be a valid URL`;
      }
    }
  }

  if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
    const numValue = typeof value === 'number' ? value : Number(value);
    
    if (rules.min !== undefined && numValue < rules.min) {
      return `${fieldName} must be at least ${rules.min}`;
    }
    
    if (rules.max !== undefined && numValue > rules.max) {
      return `${fieldName} must be no more than ${rules.max}`;
    }
    
    if (rules.integer && !Number.isInteger(numValue)) {
      return `${fieldName} must be an integer`;
    }
    
    if (rules.positive && numValue <= 0) {
      return `${fieldName} must be positive`;
    }
    
    if (rules.negative && numValue >= 0) {
      return `${fieldName} must be negative`;
    }
  }

  if (rules.numeric && typeof value === 'string') {
    if (isNaN(Number(value))) {
      return `${fieldName} must be a valid number`;
    }
  }

  if (Array.isArray(value)) {
    if (rules.arrayMinLength !== undefined && value.length < rules.arrayMinLength) {
      return `${fieldName} must have at least ${rules.arrayMinLength} items`;
    }
    
    if (rules.arrayMaxLength !== undefined && value.length > rules.arrayMaxLength) {
      return `${fieldName} must have no more than ${rules.arrayMaxLength} items`;
    }
  }

  if (value instanceof File) {
    if (rules.fileSize && value.size > rules.fileSize) {
      const sizeMB = (rules.fileSize / (1024 * 1024)).toFixed(1);
      return `${fieldName} must be smaller than ${sizeMB}MB`;
    }
    
    if (rules.fileType && rules.fileType.length > 0) {
      const extension = value.name.split('.').pop()?.toLowerCase();
      if (!extension || !rules.fileType.includes(extension)) {
        return `${fieldName} must be one of: ${rules.fileType.join(', ')}`;
      }
    }
  }

  if (allData && rules.equalTo) {
    const compareValue = allData[rules.equalTo];
    if (value !== compareValue) {
      return `${fieldName} must match ${rules.equalTo}`;
    }
  }
  
  if (allData && rules.notEqualTo) {
    const compareValue = allData[rules.notEqualTo];
    if (value === compareValue) {
      return `${fieldName} must not match ${rules.notEqualTo}`;
    }
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const useValidation = <T extends Record<string, unknown>>(
  schema: ValidationSchema<T>
): ValidationReturn<T> => {
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 || Object.values(errors).every(error => !error);
  }, [errors]);

  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => error && error.trim() !== '');
  }, [errors]);

  const validateField = useCallback(
    (field: keyof T, value: T[keyof T], allData?: T): string | null => {
      const rules = schema[field];
      if (!rules) return null;

      return validateValue(
        value,
        rules,
        String(field),
        allData as Record<string, unknown>
      );
    },
    [schema]
  );

  const validate = useCallback(
    (data: T): ValidationResult => {
      const validationErrors: ValidationError[] = [];
      const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>;

      Object.keys(schema).forEach(fieldKey => {
        const field = fieldKey as keyof T;
        const value = data[field];
        const error = validateField(field, value, data);
        
        if (error) {
          validationErrors.push({ field: String(field), message: error });
          newErrors[field] = error;
        } else {
          newErrors[field] = '';
        }
      });

      setErrors(newErrors);

      return {
        isValid: validationErrors.length === 0,
        errors: validationErrors,
        firstError: validationErrors[0],
      };
    },
    [schema, validateField]
  );

  const clearErrors = useCallback(() => {
    setErrors({} as Record<keyof T, string>);
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => ({
      ...prev,
      [field]: '',
    }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const getFieldError = useCallback((field: keyof T) => {
    return errors[field];
  }, [errors]);

  const isFieldValid = useCallback((field: keyof T) => {
    return !errors[field] || errors[field].trim() === '';
  }, [errors]);

  return {
    errors,
    isValid,
    hasErrors,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    setFieldError,
    getFieldError,
    isFieldValid,
  };
};

export const validationRules = {
  required: { required: true },
  email: { email: true, required: true },
  url: { url: true },
  phone: { 
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    minLength: 10,
    maxLength: 16,
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  strongPassword: {
    required: true,
    minLength: 12,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  zipCode: {
    pattern: /^\d{5}(-\d{4})?$/,
  },
  creditCard: {
    pattern: /^\d{13,19}$/,
  },
  positiveNumber: {
    numeric: true,
    positive: true,
  },
  integer: {
    numeric: true,
    integer: true,
  },
  image: {
    fileType: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  document: {
    fileType: ['pdf', 'doc', 'docx', 'txt'],
    fileSize: 10 * 1024 * 1024, // 10MB
  },
};

export default useValidation;