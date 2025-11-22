'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronRightIcon,
  EyeIcon,
  ArrowPathIcon,
  ReceiptPercentIcon,
  MapPinIcon,
  CreditCardIcon,
  TagIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { Progress } from '@/components/ui/Progress';
import Image from 'next/image';
import Link from 'next/link';
import type { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '@/types/order.types';
import type { Price } from '@/types/common.types';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  showProgress?: boolean;
  showItems?: boolean;
  onViewDetails?: (orderId: string) => void;
  onReorder?: (orderId: string) => void;
  onTrackOrder?: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
  className?: string;
}

// Helper function to extract amount from Price object
const getPriceAmount = (price: Price | number): number => {
  return typeof price === 'number' ? price : price.amount;
};

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  variant = 'default',
  showActions = true,
  showProgress = true,
  showItems = true,
  onViewDetails,
  onReorder,
  onTrackOrder,
  onCancelOrder,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get status configuration
  const getStatusConfig = (status: OrderStatus) => {
    const configs: Record<
      OrderStatus,
      {
        icon: React.ElementType;
        color: string;
        bgColor: string;
        label: string;
      }
    > = {
      pending: {
        icon: ClockIcon,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        label: 'Pending',
      },
      confirmed: {
        icon: CheckCircleIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        label: 'Confirmed',
      },
      processing: {
        icon: ShoppingBagIcon,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        label: 'Processing',
      },
      shipped: {
        icon: TruckIcon,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        label: 'Shipped',
      },
      delivered: {
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        label: 'Delivered',
      },
      completed: {
        icon: CheckCircleIcon,
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        label: 'Completed',
      },
      cancelled: {
        icon: XCircleIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        label: 'Cancelled',
      },
      refunded: {
        icon: ReceiptPercentIcon,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        label: 'Refunded',
      },
      partially_shipped: {
        icon: TruckIcon,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        label: 'Partially Shipped',
      },
      partially_delivered: {
        icon: CheckCircleIcon,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        label: 'Partially Delivered',
      },
      on_hold: {
        icon: ClockIcon,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        label: 'On Hold',
      },
    };

    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  // Get payment status badge
  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
      pending: 'warning',
      processing: 'secondary',
      paid: 'success',
      failed: 'destructive',
      partially_paid: 'warning',
      refunded: 'secondary',
      partially_refunded: 'secondary',
      cancelled: 'destructive',
      authorized: 'secondary',
      expired: 'destructive',
    };

    const labels: Record<PaymentStatus, string> = {
      pending: 'Pending',
      processing: 'Processing',
      paid: 'Paid',
      failed: 'Failed',
      partially_paid: 'Partially Paid',
      refunded: 'Refunded',
      partially_refunded: 'Partially Refunded',
      cancelled: 'Cancelled',
      authorized: 'Authorized',
      expired: 'Expired',
    };

    return (
      <Badge variant={variants[status]} size="xs">
        {labels[status]}
      </Badge>
    );
  };

  // Get fulfillment status badge
  const getFulfillmentStatusBadge = (status: FulfillmentStatus) => {
    const variants: Record<FulfillmentStatus, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
      pending: 'warning',
      processing: 'secondary',
      ready: 'secondary',
      shipped: 'secondary',
      in_transit: 'secondary',
      out_for_delivery: 'secondary',
      delivered: 'success',
      failed: 'destructive',
      cancelled: 'destructive',
      returned: 'warning',
    };

    const labels: Record<FulfillmentStatus, string> = {
      pending: 'Pending',
      processing: 'Processing',
      ready: 'Ready',
      shipped: 'Shipped',
      in_transit: 'In Transit',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      failed: 'Failed',
      cancelled: 'Cancelled',
      returned: 'Returned',
    };

    return (
      <Badge variant={variants[status]} size="xs">
        {labels[status]}
      </Badge>
    );
  };

  // Calculate order progress percentage
  const getOrderProgress = (): number => {
    const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed'];
    const currentIndex = statusOrder.findIndex(s => s === order.status);
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  // Check if order can be cancelled
  const canCancelOrder = (): boolean => {
    return ['pending', 'confirmed'].includes(order.status);
  };

  // Check if order can be tracked
  const canTrackOrder = (): boolean => {
    return ['shipped', 'in_transit', 'out_for_delivery'].includes(order.fulfillmentStatus) && !!order.trackingNumber;
  };

  // Check if order can be reordered
  const canReorder = (): boolean => {
    return ['delivered', 'completed'].includes(order.status);
  };

  // Render compact variant
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={cn(
            'p-4 cursor-pointer transition-all duration-300',
            isHovered && 'shadow-lg',
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => onViewDetails?.(order.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Status Icon */}
              <div className={cn('p-2 rounded-lg', statusConfig.bgColor)}>
                <StatusIcon className={cn('h-5 w-5', statusConfig.color)} />
              </div>

              {/* Order Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    Order #{order.orderNumber}
                  </p>
                  <Badge variant="secondary" size="xs">
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {formatDate(order.placedAt, 'medium')} • {order.items.length} items
                </p>
              </div>

              {/* Total */}
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(getPriceAmount(order.total))}
                </p>
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
            </div>

            <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" />
          </div>
        </Card>
      </motion.div>
    );
  }

  // Render default/detailed variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn('overflow-hidden transition-shadow duration-300', isHovered && 'shadow-xl', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {/* Status Icon */}
              <div className={cn('p-3 rounded-xl shadow-sm', statusConfig.bgColor)}>
                <StatusIcon className={cn('h-6 w-6', statusConfig.color)} />
              </div>

              {/* Order Details */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">Order #{order.orderNumber}</h3>
                  <Badge variant="secondary" size="sm">
                    {statusConfig.label}
                  </Badge>
                  {order.tags && order.tags.length > 0 && (
                    <div className="flex gap-1">
                      {order.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" size="xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Placed on {formatDate(order.placedAt, 'medium')}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <ShoppingBagIcon className="h-4 w-4" />
                    <span>{order.items.length} items</span>
                  </div>

                  {order.trackingNumber && (
                    <div className="flex items-center gap-1.5">
                      <TruckIcon className="h-4 w-4" />
                      <code className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {order.trackingNumber}
                      </code>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {showProgress && order.status !== 'cancelled' && order.status !== 'refunded' && (
                  <div className="mt-3">
                    <Progress value={getOrderProgress()} className="h-1.5" />
                  </div>
                )}
              </div>
            </div>

            {/* Total Amount */}
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(getPriceAmount(order.total))}
              </p>
              <div className="flex items-center justify-end gap-2 mt-1">
                {getPaymentStatusBadge(order.paymentStatus)}
                {getFulfillmentStatusBadge(order.fulfillmentStatus)}
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Preview */}
        {showItems && order.items.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-900">Order Items</h4>
              {order.items.length > 3 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {isExpanded ? 'Show less' : `View all ${order.items.length} items`}
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(isExpanded ? order.items : order.items.slice(0, 3)).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Product Image */}
                  <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-gray-200">
                    {item.product?.media?.primaryImage?.url || item.product?.media?.images?.[0]?.url ? (
                      <Image
                        src={item.product.media.primaryImage?.url || item.product.media.images[0].url}
                        alt={item.product.name || 'Product'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    {item.quantity > 1 && (
                      <div className="absolute top-1 right-1 bg-gray-900 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                        ×{item.quantity}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product?.name || 'Product'}
                    </p>
                    {item.variant && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.variant.options?.map((option) => (
                          <span key={option.id} className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                            {option.displayValue}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(getPriceAmount(item.totalPrice))}
                    </p>
                    {item.originalPrice && getPriceAmount(item.originalPrice) > getPriceAmount(item.unitPrice) && (
                      <p className="text-xs text-gray-500 line-through">
                        {formatCurrency(getPriceAmount(item.originalPrice) * item.quantity)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Order Summary */}
        {variant === 'detailed' && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Shipping Address */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <MapPinIcon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Shipping To</p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <CreditCardIcon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payment</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {order.paymentMethod.type.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {order.paymentMethod.last4 ? `****${order.paymentMethod.last4}` : 'Completed'}
                  </p>
                </div>
              </div>

              {/* Discounts */}
              {(order.appliedCoupons.length > 0 || getPriceAmount(order.discountAmount) > 0) && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <TagIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Savings</p>
                    <p className="text-sm font-bold text-green-600">
                      -{formatCurrency(getPriceAmount(order.discountAmount))}
                    </p>
                    {order.appliedCoupons[0] && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        Code: {order.appliedCoupons[0].code}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total</p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(getPriceAmount(order.total))}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {order.items.length} items
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="p-6 bg-white">
            <div className="flex flex-wrap items-center gap-3">
              <Tooltip content="View order details">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onViewDetails?.(order.id)}
                  leftIcon={<EyeIcon className="h-4 w-4" />}
                >
                  View Details
                </Button>
              </Tooltip>

              {canTrackOrder() && (
                <Tooltip content="Track your order">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onTrackOrder?.(order.id)}
                    leftIcon={<TruckIcon className="h-4 w-4" />}
                  >
                    Track Order
                  </Button>
                </Tooltip>
              )}

              {canReorder() && (
                <Tooltip content="Order these items again">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReorder?.(order.id)}
                    leftIcon={<ArrowPathIcon className="h-4 w-4" />}
                  >
                    Reorder
                  </Button>
                </Tooltip>
              )}

              {canCancelOrder() && (
                <Tooltip content="Cancel this order">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCancelOrder?.(order.id)}
                    leftIcon={<XCircleIcon className="h-4 w-4" />}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Cancel Order
                  </Button>
                </Tooltip>
              )}

              {/* Help Link */}
              <Link
                href={`/support?order=${order.orderNumber}`}
                className="ml-auto text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Need help?
              </Link>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
