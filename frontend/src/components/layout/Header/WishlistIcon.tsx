'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  XMarkIcon,
  ShoppingBagIcon,
  EyeIcon,
  ShareIcon,
  TrashIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export interface WishlistIconProps {
  className?: string;
  showDropdown?: boolean;
  badgeVariant?: 'default' | 'pill' | 'dot';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  brand: string;
  category: string;
  isNew?: boolean;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  totalItems: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
}

const WishlistIcon: React.FC<WishlistIconProps> = ({
  className = '',
  showDropdown = true,
  badgeVariant = 'default', // eslint-disable-line @typescript-eslint/no-unused-vars
  size = 'md',
  animate = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [wishlistState, setWishlistState] = useState<WishlistState>({
    items: [],
    totalItems: 0,
    isLoading: false,
    error: null,
    lastUpdated: new Date().toISOString(),
  });
  const [animateHeart, setAnimateHeart] = useState(false);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-wishlist-dropdown]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Animate heart when items change
  useEffect(() => {
    if (animate) {
      setAnimateHeart(true);
      const timer = setTimeout(() => setAnimateHeart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [wishlistState.totalItems, animate]);

  const removeFromWishlist = (itemId: string) => {
    setWishlistState(prev => {
      const updatedItems = prev.items.filter(item => item.id !== itemId);
      return {
        ...prev,
        items: updatedItems,
        totalItems: updatedItems.length,
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const addToCart = (itemId: string) => {
    // In real app, this would integrate with cart context
    console.log('Adding to cart:', itemId);
  };

  const shareItem = (itemId: string) => {
    // In real app, this would open share dialog
    console.log('Sharing item:', itemId);
  };

  const clearWishlist = () => {
    setWishlistState({
      items: [],
      totalItems: 0,
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

  const heartVariants = {
    idle: { scale: 1, rotate: 0 },
    beat: {
      scale: [1, 1.3, 1],
      rotate: [0, -5, 5, 0],
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
      transition: { duration: 0.2, staggerChildren: 0.03 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.15 } }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-3 h-3 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} data-wishlist-dropdown>
      {/* Wishlist Icon Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        variants={heartVariants}
        animate={animateHeart ? 'beat' : 'idle'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Wishlist"
        aria-expanded={isOpen}
      >
        {wishlistState.totalItems > 0 ? (
          <HeartSolidIcon className={`${iconSizeClasses[size]} text-red-500`} />
        ) : (
          <HeartIcon className={iconSizeClasses[size]} />
        )}

        {/* Wishlist Badge */}
        {wishlistState.totalItems > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-5 h-5 flex items-center justify-center text-xs font-bold"
          >
            {wishlistState.totalItems > 99 ? '99+' : wishlistState.totalItems}
          </motion.span>
        )}
      </motion.button>

      {/* Wishlist Dropdown */}
      {showDropdown && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <HeartIcon className="w-5 h-5 text-red-500 mr-2" />
                    Wishlist
                  </h3>
                  <div className="flex items-center space-x-2">
                    {wishlistState.items.length > 0 && (
                      <button
                        onClick={clearWishlist}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Close wishlist"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {wishlistState.totalItems > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {wishlistState.totalItems} {wishlistState.totalItems === 1 ? 'item' : 'items'} saved
                  </p>
                )}
              </div>

              {/* Wishlist Items */}
              <div className="max-h-96 overflow-y-auto">
                {wishlistState.items.length === 0 ? (
                  <div className="p-8 text-center">
                    <HeartIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Your wishlist is empty</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                      Save items you love for later
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <HeartIcon className="w-4 h-4 mr-2" />
                      Discover Products
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    <AnimatePresence>
                      {wishlistState.items.map((item) => (
                        <motion.div
                          key={item.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={`
                            flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200
                            ${item.inStock 
                              ? 'border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-800' 
                              : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                            }
                          `}
                        >
                          {/* Product Image */}
                          <div className="flex-shrink-0 relative">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                              <div className="w-full h-full bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  {item.brand.charAt(0)}
                                </span>
                              </div>
                            </div>
                            {item.isNew && (
                              <div className="absolute -top-1 -left-1 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                                NEW
                              </div>
                            )}
                            {!item.inStock && (
                              <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-medium text-red-600 bg-white px-2 py-1 rounded">
                                  Out of Stock
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {item.name}
                            </h4>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {item.brand} • {item.category}
                            </div>

                            {/* Rating */}
                            <div className="flex items-center space-x-2 mt-1">
                              {renderStars(item.rating)}
                              <span className="text-xs text-gray-500">
                                ({item.reviewCount})
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center space-x-2 mt-2">
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

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2 mt-2">
                              <button
                                onClick={() => addToCart(item.id)}
                                disabled={!item.inStock}
                                className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors flex items-center justify-center"
                              >
                                <ShoppingBagIcon className="w-3 h-3 mr-1" />
                                {item.inStock ? 'Add to Cart' : 'Notify Me'}
                              </button>
                              <Link
                                href={`/products/${item.id}`}
                                className="px-2 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                onClick={() => setIsOpen(false)}
                              >
                                <EyeIcon className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => shareItem(item.id)}
                              className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                              aria-label="Share item"
                            >
                              <ShareIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="Remove from wishlist"
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
              {wishlistState.items.length > 0 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {wishlistState.items.filter(item => item.inStock).length} available items
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Updated {new Date(wishlistState.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      href="/wishlist"
                      className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center block"
                      onClick={() => setIsOpen(false)}
                    >
                      View All Wishlist Items
                    </Link>
                    <button
                      onClick={() => {
                        wishlistState.items.filter(item => item.inStock).forEach(item => {
                          addToCart(item.id);
                        });
                      }}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <ShoppingBagIcon className="w-4 h-4 mr-2" />
                      Add Available Items to Cart
                    </button>
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

export default WishlistIcon;