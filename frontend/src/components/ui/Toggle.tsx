'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Toggle variants
const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
        outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
        solid: 'bg-muted text-muted-foreground hover:bg-muted/80 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
      },
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-2.5',
        lg: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Types
export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  asChild?: boolean;
  icon?: React.ReactNode;
  label?: string;
  description?: string;
  showAnimation?: boolean;
}

// Main Toggle component
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({
    className,
    variant,
    size,
    pressed: controlledPressed,
    defaultPressed = false,
    onPressedChange,
    disabled,
    children,
    icon,
    label,
    description,
    showAnimation = true,
    ...props
  }, ref) => {
    const [internalPressed, setInternalPressed] = useState(defaultPressed);
    
    const pressed = controlledPressed !== undefined ? controlledPressed : internalPressed;
    const ariaPressed = pressed ? 'true' : 'false';

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      
      const newPressed = !pressed;
      if (controlledPressed === undefined) {
        setInternalPressed(newPressed);
      }
      onPressedChange?.(newPressed);
      props.onClick?.(event);
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(toggleVariants({ variant, size }), className)}
        data-state={pressed ? 'on' : 'off'}
        {...{ 'aria-pressed': ariaPressed }}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        <div className="flex items-center gap-2">
          {/* Icon with animation */}
          {icon && (
            <motion.div
              animate={showAnimation ? {
                scale: pressed ? 1.1 : 1,
                rotate: pressed ? 360 : 0,
              } : {}}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              {icon}
            </motion.div>
          )}

          {/* Content */}
          {children && (
            <span className="flex items-center gap-1">
              {children}
            </span>
          )}

          {/* Label and description */}
          {(label || description) && (
            <div className="flex flex-col items-start text-left">
              {label && (
                <span className="text-sm font-medium">{label}</span>
              )}
              {description && (
                <span className="text-xs text-muted-foreground">{description}</span>
              )}
            </div>
          )}
        </div>
      </button>
    );
  }
);

Toggle.displayName = 'Toggle';

// Switch-style toggle
export interface SwitchToggleProps extends Omit<ToggleProps, 'variant' | 'children'> {
  thumbIcon?: React.ReactNode;
  showLabels?: boolean;
  onLabel?: string;
  offLabel?: string;
}

export const SwitchToggle = React.forwardRef<HTMLButtonElement, SwitchToggleProps>(
  ({
    className,
    pressed: controlledPressed,
    defaultPressed = false,
    onPressedChange,
    disabled,
    thumbIcon,
    showLabels = false,
    onLabel = 'ON',
    offLabel = 'OFF',
    size = 'default',
    showAnimation = true,
    ...props
  }, ref) => {
    const [internalPressed, setInternalPressed] = useState(defaultPressed);
    
    const pressed = controlledPressed !== undefined ? controlledPressed : internalPressed;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      
      const newPressed = !pressed;
      if (controlledPressed === undefined) {
        setInternalPressed(newPressed);
      }
      onPressedChange?.(newPressed);
      props.onClick?.(event);
    };

    const switchSizes = {
      sm: { width: 'w-8', height: 'h-4', thumb: 'h-3 w-3' },
      default: { width: 'w-11', height: 'h-6', thumb: 'h-5 w-5' },
      lg: { width: 'w-14', height: 'h-7', thumb: 'h-6 w-6' },
    };

    const currentSize = switchSizes[size || 'default'];

    return (
      <button
        ref={ref}
        type="button"
        role="button"
        aria-label={`Switch ${pressed ? 'on' : 'off'}`}
        data-state={pressed ? 'checked' : 'unchecked'}
        data-checked={pressed}
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          pressed ? 'bg-primary' : 'bg-input',
          currentSize.width,
          currentSize.height,
          className
        )}
        {...props}
      >
        {/* Thumb */}
        <motion.div
          className={cn(
            'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform',
            currentSize.thumb
          )}
          animate={showAnimation ? {
            x: pressed ? (size === 'sm' ? 16 : size === 'lg' ? 28 : 20) : 0,
          } : {
            transform: pressed ? (size === 'sm' ? 'translateX(16px)' : size === 'lg' ? 'translateX(28px)' : 'translateX(20px)') : 'translateX(0px)',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {/* Thumb icon */}
          {thumbIcon && (
            <div className="flex h-full w-full items-center justify-center">
              {thumbIcon}
            </div>
          )}
        </motion.div>

        {/* Labels inside switch */}
        {showLabels && (
          <div className="absolute inset-0 flex items-center justify-between px-1 text-xs font-medium">
            <span className={cn(
              'transition-opacity',
              pressed ? 'opacity-0' : 'opacity-100 text-muted-foreground'
            )}>
              {offLabel}
            </span>
            <span className={cn(
              'transition-opacity',
              pressed ? 'opacity-100 text-primary-foreground' : 'opacity-0'
            )}>
              {onLabel}
            </span>
          </div>
        )}
      </button>
    );
  }
);

SwitchToggle.displayName = 'SwitchToggle';

// Icon toggle
export interface IconToggleProps extends Omit<ToggleProps, 'children' | 'label' | 'description'> {
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
  ariaLabel?: string;
}

export const IconToggle = React.forwardRef<HTMLButtonElement, IconToggleProps>(
  ({
    onIcon,
    offIcon,
    ariaLabel,
    pressed: controlledPressed,
    defaultPressed = false,
    showAnimation = true,
    onPressedChange,
    ...props
  }, ref) => {
    return (
      <Toggle
        ref={ref}
        pressed={controlledPressed}
        defaultPressed={defaultPressed}
        onPressedChange={onPressedChange}
        aria-label={ariaLabel}
        showAnimation={showAnimation}
        {...props}
      >
        <motion.div
          key={(controlledPressed ?? defaultPressed) ? 'on' : 'off'}
          initial={showAnimation ? { scale: 0.8, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {(controlledPressed ?? defaultPressed) ? onIcon : offIcon}
        </motion.div>
      </Toggle>
    );
  }
);

IconToggle.displayName = 'IconToggle';

// Simple toggle with text
export interface TextToggleProps extends Omit<ToggleProps, 'children' | 'icon'> {
  onText?: string;
  offText?: string;
}

export const TextToggle = React.forwardRef<HTMLButtonElement, TextToggleProps>(
  ({
    onText = 'On',
    offText = 'Off',
    pressed: controlledPressed,
    defaultPressed = false,
    onPressedChange,
    ...props
  }, ref) => {
    return (
      <Toggle
        ref={ref}
        pressed={controlledPressed}
        defaultPressed={defaultPressed}
        onPressedChange={onPressedChange}
        {...props}
      >
        {(controlledPressed ?? defaultPressed) ? onText : offText}
      </Toggle>
    );
  }
);

TextToggle.displayName = 'TextToggle';

// Toggle with loading state
export interface LoadingToggleProps extends ToggleProps {
  loading?: boolean;
  loadingText?: string;
}

export const LoadingToggle = React.forwardRef<HTMLButtonElement, LoadingToggleProps>(
  ({
    loading = false,
    loadingText = 'Loading...',
    disabled,
    children,
    ...props
  }, ref) => {
    return (
      <Toggle
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <motion.div
              className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            {loadingText}
          </div>
        ) : (
          children
        )}
      </Toggle>
    );
  }
);

LoadingToggle.displayName = 'LoadingToggle';

export default Toggle;

