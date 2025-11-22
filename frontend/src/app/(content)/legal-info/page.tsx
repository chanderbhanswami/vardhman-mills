'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  ScaleIcon,
  CakeIcon,
  TruckIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon,
  ChevronRightIcon,
  HomeIcon,
  BookOpenIcon,
  BellAlertIcon,
  LockClosedIcon,
  GlobeAltIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChartBarIcon,
  TagIcon,
  StarIcon as StarOutlineIcon
} from '@heroicons/react/24/outline';
import {
  ShieldCheckIcon as ShieldCheckSolidIcon,
  DocumentTextIcon as DocumentTextSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { 
  LegalCard,
  formatDate,
  animations,
  defaultTransition,
  hoverAnimations
} from '@/components/legal';
import { Badge, Button, Breadcrumbs } from '@/components/ui';
import { cn } from '@/lib/utils';

// Legal documents data
interface LegalDocumentData {
  id: string;
  title: string;
  description: string;
  excerpt: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconSolid: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  category: 'policy' | 'terms' | 'agreement';
  categoryLabel: string;
  lastUpdated: string;
  version: string;
  importance: 'critical' | 'high' | 'medium';
  readTime: number;
  tags: string[];
  status: 'active' | 'updated' | 'new';
  viewCount: number;
  popularity: number;
  relatedDocs: string[];
}

const legalDocuments: LegalDocumentData[] = [
  {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    description: 'Learn how we collect, use, and protect your personal information',
    excerpt: 'Our privacy policy explains our data practices, your rights, and how we safeguard your information in accordance with GDPR, CCPA, and other privacy regulations.',
    icon: ShieldCheckIcon,
    iconSolid: ShieldCheckSolidIcon,
    href: '/legal-info/privacy-policy',
    category: 'policy',
    categoryLabel: 'Privacy',
    lastUpdated: '2024-10-01',
    version: '2.1',
    importance: 'critical',
    readTime: 12,
    tags: ['Privacy', 'Data Protection', 'GDPR', 'Personal Information', 'Security'],
    status: 'updated',
    viewCount: 15234,
    popularity: 95,
    relatedDocs: ['cookie-policy', 'terms-conditions']
  },
  {
    id: 'terms-conditions',
    title: 'Terms & Conditions',
    description: 'Understand the rules and regulations for using our services',
    excerpt: 'These terms govern your use of our website and services, including your rights, obligations, and the legal relationship between you and Vardhman Mills.',
    icon: DocumentTextIcon,
    iconSolid: DocumentTextSolidIcon,
    href: '/legal-info/terms-conditions',
    category: 'terms',
    categoryLabel: 'Legal Terms',
    lastUpdated: '2024-10-01',
    version: '2.3',
    importance: 'critical',
    readTime: 18,
    tags: ['Terms', 'Legal', 'User Agreement', 'Service Rules', 'Obligations'],
    status: 'updated',
    viewCount: 12847,
    popularity: 92,
    relatedDocs: ['privacy-policy', 'return-policy']
  },
  {
    id: 'cookie-policy',
    title: 'Cookie Policy',
    description: 'Information about cookies and tracking technologies we use',
    excerpt: 'Detailed explanation of how we use cookies and similar technologies to enhance your browsing experience, analyze site usage, and personalize content.',
    icon: CakeIcon,
    iconSolid: CakeIcon,
    href: '/legal-info/cookie-policy',
    category: 'policy',
    categoryLabel: 'Privacy',
    lastUpdated: '2024-10-01',
    version: '1.0',
    importance: 'high',
    readTime: 8,
    tags: ['Cookies', 'Tracking', 'Analytics', 'Preferences', 'Consent'],
    status: 'active',
    viewCount: 8456,
    popularity: 78,
    relatedDocs: ['privacy-policy']
  },
  {
    id: 'return-policy',
    title: 'Return & Refund Policy',
    description: 'Guidelines for returning products and requesting refunds',
    excerpt: 'Comprehensive information about our return process, eligibility criteria, timeframes, and refund methods for all product categories.',
    icon: ArrowPathIcon,
    iconSolid: ArrowPathIcon,
    href: '/legal-info/return-policy',
    category: 'policy',
    categoryLabel: 'Commerce',
    lastUpdated: '2024-10-01',
    version: '1.2',
    importance: 'high',
    readTime: 10,
    tags: ['Returns', 'Refunds', 'Exchange', 'Product Policy', 'Customer Service'],
    status: 'updated',
    viewCount: 23456,
    popularity: 98,
    relatedDocs: ['shipping-policy', 'terms-conditions']
  },
  {
    id: 'shipping-policy',
    title: 'Shipping & Delivery Policy',
    description: 'Shipping methods, costs, and delivery timeframes',
    excerpt: 'Complete details about our shipping options, delivery zones, costs, tracking, and what to expect when your order is on its way.',
    icon: TruckIcon,
    iconSolid: TruckIcon,
    href: '/legal-info/shipping-policy',
    category: 'policy',
    categoryLabel: 'Commerce',
    lastUpdated: '2024-10-01',
    version: '1.1',
    importance: 'high',
    readTime: 9,
    tags: ['Shipping', 'Delivery', 'Logistics', 'Tracking', 'International'],
    status: 'active',
    viewCount: 19234,
    popularity: 88,
    relatedDocs: ['return-policy']
  },
  {
    id: 'legal-compliance',
    title: 'Legal Compliance',
    description: 'Our commitment to legal and regulatory compliance',
    excerpt: 'Information about our compliance with international laws, regulations, and industry standards including GDPR, CCPA, and consumer protection laws.',
    icon: ScaleIcon,
    iconSolid: ScaleIcon,
    href: '/legal-info/compliance',
    category: 'agreement',
    categoryLabel: 'Compliance',
    lastUpdated: '2024-09-15',
    version: '1.0',
    importance: 'medium',
    readTime: 7,
    tags: ['Compliance', 'Regulations', 'Standards', 'Legal Framework', 'Governance'],
    status: 'active',
    viewCount: 3421,
    popularity: 65,
    relatedDocs: ['privacy-policy', 'terms-conditions']
  }
];

// Metadata for the page
// Metadata removed (cannot be exported from client components)
// Page component
export default function LegalInfoPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImportance, setSelectedImportance] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'alphabetical'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalDocs: 6,
    totalViews: 82648,
    lastUpdated: '2024-10-01',
    averageReadTime: 11
  });

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: 'Home',
      href: '/'
    },
    {
      label: 'Legal Information',
      href: '/legal-info',
      current: true
    }
  ];

  // Categories for filtering
  const categories = [
    { id: 'all', label: 'All Documents', icon: BookOpenIcon, count: 6 },
    { id: 'policy', label: 'Policies', icon: ShieldCheckIcon, count: 4 },
    { id: 'terms', label: 'Terms', icon: DocumentTextIcon, count: 1 },
    { id: 'agreement', label: 'Agreements', icon: ScaleIcon, count: 1 }
  ];

  const importanceLevels = [
    { id: 'all', label: 'All Levels', count: 6 },
    { id: 'critical', label: 'Critical', count: 2 },
    { id: 'high', label: 'High', count: 3 },
    { id: 'medium', label: 'Medium', count: 1 }
  ];

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = legalDocuments;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        doc.excerpt.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Importance filter
    if (selectedImportance !== 'all') {
      filtered = filtered.filter(doc => doc.importance === selectedImportance);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.popularity - a.popularity;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'recent':
        default:
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedImportance, sortBy]);

  // Featured documents
  const featuredDocuments = useMemo(() => {
    return legalDocuments
      .filter(doc => doc.importance === 'critical')
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 3);
  }, []);

  // Recently updated documents
  const recentlyUpdated = useMemo(() => {
    return legalDocuments
      .filter(doc => doc.status === 'updated')
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 3);
  }, []);

  // Quick links
  const quickLinks = [
    { label: 'Privacy Rights', href: '/legal-info/privacy-policy#data-rights', icon: UserGroupIcon },
    { label: 'Return Process', href: '/legal-info/return-policy#return-process', icon: ArrowPathIcon },
    { label: 'Shipping Zones', href: '/legal-info/shipping-policy#zones', icon: GlobeAltIcon },
    { label: 'Cookie Preferences', href: '/legal-info/cookie-policy#preferences', icon: CakeIcon },
    { label: 'User Obligations', href: '/legal-info/terms-conditions#obligations', icon: CheckCircleIcon },
    { label: 'Contact Legal Team', href: '/contact?dept=legal', icon: EnvelopeIcon }
  ];

  // Calculate stats on mount
  useEffect(() => {
    const totalViews = legalDocuments.reduce((sum, doc) => sum + doc.viewCount, 0);
    const avgReadTime = Math.round(legalDocuments.reduce((sum, doc) => sum + doc.readTime, 0) / legalDocuments.length);
    const mostRecent = legalDocuments.reduce((latest, doc) => 
      new Date(doc.lastUpdated) > new Date(latest) ? doc.lastUpdated : latest
    , legalDocuments[0].lastUpdated);

    setStats({
      totalDocs: legalDocuments.length,
      totalViews,
      lastUpdated: mostRecent,
      averageReadTime: avgReadTime
    });
  }, []);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedImportance('all');
    setSortBy('recent');
  };

  // Get importance badge color
  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">Critical</Badge>;
      case 'high':
        return <Badge variant="warning" className="text-xs">High</Badge>;
      case 'medium':
        return <Badge variant="info" className="text-xs">Medium</Badge>;
      default:
        return null;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'updated':
        return <Badge variant="success" className="text-xs">Recently Updated</Badge>;
      case 'new':
        return <Badge variant="info" className="text-xs">New</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
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

      {/* Hero Section */}
      <motion.section
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16 relative overflow-hidden"
        {...animations.fadeIn}
        transition={defaultTransition}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:40px_40px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            {...animations.fadeInUp}
            transition={{ ...defaultTransition, delay: 0.1 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <ScaleIcon className="w-16 h-16" />
              <LockClosedIcon className="w-12 h-12 opacity-75" />
              <ShieldCheckSolidIcon className="w-16 h-16" />
              <HomeIcon className="w-8 h-8 opacity-50" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Legal Information Center
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Your Complete Guide to Policies, Terms, and Legal Compliance
            </p>

            <p className="text-lg mb-10 text-blue-50 max-w-2xl mx-auto">
              Transparent, comprehensive, and easy-to-understand legal documentation
              for all aspects of your relationship with Vardhman Mills.
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { icon: DocumentTextSolidIcon, label: 'Documents', value: stats.totalDocs },
                { icon: ChartBarIcon, label: 'Total Views', value: stats.totalViews.toLocaleString() },
                { icon: ClockIcon, label: 'Avg. Read Time', value: `${stats.averageReadTime} min` },
                { icon: StarSolidIcon, label: 'Last Updated', value: formatDate(stats.lastUpdated).split(' ').slice(0, 2).join(' ') }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                  transition={defaultTransition}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Documents Section */}
      <motion.section
        className="py-12 bg-white dark:bg-gray-800"
        {...animations.fadeInUp}
        transition={{ ...defaultTransition, delay: 0.2 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <StarSolidIcon className="w-8 h-8 text-yellow-500" />
                Featured Documents
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Most important legal documents you should review
              </p>
            </div>
            <Badge variant="info" className="text-sm">
              <ExclamationCircleIcon className="w-4 h-4 mr-1" />
              Critical Reading
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...defaultTransition, delay: index * 0.1 }}
              >
                <Link href={doc.href}>
                  <motion.div
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-500 h-full hover:shadow-xl transition-all"
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <doc.iconSolid className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                      {getImportanceBadge(doc.importance)}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {doc.title}
                    </h3>

                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                      {doc.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {doc.readTime} min read
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                        Read More
                        <ChevronRightIcon className="w-4 h-4" />
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Search and Filters Section */}
      <motion.section
        className="py-12 bg-gray-50 dark:bg-gray-900"
        {...animations.fadeInUp}
        transition={{ ...defaultTransition, delay: 0.3 }}
      >
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search legal documents by title, keywords, or tags..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <FunnelIcon className="w-4 h-4" />
                Filters
                {(selectedCategory !== 'all' || selectedImportance !== 'all') && (
                  <Badge variant="destructive" className="ml-2">
                    {[selectedCategory !== 'all', selectedImportance !== 'all'].filter(Boolean).length}
                  </Badge>
                )}
              </Button>

              {(selectedCategory !== 'all' || selectedImportance !== 'all' || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear All
                </Button>
              )}

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-bold text-gray-900 dark:text-white">{filteredDocuments.length}</span> of{' '}
                <span className="font-bold text-gray-900 dark:text-white">{legalDocuments.length}</span> documents
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'alphabetical')}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                aria-label="Sort documents by"
                title="Sort documents by"
              >
                <option value="recent">Recently Updated</option>
                <option value="popular">Most Popular</option>
                <option value="alphabetical">A-Z</option>
              </select>

              <div className="flex gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  aria-label="List view"
                  title="List view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={defaultTransition}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8 border border-gray-200 dark:border-gray-700"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <TagIcon className="w-5 h-5 text-blue-600" />
                      Document Category
                    </h3>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={cn(
                            'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all',
                            selectedCategory === category.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <category.icon className="w-5 h-5" />
                            {category.label}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {category.count}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Importance Filter */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ExclamationCircleIcon className="w-5 h-5 text-orange-600" />
                      Importance Level
                    </h3>
                    <div className="space-y-2">
                      {importanceLevels.map(level => (
                        <button
                          key={level.id}
                          onClick={() => setSelectedImportance(level.id)}
                          className={cn(
                            'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all',
                            selectedImportance === level.id
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                          )}
                        >
                          <span>{level.label}</span>
                          <Badge variant="outline" className="ml-2">
                            {level.count}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Documents Grid/List */}
      <motion.section
        className="py-12"
        {...animations.fadeInUp}
        transition={{ ...defaultTransition, delay: 0.4 }}
      >
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {filteredDocuments.length > 0 ? (
              <motion.div
                key="documents-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={defaultTransition}
                className={cn(
                  viewMode === 'grid'
                    ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                )}
              >
                {filteredDocuments.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...defaultTransition, delay: index * 0.05 }}
                  >
                    {viewMode === 'grid' ? (
                      <Link href={doc.href}>
                        <motion.div
                          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 h-full hover:shadow-xl transition-all"
                          whileHover={{ y: -4 }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <doc.icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            <div className="flex flex-col gap-1">
                              {getImportanceBadge(doc.importance)}
                              {getStatusBadge(doc.status)}
                            </div>
                          </div>

                          <Badge variant="outline" className="mb-3 text-xs">
                            {doc.categoryLabel}
                          </Badge>

                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {doc.title}
                          </h3>

                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {doc.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {doc.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {doc.readTime} min
                            </span>
                            <span className="text-xs">
                              Updated: {formatDate(doc.lastUpdated).split(' ').slice(0, 2).join(' ')}
                            </span>
                          </div>
                        </motion.div>
                      </Link>
                    ) : (
                      <Link href={doc.href}>
                        <motion.div
                          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-start gap-6">
                            <doc.icon className="w-12 h-12 text-blue-600 dark:text-blue-400 flex-shrink-0" />

                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <Badge variant="outline" className="mb-2 text-xs">
                                    {doc.categoryLabel}
                                  </Badge>
                                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {doc.title}
                                  </h3>
                                </div>
                                <div className="flex flex-col gap-1">
                                  {getImportanceBadge(doc.importance)}
                                  {getStatusBadge(doc.status)}
                                </div>
                              </div>

                              <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {doc.excerpt}
                              </p>

                              <div className="flex flex-wrap gap-2 mb-4">
                                {doc.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <ClockIcon className="w-4 h-4" />
                                    {doc.readTime} min read
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <ChartBarIcon className="w-4 h-4" />
                                    {doc.viewCount.toLocaleString()} views
                                  </span>
                                  <span>
                                    Version {doc.version}
                                  </span>
                                </div>
                                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                                  Read Document
                                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="no-results"
                className="text-center py-16"
                {...animations.fadeIn}
              >
                <InformationCircleIcon className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No documents found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your filters or search query
                </p>
                <Button onClick={clearFilters} variant="default">
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Recently Updated Section */}
      {recentlyUpdated.length > 0 && (
        <motion.section
          className="py-12 bg-blue-50 dark:bg-gray-900"
          {...animations.fadeInUp}
          transition={{ ...defaultTransition, delay: 0.5 }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <BellAlertIcon className="w-8 h-8 text-blue-600" />
                  Recently Updated
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Latest changes to our legal documents
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {recentlyUpdated.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...defaultTransition, delay: index * 0.1 }}
                >
                  <Link href={doc.href}>
                    <motion.div
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-500 hover:shadow-xl transition-all"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Badge variant="success" className="mb-4">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Updated
                      </Badge>

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {doc.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Last updated on {formatDate(doc.lastUpdated)}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Version {doc.version}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                          View Changes
                          <ChevronRightIcon className="w-4 h-4" />
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Quick Links Section */}
      <motion.section
        className="py-12 bg-gray-50 dark:bg-gray-800"
        {...animations.fadeInUp}
        transition={{ ...defaultTransition, delay: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Quick Links
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Jump directly to specific sections
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...defaultTransition, delay: index * 0.05 }}
              >
                <Link href={link.href}>
                  <motion.div
                    className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all flex items-center gap-3"
                    whileHover={{ x: 4, ...hoverAnimations.scale }}
                  >
                    <link.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {link.label}
                    </span>
                    <ChevronRightIcon className="w-4 h-4 text-gray-400 ml-auto" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          {/* Additional Quick Access Card using LegalCard, StarOutlineIcon and Metadata */}
          <div className="mt-8 max-w-3xl mx-auto">
            <motion.div
              className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border-2 border-amber-200 dark:border-amber-500"
              whileHover={hoverAnimations.lift}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <StarOutlineIcon className="w-8 h-8 text-amber-600" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Frequently Accessed
                  </h3>
                </div>
                <Badge variant="warning">Top Pick</Badge>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Most users start with our Privacy Policy and Terms & Conditions. These documents are essential for understanding your rights and our commitments.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <LegalCard
                  title="Privacy Policy"
                  description="Data protection and privacy rights"
                  lastUpdated="2024-10-01"
                  version="2.1"
                  href="/legal-info/privacy-policy"
                  icon={ShieldCheckIcon}
                  category="policy"
                />
                <LegalCard
                  title="Terms & Conditions"
                  description="Service terms and user agreement"
                  lastUpdated="2024-10-01"
                  version="2.3"
                  href="/legal-info/terms-conditions"
                  icon={DocumentTextIcon}
                  category="terms"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Contact Legal Team Section */}
      <motion.section
        className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
        {...animations.fadeInUp}
        transition={{ ...defaultTransition, delay: 0.7 }}
      >
        <div className="container mx-auto px-4 text-center">
          <BuildingOfficeIcon className="w-16 h-16 mx-auto mb-6 opacity-90" />

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need Legal Assistance?
          </h2>

          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Our legal team is here to help answer your questions about our policies and terms
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact?dept=legal">
              <Button size="lg" variant="default" className="bg-white text-blue-600 hover:bg-blue-50">
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                Contact Legal Team
              </Button>
            </Link>

            <Link href="/help-&-guide">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <BookOpenIcon className="w-5 h-5 mr-2" />
                Visit Help Center
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-8 text-blue-100">
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="w-5 h-5" />
              <span>legal@vardhmanmills.com</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-5 h-5" />
              <span>+91-1234-567890</span>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
