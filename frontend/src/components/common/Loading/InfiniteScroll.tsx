'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export interface InfiniteScrollProps<T = unknown> {
  className?: string;
  items: T[];
  hasMore: boolean;
  loading: boolean;
  error?: string | null;
  threshold?: number;
  rootMargin?: string;
  reverse?: boolean;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  errorComponent?: React.ReactNode;
  pullToRefresh?: boolean;
  refreshThreshold?: number;
  onLoadMore: () => void;
  onRefresh?: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
}

const InfiniteScroll = <T,>({
  className = '',
  items,
  hasMore,
  loading,
  error,
  threshold = 0.1,
  rootMargin = '100px',
  reverse = false,
  loader,
  endMessage,
  errorComponent,
  pullToRefresh = false,
  refreshThreshold = 100,
  onLoadMore,
  onRefresh,
  renderItem,
  getItemKey,
}: InfiniteScrollProps<T>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  
  const observerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  // Setup intersection observer for load more
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !loading && !error) {
            onLoadMore();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    intersectionObserverRef.current = observer;

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, [hasMore, loading, error, threshold, rootMargin, onLoadMore]);

  // Re-observe when the trigger element changes
  useEffect(() => {
    if (intersectionObserverRef.current && observerRef.current) {
      intersectionObserverRef.current.observe(observerRef.current);
    }
  }, [items.length]);

  // Pull to refresh handlers
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (!pullToRefresh || !onRefresh) return;
    
    const touch = event.touches[0];
    setTouchStartY(touch.clientY);
  }, [pullToRefresh, onRefresh]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!pullToRefresh || !onRefresh || isRefreshing) return;
    
    const touch = event.touches[0];
    const scrollTop = containerRef.current?.scrollTop || 0;
    
    if (scrollTop === 0) {
      const pullDistance = Math.max(0, touch.clientY - touchStartY);
      
      if (pullDistance > 0) {
        event.preventDefault();
        setPullDistance(Math.min(pullDistance, refreshThreshold * 2));
        setIsPulling(pullDistance > refreshThreshold);
      }
    }
  }, [pullToRefresh, onRefresh, isRefreshing, touchStartY, refreshThreshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!pullToRefresh || !onRefresh || isRefreshing) return;
    
    if (isPulling && pullDistance > refreshThreshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setIsPulling(false);
  }, [pullToRefresh, onRefresh, isRefreshing, isPulling, pullDistance, refreshThreshold]);

  const renderLoader = () => {
    if (loader) return loader;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex justify-center items-center p-8"
      >
        <motion.div
          className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Loading more...
        </span>
      </motion.div>
    );
  };

  const renderEndMessage = () => {
    if (endMessage) return endMessage;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center items-center p-8 text-gray-500 dark:text-gray-400"
      >
        <CheckCircleIcon className="w-6 h-6 mr-2" />
        <span>No more items to load</span>
      </motion.div>
    );
  };

  const renderError = () => {
    if (errorComponent) return errorComponent;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 text-red-500"
      >
        <ExclamationCircleIcon className="w-8 h-8 mb-2" />
        <p className="text-center mb-4">{error}</p>
        <button
          onClick={onLoadMore}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    );
  };

  const renderPullToRefresh = () => {
    if (!pullToRefresh || !onRefresh) return null;
    
    const progress = Math.min(pullDistance / refreshThreshold, 1);
    const shouldTrigger = progress >= 1;
    
    return (
      <motion.div
        className="absolute top-0 left-0 right-0 flex justify-center items-center z-10"
        style={{
          height: Math.min(pullDistance, refreshThreshold),
          backgroundColor: shouldTrigger ? '#10b981' : '#3b82f6',
        }}
        animate={{
          opacity: pullDistance > 0 ? 1 : 0,
        }}
      >
        <motion.div
          animate={{
            rotate: isRefreshing ? 360 : progress * 360,
            scale: progress,
          }}
          transition={{
            rotate: isRefreshing ? {
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            } : {
              duration: 0.3
            },
            scale: { duration: 0.3 }
          }}
        >
          <ArrowPathIcon className="w-6 h-6 text-white" />
        </motion.div>
        
        <span className="ml-2 text-white text-sm">
          {isRefreshing ? 'Refreshing...' : shouldTrigger ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </motion.div>
    );
  };

  const itemsToRender = reverse ? [...items].reverse() : items;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {renderPullToRefresh()}
      
      <motion.div
        className="space-y-2"
        style={{
          paddingTop: pullToRefresh && pullDistance > 0 ? pullDistance : 0,
        }}
        animate={{
          paddingTop: isRefreshing ? refreshThreshold : pullDistance,
        }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="popLayout">
          {itemsToRender.map((item, index) => {
            const key = getItemKey ? getItemKey(item, index) : index;
            const actualIndex = reverse ? items.length - 1 - index : index;
            
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: reverse ? -20 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reverse ? -20 : 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
              >
                {renderItem(item, actualIndex)}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Load more trigger */}
        {!reverse && (
          <div ref={observerRef} className="h-1">
            <AnimatePresence>
              {loading && renderLoader()}
              {error && renderError()}
              {!hasMore && !loading && !error && items.length > 0 && renderEndMessage()}
            </AnimatePresence>
          </div>
        )}
        
        {/* Reverse load more trigger */}
        {reverse && (
          <div className="h-1">
            <AnimatePresence>
              {loading && renderLoader()}
              {error && renderError()}
              {!hasMore && !loading && !error && items.length > 0 && renderEndMessage()}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InfiniteScroll;