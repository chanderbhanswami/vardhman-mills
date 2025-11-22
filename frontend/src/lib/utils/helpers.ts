import { Product, ProductVariant } from '@/types';

export const getProductPrice = (product: Product): { min: number; max: number } => {
  const activeVariants = product.variants.filter(v => v.status === 'active');
  
  if (activeVariants.length === 0) {
    return { 
      min: product.pricing.basePrice.amount, 
      max: product.pricing.basePrice.amount 
    };
  }

  const prices = activeVariants.map(v => 
    v.pricing?.basePrice.amount || product.pricing.basePrice.amount
  );
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};

export const getProductDiscountPercentage = (variant: ProductVariant): number => {
  const basePrice = variant.pricing?.basePrice.amount || 0;
  const comparePrice = variant.pricing?.compareAtPrice?.amount;
  
  if (!comparePrice || comparePrice <= basePrice) {
    return 0;
  }
  
  return Math.round(((comparePrice - basePrice) / comparePrice) * 100);
};

export const isProductInStock = (product: Product): boolean => {
  return product.variants.some(v => v.status === 'active' && v.inventory.quantity > 0);
};

export const getTotalStock = (product: Product): number => {
  return product.variants
    .filter(v => v.status === 'active')
    .reduce((total, v) => total + v.inventory.quantity, 0);
};

export const getAvailableSizes = (product: Product): string[] => {
  const sizeOptions = product.variantOptions.find(option => option.type === 'size');
  if (!sizeOptions) return [];
  
  return sizeOptions.values
    .filter(value => value.isAvailable)
    .map(value => value.displayValue)
    .filter((size, index, arr) => arr.indexOf(size) === index);
};

export const getAvailableColors = (product: Product): string[] => {
  const colorOptions = product.variantOptions.find(option => option.type === 'color');
  if (!colorOptions) return [];
  
  return colorOptions.values
    .filter(value => value.isAvailable)
    .map(value => value.displayValue)
    .filter((color, index, arr) => arr.indexOf(color) === index);
};

export const generateSKU = (productName: string, variantOptions: Record<string, string> = {}): string => {
  const prefix = productName.substring(0, 3).toUpperCase();
  const size = variantOptions.size ? variantOptions.size.substring(0, 1).toUpperCase() : 'O';
  const color = variantOptions.color ? variantOptions.color.substring(0, 1).toUpperCase() : 'N';
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  
  return `${prefix}-${size}${color}-${timestamp}`;
};

export const calculateShipping = (subtotal: number, location?: string): number => {
  if (subtotal >= 1000) return 0; // Free shipping over ₹1000
  
  // Basic shipping calculation
  if (location === 'local') return 50;
  if (location === 'metro') return 75;
  return 99; // Default shipping
};

export const calculateTax = (subtotal: number): number => {
  return Math.round(subtotal * 0.18); // 18% GST
};

export const formatProductUrl = (product: Product): string => {
  return `/products/${product.slug}`;
};

export const formatCategoryUrl = (category: { slug: string }): string => {
  return `/categories/${category.slug}`;
};

export const getProductImageUrl = (product: Product, variant?: ProductVariant): string => {
  if (variant?.media?.images && variant.media.images.length > 0) {
    return variant.media.images[0].url;
  }
  
  if (product.media.images && product.media.images.length > 0) {
    return product.media.images[0].url;
  }
  
  return '/images/placeholder-product.jpg';
};

// Additional Product Helper Functions
export const getProductVariantByOptions = (product: Product, options: Record<string, string>): ProductVariant | undefined => {
  return product.variants.find(variant => 
    variant.options.every(option => 
      options[option.optionId] === option.value
    ) && variant.status === 'active'
  );
};

export const getVariantStock = (product: Product, variantId: string): number => {
  const variant = product.variants.find(v => v.id === variantId);
  return variant?.inventory.quantity || 0;
};

export const canAddToCart = (product: Product, quantity: number, variantId?: string): boolean => {
  if (variantId) {
    const stock = getVariantStock(product, variantId);
    return stock >= quantity;
  }
  return getTotalStock(product) >= quantity;
};

export const getProductRating = (product: Product): number => {
  return product.rating.average || 0;
};

export const getProductReviewCount = (product: Product): number => {
  return product.reviewCount || 0;
};

export const isProductOnSale = (product: Product): boolean => {
  return product.isOnSale || false;
};

export const getProductSalePrice = (product: Product): number | null => {
  return product.pricing.salePrice?.amount || null;
};

export const isProductNew = (product: Product): boolean => {
  return product.isNewArrival || false;
};

export const getProductTags = (product: Product): string[] => {
  const tags: string[] = [...(product.tags || [])];
  
  if (product.isNewArrival) tags.push('New');
  if (product.isOnSale) tags.push('Sale');
  if (product.isFeatured) tags.push('Featured');
  if (getTotalStock(product) <= 5) tags.push('Limited Stock');
  if (!isProductInStock(product)) tags.push('Out of Stock');
  
  return Array.from(new Set(tags)); // Remove duplicates
};

export const filterProductsByCategory = (products: Product[], categoryId: string): Product[] => {
  return products.filter(product => product.categoryId === categoryId);
};

export const filterProductsByPriceRange = (products: Product[], minPrice: number, maxPrice: number): Product[] => {
  return products.filter(product => {
    const { min } = getProductPrice(product);
    return min >= minPrice && min <= maxPrice;
  });
};

export const filterProductsByRating = (products: Product[], minRating: number): Product[] => {
  return products.filter(product => getProductRating(product) >= minRating);
};

export const sortProductsByPrice = (products: Product[], order: 'asc' | 'desc' = 'asc'): Product[] => {
  return [...products].sort((a, b) => {
    const priceA = getProductPrice(a).min;
    const priceB = getProductPrice(b).min;
    return order === 'asc' ? priceA - priceB : priceB - priceA;
  });
};

export const sortProductsByRating = (products: Product[], order: 'asc' | 'desc' = 'desc'): Product[] => {
  return [...products].sort((a, b) => {
    const ratingA = getProductRating(a);
    const ratingB = getProductRating(b);
    return order === 'asc' ? ratingA - ratingB : ratingB - ratingA;
  });
};

export const sortProductsByDate = (products: Product[], order: 'asc' | 'desc' = 'desc'): Product[] => {
  return [...products].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

export const getRelatedProducts = (products: Product[], currentProduct: Product, limit = 4): Product[] => {
  return products
    .filter(product => 
      product.id !== currentProduct.id && 
      product.categoryId === currentProduct.categoryId
    )
    .slice(0, limit);
};

export const searchProducts = (products: Product[], query: string): Product[] => {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return products;
  
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.category.name.toLowerCase().includes(searchTerm) ||
    product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

export const calculateBulkDiscount = (quantity: number, basePrice: number): number => {
  let discountPercentage = 0;
  
  if (quantity >= 100) {
    discountPercentage = 15;
  } else if (quantity >= 50) {
    discountPercentage = 10;
  } else if (quantity >= 20) {
    discountPercentage = 5;
  }
  
  return Math.round(basePrice * (discountPercentage / 100));
};

export const calculateFinalPrice = (basePrice: number, quantity: number): number => {
  const bulkDiscount = calculateBulkDiscount(quantity, basePrice);
  return basePrice - bulkDiscount;
};

export const formatProductWeight = (weight: number, unit = 'kg'): string => {
  if (weight < 1 && unit === 'kg') {
    return `${weight * 1000}g`;
  }
  return `${weight}${unit}`;
};

export const calculateEstimatedDelivery = (location?: string): { min: number; max: number } => {
  const baseDelivery = { min: 3, max: 7 };
  
  if (location === 'local') {
    return { min: 1, max: 3 };
  } else if (location === 'metro') {
    return { min: 2, max: 5 };
  }
  
  return baseDelivery;
};

export const formatDeliveryTime = (delivery: { min: number; max: number }): string => {
  if (delivery.min === delivery.max) {
    return `${delivery.min} day${delivery.min > 1 ? 's' : ''}`;
  }
  return `${delivery.min}-${delivery.max} days`;
};

export const generateProductSEOData = (product: Product) => {
  const rating = getProductRating(product);
  const reviewCount = getProductReviewCount(product);
  const { min: minPrice } = getProductPrice(product);
  
  return {
    title: `${product.name} - Vardhman Mills`,
    description: product.description.substring(0, 160),
    keywords: [product.name, product.category, 'Vardhman Mills', ...(product.tags || [])].join(', '),
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.media.images?.map(img => ({
        url: img.url,
        width: 800,
        height: 600,
        alt: product.name,
      })) || [],
      type: 'product',
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: getProductImageUrl(product),
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: 'Vardhman Mills',
      },
      offers: {
        '@type': 'Offer',
        price: minPrice.toString(),
        priceCurrency: 'INR',
        availability: isProductInStock(product) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
      aggregateRating: reviewCount > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: rating.toString(),
        reviewCount: reviewCount.toString(),
      } : undefined,
    },
  };
};

export const validateProductData = (product: Partial<Product>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!product.name || product.name.trim().length === 0) {
    errors.push('Product name is required');
  }
  
  if (!product.description || product.description.trim().length === 0) {
    errors.push('Product description is required');
  }
  
  if (!product.categoryId) {
    errors.push('Product category is required');
  }
  
  if (!product.variants || product.variants.length === 0) {
    errors.push('At least one product variant is required');
  } else {
    product.variants.forEach((variant, index) => {
      if (!variant.pricing?.basePrice.amount || variant.pricing.basePrice.amount <= 0) {
        errors.push(`Variant ${index + 1}: Price must be greater than 0`);
      }
      if (variant.inventory.quantity < 0) {
        errors.push(`Variant ${index + 1}: Stock cannot be negative`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// General utility helper functions
/**
 * Generate unique ID
 */
export function generateId(prefix = 'id'): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}${randomPart}`;
}

/**
 * Generate random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random string of specified length
 */
export function randomString(length: number, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    onRetry
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      const waitTime = delay * Math.pow(backoff, attempt - 1);
      await sleep(waitTime);
    }
  }

  throw lastError!;
}