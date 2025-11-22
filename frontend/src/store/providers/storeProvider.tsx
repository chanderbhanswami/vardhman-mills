'use client';

import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';

interface StoreProviderProps {
  children: ReactNode;
}

// Loading component for persistence rehydration
const PersistGateLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Vardhman Mills</h2>
      <p className="text-gray-600">Initializing your shopping experience...</p>
    </div>
  </div>
);

export function StoreProvider({ children }: StoreProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={<PersistGateLoading />} 
        persistor={persistor}
        onBeforeLift={() => {
          // Optional: Perform any setup before persistence rehydration
          console.log('Store is about to rehydrate');
        }}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}

export default StoreProvider;
