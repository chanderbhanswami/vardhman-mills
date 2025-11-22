'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ChevronRightIcon,
  LockClosedIcon,
  UserCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  BookmarkIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownCircleIcon,
  StopIcon,
  PauseIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  ServerIcon,
  KeyIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import { 
  BookmarkIcon as BookmarkSolidIcon,
  ShieldCheckIcon as ShieldCheckSolidIcon 
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import {
  LegalLayout,
  LegalSidebar,
  PrivacyPolicyContent,
  defaultPrivacyPolicyData,
  formatDate,
  formatDataRetention,
  getLawfulBasisDescription,
  animations,
  defaultTransition,
  hoverAnimations
} from '@/components/legal';
import { Badge, Button, Breadcrumbs } from '@/components/ui';
import { cn } from '@/lib/utils';

// Metadata for the page
// Metadata removed (cannot be exported from client components)
export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [showSidebar] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedDataRight, setExpandedDataRight] = useState<string | null>(null);
  const [showDataRequestForm, setShowDataRequestForm] = useState(false);
  const [selectedDataCategory, setSelectedDataCategory] = useState<string | null>(null);

  const policyData = defaultPrivacyPolicyData;

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
      label: 'Privacy Policy',
      href: '/legal-info/privacy-policy',
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
      id: 'data-collection',
      title: 'Data Collection',
      href: '#data-collection',
      icon: ServerIcon
    },
    {
      id: 'data-categories',
      title: 'Data Categories',
      href: '#data-categories',
      icon: DocumentTextIcon,
      subsections: policyData.dataCategories.map(cat => ({
        id: `category-${cat.id}`,
        title: cat.name,
        href: `#category-${cat.id}`
      }))
    },
    {
      id: 'data-usage',
      title: 'How We Use Data',
      href: '#data-usage',
      icon: EyeIcon
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing',
      href: '#data-sharing',
      icon: GlobeAltIcon
    },
    {
      id: 'data-security',
      title: 'Data Security',
      href: '#data-security',
      icon: ShieldCheckIcon
    },
    {
      id: 'your-rights',
      title: 'Your Privacy Rights',
      href: '#your-rights',
      icon: UserCircleIcon,
      subsections: policyData.dataRights.map(right => ({
        id: `right-${right.id}`,
        title: right.name,
        href: `#right-${right.id}`
      }))
    },
    {
      id: 'international-transfers',
      title: 'International Transfers',
      href: '#international-transfers',
      icon: GlobeAltIcon
    },
    {
      id: 'children-privacy',
      title: "Children's Privacy",
      href: '#children-privacy',
      icon: ShieldCheckSolidIcon
    },
    {
      id: 'contact',
      title: 'Contact DPO',
      href: '#contact',
      icon: BellAlertIcon
    }
  ], [policyData.dataCategories, policyData.dataRights]);

  // Data rights icon mapping
  const dataRightsIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    access: EyeIcon,
    rectification: PencilIcon,
    erasure: TrashIcon,
    portability: ArrowDownCircleIcon,
    restriction: PauseIcon,
    objection: StopIcon
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
    const pdfContent = `Privacy Policy - Vardhman Mills\n\nVersion: ${policyData.version}\nLast Updated: ${formatDate(policyData.lastUpdated)}\n\n[Policy content would be here]`;
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vardhman-mills-privacy-policy.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Privacy Policy - Vardhman Mills',
          text: 'Read our Privacy Policy',
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
        className="fixed top-0 left-0 right-0 h-1 bg-purple-600 z-50 origin-left"
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
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <ShieldCheckSolidIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Privacy Policy
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
                      <span className="text-gray-600 dark:text-gray-400">Effective Date:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatDate(policyData.effectiveDate).split(' ').slice(0, 3).join(' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Read Time:</span>
                      <span className="font-medium text-gray-900 dark:text-white">12 min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Your Rights:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {policyData.dataRights.length}
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

                {/* GDPR Compliance Badge */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      GDPR Compliant
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    We comply with EU GDPR, California CCPA, and other international privacy regulations.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success" className="text-xs">GDPR</Badge>
                    <Badge variant="success" className="text-xs">CCPA</Badge>
                    <Badge variant="success" className="text-xs">LGPD</Badge>
                    <Badge variant="success" className="text-xs">PIPEDA</Badge>
                  </div>
                </div>

                {/* Quick Data Request */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 mb-3">
                    <KeyIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Exercise Your Rights
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Request access to your data, request deletion, or update your information.
                  </p>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setShowDataRequestForm(true)}
                    className="w-full"
                  >
                    <UserCircleIcon className="w-4 h-4 mr-2" />
                    Submit Data Request
                  </Button>
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
              title="Privacy Policy"
              description="How we collect, use, and protect your personal information"
              lastUpdated={policyData.lastUpdated}
              version={policyData.version}
            >
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
                </div>
              }>
                <PrivacyPolicyContent />
              </Suspense>

              {/* Data Categories Overview */}
              <motion.section
                id="data-categories-overview"
                className="mt-12"
                {...animations.fadeInUp}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Data Categories We Collect
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {policyData.dataCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...defaultTransition, delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => setSelectedDataCategory(
                          selectedDataCategory === category.id ? null : category.id
                        )}
                        className={cn(
                          'w-full text-left bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all',
                          selectedDataCategory === category.id
                            ? 'border-purple-500 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {category.name}
                          </h3>
                          <Badge variant="outline" className="ml-2">
                            {category.dataTypes.length} types
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {category.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <ClockIcon className="w-4 h-4" />
                            <span>Retention: {formatDataRetention(category.retention)}</span>
                          </div>
                          {category.lawfulBasis && (
                            <Badge variant="secondary" className="text-xs">
                              {getLawfulBasisDescription(category.lawfulBasis)}
                            </Badge>
                          )}
                        </div>

                        {selectedDataCategory === category.id && (
                          <motion.div
                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                              Data Types:
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {category.dataTypes.map(type => (
                                <Badge key={type} variant="info" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                              Purpose:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              {category.purpose.map((purpose, idx) => (
                                <li key={idx}>{purpose}</li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Your Privacy Rights */}
              <motion.section
                id="your-rights-detailed"
                className="mt-12"
                {...animations.fadeInUp}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <UserCircleIcon className="w-10 h-10 text-purple-600" />
                  Your Privacy Rights
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  You have comprehensive rights regarding your personal data. Click on each right to learn more about how to exercise it.
                </p>
                <div className="space-y-4">
                  {policyData.dataRights.map((right, index) => {
                    const Icon = dataRightsIcons[right.id] || InformationCircleIcon;
                    return (
                      <motion.div
                        key={right.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...defaultTransition, delay: index * 0.1 }}
                      >
                        <button
                          onClick={() => setExpandedDataRight(
                            expandedDataRight === right.id ? null : right.id
                          )}
                          className={cn(
                            'w-full text-left bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all',
                            expandedDataRight === right.id
                              ? 'border-purple-500 shadow-lg'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              'p-3 rounded-lg flex-shrink-0',
                              expandedDataRight === right.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                            )}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {right.name}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                {right.description}
                              </p>

                              {expandedDataRight === right.id && (
                                <motion.div
                                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                >
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <ExclamationCircleIcon className="w-5 h-5 text-purple-600" />
                                    How to Exercise This Right:
                                  </h4>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                    {right.howToExercise}
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowDataRequestForm(true);
                                    }}
                                  >
                                    <Icon className="w-4 h-4 mr-2" />
                                    Request Now
                                  </Button>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            </LegalLayout>

            {/* Data Protection Officer Contact */}
            <motion.div
              className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-purple-200 dark:border-purple-700"
              {...animations.fadeInUp}
              transition={{ ...defaultTransition, delay: 0.3 }}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <ShieldCheckSolidIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Contact Our Data Protection Officer
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Email: {policyData.dataController.dpoEmail || 'dpo@vardhmanmills.com'}
                    </p>
                  </div>
                </div>
                <Link href="/contact?dept=privacy">
                  <Button variant="default" size="lg">
                    Contact DPO
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
                Related Legal Documents
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/legal-info/cookie-policy">
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                    whileHover={hoverAnimations.lift}
                  >
                    <div className="flex items-start gap-4">
                      <LockClosedIcon className="w-10 h-10 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          Cookie Policy
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          Learn about our cookie usage and tracking technologies
                        </p>
                        <span className="text-purple-600 dark:text-purple-400 text-sm font-medium flex items-center gap-1">
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
                          Understand the rules for using our services
                        </p>
                        <span className="text-purple-600 dark:text-purple-400 text-sm font-medium flex items-center gap-1">
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

      {/* Data Request Modal */}
      {showDataRequestForm && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowDataRequestForm(false)}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Data Request Form
              </h3>
              <button
                onClick={() => setShowDataRequestForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Close"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Submit a request to access, update, or delete your personal data. Our team will respond within 30 days.
            </p>
            <Link href="/contact?dept=privacy&type=data-request">
              <Button variant="default" size="lg" className="w-full">
                Go to Request Form
                <ChevronRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
