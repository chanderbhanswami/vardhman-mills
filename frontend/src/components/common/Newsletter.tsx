'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  GiftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { EnvelopeIcon as EnvelopeIconSolid } from '@heroicons/react/24/solid';

export interface NewsletterProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'card' | 'inline' | 'modal';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showBenefits?: boolean;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  benefits?: string[];
  onSubscribe?: (email: string) => Promise<boolean>;
  onClose?: () => void;
}

type SubscriptionState = 'idle' | 'loading' | 'success' | 'error';

const Newsletter: React.FC<NewsletterProps> = ({
  className = '',
  variant = 'default',
  size = 'md',
  showIcon = true,
  showBenefits = true,
  title = 'Stay Updated',
  subtitle = 'Subscribe to our newsletter for the latest updates and exclusive offers.',
  placeholder = 'Enter your email address',
  buttonText = 'Subscribe',
  benefits = [
    'Exclusive product updates',
    'Special offers and discounts',
    'Industry insights and trends',
    'Early access to new features',
  ],
  onSubscribe,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrorMessage('Email address is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setSubscriptionState('loading');
    setErrorMessage('');

    try {
      if (onSubscribe) {
        const success = await onSubscribe(email);
        if (success) {
          setSubscriptionState('success');
          setEmail('');
        } else {
          setSubscriptionState('error');
          setErrorMessage('Subscription failed. Please try again.');
        }
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSubscriptionState('success');
        setEmail('');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setSubscriptionState('error');
      setErrorMessage('Something went wrong. Please try again later.');
    }

    // Reset state after 3 seconds
    if (subscriptionState !== 'success') {
      setTimeout(() => {
        setSubscriptionState('idle');
        setErrorMessage('');
      }, 3000);
    }
  }, [email, onSubscribe, subscriptionState]);

  const sizeClasses = {
    sm: {
      container: 'p-4',
      title: 'text-lg font-semibold',
      subtitle: 'text-sm',
      input: 'text-sm px-3 py-2',
      button: 'text-sm px-4 py-2',
      icon: 'w-5 h-5',
    },
    md: {
      container: 'p-6',
      title: 'text-xl font-bold',
      subtitle: 'text-base',
      input: 'text-base px-4 py-3',
      button: 'text-base px-6 py-3',
      icon: 'w-6 h-6',
    },
    lg: {
      container: 'p-8',
      title: 'text-2xl font-bold',
      subtitle: 'text-lg',
      input: 'text-lg px-5 py-4',
      button: 'text-lg px-8 py-4',
      icon: 'w-8 h-8',
    },
  };

  const variantClasses = {
    default: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-100 dark:border-gray-600 rounded-xl',
    minimal: 'bg-transparent',
    card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg',
    inline: 'bg-gray-50 dark:bg-gray-800 rounded-lg',
    modal: 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md mx-auto',
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const successVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const renderIcon = () => {
    if (!showIcon) return null;

    const iconClass = `${sizeClasses[size].icon} mx-auto mb-4`;

    switch (subscriptionState) {
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'error':
        return <ExclamationCircleIcon className={`${iconClass} text-red-500`} />;
      default:
        return (
          <div className="relative mb-4">
            <EnvelopeIconSolid className={`${iconClass} text-blue-500`} />
            <SparklesIcon className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
          </div>
        );
    }
  };

  const renderContent = () => {
    if (subscriptionState === 'success') {
      return (
        <motion.div
          variants={successVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <CheckCircleIcon className={`${sizeClasses[size].icon} mx-auto mb-4 text-green-500`} />
          <h3 className={`${sizeClasses[size].title} text-green-700 dark:text-green-400 mb-2`}>
            Thank You!
          </h3>
          <p className={`${sizeClasses[size].subtitle} text-green-600 dark:text-green-300`}>
            You&apos;ve been successfully subscribed to our newsletter.
          </p>
          <motion.div
            className="mt-4 flex items-center justify-center text-green-600 dark:text-green-400"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <GiftIcon className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Check your inbox for a welcome gift!</span>
          </motion.div>
        </motion.div>
      );
    }

    return (
      <>
        <motion.div variants={itemVariants} className="text-center mb-6">
          {renderIcon()}
          <h3 className={`${sizeClasses[size].title} text-gray-900 dark:text-white mb-2`}>
            {title}
          </h3>
          <p className={`${sizeClasses[size].subtitle} text-gray-600 dark:text-gray-300`}>
            {subtitle}
          </p>
        </motion.div>

        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className={`
                w-full ${sizeClasses[size].input}
                border border-gray-300 dark:border-gray-600
                rounded-lg bg-white dark:bg-gray-700
                text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200
                ${errorMessage ? 'border-red-500 focus:ring-red-500' : ''}
              `}
              disabled={subscriptionState === 'loading'}
            />
            <EnvelopeIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm flex items-center gap-2"
            >
              <ExclamationCircleIcon className="w-4 h-4" />
              {errorMessage}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={subscriptionState === 'loading'}
            className={`
              w-full ${sizeClasses[size].button}
              bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
              text-white font-medium rounded-lg
              transition-all duration-200
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:cursor-not-allowed
              relative overflow-hidden
            `}
            whileHover={{ scale: subscriptionState === 'loading' ? 1 : 1.02 }}
            whileTap={{ scale: subscriptionState === 'loading' ? 1 : 0.98 }}
          >
            <AnimatePresence mode="wait">
              {subscriptionState === 'loading' ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2"
                >
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Subscribing...
                </motion.div>
              ) : (
                <motion.span
                  key="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {buttonText}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.form>

        {showBenefits && benefits.length > 0 && (
          <motion.div variants={itemVariants} className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
              What you&apos;ll get:
            </h4>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                >
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {benefit}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`
        relative
        ${variantClasses[variant]}
        ${sizeClasses[size].container}
        ${className}
      `}
    >
      {variant === 'modal' && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          aria-label="Close newsletter signup"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}

      {renderContent()}

      {/* Decorative elements */}
      {variant === 'default' && (
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-10 blur-xl" />
      )}
      
      {variant === 'card' && (
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full opacity-5 blur-2xl transform translate-y-1/2 -translate-x-1/2" />
      )}
    </motion.div>
  );
};

export default Newsletter;