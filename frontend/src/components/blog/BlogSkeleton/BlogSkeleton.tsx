'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Types
export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animate?: boolean;
}

export interface BlogSkeletonProps {
  variant?: 'card' | 'list' | 'grid' | 'post' | 'sidebar' | 'comment' | 'author' | 'minimal';
  count?: number;
  className?: string;
  animate?: boolean;
}

// Base skeleton component
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  rounded = true,
  animate = true,
  ...props
}) => {
  const roundedClasses = {
    false: '',
    true: 'rounded',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  // Convert dimensions to className-compatible values
  const getWidthClass = (w: string | number | undefined) => {
    if (!w) return '';
    if (typeof w === 'number') return w <= 100 ? `w-${w}` : 'w-full';
    if (w.includes('%')) return w === '100%' ? 'w-full' : w === '75%' ? 'w-3/4' : w === '50%' ? 'w-1/2' : w === '25%' ? 'w-1/4' : '';
    return '';
  };

  const getHeightClass = (h: string | number | undefined) => {
    if (!h) return '';
    if (typeof h === 'number') {
      if (h <= 4) return `h-${h}`;
      if (h <= 64) return `h-${h}`;
      return 'h-64';
    }
    return '';
  };

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        animate && 'animate-pulse',
        roundedClasses[rounded.toString() as keyof typeof roundedClasses],
        getWidthClass(width),
        getHeightClass(height),
        className
      )}
      {...props}
    />
  );
};

// Skeleton components for different blog elements
export const BlogCardSkeleton: React.FC<{ animate?: boolean; variant?: 'default' | 'compact' | 'featured' }> = ({ 
  animate = true, 
  variant = 'default' 
}) => {
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  return (
    <div className={cn(
      'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
      isFeatured ? 'p-6' : 'p-4',
      'bg-white dark:bg-gray-900'
    )}>
      {/* Image skeleton */}
      <Skeleton
        className={cn(
          'w-full',
          isCompact ? 'h-32' : isFeatured ? 'h-48' : 'h-40',
          'mb-4'
        )}
        animate={animate}
        rounded="md"
      />

      {/* Content skeleton */}
      <div className="space-y-3">
        {/* Category badge */}
        <Skeleton 
          width={80} 
          height={20} 
          animate={animate} 
          rounded="full" 
        />

        {/* Title */}
        <div className="space-y-2">
          <Skeleton 
            height={isCompact ? 16 : isFeatured ? 24 : 20} 
            animate={animate} 
          />
          {!isCompact && (
            <Skeleton 
              width="75%" 
              height={isCompact ? 16 : isFeatured ? 24 : 20} 
              animate={animate} 
            />
          )}
        </div>

        {/* Excerpt */}
        {!isCompact && (
          <div className="space-y-2">
            <Skeleton height={14} animate={animate} />
            <Skeleton width="90%" height={14} animate={animate} />
            <Skeleton width="60%" height={14} animate={animate} />
          </div>
        )}

        {/* Tags */}
        <div className="flex gap-2">
          <Skeleton width={60} height={16} animate={animate} rounded="full" />
          <Skeleton width={70} height={16} animate={animate} rounded="full" />
          <Skeleton width={50} height={16} animate={animate} rounded="full" />
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Skeleton width={24} height={24} animate={animate} rounded="full" />
            <Skeleton width={80} height={14} animate={animate} />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton width={60} height={14} animate={animate} />
            <Skeleton width={40} height={14} animate={animate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const BlogListSkeleton: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <div className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
    {/* Image */}
    <Skeleton 
      width={120} 
      height={80} 
      animate={animate} 
      rounded="md" 
      className="flex-shrink-0" 
    />

    {/* Content */}
    <div className="flex-1 space-y-2">
      {/* Category */}
      <Skeleton width={60} height={16} animate={animate} rounded="full" />
      
      {/* Title */}
      <Skeleton height={18} animate={animate} />
      <Skeleton width="80%" height={18} animate={animate} />
      
      {/* Excerpt */}
      <div className="space-y-1">
        <Skeleton height={14} animate={animate} />
        <Skeleton width="70%" height={14} animate={animate} />
      </div>
      
      {/* Meta */}
      <div className="flex items-center gap-4 pt-1">
        <div className="flex items-center gap-2">
          <Skeleton width={20} height={20} animate={animate} rounded="full" />
          <Skeleton width={60} height={12} animate={animate} />
        </div>
        <Skeleton width={40} height={12} animate={animate} />
        <Skeleton width={50} height={12} animate={animate} />
      </div>
    </div>
  </div>
);

export const BlogPostSkeleton: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <article className="max-w-4xl mx-auto">
    {/* Header */}
    <header className="mb-8">
      {/* Category */}
      <Skeleton width={100} height={20} animate={animate} rounded="full" className="mb-4" />
      
      {/* Title */}
      <div className="space-y-3 mb-6">
        <Skeleton height={32} animate={animate} />
        <Skeleton width="85%" height={32} animate={animate} />
        <Skeleton width="60%" height={32} animate={animate} />
      </div>
      
      {/* Meta */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-3">
          <Skeleton width={40} height={40} animate={animate} rounded="full" />
          <div className="space-y-1">
            <Skeleton width={120} height={16} animate={animate} />
            <Skeleton width={80} height={12} animate={animate} />
          </div>
        </div>
        <Skeleton width={80} height={14} animate={animate} />
        <Skeleton width={60} height={14} animate={animate} />
      </div>
      
      {/* Tags */}
      <div className="flex gap-2 mb-8">
        <Skeleton width={60} height={24} animate={animate} rounded="full" />
        <Skeleton width={80} height={24} animate={animate} rounded="full" />
        <Skeleton width={70} height={24} animate={animate} rounded="full" />
        <Skeleton width={50} height={24} animate={animate} rounded="full" />
      </div>
      
      {/* Featured image */}
      <Skeleton height={300} animate={animate} rounded="lg" className="mb-8" />
    </header>

    {/* Content */}
    <div className="prose prose-gray dark:prose-invert max-w-none">
      {/* Paragraphs */}
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="mb-6 space-y-2">
          <Skeleton height={18} animate={animate} />
          <Skeleton height={18} animate={animate} />
          <Skeleton width="95%" height={18} animate={animate} />
          <Skeleton width="80%" height={18} animate={animate} />
        </div>
      ))}
      
      {/* Quote block */}
      <div className="my-8 p-4 border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <Skeleton height={20} animate={animate} className="mb-2" />
        <Skeleton width="90%" height={20} animate={animate} />
      </div>
      
      {/* More paragraphs */}
      {Array.from({ length: 4 }, (_, i) => (
        <div key={`para-${i}`} className="mb-6 space-y-2">
          <Skeleton height={18} animate={animate} />
          <Skeleton height={18} animate={animate} />
          <Skeleton width="75%" height={18} animate={animate} />
        </div>
      ))}
    </div>
  </article>
);

export const BlogSidebarSkeleton: React.FC<{ animate?: boolean }> = ({ animate = true }) => (
  <aside className="space-y-6">
    {/* Search */}
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
      <Skeleton width={60} height={20} animate={animate} className="mb-3" />
      <Skeleton height={36} animate={animate} rounded="md" />
    </div>

    {/* Categories */}
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
      <Skeleton width={80} height={20} animate={animate} className="mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton width={100} height={16} animate={animate} />
            <Skeleton width={20} height={16} animate={animate} rounded="full" />
          </div>
        ))}
      </div>
    </div>

    {/* Popular posts */}
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
      <Skeleton width={100} height={20} animate={animate} className="mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton width={60} height={60} animate={animate} rounded="md" />
            <div className="flex-1 space-y-2">
              <Skeleton height={14} animate={animate} />
              <Skeleton width="80%" height={14} animate={animate} />
              <Skeleton width={80} height={12} animate={animate} />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Newsletter */}
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
      <Skeleton width={90} height={20} animate={animate} className="mb-3" />
      <Skeleton height={14} animate={animate} className="mb-4" />
      <Skeleton height={36} animate={animate} rounded="md" className="mb-3" />
      <Skeleton height={32} animate={animate} rounded="md" />
    </div>
  </aside>
);

export const CommentSkeleton: React.FC<{ animate?: boolean; nested?: boolean }> = ({ 
  animate = true, 
  nested = false 
}) => (
  <div className={cn('flex gap-3', nested && 'ml-12')}>
    <Skeleton width={40} height={40} animate={animate} rounded="full" className="flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton width={80} height={14} animate={animate} />
        <Skeleton width={60} height={12} animate={animate} />
      </div>
      <div className="space-y-1">
        <Skeleton height={14} animate={animate} />
        <Skeleton width="90%" height={14} animate={animate} />
        <Skeleton width="70%" height={14} animate={animate} />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton width={40} height={12} animate={animate} />
        <Skeleton width={30} height={12} animate={animate} />
        <Skeleton width={50} height={12} animate={animate} />
      </div>
    </div>
  </div>
);

export const AuthorSkeleton: React.FC<{ animate?: boolean; layout?: 'horizontal' | 'vertical' }> = ({ 
  animate = true, 
  layout = 'horizontal' 
}) => {
  if (layout === 'vertical') {
    return (
      <div className="text-center space-y-3">
        <Skeleton width={80} height={80} animate={animate} rounded="full" className="mx-auto" />
        <Skeleton width={120} height={18} animate={animate} className="mx-auto" />
        <div className="space-y-1">
          <Skeleton height={14} animate={animate} />
          <Skeleton width="80%" height={14} animate={animate} className="mx-auto" />
        </div>
        <div className="flex justify-center gap-2">
          <Skeleton width={60} height={28} animate={animate} rounded="md" />
          <Skeleton width={60} height={28} animate={animate} rounded="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Skeleton width={60} height={60} animate={animate} rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton width={140} height={18} animate={animate} />
        <div className="space-y-1">
          <Skeleton height={14} animate={animate} />
          <Skeleton width="75%" height={14} animate={animate} />
        </div>
        <div className="flex gap-2">
          <Skeleton width={50} height={20} animate={animate} rounded="full" />
          <Skeleton width={60} height={20} animate={animate} rounded="full" />
        </div>
      </div>
    </div>
  );
};

// Main BlogSkeleton component
export const BlogSkeleton: React.FC<BlogSkeletonProps> = ({
  variant = 'card',
  count = 1,
  className,
  animate = true
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return <BlogCardSkeleton animate={animate} />;
      case 'list':
        return <BlogListSkeleton animate={animate} />;
      case 'post':
        return <BlogPostSkeleton animate={animate} />;
      case 'sidebar':
        return <BlogSidebarSkeleton animate={animate} />;
      case 'comment':
        return <CommentSkeleton animate={animate} />;
      case 'author':
        return <AuthorSkeleton animate={animate} />;
      case 'minimal':
        return (
          <div className="space-y-2">
            <Skeleton height={20} animate={animate} />
            <Skeleton width="75%" height={16} animate={animate} />
            <Skeleton width="50%" height={14} animate={animate} />
          </div>
        );
      case 'grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }, (_, i) => (
              <BlogCardSkeleton key={i} animate={animate} variant="compact" />
            ))}
          </div>
        );
      default:
        return <BlogCardSkeleton animate={animate} />;
    }
  };

  if (variant === 'grid' || variant === 'post' || variant === 'sidebar') {
    return <div className={className}>{renderSkeleton()}</div>;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

// Utility components for common skeleton patterns
export const BlogLoadingSkeleton: React.FC<{ 
  layout?: 'grid' | 'list'; 
  count?: number; 
  className?: string 
}> = ({ 
  layout = 'grid', 
  count = 6, 
  className 
}) => (
  <BlogSkeleton
    variant={layout}
    count={count}
    className={className}
  />
);

export const BlogPageSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('grid grid-cols-1 lg:grid-cols-4 gap-8', className)}>
    <div className="lg:col-span-3">
      <BlogSkeleton variant="post" />
    </div>
    <div className="lg:col-span-1">
      <BlogSkeleton variant="sidebar" />
    </div>
  </div>
);

export const CommentsSkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 5, 
  className 
}) => (
  <div className={cn('space-y-6', className)}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="space-y-4">
        <CommentSkeleton />
        {i % 2 === 0 && <CommentSkeleton nested />}
      </div>
    ))}
  </div>
);

export default BlogSkeleton;
