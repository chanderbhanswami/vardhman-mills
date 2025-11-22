import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { 
  ApiResponse, 
  PaginationParams,
  SearchParams 
} from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildPaginationParams, buildSearchParams } from './utils';

/**
 * Review API Service
 * Handles product reviews, ratings, and customer feedback
 */

interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId?: string;
  rating: number;
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
  videos?: string[];
  isVerified: boolean;
  isRecommended: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  moderatorNotes?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    isVerifiedPurchaser: boolean;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
  };
  replies?: ReviewReply[];
}

interface ReviewReply {
  id: string;
  reviewId: string;
  userId?: string;
  authorType: 'customer' | 'admin' | 'vendor';
  authorName: string;
  content: string;
  isOfficial: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  verifiedPurchasePercentage: number;
  recommendationPercentage: number;
  featuredReviews: Review[];
  recentReviews: Review[];
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  verifiedReviews: number;
  reviewsWithImages: number;
  reviewsWithVideos: number;
  helpfulnessRatio: number;
  responseRate: number;
  averageResponseTime: number;
}

class ReviewApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Review Retrieval

  // Get reviews for a product
  async getProductReviews(productId: string, params?: PaginationParams & {
    rating?: number;
    sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful' | 'verified';
    verified?: boolean;
    withImages?: boolean;
    withVideos?: boolean;
  }): Promise<ApiResponse<Review[]>> {
    const queryParams = {
      ...buildPaginationParams(params || {}),
      ...(params?.rating && { rating: params.rating }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.verified !== undefined && { verified: params.verified }),
      ...(params?.withImages !== undefined && { withImages: params.withImages }),
      ...(params?.withVideos !== undefined && { withVideos: params.withVideos }),
    };
    
    return this.client.get<Review[]>(endpoints.reviews.byProduct(productId), { params: queryParams });
  }

  // Get review by ID
  async getReviewById(reviewId: string): Promise<ApiResponse<Review>> {
    return this.client.get<Review>(endpoints.reviews.byId(reviewId));
  }

  // Get reviews by user
  async getUserReviews(userId: string, params?: PaginationParams & {
    status?: 'pending' | 'approved' | 'rejected';
    productId?: string;
  }): Promise<ApiResponse<Review[]>> {
    const queryParams = {
      ...buildPaginationParams(params || {}),
      ...(params?.status && { status: params.status }),
      ...(params?.productId && { productId: params.productId }),
    };
    
    return this.client.get<Review[]>(endpoints.reviews.byUser(userId), { params: queryParams });
  }

  // Get review summary for a product
  async getProductReviewSummary(productId: string): Promise<ApiResponse<ReviewSummary>> {
    return this.client.get<ReviewSummary>(endpoints.reviews.summary(productId));
  }

  // Get featured reviews
  async getFeaturedReviews(params?: PaginationParams & {
    productId?: string;
    rating?: number;
  }): Promise<ApiResponse<Review[]>> {
    const queryParams = {
      ...buildPaginationParams(params || {}),
      ...(params?.productId && { productId: params.productId }),
      ...(params?.rating && { rating: params.rating }),
    };
    
    return this.client.get<Review[]>(endpoints.reviews.featured, { params: queryParams });
  }

  // Get recent reviews
  async getRecentReviews(params?: PaginationParams & {
    productId?: string;
    days?: number;
  }): Promise<ApiResponse<Review[]>> {
    const queryParams = {
      ...buildPaginationParams(params || {}),
      ...(params?.productId && { productId: params.productId }),
      ...(params?.days && { days: params.days }),
    };
    
    return this.client.get<Review[]>(endpoints.reviews.recent, { params: queryParams });
  }

  // Review Management

  // Create review
  async createReview(reviewData: {
    productId: string;
    rating: number;
    title: string;
    content: string;
    pros?: string[];
    cons?: string[];
    isRecommended?: boolean;
    orderId?: string;
  }): Promise<ApiResponse<Review>> {
    return this.client.post<Review>(endpoints.reviews.create, reviewData);
  }

  // Update review
  async updateReview(reviewId: string, updates: {
    rating?: number;
    title?: string;
    content?: string;
    pros?: string[];
    cons?: string[];
    isRecommended?: boolean;
  }): Promise<ApiResponse<Review>> {
    return this.client.put<Review>(endpoints.reviews.update(reviewId), updates);
  }

  // Delete review
  async deleteReview(reviewId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.reviews.delete(reviewId));
  }

  // Upload review media
  async uploadReviewMedia(reviewId: string, files: File[], type: 'images' | 'videos'): Promise<ApiResponse<{
    urls: string[];
  }>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`${type}[${index}]`, file);
    });
    
    return this.client.post<{
      urls: string[];
    }>(endpoints.reviews.uploadMedia(reviewId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Delete review media
  async deleteReviewMedia(reviewId: string, mediaUrl: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.reviews.deleteMedia(reviewId), {
      data: { mediaUrl },
    });
  }

  // Review Interactions

  // Mark review as helpful
  async markHelpful(reviewId: string, helpful: boolean): Promise<ApiResponse<{
    helpfulCount: number;
    notHelpfulCount: number;
  }>> {
    return this.client.post<{
      helpfulCount: number;
      notHelpfulCount: number;
    }>(endpoints.reviews.helpful(reviewId), { helpful });
  }

  // Report review
  async reportReview(reviewId: string, reason: string, details?: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.post<{ message: string }>(endpoints.reviews.report(reviewId), {
      reason,
      details,
    });
  }

  // Reply to review
  async replyToReview(reviewId: string, content: string, isOfficial?: boolean): Promise<ApiResponse<ReviewReply>> {
    return this.client.post<ReviewReply>(endpoints.reviews.reply(reviewId), {
      content,
      isOfficial,
    });
  }

  // Update reply
  async updateReply(replyId: string, content: string): Promise<ApiResponse<ReviewReply>> {
    return this.client.put<ReviewReply>(endpoints.reviews.updateReply(replyId), { content });
  }

  // Delete reply
  async deleteReply(replyId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.reviews.deleteReply(replyId));
  }

  // Review Analytics

  // Get review analytics
  async getReviewAnalytics(params?: {
    productId?: string;
    dateRange?: {
      start: string;
      end: string;
    };
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<{
    totalReviews: number;
    averageRating: number;
    ratingTrends: Array<{
      date: string;
      averageRating: number;
      reviewCount: number;
    }>;
    sentimentAnalysis: {
      positive: number;
      neutral: number;
      negative: number;
    };
    topKeywords: Array<{
      keyword: string;
      count: number;
      sentiment: 'positive' | 'neutral' | 'negative';
    }>;
    categoryBreakdown: Array<{
      category: string;
      averageRating: number;
      reviewCount: number;
    }>;
  }>> {
    const queryParams = {
      ...(params?.productId && { productId: params.productId }),
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.groupBy && { groupBy: params.groupBy }),
    };
    
    return this.client.get<{
      totalReviews: number;
      averageRating: number;
      ratingTrends: Array<{
        date: string;
        averageRating: number;
        reviewCount: number;
      }>;
      sentimentAnalysis: {
        positive: number;
        neutral: number;
        negative: number;
      };
      topKeywords: Array<{
        keyword: string;
        count: number;
        sentiment: 'positive' | 'neutral' | 'negative';
      }>;
      categoryBreakdown: Array<{
        category: string;
        averageRating: number;
        reviewCount: number;
      }>;
    }>(endpoints.reviews.analytics, { params: queryParams });
  }

  // Get review sentiment analysis
  async getReviewSentiment(reviewId: string): Promise<ApiResponse<{
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    keywords: Array<{
      keyword: string;
      sentiment: 'positive' | 'neutral' | 'negative';
      confidence: number;
    }>;
  }>> {
    return this.client.get<{
      sentiment: 'positive' | 'neutral' | 'negative';
      confidence: number;
      keywords: Array<{
        keyword: string;
        sentiment: 'positive' | 'neutral' | 'negative';
        confidence: number;
      }>;
    }>(endpoints.reviews.sentiment(reviewId));
  }

  // Admin Operations

  // Get all reviews (Admin)
  async getAllReviews(params?: SearchParams & PaginationParams & {
    status?: 'pending' | 'approved' | 'rejected' | 'hidden';
    rating?: number;
    verified?: boolean;
    reportedOnly?: boolean;
    productId?: string;
    userId?: string;
  }): Promise<ApiResponse<Review[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.status && { status: params.status }),
      ...(params?.rating && { rating: params.rating }),
      ...(params?.verified !== undefined && { verified: params.verified }),
      ...(params?.reportedOnly !== undefined && { reportedOnly: params.reportedOnly }),
      ...(params?.productId && { productId: params.productId }),
      ...(params?.userId && { userId: params.userId }),
    };
    
    return this.client.get<Review[]>(endpoints.reviews.admin.list, { params: queryParams });
  }

  // Moderate review (Admin)
  async moderateReview(reviewId: string, action: 'approve' | 'reject' | 'hide', notes?: string): Promise<ApiResponse<Review>> {
    return this.client.put<Review>(endpoints.reviews.admin.moderate(reviewId), {
      action,
      notes,
    });
  }

  // Bulk moderate reviews (Admin)
  async bulkModerateReviews(reviewIds: string[], action: 'approve' | 'reject' | 'hide', notes?: string): Promise<ApiResponse<{
    message: string;
    processedCount: number;
    errors: Array<{
      reviewId: string;
      error: string;
    }>;
  }>> {
    return this.client.put<{
      message: string;
      processedCount: number;
      errors: Array<{
        reviewId: string;
        error: string;
      }>;
    }>(endpoints.reviews.admin.bulkModerate, {
      reviewIds,
      action,
      notes,
    });
  }

  // Get review statistics (Admin)
  async getReviewStatistics(): Promise<ApiResponse<ReviewStats>> {
    return this.client.get<ReviewStats>(endpoints.reviews.admin.statistics);
  }

  // Export reviews (Admin)
  async exportReviews(params?: {
    format?: 'csv' | 'xlsx' | 'json';
    status?: 'pending' | 'approved' | 'rejected' | 'hidden';
    dateRange?: {
      start: string;
      end: string;
    };
    productId?: string;
  }): Promise<ApiResponse<Blob>> {
    return this.client.get<Blob>(endpoints.reviews.admin.export, {
      params: params || {},
      responseType: 'blob',
    });
  }

  // Review Insights

  // Get product insights from reviews
  async getProductInsights(productId: string): Promise<ApiResponse<{
    overallSentiment: 'positive' | 'neutral' | 'negative';
    strengthsAndWeaknesses: {
      strengths: Array<{
        aspect: string;
        mentions: number;
        sentiment: number;
      }>;
      weaknesses: Array<{
        aspect: string;
        mentions: number;
        sentiment: number;
      }>;
    };
    improvementSuggestions: string[];
    competitorComparisons: Array<{
      competitor: string;
      sentiment: number;
      mentions: number;
    }>;
    featureRatings: Array<{
      feature: string;
      rating: number;
      mentions: number;
    }>;
  }>> {
    return this.client.get<{
      overallSentiment: 'positive' | 'neutral' | 'negative';
      strengthsAndWeaknesses: {
        strengths: Array<{
          aspect: string;
          mentions: number;
          sentiment: number;
        }>;
        weaknesses: Array<{
          aspect: string;
          mentions: number;
          sentiment: number;
        }>;
      };
      improvementSuggestions: string[];
      competitorComparisons: Array<{
        competitor: string;
        sentiment: number;
        mentions: number;
      }>;
      featureRatings: Array<{
        feature: string;
        rating: number;
        mentions: number;
      }>;
    }>(endpoints.reviews.insights(productId));
  }

  // Get review templates
  async getReviewTemplates(): Promise<ApiResponse<Array<{
    id: string;
    category: string;
    questions: Array<{
      question: string;
      type: 'rating' | 'text' | 'boolean' | 'multiple_choice';
      required: boolean;
      options?: string[];
    }>;
  }>>> {
    return this.client.get<Array<{
      id: string;
      category: string;
      questions: Array<{
        question: string;
        type: 'rating' | 'text' | 'boolean' | 'multiple_choice';
        required: boolean;
        options?: string[];
      }>;
    }>>(endpoints.reviews.templates);
  }

  // Generate review invitation
  async generateReviewInvitation(orderId: string, customMessage?: string): Promise<ApiResponse<{
    invitationId: string;
    emailSent: boolean;
    invitationUrl: string;
  }>> {
    return this.client.post<{
      invitationId: string;
      emailSent: boolean;
      invitationUrl: string;
    }>(endpoints.reviews.generateInvitation, {
      orderId,
      customMessage,
    });
  }

  // Search reviews
  async searchReviews(params: SearchParams & PaginationParams & {
    productId?: string;
    rating?: number;
    verified?: boolean;
    sentiment?: 'positive' | 'neutral' | 'negative';
  }): Promise<ApiResponse<Review[]>> {
    const queryParams = {
      ...buildSearchParams(params),
      ...buildPaginationParams(params),
      ...(params.productId && { productId: params.productId }),
      ...(params.rating && { rating: params.rating }),
      ...(params.verified !== undefined && { verified: params.verified }),
      ...(params.sentiment && { sentiment: params.sentiment }),
    };
    
    return this.client.get<Review[]>(endpoints.reviews.search, { params: queryParams });
  }
}

// Create service instance
const reviewApiService = new ReviewApiService();

// React Query Hooks

// Review Retrieval
export const useProductReviews = (productId: string, params?: PaginationParams & {
  rating?: number;
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful' | 'verified';
  verified?: boolean;
  withImages?: boolean;
  withVideos?: boolean;
}) => {
  return useQuery({
    queryKey: ['reviews', 'product', productId, params],
    queryFn: () => reviewApiService.getProductReviews(productId, params),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useReview = (reviewId: string) => {
  return useQuery({
    queryKey: ['reviews', 'detail', reviewId],
    queryFn: () => reviewApiService.getReviewById(reviewId),
    enabled: !!reviewId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useUserReviews = (userId: string, params?: PaginationParams & {
  status?: 'pending' | 'approved' | 'rejected';
  productId?: string;
}) => {
  return useQuery({
    queryKey: ['reviews', 'user', userId, params],
    queryFn: () => reviewApiService.getUserReviews(userId, params),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductReviewSummary = (productId: string) => {
  return useQuery({
    queryKey: ['reviews', 'summary', productId],
    queryFn: () => reviewApiService.getProductReviewSummary(productId),
    enabled: !!productId,
    staleTime: 15 * 60 * 1000,
  });
};

export const useFeaturedReviews = (params?: PaginationParams & {
  productId?: string;
  rating?: number;
}) => {
  return useQuery({
    queryKey: ['reviews', 'featured', params],
    queryFn: () => reviewApiService.getFeaturedReviews(params),
    staleTime: 30 * 60 * 1000,
  });
};

export const useRecentReviews = (params?: PaginationParams & {
  productId?: string;
  days?: number;
}) => {
  return useQuery({
    queryKey: ['reviews', 'recent', params],
    queryFn: () => reviewApiService.getRecentReviews(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Analytics
export const useReviewAnalytics = (params?: {
  productId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  groupBy?: 'day' | 'week' | 'month';
}) => {
  return useQuery({
    queryKey: ['reviews', 'analytics', params],
    queryFn: () => reviewApiService.getReviewAnalytics(params),
    staleTime: 15 * 60 * 1000,
  });
};

export const useReviewSentiment = (reviewId: string) => {
  return useQuery({
    queryKey: ['reviews', 'sentiment', reviewId],
    queryFn: () => reviewApiService.getReviewSentiment(reviewId),
    enabled: !!reviewId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useProductInsights = (productId: string) => {
  return useQuery({
    queryKey: ['reviews', 'insights', productId],
    queryFn: () => reviewApiService.getProductInsights(productId),
    enabled: !!productId,
    staleTime: 30 * 60 * 1000,
  });
};

export const useReviewTemplates = () => {
  return useQuery({
    queryKey: ['reviews', 'templates'],
    queryFn: () => reviewApiService.getReviewTemplates(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// Search
export const useSearchReviews = (params: SearchParams & PaginationParams & {
  productId?: string;
  rating?: number;
  verified?: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative';
}) => {
  return useQuery({
    queryKey: ['reviews', 'search', params],
    queryFn: () => reviewApiService.searchReviews(params),
    enabled: !!params.q,
    staleTime: 5 * 60 * 1000,
  });
};

// Admin Hooks
export const useAllReviews = (params?: SearchParams & PaginationParams & {
  status?: 'pending' | 'approved' | 'rejected' | 'hidden';
  rating?: number;
  verified?: boolean;
  reportedOnly?: boolean;
  productId?: string;
  userId?: string;
}) => {
  return useQuery({
    queryKey: ['reviews', 'admin', 'list', params],
    queryFn: () => reviewApiService.getAllReviews(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useReviewStatistics = () => {
  return useQuery({
    queryKey: ['reviews', 'admin', 'statistics'],
    queryFn: () => reviewApiService.getReviewStatistics(),
    staleTime: 15 * 60 * 1000,
  });
};

// Mutation Hooks

// Review Management
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reviewData: {
      productId: string;
      rating: number;
      title: string;
      content: string;
      pros?: string[];
      cons?: string[];
      isRecommended?: boolean;
      orderId?: string;
    }) => reviewApiService.createReview(reviewData),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'product', productId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'summary', productId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'user'] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reviewId, updates }: {
      reviewId: string;
      updates: {
        rating?: number;
        title?: string;
        content?: string;
        pros?: string[];
        cons?: string[];
        isRecommended?: boolean;
      };
    }) => reviewApiService.updateReview(reviewId, updates),
    onSuccess: (data, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'detail', reviewId] });
      if (data?.data?.productId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'product', data.data.productId] });
        queryClient.invalidateQueries({ queryKey: ['reviews', 'summary', data.data.productId] });
      }
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reviewId: string) => reviewApiService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useUploadReviewMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reviewId, files, type }: {
      reviewId: string;
      files: File[];
      type: 'images' | 'videos';
    }) => reviewApiService.uploadReviewMedia(reviewId, files, type),
    onSuccess: (_, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'detail', reviewId] });
    },
  });
};

export const useDeleteReviewMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reviewId, mediaUrl }: {
      reviewId: string;
      mediaUrl: string;
    }) => reviewApiService.deleteReviewMedia(reviewId, mediaUrl),
    onSuccess: (_, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'detail', reviewId] });
    },
  });
};

// Review Interactions
export const useMarkHelpful = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reviewId, helpful }: {
      reviewId: string;
      helpful: boolean;
    }) => reviewApiService.markHelpful(reviewId, helpful),
    onSuccess: (_, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'detail', reviewId] });
    },
  });
};

export const useReportReview = () => {
  return useMutation({
    mutationFn: ({ reviewId, reason, details }: {
      reviewId: string;
      reason: string;
      details?: string;
    }) => reviewApiService.reportReview(reviewId, reason, details),
  });
};

export const useReplyToReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reviewId, content, isOfficial }: {
      reviewId: string;
      content: string;
      isOfficial?: boolean;
    }) => reviewApiService.replyToReview(reviewId, content, isOfficial),
    onSuccess: (_, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'detail', reviewId] });
    },
  });
};

export const useUpdateReply = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ replyId, content }: {
      replyId: string;
      content: string;
    }) => reviewApiService.updateReply(replyId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useDeleteReply = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (replyId: string) => reviewApiService.deleteReply(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

// Admin Operations
export const useModerateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reviewId, action, notes }: {
      reviewId: string;
      action: 'approve' | 'reject' | 'hide';
      notes?: string;
    }) => reviewApiService.moderateReview(reviewId, action, notes),
    onSuccess: (_, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'detail', reviewId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'admin'] });
    },
  });
};

export const useBulkModerateReviews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reviewIds, action, notes }: {
      reviewIds: string[];
      action: 'approve' | 'reject' | 'hide';
      notes?: string;
    }) => reviewApiService.bulkModerateReviews(reviewIds, action, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useExportReviews = () => {
  return useMutation({
    mutationFn: (params?: {
      format?: 'csv' | 'xlsx' | 'json';
      status?: 'pending' | 'approved' | 'rejected' | 'hidden';
      dateRange?: {
        start: string;
        end: string;
      };
      productId?: string;
    }) => reviewApiService.exportReviews(params),
  });
};

export const useGenerateReviewInvitation = () => {
  return useMutation({
    mutationFn: ({ orderId, customMessage }: {
      orderId: string;
      customMessage?: string;
    }) => reviewApiService.generateReviewInvitation(orderId, customMessage),
  });
};

export default reviewApiService;