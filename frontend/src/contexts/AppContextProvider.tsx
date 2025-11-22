/**
 * App Context Provider - Vardhman Mills Frontend
 * Main provider that wraps all context providers
 */

'use client';

import React from 'react';

// Import all context providers
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { CompareProvider } from './CompareContext';
import { CouponProvider } from './CouponContext';
import { GlobalProvider } from './GlobalContext';
import { ModalProvider } from './ModalContext';
import { NotificationProvider } from './NotificationContext';
import { OrderProvider } from './OrderContext';
import { PaymentProvider } from './PaymentContext';
import { SearchProvider } from './SearchContext';
import { ThemeProvider } from './ThemeContext';
import { WishlistProvider } from './WishlistContext';

interface AppContextProviderProps {
  children: React.ReactNode;
}

/**
 * Main App Context Provider that wraps all context providers in the correct order
 * Order is important: Global -> Theme -> Modal -> Notifications -> Auth -> Search -> Cart -> Payment -> Order -> Other contexts
 */
export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  return (
    <GlobalProvider>
      <ThemeProvider>
        <ModalProvider>
          <NotificationProvider>
            <AuthProvider>
              <SearchProvider>
                <CartProvider>
                  <PaymentProvider>
                    <OrderProvider>
                      <WishlistProvider>
                        <CompareProvider>
                          <CouponProvider>
                            {children}
                          </CouponProvider>
                        </CompareProvider>
                      </WishlistProvider>
                    </OrderProvider>
                  </PaymentProvider>
                </CartProvider>
              </SearchProvider>
            </AuthProvider>
          </NotificationProvider>
        </ModalProvider>
      </ThemeProvider>
    </GlobalProvider>
  );
};

/**
 * Individual context exports for direct usage
 */
export { useAuth } from './AuthContext';
export { useCart } from './CartContext';
export { useCompare } from './CompareContext';
export { useCoupon } from './CouponContext';
export { useGlobal } from './GlobalContext';
export { useModal } from './ModalContext';
export { useNotification } from './NotificationContext';
export { useOrder } from './OrderContext';
export { usePayment } from './PaymentContext';
export { useSearch } from './SearchContext';
export { useTheme } from './ThemeContext';
export { useWishlist } from './WishlistContext';

/**
 * Type exports
 */
export type { User, AuthState } from './AuthContext';
export type { CartItem, CartSummary, CartState } from './CartContext';
export type { CompareProduct, ComparisonAttribute, CompareState } from './CompareContext';
export type { Coupon, AppliedCoupon, CouponValidationResult, AutoApplyCoupon, CouponState } from './CouponContext';
export type { AppConfig, GlobalSettings, ConnectivityStatus, Performance, GlobalState } from './GlobalContext';
export type { Modal, ModalState } from './ModalContext';
export type { Notification, NotificationSettings, NotificationState } from './NotificationContext';
export type { Order, OrderItem, ShippingAddress, OrderHistory, OrderState } from './OrderContext';
export type { PaymentMethod, BillingAddress, Transaction, PaymentSession, PaymentState } from './PaymentContext';
export type { Product, SearchFilters, SearchSuggestion, SearchHistory, SearchState } from './SearchContext';
export type { ThemeConfig, ThemeState } from './ThemeContext';
export type { WishlistItem, WishlistState } from './WishlistContext';

export default AppContextProvider;