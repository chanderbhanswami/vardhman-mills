/**
 * Providers Index
 * 
 * This file serves as the main entry point for all provider components and their utilities.
 * It provides a clean and organized way to import providers, hooks, and types throughout the application.
 */

import React from 'react';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';
import { useNotifications } from './NotificationProvider';
import { useModal } from './ModalProvider';
import { useTheme } from './ThemeProvider';
import { useWishlist } from './WishlistProvider';
import GlobalProvider from './GlobalProvider';

// Main Global Provider
export { default as GlobalProvider } from './GlobalProvider';
export { GlobalProvider as ProviderWrapper } from './GlobalProvider';

// Individual Providers
export { AuthProvider } from './AuthProvider';
export { CartProvider } from './CartProvider';
export { NotificationProvider } from './NotificationProvider';
export { ModalProvider } from './ModalProvider';
export { ThemeProvider } from './ThemeProvider';
export { WishlistProvider } from './WishlistProvider';
export { QueryProvider } from './QueryProvider';

// Authentication Hooks
export { 
  useAuth
} from './AuthProvider';

// Additional auth hooks (stubs for future implementation)
export const useAuthStatus = () => {
  const { isAuthenticated } = useAuth();
  return { isAuthenticated, isLoading: false };
};
export const useProfile = () => {
  const { user } = useAuth();
  return { profile: user, updateProfile: async () => ({ success: true }) };
};
export const use2FA = () => ({ enabled: false, enable: async () => ({ success: true }), disable: async () => ({ success: true }) });
export const useAddresses = () => ({ addresses: [], addAddress: async () => ({ success: true }), removeAddress: async () => ({ success: true }) });
export const useUserPreferences = () => ({ preferences: {}, updatePreferences: async () => ({ success: true }) });
export const useAdminActions = () => ({ isAdmin: false, adminActions: [] });
export const useGuestUser = () => ({ isGuest: true, convertGuest: async () => ({ success: true }) });
export const useSessionTimeout = () => ({ timeLeft: 0, extend: () => {}, isExpiring: false });

// Cart Hooks
export { 
  useCart
} from './CartProvider';

// Additional cart hooks (stubs for future implementation)
export const useCartSummary = () => {
  const { summary } = useCart();
  return summary;
};
export const useCartActions = () => {
  const { addToCart, removeFromCart, clearCart } = useCart();
  return { addToCart, removeFromCart, clearCart };
};
export const useShipping = () => ({ options: [], selected: null, selectOption: async () => ({ success: true }) });
export const useCoupons = () => ({ coupons: [], applyCoupon: async () => ({ success: true }), removeCoupon: async () => ({ success: true }) });
export const useWishlistCart = () => ({ moveToCart: async () => ({ success: true }), moveToWishlist: async () => ({ success: true }) });
export const useCartComparison = () => ({ compare: [], addToCompare: () => {}, removeFromCompare: () => {} });
export const useCartRecommendations = () => ({ recommendations: [], loadRecommendations: async () => {} });
export const useCartAnalytics = () => ({ analytics: {}, trackEvent: () => {} });

// Notification Hooks
export { 
  useNotifications
} from './NotificationProvider';

// Additional notification hooks (stubs)
export const useNotificationSettings = () => {
  const { settings, updateSettings } = useNotifications();
  return { settings, updateSettings };
};
export const useNotificationHistory = () => ({ history: [], clearHistory: () => {} });
export const useNotificationActions = () => ({ markAllRead: async () => ({ success: true }), clearAll: () => {} });
export const useNotificationAnalytics = () => ({ analytics: {}, track: () => {} });
export const useRealTimeNotifications = () => ({ isConnected: false, connect: () => {}, disconnect: () => {} });

// Modal Hooks
export { 
  useModal
} from './ModalProvider';

// Additional modal hooks (stubs)
export const useModalStack = () => ({ stack: [], pushModal: () => {}, popModal: () => {} });
export const useModalHistory = () => ({ history: [], goBack: () => {}, goForward: () => {} });
export const useModalKeyboard = () => ({ enabled: true, toggle: () => {} });
export const useModalAccessibility = () => ({ enabled: true, toggle: () => {} });

// Theme Hooks
export { 
  useTheme
} from './ThemeProvider';

// Additional theme hooks (stubs)
export const useColorScheme = () => {
  const { settings, setColorScheme } = useTheme();
  return { colorScheme: settings.colorScheme, setColorScheme };
};
export const useFontSize = () => {
  const { settings, setFontSize } = useTheme();
  return { fontSize: settings.fontSize, setFontSize };
};
export const useSpacing = () => {
  const { settings, setSpacing } = useTheme();
  return { spacing: settings.spacing, setSpacing };
};
export const useThemeSettings = () => {
  const { settings } = useTheme();
  return settings;
};
export const useAccessibilityFeatures = () => ({ highContrast: false, reducedMotion: false, toggle: () => {} });
export const useCSSVariables = () => {
  const { getCSSVariables } = useTheme();
  return getCSSVariables();
};
export const useSystemTheme = () => ({ theme: 'light', isSupported: true });

// Wishlist Hooks
export { 
  useWishlist
} from './WishlistProvider';

// Additional wishlist hooks (stubs)
export const useWishlistCollections = () => ({ collections: [], createCollection: async () => ({ success: true }) });
export const useWishlistSharing = () => ({ share: async () => ({ success: true, url: '' }), getShared: async () => ({ success: true }) });
export const useWishlistComparison = () => ({ items: [], addToCompare: () => {}, removeFromCompare: () => {} });
export const useWishlistAnalytics = () => ({ analytics: {}, track: () => {} });
export const useWishlistRecommendations = () => ({ recommendations: [], load: async () => {} });

// React Query Hooks (stubs since QueryProvider doesn't export these)
export const useQueryClient = () => ({ 
  invalidateQueries: async () => {},
  refetchQueries: async () => {},
  clear: () => {}
});
export const useOptimisticUpdate = () => ({ 
  mutate: async () => ({ success: true }),
  rollback: () => {}
});
export const useCacheManager = () => ({ 
  cache: {},
  clear: () => {},
  get: () => null,
  set: () => {}
});
export const useQueryPerformance = () => ({ 
  metrics: {},
  startTimer: () => {},
  endTimer: () => {}
});

// Utility Hooks (stubs since GlobalProvider doesn't export these)
export const useAppState = () => ({ 
  isLoading: false,
  isOnline: true,
  theme: 'light'
});
export const useAppPerformance = () => ({ 
  metrics: {},
  track: () => {}
});
export const useProviderErrorBoundary = () => ({ 
  hasError: false,
  error: null,
  resetError: () => {}
});
export const useDevTools = () => ({ 
  enabled: false,
  toggle: () => {},
  data: {}
});

// Type Exports - Only export types that actually exist

// Authentication Types
export type {
  User,
  Address,
  AuthContextType,
  RegisterData
} from './AuthProvider';

// Cart Types
export type {
  CartItem,
  CartSummary,
  AppliedCoupon,
  ShippingOption,
  CartContextType
} from './CartProvider';

// Notification Types
export type {
  Notification,
  NotificationAction,
  NotificationChannel,
  NotificationSettings,
  NotificationContextType
} from './NotificationProvider';

// Modal Types
export type {
  Modal,
  ModalContextType
} from './ModalProvider';

// Theme Types
export type {
  Theme,
  ColorScheme,
  FontSize,
  Spacing,
  ThemeSettings,
  ThemeContextType
} from './ThemeProvider';

// Wishlist Types
export type {
  WishlistItem,
  WishlistCollection,
  WishlistContextType
} from './WishlistProvider';

// Provider Configuration Types
export interface ProvidersConfig {
  auth?: {
    apiUrl?: string;
    sessionTimeout?: number;
    enableGuestMode?: boolean;
    enable2FA?: boolean;
  };
  cart?: {
    persistToStorage?: boolean;
    maxItems?: number;
    autoMergeGuestCart?: boolean;
  };
  notifications?: {
    maxNotifications?: number;
    defaultChannel?: 'toast' | 'inline';
    enableRealTime?: boolean;
    apiUrl?: string;
  };
  modal?: {
    enableStack?: boolean;
    enableKeyboardNavigation?: boolean;
    enableAccessibility?: boolean;
  };
  theme?: {
    defaultTheme?: 'light' | 'dark' | 'system';
    enableSystem?: boolean;
    storageKey?: string;
  };
  wishlist?: {
    maxItems?: number;
    enableCollections?: boolean;
    enableSharing?: boolean;
  };
  query?: {
    defaultStaleTime?: number;
    defaultCacheTime?: number;
    enableDevtools?: boolean;
  };
}

// Provider Factory Function
export const createProviders = (config?: ProvidersConfig) => {
  const ProviderComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <GlobalProvider
      themeProps={{
        defaultTheme: config?.theme?.defaultTheme,
        enableSystem: config?.theme?.enableSystem,
      }}
    >
      {children}
    </GlobalProvider>
  );
  
  return ProviderComponent;
};

// Hook Collections for organized imports
export const authHooks = {
  useAuth,
  useAuthStatus,
  useProfile,
  use2FA,
  useAddresses,
  useUserPreferences,
  useAdminActions,
  useGuestUser,
  useSessionTimeout
};

export const cartHooks = {
  useCart,
  useCartSummary,
  useCartActions,
  useShipping,
  useCoupons,
  useWishlistCart,
  useCartComparison,
  useCartRecommendations,
  useCartAnalytics
};

export const notificationHooks = {
  useNotifications,
  useNotificationSettings,
  useNotificationHistory,
  useNotificationActions,
  useNotificationAnalytics,
  useRealTimeNotifications
};

export const modalHooks = {
  useModal,
  useModalStack,
  useModalHistory,
  useModalKeyboard,
  useModalAccessibility
};

export const themeHooks = {
  useTheme,
  useColorScheme,
  useFontSize,
  useSpacing,
  useThemeSettings,
  useAccessibilityFeatures,
  useCSSVariables,
  useSystemTheme
};

export const wishlistHooks = {
  useWishlist,
  useWishlistCollections,
  useWishlistSharing,
  useWishlistComparison,
  useWishlistAnalytics,
  useWishlistRecommendations
};

export const queryHooks = {
  // Query hooks from the stub exports above
  useOptimisticUpdate,
  useCacheManager,
  useQueryPerformance
};

export const utilityHooks = {
  // Utility hooks from the stub exports above
  useAppState,
  useAppPerformance,
  useProviderErrorBoundary,
  useDevTools
};

// All hooks collection
export const allHooks = {
  ...authHooks,
  ...cartHooks,
  ...notificationHooks,
  ...modalHooks,
  ...themeHooks,
  ...wishlistHooks,
  ...queryHooks,
  ...utilityHooks
};

// Provider names for debugging and development tools
export const PROVIDER_NAMES = {
  GLOBAL: 'GlobalProvider',
  AUTH: 'AuthProvider',
  CART: 'CartProvider',
  NOTIFICATION: 'NotificationProvider',
  MODAL: 'ModalProvider',
  THEME: 'ThemeProvider',
  WISHLIST: 'WishlistProvider',
  QUERY: 'QueryProvider'
} as const;

// Provider hierarchy for reference
export const PROVIDER_HIERARCHY = [
  PROVIDER_NAMES.QUERY,
  PROVIDER_NAMES.THEME,
  PROVIDER_NAMES.AUTH,
  PROVIDER_NAMES.NOTIFICATION,
  PROVIDER_NAMES.MODAL,
  PROVIDER_NAMES.CART,
  PROVIDER_NAMES.WISHLIST
] as const;

// Default export for convenience
export default GlobalProvider;
