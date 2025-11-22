/**
 * LogoutModal Component
 * 
 * Confirmation modal for logout action with security considerations,
 * session information, and proper user feedback.
 * 
 * Features:
 * - Logout confirmation with detailed information
 * - Session timeout warnings
 * - Security reminders
 * - Option to save session data
 * - Loading states and error handling
 * - Keyboard shortcuts
 * - Accessibility compliance
 * - Auto-logout prevention
 * - Device/session management
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import LoadingSpinner from '@/components/common/Loading/LoadingSpinner';
import { useAuth } from '@/components/providers';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';

// Types
export interface LogoutModalProps {
  /** Modal open state */
  isOpen: boolean;
  /** Close modal handler */
  onClose: () => void;
  /** Confirm logout handler */
  onConfirm: () => Promise<void> | void;
  /** Modal title override */
  title?: string;
  /** Modal description override */
  description?: string;
  /** Show session timeout warning */
  showTimeoutWarning?: boolean;
  /** Time remaining before auto logout (in seconds) */
  timeRemaining?: number;
  /** Show save options */
  showSaveOptions?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Additional CSS classes */
  className?: string;
}

interface SessionInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  loginTime: Date;
  lastActivity: Date;
  location?: string;
}

interface SaveOptions {
  saveCart: boolean;
  saveWishlist: boolean;
  savePreferences: boolean;
  rememberDevice: boolean;
}

const getDeviceInfo = (): SessionInfo => {
  const userAgent = navigator.userAgent;
  
  let deviceType: SessionInfo['deviceType'] = 'desktop';
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
  }

  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  return {
    deviceType,
    browser,
    loginTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Mock login time
    lastActivity: new Date(),
    location: 'Unknown Location', // Would come from IP geolocation in real app
  };
};

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Sign Out',
  description = 'Are you sure you want to sign out of your account?',
  showTimeoutWarning = false,
  timeRemaining = 0,
  showSaveOptions = true,
  loading = false,
  error = null,
  className,
}) => {
  // State
  const [sessionInfo] = useState<SessionInfo>(getDeviceInfo);
  const [saveOptions, setSaveOptions] = useState<SaveOptions>({
    saveCart: true,
    saveWishlist: true,
    savePreferences: true,
    rememberDevice: false,
  });
  const [isConfirming, setIsConfirming] = useState(false);

  // Auth context
  const { user } = useAuth();
  const { cartItems, wishlistItems } = useAppSelector((state: { cart: { items: unknown[] }; wishlist: { items: unknown[] } }) => ({
    cartItems: state.cart.items,
    wishlistItems: state.wishlist.items,
  }));

  // Handlers
  const handleConfirm = useCallback(async () => {
    try {
      setIsConfirming(true);

      // Save data based on user preferences
      if (saveOptions.saveCart && cartItems.length > 0) {
        localStorage.setItem('saved_cart', JSON.stringify(cartItems));
      }
      
      if (saveOptions.saveWishlist && wishlistItems.length > 0) {
        localStorage.setItem('saved_wishlist', JSON.stringify(wishlistItems));
      }
      
      if (saveOptions.savePreferences) {
        localStorage.setItem('save_preferences', 'true');
      }
      
      if (saveOptions.rememberDevice) {
        localStorage.setItem('trusted_device', 'true');
      }

      await onConfirm();
    } catch (err) {
      console.error('Logout confirmation error:', err);
      setIsConfirming(false);
    }
  }, [onConfirm, saveOptions, cartItems, wishlistItems]);

  const handleClose = useCallback(() => {
    if (loading || isConfirming) return;
    onClose();
  }, [loading, isConfirming, onClose]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  const handleSaveOptionChange = (key: keyof SaveOptions, checked: boolean) => {
    setSaveOptions(prev => ({
      ...prev,
      [key]: checked,
    }));
  };

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'Enter':
          if (e.ctrlKey || e.metaKey) {
            handleConfirm();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, handleConfirm]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getDeviceIcon = () => {
    switch (sessionInfo.deviceType) {
      case 'mobile':
        return DevicePhoneMobileIcon;
      case 'tablet':
        return DevicePhoneMobileIcon;
      default:
        return ComputerDesktopIcon;
    }
  };

  const DeviceIcon = getDeviceIcon();
  const isLoading = loading || isConfirming;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            'bg-black/50 backdrop-blur-sm',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            {/* Header */}
            <div className={cn(
              'flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700',
              {
                'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700': showTimeoutWarning,
              }
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  showTimeoutWarning
                    ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300'
                    : 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300'
                )}>
                  {showTimeoutWarning ? (
                    <ClockIcon className="w-5 h-5" />
                  ) : (
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  )}
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {showTimeoutWarning ? 'Session Expiring' : title}
                  </h2>
                  {showTimeoutWarning && timeRemaining > 0 && (
                    <div className="flex items-center gap-1 text-sm text-yellow-700 dark:text-yellow-300">
                      <ClockIcon className="w-4 h-4" />
                      Auto logout in {formatTime(timeRemaining)}
                    </div>
                  )}
                </div>
              </div>

              {!isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Warning Message */}
              {showTimeoutWarning ? (
                <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                      Session Timeout Warning
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Your session will expire automatically due to inactivity. 
                      Sign out now or stay logged in to continue.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              )}

              {/* User Info */}
              {user && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                    {user.firstName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Session Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4" />
                  Current Session
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Device:</span>
                    <div className="flex items-center gap-1">
                      <DeviceIcon className="w-4 h-4" />
                      <span className="text-gray-900 dark:text-gray-100 capitalize">
                        {sessionInfo.deviceType} • {sessionInfo.browser}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Signed in:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {sessionInfo.loginTime.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last activity:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {sessionInfo.lastActivity.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Options */}
              {showSaveOptions && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Save for next time
                  </h4>
                  
                  <div className="space-y-3">
                    {cartItems.length > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={saveOptions.saveCart}
                            onChange={(e) => handleSaveOptionChange('saveCart', e.target.checked)}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Save cart items ({cartItems.length})
                          </span>
                        </div>
                        <Badge variant="secondary" size="sm">
                          {cartItems.length}
                        </Badge>
                      </div>
                    )}
                    
                    {wishlistItems.length > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={saveOptions.saveWishlist}
                            onChange={(e) => handleSaveOptionChange('saveWishlist', e.target.checked)}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Save wishlist items ({wishlistItems.length})
                          </span>
                        </div>
                        <Badge variant="secondary" size="sm">
                          {wishlistItems.length}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={saveOptions.savePreferences}
                        onChange={(e) => handleSaveOptionChange('savePreferences', e.target.checked)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Remember my preferences
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={saveOptions.rememberDevice}
                        onChange={(e) => handleSaveOptionChange('rememberDevice', e.target.checked)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Trust this device
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <InformationCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    Security Reminder
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    Always sign out when using shared or public devices to protect your account.
                  </p>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-red-800 dark:text-red-200 font-medium">
                      Logout Failed
                    </p>
                    <p className="text-red-700 dark:text-red-300 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              {showTimeoutWarning ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Stay Logged In
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    )}
                    Sign Out Now
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    )}
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogoutModal;