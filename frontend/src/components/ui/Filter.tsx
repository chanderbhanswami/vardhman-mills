'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

// Filter variants
// Commented out filterVariants as it's currently unused
/*
const filterVariants = cva(
  'relative inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'bg-background border border-input',
        outline: 'border-2 border-input bg-transparent',
        ghost: 'bg-transparent hover:bg-accent',
        filled: 'bg-muted border-muted',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
*/

// Types
export interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
  disabled?: boolean;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'select' | 'search';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  multiple?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export interface ActiveFilter {
  groupId: string;
  groupLabel: string;
  optionId: string;
  optionLabel: string;
  value: string;
}

export interface FilterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  groups: FilterGroup[];
  activeFilters?: ActiveFilter[];
  onFilterChange?: (filters: ActiveFilter[]) => void;
  onClearAll?: () => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  showActiveCount?: boolean;
  collapsible?: boolean;
  position?: 'sidebar' | 'dropdown' | 'modal';
}

// Context
interface FilterContextType {
  activeFilters: ActiveFilter[];
  onFilterChange: (filters: ActiveFilter[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('Filter components must be used within Filter');
  }
  return context;
};

// Main Filter component
export const Filter: React.FC<FilterProps> = ({
  groups,
  activeFilters = [],
  onFilterChange,
  onClearAll,
  searchable = false,
  searchPlaceholder = 'Search filters...',
  showActiveCount = true,
  collapsible = true,
  position = 'sidebar',
  // variant = 'default',
  // size = 'default',
  className,
  children,
  ...props
}) => {
  const [internalFilters, setInternalFilters] = useState<ActiveFilter[]>(activeFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(groups.filter(g => g.defaultOpen !== false).map(g => g.id))
  );

  const filters = onFilterChange ? activeFilters : internalFilters;

  const handleFilterChange = useCallback((newFilters: ActiveFilter[]) => {
    if (onFilterChange) {
      onFilterChange(newFilters);
    } else {
      setInternalFilters(newFilters);
    }
  }, [onFilterChange]);

  const handleAddFilter = useCallback((groupId: string, optionId: string, value: string) => {
    const group = groups.find(g => g.id === groupId);
    const option = group?.options?.find(o => o.id === optionId);
    
    if (!group || !option) return;

    const newFilter: ActiveFilter = {
      groupId,
      groupLabel: group.label,
      optionId,
      optionLabel: option.label,
      value,
    };

    let newFilters: ActiveFilter[];

    if (group.type === 'radio') {
      // Replace existing filter in this group
      newFilters = filters.filter(f => f.groupId !== groupId);
      newFilters.push(newFilter);
    } else {
      // Add filter (for checkbox, etc.)
      const existingIndex = filters.findIndex(f => f.groupId === groupId && f.optionId === optionId);
      if (existingIndex >= 0) {
        newFilters = [...filters];
        newFilters[existingIndex] = newFilter;
      } else {
        newFilters = [...filters, newFilter];
      }
    }

    handleFilterChange(newFilters);
  }, [filters, groups, handleFilterChange]);

  const handleRemoveFilter = useCallback((groupId: string, optionId: string) => {
    const newFilters = filters.filter(f => !(f.groupId === groupId && f.optionId === optionId));
    handleFilterChange(newFilters);
  }, [filters, handleFilterChange]);

  const handleClearAll = useCallback(() => {
    handleFilterChange([]);
    onClearAll?.();
  }, [handleFilterChange, onClearAll]);

  const toggleGroup = useCallback((groupId: string) => {
    setOpenGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  const filteredGroups = searchTerm
    ? groups.filter(group => 
        group.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.options?.some(option => 
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : groups;

  const contextValue: FilterContextType = {
    activeFilters: filters,
    onFilterChange: handleFilterChange,
    searchTerm,
    setSearchTerm,
  };

  const containerClassName = cn(
    'space-y-4',
    position === 'sidebar' && 'w-64',
    position === 'dropdown' && 'min-w-64 max-w-sm',
    position === 'modal' && 'w-full max-w-2xl',
    className
  );

  return (
    <FilterContext.Provider value={contextValue}>
      <div className={containerClassName} {...props}>
        {/* Header with search and clear */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg">Filters</h3>
            {showActiveCount && filters.length > 0 && (
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                {filters.length}
              </span>
            )}
          </div>
          {filters.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Search */}
        {searchable && (
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}

        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {filters.map((filter) => (
                  <motion.div
                    key={`${filter.groupId}-${filter.optionId}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs"
                  >
                    <span>{filter.optionLabel}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFilter(filter.groupId, filter.optionId)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                      aria-label={`Remove ${filter.optionLabel} filter`}
                      title={`Remove ${filter.optionLabel} filter`}
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Filter Groups */}
        <div className="space-y-4">
          {filteredGroups.map((group) => (
            <FilterGroup
              key={group.id}
              group={group}
              isOpen={openGroups.has(group.id)}
              onToggle={() => collapsible && toggleGroup(group.id)}
              onAddFilter={handleAddFilter}
              onRemoveFilter={handleRemoveFilter}
              collapsible={collapsible}
            />
          ))}
        </div>

        {children}
      </div>
    </FilterContext.Provider>
  );
};

// Filter Group Component
interface FilterGroupProps {
  group: FilterGroup;
  isOpen: boolean;
  onToggle: () => void;
  onAddFilter: (groupId: string, optionId: string, value: string) => void;
  onRemoveFilter: (groupId: string, optionId: string) => void;
  collapsible: boolean;
}

const FilterGroup: React.FC<FilterGroupProps> = ({
  group,
  isOpen,
  onToggle,
  onAddFilter,
  onRemoveFilter,
  collapsible,
}) => {
  const { activeFilters } = useFilterContext();
  const [rangeValue, setRangeValue] = useState([group.min || 0, group.max || 100]);
  const [searchValue, setSearchValue] = useState('');

  const groupFilters = activeFilters.filter(f => f.groupId === group.id);

  const handleOptionChange = (optionId: string, checked: boolean) => {
    const option = group.options?.find(o => o.id === optionId);
    if (!option) return;

    if (checked) {
      onAddFilter(group.id, optionId, option.value);
    } else {
      onRemoveFilter(group.id, optionId);
    }
  };

  const handleRangeChange = (value: number[]) => {
    setRangeValue(value);
    // Create a filter for range
    onAddFilter(group.id, 'range', `${value[0]}-${value[1]}`);
  };

  const handleSearchSubmit = () => {
    if (searchValue.trim()) {
      onAddFilter(group.id, 'search', searchValue.trim());
      setSearchValue('');
    }
  };

  return (
    <div className="border border-border rounded-lg p-4">
      {/* Group Header */}
      <div 
        className={cn(
          'flex items-center justify-between',
          collapsible && 'cursor-pointer'
        )}
        onClick={collapsible ? onToggle : undefined}
      >
        <h4 className="font-medium text-sm">{group.label}</h4>
        {collapsible && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        )}
      </div>

      {/* Group Content */}
      <AnimatePresence>
        {(!collapsible || isOpen) && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-2"
          >
            {/* Checkbox/Radio Options */}
            {(group.type === 'checkbox' || group.type === 'radio') && group.options && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {group.options.map((option) => {
                  const isChecked = groupFilters.some(f => f.optionId === option.id);
                  return (
                    <label
                      key={option.id}
                      className={cn(
                        'flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded px-2 py-1',
                        option.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <input
                        type={group.type === 'radio' ? 'radio' : 'checkbox'}
                        name={group.type === 'radio' ? group.id : undefined}
                        checked={isChecked}
                        onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                        disabled={option.disabled}
                        className="w-4 h-4"
                      />
                      <span className="flex-1 text-sm">{option.label}</span>
                      {option.count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({option.count})
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {/* Range Slider */}
            {group.type === 'range' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{rangeValue[0]}</span>
                  <span>{rangeValue[1]}</span>
                </div>
                <input
                  type="range"
                  min={group.min}
                  max={group.max}
                  aria-label={`${group.label} range filter`}
                  title={`${group.label} range filter`}
                  step={group.step || 1}
                  value={rangeValue[0]}
                  onChange={(e) => handleRangeChange([parseInt(e.target.value), rangeValue[1]])}
                  className="w-full"
                />
              </div>
            )}

            {/* Select Dropdown */}
            {group.type === 'select' && group.options && (
              <select
                className="w-full p-2 border border-input rounded-md text-sm"
                aria-label={`${group.label} select filter`}
                title={`${group.label} select filter`}
                onChange={(e) => {
                  const option = group.options?.find(o => o.id === e.target.value);
                  if (option) {
                    onAddFilter(group.id, option.id, option.value);
                  }
                }}
              >
                <option value="">Select...</option>
                {group.options.map((option) => (
                  <option key={option.id} value={option.id} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {/* Search Input */}
            {group.type === 'search' && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={group.placeholder || 'Search...'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  className="flex-1 p-2 border border-input rounded-md text-sm"
                />
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  aria-label="Search filters"
                  title="Search filters"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Quick Filter Buttons
interface QuickFilterProps {
  filters: Array<{
    label: string;
    action: () => void;
    active?: boolean;
  }>;
  className?: string;
}

export const QuickFilter: React.FC<QuickFilterProps> = ({ filters, className }) => {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {filters.map((filter, index) => (
        <button
          key={index}
          type="button"
          onClick={filter.action}
          className={cn(
            'px-3 py-1 rounded-full text-sm border transition-colors',
            filter.active
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground border-input hover:bg-accent'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

// Filter Modal
interface FilterModalProps extends FilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: ActiveFilter[]) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  ...filterProps
}) => {
  const [tempFilters, setTempFilters] = useState<ActiveFilter[]>(filterProps.activeFilters || []);

  const handleApply = () => {
    onApply(tempFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background border border-border rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close filters"
            title="Close filters"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          <Filter
            {...filterProps}
            activeFilters={tempFilters}
            onFilterChange={setTempFilters}
            position="modal"
          />
        </div>
        
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-input rounded-md hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

Filter.displayName = 'Filter';
QuickFilter.displayName = 'QuickFilter';
FilterModal.displayName = 'FilterModal';

export default Filter;
