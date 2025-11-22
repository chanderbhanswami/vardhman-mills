import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { persistedRootReducer, persistConfig } from './persistConfig';

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, persistedRootReducer);

// Configure store with persistence
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          'persist/PERSIST',
          'persist/REHYDRATE',
        ],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates', '_persist'],
      },
      immutableCheck: {
        warnAfter: 128,
      },
    }),
  devTools: process.env.NODE_ENV === 'development',
});

// Create persistor
export const persistor = persistStore(store, undefined, () => {
  console.log('Redux store rehydrated');
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Store utilities
export const getStoreState = () => store.getState();

export const subscribeToStore = (listener: () => void) => {
  return store.subscribe(listener);
};

export const cleanupStore = () => {
  persistor.purge();
  store.dispatch({ type: 'RESET_STORE' });
};

export const getStoreHealth = () => {
  const state = store.getState();
  return {
    isHydrated: state._persist?.rehydrated || false,
    version: state._persist?.version || 0,
    storeSize: JSON.stringify(state).length,
    timestamp: Date.now(),
  };
};

export default store;
