'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  HomeIcon,
  XCircleIcon,
  ArrowPathIcon,
  CreditCardIcon,
  ExclamationCircleIcon,
  ShoppingBagIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/order.types';
import { ORDER_STATUS, STATUS_LABELS, STATUS_COLORS } from '@/constants/order.constants';
import { formatDate } from '@/lib/formatters';

interface OrderStatusProps {
  order: Order;
  className?: string;
  showTimeline?: boolean;
  showProgress?: boolean;
}

interface StatusStep {
  id: string;
  label: string;
  icon: React.ElementType;
  status: 'completed' | 'current' | 'pending' | 'failed';
  timestamp?: string;
  description?: string;
}

export const OrderStatus: React.FC<OrderStatusProps> = ({
  order,
  className,
  showTimeline = true,
  showProgress = true,
}) => {
  // Get status configuration
  const getStatusConfig = (status: string) => {
    const statusMap: Record<
      string,
      {
        icon: React.ElementType;
        color: string;
        bgColor: string;
        label: string;
      }
    > = {
      [ORDER_STATUS.PENDING]: {
        icon: ClockIcon,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        label: 'Order Pending',
      },
      [ORDER_STATUS.CONFIRMED]: {
        icon: CheckCircleIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        label: 'Order Confirmed',
      },
      [ORDER_STATUS.PROCESSING]: {
        icon: ShoppingBagIcon,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        label: 'Processing Order',
      },
      [ORDER_STATUS.SHIPPED]: {
        icon: TruckIcon,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        label: 'Order Shipped',
      },
      [ORDER_STATUS.OUT_FOR_DELIVERY]: {
        icon: TruckIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        label: 'Out for Delivery',
      },
      [ORDER_STATUS.DELIVERED]: {
        icon: HomeIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        label: 'Delivered',
      },
      [ORDER_STATUS.CANCELLED]: {
        icon: XCircleIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        label: 'Order Cancelled',
      },
      [ORDER_STATUS.RETURNED]: {
        icon: ArrowPathIcon,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        label: 'Order Returned',
      },
      [ORDER_STATUS.REFUNDED]: {
        icon: CreditCardIcon,
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
        label: 'Refunded',
      },
      [ORDER_STATUS.FAILED]: {
        icon: ExclamationCircleIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        label: 'Order Failed',
      },
    };

    return (
      statusMap[status] || {
        icon: ClockIcon,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        label: 'Unknown Status',
      }
    );
  };

  const currentStatusConfig = getStatusConfig(order.status as string);
  const StatusIcon = currentStatusConfig.icon;

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    const statusOrder = [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PROCESSING,
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.OUT_FOR_DELIVERY,
      ORDER_STATUS.DELIVERED,
    ];

    const currentIndex = statusOrder.findIndex(s => s === order.status);
    if (currentIndex === -1) return 0;
    
    return ((currentIndex + 1) / statusOrder.length) * 100;
  }, [order.status]);

  // Generate status steps for timeline
  const statusSteps = useMemo((): StatusStep[] => {
    const steps: StatusStep[] = [
      {
        id: ORDER_STATUS.PENDING,
        label: 'Order Placed',
        icon: DocumentCheckIcon,
        status: 'pending',
        timestamp: formatDate(order.createdAt, 'medium'),
        description: 'Your order has been received',
      },
      {
        id: ORDER_STATUS.CONFIRMED,
        label: 'Confirmed',
        icon: CheckCircleIcon,
        status: 'pending',
        timestamp: order.confirmedAt ? formatDate(order.confirmedAt, 'medium') : undefined,
        description: 'Order confirmed and being prepared',
      },
      {
        id: ORDER_STATUS.PROCESSING,
        label: 'Processing',
        icon: ShoppingBagIcon,
        status: 'pending',
        timestamp: order.confirmedAt ? formatDate(order.confirmedAt, 'medium') : undefined,
        description: 'Your items are being packed',
      },
      {
        id: ORDER_STATUS.SHIPPED,
        label: 'Shipped',
        icon: TruckIcon,
        status: 'pending',
        timestamp: order.shippedAt ? formatDate(order.shippedAt, 'medium') : undefined,
        description: 'Package is on its way',
      },
      {
        id: ORDER_STATUS.OUT_FOR_DELIVERY,
        label: 'Out for Delivery',
        icon: TruckIcon,
        status: 'pending',
        timestamp: order.shippedAt ? formatDate(order.shippedAt, 'medium') : undefined,
        description: 'Package is out for delivery',
      },
      {
        id: ORDER_STATUS.DELIVERED,
        label: 'Delivered',
        icon: HomeIcon,
        status: 'pending',
        timestamp: order.deliveredAt ? formatDate(order.deliveredAt, 'medium') : undefined,
        description: 'Package has been delivered',
      },
    ];

    // Determine status for each step
    const statusOrder = [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PROCESSING,
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.OUT_FOR_DELIVERY,
      ORDER_STATUS.DELIVERED,
    ];

    const currentStatusIndex = statusOrder.findIndex(s => s === order.status);

    // Handle cancelled and refunded statuses
    if (order.status === 'cancelled' || order.status === 'refunded') {
      steps.forEach((step, index) => {
        if (index === 0) {
          step.status = 'completed';
        } else {
          step.status = 'failed';
        }
      });
    } else {
      steps.forEach((step, index) => {
        if (index < currentStatusIndex) {
          step.status = 'completed';
        } else if (statusOrder[index] === order.status) {
          step.status = 'current';
        } else {
          step.status = 'pending';
        }
      });
    }

    return steps;
  }, [order]);

  const getBadgeVariant = (status: string): 'default' | 'success' | 'warning' | 'destructive' | 'info' => {
    const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
    switch (color) {
      case 'green':
        return 'success';
      case 'yellow':
      case 'orange':
        return 'warning';
      case 'red':
        return 'destructive';
      case 'blue':
      case 'indigo':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Current Status Card */}
      <Card className={cn('p-6', currentStatusConfig.bgColor)}>
        <div className="flex items-center gap-4">
          <div className={cn('p-3 rounded-full', currentStatusConfig.bgColor)}>
            <StatusIcon className={cn('h-8 w-8', currentStatusConfig.color)} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {currentStatusConfig.label}
            </h3>
            <p className="text-sm text-gray-600">
              Your order is being processed
            </p>
            {order.updatedAt && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {formatDate(order.updatedAt, 'medium')}
              </p>
            )}
          </div>
          <Badge variant={getBadgeVariant(order.status as string)} size="lg">
            {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]?.toUpperCase() || order.status?.toUpperCase()}
          </Badge>
        </div>

        {/* Progress Bar */}
        {showProgress &&
          order.status !== 'cancelled' &&
          order.status !== 'refunded' && (
            <div className="mt-4">
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-gray-500 mt-2 text-center">
                {Math.round(progressPercentage)}% Complete
              </p>
            </div>
          )}
      </Card>

      {/* Timeline */}
      {showTimeline && (
        <Card className="p-6">
          <h4 className="text-base font-semibold text-gray-900 mb-6">Order Timeline</h4>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Timeline Steps */}
            <div className="space-y-6">
              {statusSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'current';
                const isFailed = step.status === 'failed';
                const isPending = step.status === 'pending';

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start gap-4"
                  >
                    {/* Icon Circle */}
                    <div
                      className={cn(
                        'relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300',
                        {
                          'bg-green-500 border-green-500': isCompleted,
                          'bg-blue-500 border-blue-500 ring-4 ring-blue-100': isCurrent,
                          'bg-red-500 border-red-500': isFailed,
                          'bg-white border-gray-300': isPending,
                        }
                      )}
                    >
                      <StepIcon
                        className={cn('h-6 w-6 transition-colors duration-300', {
                          'text-white': isCompleted || isCurrent || isFailed,
                          'text-gray-400': isPending,
                        })}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between mb-1">
                        <h5
                          className={cn('text-sm font-semibold transition-colors duration-300', {
                            'text-gray-900': isCompleted || isCurrent,
                            'text-gray-500': isPending,
                            'text-red-600': isFailed,
                          })}
                        >
                          {step.label}
                        </h5>
                        {step.timestamp && (
                          <span className="text-xs text-gray-500">
                            {step.timestamp}
                          </span>
                        )}
                      </div>
                      
                      {step.description && (
                        <p
                          className={cn('text-sm transition-colors duration-300', {
                            'text-gray-600': isCompleted || isCurrent,
                            'text-gray-400': isPending,
                            'text-red-500': isFailed,
                          })}
                        >
                          {step.description}
                        </p>
                      )}

                      {isCurrent && order.estimatedDeliveryDate && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                          Expected delivery: {formatDate(order.estimatedDeliveryDate, 'medium')}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Cancelled/Returned/Failed Status */}
          {(order.status === 'cancelled' ||
            order.status === 'refunded') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-semibold text-red-900 mb-1">
                    {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                  </h5>
                  <p className="text-sm text-red-700">
                    No additional information available
                  </p>
                  {order.cancelledAt && (
                    <p className="text-xs text-red-600 mt-1">
                      Date: {formatDate(order.cancelledAt, 'medium')}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </Card>
      )}

      {/* Payment Status */}
      {order.paymentStatus && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCardIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Payment Status</span>
            </div>
            <Badge
              variant={
                order.paymentStatus === 'paid'
                  ? 'success'
                  : order.paymentStatus === 'failed'
                  ? 'destructive'
                  : 'warning'
              }
              size="sm"
            >
              {order.paymentStatus.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </Card>
      )}

      {/* Estimated Delivery */}
      {order.estimatedDeliveryDate &&
        order.status !== 'delivered' &&
        order.status !== 'cancelled' && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <TruckIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Estimated Delivery</p>
                <p className="text-sm text-blue-700">
                  {formatDate(order.estimatedDeliveryDate, 'full')}
                </p>
              </div>
            </div>
          </Card>
        )}
    </div>
  );
};

export default OrderStatus;
