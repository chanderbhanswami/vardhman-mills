'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SaleProductCard from './SaleProductCard';
import { cn } from '@/lib/utils';
import type { Sale, SaleProduct } from '@/types/sale.types';

/**
 * SaleGrid Component Props
 */
interface SaleGridProps {
  /**
   * Parent sale information
   */
  sale: Sale;

  /**
   * Array of sale products
   */
  products: SaleProduct[];

  /**
   * Grid columns configuration
   * - 2: 2 columns on desktop
   * - 3: 3 columns on desktop
   * - 4: 4 columns on desktop
   * - 5: 5 columns on desktop
   * - auto: Responsive auto-fit columns
   */
  columns?: 2 | 3 | 4 | 5 | 'auto';

  /**
   * Gap between grid items
   */
  gap?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Product card variant
   */
  cardVariant?: 'default' | 'compact' | 'featured' | 'minimal';

  /**
   * Enable masonry layout (different heights)
   */
  masonry?: boolean;

  /**
   * Product action callbacks
   */
  onAddToCart?: (saleProduct: SaleProduct, quantity: number) => void;
  onQuickView?: (saleProduct: SaleProduct) => void;
  onProductClick?: (saleProduct: SaleProduct) => void;
  onToggleWishlist?: (productId: string) => void;

  /**
   * Wishlist product IDs
   */
  wishlistProductIds?: string[];

  /**
   * Show/hide card features
   */
  showWishlist?: boolean;
  showQuickView?: boolean;
  showAddToCart?: boolean;
  showDiscount?: boolean;
  showCountdown?: boolean;
  showBadges?: boolean;
  showStock?: boolean;

  /**
   * Enable animations
   */
  animated?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SaleGrid Component
 * 
 * Responsive grid layout component for displaying sale products.
 * Features:
 * - Configurable columns (2, 3, 4, 5, or auto)
 * - Responsive breakpoints
 * - Adjustable gap sizes
 * - Masonry layout option
 * - Animated entrance
 * - Product card integration
 * - Flexible card variants
 * 
 * @example
 * ```tsx
 * <SaleGrid
 *   sale={sale}
 *   products={saleProducts}
 *   columns={4}
 *   gap="md"
 *   cardVariant="default"
 *   onAddToCart={(product, qty) => handleAddToCart(product, qty)}
 * />
 * ```
 */
const SaleGrid: React.FC<SaleGridProps> = ({
  sale,
  products,
  columns = 4,
  gap = 'md',
  cardVariant = 'default',
  masonry = false,
  onAddToCart,
  onQuickView,
  onProductClick,
  onToggleWishlist,
  wishlistProductIds = [],
  showWishlist = true,
  showQuickView = true,
  showAddToCart = true,
  showDiscount = true,
  showCountdown = true,
  showBadges = true,
  showStock = true,
  animated = true,
  className,
}) => {
  // Grid column classes based on columns prop
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    auto: 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
  };

  // Gap classes
  const gapClasses = {
    sm: 'gap-2 md:gap-3',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8',
    xl: 'gap-8 md:gap-10',
  };

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' as const },
    },
  };

  // Empty state
  if (!products || products.length === 0) {
    return null;
  }

  // Masonry layout (CSS columns)
  if (masonry) {
    const masonryColumnClasses = {
      2: 'columns-1 sm:columns-2',
      3: 'columns-1 sm:columns-2 lg:columns-3',
      4: 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4',
      5: 'columns-2 sm:columns-3 md:columns-4 lg:columns-5',
      auto: 'columns-1 sm:columns-2 md:columns-3 lg:columns-4',
    };

    return (
      <div
        className={cn(
          masonryColumnClasses[columns],
          gapClasses[gap],
          className
        )}
      >
        {products.map((saleProduct) => (
          <div key={saleProduct.productId} className="mb-4 break-inside-avoid">
            <SaleProductCard
              saleProduct={saleProduct}
              sale={sale}
              variant={cardVariant}
              showWishlist={showWishlist}
              showQuickView={showQuickView}
              showAddToCart={showAddToCart}
              showDiscount={showDiscount}
              showCountdown={showCountdown}
              showBadges={showBadges}
              showStock={showStock}
              onAddToCart={onAddToCart}
              onQuickView={onQuickView}
              onClick={onProductClick}
              isInWishlist={wishlistProductIds.includes(saleProduct.productId)}
              onToggleWishlist={onToggleWishlist}
              animated={animated}
            />
          </div>
        ))}
      </div>
    );
  }

  // Standard grid layout with animation
  if (animated) {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className={cn(
          'grid',
          columnClasses[columns],
          gapClasses[gap],
          className
        )}
      >
        {products.map((saleProduct) => (
          <motion.div key={saleProduct.productId} variants={itemVariants}>
            <SaleProductCard
              saleProduct={saleProduct}
              sale={sale}
              variant={cardVariant}
              showWishlist={showWishlist}
              showQuickView={showQuickView}
              showAddToCart={showAddToCart}
              showDiscount={showDiscount}
              showCountdown={showCountdown}
              showBadges={showBadges}
              showStock={showStock}
              onAddToCart={onAddToCart}
              onQuickView={onQuickView}
              onClick={onProductClick}
              isInWishlist={wishlistProductIds.includes(saleProduct.productId)}
              onToggleWishlist={onToggleWishlist}
              animated={false} // Disable individual card animation when grid is animated
            />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Standard grid layout without animation
  return (
    <div
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {products.map((saleProduct) => (
        <SaleProductCard
          key={saleProduct.productId}
          saleProduct={saleProduct}
          sale={sale}
          variant={cardVariant}
          showWishlist={showWishlist}
          showQuickView={showQuickView}
          showAddToCart={showAddToCart}
          showDiscount={showDiscount}
          showCountdown={showCountdown}
          showBadges={showBadges}
          showStock={showStock}
          onAddToCart={onAddToCart}
          onQuickView={onQuickView}
          onClick={onProductClick}
          isInWishlist={wishlistProductIds.includes(saleProduct.productId)}
          onToggleWishlist={onToggleWishlist}
          animated={animated}
        />
      ))}
    </div>
  );
};

export default SaleGrid;
