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
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

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
  bgColor: string;
  popular?: boolean;
}

const preferenceCategories: PreferenceCategory[] = [
  {
    id: 'new-products',
    label: 'New Products',
    description: 'Latest fabric collections and textile innovations',
    icon: SparklesIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    popular: true,
  },
  {
    id: 'special-offers',
    label: 'Special Offers',
    description: 'Exclusive discounts and promotional deals',
    icon: TagIcon,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    popular: true,
  },
  {
    id: 'industry-news',
    label: 'Industry News',
    description: 'Textile industry trends and market updates',
    icon: NewspaperIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'sustainability',
    label: 'Sustainability',
    description: 'Eco-friendly practices and sustainable textiles',
    icon: GlobeAltIcon,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
  },
  {
    id: 'events',
    label: 'Events & Trade Shows',
    description: 'Upcoming exhibitions and industry events',
    icon: CalendarIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    id: 'market-insights',
    label: 'Market Insights',
    description: 'Price trends and market analysis',
    icon: ChartBarIcon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  {
    id: 'company-updates',
    label: 'Company Updates',
    description: 'Vardhman Mills news and announcements',
    icon: BellIcon,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
  },
  {
    id: 'community',
    label: 'Community',
    description: 'Customer stories and community highlights',
    icon: UserGroupIcon,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
];

const frequencyOptions = [
  { id: 'daily', label: 'Daily', description: 'Breaking news only', icon: '⚡' },
  { id: 'weekly', label: 'Weekly', description: 'Every Tuesday', icon: '📅', recommended: true },
  { id: 'monthly', label: 'Monthly', description: 'First of month', icon: '📆' },
  { id: 'never', label: 'Never', description: 'Events only', icon: '🔕' },
] as const;

const languageOptions = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिंदी (Hindi)' },
  { id: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { id: 'gu', label: 'ગુજરાતી (Gujarati)' },
];

const formatOptions = [
  { id: 'html', label: 'Rich HTML', description: 'Beautiful emails with images', icon: '✨' },
  { id: 'text', label: 'Plain Text', description: 'Simple text-only emails', icon: '📝' },
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

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Section: Content Categories */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <SparklesIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">What interests you?</h3>
            <p className="text-sm text-gray-500">Select topics you'd like to hear about</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {preferenceCategories.map((category) => {
            const isSelected = preferences.categories.includes(category.id);
            const IconComponent = category.icon;

            return (
              <motion.button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`
                  relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }
                `}
              >
                {category.popular && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full shadow-sm">
                    Popular
                  </span>
                )}

                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${category.bgColor} flex items-center justify-center`}>
                  <IconComponent className={`w-5 h-5 ${category.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{category.label}</h4>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                      }`}>
                      {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{category.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Section: Email Frequency */}
      {showFrequency && (
        <div className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <ClockIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Email Frequency</h3>
              <p className="text-sm text-gray-500">How often would you like to hear from us?</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {frequencyOptions.map((option) => {
              const isSelected = preferences.frequency === option.id;

              return (
                <motion.button
                  key={option.id}
                  type="button"
                  onClick={() => updatePreferences({ frequency: option.id })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative p-4 rounded-xl border-2 text-center transition-all duration-200
                    ${isSelected
                      ? 'border-purple-500 bg-purple-50 shadow-md shadow-purple-100'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  {option.recommended && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-green-500 text-white rounded-full">
                      Best
                    </span>
                  )}
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <h4 className="font-semibold text-gray-900 text-sm">{option.label}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">{option.description}</p>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                      <CheckIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Section: Language */}
      {showLanguage && (
        <div className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
              <GlobeAltIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Preferred Language</h3>
              <p className="text-sm text-gray-500">Choose your newsletter language</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {languageOptions.map((option) => {
              const isSelected = preferences.language === option.id;

              return (
                <motion.button
                  key={option.id}
                  type="button"
                  onClick={() => updatePreferences({ language: option.id })}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all duration-200
                    ${isSelected
                      ? 'border-teal-500 bg-teal-50 shadow-md shadow-teal-100'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  <span className={`font-semibold text-sm ${isSelected ? 'text-teal-700' : 'text-gray-900'}`}>
                    {option.label}
                  </span>
                  {isSelected && <CheckIcon className="w-4 h-4 text-teal-600" />}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Section: Email Format */}
      {showFormat && (
        <div className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <EnvelopeIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Email Format</h3>
              <p className="text-sm text-gray-500">How should we format your emails?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formatOptions.map((option) => {
              const isSelected = preferences.format === option.id;

              return (
                <motion.button
                  key={option.id}
                  type="button"
                  onClick={() => updatePreferences({ format: option.id })}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${isSelected
                      ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">{option.icon}</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-h-[40px]">
                    <h4 className="font-semibold text-gray-900 text-sm">{option.label}</h4>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
                    }`}>
                    {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Section: Notification Preferences */}
      <div className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center">
            <BellIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Notification Channels</h3>
            <p className="text-sm text-gray-500">Where should we send notifications?</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Email */}
          <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <EnvelopeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex flex-col justify-center min-h-[40px]">
                <h4 className="font-semibold text-gray-900 text-sm">Email</h4>
                <p className="text-xs text-gray-500">Newsletter and updates</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={preferences.notifications.email}
                onChange={(e) => updatePreferences({
                  notifications: { ...preferences.notifications, email: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
            </div>
          </label>

          {/* SMS */}
          <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <DevicePhoneMobileIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex flex-col justify-center min-h-[40px]">
                <h4 className="font-semibold text-gray-900 text-sm">SMS</h4>
                <p className="text-xs text-gray-500">Urgent updates only</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={preferences.notifications.sms}
                onChange={(e) => updatePreferences({
                  notifications: { ...preferences.notifications, sms: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
            </div>
          </label>

          {/* Push */}
          <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <ComputerDesktopIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex flex-col justify-center min-h-[40px]">
                <h4 className="font-semibold text-gray-900 text-sm">Browser Push</h4>
                <p className="text-xs text-gray-500">Desktop notifications</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={preferences.notifications.push}
                onChange={(e) => updatePreferences({
                  notifications: { ...preferences.notifications, push: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-500 transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
            </div>
          </label>
        </div>
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
          <h4 className="font-bold text-gray-900">Your Preferences Summary</h4>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wide">Topics</span>
            <p className="text-gray-900 font-medium">
              {preferences.categories.length > 0
                ? preferences.categories.slice(0, 2).map(id =>
                  preferenceCategories.find(cat => cat.id === id)?.label
                ).join(', ') + (preferences.categories.length > 2 ? ` +${preferences.categories.length - 2}` : '')
                : 'None selected'
              }
            </p>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wide">Frequency</span>
            <p className="text-gray-900 font-medium">
              {frequencyOptions.find(opt => opt.id === preferences.frequency)?.label}
            </p>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wide">Language</span>
            <p className="text-gray-900 font-medium">
              {languageOptions.find(opt => opt.id === preferences.language)?.label}
            </p>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wide">Format</span>
            <p className="text-gray-900 font-medium">
              {formatOptions.find(opt => opt.id === preferences.format)?.label}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NewsletterPreferences;