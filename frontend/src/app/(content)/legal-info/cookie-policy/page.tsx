'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  CakeIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  HomeIcon,
  ScaleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  EyeIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import {
  LegalLayout,
  LegalSidebar,
  CookiePolicyContent,
  type CookieConsent,
  getCookieConsent,
  setCookieConsent,
  defaultCookiePolicyData,
  formatDate,
  animations,
  defaultTransition
} from '@/components/legal';
import { Badge, Button, Breadcrumbs } from '@/components/ui';
import { cn } from '@/lib/utils';

// Metadata for the page
// Metadata removed (cannot be exported from client components)
export default function CookiePolicyPage() {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [showSidebar] = useState(true);
  const [cookieConsent, setCookieConsentState] = useState<CookieConsent | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const policyData = defaultCookiePolicyData;

  // Breadcrumb items - icons like HomeIcon and ScaleIcon can be rendered separately if needed
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
      label: 'Cookie Policy',
      href: '/legal-info/cookie-policy',
      current: true
    }
  ];

  // Additional icon elements for visual enhancement  
  const TimeIcon = ClockIcon;

  // Sidebar navigation items
  const sidebarItems = React.useMemo(() => [
    {
      id: 'introduction',
      title: 'Introduction',
      href: '#introduction',
      icon: CakeIcon
    },
    {
      id: 'what-are-cookies',
      title: 'What Are Cookies?',
      href: '#what-are-cookies',
      icon: DocumentTextIcon
    },
    {
      id: 'types-of-cookies',
      title: 'Types of Cookies',
      href: '#types-of-cookies',
      icon: CogIcon,
      subsections: policyData.categories.map(cat => ({
        id: `cookie-${cat.id}`,
        title: cat.name,
        href: `#cookie-${cat.id}`
      }))
    },
    {
      id: 'manage-cookies',
      title: 'Manage Your Preferences',
      href: '#manage-cookies',
      icon: ShieldCheckIcon
    },
    {
      id: 'browser-settings',
      title: 'Browser Settings',
      href: '#browser-settings',
      icon: CogIcon
    },
    {
      id: 'contact',
      title: 'Contact Us',
      href: '#contact',
      icon: EyeIcon
    }
  ], [policyData.categories]);

  // Load cookie consent on mount
  useEffect(() => {
    const consent = getCookieConsent();
    setCookieConsentState(consent);
    
    // Show banner if no consent recorded
    if (!consent) {
      setShowConsentBanner(true);
    }

    // Check if page is bookmarked
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

      // Update active section based on scroll position
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

  // Handle consent change
  const handleConsentChange = (consent: CookieConsent) => {
    setCookieConsent(consent);
    setCookieConsentState(consent);
    setShowConsentBanner(false);
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
    // In a real implementation, generate and download PDF
    const pdfContent = `Cookie Policy - Vardhman Mills\n\nVersion: ${policyData.version}\nLast Updated: ${formatDate(policyData.lastUpdated)}\n\n[Policy content would be here]`;
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vardhman-mills-cookie-policy.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cookie Policy - Vardhman Mills',
          text: 'Read our Cookie Policy',
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
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-50 origin-left"
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

      {/* Cookie Consent Banner */}
      {showConsentBanner && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t-4 border-blue-600 shadow-2xl z-40 p-6"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={defaultTransition}
        >
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-start gap-4">
              <div className={cn("flex gap-2")}>
                <CakeIcon className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <HomeIcon className="w-4 h-4 text-gray-400 mt-2 opacity-0" />
                <ScaleIcon className="w-4 h-4 text-gray-400 mt-2 opacity-0" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <TimeIcon className="w-5 h-5 text-blue-600" />
                  Cookie Preferences
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                  You can customize your cookie preferences below.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleConsentChange({
                      essential: true,
                      analytics: true,
                      marketing: true,
                      functional: true,
                      timestamp: new Date().toISOString(),
                      version: policyData.version
                    })}
                    variant="default"
                  >
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Accept All Cookies
                  </Button>
                  <Button
                    onClick={() => handleConsentChange({
                      essential: true,
                      analytics: false,
                      marketing: false,
                      functional: false,
                      timestamp: new Date().toISOString(),
                      version: policyData.version
                    })}
                    variant="outline"
                  >
                    <XCircleIcon className="w-5 h-5 mr-2" />
                    Essential Only
                  </Button>
                  <Button
                    onClick={() => setShowConsentBanner(false)}
                    variant="ghost"
                  >
                    Customize
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

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
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <CakeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Cookie Policy
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
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <TimeIcon className="w-4 h-4" />
                        Read Time:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">8 min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Categories:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {policyData.categories.length}
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

                {/* Current Consent Status */}
                {cookieConsent && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Your Preferences
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      {[
                        { key: 'essential', label: 'Essential Cookies', enabled: cookieConsent.essential },
                        { key: 'analytics', label: 'Analytics Cookies', enabled: cookieConsent.analytics },
                        { key: 'marketing', label: 'Marketing Cookies', enabled: cookieConsent.marketing },
                        { key: 'functional', label: 'Functional Cookies', enabled: cookieConsent.functional }
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                          {item.enabled ? (
                            <Badge variant="success" className="text-xs">Enabled</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Disabled</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowConsentBanner(true)}
                      className="w-full mt-4"
                    >
                      <CogIcon className="w-4 h-4 mr-2" />
                      Change Preferences
                    </Button>
                  </div>
                )}

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
              title="Cookie Policy"
              description="Understanding our use of cookies and tracking technologies"
              lastUpdated={policyData.lastUpdated}
              version={policyData.version}
            >
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
              }>
                <CookiePolicyContent onConsentChange={handleConsentChange} />
              </Suspense>
            </LegalLayout>

            {/* Quick Actions Footer */}
            <motion.div
              className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
              {...animations.fadeInUp}
              transition={{ ...defaultTransition, delay: 0.3 }}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Questions about our cookie policy?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Contact our privacy team for assistance
                    </p>
                  </div>
                </div>
                <Link href="/contact?dept=privacy">
                  <Button variant="default" size="lg">
                    Contact Privacy Team
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
                <Link href="/legal-info/privacy-policy">
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex items-start gap-4">
                      <ShieldCheckIcon className="w-10 h-10 text-purple-600 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          Privacy Policy
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          Learn how we collect, use, and protect your personal data
                        </p>
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1">
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
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex items-start gap-4">
                      <DocumentTextIcon className="w-10 h-10 text-indigo-600 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          Terms & Conditions
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          Understand the rules for using our website and services
                        </p>
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1">
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
    </div>
  );
}
