/**
 * Blog Categories Page - Vardhman Mills Frontend
 * 
 * Displays all blog categories with post counts and descriptions
 * 
 * @module app/(content)/blog/categories/page
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FolderIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

import {
  BlogBreadcrumbs
} from '@/components/blog';

import {
  SEOHead,
  LoadingSpinner,
  EmptyState
} from '@/components/common';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

import { useBlogCategories } from '@/lib/api/blog';
import { APP_INFO, URLS } from '@/constants/app.constants';
import { formatNumber } from '@/utils/format';
import type { BlogCategory } from '@/lib/api/types';

export default function BlogCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data, isLoading } = useBlogCategories();
  const categoriesData = data?.data;
  const categories: BlogCategory[] = Array.isArray(categoriesData) 
    ? categoriesData 
    : categoriesData?.items || [];

  // Filter categories
  const filteredCategories = categories.filter((cat: BlogCategory) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" color="blue" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`Blog Categories - ${APP_INFO.NAME}`}
        description="Browse all blog categories to find articles on topics that interest you."
        canonical={`${URLS.BASE}/blog/categories`}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <section className="bg-white border-b">
          <Container className="py-4">
            <BlogBreadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Blog', href: '/blog' },
                { label: 'Categories' }
              ]}
            />
          </Container>
        </section>

        {/* Header */}
        <section className="py-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <FolderOpenIcon className="h-16 w-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Blog Categories
              </h1>
              <p className="text-xl text-blue-100">
                Explore articles organized by topics and themes
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  {formatNumber(categories.length)} Categories
                </Badge>
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  {formatNumber(categories.reduce((acc, cat) => acc + (cat.postCount || 0), 0))} Articles
                </Badge>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Filters */}
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
                    placeholder="Search categories..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
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
          </Container>
        </section>

        {/* Categories Grid/List */}
        <section className="py-12">
          <Container>
            {filteredCategories.length === 0 ? (
              <EmptyState
                icon={<FolderIcon className="h-16 w-16" />}
                title="No categories found"
                description="Try adjusting your search query"
                action={{
                  label: 'Clear Search',
                  onClick: () => setSearchQuery(''),
                  variant: 'default'
                }}
              />
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/blog/categories/${category.slug}`}>
                      <Card className={`
                        h-full p-6 hover:shadow-lg transition-all cursor-pointer
                        border-l-4 hover:border-l-blue-600
                        ${viewMode === 'list' ? 'flex items-center gap-6' : ''}
                      `}>
                        <div className={`
                          flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600
                          flex items-center justify-center text-white
                          ${viewMode === 'list' ? '' : 'mb-4'}
                        `}>
                          <FolderIcon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {category.name}
                            </h3>
                            <Badge variant="secondary">
                              {formatNumber(category.postCount || 0)}
                            </Badge>
                          </div>
                          {category.description && (
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                          <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View Articles →
                          </span>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </Container>
        </section>
      </main>
    </>
  );
}
