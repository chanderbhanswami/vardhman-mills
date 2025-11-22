'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Tooltip } from '@/components/ui/Tooltip';
import type { OrderFilters as OrderFiltersType, OrderStatus, PaymentStatus, FulfillmentStatus } from '@/types/order.types';
import { cn } from '@/lib/utils';

interface OrderFiltersProps {
  filters: OrderFiltersType;
  onFiltersChange: (filters: OrderFiltersType) => void;
  onReset?: () => void;
  showAdvanced?: boolean;
  className?: string;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  showAdvanced = true,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [sortBy, setSortBy] = useState('date_desc');
  const [limit, setLimit] = useState(20);

  // Count active filters
  React.useEffect(() => {
    let count = 0;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.paymentStatus && filters.paymentStatus.length > 0) count++;
    if (filters.fulfillmentStatus && filters.fulfillmentStatus.length > 0) count++;
    if (filters.dateRange) count++;
    if (filters.amountRange) count++;
    if (filters.search) count++;
    if (filters.source && filters.source.length > 0) count++;
    if (filters.channel && filters.channel.length > 0) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Status options
  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'partially_shipped', label: 'Partially Shipped' },
    { value: 'partially_delivered', label: 'Partially Delivered' },
    { value: 'on_hold', label: 'On Hold' },
  ];

  // Payment status options
  const paymentStatusOptions: { value: PaymentStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'partially_paid', label: 'Partially Paid' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'partially_refunded', label: 'Partially Refunded' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'authorized', label: 'Authorized' },
    { value: 'expired', label: 'Expired' },
  ];

  // Fulfillment status options
  const fulfillmentStatusOptions: { value: FulfillmentStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'ready', label: 'Ready' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'returned', label: 'Returned' },
  ];

  // Time range options
  const timeRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'date_desc', label: 'Newest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'amount_desc', label: 'Highest Amount' },
    { value: 'amount_asc', label: 'Lowest Amount' },
    { value: 'status', label: 'By Status' },
  ];

  // Handle status toggle
  const handleStatusToggle = (status: OrderStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({ ...filters, status: newStatuses });
  };

  // Handle payment status toggle
  const handlePaymentStatusToggle = (status: PaymentStatus) => {
    const currentStatuses = filters.paymentStatus || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({ ...filters, paymentStatus: newStatuses });
  };

  // Handle fulfillment status toggle
  const handleFulfillmentStatusToggle = (status: FulfillmentStatus) => {
    const currentStatuses = filters.fulfillmentStatus || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({ ...filters, fulfillmentStatus: newStatuses });
  };

  // Handle time range change
  const handleTimeRangeChange = (range: string | number) => {
    const now = new Date();
    let dateRange: { from: Date; to: Date } | undefined;

    switch (range) {
      case 'today':
        dateRange = {
          from: new Date(now.setHours(0, 0, 0, 0)),
          to: new Date(),
        };
        break;
      case 'week':
        dateRange = {
          from: new Date(now.setDate(now.getDate() - 7)),
          to: new Date(),
        };
        break;
      case 'month':
        dateRange = {
          from: new Date(now.setMonth(now.getMonth() - 1)),
          to: new Date(),
        };
        break;
      case 'quarter':
        dateRange = {
          from: new Date(now.setMonth(now.getMonth() - 3)),
          to: new Date(),
        };
        break;
      case 'year':
        dateRange = {
          from: new Date(now.setFullYear(now.getFullYear() - 1)),
          to: new Date(),
        };
        break;
      case 'all':
        dateRange = undefined;
        break;
      case 'custom':
        // Keep existing dates or clear them
        return;
    }

    onFiltersChange({ ...filters, dateRange });
  };

  // Handle reset
  const handleReset = () => {
    onReset?.();
    setIsExpanded(false);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            </div>
            
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" size="sm">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Tooltip content="Clear all filters">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  leftIcon={<XMarkIcon className="h-4 w-4" />}
                >
                  Clear
                </Button>
              </Tooltip>
            )}

            {showAdvanced && (
              <Tooltip content={isExpanded ? 'Hide advanced filters' : 'Show advanced filters'}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  leftIcon={<AdjustmentsHorizontalIcon className="h-4 w-4" />}
                >
                  {isExpanded ? 'Less' : 'More'}
                </Button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Time Range */}
          <Select
            label="Time Range"
            options={timeRangeOptions}
            value={filters.dateRange ? 'custom' : 'all'}
            onValueChange={handleTimeRangeChange}
            placeholder="Select time range"
          />

          {/* Sort By */}
          <Select
            label="Sort By"
            options={sortOptions}
            value={sortBy}
            onValueChange={(value) => setSortBy(String(value))}
            placeholder="Sort orders"
          />

          {/* Items Per Page */}
          <Select
            label="Show"
            options={[
              { value: '10', label: '10 per page' },
              { value: '20', label: '20 per page' },
              { value: '50', label: '50 per page' },
              { value: '100', label: '100 per page' },
            ]}
            value={String(limit)}
            onValueChange={(value) => setLimit(Number(value))}
          />
        </div>
      </Card>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <div className="space-y-6">
                {/* Order Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Order Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {statusOptions.map((option) => (
                      <label
                        key={option.value}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all',
                          filters.status?.includes(option.value)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <Checkbox
                          checked={filters.status?.includes(option.value) || false}
                          onChange={() => handleStatusToggle(option.value)}
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {paymentStatusOptions.map((option) => (
                      <label
                        key={option.value}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all',
                          filters.paymentStatus?.includes(option.value)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <Checkbox
                          checked={filters.paymentStatus?.includes(option.value) || false}
                          onChange={() => handlePaymentStatusToggle(option.value)}
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fulfillment Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Fulfillment Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {fulfillmentStatusOptions.map((option) => (
                      <label
                        key={option.value}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all',
                          filters.fulfillmentStatus?.includes(option.value)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <Checkbox
                          checked={filters.fulfillmentStatus?.includes(option.value) || false}
                          onChange={() => handleFulfillmentStatusToggle(option.value)}
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amount Range */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    Order Amount Range
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Minimum Amount"
                      placeholder="0.00"
                      value={filters.amountRange?.min || ''}
                      onChange={(e) => {
                        const min = Number(e.target.value) || undefined;
                        onFiltersChange({
                          ...filters,
                          amountRange: min ? { min, max: filters.amountRange?.max || 0 } : undefined,
                        });
                      }}
                      min={0}
                      step={0.01}
                    />
                    <Input
                      type="number"
                      label="Maximum Amount"
                      placeholder="0.00"
                      value={filters.amountRange?.max || ''}
                      onChange={(e) => {
                        const max = Number(e.target.value) || undefined;
                        onFiltersChange({
                          ...filters,
                          amountRange: max ? { min: filters.amountRange?.min || 0, max } : undefined,
                        });
                      }}
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>

                {/* Custom Date Range */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Custom Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="date"
                      label="From"
                      value={filters.dateRange?.from ? new Date(filters.dateRange.from).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const from = e.target.value ? new Date(e.target.value) : undefined;
                        onFiltersChange({
                          ...filters,
                          dateRange: from ? { from, to: filters.dateRange?.to || new Date() } : undefined,
                        });
                      }}
                    />
                    <Input
                      type="date"
                      label="To"
                      value={filters.dateRange?.to ? new Date(filters.dateRange.to).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const to = e.target.value ? new Date(e.target.value) : undefined;
                        onFiltersChange({
                          ...filters,
                          dateRange: to ? { from: filters.dateRange?.from || new Date(), to } : undefined,
                        });
                      }}
                    />
                  </div>
                </div>

                {/* Search */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <TagIcon className="h-4 w-4" />
                    Search Orders
                  </label>
                  <Input
                    type="text"
                    placeholder="Search by order number, customer name, or email"
                    value={filters.search || ''}
                    onChange={(e) => {
                      const search = e.target.value.trim();
                      onFiltersChange({ ...filters, search: search || undefined });
                    }}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            
            {filters.status?.map((status) => (
              <Badge
                key={status}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => handleStatusToggle(status)}
              >
                {statusOptions.find(o => o.value === status)?.label}
                <XMarkIcon className="h-3 w-3 ml-1" />
              </Badge>
            ))}

            {filters.paymentStatus?.map((status) => (
              <Badge
                key={status}
                variant="success"
                className="cursor-pointer hover:bg-green-200"
                onClick={() => handlePaymentStatusToggle(status)}
              >
                {paymentStatusOptions.find(o => o.value === status)?.label}
                <XMarkIcon className="h-3 w-3 ml-1" />
              </Badge>
            ))}

            {filters.fulfillmentStatus?.map((status) => (
              <Badge
                key={status}
                variant="secondary"
                className="cursor-pointer hover:bg-purple-200"
                onClick={() => handleFulfillmentStatusToggle(status)}
              >
                {fulfillmentStatusOptions.find(o => o.value === status)?.label}
                <XMarkIcon className="h-3 w-3 ml-1" />
              </Badge>
            ))}

            {filters.dateRange && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => onFiltersChange({ ...filters, dateRange: undefined })}
              >
                Date Range
                <XMarkIcon className="h-3 w-3 ml-1" />
              </Badge>
            )}

            {filters.amountRange && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => onFiltersChange({ ...filters, amountRange: undefined })}
              >
                Amount Range
                <XMarkIcon className="h-3 w-3 ml-1" />
              </Badge>
            )}

            {filters.search && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => onFiltersChange({ ...filters, search: undefined })}
              >
                Search: {filters.search}
                <XMarkIcon className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
