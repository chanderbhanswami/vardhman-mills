'use client';

import React, { forwardRef, useEffect, useState, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Notification variants
const notificationVariants = cva(
  'relative flex items-start gap-3 p-4 rounded-lg border shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-background border-border text-foreground',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
      },
      size: {
        sm: 'text-sm p-3',
        md: 'text-base p-4',
        lg: 'text-lg p-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Notification Props
export interface NotificationProps extends VariantProps<typeof notificationVariants> {
  id?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  closable?: boolean;
  duration?: number;
  onClose?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
  children?: React.ReactNode;
}

// Main Notification Component
export const Notification = forwardRef<HTMLDivElement, NotificationProps>(
  ({
    title,
    description,
    icon,
    action,
    closable = true,
    duration = 5000,
    onClose,
    variant = 'default',
    size = 'md',
    className,
    children,
    ...props
  }, ref) => {
    const [isVisible, setIsVisible] = useState(true);
    
    const handleClose = useCallback(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 200); // Wait for animation to complete
    }, [onClose]);
    
    useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }, [duration, handleClose]);
    
    if (!isVisible) {
      return null;
    }
    
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: 300, scale: 0.3 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.3 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(notificationVariants({ variant, size }), className)}
        role="alert"
        aria-live="polite"
        {...props}
      >
        {/* Icon */}
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium mb-1">
              {title}
            </h4>
          )}
          
          {description && (
            <p className="text-sm opacity-90">
              {description}
            </p>
          )}
          
          {children && (
            <div className="mt-2">
              {children}
            </div>
          )}
          
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        
        {/* Close Button */}
        {closable && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
            aria-label="Close notification"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </motion.div>
    );
  }
);

Notification.displayName = 'Notification';

// Notification Container/Provider
export interface NotificationContainerProps {
  position?: NotificationProps['position'];
  maxNotifications?: number;
  className?: string;
}

export interface NotificationItem extends NotificationProps {
  id: string;
}

// Notification Manager
class NotificationManager {
  private notifications: NotificationItem[] = [];
  private listeners: ((notifications: NotificationItem[]) => void)[] = [];
  private idCounter = 0;
  
  subscribe(listener: (notifications: NotificationItem[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private notify() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }
  
  add(notification: Omit<NotificationItem, 'id'>) {
    const id = String(++this.idCounter);
    const newNotification: NotificationItem = {
      ...notification,
      id,
      onClose: () => {
        this.remove(id);
        notification.onClose?.();
      },
    };
    
    this.notifications.push(newNotification);
    this.notify();
    
    return id;
  }
  
  remove(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }
  
  clear() {
    this.notifications = [];
    this.notify();
  }
  
  getNotifications() {
    return [...this.notifications];
  }
}

// Global notification manager instance
export const notificationManager = new NotificationManager();

// Notification Container Component
export const NotificationContainer = forwardRef<HTMLDivElement, NotificationContainerProps>(
  ({
    position = 'top-right',
    maxNotifications = 5,
    className,
    ...props
  }, ref) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    
    useEffect(() => {
      const unsubscribe = notificationManager.subscribe(setNotifications);
      return unsubscribe;
    }, []);
    
    // Limit notifications
    const visibleNotifications = notifications.slice(-maxNotifications);
    
    const positionClasses = {
      'top-right': 'fixed top-4 right-4 z-50',
      'top-left': 'fixed top-4 left-4 z-50',
      'bottom-right': 'fixed bottom-4 right-4 z-50',
      'bottom-left': 'fixed bottom-4 left-4 z-50',
      'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
      'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-2 min-w-80 max-w-md',
          positionClasses[position],
          className
        )}
        {...props}
      >
        <AnimatePresence mode="popLayout">
          {visibleNotifications.map((notification) => (
            <Notification
              key={notification.id}
              {...notification}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  }
);

NotificationContainer.displayName = 'NotificationContainer';

// Hook for using notifications
export const useNotifications = () => {
  const showNotification = (notification: Omit<NotificationItem, 'id'>) => {
    return notificationManager.add(notification);
  };
  
  const removeNotification = (id: string) => {
    notificationManager.remove(id);
  };
  
  const clearNotifications = () => {
    notificationManager.clear();
  };
  
  // Convenience methods
  const success = (title: string, description?: string, options?: Partial<NotificationItem>) => {
    return showNotification({ ...options, title, description, variant: 'success' });
  };
  
  const error = (title: string, description?: string, options?: Partial<NotificationItem>) => {
    return showNotification({ ...options, title, description, variant: 'error' });
  };
  
  const warning = (title: string, description?: string, options?: Partial<NotificationItem>) => {
    return showNotification({ ...options, title, description, variant: 'warning' });
  };
  
  const info = (title: string, description?: string, options?: Partial<NotificationItem>) => {
    return showNotification({ ...options, title, description, variant: 'info' });
  };
  
  return {
    show: showNotification,
    remove: removeNotification,
    clear: clearNotifications,
    success,
    error,
    warning,
    info,
  };
};

// Toast-style notification
export interface ToastProps extends Omit<NotificationProps, 'position'> {
  persistent?: boolean;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({
    persistent = false,
    duration = persistent ? 0 : 3000,
    ...props
  }, ref) => {
    return (
      <Notification
        ref={ref}
        duration={duration}
        {...props}
      />
    );
  }
);

Toast.displayName = 'Toast';

// Alert-style notification
export interface AlertNotificationProps extends NotificationProps {
  alertType?: 'info' | 'success' | 'warning' | 'error';
}

export const AlertNotification = forwardRef<HTMLDivElement, AlertNotificationProps>(
  ({
    alertType = 'info',
    variant,
    icon,
    ...props
  }, ref) => {
    const defaultIcons = {
      info: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
      success: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      warning: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      error: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    };
    
    return (
      <Notification
        ref={ref}
        variant={variant || alertType}
        icon={icon || defaultIcons[alertType]}
        {...props}
      />
    );
  }
);

AlertNotification.displayName = 'AlertNotification';

// Export all components
export default Notification;