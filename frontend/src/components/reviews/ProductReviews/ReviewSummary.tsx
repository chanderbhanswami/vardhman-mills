'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StarIcon,
  UserIcon,
  PhotoIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  ShieldCheckIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  ClockIcon,
  TagIcon,
  HeartIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid,
  HeartIcon as HeartIconSolid,
  TrophyIcon as TrophyIconSolid
} from '@heroicons/react/24/solid';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Tabs } from '@/components/ui/Tabs';
import { Tooltip } from '@/components/ui/Tooltip';
import { Chart } from '@/components/ui';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, parseISO } from 'date-fns';

// Types
export interface ReviewStatistics {
  // Overall metrics
  totalReviews: number;
  averageRating: number;
  totalRatings: number;
  
  // Rating distribution
  ratingDistribution: Record<number, number>;
  ratingTrends: Array<{
    period: string;
    averageRating: number;
    count: number;
  }>;
  
  // User metrics
  totalUsers: number;
  verifiedUsers: number;
  repeatCustomers: number;
  newUsers: number;
  
  // Content metrics
  reviewsWithMedia: number;
  reviewsWithImages: number;
  reviewsWithVideos: number;
  reviewsWithAudio: number;
  averageReviewLength: number;
  totalWords: number;
  
  // Interaction metrics
  totalLikes: number;
  totalShares: number;
  totalHelpfulVotes: number;
  totalReplies: number;
  averageEngagement: number;
  
  // Quality metrics
  moderatedReviews: number;
  featuredReviews: number;
  reportedReviews: number;
  verifiedPurchases: number;
  
  // Time metrics
  reviewsThisMonth: number;
  reviewsLastMonth: number;
  averageResponseTime: number;
  
  // Recommendation metrics
  wouldRecommend: number;
  wouldNotRecommend: number;
  recommendationRate: number;
  
  // Advanced analytics
  sentimentScore: number;
  topTags: Array<{ tag: string; count: number; sentiment: number }>;
  userLevels: Record<string, number>;
  topReviewers: Array<{
    userId: string;
    username: string;
    reviewCount: number;
    averageRating: number;
    totalLikes: number;
  }>;
  
  // Comparative metrics
  competitorComparison?: {
    averageRating: number;
    reviewCount: number;
    responseRate: number;
  };
}

export interface ReviewSummaryProps {
  // Data
  statistics: ReviewStatistics;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  
  // Display options
  variant?: 'default' | 'compact' | 'detailed' | 'dashboard';
  showOverview?: boolean;
  showRatingBreakdown?: boolean;
  showTrends?: boolean;
  showUserMetrics?: boolean;
  showContentMetrics?: boolean;
  showEngagementMetrics?: boolean;
  showQualityMetrics?: boolean;
  showTopReviewers?: boolean;
  showSentimentAnalysis?: boolean;
  showComparison?: boolean;
  showExportOptions?: boolean;
  
  // Customization
  highlightMetrics?: string[];
  hideMetrics?: string[];
  customMetrics?: Array<{
    key: string;
    label: string;
    value: number | string;
    type: 'number' | 'percentage' | 'currency' | 'duration';
    icon?: React.ComponentType<{ className?: string }>;
    description?: string;
  }>;
  
  // Filtering
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
  productVariant?: string;
  userSegment?: string;
  
  // Styling
  className?: string;
  cardClassName?: string;
  metricClassName?: string;
  
  // Callbacks
  onMetricClick?: (metric: string, value: number | string) => void;
  onTimeRangeChange?: (range: string) => void;
  onExport?: (format: 'csv' | 'pdf' | 'json') => void;
  onDrillDown?: (metric: string, filters: Record<string, unknown>) => void;
  
  // Analytics
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

// Metric display component
const MetricCard: React.FC<{
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  type?: 'number' | 'percentage' | 'currency' | 'duration' | 'rating';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  comparison?: {
    value: number;
    label: string;
  };
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  type = 'number',
  trend,
  trendValue,
  comparison,
  color = 'default',
  size = 'md',
  onClick,
  className
}) => {
  const formatValue = useCallback((val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (type) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'duration':
        return `${val}h`;
      case 'rating':
        return val.toFixed(1);
      default:
        return val.toLocaleString();
    }
  }, [type]);

  const getColorClasses = useCallback(() => {
    switch (color) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'danger':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-900 bg-white border-gray-200';
    }
  }, [color]);

  const getSizeClasses = useCallback(() => {
    switch (size) {
      case 'sm':
        return 'p-3';
      case 'lg':
        return 'p-6';
      default:
        return 'p-4';
    }
  }, [size]);

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md cursor-pointer',
        getColorClasses(),
        getSizeClasses(),
        onClick && 'hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {Icon && <Icon className="w-4 h-4" />}
            <h3 className={cn(
              'font-medium',
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
            )}>
              {title}
            </h3>
          </div>
          
          <div className={cn(
            'font-bold',
            size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl'
          )}>
            {formatValue(value)}
          </div>
          
          {subtitle && (
            <p className={cn(
              'text-gray-600 mt-1',
              size === 'sm' ? 'text-xs' : 'text-sm'
            )}>
              {subtitle}
            </p>
          )}
          
          {comparison && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-500">vs {comparison.label}:</span>
              <span className={cn(
                'text-xs font-medium',
                comparison.value > 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {comparison.value > 0 ? '+' : ''}{comparison.value}%
              </span>
            </div>
          )}
        </div>
        
        {trend && trendValue !== undefined && (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            trend === 'up' && 'bg-green-100 text-green-700',
            trend === 'down' && 'bg-red-100 text-red-700',
            trend === 'neutral' && 'bg-gray-100 text-gray-700'
          )}>
            {trend === 'up' && <TrendingUpIcon className="w-3 h-3" />}
            {trend === 'down' && <TrendingDownIcon className="w-3 h-3" />}
            {Math.abs(trendValue)}%
          </div>
        )}
      </div>
    </Card>
  );
};

// Rating breakdown component
const RatingBreakdown: React.FC<{
  distribution: Record<number, number>;
  totalReviews: number;
  averageRating: number;
  className?: string;
}> = ({ distribution, totalReviews, averageRating, className }) => {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center gap-2 mb-6">
        <StarIconSolid className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold">Rating Breakdown</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {Array.from({ length: 5 }, (_, i) => (
              <StarIconSolid
                key={i}
                className={cn(
                  'w-5 h-5',
                  i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Based on {totalReviews.toLocaleString()} reviews
          </p>
        </div>

        {/* Distribution bars */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = distribution[rating] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{rating}</span>
                  <StarIconSolid className="w-3 h-3 text-yellow-400" />
                </div>
                
                <div className="flex-1">
                  <Progress 
                    value={percentage} 
                    className={cn(
                      'h-3',
                      rating >= 4 && '[&>div]:bg-green-500',
                      rating === 3 && '[&>div]:bg-yellow-500',
                      rating <= 2 && '[&>div]:bg-red-500'
                    )}
                  />
                </div>
                
                <div className="flex items-center gap-2 w-20">
                  <span className="text-sm text-gray-600">
                    {percentage.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">
                    ({count})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

// Sentiment analysis component
const SentimentAnalysis: React.FC<{
  sentimentScore: number;
  topTags: Array<{ tag: string; count: number; sentiment: number }>;
  wouldRecommend: number;
  wouldNotRecommend: number;
  className?: string;
}> = ({ sentimentScore, topTags, wouldRecommend, wouldNotRecommend, className }) => {
  const totalRecommendations = wouldRecommend + wouldNotRecommend;
  const recommendationRate = totalRecommendations > 0 ? (wouldRecommend / totalRecommendations) * 100 : 0;

  const getSentimentColor = (score: number) => {
    if (score >= 0.6) return 'text-green-600';
    if (score >= 0.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentLabel = (score: number) => {
    if (score >= 0.7) return 'Very Positive';
    if (score >= 0.4) return 'Positive';
    if (score >= 0.1) return 'Neutral';
    if (score >= -0.3) return 'Negative';
    return 'Very Negative';
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center gap-2 mb-6">
        <SparklesIcon className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold">Sentiment Analysis</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall sentiment */}
        <div className="space-y-4">
          <div className="text-center">
            <div className={cn('text-3xl font-bold mb-2', getSentimentColor(sentimentScore))}>
              {getSentimentLabel(sentimentScore)}
            </div>
            <div className="text-sm text-gray-600">
              Sentiment Score: {(sentimentScore * 100).toFixed(1)}%
            </div>
          </div>

          {/* Recommendation rate */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Would Recommend</span>
              <span className="text-lg font-bold text-green-600">
                {recommendationRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={recommendationRate} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Yes: {wouldRecommend}</span>
              <span>No: {wouldNotRecommend}</span>
            </div>
          </div>
        </div>

        {/* Top sentiment tags */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Top Mentioned Topics</h4>
          <div className="space-y-2">
            {topTags.slice(0, 6).map((tag, index) => (
              <div key={tag.tag} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" size="sm">
                    #{index + 1}
                  </Badge>
                  <TagIcon className="w-3 h-3 text-gray-400" />
                  <Badge 
                    variant={tag.sentiment >= 0.5 ? 'success' : tag.sentiment >= 0 ? 'warning' : 'destructive'}
                    size="sm"
                  >
                    {tag.tag}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {tag.count} mentions
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <EyeIcon className="w-3 h-3 text-gray-400" />
                  <div className={cn(
                    'text-xs font-medium flex items-center gap-1',
                    tag.sentiment >= 0.5 ? 'text-green-600' : 
                    tag.sentiment >= 0 ? 'text-yellow-600' : 'text-red-600'
                  )}>
                    {tag.sentiment >= 0.5 ? (
                      <HandThumbUpIconSolid className="w-3 h-3" />
                    ) : tag.sentiment >= 0 ? (
                      <SpeakerWaveIcon className="w-3 h-3" />
                    ) : (
                      <HandThumbDownIcon className="w-3 h-3" />
                    )}
                    {tag.sentiment >= 0.5 ? 'Positive' : tag.sentiment >= 0 ? 'Neutral' : 'Negative'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Top reviewers component
const TopReviewers: React.FC<{
  reviewers: Array<{
    userId: string;
    username: string;
    reviewCount: number;
    averageRating: number;
    totalLikes: number;
  }>;
  className?: string;
}> = ({ reviewers, className }) => {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center gap-2 mb-6">
        <TrophyIconSolid className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Top Contributors</h3>
      </div>

      <div className="space-y-4">
        {reviewers.slice(0, 5).map((reviewer, index) => (
          <div key={reviewer.userId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full font-bold text-sm">
              #{index + 1}
            </div>
            
            <div className="flex-1">
              <div className="font-medium text-gray-900">{reviewer.username}</div>
              <div className="text-sm text-gray-600">
                {reviewer.reviewCount} reviews • {reviewer.averageRating.toFixed(1)} avg rating
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <HeartIconSolid className="w-4 h-4 text-red-500" />
              {reviewer.totalLikes}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Trends chart component
const TrendsChart: React.FC<{
  trends: Array<{
    period: string;
    averageRating: number;
    count: number;
  }>;
  className?: string;
}> = ({ trends, className }) => {
  const chartData = trends.map(trend => ({
    name: trend.period,
    rating: trend.averageRating,
    reviews: trend.count
  }));

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center gap-2 mb-6">
        <ChartBarIcon className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Rating Trends</h3>
      </div>

      <div className="w-full h-80">
        <Chart
          data={chartData}
          type="line"
          xAxisKey="name"
          lines={[
            { key: 'rating', color: '#f59e0b', name: 'Average Rating' },
            { key: 'reviews', color: '#3b82f6', name: 'Review Count', yAxis: 'right' }
          ]}
        />
      </div>
    </Card>
  );
};

// Main component
const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  statistics,
  isLoading = false,
  hasError = false,
  errorMessage,
  variant = 'default',
  showOverview = true,
  showRatingBreakdown = true,
  showTrends = true,
  showUserMetrics = true,
  showContentMetrics = true,
  showEngagementMetrics = true,
  showQualityMetrics = true,
  showTopReviewers = true,
  showSentimentAnalysis = true,
  showComparison = false,
  showExportOptions = false,
  highlightMetrics = [],
  hideMetrics = [],
  customMetrics = [],
  timeRange = 'all',
  className,
  cardClassName,
  metricClassName,
  onMetricClick,
  onTimeRangeChange,
  onExport,
  onDrillDown,
  onAnalyticsEvent
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  
  // Use useMemo for performance optimization
  const filteredMetrics = useMemo(() => {
    if (hideMetrics.length === 0) return null;
    return hideMetrics;
  }, [hideMetrics]);
  
  // Use showComparison and highlightMetrics for enhanced features
  const shouldShowComparison = useMemo(() => {
    return showComparison && statistics.competitorComparison;
  }, [showComparison, statistics.competitorComparison]);
  
  const highlightedMetricsSet = useMemo(() => {
    return new Set(highlightMetrics);
  }, [highlightMetrics]);
  
  // Use onDrillDown and onAnalyticsEvent
  const handleMetricDrillDown = useCallback((metric: string) => {
    onDrillDown?.(metric, { timeRange, activeTab });
    onAnalyticsEvent?.('metric_drilldown', { metric, tab: activeTab });
  }, [onDrillDown, onAnalyticsEvent, timeRange, activeTab]);
  
  // Use formatDistanceToNow, format, parseISO for date formatting
  const lastUpdated = useMemo(() => {
    const now = new Date();
    return format(now, 'PPp');
  }, []);
  
  const relativeTime = useMemo(() => {
    const someDate = parseISO(new Date().toISOString());
    return formatDistanceToNow(someDate, { addSuffix: true });
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <Card className="p-8 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Unable to Load Summary
        </h3>
        <p className="text-gray-600 mb-4">
          {errorMessage || 'Something went wrong while loading the review summary.'}
        </p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Card>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Reviews"
            value={statistics.totalReviews}
            icon={ChatBubbleLeftIcon}
            size="sm"
            className={metricClassName}
          />
          <MetricCard
            title="Avg Rating"
            value={statistics.averageRating}
            type="rating"
            icon={StarIcon}
            size="sm"
            color={statistics.averageRating >= 4 ? 'success' : statistics.averageRating >= 3 ? 'warning' : 'danger'}
            className={metricClassName}
          />
          <MetricCard
            title="Verified"
            value={statistics.verifiedPurchases}
            icon={ShieldCheckIcon}
            size="sm"
            color="info"
            className={metricClassName}
          />
          <MetricCard
            title="Recommend"
            value={statistics.recommendationRate}
            type="percentage"
            icon={HandThumbUpIcon}
            size="sm"
            color="success"
            className={metricClassName}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review Summary</h2>
          {/* Use date formatting utilities */}
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated} ({relativeTime})
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Add filtering and adjustment features using unused icons */}
          <Tooltip content="Filter options">
            <Button variant="ghost" size="sm">
              <FunnelIcon className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Adjust display settings">
            <Button variant="ghost" size="sm">
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Information about metrics">
            <Button variant="ghost" size="sm">
              <InformationCircleIcon className="w-4 h-4" />
            </Button>
          </Tooltip>
          {onTimeRangeChange && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => onTimeRangeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                title="Select time range for review summary"
                aria-label="Time range selector"
              >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
              </select>
            </div>
          )}
          
          {showExportOptions && onExport && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onExport('csv')}>
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport('pdf')}>
                Export PDF
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Overview metrics */}
      {showOverview && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Overview</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('overview')}
            >
              {expandedSections.has('overview') ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </Button>
          </div>

          <AnimatePresence>
            {expandedSections.has('overview') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Total Reviews"
                    value={statistics.totalReviews}
                    subtitle="All time reviews"
                    icon={ChatBubbleLeftIcon}
                    trend={statistics.reviewsThisMonth > statistics.reviewsLastMonth ? 'up' : 'down'}
                    trendValue={Math.abs(((statistics.reviewsThisMonth - statistics.reviewsLastMonth) / statistics.reviewsLastMonth) * 100)}
                    onClick={() => {
                      onMetricClick?.('totalReviews', statistics.totalReviews);
                      handleMetricDrillDown('totalReviews');
                    }}
                    className={cn(
                      metricClassName,
                      highlightedMetricsSet.has('totalReviews') && 'ring-2 ring-blue-500',
                      filteredMetrics?.includes('totalReviews') && 'opacity-50'
                    )}
                  />
                  
                  <MetricCard
                    title="Average Rating"
                    value={statistics.averageRating}
                    type="rating"
                    subtitle="Overall satisfaction"
                    icon={StarIcon}
                    color={statistics.averageRating >= 4 ? 'success' : statistics.averageRating >= 3 ? 'warning' : 'danger'}
                    onClick={() => onMetricClick?.('averageRating', statistics.averageRating)}
                    className={metricClassName}
                  />
                  
                  <MetricCard
                    title="Verified Purchases"
                    value={statistics.verifiedPurchases}
                    subtitle={`${((statistics.verifiedPurchases / statistics.totalReviews) * 100).toFixed(1)}% of reviews`}
                    icon={ShieldCheckIcon}
                    color="info"
                    onClick={() => onMetricClick?.('verifiedPurchases', statistics.verifiedPurchases)}
                    className={metricClassName}
                  />
                  
                  <MetricCard
                    title="Recommendation Rate"
                    value={statistics.recommendationRate}
                    type="percentage"
                    subtitle="Would recommend"
                    icon={HandThumbUpIcon}
                    color="success"
                    onClick={() => onMetricClick?.('recommendationRate', statistics.recommendationRate)}
                    className={metricClassName}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Competitor Comparison - using shouldShowComparison */}
      {shouldShowComparison && statistics.competitorComparison && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserGroupIcon className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Market Comparison</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Our Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{statistics.competitorComparison.averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Market Average</div>
            </div>
            <div className="text-center">
              <div className={cn(
                'text-2xl font-bold',
                statistics.averageRating > statistics.competitorComparison.averageRating ? 'text-green-600' : 'text-red-600'
              )}>
                {statistics.averageRating > statistics.competitorComparison.averageRating ? '+' : ''}
                {(statistics.averageRating - statistics.competitorComparison.averageRating).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Difference</div>
            </div>
          </div>
        </Card>
      )}

      {/* Rating breakdown */}
      {showRatingBreakdown && (
        <RatingBreakdown
          distribution={statistics.ratingDistribution}
          totalReviews={statistics.totalReviews}
          averageRating={statistics.averageRating}
          className={cardClassName}
        />
      )}

      {/* Detailed metrics in tabs */}
      <Tabs defaultValue="engagement" className="w-full">
        <div className="flex flex-wrap gap-2 mb-6">
          {showEngagementMetrics && (
            <Button
              variant={activeTab === 'engagement' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('engagement')}
            >
              <FireIcon className="w-4 h-4 mr-2" />
              Engagement
            </Button>
          )}
          
          {showContentMetrics && (
            <Button
              variant={activeTab === 'content' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('content')}
            >
              <PhotoIcon className="w-4 h-4 mr-2" />
              Content
            </Button>
          )}
          
          {showUserMetrics && (
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('users')}
            >
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Users
            </Button>
          )}
          
          {showQualityMetrics && (
            <Button
              variant={activeTab === 'quality' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('quality')}
            >
              <CheckBadgeIcon className="w-4 h-4 mr-2" />
              Quality
            </Button>
          )}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'engagement' && showEngagementMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Likes"
                  value={statistics.totalLikes}
                  icon={HeartIcon}
                  color="danger"
                  className={metricClassName}
                />
                <MetricCard
                  title="Helpful Votes"
                  value={statistics.totalHelpfulVotes}
                  icon={HandThumbUpIcon}
                  color="success"
                  className={metricClassName}
                />
                <MetricCard
                  title="Total Shares"
                  value={statistics.totalShares}
                  icon={ShareIcon}
                  color="info"
                  className={metricClassName}
                />
                <MetricCard
                  title="Avg Engagement"
                  value={statistics.averageEngagement}
                  type="percentage"
                  icon={TrophyIcon}
                  color="warning"
                  className={metricClassName}
                />
              </div>
            )}

            {activeTab === 'content' && showContentMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="With Media"
                  value={statistics.reviewsWithMedia}
                  subtitle={`${((statistics.reviewsWithMedia / statistics.totalReviews) * 100).toFixed(1)}%`}
                  icon={PhotoIcon}
                  className={metricClassName}
                />
                <MetricCard
                  title="With Images"
                  value={statistics.reviewsWithImages}
                  icon={PhotoIcon}
                  color="info"
                  className={metricClassName}
                />
                <MetricCard
                  title="With Videos"
                  value={statistics.reviewsWithVideos}
                  icon={VideoCameraIcon}
                  color="warning"
                  className={metricClassName}
                />
                <MetricCard
                  title="Avg Length"
                  value={statistics.averageReviewLength}
                  subtitle="characters"
                  icon={ChatBubbleLeftIcon}
                  className={metricClassName}
                />
              </div>
            )}

            {activeTab === 'users' && showUserMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Users"
                  value={statistics.totalUsers}
                  icon={UserIcon}
                  className={metricClassName}
                />
                <MetricCard
                  title="Verified Users"
                  value={statistics.verifiedUsers}
                  icon={ShieldCheckIcon}
                  color="success"
                  className={metricClassName}
                />
                <MetricCard
                  title="Repeat Customers"
                  value={statistics.repeatCustomers}
                  icon={UserGroupIcon}
                  color="info"
                  className={metricClassName}
                />
                <MetricCard
                  title="New Users"
                  value={statistics.newUsers}
                  icon={SparklesIcon}
                  color="warning"
                  className={metricClassName}
                />
              </div>
            )}

            {activeTab === 'quality' && showQualityMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Featured Reviews"
                  value={statistics.featuredReviews}
                  icon={TrophyIcon}
                  color="warning"
                  className={metricClassName}
                />
                <MetricCard
                  title="Moderated"
                  value={statistics.moderatedReviews}
                  icon={CheckBadgeIcon}
                  color="success"
                  className={metricClassName}
                />
                <MetricCard
                  title="Reported"
                  value={statistics.reportedReviews}
                  icon={ExclamationTriangleIcon}
                  color="danger"
                  className={metricClassName}
                />
                <MetricCard
                  title="Response Time"
                  value={statistics.averageResponseTime}
                  type="duration"
                  icon={ClockIcon}
                  className={metricClassName}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Additional components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {showSentimentAnalysis && (
          <SentimentAnalysis
            sentimentScore={statistics.sentimentScore}
            topTags={statistics.topTags}
            wouldRecommend={statistics.wouldRecommend}
            wouldNotRecommend={statistics.wouldNotRecommend}
            className={cardClassName}
          />
        )}

        {showTopReviewers && (
          <TopReviewers
            reviewers={statistics.topReviewers}
            className={cardClassName}
          />
        )}
      </div>

      {/* Trends chart */}
      {showTrends && statistics.ratingTrends.length > 0 && (
        <TrendsChart
          trends={statistics.ratingTrends}
          className={cardClassName}
        />
      )}

      {/* Custom metrics */}
      {customMetrics.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Custom Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customMetrics.map((metric) => (
              <MetricCard
                key={metric.key}
                title={metric.label}
                value={metric.value}
                type={metric.type}
                icon={metric.icon}
                subtitle={metric.description}
                onClick={() => onMetricClick?.(metric.key, metric.value)}
                className={metricClassName}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSummary;
