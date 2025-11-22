'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon,
  StarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { 
  CheckBadgeIcon as CheckBadgeIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid 
} from '@heroicons/react/24/solid';

import { Avatar as UIAvatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import { Card, CardContent } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { useToastHelpers } from '@/components/ui/Toast';

import { cn } from '@/lib/utils';
import { ProductReview as Review, ReviewUser as User } from '@/types/review.types';
import { useAuth } from '@/components/providers';
import { useUserProfile } from '@/hooks/useUserProfile';

export interface ReviewAvatarProps {
  review: Review;
  user?: User | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadges?: boolean;
  showTooltip?: boolean;
  showStats?: boolean;
  showActions?: boolean;
  interactive?: boolean;
  className?: string;
  
  // Event handlers
  onUserClick?: (userId: string) => void;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onBlock?: (userId: string) => void;
  onReport?: (userId: string, reason: string) => void;
}

const AVATAR_SIZES = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
} as const;

const BADGE_SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-4 w-4',
  xl: 'h-5 w-5'
} as const;

export const ReviewAvatar: React.FC<ReviewAvatarProps> = ({
  review,
  user,
  size = 'md',
  showBadges = true,
  showTooltip = true,
  showStats = false,
  showActions = false,
  interactive = true,
  className,
  onUserClick,
  onFollow,
  onUnfollow,
  onMessage,
  onBlock,
  onReport
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user: currentUser } = useAuth();
  const { success, error } = useToastHelpers();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile(user?.id || review.userId);

  // Determine the user information to display
  const displayUser = useMemo(() => {
    if (user) return user;
    
    // Fallback to review author information
    return {
      id: review.userId,
      displayName: review.authorName || 'Anonymous',
      avatar: undefined,
      isVerified: review.isVerified,
      reviewCount: 0,
      averageRating: 0,
      helpfulVoteCount: 0,
      badges: [],
      memberSince: review.createdAt,
      lastActiveAt: review.createdAt,
      location: undefined,
      showRealName: true,
      showLocation: false,
      showPurchaseHistory: false,
      reputationScore: 0,
      trustScore: 0,
      expertiseAreas: []
    } as User;
  }, [user, review]);

  // Avatar source and fallback
  const avatarSrc = useMemo(() => {
    return displayUser.avatar?.url || null;
  }, [displayUser.avatar]);

  const avatarFallback = useMemo(() => {
    const displayName = displayUser.displayName || '';
    const nameParts = displayName.split(' ');
    
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0).toUpperCase()}${nameParts[1].charAt(0).toUpperCase()}`;
    }
    
    if (nameParts[0]) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return 'U';
  }, [displayUser.displayName]);

  // User stats
  const userStats = useMemo(() => {
    if (!userProfile || !showStats) return null;
    
    return {
      reviewCount: userProfile.reviewCount || displayUser.reviewCount,
      helpfulVotes: userProfile.helpfulVotes || displayUser.helpfulVoteCount,
      followerCount: userProfile.followerCount || 0,
      averageRating: userProfile.averageRating || displayUser.averageRating,
      memberSince: displayUser.memberSince
    };
  }, [userProfile, displayUser.memberSince, displayUser.reviewCount, displayUser.helpfulVoteCount, displayUser.averageRating, showStats]);

  // Verification badges
  const badges = useMemo(() => {
    const badgeList = [];
    
    if (review.isVerifiedPurchaser) {
      badgeList.push({
        type: 'verified_purchase',
        icon: CheckBadgeIconSolid,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        label: 'Verified Purchase',
        description: 'This reviewer made a verified purchase'
      });
    }
    
    if (review.isVerified || displayUser.isVerified) {
      badgeList.push({
        type: 'verified_user',
        icon: ShieldCheckIconSolid,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        label: 'Verified User',
        description: 'This user has been verified'
      });
    }
    
    if (userStats && userStats.reviewCount > 50) {
      badgeList.push({
        type: 'prolific_reviewer',
        icon: UserIcon,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        label: 'Prolific Reviewer',
        description: 'Has written many helpful reviews'
      });
    }
    
    if (displayUser.location?.country && displayUser.location.country !== 'IN') {
      badgeList.push({
        type: 'international',
        icon: GlobeAltIcon,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-50',
        label: 'International Reviewer',
        description: `Review from ${displayUser.location.country}`
      });
    }
    
    return badgeList;
  }, [review, displayUser, userStats]);

  // Event handlers
  const handleAvatarClick = useCallback(() => {
    if (!interactive) return;
    
    if (onUserClick) {
      onUserClick(displayUser.id);
    } else {
      setShowProfile(true);
    }
  }, [interactive, onUserClick, displayUser.id]);

  const handleFollow = useCallback(async () => {
    if (!currentUser || !onFollow) return;
    
    setIsLoading(true);
    try {
      await onFollow(displayUser.id);
      setIsFollowing(true);
      success('Now following this user');
    } catch (err) {
      console.error('Failed to follow user:', err);
      error('Failed to follow user');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, onFollow, displayUser.id, success, error]);

  const handleUnfollow = useCallback(async () => {
    if (!currentUser || !onUnfollow) return;
    
    setIsLoading(true);
    try {
      await onUnfollow(displayUser.id);
      setIsFollowing(false);
      success('Unfollowed user');
    } catch (err) {
      console.error('Failed to unfollow user:', err);
      error('Failed to unfollow user');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, onUnfollow, displayUser.id, success, error]);

  const handleMessage = useCallback(() => {
    if (onMessage) {
      onMessage(displayUser.id);
    }
  }, [onMessage, displayUser.id]);

  const handleBlock = useCallback(() => {
    if (onBlock) {
      onBlock(displayUser.id);
    }
  }, [onBlock, displayUser.id]);

  const handleReport = useCallback((reason: string) => {
    if (onReport) {
      onReport(displayUser.id, reason);
    }
  }, [onReport, displayUser.id]);



  // Profile modal content
  const renderProfileModal = useCallback(() => {
    if (!showProfile) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={() => setShowProfile(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <UIAvatar className="h-20 w-20 mx-auto">
                  <AvatarImage src={avatarSrc || undefined} alt={displayUser.displayName} />
                  <AvatarFallback className="text-lg">
                    {avatarFallback}
                  </AvatarFallback>
                </UIAvatar>
                
                <div>
                  <h3 className="text-lg font-semibold">
                    {displayUser.displayName}
                  </h3>
                  
                  {badges.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mt-2">
                      {badges.map((badge) => (
                        <Badge 
                          key={badge.type}
                          variant="secondary" 
                          className={cn(
                            "text-xs",
                            badge.color,
                            badge.bgColor
                          )}
                        >
                          <badge.icon className="h-3 w-3 mr-1" />
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                {userStats && !profileLoading && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{userStats.reviewCount}</p>
                        <p className="text-sm text-muted-foreground">Reviews</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{userStats.helpfulVotes}</p>
                        <p className="text-sm text-muted-foreground">Helpful</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{userStats.followerCount}</p>
                        <p className="text-sm text-muted-foreground">Followers</p>
                      </div>
                    </div>
                    
                    {userStats.averageRating > 0 && (
                      <div className="flex items-center justify-center gap-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              className={cn(
                                "h-4 w-4",
                                star <= userStats.averageRating 
                                  ? "text-yellow-400 fill-current" 
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {userStats.averageRating.toFixed(1)} avg rating
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {showActions && currentUser && currentUser.id !== displayUser.id && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
                      <Button
                        variant={isFollowing ? "outline" : "default"}
                        size="sm"
                        onClick={isFollowing ? handleUnfollow : handleFollow}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                      </Button>
                      
                      {onMessage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleMessage}
                          className="flex-1"
                        >
                          Message
                        </Button>
                      )}
                      
                      <Dropdown
                        trigger={
                          <Button variant="outline" size="sm">
                            <span className="sr-only">More options</span>
                            •••
                          </Button>
                        }
                        options={[
                          ...(onBlock ? [{ value: 'block', label: 'Block User' }] : []),
                          ...(onReport ? [
                            { value: 'spam', label: 'Report as Spam' },
                            { value: 'inappropriate', label: 'Report as Inappropriate' }
                          ] : [])
                        ]}
                        onValueChange={(value) => {
                          if (value === 'block') handleBlock();
                          if (value === 'spam') handleReport('spam');
                          if (value === 'inappropriate') handleReport('inappropriate');
                        }}
                        align="end"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }, [
    showProfile, avatarSrc, displayUser, avatarFallback, badges, userStats, 
    showActions, currentUser, isFollowing, isLoading, handleFollow, handleUnfollow, 
    handleMessage, onMessage, handleBlock, onBlock, handleReport, onReport, profileLoading
  ]);

  // Avatar display component
  const AvatarDisplay = useCallback(() => (
    <UIAvatar className={cn(AVATAR_SIZES[size], "ring-2 ring-transparent transition-all")}>
      <AvatarImage 
        src={avatarSrc || undefined} 
        alt={displayUser.displayName}
        className="object-cover"
      />
      <AvatarFallback className={cn(
        "bg-gradient-to-br from-blue-400 to-purple-500 text-white font-medium",
        size === 'xs' && "text-xs",
        size === 'sm' && "text-xs",
        size === 'md' && "text-sm",
        size === 'lg' && "text-base",
        size === 'xl' && "text-lg"
      )}>
        {avatarFallback}
      </AvatarFallback>
      
      {/* Badges */}
      {showBadges && badges.length > 0 && (
        <div className="absolute -top-1 -right-1 flex gap-0.5">
          {badges.slice(0, 2).map((badge) => (
            <div
              key={badge.type}
              className={cn(
                "rounded-full bg-white shadow-sm border flex items-center justify-center",
                BADGE_SIZES[size],
                badge.bgColor
              )}
            >
              <badge.icon className={cn(
                badge.color,
                size === 'xs' && "h-2 w-2",
                size === 'sm' && "h-2.5 w-2.5",
                size === 'md' && "h-3 w-3",
                size === 'lg' && "h-3 w-3",
                size === 'xl' && "h-3.5 w-3.5"
              )} />
            </div>
          ))}
        </div>
      )}
      
      {/* Online status indicator - removed since ReviewUser doesn't have isActive */}
    </UIAvatar>
  ), [avatarSrc, displayUser, avatarFallback, showBadges, badges, size]);

  // Simple tooltip content for profile preview
  const tooltipContent = useMemo(() => {
    if (!showTooltip) return null;
    
    return (
      <div className="p-3 space-y-2 max-w-xs">
        <div className="flex items-center gap-2">
          <UIAvatar className="h-8 w-8">
            <AvatarImage src={avatarSrc || undefined} alt={displayUser.displayName} />
            <AvatarFallback className="text-xs">
              {avatarFallback}
            </AvatarFallback>
          </UIAvatar>
          <div>
            <p className="font-medium text-sm">
              {displayUser.displayName}
            </p>
            {userStats && (
              <p className="text-xs text-muted-foreground">
                {userStats.reviewCount} reviews
              </p>
            )}
          </div>
        </div>
        
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {badges.slice(0, 3).map((badge) => (
              <Badge 
                key={badge.type}
                variant="secondary" 
                className={cn(
                  "text-xs px-1.5 py-0.5",
                  badge.color,
                  badge.bgColor
                )}
              >
                <badge.icon className="h-3 w-3 mr-1" />
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
        
        {userStats && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Helpful votes</p>
              <p className="font-medium">{userStats.helpfulVotes}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Member since</p>
              <p className="font-medium">
                {new Date(userStats.memberSince).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }, [showTooltip, avatarSrc, displayUser, avatarFallback, userStats, badges]);

  return (
    <div className={cn("relative inline-block", className)}>
      {showTooltip && tooltipContent ? (
        <Tooltip 
          content={tooltipContent}
          placement="top" 
          className="z-50"
        >
          <div
            className={cn(
              "relative cursor-pointer transition-transform",
              interactive && "hover:scale-105",
              !interactive && "cursor-default",
              isHovered && "z-10"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleAvatarClick}
          >
            <AvatarDisplay />
          </div>
        </Tooltip>
      ) : (
        <div
          className={cn(
            "relative cursor-pointer transition-transform",
            interactive && "hover:scale-105",
            !interactive && "cursor-default"
          )}
          onClick={handleAvatarClick}
        >
          <AvatarDisplay />
        </div>
      )}
      
      {/* Profile Modal */}
      <AnimatePresence>
        {renderProfileModal()}
      </AnimatePresence>
    </div>
  );
};

export default ReviewAvatar;
