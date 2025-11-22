'use client';

import React, { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import {
  CogIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  TruckIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  ServerStackIcon,
  WrenchScrewdriverIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

interface SettingsSection {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'general',
    name: 'General Settings',
    icon: CogIcon,
    description: 'Basic application settings and preferences',
  },
  {
    id: 'profile',
    name: 'Profile Settings',
    icon: UserIcon,
    description: 'Manage your account information and profile',
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: BellIcon,
    description: 'Configure email and push notification preferences',
  },
  {
    id: 'security',
    name: 'Security & Privacy',
    icon: ShieldCheckIcon,
    description: 'Password, two-factor authentication, and privacy settings',
  },
  {
    id: 'api',
    name: 'API & Integrations',
    icon: KeyIcon,
    description: 'Manage API keys and third-party integrations',
  },
  {
    id: 'localization',
    name: 'Localization',
    icon: GlobeAltIcon,
    description: 'Language, timezone, and regional settings',
  },
  {
    id: 'payment',
    name: 'Payment Settings',
    icon: CurrencyDollarIcon,
    description: 'Configure payment gateways and billing preferences',
  },
  {
    id: 'shipping',
    name: 'Shipping & Delivery',
    icon: TruckIcon,
    description: 'Manage shipping zones, rates, and delivery options',
  },
  {
    id: 'email',
    name: 'Email Templates',
    icon: EnvelopeIcon,
    description: 'Customize email templates and SMTP settings',
  },
  {
    id: 'store',
    name: 'Store Settings',
    icon: BuildingStorefrontIcon,
    description: 'Store information, policies, and business settings',
  },
  {
    id: 'inventory',
    name: 'Inventory Management',
    icon: ArchiveBoxIcon,
    description: 'Stock levels, warehouses, and inventory tracking',
  },
  {
    id: 'analytics',
    name: 'Analytics & Reports',
    icon: ChartBarIcon,
    description: 'Configure analytics tracking and reporting',
  },
  {
    id: 'backup',
    name: 'Backup & Recovery',
    icon: ServerStackIcon,
    description: 'Data backup schedules and recovery options',
  },
  {
    id: 'maintenance',
    name: 'System Maintenance',
    icon: WrenchScrewdriverIcon,
    description: 'System updates, cache management, and maintenance',
  },
  {
    id: 'integrations',
    name: 'Third-party Integrations',
    icon: LinkIcon,
    description: 'Connect with external services and platforms',
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  
  // Load settings hooks only for the active section to improve performance
  const {
    loading: generalLoading,
    getSetting: getGeneralSetting,
    setSetting: setGeneralSetting,
    updateSettings: updateGeneralSettings,
    isDirty: generalDirty,
    resetChanges: resetGeneralChanges,
  } = useSettings('general');

  // Additional hooks will be loaded as needed
  const {
    loading: sectionLoading,
    updateSettings: updateSectionSettings,
    isDirty: sectionDirty,
    resetChanges: resetSectionChanges,
  } = useSettings(activeSection);

  // Handle save for the current active section
  const handleSave = async () => {
    try {
      if (activeSection === 'general') {
        await updateGeneralSettings({});
      } else {
        await updateSectionSettings({});
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // Handle cancel/reset for the current active section
  const handleCancel = () => {
    if (activeSection === 'general') {
      resetGeneralChanges();
    } else {
      resetSectionChanges();
    }
  };

  // Check if current section has unsaved changes
  const hasUnsavedChanges = () => {
    if (activeSection === 'general') {
      return generalDirty;
    } else {
      return sectionDirty;
    }
  };

  // Check if current section is loading
  const isCurrentSectionLoading = () => {
    if (activeSection === 'general') {
      return generalLoading;
    } else {
      return sectionLoading;
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure basic application settings and preferences.
        </p>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="site-name" className="block text-sm font-medium text-gray-700">
              Site Name
            </label>
            <input
              id="site-name"
              type="text"
              value={getGeneralSetting('siteName', 'Vardhman Mills') as string}
              onChange={(e) => setGeneralSetting('siteName', e.target.value)}
              placeholder="Enter site name"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="site-tagline" className="block text-sm font-medium text-gray-700">
              Site Tagline
            </label>
            <input
              id="site-tagline"
              type="text"
              value={getGeneralSetting('siteTagline', 'Premium Textile Solutions') as string}
              onChange={(e) => setGeneralSetting('siteTagline', e.target.value)}
              placeholder="Enter site tagline"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="site-description" className="block text-sm font-medium text-gray-700">
            Site Description
          </label>
          <textarea
            id="site-description"
            rows={3}
            value={getGeneralSetting('siteDescription', 'Premium textile manufacturing and trading company specializing in high-quality fabrics and garments') as string}
            onChange={(e) => setGeneralSetting('siteDescription', e.target.value)}
            placeholder="Enter site description"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700">
              Contact Email
            </label>
            <input
              id="contact-email"
              type="email"
              defaultValue="admin@vardhmanmills.com"
              placeholder="Enter contact email"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="support-email" className="block text-sm font-medium text-gray-700">
              Support Email
            </label>
            <input
              id="support-email"
              type="email"
              defaultValue="support@vardhmanmills.com"
              placeholder="Enter support email"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              defaultValue="+91-9876543210"
              placeholder="Enter phone number"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website URL
            </label>
            <input
              id="website"
              type="url"
              defaultValue="https://vardhmanmills.com"
              placeholder="Enter website URL"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Application Settings */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Application Settings</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="items-per-page" className="block text-sm font-medium text-gray-700">
              Items per Page
            </label>
            <select
              id="items-per-page"
              defaultValue="10"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div>
            <label htmlFor="date-format" className="block text-sm font-medium text-gray-700">
              Date Format
            </label>
            <select
              id="date-format"
              defaultValue="dd/mm/yyyy"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="maintenance-mode"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="maintenance-mode" className="ml-2 block text-sm text-gray-900">
              Enable maintenance mode
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="debug-mode"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="debug-mode" className="ml-2 block text-sm text-gray-900">
              Enable debug mode
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="registration-enabled"
              defaultChecked
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="registration-enabled" className="ml-2 block text-sm text-gray-900">
              Allow new user registration
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="auto-backup"
              defaultChecked
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="auto-backup" className="ml-2 block text-sm text-gray-900">
              Enable automatic backups
            </label>
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">SEO Settings</h4>
        
        <div>
          <label htmlFor="meta-title" className="block text-sm font-medium text-gray-700">
            Meta Title
          </label>
          <input
            id="meta-title"
            type="text"
            defaultValue="Vardhman Mills - Premium Textile Solutions"
            placeholder="Enter meta title"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="meta-description" className="block text-sm font-medium text-gray-700">
            Meta Description
          </label>
          <textarea
            id="meta-description"
            rows={2}
            defaultValue="Leading textile manufacturer offering premium fabrics, garments, and textile solutions with exceptional quality and service."
            placeholder="Enter meta description"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="meta-keywords" className="block text-sm font-medium text-gray-700">
            Meta Keywords
          </label>
          <input
            id="meta-keywords"
            type="text"
            defaultValue="textile, fabric, garments, manufacturing, premium textiles"
            placeholder="Enter meta keywords (comma separated)"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Profile Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account information and personal details.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="first-name"
              type="text"
              defaultValue="Admin"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="last-name"
              type="text"
              defaultValue="User"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            defaultValue="admin@vardhmanmills.com"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            rows={3}
            placeholder="Tell us about yourself"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
            Profile Picture
          </label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure how and when you receive notifications.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-md font-medium text-gray-900">Email Notifications</h4>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">New Orders</label>
                <p className="text-sm text-gray-500">Get notified when new orders are placed</p>
              </div>
              <input type="checkbox" defaultChecked title="Enable new order notifications" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Order Updates</label>
                <p className="text-sm text-gray-500">Get notified when order status changes</p>
              </div>
              <input type="checkbox" defaultChecked title="Enable order update notifications" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Low Stock Alerts</label>
                <p className="text-sm text-gray-500">Get notified when products are low in stock</p>
              </div>
              <input type="checkbox" defaultChecked title="Enable low stock alerts" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">New User Registrations</label>
                <p className="text-sm text-gray-500">Get notified when new users register</p>
              </div>
              <input type="checkbox" title="Enable new user registration notifications" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-900">Push Notifications</h4>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Browser Notifications</label>
                <p className="text-sm text-gray-500">Show notifications in your browser</p>
              </div>
              <input type="checkbox" defaultChecked title="Enable browser notifications" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Sound Alerts</label>
                <p className="text-sm text-gray-500">Play sound for important notifications</p>
              </div>
              <input type="checkbox" title="Enable sound alerts" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Security & Privacy Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Manage your password, security, and privacy preferences.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-md font-medium text-gray-900">Password Security</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                id="current-password"
                type="password"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-900">Two-Factor Authentication</h4>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable 2FA</label>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <input type="checkbox" title="Enable two-factor authentication" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-900">Session Management</h4>
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="session-timeout" className="block text-sm font-medium text-gray-700">
                Session Timeout (minutes)
              </label>
              <select
                id="session-timeout"
                defaultValue="60"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="480">8 hours</option>
              </select>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember-device"
                defaultChecked 
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
              />
              <label htmlFor="remember-device" className="ml-2 block text-sm text-gray-900">
                Remember me on this device
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">API & Integrations</h3>
        <p className="mt-1 text-sm text-gray-500">
          Manage API keys and third-party service integrations.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-md font-medium text-gray-900">API Keys</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="razorpay-key" className="block text-sm font-medium text-gray-700">
                Razorpay API Key
              </label>
              <input
                id="razorpay-key"
                type="text"
                placeholder="Enter Razorpay API Key"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocalizationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Localization Settings</h3>
        <p className="mt-1 text-sm text-gray-500">Configure language and regional preferences.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language</label>
          <select id="language" defaultValue="en" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Payment Settings</h3>
        <p className="mt-1 text-sm text-gray-500">Configure payment gateways.</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Razorpay</label>
          <input type="checkbox" defaultChecked title="Enable Razorpay" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
        </div>
      </div>
    </div>
  );

  const renderShippingSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Shipping & Delivery Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure comprehensive shipping zones, rates, carriers, and delivery options.
        </p>
      </div>

      {/* Shipping Zones */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Shipping Zones</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="domestic-zone" className="block text-sm font-medium text-gray-700">Domestic Zone</label>
            <input 
              id="domestic-zone" 
              type="text" 
              defaultValue="India" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="international-zone" className="block text-sm font-medium text-gray-700">International Zone</label>
            <select 
              id="international-zone" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="worldwide">Worldwide</option>
              <option value="asia">Asia Pacific</option>
              <option value="europe">Europe</option>
              <option value="americas">Americas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipping Rates */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Shipping Rates</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="standard-rate" className="block text-sm font-medium text-gray-700">Standard Shipping (₹)</label>
            <input 
              id="standard-rate" 
              type="number" 
              defaultValue="99" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="express-rate" className="block text-sm font-medium text-gray-700">Express Shipping (₹)</label>
            <input 
              id="express-rate" 
              type="number" 
              defaultValue="199" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="overnight-rate" className="block text-sm font-medium text-gray-700">Overnight Shipping (₹)</label>
            <input 
              id="overnight-rate" 
              type="number" 
              defaultValue="399" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>
      </div>

      {/* Free Shipping */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Free Shipping Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="free-shipping-threshold" className="block text-sm font-medium text-gray-700">Free Shipping Above (₹)</label>
            <input 
              id="free-shipping-threshold" 
              type="number" 
              defaultValue="2000" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div className="flex items-center mt-6">
            <input 
              type="checkbox" 
              id="enable-free-shipping"
              defaultChecked 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
            />
            <label htmlFor="enable-free-shipping" className="ml-2 block text-sm text-gray-900">
              Enable Free Shipping
            </label>
          </div>
        </div>
      </div>

      {/* Shipping Carriers */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Shipping Carriers</h4>
        <div className="space-y-3">
          {[
            { id: 'bluedart', name: 'Blue Dart', enabled: true },
            { id: 'delhivery', name: 'Delhivery', enabled: true },
            { id: 'fedex', name: 'FedEx', enabled: false },
            { id: 'dhl', name: 'DHL', enabled: false },
            { id: 'aramex', name: 'Aramex', enabled: false },
            { id: 'indiapost', name: 'India Post', enabled: true }
          ].map((carrier) => (
            <div key={carrier.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id={`carrier-${carrier.id}`}
                  defaultChecked={carrier.enabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <label htmlFor={`carrier-${carrier.id}`} className="ml-3 text-sm font-medium text-gray-900">
                  {carrier.name}
                </label>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Configure
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Time Slots */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Delivery Time Slots</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="morning-slot" className="block text-sm font-medium text-gray-700">Morning Slot</label>
            <input 
              id="morning-slot" 
              type="text" 
              defaultValue="9:00 AM - 1:00 PM" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="evening-slot" className="block text-sm font-medium text-gray-700">Evening Slot</label>
            <input 
              id="evening-slot" 
              type="text" 
              defaultValue="2:00 PM - 6:00 PM" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="enable-time-slots"
            defaultChecked 
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
          />
          <label htmlFor="enable-time-slots" className="ml-2 block text-sm text-gray-900">
            Enable Time Slot Selection
          </label>
        </div>
      </div>

      {/* International Shipping */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">International Shipping</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="international-rate" className="block text-sm font-medium text-gray-700">Base International Rate (₹)</label>
            <input 
              id="international-rate" 
              type="number" 
              defaultValue="999" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="customs-declaration" className="block text-sm font-medium text-gray-700">Default Customs Declaration</label>
            <input 
              id="customs-declaration" 
              type="text" 
              defaultValue="Textile Products" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="enable-international"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
            />
            <label htmlFor="enable-international" className="ml-2 block text-sm text-gray-900">
              Enable International Shipping
            </label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="require-signature"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
            />
            <label htmlFor="require-signature" className="ml-2 block text-sm text-gray-900">
              Require Signature on Delivery
            </label>
          </div>
        </div>
      </div>

      {/* Processing Time */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Order Processing</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="processing-time" className="block text-sm font-medium text-gray-700">Processing Time (Days)</label>
            <select 
              id="processing-time" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1">1 Day</option>
              <option value="2" selected>2-3 Days</option>
              <option value="5">5-7 Days</option>
            </select>
          </div>
          <div>
            <label htmlFor="cutoff-time" className="block text-sm font-medium text-gray-700">Daily Cutoff Time</label>
            <input 
              id="cutoff-time" 
              type="time" 
              defaultValue="15:00" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="weekend-processing" className="block text-sm font-medium text-gray-700">Weekend Processing</label>
            <select 
              id="weekend-processing" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="disabled">Disabled</option>
              <option value="saturday">Saturday Only</option>
              <option value="both">Saturday & Sunday</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipping Restrictions */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Shipping Restrictions</h4>
        <div>
          <label htmlFor="restricted-areas" className="block text-sm font-medium text-gray-700">Restricted Postal Codes</label>
          <textarea 
            id="restricted-areas" 
            placeholder="Enter postal codes separated by commas (e.g., 110001, 400001)" 
            rows={3}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        <div>
          <label htmlFor="max-weight" className="block text-sm font-medium text-gray-700">Maximum Package Weight (kg)</label>
          <input 
            id="max-weight" 
            type="number" 
            defaultValue="30" 
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Email Settings</h3>
        <p className="mt-1 text-sm text-gray-500">Configure email templates.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="smtp-host" className="block text-sm font-medium text-gray-700">SMTP Host</label>
          <input id="smtp-host" type="text" placeholder="smtp.gmail.com" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>
    </div>
  );

  const renderStoreSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Store Settings</h3>
        <p className="mt-1 text-sm text-gray-500">Configure store information.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="store-name" className="block text-sm font-medium text-gray-700">Store Name</label>
          <input id="store-name" type="text" defaultValue="Vardhman Mills" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>
    </div>
  );

  const renderInventorySettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Inventory Management Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure stock levels, warehouses, and inventory tracking preferences.
        </p>
      </div>

      {/* Stock Levels */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Stock Level Alerts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="low-stock-threshold" className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
            <input 
              id="low-stock-threshold" 
              type="number" 
              defaultValue="10" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="out-of-stock-action" className="block text-sm font-medium text-gray-700">Out of Stock Action</label>
            <select 
              id="out-of-stock-action" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="hide">Hide Product</option>
              <option value="show">Show as Out of Stock</option>
              <option value="backorder">Allow Backorders</option>
            </select>
          </div>
        </div>
      </div>

      {/* Warehouse Management */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Warehouse Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="default-warehouse" className="block text-sm font-medium text-gray-700">Default Warehouse</label>
            <select 
              id="default-warehouse" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="main">Main Warehouse - Delhi</option>
              <option value="mumbai">Mumbai Branch</option>
              <option value="bangalore">Bangalore Branch</option>
            </select>
          </div>
          <div className="flex items-center mt-6">
            <input 
              type="checkbox" 
              id="multi-warehouse"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
            />
            <label htmlFor="multi-warehouse" className="ml-2 block text-sm text-gray-900">
              Enable Multi-warehouse Management
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Analytics & Reports Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure analytics tracking, reporting preferences, and data collection.
        </p>
      </div>

      {/* Google Analytics */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Google Analytics</h4>
        <div>
          <label htmlFor="ga-tracking-id" className="block text-sm font-medium text-gray-700">Google Analytics Tracking ID</label>
          <input 
            id="ga-tracking-id" 
            type="text" 
            placeholder="G-XXXXXXXXXX" 
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="enable-ga"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
          />
          <label htmlFor="enable-ga" className="ml-2 block text-sm text-gray-900">
            Enable Google Analytics
          </label>
        </div>
      </div>

      {/* Report Generation */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Automated Reports</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="report-frequency" className="block text-sm font-medium text-gray-700">Report Frequency</label>
            <select 
              id="report-frequency" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label htmlFor="report-email" className="block text-sm font-medium text-gray-700">Send Reports To</label>
            <input 
              id="report-email" 
              type="email" 
              placeholder="admin@vardhmanmills.com" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Backup & Recovery Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure data backup schedules, storage locations, and recovery options.
        </p>
      </div>

      {/* Backup Schedule */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Backup Schedule</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="backup-frequency" className="block text-sm font-medium text-gray-700">Backup Frequency</label>
            <select 
              id="backup-frequency" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="hourly">Every Hour</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label htmlFor="backup-time" className="block text-sm font-medium text-gray-700">Backup Time</label>
            <input 
              id="backup-time" 
              type="time" 
              defaultValue="02:00" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="retention-period" className="block text-sm font-medium text-gray-700">Retention (Days)</label>
            <input 
              id="retention-period" 
              type="number" 
              defaultValue="30" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>
      </div>

      {/* Storage Configuration */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Backup Storage</h4>
        <div>
          <label htmlFor="storage-provider" className="block text-sm font-medium text-gray-700">Storage Provider</label>
          <select 
            id="storage-provider" 
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="local">Local Storage</option>
            <option value="aws">Amazon S3</option>
            <option value="gcp">Google Cloud Storage</option>
            <option value="azure">Azure Blob Storage</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderMaintenanceSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900">System Maintenance Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure system updates, cache management, and maintenance schedules.
        </p>
      </div>

      {/* Maintenance Mode */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Maintenance Mode</h4>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="maintenance-mode"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
            />
            <label htmlFor="maintenance-mode" className="ml-2 block text-sm text-gray-900">
              Enable Maintenance Mode
            </label>
          </div>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
            Schedule Maintenance
          </button>
        </div>
      </div>

      {/* Cache Management */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Cache Management</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cache-duration" className="block text-sm font-medium text-gray-700">Cache Duration (Hours)</label>
            <input 
              id="cache-duration" 
              type="number" 
              defaultValue="24" 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div className="flex items-center mt-6">
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 mr-2">
              Clear All Cache
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Clear Page Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Third-party Integrations</h3>
        <p className="mt-1 text-sm text-gray-500">
          Connect with external services, platforms, and marketing tools.
        </p>
      </div>

      {/* Social Media */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Social Media Integration</h4>
        <div className="space-y-3">
          {[
            { name: 'Facebook', key: 'facebook', placeholder: 'Facebook App ID' },
            { name: 'Instagram', key: 'instagram', placeholder: 'Instagram Business ID' },
            { name: 'WhatsApp', key: 'whatsapp', placeholder: 'WhatsApp Business API Key' },
            { name: 'Google', key: 'google', placeholder: 'Google Client ID' }
          ].map((platform) => (
            <div key={platform.key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${platform.key}-id`} className="block text-sm font-medium text-gray-700">
                  {platform.name} ID
                </label>
                <input 
                  id={`${platform.key}-id`}
                  type="text" 
                  placeholder={platform.placeholder}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div className="flex items-center mt-6">
                <input 
                  type="checkbox" 
                  id={`enable-${platform.key}`}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <label htmlFor={`enable-${platform.key}`} className="ml-2 block text-sm text-gray-900">
                  Enable {platform.name} Integration
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marketing Tools */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Marketing Tools</h4>
        <div className="space-y-3">
          {[
            { name: 'Mailchimp', key: 'mailchimp', placeholder: 'Mailchimp API Key' },
            { name: 'Klaviyo', key: 'klaviyo', placeholder: 'Klaviyo Private Key' },
            { name: 'Zendesk', key: 'zendesk', placeholder: 'Zendesk API Token' }
          ].map((tool) => (
            <div key={tool.key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${tool.key}-key`} className="block text-sm font-medium text-gray-700">
                  {tool.name} API Key
                </label>
                <input 
                  id={`${tool.key}-key`}
                  type="password" 
                  placeholder={tool.placeholder}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div className="flex items-center mt-6">
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Test Connection
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'api':
        return renderApiSettings();
      case 'localization':
        return renderLocalizationSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'shipping':
        return renderShippingSettings();
      case 'email':
        return renderEmailSettings();
      case 'store':
        return renderStoreSettings();
      case 'inventory':
        return renderInventorySettings();
      case 'analytics':
        return renderAnalyticsSettings();
      case 'backup':
        return renderBackupSettings();
      case 'maintenance':
        return renderMaintenanceSettings();
      case 'integrations':
        return renderIntegrationsSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Manage your application settings and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left group rounded-md px-3 py-2 flex items-center text-sm font-medium ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon
                    className={`flex-shrink-0 -ml-1 mr-3 h-6 w-6 ${
                      activeSection === section.id
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <span className="truncate">{section.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {renderContent()}
            
            {/* Save buttons for all sections */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                {/* Show loading state */}
                {isCurrentSectionLoading() && (
                  <div className="text-sm text-gray-500 flex items-center mr-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Saving...
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isCurrentSectionLoading()}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges() || isCurrentSectionLoading()}
                  className={`btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                    hasUnsavedChanges() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'
                  }`}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
