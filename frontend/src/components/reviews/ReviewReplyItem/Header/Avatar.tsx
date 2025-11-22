'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon,
  StarIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import {
  CheckBadgeIcon as CheckBadgeIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { ReviewUser } from '@/types/review.types';

// Types
export interface AvatarBadge {
  id: string;
  type: 'verified' | 'premium' | 'expert' | 'contributor' | 'moderator' | 'vip' | 'custom';
  label: string;
  description: string;
  icon?: React.ReactNode;
  color: string;
  priority: number;
  isVisible: boolean;
}

export interface AvatarProps {
  user: ReviewUser;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadges?: boolean;
  showHoverCard?: boolean;
  showOnlineStatus?: boolean;
  showFollowButton?: boolean;
  showMessageButton?: boolean;
  showRating?: boolean;
  showReviewCount?: boolean;
  showTrustScore?: boolean;
  interactive?: boolean;
  clickable?: boolean;
  borderColor?: string;
  variant?: 'default' | 'minimal' | 'detailed' | 'compact';
  className?: string;

  // Event handlers
  onClick?: (user: ReviewUser) => void;
  onFollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onBadgeClick?: (badge: AvatarBadge) => void;

  // Analytics
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

const AVATAR_SIZES = {
  xs: { 
    container: 'w-6 h-6',
    image: 'w-6 h-6',
    badge: 'w-3 h-3',
    text: 'text-xs',
    icon: 'w-3 h-3'
  },
  sm: { 
    container: 'w-8 h-8',
    image: 'w-8 h-8',
    badge: 'w-4 h-4',
    text: 'text-sm',
    icon: 'w-4 h-4'
  },
  md: { 
    container: 'w-10 h-10',
    image: 'w-10 h-10',
    badge: 'w-5 h-5',
    text: 'text-sm',
    icon: 'w-4 h-4'
  },
  lg: { 
    container: 'w-12 h-12',
    image: 'w-12 h-12',
    badge: 'w-6 h-6',
    text: 'text-base',
    icon: 'w-5 h-5'
  },
  xl: { 
    container: 'w-16 h-16',
    image: 'w-16 h-16',
    badge: 'w-7 h-7',
    text: 'text-lg',
    icon: 'w-6 h-6'
  }
} as const;

const BORDER_COLORS = {
  default: 'border-gray-200',
  verified: 'border-blue-400',
  premium: 'border-yellow-400',
  expert: 'border-primary-400',
  moderator: 'border-green-400'
} as const;

const Avatar: React.FC<AvatarProps> = ({
  user,
  size = 'md',
  showBadges = true,
  showHoverCard = true,
  showFollowButton = false,
  showMessageButton = false,
  showRating = false,
  showReviewCount = false,
  showTrustScore = false,
  interactive = true,
  clickable = true,
  borderColor,
  variant = 'default',
  className,
  onClick,
  onFollow,
  onMessage,
  onBadgeClick,
  onAnalyticsEvent
}) => {
  // State
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get size configuration
  const sizeConfig = AVATAR_SIZES[size];

  // Generate user badges
  const userBadges = useMemo((): AvatarBadge[] => {
    const badges: AvatarBadge[] = [];

    // Verified badge
    if (user.isVerified) {
      badges.push({
        id: 'verified',
        type: 'verified',
        label: 'Verified',
        description: 'This user has been verified',
        icon: <CheckBadgeIconSolid className={cn(sizeConfig.icon, 'text-blue-500')} />,
        color: 'blue',
        priority: 10,
        isVisible: true
      });
    }

    // Premium badge (check for premium badge)
    const hasPremiumBadge = user.badges?.some(badge => badge.name.toLowerCase().includes('premium'));
    if (hasPremiumBadge) {
      badges.push({
        id: 'premium',
        type: 'premium',
        label: 'Premium',
        description: 'Premium member',
        icon: <StarIconSolid className={cn(sizeConfig.icon, 'text-yellow-500')} />,
        color: 'yellow',
        priority: 9,
        isVisible: true
      });
    }

    // Trust score badge (high trust users)
    if (user.trustScore && user.trustScore >= 80) {
      badges.push({
        id: 'trusted',
        type: 'expert',
        label: 'Trusted Reviewer',
        description: `Trust score: ${user.trustScore}%`,
        icon: <ShieldCheckIconSolid className={cn(sizeConfig.icon, 'text-green-500')} />,
        color: 'green',
        priority: 8,
        isVisible: true
      });
    }

    // Top contributor badge
    if (user.reviewCount && user.reviewCount >= 100) {
      badges.push({
        id: 'contributor',
        type: 'contributor',
        label: 'Top Contributor',
        description: `${user.reviewCount} reviews`,
        icon: <HeartIconSolid className={cn(sizeConfig.icon, 'text-red-500')} />,
        color: 'red',
        priority: 7,
        isVisible: true
      });
    }

    return badges.sort((a, b) => b.priority - a.priority);
  }, [user, sizeConfig.icon]);

  // Get primary badge (highest priority)
  const primaryBadge = userBadges.find(badge => badge.isVisible);

  // Handle avatar click
  const handleClick = useCallback(() => {
    if (!clickable || !onClick) return;
    
    onClick(user);
    onAnalyticsEvent?.('avatar_click', {
      userId: user.id,
      userName: user.displayName,
      userType: user.isVerified ? 'verified' : 'regular'
    });
  }, [clickable, onClick, user, onAnalyticsEvent]);

  // Handle follow button
  const handleFollow = useCallback(async () => {
    if (!onFollow || isLoading) return;

    setIsLoading(true);
    
    try {
      await onFollow(user.id);
      setIsFollowing(!isFollowing);
      
      onAnalyticsEvent?.('user_follow', {
        targetUserId: user.id,
        action: isFollowing ? 'unfollow' : 'follow'
      });
      
    } catch (error) {
      console.error('Follow action failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onFollow, user.id, isFollowing, isLoading, onAnalyticsEvent]);

  // Handle message button
  const handleMessage = useCallback(() => {
    if (!onMessage) return;
    
    onMessage(user.id);
    onAnalyticsEvent?.('user_message', {
      targetUserId: user.id
    });
  }, [onMessage, user.id, onAnalyticsEvent]);

  // Handle badge click
  const handleBadgeClick = useCallback((badge: AvatarBadge, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (onBadgeClick) {
      onBadgeClick(badge);
      onAnalyticsEvent?.('badge_click', {
        badgeType: badge.type,
        userId: user.id
      });
    }
  }, [onBadgeClick, user.id, onAnalyticsEvent]);

  // Handle image error
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Determine border color
  const determineBorderColor = useMemo(() => {
    if (borderColor) return borderColor;
    if (user.isVerified) return BORDER_COLORS.verified;
    const hasPremiumBadge = user.badges?.some(badge => badge.name.toLowerCase().includes('premium'));
    if (hasPremiumBadge) return BORDER_COLORS.premium;
    if (user.trustScore && user.trustScore >= 80) return BORDER_COLORS.expert;
    return BORDER_COLORS.default;
  }, [borderColor, user.isVerified, user.badges, user.trustScore]);

  // Generate initials fallback
  const initials = useMemo(() => {
    const name = user.displayName || 'U';
    return name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }, [user.displayName]);

  // Render avatar image or fallback
  const renderAvatarImage = useCallback(() => {
    if (user.avatar?.url && !imageError) {
      return (
        <div className={cn(
          sizeConfig.image,
          'rounded-full overflow-hidden bg-gray-100 relative'
        )}>
          <Image
            src={user.avatar.url}
            alt={user.displayName}
            fill
            className="object-cover"
            onError={handleImageError}
            sizes={size === 'xs' ? '24px' : size === 'sm' ? '32px' : size === 'md' ? '40px' : size === 'lg' ? '48px' : '64px'}
          />
        </div>
      );
    }

    // Fallback to initials
    return (
      <div className={cn(
        sizeConfig.image,
        'rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'
      )}>
        <span className={cn(
          sizeConfig.text,
          'font-semibold text-white'
        )}>
          {initials}
        </span>
      </div>
    );
  }, [user.avatar?.url, user.displayName, imageError, sizeConfig, initials, handleImageError, size]);

  // Render badges
  const renderBadges = useCallback(() => {
    if (!showBadges || userBadges.length === 0) return null;

    const visibleBadges = variant === 'minimal' 
      ? userBadges.slice(0, 1) 
      : userBadges.filter(badge => badge.isVisible);

    return (
      <div className="absolute -top-1 -right-1 flex items-center gap-0.5">
        {visibleBadges.map((badge) => (
          <Tooltip key={badge.id} content={badge.description}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className={cn(
                'relative rounded-full bg-white shadow-sm border cursor-pointer',
                'flex items-center justify-center',
                sizeConfig.badge
              )}
              onClick={(e) => handleBadgeClick(badge, e)}
            >
              {badge.icon}
            </motion.div>
          </Tooltip>
        ))}
      </div>
    );
  }, [showBadges, userBadges, variant, sizeConfig.badge, handleBadgeClick]);

  // Render online status (disabled - not available in ReviewUser)
  const renderOnlineStatus = useCallback(() => {
    return null; // Online status not available in ReviewUser interface
  }, []);

  // Render hover card content
  const renderHoverCard = useCallback(() => {
    if (!showHoverCard || !isHovered || variant === 'minimal') return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200 min-w-64"
      >
        {/* User Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-gray-900">
              {user.displayName}
            </div>
            {primaryBadge && (
              <div className="flex items-center">
                {primaryBadge.icon}
              </div>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {showReviewCount && user.reviewCount !== undefined && (
              <span>{user.reviewCount} reviews</span>
            )}
            {showRating && user.averageRating !== undefined && (
              <div className="flex items-center gap-1">
                <StarIcon className="w-3 h-3 text-yellow-500" />
                <span>{user.averageRating.toFixed(1)}</span>
              </div>
            )}
            {showTrustScore && user.trustScore !== undefined && (
              <div className="flex items-center gap-1">
                <ShieldCheckIcon className="w-3 h-3 text-green-500" />
                <span>{user.trustScore}%</span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          {(showFollowButton || showMessageButton) && (
            <div className="flex items-center gap-2 pt-2">
              {showFollowButton && (
                <Button
                  variant={isFollowing ? 'outline' : 'default'}
                  size="sm"
                  onClick={handleFollow}
                  disabled={isLoading}
                  className="h-7 px-3 text-xs"
                >
                  {isLoading ? (
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlusIcon className="w-3 h-3 mr-1" />
                      {isFollowing ? 'Following' : 'Follow'}
                    </>
                  )}
                </Button>
              )}
              
              {showMessageButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMessage}
                  className="h-7 px-3 text-xs"
                >
                  <ChatBubbleLeftIcon className="w-3 h-3 mr-1" />
                  Message
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }, [
    showHoverCard, isHovered, variant, user, primaryBadge, showReviewCount, 
    showRating, showTrustScore, showFollowButton, showMessageButton, 
    isFollowing, isLoading, handleFollow, handleMessage
  ]);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        interactive && 'transition-transform duration-200',
        interactive && isHovered && 'scale-105',
        clickable && 'cursor-pointer',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Main Avatar Container */}
      <div className={cn(
        'relative rounded-full border-2 p-0.5 bg-white',
        sizeConfig.container,
        determineBorderColor,
        interactive && 'transition-all duration-200',
        interactive && isHovered && 'shadow-md'
      )}>
        {/* Avatar Image */}
        {renderAvatarImage()}
        
        {/* Badges */}
        {renderBadges()}
        
        {/* Online Status */}
        {renderOnlineStatus()}
      </div>
      
      {/* Hover Card */}
      {renderHoverCard()}
    </div>
  );
};

export default Avatar;
