'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// Types and Interfaces
export interface FAQSkeletonProps {
  variant?: 'default' | 'compact' | 'detailed';
  showStats?: boolean;
  showTags?: boolean;
  showMetadata?: boolean;
  className?: string;
}

// Main Skeleton Component
const FAQSkeleton: React.FC<FAQSkeletonProps> = ({
  variant = 'default',
  showStats = true,
  showTags = true,
  showMetadata = true,
  className
}) => {
  return (
    <Card className={cn('overflow-hidden animate-pulse', className)}>
      <div className={cn(
        'space-y-4',
        variant === 'compact' ? 'p-4' : 'p-6'
      )}>
        {/* Question Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Question Title */}
            <div className="space-y-2">
              <div className={cn(
                'h-6 bg-gray-200 rounded',
                variant === 'compact' ? 'w-3/4' : 'w-5/6'
              )}></div>
              {variant === 'detailed' && (
                <div className="h-5 bg-gray-200 rounded w-2/3"></div>
              )}
            </div>
            
            {/* Metadata */}
            {showMetadata && variant !== 'compact' && (
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                {/* Author Info */}
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
                {/* Date */}
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                {/* Views */}
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        {/* Tags */}
        {showTags && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            {Array.from({ length: 3 }).map((_, index) => (
              <div 
                key={index} 
                className="h-5 w-16 bg-gray-200 rounded-full"
              ></div>
            ))}
          </div>
        )}

        {/* Answer Section */}
        <div className="space-y-3">
          {/* Separator line */}
          {variant !== 'compact' && (
            <div className="h-px bg-gray-200"></div>
          )}
          
          {/* Answer Content */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-11/12"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            {variant === 'detailed' && (
              <>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </>
            )}
          </div>
          
          {/* Read More Link */}
          {variant !== 'compact' && (
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          )}
        </div>

        {/* Actions Section */}
        {showStats && variant !== 'compact' && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {/* Voting Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="h-5 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div 
                  key={index} 
                  className="h-8 w-16 bg-gray-200 rounded"
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Multiple skeleton components for list view
export const FAQSkeletonList: React.FC<{
  count?: number;
  variant?: FAQSkeletonProps['variant'];
  showStats?: boolean;
  showTags?: boolean;
  className?: string;
}> = ({
  count = 5,
  variant = 'default',
  showStats = true,
  showTags = true,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'animate-pulse',
            index === 0 ? 'delay-0' : '',
            index === 1 ? 'animation-delay-100' : '',
            index === 2 ? 'animation-delay-200' : '',
            index === 3 ? 'animation-delay-300' : '',
            index === 4 ? 'animation-delay-400' : ''
          )}
        >
          <FAQSkeleton 
            variant={variant}
            showStats={showStats}
            showTags={showTags}
          />
        </div>
      ))}
    </div>
  );
};

// Category skeleton for FAQ categories
export const FAQCategorySkeleton: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div className={cn('border rounded-lg p-6 animate-pulse', className)}>
      {/* Category Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="h-5 w-8 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 w-12 bg-gray-200 rounded"></div>
            </div>
            <div className="text-center">
              <div className="h-5 w-8 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="text-center">
              <div className="h-5 w-8 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 w-14 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      {/* Separator */}
      <div className="h-px bg-gray-200 my-4"></div>
      
      {/* FAQ Items */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
                  <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Search skeleton for search component
export const FAQSearchSkeleton: React.FC<{
  showDropdown?: boolean;
  className?: string;
}> = ({ showDropdown = false, className }) => {
  return (
    <div className={cn('relative animate-pulse', className)}>
      {/* Search Input Skeleton */}
      <div className="relative">
        <div className="h-12 bg-gray-200 rounded-lg"></div>
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <div className="h-5 w-5 bg-gray-300 rounded"></div>
        </div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="h-4 w-4 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Dropdown Skeleton */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1">
          <Card className="p-2">
            {/* Section Header */}
            <div className="px-3 py-2">
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
            </div>
            
            {/* Suggestion Items */}
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                  </div>
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Filter panel skeleton
export const FAQFilterSkeleton: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <Card className={cn('p-6 animate-pulse', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Stats skeleton for dashboard
export const FAQStatsSkeleton: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse', className)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
            <div className="ml-4 space-y-1">
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FAQSkeleton;
