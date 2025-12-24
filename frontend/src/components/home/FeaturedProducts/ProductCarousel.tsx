/**
 * ProductCarousel Component
 * 
 * Advanced touch-enabled carousel for displaying products with smooth animations,
 * drag support, auto-play, and responsive design.
 * 
 * Features:
 * - Touch and drag support
 * - Auto-play with pause on hover
 * - Navigation arrows
 * - Dot indicators with thumbnails
 * - Keyboard navigation
 * - Responsive breakpoints
 * - Infinite loop
 * - Swipe gestures
 * - Loading states
 * - Multiple items per view
 * - Gap between items
 * - Smooth transitions
 * - Cart and wishlist integration
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, PanInfo } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/utils';
import { FeaturedCard } from './FeaturedCard';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { toast } from 'react-hot-toast';
import type { Product } from '@/types/product.types';
import { QuickView } from '@/components/products/QuickView';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProductCarouselProps {
  /** Products to display */
  products: Product[];
  /** Auto-play interval in milliseconds */
  autoPlayInterval?: number;
  /** Enable auto-play */
  autoPlay?: boolean;
  /** Enable infinite loop */
  infiniteLoop?: boolean;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Show thumbnails in dots */
  showThumbnails?: boolean;
  /** Enable drag/swipe */
  enableDrag?: boolean;
  /** Items per view (responsive) */
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
    wide: number;
  };
  /** Gap between items in pixels */
  gap?: number;
  /** Transition duration in seconds */
  transitionDuration?: number;
  /** Carousel title */
  title?: string;
  /** Carousel subtitle */
  subtitle?: string;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On slide change callback */
  onSlideChange?: (index: number) => void;
  /** On product click callback */
  onProductClick?: (product: Product) => void;
}

interface CarouselState {
  currentIndex: number;
  isPlaying: boolean;
  isPausedByUser: boolean;
  isHovered: boolean;
  isDragging: boolean;
  direction: 'left' | 'right';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_ITEMS_PER_VIEW = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  wide: 4,
};

const DRAG_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 500;

// ============================================================================
// COMPONENT
// ============================================================================

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  autoPlayInterval = 5000,
  autoPlay = true,
  infiniteLoop = true,
  showArrows = true,
  showDots = true,
  showThumbnails = false,
  enableDrag = true,
  itemsPerView = DEFAULT_ITEMS_PER_VIEW,
  gap = 16,
  transitionDuration = 0.5,
  title,
  subtitle,
  loading = false,
  className,
  onSlideChange,
  onProductClick,
}) => {
  // Helper to get product ID (handles both id and _id from MongoDB)
  const getProductId = (product: Product): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return product.id || (product as any)._id || '';
  };

  // ============================================================================
  // HOOKS - Cart and Wishlist (using global providers)
  // ============================================================================

  const {
    items: cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const { isInWishlist, addToWishlist, removeFromWishlist, items: wishlistItems } = useWishlist();

  // QuickView state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Helper functions for cart state
  const hasCartItem = useCallback((productId: string): boolean => {
    return cartItems.some(item => item.productId === productId);
  }, [cartItems]);

  const getItemQuantity = useCallback((productId: string): number => {
    const item = cartItems.find(item => item.productId === productId);
    return item?.quantity || 0;
  }, [cartItems]);

  const getCartItemId = useCallback((productId: string): string | undefined => {
    const item = cartItems.find(item => item.productId === productId);
    return item?.id;
  }, [cartItems]);

  // Helper for wishlist
  const getWishlistItemId = useCallback((productId: string): string | undefined => {
    const item = wishlistItems.find(item => item.productId === productId);
    return item?.id;
  }, [wishlistItems]);

  // ============================================================================
  // CART HANDLERS (using provider)
  // ============================================================================

  const handleAddToCart = useCallback(async (product: Product, quantity: number) => {
    try {
      const productId = getProductId(product);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const variant = (product as any).variants?.[0];

      const result = await addToCart(productId, quantity, variant ? {
        color: variant.color,
        size: variant.size,
        material: variant.material,
      } : undefined);

      if (!result.success) {
        toast.error(result.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  }, [addToCart, getProductId]);

  const handleUpdateCartQuantity = useCallback(async (product: Product, quantity: number) => {
    const productId = getProductId(product);
    const itemId = getCartItemId(productId);
    if (itemId) {
      await updateQuantity(itemId, quantity);
    }
  }, [updateQuantity, getProductId, getCartItemId]);

  const handleRemoveFromCart = useCallback(async (product: Product) => {
    const productId = getProductId(product);
    const itemId = getCartItemId(productId);
    if (itemId) {
      await removeFromCart(itemId);
    }
  }, [removeFromCart, getProductId, getCartItemId]);

  // ============================================================================
  // WISHLIST HANDLERS (using provider)
  // ============================================================================

  const handleAddToWishlist = useCallback(async (product: Product) => {
    const productId = getProductId(product);
    await addToWishlist(productId);
  }, [addToWishlist, getProductId]);

  const handleRemoveFromWishlist = useCallback(async (product: Product) => {
    const productId = getProductId(product);
    const itemId = getWishlistItemId(productId);
    if (itemId) {
      await removeFromWishlist(itemId);
    }
  }, [removeFromWishlist, getProductId, getWishlistItemId]);

  // ============================================================================
  // STATE
  // ============================================================================

  const [state, setState] = useState<CarouselState>({
    currentIndex: 0,
    isPlaying: autoPlay,
    isPausedByUser: !autoPlay,
    isHovered: false,
    isDragging: false,
    direction: 'right',
  });

  const [currentItemsPerView, setCurrentItemsPerView] = useState(itemsPerView.desktop);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // RESPONSIVE ITEMS PER VIEW
  // ============================================================================

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCurrentItemsPerView(itemsPerView.mobile);
      } else if (width < 1024) {
        setCurrentItemsPerView(itemsPerView.tablet);
      } else if (width < 1536) {
        setCurrentItemsPerView(itemsPerView.desktop);
      } else {
        setCurrentItemsPerView(itemsPerView.wide);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerView]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totalSlides = useMemo(() => {
    return Math.ceil(products.length / currentItemsPerView);
  }, [products.length, currentItemsPerView]);

  const canGoNext = useMemo(() => {
    return infiniteLoop || state.currentIndex < totalSlides - 1;
  }, [infiniteLoop, state.currentIndex, totalSlides]);

  const canGoPrev = useMemo(() => {
    return infiniteLoop || state.currentIndex > 0;
  }, [infiniteLoop, state.currentIndex]);



  // ============================================================================
  // AUTO PLAY
  // ============================================================================

  const startAutoPlay = useCallback(() => {
    if (!autoPlay) return;

    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    autoPlayTimerRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev.isPlaying) return prev;

        const nextIndex = prev.currentIndex + 1;
        if (nextIndex >= totalSlides) {
          if (infiniteLoop) {
            return { ...prev, currentIndex: 0, direction: 'right' };
          } else {
            return { ...prev, isPlaying: false };
          }
        }
        return { ...prev, currentIndex: nextIndex, direction: 'right' };
      });
    }, autoPlayInterval);
  }, [autoPlay, autoPlayInterval, totalSlides, infiniteLoop]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state.isPlaying) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }

    return () => stopAutoPlay();
  }, [state.isPlaying, startAutoPlay, stopAutoPlay]);

  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================

  const goToSlide = useCallback(
    (index: number) => {
      const normalizedIndex = Math.max(0, Math.min(index, totalSlides - 1));

      setState((prev) => ({
        ...prev,
        currentIndex: normalizedIndex,
        direction: normalizedIndex > prev.currentIndex ? 'right' : 'left',
      }));

      onSlideChange?.(normalizedIndex);
    },
    [totalSlides, onSlideChange]
  );

  const goToNext = useCallback(() => {
    if (!canGoNext) return;

    setState((prev) => {
      const nextIndex = prev.currentIndex + 1;
      const newIndex = nextIndex >= totalSlides ? 0 : nextIndex;

      onSlideChange?.(newIndex);

      return {
        ...prev,
        currentIndex: newIndex,
        direction: 'right',
      };
    });
  }, [canGoNext, totalSlides, onSlideChange]);

  const goToPrev = useCallback(() => {
    if (!canGoPrev) return;

    setState((prev) => {
      const prevIndex = prev.currentIndex - 1;
      const newIndex = prevIndex < 0 ? totalSlides - 1 : prevIndex;

      onSlideChange?.(newIndex);

      return {
        ...prev,
        currentIndex: newIndex,
        direction: 'left',
      };
    });
  }, [canGoPrev, totalSlides, onSlideChange]);

  const togglePlayPause = useCallback(() => {
    setState((prev) => {
      const newPausedByUser = !prev.isPausedByUser;
      return {
        ...prev,
        isPausedByUser: newPausedByUser,
        isPlaying: !newPausedByUser && !prev.isHovered,
      };
    });
  }, []);

  // ============================================================================
  // DRAG HANDLERS
  // ============================================================================

  const handleDragStart = useCallback(() => {
    setState((prev) => ({ ...prev, isDragging: true }));
    stopAutoPlay();
  }, [stopAutoPlay]);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setState((prev) => ({ ...prev, isDragging: false }));

      const offset = info.offset.x;
      const velocity = info.velocity.x;

      // Check if drag threshold or velocity threshold is met
      if (Math.abs(offset) > DRAG_THRESHOLD || Math.abs(velocity) > SWIPE_VELOCITY_THRESHOLD) {
        if (offset > 0) {
          goToPrev();
        } else {
          goToNext();
        }
      }

      if (state.isPlaying) {
        startAutoPlay();
      }
    },
    [goToNext, goToPrev, state.isPlaying, startAutoPlay]
  );

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, togglePlayPause]);

  // ============================================================================
  // RENDER
  // ============================================================================

  // Calculate translateX for carousel sliding
  const translateX = -(state.currentIndex * 100);

  if (loading) {
    return (
      <div className={cn('relative', className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(currentItemsPerView)].map((_, index) => (
            <FeaturedCard key={index} product={{} as Product} loading={true} />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={cn('relative text-center py-12', className)}>
        <p className="text-gray-500">No products to display</p>
      </div>
    );
  }

  return (
    <div
      className={cn('relative', className)}
      ref={carouselRef}
    >
      {/* Main Carousel Wrapper */}
      <div className="overflow-hidden py-4">
        <motion.div
          className="flex"
          drag={enableDrag ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.9}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          animate={{
            x: `${translateX}%`,
          }}
          transition={{
            type: 'tween',
            ease: [0.25, 0.1, 0.25, 1],
            duration: 0.5,
          }}
          style={{
            cursor: state.isDragging ? 'grabbing' : enableDrag ? 'grab' : 'default',
          }}
        >
          {products.map((product) => {
            if (!product) return null;
            const widthPercent = 100 / currentItemsPerView;
            const gapHalf = gap / 2;
            const itemStyle = {
              width: `${widthPercent}%`,
              paddingLeft: `${gapHalf}px`,
              paddingRight: `${gapHalf}px`,
            };
            return (
              <div
                key={getProductId(product) || `product-${Math.random()}`}
                className="flex-shrink-0"
                style={itemStyle}
                onMouseEnter={() => setState(prev => ({ ...prev, isHovered: true, isPlaying: false }))}
                onMouseLeave={() => setState(prev => ({ ...prev, isHovered: false, isPlaying: !prev.isPausedByUser }))}
              >
                <FeaturedCard
                  product={product}
                  isInCart={hasCartItem(getProductId(product))}
                  cartQuantity={getItemQuantity(getProductId(product))}
                  isInWishlist={isInWishlist(getProductId(product))}
                  onAddToCart={handleAddToCart}
                  onUpdateCartQuantity={handleUpdateCartQuantity}
                  onRemoveFromCart={handleRemoveFromCart}
                  onAddToWishlist={handleAddToWishlist}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                  onQuickView={(p) => {
                    console.log('🔍 ProductCarousel: QuickView clicked for:', p.name);
                    setQuickViewProduct(p);
                    setIsQuickViewOpen(true);
                    onProductClick?.(p);
                  }}
                  onShare={(p) => {
                    const url = `${window.location.origin}/products/${p.slug}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Product link copied!');
                  }}
                  onCompare={(p) => {
                    toast.success(`${p.name} added to compare list`);
                  }}
                />
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Controls Bar - Bottom Right */}
      {products.length > currentItemsPerView && (
        <div className="relative flex items-center justify-end gap-6 mt-6">

          {/* Pagination Dots & Play/Pause (Grouped) */}
          {showDots && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
              {/* Play/Pause Button */}
              {autoPlay && (
                <button
                  onClick={togglePlayPause}
                  className="w-8 h-8 p-0 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label={!state.isPlaying ? 'Play auto-scroll' : 'Pause auto-scroll'}
                >
                  {!state.isPlaying ? (
                    <PlayIcon className="w-4 h-4" />
                  ) : (
                    <PauseIcon className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Dots */}
              <div className="flex items-center gap-2">
                {[...Array(totalSlides)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      'transition-all duration-200',
                      'rounded-full',
                      state.currentIndex === index
                        ? 'w-8 h-2 bg-primary-600'
                        : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Navigation Arrows */}
          {showArrows && (
            <div className="flex items-center gap-3 z-10">
              <button
                onClick={goToPrev}
                disabled={!canGoPrev}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'border border-gray-200 shadow-sm',
                  'hover:border-primary-500 hover:text-primary-600 hover:shadow-md',
                  'transition-all duration-200',
                  canGoPrev
                    ? 'text-gray-700 cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed opacity-50'
                )}
                aria-label="Previous slide"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                disabled={!canGoNext}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'border border-gray-200 shadow-sm',
                  'hover:border-primary-500 hover:text-primary-600 hover:shadow-md',
                  'transition-all duration-200',
                  canGoNext
                    ? 'text-gray-700 cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed opacity-50'
                )}
                aria-label="Next slide"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}



      {/* Accessibility */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Showing slide {state.currentIndex + 1} of {totalSlides}
      </div>

      {/* QuickView Modal */}
      <QuickView
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setQuickViewProduct(null);
        }}
      />
    </div>
  );
};

export default ProductCarousel;

