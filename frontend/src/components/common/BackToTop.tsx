'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

export interface BackToTopProps {
  className?: string;
  showAfter?: number;
  smoothBehavior?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'circle' | 'rounded' | 'square';
  color?: 'primary' | 'secondary' | 'gray' | 'dark';
  showProgress?: boolean;
}

const BackToTop: React.FC<BackToTopProps> = ({
  className = '',
  showAfter = 300,
  smoothBehavior = true,
  position = 'bottom-right',
  size = 'md',
  variant = 'circle',
  color = 'primary',
  showProgress = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      setIsVisible(scrollTop > showAfter);
      
      if (showProgress) {
        const progress = (scrollTop / scrollHeight) * 100;
        setScrollProgress(Math.min(progress, 100));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfter, showProgress]);

  const scrollToTop = () => {
    if (smoothBehavior) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo(0, 0);
    }
  };

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2',
  };

  const variantClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none',
  };

  const colorClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25',
    secondary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25',
    gray: 'bg-gray-600 hover:bg-gray-700 text-white shadow-gray-500/25',
    dark: 'bg-gray-900 hover:bg-gray-800 text-white shadow-gray-900/25',
  };

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
        stiffness: 300,
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
      scale: 0.95,
    },
  };

  const progressVariants = {
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
        <motion.button
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          whileHover="hover"
          whileTap="tap"
          onClick={scrollToTop}
          className={`
            fixed ${positionClasses[position]} z-50
            ${sizeClasses[size]} ${variantClasses[variant]} ${colorClasses[color]}
            flex items-center justify-center
            shadow-lg hover:shadow-xl
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            backdrop-blur-sm
            ${className}
          `}
          aria-label="Back to top"
          title="Scroll to top"
        >
          {showProgress && (
            <svg
              className="absolute inset-0 w-full h-full transform -rotate-90"
              viewBox="0 0 36 36"
            >
              <path
                className="text-white/20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                className="text-white"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                variants={progressVariants}
                animate="visible"
              />
            </svg>
          )}
          
          <ChevronUpIcon 
            className={`${iconSizeClasses[size]} relative z-10`}
          />
          
          {/* Ripple effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white/20"
            initial={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;