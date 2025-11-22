'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'red' | 'gray' | 'indigo' | 'purple' | 'pink';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bounce' | 'wave';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  variant = 'spinner',
  speed = 'normal',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    blue: 'text-blue-500 border-blue-500',
    green: 'text-green-500 border-green-500',
    red: 'text-red-500 border-red-500',
    gray: 'text-gray-500 border-gray-500',
    indigo: 'text-indigo-500 border-indigo-500',
    purple: 'text-purple-500 border-purple-500',
    pink: 'text-pink-500 border-pink-500',
  };

  const speedSettings = {
    slow: 1.5,
    normal: 1,
    fast: 0.5,
  };

  const duration = speedSettings[speed];

  const renderSpinner = () => (
    <motion.div
      className={`border-2 border-t-transparent rounded-full ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    />
  );

  const renderDots = () => {
    const dotSize = {
      xs: 'w-1 h-1',
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
    };

    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`rounded-full ${colorClasses[color].split(' ')[0]} bg-current ${dotSize[size]}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    );
  };

  const renderPulse = () => (
    <motion.div
      className={`rounded-full ${colorClasses[color].split(' ')[0]} bg-current ${sizeClasses[size]} ${className}`}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [1, 0.3, 1],
      }}
      transition={{
        duration: duration * 1.5,
        repeat: Infinity,
      }}
    />
  );

  const renderBounce = () => {
    const dotSize = {
      xs: 'w-1 h-1',
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
    };

    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`rounded-full ${colorClasses[color].split(' ')[0]} bg-current ${dotSize[size]}`}
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    );
  };

  const renderWave = () => {
    const barWidth = {
      xs: 'w-0.5',
      sm: 'w-1',
      md: 'w-1.5',
      lg: 'w-2',
      xl: 'w-3',
    };

    const barHeight = {
      xs: 'h-4',
      sm: 'h-6',
      md: 'h-8',
      lg: 'h-12',
      xl: 'h-16',
    };

    return (
      <div className={`flex space-x-1 items-end ${className}`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={`${barWidth[size]} ${barHeight[size]} ${colorClasses[color].split(' ')[0]} bg-current rounded-t`}
            animate={{
              scaleY: [0.3, 1, 0.3],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: i * 0.1,
            }}
            style={{ transformOrigin: 'bottom' }}
          />
        ))}
      </div>
    );
  };

  switch (variant) {
    case 'dots':
      return renderDots();
    case 'pulse':
      return renderPulse();
    case 'bounce':
      return renderBounce();
    case 'wave':
      return renderWave();
    default:
      return renderSpinner();
  }
};

export default LoadingSpinner;
