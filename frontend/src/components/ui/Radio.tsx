'use client';

import React, { createContext, useContext, useId, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Radio Group Context
interface RadioGroupContextType {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined);

const useRadioGroupContext = () => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('Radio components must be used within a RadioGroup');
  }
  return context;
};

// Radio variants
const radioVariants = cva(
  'aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-primary',
        success: 'border-green-500 text-green-500',
        warning: 'border-yellow-500 text-yellow-500',
        destructive: 'border-red-500 text-red-500'
      },
      size: {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

// Radio Group variants
const radioGroupVariants = cva(
  'grid gap-2',
  {
    variants: {
      orientation: {
        vertical: 'grid-cols-1',
        horizontal: 'grid-flow-col auto-cols-max gap-6'
      }
    },
    defaultVariants: {
      orientation: 'vertical'
    }
  }
);

// Radio Item Props
export interface RadioItemProps 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof radioVariants> {
  value: string;
  label?: string;
  description?: string;
  icon?: React.ReactNode;
  showIndicator?: boolean;
}

// Radio Item Component
export const RadioItem = forwardRef<HTMLInputElement, RadioItemProps>(
  ({ 
    className,
    value,
    label,
    description,
    icon,
    variant,
    size,
    showIndicator = true,
    disabled: itemDisabled,
    ...props 
  }, ref) => {
    const { name, value: groupValue, onValueChange, disabled: groupDisabled, required } = useRadioGroupContext();
    const id = useId();
    const isChecked = groupValue === value;
    const isDisabled = groupDisabled || itemDisabled;

    return (
      <div className="flex items-start space-x-3">
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="radio"
            id={id}
            name={name}
            value={value}
            checked={isChecked}
            onChange={() => onValueChange(value)}
            disabled={isDisabled}
            required={required}
            className="sr-only"
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              radioVariants({ variant, size }),
              'relative cursor-pointer flex items-center justify-center',
              isDisabled && 'cursor-not-allowed',
              className
            )}
          >
            {showIndicator && (
              <motion.div
                className="rounded-full bg-current"
                initial={false}
                animate={{
                  scale: isChecked ? 1 : 0,
                  opacity: isChecked ? 1 : 0
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                style={{
                  width: size === 'sm' ? '6px' : size === 'lg' ? '10px' : '8px',
                  height: size === 'sm' ? '6px' : size === 'lg' ? '10px' : '8px'
                }}
              />
            )}
          </label>
        </div>
        
        {(label || description || icon) && (
          <div className="flex-1 min-w-0">
            <label
              htmlFor={id}
              className={cn(
                'block text-sm font-medium leading-6 cursor-pointer',
                isDisabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <div className="flex items-center gap-2">
                {icon && <span className="flex-shrink-0">{icon}</span>}
                <span>{label}</span>
              </div>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </label>
          </div>
        )}
      </div>
    );
  }
);

RadioItem.displayName = 'RadioItem';

// Radio Group Props
export interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof radioGroupVariants> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

// Radio Group Component
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ 
    className,
    children,
    value,
    defaultValue,
    onValueChange,
    name: propName,
    disabled = false,
    required = false,
    orientation = 'vertical',
    ...props 
  }, ref) => {
    const generatedName = useId();
    const name = propName || generatedName;
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    
    const currentValue = value !== undefined ? value : internalValue;
    const handleValueChange = React.useCallback((newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    }, [value, onValueChange]);

    return (
      <RadioGroupContext.Provider
        value={{
          name,
          value: currentValue,
          onValueChange: handleValueChange,
          disabled,
          required
        }}
      >
        <div
          ref={ref}
          role="radiogroup"
          {...(required && { 'aria-required': 'true' })}
          {...(disabled && { 'aria-disabled': 'true' })}
          className={cn(radioGroupVariants({ orientation }), className)}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

// Card Radio Component
export interface CardRadioProps extends Omit<RadioItemProps, 'content'> {
  title?: string;
  content?: React.ReactNode;
  footer?: React.ReactNode;
}

export const CardRadio = forwardRef<HTMLInputElement, CardRadioProps>(
  ({ 
    className,
    value,
    title,
    content,
    footer,
    variant,
    size,
    disabled: itemDisabled,
    ...props 
  }, ref) => {
    const { name, value: groupValue, onValueChange, disabled: groupDisabled, required } = useRadioGroupContext();
    const id = useId();
    const isChecked = groupValue === value;
    const isDisabled = groupDisabled || itemDisabled;

    return (
      <div className="relative">
        <input
          ref={ref}
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={isChecked}
          onChange={() => onValueChange(value)}
          disabled={isDisabled}
          required={required}
          className="sr-only"
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            'relative block cursor-pointer rounded-lg border-2 p-4 transition-all',
            isChecked 
              ? 'border-primary bg-primary/5 ring-1 ring-primary' 
              : 'border-muted-foreground/20 hover:border-muted-foreground/40',
            isDisabled && 'cursor-not-allowed opacity-50',
            className
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h3 className="text-sm font-medium text-foreground mb-2">
                  {title}
                </h3>
              )}
              {content && (
                <div className="text-sm text-muted-foreground">
                  {content}
                </div>
              )}
              {footer && (
                <div className="mt-3 text-xs text-muted-foreground">
                  {footer}
                </div>
              )}
            </div>
            
            <div className={cn(radioVariants({ variant, size }), 'ml-3 flex-shrink-0')}>
              <motion.div
                className="rounded-full bg-current"
                initial={false}
                animate={{
                  scale: isChecked ? 1 : 0,
                  opacity: isChecked ? 1 : 0
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                style={{
                  width: size === 'sm' ? '6px' : size === 'lg' ? '10px' : '8px',
                  height: size === 'sm' ? '6px' : size === 'lg' ? '10px' : '8px'
                }}
              />
            </div>
          </div>
        </label>
      </div>
    );
  }
);

CardRadio.displayName = 'CardRadio';

// Button Radio Component
export interface ButtonRadioProps extends RadioItemProps {
  fullWidth?: boolean;
}

export const ButtonRadio = forwardRef<HTMLInputElement, ButtonRadioProps>(
  ({ 
    className,
    value,
    label,
    icon,
    variant,
    size,
    fullWidth = false,
    disabled: itemDisabled,
    ...props 
  }, ref) => {
    const { name, value: groupValue, onValueChange, disabled: groupDisabled, required } = useRadioGroupContext();
    const itemVariant = variant || 'default';
    const id = useId();
    const isChecked = groupValue === value;
    const isDisabled = groupDisabled || itemDisabled;

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        <input
          ref={ref}
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={isChecked}
          onChange={() => onValueChange(value)}
          disabled={isDisabled}
          required={required}
          className="sr-only"
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-all cursor-pointer',
            isChecked
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
            isDisabled && 'cursor-not-allowed opacity-50',
            fullWidth && 'w-full',
            size === 'sm' && 'px-2 py-1 text-xs',
            itemVariant === 'success' && 'border-green-500 text-green-700',
            size === 'lg' && 'px-4 py-3 text-base',
            className
          )}
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {label && <span>{label}</span>}
        </label>
      </div>
    );
  }
);

ButtonRadio.displayName = 'ButtonRadio';

// Preset Radio Groups
export interface PresetRadioGroupProps extends RadioGroupProps {
  options: {
    value: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }[];
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
}

export const SimpleRadioGroup = forwardRef<HTMLDivElement, PresetRadioGroupProps>(
  ({ options, variant, size, ...props }, ref) => (
    <RadioGroup ref={ref} {...props}>
      {options.map((option) => (
        <RadioItem
          key={option.value}
          value={option.value}
          label={option.label}
          description={option.description}
          icon={option.icon}
          variant={variant}
          size={size}
          disabled={option.disabled}
        />
      ))}
    </RadioGroup>
  )
);

SimpleRadioGroup.displayName = 'SimpleRadioGroup';

export const CardRadioGroup = forwardRef<HTMLDivElement, PresetRadioGroupProps & {
  options: Array<{
    value: string;
    title: string;
    content?: React.ReactNode;
    footer?: React.ReactNode;
    disabled?: boolean;
  }>;
}>(
  ({ options, variant, size, ...props }, ref) => (
    <RadioGroup ref={ref} {...props}>
      {options.map((option) => (
        <CardRadio
          key={option.value}
          value={option.value}
          title={option.label}
          content={option.description}
          footer={undefined}
          variant={variant}
          size={size}
          disabled={option.disabled}
        />
      ))}
    </RadioGroup>
  )
);

CardRadioGroup.displayName = 'CardRadioGroup';

export const ButtonRadioGroup = forwardRef<HTMLDivElement, PresetRadioGroupProps & {
  fullWidth?: boolean;
}>(
  ({ options, variant, size, fullWidth, ...props }, ref) => (
    <RadioGroup ref={ref} {...props}>
      {options.map((option) => (
        <ButtonRadio
          key={option.value}
          value={option.value}
          label={option.label}
          icon={option.icon}
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          disabled={option.disabled}
        />
      ))}
    </RadioGroup>
  )
);

ButtonRadioGroup.displayName = 'ButtonRadioGroup';

export default RadioGroup;

