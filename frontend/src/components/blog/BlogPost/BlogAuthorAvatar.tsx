'use client';

import React, { useState } from 'react';
import { Verified, Crown, Star, Award, Users, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Types
interface Author {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  email?: string;
  website?: string;
  verified?: boolean;
  role?: string;
  badge?: 'premium' | 'pro' | 'expert' | 'contributor' | 'moderator';
  followerCount?: number;
  postCount?: number;
  level?: number;
  points?: number;
  joinedAt?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface BlogAuthorAvatarProps {
  author: Author;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'hover' | 'click' | 'static';
  showVerified?: boolean;
  showBadge?: boolean;
  showStatus?: boolean;
  showTooltip?: boolean;
  showPopover?: boolean;
  className?: string;
  onClick?: (author: Author) => void;
  onFollow?: (authorId: string, isFollowing: boolean) => void;
  isFollowing?: boolean;
  enableInteractions?: boolean;
  borderStyle?: 'none' | 'simple' | 'gradient' | 'glow';
  statusPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const BlogAuthorAvatar: React.FC<BlogAuthorAvatarProps> = ({
  author,
  size = 'md',
  variant = 'default',
  showVerified = true,
  showBadge = true,
  showStatus = false,
  showTooltip = true,
  showPopover = false,
  className,
  onClick,
  onFollow,
  isFollowing = false,
  enableInteractions = true,
  borderStyle = 'simple',
  statusPosition = 'bottom-right'
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick && enableInteractions) {
      onClick(author);
    }
    if (showPopover) {
      setIsPopoverOpen(!isPopoverOpen);
    }
  };

  // Handle follow
  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFollow && enableInteractions) {
      onFollow(author.id, !isFollowing);
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'w-6 h-6';
      case 'sm': return 'w-8 h-8';
      case 'md': return 'w-10 h-10';
      case 'lg': return 'w-12 h-12';
      case 'xl': return 'w-16 h-16';
      case '2xl': return 'w-20 h-20';
      default: return 'w-10 h-10';
    }
  };

  // Get border classes
  const getBorderClasses = () => {
    switch (borderStyle) {
      case 'none': return '';
      case 'simple': return 'ring-2 ring-gray-200 dark:ring-gray-700';
      case 'gradient': return 'ring-2 ring-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-0.5';
      case 'glow': return 'ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/25';
      default: return 'ring-2 ring-gray-200 dark:ring-gray-700';
    }
  };

  // Get verified icon
  const getVerifiedIcon = () => {
    if (!showVerified || !author.verified) return null;
    
    return (
      <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5">
        <Verified className="w-3 h-3 text-blue-500 fill-current" />
      </div>
    );
  };

  // Get badge icon
  const getBadgeIcon = () => {
    if (!showBadge || !author.badge) return null;

    const badgeIcons = {
      premium: <Crown className="w-3 h-3 text-yellow-500" />,
      pro: <Star className="w-3 h-3 text-purple-500" />,
      expert: <Award className="w-3 h-3 text-green-500" />,
      contributor: <Users className="w-3 h-3 text-blue-500" />,
      moderator: <MessageCircle className="w-3 h-3 text-red-500" />
    };

    return (
      <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5">
        {badgeIcons[author.badge]}
      </div>
    );
  };

  // Get status indicator
  const getStatusIndicator = () => {
    if (!showStatus) return null;

    const statusColor = author.isOnline ? 'bg-green-500' : 'bg-gray-400';
    
    const positionClasses = {
      'bottom-right': 'bottom-0 right-0',
      'bottom-left': 'bottom-0 left-0',
      'top-right': 'top-0 right-0',
      'top-left': 'top-0 left-0'
    };

    return (
      <div className={cn(
        'absolute w-3 h-3 rounded-full border-2 border-white dark:border-gray-900',
        statusColor,
        positionClasses[statusPosition]
      )} />
    );
  };

  // Get hover effects
  const getHoverClasses = () => {
    if (variant === 'static' || !enableInteractions) return '';
    
    return cn(
      'transition-all duration-200',
      variant === 'hover' && 'hover:scale-110 hover:shadow-lg',
      variant === 'click' && 'hover:scale-105 active:scale-95',
      (onClick || showPopover) && 'cursor-pointer'
    );
  };

  // Avatar component
  const AvatarComponent = () => (
    <div className={cn('relative', getSizeClasses())}>
      <Avatar 
        className={cn(
          getSizeClasses(),
          getBorderClasses(),
          getHoverClasses(),
          borderStyle === 'gradient' && 'rounded-full'
        )}
        onClick={handleClick}
      >
        {borderStyle === 'gradient' ? (
          <div className={cn('rounded-full overflow-hidden', getSizeClasses())}>
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>
              {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </div>
        ) : (
          <>
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>
              {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </>
        )}
      </Avatar>
      
      {getVerifiedIcon()}
      {getBadgeIcon()}
      {getStatusIndicator()}
    </div>
  );

  // Tooltip content
  const AuthorTooltipContent = () => (
    <div className="text-center">
      <p className="font-semibold">{author.name}</p>
      {author.username && (
        <p className="text-sm text-gray-400">@{author.username}</p>
      )}
      {author.role && (
        <Badge variant="outline" className="mt-1 text-xs">
          {author.role}
        </Badge>
      )}
      {author.bio && (
        <p className="text-xs mt-2 max-w-xs">{author.bio}</p>
      )}
    </div>
  );

  // Popover content
  const PopoverContentComponent = () => (
    <Card className="w-80">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback className="text-lg">
                {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {getVerifiedIcon()}
            {getBadgeIcon()}
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{author.name}</h3>
          {author.username && (
            <p className="text-gray-600 dark:text-gray-400">@{author.username}</p>
          )}
          {author.role && (
            <Badge variant="secondary">{author.role}</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {author.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {author.bio}
          </p>
        )}
        
        <div className="flex justify-around text-center">
          {author.followerCount !== undefined && (
            <div>
              <p className="font-semibold">{author.followerCount.toLocaleString()}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Followers</p>
            </div>
          )}
          {author.postCount !== undefined && (
            <div>
              <p className="font-semibold">{author.postCount}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Posts</p>
            </div>
          )}
          {author.level !== undefined && (
            <div>
              <p className="font-semibold">Level {author.level}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {author.points} points
              </p>
            </div>
          )}
        </div>
        
        {author.isOnline !== undefined && (
          <>
            <Separator />
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div className={cn(
                'w-2 h-2 rounded-full',
                author.isOnline ? 'bg-green-500' : 'bg-gray-400'
              )} />
              <span className="text-gray-600 dark:text-gray-400">
                {author.isOnline ? 'Online' : author.lastSeen ? `Last seen ${author.lastSeen}` : 'Offline'}
              </span>
            </div>
          </>
        )}
        
        {onFollow && (
          <>
            <Separator />
            <Button
              variant={isFollowing ? "outline" : "default"}
              className="w-full"
              onClick={handleFollow}
              disabled={!enableInteractions}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );

  // Render with appropriate wrapper
  if (showPopover) {
    return (
      <div className={className}>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <div>
              <AvatarComponent />
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverContentComponent />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  if (showTooltip && !showPopover) {
    return (
      <div className={className}>
        <TooltipProvider>
          <Tooltip content={author.name}>
            <TooltipTrigger asChild>
              <div>
                <AvatarComponent />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <AuthorTooltipContent />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className={className}>
      <AvatarComponent />
    </div>
  );
};

// Avatar Group Component
export interface BlogAuthorAvatarGroupProps {
  authors: Author[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  overlap?: boolean;
  className?: string;
  onAuthorClick?: (author: Author) => void;
  showMoreTooltip?: boolean;
}

export const BlogAuthorAvatarGroup: React.FC<BlogAuthorAvatarGroupProps> = ({
  authors,
  max = 3,
  size = 'md',
  overlap = true,
  className,
  onAuthorClick,
  showMoreTooltip = true
}) => {
  const displayAuthors = authors.slice(0, max);
  const remainingCount = Math.max(0, authors.length - max);

  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'w-6 h-6';
      case 'sm': return 'w-8 h-8';
      case 'md': return 'w-10 h-10';
      case 'lg': return 'w-12 h-12';
      case 'xl': return 'w-16 h-16';
      default: return 'w-10 h-10';
    }
  };

  const getOverlapClasses = () => {
    if (!overlap) return 'space-x-2';
    return '-space-x-2';
  };

  return (
    <div className={cn('flex items-center', getOverlapClasses(), className)}>
      {displayAuthors.map((author, index) => (
        <motion.div
          key={author.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          style={{ zIndex: displayAuthors.length - index }}
        >
          <BlogAuthorAvatar
            author={author}
            size={size}
            onClick={onAuthorClick}
            borderStyle="simple"
            className={overlap ? 'ring-2 ring-white dark:ring-gray-900' : ''}
          />
        </motion.div>
      ))}
      
      {remainingCount > 0 && (
        <div className={cn(
          'flex items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400',
          getSizeClasses()
        )}>
          {showMoreTooltip ? (
            <TooltipProvider>
              <Tooltip content={`${remainingCount} more authors: ${authors.slice(max).map(a => a.name).join(', ')}`}>
                <TooltipTrigger asChild>
                  <span>+{remainingCount}</span>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span>+{remainingCount}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogAuthorAvatar;