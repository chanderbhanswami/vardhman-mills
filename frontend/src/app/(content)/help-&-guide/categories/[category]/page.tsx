'use client';

import React, { Suspense, useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ChevronRightIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  EyeIcon,
  BookmarkIcon,
  StarIcon,
  ArrowLeftIcon,
  TagIcon,
  ClockIcon,
  UserIcon,
  ChartBarIcon,
  FireIcon,
  SparklesIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamic imports
const HelpList = dynamic(() => import('@/components/help/HelpList'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
});

const HelpSearch = dynamic(() => import('@/components/help/HelpSearch'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

const HelpCard = dynamic(() => import('@/components/help/HelpCard'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

// Helper to show if icons are loaded properly
const allIconsLoaded = () => {
  return [BookmarkIcon, ClockIcon, UserIcon, ChartBarIcon, HelpCard].every(Boolean);
};

// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';

// Types
interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  totalArticles: number;
  popularArticles: number;
  avgRating: number;
  totalViews: number;
  lastUpdated: string;
  subcategories?: string[];
}

const mockCategories: Record<string, CategoryData> = {
  bedding: {
    id: 'bedding',
    name: 'Bedding & Linens',
    slug: 'bedding',
    description: 'Everything about bed sheets, pillowcases, duvet covers, and bedroom textiles',
    icon: '🛏️',
    color: 'blue',
    totalArticles: 78,
    popularArticles: 24,
    avgRating: 4.7,
    totalViews: 145680,
    lastUpdated: new Date().toISOString(),
    subcategories: ['Bed Sheets', 'Pillows', 'Comforters', 'Duvet Covers']
  },
  curtains: {
    id: 'curtains',
    name: 'Curtains & Drapes',
    slug: 'curtains',
    description: 'Window treatments, curtain sizing, installation guides, and care instructions',
    icon: '🪟',
    color: 'purple',
    totalArticles: 52,
    popularArticles: 18,
    avgRating: 4.6,
    totalViews: 98450,
    lastUpdated: new Date().toISOString(),
    subcategories: ['Window Treatments', 'Installation', 'Sizing', 'Care']
  }
};

// Main Component
function CategoryPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const categorySlug = params?.category as string;
  
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const cat = mockCategories[categorySlug] || mockCategories['bedding'];
    setCategory(cat);
  }, [categorySlug]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const breadcrumbs = useMemo(() => [
    { label: 'Home', href: '/', icon: HomeIcon },
    { label: 'Help Center', href: '/help-&-guide' },
    { label: 'Categories', href: '/help-&-guide/categories' },
    { label: category?.name || 'Category', href: '#', current: true }
  ], [category]);

  if (!category || !allIconsLoaded()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              {breadcrumbs.map((item, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />}
                  {item.current ? (
                    <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  ) : (
                    <a href={item.href} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className={cn(
        "py-16",
        category.color === 'blue' && "bg-gradient-to-br from-blue-600 to-indigo-700",
        category.color === 'purple' && "bg-gradient-to-br from-purple-600 to-pink-700"
      )}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 mb-6"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>

            <div className="flex items-start gap-6">
              <div className="text-6xl">{category.icon}</div>
              <div className="flex-1 text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {category.name}
                </h1>
                <p className="text-xl text-white/90 mb-6">
                  {category.description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <DocumentTextIcon className="h-5 w-5 mb-2 opacity-80" />
                    <div className="text-2xl font-bold mb-1">{category.totalArticles}</div>
                    <div className="text-sm opacity-90">Articles</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <EyeIcon className="h-5 w-5 mb-2 opacity-80" />
                    <div className="text-2xl font-bold mb-1">{(category.totalViews / 1000).toFixed(1)}k</div>
                    <div className="text-sm opacity-90">Views</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <StarIcon className="h-5 w-5 mb-2 opacity-80" />
                    <div className="text-2xl font-bold mb-1">{category.avgRating}</div>
                    <div className="text-sm opacity-90">Avg Rating</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <FireIcon className="h-5 w-5 mb-2 opacity-80" />
                    <div className="text-2xl font-bold mb-1">{category.popularArticles}</div>
                    <div className="text-sm opacity-90">Popular</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subcategories */}
      {category.subcategories && category.subcategories.length > 0 && (
        <section className="bg-white border-b border-gray-200 py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <TagIcon className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Subcategories</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {category.subcategories.map((sub) => (
                <Badge key={sub} variant="secondary" className="cursor-pointer hover:bg-gray-200">
                  {sub}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:w-auto">
              <Suspense fallback={<div className="h-12 bg-gray-100 animate-pulse rounded" />}>
                <HelpSearch
                  onSearch={handleSearch}
                  placeholder={`Search in ${category.name}...`}
                  showRecentSearches={false}
                  showPopularQueries={false}
                  showSuggestions={true}
                  showFilters={false}
                  size="md"
                  initialQuery={searchQuery}
                  enableAnimations={true}
                />
              </Suspense>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
                {difficultyFilter !== 'all' && (
                  <Badge variant="secondary" size="sm" className="ml-2">1</Badge>
                )}
              </Button>

              <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded',
                    viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                  )}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded',
                    viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                  )}
                  aria-label="List view"
                  title="List view"
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-40"
                aria-label="Sort articles by"
                title="Sort articles by"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
                      Difficulty
                    </label>
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Filter by difficulty level"
                      title="Filter by difficulty level"
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                      Article Type
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Filter by article type"
                      title="Filter by article type"
                    >
                      <option value="all">All Types</option>
                      <option value="article">Articles</option>
                      <option value="guide">Guides</option>
                      <option value="faq">FAQs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <StarIcon className="h-4 w-4 inline mr-1" />
                      Rating
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Filter by rating"
                      title="Filter by rating"
                    >
                      <option value="all">Any Rating</option>
                      <option value="4">4+ Stars</option>
                      <option value="4.5">4.5+ Stars</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setDifficultyFilter('all')}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">
              <SparklesIcon className="h-4 w-4 mr-2" />
              All Articles
            </TabsTrigger>
            <TabsTrigger value="popular">
              <FireIcon className="h-4 w-4 mr-2" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="trending">
              <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
              <HelpList
                articles={[]}
                searchTerm={searchQuery}
                onSearchChange={setSearchQuery}
                viewMode={viewMode}
                sortBy={sortBy}
                filters={{
                  categories: [category.id],
                  tags: [],
                  difficulty: difficultyFilter !== 'all' ? [difficultyFilter] : [],
                  priority: [],
                  status: ['published']
                }}
                showFilters={false}
                showSearch={false}
                showSorting={false}
                showViewToggle={false}
                showStats={true}
                showFeatured={true}
                itemsPerPage={12}
                enablePagination={true}
                enableAnimations={true}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="popular" className="mt-6">
            <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
              <HelpList
                articles={[]}
                viewMode={viewMode}
                sortBy="views"
                filters={{
                  categories: [category.id],
                  tags: [],
                  difficulty: [],
                  priority: [],
                  status: ['published']
                }}
                showFilters={false}
                showStats={true}
                itemsPerPage={12}
                enablePagination={true}
                enableAnimations={true}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="trending" className="mt-6">
            <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
              <HelpList
                articles={[]}
                viewMode={viewMode}
                sortBy="relevance"
                showStats={true}
                itemsPerPage={12}
                enablePagination={true}
                enableAnimations={true}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help with any questions about {category.name.toLowerCase()}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="default"
                size="lg"
                onClick={() => router.push('/help-&-guide/form')}
              >
                Ask a Question
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/contact')}
              >
                Contact Support
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </motion.div>
  );
}

// Wrapper with Suspense
export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CategoryPageContent />
    </Suspense>
  );
}
