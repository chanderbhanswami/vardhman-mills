/**
 * Blog Main Page - Vardhman Mills Frontend
 * 
 * Comprehensive blog listing page with featured posts, categories, search,
 * filtering, pagination, and sidebar.
 * 
 * @module app/(content)/blog/page
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, createElement } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowUpIcon,
  RssIcon
} from '@heroicons/react/24/outline';

// Blog Components
import {
  BlogCard,
  BlogCardSkeleton,
  BlogGrid,
  BlogPagination,
  BlogFilter,
  BlogSearch,
  BlogSidebar,
  BlogCategories,
  BlogTags,
  FeaturedPostsGrid,
  PopularPostsSidebar,
  BlogBreadcrumbs
} from '@/components/blog';

// Common Components
import {
  SEOHead,
  BackToTop,
  Newsletter,
  EmptyState
} from '@/components/common';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';

// API and Hooks
import { 
  usePublishedBlogs, 
  useFeaturedBlogs, 
  useBlogCategories,
  useBlogTags,
  usePopularBlogs,
  useRecentBlogs,
  useSearchBlogs,
  useTrendingTopics
} from '@/lib/api/blog';

// Types
import type { 
  BlogPost as APIBlogPost, 
  BlogCategory as APIBlogCategory, 
  BlogTag as APIBlogTag 
} from '@/lib/api/types';

// Constants
import { APP_INFO, URLS, DEFAULTS } from '@/constants/app.constants';

// Utils
import { formatNumber, truncateText } from '@/lib/format';
import { debounce } from '@/lib/utils/performance';

/**
 * Local type definitions
 */
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface BlogFilters {
  search: string;
  category: string;
  tag: string;
  sortBy: 'latest' | 'popular' | 'trending' | 'oldest';
  viewMode: 'grid' | 'list';
  timeRange: 'all' | 'today' | 'week' | 'month' | 'year';
}

/**
 * Type transformation helpers - Add missing fields for components
 */
const transformBlogPostForCard = (post: APIBlogPost) => ({
  ...post,
  featuredImage: post.featuredImage || '/images/blog/default-featured.jpg',
  publishedAt: post.publishedAt || post.createdAt,
  category: post.categories?.[0] || {
    id: 'uncategorized',
    name: 'Uncategorized',
    slug: 'uncategorized',
    color: '#6B7280'
  },
  tags: (post.tags || []).map((tag: string) => ({
    id: tag,
    name: tag,
    slug: tag.toLowerCase().replace(/\s+/g, '-')
  })),
  readingTime: Math.ceil(post.content?.length / 1000) || 5,
  views: Math.floor(Math.random() * 1000),
  likes: Math.floor(Math.random() * 100),
  comments: Math.floor(Math.random() * 50)
});

const transformCategoryForComponent = (cat: APIBlogCategory) => ({
  ...cat,
  count: cat.postCount || 0,
  postCount: cat.postCount || 0,
  isActive: true,
  color: cat.color || '#3B82F6'
});

const transformTagForComponent = (tag: APIBlogTag) => ({
  id: tag.id,
  name: tag.name,
  slug: tag.slug,
  count: tag.postCount || 0
});

const transformPopularPost = (post: APIBlogPost) => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  featuredImage: post.featuredImage,
  imageUrl: post.featuredImage,
  readTime: Math.ceil(post.content?.length / 1000) || 5,
  views: Math.floor(Math.random() * 1000),
  comments: Math.floor(Math.random() * 50),
  likes: Math.floor(Math.random() * 100),
  publishedAt: post.publishedAt || post.createdAt,
  author: post.author,
  categories: (post.categories || []).map((cat: APIBlogCategory) => cat.name)
});

const transformRecentPost = (post: APIBlogPost) => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  featuredImage: post.featuredImage,
  imageUrl: post.featuredImage,
  readTime: Math.ceil(post.content?.length / 1000) || 5,
  publishedAt: post.publishedAt || post.createdAt
});

/**
 * Blog Main Page Component
 */
export default function BlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State Management
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'recent'>('all');
  const [filters, setFilters] = useState<BlogFilters>({
    search: searchParams?.get('search') || '',
    category: searchParams?.get('category') || '',
    tag: searchParams?.get('tag') || '',
    sortBy: (searchParams?.get('sort') as BlogFilters['sortBy']) || 'latest',
    viewMode: 'grid',
    timeRange: 'all'
  });

  // API Queries
  const { 
    data: blogData, 
    isLoading: isLoadingBlogs
  } = usePublishedBlogs({
    page: currentPage,
    limit: DEFAULTS.PAGINATION_SIZE,
  });

  const { data: featuredData } = useFeaturedBlogs({ limit: 3 });
  const { data: categoriesData, isLoading: isLoadingCategories } = useBlogCategories();
  const { data: tagsData, isLoading: isLoadingTags } = useBlogTags();
  const { data: popularData } = usePopularBlogs({ period: 'week', limit: 5 });
  const { data: recentData } = useRecentBlogs(5);
  const { data: trendingData } = useTrendingTopics({ period: 'week', limit: 10 });

  // Search Query (only when search length > 2)
  const shouldSearch = filters.search.length > 2;
  const { data: searchData } = useSearchBlogs(
    shouldSearch ? filters.search : '',
    {
      page: currentPage,
      limit: DEFAULTS.PAGINATION_SIZE,
      categoryId: filters.category,
      tags: filters.tag ? [filters.tag] : undefined
    }
  );

  // Extract and transform data
  const blogs = useMemo(() => {
    if (filters.search.length > 2 && searchData?.data) {
      return searchData.data.items || [];
    }
    return blogData?.data?.items || [];
  }, [blogData, searchData, filters.search]);

  const featuredBlogs = useMemo(() => featuredData?.data || [], [featuredData]);
  const categories = useMemo(() => categoriesData?.data?.items || [], [categoriesData]);
  const tags = useMemo(() => tagsData?.data?.items || [], [tagsData]);
  const popularBlogs = useMemo(() => popularData?.data || [], [popularData]);
  const recentBlogs = useMemo(() => recentData?.data || [], [recentData]);
  const trendingTopics = useMemo(() => trendingData?.data || [], [trendingData]);

  const pagination: PaginationMeta = useMemo(() => {
    const data = filters.search.length > 2 ? searchData?.data : blogData?.data;
    const apiPagination = data?.pagination;
    
    if (apiPagination) {
      return {
        page: apiPagination.page,
        limit: apiPagination.limit,
        total: apiPagination.total,
        totalPages: apiPagination.totalPages,
        hasNextPage: apiPagination.hasNextPage,
        hasPreviousPage: (apiPagination as { hasPreviousPage?: boolean; hasPrevPage?: boolean }).hasPreviousPage ?? (apiPagination as { hasPreviousPage?: boolean; hasPrevPage?: boolean }).hasPrevPage ?? false
      };
    }
    
    return {
      page: 1,
      limit: DEFAULTS.PAGINATION_SIZE,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false
    };
  }, [blogData, searchData, filters.search]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.tag) params.set('tag', filters.tag);
    if (filters.sortBy !== 'latest') params.set('sort', filters.sortBy);
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/blog';
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Handlers
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearch = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
    setCurrentPage(1);
  }, []);

  const debouncedSearch = useMemo(
    () => debounce(handleSearch, DEFAULTS.DEBOUNCE_DELAY),
    [handleSearch]
  );

  const handleFilterChange = useCallback((key: keyof BlogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      tag: '',
      sortBy: 'latest',
      viewMode: 'grid',
      timeRange: 'all'
    });
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    scrollToTop();
  }, [scrollToTop]);

  // Loading State
  if (isLoading || isLoadingBlogs || isLoadingCategories || isLoadingTags) {
    return (
      <Container>
        <div className="py-12 space-y-8">
          <div className="h-12 bg-gray-200 animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <>
      {/* SEO Head */}
      <SEOHead
        title={`Blog - ${APP_INFO.NAME}`}
        description="Explore our latest articles, insights, and news from the textile industry. Stay updated with trends, innovations, and expert opinions."
        canonical={`${URLS.BASE}/blog`}
        keywords="blog, articles, textile industry, insights, trends, news"
      />

      {/* Main Content */}
      <main className="blog-page">
        {/* Breadcrumbs */}
        <section className="bg-white border-b">
          <Container className="py-4">
            <BlogBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />
          </Container>
        </section>

        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Our Blog
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Insights, trends, and stories from the textile industry
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold">{formatNumber(pagination.total)}</div>
                  <div className="text-sm text-blue-200">Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{categories.length}</div>
                  <div className="text-sm text-blue-200">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{tags.length}</div>
                  <div className="text-sm text-blue-200">Topics</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    <RssIcon className="h-8 w-8 mx-auto" />
                  </div>
                  <div className="text-sm text-blue-200">RSS Feed</div>
                </div>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Featured Posts */}
        {featuredBlogs.length > 0 && (
          <section className="py-12 bg-gray-50">
            <Container>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Featured Articles</h2>
                <Badge variant="default" className="text-sm">
                  Featured
                </Badge>
              </div>
              
              <FeaturedPostsGrid posts={featuredBlogs.map(transformBlogPostForCard)} />
            </Container>
          </section>
        )}

        {/* Search and Filters */}
        <section className="py-8 bg-white border-b">
          <Container>
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search Bar */}
              <div className="flex-1 w-full lg:max-w-2xl">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search articles, topics, authors..."
                    value={filters.search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => debouncedSearch(e.target.value)}
                    className="pl-10 pr-4"
                  />
                  {filters.search && (
                    <button
                      onClick={() => handleSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={showAdvancedSearch ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filters
                </Button>

                <select
                  value={filters.sortBy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('sortBy', e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
                  aria-label="Sort by"
                >
                  <option value="latest">Latest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="trending">Trending</option>
                  <option value="oldest">Oldest First</option>
                </select>

                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleFilterChange('viewMode', 'grid')}
                    className={`p-2 ${
                      filters.viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    aria-label="Grid view"
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleFilterChange('viewMode', 'list')}
                    className={`p-2 ${
                      filters.viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    aria-label="List view"
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>

                {(filters.category || filters.tag || filters.search) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced Search */}
            <AnimatePresence>
              {showAdvancedSearch && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <BlogFilter
                    filters={{
                      categories: filters.category ? [filters.category] : [],
                      tags: filters.tag ? [filters.tag] : [],
                      authors: [],
                      dateRange: { start: undefined, end: undefined },
                      status: 'all' as const,
                      sortBy: filters.sortBy === 'latest' ? 'newest' : filters.sortBy,
                      search: filters.search,
                      readingTime: { min: 0, max: 60 }
                    }}
                    onFiltersChange={(newFilters) => {
                      if (newFilters.categories?.[0]) handleFilterChange('category', newFilters.categories[0]);
                      if (newFilters.tags?.[0]) handleFilterChange('tag', newFilters.tags[0]);
                    }}
                    categories={categories.map((cat: APIBlogCategory) => ({ 
                      id: cat.id, 
                      label: cat.name, 
                      value: cat.id 
                    }))}
                    tags={tags.map((tag: APIBlogTag) => ({ 
                      id: tag.id, 
                      label: tag.name, 
                      value: tag.id 
                    }))}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Filters */}
            {(filters.category || filters.tag) && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center gap-2">
                    Category: {categories.find((c: APIBlogCategory) => c.id === filters.category)?.name}
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className="hover:text-red-600"
                      aria-label="Remove category filter"
                    >
                      ✕
                    </button>
                  </Badge>
                )}
                {filters.tag && (
                  <Badge variant="secondary" className="flex items-center gap-2">
                    Tag: {tags.find((t: APIBlogTag) => t.id === filters.tag)?.name}
                    <button
                      onClick={() => handleFilterChange('tag', '')}
                      className="hover:text-red-600"
                      aria-label="Remove tag filter"
                    >
                      ✕
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </Container>
        </section>

        {/* Tabs Section */}
        <section className="bg-white border-b">
          <Container>
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)}>
              <TabsList className="flex gap-4 border-b">
                <TabsTrigger value="all" className="pb-4">
                  All Articles
                </TabsTrigger>
                <TabsTrigger value="featured" className="pb-4">
                  Featured
                </TabsTrigger>
                <TabsTrigger value="recent" className="pb-4">
                  Recent
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" />
              <TabsContent value="featured" />
              <TabsContent value="recent" />
            </Tabs>
          </Container>
        </section>

        {/* Main Content Area */}
        <section className="py-12 bg-gray-50">
          <Container>
            <div className="grid lg:grid-cols-[1fr_350px] gap-8">
              {/* Blog Posts */}
              <div>
                {/* Empty State */}
                {blogs.length === 0 ? (
                  <EmptyState
                    icon={createElement(MagnifyingGlassIcon, { className: 'h-12 w-12' })}
                    title="No articles found"
                    description="Try adjusting your search or filters to find what you're looking for."
                    action={
                      filters.search || filters.category || filters.tag ? {
                        label: 'Clear Filters',
                        onClick: handleClearFilters,
                        variant: 'default' as const
                      } : undefined
                    }
                  />
                ) : (
                  <>
                    <div className="mb-6">
                      <p className="text-gray-600">
                        Showing <span className="font-semibold">{blogs.length}</span> of{' '}
                        <span className="font-semibold">{formatNumber(pagination.total)}</span> articles
                      </p>
                    </div>

                    {filters.viewMode === 'grid' ? (
                      <div className="space-y-6">
                        {blogs.map((post: APIBlogPost, index: number) => {
                          const transformedPost = transformBlogPostForCard(post);
                          return (
                            <motion.div
                              key={post.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <BlogCard
                                post={transformedPost}
                                showStats={true}
                              />
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <BlogGrid 
                        posts={blogs.map(transformBlogPostForCard)} 
                      />
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="mt-8">
                        <BlogPagination
                          pagination={{
                            currentPage: currentPage,
                            totalPages: pagination.totalPages,
                            totalItems: pagination.total,
                            itemsPerPage: pagination.limit,
                            hasNextPage: pagination.hasNextPage,
                            hasPreviousPage: pagination.hasPreviousPage,
                            startIndex: (currentPage - 1) * pagination.limit,
                            endIndex: Math.min(currentPage * pagination.limit, pagination.total)
                          }}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sidebar */}
              <aside className="space-y-8">
                {/* Search Widget */}
                <Card className="p-6">
                  <BlogSearch
                    onSearch={async (query: string) => {
                      handleSearch(query);
                      return [];
                    }}
                    placeholder="Search articles..."
                  />
                </Card>

                {/* Filter Widget */}
                <Card className="p-6">
                  <BlogFilter
                    filters={{
                      categories: filters.category ? [filters.category] : [],
                      tags: filters.tag ? [filters.tag] : [],
                      authors: [],
                      dateRange: { start: undefined, end: undefined },
                      status: 'all' as const,
                      sortBy: filters.sortBy === 'latest' ? 'newest' : filters.sortBy,
                      search: filters.search,
                      readingTime: { min: 0, max: 60 }
                    }}
                    onFiltersChange={(newFilters) => {
                      if (newFilters.categories?.[0]) handleFilterChange('category', newFilters.categories[0]);
                      if (newFilters.tags?.[0]) handleFilterChange('tag', newFilters.tags[0]);
                    }}
                    categories={categories.map((cat: APIBlogCategory) => ({ 
                      id: cat.id, 
                      label: cat.name, 
                      value: cat.id 
                    }))}
                    tags={tags.map((tag: APIBlogTag) => ({ 
                      id: tag.id, 
                      label: tag.name, 
                      value: tag.id 
                    }))}
                  />
                </Card>

                {/* Blog Sidebar */}
                <BlogSidebar
                  popularPosts={popularBlogs.map(transformPopularPost)}
                  recentPosts={recentBlogs.map(transformRecentPost)}
                  categories={categories.map(transformCategoryForComponent)}
                  tags={tags.map(transformTagForComponent)}
                  onCategoryClick={(category) => handleFilterChange('category', category.id)}
                  onTagClick={(tag) => handleFilterChange('tag', tag.id)}
                />

                {/* Categories Widget */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Categories</h3>
                  <BlogCategories
                    categories={categories.map(transformCategoryForComponent)}
                    selectedCategory={filters.category}
                    onCategorySelect={(id: string | null) => handleFilterChange('category', id || '')}
                  />
                </Card>

                {/* Popular Posts */}
                <Card className="p-6">
                  <PopularPostsSidebar 
                    posts={popularBlogs.map(transformPopularPost)} 
                  />
                </Card>

                {/* Tags Cloud */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
                  <BlogTags
                    tags={tags.map(transformTagForComponent)}
                    selectedTags={filters.tag ? [filters.tag] : []}
                  />
                </Card>

                {/* Trending Topics */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <RssIcon className="h-5 w-5 text-orange-500" />
                    Trending Topics
                  </h3>
                  <ul className="space-y-2">
                    {trendingTopics.map((topic: { topic?: string; name?: string; count?: number }, index: number) => (
                      <li key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {truncateText(topic.topic || topic.name || '', 30)}
                        </span>
                        <Badge
                          variant={
                            index === 0 ? 'default' : index === 1 ? 'secondary' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {topic.count || 0}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Newsletter */}
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <Newsletter
                    title="Stay Updated"
                    subtitle="Get the latest articles delivered to your inbox."
                  />
                </Card>
              </aside>
            </div>
          </Container>
        </section>
      </main>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <button
              onClick={scrollToTop}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors"
              aria-label="Back to top"
            >
              <ArrowUpIcon className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <BackToTop />
    </>
  );
}
