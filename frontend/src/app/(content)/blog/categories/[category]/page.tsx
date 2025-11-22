/**
 * Blog Category Detail Page - Vardhman Mills Frontend
 * 
 * Displays blog posts filtered by category
 * 
 * @module app/(content)/blog/categories/[category]/page
 */

'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FolderIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import {
  BlogGrid,
  BlogBreadcrumbs,
  BlogPagination,
  BlogSidebar,
  BlogCardSkeleton
} from '@/components/blog';

import {
  SEOHead,
  LoadingSpinner,
  EmptyState
} from '@/components/common';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';

import { useBlogsByCategory, useBlogCategories } from '@/lib/api/blog';
import { APP_INFO, URLS } from '@/constants/app.constants';
import type { BlogCategory, BlogPost } from '@/lib/api/types';
import type { BlogPost as BlogCardPost } from '@/components/blog/BlogCard/BlogCard';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

// Transform API BlogPost to BlogCard BlogPost
const transformPostForCard = (post: BlogPost): BlogCardPost => {
  const category = post.categories && post.categories.length > 0
    ? {
        id: post.categories[0].id,
        name: post.categories[0].name,
        slug: post.categories[0].slug,
        color: undefined
      }
    : {
        id: 'uncategorized',
        name: 'Uncategorized',
        slug: 'uncategorized'
      };

  const tags = (post.tags || []).map((tag: string | { id: string; name: string; slug: string }) => 
    typeof tag === 'string'
      ? { id: tag, name: tag, slug: tag.toLowerCase().replace(/\s+/g, '-') }
      : tag
  );

  return {
    ...post,
    featuredImage: post.featuredImage || '/images/blog/default-featured.jpg',
    publishedAt: post.publishedAt || post.createdAt || new Date().toISOString(),
    category,
    tags,
    readingTime: Math.ceil((post.content?.length || 0) / 1000) || 5,
    views: 0,
    likes: 0,
    comments: 0,
    isLiked: false,
    isBookmarked: false
  };
};

export default function BlogCategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const categorySlug = resolvedParams.category;
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // API Queries
  const { data: postsData, isLoading: postsLoading } = useBlogsByCategory(
    categorySlug,
    { page, limit: 12 }
  );
  const { data: categoriesData } = useBlogCategories();

  const posts: BlogPost[] = postsData?.data?.items || [];
  const pagination = postsData?.data?.pagination;
  const categoriesItems = categoriesData?.data?.items || categoriesData?.data || [];
  const currentCategory: BlogCategory | undefined = Array.isArray(categoriesItems)
    ? categoriesItems.find((cat: BlogCategory) => cat.slug === categorySlug)
    : undefined;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('latest');
    setPage(1);
  };

  if (postsLoading && !posts.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" color="blue" />
      </div>
    );
  }

  if (!currentCategory && !postsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<FolderIcon className="h-16 w-16" />}
          title="Category Not Found"
          description="The category you're looking for doesn't exist."
          action={{
            label: 'View All Categories',
            onClick: () => router.push('/blog/categories'),
            variant: 'default'
          }}
        />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${currentCategory?.name || 'Category'} - Blog - ${APP_INFO.NAME}`}
        description={currentCategory?.description || `Articles in the ${currentCategory?.name} category`}
        canonical={`${URLS.BASE}/blog/categories/${categorySlug}`}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <section className="bg-white border-b">
          <Container className="py-4">
            <BlogBreadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Blog', href: '/blog' },
                { label: 'Categories', href: '/blog/categories' },
                { label: currentCategory?.name || categorySlug }
              ]}
            />
          </Container>
        </section>

        {/* Category Header */}
        <section className="py-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Link
                href="/blog/categories"
                className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                All Categories
              </Link>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center">
                  <FolderIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">
                    {currentCategory?.name || categorySlug}
                  </h1>
                  {currentCategory?.postCount !== undefined && (
                    <Badge variant="secondary" className="text-lg">
                      {currentCategory.postCount} Articles
                    </Badge>
                  )}
                </div>
              </div>
              
              {currentCategory?.description && (
                <p className="text-xl text-blue-100">
                  {currentCategory.description}
                </p>
              )}
            </motion.div>
          </Container>
        </section>

        {/* Filters Bar */}
        <section className="py-6 bg-white border-b sticky top-0 z-10 shadow-sm">
          <Container>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort & View Options */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular')}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Sort blog posts"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Popular</option>
                </select>

                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {(searchQuery || sortBy !== 'latest') && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <FunnelIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary">
                    Search: {searchQuery}
                    <button 
                      onClick={() => setSearchQuery('')} 
                      className="ml-2"
                      aria-label="Clear search filter"
                      title="Clear search filter"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {sortBy !== 'latest' && (
                  <Badge variant="secondary">
                    Sort: {sortBy}
                    <button 
                      onClick={() => setSortBy('latest')} 
                      className="ml-2"
                      aria-label="Clear sort filter"
                      title="Clear sort filter"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </Container>
        </section>

        {/* Content */}
        <section className="py-12">
          <Container>
            <div className="grid lg:grid-cols-[1fr_300px] gap-8">
              {/* Main Content */}
              <div>
                {postsLoading ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <BlogCardSkeleton key={i} />
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <EmptyState
                    icon={<FolderIcon className="h-16 w-16" />}
                    title="No articles found"
                    description="There are no articles in this category matching your filters."
                    action={{
                      label: 'Clear Filters',
                      onClick: handleClearFilters,
                      variant: 'default'
                    }}
                  />
                ) : (
                  <>
                    <BlogGrid posts={posts.map(transformPostForCard)} layout={viewMode} />
                    
                    {pagination && (
                      <div className="mt-8">
                        <BlogPagination
                          pagination={{
                            currentPage: pagination.page,
                            totalPages: pagination.totalPages,
                            totalItems: pagination.total,
                            itemsPerPage: pagination.limit,
                            hasNextPage: pagination.hasNextPage,
                            hasPreviousPage: pagination.hasPrevPage,
                            startIndex: (pagination.page - 1) * pagination.limit,
                            endIndex: Math.min(pagination.page * pagination.limit, pagination.total)
                          }}
                          onPageChange={setPage}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sidebar */}
              <aside className="lg:sticky lg:top-24 self-start">
                <BlogSidebar />
              </aside>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
