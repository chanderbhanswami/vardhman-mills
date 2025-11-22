'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Skeleton variants
const skeletonVariants = cva(
  'animate-pulse rounded-md bg-muted',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        card: 'bg-card border border-border/10',
        text: 'bg-muted/70',
        avatar: 'bg-muted rounded-full',
        button: 'bg-muted rounded-md',
        input: 'bg-muted border border-border/20 rounded-md'
      },
      size: {
        sm: 'h-3',
        default: 'h-4',
        lg: 'h-6',
        xl: 'h-8'
      },
      animation: {
        pulse: 'animate-pulse',
        wave: '',
        none: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'pulse'
    }
  }
);

// Skeleton Props
export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  rounded?: boolean;
  count?: number;
  spacing?: string;
  delay?: number;
  duration?: number;
}

// Filter out motion-specific props to avoid conflicts
const filterMotionProps = (props: React.HTMLAttributes<HTMLDivElement>) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onDrag, onDragEnd, onDragStart, ...filteredProps } = props as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  return filteredProps;
};

// Main Skeleton Component
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    animation = 'pulse',
    width,
    height,
    circle = false,
    rounded = false,
    count = 1,
    delay = 0,
    duration = 2,
    style,
    ...props
  }, ref) => {

    const skeletonStyle: React.CSSProperties = {
      width: width || (circle ? height || undefined : undefined),
      height: height || (size === 'sm' ? '0.75rem' : size === 'lg' ? '1.5rem' : size === 'xl' ? '2rem' : '1rem'),
      borderRadius: circle ? '50%' : rounded ? '0.5rem' : undefined,
      background: animation === 'wave' 
        ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
        : undefined,
      backgroundSize: animation === 'wave' ? '200% 100%' : undefined,
      ...style
    };

    // Filter out conflicting props
    const filteredProps = filterMotionProps(props);

    if (count === 1) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            skeletonVariants({ variant, size, animation }),
            circle && 'rounded-full aspect-square',
            rounded && 'rounded-lg',
            className
          )}
          style={skeletonStyle}
          initial={{ opacity: 0 }}
          animate={animation === 'wave' ? {
            opacity: 1,
            backgroundPosition: ['200% 0', '-200% 0']
          } : {
            opacity: 1
          }}
          transition={animation === 'wave' ? {
            duration,
            repeat: Infinity,
            ease: 'easeInOut'
          } : { delay }}
          {...filteredProps}
        />
      );
    }

    // Multiple skeletons
    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              skeletonVariants({ variant, size, animation }),
              circle && 'rounded-full aspect-square',
              rounded && 'rounded-lg'
            )}
            style={skeletonStyle}
            initial={{ opacity: 0 }}
            animate={animation === 'wave' ? {
              opacity: 1,
              backgroundPosition: ['200% 0', '-200% 0']
            } : {
              opacity: 1
            }}
            transition={animation === 'wave' ? {
              duration,
              repeat: Infinity,
              ease: 'easeInOut'
            } : { delay: delay + index * 0.1 }}
          />
        ))}
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Text Skeleton
export interface TextSkeletonProps extends Omit<SkeletonProps, 'variant'> {
  lines?: number;
  lastLineWidth?: string;
}

export const TextSkeleton = forwardRef<HTMLDivElement, TextSkeletonProps>(
  ({ lines = 1, lastLineWidth = '75%', className, ...props }, ref) => {
    if (lines === 1) {
      return <Skeleton ref={ref} variant="text" className={className} {...props} />;
    }

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={index === lines - 1 ? lastLineWidth : '100%'}
            {...props}
          />
        ))}
      </div>
    );
  }
);

TextSkeleton.displayName = 'TextSkeleton';

// Avatar Skeleton
export const AvatarSkeleton = forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant' | 'circle'>>(
  ({ size = 'default', className, ...props }, ref) => {
    const avatarSizes = {
      sm: 'w-8 h-8',
      default: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16'
    };

    return (
      <Skeleton
        ref={ref}
        variant="avatar"
        circle
        className={cn(avatarSizes[size as keyof typeof avatarSizes], className)}
        {...props}
      />
    );
  }
);

AvatarSkeleton.displayName = 'AvatarSkeleton';

// Button Skeleton
export const ButtonSkeleton = forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  ({ size = 'default', className, ...props }, ref) => {
    const buttonSizes = {
      sm: 'h-8 w-20',
      default: 'h-9 w-24',
      lg: 'h-10 w-28',
      xl: 'h-11 w-32'
    };

    return (
      <Skeleton
        ref={ref}
        variant="button"
        className={cn(buttonSizes[size as keyof typeof buttonSizes], className)}
        {...props}
      />
    );
  }
);

ButtonSkeleton.displayName = 'ButtonSkeleton';

// Input Skeleton
export const InputSkeleton = forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  ({ size = 'default', className, ...props }, ref) => {
    const inputSizes = {
      sm: 'h-8',
      default: 'h-9',
      lg: 'h-10',
      xl: 'h-11'
    };

    return (
      <Skeleton
        ref={ref}
        variant="input"
        className={cn(inputSizes[size as keyof typeof inputSizes], 'w-full', className)}
        {...props}
      />
    );
  }
);

InputSkeleton.displayName = 'InputSkeleton';

// Card Skeleton
export interface CardSkeletonProps extends Omit<SkeletonProps, 'variant'> {
  hasImage?: boolean;
  hasAvatar?: boolean;
  lines?: number;
  hasActions?: boolean;
}

export const CardSkeleton = forwardRef<HTMLDivElement, CardSkeletonProps>(
  ({ 
    hasImage = false,
    hasAvatar = false,
    lines = 3,
    hasActions = false,
    className,
    ...props 
  }, ref) => {
    return (
      <div ref={ref} className={cn('p-4 space-y-3 border border-border rounded-lg', className)}>
        {/* Image placeholder */}
        {hasImage && (
          <Skeleton className="w-full h-48 rounded-md" {...props} />
        )}

        {/* Header with avatar */}
        <div className="flex items-center space-x-3">
          {hasAvatar && <AvatarSkeleton size="default" {...props} />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" {...props} />
            <Skeleton className="h-3 w-1/4" {...props} />
          </div>
        </div>

        {/* Content lines */}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-4"
              width={index === lines - 1 ? '60%' : '100%'}
              {...props}
            />
          ))}
        </div>

        {/* Actions */}
        {hasActions && (
          <div className="flex justify-between pt-3">
            <ButtonSkeleton size="sm" {...props} />
            <ButtonSkeleton size="sm" {...props} />
          </div>
        )}
      </div>
    );
  }
);

CardSkeleton.displayName = 'CardSkeleton';

// Table Skeleton
export interface TableSkeletonProps extends Omit<SkeletonProps, 'variant'> {
  rows?: number;
  cols?: number;
  showHeader?: boolean;
}

export const TableSkeleton = forwardRef<HTMLDivElement, TableSkeletonProps>(
  ({ 
    rows = 5,
    cols = 4,
    showHeader = true,
    className,
    ...props 
  }, ref) => {
    return (
      <div ref={ref} className={cn('w-full', className)}>
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Header */}
          {showHeader && (
            <div className="bg-muted/50 p-4">
              <div className={`grid gap-4 grid-cols-${cols}`}>
                {Array.from({ length: cols }).map((_, index) => (
                  <Skeleton key={index} className="h-4" {...props} />
                ))}
              </div>
            </div>
          )}

          {/* Rows */}
          <div className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div key={rowIndex} className="p-4">
                <div className={cn('grid gap-4', cols === 2 && 'grid-cols-2', cols === 3 && 'grid-cols-3', cols === 4 && 'grid-cols-4', cols === 5 && 'grid-cols-5', cols === 6 && 'grid-cols-6')} data-cols={cols}>
                  {Array.from({ length: cols }).map((_, colIndex) => (
                    <Skeleton
                      key={colIndex}
                      className="h-4"
                      width={Math.random() > 0.5 ? '80%' : '100%'}
                      {...props}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

TableSkeleton.displayName = 'TableSkeleton';

// List Skeleton
export interface ListSkeletonProps extends Omit<SkeletonProps, 'variant'> {
  items?: number;
  hasAvatar?: boolean;
  hasIcon?: boolean;
  lines?: number;
}

export const ListSkeleton = forwardRef<HTMLDivElement, ListSkeletonProps>(
  ({ 
    items = 5,
    hasAvatar = false,
    hasIcon = false,
    lines = 2,
    className,
    ...props 
  }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {Array.from({ length: items }).map((_, index) => (
          <div key={index} className="flex items-start space-x-3">
            {/* Avatar or Icon */}
            {hasAvatar && <AvatarSkeleton size="default" {...props} />}
            {hasIcon && !hasAvatar && (
              <Skeleton className="w-5 h-5 rounded flex-shrink-0 mt-0.5" {...props} />
            )}

            {/* Content */}
            <div className="flex-1 space-y-2">
              {Array.from({ length: lines }).map((_, lineIndex) => (
                <Skeleton
                  key={lineIndex}
                  className="h-4"
                  width={lineIndex === lines - 1 ? '70%' : '100%'}
                  {...props}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

ListSkeleton.displayName = 'ListSkeleton';

// Form Skeleton
export interface FormSkeletonProps extends Omit<SkeletonProps, 'variant'> {
  fields?: number;
  hasSubmit?: boolean;
}

export const FormSkeleton = forwardRef<HTMLDivElement, FormSkeletonProps>(
  ({ 
    fields = 4,
    hasSubmit = true,
    className,
    ...props 
  }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-4', className)}>
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            {/* Label */}
            <Skeleton className="h-4 w-1/4" {...props} />
            {/* Input */}
            <InputSkeleton {...props} />
          </div>
        ))}

        {/* Submit button */}
        {hasSubmit && (
          <div className="pt-4">
            <ButtonSkeleton size="lg" className="w-full" {...props} />
          </div>
        )}
      </div>
    );
  }
);

FormSkeleton.displayName = 'FormSkeleton';

// Page Skeleton (full page layout)
export interface PageSkeletonProps extends Omit<SkeletonProps, 'variant'> {
  hasHeader?: boolean;
  hasSidebar?: boolean;
  hasFooter?: boolean;
}

export const PageSkeleton = forwardRef<HTMLDivElement, PageSkeletonProps>(
  ({ 
    hasHeader = true,
    hasSidebar = false,
    hasFooter = true,
    className,
    ...props 
  }, ref) => {
    return (
      <div ref={ref} className={cn('min-h-screen flex flex-col', className)}>
        {/* Header */}
        {hasHeader && (
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" {...props} />
              <div className="flex space-x-2">
                <ButtonSkeleton size="sm" {...props} />
                <AvatarSkeleton size="sm" {...props} />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex">
          {/* Sidebar */}
          {hasSidebar && (
            <div className="w-64 border-r border-border p-4">
              <ListSkeleton items={8} hasIcon lines={1} {...props} />
            </div>
          )}

          {/* Content area */}
          <div className="flex-1 p-6">
            <div className="space-y-6">
              {/* Page title */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" {...props} />
                <Skeleton className="h-4 w-1/2" {...props} />
              </div>

              {/* Content blocks */}
              <div className="grid gap-6">
                <CardSkeleton hasImage lines={4} {...props} />
                <TableSkeleton rows={3} {...props} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {hasFooter && (
          <div className="border-t border-border p-4">
            <div className="flex items-center justify-center">
              <Skeleton className="h-4 w-48" {...props} />
            </div>
          </div>
        )}
      </div>
    );
  }
);

PageSkeleton.displayName = 'PageSkeleton';

export default Skeleton;
