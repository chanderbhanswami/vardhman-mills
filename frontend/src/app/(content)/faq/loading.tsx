'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  FAQSkeletonList, 
  FAQCategorySkeleton, 
  FAQSearchSkeleton,
  FAQFilterSkeleton,
  FAQStatsSkeleton 
} from '@/components/faq/FAQSkeleton';

/**
 * Loading Component for FAQ Page
 * Displays comprehensive skeleton screens while FAQ content is being loaded
 * Provides optimal UX with proper loading states for all sections
 */
const FAQLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Banner Skeleton */}
      <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-white rounded-full blur-xl animate-pulse" />
          <div className="absolute top-1/2 -left-8 w-24 h-24 bg-white rounded-full blur-lg animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white rounded-full blur-2xl animate-pulse" />
        </div>

        <Container className="relative z-10 py-20">
          <div className="text-center">
            {/* Badge Skeleton */}
            <div className="inline-flex items-center justify-center mb-6">
              <Skeleton className="h-8 w-40 rounded-full bg-white/20" />
            </div>

            {/* Title Skeleton */}
            <Skeleton className="h-14 md:h-20 w-3/4 max-w-3xl mx-auto mb-6 bg-white/20 rounded-lg" />

            {/* Description Skeleton */}
            <div className="max-w-3xl mx-auto space-y-3 mb-8">
              <Skeleton className="h-6 w-full bg-white/15 rounded" />
              <Skeleton className="h-6 w-5/6 mx-auto bg-white/15 rounded" />
            </div>

            {/* Search Bar Skeleton */}
            <div className="max-w-2xl mx-auto">
              <FAQSearchSkeleton className="w-full" />
            </div>
          </div>

          {/* Quick Stats Skeleton */}
          <div className="mt-12">
            <FAQStatsSkeleton />
          </div>
        </Container>
      </section>

      {/* Main Content Area */}
      <Container className="py-16">
        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center gap-2 mb-8 animate-pulse">
          <Skeleton className="h-4 w-12 bg-gray-200 rounded" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-16 bg-gray-200 rounded" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-20 bg-gray-200 rounded" />
        </div>

        {/* Page Title Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4 bg-gray-200 rounded-lg" />
          <Skeleton className="h-5 w-96 max-w-full mx-auto bg-gray-100 rounded" />
        </div>

        {/* Filters and Controls Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            {/* Left Side - Filters Button */}
            <div className="flex items-center gap-4 animate-pulse">
              <Skeleton className="h-10 w-32 bg-gray-200 rounded-lg" />
              <Skeleton className="h-5 w-40 bg-gray-100 rounded" />
              <Skeleton className="h-8 w-24 bg-red-100 rounded-lg" />
            </div>

            {/* Right Side - Sort and View */}
            <div className="flex items-center gap-3 animate-pulse">
              <Skeleton className="h-10 w-48 bg-gray-200 rounded-lg" />
              <div className="flex items-center border rounded-lg overflow-hidden">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10 bg-gray-200" />
                ))}
              </div>
            </div>
          </div>

          {/* Expanded Filters Panel Skeleton */}
          <FAQFilterSkeleton />
        </div>

        {/* Categories Section Skeleton */}
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 animate-pulse">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 bg-gray-200 rounded" />
              <Skeleton className="h-5 w-64 bg-gray-100 rounded" />
            </div>
            <Skeleton className="h-10 w-40 bg-gray-200 rounded-lg" />
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[...Array(6)].map((_, index) => (
              <Card 
                key={index} 
                className="p-6 animate-pulse hover:shadow-lg transition-shadow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <Skeleton className="h-12 w-12 rounded-lg bg-gray-200 flex-shrink-0" />
                  
                  <div className="flex-1 space-y-3">
                    {/* Title and Count */}
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-32 bg-gray-200 rounded" />
                      <Skeleton className="h-5 w-16 rounded-full bg-gray-100" />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full bg-gray-100 rounded" />
                      <Skeleton className="h-4 w-3/4 bg-gray-100 rounded" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <Skeleton className="h-4 w-4 rounded bg-gray-200" />
                          <Skeleton className="h-4 w-8 bg-gray-100 rounded" />
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-2">
                      <Skeleton className="h-2 w-full bg-gray-200 rounded-full" />
                      <Skeleton className="h-3 w-20 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Expanded Category with FAQs Skeleton */}
          <div className="space-y-6">
            <FAQCategorySkeleton />
            <FAQCategorySkeleton />
          </div>
        </div>

        {/* Featured FAQs Section Skeleton */}
        <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl animate-pulse">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-3 bg-gray-200 rounded-lg" />
            <Skeleton className="h-5 w-96 max-w-full mx-auto bg-gray-100 rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="p-6 bg-white animate-pulse">
                <div className="flex items-start gap-3 mb-4">
                  <Skeleton className="h-8 w-8 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-full bg-gray-200 rounded" />
                    <Skeleton className="h-5 w-4/5 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-gray-100 rounded" />
                  <Skeleton className="h-4 w-full bg-gray-100 rounded" />
                  <Skeleton className="h-4 w-3/4 bg-gray-100 rounded" />
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <Skeleton className="h-8 w-20 bg-gray-100 rounded-lg" />
                  <Skeleton className="h-8 w-20 bg-gray-100 rounded-lg" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Topics Skeleton */}
        <div className="mt-16">
          <div className="text-center mb-8 animate-pulse">
            <Skeleton className="h-8 w-48 mx-auto mb-3 bg-gray-200 rounded-lg" />
            <Skeleton className="h-5 w-80 max-w-full mx-auto bg-gray-100 rounded" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, index) => (
              <Card 
                key={index} 
                className="p-4 text-center hover:shadow-md transition-shadow animate-pulse"
              >
                <Skeleton className="h-10 w-10 rounded-lg bg-gray-200 mx-auto mb-3" />
                <Skeleton className="h-4 w-20 mx-auto bg-gray-100 rounded" />
                <Skeleton className="h-3 w-16 mx-auto mt-2 bg-gray-50 rounded" />
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ List Skeleton */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6 animate-pulse">
            <Skeleton className="h-8 w-40 bg-gray-200 rounded" />
            <Skeleton className="h-6 w-32 bg-gray-100 rounded" />
          </div>

          <FAQSkeletonList count={5} variant="detailed" showStats={true} showTags={true} />
        </div>

        {/* Pagination Skeleton */}
        <div className="mt-12 flex items-center justify-center gap-2 animate-pulse">
          <Skeleton className="h-10 w-10 bg-gray-200 rounded-lg" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 bg-gray-200 rounded-lg" />
          ))}
          <Skeleton className="h-10 w-10 bg-gray-200 rounded-lg" />
        </div>
      </Container>

      {/* Contact Support Section Skeleton */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <Container>
          <div className="text-center animate-pulse">
            <Skeleton className="h-12 w-96 max-w-full mx-auto mb-4 bg-white/20 rounded-lg" />
            <Skeleton className="h-6 w-3/4 max-w-2xl mx-auto mb-8 bg-white/15 rounded" />
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Skeleton className="h-12 w-48 bg-white/20 rounded-lg" />
              <Skeleton className="h-12 w-48 bg-white/20 rounded-lg" />
            </div>
          </div>
        </Container>
      </section>

      {/* Newsletter Subscription Skeleton */}
      <section className="py-16 bg-gray-50">
        <Container>
          <Card className="max-w-4xl mx-auto p-8 animate-pulse">
            <div className="text-center mb-6">
              <Skeleton className="h-10 w-64 mx-auto mb-3 bg-gray-200 rounded-lg" />
              <Skeleton className="h-5 w-96 max-w-full mx-auto bg-gray-100 rounded" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <Skeleton className="h-12 flex-1 bg-gray-200 rounded-lg" />
              <Skeleton className="h-12 w-32 bg-primary-200 rounded-lg" />
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              <Skeleton className="h-4 w-4 bg-gray-200 rounded" />
              <Skeleton className="h-4 w-64 bg-gray-100 rounded" />
            </div>
          </Card>
        </Container>
      </section>

      {/* Trust Indicators Skeleton */}
      <section className="py-12">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="text-center animate-pulse">
                <Skeleton className="h-12 w-12 rounded-lg bg-gray-200 mx-auto mb-3" />
                <Skeleton className="h-5 w-24 mx-auto mb-2 bg-gray-200 rounded" />
                <Skeleton className="h-4 w-32 mx-auto bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 right-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default FAQLoading;
