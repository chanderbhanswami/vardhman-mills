'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { format, parseISO, isValid } from 'date-fns';
import { debounce } from 'lodash';

// Enhanced filter types and interfaces
export type FilterType = 
  | 'text' 
  | 'select' 
  | 'multiselect' 
  | 'date' 
  | 'daterange' 
  | 'number' 
  | 'numberrange' 
  | 'boolean' 
  | 'radio'
  | 'checkbox'
  | 'autocomplete'
  | 'tags'
  | 'color'
  | 'rating'
  | 'slider'
  | 'custom';

export type FilterOperator = 
  | 'equals' 
  | 'contains' 
  | 'startsWith' 
  | 'endsWith' 
  | 'greaterThan' 
  | 'lessThan' 
  | 'greaterThanOrEqual' 
  | 'lessThanOrEqual'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isNull'
  | 'isNotNull'
  | 'regex';

export type FilterCondition = {
  field: string;
  operator: FilterOperator;
  value: unknown;
  type: FilterType;
};

export type FilterGroup = {
  conditions: FilterCondition[];
  operator: 'AND' | 'OR';
  groups?: FilterGroup[];
};

export type FilterOption = {
  label: string;
  value: unknown;
  count?: number;
  color?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  description?: string;
};

export type FilterField = {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
  multiple?: boolean;
  required?: boolean;
  operators?: FilterOperator[];
  defaultOperator?: FilterOperator;
  min?: number;
  max?: number;
  step?: number;
  format?: string;
  validation?: (value: unknown) => boolean | string;
  transform?: (value: unknown) => unknown;
  searchable?: boolean;
  sortable?: boolean;
  group?: string;
  priority?: number;
  width?: 'auto' | 'full' | 'half' | 'third' | 'quarter';
  customComponent?: React.ComponentType<FilterFieldProps>;
};

export type FilterPreset = {
  id: string;
  name: string;
  description?: string;
  filters: FilterGroup;
  icon?: React.ReactNode;
  color?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  tags?: string[];
};

export type FilterFieldProps = {
  field: FilterField;
  value: unknown;
  onChange: (value: unknown) => void;
  onOperatorChange?: (operator: FilterOperator) => void;
  operator?: FilterOperator;
  error?: string;
  disabled?: boolean;
};

export interface FilterFormProps {
  fields: FilterField[];
  filters?: FilterGroup;
  presets?: FilterPreset[];
  onFiltersChange?: (filters: FilterGroup) => void;
  onPresetSave?: (preset: Omit<FilterPreset, 'id'>) => void;
  onPresetLoad?: (preset: FilterPreset) => void;
  onPresetDelete?: (presetId: string) => void;
  className?: string;
  title?: string;
  description?: string;
  showPresets?: boolean;
  showAdvanced?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  showSavePreset?: boolean;
  showClear?: boolean;
  showApply?: boolean;
  showCount?: boolean;
  showTags?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  maxHeight?: string;
  debounceMs?: number;
  theme?: 'default' | 'compact' | 'detailed';
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
  responsive?: boolean;
  children?: React.ReactNode;
}

// Built-in filter components
const TextFilter: React.FC<FilterFieldProps> = ({ field, value, onChange, error, disabled }) => {
  const [inputValue, setInputValue] = useState(value?.toString() || '');

  const debouncedChange = useMemo(
    () => debounce((val: string) => onChange(val), 300),
    [onChange]
  );

  useEffect(() => {
    debouncedChange(inputValue);
  }, [inputValue, debouncedChange]);

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={field.placeholder || `Filter by ${field.label}`}
        disabled={disabled}
        className={clsx(
          'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
          {
            'border-red-300 focus:ring-red-500 focus:border-red-500': error,
            'bg-gray-50 text-gray-500 cursor-not-allowed': disabled
          }
        )}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

const SelectFilter: React.FC<FilterFieldProps> = ({ field, value, onChange, error, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedOptions = useMemo(() => {
    if (!value) return [];
    const values = Array.isArray(value) ? value : [value];
    return field.options?.filter(option => values.includes(option.value)) || [];
  }, [value, field.options]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return field.options || [];
    return field.options?.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [field.options, searchTerm]);

  const handleSelect = (option: FilterOption) => {
    if (field.multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter(v => v !== option.value)
        : [...currentValues, option.value];
      onChange(newValues);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex items-center justify-between',
          {
            'border-red-300 focus:ring-red-500 focus:border-red-500': error,
            'bg-gray-50 text-gray-500 cursor-not-allowed': disabled
          }
        )}
      >
        <span className="truncate">
          {selectedOptions.length > 0 
            ? selectedOptions.map(opt => opt.label).join(', ')
            : field.placeholder || `Select ${field.label}`
          }
        </span>
        <ChevronDownIcon className={clsx('w-4 h-4 transition-transform', {
          'transform rotate-180': isOpen
        })} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden"
          >
            {field.searchable && (
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search options..."
                    aria-label="Search filter options"
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.map((option) => (
                <button
                  key={option.value?.toString()}
                  type="button"
                  onClick={() => handleSelect(option)}
                  disabled={option.disabled}
                  className={clsx(
                    'w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between transition-colors',
                    {
                      'bg-blue-50 text-blue-700': selectedOptions.some(selected => selected.value === option.value),
                      'text-gray-400 cursor-not-allowed': option.disabled
                    }
                  )}
                >
                  <div className="flex items-center">
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="ml-2 text-xs text-gray-500">{option.description}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    {option.count !== undefined && (
                      <span className="text-xs text-gray-500 mr-2">({option.count})</span>
                    )}
                    {selectedOptions.some(selected => selected.value === option.value) && (
                      <CheckIcon className="w-4 h-4" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

const DateFilter: React.FC<FilterFieldProps> = ({ value, onChange, error, disabled }) => {
  const [inputValue, setInputValue] = useState(() => {
    if (value && typeof value === 'string') {
      try {
        const date = parseISO(value);
        return isValid(date) ? format(date, 'yyyy-MM-dd') : '';
      } catch {
        return '';
      }
    }
    return '';
  });

  const handleChange = (dateString: string) => {
    setInputValue(dateString);
    if (dateString) {
      try {
        const date = new Date(dateString);
        if (isValid(date)) {
          onChange(date.toISOString());
        }
      } catch {
        // Invalid date, don't update
      }
    } else {
      onChange(null);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="date"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          aria-label="Select date"
          className={clsx(
            'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
            {
              'border-red-300 focus:ring-red-500 focus:border-red-500': error,
              'bg-gray-50 text-gray-500 cursor-not-allowed': disabled
            }
          )}
        />
        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

const NumberFilter: React.FC<FilterFieldProps> = ({ field, value, onChange, error, disabled }) => {
  const [inputValue, setInputValue] = useState(value?.toString() || '');

  const debouncedChange = useMemo(
    () => debounce((val: string) => {
      const numValue = val === '' ? null : Number(val);
      if (numValue !== null && !isNaN(numValue)) {
        onChange(numValue);
      } else if (val === '') {
        onChange(null);
      }
    }, 300),
    [onChange]
  );

  useEffect(() => {
    debouncedChange(inputValue);
  }, [inputValue, debouncedChange]);

  return (
    <div className="relative">
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={field.placeholder || `Enter ${field.label}`}
        min={field.min}
        max={field.max}
        step={field.step}
        disabled={disabled}
        className={clsx(
          'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
          {
            'border-red-300 focus:ring-red-500 focus:border-red-500': error,
            'bg-gray-50 text-gray-500 cursor-not-allowed': disabled
          }
        )}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

const BooleanFilter: React.FC<FilterFieldProps> = ({ field, value, onChange, error, disabled }) => {
  const options = [
    { label: 'All', value: null },
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.label} className="flex items-center">
          <input
            type="radio"
            name={field.key}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700">{option.label}</span>
        </label>
      ))}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

// Main FilterForm component
const FilterForm: React.FC<FilterFormProps> = ({
  fields,
  filters,
  presets = [],
  onFiltersChange,
  onPresetSave,
  onPresetLoad,
  className,
  title = 'Filters',
  description,
  showPresets = true,
  showAdvanced = true,
  showSearch = true,
  showSavePreset = true,
  showClear = true,
  showCount = true,
  collapsible = false,
  defaultCollapsed = false,
  maxHeight,
  debounceMs = 300,
  theme = 'default',
  layout = 'vertical',
  columns = 1,
  responsive = true,
  children
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
  const [operators, setOperators] = useState<Record<string, FilterOperator>>({});
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  // Initialize filter values from props
  useEffect(() => {
    if (filters) {
      const values: Record<string, unknown> = {};
      const ops: Record<string, FilterOperator> = {};
      
      filters.conditions.forEach(condition => {
        values[condition.field] = condition.value;
        ops[condition.field] = condition.operator;
      });
      
      setFilterValues(values);
      setOperators(ops);
    }
  }, [filters]);

  // Filter fields based on search term
  const filteredFields = useMemo(() => {
    if (!searchTerm) return fields;
    return fields.filter(field => 
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.key.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [fields, searchTerm]);

  // Group fields by category
  const groupedFields = useMemo(() => {
    const groups: Record<string, FilterField[]> = {};
    filteredFields.forEach(field => {
      const group = field.group || 'General';
      if (!groups[group]) groups[group] = [];
      groups[group].push(field);
    });
    return groups;
  }, [filteredFields]);

  // Handle filter value change
  const handleFilterChange = useCallback((fieldKey: string, value: unknown) => {
    setFilterValues(prev => {
      const updated = { ...prev, [fieldKey]: value };
      
      // Build filter group
      const conditions: FilterCondition[] = [];
      Object.entries(updated).forEach(([key, val]) => {
        if (val !== null && val !== undefined && val !== '') {
          const field = fields.find(f => f.key === key);
          if (field) {
            conditions.push({
              field: key,
              operator: operators[key] || field.defaultOperator || 'equals',
              value: val,
              type: field.type
            });
          }
        }
      });

      // Debounced callback
      const debouncedUpdate = debounce(() => {
        onFiltersChange?.({
          conditions,
          operator: 'AND'
        });
      }, debounceMs);

      debouncedUpdate();
      
      return updated;
    });
  }, [fields, operators, onFiltersChange, debounceMs]);

  // Handle operator change
  const handleOperatorChange = useCallback((fieldKey: string, operator: FilterOperator) => {
    setOperators(prev => ({ ...prev, [fieldKey]: operator }));
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilterValues({});
    setOperators({});
    setSelectedPreset(null);
    onFiltersChange?.({ conditions: [], operator: 'AND' });
  }, [onFiltersChange]);

  // Load preset
  const handleLoadPreset = useCallback((preset: FilterPreset) => {
    const values: Record<string, unknown> = {};
    const ops: Record<string, FilterOperator> = {};
    
    preset.filters.conditions.forEach(condition => {
      values[condition.field] = condition.value;
      ops[condition.field] = condition.operator;
    });
    
    setFilterValues(values);
    setOperators(ops);
    setSelectedPreset(preset.id);
    onPresetLoad?.(preset);
    onFiltersChange?.(preset.filters);
  }, [onPresetLoad, onFiltersChange]);

  // Save preset
  const handleSavePreset = useCallback(() => {
    if (!presetName.trim()) return;

    const conditions: FilterCondition[] = [];
    Object.entries(filterValues).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '') {
        const field = fields.find(f => f.key === key);
        if (field) {
          conditions.push({
            field: key,
            operator: operators[key] || field.defaultOperator || 'equals',
            value: val,
            type: field.type
          });
        }
      }
    });

    const preset: Omit<FilterPreset, 'id'> = {
      name: presetName,
      description: presetDescription || undefined,
      filters: { conditions, operator: 'AND' }
    };

    onPresetSave?.(preset);
    setShowSavePresetDialog(false);
    setPresetName('');
    setPresetDescription('');
  }, [presetName, presetDescription, filterValues, operators, fields, onPresetSave]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filterValues).filter(val => 
      val !== null && val !== undefined && val !== ''
    ).length;
  }, [filterValues]);

  // Render filter field
  const renderFilterField = (field: FilterField) => {
    const value = filterValues[field.key];
    const operator = operators[field.key];

    const commonProps: FilterFieldProps = {
      field,
      value,
      onChange: (val) => handleFilterChange(field.key, val),
      onOperatorChange: (op) => handleOperatorChange(field.key, op),
      operator
    };

    if (field.customComponent) {
      const CustomComponent = field.customComponent;
      return <CustomComponent {...commonProps} />;
    }

    switch (field.type) {
      case 'text':
        return <TextFilter {...commonProps} />;
      case 'select':
      case 'multiselect':
        return <SelectFilter {...commonProps} />;
      case 'date':
        return <DateFilter {...commonProps} />;
      case 'number':
        return <NumberFilter {...commonProps} />;
      case 'boolean':
        return <BooleanFilter {...commonProps} />;
      default:
        return <TextFilter {...commonProps} />;
    }
  };

  // Layout classes
  const layoutClasses = {
    vertical: 'space-y-4',
    horizontal: 'flex flex-wrap gap-4',
    grid: clsx('grid gap-4', {
      'grid-cols-1': columns === 1,
      'grid-cols-1 sm:grid-cols-2': columns === 2 && responsive,
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': columns === 3 && responsive,
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4': columns === 4 && responsive,
      'grid-cols-2': columns === 2 && !responsive,
      'grid-cols-3': columns === 3 && !responsive,
      'grid-cols-4': columns === 4 && !responsive
    })
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={clsx(
        'filter-form bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg',
        {
          'shadow-sm': theme === 'default',
          'shadow-none border-0': theme === 'compact',
          'shadow-lg': theme === 'detailed'
        },
        className
      )}
      style={{ maxHeight }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
              {showCount && activeFilterCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </h3>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {showClear && activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear all
            </button>
          )}

          {collapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              {isCollapsed ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronUpIcon className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Presets */}
            {showPresets && presets.length > 0 && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Quick Filters</h4>
                  {showSavePreset && (
                    <button
                      type="button"
                      onClick={() => setShowSavePresetDialog(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      Save current
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleLoadPreset(preset)}
                      className={clsx(
                        'inline-flex items-center px-3 py-1 text-sm rounded-full border transition-colors',
                        {
                          'bg-blue-100 border-blue-300 text-blue-800': selectedPreset === preset.id,
                          'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200': selectedPreset !== preset.id
                        }
                      )}
                    >
                      {preset.icon && <span className="mr-1">{preset.icon}</span>}
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            {showSearch && fields.length > 5 && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search filters..."
                    aria-label="Search filters"
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Filter Fields */}
            <div className="p-4 space-y-6">
              {Object.entries(groupedFields).map(([groupName, groupFields]) => (
                <div key={groupName}>
                  {Object.keys(groupedFields).length > 1 && (
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      {groupName}
                    </h5>
                  )}
                  <div className={layoutClasses[layout]}>
                    {groupFields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderFilterField(field)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {showAdvanced && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    <AdjustmentsHorizontalIcon className="w-4 h-4 mr-1" />
                    Advanced Filters
                    <ChevronDownIcon className={clsx('w-4 h-4 ml-1 transition-transform', {
                      'transform rotate-180': showAdvancedFilters
                    })} />
                  </button>

                  <AnimatePresence>
                    {showAdvancedFilters && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 space-y-4"
                      >
                        <p className="text-sm text-gray-500">
                          Advanced filtering options would go here...
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {children && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {children}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Preset Dialog */}
      <AnimatePresence>
        {showSavePresetDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Save Filter Preset
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preset Name *
                  </label>
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Enter preset name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={presetDescription}
                    onChange={(e) => setPresetDescription(e.target.value)}
                    placeholder="Enter description (optional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSavePresetDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePreset}
                  disabled={!presetName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Save Preset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FilterForm;