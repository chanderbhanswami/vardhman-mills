'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  LinkIcon,
  PencilIcon,
  ShareIcon,
  StarIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  TrophyIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNotification } from '@/hooks/notification/useNotification';
import { formatDate } from '@/lib/formatters';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProfileInfoProps {
  /** User ID */
  userId?: string;
  
  /** Show edit button */
  showEditButton?: boolean;
  
  /** Show share button */
  showShareButton?: boolean;
  
  /** Callback when edit clicked */
  onEdit?: () => void;
  
  /** Show statistics */
  showStatistics?: boolean;
  
  /** Show activity timeline */
  showActivity?: boolean;
  
  /** Show badges */
  showBadges?: boolean;
  
  /** Show social links */
  showSocialLinks?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Read only mode */
  readOnly?: boolean;
  
  /** Custom CSS class */
  className?: string;
}

interface UserStatistic {
  id: string;
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ActivityItem {
  id: string;
  type: 'review' | 'order' | 'comment' | 'achievement' | 'milestone';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  followers?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const RARITY_COLORS = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500',
};

const RARITY_LABELS = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

// ============================================================================
// COMPONENT
// ============================================================================

export const ProfileInfo: React.FC<ProfileInfoProps> = ({
  userId: userIdProp,
  showEditButton = true,
  showShareButton = true,
  onEdit,
  showStatistics = true,
  showActivity = true,
  showBadges = true,
  showSocialLinks = true,
  compact = false,
  readOnly = false,
  className,
}) => {
  const { user } = useAuth();
  const notification = useNotification();
  const activeUserId = userIdProp || user?.id;
  const profileUser = user; // In real app, fetch user by activeUserId

  // ============================================================================
  // STATE
  // ============================================================================

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'achievements'>('overview');
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  // ============================================================================
  // MOCK DATA
  // ============================================================================

  const statistics = useMemo<UserStatistic[]>(() => [
    {
      id: 'reviews',
      label: 'Reviews',
      value: 127,
      icon: ChatBubbleLeftIcon,
      color: 'text-blue-600',
      trend: 12,
    },
    {
      id: 'orders',
      label: 'Orders',
      value: 43,
      icon: ShieldCheckIcon,
      color: 'text-green-600',
      trend: 5,
    },
    {
      id: 'helpful',
      label: 'Helpful Votes',
      value: 1243,
      icon: HeartIcon,
      color: 'text-red-600',
      trend: 23,
    },
    {
      id: 'badges',
      label: 'Badges',
      value: 15,
      icon: TrophyIcon,
      color: 'text-yellow-600',
      trend: 2,
    },
    {
      id: 'followers',
      label: 'Followers',
      value: 234,
      icon: UserIcon,
      color: 'text-purple-600',
      trend: 8,
    },
    {
      id: 'rating',
      label: 'Avg Rating',
      value: '4.8',
      icon: StarIcon,
      color: 'text-orange-600',
      trend: 0,
    },
  ], []);

  const achievements = useMemo<Achievement[]>(() => [
    {
      id: 'verified-reviewer',
      name: 'Verified Reviewer',
      description: 'Completed 10 verified purchases',
      icon: CheckBadgeIcon,
      earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      rarity: 'rare',
    },
    {
      id: 'top-contributor',
      name: 'Top Contributor',
      description: 'Received 1000+ helpful votes',
      icon: TrophyIcon,
      earnedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      rarity: 'epic',
    },
    {
      id: 'early-adopter',
      name: 'Early Adopter',
      description: 'Joined within first 1000 users',
      icon: StarIconSolid,
      earnedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      rarity: 'legendary',
    },
    {
      id: 'helpful-reviewer',
      name: 'Helpful Reviewer',
      description: 'Received 100+ helpful votes',
      icon: HeartIcon,
      earnedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      rarity: 'rare',
    },
    {
      id: 'frequent-shopper',
      name: 'Frequent Shopper',
      description: 'Made 25+ purchases',
      icon: ShieldCheckIcon,
      earnedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      rarity: 'common',
    },
  ], []);

  const activityItems = useMemo<ActivityItem[]>(() => [
    {
      id: 'activity-1',
      type: 'review',
      title: 'Left a review',
      description: 'Reviewed "Premium Wireless Headphones"',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      icon: ChatBubbleLeftIcon,
      color: 'text-blue-600',
    },
    {
      id: 'activity-2',
      type: 'achievement',
      title: 'Earned a badge',
      description: 'Unlocked "Verified Reviewer" achievement',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      icon: TrophyIcon,
      color: 'text-yellow-600',
    },
    {
      id: 'activity-3',
      type: 'order',
      title: 'Completed order',
      description: 'Order #12345 delivered successfully',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      icon: ShieldCheckIcon,
      color: 'text-green-600',
    },
    {
      id: 'activity-4',
      type: 'milestone',
      title: 'Reached milestone',
      description: '100 reviews written',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      icon: ChartBarIcon,
      color: 'text-purple-600',
    },
    {
      id: 'activity-5',
      type: 'comment',
      title: 'Commented on review',
      description: 'Replied to a product review',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      icon: ChatBubbleLeftIcon,
      color: 'text-blue-600',
    },
  ], []);

  const socialLinks = useMemo<SocialLink[]>(() => {
    const links: SocialLink[] = [];
    // Add social links based on user data
    return links;
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const memberSince = useMemo(() => {
    if (!profileUser?.createdAt) return 'Unknown';
    return formatDate(profileUser.createdAt);
  }, [profileUser]);

  const displayedBadges = useMemo(() => {
    return showAllBadges ? achievements : achievements.slice(0, 6);
  }, [achievements, showAllBadges]);

  const displayedActivity = useMemo(() => {
    return showAllActivity ? activityItems : activityItems.slice(0, 5);
  }, [activityItems, showAllActivity]);

  const profileCompleteness = useMemo(() => {
    if (!profileUser) return 0;
    
    let completed = 0;
    const total = 10;
    
    if (profileUser.firstName) completed++;
    if (profileUser.lastName) completed++;
    if (profileUser.email) completed++;
    if (profileUser.phone) completed++;
    if (profileUser.avatar) completed++;
    if (profileUser.address?.city) completed++;
    if (profileUser.address?.country) completed++;
    if (profileUser.isEmailVerified) completed++;
    if (profileUser.isPhoneVerified) completed++;
    completed++; // Always count as having basic info
    
    return Math.round((completed / total) * 100);
  }, [profileUser]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleEdit = useCallback(() => {
    if (readOnly) return;
    onEdit?.();
  }, [readOnly, onEdit]);

  const handleShare = useCallback(() => {
    const profileUrl = `${window.location.origin}/profile/${activeUserId}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${profileUser?.displayName || profileUser?.firstName}'s Profile`,
        text: 'Check out my profile!',
        url: profileUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(profileUrl);
      notification.success('Profile link copied to clipboard', {
        duration: 2000,
      });
    }
  }, [activeUserId, profileUser, notification]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Fetch user data if needed
    if (activeUserId && activeUserId !== user?.id) {
      setIsLoading(true);
      // Fetch user by activeUserId
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [activeUserId, user?.id]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className={cn('w-full', className)}>
        <Card className="max-w-4xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className={cn('w-full', className)}>
        <Card className="max-w-4xl mx-auto">
          <CardContent className="py-12 text-center">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600">The requested profile could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Profile Header Card */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="relative">
          {/* Cover Image */}
          <div className="absolute inset-0 h-32 bg-gradient-to-r from-primary-500 to-primary-700 rounded-t-lg" />
          
          {/* Profile Info */}
          <div className="relative pt-16">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <div className="relative -mt-16">
                {profileUser.avatar ? (
                  <Image
                    src={profileUser.avatar}
                    alt={profileUser.displayName || profileUser.firstName}
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {profileUser.status === 'active' ? (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
                ) : null}
              </div>

              {/* User Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {profileUser.displayName || `${profileUser.firstName} ${profileUser.lastName}`}
                      </h1>
                      {profileUser.isEmailVerified ? (
                        <CheckBadgeIcon className="w-6 h-6 text-blue-600" title="Verified Account" />
                      ) : null}
                    </div>
                    <p className="text-gray-600 mt-1">@{profileUser.email.split('@')[0]}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                      {profileUser.address?.city ? (
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{profileUser.address.city}, {profileUser.address.country}</span>
                        </div>
                      ) : null}
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Joined {memberSince}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>Last active today</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {showShareButton ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                      >
                        <ShareIcon className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    ) : null}
                    {showEditButton && !readOnly ? (
                      <Button
                        size="sm"
                        onClick={handleEdit}
                      >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* Profile Completeness */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      Profile Completeness
                    </span>
                    <span className="text-sm font-bold text-blue-900">
                      {profileCompleteness}%
                    </span>
                  </div>
                  <Progress value={profileCompleteness} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Contact Information */}
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <EnvelopeIcon className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{profileUser.email}</p>
              </div>
              {profileUser.isEmailVerified ? (
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              ) : null}
            </div>

            {profileUser.phone ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <PhoneIcon className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{profileUser.phone}</p>
                </div>
                {profileUser.isPhoneVerified ? (
                  <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                ) : null}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {showStatistics ? (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-900">Statistics</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {statistics.map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Icon className={cn('w-8 h-8 mx-auto mb-2', stat.color)} />
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                    {stat.trend !== undefined && stat.trend > 0 ? (
                      <Badge variant="success" className="mt-2 text-xs">
                        +{stat.trend}%
                      </Badge>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Tabs */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                'px-4 py-2 font-medium transition-colors border-b-2',
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              Overview
            </button>
            {showActivity ? (
              <button
                onClick={() => setActiveTab('activity')}
                className={cn(
                  'px-4 py-2 font-medium transition-colors border-b-2',
                  activeTab === 'activity'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                Activity
              </button>
            ) : null}
            {showBadges ? (
              <button
                onClick={() => setActiveTab('achievements')}
                className={cn(
                  'px-4 py-2 font-medium transition-colors border-b-2',
                  activeTab === 'achievements'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                Achievements
              </button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Bio Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-gray-600" />
                    About
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {profileUser.firstName} is a valued member of our community. Active since {memberSince}, 
                    they have contributed significantly with {statistics.find(s => s.id === 'reviews')?.value} reviews 
                    and received {statistics.find(s => s.id === 'helpful')?.value} helpful votes from other users.
                  </p>
                </div>

                {/* Professional Info */}
                {!compact && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BriefcaseIcon className="w-5 h-5 text-gray-600" />
                      Professional
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <AcademicCapIcon className="w-4 h-4 text-gray-500" />
                        <span>Education background available</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <GlobeAltIcon className="w-4 h-4 text-gray-500" />
                        <span>Active in {profileUser.address?.country || 'Multiple locations'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Visibility */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <EyeIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    Profile visibility: <strong>Public</strong>
                  </span>
                  <CardFooter className="ml-auto text-xs text-gray-500">
                    Visible to all users
                  </CardFooter>
                </div>

                {/* Recent Achievements */}
                {showBadges && achievements.length > 0 ? (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Recent Achievements</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {achievements.slice(0, 3).map((achievement) => {
                        const Icon = achievement.icon;
                        return (
                          <div
                            key={achievement.id}
                            className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', RARITY_COLORS[achievement.rarity])}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">
                                  {achievement.name}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {formatDate(achievement.earnedAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Social Links */}
                {showSocialLinks && socialLinks.length > 0 ? (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Connect</h4>
                    <div className="flex flex-wrap gap-2">
                      {socialLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <a
                            key={link.platform}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <Icon className="w-5 h-5 text-gray-700" />
                            <span className="text-sm font-medium text-gray-900">{link.platform}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            ) : null}

            {activeTab === 'activity' && showActivity ? (
              <motion.div
                key="activity"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {displayedActivity.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm')}>
                        <Icon className={cn('w-5 h-5', item.color)} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatDate(item.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}

                {activityItems.length > 5 && !showAllActivity ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowAllActivity(true)}
                    className="w-full"
                  >
                    Show More Activity
                  </Button>
                ) : null}
              </motion.div>
            ) : null}

            {activeTab === 'achievements' && showBadges ? (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedBadges.map((achievement) => {
                    const Icon = achievement.icon;
                    return (
                      <div
                        key={achievement.id}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', RARITY_COLORS[achievement.rarity])}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h5 className="font-semibold text-gray-900">{achievement.name}</h5>
                              <Badge variant={achievement.rarity === 'legendary' ? 'warning' : 'default'}>
                                {RARITY_LABELS[achievement.rarity]}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Earned on {formatDate(achievement.earnedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {achievements.length > 6 && !showAllBadges ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowAllBadges(true)}
                    className="w-full"
                  >
                    <TrophyIcon className="w-4 h-4 mr-2" />
                    Show All {achievements.length} Achievements
                  </Button>
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileInfo;
