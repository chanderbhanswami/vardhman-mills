'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Reply, 
  Send,
  Loader2,
  X,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TextArea } from '@/components/ui/TextArea';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Switch } from '@/components/ui/Switch';
import { Card } from '@/components/ui/Card';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '@/lib/utils';

// Types
export interface ReplyData {
  content: string;
  isAnonymous?: boolean;
  parentId?: string;
  mentions?: string[];
  attachments?: string[];
}

export interface ReplyButtonProps {
  reviewId: string;
  userId?: string;
  parentReplyId?: string; // For nested replies
  replyCount?: number;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  showText?: boolean;
  showCount?: boolean;
  showIcon?: boolean;
  className?: string;
  
  // Behavior
  disabled?: boolean;
  requireLogin?: boolean;
  allowAnonymous?: boolean;
  maxLength?: number;
  placeholder?: string;
  autoFocus?: boolean;
  
  // Modal settings
  modalTitle?: string;
  modalSize?: 'sm' | 'md' | 'lg' | 'xl';
  showPreview?: boolean;
  
  // Validation
  minLength?: number;
  requiredFields?: string[];
  customValidation?: (data: ReplyData) => Promise<boolean | string>;
  
  // API
  apiEndpoint?: string;
  
  // Callbacks
  onReply?: (reviewId: string) => void;
  onReplySubmit?: (reviewId: string, replyData: ReplyData) => void;
  onReplySuccess?: (reviewId: string, reply: { id: string; content: string; userId: string; timestamp: string }) => void;
  onReplyError?: (reviewId: string, error: Error) => void;
  onModalOpen?: () => void;
  onModalClose?: () => void;
  onLoginRequired?: () => void;
  
  // Features
  enableMentions?: boolean;
  enableFormatting?: boolean;
  
  // Rate limiting
  cooldownPeriod?: number; // in milliseconds
  maxRepliesPerHour?: number;
}

const ReplyButton: React.FC<ReplyButtonProps> = ({
  reviewId,
  userId,
  parentReplyId,
  replyCount = 0,
  size = 'md',
  variant = 'ghost',
  showText = true,
  showCount = true,
  showIcon = true,
  className,
  disabled = false,
  requireLogin = true,
  allowAnonymous = false,
  maxLength = 1000,
  placeholder = 'Write your reply...',
  autoFocus = true,
  modalTitle = 'Reply to Review',
  modalSize = 'md',
  showPreview = false,
  minLength = 10,
  requiredFields = ['content'],
  customValidation,
  apiEndpoint = '/api/reviews/replies',
  onReply,
  onReplySubmit,
  onReplySuccess,
  onReplyError,
  onModalOpen,
  onModalClose,
  onLoginRequired,
  enableMentions = false,
  enableFormatting = false,
  cooldownPeriod = 30000, // 30 seconds
  maxRepliesPerHour = 10
}) => {
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyData, setReplyData] = useState<ReplyData>({
    content: '',
    isAnonymous: false,
    parentId: parentReplyId,
    mentions: [],
    attachments: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastReplyTime, setLastReplyTime] = useState<number>(0);
  const [replyHistory, setReplyHistory] = useState<Array<{ timestamp: number }>>([]);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const { toast } = useToast();

  // Check cooldown
  const isCooldownActive = React.useCallback(() => {
    return Date.now() - lastReplyTime < cooldownPeriod;
  }, [lastReplyTime, cooldownPeriod]);

  // Check rate limits
  const hasReachedRateLimit = React.useCallback(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentReplies = replyHistory.filter(reply => reply.timestamp > oneHourAgo);
    return recentReplies.length >= maxRepliesPerHour;
  }, [replyHistory, maxRepliesPerHour]);

  // Format reply count
  const formatReplyCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Validation
  const validateReply = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    requiredFields.forEach(field => {
      if (field === 'content' && !replyData.content.trim()) {
        newErrors.content = 'Reply content is required';
      }
    });

    // Length validation
    if (replyData.content.length < minLength) {
      newErrors.content = `Reply must be at least ${minLength} characters`;
    }
    if (replyData.content.length > maxLength) {
      newErrors.content = `Reply must not exceed ${maxLength} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle reply button click
  const handleReplyClick = () => {
    if (disabled) return;

    if (requireLogin && !userId) {
      onLoginRequired?.();
      toast({
        title: 'Login Required',
        description: 'Please log in to reply to reviews.',
        variant: 'warning'
      });
      return;
    }

    if (isCooldownActive()) {
      const remainingTime = Math.ceil((cooldownPeriod - (Date.now() - lastReplyTime)) / 1000);
      toast({
        title: 'Please Wait',
        description: `Please wait ${remainingTime} seconds before replying again.`,
        variant: 'warning'
      });
      return;
    }

    if (hasReachedRateLimit()) {
      toast({
        title: 'Rate Limit Reached',
        description: `You can only post ${maxRepliesPerHour} replies per hour.`,
        variant: 'warning'
      });
      return;
    }

    setShowReplyModal(true);
    onReply?.(reviewId);
    onModalOpen?.();
  };

  // Handle modal close
  const handleModalClose = () => {
    if (isSubmitting) return;
    
    if (replyData.content.trim() && !window.confirm('You have unsaved changes. Are you sure you want to close?')) {
      return;
    }

    setShowReplyModal(false);
    setReplyData({
      content: '',
      isAnonymous: false,
      parentId: parentReplyId,
      mentions: [],
      attachments: []
    });
    setErrors({});
    setActiveTab('write');
    onModalClose?.();
  };

  // Submit reply
  const submitReply = async () => {
    if (!validateReply()) return;

    // Custom validation
    if (customValidation) {
      try {
        const validationResult = await customValidation(replyData);
        if (typeof validationResult === 'string') {
          setErrors({ content: validationResult });
          return;
        }
        if (!validationResult) {
          setErrors({ content: 'Reply validation failed' });
          return;
        }
      } catch (error) {
        console.error('Custom validation failed:', error);
        setErrors({ content: 'Validation error occurred' });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...replyData,
        reviewId,
        userId,
        timestamp: new Date().toISOString()
      };

      onReplySubmit?.(reviewId, replyData);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit reply');
      }

      const result = await response.json();

      // Update rate limiting
      const now = Date.now();
      setLastReplyTime(now);
      setReplyHistory(prev => [...prev, { timestamp: now }]);

      toast({
        title: 'Reply Posted',
        description: 'Your reply has been posted successfully.',
        variant: 'success'
      });

      onReplySuccess?.(reviewId, result);
      handleModalClose();

    } catch (error) {
      console.error('Reply submission failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit reply';
      
      toast({
        title: 'Reply Failed',
        description: errorMessage,
        variant: 'error'
      });

      onReplyError?.(reviewId, error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form changes
  const handleFormChange = (field: keyof ReplyData, value: string | boolean | string[]) => {
    setReplyData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Render preview
  const renderPreview = () => {
    return (
      <div className="space-y-4">
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap">{replyData.content}</p>
        </div>
        
        {replyData.mentions && replyData.mentions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Mentions:</span>
            {replyData.mentions.map((mention) => (
              <Badge key={mention} variant="secondary">@{mention}</Badge>
            ))}
          </div>
        )}

        {replyData.isAnonymous && (
          <Badge variant="outline">Anonymous Reply</Badge>
        )}
      </div>
    );
  };

  // Button text based on context
  const buttonText = React.useMemo(() => {
    if (!showText) return null;
    if (parentReplyId) return 'Reply';
    return replyCount > 0 ? 'Reply' : 'Be first to reply';
  }, [showText, parentReplyId, replyCount]);

  const tooltipText = parentReplyId ? 'Reply to this comment' : 'Reply to this review';

  return (
    <>
      <Tooltip content={tooltipText}>
        <Button
          variant={variant}
          size={size}
          onClick={handleReplyClick}
          disabled={disabled}
          className={cn(
            "transition-all duration-200",
            "hover:scale-105 active:scale-95",
            "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            className
          )}
          aria-label={tooltipText}
        >
          {showIcon && (
            <motion.div
              whileHover={{ rotate: 15 }}
              whileTap={{ rotate: -15 }}
              transition={{ duration: 0.2 }}
            >
              {parentReplyId ? (
                <Reply className="w-4 h-4" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
            </motion.div>
          )}
          
          {buttonText && (
            <span className={cn(showIcon && "ml-2")}>
              {buttonText}
            </span>
          )}
          
          {showCount && replyCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {formatReplyCount(replyCount)}
            </Badge>
          )}
        </Button>
      </Tooltip>

      {/* Reply Modal */}
      {showReplyModal && (
        <Modal
          open={showReplyModal}
          onClose={handleModalClose}
          className={cn(
            modalSize === 'sm' && 'max-w-md',
            modalSize === 'md' && 'max-w-2xl',
            modalSize === 'lg' && 'max-w-4xl',
            modalSize === 'xl' && 'max-w-6xl'
          )}
          closeOnOverlayClick={!isSubmitting}
          closeOnEscape={!isSubmitting}
        >
          <div className="flex flex-col h-full max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">{modalTitle}</h2>
                {parentReplyId && (
                  <p className="text-sm text-gray-600 mt-1">Replying to a comment</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isCooldownActive() && (
                  <Tooltip content="Cooldown active">
                    <Clock className="w-4 h-4 text-yellow-500" />
                  </Tooltip>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleModalClose}
                  disabled={isSubmitting}
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            {showPreview && (
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('write')}
                    className={cn(
                      "py-4 px-1 border-b-2 font-medium text-sm",
                      activeTab === 'write'
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    Write
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={cn(
                      "py-4 px-1 border-b-2 font-medium text-sm",
                      activeTab === 'preview'
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    Preview
                  </button>
                </nav>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'write' ? (
                <div className="space-y-4">
                  {/* Reply Content */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Reply *</label>
                    <TextArea
                      value={replyData.content}
                      onChange={(e) => handleFormChange('content', e.target.value)}
                      placeholder={placeholder}
                      maxLength={maxLength}
                      rows={6}
                      autoFocus={autoFocus}
                      className={cn(
                        "resize-none",
                        errors.content && 'border-red-500'
                      )}
                    />
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{replyData.content.length}/{maxLength} characters</span>
                      {errors.content && (
                        <span className="text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.content}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  {allowAnonymous && (
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Anonymous Reply</label>
                        <p className="text-xs text-gray-600">Hide your name from this reply</p>
                      </div>
                      <Switch
                        checked={replyData.isAnonymous}
                        onCheckedChange={(checked) => handleFormChange('isAnonymous', checked)}
                      />
                    </div>
                  )}

                  {/* Rate Limit Warning */}
                  {hasReachedRateLimit() && (
                    <Card className="p-3 bg-yellow-50 border-yellow-200">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Rate Limit Warning</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        You have reached the maximum number of replies per hour.
                      </p>
                    </Card>
                  )}

                  {/* Mentions (if enabled) */}
                  {enableMentions && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mentions</label>
                      <div className="text-xs text-gray-600">
                        Use @username to mention someone in your reply
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                renderPreview()
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {enableFormatting && (
                  <span>Supports basic formatting</span>
                )}
                {enableMentions && (
                  <span>Use @ to mention users</span>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleModalClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitReply}
                  disabled={isSubmitting || !replyData.content.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ReplyButton;
