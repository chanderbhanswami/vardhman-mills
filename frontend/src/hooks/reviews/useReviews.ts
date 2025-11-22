import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export interface ReviewsListResponse {
  reviews: Review[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
  videos?: string[];
  isVerified: boolean;
  isPurchased: boolean;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  dislikes: number;
  replies: ReviewReply[];
  flags: ReviewFlag[];
  status: 'published' | 'pending' | 'rejected' | 'flagged';
  metadata?: Record<string, unknown>;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  isOfficial: boolean;
}

export interface ReviewFlag {
  id: string;
  reviewId: string;
  userId: string;
  reason: 'spam' | 'inappropriate' | 'fake' | 'offensive' | 'other';
  description?: string;
  createdAt: Date;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  verifiedPurchases: number;
  totalLikes: number;
  totalDislikes: number;
  recentReviews: number;
  topReviews: Review[];
}

export interface ReviewFilters {
  rating?: number[];
  verified?: boolean;
  purchased?: boolean;
  sortBy: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
  hasImages?: boolean;
  hasVideos?: boolean;
  searchQuery?: string;
}

export interface ReviewFormData {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  images?: File[];
  videos?: File[];
}

export interface UseReviewsOptions {
  productId?: string;
  userId?: string;
  initialFilters?: Partial<ReviewFilters>;
  enableRealtime?: boolean;
  autoLoad?: boolean;
}

export const useReviews = (options: UseReviewsOptions = {}) => {
  const {
    productId,
    userId,
    initialFilters = {},
    enableRealtime = false,
    autoLoad = true,
  } = options;

  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<ReviewFilters>({
    sortBy: 'newest',
    timeRange: 'all',
    ...initialFilters,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    hasMore: true,
  });

  // Generate query key
  const getQueryKey = useCallback((type: string, params?: Record<string, unknown>) => {
    return ['reviews', type, { productId, userId, ...params }];
  }, [productId, userId]);

  // Fetch reviews
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    error: reviewsError,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: getQueryKey('list', { filters, pagination }),
    queryFn: async () => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReviews: Review[] = Array.from({ length: pagination.pageSize }, (_, index) => {
        const reviewId = `review_${Date.now()}_${index}`;
        const rating = Math.floor(Math.random() * 5) + 1;
        
        return {
          id: reviewId,
          productId: productId || `product_${Math.floor(Math.random() * 100)}`,
          userId: `user_${Math.floor(Math.random() * 1000)}`,
          userName: `User ${Math.floor(Math.random() * 1000)}`,
          userEmail: `user${Math.floor(Math.random() * 1000)}@example.com`,
          userAvatar: Math.random() > 0.5 ? `https://picsum.photos/40/40?random=${index}` : undefined,
          rating,
          title: Math.random() > 0.3 ? `Review title ${index + 1}` : undefined,
          comment: `This is a detailed review comment for item ${index + 1}. ${
            rating >= 4 ? 'Very satisfied with the quality and service.' : 
            rating >= 3 ? 'Good product but could be better.' : 
            'Not satisfied with the purchase.'
          }`,
          pros: rating >= 4 ? ['Good quality', 'Fast delivery', 'Great value'] : undefined,
          cons: rating <= 2 ? ['Poor quality', 'Slow delivery', 'Expensive'] : undefined,
          images: Math.random() > 0.7 ? [`https://picsum.photos/200/200?random=${index}`] : [],
          videos: Math.random() > 0.9 ? [`video_${index}.mp4`] : [],
          isVerified: Math.random() > 0.3,
          isPurchased: Math.random() > 0.2,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          likes: Math.floor(Math.random() * 50),
          dislikes: Math.floor(Math.random() * 10),
          replies: [],
          flags: [],
          status: 'published',
          metadata: { source: 'web' },
        };
      });

      return {
        reviews: mockReviews,
        total: 157,
        page: pagination.page,
        pageSize: pagination.pageSize,
        hasMore: pagination.page < 16,
      };
    },
    enabled: autoLoad && (!!productId || !!userId),
  });

  // Fetch review statistics
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: getQueryKey('stats', { productId }),
    queryFn: async (): Promise<ReviewStats> => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const totalReviews = 157;
      const ratings = [45, 32, 28, 31, 21]; // 5-star to 1-star
      const averageRating = ratings.reduce((sum, count, index) => 
        sum + count * (5 - index), 0) / totalReviews;

      return {
        totalReviews,
        averageRating,
        ratingDistribution: {
          5: ratings[0],
          4: ratings[1],
          3: ratings[2],
          2: ratings[3],
          1: ratings[4],
        },
        verifiedPurchases: Math.floor(totalReviews * 0.75),
        totalLikes: Math.floor(totalReviews * 3.2),
        totalDislikes: Math.floor(totalReviews * 0.8),
        recentReviews: Math.floor(totalReviews * 0.2),
        topReviews: reviewsData?.reviews.slice(0, 3) || [],
      };
    },
    enabled: !!productId,
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (formData: ReviewFormData) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReview: Review = {
        id: `review_${Date.now()}`,
        productId: formData.productId,
        userId: userId || `user_${Date.now()}`,
        userName: 'Current User',
        userEmail: 'user@example.com',
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
        pros: formData.pros,
        cons: formData.cons,
        images: formData.images?.map((_, index) => `uploaded_image_${index}.jpg`) || [],
        videos: formData.videos?.map((_, index) => `uploaded_video_${index}.mp4`) || [],
        isVerified: false,
        isPurchased: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        dislikes: 0,
        replies: [],
        flags: [],
        status: 'pending',
      };

      return newReview;
    },
    onSuccess: () => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: getQueryKey('list') });
      queryClient.invalidateQueries({ queryKey: getQueryKey('stats') });
      
      toast.success('Review submitted successfully! It will be published after moderation.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    },
  });

  // Like review mutation
  const likeReviewMutation = useMutation({
    mutationFn: async ({ reviewId, action }: { reviewId: string; action: 'like' | 'unlike' }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { reviewId, action };
    },
    onSuccess: ({ reviewId, action }) => {
      // Update the review in cache
      queryClient.setQueryData(getQueryKey('list', { filters, pagination }), (old: ReviewsListResponse | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          reviews: old.reviews.map((review: Review) =>
            review.id === reviewId
              ? {
                  ...review,
                  likes: action === 'like' ? review.likes + 1 : Math.max(0, review.likes - 1),
                }
              : review
          ),
        };
      });

      toast.success(action === 'like' ? 'Review liked' : 'Like removed');
    },
    onError: () => {
      toast.error('Failed to update review like');
    },
  });

  // Dislike review mutation
  const dislikeReviewMutation = useMutation({
    mutationFn: async ({ reviewId, action }: { reviewId: string; action: 'dislike' | 'undislike' }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { reviewId, action };
    },
    onSuccess: ({ reviewId, action }) => {
      queryClient.setQueryData(getQueryKey('list', { filters, pagination }), (old: ReviewsListResponse | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          reviews: old.reviews.map((review: Review) =>
            review.id === reviewId
              ? {
                  ...review,
                  dislikes: action === 'dislike' ? review.dislikes + 1 : Math.max(0, review.dislikes - 1),
                }
              : review
          ),
        };
      });

      toast.success(action === 'dislike' ? 'Review disliked' : 'Dislike removed');
    },
    onError: () => {
      toast.error('Failed to update review dislike');
    },
  });

  // Flag review mutation
  const flagReviewMutation = useMutation({
    mutationFn: async ({ reviewId, reason, description }: { 
      reviewId: string; 
      reason: ReviewFlag['reason']; 
      description?: string;
    }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { reviewId, reason, description };
    },
    onSuccess: () => {
      toast.success('Review flagged successfully. Thank you for reporting!');
    },
    onError: () => {
      toast.error('Failed to flag review');
    },
  });

  // Reply to review mutation
  const replyReviewMutation = useMutation({
    mutationFn: async ({ reviewId, comment }: { reviewId: string; comment: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newReply: ReviewReply = {
        id: `reply_${Date.now()}`,
        reviewId,
        userId: userId || `user_${Date.now()}`,
        userName: 'Current User',
        comment,
        createdAt: new Date(),
        updatedAt: new Date(),
        isOfficial: false,
      };

      return newReply;
    },
    onSuccess: (newReply) => {
      // Update the review in cache to include the reply
      queryClient.setQueryData(getQueryKey('list', { filters, pagination }), (old: ReviewsListResponse | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          reviews: old.reviews.map((review: Review) =>
            review.id === newReply.reviewId
              ? { ...review, replies: [...review.replies, newReply] }
              : review
          ),
        };
      });

      toast.success('Reply posted successfully');
    },
    onError: () => {
      toast.error('Failed to post reply');
    },
  });

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ReviewFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Load more reviews
  const loadMore = useCallback(() => {
    if (reviewsData?.hasMore) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [reviewsData?.hasMore]);

  // Reset pagination
  const resetPagination = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Submit review
  const submitReview = useCallback((formData: ReviewFormData) => {
    return submitReviewMutation.mutate(formData);
  }, [submitReviewMutation]);

  // Like review
  const likeReview = useCallback((reviewId: string) => {
    return likeReviewMutation.mutate({ reviewId, action: 'like' });
  }, [likeReviewMutation]);

  // Unlike review
  const unlikeReview = useCallback((reviewId: string) => {
    return likeReviewMutation.mutate({ reviewId, action: 'unlike' });
  }, [likeReviewMutation]);

  // Dislike review
  const dislikeReview = useCallback((reviewId: string) => {
    return dislikeReviewMutation.mutate({ reviewId, action: 'dislike' });
  }, [dislikeReviewMutation]);

  // Remove dislike
  const removeDislike = useCallback((reviewId: string) => {
    return dislikeReviewMutation.mutate({ reviewId, action: 'undislike' });
  }, [dislikeReviewMutation]);

  // Flag review
  const flagReview = useCallback((reviewId: string, reason: ReviewFlag['reason'], description?: string) => {
    return flagReviewMutation.mutate({ reviewId, reason, description });
  }, [flagReviewMutation]);

  // Reply to review
  const replyToReview = useCallback((reviewId: string, comment: string) => {
    return replyReviewMutation.mutate({ reviewId, comment });
  }, [replyReviewMutation]);

  // Get review by ID
  const getReviewById = useCallback((reviewId: string): Review | undefined => {
    return reviewsData?.reviews.find(review => review.id === reviewId);
  }, [reviewsData?.reviews]);

  // Filter reviews by rating
  const getReviewsByRating = useCallback((rating: number): Review[] => {
    return reviewsData?.reviews.filter(review => review.rating === rating) || [];
  }, [reviewsData?.reviews]);

  // Get verified reviews
  const getVerifiedReviews = useCallback((): Review[] => {
    return reviewsData?.reviews.filter(review => review.isVerified) || [];
  }, [reviewsData?.reviews]);

  // Get purchased reviews
  const getPurchasedReviews = useCallback((): Review[] => {
    return reviewsData?.reviews.filter(review => review.isPurchased) || [];
  }, [reviewsData?.reviews]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealtime || !productId) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: getQueryKey('list') });
      queryClient.invalidateQueries({ queryKey: getQueryKey('stats') });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [enableRealtime, productId, queryClient, getQueryKey]);

  // Computed values
  const computed = useMemo(() => ({
    reviews: reviewsData?.reviews || [],
    stats: statsData || null,
    totalReviews: reviewsData?.total || 0,
    currentPage: pagination.page,
    hasNextPage: reviewsData?.hasMore || false,
    isLoading: isLoadingReviews || isLoadingStats,
    isSubmitting: submitReviewMutation.isPending,
    error: reviewsError || statsError,
    
    // Filter states
    hasFilters: Object.values(filters).some(value => 
      value !== undefined && value !== 'all' && value !== 'newest'
    ),
    
    // Review states
    hasReviews: (reviewsData?.reviews?.length || 0) > 0,
    averageRating: statsData?.averageRating || 0,
    ratingDistribution: statsData?.ratingDistribution || {},
    
    // User interaction states
    isLiking: likeReviewMutation.isPending,
    isDisliking: dislikeReviewMutation.isPending,
    isFlagging: flagReviewMutation.isPending,
    isReplying: replyReviewMutation.isPending,
  }), [
    reviewsData,
    statsData,
    pagination,
    isLoadingReviews,
    isLoadingStats,
    submitReviewMutation.isPending,
    reviewsError,
    statsError,
    filters,
    likeReviewMutation.isPending,
    dislikeReviewMutation.isPending,
    flagReviewMutation.isPending,
    replyReviewMutation.isPending,
  ]);

  return {
    // Data
    ...computed,
    
    // Filters and pagination
    filters,
    pagination,
    
    // Actions
    updateFilters,
    loadMore,
    resetPagination,
    refetch: refetchReviews,
    
    // Review operations
    submitReview,
    likeReview,
    unlikeReview,
    dislikeReview,
    removeDislike,
    flagReview,
    replyToReview,
    
    // Query methods
    getReviewById,
    getReviewsByRating,
    getVerifiedReviews,
    getPurchasedReviews,
    
    // Configuration
    options: {
      productId,
      userId,
      enableRealtime,
      autoLoad,
    },
  };
};

export default useReviews;
