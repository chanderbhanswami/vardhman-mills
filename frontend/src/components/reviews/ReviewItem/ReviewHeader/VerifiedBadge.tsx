'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckBadgeIcon,
  ShieldCheckIcon,
  TrophyIcon,
  StarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/solid';
import { 
  InformationCircleIcon,
  EyeIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { Progress } from '@/components/ui/Progress';

import { cn } from '@/lib/utils';
import { ProductReview } from '@/types/review.types';

// Verification levels and types
export type VerificationLevel = 
  | 'basic' 
  | 'enhanced' 
  | 'premium' 
  | 'expert' 
  | 'professional' 
  | 'vip' 
  | 'legacy' 
  | 'community';

export type VerificationType = 
  | 'email' 
  | 'phone' 
  | 'identity' 
  | 'purchase' 
  | 'expert' 
  | 'business' 
  | 'influencer' 
  | 'reviewer' 
  | 'longtime' 
  | 'community' 
  | 'partner' 
  | 'staff';

export type BadgeVariant = 
  | 'default' 
  | 'compact' 
  | 'detailed' 
  | 'minimal' 
  | 'tooltip' 
  | 'dialog' 
  | 'inline' 
  | 'stacked';

export interface VerificationInfo {
  level: VerificationLevel;
  types: VerificationType[];
  verifiedAt: Date;
  trustScore: number;
  badges: {
    type: VerificationType;
    title: string;
    description: string;
    icon: string;
    color: string;
    achievedAt: Date;
    criteria: string[];
  }[];
  benefits: string[];
  nextLevel?: {
    level: VerificationLevel;
    progress: number;
    requirements: string[];
  };
  stats: {
    totalReviews: number;
    helpfulVotes: number;
    followersCount: number;
    yearsActive: number;
    categoriesReviewed: string[];
  };
}

export interface VerifiedBadgeProps {
  review: ProductReview;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLevel?: boolean;
  showTooltip?: boolean;
  showAnimation?: boolean;
  colorScheme?: 'default' | 'minimal' | 'vibrant' | 'professional';
  className?: string;
  onBadgeClick?: (type: VerificationType, level: VerificationLevel) => void;
  onDetailsView?: (verification: VerificationInfo) => void;
  onReportClick?: (reason: string) => void;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  review,
  variant = 'default',
  size = 'md',
  showLevel = true,
  showTooltip = true,
  showAnimation = true,
  colorScheme = 'default',
  className,
  onBadgeClick,
  onDetailsView,
  onReportClick
}) => {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Mock verification data - in real app, this would come from the review object
  const verificationInfo: VerificationInfo = useMemo(() => ({
    level: 'premium' as VerificationLevel,
    types: ['email', 'phone', 'purchase', 'expert'] as VerificationType[],
    verifiedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
    trustScore: 92,
    badges: [
      {
        type: 'email' as VerificationType,
        title: 'Email Verified',
        description: 'Email address has been confirmed',
        icon: 'email',
        color: 'blue',
        achievedAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
        criteria: ['Valid email address', 'Verification link clicked', 'Account active']
      },
      {
        type: 'phone' as VerificationType,
        title: 'Phone Verified',
        description: 'Phone number has been confirmed',
        icon: 'phone',
        color: 'green',
        achievedAt: new Date(Date.now() - 380 * 24 * 60 * 60 * 1000),
        criteria: ['Valid phone number', 'SMS verification completed', 'Number active']
      },
      {
        type: 'purchase' as VerificationType,
        title: 'Verified Purchase',
        description: 'Confirmed purchase of reviewed product',
        icon: 'purchase',
        color: 'purple',
        achievedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        criteria: ['Purchase receipt verified', 'Product ownership confirmed', 'Timeline matches']
      },
      {
        type: 'expert' as VerificationType,
        title: 'Expert Reviewer',
        description: 'Recognized expertise in product category',
        icon: 'expert',
        color: 'gold',
        achievedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        criteria: ['50+ reviews in category', '85%+ helpful rating', 'Industry recognition']
      }
    ],
    benefits: [
      'Higher review visibility',
      'Trusted reviewer badge',
      'Early access to products',
      'Priority customer support',
      'Exclusive reviewer community'
    ],
    nextLevel: {
      level: 'expert' as VerificationLevel,
      progress: 65,
      requirements: [
        'Complete 25 more verified reviews',
        'Maintain 90%+ helpfulness rating',
        'Get 100 more helpful votes',
        'Review in 2 more categories'
      ]
    },
    stats: {
      totalReviews: 127,
      helpfulVotes: 1843,
      followersCount: 456,
      yearsActive: 3,
      categoriesReviewed: ['Electronics', 'Home & Garden', 'Books', 'Health', 'Sports']
    }
  }), []);

  // Badge icons mapping
  const badgeIcons = useMemo(() => ({
    email: CheckBadgeIcon,
    phone: ShieldCheckIcon,
    identity: ShieldCheckIcon,
    purchase: CheckBadgeIcon,
    expert: AcademicCapIcon,
    business: BuildingOfficeIcon,
    influencer: StarIcon,
    reviewer: TrophyIcon,
    longtime: ClockIcon,
    community: UserGroupIcon,
    partner: TrophyIcon,
    staff: GlobeAltIcon
  }), []);

  // Color schemes
  const colorSchemes = useMemo(() => ({
    default: {
      basic: 'bg-gray-100 text-gray-700 border-gray-300',
      enhanced: 'bg-blue-100 text-blue-700 border-blue-300',
      premium: 'bg-purple-100 text-purple-700 border-purple-300',
      expert: 'bg-orange-100 text-orange-700 border-orange-300',
      professional: 'bg-green-100 text-green-700 border-green-300',
      vip: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-400',
      legacy: 'bg-indigo-100 text-indigo-700 border-indigo-300',
      community: 'bg-pink-100 text-pink-700 border-pink-300'
    },
    minimal: {
      basic: 'bg-gray-50 text-gray-600 border-gray-200',
      enhanced: 'bg-blue-50 text-blue-600 border-blue-200',
      premium: 'bg-purple-50 text-purple-600 border-purple-200',
      expert: 'bg-orange-50 text-orange-600 border-orange-200',
      professional: 'bg-green-50 text-green-600 border-green-200',
      vip: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      legacy: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      community: 'bg-pink-50 text-pink-600 border-pink-200'
    },
    vibrant: {
      basic: 'bg-gray-200 text-gray-800 border-gray-400',
      enhanced: 'bg-blue-200 text-blue-800 border-blue-400',
      premium: 'bg-purple-200 text-purple-800 border-purple-400',
      expert: 'bg-orange-200 text-orange-800 border-orange-400',
      professional: 'bg-green-200 text-green-800 border-green-400',
      vip: 'bg-gradient-to-r from-yellow-200 to-orange-200 text-yellow-900 border-yellow-500',
      legacy: 'bg-indigo-200 text-indigo-800 border-indigo-400',
      community: 'bg-pink-200 text-pink-800 border-pink-400'
    },
    professional: {
      basic: 'bg-slate-100 text-slate-700 border-slate-300',
      enhanced: 'bg-sky-100 text-sky-700 border-sky-300',
      premium: 'bg-violet-100 text-violet-700 border-violet-300',
      expert: 'bg-amber-100 text-amber-700 border-amber-300',
      professional: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      vip: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-400',
      legacy: 'bg-slate-100 text-slate-700 border-slate-300',
      community: 'bg-rose-100 text-rose-700 border-rose-300'
    }
  }), []);

  // Size configurations
  const sizeConfigs = useMemo(() => ({
    xs: {
      badge: 'px-1.5 py-0.5 text-xs',
      icon: 'w-3 h-3',
      spacing: 'gap-1'
    },
    sm: {
      badge: 'px-2 py-1 text-xs',
      icon: 'w-3.5 h-3.5',
      spacing: 'gap-1.5'
    },
    md: {
      badge: 'px-2.5 py-1.5 text-sm',
      icon: 'w-4 h-4',
      spacing: 'gap-2'
    },
    lg: {
      badge: 'px-3 py-2 text-base',
      icon: 'w-5 h-5',
      spacing: 'gap-2.5'
    }
  }), []);

  // Get level display name
  const getLevelDisplayName = useCallback((level: VerificationLevel): string => {
    const names = {
      basic: 'Basic',
      enhanced: 'Enhanced',
      premium: 'Premium',
      expert: 'Expert',
      professional: 'Professional',
      vip: 'VIP',
      legacy: 'Legacy',
      community: 'Community'
    };
    return names[level] || level;
  }, []);

  // Get badge colors
  const getBadgeColors = useCallback((level: VerificationLevel): string => {
    return colorSchemes[colorScheme][level] || colorSchemes[colorScheme].basic;
  }, [colorScheme, colorSchemes]);

  // Handle badge click
  const handleBadgeClick = useCallback((type: VerificationType, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (onBadgeClick) {
      onBadgeClick(type, verificationInfo.level);
    } else {
      setShowDetailsDialog(true);
    }
  }, [onBadgeClick, verificationInfo.level]);

  // Handle details view
  const handleDetailsView = useCallback(() => {
    if (onDetailsView) {
      onDetailsView(verificationInfo);
    } else {
      setShowDetailsDialog(true);
    }
  }, [onDetailsView, verificationInfo]);

  // Animation variants
  const animationVariants = useMemo(() => ({
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  }), []);

  // Render primary badge
  const renderPrimaryBadge = useCallback(() => {
    const primaryType = verificationInfo.types[0];
    const IconComponent = badgeIcons[primaryType] || CheckBadgeIcon;
    const sizeConfig = sizeConfigs[size];
    const badgeColors = getBadgeColors(verificationInfo.level);

    const badgeContent = (
      <motion.div
        variants={showAnimation ? animationVariants : undefined}
        initial={showAnimation ? "initial" : undefined}
        animate={showAnimation ? "animate" : undefined}
        whileHover={showAnimation ? "hover" : undefined}
        whileTap={showAnimation ? "tap" : undefined}
        className={cn(
          "inline-flex items-center border rounded-full font-medium cursor-pointer transition-all duration-200",
          sizeConfig.badge,
          sizeConfig.spacing,
          badgeColors,
          isHovered && "shadow-md",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => handleBadgeClick(primaryType, e)}
      >
        <IconComponent className={cn("flex-shrink-0", sizeConfig.icon)} />
        {variant !== 'minimal' && (
          <span>
            {variant === 'compact' ? 'Verified' : `Verified ${showLevel ? getLevelDisplayName(verificationInfo.level) : ''}`}
          </span>
        )}
        {variant === 'detailed' && (
          <Badge 
            variant="secondary" 
            className="ml-1 text-xs bg-white/20"
          >
            {verificationInfo.trustScore}%
          </Badge>
        )}
      </motion.div>
    );

    if (showTooltip && variant !== 'tooltip') {
      return (
        <Tooltip
          content={
            <div className="space-y-2">
              <div className="font-medium">
                {getLevelDisplayName(verificationInfo.level)} Verified User
              </div>
              <div className="text-sm text-gray-600">
                Trust Score: {verificationInfo.trustScore}%
              </div>
              <div className="text-xs">
                Verified: {verificationInfo.types.join(', ')}
              </div>
            </div>
          }
        >
          {badgeContent}
        </Tooltip>
      );
    }

    return badgeContent;
  }, [
    verificationInfo, 
    badgeIcons, 
    sizeConfigs, 
    size, 
    getBadgeColors, 
    animationVariants, 
    showAnimation, 
    isHovered, 
    className, 
    variant, 
    showLevel, 
    getLevelDisplayName, 
    handleBadgeClick, 
    showTooltip
  ]);

  // Render stacked badges
  const renderStackedBadges = useCallback(() => {
    const sizeConfig = sizeConfigs[size];

    return (
      <div className="flex flex-wrap gap-1">
        {verificationInfo.types.slice(0, 3).map((type, index) => {
          const IconComponent = badgeIcons[type] || CheckBadgeIcon;
          const badge = verificationInfo.badges.find(b => b.type === type);
          
          return (
            <motion.div
              key={type}
              variants={showAnimation ? animationVariants : undefined}
              initial={showAnimation ? "initial" : undefined}
              animate={showAnimation ? "animate" : undefined}
              transition={showAnimation ? { delay: index * 0.1 } : undefined}
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 bg-white border rounded text-xs font-medium cursor-pointer",
                sizeConfig.spacing,
                badge?.color === 'blue' && "border-blue-200 text-blue-700",
                badge?.color === 'green' && "border-green-200 text-green-700",
                badge?.color === 'purple' && "border-purple-200 text-purple-700",
                badge?.color === 'gold' && "border-yellow-200 text-yellow-700",
                !badge && "border-gray-200 text-gray-700"
              )}
              onClick={(e) => handleBadgeClick(type, e)}
            >
              <IconComponent className="w-3 h-3 flex-shrink-0" />
              <span className="ml-1 capitalize">{type}</span>
            </motion.div>
          );
        })}
        {verificationInfo.types.length > 3 && (
          <Badge 
            variant="outline" 
            className="text-xs cursor-pointer"
            onClick={handleDetailsView}
          >
            +{verificationInfo.types.length - 3}
          </Badge>
        )}
      </div>
    );
  }, [
    verificationInfo, 
    sizeConfigs, 
    size, 
    badgeIcons, 
    showAnimation, 
    animationVariants, 
    handleBadgeClick, 
    handleDetailsView
  ]);

  // Render details dialog
  const renderDetailsDialog = useCallback(() => (
    <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckBadgeIcon className="w-6 h-6 text-blue-600" />
            Verification Details
          </DialogTitle>
          <DialogDescription>
            Complete verification information for {review.user.displayName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main verification info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Level & Trust Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Verification Level</span>
                  <Badge className={getBadgeColors(verificationInfo.level)}>
                    {getLevelDisplayName(verificationInfo.level)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Verified on {verificationInfo.verifiedAt.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Trust Score</span>
                      <span className="font-medium">{verificationInfo.trustScore}%</span>
                    </div>
                    <Progress value={verificationInfo.trustScore} className="h-2" />
                  </div>
                  
                  {verificationInfo.nextLevel && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress to {getLevelDisplayName(verificationInfo.nextLevel.level)}</span>
                        <span className="font-medium">{verificationInfo.nextLevel.progress}%</span>
                      </div>
                      <Progress value={verificationInfo.nextLevel.progress} className="h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Verification Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Badges</CardTitle>
                <CardDescription>
                  All verified credentials and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {verificationInfo.badges.map((badge) => {
                    const IconComponent = badgeIcons[badge.type] || CheckBadgeIcon;
                    
                    return (
                      <div 
                        key={badge.type}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            badge.color === 'blue' && "bg-blue-100 text-blue-600",
                            badge.color === 'green' && "bg-green-100 text-green-600",
                            badge.color === 'purple' && "bg-purple-100 text-purple-600",
                            badge.color === 'gold' && "bg-yellow-100 text-yellow-600"
                          )}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{badge.title}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              {badge.description}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Achieved {badge.achievedAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-xs font-medium text-gray-700 mb-1">
                            Criteria Met:
                          </div>
                          <ul className="text-xs text-gray-600 space-y-0.5">
                            {badge.criteria.map((criterion, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <CheckBadgeIcon className="w-3 h-3 text-green-500 flex-shrink-0" />
                                {criterion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Benefits</CardTitle>
                <CardDescription>
                  Perks and privileges of verified status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {verificationInfo.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckBadgeIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Reviewer Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Reviews</span>
                  <span className="font-medium">{verificationInfo.stats.totalReviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Helpful Votes</span>
                  <span className="font-medium">{verificationInfo.stats.helpfulVotes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Followers</span>
                  <span className="font-medium">{verificationInfo.stats.followersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Years Active</span>
                  <span className="font-medium">{verificationInfo.stats.yearsActive}</span>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories Reviewed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {verificationInfo.stats.categoriesReviewed.map((category) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Level Requirements */}
            {verificationInfo.nextLevel && (
              <Card>
                <CardHeader>
                  <CardTitle>Next Level</CardTitle>
                  <CardDescription>
                    Requirements for {getLevelDisplayName(verificationInfo.nextLevel.level)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {verificationInfo.nextLevel.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <ClockIcon className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('/verification-help', '_blank')}
                  >
                    <InformationCircleIcon className="w-4 h-4 mr-1" />
                    Learn More
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => onReportClick?.('verification-issue')}
                  >
                    <FlagIcon className="w-4 h-4 mr-1" />
                    Report Issue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ), [
    showDetailsDialog,
    review.user.displayName, 
    verificationInfo, 
    getBadgeColors, 
    getLevelDisplayName, 
    badgeIcons, 
    onReportClick
  ]);

  // Main render based on variant
  if (variant === 'stacked') {
    return (
      <div className={className}>
        {renderStackedBadges()}
        {renderDetailsDialog()}
      </div>
    );
  }

  if (variant === 'tooltip') {
    return (
      <Tooltip
        content={
          <div className="space-y-3 max-w-xs">
            <div className="font-medium">
              {getLevelDisplayName(verificationInfo.level)} Verified
            </div>
            <div className="text-sm space-y-1">
              <div>Trust Score: {verificationInfo.trustScore}%</div>
              <div>Verified: {verificationInfo.verifiedAt.toLocaleDateString()}</div>
            </div>
            <Separator />
            <div className="space-y-1">
              {verificationInfo.types.slice(0, 3).map((type) => {
                const badge = verificationInfo.badges.find(b => b.type === type);
                return (
                  <div key={type} className="flex items-center gap-2 text-xs">
                    <CheckBadgeIcon className="w-3 h-3 text-green-500" />
                    {badge?.title || type}
                  </div>
                );
              })}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-xs"
              onClick={handleDetailsView}
            >
              <EyeIcon className="w-3 h-3 mr-1" />
              View Details
            </Button>
          </div>
        }
      >
        <div className={className}>
          {renderPrimaryBadge()}
        </div>
      </Tooltip>
    );
  }

  if (variant === 'dialog') {
    return (
      <div className={className}>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDetailsView}
          className="h-auto py-1"
        >
          <CheckBadgeIcon className="w-4 h-4 mr-1 text-blue-600" />
          Verified {showLevel && getLevelDisplayName(verificationInfo.level)}
        </Button>
        {renderDetailsDialog()}
      </div>
    );
  }

  return (
    <div className={className}>
      {renderPrimaryBadge()}
      <AnimatePresence>
        {showDetailsDialog && renderDetailsDialog()}
      </AnimatePresence>
    </div>
  );
};

export default VerifiedBadge;
