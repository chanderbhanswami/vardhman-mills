'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  EllipsisHorizontalIcon,
  ClockIcon,
  GlobeAltIcon,
  LinkIcon,
  FlagIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { DropdownMenu } from '@/components/ui/DropdownMenu';

import Avatar from './Avatar';
import Name from './Name';
import VerifiedBadge from './VerifiedBadge';
import Location from './Location';
import DateComponent from './Date';

import { cn } from '@/lib/utils';
import { ReviewUser } from '@/types/review.types';
import { Timestamp } from '@/types/common.types';

// Types
export interface ReplyHeaderProps {
  user: ReviewUser;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isEdited?: boolean;
  isAuthor?: boolean;
  isPinned?: boolean;
  isHighlighted?: boolean;
  isOp?: boolean; // Original poster
  replyCount?: number;
  viewCount?: number;
  showTimestamp?: boolean;
  showLocation?: boolean;
  showVerification?: boolean;
  showEditHistory?: boolean;
  showMoreMenu?: boolean;
  showViewCount?: boolean;
  showReplyCount?: boolean;
  showRelativeTime?: boolean;
  showUserHoverCard?: boolean;
  showUserActions?: boolean;
  compact?: boolean;
  minimal?: boolean;
  interactive?: boolean;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;

  // Event handlers
  onUserClick?: (user: ReviewUser) => void;
  onReport?: () => void;
  onBlock?: () => void;
  onShare?: () => void;
  onCopyLink?: () => void;
  onViewProfile?: () => void;
  onViewEditHistory?: () => void;

  // Analytics
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

const SIZE_CONFIGS = {
  xs: {
    avatar: 'xs' as const,
    text: 'text-xs',
    gap: 'gap-1.5',
    padding: 'p-1'
  },
  sm: {
    avatar: 'sm' as const,
    text: 'text-sm',
    gap: 'gap-2',
    padding: 'p-1.5'
  },
  md: {
    avatar: 'md' as const,
    text: 'text-sm',
    gap: 'gap-2',
    padding: 'p-2'
  },
  lg: {
    avatar: 'lg' as const,
    text: 'text-base',
    gap: 'gap-3',
    padding: 'p-2.5'
  }
} as const;

const ReplyHeader: React.FC<ReplyHeaderProps> = ({
  user,
  createdAt,
  updatedAt,
  isEdited = false,
  isAuthor = false,
  isPinned = false,
  isHighlighted = false,
  isOp = false,
  replyCount,
  viewCount,
  showTimestamp = true,
  showLocation = true,
  showVerification = true,
  showEditHistory = false,
  showMoreMenu = true,
  showViewCount = false,
  showReplyCount = false,
  showRelativeTime = true,
  showUserHoverCard = true,
  showUserActions = true,
  compact = false,
  minimal = false,
  interactive = true,
  variant = 'default',
  size = 'md',
  className,
  onUserClick,
  onReport,
  onBlock,
  onShare,
  onCopyLink,
  onViewProfile,
  onViewEditHistory,
  onAnalyticsEvent
}) => {
  // State
  const [showFullTimestamp, setShowFullTimestamp] = useState(false);

  // Get size configuration
  const sizeConfig = SIZE_CONFIGS[size];

  // Determine if compact layout should be used
  const isCompactLayout = useMemo(() => {
    return compact || minimal || variant === 'compact' || variant === 'minimal';
  }, [compact, minimal, variant]);

  // Handle user click
  const handleUserClick = useCallback(() => {
    if (onUserClick) {
      onUserClick(user);
      onAnalyticsEvent?.('reply_header_user_click', {
        userId: user.id,
        userDisplayName: user.displayName
      });
    }
  }, [onUserClick, user, onAnalyticsEvent]);

  // Handle timestamp click
  const handleTimestampClick = useCallback(() => {
    setShowFullTimestamp(!showFullTimestamp);
    onAnalyticsEvent?.('reply_header_timestamp_click', {
      userId: user.id,
      showFull: !showFullTimestamp
    });
  }, [showFullTimestamp, user.id, onAnalyticsEvent]);

  // Handle more menu actions
  const handleMenuAction = useCallback((action: string) => {
    const actionMap = {
      report: onReport,
      block: onBlock,
      share: onShare,
      copyLink: onCopyLink,
      viewProfile: onViewProfile,
      viewEditHistory: onViewEditHistory
    };

    const handler = actionMap[action as keyof typeof actionMap];
    if (handler) {
      handler();
      onAnalyticsEvent?.('reply_header_menu_action', {
        action,
        userId: user.id
      });
    }
  }, [onReport, onBlock, onShare, onCopyLink, onViewProfile, onViewEditHistory, user.id, onAnalyticsEvent]);

  // Render special badges
  const renderSpecialBadges = useCallback(() => {
    const badges = [];

    if (isOp) {
      badges.push(
        <Badge
          key="op"
          variant="outline"
          className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
        >
          OP
        </Badge>
      );
    }

    if (isAuthor) {
      badges.push(
        <Badge
          key="author"
          variant="outline"
          className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 border-green-200"
        >
          Author
        </Badge>
      );
    }

    if (isPinned) {
      badges.push(
        <Badge
          key="pinned"
          variant="outline"
          className="text-xs px-1.5 py-0.5 bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          Pinned
        </Badge>
      );
    }

    return badges.length > 0 ? (
      <div className="flex items-center gap-1">
        {badges}
      </div>
    ) : null;
  }, [isOp, isAuthor, isPinned]);

  // Render metadata (view count, reply count, etc.)
  const renderMetadata = useCallback(() => {
    if (minimal || variant === 'minimal') return null;

    const items = [];

    if (showViewCount && viewCount !== undefined) {
      items.push(
        <Tooltip key="views" content={`${viewCount.toLocaleString()} views`}>
          <div className="flex items-center gap-1 text-gray-500">
            <EyeIcon className="w-3 h-3" />
            <span className="text-xs">{viewCount.toLocaleString()}</span>
          </div>
        </Tooltip>
      );
    }

    if (showReplyCount && replyCount !== undefined && replyCount > 0) {
      items.push(
        <span key="replies" className="text-xs text-gray-500">
          {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
        </span>
      );
    }

    if (isEdited && showEditHistory) {
      items.push(
        <Tooltip key="edited" content="This comment has been edited">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMenuAction('viewEditHistory')}
            className="h-4 px-1 text-xs text-gray-500 hover:text-gray-700"
          >
            edited
          </Button>
        </Tooltip>
      );
    }

    return items.length > 0 ? (
      <div className="flex items-center gap-2">
        {items}
      </div>
    ) : null;
  }, [
    minimal, variant, showViewCount, viewCount, showReplyCount, replyCount,
    isEdited, showEditHistory, handleMenuAction
  ]);

  // Render more menu
  const renderMoreMenu = useCallback(() => {
    if (!showMoreMenu || minimal) return null;

    const menuItems = [
      {
        key: 'viewProfile',
        label: 'View Profile',
        icon: GlobeAltIcon,
        onClick: () => handleMenuAction('viewProfile')
      },
      {
        key: 'copyLink',
        label: 'Copy Link',
        icon: LinkIcon,
        onClick: () => handleMenuAction('copyLink')
      },
      {
        key: 'share',
        label: 'Share',
        icon: LinkIcon,
        onClick: () => handleMenuAction('share')
      }
    ];

    if (showEditHistory && isEdited) {
      menuItems.push({
        key: 'viewEditHistory',
        label: 'View Edit History',
        icon: ClockIcon,
        onClick: () => handleMenuAction('viewEditHistory')
      });
    }

    // Add moderation actions
    menuItems.push(
      {
        key: 'report',
        label: 'Report',
        icon: FlagIcon,
        onClick: () => handleMenuAction('report')
      },
      {
        key: 'block',
        label: 'Block User',
        icon: FlagIcon,
        onClick: () => handleMenuAction('block')
      }
    );

    return (
      <DropdownMenu
        items={menuItems}
        align="end"
        className="w-48"
        trigger={
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-6 w-6 p-0 text-gray-400 hover:text-gray-600',
              'opacity-0 group-hover:opacity-100 transition-opacity'
            )}
          >
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </Button>
        }
      />
    );
  }, [
    showMoreMenu, minimal, showEditHistory, isEdited, handleMenuAction
  ]);

  // Render compact layout
  const renderCompact = useCallback(() => {
    return (
      <div className={cn('flex items-center justify-between', sizeConfig.gap)}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Avatar
            user={user}
            size={sizeConfig.avatar}
            showHoverCard={showUserHoverCard}
            showFollowButton={showUserActions}
            showMessageButton={showUserActions}
            clickable={interactive}
            onClick={handleUserClick}
            onAnalyticsEvent={onAnalyticsEvent}
          />
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Name
                user={user}
                showVerification={showVerification}
                size={size}
                clickable={interactive}
                onClick={handleUserClick}
                onAnalyticsEvent={onAnalyticsEvent}
              />
              
              {showVerification && (
                <VerifiedBadge
                  user={user}
                  size={size}
                  onAnalyticsEvent={onAnalyticsEvent}
                />
              )}
              
              {renderSpecialBadges()}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {showTimestamp && (
                <DateComponent
                  createdAt={createdAt}
                  updatedAt={updatedAt}
                  isEdited={isEdited}
                  showRelative={showRelativeTime}
                  showFull={showFullTimestamp}
                  size={size}
                  clickable={interactive}
                  onClick={handleTimestampClick}
                  onAnalyticsEvent={onAnalyticsEvent}
                />
              )}
              
              {showLocation && user.location && (
                <Location
                  location={user.location}
                  size={size}
                  onAnalyticsEvent={onAnalyticsEvent}
                />
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {renderMetadata()}
          {renderMoreMenu()}
        </div>
      </div>
    );
  }, [
    sizeConfig, user, showUserHoverCard, showUserActions, interactive, 
    handleUserClick, onAnalyticsEvent, showVerification, size, renderSpecialBadges,
    showTimestamp, createdAt, updatedAt, isEdited, showRelativeTime, showFullTimestamp,
    handleTimestampClick, showLocation, renderMetadata, renderMoreMenu
  ]);

  // Render detailed layout
  const renderDetailed = useCallback(() => {
    return (
      <div className="space-y-2">
        {/* Main row */}
        <div className={cn('flex items-start justify-between', sizeConfig.gap)}>
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Avatar
              user={user}
              size={sizeConfig.avatar}
              showHoverCard={showUserHoverCard}
              showFollowButton={showUserActions}
              showMessageButton={showUserActions}
              showRating={variant === 'detailed'}
              showReviewCount={variant === 'detailed'}
              showTrustScore={variant === 'detailed'}
              clickable={interactive}
              onClick={handleUserClick}
              onAnalyticsEvent={onAnalyticsEvent}
            />
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Name
                  user={user}
                  showVerification={showVerification}
                  size={size}
                  clickable={interactive}
                  onClick={handleUserClick}
                  onAnalyticsEvent={onAnalyticsEvent}
                />
                
                {showVerification && (
                  <VerifiedBadge
                    user={user}
                    size={size}
                    showTooltip={true}
                    onAnalyticsEvent={onAnalyticsEvent}
                  />
                )}
                
                {renderSpecialBadges()}
              </div>
              
              {/* Secondary info row */}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {showTimestamp && (
                  <DateComponent
                    createdAt={createdAt}
                    updatedAt={updatedAt}
                    isEdited={isEdited}
                    showRelative={showRelativeTime}
                    showFull={showFullTimestamp}
                    size={size}
                    clickable={interactive}
                    onClick={handleTimestampClick}
                    onAnalyticsEvent={onAnalyticsEvent}
                  />
                )}
                
                {showLocation && user.location && (
                  <Location
                    location={user.location}
                    size={size}
                    showIcon={true}
                    onAnalyticsEvent={onAnalyticsEvent}
                  />
                )}
                
                {renderMetadata()}
              </div>
            </div>
          </div>
          
          {renderMoreMenu()}
        </div>
      </div>
    );
  }, [
    sizeConfig, user, showUserHoverCard, showUserActions, variant, interactive,
    handleUserClick, onAnalyticsEvent, showVerification, size, renderSpecialBadges,
    showTimestamp, createdAt, updatedAt, isEdited, showRelativeTime, showFullTimestamp,
    handleTimestampClick, showLocation, renderMetadata, renderMoreMenu
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative',
        sizeConfig.padding,
        isHighlighted && 'bg-yellow-50 border-l-2 border-yellow-400 pl-3',
        isCompactLayout ? 'min-h-8' : 'min-h-12',
        className
      )}
    >
      {isCompactLayout ? renderCompact() : renderDetailed()}
    </motion.div>
  );
};

export default ReplyHeader;