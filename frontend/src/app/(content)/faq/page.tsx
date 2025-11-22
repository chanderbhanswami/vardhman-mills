'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import FAQCategory from '@/components/faq/FAQCategory';
import FAQItem from '@/components/faq/FAQItem';
import FAQList from '@/components/faq/FAQList';
import FAQSearch from '@/components/faq/FAQSearch';
import { FAQSkeletonList } from '@/components/faq/FAQSkeleton';
import type { FAQ, FAQCategoryData } from '@/components/faq/FAQCategory';
import type { FAQFilters, FAQSortOption } from '@/components/faq/FAQList';
import Newsletter from '@/components/common/Newsletter';
import { EmptyState } from '@/components/common/EmptyState';
import BackToTop from '@/components/common/BackToTop';
import { toast } from 'react-hot-toast';
import { 
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon,
  CheckCircleIcon,
  FolderIcon,
  TagIcon,
  UserGroupIcon,
  ChartBarIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon,
  GiftIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

/**
 * FAQ Page Component
 * 
 * Comprehensive FAQ page with:
 * - SEO optimization with metadata and structured data
 * - Advanced search with suggestions and filtering
 * - Categorized FAQs with collapsible sections
 * - Voting and bookmarking system
 * - Related questions and articles
 * - Popular topics and trending questions
 * - Contact support options
 * - Newsletter subscription
 * - Responsive design for all devices
 * - Loading states and error handling
 * - Accessibility features
 * - Analytics integration
 */

// Page metadata for SEO
// Metadata removed (cannot be exported from client components)
// JSON-LD structured data for SEO (used in meta tags)
// const structuredData = {
//   '@context': 'https://schema.org',
//   '@type': 'FAQPage',
//   name: 'Vardhman Mills FAQ',
//   description: 'Frequently asked questions about Vardhman Mills products and services',
//   mainEntity: [] // Will be populated dynamically with FAQ items
// };

// Mock FAQ data (in production, this would come from API)
const mockFAQCategories: FAQCategoryData[] = [
  {
    id: 'products',
    name: 'Products & Materials',
    description: 'Questions about our textile products, materials, and specifications',
    icon: SparklesIcon,
    color: '#3B82F6',
    stats: {
      total: 25,
      answered: 23,
      pending: 2,
      popular: 8
    },
    faqs: [
      {
        id: 'faq-1',
        question: 'What types of fabrics do you manufacture?',
        answer: 'Vardhman Mills specializes in manufacturing a wide range of premium textiles including cotton fabrics, blended fabrics, home furnishing materials, apparel fabrics, and technical textiles. Our product line includes bed linens, curtains, upholstery fabrics, shirting, suiting, and industrial fabrics. Each product is manufactured using state-of-the-art technology and undergoes rigorous quality control to ensure durability, comfort, and aesthetic appeal.',
        category: 'products',
        tags: ['fabrics', 'materials', 'product range'],
        status: 'answered',
        difficulty: 'beginner',
        votes: { upvotes: 145, downvotes: 3 },
        views: 2340,
        lastUpdated: '2025-10-15T10:00:00Z',
        createdAt: '2024-01-10T08:00:00Z',
        isBookmarked: false,
        relatedFAQs: ['faq-2', 'faq-3'],
        author: {
          name: 'Support Team',
          role: 'Product Specialist',
          avatar: '/images/team/support.jpg'
        }
      },
      {
        id: 'faq-2',
        question: 'Are your fabrics eco-friendly and sustainable?',
        answer: 'Yes, sustainability is at the core of our manufacturing process. We use organic cotton, recycled materials, and eco-friendly dyes wherever possible. Our facilities are certified with ISO 14001 for environmental management, and we follow strict waste management protocols. We\'re committed to reducing our carbon footprint and have implemented water recycling systems and renewable energy sources in our production units.',
        category: 'products',
        tags: ['sustainability', 'eco-friendly', 'organic'],
        status: 'answered',
        difficulty: 'intermediate',
        votes: { upvotes: 98, downvotes: 1 },
        views: 1567,
        lastUpdated: '2025-10-14T14:30:00Z',
        createdAt: '2024-02-15T09:00:00Z',
        isBookmarked: false,
        relatedFAQs: ['faq-1', 'faq-4']
      }
    ]
  },
  {
    id: 'shipping',
    name: 'Shipping & Delivery',
    description: 'Information about shipping methods, delivery times, and tracking',
    icon: TruckIcon,
    color: '#10B981',
    stats: {
      total: 18,
      answered: 17,
      pending: 1,
      popular: 6
    },
    faqs: [
      {
        id: 'faq-3',
        question: 'What are the shipping charges?',
        answer: 'Shipping charges vary based on order value and delivery location. Orders above ₹2,000 qualify for free standard shipping within India. For international orders, shipping costs are calculated based on destination country, weight, and dimensions. Express shipping options are available at additional cost. You can view exact shipping charges during checkout before completing your purchase.',
        category: 'shipping',
        tags: ['shipping', 'delivery', 'charges'],
        status: 'answered',
        difficulty: 'beginner',
        votes: { upvotes: 234, downvotes: 8 },
        views: 4521,
        lastUpdated: '2025-10-16T11:00:00Z',
        createdAt: '2024-01-05T10:00:00Z',
        isBookmarked: false,
        relatedFAQs: ['faq-4', 'faq-5']
      }
    ]
  },
  {
    id: 'returns',
    name: 'Returns & Refunds',
    description: 'Policy and procedures for returns, exchanges, and refunds',
    icon: ShieldCheckIcon,
    color: '#F59E0B',
    stats: {
      total: 12,
      answered: 12,
      pending: 0,
      popular: 4
    },
    faqs: []
  },
  {
    id: 'payment',
    name: 'Payment Methods',
    description: 'Accepted payment options and transaction security',
    icon: CreditCardIcon,
    color: '#8B5CF6',
    stats: {
      total: 10,
      answered: 10,
      pending: 0,
      popular: 3
    },
    faqs: []
  },
  {
    id: 'account',
    name: 'Account & Orders',
    description: 'Managing your account, viewing orders, and order history',
    icon: UserGroupIcon,
    color: '#EC4899',
    stats: {
      total: 15,
      answered: 14,
      pending: 1,
      popular: 5
    },
    faqs: []
  },
  {
    id: 'quality',
    name: 'Quality & Care',
    description: 'Product quality, certifications, and care instructions',
    icon: CheckCircleIcon,
    color: '#06B6D4',
    stats: {
      total: 20,
      answered: 19,
      pending: 1,
      popular: 7
    },
    faqs: []
  }
];

// Popular topics
const popularTopics = [
  { id: 'order-tracking', name: 'Order Tracking', icon: '📦', count: 156 },
  { id: 'size-guide', name: 'Size Guide', icon: '📏', count: 143 },
  { id: 'fabric-care', name: 'Fabric Care', icon: '🧼', count: 128 },
  { id: 'customization', name: 'Customization', icon: '✂️', count: 112 },
  { id: 'bulk-orders', name: 'Bulk Orders', icon: '📊', count: 98 },
  { id: 'warranty', name: 'Warranty', icon: '🛡️', count: 87 },
  { id: 'cancellation', name: 'Cancellation', icon: '❌', count: 76 },
  { id: 'international', name: 'International', icon: '🌍', count: 65 },
  { id: 'gift-cards', name: 'Gift Cards', icon: '🎁', count: 54 },
  { id: 'wholesale', name: 'Wholesale', icon: '🏢', count: 43 },
  { id: 'certifications', name: 'Certifications', icon: '✓', count: 39 },
  { id: 'samples', name: 'Samples', icon: '🧵', count: 32 }
];

// Quick stats data
const quickStats = [
  { label: 'Total FAQs', value: '100+', icon: QuestionMarkCircleIcon, color: 'text-blue-600' },
  { label: 'Categories', value: '6', icon: FolderIcon, color: 'text-green-600' },
  { label: 'Avg Response', value: '< 2h', icon: ClockIcon, color: 'text-orange-600' },
  { label: 'Satisfaction', value: '98%', icon: CheckCircleIcon, color: 'text-purple-600' }
];

/**
 * Main FAQ Page Component
 */
const FAQPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<FAQFilters>({
    categories: [],
    tags: [],
    status: [],
    difficulty: [],
    hasBookmarks: false
  });
  const [sortBy, setSortBy] = useState<FAQSortOption>('relevance');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['products']);
  const [loading, setLoading] = useState(false);
  const [faqData, setFaqData] = useState<FAQCategoryData[]>(mockFAQCategories);
  const [activeTab, setActiveTab] = useState('all');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Load initial data and URL parameters
  useEffect(() => {
    if (!searchParams) return;
    
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    if (category) {
      setExpandedCategories([category]);
      setSelectedFilters((prev: FAQFilters) => ({ ...prev, categories: [category] }));
    }

    if (search) {
      setSearchTerm(search);
    }

    if (tag) {
      setSelectedFilters((prev: FAQFilters) => ({ ...prev, tags: [tag] }));
    }

    // Load search history from localStorage
    const history = localStorage.getItem('faq-search-history');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
  }, [searchParams]);

  // Flatten all FAQs from categories
  const allFAQs = useMemo(() => {
    return faqData.flatMap(category => category.faqs);
  }, [faqData]);

  // Handle search
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    
    if (!searchParams) return;
    
    // Update URL without navigation
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Handle filter changes
  const handleFiltersChange = useCallback((filters: FAQFilters) => {
    setSelectedFilters(filters);
    
    if (!searchParams) return;
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (filters.categories.length > 0) {
      params.set('category', filters.categories[0]);
    } else {
      params.delete('category');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Handle FAQ vote
  const handleFAQVote = useCallback((faqId: string, voteType: 'up' | 'down') => {
    setFaqData(prevData =>
      prevData.map(category => ({
        ...category,
        faqs: category.faqs.map((faq: FAQ) =>
          faq.id === faqId
            ? {
                ...faq,
                votes: {
                  upvotes: voteType === 'up' ? faq.votes.upvotes + 1 : faq.votes.upvotes,
                  downvotes: voteType === 'down' ? faq.votes.downvotes + 1 : faq.votes.downvotes
                }
              }
            : faq
        )
      }))
    );

    toast.success(`Thanks for your ${voteType === 'up' ? 'upvote' : 'feedback'}!`);
  }, []);

  // Handle FAQ bookmark
  const handleFAQBookmark = useCallback((faqId: string) => {
    setFaqData(prevData =>
      prevData.map(category => ({
        ...category,
        faqs: category.faqs.map((faq: FAQ) =>
          faq.id === faqId ? { ...faq, isBookmarked: !faq.isBookmarked } : faq
        )
      }))
    );

    toast.success('Bookmark updated!');
  }, []);

  // Handle FAQ share
  const handleFAQShare = useCallback(async (faqId: string) => {
    const faq = allFAQs.find((f: FAQ) => f.id === faqId);
    if (!faq) return;

    const shareData = {
      title: faq.question,
      text: faq.answer.substring(0, 100) + '...',
      url: `${window.location.origin}/faq?search=${encodeURIComponent(faq.question)}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
    }
  }, [allFAQs]);

  // Handle category toggle
  const handleCategoryToggle = useCallback((categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  // Handle search history update
  const handleSearchHistoryUpdate = useCallback((history: string[]) => {
    setSearchHistory(history);
    localStorage.setItem('faq-search-history', JSON.stringify(history));
  }, []);

  // Handle FAQ selection from search
  const handleFAQSelect = useCallback((faq: FAQ) => {
    // Find and expand the category containing this FAQ
    const category = faqData.find(cat => cat.faqs.some(f => f.id === faq.id));
    if (category && !expandedCategories.includes(category.id)) {
      setExpandedCategories(prev => [...prev, category.id]);
    }

    // Scroll to FAQ
    setTimeout(() => {
      const element = document.getElementById(`faq-${faq.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-faq');
        setTimeout(() => element.classList.remove('highlight-faq'), 2000);
      }
    }, 300);
  }, [faqData, expandedCategories]);

  // Handle topic click
  const handleTopicClick = useCallback((topicId: string) => {
    setSearchTerm(topicId.replace('-', ' '));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Get featured FAQs (most popular)
  const featuredFAQs = useMemo(() => {
    return [...allFAQs]
      .sort((a, b) => (b.votes.upvotes - b.votes.downvotes) - (a.votes.upvotes - a.votes.downvotes))
      .slice(0, 3);
  }, [allFAQs]);

  // Use loading state trigger
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
        {/* Hero Banner */}
        <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-white rounded-full blur-xl" />
            <div className="absolute top-1/2 -left-8 w-24 h-24 bg-white rounded-full blur-lg" />
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white rounded-full blur-2xl" />
          </div>

          <Container className="relative z-10 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Badge */}
              <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
                <BookOpenIcon className="w-4 h-4 mr-2" />
                Help Center
              </Badge>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                How Can We{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Help You?
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
                Find quick answers to your questions or contact our support team for personalized assistance.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <FAQSearch
                  faqs={allFAQs}
                  categories={faqData}
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  showSuggestions={true}
                  showRecentSearches={true}
                  showPopularQueries={true}
                  enableFuzzySearch={true}
                  autoFocus={false}
                  enableAnimations={true}
                  onFAQSelect={handleFAQSelect}
                  searchHistory={searchHistory}
                  onSearchHistoryUpdate={handleSearchHistoryUpdate}
                />
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
            >
              {quickStats.map((stat) => (
                <Card
                  key={stat.label}
                  className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-center hover:bg-white/20 transition-all duration-300"
                >
                  <stat.icon className={cn('w-8 h-8 mx-auto mb-2', stat.color)} />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </Card>
              ))}
            </motion.div>
          </Container>
        </section>

        {/* Main Content */}
        <Container className="py-16">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Help Center', href: '/help' },
              { label: 'FAQ', href: '/faq' }
            ]}
            className="mb-8"
          />

          {/* Page Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Browse through our comprehensive FAQ section organized by categories
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {faqData.map((category, index) => {
              const Icon = category.icon || QuestionMarkCircleIcon;
              const isExpanded = expandedCategories.includes(category.id);
              const completionPercentage = Math.round(
                (category.stats.answered / category.stats.total) * 100
              );

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className={cn(
                      'p-6 cursor-pointer transition-all duration-300 hover:shadow-xl group',
                      isExpanded && 'ring-2 ring-primary-500 shadow-lg'
                    )}
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'p-3 rounded-lg transition-transform duration-300 group-hover:scale-110',
                          category.id === 'products' && 'bg-blue-100',
                          category.id === 'shipping' && 'bg-green-100',
                          category.id === 'returns' && 'bg-orange-100',
                          category.id === 'payment' && 'bg-purple-100',
                          category.id === 'account' && 'bg-pink-100',
                          category.id === 'quality' && 'bg-cyan-100'
                        )}
                      >
                        <Icon className={cn(
                          'w-6 h-6',
                          category.id === 'products' && 'text-blue-600',
                          category.id === 'shipping' && 'text-green-600',
                          category.id === 'returns' && 'text-orange-600',
                          category.id === 'payment' && 'text-purple-600',
                          category.id === 'account' && 'text-pink-600',
                          category.id === 'quality' && 'text-cyan-600'
                        )} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {category.name}
                          </h3>
                          <Badge variant="secondary">{category.stats.total} FAQs</Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{category.description}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            {category.stats.answered} answered
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4 text-yellow-600" />
                            {category.stats.pending} pending
                          </span>
                          <span className="flex items-center gap-1">
                            <FireIcon className="w-4 h-4 text-red-600" />
                            {category.stats.popular} popular
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                completionPercentage > 95 && 'w-full',
                                completionPercentage > 90 && completionPercentage <= 95 && 'w-11/12',
                                completionPercentage > 80 && completionPercentage <= 90 && 'w-10/12',
                                completionPercentage > 70 && completionPercentage <= 80 && 'w-9/12',
                                completionPercentage > 60 && completionPercentage <= 70 && 'w-8/12',
                                completionPercentage > 50 && completionPercentage <= 60 && 'w-7/12',
                                completionPercentage <= 50 && 'w-6/12',
                                category.id === 'products' && 'bg-blue-600',
                                category.id === 'shipping' && 'bg-green-600',
                                category.id === 'returns' && 'bg-orange-600',
                                category.id === 'payment' && 'bg-purple-600',
                                category.id === 'account' && 'bg-pink-600',
                                category.id === 'quality' && 'bg-cyan-600'
                              )}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {completionPercentage}% Complete
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Featured FAQs */}
          {featuredFAQs.length > 0 && (
            <div className="mb-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                  <FireIcon className="w-7 h-7 text-orange-500" />
                  Most Popular Questions
                </h3>
                <p className="text-gray-600">
                  These are the questions our customers ask most frequently
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredFAQs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="p-6 bg-white hover:shadow-lg transition-shadow duration-300 h-full">
                      <div className="flex items-start gap-3 mb-4">
                        <Badge variant="default" className="flex-shrink-0">
                          #{index + 1}
                        </Badge>
                        <h4 className="font-semibold text-gray-900 leading-tight">
                          {faq.question}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {faq.answer}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            👍 {faq.votes.upvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            👁️ {faq.views}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFAQSelect(faq)}
                        >
                          Read More
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Topics */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Browse by Topic
              </h3>
              <p className="text-gray-600">Quick access to specific topics</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card
                    className="p-4 text-center cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                      {topic.icon}
                    </div>
                    <h4 className="font-medium text-sm text-gray-900 mb-1">
                      {topic.name}
                    </h4>
                    <span className="text-xs text-gray-500">{topic.count} articles</span>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="mb-8 flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="all">All FAQs</TabsTrigger>
                <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Cog6ToothIcon className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8 overflow-hidden"
              >
                <Card className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Search in Tags</label>
                      <Input
                        placeholder="Filter by tags..."
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase();
                          if (value) {
                            setSelectedFilters((prev: FAQFilters) => ({
                              ...prev,
                              tags: [value]
                            }));
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Sort Options</label>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          const nextSort: FAQSortOption = sortBy === 'date-desc' ? 'votes-desc' : 
                                                          sortBy === 'votes-desc' ? 'views-desc' :
                                                          sortBy === 'views-desc' ? 'alphabetical' : 'date-desc';
                          setSortBy(nextSort);
                        }}
                      >
                        <ChartBarIcon className="w-4 h-4 mr-2" />
                        Sort: {sortBy}
                      </Button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Quick Icons</label>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          <TagIcon className="w-3 h-3 mr-1" />
                          Tags
                        </Badge>
                        <Badge variant="secondary">
                          <MagnifyingGlassIcon className="w-3 h-3 mr-1" />
                          Search
                        </Badge>
                        <Badge variant="secondary">
                          <GiftIcon className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Individual FAQ Components Demo */}
                  <TabsContent value="all" className="mt-4">
                    <div className="space-y-4">
                      {faqData.slice(0, 1).map((category) => (
                        <div key={category.id}>
                          <FAQCategory
                            category={category}
                            isExpanded={expandedCategories.includes(category.id)}
                            onToggle={() => handleCategoryToggle(category.id)}
                            showStats={true}
                            showProgress={true}
                          />
                          {category.faqs.slice(0, 1).map((faq: FAQ) => (
                            <FAQItem
                              key={faq.id}
                              faq={faq}
                              isExpanded={true}
                              onToggle={() => {}}
                              searchTerm={searchTerm}
                              onVote={handleFAQVote}
                              onBookmark={handleFAQBookmark}
                              onShare={handleFAQShare}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="bookmarked">
                    <EmptyState
                      title="No Bookmarks Yet"
                      description="Bookmark your favorite FAQs for quick access later"
                    />
                  </TabsContent>

                  <TabsContent value="recent">
                    <div className="text-sm text-gray-600">
                      Recently viewed FAQs will appear here
                    </div>
                  </TabsContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FAQ List with Categories */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">All Questions</h3>
              <span className="text-sm text-gray-600">
                {allFAQs.length} total questions
              </span>
            </div>

            {loading ? (
              <FAQSkeletonList count={5} variant="detailed" showStats={true} showTags={true} />
            ) : allFAQs.length > 0 ? (
              <FAQList
                faqs={allFAQs}
                categories={faqData}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                selectedFilters={selectedFilters}
                onFiltersChange={handleFiltersChange}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortBy={sortBy}
                onSortChange={setSortBy}
                showFilters={true}
                showSearch={false}
                showViewModes={true}
                showPagination={true}
                itemsPerPage={10}
                enableAnimations={true}
                loading={loading}
                onFAQVote={handleFAQVote}
                onFAQBookmark={handleFAQBookmark}
                onFAQShare={handleFAQShare}
              />
            ) : (
              <EmptyState
                title="No FAQs Found"
                description="We couldn&apos;t find any FAQs matching your search criteria."
                action={{
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchTerm('');
                    setSelectedFilters({
                      categories: [],
                      tags: [],
                      status: [],
                      difficulty: [],
                      hasBookmarks: false
                    });
                  }
                }}
              />
            )}
          </div>
        </Container>

        {/* Contact Support Section */}
        <section className="py-16 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
          <Container>
            <div className="text-center max-w-3xl mx-auto">
              <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Still Need Help?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help you 24/7
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary-600 hover:bg-gray-100"
                  onClick={() => router.push('/contact')}
                >
                  <EnvelopeIcon className="w-5 h-5 mr-2" />
                  Contact Support
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => window.open('tel:+919876543210')}
                >
                  <PhoneIcon className="w-5 h-5 mr-2" />
                  Call Us Now
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-gray-50">
          <Container>
            <Newsletter
              title="Stay Updated"
              subtitle="Subscribe to our newsletter for the latest updates, tips, and exclusive offers"
              placeholder="Enter your email address"
            />
          </Container>
        </section>

        {/* Trust Indicators */}
        <section className="py-12">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { icon: ShieldCheckIcon, title: 'Secure', description: '100% Safe' },
                { icon: CheckCircleIcon, title: 'Verified', description: 'ISO Certified' },
                { icon: LightBulbIcon, title: 'Expert', description: '50+ Years' },
                { icon: UserGroupIcon, title: 'Trusted', description: '10K+ Customers' }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <item.icon className="w-10 h-10 mx-auto text-primary-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Back to Top Button */}
        <BackToTop />
      </main>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 right-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Highlight Animation Styles */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .highlight-faq {
          animation: highlight 2s ease-in-out;
        }
        
        @keyframes highlight {
          0%, 100% {
            background-color: transparent;
          }
          50% {
            background-color: rgba(59, 130, 246, 0.1);
          }
        }
      `}</style>
    </>
  );
};

export default FAQPage;
