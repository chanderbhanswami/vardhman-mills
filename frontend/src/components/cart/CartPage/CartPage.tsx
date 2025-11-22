'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ShoppingCartIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  TruckIcon,
  HeartIcon,
  TagIcon,
  SparklesIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { CartItemList } from './CartItemList';
import { CartSummary } from './CartSummary';
import { CartSidebar } from './CartSidebar';
import { EmptyCart } from './EmptyCart';
import { CouponCode } from './CouponCode';
import { ShippingCalculator } from './ShippingCalculator';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { toast } from 'react-hot-toast';
import type { CartItem, AppliedCoupon, ShippingMethod } from '@/types/cart.types';
import type { Address } from '@/types/common.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CartPageProps {
  /**
   * Initial cart items
   */
  initialItems?: CartItem[];

  /**
   * Show sidebar
   */
  showSidebar?: boolean;

  /**
   * Show recommendations
   */
  showRecommendations?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

interface CartState {
  items: CartItem[];
  appliedCoupons: AppliedCoupon[];
  shippingAddress?: Address;
  selectedShippingMethod?: ShippingMethod;
  isLoading: boolean;
  isSyncing: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TRUST_BADGES = [
  {
    icon: ShieldCheckIcon,
    title: 'Secure Payment',
    description: '100% secure transactions',
  },
  {
    icon: TruckIcon,
    title: 'Free Shipping',
    description: 'On orders over ₹500',
  },
  {
    icon: HeartIcon,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    icon: TagIcon,
    title: 'Best Prices',
    description: 'Price match guarantee',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CartPage: React.FC<CartPageProps> = ({
  initialItems = [],
  showSidebar = true,
  showRecommendations = true,
  className,
}) => {
  const router = useRouter();

  // State
  const [cartState, setCartState] = useState<CartState>({
    items: initialItems,
    appliedCoupons: [],
    isLoading: true,
    isSyncing: false,
  });

  const [showCouponSection, setShowCouponSection] = useState(false);
  const [showShippingCalculator, setShowShippingCalculator] = useState(false);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);

  // Load cart data on mount
  useEffect(() => {
    loadCartData();
  }, []);

  // Auto-save cart changes
  useEffect(() => {
    if (!cartState.isLoading && cartState.items.length > 0) {
      saveCartToStorage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartState.items, cartState.appliedCoupons]);

  // Handlers
  const loadCartData = async () => {
    setCartState(prev => ({ ...prev, isLoading: true }));

    try {
      // Load from localStorage first
      const savedCart = localStorage.getItem('cart');
      const savedCoupons = localStorage.getItem('cart_coupons');
      const savedForLaterItems = localStorage.getItem('cart_saved_for_later');

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartState(prev => ({
          ...prev,
          items: parsedCart,
        }));
      }

      if (savedCoupons) {
        const parsedCoupons = JSON.parse(savedCoupons);
        setCartState(prev => ({
          ...prev,
          appliedCoupons: parsedCoupons,
        }));
      }

      if (savedForLaterItems) {
        setSavedForLater(JSON.parse(savedForLaterItems));
      }

      // Fetch from API if user is logged in
      // This would be your actual API call
      // const response = await fetch('/api/cart');
      // const data = await response.json();
      // setCartState(prev => ({ ...prev, items: data.items }));

    } catch (error) {
      console.error('Failed to load cart:', error);
      toast.error('Failed to load cart data');
    } finally {
      setCartState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const saveCartToStorage = () => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartState.items));
      localStorage.setItem('cart_coupons', JSON.stringify(cartState.appliedCoupons));
      localStorage.setItem('cart_saved_for_later', JSON.stringify(savedForLater));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  };

  const handleQuantityChange = useCallback(async (itemId: string, quantity: number) => {
    setCartState(prev => ({ ...prev, isSyncing: true }));

    try {
      // Update locally
      setCartState(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId
            ? {
                ...item,
                quantity,
                totalPrice: {
                  ...item.totalPrice,
                  amount: item.unitPrice.amount * quantity,
                  formatted: formatCurrency(item.unitPrice.amount * quantity, item.unitPrice.currency)
                },
              }
            : item
        ),
      }));

      // Sync with API
      // await fetch(`/api/cart/items/${itemId}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ quantity }),
      // });
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity');
      // Revert on error
      loadCartData();
    } finally {
      setCartState(prev => ({ ...prev, isSyncing: false }));
    }
  }, []);

  const handleRemove = useCallback(async (itemId: string) => {
    setCartState(prev => ({ ...prev, isSyncing: true }));

    try {
      // Update locally
      setCartState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId),
      }));

      // Sync with API
      // await fetch(`/api/cart/items/${itemId}`, { method: 'DELETE' });

      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
      loadCartData();
    } finally {
      setCartState(prev => ({ ...prev, isSyncing: false }));
    }
  }, []);

  const handleMoveToWishlist = useCallback(async (itemId: string) => {
    const item = cartState.items.find(i => i.id === itemId);
    if (!item) return;

    try {
      // Add to wishlist API
      // await fetch('/api/wishlist', {
      //   method: 'POST',
      //   body: JSON.stringify({ productId: item.product.id }),
      // });

      // Remove from cart
      await handleRemove(itemId);
      
      toast.success('Moved to wishlist');
    } catch (error) {
      console.error('Failed to move to wishlist:', error);
      toast.error('Failed to move to wishlist');
    }
  }, [cartState.items, handleRemove]);

  const handleSaveForLater = useCallback(async (itemId: string) => {
    const item = cartState.items.find(i => i.id === itemId);
    if (!item) return;

    try {
      // Remove from cart
      setCartState(prev => ({
        ...prev,
        items: prev.items.filter(i => i.id !== itemId),
      }));

      // Add to saved for later
      setSavedForLater(prev => [...prev, item]);
      
      toast.success('Saved for later');
    } catch (error) {
      console.error('Failed to save for later:', error);
      toast.error('Failed to save for later');
    }
  }, [cartState.items]);

  const handleMoveBackToCart = useCallback((itemId: string) => {
    const item = savedForLater.find(i => i.id === itemId);
    if (!item) return;

    setSavedForLater(prev => prev.filter(i => i.id !== itemId));
    setCartState(prev => ({
      ...prev,
      items: [...prev.items, item],
    }));

    toast.success('Moved back to cart');
  }, [savedForLater]);

  const handleApplyCoupon = useCallback(async (code: string) => {
    // Simulate API call to validate and apply coupon
    const coupon: AppliedCoupon = {
      couponId: `coupon-${Date.now()}`,
      code: code.toUpperCase(),
      title: `${code} Discount`,
      discountType: 'fixed',
      discountAmount: {
        amount: 50,
        currency: 'INR',
        formatted: '₹50'
      },
      appliedTo: 'cart',
      appliedAt: new Date().toISOString()
    };

    setCartState(prev => ({
      ...prev,
      appliedCoupons: [...prev.appliedCoupons, coupon],
    }));

    toast.success(`Coupon "${code}" applied successfully!`);
  }, []);

  const handleRemoveCoupon = useCallback(async (couponId: string) => {
    setCartState(prev => ({
      ...prev,
      appliedCoupons: prev.appliedCoupons.filter(c => c.couponId !== couponId),
    }));

    toast.success('Coupon removed');
  }, []);

  const handleShippingMethodSelect = useCallback((method: ShippingMethod) => {
    setCartState(prev => ({
      ...prev,
      selectedShippingMethod: method,
    }));

    toast.success(`Shipping method selected: ${method.name}`);
  }, []);

  const handleCheckout = useCallback(() => {
    if (cartState.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Navigate to checkout
    router.push('/checkout');
  }, [cartState.items, router]);

  const handleContinueShopping = useCallback(() => {
    router.push('/products');
  }, [router]);

  // Render empty state
  if (!cartState.isLoading && cartState.items.length === 0 && savedForLater.length === 0) {
    return (
      <div className={cn('container mx-auto px-4 py-8', className)}>
        <EmptyCart 
          onContinueShopping={handleContinueShopping}
          showRecommendations={showRecommendations}
        />
      </div>
    );
  }

  // Main render
  return (
    <div className={cn('min-h-screen bg-gray-50 py-8', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleContinueShopping}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Continue Shopping
              </Button>
            </div>
            <Badge variant="default" size="lg" className="flex items-center gap-2">
              <ShoppingCartIcon className="h-5 w-5" />
              {cartState.items.length} {cartState.items.length === 1 ? 'Item' : 'Items'}
            </Badge>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            Shopping Cart
            <SparklesIcon className="h-8 w-8 text-yellow-500" />
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            Review your items and proceed to checkout
            <Tooltip content="Check all items carefully before checkout">
              <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
            </Tooltip>
          </p>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {TRUST_BADGES.map((badge, index) => (
            <Card key={index} className="p-4 text-center">
              <badge.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {badge.title}
              </h3>
              <p className="text-xs text-gray-600">{badge.description}</p>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Cart */}
            <div>
              <CartItemList
                items={cartState.items}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
                onMoveToWishlist={handleMoveToWishlist}
                onSaveForLater={handleSaveForLater}
                showFilters={true}
                showSorting={true}
                showSearch={true}
                showBulkActions={true}
                showItemDetails={true}
                isLoading={cartState.isLoading}
              />
            </div>

            {/* Saved for Later */}
            <AnimatePresence>
              {savedForLater.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <HeartIcon className="h-5 w-5 text-gray-400" />
                      Saved for Later ({savedForLater.length})
                    </h2>
                    <div className="space-y-4">
                      {savedForLater.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded" />
                            <div>
                              <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                              <p className="text-sm text-gray-600">{item.unitPrice.formatted}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleMoveBackToCart(item.id)}
                          >
                            Move to Cart
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Coupon Section */}
            <Card className="p-6">
              <button
                type="button"
                onClick={() => setShowCouponSection(!showCouponSection)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <TagIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Apply Coupon Code
                  </h3>
                  {cartState.appliedCoupons.length > 0 && (
                    <Badge variant="default" size="sm">
                      {cartState.appliedCoupons.length} applied
                    </Badge>
                  )}
                </div>
                <motion.div
                  animate={{ rotate: showCouponSection ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ▼
                </motion.div>
              </button>

              <AnimatePresence>
                {showCouponSection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4">
                      <CouponCode
                        subtotal={cartState.items.reduce((sum, item) => sum + item.totalPrice.amount, 0)}
                        appliedCoupons={cartState.appliedCoupons}
                        onApplyCoupon={handleApplyCoupon}
                        onRemoveCoupon={handleRemoveCoupon}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Shipping Calculator */}
            <Card className="p-6">
              <button
                type="button"
                onClick={() => setShowShippingCalculator(!showShippingCalculator)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <TruckIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Estimate Shipping
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: showShippingCalculator ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ▼
                </motion.div>
              </button>

              <AnimatePresence>
                {showShippingCalculator && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4">
                      <ShippingCalculator
                        subtotal={cartState.items.reduce((sum, item) => sum + item.totalPrice.amount, 0)}
                        selectedMethod={cartState.selectedShippingMethod}
                        onSelectMethod={handleShippingMethodSelect}
                        freeShippingThreshold={500}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Sidebar */}
          {showSidebar && (
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <CartSummary
                  items={cartState.items}
                  appliedCoupons={cartState.appliedCoupons}
                  selectedShippingMethod={cartState.selectedShippingMethod}
                  onCheckout={handleCheckout}
                  isProcessing={cartState.isSyncing}
                />

                <CartSidebar
                  items={cartState.items}
                  appliedCoupons={cartState.appliedCoupons}
                  selectedShippingMethod={cartState.selectedShippingMethod}
                  onCheckout={handleCheckout}
                  onContinueShopping={handleContinueShopping}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                  onSelectShippingMethod={handleShippingMethodSelect}
                  freeShippingThreshold={500}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
