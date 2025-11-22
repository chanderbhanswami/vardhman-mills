'use client';

import Image from 'next/image';
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon,
  HeartIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  FlagIcon,
  EllipsisHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhotoIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import { Tooltip } from '@/components/ui/Tooltip';
import { Dialog } from '@/components/ui/Dialog';
import { Progress } from '@/components/ui/Progress';
import { Loading } from '@/components/ui/Loading';

import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/components/providers';
import { formatDistanceToNow, format } from 'date-fns';

// Import shared ReviewItem components
import ReviewHeader from '@/components/reviews/ReviewItem/ReviewHeader';
import ReviewBody from '@/components/reviews/ReviewItem/ReviewBody';
import ReviewActionFooter from '@/components/reviews/ReviewItem/ReviewActionFooter';
import { ProductReview } from '@/types/review.types';

// Interface mapping utilities
const mapReviewToProductReview = (review: Review): ProductReview => {
  return {
    id: review.id,
    title: review.title,
    content: review.content,
    rating: review.rating,
    userId: review.author.id,
    authorName: review.author.name,
    isVerifiedPurchaser: review.isVerified || false,
    productId: '', // Will be provided by context
    images: [],
    videos: [],
    detailedRatings: [],
    helpfulVotes: review.helpfulVotes || 0,
    unhelpfulVotes: review.notHelpfulVotes || 0,
    reportCount: 0,
    replyCount: review.replies?.length || 0,
    status: 'approved' as const,
    isVerified: review.isVerified || false,
    reviewContext: {
      purchaseChannel: 'online' as const,
      usageFrequency: 'daily' as const,
      usagePurpose: ['general'],
      wouldRecommend: review.wouldRecommend || false
    },
    likes: review.likes || 0,
    dislikes: review.dislikes || 0,
    shares: review.shares || 0,
    viewCount: review.viewCount || 0,
    clickThroughCount: 0,
    source: 'website' as const,
    isImported: false,
    qualityScore: 80,
    qualityFactors: [],
    submittedAt: review.timestamp,
    publishedAt: review.timestamp,
    createdAt: review.timestamp,
    updatedAt: review.updatedAt || review.timestamp,
    user: {
      id: review.author.id,
      displayName: review.author.name,
      avatar: review.author.avatar ? { 
        id: 'avatar-' + review.author.id,
        url: review.author.avatar,
        alt: review.author.name + ' avatar'
      } : undefined,
      isVerified: review.author.isVerified || false,
      reviewCount: review.author.reviewsCount || 0,
      averageRating: 0,
      helpfulVoteCount: review.author.helpfulVotes || 0,
      badges: review.author.level ? [{
        id: 'level-' + review.author.level,
        name: review.author.level,
        description: review.author.level + ' level user',
        icon: 'star',
        color: 'blue',
        earnedAt: review.author.joinedDate || new Date(),
        category: 'reviewer' as const,
        requirements: [{
          type: 'review_count' as const,
          threshold: 10,
          period: 'all_time' as const
        }]
      }] : [],
      memberSince: review.author.joinedDate || new Date(),
      lastActiveAt: new Date(),
      location: typeof review.author.location === 'string' ? {
        country: review.author.location
      } : undefined,
      showRealName: true,
      showLocation: false,
      showPurchaseHistory: false,
      reputationScore: 0,
      trustScore: 0,
      expertiseAreas: []
    },
    product: {
      id: '', // Will be provided by context
      name: '', // Will be provided by context
      slug: '',
      sku: '',
      brand: '',
      category: '',
      images: [],
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
        total: 0,
        average: 0
      },
      currentPrice: 0,
      currency: 'INR'
    }
  };
};

// Types
export interface ReviewUser {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  isVerified?: boolean;
  isPurchaseVerified?: boolean;
  reviewsCount?: number;
  helpfulVotes?: number;
  level?: 'bronze' | 'silver' | 'gold' | 'platinum';
  location?: string;
  joinedDate?: Date;
}

export interface ReviewMedia {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  caption?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    size?: number;
    format?: string;
  };
}

export interface ReviewInteraction {
  id: string;
  type: 'like' | 'dislike' | 'helpful' | 'not_helpful' | 'love' | 'report';
  userId: string;
  timestamp: Date;
}

export interface ReviewReply {
  id: string;
  content: string;
  author: ReviewUser;
  timestamp: Date;
  isOfficial?: boolean;
  isHighlighted?: boolean;
  likes: number;
  dislikes: number;
  userInteraction?: 'like' | 'dislike';
  media?: ReviewMedia[];
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  timestamp: Date;
  updatedAt?: Date;
  
  // Author information
  author: ReviewUser;
  isAnonymous?: boolean;
  
  // Product details
  productVariant?: string;
  purchaseDate?: Date;
  usageDuration?: string;
  purchasePrice?: number;
  purchaseLocation?: string;
  
  // Detailed ratings
  qualityRating?: number;
  valueRating?: number;
  deliveryRating?: number;
  serviceRating?: number;
  
  // Content enhancements
  pros?: string[];
  cons?: string[];
  tags?: string[];
  media?: ReviewMedia[];
  voiceNote?: {
    url: string;
    duration: number;
    transcript?: string;
  };
  
  // Interactions
  likes: number;
  dislikes: number;
  helpfulVotes: number;
  notHelpfulVotes: number;
  loves: number;
  shares: number;
  replies: ReviewReply[];
  
  // User interaction state
  userInteraction?: {
    liked?: boolean;
    disliked?: boolean;
    helpful?: boolean;
    loved?: boolean;
    reported?: boolean;
  };
  
  // Recommendations
  wouldRecommend?: boolean;
  
  // Status
  isEdited?: boolean;
  isHighlighted?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
  moderationStatus?: 'approved' | 'pending' | 'rejected';
  
  // Engagement
  engagementScore?: number;
  viewCount?: number;
  
  // Additional metadata
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  useCase?: string;
  seasonality?: string;
  ageGroup?: string;
  comparisonProducts?: string[];
}

export interface ReviewItemProps {
  // Review data
  review: Review;
  
  // Component integration options
  useSharedComponents?: boolean;
  sharedComponentVariant?: 'default' | 'compact' | 'detailed' | 'card' | 'minimal' | 'list' | 'grid' | 'feed' | 'modal';
  sharedComponentLayout?: 'vertical' | 'horizontal' | 'stacked' | 'inline' | 'responsive';
  
  // Display configuration
  variant?: 'default' | 'compact' | 'detailed' | 'featured' | 'preview';
  showMedia?: boolean;
  showReplies?: boolean;
  showInteractions?: boolean;
  showTimestamp?: boolean;
  showUserInfo?: boolean;
  showBadges?: boolean;
  showDetailedRatings?: boolean;
  showProsAndCons?: boolean;
  showTags?: boolean;
  showVoiceNote?: boolean;
  maxMediaItems?: number;
  maxReplies?: number;
  
  // Interaction settings
  allowLike?: boolean;
  allowDislike?: boolean;
  allowShare?: boolean;
  allowReport?: boolean;
  allowReply?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  
  // UI preferences
  highlightKeywords?: string[];
  showFullContent?: boolean;
  truncateContent?: number;
  showReadMore?: boolean;
  expandable?: boolean;
  
  // Styling
  className?: string;
  contentClassName?: string;
  userInfoClassName?: string;
  interactionsClassName?: string;
  
  // Callbacks
  onLike?: (reviewId: string) => Promise<void>;
  onDislike?: (reviewId: string) => Promise<void>;
  onHelpful?: (reviewId: string, helpful: boolean) => Promise<void>;
  onLove?: (reviewId: string) => Promise<void>;
  onShare?: (reviewId: string) => Promise<void>;
  onReport?: (reviewId: string, reason: string) => Promise<void>;
  onReply?: (reviewId: string, content: string) => Promise<void>;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => Promise<void>;
  onUserClick?: (userId: string) => void;
  onMediaClick?: (media: ReviewMedia, index: number) => void;
  
  // Analytics
  onView?: (reviewId: string) => void;
  onInteraction?: (reviewId: string, type: string, data?: unknown) => void;
}

// Helper component for user info
const UserInfo: React.FC<{
  user: ReviewUser;
  timestamp: Date;
  isAnonymous?: boolean;
  showBadges?: boolean;
  className?: string;
  onUserClick?: (userId: string) => void;
}> = ({ user, timestamp, isAnonymous, showBadges = true, className, onUserClick }) => {
  if (isAnonymous) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Avatar size="sm" fallback="A" />
        <div>
          <p className="text-sm font-medium text-gray-600">Anonymous User</p>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar
        src={user.avatar}
        fallback={user.name.charAt(0)}
        size="sm"
        className="cursor-pointer"
        onClick={() => onUserClick?.(user.id)}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUserClick?.(user.id)}
            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
          >
            {user.name}
          </button>
          
          {showBadges && (
            <div className="flex items-center gap-1">
              {user.isVerified && (
                <Tooltip content="Verified User">
                  <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                </Tooltip>
              )}
              
              {user.isPurchaseVerified && (
                <Tooltip content="Verified Purchase">
                  <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                </Tooltip>
              )}
              
              {user.level && (
                <Badge 
                  variant={user.level === 'platinum' ? 'default' : 'secondary'} 
                  size="sm"
                  className={cn(
                    user.level === 'gold' && 'bg-yellow-100 text-yellow-800',
                    user.level === 'silver' && 'bg-gray-100 text-gray-800',
                    user.level === 'bronze' && 'bg-amber-100 text-amber-800'
                  )}
                >
                  {user.level.charAt(0).toUpperCase() + user.level.slice(1)}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <CalendarIcon className="w-3 h-3" />
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
          {user.reviewsCount && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <PhotoIcon className="w-3 h-3" />
                {user.reviewsCount} reviews
              </span>
            </>
          )}
          {user.location && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <UserIcon className="w-3 h-3" />
                {user.location}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Rating display component
const RatingDisplay: React.FC<{
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}> = ({ rating, size = 'sm', showNumber = true, className }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => {
          const starRating = i + 1;
          return starRating <= rating ? (
            <StarIconSolid
              key={i}
              className={cn(
                sizeClasses[size],
                'text-yellow-400'
              )}
            />
          ) : (
            <StarIcon
              key={i}
              className={cn(
                sizeClasses[size],
                'text-gray-300'
              )}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// Media gallery component
const MediaGallery: React.FC<{
  media: ReviewMedia[];
  maxItems?: number;
  onMediaClick?: (media: ReviewMedia, index: number) => void;
}> = ({ media, maxItems = 4, onMediaClick }) => {
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({});

  const displayMedia = maxItems ? media.slice(0, maxItems) : media;
  const hasMore = media.length > maxItems;

  const handleAudioPlay = useCallback((mediaId: string) => {
    setIsPlaying(prev => ({ ...prev, [mediaId]: true }));
  }, []);

  const handleAudioPause = useCallback((mediaId: string) => {
    setIsPlaying(prev => ({ ...prev, [mediaId]: false }));
  }, []);

  if (media.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Images */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {displayMedia
          .filter(m => m.type === 'image')
          .map((item, index) => (
            <div
              key={item.id}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => onMediaClick?.(item, index)}
            >
              <Image
                src={item.url}
                alt={item.caption || 'Review image'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.caption}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Videos */}
      {displayMedia.some(m => m.type === 'video') && (
        <div className="space-y-2">
          {displayMedia
            .filter(m => m.type === 'video')
            .map((item, index) => (
              <div
                key={item.id}
                className="relative bg-black rounded-lg overflow-hidden cursor-pointer"
                onClick={() => onMediaClick?.(item, index)}
              >
                <div className="aspect-video relative">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.caption || 'Video thumbnail'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <VideoCameraIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <PlayIcon className="w-12 h-12 text-white" />
                  </div>
                  
                  {item.metadata?.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {Math.floor(item.metadata.duration / 60)}:
                      {(item.metadata.duration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
                
                {item.caption && (
                  <div className="p-3 bg-gray-50">
                    <p className="text-sm text-gray-700">{item.caption}</p>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Audio */}
      {displayMedia.some(m => m.type === 'audio') && (
        <div className="space-y-2">
          {displayMedia
            .filter(m => m.type === 'audio')
            .map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="bg-gray-50 rounded-lg p-4 border"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (isPlaying[item.id]) {
                        handleAudioPause(item.id);
                      } else {
                        handleAudioPlay(item.id);
                      }
                    }}
                    className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
                  >
                    {isPlaying[item.id] ? (
                      <PauseIcon className="w-5 h-5" />
                    ) : (
                      <PlayIcon className="w-5 h-5" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {item.caption || 'Audio Note'}
                      </span>
                      {item.metadata?.duration && (
                        <span className="text-xs text-gray-500">
                          {Math.floor(item.metadata.duration / 60)}:
                          {(item.metadata.duration % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    
                    <Progress
                      value={audioProgress[item.id] || 0}
                      className="h-1"
                    />
                  </div>
                  
                  <SpeakerWaveIcon className="w-5 h-5 text-gray-400" />
                </div>
                
                {/* Hidden audio element for playback */}
                <audio
                  src={item.url}
                  onPlay={() => handleAudioPlay(item.id)}
                  onPause={() => handleAudioPause(item.id)}
                  onTimeUpdate={(e) => {
                    const audio = e.target as HTMLAudioElement;
                    const progress = (audio.currentTime / audio.duration) * 100;
                    setAudioProgress(prev => ({ ...prev, [item.id]: progress }));
                  }}
                  className="hidden"
                />
              </div>
            ))}
        </div>
      )}

      {hasMore && (
        <button
          onClick={() => onMediaClick?.(media[maxItems], maxItems)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          +{media.length - maxItems} more
        </button>
      )}
    </div>
  );
};

// Main ReviewItem component
const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  variant = 'default',
  showMedia = true,
  showReplies = true,
  showInteractions = true,
  showTimestamp = true,
  showUserInfo = true,
  showBadges = true,
  showDetailedRatings = false,
  showProsAndCons = true,
  showTags = true,
  showVoiceNote = true,
  maxMediaItems = 4,
  maxReplies = 3,
  allowLike = true,
  allowDislike = false,
  allowShare = true,
  allowReport = true,
  allowReply = true,
  allowEdit = false,
  allowDelete = false,
  highlightKeywords = [],
  showFullContent = false,
  truncateContent = 300,
  showReadMore = true,
  expandable = true,
  className,
  contentClassName,
  userInfoClassName,
  interactionsClassName,
  onLike,
  onDislike,
  onHelpful,
  onLove,
  onShare,
  onReport,
  onReply,
  onEdit,
  onDelete,
  onUserClick,
  onMediaClick,
  onView,
  onInteraction,
  // New props for shared components
  useSharedComponents = false,
  sharedComponentVariant = 'default',
  sharedComponentLayout = 'responsive'
}) => {
  // State
  const [isExpanded, setIsExpanded] = useState(showFullContent);
  const [showRepliesSection, setShowRepliesSection] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<Record<string, boolean>>({});

  // Hooks
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if user is review author
  const isAuthor = user?.id === review.author.id;

  // Check content truncation
  const shouldTruncate = !isExpanded && truncateContent && review.content.length > truncateContent;
  const displayContent = shouldTruncate 
    ? review.content.substring(0, truncateContent) + '...'
    : review.content;

  // Highlight keywords in content
  const highlightedContent = useMemo(() => {
    if (highlightKeywords.length === 0) return displayContent;
    
    let highlighted = displayContent;
    highlightKeywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    });
    
    return highlighted;
  }, [displayContent, highlightKeywords]);

  // Handle interactions
  const handleInteraction = useCallback(async (
    type: string,
    handler?: ((...args: unknown[]) => Promise<void>) | ((reviewId: string) => Promise<void>) | ((reviewId: string, helpful: boolean) => Promise<void>) | ((reviewId: string, reason: string) => Promise<void>),
    ...args: unknown[]
  ) => {
    if (!handler) return;

    setIsActionLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      await (handler as (...args: unknown[]) => Promise<void>)(...args);
      onInteraction?.(review.id, type, args);
    } catch (error) {
      console.error('Interaction failed:', error);
      toast({
        title: 'Action Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsActionLoading(prev => ({ ...prev, [type]: false }));
    }
  }, [review.id, onInteraction, toast]);

  // Report reasons
  const reportReasons = [
    'Inappropriate content',
    'Spam or fake review',
    'Offensive language',
    'Misleading information',
    'Copyright violation',
    'Other'
  ];

  // View tracking
  React.useEffect(() => {
    onView?.(review.id);
  }, [review.id, onView]);

  // Shared component integration
  const renderWithSharedComponents = useCallback(() => {
    const productReview = mapReviewToProductReview(review);
    
    const sharedActions = {
      onLike: onLike ? () => {
        onLike(review.id);
      } : undefined,
      onDislike: onDislike ? () => {
        onDislike(review.id);
      } : undefined,
      onShare: onShare ? () => {
        onShare(review.id);
      } : undefined,
      onReport: onReport ? () => {
        onReport(review.id, 'inappropriate');
      } : undefined,
      onUserClick: onUserClick,
      onViewMedia: onMediaClick ? () => {
        // Handle media viewing if needed
      } : undefined
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'group',
          variant === 'featured' && 'border-l-4 border-l-blue-500',
          className
        )}
      >
        <Card className={cn(
          'p-6 space-y-4',
          variant === 'compact' && 'p-4 space-y-3',
          review.isHighlighted && 'ring-2 ring-blue-200 bg-blue-50',
          review.isFeatured && 'border-yellow-200 bg-yellow-50'
        )}>
          {/* Header with shared component */}
          {showUserInfo && (
            <ReviewHeader
              review={productReview}
              variant={sharedComponentVariant === 'compact' ? 'compact' : 'default'}
              layout={sharedComponentLayout}
              size={variant === 'compact' ? 'sm' : 'md'}
              interactive={allowShare || allowReport}
              colorScheme="default"
              onAvatarClick={onUserClick}
              onNameClick={onUserClick}
              onShare={sharedActions.onShare}
              onReport={sharedActions.onReport}
            />
          )}

          {/* Body with shared component */}
          <ReviewBody
            content={{
              id: review.id,
              type: 'text' as const,
              priority: 'high' as const,
              text: {
                id: review.id,
                content: review.content,
                wordCount: review.content.split(' ').length,
                characterCount: review.content.length,
                readingTime: Math.ceil(review.content.split(' ').length / 200),
                language: 'en'
              }
            }}
            showText={true}
            allowTextSelection={true}
            className={contentClassName}
          />

          {/* Legacy content for complex features */}
          {showDetailedRatings && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              {review.qualityRating && (
                <div className="text-center">
                  <RatingDisplay rating={review.qualityRating} size="sm" />
                  <p className="text-xs text-gray-600 mt-1">Quality</p>
                </div>
              )}
              {review.valueRating && (
                <div className="text-center">
                  <RatingDisplay rating={review.valueRating} size="sm" />
                  <p className="text-xs text-gray-600 mt-1">Value</p>
                </div>
              )}
              {review.deliveryRating && (
                <div className="text-center">
                  <RatingDisplay rating={review.deliveryRating} size="sm" />
                  <p className="text-xs text-gray-600 mt-1">Delivery</p>
                </div>
              )}
              {review.serviceRating && (
                <div className="text-center">
                  <RatingDisplay rating={review.serviceRating} size="sm" />
                  <p className="text-xs text-gray-600 mt-1">Service</p>
                </div>
              )}
            </div>
          )}

          {/* Pros and Cons */}
          {showProsAndCons && (review.pros?.length || review.cons?.length) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {review.pros && review.pros.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-green-800 flex items-center gap-1">
                    <CheckBadgeIcon className="w-4 h-4" />
                    Pros
                  </h4>
                  <ul className="space-y-1">
                    {review.pros.map((pro, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {review.cons && review.cons.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-800 flex items-center gap-1">
                    <FlagIcon className="w-4 h-4" />
                    Cons
                  </h4>
                  <ul className="space-y-1">
                    {review.cons.map((con, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Media Gallery */}
          {showMedia && review.media && review.media.length > 0 && (
            <MediaGallery
              media={review.media}
              maxItems={maxMediaItems}
              onMediaClick={onMediaClick}
            />
          )}

          {/* Actions with shared component */}
          {showInteractions && (
            <ReviewActionFooter
              reviewId={review.id}
              userId={review.author.id}
              user={{
                id: review.author.id,
                name: review.author.name,
                avatar: review.author.avatar,
                isVerified: review.author.isVerified || false,
                level: 'member',
                badges: review.author.level ? [review.author.level] : []
              }}
              isOwner={user?.id === review.author.id}
              stats={{
                views: review.viewCount || 0,
                shares: review.shares || 0,
                replies: review.replies?.length || 0,
                helpfulVotes: review.helpfulVotes || 0,
                totalVotes: (review.helpfulVotes || 0) + (review.notHelpfulVotes || 0),
                trending: false,
                featured: review.isFeatured || false
              }}
              metadata={{
                id: review.id,
                createdAt: review.timestamp.toISOString(),
                updatedAt: review.updatedAt?.toISOString(),
                isEdited: review.isEdited || false,
                isPinned: false,
                isLocked: false,
                moderationStatus: (
                  review.moderationStatus === 'rejected' ? 'flagged' :
                  review.moderationStatus === 'pending' ? 'pending' : 
                  'approved'
                ) as 'approved' | 'pending' | 'hidden' | 'flagged'
              }}
              compact={variant === 'compact'}
              showStats={true}
              onLike={sharedActions.onLike}
              onDislike={sharedActions.onDislike}
              onShare={sharedActions.onShare}
              onReport={sharedActions.onReport}
            />
          )}
        </Card>
      </motion.div>
    );
  }, [review, variant, className, showUserInfo, sharedComponentVariant, sharedComponentLayout, allowShare, allowReport, onUserClick, onShare, onReport, contentClassName, showDetailedRatings, showProsAndCons, showMedia, maxMediaItems, onMediaClick, showInteractions, user?.id, onLike, onDislike]);

  // Return shared components version if requested
  if (useSharedComponents) {
    return renderWithSharedComponents();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group',
        variant === 'featured' && 'border-l-4 border-l-blue-500',
        className
      )}
    >
      <Card className={cn(
        'p-6 space-y-4',
        variant === 'compact' && 'p-4 space-y-3',
        review.isHighlighted && 'ring-2 ring-blue-200 bg-blue-50',
        review.isFeatured && 'border-yellow-200 bg-yellow-50'
      )}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* User Info */}
            {showUserInfo && (
              <UserInfo
                user={review.author}
                timestamp={review.timestamp}
                isAnonymous={review.isAnonymous}
                showBadges={showBadges}
                className={userInfoClassName}
                onUserClick={onUserClick}
              />
            )}
            
            {/* Additional timestamp display if showTimestamp is specifically enabled */}
            {showTimestamp && !showUserInfo && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ClockIcon className="w-3 h-3" />
                <time dateTime={review.timestamp.toISOString()}>
                  {formatDistanceToNow(review.timestamp, { addSuffix: true })}
                </time>
              </div>
            )}

            {/* Rating and Title */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <RatingDisplay 
                  rating={review.rating} 
                  size={variant === 'compact' ? 'sm' : 'md'} 
                />
                
                {review.wouldRecommend !== undefined && (
                  <Badge 
                    variant={review.wouldRecommend ? 'default' : 'destructive'} 
                    size="sm"
                  >
                    {review.wouldRecommend ? 'Recommends' : 'Not Recommended'}
                  </Badge>
                )}
                
                {review.isEdited && (
                  <Badge variant="secondary" size="sm">
                    Edited
                  </Badge>
                )}
              </div>

              {review.title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {review.title}
                </h3>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <Dropdown
            trigger={
              <Button variant="ghost" size="sm">
                <EllipsisHorizontalIcon className="w-4 h-4" />
              </Button>
            }
          >
            <div className="py-1">
              {allowShare && (
                <button
                  onClick={() => handleInteraction('share', onShare, review.id)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <ShareIcon className="w-4 h-4" />
                  Share
                </button>
              )}
              
              {allowReport && !isAuthor && (
                <button
                  onClick={() => setShowReportDialog(true)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FlagIcon className="w-4 h-4" />
                  Report
                </button>
              )}
              
              {allowEdit && isAuthor && (
                <button
                  onClick={() => onEdit?.(review.id)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit Review
                </button>
              )}
              
              {allowDelete && isAuthor && (
                <button
                  onClick={() => handleInteraction('delete', onDelete, review.id)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete Review
                </button>
              )}
            </div>
          </Dropdown>
        </div>

        {/* Content */}
        <div className={cn('space-y-4', contentClassName)}>
          {/* Main Review Content */}
          <div className="text-gray-700 leading-relaxed">
            <div
              dangerouslySetInnerHTML={{ __html: highlightedContent }}
              className="prose prose-sm max-w-none"
            />
            
            {shouldTruncate && showReadMore && expandable && (
              <button
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm mt-2"
              >
                Read more
                <ChevronDownIcon className="w-3 h-3" />
              </button>
            )}
            
            <AnimatePresence>
              {isExpanded && !showFullContent && expandable && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm mt-2"
                >
                  Show less
                  <ChevronUpIcon className="w-3 h-3" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Detailed Ratings */}
          {showDetailedRatings && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              {review.qualityRating && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Quality</p>
                  <RatingDisplay rating={review.qualityRating} size="sm" showNumber={false} />
                </div>
              )}
              {review.valueRating && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Value</p>
                  <RatingDisplay rating={review.valueRating} size="sm" showNumber={false} />
                </div>
              )}
              {review.deliveryRating && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Delivery</p>
                  <RatingDisplay rating={review.deliveryRating} size="sm" showNumber={false} />
                </div>
              )}
              {review.serviceRating && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Service</p>
                  <RatingDisplay rating={review.serviceRating} size="sm" showNumber={false} />
                </div>
              )}
            </div>
          )}

          {/* Pros and Cons */}
          {showProsAndCons && (review.pros?.length || review.cons?.length) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {review.pros && review.pros.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-green-700 flex items-center gap-1">
                    <HandThumbUpIcon className="w-4 h-4" />
                    Pros
                  </h4>
                  <ul className="space-y-1">
                    {review.pros.map((pro, index) => (
                      <li key={index} className="text-sm text-green-600 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {review.cons && review.cons.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-red-700 flex items-center gap-1">
                    <HandThumbDownIcon className="w-4 h-4" />
                    Cons
                  </h4>
                  <ul className="space-y-1">
                    {review.cons.map((con, index) => (
                      <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Media */}
          {showMedia && review.media && review.media.length > 0 && (
            <MediaGallery
              media={review.media}
              maxItems={maxMediaItems}
              onMediaClick={onMediaClick}
            />
          )}

          {/* Voice Note */}
          {showVoiceNote && review.voiceNote && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  <SpeakerWaveIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Voice Note</p>
                  <p className="text-xs text-blue-600">
                    Duration: {Math.floor(review.voiceNote.duration / 60)}:
                    {(review.voiceNote.duration % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <PlayIcon className="w-4 h-4 mr-1" />
                  Play
                </Button>
              </div>
              
              {review.voiceNote.transcript && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600 mb-1">Transcript:</p>
                  <p className="text-sm text-blue-800">{review.voiceNote.transcript}</p>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {showTags && review.tags && review.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {review.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" size="sm">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Product Details */}
          {(review.productVariant || review.purchaseDate || review.usageDuration) && (
            <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded">
              {review.productVariant && (
                <p>Variant: {review.productVariant}</p>
              )}
              {review.purchaseDate && (
                <p>Purchased: {format(review.purchaseDate, 'MMM d, yyyy')}</p>
              )}
              {review.usageDuration && (
                <p>Used for: {review.usageDuration}</p>
              )}
              {review.experienceLevel && (
                <p>Experience level: {review.experienceLevel}</p>
              )}
            </div>
          )}
        </div>

        {/* Interactions Bar */}
        {showInteractions && (
          <div className={cn(
            'flex items-center justify-between pt-4 border-t border-gray-200',
            interactionsClassName
          )}>
            <div className="flex items-center gap-4">
              {/* Like Button */}
              {allowLike && (
                <button
                  onClick={() => handleInteraction('like', onLike, review.id)}
                  disabled={isActionLoading.like}
                  className={cn(
                    'flex items-center gap-1 text-sm transition-colors',
                    review.userInteraction?.liked
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  )}
                >
                  {isActionLoading.like ? (
                    <Loading size="sm" />
                  ) : review.userInteraction?.liked ? (
                    <HandThumbUpIconSolid className="w-4 h-4" />
                  ) : (
                    <HandThumbUpIcon className="w-4 h-4" />
                  )}
                  {review.likes > 0 && <span>{review.likes}</span>}
                </button>
              )}

              {/* Dislike Button */}
              {allowDislike && (
                <button
                  onClick={() => handleInteraction('dislike', onDislike, review.id)}
                  disabled={isActionLoading.dislike}
                  className={cn(
                    'flex items-center gap-1 text-sm transition-colors',
                    review.userInteraction?.disliked
                      ? 'text-red-600'
                      : 'text-gray-600 hover:text-red-600'
                  )}
                >
                  {isActionLoading.dislike ? (
                    <Loading size="sm" />
                  ) : review.userInteraction?.disliked ? (
                    <HandThumbDownIconSolid className="w-4 h-4" />
                  ) : (
                    <HandThumbDownIcon className="w-4 h-4" />
                  )}
                  {review.dislikes > 0 && <span>{review.dislikes}</span>}
                </button>
              )}

              {/* Love Button */}
              <button
                onClick={() => handleInteraction('love', onLove, review.id)}
                disabled={isActionLoading.love}
                className={cn(
                  'flex items-center gap-1 text-sm transition-colors',
                  review.userInteraction?.loved
                    ? 'text-red-600'
                    : 'text-gray-600 hover:text-red-600'
                )}
              >
                {isActionLoading.love ? (
                  <Loading size="sm" />
                ) : review.userInteraction?.loved ? (
                  <HeartIconSolid className="w-4 h-4" />
                ) : (
                  <HeartIcon className="w-4 h-4" />
                )}
                {review.loves > 0 && <span>{review.loves}</span>}
              </button>

              {/* Helpful Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleInteraction('helpful', onHelpful, review.id, true)}
                  disabled={isActionLoading.helpful}
                  className={cn(
                    'text-xs px-2 py-1 rounded border transition-colors',
                    review.userInteraction?.helpful
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'border-gray-300 text-gray-600 hover:border-green-300 hover:text-green-600'
                  )}
                >
                  {isActionLoading.helpful ? (
                    <Loading size="sm" />
                  ) : (
                    `Helpful (${review.helpfulVotes})`
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Reply Button */}
              {allowReply && (
                <button
                  onClick={async () => {
                    if (onReply) {
                      const replyContent = prompt('Enter your reply:');
                      if (replyContent?.trim()) {
                        try {
                          setIsActionLoading(prev => ({ ...prev, reply: true }));
                          await onReply(review.id, replyContent.trim());
                          // Show success message
                          console.log('Reply posted successfully');
                        } catch (error) {
                          console.error('Failed to post reply:', error);
                        } finally {
                          setIsActionLoading(prev => ({ ...prev, reply: false }));
                        }
                      }
                    } else {
                      setShowRepliesSection(!showRepliesSection);
                    }
                  }}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  disabled={isActionLoading.reply}
                >
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  {isActionLoading.reply ? 'Posting...' : (onReply ? 'Reply' : 'View Replies')}
                  {review.replies.length > 0 && (
                    <span>({review.replies.length})</span>
                  )}
                </button>
              )}

              {/* Share Count */}
              {review.shares > 0 && (
                <span className="text-xs text-gray-500">
                  {review.shares} shares
                </span>
              )}

              {/* View Count */}
              {review.viewCount && review.viewCount > 0 && (
                <span className="text-xs text-gray-500">
                  {review.viewCount} views
                </span>
              )}
            </div>
          </div>
        )}

        {/* Replies Section */}
        {showReplies && showRepliesSection && review.replies.length > 0 && (
          <div className="space-y-4 pl-6 border-l-2 border-gray-200">
            {review.replies.slice(0, maxReplies).map((reply) => (
              <div key={reply.id} className="space-y-2">
                <UserInfo
                  user={reply.author}
                  timestamp={reply.timestamp}
                  showBadges={reply.isOfficial}
                  onUserClick={onUserClick}
                />
                
                <div className={cn(
                  'text-sm text-gray-700 bg-gray-50 rounded-lg p-3',
                  reply.isHighlighted && 'bg-blue-50 border border-blue-200'
                )}>
                  {reply.content}
                </div>
                
                {reply.media && reply.media.length > 0 && (
                  <MediaGallery
                    media={reply.media}
                    maxItems={2}
                    onMediaClick={onMediaClick}
                  />
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <button className="hover:text-blue-600 transition-colors">
                    <HandThumbUpIcon className="w-3 h-3 mr-1 inline" />
                    {reply.likes > 0 && reply.likes}
                  </button>
                  
                  {reply.isOfficial && (
                    <Badge size="sm" variant="default">
                      Official Response
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {review.replies.length > maxReplies && (
              <button
                onClick={() => setShowRepliesSection(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all {review.replies.length} replies
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Report Dialog */}
      {showReportDialog && (
        <Dialog
          open={showReportDialog}
          onClose={() => setShowReportDialog(false)}
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Report Review</h3>
            <p className="text-sm text-gray-600">
              Why are you reporting this review?
            </p>
            
            <div className="space-y-2">
              {reportReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => {
                    handleInteraction('report', onReport, review.id, reason);
                    setShowReportDialog(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded border"
                >
                  {reason}
                </button>
              ))}
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowReportDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </motion.div>
  );
};

// Enhanced ReviewItem component that uses shared components by default
export const EnhancedReviewItem: React.FC<ReviewItemProps> = (props) => {
  return <ReviewItem {...props} useSharedComponents={true} />;
};

// Legacy ReviewItem component that uses the original implementation
export const LegacyReviewItem: React.FC<ReviewItemProps> = (props) => {
  return <ReviewItem {...props} useSharedComponents={false} />;
};

export default ReviewItem;
