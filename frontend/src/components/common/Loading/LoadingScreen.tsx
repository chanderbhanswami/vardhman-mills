'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface LoadingScreenProps {
  show?: boolean;
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'gray' | 'indigo';
  overlay?: boolean;
  message?: string;
  children?: React.ReactNode;
  className?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  show = true,
  variant = 'spinner',
  size = 'md',
  color = 'blue',
  overlay = true,
  message,
  children,
  className = '',
}) => {
  if (!show) return null;

  const colorClasses = {
    blue: 'text-blue-500 border-blue-500',
    green: 'text-green-500 border-green-500',
    red: 'text-red-500 border-red-500',
    gray: 'text-gray-500 border-gray-500',
    indigo: 'text-indigo-500 border-indigo-500',
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const renderSpinner = () => (
    <motion.div
      className={`border-4 border-t-transparent rounded-full ${colorClasses[color]} ${sizeClasses[size]}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`w-3 h-3 rounded-full ${colorClasses[color].split(' ')[0]} bg-current`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <motion.div
      className={`w-16 h-16 rounded-full ${colorClasses[color].split(' ')[0]} bg-current`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 0.3, 0.7],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
    />
  );

  const renderBars = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={`w-2 rounded-full ${colorClasses[color].split(' ')[0]} bg-current`}
          animate={{
            height: ['16px', '32px', '16px'],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'bars':
        return renderBars();
      case 'custom':
        return children;
      default:
        return renderSpinner();
    }
  };

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center space-y-4"
    >
      {renderLoader()}
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm font-medium ${colorClasses[color].split(' ')[0]}`}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );

  if (overlay) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      {content}
    </div>
  );
};

export default LoadingScreen;
