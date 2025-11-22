/**
 * AddressModal Component
 * 
 * Modal wrapper for address operations including create, edit, and delete.
 * Provides a centralized interface for address management with proper
 * state handling and user feedback.
 * 
 * Features:
 * - Create new address
 * - Edit existing address
 * - Delete confirmation
 * - View address details
 * - Form validation and error handling
 * - Loading states
 * - Responsive design
 * - Accessibility compliance
 * - Animation and transitions
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  MapPinIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import LoadingSpinner from '@/components/common/Loading/LoadingSpinner';
import { AddressForm } from './AddressForm';
import { AddressCard } from './AddressCard';
import { cn } from '@/lib/utils';
import { Address, AddressFormData } from '@/types/user.types';

// Types
export interface AddressModalProps {
  /** Modal open state */
  isOpen: boolean;
  /** Modal mode */
  mode: 'create' | 'edit' | 'delete' | 'view';
  /** Address data for edit/view/delete modes */
  address?: Address;
  /** Modal title override */
  title?: string;
  /** Modal description override */
  description?: string;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
  /** Success message */
  successMessage?: string | null;
  /** Close modal handler */
  onClose: () => void;
  /** Save handler */
  onSave?: (data: AddressFormData) => Promise<void> | void;
  /** Delete handler */
  onDelete?: (addressId: string) => Promise<void> | void;
  /** Additional CSS classes */
  className?: string;
}

interface ModalConfig {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'success' | 'info';
}

const modalConfigs: Record<string, ModalConfig> = {
  create: {
    title: 'Add New Address',
    description: 'Add a new delivery address to your account',
    icon: MapPinIcon,
    confirmText: 'Save Address',
    cancelText: 'Cancel',
    variant: 'default',
  },
  edit: {
    title: 'Edit Address',
    description: 'Update your delivery address information',
    icon: PencilIcon,
    confirmText: 'Update Address',
    cancelText: 'Cancel',
    variant: 'default',
  },
  delete: {
    title: 'Delete Address',
    description: 'Are you sure you want to delete this address? This action cannot be undone.',
    icon: TrashIcon,
    confirmText: 'Delete Address',
    cancelText: 'Cancel',
    variant: 'danger',
  },
  view: {
    title: 'Address Details',
    description: 'View complete address information',
    icon: EyeIcon,
    confirmText: 'Close',
    variant: 'info',
  },
};

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  mode,
  address,
  title: customTitle,
  description: customDescription,
  loading = false,
  error = null,
  successMessage = null,
  onClose,
  onSave,
  onDelete,
  className,
}) => {
  // State
  const [internalLoading, setInternalLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Configuration
  const config = modalConfigs[mode];
  const modalTitle = customTitle || config.title;
  const modalDescription = customDescription || config.description;
  const Icon = config.icon;
  const InfoIcon = InformationCircleIcon; // For additional info messages

  // Handlers
  const handleSave = useCallback(async (formData: AddressFormData) => {
    if (!onSave) return;

    try {
      setInternalLoading(true);
      await onSave(formData);
      
      // Show success state briefly before closing
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setInternalLoading(false);
      // Error will be handled by parent component
      console.error('Address save error:', err);
    }
  }, [onSave, onClose]);

  const handleDelete = useCallback(async () => {
    if (!onDelete || !address) return;

    try {
      setInternalLoading(true);
      await onDelete(address.id);
      
      // Show success state briefly before closing
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setInternalLoading(false);
      // Error will be handled by parent component
      console.error('Address delete error:', err);
    }
  }, [onDelete, address, onClose]);

  const handleClose = useCallback(() => {
    if (internalLoading) return;
    onClose();
  }, [internalLoading, onClose]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Effects
  useEffect(() => {
    if (!isOpen) {
      setInternalLoading(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Keyboard handling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

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

  const isLoading = loading || internalLoading;
  const canClose = !isLoading && !showSuccess;

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
            className={cn(
              'relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden',
              'bg-white dark:bg-gray-900 rounded-xl shadow-2xl',
              'border border-gray-200 dark:border-gray-700'
            )}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            {/* Header */}
            <div className={cn(
              'flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700',
              {
                'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700': config.variant === 'danger',
                'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700': config.variant === 'success',
                'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700': config.variant === 'info',
              }
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  {
                    'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300': config.variant === 'danger',
                    'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300': config.variant === 'success',
                    'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300': config.variant === 'info',
                    'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300': config.variant === 'default',
                  }
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {modalTitle}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <InfoIcon className="w-4 h-4 flex-shrink-0" />
                    <p>{modalDescription}</p>
                  </div>
                </div>
              </div>

              {canClose && (
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
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {showSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="p-12 text-center"
                  >
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {mode === 'delete' ? 'Address Deleted' : 'Address Saved'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {successMessage || (mode === 'delete' 
                        ? 'The address has been successfully deleted.'
                        : 'Your address has been saved successfully.'
                      )}
                    </p>
                  </motion.div>
                ) : isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-12 text-center"
                  >
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      {mode === 'delete' ? 'Deleting address...' : 'Saving address...'}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6"
                  >
                    {/* Error Display */}
                    {error && (
                      <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800 dark:text-red-200">
                            Operation Failed
                          </h4>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {error}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Mode-specific Content */}
                    {mode === 'create' && (
                      <AddressForm
                        onSubmit={handleSave}
                        loading={isLoading}
                      />
                    )}

                    {mode === 'edit' && address && (
                      <AddressForm
                        initialData={address}
                        onSubmit={handleSave}
                        mode="edit"
                        loading={isLoading}
                      />
                    )}

                    {mode === 'view' && address && (
                      <div className="space-y-6">
                        <AddressCard
                          address={address}
                          variant="detailed"
                          showActions={false}
                          className="border-0 bg-gray-50 dark:bg-gray-800"
                        />
                        
                        {/* Additional Details */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            Additional Information
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Created:</span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {address.createdAt 
                                  ? new Date(address.createdAt).toLocaleDateString()
                                  : 'N/A'
                                }
                              </span>
                            </div>
                            
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Last Used:</span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {address.lastUsedAt 
                                  ? new Date(address.lastUsedAt).toLocaleDateString()
                                  : 'Never'
                                }
                              </span>
                            </div>
                            
                            <div className="col-span-2">
                              <span className="text-gray-500 dark:text-gray-400">Status:</span>
                              <Badge 
                                variant={address.isValidated ? 'success' : 'warning'}
                                className="ml-2"
                              >
                                {address.isValidated ? 'Verified' : 'Unverified'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {mode === 'delete' && address && (
                      <div className="space-y-6">
                        {/* Warning */}
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-red-800 dark:text-red-200">
                              Permanent Action
                            </h4>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                              This address will be permanently deleted and cannot be recovered. 
                              Any ongoing orders using this address will not be affected.
                            </p>
                          </div>
                        </div>

                        {/* Address Preview */}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                            Address to be deleted:
                          </h4>
                          <AddressCard
                            address={address}
                            variant="compact"
                            showActions={false}
                            className="border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {!showSuccess && !isLoading && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {mode !== 'view' && (
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    {config.cancelText}
                  </Button>
                )}

                {mode === 'view' && (
                  <Button onClick={handleClose}>
                    {config.confirmText}
                  </Button>
                )}

                {mode === 'delete' && (
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    {config.confirmText}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddressModal;