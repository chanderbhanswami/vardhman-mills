'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Divider variants
const dividerVariants = cva(
  'shrink-0',
  {
    variants: {
      orientation: {
        horizontal: 'h-px w-full',
        vertical: 'w-px h-full',
      },
      variant: {
        solid: 'bg-border',
        dashed: 'border-dashed border-t border-border bg-transparent',
        dotted: 'border-dotted border-t border-border bg-transparent',
        double: 'border-double border-t-4 border-border bg-transparent',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
      color: {
        default: 'border-border bg-border',
        muted: 'border-muted bg-muted',
        accent: 'border-accent bg-accent',
        primary: 'border-primary bg-primary',
        secondary: 'border-secondary bg-secondary',
        destructive: 'border-destructive bg-destructive',
        success: 'border-green-500 bg-green-500',
        warning: 'border-yellow-500 bg-yellow-500',
        info: 'border-blue-500 bg-blue-500',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      variant: 'solid',
      size: 'md',
      color: 'default',
    },
  }
);

// Label variants for dividers with text (commented out as currently unused)
/*
const labelVariants = cva(
  'flex items-center text-sm font-medium text-muted-foreground px-3 bg-background',
  {
    variants: {
      position: {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
      },
    },
    defaultVariants: {
      position: 'center',
    },
  }
);
*/

// Divider Props
export interface DividerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof dividerVariants> {
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  thickness?: number;
  length?: string | number;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  animated?: boolean;
  gradient?: {
    from: string;
    to: string;
    direction?: 'to-r' | 'to-l' | 'to-t' | 'to-b';
  };
}

// Main Divider Component
export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({
    orientation = 'horizontal',
    variant = 'solid',
    size = 'md',
    color = 'default',
    label,
    labelPosition = 'center',
    spacing = 'md',
    thickness,
    length,
    startIcon,
    endIcon,
    animated = false,
    gradient,
    className,
    style,
    children,
    ...props
  }, ref) => {
    // Spacing classes
    const spacingClasses = {
      none: '',
      xs: orientation === 'horizontal' ? 'my-2' : 'mx-2',
      sm: orientation === 'horizontal' ? 'my-3' : 'mx-3',
      md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
      lg: orientation === 'horizontal' ? 'my-6' : 'mx-6',
      xl: orientation === 'horizontal' ? 'my-8' : 'mx-8',
    };

    // Size adjustments for thickness
    const getSizeAdjustment = (currentSize: typeof size) => {
      if (!currentSize) return orientation === 'horizontal' ? 'h-px' : 'w-px';
      const sizeMap = {
        sm: orientation === 'horizontal' ? 'h-px' : 'w-px',
        md: orientation === 'horizontal' ? 'h-px' : 'w-px',
        lg: orientation === 'horizontal' ? 'h-0.5' : 'w-0.5',
      };
      return sizeMap[currentSize] || sizeMap.md;
    };
    
    // Create sizeAdjustments mapping to fix errors - handle null size
    const currentSize = size || 'md';
    const sizeAdjustments: Record<string, string> = {
      sm: getSizeAdjustment('sm'),
      md: getSizeAdjustment('md'),
      lg: getSizeAdjustment('lg'),
    };
    // Size adjustments are applied directly in className using currentSize

    // Custom styles without inline usage
    const customStyles: React.CSSProperties = { 
      ...style
    };
    
    if (thickness) {
      if (orientation === 'horizontal') {
        customStyles.height = `${thickness}px`;
      } else {
        customStyles.width = `${thickness}px`;
      }
    }
    
    if (length) {
      if (orientation === 'horizontal') {
        customStyles.width = typeof length === 'number' ? `${length}px` : length;
      } else {
        customStyles.height = typeof length === 'number' ? `${length}px` : length;
      }
    }

    // Gradient styles
    if (gradient) {
      customStyles.background = `linear-gradient(${gradient.direction?.replace('to-', '') || 'to right'}, var(--${gradient.from}), var(--${gradient.to}))`;
    }

    // If there's a label or children, render with content
    if (label || children || startIcon || endIcon) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative flex items-center',
            orientation === 'vertical' ? 'flex-col h-full' : 'w-full',
            spacingClasses[spacing],
            className
          )}
          {...props}
        >
          {/* Start section */}
          {(startIcon || (labelPosition === 'left' && (label || children))) && (
            <>
              {startIcon && (
                <div className={cn(
                  'flex items-center',
                  orientation === 'horizontal' ? 'mr-3' : 'mb-3'
                )}>
                  {startIcon}
                </div>
              )}
              {labelPosition === 'left' && (label || children) && (
                <div className={cn(
                  'flex items-center px-3 bg-background',
                  orientation === 'horizontal' ? 'mr-3' : 'mb-3'
                )}>
                  {label || children}
                </div>
              )}
              <div
                className={cn(
                  dividerVariants({ 
                    orientation, 
                    variant, 
                    size: thickness ? 'md' : size, 
                    color 
                  }),
                  sizeAdjustments[currentSize],
                  animated && 'animate-pulse',
                  orientation === 'horizontal' ? 'flex-1' : 'flex-1'
                )}
                data-thickness={thickness}
                data-length={length}
              />
            </>
          )}

          {/* Center section */}
          {labelPosition === 'center' && (label || children) && (
            <>
              <div
                className={cn(
                  dividerVariants({ 
                    orientation, 
                    variant, 
                    size: thickness ? 'md' : size, 
                    color 
                  }),
                  sizeAdjustments[currentSize],
                  animated && 'animate-pulse',
                  orientation === 'horizontal' ? 'flex-1' : 'flex-1'
                )}
                data-thickness={thickness}
                data-length={length}
              />
              <div className={cn(
                'flex items-center px-3 bg-background text-sm font-medium text-muted-foreground',
                orientation === 'horizontal' ? 'mx-3' : 'my-3'
              )}>
                {label || children}
              </div>
              <div
                className={cn(
                  dividerVariants({ 
                    orientation, 
                    variant, 
                    size: thickness ? 'md' : size, 
                    color 
                  }),
                  sizeAdjustments[currentSize],
                  animated && 'animate-pulse',
                  orientation === 'horizontal' ? 'flex-1' : 'flex-1'
                )}
                data-thickness={thickness}
                data-length={length}
              />
            </>
          )}

          {/* End section */}
          {(endIcon || (labelPosition === 'right' && (label || children))) && (
            <>
              <div
                className={cn(
                  dividerVariants({ 
                    orientation, 
                    variant, 
                    size: thickness ? 'md' : size, 
                    color 
                  }),
                  sizeAdjustments[currentSize],
                  animated && 'animate-pulse',
                  orientation === 'horizontal' ? 'flex-1' : 'flex-1'
                )}
                data-thickness={thickness}
                data-length={length}
              />
              {labelPosition === 'right' && (label || children) && (
                <div className={cn(
                  'flex items-center px-3 bg-background',
                  orientation === 'horizontal' ? 'ml-3' : 'mt-3'
                )}>
                  {label || children}
                </div>
              )}
              {endIcon && (
                <div className={cn(
                  'flex items-center',
                  orientation === 'horizontal' ? 'ml-3' : 'mt-3'
                )}>
                  {endIcon}
                </div>
              )}
            </>
          )}

          {/* No label case - render single divider */}
          {!label && !children && !startIcon && !endIcon && (
            <div
              className={cn(
                dividerVariants({ orientation, variant, size: thickness ? 'md' : size, color }),
                sizeAdjustments[currentSize],
                animated && 'animate-pulse'
              )}
              data-thickness={thickness}
              data-length={length}
            />
          )}
        </div>
      );
    }

    // Simple divider without content
    return (
      <div
        ref={ref}
        className={cn(
          dividerVariants({ orientation, variant, size: thickness ? 'md' : size, color }),
          sizeAdjustments[currentSize],
          spacingClasses[spacing],
          animated && 'animate-pulse',
          className
        )}
        data-thickness={thickness}
        data-length={length}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

// Separator alias for compatibility
export const Separator = Divider;

// Section Divider with enhanced styling
export interface SectionDividerProps extends DividerProps {
  title?: string;
  subtitle?: string;
  centerContent?: boolean;
}

export const SectionDivider = forwardRef<HTMLDivElement, SectionDividerProps>(
  ({
    title,
    subtitle,
    centerContent = true,
    spacing = 'lg',
    color = 'muted',
    className,
    ...props
  }, ref) => {
    if (title || subtitle) {
      return (
        <div className={cn(
          'flex flex-col items-center text-center space-y-2',
          !centerContent && 'items-start text-left',
          className
        )}>
          {title && (
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground max-w-md">
              {subtitle}
            </p>
          )}
          <Divider
            ref={ref}
            spacing={spacing}
            color={color}
            className="w-full"
            {...props}
          />
        </div>
      );
    }

    return (
      <Divider
        ref={ref}
        spacing={spacing}
        color={color}
        className={className}
        {...props}
      />
    );
  }
);

SectionDivider.displayName = 'SectionDivider';

// Gradient Divider
export interface GradientDividerProps extends Omit<DividerProps, 'variant' | 'color'> {
  fromColor?: string;
  toColor?: string;
  direction?: 'horizontal' | 'vertical';
}

export const GradientDivider = forwardRef<HTMLDivElement, GradientDividerProps>(
  ({
    fromColor = 'purple-500',
    toColor = 'pink-500',
    direction = 'horizontal',
    className,
    ...props
  }, ref) => {
    const gradientDirection = direction === 'horizontal' ? 'to-r' : 'to-b';
    
    return (
      <Divider
        ref={ref}
        variant="solid"
        className={cn(
          `bg-gradient-${gradientDirection}`,
          `from-${fromColor}`,
          `to-${toColor}`,
          className
        )}
        {...props}
      />
    );
  }
);

GradientDivider.displayName = 'GradientDivider';

// Animated Divider
export interface AnimatedDividerProps extends DividerProps {
  animation?: 'pulse' | 'bounce' | 'ping' | 'spin';
  duration?: 'fast' | 'normal' | 'slow';
}

export const AnimatedDivider = forwardRef<HTMLDivElement, AnimatedDividerProps>(
  ({
    animation = 'pulse',
    duration = 'normal',
    className,
    ...props
  }, ref) => {
    const durationClasses = {
      fast: 'duration-500',
      normal: 'duration-1000',
      slow: 'duration-2000',
    };

    const animationClasses = {
      pulse: 'animate-pulse',
      bounce: 'animate-bounce',
      ping: 'animate-ping',
      spin: 'animate-spin',
    };

    return (
      <Divider
        ref={ref}
        className={cn(
          animationClasses[animation],
          durationClasses[duration],
          className
        )}
        {...props}
      />
    );
  }
);

AnimatedDivider.displayName = 'AnimatedDivider';

// Export all components
export default Divider;
