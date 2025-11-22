'use client';

import React, { useState } from 'react';
import {
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckIcon,
  EyeSlashIcon,
  EyeIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

export interface SelectionAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'danger' | 'warning' | 'primary' | 'secondary';
  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string;
  disabled?: boolean;
}

interface SelectionActionBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  actions: SelectionAction[];
  onActionExecute: (actionId: string, selectedIds: string[]) => Promise<void>;
  selectedIds: string[];
  className?: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: 'danger' | 'warning' | 'primary';
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant,
  isLoading,
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
  };

  const iconStyles = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    primary: 'text-blue-600'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onCancel}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10`}>
              <ExclamationTriangleIcon className={`h-6 w-6 ${iconStyles[variant]}`} />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${
                variantStyles[variant]
              } focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                confirmLabel
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SelectionActionBar({
  selectedCount,
  totalCount,
  onClearSelection,
  actions,
  onActionExecute,
  selectedIds,
  className = ""
}: SelectionActionBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<SelectionAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (selectedCount === 0) return null;

  const handleActionClick = (action: SelectionAction) => {
    if (action.disabled) return;
    
    if (action.requiresConfirmation) {
      setCurrentAction(action);
      setIsModalOpen(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: SelectionAction) => {
    try {
      setIsLoading(true);
      await onActionExecute(action.id, selectedIds);
      setIsModalOpen(false);
      setCurrentAction(null);
    } catch (error) {
      console.error('Action execution failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (currentAction) {
      executeAction(currentAction);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setCurrentAction(null);
  };

  const getActionButtonStyles = (action: SelectionAction) => {
    const baseStyles = "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantStyles = {
      danger: "bg-red-600 hover:bg-red-700 text-white",
      warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      secondary: "bg-gray-600 hover:bg-gray-700 text-white"
    };

    return `${baseStyles} ${variantStyles[action.variant]}`;
  };

  return (
    <>
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {selectedCount} of {totalCount} selected
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  disabled={action.disabled || isLoading}
                  className={getActionButtonStyles(action)}
                  title={action.label}
                >
                  <action.icon className="h-4 w-4 mr-1" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onClearSelection}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50"
            title="Clear selection"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Clear
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {currentAction && (
        <ConfirmationModal
          isOpen={isModalOpen}
          title={currentAction.confirmationTitle || `Confirm ${currentAction.label}`}
          message={
            currentAction.confirmationMessage ||
            `Are you sure you want to ${currentAction.label.toLowerCase()} ${selectedCount} selected item${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`
          }
          confirmLabel={currentAction.label}
          cancelLabel="Cancel"
          variant={currentAction.variant === 'danger' ? 'danger' : currentAction.variant === 'warning' ? 'warning' : 'primary'}
          isLoading={isLoading}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}

// Predefined common actions
export const commonActions = {
  delete: {
    id: 'delete',
    label: 'Delete',
    icon: TrashIcon,
    variant: 'danger' as const,
    requiresConfirmation: true,
    confirmationTitle: 'Delete Items',
    confirmationMessage: 'Are you sure you want to delete the selected items? This action cannot be undone.'
  },
  activate: {
    id: 'activate',
    label: 'Activate',
    icon: EyeIcon,
    variant: 'primary' as const,
    requiresConfirmation: true,
    confirmationTitle: 'Activate Items',
    confirmationMessage: 'Are you sure you want to activate the selected items?'
  },
  deactivate: {
    id: 'deactivate',
    label: 'Deactivate',
    icon: EyeSlashIcon,
    variant: 'warning' as const,
    requiresConfirmation: true,
    confirmationTitle: 'Deactivate Items',
    confirmationMessage: 'Are you sure you want to deactivate the selected items?'
  },
  verify: {
    id: 'verify',
    label: 'Verify',
    icon: ShieldCheckIcon,
    variant: 'primary' as const,
    requiresConfirmation: true,
    confirmationTitle: 'Verify Items',
    confirmationMessage: 'Are you sure you want to verify the selected items?'
  },
  unverify: {
    id: 'unverify',
    label: 'Unverify',
    icon: ShieldExclamationIcon,
    variant: 'warning' as const,
    requiresConfirmation: true,
    confirmationTitle: 'Unverify Items',
    confirmationMessage: 'Are you sure you want to unverify the selected items?'
  }
};
