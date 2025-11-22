import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useApi from '../api/useApi';
import type { Review, ReviewReply, ReviewFlag } from './useReviews';

export interface ReviewUpdate {
  rating?: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  status?: Review['status'];
}

export interface ReviewMediaUpload {
  images?: File[];
  videos?: File[];
}

export interface ReviewModeration {
  action: 'approve' | 'reject' | 'flag' | 'unflag';
  reason?: string;
  moderatorId: string;
  moderatorName: string;
  timestamp: Date;
}

export interface UseReviewOptions {
  enabled?: boolean;
  loadReplies?: boolean;
  loadFlags?: boolean;
  trackViews?: boolean;
  enableRealtime?: boolean;
  onStatusChange?: (oldStatus: Review['status'], newStatus: Review['status']) => void;
  onLikeChange?: (liked: boolean, likeCount: number) => void;
  onReplyAdded?: (reply: ReviewReply) => void;
}

const QUERY_KEYS = {
  review: (id: string) => ['reviews', id] as const,
  reviewReplies: (id: string) => ['reviews', id, 'replies'] as const,
  reviewFlags: (id: string) => ['reviews', id, 'flags'] as const,
  reviewHistory: (id: string) => ['reviews', id, 'history'] as const,
  reviewMedia: (id: string) => ['reviews', id, 'media'] as const,
} as const;

export const useReview = (reviewId: string, options: UseReviewOptions = {}) => {
  const {
    enabled = true,
    loadReplies = true,
    loadFlags = false,
    trackViews = true,
    enableRealtime = false,
    onStatusChange,
    onLikeChange,
    onReplyAdded,
  } = options;

  const api = useApi();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<Review['status'] | null>(null);

  // Main review query
  const reviewQuery = useQuery({
    queryKey: QUERY_KEYS.review(reviewId),
    queryFn: async () => {
      const response = await api.get<{ review: Review }>(`/reviews/${reviewId}`);
      return response?.review;
    },
    enabled: enabled && !!reviewId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });

  // Review replies query
  const repliesQuery = useQuery({
    queryKey: QUERY_KEYS.reviewReplies(reviewId),
    queryFn: async () => {
      const response = await api.get<{ replies: ReviewReply[] }>(`/reviews/${reviewId}/replies`);
      return response?.replies || [];
    },
    enabled: enabled && loadReplies && !!reviewId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Review flags query (for moderation)
  const flagsQuery = useQuery({
    queryKey: QUERY_KEYS.reviewFlags(reviewId),
    queryFn: async () => {
      const response = await api.get<{ flags: ReviewFlag[] }>(`/reviews/${reviewId}/flags`);
      return response?.flags || [];
    },
    enabled: enabled && loadFlags && !!reviewId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Review history query (for audit trail)
  const historyQuery = useQuery({
    queryKey: QUERY_KEYS.reviewHistory(reviewId),
    queryFn: async () => {
      const response = await api.get<{ 
        history: Array<{
          id: string;
          action: string;
          description: string;
          timestamp: Date;
          userId?: string;
          userName?: string;
          metadata?: Record<string, unknown>;
        }> 
      }>(`/reviews/${reviewId}/history`);
      return response?.history || [];
    },
    enabled: enabled && !!reviewId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: async (updates: ReviewUpdate) => {
      const response = await api.put<{ review: Review }>(`/reviews/${reviewId}`, updates);
      return response?.review;
    },
    onSuccess: (updatedReview) => {
      if (updatedReview) {
        queryClient.setQueryData(QUERY_KEYS.review(reviewId), updatedReview);
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviewHistory(reviewId) });
        toast.success('Review updated successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update review');
    },
  });

  // Like review mutation
  const likeReviewMutation = useMutation({
    mutationFn: async (action: 'like' | 'unlike') => {
      const response = await api.post(`/reviews/${reviewId}/like`, { action });
      return { action, response };
    },
    onMutate: async (action) => {
      // Optimistic update
      const previousData = queryClient.getQueryData<Review>(QUERY_KEYS.review(reviewId));
      
      if (previousData) {
        const updatedReview = {
          ...previousData,
          likes: action === 'like' ? previousData.likes + 1 : previousData.likes - 1,
        };
        queryClient.setQueryData(QUERY_KEYS.review(reviewId), updatedReview);
        setIsLiked(action === 'like');
        onLikeChange?.(action === 'like', updatedReview.likes);
      }
      
      return { previousData };
    },
    onError: (error, action, context) => {
      // Revert optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(QUERY_KEYS.review(reviewId), context.previousData);
        setIsLiked(action === 'unlike');
      }
      toast.error('Failed to update like status');
    },
    onSuccess: () => {
      // Refresh data to ensure accuracy
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.review(reviewId) });
    },
  });

  // Dislike review mutation
  const dislikeReviewMutation = useMutation({
    mutationFn: async (action: 'dislike' | 'undislike') => {
      const response = await api.post(`/reviews/${reviewId}/dislike`, { action });
      return { action, response };
    },
    onMutate: async (action) => {
      const previousData = queryClient.getQueryData<Review>(QUERY_KEYS.review(reviewId));
      
      if (previousData) {
        const updatedReview = {
          ...previousData,
          dislikes: action === 'dislike' ? previousData.dislikes + 1 : previousData.dislikes - 1,
        };
        queryClient.setQueryData(QUERY_KEYS.review(reviewId), updatedReview);
        setIsDisliked(action === 'dislike');
      }
      
      return { previousData };
    },
    onError: (error, action, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(QUERY_KEYS.review(reviewId), context.previousData);
        setIsDisliked(action === 'undislike');
      }
      toast.error('Failed to update dislike status');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.review(reviewId) });
    },
  });

  // Reply to review mutation
  const replyMutation = useMutation({
    mutationFn: async (comment: string) => {
      const response = await api.post<{ reply: ReviewReply }>(`/reviews/${reviewId}/replies`, {
        comment,
      });
      return response?.reply;
    },
    onSuccess: (newReply) => {
      if (newReply) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviewReplies(reviewId) });
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        onReplyAdded?.(newReply);
        toast.success('Reply added successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add reply');
    },
  });

  // Flag review mutation
  const flagReviewMutation = useMutation({
    mutationFn: async ({ reason, description }: { reason: ReviewFlag['reason']; description?: string }) => {
      const response = await api.post(`/reviews/${reviewId}/flag`, {
        reason,
        description,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviewFlags(reviewId) });
      toast.success('Review flagged successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to flag review');
    },
  });

  // Moderate review mutation (for admins)
  const moderateReviewMutation = useMutation({
    mutationFn: async (moderation: ReviewModeration) => {
      const response = await api.post<{ review: Review }>(`/reviews/${reviewId}/moderate`, moderation);
      return response?.review;
    },
    onSuccess: (updatedReview) => {
      if (updatedReview) {
        queryClient.setQueryData(QUERY_KEYS.review(reviewId), updatedReview);
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviewHistory(reviewId) });
        toast.success('Review moderation action completed');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to moderate review');
    },
  });

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async (media: ReviewMediaUpload) => {
      const formData = new FormData();
      
      if (media.images) {
        media.images.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
      }
      
      if (media.videos) {
        media.videos.forEach((video, index) => {
          formData.append(`videos[${index}]`, video);
        });
      }

      const response = await api.post<{ 
        images?: string[];
        videos?: string[];
        review: Review;
      }>(`/reviews/${reviewId}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    },
    onSuccess: (response) => {
      if (response?.review) {
        queryClient.setQueryData(QUERY_KEYS.review(reviewId), response.review);
        toast.success('Media uploaded successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload media');
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete review');
    },
  });

  // Track review view
  const trackViewMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/reviews/${reviewId}/view`);
      return response;
    },
  });

  // Track view when review loads
  useEffect(() => {
    if (reviewQuery.data && trackViews && !viewTracked) {
      trackViewMutation.mutate();
      setViewTracked(true);
    }
  }, [reviewQuery.data, trackViews, viewTracked, trackViewMutation]);

  // Watch for status changes
  useEffect(() => {
    if (reviewQuery.data && previousStatus && reviewQuery.data.status !== previousStatus) {
      onStatusChange?.(previousStatus, reviewQuery.data.status);
    }
    
    if (reviewQuery.data) {
      setPreviousStatus(reviewQuery.data.status);
    }
  }, [reviewQuery.data?.status, previousStatus, onStatusChange, reviewQuery.data]);

  // Real-time updates
  useEffect(() => {
    if (enableRealtime) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.review(reviewId) });
        if (loadReplies) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviewReplies(reviewId) });
        }
      }, 15 * 1000); // Refresh every 15 seconds

      return () => clearInterval(interval);
    }
  }, [enableRealtime, queryClient, reviewId, loadReplies]);

  // Computed values
  const review = reviewQuery.data;
  const replies = repliesQuery.data || [];
  const flags = flagsQuery.data || [];
  const history = historyQuery.data || [];

  const canEdit = review?.userId === 'current-user-id'; // This should come from auth context
  const canModerate = true; // This should come from user permissions
  const canDelete = canEdit || canModerate;
  const canReply = review?.status === 'published';

  const totalReplies = replies.length;
  const officialReplies = replies.filter(reply => reply.isOfficial);
  const userReplies = replies.filter(reply => !reply.isOfficial);

  const flagCount = flags.length;
  const isHighlyFlagged = flagCount >= 3;
  const isPending = review?.status === 'pending';
  const isPublished = review?.status === 'published';
  const isRejected = review?.status === 'rejected';
  const isFlagged = review?.status === 'flagged';

  const helpfulnessScore = review ? review.likes - review.dislikes : 0;
  const isHelpful = helpfulnessScore > 0;

  return {
    // Core data
    review,
    replies,
    flags,
    history,
    
    // Loading states
    isLoading: reviewQuery.isLoading,
    isLoadingReplies: repliesQuery.isLoading,
    isLoadingFlags: flagsQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,

    // Error states
    error: reviewQuery.error,
    repliesError: repliesQuery.error,
    flagsError: flagsQuery.error,
    historyError: historyQuery.error,

    // Mutation states
    isUpdating: updateReviewMutation.isPending,
    isLiking: likeReviewMutation.isPending,
    isDisliking: dislikeReviewMutation.isPending,
    isReplying: replyMutation.isPending,
    isFlagging: flagReviewMutation.isPending,
    isModerating: moderateReviewMutation.isPending,
    isUploadingMedia: uploadMediaMutation.isPending,
    isDeleting: deleteReviewMutation.isPending,

    // User interaction states
    isLiked,
    isDisliked,

    // Actions
    updateReview: updateReviewMutation.mutate,
    likeReview: (action: 'like' | 'unlike') => likeReviewMutation.mutate(action),
    dislikeReview: (action: 'dislike' | 'undislike') => dislikeReviewMutation.mutate(action),
    reply: replyMutation.mutate,
    flag: flagReviewMutation.mutate,
    moderate: moderateReviewMutation.mutate,
    uploadMedia: uploadMediaMutation.mutate,
    deleteReview: deleteReviewMutation.mutate,

    // Computed values
    canEdit,
    canModerate,
    canDelete,
    canReply,
    totalReplies,
    officialReplies,
    userReplies,
    flagCount,
    isHighlyFlagged,
    isPending,
    isPublished,
    isRejected,
    isFlagged,
    helpfulnessScore,
    isHelpful,

    // Refetch functions
    refetch: reviewQuery.refetch,
    refetchReplies: repliesQuery.refetch,
    refetchFlags: flagsQuery.refetch,
    refetchHistory: historyQuery.refetch,
  };
};

export default useReview;
