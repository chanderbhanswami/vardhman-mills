'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Order } from '@/types/cart.types';
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  UserGroupIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

interface OrderStatsProps {
  orders: Order[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  showComparison?: boolean;
  showCharts?: boolean;
  className?: string;
}

interface StatCard {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
  amount: number;
  color: string;
}

// Helper function to extract amount from Price object
const getPriceAmount = (price: { amount: number } | number): number => {
  return typeof price === 'number' ? price : price.amount;
};

export const OrderStats: React.FC<OrderStatsProps> = ({
  orders,
  showComparison = true,
  className,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Calculate stats
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + getPriceAmount(order.total), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Status counts
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const shippedOrders = orders.filter(o => o.status === 'shipped' || o.status === 'partially_shipped').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered' || o.status === 'partially_delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    // Payment status
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length;
    const pendingPayments = orders.filter(o => o.paymentStatus === 'pending').length;
    const failedPayments = orders.filter(o => o.paymentStatus === 'failed').length;

    // Fulfillment status
    const fulfilledOrders = orders.filter(o => o.fulfillmentStatus === 'delivered').length;
    const inTransitOrders = orders.filter(o => o.fulfillmentStatus === 'in_transit').length;
    const readyOrders = orders.filter(o => o.fulfillmentStatus === 'ready').length;

    // Unique customers
    const uniqueCustomers = new Set(orders.map(o => o.userId)).size;

    // Calculate changes (mock data - in real app, compare with previous period)
    const orderChange = 12.5;
    const revenueChange = 8.3;
    const avgOrderChange = -3.2;
    const customerChange = 15.7;

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      completedOrders,
      paidOrders,
      pendingPayments,
      failedPayments,
      fulfilledOrders,
      inTransitOrders,
      readyOrders,
      uniqueCustomers,
      orderChange,
      revenueChange,
      avgOrderChange,
      customerChange,
    };
  }, [orders]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Main stat cards
  const mainStats: StatCard[] = [
    {
      label: 'Total Orders',
      value: formatNumber(stats.totalOrders),
      change: stats.orderChange,
      changeLabel: 'vs last period',
      icon: ShoppingBagIcon,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      trend: stats.orderChange > 0 ? 'up' : stats.orderChange < 0 ? 'down' : 'neutral',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: stats.revenueChange,
      changeLabel: 'vs last period',
      icon: CurrencyDollarIcon,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      trend: stats.revenueChange > 0 ? 'up' : stats.revenueChange < 0 ? 'down' : 'neutral',
    },
    {
      label: 'Average Order Value',
      value: formatCurrency(stats.averageOrderValue),
      change: stats.avgOrderChange,
      changeLabel: 'vs last period',
      icon: ChartBarIcon,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      trend: stats.avgOrderChange > 0 ? 'up' : stats.avgOrderChange < 0 ? 'down' : 'neutral',
    },
    {
      label: 'Unique Customers',
      value: formatNumber(stats.uniqueCustomers),
      change: stats.customerChange,
      changeLabel: 'vs last period',
      icon: UserGroupIcon,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      trend: stats.customerChange > 0 ? 'up' : stats.customerChange < 0 ? 'down' : 'neutral',
    },
  ];

  // Status breakdown
  const statusBreakdown: StatusBreakdown[] = [
    {
      status: 'Delivered',
      count: stats.deliveredOrders,
      percentage: (stats.deliveredOrders / stats.totalOrders) * 100,
      amount: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + getPriceAmount(o.total), 0),
      color: 'text-green-600',
    },
    {
      status: 'Shipped',
      count: stats.shippedOrders,
      percentage: (stats.shippedOrders / stats.totalOrders) * 100,
      amount: orders.filter(o => o.status === 'shipped').reduce((sum, o) => sum + getPriceAmount(o.total), 0),
      color: 'text-blue-600',
    },
    {
      status: 'Processing',
      count: stats.processingOrders,
      percentage: (stats.processingOrders / stats.totalOrders) * 100,
      amount: orders.filter(o => o.status === 'processing').reduce((sum, o) => sum + getPriceAmount(o.total), 0),
      color: 'text-purple-600',
    },
    {
      status: 'Pending',
      count: stats.pendingOrders,
      percentage: (stats.pendingOrders / stats.totalOrders) * 100,
      amount: orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + getPriceAmount(o.total), 0),
      color: 'text-yellow-600',
    },
    {
      status: 'Cancelled',
      count: stats.cancelledOrders,
      percentage: (stats.cancelledOrders / stats.totalOrders) * 100,
      amount: orders.filter(o => o.status === 'cancelled').reduce((sum, o) => sum + getPriceAmount(o.total), 0),
      color: 'text-red-600',
    },
  ];

  // Payment breakdown
  const paymentBreakdown = [
    {
      label: 'Paid',
      count: stats.paidOrders,
      percentage: (stats.paidOrders / stats.totalOrders) * 100,
      color: 'bg-green-500',
    },
    {
      label: 'Pending',
      count: stats.pendingPayments,
      percentage: (stats.pendingPayments / stats.totalOrders) * 100,
      color: 'bg-yellow-500',
    },
    {
      label: 'Failed',
      count: stats.failedPayments,
      percentage: (stats.failedPayments / stats.totalOrders) * 100,
      color: 'bg-red-500',
    },
  ];

  // Fulfillment breakdown
  const fulfillmentBreakdown = [
    {
      label: 'Delivered',
      count: stats.fulfilledOrders,
      percentage: (stats.fulfilledOrders / stats.totalOrders) * 100,
      color: 'bg-green-500',
    },
    {
      label: 'In Transit',
      count: stats.inTransitOrders,
      percentage: (stats.inTransitOrders / stats.totalOrders) * 100,
      color: 'bg-blue-500',
    },
    {
      label: 'Ready',
      count: stats.readyOrders,
      percentage: (stats.readyOrders / stats.totalOrders) * 100,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Order Statistics</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period === 'all' ? 'All Time' : period.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowTrendingUpIcon : stat.trend === 'down' ? ArrowTrendingDownIcon : null;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={cn('p-3 rounded-lg', stat.iconBg)}>
                    <Icon className={cn('h-6 w-6', stat.iconColor)} />
                  </div>
                </div>

                {showComparison && stat.change !== undefined && (
                  <div className="flex items-center gap-2">
                    {TrendIcon && (
                      <TrendIcon
                        className={cn(
                          'h-4 w-4',
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      )}
                    >
                      {stat.change > 0 ? '+' : ''}{stat.change.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">{stat.changeLabel}</span>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBagIcon className="h-5 w-5 text-gray-600" />
            Order Status Breakdown
          </h3>
          
          <div className="space-y-4">
            {statusBreakdown.map((item, index) => (
              <motion.div
                key={item.status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{item.status}</span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-sm font-semibold', item.color)}>
                      {item.percentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">{formatCurrency(item.amount)}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    className={cn('h-full rounded-full', item.color.replace('text-', 'bg-'))}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Payment & Fulfillment */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-gray-600" />
            Payment & Fulfillment
          </h3>

          <div className="space-y-6">
            {/* Payment Status */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Payment Status</p>
              <div className="space-y-2">
                {paymentBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={cn('w-3 h-3 rounded-full', item.color)} />
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      <span className="text-xs text-gray-500 w-12 text-right">
                        {item.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fulfillment Status */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-3">Fulfillment Status</p>
              <div className="space-y-2">
                {fulfillmentBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={cn('w-3 h-3 rounded-full', item.color)} />
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      <span className="text-xs text-gray-500 w-12 text-right">
                        {item.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <ChartBarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Quick Insights</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Success Rate</p>
                <p className="text-xl font-bold text-green-600">
                  {((stats.deliveredOrders / stats.totalOrders) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Cancellation Rate</p>
                <p className="text-xl font-bold text-red-600">
                  {((stats.cancelledOrders / stats.totalOrders) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Payment Success</p>
                <p className="text-xl font-bold text-blue-600">
                  {((stats.paidOrders / stats.totalOrders) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Fulfillment Rate</p>
                <p className="text-xl font-bold text-purple-600">
                  {((stats.fulfilledOrders / stats.totalOrders) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderStats;
