'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/cart.types';

interface DeliveryEstimateProps {
  order: Order;
  showProgress?: boolean;
  showDetails?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export const DeliveryEstimate: React.FC<DeliveryEstimateProps> = ({
  order,
  showProgress = true,
  showDetails = true,
  variant = 'default',
  className,
}) => {
  // Format date
  const formatDate = (date: Date | string, format: 'short' | 'medium' | 'long' | 'full' = 'medium'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const formats = {
      short: { month: 'short', day: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' },
      full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    } as const;

    return dateObj.toLocaleDateString('en-US', formats[format]);
  };

  // Format time
  const formatTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Calculate delivery progress
  const calculateDeliveryProgress = (): number => {
    if (!order.estimatedDeliveryDate) return 0;

    const now = new Date().getTime();
    const created = new Date(order.createdAt).getTime();
    const estimated = new Date(order.estimatedDeliveryDate).getTime();

    if (order.status === 'delivered') return 100;
    if (now >= estimated) return 95;

    const total = estimated - created;
    const elapsed = now - created;
    const progress = Math.max(0, Math.min(95, (elapsed / total) * 100));

    // Adjust based on order status
    switch (order.status) {
      case 'confirmed':
        return Math.max(progress, 10);
      case 'processing':
        return Math.max(progress, 25);
      case 'shipped':
      case 'partially_shipped':
        return Math.max(progress, 50);
      default:
        return progress;
    }
  };

  // Get delivery status
  const getDeliveryStatus = (): {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  } => {
    if (order.status === 'delivered' || order.status === 'partially_delivered') {
      return {
        label: 'Delivered',
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      };
    }

    if (order.status === 'cancelled' || order.status === 'refunded') {
      return {
        label: 'Cancelled',
        icon: ExclamationCircleIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      };
    }

    if (order.fulfillmentStatus === 'shipped' || order.fulfillmentStatus === 'in_transit') {
      return {
        label: 'In Transit',
        icon: TruckIcon,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      };
    }

    return {
      label: 'Processing',
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    };
  };

  // Check if delivery is delayed
  const isDelayed = (): boolean => {
    if (!order.estimatedDeliveryDate || order.status === 'delivered') return false;
    return new Date() > new Date(order.estimatedDeliveryDate);
  };

  const deliveryStatus = getDeliveryStatus();
  const deliveryProgress = calculateDeliveryProgress();
  const delayed = isDelayed();

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className={cn('rounded-full p-2', deliveryStatus.bgColor)}>
          <deliveryStatus.icon className={cn('h-4 w-4', deliveryStatus.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{deliveryStatus.label}</span>
            {delayed && (
              <Badge variant="destructive" size="sm">
                Delayed
              </Badge>
            )}
          </div>
          {order.estimatedDeliveryDate && (
            <p className="text-xs text-gray-600">
              Est. {formatDate(order.estimatedDeliveryDate, 'short')}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('p-6', className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn('rounded-full p-3', deliveryStatus.bgColor)}>
              <deliveryStatus.icon className={cn('h-6 w-6', deliveryStatus.color)} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {deliveryStatus.label}
              </h3>
              {order.estimatedDeliveryDate && (
                <p className="text-sm text-gray-600 mt-1">
                  {order.status === 'delivered'
                    ? `Delivered on ${formatDate(order.actualDeliveryDate || order.estimatedDeliveryDate, 'long')}`
                    : `Expected by ${formatDate(order.estimatedDeliveryDate, 'long')}`}
                </p>
              )}
            </div>
          </div>

          {delayed && (
            <Tooltip content="Delivery is running behind schedule">
              <Badge variant="destructive">
                Delayed
              </Badge>
            </Tooltip>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && order.status !== 'cancelled' && order.status !== 'refunded' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Delivery Progress</span>
              <span className="font-medium text-gray-900">{deliveryProgress.toFixed(0)}%</span>
            </div>
            <Progress
              value={deliveryProgress}
              className={cn(
                'h-2',
                order.status === 'delivered' ? '[&>div]:bg-green-500' :
                delayed ? '[&>div]:bg-red-500' :
                '[&>div]:bg-blue-500'
              )}
            />
          </div>
        )}

        {/* Details */}
        {showDetails && variant === 'detailed' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            {/* Order Placed */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gray-100 p-2">
                <CalendarIcon className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Placed
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatDate(order.createdAt, 'medium')}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {formatTime(order.createdAt)}
                </p>
              </div>
            </div>

            {/* Estimated Delivery */}
            {order.estimatedDeliveryDate && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <TruckIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {order.status === 'delivered' ? 'Delivered' : 'Estimated Delivery'}
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(
                      order.status === 'delivered' && order.actualDeliveryDate
                        ? order.actualDeliveryDate
                        : order.estimatedDeliveryDate,
                      'medium'
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Delivery Address */}
            <div className="flex items-start gap-3 sm:col-span-2">
              <div className="rounded-lg bg-purple-100 p-2">
                <MapPinIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Address
                </p>
                <div className="text-sm text-gray-900 mt-1">
                  <p className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p className="text-gray-600">
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                  </p>
                  <p className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-gray-600">{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="text-gray-600 mt-1">Phone: {order.shippingAddress.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="flex items-start gap-3 sm:col-span-2">
              <div className="rounded-lg bg-green-100 p-2">
                <TruckIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipping Method
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {order.shippingMethod.name}
                </p>
                {order.shippingMethod.description && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    {order.shippingMethod.description}
                  </p>
                )}
                {order.shippingMethod.estimatedDays && (
                  <p className="text-xs text-gray-600 mt-1">
                    Estimated delivery: {typeof order.shippingMethod.estimatedDays === 'number' 
                      ? `${order.shippingMethod.estimatedDays} business days`
                      : `${order.shippingMethod.estimatedDays.min}-${order.shippingMethod.estimatedDays.max} business days`
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delivery Notes */}
        {order.customerNotes && (
          <div className="pt-4 border-t">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Delivery Instructions
            </p>
            <p className="text-sm text-gray-700">{order.customerNotes}</p>
          </div>
        )}
      </motion.div>
    </Card>
  );
};
