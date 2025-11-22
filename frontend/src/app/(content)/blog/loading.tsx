/**
 * Blog Loading Page - Vardhman Mills Frontend
 * 
 * Loading skeleton for blog listing page.
 * 
 * @module app/(content)/blog/loading
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Blog Components
import {
  BlogCardSkeleton,
  BlogSidebarSkeleton
} from '@/components/blog/BlogSkeleton/BlogSkeleton';

// UI Components
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';

/**
 * Blog Loading Component
 */
export default function BlogLoading() {
  return (
    <main className="blog-loading">
      {/* Breadcrumb Skeleton */}
      <section className="bg-white border-b">
        <Container className="py-4">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <span className="text-gray-400">/</span>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </Container>
      </section>

      {/* Hero Skeleton */}
      <section className="py-12 bg-gradient-to-br from-blue-600 to-indigo-700">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <div className="h-12 w-48 bg-blue-500 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-96 bg-blue-500 rounded mx-auto mb-8 animate-pulse" />
            
            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 w-16 bg-blue-500 rounded mx-auto mb-2 animate-pulse" />
                  <div className="h-4 w-20 bg-blue-500 rounded mx-auto animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Posts Skeleton */}
      <section className="py-12 bg-gray-50">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Search and Filters Skeleton */}
      <section className="py-8 bg-white border-b">
        <Container>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:max-w-2xl">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content Skeleton */}
      <section className="py-12 bg-gray-50">
        <Container>
          <div className="grid lg:grid-cols-[1fr_350px] gap-8">
            {/* Blog Posts Skeleton */}
            <div className="space-y-6">
              <div className="h-5 w-64 bg-gray-200 rounded animate-pulse mb-6" />
              
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <BlogCardSkeleton />
                </motion.div>
              ))}

              {/* Pagination Skeleton */}
              <div className="flex items-center justify-center gap-2 mt-12">
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <aside className="space-y-8">
              <BlogSidebarSkeleton />
              
              {/* Additional Widgets */}
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="flex items-center justify-between">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                </Card>
              ))}

              {/* Newsletter Skeleton */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-4" />
                <div className="h-10 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-10 bg-blue-200 rounded animate-pulse" />
              </Card>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
