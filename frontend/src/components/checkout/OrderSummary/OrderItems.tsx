'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrashIcon,
  HeartIcon,
  BookmarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  MinusIcon,
  PlusIcon,
  GiftIcon,
  SparklesIcon,
  TagIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { toast } from 'react-hot-toast';
import type { OrderItem, CartItem } from '@/types/cart.types';
import type { ID } from '@/types/common.types';

interface OrderItemsProps {
  items: OrderItem[] | CartItem[];
  editable?: boolean;
  onUpdateQuantity?: (itemId: ID, quantity: number) => Promise<void>;
  onRemove?: (itemId: ID) => Promise<void>;
  onSaveForLater?: (itemId: ID) => Promise<void>;
  onMoveToWishlist?: (itemId: ID) => Promise<void>;
  showImages?: boolean;
  compact?: boolean;
  maxItems?: number;
  className?: string;
}

export function OrderItems({
  items,
  editable = false,
  onUpdateQuantity,
  onRemove,
  onSaveForLater,
  onMoveToWishlist,
  showImages = true,
  compact = false,
  maxItems,
  className = '',
}: OrderItemsProps) {
  const [isUpdating, setIsUpdating] = useState<ID | null>(null);
  const [savedItems, setSavedItems] = useState<Set<ID>>(new Set());

  const displayItems = maxItems ? items.slice(0, maxItems) : items;
  const hasMoreItems = maxItems && items.length > maxItems;

  const handleQuantityChange = async (itemId: ID, newQuantity: number) => {
    if (!onUpdateQuantity || newQuantity < 1 || newQuantity > 99) return;

    setIsUpdating(itemId);
    try {
      await onUpdateQuantity(itemId, newQuantity);
      toast.success('Quantity updated');
    } catch (error) {
      toast.error('Failed to update quantity');
      console.error('Update quantity error:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleIncrement = (item: OrderItem | CartItem) => {
    if (item.quantity < 99) {
      handleQuantityChange(item.id, item.quantity + 1);
    }
  };

  const handleDecrement = (item: OrderItem | CartItem) => {
    if (item.quantity > 1) {
      handleQuantityChange(item.id, item.quantity - 1);
    }
  };

  const handleRemove = async (itemId: ID) => {
    if (!onRemove) return;

    try {
      await onRemove(itemId);
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
      console.error('Remove item error:', error);
    }
  };

  const handleSaveForLater = async (itemId: ID) => {
    if (!onSaveForLater) return;

    try {
      await onSaveForLater(itemId);
      toast.success('Item saved for later');
      setSavedItems(prev => new Set([...Array.from(prev), itemId]));
    } catch (error) {
      toast.error('Failed to save item');
      console.error('Save for later error:', error);
    }
  };

  const handleMoveToWishlist = async (itemId: ID) => {
    if (!onMoveToWishlist) return;

    try {
      await onMoveToWishlist(itemId);
      toast.success('Item moved to wishlist');
    } catch (error) {
      toast.error('Failed to move to wishlist');
      console.error('Move to wishlist error:', error);
    }
  };

  const getItemImage = (item: CartItem | OrderItem): string | undefined => {
    return item.product?.media?.images?.[0]?.url;
  };

  const getItemLink = (item: CartItem | OrderItem): string => {
    return `/products/${item.product.slug}`;
  };

  const calculateSavings = (item: CartItem | OrderItem): number | null => {
    if (item.originalPrice && item.originalPrice.amount > item.unitPrice.amount) {
      return (item.originalPrice.amount - item.unitPrice.amount) * item.quantity;
    }
    return null;
  };

  const getDiscountPercentage = (item: CartItem | OrderItem): number | null => {
    if (item.originalPrice && item.originalPrice.amount > item.unitPrice.amount) {
      return Math.round(((item.originalPrice.amount - item.unitPrice.amount) / item.originalPrice.amount) * 100);
    }
    return null;
  };

  // Check if item has customization
  const hasCustomization = (item: CartItem | OrderItem): boolean => {
    return !!(item.customization && item.customization.options && item.customization.options.length > 0);
  };

  // Check if item has gift wrap
  const hasGiftWrap = (item: CartItem | OrderItem): boolean => {
    return !!(item.giftWrap && item.personalMessage);
  };

  if (!items || items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <TagIcon className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-center">No items found</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence mode="popLayout">
        {displayItems.map((item, index) => {
          const savings = calculateSavings(item);
          const discountPercent = getDiscountPercentage(item);
          const itemImage = getItemImage(item);
          const itemLink = getItemLink(item);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative"
            >
              {/* Updating Overlay */}
              {isUpdating === item.id && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              )}

              <div className={`flex gap-4 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                compact ? 'p-3' : 'p-4'
              }`}>
                {/* Product Image */}
                {showImages && (
                  <div className={`relative flex-shrink-0 ${compact ? 'w-20 h-20' : 'w-24 h-24'}`}>
                    {itemImage ? (
                      <Image
                        src={itemImage}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-md"
                        sizes={compact ? '80px' : '96px'}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex items-center justify-center">
                        <TagIcon className={`text-gray-400 ${compact ? 'h-6 w-6' : 'h-8 w-8'}`} />
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {discountPercent && (
                      <Badge
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 bg-red-500 text-white"
                      >
                        -{discountPercent}%
                      </Badge>
                    )}
                  </div>
                )}

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <Link
                        href={itemLink}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      {item.product.sku && (
                        <p className="text-xs text-gray-500 mt-1">SKU: {item.product.sku}</p>
                      )}
                    </div>

                    {/* Item Actions */}
                    {editable && (
                      <div className="flex gap-1">
                        {onMoveToWishlist && (
                          <Tooltip content="Move to Wishlist">
                            <button
                              onClick={() => handleMoveToWishlist(item.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="Move to wishlist"
                            >
                              <HeartIcon className="h-5 w-5" />
                            </button>
                          </Tooltip>
                        )}
                        {onSaveForLater && (
                          <Tooltip content="Save for Later">
                            <button
                              onClick={() => handleSaveForLater(item.id)}
                              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                              aria-label="Save for later"
                              disabled={savedItems.has(item.id)}
                            >
                              <BookmarkIcon className="h-5 w-5" />
                            </button>
                          </Tooltip>
                        )}
                        {onRemove && (
                          <Tooltip content="Remove">
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="Remove item"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Variant Options */}
                  {item.variant && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.variant.options?.map((option, optIdx) => (
                        <Badge key={optIdx} variant="outline" size="sm" className="text-xs">
                          {option.displayValue || option.value}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Customization Info */}
                  {hasCustomization(item) && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                      <div className="flex items-start gap-2">
                        <SparklesIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-blue-900 mb-1">Customization</p>
                          <div className="space-y-1">
                            {item.customization?.options.map((opt, optIdx) => (
                              <div key={optIdx} className="text-xs text-blue-700">
                                <span className="font-medium">{opt.name}:</span> {opt.value}
                                {opt.price && opt.price.amount > 0 && (
                                  <span className="text-blue-600"> (+{opt.price.formatted})</span>
                                )}
                              </div>
                            ))}
                          </div>
                          {item.customization?.instructions && (
                            <p className="text-xs text-blue-600 mt-1 italic">
                              Note: {item.customization.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gift Wrap Info */}
                  {hasGiftWrap(item) && (
                    <div className="bg-purple-50 border border-purple-200 rounded p-2 mb-2">
                      <div className="flex items-start gap-2">
                        <GiftIcon className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-purple-900">Gift Wrap</p>
                          {item.personalMessage && (
                            <p className="text-xs text-gray-700 mt-1 italic">&ldquo;{item.personalMessage}&rdquo;</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pricing and Quantity */}
                  <div className="flex items-center justify-between gap-4 mt-3">
                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      {editable ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 mr-1">Qty:</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDecrement(item)}
                            disabled={item.quantity <= 1 || isUpdating === item.id}
                            className="h-7 w-7 p-0"
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon className="h-3 w-3" />
                          </Button>
                          <input
                            type="number"
                            min="1"
                            max={99}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            className="w-12 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isUpdating === item.id}
                            aria-label={`Quantity for ${item.product.name}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleIncrement(item)}
                            disabled={item.quantity >= 99 || isUpdating === item.id}
                            className="h-7 w-7 p-0"
                            aria-label="Increase quantity"
                          >
                            <PlusIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                      )}

                      {/* Availability Status */}
                      {'isAvailable' in item && !item.isAvailable && (
                        <Badge variant="destructive" size="sm">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          Out of Stock
                        </Badge>
                      )}
                      {'isAvailable' in item && item.isAvailable && 'availabilityMessage' in item && item.availabilityMessage && (
                        <Badge variant="success" size="sm">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          {item.availabilityMessage}
                        </Badge>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {item.originalPrice && item.originalPrice.amount > item.unitPrice.amount && (
                          <span className="text-xs text-gray-400 line-through">
                            {item.originalPrice.formatted}
                          </span>
                        )}
                        <span className="text-sm font-semibold text-gray-900">
                          {item.unitPrice.formatted}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Total: <span className="font-medium text-gray-900">{item.totalPrice.formatted}</span>
                      </div>
                      {savings && savings > 0 && (
                        <div className="text-xs text-green-600 font-medium mt-0.5">
                          Save {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: item.unitPrice.currency
                          }).format(savings)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Applied Discounts */}
                  {item.appliedDiscounts && item.appliedDiscounts.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {item.appliedDiscounts.map((discount, discIdx) => (
                          <Badge key={discIdx} variant="success" size="sm" className="text-xs">
                            <TagIcon className="h-3 w-3 mr-1" />
                            {discount.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Edit Customization Button */}
                  {editable && hasCustomization(item) && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit Customization
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Show More Items Message */}
      {hasMoreItems && (
        <div className="text-center py-3 text-sm text-gray-500">
          + {items.length - maxItems!} more {items.length - maxItems! === 1 ? 'item' : 'items'}
        </div>
      )}
    </div>
  );
}
