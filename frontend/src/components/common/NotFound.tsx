'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

export interface NotFoundProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'illustration' | 'search';
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showSearchSuggestions?: boolean;
  homeUrl?: string;
  searchSuggestions?: string[];
  customActions?: React.ReactNode;
  illustration?: React.ReactNode;
}

const NotFound: React.FC<NotFoundProps> = ({
  className = '',
  variant = 'default',
  title = '404 - Page Not Found',
  message = 'Sorry, the page you are looking for doesn\'t exist or has been moved.',
  showHomeButton = true,
  showBackButton = true,
  showSearchSuggestions = true,
  homeUrl = '/',
  searchSuggestions = [
    'Visit our homepage',
    'Browse our products',
    'Check our latest blog posts',
    'Contact our support team',
  ],
  customActions,
  illustration,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const numberVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 10,
        delay: 0.2,
      },
    },
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  const DefaultIllustration = () => (
    <motion.div
      variants={numberVariants}
      className="relative mb-8"
    >
      <div className="text-8xl md:text-9xl font-bold text-gray-300 dark:text-gray-600 select-none">
        404
      </div>
      <motion.div
        variants={floatingVariants}
        animate="float"
        className="absolute top-0 right-0 transform translate-x-4 -translate-y-4"
      >
        <QuestionMarkCircleIcon className="w-16 h-16 text-blue-400" />
      </motion.div>
      <motion.div
        variants={floatingVariants}
        animate="float"
        style={{ animationDelay: '1s' }}
        className="absolute bottom-0 left-0 transform -translate-x-4 translate-y-4"
      >
        <ExclamationTriangleIcon className="w-12 h-12 text-yellow-400" />
      </motion.div>
    </motion.div>
  );

  const MinimalIllustration = () => (
    <motion.div
      variants={itemVariants}
      className="mb-6"
    >
      <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
        <QuestionMarkCircleIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
      </div>
    </motion.div>
  );

  const SearchIllustration = () => (
    <motion.div
      variants={itemVariants}
      className="mb-8"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center"
        >
          <MagnifyingGlassIcon className="w-16 h-16 text-blue-500 dark:text-blue-400" />
        </motion.div>
        <motion.div
          className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-red-600 dark:text-red-400 text-lg font-bold">!</span>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderIllustration = () => {
    if (illustration) {
      return <motion.div variants={itemVariants}>{illustration}</motion.div>;
    }

    switch (variant) {
      case 'minimal':
        return <MinimalIllustration />;
      case 'search':
        return <SearchIllustration />;
      case 'illustration':
        return illustration || <DefaultIllustration />;
      default:
        return <DefaultIllustration />;
    }
  };

  const renderActions = () => {
    if (customActions) {
      return <motion.div variants={itemVariants}>{customActions}</motion.div>;
    }

    return (
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
        {showHomeButton && (
          <Link href={homeUrl}>
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Go Home
            </motion.button>
          </Link>
        )}
        
        {showBackButton && (
          <motion.button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Go Back
          </motion.button>
        )}
      </motion.div>
    );
  };

  const renderSearchSuggestions = () => {
    if (!showSearchSuggestions || !searchSuggestions.length) return null;

    return (
      <motion.div variants={itemVariants} className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 text-center">
          Try these instead:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
          {searchSuggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              {suggestion}
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const variantClasses = {
    default: 'min-h-screen',
    minimal: 'py-16',
    illustration: 'min-h-screen',
    search: 'py-20',
  };

  return (
    <div className={`flex items-center justify-center ${variantClasses[variant]} ${className}`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center px-4 max-w-2xl mx-auto"
      >
        {renderIllustration()}
        
        <motion.h1
          variants={itemVariants}
          className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
        >
          {title}
        </motion.h1>
        
        <motion.p
          variants={itemVariants}
          className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed"
        >
          {message}
        </motion.p>
        
        {renderActions()}
        
        {renderSearchSuggestions()}
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse" />
        <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full opacity-40 animate-pulse [animation-delay:1s]" />
        <div className="absolute bottom-20 left-20 w-2 h-2 bg-green-400 rounded-full opacity-50 animate-pulse [animation-delay:2s]" />
        <div className="absolute bottom-40 right-10 w-4 h-4 bg-yellow-400 rounded-full opacity-30 animate-pulse [animation-delay:0.5s]" />
      </motion.div>
    </div>
  );
};

export default NotFound;