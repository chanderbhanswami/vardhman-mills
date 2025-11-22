'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/ui/Button';
import { DialogFooter } from '@/components/ui/Dialog';
import { TextArea } from '@/components/ui/TextArea';
import { Label } from '@/components/ui/RadioExtended';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { useToast } from '@/hooks/useToast';

import { cn } from '@/lib/utils';

export interface ReplyDeleteProps {
  replyId: string;
  replyContent?: string;
  replyAuthor?: string;
  hasReplies?: boolean;
  repliesCount?: number;
  isOwner?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  requireReason?: boolean;
  permanentDelete?: boolean;
  className?: string;

  // Event handlers
  onConfirm: (reason?: string) => Promise<void>;
  onCancel: () => void;
  
  // Analytics
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

const DELETE_REASONS = [
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'spam', label: 'Spam or promotional content' },
  { value: 'off_topic', label: 'Off-topic or irrelevant' },
  { value: 'duplicate', label: 'Duplicate content' },
  { value: 'personal_info', label: 'Contains personal information' },
  { value: 'harassment', label: 'Harassment or abuse' },
  { value: 'misinformation', label: 'Misinformation or false claims' },
  { value: 'copyright', label: 'Copyright violation' },
  { value: 'request', label: 'Requested by user' },
  { value: 'other', label: 'Other reason' }
] as const;

const ReplyDelete: React.FC<ReplyDeleteProps> = ({
  replyId,
  replyContent,
  replyAuthor,
  hasReplies = false,
  repliesCount = 0,
  isOwner = false,
  isAdmin = false,
  isModerator = false,
  requireReason = false,
  permanentDelete = false,
  className,
  onConfirm,
  onCancel,
  onAnalyticsEvent
}) => {
  // State
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [confirmText, setConfirmText] = useState('');

  // Hooks
  const { toast } = useToast();

  // Determine if reason is required
  const needsReason = requireReason || isAdmin || isModerator || hasReplies || permanentDelete;
  
  // Get delete action text
  const getDeleteActionText = useCallback(() => {
    if (permanentDelete) return 'Permanently Delete';
    if (hasReplies) return 'Delete Thread';
    return 'Delete Reply';
  }, [permanentDelete, hasReplies]);

  // Get warning message
  const getWarningMessage = useCallback(() => {
    if (permanentDelete && hasReplies) {
      return `This will permanently delete the reply and all ${repliesCount} nested replies. This action cannot be undone.`;
    }
    if (permanentDelete) {
      return 'This will permanently delete the reply. This action cannot be undone.';
    }
    if (hasReplies) {
      return `This reply has ${repliesCount} nested replies. Deleting this reply will also delete all nested replies.`;
    }
    return 'Are you sure you want to delete this reply?';
  }, [permanentDelete, hasReplies, repliesCount]);

  // Handle reason selection
  const handleReasonChange = useCallback((reason: string) => {
    setSelectedReason(reason);
    if (reason !== 'other') {
      setCustomReason('');
    }
  }, []);

  // Validate form
  const isFormValid = useCallback(() => {
    if (!needsReason) return true;
    if (!selectedReason) return false;
    if (selectedReason === 'other' && !customReason.trim()) return false;
    if (permanentDelete && confirmText.toLowerCase() !== 'delete') return false;
    return true;
  }, [needsReason, selectedReason, customReason, permanentDelete, confirmText]);

  // Handle delete confirmation
  const handleDelete = useCallback(async () => {
    if (!isFormValid()) return;

    setIsDeleting(true);
    
    try {
      const finalReason = selectedReason === 'other' ? customReason : selectedReason;
      
      // Track analytics
      onAnalyticsEvent?.('reply_delete_attempt', {
        replyId,
        reason: finalReason,
        hasReplies,
        repliesCount,
        permanentDelete,
        isOwner,
        isAdmin,
        isModerator
      });

      await onConfirm(finalReason || undefined);
      
      // Track success
      onAnalyticsEvent?.('reply_delete_success', {
        replyId,
        reason: finalReason
      });

      toast({
        title: 'Reply deleted successfully',
        description: permanentDelete ? 'The reply has been permanently removed.' : 'The reply has been deleted.',
      });
      
    } catch (error) {
      console.error('Failed to delete reply:', error);
      
      // Track failure
      onAnalyticsEvent?.('reply_delete_failure', {
        replyId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      toast({
        title: 'Failed to delete reply',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  }, [
    isFormValid, selectedReason, customReason, onConfirm, replyId, hasReplies, 
    repliesCount, permanentDelete, isOwner, isAdmin, isModerator, 
    onAnalyticsEvent, toast
  ]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    onAnalyticsEvent?.('reply_delete_cancel', { replyId });
    onCancel();
  }, [onCancel, onAnalyticsEvent, replyId]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn('space-y-6', className)}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {getDeleteActionText()}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {getWarningMessage()}
          </p>
        </div>
      </div>

      {/* Reply Preview */}
      {replyContent && (
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">
              {replyAuthor || 'Anonymous'}
            </span>
            {isOwner && (
              <Badge variant="outline" className="text-xs">
                Your reply
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-3">
            {replyContent}
          </p>
        </div>
      )}

      {/* Replies Warning */}
      {hasReplies && repliesCount > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Warning:</strong> This reply has {repliesCount} nested reply{repliesCount !== 1 ? 'ies' : ''}. 
            Deleting this reply will also delete all nested replies.
          </AlertDescription>
        </Alert>
      )}

      {/* Permanent Delete Warning */}
      {permanentDelete && (
        <Alert className="border-red-200 bg-red-50">
          <TrashIcon className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Permanent Deletion:</strong> This action cannot be undone. The reply will be permanently removed from the system.
          </AlertDescription>
        </Alert>
      )}

      {/* Reason Selection */}
      {needsReason && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="delete-reason" className="text-sm font-medium text-gray-700">
              Reason for deletion {needsReason && <span className="text-red-500">*</span>}
            </Label>
            <div className="mt-2 grid grid-cols-1 gap-2">
              {DELETE_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={cn(
                    'flex items-center p-3 rounded-lg border cursor-pointer transition-colors',
                    selectedReason === reason.value
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <input
                    type="radio"
                    name="delete-reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => handleReasonChange(e.target.value)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    {reason.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          {selectedReason === 'other' && (
            <div>
              <Label htmlFor="custom-reason" className="text-sm font-medium text-gray-700">
                Please specify the reason
              </Label>
              <TextArea
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter the reason for deletion..."
                className="mt-1"
                rows={3}
                maxLength={500}
              />
              <div className="mt-1 text-xs text-gray-500 text-right">
                {customReason.length}/500 characters
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Input for Permanent Delete */}
      {permanentDelete && (
        <div>
          <Label htmlFor="confirm-delete" className="text-sm font-medium text-gray-700">
            Type &ldquo;DELETE&rdquo; to confirm permanent deletion
          </Label>
          <input
            id="confirm-delete"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className={cn(
              'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm text-sm',
              'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
              confirmText.toLowerCase() === 'delete' 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300'
            )}
          />
        </div>
      )}

      {/* Footer */}
      <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isDeleting}
          className="flex-1 sm:flex-none"
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={!isFormValid() || isDeleting}
          className="flex-1 sm:flex-none"
        >
          {isDeleting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Deleting...</span>
            </div>
          ) : (
            <>
              <TrashIcon className="w-4 h-4 mr-2" />
              {getDeleteActionText()}
            </>
          )}
        </Button>
      </DialogFooter>

      {/* Additional Info */}
      <div className="text-xs text-gray-500 border-t pt-4">
        <p>
          Reply ID: {replyId}
        </p>
        {isAdmin && (
          <p className="mt-1">
            Action performed by: Administrator
          </p>
        )}
        {isModerator && !isAdmin && (
          <p className="mt-1">
            Action performed by: Moderator
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ReplyDelete;
