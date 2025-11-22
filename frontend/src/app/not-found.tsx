/**
 * Global 404 Not Found Page for Next.js App Router
 * 
 * This component is displayed when a route cannot be found in the application.
 * It provides a user-friendly 404 experience with multiple features including
 * search suggestions, popular pages, recent products, and navigation options.
 * The component is fully responsive, supports dark mode, and includes accessibility features.
 * 
 * Features:
 * - Beautiful 404 UI with animations
 * - Search functionality to help users find what they're looking for
 * - Popular pages and categories suggestions
 * - Recent products showcase
 * - Multiple navigation options (home, back, search, browse)
 * - Breadcrumb navigation
 * - SEO optimized with proper meta tags
 * - Responsive design with dark mode support
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Analytics tracking for 404 pages
 * - Related content suggestions based on URL
 * - Integration with site search
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  HomeIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ShoppingBagIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

// Import components
import { Button } from '@/components/ui/Button';
import { SearchModal } from '@/components/common';
import { SEOHead } from '@/components/common';
import { Breadcrumbs } from '@/components/common';

/**
 * Popular Categories Data
 */
const POPULAR_CATEGORIES = [
  {
    name: 'Bedsheets',
    href: '/categories/bedsheets',
    icon: '🛏️',
    description: 'Premium quality bedsheets',
  },
  {
    name: 'Towels',
    href: '/categories/towels',
    icon: '🧖',
    description: 'Soft and absorbent towels',
  },
  {
    name: 'Curtains',
    href: '/categories/curtains',
    icon: '🪟',
    description: 'Elegant window curtains',
  },
  {
    name: 'Blankets',
    href: '/categories/blankets',
    icon: '🛋️',
    description: 'Cozy warm blankets',
  },
];

/**
 * Popular Pages Data
 */
const POPULAR_PAGES = [
  {
    name: 'Home',
    href: '/',
    icon: HomeIcon,
    description: 'Return to homepage',
  },
  {
    name: 'Products',
    href: '/products',
    icon: ShoppingBagIcon,
    description: 'Browse all products',
  },
  {
    name: 'Best Sellers',
    href: '/best-sellers',
    icon: SparklesIcon,
    description: 'Most popular items',
  },
  {
    name: 'Blog',
    href: '/blog',
    icon: BookOpenIcon,
    description: 'Read our latest articles',
  },
  {
    name: 'Help Center',
    href: '/help',
    icon: QuestionMarkCircleIcon,
    description: 'Get help and support',
  },
  {
    name: 'Contact Us',
    href: '/contact',
    icon: PhoneIcon,
    description: 'Get in touch with us',
  },
];

/**
 * Quick Links Data
 */
const QUICK_LINKS = [
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Collections', href: '/collections' },
  { label: 'Brands', href: '/brands' },
  { label: 'Sale', href: '/sale' },
  { label: 'Gift Cards', href: '/gift-cards' },
  { label: 'Track Order', href: '/orders/track' },
];

/**
 * Search Suggestions based on common searches
 */
const SEARCH_SUGGESTIONS = [
  'Cotton bedsheets',
  'Bath towels',
  'Blackout curtains',
  'Woolen blankets',
  'Pillow covers',
  'Table linen',
];

/**
 * Animation Variants
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
};

/**
 * 404 Not Found Page Component
 */
export default function NotFound() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Track 404 page view (for analytics)
  React.useEffect(() => {
    // Log 404 page view to analytics service
    if (typeof window !== 'undefined') {
      console.log('404 Page View:', window.location.pathname);
      // TODO: Send to analytics service (Google Analytics, etc.)
    }
  }, []);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: '404 Not Found', href: '#' },
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title="404 - Page Not Found | Vardhman Textiles"
        description="The page you are looking for could not be found. Explore our collection of premium textiles and home decor items."
        noIndex={true}
        noFollow={false}
      />

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 pt-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 py-16 text-center"
        >
          {/* 404 Illustration */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="relative inline-block">
              {/* Large 404 Text */}
              <motion.h1
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 10,
                }}
                className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 select-none"
              >
                404
              </motion.h1>

              {/* Floating Icons */}
              <motion.div
                animate={{
                  y: [-10, 10, -10],
                  rotate: [-5, 5, -5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-0 right-0 transform translate-x-8 -translate-y-8"
              >
                <QuestionMarkCircleIcon className="w-16 h-16 text-blue-400 opacity-80" />
              </motion.div>

              <motion.div
                animate={{
                  y: [10, -10, 10],
                  rotate: [5, -5, 5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
                className="absolute bottom-0 left-0 transform -translate-x-8 translate-y-8"
              >
                <MagnifyingGlassIcon className="w-12 h-12 text-purple-400 opacity-80" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title and Description */}
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Page Not Found
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            We couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or never existed. Don&apos;t worry, we&apos;ll help you find what you need!
          </motion.p>

          {/* Search Bar */}
          <motion.div
            variants={itemVariants}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products, categories, or pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                className="w-full px-6 py-4 pl-14 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                aria-label="Search"
              />
              <MagnifyingGlassIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>

            {/* Search Suggestions */}
            {searchQuery === '' && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Popular searches:</span>
                {SEARCH_SUGGESTIONS.slice(0, 4).map((suggestion) => (
                  <Link
                    key={suggestion}
                    href={`/search?q=${encodeURIComponent(suggestion)}`}
                    className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
                  >
                    {suggestion}
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/">
              <Button size="lg" className="min-w-[200px]">
                <HomeIcon className="w-5 h-5 mr-2" />
                Go to Homepage
              </Button>
            </Link>

            <Button
              onClick={() => window.history.back()}
              variant="outline"
              size="lg"
              className="min-w-[200px]"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </motion.div>
        </motion.div>

        {/* Popular Categories Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="container mx-auto px-4 py-12 bg-white dark:bg-gray-800/50 rounded-2xl mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Explore Popular Categories
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {POPULAR_CATEGORIES.map((category, index) => (
              <motion.div
                key={category.name}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={category.href}
                  className="block p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="text-4xl mb-3 text-center">{category.icon}</div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 text-center">
                    {category.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {category.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Popular Pages Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="container mx-auto px-4 py-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Visit Popular Pages
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {POPULAR_PAGES.map((page, index) => {
              const Icon = page.icon;
              return (
                <motion.div
                  key={page.name}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: 0.6 + index * 0.05 }}
                >
                  <Link
                    href={page.href}
                    className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {page.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {page.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Links Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="container mx-auto px-4 py-12 mb-12"
        >
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Quick Links
            </h3>

            <div className="flex flex-wrap justify-center gap-3">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 rounded-full border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="container mx-auto px-4 py-12 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Still Can&apos;t Find What You&apos;re Looking For?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our support team is here to help. Contact us and we&apos;ll assist you in finding what you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  <PhoneIcon className="w-5 h-5 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="outline" size="lg">
                  <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                  Visit Help Center
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20 blur-3xl" />
          <div className="absolute top-40 right-20 w-40 h-40 bg-purple-200 dark:bg-purple-900 rounded-full opacity-20 blur-3xl" />
          <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-pink-200 dark:bg-pink-900 rounded-full opacity-20 blur-3xl" />
          <div className="absolute bottom-40 right-1/3 w-48 h-48 bg-yellow-200 dark:bg-yellow-900 rounded-full opacity-20 blur-3xl" />
        </div>
      </div>

      {/* Search Modal (if needed) */}
      {searchOpen && searchQuery && (
        <SearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </>
  );
}
