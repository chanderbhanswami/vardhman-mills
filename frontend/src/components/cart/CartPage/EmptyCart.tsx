'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon,
  ArrowRightIcon,
  HeartIcon,
  SparklesIcon,
  TagIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EmptyCartProps {
  /**
   * Show wishlist count
   */
  wishlistCount?: number;

  /**
   * Show recommended products
   */
  showRecommendations?: boolean;

  /**
   * Callback when continue shopping is clicked
   */
  onContinueShopping?: () => void;

  /**
   * Callback when view wishlist is clicked
   */
  onViewWishlist?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
}

interface PromoBanner {
  title: string;
  description: string;
  badge?: string;
  icon: React.ElementType;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const QUICK_LINKS: QuickLink[] = [
  {
    title: 'New Arrivals',
    description: 'Check out our latest collections',
    href: '/products?filter=new',
    icon: SparklesIcon,
    color: 'text-purple-600',
  },
  {
    title: 'Best Sellers',
    description: 'Shop our most popular items',
    href: '/products?filter=bestsellers',
    icon: TagIcon,
    color: 'text-blue-600',
  },
  {
    title: 'Sale Items',
    description: 'Save big on discounted products',
    href: '/products?filter=sale',
    icon: TagIcon,
    color: 'text-red-600',
  },
  {
    title: 'Free Shipping',
    description: 'Orders above ₹500',
    href: '/products',
    icon: TruckIcon,
    color: 'text-green-600',
  },
];

const PROMO_BANNERS: PromoBanner[] = [
  {
    title: 'First Order Discount',
    description: 'Get 10% off on your first purchase',
    badge: 'WELCOME10',
    icon: SparklesIcon,
  },
  {
    title: 'Free Shipping',
    description: 'On orders above ₹500',
    icon: TruckIcon,
  },
  {
    title: 'Easy Returns',
    description: '30-day hassle-free returns',
    icon: HeartIcon,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EmptyCart: React.FC<EmptyCartProps> = ({
  wishlistCount = 0,
  showRecommendations = true,
  onContinueShopping,
  onViewWishlist,
  className,
}) => {
  const handleContinueShopping = () => {
    if (onContinueShopping) {
      onContinueShopping();
    } else {
      window.location.href = '/products';
    }
  };

  const handleViewWishlist = () => {
    if (onViewWishlist) {
      onViewWishlist();
    } else {
      window.location.href = '/wishlist';
    }
  };

  return (
    <div className={cn('max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8', className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8"
      >
        {/* Empty Cart Illustration */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative"
          >
            <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <ShoppingCartIcon className="h-24 w-24 text-gray-400" />
            </div>
            {/* Floating particles */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -top-4 -right-4 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"
            >
              <SparklesIcon className="h-6 w-6 text-purple-600" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, 10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              className="absolute -bottom-4 -left-4 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <TagIcon className="h-5 w-5 text-blue-600" />
            </motion.div>
          </motion.div>
        </div>

        {/* Heading and Description */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Your cart is empty
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Looks like you haven&apos;t added anything to your cart yet. Start shopping to fill it up!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="gradient"
            size="lg"
            onClick={handleContinueShopping}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ArrowRightIcon className="h-5 w-5" />
          </Button>

          {wishlistCount > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleViewWishlist}
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <HeartIcon className="h-5 w-5" />
              View Wishlist
              <Badge variant="secondary" size="sm">
                {wishlistCount}
              </Badge>
            </Button>
          )}
        </div>

        {/* Promo Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          {PROMO_BANNERS.map((banner, index) => {
            const Icon = banner.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                      <Icon className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {banner.description}
                  </p>
                  {banner.badge && (
                    <Badge variant="gradient" size="sm" className="mt-2">
                      {banner.badge}
                    </Badge>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Explore Our Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_LINKS.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link href={link.href}>
                    <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                          'bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-purple-100 group-hover:to-blue-100'
                        )}>
                          <Icon className={cn('h-6 w-6', link.color)} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">
                            {link.title}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {link.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Popular Products (if enabled) */}
        {showRecommendations && (
          <div className="pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              You Might Like
            </h2>
            <p className="text-gray-600 mb-6">
              Popular products from our collection
            </p>
            <Link href="/products">
              <Button variant="outline" size="lg">
                View All Products
              </Button>
            </Link>
          </div>
        )}

        {/* Help Text */}
        <div className="pt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our{' '}
            <Link href="/support" className="text-purple-600 hover:text-purple-700 font-medium">
              customer support
            </Link>
            {' '}team
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default EmptyCart;
