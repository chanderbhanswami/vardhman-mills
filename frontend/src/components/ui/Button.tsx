'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Button variants using class-variance-authority
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
        destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-green-500 text-white hover:bg-green-600 shadow-sm',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm',
        info: 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm',
        gradient: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-sm',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 py-2',
        lg: 'h-10 px-6 py-2 text-base',
        xl: 'h-11 px-8 py-2 text-lg',
        icon: 'h-9 w-9',
      },
      shape: {
        default: 'rounded-md',
        rounded: 'rounded-lg',
        pill: 'rounded-full',
        square: 'rounded-none',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        class: 'bg-gray-900 text-gray-50 hover:bg-gray-800',
      },
      {
        variant: 'secondary',
        class: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      shape: 'default',
    },
  }
);

// Types
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
  animated?: boolean;
  ripple?: boolean;
  fullWidth?: boolean;
}

// Loading Spinner Component
const LoadingSpinner: React.FC<{ 
  size: NonNullable<ButtonProps['size']> | 'default';
}> = ({ size }) => {
  const sizeMap = {
    xs: 'h-3 w-3',
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-4 w-4',
    xl: 'h-5 w-5',
    icon: 'h-4 w-4',
    default: 'h-4 w-4',
  };

  return (
    <motion.div
      className={cn(
        'border-2 border-current border-t-transparent rounded-full',
        sizeMap[size]
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};

// Ripple Effect Component
const RippleEffect: React.FC<{
  show: boolean;
  x: number;
  y: number;
  onComplete: () => void;
}> = ({ show, x, y, onComplete }) => {
  if (!show) return null;

  return (
    <motion.div
      className="absolute rounded-full bg-white/30 pointer-events-none"
      style={{
        left: x - 10,
        top: y - 10,
        width: 20,
        height: 20,
      }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 4, opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    />
  );
};

// Main Button Component
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      shape = 'default',
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      loadingText,
      animated = false,
      ripple = false,
      fullWidth = false,
      children,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !loading) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        
        setRipples(prev => [...prev, { id, x, y }]);
      }
      
      if (!disabled && !loading) {
        onClick?.(e);
      }
    };

    // Handle asChild prop without external dependency
    if (asChild && React.isValidElement(children)) {
      const childElement = children as React.ReactElement<{ className?: string; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void }>;
      const newProps: Record<string, unknown> = {
        className: cn(
          buttonVariants({ variant, size, shape }),
          fullWidth && 'w-full',
          loading && 'cursor-wait',
          ripple && 'relative overflow-hidden',
          className,
          childElement.props.className
        ),
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          handleClick(e);
          childElement.props.onClick?.(e);
        },
      };
      
      // Only add disabled if the element supports it
      if ('disabled' in childElement.props || childElement.type === 'button' || childElement.type === 'input') {
        newProps.disabled = disabled || loading;
      }
      
      return React.cloneElement(childElement, newProps);
    }

    const removeRipple = (id: number) => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    };

    const buttonContent = (
      <>
        {/* Ripple Effects */}
        {ripples.map(ripple => (
          <RippleEffect
            key={ripple.id}
            show={true}
            x={ripple.x}
            y={ripple.y}
            onComplete={() => removeRipple(ripple.id)}
          />
        ))}

        {/* Loading Spinner */}
        {loading && (
          <LoadingSpinner size={size || 'default'} />
        )}

        {/* Left Icon */}
        {leftIcon && !loading && (
          <span className={cn(
            'flex items-center',
            children && 'mr-2'
          )}>
            {leftIcon}
          </span>
        )}

        {/* Button Text */}
        {(loading && loadingText) ? loadingText : children}

        {/* Right Icon */}
        {rightIcon && !loading && (
          <span className={cn(
            'flex items-center',
            children && 'ml-2'
          )}>
            {rightIcon}
          </span>
        )}
      </>
    );

    const buttonClass = cn(
      buttonVariants({ variant, size, shape }),
      fullWidth && 'w-full',
      loading && 'cursor-wait',
      ripple && 'relative overflow-hidden',
      className
    );

    if (animated && !loading) {
      return (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <button
            className={buttonClass}
            ref={ref}
            disabled={disabled || loading}
            onClick={handleClick}
            {...props}
          >
            {buttonContent}
          </button>
        </motion.div>
      );
    }

    return (
      <button
        className={buttonClass}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Button Group Component
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  attached?: boolean;
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      className,
      children,
      orientation = 'horizontal',
      size,
      variant,
      spacing = 'sm',
      attached = false,
      ...props
    },
    ref
  ) => {
    const spacingMap = {
      none: 'gap-0',
      sm: 'gap-1',
      md: 'gap-2',
      lg: 'gap-3',
    };

    const orientationClass = orientation === 'vertical' ? 'flex-col' : 'flex-row';

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center',
          orientationClass,
          !attached && spacingMap[spacing],
          attached && orientation === 'horizontal' && '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:border-l-0',
          attached && orientation === 'vertical' && '[&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:border-t-0',
          className
        )}
        role="group"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Button) {
            return React.cloneElement(child, {
              size: (child.props as ButtonProps).size || size,
              variant: (child.props as ButtonProps).variant || variant,
            } as Partial<ButtonProps>);
          }
          return child;
        })}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';

// Preset Button Components
export const IconButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'children'> & { icon: React.ReactNode; 'aria-label': string }
>(({ icon, size = 'icon', variant = 'ghost', ...props }, ref) => (
  <Button ref={ref} size={size} variant={variant} {...props}>
    {icon}
  </Button>
));
IconButton.displayName = 'IconButton';

export const LoadingButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { isLoading?: boolean }
>(({ isLoading, ...props }, ref) => (
  <Button ref={ref} loading={isLoading} {...props} />
));
LoadingButton.displayName = 'LoadingButton';

export const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'size' | 'shape'> & { 
    icon: React.ReactNode;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  }
>(({ icon, position = 'bottom-right', className, ...props }, ref) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6',
  };

  return (
    <Button
      ref={ref}
      size="icon"
      shape="pill"
      className={cn(
        positionClasses[position],
        'h-14 w-14 shadow-lg hover:shadow-xl z-50',
        className
      )}
      {...props}
    >
      {icon}
    </Button>
  );
});
FloatingActionButton.displayName = 'FloatingActionButton';

// Types are already exported inline with interfaces

// Default export
export default Button;
