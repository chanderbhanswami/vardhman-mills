'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface CompanyInfoProps {
  className?: string;
  variant?: 'default' | 'minimal';
  showLogo?: boolean;
  showDescription?: boolean;
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({
  className = '',
  variant = 'default',
  showLogo = true,
  showDescription = true,
}) => {
  const logoVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {showLogo && (
          <motion.div
            variants={logoVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Vardhman Mills"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
                Vardhman Mills
              </span>
            </Link>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Logo and Company Name */}
      {showLogo && (
        <motion.div
          variants={logoVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Vardhman Mills"
              width={48}
              height={48}
              className="w-12 h-12"
            />
            <div className="ml-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Vardhman Mills
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Premium Textiles Since 1965
              </p>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Company Description */}
      {showDescription && (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Leading manufacturer and exporter of premium quality fabrics, yarns, and textile products. 
            Committed to sustainability, innovation, and excellence in every thread.
          </p>
          
          {/* Key Features */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span>ISO 9001:2015 Certified</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span>OEKO-TEX Standard 100</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span>Sustainable Manufacturing</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span>Global Export Network</span>
            </div>
          </div>
        </div>
      )}

      {/* Company Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">58+</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Years Experience</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">50+</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Countries Served</div>
        </div>
      </div>

      {/* Awards and Recognition */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Awards & Recognition
        </h4>
        <div className="space-y-1">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            • Best Textile Exporter Award 2023
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            • Sustainability Excellence Award 2022
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            • Innovation in Manufacturing 2021
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfo;