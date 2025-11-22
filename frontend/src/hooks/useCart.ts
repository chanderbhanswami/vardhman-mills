/**
 * useCart Hook
 * 
 * Custom hook for cart management
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
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
  price: {
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
  addToCart: (product: Product, quantity?: number) => Promise<void>; // Alias for addItem
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
}

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(async (product: Product, quantity = 1) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      setItems(prev => {
        const existingItem = prev.find(item => item.productId === product.id);
        
        if (existingItem) {
          return prev.map(item =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  total: {
                    ...item.total,
                    amount: (item.quantity + quantity) * item.price.amount,
                    formatted: `₹${(item.quantity + quantity) * item.price.amount}`,
                  },
                  totalPrice: {
                    ...item.total,
                    amount: (item.quantity + quantity) * item.price.amount,
                    formatted: `₹${(item.quantity + quantity) * item.price.amount}`,
                  },
                  updatedAt: new Date(),
                }
              : item
          );
        }

        const newItem: CartItem = {
          id: `cart-${Date.now()}`,
          cartId: `cart-${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          price: {
            amount: 500, // Default price
            currency: 'INR' as const,
            formatted: '₹500',
          },
          unitPrice: {
            amount: 500,
            currency: 'INR' as const,
            formatted: '₹500',
          },
          total: {
            amount: 500 * quantity,
            currency: 'INR' as const,
            formatted: `₹${500 * quantity}`,
          },
          totalPrice: {
            amount: 500 * quantity,
            currency: 'INR' as const,
            formatted: `₹${500 * quantity}`,
          },
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
                  amount: quantity * item.price.amount,
                  formatted: `₹${quantity * item.price.amount}`,
                },
                totalPrice: {
                  ...item.totalPrice,
                  amount: quantity * item.price.amount,
                  formatted: `₹${quantity * item.price.amount}`,
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
  const subtotal = items.reduce((sum, item) => sum + item.total.amount, 0);
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
    addToCart: addItem, // Alias for addItem
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
  };
}
