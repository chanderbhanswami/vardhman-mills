'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  InformationCircleIcon,
  FlagIcon,
  HandThumbUpIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarSolidIcon,
  ChartBarIcon as ChartBarSolidIcon
} from '@heroicons/react/24/solid';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { Progress } from '@/components/ui/Progress';

import { cn } from '@/lib/utils';
import { ProductReview as Review, ReviewUser as User } from '@/types/review.types';

export interface ReviewRatingsProps {
  review: Review;
  user?: User | null;
  variant?: 'default' | 'compact' | 'detailed' | 'card' | 'inline';
  showOverallRating?: boolean;
  showDetailedRatings?: boolean;
  showRatingBreakdown?: boolean;
  showComparison?: boolean;
  showTrends?: boolean;
  showStatistics?: boolean;
  interactive?: boolean;
  allowRatingClick?: boolean;
  maxStars?: number;
  size?: 'sm' | 'default' | 'lg' | 'xl';
  colorScheme?: 'default' | 'green' | 'blue' | 'amber' | 'red';
  className?: string;

  // Event handlers
  onRatingClick?: (category: string, rating: number) => void;
  onStarClick?: (starIndex: number) => void;
  onCompareClick?: () => void;
  onDetailsView?: () => void;
  onHelpfulClick?: (isHelpful: boolean) => void;
  onReportClick?: (reason: string) => void;
}

const RATING_VARIANTS = {
  default: 'text-sm',
  compact: 'text-xs',
  detailed: 'text-base',
  card: 'text-lg',
  inline: 'text-sm'
} as const;

const STAR_SIZES = {
  sm: 'h-3 w-3',
  default: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6'
} as const;

const COLOR_SCHEMES = {
  default: {
    filled: 'text-yellow-500',
    empty: 'text-gray-300',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200'
  },
  green: {
    filled: 'text-green-500',
    empty: 'text-gray-300',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200'
  },
  blue: {
    filled: 'text-blue-500',
    empty: 'text-gray-300',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  amber: {
    filled: 'text-amber-500',
    empty: 'text-gray-300',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200'
  },
  red: {
    filled: 'text-red-500',
    empty: 'text-gray-300',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200'
  }
} as const;

// Rating categories and labels
const RATING_CATEGORIES = {
  overall: 'Overall Rating',
  quality: 'Product Quality',
  value: 'Value for Money',
  delivery: 'Delivery Experience',
  packaging: 'Packaging',
  customerService: 'Customer Service',
  design: 'Design & Style',
  durability: 'Durability',
  easeOfUse: 'Ease of Use',
  features: 'Features',
  performance: 'Performance'
} as const;

// Helper functions
const generateStars = (rating: number, maxStars: number = 5): boolean[] => {
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    stars.push(i <= rating);
  }
  return stars;
};

const calculatePercentage = (value: number, total: number): number => {
  return total > 0 ? Math.round((value / total) * 100) : 0;
};

const getRatingLabel = (rating: number): string => {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 3.5) return 'Good';
  if (rating >= 2.5) return 'Average';
  if (rating >= 1.5) return 'Poor';
  return 'Very Poor';
};

const getRatingColor = (rating: number): string => {
  if (rating >= 4) return 'text-green-600';
  if (rating >= 3) return 'text-yellow-600';
  if (rating >= 2) return 'text-orange-600';
  return 'text-red-600';
};

export const ReviewRatings: React.FC<ReviewRatingsProps> = ({
  review,
  user,
  variant = 'default',
  showOverallRating = true,
  showDetailedRatings = false,
  showRatingBreakdown = false,
  showComparison = false,
  showTrends = false,
  showStatistics = false,
  interactive = true,
  allowRatingClick = false,
  maxStars = 5,
  size = 'default',
  colorScheme = 'default',
  className,
  onRatingClick,
  onStarClick,
  onDetailsView,
  onHelpfulClick,
  onReportClick
}) => {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(-1);

  const colors = COLOR_SCHEMES[colorScheme];

  // Extract rating information from review
  const ratingInfo = useMemo(() => {
    const overall = review.rating;
    const detailed = review.detailedRatings || [];
    
    // Calculate statistics from detailed ratings
    const detailedValues = detailed.map(d => d.rating);
    const allRatings = [overall, ...detailedValues];
    const average = allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;
    const highest = Math.max(...allRatings);
    const lowest = Math.min(...allRatings);
    
    // Mock rating distribution for demonstration
    const distribution = {
      5: Math.floor(Math.random() * 100) + 50,
      4: Math.floor(Math.random() * 80) + 30,
      3: Math.floor(Math.random() * 60) + 20,
      2: Math.floor(Math.random() * 40) + 10,
      1: Math.floor(Math.random() * 20) + 5
    };
    
    const totalRatings = Object.values(distribution).reduce((a, b) => a + b, 0);
    
    // Calculate trends (mock data)
    const trends = {
      change: Math.random() > 0.5 ? 'up' : 'down',
      percentage: Math.floor(Math.random() * 20) + 1,
      period: '30 days'
    };
    
    return {
      overall,
      detailed,
      average,
      highest,
      lowest,
      distribution,
      totalRatings,
      trends,
      label: getRatingLabel(overall),
      color: getRatingColor(overall)
    };
  }, [review]);

  // User's rating history and comparison
  const userStats = useMemo(() => {
    if (!user) return null;
    
    return {
      averageRating: user.averageRating,
      totalReviews: user.reviewCount,
      comparisonToAverage: review.rating - user.averageRating,
      consistency: Math.abs(review.rating - user.averageRating) <= 1 ? 'consistent' : 'varied'
    };
  }, [user, review.rating]);

  // Event handlers
  const handleStarClick = useCallback((starIndex: number) => {
    if (!allowRatingClick || !onStarClick) return;
    onStarClick(starIndex + 1);
  }, [allowRatingClick, onStarClick]);

  const handleStarHover = useCallback((starIndex: number) => {
    if (!allowRatingClick) return;
    setHoveredStar(starIndex);
  }, [allowRatingClick]);

  const handleStarLeave = useCallback(() => {
    setHoveredStar(-1);
  }, []);

  const handleCategoryClick = useCallback((category: string, rating: number) => {
    if (!onRatingClick) return;
    onRatingClick(category, rating);
  }, [onRatingClick]);

  const handleDetailsClick = useCallback(() => {
    if (onDetailsView) {
      onDetailsView();
    } else {
      setShowDetailsDialog(true);
    }
  }, [onDetailsView]);

  // Render star rating
  const renderStars = useCallback((
    rating: number,
    clickable: boolean = false
  ) => {
    const stars = generateStars(rating, maxStars);
    
    return (
      <div className="flex items-center gap-0.5">
        {stars.map((filled, index) => {
          const isHovered = hoveredStar >= index;
          const showFilled = filled || (clickable && isHovered);
          
          return (
            <motion.button
              key={index}
              className={cn(
                STAR_SIZES[size],
                showFilled ? colors.filled : colors.empty,
                clickable && 'cursor-pointer hover:scale-110 transition-transform',
                !clickable && 'cursor-default'
              )}
              onClick={() => clickable && handleStarClick(index)}
              onMouseEnter={() => clickable && handleStarHover(index)}
              onMouseLeave={() => clickable && handleStarLeave()}
              disabled={!clickable}
              whileHover={clickable ? { scale: 1.1 } : undefined}
              whileTap={clickable ? { scale: 0.95 } : undefined}
            >
              <StarSolidIcon />
            </motion.button>
          );
        })}
      </div>
    );
  }, [maxStars, hoveredStar, colors, size, handleStarClick, handleStarHover, handleStarLeave]);

  // Render rating with text
  const renderRatingWithText = useCallback((
    rating: number,
    showText: boolean = true
  ) => {
    return (
      <div className="flex items-center gap-2">
        {renderStars(rating, allowRatingClick)}
        {showText && (
          <div className="flex items-center gap-2">
            <span className={cn(RATING_VARIANTS[variant], 'font-medium')}>
              {rating.toFixed(1)}
            </span>
            {variant === 'detailed' && (
              <span className={cn('text-xs', ratingInfo.color)}>
                {ratingInfo.label}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }, [renderStars, allowRatingClick, variant, ratingInfo]);

  // Render detailed ratings
  const renderDetailedRatings = useCallback(() => {
    if (!showDetailedRatings || !ratingInfo.detailed || ratingInfo.detailed.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Detailed Ratings</h4>
        <div className="grid gap-2">
          {ratingInfo.detailed.map((detailedRating, index) => {
            const categoryName = RATING_CATEGORIES[detailedRating.aspect as keyof typeof RATING_CATEGORIES] || detailedRating.aspect;
            
            return (
              <div
                key={`${detailedRating.aspect}-${index}`}
                className={cn(
                  "flex items-center justify-between p-2 rounded",
                  interactive && "hover:bg-muted cursor-pointer transition-colors"
                )}
                onClick={() => handleCategoryClick(detailedRating.aspect, detailedRating.rating)}
              >
                <span className="text-sm text-muted-foreground">{categoryName}</span>
                {renderRatingWithText(detailedRating.rating, false)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [showDetailedRatings, ratingInfo, interactive, handleCategoryClick, renderRatingWithText]);

  // Render rating breakdown
  const renderRatingBreakdown = useCallback(() => {
    if (!showRatingBreakdown) return null;
    
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">Rating Breakdown</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingInfo.distribution[star as keyof typeof ratingInfo.distribution];
            const percentage = calculatePercentage(count, ratingInfo.totalRatings);
            
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-xs font-medium">{star}</span>
                  <StarSolidIcon className={cn("h-3 w-3", colors.filled)} />
                </div>
                <div className="flex-1">
                  <Progress 
                    value={percentage} 
                    className={cn("h-2", colors.bg)}
                  />
                </div>
                <div className="flex items-center gap-2 w-16 text-right">
                  <span className="text-xs text-muted-foreground">{count}</span>
                  <span className="text-xs text-muted-foreground">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-muted-foreground">
          Based on {ratingInfo.totalRatings.toLocaleString()} reviews
        </div>
      </div>
    );
  }, [showRatingBreakdown, ratingInfo, colors]);

  // Render comparison
  const renderComparison = useCallback(() => {
    if (!showComparison || !userStats) return null;
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">User Comparison</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">User Average</div>
            <div className="font-medium">{userStats.averageRating.toFixed(1)} ★</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">This Review</div>
            <div className="font-medium">{review.rating.toFixed(1)} ★</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={userStats.comparisonToAverage >= 0 ? 'default' : 'secondary'}>
            {userStats.comparisonToAverage > 0 && '+'}
            {userStats.comparisonToAverage.toFixed(1)} vs average
          </Badge>
          <Badge variant="outline">
            {userStats.consistency}
          </Badge>
        </div>
      </div>
    );
  }, [showComparison, userStats, review.rating]);

  // Render trends
  const renderTrends = useCallback(() => {
    if (!showTrends) return null;
    
    const TrendIcon = ratingInfo.trends.change === 'up' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
    const trendColor = ratingInfo.trends.change === 'up' ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Rating Trends</h4>
        <div className="flex items-center gap-2">
          <TrendIcon className={cn("h-4 w-4", trendColor)} />
          <span className={cn("text-sm font-medium", trendColor)}>
            {ratingInfo.trends.percentage}% {ratingInfo.trends.change}
          </span>
          <span className="text-xs text-muted-foreground">
            over last {ratingInfo.trends.period}
          </span>
        </div>
      </div>
    );
  }, [showTrends, ratingInfo.trends]);

  // Render statistics
  const renderStatistics = useCallback(() => {
    if (!showStatistics) return null;
    
    return (
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Average</div>
          <div className="text-sm font-medium">{ratingInfo.average.toFixed(1)}</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Highest</div>
          <div className="text-sm font-medium">{ratingInfo.highest.toFixed(1)}</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Lowest</div>
          <div className="text-sm font-medium">{ratingInfo.lowest.toFixed(1)}</div>
        </div>
      </div>
    );
  }, [showStatistics, ratingInfo]);

  // Render details dialog
  const renderDetailsDialog = useCallback(() => {
    if (!showDetailsDialog) return null;
    
    return (
      <Dialog 
        open={showDetailsDialog} 
        onClose={() => setShowDetailsDialog(false)}
        size="md"
      >
        <DialogHeader>
          <DialogTitle>Rating Details</DialogTitle>
          <DialogDescription>
            Comprehensive rating information and breakdown
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <StarSolidIcon className={cn("h-4 w-4", colors.filled)} />
                Overall Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderRatingWithText(ratingInfo.overall, true)}
            </CardContent>
          </Card>
          
          {renderDetailedRatings()}
          {renderRatingBreakdown()}
          {renderComparison()}
          {renderTrends()}
          
          <Separator />
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onHelpfulClick?.(true)}
              className="flex-1"
            >
              <HandThumbUpIcon className="h-4 w-4 mr-2" />
              Helpful
            </Button>
            <Button
              variant="outline"
              onClick={() => onReportClick?.('inaccurate')}
            >
              <FlagIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }, [
    showDetailsDialog,
    colors,
    ratingInfo,
    renderRatingWithText,
    renderDetailedRatings,
    renderRatingBreakdown,
    renderComparison,
    renderTrends,
    onHelpfulClick,
    onReportClick
  ]);

  // Main render logic based on variant
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {renderStars(ratingInfo.overall, allowRatingClick)}
        <span className={cn(RATING_VARIANTS[variant], 'font-medium')}>
          {ratingInfo.overall.toFixed(1)}
        </span>
        {interactive && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1"
            onClick={handleDetailsClick}
          >
            <InformationCircleIcon className="h-3 w-3" />
          </Button>
        )}
        {renderDetailsDialog()}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-1", className)}>
        {showOverallRating && renderRatingWithText(ratingInfo.overall)}
        {showStatistics && renderStatistics()}
        {renderDetailsDialog()}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={cn("p-4", className)}>
        <div className="space-y-4">
          {showOverallRating && (
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold">{ratingInfo.overall.toFixed(1)}</div>
              {renderStars(ratingInfo.overall, allowRatingClick)}
              <div className={cn("text-sm", ratingInfo.color)}>{ratingInfo.label}</div>
            </div>
          )}
          
          {renderDetailedRatings()}
          {renderRatingBreakdown()}
          {renderComparison()}
          {renderTrends()}
          {renderStatistics()}
          
          {interactive && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDetailsClick}
            >
              <ChartBarSolidIcon className="h-4 w-4 mr-2" />
              View Details
            </Button>
          )}
        </div>
        {renderDetailsDialog()}
      </Card>
    );
  }

  // Default and detailed variants
  return (
    <div className={cn("space-y-3", className)}>
      {showOverallRating && (
        <div className="flex items-center justify-between">
          {renderRatingWithText(ratingInfo.overall)}
          {interactive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDetailsClick}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Details
            </Button>
          )}
        </div>
      )}
      
      {variant === 'detailed' && (
        <>
          {renderDetailedRatings()}
          {renderRatingBreakdown()}
          {renderComparison()}
          {renderTrends()}
          {renderStatistics()}
        </>
      )}
      
      {renderDetailsDialog()}
    </div>
  );
};

export default ReviewRatings;
