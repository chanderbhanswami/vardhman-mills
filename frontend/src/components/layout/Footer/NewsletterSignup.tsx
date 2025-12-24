'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NewsletterForm, { NewsletterFormData } from '@/components/forms/NewsletterForm/NewsletterForm';
import NewsletterPreferences, { PreferenceData } from '@/components/forms/NewsletterForm/NewsletterPreferences';
import {
  EnvelopeIcon,
  CogIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  UserGroupIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export interface NewsletterSignupProps {
  className?: string;
  variant?: 'default' | 'modal' | 'sidebar' | 'inline';
  showSteps?: boolean;
  showStats?: boolean;
  onComplete?: (data: unknown) => void;
}

interface SignupStep {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const signupSteps: SignupStep[] = [
  {
    id: 'basic',
    label: 'Basic Info',
    icon: EnvelopeIcon,
    description: 'Enter your email and name'
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: CogIcon,
    description: 'Customize your newsletter'
  },
];

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  className = '',
  variant = 'default',
  showSteps = true,
  showStats = true,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<'basic' | 'preferences'>('basic');
  const [formData, setFormData] = useState<NewsletterFormData | null>(null);
  const [preferences, setPreferences] = useState<PreferenceData | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Validation: check if at least one category and one notification channel is selected
  const isPreferencesValid = preferences &&
    preferences.categories.length > 0 &&
    (preferences.notifications.email || preferences.notifications.sms || preferences.notifications.push);

  const handleFormSubmit = (data: NewsletterFormData) => {
    setFormData(data);
    if (showSteps) {
      setCurrentStep('preferences');
    } else {
      // Complete immediately if not showing steps
      handleComplete(data);
    }
  };

  const handlePreferencesChange = (prefs: PreferenceData) => {
    setPreferences(prefs);
  };

  const handleComplete = (data?: NewsletterFormData) => {
    const finalData = data || formData;
    if (finalData) {
      setIsCompleted(true);
      // Complete signup with appropriate data type
      if (preferences) {
        // Type assertion to handle the complex union type
        const dataWithPreferences = {
          email: finalData.email,
          firstName: finalData.firstName,
          lastName: finalData.lastName,
          source: finalData.source,
          preferences: preferences
        } as NewsletterFormData & { preferences: PreferenceData };
        onComplete?.(dataWithPreferences);
      } else {
        // Standard form data
        const standardData = {
          email: finalData.email,
          firstName: finalData.firstName,
          lastName: finalData.lastName,
          source: finalData.source,
          preferences: finalData.preferences
        } as NewsletterFormData;
        onComplete?.(standardData);
      }
    }
  };

  const handleBackToBasic = () => {
    setCurrentStep('basic');
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

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.3 }
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.2
      }
    }
  };

  if (variant === 'sidebar') {
    return (
      <motion.div
        className={`${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <EnvelopeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Newsletter
            </h3>
          </div>
          <p className="text-sm text-gray-900 dark:text-gray-300">
            Stay updated with our latest collections and industry insights.
          </p>
        </div>

        <NewsletterForm
          variant="sidebar"
          showName={false}
          showPreferences={false}
          onSubscribe={handleFormSubmit}
        />
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <motion.div
        className={`${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <NewsletterForm
          variant="minimal"
          showName={false}
          showPreferences={false}
          onSubscribe={handleFormSubmit}
          compact
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`max-w-2xl mx-auto ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <EnvelopeIcon className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-black dark:text-white mb-2">
          Join Our Newsletter
        </h2>
        <p className="text-black dark:text-gray-100 font-medium">
          Get exclusive access to new collections, industry insights, and special offers.
        </p>
      </div>

      {/* Stats */}
      {showStats && (
        <motion.div
          className="grid grid-cols-3 gap-4 mb-8"
          variants={statsVariants}
        >
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <UserGroupIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-black dark:text-white">50K+</div>
            <div className="text-xs text-black dark:text-gray-200 font-medium">Subscribers</div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <SparklesIcon className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-black dark:text-white">98%</div>
            <div className="text-xs text-black dark:text-gray-200 font-medium">Satisfaction</div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <EnvelopeIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-black dark:text-white">Weekly</div>
            <div className="text-xs text-black dark:text-gray-200 font-medium">Updates</div>
          </div>
        </motion.div>
      )}

      {/* Progress Steps */}
      {showSteps && (
        <div className="flex items-center justify-center mb-8">
          {signupSteps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted =
              (step.id === 'basic' && formData) ||
              (step.id === 'preferences' && preferences);
            const IconComponent = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                  ${isActive
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : isCompleted
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-400'
                  }
                `}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="ml-3 mr-8">
                  <div className={`text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-black dark:text-gray-300'
                    }`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-black dark:text-gray-400">
                    {step.description}
                  </div>
                </div>
                {index < signupSteps.length - 1 && (
                  <ChevronRightIcon className="w-4 h-4 text-gray-400 mr-8" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <AnimatePresence mode="wait">
          {currentStep === 'basic' && (
            <motion.div
              key="basic"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <NewsletterForm
                variant="default"
                showName={true}
                showPreferences={false}
                onSubscribe={handleFormSubmit}
                title={showSteps ? "Let's start with your basic information" : undefined}
                description={showSteps ? "We'll use this to personalize your newsletter experience." : undefined}
              />
            </motion.div>
          )}

          {currentStep === 'preferences' && (
            <motion.div
              key="preferences"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Customize Your Newsletter
                </h3>
                <p className="text-gray-600">
                  Choose what you&apos;d like to hear about and how often.
                </p>
              </div>

              <NewsletterPreferences
                onPreferencesChange={handlePreferencesChange}
                showFrequency={true}
                showLanguage={true}
                showFormat={true}
              />

              <div className="flex justify-between mt-8">
                <button
                  onClick={handleBackToBasic}
                  className="flex items-center px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-2" />
                  Back
                </button>

                <motion.button
                  onClick={() => handleComplete()}
                  disabled={!isPreferencesValid}
                  className={`px-8 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 ${isPreferencesValid
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  whileHover={isPreferencesValid ? { scale: 1.02 } : {}}
                  whileTap={isPreferencesValid ? { scale: 0.98 } : {}}
                >
                  Complete Signup
                </motion.button>
              </div>
              {!isPreferencesValid && (
                <p className="text-xs text-red-500 text-right mt-2">
                  Please select at least one interest and one notification channel
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success State */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md mx-4 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to our newsletter!
              </h3>
              <p className="text-gray-900 dark:text-gray-300 mb-4">
                Thank you for subscribing. You&apos;ll receive a confirmation email shortly.
              </p>
              <button
                onClick={() => setIsCompleted(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features */}
      <div className="mt-8 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-black dark:text-gray-300 font-medium">
          <div>🔒 Your privacy is protected</div>
          <div>📧 Unsubscribe anytime</div>
          <div>✨ Exclusive content only</div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsletterSignup;