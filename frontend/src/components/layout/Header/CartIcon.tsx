'use client';

import React, { useState, useEffect } from 'react';
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
import { ShoppingBagIcon as ShoppingBagSolidIcon } from '@heroicons/react/24/solid';

export interface CartIconProps {
  className?: string;
  showDropdown?: boolean;
  badgeVariant?: 'default' | 'pill' | 'dot';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

interface CartItem {
  id: string;
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

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setCartState(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedQuantity = Math.min(Math.max(0, newQuantity), item.maxQuantity);
          return { ...item, quantity: updatedQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0),
      lastUpdated: new Date().toISOString(),
    }));

    // Recalculate totals
    setTimeout(() => {
      setCartState(prev => ({
        ...prev,
        totalItems: prev.items.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: prev.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      }));
    }, 0);
  };

  const removeItem = (itemId: string) => {
    setCartState(prev => {
      const updatedItems = prev.items.filter(item => item.id !== itemId);
      return {
        ...prev,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const addToWishlist = (itemId: string) => {
    // In real app, this would integrate with wishlist context
    console.log('Adding to wishlist:', itemId);
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
          relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white
          transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
        variants={cartVariants}
        animate={animateCart ? 'bounce' : 'idle'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Shopping Cart"
        aria-expanded={isOpen}
      >
        {cartState.totalItems > 0 ? (
          <ShoppingBagSolidIcon className={`${iconSizeClasses[size]} text-primary-600 dark:text-primary-400`} />
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
              ${badgeVariant === 'dot' ? 'border-2 border-white dark:border-gray-900' : ''}
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
              className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Shopping Cart
                  </h3>
                  <div className="flex items-center space-x-2">
                    {cartState.items.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Close cart"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {cartState.totalItems > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {cartState.totalItems} {cartState.totalItems === 1 ? 'item' : 'items'} in cart
                  </p>
                )}
              </div>

              {/* Cart Items */}
              <div className="max-h-96 overflow-y-auto">
                {cartState.items.length === 0 ? (
                  <div className="p-8 text-center">
                    <ShoppingBagIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Your cart is empty</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                      Add some fabric to get started
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Shop Now
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    <AnimatePresence>
                      {cartState.items.map((item) => (
                        <motion.div
                          key={item.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={`
                            flex items-start space-x-3 p-3 rounded-lg border
                            ${item.inStock 
                              ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' 
                              : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                            }
                          `}
                        >
                          {/* Product Image */}
                          <div className="flex-shrink-0 relative">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
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
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {item.name}
                            </h4>
                            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                              <div className="flex items-center space-x-2">
                                <span>{item.color}</span>
                                <span>•</span>
                                <span>{item.size}</span>
                              </div>
                              <div>{item.fabric}</div>
                              {!item.inStock && (
                                <div className="text-red-600 dark:text-red-400 font-medium">
                                  Out of Stock
                                </div>
                              )}
                            </div>

                            {/* Price and Quantity */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex flex-col">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    ${item.price.toFixed(2)}
                                  </span>
                                  {item.originalPrice && (
                                    <span className="text-xs text-gray-500 line-through">
                                      ${item.originalPrice.toFixed(2)}
                                    </span>
                                  )}
                                  {item.discount && (
                                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                                      {item.discount}% OFF
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <MinusIcon className="w-3 h-3" />
                                </button>
                                <span className="text-sm font-medium min-w-6 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.maxQuantity || !item.inStock}
                                  className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <PlusIcon className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => addToWishlist(item.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="Add to wishlist"
                            >
                              <HeartIcon className="w-4 h-4" />
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
              {cartState.items.length > 0 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  {/* Totals */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${cartState.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Free
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                          ${cartState.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Link
                      href="/cart"
                      className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center block"
                      onClick={() => setIsOpen(false)}
                    >
                      View Cart
                    </Link>
                    <Link
                      href="/checkout"
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      onClick={() => setIsOpen(false)}
                    >
                      <CreditCardIcon className="w-4 h-4 mr-2" />
                      Checkout
                    </Link>
                  </div>

                  {/* Free Shipping Notice */}
                  <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
                    <TruckIcon className="w-4 h-4 mr-1" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default CartIcon;