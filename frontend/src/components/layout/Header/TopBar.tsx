'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  TruckIcon,
  GiftIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

export interface TopBarProps {
  className?: string;
  showContactInfo?: boolean;
  showPromotions?: boolean;
  showLinks?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  className = '',
  showContactInfo = true,
  showPromotions = true,
  showLinks = true,
}) => {
  const topBarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.div
      variants={topBarVariants}
      initial="hidden"
      animate="visible"
      className={`bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10 text-sm">
          {/* Left Side - Contact Info */}
          {showContactInfo && (
            <motion.div
              variants={itemVariants}
              className="hidden md:flex items-center space-x-6 text-gray-600 dark:text-gray-400"
            >
              <a
                href="tel:+911234567890"
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <PhoneIcon className="w-4 h-4" />
                <span>+91 123 456 7890</span>
              </a>
              <a
                href="mailto:support@vardhmanmills.com"
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <EnvelopeIcon className="w-4 h-4" />
                <span>support@vardhmanmills.com</span>
              </a>
            </motion.div>
          )}

          {/* Center - Promotion */}
          {showPromotions && (
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center flex-1 md:flex-none"
            >
              <Link
                href="/sale"
                className="flex items-center space-x-2 text-green-600 dark:text-green-400 font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                <GiftIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Free Shipping on Orders Over ₹999!</span>
                <span className="sm:hidden">Free Shipping ₹999+</span>
              </Link>
            </motion.div>
          )}

          {/* Right Side - Quick Links */}
          {showLinks && (
            <motion.div
              variants={itemVariants}
              className="hidden lg:flex items-center space-x-4 text-gray-600 dark:text-gray-400"
            >
              <Link
                href="/order-tracking"
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <TruckIcon className="w-4 h-4" />
                <span>Track Order</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <InformationCircleIcon className="w-4 h-4" />
                <span>Help</span>
              </Link>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
              <Link
                href="/contact"
                className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Contact Us
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TopBar;