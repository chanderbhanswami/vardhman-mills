/**
 * Blog Categories Loading State
 * 
 * @module app/(content)/blog/categories/loading
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function BlogCategoriesLoading() {
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
          </div>
        </Container>
      </section>

      {/* Header Skeleton */}
      <section className="py-12 bg-gradient-to-br from-blue-600 to-indigo-700">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Skeleton className="h-16 w-16 mx-auto mb-6 rounded-full bg-white/20" />
            <Skeleton className="h-12 w-64 mx-auto mb-4 bg-white/20" />
            <Skeleton className="h-6 w-96 mx-auto bg-white/20" />
          </div>
        </Container>
      </section>

      {/* Filters Skeleton */}
      <section className="py-6 bg-white border-b">
        <Container>
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </Container>
      </section>

      {/* Categories Grid Skeleton */}
      <section className="py-12">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-6">
                  <Skeleton className="h-16 w-16 rounded-lg mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-3" />
                  <Skeleton className="h-4 w-24" />
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
