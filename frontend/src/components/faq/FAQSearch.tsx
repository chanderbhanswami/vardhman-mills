'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  TagIcon,
  ArrowRightIcon,
  CommandLineIcon,
  AdjustmentsHorizontalIcon,
  ArrowTrendingUpIcon,
  FolderIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { FAQ, FAQCategoryData } from './FAQCategory';

// Types and Interfaces
export interface FAQSearchProps {
  faqs: FAQ[];
  categories?: FAQCategoryData[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearchSubmit?: (term: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  showRecentSearches?: boolean;
  showPopularQueries?: boolean;
  showAdvancedFilters?: boolean;
  maxSuggestions?: number;
  maxRecentSearches?: number;
  enableFuzzySearch?: boolean;
  className?: string;
  autoFocus?: boolean;
  enableAnimations?: boolean;
  onFAQSelect?: (faq: FAQ) => void;
  searchHistory?: string[];
  onSearchHistoryUpdate?: (history: string[]) => void;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'faq' | 'category' | 'tag' | 'query';
  relevance: number;
  metadata?: {
    category?: string;
    faqId?: string;
    matchType?: 'title' | 'content' | 'tag';
  };
}

export interface SearchResult {
  faq: FAQ;
  score: number;
  highlights: {
    question?: string;
    answer?: string;
    tags?: string[];
  };
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2 }
  }
};

const suggestionVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { 
    opacity: 1, 
    height: 'auto',
    transition: { duration: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 }
  },
  hover: {
    x: 4,
    transition: { duration: 0.1 }
  }
};

// Utility functions
const fuzzySearch = (query: string, text: string): number => {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  if (textLower.includes(queryLower)) {
    return 1 - (textLower.indexOf(queryLower) / textLower.length);
  }
  
  // Simple fuzzy matching algorithm
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 1;
      queryIndex++;
    }
  }
  
  return queryIndex === queryLower.length ? score / query.length * 0.7 : 0;
};

const generateSuggestions = (
  query: string,
  faqs: FAQ[],
  categories: FAQCategoryData[] = [],
  enableFuzzy = true,
  maxSuggestions = 8
): SearchSuggestion[] => {
  if (!query.trim()) return [];

  const suggestions: SearchSuggestion[] = [];
  const queryLower = query.toLowerCase();

  // FAQ suggestions
  faqs.forEach(faq => {
    const questionScore = enableFuzzy 
      ? fuzzySearch(query, faq.question)
      : faq.question.toLowerCase().includes(queryLower) ? 0.9 : 0;
    
    const answerScore = enableFuzzy 
      ? fuzzySearch(query, faq.answer) * 0.7
      : faq.answer.toLowerCase().includes(queryLower) ? 0.6 : 0;
    
    const tagScore = faq.tags.some(tag => 
      enableFuzzy 
        ? fuzzySearch(query, tag) > 0.5
        : tag.toLowerCase().includes(queryLower)
    ) ? 0.8 : 0;

    const maxScore = Math.max(questionScore, answerScore, tagScore);
    
    if (maxScore > 0.3) {
      suggestions.push({
        id: `faq-${faq.id}`,
        text: faq.question,
        type: 'faq',
        relevance: maxScore,
        metadata: {
          category: faq.category,
          faqId: faq.id,
          matchType: questionScore > answerScore 
            ? (questionScore > tagScore ? 'title' : 'tag')
            : (answerScore > tagScore ? 'content' : 'tag')
        }
      });
    }
  });

  // Category suggestions
  categories.forEach(category => {
    const score = enableFuzzy 
      ? fuzzySearch(query, category.name)
      : category.name.toLowerCase().includes(queryLower) ? 0.8 : 0;
    
    if (score > 0.3) {
      suggestions.push({
        id: `category-${category.id}`,
        text: category.name,
        type: 'category',
        relevance: score,
        metadata: { category: category.name }
      });
    }
  });

  // Tag suggestions
  const allTags = Array.from(new Set(faqs.flatMap(faq => faq.tags)));
  allTags.forEach(tag => {
    const score = enableFuzzy 
      ? fuzzySearch(query, tag)
      : tag.toLowerCase().includes(queryLower) ? 0.7 : 0;
    
    if (score > 0.3) {
      suggestions.push({
        id: `tag-${tag}`,
        text: tag,
        type: 'tag',
        relevance: score
      });
    }
  });

  // Sort by relevance and limit
  return suggestions
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, maxSuggestions);
};

const getPopularQueries = (): string[] => {
  // In a real app, this would come from analytics
  return [
    'shipping costs',
    'return policy',
    'payment methods',
    'order tracking',
    'product warranty',
    'bulk discounts',
    'international shipping',
    'size guide'
  ];
};

const saveToSearchHistory = (term: string, onUpdate?: (history: string[]) => void) => {
  if (!term.trim()) return;
  
  try {
    const existing = JSON.parse(localStorage.getItem('faq-search-history') || '[]');
    const updated = [term, ...existing.filter((item: string) => item !== term)].slice(0, 10);
    localStorage.setItem('faq-search-history', JSON.stringify(updated));
    onUpdate?.(updated);
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
};

const loadSearchHistory = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('faq-search-history') || '[]');
  } catch {
    return [];
  }
};

// Main Component
const FAQSearch: React.FC<FAQSearchProps> = ({
  faqs,
  categories = [],
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  placeholder = 'Search FAQs...',
  showSuggestions = true,
  showRecentSearches = true,
  showPopularQueries = true,
  showAdvancedFilters = false,
  maxSuggestions = 8,
  maxRecentSearches = 5,
  enableFuzzySearch = true,
  className,
  autoFocus = false,
  enableAnimations = true,
  onFAQSelect,
  searchHistory: externalHistory,
  onSearchHistoryUpdate
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load search history on mount
  useEffect(() => {
    if (externalHistory) {
      setRecentSearches(externalHistory);
    } else {
      setRecentSearches(loadSearchHistory());
    }
  }, [externalHistory]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Generate suggestions
  const suggestions = useMemo(() => {
    if (!localSearchTerm.trim() || !showSuggestions) return [];
    
    return generateSuggestions(
      localSearchTerm,
      faqs,
      categories,
      enableFuzzySearch,
      maxSuggestions
    );
  }, [localSearchTerm, faqs, categories, enableFuzzySearch, maxSuggestions, showSuggestions]);

  // Popular queries
  const popularQueries = useMemo(() => getPopularQueries(), []);

  // Combined dropdown items
  const dropdownItems = useMemo(() => {
    const items: Array<{
      type: 'suggestion' | 'recent' | 'popular' | 'section';
      data: SearchSuggestion | string;
      label?: string;
    }> = [];

    // Add suggestions
    if (suggestions.length > 0) {
      items.push({ type: 'section' as const, data: '', label: 'Suggestions' });
      suggestions.forEach(suggestion => {
        items.push({ type: 'suggestion' as const, data: suggestion });
      });
    }

    // Add recent searches (when no search term)
    if (!localSearchTerm.trim() && showRecentSearches && recentSearches.length > 0) {
      items.push({ type: 'section' as const, data: '', label: 'Recent Searches' });
      recentSearches.slice(0, maxRecentSearches).forEach(search => {
        items.push({ type: 'recent' as const, data: search });
      });
    }

    // Add popular queries (when no search term)
    if (!localSearchTerm.trim() && showPopularQueries) {
      items.push({ type: 'section' as const, data: '', label: 'Popular Queries' });
      popularQueries.slice(0, 6).forEach(query => {
        items.push({ type: 'popular' as const, data: query });
      });
    }

    return items;
  }, [
    suggestions, 
    localSearchTerm, 
    recentSearches, 
    popularQueries, 
    showRecentSearches, 
    showPopularQueries, 
    maxRecentSearches
  ]);

  // Debounced search
  useEffect(() => {
    if (isComposing) return;
    
    const timer = setTimeout(() => {
      onSearchChange(localSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearchChange, isComposing]);

  // Handle search submission
  const handleSubmit = useCallback((term: string = localSearchTerm) => {
    if (!term.trim()) return;
    
    saveToSearchHistory(term, onSearchHistoryUpdate);
    setRecentSearches(prev => [term, ...prev.filter(item => item !== term)].slice(0, 10));
    setShowDropdown(false);
    onSearchSubmit?.(term);
  }, [localSearchTerm, onSearchSubmit, onSearchHistoryUpdate]);

  // Handle item selection
    const handleItemSelect = useCallback((item: { type: string; data: SearchSuggestion | string }) => {
    if (item.type === 'suggestion') {
      const suggestion = item.data as SearchSuggestion;
      
      if (suggestion.type === 'faq' && suggestion.metadata?.faqId) {
        const faq = faqs.find(f => f.id === suggestion.metadata!.faqId);
        if (faq && onFAQSelect) {
          onFAQSelect(faq);
          setShowDropdown(false);
          return;
        }
      }
      
      setLocalSearchTerm(suggestion.text);
      handleSubmit(suggestion.text);
    } else {
      const searchTerm = item.data as string;
      setLocalSearchTerm(searchTerm);
      handleSubmit(searchTerm);
    }
  }, [faqs, onFAQSelect, handleSubmit]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown || dropdownItems.length === 0) return;

    const selectableItems = dropdownItems.filter(item => item.type !== 'section');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < selectableItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < selectableItems.length) {
          handleItemSelect(selectableItems[selectedIndex]);
        } else {
          handleSubmit();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showDropdown, dropdownItems, selectedIndex, handleItemSelect, handleSubmit]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon for suggestion type
  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'faq':
        return <QuestionMarkCircleIcon className="h-4 w-4" />;
      case 'category':
        return <FolderIcon className="h-4 w-4" />;
      case 'tag':
        return <TagIcon className="h-4 w-4" />;
      default:
        return <MagnifyingGlassIcon className="h-4 w-4" />;
    }
  };

  // Get badge for suggestion type
  const getSuggestionBadge = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'faq':
        return <Badge variant="secondary" size="sm">FAQ</Badge>;
      case 'category':
        return <Badge variant="outline" size="sm">Category</Badge>;
      case 'tag':
        return <Badge variant="outline" size="sm">Tag</Badge>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={cn('relative w-full', className)}
      variants={enableAnimations ? containerVariants : undefined}
      initial="hidden"
      animate="visible"
    >
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          className="pl-10 pr-12"
        />

        <div className="absolute inset-y-0 right-0 flex items-center">
          {localSearchTerm && (
            <button
              onClick={() => {
                setLocalSearchTerm('');
                onSearchChange('');
                inputRef.current?.focus();
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          
          {showAdvancedFilters && (
            <button
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Advanced Filters"
              aria-label="Advanced Filters"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => handleSubmit()}
            className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
            title="Search"
            aria-label="Search"
          >
            <CommandLineIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && dropdownItems.length > 0 && (
          <motion.div
            ref={dropdownRef}
            variants={enableAnimations ? suggestionVariants : undefined}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute top-full left-0 right-0 z-50 mt-1"
          >
            <Card className="max-h-96 overflow-y-auto shadow-lg border">
              <div className="p-2">
                {dropdownItems.map((item, index) => {
                  if (item.type === 'section') {
                    return (
                      <div
                        key={`section-${item.label}`}
                        className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {item.label}
                      </div>
                    );
                  }

                  const selectableIndex = dropdownItems
                    .slice(0, index)
                    .filter(i => i.type !== 'section').length;
                  
                  const isSelected = selectedIndex === selectableIndex;

                  return (
                    <motion.button
                      key={`${item.type}-${typeof item.data === 'string' ? item.data : item.data.id}`}
                      variants={enableAnimations ? itemVariants : undefined}
                      whileHover={enableAnimations ? "hover" : undefined}
                      onClick={() => handleItemSelect(item)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors',
                        isSelected 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-gray-50 text-gray-900'
                      )}
                    >
                      {/* Icon */}
                      <div className={cn(
                        'flex-shrink-0',
                        isSelected ? 'text-blue-600' : 'text-gray-400'
                      )}>
                        {item.type === 'suggestion' ? (
                          getSuggestionIcon(item.data as SearchSuggestion)
                        ) : item.type === 'recent' ? (
                          <ClockIcon className="h-4 w-4" />
                        ) : (
                          <ArrowTrendingUpIcon className="h-4 w-4" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate">
                            {typeof item.data === 'string' ? item.data : item.data.text}
                          </span>
                          
                          {item.type === 'suggestion' && getSuggestionBadge(item.data as SearchSuggestion)}
                        </div>
                        
                        {item.type === 'suggestion' && (item.data as SearchSuggestion).metadata?.category && (
                          <div className="text-xs text-gray-500 mt-1">
                            in {(item.data as SearchSuggestion).metadata!.category}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className={cn(
                        'flex-shrink-0',
                        isSelected ? 'text-blue-600' : 'text-gray-300'
                      )}>
                        <ArrowRightIcon className="h-4 w-4" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FAQSearch;
