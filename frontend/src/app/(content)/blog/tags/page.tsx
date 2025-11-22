/**
 * Blog Tags Page - Vardhman Mills Frontend
 * 
 * Displays all blog tags with post counts in a tag cloud
 * 
 * @module app/(content)/blog/tags/page
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TagIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { BlogBreadcrumbs } from '@/components/blog';
import { SEOHead, LoadingSpinner, EmptyState } from '@/components/common';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

import { useBlogTags } from '@/lib/api/blog';
import { APP_INFO, URLS } from '@/constants/app.constants';

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

export default function BlogTagsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data, isLoading } = useBlogTags();
  const tags: BlogTag[] = data?.data?.items || [];

  const filteredTags = tags.filter((tag: BlogTag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate tag sizes based on post count
  const maxCount = Math.max(...tags.map((tag: BlogTag) => tag.postCount || 0), 1);
  const getTagSize = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return 'text-3xl';
    if (ratio > 0.4) return 'text-2xl';
    if (ratio > 0.2) return 'text-xl';
    return 'text-lg';
  };

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
        title={`Blog Tags - ${APP_INFO.NAME}`}
        description="Browse all blog tags to discover articles by topic."
        canonical={`${URLS.BASE}/blog/tags`}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <section className="bg-white border-b">
          <Container className="py-4">
            <BlogBreadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Blog', href: '/blog' },
                { label: 'Tags' }
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
              <TagIcon className="h-16 w-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog Tags</h1>
              <p className="text-xl text-blue-100">
                Explore articles by topic and discover related content
              </p>
              <div className="mt-8">
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  {tags.length} Tags
                </Badge>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Search */}
        <section className="py-6 bg-white border-b">
          <Container>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tags..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* Tag Cloud */}
        <section className="py-12">
          <Container>
            {filteredTags.length === 0 ? (
              <EmptyState
                icon={<TagIcon className="h-16 w-16" />}
                title="No tags found"
                description="Try adjusting your search query"
                action={{
                  label: 'Clear Search',
                  onClick: () => setSearchQuery(''),
                  variant: 'default'
                }}
              />
            ) : (
              <Card className="p-8 md:p-12">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {filteredTags.map((tag: BlogTag, index: number) => (
                    <motion.div
                      key={tag.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Link href={`/blog/tags/${tag.slug}`}>
                        <span
                          className={`
                            ${getTagSize(tag.postCount || 0)}
                            font-semibold text-gray-700 hover:text-blue-600
                            transition-colors cursor-pointer inline-flex items-center gap-2
                          `}
                        >
                          #{tag.name}
                          <Badge variant="secondary" className="text-xs">
                            {tag.postCount || 0}
                          </Badge>
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}

            {/* Popular Tags */}
            {tags.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Most Popular Tags
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tags
                    .sort((a: BlogTag, b: BlogTag) => (b.postCount || 0) - (a.postCount || 0))
                    .slice(0, 6)
                    .map((tag: BlogTag) => (
                      <Link key={tag.id} href={`/blog/tags/${tag.slug}`}>
                        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TagIcon className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold text-gray-900">
                                {tag.name}
                              </span>
                            </div>
                            <Badge variant="secondary">{tag.postCount || 0}</Badge>
                          </div>
                        </Card>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </Container>
        </section>
      </main>
    </>
  );
}
