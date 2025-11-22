'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

import { Button } from '@/components/ui/Button';
import { DialogFooter } from '@/components/ui/Dialog';
import { TextArea } from '@/components/ui/TextArea';
import { Label } from '@/components/ui/RadioExtended';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress';
import { useToast } from '@/hooks/useToast';

import { cn } from '@/lib/utils';

export interface ReplyEditProps {
  replyId: string;
  currentContent: string;
  originalContent?: string;
  maxLength?: number;
  minLength?: number;
  allowFormatting?: boolean;
  showPreview?: boolean;
  showDiff?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  editTimeLimit?: number; // minutes
  editHistory?: EditHistoryItem[];
  isOwner?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  requireReason?: boolean;
  className?: string;

  // Event handlers
  onSave: (newContent: string, editReason?: string) => Promise<void>;
  onCancel: () => void;
  onAutoSave?: (content: string) => Promise<void>;
  
  // Analytics
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

export interface EditHistoryItem {
  id: string;
  editedAt: string;
  editedBy: string;
  editedByName: string;
  reason: string;
  previousContent: string;
  newContent: string;
  changes: ChangeItem[];
}

export interface ChangeItem {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  startIndex: number;
  endIndex: number;
}

const EDIT_REASONS = [
  { value: 'typo', label: 'Fix typos or grammar' },
  { value: 'clarity', label: 'Improve clarity' },
  { value: 'additional_info', label: 'Add additional information' },
  { value: 'remove_info', label: 'Remove outdated information' },
  { value: 'tone', label: 'Adjust tone' },
  { value: 'formatting', label: 'Fix formatting' },
  { value: 'policy', label: 'Policy compliance' },
  { value: 'other', label: 'Other reason' }
] as const;

const ReplyEdit: React.FC<ReplyEditProps> = ({
  replyId,
  currentContent,
  originalContent = currentContent,
  maxLength = 2000,
  minLength = 10,
  allowFormatting = false,
  showPreview = true,
  showDiff = true,
  autoSave = false,
  autoSaveInterval = 30000, // 30 seconds
  editTimeLimit = 30, // 30 minutes
  editHistory = [],
  isOwner = false,
  isAdmin = false,
  isModerator = false,
  requireReason = false,
  className,
  onSave,
  onCancel,
  onAutoSave,
  onAnalyticsEvent
}) => {
  // State
  const [content, setContent] = useState(currentContent);
  const [editReason, setEditReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showPreviewMode, setShowPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [charCount, setCharCount] = useState(currentContent.length);
  const [wordCount, setWordCount] = useState(currentContent.split(/\s+/).filter(Boolean).length);

  // Hooks
  const { toast } = useToast();

  // Computed values
  const hasChanges = content !== currentContent;
  const isContentValid = content.length >= minLength && content.length <= maxLength;
  const needsReason = requireReason || isAdmin || isModerator || editHistory.length > 0;
  
  // Progress calculations
  const lengthProgress = (content.length / maxLength) * 100;
  const lengthProgressColor = lengthProgress > 90 ? 'destructive' : lengthProgress > 75 ? 'warning' : 'default';

  // Update counts when content changes
  useEffect(() => {
    setCharCount(content.length);
    setWordCount(content.split(/\s+/).filter(Boolean).length);
    setHasUnsavedChanges(content !== currentContent);
  }, [content, currentContent]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onAutoSave || !hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(async () => {
      if (isContentValid && hasChanges) {
        setIsAutoSaving(true);
        try {
          await onAutoSave(content);
          setLastAutoSave(new Date());
          
          onAnalyticsEvent?.('reply_auto_save', {
            replyId,
            contentLength: content.length,
            wordCount
          });
          
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsAutoSaving(false);
        }
      }
    }, autoSaveInterval);

    return () => clearTimeout(autoSaveTimer);
  }, [
    content, hasUnsavedChanges, autoSave, onAutoSave, isContentValid, 
    hasChanges, autoSaveInterval, replyId, wordCount, onAnalyticsEvent
  ]);

  // Time limit check
  const timeRemaining = useMemo(() => {
    if (!editTimeLimit) return null;
    
    const now = new Date();
    const editStart = editHistory.length > 0 
      ? new Date(editHistory[editHistory.length - 1].editedAt)
      : new Date();
    
    const timeElapsed = (now.getTime() - editStart.getTime()) / (1000 * 60); // minutes
    const remaining = editTimeLimit - timeElapsed;
    
    return remaining > 0 ? remaining : 0;
  }, [editTimeLimit, editHistory]);

  // Handle content change
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    
    onAnalyticsEvent?.('reply_edit_typing', {
      replyId,
      contentLength: newContent.length,
      wordCount: newContent.split(/\s+/).filter(Boolean).length
    });
  }, [replyId, onAnalyticsEvent]);

  // Handle reason change
  const handleReasonChange = useCallback((reason: string) => {
    setEditReason(reason);
    if (reason !== 'other') {
      setCustomReason('');
    }
  }, []);

  // Validate form
  const isFormValid = useCallback(() => {
    if (!isContentValid) return false;
    if (!hasChanges) return false;
    if (needsReason && !editReason) return false;
    if (editReason === 'other' && !customReason.trim()) return false;
    if (timeRemaining !== null && timeRemaining <= 0) return false;
    return true;
  }, [isContentValid, hasChanges, needsReason, editReason, customReason, timeRemaining]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!isFormValid()) return;

    setIsSaving(true);
    
    try {
      const finalReason = editReason === 'other' ? customReason : editReason;
      
      // Track analytics
      onAnalyticsEvent?.('reply_edit_attempt', {
        replyId,
        reason: finalReason,
        contentLength: content.length,
        wordCount,
        hasChanges,
        editHistoryCount: editHistory.length
      });

      await onSave(content, finalReason || undefined);
      
      // Track success
      onAnalyticsEvent?.('reply_edit_success', {
        replyId,
        reason: finalReason,
        contentLength: content.length,
        wordCount
      });

      toast({
        title: 'Reply updated successfully',
        description: 'Your changes have been saved.',
      });
      
    } catch (error) {
      console.error('Failed to save reply:', error);
      
      // Track failure
      onAnalyticsEvent?.('reply_edit_failure', {
        replyId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      toast({
        title: 'Failed to save reply',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    isFormValid, editReason, customReason, onSave, content, replyId,
    wordCount, hasChanges, editHistory.length, onAnalyticsEvent, toast
  ]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmCancel) return;
    }

    onAnalyticsEvent?.('reply_edit_cancel', { 
      replyId, 
      hasUnsavedChanges,
      contentLength: content.length 
    });
    
    onCancel();
  }, [hasUnsavedChanges, onCancel, onAnalyticsEvent, replyId, content.length]);

  // Generate diff (simplified)
  const generateDiff = useCallback(() => {
    if (!showDiff || !hasChanges) return null;

    // Simple diff implementation - in a real app, use a proper diff library
    const originalWords = originalContent.split(' ');
    const currentWords = content.split(' ');
    
    const changes = [];
    const maxLength = Math.max(originalWords.length, currentWords.length);
    
    for (let i = 0; i < maxLength; i++) {
      const originalWord = originalWords[i] || '';
      const currentWord = currentWords[i] || '';
      
      if (originalWord !== currentWord) {
        if (!originalWord) {
          changes.push({ type: 'added', content: currentWord });
        } else if (!currentWord) {
          changes.push({ type: 'removed', content: originalWord });
        } else {
          changes.push({ type: 'removed', content: originalWord });
          changes.push({ type: 'added', content: currentWord });
        }
      } else {
        changes.push({ type: 'unchanged', content: originalWord });
      }
    }
    
    return changes;
  }, [showDiff, hasChanges, originalContent, content]);

  const diff = generateDiff();

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
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <PencilIcon className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit Reply
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Make changes to your reply content.
          </p>
        </div>
      </div>

      {/* Time Limit Warning */}
      {timeRemaining !== null && timeRemaining <= 5 && (
        <Alert className="border-amber-200 bg-amber-50">
          <ClockIcon className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Time limit:</strong> You have {Math.floor(timeRemaining)} minutes remaining to edit this reply.
          </AlertDescription>
        </Alert>
      )}

      {/* Auto-save Status */}
      {autoSave && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {isAutoSaving && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Auto-saving...</span>
            </div>
          )}
          {lastAutoSave && !isAutoSaving && (
            <span>
              Last auto-saved: {lastAutoSave.toLocaleTimeString()}
            </span>
          )}
          {hasUnsavedChanges && !isAutoSaving && (
            <Badge variant="outline" className="text-xs">
              Unsaved changes
            </Badge>
          )}
        </div>
      )}

      {/* Content Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="edit-content" className="text-sm font-medium text-gray-700">
            Reply Content
          </Label>
          {showPreview && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreviewMode(!showPreviewMode)}
                className="text-xs"
              >
                <EyeIcon className="w-3 h-3 mr-1" />
                {showPreviewMode ? 'Edit' : 'Preview'}
              </Button>
              {allowFormatting && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>Formatting supported</span>
                </div>
              )}
            </div>
          )}
        </div>

        {showPreviewMode ? (
          <div className="min-h-[200px] p-4 border rounded-lg bg-gray-50">
            <div className="prose prose-sm max-w-none">
              {content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {paragraph || '\u00A0'}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <TextArea
            id="edit-content"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Write your reply..."
            className="min-h-[200px] resize-none"
            maxLength={maxLength}
          />
        )}

        {/* Character/Word Count and Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{wordCount} words</span>
            <span 
              className={cn(
                charCount > maxLength * 0.9 && 'text-red-600',
                charCount > maxLength * 0.75 && charCount <= maxLength * 0.9 && 'text-amber-600'
              )}
            >
              {charCount}/{maxLength} characters
            </span>
          </div>
          <Progress 
            value={lengthProgress} 
            variant={lengthProgressColor}
            className="h-1"
          />
        </div>
      </div>

      {/* Diff View */}
      {diff && hasChanges && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Changes Preview
          </Label>
          <div className="p-4 border rounded-lg bg-gray-50 max-h-40 overflow-y-auto">
            <div className="text-sm space-y-1">
              {diff.map((change, index) => (
                <span
                  key={index}
                  className={cn(
                    'px-1',
                    change.type === 'added' && 'bg-green-100 text-green-800',
                    change.type === 'removed' && 'bg-red-100 text-red-800 line-through',
                    change.type === 'unchanged' && 'text-gray-600'
                  )}
                >
                  {change.content}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Reason */}
      {needsReason && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-reason" className="text-sm font-medium text-gray-700">
              Reason for edit {needsReason && <span className="text-red-500">*</span>}
            </Label>
            <div className="mt-2 grid grid-cols-1 gap-2">
              {EDIT_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={cn(
                    'flex items-center p-3 rounded-lg border cursor-pointer transition-colors',
                    editReason === reason.value
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <input
                    type="radio"
                    name="edit-reason"
                    value={reason.value}
                    checked={editReason === reason.value}
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
          {editReason === 'other' && (
            <div>
              <Label htmlFor="custom-reason" className="text-sm font-medium text-gray-700">
                Please specify the reason
              </Label>
              <TextArea
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter the reason for editing..."
                className="mt-1"
                rows={2}
                maxLength={200}
              />
              <div className="mt-1 text-xs text-gray-500 text-right">
                {customReason.length}/200 characters
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit History */}
      {editHistory.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            Edit History ({editHistory.length} edit{editHistory.length !== 1 ? 's' : ''})
            {isOwner && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Owner</span>}
          </Label>
          <div className="max-h-32 overflow-y-auto border rounded-lg">
            {editHistory.slice(-3).map((edit, index) => (
              <div key={edit.id} className="p-3 border-b last:border-b-0">
                <div className="flex justify-between items-start text-xs">
                  <span className="font-medium">
                    {edit.editedByName} ({editHistory.length - index})
                  </span>
                  <span className="text-gray-500">
                    {new Date(edit.editedAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{edit.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Messages */}
      {!isContentValid && content.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {content.length < minLength 
              ? `Reply must be at least ${minLength} characters long.`
              : `Reply must not exceed ${maxLength} characters.`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Footer */}
      <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
          className="flex-1 sm:flex-none"
        >
          <XMarkIcon className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!isFormValid() || isSaving}
          className="flex-1 sm:flex-none"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            <>
              <CheckIcon className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </DialogFooter>

      {/* Additional Info */}
      <div className="text-xs text-gray-500 border-t pt-4">
        <p>
          Reply ID: {replyId}
        </p>
        {timeRemaining !== null && (
          <p className="mt-1">
            Edit time remaining: {Math.floor(timeRemaining)} minutes
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ReplyEdit;
