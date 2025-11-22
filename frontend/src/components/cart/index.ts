/**
 * Cart Components - Vardhman Mills Frontend
 * 
 * Comprehensive cart management system with:
 * - Shopping cart pages and displays
 * - Cart drawers and mini cart
 * - Add to cart functionality
 * - Cart notifications and alerts
 * - Cart recovery and save for later
 * - Product recommendations
 * - Cart progress indicators
 * - Cart validation
 * - Product comparison
 * - Cart sharing
 * - Quick view modal
 * - Upsell recommendations
 * - Loading skeletons
 * 
 * @module components/cart
 */

// ============================================================================
// CART PAGE COMPONENTS
// ============================================================================

export * from './CartPage';

// ============================================================================
// CART DRAWER COMPONENTS
// ============================================================================

// Export CartDrawer components with explicit names to avoid conflicts
export { CartDrawer } from './CartDrawer';
export { CartActions } from './CartDrawer';
export { CartItem as CartDrawerItem } from './CartDrawer';
export { CartSummary as CartDrawerSummary } from './CartDrawer';
export type { CartDrawerProps, CartActionsProps } from './CartDrawer';

// ============================================================================
// ADD TO CART
// ============================================================================

export * from './AddToCartButton';

// ============================================================================
// MINI CART
// ============================================================================

export * from './MiniCart';

// ============================================================================
// CART NOTIFICATIONS
// ============================================================================

export * from './CartNotification';

// ============================================================================
// CART RECOVERY
// ============================================================================

export * from './CartRecovery';

// ============================================================================
// CART RECOMMENDATIONS
// ============================================================================

export * from './CartRecommendations';

// ============================================================================
// CART PROGRESS
// ============================================================================

export * from './CartProgress';

// ============================================================================
// CART VALIDATION
// ============================================================================

export * from './CartValidation';

// ============================================================================
// CART COMPARISON
// ============================================================================

export * from './CartComparison';

// ============================================================================
// CART SHARING
// ============================================================================

export * from './CartSharing';

// ============================================================================
// SAVE FOR LATER
// ============================================================================

export * from './SaveForLater';

// ============================================================================
// QUICK VIEW
// ============================================================================

export * from './QuickView';

// ============================================================================
// CART UPSELL
// ============================================================================

export * from './CartUpsell';

// ============================================================================
// LOADING SKELETONS
// ============================================================================

export * from './CartSkeleton';
export * from './MiniCartSkeleton';
