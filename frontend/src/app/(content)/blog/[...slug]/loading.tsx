/**
 * Blog Post Detail Loading State
 * 
 * @module app/(content)/blog/[...slug]/loading
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function BlogPostLoading() {
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
            <Skeleton className="h-4 w-32" />
          </div>
        </Container>
      </section>

      {/* Header Skeleton */}
      <section className="py-8 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-4 w-24 mb-6" />
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-3/4 mb-6" />
            <Skeleton className="h-6 w-full mb-8" />
            
            <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b">
              <div className="flex items-center gap-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-10" />
                <Skeleton className="h-9 w-10" />
                <Skeleton className="h-9 w-10" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Image Skeleton */}
      <section className="py-8 bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>
        </Container>
      </section>

      {/* Content Skeleton */}
      <section className="py-12 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_200px] gap-8">
              <div className="space-y-4">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Skeleton className="h-4 w-full" />
                  </motion.div>
                ))}
              </div>
              <aside className="space-y-4">
                <Card className="p-4">
                  <Skeleton className="h-6 w-16 mb-3" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </Card>
              </aside>
            </div>
          </div>
        </Container>
      </section>

      {/* Author Skeleton */}
      <section className="py-12 bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Related Posts Skeleton */}
      <section className="py-12 bg-white">
        <Container>
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Comments Skeleton */}
      <section className="py-12 bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-40 mb-8" />
            <Card className="p-6 mb-8">
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-10 w-32 ml-auto" />
            </Card>
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6 mb-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
