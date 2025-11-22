'use client';

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, MinusIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Checkbox variants
const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600',
        destructive: 'border-gray-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600',
        success: 'border-gray-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600',
        warning: 'border-gray-300 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600',
      },
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Types
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
  indeterminate?: boolean;
  animated?: boolean;
  labelPlacement?: 'left' | 'right' | 'top' | 'bottom';
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
}

export interface CheckboxGroupProps {
  children: React.ReactNode;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: CheckboxProps['size'];
  variant?: CheckboxProps['variant'];
  disabled?: boolean;
  className?: string;
}

// Check Icon Component
const CheckIcon2: React.FC<{ size: NonNullable<CheckboxProps['size']> }> = ({ size }) => {
  const sizeMap = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
  };

  return <CheckIcon className={cn('text-white', sizeMap[size])} />;
};

// Minus Icon Component  
const MinusIcon2: React.FC<{ size: NonNullable<CheckboxProps['size']> }> = ({ size }) => {
  const sizeMap = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
  };

  return <MinusIcon className={cn('text-white', sizeMap[size])} />;
};

// Main Checkbox Component
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      label,
      description,
      indeterminate = false,
      animated = true,
      labelPlacement = 'right',
      error = false,
      errorMessage,
      helperText,
      checked,
      disabled,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(checked || false);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      
      const newChecked = e.target.checked;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      onChange?.(e);
    };

    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    const checkbox = (
      <div className="relative flex items-center">
        <input
          type="checkbox"
          ref={ref}
          id={checkboxId}
          className="sr-only"
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        <div
          className={cn(
            checkboxVariants({ variant, size }),
            'relative flex items-center justify-center transition-colors duration-200',
            isChecked && 'bg-current border-current',
            indeterminate && 'bg-current border-current',
            error && 'border-red-500',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
          onClick={() => {
            if (!disabled) {
              const event = {
                target: { checked: !isChecked }
              } as React.ChangeEvent<HTMLInputElement>;
              handleChange(event);
            }
          }}
        >
          <AnimatePresence mode="wait">
            {(isChecked || indeterminate) && (
              <motion.div
                key={indeterminate ? 'minus' : 'check'}
                initial={animated ? { scale: 0, opacity: 0 } : undefined}
                animate={animated ? { scale: 1, opacity: 1 } : undefined}
                exit={animated ? { scale: 0, opacity: 0 } : undefined}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                {indeterminate ? (
                  <MinusIcon2 size={size || 'md'} />
                ) : (
                  <CheckIcon2 size={size || 'md'} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );

    const labelElement = (label || description) && (
      <div className="flex flex-col">
        {label && (
          <label
            htmlFor={checkboxId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              error && 'text-red-700',
              disabled && 'cursor-not-allowed opacity-70'
            )}
          >
            {label}
          </label>
        )}
        {description && (
          <p className={cn(
            'text-xs text-gray-600 mt-1',
            error && 'text-red-600',
            disabled && 'opacity-70'
          )}>
            {description}
          </p>
        )}
      </div>
    );

    const errorElement = (error && errorMessage) && (
      <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
    );

    const helperElement = (!error && helperText) && (
      <p className="text-xs text-gray-600 mt-1">{helperText}</p>
    );

    // Layout based on label placement
    if (labelPlacement === 'left') {
      return (
        <div className="flex items-start space-x-3">
          {labelElement}
          <div>
            {checkbox}
            {errorElement}
            {helperElement}
          </div>
        </div>
      );
    }

    if (labelPlacement === 'top') {
      return (
        <div className="flex flex-col space-y-2">
          {labelElement}
          {checkbox}
          {errorElement}
          {helperElement}
        </div>
      );
    }

    if (labelPlacement === 'bottom') {
      return (
        <div className="flex flex-col space-y-2">
          {checkbox}
          {labelElement}
          {errorElement}
          {helperElement}
        </div>
      );
    }

    // Default: right placement
    return (
      <div className="flex items-start space-x-3">
        {checkbox}
        <div className="flex-1">
          {labelElement}
          {errorElement}
          {helperElement}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// Checkbox Group Component
export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      children,
      value,
      defaultValue,
      onChange,
      orientation = 'vertical',
      size,
      variant,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<string[]>(value || defaultValue || []);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleValueChange = (childValue: string, checked: boolean) => {
      const newValue = checked
        ? [...currentValue, childValue]
        : currentValue.filter(v => v !== childValue);

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-4',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
          className
        )}
        role="group"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement<CheckboxProps>(child) && child.type === Checkbox) {
            const childValue = String((child.props as CheckboxProps).value || (child.props as CheckboxProps).label || '');
            return React.cloneElement(child, {
              checked: currentValue.includes(childValue),
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                handleValueChange(childValue, e.target.checked);
                (child.props as CheckboxProps).onChange?.(e);
              },
              size: (child.props as CheckboxProps).size || size,
              variant: (child.props as CheckboxProps).variant || variant,
              disabled: (child.props as CheckboxProps).disabled || disabled,
            } as Partial<CheckboxProps>);
          }
          return child;
        })}
      </div>
    );
  }
);
CheckboxGroup.displayName = 'CheckboxGroup';

// Preset Components
export const CheckboxCard: React.FC<CheckboxProps & {
  title?: string;
  icon?: React.ReactNode;
}> = ({ title, icon, label, description, className, ...props }) => (
  <div className={cn(
    'border rounded-lg p-4 hover:bg-gray-50 transition-colors',
    'has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50',
    className
  )}>
    <Checkbox
      label={title || label}
      description={description}
      labelPlacement="right"
      className="w-full"
      {...props}
    />
    {icon && (
      <div className="mt-2 flex justify-center text-gray-600">
        {icon}
      </div>
    )}
  </div>
);

export const CheckAll: React.FC<{
  children: React.ReactNode;
  label?: string;
  size?: CheckboxProps['size'];
  variant?: CheckboxProps['variant'];
}> = ({ children, label = 'Select All', size, variant }) => {
  const [checkedItems, setCheckedItems] = React.useState<Set<string>>(new Set());
  const childrenArray = React.Children.toArray(children);
  const totalItems = childrenArray.length;
  const checkedCount = checkedItems.size;
  
  const isIndeterminate = checkedCount > 0 && checkedCount < totalItems;
  const isAllChecked = checkedCount === totalItems;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Check all items
      const allValues = new Set<string>();
      React.Children.forEach(children, (child, index) => {
        if (React.isValidElement(child) && child.type === Checkbox) {
          const childProps = child.props as CheckboxProps;
          const value = String(childProps.value || childProps.label || index);
          allValues.add(value);
        }
      });
      setCheckedItems(allValues);
    } else {
      // Uncheck all items
      setCheckedItems(new Set());
    }
  };

  const handleItemChange = (value: string, checked: boolean) => {
    const newCheckedItems = new Set(checkedItems);
    if (checked) {
      newCheckedItems.add(value);
    } else {
      newCheckedItems.delete(value);
    }
    setCheckedItems(newCheckedItems);
  };

  return (
    <div className="space-y-3">
      <Checkbox
        label={label}
        checked={isAllChecked}
        indeterminate={isIndeterminate}
        onChange={handleSelectAll}
        size={size}
        variant={variant}
      />
      <div className="pl-7 space-y-2">
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child) && child.type === Checkbox) {
            const childProps = child.props as CheckboxProps;
            const value = String(childProps.value || childProps.label || index);
            return React.cloneElement(child, {
              checked: checkedItems.has(value),
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                handleItemChange(value, e.target.checked);
                childProps.onChange?.(e);
              },
              size: childProps.size || size,
              variant: childProps.variant || variant,
            } as CheckboxProps);
          }
          return child;
        })}
      </div>
    </div>
  );
};

// Types are already exported inline with interfaces

// Default export
export default Checkbox;
