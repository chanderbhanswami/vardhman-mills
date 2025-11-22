/**
 * FormField Component
 * 
 * A comprehensive wrapper component that combines form labels, inputs, errors, and help text
 * with full accessibility support and validation state management.
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import FormLabel, { FormLabelProps } from './FormLabel';
import FormError, { FormErrorProps } from './FormError';
import FormSuccess, { FormSuccessProps } from './FormSuccess';

// Types
export interface FormFieldProps {
  /** Unique field identifier */
  id: string;
  /** Field name for form submission */
  name?: string;
  /** Field label content */
  label?: React.ReactNode;
  /** Form input/control component */
  children: React.ReactNode;
  /** Error message(s) */
  error?: string | string[] | null;
  /** Success message(s) */
  success?: string | string[] | null;
  /** Help text */
  helpText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is optional */
  optional?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is readonly */
  readonly?: boolean;
  /** Field validation state */
  state?: 'default' | 'error' | 'warning' | 'success' | 'loading';
  /** Field size */
  size?: 'sm' | 'md' | 'lg';
  /** Layout variant */
  layout?: 'vertical' | 'horizontal' | 'inline';
  /** Label props override */
  labelProps?: Partial<FormLabelProps>;
  /** Error props override */
  errorProps?: Partial<FormErrorProps>;
  /** Success props override */
  successProps?: Partial<FormSuccessProps>;
  /** Custom CSS classes */
  className?: string;
  /** Container CSS classes */
  containerClassName?: string;
  /** Label container CSS classes */
  labelClassName?: string;
  /** Input container CSS classes */
  inputClassName?: string;
  /** Error container CSS classes */
  errorClassName?: string;
  /** Success container CSS classes */
  successClassName?: string;
  /** Help text CSS classes */
  helpClassName?: string;
  /** Whether to animate state changes */
  animated?: boolean;
  /** Whether to show field icons */
  showIcons?: boolean;
  /** Custom field description */
  description?: React.ReactNode;
  /** Field tooltip */
  tooltip?: React.ReactNode;
  /** Additional field actions */
  actions?: React.ReactNode;
  /** Field prefix content */
  prefix?: React.ReactNode;
  /** Field suffix content */
  suffix?: React.ReactNode;
  /** Whether to show character count (requires maxLength) */
  showCharacterCount?: boolean;
  /** Maximum character length */
  maxLength?: number;
  /** Current character count */
  characterCount?: number;
  /** Test ID for testing */
  'data-testid'?: string;
  /** ARIA attributes */
  'aria-describedby'?: string;
  /** Whether to stack on mobile */
  stackOnMobile?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  children,
  error,
  success,
  helpText,
  required = false,
  optional = false,
  disabled = false,
  readonly = false,
  state = 'default',
  size = 'md',
  layout = 'vertical',
  labelProps,
  errorProps,
  successProps,
  className,
  containerClassName,
  labelClassName,
  inputClassName,
  errorClassName,
  successClassName,
  helpClassName,
  animated = true,
  showIcons = true,
  description,
  tooltip,
  actions,
  prefix,
  suffix,
  showCharacterCount = false,
  maxLength,
  characterCount,
  'data-testid': testId,
  'aria-describedby': ariaDescribedBy,
  stackOnMobile = true,
  ...props
}) => {
  // Determine effective state based on props
  const effectiveState = React.useMemo(() => {
    if (error) return 'error';
    if (success) return 'success';
    return state;
  }, [error, success, state]);

  // Generate ARIA describedby attributes
  const generateAriaDescribedBy = React.useMemo(() => {
    const describedByIds: string[] = [];
    
    if (ariaDescribedBy) {
      describedByIds.push(ariaDescribedBy);
    }
    
    if (helpText) {
      describedByIds.push(`${id}-help`);
    }
    
    if (error) {
      describedByIds.push(`${id}-error`);
    }
    
    if (success) {
      describedByIds.push(`${id}-success`);
    }
    
    if (description) {
      describedByIds.push(`${id}-description`);
    }

    if (showCharacterCount && maxLength) {
      describedByIds.push(`${id}-char-count`);
    }
    
    return describedByIds.length > 0 ? describedByIds.join(' ') : undefined;
  }, [ariaDescribedBy, helpText, error, success, description, showCharacterCount, maxLength, id]);

  // Layout classes
  const layoutClasses = {
    vertical: 'space-y-1',
    horizontal: clsx(
      'grid grid-cols-1 gap-4 items-start',
      {
        'sm:grid-cols-3': size === 'sm',
        'sm:grid-cols-4': size === 'md',
        'sm:grid-cols-5': size === 'lg',
        'grid-cols-1': stackOnMobile
      }
    ),
    inline: 'flex items-center gap-3 flex-wrap'
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Container classes
  const containerClasses = clsx(
    'form-field',
    layoutClasses[layout],
    sizeClasses[size],
    {
      'opacity-50 cursor-not-allowed': disabled,
      'opacity-75': readonly
    },
    containerClassName
  );

  // Label container classes
  const labelContainerClasses = clsx(
    {
      'sm:col-span-1': layout === 'horizontal',
      'flex-shrink-0': layout === 'inline'
    },
    labelClassName
  );

  // Input container classes
  const inputContainerClasses = clsx(
    'space-y-1',
    {
      'sm:col-span-2': layout === 'horizontal' && size === 'sm',
      'sm:col-span-3': layout === 'horizontal' && size === 'md',
      'sm:col-span-4': layout === 'horizontal' && size === 'lg',
      'flex-1': layout === 'inline'
    },
    inputClassName
  );

  // Animation variants
  const animationVariants = {
    initial: { opacity: 0, y: -5 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -5 }
  };

  // Clone children with additional props
  const cloneChildrenWithProps = (child: React.ReactNode): React.ReactNode => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        id,
        name: name || id,
        disabled,
        readOnly: readonly,
        'aria-describedby': generateAriaDescribedBy,
        'aria-invalid': effectiveState === 'error' ? 'true' : 'false',
        'aria-required': required ? 'true' : 'false',
        'data-state': effectiveState,
        ...(child.props || {})
      } as React.HTMLAttributes<HTMLElement>);
    }
    return child;
  };

  // Render character count
  const renderCharacterCount = () => {
    if (!showCharacterCount || !maxLength) return null;

    const count = characterCount ?? 0;
    const percentage = (count / maxLength) * 100;
    const isNearLimit = percentage >= 80;
    const isOverLimit = count > maxLength;

    return (
      <div 
        id={`${id}-char-count`}
        className={clsx(
          'text-xs text-right mt-1',
          {
            'text-gray-500 dark:text-gray-400': !isNearLimit && !isOverLimit,
            'text-amber-600 dark:text-amber-400': isNearLimit && !isOverLimit,
            'text-red-600 dark:text-red-400': isOverLimit
          }
        )}
        aria-live="polite"
      >
        {count}/{maxLength}
      </div>
    );
  };

  // Render description
  const renderDescription = () => {
    if (!description) return null;

    return (
      <div 
        id={`${id}-description`}
        className={clsx(
          'text-xs text-gray-600 dark:text-gray-400 mt-1',
          helpClassName
        )}
      >
        {description}
      </div>
    );
  };

  // Render help text
  const renderHelpText = () => {
    if (!helpText) return null;

    return (
      <div 
        id={`${id}-help`}
        className={clsx(
          'text-xs text-gray-600 dark:text-gray-400 mt-1',
          helpClassName
        )}
      >
        {helpText}
      </div>
    );
  };

  // Render field actions
  const renderActions = () => {
    if (!actions) return null;

    return (
      <div className="flex items-center gap-2 mt-1">
        {actions}
      </div>
    );
  };

  // Render prefix/suffix wrapper
  const renderInputWithAffixes = () => {
    if (!prefix && !suffix) {
      return cloneChildrenWithProps(children);
    }

    return (
      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3 z-10 pointer-events-none">
            {prefix}
          </div>
        )}
        <div className="flex-1 w-full">
          {cloneChildrenWithProps(children)}
        </div>
        {suffix && (
          <div className="absolute right-3 z-10 pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
    );
  };

  // Main render
  const fieldContent = (
    <div 
      className={containerClasses}
      data-testid={testId}
      {...props}
    >
      {/* Label Section */}
      {label && (
        <div className={labelContainerClasses}>
          <FormLabel
            htmlFor={id}
            required={required}
            optional={optional}
            state={effectiveState === 'loading' ? 'default' : effectiveState}
            size={size}
            showStateIcon={showIcons}
            tooltip={tooltip}
            animated={animated}
            {...labelProps}
          >
            {label}
          </FormLabel>
        </div>
      )}

      {/* Input Section */}
      <div className={inputContainerClasses}>
        {/* Input with prefix/suffix */}
        {renderInputWithAffixes()}

        {/* Character count */}
        {renderCharacterCount()}

        {/* Description */}
        {renderDescription()}

        {/* Help text */}
        {renderHelpText()}

        {/* Success message */}
        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              key="success"
              initial={animated ? "initial" : undefined}
              animate={animated ? "animate" : undefined}
              exit={animated ? "exit" : undefined}
              variants={animationVariants}
              transition={{ duration: 0.2 }}
              className={successClassName}
            >
              <FormSuccess
                fieldName={id}
                message={success}
                animated={animated}
                {...successProps}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={animated ? "initial" : undefined}
              animate={animated ? "animate" : undefined}
              exit={animated ? "exit" : undefined}
              variants={animationVariants}
              transition={{ duration: 0.2 }}
              className={errorClassName}
            >
              <FormError
                fieldName={id}
                error={error}
                animated={animated}
                {...errorProps}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {renderActions()}
      </div>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        {fieldContent}
      </motion.div>
    );
  }

  return (
    <div className={className}>
      {fieldContent}
    </div>
  );
};

// Named exports for different layouts
export const VerticalFormField: React.FC<Omit<FormFieldProps, 'layout'>> = (props) => (
  <FormField {...props} layout="vertical" />
);

export const HorizontalFormField: React.FC<Omit<FormFieldProps, 'layout'>> = (props) => (
  <FormField {...props} layout="horizontal" />
);

export const InlineFormField: React.FC<Omit<FormFieldProps, 'layout'>> = (props) => (
  <FormField {...props} layout="inline" />
);

// Hook for form field state management
export const useFormField = (id: string) => {
  const [state, setState] = React.useState<'default' | 'error' | 'warning' | 'success' | 'loading'>('default');
  const [error, setError] = React.useState<string | string[] | null>(null);
  const [success, setSuccess] = React.useState<string | string[] | null>(null);
  const [helpText, setHelpText] = React.useState<string>('');
  const [characterCount, setCharacterCount] = React.useState<number>(0);

  const setFieldError = React.useCallback((errorMessage: string | string[] | null) => {
    setError(errorMessage);
    setSuccess(null);
    setState('error');
  }, []);

  const setFieldSuccess = React.useCallback((successMessage: string | string[] | null) => {
    setSuccess(successMessage);
    setError(null);
    setState('success');
  }, []);

  const setFieldWarning = React.useCallback((warningMessage: string) => {
    setHelpText(warningMessage);
    setState('warning');
  }, []);

  const setFieldLoading = React.useCallback(() => {
    setState('loading');
  }, []);

  const clearFieldState = React.useCallback(() => {
    setState('default');
    setError(null);
    setSuccess(null);
    setHelpText('');
  }, []);

  const updateCharacterCount = React.useCallback((count: number) => {
    setCharacterCount(count);
  }, []);

  return {
    state,
    error,
    success,
    helpText,
    characterCount,
    setFieldError,
    setFieldSuccess,
    setFieldWarning,
    setFieldLoading,
    clearFieldState,
    updateCharacterCount,
    fieldProps: {
      id,
      state,
      error,
      success,
      helpText,
      characterCount
    }
  };
};

// Utility function for form field validation
export const validateFormField = (
  value: unknown,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: unknown) => string | null;
  }
): string | null => {
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return 'This field is required';
  }

  if (value && typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum ${rules.minLength} characters required`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum ${rules.maxLength} characters allowed`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format';
    }
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export default FormField;
