'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  StarIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  BookmarkIcon,
  TagIcon,
  MicrophoneIcon,
  CameraIcon,
  DocumentTextIcon,
  PhotoIcon,
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

// Search input types
export type SearchScope = 'all' | 'title' | 'content' | 'tags' | 'author' | 'metadata' | 'files' | 'images' | 'links' | 'location';

export type SearchMode = 'simple' | 'advanced' | 'boolean' | 'regex' | 'fuzzy';

export type SearchSuggestion = {
  id: string;
  text: string;
  type: 'query' | 'tag' | 'category' | 'user' | 'file' | 'recent';
  count?: number;
  description?: string;
  icon?: React.ReactNode;
  metadata?: Record<string, unknown>;
  highlighted?: boolean;
};

export type SearchFilter = {
  id: string;
  key: string;
  label: string;
  value: unknown;
  operator: string;
  active: boolean;
};

export type SearchHistory = {
  id: string;
  query: string;
  timestamp: Date;
  results: number;
  filters?: SearchFilter[];
  scope?: SearchScope;
  mode?: SearchMode;
};

export type SavedSearch = {
  id: string;
  name: string;
  query: string;
  description?: string;
  filters?: SearchFilter[];
  scope?: SearchScope;
  mode?: SearchMode;
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  notifications?: boolean;
};

export type SearchConfiguration = {
  placeholder: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  fuzzyThreshold: number;
  maxSuggestions: number;
  maxHistory: number;
  autoComplete: boolean;
  instantSearch: boolean;
  searchOnFocus: boolean;
  highlightMatches: boolean;
  showSuggestionTypes: boolean;
  enableVoiceSearch: boolean;
  enableImageSearch: boolean;
  enableLocationSearch: boolean;
};

export interface SearchInputProps {
  value?: string;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  history?: SearchHistory[];
  savedSearches?: SavedSearch[];
  filters?: SearchFilter[];
  scopes?: { key: SearchScope; label: string; icon?: React.ReactNode; description?: string }[];
  modes?: { key: SearchMode; label: string; description?: string }[];
  configuration?: Partial<SearchConfiguration>;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'rounded' | 'pill' | 'minimal';
  showFilters?: boolean;
  showScope?: boolean;
  showMode?: boolean;
  showHistory?: boolean;
  showSuggestions?: boolean;
  showSavedSearches?: boolean;
  showConfiguration?: boolean;
  allowVoiceSearch?: boolean;
  allowImageSearch?: boolean;
  allowLocationSearch?: boolean;
  debounceMs?: number;
  maxLength?: number;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  success?: string;
  onSearch?: (query: string, options?: SearchOptions) => void;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  onHistorySelect?: (history: SearchHistory) => void;
  onSavedSearchSelect?: (savedSearch: SavedSearch) => void;
  onFilterAdd?: (filter: SearchFilter) => void;
  onFilterRemove?: (filterId: string) => void;
  onScopeChange?: (scope: SearchScope) => void;
  onModeChange?: (mode: SearchMode) => void;
  onConfigurationChange?: (config: Partial<SearchConfiguration>) => void;
  onVoiceSearch?: () => void;
  onImageSearch?: () => void;
  onLocationSearch?: () => void;
  onSave?: (search: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt'>) => void;
  children?: React.ReactNode;
}

export type SearchOptions = {
  scope?: SearchScope;
  mode?: SearchMode;
  filters?: SearchFilter[];
  configuration?: Partial<SearchConfiguration>;
};

// Default configurations
const defaultConfiguration: SearchConfiguration = {
  placeholder: 'Search...',
  caseSensitive: false,
  wholeWord: false,
  useRegex: false,
  fuzzyThreshold: 0.6,
  maxSuggestions: 10,
  maxHistory: 50,
  autoComplete: true,
  instantSearch: false,
  searchOnFocus: false,
  highlightMatches: true,
  showSuggestionTypes: true,
  enableVoiceSearch: false,
  enableImageSearch: false,
  enableLocationSearch: false
};

const defaultScopes: { key: SearchScope; label: string; icon: React.ReactNode; description: string }[] = [
  { key: 'all', label: 'All', icon: <GlobeAltIcon className="w-4 h-4" />, description: 'Search everywhere' },
  { key: 'title', label: 'Titles', icon: <DocumentTextIcon className="w-4 h-4" />, description: 'Search in titles only' },
  { key: 'content', label: 'Content', icon: <DocumentTextIcon className="w-4 h-4" />, description: 'Search in content body' },
  { key: 'tags', label: 'Tags', icon: <TagIcon className="w-4 h-4" />, description: 'Search in tags' },
  { key: 'files', label: 'Files', icon: <DocumentTextIcon className="w-4 h-4" />, description: 'Search in files' },
  { key: 'images', label: 'Images', icon: <PhotoIcon className="w-4 h-4" />, description: 'Search in images' },
  { key: 'location', label: 'Location', icon: <MapPinIcon className="w-4 h-4" />, description: 'Search by location' }
];

const defaultModes: { key: SearchMode; label: string; description: string }[] = [
  { key: 'simple', label: 'Simple', description: 'Basic text search' },
  { key: 'advanced', label: 'Advanced', description: 'Advanced query syntax' },
  { key: 'boolean', label: 'Boolean', description: 'Boolean operators (AND, OR, NOT)' },
  { key: 'regex', label: 'Regex', description: 'Regular expression search' },
  { key: 'fuzzy', label: 'Fuzzy', description: 'Fuzzy matching search' }
];

// Size configurations
const sizeConfig = {
  sm: {
    input: 'h-8 text-sm px-3',
    icon: 'w-4 h-4',
    button: 'h-6 w-6',
    dropdown: 'text-sm'
  },
  md: {
    input: 'h-10 text-sm px-4',
    icon: 'w-4 h-4',
    button: 'h-8 w-8',
    dropdown: 'text-sm'
  },
  lg: {
    input: 'h-12 text-base px-5',
    icon: 'w-5 h-5',
    button: 'h-10 w-10',
    dropdown: 'text-base'
  },
  xl: {
    input: 'h-14 text-lg px-6',
    icon: 'w-6 h-6',
    button: 'h-12 w-12',
    dropdown: 'text-lg'
  }
};

// Variant configurations
const variantConfig = {
  default: 'border border-gray-300 dark:border-gray-600 rounded-lg',
  rounded: 'border border-gray-300 dark:border-gray-600 rounded-xl',
  pill: 'border border-gray-300 dark:border-gray-600 rounded-full',
  minimal: 'border-0 border-b-2 border-gray-300 dark:border-gray-600 rounded-none'
};

// Main SearchInput component
const SearchInput: React.FC<SearchInputProps> = ({
  value = '',
  placeholder,
  suggestions = [],
  history = [],
  savedSearches = [],
  filters = [],
  scopes = defaultScopes,
  modes = defaultModes,
  configuration: configProp = {},
  className,
  size = 'md',
  variant = 'default',
  showFilters = true,
  showScope = true,
  showMode = false,
  showHistory = true,
  showSuggestions = true,
  showSavedSearches = true,
  showConfiguration = false,
  allowVoiceSearch = false,
  allowImageSearch = false,
  allowLocationSearch = false,
  debounceMs = 300,
  maxLength = 500,
  disabled = false,
  loading = false,
  error,
  success,
  onSearch,
  onChange,
  onFocus,
  onBlur,
  onSuggestionSelect,
  onHistorySelect,
  onSavedSearchSelect,
  onFilterRemove,
  onScopeChange,
  onModeChange,
  onConfigurationChange,
  onVoiceSearch,
  onImageSearch,
  onLocationSearch,
  onSave,
  children
}) => {
  const [searchValue, setSearchValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'history' | 'saved'>('suggestions');
  const [selectedScope, setSelectedScope] = useState<SearchScope>('all');
  const [selectedMode, setSelectedMode] = useState<SearchMode>('simple');
  const [configuration, setConfiguration] = useState<SearchConfiguration>({
    ...defaultConfiguration,
    ...configProp
  });
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveDialogData, setSaveDialogData] = useState({
    name: '',
    description: '',
    isPublic: false,
    notifications: false,
    tags: ''
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Merged configuration
  const config = useMemo(() => ({
    ...defaultConfiguration,
    ...configProp,
    ...configuration
  }), [configProp, configuration]);

  // Update search value when prop changes
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      if (config.instantSearch && query.trim()) {
        onSearch?.(query, {
          scope: selectedScope,
          mode: selectedMode,
          filters,
          configuration: config
        });
      }
    }, debounceMs),
    [onSearch, selectedScope, selectedMode, filters, config, debounceMs]
  );

  // Handle search value change
  const handleValueChange = useCallback((newValue: string) => {
    setSearchValue(newValue);
    onChange?.(newValue);
    debouncedSearch(newValue);
  }, [onChange, debouncedSearch]);

  // Handle search execution
  const handleSearch = useCallback((query?: string) => {
    const searchQuery = query || searchValue;
    if (!searchQuery.trim()) return;

    onSearch?.(searchQuery, {
      scope: selectedScope,
      mode: selectedMode,
      filters,
      configuration: config
    });

    setShowDropdown(false);
  }, [searchValue, onSearch, selectedScope, selectedMode, filters, config]);

  // Handle key events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  }, [handleSearch]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowDropdown(true);
    onFocus?.();
    
    if (config.searchOnFocus && searchValue.trim()) {
      handleSearch();
    }
  }, [onFocus, config.searchOnFocus, searchValue, handleSearch]);

  // Handle blur
  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Don't blur if clicking within dropdown
    if (dropdownRef.current && dropdownRef.current.contains(e.relatedTarget as Node)) {
      return;
    }
    
    setIsFocused(false);
    setShowDropdown(false);
    onBlur?.();
  }, [onBlur]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    setSearchValue(suggestion.text);
    onChange?.(suggestion.text);
    onSuggestionSelect?.(suggestion);
    setShowDropdown(false);
    
    if (config.instantSearch) {
      handleSearch(suggestion.text);
    }
  }, [onChange, onSuggestionSelect, config.instantSearch, handleSearch]);

  // Handle history selection
  const handleHistorySelect = useCallback((historyItem: SearchHistory) => {
    setSearchValue(historyItem.query);
    onChange?.(historyItem.query);
    onHistorySelect?.(historyItem);
    
    if (historyItem.scope) setSelectedScope(historyItem.scope);
    if (historyItem.mode) setSelectedMode(historyItem.mode);
    
    setShowDropdown(false);
    
    if (config.instantSearch) {
      handleSearch(historyItem.query);
    }
  }, [onChange, onHistorySelect, config.instantSearch, handleSearch]);

  // Handle saved search selection
  const handleSavedSearchSelect = useCallback((savedSearch: SavedSearch) => {
    setSearchValue(savedSearch.query);
    onChange?.(savedSearch.query);
    onSavedSearchSelect?.(savedSearch);
    
    if (savedSearch.scope) setSelectedScope(savedSearch.scope);
    if (savedSearch.mode) setSelectedMode(savedSearch.mode);
    
    setShowDropdown(false);
    
    if (config.instantSearch) {
      handleSearch(savedSearch.query);
    }
  }, [onChange, onSavedSearchSelect, config.instantSearch, handleSearch]);

  // Handle scope change
  const handleScopeChange = useCallback((scope: SearchScope) => {
    setSelectedScope(scope);
    onScopeChange?.(scope);
  }, [onScopeChange]);

  // Handle mode change
  const handleModeChange = useCallback((mode: SearchMode) => {
    setSelectedMode(mode);
    onModeChange?.(mode);
  }, [onModeChange]);

  // Handle configuration change
  const handleConfigurationChange = useCallback((updates: Partial<SearchConfiguration>) => {
    const newConfig = { ...configuration, ...updates };
    setConfiguration(newConfig);
    onConfigurationChange?.(newConfig);
  }, [configuration, onConfigurationChange]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchValue('');
    onChange?.('');
    inputRef.current?.focus();
  }, [onChange]);

  // Save search
  const saveSearch = useCallback(() => {
    if (!saveDialogData.name.trim() || !searchValue.trim()) return;

    const savedSearch: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt'> = {
      name: saveDialogData.name,
      query: searchValue,
      description: saveDialogData.description || undefined,
      filters: filters.length > 0 ? filters : undefined,
      scope: selectedScope !== 'all' ? selectedScope : undefined,
      mode: selectedMode !== 'simple' ? selectedMode : undefined,
      isPublic: saveDialogData.isPublic,
      notifications: saveDialogData.notifications,
      tags: saveDialogData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    onSave?.(savedSearch);
    setShowSaveDialog(false);
    setSaveDialogData({ name: '', description: '', isPublic: false, notifications: false, tags: '' });
  }, [saveDialogData, searchValue, filters, selectedScope, selectedMode, onSave]);

  // Filter suggestions based on current input
  const filteredSuggestions = useMemo(() => {
    if (!showSuggestions || !searchValue.trim()) return suggestions;
    
    return suggestions.filter(suggestion =>
      suggestion.text.toLowerCase().includes(searchValue.toLowerCase())
    ).slice(0, config.maxSuggestions);
  }, [showSuggestions, searchValue, suggestions, config.maxSuggestions]);

  // Recent history items
  const recentHistory = useMemo(() => {
    if (!showHistory) return [];
    return history.slice(0, 5);
  }, [showHistory, history]);

  // Recent saved searches
  const recentSavedSearches = useMemo(() => {
    if (!showSavedSearches) return [];
    return savedSearches.slice(0, 5);
  }, [showSavedSearches, savedSearches]);

  // Get current size config
  const currentSize = sizeConfig[size];

  // Render dropdown content
  const renderDropdownContent = () => {
    if (activeTab === 'suggestions' && filteredSuggestions.length > 0) {
      return (
        <div className="space-y-1">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSuggestionSelect(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <div className="flex items-center space-x-3">
                {suggestion.icon && (
                  <div className="text-gray-400">
                    {suggestion.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 dark:text-white truncate">
                    {suggestion.text}
                  </div>
                  {suggestion.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {suggestion.description}
                    </div>
                  )}
                </div>
                {suggestion.count !== undefined && (
                  <div className="text-xs text-gray-400">
                    {suggestion.count}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      );
    }

    if (activeTab === 'history' && recentHistory.length > 0) {
      return (
        <div className="space-y-1">
          {recentHistory.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleHistorySelect(item)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 dark:text-white truncate">
                    {item.query}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.results} results • {item.timestamp.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      );
    }

    if (activeTab === 'saved' && recentSavedSearches.length > 0) {
      return (
        <div className="space-y-1">
          {recentSavedSearches.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSavedSearchSelect(item)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <div className="flex items-center space-x-3">
                <StarIcon className="w-4 h-4 text-yellow-500" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 dark:text-white truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.query}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
        <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">
          {activeTab === 'suggestions' && 'No suggestions available'}
          {activeTab === 'history' && 'No search history'}
          {activeTab === 'saved' && 'No saved searches'}
        </p>
      </div>
    );
  };

  return (
    <div className={clsx('search-input relative', className)}>
      {/* Main search container */}
      <div
        className={clsx(
          'relative flex items-center bg-white dark:bg-gray-800',
          variantConfig[variant],
          currentSize.input,
          isFocused && 'ring-2 ring-blue-500 border-blue-500',
          error && 'border-red-500 ring-2 ring-red-500',
          success && 'border-green-500 ring-2 ring-green-500',
          disabled && 'opacity-50 cursor-not-allowed',
          'transition-all duration-200'
        )}
      >
        {/* Scope selector */}
        {showScope && (
          <div className="flex-shrink-0 border-r border-gray-300 dark:border-gray-600 pr-3">
            <select
              value={selectedScope}
              onChange={(e) => handleScopeChange(e.target.value as SearchScope)}
              className="text-sm bg-transparent border-0 focus:ring-0 text-gray-700 dark:text-gray-300"
              disabled={disabled}
              aria-label="Search scope"
            >
              {scopes.map((scope) => (
                <option key={scope.key} value={scope.key}>
                  {scope.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search icon */}
        <div className="flex-shrink-0 pl-3">
          {loading ? (
            <ArrowPathIcon className={clsx(currentSize.icon, 'text-gray-400 animate-spin')} />
          ) : (
            <MagnifyingGlassIcon className={clsx(currentSize.icon, 'text-gray-400')} />
          )}
        </div>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => handleValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || config.placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={clsx(
            'flex-1 px-3 py-0 bg-transparent border-0 focus:ring-0 focus:outline-none',
            'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
            currentSize.dropdown
          )}
          autoComplete="off"
          spellCheck="false"
        />

        {/* Active filters */}
        {showFilters && filters.length > 0 && (
          <div className="flex items-center space-x-1 px-2">
            {filters.filter(f => f.active).slice(0, 3).map((filter) => (
              <div
                key={filter.id}
                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                <span className="truncate max-w-20">{filter.label}</span>
                <button
                  type="button"
                  onClick={() => onFilterRemove?.(filter.id)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  title="Remove filter"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
            {filters.filter(f => f.active).length > 3 && (
              <span className="text-xs text-gray-500">+{filters.filter(f => f.active).length - 3}</span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center space-x-1 pr-3">
          {/* Voice search */}
          {allowVoiceSearch && (
            <button
              type="button"
              onClick={onVoiceSearch}
              className={clsx(
                'p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors',
                currentSize.button
              )}
              title="Voice search"
              disabled={disabled}
            >
              <MicrophoneIcon className={currentSize.icon} />
            </button>
          )}

          {/* Image search */}
          {allowImageSearch && (
            <button
              type="button"
              onClick={onImageSearch}
              className={clsx(
                'p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors',
                currentSize.button
              )}
              title="Image search"
              disabled={disabled}
            >
              <CameraIcon className={currentSize.icon} />
            </button>
          )}

          {/* Location search */}
          {allowLocationSearch && (
            <button
              type="button"
              onClick={onLocationSearch}
              className={clsx(
                'p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors',
                currentSize.button
              )}
              title="Location search"
              disabled={disabled}
            >
              <MapPinIcon className={currentSize.icon} />
            </button>
          )}

          {/* Clear button */}
          {searchValue && (
            <button
              type="button"
              onClick={clearSearch}
              className={clsx(
                'p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors',
                currentSize.button
              )}
              title="Clear search"
              disabled={disabled}
            >
              <XMarkIcon className={currentSize.icon} />
            </button>
          )}

          {/* Configuration */}
          {showConfiguration && (
            <button
              type="button"
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className={clsx(
                'p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors',
                currentSize.button,
                showConfigPanel && 'text-blue-600'
              )}
              title="Search configuration"
              disabled={disabled}
            >
              <AdjustmentsHorizontalIcon className={currentSize.icon} />
            </button>
          )}

          {/* Save search */}
          {onSave && searchValue && (
            <button
              type="button"
              onClick={() => setShowSaveDialog(true)}
              className={clsx(
                'p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors',
                currentSize.button
              )}
              title="Save search"
              disabled={disabled}
            >
              <BookmarkIcon className={currentSize.icon} />
            </button>
          )}

          {/* Mode selector */}
          {showMode && (
            <select
              value={selectedMode}
              onChange={(e) => handleModeChange(e.target.value as SearchMode)}
              className="text-xs bg-transparent border-0 focus:ring-0 text-gray-700 dark:text-gray-300"
              disabled={disabled}
              title="Search mode"
              aria-label="Search mode"
            >
              {modes.map((mode) => (
                <option key={mode.key} value={mode.key}>
                  {mode.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && isFocused && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {showSuggestions && (
                <button
                  type="button"
                  onClick={() => setActiveTab('suggestions')}
                  className={clsx(
                    'flex-1 px-4 py-2 text-sm font-medium transition-colors',
                    activeTab === 'suggestions'
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  Suggestions
                </button>
              )}
              {showHistory && (
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={clsx(
                    'flex-1 px-4 py-2 text-sm font-medium transition-colors',
                    activeTab === 'history'
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  History
                </button>
              )}
              {showSavedSearches && (
                <button
                  type="button"
                  onClick={() => setActiveTab('saved')}
                  className={clsx(
                    'flex-1 px-4 py-2 text-sm font-medium transition-colors',
                    activeTab === 'saved'
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  Saved
                </button>
              )}
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              <div className="p-2">
                {renderDropdownContent()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Configuration panel */}
      <AnimatePresence>
        {showConfigPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Search Configuration
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.caseSensitive}
                    onChange={(e) => handleConfigurationChange({ caseSensitive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Case sensitive</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.wholeWord}
                    onChange={(e) => handleConfigurationChange({ wholeWord: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Whole word</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.useRegex}
                    onChange={(e) => handleConfigurationChange({ useRegex: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Use regex</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.instantSearch}
                    onChange={(e) => handleConfigurationChange({ instantSearch: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Instant search</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save dialog */}
      <AnimatePresence>
        {showSaveDialog && (
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
                Save Search
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={saveDialogData.name}
                    onChange={(e) => setSaveDialogData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter search name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={saveDialogData.description}
                    onChange={(e) => setSaveDialogData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description (optional)"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={saveDialogData.isPublic}
                      onChange={(e) => setSaveDialogData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Public</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={saveDialogData.notifications}
                      onChange={(e) => setSaveDialogData(prev => ({ ...prev, notifications: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Notifications</span>
                  </label>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Query:</strong> {searchValue}<br />
                  <strong>Scope:</strong> {scopes.find(s => s.key === selectedScope)?.label}<br />
                  <strong>Filters:</strong> {filters.filter(f => f.active).length}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveSearch}
                  disabled={!saveDialogData.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Save Search
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error/Success messages */}
      {(error || success) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export default SearchInput;