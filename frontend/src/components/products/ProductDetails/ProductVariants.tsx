'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import { Product, ProductVariant } from '@/types/product.types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export interface ProductVariantsProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant) => void;
  className?: string;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({
  product,
  selectedVariant,
  onVariantChange,
  className,
}) => {
  const variants = React.useMemo(() => product.variants || [], [product.variants]);

  // Auto-select first available variant if none selected
  useEffect(() => {
    if (!selectedVariant && variants.length > 0) {
      const firstAvailable = variants.find(v => v.inventory.isInStock);
      if (firstAvailable) {
        onVariantChange(firstAvailable);
      }
    }
  }, [selectedVariant, variants, onVariantChange]);

  if (variants.length === 0) {
    return null;
  }

  const getPriceDifference = (variant: ProductVariant) => {
    const basePrice = product.pricing.basePrice.amount;
    const variantPrice = variant.pricing?.basePrice.amount || basePrice;
    const diff = variantPrice - basePrice;
    
    if (diff === 0) return null;
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Select Variant
          {selectedVariant && (
            <span className="ml-2 text-gray-600 font-normal">
              {selectedVariant.name}
            </span>
          )}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isAvailable = variant.inventory.isInStock;
          const isLowStock = variant.inventory.isLowStock;
          const priceDiff = getPriceDifference(variant);

          return (
            <button
              key={variant.id}
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
                    alt={variant.media.primaryImage.alt || variant.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Variant Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-gray-900 truncate">
                    {variant.name}
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
      {selectedVariant && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-primary-50 border border-primary-200 rounded-lg space-y-2"
        >
          <h4 className="font-medium text-primary-900">Selected Variant Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-primary-700">SKU:</div>
            <div className="text-primary-900 font-medium">{selectedVariant.sku}</div>
            
            {selectedVariant.inventory.quantity && (
              <>
                <div className="text-blue-700">Available:</div>
                <div className="text-blue-900 font-medium">
                  {selectedVariant.inventory.quantity} units
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProductVariants;
