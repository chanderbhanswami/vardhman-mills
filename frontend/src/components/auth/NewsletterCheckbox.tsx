/**
 * Newsletter Checkbox Component
 * Checkbox component for newsletter subscription with integrated functionality
 */

'use client';

import React, { useState } from 'react';
import { useNewsletter, NewsletterSubscription } from '../../lib/auth/newsletter';

/**
 * Newsletter Checkbox Props
 */
export interface NewsletterCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  className?: string;
  companyName?: string;
  subscriptionData?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  autoSubscribe?: boolean;
  showStatus?: boolean;
  customText?: string;
}

/**
 * Newsletter Checkbox Component
 */
export const NewsletterCheckbox: React.FC<NewsletterCheckboxProps> = ({
  checked,
  onChange,
  required = false,
  className = '',
  companyName = 'Vardhman Mills',
  subscriptionData,
  autoSubscribe = false,
  showStatus = false,
  customText,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { subscribe, unsubscribe, isLoading, error } = useNewsletter();

  // Handle checkbox change
  const handleChange = async (newChecked: boolean) => {
    onChange(newChecked);

    // Auto-subscribe/unsubscribe if data is provided
    if (autoSubscribe && subscriptionData?.email) {
      setIsProcessing(true);
      setMessage(null);

      try {
        if (newChecked) {
          // Subscribe
          const result = await subscribe({
            email: subscriptionData.email,
            firstName: subscriptionData.firstName,
            lastName: subscriptionData.lastName,
            source: 'website',
          });

          if (result.success) {
            setMessage(
              result.requiresConfirmation
                ? 'Please check your email to confirm subscription'
                : 'Successfully subscribed to newsletter!'
            );
          } else {
            setMessage(result.error || 'Failed to subscribe');
            onChange(false); // Revert checkbox if failed
          }
        } else {
          // Unsubscribe
          const result = await unsubscribe(subscriptionData.email);
          
          if (result.success) {
            setMessage('Successfully unsubscribed from newsletter');
          } else {
            setMessage(result.error || 'Failed to unsubscribe');
            onChange(true); // Revert checkbox if failed
          }
        }
      } catch (err) {
        console.error('Newsletter subscription error:', err);
        setMessage('An error occurred. Please try again.');
        onChange(!newChecked); // Revert checkbox
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const displayText = customText || `Receive latest updates from ${companyName} via email`;

  return (
    <div className={className}>
      <label className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => handleChange(e.target.checked)}
          disabled={isProcessing || isLoading}
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          required={required}
        />
        <div className="flex-1">
          <span className="text-sm text-gray-700">
            {displayText}
            {required && <span className="text-red-500 ml-1">*</span>}
            {(isProcessing || isLoading) && (
              <span className="ml-2 text-blue-600">
                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 inline" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                  <path fill="currentColor" strokeWidth="4" className="opacity-75" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {checked ? 'Subscribing...' : 'Unsubscribing...'}
              </span>
            )}
          </span>
          
          {/* Status Messages */}
          {showStatus && (message || error) && (
            <div className="mt-2">
              {message && (
                <p className={`text-xs ${
                  message.includes('Successfully') || message.includes('confirm')
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {message}
                </p>
              )}
              {error && (
                <p className="text-xs text-red-600">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      </label>
    </div>
  );
};

/**
 * Newsletter Subscription Form Component
 */
export interface NewsletterFormProps {
  onSuccess?: (subscription: NewsletterSubscription | undefined) => void;
  onError?: (error: string) => void;
  className?: string;
  showPreferences?: boolean;
  compactMode?: boolean;
  title?: string;
  description?: string;
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  onSuccess,
  onError,
  className = '',
  showPreferences = false,
  compactMode = false,
  title = 'Subscribe to Newsletter',
  description = 'Get the latest updates and exclusive offers delivered to your inbox.',
}) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    preferences: {
      productUpdates: true,
      promotions: false,
      companyNews: true,
      industryInsights: false,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { subscribe } = useNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      setMessage('Email is required');
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await subscribe({
        email: formData.email,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        preferences: showPreferences ? formData.preferences : undefined,
        source: 'website',
      });

      if (result.success) {
        const successMessage = result.requiresConfirmation
          ? 'Please check your email to confirm your subscription'
          : 'Successfully subscribed to newsletter!';
        
        setMessage(successMessage);
        
        // Reset form
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          preferences: {
            productUpdates: true,
            promotions: false,
            companyNews: true,
            industryInsights: false,
          },
        });

        if (onSuccess) {
          onSuccess(result.subscription);
        }
      } else {
        const errorMessage = result.error || 'Failed to subscribe';
        setMessage(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
      }
    } catch {
      const errorMessage = 'An error occurred. Please try again.';
      setMessage(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (compactMode) {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-2 ${className}`}>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter your email"
          required
          disabled={isSubmitting}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 whitespace-nowrap"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>
        
        {message && (
          <div className="sm:col-span-2 mt-2">
            <p className={`text-sm ${
              message.includes('Successfully') || message.includes('confirm')
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {message}
            </p>
          </div>
        )}
      </form>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="John"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            placeholder="Doe"
          />
        </div>

        {showPreferences && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What would you like to receive?
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferences.productUpdates}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      productUpdates: e.target.checked,
                    }
                  })}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Product Updates</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferences.promotions}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      promotions: e.target.checked,
                    }
                  })}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Promotions & Offers</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferences.companyNews}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      companyNews: e.target.checked,
                    }
                  })}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Company News</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferences.industryInsights}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      industryInsights: e.target.checked,
                    }
                  })}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Industry Insights</span>
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path fill="currentColor" strokeWidth="4" className="opacity-75" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subscribing...
            </span>
          ) : (
            'Subscribe to Newsletter'
          )}
        </button>

        {message && (
          <div className="mt-4">
            <p className={`text-sm ${
              message.includes('Successfully') || message.includes('confirm')
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {message}
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default NewsletterCheckbox;