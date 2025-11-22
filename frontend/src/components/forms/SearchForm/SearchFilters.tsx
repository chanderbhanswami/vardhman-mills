'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  TagIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

// Enhanced search filter types
export type FilterDataType = 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';

export type FilterOperatorType =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_equal'
  | 'less_equal'
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null'
  | 'regex'
  | 'fuzzy';

export type FilterCondition = {
  id: string;
  field: string;
  operator: FilterOperatorType;
  value: unknown;
  dataType: FilterDataType;
  enabled: boolean;
};

export type FilterGroup = {
  id: string;
  name: string;
  conditions: FilterCondition[];
  operator: 'AND' | 'OR';
  enabled: boolean;
  collapsed?: boolean;
};

export type FilterField = {
  key: string;
  label: string;
  dataType: FilterDataType;
  operators: FilterOperatorType[];
  options?: { label: string; value: unknown; count?: number; color?: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  format?: string;
  validation?: (value: unknown) => boolean | string;
  transform?: (value: unknown) => unknown;
  icon?: React.ReactNode;
  description?: string;
  category?: string;
  searchable?: boolean;
  required?: boolean;
};

export type FilterPreset = {
  id: string;
  name: string;
  description?: string;
  groups: FilterGroup[];
  isDefault?: boolean;
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
};

export interface SearchFiltersProps {
  fields: FilterField[];
  groups?: FilterGroup[];
  presets?: FilterPreset[];
  onFiltersChange?: (groups: FilterGroup[]) => void;
  onPresetSave?: (preset: Omit<FilterPreset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onPresetLoad?: (preset: FilterPreset) => void;
  onPresetDelete?: (presetId: string) => void;
  className?: string;
  title?: string;
  description?: string;
  showPresets?: boolean;
  showGrouping?: boolean;
  showOperators?: boolean;
  showSearch?: boolean;
  showCategories?: boolean;
  allowCustomFilters?: boolean;
  maxGroups?: number;
  maxConditions?: number;
  debounceMs?: number;
  theme?: 'default' | 'compact' | 'detailed';
  layout?: 'vertical' | 'horizontal';
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  children?: React.ReactNode;
}

// Operator configurations
const operatorConfig: Record<FilterOperatorType, { 
  label: string; 
  symbol: string; 
  description: string;
  requiresValue: boolean;
  supportsMultiple?: boolean;
}> = {
  equals: { label: 'Equals', symbol: '=', description: 'Exact match', requiresValue: true },
  not_equals: { label: 'Not equals', symbol: '≠', description: 'Does not match', requiresValue: true },
  contains: { label: 'Contains', symbol: '⊃', description: 'Contains text', requiresValue: true },
  not_contains: { label: 'Does not contain', symbol: '⊅', description: 'Does not contain text', requiresValue: true },
  starts_with: { label: 'Starts with', symbol: '^', description: 'Begins with text', requiresValue: true },
  ends_with: { label: 'Ends with', symbol: '$', description: 'Ends with text', requiresValue: true },
  greater_than: { label: 'Greater than', symbol: '>', description: 'Greater than value', requiresValue: true },
  less_than: { label: 'Less than', symbol: '<', description: 'Less than value', requiresValue: true },
  greater_equal: { label: 'Greater or equal', symbol: '≥', description: 'Greater than or equal to value', requiresValue: true },
  less_equal: { label: 'Less or equal', symbol: '≤', description: 'Less than or equal to value', requiresValue: true },
  between: { label: 'Between', symbol: '↔', description: 'Between two values', requiresValue: true, supportsMultiple: true },
  in: { label: 'In list', symbol: '∈', description: 'In a list of values', requiresValue: true, supportsMultiple: true },
  not_in: { label: 'Not in list', symbol: '∉', description: 'Not in a list of values', requiresValue: true, supportsMultiple: true },
  is_null: { label: 'Is empty', symbol: '∅', description: 'Field is empty or null', requiresValue: false },
  is_not_null: { label: 'Is not empty', symbol: '≠∅', description: 'Field is not empty', requiresValue: false },
  regex: { label: 'Regex', symbol: '.*', description: 'Regular expression match', requiresValue: true },
  fuzzy: { label: 'Fuzzy', symbol: '~', description: 'Fuzzy text match', requiresValue: true }
};

// Data type configurations
const dataTypeConfig: Record<FilterDataType, { 
  label: string; 
  icon: React.ReactNode; 
  defaultOperators: FilterOperatorType[];
}> = {
  string: {
    label: 'Text',
    icon: <DocumentTextIcon className="w-4 h-4" />,
    defaultOperators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_null', 'is_not_null', 'regex', 'fuzzy']
  },
  number: {
    label: 'Number',
    icon: <CurrencyDollarIcon className="w-4 h-4" />,
    defaultOperators: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'between', 'is_null', 'is_not_null']
  },
  date: {
    label: 'Date',
    icon: <CalendarIcon className="w-4 h-4" />,
    defaultOperators: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'between', 'is_null', 'is_not_null']
  },
  boolean: {
    label: 'Boolean',
    icon: <CheckIcon className="w-4 h-4" />,
    defaultOperators: ['equals', 'not_equals', 'is_null', 'is_not_null']
  },
  array: {
    label: 'List',
    icon: <TagIcon className="w-4 h-4" />,
    defaultOperators: ['contains', 'not_contains', 'in', 'not_in', 'is_null', 'is_not_null']
  },
  object: {
    label: 'Object',
    icon: <DocumentTextIcon className="w-4 h-4" />,
    defaultOperators: ['equals', 'not_equals', 'is_null', 'is_not_null']
  }
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Main SearchFilters component
const SearchFilters: React.FC<SearchFiltersProps> = ({
  fields,
  groups = [],
  presets = [],
  onFiltersChange,
  onPresetSave,
  onPresetLoad,
  className,
  title = 'Search Filters',
  description,
  showPresets = true,
  showGrouping = true,
  showOperators = true,
  showSearch = true,
  showCategories = true,
  maxGroups = 5,
  maxConditions = 10,
  debounceMs = 300,
  collapsible = true,
  defaultCollapsed = false,
  children
}) => {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(groups);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // Initialize with default group if empty
  useEffect(() => {
    if (filterGroups.length === 0) {
      const defaultGroup: FilterGroup = {
        id: generateId(),
        name: 'Default',
        conditions: [],
        operator: 'AND',
        enabled: true,
        collapsed: false
      };
      setFilterGroups([defaultGroup]);
      setActiveGroup(defaultGroup.id);
    }
  }, [filterGroups.length]);

  // Debounced filter change notification
  const debouncedNotifyChange = useMemo(
    () => debounce((groups: FilterGroup[]) => {
      onFiltersChange?.(groups);
    }, debounceMs),
    [onFiltersChange, debounceMs]
  );

  // Notify changes
  useEffect(() => {
    debouncedNotifyChange(filterGroups);
  }, [filterGroups, debouncedNotifyChange]);

  // Filter fields based on search and category
  const filteredFields = useMemo(() => {
    let filtered = fields;

    if (searchTerm) {
      filtered = filtered.filter(field =>
        field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(field => field.category === selectedCategory);
    }

    return filtered;
  }, [fields, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(['all']);
    fields.forEach(field => {
      if (field.category) cats.add(field.category);
    });
    return Array.from(cats);
  }, [fields]);

  // Add new group
  const addGroup = useCallback(() => {
    if (filterGroups.length >= maxGroups) return;

    const newGroup: FilterGroup = {
      id: generateId(),
      name: `Group ${filterGroups.length + 1}`,
      conditions: [],
      operator: 'AND',
      enabled: true,
      collapsed: false
    };

    setFilterGroups(prev => [...prev, newGroup]);
    setActiveGroup(newGroup.id);
  }, [filterGroups.length, maxGroups]);

  // Remove group
  const removeGroup = useCallback((groupId: string) => {
    setFilterGroups(prev => {
      const updated = prev.filter(group => group.id !== groupId);
      if (updated.length === 0) {
        const defaultGroup: FilterGroup = {
          id: generateId(),
          name: 'Default',
          conditions: [],
          operator: 'AND',
          enabled: true,
          collapsed: false
        };
        return [defaultGroup];
      }
      return updated;
    });

    if (activeGroup === groupId) {
      setActiveGroup(filterGroups[0]?.id || null);
    }
  }, [activeGroup, filterGroups]);

  // Update group
  const updateGroup = useCallback((groupId: string, updates: Partial<FilterGroup>) => {
    setFilterGroups(prev =>
      prev.map(group =>
        group.id === groupId ? { ...group, ...updates } : group
      )
    );
  }, []);

  // Add condition to group
  const addCondition = useCallback((groupId: string, field?: FilterField) => {
    const group = filterGroups.find(g => g.id === groupId);
    if (!group || group.conditions.length >= maxConditions) return;

    const targetField = field || fields[0];
    if (!targetField) return;

    const newCondition: FilterCondition = {
      id: generateId(),
      field: targetField.key,
      operator: targetField.operators[0] || 'equals',
      value: '',
      dataType: targetField.dataType,
      enabled: true
    };

    updateGroup(groupId, {
      conditions: [...group.conditions, newCondition]
    });
  }, [filterGroups, maxConditions, fields, updateGroup]);

  // Remove condition
  const removeCondition = useCallback((groupId: string, conditionId: string) => {
    const group = filterGroups.find(g => g.id === groupId);
    if (!group) return;

    updateGroup(groupId, {
      conditions: group.conditions.filter(c => c.id !== conditionId)
    });
  }, [filterGroups, updateGroup]);

  // Update condition
  const updateCondition = useCallback((groupId: string, conditionId: string, updates: Partial<FilterCondition>) => {
    const group = filterGroups.find(g => g.id === groupId);
    if (!group) return;

    updateGroup(groupId, {
      conditions: group.conditions.map(condition =>
        condition.id === conditionId ? { ...condition, ...updates } : condition
      )
    });
  }, [filterGroups, updateGroup]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilterGroups([{
      id: generateId(),
      name: 'Default',
      conditions: [],
      operator: 'AND',
      enabled: true,
      collapsed: false
    }]);
  }, []);

  // Load preset
  const loadPreset = useCallback((preset: FilterPreset) => {
    setFilterGroups(preset.groups);
    setActiveGroup(preset.groups[0]?.id || null);
    onPresetLoad?.(preset);
  }, [onPresetLoad]);

  // Save preset
  const savePreset = useCallback(() => {
    if (!presetName.trim()) return;

    const preset: Omit<FilterPreset, 'id' | 'createdAt' | 'updatedAt'> = {
      name: presetName,
      description: presetDescription || undefined,
      groups: filterGroups,
      tags: []
    };

    onPresetSave?.(preset);
    setShowPresetDialog(false);
    setPresetName('');
    setPresetDescription('');
  }, [presetName, presetDescription, filterGroups, onPresetSave]);

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    return filterGroups.reduce((count, group) => {
      if (!group.enabled) return count;
      return count + group.conditions.filter(c => c.enabled && c.value !== '' && c.value != null).length;
    }, 0);
  }, [filterGroups]);

  // Render condition value input
  const renderValueInput = (condition: FilterCondition, groupId: string) => {
    const field = fields.find(f => f.key === condition.field);
    const operator = operatorConfig[condition.operator];

    if (!operator.requiresValue) {
      return null;
    }

    const commonProps = {
      value: condition.value?.toString() || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let value: unknown = e.target.value;
        
        // Transform value based on data type
        if (condition.dataType === 'number') {
          value = value === '' ? null : Number(value);
        } else if (condition.dataType === 'boolean') {
          value = value === 'true';
        }

        updateCondition(groupId, condition.id, { value });
      },
      className: 'px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
    };

    // Field with options (select)
    if (field?.options) {
      return (
        <select {...commonProps} aria-label={`Value for ${field.label}`}>
          <option value="">Select value...</option>
          {field.options.map((option, index) => (
            <option key={index} value={option.value?.toString()}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    // Boolean field
    if (condition.dataType === 'boolean') {
      return (
        <select {...commonProps} aria-label={`Boolean value for ${field?.label || condition.field}`}>
          <option value="">Select...</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }

    // Date field
    if (condition.dataType === 'date') {
      return (
        <input
          type="date"
          {...commonProps}
          aria-label={`Date value for ${field?.label || condition.field}`}
        />
      );
    }

    // Number field
    if (condition.dataType === 'number') {
      return (
        <input
          type="number"
          min={field?.min}
          max={field?.max}
          step={field?.step}
          placeholder={field?.placeholder || 'Enter number...'}
          {...commonProps}
          aria-label={`Number value for ${field?.label || condition.field}`}
        />
      );
    }

    // Default text input
    return (
      <input
        type="text"
        placeholder={field?.placeholder || 'Enter value...'}
        {...commonProps}
        aria-label={`Text value for ${field?.label || condition.field}`}
      />
    );
  };

  // Render condition
  const renderCondition = (condition: FilterCondition, groupId: string) => {
    const field = fields.find(f => f.key === condition.field);

    return (
      <motion.div
        key={condition.id}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <div className="flex items-center space-x-3">
          {/* Enable/disable toggle */}
          <button
            type="button"
            onClick={() => updateCondition(groupId, condition.id, { enabled: !condition.enabled })}
            className={clsx(
              'p-1 rounded transition-colors',
              condition.enabled
                ? 'text-green-600 hover:text-green-800 dark:text-green-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            )}
            title={condition.enabled ? 'Disable condition' : 'Enable condition'}
          >
            {condition.enabled ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
          </button>

          {/* Field selector */}
          <select
            value={condition.field}
            onChange={(e) => {
              const newField = fields.find(f => f.key === e.target.value);
              updateCondition(groupId, condition.id, {
                field: e.target.value,
                dataType: newField?.dataType || 'string',
                operator: newField?.operators[0] || 'equals',
                value: ''
              });
            }}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Select field"
          >
            {filteredFields.map((field) => (
              <option key={field.key} value={field.key}>
                {field.label}
              </option>
            ))}
          </select>

          {/* Operator selector */}
          {showOperators && (
            <select
              value={condition.operator}
              onChange={(e) => updateCondition(groupId, condition.id, { 
                operator: e.target.value as FilterOperatorType,
                value: operatorConfig[e.target.value as FilterOperatorType].requiresValue ? condition.value : null
              })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title={operatorConfig[condition.operator]?.description}
              aria-label="Select operator"
            >
              {(field?.operators || dataTypeConfig[condition.dataType].defaultOperators).map((op) => (
                <option key={op} value={op}>
                  {operatorConfig[op].label}
                </option>
              ))}
            </select>
          )}

          {/* Value input */}
          <div className="flex-1">
            {renderValueInput(condition, groupId)}
          </div>

          {/* Remove condition */}
          <button
            type="button"
            onClick={() => removeCondition(groupId, condition.id)}
            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 rounded transition-colors"
            title="Remove condition"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Condition info */}
        {field?.description && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {field.description}
          </div>
        )}
      </motion.div>
    );
  };

  // Render group
  const renderGroup = (group: FilterGroup) => {
    return (
      <motion.div
        key={group.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={clsx(
          'border border-gray-200 dark:border-gray-700 rounded-lg',
          group.enabled ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
        )}
      >
        {/* Group header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Enable/disable toggle */}
              <button
                type="button"
                onClick={() => updateGroup(group.id, { enabled: !group.enabled })}
                className={clsx(
                  'p-1 rounded transition-colors',
                  group.enabled
                    ? 'text-green-600 hover:text-green-800 dark:text-green-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                )}
                title={group.enabled ? 'Disable group' : 'Enable group'}
              >
                {group.enabled ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
              </button>

              {/* Group name */}
              <input
                type="text"
                value={group.name}
                onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                className="text-lg font-medium bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white"
                placeholder="Group name"
              />

              {/* Operator selector */}
              <select
                value={group.operator}
                onChange={(e) => updateGroup(group.id, { operator: e.target.value as 'AND' | 'OR' })}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                title="Logical operator for conditions in this group"
                aria-label="Group operator"
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>

              {/* Active conditions count */}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({group.conditions.filter(c => c.enabled).length} active)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Collapse toggle */}
              <button
                type="button"
                onClick={() => updateGroup(group.id, { collapsed: !group.collapsed })}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                title={group.collapsed ? 'Expand group' : 'Collapse group'}
              >
                {group.collapsed ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
              </button>

              {/* Remove group */}
              {filterGroups.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGroup(group.id)}
                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 rounded transition-colors"
                  title="Remove group"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Group content */}
        <AnimatePresence>
          {!group.collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 space-y-3"
            >
              {/* Conditions */}
              <AnimatePresence>
                {group.conditions.map((condition) => 
                  renderCondition(condition, group.id)
                )}
              </AnimatePresence>

              {/* Add condition button */}
              {group.conditions.length < maxConditions && (
                <button
                  type="button"
                  onClick={() => addCondition(group.id)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <PlusIcon className="w-4 h-4" />
                    <span>Add condition</span>
                  </div>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className={clsx('search-filters', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
              {activeFiltersCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </h3>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Clear filters */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400"
            >
              Clear all
            </button>
          )}

          {/* Save preset */}
          {showPresets && (
            <button
              type="button"
              onClick={() => setShowPresetDialog(true)}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Save preset
            </button>
          )}

          {/* Collapse/expand */}
          {collapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {isCollapsed ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
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
            className="space-y-6"
          >
            {/* Search and categories */}
            {(showSearch || showCategories) && (
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search fields */}
                {showSearch && (
                  <div className="flex-1">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search fields..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Categories */}
                {showCategories && categories.length > 1 && (
                  <div className="sm:w-48">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Filter by category"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All categories' : category}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Presets */}
            {showPresets && presets.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quick Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => loadPreset(preset)}
                      className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
                    >
                      <span>{preset.name}</span>
                      {preset.tags && preset.tags.length > 0 && (
                        <TagIcon className="w-3 h-3 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filter groups */}
            <div className="space-y-4">
              <AnimatePresence>
                {filterGroups.map((group) => renderGroup(group))}
              </AnimatePresence>

              {/* Add group button */}
              {showGrouping && filterGroups.length < maxGroups && (
                <button
                  type="button"
                  onClick={addGroup}
                  className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <PlusIcon className="w-5 h-5" />
                    <span>Add filter group</span>
                  </div>
                </button>
              )}
            </div>

            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save preset dialog */}
      <AnimatePresence>
        {showPresetDialog && (
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Groups:</strong> {filterGroups.length}, <strong>Active conditions:</strong> {activeFiltersCount}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPresetDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={savePreset}
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
    </div>
  );
};

export default SearchFilters;