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
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full">
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
      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
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
              className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer group"
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
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className={cn("group h-full", className)}
    >
      <div className="relative h-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300">
        {/* Top Section: Customer Info + Rating */}
        <div className="flex items-start gap-4 mb-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
              <span className="text-white text-base font-semibold">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {customer.verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Name, Location, Rating */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 text-[15px]">
                {customer.name}
              </h4>
              {customer.verified && (
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {customer.location && <span>{customer.location}</span>}
              {customer.location && <span className="mx-1.5">•</span>}
              <span>{formattedDate}</span>
            </p>
            {/* Stars */}
            <div className="flex items-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarSolid
                  key={star}
                  className={cn(
                    "h-4 w-4",
                    star <= rating ? "text-amber-400" : "text-gray-200"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quote Icon */}
        <div className="absolute top-5 right-5 opacity-[0.08]">
          <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
          </svg>
        </div>

        {/* Review Text */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          "{displayReview}"
          {shouldTruncate && (
            <button
              onClick={handleToggleExpand}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium ml-1"
            >
              {isExpanded ? 'less' : 'more'}
            </button>
          )}
        </p>

        {/* Product Tag */}
        {product && (
          <div className="pt-4 border-t border-gray-100">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="font-medium text-gray-600">{product.name}</span>
              {product.variant && (
                <span className="text-gray-400">• {product.variant}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
