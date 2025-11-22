"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface AnnouncementSkeletonProps {
  className?: string;
  position?: 'top' | 'bottom';
  variant?: 'compact' | 'standard' | 'detailed';
  showControls?: boolean;
  showActions?: boolean;
}

const AnnouncementSkeleton: React.FC<AnnouncementSkeletonProps> = ({
  className = "",
  position = 'top',
  variant = 'standard',
  showControls = true,
  showActions = true
}) => {
  // Animation variants for shimmer effect
  const shimmerVariant = {
    initial: {
      backgroundPosition: "-200px 0"
    },
    animate: {
      backgroundPosition: "calc(200px + 100%) 0"
    }
  };

  const shimmerTransition = {
    duration: 1.5,
    ease: "linear" as const,
    repeat: Infinity
  };

  // Base skeleton styles with shimmer effect
  const skeletonClasses = `
    animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 
    dark:from-gray-700 dark:via-gray-600 dark:to-gray-700
    bg-[length:200px_100%] bg-no-repeat
  `;

  const getVariantHeight = () => {
    switch (variant) {
      case 'compact':
        return 'min-h-[40px]';
      case 'detailed':
        return 'min-h-[80px]';
      default:
        return 'min-h-[52px]';
    }
  };

  const getVariantContent = () => {
    switch (variant) {
      case 'compact':
        return (
          <div className="flex items-center space-x-3 flex-1">
            {/* Icon skeleton */}
            <motion.div
              className={`w-4 h-4 rounded-full ${skeletonClasses}`}
              variants={shimmerVariant}
              initial="initial"
              animate="animate"
              transition={shimmerTransition}
            />
            
            {/* Text skeleton */}
            <motion.div
              className={`h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1 max-w-md ${skeletonClasses}`}
              variants={shimmerVariant}
              initial="initial"
              animate="animate"
              transition={shimmerTransition}
            />
          </div>
        );

      case 'detailed':
        return (
          <div className="flex items-start space-x-4 flex-1 py-2">
            {/* Icon skeleton */}
            <motion.div
              className={`w-6 h-6 rounded-full mt-1 ${skeletonClasses}`}
              variants={shimmerVariant}
              initial="initial"
              animate="animate"
              transition={shimmerTransition}
            />
            
            <div className="flex-1 space-y-2">
              {/* Title skeleton */}
              <motion.div
                className={`h-4 bg-gray-300 dark:bg-gray-600 rounded max-w-xs ${skeletonClasses}`}
                variants={shimmerVariant}
                initial="initial"
                animate="animate"
                transition={shimmerTransition}
              />
              
              {/* Message skeleton */}
              <motion.div
                className={`h-3 bg-gray-300 dark:bg-gray-600 rounded max-w-lg ${skeletonClasses}`}
                variants={shimmerVariant}
                initial="initial"
                animate="animate"
                transition={shimmerTransition}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center space-x-4 flex-1">
            {/* Priority indicator skeleton */}
            <motion.div
              className={`w-2 h-2 rounded-full ${skeletonClasses}`}
              variants={shimmerVariant}
              initial="initial"
              animate="animate"
              transition={shimmerTransition}
            />
            
            {/* Icon skeleton */}
            <motion.div
              className={`w-5 h-5 rounded-full ${skeletonClasses}`}
              variants={shimmerVariant}
              initial="initial"
              animate="animate"
              transition={shimmerTransition}
            />
            
            <div className="flex-1 space-y-1">
              {/* Title skeleton */}
              <motion.div
                className={`h-4 bg-gray-300 dark:bg-gray-600 rounded max-w-48 ${skeletonClasses}`}
                variants={shimmerVariant}
                initial="initial"
                animate="animate"
                transition={shimmerTransition}
              />
              
              {/* Message skeleton */}
              <motion.div
                className={`h-3 bg-gray-300 dark:bg-gray-600 rounded max-w-96 ${skeletonClasses}`}
                variants={shimmerVariant}
                initial="initial"
                animate="animate"
                transition={shimmerTransition}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`
        ${position === 'top' ? 'top-0' : 'bottom-0'} 
        left-0 right-0 z-50 
        bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700
        ${getVariantHeight()}
        ${className}
      `}
      role="status"
      aria-label="Loading announcement"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          
          {/* Main content skeleton */}
          {getVariantContent()}

          {/* Actions skeleton */}
          {showActions && (
            <div className="hidden lg:flex items-center space-x-3 mx-6">
              {[1, 2].map((index) => (
                <motion.div
                  key={index}
                  className={`h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded-md ${skeletonClasses}`}
                  variants={shimmerVariant}
                  initial="initial"
                  animate="animate"
                  transition={{ ...shimmerTransition, delay: index * 0.1 }}
                />
              ))}
            </div>
          )}

          {/* Controls skeleton */}
          {showControls && (
            <div className="flex items-center space-x-2 ml-4">
              
              {/* Navigation dots skeleton */}
              <div className="hidden sm:flex items-center space-x-1">
                {[1, 2, 3].map((index) => (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 ${skeletonClasses}`}
                    variants={shimmerVariant}
                    initial="initial"
                    animate="animate"
                    transition={{ ...shimmerTransition, delay: index * 0.05 }}
                  />
                ))}
              </div>

              {/* Mobile action button skeleton */}
              <div className="lg:hidden">
                <motion.div
                  className={`w-5 h-5 rounded bg-gray-300 dark:bg-gray-600 ${skeletonClasses}`}
                  variants={shimmerVariant}
                  initial="initial"
                  animate="animate"
                  transition={shimmerTransition}
                />
              </div>

              {/* Close button skeleton */}
              <motion.div
                className={`w-4 h-4 rounded bg-gray-300 dark:bg-gray-600 ${skeletonClasses}`}
                variants={shimmerVariant}
                initial="initial"
                animate="animate"
                transition={shimmerTransition}
              />
            </div>
          )}
        </div>
      </div>

      {/* Progress bar skeleton */}
      <motion.div
        className={`h-0.5 bg-gray-300 dark:bg-gray-600 ${skeletonClasses}`}
        variants={shimmerVariant}
        initial="initial"
        animate="animate"
        transition={shimmerTransition}
      />

      {/* Screen reader text */}
      <span className="sr-only">Loading announcement content...</span>
    </div>
  );
};

// Multiple skeleton variants for different use cases
export const CompactAnnouncementSkeleton: React.FC<Omit<AnnouncementSkeletonProps, 'variant'>> = (props) => (
  <AnnouncementSkeleton {...props} variant="compact" />
);

export const StandardAnnouncementSkeleton: React.FC<Omit<AnnouncementSkeletonProps, 'variant'>> = (props) => (
  <AnnouncementSkeleton {...props} variant="standard" />
);

export const DetailedAnnouncementSkeleton: React.FC<Omit<AnnouncementSkeletonProps, 'variant'>> = (props) => (
  <AnnouncementSkeleton {...props} variant="detailed" />
);

// Multiple skeletons for loading states with multiple announcements
export const MultipleAnnouncementSkeletons: React.FC<{
  count?: number;
  variant?: AnnouncementSkeletonProps['variant'];
  className?: string;
  staggerDelay?: number;
}> = ({
  count = 3,
  variant = 'standard',
  className = "",
  staggerDelay = 0.1
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * staggerDelay }}
      >
        <AnnouncementSkeleton
          variant={variant}
          className="relative"
        />
      </motion.div>
    ))}
  </div>
);

// Skeleton for announcement management/admin interface
export const AnnouncementListSkeleton: React.FC<{
  itemCount?: number;
  showHeader?: boolean;
  showPagination?: boolean;
  className?: string;
}> = ({
  itemCount = 5,
  showHeader = true,
  showPagination = true,
  className = ""
}) => {
  const skeletonClasses = `
    animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 
    dark:from-gray-700 dark:via-gray-600 dark:to-gray-700
  `;

  return (
    <div className={`space-y-4 ${className}`} role="status" aria-label="Loading announcements">
      
      {/* Header skeleton */}
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <motion.div
            className={`h-8 w-48 rounded ${skeletonClasses}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className={`h-10 w-32 rounded-md ${skeletonClasses}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        </div>
      )}

      {/* List items */}
      <div className="space-y-3">
        {Array.from({ length: itemCount }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                {/* Title */}
                <motion.div
                  className={`h-5 w-3/4 rounded ${skeletonClasses}`}
                />
                
                {/* Meta info */}
                <div className="flex items-center space-x-4">
                  <motion.div className={`h-4 w-16 rounded ${skeletonClasses}`} />
                  <motion.div className={`h-4 w-20 rounded ${skeletonClasses}`} />
                  <motion.div className={`h-4 w-24 rounded ${skeletonClasses}`} />
                </div>
                
                {/* Description */}
                <motion.div className={`h-4 w-5/6 rounded ${skeletonClasses}`} />
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <motion.div className={`h-8 w-8 rounded ${skeletonClasses}`} />
                <motion.div className={`h-8 w-8 rounded ${skeletonClasses}`} />
                <motion.div className={`h-8 w-8 rounded ${skeletonClasses}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination skeleton */}
      {showPagination && (
        <div className="flex items-center justify-between mt-6">
          <motion.div
            className={`h-4 w-32 rounded ${skeletonClasses}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          />
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((index) => (
              <motion.div
                key={index}
                className={`h-8 w-8 rounded ${skeletonClasses}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
              />
            ))}
          </div>
        </div>
      )}

      <span className="sr-only">Loading announcement list...</span>
    </div>
  );
};

export default AnnouncementSkeleton;
