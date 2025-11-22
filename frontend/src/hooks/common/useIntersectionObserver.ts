import { useEffect, useRef, useState, useCallback } from 'react';

export interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
  enabled?: boolean;
}

export interface IntersectionObserverReturn {
  ref: React.RefObject<HTMLElement>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

export const useIntersectionObserver = (
  options: IntersectionObserverOptions = {}
): IntersectionObserverReturn => {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    freezeOnceVisible = false,
    enabled = true,
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const frozenRef = useRef(false);

  const updateEntry = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (freezeOnceVisible && entry.isIntersecting) {
        frozenRef.current = true;
      }
      
      if (!frozenRef.current) {
        setEntry(entry);
        setIsIntersecting(entry.isIntersecting);
      }
    },
    [freezeOnceVisible]
  );

  useEffect(() => {
    const element = elementRef.current;
    
    if (!element || !enabled) {
      return;
    }

    // Check if IntersectionObserver is supported
    if (!window.IntersectionObserver) {
      console.warn('IntersectionObserver is not supported in this browser');
      return;
    }

    // Create observer
    observerRef.current = new IntersectionObserver(updateEntry, {
      root,
      rootMargin,
      threshold,
    });

    // Start observing
    observerRef.current.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [root, rootMargin, threshold, enabled, updateEntry]);

  // Reset frozen state when options change
  useEffect(() => {
    if (!freezeOnceVisible) {
      frozenRef.current = false;
    }
  }, [freezeOnceVisible]);

  return {
    ref: elementRef as React.RefObject<HTMLElement>,
    isIntersecting,
    entry,
  };
};

// Hook for lazy loading images
export const useLazyImage = (
  src: string,
  options: IntersectionObserverOptions = {}
) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Event | null>(null);
  
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true,
    ...options,
  });

  useEffect(() => {
    if (isIntersecting && src && !imageSrc) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      
      img.onerror = (error) => {
        setError(error as Event);
      };
      
      img.src = src;
    }
  }, [isIntersecting, src, imageSrc]);

  return {
    ref,
    src: imageSrc,
    isLoaded,
    error,
    isIntersecting,
  };
};

// Hook for infinite scrolling
export const useInfiniteScroll = (
  fetchMore: () => void,
  options: IntersectionObserverOptions = {}
) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 1.0,
    ...options,
  });

  useEffect(() => {
    if (isIntersecting) {
      fetchMore();
    }
  }, [isIntersecting, fetchMore]);

  return { ref, isIntersecting };
};

// Hook for tracking element visibility
export const useElementVisibility = (
  threshold: number = 0.5,
  options: IntersectionObserverOptions = {}
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [visibilityRatio, setVisibilityRatio] = useState(0);
  
  const { ref, entry } = useIntersectionObserver({
    threshold,
    ...options,
  });

  useEffect(() => {
    if (entry) {
      setIsVisible(entry.isIntersecting);
      setVisibilityRatio(entry.intersectionRatio);
    }
  }, [entry]);

  return {
    ref,
    isVisible,
    visibilityRatio,
    entry,
  };
};

export default useIntersectionObserver;