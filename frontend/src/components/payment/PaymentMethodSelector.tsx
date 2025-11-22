'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  WalletIcon,
  GiftIcon,
  PlusIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { PaymentMethod, PaymentMethodType } from '@/types/payment.types';
import type { Price } from '@/types/common.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PaymentMethodSelectorProps {
  /**
   * Available payment methods for the user
   */
  paymentMethods: PaymentMethod[];

  /**
   * Currently selected payment method ID
   */
  selectedMethodId?: string;

  /**
   * Callback when payment method is selected
   */
  onSelect: (paymentMethod: PaymentMethod) => void;

  /**
   * Callback to add new payment method
   */
  onAddNew?: () => void;

  /**
   * Callback to edit payment method
   */
  onEdit?: (paymentMethod: PaymentMethod) => void;

  /**
   * Callback to delete payment method
   */
  onDelete?: (paymentMethod: PaymentMethod) => void;

  /**
   * Show add new button
   */
  showAddNew?: boolean;

  /**
   * Show edit/delete actions
   */
  showActions?: boolean;

  /**
   * Display variant
   * - default: Full card with details
   * - compact: Minimal card
   * - list: List layout
   * - radio: Radio button selection
   */
  variant?: 'default' | 'compact' | 'list' | 'radio';

  /**
   * Filter by payment method types
   */
  filterTypes?: PaymentMethodType[];

  /**
   * Show only verified methods
   */
  verifiedOnly?: boolean;

  /**
   * Order amount (for method eligibility)
   */
  orderAmount?: Price;

  /**
   * Enable animations
   */
  animated?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Payment method configuration for icons and labels
 */
interface PaymentMethodConfig {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  color: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const paymentMethodConfig: Record<PaymentMethodType, PaymentMethodConfig> = {
  credit_card: {
    icon: CreditCardIcon,
    label: 'Credit Card',
    description: 'Visa, Mastercard, Amex',
    color: 'text-blue-600',
  },
  debit_card: {
    icon: CreditCardIcon,
    label: 'Debit Card',
    description: 'All major banks',
    color: 'text-primary-600',
  },
  net_banking: {
    icon: BanknotesIcon,
    label: 'Net Banking',
    description: 'All major banks',
    color: 'text-green-600',
  },
  upi: {
    icon: DevicePhoneMobileIcon,
    label: 'UPI',
    description: 'Google Pay, PhonePe, Paytm',
    color: 'text-primary-600',
  },
  digital_wallet: {
    icon: WalletIcon,
    label: 'Digital Wallet',
    description: 'Paytm, PhonePe, Amazon Pay',
    color: 'text-orange-600',
  },
  emi: {
    icon: CreditCardIcon,
    label: 'EMI',
    description: 'Easy monthly installments',
    color: 'text-teal-600',
  },
  cash_on_delivery: {
    icon: BanknotesIcon,
    label: 'Cash on Delivery',
    description: 'Pay when you receive',
    color: 'text-gray-600',
  },
  gift_card: {
    icon: GiftIcon,
    label: 'Gift Card',
    description: 'Use gift card balance',
    color: 'text-pink-600',
  },
  store_credit: {
    icon: WalletIcon,
    label: 'Store Credit',
    description: 'Use store credit balance',
    color: 'text-cyan-600',
  },
  bank_transfer: {
    icon: BanknotesIcon,
    label: 'Bank Transfer',
    description: 'Direct bank transfer',
    color: 'text-emerald-600',
  },
  cryptocurrency: {
    icon: WalletIcon,
    label: 'Cryptocurrency',
    description: 'Bitcoin, Ethereum',
    color: 'text-yellow-600',
  },
  buy_now_pay_later: {
    icon: CreditCardIcon,
    label: 'Buy Now Pay Later',
    description: 'Pay in installments',
    color: 'text-violet-600',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format card number for display (shows last 4 digits)
 */
const formatCardNumber = (last4: string): string => {
  return `•••• •••• •••• ${last4}`;
};

/**
 * Format expiry date
 */
const formatExpiry = (month: number, year: number): string => {
  return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
};

/**
 * Check if payment method is expired
 */
const isExpired = (method: PaymentMethod): boolean => {
  if (method.expiresAt) {
    return new Date(method.expiresAt) < new Date();
  }
  if (method.cardDetails) {
    const { expiryMonth, expiryYear } = method.cardDetails;
    const expiryDate = new Date(expiryYear, expiryMonth - 1);
    return expiryDate < new Date();
  }
  return false;
};

/**
 * Get payment method color
 */
const getPaymentColor = (type: PaymentMethodType): string => {
  return paymentMethodConfig[type]?.color || 'text-gray-600';
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Payment Method Card Component
 */
interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  variant: 'default' | 'compact' | 'list' | 'radio';
  showActions: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  animated: boolean;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  selected,
  variant,
  showActions,
  onSelect,
  onEdit,
  onDelete,
  animated,
}) => {
  const config = paymentMethodConfig[method.type];
  const Icon = config?.icon || CreditCardIcon;
  const expired = isExpired(method);

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    hover: { scale: 1.02 },
  };

  // Render based on variant
  const renderContent = () => {
    switch (variant) {
      case 'compact':
        return (
          <div
            className={cn(
              'flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all',
              selected
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300',
              expired && 'opacity-50 cursor-not-allowed'
            )}
            onClick={!expired ? onSelect : undefined}
          >
            <Icon className={cn('h-6 w-6', getPaymentColor(method.type))} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {method.nickname || config?.label}
              </p>
              {method.cardDetails && (
                <p className="text-xs text-gray-500">
                  {formatCardNumber(method.cardDetails.last4)}
                </p>
              )}
            </div>
            {selected && <CheckCircleIcon className="h-5 w-5 text-primary-600" />}
            {method.isDefault && !selected && (
              <Badge variant="secondary" className="text-xs">
                Default
              </Badge>
            )}
          </div>
        );

      case 'list':
        return (
          <div
            className={cn(
              'flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all',
              selected
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300',
              expired && 'opacity-50 cursor-not-allowed'
            )}
            onClick={!expired ? onSelect : undefined}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                selected ? 'bg-primary-100' : 'bg-gray-100'
              )}
            >
              <Icon
                className={cn(
                  'h-6 w-6',
                  selected ? 'text-primary-600' : getPaymentColor(method.type)
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-base font-medium text-gray-900">
                  {method.nickname || config?.label}
                </p>
                {method.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
                {method.isVerified && (
                  <ShieldCheckIcon className="h-4 w-4 text-green-600" title="Verified" />
                )}
              </div>
              <p className="text-sm text-gray-500">{config?.description}</p>
              {method.cardDetails && (
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{formatCardNumber(method.cardDetails.last4)}</span>
                  <span>Expires {formatExpiry(method.cardDetails.expiryMonth, method.cardDetails.expiryYear)}</span>
                </div>
              )}
              {expired && (
                <Badge variant="destructive" className="mt-1 text-xs">
                  Expired
                </Badge>
              )}
            </div>
            {showActions && !expired && (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    leftIcon={<PencilIcon className="h-4 w-4" />}
                    title="Edit payment method"
                  >
                    Edit
                  </Button>
                )}
                {onDelete && !method.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    leftIcon={<TrashIcon className="h-4 w-4" />}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete payment method"
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
            {selected && <CheckCircleIcon className="h-6 w-6 text-primary-600 flex-shrink-0" />}
          </div>
        );

      case 'radio':
        return (
          <label
            className={cn(
              'flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all',
              selected
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300',
              expired && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="radio"
              checked={selected}
              onChange={onSelect}
              disabled={expired}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 flex-shrink-0"
            />
            <Icon className={cn('h-6 w-6', getPaymentColor(method.type))} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">
                  {method.nickname || config?.label}
                </p>
                {method.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>
              {method.cardDetails && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatCardNumber(method.cardDetails.last4)} • Exp{' '}
                  {formatExpiry(method.cardDetails.expiryMonth, method.cardDetails.expiryYear)}
                </p>
              )}
            </div>
          </label>
        );

      case 'default':
      default:
        return (
          <Card
            className={cn(
              'cursor-pointer transition-all',
              selected ? 'ring-2 ring-primary-500' : 'hover:shadow-md',
              expired && 'opacity-50 cursor-not-allowed'
            )}
            onClick={!expired ? onSelect : undefined}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      selected ? 'bg-primary-100' : 'bg-gray-100'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        selected ? 'text-primary-600' : getPaymentColor(method.type)
                      )}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {method.nickname || config?.label}
                    </h4>
                    <p className="text-xs text-gray-500">{config?.description}</p>
                  </div>
                </div>
                {selected && <CheckCircleIcon className="h-6 w-6 text-primary-600" />}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Card Details */}
              {method.cardDetails && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Card Number</span>
                    <span className="font-medium text-gray-900">
                      {formatCardNumber(method.cardDetails.last4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Expires</span>
                    <span className="font-medium text-gray-900">
                      {formatExpiry(
                        method.cardDetails.expiryMonth,
                        method.cardDetails.expiryYear
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Card Type</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {method.cardDetails.cardType}
                    </span>
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {method.bankDetails && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Bank</span>
                    <span className="font-medium text-gray-900">{method.bankDetails.bankName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Account</span>
                    <span className="font-medium text-gray-900">
                      ••••{method.bankDetails.accountNumber}
                    </span>
                  </div>
                </div>
              )}

              {/* Wallet Details */}
              {method.walletDetails && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Wallet Provider</span>
                    <span className="font-medium text-gray-900">
                      {method.walletDetails.walletProvider}
                    </span>
                  </div>
                  {method.walletDetails.phoneNumber && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium text-gray-900">
                        {method.walletDetails.phoneNumber}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {method.isDefault && <Badge variant="secondary">Default</Badge>}
                {method.isVerified && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <ShieldCheckIcon className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                {expired && <Badge variant="destructive">Expired</Badge>}
              </div>

              {/* Actions */}
              {showActions && !expired && (
                <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                  {onEdit && (
                    <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
                      Edit
                    </Button>
                  )}
                  {onDelete && !method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onDelete}
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
    }
  };

  // Wrap with animation if enabled
  if (animated && variant !== 'radio') {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover={!expired ? "hover" : undefined}
        transition={{ duration: 0.2 }}
      >
        {renderContent()}
      </motion.div>
    );
  }

  return <>{renderContent()}</>;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * PaymentMethodSelector Component
 * 
 * Comprehensive payment method selection component with multiple variants.
 * Features:
 * - 4 display variants (default, compact, list, radio)
 * - Card, bank, and wallet payment methods
 * - Add, edit, delete functionality
 * - Expired method detection
 * - Verified badge display
 * - Default method indication
 * - Method filtering by type
 * - Animated transitions
 * 
 * @example
 * ```tsx
 * <PaymentMethodSelector
 *   paymentMethods={userPaymentMethods}
 *   selectedMethodId={selectedId}
 *   onSelect={(method) => handleSelect(method)}
 *   onAddNew={() => showAddMethodModal()}
 *   variant="list"
 * />
 * ```
 */
export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethods,
  selectedMethodId,
  onSelect,
  onAddNew,
  onEdit,
  onDelete,
  showAddNew = true,
  showActions = true,
  variant = 'default',
  filterTypes,
  verifiedOnly = false,
  animated = true,
  className,
}) => {

  // Filter payment methods
  const filteredMethods = useMemo(() => {
    let methods = [...paymentMethods];

    // Filter by types
    if (filterTypes && filterTypes.length > 0) {
      methods = methods.filter((m) => filterTypes.includes(m.type));
    }

    // Filter verified only
    if (verifiedOnly) {
      methods = methods.filter((m) => m.isVerified);
    }

    // Filter active only
    methods = methods.filter((m) => m.isActive);

    // Sort: default first, then by last used
    methods.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      
      const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
      const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
      return bTime - aTime;
    });

    return methods;
  }, [paymentMethods, filterTypes, verifiedOnly]);

  // Grid/List layout classes
  const gridClasses = {
    default: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    compact: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3',
    list: 'space-y-3',
    radio: 'space-y-3',
  };

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-500 mt-1">
            {filteredMethods.length > 0
              ? `${filteredMethods.length} payment method${filteredMethods.length > 1 ? 's' : ''} available`
              : 'No payment methods available'}
          </p>
        </div>
        {showAddNew && onAddNew && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddNew}
            leftIcon={<PlusIcon className="h-4 w-4" />}
          >
            Add New
          </Button>
        )}
      </div>

      {/* Payment Methods Grid/List */}
      {filteredMethods.length > 0 ? (
        <AnimatePresence mode="wait">
          {animated ? (
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className={gridClasses[variant]}
            >
              {filteredMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  selected={method.id === selectedMethodId}
                  variant={variant}
                  showActions={showActions}
                  onSelect={() => onSelect(method)}
                  onEdit={onEdit ? () => onEdit(method) : undefined}
                  onDelete={onDelete ? () => onDelete(method) : undefined}
                  animated={animated}
                />
              ))}
            </motion.div>
          ) : (
            <div className={gridClasses[variant]}>
              {filteredMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  selected={method.id === selectedMethodId}
                  variant={variant}
                  showActions={showActions}
                  onSelect={() => onSelect(method)}
                  onEdit={onEdit ? () => onEdit(method) : undefined}
                  onDelete={onDelete ? () => onDelete(method) : undefined}
                  animated={false}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      ) : (
        <Card className="p-8">
          <div className="text-center">
            <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-gray-900 mb-1">No Payment Methods</h4>
            <p className="text-sm text-gray-500 mb-4">
              Add a payment method to continue with your purchase
            </p>
            {onAddNew && (
              <Button onClick={onAddNew} leftIcon={<PlusIcon className="h-4 w-4" />}>
                Add Payment Method
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Security Notice */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <ShieldCheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium">Secure Payment</p>
          <p className="text-blue-700 mt-1">
            All payment methods are encrypted and stored securely. We never share your payment information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
