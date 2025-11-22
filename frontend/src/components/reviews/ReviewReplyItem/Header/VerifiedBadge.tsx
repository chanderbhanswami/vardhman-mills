'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  CpuChipIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import {
  ShieldCheckIcon as ShieldCheckIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';

import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { ReviewUser } from '@/types/review.types';

// Types
export interface VerifiedBadgeProps {
  user: ReviewUser;
  showTooltip?: boolean;
  showTrustScore?: boolean;
  showReputationLevel?: boolean;
  showBadgeDetails?: boolean;
  animated?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'badge' | 'detailed';
  className?: string;

  // Event handlers
  onClick?: (user: ReviewUser) => void;
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

const SIZE_CONFIGS = {
  xs: {
    icon: 'w-3 h-3',
    text: 'text-xs',
    badge: 'text-xs px-1 py-0.5'
  },
  sm: {
    icon: 'w-3 h-3',
    text: 'text-xs',
    badge: 'text-xs px-1.5 py-0.5'
  },
  md: {
    icon: 'w-4 h-4',
    text: 'text-sm',
    badge: 'text-xs px-1.5 py-0.5'
  },
  lg: {
    icon: 'w-5 h-5',
    text: 'text-base',
    badge: 'text-sm px-2 py-1'
  }
} as const;

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  user,
  showTooltip = true,
  showTrustScore = false,
  showReputationLevel = false,
  showBadgeDetails = false,
  animated = true,
  size = 'md',
  variant = 'icon',
  className,
  onClick,
  onAnalyticsEvent
}) => {
  // Get size configuration
  const sizeConfig = SIZE_CONFIGS[size];

  // Handle click
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(user);
      onAnalyticsEvent?.('verified_badge_click', {
        userId: user.id,
        isVerified: user.isVerified,
        trustScore: user.trustScore
      });
    }
  }, [onClick, user, onAnalyticsEvent]);

  // Generate verification level and description
  const getVerificationInfo = useCallback(() => {
    const info = {
      level: 'basic',
      color: 'blue',
      icon: ShieldCheckIconSolid,
      title: 'Verified User',
      description: 'This user has been verified'
    };

    // Enhanced verification based on trust score
    if (user.trustScore !== undefined) {
      if (user.trustScore >= 95) {
        info.level = 'elite';
        info.color = 'purple';
        info.icon = TrophyIcon;
        info.title = 'Elite Verified';
        info.description = `Elite verified user with ${user.trustScore}% trust score`;
      } else if (user.trustScore >= 85) {
        info.level = 'premium';
        info.color = 'yellow';
        info.icon = StarIconSolid;
        info.title = 'Premium Verified';
        info.description = `Premium verified user with ${user.trustScore}% trust score`;
      } else if (user.trustScore >= 70) {
        info.level = 'trusted';
        info.color = 'green';
        info.icon = ShieldCheckIconSolid;
        info.title = 'Trusted Verified';
        info.description = `Trusted verified user with ${user.trustScore}% trust score`;
      }
    }

    // Additional verification from reputation
    if (user.reputationScore !== undefined && user.reputationScore >= 1000) {
      info.level = 'expert';
      info.color = 'indigo';
      info.icon = CpuChipIcon;
      info.title = 'Expert Verified';
      info.description = `Expert user with ${user.reputationScore} reputation points`;
    }

    return info;
  }, [user.trustScore, user.reputationScore]);

  // Generate tooltip content
  const generateTooltipContent = useCallback(() => {
    if (!showTooltip) return '';

    const verificationInfo = getVerificationInfo();
    const parts = [verificationInfo.description];

    if (showTrustScore && user.trustScore !== undefined) {
      parts.push(`Trust Score: ${user.trustScore}%`);
    }

    if (showReputationLevel && user.reputationScore !== undefined) {
      const level = user.reputationScore >= 1000 ? 'High' :
                   user.reputationScore >= 500 ? 'Medium' : 'Basic';
      parts.push(`Reputation: ${level} (${user.reputationScore} points)`);
    }

    if (showBadgeDetails && user.badges && user.badges.length > 0) {
      const badgeNames = user.badges.map(badge => badge.name).join(', ');
      parts.push(`Badges: ${badgeNames}`);
    }

    if (user.reviewCount > 0) {
      parts.push(`${user.reviewCount} reviews written`);
    }

    return parts.join('\n');
  }, [
    showTooltip, getVerificationInfo, showTrustScore, user.trustScore,
    showReputationLevel, user.reputationScore, showBadgeDetails, 
    user.badges, user.reviewCount
  ]);

  // Don't render if user is not verified
  if (!user.isVerified) {
    return null;
  }

  const verificationInfo = getVerificationInfo();
  const IconComponent = verificationInfo.icon;
  const tooltipContent = generateTooltipContent();

  // Color classes based on verification level
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    indigo: 'text-indigo-500'
  };

  const bgColorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700'
  };

  // Render icon variant
  const renderIcon = () => (
    <motion.div
      className={cn(
        'inline-flex items-center',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={handleClick}
      whileHover={animated ? { scale: 1.1 } : undefined}
      whileTap={animated ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.2 }}
    >
      <IconComponent 
        className={cn(
          sizeConfig.icon,
          colorClasses[verificationInfo.color as keyof typeof colorClasses]
        )} 
      />
    </motion.div>
  );

  // Render badge variant
  const renderBadge = () => (
    <motion.div
      className={cn('inline-flex', onClick && 'cursor-pointer', className)}
      onClick={handleClick}
      whileHover={animated ? { scale: 1.02 } : undefined}
      whileTap={animated ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
    >
      <Badge
        variant="outline"
        className={cn(
          sizeConfig.badge,
          bgColorClasses[verificationInfo.color as keyof typeof bgColorClasses]
        )}
      >
        <IconComponent className={cn(sizeConfig.icon, 'mr-1')} />
        {verificationInfo.title}
      </Badge>
    </motion.div>
  );

  // Render detailed variant
  const renderDetailed = () => (
    <motion.div
      className={cn(
        'inline-flex items-center gap-1',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={handleClick}
      whileHover={animated ? { scale: 1.02 } : undefined}
      whileTap={animated ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
    >
      <IconComponent 
        className={cn(
          sizeConfig.icon,
          colorClasses[verificationInfo.color as keyof typeof colorClasses]
        )} 
      />
      <div className="flex flex-col">
        <span className={cn(sizeConfig.text, 'font-medium text-gray-900')}>
          {verificationInfo.title}
        </span>
        {showTrustScore && user.trustScore !== undefined && (
          <span className="text-xs text-gray-500">
            {user.trustScore}% trust
          </span>
        )}
      </div>
    </motion.div>
  );

  // Select render method based on variant
  const renderContent = () => {
    switch (variant) {
      case 'badge':
        return renderBadge();
      case 'detailed':
        return renderDetailed();
      default:
        return renderIcon();
    }
  };

  const content = renderContent();

  // Wrap with tooltip if enabled
  if (showTooltip && tooltipContent) {
    return (
      <Tooltip content={<div className="whitespace-pre-line">{tooltipContent}</div>}>
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default VerifiedBadge;