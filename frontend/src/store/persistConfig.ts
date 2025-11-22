import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import cartSlice from './slices/cartSlice';
import wishlistSlice from './slices/wishlistSlice';
import productSlice from './slices/productSlice';
import categorySlice from './slices/categorySlice';
import orderSlice from './slices/orderSlice';
import blogSlice from './slices/blogSlice';
import searchSlice from './slices/searchSlice';
import uiSlice from './slices/uiSlice';
import userSlice from './slices/userSlice';
import notificationSlice from './slices/notificationSlice';

// Persist config for auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated'], // Only persist these fields
  blacklist: ['isLoading'], // Don't persist loading state
};

// Persist config for cart slice
const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items', 'totalItems', 'totalAmount'], // Persist cart data but not UI state
  blacklist: ['isOpen'], // Don't persist cart open state
};

// Persist config for wishlist slice
const wishlistPersistConfig = {
  key: 'wishlist',
  storage,
  whitelist: ['items'], // Only persist wishlist items
  blacklist: ['isLoading'], // Don't persist loading state
};

// Persist config for user preferences
const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['theme', 'language', 'currency', 'preferences'], // Persist user preferences
  blacklist: ['isLoading', 'modals', 'notifications'], // Don't persist temporary UI state
};

// Persist config for search history
const searchPersistConfig = {
  key: 'search',
  storage,
  whitelist: ['recentSearches', 'searchHistory'], // Persist search history
  blacklist: ['query', 'results', 'isLoading', 'suggestions'], // Don't persist current search state
};

// Root persist configuration
export const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart', 'wishlist', 'ui', 'search'], // Only persist certain slices
  blacklist: ['product', 'category', 'order', 'blog', 'user', 'notification'], // Don't persist these slices
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);
const persistedCartReducer = persistReducer(cartPersistConfig, cartSlice);
const persistedWishlistReducer = persistReducer(wishlistPersistConfig, wishlistSlice);
const persistedUiReducer = persistReducer(uiPersistConfig, uiSlice);
const persistedSearchReducer = persistReducer(searchPersistConfig, searchSlice);

// Root reducer with persistence
export const persistedRootReducer = combineReducers({
  auth: persistedAuthReducer,
  cart: persistedCartReducer,
  wishlist: persistedWishlistReducer,
  ui: persistedUiReducer,
  search: persistedSearchReducer,
  // Non-persisted slices
  product: productSlice,
  category: categorySlice,
  order: orderSlice,
  blog: blogSlice,
  user: userSlice,
  notification: notificationSlice,
});

// Transform configuration for sensitive data
export const transforms = [
  // Add transforms if needed for data encryption/decryption
];

// Migration configuration for handling version changes
export const migrations = {
  0: (state: Record<string, unknown>) => {
    // Migration for version 0 to 1
    return {
      ...state,
      _persist: {
        version: 1,
        rehydrated: true,
      },
    };
  },
  1: (state: Record<string, unknown>) => {
    // Migration for version 1 to 2
    if (state.auth && typeof state.auth === 'object' && state.auth !== null) {
      const authState = state.auth as Record<string, unknown>;
      if (!authState.preferences) {
        authState.preferences = {
          notifications: true,
          marketing: false,
          analytics: true,
        };
      }
    }
    return {
      ...state,
      _persist: {
        version: 2,
        rehydrated: true,
      },
    };
  },
};

// Debug configuration
export const debugConfig = {
  logger: process.env.NODE_ENV === 'development',
  stateReconciler: false, // Use auto merge level 2
  debug: process.env.NODE_ENV === 'development',
};

// Enhanced persist config with all options
export const enhancedPersistConfig = {
  ...persistConfig,
  version: 2,
  migrate: (state: Record<string, unknown>, version: number) => {
    if (migrations[version as keyof typeof migrations]) {
      return migrations[version as keyof typeof migrations](state);
    }
    return Promise.resolve(state);
  },
  transforms,
  debug: process.env.NODE_ENV === 'development',
  serialize: true,
  timeout: 0, // No timeout
  throttle: 100, // Throttle persist calls
};

export default persistConfig;
