import { toast as hotToast } from 'react-hot-toast';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'destructive';
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export const useToast = () => {
  const toast = (options: ToastOptions) => {
    const { title, description, variant = 'default', duration = 4000 } = options;

    const message = title && description ? `${title}: ${description}` : title || description || '';

    switch (variant) {
      case 'success':
        return hotToast.success(message, { duration });
      case 'error':
      case 'destructive':
        return hotToast.error(message, { duration });
      case 'warning':
        return hotToast(message, { 
          duration,
          icon: '⚠️'
        });
      default:
        return hotToast(message, { duration });
    }
  };

  // Convenience method for simple toast messages
  const showToast = (
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 4000
  ) => {
    return toast({
      title: message,
      variant: type === 'info' ? 'default' : type,
      duration,
    });
  };

  return { toast, showToast };
};