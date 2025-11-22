'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Product } from '@/types/product.types';
import { cn, getProductPricing, getStockStatus } from '@/lib/utils';
import { Zap, TrendingUp, Sparkles, Tag, Award, Clock, Flame } from 'lucide-react';

export interface ProductBadgesProps {
  product: Product;
  className?: string;
  variant?: 'absolute' | 'stacked' | 'inline';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  maxBadges?: number;
  showPercentage?: boolean;
  animated?: boolean;
}

export const ProductBadges: React.FC<ProductBadgesProps> = ({
  product,
  className,
  variant = 'absolute',
  position = 'top-left',
  maxBadges = 3,
  showPercentage = true,
  animated = true,
}) => {
  const badges = [];
  
  // Get pricing and stock info using utilities
  const pricingData = getProductPricing(product);
  const stockStatus = getStockStatus(product);

  // Sale badge with discount percentage
  if (product.isOnSale && pricingData.hasDiscount) {
    badges.push({
      id: 'sale',
      label: showPercentage && pricingData.discountPercentage > 0 ? `-${pricingData.discountPercentage}%` : 'Sale',
      variant: 'destructive' as const,
      icon: <Tag className="h-3 w-3" />,
      priority: 1,
    });
  }

  // New arrival badge
  if (product.isNewArrival) {
    badges.push({
      id: 'new',
      label: 'New',
      variant: 'info' as const,
      icon: <Sparkles className="h-3 w-3" />,
      priority: 2,
    });
  }

  // Bestseller badge
  if (product.isBestseller) {
    badges.push({
      id: 'bestseller',
      label: 'Bestseller',
      variant: 'warning' as const,
      icon: <Flame className="h-3 w-3" />,
      priority: 3,
    });
  }

  // Featured badge
  if (product.isFeatured) {
    badges.push({
      id: 'featured',
      label: 'Featured',
      variant: 'secondary' as const,
      icon: <Award className="h-3 w-3" />,
      priority: 4,
    });
  }

  // Limited stock badge
  if (stockStatus.quantity > 0 && stockStatus.quantity <= 5) {
    badges.push({
      id: 'limited',
      label: `Only ${stockStatus.quantity} left`,
      variant: 'warning' as const,
      icon: <Clock className="h-3 w-3" />,
      priority: 5,
    });
  }

  // Out of stock badge
  if (!stockStatus.inStock) {
    badges.push({
      id: 'out-of-stock',
      label: 'Out of Stock',
      variant: 'destructive' as const,
      icon: null,
      priority: 0, // Highest priority
    });
  }

  // Low stock warning
  if (stockStatus.inStock && stockStatus.quantity > 5 && stockStatus.quantity <= 10) {
    badges.push({
      id: 'low-stock',
      label: 'Low Stock',
      variant: 'warning' as const,
      icon: <TrendingUp className="h-3 w-3" />,
      priority: 6,
    });
  }

  // Flash sale or hot deal
  if (product.tags?.includes('hot-deal') || product.tags?.includes('flash-sale')) {
    badges.push({
      id: 'hot',
      label: 'Hot Deal',
      variant: 'destructive' as const,
      icon: <Zap className="h-3 w-3" />,
      priority: 1,
    });
  }

  // Sort by priority and limit
  const sortedBadges = badges.sort((a, b) => a.priority - b.priority).slice(0, maxBadges);

  if (sortedBadges.length === 0) {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  };

  const variantClasses = {
    absolute: `absolute ${positionClasses[position]} z-10`,
    stacked: 'flex flex-col gap-1',
    inline: 'flex flex-row gap-1 flex-wrap',
  };

  return (
    <div 
      className={cn(
        variantClasses[variant],
        animated && 'transition-all duration-300',
        className
      )}
    >
      {sortedBadges.map((badge, index) => (
        <Badge
          key={badge.id}
          variant={badge.variant}
          className={cn(
            'flex items-center gap-1 font-semibold shadow-sm',
            animated && `animate-in fade-in slide-in-from-top-2 duration-300 delay-${index * 100}`,
            variant === 'inline' && 'text-xs px-2 py-0.5'
          )}
        >
          {badge.icon}
          <span>{badge.label}</span>
        </Badge>
      ))}
    </div>
  );
};

export default ProductBadges;
