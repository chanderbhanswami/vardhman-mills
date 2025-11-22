'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'avatar' | 'card' | 'list' | 'table';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 3,
  animate = true,
  rounded = 'md',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const animationProps = animate ? {
    animate: {
      opacity: [0.5, 1, 0.5],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
    }
  } : {};

  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;
    return style;
  };

  const renderText = () => (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          className={`h-4 ${baseClasses} ${roundedClasses[rounded]}`}
          style={{
            width: index === lines - 1 ? '75%' : '100%',
            ...getStyle(),
          }}
          {...animationProps}
        />
      ))}
    </div>
  );

  const renderRectangular = () => (
    <motion.div
      className={`${baseClasses} ${roundedClasses[rounded]} ${className}`}
      style={{
        width: width || '100%',
        height: height || '200px',
        ...getStyle(),
      }}
      {...animationProps}
    />
  );

  const renderCircular = () => (
    <motion.div
      className={`${baseClasses} rounded-full ${className}`}
      style={{
        width: width || height || '48px',
        height: height || width || '48px',
        ...getStyle(),
      }}
      {...animationProps}
    />
  );

  const renderAvatar = () => (
    <div className={`flex items-center space-x-3 ${className}`}>
      <motion.div
        className={`w-12 h-12 ${baseClasses} rounded-full`}
        {...animationProps}
      />
      <div className="flex-1 space-y-2">
        <motion.div
          className={`h-4 w-3/4 ${baseClasses} ${roundedClasses[rounded]}`}
          {...animationProps}
        />
        <motion.div
          className={`h-3 w-1/2 ${baseClasses} ${roundedClasses[rounded]}`}
          {...animationProps}
        />
      </div>
    </div>
  );

  const renderCard = () => (
    <div className={`${roundedClasses[rounded]} overflow-hidden ${className}`}>
      <motion.div
        className={`h-48 w-full ${baseClasses}`}
        {...animationProps}
      />
      <div className="p-4 space-y-3">
        <motion.div
          className={`h-6 w-3/4 ${baseClasses} ${roundedClasses[rounded]}`}
          {...animationProps}
        />
        <div className="space-y-2">
          <motion.div
            className={`h-4 w-full ${baseClasses} ${roundedClasses[rounded]}`}
            {...animationProps}
          />
          <motion.div
            className={`h-4 w-5/6 ${baseClasses} ${roundedClasses[rounded]}`}
            {...animationProps}
          />
          <motion.div
            className={`h-4 w-2/3 ${baseClasses} ${roundedClasses[rounded]}`}
            {...animationProps}
          />
        </div>
        <div className="flex justify-between items-center">
          <motion.div
            className={`h-4 w-1/4 ${baseClasses} ${roundedClasses[rounded]}`}
            {...animationProps}
          />
          <motion.div
            className={`h-8 w-20 ${baseClasses} ${roundedClasses[rounded]}`}
            {...animationProps}
          />
        </div>
      </div>
    </div>
  );

  const renderList = () => (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          <motion.div
            className={`w-10 h-10 ${baseClasses} rounded-full`}
            {...animationProps}
          />
          <div className="flex-1 space-y-2">
            <motion.div
              className={`h-4 w-3/4 ${baseClasses} ${roundedClasses[rounded]}`}
              {...animationProps}
            />
            <motion.div
              className={`h-3 w-1/2 ${baseClasses} ${roundedClasses[rounded]}`}
              {...animationProps}
            />
          </div>
          <motion.div
            className={`h-6 w-16 ${baseClasses} ${roundedClasses[rounded]}`}
            {...animationProps}
          />
        </div>
      ))}
    </div>
  );

  const renderTable = () => (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            className={`h-6 ${baseClasses} ${roundedClasses[rounded]}`}
            {...animationProps}
          />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: lines }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, colIndex) => (
            <motion.div
              key={colIndex}
              className={`h-4 ${baseClasses} ${roundedClasses[rounded]}`}
              {...animationProps}
            />
          ))}
        </div>
      ))}
    </div>
  );

  switch (variant) {
    case 'rectangular':
      return renderRectangular();
    case 'circular':
      return renderCircular();
    case 'avatar':
      return renderAvatar();
    case 'card':
      return renderCard();
    case 'list':
      return renderList();
    case 'table':
      return renderTable();
    default:
      return renderText();
  }
};

export default SkeletonLoader;
