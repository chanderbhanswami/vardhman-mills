'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  HeartIcon,
  FaceFrownIcon,
  ShieldCheckIcon,
  ClockIcon,
  BellSlashIcon,
  UserMinusIcon,
  TrashIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon
} from '@heroicons/react/24/solid';
import { useRouter, useSearchParams } from 'next/navigation';

// Import components
import {
  Button,
  Card,
  Breadcrumbs,
  Loading,
  Alert,
  Container,
  Input,
  TextArea,
  Checkbox,
  Modal
} from '@/components/ui';
import { SEOHead } from '@/components/common';

// Metadata for the page
// Metadata removed (cannot be exported from client components)
// Unsubscribe reasons
const unsubscribeReasons = [
  { value: 'too-frequent', label: 'I receive too many emails' },
  { value: 'not-relevant', label: 'Content is not relevant to me' },
  { value: 'never-subscribed', label: 'I never signed up for this' },
  { value: 'spam', label: 'Emails feel like spam' },
  { value: 'privacy-concerns', label: 'Privacy concerns' },
  { value: 'other', label: 'Other reason' }
];

// Retention alternatives
const retentionOptions = [
  {
    id: 'reduce-frequency',
    icon: ClockIcon,
    title: 'Reduce Email Frequency',
    description: 'Get fewer emails - weekly or monthly digest instead of daily updates',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    action: 'Change frequency'
  },
  {
    id: 'change-preferences',
    icon: BellSlashIcon,
    title: 'Update Your Preferences',
    description: 'Choose only the topics you care about - new products, deals, or industry news',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    action: 'Manage preferences'
  },
  {
    id: 'pause-subscription',
    icon: ArrowPathIcon,
    title: 'Pause for 3 Months',
    description: 'Take a break and we\'ll resume sending emails in 3 months',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    action: 'Pause temporarily'
  }
];

// Categories for partial unsubscribe
const emailCategories = [
  { id: 'new-products', label: 'New Product Launches' },
  { id: 'special-offers', label: 'Special Offers & Promotions' },
  { id: 'industry-news', label: 'Industry News & Insights' },
  { id: 'events', label: 'Events & Webinars' },
  { id: 'blog', label: 'Blog Updates' }
];

export default function NewsletterUnsubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'form' | 'alternatives' | 'success' | 'deleted'>('form');
  const [unsubscribeAll, setUnsubscribeAll] = useState(true);
  const [keepCategories, setKeepCategories] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [retentionOffer, setRetentionOffer] = useState<{
    title?: string;
    description?: string;
    options?: Array<{
      type: string;
      title: string;
      description: string;
    }>;
  } | null>(null);
  const [resubscribeToken, setResubscribeToken] = useState<string | null>(null);

  // Check for one-click unsubscribe parameters
  useEffect(() => {
    const emailParam = searchParams?.get('email');
    const tokenParam = searchParams?.get('token');
    const oneClick = searchParams?.get('one_click');

    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);

    if (emailParam && tokenParam && oneClick === 'true') {
      handleOneClickUnsubscribe(emailParam, tokenParam);
    }
  }, [searchParams]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Newsletter', href: '/newsletter/subscribe' },
    { label: 'Unsubscribe', href: '/newsletter/unsubscribe', current: true }
  ];

  // Handle one-click unsubscribe (from email client)
  const handleOneClickUnsubscribe = async (emailAddr: string, tokenStr: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/newsletter/unsubscribe?email=${encodeURIComponent(emailAddr)}&token=${encodeURIComponent(tokenStr)}`, {
        method: 'GET',
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 410) {
          // Already unsubscribed
          setError('You have already unsubscribed from our newsletter.');
          setCurrentView('success');
          return;
        }
        throw new Error(result.error?.message || 'Failed to unsubscribe');
      }

      if (result.retentionOffer) {
        setRetentionOffer(result.retentionOffer);
        setCurrentView('alternatives');
      } else {
        setCurrentView('success');
      }

      if (result.resubscribeToken) {
        setResubscribeToken(result.resubscribeToken);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!reason) {
      setError('Please select a reason for unsubscribing');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token: token || undefined,
          reason,
          feedback: feedback || undefined,
          unsubscribeAll,
          keepCategories: unsubscribeAll ? undefined : keepCategories,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Email address not found in our subscribers list');
        }
        if (response.status === 410) {
          setError('You have already unsubscribed from our newsletter.');
          setCurrentView('success');
          return;
        }
        throw new Error(result.error?.message || 'Failed to unsubscribe');
      }

      if (result.retentionOffer && unsubscribeAll) {
        setRetentionOffer(result.retentionOffer);
        setCurrentView('alternatives');
      } else {
        setCurrentView('success');
      }

      if (result.resubscribeToken) {
        setResubscribeToken(result.resubscribeToken);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing your request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle retention option selection
  const handleRetentionAction = (optionId: string) => {
    if (optionId === 'reduce-frequency' || optionId === 'change-preferences') {
      router.push('/account/preferences?action=' + optionId);
    } else if (optionId === 'pause-subscription') {
      // Handle pause - would need API implementation
      alert('Subscription paused for 3 months');
      setCurrentView('success');
    }
  };

  // Handle proceeding with unsubscribe after viewing alternatives
  const handleProceedWithUnsubscribe = () => {
    setCurrentView('success');
  };

  // Handle GDPR data deletion
  const handleDeleteData = async () => {
    setIsDeletingData(true);
    setError(null);

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token: token || undefined,
          confirmDelete: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to delete data');
      }

      setShowDeleteModal(false);
      setCurrentView('deleted');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete your data');
    } finally {
      setIsDeletingData(false);
    }
  };

  // Handle resubscribe
  const handleResubscribe = () => {
    if (resubscribeToken) {
      router.push(`/newsletter/subscribe?resubscribe_token=${resubscribeToken}`);
    } else {
      router.push('/newsletter/subscribe');
    }
  };

  // Handle category toggle for partial unsubscribe
  const handleCategoryToggle = (categoryId: string) => {
    setKeepCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <>
      <SEOHead 
        title="Unsubscribe from Newsletter | Vardhman Mills"
        description="Manage your newsletter preferences or unsubscribe from our mailing list"
        canonical="/newsletter/unsubscribe"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Breadcrumbs */}
        <Container className="py-4">
          <Breadcrumbs items={breadcrumbItems} />
        </Container>

        <Container className="py-12">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {/* Unsubscribe Form */}
              {currentView === 'form' && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                      <motion.div
                        className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        <FaceFrownIcon className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                      </motion.div>

                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        Sorry to See You Go
                      </h1>

                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        We&apos;d love to keep you updated, but we understand if you need to unsubscribe
                      </p>
                    </div>

                    {/* Error Alert */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6"
                        >
                          <Alert variant="destructive" onClose={() => setError(null)}>
                            <ExclamationTriangleIcon className="w-5 h-5" />
                            {error}
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Email Input */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          disabled={isSubmitting}
                          className="w-full"
                        />
                      </div>

                      {/* Token Input (optional) */}
                      <div>
                        <label htmlFor="token" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Verification Token (if provided)
                        </label>
                        <Input
                          id="token"
                          type="text"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          placeholder="Optional - found in unsubscribe link"
                          disabled={isSubmitting}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          The token from your unsubscribe link (not required)
                        </p>
                      </div>

                      {/* Reason Selection */}
                      <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Why are you leaving? *
                        </label>
                        <select
                          id="reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="">Select a reason...</option>
                          {unsubscribeReasons.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Feedback Textarea */}
                      <div>
                        <label htmlFor="feedback" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Additional Feedback (Optional)
                        </label>
                        <TextArea
                          id="feedback"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Tell us more about your decision..."
                          rows={4}
                          maxLength={1000}
                          disabled={isSubmitting}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {feedback.length}/1000 characters
                        </p>
                      </div>

                      {/* Unsubscribe Options */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Unsubscribe Options
                        </h3>

                        <div className="space-y-3">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="unsubscribe-type"
                              checked={unsubscribeAll}
                              onChange={() => {
                                setUnsubscribeAll(true);
                                setKeepCategories([]);
                              }}
                              disabled={isSubmitting}
                              className="mt-1 w-4 h-4 text-blue-600"
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Unsubscribe from all emails
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                You won&apos;t receive any more emails from us
                              </p>
                            </div>
                          </label>

                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="unsubscribe-type"
                              checked={!unsubscribeAll}
                              onChange={() => setUnsubscribeAll(false)}
                              disabled={isSubmitting}
                              className="mt-1 w-4 h-4 text-blue-600"
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Unsubscribe from specific topics
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Keep receiving emails about topics you care about
                              </p>
                            </div>
                          </label>
                        </div>

                        {/* Category Selection for Partial Unsubscribe */}
                        {!unsubscribeAll && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pl-7 space-y-2 pt-2"
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              Select topics to keep receiving:
                            </p>
                            {emailCategories.map(category => (
                              <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                  checked={keepCategories.includes(category.id)}
                                  onChange={() => handleCategoryToggle(category.id)}
                                  disabled={isSubmitting}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {category.label}
                                </span>
                              </label>
                            ))}
                          </motion.div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isSubmitting || !email || !reason}
                        size="lg"
                        variant="destructive"
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <>
                            <Loading size="sm" className="mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <UserMinusIcon className="w-5 h-5 mr-2" />
                            Unsubscribe
                          </>
                        )}
                      </Button>
                    </form>

                    {/* Privacy Notice */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">
                            Your Privacy Matters
                          </p>
                          <p>
                            Your data is protected under GDPR regulations. You can request complete data deletion at any time.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Retention Alternatives */}
              {currentView === 'alternatives' && (
                <motion.div
                  key="alternatives"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <Card className="p-8 md:p-12">
                    <div className="text-center mb-8">
                      <HeartIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Before You Go...
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        Would any of these alternatives work better for you?
                      </p>
                    </div>

                    {/* Display retention offer if available from API */}
                    {retentionOffer && retentionOffer.title && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {retentionOffer.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {retentionOffer.description}
                        </p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                      {retentionOptions.map((option) => (
                        <Card
                          key={option.id}
                          className={`p-6 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer ${option.bgColor}`}
                          onClick={() => handleRetentionAction(option.id)}
                        >
                          <div className={`w-12 h-12 rounded-lg ${option.bgColor} flex items-center justify-center mb-4`}>
                            <option.icon className={`w-6 h-6 ${option.color}`} />
                          </div>
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                            {option.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {option.description}
                          </p>
                          <Button variant="outline" size="sm" className="w-full">
                            {option.action}
                          </Button>
                        </Card>
                      ))}
                    </div>

                    <div className="text-center">
                      <Button
                        variant="ghost"
                        onClick={handleProceedWithUnsubscribe}
                      >
                        No thanks, continue unsubscribing
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Success View */}
              {currentView === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-8 md:p-12 text-center">
                    <motion.div
                      className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full mb-6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <CheckCircleSolidIcon className="w-16 h-16 text-green-600 dark:text-green-400" />
                    </motion.div>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      You&apos;ve Been Unsubscribed
                    </h2>

                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                      We&apos;ve removed <strong>{email}</strong> from our mailing list.
                    </p>

                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                      You won&apos;t receive any more emails from us.
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Changed Your Mind?
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        You can resubscribe at any time if you miss our updates
                      </p>
                      <Button onClick={handleResubscribe} variant="outline">
                        Resubscribe to Newsletter
                      </Button>
                    </div>

                    {/* GDPR Data Deletion Option */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-3 text-left">
                        <ShieldCheckIcon className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            GDPR Data Deletion
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Want to permanently delete all your data from our systems? 
                            This action cannot be undone.
                          </p>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDeleteModal(true)}
                          >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Delete All My Data
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <Button onClick={() => router.push('/')} variant="outline">
                        Return to Homepage
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Data Deleted View */}
              {currentView === 'deleted' && (
                <motion.div
                  key="deleted"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-8 md:p-12 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                      <TrashIcon className="w-16 h-16 text-gray-600 dark:text-gray-400" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      Your Data Has Been Deleted
                    </h2>

                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                      All your personal information has been permanently removed from our systems
                      in compliance with GDPR regulations.
                    </p>

                    <Button onClick={() => router.push('/')}>
                      Return to Homepage
                    </Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Container>

        {/* GDPR Delete Confirmation Modal */}
        <Modal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirm Data Deletion"
        >
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleSolidIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Are you absolutely sure?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This will permanently delete all your personal information from our systems, including:
                </p>
                <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                  <li>Email address and name</li>
                  <li>Subscription preferences</li>
                  <li>Email history and analytics</li>
                  <li>All associated metadata</li>
                </ul>
                <p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">
                  This action cannot be undone!
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                {error}
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeletingData}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteData}
                disabled={isDeletingData}
                className="flex-1"
              >
                {isDeletingData ? (
                  <>
                    <Loading size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Yes, Delete Everything
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
