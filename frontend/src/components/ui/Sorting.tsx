import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';

// Sorting variants
const sortingVariants = cva(
  'inline-flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-background border border-input hover:bg-accent hover:text-accent-foreground',
        outline: 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground border border-secondary hover:bg-secondary/80',
        filled: 'bg-muted text-muted-foreground border border-muted hover:bg-muted/80',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        default: 'h-9 px-3 text-sm',
        lg: 'h-10 px-4 text-base',
      },
      active: {
        true: 'bg-primary text-primary-foreground hover:bg-primary/90',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      active: false,
    },
  }
);

// Types
export type SortDirection = 'asc' | 'desc' | null;

export interface SortOption {
  key: string;
  label: string;
  defaultDirection?: SortDirection;
  disabled?: boolean;
}

export interface SortingProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
    VariantProps<typeof sortingVariants> {
  field?: string;
  direction?: SortDirection;
  onSort?: (field: string, direction: SortDirection) => void;
  label?: string;
  showIcon?: boolean;
  allowClear?: boolean;
  icons?: {
    asc?: React.ReactNode;
    desc?: React.ReactNode;
    none?: React.ReactNode;
  };
}

export const Sorting = forwardRef<HTMLButtonElement, SortingProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    field = '',
    direction = null,
    onSort,
    label,
    showIcon = true,
    allowClear = true,
    icons = {},
    children,
    onClick,
    ...props
  }, ref) => {
    const isActive = direction !== null;
    const {
      asc: AscIcon = <ChevronUpIcon className="h-4 w-4" />,
      desc: DescIcon = <ChevronDownIcon className="h-4 w-4" />,
      none: NoneIcon = <Bars3BottomLeftIcon className="h-4 w-4 opacity-50" />,
    } = icons;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      
      if (onClick) {
        onClick(event);
        return;
      }

      if (onSort && field) {
        let newDirection: SortDirection;
        
        if (direction === null) {
          newDirection = 'asc';
        } else if (direction === 'asc') {
          newDirection = 'desc';
        } else {
          newDirection = allowClear ? null : 'asc';
        }
        
        onSort(field, newDirection);
      }
    };

    const renderIcon = () => {
      if (!showIcon) return null;
      
      if (direction === 'asc') return AscIcon;
      if (direction === 'desc') return DescIcon;
      return NoneIcon;
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          sortingVariants({ variant, size, active: isActive }),
          className
        )}
        onClick={handleClick}
        aria-label={`Sort by ${label || field} ${
          direction === 'asc' ? 'ascending' : 
          direction === 'desc' ? 'descending' : 
          'unsorted'
        }`}
        {...props}
      >
        <span>{children || label || field}</span>
        {renderIcon()}
      </button>
    );
  }
);

Sorting.displayName = 'Sorting';

// Multi-field sorting component
export interface MultiSortingProps {
  options: SortOption[];
  value?: Array<{ field: string; direction: SortDirection }>;
  onChange?: (sorts: Array<{ field: string; direction: SortDirection }>) => void;
  maxSorts?: number;
  className?: string;
  variant?: VariantProps<typeof sortingVariants>['variant'];
  size?: VariantProps<typeof sortingVariants>['size'];
}

export const MultiSorting: React.FC<MultiSortingProps> = ({
  options,
  value = [],
  onChange,
  maxSorts = 3,
  className,
  variant = 'default',
  size = 'default',
}) => {
  const handleSort = (field: string, direction: SortDirection) => {
    const newSorts = value.filter(sort => sort.field !== field);
    
    if (direction !== null) {
      newSorts.unshift({ field, direction });
      
      // Limit the number of sorts
      if (newSorts.length > maxSorts) {
        newSorts.splice(maxSorts);
      }
    }
    
    onChange?.(newSorts);
  };

  const getSortDirection = (field: string): SortDirection => {
    const sort = value.find(s => s.field === field);
    return sort ? sort.direction : null;
  };

  const getSortIndex = (field: string): number => {
    const index = value.findIndex(s => s.field === field);
    return index >= 0 ? index + 1 : 0;
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const direction = getSortDirection(option.key);
        const sortIndex = getSortIndex(option.key);
        
        return (
          <div key={option.key} className="relative">
            <Sorting
              field={option.key}
              direction={direction}
              onSort={handleSort}
              label={option.label}
              variant={variant}
              size={size}
              disabled={option.disabled}
            />
            {sortIndex > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {sortIndex}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

MultiSorting.displayName = 'MultiSorting';

// Table header sorting component
export interface TableSortProps extends SortingProps {
  column: string;
  currentSort?: { field: string; direction: SortDirection };
  onSortChange?: (field: string, direction: SortDirection) => void;
}

export const TableSort = forwardRef<HTMLButtonElement, TableSortProps>(
  ({
    column,
    currentSort,
    onSortChange,
    className,
    children,
    ...props
  }, ref) => {
    const direction = currentSort?.field === column ? currentSort.direction : null;

    return (
      <Sorting
        ref={ref}
        field={column}
        direction={direction}
        onSort={onSortChange}
        className={cn('w-full justify-start', className)}
        variant="ghost"
        {...props}
      >
        {children}
      </Sorting>
    );
  }
);

TableSort.displayName = 'TableSort';

// Quick sort buttons
export interface QuickSortProps {
  onSort: (field: string, direction: SortDirection) => void;
  options: Array<{ field: string; label: string; direction?: SortDirection }>;
  className?: string;
  variant?: VariantProps<typeof sortingVariants>['variant'];
  size?: VariantProps<typeof sortingVariants>['size'];
}

export const QuickSort: React.FC<QuickSortProps> = ({
  onSort,
  options,
  className,
  variant = 'outline',
  size = 'sm',
}) => {
  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <span className="text-sm text-muted-foreground mr-2">Quick sort:</span>
      {options.map((option) => (
        <button
          key={`${option.field}-${option.direction}`}
          type="button"
          className={cn(
            'inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors',
            size === 'sm' && 'h-6 px-2 text-xs',
            variant === 'ghost' && 'border-transparent bg-transparent'
          )}
          onClick={() => onSort(option.field, option.direction || 'asc')}
        >
          <span>{option.label}</span>
          {option.direction === 'desc' ? (
            <ArrowDownIcon className="h-3 w-3" />
          ) : (
            <ArrowUpIcon className="h-3 w-3" />
          )}
        </button>
      ))}
    </div>
  );
};

QuickSort.displayName = 'QuickSort';

// Sort indicator component
export interface SortIndicatorProps {
  direction: SortDirection;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export const SortIndicator: React.FC<SortIndicatorProps> = ({
  direction,
  className,
  size = 'default',
}) => {
  if (direction === null) return null;

  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <span className={cn('inline-flex items-center', className)}>
      {direction === 'asc' ? (
        <ChevronUpIcon className={iconSize} />
      ) : (
        <ChevronDownIcon className={iconSize} />
      )}
    </span>
  );
};

SortIndicator.displayName = 'SortIndicator';

// Advanced sorting with search and filters
export interface AdvancedSortingProps {
  fields: Array<{
    key: string;
    label: string;
    type?: 'text' | 'number' | 'date';
    sortable?: boolean;
  }>;
  currentSort?: Array<{ field: string; direction: SortDirection }>;
  onSortChange?: (sorts: Array<{ field: string; direction: SortDirection }>) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  className?: string;
}

export const AdvancedSorting: React.FC<AdvancedSortingProps> = ({
  fields,
  currentSort = [],
  onSortChange,
  searchValue = '',
  onSearchChange,
  className,
}) => {
  const sortableFields = fields.filter(field => field.sortable !== false);

  const clearAllSorts = () => {
    onSortChange?.([]);
  };

  const hasSorts = currentSort.length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      {onSearchChange && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
      )}

      {/* Sorting Controls */}
      <div className="flex items-center justify-between">
        <MultiSorting
          options={sortableFields.map(field => ({
            key: field.key,
            label: field.label,
          }))}
          value={currentSort}
          onChange={onSortChange}
          variant="outline"
          size="sm"
        />
        
        {hasSorts && (
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={clearAllSorts}
          >
            Clear all sorts
          </button>
        )}
      </div>

      {/* Active sorts display */}
      {hasSorts && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground">Active sorts:</span>
          {currentSort.map((sort, index) => {
            const field = fields.find(f => f.key === sort.field);
            return (
              <span
                key={sort.field}
                className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded"
              >
                <span>{index + 1}.</span>
                <span>{field?.label || sort.field}</span>
                <SortIndicator direction={sort.direction} size="sm" />
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

AdvancedSorting.displayName = 'AdvancedSorting';

export default Sorting;
