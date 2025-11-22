'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TruckIcon,
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
  MapPinIcon,
  GlobeAltIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  CubeIcon,
  SparklesIcon,
  BellAlertIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { 
  BookmarkIcon as BookmarkSolidIcon,
  TruckIcon as TruckSolidIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import {
  LegalLayout,
  LegalSidebar,
  ShippingPolicyContent,
  defaultShippingPolicyData,
  formatDate,
  calculateShippingCost,
  getDeliveryEstimate,
  formatShippingCost,
  animations,
  defaultTransition,
  hoverAnimations
} from '@/components/legal';
import { Badge, Button, Breadcrumbs } from '@/components/ui';
import { cn } from '@/lib/utils';

// Metadata for the page
// Metadata removed (cannot be exported from client components)
export default function ShippingPolicyPage() {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [showSidebar] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCostCalculator, setShowCostCalculator] = useState(false);
  const [orderValue, setOrderValue] = useState<number>(0);
  const [weight, setWeight] = useState<number>(1);
  const [destination, setDestination] = useState<string>('');
  const [calculatedCost, setCalculatedCost] = useState<{
    cost: number;
    timeframe: string;
    zone: string;
  } | null>(null);
  const [selectedPackaging, setSelectedPackaging] = useState<string>('standard');
  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  const policyData = defaultShippingPolicyData;

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
      label: 'Shipping Policy',
      href: '/legal-info/shipping-policy',
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
      id: 'domestic-shipping',
      title: 'Domestic Shipping',
      href: '#domestic-shipping',
      icon: MapPinIcon,
      subsections: policyData.domesticZones.map(zone => ({
        id: `domestic-${zone.id}`,
        title: zone.name,
        href: `#domestic-${zone.id}`
      }))
    },
    {
      id: 'international-shipping',
      title: 'International Shipping',
      href: '#international-shipping',
      icon: GlobeAltIcon,
      subsections: policyData.internationalZones.map(zone => ({
        id: `international-${zone.id}`,
        title: zone.name,
        href: `#international-${zone.id}`
      }))
    },
    {
      id: 'delivery-timeframes',
      title: 'Delivery Timeframes',
      href: '#delivery-timeframes',
      icon: ClockIcon
    },
    {
      id: 'tracking-info',
      title: 'Order Tracking',
      href: '#tracking-info',
      icon: BellAlertIcon
    },
    {
      id: 'packaging',
      title: 'Packaging Options',
      href: '#packaging',
      icon: CubeIcon
    },
    {
      id: 'restrictions',
      title: 'Shipping Restrictions',
      href: '#restrictions',
      icon: ExclamationCircleIcon
    },
    {
      id: 'shipping-terms',
      title: 'Shipping Terms',
      href: '#shipping-terms',
      icon: DocumentTextIcon
    },
    {
      id: 'contact',
      title: 'Contact Support',
      href: '#contact',
      icon: DevicePhoneMobileIcon
    }
  ], [policyData.domesticZones, policyData.internationalZones]);

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

  // Calculate shipping cost
  const handleCalculateCost = () => {
    if (!destination || orderValue <= 0 || weight <= 0) {
      setCalculatedCost(null);
      return;
    }

    const result = calculateShippingCost(orderValue, weight, destination, policyData);
    setCalculatedCost(result);
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
    const pdfContent = `Shipping Policy - Vardhman Mills\n\nVersion: ${policyData.version}\nLast Updated: ${formatDate(policyData.lastUpdated)}\n\n[Policy content would be here]`;
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vardhman-mills-shipping-policy.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shipping Policy - Vardhman Mills',
          text: 'Read our Shipping Policy',
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
                      <TruckSolidIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Shipping Policy
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
                      <span className="font-medium text-gray-900 dark:text-white">11 min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Shipping Zones:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {policyData.domesticZones.length + policyData.internationalZones.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Free Shipping:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹2,500+
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

                {/* Cost Calculator */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 mb-3">
                    <BanknotesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Shipping Calculator
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Calculate shipping cost for your order instantly.
                  </p>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setShowCostCalculator(true)}
                    className="w-full"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Calculate Cost
                  </Button>
                </div>

                {/* Shipping Features */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-yellow-500" />
                    Shipping Features
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Real-time order tracking via SMS, Email & WhatsApp
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Free shipping on orders above ₹2,500
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Express delivery available for metro cities
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Insurance included on standard & express shipments
                      </span>
                    </div>
                  </div>
                </div>

                {/* Track Order CTA */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPinIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Track Your Order
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Get real-time updates on your order status and location.
                  </p>
                  <Link href="/track-order">
                    <Button
                      size="sm"
                      variant="default"
                      className="w-full"
                    >
                      <TruckIcon className="w-4 h-4 mr-2" />
                      Track Order
                    </Button>
                  </Link>
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
              title="Shipping Policy"
              description="Comprehensive shipping information for domestic and international orders"
              lastUpdated={policyData.lastUpdated}
              version={policyData.version}
            >
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
              }>
                <ShippingPolicyContent />
              </Suspense>

              {/* Domestic Shipping Zones */}
              <motion.section
                id="domestic-zones-detailed"
                className="mt-12"
                {...animations.fadeInUp}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <MapPinIcon className="w-10 h-10 text-blue-600" />
                  Domestic Shipping Zones
                </h2>
                <div className="space-y-4">
                  {policyData.domesticZones.map((zone, index) => (
                    <motion.div
                      key={zone.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...defaultTransition, delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => setExpandedZone(
                          expandedZone === zone.id ? null : zone.id
                        )}
                        className={cn(
                          'w-full text-left bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all',
                          expandedZone === zone.id
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {zone.name}
                          </h3>
                          <Badge variant="info" className="ml-2">
                            {zone.regions.length} locations
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {zone.standardDelivery.description}
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Standard Cost:</span>
                              <span className="font-bold text-gray-900 dark:text-white">
                                {formatShippingCost(zone.standardDelivery.cost)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Timeframe:</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {zone.standardDelivery.timeframe}
                              </span>
                            </div>
                          </div>
                          {zone.expressDelivery && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Express Cost:</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {formatShippingCost(zone.expressDelivery.cost)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Timeframe:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {zone.expressDelivery.timeframe}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {zone.freeShippingThreshold && (
                          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                            <div className="flex items-center gap-2">
                              <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Free shipping</strong> on orders above ₹{zone.freeShippingThreshold.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}

                        {expandedZone === zone.id && (
                          <motion.div
                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                              Covered Locations:
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {zone.regions.map(region => (
                                <Badge key={region} variant="secondary" className="text-xs">
                                  {region}
                                </Badge>
                              ))}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                  Standard Delivery Features:
                                </h4>
                                <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                  <div className="flex items-center gap-2">
                                    {zone.standardDelivery.trackingIncluded ? (
                                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <XCircleIcon className="w-4 h-4 text-red-600" />
                                    )}
                                    <span>Tracking {zone.standardDelivery.trackingIncluded ? 'Included' : 'Not Available'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {zone.standardDelivery.insuranceIncluded ? (
                                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <XCircleIcon className="w-4 h-4 text-red-600" />
                                    )}
                                    <span>Insurance {zone.standardDelivery.insuranceIncluded ? 'Included' : 'Not Available'}</span>
                                  </div>
                                </div>
                              </div>

                              {zone.expressDelivery && (
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    Express Delivery Features:
                                  </h4>
                                  <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                      <span>Priority Processing</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                      <span>Premium Packaging</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {zone.restrictions && zone.restrictions.length > 0 && (
                              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                                  Restrictions:
                                </h4>
                                <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                                  {zone.restrictions.map((restriction, idx) => (
                                    <li key={idx} className="flex items-start gap-1">
                                      <span className="text-yellow-600">•</span>
                                      <span>{restriction}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* International Shipping Zones */}
              <motion.section
                id="international-zones-detailed"
                className="mt-12"
                {...animations.fadeInUp}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <GlobeAltIcon className="w-10 h-10 text-indigo-600" />
                  International Shipping
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {policyData.internationalZones.map((zone, index) => (
                    <motion.div
                      key={zone.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ ...defaultTransition, delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        {zone.name}
                      </h3>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Shipping Cost:</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {formatShippingCost(zone.standardDelivery.cost)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Delivery Time:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {zone.standardDelivery.timeframe}
                          </span>
                        </div>
                        {zone.freeShippingThreshold && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Free Shipping:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              Above ₹{zone.freeShippingThreshold.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Covered Countries:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {zone.regions.slice(0, 6).map(region => (
                            <Badge key={region} variant="outline" className="text-xs">
                              {region}
                            </Badge>
                          ))}
                          {zone.regions.length > 6 && (
                            <Badge variant="secondary" className="text-xs">
                              +{zone.regions.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {zone.restrictions && zone.restrictions.length > 0 && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                Important Notes:
                              </h4>
                              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                                {zone.restrictions.map((restriction, idx) => (
                                  <li key={idx}>• {restriction}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Packaging Options */}
              <motion.section
                id="packaging-detailed"
                className="mt-12"
                {...animations.fadeInUp}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <CubeIcon className="w-10 h-10 text-purple-600" />
                  Packaging Options
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {policyData.packagingOptions.map((pkg, index) => (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...defaultTransition, delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => setSelectedPackaging(pkg.id)}
                        className={cn(
                          'w-full text-left bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all',
                          selectedPackaging === pkg.id
                            ? 'border-purple-500 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {pkg.name}
                          </h3>
                          <div className="flex gap-2">
                            {pkg.ecoFriendly && (
                              <Badge variant="success" className="text-xs">
                                Eco-Friendly
                              </Badge>
                            )}
                            {pkg.extraCost && (
                              <Badge variant="secondary" className="text-xs">
                                +₹{pkg.extraCost}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {pkg.description}
                        </p>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Suitable For:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {pkg.suitableFor.map((item, idx) => (
                              <Badge key={idx} variant="info" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Tracking Information */}
              <motion.section
                id="tracking-detailed"
                className="mt-12"
                {...animations.fadeInUp}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <BellAlertIcon className="w-10 h-10 text-green-600" />
                  Order Tracking & Notifications
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-green-200 dark:border-green-700">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                        Tracking Features
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              Real-Time Updates
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Track your order in real-time from dispatch to delivery
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              GPS Tracking
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              See exact location of your delivery vehicle
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              Delivery ETA
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Get accurate estimated delivery time
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                        Notification Methods
                      </h3>
                      <div className="space-y-3">
                        {policyData.trackingInfo.notificationMethods.map((method, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              {method === 'Email' && <EnvelopeIcon className="w-5 h-5 text-blue-600" />}
                              {method === 'SMS' && <DevicePhoneMobileIcon className="w-5 h-5 text-blue-600" />}
                              {method === 'WhatsApp' && <BellAlertIcon className="w-5 h-5 text-blue-600" />}
                              {method === 'Push notifications' && <BellAlertIcon className="w-5 h-5 text-blue-600" />}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {method}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-start gap-3">
                      <ShieldCheckIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          Track Your Order Now
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          Visit our tracking portal: <a href={policyData.trackingInfo.trackingPortal} className="text-blue-600 underline">{policyData.trackingInfo.trackingPortal}</a>
                        </p>
                        <Link href="/track-order">
                          <Button size="sm" variant="default">
                            Track Order
                            <ChevronRightIcon className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            </LegalLayout>

            {/* Contact Support */}
            <motion.div
              className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
              {...animations.fadeInUp}
              transition={{ ...defaultTransition, delay: 0.3 }}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <TruckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Questions About Shipping?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Contact our shipping team: {policyData.contactInfo.email} | {policyData.contactInfo.phone}
                    </p>
                  </div>
                </div>
                <Link href="/contact?dept=shipping">
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
                <Link href="/legal-info/return-policy">
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                    whileHover={hoverAnimations.lift}
                  >
                    <div className="flex items-start gap-4">
                      <ShieldCheckIcon className="w-10 h-10 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          Return Policy
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          Learn about our hassle-free return process and refund options
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

      {/* Cost Calculator Modal */}
      <AnimatePresence>
        {showCostCalculator && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCostCalculator(false)}
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
                  Shipping Cost Calculator
                </h3>
                <button
                  onClick={() => setShowCostCalculator(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Destination City
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter city name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    aria-label="Enter destination city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={orderValue || ''}
                    onChange={(e) => setOrderValue(Number(e.target.value))}
                    placeholder="Enter order value"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    aria-label="Enter order value"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    placeholder="Enter weight"
                    min="0.1"
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    aria-label="Enter package weight"
                  />
                </div>
              </div>

              {calculatedCost && (
                <motion.div
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6 border border-blue-200 dark:border-blue-700"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">
                        Shipping Cost: <span className="text-2xl text-blue-600">{formatShippingCost(calculatedCost.cost)}</span>
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Zone: <strong>{calculatedCost.zone}</strong>
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Delivery: <strong>{calculatedCost.timeframe}</strong>
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                        Expected by: <strong>{getDeliveryEstimate(destination)}</strong>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <Button
                variant="default"
                size="lg"
                onClick={handleCalculateCost}
                className="w-full"
              >
                Calculate Shipping Cost
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
