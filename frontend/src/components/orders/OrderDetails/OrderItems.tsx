'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  StarIcon,
  TagIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Input } from '@/components/ui/Input';
import { Tooltip } from '@/components/ui/Tooltip';
import Image from 'next/image';
import Link from 'next/link';
import type { OrderItem, Order } from '@/types/order.types';
import type { Price } from '@/types/common.types';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

// Helper to get numeric amount from Price object
const getPriceAmount = (price: Price | number): number => {
  if (typeof price === 'number') return price;
  return price.amount;
};

interface OrderItemsProps {
  order: Order;
  className?: string;
  onItemAction?: (itemId: string, action: string) => void;
  showActions?: boolean;
  enableSearch?: boolean;
}

export const OrderItems: React.FC<OrderItemsProps> = ({
  order,
  className,
  onItemAction,
  showActions = true,
  enableSearch = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return order.items;

    const query = searchQuery.toLowerCase();
    return order.items.filter(
      (item) =>
        item.product?.name?.toLowerCase().includes(query) ||
        item.product?.sku?.toLowerCase().includes(query) ||
        item.variant?.name?.toLowerCase().includes(query)
    );
  }, [order.items, searchQuery]);

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getAvailabilityStatus = (item: OrderItem) => {
    if (item.fulfillmentStatus === 'shipped' || item.fulfillmentStatus === 'delivered') {
      return { icon: CheckCircleIcon, color: 'text-green-600', label: 'Fulfilled' };
    } else if (item.fulfillmentStatus === 'cancelled') {
      return { icon: XCircleIcon, color: 'text-red-600', label: 'Cancelled' };
    } else if (item.fulfillmentStatus === 'pending') {
      return { icon: ExclamationCircleIcon, color: 'text-yellow-600', label: 'Pending' };
    }
    return { icon: TruckIcon, color: 'text-blue-600', label: 'Processing' };
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
            <p className="text-sm text-gray-500">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {enableSearch && (
          <div className="relative w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => {
            const isExpanded = expandedItems.has(item.id);
            const statusInfo = getAvailabilityStatus(item);
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link
                      href={`/products/${item.product?.slug || item.productId}`}
                      className="relative flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden group"
                    >
                      {(item.product?.media?.primaryImage?.url || item.product?.media?.images?.[0]?.url) ? (
                        <Image
                          src={item.product.media.primaryImage?.url || item.product.media.images[0].url}
                          alt={item.product.name || 'Product'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      {item.originalPrice &&
                        getPriceAmount(item.originalPrice) > getPriceAmount(item.unitPrice) && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="destructive" size="xs">
                              -
                              {Math.round(
                                ((getPriceAmount(item.originalPrice) - getPriceAmount(item.unitPrice)) /
                                  getPriceAmount(item.originalPrice)) *
                                  100
                              )}
                              %
                            </Badge>
                          </div>
                        )}
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.product?.slug || item.productId}`}
                            className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                          >
                            {item.product?.name || 'Product Name'}
                          </Link>
                          
                          {item.product?.sku && (
                            <p className="text-xs text-gray-500 mt-0.5">SKU: {item.product.sku}</p>
                          )}

                          {item.variant && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.variant.options?.map((option) => (
                                <Badge key={option.id} variant="secondary" size="xs">
                                  {option.displayValue}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <Tooltip content={statusInfo.label}>
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full">
                            <StatusIcon className={cn('h-4 w-4', statusInfo.color)} />
                            <span className={cn('text-xs font-medium', statusInfo.color)}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </Tooltip>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center gap-4 mb-2">
                        <div>
                          <span className="text-sm text-gray-500">Quantity: </span>
                          <span className="text-sm font-medium text-gray-900">{item.quantity}</span>
                        </div>
                        <Divider orientation="vertical" className="h-4" />
                        <div>
                          <span className="text-sm text-gray-500">Price: </span>
                          {item.originalPrice && getPriceAmount(item.originalPrice) > getPriceAmount(item.unitPrice) ? (
                            <div className="inline-flex items-center gap-2">
                              <span className="text-sm line-through text-gray-400">
                                {formatCurrency(getPriceAmount(item.originalPrice))}
                              </span>
                              <span className="text-sm font-semibold text-red-600">
                                {formatCurrency(getPriceAmount(item.unitPrice))}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(getPriceAmount(item.unitPrice))}
                            </span>
                          )}
                        </div>
                        <Divider orientation="vertical" className="h-4" />
                        <div>
                          <span className="text-sm text-gray-500">Total: </span>
                          <span className="text-base font-bold text-gray-900">
                            {formatCurrency(getPriceAmount(item.totalPrice))}
                          </span>
                        </div>
                      </div>

                      {/* Applied Discounts */}
                      {item.appliedDiscounts && item.appliedDiscounts.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {item.appliedDiscounts.map((discount, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded"
                            >
                              <TagIcon className="h-3 w-3" />
                              <span>{discount.name}</span>
                              <span className="font-medium">-{formatCurrency(getPriceAmount(discount.amount))}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Customizations */}
                      {item.customization && (
                        <button
                          onClick={() => toggleItemExpansion(item.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          {isExpanded ? '▼' : '▶'} View Customizations
                        </button>
                      )}

                      {/* Expanded Customization Details */}
                      {isExpanded && item.customization && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100"
                        >
                          <h4 className="text-xs font-semibold text-blue-900 mb-2">
                            Customizations
                          </h4>
                          <div className="space-y-2">
                            {item.customization.options?.map((option, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-blue-700">{option.name}:</span>
                                <span className="font-medium text-blue-900">
                                  {option.value}
                                  {option.price && getPriceAmount(option.price) > 0 && (
                                    <span className="ml-1 text-blue-600">
                                      +{formatCurrency(getPriceAmount(option.price))}
                                    </span>
                                  )}
                                </span>
                              </div>
                            ))}
                            {item.customization.instructions && (
                              <div className="pt-2 border-t border-blue-200">
                                <p className="text-xs text-blue-700">
                                  <strong>Instructions:</strong> {item.customization.instructions}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Actions */}
                      {showActions && order.status === 'delivered' && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="xs"
                            variant="outline"
                            leftIcon={<StarIcon className="h-3 w-3" />}
                            onClick={() => onItemAction?.(item.id, 'review')}
                          >
                            Review
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            leftIcon={<ArrowPathIcon className="h-3 w-3" />}
                            onClick={() => onItemAction?.(item.id, 'reorder')}
                          >
                            Buy Again
                          </Button>
                        </div>
                      )}

                      {/* Tracking Info */}
                      {item.trackingNumber && (
                        <div className="mt-3 p-2 bg-gray-50 rounded flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TruckIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              Tracking: {item.trackingNumber}
                            </span>
                          </div>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => onItemAction?.(item.id, 'track')}
                          >
                            Track
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <Card className="p-8 text-center">
            <ShoppingBagIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchQuery ? 'No items match your search.' : 'No items in this order.'}
            </p>
          </Card>
        )}
      </div>

      {/* Order Summary */}
      <Card className="p-6 bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Order Summary</h4>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({filteredItems.length} items)</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(getPriceAmount(order.subtotal))}
            </span>
          </div>

          {getPriceAmount(order.discountAmount) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-green-600">
                -{formatCurrency(getPriceAmount(order.discountAmount))}
              </span>
            </div>
          )}

          {order.appliedCoupons && order.appliedCoupons.length > 0 && (
            <div className="space-y-1">
              {order.appliedCoupons.map((coupon, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-gray-500">
                    <TagIcon className="h-3 w-3 inline mr-1" />
                    Coupon: {coupon.code}
                  </span>
                  <span className="text-green-600">
                    -{formatCurrency(getPriceAmount(coupon.discountAmount))}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium text-gray-900">
              {getPriceAmount(order.shippingAmount) > 0
                ? formatCurrency(getPriceAmount(order.shippingAmount))
                : 'FREE'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(getPriceAmount(order.taxAmount))}
            </span>
          </div>

          <Divider className="my-3" />

          <div className="flex justify-between">
            <span className="text-base font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(getPriceAmount(order.total))}
            </span>
          </div>

          {order.currency && order.currency !== 'INR' && (
            <p className="text-xs text-gray-500 text-center">
              Amount in {order.currency}
            </p>
          )}
        </div>
      </Card>


    </div>
  );
};

export default OrderItems;
