'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { 
  UserIcon,
  GlobeAltIcon,
  EyeSlashIcon,
  ShareIcon,
  LinkIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { 
  CheckBadgeIcon as CheckBadgeIconSolid,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Separator } from '@/components/ui/Separator';
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import { useToastHelpers } from '@/components/ui/Toast';

import { cn } from '@/lib/utils';
import { ProductReview as Review, ReviewUser as User } from '@/types/review.types';
import { useAuth } from '@/components/providers';

export interface ReviewNameProps {
  review: Review;
  user?: User | null;
  variant?: 'default' | 'compact' | 'detailed' | 'card';
  showVerified?: boolean;
  showBadges?: boolean;
  showLocation?: boolean;
  showJoinDate?: boolean;
  showSocialActions?: boolean;
  showProfilePreview?: boolean;
  interactive?: boolean;
  allowAnonymous?: boolean;
  className?: string;
  
  // Event handlers
  onUserClick?: (userId: string) => void;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onBlock?: (userId: string) => void;
  onReport?: (userId: string, reason: string) => void;
  onShare?: (type: 'profile' | 'review', data: { user: User; review: Review }) => void;
}

const NAME_VARIANTS = {
  default: 'text-sm font-medium text-foreground',
  compact: 'text-xs font-medium text-foreground',
  detailed: 'text-base font-semibold text-foreground',
  card: 'text-lg font-bold text-foreground'
} as const;

const CONTAINER_VARIANTS = {
  default: 'flex items-center gap-2',
  compact: 'flex items-center gap-1',
  detailed: 'flex flex-col items-start gap-2',
  card: 'text-center space-y-3 p-4'
} as const;

export const ReviewName: React.FC<ReviewNameProps> = ({
  review,
  user,
  variant = 'default',
  showVerified = true,
  showBadges = true,
  showLocation = false,
  showJoinDate = false,
  showSocialActions = false,
  showProfilePreview = true,
  interactive = true,
  allowAnonymous = true,
  className,
  onUserClick,
  onFollow,
  onUnfollow,
  onMessage,
  onBlock,
  onReport,
  onShare
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  const { user: currentUser } = useAuth();
  const { success, error } = useToastHelpers();

  // Determine the user information to display
  const displayUser = useMemo(() => {
    if (user) return user;
    
    // Fallback to review author information
    return {
      id: review.userId,
      displayName: review.authorName || (allowAnonymous ? 'Anonymous User' : 'Verified Buyer'),
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
  }, [user, review, allowAnonymous]);

  // User verification and badge information
  const verificationInfo = useMemo(() => {
    const badges = [];
    
    if (review.isVerifiedPurchaser) {
      badges.push({
        type: 'verified_purchase',
        icon: CheckBadgeIconSolid,
        label: 'Verified Purchase',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        description: 'This reviewer made a verified purchase'
      });
    }
    
    if (review.isVerified || displayUser.isVerified) {
      badges.push({
        type: 'verified_user',
        icon: CheckBadgeIconSolid,
        label: 'Verified User',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        description: 'This user has been verified'
      });
    }
    
    if (displayUser.reviewCount > 100) {
      badges.push({
        type: 'top_reviewer',
        icon: StarSolidIcon,
        label: 'Top Reviewer',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        description: 'One of our top reviewers'
      });
    }
    
    if (displayUser.averageRating >= 4.5 && displayUser.reviewCount >= 20) {
      badges.push({
        type: 'quality_reviewer',
        icon: StarSolidIcon,
        label: 'Quality Reviews',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        description: 'Consistently writes high-quality reviews'
      });
    }
    
    if (displayUser.location?.country && displayUser.location.country !== 'IN') {
      badges.push({
        type: 'international',
        icon: GlobeAltIcon,
        label: 'International',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        description: `Reviewer from ${displayUser.location.country}`
      });
    }
    
    return {
      isVerified: review.isVerified || review.isVerifiedPurchaser,
      badges,
      trustScore: displayUser.trustScore || 0,
      reputationScore: displayUser.reputationScore || 0
    };
  }, [review, displayUser]);

  // Display name with privacy considerations
  const displayName = useMemo(() => {
    if (!displayUser.showRealName && allowAnonymous) {
      return `${displayUser.displayName.charAt(0)}***`;
    }
    return displayUser.displayName;
  }, [displayUser.displayName, displayUser.showRealName, allowAnonymous]);

  // Location information
  const locationInfo = useMemo(() => {
    if (!showLocation || !displayUser.location || !displayUser.showLocation) {
      return null;
    }
    
    const parts = [];
    if (displayUser.location.city) parts.push(displayUser.location.city);
    if (displayUser.location.state) parts.push(displayUser.location.state);
    if (displayUser.location.country) parts.push(displayUser.location.country);
    
    return parts.join(', ') || null;
  }, [showLocation, displayUser.location, displayUser.showLocation]);

  // Join date formatting
  const joinDate = useMemo(() => {
    if (!showJoinDate) return null;
    return new Date(displayUser.memberSince).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }, [showJoinDate, displayUser.memberSince]);

  // Event handlers
  const handleNameClick = useCallback(() => {
    if (!interactive) return;
    
    if (onUserClick) {
      onUserClick(displayUser.id);
    } else if (showProfilePreview) {
      setShowProfileDialog(true);
    }
  }, [interactive, onUserClick, displayUser.id, showProfilePreview]);

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

  const handleShare = useCallback((type: 'profile' | 'review') => {
    if (onShare) {
      onShare(type, { user: displayUser, review });
    } else {
      setShareDialogOpen(true);
    }
  }, [onShare, displayUser, review]);

  // Render verification badge
  const renderVerificationBadge = useCallback(() => {
    if (!showVerified || !verificationInfo.isVerified) return null;

    const primaryBadge = verificationInfo.badges[0];
    if (!primaryBadge) return null;

    return (
      <Tooltip content={primaryBadge.description}>
        <primaryBadge.icon 
          className={cn("h-4 w-4", primaryBadge.color)}
          aria-label={primaryBadge.label}
        />
      </Tooltip>
    );
  }, [showVerified, verificationInfo]);

  // Render badges
  const renderBadges = useCallback(() => {
    if (!showBadges || verificationInfo.badges.length === 0) return null;

    const badgesToShow = variant === 'detailed' || variant === 'card' 
      ? verificationInfo.badges 
      : verificationInfo.badges.slice(0, 2);

    return (
      <div className="flex flex-wrap gap-1">
        {badgesToShow.map((badge) => (
          <Tooltip key={badge.type} content={badge.description}>
            <Badge 
              variant="secondary"
              className={cn(
                "text-xs px-1.5 py-0.5 flex items-center gap-1",
                badge.color,
                badge.bgColor
              )}
            >
              <badge.icon className="h-3 w-3" />
              {(variant === 'detailed' || variant === 'card') && badge.label}
            </Badge>
          </Tooltip>
        ))}
      </div>
    );
  }, [showBadges, verificationInfo.badges, variant]);

  // Render social actions
  const renderSocialActions = useCallback(() => {
    if (!showSocialActions || !currentUser || currentUser.id === displayUser.id) {
      return null;
    }

    return (
      <div className="flex items-center gap-1">
        {isFollowing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnfollow}
            disabled={isLoading}
            className="h-7 px-2 text-xs"
          >
            <UserIcon className="h-3 w-3 mr-1" />
            Following
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFollow}
            disabled={isLoading}
            className="h-7 px-2 text-xs"
          >
            <UserPlusIcon className="h-3 w-3 mr-1" />
            Follow
          </Button>
        )}
        
        <Dropdown
          trigger={
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <span className="sr-only">More actions</span>
              •••
            </Button>
          }
          options={[
            { value: 'message', label: 'Send Message', icon: <ChatBubbleLeftIcon className="h-4 w-4" /> },
            { value: 'share', label: 'Share Profile', icon: <ShareIcon className="h-4 w-4" /> },
            { value: 'block', label: 'Block User', icon: <EyeSlashIcon className="h-4 w-4" /> },
            { value: 'report', label: 'Report User', icon: <FlagIcon className="h-4 w-4" /> }
          ]}
          onValueChange={(value) => {
            switch (value) {
              case 'message':
                handleMessage();
                break;
              case 'share':
                handleShare('profile');
                break;
              case 'block':
                handleBlock();
                break;
              case 'report':
                handleReport('inappropriate');
                break;
            }
          }}
          align="end"
        />
      </div>
    );
  }, [
    showSocialActions,
    currentUser,
    displayUser.id,
    isFollowing,
    isLoading,
    handleFollow,
    handleUnfollow,
    handleMessage,
    handleShare,
    handleBlock,
    handleReport
  ]);

  // Render profile dialog
  const renderProfileDialog = useCallback(() => {
    if (!showProfileDialog) return null;
    
    return (
      <Dialog 
        open={showProfileDialog} 
        onClose={() => setShowProfileDialog(false)}
      >
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            View {displayUser.displayName}&apos;s profile and activity
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={displayUser.avatar?.url} alt={displayUser.displayName} />
              <AvatarFallback>
                {displayUser.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{displayUser.displayName}</h3>
              {locationInfo && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <GlobeAltIcon className="h-4 w-4" />
                  {locationInfo}
                </p>
              )}
              {joinDate && (
                <p className="text-sm text-muted-foreground">
                  Member since {joinDate}
                </p>
              )}
            </div>
          </div>
          
          {renderBadges()}
          
          <Separator />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{displayUser.reviewCount}</p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{displayUser.helpfulVoteCount}</p>
              <p className="text-sm text-muted-foreground">Helpful</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{displayUser.averageRating.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </div>
          </div>
          
          {verificationInfo.trustScore > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Trust Score</span>
                  <span className="text-sm">{verificationInfo.trustScore}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "bg-green-500 h-2 rounded-full transition-all duration-300",
                      `w-[${Math.min(100, Math.max(0, verificationInfo.trustScore))}%]`
                    )}
                  />
                </div>
              </div>
            </>
          )}
          
          {renderSocialActions()}
        </div>
      </Dialog>
    );
  }, [
    showProfileDialog,
    displayUser,
    locationInfo,
    joinDate,
    renderBadges,
    verificationInfo,
    renderSocialActions
  ]);

  // Render share dialog
  const renderShareDialog = useCallback(() => {
    if (!shareDialogOpen) return null;
    
    return (
      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        size="sm"
      >
        <DialogHeader>
          <DialogTitle>Share Profile</DialogTitle>
          <DialogDescription>
            Share {displayUser.displayName}&apos;s profile with others
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 p-6">
          <div>
            <label 
              htmlFor="profile-url"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Profile URL
            </label>
            <div className="flex gap-2 mt-1">
              <Input
                id="profile-url"
                value={`${window.location.origin}/users/${displayUser.id}`}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/users/${displayUser.id}`);
                  success('Profile URL copied to clipboard');
                }}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const url = `https://twitter.com/intent/tweet?text=Check out ${displayUser.displayName}'s reviews&url=${window.location.origin}/users/${displayUser.id}`;
                window.open(url, '_blank');
              }}
            >
              Share on Twitter
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const url = `https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/users/${displayUser.id}`;
                window.open(url, '_blank');
              }}
            >
              Share on Facebook
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }, [shareDialogOpen, displayUser, success]);

  // Main render based on variant
  if (variant === 'card') {
    return (
      <div className={cn(CONTAINER_VARIANTS[variant], className)}>
        <Avatar className="h-20 w-20 mx-auto">
          <AvatarImage src={displayUser.avatar?.url} alt={displayUser.displayName} />
          <AvatarFallback className="text-lg">
            {displayUser.displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <button
            onClick={handleNameClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              NAME_VARIANTS[variant],
              interactive && "hover:text-primary transition-colors cursor-pointer",
              !interactive && "cursor-default"
            )}
            disabled={!interactive}
          >
            {displayName}
          </button>
          
          <div className="flex items-center justify-center gap-1 mt-1">
            {renderVerificationBadge()}
          </div>
        </div>
        
        {renderBadges()}
        
        {locationInfo && (
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <GlobeAltIcon className="h-4 w-4" />
            {locationInfo}
          </p>
        )}
        
        {joinDate && (
          <p className="text-xs text-muted-foreground">
            Member since {joinDate}
          </p>
        )}
        
        {renderSocialActions()}
        {renderProfileDialog()}
        {renderShareDialog()}
      </div>
    );
  }

  return (
    <div className={cn(CONTAINER_VARIANTS[variant], className)}>
      <div className="flex items-center gap-2">
        <button
          onClick={handleNameClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            NAME_VARIANTS[variant],
            interactive && "hover:text-primary transition-colors cursor-pointer",
            !interactive && "cursor-default",
            isHovered && "underline"
          )}
          disabled={!interactive}
        >
          {displayName}
        </button>
        
        {renderVerificationBadge()}
      </div>
      
      {variant === 'detailed' && (
        <div className="space-y-2">
          {renderBadges()}
          
          {locationInfo && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <GlobeAltIcon className="h-4 w-4" />
              {locationInfo}
            </p>
          )}
          
          {joinDate && (
            <p className="text-xs text-muted-foreground">
              Member since {joinDate}
            </p>
          )}
          
          {renderSocialActions()}
        </div>
      )}
      
      {(variant === 'default' || variant === 'compact') && (
        <div className="flex items-center gap-2">
          {renderBadges()}
          {renderSocialActions()}
        </div>
      )}
      
      {renderProfileDialog()}
      {renderShareDialog()}
    </div>
  );
};

export default ReviewName;
