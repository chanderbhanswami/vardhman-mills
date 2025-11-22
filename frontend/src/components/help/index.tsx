/**
 * Help Components Module
 * 
 * This module exports all Help-related components for the Vardhman Mills application.
 * These components provide comprehensive help functionality including FAQs, 
 * size guides, help articles, and user assistance features.
 * 
 * @author Vardhman Mills Development Team
 * @version 1.0.0
 * @created 2024-01-15
 */

import React from 'react';

// Re-export all components with both default and named exports
export { default as HelpBanner } from './HelpBanner';
export type { HelpBannerProps } from './HelpBanner';

export { default as HelpCard } from './HelpCard';
export type { HelpCardProps } from './HelpCard';

export { default as HelpCategoryList } from './HelpCategoryList';
export type { HelpCategoryListProps } from './HelpCategoryList';

export { default as HelpConfirmation } from './HelpConfirmation';
export type { HelpConfirmationProps } from './HelpConfirmation';

export { default as HelpDetails } from './HelpDetails';
export type { HelpDetailsProps } from './HelpDetails';

export { default as HelpFeedback } from './HelpFeedback';
export type { HelpFeedbackProps } from './HelpFeedback';

export { default as HelpForm } from './HelpForm';
export type { HelpFormProps } from './HelpForm';

export { default as HelpList } from './HelpList';
export type { HelpListProps } from './HelpList';

export { default as HelpSearch } from './HelpSearch';
export type { HelpSearchProps } from './HelpSearch';

export { default as HelpSidebar } from './HelpSidebar';
export type { HelpSidebarProps } from './HelpSidebar';

export { default as HelpSkeleton } from './HelpSkeleton';
export type { HelpSkeletonProps } from './HelpSkeleton';

export { default as SizeGuide } from './SizeGuide';
export type { SizeGuideProps } from './SizeGuide';

// Component Groups for organized imports
export const HelpComponents = {
  HelpBanner: React.lazy(() => import('./HelpBanner')),
  HelpCard: React.lazy(() => import('./HelpCard')),
  HelpCategoryList: React.lazy(() => import('./HelpCategoryList')),
  HelpConfirmation: React.lazy(() => import('./HelpConfirmation')),
  HelpDetails: React.lazy(() => import('./HelpDetails')),
  HelpFeedback: React.lazy(() => import('./HelpFeedback')),
  HelpForm: React.lazy(() => import('./HelpForm')),
  HelpList: React.lazy(() => import('./HelpList')),
  HelpSearch: React.lazy(() => import('./HelpSearch')),
  HelpSidebar: React.lazy(() => import('./HelpSidebar')),
  HelpSkeleton: React.lazy(() => import('./HelpSkeleton')),
  SizeGuide: React.lazy(() => import('./SizeGuide'))
};

// Utility functions for component identification
export const isHelpComponent = (componentName: string): boolean => {
  return componentName.startsWith('Help') || componentName === 'SizeGuide';
};

export const getComponentCategory = (componentName: string): 'help' | 'other' => {
  if (isHelpComponent(componentName)) return 'help';
  return 'other';
};

// Component metadata for documentation and tooling
export const componentMetadata = {
  help: {
    components: [
      'HelpBanner',
      'HelpCard', 
      'HelpCategoryList',
      'HelpConfirmation',
      'HelpDetails',
      'HelpFeedback',
      'HelpForm',
      'HelpList',
      'HelpSearch',
      'HelpSidebar',
      'HelpSkeleton',
      'SizeGuide'
    ],
    description: 'Comprehensive help system components for user assistance',
    features: [
      'Help article management',
      'Multi-step form wizards',
      'Advanced search capabilities',
      'User feedback collection',
      'Size guide functionality',
      'Responsive layouts',
      'Loading state management',
      'Interactive elements',
      'Animation support',
      'TypeScript support'
    ]
  }
};

// Default configurations for components
export const defaultConfigs = {
  help: {
    enableAnimations: true,
    showBreadcrumbs: true,
    showTableOfContents: true,
    showComments: true,
    showRating: true,
    showPrintButton: true,
    showShareButton: true,
    itemsPerPage: 12,
    searchPlaceholder: 'Search help articles...',
    noResultsMessage: 'No help articles found.',
    loadingMessage: 'Loading help content...'
  },
  sizeGuide: {
    enableAnimations: true,
    showSizeCalculator: true,
    showMeasurementTips: true,
    showFitGuide: true,
    showPrintButton: true,
    showShareButton: true,
    defaultCategory: 'clothing',
    defaultGender: 'unisex',
    defaultRegion: 'us'
  }
};

// Filter types for help system
export type HelpFilterValue = string | number | boolean | string[];
export type HelpFilters = Record<string, HelpFilterValue>;

// Event handlers for common functionality
export const helpEventHandlers = {
  onSearch: (query: string, category?: string) => {
    console.log('Help search:', { query, category });
  },
  onFilter: (filters: HelpFilters) => {
    console.log('Help filter:', filters);
  },
  onSort: (sortBy: string, order: 'asc' | 'desc') => {
    console.log('Help sort:', { sortBy, order });
  },
  onItemClick: (itemId: string, itemType: 'help' | 'article') => {
    console.log('Item clicked:', { itemId, itemType });
  },
  onRating: (itemId: string, rating: number) => {
    console.log('Item rated:', { itemId, rating });
  },
  onBookmark: (itemId: string, bookmarked: boolean) => {
    console.log('Item bookmarked:', { itemId, bookmarked });
  },
  onShare: (itemId: string, method: string) => {
    console.log('Item shared:', { itemId, method });
  }
};

/**
 * Hook for managing help system state
 * 
 * @returns Object containing state and handlers for help components
 */
export const useHelpSystem = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = React.useState<HelpFilters>({});
  const [sortConfig, setSortConfig] = React.useState<{ field: string; order: 'asc' | 'desc' }>({ 
    field: 'relevance', 
    order: 'desc' 
  });
  const [bookmarkedItems, setBookmarkedItems] = React.useState<Set<string>>(new Set());

  const handleSearch = React.useCallback((query: string) => {
    setSearchQuery(query);
    helpEventHandlers.onSearch(query, activeCategory || undefined);
  }, [activeCategory]);

  const handleCategoryChange = React.useCallback((category: string | null) => {
    setActiveCategory(category);
    if (searchQuery) {
      helpEventHandlers.onSearch(searchQuery, category || undefined);
    }
  }, [searchQuery]);

  const handleFilterChange = React.useCallback((filters: HelpFilters) => {
    setSelectedFilters(filters);
    helpEventHandlers.onFilter(filters);
  }, []);

  const handleSortChange = React.useCallback((field: string, order: 'asc' | 'desc') => {
    setSortConfig({ field, order });
    helpEventHandlers.onSort(field, order);
  }, []);

  const handleBookmarkToggle = React.useCallback((itemId: string) => {
    setBookmarkedItems(prev => {
      const newSet = new Set(prev);
      const isBookmarked = newSet.has(itemId);
      if (isBookmarked) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      helpEventHandlers.onBookmark(itemId, !isBookmarked);
      return newSet;
    });
  }, []);

  return {
    // State
    searchQuery,
    activeCategory,
    selectedFilters,
    sortConfig,
    bookmarkedItems,
    
    // Handlers
    handleSearch,
    handleCategoryChange,
    handleFilterChange,
    handleSortChange,
    handleBookmarkToggle,
    
    // Utilities
    isBookmarked: (itemId: string) => bookmarkedItems.has(itemId),
    clearFilters: () => setSelectedFilters({}),
    resetSearch: () => setSearchQuery(''),
    resetAll: () => {
      setSearchQuery('');
      setActiveCategory(null);
      setSelectedFilters({});
      setSortConfig({ field: 'relevance', order: 'desc' });
    }
  };
};
