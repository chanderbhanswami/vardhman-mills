'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { BuildingStorefrontIcon as BuildingStorefrontIconSolid } from '@heroicons/react/24/solid';

export interface ShopIconProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

const ShopIcon: React.FC<ShopIconProps> = ({
  className = '',
  showLabel = false,
  variant = 'outline',
  size = 'md',
  href = '/shop',
}) => {
  const pathname = usePathname();
  const isActive = pathname?.startsWith(href) || false;

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const iconVariants = {
    idle: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: { 
        type: 'spring' as const, 
        stiffness: 400, 
        damping: 10,
        rotate: {
          duration: 0.6,
          ease: 'easeInOut' as const,
        }
      }
    },
    tap: { scale: 0.95 },
  };

  const labelVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { delay: 0.1 }
    },
  };

  const Icon = variant === 'solid' || isActive ? BuildingStorefrontIconSolid : BuildingStorefrontIcon;

  return (
    <Link
      href={href}
      className={`
        group relative flex items-center justify-center p-2 rounded-lg
        transition-all duration-200 ease-in-out
        ${isActive 
          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
        }
        ${className}
      `}
      aria-label={showLabel ? undefined : 'Go to shop'}
      title={showLabel ? undefined : 'Shop'}
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
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-current'
            }
          `}
        />
        
        {/* Active indicator dot */}
        {isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
          />
        )}
        
        {/* New items indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"
        />
        
        {/* Hover effect background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
          Shop
        </motion.span>
      )}

      {/* Tooltip for non-labeled version */}
      {!showLabel && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          Shop
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      )}

      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-pulse"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
    </Link>
  );
};

export default ShopIcon;
