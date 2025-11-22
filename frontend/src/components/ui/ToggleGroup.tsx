'use client';

import React, { useState, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// ToggleGroup variants
const toggleGroupVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-muted p-1',
        outline: 'border border-input bg-background',
        ghost: 'bg-transparent',
      },
      size: {
        default: 'h-10',
        sm: 'h-9',
        lg: 'h-11',
      },
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col h-auto w-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      orientation: 'horizontal',
    },
  }
);

const toggleGroupItemVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm',
        outline: 'border border-transparent data-[state=on]:border-input data-[state=on]:bg-background data-[state=on]:shadow-sm',
        ghost: 'data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-3',
        sm: 'h-8 px-2',
        lg: 'h-10 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Types
export interface ToggleGroupContextType {
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  type: 'single' | 'multiple';
  disabled?: boolean;
  required?: boolean;
  variant?: VariantProps<typeof toggleGroupVariants>['variant'];
  size?: VariantProps<typeof toggleGroupVariants>['size'];
}

export interface ToggleGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof toggleGroupVariants> {
  type: 'single' | 'multiple';
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  disabled?: boolean;
  required?: boolean;
  ariaLabel?: string;
}

export interface ToggleGroupItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
  asChild?: boolean;
  icon?: React.ReactNode;
  showAnimation?: boolean;
}

// Context
const ToggleGroupContext = createContext<ToggleGroupContextType | null>(null);

const useToggleGroupContext = () => {
  const context = useContext(ToggleGroupContext);
  if (!context) {
    throw new Error('ToggleGroup.Item must be used within ToggleGroup');
  }
  return context;
};

// Main ToggleGroup component
export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({
    className,
    variant,
    size,
    orientation,
    type,
    value: controlledValue,
    defaultValue,
    onValueChange,
    disabled = false,
    required = false,
    ariaLabel,
    children,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState<string | string[]>(() => {
      if (defaultValue !== undefined) return defaultValue;
      return type === 'multiple' ? [] : '';
    });

    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const handleValueChange = React.useCallback((newValue: string | string[]) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    }, [controlledValue, onValueChange]);

    const contextValue: ToggleGroupContextType = {
      value,
      onValueChange: handleValueChange,
      type,
      disabled,
      required,
      variant,
      size,
    };

    return (
      <ToggleGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="group"
          aria-label={ariaLabel}
          {...(required && { 'aria-required': 'true' })}
          className={cn(toggleGroupVariants({ variant, size, orientation }), className)}
          {...props}
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  }
);

ToggleGroup.displayName = 'ToggleGroup';

// ToggleGroup Item
export const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({
    className,
    children,
    value: itemValue,
    disabled: itemDisabled,
    icon,
    showAnimation = true,
    ...props
  }, ref) => {
    const { 
      value, 
      onValueChange, 
      type, 
      disabled: groupDisabled, 
      variant, 
      size 
    } = useToggleGroupContext();

    const disabled = itemDisabled || groupDisabled;
    
    const isPressed = React.useMemo(() => {
      if (type === 'single') {
        return value === itemValue;
      }
      return Array.isArray(value) && value.includes(itemValue);
    }, [type, value, itemValue]);

    const handleClick = React.useCallback(() => {
      if (disabled) return;

      if (type === 'single') {
        onValueChange?.(itemValue);
      } else {
        const currentValue = Array.isArray(value) ? value : [];
        const newValue = isPressed
          ? currentValue.filter(v => v !== itemValue)
          : [...currentValue, itemValue];
        onValueChange?.(newValue);
      }
    }, [disabled, type, itemValue, value, isPressed, onValueChange]);

    return (
      <button
        ref={ref}
        type="button"
        role="button"
        {...(type === 'single' ? 
          { 'aria-checked': isPressed ? 'true' : 'false' } : 
          { 'aria-pressed': isPressed ? 'true' : 'false' }
        )}
        data-state={isPressed ? 'on' : 'off'}
        data-value={itemValue}
        className={cn(toggleGroupItemVariants({ variant, size }), className)}
        disabled={disabled}
        onClick={handleClick}
        {...props}
      >
        <div className="flex items-center gap-2">
          {/* Icon with animation */}
          {icon && (
            <motion.div
              animate={showAnimation && isPressed ? {
                scale: 1.1,
                rotate: 5,
              } : {
                scale: 1,
                rotate: 0,
              }}
              transition={{ duration: 0.15 }}
              className="flex items-center"
            >
              {icon}
            </motion.div>
          )}

          {/* Content */}
          <motion.span
            animate={showAnimation && isPressed ? {
              scale: 1.02,
            } : {
              scale: 1,
            }}
            transition={{ duration: 0.15 }}
          >
            {children}
          </motion.span>
        </div>
      </button>
    );
  }
);

ToggleGroupItem.displayName = 'ToggleGroupItem';

// Simple toggle group with predefined items
export interface SimpleToggleGroupProps extends Omit<ToggleGroupProps, 'children'> {
  items: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
}

export const SimpleToggleGroup = React.forwardRef<HTMLDivElement, SimpleToggleGroupProps>(
  ({ items, ...props }, ref) => {
    return (
      <ToggleGroup ref={ref} {...props}>
        {items.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            icon={item.icon}
          >
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  }
);

SimpleToggleGroup.displayName = 'SimpleToggleGroup';

// Icon-only toggle group
export interface IconToggleGroupProps extends Omit<ToggleGroupProps, 'children'> {
  items: Array<{
    value: string;
    icon: React.ReactNode;
    label: string; // For accessibility
    disabled?: boolean;
  }>;
}

export const IconToggleGroup = React.forwardRef<HTMLDivElement, IconToggleGroupProps>(
  ({ items, ...props }, ref) => {
    return (
      <ToggleGroup ref={ref} {...props}>
        {items.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            icon={item.icon}
            aria-label={item.label}
            title={item.label}
          />
        ))}
      </ToggleGroup>
    );
  }
);

IconToggleGroup.displayName = 'IconToggleGroup';

// Segmented control style
export interface SegmentedControlProps extends ToggleGroupProps {
  items: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  showIndicator?: boolean;
}

export const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
  ({ 
    items, 
    showIndicator = true,
    variant = 'default',
    className,
    value,
    ...props 
  }, ref) => {
    const activeIndex = React.useMemo(() => {
      return items.findIndex(item => item.value === value);
    }, [items, value]);

    return (
      <div className="relative">
        <ToggleGroup
          ref={ref}
          variant={variant}
          value={value}
          className={cn('relative', className)}
          {...props}
        >
          {/* Animated indicator */}
          {showIndicator && activeIndex >= 0 && (
            <motion.div
              className={cn(
                'absolute inset-y-1 bg-background shadow-sm rounded-sm z-0',
                variant === 'default' && 'bg-background',
                variant === 'outline' && 'bg-background border border-input',
                variant === 'ghost' && 'bg-accent'
              )}
              initial={false}
              animate={{
                x: `${activeIndex * 100}%`,
                width: `${100 / items.length}%`,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}

          {items.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              icon={item.icon}
              className="relative z-10 flex-1"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    );
  }
);

SegmentedControl.displayName = 'SegmentedControl';

// Pills toggle group
export interface PillsToggleGroupProps extends ToggleGroupProps {
  items: Array<{
    value: string;
    label: string;
    count?: number;
    disabled?: boolean;
  }>;
  showCounts?: boolean;
}

export const PillsToggleGroup = React.forwardRef<HTMLDivElement, PillsToggleGroupProps>(
  ({ 
    items, 
    showCounts = false,
    variant = 'ghost',
    className,
    ...props 
  }, ref) => {
    return (
      <ToggleGroup
        ref={ref}
        variant={variant}
        className={cn('gap-2 bg-transparent p-0', className)}
        {...props}
      >
        {items.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(
              'rounded-full border border-input',
              'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary'
            )}
          >
            <div className="flex items-center gap-1">
              <span>{item.label}</span>
              {showCounts && item.count !== undefined && (
                <span className="text-xs bg-background/20 rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                  {item.count}
                </span>
              )}
            </div>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  }
);

PillsToggleGroup.displayName = 'PillsToggleGroup';

export default ToggleGroup;

