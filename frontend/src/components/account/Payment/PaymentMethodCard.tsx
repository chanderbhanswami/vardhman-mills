'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  WalletIcon,
  CheckBadgeIcon,
  StarIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { PaymentMethod, PaymentMethodType, CardBrand } from '@/types/payment.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PaymentMethodCardProps {
  /** Payment method data */
  method: PaymentMethod;
  
  /** Selected state */
  selected?: boolean;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Edit handler */
  onEdit?: (method: PaymentMethod) => void;
  
  /** Delete handler */
  onDelete?: (method: PaymentMethod) => void;
  
  /** Set default handler */
  onSetDefault?: (method: PaymentMethod) => void;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Show actions menu */
  showActions?: boolean;
  
  /** Show last used */
  showLastUsed?: boolean;
  
  /** Show expiry warning */
  showExpiryWarning?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_TYPE_ICONS: Record<PaymentMethodType, React.ComponentType<{ className?: string }>> = {
  credit_card: CreditCardIcon,
  debit_card: CreditCardIcon,
  net_banking: BanknotesIcon,
  upi: DevicePhoneMobileIcon,
  digital_wallet: WalletIcon,
  emi: CreditCardIcon,
  cash_on_delivery: BanknotesIcon,
  gift_card: CreditCardIcon,
  store_credit: CreditCardIcon,
  bank_transfer: BanknotesIcon,
  cryptocurrency: WalletIcon,
  buy_now_pay_later: CreditCardIcon,
};

const PAYMENT_TYPE_LABELS: Record<PaymentMethodType, string> = {
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  net_banking: 'Net Banking',
  upi: 'UPI',
  digital_wallet: 'Digital Wallet',
  emi: 'EMI',
  cash_on_delivery: 'Cash on Delivery',
  gift_card: 'Gift Card',
  store_credit: 'Store Credit',
  bank_transfer: 'Bank Transfer',
  cryptocurrency: 'Cryptocurrency',
  buy_now_pay_later: 'Buy Now Pay Later',
};

const CARD_BRAND_COLORS: Record<CardBrand, { bg: string; text: string }> = {
  visa: { bg: 'bg-blue-100', text: 'text-blue-700' },
  mastercard: { bg: 'bg-red-100', text: 'text-red-700' },
  amex: { bg: 'bg-gray-100', text: 'text-gray-700' },
  discover: { bg: 'bg-orange-100', text: 'text-orange-700' },
  diners: { bg: 'bg-purple-100', text: 'text-purple-700' },
  jcb: { bg: 'bg-green-100', text: 'text-green-700' },
  rupay: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  maestro: { bg: 'bg-teal-100', text: 'text-teal-700' },
  unionpay: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * PaymentMethodCard Component
 * 
 * Individual payment method display card with features including:
 * - Card brand/type icons with colors
 * - Masked card number display (last 4 digits)
 * - Expiry date display
 * - Default badge
 * - Verified badge
 * - Last used timestamp
 * - Actions menu (edit, delete, set default)
 * - Expiry warnings (30 days)
 * - Compact and full view modes
 * - Selection support
 * - Provider display
 * - Nickname/alias
 * 
 * @example
 * ```tsx
 * <PaymentMethodCard
 *   method={paymentMethod}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   showExpiryWarning={true}
 * />
 * ```
 */
export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  selected = false,
  onClick,
  onEdit,
  onDelete,
  onSetDefault,
  compact = false,
  showActions = true,
  showLastUsed = true,
  showExpiryWarning = true,
  className,
}) => {
  // State
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Get payment type icon
  const Icon = PAYMENT_TYPE_ICONS[method.type] || CreditCardIcon;

  // Check if card is expiring soon (within 30 days)
  const isExpiringSoon = useCallback(() => {
    if (!method.cardDetails) return false;
    
    const { expiryMonth, expiryYear } = method.cardDetails;
    const expiryDate = new Date(expiryYear, expiryMonth - 1);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  }, [method.cardDetails]);

  // Check if card is expired
  const isExpired = useCallback(() => {
    if (!method.cardDetails) return false;
    
    const { expiryMonth, expiryYear } = method.cardDetails;
    const expiryDate = new Date(expiryYear, expiryMonth - 1);
    const today = new Date();
    
    return expiryDate < today;
  }, [method.cardDetails]);

  // Format display text based on payment type
  const displayText = useCallback(() => {
    if (method.cardDetails) {
      return `•••• ${method.cardDetails.last4}`;
    } else if (method.bankDetails) {
      return `•••• ${method.bankDetails.accountNumber.slice(-4)}`;
    } else if (method.walletDetails) {
      return method.walletDetails.walletId;
    }
    return method.type;
  }, [method]);

  // Format last used text
  const lastUsedText = useCallback(() => {
    if (!method.lastUsedAt) return 'Never used';
    return `Used ${formatDistanceToNow(new Date(method.lastUsedAt), { addSuffix: true })}`;
  }, [method.lastUsedAt]);

  // Handlers
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActionsMenu(false);
    onEdit?.(method);
  }, [method, onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActionsMenu(false);
    onDelete?.(method);
  }, [method, onDelete]);

  const handleSetDefault = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActionsMenu(false);
    onSetDefault?.(method);
  }, [method, onSetDefault]);

  const handleCardClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  // Render component
  return (
    <Card
      className={cn(
        'relative transition-all cursor-pointer group',
        selected && 'ring-2 ring-primary-500',
        !method.isActive && 'opacity-60',
        compact ? 'p-3' : 'p-4',
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="flex items-start justify-between">
          {/* Left side - Icon and details */}
          <div className="flex items-start gap-3 flex-1">
            {/* Icon */}
            <div className={cn(
              'flex items-center justify-center rounded-lg',
              compact ? 'w-10 h-10' : 'w-12 h-12',
              method.isDefault ? 'bg-primary-100' : 'bg-gray-100'
            )}>
              <Icon className={cn(
                compact ? 'w-5 h-5' : 'w-6 h-6',
                method.isDefault ? 'text-primary-600' : 'text-gray-600'
              )} />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              {/* Type and nickname */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn(
                  'font-semibold text-gray-900',
                  compact ? 'text-sm' : 'text-base'
                )}>
                  {method.nickname || PAYMENT_TYPE_LABELS[method.type]}
                </h3>
                
                {method.isVerified && (
                  <CheckBadgeIcon className="w-4 h-4 text-green-600" />
                )}
              </div>

              {/* Display text (card number, account, etc) */}
              <div className="flex items-center gap-2 flex-wrap">
                <p className={cn(
                  'font-mono text-gray-600',
                  compact ? 'text-xs' : 'text-sm'
                )}>
                  {displayText()}
                </p>

                {/* Card brand badge */}
                {method.cardDetails && (
                  <Badge
                    size="sm"
                    className={cn(
                      CARD_BRAND_COLORS[method.cardDetails.brand]?.bg || 'bg-gray-100',
                      CARD_BRAND_COLORS[method.cardDetails.brand]?.text || 'text-gray-700'
                    )}
                  >
                    {method.cardDetails.brand.toUpperCase()}
                  </Badge>
                )}

                {/* Provider badge */}
                {method.provider && (
                  <Badge variant="secondary" size="sm">
                    {method.provider.toUpperCase()}
                  </Badge>
                )}
              </div>

              {/* Expiry date for cards */}
              {method.cardDetails && !compact && (
                <p className="text-xs text-gray-500 mt-1">
                  Expires {method.cardDetails.expiryMonth}/{method.cardDetails.expiryYear}
                </p>
              )}

              {/* Bank details */}
              {method.bankDetails && !compact && (
                <p className="text-xs text-gray-500 mt-1">
                  {method.bankDetails.bankName} • {method.bankDetails.accountType}
                </p>
              )}

              {/* Last used */}
              {showLastUsed && !compact && (
                <div className="flex items-center gap-1 mt-2">
                  <ClockIcon className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-500">{lastUsedText()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Badges and actions */}
          <div className="flex flex-col items-end gap-2 ml-3">
            {/* Badges */}
            <div className="flex flex-col items-end gap-1">
              {method.isDefault && (
                <Badge variant="default" size="sm">
                  <StarIconSolid className="w-3 h-3 mr-1" />
                  Default
                </Badge>
              )}

              {/* Expiry warning */}
              {showExpiryWarning && isExpired() && (
                <Badge variant="destructive" size="sm">
                  <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                  Expired
                </Badge>
              )}

              {showExpiryWarning && !isExpired() && isExpiringSoon() && (
                <Badge variant="warning" size="sm">
                  <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                  Expiring Soon
                </Badge>
              )}

              {!method.isActive && (
                <Badge variant="secondary" size="sm">
                  Inactive
                </Badge>
              )}
            </div>

            {/* Actions menu */}
            {showActions && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionsMenu(!showActionsMenu);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </Button>

                {showActionsMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                  >
                    {!method.isDefault && onSetDefault && (
                      <button
                        onClick={handleSetDefault}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <StarIcon className="w-4 h-4" />
                        Set as Default
                      </button>
                    )}
                    
                    {onEdit && (
                      <button
                        onClick={handleEdit}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    
                    {onDelete && (
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Compact mode - last used at bottom */}
        {compact && showLastUsed && (
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
            <ClockIcon className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-500">{lastUsedText()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodCard;
