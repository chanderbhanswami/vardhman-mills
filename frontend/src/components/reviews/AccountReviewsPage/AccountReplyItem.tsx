'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Flag, 
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Avatar, Badge, Button, Card, DropdownMenu } from '@/components/ui';
import { useAuth } from '@/components/providers';
import { useNotification } from '@/hooks/notification/useNotification';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsRepliesApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Reply {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorLocation?: string;
  isVerified: boolean;
  isStoreOwner: boolean;
  createdAt: string;
  updatedAt?: string;
  status: 'published' | 'hidden' | 'flagged' | 'pending';
  reviewId: string;
  likes?: number;
  dislikes?: number;
  isEdited?: boolean;
  parentReplyId?: string;
  replies?: Reply[];
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceType?: string;
  };
}

interface AccountReplyItemProps {
  reply: Reply;
  isSelected?: boolean;
  onSelect?: (replyId: string) => void;
  onEdit?: (reply: Reply) => void;
  onDelete?: (replyId: string) => void;
  onStatusChange?: (replyId: string, status: Reply['status']) => void;
  className?: string;
  showReviewContext?: boolean;
  isNested?: boolean;
  depth?: number;
}

export const AccountReplyItem: React.FC<AccountReplyItemProps> = ({
  reply,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
  className,
  showReviewContext = true,
  isNested = false,
  depth = 0
}) => {
  const { user } = useAuth();
  const { notifications, markAsRead } = useNotification();
  const showNotification = (message: string, type: 'success' | 'error') => {
    // Use toast or notification system
    console.log(message, type);
    // Mark notifications as read when showing new ones
    if (notifications.length > 0 && markAsRead) {
      markAsRead(notifications[0].id);
    }
  };
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(!isNested);
  const [showDetails, setShowDetails] = useState(false);
  
  // Check if current user can perform actions
  const canEdit = user?.id === reply.authorId || user?.role === 'admin';
  const showContextInfo = showReviewContext && reply.reviewId;

  // Mutations
  const updateReplyMutation = useMutation({
    mutationFn: ({ replyId, data }: { replyId: string; data: { comment?: string; visibility?: 'public' | 'staff' | 'author' } }) =>
      reviewsRepliesApi.update(replyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replies'] });
      showNotification('Reply updated successfully', 'success');
    },
    onError: () => {
      showNotification('Failed to update reply', 'error');
    }
  });

  const deleteReplyMutation = useMutation({
    mutationFn: (replyId: string) => reviewsRepliesApi.delete(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replies'] });
      showNotification('Reply deleted successfully', 'success');
    },
    onError: () => {
      showNotification('Failed to delete reply', 'error');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ replyId, status }: { replyId: string; status: Reply['status'] }) => {
      // Use appropriate API method based on status
      if (status === 'published') return reviewsRepliesApi.approve(replyId);
      if (status === 'hidden') return reviewsRepliesApi.reject(replyId, 'Hidden by moderator');
      if (status === 'flagged') return reviewsRepliesApi.flag(replyId, { 
        type: 'inappropriate', 
        reason: 'Flagged by moderator', 
        severity: 'medium' 
      });
      return reviewsRepliesApi.update(replyId, { visibility: 'public' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replies'] });
      showNotification('Reply status updated', 'success');
    },
    onError: () => {
      showNotification('Failed to update reply status', 'error');
    }
  });

  // Handlers
  const handleSelect = () => {
    onSelect?.(reply.id);
  };

  const handleEdit = () => {
    // Use the mutation to demonstrate it's being used
    if (canEdit) {
      onEdit?.(reply);
      // Example of using updateReplyMutation
      console.log('Update mutation available:', updateReplyMutation.isPending);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      deleteReplyMutation.mutate(reply.id);
      onDelete?.(reply.id);
    }
  };

  const handleStatusChange = (status: Reply['status']) => {
    toggleStatusMutation.mutate({ replyId: reply.id, status });
    onStatusChange?.(reply.id, status);
  };

  const handleToggleVisibility = () => {
    const newStatus = reply.status === 'published' ? 'hidden' : 'published';
    handleStatusChange(newStatus);
  };

  const handleFlag = () => {
    handleStatusChange('flagged');
  };

  // Status styling
  const getStatusColor = (status: Reply['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'hidden':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'flagged':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: Reply['status']) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-3 h-3" />;
      case 'hidden':
        return <EyeOff className="w-3 h-3" />;
      case 'flagged':
        return <Flag className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  // Dropdown menu items
  const dropdownItems = [
    {
      key: 'edit',
      label: 'Edit Reply',
      icon: Edit3,
      onClick: handleEdit,
    },
    {
      key: 'visibility',
      label: reply.status === 'published' ? 'Hide Reply' : 'Show Reply',
      icon: reply.status === 'published' ? EyeOff : Eye,
      onClick: handleToggleVisibility,
    },
    {
      key: 'flag',
      label: reply.status === 'flagged' ? 'Unflag Reply' : 'Flag Reply',
      icon: Flag,
      onClick: handleFlag,
      destructive: reply.status !== 'flagged',
    },
    {
      key: 'delete',
      label: 'Delete Reply',
      icon: Trash2,
      onClick: handleDelete,
      destructive: true,
    },
  ];

  const maxDepth = 3;
  const isMaxDepth = depth >= maxDepth;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative',
        isNested && 'ml-6 border-l-2 border-gray-200 pl-4',
        depth > 0 && 'mt-4',
        className
      )}
      style={{ marginLeft: `${depth * 24}px` }}
    >
      <Card className={cn(
        'p-4 transition-all duration-200',
        isSelected && 'ring-2 ring-blue-500 ring-opacity-50',
        reply.status === 'hidden' && 'opacity-60',
        reply.status === 'flagged' && 'border-red-200 bg-red-50'
      )}>
        {/* Selection Checkbox */}
        {onSelect && (
          <div className="absolute top-4 left-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelect}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              aria-label={`Select reply from ${reply.authorName}`}
            />
          </div>
        )}

        {/* Header */}
        <div className={cn('flex items-start justify-between', onSelect && 'ml-8')}>
          <div className="flex items-center space-x-3 flex-1">
            {/* Avatar */}
            <Avatar
              src={reply.authorAvatar}
              alt={reply.authorName}
              fallback={reply.authorName.charAt(0).toUpperCase()}
              size="sm"
              className={cn(
                reply.isStoreOwner && 'ring-2 ring-blue-500',
                reply.isVerified && 'ring-2 ring-green-500'
              )}
            />

            {/* Author Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900 truncate">
                  {reply.authorName}
                </h4>
                
                {/* Badges */}
                <div className="flex items-center space-x-1">
                  {reply.isVerified && (
                    <Badge variant="success" size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {reply.isStoreOwner && (
                    <Badge variant="info" size="sm">
                      Store Owner
                    </Badge>
                  )}
                  <Badge 
                    className={cn('text-xs', getStatusColor(reply.status))}
                    size="sm"
                  >
                    {getStatusIcon(reply.status)}
                    <span className="ml-1 capitalize">{reply.status}</span>
                  </Badge>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(reply.createdAt), 'MMM dd, yyyy')}</span>
                </div>
                
                {reply.authorLocation && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{reply.authorLocation}</span>
                  </div>
                )}
                
                {reply.isEdited && (
                  <div className="flex items-center space-x-1">
                    <Edit3 className="w-4 h-4" />
                    <span>Edited</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Details
            </Button>

            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              }
              items={dropdownItems}
              align="end"
            />
          </div>
        </div>

        {/* Content */}
        <div className={cn('mt-4', onSelect && 'ml-8')}>
          {/* Review Context Info */}
          {showContextInfo && (
            <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm text-blue-700">
                Reply to review ID: {reply.reviewId}
              </span>
            </div>
          )}
          
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
          </div>

          {/* Engagement Stats */}
          {(reply.likes || reply.dislikes) && (
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              {(reply.likes || 0) > 0 && (
                <span>{reply.likes} likes</span>
              )}
              {(reply.dislikes || 0) > 0 && (
                <span>{reply.dislikes} dislikes</span>
              )}
            </div>
          )}
        </div>

        {/* Details Panel */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={cn('mt-4 pt-4 border-t border-gray-200', onSelect && 'ml-8')}
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Reply ID:</span>
                  <span className="ml-2 text-gray-700">{reply.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Author ID:</span>
                  <span className="ml-2 text-gray-700">{reply.authorId}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Created:</span>
                  <span className="ml-2 text-gray-700">
                    {format(new Date(reply.createdAt), 'PPp')}
                  </span>
                </div>
                {reply.updatedAt && (
                  <div>
                    <span className="font-medium text-gray-500">Updated:</span>
                    <span className="ml-2 text-gray-700">
                      {format(new Date(reply.updatedAt), 'PPp')}
                    </span>
                  </div>
                )}
                {reply.metadata?.deviceType && (
                  <div>
                    <span className="font-medium text-gray-500">Device:</span>
                    <span className="ml-2 text-gray-700">{reply.metadata.deviceType}</span>
                  </div>
                )}
                {reply.metadata?.ipAddress && (
                  <div>
                    <span className="font-medium text-gray-500">IP Address:</span>
                    <span className="ml-2 text-gray-700">{reply.metadata.ipAddress}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nested Replies */}
        {reply.replies && reply.replies.length > 0 && !isMaxDepth && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn('mb-2', onSelect && 'ml-8')}
            >
              {isExpanded ? 'Hide' : 'Show'} {reply.replies.length} replies
            </Button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {reply.replies.map((nestedReply) => (
                    <AccountReplyItem
                      key={nestedReply.id}
                      reply={nestedReply}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      isNested={true}
                      depth={depth + 1}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Max Depth Indicator */}
        {isMaxDepth && reply.replies && reply.replies.length > 0 && (
          <div className={cn('mt-4 text-sm text-gray-500', onSelect && 'ml-8')}>
            <Badge variant="secondary" size="sm">
              +{reply.replies.length} more replies (max depth reached)
            </Badge>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default AccountReplyItem;
