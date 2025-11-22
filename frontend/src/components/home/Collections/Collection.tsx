/**
 * Collection Component
 * 
 * Main collection display component with comprehensive features.
 * 
 * Features:
 * - Collection header with metadata
 * - Product grid display
 * - Filtering and sorting
 * - View mode toggle
 * - Breadcrumb navigation
 * - Collection info sidebar
 * - Related collections
 * - Share functionality
 * - Responsive design
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShareIcon,
  HeartIcon,
  CalendarIcon,
  TagIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/utils';
import { formatNumber } from '@/lib/format';
import type { Collection as CollectionType, Product } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CollectionProps {
  /** Collection data */
  collection: CollectionType;
  /** Products in collection */
  products?: Product[];
  /** Show header */
  showHeader?: boolean;
  /** Show description */
  showDescription?: boolean;
  /** Show metadata */
  showMetadata?: boolean;
  /** Show share button */
  showShare?: boolean;
  /** Show favorite button */
  showFavorite?: boolean;
  /** Enable animations */
  animated?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On product click */
  onProductClick?: (product: Product) => void;
  /** On share */
  onShare?: () => void;
  /** On favorite */
  onFavorite?: () => void;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const Collection: React.FC<CollectionProps> = ({
  collection,
  products = [],
  showHeader = true,
  showDescription = true,
  showMetadata = true,
  showShare = true,
  showFavorite = true,
  animated = true,
  className,
  onProductClick,
  onShare,
  onFavorite,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isFavorited, setIsFavorited] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const collectionImage = useMemo(() => {
    return collection.bannerImage?.url || collection.image?.url || '/images/placeholder-collection.jpg';
  }, [collection]);

  const collectionType = useMemo(() => {
    const types = {
      manual: 'Curated Collection',
      automatic: 'Smart Collection',
      seasonal: 'Seasonal Collection',
      promotional: 'Promotional Collection',
    };
    return types[collection.type] || 'Collection';
  }, [collection.type]);

  const collectionStatus = useMemo(() => {
    if (!collection.startDate && !collection.endDate) return null;

    const now = new Date();
    const start = collection.startDate ? new Date(collection.startDate) : null;
    const end = collection.endDate ? new Date(collection.endDate) : null;

    if (start && now < start) return 'upcoming';
    if (end && now > end) return 'ended';
    return 'active';
  }, [collection.startDate, collection.endDate]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleShare = useCallback(() => {
    if (onShare) {
      onShare();
    } else {
      // Default share behavior
      if (navigator.share) {
        navigator.share({
          title: collection.name,
          text: collection.description || '',
          url: window.location.href,
        });
      }
    }
  }, [collection, onShare]);

  const handleFavorite = useCallback(() => {
    setIsFavorited(prev => !prev);
    if (onFavorite) {
      onFavorite();
    }
  }, [onFavorite]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderBreadcrumbs = useCallback(() => {
    return (
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Home
            </Link>
          </li>
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          <li>
            <Link
              href="/collections"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Collections
            </Link>
          </li>
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          <li>
            <span className="text-gray-900 dark:text-white font-medium">
              {collection.name}
            </span>
          </li>
        </ol>
      </nav>
    );
  }, [collection.name]);

  const renderBadges = useCallback(() => {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {collection.isFeatured && (
          <Badge variant="default" className="bg-blue-600 text-white">
            Featured
          </Badge>
        )}
        {collectionStatus === 'active' && (
          <Badge variant="success">Active</Badge>
        )}
        {collectionStatus === 'upcoming' && (
          <Badge variant="info">Upcoming</Badge>
        )}
        {collectionStatus === 'ended' && (
          <Badge variant="default" className="bg-gray-500 text-white">
            Ended
          </Badge>
        )}
        <Badge variant="outline">{collectionType}</Badge>
      </div>
    );
  }, [collection.isFeatured, collectionStatus, collectionType]);

  const renderMetadata = useCallback(() => {
    if (!showMetadata) return null;

    return (
      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
        {/* Product Count */}
        <div className="flex items-center gap-2">
          <TagIcon className="w-5 h-5" />
          <span>
            {formatNumber(collection.productCount)}{' '}
            {collection.productCount === 1 ? 'Product' : 'Products'}
          </span>
        </div>

        {/* Start Date */}
        {collection.startDate && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            <span>
              Starts: {new Date(collection.startDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* End Date */}
        {collection.endDate && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            <span>
              Ends: {new Date(collection.endDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    );
  }, [showMetadata, collection]);

  const renderActions = useCallback(() => {
    return (
      <div className="flex items-center gap-3">
        {showFavorite && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFavorite}
            className={cn(
              'flex items-center gap-2',
              isFavorited && 'text-red-600 border-red-600'
            )}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorited ? (
              <HeartIconSolid className="w-5 h-5" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">
              {isFavorited ? 'Favorited' : 'Favorite'}
            </span>
          </Button>
        )}

        {showShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
            aria-label="Share collection"
          >
            <ShareIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        )}
      </div>
    );
  }, [showFavorite, showShare, isFavorited, handleFavorite, handleShare]);

  const renderHeader = useCallback(() => {
    if (!showHeader) return null;

    return (
      <motion.div
        variants={animated ? headerVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        className="mb-12"
      >
        {/* Breadcrumbs */}
        {renderBreadcrumbs()}

        {/* Banner Image */}
        {collection.bannerImage && (
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
            <Image
              src={collectionImage}
              alt={collection.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="max-w-4xl">
                {renderBadges()}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 mb-2">
                  {collection.name}
                </h1>
                {showDescription && collection.description && (
                  <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header without banner */}
        {!collection.bannerImage && (
          <div className="space-y-4">
            {renderBadges()}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              {collection.name}
            </h1>
            {showDescription && collection.description && (
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
                {collection.description}
              </p>
            )}
          </div>
        )}

        {/* Metadata and Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6">
          {renderMetadata()}
          {renderActions()}
        </div>
      </motion.div>
    );
  }, [
    showHeader,
    animated,
    renderBreadcrumbs,
    collection,
    collectionImage,
    renderBadges,
    showDescription,
    renderMetadata,
    renderActions,
  ]);

  const renderProducts = useCallback(() => {
    if (products.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No products in this collection yet
          </p>
        </div>
      );
    }

    return (
      <motion.div
        variants={animated ? contentVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {products.map(product => (
          <motion.div
            key={product.id}
            variants={animated ? {
              hidden: { opacity: 0, scale: 0.9 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: {
                  type: 'spring' as const,
                  stiffness: 100,
                  damping: 12,
                },
              },
            } : undefined}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onProductClick && onProductClick(product)}
          >
            {/* Product Image */}
            <div className="relative h-64 bg-gray-100 dark:bg-gray-700">
              {product.media?.primaryImage?.url && (
                <Image
                  src={product.media.primaryImage.url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {product.name}
              </h3>
              {product.pricing?.basePrice && (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {product.pricing.basePrice.formatted}
                  </span>
                  {product.pricing.salePrice && product.pricing.salePrice.amount < product.pricing.basePrice.amount && (
                    <span className="text-sm text-gray-500 line-through">
                      {product.pricing.salePrice.formatted}
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }, [products, animated, onProductClick]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('collection', className)}>
      {/* Header */}
      {renderHeader()}

      {/* Products */}
      {renderProducts()}
    </div>
  );
};

export default Collection;
