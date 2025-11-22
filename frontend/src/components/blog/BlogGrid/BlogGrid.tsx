/**
 * BlogGrid Component - Vardhman Mills Frontend
 * 
 * Responsive grid layout for displaying blog posts with
 * masonry, infinite scroll, and customizable layouts.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { BlogCard } from '../BlogCard/BlogCard';
import type { BlogPost } from '../BlogCard/BlogCard';

// Types
export interface BlogGridProps {
  /** Array of blog posts */
  posts: BlogPost[];
  /** Grid layout type */
  layout?: 'grid' | 'masonry' | 'list' | 'compact';
  /** Number of columns (for grid layout) */
  columns?: 1 | 2 | 3 | 4 | 6;
  /** Gap between items */
  gap?: 'sm' | 'md' | 'lg';
  /** Blog card variant */
  cardVariant?: 'default' | 'compact' | 'featured' | 'minimal';
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
  /** Enable infinite scroll */
  infiniteScroll?: boolean;
  /** Callback when more posts are needed */
  onLoadMore?: () => void;
  /** Whether there are more posts to load */
  hasNextPage?: boolean;
  /** Loading more posts state */
  loadingMore?: boolean;
  /** Enable virtual scrolling for large lists */
  virtualScroll?: boolean;
  /** Item height for virtual scrolling */
  itemHeight?: number;
  /** Container height for virtual scrolling */
  containerHeight?: number;
  /** Custom empty state */
  emptyState?: React.ReactNode;
  /** Custom loading state */
  loadingState?: React.ReactNode;
  /** Custom error state */
  errorState?: React.ReactNode;
  /** Enable animations */
  animated?: boolean;
  /** Animation delay between items */
  animationDelay?: number;
  /** Custom CSS classes */
  className?: string;
  /** Callback when a post is clicked */
  onPostClick?: (post: BlogPost) => void;
  /** Show layout switcher */
  showLayoutSwitcher?: boolean;
  /** Callback when layout changes */
  onLayoutChange?: (layout: BlogGridProps['layout']) => void;
  /** Enable post actions */
  enableActions?: boolean;
  /** Current user for actions */
  currentUser?: { id: string; name: string; email: string } | null;
  /** Callback for post actions */
  onPostAction?: (action: string, post: BlogPost) => void;
}

/**
 * BlogGrid Component
 * 
 * Flexible grid component for displaying blog posts with
 * multiple layout options and advanced features.
 */
export const BlogGrid: React.FC<BlogGridProps> = ({
  posts,
  layout = 'grid',
  columns = 3,
  gap = 'md',
  cardVariant = 'default',
  loading = false,
  error = null,
  infiniteScroll = false,
  onLoadMore,
  hasNextPage = false,
  loadingMore = false,
  virtualScroll = false,
  itemHeight = 400,
  containerHeight = 600,
  emptyState,
  loadingState,
  errorState,
  animated = true,
  animationDelay = 0.1,
  className = '',
  onPostClick,
  showLayoutSwitcher = false,
  onLayoutChange,
  enableActions = true, // eslint-disable-line @typescript-eslint/no-unused-vars
  currentUser, // eslint-disable-line @typescript-eslint/no-unused-vars
  onPostAction // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  const [currentLayout, setCurrentLayout] = useState(layout);
  const [visiblePosts, setVisiblePosts] = useState<BlogPost[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Update visible posts when posts change
  useEffect(() => {
    if (virtualScroll && containerHeight && itemHeight) {
      // Calculate visible items based on scroll position
      setVisiblePosts(posts.slice(0, Math.ceil(containerHeight / itemHeight) + 5));
    } else {
      setVisiblePosts(posts);
    }
  }, [posts, virtualScroll, containerHeight, itemHeight]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!infiniteScroll || !onLoadMore || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [infiniteScroll, onLoadMore, hasNextPage, loadingMore]);

  /**
   * Handle layout change
   */
  const handleLayoutChange = (newLayout: BlogGridProps['layout']) => {
    if (newLayout) {
      setCurrentLayout(newLayout);
      onLayoutChange?.(newLayout);
    }
  };

  /**
   * Get grid classes based on layout and columns
   */
  const getGridClasses = () => {
    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6'
    };

    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
    };

    switch (currentLayout) {
      case 'list':
        return `grid grid-cols-1 ${gapClasses[gap]}`;
      case 'compact':
        return `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gapClasses[gap]}`;
      case 'masonry':
        return `columns-1 md:columns-2 lg:columns-3 xl:columns-${columns} ${gapClasses[gap]} space-y-${gap === 'sm' ? '2' : gap === 'md' ? '4' : '6'}`;
      default: // grid
        return `grid ${columnClasses[columns]} ${gapClasses[gap]}`;
    }
  };

  /**
   * Get card variant based on layout
   */
  const getCardVariant = () => {
    switch (currentLayout) {
      case 'list':
        return 'default';
      case 'compact':
        return 'compact';
      case 'masonry':
        return 'minimal';
      default:
        return cardVariant;
    }
  };

  /**
   * Render layout switcher
   */
  const renderLayoutSwitcher = () => {
    if (!showLayoutSwitcher) return null;

    const layouts = [
      { key: 'grid', icon: Grid, label: 'Grid' },
      { key: 'list', icon: List, label: 'List' },
      { key: 'masonry', icon: Grid, label: 'Masonry' }
    ];

    return (
      <div className="flex items-center space-x-2 mb-6">
        <span className="text-sm text-gray-500">Layout:</span>
        {layouts.map(({ key, icon: Icon, label }) => (
          <Button
            key={key}
            variant={currentLayout === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLayoutChange(key as BlogGridProps['layout'])}
            className="flex items-center space-x-1"
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </Button>
        ))}
      </div>
    );
  };

  /**
   * Render loading skeleton
   */
  const renderLoadingSkeleton = () => {
    if (loadingState) return loadingState;

    const skeletonCount = columns * 2;
    const skeletons = Array.from({ length: skeletonCount }, (_, index) => (
      <div key={index} className="space-y-3">
        <Skeleton className="w-full h-48 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
    ));

    return (
      <div className={getGridClasses()}>
        {skeletons}
      </div>
    );
  };

  /**
   * Render error state
   */
  const renderErrorState = () => {
    if (errorState) return errorState;

    return (
      <Alert variant="destructive" className="text-center py-8">
        <AlertCircle className="w-6 h-6 mx-auto mb-2" />
        <h3 className="text-lg font-medium mb-2">Error Loading Posts</h3>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="mx-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </Alert>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    if (emptyState) return emptyState;

    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Grid className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Found</h3>
        <p className="text-gray-500">There are no blog posts to display at the moment.</p>
      </div>
    );
  };

  /**
   * Render load more button
   */
  const renderLoadMore = () => {
    if (!infiniteScroll && hasNextPage && onLoadMore) {
      return (
        <div className="flex justify-center mt-8">
          <Button
            onClick={onLoadMore}
            disabled={loadingMore}
            loading={loadingMore}
            size="lg"
          >
            {loadingMore ? 'Loading...' : 'Load More Posts'}
          </Button>
        </div>
      );
    }

    if (infiniteScroll && hasNextPage) {
      return (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {loadingMore && (
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more posts...</span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  /**
   * Render blog posts
   */
  const renderPosts = () => {
    if (currentLayout === 'masonry') {
      return (
        <div className={getGridClasses()}>
          {visiblePosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={animated ? { opacity: 0, y: 20 } : undefined}
              animate={animated ? { opacity: 1, y: 0 } : undefined}
              transition={animated ? { delay: index * animationDelay } : undefined}
              className="break-inside-avoid mb-4"
            >
              <BlogCard
                post={post}
                variant={getCardVariant()}
                onClick={() => onPostClick?.(post)}
              />
            </motion.div>
          ))}
        </div>
      );
    }

    return (
      <div className={getGridClasses()}>
        {visiblePosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={animated ? { opacity: 0, y: 20 } : undefined}
            animate={animated ? { opacity: 1, y: 0 } : undefined}
            transition={animated ? { delay: index * animationDelay } : undefined}
          >
            <BlogCard
              post={post}
              variant={getCardVariant()}
              onClick={() => onPostClick?.(post)}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  // Handle loading state
  if (loading) {
    return (
      <div className={className}>
        {renderLayoutSwitcher()}
        {renderLoadingSkeleton()}
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className={className}>
        {renderLayoutSwitcher()}
        {renderErrorState()}
      </div>
    );
  }

  // Handle empty state
  if (posts.length === 0) {
    return (
      <div className={className}>
        {renderLayoutSwitcher()}
        {renderEmptyState()}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      {renderLayoutSwitcher()}
      {renderPosts()}
      {renderLoadMore()}
    </div>
  );
};

/**
 * Specialized grid components
 */

/**
 * Featured posts grid
 */
export const FeaturedPostsGrid: React.FC<Omit<BlogGridProps, 'cardVariant'>> = (props) => (
  <BlogGrid {...props} cardVariant="featured" />
);

/**
 * Compact posts grid for sidebars
 */
export const CompactPostsGrid: React.FC<Omit<BlogGridProps, 'layout' | 'cardVariant' | 'columns'>> = (props) => (
  <BlogGrid {...props} layout="compact" cardVariant="compact" columns={1} />
);

/**
 * Masonry layout grid
 */
export const MasonryGrid: React.FC<Omit<BlogGridProps, 'layout'>> = (props) => (
  <BlogGrid {...props} layout="masonry" />
);

/**
 * List layout grid
 */
export const ListGrid: React.FC<Omit<BlogGridProps, 'layout' | 'cardVariant'>> = (props) => (
  <BlogGrid {...props} layout="list" cardVariant="default" />
);

export default BlogGrid;
