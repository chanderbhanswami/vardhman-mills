/**
 * MiniCartItem Component - Vardhman Mills Frontend
 * 
 * Minimal cart item display for MiniCart with:
 * - Product image
 * - Product name
 * - Quantity
 * - Price
 * - Compact design
 * 
 * @component
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface MiniCartItemProps {
  item: {
    id: string;
    productId: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    color?: string;
    size?: string;
  };
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const MiniCartItem: React.FC<MiniCartItemProps> = ({ item, className }) => {
  const hasDiscount = item.originalPrice && item.originalPrice > item.price;
  const itemTotal = item.price * item.quantity;

  return (
    <Link
      href={`/products/${item.slug}`}
      className={cn(
        'flex gap-3 p-2 rounded-lg transition-colors hover:bg-gray-50',
        className
      )}
    >
      {/* Image */}
      <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={item.image || '/images/placeholder.png'}
          alt={item.name}
          fill
          className="object-cover"
          sizes="64px"
        />
        {hasDiscount && (
          <Badge
            variant="destructive"
            size="sm"
            className="absolute top-1 right-1 h-4 px-1 text-xs flex items-center gap-0.5"
          >
            <SparklesIcon className="h-2.5 w-2.5" />
            Sale
          </Badge>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
          {item.name}
        </h4>

        {/* Variant Info */}
        {(item.color || item.size) && (
          <div className="flex items-center gap-2 mb-1">
            {item.color && (
              <span className="text-xs text-gray-600">{item.color}</span>
            )}
            {item.size && (
              <span className="text-xs text-gray-600">{item.size}</span>
            )}
          </div>
        )}

        {/* Quantity and Price */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(itemTotal, 'INR')}
            </p>
            {hasDiscount && item.originalPrice && (
              <p className="text-xs text-gray-500 line-through">
                {formatCurrency(item.originalPrice * item.quantity, 'INR')}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MiniCartItem;
