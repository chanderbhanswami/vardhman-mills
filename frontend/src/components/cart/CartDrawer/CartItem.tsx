/**
 * CartItem Component (CartDrawer) - Vardhman Mills Frontend
 * 
 * Individual cart item in drawer with:
 * - Product image and details
 * - Quantity controls
 * - Remove button
 * - Price display
 * - Stock status
 * - Compact mode
 * 
 * @component
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    inStock: number;
    maxQuantity?: number;
    color?: string;
    size?: string;
    sku: string;
  };
  onRemove?: () => void;
  onUpdateQuantity?: (quantity: number) => void;
  isRemoving?: boolean;
  compact?: boolean;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onRemove,
  onUpdateQuantity,
  isRemoving = false,
  compact = false,
  className,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const isLowStock = item.inStock > 0 && item.inStock < 5;
  const isOutOfStock = item.inStock === 0;
  const hasDiscount = item.originalPrice && item.originalPrice > item.price;
  const maxQty = item.maxQuantity || item.inStock;

  const handleQuantityChange = useCallback(
    async (newQuantity: number) => {
      if (newQuantity < 1 || newQuantity > maxQty || !onUpdateQuantity) return;

      setIsUpdating(true);
      try {
        await onUpdateQuantity(newQuantity);
      } finally {
        setIsUpdating(false);
      }
    },
    [maxQty, onUpdateQuantity]
  );

  const handleIncrement = () => handleQuantityChange(item.quantity + 1);
  const handleDecrement = () => handleQuantityChange(item.quantity - 1);

  return (
    <motion.div
      layout
      className={cn(
        'relative flex gap-4 p-4 bg-white border border-gray-200 rounded-lg',
        compact && 'p-3 gap-3',
        (isRemoving || isUpdating) && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {/* Loading Overlay */}
      {(isRemoving || isUpdating) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg z-10">
          <Spinner size="sm" />
        </div>
      )}

      {/* Product Image */}
      <Link
        href={`/products/${item.slug}`}
        className="flex-shrink-0 relative group"
      >
        <div className={cn('relative overflow-hidden rounded-lg', compact ? 'w-16 h-16' : 'w-20 h-20')}>
          <Image
            src={item.image || '/images/placeholder.png'}
            alt={item.name}
            fill
            className="object-cover transition-transform group-hover:scale-110"
            sizes="(max-width: 768px) 64px, 80px"
          />
          {hasDiscount && (
            <Badge
              variant="destructive"
              size="sm"
              className="absolute top-1 right-1 flex items-center gap-1 px-1 text-xs"
            >
              <SparklesIcon className="h-3 w-3" />
              Sale
            </Badge>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        {/* Name and Remove Button */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            href={`/products/${item.slug}`}
            className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
          >
            {item.name}
          </Link>

          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={isRemoving}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 flex-shrink-0"
              aria-label="Remove item"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Variant Info */}
        {(item.color || item.size) && (
          <div className="flex items-center gap-2 mb-2">
            {item.color && (
              <span className="text-xs text-gray-600">
                Color: <span className="font-medium">{item.color}</span>
              </span>
            )}
            {item.size && (
              <span className="text-xs text-gray-600">
                Size: <span className="font-medium">{item.size}</span>
              </span>
            )}
          </div>
        )}

        {/* SKU */}
        {!compact && (
          <p className="text-xs text-gray-500 mb-2">SKU: {item.sku}</p>
        )}

        {/* Stock Warning */}
        {isOutOfStock ? (
          <Badge variant="destructive" size="sm" className="mb-2">
            Out of Stock
          </Badge>
        ) : isLowStock ? (
          <Badge variant="warning" size="sm" className="mb-2 flex items-center gap-1 w-fit">
            <ExclamationTriangleIcon className="h-3 w-3" />
            Only {item.inStock} left
          </Badge>
        ) : null}

        {/* Price and Quantity */}
        <div className="flex items-end justify-between gap-2">
          {/* Quantity Controls */}
          {onUpdateQuantity && (
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDecrement}
                disabled={item.quantity <= 1 || isUpdating}
                className="h-7 w-7 p-0 rounded-none hover:bg-gray-100"
              >
                <MinusIcon className="h-3 w-3" />
              </Button>

              <div className="h-7 w-10 flex items-center justify-center text-sm font-medium border-x border-gray-300">
                {item.quantity}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleIncrement}
                disabled={item.quantity >= maxQty || isUpdating}
                className="h-7 w-7 p-0 rounded-none hover:bg-gray-100"
              >
                <PlusIcon className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Price */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <span className={cn('font-semibold', compact ? 'text-sm' : 'text-base')}>
                {formatCurrency(item.price * item.quantity, 'INR')}
              </span>
            </div>
            {hasDiscount && item.originalPrice && (
              <div className="flex items-center justify-end gap-1">
                <span className="text-xs text-gray-500 line-through">
                  {formatCurrency(item.originalPrice * item.quantity, 'INR')}
                </span>
              </div>
            )}
            {compact && item.quantity > 1 && (
              <p className="text-xs text-gray-500">
                {formatCurrency(item.price, 'INR')} each
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
