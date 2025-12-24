/**
 * FeaturedCard Component
 * 
 * Enterprise-level product card for displaying featured products with
 * comprehensive features and professional aesthetics.
 * 
 * Features:
 * - Product image with zoom on hover
 * - Vertical action bar on the right
 * - Quantity selector after adding to cart
 * - Rating with review count
 * - Color swatches
 * - Variant count
 * - Stock availability
 * - Badges (text only)
 * - Fixed height cards
 * - Professional hover effects
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  ShareIcon,
  ArrowsRightLeftIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
  Squares2X2Icon,
  BellIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
  EyeIcon as EyeSolidIcon,
  ShareIcon as ShareSolidIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { NotifyMeDialog } from '@/components/common/NotifyMeDialog';
import type { Product } from '@/types/product.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FeaturedCardProps {
  /** Product data */
  product: Product;
  /** Card variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Show quick view button */
  showQuickView?: boolean;
  /** Show wishlist button */
  showWishlist?: boolean;
  /** Show add to cart button */
  showAddToCart?: boolean;
  /** Show share button */
  showShare?: boolean;
  /** Show compare button */
  showCompare?: boolean;
  /** Show ratings */
  showRating?: boolean;
  /** Show color swatches */
  showColorSwatches?: boolean;
  /** Enable image zoom on hover */
  enableImageZoom?: boolean;
  /** Initial loading state */
  loading?: boolean;
  /** Is product in wishlist */
  isInWishlist?: boolean;
  /** Is product in cart */
  isInCart?: boolean;
  /** Current quantity in cart */
  cartQuantity?: number;
  /** Additional CSS classes */
  className?: string;
  /** On add to cart callback */
  onAddToCart?: (product: Product, quantity: number) => void;
  /** On update cart quantity callback */
  onUpdateCartQuantity?: (product: Product, quantity: number) => void;
  /** On remove from cart callback */
  onRemoveFromCart?: (product: Product) => void;
  /** On wishlist toggle callback */
  onAddToWishlist?: (product: Product) => void;
  /** On remove from wishlist callback */
  onRemoveFromWishlist?: (product: Product) => void;
  /** On quick view callback */
  onQuickView?: (product: Product) => void;
  /** On share callback */
  onShare?: (product: Product) => void;
  /** On compare callback */
  onCompare?: (product: Product) => void;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const imageVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.4 },
  },
};

const actionBarVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, staggerChildren: 0.05 },
  },
  exit: { opacity: 0, x: 20 },
};

const actionItemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const FeaturedCard: React.FC<FeaturedCardProps> = ({
  product,
  variant = 'default',
  showQuickView = true,
  showWishlist = true,
  showAddToCart = true,
  showShare = true,
  showCompare = true,
  showRating = true,
  showColorSwatches = true,
  enableImageZoom = true,
  loading = false,
  isInWishlist = false,
  isInCart = false,
  cartQuantity = 0,
  className,
  onAddToCart,
  onUpdateCartQuantity,
  onRemoveFromCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  onQuickView,
  onShare,
  onCompare,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [showNotification, setShowNotification] = useState<'cart' | 'wishlist' | 'removed' | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const cardRef = useRef<HTMLDivElement>(null);

  // Ripple effect handler
  const createRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const id = Date.now();

    setRipples(prev => [...prev, { id, x, y }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  }, []);

  // Sync with props
  useEffect(() => {
    setIsWishlisted(isInWishlist);
  }, [isInWishlist]);

  // Sync cart state from props
  useEffect(() => {
    if (cartQuantity > 0) {
      setQuantity(cartQuantity);
      setAddedToCart(true);
      setShowQuantitySelector(true);
    } else {
      // Reset state when item is removed from cart
      setAddedToCart(false);
      setShowQuantitySelector(false);
      setQuantity(1);
    }
  }, [cartQuantity]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const displayImage = useMemo(() => {
    // Check multiple possible image locations
    // 1. media.primaryImage
    if (product.media?.primaryImage) {
      const img = product.media.primaryImage;
      return typeof img === 'string' ? img : img.url;
    }

    // 2. media.images array
    if (product.media?.images && product.media.images.length > 0) {
      const img = product.media.images[0];
      return typeof img === 'string' ? img : img.url;
    }

    // 3. Direct images array on product (backend structure)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productAny = product as any;
    if (productAny.images && Array.isArray(productAny.images) && productAny.images.length > 0) {
      const img = productAny.images[0];
      return typeof img === 'string' ? img : (img.url || img.src);
    }

    // 4. thumbnail property
    if (productAny.thumbnail) {
      return productAny.thumbnail;
    }

    // 5. Check variants for images
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0] as any;
      if (variant.images && variant.images.length > 0) {
        const img = variant.images[0];
        return typeof img === 'string' ? img : (img.url || img.src);
      }
      if (variant.image) {
        return typeof variant.image === 'string' ? variant.image : variant.image.url;
      }
    }

    return '/images/placeholder-product.jpg';
  }, [product.media, product.variants, product]);

  const hasDiscount = useMemo(() => {
    // Handle nested pricing structure OR flat backend structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variant = product.variants?.[0] as any;
    const basePrice = product.pricing?.basePrice?.amount ?? variant?.comparePrice ?? variant?.price ?? 0;
    const salePrice = product.pricing?.salePrice?.amount ?? variant?.price ?? 0;
    return salePrice > 0 && salePrice < basePrice;
  }, [product.pricing, product.variants]);

  const discountedPrice = useMemo(() => {
    // Handle nested pricing structure OR flat backend structure (variants[].price)
    if (product.pricing?.salePrice?.amount) {
      return product.pricing.salePrice.amount;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variant = product.variants?.[0] as any;
    if (variant?.price) {
      return variant.price;
    }
    return product.pricing?.basePrice?.amount || 0;
  }, [product.pricing, product.variants]);

  const originalPrice = useMemo(() => {
    // Get original/compare price from either structure
    if (product.pricing?.basePrice?.amount) {
      return product.pricing.basePrice.amount;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variant = product.variants?.[0] as any;
    if (variant?.comparePrice) {
      return variant.comparePrice;
    }
    return variant?.price || 0;
  }, [product.pricing, product.variants]);

  const discountPercentage = useMemo(() => {
    if (!hasDiscount || originalPrice === 0) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  }, [hasDiscount, originalPrice, discountedPrice]);

  const isOutOfStock = useMemo(() => {
    return product.inventory?.quantity === 0;
  }, [product.inventory]);

  const isLowStock = useMemo(() => {
    return product.inventory?.quantity && product.inventory.quantity < 10 && product.inventory.quantity > 0;
  }, [product.inventory]);

  // Get variant count from product
  const variantCount = useMemo(() => {
    const sizes = product.sizes?.filter(s => s.isAvailable)?.length || 0;
    const colors = product.colors?.filter(c => c.isAvailable)?.length || 0;
    const variants = product.variants?.length || 0;
    return variants > 0 ? variants : (sizes > 0 || colors > 0 ? Math.max(sizes, 1) * Math.max(colors, 1) : 0);
  }, [product.sizes, product.colors, product.variants]);

  const badges = useMemo(() => {
    const badgeList: { text: string; className: string }[] = [];

    if (product.isFeatured) {
      badgeList.push({
        text: 'Featured',
        className: 'bg-purple-600 text-white',
      });
    }
    if (product.isBestseller) {
      badgeList.push({
        text: 'Hot',
        className: 'bg-orange-500 text-white',
      });
    }
    if (product.isNewArrival) {
      badgeList.push({
        text: 'New',
        className: 'bg-blue-600 text-white',
      });
    }
    if (hasDiscount && discountPercentage > 0) {
      badgeList.push({
        text: `-${discountPercentage}%`,
        className: 'bg-red-600 text-white',
      });
    }
    if (isOutOfStock) {
      badgeList.push({
        text: 'Sold Out',
        className: 'bg-gray-800 text-white',
      });
    } else if (isLowStock) {
      badgeList.push({
        text: `Only ${product.inventory?.quantity} left`,
        className: 'bg-amber-500 text-white',
      });
    }

    return badgeList;
  }, [product, hasDiscount, discountPercentage, isOutOfStock, isLowStock]);

  const colorSwatches = useMemo(() => {
    return (product.colors?.filter(c => c.isAvailable) || []).slice(0, 5);
  }, [product.colors]);

  const hasFreeShipping = useMemo(() => {
    return (product.pricing?.basePrice?.amount || 0) > 50;
  }, [product.pricing]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddToCart = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isOutOfStock || isAddingToCart) return;

    setIsAddingToCart(true);

    // Call the actual add to cart callback
    onAddToCart?.(product, quantity);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    setAddedToCart(true);
    setIsAddingToCart(false);
    setShowQuantitySelector(true);
    setShowNotification('cart');

    setTimeout(() => setShowNotification(null), 2000);
  }, [isOutOfStock, isAddingToCart, onAddToCart, product, quantity]);

  const handleQuantityChange = useCallback((delta: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const newQuantity = quantity + delta;

    // If quantity goes to 0 or below, remove from cart
    if (newQuantity <= 0) {
      setQuantity(1);
      setAddedToCart(false);
      setShowQuantitySelector(false);
      onRemoveFromCart?.(product);
      setShowNotification('removed');
      setTimeout(() => setShowNotification(null), 2000);
      return;
    }

    setQuantity(newQuantity);
    onUpdateCartQuantity?.(product, newQuantity);
  }, [quantity, onRemoveFromCart, onUpdateCartQuantity, product]);

  const handleConfirmQuantity = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUpdateCartQuantity?.(product, quantity);
    setShowNotification('cart');
    setTimeout(() => setShowNotification(null), 2000);
  }, [onUpdateCartQuantity, product, quantity]);

  const handleWishlistToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newState = !isWishlisted;
    setIsWishlisted(newState);

    if (newState) {
      onAddToWishlist?.(product);
      setShowNotification('wishlist');
    } else {
      onRemoveFromWishlist?.(product);
      setShowNotification('removed');
    }

    setTimeout(() => setShowNotification(null), 2000);
  }, [isWishlisted, onAddToWishlist, onRemoveFromWishlist, product]);

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  }, [onQuickView, product]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onShare) {
      onShare(product);
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription || product.description,
          url: window.location.origin + `/products/${product.slug}`,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      const url = window.location.origin + `/products/${product.slug}`;
      navigator.clipboard.writeText(url);
    }
  }, [onShare, product]);

  const handleCompare = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCompare?.(product);
  }, [onCompare, product]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderBadges = () => {
    if (badges.length === 0) return null;

    return (
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {badges.slice(0, 3).map((badge, index) => (
          <Badge
            key={index}
            className={cn(
              'shadow-md text-xs font-semibold px-2.5 py-1',
              badge.className
            )}
          >
            {badge.text}
          </Badge>
        ))}
      </div>
    );
  };

  const renderVerticalActionBar = () => {
    if (!isHovered) return null;

    return (
      <motion.div
        className={cn(
          "absolute top-3 right-3 z-30 flex flex-col gap-0.5 p-2 rounded-full overflow-hidden",
          // Advanced liquid glass effect
          "bg-gradient-to-br from-white/80 via-white/60 to-white/40",
          "backdrop-blur-2xl backdrop-saturate-150",
          // Multi-layered border for depth
          "border border-white/60",
          "ring-1 ring-black/5",
          // Complex shadow for floating effect
          "shadow-[0_8px_32px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.05)]",
        )}
        // Gradient overlay for specular highlight
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 100%)',
        }}
        variants={actionBarVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Inner shine effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        {showQuickView && (
          <motion.div variants={actionItemVariants}>
            <Tooltip content="Quick View" placement="left" offset={12} variant="dark" size="sm" delayDuration={200}>
              <button
                type="button"
                onClick={(e) => {
                  createRipple(e);
                  handleQuickView(e);
                }}
                className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:text-primary-600 hover:bg-white/60 hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Ripple effects */}
                <AnimatePresence>
                  {ripples.map(ripple => (
                    <motion.span
                      key={ripple.id}
                      className="absolute rounded-full bg-primary-400/30 pointer-events-none"
                      style={{ left: ripple.x, top: ripple.y }}
                      initial={{ width: 0, height: 0, opacity: 0.8 }}
                      animate={{ width: 80, height: 80, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  ))}
                </AnimatePresence>
                <EyeSolidIcon className="w-5 h-5 relative z-10" />
              </button>
            </Tooltip>
          </motion.div>
        )}

        {showCompare && (
          <motion.div variants={actionItemVariants}>
            <Tooltip content="Compare" placement="left" offset={12} variant="dark" size="sm" delayDuration={200}>
              <button
                type="button"
                onClick={(e) => {
                  createRipple(e);
                  handleCompare(e);
                }}
                className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:text-primary-600 hover:bg-white/60 hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Ripple effects */}
                <AnimatePresence>
                  {ripples.map(ripple => (
                    <motion.span
                      key={ripple.id}
                      className="absolute rounded-full bg-primary-400/30 pointer-events-none"
                      style={{ left: ripple.x, top: ripple.y }}
                      initial={{ width: 0, height: 0, opacity: 0.8 }}
                      animate={{ width: 80, height: 80, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  ))}
                </AnimatePresence>
                <ArrowsRightLeftIcon className="w-5 h-5 relative z-10" />
              </button>
            </Tooltip>
          </motion.div>
        )}

        {showShare && (
          <motion.div variants={actionItemVariants}>
            <Tooltip content="Share" placement="left" offset={12} variant="dark" size="sm" delayDuration={200}>
              <button
                type="button"
                onClick={(e) => {
                  createRipple(e);
                  handleShare(e);
                }}
                className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:text-primary-600 hover:bg-white/60 hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Ripple effects */}
                <AnimatePresence>
                  {ripples.map(ripple => (
                    <motion.span
                      key={ripple.id}
                      className="absolute rounded-full bg-primary-400/30 pointer-events-none"
                      style={{ left: ripple.x, top: ripple.y }}
                      initial={{ width: 0, height: 0, opacity: 0.8 }}
                      animate={{ width: 80, height: 80, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  ))}
                </AnimatePresence>
                <ShareSolidIcon className="w-5 h-5 relative z-10" />
              </button>
            </Tooltip>
          </motion.div>
        )}
      </motion.div>
    );
  };

  const renderRating = () => {
    if (!showRating) return null;
    const rating = product.rating?.average || 0;
    const reviewCount = product.reviewCount || 0;

    return (
      <div className="flex items-center gap-1.5">
        <div className="flex">
          {[...Array(5)].map((_, index) => (
            <StarSolidIcon
              key={index}
              className={cn(
                'w-4 h-4',
                index < Math.floor(rating)
                  ? 'text-yellow-400'
                  : 'text-gray-200'
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
        <span className="text-sm text-gray-400">({reviewCount})</span>
      </div>
    );
  };

  const renderColorSwatches = () => {
    if (!showColorSwatches || colorSwatches.length === 0) return null;

    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {colorSwatches.map((color, index) => (
            <Tooltip key={index} content={color.name} placement="top" offset={8} variant="dark" size="sm" delayDuration={200}>
              <div
                className="w-5 h-5 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: color.hexCode || '#ccc' }}
              />
            </Tooltip>
          ))}
          {(product.colors?.length || 0) > 5 && (
            <span className="text-xs text-gray-400 self-center ml-1">
              +{(product.colors?.length || 0) - 5}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderVariantInfo = () => {
    if (variantCount <= 0) return null;

    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Squares2X2Icon className="w-3.5 h-3.5" />
        <span>{variantCount} variant{variantCount > 1 ? 's' : ''} available</span>
      </div>
    );
  };

  const renderProductFeatures = () => {
    return (
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        {hasFreeShipping && (
          <div className="flex items-center gap-1">
            <TruckIcon className="w-3.5 h-3.5 text-green-600" />
            <span>Free Shipping</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>Warranty</span>
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon className="w-3.5 h-3.5 text-purple-600" />
          <span>Fast Delivery</span>
        </div>
      </div>
    );
  };

  const renderQuantitySelector = () => {
    return (
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden flex-1">
        <button
          onClick={(e) => handleQuantityChange(-1, e)}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700"
        >
          <MinusIcon className="w-4 h-4" />
        </button>
        <span className="flex-1 text-center font-semibold text-gray-900">{quantity}</span>
        <button
          onClick={(e) => handleQuantityChange(1, e)}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700"
          disabled={quantity >= 99}
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderAddToCartSection = () => {
    if (!showAddToCart) return null;

    return (
      <div className="flex items-center gap-2 w-full">
        {/* Wishlist Button - Always visible */}
        {showWishlist && (
          <Tooltip content={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'} placement="top" offset={8} variant="dark" size="sm" delayDuration={200}>
            <button
              onClick={handleWishlistToggle}
              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isWishlisted ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-red-500" />
              )}
            </button>
          </Tooltip>
        )}

        {/* Quantity Selector or Add to Cart Button */}
        {showQuantitySelector && addedToCart ? (
          renderQuantitySelector()
        ) : isOutOfStock ? (
          <Button
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowNotifyDialog(true);
            }}
          >
            <BellIcon className="w-5 h-5 mr-2" />
            Notify Me
          </Button>
        ) : (
          <Button
            className="flex-1 group"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2"
                >
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                </motion.div>
                Adding...
              </>
            ) : (
              <>
                <ShoppingCartIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Add to Cart
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  const renderNotification = () => {
    if (!showNotification) return null;

    const messages = {
      cart: 'Added to cart!',
      wishlist: 'Added to wishlist!',
      removed: 'Removed successfully!',
    };

    const bgColors = {
      cart: 'bg-green-500',
      wishlist: 'bg-pink-500',
      removed: 'bg-gray-600',
    };

    return (
      <motion.div
        className={cn(
          'absolute top-4 left-1/2 -translate-x-1/2 z-30 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2',
          bgColors[showNotification]
        )}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <CheckCircleIcon className="w-5 h-5" />
        <span className="text-sm font-medium">{messages[showNotification]}</span>
      </motion.div>
    );
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <Card className={cn('overflow-hidden h-[480px]', className)}>
        <Skeleton className="aspect-square w-full" />
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      ref={cardRef}
      className={cn('group h-full', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        'overflow-hidden h-full flex flex-col transition-all duration-300',
        'border border-gray-200 p-3', // Added padding to card
        'hover:border-primary-500 hover:shadow-lg'
      )}>
        {/* Image Container - Relative wrapper for both Link and action bar */}
        <div className="relative flex-shrink-0">
          {/* Link wraps only the image itself */}
          <Link href={`/products/${product.slug}`} className="block">
            <motion.div
              className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg"
              variants={enableImageZoom ? imageVariants : undefined}
              initial="initial"
              whileHover={enableImageZoom ? 'hover' : undefined}
            >
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className={cn(
                  'object-cover transition-opacity duration-300',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}

              {/* Badges - inside image container */}
              {renderBadges()}
            </motion.div>
          </Link>

          {/* Vertical Action Bar - OUTSIDE the Link, but positioned over the image */}
          <AnimatePresence>
            {renderVerticalActionBar()}
          </AnimatePresence>
        </div>

        {/* Content - Fixed height with flex-grow */}
        <CardContent className="flex flex-col flex-grow p-0 mt-3 space-y-2">
          {/* Category/Brand */}
          {product.category && (
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              {product.category.name}
            </span>
          )}

          {/* Product Name - Fixed min-height for consistency */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="flex flex-col gap-2">
            {/* Rating */}
            {renderRating()}

            {/* Color Swatches */}
            {renderColorSwatches()}

            {/* Variant Info */}
            {renderVariantInfo()}

            {/* Product Features */}
            {renderProductFeatures()}
          </div>

          {/* Price - Push to bottom with mt-auto */}
          <div className="flex items-center gap-2 mt-auto pt-4">
            <span className="text-xl font-bold text-gray-900">
              ₹{discountedPrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {hasDiscount && (
              <span className="text-xs font-semibold text-green-600">
                Save {discountPercentage}%
              </span>
            )}
          </div>
        </CardContent>

        {/* Footer - Add to Cart / Quantity Selector */}
        <CardFooter className="p-0 pt-4 flex-shrink-0">
          {renderAddToCartSection()}
        </CardFooter>

        {/* Notification */}
        <AnimatePresence>
          {renderNotification()}
        </AnimatePresence>
        <NotifyMeDialog
          isOpen={showNotifyDialog}
          onClose={() => setShowNotifyDialog(false)}
          productName={product.name}
          onSubmit={(email) => {
            console.log(`Notify request for ${product.name} from ${email}`);
            // Here you would typically call your API
          }}
        />
      </Card>
    </motion.div>
  );
};

export default FeaturedCard;
