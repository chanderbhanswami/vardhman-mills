'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ProductVariant } from '@/types';
import { X, Heart, ShoppingCart, Share2, Star, Check, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToggleWishlist } from '@/hooks/wishlist/useToggleWishlist';
import { useAddToCart } from '@/hooks/cart/useAddToCart';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

export interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  className?: string;
}

export const QuickView: React.FC<QuickViewProps> = ({ product, isOpen, onClose, className }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { quickToggle, isInWishlist, isToggling: wishlistLoading } = useToggleWishlist();
  const { addToCart, isAdding: cartLoading } = useAddToCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
      setSelectedOptions({});
      setSelectedVariant(null);
    }
  }, [product]);

  // Apply color swatch backgrounds via DOM manipulation to avoid inline styles
  useEffect(() => {
    if (!isOpen || !product) return;
    
    const swatches = document.querySelectorAll('.color-swatch-bg');
    swatches.forEach((swatch) => {
      const bgColor = swatch.getAttribute('data-bg');
      if (bgColor && swatch instanceof HTMLElement) {
        swatch.style.backgroundColor = bgColor;
      }
    });
  }, [isOpen, product, selectedOptions]);

  if (!product) return null;

  const handleWishlistToggle = async () => {
    try {
      await quickToggle(product.id);
    } catch (error) {
      console.error('Wishlist toggle error:', error);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity, {
        variantId: selectedVariant?.id,
      });
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.shortDescription || product.description,
      url: `${window.location.origin}/products/${product.slug}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully');
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard');
      } catch {
        toast.error('Failed to copy link');
      }
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    const maxQuantity = product.inventory?.quantity || 99;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const isWishlisted = isInWishlist(product.id);
  const images = product.media?.images || [];
  const hasDiscount = product.pricing?.salePrice && product.pricing.salePrice.amount < product.pricing.basePrice.amount;
  const regularPrice = product.pricing?.compareAtPrice?.amount || product.pricing?.basePrice?.amount || 0;
  const salePrice = product.pricing?.salePrice?.amount || product.pricing?.basePrice?.amount || 0;
  const discountPercentage = regularPrice > salePrice ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;
  const inStock = product.inventory?.isInStock;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto',
                className
              )}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Close quick view"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row h-full overflow-y-auto">
                {/* Left Side - Images */}
                <div className="w-full md:w-1/2 p-6 bg-gray-50">
                  <div className="sticky top-6">
                    {/* Main Image */}
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-white mb-4">
                      {images[selectedImage] && (
                        <Image
                          src={images[selectedImage].url}
                          alt={images[selectedImage].alt || product.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      )}

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.isNewArrival && (
                          <Badge variant="default" className="bg-primary-500">
                            New
                          </Badge>
                        )}
                        {hasDiscount && (
                          <Badge variant="destructive">{discountPercentage}% OFF</Badge>
                        )}
                      </div>
                    </div>

                    {/* Thumbnail Images */}
                    {images.length > 1 && (
                      <div className="grid grid-cols-5 gap-2">
                        {images.slice(0, 5).map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={cn(
                              'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                              selectedImage === index
                                ? 'border-primary-600 ring-2 ring-primary-200'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                            aria-label={`View image ${index + 1}`}
                          >
                            <Image
                              src={image.url}
                              alt={image.alt || `${product.name} ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="100px"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Details */}
                <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Brand */}
                    {product.brand && (
                      <p className="text-sm text-gray-600 font-medium">{product.brand.name}</p>
                    )}

                    {/* Title */}
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {product.name}
                      </h2>
                      {product.shortDescription && (
                        <p className="text-gray-600">{product.shortDescription}</p>
                      )}
                    </div>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'w-5 h-5',
                                i < Math.floor(product.rating.average)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {product.rating.average.toFixed(1)} ({product.reviewCount} reviews)
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-3 pb-6 border-b border-gray-200">
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{salePrice.toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <>
                          <span className="text-xl text-gray-500 line-through">
                            ₹{regularPrice.toLocaleString()}
                          </span>
                          <span className="text-lg font-semibold text-green-600">
                            Save ₹{(regularPrice - salePrice).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Colors */}
                    {product.colors && product.colors.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Color: {selectedOptions.color || 'Select'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((color) => {
                            // Create a color swatch button with dynamic background
                            const bgColor = color.hexCode || color.name.toLowerCase();
                            return (
                              <button
                                key={color.id}
                                onClick={() => handleOptionChange('color', color.name)}
                                className={cn(
                                  'relative w-10 h-10 rounded-full border-2 transition-all overflow-hidden',
                                  selectedOptions.color === color.name
                                    ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900'
                                    : 'border-gray-300 hover:border-gray-400'
                                )}
                                title={color.name}
                                aria-label={`Select ${color.name} color`}
                              >
                                {/* Background color layer - using data-bg for styling via CSS */}
                                <span
                                  className="absolute inset-0 rounded-full color-swatch-bg"
                                  data-bg={bgColor}
                                />
                                {selectedOptions.color === color.name && (
                                  <Check className="w-5 h-5 text-white absolute inset-0 m-auto z-10" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sizes */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Size: {selectedOptions.size || 'Select'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((size) => (
                            <button
                              key={size.id}
                              onClick={() => handleOptionChange('size', size.name)}
                              disabled={!size.isAvailable}
                              className={cn(
                                'px-4 py-2 rounded-lg border-2 font-medium transition-all',
                                selectedOptions.size === size.name
                                  ? 'border-gray-900 bg-gray-900 text-white'
                                  : size.isAvailable
                                  ? 'border-gray-300 hover:border-gray-400'
                                  : 'border-gray-200 text-gray-400 line-through cursor-not-allowed'
                              )}
                            >
                              {size.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Quantity</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              const maxQuantity = product.inventory?.quantity || 99;
                              setQuantity(Math.min(Math.max(1, val), maxQuantity));
                            }}
                            className="w-16 text-center border-x border-gray-300 h-10 focus:outline-none"
                            min={1}
                            max={product.inventory?.quantity || 99}
                            aria-label="Product quantity"
                            title="Quantity"
                          />
                          <button
                            onClick={() => handleQuantityChange(1)}
                            disabled={quantity >= (product.inventory?.quantity || 99)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {product.inventory?.quantity && product.inventory.quantity < 10 && (
                          <span className="text-sm text-red-600">
                            Only {product.inventory.quantity} left in stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    {product.features && product.features.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Features</h3>
                        <ul className="space-y-2">
                          {product.features.slice(0, 5).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3 pt-6">
                      <Button
                        variant="default"
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={!inStock || cartLoading}
                        className="w-full"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {inStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleWishlistToggle}
                          disabled={wishlistLoading}
                          className={cn(
                            'flex-1',
                            isWishlisted && 'text-red-500 border-red-500'
                          )}
                        >
                          <Heart className={cn('w-5 h-5 mr-2', isWishlisted && 'fill-current')} />
                          {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                        </Button>

                        <Button variant="outline" size="lg" onClick={handleShare} className="flex-1">
                          <Share2 className="w-5 h-5 mr-2" />
                          Share
                        </Button>
                      </div>

                      <Link href={`/products/${product.slug}`}>
                        <Button variant="link" size="lg" className="w-full">
                          View Full Details
                        </Button>
                      </Link>
                    </div>

                    {/* Stock Status */}
                    {inStock && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                        <Check className="w-4 h-4" />
                        <span>In Stock - Ships within 2-3 business days</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickView;