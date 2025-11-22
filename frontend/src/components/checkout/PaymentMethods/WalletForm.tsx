'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  WalletIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { Price } from '@/types/common.types';
import type { PaymentSuccessResponse, PaymentError } from './PaymentMethods';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WalletFormProps {
  amount: Price;
  orderId: string;
  orderDetails?: {
    items: Array<{
      name: string;
      quantity: number;
      price: Price;
    }>;
    customerEmail?: string;
    customerPhone?: string;
    customerName?: string;
  };
  onSuccess: (response: PaymentSuccessResponse) => void | Promise<void>;
  onError: (error: PaymentError) => void;
  onCancel?: () => void;
  testMode?: boolean;
}

interface Wallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  requiresPhone?: boolean;
  offers?: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const WALLETS: Wallet[] = [
  {
    id: 'paytm',
    name: 'Paytm',
    icon: '💙',
    color: 'from-cyan-600 to-blue-600',
    requiresPhone: true,
    offers: ['Get 10% cashback up to ₹100'],
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    icon: '💜',
    color: 'from-purple-600 to-purple-800',
    requiresPhone: true,
    offers: ['Scratch card up to ₹1000'],
  },
  {
    id: 'googlepay',
    name: 'Google Pay',
    icon: '📱',
    color: 'from-blue-600 to-green-600',
    offers: ['Cashback on first transaction'],
  },
  {
    id: 'amazonpay',
    name: 'Amazon Pay',
    icon: '🛒',
    color: 'from-orange-600 to-yellow-600',
    offers: ['Get ₹50 back on ₹500+'],
  },
  {
    id: 'mobikwik',
    name: 'MobiKwik',
    icon: '💰',
    color: 'from-red-600 to-pink-600',
    offers: ['SuperCash on payments'],
  },
  {
    id: 'freecharge',
    name: 'Freecharge',
    icon: '⚡',
    color: 'from-yellow-600 to-orange-600',
    offers: ['Instant cashback'],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const WalletForm: React.FC<WalletFormProps> = ({
  amount,
  orderId,
  orderDetails,
  onSuccess,
  onError,
  onCancel,
  testMode = false,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // ============================================================================
  // ANALYTICS & LOGGING
  // ============================================================================

  // Log order details for analytics tracking
  useEffect(() => {
    if (orderDetails) {
      console.log('Wallet payment initiated for order:', {
        orderId,
        items: orderDetails.items,
        customer: orderDetails.customerEmail,
      });
    }
  }, [orderDetails, orderId]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedWalletData = useMemo(() => {
    return WALLETS.find(wallet => wallet.id === selectedWallet);
  }, [selectedWallet]);

  const isPhoneValid = useMemo(() => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  }, [phoneNumber]);

  const canProceed = useMemo(() => {
    if (!selectedWallet) return false;
    if (selectedWalletData?.requiresPhone && !isPhoneValid) return false;
    return true;
  }, [selectedWallet, selectedWalletData, isPhoneValid]);

  const hasSufficientBalance = useMemo(() => {
    if (walletBalance === null) return true;
    return walletBalance >= amount.amount;
  }, [walletBalance, amount.amount]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleWalletSelect = useCallback(async (walletId: string) => {
    setSelectedWallet(walletId);
    setPhoneError('');
    setWalletBalance(null);

    // Simulate checking wallet balance
    if (testMode) {
      setIsCheckingBalance(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Random balance for testing
      setWalletBalance(Math.random() > 0.3 ? amount.amount + 500 : amount.amount - 100);
      setIsCheckingBalance(false);
    }
  }, [amount.amount, testMode]);

  const validatePhone = useCallback((): boolean => {
    if (!selectedWalletData?.requiresPhone) return true;

    if (!phoneNumber) {
      setPhoneError('Phone number is required');
      return false;
    }

    if (!isPhoneValid) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return false;
    }

    setPhoneError('');
    return true;
  }, [selectedWalletData, phoneNumber, isPhoneValid]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWallet) {
      toast.error('Please select a wallet');
      return;
    }

    if (!validatePhone()) {
      return;
    }

    if (!hasSufficientBalance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate wallet payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success(`Opening ${selectedWalletData?.name}...`);

      // Simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response: PaymentSuccessResponse = {
        paymentId: `wallet_${Date.now()}`,
        orderId,
        paymentMethod: 'digital_wallet',
        amount,
        status: 'success',
        transactionId: `txn_${Date.now()}`,
        metadata: {
          walletId: selectedWallet,
          walletName: selectedWalletData?.name,
          phoneNumber: phoneNumber || undefined,
        },
      };

      await onSuccess(response);
      toast.success('Payment successful!');

    } catch (error) {
      const err = error as Error;
      const paymentError: PaymentError = {
        code: 'WALLET_PAYMENT_FAILED',
        message: err.message || 'Wallet payment failed',
        description: 'Please try again or use a different wallet',
        step: 'payment',
        metadata: {
          walletId: selectedWallet,
        },
      };
      
      onError(paymentError);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedWallet, selectedWalletData, phoneNumber, validatePhone, hasSufficientBalance, orderId, amount, onSuccess, onError]);

  const handleRefreshBalance = useCallback(async () => {
    if (!selectedWallet) return;

    setIsCheckingBalance(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setWalletBalance(Math.random() > 0.3 ? amount.amount + 500 : amount.amount - 100);
    setIsCheckingBalance(false);
    toast.success('Balance refreshed');
  }, [selectedWallet, amount.amount]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderWalletCard = (wallet: Wallet) => {
    const isSelected = selectedWallet === wallet.id;

    return (
      <motion.div
        key={wallet.id}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className={cn(
            'relative cursor-pointer transition-all duration-200 p-4',
            isSelected && 'ring-2 ring-blue-500 shadow-md',
            !isSelected && 'hover:shadow-md'
          )}
          onClick={() => handleWalletSelect(wallet.id)}
        >
          <div className="flex items-start gap-3">
            <div className={cn(
              'flex-shrink-0 w-12 h-12 bg-gradient-to-br rounded-lg flex items-center justify-center text-2xl',
              wallet.color
            )}>
              {wallet.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {wallet.name}
                </h4>
                {isSelected && (
                  <CheckCircleIconSolid className="h-5 w-5 text-blue-600 flex-shrink-0" />
                )}
              </div>

              {wallet.offers && wallet.offers.length > 0 && (
                <div className="space-y-1">
                  {wallet.offers.map((offer, index) => (
                    <div key={index} className="flex items-start gap-1">
                      <Badge variant="success" size="sm" className="text-xs">
                        Offer
                      </Badge>
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex-1">
                        {offer}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <WalletIcon className="h-6 w-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Digital Wallet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose your preferred wallet
          </p>
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 gap-3">
        {WALLETS.map(wallet => renderWalletCard(wallet))}
      </div>

      {/* Phone Number Input */}
      {selectedWallet && selectedWalletData?.requiresPhone && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DevicePhoneMobileIcon className="h-5 w-5" />
              Phone Number (linked to {selectedWalletData.name}) *
            </label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value.replace(/\D/g, '').substring(0, 10));
                setPhoneError('');
              }}
              placeholder="10-digit mobile number"
              maxLength={10}
              error={phoneError}
              disabled={isProcessing}
            />
          </div>
        </motion.div>
      )}

      {/* Wallet Balance */}
      {selectedWallet && walletBalance !== null && (
        <Card className={cn(
          'p-4',
          hasSufficientBalance
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <WalletIcon className={cn(
                'h-5 w-5',
                hasSufficientBalance ? 'text-green-600' : 'text-red-600'
              )} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Wallet Balance
                </p>
                <p className={cn(
                  'text-lg font-bold',
                  hasSufficientBalance ? 'text-green-600' : 'text-red-600'
                )}>
                  {amount.currency} {walletBalance.toFixed(2)}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRefreshBalance}
              disabled={isCheckingBalance}
              loading={isCheckingBalance}
            >
              <ArrowPathIcon className="h-4 w-4" />
            </Button>
          </div>

          {!hasSufficientBalance && (
            <Alert variant="warning" className="mt-3">
              <ExclamationCircleIcon className="h-5 w-5" />
              <div>
                <p className="text-sm">
                  Insufficient balance. Please add funds to your wallet or choose a different payment method.
                </p>
              </div>
            </Alert>
          )}
        </Card>
      )}

      {/* Loading Balance */}
      {selectedWallet && isCheckingBalance && (
        <Alert variant="info">
          <ArrowPathIcon className="h-5 w-5 animate-spin" />
          <div>
            <p className="text-sm">Checking wallet balance...</p>
          </div>
        </Alert>
      )}

      {/* Payment Info */}
      {selectedWallet && (
        <Alert variant="info">
          <CheckCircleIcon className="h-5 w-5" />
          <div>
            <p className="text-sm">
              You will be redirected to {selectedWalletData?.name} to complete the payment
            </p>
          </div>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!canProceed || isProcessing || isCheckingBalance || !hasSufficientBalance}
          loading={isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Processing...' : `Pay ${amount.formatted}`}
        </Button>
      </div>
    </form>
  );
};

export default WalletForm;
