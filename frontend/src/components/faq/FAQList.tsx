'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ViewColumnsIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

import { Pagination } from '@/components/ui/Pagination';
import { cn } from '@/lib/utils';
import FAQItem from './FAQItem';
import type { FAQ, FAQCategoryData } from './FAQCategory';

// Types and Interfaces
export interface FAQListProps {
  faqs: FAQ[];
  categories?: FAQCategoryData[];
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  selectedFilters?: FAQFilters;
  onFiltersChange?: (filters: FAQFilters) => void;
  viewMode?: 'list' | 'grid' | 'compact';
  onViewModeChange?: (mode: 'list' | 'grid' | 'compact') => void;
  sortBy?: FAQSortOption;
  onSortChange?: (sort: FAQSortOption) => void;
  className?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  showViewModes?: boolean;
  showPagination?: boolean;
  itemsPerPage?: number;
  enableAnimations?: boolean;
  loading?: boolean;
  emptyStateMessage?: string;
  onFAQVote?: (faqId: string, voteType: 'up' | 'down') => void;
  onFAQBookmark?: (faqId: string) => void;
  onFAQShare?: (faqId: string) => void;
}

export interface FAQFilters {
  categories: string[];
  tags: string[];
  status: FAQ['status'][];
  difficulty: FAQ['difficulty'][];
  dateRange?: {
    start: string;
    end: string;
  };
  hasBookmarks?: boolean;
  minVotes?: number;
}

export type FAQSortOption = 
  | 'relevance' 
  | 'date-desc' 
  | 'date-asc' 
  | 'votes-desc' 
  | 'votes-asc' 
  | 'views-desc' 
  | 'views-asc' 
  | 'alphabetical';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

const filterVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { 
    opacity: 1, 
    height: 'auto',
    transition: { duration: 0.3 }
  }
};

// Utility functions
const filterFAQs = (faqs: FAQ[], filters: FAQFilters, searchTerm?: string) => {
  let filtered = [...faqs];

  // Search filter
  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(faq => 
      faq.question.toLowerCase().includes(term) ||
      faq.answer.toLowerCase().includes(term) ||
      faq.tags.some(tag => tag.toLowerCase().includes(term)) ||
      faq.category.toLowerCase().includes(term)
    );
  }

  // Category filter
  if (filters.categories.length > 0) {
    filtered = filtered.filter(faq => filters.categories.includes(faq.category));
  }

  // Tags filter
  if (filters.tags.length > 0) {
    filtered = filtered.filter(faq => 
      filters.tags.some(tag => faq.tags.includes(tag))
    );
  }

  // Status filter
  if (filters.status.length > 0) {
    filtered = filtered.filter(faq => filters.status.includes(faq.status));
  }

  // Difficulty filter
  if (filters.difficulty.length > 0) {
    filtered = filtered.filter(faq => filters.difficulty.includes(faq.difficulty));
  }

  // Date range filter
  if (filters.dateRange) {
    const start = new Date(filters.dateRange.start);
    const end = new Date(filters.dateRange.end);
    filtered = filtered.filter(faq => {
      const faqDate = new Date(faq.lastUpdated);
      return faqDate >= start && faqDate <= end;
    });
  }

  // Bookmarks filter
  if (filters.hasBookmarks) {
    filtered = filtered.filter(faq => faq.isBookmarked);
  }

  // Minimum votes filter
  if (filters.minVotes !== undefined && filters.minVotes > 0) {
    filtered = filtered.filter(faq => 
      (faq.votes.upvotes - faq.votes.downvotes) >= filters.minVotes!
    );
  }

  return filtered;
};

const sortFAQs = (faqs: FAQ[], sortBy: FAQSortOption) => {
  const sorted = [...faqs];

  switch (sortBy) {
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime());
    case 'votes-desc':
      return sorted.sort((a, b) => 
        (b.votes.upvotes - b.votes.downvotes) - (a.votes.upvotes - a.votes.downvotes)
      );
    case 'votes-asc':
      return sorted.sort((a, b) => 
        (a.votes.upvotes - a.votes.downvotes) - (b.votes.upvotes - b.votes.downvotes)
      );
    case 'views-desc':
      return sorted.sort((a, b) => b.views - a.views);
    case 'views-asc':
      return sorted.sort((a, b) => a.views - b.views);
    case 'alphabetical':
      return sorted.sort((a, b) => a.question.localeCompare(b.question));
    case 'relevance':
    default:
      return sorted; // Keep original order for relevance
  }
};

const getUniqueValues = (faqs: FAQ[], key: keyof FAQ) => {
  const values = faqs.map(faq => faq[key]).flat();
  return Array.from(new Set(values)) as string[];
};

// Main Component
const FAQList: React.FC<FAQListProps> = ({
  faqs,
  categories = [],
  searchTerm = '',
  onSearchChange,
  selectedFilters = {
    categories: [],
    tags: [],
    status: [],
    difficulty: [],
    hasBookmarks: false
  },
  onFiltersChange,
  viewMode = 'list',
  onViewModeChange,
  sortBy = 'relevance',
  onSortChange,
  className,
  showFilters = true,
  showSearch = true,
  showViewModes = true,
  showPagination = true,
  itemsPerPage = 10,
  enableAnimations = true,
  loading = false,
  emptyStateMessage = 'No FAQs found matching your criteria.',
  onFAQVote,
  onFAQBookmark,
  onFAQShare
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(localSearchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearchChange]);

  // Filter and sort FAQs
  const processedFAQs = useMemo(() => {
    const filtered = filterFAQs(faqs, selectedFilters, searchTerm);
    return sortFAQs(filtered, sortBy);
  }, [faqs, selectedFilters, searchTerm, sortBy]);

  // Pagination
  const totalPages = Math.ceil(processedFAQs.length / itemsPerPage);
  const paginatedFAQs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedFAQs.slice(start, start + itemsPerPage);
  }, [processedFAQs, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilters, searchTerm, sortBy]);

  // Get unique values for filter dropdowns
  const uniqueCategories = useMemo(() => 
    categories.length > 0 
      ? categories.map(cat => cat.name)
      : getUniqueValues(faqs, 'category'), 
    [categories, faqs]
  );
  
  const uniqueTags = useMemo(() => getUniqueValues(faqs, 'tags'), [faqs]);

  // Filter handlers
  const handleFilterChange = useCallback((key: keyof FAQFilters, value: string[] | boolean | number | undefined) => {
    const newFilters = { ...selectedFilters, [key]: value };
    onFiltersChange?.(newFilters);
  }, [selectedFilters, onFiltersChange]);

  const clearFilters = useCallback(() => {
    const clearedFilters: FAQFilters = {
      categories: [],
      tags: [],
      status: [],
      difficulty: [],
      hasBookmarks: false
    };
    onFiltersChange?.(clearedFilters);
    setLocalSearchTerm('');
    onSearchChange?.('');
  }, [onFiltersChange, onSearchChange]);

  const hasActiveFilters = useMemo(() => {
    return (
      selectedFilters.categories.length > 0 ||
      selectedFilters.tags.length > 0 ||
      selectedFilters.status.length > 0 ||
      selectedFilters.difficulty.length > 0 ||
      selectedFilters.hasBookmarks ||
      (selectedFilters.minVotes && selectedFilters.minVotes > 0) ||
      searchTerm.trim().length > 0
    );
  }, [selectedFilters, searchTerm]);

  // View mode icons
  const viewModeIcons = {
    list: ListBulletIcon,
    grid: Squares2X2Icon,
    compact: ViewColumnsIcon
  };

  // Sort options
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'votes-desc', label: 'Most Voted' },
    { value: 'votes-asc', label: 'Least Voted' },
    { value: 'views-desc', label: 'Most Viewed' },
    { value: 'views-asc', label: 'Least Viewed' },
    { value: 'alphabetical', label: 'A to Z' }
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        {showSearch && (
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {localSearchTerm && (
              <button
                onClick={() => {
                  setLocalSearchTerm('');
                  onSearchChange?.('');
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Clear search"
                aria-label="Clear search"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left side - Filters and Results */}
          <div className="flex items-center gap-4">
            {showFilters && (
              <Button
                variant={showFiltersPanel ? 'default' : 'outline'}
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="gap-2"
              >
                <FunnelIcon className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" size="sm">
                    {Object.values(selectedFilters).flat().filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            )}

            <div className="text-sm text-gray-600">
              Showing {processedFAQs.length} of {faqs.length} FAQs
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Right side - Sort and View */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-500" />
              <Select
                options={sortOptions.map(option => ({ value: option.value, label: option.label }))}
                value={sortBy}
                onValueChange={(value) => onSortChange?.(value as FAQSortOption)}
                placeholder="Sort by..."
              />
            </div>

            {/* View Mode Buttons */}
            {showViewModes && (
              <div className="flex items-center border rounded-lg">
                {Object.entries(viewModeIcons).map(([mode, Icon]) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange?.(mode as typeof viewMode)}
                    className="rounded-none first:rounded-l-lg last:rounded-r-lg"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFiltersPanel && (
            <motion.div
              variants={enableAnimations ? filterVariants : undefined}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ overflow: 'hidden' }}
            >
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Categories Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Categories</label>
                    <Select
                      options={uniqueCategories.map(cat => ({ value: cat, label: cat }))}
                      value=""
                      onValueChange={(value) => {
                        const valueStr = value as string;
                        if (!selectedFilters.categories.includes(valueStr)) {
                          handleFilterChange('categories', [...selectedFilters.categories, valueStr]);
                        }
                      }}
                      placeholder="Select categories..."
                    />
                    
                    {selectedFilters.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedFilters.categories.map((category) => (
                          <Badge 
                            key={category} 
                            variant="secondary"
                            className="gap-1"
                          >
                            {category}
                            <button
                              onClick={() => handleFilterChange(
                                'categories', 
                                selectedFilters.categories.filter(c => c !== category)
                              )}
                              title={`Remove ${category} filter`}
                              aria-label={`Remove ${category} filter`}
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tags Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <Select
                      options={uniqueTags.map(tag => ({ value: tag, label: tag }))}
                      value=""
                      onValueChange={(value) => {
                        const valueStr = value as string;
                        if (!selectedFilters.tags.includes(valueStr)) {
                          handleFilterChange('tags', [...selectedFilters.tags, valueStr]);
                        }
                      }}
                      placeholder="Select tags..."
                    />
                    
                    {selectedFilters.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedFilters.tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary"
                            className="gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => handleFilterChange(
                                'tags', 
                                selectedFilters.tags.filter(t => t !== tag)
                              )}
                              title={`Remove ${tag} filter`}
                              aria-label={`Remove ${tag} filter`}
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <Select
                      options={[
                        { value: 'answered', label: 'Answered' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'draft', label: 'Draft' }
                      ]}
                      value=""
                      onValueChange={(value) => {
                        const statusValue = value as FAQ['status'];
                        if (!selectedFilters.status.includes(statusValue)) {
                          handleFilterChange('status', [...selectedFilters.status, statusValue]);
                        }
                      }}
                      placeholder="Select status..."
                    />
                    
                    {selectedFilters.status.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedFilters.status.map((status) => (
                          <Badge 
                            key={status} 
                            variant="secondary"
                            className="gap-1"
                          >
                            {status}
                            <button
                              onClick={() => handleFilterChange(
                                'status', 
                                selectedFilters.status.filter(s => s !== status)
                              )}
                              title={`Remove ${status} filter`}
                              aria-label={`Remove ${status} filter`}
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <Select
                      options={[
                        { value: 'beginner', label: 'Beginner' },
                        { value: 'intermediate', label: 'Intermediate' },
                        { value: 'advanced', label: 'Advanced' }
                      ]}
                      value=""
                      onValueChange={(value) => {
                        const difficultyValue = value as FAQ['difficulty'];
                        if (!selectedFilters.difficulty.includes(difficultyValue)) {
                          handleFilterChange('difficulty', [...selectedFilters.difficulty, difficultyValue]);
                        }
                      }}
                      placeholder="Select difficulty..."
                    />
                    
                    {selectedFilters.difficulty.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedFilters.difficulty.map((difficulty) => (
                          <Badge 
                            key={difficulty} 
                            variant="secondary"
                            className="gap-1"
                          >
                            {difficulty}
                            <button
                              onClick={() => handleFilterChange(
                                'difficulty', 
                                selectedFilters.difficulty.filter(d => d !== difficulty)
                              )}
                              title={`Remove ${difficulty} filter`}
                              aria-label={`Remove ${difficulty} filter`}
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAQ List */}
      <motion.div
        variants={enableAnimations ? containerVariants : undefined}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading FAQs...</p>
          </div>
        ) : paginatedFAQs.length > 0 ? (
          <div className={cn(
            'space-y-4',
            viewMode === 'grid' && 'grid grid-cols-1 md:grid-cols-2 gap-6 space-y-0',
            viewMode === 'compact' && 'space-y-2'
          )}>
            {paginatedFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                variants={enableAnimations ? itemVariants : undefined}
                style={{ 
                  animationDelay: enableAnimations ? `${index * 0.1}s` : undefined 
                }}
              >
                <FAQItem
                  faq={faq}
                  onVote={onFAQVote}
                  onBookmark={onFAQBookmark}
                  onShare={onFAQShare}
                  searchTerm={searchTerm}
                  compact={viewMode === 'compact'}
                  showMetadata={viewMode !== 'compact'}
                  enableAnimations={enableAnimations}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs Found</h3>
            <p className="text-gray-600 mb-4">{emptyStateMessage}</p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showFirstLast={true}
            showPrevNext={true}
          />
        </div>
      )}
    </div>
  );
};

export default FAQList;
