'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  SparklesIcon,
  TagIcon,
  NewspaperIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

export interface NewsletterPreferencesProps {
  className?: string;
  onPreferencesChange?: (preferences: PreferenceData) => void;
  initialPreferences?: Partial<PreferenceData>;
  showFrequency?: boolean;
  showLanguage?: boolean;
  showFormat?: boolean;
}

export interface PreferenceData {
  categories: string[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  language: string;
  format: 'html' | 'text';
  timeZone?: string;
  industries?: string[];
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface PreferenceCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  popular?: boolean;
}

const preferenceCategories: PreferenceCategory[] = [
  {
    id: 'new-products',
    label: 'New Products',
    description: 'Latest fabric collections and textile innovations',
    icon: SparklesIcon,
    color: 'text-blue-600',
    popular: true,
  },
  {
    id: 'special-offers',
    label: 'Special Offers',
    description: 'Exclusive discounts and promotional deals',
    icon: TagIcon,
    color: 'text-green-600',
    popular: true,
  },
  {
    id: 'industry-news',
    label: 'Industry News',
    description: 'Textile industry trends and market updates',
    icon: NewspaperIcon,
    color: 'text-purple-600',
  },
  {
    id: 'sustainability',
    label: 'Sustainability',
    description: 'Eco-friendly practices and sustainable textiles',
    icon: GlobeAltIcon,
    color: 'text-emerald-600',
  },
  {
    id: 'events',
    label: 'Events & Trade Shows',
    description: 'Upcoming exhibitions and industry events',
    icon: CalendarIcon,
    color: 'text-orange-600',
  },
  {
    id: 'market-insights',
    label: 'Market Insights',
    description: 'Price trends and market analysis',
    icon: ChartBarIcon,
    color: 'text-indigo-600',
  },
  {
    id: 'company-updates',
    label: 'Company Updates',
    description: 'Vardhman Mills news and announcements',
    icon: BellIcon,
    color: 'text-red-600',
  },
  {
    id: 'community',
    label: 'Community',
    description: 'Customer stories and community highlights',
    icon: UserGroupIcon,
    color: 'text-pink-600',
  },
];

const frequencyOptions = [
  { id: 'daily', label: 'Daily', description: 'Every day (breaking news only)' },
  { id: 'weekly', label: 'Weekly', description: 'Every Tuesday (recommended)' },
  { id: 'monthly', label: 'Monthly', description: 'First Tuesday of each month' },
  { id: 'never', label: 'Never', description: 'No regular emails (events only)' },
] as const;

const languageOptions = [
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { id: 'pa', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { id: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
];

const formatOptions = [
  { id: 'html', label: 'Rich HTML', description: 'Beautiful emails with images and formatting' },
  { id: 'text', label: 'Plain Text', description: 'Simple text-only emails' },
] as const;

const NewsletterPreferences: React.FC<NewsletterPreferencesProps> = ({
  className = '',
  onPreferencesChange,
  initialPreferences,
  showFrequency = true,
  showLanguage = true,
  showFormat = true,
}) => {
  const [preferences, setPreferences] = useState<PreferenceData>({
    categories: initialPreferences?.categories || ['new-products', 'special-offers'],
    frequency: initialPreferences?.frequency || 'weekly',
    language: initialPreferences?.language || 'en',
    format: initialPreferences?.format || 'html',
    timeZone: initialPreferences?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    industries: initialPreferences?.industries || [],
    notifications: {
      email: true,
      sms: false,
      push: false,
      ...initialPreferences?.notifications,
    },
  });

  const updatePreferences = (updates: Partial<PreferenceData>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    onPreferencesChange?.(newPreferences);
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = preferences.categories.includes(categoryId)
      ? preferences.categories.filter(id => id !== categoryId)
      : [...preferences.categories, categoryId];
    
    updatePreferences({ categories: newCategories });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const cardVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div
      className={`${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Content Categories */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          What interests you?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {preferenceCategories.map((category) => {
            const isSelected = preferences.categories.includes(category.id);
            const IconComponent = category.icon;
            
            return (
              <motion.div
                key={category.id}
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                className={`
                  relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                onClick={() => toggleCategory(category.id)}
              >
                {category.popular && (
                  <div className="absolute -top-2 -right-2 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                    Popular
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <IconComponent className={`w-6 h-6 ${category.color} flex-shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {category.label}
                      </h4>
                      {isSelected && (
                        <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Frequency Settings */}
      {showFrequency && (
        <motion.div className="mt-8" variants={itemVariants}>
          <div className="flex items-center mb-4">
            <ClockIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Email Frequency
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {frequencyOptions.map((option) => (
              <motion.div
                key={option.id}
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                  ${preferences.frequency === option.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                onClick={() => updatePreferences({ frequency: option.id })}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {option.label}
                    </h4>
                    {preferences.frequency === option.id && (
                      <CheckCircleIcon className="w-4 h-4 text-blue-500 ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Language Settings */}
      {showLanguage && (
        <motion.div className="mt-8" variants={itemVariants}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Preferred Language
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {languageOptions.map((option) => (
              <motion.div
                key={option.id}
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                className={`
                  p-3 border-2 rounded-lg cursor-pointer transition-all duration-200
                  ${preferences.language === option.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                onClick={() => updatePreferences({ language: option.id })}
              >
                <div className="text-center">
                  <div className="text-xl mb-1">{option.flag}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </div>
                  {preferences.language === option.id && (
                    <CheckCircleIcon className="w-4 h-4 text-blue-500 mx-auto mt-1" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Format Settings */}
      {showFormat && (
        <motion.div className="mt-8" variants={itemVariants}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Email Format
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formatOptions.map((option) => (
              <motion.div
                key={option.id}
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                  ${preferences.format === option.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                onClick={() => updatePreferences({ format: option.id })}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {option.label}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                  {preferences.format === option.id && (
                    <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Notification Settings */}
      <motion.div className="mt-8" variants={itemVariants}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Email Notifications
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Receive newsletter and updates via email
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.email}
              onChange={(e) => updatePreferences({
                notifications: {
                  ...preferences.notifications,
                  email: e.target.checked
                }
              })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                SMS Notifications
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Receive urgent updates via SMS
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.sms}
              onChange={(e) => updatePreferences({
                notifications: {
                  ...preferences.notifications,
                  sms: e.target.checked
                }
              })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Push Notifications
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Receive browser push notifications
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.push}
              onChange={(e) => updatePreferences({
                notifications: {
                  ...preferences.notifications,
                  push: e.target.checked
                }
              })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div 
        className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        variants={itemVariants}
      >
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Your Preferences Summary:
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>
            <strong>Categories:</strong> {preferences.categories.length > 0 
              ? preferences.categories.map(id => 
                  preferenceCategories.find(cat => cat.id === id)?.label
                ).join(', ')
              : 'None selected'
            }
          </li>
          <li>
            <strong>Frequency:</strong> {frequencyOptions.find(opt => opt.id === preferences.frequency)?.label}
          </li>
          <li>
            <strong>Language:</strong> {languageOptions.find(opt => opt.id === preferences.language)?.label}
          </li>
          <li>
            <strong>Format:</strong> {formatOptions.find(opt => opt.id === preferences.format)?.label}
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default NewsletterPreferences;