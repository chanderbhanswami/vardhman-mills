'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
import { HeartIcon as HeartSolidIcon, XCircleIcon } from '@heroicons/react/24/solid';

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
  color?: string;
  size?: string;
  fabric?: string;
  material?: string;
  product?: {
    id?: string;
    price?: number;
    color?: string;
    size?: string;
    fabric?: string;
    material?: string;
  };
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
  const [cartItemIds, setCartItemIds] = useState<Set<string>>(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Sync cart state for checking if items are already in cart
  useEffect(() => {
    const loadCartItemIds = () => {
      try {
        const stored = localStorage.getItem('vardhman_cart');
        if (stored) {
          const parsedCart = JSON.parse(stored);
          // Handle both formats:
          // 1. CartProvider saves directly as array: [{...}, {...}]
          // 2. CartIcon/WishlistIcon saves as object: { items: [...], summary: {...} }
          let rawItems: { productId?: string; id?: string }[];
          if (Array.isArray(parsedCart)) {
            rawItems = parsedCart;
          } else if (parsedCart && Array.isArray(parsedCart.items)) {
            rawItems = parsedCart.items;
          } else {
            rawItems = [];
          }
          const ids = new Set<string>(
            rawItems.map(item => item.productId || item.id).filter(Boolean) as string[]
          );
          setCartItemIds(ids);
        } else {
          setCartItemIds(new Set());
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };

    loadCartItemIds();
    // Listen for both storage event and custom cart update event
    window.addEventListener('storage', loadCartItemIds);
    window.addEventListener('vardhman_cart_updated', loadCartItemIds);
    return () => {
      window.removeEventListener('storage', loadCartItemIds);
      window.removeEventListener('vardhman_cart_updated', loadCartItemIds);
    };
  }, []);

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

  // Sync wishlist from localStorage
  useEffect(() => {
    const loadWishlistFromStorage = () => {
      try {
        const stored = localStorage.getItem('vardhman_wishlist');
        if (stored) {
          const parsedWishlist = JSON.parse(stored);
          const items: WishlistItem[] = parsedWishlist.map((item: {
            id: string;
            productId: string;
            color?: string;
            size?: string;
            fabric?: string;
            material?: string;
            product: {
              name?: string;
              image?: string;
              price?: number;
              salePrice?: number;
              inStock?: boolean;
              rating?: number;
              reviewCount?: number;
              brand?: string;
              category?: string;
              color?: string;
              size?: string;
              fabric?: string;
              material?: string;
            };
            addedAt: string;
          }) => ({
            id: item.productId || item.id,
            name: item.product?.name || 'Product',
            image: item.product?.image || '',
            price: item.product?.salePrice || item.product?.price || 0,
            originalPrice: item.product?.salePrice ? item.product?.price : undefined,
            discount: item.product?.salePrice && item.product?.price ?
              Math.round(((item.product.price - item.product.salePrice) / item.product.price) * 100) : undefined,
            rating: item.product?.rating || 0,
            reviewCount: item.product?.reviewCount || 0,
            inStock: item.product?.inStock !== false,
            brand: item.product?.brand || 'Vardhman',
            category: item.product?.category || 'Fabric',
            color: item.color || item.product?.color || '',
            size: item.size || item.product?.size || '',
            fabric: item.fabric || item.material || item.product?.fabric || item.product?.material || '',
            material: item.material || item.product?.material,
            product: item.product,
            addedAt: item.addedAt,
          }));

          setWishlistState({
            items,
            totalItems: items.length,
            isLoading: false,
            error: null,
            lastUpdated: new Date().toISOString(),
          });
        } else {
          setWishlistState({
            items: [],
            totalItems: 0,
            isLoading: false,
            error: null,
            lastUpdated: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    };

    // Load on mount
    loadWishlistFromStorage();

    // Listen for storage events (from other components)
    const handleStorageChange = () => {
      loadWishlistFromStorage();
    };

    // Listen for both storage event and custom wishlist update event
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('vardhman_wishlist_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('vardhman_wishlist_updated', handleStorageChange);
    };
  }, []);

  // Animate heart when items change
  useEffect(() => {
    if (animate) {
      setAnimateHeart(true);
      const timer = setTimeout(() => setAnimateHeart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [wishlistState.totalItems, animate]);

  const removeFromWishlist = (itemId: string) => {
    // Remove from localStorage
    const currentWishlist = JSON.parse(localStorage.getItem('vardhman_wishlist') || '[]');
    const filtered = currentWishlist.filter((item: { productId: string; id: string }) =>
      item.productId !== itemId && item.id !== itemId
    );
    localStorage.setItem('vardhman_wishlist', JSON.stringify(filtered));
    window.dispatchEvent(new Event('storage'));

    // Update local state
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
    // Find the item in wishlist
    const item = wishlistState.items.find(i => i.id === itemId);
    if (!item) return;

    // Add to cart via localStorage
    const currentCart = JSON.parse(localStorage.getItem('vardhman_cart') || '{"items":[],"summary":{}}');

    const existingItemIndex = currentCart.items.findIndex(
      (cartItem: { productId: string }) => cartItem.productId === itemId
    );

    if (existingItemIndex === -1) {
      // Calculate discount if original price exists
      const originalPrice = item.originalPrice || item.product?.price;
      const price = item.price;
      const discount = originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined;

      currentCart.items.push({
        id: `cart_item_${Date.now()}`,
        productId: itemId,
        quantity: 1,
        price: price,
        originalPrice: originalPrice,
        subtotal: price,
        // Add variant details at root level
        color: item.color || item.product?.color,
        size: item.size || item.product?.size,
        fabric: item.fabric || item.material || item.product?.fabric || item.product?.material,
        discount: discount,
        product: {
          id: itemId,
          name: item.name,
          slug: item.name.toLowerCase().replace(/\s+/g, '-'),
          image: item.image,
          category: item.category,
          brand: item.brand,
          inStock: item.inStock,
          maxQuantity: 99,
        },
        // Add variant structure for compatibility
        variant: {
          attributes: {
            color: item.color || item.product?.color,
            size: item.size || item.product?.size,
            fabric: item.fabric || item.material || item.product?.fabric || item.product?.material,
          }
        },
        addedAt: new Date(),
        updatedAt: new Date(),
      });

      currentCart.summary = {
        ...currentCart.summary,
        itemCount: currentCart.items.length,
        totalQuantity: currentCart.items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0),
        subtotal: currentCart.items.reduce((sum: number, i: { subtotal: number }) => sum + i.subtotal, 0),
        total: currentCart.items.reduce((sum: number, i: { subtotal: number }) => sum + i.subtotal, 0),
      };

      localStorage.setItem('vardhman_cart', JSON.stringify(currentCart));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const shareItem = (itemId: string) => {
    const item = wishlistState.items.find(i => i.id === itemId);
    if (item) {
      const url = `${window.location.origin}/products/${item.id}`;
      navigator.clipboard.writeText(url);
    }
  };

  const clearWishlist = () => {
    localStorage.removeItem('vardhman_wishlist');
    window.dispatchEvent(new Event('storage'));

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
            className={`w-3 h-3 ${star <= rating
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
        className="relative p-2 text-gray-900 hover:text-primary transition-colors duration-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
              className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <HeartIcon className="w-5 h-5 text-red-500 mr-2" />
                    Wishlist
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label="Close wishlist"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                {wishlistState.totalItems > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-600">
                      {wishlistState.totalItems} {wishlistState.totalItems === 1 ? 'item' : 'items'} saved
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

              {/* Wishlist Items */}
              <div className="max-h-96 overflow-y-auto">
                {wishlistState.items.length === 0 ? (
                  <div className="p-8 text-center">
                    <HeartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Your wishlist is empty</p>
                    <p className="text-sm text-gray-500 mb-4">
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
                  <div className="p-4 divide-y divide-gray-100">
                    <AnimatePresence>
                      {wishlistState.items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={`
                            flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200
                            ${index > 0 ? 'mt-3' : ''}
                            ${item.inStock
                              ? 'border-gray-200 bg-white shadow-sm hover:border-red-200'
                              : 'border-red-200 bg-red-50'
                            }
                          `}
                        >
                          {/* Product Image */}
                          <div className="flex-shrink-0 relative">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                              <div className="w-full h-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
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
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </h4>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.brand} • {item.category}
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

                            {/* Rating */}
                            <div className="flex items-center space-x-2 mt-1">
                              {renderStars(item.rating)}
                              <span className="text-xs text-gray-500">
                                ({item.reviewCount})
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-sm font-semibold text-gray-900">
                                ₹{item.price.toLocaleString('en-IN')}
                              </span>
                              {item.originalPrice && (
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{item.originalPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                              {item.discount && (
                                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                                  {item.discount}% OFF
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2 mt-2">
                              {cartItemIds.has(item.id) ? (
                                <span className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded flex items-center justify-center">
                                  <ShoppingBagIcon className="w-3 h-3 mr-1" />
                                  In Cart
                                </span>
                              ) : (
                                <button
                                  onClick={() => addToCart(item.id)}
                                  disabled={!item.inStock}
                                  className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors flex items-center justify-center"
                                >
                                  <ShoppingBagIcon className="w-3 h-3 mr-1" />
                                  {item.inStock ? 'Add to Cart' : 'Notify Me'}
                                </button>
                              )}
                              <Link
                                href={`/products/${item.id}`}
                                className="px-2 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition-colors"
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
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      {wishlistState.items.filter(item => item.inStock).length} available items
                    </span>
                    <span className="text-sm text-gray-600">
                      Updated {new Date(wishlistState.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link
                      href="/wishlist"
                      className="w-full bg-white border-2 border-gray-300 text-gray-900 py-3 px-4 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors text-center block"
                      onClick={() => setIsOpen(false)}
                    >
                      View All Wishlist Items
                    </Link>
                    <button
                      onClick={() => {
                        wishlistState.items.filter(item => item.inStock && !cartItemIds.has(item.id)).forEach(item => {
                          addToCart(item.id);
                        });
                      }}
                      className="w-full bg-red-500 hover:bg-red-600 hover:text-white text-white py-3 px-4 rounded-lg text-sm font-bold transition-colors flex items-center justify-center shadow-sm"
                    >
                      <ShoppingBagIcon className="w-5 h-5 mr-2" />
                      Add Available Items to Cart
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Clear Wishlist Confirmation Dialog */}
      {/* Clear Wishlist Confirmation Dialog - Portal to document.body */}
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
                  Clear Wishlist
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to remove all {wishlistState.totalItems} {wishlistState.totalItems === 1 ? 'item' : 'items'} from your wishlist? This action cannot be undone.
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
                  clearWishlist();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Clear Wishlist
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default WishlistIcon;