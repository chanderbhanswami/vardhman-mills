import { combineReducers } from '@reduxjs/toolkit';

// Import all slice reducers
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import wishlistReducer from './slices/wishlistSlice';
import blogReducer from './slices/blogSlice';
import categoryReducer from './slices/categorySlice';
import orderReducer from './slices/orderSlice';
import searchReducer from './slices/searchSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';
import notificationReducer from './slices/notificationSlice';

// Combine all reducers into a single root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  product: productReducer,
  wishlist: wishlistReducer,
  blog: blogReducer,
  category: categoryReducer,
  order: orderReducer,
  search: searchReducer,
  ui: uiReducer,
  user: userReducer,
  notification: notificationReducer,
});

// Export the root reducer type for use in store configuration
export type RootState = ReturnType<typeof rootReducer>;

// Export individual state types for components
export type AuthState = RootState['auth'];
export type CartState = RootState['cart'];
export type ProductState = RootState['product'];
export type WishlistState = RootState['wishlist'];
export type BlogState = RootState['blog'];
export type CategoryState = RootState['category'];
export type OrderState = RootState['order'];
export type SearchState = RootState['search'];
export type UIState = RootState['ui'];
export type UserState = RootState['user'];
export type NotificationState = RootState['notification'];

// Default export
export default rootReducer;

// Named export for use in store configuration
export { rootReducer };

// Utility type for creating typed hooks
export type AppState = RootState;

// Type for dispatch actions
export type AppDispatch = ReturnType<typeof import('./store').store.dispatch>;

// Reset action type for clearing all state (useful for logout)
export const RESET_STORE = 'RESET_STORE';

// Enhanced root reducer with reset functionality
const enhancedRootReducer = (state: RootState | undefined, action: { type: string; payload?: unknown }) => {
  // Reset all state to initial values when RESET_STORE action is dispatched
  if (action.type === RESET_STORE) {
    // Preserve certain state that should persist across resets
    // Return initial state with preserved theme preference
    const newState = rootReducer(undefined, action);
    if (state?.ui?.preferences?.themeMode) {
      newState.ui.preferences.themeMode = state.ui.preferences.themeMode;
    }
    return newState;
  }
  
  return rootReducer(state, action);
};

// Export enhanced reducer as default
export { enhancedRootReducer };

// Selectors for common state access patterns
export const selectAuth = (state: RootState) => state.auth;
export const selectCart = (state: RootState) => state.cart;
export const selectProduct = (state: RootState) => state.product;
export const selectWishlist = (state: RootState) => state.wishlist;
export const selectBlog = (state: RootState) => state.blog;
export const selectCategory = (state: RootState) => state.category;
export const selectOrder = (state: RootState) => state.order;
export const selectSearch = (state: RootState) => state.search;
export const selectUI = (state: RootState) => state.ui;
export const selectUser = (state: RootState) => state.user;
export const selectNotification = (state: RootState) => state.notification;

// Combined selectors for common use cases
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCartItemCount = (state: RootState) => state.cart.summary?.itemCount || 0;
export const selectWishlistItemCount = (state: RootState) => state.wishlist.items.length;
export const selectIsLoading = (state: RootState) => ({
  auth: state.auth.isLoading,
  cart: state.cart.isLoading,
  product: state.product.isLoading,
  wishlist: state.wishlist.isLoading,
  blog: state.blog.isLoading,
  category: state.category.isLoading,
  order: state.order.isLoading,
  search: state.search.isSearching,
  user: state.user.isLoading,
});

// Error state selectors
export const selectErrors = (state: RootState) => ({
  auth: state.auth.error,
  cart: state.cart.error,
  product: state.product.error,
  wishlist: state.wishlist.error,
  blog: state.blog.error,
  category: state.category.error,
  order: state.order.error,
  search: state.search.error,
  user: state.user.error,
});

// Theme and UI selectors
export const selectTheme = (state: RootState) => state.ui.preferences.themeMode;
export const selectSidebarOpen = (state: RootState) => state.ui.preferences.sidebarCollapsed;
export const selectMobileMenuOpen = (state: RootState) => state.ui.device.isMobile;

// Notification selectors
export const selectNotifications = (state: RootState) => state.notification.notifications;
export const selectUnreadNotificationCount = (state: RootState) => 
  state.notification.notifications.filter(n => !n.isRead).length;
