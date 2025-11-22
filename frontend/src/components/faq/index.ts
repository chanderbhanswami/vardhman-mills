// FAQ Components Export File
// This file exports all FAQ-related components

// Main FAQ Components
export { default as FAQCategory } from './FAQCategory';
export { default as FAQItem } from './FAQItem';
export { default as FAQList } from './FAQList';
export { default as FAQSearch } from './FAQSearch';

// Skeleton Components
export { 
  default as FAQSkeleton,
  FAQSkeletonList,
  FAQCategorySkeleton,
  FAQSearchSkeleton,
  FAQFilterSkeleton,
  FAQStatsSkeleton
} from './FAQSkeleton';

// Export types from components
export type { FAQ, FAQCategoryData, FAQCategoryProps } from './FAQCategory';
export type { FAQItemProps } from './FAQItem';
export type { 
  FAQListProps, 
  FAQFilters, 
  FAQSortOption 
} from './FAQList';
export type { 
  FAQSearchProps, 
  SearchSuggestion, 
  SearchResult 
} from './FAQSearch';
export type { FAQSkeletonProps } from './FAQSkeleton';
