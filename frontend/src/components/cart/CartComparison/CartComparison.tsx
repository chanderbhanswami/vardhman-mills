/**
 * CartComparison Component
 * 
 * Provides side-by-side comparison of cart items with detailed specifications,
 * pricing, ratings, and feature analysis to help users make informed decisions.
 * 
 * Features:
 * - Side-by-side product comparison
 * - Feature matrix with checkmarks
 * - Specification comparison
 * - Price and rating comparison
 * - Sticky header for easy reference
 * - Add/remove items from comparison
 * - Export comparison report
 * - Share comparison link
 * - Highlight differences
 * - Responsive table layout
 * 
 * @component
 * @example
 * ```tsx
 * <CartComparison
 *   items={comparisonItems}
 *   onRemoveItem={handleRemove}
 *   onAddToCart={handleAddToCart}
 *   maxItems={4}
 * />
 * ```
 */

'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  XMarkIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  ArrowsPointingOutIcon,
  CheckIcon,
  XMarkIcon as CloseIcon,
  StarIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import toast from 'react-hot-toast';

// ============================================================================
// Types
// ============================================================================

export interface ComparisonItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  brand?: string;
  category?: string;
  specifications: Record<string, string | number | boolean>;
  features: string[];
  tags?: string[];
}

export interface CartComparisonProps {
  /** Items to compare */
  items: ComparisonItem[];
  /** Callback when item is removed from comparison */
  onRemoveItem?: (itemId: string) => void;
  /** Callback when item is added to cart */
  onAddToCart?: (itemId: string) => void;
  /** Maximum number of items to compare */
  maxItems?: number;
  /** Show specification differences only */
  showDifferencesOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export const CartComparison: React.FC<CartComparisonProps> = ({
  items,
  onRemoveItem,
  onAddToCart,
  maxItems = 4,
  showDifferencesOnly = false,
  className,
}) => {
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [expandedView, setExpandedView] = useState(false);
  const { addItem } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  // Get all unique specification keys
  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    items.forEach((item) => {
      Object.keys(item.specifications).forEach((key) => keys.add(key));
    });
    return Array.from(keys);
  }, [items]);

  // Get all unique features
  const allFeatures = useMemo(() => {
    const features = new Set<string>();
    items.forEach((item) => {
      item.features.forEach((feature) => features.add(feature));
    });
    return Array.from(features);
  }, [items]);

  // Filter specifications to show only differences if enabled
  const displayedSpecKeys = useMemo(() => {
    if (!showDifferencesOnly && !highlightDifferences) {
      return allSpecKeys;
    }

    return allSpecKeys.filter((key) => {
      const values = items.map((item) => item.specifications[key]);
      const uniqueValues = new Set(values.filter((v) => v !== undefined));
      return uniqueValues.size > 1;
    });
  }, [allSpecKeys, items, showDifferencesOnly, highlightDifferences]);

  // Check if a specification row has differences
  const hasDifference = (key: string): boolean => {
    const values = items.map((item) => item.specifications[key]);
    const uniqueValues = new Set(values.filter((v) => v !== undefined));
    return uniqueValues.size > 1;
  };

  // Handle add to cart
  const handleAddToCart = (item: ComparisonItem) => {
    addItem({
      id: `cart-${item.id}`,
      productId: item.id,
      quantity: 1,
      name: item.name,
      price: item.price,
      image: item.image,
      slug: item.slug,
      sku: `SKU-${item.id}`,
      inStock: item.inStock ? 999 : 0,
    });
    toast.success(`${item.name} added to cart!`);
    onAddToCart?.(item.id);
  };

  // Handle add to wishlist
  const handleAddToWishlist = (item: ComparisonItem) => {
    addToWishlist(item.id);
    toast.success(`${item.name} added to wishlist!`);
  };

  // Handle share comparison
  const handleShare = async () => {
    const itemIds = items.map((item) => item.id).join(',');
    const url = `${window.location.origin}/compare?items=${itemIds}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Product Comparison',
          text: 'Check out this product comparison',
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Comparison link copied to clipboard!');
    }
  };

  // Handle export comparison
  const handleExport = () => {
    const data = items.map((item) => ({
      Name: item.name,
      Brand: item.brand || 'N/A',
      Price: formatCurrency(item.price, 'INR'),
      Rating: item.rating,
      Reviews: item.reviewCount,
      InStock: item.inStock ? 'Yes' : 'No',
      ...item.specifications,
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map((row) => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-comparison.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Comparison exported successfully!');
  };

  // Render rating stars
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <StarSolidIcon className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarIcon className="h-4 w-4 text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  // Render specification value
  const renderSpecValue = (value: string | number | boolean | undefined) => {
    if (value === undefined || value === null) {
      return <span className="text-gray-400">—</span>;
    }
    if (typeof value === 'boolean') {
      return value ? (
        <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <CloseIcon className="h-5 w-5 text-red-500 mx-auto" />
      );
    }
    return <span>{value}</span>;
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ArrowsPointingOutIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No items to compare
        </h3>
        <p className="text-gray-600">
          Add products to comparison to see them side by side
        </p>
      </div>
    );
  }

  return (
    <div className={cn('cart-comparison', className)}>
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Compare Products
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Comparing {items.length} of {maxItems} products
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHighlightDifferences(!highlightDifferences)}
          >
            {highlightDifferences ? 'Show All' : 'Show Differences'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedView(!expandedView)}
          >
            <ArrowsPointingOutIcon className="h-4 w-4 mr-2" />
            {expandedView ? 'Compact' : 'Expand'}
          </Button>

          <Button variant="outline" size="sm" onClick={handleShare}>
            <ShareIcon className="h-4 w-4 mr-2" />
            Share
          </Button>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-900 border-b border-gray-200 w-48">
                Product
              </th>
              {items.map((item) => (
                <th
                  key={item.id}
                  className="p-4 border-b border-gray-200 min-w-[250px]"
                >
                  <div className="relative">
                    {/* Remove Button */}
                    <button
                      onClick={() => onRemoveItem?.(item.id)}
                      className="absolute top-0 right-0 p-1 hover:bg-gray-200 rounded-full transition-colors"
                      aria-label="Remove from comparison"
                    >
                      <XMarkIcon className="h-4 w-4 text-gray-500" />
                    </button>

                    {/* Product Image */}
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      {item.originalPrice && (
                        <Badge className="absolute top-2 left-2" variant="destructive">
                          {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                        </Badge>
                      )}
                    </div>

                    {/* Product Name */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.name}
                    </h3>

                    {/* Brand */}
                    {item.brand && (
                      <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
                    )}

                    {/* Rating */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {renderRating(item.rating)}
                      <span className="text-sm text-gray-600">
                        ({item.reviewCount})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(item.price, 'INR')}
                      </div>
                      {item.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatCurrency(item.originalPrice, 'INR')}
                        </div>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-4">
                      {item.inStock ? (
                        <Badge variant="success">In Stock</Badge>
                      ) : (
                        <Badge variant="destructive">Out of Stock</Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.inStock}
                        className="w-full"
                      >
                        <ShoppingCartIcon className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleAddToWishlist(item)}
                        className="w-full"
                      >
                        <HeartIcon
                          className={cn(
                            'h-4 w-4 mr-2',
                            isInWishlist(item.id) && 'fill-red-500 text-red-500'
                          )}
                        />
                        {isInWishlist(item.id) ? 'In Wishlist' : 'Add to Wishlist'}
                      </Button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Specifications Section */}
            {displayedSpecKeys.length > 0 && (
              <>
                <tr className="bg-gray-100">
                  <td
                    colSpan={items.length + 1}
                    className="p-4 font-semibold text-gray-900"
                  >
                    Specifications
                  </td>
                </tr>
                {displayedSpecKeys.map((key) => (
                  <tr
                    key={key}
                    className={cn(
                      'border-b border-gray-200 hover:bg-gray-50',
                      highlightDifferences &&
                        hasDifference(key) &&
                        'bg-yellow-50'
                    )}
                  >
                    <td className="p-4 font-medium text-gray-700">{key}</td>
                    {items.map((item) => (
                      <td key={item.id} className="p-4 text-center text-gray-900">
                        {renderSpecValue(item.specifications[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}

            {/* Features Section */}
            {allFeatures.length > 0 && (
              <>
                <tr className="bg-gray-100">
                  <td
                    colSpan={items.length + 1}
                    className="p-4 font-semibold text-gray-900"
                  >
                    Features
                  </td>
                </tr>
                {allFeatures.map((feature) => (
                  <tr
                    key={feature}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-4 font-medium text-gray-700">{feature}</td>
                    {items.map((item) => (
                      <td key={item.id} className="p-4 text-center">
                        {item.features.includes(feature) ? (
                          <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <CloseIcon className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Helper Text */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Tip: Use the &quot;Show Differences&quot; button to highlight only the
          specifications that differ between products
        </p>
      </div>
    </div>
  );
};

export default CartComparison;
