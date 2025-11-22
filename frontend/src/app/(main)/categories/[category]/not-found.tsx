/**
 * Category Not Found Page
 * 
 * Custom 404 page for invalid category slugs
 * 
 * Features:
 * - Helpful error message
 * - Search suggestions
 * - Popular categories
 * - Navigation options
 * 
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  HomeIcon,
  FolderIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Components
import { Container } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

// Types
import type { Category } from '@/types/product.types';
import { formatNumber } from '@/lib/format';

// ============================================================================
// MOCK DATA
// ============================================================================

const POPULAR_CATEGORIES: Category[] = [];

const SUGGESTED_SEARCHES = [
  'Bed Sheets',
  'Towels',
  'Curtains',
  'Cushion Covers',
  'Table Linen',
  'Bath Mats',
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function CategoryNotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/categories?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, router]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    router.push(`/categories?search=${encodeURIComponent(suggestion)}`);
  }, [router]);

  const handleCategoryClick = useCallback((category: Category) => {
    router.push(`/categories/${category.slug}`);
  }, [router]);

  const handleBackToCategories = useCallback(() => {
    router.push('/categories');
  }, [router]);

  const handleBackHome = useCallback(() => {
    router.push('/');
  }, [router]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12"
    >
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Error Card */}
          <Card className="mb-8">
            <CardContent className="p-12 text-center">
              {/* Error Icon */}
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                <FolderIcon className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>

              {/* Error Message */}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Category Not Found
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                We couldn&apos;t find the category you&apos;re looking for. It may have been moved, renamed, or doesn&apos;t exist.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={handleBackToCategories}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <FolderIcon className="w-5 h-5 mr-2" />
                  Browse All Categories
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleBackHome}
                >
                  <HomeIcon className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Section */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <MagnifyingGlassIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Search for Categories
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try searching for what you need
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="lg">
                    Search
                  </Button>
                </div>
              </form>

              {/* Suggested Searches */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Popular searches:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SEARCHES.map((suggestion) => (
                    <Badge
                      key={suggestion}
                      className="cursor-pointer hover:bg-purple-600 hover:text-white transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Categories */}
          {POPULAR_CATEGORIES.length > 0 && (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <SparklesIcon className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Popular Categories
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {POPULAR_CATEGORIES.map((category) => (
                    <motion.div
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      className="cursor-pointer"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {category.image && (
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={typeof category.image === 'string' ? category.image : category.image.url}
                                  alt={category.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {category.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {formatNumber(category.productCount || 0)} products
                              </p>
                            </div>
                            <ArrowLeftIcon className="w-5 h-5 text-gray-400 transform rotate-180" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Need help? Contact our{' '}
              <a
                href="/contact"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                customer support
              </a>
            </p>
          </div>
        </div>
      </Container>
    </motion.div>
  );
}
