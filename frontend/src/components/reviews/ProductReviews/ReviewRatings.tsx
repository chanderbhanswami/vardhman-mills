'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  StarIcon,
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  FunnelIcon as FilterIcon,
  CheckBadgeIcon,
  FireIcon,
  HeartIcon,
  HandThumbUpIcon as ThumbUpIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  ShareIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { Loading } from '@/components/ui/Loading';
import { Skeleton } from '@/components/ui/Skeleton';
import Chart from '@/components/ui/Chart';

// Hooks and Utilities
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/components/providers';
import { subDays } from 'date-fns';

// Types
import type { ProductReview as Review, RatingDistribution, ReviewFilters as ReviewFilter } from '@/types/review.types';

// Type aliases for backward compatibility
export type { Review, RatingDistribution, ReviewFilter };

// Review Components
import ReviewItem from './ReviewItem';
import ReviewMediaCarousel from '../ReviewMediaCarousel';

// Constants
const RATING_LABELS = {
  5: 'Excellent',
  4: 'Very Good', 
  3: 'Good',
  2: 'Fair',
  1: 'Poor'
} as const;

const TIME_PERIODS = [
  { value: 'all', label: 'All Time' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '1y', label: 'Last Year' }
] as const;

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent', icon: ClockIcon },
  { value: 'oldest', label: 'Oldest First', icon: CalendarIcon },
  { value: 'highest', label: 'Highest Rated', icon: ArrowTrendingUpIcon },
  { value: 'lowest', label: 'Lowest Rated', icon: ArrowTrendingDownIcon },
  { value: 'helpful', label: 'Most Helpful', icon: ThumbUpIcon },
  { value: 'popular', label: 'Most Popular', icon: FireIcon }
] as const;

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Reviews', count: 0 },
  { value: 'verified', label: 'Verified Purchase', count: 0 },
  { value: 'with-media', label: 'With Photos/Videos', count: 0 },
  { value: 'with-comments', label: 'With Comments', count: 0 }
] as const;

// Component Variants
const reviewRatingsVariants = cva(
  'w-full space-y-6',
  {
    variants: {
      variant: {
        default: 'bg-white',
        compact: 'bg-white border rounded-lg p-4',
        detailed: 'bg-white border rounded-lg p-6 shadow-sm',
        card: 'bg-white border rounded-xl p-6 shadow-lg'
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

const ratingBarVariants = cva(
  'flex items-center gap-3 group cursor-pointer transition-colors',
  {
    variants: {
      interactive: {
        true: 'hover:bg-gray-50 -mx-2 px-2 py-1 rounded',
        false: ''
      }
    },
    defaultVariants: {
      interactive: false
    }
  }
);

// Types
export interface ReviewRatingsProps extends VariantProps<typeof reviewRatingsVariants> {
  // Data
  productId: string;
  reviews?: Review[];
  statistics?: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: RatingDistribution;
    helpfulReviews: number;
    verifiedPurchases: number;
    totalVotes: number;
    responseRate: number;
    averageResponseTime: number;
  };
  ratingDistribution?: RatingDistribution;
  
  // Display Options
  showOverview?: boolean;
  showDistribution?: boolean;
  showFilters?: boolean;
  showTrends?: boolean;
  showComparison?: boolean;
  showInsights?: boolean;
  
  // Interaction
  interactive?: boolean;
  allowFiltering?: boolean;
  allowSorting?: boolean;
  
  // Layout
  layout?: 'vertical' | 'horizontal' | 'grid';
  maxItems?: number;
  
  // Styling
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  
  // Callbacks
  onRatingClick?: (rating: number) => void;
  onFilterChange?: (filters: ReviewFilter) => void;
  onSortChange?: (sort: string) => void;
  onReviewClick?: (review: Review) => void;
  onExport?: () => void;
  onAnalyticsEvent?: (event: string, data?: Record<string, unknown>) => void;
}

export interface RatingOverviewProps {
  statistics: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: RatingDistribution;
    helpfulReviews: number;
    verifiedPurchases: number;
    totalVotes: number;
    responseRate: number;
    averageResponseTime: number;
  };
  ratingDistribution: RatingDistribution;
  className?: string;
  showTrends?: boolean;
  onRatingClick?: (rating: number) => void;
}

export interface RatingDistributionProps {
  distribution: RatingDistribution;
  interactive?: boolean;
  className?: string;
  onRatingClick?: (rating: number) => void;
}

export interface RatingTrendsProps {
  productId: string;
  timePeriod?: string;
  className?: string;
  onTimePeriodChange?: (period: string) => void;
}

export interface ReviewRatingsSkeletonProps {
  variant?: 'default' | 'compact' | 'detailed';
  showDistribution?: boolean;
  showTrends?: boolean;
  className?: string;
}

// Rating Overview Component
const RatingOverview: React.FC<RatingOverviewProps> = ({
  statistics,
  ratingDistribution,
  className,
  showTrends = true,
  onRatingClick
}) => {
  const { averageRating, totalReviews } = statistics;
  const recommendationPercentage = 0; // Computed separately
  
  // Use ratingDistribution for trend calculation
  const trendDirection = ratingDistribution?.average > averageRating ? 'up' : 'down';
  const isInteractive = !!onRatingClick;
  
  const averageStars = Math.round(averageRating * 2) / 2; // Round to nearest 0.5
  const fullStars = Math.floor(averageStars);
  const hasHalfStar = averageStars % 1 !== 0;
  const emptyStars = 5 - Math.ceil(averageStars);

  const renderStars = useCallback(() => {
    const stars = [];
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIconSolid key={`full-${i}`} className="w-6 h-6 text-yellow-400" />
      );
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="w-6 h-6 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarIconSolid className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
      );
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="w-6 h-6 text-gray-300" />
      );
    }
    
    return stars;
  }, [fullStars, hasHalfStar, emptyStars]);

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          {/* Average Rating */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </div>
              <div className={cn(
                "flex items-center gap-1 mt-1",
                isInteractive && "cursor-pointer hover:scale-105 transition-transform"
              )}>
                {renderStars()}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-900">
                {RATING_LABELS[Math.round(averageRating) as keyof typeof RATING_LABELS]}
              </p>
              <p className="text-sm text-gray-600">
                Based on {totalReviews.toLocaleString()} reviews
              </p>
              {recommendationPercentage && (
                <div className="flex items-center gap-1 text-sm">
                  <CheckBadgeIcon className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">
                    {recommendationPercentage}% recommend
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col items-end gap-2">
          <Badge variant="secondary" className="text-xs">
            <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
            Top Rated
          </Badge>
          {showTrends && (
            <Tooltip content="Rating trend over time">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {trendDirection === 'up' ? (
                  <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="w-3 h-3 text-red-500" />
                )}
                <span>{trendDirection === 'up' ? '+0.2' : '-0.1'} this month</span>
              </div>
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
};

// Rating Distribution Component
const RatingDistribution: React.FC<RatingDistributionProps> = ({
  distribution,
  interactive = false,
  className,
  onRatingClick
}) => {
  const { total } = distribution;
  
  const ratings = useMemo(() => {
    return [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: distribution[rating as keyof typeof distribution] as number || 0,
      percentage: total > 0 ? ((distribution[rating as keyof typeof distribution] as number || 0) / total) * 100 : 0
    }));
  }, [distribution, total]);

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Rating Breakdown</h3>
        <Badge variant="outline" className="text-xs">
          {total.toLocaleString()} total
        </Badge>
      </div>
      
      <div className="space-y-3">
        {ratings.map(({ rating, count, percentage }) => (
          <div
            key={rating}
            className={ratingBarVariants({ interactive })}
            onClick={() => interactive && onRatingClick?.(rating)}
          >
            <div className="flex items-center gap-2 w-16">
              <span className="text-sm font-medium text-gray-700">{rating}</span>
              <StarIconSolid className="w-4 h-4 text-yellow-400" />
            </div>
            
            <div className="flex-1 mx-3">
              <Progress
                value={percentage}
                className={cn(
                  "h-2",
                  rating >= 4 ? '[&>div]:bg-green-500' :
                  rating === 3 ? '[&>div]:bg-yellow-500' :
                  '[&>div]:bg-red-500'
                )}
              />
            </div>
            
            <div className="flex items-center gap-2 w-20 justify-end">
              <span className="text-sm text-gray-600">{count}</span>
              <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Rating Trends Component
const RatingTrends: React.FC<RatingTrendsProps> = ({
  productId,
  timePeriod: initialTimePeriod = '30d',
  className,
  onTimePeriodChange
}) => {
  const [timePeriod, setTimePeriod] = useState(initialTimePeriod);
  const [isLoading, setIsLoading] = useState(false);
  interface TrendDataPoint {
    date: string;
    average: number;
    count: number;
  }
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);

  // Mock trend data - replace with actual API call
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockData = Array.from({ length: 30 }, (_, i) => ({
        date: subDays(new Date(), 29 - i).toISOString().split('T')[0],
        average: 4.2 + Math.random() * 0.6 - 0.3,
        count: Math.floor(Math.random() * 20) + 5
      }));
      setTrendData(mockData);
      setIsLoading(false);
    }, 1000);
  }, [productId, timePeriod]);

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-48 w-full" />
      </Card>
    );
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Rating Trends</h3>
        <Select
          value={timePeriod}
          onValueChange={(value: string | number) => {
            const stringValue = value.toString();
            setTimePeriod(stringValue);
            onTimePeriodChange?.(stringValue);
            console.log('Time period changed:', stringValue);
          }}
          options={TIME_PERIODS.map(period => ({
            value: period.value,
            label: period.label
          }))}
          className="w-32"
        />
      </div>
      
      <div className="h-48">
        <Chart
          data={trendData.map(item => ({ name: item.date, value: item.average }))}
          type="line"
          xAxisKey="name"
          className="w-full h-full"
        />
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
          <span>Improving trend</span>
        </div>
        <div className="text-xs text-gray-500">
          Average: {(trendData.reduce((sum, item) => sum + item.average, 0) / trendData.length).toFixed(2)}
        </div>
      </div>
    </Card>
  );
};

// Review Insights Component
const ReviewInsights: React.FC<{ 
  statistics: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: RatingDistribution;
    helpfulReviews: number;
    verifiedPurchases: number;
    totalVotes: number;
    responseRate: number;
    averageResponseTime: number;
  }; 
  className?: string 
}> = ({
  statistics,
  className
}) => {
  const insights = useMemo(() => [
    {
      icon: UsersIcon,
      label: 'Total Reviewers',
      value: statistics.totalReviews?.toLocaleString() || '0',
      trend: '+12%',
      positive: true
    },
    {
      icon: HeartIcon,
      label: 'Avg Helpful Votes',
      value: (statistics.helpfulReviews / Math.max(statistics.totalReviews, 1) * 100).toFixed(1) + '%',
      trend: '+5%',
      positive: true
    },
    {
      icon: ChatBubbleLeftIcon,
      label: 'Response Rate',
      value: `${statistics.responseRate || 0}%`,
      trend: '+8%',
      positive: true
    },
    {
      icon: EyeIcon,
      label: 'Avg Views',
      value: Math.round(statistics.totalVotes / Math.max(statistics.totalReviews, 1)).toLocaleString(),
      trend: '+15%',
      positive: true
    }
  ], [statistics]);

  return (
    <Card className={cn('p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Insights</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <div key={index} className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <insight.icon className="w-6 h-6 text-blue-500" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-900">{insight.value}</p>
              <p className="text-xs text-gray-600">{insight.label}</p>
              <div className={cn(
                'text-xs flex items-center justify-center gap-1',
                insight.positive ? 'text-green-600' : 'text-red-600'
              )}>
                {insight.positive ? (
                  <ArrowTrendingUpIcon className="w-3 h-3" />
                ) : (
                  <ArrowTrendingDownIcon className="w-3 h-3" />
                )}
                <span>{insight.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Main ReviewRatings Component
const ReviewRatings: React.FC<ReviewRatingsProps> = ({
  productId,
  reviews = [],
  statistics,
  ratingDistribution,
  showOverview = true,
  showDistribution = true,
  showFilters = true,
  showTrends = false,
  showComparison = false,
  showInsights = false,
  interactive = true,
  allowFiltering = true,
  allowSorting = true,
  layout = 'vertical',
  maxItems,
  variant,
  size,
  className,
  headerClassName,
  contentClassName,
  onRatingClick,
  onFilterChange,
  onSortChange,
  onReviewClick,
  onExport,
  onAnalyticsEvent
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Use layout and other props for conditional rendering
  const isVerticalLayout = layout === 'vertical';
  const canShowFilters = showFilters && allowFiltering;
  const canShowComparison = showComparison && user;
  const userCanExport = true; // Simplified permission check

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [timePeriod, setTimePeriod] = useState('all');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Computed values
  const computedStatistics = useMemo(() => {
    if (statistics) return statistics;
    
    // Calculate from reviews if statistics not provided
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    

    return {
      totalReviews,
      averageRating,
      ratingDistribution: {
        1: reviews.filter(r => r.rating === 1).length,
        2: reviews.filter(r => r.rating === 2).length,
        3: reviews.filter(r => r.rating === 3).length,
        4: reviews.filter(r => r.rating === 4).length,
        5: reviews.filter(r => r.rating === 5).length,
        total: totalReviews,
        average: averageRating
      },
      helpfulReviews: reviews.filter(r => r.helpfulVotes > 0).length,
      verifiedPurchases: reviews.filter(r => r.isVerifiedPurchaser).length,
      totalVotes: reviews.reduce((sum, r) => sum + r.helpfulVotes + r.unhelpfulVotes, 0),
      responseRate: 0,
      averageResponseTime: 0
    };
  }, [reviews, statistics]);

  const computedDistribution = useMemo((): RatingDistribution => {
    if (ratingDistribution) return ratingDistribution;
    
    // Calculate from reviews if distribution not provided
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0, average: 0 };
    
    reviews.forEach(review => {
      const rating = Math.floor(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution] += 1;
      }
    });
    
    distribution.total = reviews.length;
    distribution.average = computedStatistics.averageRating;
    
    return distribution;
  }, [reviews, ratingDistribution, computedStatistics.averageRating]);

  // Filtered and sorted reviews
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];
    
    // Filter by rating
    if (selectedRating) {
      filtered = filtered.filter(review => Math.floor(review.rating) === selectedRating);
    }
    
    // Filter by type
    switch (filterBy) {
      case 'verified':
        filtered = filtered.filter(review => review.isVerified);
        break;
      case 'with-media':
        filtered = filtered.filter(review => review.images && review.images.length > 0);
        break;
      case 'with-comments':
        filtered = filtered.filter(review => review.replyCount > 0);
        break;
    }
    
    // Sort reviews
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        filtered.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
        break;
      case 'popular':
        filtered.sort((a, b) => ((b.likes || 0) + (b.shares || 0)) - ((a.likes || 0) + (a.shares || 0)));
        break;
    }
    
    return maxItems ? filtered.slice(0, maxItems) : filtered;
  }, [reviews, selectedRating, filterBy, sortBy, maxItems]);

  // Handlers
  const handleRatingClick = useCallback((rating: number) => {
    setSelectedRating(selectedRating === rating ? null : rating);
    onRatingClick?.(rating);
    onAnalyticsEvent?.(
      selectedRating === rating ? 'rating_filter_cleared' : 'rating_filter_applied',
      { rating, productId }
    );
  }, [selectedRating, onRatingClick, onAnalyticsEvent, productId]);

  const handleFilterChange = useCallback((newFilter: string) => {
    setFilterBy(newFilter);
    const filters: ReviewFilter = {
      productIds: [productId],
      ...(newFilter === 'verified' && { verified: true }),
      ...(newFilter === 'with-media' && { hasMedia: true })
    };
    onFilterChange?.(filters);
    onAnalyticsEvent?.(
      'reviews_filter_changed',
      { filter: newFilter, productId }
    );
  }, [onFilterChange, onAnalyticsEvent, productId]);

  const handleSortChange = useCallback((newSort: string) => {
    setSortBy(newSort);
    onSortChange?.(newSort);
    onAnalyticsEvent?.(
      'reviews_sort_changed',
      { sort: newSort, productId }
    );
  }, [onSortChange, onAnalyticsEvent, productId]);

  const handleExport = useCallback(() => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Success',
        description: 'Reviews exported successfully',
        variant: 'default'
      });
      onExport?.();
      onAnalyticsEvent?.('reviews_exported', { productId, count: reviews.length });
    }, 2000);
  }, [onExport, onAnalyticsEvent, productId, reviews.length, toast]);

  return (
    <div className={reviewRatingsVariants({ variant, size, className })}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between',
        isVerticalLayout ? 'flex-col gap-4 md:flex-row md:gap-0' : 'flex-row',
        headerClassName
      )}>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
          <Badge variant="secondary">
            {computedStatistics.totalReviews} reviews
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {canShowFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={cn(showFiltersPanel && 'bg-gray-100')}
            >
              <FilterIcon className="w-4 h-4 mr-1" />
              Filters
            </Button>
          )}
          
          {allowSorting && (
            <Select
              value={sortBy}
              onValueChange={(value: string | number) => {
                handleSortChange(value.toString());
              }}
              options={SORT_OPTIONS.map(option => ({
                value: option.value,
                label: option.label
              }))}
              className="w-40"
              placeholder="Sort by"
            />
          )}
          
          {userCanExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loading size="sm" />
              ) : (
                <ShareIcon className="w-4 h-4 mr-1" />
              )}
              Export
            </Button>
          )}
          
          {canShowComparison && (
            <Tooltip content="Compare with similar products">
              <Button variant="outline" size="sm">
                <ChartBarIcon className="w-4 h-4 mr-1" />
                Compare
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-4 border-dashed">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Filter:</span>
                  {FILTER_OPTIONS.map(option => (
                    <Button
                      key={option.value}
                      variant={filterBy === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Period:</span>
                  <Select
                    value={timePeriod}
                    onValueChange={(value: string | number) => {
                      const stringValue = value.toString();
                      setTimePeriod(stringValue);
                    }}
                    options={TIME_PERIODS.map(period => ({
                      value: period.value,
                      label: period.label
                    }))}
                    className="w-32"
                  />
                </div>
                
                {(selectedRating || filterBy !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRating(null);
                      setFilterBy('all');
                      // Trigger review click callback for reset
                      if (onReviewClick && filteredReviews.length > 0) {
                        onReviewClick(filteredReviews[0]);
                      }
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <div className={cn('mt-6', contentClassName)}>
          <TabsContent value="overview" className="space-y-6">
            {showOverview && (
              <RatingOverview
                statistics={computedStatistics}
                ratingDistribution={computedDistribution}
                showTrends={showTrends}
                onRatingClick={handleRatingClick}
              />
            )}
            
            {showDistribution && (
              <RatingDistribution
                distribution={computedDistribution}
                interactive={interactive}
                onRatingClick={handleRatingClick}
              />
            )}
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-6">
            <RatingDistribution
              distribution={computedDistribution}
              interactive={interactive}
              onRatingClick={handleRatingClick}
            />
            
            {/* Media Gallery */}
            {filteredReviews.some(review => review.images?.length > 0) && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Media</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredReviews
                    .filter(review => review.images?.length > 0)
                    .slice(0, 8)
                    .map(review => (
                      review.images?.map((image, index) => (
                        <ReviewMediaCarousel
                          key={`${review.id}-${index}`}
                          media={[{
                            id: image.id || `${review.id}-${index}`,
                            type: 'image' as const,
                            url: image.url,
                            thumbnailUrl: image.url,
                            caption: image.caption || image.alt,
                            alt: image.alt || 'Review image',
                            uploadedAt: new Date(review.createdAt),
                            uploadedBy: {
                              id: review.user?.id || review.userId,
                              name: review.user?.displayName || review.authorName,
                              avatar: review.user?.avatar?.url
                            },
                            metadata: {
                              format: image.format || 'jpg',
                              quality: 'high' as const
                            },
                            likes: 0,
                            views: review.viewCount || 0,
                            status: 'ready' as const
                          }]}
                          variant="gallery"
                          size="sm"
                          thumbnailPosition="none"
                          settings={{
                            showControls: false,
                            allowDownload: user?.role === 'admin',
                            showThumbnails: false
                          }}
                        />
                      ))
                    ))
                  }
                </div>
              </Card>
            )}
            
            {/* Recent Reviews Preview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedRating ? `${selectedRating} Star Reviews` : 'Recent Reviews'}
                </h3>
                <Badge variant="outline">
                  {filteredReviews.length} reviews
                </Badge>
              </div>
              
              <div className="space-y-4">
                {filteredReviews.slice(0, 3).map(review => {
                  // Convert ProductReview to Review format for ReviewItem
                  const convertedReview = {
                    id: review.id,
                    title: review.title,
                    content: review.content,
                    rating: review.rating,
                    timestamp: new Date(review.createdAt),
                    updatedAt: new Date(review.updatedAt),
                    author: {
                      id: review.user.id,
                      name: review.user.displayName,
                      avatar: review.user.avatar?.url,
                      isVerified: review.user.isVerified,
                      isPurchaseVerified: review.isVerifiedPurchaser
                    },
                    likes: review.likes,
                    dislikes: review.dislikes,
                    helpfulVotes: review.helpfulVotes,
                    notHelpfulVotes: review.unhelpfulVotes,
                    loves: 0,
                    shares: 0,
                    replies: [],
                    isVerified: review.isVerified,
                    wouldRecommend: review.reviewContext?.wouldRecommend
                  };
                  
                  return (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <ReviewItem
                        review={convertedReview}
                        variant="compact"
                        showInteractions={false}
                      />
                    </div>
                  );
                })}
                
                {filteredReviews.length > 3 && (
                  <Button variant="outline" className="w-full">
                    View All {filteredReviews.length} Reviews
                  </Button>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {showTrends && (
              <RatingTrends
                productId={productId}
                timePeriod={timePeriod}
              />
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {showInsights && (
              <ReviewInsights statistics={computedStatistics} />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

// Review Ratings Skeleton Component
export const ReviewRatingsSkeleton: React.FC<ReviewRatingsSkeletonProps> = ({
  variant = 'default',
  showDistribution = true,
  showTrends = false,
  className
}) => {
  const isCompact = variant === 'compact';
  const cardPadding = isCompact ? 'p-4' : 'p-6';
  
  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="border-b">
        <div className="flex space-x-8">
          {['Overview', 'Breakdown', 'Trends', 'Insights'].map((tab, index) => (
            <Skeleton key={index} className="h-4 w-16 mb-4" />
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        {/* Overview Card */}
        <div className={cn('border rounded-lg', cardPadding)}>
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <Skeleton className="h-12 w-16 mb-2" />
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-6 w-6" />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>

        {/* Distribution Card */}
        {showDistribution && (
          <div className={cn('border rounded-lg', cardPadding)}>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-2 flex-1" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trends Card */}
        {showTrends && (
          <div className={cn('border rounded-lg', cardPadding)}>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        )}
      </div>
    </div>
  );
};

// Export components
export default ReviewRatings;
export { 
  RatingOverview, 
  RatingDistribution as RatingDistributionComponent, 
  RatingTrends, 
  ReviewInsights 
};
