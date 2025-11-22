'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  EyeIcon,
  EyeSlashIcon,
  ShareIcon,
  BookmarkIcon,
  ChatBubbleOvalLeftIcon,
  PhotoIcon,
  HandThumbUpIcon,
  HandThumbDownIcon
} from '@heroicons/react/24/outline';
import { 
  BookmarkIcon as BookmarkSolidIcon,
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';

import { cn } from '@/lib/utils';
import { ProductReview } from '@/types/review.types';

// Import components
import ReviewHeader from './ReviewHeader';
import ReviewBody from './ReviewBody';
import ReviewActionFooter from './ReviewActionFooter';

export type ReviewItemVariant = 
  | 'default' 
  | 'compact' 
  | 'detailed' 
  | 'card' 
  | 'minimal' 
  | 'list' 
  | 'grid' 
  | 'feed'
  | 'modal';

export type ReviewItemLayout = 
  | 'vertical' 
  | 'horizontal' 
  | 'stacked' 
  | 'inline' 
  | 'responsive';

export interface ReviewItemActions {
  onLike?: (reviewId: string, isLiked: boolean) => void;
  onDislike?: (reviewId: string, isDisliked: boolean) => void;
  onShare?: (reviewId: string) => void;
  onBookmark?: (reviewId: string, isBookmarked: boolean) => void;
  onReport?: (reviewId: string, reason: string) => void;
  onComment?: (reviewId: string) => void;
  onViewMedia?: (reviewId: string, mediaItems: unknown[]) => void;
  onUserClick?: (userId: string) => void;
  onFollow?: (userId: string, isFollowing: boolean) => void;
  onMessage?: (userId: string) => void;
  onHide?: (reviewId: string) => void;
  onPin?: (reviewId: string, isPinned: boolean) => void;
}

export interface ReviewItemProps {
  review: ProductReview;
  variant?: ReviewItemVariant;
  layout?: ReviewItemLayout;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showHeader?: boolean;
  showBody?: boolean;
  showActions?: boolean;
  showStats?: boolean;
  showMedia?: boolean;
  collapsible?: boolean;
  expandable?: boolean;
  interactive?: boolean;
  highlightNew?: boolean;
  showPinned?: boolean;
  className?: string;
  
  // Header configuration
  headerVariant?: 'default' | 'compact' | 'detailed' | 'card' | 'minimal' | 'mobile' | 'desktop' | 'list';
  headerLayout?: 'horizontal' | 'vertical' | 'stacked' | 'inline' | 'grid' | 'flex' | 'responsive';
  
  // Body configuration
  bodyVariant?: 'default' | 'compact' | 'detailed' | 'card' | 'minimal';
  
  // Display options
  maxHeight?: number;
  truncateLength?: number;
  showFullContent?: boolean;
  showReadMore?: boolean;
  animateOnMount?: boolean;
  colorScheme?: 'default' | 'minimal' | 'vibrant' | 'professional' | 'muted';
  
  // State
  isExpanded?: boolean;
  isBookmarked?: boolean;
  isLiked?: boolean;
  isDisliked?: boolean;
  isHidden?: boolean;
  isPinned?: boolean;
  
  // Event handlers
  actions?: ReviewItemActions;
  onExpandToggle?: (expanded: boolean) => void;
  onVisibilityChange?: (visible: boolean) => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  variant = 'default',
  size = 'md',
  showHeader = true,
  showBody = true,
  showActions = true,
  showStats = true,
  showMedia = true,
  interactive = true,
  highlightNew = false,
  showPinned = true,
  className,
  
  // Configuration
  headerVariant = 'default',
  headerLayout = 'responsive',
  
  // Display options
  maxHeight,
  animateOnMount = true,
  colorScheme = 'default',
  
  // State
  isBookmarked: controlledBookmarked = false,
  isLiked: controlledLiked = false,
  isDisliked: controlledDisliked = false,
  isHidden: controlledHidden = false,
  isPinned: controlledPinned = false,
  
  // Event handlers
  actions,
  onVisibilityChange
}) => {
  // Internal state
  const [internalBookmarked, setInternalBookmarked] = useState(controlledBookmarked);
  const [internalLiked, setInternalLiked] = useState(controlledLiked);
  const [internalDisliked, setInternalDisliked] = useState(controlledDisliked);
  const [internalHidden, setInternalHidden] = useState(controlledHidden);
  const [isVisible, setIsVisible] = useState(!controlledHidden);
  
  const { toast } = useToast();
  
  // Use controlled or internal state
  const isBookmarked = controlledBookmarked !== undefined ? controlledBookmarked : internalBookmarked;
  const isLiked = controlledLiked !== undefined ? controlledLiked : internalLiked;
  const isDisliked = controlledDisliked !== undefined ? controlledDisliked : internalDisliked;
  const isHidden = controlledHidden !== undefined ? controlledHidden : internalHidden;

  // Variant configurations
  const variantConfigs = useMemo(() => ({
    default: {
      container: 'bg-white border border-gray-200 rounded-lg shadow-sm',
      spacing: 'p-4 space-y-4',
      animation: 'hover:shadow-md transition-shadow duration-200'
    },
    compact: {
      container: 'bg-white border border-gray-100 rounded-md',
      spacing: 'p-3 space-y-2',
      animation: 'hover:bg-gray-50 transition-colors duration-150'
    },
    detailed: {
      container: 'bg-white border border-gray-200 rounded-xl shadow-lg',
      spacing: 'p-6 space-y-6',
      animation: 'hover:shadow-xl transition-all duration-300'
    },
    card: {
      container: 'bg-white border border-gray-200 rounded-xl shadow-md',
      spacing: 'overflow-hidden',
      animation: 'hover:shadow-lg transition-shadow duration-200'
    },
    minimal: {
      container: 'bg-transparent border-b border-gray-100',
      spacing: 'py-3 space-y-3',
      animation: 'hover:bg-gray-50 transition-colors duration-150'
    },
    list: {
      container: 'bg-white border-b border-gray-100',
      spacing: 'p-3 space-y-2',
      animation: 'hover:bg-gray-50 transition-colors duration-150'
    },
    grid: {
      container: 'bg-white border border-gray-200 rounded-lg shadow-sm h-full',
      spacing: 'p-4 space-y-3 flex flex-col',
      animation: 'hover:shadow-md transition-shadow duration-200'
    },
    feed: {
      container: 'bg-white border border-gray-200 rounded-lg',
      spacing: 'overflow-hidden',
      animation: 'hover:shadow-sm transition-shadow duration-150'
    },
    modal: {
      container: 'bg-white rounded-lg',
      spacing: 'p-6 space-y-6 max-h-[80vh] overflow-auto',
      animation: ''
    }
  }), []);

  // Get current variant config
  const currentVariantConfig = variantConfigs[variant];



  // Handle like action
  const handleLike = useCallback(() => {
    const newLiked = !isLiked;
    if (controlledLiked === undefined) {
      setInternalLiked(newLiked);
      if (newLiked && isDisliked) {
        setInternalDisliked(false);
      }
    }
    actions?.onLike?.(review.id, newLiked);
    toast({
      title: newLiked ? 'Review liked!' : 'Like removed',
      duration: 2000
    });
  }, [isLiked, isDisliked, controlledLiked, actions, review.id, toast]);

  // Handle dislike action
  const handleDislike = useCallback(() => {
    const newDisliked = !isDisliked;
    if (controlledDisliked === undefined) {
      setInternalDisliked(newDisliked);
      if (newDisliked && isLiked) {
        setInternalLiked(false);
      }
    }
    actions?.onDislike?.(review.id, newDisliked);
    toast({
      title: newDisliked ? 'Review disliked' : 'Dislike removed',
      duration: 2000
    });
  }, [isDisliked, isLiked, controlledDisliked, actions, review.id, toast]);

  // Handle bookmark action
  const handleBookmark = useCallback(() => {
    const newBookmarked = !isBookmarked;
    if (controlledBookmarked === undefined) {
      setInternalBookmarked(newBookmarked);
    }
    actions?.onBookmark?.(review.id, newBookmarked);
    toast({
      title: newBookmarked ? 'Review bookmarked!' : 'Bookmark removed',
      duration: 2000
    });
  }, [isBookmarked, controlledBookmarked, actions, review.id, toast]);

  // Handle share action
  const handleShare = useCallback(() => {
    actions?.onShare?.(review.id);
    toast({
      title: 'Review shared!',
      duration: 2000
    });
  }, [actions, review.id, toast]);

  // Handle hide action
  const handleHide = useCallback(() => {
    const newHidden = !isHidden;
    if (controlledHidden === undefined) {
      setInternalHidden(newHidden);
    }
    setIsVisible(!newHidden);
    actions?.onHide?.(review.id);
    onVisibilityChange?.(!newHidden);
    toast({
      title: newHidden ? 'Review hidden' : 'Review shown',
      duration: 2000
    });
  }, [isHidden, controlledHidden, actions, review.id, onVisibilityChange, toast]);

  // Handle view media
  const handleViewMedia = useCallback(() => {
    const mediaItems = (review as ProductReview & { media?: unknown[] }).media || [];
    actions?.onViewMedia?.(review.id, mediaItems);
  }, [actions, review]);

  // Render action buttons
  const renderActionButtons = useCallback(() => {
    if (!showActions || !interactive) return null;

    const actionButtonsData = [
      {
        key: 'like',
        icon: isLiked ? HandThumbUpSolidIcon : HandThumbUpIcon,
        label: review.likes?.toString() || '0',
        active: isLiked,
        onClick: handleLike,
        className: isLiked ? 'text-blue-600' : 'text-gray-500'
      },
      {
        key: 'dislike',
        icon: isDisliked ? HandThumbDownSolidIcon : HandThumbDownIcon,
        label: review.dislikes?.toString() || '0',
        active: isDisliked,
        onClick: handleDislike,
        className: isDisliked ? 'text-red-600' : 'text-gray-500'
      },
      {
        key: 'comment',
        icon: ChatBubbleOvalLeftIcon,
        label: ((review as ProductReview & { commentsCount?: number }).commentsCount || 0).toString(),
        onClick: () => actions?.onComment?.(review.id),
        className: 'text-gray-500'
      },
      {
        key: 'share',
        icon: ShareIcon,
        onClick: handleShare,
        className: 'text-gray-500'
      },
      {
        key: 'bookmark',
        icon: isBookmarked ? BookmarkSolidIcon : BookmarkIcon,
        active: isBookmarked,
        onClick: handleBookmark,
        className: isBookmarked ? 'text-blue-600' : 'text-gray-500'
      }
    ];

    const mediaItems = (review as ProductReview & { media?: unknown[] }).media;
    if (showMedia && mediaItems && mediaItems.length > 0) {
      actionButtonsData.splice(-1, 0, {
        key: 'media',
        icon: PhotoIcon,
        label: mediaItems.length.toString(),
        onClick: handleViewMedia,
        className: 'text-gray-500'
      });
    }

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {actionButtonsData.map((action) => (
          <Button
            key={action.key}
            size="sm"
            variant="ghost"
            onClick={action.onClick}
            className={cn(
              "h-8 px-2 text-xs",
              action.className,
              action.active && "bg-blue-50"
            )}
          >
            <action.icon className="w-4 h-4" />
            {action.label && (
              <span className="ml-1">{action.label}</span>
            )}
          </Button>
        ))}
        
        {/* Hide/Show toggle */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleHide}
          className="h-8 px-2 text-xs text-gray-500"
        >
          {isHidden ? (
            <EyeIcon className="w-4 h-4" />
          ) : (
            <EyeSlashIcon className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }, [
    showActions,
    interactive,
    isLiked,
    isDisliked,
    isBookmarked,
    isHidden,
    review,
    handleLike,
    handleDislike,
    handleBookmark,
    handleShare,
    handleHide,
    handleViewMedia,
    showMedia,
    actions
  ]);

  // Render stats section
  const renderStats = useCallback(() => {
    if (!showStats) return null;

    const stats = [
      { label: 'Helpful', value: (review as ProductReview & { helpfulCount?: number }).helpfulCount || 0 },
      { label: 'Views', value: review.viewCount || 0 },
      { label: 'Shares', value: (review as ProductReview & { shareCount?: number }).shareCount || 0 }
    ].filter(stat => stat.value > 0);

    if (stats.length === 0) return null;

    return (
      <div className="flex items-center gap-4 text-xs text-gray-500">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-1">
            <span className="font-medium">{stat.value.toLocaleString()}</span>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    );
  }, [showStats, review]);

  // Render badges
  const renderBadges = useCallback(() => {
    const badges = [];

    if (highlightNew && (review as ProductReview & { isNew?: boolean }).isNew) {
      badges.push(
        <Badge key="new" variant="secondary" className="text-xs">
          New
        </Badge>
      );
    }

    if (showPinned && controlledPinned) {
      badges.push(
        <Badge key="pinned" variant="outline" className="text-xs">
          Pinned
        </Badge>
      );
    }

    if (review.isVerified) {
      badges.push(
        <Badge key="verified" variant="default" className="text-xs">
          Verified Purchase
        </Badge>
      );
    }

    if ((review as ProductReview & { featured?: boolean }).featured) {
      badges.push(
        <Badge key="featured" variant="destructive" className="text-xs">
          Featured
        </Badge>
      );
    }

    return badges.length > 0 ? (
      <div className="flex items-center gap-2 flex-wrap">
        {badges}
      </div>
    ) : null;
  }, [highlightNew, showPinned, controlledPinned, review]);

  // Animation variants
  const animationVariants = useMemo(() => ({
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      height: 0,
      marginBottom: 0
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      height: 'auto',
      marginBottom: 16
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      height: 0,
      marginBottom: 0
    }
  }), []);

  // Don't render if hidden and not showing
  if (isHidden && !isVisible) {
    return null;
  }

  // Card-specific layout
  if (variant === 'card') {
    return (
      <motion.div
        variants={animateOnMount ? animationVariants : undefined}
        initial={animateOnMount ? 'hidden' : false}
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3 }}
        className={cn(currentVariantConfig.container, currentVariantConfig.animation, className)}
      >
        <Card>
          {showHeader && (
            <CardHeader className="pb-3">
              <ReviewHeader
                review={review}
                variant={headerVariant}
                layout={headerLayout}
                size={size}
                interactive={interactive}
                colorScheme={colorScheme}
                onAvatarClick={actions?.onUserClick ? (userId) => actions.onUserClick!(userId) : undefined}
                onNameClick={actions?.onUserClick ? (userId) => actions.onUserClick!(userId) : undefined}
                onShare={handleShare}
                onBookmark={handleBookmark}
                onReport={() => actions?.onReport?.(review.id, 'inappropriate')}
                onFollow={() => actions?.onFollow?.(review.user.id, true)}
                onMessage={() => actions?.onMessage?.(review.user.id)}
              />
              {renderBadges()}
            </CardHeader>
          )}
          
          <CardContent className="pt-0">
            {showBody && (
              <ReviewBody
                content={{
                  id: review.id,
                  type: 'text' as const,
                  priority: 'high' as const,
                  text: {
                    id: review.id,
                    content: review.content,
                    wordCount: review.content.split(' ').length,
                    characterCount: review.content.length,
                    readingTime: Math.ceil(review.content.split(' ').length / 200),
                    language: 'en'
                  }
                }}
                maxHeight={maxHeight}
                showText={true}
                allowTextSelection={true}
                className={colorScheme === 'minimal' ? 'text-gray-700' : ''}
              />
            )}
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              {renderActionButtons()}
              {renderStats()}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Default layout
  return (
    <motion.div
      variants={animateOnMount ? animationVariants : undefined}
      initial={animateOnMount ? 'hidden' : false}
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
      className={cn(
        currentVariantConfig.container,
        currentVariantConfig.spacing,
        currentVariantConfig.animation,
        highlightNew && (review as ProductReview & { isNew?: boolean }).isNew && "ring-2 ring-blue-200 ring-opacity-50",
        className
      )}
    >
      {/* Header */}
      {showHeader && (
        <div className="space-y-2">
          <ReviewHeader
            review={review}
            variant={headerVariant}
            layout={headerLayout}
            size={size}
            interactive={interactive}
            colorScheme={colorScheme}
            onAvatarClick={actions?.onUserClick ? (userId) => actions.onUserClick!(userId) : undefined}
            onNameClick={actions?.onUserClick ? (userId) => actions.onUserClick!(userId) : undefined}
            onShare={handleShare}
            onBookmark={handleBookmark}
            onReport={() => actions?.onReport?.(review.id, 'inappropriate')}
            onFollow={() => actions?.onFollow?.(review.user.id, true)}
            onMessage={() => actions?.onMessage?.(review.user.id)}
          />
          {renderBadges()}
        </div>
      )}

      {/* Body */}
      {showBody && (
        <ReviewBody
          content={{
            id: review.id,
            type: 'text' as const,
            priority: 'high' as const,
            text: {
              id: review.id,
              content: review.content,
              wordCount: review.content.split(' ').length,
              characterCount: review.content.length,
              readingTime: Math.ceil(review.content.split(' ').length / 200),
              language: 'en'
            }
          }}
          maxHeight={maxHeight}
          showText={true}
          allowTextSelection={true}
          className={colorScheme === 'minimal' ? 'text-gray-700' : ''}
        />
      )}

      {/* Action Footer */}
      {showActions && (
        <ReviewActionFooter
          reviewId={review.id}
          userId={review.userId}
          user={{
            id: review.user.id,
            name: review.user.displayName,
            avatar: review.user.avatar?.url,
            isVerified: review.user.isVerified,
            level: 'member',
            badges: review.user.badges?.map(b => b.name) || []
          }}
          isOwner={false}
          stats={{
            views: review.viewCount || 0,
            shares: 0,
            replies: 0,
            helpfulVotes: review.helpfulVotes || 0,
            totalVotes: (review.helpfulVotes || 0) + (review.unhelpfulVotes || 0),
            trending: false,
            featured: false
          }}
          metadata={{
            id: review.id,
            createdAt: typeof review.createdAt === 'string' ? review.createdAt : review.createdAt.toISOString(),
            updatedAt: review.updatedAt ? (typeof review.updatedAt === 'string' ? review.updatedAt : review.updatedAt.toISOString()) : undefined,
            isEdited: false,
            isPinned: controlledPinned,
            isLocked: false,
            moderationStatus: 'approved'
          }}
          compact={size === 'xs' || size === 'sm'}
          showStats={showStats}
          onLike={actions?.onLike}
          onDislike={actions?.onDislike}
          onShare={actions?.onShare}
          onReport={actions?.onReport}
        />
      )}
    </motion.div>
  );
};

export default ReviewItem;