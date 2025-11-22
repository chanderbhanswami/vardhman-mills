/**
 * Blog Category Detail Loading State
 * 
 * @module app/(content)/blog/categories/[category]/loading
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { BlogCardSkeleton, BlogSidebarSkeleton } from '@/components/blog/BlogSkeleton/BlogSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function BlogCategoryLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs Skeleton */}
      <section className="bg-white border-b">
        <Container className="py-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <span className="text-gray-400">/</span>
            <Skeleton className="h-4 w-16" />
            <span className="text-gray-400">/</span>
            <Skeleton className="h-4 w-24" />
            <span className="text-gray-400">/</span>
            <Skeleton className="h-4 w-32" />
          </div>
        </Container>
      </section>

      {/* Header Skeleton */}
      <section className="py-12 bg-gradient-to-br from-blue-600 to-indigo-700">
        <Container>
          <div className="max-w-3xl">
            <Skeleton className="h-6 w-32 mb-6 bg-white/20" />
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-16 w-16 rounded-lg bg-white/20" />
              <div>
                <Skeleton className="h-12 w-64 mb-2 bg-white/20" />
                <Skeleton className="h-6 w-24 bg-white/20" />
              </div>
            </div>
            <Skeleton className="h-6 w-96 bg-white/20" />
          </div>
        </Container>
      </section>

      {/* Filters Skeleton */}
      <section className="py-6 bg-white border-b">
        <Container>
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </Container>
      </section>

      {/* Content Skeleton */}
      <section className="py-12">
        <Container>
          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <BlogCardSkeleton />
                </motion.div>
              ))}
            </div>
            <aside>
              <BlogSidebarSkeleton />
            </aside>
          </div>
        </Container>
      </section>
    </div>
  );
}
