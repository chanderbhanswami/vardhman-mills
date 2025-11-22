'use client';

import React, { Suspense, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamic imports
const HelpSearch = dynamic(() => import('@/components/help/HelpSearch'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

const HelpList = dynamic(() => import('@/components/help/HelpList'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
});

// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// Main Component
function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    router.push(`/help-&-guide/search?q=${encodeURIComponent(query)}`);
  }, [router]);

  const breadcrumbs = [
    { label: 'Home', href: '/', icon: HomeIcon },
    { label: 'Help Center', href: '/help-&-guide' },
    { label: 'Search', href: '#', current: true }
  ];

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

      {/* Hero Search Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <MagnifyingGlassIcon className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Search Help Articles
            </h1>
            <p className="text-xl text-white/90">
              Find answers to your questions quickly
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Suspense fallback={<div className="h-16 bg-white/20 animate-pulse rounded-lg" />}>
              <HelpSearch
                onSearch={handleSearch}
                placeholder="What can we help you with?"
                showRecentSearches={true}
                showPopularQueries={true}
                showSuggestions={true}
                showFilters={true}
                size="lg"
                initialQuery={searchQuery}
                enableAnimations={true}
              />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        {/* Results Header */}
        {searchQuery && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Search Results for &ldquo;{searchQuery}&rdquo;
            </h2>
            <p className="text-gray-600">
              Showing 48 results
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
              {(selectedTypes.length + selectedCategories.length) > 0 && (
                <Badge variant="secondary" size="sm" className="ml-2">
                  {selectedTypes.length + selectedCategories.length}
                </Badge>
              )}
            </Button>
            
            {selectedTypes.length > 0 && selectedTypes.map(type => (
              <Badge key={type} variant="secondary" className="cursor-pointer">
                {type}
                <button className="ml-1" onClick={() => setSelectedTypes(prev => prev.filter(t => t !== type))}>×</button>
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2">
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
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Sort results"
              title="Sort results"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Viewed</option>
              <option value="rating">Highest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>

            <Button variant="outline" size="sm">
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8"
          >
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <div className="space-y-2">
                    {['Article', 'Guide', 'Video', 'FAQ'].map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTypes([...selectedTypes, type]);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== type));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    aria-label="Select difficulty level"
                    title="Select difficulty level"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    aria-label="Select minimum rating"
                    title="Select minimum rating"
                  >
                    <option value="0">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    aria-label="Select date range"
                    title="Select date range"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                    <option value="year">Past Year</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTypes([]);
                    setSelectedCategories([]);
                  }}
                >
                  Reset Filters
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Results */}
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
          <HelpList
            articles={[]}
            searchTerm={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            sortBy={sortBy}
            filters={{
              categories: selectedCategories,
              tags: selectedTypes,
              difficulty: [],
              priority: [],
              status: ['published']
            }}
            showFilters={false}
            showSearch={false}
            showSorting={false}
            showViewToggle={false}
            showStats={true}
            showFeatured={false}
            itemsPerPage={12}
            enablePagination={true}
            enableAnimations={true}
            className="mt-6"
          />
        </Suspense>

        {/* Search Tips */}
        <Card className="mt-12 p-8 bg-blue-50 border-blue-200">
          <h3 className="text-xl font-bold text-blue-900 mb-4">
            💡 Search Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-900">
            <div>
              <ul className="space-y-2">
                <li>• Use quotes for exact phrases: &ldquo;bed sheet&rdquo;</li>
                <li>• Use AND/OR operators: curtains AND sizing</li>
                <li>• Use minus to exclude terms: sheets -fitted</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li>• Search by category: category:bedding</li>
                <li>• Filter by tag: tag:care-instructions</li>
                <li>• Wildcard search: curt* (matches curtains, curtain, etc.)</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </motion.div>
  );
}

// Wrapper with Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
