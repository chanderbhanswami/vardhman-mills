/**
 * Cart Model - Comprehensive shopping cart management
 * Frontend-optimized with full TypeScript support and validation
 */

import { ObjectId } from 'mongodb';
import { z } from 'zod';

/**
 * Cart Item Schema
 */
export const CartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  variantId: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  sku: z.string(),
  image: z.string().url().optional(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  quantity: z.number().positive(),
  maxQuantity: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.enum(['cm', 'inch', 'mm']).default('cm'),
  }).optional(),
  attributes: z.record(z.string(), z.string()).default({}),
  customization: z.object({
    text: z.string().optional(),
    options: z.record(z.string(), z.string()).optional(),
    files: z.array(z.object({
      name: z.string(),
      url: z.string().url(),
      type: z.string(),
    })).optional(),
    additionalCost: z.number().nonnegative().default(0),
  }).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  addedAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  isAvailable: z.boolean().default(true),
  availabilityMessage: z.string().optional(),
  estimatedDelivery: z.date().optional(),
  shippingRequired: z.boolean().default(true),
});

export type CartItem = z.infer<typeof CartItemSchema>;

/**
 * Cart Discount Schema
 */
export const CartDiscountSchema = z.object({
  id: z.string(),
  type: z.enum(['coupon', 'loyalty', 'promotion', 'referral', 'bulk', 'seasonal', 'automatic']),
  code: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  amount: z.number().nonnegative(),
  percentage: z.number().min(0).max(100).optional(),
  maxDiscount: z.number().positive().optional(),
  appliedTo: z.enum(['total', 'shipping', 'tax', 'items', 'category']).default('total'),
  applicableItems: z.array(z.string()).optional(), // Cart item IDs
  conditions: z.object({
    minOrderValue: z.number().positive().optional(),
    maxOrderValue: z.number().positive().optional(),
    applicableProducts: z.array(z.string()).optional(),
    applicableCategories: z.array(z.string()).optional(),
    firstTimeUser: z.boolean().optional(),
    userGroups: z.array(z.string()).optional(),
    validFrom: z.date().optional(),
    validUntil: z.date().optional(),
  }).optional(),
  isActive: z.boolean().default(true),
  appliedAt: z.date().default(() => new Date()),
});

export type CartDiscount = z.infer<typeof CartDiscountSchema>;

/**
 * Cart Shipping Option Schema
 */
export const CartShippingOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  provider: z.string(),
  method: z.string(), // standard, express, overnight, pickup
  cost: z.number().nonnegative(),
  estimatedDays: z.object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
  }),
  isFree: z.boolean().default(false),
  isSelected: z.boolean().default(false),
  requirements: z.object({
    minOrderValue: z.number().positive().optional(),
    maxWeight: z.number().positive().optional(),
    supportedRegions: z.array(z.string()).optional(),
  }).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CartShippingOption = z.infer<typeof CartShippingOptionSchema>;

/**
 * Cart Tax Schema
 */
export const CartTaxSchema = z.object({
  id: z.string(),
  name: z.string(),
  rate: z.number().min(0).max(100),
  amount: z.number().nonnegative(),
  type: z.enum(['gst', 'vat', 'sales_tax', 'service_tax']),
  jurisdiction: z.string().optional(),
  taxableAmount: z.number().nonnegative(),
  isInclusive: z.boolean().default(false),
});

export type CartTax = z.infer<typeof CartTaxSchema>;

/**
 * Cart Totals Schema
 */
export const CartTotalsSchema = z.object({
  subtotal: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  shipping: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  savings: z.number().nonnegative().default(0),
  loyaltyPointsEarned: z.number().nonnegative().default(0),
  loyaltyPointsRedeemed: z.number().nonnegative().default(0),
  estimatedTotal: z.number().nonnegative().optional(),
});

export type CartTotals = z.infer<typeof CartTotalsSchema>;

/**
 * Cart Address Schema
 */
export const CartAddressSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['billing', 'shipping']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isDefault: z.boolean().default(false),
  isValidated: z.boolean().default(false),
  validationMessage: z.string().optional(),
});

export type CartAddress = z.infer<typeof CartAddressSchema>;

/**
 * Main Cart Schema
 */
export const CartSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  sessionId: z.string().optional(), // For guest users
  userId: z.string().optional(), // For logged-in users
  email: z.string().email().optional(),
  currency: z.string().default('INR'),
  items: z.array(CartItemSchema).default([]),
  totals: CartTotalsSchema,
  discounts: z.array(CartDiscountSchema).default([]),
  shippingOptions: z.array(CartShippingOptionSchema).default([]),
  selectedShipping: z.string().optional(), // Shipping option ID
  taxes: z.array(CartTaxSchema).default([]),
  addresses: z.object({
    billing: CartAddressSchema.optional(),
    shipping: CartAddressSchema.optional(),
  }).default({}),
  appliedCoupons: z.array(z.string()).default([]), // Coupon codes
  loyaltyPoints: z.object({
    available: z.number().nonnegative().default(0),
    toRedeem: z.number().nonnegative().default(0),
    redeemValue: z.number().nonnegative().default(0),
  }).optional(),
  notes: z.string().optional(),
  giftMessage: z.string().optional(),
  giftWrap: z.object({
    enabled: z.boolean().default(false),
    type: z.string().optional(),
    cost: z.number().nonnegative().default(0),
    message: z.string().optional(),
  }).optional(),
  preferences: z.object({
    marketing: z.boolean().default(true),
    smsUpdates: z.boolean().default(true),
    emailUpdates: z.boolean().default(true),
    deliveryInstructions: z.string().optional(),
  }).default(() => ({
    marketing: true,
    smsUpdates: true,
    emailUpdates: true,
  })),
  metadata: z.record(z.string(), z.unknown()).optional(),
  analytics: z.object({
    source: z.string().optional(), // web, mobile, api
    referrer: z.string().optional(),
    campaign: z.string().optional(),
    pageViews: z.number().nonnegative().default(0),
    timeSpent: z.number().nonnegative().default(0), // in seconds
    abandonedAt: z.date().optional(),
    recoveredAt: z.date().optional(),
    conversionStage: z.enum(['browsing', 'cart', 'checkout', 'payment', 'completed']).default('cart'),
  }).default(() => ({
    pageViews: 0,
    timeSpent: 0,
    conversionStage: 'cart' as const,
  })),
  status: z.enum(['active', 'abandoned', 'recovered', 'converted', 'expired']).default('active'),
  isGuest: z.boolean().default(true),
  mergedFrom: z.array(z.string()).default([]), // Cart IDs that were merged into this cart
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  expiresAt: z.date().optional(),
  lastActivityAt: z.date().default(() => new Date()),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  deviceInfo: z.object({
    type: z.enum(['desktop', 'mobile', 'tablet']).optional(),
    os: z.string().optional(),
    browser: z.string().optional(),
  }).optional(),
});

export type Cart = z.infer<typeof CartSchema>;

/**
 * Add Item to Cart Schema
 */
export const AddItemToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  quantity: z.number().positive().default(1),
  customization: CartItemSchema.shape.customization.optional(),
  replaceExisting: z.boolean().default(false),
});

export type AddItemToCartInput = z.infer<typeof AddItemToCartSchema>;

/**
 * Update Cart Item Schema
 */
export const UpdateCartItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().positive().optional(),
  customization: CartItemSchema.shape.customization.optional(),
});

export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;

/**
 * Apply Coupon Schema
 */
export const ApplyCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  validateOnly: z.boolean().default(false),
});

export type ApplyCouponInput = z.infer<typeof ApplyCouponSchema>;

/**
 * Cart Filter Schema
 */
export const CartFilterSchema = z.object({
  userId: z.string().optional(),
  status: z.enum(['active', 'abandoned', 'recovered', 'converted', 'expired']).optional(),
  isGuest: z.boolean().optional(),
  hasItems: z.boolean().optional(),
  totalMin: z.number().nonnegative().optional(),
  totalMax: z.number().nonnegative().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  lastActivityAfter: z.date().optional(),
  lastActivityBefore: z.date().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'lastActivityAt', 'total']).default('lastActivityAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CartFilter = z.infer<typeof CartFilterSchema>;

/**
 * Cart Statistics Schema
 */
export const CartStatsSchema = z.object({
  totalCarts: z.number(),
  activeCarts: z.number(),
  abandonedCarts: z.number(),
  recoveredCarts: z.number(),
  convertedCarts: z.number(),
  averageCartValue: z.number(),
  totalCartValue: z.number(),
  abandonmentRate: z.number(),
  recoveryRate: z.number(),
  conversionRate: z.number(),
  averageItemsPerCart: z.number(),
  topProducts: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    quantity: z.number(),
    carts: z.number(),
  })),
  cartsByStatus: z.record(z.string(), z.number()),
  cartsBySource: z.record(z.string(), z.number()),
  abandonmentReasons: z.array(z.object({
    reason: z.string(),
    count: z.number(),
  })),
  conversionTrends: z.array(z.object({
    date: z.string(),
    carts: z.number(),
    conversions: z.number(),
    rate: z.number(),
  })),
});

export type CartStats = z.infer<typeof CartStatsSchema>;

/**
 * Validation functions
 */
export const validateCart = (data: unknown): Cart => {
  return CartSchema.parse(data);
};

export const validateAddItemToCart = (data: unknown): AddItemToCartInput => {
  return AddItemToCartSchema.parse(data);
};

export const validateUpdateCartItem = (data: unknown): UpdateCartItemInput => {
  return UpdateCartItemSchema.parse(data);
};

export const validateApplyCoupon = (data: unknown): ApplyCouponInput => {
  return ApplyCouponSchema.parse(data);
};

export const validateCartFilter = (data: unknown): CartFilter => {
  return CartFilterSchema.parse(data);
};

/**
 * Cart utility functions
 */
export const cartUtils = {
  /**
   * Calculate item totals
   */
  calculateItemTotals: (item: Omit<CartItem, 'subtotal' | 'total'>): { subtotal: number; total: number } => {
    const basePrice = item.salePrice || item.price;
    const customizationCost = item.customization?.additionalCost || 0;
    const unitPrice = basePrice + customizationCost;
    const subtotal = unitPrice * item.quantity;
    const total = subtotal + item.tax;
    
    return { subtotal, total };
  },

  /**
   * Calculate cart totals
   */
  calculateCartTotals: (
    items: CartItem[],
    discounts: CartDiscount[] = [],
    shipping: number = 0,
    taxes: CartTax[] = [],
    loyaltyRedemption: number = 0
  ): CartTotals => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalDiscount = discounts.reduce((sum, discount) => sum + discount.amount, 0);
    const totalTax = taxes.reduce((sum, tax) => sum + tax.amount, 0);
    const total = Math.max(0, subtotal + shipping + totalTax - totalDiscount - loyaltyRedemption);
    const savings = items.reduce((sum, item) => {
      const originalPrice = item.price * item.quantity;
      const salePrice = (item.salePrice || item.price) * item.quantity;
      return sum + (originalPrice - salePrice);
    }, 0) + totalDiscount;

    return {
      subtotal,
      discount: totalDiscount,
      shipping,
      tax: totalTax,
      total,
      savings,
      loyaltyPointsEarned: Math.floor(total / 100), // 1 point per ₹100
      loyaltyPointsRedeemed: loyaltyRedemption,
    };
  },

  /**
   * Check if item exists in cart
   */
  findItem: (cart: Cart, productId: string, variantId?: string): CartItem | undefined => {
    return cart.items.find(item => 
      item.productId === productId && 
      (variantId ? item.variantId === variantId : !item.variantId)
    );
  },

  /**
   * Add item to cart
   */
  addItem: (cart: Cart, newItem: AddItemToCartInput & { itemData: Partial<CartItem> }): Cart => {
    const existingItem = cartUtils.findItem(cart, newItem.productId, newItem.variantId);
    
    if (existingItem && !newItem.replaceExisting) {
      // Update existing item quantity
      const updatedItems = cart.items.map(item => {
        if (item.id === existingItem.id) {
          const newQuantity = item.quantity + newItem.quantity;
          const totals = cartUtils.calculateItemTotals({ ...item, quantity: newQuantity });
          return {
            ...item,
            quantity: newQuantity,
            subtotal: totals.subtotal,
            total: totals.total,
            updatedAt: new Date(),
          };
        }
        return item;
      });
      
      return {
        ...cart,
        items: updatedItems,
        totals: cartUtils.calculateCartTotals(updatedItems, cart.discounts, 0, cart.taxes),
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      };
    } else {
      // Add new item or replace existing
      const itemId = existingItem?.id || new ObjectId().toString();
      const cartItem: CartItem = {
        id: itemId,
        productId: newItem.productId,
        variantId: newItem.variantId,
        name: '', // Will be overridden by itemData
        sku: '', // Will be overridden by itemData
        price: 0, // Will be overridden by itemData
        quantity: newItem.quantity,
        customization: newItem.customization,
        addedAt: existingItem?.addedAt || new Date(),
        updatedAt: new Date(),
        subtotal: 0,
        tax: 0,
        total: 0,
        isAvailable: true,
        shippingRequired: true,
        attributes: {},
        ...newItem.itemData,
      };
      
      const totals = cartUtils.calculateItemTotals(cartItem);
      cartItem.subtotal = totals.subtotal;
      cartItem.total = totals.total;
      
      const updatedItems = existingItem
        ? cart.items.map(item => item.id === existingItem.id ? cartItem : item)
        : [...cart.items, cartItem];
      
      return {
        ...cart,
        items: updatedItems,
        totals: cartUtils.calculateCartTotals(updatedItems, cart.discounts, 0, cart.taxes),
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      };
    }
  },

  /**
   * Update item in cart
   */
  updateItem: (cart: Cart, update: UpdateCartItemInput): Cart => {
    const updatedItems = cart.items.map(item => {
      if (item.id === update.itemId) {
        const updatedItem = {
          ...item,
          ...(update.quantity && { quantity: update.quantity }),
          ...(update.customization && { customization: update.customization }),
          updatedAt: new Date(),
        };
        
        const totals = cartUtils.calculateItemTotals(updatedItem);
        return {
          ...updatedItem,
          subtotal: totals.subtotal,
          total: totals.total,
        };
      }
      return item;
    });
    
    return {
      ...cart,
      items: updatedItems,
      totals: cartUtils.calculateCartTotals(updatedItems, cart.discounts, 0, cart.taxes),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    };
  },

  /**
   * Remove item from cart
   */
  removeItem: (cart: Cart, itemId: string): Cart => {
    const updatedItems = cart.items.filter(item => item.id !== itemId);
    
    return {
      ...cart,
      items: updatedItems,
      totals: cartUtils.calculateCartTotals(updatedItems, cart.discounts, 0, cart.taxes),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
      status: updatedItems.length === 0 ? 'abandoned' : cart.status,
    };
  },

  /**
   * Clear cart
   */
  clearCart: (cart: Cart): Cart => {
    return {
      ...cart,
      items: [],
      discounts: [],
      appliedCoupons: [],
      totals: {
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        savings: 0,
        loyaltyPointsEarned: 0,
        loyaltyPointsRedeemed: 0,
      },
      updatedAt: new Date(),
      lastActivityAt: new Date(),
      status: 'abandoned',
    };
  },

  /**
   * Apply discount to cart
   */
  applyDiscount: (cart: Cart, discount: CartDiscount): Cart => {
    // Check if discount is already applied
    const existingDiscount = cart.discounts.find(d => d.id === discount.id);
    if (existingDiscount) return cart;
    
    const updatedDiscounts = [...cart.discounts, discount];
    
    return {
      ...cart,
      discounts: updatedDiscounts,
      totals: cartUtils.calculateCartTotals(cart.items, updatedDiscounts, 0, cart.taxes),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    };
  },

  /**
   * Remove discount from cart
   */
  removeDiscount: (cart: Cart, discountId: string): Cart => {
    const updatedDiscounts = cart.discounts.filter(d => d.id !== discountId);
    
    return {
      ...cart,
      discounts: updatedDiscounts,
      totals: cartUtils.calculateCartTotals(cart.items, updatedDiscounts, 0, cart.taxes),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    };
  },

  /**
   * Apply coupon to cart
   */
  applyCoupon: (cart: Cart, couponCode: string, discount: CartDiscount): Cart => {
    if (cart.appliedCoupons.includes(couponCode)) return cart;
    
    return {
      ...cartUtils.applyDiscount(cart, discount),
      appliedCoupons: [...cart.appliedCoupons, couponCode],
    };
  },

  /**
   * Remove coupon from cart
   */
  removeCoupon: (cart: Cart, couponCode: string): Cart => {
    const updatedCoupons = cart.appliedCoupons.filter(code => code !== couponCode);
    const updatedDiscounts = cart.discounts.filter(d => d.code !== couponCode);
    
    return {
      ...cart,
      appliedCoupons: updatedCoupons,
      discounts: updatedDiscounts,
      totals: cartUtils.calculateCartTotals(cart.items, updatedDiscounts, 0, cart.taxes),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    };
  },

  /**
   * Check if cart is empty
   */
  isEmpty: (cart: Cart): boolean => {
    return cart.items.length === 0;
  },

  /**
   * Get cart item count
   */
  getItemCount: (cart: Cart): number => {
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  },

  /**
   * Get unique product count
   */
  getUniqueProductCount: (cart: Cart): number => {
    return cart.items.length;
  },

  /**
   * Check if cart has unavailable items
   */
  hasUnavailableItems: (cart: Cart): boolean => {
    return cart.items.some(item => !item.isAvailable);
  },

  /**
   * Get unavailable items
   */
  getUnavailableItems: (cart: Cart): CartItem[] => {
    return cart.items.filter(item => !item.isAvailable);
  },

  /**
   * Calculate cart weight
   */
  calculateWeight: (cart: Cart): number => {
    return cart.items.reduce((weight, item) => {
      const itemWeight = item.weight || 0;
      return weight + (itemWeight * item.quantity);
    }, 0);
  },

  /**
   * Check if cart requires shipping
   */
  requiresShipping: (cart: Cart): boolean => {
    return cart.items.some(item => item.shippingRequired);
  },

  /**
   * Format cart for display
   */
  formatForDisplay: (cart: Cart) => {
    return {
      id: cart._id?.toString(),
      sessionId: cart.sessionId,
      userId: cart.userId,
      items: cart.items.map(item => ({
        ...item,
        formattedPrice: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: cart.currency,
        }).format(item.salePrice || item.price),
        formattedTotal: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: cart.currency,
        }).format(item.total),
        savings: item.salePrice ? (item.price - item.salePrice) * item.quantity : 0,
      })),
      totals: {
        ...cart.totals,
        formatted: {
          subtotal: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: cart.currency,
          }).format(cart.totals.subtotal),
          total: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: cart.currency,
          }).format(cart.totals.total),
          discount: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: cart.currency,
          }).format(cart.totals.discount),
          shipping: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: cart.currency,
          }).format(cart.totals.shipping),
          tax: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: cart.currency,
          }).format(cart.totals.tax),
          savings: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: cart.currency,
          }).format(cart.totals.savings),
        },
      },
      summary: {
        itemCount: cartUtils.getItemCount(cart),
        uniqueProducts: cartUtils.getUniqueProductCount(cart),
        isEmpty: cartUtils.isEmpty(cart),
        hasUnavailableItems: cartUtils.hasUnavailableItems(cart),
        requiresShipping: cartUtils.requiresShipping(cart),
        totalWeight: cartUtils.calculateWeight(cart),
      },
      discounts: cart.discounts,
      appliedCoupons: cart.appliedCoupons,
      status: cart.status,
      timestamps: {
        created: cart.createdAt,
        updated: cart.updatedAt,
        lastActivity: cart.lastActivityAt,
        expires: cart.expiresAt,
      },
    };
  },

  /**
   * Check if cart is expired
   */
  isExpired: (cart: Cart): boolean => {
    if (!cart.expiresAt) return false;
    return new Date() > cart.expiresAt;
  },

  /**
   * Set cart expiration
   */
  setExpiration: (cart: Cart, days: number = 30): Cart => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    
    return {
      ...cart,
      expiresAt,
      updatedAt: new Date(),
    };
  },

  /**
   * Merge carts
   */
  mergeCarts: (primaryCart: Cart, secondaryCart: Cart): Cart => {
    const mergedItems = [...primaryCart.items];
    
    // Add items from secondary cart
    secondaryCart.items.forEach(secondaryItem => {
      const existingItem = cartUtils.findItem(primaryCart, secondaryItem.productId, secondaryItem.variantId);
      
      if (existingItem) {
        // Update quantity of existing item
        const itemIndex = mergedItems.findIndex(item => item.id === existingItem.id);
        if (itemIndex !== -1) {
          mergedItems[itemIndex] = {
            ...mergedItems[itemIndex],
            quantity: mergedItems[itemIndex].quantity + secondaryItem.quantity,
            updatedAt: new Date(),
          };
        }
      } else {
        // Add new item
        mergedItems.push({
          ...secondaryItem,
          id: new ObjectId().toString(),
          addedAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });
    
    return {
      ...primaryCart,
      items: mergedItems,
      totals: cartUtils.calculateCartTotals(mergedItems, primaryCart.discounts, 0, primaryCart.taxes),
      mergedFrom: [...primaryCart.mergedFrom, ...(secondaryCart._id ? [secondaryCart._id.toString()] : [])],
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    };
  },

  /**
   * Validate cart items availability
   */
  validateAvailability: async (cart: Cart, checkStock: (productId: string, variantId?: string) => Promise<{ available: boolean; quantity: number; message?: string }>): Promise<Cart> => {
    const updatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const availability = await checkStock(item.productId, item.variantId);
        
        return {
          ...item,
          isAvailable: availability.available && availability.quantity >= item.quantity,
          availabilityMessage: !availability.available 
            ? 'Product is no longer available' 
            : availability.quantity < item.quantity 
            ? `Only ${availability.quantity} items available` 
            : undefined,
          updatedAt: new Date(),
        };
      })
    );
    
    return {
      ...cart,
      items: updatedItems,
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    };
  },

  /**
   * Generate cart summary for checkout
   */
  generateCheckoutSummary: (cart: Cart) => {
    return {
      items: cart.items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price: item.salePrice || item.price,
        total: item.total,
        customization: item.customization,
      })),
      totals: cart.totals,
      discounts: cart.discounts.map(discount => ({
        code: discount.code,
        name: discount.name,
        amount: discount.amount,
      })),
      shippingRequired: cartUtils.requiresShipping(cart),
      totalWeight: cartUtils.calculateWeight(cart),
      itemCount: cartUtils.getItemCount(cart),
    };
  },
};

/**
 * Default cart values
 */
export const defaultCart: Partial<Cart> = {
  currency: 'INR',
  items: [],
  totals: {
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    savings: 0,
    loyaltyPointsEarned: 0,
    loyaltyPointsRedeemed: 0,
  },
  discounts: [],
  shippingOptions: [],
  taxes: [],
  addresses: {},
  appliedCoupons: [],
  preferences: {
    marketing: true,
    smsUpdates: true,
    emailUpdates: true,
  },
  analytics: {
    pageViews: 0,
    timeSpent: 0,
    conversionStage: 'cart',
  },
  status: 'active',
  isGuest: true,
  mergedFrom: [],
};

const CartModel = {
  CartSchema,
  AddItemToCartSchema,
  UpdateCartItemSchema,
  ApplyCouponSchema,
  CartFilterSchema,
  CartStatsSchema,
  CartItemSchema,
  CartDiscountSchema,
  CartShippingOptionSchema,
  CartTaxSchema,
  CartTotalsSchema,
  CartAddressSchema,
  validateCart,
  validateAddItemToCart,
  validateUpdateCartItem,
  validateApplyCoupon,
  validateCartFilter,
  cartUtils,
  defaultCart,
};

export default CartModel;