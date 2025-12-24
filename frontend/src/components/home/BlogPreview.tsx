'use client';

/**
 * BlogPreview Component
 * 
 * Homepage blog preview carousel matching FeaturedProducts carousel UI.
 * Full blog functionality available on dedicated /blog page.
 * 
 * @component
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, PanInfo } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES
// ============================================================================

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
}

interface BlogPreviewProps {
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DRAG_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 500;

const DEFAULT_ITEMS_PER_VIEW = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
};

// ============================================================================
// API
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1';

// ============================================================================
// BLOG CARD COMPONENT
// ============================================================================

interface BlogCardProps {
  post: BlogPost;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onMouseEnter, onMouseLeave }) => {
  const formattedDate = new Date(post.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="group h-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-2">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
          <div className="absolute inset-0 flex items-center justify-center text-blue-400/30">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
            </svg>
          </div>
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-sm">
              {post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          {/* Date */}
          <span className="text-sm text-gray-500">{formattedDate}</span>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 text-sm line-clamp-2">
            {post.excerpt}
          </p>

          {/* View Post Link */}
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors group/link pt-2"
          >
            Read Full Post
            <ArrowRightIcon className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const BlogPreview: React.FC<BlogPreviewProps> = ({ className }) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentItemsPerView, setCurrentItemsPerView] = useState(DEFAULT_ITEMS_PER_VIEW.desktop);

  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayInterval = 5000;

  // ============================================================================
  // FETCH BLOG POSTS
  // ============================================================================

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/blog/posts/featured?limit=6`);

        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }

        const data = await response.json();

        // Map API response to BlogPost interface
        const posts: BlogPost[] = (data.data?.posts || data.posts || data.data || []).map((post: any) => ({
          id: post._id || post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || post.summary || (post.content?.substring(0, 150) + '...') || '',
          image: post.featuredImage || post.image || post.coverImage || '',
          category: post.category?.name || post.category || 'General',
          date: post.publishedAt || post.createdAt || post.date,
        }));

        setBlogPosts(posts);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load blog posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // ============================================================================
  // RESPONSIVE ITEMS PER VIEW
  // ============================================================================

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCurrentItemsPerView(DEFAULT_ITEMS_PER_VIEW.mobile);
      } else if (width < 1024) {
        setCurrentItemsPerView(DEFAULT_ITEMS_PER_VIEW.tablet);
      } else {
        setCurrentItemsPerView(DEFAULT_ITEMS_PER_VIEW.desktop);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totalSlides = useMemo(() => {
    return Math.ceil(blogPosts.length / currentItemsPerView);
  }, [blogPosts.length, currentItemsPerView]);

  const canGoNext = useMemo(() => {
    return currentIndex < totalSlides - 1 || true; // infinite loop
  }, [currentIndex, totalSlides]);

  const canGoPrev = useMemo(() => {
    return currentIndex > 0 || true; // infinite loop
  }, [currentIndex]);

  // ============================================================================
  // AUTO PLAY
  // ============================================================================

  const startAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    autoPlayTimerRef.current = setInterval(() => {
      if (isPlaying && !isHovered && !isPausedByUser) {
        setCurrentIndex((prev) => {
          const nextIndex = prev + 1;
          return nextIndex >= totalSlides ? 0 : nextIndex;
        });
      }
    }, autoPlayInterval);
  }, [isPlaying, isHovered, isPausedByUser, totalSlides]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPlaying && !isHovered && !isPausedByUser) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }

    return () => stopAutoPlay();
  }, [isPlaying, isHovered, isPausedByUser, startAutoPlay, stopAutoPlay]);

  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================

  const goToSlide = useCallback((index: number) => {
    const normalizedIndex = Math.max(0, Math.min(index, totalSlides - 1));
    setCurrentIndex(normalizedIndex);
  }, [totalSlides]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      return nextIndex >= totalSlides ? 0 : nextIndex;
    });
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const prevIndex = prev - 1;
      return prevIndex < 0 ? totalSlides - 1 : prevIndex;
    });
  }, [totalSlides]);

  const togglePlayPause = useCallback(() => {
    setIsPausedByUser((prev) => !prev);
    setIsPlaying((prev) => !prev);
  }, []);

  // ============================================================================
  // DRAG HANDLERS
  // ============================================================================

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    stopAutoPlay();
  }, [stopAutoPlay]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);

      const offset = info.offset.x;
      const velocity = info.velocity.x;

      if (Math.abs(offset) > DRAG_THRESHOLD || Math.abs(velocity) > SWIPE_VELOCITY_THRESHOLD) {
        if (offset > 0) {
          goToPrev();
        } else {
          goToNext();
        }
      }

      if (!isPausedByUser) {
        startAutoPlay();
      }
    },
    [goToNext, goToPrev, isPausedByUser, startAutoPlay]
  );

  // ============================================================================
  // CARD HOVER HANDLERS
  // ============================================================================

  const handleCardMouseEnter = useCallback(() => {
    setIsHovered(true);
    setIsPlaying(false);
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (!isPausedByUser) {
      setIsPlaying(true);
    }
  }, [isPausedByUser]);

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, togglePlayPause]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const translateX = -(currentIndex * 100);
  const gap = 24;

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('relative', className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-2xl aspect-[16/10]" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-5 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('relative text-center py-12', className)}>
        <p className="text-gray-500">Unable to load blog posts. Please try again later.</p>
      </div>
    );
  }

  // Empty state
  if (blogPosts.length === 0) {
    return (
      <div className={cn('relative text-center py-12', className)}>
        <p className="text-gray-500">No blog posts to display</p>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} ref={carouselRef}>
      {/* Main Carousel Wrapper */}
      <div className="overflow-hidden py-4">
        <motion.div
          className="flex"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.9}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          animate={{
            x: `${translateX}%`,
          }}
          transition={{
            type: 'tween',
            ease: [0.25, 0.1, 0.25, 1],
            duration: 0.5,
          }}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {blogPosts.map((post) => {
            const widthPercent = 100 / currentItemsPerView;
            const gapHalf = gap / 2;
            const itemStyle = {
              width: `${widthPercent}%`,
              paddingLeft: `${gapHalf}px`,
              paddingRight: `${gapHalf}px`,
            };
            return (
              <div
                key={post.id}
                className="flex-shrink-0"
                style={itemStyle}
              >
                <BlogCard
                  post={post}
                  onMouseEnter={handleCardMouseEnter}
                  onMouseLeave={handleCardMouseLeave}
                />
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Controls Bar - Bottom (matching ProductCarousel layout) */}
      {blogPosts.length > 0 && (
        <div className="relative flex items-center justify-end gap-6 mt-6">
          {/* Pagination Dots & Play/Pause (Center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="w-8 h-8 p-0 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label={!isPlaying ? 'Play auto-scroll' : 'Pause auto-scroll'}
            >
              {!isPlaying || isPausedByUser ? (
                <PlayIcon className="w-4 h-4" />
              ) : (
                <PauseIcon className="w-4 h-4" />
              )}
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {[...Array(totalSlides)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    'transition-all duration-200',
                    'rounded-full',
                    currentIndex === index
                      ? 'w-8 h-2 bg-primary-600'
                      : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Navigation Arrows (Right) */}
          <div className="flex items-center gap-3 z-10">
            <button
              onClick={goToPrev}
              disabled={!canGoPrev}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                'border border-gray-200 shadow-sm',
                'hover:border-primary-500 hover:text-primary-600 hover:shadow-md',
                'transition-all duration-200',
                canGoPrev
                  ? 'text-gray-700 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed opacity-50'
              )}
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                'border border-gray-200 shadow-sm',
                'hover:border-primary-500 hover:text-primary-600 hover:shadow-md',
                'transition-all duration-200',
                canGoNext
                  ? 'text-gray-700 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed opacity-50'
              )}
              aria-label="Next slide"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Accessibility */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Showing slide {currentIndex + 1} of {totalSlides}
      </div>
    </div>
  );
};

export default BlogPreview;
