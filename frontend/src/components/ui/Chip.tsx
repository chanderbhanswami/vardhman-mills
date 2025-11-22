'use client';

import React, { forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

// Chip variants
const chipVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500',
        primary: 'bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-500',
        secondary: 'bg-purple-100 text-purple-800 hover:bg-purple-200 focus:ring-purple-500',
        success: 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500',
        warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-500',
        danger: 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      },
      size: {
        xs: 'px-2 py-0.5 text-xs',
        sm: 'px-2.5 py-1 text-sm',
        md: 'px-2.5 py-1.5 text-sm',
        lg: 'px-3 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Chip Props
export interface ChipProps extends VariantProps<typeof chipVariants> {
  children: React.ReactNode;
  removable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  avatar?: React.ReactNode;
  value?: string | React.ReactNode;
  onRemove?: () => void;
  onClick?: () => void;
  onSelectionChange?: (selected: boolean) => void;
  className?: string;
}

// Main Chip Component
export const Chip = forwardRef<HTMLDivElement, ChipProps>(
  ({
    children,
    removable = false,
    selected = false,
    disabled = false,
    icon,
    avatar,
    variant = 'default',
    size = 'md',
    onRemove,
    onClick,
    onSelectionChange,
    className,
    ...props
  }, ref) => {
    const [isSelected, setIsSelected] = useState(selected);
    
    const handleClick = () => {
      if (disabled) return;
      
      if (onSelectionChange) {
        const newSelected = !isSelected;
        setIsSelected(newSelected);
        onSelectionChange(newSelected);
      }
      
      onClick?.();
    };
    
    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled) {
        onRemove?.();
      }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (removable) {
          e.preventDefault();
          onRemove?.();
        }
      }
    };
    
    const isClickable = !!(onClick || onSelectionChange);
    const currentlySelected = onSelectionChange ? isSelected : selected;
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          chipVariants({ variant, size }),
          currentlySelected && 'ring-2 ring-blue-500 ring-offset-1',
          disabled && 'opacity-50 cursor-not-allowed',
          isClickable && !disabled && 'cursor-pointer',
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role={onSelectionChange ? 'checkbox' : isClickable ? 'button' : 'none'}
        aria-checked={onSelectionChange ? currentlySelected : undefined}
        aria-disabled={disabled}
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        {...props}
      >
        {/* Selection indicator */}
        {onSelectionChange && (
          <AnimatePresence>
            {currentlySelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.1 }}
              >
                <CheckIcon className="w-3 h-3" />
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        {/* Avatar */}
        {avatar && (
          <div className="flex-shrink-0">
            {avatar}
          </div>
        )}
        
        {/* Icon */}
        {icon && !avatar && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        
        {/* Content */}
        <span className="truncate">
          {children}
        </span>
        
        {/* Remove button */}
        {removable && (
          <button
            type="button"
            onClick={handleRemove}
            className="flex-shrink-0 ml-1 p-0.5 rounded-full hover:bg-black/10 focus:outline-none focus:bg-black/10 transition-colors"
            aria-label="Remove"
            tabIndex={-1}
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        )}
      </motion.div>
    );
  }
);

Chip.displayName = 'Chip';

// Chip Group Component
export interface ChipGroupProps {
  children?: React.ReactNode;
  value?: string | string[];
  defaultValue?: string | string[];
  multiple?: boolean;
  onValueChange?: (value: string | string[]) => void;
  className?: string;
  chipProps?: Partial<ChipProps>;
}

export const ChipGroup = forwardRef<HTMLDivElement, ChipGroupProps>(
  ({
    children,
    value,
    defaultValue,
    multiple = false,
    onValueChange,
    className,
    chipProps,
    ...props
  }, ref) => {
    const [selectedValues, setSelectedValues] = useState<string[]>(() => {
      if (value !== undefined) {
        return Array.isArray(value) ? value : [value];
      }
      if (defaultValue !== undefined) {
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      }
      return [];
    });
    
    const handleSelectionChange = (chipValue: string, selected: boolean) => {
      let newValues: string[];
      
      if (multiple) {
        if (selected) {
          newValues = [...selectedValues, chipValue];
        } else {
          newValues = selectedValues.filter(v => v !== chipValue);
        }
      } else {
        newValues = selected ? [chipValue] : [];
      }
      
      setSelectedValues(newValues);
      onValueChange?.(multiple ? newValues : newValues[0] || '');
    };
    
    // Create enhanced children with selection logic
    const enhancedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement<ChipProps>(child) && child.type === Chip) {
        const chipValue = child.props.value || child.props.children;
        const isSelected = selectedValues.includes(String(chipValue));
        
        return React.cloneElement(child, {
          ...chipProps,
          ...child.props,
          selected: isSelected,
          onSelectionChange: (selected: boolean) => {
            handleSelectionChange(String(chipValue), selected);
            child.props.onSelectionChange?.(selected);
          },
        });
      }
      return child;
    });
    
    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap gap-2', className)}
        role="group"
        {...props}
      >
        {enhancedChildren}
      </div>
    );
  }
);

ChipGroup.displayName = 'ChipGroup';

// Tag Cloud Component
export interface TagCloudProps {
  tags: {
    id: string;
    label: string;
    count?: number;
    weight?: number;
    color?: string;
  }[];
  onTagClick?: (tag: { id: string; label: string; count?: number; weight?: number; color?: string }) => void;
  maxTags?: number;
  sortBy?: 'alphabetical' | 'count' | 'weight';
  className?: string;
}

export const TagCloud = forwardRef<HTMLDivElement, TagCloudProps>(
  ({
    tags,
    onTagClick,
    maxTags = 50,
    sortBy = 'count',
    className,
    ...props
  }, ref) => {
    // Sort tags
    const sortedTags = [...tags]
      .sort((a, b) => {
        switch (sortBy) {
          case 'alphabetical':
            return a.label.localeCompare(b.label);
          case 'count':
            return (b.count || 0) - (a.count || 0);
          case 'weight':
            return (b.weight || 0) - (a.weight || 0);
          default:
            return 0;
        }
      })
      .slice(0, maxTags);
    
    // Calculate font sizes based on weight/count
    const maxValue = Math.max(...sortedTags.map(tag => tag.weight || tag.count || 1));
    const minValue = Math.min(...sortedTags.map(tag => tag.weight || tag.count || 1));
    
    const getFontSize = (value: number) => {
      if (maxValue === minValue) return 'text-base';
      
      const ratio = (value - minValue) / (maxValue - minValue);
      const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
      const index = Math.floor(ratio * (sizes.length - 1));
      return sizes[index];
    };
    
    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap gap-2 justify-center', className)}
        {...props}
      >
        {sortedTags.map((tag) => {
          const value = tag.weight || tag.count || 1;
          const fontSize = getFontSize(value);
          
          return (
            <Chip
              key={tag.id}
              variant="outline"
              className={cn(
                fontSize,
                'transition-all duration-200 hover:scale-110',
                tag.color && `bg-${tag.color}-100 text-${tag.color}-800 border-${tag.color}-300`
              )}
              onClick={() => onTagClick?.(tag)}
            >
              {tag.label}
              {tag.count && (
                <span className="ml-1 text-xs opacity-70">
                  ({tag.count})
                </span>
              )}
            </Chip>
          );
        })}
      </div>
    );
  }
);

TagCloud.displayName = 'TagCloud';

// Filter Chips Component
export interface FilterChipsProps {
  filters: {
    id: string;
    label: string;
    active?: boolean;
    count?: number;
  }[];
  onFilterChange?: (filterId: string, active: boolean) => void;
  onClearAll?: () => void;
  showClearAll?: boolean;
  className?: string;
}

export const FilterChips = forwardRef<HTMLDivElement, FilterChipsProps>(
  ({
    filters,
    onFilterChange,
    onClearAll,
    showClearAll = true,
    className,
    ...props
  }, ref) => {
    const activeFilters = filters.filter(filter => filter.active);
    
    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap gap-2 items-center', className)}
        {...props}
      >
        {filters.map((filter) => (
          <Chip
            key={filter.id}
            variant={filter.active ? 'primary' : 'outline'}
            onClick={() => onFilterChange?.(filter.id, !filter.active)}
            className="transition-all duration-200"
          >
            {filter.label}
            {filter.count !== undefined && (
              <span className="ml-1 text-xs">
                ({filter.count})
              </span>
            )}
          </Chip>
        ))}
        
        {showClearAll && activeFilters.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-gray-600 hover:text-gray-800 underline ml-2"
          >
            Clear all
          </button>
        )}
      </div>
    );
  }
);

FilterChips.displayName = 'FilterChips';

// Status Chip Component
export interface StatusChipProps extends Omit<ChipProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'error';
  showDot?: boolean;
}

export const StatusChip = forwardRef<HTMLDivElement, StatusChipProps>(
  ({
    status,
    showDot = true,
    children,
    ...props
  }, ref) => {
    const statusConfig = {
      active: { variant: 'success' as const, label: 'Active', color: 'bg-green-500' },
      inactive: { variant: 'default' as const, label: 'Inactive', color: 'bg-gray-500' },
      pending: { variant: 'warning' as const, label: 'Pending', color: 'bg-yellow-500' },
      completed: { variant: 'success' as const, label: 'Completed', color: 'bg-green-500' },
      cancelled: { variant: 'danger' as const, label: 'Cancelled', color: 'bg-red-500' },
      error: { variant: 'danger' as const, label: 'Error', color: 'bg-red-500' },
    };
    
    const config = statusConfig[status];
    
    return (
      <Chip
        ref={ref}
        variant={config.variant}
        icon={showDot && (
          <div className={cn('w-2 h-2 rounded-full', config.color)} />
        )}
        {...props}
      >
        {children || config.label}
      </Chip>
    );
  }
);

StatusChip.displayName = 'StatusChip';

export default Chip;
