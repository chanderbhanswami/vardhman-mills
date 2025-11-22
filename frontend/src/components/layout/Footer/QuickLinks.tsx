'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export interface QuickLinksProps {
  className?: string;
  title?: string;
  variant?: 'default' | 'minimal';
}

interface LinkItem {
  label: string;
  href: string;
  isNew?: boolean;
  isPopular?: boolean;
}

const defaultLinks: LinkItem[] = [
  { label: 'About Us', href: '/about' },
  { label: 'Our Products', href: '/products' },
  { label: 'Quality Assurance', href: '/quality' },
  { label: 'Sustainability', href: '/sustainability' },
  { label: 'Manufacturing Process', href: '/manufacturing' },
  { label: 'Certifications', href: '/certifications' },
  { label: 'Export Capabilities', href: '/export' },
  { label: 'Careers', href: '/careers', isNew: true },
  { label: 'Bulk Orders', href: '/bulk-orders', isPopular: true },
  { label: 'Dealer Network', href: '/dealers' },
];

const QuickLinks: React.FC<QuickLinksProps> = ({
  className = '',
  title = 'Company',
  variant = 'default',
}) => {
  const linkVariants = {
    hover: { 
      x: 4,
      transition: { type: 'tween' as const, duration: 0.2 }
    }
  };

  const iconVariants = {
    hover: { 
      x: 2,
      transition: { type: 'tween' as const, duration: 0.2 }
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`${className}`}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>
        <ul className="space-y-2">
          {defaultLinks.slice(0, 5).map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {title}
      </h3>
      
      <div className="space-y-3">
        {defaultLinks.map((link) => (
          <motion.div
            key={link.href}
            variants={linkVariants}
            whileHover="hover"
            className="group"
          >
            <Link
              href={link.href}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <motion.div
                variants={iconVariants}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <ChevronRightIcon className="w-4 h-4 mr-1" />
              </motion.div>
              
              <span className="relative">
                {link.label}
                
                {/* New badge */}
                {link.isNew && (
                  <span className="absolute -top-2 -right-8 px-1.5 py-0.5 text-xs font-bold text-white bg-green-500 rounded-full">
                    New
                  </span>
                )}
                
                {/* Popular badge */}
                {link.isPopular && (
                  <span className="absolute -top-2 -right-12 px-1.5 py-0.5 text-xs font-bold text-white bg-orange-500 rounded-full">
                    Popular
                  </span>
                )}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {/* Call to Action */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Need Custom Solutions?
        </h4>
        <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
          Get in touch with our experts for customized textile solutions.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200"
        >
          Contact Us
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default QuickLinks;