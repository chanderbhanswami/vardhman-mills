'use client';

import React, { forwardRef, useState, useCallback, useEffect, useId, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Select variants
const selectVariants = cva(
  [
    'relative flex items-center justify-between w-full px-3 py-2 text-left',
    'border rounded-md text-sm transition-all duration-200 cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted'
  ],
  {
    variants: {
      variant: {
        default: 'border-border bg-background text-gray-900 hover:border-muted-foreground',
        filled: 'border-0 bg-muted text-gray-900 hover:bg-muted/80',
        outlined: 'border-2 border-border bg-transparent text-gray-900 hover:border-primary',
        ghost: 'border-0 bg-transparent text-gray-900 hover:bg-muted'
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        default: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base'
      },
      error: {
        true: 'border-destructive focus:ring-destructive',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      error: false
    }
  }
);

// Dropdown variants
const dropdownVariants = cva(
  [
    'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border',
    'bg-white text-gray-900 shadow-md'
  ],
  {
    variants: {
      position: {
        bottom: 'top-full',
        top: 'bottom-full mb-1'
      }
    },
    defaultVariants: {
      position: 'bottom'
    }
  }
);

// Option variants
const optionVariants = cva(
  [
    'relative flex cursor-pointer select-none items-center px-3 py-2 text-sm',
    'transition-colors focus:outline-none'
  ],
  {
    variants: {
      selected: {
        true: 'bg-primary text-primary-foreground',
        false: 'hover:bg-muted hover:text-muted-foreground'
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
        false: ''
      }
    },
    defaultVariants: {
      selected: false,
      disabled: false
    }
  }
);

// Base types
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
  group?: string;
}

export interface SelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
  Omit<VariantProps<typeof selectVariants>, 'error'> {
  options: SelectOption[];
  value?: string | number | null;
  defaultValue?: string | number;
  onValueChange?: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  loading?: boolean;
  onClear?: () => void;
  onSearch?: (query: string) => void;
  renderOption?: (option: SelectOption, selected: boolean) => React.ReactNode;
  renderValue?: (option: SelectOption | SelectOption[]) => React.ReactNode;
  maxSelections?: number;
  groupBy?: string;
  emptyMessage?: string;
  loadingMessage?: string;
}

export interface MultiSelectProps extends Omit<SelectProps, 'value' | 'onValueChange' | 'multiple'> {
  value?: (string | number)[];
  onValueChange?: (value: (string | number)[]) => void;
  multiple: true;
}

type CombinedSelectProps = SelectProps | MultiSelectProps;

// Select Context
interface SelectContextValue {
  selectedValue: string | number | (string | number)[] | null;
  onSelect: (value: string | number) => void;
  multiple: boolean;
  searchable: boolean;
  renderOption?: (option: SelectOption, selected: boolean) => React.ReactNode;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

export const useSelect = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('useSelect must be used within a Select component');
  }
  return context;
};

// Select Option Component
export interface SelectOptionProps extends React.HTMLAttributes<HTMLDivElement> {
  option: SelectOption;
}

export const SelectOptionComponent = forwardRef<HTMLDivElement, SelectOptionProps>(
  ({ option, className, ...props }, ref) => {
    const { selectedValue, onSelect, multiple, renderOption } = useSelect();

    const isSelected = multiple
      ? Array.isArray(selectedValue) && selectedValue.includes(option.value)
      : selectedValue === option.value;

    const handleSelect = useCallback(() => {
      if (!option.disabled) {
        onSelect(option.value);
      }
    }, [option.disabled, option.value, onSelect]);

    if (renderOption) {
      return (
        <div
          ref={ref}
          onClick={handleSelect}
          className={cn(optionVariants({ selected: isSelected, disabled: option.disabled }), className)}
          {...props}
        >
          {renderOption(option, isSelected)}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        onClick={handleSelect}
        className={cn(optionVariants({ selected: isSelected, disabled: option.disabled }), className)}
        role="button"
        {...props}
      >
        <div className="flex items-center flex-1 space-x-2">
          {option.icon && (
            <div className="flex-shrink-0">
              {option.icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="truncate">{option.label}</div>
            {option.description && (
              <div className="text-xs text-muted-foreground truncate">
                {option.description}
              </div>
            )}
          </div>
        </div>
        {multiple && isSelected && (
          <CheckIcon className="w-4 h-4 flex-shrink-0" />
        )}
      </div>
    );
  }
);

SelectOptionComponent.displayName = 'SelectOption';

// Main Select Component
export const Select = forwardRef<HTMLDivElement, CombinedSelectProps>(
  ({
    className,
    variant,
    size,

    options,
    value,
    defaultValue,
    onValueChange,
    placeholder = 'Select an option...',
    disabled = false,
    clearable = false,
    searchable = false,
    multiple = false,
    label,
    description,
    error,
    required = false,
    loading = false,
    onClear,
    onSearch,
    renderOption,
    renderValue,
    maxSelections,
    emptyMessage = 'No options found',
    loadingMessage = 'Loading...',
    ...props
  }, ref) => {
    const selectId = useId();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedValue, setSelectedValue] = useState<string | number | (string | number)[] | null>(
      multiple ? (value as (string | number)[]) || [] : value || defaultValue || null
    );
    const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');

    const selectRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => selectRef.current!);

    // Update internal state when value prop changes
    useEffect(() => {
      if (multiple) {
        setSelectedValue((value as (string | number)[]) || []);
      } else {
        setSelectedValue(value || null);
      }
    }, [value, multiple]);

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
      if (!searchable || !searchQuery) return options;

      return options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [options, searchQuery, searchable]);

    // Group options if needed
    const groupedOptions = useMemo(() => {
      const groups: Record<string, SelectOption[]> = {};

      filteredOptions.forEach((option: SelectOption) => {
        const group = option.group || 'default';
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(option);
      });

      return groups;
    }, [filteredOptions]);

    // Handle option selection
    const handleSelect = useCallback((optionValue: string | number) => {
      if (multiple) {
        const currentValues = selectedValue as (string | number)[] || [];
        let newValues: (string | number)[];

        if (currentValues.includes(optionValue)) {
          newValues = currentValues.filter(v => v !== optionValue);
        } else {
          if (maxSelections && currentValues.length >= maxSelections) {
            return;
          }
          newValues = [...currentValues, optionValue];
        }

        setSelectedValue(newValues);
        (onValueChange as MultiSelectProps['onValueChange'])?.(newValues);
      } else {
        setSelectedValue(optionValue);
        if (onValueChange && !multiple) {
          (onValueChange as SelectProps['onValueChange'])?.(optionValue);
        }
        setIsOpen(false);
      }
    }, [selectedValue, multiple, maxSelections, onValueChange]);

    // Handle clear
    const handleClear = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();

      if (multiple) {
        const newValue: (string | number)[] = [];
        setSelectedValue(newValue);
        (onValueChange as MultiSelectProps['onValueChange'])?.(newValue);
      } else {
        setSelectedValue(null);
        // Don't call onValueChange for null values in single select
      }

      onClear?.();
    }, [multiple, onValueChange, onClear]);

    // Handle search
    const handleSearch = useCallback((query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
    }, [onSearch]);

    // Calculate dropdown position
    const calculateDropdownPosition = useCallback(() => {
      if (!selectRef.current) return;

      const rect = selectRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      setDropdownPosition(spaceBelow < 200 && spaceAbove > 200 ? 'top' : 'bottom');
    }, []);

    // Handle click outside
    const handleClickOutside = useCallback((event: MouseEvent) => {
      if (
        selectRef.current &&
        dropdownRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }, []);

    // Handle escape key
    const handleEscape = useCallback((event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }, []);

    // Effect for click outside and escape
    useEffect(() => {
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        calculateDropdownPosition();

        // Focus search input if searchable
        if (searchable && searchInputRef.current) {
          setTimeout(() => searchInputRef.current?.focus(), 0);
        }

        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          document.removeEventListener('keydown', handleEscape);
        };
      }
    }, [isOpen, handleClickOutside, handleEscape, calculateDropdownPosition, searchable]);

    // Get selected option(s) for display
    const getSelectedOptions = useCallback(() => {
      if (multiple) {
        const values = selectedValue as (string | number)[];
        return options.filter(option => values.includes(option.value));
      } else {
        return options.find(option => option.value === selectedValue) || null;
      }
    }, [selectedValue, options, multiple]);

    // Render selected value
    const renderSelectedValue = () => {
      const selectedOptions = getSelectedOptions();

      if (renderValue) {
        return renderValue(selectedOptions as SelectOption | SelectOption[]);
      }

      if (multiple) {
        const opts = selectedOptions as SelectOption[];
        if (opts.length === 0) return placeholder;
        if (opts.length === 1) return opts[0].label;
        return `${opts.length} items selected`;
      } else {
        const opt = selectedOptions as SelectOption | null;
        return opt ? opt.label : placeholder;
      }
    };

    const hasValue = multiple
      ? Array.isArray(selectedValue) && selectedValue.length > 0
      : selectedValue !== null && selectedValue !== undefined;

    return (
      <SelectContext.Provider value={{
        selectedValue,
        onSelect: handleSelect,
        multiple,
        searchable,
        renderOption
      }}>
        <div className="w-full">
          {label && (
            <label
              htmlFor={selectId}
              className={cn(
                'block text-sm font-medium mb-1',
                error ? 'text-destructive' : 'text-foreground',
                required && "after:content-['*'] after:text-destructive after:ml-1"
              )}
            >
              {label}
            </label>
          )}

          {description && (
            <p className="text-xs text-muted-foreground mb-2">
              {description}
            </p>
          )}

          <div className="relative">
            <div
              ref={selectRef}
              className={cn(
                selectVariants({ variant, size, error: !!error }),
                isOpen && 'ring-2 ring-primary ring-offset-1',
                className
              )}
              onClick={() => !disabled && setIsOpen(!isOpen)}
              aria-haspopup="listbox"
              aria-controls={`${selectId}-listbox`}
              aria-labelledby={label ? `${selectId}-label` : undefined}
              tabIndex={disabled ? -1 : 0}
              {...props}
            >
              <span className={cn(
                'block truncate',
                !hasValue && 'text-muted-foreground'
              )}>
                {loading ? loadingMessage : renderSelectedValue()}
              </span>

              <div className="flex items-center space-x-1">
                {clearable && hasValue && !disabled && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear selection"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  ref={dropdownRef}
                  className={dropdownVariants({ position: dropdownPosition })}
                  initial={{ opacity: 0, y: dropdownPosition === 'bottom' ? -10 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: dropdownPosition === 'bottom' ? -10 : 10 }}
                  transition={{ duration: 0.15 }}
                  id={`${selectId}-listbox`}
                  role="listbox"
                  aria-multiselectable={multiple ? "true" : "false"}
                >
                  {searchable && (
                    <div className="p-2 border-b border-border">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Search options..."
                        />
                      </div>
                    </div>
                  )}

                  <div className="py-1">
                    {loading ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {loadingMessage}
                      </div>
                    ) : filteredOptions.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {emptyMessage}
                      </div>
                    ) : Object.keys(groupedOptions).length > 1 ? (
                      Object.entries(groupedOptions).map(([group, groupOptions]) => (
                        <div key={group}>
                          {group !== 'default' && (
                            <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                              {group}
                            </div>
                          )}
                          {(groupOptions as SelectOption[]).map((option: SelectOption) => (
                            <SelectOptionComponent
                              key={option.value}
                              option={option}
                            />
                          ))}
                        </div>
                      ))
                    ) : (
                      filteredOptions.map((option: SelectOption) => (
                        <SelectOptionComponent
                          key={option.value}
                          option={option}
                        />
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <p className="text-xs text-destructive mt-1">
              {error}
            </p>
          )}
        </div>
      </SelectContext.Provider>
    );
  }
);

Select.displayName = 'Select';

export default Select;
