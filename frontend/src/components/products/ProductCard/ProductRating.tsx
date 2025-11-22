'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/product.types';
import { cn } from '@/lib/utils';
import { Star, StarHalf, MessageSquare, TrendingUp, Award } from 'lucide-react';

export interface ProductRatingProps {
  product: Product;
  className?: string;
  showCount?: boolean;
  showStars?: boolean;
  showText?: boolean;
  showVerified?: boolean;
  showTrending?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  maxStars?: number;
}

export const ProductRating: React.FC<ProductRatingProps> = ({
  product,
  className,
  showCount = true,
  showStars = true,
  showText = false,
  showVerified = true,
  showTrending = false,
  size = 'md',
  interactive = false,
  maxStars = 5,
}) => {
  const rating = product.rating?.average || 0;
  const reviewCount = product.reviewCount || 0;
  const hasReviews = reviewCount > 0;

  // Calculate star display
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: {
      star: 'h-3 w-3',
      text: 'text-xs',
    },
    md: {
      star: 'h-4 w-4',
      text: 'text-sm',
    },
    lg: {
      star: 'h-5 w-5',
      text: 'text-base',
    },
  };

  // Rating quality label
  const getRatingLabel = (rating: number): string => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    if (rating >= 3) return 'Average';
    if (rating >= 2) return 'Below Average';
    return 'Poor';
  };

  // Rating color
  const getRatingColor = (rating: number): string => {
    if (rating >= 4) return 'text-green-600 bg-green-50';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (!hasReviews && !showStars) {
    return (
      <div className={cn('text-xs text-gray-400', className)}>
        No reviews yet
      </div>
    );
  }

  // Wrapper component for interactive rating
  const RatingContent = () => (
    <>
      {/* Stars Display */}
      {showStars && (
        <div className="flex items-center gap-0.5">
          {/* Full Stars */}
          {[...Array(fullStars)].map((_, index) => (
            <Star
              key={`full-${index}`}
              className={cn(sizeClasses[size].star, 'fill-yellow-400 text-yellow-400')}
            />
          ))}
          
          {/* Half Star */}
          {hasHalfStar && (
            <StarHalf
              key="half"
              className={cn(sizeClasses[size].star, 'fill-yellow-400 text-yellow-400')}
            />
          )}
          
          {/* Empty Stars */}
          {[...Array(emptyStars)].map((_, index) => (
            <Star
              key={`empty-${index}`}
              className={cn(sizeClasses[size].star, 'text-gray-300')}
            />
          ))}
        </div>
      )}

      {/* Rating Score */}
      {hasReviews && (
        <div className="flex items-center gap-1.5">
          <span className={cn(
            sizeClasses[size].text,
            'font-semibold text-gray-900'
          )}>
            {rating.toFixed(1)}
          </span>

          {/* Rating Label */}
          {showText && (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              getRatingColor(rating)
            )}>
              {getRatingLabel(rating)}
            </span>
          )}
        </div>
      )}

      {/* Review Count */}
      {showCount && hasReviews && (
        <div className="flex items-center gap-1">
          <MessageSquare className={cn(sizeClasses[size].star, 'text-gray-400')} />
          <span className={cn(sizeClasses[size].text, 'text-gray-600')}>
            ({reviewCount.toLocaleString()})
          </span>
        </div>
      )}

      {/* Verified Reviews Badge */}
      {showVerified && hasReviews && reviewCount >= 50 && (
        <div className="flex items-center gap-1 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
          <Award className="h-3 w-3" />
          <span>Verified</span>
        </div>
      )}

      {/* Trending Badge */}
      {showTrending && rating >= 4.5 && hasReviews && reviewCount >= 100 && (
        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
          <TrendingUp className="h-3 w-3" />
          <span>Trending</span>
        </div>
      )}

      {/* No Reviews Text */}
      {!hasReviews && (
        <span className={cn(sizeClasses[size].text, 'text-gray-400')}>
          No reviews yet
        </span>
      )}
    </>
  );

  if (interactive && hasReviews) {
    return (
      <Link 
        href={`/products/${product.slug}#reviews`}
        className={cn('flex items-center gap-2 hover:opacity-80 transition-opacity', className)}
      >
        <RatingContent />
      </Link>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <RatingContent />
    </div>
  );
};

export default ProductRating;
