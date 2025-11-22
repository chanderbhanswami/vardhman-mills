/**
 * CartNotification Component - Vardhman Mills Frontend
 * 
 * Real-time cart notifications with:
 * - Item added notifications
 * - Price alerts
 * - Stock warnings
 * - Low inventory alerts
 * - Cart sync status
 * - Multi-tab sync notifications
 * - Animation effects
 * 
 * @component
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ShoppingBagIcon,
  SparklesIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type NotificationType = 'success' | 'warning' | 'info' | 'error' | 'price_drop' | 'stock_alert' | 'sync';

export interface CartNotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  productName?: string;
  productImage?: string;
  productSlug?: string;
  quantity?: number;
  price?: number;
  originalPrice?: number;
  stockLevel?: number;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  persistent?: boolean;
}

export interface CartNotificationProps {
  /**
   * Position of notifications
   * @default 'top-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

  /**
   * Max notifications to show
   * @default 3
   */
  maxNotifications?: number;

  /**
   * Default duration (ms)
   * @default 5000
   */
  defaultDuration?: number;

  /**
   * Enable sound
   * @default false
   */
  enableSound?: boolean;

  /**
   * Enable animations
   * @default true
   */
  enableAnimations?: boolean;

  /**
   * Enable stacking
   * @default true
   */
  enableStacking?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

interface NotificationItem extends CartNotificationData {
  timestamp: number;
  expiresAt?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const POSITION_CLASSES = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

const NOTIFICATION_ICONS = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
  error: XMarkIcon,
  price_drop: SparklesIcon,
  stock_alert: BellAlertIcon,
  sync: ShoppingBagIcon,
};

const NOTIFICATION_COLORS = {
  success: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  price_drop: 'bg-purple-50 border-purple-200 text-purple-900',
  stock_alert: 'bg-orange-50 border-orange-200 text-orange-900',
  sync: 'bg-gray-50 border-gray-200 text-gray-900',
};

const ICON_COLORS = {
  success: 'text-green-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
  error: 'text-red-600',
  price_drop: 'text-purple-600',
  stock_alert: 'text-orange-600',
  sync: 'text-gray-600',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CartNotification: React.FC<CartNotificationProps> = ({
  position = 'top-right',
  maxNotifications = 3,
  defaultDuration = 5000,
  enableSound = false,
  enableAnimations = true,
  enableStacking = true,
  className,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // ============================================================================
  // NOTIFICATION MANAGEMENT
  // ============================================================================

  const addNotification = useCallback(
    (data: CartNotificationData) => {
      const newNotification: NotificationItem = {
        ...data,
        timestamp: Date.now(),
        expiresAt: data.persistent ? undefined : Date.now() + (data.duration || defaultDuration),
      };

      setNotifications((prev) => {
        const updated = [...prev, newNotification];
        // Keep only the latest notifications
        if (updated.length > maxNotifications) {
          return updated.slice(-maxNotifications);
        }
        return updated;
      });

      // Play sound if enabled
      if (enableSound) {
        try {
          const audio = new Audio('/sounds/notification.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Ignore autoplay errors
          });
        } catch (error) {
          console.warn('Failed to play notification sound:', error);
        }
      }
    },
    [maxNotifications, defaultDuration, enableSound]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Auto-remove expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNotifications((prev) =>
        prev.filter((n) => !n.expiresAt || n.expiresAt > now)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for custom events (for external triggers)
  useEffect(() => {
    const handleCartNotification = (event: Event) => {
      const customEvent = event as CustomEvent<CartNotificationData>;
      addNotification(customEvent.detail);
    };

    window.addEventListener('cart:notification', handleCartNotification);
    return () => {
      window.removeEventListener('cart:notification', handleCartNotification);
    };
  }, [addNotification]);

  // ============================================================================
  // ANIMATION VARIANTS
  // ============================================================================

  const getAnimationVariants = () => {
    const isTop = position.startsWith('top');
    const isLeft = position.includes('left');
    const isRight = position.includes('right');
    const isCenter = position.includes('center');

    return {
      initial: {
        opacity: 0,
        y: isTop ? -20 : 20,
        x: isCenter ? 0 : isLeft ? -20 : isRight ? 20 : 0,
        scale: 0.95,
      },
      animate: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        transition: {
          type: 'spring' as const,
          stiffness: 300,
          damping: 30,
        },
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
          duration: 0.2,
        },
      },
    };
  };

  // ============================================================================
  // RENDER NOTIFICATION
  // ============================================================================

  const renderNotification = (notification: NotificationItem) => {
    const Icon = NOTIFICATION_ICONS[notification.type];
    const hasProduct = notification.productName && notification.productImage;
    const hasPrice = typeof notification.price === 'number';
    const hasPriceDiscount = notification.originalPrice && notification.originalPrice > (notification.price || 0);

    return (
      <motion.div
        key={notification.id}
        layout={enableStacking}
        variants={enableAnimations ? getAnimationVariants() : undefined}
        initial={enableAnimations ? 'initial' : undefined}
        animate={enableAnimations ? 'animate' : undefined}
        exit={enableAnimations ? 'exit' : undefined}
        className={cn(
          'relative w-full max-w-sm rounded-lg border-2 shadow-lg overflow-hidden',
          NOTIFICATION_COLORS[notification.type],
          'mb-3'
        )}
      >
        {/* Progress bar for expiring notifications */}
        {notification.expiresAt && (
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{
              duration: (notification.expiresAt - notification.timestamp) / 1000,
              ease: 'linear',
            }}
            className="absolute top-0 left-0 h-1 bg-current opacity-30"
          />
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn('flex-shrink-0 mt-0.5', ICON_COLORS[notification.type])}>
              <Icon className="h-6 w-6" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                {notification.dismissible !== false && (
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
                    aria-label="Dismiss"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              <p className="text-sm opacity-90 mb-2">{notification.message}</p>

              {/* Product Info */}
              {hasProduct && (
                <Link
                  href={`/products/${notification.productSlug}`}
                  className="flex items-center gap-3 p-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors mb-2"
                >
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={notification.productImage!}
                      alt={notification.productName!}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">
                      {notification.productName}
                    </p>
                    {notification.quantity && (
                      <p className="text-xs opacity-75">Qty: {notification.quantity}</p>
                    )}
                  </div>
                  {hasPrice && (
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-sm">
                        {formatCurrency(notification.price!, 'INR')}
                      </p>
                      {hasPriceDiscount && (
                        <p className="text-xs line-through opacity-60">
                          {formatCurrency(notification.originalPrice!, 'INR')}
                        </p>
                      )}
                    </div>
                  )}
                </Link>
              )}

              {/* Stock Level */}
              {typeof notification.stockLevel === 'number' && (
                <div className="mb-2">
                  <Badge
                    variant={notification.stockLevel < 5 ? 'destructive' : 'warning'}
                    size="sm"
                  >
                    {notification.stockLevel === 0
                      ? 'Out of Stock'
                      : `Only ${notification.stockLevel} left`}
                  </Badge>
                </div>
              )}

              {/* Action Button */}
              {notification.action && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={notification.action.onClick}
                  className="w-full mt-2"
                >
                  {notification.action.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (notifications.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed z-50 pointer-events-none max-w-[calc(100vw-2rem)]',
        POSITION_CLASSES[position],
        className
      )}
    >
      <div className="pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => renderNotification(notification))}
        </AnimatePresence>

        {/* Clear All Button */}
        {notifications.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2"
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={clearAllNotifications}
              className="w-full"
            >
              Clear All Notifications
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// HELPER FUNCTION TO TRIGGER NOTIFICATIONS
// ============================================================================

export const triggerCartNotification = (data: CartNotificationData) => {
  const event = new CustomEvent('cart:notification', { detail: data });
  window.dispatchEvent(event);
};

export default CartNotification;
