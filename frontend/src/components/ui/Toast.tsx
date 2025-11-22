'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  XMarkIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// Toast variants
const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive: 'destructive group border-destructive bg-destructive text-destructive-foreground',
        success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-50',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-50',
        info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-50',
      },
      size: {
        default: 'min-w-[300px]',
        sm: 'min-w-[250px] text-sm p-3',
        lg: 'min-w-[400px] text-lg p-6',
      },
      position: {
        'top-left': '',
        'top-center': '',
        'top-right': '',
        'bottom-left': '',
        'bottom-center': '',
        'bottom-right': '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      position: 'top-right',
    },
  }
);

// Toast types
export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: VariantProps<typeof toastVariants>['variant'];
  size?: VariantProps<typeof toastVariants>['size'];
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  persistent?: boolean;
}

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  toast: Toast;
  onDismiss: (id: string) => void;
}

// Toast context
interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast provider
export interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  position?: VariantProps<typeof toastVariants>['position'];
  defaultDuration?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  position = 'top-right',
  defaultDuration = 5000,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? defaultDuration,
    };

    setToasts((prevToasts) => {
      const updatedToasts = [...prevToasts, newToast];
      // Keep only the maximum number of toasts
      if (updatedToasts.length > maxToasts) {
        return updatedToasts.slice(-maxToasts);
      }
      return updatedToasts;
    });

    // Auto-dismiss after duration
    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration);
    }

    return id;
  }, [defaultDuration, maxToasts, dismiss]);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
      <ToastViewport position={position} />
    </ToastContext.Provider>
  );
};

// Individual toast component
const ToastComponent = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, toast, onDismiss, ...props }, ref) => {
    // Filter out props that conflict with motion
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onDrag, onDragEnd, onDragStart, onAnimationStart, onAnimationEnd, ...filteredProps } = props;
    const getIcon = () => {
      switch (toast.variant) {
        case 'success':
          return <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />;
        case 'destructive':
          return <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />;
        case 'warning':
          return <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
        case 'info':
          return <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
        default:
          return <InformationCircleIcon className="h-5 w-5 text-foreground" />;
      }
    };

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: -50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(toastVariants({ variant: toast.variant, size: toast.size }), className)}
        {...filteredProps}
      >
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1 space-y-1">
            {toast.title && (
              <div className="font-semibold leading-none tracking-tight">
                {toast.title}
              </div>
            )}
            {toast.description && (
              <div className="text-sm opacity-90">
                {toast.description}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-xs font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {toast.action.label}
            </button>
          )}

          {!toast.persistent && (
            <button
              onClick={() => {
                toast.onDismiss?.();
                onDismiss(toast.id);
              }}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent opacity-50 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring group-hover:opacity-100"
            >
              <XMarkIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          )}
        </div>
      </motion.div>
    );
  }
);

ToastComponent.displayName = 'Toast';

// Toast viewport - where toasts are rendered
interface ToastViewportProps {
  position?: VariantProps<typeof toastVariants>['position'];
}

const ToastViewport: React.FC<ToastViewportProps> = ({ position = 'top-right' }) => {
  const { toasts, dismiss } = useToast();

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 left-0';
      case 'top-center':
        return 'top-0 left-1/2 -translate-x-1/2';
      case 'top-right':
        return 'top-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'bottom-center':
        return 'bottom-0 left-1/2 -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-0 right-0';
      default:
        return 'top-0 right-0';
    }
  };

  return (
    <div
      className={cn(
        'fixed z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:flex-col md:max-w-[420px]',
        getPositionClasses()
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onDismiss={dismiss}
            className="mb-2 last:mb-0"
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Convenience hooks for different toast types
export const useToastHelpers = () => {
  const { toast } = useToast();

  const success = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return toast({
      title,
      description,
      variant: 'success',
      ...options,
    });
  }, [toast]);

  const error = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return toast({
      title,
      description,
      variant: 'destructive',
      ...options,
    });
  }, [toast]);

  const warning = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return toast({
      title,
      description,
      variant: 'warning',
      ...options,
    });
  }, [toast]);

  const info = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return toast({
      title,
      description,
      variant: 'info',
      ...options,
    });
  }, [toast]);

  const loading = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return toast({
      title,
      description,
      variant: 'default',
      persistent: true,
      ...options,
    });
  }, [toast]);

  const { dismiss: dismissToast } = useToast();

  const promise = useCallback(<T,>(
    promise: Promise<T>,
    {
      loading: loadingMessage = 'Loading...',
      success: successMessage = 'Success!',
      error: errorMessage = 'Something went wrong',
    }: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: Error) => string);
    }
  ) => {
    const id = toast({
      title: loadingMessage,
      variant: 'default',
      persistent: true,
    });

    return promise
      .then((data) => {
        dismissToast(id);
        
        const message = typeof successMessage === 'function' 
          ? successMessage(data) 
          : successMessage;
        
        return toast({
          title: message,
          variant: 'success',
        });
      })
      .catch((error) => {
        dismissToast(id);
        
        const message = typeof errorMessage === 'function' 
          ? errorMessage(error) 
          : errorMessage;
        
        return toast({
          title: message,
          variant: 'destructive',
        });
      });
  }, [toast, dismissToast]);

  return {
    success,
    error,
    warning,
    info,
    loading,
    promise,
  };
};

// Progress Toast - shows progress bar
export interface ProgressToastProps extends Omit<Toast, 'variant'> {
  progress: number;
  total: number;
}

export const ProgressToast: React.FC<ProgressToastProps> = ({
  progress,
  total,
  ...toastProps
}) => {
  const { toast, dismiss } = useToast();
  const [toastId, setToastId] = useState<string>();

  const percentage = Math.round((progress / total) * 100);

  useEffect(() => {
    if (toastId) {
      dismiss(toastId);
    }

    const id = toast({
      ...toastProps,
      title: `${toastProps.title} (${percentage}%)`,
      description: `Progress: ${progress}/${total} (${percentage}%)`,
      persistent: true,
    });

    setToastId(id);

    // Auto-dismiss when complete
    if (progress >= total) {
      setTimeout(() => {
        dismiss(id);
      }, 2000);
    }
  }, [progress, total, percentage, toast, dismiss, toastProps, toastId]);

  return null;
};

// Toast queue - manages toast ordering and limits
export interface ToastQueueProps {
  maxVisible?: number;
  stackLimit?: number;
  newestOnTop?: boolean;
}

export const useToastQueue = ({ 
  maxVisible = 3, 
  newestOnTop = true 
}: Omit<ToastQueueProps, 'stackLimit'> = {}) => {
  const { toasts: allToasts, toast, dismiss } = useToast();

  const visibleToasts = React.useMemo(() => {
    const sorted = newestOnTop 
      ? [...allToasts].reverse() 
      : allToasts;
    
    return sorted.slice(0, maxVisible);
  }, [allToasts, maxVisible, newestOnTop]);

  const queuedCount = Math.max(0, allToasts.length - maxVisible);

  const showNext = useCallback(() => {
    if (queuedCount > 0) {
      // This will naturally show the next toast as visible ones are dismissed
      return;
    }
  }, [queuedCount]);

  return {
    visibleToasts,
    queuedCount,
    showNext,
    toast,
    dismiss,
  };
};

// Compound exports
export const Toast = {
  Provider: ToastProvider,
  Component: ToastComponent,
  Viewport: ToastViewport,
  useToast,
  useHelpers: useToastHelpers,
  useQueue: useToastQueue,
  Progress: ProgressToast,
};

export default Toast;

