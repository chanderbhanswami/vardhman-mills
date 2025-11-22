'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CreditCardIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { Refund, RefundStatus as RefundStatusType } from '@/types/payment.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RefundStatusProps {
  /**
   * Refund data
   */
  refund: Refund;

  /**
   * Display variant
   * - default: Full card with timeline
   * - compact: Minimal info card
   * - inline: Single line status
   */
  variant?: 'default' | 'compact' | 'inline';

  /**
   * Show refund timeline
   */
  showTimeline?: boolean;

  /**
   * Show processing details
   */
  showProcessingDetails?: boolean;

  /**
   * Callback when refund is clicked
   */
  onClick?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get refund status configuration
 */
const getRefundStatusConfig = (
  status: RefundStatusType
): {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
} => {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: ClockIcon,
      };
    case 'processing':
      return {
        label: 'Processing',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: ArrowPathIcon,
      };
    case 'succeeded':
      return {
        label: 'Completed',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: CheckCircleIcon,
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        icon: XCircleIcon,
      };
    case 'failed':
      return {
        label: 'Failed',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: ExclamationTriangleIcon,
      };
    case 'requires_action':
      return {
        label: 'Action Required',
        color: 'text-orange-700',
        bgColor: 'bg-orange-100',
        icon: ExclamationTriangleIcon,
      };
    default:
      return {
        label: 'Unknown',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        icon: InformationCircleIcon,
      };
  }
};

/**
 * Format currency
 */
const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format date
 */
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/**
 * Calculate estimated completion date
 */
const getEstimatedCompletion = (
  requestedAt: Date | string,
  refundMethod: string
): string => {
  const requested = typeof requestedAt === 'string' ? new Date(requestedAt) : requestedAt;
  const businessDays = refundMethod === 'original_payment_method' ? 7 : 5;
  
  const completion = new Date(requested);
  completion.setDate(completion.getDate() + businessDays);
  
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(completion);
};

/**
 * Get refund method label
 */
const getRefundMethodLabel = (method: string): string => {
  switch (method) {
    case 'original_payment_method':
      return 'Original Payment Method';
    case 'bank_transfer':
      return 'Bank Transfer';
    case 'store_credit':
      return 'Store Credit';
    case 'cash':
      return 'Cash';
    default:
      return method.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
};

/**
 * Get refund reason label
 */
const getRefundReasonLabel = (reason: string): string => {
  switch (reason) {
    case 'requested_by_customer':
      return 'Requested by Customer';
    case 'duplicate':
      return 'Duplicate Transaction';
    case 'fraudulent':
      return 'Fraudulent Transaction';
    case 'order_cancelled':
      return 'Order Cancelled';
    case 'product_not_received':
      return 'Product Not Received';
    case 'product_defective':
      return 'Defective Product';
    case 'product_not_as_described':
      return 'Not As Described';
    case 'return_approved':
      return 'Return Approved';
    case 'exchange_approved':
      return 'Exchange Approved';
    case 'goodwill':
      return 'Goodwill Refund';
    case 'chargeback':
      return 'Chargeback';
    case 'other':
      return 'Other';
    default:
      return reason.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Refund Timeline Component
 */
interface TimelineEvent {
  status: RefundStatusType;
  timestamp: Date | string;
  description: string;
}

const RefundTimeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => {
  return (
    <div className="relative pl-8 space-y-6">
      {/* Timeline Line */}
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />

      {events.map((event, index) => {
        const config = getRefundStatusConfig(event.status);
        const Icon = config.icon;
        const isLast = index === events.length - 1;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Timeline Dot */}
            <div
              className={cn(
                'absolute -left-8 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center',
                config.bgColor
              )}
            >
              <Icon className={cn('h-3.5 w-3.5', config.color)} />
            </div>

            {/* Event Content */}
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{event.description}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(event.timestamp)}</p>
                </div>
                <Badge variant="outline" className={config.bgColor}>
                  <span className={config.color}>{config.label}</span>
                </Badge>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * RefundStatus Component
 * 
 * Comprehensive refund tracking component with status timeline.
 * Features:
 * - Multiple display variants
 * - Status timeline visualization
 * - Refund method display
 * - Processing time estimates
 * - Reason and description
 * - Color-coded status indicators
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <RefundStatus
 *   refund={refundData}
 *   variant="default"
 *   showTimeline={true}
 *   showProcessingDetails={true}
 * />
 * ```
 */
export const RefundStatus: React.FC<RefundStatusProps> = ({
  refund,
  variant = 'default',
  showTimeline = true,
  showProcessingDetails = true,
  onClick,
  className,
}) => {
  const statusConfig = getRefundStatusConfig(refund.status);
  const StatusIcon = statusConfig.icon;

  // Generate timeline events
  const timelineEvents: TimelineEvent[] = [
    {
      status: 'pending',
      timestamp: refund.requestedAt,
      description: 'Refund request initiated',
    },
  ];

  if (refund.status !== 'pending') {
    timelineEvents.push({
      status: 'processing',
      timestamp: refund.processedAt || refund.requestedAt,
      description: 'Refund request under review',
    });
  }

  if (refund.status === 'succeeded') {
    timelineEvents.push({
      status: 'succeeded',
      timestamp: refund.completedAt || refund.processedAt || refund.requestedAt,
      description: 'Refund completed and credited',
    });
  }

  if (refund.status === 'failed') {
    timelineEvents.push({
      status: 'failed',
      timestamp: refund.processedAt || refund.requestedAt,
      description: 'Refund processing failed',
    });
  }

  if (refund.status === 'cancelled') {
    timelineEvents.push({
      status: 'cancelled',
      timestamp: refund.processedAt || refund.requestedAt,
      description: 'Refund request cancelled',
    });
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 py-2',
          onClick && 'cursor-pointer hover:opacity-80',
          className
        )}
        onClick={onClick}
      >
        <div className={cn('p-1 rounded', statusConfig.bgColor)}>
          <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            Refund {statusConfig.label}
          </p>
          <p className="text-xs text-gray-500">
            {formatCurrency(refund.amount.amount, refund.amount.currency)}
          </p>
        </div>
        <Badge variant="outline" className={statusConfig.bgColor}>
          <span className={statusConfig.color}>{statusConfig.label}</span>
        </Badge>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          onClick && 'cursor-pointer hover:shadow-md transition-shadow',
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg', statusConfig.bgColor)}>
              <StatusIcon className={cn('h-5 w-5', statusConfig.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(refund.amount.amount, refund.amount.currency)}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {getRefundReasonLabel(refund.reason)}
                  </p>
                </div>
                <Badge variant="outline" className={statusConfig.bgColor}>
                  <span className={statusConfig.color}>{statusConfig.label}</span>
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>via {getRefundMethodLabel(refund.refundMethod)}</span>
                <span>•</span>
                <span>{formatDate(refund.requestedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant - Full card
  return (
    <Card
      className={cn(
        onClick && 'cursor-pointer hover:shadow-lg transition-shadow',
        className
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={cn('p-3 rounded-lg', statusConfig.bgColor)}>
              <StatusIcon className={cn('h-6 w-6', statusConfig.color)} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Refund Status</h3>
              <p className="text-sm text-gray-500 mt-1">
                Refund ID: {refund.id}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-base px-3 py-1', statusConfig.bgColor)}>
            <span className={statusConfig.color}>{statusConfig.label}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Amount and Method */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <BanknotesIcon className="h-4 w-4" />
              <span>Refund Amount</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(refund.amount.amount, refund.amount.currency)}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <CreditCardIcon className="h-4 w-4" />
              <span>Refund Method</span>
            </div>
            <p className="text-base font-semibold text-gray-900">
              {getRefundMethodLabel(refund.refundMethod)}
            </p>
          </div>
        </div>

        {/* Reason */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Refund Reason</h4>
          <p className="text-sm text-gray-900">{getRefundReasonLabel(refund.reason)}</p>
          {refund.description && (
            <p className="text-sm text-gray-600 mt-1">{refund.description}</p>
          )}
        </div>

        {/* Processing Details */}
        {showProcessingDetails && refund.description && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Processing Information</p>
                <p className="text-blue-700 mt-1">{refund.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Estimated Completion */}
        {(refund.status === 'pending' || refund.status === 'processing' || refund.status === 'requires_action') && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <ClockIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-900">Estimated Completion</p>
                <p className="text-yellow-700 mt-1">
                  Your refund should be completed by{' '}
                  <span className="font-semibold">
                    {getEstimatedCompletion(refund.requestedAt, refund.refundMethod)}
                  </span>
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Processing time may vary based on your payment method and bank.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {showTimeline && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Refund Timeline</h4>
            <RefundTimeline events={timelineEvents} />
          </div>
        )}

        {/* Success Message */}
        {refund.status === 'succeeded' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-900">Refund Completed</p>
                <p className="text-green-700 mt-1">
                  The refund has been successfully processed and credited to your{' '}
                  {getRefundMethodLabel(refund.refundMethod).toLowerCase()}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Failure Message */}
        {refund.status === 'failed' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-900">Refund Failed</p>
                <p className="text-red-700 mt-1">
                  The refund processing failed. Please contact customer support for assistance.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RefundStatus;
