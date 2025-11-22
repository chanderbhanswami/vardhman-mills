'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  AlertTriangle, 
  X, 
  Loader2,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '@/lib/utils';

// Types
export interface DeleteReviewProps {
  reviewId: string;
  userId: string;
  isOwner: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'destructive' | 'ghost' | 'outline';
  showIcon?: boolean;
  showText?: boolean;
  disabled?: boolean;
  onDeleteStart?: (reviewId: string) => void;
  onDeleteSuccess?: (reviewId: string) => void;
  onDeleteError?: (reviewId: string, error: Error) => void;
  onCancel?: () => void;
  confirmationText?: string;
  warningText?: string;
  customPermissionCheck?: (reviewId: string, userId: string) => Promise<boolean>;
  deleteEndpoint?: string;
  requireReason?: boolean;
  allowedReasons?: string[];
}

export interface DeleteConfirmationData {
  reason?: string;
  adminNote?: string;
  confirmPassword?: string;
  sendNotification?: boolean;
}

const DeleteReview: React.FC<DeleteReviewProps> = ({
  reviewId,
  userId,
  isOwner,
  isAdmin = false,
  isModerator = false,
  className,
  size = 'md',
  variant = 'destructive',
  showIcon = true,
  showText = false,
  disabled = false,
  onDeleteStart,
  onDeleteSuccess,
  onDeleteError,
  onCancel,
  confirmationText = 'Are you sure you want to delete this review?',
  warningText = 'This action cannot be undone.',
  customPermissionCheck,
  deleteEndpoint = '/api/reviews',
  requireReason = false,
  allowedReasons = [
    'Inappropriate content',
    'Spam or fake review',
    'Offensive language',
    'Violation of guidelines',
    'Duplicate review',
    'Other'
  ]
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'reason' | 'final'>('confirm');
  const [deleteData, setDeleteData] = useState<DeleteConfirmationData>({
    sendNotification: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();

  // Permission checking
  const canDelete = React.useMemo(() => {
    return isOwner || isAdmin || isModerator;
  }, [isOwner, isAdmin, isModerator]);

  const getDeletePermissionLevel = () => {
    if (isAdmin) return 'admin';
    if (isModerator) return 'moderator';
    if (isOwner) return 'owner';
    return 'none';
  };

  // Validation
  const validateDeleteData = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (requireReason && !deleteData.reason) {
      newErrors.reason = 'Please select a reason for deletion';
    }

    if ((isAdmin || isModerator) && !isOwner && !deleteData.adminNote?.trim()) {
      newErrors.adminNote = 'Admin note is required for moderation actions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Delete functionality
  const handleDeleteClick = async () => {
    if (disabled || !canDelete) return;

    // Custom permission check
    if (customPermissionCheck) {
      try {
        const hasPermission = await customPermissionCheck(reviewId, userId);
        if (!hasPermission) {
          toast({
            title: 'Permission Denied',
            description: 'You do not have permission to delete this review.',
            variant: 'destructive'
          });
          return;
        }
      } catch (error) {
        console.error('Permission check failed:', error);
        toast({
          title: 'Error',
          description: 'Failed to verify permissions.',
          variant: 'destructive'
        });
        return;
      }
    }

    setShowDeleteModal(true);
    setDeleteStep(requireReason || (isAdmin || isModerator) ? 'reason' : 'confirm');
  };

  const handleConfirmDelete = async () => {
    if (!validateDeleteData()) return;

    setIsDeleting(true);
    onDeleteStart?.(reviewId);

    try {
      const deletePayload = {
        reviewId,
        userId,
        permissionLevel: getDeletePermissionLevel(),
        reason: deleteData.reason,
        adminNote: deleteData.adminNote,
        sendNotification: deleteData.sendNotification,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${deleteEndpoint}/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth
        },
        body: JSON.stringify(deletePayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete review');
      }

      const result = await response.json();
      console.log('Delete response:', result);

      // Success handling
      toast({
        title: 'Review Deleted',
        description: 'The review has been successfully deleted.',
        variant: 'success'
      });

      onDeleteSuccess?.(reviewId);
      setShowDeleteModal(false);
      
    } catch (error) {
      console.error('Delete failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete review';
      
      toast({
        title: 'Delete Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      onDeleteError?.(reviewId, error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowDeleteModal(false);
    setDeleteStep('confirm');
    setDeleteData({ sendNotification: true });
    setErrors({});
    onCancel?.();
  };

  const renderDeleteStep = () => {
    switch (deleteStep) {
      case 'reason':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Reason for Deletion</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please select a reason for deleting this review.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Select Reason *</label>
              <div className="space-y-2">
                {allowedReasons.map((reason) => (
                  <label key={reason} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="deleteReason"
                      value={reason}
                      checked={deleteData.reason === reason}
                      onChange={(e) => setDeleteData(prev => ({ ...prev, reason: e.target.value }))}
                      className="radio radio-primary"
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>
              {errors.reason && (
                <p className="text-sm text-red-600">{errors.reason}</p>
              )}
            </div>

            {(isAdmin || isModerator) && !isOwner && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Admin Note * 
                  <Badge variant="secondary" className="ml-2">
                    {isAdmin ? 'Admin' : 'Moderator'}
                  </Badge>
                </label>
                <textarea
                  value={deleteData.adminNote || ''}
                  onChange={(e) => setDeleteData(prev => ({ ...prev, adminNote: e.target.value }))}
                  placeholder="Provide a note explaining the moderation action..."
                  className="w-full p-3 border rounded-lg resize-none h-20"
                  maxLength={500}
                />
                {errors.adminNote && (
                  <p className="text-sm text-red-600">{errors.adminNote}</p>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendNotification"
                checked={deleteData.sendNotification}
                onChange={(e) => setDeleteData(prev => ({ ...prev, sendNotification: e.target.checked }))}
                className="checkbox checkbox-primary"
              />
              <label htmlFor="sendNotification" className="text-sm">
                Send notification to review author
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteStep('final')}
                className="flex-1"
                disabled={isDeleting}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 'final':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Final Confirmation</h3>
              <p className="text-sm text-gray-600 mb-4">{confirmationText}</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 font-medium">{warningText}</p>
              </div>
            </div>

            {deleteData.reason && (
              <Card className="p-3 bg-gray-50">
                <div className="text-sm">
                  <span className="font-medium">Reason: </span>
                  <span>{deleteData.reason}</span>
                </div>
                {deleteData.adminNote && (
                  <div className="text-sm mt-2">
                    <span className="font-medium">Note: </span>
                    <span>{deleteData.adminNote}</span>
                  </div>
                )}
              </Card>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteStep('reason')}
                className="flex-1"
                disabled={isDeleting}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                className="flex-1"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Review'
                )}
              </Button>
            </div>
          </div>
        );

      default: // confirm
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Delete Review</h3>
              <p className="text-sm text-gray-600 mb-4">{confirmationText}</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 font-medium">{warningText}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                className="flex-1"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        );
    }
  };

  const buttonText = React.useMemo(() => {
    if (!showText) return null;
    if (isOwner) return 'Delete';
    if (isAdmin || isModerator) return 'Remove';
    return 'Delete';
  }, [showText, isOwner, isAdmin, isModerator]);

  const tooltipText = React.useMemo(() => {
    if (isOwner) return 'Delete your review';
    if (isAdmin) return 'Remove review (Admin)';
    if (isModerator) return 'Remove review (Moderator)';
    return 'Delete review';
  }, [isOwner, isAdmin, isModerator]);

  // Don't render if no permission
  if (!canDelete) {
    return null;
  }

  return (
    <>
      <Tooltip content={tooltipText}>
        <Button
          variant={variant}
          size={size}
          onClick={handleDeleteClick}
          disabled={disabled || isDeleting}
          className={cn(
            "relative transition-all duration-200",
            "hover:scale-105 active:scale-95",
            "focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
            className
          )}
          aria-label={tooltipText}
        >
          {showIcon && (
            <motion.div
              animate={{ rotate: isDeleting ? 360 : 0 }}
              transition={{ duration: 0.5, repeat: isDeleting ? Infinity : 0 }}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </motion.div>
          )}
          {buttonText && (
            <span className={cn(showIcon && "ml-2")}>
              {buttonText}
            </span>
          )}
          
          {(isAdmin || isModerator) && (
            <Badge 
              variant="secondary" 
              className="ml-2 text-xs"
            >
              <Shield className="w-3 h-3 mr-1" />
              {isAdmin ? 'Admin' : 'Mod'}
            </Badge>
          )}
        </Button>
      </Tooltip>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <Modal
            open={showDeleteModal}
            onClose={handleCancel}
            className="max-w-md"
            closeOnOverlayClick={!isDeleting}
            closeOnEscape={!isDeleting}
          >
            <div className="relative">
              {!isDeleting && (
                <button
                  onClick={handleCancel}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                {renderDeleteStep()}
              </motion.div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default DeleteReview;
