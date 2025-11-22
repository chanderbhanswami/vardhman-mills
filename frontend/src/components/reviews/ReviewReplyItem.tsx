'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftRightIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  FlagIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { Tooltip } from '@/components/ui/Tooltip';
import { TextArea } from '@/components/ui/TextArea';
import { useAuth } from '@/components/providers';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { ReviewUser } from '@/types/review.types';
import { Timestamp } from '@/types/common.types';

export interface ReviewReplyItemProps {
  id: string;
  content: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isEdited: boolean;
  isPinned: boolean;
  isHighlighted: boolean;
  likes: number;
  dislikes: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  user: ReviewUser;
  replies?: ReviewReplyItemProps[];
  parentReplyId?: string;
  maxDepth?: number;
  currentDepth?: number;
  className?: string;

  // Event handlers
  onReply?: (replyId: string, content: string) => void;
  onEdit?: (replyId: string, newContent: string) => void;
  onDelete?: (replyId: string) => void;
  onLike?: (replyId: string) => void;
  onDislike?: (replyId: string) => void;
  onReport?: (replyId: string, reason: string) => void;
  onPin?: (replyId: string, pinned: boolean) => void;
  onUserClick?: (user: ReviewUser) => void;
}

const ReviewReplyItem: React.FC<ReviewReplyItemProps> = ({
  id,
  content,
  createdAt,
  updatedAt,
  isEdited,
  isPinned,
  isHighlighted,
  likes,
  dislikes,
  isLiked = false,
  isDisliked = false,
  user,
  replies = [],
  parentReplyId,
  maxDepth = 3,
  currentDepth = 0,
  className,
  onReply,
  onEdit,
  onDelete,
  onLike,
  onDislike,
  onReport,
  onPin,
  onUserClick
}) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const isOwner = currentUser?.id === user.id;
  const canModerate = currentUser?.role === 'admin' || currentUser?.role === 'moderator';
  const canReply = currentDepth < maxDepth;

  const setActionLoading = useCallback((action: string, loading: boolean) => {
    setIsLoading(prev => ({ ...prev, [action]: loading }));
  }, []);

  const handleLike = useCallback(async () => {
    if (!currentUser || isLoading.like) return;
    setActionLoading('like', true);
    try {
      await onLike?.(id);
      toast({
        title: isLiked ? 'Like removed' : 'Reply liked!',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to like reply:', error);
      toast({
        title: 'Failed to like reply',
        variant: 'destructive'
      });
    } finally {
      setActionLoading('like', false);
    }
  }, [currentUser, isLoading.like, isLiked, onLike, id, toast, setActionLoading]);

  const handleDislike = useCallback(async () => {
    if (!currentUser || isLoading.dislike) return;
    setActionLoading('dislike', true);
    try {
      await onDislike?.(id);
      toast({
        title: isDisliked ? 'Dislike removed' : 'Reply disliked',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to dislike reply:', error);
      toast({
        title: 'Failed to dislike reply',
        variant: 'destructive'
      });
    } finally {
      setActionLoading('dislike', false);
    }
  }, [currentUser, isLoading.dislike, isDisliked, onDislike, id, toast, setActionLoading]);

  const handleEdit = useCallback(async () => {
    if (!editContent.trim() || isLoading.edit) return;
    setActionLoading('edit', true);
    try {
      await onEdit?.(id, editContent);
      setIsEditing(false);
      toast({
        title: 'Reply updated!',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to update reply:', error);
      toast({
        title: 'Failed to update reply',
        variant: 'destructive'
      });
    } finally {
      setActionLoading('edit', false);
    }
  }, [editContent, isLoading.edit, onEdit, id, toast, setActionLoading]);

  const handleReply = useCallback(async () => {
    if (!replyContent.trim() || isLoading.reply) return;
    setActionLoading('reply', true);
    try {
      await onReply?.(parentReplyId || id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
      setShowReplies(true);
      toast({
        title: 'Reply posted!',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to post reply:', error);
      toast({
        title: 'Failed to post reply',
        variant: 'destructive'
      });
    } finally {
      setActionLoading('reply', false);
    }
  }, [replyContent, isLoading.reply, onReply, parentReplyId, id, toast, setActionLoading]);

  const handleDelete = useCallback(async () => {
    if (isLoading.delete) return;
    setActionLoading('delete', true);
    try {
      await onDelete?.(id);
      toast({
        title: 'Reply deleted',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to delete reply:', error);
      toast({
        title: 'Failed to delete reply',
        variant: 'destructive'
      });
    } finally {
      setActionLoading('delete', false);
    }
  }, [isLoading.delete, onDelete, id, toast, setActionLoading]);

  const formatCount = useCallback((count: number): string => {
    if (count === 0) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  }, []);

  const getTimeAgo = useCallback((timestamp: Timestamp) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'space-y-3',
        isPinned && 'bg-blue-50 border border-blue-200 rounded-lg p-3',
        isHighlighted && 'bg-yellow-50 border border-yellow-200 rounded-lg p-3',
        className
      )}
    >
      {/* Main Reply */}
      <div className="flex gap-3">
        {/* Avatar */}
        <button
          onClick={() => onUserClick?.(user)}
          className="flex-shrink-0"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage 
              src={user.avatar?.url} 
              alt={user.displayName}
            />
            <AvatarFallback className="text-xs">
              {user.displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onUserClick?.(user)}
              className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {user.displayName}
            </button>
            
            {user.isVerified && (
              <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
            )}
            
            {isPinned && (
              <Badge variant="secondary" className="text-xs">
                📌 Pinned
              </Badge>
            )}
            
            {isHighlighted && (
              <Badge variant="secondary" className="text-xs">
                ⭐ Highlighted
              </Badge>
            )}
            
            <time className="text-sm text-gray-500" dateTime={createdAt.toString()}>
              {getTimeAgo(createdAt)}
            </time>
            
            {isEdited && updatedAt && (
              <Tooltip content={`Edited ${getTimeAgo(updatedAt)}`}>
                <span className="text-xs text-gray-400">(edited)</span>
              </Tooltip>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-2">
              <TextArea
                value={editContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
                placeholder="Edit your reply..."
                className="min-h-[80px] resize-none"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={!editContent.trim() || isLoading.edit}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Like */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={!currentUser || isLoading.like}
                className={cn(
                  'gap-1 text-xs px-2 py-1 h-7',
                  isLiked && 'text-green-600 bg-green-50 hover:bg-green-100'
                )}
              >
                <HandThumbUpIcon className={cn(
                  'w-3 h-3',
                  isLiked && 'hidden'
                )} />
                <HandThumbUpSolidIcon className={cn(
                  'w-3 h-3',
                  !isLiked && 'hidden'
                )} />
                {likes > 0 && formatCount(likes)}
              </Button>

              {/* Dislike */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDislike}
                disabled={!currentUser || isLoading.dislike}
                className={cn(
                  'gap-1 text-xs px-2 py-1 h-7',
                  isDisliked && 'text-red-600 bg-red-50 hover:bg-red-100'
                )}
              >
                <HandThumbDownIcon className={cn(
                  'w-3 h-3',
                  isDisliked && 'hidden'
                )} />
                <HandThumbDownSolidIcon className={cn(
                  'w-3 h-3',
                  !isDisliked && 'hidden'
                )} />
                {dislikes > 0 && formatCount(dislikes)}
              </Button>

              {/* Reply */}
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  disabled={!currentUser}
                  className="gap-1 text-xs px-2 py-1 h-7"
                >
                  <ChatBubbleLeftRightIcon className="w-3 h-3" />
                  Reply
                </Button>
              )}
            </div>

            {/* More Actions */}
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm" className="w-7 h-7 p-0">
                  <EllipsisVerticalIcon className="w-3 h-3" />
                </Button>
              }
              items={[
                ...(isOwner ? [
                  {
                    key: 'edit',
                    label: 'Edit',
                    icon: PencilIcon,
                    onClick: () => setIsEditing(true)
                  },
                  {
                    key: 'delete',
                    label: 'Delete',
                    icon: TrashIcon,
                    onClick: handleDelete,
                    destructive: true
                  }
                ] : []),
                ...(canModerate ? [
                  {
                    key: 'pin',
                    label: isPinned ? 'Unpin' : 'Pin',
                    icon: ArrowTopRightOnSquareIcon,
                    onClick: () => onPin?.(id, !isPinned)
                  }
                ] : []),
                ...(!isOwner ? [
                  {
                    key: 'report',
                    label: 'Report',
                    icon: FlagIcon,
                    onClick: () => onReport?.(id, 'inappropriate')
                  }
                ] : [])
              ]}
              align="end"
            />
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <TextArea
                value={replyContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px] resize-none text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim() || isLoading.reply}
                >
                  Reply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {/* Nested Replies */}
          {replies.length > 0 && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs h-6 px-2 text-blue-600 hover:text-blue-800"
              >
                {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </Button>

              {showReplies && (
                <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                  {replies.map((reply) => (
                    <ReviewReplyItem
                      key={reply.id}
                      {...reply}
                      currentDepth={currentDepth + 1}
                      maxDepth={maxDepth}
                      onReply={onReply}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onLike={onLike}
                      onDislike={onDislike}
                      onReport={onReport}
                      onPin={onPin}
                      onUserClick={onUserClick}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewReplyItem;