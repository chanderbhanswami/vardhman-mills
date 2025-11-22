/**
 * CategoryBanner Component
 * 
 * Hero banner for categories section with featured categories,
 * statistics, and call-to-action elements.
 * 
 * Features:
 * - Hero background with gradient overlay
 * - Featured category highlight
 * - Statistics display
 * - Multiple CTA buttons
 * - Animated content
 * - Responsive design
 * - Image optimization
 * - Loading states
 * - Search integration
 * - Quick category links
 * 
 * @component
 */

'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  TagIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  TruckIcon,
  CheckBadgeIcon,
  StarIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CategoryStat {
  id: string;
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}

export interface FeaturedCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface CategoryBannerProps {
  /** Banner title */
  title?: string;
  /** Banner subtitle */
  subtitle?: string;
  /** Background image */
  backgroundImage?: string;
  /** Featured category */
  featuredCategory?: FeaturedCategory;
  /** Statistics */
  stats?: CategoryStat[];
  /** Quick category links */
  quickLinks?: { name: string; slug: string }[];
  /** Show search */
  showSearch?: boolean;
  /** Custom theme */
  theme?: 'light' | 'dark' | 'gradient';
  /** Additional CSS classes */
  className?: string;
  /** On search */
  onSearch?: (query: string) => void;
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const DEFAULT_STATS: CategoryStat[] = [
  {
    id: '1',
    label: 'Product Categories',
    value: '50+',
    icon: TagIcon,
    color: '#3b82f6',
  },
  {
    id: '2',
    label: 'Total Products',
    value: '10,000+',
    icon: ShoppingBagIcon,
    color: '#10b981',
  },
  {
    id: '3',
    label: 'Fast Delivery',
    value: '24-48h',
    icon: TruckIcon,
    color: '#f59e0b',
  },
  {
    id: '4',
    label: 'Quality Verified',
    value: '100%',
    icon: CheckBadgeIcon,
    color: '#8b5cf6',
  },
];

const DEFAULT_QUICK_LINKS = [
  { name: 'Cotton Fabrics', slug: 'cotton-fabrics' },
  { name: 'Polyester Blends', slug: 'polyester-blends' },
  { name: 'Denim', slug: 'denim' },
  { name: 'Linen', slug: 'linen' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const CategoryBanner: React.FC<CategoryBannerProps> = ({
  title = 'Explore Our Categories',
  subtitle = 'Discover premium quality fabrics and textiles for every need',
  backgroundImage = '/images/categories-banner.jpg',
  featuredCategory,
  stats = DEFAULT_STATS,
  quickLinks = DEFAULT_QUICK_LINKS,
  showSearch = true,
  theme = 'gradient',
  className,
  onSearch,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    console.log('Search query:', e.target.value, FireIcon, StarIcon);
  }, []);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        onSearch?.(searchQuery);
        console.log('Search submitted:', searchQuery);
      }
    },
    [searchQuery, onSearch]
  );

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  // ============================================================================
  // THEME CLASSES
  // ============================================================================

  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-white',
    gradient: 'bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white',
  };

  const overlayClasses = {
    light: 'bg-white/80',
    dark: 'bg-gray-900/80',
    gradient: 'bg-gradient-to-br from-primary-600/90 via-purple-600/90 to-pink-600/90',
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt="Category Banner Background"
            fill
            className={cn(
              'object-cover transition-opacity duration-700',
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleImageLoad}
            priority
          />
          <div className={cn('absolute inset-0', overlayClasses[theme])} />
        </div>
      )}

      {/* Content Container */}
      <div className={cn('relative z-10', themeClasses[theme])}>
        <div className="container mx-auto px-4 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Main Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge
                  className={cn(
                    'text-sm px-4 py-2',
                    theme === 'light'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-white/20 text-white backdrop-blur-sm'
                  )}
                >
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Premium Quality Products
                </Badge>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                  {title}
                </h1>
                <p
                  className={cn(
                    'text-lg md:text-xl',
                    theme === 'light' ? 'text-gray-600' : 'text-white/90'
                  )}
                >
                  {subtitle}
                </p>
              </motion.div>

              {/* Search Bar */}
              {showSearch && (
                <motion.form
                  onSubmit={handleSearchSubmit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative max-w-xl"
                >
                  <div className="relative flex items-center">
                    <MagnifyingGlassIcon
                      className={cn(
                        'absolute left-4 w-5 h-5',
                        theme === 'light' ? 'text-gray-400' : 'text-white/60'
                      )}
                    />
                    <Input
                      type="text"
                      placeholder="Search categories, products..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className={cn(
                        'pl-12 pr-4 py-6 text-lg rounded-full w-full',
                        theme === 'light'
                          ? 'bg-white border-gray-300'
                          : 'bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm'
                      )}
                    />
                    <Button
                      type="submit"
                      className="absolute right-2 rounded-full px-6"
                      disabled={!searchQuery.trim()}
                    >
                      Search
                    </Button>
                  </div>
                </motion.form>
              )}

              {/* Quick Links */}
              {quickLinks && quickLinks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-3"
                >
                  <span
                    className={cn(
                      'text-sm font-medium',
                      theme === 'light' ? 'text-gray-600' : 'text-white/80'
                    )}
                  >
                    Popular:
                  </span>
                  {quickLinks.map((link, index) => (
                    <Link key={index} href={`/categories/${link.slug}`}>
                      <Badge
                        className={cn(
                          'cursor-pointer transition-all hover:scale-105',
                          theme === 'light'
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                        )}
                      >
                        {link.name}
                      </Badge>
                    </Link>
                  ))}
                </motion.div>
              )}

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Link href="/categories">
                  <Button
                    size="lg"
                    className={cn(
                      'group',
                      theme === 'light'
                        ? 'bg-primary-600 hover:bg-primary-700'
                        : 'bg-white text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    Browse All Categories
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button
                    size="lg"
                    variant="outline"
                    className={cn(
                      theme === 'light'
                        ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'border-white/30 text-white hover:bg-white/10 backdrop-blur-sm'
                    )}
                  >
                    View All Products
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Column - Featured Category / Stats */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Featured Category Card */}
              {featuredCategory && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    'rounded-2xl overflow-hidden shadow-2xl',
                    theme === 'light' ? 'bg-white' : 'bg-white/10 backdrop-blur-md'
                  )}
                >
                  <Link href={`/categories/${featuredCategory.slug}`}>
                    <div className="relative h-64">
                      <Image
                        src={featuredCategory.image}
                        alt={featuredCategory.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <Badge className="bg-yellow-500 text-yellow-900 mb-3">
                          <StarIcon className="w-4 h-4 mr-1" />
                          Featured
                        </Badge>
                        <h3 className="text-2xl font-bold mb-2">
                          {featuredCategory.name}
                        </h3>
                        <p className="text-white/90 mb-3">
                          {featuredCategory.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {featuredCategory.productCount.toLocaleString()} Products
                          </span>
                          <Button
                            size="sm"
                            className="bg-white text-gray-900 hover:bg-gray-100"
                          >
                            Explore
                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => {
                  const StatIcon = stat.icon;
                  return (
                    <motion.div
                      key={stat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={cn(
                        'rounded-xl p-6 text-center',
                        theme === 'light'
                          ? 'bg-white shadow-lg'
                          : 'bg-white/10 backdrop-blur-md'
                      )}
                    >
                      <div
                        className={cn(
                          'inline-flex items-center justify-center w-12 h-12 rounded-full mb-3',
                          !stat.color && 'bg-blue-100'
                        )}
                        {...(stat.color && {
                          style: { backgroundColor: `${stat.color}20` },
                        })}
                      >
                        <StatIcon
                          className="w-6 h-6 text-blue-600"
                          {...(stat.color && {
                            style: { color: stat.color },
                          })}
                        />
                      </div>
                      <div
                        className={cn(
                          'text-3xl font-bold mb-1',
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        )}
                      >
                        {stat.value}
                      </div>
                      <div
                        className={cn(
                          'text-sm',
                          theme === 'light' ? 'text-gray-600' : 'text-white/80'
                        )}
                      >
                        {stat.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
    </div>
  );
};

export default CategoryBanner;
