'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { HomeIcon as HomeIconHero } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid } from '@heroicons/react/24/solid';

export interface HomeIconProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
}

const HomeIcon: React.FC<HomeIconProps> = ({
  className = '',
  showLabel = false,
  variant = 'outline',
  size = 'md',
}) => {
  const pathname = usePathname();
  const isActive = pathname === '/';

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const iconVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.1,
      transition: { 
        type: 'spring' as const, 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { scale: 0.95 },
  };

  const labelVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.1 }
    },
  };

  const Icon = variant === 'solid' || isActive ? HomeIconSolid : HomeIconHero;

  return (
    <Link
      href="/"
      className={`
        group relative flex items-center justify-center p-2 rounded-lg
        transition-all duration-200 ease-in-out
        ${isActive 
          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
        }
        ${className}
      `}
      aria-label={showLabel ? undefined : 'Go to home page'}
      title={showLabel ? undefined : 'Home'}
    >
      <motion.div
        variants={iconVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        className="relative flex items-center"
      >
        <Icon 
          className={`
            ${sizeClasses[size]}
            transition-colors duration-200
            ${isActive 
              ? 'text-primary-600 dark:text-primary-400' 
              : 'text-current'
            }
          `}
        />
        
        {/* Active indicator */}
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full"
          />
        )}
        
        {/* Hover effect */}
        <motion.div
          className="absolute inset-0 bg-primary-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          initial={false}
        />
      </motion.div>

      {/* Label */}
      {showLabel && (
        <motion.span
          variants={labelVariants}
          initial="hidden"
          animate="visible"
          className="ml-2 text-sm font-medium"
        >
          Home
        </motion.span>
      )}

      {/* Tooltip for non-labeled version */}
      {!showLabel && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          Home
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      )}
    </Link>
  );
};

export default HomeIcon;
