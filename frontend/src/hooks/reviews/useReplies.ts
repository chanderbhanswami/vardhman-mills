import { useState, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';
import { useOptimisticMutation, OptimisticContext } from './useOptimisticMutations';

export interface Reply {
  id: string;
  reviewId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  isLiked: boolean;
  likesCount: number;
  isReported: boolean;
  reportCount: number;
  isEdited: boolean;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReplyData {
  reviewId: string;
  content: string;
  parentReplyId?: string;
}

export interface UpdateReplyData {
  replyId: string;
  content: string;
}

export interface ReplyFilters {
  sortBy?: 'newest' | 'oldest' | 'likes' | 'relevance';
  onlyVerified?: boolean;
  userId?: string;
}

export interface UseRepliesOptions {
  reviewId: string;
  enableRealtime?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  pageSize?: number;
}

export const useReplies = (options: UseRepliesOptions) => {
  const {
    reviewId,
    enableRealtime = false,
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute
    pageSize = 10,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [filters, setFilters] = useState<ReplyFilters>({
    sortBy: 'newest',
    onlyVerified: false,
  });
  const [page, setPage] = useState(1);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  // Fetch replies for the review
  const {
    data: repliesData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['reviews', reviewId, 'replies', { filters, page, pageSize }],
    queryFn: async (): Promise<{ replies: Reply[]; pagination: { total: number; hasMore: boolean } }> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockReplies: Reply[] = [
        {
          id: 'reply_1',
          reviewId,
          userId: 'user_2',
          userName: 'Sarah Johnson',
          userAvatar: '/images/avatars/sarah.jpg',
          content: 'I completely agree! The quality is outstanding and the fabric feels premium.',
          isLiked: false,
          likesCount: 3,
          isReported: false,
          reportCount: 0,
          isEdited: false,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'reply_2',
          reviewId,
          userId: 'user_3',
          userName: 'Mike Chen',
          userAvatar: '/images/avatars/mike.jpg',
          content: 'Thanks for the detailed review! This helps a lot in making my decision.',
          isLiked: true,
          likesCount: 1,
          isReported: false,
          reportCount: 0,
          isEdited: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'reply_3',
          reviewId,
          userId: user?.id || 'user_current',
          userName: user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'You',
          userAvatar: user?.avatar || '/images/avatars/default.jpg',
          content: 'Great review! I had a similar experience with this product.',
          isLiked: false,
          likesCount: 5,
          isReported: false,
          reportCount: 0,
          isEdited: true,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
      ];

      // Apply filters
      let filteredReplies = [...mockReplies];

      if (filters.onlyVerified) {
        filteredReplies = filteredReplies.filter(() => Math.random() > 0.3); // Mock verification
      }

      if (filters.userId) {
        filteredReplies = filteredReplies.filter(reply => reply.userId === filters.userId);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'oldest':
          filteredReplies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'likes':
          filteredReplies.sort((a, b) => b.likesCount - a.likesCount);
          break;
        case 'newest':
        default:
          filteredReplies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }

      // Paginate
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedReplies = filteredReplies.slice(startIndex, endIndex);

      return {
        replies: paginatedReplies,
        pagination: {
          total: filteredReplies.length,
          hasMore: endIndex < filteredReplies.length,
        },
      };
    },
    enabled: !!reviewId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: enableRealtime || autoRefresh ? refreshInterval : false,
  });

  // Create reply mutation with optimistic updates
  const createReplyMutation = useOptimisticMutation<Reply, Error, CreateReplyData, OptimisticContext<Reply[]>>({
    mutationFn: async (data: CreateReplyData): Promise<Reply> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to reply');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      const newReply: Reply = {
        id: `reply_${Date.now()}`,
        reviewId: data.reviewId,
        userId: user?.id || 'anonymous',
        userName: user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Anonymous',
        userAvatar: user?.avatar || '/images/avatars/default.jpg',
        content: data.content,
        isLiked: false,
        likesCount: 0,
        isReported: false,
        reportCount: 0,
        isEdited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return newReply;
    },
    optimisticUpdates: [{
      queryKey: ['reviews', reviewId, 'replies'],
      updater: (oldData: unknown, variables: CreateReplyData) => {
        const repliesData = (oldData as Reply[]) || [];
        const optimisticReply: Reply = {
          id: `temp_reply_${Date.now()}`,
          reviewId: variables.reviewId,
          userId: user?.id || 'anonymous',
          userName: user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Anonymous',
          userAvatar: user?.avatar || '/images/avatars/default.jpg',
          content: variables.content,
          isLiked: false,
          likesCount: 0,
          isReported: false,
          reportCount: 0,
          isEdited: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [optimisticReply, ...repliesData];
      },
    }],
    onSuccess: () => {
      // Update replies count in review
      queryClient.setQueryData(['reviews'], (oldReviews: unknown[] = []) => {
        return (oldReviews as { id: string; repliesCount?: number }[]).map(review =>
          review.id === reviewId
            ? { ...review, repliesCount: (review.repliesCount || 0) + 1 }
            : review
        );
      });

      queryClient.invalidateQueries({ queryKey: ['reviews', reviewId, 'replies'] });
      setReplyingToId(null);
      toast.success('Reply posted successfully!', { duration: 3000, icon: '💬' });
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'Failed to post reply',
        { duration: 4000 }
      );
    },
  });

  // Update reply mutation
  const updateReplyMutation = useMutation({
    mutationFn: async (data: UpdateReplyData): Promise<Reply> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to edit replies');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Return updated reply (mock)
      return {
        id: data.replyId,
        reviewId,
        userId: user?.id || 'anonymous',
        userName: user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Anonymous',
        userAvatar: user?.avatar || '/images/avatars/default.jpg',
        content: data.content,
        isLiked: false,
        likesCount: 0,
        isReported: false,
        reportCount: 0,
        isEdited: true,
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        updatedAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', reviewId, 'replies'] });
      setEditingReplyId(null);
      toast.success('Reply updated successfully!', { duration: 3000, icon: '✏️' });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update reply',
        { duration: 4000 }
      );
    },
  });

  // Delete reply mutation
  const deleteReplyMutation = useMutation({
    mutationFn: async (replyId: string): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to delete replies');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log(`Deleting reply ${replyId}`);
    },
    onSuccess: () => {
      // Update replies count in review
      queryClient.setQueryData(['reviews'], (oldReviews: unknown[] = []) => {
        return (oldReviews as { id: string; repliesCount?: number }[]).map(review =>
          review.id === reviewId
            ? { ...review, repliesCount: Math.max(0, (review.repliesCount || 0) - 1) }
            : review
        );
      });

      queryClient.invalidateQueries({ queryKey: ['reviews', reviewId, 'replies'] });
      toast.success('Reply deleted successfully', { duration: 3000, icon: '🗑️' });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete reply',
        { duration: 4000 }
      );
    },
  });

  // Like reply mutation with optimistic updates
  const likeReplyMutation = useMutation({
    mutationFn: async (replyId: string): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to like replies');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Liking reply ${replyId}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to like reply',
        { duration: 3000 }
      );
    },
  });

  // Report reply mutation with optimistic updates
  const reportReplyMutation = useMutation({
    mutationFn: async ({ replyId, reason }: { replyId: string; reason: string }): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to report replies');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log(`Reporting reply ${replyId} for reason: ${reason}`);
    },
    onSuccess: () => {
      toast.success('Reply reported successfully', { duration: 3000, icon: '🚨' });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to report reply',
        { duration: 4000 }
      );
    },
  });

  // Helper functions
  const getRepliesCount = useCallback((): number => {
    return repliesData?.pagination.total || 0;
  }, [repliesData]);

  const getUserReplies = useCallback((): Reply[] => {
    if (!user?.id) return [];
    return repliesData?.replies.filter(reply => reply.userId === user.id) || [];
  }, [repliesData, user]);

  const canEditReply = useCallback((reply: Reply): boolean => {
    return isAuthenticated && user?.id === reply.userId;
  }, [isAuthenticated, user]);

  const canDeleteReply = useCallback((reply: Reply): boolean => {
    return isAuthenticated && user?.id === reply.userId;
  }, [isAuthenticated, user]);

  const getReplyAge = useCallback((reply: Reply): string => {
    const now = new Date();
    const createdAt = new Date(reply.createdAt);
    const diffInHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    return createdAt.toLocaleDateString();
  }, []);

  // Actions
  const createReply = useCallback(async (data: CreateReplyData) => {
    return createReplyMutation.mutateAsync(data);
  }, [createReplyMutation]);

  const updateReply = useCallback(async (data: UpdateReplyData) => {
    return updateReplyMutation.mutateAsync(data);
  }, [updateReplyMutation]);

  const deleteReply = useCallback(async (replyId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this reply? This action cannot be undone.');
    
    if (!confirmDelete) return;

    return deleteReplyMutation.mutateAsync(replyId);
  }, [deleteReplyMutation]);

  const likeReply = useCallback(async (replyId: string) => {
    return likeReplyMutation.mutateAsync(replyId);
  }, [likeReplyMutation]);

  const reportReply = useCallback(async (replyId: string, reason: string) => {
    return reportReplyMutation.mutateAsync({ replyId, reason });
  }, [reportReplyMutation]);

  const loadMore = useCallback(() => {
    if (repliesData?.pagination.hasMore) {
      setPage(prev => prev + 1);
    }
  }, [repliesData]);

  const updateFilters = useCallback((newFilters: Partial<ReplyFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const startEditing = useCallback((replyId: string) => {
    setEditingReplyId(replyId);
    setReplyingToId(null);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingReplyId(null);
  }, []);

  const startReplying = useCallback((replyId?: string) => {
    setReplyingToId(replyId || 'main');
    setEditingReplyId(null);
  }, []);

  const cancelReplying = useCallback(() => {
    setReplyingToId(null);
  }, []);

  return {
    // Data
    replies: repliesData?.replies || [],
    pagination: repliesData?.pagination || { total: 0, hasMore: false },
    filters,
    
    // State
    isLoading,
    isFetching,
    error,
    page,
    editingReplyId,
    replyingToId,
    
    // Actions
    createReply,
    updateReply,
    deleteReply,
    likeReply,
    reportReply,
    refetch,
    loadMore,
    updateFilters,
    
    // UI state management
    startEditing,
    cancelEditing,
    startReplying,
    cancelReplying,
    
    // Computed values
    repliesCount: getRepliesCount(),
    userReplies: getUserReplies(),
    
    // Helpers
    canEditReply,
    canDeleteReply,
    getReplyAge,
    
    // Mutation states
    isCreating: createReplyMutation.isPending,
    isUpdating: updateReplyMutation.isPending,
    isDeleting: deleteReplyMutation.isPending,
    isLiking: likeReplyMutation.isPending,
    isReporting: reportReplyMutation.isPending,
    
    // Mutation errors
    createError: createReplyMutation.error,
    updateError: updateReplyMutation.error,
    deleteError: deleteReplyMutation.error,
    likeError: likeReplyMutation.error,
    reportError: reportReplyMutation.error,
  };
};

export default useReplies;
