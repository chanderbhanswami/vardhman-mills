'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  BookmarkIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ScaleIcon,
  UserGroupIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  BookmarkIcon as BookmarkSolidIcon,
  DocumentTextIcon as DocumentTextSolidIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import {
  LegalLayout,
  LegalSidebar,
  TermsConditionsContent,
  defaultTermsConditionsData,
  formatDate,
  formatLegalDate,
  generateTermsAcceptanceRecord,
  animations,
  defaultTransition,
  hoverAnimations
} from '@/components/legal';
import { Badge, Button, Breadcrumbs } from '@/components/ui';
import { cn } from '@/lib/utils';

// Metadata for the page
// Metadata removed (cannot be exported from client components)
export default function TermsConditionsPage() {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [showSidebar] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedObligation, setExpandedObligation] = useState<string | null>(null);
  const [showAcceptanceConfirmation, setShowAcceptanceConfirmation] = useState(false);

  const policyData = defaultTermsConditionsData;

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
      label: 'Terms & Conditions',
      href: '/legal-info/terms-conditions',
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
      id: 'definitions',
      title: 'Definitions',
      href: '#definitions',
      icon: DocumentTextIcon
    },
    {
      id: 'acceptance',
      title: 'Terms Acceptance',
      href: '#acceptance',
      icon: CheckBadgeIcon
    },
    {
      id: 'user-obligations',
      title: 'User Obligations',
      href: '#user-obligations',
      icon: UserGroupIcon,
      subsections: policyData.userObligations.map(obligation => ({
        id: `obligation-${obligation.id}`,
        title: obligation.title,
        href: `#obligation-${obligation.id}`
      }))
    },
    {
      id: 'service-limitations',
      title: 'Service Limitations',
      href: '#service-limitations',
      icon: ExclamationTriangleIcon
    },
    {
      id: 'payment-terms',
      title: 'Payment Terms',
      href: '#payment-terms',
      icon: BanknotesIcon
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      href: '#intellectual-property',
      icon: LockClosedIcon
    },
    {
      id: 'dispute-resolution',
      title: 'Dispute Resolution',
      href: '#dispute-resolution',
      icon: ScaleIcon,
      subsections: policyData.disputeResolution.map(step => ({
        id: `dispute-${step.id}`,
        title: `Step ${step.step}: ${step.title}`,
        href: `#dispute-${step.id}`
      }))
    },
    {
      id: 'governing-law',
      title: 'Governing Law',
      href: '#governing-law',
      icon: BuildingOfficeIcon
    },
    {
      id: 'contact',
      title: 'Legal Contact',
      href: '#contact',
      icon: EnvelopeIcon
    }
  ], [policyData.userObligations, policyData.disputeResolution]);

  // Importance badge variants
  const importanceBadgeVariant = (importance: 'high' | 'medium' | 'low') => {
    switch (importance) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  // Load bookmark and acceptance status on mount
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('legalBookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(window.location.pathname));

    const acceptanceRecord = localStorage.getItem('termsAcceptance');
    if (acceptanceRecord) {
      const record = JSON.parse(acceptanceRecord);
      setTermsAccepted(record.version === policyData.version);
    }
  }, [policyData.version]);

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

  // Accept terms
  const handleAcceptTerms = () => {
    const record = generateTermsAcceptanceRecord('user-id', policyData.version);
    localStorage.setItem('termsAcceptance', JSON.stringify(record));
    setTermsAccepted(true);
    setShowAcceptanceConfirmation(true);

    setTimeout(() => {
      setShowAcceptanceConfirmation(false);
    }, 3000);
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
    const pdfContent = `Terms & Conditions - Vardhman Mills\n\nVersion: ${policyData.version}\nLast Updated: ${formatDate(policyData.lastUpdated)}\n\n[Terms content would be here]`;
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vardhman-mills-terms-conditions.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Terms & Conditions - Vardhman Mills',
          text: 'Read our Terms & Conditions',
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
        className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 z-50 origin-left"
        style={{ scaleX: readingProgress / 100 }}
        initial={{ scaleX: 0 }}
      />

      {/* Acceptance Confirmation Toast */}
      {showAcceptanceConfirmation && (
        <motion.div
          className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-6 h-6" />
            <div>
              <p className="font-bold">Terms Accepted</p>
              <p className="text-sm">Your acceptance has been recorded</p>
            </div>
          </div>
        </motion.div>
      )}

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
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <DocumentTextSolidIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Terms & Conditions
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
                      <span className="font-medium text-gray-900 dark:text-white">15 min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sections:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {policyData.sections.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrint}
                      className="flex-1"
                      title="Print terms"
                    >
                      <PrinterIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownload}
                      className="flex-1"
                      title="Download terms"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleShare}
                      className="flex-1"
                      title="Share terms"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={isBookmarked ? 'default' : 'outline'}
                      onClick={toggleBookmark}
                      className="flex-1"
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark terms'}
                    >
                      {isBookmarked ? (
                        <BookmarkSolidIcon className="w-4 h-4" />
                      ) : (
                        <BookmarkIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Acceptance Status */}
                <div className={cn(
                  'rounded-xl p-6 border-2',
                  termsAccepted
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700'
                    : 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-700'
                )}>
                  <div className="flex items-center gap-2 mb-3">
                    {termsAccepted ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <ExclamationCircleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    )}
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {termsAccepted ? 'Terms Accepted' : 'Action Required'}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    {termsAccepted 
                      ? `You accepted version ${policyData.version} of our terms.`
                      : 'Please review and accept our terms to continue using our services.'}
                  </p>
                  {!termsAccepted && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleAcceptTerms}
                      className="w-full"
                    >
                      <CheckBadgeIcon className="w-4 h-4 mr-2" />
                      Accept Terms
                    </Button>
                  )}
                </div>

                {/* Company Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BuildingOfficeIcon className="w-5 h-5 text-indigo-600" />
                    Company Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {policyData.companyInfo.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      {policyData.companyInfo.registrationNumber}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      {policyData.companyInfo.address}
                    </p>
                  </div>
                </div>

                {/* Jurisdiction */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2 mb-3">
                    <GlobeAltIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Jurisdiction
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p><strong>Country:</strong> {policyData.governingLaw.jurisdiction}</p>
                    <p><strong>Court:</strong> {policyData.governingLaw.court}</p>
                    <p><strong>Language:</strong> {policyData.governingLaw.language}</p>
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
              title="Terms & Conditions"
              description="Legal agreement governing the use of Vardhman Mills services"
              lastUpdated={policyData.lastUpdated}
              version={policyData.version}
            >
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                </div>
              }>
                <TermsConditionsContent />
              </Suspense>

              {/* Legal Definitions */}
              <motion.section
                id="definitions-detailed"
                className="mt-12"
                {...animations.fadeInUp}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Key Definitions
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {policyData.definitions.map((definition, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...defaultTransition, delay: index * 0.05 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                    >
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        {definition.term}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {definition.definition}
                      </p>
                      {definition.context && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                          Context: {definition.context}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Terms Sections with Importance */}
              <motion.section
                id="terms-sections-detailed"
                className="mt-12"
                {...animations.fadeInUp}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Terms Overview by Importance
                </h2>
                <div className="space-y-4">
                  {policyData.sections.map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...defaultTransition, delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => setExpandedSection(
                          expandedSection === section.id ? null : section.id
                        )}
                        className={cn(
                          'w-full text-left bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all',
                          expandedSection === section.id
                            ? 'border-indigo-500 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {section.title}
                          </h3>
                          <Badge 
                            variant={importanceBadgeVariant(section.importance)}
                            className="ml-2"
                          >
                            {section.importance.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {section.content.substring(0, 200)}...
                        </p>

                        {section.lastUpdated && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <ClockIcon className="w-4 h-4" />
                            <span>Last updated: {formatLegalDate(section.lastUpdated)}</span>
                          </div>
                        )}

                        {expandedSection === section.id && section.subsections && (
                          <motion.div
                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                              Subsections:
                            </h4>
                            <div className="space-y-3">
                              {section.subsections.map((subsection, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                  <h5 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                                    {subsection.title}
                                  </h5>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    {subsection.content}
                                  </p>
                                  {subsection.examples && subsection.examples.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Examples:
                                      </p>
                                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                        {subsection.examples.map((example, eidx) => (
                                          <li key={eidx} className="flex items-start gap-1">
                                            <span className="text-indigo-600">•</span>
                                            <span>{example}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* User Obligations */}
              <motion.section
                id="user-obligations-detailed"
                className="mt-12"
                {...animations.fadeInUp}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <UserGroupIcon className="w-10 h-10 text-blue-600" />
                  Your Obligations as a User
                </h2>
                <div className="space-y-4">
                  {policyData.userObligations.map((obligation, index) => (
                    <motion.div
                      key={obligation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...defaultTransition, delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => setExpandedObligation(
                          expandedObligation === obligation.id ? null : obligation.id
                        )}
                        className={cn(
                          'w-full text-left bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all',
                          expandedObligation === obligation.id
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Badge variant="secondary" className="mb-2">
                              {obligation.category}
                            </Badge>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {obligation.title}
                            </h3>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {obligation.description}
                        </p>

                        {expandedObligation === obligation.id && (
                          <motion.div
                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            {obligation.examples && obligation.examples.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                  Examples:
                                </h4>
                                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                  {obligation.examples.map((example, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <CheckCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                      <span>{example}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {obligation.consequences && (
                              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                                <div className="flex items-start gap-2">
                                  <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                                      Consequences of Non-Compliance:
                                    </h4>
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                      {obligation.consequences}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Service Limitations */}
              <motion.section
                id="service-limitations-detailed"
                className="mt-12"
                {...animations.fadeInUp}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-10 h-10 text-yellow-600" />
                  Service Limitations & Disclaimers
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {policyData.serviceLimitations.map((limitation, index) => (
                    <motion.div
                      key={limitation.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ ...defaultTransition, delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-700"
                    >
                      <Badge variant="warning" className="mb-3">
                        {limitation.category}
                      </Badge>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {limitation.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {limitation.description}
                      </p>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-3">
                        <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                          Scope:
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          {limitation.scope}
                        </p>
                      </div>
                      {limitation.exceptions && limitation.exceptions.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                            Exceptions:
                          </p>
                          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {limitation.exceptions.map((exception, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-yellow-600">•</span>
                                <span>{exception}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Dispute Resolution Process */}
              <motion.section
                id="dispute-resolution-detailed"
                className="mt-12"
                {...animations.fadeInUp}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <ScaleIcon className="w-10 h-10 text-purple-600" />
                  Dispute Resolution Process
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Follow these steps to resolve any disputes or complaints regarding our services.
                </p>
                <div className="space-y-4">
                  {policyData.disputeResolution.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...defaultTransition, delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {step.description}
                          </p>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            {step.timeframe && (
                              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <ClockIcon className="w-5 h-5 text-purple-600" />
                                <span><strong>Timeframe:</strong> {step.timeframe}</span>
                              </div>
                            )}

                            {step.requirements && step.requirements.length > 0 && (
                              <div className="md:col-span-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                  Requirements:
                                </p>
                                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                  {step.requirements.map((req, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <CheckCircleIcon className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                      <span>{req}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            </LegalLayout>

            {/* Legal Contact CTA */}
            <motion.div
              className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700"
              {...animations.fadeInUp}
              transition={{ ...defaultTransition, delay: 0.3 }}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-600 rounded-lg">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Questions About Our Terms?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4" />
                      {policyData.contactInfo.legal}
                      <span className="mx-2">|</span>
                      <PhoneIcon className="w-4 h-4" />
                      {policyData.companyInfo.phone}
                    </p>
                  </div>
                </div>
                <Link href="/contact?dept=legal">
                  <Button variant="default" size="lg">
                    Contact Legal Team
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
                    whileHover={hoverAnimations.lift}
                  >
                    <div className="flex items-start gap-4">
                      <ShieldCheckIcon className="w-10 h-10 text-purple-600 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          Privacy Policy
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          Learn how we protect your personal data and privacy
                        </p>
                        <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center gap-1">
                          Read Policy
                          <ChevronRightIcon className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                <Link href="/legal-info/return-policy">
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                    whileHover={hoverAnimations.lift}
                  >
                    <div className="flex items-start gap-4">
                      <CheckCircleIcon className="w-10 h-10 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          Return Policy
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          Understand our return and refund process
                        </p>
                        <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center gap-1">
                          Read Policy
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
