'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: 'default' | 'destructive' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const iconMap = {
  default: InformationCircleIcon,
  destructive: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
  success: CheckCircleIcon,
};

const colorMap = {
  default: 'text-gray-600',
  destructive: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
  success: 'text-green-600',
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  isLoading = false,
  icon,
  children,
}) => {
  const IconComponent = iconMap[variant];

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={title}
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {icon ? (
            <div className={cn('flex-shrink-0', colorMap[variant])}>
              {icon}
            </div>
          ) : (
            <div className={cn('flex-shrink-0', colorMap[variant])}>
              <IconComponent className="w-6 h-6" />
            </div>
          )}
          <div className="flex-1">
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
            {children}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
