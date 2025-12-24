/**
 * QuickView Component
 * 
 * Modal quick view of cart items with detailed information, variant selection,
 * and quick actions without navigating away from current page.
 * 
 * Features:
 * - Modal overlay with product details
 * - Image gallery with zoom
 * - Variant selection (size, color, etc.)
 * - Quantity selector
 * - Stock availability
 * - Quick add to cart/wishlist
 * - Related products
 * - Reviews summary
 * - Shipping information
 * - Keyboard navigation (ESC to close)
 * 
 * @component
 * @example
 * ```tsx
 * <QuickView
 *   product={product}
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onAddToCart={handleAdd}
 * />
 * ```
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  XMarkIcon,
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowsPointingOutIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import toast from 'react-hot-toast';

// ============================================================================
// Types
// ============================================================================

export interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockLevel?: number;
  brand?: string;
  sku?: string;
  variants?: {
    name: string;
    options: Array<{
      value: string;
      label: string;
      available: boolean;
    }>;
  }[];
  features?: string[];
  shippingInfo?: string;
}

export interface QuickViewProps {
  /** Product to display */
  product: QuickViewProduct | null;
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when product is added to cart */
  onAddToCart?: (productId: string, quantity: number, variants: Record<string, string>) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export const QuickView: React.FC<QuickViewProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  className,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
      setSelectedVariants({});
    }
  }, [product]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  // Check if all required variants are selected
  const allVariantsSelected = !product.variants || product.variants.every(
    (variant) => selectedVariants[variant.name]
  );

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!allVariantsSelected) {
      toast.error('Please select all options');
      return;
    }

    setAdding(true);
    try {
      const variantData = Object.keys(selectedVariants).length > 0
        ? selectedVariants
        : undefined;

      // Use global CartProvider's addToCart method
      await addToCart(product.id, quantity, variantData);

      toast.success(`${product.name} added to cart!`);
      onAddToCart?.(product.id, quantity, selectedVariants);

      // Close modal after brief delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  // Handle add to wishlist
  const handleAddToWishlist = () => {
    addToWishlist(product.id);
    toast.success(`${product.name} added to wishlist!`);
  };

  // Handle quantity change
  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    if (product.stockLevel && newQuantity > product.stockLevel) {
      toast.error(`Only ${product.stockLevel} available`);
      return;
    }
    setQuantity(newQuantity);
  };

  // Handle variant selection
  const handleVariantChange = (variantName: string, value: string) => {
    setSelectedVariants({
      ...selectedVariants,
      [variantName]: value,
    });
  };

  // Render rating stars
  const renderRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= product.rating ? (
              <StarSolidIcon className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarIcon className="h-4 w-4 text-gray-300" />
            )}
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          ({product.reviewCount} reviews)
        </span>
      </div>
    );
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className={cn('relative z-50', className)} onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl overflow-hidden">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close quick view"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-600" />
                </button>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
                  {/* Left Column - Images */}
                  <div>
                    {/* Main Image */}
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-gray-100">
                      <Image
                        src={product.images[selectedImage]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority
                      />
                      {discount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute top-4 left-4"
                        >
                          {discount}% OFF
                        </Badge>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Badge variant="destructive" className="text-lg px-6 py-2">
                            Out of Stock
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Images */}
                    {product.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {product.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            title={`View image ${index + 1}`}
                            className={cn(
                              'relative aspect-square rounded-lg overflow-hidden border-2 transition-colors',
                              selectedImage === index
                                ? 'border-primary'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <Image
                              src={image}
                              alt={`${product.name} ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column - Details */}
                  <div className="flex flex-col">
                    {/* Brand */}
                    {product.brand && (
                      <div className="text-sm text-gray-600 mb-2">
                        {product.brand}
                      </div>
                    )}

                    {/* Title */}
                    <Dialog.Title className="text-2xl font-bold text-gray-900 mb-3">
                      {product.name}
                    </Dialog.Title>

                    {/* Rating */}
                    <div className="mb-4">{renderRating()}</div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatCurrency(product.price, 'INR')}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xl text-gray-500 line-through">
                          {formatCurrency(product.originalPrice, 'INR')}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-6">
                      {product.inStock ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="success">In Stock</Badge>
                          {product.stockLevel && product.stockLevel < 10 && (
                            <span className="text-sm text-orange-600">
                              Only {product.stockLevel} left!
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="destructive">Out of Stock</Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 mb-6 line-clamp-3">
                      {product.description}
                    </p>

                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="space-y-4 mb-6">
                        {product.variants.map((variant) => (
                          <div key={variant.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {variant.name}
                              {selectedVariants[variant.name] && (
                                <span className="ml-2 text-primary">
                                  - {selectedVariants[variant.name]}
                                </span>
                              )}
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {variant.options.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() =>
                                    option.available &&
                                    handleVariantChange(variant.name, option.value)
                                  }
                                  disabled={!option.available}
                                  className={cn(
                                    'px-4 py-2 border rounded-md text-sm font-medium transition-colors',
                                    selectedVariants[variant.name] === option.value
                                      ? 'border-primary bg-primary text-white'
                                      : option.available
                                        ? 'border-gray-300 hover:border-gray-400'
                                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                  )}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quantity */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="px-6 py-2 font-semibold">{quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(1)}
                            className="p-2 hover:bg-gray-100"
                            aria-label="Increase quantity"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        {product.stockLevel && (
                          <span className="text-sm text-gray-600">
                            {product.stockLevel} available
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mb-6">
                      <Button
                        onClick={handleAddToCart}
                        disabled={!product.inStock || adding || !allVariantsSelected}
                        className="flex-1"
                        size="lg"
                      >
                        <ShoppingCartIcon className="h-5 w-5 mr-2" />
                        {adding ? 'Adding...' : 'Add to Cart'}
                      </Button>
                      <Button
                        onClick={handleAddToWishlist}
                        variant="outline"
                        size="lg"
                        className={cn(
                          isInWishlist(product.id) && 'border-red-500 text-red-500'
                        )}
                      >
                        <HeartIcon
                          className={cn(
                            'h-5 w-5',
                            isInWishlist(product.id) && 'fill-red-500'
                          )}
                        />
                      </Button>
                    </div>

                    {/* Features */}
                    {product.features && product.features.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Key Features:
                        </h3>
                        <ul className="space-y-1">
                          {product.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <span className="text-primary mt-1">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Shipping Info */}
                    <div className="space-y-2 border-t pt-6">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <TruckIcon className="h-5 w-5 text-gray-400" />
                        <span>{product.shippingInfo || 'Free shipping on orders over ₹500'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                        <span>Secure checkout with encryption</span>
                      </div>
                    </div>

                    {/* View Full Details */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="mt-4 flex items-center justify-center gap-2 text-primary hover:text-primary-dark font-medium"
                      onClick={onClose}
                    >
                      <ArrowsPointingOutIcon className="h-4 w-4" />
                      View Full Details
                    </Link>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default QuickView;
