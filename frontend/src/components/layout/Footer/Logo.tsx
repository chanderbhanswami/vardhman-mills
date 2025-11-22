'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface FooterLogoProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'compact';
  showTagline?: boolean;
  linkToHome?: boolean;
}

const FooterLogo: React.FC<FooterLogoProps> = ({
  className = '',
  variant = 'default',
  showTagline = true,
  linkToHome = true,
}) => {
  const logoVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const logoContent = (
    <motion.div
      variants={logoVariants}
      whileHover="hover"
      whileTap="tap"
      className={`flex items-center ${variant === 'minimal' ? 'justify-center' : ''}`}
    >
      <div className="relative">
        <Image
          src="/logo.png"
          alt="Vardhman Mills"
          width={variant === 'compact' ? 32 : variant === 'minimal' ? 40 : 48}
          height={variant === 'compact' ? 32 : variant === 'minimal' ? 40 : 48}
          className={`
            ${variant === 'compact' ? 'w-8 h-8' : variant === 'minimal' ? 'w-10 h-10' : 'w-12 h-12'}
            transition-all duration-200
          `}
          priority
        />
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-blue-500 opacity-20 blur-md rounded-full scale-150 group-hover:opacity-30 transition-opacity duration-300" />
      </div>
      
      <div className={`ml-3 ${variant === 'minimal' ? 'text-center' : ''}`}>
        <h2 className={`
          font-bold text-gray-900 dark:text-white
          ${variant === 'compact' ? 'text-lg' : variant === 'minimal' ? 'text-xl' : 'text-2xl'}
        `}>
          Vardhman Mills
        </h2>
        
        {showTagline && (
          <p className={`
            text-gray-600 dark:text-gray-400 font-medium
            ${variant === 'compact' ? 'text-xs' : variant === 'minimal' ? 'text-sm' : 'text-sm'}
          `}>
            Premium Textiles Since 1965
          </p>
        )}
        
        {variant === 'default' && (
          <div className="flex items-center mt-1 space-x-2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-yellow-400 rounded-full"
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Trusted Quality
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (linkToHome) {
    return (
      <Link
        href="/"
        className={`group block ${className}`}
        aria-label="Vardhman Mills - Home"
      >
        {logoContent}
      </Link>
    );
  }

  return (
    <div className={`${className}`}>
      {logoContent}
    </div>
  );
};

export default FooterLogo;