'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline';

export interface ErrorPageProps {
  errorCode?: string | number;
  title?: string;
  message?: string;
  className?: string;
  variant?: 'default' | 'minimal' | 'detailed';
  showContactSupport?: boolean;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  homeUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
  customActions?: React.ReactNode;
  illustration?: React.ReactNode;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  errorCode = '500',
  title = 'Something went wrong',
  message = 'We\'re experiencing some technical difficulties. Please try again later.',
  className = '',
  variant = 'default',
  showContactSupport = true,
  showBackButton = true,
  showHomeButton = true,
  homeUrl = '/',
  supportEmail = 'support@example.com',
  supportPhone = '+1 (555) 123-4567',
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

  const DefaultIllustration = () => (
    <motion.div
      variants={numberVariants}
      className="relative mb-8"
    >
      <div className="text-6xl md:text-8xl font-bold text-gray-300 dark:text-gray-600 select-none">
        {errorCode}
      </div>
      <motion.div
        animate={{
          y: [-5, 5, -5],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        }}
        className="absolute -top-4 -right-4"
      >
        <ExclamationTriangleIcon className="w-12 h-12 text-red-400" />
      </motion.div>
    </motion.div>
  );

  const renderIllustration = () => {
    if (illustration) {
      return <motion.div variants={itemVariants}>{illustration}</motion.div>;
    }

    switch (variant) {
      case 'minimal':
        return (
          <motion.div variants={itemVariants} className="mb-6">
            <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
            </div>
          </motion.div>
        );
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

  const renderContactSupport = () => {
    if (!showContactSupport) return null;

    return (
      <motion.div
        variants={itemVariants}
        className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="text-center">
          <LifebuoyIcon className="w-8 h-8 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Need Help?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            If this problem persists, please don&apos;t hesitate to contact our support team.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href={`mailto:${supportEmail}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              whileHover={{ scale: 1.02 }}
            >
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              {supportEmail}
            </motion.a>
            
            <motion.a
              href={`tel:${supportPhone}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              whileHover={{ scale: 1.02 }}
            >
              <PhoneIcon className="w-4 h-4 mr-2" />
              {supportPhone}
            </motion.a>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderDetailedInfo = () => {
    if (variant !== 'detailed') return null;

    return (
      <motion.div
        variants={itemVariants}
        className="mt-8 text-left max-w-md mx-auto"
      >
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          What can you do?
        </h4>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0" />
            Refresh the page and try again
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0" />
            Check your internet connection
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0" />
            Clear your browser cache and cookies
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0" />
            Contact support if the problem continues
          </li>
        </ul>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 ${className}`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-lg mx-auto"
      >
        {renderIllustration()}
        
        <motion.h1
          variants={itemVariants}
          className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4"
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
        
        {renderDetailedInfo()}
        
        {renderContactSupport()}
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse" />
        <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full opacity-40 animate-pulse [animation-delay:1s]" />
        <div className="absolute bottom-20 left-20 w-2 h-2 bg-green-400 rounded-full opacity-50 animate-pulse [animation-delay:2s]" />
        <div className="absolute bottom-40 right-10 w-4 h-4 bg-yellow-400 rounded-full opacity-30 animate-pulse [animation-delay:0.5s]" />
      </motion.div>
    </div>
  );
};

export default ErrorPage;