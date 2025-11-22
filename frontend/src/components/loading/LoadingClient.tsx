"use client";
import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
  SparklesIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';

// Import utilities
import { cn } from '@/lib/utils';

type LoadingVariant = 'spinner' | 'dots' | 'bars' | 'pulse' | 'skeleton' | 'branded' | 'minimal';

interface LoadingProps {
  variant?: LoadingVariant;
  message?: string;
  showProgress?: boolean;
  fullScreen?: boolean;
}

const SpinnerLoading: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="relative w-16 h-16"
      >
        <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full" />
      </motion.div>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-600 dark:text-gray-400 text-center"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

const DotsLoading: React.FC<{ message?: string }> = ({ message }) => {
  const dotVariants = { initial: { y: 0 }, animate: { y: -10 } };
  const containerVariants = { animate: { transition: { staggerChildren: 0.15, repeat: Infinity, repeatDelay: 0.3 } } };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <motion.div variants={containerVariants} initial="initial" animate="animate" className="flex gap-3">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            variants={dotVariants}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            className="w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full"
          />
        ))}
      </motion.div>
      {message && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {message}
        </motion.p>
      )}
    </div>
  );
};

const BarsLoading: React.FC<{ message?: string }> = ({ message }) => {
  const barVariants = { animate: (i: number) => ({ scaleY: [1, 2, 1], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' as const, delay: i * 0.15 } }) };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="flex items-end gap-2 h-16">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div key={index} custom={index} variants={barVariants} animate="animate" className="w-2 h-8 bg-blue-600 dark:bg-blue-400 rounded-full origin-bottom" />
        ))}
      </div>
      {message && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {message}
        </motion.p>
      )}
    </div>
  );
};

const PulseLoading: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{ scale: [1, 2, 2, 1], opacity: [0.5, 0, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 rounded-full"
          />
        ))}
        <div className="relative w-12 h-12 bg-blue-600 dark:bg-blue-400 rounded-full" />
      </div>
      {message && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {message}
        </motion.p>
      )}
    </div>
  );
};

const SkeletonLoadingView: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {message && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
          {message}
        </motion.p>
      )}
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BrandedLoading: React.FC<{ message?: string }> = ({ message }) => {
  const iconVariants = { animate: { scale: [1, 1.2, 1], rotate: [0, 180, 360], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const } } };
  const textVariants = { animate: { opacity: [0.5, 1, 0.5], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const } } };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <motion.div variants={iconVariants} animate="animate" className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
          <SwatchIcon className="w-12 h-12 text-white" />
        </div>

        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="absolute inset-0">
          <SparklesIcon className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 text-yellow-400" />
        </motion.div>
      </motion.div>

      <motion.div variants={textVariants} animate="animate" className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Vardhman Textiles</h2>
        {message && <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>}
      </motion.div>

      <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} className="h-full w-1/2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      </div>
    </div>
  );
};

const MinimalLoading: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <ArrowPathIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
      </motion.div>
      {message && <p className="text-xs text-gray-500 dark:text-gray-500 text-center">{message}</p>}
    </div>
  );
};

export default function LoadingClient({ variant = 'branded', message = 'Loading...', showProgress = false, fullScreen = true }: LoadingProps = {}) {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const activeVariant = prefersReducedMotion ? 'minimal' : variant;
  const displayProgress = showProgress && activeVariant === 'branded';
  const renderLoadingVariant = () => {
    const messageWithProgress = displayProgress ? `${message} Please wait...` : message;
    switch (activeVariant) {
      case 'spinner':
        return <SpinnerLoading message={messageWithProgress} />;
      case 'dots':
        return <DotsLoading message={messageWithProgress} />;
      case 'bars':
        return <BarsLoading message={messageWithProgress} />;
      case 'pulse':
        return <PulseLoading message={messageWithProgress} />;
      case 'skeleton':
        return <SkeletonLoadingView message={messageWithProgress} />;
      case 'branded':
        return <BrandedLoading message={messageWithProgress} />;
      case 'minimal':
        return <MinimalLoading message={messageWithProgress} />;
      default:
        return <BrandedLoading message={messageWithProgress} />;
    }
  };

  return (
    <div className={cn('flex items-center justify-center bg-white dark:bg-gray-900', fullScreen ? 'min-h-screen' : 'min-h-[400px]', 'transition-colors duration-200')} role="status" aria-live="polite" aria-label="Loading content">
      <div className="w-full">
        {renderLoadingVariant()}
      </div>
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
}

export function SpinnerLoaderPage() {
  return <LoadingClient variant="spinner" message="Loading page..." />;
}

export function ProductsLoader() {
  return <LoadingClient variant="skeleton" message="Loading products..." />;
}

export function CheckoutLoader() {
  return <LoadingClient variant="branded" message="Preparing checkout..." />;
}

export function MinimalLoader() {
  return <LoadingClient variant="minimal" />;
}
