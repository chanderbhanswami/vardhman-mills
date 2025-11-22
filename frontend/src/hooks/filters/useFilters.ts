import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';

export interface FilterOption {
  id: string;
  label: string;
  value: string | number | boolean;
  count?: number;
  disabled?: boolean;
  description?: string;
  icon?: string;
  color?: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'select' | 'search' | 'date' | 'toggle';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  required?: boolean;
  multiple?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  icon?: string;
  description?: string;
}

export interface FilterValues {
  [key: string]: string | number | boolean | string[] | number[] | { min: number; max: number } | Date | null;
}

export interface FilterState {
  values: FilterValues;
  activeFilters: string[];
  totalResults: number;
  hasActiveFilters: boolean;
  appliedAt?: Date;
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FilterConfig {
  groups: FilterGroup[];
  syncWithUrl?: boolean;
  persistToStorage?: boolean;
  storageKey?: string;
  debounceMs?: number;
  autoApply?: boolean;
  resetOnRouteChange?: boolean;
  validateOnChange?: boolean;
}

export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  values: FilterValues;
  isDefault?: boolean;
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UseFiltersOptions {
  config: FilterConfig;
  initialValues?: FilterValues;
  onApply?: (filters: FilterValues) => void;
  onReset?: () => void;
  onChange?: (filters: FilterValues) => void;
  onError?: (errors: Record<string, string>) => void;
}

export const useFilters = (options: UseFiltersOptions) => {
  const {
    config,
    initialValues = {},
    onApply,
    onReset,
    onChange,
    onError,
  } = options;

  const {
    persistToStorage = false,
    storageKey = 'filters',
    autoApply = true,
    validateOnChange = true,
  } = config;

  // Initialize state
  const [state, setState] = useState<FilterState>(() => {
    let defaultValues: FilterValues = { ...initialValues };

    // Load from localStorage if enabled
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsedValues = JSON.parse(stored);
          defaultValues = { ...defaultValues, ...parsedValues };
        }
      } catch (error) {
        console.warn('Failed to load filters from storage:', error);
      }
    }

    const activeFilters = Object.keys(defaultValues).filter(key => {
      const value = defaultValues[key];
      return value !== null && value !== undefined && value !== '' && 
             (!Array.isArray(value) || value.length > 0);
    });

    return {
      values: defaultValues,
      activeFilters,
      totalResults: 0,
      hasActiveFilters: activeFilters.length > 0,
      isValid: true,
      errors: {},
    };
  });

  const [presets, setPresets] = useState<FilterPreset[]>([]);

  // Utility functions
  const validateFilters = useCallback((values: FilterValues): Record<string, string> => {
    const errors: Record<string, string> = {};

    config.groups.forEach(group => {
      const value = values[group.id];

      if (group.required && (value === null || value === undefined || value === '')) {
        errors[group.id] = `${group.label} is required`;
        return;
      }

      if (group.type === 'range' && typeof value === 'object' && value !== null) {
        const rangeValue = value as { min: number; max: number };
        if (group.min !== undefined && rangeValue.min < group.min) {
          errors[group.id] = `Minimum value is ${group.min}`;
        }
        if (group.max !== undefined && rangeValue.max > group.max) {
          errors[group.id] = `Maximum value is ${group.max}`;
        }
        if (rangeValue.min > rangeValue.max) {
          errors[group.id] = 'Minimum value cannot be greater than maximum';
        }
      }
    });

    return errors;
  }, [config.groups]);

  // Update filters
  const updateFilter = useCallback((filterId: string, value: FilterValues[string]) => {
    setState(prevState => {
      const newValues = { ...prevState.values, [filterId]: value };
      
      if (value === null || value === undefined || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        delete newValues[filterId];
      }

      const activeFilters = Object.keys(newValues).filter(key => {
        const filterValue = newValues[key];
        return filterValue !== null && filterValue !== undefined && filterValue !== '' && 
               (!Array.isArray(filterValue) || filterValue.length > 0);
      });

      const errors = validateOnChange ? validateFilters(newValues) : {};
      const isValid = Object.keys(errors).length === 0;

      return {
        values: newValues,
        activeFilters,
        totalResults: prevState.totalResults,
        hasActiveFilters: activeFilters.length > 0,
        appliedAt: autoApply ? new Date() : prevState.appliedAt,
        isValid,
        errors,
      };
    });
  }, [validateOnChange, validateFilters, autoApply]);

  // Apply filters
  const applyFilters = useCallback((customValues?: FilterValues) => {
    const values = customValues || state.values;
    const errors = validateFilters(values);
    
    if (Object.keys(errors).length > 0) {
      if (onError) onError(errors);
      setState(prevState => ({ ...prevState, errors, isValid: false }));
      return;
    }

    setState(prevState => ({
      ...prevState,
      values,
      appliedAt: new Date(),
      errors: {},
      isValid: true,
    }));

    if (persistToStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(values));
      } catch (error) {
        console.warn('Failed to save filters to storage:', error);
      }
    }

    if (onApply) onApply(values);
    if (onChange) onChange(values);
  }, [state.values, validateFilters, onError, onApply, onChange, persistToStorage, storageKey]);

  // Reset filters
  const resetFilters = useCallback(() => {
    const resetValues: FilterValues = {};
    
    setState({
      values: resetValues,
      activeFilters: [],
      totalResults: 0,
      hasActiveFilters: false,
      isValid: true,
      errors: {},
    });

    if (persistToStorage && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn('Failed to clear filters from storage:', error);
      }
    }

    if (onReset) onReset();
    if (onChange) onChange(resetValues);
  }, [persistToStorage, storageKey, onReset, onChange]);

  // Remove specific filter
  const removeFilter = useCallback((filterId: string) => {
    updateFilter(filterId, null);
  }, [updateFilter]);

  // Set multiple filters
  const setFilters = useCallback((filters: FilterValues, apply = true) => {
    setState(prevState => {
      const newValues = { ...prevState.values, ...filters };
      const activeFilters = Object.keys(newValues).filter(key => {
        const value = newValues[key];
        return value !== null && value !== undefined && value !== '' && 
               (!Array.isArray(value) || value.length > 0);
      });

      const errors = validateOnChange ? validateFilters(newValues) : {};
      const isValid = Object.keys(errors).length === 0;

      return {
        values: newValues,
        activeFilters,
        totalResults: prevState.totalResults,
        hasActiveFilters: activeFilters.length > 0,
        appliedAt: apply && autoApply ? new Date() : prevState.appliedAt,
        isValid,
        errors,
      };
    });

    if (apply) {
      applyFilters(filters);
    }
  }, [validateOnChange, validateFilters, autoApply, applyFilters]);

  // Preset management
  const savePreset = useCallback((name: string, description?: string, category?: string) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      description,
      category,
      values: { ...state.values },
      createdAt: new Date().toISOString(),
    };

    setPresets(prev => [...prev, newPreset]);
    toast.success(`Filter preset "${name}" saved successfully`);
  }, [state.values]);

  const loadPreset = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setFilters(preset.values, true);
      toast.success(`Filter preset "${preset.name}" applied`);
    }
  }, [presets, setFilters]);

  const deletePreset = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    const updatedPresets = presets.filter(p => p.id !== presetId);
    setPresets(updatedPresets);
    toast.success(`Filter preset "${preset.name}" deleted`);
  }, [presets]);

  // Helper functions
  const getFilterValue = useCallback((filterId: string) => {
    return state.values[filterId];
  }, [state.values]);

  const hasFilter = useCallback((filterId: string) => {
    return state.activeFilters.includes(filterId);
  }, [state.activeFilters]);

  const getFilterGroup = useCallback((groupId: string) => {
    return config.groups.find(group => group.id === groupId);
  }, [config.groups]);

  // Computed values
  const filterStats = useMemo(() => {
    const totalGroups = config.groups.length;
    const activeCount = state.activeFilters.length;
    const completionRate = totalGroups > 0 ? (activeCount / totalGroups) * 100 : 0;

    return {
      totalGroups,
      activeCount,
      completionRate: Math.round(completionRate),
      hasRequired: config.groups.some(group => group.required),
      isComplete: config.groups.filter(group => group.required).every(group => 
        hasFilter(group.id)
      ),
    };
  }, [config.groups, state.activeFilters, hasFilter]);

  return {
    // State
    values: state.values,
    activeFilters: state.activeFilters,
    hasActiveFilters: state.hasActiveFilters,
    isValid: state.isValid,
    errors: state.errors,
    appliedAt: state.appliedAt,
    
    // Configuration
    config,
    groups: config.groups,
    
    // Actions
    updateFilter,
    removeFilter,
    setFilters,
    applyFilters,
    resetFilters,
    
    // Preset management
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    
    // Utilities
    getFilterValue,
    hasFilter,
    getFilterGroup,
    
    // Statistics
    stats: filterStats,
    totalResults: state.totalResults,
    
    // Helpers for components
    isFilterActive: hasFilter,
    getGroupById: getFilterGroup,
    
    // Validation
    validateFilters: () => validateFilters(state.values),
  };
};

export default useFilters;