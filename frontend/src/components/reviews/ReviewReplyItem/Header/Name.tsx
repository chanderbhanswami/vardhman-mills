'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid
} from '@heroicons/react/24/solid';

import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { ReviewUser } from '@/types/review.types';

// Types
export interface NameProps {
  user: ReviewUser;
  showVerification?: boolean;
  showBadges?: boolean;
  showTrustScore?: boolean;
  showRating?: boolean;
  showHoverEffect?: boolean;
  showPrivacyIndicator?: boolean;
  truncateAt?: number;
  maxWidth?: string;
  clickable?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'detailed' | 'compact';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;

  // Event handlers
  onClick?: (user: ReviewUser) => void;
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

const SIZE_CONFIGS = {
  xs: {
    text: 'text-xs',
    icon: 'w-3 h-3',
    badge: 'text-xs px-1 py-0.5'
  },
  sm: {
    text: 'text-sm',
    icon: 'w-3 h-3',
    badge: 'text-xs px-1.5 py-0.5'
  },
  md: {
    text: 'text-sm',
    icon: 'w-4 h-4',
    badge: 'text-xs px-1.5 py-0.5'
  },
  lg: {
    text: 'text-base',
    icon: 'w-4 h-4',
    badge: 'text-sm px-2 py-1'
  }
} as const;

const FONT_WEIGHTS = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
} as const;

const Name: React.FC<NameProps> = ({
  user,
  showVerification = true,
  showBadges = false,
  showTrustScore = false,
  showRating = false,
  showHoverEffect = true,
  showPrivacyIndicator = false,
  truncateAt = 20,
  maxWidth,
  clickable = true,
  size = 'md',
  variant = 'default',
  fontWeight = 'medium',
  className,
  onClick,
  onAnalyticsEvent
}) => {

  // Get size configuration
  const sizeConfig = SIZE_CONFIGS[size];

  // Format display name
  const displayName = user.displayName || 'Anonymous User';
  
  // Truncate name if needed
  const truncatedName = truncateAt && displayName.length > truncateAt 
    ? `${displayName.substring(0, truncateAt)}...` 
    : displayName;

  // Handle click
  const handleClick = useCallback(() => {
    if (!clickable || !onClick) return;
    
    onClick(user);
    onAnalyticsEvent?.('user_name_click', {
      userId: user.id,
      displayName: user.displayName
    });
  }, [clickable, onClick, user, onAnalyticsEvent]);

  // Render verification indicators
  const renderVerificationIndicators = useCallback(() => {
    if (!showVerification && !showBadges) return null;

    const indicators = [];

    // Verified badge
    if (showVerification && user.isVerified) {
      indicators.push(
        <Tooltip key="verified" content="Verified user">
          <ShieldCheckIconSolid className={cn(sizeConfig.icon, 'text-blue-500 flex-shrink-0')} />
        </Tooltip>
      );
    }

    // Trust score indicator
    if (showTrustScore && user.trustScore !== undefined && user.trustScore >= 70) {
      const trustColor = user.trustScore >= 90 ? 'text-green-500' : 
                       user.trustScore >= 80 ? 'text-blue-500' : 'text-yellow-500';
      
      indicators.push(
        <Tooltip key="trust" content={`Trust Score: ${user.trustScore}%`}>
          <ShieldCheckIcon className={cn(sizeConfig.icon, trustColor, 'flex-shrink-0')} />
        </Tooltip>
      );
    }

    // Rating indicator
    if (showRating && user.averageRating !== undefined && user.averageRating >= 4) {
      indicators.push(
        <Tooltip key="rating" content={`Average Rating: ${user.averageRating.toFixed(1)}/5`}>
          <StarIconSolid className={cn(sizeConfig.icon, 'text-yellow-500 flex-shrink-0')} />
        </Tooltip>
      );
    }

    // Premium badges from user.badges
    if (showBadges && user.badges && user.badges.length > 0) {
      // Show top priority badge
      const topBadge = user.badges[0]; // Assuming badges are sorted by priority
      
      indicators.push(
        <Tooltip key={topBadge.id} content={topBadge.description}>
          <div className={cn(sizeConfig.icon, 'flex-shrink-0')}>
            {topBadge.name.toLowerCase().includes('premium') && (
              <StarIconSolid className={cn(sizeConfig.icon, 'text-yellow-500')} />
            )}
            {topBadge.name.toLowerCase().includes('expert') && (
              <StarIconSolid className={cn(sizeConfig.icon, 'text-purple-500')} />
            )}
          </div>
        </Tooltip>
      );
    }

    return indicators.length > 0 ? (
      <div className="flex items-center gap-1 ml-1">
        {indicators}
      </div>
    ) : null;
  }, [
    showVerification, showBadges, showTrustScore, showRating, user, sizeConfig.icon
  ]);

  // Render user stats (for detailed variant)
  const renderUserStats = useCallback(() => {
    if (variant !== 'detailed') return null;

    const stats = [];

    if (user.reviewCount > 0) {
      stats.push(
        <span key="reviews" className="text-xs text-gray-500">
          {user.reviewCount} reviews
        </span>
      );
    }

    if (user.helpfulVoteCount > 0) {
      stats.push(
        <span key="helpful" className="text-xs text-gray-500">
          {user.helpfulVoteCount} helpful
        </span>
      );
    }

    return stats.length > 0 ? (
      <div className="flex items-center gap-2 mt-0.5">
        {stats}
      </div>
    ) : null;
  }, [variant, user.reviewCount, user.helpfulVoteCount]);

  // Render reputation indicators
  const renderReputationIndicators = useCallback(() => {
    if (variant === 'minimal' || variant === 'compact') return null;

    const indicators = [];

    // Reputation score
    if (user.reputationScore !== undefined && user.reputationScore > 0) {
      const reputationLevel = user.reputationScore >= 1000 ? 'High' :
                             user.reputationScore >= 500 ? 'Medium' : 'Low';
      
      const reputationColor = user.reputationScore >= 1000 ? 'text-green-600' :
                             user.reputationScore >= 500 ? 'text-blue-600' : 'text-gray-600';

      indicators.push(
        <Tooltip key="reputation" content={`Reputation: ${user.reputationScore} (${reputationLevel})`}>
          <Badge variant="outline" className={cn(sizeConfig.badge, reputationColor)}>
            {reputationLevel}
          </Badge>
        </Tooltip>
      );
    }

    // Expertise areas
    if (user.expertiseAreas && user.expertiseAreas.length > 0 && variant === 'detailed') {
      const primaryExpertise = user.expertiseAreas[0];
      indicators.push(
        <Tooltip key="expertise" content={`Expert in: ${user.expertiseAreas.join(', ')}`}>
          <Badge variant="secondary" className={sizeConfig.badge}>
            {primaryExpertise}
          </Badge>
        </Tooltip>
      );
    }

    return indicators.length > 0 ? (
      <div className="flex items-center gap-1 mt-0.5">
        {indicators}
      </div>
    ) : null;
  }, [variant, user.reputationScore, user.expertiseAreas, sizeConfig.badge]);

  // Privacy indicator
  const renderPrivacyIndicator = useCallback(() => {
    if (!showPrivacyIndicator || user.showRealName) return null;

    return (
      <Tooltip content="This user chooses to display a username instead of their real name">
        <UserIcon className={cn(sizeConfig.icon, 'text-gray-400 ml-1 flex-shrink-0')} />
      </Tooltip>
    );
  }, [showPrivacyIndicator, user.showRealName, sizeConfig.icon]);

  return (
    <div className={cn('inline-flex flex-col', className)}>
      {/* Main name row */}
      <div className="flex items-center">
        <motion.span
          className={cn(
            sizeConfig.text,
            FONT_WEIGHTS[fontWeight],
            'text-gray-900 transition-colors',
            clickable && showHoverEffect && 'hover:text-blue-600 cursor-pointer',
            maxWidth && 'truncate',
            !clickable && 'select-text'
          )}
          style={maxWidth ? { maxWidth } : undefined}
          onClick={handleClick}
          whileHover={clickable && showHoverEffect ? { scale: 1.02 } : undefined}
          transition={{ duration: 0.2 }}
        >
          {truncatedName}
        </motion.span>
        
        {renderVerificationIndicators()}
        {renderPrivacyIndicator()}
      </div>
      
      {/* User stats (detailed variant) */}
      {renderUserStats()}
      
      {/* Reputation indicators */}
      {renderReputationIndicators()}
    </div>
  );
};

export default Name;
