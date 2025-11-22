'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  PhotoIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  loading?: 'lazy' | 'eager';
  unoptimized?: boolean;
  showFallback?: boolean;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  onLoadingComplete?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  objectFit = 'cover',
  objectPosition = 'center',
  loading = 'lazy',
  unoptimized = false,
  showFallback = true,
  fallbackSrc,
  onLoad,
  onError,
  onLoadingComplete,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback image if provided
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    }
    
    onError?.();
  }, [fallbackSrc, imageSrc, onError]);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
    onLoadingComplete?.();
  }, [onLoadingComplete]);

  // Generate blur data URL if not provided
  const generateBlurDataURL = (color = '#f3f4f6') => {
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
      </svg>`
    )}`;
  };

  const getBlurDataURL = () => {
    if (blurDataURL) return blurDataURL;
    if (placeholder === 'blur') return generateBlurDataURL();
    return undefined;
  };

  const imageVariants = {
    loading: {
      opacity: 0,
      scale: 1.05,
    },
    loaded: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
  };

  const renderError = () => {
    if (!showFallback) return null;

    return (
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
        <div className="text-center p-4">
          <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-medium">Failed to load image</p>
          <p className="text-xs mt-1 opacity-75">{alt}</p>
        </div>
      </div>
    );
  };

  const renderLoading = () => {
    return (
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 animate-pulse">
        <div className="text-center p-4">
          <PhotoIcon className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
          <div className="w-16 h-2 bg-gray-300 dark:bg-gray-600 rounded mx-auto" />
        </div>
      </div>
    );
  };

  if (hasError && (!fallbackSrc || imageSrc === fallbackSrc)) {
    return (
      <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
        {renderError()}
      </div>
    );
  }

  const imageProps = {
    src: imageSrc,
    alt,
    priority,
    quality,
    placeholder,
    blurDataURL: getBlurDataURL(),
    sizes,
    loading,
    unoptimized,
    onLoad: handleLoad,
    onError: handleError,
    onLoadingComplete: handleLoadingComplete,
    className: `
      transition-all duration-300
      ${objectFit === 'contain' ? 'object-contain' : ''}
      ${objectFit === 'cover' ? 'object-cover' : ''}
      ${objectFit === 'fill' ? 'object-fill' : ''}
      ${objectFit === 'none' ? 'object-none' : ''}
      ${objectFit === 'scale-down' ? 'object-scale-down' : ''}
      ${className}
    `,
    style: {
      objectPosition,
    },
  };

  const imagePropsWithoutAlt = {
    ...imageProps,
  };

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} overflow-hidden`}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className={`absolute inset-0 ${fill ? '' : 'w-full h-full'}`}>
          {renderLoading()}
        </div>
      )}

      {/* Main image */}
      <motion.div
        variants={imageVariants}
        initial="loading"
        animate={!isLoading ? 'loaded' : 'loading'}
        className={fill ? 'w-full h-full' : ''}
      >
        {fill ? (
          <Image
            {...imagePropsWithoutAlt}
            alt={alt}
            fill
          />
        ) : (
          <Image
            {...imagePropsWithoutAlt}
            alt={alt}
            width={width}
            height={height}
          />
        )}
      </motion.div>

      {/* Loading overlay */}
      {isLoading && placeholder === 'empty' && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoading ? 1 : 0 }}
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full"
          />
        </motion.div>
      )}
    </div>
  );
};

export default OptimizedImage;