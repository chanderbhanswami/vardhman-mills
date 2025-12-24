'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types/product.types';
import { FeaturedCard } from '@/components/home/FeaturedProducts/FeaturedCard';
import { ProductGridSkeleton } from './ProductGridSkeleton';
import { ProductList } from './ProductList';
import { QuickView } from '@/components/products/QuickView';
import { Grid, List, LayoutGrid, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';

export type GridLayout = 'grid' | 'list' | 'compact' | 'masonry';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  className?: string;
  layout?: GridLayout;
  onLayoutChange?: (layout: GridLayout) => void;
  showLayoutSwitcher?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  animateItems?: boolean;
  enableQuickView?: boolean;
  showQuickView?: boolean;
  showBadges?: boolean;
  showRating?: boolean;
  showActions?: boolean;
  priority?: boolean;
  emptyState?: React.ReactNode;
  onProductClick?: (product: Product) => void;
}

const gridColumns = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
};

const gapSizes = {
  sm: 'gap-3',
  md: 'gap-4 md:gap-6',
  lg: 'gap-6 md:gap-8',
};

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  className,
  layout: controlledLayout,
  onLayoutChange,
  showLayoutSwitcher = true,
  columns = 4,
  gap = 'md',
  animateItems = true,
  enableQuickView: propEnableQuickView = true,
  showQuickView,
  showBadges = true,
  showRating = true,
  showActions = true,
  priority = false,
  emptyState,
  onProductClick,
}) => {
  const enableQuickView = showQuickView !== undefined ? showQuickView : propEnableQuickView;
  const [internalLayout, setInternalLayout] = useState<GridLayout>('grid');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Use global cart and wishlist providers
  const { items: cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const { items: wishlistItems, isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const layout = controlledLayout ?? internalLayout;

  // Helper to get product ID
  const getProductId = (product: Product): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return product.id || (product as any)._id || '';
  };

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

  const handleLayoutChange = useCallback(
    (newLayout: GridLayout) => {
      if (onLayoutChange) {
        onLayoutChange(newLayout);
      } else {
        setInternalLayout(newLayout);
      }
    },
    [onLayoutChange]
  );

  const handleQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  }, []);

  const handleCloseQuickView = useCallback(() => {
    setIsQuickViewOpen(false);
    setTimeout(() => setQuickViewProduct(null), 300);
  }, []);

  const handleProductClick = useCallback(
    (product: Product) => {
      if (onProductClick) {
        onProductClick(product);
      }
    },
    [onProductClick]
  );

  // Handle add to cart using provider
  const handleAddToCart = useCallback(async (product: Product, quantity: number) => {
    try {
      const productId = getProductId(product);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const variant = (product as any).variants?.[0];

      await addToCart(productId, quantity, variant ? {
        color: variant.color,
        size: variant.size,
        material: variant.material,
      } : undefined);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }, [addToCart]);

  // Handle update cart quantity using provider
  const handleUpdateCartQuantity = useCallback(async (product: Product, quantity: number) => {
    const productId = getProductId(product);
    const itemId = getCartItemId(productId);
    if (itemId) {
      await updateQuantity(itemId, quantity);
    }
  }, [updateQuantity, getCartItemId]);

  // Handle remove from cart using provider
  const handleRemoveFromCart = useCallback(async (product: Product) => {
    const productId = getProductId(product);
    const itemId = getCartItemId(productId);
    if (itemId) {
      await removeFromCart(itemId);
    }
  }, [removeFromCart, getCartItemId]);

  // Handle wishlist toggle using provider
  const handleToggleWishlist = useCallback(async (product: Product) => {
    const productId = getProductId(product);
    if (isInWishlist(productId)) {
      const itemId = getWishlistItemId(productId);
      if (itemId) {
        await removeFromWishlist(itemId);
      }
    } else {
      await addToWishlist(productId);
    }
  }, [addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemId]);

  // Save layout preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !controlledLayout) {
      const savedLayout = localStorage.getItem('productGridLayout') as GridLayout;
      if (savedLayout) {
        setInternalLayout(savedLayout);
      }
    }
  }, [controlledLayout]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !controlledLayout) {
      localStorage.setItem('productGridLayout', internalLayout);
    }
  }, [internalLayout, controlledLayout]);

  if (isLoading) {
    return <ProductGridSkeleton layout={layout} columns={columns} gap={gap} />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="w-full">
        {emptyState || (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Layers className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500 text-center max-w-md">
              We couldn&apos;t find any products matching your criteria. Try adjusting your filters
              or search terms.
            </p>
          </div>
        )}
      </div>
    );
  }

  const layoutButtons = [
    { value: 'grid' as GridLayout, icon: LayoutGrid, label: 'Grid View' },
    { value: 'list' as GridLayout, icon: List, label: 'List View' },
    { value: 'compact' as GridLayout, icon: Grid, label: 'Compact View' },
  ];

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Layout Switcher */}
      {showLayoutSwitcher && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-gray-600 mr-2">View:</span>
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            {layoutButtons.map((btn) => (
              <Tooltip key={btn.value} content={btn.label}>
                <Button
                  variant={layout === btn.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleLayoutChange(btn.value)}
                  className={cn(
                    'w-9 h-9 p-0',
                    layout === btn.value ? 'shadow-sm' : 'hover:bg-white'
                  )}
                  aria-label={btn.label}
                >
                  <btn.icon className="w-4 h-4" />
                </Button>
              </Tooltip>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {layout === 'list' ? (
        <ProductList
          products={products}
          showBadges={showBadges}
          showRating={showRating}
          showActions={showActions}
          onQuickView={enableQuickView ? handleQuickView : undefined}
          onProductClick={handleProductClick}
          animateItems={animateItems}
        />
      ) : (
        <div
          className={cn(
            'grid w-full',
            gridColumns[columns],
            gapSizes[gap],
            layout === 'compact' && 'gap-3'
          )}
        >
          <AnimatePresence mode="popLayout">
            {products.map((product, index) => {
              const productId = getProductId(product);
              return (
                <motion.div
                  key={`product-grid-${productId || index}-${index}`}
                  initial={animateItems ? { opacity: 0, y: 20 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 0.3,
                    delay: animateItems ? index * 0.05 : 0,
                    ease: 'easeOut',
                  }}
                  layout={animateItems}
                >
                  <FeaturedCard
                    product={product}
                    showQuickView={enableQuickView}
                    showWishlist={true}
                    showAddToCart={true}
                    showShare={true}
                    showCompare={true}
                    showRating={showRating}
                    showColorSwatches={true}
                    enableImageZoom={true}
                    isInWishlist={isInWishlist(productId)}
                    isInCart={hasCartItem(productId)}
                    cartQuantity={getItemQuantity(productId)}
                    onAddToCart={handleAddToCart}
                    onUpdateCartQuantity={handleUpdateCartQuantity}
                    onRemoveFromCart={handleRemoveFromCart}
                    onAddToWishlist={() => handleToggleWishlist(product)}
                    onRemoveFromWishlist={() => handleToggleWishlist(product)}
                    onQuickView={enableQuickView ? handleQuickView : undefined}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Products Count */}
      <div className="flex items-center justify-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{products.length}</span>{' '}
          {products.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      {/* Quick View Modal */}
      {enableQuickView && quickViewProduct && (
        <QuickView
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={handleCloseQuickView}
        />
      )}
    </div>
  );
};

export default ProductGrid;