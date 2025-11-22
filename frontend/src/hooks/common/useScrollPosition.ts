import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

export interface ScrollPosition {
  x: number;
  y: number;
}

export interface ScrollDirection {
  horizontal: 'left' | 'right' | 'none';
  vertical: 'up' | 'down' | 'none';
}

export interface ScrollBoundaries {
  isAtTop: boolean;
  isAtBottom: boolean;
  isAtLeft: boolean;
  isAtRight: boolean;
}

export interface ScrollInfo extends ScrollPosition, ScrollBoundaries {
  direction: ScrollDirection;
  scrollPercentage: {
    vertical: number;
    horizontal: number;
  };
  velocity: {
    x: number;
    y: number;
  };
}

export interface ScrollOptions {
  throttleMs?: number;
  element?: Element | Window | null;
  threshold?: number;
  trackVelocity?: boolean;
  immediate?: boolean;
}

export interface ScrollHookReturn extends ScrollInfo {
  scrollTo: (x: number, y: number, smooth?: boolean) => void;
  scrollToTop: (smooth?: boolean) => void;
  scrollToBottom: (smooth?: boolean) => void;
  scrollToElement: (element: Element, options?: ScrollIntoViewOptions) => void;
  isScrolling: boolean;
}

const useThrottle = <T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    },
    [callback, delay]
  ) as T;
};

export const useScrollPosition = (options: ScrollOptions = {}): ScrollHookReturn => {
  const {
    throttleMs = 100,
    element = typeof window !== 'undefined' ? window : null,
    threshold = 10,
    trackVelocity = true,
    immediate = true,
  } = options;

  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 });
  const [direction, setDirection] = useState<ScrollDirection>({
    horizontal: 'none',
    vertical: 'none',
  });
  const [boundaries, setBoundaries] = useState<ScrollBoundaries>({
    isAtTop: true,
    isAtBottom: false,
    isAtLeft: true,
    isAtRight: false,
  });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isScrolling, setIsScrolling] = useState(false);

  const lastPosition = useRef<ScrollPosition>({ x: 0, y: 0 });
  const lastTimestamp = useRef<number>(Date.now());
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);

  const getScrollInfo = useCallback((): ScrollPosition => {
    if (!element) return { x: 0, y: 0 };

    if (element === window) {
      return {
        x: window.pageXOffset || document.documentElement.scrollLeft || 0,
        y: window.pageYOffset || document.documentElement.scrollTop || 0,
      };
    }

    const el = element as Element;
    return {
      x: el.scrollLeft || 0,
      y: el.scrollTop || 0,
    };
  }, [element]);

  const getScrollDimensions = useCallback(() => {
    if (!element) return { width: 0, height: 0, clientWidth: 0, clientHeight: 0 };

    if (element === window) {
      const body = document.body;
      const html = document.documentElement;
      return {
        width: Math.max(body.scrollWidth, html.scrollWidth),
        height: Math.max(body.scrollHeight, html.scrollHeight),
        clientWidth: window.innerWidth,
        clientHeight: window.innerHeight,
      };
    }

    const el = element as Element;
    return {
      width: el.scrollWidth,
      height: el.scrollHeight,
      clientWidth: el.clientWidth,
      clientHeight: el.clientHeight,
    };
  }, [element]);

  const updateScrollInfo = useCallback(() => {
    const currentPosition = getScrollInfo();
    const dimensions = getScrollDimensions();
    const currentTime = Date.now();

    const deltaX = currentPosition.x - lastPosition.current.x;
    const deltaY = currentPosition.y - lastPosition.current.y;
    const deltaTime = currentTime - lastTimestamp.current;

    const newDirection: ScrollDirection = {
      horizontal: Math.abs(deltaX) > threshold 
        ? deltaX > 0 ? 'right' : 'left' 
        : 'none',
      vertical: Math.abs(deltaY) > threshold 
        ? deltaY > 0 ? 'down' : 'up' 
        : 'none',
    };

    let newVelocity = { x: 0, y: 0 };
    if (trackVelocity && deltaTime > 0) {
      newVelocity = {
        x: deltaX / deltaTime,
        y: deltaY / deltaTime,
      };
    }

    const newBoundaries: ScrollBoundaries = {
      isAtTop: currentPosition.y <= threshold,
      isAtBottom: currentPosition.y >= dimensions.height - dimensions.clientHeight - threshold,
      isAtLeft: currentPosition.x <= threshold,
      isAtRight: currentPosition.x >= dimensions.width - dimensions.clientWidth - threshold,
    };

    setPosition(currentPosition);
    setDirection(newDirection);
    setBoundaries(newBoundaries);
    if (trackVelocity) {
      setVelocity(newVelocity);
    }

    lastPosition.current = currentPosition;
    lastTimestamp.current = currentTime;

    setIsScrolling(true);
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }
    scrollTimer.current = setTimeout(() => {
      setIsScrolling(false);
    }, throttleMs * 2);
  }, [getScrollInfo, getScrollDimensions, threshold, trackVelocity, throttleMs]);

  const throttledUpdateScrollInfo = useThrottle(updateScrollInfo, throttleMs);

  const scrollPercentage = useMemo(() => {
    const dimensions = getScrollDimensions();
    const maxScrollX = dimensions.width - dimensions.clientWidth;
    const maxScrollY = dimensions.height - dimensions.clientHeight;

    return {
      horizontal: maxScrollX > 0 ? (position.x / maxScrollX) * 100 : 0,
      vertical: maxScrollY > 0 ? (position.y / maxScrollY) * 100 : 0,
    };
  }, [position, getScrollDimensions]);

  const scrollTo = useCallback(
    (x: number, y: number, smooth = true) => {
      if (!element) return;

      const scrollOptions: ScrollToOptions = {
        left: x,
        top: y,
        behavior: smooth ? 'smooth' : 'auto',
      };

      if (element === window) {
        window.scrollTo(scrollOptions);
      } else {
        (element as Element).scrollTo(scrollOptions);
      }
    },
    [element]
  );

  const scrollToTop = useCallback(
    (smooth = true) => {
      scrollTo(position.x, 0, smooth);
    },
    [scrollTo, position.x]
  );

  const scrollToBottom = useCallback(
    (smooth = true) => {
      const dimensions = getScrollDimensions();
      const maxScrollY = dimensions.height - dimensions.clientHeight;
      scrollTo(position.x, maxScrollY, smooth);
    },
    [scrollTo, position.x, getScrollDimensions]
  );

  const scrollToElement = useCallback(
    (targetElement: Element, scrollOptions?: ScrollIntoViewOptions) => {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
        ...scrollOptions,
      });
    },
    []
  );

  useEffect(() => {
    if (!element) return;

    const handleScroll = throttledUpdateScrollInfo;

    if (immediate) {
      updateScrollInfo();
    }

    element.addEventListener('scroll', handleScroll, { passive: true });
    
    const handleResize = () => {
      updateScrollInfo();
    };
    
    if (element === window) {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (element === window) {
        window.removeEventListener('resize', handleResize);
      }
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, [element, throttledUpdateScrollInfo, updateScrollInfo, immediate]);

  return {
    x: position.x,
    y: position.y,
    direction,
    ...boundaries,
    scrollPercentage,
    velocity,
    scrollTo,
    scrollToTop,
    scrollToBottom,
    scrollToElement,
    isScrolling,
  };
};

export default useScrollPosition;
