import { useState, useCallback, useRef } from 'react';

interface ImagePreloaderReturn {
  preloadImage: (src: string) => Promise<HTMLImageElement>;
  isImageLoaded: (src: string) => boolean;
  preloadedImages: Map<string, HTMLImageElement>;
  clearCache: () => void;
}

/**
 * Hook for preloading images with caching
 */
export function useImagePreloader(): ImagePreloaderReturn {
  const [preloadedImages] = useState(new Map<string, HTMLImageElement>());
  const loadingPromises = useRef(new Map<string, Promise<HTMLImageElement>>());

  const preloadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    // Return existing image if already loaded
    if (preloadedImages.has(src)) {
      return Promise.resolve(preloadedImages.get(src)!);
    }

    // Return existing promise if currently loading
    if (loadingPromises.current.has(src)) {
      return loadingPromises.current.get(src)!;
    }

    // Create new loading promise
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        preloadedImages.set(src, img);
        loadingPromises.current.delete(src);
        resolve(img);
      };
      
      img.onerror = () => {
        loadingPromises.current.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });

    loadingPromises.current.set(src, promise);
    return promise;
  }, [preloadedImages]);

  const isImageLoaded = useCallback((src: string): boolean => {
    return preloadedImages.has(src);
  }, [preloadedImages]);

  const clearCache = useCallback(() => {
    preloadedImages.clear();
    loadingPromises.current.clear();
  }, [preloadedImages]);

  return {
    preloadImage,
    isImageLoaded,
    preloadedImages,
    clearCache
  };
}