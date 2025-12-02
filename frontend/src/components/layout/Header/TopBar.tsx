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
      className={`bg-muted border-b border-border ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10 text-sm">
          {/* Left Side - Contact Info */}
          {showContactInfo && (
            <motion.div
              variants={itemVariants}
              className="hidden md:flex items-center space-x-6 text-muted-foreground"
            >
              <a
                href="tel:+911234567890"
                className="flex items-center space-x-1 hover:text-primary transition-colors"
              >
                <PhoneIcon className="w-4 h-4" />
                <span>+91 123 456 7890</span>
              </a>
              <a
                href="mailto:support@vardhmanmills.com"
                className="flex items-center space-x-1 hover:text-primary transition-colors"
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
                className="flex items-center space-x-2 text-green-600 dark:text-green-400 font-medium hover:text-green-700 dark:hover:text-green-500 transition-colors"
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
              className="hidden lg:flex items-center space-x-4 text-muted-foreground"
            >
              <Link
                href="/order-tracking"
                className="flex items-center space-x-1 hover:text-primary transition-colors"
              >
                <TruckIcon className="w-4 h-4" />
                <span>Track Order</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center space-x-1 hover:text-primary transition-colors"
              >
                <InformationCircleIcon className="w-4 h-4" />
                <span>Help</span>
              </Link>
              <div className="h-4 w-px bg-border" />
              <Link
                href="/contact"
                className="text-primary font-medium hover:text-primary/80 transition-colors"
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