/**
 * useCart Hook
 * 
 * Custom hook for cart management with proper data sync
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from './useToast';
import type { Product } from '@/types';
import type { Currency } from '@/types/common.types';
import type { AppliedDiscount } from '@/types/cart.types';

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  variantId?: string;
  quantity: number;
  // Flat price for compatibility with CartIcon
  price: number;
  originalPrice?: number;
  // Nested price objects for backward compatibility
  priceObj: {
    amount: number;
    currency: Currency;
    formatted: string;
  };
  unitPrice: {
    amount: number;
    currency: Currency;
    formatted: string;
  };
  total: {
    amount: number;
    currency: Currency;
    formatted: string;
  };
  totalPrice: {
    amount: number;
    currency: Currency;
    formatted: string;
  };
  // Variant info
  color?: string;
  size?: string;
  fabric?: string;
  // Meta
  addedAt: Date;
  updatedAt: Date;
  isAvailable: boolean;
  appliedDiscounts: AppliedDiscount[];
}

export interface UseCartReturn {
  cart: {
    items: CartItem[];
    subtotal: number;
    total: number;
  };
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  isLoading: boolean;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
}

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const ignoreNextUpdate = useRef(false);
  const { toast } = useToast();

  // Load cart from localStorage on mount and listen for updates
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem('vardhman_cart');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          const cartItems = Array.isArray(parsed) ? parsed : (parsed.items || []);

          // Shim items to ensure full structure for UI components
          const shimmedItems: CartItem[] = cartItems.map((item: any) => {
            const product = item.product || {};

            // Ensure media structure
            if (!product.media && (product.image || item.image)) {
              product.media = {
                images: [{
                  url: product.image || item.image,
                  alt: product.name || item.name
                }]
              };
            }

            // Ensure inventory structure
            if (!product.inventory) {
              product.inventory = {
                isInStock: product.inStock ?? item.inStock ?? true,
                availableQuantity: product.maxQuantity ?? item.maxQuantity ?? 99
              };
            }

            // Ensure SKU
            if (!product.sku) product.sku = item.sku || 'N/A';

            // Get price - handle both flat and nested formats
            let priceAmount = 0;
            if (typeof item.price === 'number') {
              priceAmount = item.price;
            } else if (typeof item.price === 'object' && item.price?.amount) {
              priceAmount = Number(item.price.amount);
            } else if (item.priceObj?.amount) {
              priceAmount = Number(item.priceObj.amount);
            }
            if (isNaN(priceAmount)) priceAmount = 0;

            // Get original price
            let originalPrice = item.originalPrice;
            if (typeof originalPrice !== 'number' || isNaN(originalPrice)) {
              originalPrice = priceAmount; // Default to same as price
            }

            const quantity = item.quantity || 1;
            const totalAmount = priceAmount * quantity;

            const priceObj = {
              amount: priceAmount,
              currency: 'INR' as Currency,
              formatted: `₹${priceAmount.toLocaleString('en-IN')}`
            };

            const totalObj = {
              amount: totalAmount,
              currency: 'INR' as Currency,
              formatted: `₹${totalAmount.toLocaleString('en-IN')}`
            };

            return {
              id: item.id,
              cartId: item.cartId || item.id,
              productId: item.productId || product.id || item.id,
              product,
              variantId: item.variantId,
              quantity,
              price: priceAmount, // Flat number for CartIcon
              originalPrice, // For discount calculation
              priceObj,
              unitPrice: priceObj,
              total: totalObj,
              totalPrice: totalObj,
              color: item.color || item.variant?.attributes?.color,
              size: item.size || item.variant?.attributes?.size,
              fabric: item.fabric || item.variant?.attributes?.fabric,
              addedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
              updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
              isAvailable: item.isAvailable !== false,
              appliedDiscounts: item.appliedDiscounts || [],
            };
          });

          // Prevent loop: do not trigger save/dispatch when loading from storage
          ignoreNextUpdate.current = true;
          setItems(shimmedItems);
        } catch (error) {
          console.error('Failed to load cart:', error);
        }
      }
      setIsInitialized(true);
    };

    loadCart();

    // Listen for storage events from other tabs/components
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'vardhman_cart') {
        loadCart();
      }
    };

    // Listen for custom events from same-tab components
    const handleCustomEvent = () => loadCart();

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('vardhman_cart_updated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('vardhman_cart_updated', handleCustomEvent);
    };
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;

    // If update came from storage/event, don't save back or dispatch
    if (ignoreNextUpdate.current) {
      ignoreNextUpdate.current = false;
      return;
    }

    // Save in format compatible with CartIcon
    const storageData = {
      items: items.map(item => ({
        id: item.id,
        productId: item.productId,
        product: {
          id: item.productId,
          name: item.product?.name || 'Product',
          image: item.product?.media?.images?.[0]?.url || item.product?.image || '',
          category: item.product?.category?.name || item.product?.category || '',
          brand: item.product?.brand || 'Vardhman',
          inStock: item.product?.inventory?.isInStock !== false,
          maxQuantity: item.product?.inventory?.availableQuantity || 99,
          sku: item.product?.sku || 'N/A',
          slug: item.product?.slug || '',
        },
        price: item.price, // Flat number
        originalPrice: item.originalPrice, // For discount calculation
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        color: item.color,
        size: item.size,
        fabric: item.fabric,
        variant: (item.color || item.size || item.fabric) ? {
          attributes: { color: item.color, size: item.size, fabric: item.fabric }
        } : undefined,
        addedAt: item.addedAt,
        updatedAt: item.updatedAt,
      })),
      summary: {
        itemCount: items.length,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      },
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem('vardhman_cart', JSON.stringify(storageData));

    // Dispatch events for sync
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('vardhman_cart_updated'));
  }, [items, isInitialized]);

  const addItem = useCallback(async (product: Product, quantity = 1) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      setItems(prev => {
        const existingItem = prev.find(item => item.productId === product.id);

        // Calculate prices
        let salePrice = 0;
        let basePrice = 0;

        if (product.pricing?.salePrice?.amount) {
          salePrice = product.pricing.salePrice.amount;
        }
        if (product.pricing?.basePrice?.amount) {
          basePrice = product.pricing.basePrice.amount;
        }

        // Fallbacks
        if (!salePrice && basePrice) salePrice = basePrice;
        if (!basePrice && salePrice) basePrice = salePrice;
        if (!salePrice && !basePrice && typeof product.price === 'number') {
          salePrice = product.price;
          basePrice = product.price;
        }

        const priceAmount = salePrice || 0;
        const originalPrice = basePrice || priceAmount;

        if (existingItem) {
          return prev.map(item =>
            item.productId === product.id
              ? {
                ...item,
                quantity: item.quantity + quantity,
                price: priceAmount,
                originalPrice,
                total: {
                  ...item.total,
                  amount: (item.quantity + quantity) * priceAmount,
                  formatted: `₹${((item.quantity + quantity) * priceAmount).toLocaleString('en-IN')}`,
                },
                totalPrice: {
                  ...item.totalPrice,
                  amount: (item.quantity + quantity) * priceAmount,
                  formatted: `₹${((item.quantity + quantity) * priceAmount).toLocaleString('en-IN')}`,
                },
                updatedAt: new Date(),
              }
              : item
          );
        }

        const priceObj = {
          amount: priceAmount,
          currency: 'INR' as Currency,
          formatted: `₹${priceAmount.toLocaleString('en-IN')}`,
        };

        const totalObj = {
          amount: priceAmount * quantity,
          currency: 'INR' as Currency,
          formatted: `₹${(priceAmount * quantity).toLocaleString('en-IN')}`,
        };

        const newItem: CartItem = {
          id: `cart-${Date.now()}`,
          cartId: `cart-${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          price: priceAmount,
          originalPrice,
          priceObj,
          unitPrice: priceObj,
          total: totalObj,
          totalPrice: totalObj,
          color: undefined,
          size: undefined,
          fabric: undefined,
          addedAt: new Date(),
          updatedAt: new Date(),
          isAvailable: true,
          appliedDiscounts: [],
        };

        return [...prev, newItem];
      });

      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const removeItem = useCallback(async (itemId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setItems(prev => prev.filter(item => item.id !== itemId));

      toast({
        title: 'Removed from cart',
        description: 'Item has been removed from your cart',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      setItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? {
              ...item,
              quantity,
              total: {
                ...item.total,
                amount: quantity * item.price,
                formatted: `₹${(quantity * item.price).toLocaleString('en-IN')}`,
              },
              totalPrice: {
                ...item.totalPrice,
                amount: quantity * item.price,
                formatted: `₹${(quantity * item.price).toLocaleString('en-IN')}`,
              },
              updatedAt: new Date(),
            }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quantity',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearCart = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setItems([]);

      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const isInCart = useCallback((productId: string) => {
    return items.some(item => item.productId === productId);
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  const cart = {
    items,
    subtotal,
    total,
  };

  return {
    cart,
    items,
    itemCount,
    subtotal,
    total,
    isLoading,
    addItem,
    addToCart: addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
  };
}
