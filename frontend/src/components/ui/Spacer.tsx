'use client';

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

// Spacer Props
export interface SpacerProps {
  size?: number | string;
  direction?: 'horizontal' | 'vertical';
  flex?: number | string;
  className?: string;
}

// Main Spacer Component
export const Spacer = forwardRef<HTMLDivElement, SpacerProps>(
  ({
    size,
    direction = 'horizontal',
    flex = 1,
    className,
    ...props
  }, ref) => {
    // Convert size to appropriate classes or styles
    const getSizeClass = () => {
      if (!size) return '';
      
      if (typeof size === 'number') {
        return direction === 'horizontal' 
          ? `w-${size > 96 ? `[${size}px]` : size}` 
          : `h-${size > 96 ? `[${size}px]` : size}`;
      }
      
      if (typeof size === 'string') {
        return direction === 'horizontal' 
          ? `w-[${size}]` 
          : `h-[${size}]`;
      }
      
      return '';
    };

    // Flex classes
    const getFlexClass = () => {
      if (typeof flex === 'number') {
        if (flex === 0) return 'flex-none';
        if (flex === 1) return 'flex-1';
        return `flex-[${flex}]`;
      }
      
      if (typeof flex === 'string') {
        return `flex-[${flex}]`;
      }
      
      return 'flex-1';
    };

    return (
      <div
        ref={ref}
        className={cn(
          'shrink-0',
          !size && getFlexClass(),
          size && getSizeClass(),
          direction === 'horizontal' && !size && 'w-full',
          direction === 'vertical' && !size && 'h-full',
          className
        )}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Spacer.displayName = 'Spacer';

// Fixed Spacer with predefined sizes
export interface FixedSpacerProps extends Omit<SpacerProps, 'size' | 'flex'> {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
}

export const FixedSpacer = forwardRef<HTMLDivElement, FixedSpacerProps>(
  ({
    size = 'md',
    direction = 'horizontal',
    className,
    ...props
  }, ref) => {
    const sizeMap = {
      xs: 1,
      sm: 2,
      md: 4,
      lg: 6,
      xl: 8,
      '2xl': 12,
      '3xl': 16,
      '4xl': 20,
      '5xl': 24,
      '6xl': 32,
    };

    const sizeValue = sizeMap[size];
    const sizeClass = direction === 'horizontal' ? `w-${sizeValue}` : `h-${sizeValue}`;

    return (
      <div
        ref={ref}
        className={cn(
          'shrink-0',
          sizeClass,
          className
        )}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

FixedSpacer.displayName = 'FixedSpacer';

// Responsive Spacer
export interface ResponsiveSpacerProps extends SpacerProps {
  responsive?: {
    sm?: number | string;
    md?: number | string;
    lg?: number | string;
    xl?: number | string;
    '2xl'?: number | string;
  };
}

export const ResponsiveSpacer = forwardRef<HTMLDivElement, ResponsiveSpacerProps>(
  ({
    size,
    direction = 'horizontal',
    responsive,
    className,
    ...props
  }, ref) => {
    const getResponsiveClasses = () => {
      if (!responsive) return [];
      
      const classes: string[] = [];
      
      Object.entries(responsive).forEach(([breakpoint, value]) => {
        if (value) {
          const prefix = direction === 'horizontal' ? 'w' : 'h';
          const sizeClass = typeof value === 'number' 
            ? `${prefix}-${value > 96 ? `[${value}px]` : value}`
            : `${prefix}-[${value}]`;
          classes.push(`${breakpoint}:${sizeClass}`);
        }
      });
      
      return classes;
    };

    // Base size class
    const baseSizeClass = size 
      ? (direction === 'horizontal' 
          ? (typeof size === 'number' ? `w-${size > 96 ? `[${size}px]` : size}` : `w-[${size}]`)
          : (typeof size === 'number' ? `h-${size > 96 ? `[${size}px]` : size}` : `h-[${size}]`))
      : (direction === 'horizontal' ? 'w-4' : 'h-4');

    return (
      <div
        ref={ref}
        className={cn(
          'shrink-0',
          baseSizeClass,
          ...getResponsiveClasses(),
          className
        )}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

ResponsiveSpacer.displayName = 'ResponsiveSpacer';

// Auto Spacer (grows to fill available space)
export interface AutoSpacerProps extends Omit<SpacerProps, 'size'> {
  minSize?: number | string;
  maxSize?: number | string;
}

export const AutoSpacer = forwardRef<HTMLDivElement, AutoSpacerProps>(
  ({
    direction = 'horizontal',
    flex = 1,
    minSize,
    maxSize,
    className,
    ...props
  }, ref) => {
    const getMinClass = () => {
      if (!minSize) return '';
      const prefix = direction === 'horizontal' ? 'min-w' : 'min-h';
      return typeof minSize === 'number' 
        ? `${prefix}-${minSize > 96 ? `[${minSize}px]` : minSize}`
        : `${prefix}-[${minSize}]`;
    };

    const getMaxClass = () => {
      if (!maxSize) return '';
      const prefix = direction === 'horizontal' ? 'max-w' : 'max-h';
      return typeof maxSize === 'number' 
        ? `${prefix}-${maxSize > 96 ? `[${maxSize}px]` : maxSize}`
        : `${prefix}-[${maxSize}]`;
    };

    const getFlexClass = () => {
      if (typeof flex === 'number') {
        if (flex === 0) return 'flex-none';
        if (flex === 1) return 'flex-1';
        return `flex-[${flex}]`;
      }
      
      if (typeof flex === 'string') {
        return `flex-[${flex}]`;
      }
      
      return 'flex-1';
    };

    return (
      <div
        ref={ref}
        className={cn(
          getFlexClass(),
          getMinClass(),
          getMaxClass(),
          className
        )}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

AutoSpacer.displayName = 'AutoSpacer';

// Grid Spacer (for use in CSS Grid)
export interface GridSpacerProps {
  colSpan?: number;
  rowSpan?: number;
  className?: string;
}

export const GridSpacer = forwardRef<HTMLDivElement, GridSpacerProps>(
  ({
    colSpan = 1,
    rowSpan = 1,
    className,
    ...props
  }, ref) => {
    const colSpanClass = colSpan > 12 ? `col-span-full` : `col-span-${colSpan}`;
    const rowSpanClass = rowSpan > 6 ? `row-span-full` : `row-span-${rowSpan}`;

    return (
      <div
        ref={ref}
        className={cn(
          colSpanClass,
          rowSpanClass,
          className
        )}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

GridSpacer.displayName = 'GridSpacer';

// Inline Spacer (for inline elements)
export interface InlineSpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const InlineSpacer: React.FC<InlineSpacerProps> = ({
  size = 'md',
  className,
}) => {
  const sizeMap = {
    xs: 'w-1',
    sm: 'w-2', 
    md: 'w-4',
    lg: 'w-6',
    xl: 'w-8',
  };

  return (
    <span
      className={cn(
        'inline-block',
        sizeMap[size],
        className
      )}
      aria-hidden="true"
    />
  );
};

InlineSpacer.displayName = 'InlineSpacer';

// Vertical Spacer (shorthand for vertical spacing)
export interface VerticalSpacerProps extends Omit<SpacerProps, 'direction'> {
  /** Fixed vertical direction */
  readonly direction?: 'vertical';
}

export const VerticalSpacer = forwardRef<HTMLDivElement, VerticalSpacerProps>(
  ({ ...props }, ref) => {
    return <Spacer ref={ref} direction="vertical" {...props} />;
  }
);

VerticalSpacer.displayName = 'VerticalSpacer';

// Horizontal Spacer (shorthand for horizontal spacing)
export interface HorizontalSpacerProps extends Omit<SpacerProps, 'direction'> {
  /** Fixed horizontal direction */
  readonly direction?: 'horizontal';
}

export const HorizontalSpacer = forwardRef<HTMLDivElement, HorizontalSpacerProps>(
  ({ ...props }, ref) => {
    return <Spacer ref={ref} direction="horizontal" {...props} />;
  }
);

HorizontalSpacer.displayName = 'HorizontalSpacer';

// Export all components
export default Spacer;
