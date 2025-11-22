import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  isVerified: boolean;
  isHelpful: boolean;
  helpfulCount: number;
  isLiked: boolean;
  likesCount: number;
  isReported: boolean;
  reportCount: number;
  repliesCount: number;
  isPinned?: boolean;
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewEditData {
  title: string;
  content: string;
  rating: number;
  media?: string[];
  tags?: string[];
}

export interface ReviewReportData {
  reason: 'spam' | 'inappropriate' | 'fake' | 'offensive' | 'copyright' | 'other';
  details?: string;
}

export interface UseReviewActionsOptions {
  reviewId: string;
  onEditComplete?: () => void;
  onDeleteComplete?: () => void;
}

export const useReviewActions = (options: UseReviewActionsOptions) => {
  const {
    reviewId,
    onEditComplete,
    onDeleteComplete,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editData, setEditData] = useState<ReviewEditData>({
    title: '',
    content: '',
    rating: 5,
    media: [],
    tags: [],
  });

  // Get current review from cache
  const getCurrentReview = useCallback((): Review | null => {
    const reviewsData = queryClient.getQueryData(['reviews']) as Review[] | undefined;
    return reviewsData?.find(review => review.id === reviewId) || null;
  }, [queryClient, reviewId]);

  // Like review mutation
  const likeReviewMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to like reviews');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      console.log(`Toggling like for review ${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      const currentReview = getCurrentReview();
      const action = currentReview?.isLiked ? 'unliked' : 'liked';
      toast.success(`Review ${action}`, { duration: 2000, icon: '❤️' });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to like review',
        { duration: 3000 }
      );
    },
  });

  // Mark helpful mutation
  const markHelpfulMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to mark reviews as helpful');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Toggling helpful for review ${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      const currentReview = getCurrentReview();
      const action = currentReview?.isHelpful ? 'marked as not helpful' : 'marked as helpful';
      toast.success(`Review ${action}`, { duration: 2000, icon: '👍' });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to mark review as helpful',
        { duration: 3000 }
      );
    },
  });

  // Edit review mutation
  const editReviewMutation = useMutation({
    mutationFn: async (data: ReviewEditData): Promise<Review> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to edit reviews');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const currentReview = getCurrentReview();
      if (!currentReview) {
        throw new Error('Review not found');
      }

      return {
        ...currentReview,
        title: data.title,
        content: data.content,
        rating: data.rating,
        media: data.media ? data.media.map(url => ({ type: 'image' as const, url })) : currentReview.media,
        tags: data.tags,
        updatedAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setIsEditing(false);
      setEditData({ title: '', content: '', rating: 5, media: [], tags: [] });
      onEditComplete?.();
      toast.success('Review updated successfully', { duration: 3000, icon: '✏️' });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update review',
        { duration: 4000 }
      );
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to delete reviews');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Deleting review ${reviewId}`);
    },
    onSuccess: () => {
      // Remove from reviews list
      queryClient.setQueryData(['reviews'], (oldReviews: Review[] = []) => {
        return oldReviews.filter(review => review.id !== reviewId);
      });

      // Also remove from product reviews if cached
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['reviews', reviewId] });
      
      onDeleteComplete?.();
      toast.success('Review deleted successfully', { duration: 3000, icon: '🗑️' });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete review',
        { duration: 4000 }
      );
    },
  });

  // Report review mutation
  const reportReviewMutation = useMutation({
    mutationFn: async (data: ReviewReportData): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to report reviews');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log(`Reporting review ${reviewId} for reason: ${data.reason}`, data.details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setShowReportModal(false);
      toast.success('Review reported successfully. Thank you for keeping our community safe!', {
        duration: 4000,
        icon: '🚨'
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to report review',
        { duration: 4000 }
      );
    },
  });

  // Pin/Feature review mutation (for moderators/admins)
  const pinReviewMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to pin reviews');
      }

      // Check if user has admin permissions
      if (user?.role !== 'admin') {
        throw new Error('You do not have permission to pin reviews');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Toggling pin status for review ${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      const currentReview = getCurrentReview();
      const action = currentReview?.isPinned ? 'unpinned' : 'pinned';
      toast.success(`Review ${action} successfully`, { duration: 3000 });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update pin status',
        { duration: 4000 }
      );
    },
  });

  // Verify review mutation (for moderators/admins)
  const verifyReviewMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to verify reviews');
      }

      // Check if user has admin permissions
      if (user?.role !== 'admin') {
        throw new Error('You do not have permission to verify reviews');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log(`Toggling verification status for review ${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      const currentReview = getCurrentReview();
      const action = currentReview?.isVerified ? 'unverified' : 'verified';
      toast.success(`Review ${action} successfully`, { duration: 3000 });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update verification status',
        { duration: 4000 }
      );
    },
  });

  // Helper functions
  const canEditReview = useCallback((): boolean => {
    if (!isAuthenticated || !user) return false;
    const currentReview = getCurrentReview();
    
    if (!currentReview) return false;
    
    // User can edit their own reviews within time limit (e.g., 24 hours)
    const isOwner = currentReview.userId === user.id;
    const isWithinEditTime = new Date().getTime() - new Date(currentReview.createdAt).getTime() < 24 * 60 * 60 * 1000;
    
    return isOwner && isWithinEditTime;
  }, [isAuthenticated, user, getCurrentReview]);

  const canDeleteReview = useCallback((): boolean => {
    if (!isAuthenticated || !user) return false;
    const currentReview = getCurrentReview();
    
    if (!currentReview) return false;
    
    // User can delete their own reviews or admins can delete any review
    const isOwner = currentReview.userId === user.id;
    const isAdmin = user.role === 'admin';
    
    return isOwner || isAdmin;
  }, [isAuthenticated, user, getCurrentReview]);

  const canPinReview = useCallback((): boolean => {
    if (!isAuthenticated || !user) return false;
    return user.role === 'admin';
  }, [isAuthenticated, user]);

  const canVerifyReview = useCallback((): boolean => {
    if (!isAuthenticated || !user) return false;
    return user.role === 'admin';
  }, [isAuthenticated, user]);

  const isLikedByUser = useCallback((): boolean => {
    const currentReview = getCurrentReview();
    return currentReview?.isLiked || false;
  }, [getCurrentReview]);

  const isHelpfulByUser = useCallback((): boolean => {
    const currentReview = getCurrentReview();
    return currentReview?.isHelpful || false;
  }, [getCurrentReview]);

  const getReviewStats = useCallback(() => {
    const currentReview = getCurrentReview();
    return {
      likesCount: currentReview?.likesCount || 0,
      helpfulCount: currentReview?.helpfulCount || 0,
      reportCount: currentReview?.reportCount || 0,
      repliesCount: currentReview?.repliesCount || 0,
      isVerified: currentReview?.isVerified || false,
      isPinned: currentReview?.isPinned || false,
      createdAt: currentReview?.createdAt || '',
      updatedAt: currentReview?.updatedAt || '',
    };
  }, [getCurrentReview]);

  // Action handlers
  const handleLike = useCallback(async () => {
    return likeReviewMutation.mutateAsync();
  }, [likeReviewMutation]);

  const handleMarkHelpful = useCallback(async () => {
    return markHelpfulMutation.mutateAsync();
  }, [markHelpfulMutation]);

  const handleEdit = useCallback(async (data: ReviewEditData) => {
    return editReviewMutation.mutateAsync(data);
  }, [editReviewMutation]);

  const handleDelete = useCallback(async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this review? This action cannot be undone.'
    );
    
    if (!confirmDelete) return;

    return deleteReviewMutation.mutateAsync();
  }, [deleteReviewMutation]);

  const handleReport = useCallback(async (data: ReviewReportData) => {
    return reportReviewMutation.mutateAsync(data);
  }, [reportReviewMutation]);

  const handlePin = useCallback(async () => {
    return pinReviewMutation.mutateAsync();
  }, [pinReviewMutation]);

  const handleVerify = useCallback(async () => {
    return verifyReviewMutation.mutateAsync();
  }, [verifyReviewMutation]);

  // UI state management
  const startEditing = useCallback(() => {
    const currentReview = getCurrentReview();
    if (currentReview && canEditReview()) {
      setEditData({
        title: currentReview.title,
        content: currentReview.content,
        rating: currentReview.rating,
        media: (currentReview.media || []).map(m => m.url),
        tags: currentReview.tags || [],
      });
      setIsEditing(true);
    }
  }, [getCurrentReview, canEditReview]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditData({ title: '', content: '', rating: 5, media: [], tags: [] });
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editData.title.trim() || !editData.content.trim()) {
      toast.error('Title and content are required', { duration: 3000 });
      return;
    }

    if (editData.rating < 1 || editData.rating > 5) {
      toast.error('Rating must be between 1 and 5', { duration: 3000 });
      return;
    }

    return handleEdit(editData);
  }, [editData, handleEdit]);

  const showReportDialog = useCallback(() => {
    setShowReportModal(true);
  }, []);

  const hideReportDialog = useCallback(() => {
    setShowReportModal(false);
  }, []);

  return {
    // Current review data
    review: getCurrentReview(),
    stats: getReviewStats(),
    
    // Permissions
    canEdit: canEditReview(),
    canDelete: canDeleteReview(),
    canPin: canPinReview(),
    canVerify: canVerifyReview(),
    
    // State
    isLiked: isLikedByUser(),
    isHelpful: isHelpfulByUser(),
    isEditing,
    editData,
    showReportModal,
    
    // Actions
    handleLike,
    handleMarkHelpful,
    handleEdit,
    handleDelete,
    handleReport,
    handlePin,
    handleVerify,
    
    // UI state management
    startEditing,
    cancelEditing,
    saveEdit,
    setEditData,
    showReportDialog,
    hideReportDialog,
    
    // Loading states
    isLiking: likeReviewMutation.isPending,
    isMarkingHelpful: markHelpfulMutation.isPending,
    isUpdating: editReviewMutation.isPending,
    isDeleting: deleteReviewMutation.isPending,
    isReporting: reportReviewMutation.isPending,
    isPinning: pinReviewMutation.isPending,
    isVerifying: verifyReviewMutation.isPending,
    
    // Errors
    likeError: likeReviewMutation.error,
    helpfulError: markHelpfulMutation.error,
    editError: editReviewMutation.error,
    deleteError: deleteReviewMutation.error,
    reportError: reportReviewMutation.error,
    pinError: pinReviewMutation.error,
    verifyError: verifyReviewMutation.error,
  };
};

export default useReviewActions;
