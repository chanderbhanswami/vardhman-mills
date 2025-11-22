/**
 * Animation utilities for legal components
 * Provides reusable animation configurations to avoid Framer Motion variants type issues
 */

import { Transition } from 'framer-motion';

export const defaultTransition: Transition = {
  duration: 0.3,
  ease: 'easeOut'
};

export const itemTransition: Transition = {
  duration: 0.2,
  ease: 'easeOut'
};

export const staggerTransition: Transition = {
  duration: 0.2,
  ease: 'easeOut'
};

// Common animation configurations
export const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  },
  
  expandHeight: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 }
  },
  
  slideUpFromBottom: {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 }
  }
} as const;

// Hover animations
export const hoverAnimations = {
  lift: {
    y: -4,
    scale: 1.02
  },
  
  scale: {
    scale: 1.05
  },
  
  rotate: {
    scale: 1.1,
    rotate: 5
  }
} as const;

// Stagger configurations
export const staggerConfig = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  item: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 }
  }
} as const;