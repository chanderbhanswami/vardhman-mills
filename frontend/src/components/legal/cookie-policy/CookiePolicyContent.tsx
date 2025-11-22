'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CakeIcon,
  ShieldCheckIcon,
  EyeIcon,
  ChartBarIcon,
  MegaphoneIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  DocumentTextIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { 
  type CookieConsent,
  type CookiePolicyData,
  getCookieConsent,
  setCookieConsent,
  clearCookieConsent,
  deleteAllCookies,
  defaultCookiePolicyData
} from './index';

interface CookiePolicyContentProps {
  onConsentChange?: (consent: CookieConsent) => void;
}

const CookiePolicyContent: React.FC<CookiePolicyContentProps> = ({ 
  onConsentChange 
}) => {
  const [cookieConsent, setCookieConsentState] = useState<CookieConsent | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showConsentManager, setShowConsentManager] = useState(false);
  const [policyData] = useState<CookiePolicyData>(defaultCookiePolicyData);

  useEffect(() => {
    const consent = getCookieConsent();
    setCookieConsentState(consent);
  }, []);

  const handleConsentChange = (categoryId: string, enabled: boolean) => {
    const newConsent = {
      essential: true,
      analytics: categoryId === 'analytics' ? enabled : cookieConsent?.analytics ?? false,
      marketing: categoryId === 'marketing' ? enabled : cookieConsent?.marketing ?? false,
      functional: categoryId === 'functional' ? enabled : cookieConsent?.functional ?? false,
    };

    setCookieConsent(newConsent);
    const updatedConsent = getCookieConsent();
    setCookieConsentState(updatedConsent);
    onConsentChange?.(updatedConsent!);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      analytics: true,
      marketing: true,
      functional: true,
    };

    setCookieConsent(allAccepted);
    const updatedConsent = getCookieConsent();
    setCookieConsentState(updatedConsent);
    onConsentChange?.(updatedConsent!);
    setShowConsentManager(false);
  };

  const handleRejectAll = () => {
    const allRejected = {
      analytics: false,
      marketing: false,
      functional: false,
    };

    setCookieConsent(allRejected);
    const updatedConsent = getCookieConsent();
    setCookieConsentState(updatedConsent);
    onConsentChange?.(updatedConsent!);
    setShowConsentManager(false);
  };

  const handleClearAll = () => {
    clearCookieConsent();
    deleteAllCookies();
    setCookieConsentState(null);
    setShowConsentManager(false);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'essential':
        return ShieldCheckIcon;
      case 'analytics':
        return ChartBarIcon;
      case 'marketing':
        return MegaphoneIcon;
      case 'functional':
        return CogIcon;
      default:
        return CakeIcon;
    }
  };

  const getCategoryStatus = (categoryId: string): boolean => {
    if (categoryId === 'essential') return true;
    if (!cookieConsent) return false;
    
    switch (categoryId) {
      case 'analytics':
        return cookieConsent.analytics;
      case 'marketing':
        return cookieConsent.marketing;
      case 'functional':
        return cookieConsent.functional;
      default:
        return false;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };



  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
            <CakeIcon className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Cookie Policy
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
          We use cookies to enhance your browsing experience, serve personalized content, 
          and analyze our traffic. Learn about the cookies we use and how you can control them.
        </p>
      </motion.div>

      {/* Current Consent Status */}
      {cookieConsent && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
                Your Cookie Preferences
              </h2>
              <div className="text-sm text-gray-500">
                Last updated: {new Date(cookieConsent.timestamp).toLocaleDateString()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { key: 'essential', label: 'Essential', value: true },
                { key: 'analytics', label: 'Analytics', value: cookieConsent.analytics },
                { key: 'marketing', label: 'Marketing', value: cookieConsent.marketing },
                { key: 'functional', label: 'Functional', value: cookieConsent.functional }
              ].map(({ key, label, value }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{label}</span>
                  <div className={`flex items-center ${value ? 'text-green-600' : 'text-red-600'}`}>
                    {value ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <XCircleIcon className="h-5 w-5" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowConsentManager(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Preferences
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Clear All Cookies
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* What Are Cookies Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        className="mb-8"
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <InformationCircleIcon className="h-7 w-7 text-blue-600 mr-3" />
            What Are Cookies?
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
              They are widely used to make websites work more efficiently, as well as to provide information to website owners.
            </p>
            <p className="text-gray-600 mb-4">
              At Vardhman Mills, we use cookies to improve your shopping experience, remember your preferences, 
              and provide you with relevant content and advertisements.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Cookie Categories */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Types of Cookies We Use
        </h2>
        <div className="space-y-4">
          {policyData.categories.map((category) => {
            const IconComponent = getCategoryIcon(category.id);
            const isExpanded = expandedCategories.has(category.id);
            const isEnabled = getCategoryStatus(category.id);

            return (
              <div key={category.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg mr-4 ${
                        category.id === 'essential' 
                          ? 'bg-green-100 text-green-600'
                          : isEnabled 
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          {category.name}
                          {category.required && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Required
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-600 mt-1">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center ${isEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                        {isEnabled ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                          <XCircleIcon className="h-5 w-5" />
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 bg-gray-50"
                    >
                      <div className="p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Cookies in this category:</h4>
                        <div className="space-y-3">
                          {category.cookies.map((cookie, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                  <span className="text-sm font-medium text-gray-500">Name</span>
                                  <p className="text-gray-900 font-mono text-sm">{cookie.name}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">Provider</span>
                                  <p className="text-gray-900">{cookie.provider}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">Expiry</span>
                                  <p className="text-gray-900">{cookie.expiry}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">Purpose</span>
                                  <p className="text-gray-900 text-sm">{cookie.purpose}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Your Rights Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
        className="mb-8"
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <EyeIcon className="h-7 w-7 text-blue-600 mr-3" />
            Your Rights and Choices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Control Cookie Settings</h3>
                  <p className="text-gray-600 text-sm">You can enable or disable non-essential cookies at any time through our cookie manager.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Browser Settings</h3>
                  <p className="text-gray-600 text-sm">Most browsers allow you to manage cookies through their settings menu.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Clear Stored Data</h3>
                  <p className="text-gray-600 text-sm">You can delete all cookies and reset your preferences using the clear button above.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Opt-out Options</h3>
                  <p className="text-gray-600 text-sm">You can opt out of analytics and marketing cookies without affecting essential functionality.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Policy Updates */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
        className="mb-8"
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <DocumentTextIcon className="h-7 w-7 text-blue-600 mr-3" />
            Policy Updates
          </h2>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 mb-2">
                <strong>Last Updated:</strong> {policyData.lastUpdated}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Version:</strong> {policyData.version}
              </p>
              <p className="text-gray-600">
                We may update this Cookie Policy from time to time. When we do, we will post the updated policy 
                on this page and update the &quot;Last Updated&quot; date above.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Information */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Contact Us
          </h2>
          <p className="text-gray-600 mb-6">
            If you have any questions about our use of cookies, please contact us:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <EnvelopeIcon className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-gray-600">{policyData.contactInfo.email}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <PhoneIcon className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Phone</h3>
                <p className="text-gray-600">{policyData.contactInfo.phone}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPinIcon className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Address</h3>
                <p className="text-gray-600">{policyData.contactInfo.address}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cookie Consent Manager Modal */}
      <AnimatePresence>
        {showConsentManager && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowConsentManager(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Manage Cookie Preferences</h3>
                <p className="text-gray-600 mt-2">
                  Choose which cookies you want to allow. Essential cookies cannot be disabled.
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {policyData.categories.map((category) => {
                    const isEnabled = getCategoryStatus(category.id);
                    const IconComponent = getCategoryIcon(category.id);

                    return (
                      <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center flex-1">
                          <div className={`p-2 rounded-lg mr-3 ${
                            category.required 
                              ? 'bg-green-100 text-green-600'
                              : isEnabled 
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-400'
                          }`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{category.name}</h4>
                            <p className="text-sm text-gray-600">{category.description}</p>
                          </div>
                        </div>
                        <div className="ml-4">
                          {category.required ? (
                            <span className="text-sm text-green-600 font-medium">Always Active</span>
                          ) : (
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={(e) => handleConsentChange(category.id, e.target.checked)}
                                className="sr-only peer"
                                aria-label={`Toggle ${category.name} cookies`}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex flex-wrap gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowConsentManager(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Save & Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CookiePolicyContent;
