'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Loader2,
  TrendingUp,
  Heart,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '@/lib/utils';

// Types
export interface LikeDislikeState {
  isLiked: boolean;
  isDisliked: boolean;
  likeCount: number;
  dislikeCount: number;
  userVote?: 'like' | 'dislike' | null;
  isLoading?: boolean;
}

export interface LikeDislikeProps {
  reviewId: string;
  userId?: string;
  initialState?: Partial<LikeDislikeState>;
  onLike?: (reviewId: string, isLiked: boolean) => void;
  onDislike?: (reviewId: string, isDisliked: boolean) => void;
  onVoteChange?: (reviewId: string, vote: 'like' | 'dislike' | null, previousVote: 'like' | 'dislike' | null) => void;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'filled' | 'heart' | 'star';
  orientation?: 'horizontal' | 'vertical';
  showCount?: boolean;
  showPercentage?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  disabled?: boolean;
  className?: string;
  
  // Behavior
  allowToggle?: boolean;
  requireLogin?: boolean;
  cooldownPeriod?: number; // in milliseconds
  maxVotesPerUser?: number;
  
  // API
  apiEndpoint?: string;
  optimisticUpdates?: boolean;
  
  // Callbacks
  onError?: (error: Error) => void;
  onSuccess?: (action: 'like' | 'dislike', newState: LikeDislikeState) => void;
  onCooldownViolation?: () => void;
  onLoginRequired?: () => void;
}

const LikeDislike: React.FC<LikeDislikeProps> = ({
  reviewId,
  userId,
  initialState = {},
  onLike,
  onDislike,
  onVoteChange,
  size = 'md',
  variant = 'default',
  orientation = 'horizontal',
  showCount = true,
  showPercentage = false,
  showTooltip = true,
  animate = true,
  disabled = false,
  className,
  allowToggle = true,
  requireLogin = true,
  cooldownPeriod = 1000,
  maxVotesPerUser = 1,
  apiEndpoint = '/api/reviews/vote',
  optimisticUpdates = true,
  onError,
  onSuccess,
  onCooldownViolation,
  onLoginRequired
}) => {
  const [state, setState] = useState<LikeDislikeState>({
    isLiked: false,
    isDisliked: false,
    likeCount: 0,
    dislikeCount: 0,
    userVote: null,
    isLoading: false,
    ...initialState
  });

  const [lastVoteTime, setLastVoteTime] = useState<number>(0);
  const [voteHistory, setVoteHistory] = useState<Array<{ timestamp: number; vote: 'like' | 'dislike' }>>([]);

  const { toast } = useToast();

  // Calculate percentages
  const totalVotes = state.likeCount + state.dislikeCount;
  const likePercentage = totalVotes > 0 ? Math.round((state.likeCount / totalVotes) * 100) : 0;
  const dislikePercentage = totalVotes > 0 ? Math.round((state.dislikeCount / totalVotes) * 100) : 0;

  // Check cooldown
  const isCooldownActive = useCallback(() => {
    return Date.now() - lastVoteTime < cooldownPeriod;
  }, [lastVoteTime, cooldownPeriod]);

  // Check vote limits
  const hasReachedVoteLimit = useCallback(() => {
    const recentVotes = voteHistory.filter(
      vote => Date.now() - vote.timestamp < 24 * 60 * 60 * 1000 // 24 hours
    );
    return recentVotes.length >= maxVotesPerUser;
  }, [voteHistory, maxVotesPerUser]);

  // API call to update vote
  const updateVoteAPI = async (vote: 'like' | 'dislike' | null) => {
    try {
      const response = await fetch(`${apiEndpoint}/${reviewId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId,
          vote,
          previousVote: state.userVote
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update vote');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Handle vote action
  const handleVote = async (voteType: 'like' | 'dislike') => {
    // Validation checks
    if (disabled || state.isLoading) return;

    if (requireLogin && !userId) {
      onLoginRequired?.();
      toast({
        title: 'Login Required',
        description: 'Please log in to vote on reviews.',
        variant: 'warning'
      });
      return;
    }

    if (isCooldownActive()) {
      onCooldownViolation?.();
      toast({
        title: 'Please Wait',
        description: 'Please wait before voting again.',
        variant: 'warning'
      });
      return;
    }

    if (hasReachedVoteLimit()) {
      toast({
        title: 'Vote Limit Reached',
        description: 'You have reached the maximum number of votes for today.',
        variant: 'warning'
      });
      return;
    }

    // Determine new vote state
    const currentVote = state.userVote;
    let newVote: 'like' | 'dislike' | null;

    if (currentVote === voteType && allowToggle) {
      // Toggle off the current vote
      newVote = null;
    } else {
      // Set new vote
      newVote = voteType;
    }

    // Store previous state for rollback
    const previousState = { ...state };
    
    // Optimistic update
    if (optimisticUpdates) {
      const newState = { ...state };
      
      // Remove previous vote
      if (currentVote === 'like') {
        newState.likeCount = Math.max(0, newState.likeCount - 1);
        newState.isLiked = false;
      } else if (currentVote === 'dislike') {
        newState.dislikeCount = Math.max(0, newState.dislikeCount - 1);
        newState.isDisliked = false;
      }

      // Add new vote
      if (newVote === 'like') {
        newState.likeCount += 1;
        newState.isLiked = true;
        newState.isDisliked = false;
      } else if (newVote === 'dislike') {
        newState.dislikeCount += 1;
        newState.isDisliked = true;
        newState.isLiked = false;
      } else {
        newState.isLiked = false;
        newState.isDisliked = false;
      }

      newState.userVote = newVote;
      newState.isLoading = true;
      setState(newState);
    } else {
      setState(prev => ({ ...prev, isLoading: true }));
    }

    try {
      // Update vote timestamp and history
      const now = Date.now();
      setLastVoteTime(now);
      if (newVote) {
        setVoteHistory(prev => [...prev, { timestamp: now, vote: newVote as 'like' | 'dislike' }]);
      }

      // Make API call
      const result = await updateVoteAPI(newVote);

      // Update state with server response
      setState(prev => ({
        ...prev,
        ...result,
        isLoading: false
      }));

      // Call callbacks
      onVoteChange?.(reviewId, newVote, currentVote || null);
      
      if (newVote === 'like') {
        onLike?.(reviewId, true);
      } else if (newVote === 'dislike') {
        onDislike?.(reviewId, true);
      }

      onSuccess?.(newVote || (currentVote as 'like' | 'dislike'), state);

      // Show success message
      if (newVote) {
        toast({
          title: 'Vote Recorded',
          description: `You ${newVote}d this review.`,
          variant: 'success'
        });
      } else if (allowToggle) {
        toast({
          title: 'Vote Removed',
          description: 'Your vote has been removed.',
          variant: 'success'
        });
      }

    } catch (error) {
      console.error('Vote failed:', error);
      
      // Rollback optimistic update
      setState(previousState);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to record vote';
      
      toast({
        title: 'Vote Failed',
        description: errorMessage,
        variant: 'error'
      });

      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  };

  // Get button styles based on variant and size
  const getButtonStyles = (type: 'like' | 'dislike') => {
    const isActive = type === 'like' ? state.isLiked : state.isDisliked;
    const baseStyles = "transition-all duration-200 focus:ring-2 focus:ring-offset-2";
    
    switch (variant) {
      case 'filled':
        return cn(
          baseStyles,
          isActive 
            ? (type === 'like' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600')
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        );
      case 'minimal':
        return cn(
          baseStyles,
          isActive 
            ? (type === 'like' ? 'text-green-600' : 'text-red-600')
            : 'text-gray-600 hover:text-gray-800'
        );
      case 'heart':
      case 'star':
        return cn(
          baseStyles,
          isActive 
            ? 'text-red-500 scale-110' 
            : 'text-gray-400 hover:text-red-300 hover:scale-105'
        );
      default:
        return cn(
          baseStyles,
          'border',
          isActive 
            ? (type === 'like' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700')
            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'
        );
    }
  };

  // Get icon component
  const getIcon = (type: 'like' | 'dislike') => {
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    
    if (variant === 'heart') {
      return <Heart className={cn(iconSize, state.isLiked && 'fill-current')} />;
    }
    
    if (variant === 'star') {
      return <Star className={cn(iconSize, state.isLiked && 'fill-current')} />;
    }
    
    return type === 'like' ? 
      <ThumbsUp className={cn(iconSize, state.isLiked && 'fill-current')} /> :
      <ThumbsDown className={cn(iconSize, state.isDisliked && 'fill-current')} />;
  };

  // Format count display
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Render single button (for heart/star variants)
  if (variant === 'heart' || variant === 'star') {
    const isActive = state.isLiked;
    const count = state.likeCount;
    
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Tooltip content={isActive ? "Remove like" : "Like this review"} disabled={!showTooltip}>
          <Button
            variant="ghost"
            size={size}
            onClick={() => handleVote('like')}
            disabled={disabled || state.isLoading}
            className={getButtonStyles('like')}
            aria-label={isActive ? "Remove like" : "Like this review"}
          >
            <motion.div
              animate={animate && isActive ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {state.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                getIcon('like')
              )}
            </motion.div>
            
            {showCount && count > 0 && (
              <span className="ml-1">{formatCount(count)}</span>
            )}
          </Button>
        </Tooltip>
        
        {showPercentage && totalVotes > 0 && (
          <Badge variant="secondary" className="text-xs">
            {likePercentage}%
          </Badge>
        )}
      </div>
    );
  }

  // Render like/dislike buttons
  return (
    <div className={cn(
      "flex items-center gap-1",
      orientation === 'vertical' && "flex-col",
      className
    )}>
      {/* Like Button */}
      <Tooltip content={state.isLiked ? "Remove like" : "Like this review"} disabled={!showTooltip}>
        <Button
          variant="ghost"
          size={size}
          onClick={() => handleVote('like')}
          disabled={disabled || state.isLoading}
          className={getButtonStyles('like')}
          aria-label={state.isLiked ? "Remove like" : "Like this review"}
        >
          <motion.div
            animate={animate && state.isLiked ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {state.isLoading && state.userVote === 'like' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              getIcon('like')
            )}
          </motion.div>
          
          {showCount && (
            <span className="ml-1">{formatCount(state.likeCount)}</span>
          )}
        </Button>
      </Tooltip>

      {/* Dislike Button */}
      <Tooltip content={state.isDisliked ? "Remove dislike" : "Dislike this review"} disabled={!showTooltip}>
        <Button
          variant="ghost"
          size={size}
          onClick={() => handleVote('dislike')}
          disabled={disabled || state.isLoading}
          className={getButtonStyles('dislike')}
          aria-label={state.isDisliked ? "Remove dislike" : "Dislike this review"}
        >
          <motion.div
            animate={animate && state.isDisliked ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {state.isLoading && state.userVote === 'dislike' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              getIcon('dislike')
            )}
          </motion.div>
          
          {showCount && (
            <span className="ml-1">{formatCount(state.dislikeCount)}</span>
          )}
        </Button>
      </Tooltip>

      {/* Percentage Display */}
      {showPercentage && totalVotes > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Badge variant="outline" className="text-xs">
            {likePercentage}% / {dislikePercentage}%
          </Badge>
        </div>
      )}

      {/* Trending Indicator */}
      {state.likeCount > 50 && likePercentage > 80 && (
        <Tooltip content="This review is trending!">
          <TrendingUp className="w-3 h-3 text-green-500" />
        </Tooltip>
      )}
    </div>
  );
};

export default LikeDislike;
