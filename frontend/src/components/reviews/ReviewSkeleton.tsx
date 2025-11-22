'use client';

import React from 'react';
import { motion } from 'framer-motion';

// UI Components
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

// Utils
import { cn } from '@/lib/utils';

// Types
export interface ReviewSkeletonProps {
  // Configuration
  variant?: 'default' | 'compact' | 'detailed' | 'list' | 'grid' | 'card';
  count?: number;
  
  // Features to show
  showAvatar?: boolean;
  showRating?: boolean;
  showDate?: boolean;
  showImages?: boolean;
  showVerification?: boolean;
  showHelpful?: boolean;
  showReply?: boolean;
  showActions?: boolean;
  showProduct?: boolean;
  showTags?: boolean;
  
  // Layout
  imageCount?: number;
  tagCount?: number;
  textLines?: number;
  
  // Animation
  animated?: boolean;
  staggerDelay?: number;
  
  // Styling
  className?: string;
  cardClassName?: string;
  
  // Responsive
  responsive?: {
    sm?: Partial<ReviewSkeletonProps>;
    md?: Partial<ReviewSkeletonProps>;
    lg?: Partial<ReviewSkeletonProps>;
  };
}

// Individual skeleton variants
const DefaultReviewSkeleton: React.FC<{
  showAvatar?: boolean;
  showRating?: boolean;
  showDate?: boolean;
  showImages?: boolean;
  showVerification?: boolean;
  showHelpful?: boolean;
  showReply?: boolean;
  showActions?: boolean;
  showProduct?: boolean;
  showTags?: boolean;
  imageCount?: number;
  tagCount?: number;
  textLines?: number;
  animated?: boolean;
  className?: string;
}> = ({
  showAvatar = true,
  showRating = true,
  showDate = true,
  showImages = true,
  showVerification = true,
  showHelpful = true,
  showReply = false,
  showActions = true,
  showProduct = false,
  showTags = true,
  imageCount = 3,
  tagCount = 2,
  textLines = 3,
  animated = true,
  className
}) => {
  const pulseClass = animated ? 'animate-pulse' : '';

  return (
    <Card className={cn('p-6 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-start gap-4">
        {showAvatar && (
          <Avatar 
            size="md"
            fallback=""
            className={cn('bg-gray-200', pulseClass)}
          />
        )}
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className={cn('h-4 w-32', pulseClass)} />
            {showVerification && (
              <Badge variant="secondary" className={cn('opacity-30', pulseClass)}>
                Verified
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {showRating && (
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className={cn('h-4 w-4 rounded', pulseClass)} />
                ))}
              </div>
            )}
            
            {showDate && (
              <Skeleton className={cn('h-3 w-20', pulseClass)} />
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-2">
            <Skeleton className={cn('h-8 w-8 rounded', pulseClass)} />
            <Skeleton className={cn('h-8 w-8 rounded', pulseClass)} />
          </div>
        )}
      </div>

      {/* Product Info */}
      {showProduct && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Skeleton className={cn('h-12 w-12 rounded', pulseClass)} />
          <div className="space-y-1">
            <Skeleton className={cn('h-4 w-40', pulseClass)} />
            <Skeleton className={cn('h-3 w-24', pulseClass)} />
          </div>
        </div>
      )}

      {/* Review Text */}
      <div className="space-y-2">
        {Array.from({ length: textLines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              'h-4',
              i === textLines - 1 ? 'w-3/4' : 'w-full',
              pulseClass
            )}
          />
        ))}
      </div>

      {/* Images */}
      {showImages && imageCount > 0 && (
        <div className="flex gap-2">
          {Array.from({ length: imageCount }).map((_, i) => (
            <Skeleton key={i} className={cn('h-20 w-20 rounded', pulseClass)} />
          ))}
        </div>
      )}

      {/* Tags */}
      {showTags && tagCount > 0 && (
        <div className="flex gap-2">
          {Array.from({ length: tagCount }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn('h-6 w-16 rounded-full', pulseClass)}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t">
        {showHelpful && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className={cn('h-4 w-4 rounded', pulseClass)} />
              <Skeleton className={cn('h-4 w-8', pulseClass)} />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className={cn('h-4 w-4 rounded', pulseClass)} />
              <Skeleton className={cn('h-4 w-6', pulseClass)} />
            </div>
          </div>
        )}
        
        {showReply && (
          <Skeleton className={cn('h-8 w-16 rounded', pulseClass)} />
        )}
      </div>

      {/* Reply Section */}
      {showReply && (
        <div className="ml-8 p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className={cn('h-6 w-6 rounded-full', pulseClass)} />
            <Skeleton className={cn('h-4 w-24', pulseClass)} />
            <Skeleton className={cn('h-3 w-16', pulseClass)} />
          </div>
          <Skeleton className={cn('h-4 w-full', pulseClass)} />
          <Skeleton className={cn('h-4 w-2/3', pulseClass)} />
        </div>
      )}
    </Card>
  );
};

const CompactReviewSkeleton: React.FC<{
  showAvatar?: boolean;
  showRating?: boolean;
  showDate?: boolean;
  animated?: boolean;
  className?: string;
}> = ({
  showAvatar = true,
  showRating = true,
  showDate = true,
  animated = true,
  className
}) => {
  const pulseClass = animated ? 'animate-pulse' : '';

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center gap-3">
        {showAvatar && (
          <Avatar 
            size="sm"
            fallback=""
            className={cn('bg-gray-200', pulseClass)}
          />
        )}
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className={cn('h-3 w-24', pulseClass)} />
            {showRating && (
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className={cn('h-3 w-3 rounded', pulseClass)} />
                ))}
              </div>
            )}
            {showDate && (
              <Skeleton className={cn('h-3 w-16', pulseClass)} />
            )}
          </div>
          <Skeleton className={cn('h-3 w-full', pulseClass)} />
          <Skeleton className={cn('h-3 w-3/4', pulseClass)} />
        </div>
      </div>
    </Card>
  );
};

const DetailedReviewSkeleton: React.FC<{
  animated?: boolean;
  className?: string;
}> = ({
  animated = true,
  className
}) => {
  const pulseClass = animated ? 'animate-pulse' : '';

  return (
    <Card className={cn('p-6 space-y-6', className)}>
      {/* Header with more details */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={cn('rounded-full bg-gray-200 h-16 w-16', pulseClass)} />
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className={cn('h-5 w-40', pulseClass)} />
              <Skeleton className={cn('h-5 w-20 rounded-full', pulseClass)} />
              <Skeleton className={cn('h-5 w-16 rounded-full', pulseClass)} />
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className={cn('h-5 w-5 rounded', pulseClass)} />
                ))}
              </div>
              <Skeleton className={cn('h-4 w-32', pulseClass)} />
              <Skeleton className={cn('h-4 w-20', pulseClass)} />
            </div>
            
            <div className="flex items-center gap-4">
              <Skeleton className={cn('h-4 w-16', pulseClass)} />
              <Skeleton className={cn('h-4 w-24', pulseClass)} />
              <Skeleton className={cn('h-4 w-20', pulseClass)} />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Skeleton className={cn('h-9 w-9 rounded', pulseClass)} />
            <Skeleton className={cn('h-9 w-9 rounded', pulseClass)} />
            <Skeleton className={cn('h-9 w-9 rounded', pulseClass)} />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <Skeleton className={cn('h-16 w-16 rounded', pulseClass)} />
          <div className="flex-1 space-y-2">
            <Skeleton className={cn('h-4 w-48', pulseClass)} />
            <Skeleton className={cn('h-3 w-32', pulseClass)} />
            <div className="flex gap-2">
              <Skeleton className={cn('h-5 w-12 rounded-full', pulseClass)} />
              <Skeleton className={cn('h-5 w-16 rounded-full', pulseClass)} />
            </div>
          </div>
          <Skeleton className={cn('h-6 w-20', pulseClass)} />
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-4">
        <Skeleton className={cn('h-5 w-32', pulseClass)} />
        
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                'h-4',
                i === 3 ? 'w-2/3' : 'w-full',
                pulseClass
              )}
            />
          ))}
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={cn('h-24 w-full rounded', pulseClass)} />
          ))}
        </div>

        {/* Tags and Categories */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn('h-6 w-20 rounded-full', pulseClass)}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn('h-5 w-16 rounded', pulseClass)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Interaction Section */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Skeleton className={cn('h-5 w-5 rounded', pulseClass)} />
              <Skeleton className={cn('h-4 w-12', pulseClass)} />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className={cn('h-5 w-5 rounded', pulseClass)} />
              <Skeleton className={cn('h-4 w-8', pulseClass)} />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className={cn('h-5 w-5 rounded', pulseClass)} />
              <Skeleton className={cn('h-4 w-10', pulseClass)} />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Skeleton className={cn('h-8 w-16 rounded', pulseClass)} />
            <Skeleton className={cn('h-8 w-12 rounded', pulseClass)} />
          </div>
        </div>

        {/* Comments Preview */}
        <div className="space-y-3">
          <Skeleton className={cn('h-4 w-28', pulseClass)} />
          
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3 ml-4">
              <Skeleton className={cn('h-8 w-8 rounded-full', pulseClass)} />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Skeleton className={cn('h-3 w-20', pulseClass)} />
                  <Skeleton className={cn('h-3 w-12', pulseClass)} />
                </div>
                <Skeleton className={cn('h-3 w-full', pulseClass)} />
                <Skeleton className={cn('h-3 w-2/3', pulseClass)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const ListReviewSkeleton: React.FC<{
  animated?: boolean;
  className?: string;
}> = ({
  animated = true,
  className
}) => {
  const pulseClass = animated ? 'animate-pulse' : '';

  return (
    <div className={cn('py-4 border-b border-gray-200', className)}>
      <div className="flex gap-4">
        <div className={cn('rounded-full bg-gray-200 h-12 w-12 flex-shrink-0', pulseClass)} />
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className={cn('h-4 w-32', pulseClass)} />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className={cn('h-4 w-4 rounded', pulseClass)} />
              ))}
            </div>
            <Skeleton className={cn('h-3 w-16', pulseClass)} />
          </div>
          
          <div className="space-y-2">
            <Skeleton className={cn('h-4 w-full', pulseClass)} />
            <Skeleton className={cn('h-4 w-5/6', pulseClass)} />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className={cn('h-12 w-12 rounded', pulseClass)} />
              ))}
            </div>
            
            <div className="flex gap-2 ml-auto">
              <Skeleton className={cn('h-6 w-16 rounded-full', pulseClass)} />
              <Skeleton className={cn('h-6 w-20 rounded-full', pulseClass)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GridReviewSkeleton: React.FC<{
  animated?: boolean;
  className?: string;
}> = ({
  animated = true,
  className
}) => {
  const pulseClass = animated ? 'animate-pulse' : '';

  return (
    <Card className={cn('p-4 space-y-4', className)}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={cn('rounded-full bg-gray-200 h-10 w-10', pulseClass)} />
          <div className="space-y-1">
            <Skeleton className={cn('h-3 w-24', pulseClass)} />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className={cn('h-3 w-3 rounded', pulseClass)} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className={cn('h-3 w-full', pulseClass)} />
          <Skeleton className={cn('h-3 w-4/5', pulseClass)} />
          <Skeleton className={cn('h-3 w-3/5', pulseClass)} />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className={cn('h-16 w-full rounded', pulseClass)} />
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <Skeleton className={cn('h-3 w-16', pulseClass)} />
          <div className="flex gap-1">
            <Skeleton className={cn('h-6 w-6 rounded', pulseClass)} />
            <Skeleton className={cn('h-6 w-6 rounded', pulseClass)} />
          </div>
        </div>
      </div>
    </Card>
  );
};

const CardReviewSkeleton: React.FC<{
  animated?: boolean;
  className?: string;
}> = ({
  animated = true,
  className
}) => {
  const pulseClass = animated ? 'animate-pulse' : '';

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Image/Media Area */}
      <Skeleton className={cn('h-48 w-full', pulseClass)} />
      
      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn('rounded-full bg-gray-200 h-10 w-10', pulseClass)} />
            <div className="space-y-1">
              <Skeleton className={cn('h-4 w-28', pulseClass)} />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className={cn('h-3 w-3 rounded', pulseClass)} />
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Skeleton className={cn('h-4 w-full', pulseClass)} />
            <Skeleton className={cn('h-4 w-4/5', pulseClass)} />
            <Skeleton className={cn('h-4 w-3/5', pulseClass)} />
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t">
          <div className="flex gap-2">
            <Skeleton className={cn('h-6 w-12 rounded-full', pulseClass)} />
            <Skeleton className={cn('h-6 w-16 rounded-full', pulseClass)} />
          </div>
          
          <div className="flex gap-1">
            <Skeleton className={cn('h-8 w-8 rounded', pulseClass)} />
            <Skeleton className={cn('h-8 w-8 rounded', pulseClass)} />
          </div>
        </div>
      </div>
    </Card>
  );
};

// Main component
const ReviewSkeleton: React.FC<ReviewSkeletonProps> = ({
  variant = 'default',
  count = 1,
  showAvatar = true,
  showRating = true,
  showDate = true,
  showImages = true,
  showVerification = true,
  showHelpful = true,
  showReply = false,
  showActions = true,
  showProduct = false,
  showTags = true,
  imageCount = 3,
  tagCount = 2,
  textLines = 3,
  animated = true,
  staggerDelay = 100,
  className,
  cardClassName
}) => {
  const renderSkeleton = (index: number) => {
    const commonProps = {
      showAvatar,
      showRating,
      showDate,
      showImages,
      showVerification,
      showHelpful,
      showReply,
      showActions,
      showProduct,
      showTags,
      imageCount,
      tagCount,
      textLines,
      animated,
      className: cardClassName
    };

    const SkeletonComponent = () => {
      switch (variant) {
        case 'compact':
          return <CompactReviewSkeleton {...commonProps} />;
        case 'detailed':
          return <DetailedReviewSkeleton animated={animated} className={cardClassName} />;
        case 'list':
          return <ListReviewSkeleton animated={animated} className={cardClassName} />;
        case 'grid':
          return <GridReviewSkeleton animated={animated} className={cardClassName} />;
        case 'card':
          return <CardReviewSkeleton animated={animated} className={cardClassName} />;
        default:
          return <DefaultReviewSkeleton {...commonProps} />;
      }
    };

    if (animated && staggerDelay > 0) {
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * (staggerDelay / 1000),
            ease: 'easeOut'
          }}
        >
          <SkeletonComponent />
        </motion.div>
      );
    }

    return <SkeletonComponent key={index} />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </div>
  );
};

// Additional skeleton components for specific use cases

// Review form skeleton
export const ReviewFormSkeleton: React.FC<{
  showProduct?: boolean;
  showMedia?: boolean;
  animated?: boolean;
  className?: string;
}> = ({
  showProduct = true,
  showMedia = true,
  animated = true,
  className
}) => {
  const pulseClass = animated ? 'animate-pulse' : '';

  return (
    <Card className={cn('p-6 space-y-6', className)}>
      {showProduct && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <Skeleton className={cn('h-16 w-16 rounded', pulseClass)} />
          <div className="space-y-2">
            <Skeleton className={cn('h-4 w-40', pulseClass)} />
            <Skeleton className={cn('h-3 w-24', pulseClass)} />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Skeleton className={cn('h-4 w-20 mb-2', pulseClass)} />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className={cn('h-8 w-8 rounded', pulseClass)} />
            ))}
          </div>
        </div>

        <div>
          <Skeleton className={cn('h-4 w-32 mb-2', pulseClass)} />
          <Skeleton className={cn('h-24 w-full rounded', pulseClass)} />
        </div>

        {showMedia && (
          <div>
            <Skeleton className={cn('h-4 w-28 mb-2', pulseClass)} />
            <div className="flex gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className={cn('h-20 w-20 rounded border-2 border-dashed', pulseClass)} />
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <Skeleton className={cn('h-5 w-5 rounded', pulseClass)} />
            <Skeleton className={cn('h-4 w-32', pulseClass)} />
          </div>
          <div className="flex gap-2">
            <Skeleton className={cn('h-9 w-20 rounded', pulseClass)} />
            <Skeleton className={cn('h-9 w-24 rounded', pulseClass)} />
          </div>
        </div>
      </div>
    </Card>
  );
};

// Review stats skeleton
export const ReviewStatsSkeleton: React.FC<{
  animated?: boolean;
  className?: string;
}> = ({
  animated = true,
  className
}) => {
  const pulseClass = animated ? 'animate-pulse' : '';

  return (
    <Card className={cn('p-6 space-y-6', className)}>
      <div className="text-center space-y-3">
        <Skeleton className={cn('h-16 w-16 rounded-full mx-auto', pulseClass)} />
        <Skeleton className={cn('h-6 w-24 mx-auto', pulseClass)} />
        <div className="flex justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={cn('h-6 w-6 rounded', pulseClass)} />
          ))}
        </div>
        <Skeleton className={cn('h-4 w-32 mx-auto', pulseClass)} />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className={cn('h-4 w-8', pulseClass)} />
            <Skeleton className={cn('h-4 w-4 rounded', pulseClass)} />
            <div className="flex-1">
              <Skeleton className={cn('h-2 w-full rounded-full', pulseClass)} />
            </div>
            <Skeleton className={cn('h-4 w-12', pulseClass)} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className={cn('h-8 w-12 mx-auto', pulseClass)} />
            <Skeleton className={cn('h-3 w-16 mx-auto', pulseClass)} />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ReviewSkeleton;