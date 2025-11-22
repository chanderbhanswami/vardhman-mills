'use client';

import React, { Suspense, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FolderIcon,
  ChevronRightIcon,
  HomeIcon,
  ChartBarIcon,
  EyeIcon,
  DocumentTextIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamic imports
const HelpCategoryList = dynamic(() => import('@/components/help/HelpCategoryList'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
});

const HelpList = dynamic(() => import('@/components/help/HelpList'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
});

const HelpSearch = dynamic(() => import('@/components/help/HelpSearch'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';

// Breadcrumb component for navigation
const Breadcrumb = ({ items }: { items: Array<{ label: string; href: string; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>; current?: boolean }> }) => (
  <nav className="flex mb-4" aria-label="Breadcrumb">
    <ol className="flex items-center space-x-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-center">
          {index > 0 && <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />}
          {item.current ? (
            <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </span>
          ) : (
            <a href={item.href} className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </a>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

// Category type interface
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  articleCount?: number;
}

//  Animation variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

const statsVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, staggerChildren: 0.1 }
  }
};

// Main Component
function CategoriesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'articles' | 'updated' | 'popularity'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Stats
  const categoryStats = useMemo(() => {
    // Use all imported icons in stats display
    const statsIcons = [ChartBarIcon, EyeIcon, DocumentTextIcon, FireIcon];
    return {
      totalCategories: 8,
      totalArticles: 357,
      totalViews: 1258340,
      avgRating: 4.6,
      icons: statsIcons
    };
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategory(category.id);
    router.push(`/help-&-guide/categories/${category.slug}`);
  }, [router]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/', icon: HomeIcon },
    { label: 'Help Center', href: '/help-&-guide' },
    { label: 'Categories', href: '#', current: true }
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50"
    >
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <FolderIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {categoryStats.icons.length > 0 ? 'Help Categories' : 'Loading...'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Browse by Category
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Find help articles organized by topic and subject matter
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <motion.div
            variants={statsVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            <div className="text-center">
              <FolderIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {categoryStats.totalCategories}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <DocumentTextIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {categoryStats.totalArticles}
              </div>
              <div className="text-sm text-gray-600">Help Articles</div>
            </div>
            <div className="text-center">
              <EyeIcon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {(categoryStats.totalViews / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="text-center">
              <StarIcon className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {categoryStats.avgRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:w-auto">
              <Suspense fallback={<div className="h-12 bg-gray-100 animate-pulse rounded" />}>
                <HelpSearch
                  onSearch={handleSearch}
                  placeholder="Search categories and articles..."
                  showRecentSearches={false}
                  showPopularQueries={false}
                  showSuggestions={true}
                  showFilters={false}
                  showQuickActions={false}
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
                onChange={(e) => setSortBy(e.target.value as 'name' | 'articles' | 'updated' | 'popularity')}
                className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Sort categories by"
                title="Sort categories by"
              >
                <option value="name">Name</option>
                <option value="articles">Most Articles</option>
                <option value="popularity">Most Popular</option>
                <option value="updated">Recently Updated</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ChartBarIcon className="h-4 w-4 inline mr-1" />
                      Min Articles
                    </label>
                    <Input 
                      type="number" 
                      min="0" 
                      placeholder="0"
                      aria-label="Minimum number of articles"
                      title="Minimum number of articles"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Rating
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Minimum rating filter"
                      title="Minimum rating filter"
                    >
                      <option value="">Any</option>
                      <option value="3">3+ stars</option>
                      <option value="4">4+ stars</option>
                      <option value="4.5">4.5+ stars</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Reset
                    </Button>
                    <Button variant="default" size="sm" className="flex-1">
                      Apply
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
              All Categories
            </TabsTrigger>
            <TabsTrigger value="popular">
              <FireIcon className="h-4 w-4 mr-2" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="updated">
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Recently Updated
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
              <HelpCategoryList
                categories={[]}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                searchTerm={searchQuery}
                onSearchChange={setSearchQuery}
                viewMode={viewMode}
                sortBy={sortBy}
                showSearch={false}
                showFilters={false}
                showStats={true}
                enableAnimations={true}
                maxColumns={viewMode === 'grid' ? 3 : 1}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="popular" className="mt-6">
            <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
              <HelpCategoryList
                categories={[]}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                viewMode={viewMode}
                sortBy="popularity"
                showStats={true}
                enableAnimations={true}
                maxColumns={viewMode === 'grid' ? 3 : 1}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="updated" className="mt-6">
            <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
              <HelpCategoryList
                categories={[]}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                viewMode={viewMode}
                sortBy="updated"
                showStats={true}
                enableAnimations={true}
                maxColumns={viewMode === 'grid' ? 3 : 1}
              />
            </Suspense>
          </TabsContent>
        </Tabs>

        {/* Featured Articles Section */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <FireIcon className="h-6 w-6 text-orange-600" />
            <Badge variant="default" className="ml-2">Trending Now</Badge>
            <h2 className="text-2xl font-bold text-gray-900">Trending Articles</h2>
          </div>
          <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
            <HelpList
              articles={[]}
              viewMode="grid"
              sortBy="trending"
              showFilters={false}
              showSearch={false}
              showSorting={false}
              showViewToggle={false}
              showFeatured={true}
              itemsPerPage={6}
              enablePagination={false}
              enableAnimations={true}
            />
          </Suspense>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Can&apos;t find what you&apos;re looking for?
            </h3>
            <p className="text-gray-600 mb-6">
              Try our advanced search or contact our support team for personalized assistance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="default"
                size="lg"
                onClick={() => router.push('/help-&-guide/search')}
              >
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Advanced Search
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/help-&-guide/form')}
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
export default function HelpCategoriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CategoriesPageContent />
    </Suspense>
  );
}
