'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  Award,
  Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import LikeDislike from './LikeDislike';
import ReplyButton from './ReplyButton';
import ShareButton from './ShareButton';
import MoreActions from './MoreActions';
import ReviewStats from './ReviewStats';
import EditReview from './edit';
import DeleteReview from './delete';
import { cn } from '@/lib/utils';

// Types
export interface ReviewStats {
  views: number;
  shares: number;
  replies: number;
  helpfulVotes: number;
  totalVotes: number;
  trending?: boolean;
  featured?: boolean;
}

export interface ReviewUser {
  id: string;
  name: string;
  avatar?: string;
  isVerified?: boolean;
  level?: string;
  badges?: string[];
}

export interface ReviewMetadata {
  id: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
  moderationStatus?: 'approved' | 'pending' | 'flagged' | 'hidden';
  moderatorNote?: string;
}

export interface ReviewActionFooterProps {
  reviewId: string;
  userId: string;
  user: ReviewUser;
  isOwner: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  stats: ReviewStats;
  metadata: ReviewMetadata;
  className?: string;
  showStats?: boolean;
  showActions?: boolean;
  showReplyButton?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  showShareButton?: boolean;
  showReportButton?: boolean;
  showMoreActions?: boolean;
  compact?: boolean;
  orientation?: 'horizontal' | 'vertical';
  
  // Interaction handlers
  onLike?: (reviewId: string, isLiked: boolean) => void;
  onDislike?: (reviewId: string, isDisliked: boolean) => void;
  onReply?: (reviewId: string) => void;
  onShare?: (reviewId: string, platform?: string) => void;
  onReport?: (reviewId: string, reason: string) => void;
  onPin?: (reviewId: string) => void;
  onModerate?: (reviewId: string, action: string) => void;
  
  // Edit/Delete handlers
  onEditStart?: (reviewId: string) => void;
  onEditSuccess?: (reviewId: string, updatedReview: { id: string; [key: string]: unknown }) => void;
  onEditError?: (reviewId: string, error: Error) => void;
  onDeleteStart?: (reviewId: string) => void;
  onDeleteSuccess?: (reviewId: string) => void;
  onDeleteError?: (reviewId: string, error: Error) => void;
  
  // Configuration
  allowAnonymousActions?: boolean;
  requireLoginForActions?: boolean;
  moderationFeatures?: {
    allowPin?: boolean;
    allowModerate?: boolean;
  };
  
  // Customization
  customActions?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick: (reviewId: string) => void;
    show?: boolean;
    permission?: 'owner' | 'admin' | 'moderator' | 'all';
  }>;
}

const ReviewActionFooter: React.FC<ReviewActionFooterProps> = ({
  reviewId,
  userId,
  user,
  isOwner,
  isAdmin = false,
  isModerator = false,
  stats,
  metadata,
  className,
  showStats = true,
  showActions = true,
  showReplyButton = true,
  showEditButton = true,
  showDeleteButton = true,
  showShareButton = true,
  showReportButton = true,
  showMoreActions = true,
  compact = false,
  orientation = 'horizontal',
  onLike,
  onDislike,
  onReply,
  onShare,
  onReport,
  onPin,
  onModerate,
  onEditStart,
  onEditSuccess,
  onEditError,
  onDeleteStart,
  onDeleteSuccess,
  onDeleteError,
  allowAnonymousActions = false,
  requireLoginForActions = true,
  moderationFeatures = {
    allowPin: true,
    allowModerate: true
  },
  customActions = []
}) => {
  // Permission checks
  const canPerformAction = (action: string): boolean => {
    if (!userId && requireLoginForActions) return false;
    if (!userId && !allowAnonymousActions) return false;
    
    switch (action) {
      case 'edit':
      case 'delete':
        return isOwner || isAdmin || isModerator;
      case 'pin':
      case 'moderate':
        return isAdmin || isModerator;
      default:
        return true;
    }
  };

  // Share functionality
  const handleShare = async (platform?: string) => {
    const url = `${window.location.origin}/reviews/${reviewId}`;
    const text = `Check out this review by ${user.name}`;

    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          // Toast notification would go here
        } catch (error) {
          console.error('Failed to copy to clipboard:', error);
        }
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
        break;
      default:
        if (navigator.share) {
          try {
            await navigator.share({ title: text, url });
          } catch (error) {
            console.error('Failed to share:', error);
          }
        }
    }

    onShare?.(reviewId, platform);
  };

  // Report functionality
  const handleReport = (reason: string) => {
    onReport?.(reviewId, reason);
    // The parent component should handle the actual reporting logic
  };

  // Filter custom actions based on permissions
  const filteredCustomActions = customActions.filter(action => {
    if (!action.show) return false;
    
    switch (action.permission) {
      case 'owner':
        return isOwner;
      case 'admin':
        return isAdmin;
      case 'moderator':
        return isModerator || isAdmin;
      case 'all':
      default:
        return true;
    }
  });

  // Main action buttons
  const renderMainActions = () => (
    <div className={cn(
      "flex items-center gap-2",
      orientation === 'vertical' && "flex-col items-stretch"
    )}>
      {/* Like/Dislike */}
      {showActions && (
        <LikeDislike
          reviewId={reviewId}
          userId={userId}
          onLike={onLike}
          onDislike={onDislike}
          disabled={!canPerformAction('vote')}
          size={compact ? 'sm' : 'md'}
          showCount={!compact}
          variant="default"
          showTooltip={true}
          apiEndpoint="/api/reviews/vote"
        />
      )}

      {/* Reply Button */}
      {showReplyButton && showActions && (
        <ReplyButton
          reviewId={reviewId}
          userId={userId}
          onReply={onReply}
          disabled={!canPerformAction('reply')}
          size={compact ? 'sm' : 'md'}
          showText={!compact}
          variant="ghost"
          requireLogin={requireLoginForActions}
          allowAnonymous={allowAnonymousActions}
          maxLength={1000}
          placeholder="Write your reply..."
          autoFocus={true}
          modalTitle="Reply to Review"
          onReplySuccess={(reviewId, reply) => {
            console.log(`Reply successful for review ${reviewId}:`, reply);
          }}
        />
      )}

      {/* Share Button */}
      {showShareButton && showActions && (
        <ShareButton
          reviewId={reviewId}
          url={`${window.location.origin}/reviews/${reviewId}`}
          title={`Review by ${user.name}`}
          description="Check out this review"
          hashtags={['review', 'vardhmanmills']}
          size={compact ? 'sm' : 'md'}
          variant="ghost"
          showText={!compact}
          disabled={!canPerformAction('share')}
          enableNativeShare={true}
          enableQRCode={true}
          enableShortUrl={true}
          showSocialIcons={true}
          onShare={(platform, data) => {
            onShare?.(reviewId, platform);
            console.log(`Shared on ${platform}:`, data);
          }}
        />
      )}

      {/* Edit Button */}
      {showEditButton && canPerformAction('edit') && (
        <EditReview
          review={{
            id: reviewId,
            rating: 5, // This should come from props
            title: '', // This should come from props
            content: '', // This should come from props
            tags: [], // This should come from props
            images: [], // This should come from props
            isAnonymous: false, // This should come from props
            isPublic: true // This should come from props
          }}
          userId={userId}
          isOwner={isOwner}
          isAdmin={isAdmin}
          isModerator={isModerator}
          size={compact ? 'sm' : 'md'}
          showIcon={true}
          showText={!compact}
          onEditStart={onEditStart}
          onEditSuccess={(reviewId, updatedReview) => {
            onEditSuccess?.(reviewId, updatedReview as unknown as { id: string; [key: string]: unknown });
          }}
          onEditError={onEditError}
        />
      )}

      {/* Delete Button */}
      {showDeleteButton && canPerformAction('delete') && (
        <DeleteReview
          reviewId={reviewId}
          userId={userId}
          isOwner={isOwner}
          isAdmin={isAdmin}
          isModerator={isModerator}
          size={compact ? 'sm' : 'md'}
          showIcon={true}
          showText={!compact}
          onDeleteStart={onDeleteStart}
          onDeleteSuccess={onDeleteSuccess}
          onDeleteError={onDeleteError}
        />
      )}
    </div>
  );

  // Secondary actions (more menu)
  const renderSecondaryActions = () => {
    const hasSecondaryActions = 
      showReportButton || 
      filteredCustomActions.length > 0 || 
      (isAdmin || isModerator) && moderationFeatures;

    if (!hasSecondaryActions || !showMoreActions) return null;

    return (
      <MoreActions
        reviewId={reviewId}
        userId={userId}
        authorId={user.id}
        isBookmarked={false}
        isPinned={metadata.isPinned}
        isArchived={false}
        isHidden={metadata.moderationStatus === 'hidden'}
        isModerator={isModerator}
        isAdmin={isAdmin}
        isOwner={isOwner}
        size={compact ? 'sm' : 'md'}
        variant="ghost"
        showLabels={true}
        showBadges={true}
        enableAnimations={true}
        closeOnAction={true}
        position="bottom-right"
        customActions={filteredCustomActions.map(action => ({
          id: action.id,
          label: action.label,
          icon: action.icon,
          onClick: () => action.onClick(reviewId)
        }))}
        onBookmark={async (reviewId, bookmarked) => {
          console.log(`Bookmark ${bookmarked ? 'added' : 'removed'} for review ${reviewId}`);
          return true;
        }}
        onPin={async (reviewId) => {
          onPin?.(reviewId);
          return true;
        }}
        onArchive={async (reviewId, archived) => {
          console.log(`Review ${reviewId} ${archived ? 'archived' : 'restored'}`);
          return true;
        }}
        onHide={async (reviewId, hidden) => {
          onModerate?.(reviewId, hidden ? 'hide' : 'unhide');
          return true;
        }}
        onReport={() => {
          handleReport('inappropriate');
        }}
        onBlock={(reviewId, userId) => {
          console.log(`User ${userId} blocked for review ${reviewId}`);
        }}
        onEdit={(reviewId) => {
          onEditStart?.(reviewId);
        }}
        onDelete={(reviewId) => {
          onDeleteStart?.(reviewId);
        }}
        onModerate={(reviewId) => {
          onModerate?.(reviewId, 'moderate');
        }}
        onViewHistory={(reviewId) => {
          console.log(`View history for review ${reviewId}`);
        }}
        onCopyLink={() => {
          handleShare('copy');
        }}
        onDownload={(reviewId) => {
          console.log(`Download review ${reviewId}`);
        }}
      />
    );
  };

  // Stats display
  const renderStats = () => {
    if (!showStats) return null;

    const statsData = {
      views: stats.views,
      likes: 0, // This should come from LikeDislike component state
      dislikes: 0, // This should come from LikeDislike component state
      replies: stats.replies,
      shares: stats.shares,
      bookmarks: 0, // This should come from props
      downloads: 0, // This should come from props
      rating: 4.5, // This should come from props
      maxRating: 5,
      helpfulVotes: stats.helpfulVotes,
      totalVotes: stats.totalVotes,
      viewDuration: 120, // This should come from analytics
      engagementRate: 75, // This should be calculated
      createdAt: metadata.createdAt,
      lastActivity: metadata.updatedAt || metadata.createdAt,
      trending: stats.trending,
      featured: stats.featured,
      verified: user.isVerified
    };

    return (
      <ReviewStats
        reviewId={reviewId}
        stats={statsData}
        layout={orientation === 'vertical' ? 'vertical' : 'horizontal'}
        size={compact ? 'sm' : 'md'}
        variant={compact ? 'minimal' : 'default'}
        showIcons={true}
        showLabels={!compact}
        showTooltips={true}
        showTrending={true}
        showBadges={true}
        interactive={true}
        enableAnimation={true}
        enableHover={true}
        visibleStats={compact 
          ? ['views', 'likes', 'replies'] 
          : ['views', 'likes', 'replies', 'shares', 'rating']
        }
        abbreviateNumbers={true}
        showPercentages={false}
        showComparisons={false}
        enableRealTime={false}
        onStatClick={(statType, value) => {
          console.log(`Clicked ${statType} with value ${value}`);
        }}
        onTrendingClick={() => {
          console.log('Trending clicked');
        }}
      />
    );
  };

  // Status badges
  const renderStatusBadges = () => {
    const badges = [];

    if (stats.trending) {
      badges.push(
        <Badge key="trending" variant="default" className="text-xs">
          <TrendingUp className="w-3 h-3 mr-1" />
          Trending
        </Badge>
      );
    }

    if (stats.featured) {
      badges.push(
        <Badge key="featured" variant="default" className="text-xs">
          <Award className="w-3 h-3 mr-1" />
          Featured
        </Badge>
      );
    }

    if (metadata.isPinned) {
      badges.push(
        <Badge key="pinned" variant="secondary" className="text-xs">
          Pinned
        </Badge>
      );
    }

    if (metadata.isLocked) {
      badges.push(
        <Badge key="locked" variant="outline" className="text-xs">
          <Shield className="w-3 h-3 mr-1" />
          Locked
        </Badge>
      );
    }

    if (badges.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {badges}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "space-y-3",
        compact && "space-y-2",
        className
      )}
    >
      {/* Status Badges */}
      {renderStatusBadges()}

      {/* Main Content */}
      <div className={cn(
        "flex items-center justify-between",
        orientation === 'vertical' && "flex-col items-stretch gap-3",
        compact && "gap-2"
      )}>
        {/* Actions */}
        <div className="flex items-center gap-2">
          {renderMainActions()}
          {renderSecondaryActions()}
        </div>

        {/* Stats */}
        {orientation === 'horizontal' && renderStats()}
      </div>

      {/* Stats for vertical layout */}
      {orientation === 'vertical' && renderStats()}

      {/* Helpful votes summary */}
      {stats.totalVotes > 0 && (
        <div className="text-xs text-gray-600">
          {stats.helpfulVotes} of {stats.totalVotes} found this helpful
        </div>
      )}
    </motion.div>
  );
};

// Export all components
export {
  LikeDislike,
  ReplyButton,
  ShareButton,
  MoreActions,
  ReviewStats,
  EditReview,
  DeleteReview
};

export default ReviewActionFooter;
