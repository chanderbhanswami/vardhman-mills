'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

export interface SearchSuggestion {
  id: string;
  text: string;
  type?: string;
  data?: Record<string, unknown>;
}

interface EnhancedSearchProps {
  placeholder?: string;
  value: string;
  onSearch: (query: string) => void;
  onReset?: () => void;
  showReset?: boolean;
  suggestions?: SearchSuggestion[];
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  onSuggestionsFetch?: (query: string) => void;
  className?: string;
  highlightTerm?: string;
  isLoading?: boolean;
  debounceMs?: number;
}

export default function EnhancedSearch({
  placeholder = "Search...",
  value,
  onSearch,
  onReset,
  showReset = false,
  suggestions = [],
  onSuggestionSelect,
  onSuggestionsFetch,
  className = "",
  highlightTerm = "",
  isLoading = false,
  debounceMs = 300
}: EnhancedSearchProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onSearch(query);
      if (onSuggestionsFetch && query.trim()) {
        onSuggestionsFetch(query);
      }
    }, debounceMs);
  }, [onSearch, onSuggestionsFetch, debounceMs]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setSelectedSuggestionIndex(-1);
    
    if (newValue.trim()) {
      setShowSuggestions(true);
      debouncedSearch(newValue);
    } else {
      setShowSuggestions(false);
      onSearch('');
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
      handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
    } else {
      onSearch(localValue);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setLocalValue(suggestion.text);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    onSearch(suggestion.text);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions && e.key !== 'Escape') return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        } else {
          handleSubmit(e);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        if (showSuggestions) {
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
        } else {
          handleClear();
        }
        break;
    }
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedSuggestionIndex >= 0 && suggestionRefs.current[selectedSuggestionIndex]) {
      suggestionRefs.current[selectedSuggestionIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedSuggestionIndex]);

  // Handle clear
  const handleClear = () => {
    setLocalValue('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    onSearch('');
    inputRef.current?.focus();
  };

  // Handle reset
  const handleReset = () => {
    setLocalValue('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    
    // Call onReset first to let parent handle the reset logic
    if (onReset) {
      onReset();
    } else {
      // Fallback: call onSearch with empty string
      onSearch('');
    }
    
    inputRef.current?.focus();
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    if (localValue.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle blur
  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        setIsFocused(false);
      }
    }, 150);
  };

  // Highlight matching text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-800 rounded px-1">
          {part}
        </mark>
      ) : part
    );
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isLoading ? (
              <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin" />
            ) : (
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`block w-full pl-10 pr-20 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
              isFocused ? 'ring-1 ring-blue-500 border-blue-500' : ''
            }`}
            autoComplete="off"
          />
          
          {/* Action Buttons */}
          <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
            {localValue && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Clear search (Esc)"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            
            {showReset && (
              <button
                type="button"
                onClick={handleReset}
                className="p-1 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50"
                title="Reset search results"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>
            )}
            
            {suggestions.length > 0 && showSuggestions && (
              <div className="text-gray-400">
                {showSuggestions ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                ref={el => { suggestionRefs.current[index] = el; }}
                onClick={() => handleSuggestionSelect(suggestion)}
                className={`px-4 py-2 cursor-pointer flex items-center justify-between ${
                  index === selectedSuggestionIndex
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-900'
                }`}
              >
                <div className="flex-1">
                  <div className="text-sm">
                    {highlightText(suggestion.text, highlightTerm || localValue)}
                  </div>
                  {suggestion.type && (
                    <div className="text-xs text-gray-500 mt-1">
                      {suggestion.type}
                    </div>
                  )}
                </div>
                
                {index === selectedSuggestionIndex && (
                  <div className="text-blue-500 text-xs ml-2">
                    Press Enter
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </form>

      {/* Search Instructions */}
      {isFocused && !showSuggestions && localValue.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Type to search and see live results</div>
            <div>• Use ↑↓ arrows to navigate suggestions</div>
            <div>• Press Enter to search or select</div>
            <div>• Press Esc to clear or close</div>
          </div>
        </div>
      )}
    </div>
  );
}
