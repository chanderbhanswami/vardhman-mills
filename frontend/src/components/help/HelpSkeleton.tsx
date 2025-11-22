'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Types and Interfaces
export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animated?: boolean;
  variant?: 'default' | 'pulse' | 'wave' | 'shimmer';
}

export interface HelpSkeletonProps {
  type?: 'article' | 'list' | 'card' | 'banner' | 'search' | 'sidebar' | 'form' | 'details' | 'grid' | 'table';
  count?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  showMeta?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
  animated?: boolean;
  rows?: number;
  columns?: number;
}

// Animation variants
const shimmerVariants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear' as const
    }
  }
};

const pulseVariants = {
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut' as const
    }
  }
};

const waveVariants = {
  animate: {
    transform: ['translateX(-100%)', 'translateX(100%)'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut' as const
    }
  }
};

// Base Skeleton Component
const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  rounded = 'md',
  animated = true,
  variant = 'default'
}) => {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  const baseClasses = 'bg-gray-200 relative overflow-hidden';

  if (variant === 'shimmer') {
    return (
      <motion.div
        className={cn(
          baseClasses,
          roundedClasses[rounded],
          'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
          className,
          width && 'w-auto',
          height && 'h-auto'
        )}
        data-width={typeof width === 'number' ? `${width}px` : width}
        data-height={typeof height === 'number' ? `${height}px` : height}
        variants={animated ? shimmerVariants : undefined}
        animate={animated ? 'animate' : undefined}
      />
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={cn(
          baseClasses, 
          roundedClasses[rounded], 
          className,
          width && 'w-auto',
          height && 'h-auto'
        )}
        data-width={typeof width === 'number' ? `${width}px` : width}
        data-height={typeof height === 'number' ? `${height}px` : height}
        variants={animated ? pulseVariants : undefined}
        animate={animated ? 'animate' : undefined}
      />
    );
  }

  if (variant === 'wave') {
    return (
      <div 
        className={cn(
          baseClasses, 
          roundedClasses[rounded], 
          className,
          width && 'w-auto',
          height && 'h-auto'
        )}
        data-width={typeof width === 'number' ? `${width}px` : width}
        data-height={typeof height === 'number' ? `${height}px` : height}
      >
        {animated && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            variants={waveVariants}
            animate="animate"
          />
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        baseClasses, 
        roundedClasses[rounded], 
        className,
        width && 'w-auto',
        height && 'h-auto'
      )}
      data-width={typeof width === 'number' ? `${width}px` : width}
      data-height={typeof height === 'number' ? `${height}px` : height}
    />
  );
};

// Skeleton Components for Different Types

// Article Skeleton
const ArticleSkeleton: React.FC<{ variant?: string; showAvatar?: boolean; showMeta?: boolean; animated?: boolean }> = ({
  variant = 'default',
  showAvatar = true,
  showMeta = true,
  animated = true
}) => {
  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        <Skeleton height={20} width="80%" animated={animated} />
        <Skeleton height={16} width="60%" animated={animated} />
        {showMeta && (
          <div className="flex items-center gap-3">
            <Skeleton height={12} width={60} animated={animated} />
            <Skeleton height={12} width={80} animated={animated} />
            <Skeleton height={12} width={40} animated={animated} />
          </div>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton height={20} width={100} rounded="sm" animated={animated} />
          <Skeleton height={20} width={60} rounded="sm" animated={animated} />
        </div>
        <Skeleton height={24} width="90%" animated={animated} />
        <Skeleton height={16} width="100%" animated={animated} />
        <Skeleton height={16} width="85%" animated={animated} />
        <div className="flex items-center justify-between">
          {showAvatar && (
            <div className="flex items-center gap-2">
              <Skeleton height={32} width={32} rounded="full" animated={animated} />
              <div className="space-y-1">
                <Skeleton height={12} width={80} animated={animated} />
                <Skeleton height={10} width={60} animated={animated} />
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Skeleton height={16} width={16} rounded="sm" animated={animated} />
            <Skeleton height={16} width={16} rounded="sm" animated={animated} />
            <Skeleton height={16} width={16} rounded="sm" animated={animated} />
          </div>
        </div>
        {showMeta && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Skeleton height={20} width="100%" animated={animated} />
              <Skeleton height={12} width="60%" animated={animated} className="mt-1" />
            </div>
            <div className="text-center">
              <Skeleton height={20} width="100%" animated={animated} />
              <Skeleton height={12} width="60%" animated={animated} className="mt-1" />
            </div>
            <div className="text-center">
              <Skeleton height={20} width="100%" animated={animated} />
              <Skeleton height={12} width="60%" animated={animated} className="mt-1" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton height={18} width={80} rounded="sm" animated={animated} />
        <Skeleton height={18} width={50} rounded="sm" animated={animated} />
      </div>
      <Skeleton height={20} width="85%" animated={animated} />
      <Skeleton height={16} width="100%" animated={animated} />
      <Skeleton height={16} width="70%" animated={animated} />
      {showAvatar && (
        <div className="flex items-center gap-2">
          <Skeleton height={24} width={24} rounded="full" animated={animated} />
          <Skeleton height={12} width={100} animated={animated} />
          <Skeleton height={12} width={80} animated={animated} />
        </div>
      )}
    </div>
  );
};

// List Skeleton
const ListSkeleton: React.FC<{ count?: number; variant?: string; animated?: boolean }> = ({
  count = 5,
  variant = 'default',
  animated = true
}) => {
  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton height={16} width={16} rounded="sm" animated={animated} />
            <Skeleton height={16} width="60%" animated={animated} />
            <Skeleton height={12} width={40} animated={animated} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-start gap-3 p-3">
          <Skeleton height={20} width={20} rounded="sm" animated={animated} />
          <div className="flex-1 space-y-2">
            <Skeleton height={18} width="80%" animated={animated} />
            <Skeleton height={14} width="100%" animated={animated} />
            <div className="flex items-center gap-3">
              <Skeleton height={12} width={60} animated={animated} />
              <Skeleton height={12} width={40} animated={animated} />
              <Skeleton height={12} width={50} animated={animated} />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Skeleton height={16} width={16} rounded="sm" animated={animated} />
            <Skeleton height={16} width={16} rounded="sm" animated={animated} />
          </div>
        </div>
      ))}
    </div>
  );
};

// Card Skeleton
const CardSkeleton: React.FC<{ showImage?: boolean; showMeta?: boolean; animated?: boolean }> = ({
  showImage = true,
  showMeta = true,
  animated = true
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      {showImage && (
        <Skeleton height={150} width="100%" rounded="md" animated={animated} />
      )}
      <div className="flex items-center gap-2">
        <Skeleton height={16} width={60} rounded="sm" animated={animated} />
        <Skeleton height={16} width={40} rounded="sm" animated={animated} />
      </div>
      <Skeleton height={20} width="90%" animated={animated} />
      <Skeleton height={16} width="100%" animated={animated} />
      <Skeleton height={16} width="75%" animated={animated} />
      {showMeta && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Skeleton height={24} width={24} rounded="full" animated={animated} />
            <div className="space-y-1">
              <Skeleton height={12} width={80} animated={animated} />
              <Skeleton height={10} width={60} animated={animated} />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Skeleton height={16} width={16} rounded="sm" animated={animated} />
            <Skeleton height={16} width={16} rounded="sm" animated={animated} />
            <Skeleton height={16} width={16} rounded="sm" animated={animated} />
          </div>
        </div>
      )}
    </div>
  );
};

// Banner Skeleton
const BannerSkeleton: React.FC<{ animated?: boolean }> = ({
  animated = true
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 space-y-4">
      <div className="text-center space-y-3">
        <Skeleton height={32} width="60%" animated={animated} className="mx-auto" />
        <Skeleton height={18} width="80%" animated={animated} className="mx-auto" />
        <Skeleton height={18} width="70%" animated={animated} className="mx-auto" />
      </div>
      <div className="flex justify-center gap-4 mt-6">
        <Skeleton height={40} width={120} rounded="md" animated={animated} />
        <Skeleton height={40} width={100} rounded="md" animated={animated} />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="text-center space-y-2">
          <Skeleton height={24} width="100%" animated={animated} />
          <Skeleton height={14} width="80%" animated={animated} className="mx-auto" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton height={24} width="100%" animated={animated} />
          <Skeleton height={14} width="80%" animated={animated} className="mx-auto" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton height={24} width="100%" animated={animated} />
          <Skeleton height={14} width="80%" animated={animated} className="mx-auto" />
        </div>
      </div>
    </div>
  );
};

// Search Skeleton
const SearchSkeleton: React.FC<{ animated?: boolean }> = ({ animated = true }) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton height={48} width="100%" rounded="lg" animated={animated} />
        <Skeleton height={48} width={100} rounded="lg" animated={animated} />
      </div>
      <div className="border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton height={16} width={16} rounded="sm" animated={animated} />
          <Skeleton height={16} width={120} animated={animated} />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <Skeleton height={20} width={20} rounded="sm" animated={animated} />
              <div className="flex-1 space-y-2">
                <Skeleton height={18} width="85%" animated={animated} />
                <Skeleton height={14} width="100%" animated={animated} />
                <div className="flex items-center gap-3">
                  <Skeleton height={16} width={60} rounded="sm" animated={animated} />
                  <Skeleton height={12} width={40} animated={animated} />
                  <Skeleton height={12} width={50} animated={animated} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sidebar Skeleton
const SidebarSkeleton: React.FC<{ animated?: boolean }> = ({ animated = true }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Skeleton height={24} width={120} animated={animated} />
        <Skeleton height={24} width={24} rounded="sm" animated={animated} />
      </div>
      <div className="p-4">
        <Skeleton height={40} width="100%" rounded="lg" animated={animated} />
      </div>
      <div className="space-y-2 px-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-3 p-2">
              <Skeleton height={20} width={20} rounded="sm" animated={animated} />
              <Skeleton height={16} width="70%" animated={animated} />
              <Skeleton height={16} width={24} rounded="sm" animated={animated} />
            </div>
            {i < 3 && (
              <div className="ml-8 space-y-1">
                <Skeleton height={14} width="60%" animated={animated} />
                <Skeleton height={14} width="55%" animated={animated} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Form Skeleton
const FormSkeleton: React.FC<{ rows?: number; animated?: boolean }> = ({
  rows = 4,
  animated = true
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton height={32} width="40%" animated={animated} />
        <Skeleton height={16} width="80%" animated={animated} />
      </div>
      <div className="space-y-4">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton height={16} width={100} animated={animated} />
            <Skeleton height={40} width="100%" rounded="md" animated={animated} />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton height={40} width={100} rounded="md" animated={animated} />
        <Skeleton height={40} width={80} rounded="md" animated={animated} />
      </div>
    </div>
  );
};

// Details Skeleton
const DetailsSkeleton: React.FC<{ animated?: boolean }> = ({ animated = true }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton height={20} width={80} rounded="sm" animated={animated} />
          <Skeleton height={20} width={60} rounded="sm" animated={animated} />
        </div>
        <Skeleton height={32} width="90%" animated={animated} />
        <div className="flex items-center gap-4">
          <Skeleton height={32} width={32} rounded="full" animated={animated} />
          <div className="space-y-1">
            <Skeleton height={16} width={120} animated={animated} />
            <Skeleton height={14} width={100} animated={animated} />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton height={200} width="100%" rounded="lg" animated={animated} />
        <Skeleton height={18} width="100%" animated={animated} />
        <Skeleton height={18} width="95%" animated={animated} />
        <Skeleton height={18} width="88%" animated={animated} />
        <Skeleton height={18} width="92%" animated={animated} />
      </div>
      <div className="border-t border-gray-200 pt-6">
        <div className="space-y-4">
          <Skeleton height={24} width={150} animated={animated} />
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
              <Skeleton height={32} width={32} rounded="full" animated={animated} />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton height={16} width={100} animated={animated} />
                  <Skeleton height={14} width={80} animated={animated} />
                </div>
                <Skeleton height={16} width="100%" animated={animated} />
                <Skeleton height={16} width="85%" animated={animated} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Grid Skeleton
const GridSkeleton: React.FC<{ count?: number; columns?: number; animated?: boolean }> = ({
  count = 6,
  columns = 3,
  animated = true
}) => {
  return (
    <div className={`grid gap-6 grid-cols-1 md:grid-cols-${columns}`}>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} animated={animated} />
      ))}
    </div>
  );
};

// Table Skeleton
const TableSkeleton: React.FC<{ rows?: number; columns?: number; animated?: boolean }> = ({
  rows = 5,
  columns = 4,
  animated = true
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex">
          {Array.from({ length: columns }, (_, i) => (
            <div key={i} className="flex-1 p-4">
              <Skeleton height={16} width="80%" animated={animated} />
            </div>
          ))}
        </div>
      </div>
      <div>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex border-b border-gray-200 last:border-b-0">
            {Array.from({ length: columns }, (_, j) => (
              <div key={j} className="flex-1 p-4">
                <Skeleton height={16} width="70%" animated={animated} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main HelpSkeleton Component
const HelpSkeleton: React.FC<HelpSkeletonProps> = ({
  type = 'article',
  count = 1,
  showAvatar = true,
  showImage = true,
  showMeta = true,
  variant = 'default',
  className,
  animated = true,
  rows = 4,
  columns = 3
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'article':
        return Array.from({ length: count }, (_, i) => (
          <ArticleSkeleton
            key={i}
            variant={variant}
            showAvatar={showAvatar}
            showMeta={showMeta}
            animated={animated}
          />
        ));
      case 'list':
        return <ListSkeleton count={count} variant={variant} animated={animated} />;
      case 'card':
        return Array.from({ length: count }, (_, i) => (
          <CardSkeleton
            key={i}
            showImage={showImage}
            showMeta={showMeta}
            animated={animated}
          />
        ));
      case 'banner':
        return <BannerSkeleton animated={animated} />;
      case 'search':
        return <SearchSkeleton animated={animated} />;
      case 'sidebar':
        return <SidebarSkeleton animated={animated} />;
      case 'form':
        return <FormSkeleton rows={rows} animated={animated} />;
      case 'details':
        return <DetailsSkeleton animated={animated} />;
      case 'grid':
        return <GridSkeleton count={count} columns={columns} animated={animated} />;
      case 'table':
        return <TableSkeleton rows={rows} columns={columns} animated={animated} />;
      default:
        return <ArticleSkeleton variant={variant} showAvatar={showAvatar} showMeta={showMeta} animated={animated} />;
    }
  };

  return (
    <div className={cn('animate-pulse', className)}>
      {renderSkeleton()}
    </div>
  );
};

export default HelpSkeleton;
export { Skeleton };
