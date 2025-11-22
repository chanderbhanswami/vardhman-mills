import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import {
  Star,
  StarHalf,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Flag,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  Clock,
  Tag,
  Camera,
  ExternalLink,
  Share2,
  Copy,
  Heart,
  Shield,
  Verified
} from 'lucide-react';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Modal,
  Tooltip
} from '@/components/ui';
import { CardHeader, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/components/providers';
import { reviewApi } from '@/lib/api';
import { format } from 'date-fns';

// Interfaces
interface ReviewProduct {
  id: string;
  name: string;
  image?: string;
  slug?: string;
  sku?: string;
  category?: string;
  price?: number;
  brand?: string;
}

interface ReviewUser {
  id: string;
  name: string;
  avatar?: string;
  location?: string;
  role?: string;
  isVerifiedBuyer?: boolean;
  totalReviews?: number;
  helpfulVotes?: number;
  memberSince?: string;
}

interface ReviewMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
  caption?: string;
}

interface ReviewMetrics {
  views: number;
  helpfulVotes: number;
  unhelpfulVotes: number;
  replies: number;
  shares: number;
  reports: number;
}

interface ReviewModeration {
  status: 'approved' | 'pending' | 'rejected' | 'flagged' | 'spam';
  moderatedBy?: string;
  moderatedAt?: string;
  reason?: string;
  flags: string[];
}

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  status: 'published' | 'hidden' | 'flagged' | 'pending';
  createdAt: string;
  updatedAt?: string;
  isVerified: boolean;
  isRecommended?: boolean;
  isEdited: boolean;
  authorId: string;
  author: ReviewUser;
  product: ReviewProduct;
  media: ReviewMedia[];
  metrics: ReviewMetrics;
  moderation: ReviewModeration;
  tags: string[];
  pros: string[];
  cons: string[];
  purchaseVerified: boolean;
  helpfulnessScore: number;
  sentimentScore?: number;
  readingTime: number;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceType?: string;
    source?: string;
    referrer?: string;
  };
}

interface AccountReviewItemProps {
  review: Review;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
  onUpdate?: () => void;
  showProductContext?: boolean;
  showMetrics?: boolean;
  showModerationTools?: boolean;
  compact?: boolean;
}

export const AccountReviewItem: React.FC<AccountReviewItemProps> = ({
  review,
  isSelected = false,
  onSelect,
  onUpdate,
  showProductContext = true,
  showMetrics = true,
  compact = false
}) => {
  const { user } = useAuth();
  // const { addNotification } = useNotifications();
  const addNotification = useCallback((message: string, type: string) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  }, []);
  const queryClient = useQueryClient();

  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    type: 'approve' | 'reject' | 'flag' | 'delete' | 'edit';
    isOpen: boolean;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mutations
  const moderateReviewMutation = useMutation({
    mutationFn: async ({ action, reason }: { action: string; reason?: string }) => {
      switch (action) {
        case 'approve':
        case 'reject':
          // These would need moderation API endpoints
          throw new Error(`${action} action not yet implemented`);
        case 'flag':
          return reviewApi.reportReview(review.id, reason || 'Flagged by moderator');
        case 'delete':
          return reviewApi.deleteReview(review.id);
        default:
          throw new Error('Invalid action');
      }
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      addNotification(`Review ${action}d successfully`, 'success');
      onUpdate?.();
    },
    onError: (error) => {
      addNotification(`Failed to moderate review: ${error.message}`, 'error');
    }
  });

  const toggleHelpfulMutation = useMutation({
    mutationFn: () => reviewApi.markHelpful(review.id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      onUpdate?.();
    },
    onError: (error) => {
      addNotification(`Failed to update helpful vote: ${error.message}`, 'error');
    }
  });

  // Computed values
  const statusColor = useMemo(() => {
    switch (review.status) {
      case 'published':
        return 'success';
      case 'hidden':
        return 'secondary';
      case 'flagged':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'secondary';
    }
  }, [review.status]);

  const ratingStars = useMemo(() => {
    const stars = [];
    const fullStars = Math.floor(review.rating);
    const hasHalfStar = review.rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(review.rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  }, [review.rating]);

  const contentPreview = useMemo(() => {
    if (compact && review.content.length > 150) {
      return review.content.substring(0, 150) + '...';
    }
    return review.content;
  }, [review.content, compact]);

  // Handlers
  const handleAction = useCallback(async (action: string, reason?: string) => {
    setIsProcessing(true);
    try {
      await moderateReviewMutation.mutateAsync({ action, reason });
      setActionDialog(null);
    } finally {
      setIsProcessing(false);
    }
  }, [moderateReviewMutation]);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/reviews/${review.id}`;
    navigator.clipboard.writeText(url).then(() => {
      addNotification('Review link copied to clipboard', 'success');
    });
  }, [review.id, addNotification]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `Review: ${review.title}`,
        text: review.content.substring(0, 100) + '...',
        url: `${window.location.origin}/reviews/${review.id}`
      });
    } else {
      handleCopyLink();
    }
  }, [review, handleCopyLink]);

  const canModerate = user?.role === 'admin' || user?.role === 'moderator';
  const isOwner = user?.id === review.authorId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group ${compact ? 'mb-3' : 'mb-6'}`}
    >
      <Card className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}>
        {/* Header */}
        <CardHeader className={`${compact ? 'pb-3' : 'pb-4'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {onSelect && (
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => onSelect(e.target.checked)}
                  className="mt-1"
                />
              )}
              
              <Avatar
                src={review.author.avatar}
                alt={review.author.name}
                className="w-10 h-10"
                fallback={review.author.name.charAt(0).toUpperCase()}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {review.author.name}
                  </h4>
                  
                  {review.author.isVerifiedBuyer && (
                    <Tooltip content="Verified Buyer">
                      <Verified className="w-4 h-4 text-blue-500" />
                    </Tooltip>
                  )}
                  
                  {review.isVerified && (
                    <Tooltip content="Verified Review">
                      <Shield className="w-4 h-4 text-green-500" />
                    </Tooltip>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    {ratingStars}
                    <span className="ml-1 font-medium">{review.rating.toFixed(1)}</span>
                  </div>
                  
                  <span>•</span>
                  
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  
                  {review.author.location && (
                    <>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{review.author.location}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant={statusColor}>
                {review.status}
              </Badge>
              
              {review.isEdited && (
                <Tooltip content="This review has been edited">
                  <Badge variant="outline">
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edited
                  </Badge>
                </Tooltip>
              )}

              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
                
                {/* Action buttons for common actions */}
                <div className="hidden group-hover:flex absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg p-2 space-x-1 z-10">
                  <Tooltip content={isExpanded ? 'Collapse' : 'Expand'}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  
                  <Tooltip content="Copy Link">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyLink}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  
                  <Tooltip content="Share">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </Tooltip>

                  {canModerate && (
                    <>
                      {review.status !== 'published' && (
                        <Tooltip content="Approve">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActionDialog({ type: 'approve', isOpen: true })}
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        </Tooltip>
                      )}
                      
                      {review.status !== 'hidden' && (
                        <Tooltip content="Reject">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActionDialog({ type: 'reject', isOpen: true })}
                          >
                            <EyeOff className="w-4 h-4 text-orange-600" />
                          </Button>
                        </Tooltip>
                      )}
                      
                      <Tooltip content="Flag">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActionDialog({ type: 'flag', isOpen: true })}
                        >
                          <Flag className="w-4 h-4 text-yellow-600" />
                        </Button>
                      </Tooltip>
                      
                      <Tooltip content="Delete">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActionDialog({ type: 'delete', isOpen: true })}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </Tooltip>
                    </>
                  )}

                  {isOwner && (
                    <Tooltip content="Edit Review">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActionDialog({ type: 'edit', isOpen: true })}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Product Context */}
          {showProductContext && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {review.product.image && (
                <Image
                  src={review.product.image}
                  alt={review.product.name}
                  width={48}
                  height={48}
                  className="object-cover rounded-md"
                />
              )}
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-medium text-gray-900 truncate">
                  {review.product.name}
                </h5>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  {review.product.brand && (
                    <span>{review.product.brand}</span>
                  )}
                  {review.product.sku && (
                    <>
                      <span>•</span>
                      <span>SKU: {review.product.sku}</span>
                    </>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Review Title */}
          {review.title && (
            <h3 className={`font-semibold text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}>
              {review.title}
            </h3>
          )}

          {/* Review Content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {isExpanded ? review.content : contentPreview}
            </p>
            
            {!isExpanded && contentPreview !== review.content && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="p-0 h-auto font-medium text-blue-600"
              >
                Read more
              </Button>
            )}
          </div>

          {/* Pros & Cons */}
          {(review.pros.length > 0 || review.cons.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {review.pros.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-green-700 flex items-center">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Pros
                  </h4>
                  <ul className="space-y-1">
                    {review.pros.map((pro, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">+</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {review.cons.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-700 flex items-center">
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    Cons
                  </h4>
                  <ul className="space-y-1">
                    {review.cons.map((con, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-red-500 mr-2">-</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Media */}
          {review.media.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <Camera className="w-4 h-4 mr-1" />
                  Media ({review.media.length})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMedia(!showMedia)}
                >
                  {showMedia ? 'Hide' : 'Show'}
                </Button>
              </div>
              
              {showMedia && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {review.media.map((media) => (
                    <div key={media.id} className="relative group">
                      <Image
                        src={media.thumbnail || media.url}
                        alt={media.alt || 'Review media'}
                        width={80}
                        height={80}
                        className="object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                      />
                      {media.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-1" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {review.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {review.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Metrics & Actions */}
          {showMetrics && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{review.metrics.views}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{review.metrics.replies}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{review.readingTime} min read</span>
                </div>
                
                {review.helpfulnessScore > 0 && (
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{Math.round(review.helpfulnessScore * 100)}% helpful</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleHelpfulMutation.mutate()}
                  disabled={toggleHelpfulMutation.isPending}
                  className="text-gray-600 hover:text-green-600"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {review.metrics.helpfulVotes}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-red-600"
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  {review.metrics.unhelpfulVotes}
                </Button>
              </div>
            </div>
          )}

          {/* Moderation Status */}
          {review.moderation.flags.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-yellow-800">
                    Flagged Content
                  </h5>
                  <p className="text-xs text-yellow-700 mt-1">
                    This review has been flagged for: {review.moderation.flags.join(', ')}
                  </p>
                  {review.moderation.reason && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Reason: {review.moderation.reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Modals */}
      <AnimatePresence>
        {actionDialog && (
          <Modal
            open={actionDialog.isOpen}
            onClose={() => setActionDialog(null)}
            title={`${actionDialog.type.charAt(0).toUpperCase() + actionDialog.type.slice(1)} Review`}
          >
            <div className="p-6">
              <p className="mb-4">
                Are you sure you want to {actionDialog.type} this review? 
                {actionDialog.type === 'delete' && ' This action cannot be undone.'}
              </p>
              
              {(actionDialog.type === 'reject' || actionDialog.type === 'flag') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (optional)
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Enter reason for this action..."
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setActionDialog(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleAction(actionDialog.type)}
                  disabled={isProcessing}
                  variant={actionDialog.type === 'delete' ? 'destructive' : 'default'}
                >
                  {isProcessing ? 'Processing...' : `Confirm ${actionDialog.type}`}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
