'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
// import { cva, type VariantProps } from 'class-variance-authority'; // Unused
import { cn } from '../../lib/utils';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline';

// Scroll variants (commented out as only used for types)
// const scrollVariants = cva(
//   'relative',
//   {
//     variants: {
//       variant: {
//         default: '',
//         smooth: 'scroll-smooth',
//         auto: 'scroll-auto',
//       },
//       behavior: {
//         default: '',
//         instant: 'scroll-auto',
//         smooth: 'scroll-smooth',
//       },
//     },
//     defaultVariants: {
//       variant: 'default',
//       behavior: 'smooth',
//     },
//   }
// );

// Types
export interface ScrollToTopProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  showAfter?: number;
  hideAfter?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'default' | 'lg';
  icon?: React.ReactNode;
  smooth?: boolean;
  variant?: 'default' | 'smooth' | 'auto';
  behavior?: 'default' | 'instant' | 'smooth';
}

export interface ScrollSpyProps {
  children: React.ReactNode;
  sections: Array<{
    id: string;
    label: string;
  }>;
  onSectionChange?: (sectionId: string) => void;
  offset?: number;
  className?: string;
}

export interface InfiniteScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  loadingComponent?: React.ReactNode;
  endComponent?: React.ReactNode;
  className?: string;
}

export interface ScrollProgressProps {
  className?: string;
  height?: string;
  color?: string;
  position?: 'top' | 'bottom';
  showPercentage?: boolean;
}

export interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

// Context
interface ScrollContextType {
  scrollY: number;
  scrollDirection: 'up' | 'down';
  isAtTop: boolean;
  isAtBottom: boolean;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

export const useScrollContext = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('Scroll components must be used within ScrollProvider');
  }
  return context;
};

// Scroll Provider
export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
      const atTop = currentScrollY < 10;
      const atBottom = 
        currentScrollY + window.innerHeight >= document.documentElement.scrollHeight - 10;

      setScrollY(currentScrollY);
      setScrollDirection(direction);
      setIsAtTop(atTop);
      setIsAtBottom(atBottom);
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const contextValue: ScrollContextType = {
    scrollY,
    scrollDirection,
    isAtTop,
    isAtBottom,
  };

  return (
    <ScrollContext.Provider value={contextValue}>
      {children}
    </ScrollContext.Provider>
  );
};

// Scroll to Top Button
export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  showAfter = 400,
  hideAfter,
  position = 'bottom-right',
  size = 'default',
  icon,
  smooth = true,
  className,
  children,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > showAfter;
      const shouldHide = hideAfter ? scrollY > hideAfter : false;
      
      setIsVisible(shouldShow && !shouldHide);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfter, hideAfter]);

  const scrollToTop = () => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo(0, 0);
    }
  };

  const positions = {
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
  };

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    default: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors',
            positions[position],
            sizes[size],
            className
          )}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          disabled={props.disabled}
          style={props.style}
        >
          {children || icon || <ArrowUpIcon className="w-4 h-4" />}
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// Scroll Spy
export const ScrollSpy: React.FC<ScrollSpyProps> = ({
  children,
  sections,
  onSectionChange,
  offset = 100,
  className,
}) => {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + offset;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollY >= offsetTop && scrollY < offsetTop + offsetHeight) {
            if (activeSection !== section.id) {
              setActiveSection(section.id);
              onSectionChange?.(section.id);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections, offset, activeSection, onSectionChange]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Navigation */}
      <nav className="sticky top-4 z-40 mb-4">
        <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg p-2">
          <div className="flex flex-wrap gap-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      {children}
    </div>
  );
};

// Infinite Scroll
export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  hasMore,
  loading,
  onLoadMore,
  threshold = 200,
  loadingComponent,
  endComponent,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore, threshold]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {children}
      
      {/* Loading/End Sentinel */}
      <div ref={sentinelRef} className="py-4">
        {loading && (
          loadingComponent || (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
              <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
            </div>
          )
        )}
        
        {!hasMore && !loading && (
          endComponent || (
            <div className="text-center text-sm text-muted-foreground py-4">
              No more items to load
            </div>
          )
        )}
      </div>
    </div>
  );
};

// Scroll Progress
export const ScrollProgress: React.FC<ScrollProgressProps> = ({
  className,
  height = '4px',
  color = 'bg-primary',
  position = 'top',
  showPercentage = false,
}) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const percentage = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const positionClass = position === 'top' 
    ? 'fixed top-0 left-0 right-0 z-50'
    : 'fixed bottom-0 left-0 right-0 z-50';

  return (
    <div className={cn(positionClass, className)}>
      <div className={cn('w-full bg-border/20', `h-[${height}]`)}>
        <motion.div
          className={cn('h-full origin-left', color)}
          style={{ scaleX }}
        />
      </div>
      
      {showPercentage && (
        <motion.div
          className="absolute right-2 top-1 text-xs font-medium bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded"
          style={{ y: position === 'top' ? 0 : -20 }}
        >
          <motion.span>{Math.round(typeof percentage === 'number' ? percentage : percentage.get())}%</motion.span>
        </motion.div>
      )}
    </div>
  );
};

// Virtual Scroll
export const VirtualScroll = <T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
}: VirtualScrollProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );

  const offsetY = visibleStart * itemHeight;
  const totalHeight = items.length * itemHeight;

  const visibleItems = items.slice(
    Math.max(0, visibleStart - overscan),
    Math.min(items.length, visibleEnd + 1 + overscan)
  );

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      data-container-height={typeof containerHeight === 'number' ? `${containerHeight}px` : containerHeight}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div 
        className="relative"
        data-total-height={totalHeight}
      >
        <div
          className="absolute inset-x-0 top-0"
          data-offset-y={offsetY}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleStart - overscan + index}
              className="block"
              data-item-height={itemHeight}
            >
              {renderItem(item, visibleStart - overscan + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Smooth Scroll Container
interface SmoothScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export const SmoothScrollContainer: React.FC<SmoothScrollContainerProps> = ({
  children,
  className,
  speed = 0.1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  const smoothY = useTransform(scrollY, (value) => value * -speed);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <motion.div style={{ y: smoothY }}>
        {children}
      </motion.div>
    </div>
  );
};

// Parallax Scroll
interface ParallaxScrollProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxScroll: React.FC<ParallaxScrollProps> = ({
  children,
  speed = 0.5,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
};

// Scroll Reveal
interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 50,
  once = true,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setHasBeenInView(true);
        } else if (!once || !hasBeenInView) {
          setIsInView(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once, hasBeenInView]);

  const variants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -distance : direction === 'right' ? distance : 0,
      y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

// Scroll Controls
export const ScrollControls: React.FC<{ className?: string }> = ({ className }) => {
  const scrollStep = 100;

  const scrollUp = () => {
    window.scrollBy({ top: -scrollStep, behavior: 'smooth' });
  };

  const scrollDown = () => {
    window.scrollBy({ top: scrollStep, behavior: 'smooth' });
  };

  const scrollLeft = () => {
    window.scrollBy({ left: -scrollStep, behavior: 'smooth' });
  };

  const scrollRight = () => {
    window.scrollBy({ left: scrollStep, behavior: 'smooth' });
  };

  return (
    <div className={cn('fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2', className)}>
      <button
        type="button"
        onClick={scrollUp}
        className="p-2 bg-background border border-border rounded-md shadow-sm hover:bg-accent"
        aria-label="Scroll up"
      >
        <ChevronUpIcon className="w-4 h-4" />
      </button>
      
      <div className="flex gap-2">
        <button
          type="button"
          onClick={scrollLeft}
          className="p-2 bg-background border border-border rounded-md shadow-sm hover:bg-accent"
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={scrollRight}
          className="p-2 bg-background border border-border rounded-md shadow-sm hover:bg-accent"
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
      
      <button
        type="button"
        onClick={scrollDown}
        className="p-2 bg-background border border-border rounded-md shadow-sm hover:bg-accent"
        aria-label="Scroll down"
      >
        <ChevronDownIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

// Export all components
const ScrollAreaComponents = {
  ScrollProvider,
  ScrollToTop,
  ScrollSpy,
  InfiniteScroll,
  ScrollProgress,
  VirtualScroll,
  SmoothScrollContainer,
  ParallaxScroll,
  ScrollReveal,
  ScrollControls,
};

export default ScrollAreaComponents;
