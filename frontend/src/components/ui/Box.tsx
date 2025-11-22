'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Box variants
const boxVariants = cva(
  'block',
  {
    variants: {
      display: {
        block: 'block',
        'inline-block': 'inline-block',
        inline: 'inline',
        flex: 'flex',
        'inline-flex': 'inline-flex',
        grid: 'grid',
        'inline-grid': 'inline-grid',
        hidden: 'hidden',
        contents: 'contents',
      },
      position: {
        static: 'static',
        relative: 'relative',
        absolute: 'absolute',
        fixed: 'fixed',
        sticky: 'sticky',
      },
      overflow: {
        visible: 'overflow-visible',
        hidden: 'overflow-hidden',
        scroll: 'overflow-scroll',
        auto: 'overflow-auto',
        'x-hidden': 'overflow-x-hidden',
        'y-hidden': 'overflow-y-hidden',
        'x-scroll': 'overflow-x-scroll',
        'y-scroll': 'overflow-y-scroll',
        'x-auto': 'overflow-x-auto',
        'y-auto': 'overflow-y-auto',
      },
      backgroundVariant: {
        none: '',
        transparent: 'bg-transparent',
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        accent: 'bg-accent text-accent-foreground',
        muted: 'bg-muted text-muted-foreground',
        background: 'bg-background text-foreground',
        card: 'bg-card text-card-foreground',
        popover: 'bg-popover text-popover-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white',
      },
      borderVariant: {
        none: '',
        default: 'border border-border',
        primary: 'border border-primary',
        secondary: 'border border-secondary',
        accent: 'border border-accent',
        muted: 'border border-muted',
        destructive: 'border border-destructive',
        success: 'border border-green-500',
        warning: 'border border-yellow-500',
        info: 'border border-blue-500',
      },
      borderRadius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
      },
      shadow: {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
        '2xl': 'shadow-2xl',
        inner: 'shadow-inner',
      },
    },
    defaultVariants: {
      display: 'block',
      position: 'static',
      overflow: 'visible',
      backgroundVariant: 'none',
      borderVariant: 'none',
      borderRadius: 'none',
      shadow: 'none',
    },
  }
);

// Spacing type
type SpacingValue = 
  | 0 | 'px' | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 14 | 16 | 20 | 24 | 28 | 32 | 36 | 40 | 44 | 48 | 52 | 56 | 60 | 64
  | 72 | 80 | 96 | 'auto';

// Box Props
export interface BoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boxVariants> {
  as?: React.ElementType;
  
  // Spacing
  m?: SpacingValue;
  mx?: SpacingValue;
  my?: SpacingValue;
  mt?: SpacingValue;
  mr?: SpacingValue;
  mb?: SpacingValue;
  ml?: SpacingValue;
  p?: SpacingValue;
  px?: SpacingValue;
  py?: SpacingValue;
  pt?: SpacingValue;
  pr?: SpacingValue;
  pb?: SpacingValue;
  pl?: SpacingValue;
  
  // Sizing
  w?: string | number;
  h?: string | number;
  minW?: string | number;
  maxW?: string | number;
  minH?: string | number;
  maxH?: string | number;
  
  // Layout
  zIndex?: number;
  cursor?: 'auto' | 'default' | 'pointer' | 'wait' | 'text' | 'move' | 'help' | 'not-allowed';
  userSelect?: 'none' | 'text' | 'all' | 'auto';
  pointerEvents?: 'none' | 'auto';
  
  // Responsive
  responsive?: {
    sm?: Partial<BoxProps>;
    md?: Partial<BoxProps>;
    lg?: Partial<BoxProps>;
    xl?: Partial<BoxProps>;
    '2xl'?: Partial<BoxProps>;
  };
  
  // Animation
  transition?: boolean;
  transitionDuration?: 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000;
  
  // Transform
  transform?: string;
  rotate?: number;
  scale?: number;
  translateX?: number;
  translateY?: number;
}

// Utility function to convert spacing values to Tailwind classes
const getSpacingClass = (property: string, value?: SpacingValue): string => {
  if (value === undefined) return '';
  return `${property}-${value}`;
};

// Utility function to convert size values
const getSizeValue = (value?: string | number): string | number | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return `${value}px`;
  return value;
};

// Main Box Component
export const Box = forwardRef<HTMLElement, BoxProps>(
  ({
    as: Component = 'div',
    display = 'block',
    position = 'static',
    overflow = 'visible',
    backgroundVariant = 'none',
    borderVariant = 'none',
    borderRadius = 'none',
    shadow = 'none',
    
    // Spacing props
    m, mx, my, mt, mr, mb, ml,
    p, px, py, pt, pr, pb, pl,
    
    // Size props
    w, h, minW, maxW, minH, maxH,
    
    // Layout props
    zIndex,
    cursor,
    userSelect,
    pointerEvents,
    
    // Animation props
    transition = false,
    transitionDuration,
    
    // Transform props
    transform,
    rotate,
    scale,
    translateX,
    translateY,
    
    responsive,
    className,
    style,
    children,
    ...props
  }, ref) => {
    
    // Generate spacing classes
    const spacingClasses = [
      getSpacingClass('m', m),
      getSpacingClass('mx', mx),
      getSpacingClass('my', my),
      getSpacingClass('mt', mt),
      getSpacingClass('mr', mr),
      getSpacingClass('mb', mb),
      getSpacingClass('ml', ml),
      getSpacingClass('p', p),
      getSpacingClass('px', px),
      getSpacingClass('py', py),
      getSpacingClass('pt', pt),
      getSpacingClass('pr', pr),
      getSpacingClass('pb', pb),
      getSpacingClass('pl', pl),
    ].filter(Boolean);
    
    // Generate size classes
    const sizeClasses: string[] = [];
    if (w !== undefined) {
      if (typeof w === 'string' && w.includes('/')) {
        sizeClasses.push(`w-${w}`);
      } else if (typeof w === 'string') {
        sizeClasses.push(w.startsWith('w-') ? w : `w-[${w}]`);
      } else {
        sizeClasses.push(`w-[${w}px]`);
      }
    }
    
    if (h !== undefined) {
      if (typeof h === 'string' && h.includes('/')) {
        sizeClasses.push(`h-${h}`);
      } else if (typeof h === 'string') {
        sizeClasses.push(h.startsWith('h-') ? h : `h-[${h}]`);
      } else {
        sizeClasses.push(`h-[${h}px]`);
      }
    }
    
    // Min/Max width and height
    if (minW !== undefined) sizeClasses.push(`min-w-[${getSizeValue(minW)}]`);
    if (maxW !== undefined) sizeClasses.push(`max-w-[${getSizeValue(maxW)}]`);
    if (minH !== undefined) sizeClasses.push(`min-h-[${getSizeValue(minH)}]`);
    if (maxH !== undefined) sizeClasses.push(`max-h-[${getSizeValue(maxH)}]`);
    
    // Layout classes
    const layoutClasses: string[] = [];
    if (cursor) layoutClasses.push(`cursor-${cursor}`);
    if (userSelect) layoutClasses.push(`select-${userSelect}`);
    if (pointerEvents) layoutClasses.push(`pointer-events-${pointerEvents}`);
    
    // Animation classes
    const animationClasses: string[] = [];
    if (transition) animationClasses.push('transition-all');
    if (transitionDuration) animationClasses.push(`duration-${transitionDuration}`);
    
    // Transform classes
    const transformClasses: string[] = [];
    if (rotate !== undefined) transformClasses.push(`rotate-${rotate}`);
    if (scale !== undefined) transformClasses.push(`scale-${Math.round(scale * 100)}`);
    if (translateX !== undefined) transformClasses.push(`translate-x-${translateX}`);
    if (translateY !== undefined) transformClasses.push(`translate-y-${translateY}`);
    
    // Responsive classes
    const responsiveClasses: string[] = [];
    if (responsive) {
      Object.entries(responsive).forEach(([breakpoint, config]) => {
        if (config?.display) {
          responsiveClasses.push(`${breakpoint}:${config.display}`);
        }
        if (config?.p) {
          responsiveClasses.push(`${breakpoint}:p-${config.p}`);
        }
        if (config?.m) {
          responsiveClasses.push(`${breakpoint}:m-${config.m}`);
        }
        // Add more responsive properties as needed
      });
    }
    
    // Combine all custom styles
    const customStyles: React.CSSProperties = {
      ...(zIndex !== undefined && { zIndex }),
      ...(transform && { transform }),
      ...style,
    };

    return React.createElement(
      Component,
      {
        ref,
        className: cn(
          boxVariants({
            display,
            position,
            overflow,
            backgroundVariant,
            borderVariant,
            borderRadius,
            shadow,
          }),
          ...spacingClasses,
          ...sizeClasses,
          ...layoutClasses,
          ...animationClasses,
          ...transformClasses,
          ...responsiveClasses,
          className
        ),
        style: customStyles,
        ...props,
      },
      children
    );
  }
);

Box.displayName = 'Box';

// Square Box (equal width and height)
export interface SquareProps extends Omit<BoxProps, 'w' | 'h'> {
  size: string | number;
}

export const Square = forwardRef<HTMLElement, SquareProps>(
  ({ size, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        w={size}
        h={size}
        {...props}
      />
    );
  }
);

Square.displayName = 'Square';

// Circle Box (square with full border radius)
export interface CircleProps extends SquareProps {
  /** Additional styling for circle-specific properties */
  centered?: boolean;
}

export const Circle = forwardRef<HTMLElement, CircleProps>(
  ({ ...props }, ref) => {
    return (
      <Square
        ref={ref}
        borderRadius="full"
        {...props}
      />
    );
  }
);

Circle.displayName = 'Circle';

// Aspect Ratio Box
export interface AspectRatioProps extends Omit<BoxProps, 'h'> {
  ratio: number; // e.g., 16/9, 4/3, 1
  children?: React.ReactNode;
}

export const AspectRatio = forwardRef<HTMLElement, AspectRatioProps>(
  ({ ratio, children, className, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        position="relative"
        className={className}
        {...props}
      >
        <div
          className={`w-full aspect-[${ratio}]`}
        />
        {children && (
          <Box
            position="absolute"
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
          >
            {children}
          </Box>
        )}
      </Box>
    );
  }
);

AspectRatio.displayName = 'AspectRatio';

// Card Box (pre-styled box for cards)
export interface CardBoxProps extends BoxProps {
  padding?: SpacingValue;
  hoverable?: boolean;
}

export const CardBox = forwardRef<HTMLElement, CardBoxProps>(
  ({
    padding = 6,
    hoverable = false,
    borderVariant = 'default',
    borderRadius = 'lg',
    shadow = 'sm',
    backgroundVariant = 'card',
    transition = hoverable,
    className,
    ...props
  }, ref) => {
    return (
      <Box
        ref={ref}
        p={padding}
        borderVariant={borderVariant}
        borderRadius={borderRadius}
        shadow={shadow}
        backgroundVariant={backgroundVariant}
        transition={transition}
        className={cn(
          hoverable && 'hover:shadow-md hover:scale-[1.02]',
          className
        )}
        {...props}
      />
    );
  }
);

CardBox.displayName = 'CardBox';

// Centered Box
export interface CenteredBoxProps extends BoxProps {
  centerContent?: boolean;
}

export const CenteredBox = forwardRef<HTMLElement, CenteredBoxProps>(
  ({
    centerContent = true,
    display = centerContent ? 'flex' : 'block',
    className,
    ...props
  }, ref) => {
    return (
      <Box
        ref={ref}
        display={display}
        className={cn(
          centerContent && 'items-center justify-center',
          className
        )}
        {...props}
      />
    );
  }
);

CenteredBox.displayName = 'CenteredBox';

// Export all components
export default Box;
