'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BellIcon,
  UserGroupIcon,
  TagIcon,
  NewspaperIcon,
  CalendarIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckBadgeIcon,
  ClockIcon,
  StarIcon,
  GiftIcon,
  LightBulbIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import {
  SparklesIcon as SparklesSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
  EnvelopeIcon as EnvelopeSolidIcon
} from '@heroicons/react/24/solid';
import { useRouter, useSearchParams } from 'next/navigation';

// Import components
import { 
  NewsletterForm as FormsNewsletterForm,
  NewsletterPreferences,
  type NewsletterFormData,
  type PreferenceData
} from '@/components/forms';
import {
  Button,
  Badge,
  Card,
  Breadcrumbs,
  Loading,
  Progress,
  Alert,
  Container
} from '@/components/ui';
import { SEOHead } from '@/components/common';

// Metadata for the page
// Metadata removed (cannot be exported from client components)
// Animation variants
const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  },
  slideInLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  }
};

const defaultTransition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
};

// Newsletter benefits data
const newsletterBenefits = [
  {
    icon: TagIcon,
    title: 'Exclusive Discounts',
    description: 'Get access to subscriber-only deals and special promotions before everyone else',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    popular: true
  },
  {
    icon: SparklesIcon,
    title: 'New Product Launches',
    description: 'Be the first to discover our latest fabric collections and textile innovations',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    popular: true
  },
  {
    icon: NewspaperIcon,
    title: 'Industry Insights',
    description: 'Stay informed with market trends, textile industry news, and expert analysis',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    icon: CalendarIcon,
    title: 'Event Invitations',
    description: 'Get exclusive invites to trade shows, exhibitions, and special events',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  },
  {
    icon: LightBulbIcon,
    title: 'Tips & Tutorials',
    description: 'Learn about fabric care, styling tips, and sustainable textile practices',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
  },
  {
    icon: GiftIcon,
    title: 'Birthday Specials',
    description: 'Receive special birthday offers and personalized gift recommendations',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20'
  }
];

// Social proof stats
const socialProofStats = [
  { label: 'Active Subscribers', value: '50,000+', icon: UserGroupIcon },
  { label: 'Open Rate', value: '45%', icon: EnvelopeIcon },
  { label: 'Satisfaction Score', value: '4.8/5', icon: StarIcon },
  { label: 'Weekly Emails', value: '1-2', icon: ClockIcon }
];

// Testimonials
const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Textile Retailer',
    avatar: '/images/avatars/user1.jpg',
    comment: 'The newsletter keeps me updated with the latest trends and exclusive offers. It has significantly helped my business!',
    rating: 5
  },
  {
    name: 'Priya Sharma',
    role: 'Fashion Designer',
    avatar: '/images/avatars/user2.jpg',
    comment: 'Love the early access to new collections! The industry insights are incredibly valuable for my design process.',
    rating: 5
  },
  {
    name: 'Mohammed Ali',
    role: 'Bulk Buyer',
    avatar: '/images/avatars/user3.jpg',
    comment: 'Best textile newsletter! Great content, exclusive deals, and always relevant to my business needs.',
    rating: 5
  }
];

export default function NewsletterSubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState<'form' | 'preferences' | 'success'>('form');
  const [formData, setFormData] = useState<NewsletterFormData | null>(null);
  const [preferences, setPreferences] = useState<PreferenceData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  // Check for verification token in URL
  useEffect(() => {
    const token = searchParams?.get('token');
    const verify = searchParams?.get('verify');
    
    if (token && verify === 'true') {
      handleVerification(token);
    }
  }, [searchParams]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Newsletter', href: '/newsletter/subscribe', current: true }
  ];

  // Handle subscription form submission
  const handleSubscribe = async (data: NewsletterFormData) => {
    setFormData(data);
    setCurrentStep('preferences');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle preferences selection
  const handlePreferencesChange = (prefs: PreferenceData) => {
    setPreferences(prefs);
  };

  // Handle final submission
  const handleFinalSubmit = async () => {
    if (!formData || !preferences) {
      setError('Please complete all required information');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || undefined,
          preferences: {
            newArrivals: preferences.categories.includes('new-products'),
            promotions: preferences.categories.includes('special-offers'),
            productUpdates: preferences.categories.includes('new-products'),
            blog: preferences.categories.includes('industry-news'),
            exclusiveOffers: preferences.categories.includes('special-offers'),
          },
          frequency: preferences.frequency,
          categories: preferences.categories,
          source: formData.source || 'website',
          agreeToTerms: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to subscribe');
      }

      setCurrentStep('success');
      setVerificationSent(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while subscribing');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle email verification
  const handleVerification = async (token: string) => {
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          token,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Verification failed');
      }

      setCurrentStep('success');
      setVerificationSent(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  // Handle going back to previous step
  const handleBack = () => {
    if (currentStep === 'preferences') {
      setCurrentStep('form');
    }
  };

  return (
    <>
      <SEOHead 
        title="Subscribe to Newsletter | Vardhman Mills"
        description="Join thousands of subscribers and get exclusive updates on new products, special offers, and industry insights"
        canonical="/newsletter/subscribe"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Breadcrumbs */}
        <Container className="py-4">
          <Breadcrumbs items={breadcrumbItems} />
        </Container>

        {/* Hero Section */}
        <motion.section
          className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16 overflow-hidden"
          {...animations.fadeIn}
          transition={defaultTransition}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:40px_40px]" />
          </div>

          <Container className="relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto"
              {...animations.fadeInUp}
              transition={{ ...defaultTransition, delay: 0.1 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <EnvelopeSolidIcon className="w-16 h-16" />
                <SparklesSolidIcon className="w-12 h-12 opacity-75" />
                <BellIcon className="w-14 h-14" />
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Subscribe to Our Newsletter
              </h1>

              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Stay Updated with Exclusive Offers, New Arrivals & Industry Insights
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                {socialProofStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...defaultTransition, delay: 0.2 + index * 0.1 }}
                  >
                    <stat.icon className="w-5 h-5" />
                    <span className="font-semibold">{stat.value}</span>
                    <span className="text-sm text-blue-100 hidden sm:inline">{stat.label}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="flex items-center justify-center gap-2 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...defaultTransition, delay: 0.6 }}
              >
                <ShieldCheckIcon className="w-5 h-5" />
                <span>No spam, unsubscribe anytime • GDPR Compliant</span>
              </motion.div>
            </motion.div>
          </Container>
        </motion.section>

        {/* Main Content */}
        <Container className="py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form Area - Left/Center */}
            <div className="lg:col-span-2">
              {/* Progress Indicator */}
              {currentStep !== 'success' && (
                <motion.div
                  className="mb-8"
                  {...animations.fadeInUp}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep === 'form' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'
                      }`}>
                        {currentStep === 'form' ? '1' : <CheckCircleSolidIcon className="w-5 h-5" />}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">Your Info</span>
                    </div>

                    <div className="flex-1 mx-4">
                      <Progress 
                        value={currentStep === 'form' ? 50 : 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep === 'preferences' ? 'bg-blue-600 text-white' : 
                        currentStep === 'form' ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                        'bg-green-500 text-white'
                      }`}>
                        {currentStep === 'preferences' ? '2' : <CheckCircleSolidIcon className="w-5 h-5" />}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">Preferences</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    {...animations.fadeInUp}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <Alert variant="destructive" onClose={() => setError(null)}>
                      <ExclamationCircleIcon className="w-5 h-5" />
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {/* Step 1: Subscription Form */}
                {currentStep === 'form' && (
                  <motion.div
                    key="form"
                    {...animations.slideInRight}
                    transition={defaultTransition}
                  >
                    <Card className="p-6 md:p-8">
                      <FormsNewsletterForm
                        variant="default"
                        showName={true}
                        showPreferences={false}
                        onSubscribe={handleSubscribe}
                        title="Join Our Newsletter"
                        description="Enter your details to start receiving exclusive updates"
                      />
                    </Card>
                  </motion.div>
                )}

                {/* Step 2: Preferences */}
                {currentStep === 'preferences' && (
                  <motion.div
                    key="preferences"
                    {...animations.slideInRight}
                    transition={defaultTransition}
                  >
                    <Card className="p-6 md:p-8">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          Customize Your Experience
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Choose what you&apos;d like to hear about
                        </p>
                      </div>

                      <NewsletterPreferences
                        onPreferencesChange={handlePreferencesChange}
                        showFrequency={true}
                        showLanguage={true}
                        showFormat={true}
                      />

                      <div className="mt-8 flex items-center justify-between gap-4">
                        <Button
                          variant="outline"
                          onClick={handleBack}
                          disabled={isSubmitting}
                        >
                          <ArrowLeftIcon className="w-5 h-5 mr-2" />
                          Back
                        </Button>

                        <Button
                          onClick={handleFinalSubmit}
                          disabled={isSubmitting || !preferences}
                          size="lg"
                        >
                          {isSubmitting ? (
                            <>
                              <Loading size="sm" className="mr-2" />
                              Subscribing...
                            </>
                          ) : (
                            <>
                              Complete Subscription
                              <ArrowRightIcon className="w-5 h-5 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Step 3: Success */}
                {currentStep === 'success' && (
                  <motion.div
                    key="success"
                    {...animations.scaleIn}
                    transition={defaultTransition}
                  >
                    <Card className="p-8 md:p-12 text-center">
                      {/* Success Icon */}
                      <motion.div
                        className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full mb-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <CheckCircleSolidIcon className="w-16 h-16 text-green-600 dark:text-green-400" />
                      </motion.div>

                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Welcome Aboard!
                      </h2>

                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                        Thank you for subscribing to our newsletter. {verificationSent ? "We've sent a confirmation email to" : "Your subscription for"} <strong>{formData?.email}</strong> {verificationSent ? "" : "is confirmed!"}
                      </p>

                      {verificationSent && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                          <div className="flex items-start gap-3">
                            <EnvelopeSolidIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="text-left">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Check Your Email
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Please click the verification link in your email to activate your subscription.
                                If you don&apos;t see it, check your spam folder.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <Button
                          onClick={() => router.push('/')}
                          size="lg"
                          className="w-full sm:w-auto"
                        >
                          Return to Homepage
                        </Button>

                        <div>
                          <Button
                            variant="outline"
                            onClick={() => router.push('/products')}
                            className="w-full sm:w-auto"
                          >
                            Browse Products
                          </Button>
                        </div>
                      </div>

                      {/* What&apos;s Next */}
                      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          What&apos;s Next?
                        </h3>
                        <div className="grid sm:grid-cols-3 gap-4 text-sm">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                              <CheckBadgeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white">Verify Email</p>
                            <p className="text-gray-600 dark:text-gray-400">Click the link we sent</p>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                              <GiftIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white">Get Welcome Offer</p>
                            <p className="text-gray-600 dark:text-gray-400">Special discount inside</p>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                              <StarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white">Enjoy Benefits</p>
                            <p className="text-gray-600 dark:text-gray-400">Exclusive content</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar - Right */}
            <div className="lg:col-span-1">
              <div className="space-y-6 sticky top-24">
                {/* Benefits Card */}
                <motion.div
                  {...animations.fadeInUp}
                  transition={{ ...defaultTransition, delay: 0.2 }}
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5 text-blue-600" />
                      Newsletter Benefits
                    </h3>
                    <div className="space-y-3">
                      {newsletterBenefits.slice(0, 4).map((benefit, index) => (
                        <motion.div
                          key={benefit.title}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          <div className={`p-2 rounded-lg ${benefit.bgColor}`}>
                            <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {benefit.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {benefit.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                {/* Testimonial Card */}
                <motion.div
                  {...animations.fadeInUp}
                  transition={{ ...defaultTransition, delay: 0.4 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                      &ldquo;{testimonials[0].comment}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {testimonials[0].name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {testimonials[0].name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {testimonials[0].role}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  {...animations.fadeInUp}
                  transition={{ ...defaultTransition, delay: 0.5 }}
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                      We Value Your Privacy
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span>No spam, ever</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span>Unsubscribe anytime</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span>GDPR compliant</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span>Secure data encryption</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </Container>

        {/* Full Benefits Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <Container>
            <motion.div
              className="text-center mb-12"
              {...animations.fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Subscribe?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Join thousands of satisfied subscribers and unlock exclusive benefits
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsletterBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  {...animations.fadeInUp}
                  transition={{ ...defaultTransition, delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                    <div className={`w-12 h-12 rounded-lg ${benefit.bgColor} flex items-center justify-center mb-4`}>
                      <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                    </div>
                    {benefit.popular && (
                      <Badge variant="success" className="mb-2">Most Popular</Badge>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {benefit.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Testimonials Section */}
        <section className="py-16">
          <Container>
            <motion.div
              className="text-center mb-12"
              {...animations.fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                What Our Subscribers Say
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Real feedback from our newsletter community
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  {...animations.fadeInUp}
                  transition={{ ...defaultTransition, delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                      &ldquo;{testimonial.comment}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        {currentStep !== 'success' && (
          <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <Container>
              <motion.div
                className="text-center max-w-3xl mx-auto"
                {...animations.fadeInUp}
              >
                <HeartIcon className="w-16 h-16 mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Join our community of 50,000+ subscribers and never miss an update
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-blue-600 hover:bg-blue-50 border-white"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Subscribe Now
                </Button>
              </motion.div>
            </Container>
          </section>
        )}
      </div>
    </>
  );
}
