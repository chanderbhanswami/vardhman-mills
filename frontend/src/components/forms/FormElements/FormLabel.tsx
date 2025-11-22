/**
 * FormLabel Component
 * 
 * A comprehensive form label component with accessibility features, validation states,
 * tooltips, and various styling options.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { Tooltip } from '@/components/ui/Tooltip';

// Types
export interface FormLabelProps extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'prefix'> {
  /** Label text content */
  children: React.ReactNode;
  /** Associated form field ID */
  htmlFor?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is optional (shows optional text) */
  optional?: boolean;
  /** Validation state */
  state?: 'default' | 'error' | 'warning' | 'success';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Weight variant */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Whether to show an info icon with tooltip */
  info?: string;
  /** Custom tooltip content */
  tooltip?: React.ReactNode;
  /** Tooltip position */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Whether to animate state changes */
  animated?: boolean;
  /** Custom required indicator */
  requiredIndicator?: React.ReactNode;
  /** Custom optional indicator */
  optionalIndicator?: React.ReactNode;
  /** Additional suffix content */
  suffix?: React.ReactNode;
  /** Additional prefix content */
  prefix?: React.ReactNode;
  /** Whether the label should be visually hidden but accessible */
  visuallyHidden?: boolean;
  /** Whether to show validation state icon */
  showStateIcon?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Help text to display below label */
  helpText?: string;
  /** Whether the help text should be shown always or only on focus */
  helpTextVisibility?: 'always' | 'focus' | 'hover';
  /** Test ID for testing */
  'data-testid'?: string;
}

const FormLabel: React.FC<FormLabelProps> = ({
  children,
  htmlFor,
  required = false,
  optional = false,
  state = 'default',
  size = 'md',
  weight = 'medium',
  info,
  tooltip,
  animated = false,
  requiredIndicator,
  optionalIndicator,
  suffix,
  prefix,
  visuallyHidden = false,
  showStateIcon = false,
  className,
  helpText,
  helpTextVisibility = 'always',
  'data-testid': testId,
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Weight classes
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  // State classes
  const stateClasses = {
    default: 'text-gray-700 dark:text-gray-300',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    success: 'text-green-600 dark:text-green-400'
  };

  // State icons
  const getStateIcon = () => {
    switch (state) {
      case 'error':
        return ExclamationTriangleIcon;
      case 'warning':
        return ExclamationTriangleIcon;
      case 'success':
        return CheckCircleIcon;
      default:
        return null;
    }
  };

  const StateIcon = getStateIcon();

  // Animation variants
  const animationVariants = {
    initial: { opacity: 0, y: -2 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -2 }
  };

  // Required indicator
  const renderRequiredIndicator = () => {
    if (!required) return null;
    
    if (requiredIndicator) {
      return requiredIndicator;
    }

    return (
      <span 
        className="text-red-500 dark:text-red-400 ml-1" 
        aria-label="required"
        title="This field is required"
      >
        *
      </span>
    );
  };

  // Optional indicator
  const renderOptionalIndicator = () => {
    if (!optional || required) return null;
    
    if (optionalIndicator) {
      return optionalIndicator;
    }

    return (
      <span className="text-gray-500 dark:text-gray-400 ml-1 text-xs font-normal">
        (optional)
      </span>
    );
  };

  // Info/tooltip content
  const renderInfoIcon = () => {
    if (!info && !tooltip) return null;

    const iconElement = (
      <InformationCircleIcon 
        className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help ml-1" 
      />
    );

    if (info || tooltip) {
      return (
        <Tooltip content={info || tooltip}>
          {iconElement}
        </Tooltip>
      );
    }

    return iconElement;
  };

  // State icon
  const renderStateIcon = () => {
    if (!showStateIcon || !StateIcon) return null;

    return (
      <StateIcon 
        className={clsx(
          'h-4 w-4 ml-1',
          stateClasses[state]
        )} 
      />
    );
  };

  // Help text
  const renderHelpText = () => {
    if (!helpText) return null;

    const shouldShow = 
      helpTextVisibility === 'always' || 
      (helpTextVisibility === 'hover' && isHovered) || 
      (helpTextVisibility === 'focus' && isFocused);

    if (!shouldShow) return null;

    return (
      <div 
        className={clsx(
          'mt-1 text-xs text-gray-600 dark:text-gray-400',
          {
            'text-red-600 dark:text-red-400': state === 'error',
            'text-amber-600 dark:text-amber-400': state === 'warning',
            'text-green-600 dark:text-green-400': state === 'success'
          }
        )}
        id={htmlFor ? `${htmlFor}-help` : undefined}
      >
        {helpText}
      </div>
    );
  };

  // Base label classes
  const labelClasses = clsx(
    'block',
    sizeClasses[size],
    weightClasses[weight],
    stateClasses[state],
    {
      'sr-only': visuallyHidden,
    },
    className
  );

  // Label content
  const labelContent = (
    <div className="flex items-center">
      {prefix && <span className="mr-1">{prefix}</span>}
      <span className="flex-1">{children}</span>
      {renderRequiredIndicator()}
      {renderOptionalIndicator()}
      {renderInfoIcon()}
      {renderStateIcon()}
      {suffix && <span className="ml-1">{suffix}</span>}
    </div>
  );

  // Handle focus events for associated form field
  React.useEffect(() => {
    if (!htmlFor) return;

    const field = document.getElementById(htmlFor);
    if (!field) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    field.addEventListener('focus', handleFocus);
    field.addEventListener('blur', handleBlur);

    return () => {
      field.removeEventListener('focus', handleFocus);
      field.removeEventListener('blur', handleBlur);
    };
  }, [htmlFor]);

  if (animated) {
    return (
      <div>
        <motion.label
          className={labelClasses}
          htmlFor={htmlFor}
          variants={animationVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          data-testid={testId}
          style={props.style}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
        >
          {labelContent}
        </motion.label>
        {renderHelpText()}
      </div>
    );
  }

  return (
    <div>
      <label
        className={labelClasses}
        htmlFor={htmlFor}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid={testId}
        {...props}
      >
        {labelContent}
      </label>
      {renderHelpText()}
    </div>
  );
};

// Named exports for different variants
export const RequiredFormLabel: React.FC<Omit<FormLabelProps, 'required'>> = (props) => (
  <FormLabel {...props} required={true} />
);

export const OptionalFormLabel: React.FC<Omit<FormLabelProps, 'optional'>> = (props) => (
  <FormLabel {...props} optional={true} />
);

export const ErrorFormLabel: React.FC<Omit<FormLabelProps, 'state'>> = (props) => (
  <FormLabel {...props} state="error" />
);

export const SuccessFormLabel: React.FC<Omit<FormLabelProps, 'state'>> = (props) => (
  <FormLabel {...props} state="success" />
);

export const WarningFormLabel: React.FC<Omit<FormLabelProps, 'state'>> = (props) => (
  <FormLabel {...props} state="warning" />
);

export const InfoFormLabel: React.FC<FormLabelProps> = (props) => (
  <FormLabel {...props} showStateIcon={true} />
);

// Hook for label state management
export const useFormLabel = (fieldId: string) => {
  const [state, setState] = React.useState<'default' | 'error' | 'warning' | 'success'>('default');
  const [helpText, setHelpText] = React.useState<string>('');

  const setError = React.useCallback((message: string) => {
    setState('error');
    setHelpText(message);
  }, []);

  const setWarning = React.useCallback((message: string) => {
    setState('warning');
    setHelpText(message);
  }, []);

  const setSuccess = React.useCallback((message: string) => {
    setState('success');
    setHelpText(message);
  }, []);

  const clearState = React.useCallback(() => {
    setState('default');
    setHelpText('');
  }, []);

  return {
    state,
    helpText,
    setError,
    setWarning,
    setSuccess,
    clearState,
    labelProps: {
      htmlFor: fieldId,
      state,
      helpText
    }
  };
};

// Utility function to generate accessible label props
export const createLabelProps = (
  fieldId: string,
  options: Partial<FormLabelProps> = {}
): Partial<FormLabelProps> => ({
  htmlFor: fieldId,
  ...options
});

export default FormLabel;
