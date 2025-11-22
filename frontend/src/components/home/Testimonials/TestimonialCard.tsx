/**
 * TestimonialCard Component
 * 
 * Individual testimonial card with customer review, rating, and profile information.
 * 
 * Features:
 * - Customer profile with avatar
 * - Star rating display
 * - Review text with read more/less
 * - Verified badge
 * - Purchase info
 * - Images gallery
 * - Helpful vote system
 * - Share functionality
 * - Date display
 * - Responsive design
 * - Hover effects
 * - Like/dislike actions
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  StarIcon as StarSolid,
  CheckBadgeIcon,
  HandThumbUpIcon as ThumbUpSolid,
  HandThumbDownIcon as ThumbDownSolid,
} from '@heroicons/react/24/solid';
import {
  StarIcon as StarOutline,
  HandThumbUpIcon as ThumbUpOutline,
  HandThumbDownIcon as ThumbDownOutline,
  ShareIcon,
  CalendarIcon,
  ShoppingBagIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TestimonialCustomer {
  id: string;
  name: string;
  avatar?: string;
  location?: string;
  verified: boolean;
}

export interface TestimonialProduct {
  id: string;
  name: string;
  variant?: string;
}

export interface TestimonialCardProps {
  /** Testimonial ID */
  id: string;
  /** Customer information */
  customer: TestimonialCustomer;
  /** Rating (0-5) */
  rating: number;
  /** Review text */
  review: string;
  /** Review date */
  date: Date | string;
  /** Product purchased */
  product?: TestimonialProduct;
  /** Review images */
  images?: string[];
  /** Helpful votes count */
  helpfulVotes?: number;
  /** Unhelpful votes count */
  unhelpfulVotes?: number;
  /** Is featured testimonial */
  isFeatured?: boolean;
  /** Maximum review length before truncation */
  maxLength?: number;
  /** Show actions */
  showActions?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On helpful vote */
  onHelpfulVote?: (id: string) => void;
  /** On unhelpful vote */
  onUnhelpfulVote?: (id: string) => void;
  /** On share */
  onShare?: (id: string) => void;
  /** On image click */
  onImageClick?: (imageUrl: string, index: number) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  id,
  customer,
  rating,
  review,
  date,
  product,
  images = [],
  helpfulVotes = 0,
  unhelpfulVotes = 0,
  isFeatured = false,
  maxLength = 200,
  showActions = true,
  className,
  onHelpfulVote,
  onUnhelpfulVote,
  onShare,
  onImageClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isExpanded, setIsExpanded] = useState(false);
  const [hasVotedHelpful, setHasVotedHelpful] = useState(false);
  const [hasVotedUnhelpful, setHasVotedUnhelpful] = useState(false);
  const [localHelpfulVotes, setLocalHelpfulVotes] = useState(helpfulVotes);
  const [localUnhelpfulVotes, setLocalUnhelpfulVotes] = useState(unhelpfulVotes);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const shouldTruncate = useMemo(() => {
    return review.length > maxLength;
  }, [review.length, maxLength]);

  const displayReview = useMemo(() => {
    if (!shouldTruncate || isExpanded) return review;
    return `${review.slice(0, maxLength)}...`;
  }, [review, shouldTruncate, isExpanded, maxLength]);

  const formattedDate = useMemo(() => {
    const reviewDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return reviewDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, [date]);

  const totalVotes = useMemo(() => {
    return localHelpfulVotes + localUnhelpfulVotes;
  }, [localHelpfulVotes, localUnhelpfulVotes]);

  const helpfulPercentage = useMemo(() => {
    if (totalVotes === 0) return 0;
    return Math.round((localHelpfulVotes / totalVotes) * 100);
  }, [localHelpfulVotes, totalVotes]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
    console.log('Review expanded:', !isExpanded);
  }, [isExpanded]);

  const handleHelpfulVote = useCallback(() => {
    if (hasVotedHelpful) {
      setLocalHelpfulVotes((prev) => prev - 1);
      setHasVotedHelpful(false);
    } else {
      setLocalHelpfulVotes((prev) => prev + 1);
      setHasVotedHelpful(true);
      if (hasVotedUnhelpful) {
        setLocalUnhelpfulVotes((prev) => prev - 1);
        setHasVotedUnhelpful(false);
      }
    }
    onHelpfulVote?.(id);
    console.log('Helpful vote:', id);
  }, [id, hasVotedHelpful, hasVotedUnhelpful, onHelpfulVote]);

  const handleUnhelpfulVote = useCallback(() => {
    if (hasVotedUnhelpful) {
      setLocalUnhelpfulVotes((prev) => prev - 1);
      setHasVotedUnhelpful(false);
    } else {
      setLocalUnhelpfulVotes((prev) => prev + 1);
      setHasVotedUnhelpful(true);
      if (hasVotedHelpful) {
        setLocalHelpfulVotes((prev) => prev - 1);
        setHasVotedHelpful(false);
      }
    }
    onUnhelpfulVote?.(id);
    console.log('Unhelpful vote:', id);
  }, [id, hasVotedHelpful, hasVotedUnhelpful, onUnhelpfulVote]);

  const handleShare = useCallback(() => {
    onShare?.(id);
    console.log('Share testimonial:', id);
  }, [id, onShare]);

  const handleImageClick = useCallback(
    (imageUrl: string, index: number) => {
      onImageClick?.(imageUrl, index);
      console.log('Image clicked:', imageUrl, index);
    },
    [onImageClick]
  );

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderStars = () => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? (
            <StarSolid className="h-5 w-5 text-yellow-400" />
          ) : (
            <StarOutline className="h-5 w-5 text-gray-300" />
          )}
        </span>
      ))}
      <span className="ml-2 text-sm font-semibold text-gray-700">
        {rating.toFixed(1)}
      </span>
    </div>
  );

  const renderCustomerInfo = () => (
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {customer.avatar ? (
          <Image
            src={customer.avatar}
            alt={customer.name}
            width={56}
            height={56}
            className="rounded-full object-cover ring-2 ring-gray-200"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-200">
            <span className="text-white text-xl font-bold">
              {customer.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {customer.verified && (
          <Tooltip content="Verified Buyer">
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
              <CheckBadgeIcon className="h-5 w-5 text-blue-600" />
            </div>
          </Tooltip>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-gray-900">{customer.name}</h4>
          {isFeatured && (
            <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
              Featured
            </Badge>
          )}
        </div>
        {customer.location && (
          <p className="text-sm text-gray-500 mt-1">{customer.location}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );

  const renderProductInfo = () => {
    if (!product) return null;

    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
        <ShoppingBagIcon className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-700">
          Purchased: <span className="font-medium">{product.name}</span>
          {product.variant && (
            <span className="text-gray-500"> ({product.variant})</span>
          )}
        </span>
      </div>
    );
  };

  const renderReviewText = () => (
    <div className="space-y-2">
      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
        {displayReview}
      </p>
      {shouldTruncate && (
        <button
          onClick={handleToggleExpand}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );

  const renderImages = () => {
    if (images.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <PhotoIcon className="h-4 w-4" />
          <span>{images.length} customer {images.length === 1 ? 'photo' : 'photos'}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((image, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
              onClick={() => handleImageClick(image, index)}
            >
              <Image
                src={image}
                alt={`Review image ${index + 1}`}
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    +{images.length - 4}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {/* Helpful Votes */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Helpful?</span>
          <div className="flex items-center gap-1">
            <Tooltip content={hasVotedHelpful ? 'Remove helpful vote' : 'Mark as helpful'}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHelpfulVote}
                className={cn(
                  'gap-1',
                  hasVotedHelpful && 'text-green-600 bg-green-50'
                )}
              >
                {hasVotedHelpful ? (
                  <ThumbUpSolid className="h-4 w-4" />
                ) : (
                  <ThumbUpOutline className="h-4 w-4" />
                )}
                <span className="text-sm">{localHelpfulVotes}</span>
              </Button>
            </Tooltip>
            <Tooltip content={hasVotedUnhelpful ? 'Remove unhelpful vote' : 'Mark as unhelpful'}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnhelpfulVote}
                className={cn(
                  'gap-1',
                  hasVotedUnhelpful && 'text-red-600 bg-red-50'
                )}
              >
                {hasVotedUnhelpful ? (
                  <ThumbDownSolid className="h-4 w-4" />
                ) : (
                  <ThumbDownOutline className="h-4 w-4" />
                )}
                <span className="text-sm">{localUnhelpfulVotes}</span>
              </Button>
            </Tooltip>
          </div>
          {totalVotes > 0 && (
            <span className="text-xs text-gray-500 ml-2">
              {helpfulPercentage}% found this helpful
            </span>
          )}
        </div>

        {/* Share Button */}
        <Tooltip content="Share review">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            <ShareIcon className="h-4 w-4" />
            <span className="text-sm">Share</span>
          </Button>
        </Tooltip>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card
        className={cn(
          'overflow-hidden transition-shadow duration-300 hover:shadow-lg',
          isFeatured && 'ring-2 ring-yellow-400'
        )}
      >
        <CardContent className="p-6 space-y-4">
          {/* Stars */}
          {renderStars()}

          {/* Customer Info */}
          {renderCustomerInfo()}

          {/* Product Info */}
          {renderProductInfo()}

          {/* Review Text */}
          {renderReviewText()}

          {/* Images */}
          {renderImages()}

          {/* Actions */}
          {renderActions()}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TestimonialCard;
