'use client';

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  TagIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  ArrowTrendingUpIcon,
  ChevronRightIcon,
  StarIcon,
  EyeIcon,
  BookmarkIcon,
  ShareIcon,
  EnvelopeIcon,
  CubeTransparentIcon,
  ShieldCheckIcon,
  HeartIcon,
  TrophyIcon,
  BoltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  FireIcon as FireIconSolid,
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';

// Dynamic imports for help components
const HelpBanner = dynamic(() => import('@/components/help/HelpBanner'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />
});

const HelpSearch = dynamic(() => import('@/components/help/HelpSearch'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

const HelpCategoryList = dynamic(() => import('@/components/help/HelpCategoryList'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
});

const HelpCard = dynamic(() => import('@/components/help/HelpCard'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

const HelpList = dynamic(() => import('@/components/help/HelpList'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
});

const SizeGuide = dynamic(() => import('@/components/help/SizeGuide'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
});

// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';

// Types
interface QuickLink {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  color: string;
  badge?: string;
}

interface Stat {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  trend?: string;
}

interface PopularTopic {
  id: string;
  title: string;
  description: string;
  articles: number;
  views: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

interface TrustIndicator {
  id: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  color: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  hover: {
    y: -4,
    transition: { duration: 0.2 }
  }
};

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  }
};

// Quick Links Data
const quickLinks: QuickLink[] = [
  {
    id: 'getting-started',
    title: 'Getting Started Guide',
    description: 'New to our platform? Start here for a complete walkthrough',
    icon: RocketLaunchIcon,
    href: '/help-&-guide/getting-started',
    color: 'blue',
    badge: 'Popular'
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    description: 'Quick answers to the most common questions',
    icon: QuestionMarkCircleIcon,
    href: '/faq',
    color: 'green',
    badge: '500+ FAQs'
  },
  {
    id: 'live-chat',
    title: 'Live Chat Support',
    description: 'Chat with our support team in real-time',
    icon: ChatBubbleLeftRightIcon,
    href: '/help-&-guide/chat',
    color: 'purple',
    badge: 'Online'
  },
  {
    id: 'phone-support',
    title: 'Phone Support',
    description: 'Speak directly with our support specialists',
    icon: PhoneIcon,
    href: '/contact',
    color: 'orange'
  },
  {
    id: 'size-guide',
    title: 'Size Guide',
    description: 'Find the perfect size for all home textile products',
    icon: CubeTransparentIcon,
    href: '/help-&-guide/size-guide',
    color: 'pink',
    badge: 'Essential'
  },
  {
    id: 'video-tutorials',
    title: 'Video Tutorials',
    description: 'Watch step-by-step video guides and tutorials',
    icon: BookOpenIcon,
    href: '/help-&-guide/videos',
    color: 'indigo'
  }
];

// Stats Data
const stats: Stat[] = [
  {
    id: 'articles',
    label: 'Help Articles',
    value: '500+',
    icon: BookOpenIcon,
    color: 'blue',
    trend: '+25 this month'
  },
  {
    id: 'response-time',
    label: 'Avg Response',
    value: '< 2 min',
    icon: ClockIcon,
    color: 'green',
    trend: 'Lightning fast'
  },
  {
    id: 'satisfaction',
    label: 'Satisfaction Rate',
    value: '98%',
    icon: StarIcon,
    color: 'yellow',
    trend: '4.9/5.0 rating'
  },
  {
    id: 'support-agents',
    label: 'Support Agents',
    value: '24/7',
    icon: UserGroupIcon,
    color: 'purple',
    trend: 'Always available'
  }
];

// Popular Topics Data
const popularTopics: PopularTopic[] = [
  {
    id: 'ordering',
    title: 'Ordering & Shopping',
    description: 'Learn how to browse products, place orders, and track deliveries',
    articles: 45,
    views: 12500,
    icon: ShoppingBagIcon,
    color: 'blue'
  },
  {
    id: 'products',
    title: 'Product Information',
    description: 'Detailed guides about bed sheets, curtains, rugs, and more',
    articles: 78,
    views: 18900,
    icon: CubeTransparentIcon,
    color: 'green'
  },
  {
    id: 'payments',
    title: 'Payments & Billing',
    description: 'Payment methods, invoices, refunds, and billing inquiries',
    articles: 32,
    views: 9800,
    icon: CreditCardIcon,
    color: 'purple'
  },
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    description: 'Shipping options, delivery times, tracking, and policies',
    articles: 28,
    views: 11200,
    icon: TruckIcon,
    color: 'orange'
  },
  {
    id: 'returns',
    title: 'Returns & Exchanges',
    description: 'Return policies, exchange process, and warranty information',
    articles: 25,
    views: 8700,
    icon: ArrowPathIcon,
    color: 'red'
  },
  {
    id: 'care',
    title: 'Product Care & Maintenance',
    description: 'Washing instructions, stain removal, and fabric care tips',
    articles: 52,
    views: 14300,
    icon: SparklesIcon,
    color: 'pink'
  },
  {
    id: 'account',
    title: 'Account Management',
    description: 'Profile settings, password reset, and account security',
    articles: 22,
    views: 7500,
    icon: UserIcon,
    color: 'indigo'
  },
  {
    id: 'technical',
    title: 'Technical Support',
    description: 'Website issues, app problems, and troubleshooting guides',
    articles: 38,
    views: 10600,
    icon: Cog8ToothIcon,
    color: 'gray'
  },
  {
    id: 'sizing',
    title: 'Sizing & Measurements',
    description: 'Size charts, measurement guides, and fit recommendations',
    articles: 35,
    views: 15800,
    icon: ChartBarIcon,
    color: 'amber'
  },
  {
    id: 'wholesale',
    title: 'Wholesale & Bulk Orders',
    description: 'Bulk purchasing, corporate gifting, and business accounts',
    articles: 18,
    views: 6200,
    icon: UserGroupIcon,
    color: 'teal'
  },
  {
    id: 'sustainability',
    title: 'Sustainability & Quality',
    description: 'Eco-friendly products, certifications, and quality standards',
    articles: 20,
    views: 8900,
    icon: ShieldCheckIcon,
    color: 'emerald'
  },
  {
    id: 'special-offers',
    title: 'Promotions & Offers',
    description: 'Discounts, coupon codes, loyalty programs, and special deals',
    articles: 15,
    views: 13400,
    icon: TagIcon,
    color: 'rose'
  }
];

// Trust Indicators Data
const trustIndicators: TrustIndicator[] = [
  {
    id: 'verified',
    icon: CheckCircleIcon,
    title: 'Verified Information',
    description: 'All content reviewed by experts',
    color: 'green'
  },
  {
    id: 'updated',
    icon: ClockIcon,
    title: 'Regularly Updated',
    description: 'Latest information and guides',
    color: 'blue'
  },
  {
    id: 'secure',
    icon: ShieldCheckIcon,
    title: 'Secure & Private',
    description: 'Your data is protected',
    color: 'purple'
  },
  {
    id: 'award',
    icon: TrophyIcon,
    title: 'Award-Winning Support',
    description: '98% customer satisfaction',
    color: 'yellow'
  }
];

// Utility functions
const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    blue: { bg: 'bg-blue-50 hover:bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', icon: 'text-blue-500' },
    green: { bg: 'bg-green-50 hover:bg-green-100', text: 'text-green-600', border: 'border-green-200', icon: 'text-green-500' },
    purple: { bg: 'bg-purple-50 hover:bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', icon: 'text-purple-500' },
    orange: { bg: 'bg-orange-50 hover:bg-orange-100', text: 'text-orange-600', border: 'border-orange-200', icon: 'text-orange-500' },
    red: { bg: 'bg-red-50 hover:bg-red-100', text: 'text-red-600', border: 'border-red-200', icon: 'text-red-500' },
    pink: { bg: 'bg-pink-50 hover:bg-pink-100', text: 'text-pink-600', border: 'border-pink-200', icon: 'text-pink-500' },
    indigo: { bg: 'bg-indigo-50 hover:bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200', icon: 'text-indigo-500' },
    yellow: { bg: 'bg-yellow-50 hover:bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200', icon: 'text-yellow-500' },
    amber: { bg: 'bg-amber-50 hover:bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', icon: 'text-amber-500' },
    teal: { bg: 'bg-teal-50 hover:bg-teal-100', text: 'text-teal-600', border: 'border-teal-200', icon: 'text-teal-500' },
    emerald: { bg: 'bg-emerald-50 hover:bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200', icon: 'text-emerald-500' },
    rose: { bg: 'bg-rose-50 hover:bg-rose-100', text: 'text-rose-600', border: 'border-rose-200', icon: 'text-rose-500' },
    gray: { bg: 'bg-gray-50 hover:bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: 'text-gray-500' }
  };
  return colorMap[color] || colorMap.blue;
};

const formatNumber = (num: number) => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
  return `${(num / 1000000).toFixed(1)}m`;
};

// Import additional missing icons
import { ShoppingBagIcon, CreditCardIcon, TruckIcon, UserIcon, Cog8ToothIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Main Component with Search Params wrapper
function HelpCenterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || '');
  const [selectedTopic, setSelectedTopic] = useState(searchParams?.get('topic') || '');
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'videos' | 'guides'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Initialize featured articles - simulated data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSearchOverlay(searchQuery.length > 0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    // Update URL
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    router.push(`?${params.toString()}`);

    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  }, [router, searchParams]);

  // Handle topic click
  const handleTopicClick = useCallback((topicId: string) => {
    setSelectedTopic(topicId);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('topic', topicId);
    router.push(`?${params.toString()}`);
    
    // Scroll to articles section
    const articlesSection = document.getElementById('articles-section');
    if (articlesSection) {
      articlesSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, [router, searchParams]);

  // Handle newsletter subscription
  const handleNewsletterSubscribe = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;

    setIsSubscribing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false);
      setSubscribed(true);
      setNewsletterEmail('');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubscribed(false);
      }, 3000);
    }, 1000);
  }, [newsletterEmail]);

  // Memoized values
  const filteredQuickLinks = useMemo(() => {
    if (!searchQuery) return quickLinks;
    return quickLinks.filter(link =>
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredTopics = useMemo(() => {
    if (!searchQuery) return popularTopics;
    return popularTopics.filter(topic =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner Section */}
      <section className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
          <HelpBanner
            title="How can we help you today?"
            subtitle="Search our comprehensive help center or browse categories to find answers"
            searchPlaceholder="Search for help articles, guides, FAQs, and more..."
            onSearch={handleSearch}
            showQuickActions={true}
            showStats={true}
            showContactInfo={true}
            variant="gradient"
            size="lg"
            enableAnimations={true}
          />
        </Suspense>
        
        {/* Search Results Overlay */}
        {showSearchOverlay && searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MagnifyingGlassIcon className="h-4 w-4" />
              <span>Searching for: <strong>{searchQuery}</strong></span>
            </div>
            <p className="text-xs text-gray-500">
              Press Enter or click Search to see all results
            </p>
          </motion.div>
        )}
      </section>

      {/* Quick Links Section */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
              <p className="text-gray-600 mt-1">Jump to the most popular help topics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuickLinks.map((link) => {
              const Icon = link.icon;
              const colors = getColorClasses(link.color);
              
              return (
                <motion.div
                  key={link.id}
                  variants={itemVariants}
                  whileHover="hover"
                >
                  <Card
                    className={cn(
                      'cursor-pointer transition-all duration-200 hover:shadow-lg border-2',
                      colors.border,
                      colors.bg
                    )}
                    onClick={() => router.push(link.href)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn('p-3 rounded-lg', colors.bg.replace('hover:', ''))}>
                          <Icon className={cn('h-6 w-6', colors.icon)} />
                        </div>
                        {link.badge && (
                          <Badge variant="secondary" size="sm" className={cn(colors.text, colors.bg.replace('hover:', ''))}>
                            {link.badge}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {link.description}
                      </p>
                      <div className="flex items-center text-sm font-medium text-gray-700">
                        Learn more
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                const colors = getColorClasses(stat.color);
                
                return (
                  <motion.div
                    key={stat.id}
                    variants={itemVariants}
                    className="text-center"
                  >
                    <div className={cn('inline-flex p-3 rounded-lg mb-3', colors.bg.replace('hover:', ''))}>
                      <Icon className={cn('h-6 w-6', colors.icon)} />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {stat.label}
                    </div>
                    {stat.trend && (
                      <div className="text-xs text-gray-500">
                        {stat.trend}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Articles Section */}
      {selectedTopic && (
        <section className="container mx-auto px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-50">
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FireIcon className="h-6 w-6 text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-900">Featured Articles</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTopic('')}
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Clear Filter
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Suspense fallback={<div className="h-64 bg-white animate-pulse rounded-lg" />}>
                <HelpCard
                  article={{
                    id: 'featured-1',
                    title: 'Getting Started with Your First Order',
                    excerpt: 'Learn how to browse products, add to cart, and complete checkout',
                    category: 'Getting Started',
                    tags: ['beginner', 'shopping'],
                    author: { name: 'Support Team', role: 'Expert' },
                    publishedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    views: 12500,
                    rating: { average: 4.8, count: 520 },
                    isBookmarked: false,
                    estimatedReadTime: 5,
                    difficulty: 'beginner',
                    type: 'guide',
                    status: 'published',
                    helpfulness: { helpful: 490, notHelpful: 30 }
                  }}
                  variant="featured"
                  onClick={() => router.push('/help-&-guide/getting-started')}
                  showRating={true}
                  showActions={true}
                  enableAnimations={true}
                />
              </Suspense>

              {/* Using icons in decorative elements */}
              <Card className="p-6 bg-white hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => router.push('/help-&-guide/search')}>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <MagnifyingGlassIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Advanced Search
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Use filters and advanced search to find exactly what you need
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FunnelIcon className="h-3 w-3" />
                        <span>10+ filters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowTrendingUpIcon className="h-3 w-3" />
                        <span>Popular</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => router.push('/help-&-guide/bookmarks')}>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <BookmarkIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Saved Articles
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Access your bookmarked articles and favorite guides
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <ShareIcon className="h-3 w-3" />
                        <span>Share collections</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HeartIcon className="h-3 w-3" />
                        <span>Organize</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </section>
      )}

      {/* Help Categories Section */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600">
              Find help articles organized by topic
            </p>
          </div>

          <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
            <HelpCategoryList
              categories={[]}
              selectedCategory={selectedCategory}
              onCategorySelect={(category) => {
                setSelectedCategory(category.id);
                router.push(`/help-&-guide/categories/${category.slug}`);
              }}
              searchTerm={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode="grid"
              sortBy="name"
              showSearch={true}
              showFilters={true}
              showStats={true}
              enableAnimations={true}
              maxColumns={3}
            />
          </Suspense>
        </motion.div>
      </section>

      {/* Popular Topics Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full mb-4">
                <FireIconSolid className="h-5 w-5" />
                <span className="text-sm font-medium">Trending Topics</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Popular Help Topics
              </h2>
              <p className="text-lg text-gray-600">
                Most searched and helpful topics by our customers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTopics.map((topic) => {
                const Icon = topic.icon;
                const colors = getColorClasses(topic.color);
                
                return (
                  <motion.div
                    key={topic.id}
                    variants={itemVariants}
                    whileHover="hover"
                  >
                    <Card
                      className="cursor-pointer transition-all duration-200 hover:shadow-lg"
                      onClick={() => handleTopicClick(topic.id)}
                    >
                      <div className="p-5">
                        <div className={cn('p-2 rounded-lg inline-flex mb-3', colors.bg.replace('hover:', ''))}>
                          <Icon className={cn('h-5 w-5', colors.icon)} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {topic.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <BookOpenIcon className="h-3 w-3" />
                            <span>{topic.articles} articles</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <EyeIcon className="h-3 w-3" />
                            <span>{formatNumber(topic.views)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Advanced Search & Filters Section */}
      <section id="articles-section" className="container mx-auto px-4 py-12">
        <motion.div
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Search & Browse</h2>
              <p className="text-gray-600 mt-1">
                Find specific articles or browse all help content
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
              {showAdvancedFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>

          <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
            <HelpSearch
              onSearch={handleSearch}
              placeholder="Search help articles, guides, FAQs..."
              showRecentSearches={true}
              showPopularQueries={true}
              showSuggestions={true}
              showFilters={showAdvancedFilters}
              showQuickActions={true}
              enableAutoComplete={true}
              maxResults={10}
              size="md"
              variant="default"
              initialQuery={searchQuery}
              isLoading={isSearching}
              enableAnimations={true}
            />
          </Suspense>

          {/* Tabs for filtering content types */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="all">
                <SparklesIcon className="h-4 w-4 mr-2" />
                All Content
              </TabsTrigger>
              <TabsTrigger value="articles">
                <BookOpenIcon className="h-4 w-4 mr-2" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="videos">
                <VideoCameraIcon className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="guides">
                <LightBulbIcon className="h-4 w-4 mr-2" />
                Guides
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
                <HelpList
                  articles={[]}
                  searchTerm={searchQuery}
                  onSearchChange={setSearchQuery}
                  viewMode="grid"
                  sortBy="relevance"
                  showFilters={true}
                  showSearch={false}
                  showSorting={true}
                  showViewToggle={true}
                  showStats={true}
                  showFeatured={true}
                  itemsPerPage={12}
                  enablePagination={true}
                  enableAnimations={true}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="articles" className="mt-6">
              <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
                <HelpList
                  articles={[]}
                  searchTerm={searchQuery}
                  filters={{ categories: [], tags: ['article'], difficulty: [], priority: [], status: [] }}
                  viewMode="list"
                  sortBy="newest"
                  showFilters={true}
                  showStats={true}
                  enablePagination={true}
                  enableAnimations={true}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="videos" className="mt-6">
              <div className="text-center py-12">
                <VideoCameraIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Video Tutorials Coming Soon
                </h3>
                <p className="text-gray-600 mb-6">
                  We&apos;re working on creating helpful video content for you
                </p>
                <Button variant="outline" onClick={() => router.push('/contact')}>
                  Request Video Tutorial
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="guides" className="mt-6">
              <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
                <HelpList
                  articles={[]}
                  searchTerm={searchQuery}
                  filters={{ categories: [], tags: ['guide'], difficulty: [], priority: [], status: [] }}
                  viewMode="grid"
                  sortBy="rating"
                  showFilters={true}
                  showStats={true}
                  enablePagination={true}
                  enableAnimations={true}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>

      {/* Size Guide Preview Section */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full mb-4">
                <CubeTransparentIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Essential Guide</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Size Guide for Home Textiles
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Find the perfect size for bed sheets, curtains, rugs, and all home furnishing products
              </p>
              <Button
                size="lg"
                onClick={() => router.push('/help-&-guide/size-guide')}
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                View Complete Size Guide
                <ChevronRightIcon className="h-5 w-5 ml-2" />
              </Button>
            </div>

            <Suspense fallback={<div className="h-96 bg-white animate-pulse rounded-xl" />}>
              <div className="max-w-4xl mx-auto">
                <SizeGuide
                  selectedCategory="bedding"
                  showSizeCalculator={true}
                  showMeasurementTips={true}
                  showPrintButton={true}
                  showShareButton={true}
                  enableAnimations={true}
                />
              </div>
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* Contact Support CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div className="relative p-8 md:p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                  <HeartIconSolid className="h-5 w-5 text-white" />
                  <span className="text-sm font-medium text-white">We&apos;re Here to Help</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Still Need Help?
                </h2>
                <p className="text-lg text-white/90 mb-8">
                  Our support team is available 24/7 to assist you with any questions or concerns
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => router.push('/help-&-guide/form')}
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    Contact Support
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push('/contact')}
                    className="border-white text-white hover:bg-white/10"
                  >
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    Call Us Now
                  </Button>
                </div>
                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BoltIcon className="h-4 w-4" />
                    <span>&lt; 2 min response</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarIconSolid className="h-4 w-4" />
                    <span>98% satisfaction</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Newsletter Subscription Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <EnvelopeIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Stay Updated with Help Tips
                </h3>
                <p className="text-gray-600 mb-6">
                  Subscribe to receive helpful guides, product care tips, and exclusive support content
                </p>
                
                <AnimatePresence mode="wait">
                  {subscribed ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span className="font-medium">Successfully subscribed!</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Check your email for confirmation
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleNewsletterSubscribe}
                      className="flex flex-col sm:flex-row gap-3"
                    >
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="flex-1"
                        required
                      />
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubscribing}
                      >
                        {isSubscribing ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Subscribing...
                          </>
                        ) : (
                          <>
                            Subscribe Now
                            <ChevronRightIcon className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>

                <p className="text-xs text-gray-500 mt-4">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustIndicators.map((indicator) => {
              const Icon = indicator.icon;
              const colors = getColorClasses(indicator.color);
              
              return (
                <motion.div
                  key={indicator.id}
                  variants={itemVariants}
                  className="text-center"
                >
                  <div className={cn('inline-flex p-4 rounded-full mb-4', colors.bg.replace('hover:', ''))}>
                    <Icon className={cn('h-8 w-8', colors.icon)} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {indicator.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {indicator.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Back to Top Button */}
      <Button
        variant="secondary"
        size="lg"
        className="fixed bottom-8 right-8 rounded-full shadow-lg z-50"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Back to top"
        aria-label="Scroll to top"
      >
        <ChevronUpIcon className="h-6 w-6" />
      </Button>
    </div>
  );
}

// Missing icon import
import { ChevronUpIcon, VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Wrapper with Suspense for search params
export default function HelpCenterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 animate-pulse" />}>
      <HelpCenterContent />
    </Suspense>
  );
}
