'use client';

import React, { 
  useState, 
  useRef, 
  useCallback, 
  useEffect, 
  forwardRef,
  useImperativeHandle 
} from 'react';
import { motion, PanInfo } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// ScrollBar variants
const scrollBarVariants = cva(
  'relative overflow-hidden',
  {
    variants: {
      variant: {
        default: '',
        minimal: 'scrollbar-thin',
        hidden: 'scrollbar-hide',
        overlay: 'absolute inset-0 pointer-events-none'
      },
      orientation: {
        vertical: 'h-full w-2',
        horizontal: 'w-full h-2'
      },
      size: {
        sm: '',
        default: '',
        lg: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      orientation: 'vertical',
      size: 'default'
    }
  }
);

// Scroll track variants
const trackVariants = cva(
  'bg-secondary/30 rounded-full transition-colors',
  {
    variants: {
      orientation: {
        vertical: 'w-full h-full',
        horizontal: 'h-full w-full'
      },
      size: {
        sm: '',
        default: '',
        lg: ''
      }
    },
    defaultVariants: {
      orientation: 'vertical',
      size: 'default'
    }
  }
);

// Scroll thumb variants
const thumbVariants = cva(
  'bg-border hover:bg-border/80 active:bg-border/60 rounded-full transition-colors cursor-grab active:cursor-grabbing',
  {
    variants: {
      orientation: {
        vertical: 'w-full min-h-[20px]',
        horizontal: 'h-full min-w-[20px]'
      },
      size: {
        sm: '',
        default: '',
        lg: ''
      }
    },
    defaultVariants: {
      orientation: 'vertical',
      size: 'default'
    }
  }
);

// ScrollBar Content Area Props
export interface ScrollAreaProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof scrollBarVariants> {
  children: React.ReactNode;
  scrollHideDelay?: number;
  type?: 'auto' | 'always' | 'scroll' | 'hover';
  dir?: 'ltr' | 'rtl';
}

// Custom ScrollBar Component Props
export interface ScrollBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onScroll'>,
    VariantProps<typeof scrollBarVariants> {
  scrollTop?: number;
  scrollLeft?: number;
  scrollHeight?: number;
  scrollWidth?: number;
  clientHeight?: number;
  clientWidth?: number;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  onScrollEnd?: () => void;
  forceVisible?: boolean;
}

// ScrollBar Hook for scroll state management
export const useScrollBar = (containerRef: React.RefObject<HTMLElement | null>) => {
  const [scrollState, setScrollState] = useState({
    scrollTop: 0,
    scrollLeft: 0,
    scrollHeight: 0,
    scrollWidth: 0,
    clientHeight: 0,
    clientWidth: 0,
    isScrolling: false
  });

  const updateScrollState = useCallback(() => {
    if (containerRef.current) {
      const {
        scrollTop,
        scrollLeft,
        scrollHeight,
        scrollWidth,
        clientHeight,
        clientWidth
      } = containerRef.current;

      setScrollState(prev => ({
        ...prev,
        scrollTop,
        scrollLeft,
        scrollHeight,
        scrollWidth,
        clientHeight,
        clientWidth
      }));
    }
  }, [containerRef]);

  const handleScroll = useCallback(() => {
    setScrollState(prev => ({ ...prev, isScrolling: true }));
    updateScrollState();
    
    // Clear scrolling state after delay
    setTimeout(() => {
      setScrollState(prev => ({ ...prev, isScrolling: false }));
    }, 150);
  }, [updateScrollState]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollState();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [containerRef, handleScroll, updateScrollState]);

  return scrollState;
};

// Custom ScrollBar Component
export const ScrollBar = forwardRef<HTMLDivElement, ScrollBarProps>(
  ({
    className,
    orientation = 'vertical',
    variant = 'default',
    size = 'default',
    scrollTop = 0,
    scrollLeft = 0,
    scrollHeight = 0,
    scrollWidth = 0,
    clientHeight = 0,
    clientWidth = 0,
    onScroll,
    onScrollEnd,
    forceVisible = false,
    ...props
  }, ref) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isVisible, setIsVisible] = useState(forceVisible);
    
    // Motion values for thumb animations
    const thumbScale = isDragging ? 1.1 : isVisible ? 1 : 0.8;
    const thumbOpacity = isVisible ? 1 : 0;

    // Calculate scroll ratios and thumb size
    const isVertical = orientation === 'vertical';
    const scrollRatio = isVertical
      ? scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0
      : scrollWidth > clientWidth ? scrollLeft / (scrollWidth - clientWidth) : 0;

    const thumbSize = isVertical
      ? scrollHeight > 0 ? (clientHeight / scrollHeight) * clientHeight : 0
      : scrollWidth > 0 ? (clientWidth / scrollWidth) * clientWidth : 0;

    const trackSize = isVertical ? clientHeight : clientWidth;
    const maxThumbPosition = trackSize - thumbSize;
    const thumbPosition = scrollRatio * maxThumbPosition;

    // Show/hide scrollbar based on content overflow
    const hasOverflow = isVertical ? scrollHeight > clientHeight : scrollWidth > clientWidth;
    
    useEffect(() => {
      if (forceVisible) {
        setIsVisible(true);
      } else {
        setIsVisible(hasOverflow);
      }
    }, [hasOverflow, forceVisible]);

    // Handle thumb drag
    const handleThumbDrag = useCallback((
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ) => {
      if (!trackRef.current || !onScroll) return;

      const trackRect = trackRef.current.getBoundingClientRect();
      const trackLength = isVertical ? trackRect.height : trackRect.width;
      const maxScrollLength = isVertical ? scrollHeight - clientHeight : scrollWidth - clientWidth;

      let newPosition: number;
      if (isVertical) {
        // Use info.point for more accurate positioning
        const clientY = info.point.y;
        newPosition = ((clientY - trackRect.top) / trackLength) * maxScrollLength;
      } else {
        const clientX = info.point.x;
        newPosition = ((clientX - trackRect.left) / trackLength) * maxScrollLength;
      }

      newPosition = Math.max(0, Math.min(newPosition, maxScrollLength));

      if (isVertical) {
        onScroll(newPosition, scrollLeft);
      } else {
        onScroll(scrollTop, newPosition);
      }
    }, [isVertical, scrollHeight, scrollWidth, clientHeight, clientWidth, scrollTop, scrollLeft, onScroll]);

    const handleDragStart = useCallback(() => {
      setIsDragging(true);
    }, []);

    const handleDragEnd = useCallback(() => {
      setIsDragging(false);
      onScrollEnd?.();
    }, [onScrollEnd]);

    // Handle track click
    const handleTrackClick = useCallback((event: React.MouseEvent) => {
      if (!trackRef.current || !onScroll || event.target === thumbRef.current) return;

      const trackRect = trackRef.current.getBoundingClientRect();
      const clickPosition = isVertical
        ? event.clientY - trackRect.top
        : event.clientX - trackRect.left;

      const trackLength = isVertical ? trackRect.height : trackRect.width;
      const scrollRatio = clickPosition / trackLength;
      const maxScrollLength = isVertical ? scrollHeight - clientHeight : scrollWidth - clientWidth;
      const newPosition = scrollRatio * maxScrollLength;

      if (isVertical) {
        onScroll(newPosition, scrollLeft);
      } else {
        onScroll(scrollTop, newPosition);
      }
    }, [isVertical, scrollHeight, scrollWidth, clientHeight, clientWidth, scrollTop, scrollLeft, onScroll]);

    if (!isVisible || thumbSize >= trackSize) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(scrollBarVariants({ variant, orientation, size }), className)}
        {...props}
      >
        <div
          ref={trackRef}
          className={cn(trackVariants({ orientation, size }))}
          onClick={handleTrackClick}
        >
          <motion.div
            ref={thumbRef}
            className={cn(
              thumbVariants({ orientation, size }),
              isDragging && 'scale-110 transition-transform'
            )}
            style={{
              scale: thumbScale,
              opacity: thumbOpacity,
              ...(isVertical
                ? {
                    height: thumbSize,
                    y: thumbPosition,
                  }
                : {
                    width: thumbSize,
                    x: thumbPosition,
                  })
            }}
            drag={isVertical ? 'y' : 'x'}
            dragConstraints={trackRef}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDrag={handleThumbDrag}
            onDragEnd={handleDragEnd}
            whileHover={{ scale: 1.05 }}
            whileDrag={{ scale: 1.1 }}
          />
        </div>
      </div>
    );
  }
);

ScrollBar.displayName = 'ScrollBar';

// ScrollArea Component with built-in scrollbars
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({
    className,
    children,
    variant = 'default',
    size = 'default',
    scrollHideDelay = 600,
    type = 'hover',
    dir = 'ltr',
    ...props
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showScrollbars, setShowScrollbars] = useState(type === 'always');
    const scrollState = useScrollBar(containerRef);

    useImperativeHandle(ref, () => containerRef.current!);

    // Handle scroll visibility based on type
    useEffect(() => {
      if (type === 'always') {
        setShowScrollbars(true);
      } else if (type === 'scroll' || type === 'hover') {
        if (scrollState.isScrolling) {
          setShowScrollbars(true);
        } else {
          const timer = setTimeout(() => {
            setShowScrollbars(false);
          }, scrollHideDelay);
          
          return () => clearTimeout(timer);
        }
      }
    }, [type, scrollState.isScrolling, scrollHideDelay]);

    // Handle mouse enter/leave for hover type
    const handleMouseEnter = useCallback(() => {
      if (type === 'hover') {
        setShowScrollbars(true);
      }
    }, [type]);

    const handleMouseLeave = useCallback(() => {
      if (type === 'hover' && !scrollState.isScrolling) {
        setShowScrollbars(false);
      }
    }, [type, scrollState.isScrolling]);

    // Handle scroll from custom scrollbars
    const handleCustomScroll = useCallback((scrollTop: number, scrollLeft: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: scrollTop,
          left: scrollLeft,
          behavior: 'auto'
        });
      }
    }, []);

    const needsVerticalScroll = scrollState.scrollHeight > scrollState.clientHeight;
    const needsHorizontalScroll = scrollState.scrollWidth > scrollState.clientWidth;

    return (
      <div 
        className={cn('relative', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Scrollable content */}
        <div
          ref={containerRef}
          className={cn(
            'overflow-auto',
            variant === 'hidden' && 'scrollbar-hide',
            variant === 'minimal' && 'scrollbar-thin'
          )}
          dir={dir}
        >
          {children}
        </div>

        {/* Custom scrollbars */}
        {variant === 'overlay' && (
          <>
            {/* Vertical scrollbar */}
            {needsVerticalScroll && (
              <motion.div
                className="absolute top-0 right-0 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: showScrollbars ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ScrollBar
                  orientation="vertical"
                  variant={variant}
                  size={size}
                  scrollTop={scrollState.scrollTop}
                  scrollHeight={scrollState.scrollHeight}
                  clientHeight={scrollState.clientHeight}
                  onScroll={handleCustomScroll}
                  forceVisible={showScrollbars}
                />
              </motion.div>
            )}

            {/* Horizontal scrollbar */}
            {needsHorizontalScroll && (
              <motion.div
                className="absolute bottom-0 left-0 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: showScrollbars ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ScrollBar
                  orientation="horizontal"
                  variant={variant}
                  size={size}
                  scrollLeft={scrollState.scrollLeft}
                  scrollWidth={scrollState.scrollWidth}
                  clientWidth={scrollState.clientWidth}
                  onScroll={handleCustomScroll}
                  forceVisible={showScrollbars}
                />
              </motion.div>
            )}
          </>
        )}
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';

// Horizontal ScrollArea
export const HorizontalScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ScrollArea
        ref={ref}
        className={cn('overflow-x-auto overflow-y-hidden', className)}
        orientation="horizontal"
        {...props}
      >
        <div className="flex">{children}</div>
      </ScrollArea>
    );
  }
);

HorizontalScrollArea.displayName = 'HorizontalScrollArea';

// Vertical ScrollArea
export const VerticalScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <ScrollArea
        ref={ref}
        className={cn('overflow-y-auto overflow-x-hidden', className)}
        orientation="vertical"
        {...props}
      />
    );
  }
);

VerticalScrollArea.displayName = 'VerticalScrollArea';

// Auto-hiding ScrollArea
export const AutoScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  (props, ref) => {
    return (
      <ScrollArea
        ref={ref}
        type="auto"
        variant="overlay"
        {...props}
      />
    );
  }
);

AutoScrollArea.displayName = 'AutoScrollArea';

// Always visible ScrollArea
export const AlwaysScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  (props, ref) => {
    return (
      <ScrollArea
        ref={ref}
        type="always"
        variant="overlay"
        {...props}
      />
    );
  }
);

AlwaysScrollArea.displayName = 'AlwaysScrollArea';

// Minimal ScrollArea
export const MinimalScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  (props, ref) => {
    return (
      <ScrollArea
        ref={ref}
        variant="minimal"
        type="auto"
        {...props}
      />
    );
  }
);

MinimalScrollArea.displayName = 'MinimalScrollArea';

export default ScrollArea;

