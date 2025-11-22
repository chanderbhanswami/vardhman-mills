/**
 * Compare Components - Vardhman Mills Frontend
 * 
 * Centralized exports for all product comparison components.
 * These components enable users to compare multiple products
 * side-by-side with detailed specifications and features.
 * 
 * @module components/compare
 * @version 1.0.0
 */

// ============================================================================
// MAIN COMPARE COMPONENTS
// ============================================================================

export { default as CompareBar } from './CompareBar';
export { default as CompareTable } from './CompareTable';
export { default as CompareProductCard } from './CompareProductCard';
export { default as CompareActions } from './CompareActions';

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

export { default as CompareEmptyState } from './CompareEmptyState';
export { default as CompareSkeleton } from './CompareSkeleton';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Component Props
export type { CompareBarProps } from './CompareBar';
export type { CompareTableProps } from './CompareTable';
export type { CompareProductCardProps } from './CompareProductCard';
export type { CompareActionsProps, ShareMethod, ExportFormat, SaveComparisonData } from './CompareActions';
export type { CompareEmptyStateProps } from './CompareEmptyState';
export type { CompareSkeletonProps } from './CompareSkeleton';
