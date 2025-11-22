'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EllipsisVerticalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShareIcon,
  BookmarkIcon,
  FlagIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { 
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { Card, CardContent } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';

import { cn } from '@/lib/utils';
import { ProductReview } from '@/types/review.types';

// Import all sub-components
import Avatar from './Avatar';
import Name from './Name';
import Location from './Location';
import Ratings from './Ratings';
import VerifiedBadge from './VerifiedBadge';
import DateComponent from './Date';

export type ReviewHeaderVariant = 
  | 'default' 
  | 'compact' 
  | 'detailed' 
  | 'card' 
  | 'minimal' 
  | 'mobile' 
  | 'desktop' 
  | 'list';

export type ReviewHeaderLayout = 
  | 'horizontal' 
  | 'vertical' 
  | 'stacked' 
  | 'inline' 
  | 'grid' 
  | 'flex' 
  | 'responsive';

export interface ReviewHeaderProps {
  review: ProductReview;
  variant?: ReviewHeaderVariant;
  layout?: ReviewHeaderLayout;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showAvatar?: boolean;
  showName?: boolean;
  showLocation?: boolean;
  showRatings?: boolean;
  showVerification?: boolean;
  showDate?: boolean;
  showActions?: boolean;
  showExpandToggle?: boolean;
  interactive?: boolean;
  collapsible?: boolean;
  colorScheme?: 'default' | 'minimal' | 'vibrant' | 'professional' | 'muted';
  className?: string;
  
  // Avatar props
  avatarVariant?: 'default' | 'compact' | 'detailed' | 'minimal';
  avatarSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  // Name props
  nameVariant?: 'default' | 'compact' | 'detailed' | 'minimal';
  
  // Location props
  locationVariant?: 'default' | 'compact' | 'detailed' | 'minimal';
  
  // Ratings props
  ratingsVariant?: 'default' | 'compact' | 'detailed' | 'card' | 'inline';
  
  // Verification props
  verificationVariant?: 'default' | 'compact' | 'detailed' | 'minimal' | 'tooltip';
  
  // Date props
  dateVariant?: 'default' | 'compact' | 'detailed' | 'relative' | 'badge';
  dateFormat?: 'short' | 'medium' | 'long' | 'relative';
  
  // Event handlers
  onAvatarClick?: (userId: string) => void;
  onNameClick?: (userId: string) => void;
  onLocationClick?: (location: string) => void;
  onRatingClick?: (rating: number) => void;
  onVerificationClick?: () => void;
  onDateClick?: (date: Date) => void;
  onExpandToggle?: (expanded: boolean) => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onReport?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
}

const ReviewHeader: React.FC<ReviewHeaderProps> = ({
  review,
  variant = 'default',
  layout = 'responsive',
  size = 'md',
  showAvatar = true,
  showName = true,
  showLocation = true,
  showRatings = true,
  showVerification = true,
  showDate = true,
  showActions = true,
  showExpandToggle = false,
  interactive = true,
  collapsible = false,
  colorScheme = 'default',
  className,
  
  // Component variants
  avatarVariant = 'default',
  avatarSize,
  nameVariant = 'default',
  locationVariant = 'default',
  ratingsVariant = 'default',
  verificationVariant = 'default',
  dateVariant = 'default',
  dateFormat = 'medium',
  
  // Event handlers
  onAvatarClick,
  onNameClick,
  onLocationClick,
  onRatingClick,
  onVerificationClick,
  onDateClick,
  onExpandToggle,
  onShare,
  onBookmark,
  onReport,
  onFollow,
  onMessage
}) => {
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Determine component sizes based on main size prop
  const componentSizes = useMemo(() => {
    const sizeMap = {
      xs: { avatar: 'xs' as const, components: 'xs' as const },
      sm: { avatar: 'sm' as const, components: 'sm' as const },
      md: { avatar: 'md' as const, components: 'md' as const },
      lg: { avatar: 'lg' as const, components: 'lg' as const },
      xl: { avatar: 'xl' as const, components: 'lg' as const }
    };
    return sizeMap[size];
  }, [size]);

  // Layout configurations
  const layoutConfigs = useMemo(() => ({
    horizontal: {
      container: 'flex items-center gap-4',
      userInfo: 'flex items-center gap-3 flex-1',
      details: 'flex items-center gap-4',
      actions: 'flex items-center gap-2'
    },
    vertical: {
      container: 'flex flex-col gap-3',
      userInfo: 'flex flex-col gap-2',
      details: 'flex flex-col gap-2',
      actions: 'flex justify-end gap-2'
    },
    stacked: {
      container: 'space-y-3',
      userInfo: 'flex items-center gap-3',
      details: 'grid grid-cols-2 gap-2',
      actions: 'flex justify-between items-center'
    },
    inline: {
      container: 'flex items-center gap-2 flex-wrap',
      userInfo: 'flex items-center gap-2',
      details: 'flex items-center gap-2',
      actions: 'flex items-center gap-1'
    },
    grid: {
      container: 'grid grid-cols-12 gap-4 items-center',
      userInfo: 'col-span-6 flex items-center gap-3',
      details: 'col-span-4 flex items-center justify-center gap-2',
      actions: 'col-span-2 flex items-center justify-end gap-2'
    },
    flex: {
      container: 'flex items-center justify-between gap-4',
      userInfo: 'flex items-center gap-3',
      details: 'flex items-center gap-4',
      actions: 'flex items-center gap-2'
    },
    responsive: {
      container: 'flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4',
      userInfo: 'flex items-center gap-3',
      details: 'flex flex-wrap items-center gap-2 sm:gap-4',
      actions: 'flex items-center gap-2 sm:ml-auto'
    }
  }), []);

  // Variant configurations
  const variantConfigs = useMemo(() => ({
    default: {
      container: 'p-4 bg-white border-b border-gray-200',
      spacing: 'gap-4',
      typography: 'text-base'
    },
    compact: {
      container: 'p-2 bg-white border-b border-gray-100',
      spacing: 'gap-2',
      typography: 'text-sm'
    },
    detailed: {
      container: 'p-6 bg-white border border-gray-200 rounded-lg shadow-sm',
      spacing: 'gap-6',
      typography: 'text-base'
    },
    card: {
      container: 'p-5 bg-white border border-gray-200 rounded-xl shadow-md',
      spacing: 'gap-5',
      typography: 'text-base'
    },
    minimal: {
      container: 'p-3 bg-transparent',
      spacing: 'gap-3',
      typography: 'text-sm'
    },
    mobile: {
      container: 'p-3 bg-white border-b border-gray-200',
      spacing: 'gap-3',
      typography: 'text-sm'
    },
    desktop: {
      container: 'p-6 bg-white border-b border-gray-200',
      spacing: 'gap-6',
      typography: 'text-base'
    },
    list: {
      container: 'p-3 bg-white hover:bg-gray-50 border-b border-gray-100',
      spacing: 'gap-3',
      typography: 'text-sm'
    }
  }), []);

  // Get current layout and variant config
  const currentLayoutConfig = layoutConfigs[layout];
  const currentVariantConfig = variantConfigs[variant];

  // Handle expand toggle
  const handleExpandToggle = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandToggle?.(newExpanded);
  }, [isExpanded, onExpandToggle]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback(() => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.();
  }, [isBookmarked, onBookmark]);

  // Animation variants
  const animationVariants = useMemo(() => ({
    collapsed: { height: 'auto', opacity: 1 },
    expanded: { height: 'auto', opacity: 1 },
    hidden: { height: 0, opacity: 0 },
    visible: { height: 'auto', opacity: 1 }
  }), []);

  // Render user info section
  const renderUserInfo = useCallback(() => (
    <div className={currentLayoutConfig.userInfo}>
      {showAvatar && (
        <Avatar
          review={review}
          size={avatarSize || componentSizes.avatar}
          interactive={interactive}
          onUserClick={onAvatarClick}
        />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {showName && (
            <Name
              review={review}
              variant={nameVariant === 'minimal' ? 'compact' : nameVariant}
              interactive={interactive}
              onUserClick={onNameClick}
            />
          )}
          
          {showVerification && (
            <VerifiedBadge
              review={review}
              variant={verificationVariant}
              size={componentSizes.components}
              colorScheme={colorScheme === 'muted' ? 'minimal' : colorScheme}
              onBadgeClick={onVerificationClick}
            />
          )}
        </div>
        
        {showLocation && (
          <Location
            review={review}
            variant={locationVariant === 'minimal' ? 'compact' : locationVariant}
            interactive={interactive}
            onLocationClick={(location) => onLocationClick?.(location?.city || location?.state || location?.country || 'Unknown')}
          />
        )}
      </div>
    </div>
  ), [
    currentLayoutConfig.userInfo,
    showAvatar,
    review,
    avatarVariant,
    avatarSize,
    componentSizes,
    interactive,
    colorScheme,
    onAvatarClick,
    showName,
    nameVariant,
    onNameClick,
    showVerification,
    verificationVariant,
    onVerificationClick,
    showLocation,
    locationVariant,
    onLocationClick
  ]);

  // Render details section
  const renderDetails = useCallback(() => (
    <div className={currentLayoutConfig.details}>
      {showRatings && (
        <Ratings
          review={review}
          variant={ratingsVariant}
          size={componentSizes.components === 'xs' ? 'sm' : componentSizes.components === 'md' ? 'default' : componentSizes.components}
          interactive={interactive}
          colorScheme={colorScheme === 'minimal' ? 'default' : colorScheme === 'vibrant' ? 'blue' : colorScheme === 'professional' ? 'green' : colorScheme === 'muted' ? 'amber' : 'default'}
          onRatingClick={(category, rating) => onRatingClick?.(rating)}
        />
      )}
      
      {showDate && (
        <DateComponent
          review={review}
          variant={dateVariant}
          format={dateFormat}
          size={componentSizes.components}
          showTooltip={interactive}
          colorScheme={colorScheme === 'professional' ? 'default' : colorScheme}
          onDateClick={onDateClick}
        />
      )}
    </div>
  ), [
    currentLayoutConfig.details,
    showRatings,
    review,
    ratingsVariant,
    componentSizes,
    interactive,
    colorScheme,
    onRatingClick,
    showDate,
    dateVariant,
    dateFormat,
    onDateClick
  ]);

  // Render actions section
  const renderActions = useCallback(() => {
    if (!showActions) return null;

    return (
      <div className={currentLayoutConfig.actions}>
        {/* Quick actions for mobile/compact variants */}
        {(variant === 'mobile' || variant === 'compact' || size === 'xs') ? (
          <DropdownMenu
            trigger={
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </Button>
            }
            items={[
              {
                key: 'share',
                label: 'Share Review',
                icon: ShareIcon,
                onClick: onShare
              },
              {
                key: 'bookmark',
                label: isBookmarked ? 'Remove Bookmark' : 'Bookmark',
                icon: isBookmarked ? BookmarkSolidIcon : BookmarkIcon,
                onClick: handleBookmarkToggle
              },
              {
                key: 'follow',
                label: 'Follow User',
                icon: UserPlusIcon,
                onClick: onFollow
              },
              {
                key: 'message',
                label: 'Message User',
                icon: ChatBubbleLeftIcon,
                onClick: onMessage
              },
              {
                key: 'report',
                label: 'Report Review',
                icon: FlagIcon,
                destructive: true,
                onClick: onReport
              }
            ]}
            align="end"
            className="w-48"
          />
        ) : (
          /* Full actions for larger variants */
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={onShare}
              className="h-8 px-2"
            >
              <ShareIcon className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleBookmarkToggle}
              className={cn(
                "h-8 px-2",
                isBookmarked && "text-blue-600"
              )}
            >
              {isBookmarked ? (
                <BookmarkSolidIcon className="w-4 h-4" />
              ) : (
                <BookmarkIcon className="w-4 h-4" />
              )}
            </Button>
            
            <DropdownMenu
              trigger={
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <EllipsisVerticalIcon className="w-4 h-4" />
                </Button>
              }
              items={[
                {
                  key: 'follow',
                  label: 'Follow',
                  icon: UserPlusIcon,
                  onClick: onFollow
                },
                {
                  key: 'message',
                  label: 'Message',
                  icon: ChatBubbleLeftIcon,
                  onClick: onMessage
                },
                {
                  key: 'report',
                  label: 'Report',
                  icon: FlagIcon,
                  destructive: true,
                  onClick: onReport
                }
              ]}
              align="end"
              className="w-40"
            />
          </>
        )}
        
        {/* Expand toggle */}
        {showExpandToggle && collapsible && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleExpandToggle}
            className="h-8 px-2 ml-2"
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    );
  }, [
    showActions,
    currentLayoutConfig.actions,
    variant,
    size,
    onShare,
    handleBookmarkToggle,
    isBookmarked,
    onFollow,
    onMessage,
    onReport,
    showExpandToggle,
    collapsible,
    handleExpandToggle,
    isExpanded
  ]);

  // Main content based on layout
  const renderContent = useCallback(() => {
    // Card-specific layout
    if (variant === 'card') {
      return (
        <Card className={cn(currentVariantConfig.container, className)}>
          <CardContent className="p-0">
            <div className={cn(currentLayoutConfig.container, currentVariantConfig.spacing)}>
              {renderUserInfo()}
              {renderDetails()}
              {renderActions()}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Grid-specific layout
    if (layout === 'grid') {
      return (
        <div className={cn(
          currentVariantConfig.container,
          currentLayoutConfig.container,
          currentVariantConfig.spacing,
          className
        )}>
          {renderUserInfo()}
          {renderDetails()}
          {renderActions()}
        </div>
      );
    }

    // Stacked layout with collapsible details
    if (layout === 'stacked' && collapsible) {
      return (
        <div className={cn(currentVariantConfig.container, className)}>
          <div className="flex items-center justify-between">
            {renderUserInfo()}
            {renderActions()}
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                variants={animationVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.2 }}
              >
                <Separator className="my-3" />
                {renderDetails()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Default layout
    return (
      <div className={cn(
        currentVariantConfig.container,
        currentLayoutConfig.container,
        currentVariantConfig.spacing,
        className
      )}>
        {renderUserInfo()}
        {renderDetails()}
        {renderActions()}
      </div>
    );
  }, [
    variant,
    currentVariantConfig,
    className,
    currentLayoutConfig,
    renderUserInfo,
    renderDetails,
    renderActions,
    layout,
    collapsible,
    isExpanded,
    animationVariants
  ]);

  return renderContent();
};

export default ReviewHeader;