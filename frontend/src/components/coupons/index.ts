/**
 * Coupon Components - Vardhman Mills Frontend
 * 
 * Centralized exports for all coupon and discount-related components.
 * These components handle coupon display, application, validation,
 * and management throughout the shopping experience.
 * 
 * @module components/coupons
 * @version 1.0.0
 */

// ============================================================================
// MAIN COUPON COMPONENTS
// ============================================================================

export { default as CouponInput } from './CouponInput';
export { default as CouponCard } from './CouponCard';
export { default as CouponList } from './CouponList';
export { default as CouponApplied } from './CouponApplied';

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

export { default as CouponError } from './CouponError';
export { default as CouponSkeleton } from './CouponSkeleton';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Component Props
export type { CouponInputProps, CouponInputFormData } from './CouponInput';
export type { CouponCardProps } from './CouponCard';
export type { CouponListProps, CouponFilters } from './CouponList';
export type { CouponAppliedProps } from './CouponApplied';
export type { CouponErrorProps, CouponErrorType, CouponErrorDetails } from './CouponError';
export type { CouponSkeletonProps } from './CouponSkeleton';
