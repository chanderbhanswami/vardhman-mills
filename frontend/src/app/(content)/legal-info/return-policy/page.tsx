'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowPathIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  BookmarkIcon,
  ExclamationCircleIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  ShoppingBagIcon,
  CalendarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingStorefrontIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { 
  BookmarkIcon as BookmarkSolidIcon,
  ArrowPathIcon as ArrowPathSolidIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import {
  LegalLayout,
  LegalSidebar,
  ReturnPolicyContent,
  defaultReturnPolicyData,
  formatDate,
  getReturnEligibility,
  formatReturnTimeframe,
  animations,
  defaultTransition,
  hoverAnimations
} from '@/components/legal';
import { Badge, Button, Breadcrumbs } from '@/components/ui';
import { cn } from '@/lib/utils';

// Metadata for the page
// Metadata removed (cannot be exported from client components)
export default function ReturnPolicyPage() {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [showSidebar] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showEligibilityChecker, setShowEligibilityChecker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>('');
  const [eligibilityResult, setEligibilityResult] = useState<{
    eligible: boolean;
    daysRemaining: number;
    message: string;
  } | null>(null);
  const [expandedProcess, setExpandedProcess] = useState<string | null>(null);
  const [selectedRefundMethod, setSelectedRefundMethod] = useState<string>('original-payment');

  const policyData = defaultReturnPolicyData;

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: 'Home',
      href: '/'
    },
    {
      label: 'Legal Information',
      href: '/legal-info'
    },
    {
      label: 'Return Policy',
      href: '/legal-info/return-policy',
      current: true
    }
  ];

  // Sidebar navigation items
  const sidebarItems = useMemo(() => [
    {
      id: 'introduction',
      title: 'Introduction',
      href: '#introduction',
      icon: InformationCircleIcon
    },
    {
      id: 'eligibility',
      title: 'Return Eligibility',
      href: '#eligibility',
      icon: CheckCircleIcon
    },
    {
      id: 'product-categories',
      title: 'Product Categories',
      href: '#product-categories',
      icon: ShoppingBagIcon,
      subsections: policyData.productCategories.map(cat => ({
        id: `category-${cat.id}`,
        title: cat.name,
        href: `#category-${cat.id}`
      }))
    },
    {
      id: 'return-process',
      title: 'Return Process',
      href: '#return-process',
      icon: ArrowPathIcon,
      subsections: policyData.returnProcess.map(step => ({
        id: `process-${step.step}`,
        title: `Step ${step.step}: ${step.title}`,
        href: `#process-${step.step}`
      }))
    },
    {
      id: 'refund-methods',
      title: 'Refund Methods',
      href: '#refund-methods',
      icon: BanknotesIcon
    },
    {
      id: 'conditions',
      title: 'Return Conditions',
      href: '#conditions',
      icon: ExclamationCircleIcon
    },
    {
      id: 'shipping-info',
      title: 'Shipping Information',
      href: '#shipping-info',
      icon: TruckIcon
    },
    {
      id: 'contact',
      title: 'Contact Support',
      href: '#contact',
      icon: DevicePhoneMobileIcon
    }
  ], [policyData.productCategories, policyData.returnProcess]);

  // Refund method icons
  const refundMethodIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    'original-payment': CreditCardIcon,
    'store-credit': BuildingStorefrontIcon,
    'bank-transfer': BanknotesIcon,
    'cash': CurrencyRupeeIcon
  };

  // Load bookmark status on mount
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('legalBookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(window.location.pathname));
  }, []);

  // Handle scroll for reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));

      // Update active section
      const sections = sidebarItems.map(item => item.id);
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 200) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sidebarItems]);

  // Check return eligibility
  const checkEligibility = () => {
    if (!selectedCategory || !purchaseDate) {
      setEligibilityResult({
        eligible: false,
        daysRemaining: 0,
        message: 'Please select a product category and purchase date'
      });
      return;
    }

    const category = policyData.productCategories.find(cat => cat.id === selectedCategory);
    if (!category) return;

    const purchase = new Date(purchaseDate);
    const today = new Date();
    const daysSincePurchase = differenceInDays(today, purchase);
    const daysRemaining = category.returnWindow - daysSincePurchase;

    const result = getReturnEligibility(selectedCategory, purchaseDate, policyData.productCategories);

    setEligibilityResult({
      eligible: result.eligible,
      daysRemaining: Math.max(0, daysRemaining),
      message: result.reason || (result.eligible ? `You have ${daysRemaining} days remaining to return this item.` : 'This item is not eligible for return.')
    });
  };

  // Handle section navigation
  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle download
  const handleDownload = async () => {
    const pdfContent = `Return Policy - Vardhman Mills\n\nVersion: ${policyData.version}\nLast Updated: ${formatDate(policyData.lastUpdated)}\n\n[Policy content would be here]`;
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vardhman-mills-return-policy.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Return Policy - Vardhman Mills',
          text: 'Read our Return & Refund Policy',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  // Toggle bookmark
  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('legalBookmarks') || '[]');
    const currentUrl = window.location.pathname;
    
    if (isBookmarked) {
      const filtered = bookmarks.filter((bookmark: string) => bookmark !== currentUrl);
      localStorage.setItem('legalBookmarks', JSON.stringify(filtered));
      setIsBookmarked(false);
    } else {
      bookmarks.push(currentUrl);
      localStorage.setItem('legalBookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-green-600 z-50 origin-left"
        style={{ scaleX: readingProgress / 100 }}
        initial={{ scaleX: 0 }}
      />

      {/* Breadcrumbs */}
      <motion.div
        className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 py-4"
        {...animations.fadeIn}
        transition={defaultTransition}
      >
        <div className="container mx-auto px-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          {showSidebar && (
            <motion.aside
              className="lg:w-80 flex-shrink-0"
              {...animations.slideInLeft}
              transition={defaultTransition}
            >
              <div className="sticky top-24 space-y-6">
                {/* Policy Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <ArrowPathSolidIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Return Policy
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Version {policyData.version}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatDate(policyData.lastUpdated).split(' ').slice(0, 3).join(' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Read Time:</span>
                      <span className="font-medium text-gray-900 dark:text-white">10 min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Return Window:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Up to 45 days
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrint}
                      className="flex-1"
                      title="Print policy"
                    >
                      <PrinterIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownload}
                      className="flex-1"
                      title="Download policy"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleShare}
                      className="flex-1"
                      title="Share policy"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={isBookmarked ? 'default' : 'outline'}
                      onClick={toggleBookmark}
                      className="flex-1"
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark policy'}
                    >
                      {isBookmarked ? (
                        <BookmarkSolidIcon className="w-4 h-4" />
                      ) : (
                        <BookmarkIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Quick Eligibility Checker */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Check Eligibility
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Quickly check if your product is eligible for return.
                  </p>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setShowEligibilityChecker(true)}
                    className="w-full"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Check Now
                  </Button>
                </div>

                {/* Return Benefits */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-yellow-500" />
                    Return Benefits
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Free return shipping on orders over ₹2,500
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Extended return window up to 45 days for curtains
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Multiple refund options available
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Quality guaranteed - 100% satisfaction
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <LegalSidebar
                  navItems={sidebarItems.map(item => ({
                    ...item,
                    isActive: activeSection === item.id
                  }))}
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                />
              </div>
            </motion.aside>
          )}

          {/* Main Content */}
          <motion.main
            className="flex-1 min-w-0"
            {...animations.fadeInUp}
            transition={{ ...defaultTransition, delay: 0.1 }}
          >
            <LegalLayout
              title="Return & Refund Policy"
              description="Hassle-free returns and refunds for all Vardhman Mills products"
              lastUpdated={policyData.lastUpdated}
              version={policyData.version}
            >
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
                </div>
              }>
                <ReturnPolicyContent />
              </Suspense>

              {/* Product Categories with Return Windows */}
              <motion.section
                id="product-categories-detailed"
                className="mt-12"
                {...animations.fadeInUp}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Product Return Windows
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {policyData.productCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...defaultTransition, delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                        <Badge
                          variant={category.returnable ? 'success' : 'destructive'}
                          className="ml-2"
                        >
                          {category.returnable ? formatReturnTimeframe(category.returnWindow) : 'Non-Returnable'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {category.description}
                      </p>
                      {category.returnable && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <ClockIcon className="w-4 h-4 text-green-600" />
                            <span>Return window: <strong>{category.returnWindow} days</strong></span>
                          </div>
                          {category.conditions && category.conditions.length > 0 && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Conditions:
                              </h4>
                              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                {category.conditions.map((condition, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-green-600">•</span>
                                    <span>{condition}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      {!category.returnable && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700 dark:text-red-300">
                            This category is not eligible for returns due to customization or hygiene reasons.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Return Process Steps */}
              <motion.section
                id="return-process-detailed"
                className="mt-12"
                {...animations.fadeInUp}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <ArrowPathSolidIcon className="w-10 h-10 text-green-600" />
                  Step-by-Step Return Process
                </h2>
                <div className="space-y-4">
                  {policyData.returnProcess.map((step, index) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...defaultTransition, delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => setExpandedProcess(
                          expandedProcess === step.step.toString() ? null : step.step.toString()
                        )}
                        className={cn(
                          'w-full text-left bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all',
                          expandedProcess === step.step.toString()
                            ? 'border-green-500 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0',
                            expandedProcess === step.step.toString()
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          )}>
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {step.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              {step.description}
                            </p>

                            {expandedProcess === step.step.toString() && (
                              <motion.div
                                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                {step.estimatedTime && (
                                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-3">
                                    <ClockIcon className="w-5 h-5 text-green-600" />
                                    <span>Estimated time: <strong>{step.estimatedTime}</strong></span>
                                  </div>
                                )}
                                {step.requirements && step.requirements.length > 0 && (
                                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                      Requirements:
                                    </h4>
                                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                      {step.requirements.map((req, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                          <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                          <span>{req}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Refund Methods Comparison */}
              <motion.section
                id="refund-methods-detailed"
                className="mt-12"
                {...animations.fadeInUp}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Refund Methods
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {policyData.refundMethods.map((method, index) => {
                    const Icon = refundMethodIcons[method.id] || BanknotesIcon;
                    return (
                      <motion.div
                        key={method.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ ...defaultTransition, delay: index * 0.1 }}
                      >
                        <button
                          onClick={() => setSelectedRefundMethod(method.id)}
                          className={cn(
                            'w-full text-left bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all',
                            selectedRefundMethod === method.id
                              ? 'border-green-500 shadow-lg'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className={cn(
                              'p-3 rounded-lg flex-shrink-0',
                              selectedRefundMethod === method.id
                                ? 'bg-green-600 text-white'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            )}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {method.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {method.description}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Processing Time:</span>
                              <Badge variant="secondary">{method.processingTime}</Badge>
                            </div>
                            {method.fees && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Fees:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {method.fees}
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>

              {/* Shipping Information */}
              <motion.section
                id="shipping-info-detailed"
                className="mt-12"
                {...animations.fadeInUp}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <TruckIcon className="w-10 h-10 text-blue-600" />
                  Return Shipping Information
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                        Return Shipping Address
                      </h3>
                      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <p className="font-medium">{policyData.returnShipping.returnAddress.name}</p>
                        <p>{policyData.returnShipping.returnAddress.addressLine1}</p>
                        {policyData.returnShipping.returnAddress.addressLine2 && (
                          <p>{policyData.returnShipping.returnAddress.addressLine2}</p>
                        )}
                        <p>
                          {policyData.returnShipping.returnAddress.city}, {policyData.returnShipping.returnAddress.state} {policyData.returnShipping.returnAddress.postalCode}
                        </p>
                        <p>{policyData.returnShipping.returnAddress.country}</p>
                        {policyData.returnShipping.returnAddress.phone && (
                          <p className="font-medium">Phone: {policyData.returnShipping.returnAddress.phone}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                        Shipping Costs
                      </h3>
                      <div className="space-y-3">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Free Return Shipping
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            On orders over ₹{policyData.returnShipping.freeReturnThreshold?.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Standard Return
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              ₹{policyData.returnShipping.cost}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            For orders under ₹{policyData.returnShipping.freeReturnThreshold?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            </LegalLayout>

            {/* Quick Contact CTA */}
            <motion.div
              className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-green-200 dark:border-green-700"
              {...animations.fadeInUp}
              transition={{ ...defaultTransition, delay: 0.3 }}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Need Help with a Return?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our support team is here to assist you with the return process
                    </p>
                  </div>
                </div>
                <Link href="/contact?dept=returns">
                  <Button variant="default" size="lg">
                    Contact Support
                    <ChevronRightIcon className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Related Policies */}
            <motion.div
              className="mt-8"
              {...animations.fadeInUp}
              transition={{ ...defaultTransition, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Related Policies
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/legal-info/shipping-policy">
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                    whileHover={hoverAnimations.lift}
                  >
                    <div className="flex items-start gap-4">
                      <TruckIcon className="w-10 h-10 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          Shipping Policy
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          Learn about our shipping rates, delivery times, and tracking options
                        </p>
                        <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                          Read Policy
                          <ChevronRightIcon className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                <Link href="/legal-info/terms-conditions">
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                    whileHover={hoverAnimations.lift}
                  >
                    <div className="flex items-start gap-4">
                      <DocumentTextIcon className="w-10 h-10 text-indigo-600 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          Terms & Conditions
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          Understand the rules for using our services and making purchases
                        </p>
                        <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                          Read Terms
                          <ChevronRightIcon className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </motion.main>
        </div>
      </div>

      {/* Eligibility Checker Modal */}
      <AnimatePresence>
        {showEligibilityChecker && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEligibilityChecker(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Return Eligibility Checker
                </h3>
                <button
                  onClick={() => setShowEligibilityChecker(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    aria-label="Select product category"
                  >
                    <option value="">Select category...</option>
                    {policyData.productCategories.filter(cat => cat.returnable).map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.returnWindow} days)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    aria-label="Select purchase date"
                  />
                </div>
              </div>

              {eligibilityResult && (
                <motion.div
                  className={cn(
                    'p-4 rounded-lg mb-6',
                    eligibilityResult.eligible
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
                  )}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start gap-3">
                    {eligibilityResult.eligible ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      <p className={cn(
                        'font-semibold mb-1',
                        eligibilityResult.eligible ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                      )}>
                        {eligibilityResult.eligible ? 'Eligible for Return' : 'Not Eligible'}
                      </p>
                      <p className={cn(
                        'text-sm',
                        eligibilityResult.eligible ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                      )}>
                        {eligibilityResult.message}
                      </p>
                      {eligibilityResult.eligible && eligibilityResult.daysRemaining > 0 && (
                        <p className="text-sm font-medium text-green-900 dark:text-green-100 mt-2">
                          {eligibilityResult.daysRemaining} days remaining to initiate return
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <Button
                variant="default"
                size="lg"
                onClick={checkEligibility}
                className="w-full"
              >
                Check Eligibility
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
