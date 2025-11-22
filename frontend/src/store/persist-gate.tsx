'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadCartFromStorage, selectCartItems } from '@/store/slices/cartSlice';
import { setCredentials, setLoading } from '@/store/slices/authSlice';
import { CartItem } from '@/store/slices/cartSlice';
import { User } from '@/types/user.types';

interface PersistGateProps {
  children: React.ReactNode;
  loading?: React.ReactNode;
}

// Utility functions for safe localStorage operations
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
    }
    return null;
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
        return true;
      }
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
    return false;
  },
  
  removeItem: (key: string): boolean => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
        return true;
      }
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error);
    }
    return false;
  }
};

// Type guard for CartItem validation
const isValidCartItem = (item: unknown): item is CartItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as CartItem).id === 'string' &&
    typeof (item as CartItem).productId === 'string' &&
    typeof (item as CartItem).quantity === 'number' &&
    (item as CartItem).quantity > 0
  );
};

// Type guard for User validation
const isValidUser = (user: unknown): user is { id: string; [key: string]: unknown } => {
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof (user as { id: string }).id === 'string'
  );
};

export function PersistGate({ children, loading }: PersistGateProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);

  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        // Load cart data
        const cartData = safeLocalStorage.getItem('cart');
        if (cartData) {
          try {
            const parsedCart: unknown = JSON.parse(cartData);
            // Validate cart data structure
            if (Array.isArray(parsedCart) && parsedCart.every(isValidCartItem)) {
              dispatch(loadCartFromStorage(parsedCart));
            } else {
              console.warn('Invalid cart data structure, clearing cart');
              safeLocalStorage.removeItem('cart');
            }
          } catch (cartError) {
            console.error('Error parsing cart data:', cartError);
            safeLocalStorage.removeItem('cart');
          }
        }

        // Load auth data
        const token = safeLocalStorage.getItem('token');
        const userData = safeLocalStorage.getItem('user');
        
        if (token && userData) {
          try {
            const user: unknown = JSON.parse(userData);
            // Validate user data structure
            if (isValidUser(user)) {
              dispatch(setCredentials({ user: user as unknown as User, token })); // Type assertion needed for localStorage data
            } else {
              console.warn('Invalid user data structure, clearing auth');
              safeLocalStorage.removeItem('token');
              safeLocalStorage.removeItem('user');
              dispatch(setLoading(false));
            }
          } catch (authError) {
            console.error('Error parsing user data:', authError);
            safeLocalStorage.removeItem('token');
            safeLocalStorage.removeItem('user');
            dispatch(setLoading(false));
          }
        } else {
          dispatch(setLoading(false));
        }
      } catch (error) {
        console.error('Error loading persisted data:', error);
        setError('Failed to load saved data. Please refresh the page.');
        dispatch(setLoading(false));
      } finally {
        setIsHydrated(true);
      }
    };

    loadPersistedData();
  }, [dispatch]);

  // Auto-save cart changes to localStorage with debouncing
  useEffect(() => {
    if (isHydrated && cartItems.length >= 0) {
      const timeoutId = setTimeout(() => {
        const success = safeLocalStorage.setItem('cart', JSON.stringify(cartItems));
        if (!success) {
          console.warn('Failed to save cart to localStorage');
        }
      }, 300); // Debounce cart saves by 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [cartItems, isHydrated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Any cleanup logic can go here
    };
  }, []);

  // Show error state if data loading failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Prevent hydration mismatch
  if (!isHydrated) {
    return loading || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}