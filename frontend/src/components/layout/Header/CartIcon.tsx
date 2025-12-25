'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBagIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  CreditCardIcon,
  TruckIcon,
  HeartIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { ShoppingBagIcon as ShoppingBagSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { XCircleIcon } from '@heroicons/react/24/solid';

export interface CartIconProps {
  className?: string;
  showDropdown?: boolean;
  badgeVariant?: 'default' | 'pill' | 'dot';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

interface CartItem {
  id: string;
  productId?: string; // The actual product ID (different from cart line item id)
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  color?: string;
  size?: string;
  fabric?: string;
  inStock: boolean;
  maxQuantity: number;
  category: string;
  brand: string;
  discount?: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
}

const CartIcon: React.FC<CartIconProps> = ({
  className = '',
  showDropdown = true,
  badgeVariant = 'default',
  size = 'md',
  animate = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartState, setCartState] = useState<CartState>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isLoading: false,
    error: null,
    lastUpdated: new Date().toISOString(),
  });
  const [animateCart, setAnimateCart] = useState(false);
  const [wishlistItemIds, setWishlistItemIds] = useState<Set<string>>(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Sync wishlist item IDs from localStorage
  useEffect(() => {
    const loadWishlistIds = () => {
      try {
        const stored = localStorage.getItem('vardhman_wishlist');
        if (stored) {
          const parsed = JSON.parse(stored);
          const ids = new Set<string>(parsed.map((item: { productId: string }) => item.productId));
          setWishlistItemIds(ids);
        } else {
          setWishlistItemIds(new Set());
        }
      } catch {
        setWishlistItemIds(new Set());
      }
    };

    loadWishlistIds();

    const handleStorageChange = () => loadWishlistIds();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync cart from localStorage
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        const stored = localStorage.getItem('vardhman_cart');
        if (stored) {
          const parsedCart = JSON.parse(stored);

          // Handle both formats:
          // 1. CartProvider saves directly as array: [{...}, {...}]
          // 2. CartIcon saves as object: { items: [...], summary: {...} }
          let rawItems: unknown[];
          if (Array.isArray(parsedCart)) {
            rawItems = parsedCart;
          } else if (parsedCart && Array.isArray(parsedCart.items)) {
            rawItems = parsedCart.items;
          } else {
            rawItems = [];
          }

          const items: CartItem[] = rawItems.map((item: {
            id: string;
            productId?: string;
            title?: string;
            name?: string;
            image?: string;
            product?: { id?: string; name?: string; image?: string; category?: string; brand?: string; inStock?: boolean; maxQuantity?: number };
            price: number;
            originalPrice?: number;
            quantity: number;
            color?: string;
            size?: string;
            fabric?: string;
            variant?: { color?: string; size?: string; material?: string; attributes?: { color?: string; size?: string; fabric?: string } };
            discount?: number;
            addedAt?: string;
          }) => ({
            id: item.id,
            productId: item.productId || item.product?.id || item.id,
            name: item.title || item.name || item.product?.name || 'Product',
            image: item.image || item.product?.image || '',
            price: item.price || 0,
            originalPrice: item.originalPrice,
            quantity: item.quantity || 1,
            color: item.color || item.variant?.color || item.variant?.attributes?.color || '',
            size: item.size || item.variant?.size || item.variant?.attributes?.size || '',
            fabric: item.fabric || item.variant?.material || item.variant?.attributes?.fabric || '',
            inStock: item.product?.inStock !== false,
            maxQuantity: item.product?.maxQuantity || 99,
            category: item.product?.category || '',
            brand: item.product?.brand || '',
            discount: item.discount,
          }));

          const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

          setCartState({
            items,
            totalItems,
            totalPrice,
            isLoading: false,
            error: null,
            lastUpdated: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    };

    // Load on mount
    loadCartFromStorage();

    // Listen for storage events (from other tabs/components)
    const handleStorageChange = () => {
      loadCartFromStorage();
    };

    // Listen for both storage event and custom cart update event
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('vardhman_cart_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('vardhman_cart_updated', handleStorageChange);
    };
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-cart-dropdown]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Animate cart when items change
  useEffect(() => {
    if (animate) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartState.totalItems, animate]);

  // Helper to save cart to localStorage
  const saveCartToStorage = (items: CartItem[]) => {
    try {
      const cartData = {
        items: items.map(item => ({
          id: item.id,
          productId: item.productId || item.id, // Preserve actual product ID
          product: {
            id: item.productId || item.id, // Also save in nested product
            name: item.name,
            image: item.image,
            category: item.category,
            brand: item.brand,
            inStock: item.inStock,
            maxQuantity: item.maxQuantity,
          },
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          discount: item.discount,
          color: item.color,
          size: item.size,
          fabric: item.fabric,
          variant: item.color || item.size || item.fabric ? {
            attributes: { color: item.color, size: item.size, fabric: item.fabric }
          } : undefined,
        })),
        summary: {
          itemCount: items.length,
          totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        },
      };
      localStorage.setItem('vardhman_cart', JSON.stringify(cartData));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setCartState(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.id === itemId) {
          const updatedQuantity = Math.min(Math.max(0, newQuantity), item.maxQuantity);
          return { ...item, quantity: updatedQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);

      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Save to localStorage
      saveCartToStorage(updatedItems);

      return {
        ...prev,
        items: updatedItems,
        totalItems,
        totalPrice,
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const removeItem = (itemId: string) => {
    setCartState(prev => {
      const updatedItems = prev.items.filter(item => item.id !== itemId);

      // Save to localStorage
      saveCartToStorage(updatedItems);

      return {
        ...prev,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const toggleWishlist = (itemId: string) => {
    // Toggle item in wishlist
    const item = cartState.items.find(i => i.id === itemId);
    if (!item) return;

    // Use the actual product ID, not the cart item ID
    const productId = item.productId || itemId;

    const currentWishlist = JSON.parse(localStorage.getItem('vardhman_wishlist') || '[]');
    const isInWishlist = currentWishlist.some((w: { productId: string }) => w.productId === productId);

    if (isInWishlist) {
      // Remove from wishlist
      const filtered = currentWishlist.filter((w: { productId: string }) => w.productId !== productId);
      localStorage.setItem('vardhman_wishlist', JSON.stringify(filtered));
    } else {
      // Add to wishlist with full product data
      currentWishlist.push({
        id: `wishlist_${Date.now()}`,
        productId: productId,
        product: {
          id: productId,
          name: item.name,
          slug: item.name.toLowerCase().replace(/\s+/g, '-'),
          price: item.originalPrice || item.price,
          salePrice: item.originalPrice ? item.price : undefined,
          image: item.image,
          inStock: item.inStock,
          brand: item.brand || 'Vardhman',
          category: item.category || 'Fabric',
        },
        addedAt: new Date().toISOString(),
      });
      localStorage.setItem('vardhman_wishlist', JSON.stringify(currentWishlist));
    }
    window.dispatchEvent(new Event('storage'));
  };

  const clearCart = () => {
    setCartState({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isLoading: false,
      error: null,
      lastUpdated: new Date().toISOString(),
    });
    localStorage.removeItem('vardhman_cart');
    window.dispatchEvent(new Event('storage'));
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const badgeClasses = {
    default: 'px-1.5 py-0.5 text-xs font-bold',
    pill: 'px-2 py-1 text-xs font-semibold rounded-full',
    dot: 'w-2 h-2 rounded-full',
  };

  const cartVariants = {
    idle: { scale: 1, rotate: 0 },
    bounce: {
      scale: [1, 1.2, 1],
      rotate: [0, -10, 10, 0],
      transition: { duration: 0.3 }
    },
    shake: {
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.4 }
    }
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.15 }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.15 } }
  };

  return (
    <div className={`relative ${className}`} data-cart-dropdown>
      {/* Cart Icon Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2 text-gray-900 hover:text-primary
          transition-colors duration-200 rounded-lg hover:bg-gray-100
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        `}
        variants={cartVariants}
        animate={animateCart ? 'bounce' : 'idle'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Shopping Cart"
        aria-expanded={isOpen}
      >
        {cartState.totalItems > 0 ? (
          <ShoppingBagSolidIcon className={`${iconSizeClasses[size]} text-primary`} />
        ) : (
          <ShoppingBagIcon className={iconSizeClasses[size]} />
        )}

        {/* Cart Badge */}
        {cartState.totalItems > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`
              absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-5 h-5
              flex items-center justify-center ${badgeClasses[badgeVariant]}
              ${badgeVariant === 'dot' ? 'border-2 border-white' : ''}
            `}
          >
            {badgeVariant !== 'dot' && (
              <span className="text-xs font-bold">
                {cartState.totalItems > 99 ? '99+' : cartState.totalItems}
              </span>
            )}
          </motion.span>
        )}
      </motion.button>

      {/* Cart Dropdown */}
      {showDropdown && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Shopping Cart
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label="Close cart"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                {cartState.totalItems > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-600">
                      {cartState.totalItems} {cartState.totalItems === 1 ? 'item' : 'items'} in cart
                    </p>
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="max-h-96 overflow-y-auto">
                {cartState.items.length === 0 ? (
                  <div className="p-8 text-center">
                    <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Your cart is empty</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Add some fabric to get started
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Shop Now
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 divide-y divide-gray-100">
                    <AnimatePresence>
                      {cartState.items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={`
                            flex items-start space-x-3 p-3 rounded-lg border
                            ${index > 0 ? 'mt-3' : ''}
                            ${item.inStock
                              ? 'border-gray-200 bg-white shadow-sm'
                              : 'border-red-200 bg-red-50'
                            }
                          `}
                        >
                          {/* Product Image */}
                          <div className="flex-shrink-0 relative">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {item.brand.charAt(0)}
                                </span>
                              </div>
                            </div>
                            {!item.inStock && (
                              <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </h4>

                            {/* Brand and Category */}
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.brand && item.brand.length < 30 && <span>{item.brand}</span>}
                              {item.brand && item.brand.length < 30 && item.category && <span> • </span>}
                              {item.category && <span>{item.category}</span>}
                            </div>

                            {/* Color, Size, Fabric */}
                            {(item.color || item.size || item.fabric) && (
                              <div className="text-xs text-gray-400 mt-0.5 flex flex-wrap gap-1">
                                {item.color && <span>{item.color}</span>}
                                {item.color && (item.size || item.fabric) && <span>|</span>}
                                {item.size && <span>{item.size}</span>}
                                {item.size && item.fabric && <span>|</span>}
                                {item.fabric && <span>{item.fabric}</span>}
                              </div>
                            )}

                            {!item.inStock && (
                              <div className="text-xs text-red-600 font-medium mt-1">
                                Out of Stock
                              </div>
                            )}

                            {/* Price Row */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm font-bold text-gray-900">
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{(item.originalPrice * item.quantity).toLocaleString('en-IN')}
                                </span>
                              )}
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">
                                  {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                                </span>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <MinusIcon className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-semibold min-w-[24px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.maxQuantity || !item.inStock}
                                className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <PlusIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => toggleWishlist(item.id)}
                              className={`p-1 transition-colors ${wishlistItemIds.has(item.productId || item.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                              aria-label={wishlistItemIds.has(item.productId || item.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                              {wishlistItemIds.has(item.productId || item.id) ? (
                                <HeartSolidIcon className="w-4 h-4" />
                              ) : (
                                <HeartIcon className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="Remove item"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartState.items.length > 0 && (() => {
                // Calculate totals
                const totalRegularPrice = cartState.items.reduce((sum, item) =>
                  sum + ((item.originalPrice || item.price) * item.quantity), 0);
                const totalSalePrice = cartState.items.reduce((sum, item) =>
                  sum + (item.price * item.quantity), 0);
                const totalDiscount = totalRegularPrice - totalSalePrice;
                const discountPercent = totalRegularPrice > 0
                  ? Math.round((totalDiscount / totalRegularPrice) * 100) : 0;
                const shippingCost = totalSalePrice >= 999 ? 0 : 99;

                return (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    {/* Totals */}
                    <div className="space-y-2 mb-5">
                      {/* Regular Price (MRP) */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Price ({cartState.totalItems} item{cartState.totalItems > 1 ? 's' : ''}):</span>
                        <span className="text-gray-900">
                          ₹{totalRegularPrice.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Discount */}
                      {totalDiscount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Discount:</span>
                          <span className="text-green-600 font-medium">
                            -₹{totalDiscount.toLocaleString('en-IN')} ({discountPercent}% OFF)
                          </span>
                        </div>
                      )}

                      {/* Shipping */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Shipping:</span>
                        <span className="flex items-center gap-2">
                          {shippingCost > 0 ? (
                            <span className="text-gray-900">₹{shippingCost}</span>
                          ) : (
                            <>
                              <span className="text-gray-400 line-through text-xs">₹99</span>
                              <span className="text-green-600 font-semibold">FREE</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Total */}
                      <div className="border-t border-gray-300 pt-3 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total:</span>
                          <div className="text-right">
                            <div className="font-bold text-xl text-gray-900">
                              ₹{(totalSalePrice + shippingCost).toLocaleString('en-IN')}
                            </div>
                            {totalDiscount > 0 && (
                              <div className="text-xs text-green-600 font-medium">
                                You save ₹{totalDiscount.toLocaleString('en-IN')}!
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/cart"
                        className="w-full bg-white border-2 border-gray-300 text-gray-900 py-3 px-4 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors text-center block"
                        onClick={() => setIsOpen(false)}
                      >
                        View Cart
                      </Link>
                      <Link
                        href="/checkout"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white py-3 px-4 rounded-lg text-sm font-bold transition-colors flex items-center justify-center shadow-md"
                        onClick={() => setIsOpen(false)}
                      >
                        <CreditCardIcon className="w-5 h-5 mr-2" />
                        Proceed to Checkout
                      </Link>
                    </div>

                    {/* Free Shipping Notice */}
                    {totalSalePrice < 999 && (
                      <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center text-xs text-amber-700">
                        <TruckIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Add ₹{(999 - totalSalePrice).toLocaleString('en-IN')} more for <strong>FREE shipping</strong></span>
                      </div>
                    )}
                    {totalSalePrice >= 999 && (
                      <div className="mt-3 flex items-center justify-center text-xs text-green-600 font-medium">
                        <TruckIcon className="w-4 h-4 mr-1" />
                        <span>🎉 You qualify for FREE shipping!</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Clear Cart Confirmation Dialog - Portal to document.body */}
      {showClearConfirm && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          />
          {/* Dialog */}
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 max-w-sm w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <XCircleIcon className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Clear Shopping Cart
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to remove all {cartState.totalItems} {cartState.totalItems === 1 ? 'item' : 'items'} from your cart? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Keep Items
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CartIcon;