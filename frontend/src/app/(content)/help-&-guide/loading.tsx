'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// Skeleton component with shimmer effect
const Skeleton: React.FC<{ 
  className?: string; 
  width?: string | number;
  height?: string | number;
  rounded?: string;
}> = ({ className, width, height, rounded = 'rounded-md' }) => {
  // Convert width and height to Tailwind classes when possible
  const getWidthClass = () => {
    if (typeof width === 'string') return width;
    if (typeof width === 'number' && width <= 96) return `w-${width}`;
    return 'w-full';
  };

  const getHeightClass = () => {
    if (typeof height === 'string') return height;
    if (typeof height === 'number' && height <= 96) return `h-${height}`;
    return 'h-auto';
  };

  return (
    <div 
      className={cn(
        'bg-gray-200 relative overflow-hidden bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
        'bg-[length:200%_100%] animate-shimmer',
        rounded,
        getWidthClass(),
        getHeightClass(),
        className
      )}
    />
  );
};

// Banner Skeleton
const BannerSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-8 md:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div className="text-center space-y-3">
          <Skeleton height={40} width="60%" className="mx-auto" />
          <Skeleton height={20} width="80%" className="mx-auto" />
          <Skeleton height={20} width="70%" className="mx-auto" />
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton height={56} width="100%" rounded="rounded-lg" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton height={40} width={40} rounded="rounded-full" className="mx-auto" />
              <Skeleton height={16} width="80%" className="mx-auto" />
              <Skeleton height={12} width="90%" className="mx-auto" />
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton height={24} width={60} className="mx-auto" />
              <Skeleton height={14} width={80} className="mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Category Grid Skeleton
const CategoryGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <Skeleton height={48} width={48} rounded="rounded-lg" />
            <Skeleton height={20} width={60} rounded="rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton height={20} width="70%" />
            <Skeleton height={16} width="100%" />
            <Skeleton height={16} width="85%" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton height={24} width={60} rounded="rounded-full" />
            <Skeleton height={24} width={50} rounded="rounded-full" />
            <Skeleton height={24} width={55} rounded="rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center space-y-1">
              <Skeleton height={20} width="100%" />
              <Skeleton height={12} width="70%" className="mx-auto" />
            </div>
            <div className="text-center space-y-1">
              <Skeleton height={20} width="100%" />
              <Skeleton height={12} width="70%" className="mx-auto" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Featured Articles Skeleton
const FeaturedArticlesSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-6 border-2 border-blue-200 bg-blue-50 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Skeleton height={20} width={80} rounded="rounded-md" />
              <Skeleton height={20} width={60} rounded="rounded-md" />
            </div>
            <Skeleton height={20} width={60} rounded="rounded-full" />
          </div>
          <Skeleton height={24} width="90%" />
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="80%" />
          <div className="flex flex-wrap gap-2 pt-2">
            <Skeleton height={20} width={50} rounded="rounded-full" />
            <Skeleton height={20} width={60} rounded="rounded-full" />
            <Skeleton height={20} width={55} rounded="rounded-full" />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-blue-200">
            <div className="flex items-center gap-2">
              <Skeleton height={32} width={32} rounded="rounded-full" />
              <div className="space-y-1">
                <Skeleton height={12} width={80} />
                <Skeleton height={10} width={60} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton height={16} width={16} rounded="rounded-sm" />
              <Skeleton height={16} width={16} rounded="rounded-sm" />
              <Skeleton height={16} width={16} rounded="rounded-sm" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Popular Articles Skeleton
const PopularArticlesSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Skeleton height={32} width={32} rounded="rounded-lg" />
              <Skeleton height={18} width={80} rounded="rounded-md" />
            </div>
            <Skeleton height={18} width={50} rounded="rounded-md" />
          </div>
          <Skeleton height={20} width="85%" />
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="90%" />
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-3 text-xs">
              <Skeleton height={12} width={60} />
              <Skeleton height={12} width={50} />
              <Skeleton height={12} width={40} />
            </div>
            <Skeleton height={16} width={16} rounded="rounded-sm" />
          </div>
        </Card>
      ))}
    </div>
  );
};

// Search Results Skeleton
const SearchResultsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton height={48} width="100%" rounded="rounded-lg" className="flex-1" />
        <Skeleton height={48} width={120} rounded="rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton height={20} width={20} rounded="rounded-sm" />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <Skeleton height={18} width="70%" />
                  <div className="flex items-center gap-1">
                    <Skeleton height={16} width={16} rounded="rounded-sm" />
                    <Skeleton height={12} width={30} />
                  </div>
                </div>
                <Skeleton height={14} width="100%" />
                <Skeleton height={14} width="95%" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton height={16} width={60} rounded="rounded-md" />
                    <Skeleton height={12} width={80} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton height={12} width={40} />
                    <Skeleton height={12} width={40} />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Measurement Tips Skeleton
const MeasurementTipsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton height={180} width="100%" rounded="rounded-none" />
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton height={20} width={60} rounded="rounded-md" />
              <Skeleton height={20} width={50} rounded="rounded-md" />
            </div>
            <Skeleton height={20} width="90%" />
            <Skeleton height={16} width="100%" />
            <Skeleton height={16} width="85%" />
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <Skeleton height={32} width={100} rounded="rounded-md" />
              <Skeleton height={16} width={16} rounded="rounded-sm" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Size Guide Preview Skeleton
const SizeGuidePreviewSkeleton: React.FC = () => {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton height={24} width={200} />
          <Skeleton height={16} width={300} />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton height={40} width={40} rounded="rounded-md" />
          <Skeleton height={40} width={40} rounded="rounded-md" />
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1 p-3">
                <Skeleton height={16} width="80%" />
              </div>
            ))}
          </div>
        </div>
        <div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex border-b border-gray-200">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex-1 p-3">
                  <Skeleton height={16} width="70%" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Contact Support CTA Skeleton
const ContactCTASkeleton: React.FC = () => {
  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 md:p-12">
      <div className="text-center space-y-4">
        <Skeleton height={32} width="60%" className="mx-auto bg-white/20" />
        <Skeleton height={18} width="80%" className="mx-auto bg-white/20" />
        <Skeleton height={18} width="70%" className="mx-auto bg-white/20" />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
          <Skeleton height={48} width={160} rounded="rounded-lg" className="bg-white/20" />
          <Skeleton height={48} width={140} rounded="rounded-lg" className="bg-white/20" />
        </div>
      </div>
    </Card>
  );
};

// Newsletter Skeleton
const NewsletterSkeleton: React.FC = () => {
  return (
    <Card className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <Skeleton height={28} width="70%" className="mx-auto" />
        <Skeleton height={16} width="90%" className="mx-auto" />
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Skeleton height={48} width="100%" rounded="rounded-lg" className="flex-1" />
          <Skeleton height={48} width={120} rounded="rounded-lg" />
        </div>
        <Skeleton height={14} width="80%" className="mx-auto" />
      </div>
    </Card>
  );
};

// Trust Indicators Skeleton
const TrustIndicatorsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="text-center space-y-3">
          <Skeleton height={48} width={48} rounded="rounded-full" className="mx-auto" />
          <Skeleton height={16} width="80%" className="mx-auto" />
          <Skeleton height={14} width="90%" className="mx-auto" />
        </div>
      ))}
    </div>
  );
};

// Main Loading Component
export default function HelpCenterLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Hero Banner Skeleton */}
      <section className="container mx-auto px-4 py-8">
        <BannerSkeleton />
      </section>

      {/* Category Grid Skeleton */}
      <section className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton height={28} width={200} />
              <Skeleton height={16} width={300} />
            </div>
            <Skeleton height={40} width={100} rounded="rounded-md" />
          </div>
          <CategoryGridSkeleton />
        </div>
      </section>

      {/* Featured Articles Skeleton */}
      <section className="container mx-auto px-4 py-8 bg-white">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Skeleton height={28} width={250} className="mx-auto" />
            <Skeleton height={16} width={400} className="mx-auto" />
          </div>
          <FeaturedArticlesSkeleton />
        </div>
      </section>

      {/* Popular Articles Skeleton */}
      <section className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton height={28} width={220} />
            <Skeleton height={16} width={380} />
          </div>
          <PopularArticlesSkeleton />
        </div>
      </section>

      {/* Search & Browse Skeleton */}
      <section className="container mx-auto px-4 py-8 bg-white">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Skeleton height={28} width={280} className="mx-auto" />
            <Skeleton height={16} width={420} className="mx-auto" />
          </div>
          <SearchResultsSkeleton />
        </div>
      </section>

      {/* Measurement Tips Skeleton */}
      <section className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton height={28} width={260} />
            <Skeleton height={16} width={360} />
          </div>
          <MeasurementTipsSkeleton />
        </div>
      </section>

      {/* Size Guide Preview Skeleton */}
      <section className="container mx-auto px-4 py-8 bg-white">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Skeleton height={28} width={240} className="mx-auto" />
            <Skeleton height={16} width={400} className="mx-auto" />
          </div>
          <SizeGuidePreviewSkeleton />
        </div>
      </section>

      {/* Contact Support CTA Skeleton */}
      <section className="container mx-auto px-4 py-8">
        <ContactCTASkeleton />
      </section>

      {/* Newsletter Skeleton */}
      <section className="container mx-auto px-4 py-8 bg-white">
        <NewsletterSkeleton />
      </section>

      {/* Trust Indicators Skeleton */}
      <section className="container mx-auto px-4 py-8">
        <TrustIndicatorsSkeleton />
      </section>
    </motion.div>
  );
}
