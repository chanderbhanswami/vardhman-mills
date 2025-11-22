'use client';

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Spinner variants
const spinnerVariants = cva(
  'animate-spin border-2 border-current border-t-transparent rounded-full',
  {
    variants: {
      size: {
        xs: 'w-3 h-3 border',
        sm: 'w-4 h-4 border',
        default: 'w-6 h-6 border-2',
        lg: 'w-8 h-8 border-2',
        xl: 'w-12 h-12 border-2'
      },
      variant: {
        default: 'text-primary',
        secondary: 'text-secondary',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
        success: 'text-green-500',
        warning: 'text-yellow-500'
      }
    },
    defaultVariants: {
      size: 'default',
      variant: 'default'
    }
  }
);

// Pulse variants
const pulseVariants = cva(
  'rounded-full animate-pulse',
  {
    variants: {
      size: {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        default: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
      },
      variant: {
        default: 'bg-primary/20',
        secondary: 'bg-secondary/20',
        muted: 'bg-muted-foreground/20',
        destructive: 'bg-destructive/20',
        success: 'bg-green-500/20',
        warning: 'bg-yellow-500/20'
      }
    },
    defaultVariants: {
      size: 'default',
      variant: 'default'
    }
  }
);

// Base Loading Props
export interface LoadingProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  type?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'wave' | 'skeleton';
  text?: string;
  overlay?: boolean;
  fullScreen?: boolean;
  transparent?: boolean;
}

// Skeleton Props
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  lines?: number;
  avatar?: boolean;
  card?: boolean;
}

// Loading Overlay Props
export interface LoadingOverlayProps extends LoadingProps {
  visible: boolean;
  children: React.ReactNode;
}

// Spinner Component
export const Spinner = forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant }), className)}
        role="status"
        aria-label="Loading"
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';

// Dots Loader Component
export const DotsLoader = forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size, variant, ...props }, ref) => {
    const dotSize = size === 'xs' ? 'w-1 h-1' : 
                   size === 'sm' ? 'w-1.5 h-1.5' :
                   size === 'lg' ? 'w-2.5 h-2.5' :
                   size === 'xl' ? 'w-3 h-3' : 'w-2 h-2';
    
    const dotColor = variant === 'default' ? 'bg-primary' :
                     variant === 'secondary' ? 'bg-secondary' :
                     variant === 'muted' ? 'bg-muted-foreground' :
                     variant === 'destructive' ? 'bg-destructive' :
                     variant === 'success' ? 'bg-green-500' :
                     variant === 'warning' ? 'bg-yellow-500' : 'bg-primary';

    return (
      <div
        ref={ref}
        className={cn('flex space-x-1', className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn('rounded-full', dotSize, dotColor)}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    );
  }
);

DotsLoader.displayName = 'DotsLoader';

// Pulse Loader Component
export const PulseLoader = forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(pulseVariants({ size, variant }), className)}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        role="status"
        aria-label="Loading"
        {...(props as Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragEnd' | 'onDragEnter' | 'onDragExit' | 'onDragLeave' | 'onDragOver' | 'onDragStart' | 'onDrop' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'>)}
      />
    );
  }
);

PulseLoader.displayName = 'PulseLoader';

// Bars Loader Component
export const BarsLoader = forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size, variant, ...props }, ref) => {
    const containerHeight = size === 'xs' ? 'h-3' : 
                           size === 'sm' ? 'h-4' :
                           size === 'lg' ? 'h-8' :
                           size === 'xl' ? 'h-12' : 'h-6';
    
    const barWidth = size === 'xs' ? 'w-0.5' : 
                    size === 'sm' ? 'w-1' :
                    size === 'lg' ? 'w-1.5' :
                    size === 'xl' ? 'w-2' : 'w-1';
    
    const barColor = variant === 'default' ? 'bg-primary' :
                     variant === 'secondary' ? 'bg-secondary' :
                     variant === 'muted' ? 'bg-muted-foreground' :
                     variant === 'destructive' ? 'bg-destructive' :
                     variant === 'success' ? 'bg-green-500' :
                     variant === 'warning' ? 'bg-yellow-500' : 'bg-primary';

    return (
      <div
        ref={ref}
        className={cn('flex items-end space-x-1', containerHeight, className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={cn('rounded-sm h-1/4', barWidth, barColor)}
            animate={{
              scaleY: [0.25, 1, 0.25],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    );
  }
);

BarsLoader.displayName = 'BarsLoader';

// Wave Loader Component
export const WaveLoader = forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size, variant, ...props }, ref) => {
    const circleSize = size === 'xs' ? 'w-2 h-2' : 
                      size === 'sm' ? 'w-3 h-3' :
                      size === 'lg' ? 'w-4 h-4' :
                      size === 'xl' ? 'w-6 h-6' : 'w-3 h-3';
    
    const circleColor = variant === 'default' ? 'bg-primary' :
                       variant === 'secondary' ? 'bg-secondary' :
                       variant === 'muted' ? 'bg-muted-foreground' :
                       variant === 'destructive' ? 'bg-destructive' :
                       variant === 'success' ? 'bg-green-500' :
                       variant === 'warning' ? 'bg-yellow-500' : 'bg-primary';

    return (
      <div
        ref={ref}
        className={cn('flex items-center space-x-1', className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={cn('rounded-full', circleSize, circleColor)}
            animate={{
              y: ['0%', '-100%', '0%'],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    );
  }
);

WaveLoader.displayName = 'WaveLoader';

// Skeleton Component
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    width, 
    height, 
    circle = false, 
    lines = 1, 
    avatar = false,
    card = false,
    ...props 
  }, ref) => {
    if (card) {
      return (
        <div
          ref={ref}
          className={cn('space-y-4 p-4 border rounded-lg', className)}
          {...props}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
            <div className="h-4 bg-muted rounded animate-pulse w-4/5" />
          </div>
        </div>
      );
    }

    if (avatar) {
      return (
        <div
          ref={ref}
          className={cn('flex items-center space-x-3', className)}
          {...props}
        >
          <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
      );
    }

    if (lines > 1) {
      return (
        <div
          ref={ref}
          className={cn('space-y-2', className)}
          {...props}
        >
          {Array.from({ length: lines }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-4 bg-muted rounded animate-pulse',
                i === lines - 1 && 'w-3/4'
              )}
            />
          ))}
        </div>
      );
    }

    const sizeClasses = width || height ? '' : 'h-4 w-full';
    
    return (
      <div
        ref={ref}
        className={cn(
          'bg-muted animate-pulse',
          circle ? 'rounded-full' : 'rounded',
          sizeClasses,
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Main Loading Component
export const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  ({ 
    className,
    type = 'spinner',
    text,
    overlay = false,
    fullScreen = false,
    transparent = false,
    size,
    variant,
    ...props 
  }, ref) => {
    const LoaderComponent = () => {
      switch (type) {
        case 'dots':
          return <DotsLoader size={size} variant={variant} />;
        case 'pulse':
          return <PulseLoader size={size} variant={variant} />;
        case 'bars':
          return <BarsLoader size={size} variant={variant} />;
        case 'wave':
          return <WaveLoader size={size} variant={variant} />;
        case 'skeleton':
          return <Skeleton />;
        default:
          return <Spinner size={size} variant={variant} />;
      }
    };

    const content = (
      <div
        className={cn(
          'flex flex-col items-center justify-center space-y-2',
          className
        )}
      >
        <LoaderComponent />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {text}
          </p>
        )}
      </div>
    );

    if (overlay || fullScreen) {
      return (
        <div
          ref={ref}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            transparent ? 'bg-transparent' : 'bg-background/80 backdrop-blur-sm',
            fullScreen && 'h-screen w-screen'
          )}
          {...props}
        >
          {content}
        </div>
      );
    }

    return (
      <div ref={ref} {...props}>
        {content}
      </div>
    );
  }
);

Loading.displayName = 'Loading';

// Loading Overlay Component
export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ visible, children, ...loadingProps }, ref) => {
    return (
      <div ref={ref} className="relative">
        {children}
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10"
            >
              <Loading {...loadingProps} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

// Loading Button Component
export interface LoadingButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  loadingPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    loading = false,
    loadingText,
    loadingPosition = 'left',
    children,
    disabled,
    className,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md transition-colors',
          'hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        {loading && loadingPosition === 'left' && (
          <Spinner size="sm" variant="secondary" />
        )}
        <span>{loading && loadingText ? loadingText : children}</span>
        {loading && loadingPosition === 'right' && (
          <Spinner size="sm" variant="secondary" />
        )}
      </button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export default Loading;
