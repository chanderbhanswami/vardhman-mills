'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CouponSkeletonProps {
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Layout variant
   */
  layout?: 'card' | 'compact' | 'detailed';
  
  /**
   * Animation type
   */
  animation?: 'pulse' | 'wave' | 'none';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Test ID for testing
   */
  testId?: string;
}

const CouponSkeleton: React.FC<CouponSkeletonProps> = ({
  size = 'md',
  layout = 'card',
  animation = 'pulse',
  className,
  testId = 'coupon-skeleton'
}) => {
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-3',
          header: 'h-8',
          icon: 'w-8 h-8',
          title: 'h-4',
          subtitle: 'h-3',
          button: 'h-6',
          code: 'h-6'
        };
      case 'lg':
        return {
          card: 'p-6',
          header: 'h-12',
          icon: 'w-12 h-12',
          title: 'h-6',
          subtitle: 'h-4',
          button: 'h-10',
          code: 'h-10'
        };
      default:
        return {
          card: 'p-4',
          header: 'h-10',
          icon: 'w-10 h-10',
          title: 'h-5',
          subtitle: 'h-4',
          button: 'h-8',
          code: 'h-8'
        };
    }
  };

  // Get animation classes
  const getAnimationClasses = () => {
    switch (animation) {
      case 'wave':
        return 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[wave_1.5s_ease-in-out_infinite]';
      case 'pulse':
        return 'animate-pulse bg-gray-200';
      default:
        return 'bg-gray-200';
    }
  };

  const sizeClasses = getSizeClasses();
  const animationClasses = getAnimationClasses();

  const skeletonClass = cn('rounded', animationClasses);

  if (layout === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn('bg-white border border-gray-200 rounded-lg', sizeClasses.card, className)}
        data-testid={testId}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={cn(skeletonClass, sizeClasses.icon, 'rounded-full')} />
          
          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className={cn(skeletonClass, sizeClasses.title, 'w-3/4')} />
            <div className={cn(skeletonClass, sizeClasses.subtitle, 'w-1/2')} />
          </div>
          
          {/* Button */}
          <div className={cn(skeletonClass, sizeClasses.button, 'w-20')} />
        </div>
      </motion.div>
    );
  }

  if (layout === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn('bg-white border border-gray-200 rounded-lg', sizeClasses.card, className)}
        data-testid={testId}
      >
        {/* Header */}
        <div className={cn(skeletonClass, sizeClasses.header, 'rounded-t-lg mb-4')} />
        
        {/* Content */}
        <div className="space-y-4">
          {/* Title area */}
          <div className="space-y-2">
            <div className={cn(skeletonClass, sizeClasses.title, 'w-full')} />
            <div className={cn(skeletonClass, sizeClasses.subtitle, 'w-4/5')} />
          </div>
          
          {/* Code area */}
          <div className={cn(skeletonClass, sizeClasses.code, 'w-full')} />
          
          {/* Stats area */}
          <div className="grid grid-cols-2 gap-2">
            <div className={cn(skeletonClass, 'h-3 w-full')} />
            <div className={cn(skeletonClass, 'h-3 w-full')} />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-2">
            <div className={cn(skeletonClass, sizeClasses.button, 'flex-1')} />
            <div className={cn(skeletonClass, sizeClasses.button, 'w-12')} />
          </div>
          
          {/* Additional details */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className={cn(skeletonClass, 'h-3 w-3/4')} />
            <div className={cn(skeletonClass, 'h-3 w-1/2')} />
          </div>
        </div>
      </motion.div>
    );
  }

  // Default card layout
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('bg-white border border-gray-200 rounded-lg', sizeClasses.card, className)}
      data-testid={testId}
    >
      {/* Header */}
      <div className={cn(skeletonClass, sizeClasses.header, 'rounded-t-lg mb-3')} />
      
      {/* Content */}
      <div className="space-y-3">
        {/* Title */}
        <div className={cn(skeletonClass, sizeClasses.title, 'w-full')} />
        
        {/* Subtitle */}
        <div className={cn(skeletonClass, sizeClasses.subtitle, 'w-3/4')} />
        
        {/* Code */}
        <div className={cn(skeletonClass, sizeClasses.code, 'w-full')} />
        
        {/* Progress bar */}
        <div className={cn(skeletonClass, 'h-2 w-full')} />
        
        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <div className={cn(skeletonClass, sizeClasses.button, 'flex-1')} />
          <div className={cn(skeletonClass, sizeClasses.button, 'w-10')} />
        </div>
      </div>
    </motion.div>
  );
};

export default CouponSkeleton;
