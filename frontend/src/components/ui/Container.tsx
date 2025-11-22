'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Container variants
const containerVariants = cva(
  'relative',
  {
    variants: {
      size: {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        full: 'max-w-full',
        none: '',
      },
      padding: {
        none: '',
        xs: 'px-2 py-1',
        sm: 'px-3 py-2',
        md: 'px-4 py-3',
        lg: 'px-6 py-4',
        xl: 'px-8 py-6',
        '2xl': 'px-12 py-8',
      },
      margin: {
        none: '',
        xs: 'm-2',
        sm: 'm-3',
        md: 'm-4',
        lg: 'm-6',
        xl: 'm-8',
        auto: 'mx-auto',
      },
      variant: {
        default: '',
        bordered: 'border border-border',
        shadow: 'shadow-sm',
        'shadow-md': 'shadow-md',
        'shadow-lg': 'shadow-lg',
        'shadow-xl': 'shadow-xl',
        rounded: 'rounded-lg',
        'rounded-xl': 'rounded-xl',
        'rounded-2xl': 'rounded-2xl',
        card: 'bg-card text-card-foreground border border-border rounded-lg shadow-sm',
      },
      centered: {
        true: 'mx-auto',
        false: '',
      },
      fullHeight: {
        true: 'min-h-screen',
        false: '',
      },
    },
    defaultVariants: {
      size: 'full',
      padding: 'md',
      margin: 'none',
      variant: 'default',
      centered: false,
      fullHeight: false,
    },
  }
);

// Container Props
export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  as?: React.ElementType;
  fluid?: boolean;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  background?: 'transparent' | 'default' | 'muted' | 'accent' | 'primary' | 'secondary';
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  zIndex?: number;
}

// Background variants
const backgroundVariants = {
  transparent: 'bg-transparent',
  default: 'bg-background',
  muted: 'bg-muted',
  accent: 'bg-accent',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
};

// Overflow variants
const overflowVariants = {
  visible: 'overflow-visible',
  hidden: 'overflow-hidden',
  scroll: 'overflow-scroll',
  auto: 'overflow-auto',
};

// Position variants
const positionVariants = {
  static: 'static',
  relative: 'relative',
  absolute: 'absolute',
  fixed: 'fixed',
  sticky: 'sticky',
};

// Main Container Component
export const Container = forwardRef<HTMLElement, ContainerProps>(
  ({
    as: Component = 'div',
    size = 'full',
    padding = 'md',
    margin = 'none',
    variant = 'default',
    centered = false,
    fullHeight = false,
    fluid = false,
    breakpoint,
    background = 'transparent',
    overflow = 'visible',
    position = 'relative',
    zIndex,
    className,
    style,
    children,
    ...props
  }, ref) => {
    // Handle fluid containers
    const finalSize = fluid ? 'full' : size;
    
    // Handle breakpoint-specific max widths
    let breakpointClass = '';
    if (breakpoint && !fluid) {
      const breakpointSizes = {
        sm: 'sm:max-w-sm',
        md: 'md:max-w-md',
        lg: 'lg:max-w-lg',
        xl: 'xl:max-w-xl',
        '2xl': '2xl:max-w-2xl',
      };
      breakpointClass = breakpointSizes[breakpoint];
    }

    return React.createElement(
      Component,
      {
        ref,
        className: cn(
          containerVariants({ 
            size: finalSize, 
            padding, 
            margin, 
            variant, 
            centered, 
            fullHeight 
          }),
          backgroundVariants[background],
          overflowVariants[overflow],
          positionVariants[position],
          breakpointClass,
          className
        ),
        style: {
          ...(zIndex && { zIndex }),
          ...style,
        },
        ...props,
      },
      children
    );
  }
);

Container.displayName = 'Container';

// Flex Container Component
export interface FlexContainerProps extends ContainerProps {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const FlexContainer = forwardRef<HTMLElement, FlexContainerProps>(
  ({
    direction = 'row',
    wrap = 'nowrap',
    justify = 'start',
    align = 'stretch',
    gap = 'none',
    className,
    ...props
  }, ref) => {
    const flexClasses = {
      direction: {
        row: 'flex-row',
        col: 'flex-col',
        'row-reverse': 'flex-row-reverse',
        'col-reverse': 'flex-col-reverse',
      },
      wrap: {
        wrap: 'flex-wrap',
        nowrap: 'flex-nowrap',
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
      gap: {
        none: '',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
        '2xl': 'gap-12',
      },
    };

    return (
      <Container
        ref={ref}
        className={cn(
          'flex',
          flexClasses.direction[direction],
          flexClasses.wrap[wrap],
          flexClasses.justify[justify],
          flexClasses.align[align],
          flexClasses.gap[gap],
          className
        )}
        {...props}
      />
    );
  }
);

FlexContainer.displayName = 'FlexContainer';

// Grid Container Component
export interface GridContainerProps extends ContainerProps {
  cols?: number | 'none' | 'subgrid';
  rows?: number | 'none' | 'subgrid';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  gapX?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  gapY?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  autoFit?: boolean;
  autoFill?: boolean;
  minColWidth?: string;
}

export const GridContainer = forwardRef<HTMLElement, GridContainerProps>(
  ({
    cols = 1,
    rows = 'none',
    gap = 'none',
    gapX,
    gapY,
    autoFit = false,
    autoFill = false,
    minColWidth = '200px',
    className,
    style,
    ...props
  }, ref) => {
    const gapClasses = {
      none: '',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-12',
    };

    const gapXClasses = {
      none: '',
      xs: 'gap-x-1',
      sm: 'gap-x-2',
      md: 'gap-x-4',
      lg: 'gap-x-6',
      xl: 'gap-x-8',
      '2xl': 'gap-x-12',
    };

    const gapYClasses = {
      none: '',
      xs: 'gap-y-1',
      sm: 'gap-y-2',
      md: 'gap-y-4',
      lg: 'gap-y-6',
      xl: 'gap-y-8',
      '2xl': 'gap-y-12',
    };

    // Generate grid template columns
    let gridTemplateColumns = '';
    if (autoFit) {
      gridTemplateColumns = `repeat(auto-fit, minmax(${minColWidth}, 1fr))`;
    } else if (autoFill) {
      gridTemplateColumns = `repeat(auto-fill, minmax(${minColWidth}, 1fr))`;
    } else if (typeof cols === 'number') {
      gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    }

    // Generate grid template rows
    let gridTemplateRows = '';
    if (typeof rows === 'number') {
      gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
    }

    const gridStyle = {
      ...(gridTemplateColumns && { gridTemplateColumns }),
      ...(gridTemplateRows && { gridTemplateRows }),
      ...style,
    };

    return (
      <Container
        ref={ref}
        className={cn(
          'grid',
          gapClasses[gap],
          gapX && gapXClasses[gapX],
          gapY && gapYClasses[gapY],
          className
        )}
        style={gridStyle}
        {...props}
      />
    );
  }
);

GridContainer.displayName = 'GridContainer';

// Section Container Component
export interface SectionContainerProps extends ContainerProps {
  tag?: 'section' | 'article' | 'aside' | 'nav' | 'main' | 'header' | 'footer';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const SectionContainer = forwardRef<HTMLElement, SectionContainerProps>(
  ({
    tag = 'section',
    spacing = 'md',
    className,
    ...props
  }, ref) => {
    const spacingClasses = {
      none: '',
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
      xl: 'py-24',
      '2xl': 'py-32',
    };

    return (
      <Container
        ref={ref}
        as={tag}
        className={cn(
          spacingClasses[spacing],
          className
        )}
        {...props}
      />
    );
  }
);

SectionContainer.displayName = 'SectionContainer';

// Responsive Container Component
export interface ResponsiveContainerProps extends ContainerProps {
  sm?: Partial<ContainerProps>;
  md?: Partial<ContainerProps>;
  lg?: Partial<ContainerProps>;
  xl?: Partial<ContainerProps>;
}

export const ResponsiveContainer = forwardRef<HTMLElement, ResponsiveContainerProps>(
  ({
    sm,
    md,
    lg,
    xl,
    className,
    ...baseProps
  }, ref) => {
    const generateResponsiveClasses = (
      breakpoint: string,
      props?: Partial<ContainerProps>
    ) => {
      if (!props) return '';
      
      const classes: string[] = [];
      
      if (props.padding) {
        const paddingMap = {
          none: '',
          xs: 'px-2 py-1',
          sm: 'px-3 py-2',
          md: 'px-4 py-3',
          lg: 'px-6 py-4',
          xl: 'px-8 py-6',
          '2xl': 'px-12 py-8',
        };
        classes.push(`${breakpoint}:${paddingMap[props.padding]}`);
      }
      
      if (props.margin) {
        const marginMap = {
          none: '',
          xs: 'm-2',
          sm: 'm-3',
          md: 'm-4',
          lg: 'm-6',
          xl: 'm-8',
          auto: 'mx-auto',
        };
        classes.push(`${breakpoint}:${marginMap[props.margin]}`);
      }
      
      return classes.join(' ');
    };

    const responsiveClasses = [
      generateResponsiveClasses('sm', sm),
      generateResponsiveClasses('md', md),
      generateResponsiveClasses('lg', lg),
      generateResponsiveClasses('xl', xl),
    ].filter(Boolean).join(' ');

    return (
      <Container
        ref={ref}
        className={cn(className, responsiveClasses)}
        {...baseProps}
      />
    );
  }
);

ResponsiveContainer.displayName = 'ResponsiveContainer';

// Export all components
export default Container;
