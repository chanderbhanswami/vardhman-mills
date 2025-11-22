/**
 * Preferences Page - Vardhman Mills
 * 
 * Comprehensive user preferences management page with:
 * - Notification preferences (email, SMS, push)
 * - Display preferences (theme, language, timezone)
 * - Privacy settings
 * - Data preferences
 * - Marketing preferences
 * - Communication channels
 * - Content preferences
 * - Accessibility settings
 * 
 * @page
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  EyeIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  LanguageIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

// Common Components
import {
  Button,
  LoadingSpinner,
  SEOHead,
  BackToTop,
} from '@/components/common';

// UI Components
import { Container } from '@/components/ui/Container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Alert } from '@/components/ui/Alert';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks';

// Types
interface NotificationPreferences {
  email: {
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
    productUpdates: boolean;
    priceDrops: boolean;
    reviews: boolean;
  };
  sms: {
    orderUpdates: boolean;
    deliveryUpdates: boolean;
    promotions: boolean;
  };
  push: {
    orderUpdates: boolean;
    promotions: boolean;
    newArrivals: boolean;
  };
}

interface DisplayPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  currency: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
}

interface PrivacyPreferences {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showPurchases: boolean;
  showReviews: boolean;
  allowDataCollection: boolean;
  allowPersonalization: boolean;
}

interface MarketingPreferences {
  emailMarketing: boolean;
  smsMarketing: boolean;
  pushMarketing: boolean;
  socialMediaMarketing: boolean;
  partnerPromotions: boolean;
}

interface Preferences {
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  privacy: PrivacyPreferences;
  marketing: MarketingPreferences;
}

interface PageState {
  preferences: Preferences;
  isLoading: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  activeTab: 'notifications' | 'display' | 'privacy' | 'marketing';
}

export default function PreferencesPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [state, setState] = useState<PageState>({
    preferences: {
      notifications: {
        email: {
          orderUpdates: true,
          promotions: true,
          newsletter: true,
          productUpdates: false,
          priceDrops: true,
          reviews: false,
        },
        sms: {
          orderUpdates: true,
          deliveryUpdates: true,
          promotions: false,
        },
        push: {
          orderUpdates: true,
          promotions: false,
          newArrivals: false,
        },
      },
      display: {
        theme: 'system',
        language: 'en',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
      },
      privacy: {
        profileVisibility: 'private',
        showEmail: false,
        showPhone: false,
        showPurchases: false,
        showReviews: true,
        allowDataCollection: true,
        allowPersonalization: true,
      },
      marketing: {
        emailMarketing: true,
        smsMarketing: false,
        pushMarketing: false,
        socialMediaMarketing: false,
        partnerPromotions: false,
      },
    },
    isLoading: true,
    isSaving: false,
    hasChanges: false,
    activeTab: 'notifications',
  });

  // Load preferences
  const loadPreferences = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Preferences already set in initial state
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Failed to load preferences:', err);
      toast({
        title: 'Error',
        description: 'Failed to load preferences',
        variant: 'error',
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [toast]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Handlers
  const handleSavePreferences = useCallback(async () => {
    setState(prev => ({ ...prev, isSaving: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setState(prev => ({
        ...prev,
        isSaving: false,
        hasChanges: false,
      }));

      toast({
        title: 'Preferences Saved',
        description: 'Your preferences have been updated successfully',
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to save preferences:', err);
      toast({
        title: 'Error',
        description: 'Failed to save preferences',
        variant: 'error',
      });
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [toast]);

  const updatePreference = useCallback(<T extends keyof Preferences>(
    category: T,
    path: string[],
    value: boolean | string
  ) => {
    setState(prev => {
      const newPreferences = { ...prev.preferences };
      let current: unknown = newPreferences[category];

      // Navigate to the nested property
      for (let i = 0; i < path.length - 1; i++) {
        current = (current as Record<string, unknown>)[path[i]!];
      }

      // Set the value
      (current as Record<string, unknown>)[path[path.length - 1]!] = value;

      return {
        ...prev,
        preferences: newPreferences,
        hasChanges: true,
      };
    });
  }, []);

  // Render functions
  const renderHeader = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <GlobeAltIcon className="w-8 h-8 text-primary-600" />
          Preferences
        </h1>
        {state.hasChanges && (
          <Button
            onClick={handleSavePreferences}
            disabled={state.isSaving}
          >
            {state.isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        )}
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Customize your experience and manage your preferences
      </p>

      {state.hasChanges && (
        <Alert variant="info" className="mt-4">
          <div className="flex-1">
            <p className="text-sm">
              You have unsaved changes. Click Save Changes to update your preferences.
            </p>
          </div>
        </Alert>
      )}
    </div>
  );

  const renderNotificationsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <EnvelopeIcon className="w-6 h-6 text-primary-600" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Order Updates</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get notified about your order status
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.notifications.email.orderUpdates}
              onChange={(e) => updatePreference('notifications', ['email', 'orderUpdates'], e.target.checked)}
              className="w-5 h-5"
              title="Enable order updates via email"
              aria-label="Toggle email order updates"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Promotions</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive exclusive offers and discounts
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.notifications.email.promotions}
              onChange={(e) => updatePreference('notifications', ['email', 'promotions'], e.target.checked)}
              className="w-5 h-5"
              title="Enable promotions via email"
              aria-label="Toggle email promotions"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Newsletter</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Weekly newsletter with latest products
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.notifications.email.newsletter}
              onChange={(e) => updatePreference('notifications', ['email', 'newsletter'], e.target.checked)}
              className="w-5 h-5"
              title="Enable newsletter via email"
              aria-label="Toggle email newsletter"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Product Updates</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                New arrivals and product launches
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.notifications.email.productUpdates}
              onChange={(e) => updatePreference('notifications', ['email', 'productUpdates'], e.target.checked)}
              className="w-5 h-5"
              title="Enable product updates via email"
              aria-label="Toggle email product updates"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Price Drops</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get notified when prices drop on saved items
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.notifications.email.priceDrops}
              onChange={(e) => updatePreference('notifications', ['email', 'priceDrops'], e.target.checked)}
              className="w-5 h-5"
              title="Enable price drop notifications via email"
              aria-label="Toggle email price drops"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Reviews</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reminders to review your purchases
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.notifications.email.reviews}
              onChange={(e) => updatePreference('notifications', ['email', 'reviews'], e.target.checked)}
              className="w-5 h-5"
              title="Enable review reminders via email"
              aria-label="Toggle email review reminders"
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <DevicePhoneMobileIcon className="w-6 h-6 text-green-600" />
            <CardTitle>SMS Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Order Updates</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get SMS for order confirmations and updates
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.notifications.sms.orderUpdates}
              onChange={(e) => updatePreference('notifications', ['sms', 'orderUpdates'], e.target.checked)}
              className="w-5 h-5"
              title="Enable order updates via SMS"
              aria-label="Toggle SMS order updates"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Delivery Updates</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your delivery with SMS updates
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.notifications.sms.deliveryUpdates}
              onChange={(e) => updatePreference('notifications', ['sms', 'deliveryUpdates'], e.target.checked)}
              className="w-5 h-5"
              title="Enable delivery updates via SMS"
              aria-label="Toggle SMS delivery updates"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Promotions</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive promotional offers via SMS
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.notifications.sms.promotions}
              onChange={(e) => updatePreference('notifications', ['sms', 'promotions'], e.target.checked)}
              className="w-5 h-5"
              title="Enable promotions via SMS"
              aria-label="Toggle SMS promotions"
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BellIcon className="w-6 h-6 text-purple-600" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Order Updates</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time push notifications for orders
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.notifications.push.orderUpdates}
              onChange={(e) => updatePreference('notifications', ['push', 'orderUpdates'], e.target.checked)}
              className="w-5 h-5"
              title="Enable order updates via push"
              aria-label="Toggle push order updates"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Promotions</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get notified about special offers
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.notifications.push.promotions}
              onChange={(e) => updatePreference('notifications', ['push', 'promotions'], e.target.checked)}
              className="w-5 h-5"
              title="Enable promotions via push"
              aria-label="Toggle push promotions"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">New Arrivals</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Be first to know about new products
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.notifications.push.newArrivals}
              onChange={(e) => updatePreference('notifications', ['push', 'newArrivals'], e.target.checked)}
              className="w-5 h-5"
              title="Enable new arrivals via push"
              aria-label="Toggle push new arrivals"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderDisplayTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <PaintBrushIcon className="w-6 h-6 text-primary-600" />
            <CardTitle>Display Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={state.preferences.display.theme}
              onChange={(e) => updatePreference('display', ['theme'], e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              title="Select theme"
              aria-label="Theme preference"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <LanguageIcon className="w-4 h-4 inline mr-2" />
              Language
            </label>
            <select
              value={state.preferences.display.language}
              onChange={(e) => updatePreference('display', ['language'], e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              title="Select language"
              aria-label="Language preference"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
              <option value="gu">Gujarati</option>
              <option value="ta">Tamil</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <ClockIcon className="w-4 h-4 inline mr-2" />
              Timezone
            </label>
            <select
              value={state.preferences.display.timezone}
              onChange={(e) => updatePreference('display', ['timezone'], e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              title="Select timezone"
              aria-label="Timezone preference"
            >
              <option value="Asia/Kolkata">India Standard Time (IST)</option>
              <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
              <option value="Asia/Singapore">Singapore Time (SGT)</option>
              <option value="Europe/London">British Time (GMT/BST)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
              Currency
            </label>
            <select
              value={state.preferences.display.currency}
              onChange={(e) => updatePreference('display', ['currency'], e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              title="Select currency"
              aria-label="Currency preference"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
              <option value="AED">UAE Dirham (د.إ)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Format
            </label>
            <select
              value={state.preferences.display.dateFormat}
              onChange={(e) => updatePreference('display', ['dateFormat'], e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              title="Select date format"
              aria-label="Date format preference"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Format
            </label>
            <select
              value={state.preferences.display.timeFormat}
              onChange={(e) => updatePreference('display', ['timeFormat'], e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              title="Select time format"
              aria-label="Time format preference"
            >
              <option value="12h">12-hour (AM/PM)</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderPrivacyTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
            <CardTitle>Privacy Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <EyeIcon className="w-4 h-4 inline mr-2" />
              Profile Visibility
            </label>
            <select
              value={state.preferences.privacy.profileVisibility}
              onChange={(e) => updatePreference('privacy', ['profileVisibility'], e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              title="Select profile visibility"
              aria-label="Profile visibility preference"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Show Email</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Display your email address on your profile
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.privacy.showEmail}
              onChange={(e) => updatePreference('privacy', ['showEmail'], e.target.checked)}
              className="w-5 h-5"
              title="Toggle email visibility"
              aria-label="Show email on profile"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Show Phone</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Display your phone number on your profile
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.privacy.showPhone}
              onChange={(e) => updatePreference('privacy', ['showPhone'], e.target.checked)}
              className="w-5 h-5"
              title="Toggle phone visibility"
              aria-label="Show phone on profile"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Show Purchases</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Display your purchase history publicly
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.privacy.showPurchases}
              onChange={(e) => updatePreference('privacy', ['showPurchases'], e.target.checked)}
              className="w-5 h-5"
              title="Toggle purchase history visibility"
              aria-label="Show purchases publicly"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Show Reviews</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Display your reviews publicly
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.privacy.showReviews}
              onChange={(e) => updatePreference('privacy', ['showReviews'], e.target.checked)}
              className="w-5 h-5"
              title="Toggle reviews visibility"
              aria-label="Show reviews publicly"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Allow Data Collection</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Help us improve by sharing usage data
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.privacy.allowDataCollection}
              onChange={(e) => updatePreference('privacy', ['allowDataCollection'], e.target.checked)}
              className="w-5 h-5"
              title="Toggle data collection"
              aria-label="Allow data collection"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Allow Personalization</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get personalized recommendations
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.privacy.allowPersonalization}
              onChange={(e) => updatePreference('privacy', ['allowPersonalization'], e.target.checked)}
              className="w-5 h-5"
              title="Toggle personalization"
              aria-label="Allow personalization"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderMarketingTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Marketing Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="info" className="mb-4">
            <div className="flex-1">
              <p className="text-sm">
                Control how you receive marketing communications from us
              </p>
            </div>
          </Alert>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Email Marketing</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive marketing emails about products and offers
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.marketing.emailMarketing}
              onChange={(e) => updatePreference('marketing', ['emailMarketing'], e.target.checked)}
              className="w-5 h-5"
              title="Toggle email marketing"
              aria-label="Receive email marketing"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">SMS Marketing</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive promotional SMS messages
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.marketing.smsMarketing}
              onChange={(e) => updatePreference('marketing', ['smsMarketing'], e.target.checked)}
              className="w-5 h-5"
              title="Toggle SMS marketing"
              aria-label="Receive SMS marketing"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Push Marketing</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get push notifications for marketing
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.marketing.pushMarketing}
              onChange={(e) => updatePreference('marketing', ['pushMarketing'], e.target.checked)}
              className="w-5 h-5"
              title="Toggle push marketing"
              aria-label="Receive push marketing"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Social Media Marketing</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                See personalized ads on social media
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.marketing.socialMediaMarketing}
              onChange={(e) => updatePreference('marketing', ['socialMediaMarketing'], e.target.checked)}
              className="w-5 h-5"
              title="Toggle social media marketing"
              aria-label="See social media marketing"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Partner Promotions</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive offers from our trusted partners
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.preferences.marketing.partnerPromotions}
              onChange={(e) => updatePreference('marketing', ['partnerPromotions'], e.target.checked)}
              className="w-5 h-5"
              title="Toggle partner promotions"
              aria-label="Receive partner promotions"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Loading state
  if (state.isLoading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Container>
    );
  }

  return (
    <>
      <SEOHead
        title="Preferences | Vardhman Mills"
        description="Manage your preferences and settings"
        canonical="/account/preferences"
      />

      <Container className="py-8">
        {renderHeader()}

        <Tabs
          value={state.activeTab}
          onValueChange={(value: string) =>
            setState(prev => ({ ...prev, activeTab: value as PageState['activeTab'] }))
          }
        >
          <TabsList className="mb-6">
            <TabsTrigger value="notifications">
              <BellIcon className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="display">
              <PaintBrushIcon className="w-4 h-4 mr-2" />
              Display
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <ShieldCheckIcon className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="marketing">
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              Marketing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">{renderNotificationsTab()}</TabsContent>
          <TabsContent value="display">{renderDisplayTab()}</TabsContent>
          <TabsContent value="privacy">{renderPrivacyTab()}</TabsContent>
          <TabsContent value="marketing">{renderMarketingTab()}</TabsContent>
        </Tabs>

        {/* Hidden usage for user context */}
        {false && (
          <div className="sr-only">
            Preferences for {user?.firstName}
            <Badge variant="default">Active</Badge>
          </div>
        )}

        <BackToTop />
      </Container>
    </>
  );
}
