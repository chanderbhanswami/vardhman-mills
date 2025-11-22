'use client';

import React from 'react';
import { Product, ProductVariant } from '@/types/product.types';
import { cn } from '@/lib/utils';
import { getProductPricing, formatPrice, hasBulkPricing, isEligibleForEMI, calculateEMI } from '@/lib/utils/pricing';
import { TrendingDown, Tag } from 'lucide-react';

export interface ProductPriceProps {
  product: Product;
  variant?: ProductVariant;
  className?: string;
  showOriginalPrice?: boolean;
  showSavings?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
  currency?: string;
}

export const ProductPrice: React.FC<ProductPriceProps> = ({
  product,
  variant,
  className,
  showOriginalPrice = true,
  showSavings = true,
  showPercentage = true,
  size = 'md',
  layout = 'horizontal',
  currency = '₹',
}) => {
  // Use pricing utility to handle both backend and frontend structures
  const pricingData = getProductPricing(product, variant);
  
  if (pricingData.currentPrice === 0) {
    return (
      <div className={cn('text-gray-500 text-sm', className)}>
        Price not available
      </div>
    );
  }
  
  const { currentPrice, originalPrice, hasDiscount, discountAmount, discountPercentage } = pricingData;

  const sizeClasses = {
    sm: {
      current: 'text-lg font-bold',
      original: 'text-sm',
      savings: 'text-xs',
    },
    md: {
      current: 'text-xl font-bold',
      original: 'text-base',
      savings: 'text-sm',
    },
    lg: {
      current: 'text-2xl font-bold',
      original: 'text-lg',
      savings: 'text-base',
    },
  };

  const layoutClasses = {
    horizontal: 'flex items-center gap-2 flex-wrap',
    vertical: 'flex flex-col gap-1',
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className={cn(layoutClasses[layout])}>
        {/* Current Price */}
        <div className={cn(
          sizeClasses[size].current,
          hasDiscount ? 'text-red-600' : 'text-gray-900'
        )}>
          {currency}{currentPrice.toLocaleString()}
        </div>

        {/* Original Price (Strikethrough) */}
        {showOriginalPrice && hasDiscount && originalPrice && (
          <div className={cn(
            sizeClasses[size].original,
            'text-gray-500 line-through'
          )}>
            {currency}{originalPrice.toLocaleString()}
          </div>
        )}

        {/* Discount Percentage */}
        {showPercentage && hasDiscount && discountPercentage > 0 && (
          <div className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
            <TrendingDown className="h-3 w-3" />
            <span>{discountPercentage}% OFF</span>
          </div>
        )}
      </div>

      {/* Savings Amount */}
      {showSavings && hasDiscount && discountAmount > 0 && (
        <div className={cn(
          sizeClasses[size].savings,
          'text-green-600 font-medium flex items-center gap-1'
        )}>
          <Tag className="h-3.5 w-3.5" />
          <span>
            You save {currency}{discountAmount.toLocaleString()}
          </span>
        </div>
      )}

      {/* Bulk Pricing Info */}
      {hasBulkPricing(product) && product.pricing?.bulkPricing && (
        <div className="text-xs text-gray-600 flex items-center gap-1">
          <span className="font-medium">Bulk pricing available</span>
          <span className="text-gray-400">
            (Buy {product.pricing.bulkPricing[0].minQuantity}+ and save more)
          </span>
        </div>
      )}

      {/* EMI Option */}
      {isEligibleForEMI(currentPrice) && (
        <div className="text-xs text-primary-600 font-medium">
          EMI from {currency}{calculateEMI(currentPrice).toLocaleString()}/month
        </div>
      )}

      {/* Price per unit (if applicable) */}
      {product.specifications && Array.isArray(product.specifications) && product.specifications.find((spec: any) => spec.name === 'unit') && (
        <div className="text-xs text-gray-500">
          {currency}{(currentPrice / parseFloat(product.specifications.find((spec: any) => spec.name === 'quantity')?.value || '1')).toFixed(2)} per unit
        </div>
      )}
    </div>
  );
};

export default ProductPrice;
