/**
 * Pricing Utilities
 * Helper functions to handle both backend and frontend product pricing structures
 */

import { Product, ProductVariant, BackendProductVariant } from '@/types/product.types';

export interface PriceData {
  currentPrice: number;
  originalPrice: number | null;
  hasDiscount: boolean;
  discountAmount: number;
  discountPercentage: number;
  currency: string;
}

/**
 * Get pricing data from a product, handling both backend and frontend structures
 */
export function getProductPricing(product: Product, variant?: ProductVariant | BackendProductVariant): PriceData {
  let currentPrice: number;
  let originalPrice: number | null = null;
  const currency = 'INR';

  // Check if we have frontend pricing structure
  if (product.pricing?.basePrice) {
    const pricing = variant?.pricing || product.pricing;
    currentPrice = pricing.salePrice?.amount || pricing.basePrice.amount;
    originalPrice = pricing.compareAtPrice?.amount || (pricing.salePrice ? pricing.basePrice.amount : null);
  }
  // Check for backend variant structure
  else if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    const selectedVariant = variant || product.variants[0];
    
    // Type guard for backend variant
    if ('price' in selectedVariant && typeof selectedVariant.price === 'number') {
      currentPrice = selectedVariant.price;
      originalPrice = selectedVariant.comparePrice || null;
    } else if ('pricing' in selectedVariant && selectedVariant.pricing?.basePrice) {
      // Frontend variant structure
      const pricing = selectedVariant.pricing;
      currentPrice = pricing.salePrice?.amount || pricing.basePrice.amount;
      originalPrice = pricing.compareAtPrice?.amount || (pricing.salePrice ? pricing.basePrice.amount : null);
    } else {
      currentPrice = 0;
    }
  }
  // Fallback to direct price field
  else if (product.price && typeof product.price === 'number') {
    currentPrice = product.price;
  } else {
    currentPrice = 0;
  }

  const hasDiscount = !!originalPrice && originalPrice > currentPrice;
  const discountAmount = hasDiscount ? originalPrice - currentPrice : 0;
  const discountPercentage = hasDiscount && originalPrice ? Math.round((discountAmount / originalPrice) * 100) : 0;

  return {
    currentPrice,
    originalPrice,
    hasDiscount,
    discountAmount,
    discountPercentage,
    currency,
  };
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currency: string = 'INR', showSymbol: boolean = true): string {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const symbol = showSymbol ? (symbols[currency] || currency) : '';
  return `${symbol}${amount.toLocaleString('en-IN')}`;
}

/**
 * Check if product has bulk pricing
 */
export function hasBulkPricing(product: Product): boolean {
  return !!(product.pricing?.bulkPricing && product.pricing.bulkPricing.length > 0);
}

/**
 * Check if product is eligible for EMI
 */
export function isEligibleForEMI(price: number, threshold: number = 5000): boolean {
  return price >= threshold;
}

/**
 * Calculate EMI amount
 */
export function calculateEMI(price: number, months: number = 12): number {
  return Math.round(price / months);
}

/**
 * Get stock status from product
 */
export function getStockStatus(product: Product, variant?: ProductVariant | BackendProductVariant): {
  inStock: boolean;
  quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
} {
  let quantity = 0;

  // Check variant stock
  if (variant) {
    if ('stock' in variant && typeof variant.stock === 'number') {
      quantity = variant.stock;
    } else if (variant.inventory?.quantity) {
      quantity = variant.inventory.quantity;
    }
  }
  // Check product-level stock
  else if (product.stock && typeof product.stock === 'number') {
    quantity = product.stock;
  } else if (product.inventory?.quantity) {
    quantity = product.inventory.quantity;
  }
  // Check if variants array has stock
  else if (product.variants && Array.isArray(product.variants)) {
    quantity = product.variants.reduce((total, v) => {
      if ('stock' in v && typeof v.stock === 'number') {
        return total + v.stock;
      }
      return total;
    }, 0);
  }

  const inStock = quantity > 0;
  const status = quantity === 0 ? 'out_of_stock' : quantity < 10 ? 'low_stock' : 'in_stock';

  return { inStock, quantity, status };
}
