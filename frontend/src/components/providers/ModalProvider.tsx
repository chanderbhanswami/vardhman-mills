'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Types
export interface Modal {
  id: string;
  title?: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  type?: 'default' | 'confirmation' | 'alert' | 'form' | 'loading';
  overlay?: boolean;
  closable?: boolean;
  persistent?: boolean;
  className?: string;
  zIndex?: number;
  onClose?: () => void | Promise<void>;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  autoClose?: number;
  position?: 'center' | 'top' | 'bottom';
  animation?: 'fade' | 'slide' | 'scale' | 'bounce';
  backdrop?: 'blur' | 'dark' | 'transparent';
  footerActions?: React.ReactNode;
  headerActions?: React.ReactNode;
}

export interface ModalContextType {
  // Modal State
  modals: Modal[];
  isOpen: boolean;
  activeModal: Modal | null;
  
  // Modal Actions
  open: (modal: Omit<Modal, 'id'>) => string;
  close: (id?: string) => Promise<void>;
  closeAll: () => Promise<void>;
  update: (id: string, updates: Partial<Modal>) => void;
  
  // Convenience Methods
  confirm: (options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void | Promise<void>;
  }) => Promise<boolean>;
  
  alert: (options: {
    title?: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    confirmText?: string;
    onConfirm?: () => void | Promise<void>;
  }) => Promise<void>;
  
  loading: (options: {
    title?: string;
    message?: string;
  }) => string;
  
  // Stack Management
  getModalById: (id: string) => Modal | undefined;
  isModalOpen: (id: string) => boolean;
  getModalCount: () => number;
  getTopModal: () => Modal | null;
}

// Context Creation
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Hook to use Modal Context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// Modal size configurations
const modalSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full w-full h-full'
};

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },
  bounce: {
    hidden: { opacity: 0, scale: 0.3 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 20
      }
    },
    exit: { opacity: 0, scale: 0.3 }
  }
};

// Individual Modal Component
interface ModalItemProps {
  modal: Modal;
  onClose: (id: string) => Promise<void>;
  isTop: boolean;
}

const ModalItem: React.FC<ModalItemProps> = ({ modal, onClose, isTop }) => {
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const {
    id,
    title,
    content,
    size = 'md',
    type = 'default',
    overlay = true,
    closable = true,
    persistent = false,
    className = '',
    zIndex = 50,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    loading = false,
    autoClose,
    position = 'center',
    animation = 'fade',
    backdrop = 'blur',
    footerActions,
    headerActions
  } = modal;

  // Auto close functionality
  useEffect(() => {
    if (autoClose && autoClose > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, autoClose);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, id, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable && !persistent && isTop) {
        onClose(id);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closable, persistent, isTop, id, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closable && !persistent) {
      onClose(id);
    }
  };

  // Handle confirm action
  const handleConfirm = async () => {
    if (onConfirm) {
      setIsLoading(true);
      try {
        await onConfirm();
        onClose(id);
      } catch (error) {
        console.error('Modal confirm error:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      onClose(id);
    }
  };

  // Handle cancel action
  const handleCancel = async () => {
    if (onCancel) {
      setIsLoading(true);
      try {
        await onCancel();
        onClose(id);
      } catch (error) {
        console.error('Modal cancel error:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      onClose(id);
    }
  };

  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-16',
    bottom: 'items-end justify-center pb-16'
  };

  const backdropClasses = {
    blur: 'backdrop-blur-sm bg-black/50',
    dark: 'bg-black/75',
    transparent: 'bg-transparent'
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={overlayVariants}
      className={`fixed inset-0 flex ${positionClasses[position]} ${overlay ? backdropClasses[backdrop] : ''}`}
      style={{ zIndex }}
      onClick={handleBackdropClick}
    >
      <motion.div
        ref={modalRef}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants[animation]}
        className={`
          relative bg-white dark:bg-gray-800 rounded-lg shadow-xl
          ${modalSizes[size]} mx-4 my-4
          ${size === 'full' ? '' : 'max-h-[90vh]'}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || closable || headerActions) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {headerActions}
              {closable && !persistent && (
                <button
                  onClick={() => onClose(id)}
                  title="Close modal"
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={loading || isLoading}
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`${size === 'full' ? 'flex-1 overflow-auto' : 'max-h-[70vh] overflow-auto'} p-4`}>
          {content}
        </div>

        {/* Footer */}
        {(type === 'confirmation' || type === 'alert' || footerActions) && (
          <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
            {footerActions || (
              <>
                {type === 'confirmation' && (
                  <button
                    onClick={handleCancel}
                    disabled={loading || isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  disabled={loading || isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {(loading || isLoading) ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    confirmText
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* Loading overlay */}
        {(loading || isLoading) && type === 'loading' && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Modal Provider Component
interface ModalProviderProps {
  children: React.ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modals, setModals] = useState<Modal[]>([]);
  
  // Generate unique ID
  const generateId = useCallback((): string => {
    return `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Modal Actions
  const open = useCallback((modal: Omit<Modal, 'id'>): string => {
    const id = generateId();
    const newModal: Modal = {
      ...modal,
      id,
      zIndex: 50 + modals.length
    };
    
    setModals(prev => [...prev, newModal]);
    return id;
  }, [generateId, modals.length]);

  const close = useCallback(async (id?: string): Promise<void> => {
    if (!id) {
      // Close top modal
      const topModal = modals[modals.length - 1];
      if (topModal) {
        if (topModal.onClose) {
          try {
            await topModal.onClose();
          } catch (error) {
            console.error('Modal onClose error:', error);
          }
        }
        setModals(prev => prev.slice(0, -1));
      }
    } else {
      // Close specific modal
      const modal = modals.find(m => m.id === id);
      if (modal && modal.onClose) {
        try {
          await modal.onClose();
        } catch (error) {
          console.error('Modal onClose error:', error);
        }
      }
      setModals(prev => prev.filter(m => m.id !== id));
    }
  }, [modals]);

  const closeAll = useCallback(async (): Promise<void> => {
    // Call onClose for all modals
    for (const modal of modals) {
      if (modal.onClose) {
        try {
          await modal.onClose();
        } catch (error) {
          console.error('Modal onClose error:', error);
        }
      }
    }
    setModals([]);
  }, [modals]);

  const update = useCallback((id: string, updates: Partial<Modal>): void => {
    setModals(prev => 
      prev.map(modal => 
        modal.id === id ? { ...modal, ...updates } : modal
      )
    );
  }, []);

  // Convenience Methods
  const confirm = useCallback((options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void | Promise<void>;
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      open({
        title: options.title || 'Confirm Action',
        type: 'confirmation',
        size: 'sm',
        content: (
          <div className="text-center">
            <div className={`mx-auto flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
              options.type === 'danger' ? 'bg-red-100 text-red-600' :
              options.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {options.type === 'danger' ? '⚠️' : 
               options.type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {options.message}
            </p>
          </div>
        ),
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        onConfirm: async () => {
          if (options.onConfirm) {
            await options.onConfirm();
          }
          resolve(true);
        },
        onCancel: async () => {
          if (options.onCancel) {
            await options.onCancel();
          }
          resolve(false);
        }
      });
    });
  }, [open]);

  const alert = useCallback((options: {
    title?: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    confirmText?: string;
    onConfirm?: () => void | Promise<void>;
  }): Promise<void> => {
    return new Promise((resolve) => {
      open({
        title: options.title || 'Alert',
        type: 'alert',
        size: 'sm',
        content: (
          <div className="text-center">
            <div className={`mx-auto flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
              options.type === 'success' ? 'bg-green-100 text-green-600' :
              options.type === 'error' ? 'bg-red-100 text-red-600' :
              options.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {options.type === 'success' ? '✓' : 
               options.type === 'error' ? '✗' :
               options.type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {options.message}
            </p>
          </div>
        ),
        confirmText: options.confirmText || 'OK',
        onConfirm: async () => {
          if (options.onConfirm) {
            await options.onConfirm();
          }
          resolve();
        }
      });
    });
  }, [open]);

  const loading = useCallback((options: {
    title?: string;
    message?: string;
  }): string => {
    return open({
      title: options.title,
      type: 'loading',
      size: 'sm',
      closable: false,
      persistent: true,
      content: (
        <div className="text-center py-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          {options.message && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {options.message}
            </p>
          )}
        </div>
      )
    });
  }, [open]);

  // Stack Management
  const getModalById = useCallback((id: string): Modal | undefined => {
    return modals.find(modal => modal.id === id);
  }, [modals]);

  const isModalOpen = useCallback((id: string): boolean => {
    return modals.some(modal => modal.id === id);
  }, [modals]);

  const getModalCount = useCallback((): number => {
    return modals.length;
  }, [modals.length]);

  const getTopModal = useCallback((): Modal | null => {
    return modals.length > 0 ? modals[modals.length - 1] : null;
  }, [modals]);

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (modals.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modals.length]);

  // Context value
  const contextValue: ModalContextType = {
    // Modal State
    modals,
    isOpen: modals.length > 0,
    activeModal: getTopModal(),
    
    // Modal Actions
    open,
    close,
    closeAll,
    update,
    
    // Convenience Methods
    confirm,
    alert,
    loading,
    
    // Stack Management
    getModalById,
    isModalOpen,
    getModalCount,
    getTopModal,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <AnimatePresence mode="wait">
        {modals.map((modal, index) => (
          <ModalItem
            key={modal.id}
            modal={modal}
            onClose={close}
            isTop={index === modals.length - 1}
          />
        ))}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

export default ModalProvider;
