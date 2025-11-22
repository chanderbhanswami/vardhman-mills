/**
 * Logout Component
 * 
 * Handles user logout functionality with proper session cleanup,
 * state management, and user feedback.
 * 
 * Features:
 * - Session cleanup and token management
 * - Redux state clearing
 * - Cache invalidation
 * - Loading states and user feedback
 * - Error handling
 * - Redirect handling
 * - Security considerations
 * - Accessibility compliance
 * - Multiple logout triggers
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import LoadingSpinner from '@/components/common/Loading/LoadingSpinner';
import { useAuth } from '@/components/providers';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearUser } from '@/store/slices/userSlice';
import { clearCart } from '@/store/slices/cartSlice';
import { clearWishlist } from '@/store/slices/wishlistSlice';
import { cn } from '@/lib/utils';

// Types
export interface LogoutProps {
  /** Logout variant */
  variant?: 'button' | 'link' | 'icon' | 'menu-item';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Show confirmation modal */
  showConfirmation?: boolean;
  /** Auto redirect after logout */
  autoRedirect?: boolean;
  /** Redirect path */
  redirectTo?: string;
  /** Show loading state */
  showLoading?: boolean;
  /** Custom text */
  text?: string;
  /** Custom icon */
  icon?: React.ComponentType<{ className?: string }>;
  /** Custom className */
  className?: string;
  /** Callback after successful logout */
  onLogoutComplete?: () => void;
  /** Callback on logout error */
  onLogoutError?: (error: string) => void;
  /** Disabled state */
  disabled?: boolean;
}

interface LogoutState {
  isLoggingOut: boolean;
  error: string | null;
  success: boolean;
  timeRemaining: number;
}

const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const Logout: React.FC<LogoutProps> = ({
  variant = 'button',
  size = 'md',
  showConfirmation = false,
  autoRedirect = true,
  redirectTo = '/login',
  showLoading = true,
  text,
  icon: CustomIcon,
  className,
  onLogoutComplete,
  onLogoutError,
  disabled = false,
}) => {
  // Hooks
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { logout: authLogout, user } = useAuth();
  const { isAuthenticated } = useAppSelector((state: { auth: { isAuthenticated: boolean } }) => state.auth);

  // State
  const [logoutState, setLogoutState] = useState<LogoutState>({
    isLoggingOut: false,
    error: null,
    success: false,
    timeRemaining: 0,
  });

  // Session timeout tracking
  const [sessionWarning, setSessionWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Logout handler
  const handleLogout = useCallback(async (force = false) => {
    if (logoutState.isLoggingOut && !force) return;

    try {
      setLogoutState(prev => ({
        ...prev,
        isLoggingOut: true,
        error: null,
        success: false,
      }));

      // Clear authentication state
      await authLogout();

      // Clear Redux store
      dispatch(clearUser());
      dispatch(clearCart());
      dispatch(clearWishlist());

      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_preferences');
      localStorage.removeItem('cart_items');
      localStorage.removeItem('wishlist_items');

      // Clear session storage
      sessionStorage.removeItem('session_id');
      sessionStorage.removeItem('temp_data');

      // Clear cookies (if using httpOnly cookies, this needs server-side handling)
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substring(0, eqPos) : c;
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });

      setLogoutState(prev => ({
        ...prev,
        isLoggingOut: false,
        success: true,
      }));

      // Success callback
      onLogoutComplete?.();

      // Auto redirect
      if (autoRedirect) {
        setTimeout(() => {
          router.push(redirectTo);
        }, 1000);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      
      setLogoutState(prev => ({
        ...prev,
        isLoggingOut: false,
        error: errorMessage,
      }));

      onLogoutError?.(errorMessage);
    }
  }, [
    logoutState.isLoggingOut,
    authLogout,
    dispatch,
    onLogoutComplete,
    onLogoutError,
    autoRedirect,
    redirectTo,
    router,
  ]);

  // Activity tracking for session timeout
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setSessionWarning(false);
  }, []);

  // Session timeout effect
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity >= SESSION_TIMEOUT) {
        // Auto logout on timeout
        handleLogout(true);
      } else if (timeSinceLastActivity >= SESSION_WARNING_TIME && !sessionWarning) {
        // Show warning
        setSessionWarning(true);
        setLogoutState(prev => ({
          ...prev,
          timeRemaining: Math.ceil((SESSION_TIMEOUT - timeSinceLastActivity) / 1000),
        }));
      }

      if (sessionWarning) {
        setLogoutState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, Math.ceil((SESSION_TIMEOUT - timeSinceLastActivity) / 1000)),
        }));
      }
    };

    // Activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => updateActivity();
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Session check interval
    const interval = setInterval(checkSession, 1000);

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(interval);
    };
  }, [isAuthenticated, lastActivity, sessionWarning, handleLogout, updateActivity]);

  // Don't render if not authenticated
  if (!isAuthenticated) return null;

  // Get display text
  const getDisplayText = () => {
    if (text) return text;
    
    switch (variant) {
      case 'icon':
        return '';
      case 'menu-item':
        return 'Sign Out';
      case 'link':
        return 'Logout';
      default:
        return 'Logout';
    }
  };

  // Get icon
  const Icon = CustomIcon || ArrowRightOnRectangleIcon;

  // Get button props based on variant
  const getButtonProps = () => {
    const baseProps = {
      disabled: disabled || logoutState.isLoggingOut,
      onClick: showConfirmation ? () => {} : () => handleLogout(), // TODO: Add confirmation modal
      className: cn(className),
    };

    switch (variant) {
      case 'link':
        return {
          ...baseProps,
          variant: 'link' as const,
          size,
        };
      case 'icon':
        return {
          ...baseProps,
          variant: 'ghost' as const,
          size: 'sm' as const,
          className: cn('p-2', className),
        };
      case 'menu-item':
        return {
          ...baseProps,
          variant: 'ghost' as const,
          size,
          className: cn('w-full justify-start', className),
        };
      default:
        return {
          ...baseProps,
          variant: 'outline' as const,
          size,
        };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <div className="relative">
      {/* Session Warning */}
      {sessionWarning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 z-10"
        >
          <Badge
            variant="warning"
            className="gap-1 text-xs animate-pulse"
          >
            <ClockIcon className="w-3 h-3" />
            {Math.floor(logoutState.timeRemaining / 60)}:
            {(logoutState.timeRemaining % 60).toString().padStart(2, '0')}
          </Badge>
        </motion.div>
      )}

      {/* Main Button */}
      <Button {...buttonProps}>
        {showLoading && logoutState.isLoggingOut ? (
          <LoadingSpinner size="sm" />
        ) : logoutState.success ? (
          <CheckCircleIcon className="w-4 h-4 text-green-600" />
        ) : logoutState.error ? (
          <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
        ) : (
          <Icon className={cn('w-4 h-4', { 'mr-2': getDisplayText() })} />
        )}
        
        {getDisplayText() && (
          <span>
            {logoutState.success 
              ? `Goodbye, ${user?.firstName || 'User'}!` 
              : logoutState.error 
                ? 'Logout failed' 
                : getDisplayText()
            }
          </span>
        )}
      </Button>

      {/* Error Message */}
      {logoutState.error && variant !== 'icon' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-sm text-red-700 dark:text-red-300 whitespace-nowrap z-10"
        >
          {logoutState.error}
        </motion.div>
      )}

      {/* Success Message */}
      {logoutState.success && autoRedirect && variant !== 'icon' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded text-sm text-green-700 dark:text-green-300 whitespace-nowrap z-10"
        >
          Redirecting...
        </motion.div>
      )}

      {/* Session Warning Tooltip */}
      {sessionWarning && variant === 'icon' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-full right-0 mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg shadow-lg z-20 min-w-[200px]"
        >
          <div className="flex items-start gap-2">
            <ClockIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Session Expiring Soon
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Auto logout in {Math.floor(logoutState.timeRemaining / 60)}:
                {(logoutState.timeRemaining % 60).toString().padStart(2, '0')}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={updateActivity}
                className="mt-2 text-xs"
              >
                Stay Logged In
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Logout;