'use client';

import React, { forwardRef, useState, useCallback, useId } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Switch variants
const switchVariants = cva(
  [
    'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50'
  ],
  {
    variants: {
      size: {
        sm: 'h-4 w-7',
        default: 'h-5 w-9',
        lg: 'h-6 w-11'
      },
      variant: {
        default: 'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        success: 'data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-input',
        warning: 'data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-input',
        destructive: 'data-[state=checked]:bg-destructive data-[state=unchecked]:bg-input'
      }
    },
    defaultVariants: {
      size: 'default',
      variant: 'default'
    }
  }
);

// Thumb variants
const thumbVariants = cva(
  [
    'pointer-events-none block rounded-full bg-background shadow-lg ring-0',
    'transition-transform data-[state=checked]:translate-x-full data-[state=unchecked]:translate-x-0'
  ],
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
);

// Base Switch Props
export interface SwitchProps 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof switchVariants> {
  label?: string;
  description?: string;
  error?: string;
  onCheckedChange?: (checked: boolean) => void;
  thumbIcon?: React.ReactNode;
  labelPosition?: 'left' | 'right';
}

// Switch Group Props
export interface SwitchGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  gap?: 'sm' | 'default' | 'lg';
}

// Base Switch Component
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ 
    className,
    size,
    variant,
    label,
    description,
    error,
    onCheckedChange,
    thumbIcon,
    labelPosition = 'right',
    checked,
    defaultChecked,
    disabled,
    id,
    onChange,
    ...props 
  }, ref) => {
    const generatedId = useId();
    const switchId = id || generatedId;
    const [isChecked, setIsChecked] = useState(checked ?? defaultChecked ?? false);

    const handleCheckedChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked;
      setIsChecked(newChecked);
      onCheckedChange?.(newChecked);
      onChange?.(event);
    }, [onCheckedChange, onChange]);

    const switchElement = (
      <div className="relative">
        <input
          type="checkbox"
          ref={ref}
          id={switchId}
          className="sr-only"
          checked={checked !== undefined ? checked : isChecked}
          onChange={handleCheckedChange}
          disabled={disabled}
          aria-describedby={description ? `${switchId}-description` : undefined}
          {...props}
        />
        
        <label
          htmlFor={switchId}
          className={cn(
            switchVariants({ size, variant }),
            error && 'border-destructive',
            className
          )}
          data-state={checked !== undefined ? (checked ? 'checked' : 'unchecked') : (isChecked ? 'checked' : 'unchecked')}
        >
          <motion.div
            className={thumbVariants({ size })}
            data-state={checked !== undefined ? (checked ? 'checked' : 'unchecked') : (isChecked ? 'checked' : 'unchecked')}
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {thumbIcon && (
              <div className="flex items-center justify-center h-full w-full text-xs">
                {thumbIcon}
              </div>
            )}
          </motion.div>
        </label>
      </div>
    );

    if (!label && !description && !error) {
      return switchElement;
    }

    return (
      <div className={cn('flex items-start gap-3', labelPosition === 'left' && 'flex-row-reverse')}>
        {switchElement}
        
        <div className="flex-1 min-w-0">
          {label && (
            <label 
              htmlFor={switchId}
              className={cn(
                'text-sm font-medium leading-none cursor-pointer',
                error ? 'text-destructive' : 'text-foreground',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {label}
            </label>
          )}
          
          {description && (
            <p 
              id={`${switchId}-description`}
              className={cn(
                'text-xs text-muted-foreground mt-1',
                disabled && 'opacity-50'
              )}
            >
              {description}
            </p>
          )}
          
          {error && (
            <p className="text-xs text-destructive mt-1">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Switch.displayName = 'Switch';

// Switch Group Component
export const SwitchGroup = forwardRef<HTMLDivElement, SwitchGroupProps>(
  ({ 
    className,
    children,
    orientation = 'vertical',
    gap = 'default',
    ...props 
  }, ref) => {
    const gapClasses = {
      sm: 'gap-2',
      default: 'gap-4',
      lg: 'gap-6'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
          gapClasses[gap],
          className
        )}
        role="group"
        {...props}
      >
        {children}
      </div>
    );
  }
);

SwitchGroup.displayName = 'SwitchGroup';

// Preset Switch Components
export interface ToggleSwitchProps extends Omit<SwitchProps, 'thumbIcon'> {
  checkedIcon?: React.ReactNode;
  uncheckedIcon?: React.ReactNode;
}

export const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  ({ 
    checkedIcon,
    uncheckedIcon,
    checked,
    ...props 
  }, ref) => {
    const icon = checked ? checkedIcon : uncheckedIcon;
    
    return (
      <Switch
        ref={ref}
        checked={checked}
        thumbIcon={icon}
        {...props}
      />
    );
  }
);

ToggleSwitch.displayName = 'ToggleSwitch';

// Status Switch Component
export interface StatusSwitchProps extends SwitchProps {
  statusLabels?: {
    checked: string;
    unchecked: string;
  };
}

export const StatusSwitch = forwardRef<HTMLInputElement, StatusSwitchProps>(
  ({ 
    statusLabels = { checked: 'On', unchecked: 'Off' },
    checked,
    label,
    ...props 
  }, ref) => {
    const statusText = checked ? statusLabels.checked : statusLabels.unchecked;
    const displayLabel = label ? `${label} (${statusText})` : statusText;
    
    return (
      <Switch
        ref={ref}
        checked={checked}
        label={displayLabel}
        {...props}
      />
    );
  }
);

StatusSwitch.displayName = 'StatusSwitch';

// Animated Switch with Loading State
export interface AnimatedSwitchProps extends SwitchProps {
  loading?: boolean;
  loadingText?: string;
}

export const AnimatedSwitch = forwardRef<HTMLInputElement, AnimatedSwitchProps>(
  ({ 
    loading = false,
    loadingText = 'Loading...',
    disabled,
    label,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    const displayLabel = loading && loadingText ? loadingText : label;
    
    return (
      <div className="relative">
        <Switch
          ref={ref}
          disabled={isDisabled}
          label={displayLabel}
          {...props}
        />
        
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </div>
    );
  }
);

AnimatedSwitch.displayName = 'AnimatedSwitch';

// Controlled Switch Group
export interface ControlledSwitchGroupProps extends Omit<SwitchGroupProps, 'children'> {
  switches: Array<{
    id: string;
    label: string;
    description?: string;
    checked: boolean;
    disabled?: boolean;
    variant?: SwitchProps['variant'];
  }>;
  onSwitchChange: (id: string, checked: boolean) => void;
}

export const ControlledSwitchGroup = forwardRef<HTMLDivElement, ControlledSwitchGroupProps>(
  ({ 
    switches,
    onSwitchChange,
    ...props 
  }, ref) => {
    return (
      <SwitchGroup ref={ref} {...props}>
        {switches.map((switchItem) => (
          <Switch
            key={switchItem.id}
            label={switchItem.label}
            description={switchItem.description}
            checked={switchItem.checked}
            disabled={switchItem.disabled}
            variant={switchItem.variant}
            onCheckedChange={(checked) => onSwitchChange(switchItem.id, checked)}
          />
        ))}
      </SwitchGroup>
    );
  }
);

ControlledSwitchGroup.displayName = 'ControlledSwitchGroup';

export default Switch;

