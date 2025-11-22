'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhotoIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import OptimizedImage from './OptimizedImage';

export interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: 'blur' | 'skeleton' | 'color' | 'image';
  placeholderSrc?: string;
  placeholderColor?: string;
  threshold?: number;
  rootMargin?: string;
  fadeInDuration?: number;
  showLoadingSpinner?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onLoad?: () => void;
  onError?: (error: Event) => void;
  onIntersect?: () => void;
  priority?: boolean;
  blurDataURL?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = 'skeleton',
  placeholderSrc,
  placeholderColor = '#f3f4f6',
  threshold = 0.1,
  rootMargin = '50px',
  fadeInDuration = 0.3,
  showLoadingSpinner = true,
  enableRetry = true,
  maxRetries = 3,
  retryDelay = 1000,
  onLoad,
  onError,
  onIntersect,
  priority = false,
  blurDataURL,
}) => {
  const [isIntersecting, setIsIntersecting] = useState(priority);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  
  const imgRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create intersection observer
  useEffect(() => {
    if (priority) return; // Skip observer if priority is true
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            onIntersect?.();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current = observer;

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [threshold, rootMargin, onIntersect, priority]);

  // Update src when prop changes
  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback((error?: Event | string) => {
    setIsLoading(false);
    setHasError(true);
    
    // Call onError if provided
    if (onError && error instanceof Event) {
      onError(error);
    }
    
    // Retry logic
    if (enableRetry && retryCount < maxRetries) {
      retryTimeoutRef.current = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setHasError(false);
        setIsLoading(true);
        // Force reload by adding timestamp
        setCurrentSrc(`${src}?retry=${retryCount + 1}&t=${Date.now()}`);
      }, retryDelay * (retryCount + 1)); // Exponential backoff
    }
  }, [enableRetry, retryCount, maxRetries, retryDelay, src, onError]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    setHasError(false);
    setIsLoading(true);
    setCurrentSrc(`${src}?retry=manual&t=${Date.now()}`);
  }, [src]);

  const renderPlaceholder = useCallback(() => {
    if (placeholder === 'skeleton') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-full ${className}`}
          style={{ width, height }}
        />
      );
    }
    
    if (placeholder === 'blur' && (placeholderSrc || blurDataURL)) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
        >
          <OptimizedImage
            src={placeholderSrc || blurDataURL!}
            alt={alt}
            fill
            className="object-cover filter blur-sm"
            priority
          />
        </motion.div>
      );
    }
    
    if (placeholder === 'color') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center w-full h-full"
          style={{ backgroundColor: placeholderColor, width, height }}
        >
          <PhotoIcon className="w-12 h-12 text-gray-400" />
        </motion.div>
      );
    }
    
    if (placeholder === 'image' && placeholderSrc) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
        >
          <OptimizedImage
            src={placeholderSrc}
            alt={alt}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      );
    }
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 w-full h-full"
        style={{ width, height }}
      >
        <PhotoIcon className="w-12 h-12 text-gray-400" />
      </motion.div>
    );
  }, [placeholder, placeholderSrc, placeholderColor, blurDataURL, alt, className, width, height]);

  const renderLoadingSpinner = useCallback(() => {
    if (!showLoadingSpinner || !isLoading || !isIntersecting) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20"
      >
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </motion.div>
    );
  }, [showLoadingSpinner, isLoading, isIntersecting]);

  const renderError = useCallback(() => {
    if (!hasError) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 w-full h-full"
        style={{ width, height }}
      >
        <ExclamationCircleIcon className="w-12 h-12 text-gray-400 mb-2" />
        <span className="text-sm text-gray-500 mb-2">Failed to load image</span>
        {enableRetry && retryCount < maxRetries && (
          <button
            onClick={handleRetry}
            className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry ({retryCount}/{maxRetries})
          </button>
        )}
      </motion.div>
    );
  }, [hasError, width, height, enableRetry, retryCount, maxRetries, handleRetry]);



  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      data-width={width}
      data-height={height}
    >
      {/* Placeholder */}
      <AnimatePresence>
        {!isLoaded && renderPlaceholder()}
      </AnimatePresence>

      {/* Actual image */}
      {isIntersecting && !hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: fadeInDuration }}
          className="absolute inset-0"
        >
          <OptimizedImage
            src={currentSrc}
            alt={alt}
            fill
            className="object-cover"
            onLoad={handleLoad}
            onError={() => handleImageError()}
            priority={priority}
          />
        </motion.div>
      )}

      {/* Loading spinner */}
      <AnimatePresence>
        {renderLoadingSpinner()}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {renderError()}
      </AnimatePresence>

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
          <div>Intersecting: {isIntersecting ? 'Yes' : 'No'}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Loaded: {isLoaded ? 'Yes' : 'No'}</div>
          <div>Error: {hasError ? 'Yes' : 'No'}</div>
          <div>Retries: {retryCount}/{maxRetries}</div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;