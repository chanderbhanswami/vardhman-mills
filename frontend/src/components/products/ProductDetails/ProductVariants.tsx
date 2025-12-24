'use client';

import React, { useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import { Product, ProductVariant, BackendProductVariant, StockInfo } from '@/types/product.types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export interface ProductVariantsProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant) => void;
  className?: string;
}

// Helper to normalize backend variant to frontend interface
const normalizeVariant = (
  variant: ProductVariant | BackendProductVariant,
  product: Product
): ProductVariant => {
  // Check if it's already a conformant ProductVariant (has inventory object)
  if ('inventory' in variant && variant.inventory) {
    return variant as ProductVariant;
  }

  // It's a BackendProductVariant or incomplete object, normalize it
  const backendVar = variant as BackendProductVariant;
  const stock = backendVar.stock || 0;

  // Safely extract SKU
  let variantSku = 'UNKNOWN-SKU';
  if ('sku' in variant && variant.sku) {
    variantSku = variant.sku;
  } else if (backendVar.sku) {
    variantSku = backendVar.sku;
  }

  // Safely extract Name
  let variantName = '';
  if ('name' in variant) variantName = (variant as any).name;
  else if ('title' in variant) variantName = (variant as any).title;

  if (!variantName) {
    const color = backendVar.color || '';
    const size = backendVar.size || '';
    variantName = `${color} ${size}`.trim();
  }
  if (!variantName) {
    variantName = `Variant ${variantSku}`;
  }

  return {
    ...variant, // Spread first to keep other props, but allow overrides
    id: backendVar._id || backendVar.id || `var-${Math.random()}`, // Fallback ID
    productId: product.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: variantName,
    sku: variantSku,
    options: [], // Populate if needed
    inventory: {
      quantity: stock,
      isInStock: stock > 0,
      isLowStock: stock < 10 && stock > 0,
      lowStockThreshold: 10,
      availableQuantity: stock,
      backorderAllowed: false,
    } as StockInfo,
    pricing: {
      basePrice: {
        amount: backendVar.price || product.price || 0,
        currency: 'INR',
        formatted: `₹${backendVar.price || product.price || 0}`
      },
      isDynamicPricing: product.pricing?.isDynamicPricing ?? false,
      taxable: product.pricing?.taxable ?? true,
    },
    media: {
      images: (backendVar.images || []).map((url, idx) => ({
        id: `var-img-${idx}-${Math.random().toString(36).substring(7)}`,
        url,
        alt: `${variantName} - ${idx + 1}`
      })),
      primaryImage: backendVar.images && backendVar.images.length > 0
        ? {
          id: `var-img-p-${Math.random().toString(36).substring(7)}`,
          url: backendVar.images[0],
          alt: variantName
        }
        : undefined
    },
    status: 'active',
    isDefault: false,
  } as ProductVariant;
};

const ProductVariants: React.FC<ProductVariantsProps> = ({
  product,
  selectedVariant,
  onVariantChange,
  className,
}) => {

  // Normalize all variants to consistent ProductVariant type
  const variants = useMemo(() => {
    // Cast to array of union type to allow mapping
    const rawVariants = (product.variants || []) as (ProductVariant | BackendProductVariant)[];
    return rawVariants.map(v => normalizeVariant(v, product));
  }, [product]);

  // Normalize selected variant for comparison (if it might be from a different source)
  const normalizedSelectedVariant = useMemo(() => {
    return selectedVariant ? normalizeVariant(selectedVariant, product) : null;
  }, [selectedVariant, product]);

  // Auto-select first available variant if none selected
  useEffect(() => {
    if (!normalizedSelectedVariant && variants.length > 0) {
      const firstAvailable = variants.find(v => v.inventory.isInStock);
      if (firstAvailable) {
        onVariantChange(firstAvailable);
      }
    }
  }, [normalizedSelectedVariant, variants, onVariantChange]);

  const getPriceDifference = useCallback((variant: ProductVariant) => {
    const basePrice = product.pricing?.basePrice?.amount ?? product.price ?? 0;
    const variantPrice = variant.pricing?.basePrice?.amount ?? basePrice;
    const diff = variantPrice - basePrice;

    if (diff === 0) return null;
    return diff > 0 ? `+${diff}` : `${diff}`;
  }, [product]);

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Select Variant
          {normalizedSelectedVariant && (
            <span className="ml-2 text-gray-600 font-normal">
              {normalizedSelectedVariant.name}
            </span>
          )}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {variants.map((variant) => {
          const isSelected = normalizedSelectedVariant?.id === variant.id;
          const { inventory, name, id } = variant;
          const isAvailable = inventory.isInStock;
          const isLowStock = inventory.isLowStock;
          const priceDiff = getPriceDifference(variant);

          return (
            <button
              key={id}
              onClick={() => isAvailable && onVariantChange(variant)}
              disabled={!isAvailable}
              className={cn(
                'relative flex items-start gap-3 p-3 border-2 rounded-lg transition-all text-left',
                isSelected
                  ? 'border-primary-600 bg-primary-50'
                  : isAvailable
                    ? 'border-gray-200 hover:border-gray-300'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed',
                !isAvailable && 'opacity-60'
              )}
            >
              {/* Variant Image */}
              {variant.media?.primaryImage && (
                <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                  <Image
                    src={variant.media.primaryImage.url}
                    alt={variant.media.primaryImage.alt || name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Variant Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-gray-900 truncate">
                    {name}
                  </h4>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex-shrink-0 bg-primary-600 rounded-full p-0.5"
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Price Difference */}
                {priceDiff && (
                  <div className="text-sm font-medium text-gray-700">
                    {priceDiff}
                  </div>
                )}

                {/* Stock Status */}
                <div className="flex items-center gap-2 flex-wrap">
                  {!isAvailable ? (
                    <Badge variant="destructive" className="text-xs">
                      Out of Stock
                    </Badge>
                  ) : isLowStock ? (
                    <Badge variant="outline" className="text-xs text-primary-600 border-primary-300">
                      Low Stock
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                      In Stock
                    </Badge>
                  )}
                </div>
              </div>

              {/* Out of Stock Overlay */}
              {!isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Additional Info */}
      {normalizedSelectedVariant && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-primary-50 border border-primary-200 rounded-lg space-y-2"
        >
          <h4 className="font-medium text-primary-900">Selected Variant Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-primary-700">SKU:</div>
            <div className="text-primary-900 font-medium">{normalizedSelectedVariant.sku}</div>

            <div className="text-blue-700">Available:</div>
            <div className="text-blue-900 font-medium">
              {normalizedSelectedVariant.inventory.quantity} units
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProductVariants;
