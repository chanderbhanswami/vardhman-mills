'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export interface NewsletterFormProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'sidebar' | 'popup';
  showName?: boolean;
  showPreferences?: boolean;
  onSubscribe?: (data: NewsletterFormData) => void;
  compact?: boolean;
  title?: string;
  description?: string;
}

export interface NewsletterFormData {
  email: string;
  firstName?: string;
  lastName?: string;
  preferences?: string[];
  source?: string;
}

interface FormState {
  email: string;
  firstName: string;
  lastName: string;
  preferences: string[];
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

const preferenceOptions = [
  { id: 'products', label: 'New Products', description: 'Latest fabric collections and textile innovations' },
  { id: 'deals', label: 'Special Offers', description: 'Exclusive discounts and promotional deals' },
  { id: 'industry', label: 'Industry News', description: 'Textile industry trends and market updates' },
  { id: 'sustainability', label: 'Sustainability', description: 'Eco-friendly practices and sustainable textiles' },
  { id: 'events', label: 'Events & Trade Shows', description: 'Upcoming exhibitions and industry events' },
];

const NewsletterForm: React.FC<NewsletterFormProps> = ({
  className = '',
  variant = 'default',
  showName = true,
  showPreferences = false,
  onSubscribe,
  compact = false,
  title,
  description,
}) => {
  const [formState, setFormState] = useState<FormState>({
    email: '',
    firstName: '',
    lastName: '',
    preferences: [],
    isLoading: false,
    isSuccess: false,
    error: null,
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: keyof FormState, value: string | string[]) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
      error: null
    }));
  };

  const handlePreferenceToggle = (preferenceId: string) => {
    setFormState(prev => ({
      ...prev,
      preferences: prev.preferences.includes(preferenceId)
        ? prev.preferences.filter(id => id !== preferenceId)
        : [...prev.preferences, preferenceId],
      error: null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(formState.email)) {
      setFormState(prev => ({ ...prev, error: 'Please enter a valid email address' }));
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const subscriptionData: NewsletterFormData = {
        email: formState.email,
        firstName: formState.firstName || undefined,
        lastName: formState.lastName || undefined,
        preferences: formState.preferences.length > 0 ? formState.preferences : undefined,
        source: 'website-footer'
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onSubscribe) {
        onSubscribe(subscriptionData);
      }
      
      setFormState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isSuccess: true,
        email: '',
        firstName: '',
        lastName: '',
        preferences: []
      }));
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setFormState(prev => ({ ...prev, isSuccess: false }));
      }, 3000);
      
    } catch {
      setFormState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Something went wrong. Please try again.' 
      }));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
    loading: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`${className}`}>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <input
              type="email"
              value={formState.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={formState.isLoading}
              required
            />
          </div>
          <motion.button
            type="submit"
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            animate={formState.isLoading ? "loading" : "idle"}
            disabled={formState.isLoading || formState.isSuccess}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formState.isLoading ? 'Subscribing...' : formState.isSuccess ? 'Subscribed!' : 'Subscribe'}
          </motion.button>
        </form>
        
        {formState.error && (
          <div className="mt-2 flex items-center text-red-600 dark:text-red-400 text-sm">
            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
            {formState.error}
          </div>
        )}
        
        {formState.isSuccess && (
          <div className="mt-2 flex items-center text-green-600 dark:text-green-400 text-sm">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Welcome to our newsletter! Check your email for confirmation.
          </div>
        )}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <motion.div
        className={`${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title || 'Stay Updated'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description || 'Get the latest news and exclusive offers delivered to your inbox.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div variants={itemVariants}>
            <input
              type="email"
              value={formState.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Your email address"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={formState.isLoading}
              required
            />
          </motion.div>
          
          <motion.button
            type="submit"
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            animate={formState.isLoading ? "loading" : "idle"}
            disabled={formState.isLoading || formState.isSuccess}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formState.isLoading ? 'Subscribing...' : formState.isSuccess ? 'Subscribed!' : 'Subscribe Now'}
          </motion.button>
        </form>
        
        {formState.error && (
          <motion.div 
            className="mt-3 flex items-center text-red-600 dark:text-red-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
            {formState.error}
          </motion.div>
        )}
        
        {formState.isSuccess && (
          <motion.div 
            className="mt-3 flex items-center text-green-600 dark:text-green-400 text-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Welcome to our newsletter!
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-6" variants={itemVariants}>
        <div className="flex items-center mb-3">
          <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {title || 'Join Our Newsletter'}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {description || 'Be the first to know about new collections, exclusive deals, and industry insights. Join 50,000+ textile professionals.'}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        {showName && (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={itemVariants}>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formState.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="First Name"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={formState.isLoading}
              />
            </div>
            <div>
              <input
                type="text"
                value={formState.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Last Name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={formState.isLoading}
              />
            </div>
          </motion.div>
        )}

        {/* Email Field */}
        <motion.div className="relative" variants={itemVariants}>
          <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={formState.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Your email address"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={formState.isLoading}
            required
          />
        </motion.div>

        {/* Preferences */}
        {showPreferences && (
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              What interests you? (Optional)
            </h4>
            <div className="space-y-2">
              {preferenceOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formState.preferences.includes(option.id)}
                    onChange={() => handlePreferenceToggle(option.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={formState.isLoading}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div variants={itemVariants}>
          <motion.button
            type="submit"
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            animate={formState.isLoading ? "loading" : "idle"}
            disabled={formState.isLoading || formState.isSuccess}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              {formState.isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Subscribing...
                </>
              ) : formState.isSuccess ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Subscribed!
                </>
              ) : (
                <>
                  <EnvelopeIcon className="w-5 h-5 mr-2" />
                  Subscribe to Newsletter
                </>
              )}
            </div>
          </motion.button>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div 
          className="text-xs text-gray-500 dark:text-gray-400 text-center"
          variants={itemVariants}
        >
          By subscribing, you agree to our{' '}
          <a href="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">
            Privacy Policy
          </a>
          {' '}and consent to receive marketing emails. You can unsubscribe at any time.
        </motion.div>
      </form>

      {/* Error Message */}
      {formState.error && (
        <motion.div 
          className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-700 dark:text-red-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
          {formState.error}
        </motion.div>
      )}

      {/* Success Message */}
      {formState.isSuccess && (
        <motion.div 
          className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center text-green-700 dark:text-green-400 mb-2">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            <span className="font-semibold">Welcome to our newsletter!</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">
            Thank you for subscribing. We&apos;ve sent a confirmation email to {formState.email}. 
            Please check your inbox and click the confirmation link to complete your subscription.
          </p>
        </motion.div>
      )}

      {/* Benefits */}
      {!compact && (
        <motion.div 
          className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          variants={itemVariants}
        >
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Newsletter Benefits:
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Exclusive access to new collections</li>
            <li>• Industry insights and trends</li>
            <li>• Special subscriber-only discounts</li>
            <li>• Early access to sales and events</li>
            <li>• Textile innovation updates</li>
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NewsletterForm;