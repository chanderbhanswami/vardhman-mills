'use client';

import React, { useCallback } from 'react';
import { AuthProvider } from './AuthProvider';
import { CartProvider } from './CartProvider';
import { NotificationProvider } from './NotificationProvider';
import { ModalProvider } from './ModalProvider';
import { ThemeProvider } from './ThemeProvider';
import { WishlistProvider } from './WishlistProvider';
import { QueryProvider } from './QueryProvider';

import { StoreProvider } from '../../store/providers/storeProvider';

// Global Provider Props
interface GlobalProviderProps {
  children: React.ReactNode;
  themeProps?: {
    defaultTheme?: 'light' | 'dark' | 'system';
    enableSystem?: boolean;
    attribute?: string;
    value?: Record<string, string>;
  };
}

/**
 * GlobalProvider component that wraps the entire application with all necessary providers
 * 
 * Provider hierarchy (outside to inside):
 * 1. StoreProvider - Redux store for global state management
 * 2. QueryProvider - React Query for server state management
 * 3. ThemeProvider - Theme and styling management
 * 4. AuthProvider - Authentication and session management
 * 5. NotificationProvider - Toast notifications and in-app notifications
 * 6. ModalProvider - Modal and dialog management
 * 7. CartProvider - Shopping cart management
 * 8. WishlistProvider - Wishlist management
 * 
 * This hierarchy ensures that:
 * - StoreProvider is at the top to provide Redux context
 * - QueryProvider is at the top to provide React Query context to all components
 * - ThemeProvider is early to ensure theming is available throughout the app
 * - AuthProvider comes before providers that depend on user authentication
 * - NotificationProvider is early to handle notifications from other providers
 * - ModalProvider provides modal context for confirmation dialogs and forms
 * - CartProvider and WishlistProvider can use auth, notifications, and modals
 */
export const GlobalProvider: React.FC<GlobalProviderProps> = ({ 
  children, 
  themeProps = {} 
}) => {
  return (
    <StoreProvider>
      <QueryProvider>
        <ThemeProvider
          defaultTheme={themeProps.defaultTheme}
          enableSystem={themeProps.enableSystem}
          attribute={themeProps.attribute}
          value={themeProps.value}
        >
          <AuthProvider>
            <NotificationProvider>
              <ModalProvider>
                <CartProvider>
                  <WishlistProvider>
                    {children}
                  </WishlistProvider>
                </CartProvider>
              </ModalProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </StoreProvider>
  );
};

// Individual provider exports for granular usage
export {
  AuthProvider,
  CartProvider,
  NotificationProvider,
  ModalProvider,
  ThemeProvider,
  WishlistProvider,
  QueryProvider
};

// Hook exports
export { useAuth } from './AuthProvider';
export { useCart } from './CartProvider';
export { useNotifications } from './NotificationProvider';
export { useModal } from './ModalProvider';
export { useTheme } from './ThemeProvider';
export { useWishlist } from './WishlistProvider';
export { useQueryClient, useOptimisticUpdate, useCacheManager, useQueryPerformance } from './QueryProvider';

// Import hooks for internal use
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';
import { useNotifications } from './NotificationProvider';
import { useModal } from './ModalProvider';
import { useTheme } from './ThemeProvider';
import { useWishlist } from './WishlistProvider';
import { useCacheManager, useQueryPerformance } from './QueryProvider';

// Type exports
export type { User, Address, AuthContextType, RegisterData } from './AuthProvider';
export type { CartItem, CartSummary, AppliedCoupon, ShippingOption, CartContextType } from './CartProvider';
export type { Notification, NotificationAction, NotificationChannel, NotificationSettings, NotificationContextType } from './NotificationProvider';
export type { Modal, ModalContextType } from './ModalProvider';
export type { Theme, ColorScheme, FontSize, Spacing, ThemeSettings, ThemeContextType } from './ThemeProvider';
export type { WishlistItem, WishlistCollection, WishlistContextType } from './WishlistProvider';

// Utility hooks that combine multiple providers
export const useAppState = () => {
  const auth = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const notifications = useNotifications();
  const modal = useModal();
  const theme = useTheme();
  
  return {
    auth,
    cart,
    wishlist,
    notifications,
    modal,
    theme,
    
    // Computed states
    isLoggedIn: auth.isAuthenticated,
    cartItemCount: cart.summary.itemCount,
    wishlistItemCount: wishlist.totalItems,
    unreadNotifications: notifications.unreadCount,
    hasOpenModals: modal.isOpen,
    currentTheme: theme.resolvedTheme,
    
    // Quick actions
    quickLogin: auth.login,
    quickLogout: auth.logout,
    quickAddToCart: cart.addToCart,
    quickAddToWishlist: wishlist.addToWishlist,
    quickNotify: notifications.success,
    quickConfirm: modal.confirm,
    quickAlert: modal.alert,
    toggleTheme: theme.toggleTheme,
  };
};

// Performance monitoring hook for the entire app
export const useAppPerformance = () => {
  const queryPerformance = useQueryPerformance();
  const cacheManager = useCacheManager();
  
  const [performanceMetrics, setPerformanceMetrics] = React.useState({
    renderCount: 0,
    lastRenderTime: Date.now(),
    averageRenderTime: 0,
  });
  
  // Track renders
  React.useEffect(() => {
    const renderTime = Date.now();
    setPerformanceMetrics(prev => ({
      renderCount: prev.renderCount + 1,
      lastRenderTime: renderTime,
      averageRenderTime: prev.renderCount > 0 
        ? (prev.averageRenderTime + (renderTime - prev.lastRenderTime)) / 2 
        : 0,
    }));
  }, []);
  
  return {
    ...queryPerformance,
    cache: cacheManager.getCache(),
    cacheSize: cacheManager.getCacheSize(),
    renders: performanceMetrics,
    
    // Actions
    clearCache: cacheManager.clearCache,
    forceFetch: cacheManager.forceFetchQuery,
  };
};

// Error boundary hook for provider-level error handling
export const useProviderErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = React.useState<string | null>(null);
  
  const resetError = React.useCallback(() => {
    setError(null);
    setErrorInfo(null);
  }, []);
  
  const captureError = React.useCallback((error: Error, errorInfo?: string) => {
    setError(error);
    setErrorInfo(errorInfo || null);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Provider Error:', error, errorInfo);
      // Send to error tracking service (e.g., Sentry, LogRocket, etc.)
    }
  }, []);
  
  return {
    error,
    errorInfo,
    hasError: error !== null,
    resetError,
    captureError,
  };
};

// Development tools hook
export const useDevTools = () => {
  const appState = useAppState();
  const performance = useAppPerformance();
  const errorBoundary = useProviderErrorBoundary();
  
  // Create callbacks unconditionally but only return them in development
  const logAppState = useCallback(() => {
    console.group('🚀 App State Debug');
    console.log('Auth:', appState.auth);
    console.log('Cart:', appState.cart);
    console.log('Wishlist:', appState.wishlist);
    console.log('Notifications:', appState.notifications);
    console.log('Modal:', appState.modal);
    console.log('Theme:', appState.theme);
    console.groupEnd();
  }, [appState]);

  const logPerformance = useCallback(() => {
    console.group('📊 Performance Metrics');
    console.log('Query Performance:', performance);
    console.log('Cache Info:', performance.cache);
    console.log('Cache Size:', performance.cacheSize);
    console.log('Render Metrics:', performance.renders);
    console.groupEnd();
  }, [performance]);

  const simulateError = useCallback(() => {
    errorBoundary.captureError(new Error('Simulated error for testing'), 'Dev Tools Test');
  }, [errorBoundary]);

  // Expose to window for console access
  React.useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const windowObj = window as typeof window & { appDebug?: Record<string, unknown> };
      windowObj.appDebug = {
        state: appState,
        performance,
        logAppState,
        logPerformance,
        simulateError,
        clearCache: performance.clearCache,
      };
    }
  }, [appState, performance, logAppState, logPerformance, simulateError]);
  
  // Only available in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return {
    logAppState,
    logPerformance,
    simulateError,
    state: appState,
    performance,
    errorBoundary,
  };
};

export default GlobalProvider;
