'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ScaleIcon,
  ShareIcon,
  ArrowPathIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { ComparisonProduct } from '@/types/compare.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CompareBarProps {
  /**
   * Products in comparison
   */
  products: ComparisonProduct[];

  /**
   * Maximum number of products allowed
   */
  maxProducts?: number;

  /**
   * Position of the bar
   */
  position?: 'bottom' | 'top';

  /**
   * Bar visibility state
   */
  isVisible?: boolean;

  /**
   * Bar collapsed/expanded state
   */
  isCollapsed?: boolean;

  /**
   * Callback when product is removed
   */
  onRemoveProduct: (productId: string) => void;

  /**
   * Callback when compare is clicked
   */
  onCompare: () => void;

  /**
   * Callback when clear all is clicked
   */
  onClearAll: () => void;

  /**
   * Callback when share is clicked
   */
  onShare?: () => void;

  /**
   * Callback when collapse state changes
   */
  onToggleCollapse?: (collapsed: boolean) => void;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Enable animations
   */
  animated?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format currency
 */
const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Get product image
 */
const getProductImage = (product: ComparisonProduct): string => {
  if (product.product?.media?.primaryImage?.url) {
    return product.product.media.primaryImage.url;
  }
  if (product.product?.media?.images?.[0]?.url) {
    return product.product.media.images[0].url;
  }
  if (product.variant?.media?.primaryImage?.url) {
    return product.variant.media.primaryImage.url;
  }
  if (product.variant?.media?.images?.[0]?.url) {
    return product.variant.media.images[0].url;
  }
  return '/placeholder-product.png';
};

/**
 * Get product name
 */
const getProductName = (product: ComparisonProduct): string => {
  if (product.customLabel) return product.customLabel;
  if (product.variant?.name) return product.variant.name;
  if (product.product?.name) return product.product.name;
  return 'Product';
};

/**
 * Get product price
 */
const getProductPrice = (product: ComparisonProduct): string => {
  const price = product.comparisonContext?.priceAtComparison;
  if (price) {
    return formatCurrency(price.amount, price.currency);
  }
  if (product.product?.pricing?.basePrice) {
    return formatCurrency(
      product.product.pricing.basePrice.amount,
      product.product.pricing.basePrice.currency
    );
  }
  return 'N/A';
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Product thumbnail in compare bar
 */
interface ProductThumbnailProps {
  product: ComparisonProduct;
  onRemove: () => void;
  isLoading?: boolean;
}

const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
  product,
  onRemove,
  isLoading,
}) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative"
    >
      <div className="group relative w-20 h-20 bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative w-full h-full p-1">
          {!imageError ? (
            <Image
              src={getProductImage(product)}
              alt={getProductName(product)}
              fill
              className="object-contain"
              sizes="80px"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ScaleIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Remove button */}
        <button
          onClick={onRemove}
          disabled={isLoading}
          className={cn(
            'absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full',
            'flex items-center justify-center shadow-md',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Remove product"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>

        {/* Highlighted badge */}
        {product.isHighlighted && (
          <div className="absolute top-1 left-1">
            <Badge variant="warning" className="text-xs px-1 py-0">
              Best
            </Badge>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <ArrowPathIcon className="h-5 w-5 text-primary-600 animate-spin" />
          </div>
        )}
      </div>

      {/* Product info tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        <div className="font-medium">{getProductName(product)}</div>
        <div className="text-gray-300">{getProductPrice(product)}</div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </div>
    </motion.div>
  );
};

/**
 * Empty slot placeholder
 */
const EmptySlot: React.FC<{ index: number }> = ({ index }) => {
  return (
    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="text-xs text-gray-400 font-medium">{index + 1}</div>
        <div className="text-xs text-gray-400">Empty</div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CompareBar Component
 * 
 * Sticky comparison bar that shows selected products for comparison.
 * Features:
 * - Product thumbnails with remove option
 * - Progress indicator (X of Y products)
 * - Compare button (enabled when 2+ products)
 * - Clear all functionality
 * - Share comparison option
 * - Collapsible design
 * - Position variants (top/bottom)
 * - Loading states
 * - Animated transitions
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <CompareBar
 *   products={compareProducts}
 *   maxProducts={4}
 *   position="bottom"
 *   onRemoveProduct={handleRemove}
 *   onCompare={handleCompare}
 *   onClearAll={handleClearAll}
 * />
 * ```
 */
export const CompareBar: React.FC<CompareBarProps> = ({
  products,
  maxProducts = 4,
  position = 'bottom',
  isVisible = true,
  isCollapsed: controlledIsCollapsed,
  onRemoveProduct,
  onCompare,
  onClearAll,
  onShare,
  onToggleCollapse,
  isLoading = false,
  animated = true,
  className,
}) => {
  const [internalIsCollapsed, setInternalIsCollapsed] = React.useState(false);
  
  const isCollapsed = controlledIsCollapsed !== undefined 
    ? controlledIsCollapsed 
    : internalIsCollapsed;

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    if (onToggleCollapse) {
      onToggleCollapse(newState);
    } else {
      setInternalIsCollapsed(newState);
    }
  };

  const canCompare = products.length >= 2;
  const isFull = products.length >= maxProducts;

  // Create empty slots
  const emptySlots = Array.from(
    { length: Math.max(0, maxProducts - products.length) },
    (_, i) => i
  );

  if (!isVisible && products.length === 0) return null;

  return (
    <AnimatePresence>
      {(isVisible || products.length > 0) && (
        <motion.div
          initial={animated ? { y: position === 'bottom' ? 100 : -100, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position === 'bottom' ? 100 : -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'fixed left-0 right-0 z-50 shadow-2xl',
            position === 'bottom' ? 'bottom-0' : 'top-0',
            className
          )}
        >
          <div className="bg-white border-t-2 border-primary-500">
            {/* Collapse toggle button */}
            <button
              onClick={handleToggleCollapse}
              className={cn(
                'absolute left-1/2 transform -translate-x-1/2 w-20 h-6',
                'bg-white border-2 border-primary-500 border-b-0 rounded-t-lg',
                'flex items-center justify-center',
                'hover:bg-primary-50 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                position === 'bottom' ? '-top-6' : '-bottom-6 rotate-180'
              )}
              aria-label={isCollapsed ? 'Expand compare bar' : 'Collapse compare bar'}
            >
              {isCollapsed ? (
                <ChevronUpIcon className="h-4 w-4 text-primary-600" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-primary-600" />
              )}
            </button>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={animated ? { height: 0, opacity: 0 } : false}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Title and counter */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <ScaleIcon className="h-6 w-6 text-primary-600" />
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              Compare Products
                            </h3>
                            <p className="text-xs text-gray-500">
                              {products.length} of {maxProducts} selected
                            </p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(products.length / maxProducts) * 100}%` }}
                              transition={{ duration: 0.3 }}
                              className={cn(
                                'h-full transition-colors',
                                isFull ? 'bg-green-500' : 'bg-primary-500'
                              )}
                            />
                          </div>
                          {isFull && (
                            <Badge variant="success" className="text-xs">
                              Full
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Center: Product thumbnails */}
                      <div className="flex-1 flex items-center justify-center gap-3 overflow-x-auto max-w-2xl">
                        <AnimatePresence mode="popLayout">
                          {products.map((product) => (
                            <ProductThumbnail
                              key={product.productId}
                              product={product}
                              onRemove={() => onRemoveProduct(product.productId)}
                              isLoading={isLoading}
                            />
                          ))}
                          {emptySlots.map((_, index) => (
                            <EmptySlot key={`empty-${index}`} index={products.length + index} />
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2">
                        {/* Compare button */}
                        <Button
                          onClick={onCompare}
                          disabled={!canCompare || isLoading}
                          size="lg"
                          className={cn(
                            'font-semibold',
                            canCompare && 'animate-pulse'
                          )}
                        >
                          <ScaleIcon className="h-5 w-5 mr-2" />
                          Compare{products.length > 0 && ` (${products.length})`}
                        </Button>

                        {/* Share button */}
                        {onShare && products.length > 0 && (
                          <Button
                            onClick={onShare}
                            disabled={isLoading}
                            variant="outline"
                            size="lg"
                          >
                            <ShareIcon className="h-5 w-5" />
                          </Button>
                        )}

                        {/* Clear all button */}
                        {products.length > 0 && (
                          <Button
                            onClick={onClearAll}
                            disabled={isLoading}
                            variant="ghost"
                            size="lg"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XMarkIcon className="h-5 w-5 mr-2" />
                            Clear All
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Mobile view - stacked layout */}
                    <div className="sm:hidden mt-4 space-y-3">
                      {/* Progress */}
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(products.length / maxProducts) * 100}%` }}
                          className={cn(
                            'h-full',
                            isFull ? 'bg-green-500' : 'bg-primary-500'
                          )}
                        />
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={onCompare}
                          disabled={!canCompare || isLoading}
                          className="w-full"
                        >
                          Compare ({products.length})
                        </Button>
                        <Button
                          onClick={onClearAll}
                          disabled={isLoading || products.length === 0}
                          variant="outline"
                          className="w-full"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapsed state mini bar */}
            {isCollapsed && (
              <div className="container mx-auto px-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ScaleIcon className="h-5 w-5 text-primary-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {products.length} products selected
                    </span>
                  </div>
                  <Button
                    onClick={onCompare}
                    disabled={!canCompare || isLoading}
                    size="sm"
                  >
                    Compare
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompareBar;