'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Badge variants using class-variance-authority
const badgeVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
        warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
        info: 'border-transparent bg-blue-500 text-white hover:bg-blue-600',
        outline: 'text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        gradient: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600',
      },
      size: {
        xs: 'h-4 px-1.5 text-xs rounded-sm',
        sm: 'h-5 px-2 text-xs rounded-md',
        md: 'h-6 px-2.5 text-sm rounded-md',
        lg: 'h-7 px-3 text-sm rounded-lg',
        xl: 'h-8 px-4 text-base rounded-lg',
      },
      shape: {
        rounded: '',
        pill: 'rounded-full',
        square: 'rounded-none',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        class: 'bg-gray-900 text-gray-50',
      },
      {
        variant: 'secondary',
        class: 'bg-gray-100 text-gray-900',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      shape: 'rounded',
    },
  }
);

const dotVariants = cva('rounded-full', {
  variants: {
    size: {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-3.5 w-3.5',
    },
  },
});

// Types
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
  closable?: boolean;
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  dot?: boolean;
  dotColor?: string;
  animated?: boolean;
  pulse?: boolean;
  loading?: boolean;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  clickable?: boolean;
  disabled?: boolean;
}

export interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spacing?: 'tight' | 'normal' | 'loose';
  wrap?: boolean;
}

// Badge Dot Component
const BadgeDot: React.FC<{
  size: NonNullable<BadgeProps['size']>;
  color?: string;
  animated?: boolean;
  pulse?: boolean;
}> = ({ size, color = 'bg-current', animated = false, pulse = false }) => {
  const dot = (
    <span
      className={cn(
        dotVariants({ size }),
        color,
        'mr-1.5 flex-shrink-0'
      )}
    />
  );

  if (animated && pulse) {
    return (
      <motion.span
        className="mr-1.5 flex-shrink-0"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className={cn(dotVariants({ size }), color)} />
      </motion.span>
    );
  }

  return dot;
};

// Close Button Component
const CloseButton: React.FC<{
  size: NonNullable<BadgeProps['size']>;
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ size, onClose, disabled }) => {
  const iconSizeMap = {
    xs: 'h-2.5 w-2.5',
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
    xl: 'h-4.5 w-4.5',
  };

  return (
    <button
      type="button"
      onClick={onClose}
      disabled={disabled}
      className={cn(
        'ml-1 rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-white/50',
        'transition-colors duration-150 flex items-center justify-center',
        size === 'xs' && 'p-0.5',
        size === 'sm' && 'p-0.5',
        size === 'md' && 'p-1',
        size === 'lg' && 'p-1',
        size === 'xl' && 'p-1',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-label="Remove badge"
    >
      <XMarkIcon className={cn(iconSizeMap[size], 'opacity-70')} />
    </button>
  );
};

// Loading Spinner Component
const LoadingSpinner: React.FC<{ size: NonNullable<BadgeProps['size']> }> = ({ size }) => {
  const spinnerSizeMap = {
    xs: 'h-2.5 w-2.5',
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
    xl: 'h-4.5 w-4.5',
  };

  return (
    <motion.div
      className={cn(
        spinnerSizeMap[size],
        'mr-1.5 border border-current border-t-transparent rounded-full'
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

// Count Badge Component
export const CountBadge: React.FC<{
  count: number;
  maxCount?: number;
  showZero?: boolean;
  size?: BadgeProps['size'];
  variant?: BadgeProps['variant'];
  className?: string;
}> = ({ 
  count, 
  maxCount = 99, 
  showZero = false, 
  size = 'sm',
  variant = 'destructive',
  className 
}) => {
  if (count <= 0 && !showZero) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <Badge 
      variant={variant} 
      size={size} 
      shape="pill"
      className={cn('min-w-fit px-1', className)}
    >
      {displayCount}
    </Badge>
  );
};

// Main Badge Component
export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      shape = 'rounded',
      children,
      closable = false,
      onClose,
      leftIcon,
      rightIcon,
      dot = false,
      dotColor,
      animated = false,
      pulse = false,
      loading = false,
      count,
      maxCount = 99,
      showZero = false,
      clickable = false,
      disabled = false,
      onClick,
      ...props
    },
    ref
  ) => {
    // Handle count display
    if (typeof count === 'number') {
      return (
        <CountBadge
          count={count}
          maxCount={maxCount}
          showZero={showZero}
          size={size}
          variant={variant}
          className={className}
        />
      );
    }

    const badgeContent = (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant, size, shape }),
          clickable && !disabled && 'cursor-pointer hover:opacity-80',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        {...(clickable && { role: 'button' })}
        tabIndex={clickable && !disabled ? 0 : undefined}
        onClick={clickable && !disabled ? onClick : undefined}
        onKeyDown={clickable && !disabled ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Simulate a mouse event for keyboard activation
            const mockEvent = {
              preventDefault: () => {},
              stopPropagation: () => {},
              currentTarget: e.currentTarget,
              target: e.target,
            } as React.MouseEvent<HTMLDivElement>;
            onClick?.(mockEvent);
          }
        } : undefined}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && <LoadingSpinner size={size || 'md'} />}

        {/* Dot Indicator */}
        {dot && !loading && (
          <BadgeDot 
            size={size || 'md'} 
            color={dotColor} 
            animated={animated} 
            pulse={pulse} 
          />
        )}

        {/* Left Icon */}
        {leftIcon && !loading && !dot && (
          <span className="mr-1.5 flex-shrink-0">
            {leftIcon}
          </span>
        )}

        {/* Content */}
        {children && (
          <span className="truncate">
            {children}
          </span>
        )}

        {/* Right Icon */}
        {rightIcon && !closable && (
          <span className="ml-1.5 flex-shrink-0">
            {rightIcon}
          </span>
        )}

        {/* Close Button */}
        {closable && onClose && (
          <CloseButton 
            size={size || 'md'} 
            onClose={onClose} 
            disabled={disabled} 
          />
        )}
      </div>
    );

    if (animated && !loading) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {badgeContent}
        </motion.div>
      );
    }

    return badgeContent;
  }
);

Badge.displayName = 'Badge';

// Badge Group Component
export const BadgeGroup = forwardRef<HTMLDivElement, BadgeGroupProps>(
  (
    {
      className,
      children,
      spacing = 'normal',
      wrap = true,
      ...props
    },
    ref
  ) => {
    const spacingMap = {
      tight: 'gap-1',
      normal: 'gap-2',
      loose: 'gap-3',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          spacingMap[spacing],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BadgeGroup.displayName = 'BadgeGroup';

// Preset badge components
export const StatusBadge: React.FC<{
  status: 'online' | 'offline' | 'away' | 'busy';
  showText?: boolean;
  size?: BadgeProps['size'];
}> = ({ status, showText = false, size = 'sm' }) => {
  const statusConfig = {
    online: { variant: 'success' as const, dot: 'bg-green-500', text: 'Online' },
    offline: { variant: 'secondary' as const, dot: 'bg-gray-500', text: 'Offline' },
    away: { variant: 'warning' as const, dot: 'bg-yellow-500', text: 'Away' },
    busy: { variant: 'destructive' as const, dot: 'bg-red-500', text: 'Busy' },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={!showText}
      dotColor={config.dot}
      pulse={status === 'online'}
      animated
    >
      {showText && config.text}
    </Badge>
  );
};

export const PriorityBadge: React.FC<{
  priority: 'low' | 'medium' | 'high' | 'urgent';
  size?: BadgeProps['size'];
}> = ({ priority, size = 'sm' }) => {
  const priorityConfig = {
    low: { variant: 'secondary' as const, text: 'Low' },
    medium: { variant: 'info' as const, text: 'Medium' },
    high: { variant: 'warning' as const, text: 'High' },
    urgent: { variant: 'destructive' as const, text: 'Urgent' },
  };

  const config = priorityConfig[priority];

  return (
    <Badge variant={config.variant} size={size}>
      {config.text}
    </Badge>
  );
};

// Types are already exported inline with interfaces

// Default export
export default Badge;
