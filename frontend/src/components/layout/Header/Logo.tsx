'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface LogoProps {
  compact?: boolean;
  showText?: boolean;
  href?: string;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({
  compact = false,
  showText = true,
  href = '/',
  className = '',
  imageClassName = '',
  textClassName = '',
  width = compact ? 32 : 40,
  height = compact ? 32 : 40,
}) => {
  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        delay: 0.1,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1 ${className}`}
    >
      <motion.div
        variants={logoVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="flex items-center space-x-3"
      >
        {/* Logo Image */}
        <div className={`relative ${imageClassName}`}>
          <Image
            src="/images/logo/logo.svg"
            alt="Vardhman Mills"
            width={width}
            height={height}
            className="object-contain"
            priority
          />
        </div>

        {/* Logo Text */}
        {showText && !compact && (
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className={`flex flex-col ${textClassName}`}
          >
            <span className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              Vardhman
            </span>
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400 leading-tight">
              Mills
            </span>
          </motion.div>
        )}

        {/* Compact Text */}
        {showText && compact && (
          <motion.span
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className={`text-lg font-bold text-gray-900 dark:text-white ${textClassName}`}
          >
            VM
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
};

export default Logo;