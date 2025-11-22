/**
 * Hooks Index
 * Central export point for all custom React hooks
 */

// Core Hooks
export { useCart } from './useCart';
export type { CartItem, UseCartReturn } from './useCart';

export { useWishlist } from './useWishlist';
export type { WishlistItem, UseWishlistReturn } from './useWishlist';

export { useAuth } from './auth/useAuth';
export type { User, UseAuthReturn } from './auth/useAuth';

export { useToast } from './useToast';
export type { ToastOptions } from './useToast';

export { useImagePreloader } from './useImagePreloader';
export { usePushNotifications } from './usePushNotifications';
export { useUserProfile } from './useUserProfile';

// Common Hooks
export { useDebounce } from './common/useDebounce';
export { useMediaQuery } from './common/useMediaQuery';

// LocalStorage Hooks
export { useLocalStorage } from './localStorage/useLocalStorage';

// Re-export from subdirectories (when needed)
// These can be added as the project grows
