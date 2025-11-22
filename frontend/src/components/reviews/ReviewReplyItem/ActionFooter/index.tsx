'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HandThumbUpIcon,
  HandThumbDownIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { 
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/components/providers';

import ReplyEdit from './ReplyEdit';
import ReplyDelete from './ReplyDelete';
import { cn } from '@/lib/utils';
import { Timestamp } from '@/types/common.types';

// Types
export interface ReplyStats {
  likes: number;
  dislikes: number;
  replies: number;
  shares: number;
  bookmarks: number;
  reports: number;
  views: number;
  helpfulVotes: number;
  unhelpfulVotes: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  isBookmarked?: boolean;
  isReported?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
}

export interface ReplyUser {
  id: string;
  displayName: string;
  avatar?: string;
  isVerified: boolean;
  badges: string[];
  role: 'user' | 'moderator' | 'admin' | 'merchant';
  level: string;
  reputation: number;
  trustScore: number;
}

export interface ReplyMetadata {
  id: string;
  parentReplyId?: string;
  reviewId: string;
  content: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isEdited: boolean;
  editHistory: EditHistory[];
  isPinned: boolean;
  isHighlighted: boolean;
  isLocked: boolean;
  moderationStatus: 'approved' | 'pending' | 'flagged' | 'hidden' | 'deleted';
  moderationReason?: string;
  language: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  qualityScore: number;
  spamScore: number;
}

export interface EditHistory {
  editedAt: Timestamp;
  editedBy: string;
  reason: string;
  previousContent: string;
  changes: string[];
}

export interface ActionFooterProps {
  replyId: string;
  userId: string;
  user: ReplyUser;
  stats: ReplyStats;
  metadata: ReplyMetadata;
  isOwner: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canReport?: boolean;
  canPin?: boolean;
  canHighlight?: boolean;
  canModerate?: boolean;
  showStats?: boolean;
  showActions?: boolean;
  showAdvancedActions?: boolean;
  compact?: boolean;
  variant?: 'default' | 'minimal' | 'detailed' | 'inline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;

  // Event handlers
  onLike?: (replyId: string, isLiked: boolean) => Promise<void>;
  onDislike?: (replyId: string, isDisliked: boolean) => Promise<void>;
  onBookmark?: (replyId: string, isBookmarked: boolean) => Promise<void>;
  onShare?: (replyId: string, platform?: string) => Promise<void>;
  onReport?: (replyId: string, reason: string, details?: string) => Promise<void>;
  onReply?: (replyId: string, content: string) => Promise<void>;
  onPin?: (replyId: string, isPinned: boolean) => Promise<void>;
  onHighlight?: (replyId: string, isHighlighted: boolean) => Promise<void>;
  onModerate?: (replyId: string, action: string, reason?: string) => Promise<void>;
  onEdit?: (replyId: string, newContent: string) => Promise<void>;
  onDelete?: (replyId: string, reason?: string) => Promise<void>;
  onHelpful?: (replyId: string, isHelpful: boolean) => Promise<void>;
  onViewHistory?: (replyId: string) => void;
  onViewProfile?: (userId: string) => void;

  // Analytics
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

const BUTTON_SIZES = {
  xs: 'h-6 px-2 text-xs',
  sm: 'h-7 px-2 text-xs',
  md: 'h-8 px-3 text-sm',
  lg: 'h-9 px-4 text-sm'
} as const;

const ICON_SIZES = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-4 h-4'
} as const;

const ReplyActionFooter: React.FC<ActionFooterProps> = ({
  replyId,
  userId,
  user,
  stats,
  metadata,
  isOwner,
  isAdmin = false,
  isModerator = false,
  canEdit = isOwner || isAdmin || isModerator,
  canDelete = isOwner || isAdmin || isModerator,
  canReport = !isOwner,
  canPin = isAdmin || isModerator,
  canHighlight = isAdmin || isModerator,
  canModerate = isAdmin || isModerator,
  showStats = true,
  showActions = true,
  showAdvancedActions = true,
  compact = false,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  className,
  onLike,
  onDislike,
  onBookmark,
  onShare,
  onReport,
  onReply,
  onPin,
  onHighlight,
  onModerate,
  onEdit,
  onDelete,
  onHelpful,
  onViewHistory,
  onViewProfile,
  onAnalyticsEvent
}) => {
  // Hooks
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // State
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [localStats, setLocalStats] = useState(stats);

  // Permissions
  const permissions = useMemo(() => ({
    canPerformActions: !!currentUser,
    canLike: !!currentUser && currentUser.id !== userId,
    canDislike: !!currentUser && currentUser.id !== userId,
    canBookmark: !!currentUser,
    canShare: true,
    canReplyToReply: !!currentUser && currentUser.id !== userId,
    canEdit: canEdit && !!currentUser && (currentUser.id === userId || isAdmin || isModerator),
    canDelete: canDelete && !!currentUser && (currentUser.id === userId || isAdmin || isModerator),
    canReport: canReport && !!currentUser && currentUser.id !== userId,
    canPin: canPin && !!currentUser && (isAdmin || isModerator),
    canHighlight: canHighlight && !!currentUser && (isAdmin || isModerator),
    canModerate: canModerate && !!currentUser && (isAdmin || isModerator),
    canViewHistory: metadata.isEdited && (isOwner || isAdmin || isModerator)
  }), [currentUser, userId, canEdit, canDelete, canReport, canPin, canHighlight, canModerate, isAdmin, isModerator, isOwner, metadata.isEdited]);

  // Loading helper
  const setActionLoading = useCallback((action: string, loading: boolean) => {
    setIsLoading(prev => ({ ...prev, [action]: loading }));
  }, []);

  // Analytics helper
  const trackAnalytics = useCallback((event: string, data: Record<string, unknown> = {}) => {
    onAnalyticsEvent?.(event, {
      replyId,
      userId,
      timestamp: new Date().toISOString(),
      ...data
    });
  }, [onAnalyticsEvent, replyId, userId]);

  // Action handlers
  const handleLike = useCallback(async () => {
    if (!permissions.canLike || isLoading.like) return;

    const newIsLiked = !localStats.isLiked;
    setActionLoading('like', true);
    
    try {
      await onLike?.(replyId, newIsLiked);
      
      setLocalStats(prev => ({
        ...prev,
        isLiked: newIsLiked,
        isDisliked: newIsLiked ? false : prev.isDisliked,
        likes: prev.likes + (newIsLiked ? 1 : -1),
        dislikes: newIsLiked && prev.isDisliked ? prev.dislikes - 1 : prev.dislikes
      }));

      trackAnalytics('reply_like', { isLiked: newIsLiked });
      
      toast({
        title: newIsLiked ? 'Reply liked!' : 'Like removed',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to like reply:', error);
      toast({
        title: 'Failed to like reply',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setActionLoading('like', false);
    }
  }, [permissions.canLike, isLoading.like, localStats, onLike, replyId, trackAnalytics, toast, setActionLoading]);

  const handleDislike = useCallback(async () => {
    if (!permissions.canDislike || isLoading.dislike) return;

    const newIsDisliked = !localStats.isDisliked;
    setActionLoading('dislike', true);
    
    try {
      await onDislike?.(replyId, newIsDisliked);
      
      setLocalStats(prev => ({
        ...prev,
        isDisliked: newIsDisliked,
        isLiked: newIsDisliked ? false : prev.isLiked,
        dislikes: prev.dislikes + (newIsDisliked ? 1 : -1),
        likes: newIsDisliked && prev.isLiked ? prev.likes - 1 : prev.likes
      }));

      trackAnalytics('reply_dislike', { isDisliked: newIsDisliked });
      
      toast({
        title: newIsDisliked ? 'Reply disliked' : 'Dislike removed',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to dislike reply:', error);
      toast({
        title: 'Failed to dislike reply',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setActionLoading('dislike', false);
    }
  }, [permissions.canDislike, isLoading.dislike, localStats, onDislike, replyId, trackAnalytics, toast, setActionLoading]);

  const handleBookmark = useCallback(async () => {
    if (!permissions.canBookmark || isLoading.bookmark) return;

    const newIsBookmarked = !localStats.isBookmarked;
    setActionLoading('bookmark', true);
    
    try {
      await onBookmark?.(replyId, newIsBookmarked);
      
      setLocalStats(prev => ({
        ...prev,
        isBookmarked: newIsBookmarked,
        bookmarks: prev.bookmarks + (newIsBookmarked ? 1 : -1)
      }));

      trackAnalytics('reply_bookmark', { isBookmarked: newIsBookmarked });
      
      toast({
        title: newIsBookmarked ? 'Reply bookmarked!' : 'Bookmark removed',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to bookmark reply:', error);
      toast({
        title: 'Failed to bookmark reply',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setActionLoading('bookmark', false);
    }
  }, [permissions.canBookmark, isLoading.bookmark, localStats, onBookmark, replyId, trackAnalytics, toast, setActionLoading]);

  const handleShare = useCallback(async (platform?: string) => {
    if (isLoading.share) return;

    setActionLoading('share', true);
    
    try {
      await onShare?.(replyId, platform);
      
      setLocalStats(prev => ({
        ...prev,
        shares: prev.shares + 1
      }));

      trackAnalytics('reply_share', { platform });
      
      toast({
        title: 'Reply shared!',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to share reply:', error);
      toast({
        title: 'Failed to share reply',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setActionLoading('share', false);
    }
  }, [isLoading.share, onShare, replyId, trackAnalytics, toast, setActionLoading]);

  const handlePin = useCallback(async () => {
    if (!permissions.canPin || isLoading.pin) return;

    const newIsPinned = !metadata.isPinned;
    setActionLoading('pin', true);
    
    try {
      await onPin?.(replyId, newIsPinned);
      
      trackAnalytics('reply_pin', { isPinned: newIsPinned });
      
      toast({
        title: newIsPinned ? 'Reply pinned!' : 'Reply unpinned',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to pin reply:', error);
      toast({
        title: 'Failed to pin reply',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setActionLoading('pin', false);
    }
  }, [permissions.canPin, isLoading.pin, metadata.isPinned, onPin, replyId, trackAnalytics, toast, setActionLoading]);

  const handleHelpful = useCallback(async (isHelpful: boolean) => {
    if (isLoading.helpful) return;

    setActionLoading('helpful', true);
    
    try {
      await onHelpful?.(replyId, isHelpful);
      
      setLocalStats(prev => ({
        ...prev,
        helpfulVotes: isHelpful ? prev.helpfulVotes + 1 : prev.helpfulVotes,
        unhelpfulVotes: !isHelpful ? prev.unhelpfulVotes + 1 : prev.unhelpfulVotes
      }));

      trackAnalytics('reply_helpful', { isHelpful });
      
      toast({
        title: isHelpful ? 'Marked as helpful!' : 'Marked as not helpful',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to mark reply as helpful:', error);
      toast({
        title: 'Failed to mark reply',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setActionLoading('helpful', false);
    }
  }, [isLoading.helpful, onHelpful, replyId, trackAnalytics, toast, setActionLoading]);

  // Format numbers
  const formatCount = useCallback((count: number): string => {
    if (count === 0) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  }, []);

  // Render action button
  const renderActionButton = useCallback((
    action: string,
    icon: React.ReactNode,
    activeIcon: React.ReactNode,
    count?: number,
    isActive?: boolean,
    onClick?: () => void,
    disabled?: boolean,
    tooltip?: string
  ) => {
    const isLoadingAction = isLoading[action];
    const showCount = !compact && count !== undefined && count > 0;
    
    const button = (
      <Button
        variant="ghost"
        size={size}
        onClick={onClick}
        disabled={disabled || isLoadingAction}
        className={cn(
          BUTTON_SIZES[size],
          'gap-1 transition-colors',
          isActive && 'text-blue-600 bg-blue-50 hover:bg-blue-100',
          !isActive && 'text-gray-500 hover:text-gray-700',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className={cn(ICON_SIZES[size], isLoadingAction && 'animate-spin')}>
          {isLoadingAction ? (
            <div className={cn(ICON_SIZES[size], 'border-2 border-current border-t-transparent rounded-full animate-spin')} />
          ) : (
            isActive ? activeIcon : icon
          )}
        </span>
        {showCount && (
          <span className="font-medium">
            {formatCount(count)}
          </span>
        )}
      </Button>
    );

    return tooltip ? (
      <Tooltip content={tooltip}>
        {button}
      </Tooltip>
    ) : button;
  }, [compact, isLoading, formatCount, size]);

  // Render primary actions
  const renderPrimaryActions = useCallback(() => {
    if (!showActions) return null;

    return (
      <div className={cn(
        'flex items-center gap-1',
        orientation === 'vertical' && 'flex-col'
      )}>
        {/* Like */}
        {permissions.canLike && renderActionButton(
          'like',
          <HandThumbUpIcon />,
          <HandThumbUpSolidIcon />,
          localStats.likes,
          localStats.isLiked,
          handleLike,
          false,
          localStats.isLiked ? 'Remove like' : 'Like this reply'
        )}

        {/* Dislike */}
        {permissions.canDislike && renderActionButton(
          'dislike',
          <HandThumbDownIcon />,
          <HandThumbDownSolidIcon />,
          localStats.dislikes,
          localStats.isDisliked,
          handleDislike,
          false,
          localStats.isDisliked ? 'Remove dislike' : 'Dislike this reply'
        )}

        {/* Bookmark */}
        {permissions.canBookmark && renderActionButton(
          'bookmark',
          <BookmarkIcon />,
          <BookmarkSolidIcon />,
          localStats.bookmarks,
          localStats.isBookmarked,
          handleBookmark,
          false,
          localStats.isBookmarked ? 'Remove bookmark' : 'Bookmark this reply'
        )}

        {/* Share */}
        {permissions.canShare && renderActionButton(
          'share',
          <ShareIcon />,
          <ShareIcon />,
          localStats.shares,
          false,
          () => handleShare(),
          false,
          'Share this reply'
        )}

        {/* Reply */}
        {permissions.canReplyToReply && renderActionButton(
          'reply',
          <ArrowUturnLeftIcon />,
          <ArrowUturnLeftIcon />,
          localStats.replies,
          false,
          () => setShowReplyDialog(true),
          false,
          'Reply to this reply'
        )}

        {/* Helpful */}
        {!isOwner && !compact && (
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size={size}
              onClick={() => handleHelpful(true)}
              disabled={isLoading.helpful}
              className={cn(BUTTON_SIZES[size], 'gap-1 text-green-600 hover:text-green-700')}
            >
              👍 {localStats.helpfulVotes > 0 && formatCount(localStats.helpfulVotes)}
            </Button>
            <Button
              variant="ghost"
              size={size}
              onClick={() => handleHelpful(false)}
              disabled={isLoading.helpful}
              className={cn(BUTTON_SIZES[size], 'gap-1 text-red-600 hover:text-red-700')}
            >
              👎 {localStats.unhelpfulVotes > 0 && formatCount(localStats.unhelpfulVotes)}
            </Button>
          </div>
        )}
      </div>
    );
  }, [
    showActions, orientation, permissions, renderActionButton, localStats, 
    handleLike, handleDislike, handleBookmark, handleShare, handleHelpful, 
    isOwner, compact, isLoading, size, formatCount
  ]);

  // Render advanced actions menu
  const renderAdvancedActions = useCallback(() => {
    if (!showAdvancedActions) return null;

    const hasAdvancedActions = 
      permissions.canEdit || 
      permissions.canDelete || 
      permissions.canReport || 
      permissions.canPin || 
      permissions.canHighlight || 
      permissions.canModerate ||
      permissions.canViewHistory;

    if (!hasAdvancedActions) return null;

    const dropdownItems = [];

    // Owner actions
    if (permissions.canEdit) {
      dropdownItems.push({
        key: 'edit',
        label: 'Edit reply',
        onClick: () => setShowEditDialog(true)
      });
    }
    
    if (permissions.canDelete) {
      dropdownItems.push({
        key: 'delete',
        label: 'Delete reply',
        onClick: () => setShowDeleteDialog(true)
      });
    }

    // User actions
    if (permissions.canReport) {
      dropdownItems.push({
        key: 'report',
        label: 'Report reply',
        onClick: () => setShowReportDialog(true)
      });
    }

    if (permissions.canViewHistory) {
      dropdownItems.push({
        key: 'history',
        label: 'View edit history',
        onClick: () => onViewHistory?.(replyId)
      });
    }

    // Moderator actions
    if (permissions.canPin) {
      dropdownItems.push({
        key: 'pin',
        label: metadata.isPinned ? 'Unpin reply' : 'Pin reply',
        disabled: isLoading.pin,
        onClick: handlePin
      });
    }

    if (permissions.canHighlight) {
      dropdownItems.push({
        key: 'highlight',
        label: metadata.isHighlighted ? 'Remove highlight' : 'Highlight reply',
        onClick: () => onHighlight?.(replyId, !metadata.isHighlighted)
      });
    }

    if (permissions.canModerate) {
      dropdownItems.push({
        key: 'moderate',
        label: 'Moderate reply',
        onClick: () => onModerate?.(replyId, 'review')
      });
    }

    return (
      <DropdownMenu
        trigger={
          <Button variant="ghost" size={size} className={BUTTON_SIZES[size]}>
            <EllipsisHorizontalIcon className={ICON_SIZES[size]} />
          </Button>
        }
        items={dropdownItems}
        align="end"
      />
    );
  }, [
    showAdvancedActions, permissions, metadata, replyId, isLoading.pin,
    handlePin, onViewHistory, onHighlight, onModerate, size
  ]);

  // Render stats
  const renderStats = useCallback(() => {
    if (!showStats || compact) return null;

    const statsToShow = [
      { label: 'Views', value: localStats.views, show: localStats.views > 0 },
      { label: 'Helpful', value: localStats.helpfulVotes, show: localStats.helpfulVotes > 0 },
      { label: 'Shares', value: localStats.shares, show: localStats.shares > 0 }
    ].filter(stat => stat.show);

    if (statsToShow.length === 0) return null;

    return (
      <div className="flex items-center gap-4 text-xs text-gray-500">
        {statsToShow.map(stat => (
          <span key={stat.label}>
            {formatCount(stat.value)} {stat.label.toLowerCase()}
          </span>
        ))}
      </div>
    );
  }, [showStats, compact, localStats, formatCount]);

  // Render badges
  const renderBadges = useCallback(() => {
    const badges = [];

    if (metadata.isPinned) {
      badges.push(
        <Badge key="pinned" variant="secondary" className="text-xs">
          📌 Pinned
        </Badge>
      );
    }

    if (metadata.isHighlighted) {
      badges.push(
        <Badge key="highlighted" variant="secondary" className="text-xs">
          ⭐ Highlighted
        </Badge>
      );
    }

    if (metadata.isEdited) {
      badges.push(
        <Badge key="edited" variant="outline" className="text-xs">
          ✏️ Edited
        </Badge>
      );
    }

    if (localStats.isTrending) {
      badges.push(
        <Badge key="trending" variant="secondary" className="text-xs">
          🔥 Trending
        </Badge>
      );
    }

    return badges.length > 0 ? (
      <div className="flex items-center gap-2">
        {badges}
      </div>
    ) : null;
  }, [metadata, localStats.isTrending]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'space-y-2',
        compact && 'space-y-1',
        variant === 'minimal' && 'opacity-75',
        variant === 'detailed' && 'bg-gray-50 p-3 rounded',
        variant === 'inline' && 'inline-flex items-center gap-2',
        className
      )}
    >
      {/* Badges */}
      {renderBadges()}

      {/* Main Actions */}
      <div className={cn(
        'flex items-center justify-between',
        orientation === 'vertical' && 'flex-col items-stretch gap-2',
        compact && 'gap-1'
      )}>
        <div className="flex items-center gap-2">
          {renderPrimaryActions()}
          {renderAdvancedActions()}
        </div>

        {/* Stats */}
        {orientation === 'horizontal' && renderStats()}
      </div>

      {/* Stats for vertical layout */}
      {orientation === 'vertical' && renderStats()}

      {/* Dialogs */}
      <AnimatePresence>
        {showEditDialog && (
          <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Reply</DialogTitle>
              </DialogHeader>
              <ReplyEdit
                replyId={replyId}
                currentContent={metadata.content}
                onSave={async (newContent) => {
                  await onEdit?.(replyId, newContent);
                  setShowEditDialog(false);
                  trackAnalytics('reply_edit', { contentLength: newContent.length });
                }}
                onCancel={() => setShowEditDialog(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {showDeleteDialog && (
          <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Reply</DialogTitle>
              </DialogHeader>
              <ReplyDelete
                replyId={replyId}
                replyContent={metadata.content}
                replyAuthor={user.displayName}
                isOwner={isOwner}
                isAdmin={isAdmin}
                isModerator={isModerator}
                onConfirm={async (reason) => {
                  await onDelete?.(replyId, reason);
                  setShowDeleteDialog(false);
                  trackAnalytics('reply_delete', { reason });
                }}
                onCancel={() => setShowDeleteDialog(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {showReplyDialog && (
          <Dialog open={showReplyDialog} onClose={() => setShowReplyDialog(false)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reply to {user.displayName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-4">
                <p className="text-sm text-gray-600">Replying to:</p>
                <div className="bg-gray-50 p-3 rounded border-l-4 border-gray-300">
                  <p className="text-sm">{metadata.content}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowReplyDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      await onReply?.(replyId, 'Reply content placeholder');
                      setShowReplyDialog(false);
                    }}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {showReportDialog && (
          <Dialog open={showReportDialog} onClose={() => setShowReportDialog(false)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Reply</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-4">
                <p className="text-sm text-gray-600">
                  Report this reply by{' '}
                  <button
                    className="text-blue-600 hover:text-blue-800 underline"
                    onClick={() => onViewProfile?.(userId)}
                  >
                    {user.displayName}
                  </button>:
                </p>
                <div className="bg-gray-50 p-3 rounded border-l-4 border-gray-300">
                  <p className="text-sm">{metadata.content}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowReportDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await onReport?.(replyId, 'inappropriate', 'User reported content');
                      setShowReportDialog(false);
                    }}
                  >
                    Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReplyActionFooter;