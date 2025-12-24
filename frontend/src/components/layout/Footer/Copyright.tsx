'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface CopyrightProps {
  className?: string;
  minimal?: boolean;
  showYear?: boolean;
  companyName?: string;
}

const Copyright: React.FC<CopyrightProps> = ({
  className = '',
  minimal = false,
  showYear = true,
  companyName = 'Vardhman Mills Ltd.',
}) => {
  const currentYear = new Date().getFullYear();

  const linkVariants = {
    hover: {
      y: -1,
      transition: { duration: 0.2 }
    }
  };

  if (minimal) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-sm text-gray-400 font-medium">
          © {showYear && currentYear} {companyName} All rights reserved.
        </p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
        {/* Copyright Text */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <p className="text-sm text-gray-400 font-medium">
            © {showYear && currentYear} {companyName} All rights reserved.
          </p>

          <div className="flex items-center space-x-4 text-sm text-gray-500 font-medium">
            <span>•</span>
            <span>Established 1965</span>
            <span>•</span>
            <span>Made in India 🇮🇳</span>
          </div>
        </div>

        {/* Additional Links */}
        <div className="flex items-center space-x-6 text-sm">
          <motion.div variants={linkVariants} whileHover="hover">
            <Link
              href="/sitemap"
              className="text-gray-500 hover:text-gray-300 transition-colors duration-200 font-medium"
            >
              Sitemap
            </Link>
          </motion.div>

          <span className="text-gray-700">•</span>

          <motion.div variants={linkVariants} whileHover="hover">
            <Link
              href="/accessibility"
              className="text-gray-500 hover:text-gray-300 transition-colors duration-200 font-medium"
            >
              Accessibility
            </Link>
          </motion.div>

          <span className="text-gray-700">•</span>

          <motion.div variants={linkVariants} whileHover="hover">
            <Link
              href="/modern-slavery"
              className="text-gray-500 hover:text-gray-300 transition-colors duration-200 font-medium"
            >
              Modern Slavery Statement
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Developer Credit */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <p className="text-xs text-gray-500 font-medium">
            Website powered by Next.js, designed with sustainability in mind.
          </p>

          <div className="flex items-center space-x-4 text-xs text-gray-500 font-medium">
            <span>Version 2.1.0</span>
            <span>•</span>
            <span>Updated {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="mt-3 text-xs text-gray-500 leading-relaxed font-medium">
        <p>
          Vardhman Mills Ltd. is committed to sustainable manufacturing and ethical business practices.
          All product specifications, certifications, and company information are subject to verification.
          Prices and availability may vary by region and are subject to change without notice.
        </p>
      </div>
    </div>
  );
};

export default Copyright;