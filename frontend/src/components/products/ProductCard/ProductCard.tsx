'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ProductVariant } from '@/types/product.types';
import { cn } from '@/lib/utils';
import ProductImages from './ProductImages';
import ProductInfo from './ProductInfo';
import ProductPrice from './ProductPrice';
import ProductRating from './ProductRating';
import ProductBadges from './ProductBadges';
import ProductActions from './ProductActions';
import { Eye } from 'lucide-react';

export interface ProductCardProps {
  product: Product;
  className?: string;
  variant?: 'grid' | 'list' | 'compact' | 'featured';
  showQuickView?: boolean;
  showBadges?: boolean;
  showActions?: boolean;
  showRating?: boolean;
  showPrice?: boolean;
  showInfo?: boolean;
  priority?: boolean;
  onClick?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  selectedVariant?: ProductVariant;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className,
  variant = 'grid',
  showQuickView = true,
  showBadges = true,
  showActions = true,
  showRating = true,
  showPrice = true,
  showInfo = true,
  priority = false,
  onQuickView,
  selectedVariant,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  // Variant-specific layout classes
  const variantClasses = {
    grid: 'flex flex-col',
    list: 'flex flex-row gap-4',
    compact: 'flex flex-col',
    featured: 'flex flex-col lg:flex-row gap-6',
  };

  // Variant-specific image container classes
  const imageContainerClasses = {
    grid: 'aspect-square',
    list: 'w-48 h-48 flex-shrink-0',
    compact: 'aspect-[4/3]',
    featured: 'lg:w-1/2 aspect-square',
  };

  // Variant-specific content classes
  const contentClasses = {
    grid: 'flex flex-col gap-2 p-4',
    list: 'flex flex-col justify-between flex-1 py-2',
    compact: 'flex flex-col gap-1 p-3',
    featured: 'lg:w-1/2 flex flex-col gap-4 p-6',
  };

  return (
    <motion.div
      className={cn(
        'group relative bg-white rounded-lg border border-gray-200 overflow-hidden',
        'hover:shadow-xl transition-all duration-300',
        variantClasses[variant],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Product Link Wrapper */}
      <Link 
        href={`/products/${product.slug}`}
        className="block"
        aria-label={`View ${product.name}`}
      >
        {/* Image Container */}
        <div className={cn('relative overflow-hidden bg-gray-50', imageContainerClasses[variant])}>
          {/* Badges */}
          {showBadges && (
            <div className="absolute top-3 left-3 z-10">
              <ProductBadges 
                product={product} 
                variant="stacked"
              />
            </div>
          )}

          {/* Product Images */}
          <ProductImages
            product={product}
            priority={priority}
            showThumbnails={variant === 'featured'}
            showZoom={variant !== 'compact'}
            className="h-full"
          />

          {/* Quick View Button */}
          <AnimatePresence>
            {isHovered && showQuickView && onQuickView && (
              <motion.button
                className={cn(
                  'absolute inset-x-0 bottom-0 bg-black/80 text-white py-3',
                  'flex items-center justify-center gap-2',
                  'hover:bg-black transition-colors'
                )}
                onClick={handleQuickView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">Quick View</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Out of Stock Overlay */}
          {(product.inventory?.quantity ?? 0) <= 0 && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
              <span className="text-lg font-semibold text-gray-800 bg-white px-6 py-3 rounded-full shadow-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content Container */}
      <div className={cn(contentClasses[variant])}>
        {/* Rating */}
        {showRating && variant !== 'compact' && (
          <ProductRating
            product={product}
            size={variant === 'list' ? 'sm' : 'md'}
            showCount
            showText={variant === 'featured'}
            showVerified={variant === 'featured'}
            interactive
          />
        )}

        {/* Product Info */}
        {showInfo && (
          <ProductInfo
            product={product}
            variant={selectedVariant}
            showCategory={variant !== 'compact'}
            showBrand={variant === 'list' || variant === 'featured'}
            showSKU={variant === 'featured'}
            showDescription={variant === 'list' || variant === 'featured'}
            showFeatures={variant === 'featured'}
            showShipping={variant === 'featured'}
            descriptionLines={variant === 'list' ? 2 : 3}
            linkToProduct={false}
          />
        )}

        {/* Price */}
        {showPrice && (
          <ProductPrice
            product={product}
            variant={selectedVariant}
            size={variant === 'compact' ? 'sm' : variant === 'featured' ? 'lg' : 'md'}
            showOriginalPrice
            showSavings={variant !== 'compact'}
            showPercentage
            layout={variant === 'list' ? 'horizontal' : 'vertical'}
          />
        )}

        {/* Compact Rating */}
        {showRating && variant === 'compact' && (
          <ProductRating
            product={product}
            size="sm"
            showCount={false}
            showStars
          />
        )}

        {/* Actions */}
        {showActions && (
          <ProductActions
            product={product}
            variant={selectedVariant}
            layout={variant === 'list' || variant === 'featured' ? 'horizontal' : 'vertical'}
            size={variant === 'compact' ? 'sm' : 'md'}
            showQuantity={variant === 'list' || variant === 'featured'}
            showCompare={variant !== 'compact'}
            showShare={variant === 'featured'}
            className="mt-auto"
          />
        )}
      </div>

      {/* Hover Border Effect */}
      <motion.div
        className="absolute inset-0 border-2 border-primary-500 rounded-lg pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};

export default ProductCard;
