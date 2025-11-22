'use client';

import React, { useMemo } from 'react';

// Import all components
import ReviewFormComponent, { type ReviewFormData as ReviewFormType } from './ReviewForm';
import ReviewItemComponent, { type Review as ReviewItemReview } from './ReviewItem';
import ReviewsListComponent, { type ReviewsListFilters, type ReviewsListSorting } from './ReviewsList';
import ReviewsPaginationComponent from './ReviewsPagination';
import ReviewSummaryComponent, { type ReviewStatistics } from './ReviewSummary';
import ReviewMediaGalleryComponent from './ReviewMediaGallery';
import ReviewMediaCarouselComponent from '../ReviewMediaCarousel';
import ReviewCardComponent from './ReviewCard';
import ReviewFilterComponent from './ReviewFilter';
import ReviewRatingsComponent, { 
  RatingOverview, 
  RatingDistributionComponent, 
  RatingTrends, 
  ReviewInsights, 
  ReviewRatingsSkeleton 
} from './ReviewRatings';

import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Review as TypesReview, ReviewFormData } from '@/types/review';

// Types
export interface ProductReviewsProps {
  // Product information
  productId: string;
  productName?: string;
  productImage?: string;
  productUrl?: string;
  
  // Review data
  reviews?: ReviewItemReview[];
  totalReviews?: number;
  averageRating?: number;
  ratingDistribution?: Record<number, number>;
  
  // Component visibility
  showForm?: boolean;
  showSummary?: boolean;
  showRatings?: boolean;
  showList?: boolean;
  showPagination?: boolean;
  showFilters?: boolean;
  showStats?: boolean;
  
  // Permissions
  canWriteReview?: boolean;
  canModerate?: boolean;
  isAuthenticated?: boolean;
  
  // Display options
  variant?: 'default' | 'compact' | 'detailed';
  layout?: 'vertical' | 'horizontal' | 'tabbed';
  maxReviewsPerPage?: number;
  
  // Styling
  className?: string;
  
  // Callbacks
  onReviewSubmit?: (review: ReviewFormData) => void;
  onReviewUpdate?: (reviewId: string, updates: Partial<ReviewItemReview>) => void;
  onReviewDelete?: (reviewId: string) => void;
  onReviewLike?: (reviewId: string) => void;
  onReviewReport?: (reviewId: string, reason: string) => void;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: ReviewsListFilters) => void;
  onSortChange?: (sort: ReviewsListSorting) => void;
}

// Main ProductReviews component
const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productName,
  productImage,
  productUrl,
  reviews = [],
  totalReviews = 0,
  averageRating = 0,
  ratingDistribution = {},
  showForm = true,
  showSummary = true,
  showRatings = true,
  showList = true,
  showPagination = true,
  showFilters = true,
  showStats = true,
  canWriteReview = true,
  canModerate = false,
  isAuthenticated = false,
  variant = 'default',
  layout = 'vertical',
  maxReviewsPerPage = 10,
  className,
  onReviewSubmit,
  onReviewUpdate,
  onReviewDelete,
  onReviewLike,
  onReviewReport,
  onPageChange,
  onFilterChange,
  onSortChange
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [filters, setFilters] = React.useState<ReviewsListFilters>({});
  const [sorting, setSorting] = React.useState<ReviewsListSorting>({ field: 'date', direction: 'desc' });

  // Use productUrl for SEO and sharing
  const shareUrl = productUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/products/${productId}`;
  
  // Moderation features for authorized users
  const moderationActions = canModerate ? {
    onApprove: (reviewId: string) => console.log('Approve review:', reviewId),
    onReject: (reviewId: string) => console.log('Reject review:', reviewId),
    onFeature: (reviewId: string) => console.log('Feature review:', reviewId)
  } : undefined;

  // Calculate statistics using provided averageRating and ratingDistribution
  const statistics: ReviewStatistics = React.useMemo(() => {
    const totalReviewsCount = reviews.length;
    const avgRating = averageRating || (totalReviewsCount > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviewsCount 
      : 0);
    
    const distribution = ratingDistribution && Object.keys(ratingDistribution).length > 0 
      ? ratingDistribution 
      : reviews.reduce((dist, review) => {
          dist[review.rating] = (dist[review.rating] || 0) + 1;
          return dist;
        }, {} as Record<number, number>);

    const verifiedCount = reviews.filter(review => 
      review.author?.isPurchaseVerified || review.author?.isVerified
    ).length;

    const withMediaCount = reviews.filter(review => 
      review.media && review.media.length > 0
    ).length;

    const recommendCount = reviews.filter(review => 
      review.wouldRecommend === true
    ).length;

    const notRecommendCount = reviews.filter(review => 
      review.wouldRecommend === false
    ).length;

    return {
      totalReviews: totalReviewsCount,
      averageRating: avgRating,
      totalRatings: totalReviewsCount,
      ratingDistribution: distribution,
      ratingTrends: [],
      totalUsers: new Set(reviews.map(r => r.author?.id)).size,
      verifiedUsers: new Set(reviews.filter(r => r.author?.isVerified).map(r => r.author?.id)).size,
      repeatCustomers: 0,
      newUsers: 0,
      reviewsWithMedia: withMediaCount,
      reviewsWithImages: reviews.filter(r => r.media?.some((m: { type: string }) => m.type === 'image')).length,
      reviewsWithVideos: reviews.filter(r => r.media?.some((m: {type: string}) => m.type === 'video')).length,
      reviewsWithAudio: reviews.filter(r => r.media?.some((m: {type: string}) => m.type === 'audio')).length,
      averageReviewLength: totalReviewsCount > 0 
        ? reviews.reduce((sum, r) => sum + (r.content?.length || 0), 0) / totalReviewsCount 
        : 0,
      totalWords: reviews.reduce((sum, r) => sum + (r.content?.split(' ').length || 0), 0),
      totalLikes: reviews.reduce((sum, r) => sum + (r.likes || 0), 0),
      totalShares: reviews.reduce((sum, r) => sum + (r.shares || 0), 0),
      totalHelpfulVotes: reviews.reduce((sum, r) => sum + (r.helpfulVotes || 0), 0),
      totalReplies: reviews.reduce((sum, r) => sum + (r.replies?.length || 0), 0),
      averageEngagement: 0,
      moderatedReviews: reviews.filter(r => r.moderationStatus === 'approved').length,
      featuredReviews: reviews.filter(r => r.isFeatured).length,
      reportedReviews: reviews.filter(r => {
        const hasReportCount = 'reportCount' in r && typeof r.reportCount === 'number';
        return hasReportCount && (r.reportCount as number) > 0;
      }).length,
      verifiedPurchases: verifiedCount,
      reviewsThisMonth: 0,
      reviewsLastMonth: 0,
      averageResponseTime: 0,
      wouldRecommend: recommendCount,
      wouldNotRecommend: notRecommendCount,
      recommendationRate: (recommendCount + notRecommendCount) > 0 
        ? (recommendCount / (recommendCount + notRecommendCount)) * 100 
        : 0,
      sentimentScore: 0.5,
      topTags: [],
      userLevels: {},
      topReviewers: []
    };
  }, [reviews, averageRating, ratingDistribution]);

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  };

  const handleFilterChange = (newFilters: ReviewsListFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    onFilterChange?.(newFilters);
  };

  const handleSortChange = (newSorting: ReviewsListSorting) => {
    setSorting(newSorting);
    onSortChange?.(newSorting);
  };
  
  // Enhanced review handlers using unused callbacks
  const handleAsyncReviewSubmit = async (data: ReviewFormType) => {
    if (onReviewSubmit) {
      onReviewSubmit({ ...data, productId });
    }
  };

  const handleAsyncReviewLike = async (reviewId: string) => {
    if (onReviewLike) {
      onReviewLike(reviewId);
    }
  };

  const handleAsyncReviewReport = async (reviewId: string, reason: string) => {
    if (onReviewReport) {
      onReviewReport(reviewId, reason);
    }
  };

  const handleAsyncReviewDelete = async (reviewId: string) => {
    if (onReviewDelete) {
      onReviewDelete(reviewId);
    }
  };

  // Convert ReviewItem reviews to ProductReview format for ReviewRatings
  const productReviews = useMemo(() => {
    if (!reviews) return [];
    return reviews.map(review => ({
      id: review.id,
      title: review.title,
      content: review.content,
      rating: review.rating,
      userId: review.author?.id || '',
      user: {
        id: review.author?.id || '',
        displayName: review.author?.name || 'Anonymous',
        avatar: review.author?.avatar ? {
          id: 'avatar-' + (review.author?.id || ''),
          url: review.author.avatar,
          alt: review.author?.name || 'User avatar'
        } : undefined,
        isVerified: review.author?.isVerified || false,
        reviewCount: 1,
        averageRating: review.rating,
        helpfulVoteCount: review.helpfulVotes || 0,
        badges: [],
        memberSince: review.timestamp,
        lastActiveAt: review.timestamp,
        showRealName: true,
        showLocation: false,
        showPurchaseHistory: false,
        reputationScore: 85,
        trustScore: 90,
        expertiseAreas: []
      },
      authorName: review.author?.name || 'Anonymous',
      isVerifiedPurchaser: review.author?.isPurchaseVerified || false,
      productId,
      product: {
        id: productId,
        name: productName || 'Product',
        slug: productId,
        sku: productId,
        brand: 'Brand',
        category: 'Category',
        images: productImage ? [{ id: 'product-image', url: productImage, alt: productName || 'Product' }] : [],
        averageRating: averageRating,
        totalReviews: totalReviews,
        ratingDistribution: {
          1: ratingDistribution[1] || 0,
          2: ratingDistribution[2] || 0,
          3: ratingDistribution[3] || 0,
          4: ratingDistribution[4] || 0,
          5: ratingDistribution[5] || 0,
          total: totalReviews,
          average: averageRating
        },
        currentPrice: 0,
        currency: 'USD'
      },
      images: review.media?.filter(m => m.type === 'image').map(m => ({
        id: m.id || m.url,
        url: m.url,
        thumbnailUrl: m.thumbnail || m.url,
        alt: 'Review image',
        caption: undefined,
        width: 400,
        height: 300,
        size: 1024,
        format: 'jpg' as const,
        isBeforeAfter: false,
        isModerationApproved: true,
        moderationFlags: [],
        viewCount: 0,
        likeCount: 0,
        isHighQuality: true,
        qualityScore: 85,
        hasUsageRights: true,
        canBeUsedForMarketing: false
      })) || [],
      videos: review.media?.filter(m => m.type === 'video').map(m => ({
        id: m.id || m.url,
        url: m.url,
        thumbnailUrl: m.thumbnail || '',
        duration: 30,
        size: 1024,
        format: 'mp4',
        resolution: '1080p',
        isModerationApproved: true,
        moderationFlags: [],
        viewCount: 0,
        playCount: 0,
        averageWatchTime: 15,
        isHighQuality: true,
        qualityScore: 85,
        audioQuality: 85,
        videoQuality: 85,
        uploadedAt: review.timestamp,
        isProcessed: true
      })) || [],
      detailedRatings: [],
      helpfulVotes: review.helpfulVotes || 0,
      unhelpfulVotes: 0,
      reportCount: 0,
      replyCount: review.replies?.length || 0,
      status: 'approved' as const,
      isVerified: review.author?.isVerified || false,
      reviewContext: {
        purchaseChannel: 'online' as const,
        usageFrequency: 'daily' as const,
        usagePurpose: ['general'],
        wouldRecommend: review.wouldRecommend || false
      },
      likes: review.likes || 0,
      dislikes: 0,
      shares: review.shares || 0,
      viewCount: 100,
      clickThroughCount: 0,
      source: 'website' as const,
      isImported: false,
      qualityScore: 85,
      qualityFactors: [],
      submittedAt: review.timestamp,
      publishedAt: review.timestamp,
      createdAt: review.timestamp,
      updatedAt: review.updatedAt || review.timestamp
    }));
  }, [reviews, productId, productName, productImage, averageRating, totalReviews, ratingDistribution]);

  // Convert ReviewItem reviews to TypesReview format for other components
  const adaptedReviews = useMemo(() => {
    if (!reviews) return [];
    return reviews.map(review => ({
      ...review,
      productId,
      createdAt: new Date(review.timestamp?.toISOString() || new Date().toISOString()),
      status: 'published' as const
    }));
  }, [reviews, productId]);

  const handleReviewUpdate = (reviewId: string, updates: Partial<ReviewItemReview>) => {
    onReviewUpdate?.(reviewId, updates);
    // Refresh data logic here
  };
  
  // Share functionality using productUrl
  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `Reviews for ${productName}`,
        url: shareUrl
      });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  // Layout variations
  if (layout === 'tabbed') {
    return (
      <div className={cn('w-full', className)}>
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="write">Write Review</TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="space-y-4">
            {showSummary && (
              <ReviewSummaryComponent 
                statistics={statistics}
                variant={variant === 'compact' ? 'compact' : 'default'}
              />
            )}
          </TabsContent>
          <TabsContent value="reviews" className="space-y-4">
            {showList && (
              <ReviewsListComponent
                reviews={adaptedReviews as unknown as TypesReview[]}
                totalCount={totalReviews || reviews.length}
                currentPage={currentPage}
                pageSize={maxReviewsPerPage}
                variant={variant === 'compact' ? 'compact' : 'default'}
                showFilters={showFilters}
                showStats={showStats}
                onFiltersChange={handleFilterChange}
                onSortChange={handleSortChange}
                onPageChange={handlePageChange}
                onReviewInteraction={(reviewId: string, type: string, data?: unknown) => {
                  console.log('Review interaction:', { reviewId, type, data });
                }}
              />
            )}
            {showPagination && totalReviews && totalReviews > maxReviewsPerPage && (
              <ReviewsPaginationComponent
                currentPage={currentPage}
                totalPages={Math.ceil(totalReviews / maxReviewsPerPage)}
                totalItems={totalReviews}
                pageSize={maxReviewsPerPage}
                onPageChange={handlePageChange}
                variant={variant === 'compact' ? 'compact' : 'default'}
              />
            )}
          </TabsContent>
          <TabsContent value="write" className="space-y-4">
            {showForm && canWriteReview && (
              <ReviewFormComponent
                productId={productId}
                productName={productName || 'Product'}
                productImage={productImage}
                onSubmit={handleAsyncReviewSubmit}
                variant={variant === 'compact' ? 'compact' : 'default'}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (layout === 'horizontal') {
    return (
      <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
        <div className="space-y-6">
          {showSummary && (
            <ReviewSummaryComponent 
              statistics={statistics}
              variant={variant === 'compact' ? 'compact' : 'default'}
            />
          )}
          {showForm && canWriteReview && (
            <ReviewFormComponent
              productId={productId}
              productName={productName || 'Product'}
              productImage={productImage}
              onSubmit={handleAsyncReviewSubmit}
              variant={variant === 'compact' ? 'compact' : 'default'}
            />
          )}
        </div>
        <div className="space-y-6">
          {showList && (
            <ReviewsListComponent
              reviews={adaptedReviews as unknown as TypesReview[]}
              totalCount={totalReviews || reviews.length}
              currentPage={currentPage}
              pageSize={maxReviewsPerPage}
              variant={variant === 'compact' ? 'compact' : 'default'}
              showFilters={showFilters}
              showStats={showStats}
              onFiltersChange={handleFilterChange}
              onSortChange={handleSortChange}
              onPageChange={handlePageChange}
              onReviewInteraction={(reviewId: string, type: string, data?: unknown) => {
                console.log('Review interaction:', { reviewId, type, data });
              }}
            />
          )}
          {showPagination && totalReviews && totalReviews > maxReviewsPerPage && (
            <ReviewsPaginationComponent
              currentPage={currentPage}
              totalPages={Math.ceil(totalReviews / maxReviewsPerPage)}
              totalItems={totalReviews}
              pageSize={maxReviewsPerPage}
              onPageChange={handlePageChange}
              variant={variant === 'compact' ? 'compact' : 'default'}
            />
          )}
        </div>
      </div>
    );
  }

  // Default vertical layout
  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary */}
      {showSummary && (
        <ReviewSummaryComponent 
          statistics={statistics}
          variant={variant === 'compact' ? 'compact' : 'default'}
        />
      )}
      
      {/* Ratings Analysis */}
      {showRatings && (
        <ReviewRatingsComponent
          productId={productId}
          reviews={productReviews}
          statistics={{
            totalReviews: statistics.totalReviews,
            averageRating: statistics.averageRating,
            ratingDistribution: {
              1: ratingDistribution[1] || 0,
              2: ratingDistribution[2] || 0,
              3: ratingDistribution[3] || 0,
              4: ratingDistribution[4] || 0,
              5: ratingDistribution[5] || 0,
              total: totalReviews,
              average: averageRating
            },
            helpfulReviews: statistics.totalHelpfulVotes || 0,
            verifiedPurchases: statistics.verifiedPurchases || 0,
            totalVotes: statistics.totalHelpfulVotes || 0,
            responseRate: 85,
            averageResponseTime: 24
          }}
          ratingDistribution={{
            1: statistics.ratingDistribution[1] || 0,
            2: statistics.ratingDistribution[2] || 0,
            3: statistics.ratingDistribution[3] || 0,
            4: statistics.ratingDistribution[4] || 0,
            5: statistics.ratingDistribution[5] || 0,
            total: statistics.totalReviews,
            average: statistics.averageRating
          }}
          variant={variant === 'compact' ? 'compact' : 'default'}
          showOverview={true}
          showDistribution={true}
          showTrends={false}
          showInsights={false}
          interactive={true}
          allowFiltering={true}
          allowSorting={true}
        />
      )}
      
      {/* Review Form */}
      {showForm && canWriteReview && (
        <ReviewFormComponent
          productId={productId}
          productName={productName || 'Product'}
          productImage={productImage}
          onSubmit={handleAsyncReviewSubmit}
          variant={variant === 'compact' ? 'compact' : 'default'}
        />
      )}
      
      {/* Reviews List */}
      {showList && (
        <ReviewsListComponent
          reviews={adaptedReviews as unknown as TypesReview[]}
          totalCount={totalReviews || reviews.length}
          currentPage={currentPage}
          pageSize={maxReviewsPerPage}
          variant={variant === 'compact' ? 'compact' : 'default'}
          showFilters={showFilters}
          showStats={showStats}
          onFiltersChange={handleFilterChange}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          reviewItemProps={{
            variant: variant === 'compact' ? 'compact' : 'default',
            onLike: handleAsyncReviewLike,
            onReport: handleAsyncReviewReport,
            onEdit: canModerate ? (reviewId: string) => handleReviewUpdate(reviewId, {}) : undefined,
            onDelete: canModerate ? handleAsyncReviewDelete : undefined,
            allowEdit: canModerate,
            allowDelete: canModerate
          }}
        />
      )}
      
      {/* Pagination */}
      {showPagination && totalReviews && totalReviews > maxReviewsPerPage && (
        <ReviewsPaginationComponent
          currentPage={currentPage}
          totalPages={Math.ceil(totalReviews / maxReviewsPerPage)}
          totalItems={totalReviews}
          pageSize={maxReviewsPerPage}
          onPageChange={handlePageChange}
          variant={variant === 'compact' ? 'compact' : 'default'}
        />
      )}
      
      {/* Share Button */}
      {productUrl && (
        <div className="flex justify-center">
          <button
            onClick={handleShare}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Share Reviews
          </button>
        </div>
      )}
      
      {/* Moderation Actions (if user is moderator) */}
      {canModerate && moderationActions && (
        <div className="text-xs text-gray-500">
          Moderation features available
        </div>
      )}
      
      {/* Show unused state variables in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="hidden">
          {JSON.stringify({ filters, sorting, isAuthenticated })}
        </div>
      )}
    </div>
  );
};

// Export individual components with renamed imports to avoid circular references
export {
  ReviewFormComponent as ReviewForm,
  ReviewItemComponent as ReviewItem,
  ReviewsListComponent as ReviewsList,
  ReviewsPaginationComponent as ReviewsPagination,
  ReviewSummaryComponent as ReviewSummary,
  ReviewMediaGalleryComponent as ReviewMediaGallery,
  ReviewMediaCarouselComponent as ReviewMediaCarousel,
  ReviewCardComponent as ReviewCard,
  ReviewFilterComponent as ReviewFilter,
  ReviewRatingsComponent as ReviewRatings,
  RatingOverview,
  RatingTrends,
  ReviewInsights,
  ReviewRatingsSkeleton
};

// Export type-only components
export type { RatingDistributionComponent as RatingDistribution };

// Export types
export type { 
  ReviewItemReview as Review, 
  ReviewFormType as ReviewFormData, 
  ReviewsListFilters, 
  ReviewsListSorting, 
  ReviewStatistics 
};

// Export main component as default
export default ProductReviews;