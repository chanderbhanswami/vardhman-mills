'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Card } from '../ui/Card';

interface GiftCardSkeletonProps {
  viewMode?: 'grid' | 'list';
  showActions?: boolean;
  showFavorite?: boolean;
  className?: string;
}

interface SkeletonLineProps {
  width?: string;
  height?: string;
  className?: string;
}

interface SkeletonCircleProps {
  size?: string;
  className?: string;
}

interface SkeletonRectangleProps {
  width?: string;
  height?: string;
  className?: string;
}

// Basic skeleton components
const SkeletonLine: React.FC<SkeletonLineProps> = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className 
}) => (
  <div
    className={clsx(
      'bg-gray-200 rounded animate-pulse',
      width,
      height,
      className
    )}
  />
);

const SkeletonCircle: React.FC<SkeletonCircleProps> = ({ 
  size = 'w-8 h-8', 
  className 
}) => (
  <div
    className={clsx(
      'bg-gray-200 rounded-full animate-pulse',
      size,
      className
    )}
  />
);

const SkeletonRectangle: React.FC<SkeletonRectangleProps> = ({ 
  width = 'w-full', 
  height = 'h-32', 
  className 
}) => (
  <div
    className={clsx(
      'bg-gray-200 rounded animate-pulse',
      width,
      height,
      className
    )}
  />
);

// Skeleton for grid view gift card
const GiftCardGridSkeleton: React.FC<{
  showActions?: boolean;
  showFavorite?: boolean;
}> = ({ showActions = true, showFavorite = true }) => (
  <Card className="overflow-hidden">
    {/* Card Image */}
    <div className="relative">
      <SkeletonRectangle height="h-48" className="rounded-none" />
      
      {/* Favorite Button */}
      {showFavorite && (
        <div className="absolute top-3 right-3">
          <SkeletonCircle size="w-6 h-6" />
        </div>
      )}
      
      {/* Status Badge */}
      <div className="absolute top-3 left-3">
        <SkeletonLine width="w-16" height="h-5" className="rounded-full" />
      </div>
    </div>

    {/* Card Content */}
    <div className="p-4 space-y-3">
      {/* Title */}
      <SkeletonLine width="w-3/4" height="h-5" />
      
      {/* Description */}
      <SkeletonLine width="w-full" height="h-3" />
      <SkeletonLine width="w-2/3" height="h-3" />
      
      {/* Amount and Balance */}
      <div className="flex justify-between items-center pt-2">
        <div className="space-y-1">
          <SkeletonLine width="w-12" height="h-3" />
          <SkeletonLine width="w-16" height="h-5" />
        </div>
        <div className="space-y-1 text-right">
          <SkeletonLine width="w-12" height="h-3" />
          <SkeletonLine width="w-16" height="h-5" />
        </div>
      </div>
      
      {/* Code and Date */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <SkeletonLine width="w-20" height="h-3" />
        <SkeletonLine width="w-24" height="h-3" />
      </div>
      
      {/* Tags */}
      <div className="flex gap-2 pt-2">
        <SkeletonLine width="w-12" height="h-4" className="rounded-full" />
        <SkeletonLine width="w-16" height="h-4" className="rounded-full" />
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <SkeletonLine width="w-8" height="h-3" />
          <SkeletonLine width="w-10" height="h-3" />
        </div>
        <SkeletonLine width="w-full" height="h-2" className="rounded-full" />
      </div>
      
      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-2 pt-4">
          <SkeletonLine width="w-full" height="h-8" className="rounded-md" />
          <SkeletonCircle size="w-8 h-8" />
          <SkeletonCircle size="w-8 h-8" />
        </div>
      )}
    </div>
  </Card>
);

// Skeleton for list view gift card
const GiftCardListSkeleton: React.FC<{
  showActions?: boolean;
  showFavorite?: boolean;
}> = ({ showActions = true, showFavorite = true }) => (
  <Card className="p-4">
    <div className="flex items-center space-x-4">
      {/* Checkbox */}
      <SkeletonCircle size="w-4 h-4" />
      
      {/* Card Thumbnail */}
      <SkeletonRectangle width="w-16" height="h-10" />
      
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center space-x-2">
          <SkeletonLine width="w-32" height="h-5" />
          <SkeletonLine width="w-16" height="h-5" className="rounded-full" />
        </div>
        <div className="flex items-center space-x-4">
          <SkeletonLine width="w-20" height="h-3" />
          <SkeletonLine width="w-24" height="h-3" />
          <SkeletonLine width="w-28" height="h-3" />
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        {showFavorite && <SkeletonCircle size="w-4 h-4" />}
        {showActions && (
          <>
            <SkeletonCircle size="w-6 h-6" />
            <SkeletonCircle size="w-6 h-6" />
            <SkeletonCircle size="w-6 h-6" />
          </>
        )}
      </div>
    </div>
  </Card>
);

// Skeleton for detailed view
const GiftCardDetailSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    {/* Header */}
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Card Preview */}
        <div className="lg:w-1/2">
          <SkeletonRectangle height="h-64" className="rounded-lg" />
        </div>
        
        {/* Details */}
        <div className="lg:w-1/2 space-y-4">
          <div className="flex items-center justify-between">
            <SkeletonLine width="w-40" height="h-7" />
            <SkeletonLine width="w-16" height="h-6" className="rounded-full" />
          </div>
          
          <SkeletonLine width="w-full" height="h-4" />
          <SkeletonLine width="w-3/4" height="h-4" />
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <SkeletonLine width="w-12" height="h-3" />
              <SkeletonLine width="w-20" height="h-5" />
            </div>
            <div className="space-y-2">
              <SkeletonLine width="w-12" height="h-3" />
              <SkeletonLine width="w-20" height="h-5" />
            </div>
            <div className="space-y-2">
              <SkeletonLine width="w-12" height="h-3" />
              <SkeletonLine width="w-16" height="h-5" />
            </div>
            <div className="space-y-2">
              <SkeletonLine width="w-12" height="h-3" />
              <SkeletonLine width="w-24" height="h-5" />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <SkeletonLine width="w-24" height="h-9" className="rounded-md" />
            <SkeletonLine width="w-20" height="h-9" className="rounded-md" />
            <SkeletonLine width="w-16" height="h-9" className="rounded-md" />
          </div>
        </div>
      </div>
    </Card>
    
    {/* Tabs */}
    <Card className="p-6">
      <div className="flex space-x-6 border-b border-gray-200 mb-6">
        <SkeletonLine width="w-20" height="h-5" />
        <SkeletonLine width="w-16" height="h-5" />
        <SkeletonLine width="w-18" height="h-5" />
      </div>
      
      {/* Tab Content */}
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="space-y-2">
              <SkeletonLine width="w-32" height="h-4" />
              <SkeletonLine width="w-24" height="h-3" />
            </div>
            <SkeletonLine width="w-20" height="h-4" />
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// Skeleton for form
const GiftCardFormSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
    {/* Header */}
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonLine width="w-40" height="h-7" />
          <SkeletonLine width="w-24" height="h-4" />
        </div>
        <div className="flex items-center space-x-3">
          <SkeletonLine width="w-20" height="h-8" className="rounded-md" />
          <SkeletonLine width="w-20" height="h-8" className="rounded-md" />
          <SkeletonCircle size="w-8 h-8" />
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center space-x-2">
          {Array.from({ length: 6 }, (_, i) => (
            <React.Fragment key={i}>
              <SkeletonCircle size="w-8 h-8" />
              {i < 5 && <SkeletonLine width="flex-1" height="h-1" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
    
    {/* Form Content */}
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <SkeletonLine width="w-48" height="h-6" />
        
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="p-4">
              <SkeletonRectangle height="h-20" className="mb-3" />
              <SkeletonLine width="w-20" height="h-4" />
              <SkeletonLine width="w-32" height="h-3" className="mt-1" />
            </Card>
          ))}
        </div>
        
        <div className="space-y-4">
          <SkeletonLine width="w-24" height="h-4" />
          <SkeletonLine width="w-full" height="h-10" className="rounded-md" />
        </div>
        
        <div className="space-y-4">
          <SkeletonLine width="w-32" height="h-4" />
          <SkeletonLine width="w-full" height="h-20" className="rounded-md" />
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <SkeletonLine width="w-20" height="h-9" className="rounded-md" />
        <SkeletonLine width="w-16" height="h-9" className="rounded-md" />
      </div>
    </div>
  </div>
);

// Skeleton for checkout
const GiftCardCheckoutSkeleton: React.FC = () => (
  <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Main Content */}
    <div className="lg:col-span-2 space-y-6">
      <Card className="p-6">
        <SkeletonLine width="w-32" height="h-6" className="mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonLine width="w-24" height="h-4" />
              <SkeletonLine width="w-full" height="h-10" className="rounded-md" />
            </div>
          ))}
        </div>
      </Card>
      
      <Card className="p-6">
        <SkeletonLine width="w-40" height="h-6" className="mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i} className="p-4 border-2">
              <SkeletonCircle size="w-6 h-6" className="mb-2" />
              <SkeletonLine width="w-20" height="h-4" />
              <SkeletonLine width="w-32" height="h-3" className="mt-1" />
            </Card>
          ))}
        </div>
      </Card>
    </div>
    
    {/* Sidebar */}
    <div className="space-y-6">
      <Card className="p-6">
        <SkeletonLine width="w-24" height="h-6" className="mb-4" />
        <SkeletonRectangle height="h-32" className="mb-4 rounded-lg" />
        <div className="space-y-3">
          <div className="flex justify-between">
            <SkeletonLine width="w-16" height="h-4" />
            <SkeletonLine width="w-20" height="h-4" />
          </div>
          <div className="flex justify-between">
            <SkeletonLine width="w-12" height="h-4" />
            <SkeletonLine width="w-16" height="h-4" />
          </div>
          <div className="flex justify-between border-t pt-2">
            <SkeletonLine width="w-10" height="h-5" />
            <SkeletonLine width="w-20" height="h-5" />
          </div>
        </div>
        <SkeletonLine width="w-full" height="h-10" className="mt-4 rounded-md" />
      </Card>
    </div>
  </div>
);

export const GiftCardSkeleton: React.FC<GiftCardSkeletonProps> = ({
  viewMode = 'grid',
  showActions = true,
  showFavorite = true,
  className
}) => {
  return (
    <div className={className}>
      {viewMode === 'grid' ? (
        <GiftCardGridSkeleton 
          showActions={showActions} 
          showFavorite={showFavorite} 
        />
      ) : (
        <GiftCardListSkeleton 
          showActions={showActions} 
          showFavorite={showFavorite} 
        />
      )}
    </div>
  );
};

// Export named skeletons for specific use cases
export {
  GiftCardDetailSkeleton,
  GiftCardFormSkeleton,
  GiftCardCheckoutSkeleton,
  SkeletonLine,
  SkeletonCircle,
  SkeletonRectangle
};

export default GiftCardSkeleton;
