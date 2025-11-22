'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUpIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

export interface ScrollToTopProps {
  className?: string;
  showAfter?: number;
  smooth?: boolean;
  duration?: number;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'circle' | 'square' | 'rounded';
  icon?: 'chevron' | 'arrow';
  showProgress?: boolean;
  hideOn?: string[]; // Array of paths where button should be hidden
  offset?: { x?: number; y?: number };
  zIndex?: number;
  threshold?: number;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({
  className = '',
  showAfter = 400,
  smooth = true,
  duration = 800,
  position = 'bottom-right',
  size = 'md',
  variant = 'circle',
  icon = 'chevron',
  showProgress = false,
  hideOn = [],
  offset = { x: 0, y: 0 },
  zIndex = 1000,
  threshold = 0.1,
  onScrollStart,
  onScrollEnd,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentPath, setCurrentPath] = useState('');

  // Update current path for hiding on specific pages
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const calculateScrollProgress = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    return scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  }, []);

  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const progress = calculateScrollProgress();
    
    setIsVisible(scrollTop > showAfter);
    setScrollProgress(progress);
  }, [showAfter, calculateScrollProgress]);

  useEffect(() => {
    const throttledHandleScroll = throttle(handleScroll, 16); // ~60fps
    
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [handleScroll]);

  // Throttle function to improve performance
  function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function (this: unknown, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  const scrollToTop = useCallback(() => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    onScrollStart?.();

    if (smooth) {
      const startPosition = window.pageYOffset;
      const startTime = performance.now();
      
      const animateScroll = (currentTime: number) => {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function (ease-out cubic)
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        window.scrollTo(0, startPosition * (1 - easeOutCubic));
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          setIsScrolling(false);
          onScrollEnd?.();
        }
      };
      
      requestAnimationFrame(animateScroll);
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
      setIsScrolling(false);
      onScrollEnd?.();
    }
  }, [isScrolling, smooth, duration, onScrollStart, onScrollEnd]);

  // Hide on specific paths
  const shouldHide = hideOn.some(path => 
    currentPath === path || currentPath.startsWith(path)
  );
  
  if (shouldHide) return null;

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const positionClasses = {
    'bottom-right': `bottom-6 right-6`,
    'bottom-left': `bottom-6 left-6`,
    'bottom-center': `bottom-6 left-1/2 transform -translate-x-1/2`,
    'top-right': `top-6 right-6`,
    'top-left': `top-6 left-6`,
  };

  const variantClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const IconComponent = icon === 'arrow' ? ArrowUpIcon : ChevronUpIcon;

  const buttonVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 260,
        damping: 20,
      },
    },
    hover: {
      scale: 1.1,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.9,
    },
  };

  const progressCircleVariants = {
    hidden: { pathLength: 0 },
    visible: {
      pathLength: scrollProgress / 100,
      transition: {
        duration: 0.2,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed ${positionClasses[position]} ${className}`}
          style={{ 
            zIndex,
            transform: `translate(${offset.x || 0}px, ${offset.y || 0}px)`,
          }}
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.button
            onClick={scrollToTop}
            disabled={isScrolling}
            className={`
              ${sizeClasses[size]} ${variantClasses[variant]}
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              shadow-lg hover:shadow-xl
              text-gray-700 dark:text-gray-300
              flex items-center justify-center
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-70 disabled:cursor-not-allowed
              backdrop-blur-sm
              hover:bg-gray-50 dark:hover:bg-gray-700
              group
            `}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Scroll to top"
            title="Scroll to top"
          >
            {/* Progress circle */}
            {showProgress && (
              <svg
                className="absolute inset-0 w-full h-full transform -rotate-90"
                viewBox="0 0 50 50"
              >
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200 dark:text-gray-600"
                />
                <motion.circle
                  cx="25"
                  cy="25"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  className="text-blue-500"
                  variants={progressCircleVariants}
                  animate="visible"
                  style={{
                    pathLength: scrollProgress / 100,
                  }}
                />
              </svg>
            )}
            
            {/* Icon */}
            <IconComponent 
              className={`
                ${iconSizeClasses[size]} relative z-10
                ${isScrolling ? 'animate-bounce' : ''}
                group-hover:text-blue-500 dark:group-hover:text-blue-400
                transition-colors duration-200
              `}
            />
            
            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 bg-blue-500 rounded-full opacity-0"
              whileTap={{
                scale: [0, 1],
                opacity: [0.3, 0],
                transition: { duration: 0.4 }
              }}
            />
            
            {/* Floating animation for icon when scrolling */}
            {isScrolling && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  y: [-2, 2, -2],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut' as const,
                }}
              >
                <IconComponent className={iconSizeClasses[size]} />
              </motion.div>
            )}
          </motion.button>
          
          {/* Progress indicator text */}
          {showProgress && scrollProgress > threshold && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
            >
              {Math.round(scrollProgress)}%
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 dark:border-t-gray-100" />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;