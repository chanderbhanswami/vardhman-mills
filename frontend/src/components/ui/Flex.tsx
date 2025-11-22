'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Flex variants
const flexVariants = cva(
  'flex',
  {
    variants: {
      direction: {
        row: 'flex-row',
        'row-reverse': 'flex-row-reverse',
        col: 'flex-col',
        'col-reverse': 'flex-col-reverse',
      },
      wrap: {
        nowrap: 'flex-nowrap',
        wrap: 'flex-wrap',
        'wrap-reverse': 'flex-wrap-reverse',
      },
      justify: {
        start: 'justify-start',
        end: 'justify-end',
        center: 'justify-center',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
      align: {
        start: 'items-start',
        end: 'items-end',
        center: 'items-center',
        baseline: 'items-baseline',
        stretch: 'items-stretch',
      },
      content: {
        start: 'content-start',
        end: 'content-end',
        center: 'content-center',
        between: 'content-between',
        around: 'content-around',
        evenly: 'content-evenly',
        stretch: 'content-stretch',
      },
      gap: {
        0: 'gap-0',
        px: 'gap-px',
        0.5: 'gap-0.5',
        1: 'gap-1',
        1.5: 'gap-1.5',
        2: 'gap-2',
        2.5: 'gap-2.5',
        3: 'gap-3',
        3.5: 'gap-3.5',
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6',
        7: 'gap-7',
        8: 'gap-8',
        9: 'gap-9',
        10: 'gap-10',
        11: 'gap-11',
        12: 'gap-12',
        14: 'gap-14',
        16: 'gap-16',
        20: 'gap-20',
        24: 'gap-24',
        28: 'gap-28',
        32: 'gap-32',
        36: 'gap-36',
        40: 'gap-40',
        44: 'gap-44',
        48: 'gap-48',
        52: 'gap-52',
        56: 'gap-56',
        60: 'gap-60',
        64: 'gap-64',
        72: 'gap-72',
        80: 'gap-80',
        96: 'gap-96',
      },
    },
    defaultVariants: {
      direction: 'row',
      wrap: 'nowrap',
      justify: 'start',
      align: 'stretch',
      gap: 0,
    },
  }
);

// Flex Props
export interface FlexProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>,
    VariantProps<typeof flexVariants> {
  as?: React.ElementType;
  inline?: boolean;
  gapX?: number | string;
  gapY?: number | string;
  spacing?: number | string;
  spacingX?: number | string;
  spacingY?: number | string;
  center?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  reverse?: boolean;
  responsive?: {
    sm?: Partial<Pick<FlexProps, 'direction' | 'wrap' | 'justify' | 'align' | 'gap'>>;
    md?: Partial<Pick<FlexProps, 'direction' | 'wrap' | 'justify' | 'align' | 'gap'>>;
    lg?: Partial<Pick<FlexProps, 'direction' | 'wrap' | 'justify' | 'align' | 'gap'>>;
    xl?: Partial<Pick<FlexProps, 'direction' | 'wrap' | 'justify' | 'align' | 'gap'>>;
  };
}

// Main Flex component
export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  ({
    as: Component = 'div',
    direction = 'row',
    wrap = 'nowrap',
    justify = 'start',
    align = 'stretch',
    content,
    gap = 0,
    inline = false,
    gapX,
    gapY,
    spacing,
    spacingX,
    spacingY,
    center = false,
    fullWidth = false,
    fullHeight = false,
    reverse = false,
    responsive,
    className,
    children,
    style,
    ...props
  }, ref) => {
    // Handle responsive props
    const getResponsiveClasses = () => {
      if (!responsive) return '';
      
      const breakpoints = ['sm', 'md', 'lg', 'xl'] as const;
      let responsiveClasses = '';
      
      breakpoints.forEach(breakpoint => {
        const config = responsive[breakpoint];
        if (!config) return;
        
        const prefix = breakpoint === 'sm' ? 'sm:' : `${breakpoint}:`;
        
        if (config.direction) {
          responsiveClasses += ` ${prefix}flex-${config.direction === 'col' ? 'col' : config.direction === 'row' ? 'row' : config.direction}`;
        }
        if (config.wrap) {
          responsiveClasses += ` ${prefix}flex-${config.wrap}`;
        }
        if (config.justify) {
          const justifyClass = config.justify === 'start' ? 'justify-start' : 
                              config.justify === 'end' ? 'justify-end' :
                              config.justify === 'center' ? 'justify-center' :
                              config.justify === 'between' ? 'justify-between' :
                              config.justify === 'around' ? 'justify-around' :
                              config.justify === 'evenly' ? 'justify-evenly' : '';
          if (justifyClass) responsiveClasses += ` ${prefix}${justifyClass}`;
        }
        if (config.align) {
          const alignClass = config.align === 'start' ? 'items-start' :
                            config.align === 'end' ? 'items-end' :
                            config.align === 'center' ? 'items-center' :
                            config.align === 'baseline' ? 'items-baseline' :
                            config.align === 'stretch' ? 'items-stretch' : '';
          if (alignClass) responsiveClasses += ` ${prefix}${alignClass}`;
        }
        if (config.gap !== undefined) {
          responsiveClasses += ` ${prefix}gap-${config.gap}`;
        }
      });
      
      return responsiveClasses;
    };

    // Handle custom spacing with inline styles for dynamic values
    const customStyle: React.CSSProperties = { ...style };
    const spacingClasses = [];
    
    // Handle gapX and gapY
    if (gapX !== undefined) {
      spacingClasses.push(`gap-x-${String(gapX)}`);
    }
    if (gapY !== undefined) {
      spacingClasses.push(`gap-y-${String(gapY)}`);
    }
    
    // Handle legacy spacing props
    if (spacingX !== undefined) {
      if (typeof spacingX === 'number') {
        spacingClasses.push(`gap-x-${spacingX}`);
      } else {
        customStyle.columnGap = spacingX;
      }
    }
    if (spacingY !== undefined) {
      if (typeof spacingY === 'number') {
        spacingClasses.push(`gap-y-${spacingY}`);
      } else {
        customStyle.rowGap = spacingY;
      }
    }
    if (spacing !== undefined && !spacingX && !spacingY && !gapX && !gapY) {
      if (typeof spacing === 'number') {
        spacingClasses.push(`gap-${spacing}`);
      } else {
        customStyle.gap = spacing;
      }
    }

    // Determine final direction with reverse
    const finalDirection = reverse
      ? direction === 'row'
        ? 'row-reverse'
        : direction === 'col'
        ? 'col-reverse'
        : direction
      : direction;

    // Determine justify and align for center prop
    const finalJustify = center ? 'center' : justify;
    const finalAlign = center ? 'center' : align;

    const componentProps = {
      ref,
      style: customStyle,
      className: cn(
        inline && 'inline-flex',
        flexVariants({
          direction: finalDirection,
          wrap,
          justify: finalJustify,
          align: finalAlign,
          content: content as "start" | "end" | "center" | "between" | "around" | "evenly" | "stretch" | null | undefined,
          gap: gapX || gapY || spacingX || spacingY || spacing ? 0 : gap,
        }),
        fullWidth && 'w-full',
        fullHeight && 'h-full',
        ...spacingClasses,
        getResponsiveClasses(),
        className
      ),
      ...props,
    };

    return React.createElement(Component, componentProps, children);
  }
);

Flex.displayName = 'Flex';

// Shorthand components
export const Row = forwardRef<HTMLDivElement, Omit<FlexProps, 'direction'>>(
  (props, ref) => <Flex ref={ref} direction="row" {...props} />
);
Row.displayName = 'Row';

export const Column = forwardRef<HTMLDivElement, Omit<FlexProps, 'direction'>>(
  (props, ref) => <Flex ref={ref} direction="col" {...props} />
);
Column.displayName = 'Column';

export const Center = forwardRef<HTMLDivElement, FlexProps>(
  (props, ref) => <Flex ref={ref} center {...props} />
);
Center.displayName = 'Center';

// Stack component (Column with gap)
export const Stack = forwardRef<HTMLDivElement, Omit<FlexProps, 'direction'>>(
  ({ gap = 4, ...props }, ref) => (
    <Flex ref={ref} direction="col" gap={gap} {...props} />
  )
);
Stack.displayName = 'Stack';

// HStack component (Row with gap)
export const HStack = forwardRef<HTMLDivElement, Omit<FlexProps, 'direction'>>(
  ({ gap = 4, ...props }, ref) => (
    <Flex ref={ref} direction="row" gap={gap} {...props} />
  )
);
HStack.displayName = 'HStack';

// VStack component (Column with gap)
export const VStack = forwardRef<HTMLDivElement, Omit<FlexProps, 'direction'>>(
  ({ gap = 4, ...props }, ref) => (
    <Flex ref={ref} direction="col" gap={gap} {...props} />
  )
);
VStack.displayName = 'VStack';

// Spacer component for pushing flex items
export const Spacer: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex-1', className)} aria-hidden="true" />
);

// Wrap component for flex-wrap layouts
export const Wrap = forwardRef<HTMLDivElement, FlexProps>(
  ({ wrap = 'wrap', ...props }, ref) => (
    <Flex ref={ref} wrap={wrap} {...props} />
  )
);
Wrap.displayName = 'Wrap';

export default Flex;