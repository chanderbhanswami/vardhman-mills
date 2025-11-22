'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HandThumbUpIcon,
  HandThumbDownIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisVerticalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShoppingBagIcon,
  CheckBadgeIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarSolidIcon,
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  CheckBadgeIcon as CheckBadgeSolidIcon
} from '@heroicons/react/24/solid';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Tooltip } from '@/components/ui/Tooltip';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Separator } from '@/components/ui/Separator';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/components/providers';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

import ReviewMediaGallery from './ReviewMediaGallery';
import ReviewMediaCarousel from '../ReviewMediaCarousel';
import ReviewReplyItem from '../ReviewReplyItem';
import { Timestamp } from '@/types/common.types';
import { ReviewUser } from '@/types/review.types';

// Import MediaItem type from ReviewMediaCarousel
interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  duration?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  uploadedAt: Date;
  uploadedBy?: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: 'processing' | 'ready' | 'error' | 'removed';
}

// Types
export interface ReviewMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  alt?: string;
  width?: number;
  height?: number;
  size?: number;
  duration?: number; // for videos
}

export interface ReviewStats {
  helpfulVotes: number;
  notHelpfulVotes: number;
  totalVotes: number;
  helpfulPercentage: number;
  views: number;
  shares: number;
  replies: number;
  bookmarks: number;
  reports: number;
  isHelpful?: boolean;
  isNotHelpful?: boolean;
  isBookmarked?: boolean;
  isReported?: boolean;
}

export interface ReviewAuthor {
  id: string;
  name: string;
  displayName: string;
  avatar?: string;
  isVerified: boolean;
  level: string;
  badges: string[];
  totalReviews: number;
  helpfulVotes: number;
  joinedDate: Timestamp;
  location?: string;
  bio?: string;
  trustScore: number;
  role: 'user' | 'moderator' | 'admin' | 'merchant' | 'expert';
}

export interface ReviewProduct {
  id: string;
  name: string;
  sku: string;
  image: string;
  variant?: string;
  category: string;
  brand: string;
  price: number;
  url: string;
}

export interface ReviewPurchase {
  id: string;
  orderId: string;
  purchaseDate: Timestamp;
  verified: boolean;
  variantPurchased: string;
  price: number;
  quantity: number;
  source: 'website' | 'store' | 'marketplace';
}

export interface ReviewReply {
  id: string;
  parentReplyId?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: 'user' | 'moderator' | 'admin' | 'merchant';
  content: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isEdited: boolean;
  likes: number;
  dislikes: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  isPinned: boolean;
  isHighlighted: boolean;
  moderationStatus: 'approved' | 'pending' | 'flagged' | 'hidden';
  replies?: ReviewReply[];
}

export interface ReviewData {
  id: string;
  productId: string;
  product: ReviewProduct;
  authorId: string;
  author: ReviewAuthor;
  purchase?: ReviewPurchase;
  title: string;
  content: string;
  rating: number;
  pros: string[];
  cons: string[];
  media: ReviewMedia[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isEdited: boolean;
  editHistory: Array<{
    editedAt: Timestamp;
    reason: string;
    changes: string[];
  }>;
  
  // Review metrics
  stats: ReviewStats;
  
  // Status and moderation
  status: 'draft' | 'published' | 'pending' | 'approved' | 'rejected' | 'hidden';
  moderationStatus: 'pending' | 'approved' | 'flagged' | 'hidden' | 'deleted';
  moderationReason?: string;
  featuredAt?: Timestamp;
  
  // Engagement
  replies: ReviewReply[];
  tags: string[];
  isVerifiedPurchase: boolean;
  isRecommended: boolean;
  usageContext: 'personal' | 'business' | 'gift' | 'testing';
  usageDuration: string;
  
  // Quality scores
  qualityScore: number;
  readabilityScore: number;
  sentimentScore: number;
  
  // SEO and visibility
  isHighlighted: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  visibility: 'public' | 'private' | 'followers' | 'friends';
}

export interface ReviewCardProps {
  review: ReviewData;
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  showActions?: boolean;
  showReplies?: boolean;
  showMedia?: boolean;
  showPurchaseInfo?: boolean;
  showAuthorInfo?: boolean;
  maxReplies?: number;
  expanded?: boolean;
  className?: string;
  
  // Event handlers
  onLike?: (reviewId: string, isLiked: boolean) => Promise<void>;
  onDislike?: (reviewId: string, isDisliked: boolean) => Promise<void>;
  onBookmark?: (reviewId: string, isBookmarked: boolean) => Promise<void>;
  onShare?: (reviewId: string, platform?: string) => Promise<void>;
  onReport?: (reviewId: string, reason: string, details?: string) => Promise<void>;
  onReply?: (reviewId: string, content: string, parentReplyId?: string) => Promise<void>;
  onAuthorClick?: (authorId: string) => void;
  onProductClick?: (productId: string) => void;
  onMediaClick?: (mediaId: string, mediaIndex: number) => void;
  onExpand?: (reviewId: string, expanded: boolean) => void;
  
  // Analytics
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

const RATING_COLORS = {
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-yellow-500',
  4: 'text-lime-500',
  5: 'text-green-500'
} as const;

const QUALITY_THRESHOLDS = {
  high: 80,
  medium: 60,
  low: 40
} as const;

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  variant = 'default',
  showActions = true,
  showReplies = true,
  showMedia = true,
  showPurchaseInfo = true,
  showAuthorInfo = true,
  maxReplies = 3,
  expanded = false,
  className,
  onLike,
  onDislike,
  onBookmark,
  onShare,
  onReport,
  onReply,
  onAuthorClick,
  onProductClick,
  onMediaClick,
  onExpand,
  onAnalyticsEvent
}) => {
  // Hooks
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [localStats, setLocalStats] = useState(review.stats);
  const [mediaViewMode, setMediaViewMode] = useState<'grid' | 'carousel'>('grid');
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  // Computed values
  const isOwner = user?.id === review.authorId;
  const canModerate = user?.role === 'admin' || user?.role === 'moderator';
  const displayedReplies = showAllReplies ? review.replies : review.replies.slice(0, maxReplies);
  const hasMoreReplies = review.replies.length > maxReplies;
  
  const qualityLevel = useMemo(() => {
    if (review.qualityScore >= QUALITY_THRESHOLDS.high) return 'high';
    if (review.qualityScore >= QUALITY_THRESHOLDS.medium) return 'medium';
    if (review.qualityScore >= QUALITY_THRESHOLDS.low) return 'low';
    return 'very-low';
  }, [review.qualityScore]);

  const trustLevel = useMemo(() => {
    if (review.author.trustScore >= 90) return 'excellent';
    if (review.author.trustScore >= 70) return 'good';
    if (review.author.trustScore >= 50) return 'fair';
    return 'poor';
  }, [review.author.trustScore]);

  // Loading helper
  const setActionLoading = useCallback((action: string, loading: boolean) => {
    setIsLoading(prev => ({ ...prev, [action]: loading }));
  }, []);

  // Analytics helper
  const trackAnalytics = useCallback((event: string, data: Record<string, unknown> = {}) => {
    onAnalyticsEvent?.(event, {
      reviewId: review.id,
      productId: review.productId,
      authorId: review.authorId,
      timestamp: new Date().toISOString(),
      ...data
    });
  }, [onAnalyticsEvent, review.id, review.productId, review.authorId]);

  // Action handlers
  const handleLike = useCallback(async () => {
    if (!user || isLoading.like) return;
    
    const newIsHelpful = !localStats.isHelpful;
    setActionLoading('like', true);
    
    try {
      await onLike?.(review.id, newIsHelpful);
      
      setLocalStats(prev => ({
        ...prev,
        isHelpful: newIsHelpful,
        isNotHelpful: newIsHelpful ? false : prev.isNotHelpful,
        helpfulVotes: prev.helpfulVotes + (newIsHelpful ? 1 : -1),
        notHelpfulVotes: newIsHelpful && prev.isNotHelpful ? prev.notHelpfulVotes - 1 : prev.notHelpfulVotes,
        totalVotes: prev.totalVotes + (newIsHelpful ? 1 : -1),
        helpfulPercentage: Math.round(((prev.helpfulVotes + (newIsHelpful ? 1 : -1)) / Math.max(1, prev.totalVotes + (newIsHelpful ? 1 : -1))) * 100)
      }));

      trackAnalytics('review_helpful', { isHelpful: newIsHelpful });
      
      toast({
        title: newIsHelpful ? 'Marked as helpful!' : 'Helpful vote removed',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
      toast({
        title: 'Failed to mark review',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setActionLoading('like', false);
    }
  }, [user, isLoading.like, localStats, onLike, review.id, trackAnalytics, toast, setActionLoading]);

  const handleDislike = useCallback(async () => {
    if (!user || isLoading.dislike) return;
    
    const newIsNotHelpful = !localStats.isNotHelpful;
    setActionLoading('dislike', true);
    
    try {
      await onDislike?.(review.id, newIsNotHelpful);
      
      setLocalStats(prev => ({
        ...prev,
        isNotHelpful: newIsNotHelpful,
        isHelpful: newIsNotHelpful ? false : prev.isHelpful,
        notHelpfulVotes: prev.notHelpfulVotes + (newIsNotHelpful ? 1 : -1),
        helpfulVotes: newIsNotHelpful && prev.isHelpful ? prev.helpfulVotes - 1 : prev.helpfulVotes,
        totalVotes: prev.totalVotes + (newIsNotHelpful ? 1 : -1),
        helpfulPercentage: Math.round(((prev.helpfulVotes - (newIsNotHelpful && prev.isHelpful ? 1 : 0)) / Math.max(1, prev.totalVotes + (newIsNotHelpful ? 1 : -1))) * 100)
      }));

      trackAnalytics('review_not_helpful', { isNotHelpful: newIsNotHelpful });
      
      toast({
        title: newIsNotHelpful ? 'Marked as not helpful' : 'Not helpful vote removed',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to mark review as not helpful:', error);
      toast({
        title: 'Failed to mark review',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setActionLoading('dislike', false);
    }
  }, [user, isLoading.dislike, localStats, onDislike, review.id, trackAnalytics, toast, setActionLoading]);

  const handleBookmark = useCallback(async () => {
    if (!user || isLoading.bookmark) return;
    
    const newIsBookmarked = !localStats.isBookmarked;
    setActionLoading('bookmark', true);
    
    try {
      await onBookmark?.(review.id, newIsBookmarked);
      
      setLocalStats(prev => ({
        ...prev,
        isBookmarked: newIsBookmarked,
        bookmarks: prev.bookmarks + (newIsBookmarked ? 1 : -1)
      }));

      trackAnalytics('review_bookmark', { isBookmarked: newIsBookmarked });
      
      toast({
        title: newIsBookmarked ? 'Review bookmarked!' : 'Bookmark removed',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to bookmark review:', error);
      toast({
        title: 'Failed to bookmark review',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setActionLoading('bookmark', false);
    }
  }, [user, isLoading.bookmark, localStats, onBookmark, review.id, trackAnalytics, toast, setActionLoading]);

  const handleShare = useCallback(async (platform?: string) => {
    setActionLoading('share', true);
    
    try {
      await onShare?.(review.id, platform);
      
      setLocalStats(prev => ({
        ...prev,
        shares: prev.shares + 1
      }));

      trackAnalytics('review_share', { platform });
      
      toast({
        title: 'Review shared!',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to share review:', error);
      toast({
        title: 'Failed to share review',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setActionLoading('share', false);
    }
  }, [onShare, review.id, trackAnalytics, toast, setActionLoading]);

  const handleToggleExpanded = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpand?.(review.id, newExpanded);
    trackAnalytics('review_expand', { expanded: newExpanded });
  }, [isExpanded, onExpand, review.id, trackAnalytics]);

  // Format helpers
  const formatCount = useCallback((count: number): string => {
    if (count === 0) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  }, []);

  const getTimeAgo = useCallback((timestamp: Timestamp) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  }, []);

  // Render helpers
  const renderStars = useCallback((rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };
    
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolidIcon
            key={star}
            className={cn(
              sizeClasses[size],
              star <= rating 
                ? RATING_COLORS[Math.ceil(rating) as keyof typeof RATING_COLORS]
                : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  }, []);

  const renderAuthorInfo = useCallback(() => {
    if (!showAuthorInfo && variant === 'minimal') return null;

    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => onAuthorClick?.(review.author.id)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Avatar className="w-10 h-10">
            <AvatarImage 
              src={review.author.avatar} 
              alt={review.author.displayName}
            />
            <AvatarFallback>
              {review.author.displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 hover:text-blue-600">
                {review.author.displayName}
              </h4>
              {review.author.isVerified && (
                <CheckBadgeSolidIcon className="w-4 h-4 text-blue-500" />
              )}
              {review.author.role !== 'user' && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {review.author.role}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{review.author.level}</span>
              <span>•</span>
              <span>{formatCount(review.author.totalReviews)} reviews</span>
              {review.author.location && (
                <>
                  <span>•</span>
                  <span>{review.author.location}</span>
                </>
              )}
            </div>
          </div>
        </button>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          <Tooltip content={`Trust Score: ${review.author.trustScore}%`}>
            <div className="flex items-center gap-1">
              <div className={cn(
                'w-2 h-2 rounded-full',
                trustLevel === 'excellent' && 'bg-green-500',
                trustLevel === 'good' && 'bg-blue-500',
                trustLevel === 'fair' && 'bg-yellow-500',
                trustLevel === 'poor' && 'bg-red-500'
              )} />
              <span className="text-xs text-gray-500">{review.author.trustScore}%</span>
            </div>
          </Tooltip>
          
          <time className="text-sm text-gray-500" dateTime={review.createdAt.toString()}>
            {getTimeAgo(review.createdAt)}
          </time>
        </div>
      </div>
    );
  }, [showAuthorInfo, variant, review.author, review.createdAt, onAuthorClick, formatCount, trustLevel, getTimeAgo]);

  const renderPurchaseInfo = useCallback(() => {
    if (!showPurchaseInfo || !review.purchase || variant === 'minimal') return null;

    return (
      <div className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-green-700">
          <CheckBadgeIcon className="w-5 h-5" />
          <span className="font-medium">Verified Purchase</span>
        </div>
        
        <Separator orientation="vertical" className="h-4" />
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ShoppingBagIcon className="w-4 h-4" />
          <span>Purchased {getTimeAgo(review.purchase.purchaseDate)}</span>
        </div>
        
        {review.purchase.variantPurchased && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm text-gray-600">
              Variant: {review.purchase.variantPurchased}
            </span>
          </>
        )}
      </div>
    );
  }, [showPurchaseInfo, review.purchase, variant, getTimeAgo]);

  const renderReviewContent = useCallback(() => {
    const shouldTruncate = !isExpanded && review.content.length > 300;
    const displayContent = shouldTruncate 
      ? `${review.content.substring(0, 300)}...`
      : review.content;

    return (
      <div className="space-y-4">
        {/* Title and Rating */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900 flex-1">
              {review.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {renderStars(review.rating)}
              <span className="text-sm font-medium text-gray-700">
                {review.rating}/5
              </span>
            </div>
          </div>

          {/* Quality and status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {review.isFeatured && (
              <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Featured
              </Badge>
            )}
            
            {review.isPinned && (
              <Badge variant="secondary">
                📌 Pinned
              </Badge>
            )}
            
            {review.isHighlighted && (
              <Badge variant="secondary">
                ⭐ Highlighted
              </Badge>
            )}
            
            {qualityLevel === 'high' && (
              <Badge variant="outline" className="border-green-500 text-green-700">
                High Quality
              </Badge>
            )}
            
            {review.isRecommended && (
              <Badge variant="outline" className="border-blue-500 text-blue-700">
                Recommended
              </Badge>
            )}
            
            {review.isEdited && (
              <Badge variant="outline" className="text-gray-500">
                Edited
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {displayContent}
          </p>
          
          {shouldTruncate && (
            <Button
              variant="link"
              size="sm"
              onClick={handleToggleExpanded}
              className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
            >
              Read more
            </Button>
          )}
          
          {isExpanded && review.content.length > 300 && (
            <Button
              variant="link"
              size="sm"
              onClick={handleToggleExpanded}
              className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
            >
              Show less
            </Button>
          )}
        </div>

        {/* Pros and Cons */}
        {(review.pros.length > 0 || review.cons.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {review.pros.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-green-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Pros
                </h4>
                <ul className="space-y-1">
                  {review.pros.map((pro, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-green-500 mt-1">+</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {review.cons.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Cons
                </h4>
                <ul className="space-y-1">
                  {review.cons.map((con, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-red-500 mt-1">-</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Usage context and duration */}
        {(review.usageContext || review.usageDuration) && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {review.usageContext && (
              <span className="capitalize">Used for: {review.usageContext}</span>
            )}
            {review.usageDuration && (
              <>
                {review.usageContext && <span>•</span>}
                <span>Usage: {review.usageDuration}</span>
              </>
            )}
          </div>
        )}

        {/* Tags */}
        {review.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {review.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }, [review, isExpanded, renderStars, qualityLevel, handleToggleExpanded]);

  const renderActions = useCallback(() => {
    if (!showActions) return null;

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Helpful */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={!user || isLoading.like}
            className={cn(
              'gap-2',
              localStats.isHelpful && 'text-green-600 bg-green-50 hover:bg-green-100'
            )}
          >
            <HandThumbUpIcon className={cn(
              'w-4 h-4',
              localStats.isHelpful && 'hidden'
            )} />
            <HandThumbUpSolidIcon className={cn(
              'w-4 h-4',
              !localStats.isHelpful && 'hidden'
            )} />
            <span>Helpful</span>
            {localStats.helpfulVotes > 0 && (
              <span className="font-medium">
                {formatCount(localStats.helpfulVotes)}
              </span>
            )}
          </Button>

          {/* Not Helpful */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDislike}
            disabled={!user || isLoading.dislike}
            className={cn(
              'gap-2',
              localStats.isNotHelpful && 'text-red-600 bg-red-50 hover:bg-red-100'
            )}
          >
            <HandThumbDownIcon className={cn(
              'w-4 h-4',
              localStats.isNotHelpful && 'hidden'
            )} />
            <HandThumbDownSolidIcon className={cn(
              'w-4 h-4',
              !localStats.isNotHelpful && 'hidden'
            )} />
            <span>Not helpful</span>
            {localStats.notHelpfulVotes > 0 && (
              <span className="font-medium">
                {formatCount(localStats.notHelpfulVotes)}
              </span>
            )}
          </Button>

          {/* Separator */}
          <Separator orientation="vertical" className="h-4 mx-2" />

          {/* Reply */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply?.(review.id, '')}
            disabled={!user}
            className="gap-2"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span>Reply</span>
            {localStats.replies > 0 && (
              <span className="font-medium">
                {formatCount(localStats.replies)}
              </span>
            )}
          </Button>

          {/* Bookmark */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            disabled={!user || isLoading.bookmark}
            className={cn(
              'gap-2',
              localStats.isBookmarked && 'text-blue-600 bg-blue-50 hover:bg-blue-100'
            )}
          >
            <BookmarkIcon className={cn(
              'w-4 h-4',
              localStats.isBookmarked && 'hidden'
            )} />
            <BookmarkSolidIcon className={cn(
              'w-4 h-4',
              !localStats.isBookmarked && 'hidden'
            )} />
            <span>Save</span>
          </Button>

          {/* Share */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare()}
            className="gap-2"
          >
            <ShareIcon className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>

        {/* Stats and More Actions */}
        <div className="flex items-center gap-4">
          {/* Helpfulness percentage */}
          {localStats.totalVotes > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{localStats.helpfulPercentage}% helpful</span>
              <span>({formatCount(localStats.totalVotes)} votes)</span>
            </div>
          )}

          {/* Views */}
          {localStats.views > 0 && (
            <span className="text-sm text-gray-500">
              {formatCount(localStats.views)} views
            </span>
          )}

          {/* More actions */}
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm">
                <EllipsisVerticalIcon className="w-4 h-4" />
              </Button>
            }
            items={[
              ...(!isOwner ? [{
                key: 'report',
                label: 'Report review',
                onClick: () => setShowReportDialog(true)
              }] : []),
              {
                key: 'share',
                label: 'Share review',
                onClick: () => setShowShareDialog(true)
              },
              ...(canModerate ? [{
                key: 'moderate',
                label: 'Moderate review',
                onClick: () => {}
              }] : [])
            ]}
            align="end"
          />
        </div>
      </div>
    );
  }, [
    showActions, user, isLoading, localStats, handleLike, handleDislike, 
    handleBookmark, handleShare, onReply, review.id, formatCount, 
    isOwner, canModerate
  ]);

  const renderReplies = useCallback(() => {
    if (!showReplies || review.replies.length === 0) return null;

    return (
      <div className="space-y-4">
        <Separator />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              Replies ({formatCount(review.replies.length)})
            </h4>
            
            {hasMoreReplies && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllReplies(!showAllReplies)}
                className="gap-2"
              >
                {showAllReplies ? (
                  <>
                    <ChevronUpIcon className="w-4 h-4" />
                    Show fewer
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="w-4 h-4" />
                    Show all ({formatCount(review.replies.length - maxReplies)} more)
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {displayedReplies.map((reply) => (
              <ReviewReplyItem
                key={reply.id}
                id={reply.id}
                content={reply.content}
                createdAt={reply.createdAt}
                updatedAt={reply.updatedAt}
                isEdited={reply.isEdited}
                isPinned={reply.isPinned}
                isHighlighted={reply.isHighlighted}
                likes={reply.likes}
                dislikes={reply.dislikes}
                user={{
                  id: reply.authorId,
                  displayName: reply.authorName,
                  avatar: reply.authorAvatar ? {
                    id: `avatar-${reply.authorId}`,
                    url: reply.authorAvatar,
                    alt: reply.authorName,
                    width: 40,
                    height: 40
                  } : undefined,
                  isVerified: false,
                  reviewCount: 0,
                  averageRating: 0,
                  helpfulVoteCount: 0,
                  badges: [],
                  memberSince: new Date().toISOString(),
                  lastActiveAt: new Date().toISOString(),
                  showRealName: true,
                  showLocation: false,
                  showPurchaseHistory: false,
                  reputationScore: 100,
                  trustScore: 85,
                  expertiseAreas: []
                }}
                onReply={(replyId: string, content: string) => onReply?.(review.id, content, replyId)}
                onLike={(replyId: string) => {
                  // Handle reply like
                  trackAnalytics('reply_like', { replyId });
                }}
                onDislike={(replyId: string) => {
                  // Handle reply dislike
                  trackAnalytics('reply_dislike', { replyId });
                }}
                onUserClick={(user: ReviewUser) => onAuthorClick?.(user.id)}
                className="pl-4 border-l-2 border-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }, [
    showReplies, review.replies, displayedReplies, hasMoreReplies, 
    showAllReplies, maxReplies, formatCount, review.id, 
    onReply, onAuthorClick, trackAnalytics
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(className)}
    >
      <Card className={cn(
        'overflow-hidden',
        variant === 'compact' && 'shadow-sm',
        variant === 'detailed' && 'shadow-lg',
        review.isFeatured && 'ring-2 ring-purple-200 ring-offset-2',
        review.isPinned && 'bg-gradient-to-r from-blue-50 to-purple-50'
      )}>
        <CardHeader className="pb-4">
          {renderAuthorInfo()}
          {renderPurchaseInfo()}
          
          {/* Product Info - if needed */}
          {variant === 'detailed' && review.product && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mt-3">
              <Image
                src={review.product.image}
                alt={review.product.name}
                width={48}
                height={48}
                className="rounded object-cover"
              />
              <div className="flex-1">
                <button
                  onClick={() => onProductClick?.(review.product.id)}
                  className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {review.product.name}
                </button>
                <p className="text-sm text-gray-600">{review.product.brand}</p>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {renderReviewContent()}

          {/* Media Gallery */}
          {showMedia && review.media.length > 0 && (
            <div className="space-y-4">
              {/* Media View Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PhotoIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {review.media.length} {review.media.length === 1 ? 'Photo' : 'Photos'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
                  <Button
                    variant={mediaViewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMediaViewMode('grid')}
                    className="px-2 py-1 text-xs"
                  >
                    Grid
                  </Button>
                  <Button
                    variant={mediaViewMode === 'carousel' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMediaViewMode('carousel')}
                    className="px-2 py-1 text-xs"
                  >
                    Carousel
                  </Button>
                </div>
              </div>

              {/* Dynamic Media Display */}
              {mediaViewMode === 'grid' ? (
                <ReviewMediaGallery
                  media={review.media.map(media => ({
                    id: media.id,
                    type: media.type,
                    url: media.url,
                    thumbnail: media.thumbnailUrl || media.url,
                    alt: media.alt || media.caption || `Review media ${review.media.indexOf(media) + 1}`,
                    caption: media.caption,
                    width: media.width || 400,
                    height: media.height || 400,
                    duration: media.duration
                  }))}
                  variant="grid"
                  gridColumns={variant === 'compact' ? 2 : 3}
                  aspectRatio="square"
                  showCaptions={true}
                  showMetadata={false}
                  enableZoom={true}
                  enableFullscreen={true}
                  onMediaClick={(mediaItem, index) => {
                    setSelectedMediaIndex(index);
                    setMediaViewMode('carousel');
                    onMediaClick?.(mediaItem.id, index);
                    trackAnalytics('review_media_click', { 
                      mediaId: mediaItem.id, 
                      index, 
                      viewMode: 'grid',
                      totalMedia: review.media.length 
                    });
                  }}
                  className="rounded-lg overflow-hidden"
                />
              ) : (
                <ReviewMediaCarousel
                  media={review.media.map(media => ({
                    id: media.id,
                    type: media.type,
                    url: media.url,
                    thumbnailUrl: media.thumbnailUrl || media.url,
                    alt: media.alt || media.caption || `Review media ${review.media.indexOf(media) + 1}`,
                    caption: media.caption,
                    dimensions: {
                      width: media.width || 800,
                      height: media.height || 600
                    },
                    duration: media.duration,
                    uploadedAt: new Date(),
                    uploadedBy: {
                      id: review.authorId,
                      name: review.author.displayName,
                      avatar: review.author.avatar
                    },
                    status: 'ready' as const
                  }))}
                  variant="carousel"
                  settings={{
                    showThumbnails: review.media.length > 1,
                    showControls: true,
                    allowFullscreen: true,
                    autoPlay: false,
                    loop: true
                  }}
                  enableKeyboard={true}
                  enableSwipe={true}
                  onMediaChange={(index: number, media: MediaItem) => {
                    setSelectedMediaIndex(index);
                    trackAnalytics('review_media_change', { 
                      index, 
                      mediaId: media.id,
                      viewMode: 'carousel',
                      totalMedia: review.media.length 
                    });
                  }}
                  onMediaLoad={(media: MediaItem) => {
                    trackAnalytics('review_media_click', { 
                      mediaId: media.id,
                      index: selectedMediaIndex,
                      viewMode: 'carousel'
                    });
                  }}
                  className="rounded-lg overflow-hidden bg-gray-100"
                />
              )}
              
              {/* Media Summary Info */}
              {review.media.length > 0 && (
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <span>
                      {review.media.filter(m => m.type === 'image').length} images
                    </span>
                    {review.media.filter(m => m.type === 'video').length > 0 && (
                      <span>
                        {review.media.filter(m => m.type === 'video').length} videos
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMediaViewMode(mediaViewMode === 'grid' ? 'carousel' : 'grid')}
                    className="text-xs h-auto p-1 text-blue-600 hover:text-blue-800"
                  >
                    Switch to {mediaViewMode === 'grid' ? 'Carousel' : 'Grid'} View
                  </Button>
                </div>
              )}
            </div>
          )}

          {renderActions()}
          {renderReplies()}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AnimatePresence>
        {showReportDialog && (
          <Dialog open={showReportDialog} onClose={() => setShowReportDialog(false)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-4">
                <p className="text-sm text-gray-600">
                  Why are you reporting this review?
                </p>
                {/* Report form would go here */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowReportDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await onReport?.(review.id, 'inappropriate', 'User reported content');
                      setShowReportDialog(false);
                    }}
                  >
                    Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {showShareDialog && (
          <Dialog open={showShareDialog} onClose={() => setShowShareDialog(false)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-4">
                <p className="text-sm text-gray-600">
                  Share this review with others
                </p>
                {/* Share options would go here */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowShareDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      handleShare('link');
                      setShowShareDialog(false);
                    }}
                  >
                    Copy Link
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReviewCard;
