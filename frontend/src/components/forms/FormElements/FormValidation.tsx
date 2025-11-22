'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

// Enhanced validation types and interfaces
export type ValidationRule = {
  name: string;
  test: (value: unknown, context?: Record<string, unknown>) => boolean;
  message: string;
  severity?: 'error' | 'warning' | 'info';
  async?: boolean;
  asyncTest?: (value: unknown) => Promise<boolean>;
  dependencies?: string[];
  context?: Record<string, unknown>;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  infos: ValidationInfo[];
  score?: number;
  suggestions?: string[];
};

export type ValidationError = {
  rule: string;
  message: string;
  field?: string;
  path?: string;
  severity: 'error';
};

export type ValidationWarning = {
  rule: string;
  message: string;
  field?: string;
  path?: string;
  severity: 'warning';
};

export type ValidationInfo = {
  rule: string;
  message: string;
  field?: string;
  path?: string;
  severity: 'info';
};

export type ValidationSchema = {
  [fieldName: string]: ValidationRule[];
};

export type ValidatorConfig = {
  debounceMs?: number;
  showValidation?: 'always' | 'onBlur' | 'onSubmit' | 'onChange';
  showStrength?: boolean;
  showSuggestions?: boolean;
  realTimeValidation?: boolean;
  asyncValidation?: boolean;
  groupValidation?: boolean;
  crossFieldValidation?: boolean;
  customRules?: ValidationRule[];
  locale?: string;
  theme?: 'default' | 'minimal' | 'detailed';
};

export interface FormValidationProps {
  schema: ValidationSchema;
  values: Record<string, unknown>;
  errors?: Record<string, string[]>;
  touched?: Record<string, boolean>;
  config?: ValidatorConfig;
  onValidationChange?: (results: Record<string, ValidationResult>) => void;
  onValidationComplete?: (isValid: boolean, results: Record<string, ValidationResult>) => void;
  className?: string;
  showFieldValidation?: boolean;
  showSummary?: boolean;
  showProgress?: boolean;
  children?: React.ReactNode;
}

// Built-in validation rules
export const ValidationRules = {
  // Basic validation rules
  required: (message = 'This field is required'): ValidationRule => ({
    name: 'required',
    test: (value) => value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0),
    message,
    severity: 'error'
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    name: 'minLength',
    test: (value) => !value || value.toString().length >= min,
    message: message || `Must be at least ${min} characters`,
    severity: 'error'
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    name: 'maxLength',
    test: (value) => !value || value.toString().length <= max,
    message: message || `Must be no more than ${max} characters`,
    severity: 'error'
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    name: 'pattern',
    test: (value) => !value || regex.test(value.toString()),
    message,
    severity: 'error'
  }),

  // Email validation with comprehensive checks
  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    name: 'email',
    test: (value) => {
      if (!value || typeof value !== 'string') return true;
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      return emailRegex.test(value);
    },
    message,
    severity: 'error'
  }),

  // Phone validation
  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    name: 'phone',
    test: (value) => {
      if (!value || typeof value !== 'string') return true;
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
    },
    message,
    severity: 'error'
  }),

  // URL validation
  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    name: 'url',
    test: (value) => {
      if (!value || typeof value !== 'string') return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
    severity: 'error'
  }),

  // Number validation
  number: (message = 'Must be a valid number'): ValidationRule => ({
    name: 'number',
    test: (value) => !value || !isNaN(Number(value)),
    message,
    severity: 'error'
  }),

  min: (minimum: number, message?: string): ValidationRule => ({
    name: 'min',
    test: (value) => !value || Number(value) >= minimum,
    message: message || `Must be at least ${minimum}`,
    severity: 'error'
  }),

  max: (maximum: number, message?: string): ValidationRule => ({
    name: 'max',
    test: (value) => !value || Number(value) <= maximum,
    message: message || `Must be no more than ${maximum}`,
    severity: 'error'
  }),

  // Date validation
  date: (message = 'Please enter a valid date'): ValidationRule => ({
    name: 'date',
    test: (value) => {
      if (!value) return true;
      const date = new Date(value as string | number | Date);
      return !isNaN(date.getTime());
    },
    message,
    severity: 'error'
  }),

  minDate: (minDate: Date, message?: string): ValidationRule => ({
    name: 'minDate',
    test: (value) => {
      if (!value) return true;
      const date = new Date(value as string | number | Date);
      return date >= minDate;
    },
    message: message || `Date must be after ${minDate.toLocaleDateString()}`,
    severity: 'error'
  }),

  maxDate: (maxDate: Date, message?: string): ValidationRule => ({
    name: 'maxDate',
    test: (value) => {
      if (!value) return true;
      const date = new Date(value as string | number | Date);
      return date <= maxDate;
    },
    message: message || `Date must be before ${maxDate.toLocaleDateString()}`,
    severity: 'error'
  }),

  // Password strength validation
  passwordStrength: (options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  }): ValidationRule => {
    const opts = {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      ...options
    };

    return {
      name: 'passwordStrength',
      test: (value) => {
        if (!value || typeof value !== 'string') return true;
        
        const hasMinLength = value.length >= opts.minLength;
        const hasUppercase = !opts.requireUppercase || /[A-Z]/.test(value);
        const hasLowercase = !opts.requireLowercase || /[a-z]/.test(value);
        const hasNumbers = !opts.requireNumbers || /\d/.test(value);
        const hasSpecialChars = !opts.requireSpecialChars || /[!@#$%^&*(),.?":{}|<>]/.test(value);

        return hasMinLength && hasUppercase && hasLowercase && hasNumbers && hasSpecialChars;
      },
      message: 'Password must meet strength requirements',
      severity: 'error'
    };
  },

  // Cross-field validation
  confirmPassword: (passwordField: string, message = 'Passwords do not match'): ValidationRule => ({
    name: 'confirmPassword',
    test: (value: unknown, context?: Record<string, unknown>) => {
      if (!value || !context) return true;
      return value === context[passwordField];
    },
    message,
    severity: 'error',
    dependencies: [passwordField]
  }),

  // Custom async validation
  asyncUnique: (checkFunction: (value: unknown) => Promise<boolean>, message = 'Value must be unique'): ValidationRule => ({
    name: 'asyncUnique',
    test: () => true, // Placeholder for sync test
    asyncTest: checkFunction,
    message,
    severity: 'error',
    async: true
  })
};

// Password strength calculator
const calculatePasswordStrength = (password: string): { score: number; suggestions: string[] } => {
  if (!password) return { score: 0, suggestions: ['Enter a password'] };

  let score = 0;
  const suggestions: string[] = [];

  // Length check
  if (password.length >= 8) score += 25;
  else suggestions.push('Use at least 8 characters');

  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  else suggestions.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 15;
  else suggestions.push('Include uppercase letters');

  if (/\d/.test(password)) score += 15;
  else suggestions.push('Include numbers');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
  else suggestions.push('Include special characters');

  // Bonus points
  if (password.length >= 12) score += 10;
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) score += 5;

  return { score: Math.min(score, 100), suggestions };
};

// Main FormValidation component
const FormValidation: React.FC<FormValidationProps> = ({
  schema,
  values,
  errors = {},
  touched = {},
  config = {},
  onValidationChange,
  className,
  showFieldValidation = true,
  showSummary = true,
  showProgress = false,
  children
}) => {
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});
  const [passwordStrengths, setPasswordStrengths] = useState<Record<string, { score: number; suggestions: string[] }>>({});

  const {
    debounceMs = 300,
    showValidation = 'onChange',
    showStrength = false,
    showSuggestions = false,
    realTimeValidation = true,
    asyncValidation = true
  } = config;

  // Debounced validation function
  const validateField = useCallback(async (field: string, value: unknown, allValues: Record<string, unknown>) => {
    if (!schema[field]) return;

    setIsValidating(prev => ({ ...prev, [field]: true }));

    const fieldRules = schema[field];
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      infos: [],
      suggestions: []
    };

    for (const rule of fieldRules) {
      try {
        let isValid = true;

        // Sync validation
        if (rule.dependencies) {
          const context = rule.dependencies.reduce((acc, dep) => {
            acc[dep] = allValues[dep];
            return acc;
          }, {} as Record<string, unknown>);
          isValid = rule.test(value, { ...allValues, ...context });
        } else {
          isValid = rule.test(value);
        }

        // Async validation
        if (isValid && rule.async && rule.asyncTest && asyncValidation) {
          isValid = await rule.asyncTest(value);
        }

        if (!isValid) {
          const errorObj = {
            rule: rule.name,
            message: rule.message,
            field,
            severity: rule.severity || 'error'
          };

          switch (rule.severity) {
            case 'warning':
              result.warnings.push(errorObj as ValidationWarning);
              break;
            case 'info':
              result.infos.push(errorObj as ValidationInfo);
              break;
            default:
              result.errors.push(errorObj as ValidationError);
              result.isValid = false;
              break;
          }
        }
      } catch (error) {
        console.error(`Validation error for rule ${rule.name}:`, error);
        result.errors.push({
          rule: rule.name,
          message: 'Validation error occurred',
          field,
          severity: 'error'
        });
        result.isValid = false;
      }
    }

    // Calculate password strength if applicable
    if (field.toLowerCase().includes('password') && showStrength) {
      const strength = calculatePasswordStrength(value?.toString() || '');
      setPasswordStrengths(prev => ({ ...prev, [field]: strength }));
      result.score = strength.score;
      result.suggestions = strength.suggestions;
    }

    setValidationResults(prev => {
      const updated = { ...prev, [field]: result };
      onValidationChange?.(updated);
      return updated;
    });

    setIsValidating(prev => ({ ...prev, [field]: false }));
  }, [schema, showStrength, asyncValidation, onValidationChange]);

  const debouncedValidate = useMemo(
    () => debounce(validateField, debounceMs),
    [validateField, debounceMs]
  );

  // Effect for real-time validation
  useEffect(() => {
    if (realTimeValidation) {
      Object.entries(values).forEach(([field, value]) => {
        const shouldValidate = 
          touched[field] || 
          showValidation === 'always' || 
          (showValidation === 'onChange' && realTimeValidation);
        
        if (schema[field] && shouldValidate) {
          debouncedValidate(field, value, values);
        }
      });
    }
  }, [values, touched, realTimeValidation, showValidation, debouncedValidate, schema]);

  // Calculate overall validation progress
  const overallProgress = useMemo(() => {
    const totalFields = Object.keys(schema).length;
    if (totalFields === 0) return 100;

    const validFields = Object.values(validationResults).filter(result => result.isValid).length;
    return Math.round((validFields / totalFields) * 100);
  }, [schema, validationResults]);

  // Get field validation status
  const getFieldStatus = (field: string) => {
    const result = validationResults[field];
    const hasErrors = errors[field]?.length > 0 || result?.errors.length > 0;
    const hasWarnings = result?.warnings.length > 0;
    const isLoading = isValidating[field];

    return {
      isValid: result?.isValid !== false && !hasErrors,
      hasErrors,
      hasWarnings,
      isLoading,
      result
    };
  };

  // Render field validation indicator
  const renderFieldIndicator = (field: string) => {
    const status = getFieldStatus(field);
    
    if (!showFieldValidation) return null;

    return (
      <div className="flex items-center space-x-1">
        <AnimatePresence mode="wait">
          {status.isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-4 h-4"
            >
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
            </motion.div>
          ) : status.hasErrors ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <XCircleIcon className="w-4 h-4 text-red-500" />
            </motion.div>
          ) : status.hasWarnings ? (
            <motion.div
              key="warning"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
            </motion.div>
          ) : status.isValid ? (
            <motion.div
              key="valid"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  };

  // Render password strength meter
  const renderPasswordStrength = (field: string) => {
    const strength = passwordStrengths[field];
    if (!strength || !showStrength) return null;

    const getStrengthColor = (score: number) => {
      if (score < 25) return 'bg-red-500';
      if (score < 50) return 'bg-yellow-500';
      if (score < 75) return 'bg-blue-500';
      return 'bg-green-500';
    };

    const getStrengthLabel = (score: number) => {
      if (score < 25) return 'Weak';
      if (score < 50) return 'Fair';
      if (score < 75) return 'Good';
      return 'Strong';
    };

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-2 space-y-2"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Password Strength</span>
          <span className={clsx(
            'font-medium',
            {
              'text-red-600': strength.score < 25,
              'text-yellow-600': strength.score >= 25 && strength.score < 50,
              'text-blue-600': strength.score >= 50 && strength.score < 75,
              'text-green-600': strength.score >= 75
            }
          )}>
            {getStrengthLabel(strength.score)}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className={clsx('h-2 rounded-full transition-all duration-300', getStrengthColor(strength.score))}
            initial={{ width: 0 }}
            animate={{ width: `${strength.score}%` }}
          />
        </div>

        {showSuggestions && strength.suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            <div className="font-medium mb-1">Suggestions:</div>
            <ul className="list-disc list-inside space-y-1">
              {strength.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Render validation summary
  const renderValidationSummary = () => {
    if (!showSummary) return null;

    const totalErrors = Object.values(validationResults).reduce((sum, result) => sum + result.errors.length, 0);
    const totalWarnings = Object.values(validationResults).reduce((sum, result) => sum + result.warnings.length, 0);
    const totalFields = Object.keys(schema).length;
    const validFields = Object.values(validationResults).filter(result => result.isValid).length;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Validation Summary
          </h3>
          <div className="flex items-center space-x-2">
            {totalErrors > 0 && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                <XCircleIcon className="w-3 h-3 mr-1" />
                {totalErrors} Error{totalErrors !== 1 ? 's' : ''}
              </span>
            )}
            {totalWarnings > 0 && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                {totalWarnings} Warning{totalWarnings !== 1 ? 's' : ''}
              </span>
            )}
            {totalErrors === 0 && totalWarnings === 0 && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                <CheckCircleIcon className="w-3 h-3 mr-1" />
                All Valid
              </span>
            )}
          </div>
        </div>

        {showProgress && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium">{validFields}/{totalFields} fields valid</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 bg-green-500 rounded-full transition-all duration-300"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}

        {(totalErrors > 0 || totalWarnings > 0) && (
          <div className="space-y-2">
            {Object.entries(validationResults).map(([field, result]) => (
              <div key={field}>
                {result.errors.map((error, index) => (
                  <div key={`${field}-error-${index}`} className="flex items-center text-sm text-red-600 dark:text-red-400">
                    <XCircleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="font-medium mr-2">{field}:</span>
                    <span>{error.message}</span>
                  </div>
                ))}
                {result.warnings.map((warning, index) => (
                  <div key={`${field}-warning-${index}`} className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="font-medium mr-2">{field}:</span>
                    <span>{warning.message}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={clsx('form-validation', className)}>
      {renderValidationSummary()}
      
      <div className="space-y-4">
        {Object.keys(schema).map(field => (
          <div key={field} className="field-validation">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              {renderFieldIndicator(field)}
            </div>
            
            {renderPasswordStrength(field)}
            
            <AnimatePresence>
              {validationResults[field]?.errors.map((error, index) => (
                <motion.div
                  key={`${field}-error-${index}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center"
                >
                  <XCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                  {error.message}
                </motion.div>
              ))}
              
              {validationResults[field]?.warnings.map((warning, index) => (
                <motion.div
                  key={`${field}-warning-${index}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1 text-sm text-yellow-600 dark:text-yellow-400 flex items-center"
                >
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                  {warning.message}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {children}
    </div>
  );
};

// Export validation utilities
export {
  FormValidation,
  calculatePasswordStrength
};

export default FormValidation;
