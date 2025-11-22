import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { logout, setLoading } from '../slices/authSlice';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'set' | 'event',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

// Auth middleware for handling authentication-related actions and side effects
const authMiddleware: Middleware<Record<string, never>, RootState> = (store) => (next) => (action) => {
  const typedAction = action as AnyAction;
  const result = next(action);
  const { auth } = store.getState();

  // Handle login success
  if (typedAction.type === 'auth/setCredentials') {
    const { token, user } = typedAction.payload;
    
    // Store in localStorage
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set loading to false
      store.dispatch(setLoading(false));
      
      // Log successful login
      console.log('User authenticated successfully:', user.email);
      
      // Track login event (you can integrate analytics here)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'login', {
          method: 'credentials',
          user_id: user.id,
        });
      }
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  }

  // Handle logout
  if (typedAction.type === 'auth/logout') {
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refresh_token');
      
      // Clear any cached data
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
      
      // Log logout event
      console.log('User logged out successfully');
      
      // Track logout event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'logout', {
          user_id: auth.user?.id,
        });
      }
      
      // Redirect to home page
      if (typeof window !== 'undefined') {
        // Clear any pending redirects
        sessionStorage.removeItem('redirect_after_login');
        
        // Redirect after a short delay to allow state update
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Handle token refresh
  if (typedAction.type === 'auth/refreshToken') {
    const { token } = typedAction.payload;
    
    try {
      localStorage.setItem('token', token);
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Error storing refreshed token:', error);
    }
  }

  // Handle user profile updates
  if (typedAction.type === 'auth/setUser') {
    const user = typedAction.payload;
    
    try {
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User profile updated:', user.email);
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }

  // Auto-logout on token expiration
  if (auth.tokens?.accessToken && auth.user) {
    try {
      // Decode JWT token to check expiration (basic implementation)
      const tokenPayload = JSON.parse(atob(auth.tokens.accessToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired (with 5 minute buffer)
      if (tokenPayload.exp && tokenPayload.exp < currentTime + 300) {
        console.warn('Token is about to expire, logging out user');
        store.dispatch(logout());
      }
    } catch {
      // Invalid token, logout user
      console.error('Invalid token detected, logging out user');
      store.dispatch(logout());
    }
  }

  // Handle authentication errors from API calls
  if (typedAction.type.endsWith('/rejected') && typedAction.payload?.status === 401) {
    console.warn('Authentication error detected, logging out user');
    store.dispatch(logout());
  }

  // Handle session timeout
  if (typedAction.type === 'auth/sessionTimeout') {
    console.warn('Session timeout detected');
    store.dispatch(logout());
    
    // Show session timeout message
    if (typeof window !== 'undefined') {
      // You can integrate with your notification system here
      alert('Your session has expired. Please log in again.');
    }
  }

  // Track authentication state changes
  if (typedAction.type.startsWith('auth/')) {
    const newAuthState = store.getState().auth;
    
    // Log auth state changes in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth state changed:', {
        action: typedAction.type,
        isAuthenticated: newAuthState.isAuthenticated,
        isLoading: newAuthState.isLoading,
        hasUser: !!newAuthState.user,
        hasToken: !!newAuthState.tokens?.accessToken,
      });
    }
  }

  return result;
};

export default authMiddleware;
