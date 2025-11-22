'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  WalletIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import type { PaymentIntentStatus, PaymentMethodType } from '../../types/payment.types';
import type { Price } from '../../types/common.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PaymentStatusProps {
  status: PaymentIntentStatus;
  amount: Price;
  paymentMethod?: PaymentMethodType;
  transactionId?: string;
  failureReason?: string;
  onRetry?: () => void;
  onViewDetails?: () => void;
  onContactSupport?: () => void;
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  showIcon?: boolean;
  showAmount?: boolean;
  showActions?: boolean;
  animated?: boolean;
  className?: string;
}

interface StatusConfig {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  badgeColor: 'success' | 'destructive' | 'warning' | 'info' | 'default';
  showRetry?: boolean;
  showSupport?: boolean;
}

interface PaymentMethodConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const statusConfig: Record<PaymentIntentStatus, StatusConfig> = {
  requires_payment_method: {
    label: 'Payment Method Required',
    description: 'Please provide a payment method to continue',
    icon: CreditCardIcon,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    badgeColor: 'info',
    showRetry: false,
    showSupport: false,
  },
  requires_confirmation: {
    label: 'Awaiting Confirmation',
    description: 'Please confirm your payment to proceed',
    icon: ShieldCheckIcon,
    iconColor: 'text-primary-600',
    iconBg: 'bg-primary-100',
    badgeColor: 'info',
    showRetry: false,
    showSupport: false,
  },
  requires_action: {
    label: 'Action Required',
    description: 'Additional authentication required to complete payment',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    badgeColor: 'warning',
    showRetry: false,
    showSupport: true,
  },
  processing: {
    label: 'Processing Payment',
    description: 'Your payment is being processed, please wait',
    icon: ClockIcon,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    badgeColor: 'info',
    showRetry: false,
    showSupport: false,
  },
  requires_capture: {
    label: 'Payment Authorized',
    description: 'Payment authorized and will be captured soon',
    icon: ShieldCheckIcon,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    badgeColor: 'success',
    showRetry: false,
    showSupport: false,
  },
  cancelled: {
    label: 'Payment Cancelled',
    description: 'The payment was cancelled and no amount was charged',
    icon: XCircleIcon,
    iconColor: 'text-gray-600',
    iconBg: 'bg-gray-100',
    badgeColor: 'default',
    showRetry: true,
    showSupport: true,
  },
  succeeded: {
    label: 'Payment Successful',
    description: 'Your payment has been processed successfully',
    icon: CheckCircleIcon,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    badgeColor: 'success',
    showRetry: false,
    showSupport: false,
  },
  failed: {
    label: 'Payment Failed',
    description: 'Your payment could not be processed',
    icon: XCircleIcon,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    badgeColor: 'destructive',
    showRetry: true,
    showSupport: true,
  },
};

const paymentMethodConfig: Record<PaymentMethodType, PaymentMethodConfig> = {
  credit_card: { label: 'Credit Card', icon: CreditCardIcon },
  debit_card: { label: 'Debit Card', icon: CreditCardIcon },
  net_banking: { label: 'Net Banking', icon: BanknotesIcon },
  upi: { label: 'UPI', icon: DevicePhoneMobileIcon },
  digital_wallet: { label: 'Digital Wallet', icon: WalletIcon },
  emi: { label: 'EMI', icon: CreditCardIcon },
  cash_on_delivery: { label: 'Cash on Delivery', icon: BanknotesIcon },
  gift_card: { label: 'Gift Card', icon: GiftIcon },
  store_credit: { label: 'Store Credit', icon: WalletIcon },
  bank_transfer: { label: 'Bank Transfer', icon: BanknotesIcon },
  cryptocurrency: { label: 'Cryptocurrency', icon: WalletIcon },
  buy_now_pay_later: { label: 'Buy Now Pay Later', icon: CreditCardIcon },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatAmount = (price: Price): string => {
  return price.formatted || `${price.currency} ${price.amount.toFixed(2)}`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  amount,
  paymentMethod,
  transactionId,
  failureReason,
  onRetry,
  onViewDetails,
  onContactSupport,
  variant = 'default',
  showIcon = true,
  showAmount = true,
  showActions = true,
  animated = true,
  className,
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  const PaymentMethodIcon = paymentMethod ? paymentMethodConfig[paymentMethod]?.icon : null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: 'spring' as const,
        stiffness: 200,
        damping: 20
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity as number,
        ease: 'easeInOut' as const
      }
    }
  };

  // Render functions for different variants
  const renderMinimal = () => (
    <div className={cn('inline-flex items-center gap-2', className)}>
      {showIcon && (
        <motion.div
          className={cn('flex-shrink-0', config.iconBg, 'p-1 rounded-full')}
          variants={animated ? iconVariants : undefined}
          initial={animated ? 'hidden' : undefined}
          animate={animated ? 'visible' : undefined}
        >
          <Icon className={cn('h-4 w-4', config.iconColor)} />
        </motion.div>
      )}
      <span className="text-sm font-medium text-gray-900">{config.label}</span>
      <Badge variant={config.badgeColor} size="sm">
        {status.replace(/_/g, ' ')}
      </Badge>
    </div>
  );

  const renderCompact = () => (
    <Card variant="outlined" className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {showIcon && (
            <motion.div
              className={cn('flex-shrink-0', config.iconBg, 'p-3 rounded-full')}
              variants={animated ? iconVariants : undefined}
              initial={animated ? 'hidden' : undefined}
              animate={animated ? 'visible' : undefined}
            >
              <Icon className={cn('h-6 w-6', config.iconColor)} />
            </motion.div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-900">{config.label}</h3>
              <Badge variant={config.badgeColor} size="sm">
                {status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{config.description}</p>
            {showAmount && (
              <p className="text-lg font-bold text-gray-900 mt-2">
                {formatAmount(amount)}
              </p>
            )}
          </div>

          {showActions && (config.showRetry || config.showSupport) && (
            <div className="flex gap-2">
              {config.showRetry && onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  leftIcon={<ArrowPathIcon className="h-4 w-4" />}
                >
                  Retry
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderDefault = () => (
    <Card variant="elevated" className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {showIcon && (
              <motion.div
                className={cn('flex-shrink-0', config.iconBg, 'p-3 rounded-full')}
                variants={animated ? iconVariants : undefined}
                initial={animated ? 'hidden' : undefined}
                animate={animated ? 'visible' : undefined}
              >
                <Icon className={cn('h-6 w-6', config.iconColor)} />
              </motion.div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{config.label}</h3>
              <p className="text-sm text-gray-600 mt-1">{config.description}</p>
            </div>
          </div>
          <Badge variant={config.badgeColor}>
            {status.replace(/_/g, ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Amount */}
          {showAmount && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Amount</span>
              <span className="text-xl font-bold text-gray-900">{formatAmount(amount)}</span>
            </div>
          )}

          {/* Payment Method */}
          {paymentMethod && PaymentMethodIcon && (
            <div className="flex items-center gap-2 text-sm">
              <PaymentMethodIcon className="h-5 w-5 text-gray-500" />
              <span className="text-gray-600">Payment via</span>
              <span className="font-medium text-gray-900">
                {paymentMethodConfig[paymentMethod].label}
              </span>
            </div>
          )}

          {/* Transaction ID */}
          {transactionId && (
            <div className="text-sm">
              <span className="text-gray-600">Transaction ID: </span>
              <span className="font-mono text-gray-900">{transactionId}</span>
            </div>
          )}

          {/* Failure Reason */}
          {failureReason && status === 'failed' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <span className="font-medium">Reason: </span>
                {failureReason}
              </p>
            </div>
          )}

          {/* Processing Animation */}
          {status === 'processing' && (
            <motion.div
              className="flex items-center gap-2 text-sm text-blue-600"
              variants={pulseVariants}
              animate="pulse"
            >
              <ClockIcon className="h-4 w-4 animate-spin" />
              <span>Processing your payment...</span>
            </motion.div>
          )}

          {/* Actions */}
          {showActions && (config.showRetry || config.showSupport || onViewDetails) && (
            <div className="flex flex-wrap gap-2 pt-2">
              {config.showRetry && onRetry && (
                <Button
                  variant="default"
                  size="md"
                  onClick={onRetry}
                  leftIcon={<ArrowPathIcon className="h-4 w-4" />}
                >
                  Retry Payment
                </Button>
              )}
              
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={onViewDetails}
                >
                  View Details
                </Button>
              )}

              {config.showSupport && onContactSupport && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={onContactSupport}
                >
                  Contact Support
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderDetailed = () => (
    <Card variant="elevated" className={cn('overflow-hidden', className)}>
      {/* Header with gradient background */}
      <div className={cn(
        'p-6 bg-gradient-to-r',
        status === 'succeeded' ? 'from-green-50 to-emerald-50' :
        status === 'failed' ? 'from-red-50 to-rose-50' :
        status === 'processing' ? 'from-blue-50 to-indigo-50' :
        'from-gray-50 to-slate-50'
      )}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {showIcon && (
              <motion.div
                className={cn('flex-shrink-0', config.iconBg, 'p-4 rounded-full shadow-sm')}
                variants={animated ? iconVariants : undefined}
                initial={animated ? 'hidden' : undefined}
                animate={animated ? 'visible' : undefined}
              >
                <Icon className={cn('h-8 w-8', config.iconColor)} />
              </motion.div>
            )}
            <div>
              <Badge variant={config.badgeColor} className="mb-2">
                {status.replace(/_/g, ' ')}
              </Badge>
              <h3 className="text-2xl font-bold text-gray-900">{config.label}</h3>
              <p className="text-sm text-gray-600 mt-1">{config.description}</p>
            </div>
          </div>
        </div>

        {/* Amount Display */}
        {showAmount && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Amount</span>
              <span className="text-3xl font-bold text-gray-900">{formatAmount(amount)}</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethod && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                {PaymentMethodIcon && <PaymentMethodIcon className="h-6 w-6 text-gray-500" />}
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {paymentMethodConfig[paymentMethod].label}
                  </p>
                </div>
              </div>
            )}

            {transactionId && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Transaction ID</p>
                  <p className="text-sm font-mono font-semibold text-gray-900 truncate">
                    {transactionId}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Failure Reason */}
          {failureReason && status === 'failed' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Payment Failed</p>
                  <p className="text-sm text-red-700 mt-1">{failureReason}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Processing Status */}
          {status === 'processing' && (
            <motion.div
              className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg"
              variants={pulseVariants}
              animate="pulse"
            >
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Processing Payment</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Please wait while we process your payment. This may take a few moments.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Success Message */}
          {status === 'succeeded' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Payment Successful</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your payment has been processed successfully. You will receive a confirmation email shortly.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          {showActions && (config.showRetry || config.showSupport || onViewDetails) && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              {config.showRetry && onRetry && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={onRetry}
                  leftIcon={<ArrowPathIcon className="h-5 w-5" />}
                  className="flex-1"
                >
                  Retry Payment
                </Button>
              )}
              
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onViewDetails}
                  className="flex-1"
                >
                  View Details
                </Button>
              )}

              {config.showSupport && onContactSupport && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onContactSupport}
                  className="flex-1"
                >
                  Contact Support
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Render based on variant
  let content;
  switch (variant) {
    case 'minimal':
      content = renderMinimal();
      break;
    case 'compact':
      content = renderCompact();
      break;
    case 'detailed':
      content = renderDetailed();
      break;
    default:
      content = renderDefault();
  }

  // Wrap in AnimatePresence if animated
  if (animated && variant !== 'minimal') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  }

  return content;
};

export default PaymentStatus;
