'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Grid variants
const gridVariants = cva(
  'grid',
  {
    variants: {
      cols: {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        7: 'grid-cols-7',
        8: 'grid-cols-8',
        9: 'grid-cols-9',
        10: 'grid-cols-10',
        11: 'grid-cols-11',
        12: 'grid-cols-12',
        none: 'grid-cols-none',
        subgrid: 'grid-cols-subgrid',
      },
      rows: {
        1: 'grid-rows-1',
        2: 'grid-rows-2',
        3: 'grid-rows-3',
        4: 'grid-rows-4',
        5: 'grid-rows-5',
        6: 'grid-rows-6',
        none: 'grid-rows-none',
        subgrid: 'grid-rows-subgrid',
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
      flow: {
        row: 'grid-flow-row',
        col: 'grid-flow-col',
        dense: 'grid-flow-row-dense',
        'col-dense': 'grid-flow-col-dense',
      },
    },
    defaultVariants: {
      cols: 1,
      rows: 'none',
      gap: 4,
      flow: 'row',
    },
  }
);

// Grid Props
export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  as?: React.ElementType;
  autoFit?: boolean;
  autoFill?: boolean;
  minColWidth?: string;
  maxColWidth?: string;
  gapX?: number | string;
  gapY?: number | string;
  autoRows?: string;
  autoCols?: string;
  dense?: boolean;
  responsive?: {
    sm?: Partial<VariantProps<typeof gridVariants>>;
    md?: Partial<VariantProps<typeof gridVariants>>;
    lg?: Partial<VariantProps<typeof gridVariants>>;
    xl?: Partial<VariantProps<typeof gridVariants>>;
    '2xl'?: Partial<VariantProps<typeof gridVariants>>;
  };
}

// Grid Item variants
const gridItemVariants = cva(
  '',
  {
    variants: {
      colSpan: {
        1: 'col-span-1',
        2: 'col-span-2',
        3: 'col-span-3',
        4: 'col-span-4',
        5: 'col-span-5',
        6: 'col-span-6',
        7: 'col-span-7',
        8: 'col-span-8',
        9: 'col-span-9',
        10: 'col-span-10',
        11: 'col-span-11',
        12: 'col-span-12',
        auto: 'col-auto',
        full: 'col-span-full',
      },
      rowSpan: {
        1: 'row-span-1',
        2: 'row-span-2',
        3: 'row-span-3',
        4: 'row-span-4',
        5: 'row-span-5',
        6: 'row-span-6',
        auto: 'row-auto',
        full: 'row-span-full',
      },
      colStart: {
        1: 'col-start-1',
        2: 'col-start-2',
        3: 'col-start-3',
        4: 'col-start-4',
        5: 'col-start-5',
        6: 'col-start-6',
        7: 'col-start-7',
        8: 'col-start-8',
        9: 'col-start-9',
        10: 'col-start-10',
        11: 'col-start-11',
        12: 'col-start-12',
        13: 'col-start-13',
        auto: 'col-start-auto',
      },
      colEnd: {
        1: 'col-end-1',
        2: 'col-end-2',
        3: 'col-end-3',
        4: 'col-end-4',
        5: 'col-end-5',
        6: 'col-end-6',
        7: 'col-end-7',
        8: 'col-end-8',
        9: 'col-end-9',
        10: 'col-end-10',
        11: 'col-end-11',
        12: 'col-end-12',
        13: 'col-end-13',
        auto: 'col-end-auto',
      },
      rowStart: {
        1: 'row-start-1',
        2: 'row-start-2',
        3: 'row-start-3',
        4: 'row-start-4',
        5: 'row-start-5',
        6: 'row-start-6',
        7: 'row-start-7',
        auto: 'row-start-auto',
      },
      rowEnd: {
        1: 'row-end-1',
        2: 'row-end-2',
        3: 'row-end-3',
        4: 'row-end-4',
        5: 'row-end-5',
        6: 'row-end-6',
        7: 'row-end-7',
        auto: 'row-end-auto',
      },
    },
    defaultVariants: {
      colSpan: 'auto',
      rowSpan: 'auto',
    },
  }
);

// Grid Item Props
export interface GridItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridItemVariants> {
  as?: React.ElementType;
  area?: string;
  justifySelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch';
  alignSelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch';
  order?: number;
}

// Main Grid Component
export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({
    as: Component = 'div',
    cols = 1,
    rows = 'none',
    gap = 4,
    flow = 'row',
    autoFit = false,
    autoFill = false,
    minColWidth = '200px',
    maxColWidth = '1fr',
    gapX,
    gapY,
    autoRows,
    autoCols,
    dense = false,
    responsive,
    className,
    style,
    children,
    ...props
  }, ref) => {
    // Generate custom grid styles
    const customStyles: React.CSSProperties = { ...style };

    // Auto-fit and auto-fill grid
    if (autoFit || autoFill) {
      const repeatFunction = autoFit ? 'auto-fit' : 'auto-fill';
      customStyles.gridTemplateColumns = `repeat(${repeatFunction}, minmax(${minColWidth}, ${maxColWidth}))`;
    }

    // Custom auto-rows and auto-cols
    if (autoRows) {
      customStyles.gridAutoRows = autoRows;
    }
    if (autoCols) {
      customStyles.gridAutoColumns = autoCols;
    }

    // Handle responsive classes
    const responsiveClasses: string[] = [];
    if (responsive) {
      Object.entries(responsive).forEach(([breakpoint, config]) => {
        if (config?.cols) {
          const colClass = `grid-cols-${config.cols}`;
          responsiveClasses.push(`${breakpoint}:${colClass}`);
        }
        if (config?.gap) {
          responsiveClasses.push(`${breakpoint}:gap-${config.gap}`);
        }
      });
    }

    // Handle gap X and Y
    const gapClasses: string[] = [];
    if (gapX !== undefined) {
      gapClasses.push(`gap-x-${gapX}`);
    }
    if (gapY !== undefined) {
      gapClasses.push(`gap-y-${gapY}`);
    }

    return React.createElement(
      Component,
      {
        ref,
        className: cn(
          gridVariants({ 
            cols: autoFit || autoFill ? 'none' : cols,
            rows, 
            gap: (gapX !== undefined || gapY !== undefined) ? 0 : gap,
            flow: dense ? (flow === 'col' ? 'col-dense' : 'dense') : flow
          }),
          ...gapClasses,
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

Grid.displayName = 'Grid';

// Grid Item Component
export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({
    as: Component = 'div',
    colSpan = 'auto',
    rowSpan = 'auto',
    colStart,
    colEnd,
    rowStart,
    rowEnd,
    area,
    justifySelf = 'auto',
    alignSelf = 'auto',
    order,
    className,
    style,
    children,
    ...props
  }, ref) => {
    const customStyles: React.CSSProperties = { ...style };

    // Grid area
    if (area) {
      customStyles.gridArea = area;
    }

    // Justify and align self
    const justifySelfClasses = {
      auto: 'justify-self-auto',
      start: 'justify-self-start',
      end: 'justify-self-end',
      center: 'justify-self-center',
      stretch: 'justify-self-stretch',
    };

    const alignSelfClasses = {
      auto: 'self-auto',
      start: 'self-start',
      end: 'self-end',
      center: 'self-center',
      stretch: 'self-stretch',
    };

    // Order
    if (order !== undefined) {
      if (order >= 1 && order <= 12) {
        customStyles.order = order;
      }
    }

    return React.createElement(
      Component,
      {
        ref,
        className: cn(
          gridItemVariants({ colSpan, rowSpan, colStart, colEnd, rowStart, rowEnd }),
          justifySelfClasses[justifySelf],
          alignSelfClasses[alignSelf],
          className
        ),
        style: customStyles,
        ...props,
      },
      children
    );
  }
);

GridItem.displayName = 'GridItem';

// Auto Grid Component (responsive grid with auto-fit)
export interface AutoGridProps extends Omit<GridProps, 'cols' | 'autoFit' | 'autoFill'> {
  minItemWidth?: string;
  maxItemWidth?: string;
  itemHeight?: string;
}

export const AutoGrid = forwardRef<HTMLDivElement, AutoGridProps>(
  ({
    minItemWidth = '250px',
    maxItemWidth = '1fr',
    itemHeight,
    className,
    ...props
  }, ref) => {
    return (
      <Grid
        ref={ref}
        autoFit={true}
        minColWidth={minItemWidth}
        maxColWidth={maxItemWidth}
        autoRows={itemHeight}
        className={className}
        {...props}
      />
    );
  }
);

AutoGrid.displayName = 'AutoGrid';

// Masonry Grid Component (CSS Grid approximation)
export interface MasonryGridProps extends Omit<GridProps, 'rows' | 'flow'> {
  itemHeight?: 'auto' | string;
  maxRows?: number;
}

export const MasonryGrid = forwardRef<HTMLDivElement, MasonryGridProps>(
  ({
    cols = 3,
    itemHeight = 'auto',
    maxRows = 10,
    className,
    children,
    ...props
  }, ref) => {
    const itemHeightValue = itemHeight === 'auto' ? 'masonry' : itemHeight;

    return (
      <Grid
        ref={ref}
        cols={cols}
        flow="row"
        autoRows={itemHeightValue}
        className={cn(
          'grid-rows-masonry', // This would need custom CSS or JS for true masonry
          className
        )}
        style={{
          gridTemplateRows: `repeat(${maxRows}, min-content)`,
        }}
        {...props}
      >
        {children}
      </Grid>
    );
  }
);

MasonryGrid.displayName = 'MasonryGrid';

// Grid Container with common layouts
export interface GridLayoutProps extends GridProps {
  layout?: 'sidebar' | 'header-footer' | 'holy-grail' | 'cards' | 'dashboard';
}

export const GridLayout = forwardRef<HTMLDivElement, GridLayoutProps>(
  ({
    layout = 'cards',
    className,
    children,
    ...props
  }, ref) => {
    const getLayoutProps = () => {
      switch (layout) {
        case 'sidebar':
          return {
            cols: 'none' as const,
            style: {
              gridTemplateColumns: '250px 1fr',
              gridTemplateAreas: '"sidebar main"',
            },
          };
        case 'header-footer':
          return {
            rows: 'none' as const,
            style: {
              gridTemplateRows: 'auto 1fr auto',
              gridTemplateAreas: '"header" "main" "footer"',
            },
          };
        case 'holy-grail':
          return {
            cols: 'none' as const,
            rows: 'none' as const,
            style: {
              gridTemplateColumns: '200px 1fr 200px',
              gridTemplateRows: 'auto 1fr auto',
              gridTemplateAreas: `
                "header header header"
                "sidebar main aside"
                "footer footer footer"
              `,
            },
          };
        case 'cards':
          return {
            autoFit: true,
            minColWidth: '300px',
          };
        case 'dashboard':
          return {
            cols: 12 as const,
            gap: 6 as const,
            autoRows: 'minmax(100px, auto)',
          };
        default:
          return {};
      }
    };
    
    return (
      <Grid
        ref={ref}
        className={cn(`grid-layout-${layout}`, className)}
        {...getLayoutProps()}
        {...props}
      >
        {children}
      </Grid>
    );
  }
);

GridLayout.displayName = 'GridLayout';

// Export all components
export default Grid;
