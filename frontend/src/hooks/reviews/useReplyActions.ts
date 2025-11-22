import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

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

export interface ReplyEditData {
  content: string;
}

export interface ReplyReportData {
  reason: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';
  details?: string;
}

export interface UseReplyActionsOptions {
  reviewId: string;
  replyId: string;
  onEditComplete?: () => void;
  onDeleteComplete?: () => void;
}

export const useReplyActions = (options: UseReplyActionsOptions) => {
  const {
    reviewId,
    replyId,
    onEditComplete,
    onDeleteComplete,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editContent, setEditContent] = useState('');

  // Get current reply from cache
  const getCurrentReply = useCallback((): Reply | null => {
    const repliesData = queryClient.getQueryData(['reviews', reviewId, 'replies']) as {
      replies: Reply[];
    } | undefined;
    
    return repliesData?.replies.find(reply => reply.id === replyId) || null;
  }, [queryClient, reviewId, replyId]);

  // Like reply mutation
  const likeReplyMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to like replies');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      console.log(`Toggling like for reply ${replyId}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to like reply',
        { duration: 3000 }
      );
    },
  });

  // Edit reply mutation
  const editReplyMutation = useMutation({
    mutationFn: async (data: ReplyEditData): Promise<Reply> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to edit replies');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const currentReply = getCurrentReply();
      if (!currentReply) {
        throw new Error('Reply not found');
      }

      return {
        ...currentReply,
        content: data.content,
        isEdited: true,
        updatedAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', reviewId, 'replies'] });
      setIsEditing(false);
      setEditContent('');
      onEditComplete?.();
      toast.success('Reply updated successfully', { duration: 3000, icon: '✏️' });
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
    mutationFn: async (): Promise<void> => {
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
      onDeleteComplete?.();
      toast.success('Reply deleted successfully', { duration: 3000, icon: '🗑️' });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete reply',
        { duration: 4000 }
      );
    },
  });

  // Report reply mutation
  const reportReplyMutation = useMutation({
    mutationFn: async (data: ReplyReportData): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to report replies');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log(`Reporting reply ${replyId} for reason: ${data.reason}`, data.details);
    },
    onSuccess: () => {
      setShowReportModal(false);
      toast.success('Reply reported successfully. Thank you for keeping our community safe!', {
        duration: 4000,
        icon: '🚨'
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to report reply',
        { duration: 4000 }
      );
    },
  });

  // Pin/Unpin reply mutation (for moderators/admins)
  const pinReplyMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to pin replies');
      }

      // Check if user has moderator permissions
      if (user?.role !== 'admin') {
        throw new Error('You do not have permission to pin replies');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Toggling pin status for reply ${replyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', reviewId, 'replies'] });
      const currentReply = getCurrentReply();
      const action = currentReply?.isPinned ? 'unpinned' : 'pinned';
      toast.success(`Reply ${action} successfully`, { duration: 3000 });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update pin status',
        { duration: 4000 }
      );
    },
  });

  // Helper functions
  const canEditReply = useCallback((): boolean => {
    if (!isAuthenticated || !user) return false;
    const currentReply = getCurrentReply();
    
    if (!currentReply) return false;
    
    // User can edit their own replies within time limit (e.g., 24 hours)
    const isOwner = currentReply.userId === user.id;
    const isWithinEditTime = new Date().getTime() - new Date(currentReply.createdAt).getTime() < 24 * 60 * 60 * 1000;
    
    return isOwner && isWithinEditTime;
  }, [isAuthenticated, user, getCurrentReply]);

  const canDeleteReply = useCallback((): boolean => {
    if (!isAuthenticated || !user) return false;
    const currentReply = getCurrentReply();
    
    if (!currentReply) return false;
    
    // User can delete their own replies or admins can delete any reply
    const isOwner = currentReply.userId === user.id;
    const isAdmin = user.role === 'admin';
    
    return isOwner || isAdmin;
  }, [isAuthenticated, user, getCurrentReply]);

  const canPinReply = useCallback((): boolean => {
    if (!isAuthenticated || !user) return false;
    return user.role === 'admin';
  }, [isAuthenticated, user]);

  const isLikedByUser = useCallback((): boolean => {
    const currentReply = getCurrentReply();
    return currentReply?.isLiked || false;
  }, [getCurrentReply]);

  const isPinnedReply = useCallback((): boolean => {
    const currentReply = getCurrentReply();
    return currentReply?.isPinned || false;
  }, [getCurrentReply]);

  const getReplyStats = useCallback(() => {
    const currentReply = getCurrentReply();
    return {
      likesCount: currentReply?.likesCount || 0,
      reportCount: currentReply?.reportCount || 0,
      isPinned: currentReply?.isPinned || false,
      isEdited: currentReply?.isEdited || false,
      createdAt: currentReply?.createdAt || '',
      updatedAt: currentReply?.updatedAt || '',
    };
  }, [getCurrentReply]);

  // Action handlers
  const handleLike = useCallback(async () => {
    return likeReplyMutation.mutateAsync();
  }, [likeReplyMutation]);

  const handleEdit = useCallback(async (content: string) => {
    return editReplyMutation.mutateAsync({ content });
  }, [editReplyMutation]);

  const handleDelete = useCallback(async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this reply? This action cannot be undone.'
    );
    
    if (!confirmDelete) return;

    return deleteReplyMutation.mutateAsync();
  }, [deleteReplyMutation]);

  const handleReport = useCallback(async (data: ReplyReportData) => {
    return reportReplyMutation.mutateAsync(data);
  }, [reportReplyMutation]);

  const handlePin = useCallback(async () => {
    return pinReplyMutation.mutateAsync();
  }, [pinReplyMutation]);

  // UI state management
  const startEditing = useCallback(() => {
    const currentReply = getCurrentReply();
    if (currentReply && canEditReply()) {
      setEditContent(currentReply.content);
      setIsEditing(true);
    }
  }, [getCurrentReply, canEditReply]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditContent('');
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editContent.trim()) {
      toast.error('Reply content cannot be empty', { duration: 3000 });
      return;
    }

    if (editContent.length > 500) {
      toast.error('Reply must be 500 characters or less', { duration: 3000 });
      return;
    }

    return handleEdit(editContent);
  }, [editContent, handleEdit]);

  const showReportDialog = useCallback(() => {
    setShowReportModal(true);
  }, []);

  const hideReportDialog = useCallback(() => {
    setShowReportModal(false);
  }, []);

  return {
    // Current reply data
    reply: getCurrentReply(),
    stats: getReplyStats(),
    
    // Permissions
    canEdit: canEditReply(),
    canDelete: canDeleteReply(),
    canPin: canPinReply(),
    
    // State
    isLiked: isLikedByUser(),
    isPinned: isPinnedReply(),
    isEditing,
    editContent,
    showReportModal,
    
    // Actions
    handleLike,
    handleEdit,
    handleDelete,
    handleReport,
    handlePin,
    
    // UI state management
    startEditing,
    cancelEditing,
    saveEdit,
    setEditContent,
    showReportDialog,
    hideReportDialog,
    
    // Loading states
    isLiking: likeReplyMutation.isPending,
    isUpdating: editReplyMutation.isPending,
    isDeleting: deleteReplyMutation.isPending,
    isReporting: reportReplyMutation.isPending,
    isPinning: pinReplyMutation.isPending,
    
    // Errors
    likeError: likeReplyMutation.error,
    editError: editReplyMutation.error,
    deleteError: deleteReplyMutation.error,
    reportError: reportReplyMutation.error,
    pinError: pinReplyMutation.error,
  };
};

export default useReplyActions;
