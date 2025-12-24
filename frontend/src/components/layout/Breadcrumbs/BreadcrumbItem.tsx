'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export interface BreadcrumbItemData {
  label: string;
  href?: string;
  isActive?: boolean;
  icon?: React.ReactNode;
}

export interface BreadcrumbItemProps extends BreadcrumbItemData {
  isLast?: boolean;
  showSeparator?: boolean;
  className?: string;
  separatorClassName?: string;
  activeClassName?: string;
  linkClassName?: string;
}

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  label,
  href,
  isActive = false,
  isLast = false,
  showSeparator = true,
  icon,
  className = '',
  separatorClassName = '',
  activeClassName = '',
  linkClassName = '',
}) => {
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.1,
      },
    },
  };

  const baseClasses = `
    flex items-center space-x-1 text-sm font-medium transition-colors duration-200
    ${isActive
      ? `text-black font-bold cursor-default ${activeClassName}`
      : `text-black hover:text-black ${linkClassName}`
    }
    ${className}
  `;

  const separatorClasses = `
    flex items-center text-gray-400 mx-2
    ${separatorClassName}
  `;

  const renderContent = () => (
    <motion.span
      variants={itemVariants}
      className="flex items-center space-x-1 text-black"
    >
      {icon && (
        <span className="w-4 h-4 flex items-center justify-center">
          {icon}
        </span>
      )}
      <span className="truncate max-w-[120px] sm:max-w-[200px] md:max-w-none text-black font-medium">
        {label}
      </span>
    </motion.span>
  );

  return (
    <li className="flex items-center">
      {isActive || !href ? (
        <motion.span
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className={baseClasses}
          aria-current={isActive ? 'page' : undefined}
        >
          {renderContent()}
        </motion.span>
      ) : (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className={baseClasses}
        >
          <Link
            href={href}
            className="flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-1 py-0.5"
            aria-label={`Navigate to ${label}`}
          >
            {renderContent()}
          </Link>
        </motion.div>
      )}

      {!isLast && showSeparator && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className={separatorClasses}
          aria-hidden="true"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </motion.div>
      )}
    </li>
  );
};

export default BreadcrumbItem;