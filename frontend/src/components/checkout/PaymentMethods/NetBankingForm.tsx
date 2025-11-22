'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingLibraryIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { Price } from '@/types/common.types';
import type { PaymentSuccessResponse, PaymentError } from './PaymentMethods';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface NetBankingFormProps {
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

interface Bank {
  id: string;
  name: string;
  code: string;
  popular?: boolean;
  logo?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BANKS: Bank[] = [
  { id: 'sbi', name: 'State Bank of India', code: 'SBI', popular: true },
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC', popular: true },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI', popular: true },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS', popular: true },
  { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KOTAK', popular: true },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PNB', popular: true },
  { id: 'boi', name: 'Bank of India', code: 'BOI' },
  { id: 'bob', name: 'Bank of Baroda', code: 'BOB' },
  { id: 'canara', name: 'Canara Bank', code: 'CANARA' },
  { id: 'union', name: 'Union Bank of India', code: 'UNION' },
  { id: 'indusind', name: 'IndusInd Bank', code: 'INDUSIND' },
  { id: 'yes', name: 'Yes Bank', code: 'YES' },
  { id: 'idbi', name: 'IDBI Bank', code: 'IDBI' },
  { id: 'citi', name: 'Citibank', code: 'CITI' },
  { id: 'hsbc', name: 'HSBC Bank', code: 'HSBC' },
  { id: 'standard', name: 'Standard Chartered', code: 'SC' },
  { id: 'dbs', name: 'DBS Bank', code: 'DBS' },
  { id: 'rbl', name: 'RBL Bank', code: 'RBL' },
  { id: 'idfc', name: 'IDFC First Bank', code: 'IDFC' },
  { id: 'bandhan', name: 'Bandhan Bank', code: 'BANDHAN' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const NetBankingForm: React.FC<NetBankingFormProps> = ({
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

  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAllBanks, setShowAllBanks] = useState(false);

  // ============================================================================
  // ANALYTICS & LOGGING
  // ============================================================================

  // Log order details for analytics tracking
  useEffect(() => {
    if (orderDetails) {
      console.log('NetBanking payment initiated for order:', {
        orderId,
        items: orderDetails.items,
        customer: orderDetails.customerEmail,
      });
    }
  }, [orderDetails, orderId]);

  // Log test mode state for debugging
  useEffect(() => {
    if (testMode) {
      console.log('NetBanking form running in test mode - will simulate payment');
    }
  }, [testMode]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const popularBanks = useMemo(() => {
    return BANKS.filter(bank => bank.popular);
  }, []);

  const otherBanks = useMemo(() => {
    return BANKS.filter(bank => !bank.popular);
  }, []);

  const filteredBanks = useMemo(() => {
    if (!searchQuery) {
      return showAllBanks ? BANKS : popularBanks;
    }

    const query = searchQuery.toLowerCase();
    return BANKS.filter(bank =>
      bank.name.toLowerCase().includes(query) ||
      bank.code.toLowerCase().includes(query)
    );
  }, [searchQuery, showAllBanks, popularBanks]);

  const selectedBankData = useMemo(() => {
    return BANKS.find(bank => bank.id === selectedBank);
  }, [selectedBank]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBankSelect = useCallback((bankId: string) => {
    setSelectedBank(bankId);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBank) {
      toast.error('Please select a bank');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate bank redirection
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success(`Redirecting to ${selectedBankData?.name} banking portal...`);

      // Simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response: PaymentSuccessResponse = {
        paymentId: `nb_${Date.now()}`,
        orderId,
        paymentMethod: 'net_banking',
        amount,
        status: 'success',
        transactionId: `txn_${Date.now()}`,
        metadata: {
          bankId: selectedBank,
          bankName: selectedBankData?.name,
        },
      };

      await onSuccess(response);
      toast.success('Payment successful!');

    } catch (error) {
      const err = error as Error;
      const paymentError: PaymentError = {
        code: 'NETBANKING_FAILED',
        message: err.message || 'Net banking payment failed',
        description: 'Please try again or use a different bank',
        step: 'payment',
        metadata: {
          bankId: selectedBank,
        },
      };
      
      onError(paymentError);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedBank, selectedBankData, orderId, amount, onSuccess, onError]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderBankCard = (bank: Bank) => {
    const isSelected = selectedBank === bank.id;

    return (
      <motion.div
        key={bank.id}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className={cn(
            'relative cursor-pointer transition-all duration-200 p-4',
            isSelected && 'ring-2 ring-blue-500 shadow-md',
            !isSelected && 'hover:shadow-md'
          )}
          onClick={() => handleBankSelect(bank.id)}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                {bank.code.substring(0, 2)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {bank.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {bank.code}
                </p>
              </div>
            </div>

            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex-shrink-0"
              >
                <CheckCircleIconSolid className="h-6 w-6 text-blue-600" />
              </motion.div>
            )}
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
        <BanknotesIcon className="h-6 w-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Net Banking
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select your bank to continue
          </p>
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <MagnifyingGlassIcon className="h-5 w-5" />
          Search Bank
        </label>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for your bank..."
          disabled={isProcessing}
        />
      </div>

      {/* Selected Bank Summary */}
      {selectedBank && selectedBankData && (
        <Alert variant="info">
          <BuildingLibraryIcon className="h-5 w-5" />
          <div>
            <p className="font-semibold">Selected Bank</p>
            <p className="text-sm">{selectedBankData.name}</p>
          </div>
        </Alert>
      )}

      {/* Popular Banks */}
      {!searchQuery && !showAllBanks && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Popular Banks
            </h4>
            <Badge variant="secondary">Most Used</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {popularBanks.map(bank => renderBankCard(bank))}
          </div>
        </div>
      )}

      {/* All Banks */}
      {(searchQuery || showAllBanks) && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {searchQuery ? 'Search Results' : 'All Banks'}
          </h4>
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
            {filteredBanks.map(bank => renderBankCard(bank))}
          </div>
          {filteredBanks.length === 0 && (
            <Card className="p-8 text-center">
              <BuildingLibraryIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No banks found matching &quot;{searchQuery}&quot;
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Show More Button */}
      {!searchQuery && !showAllBanks && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAllBanks(true)}
          className="w-full"
        >
          Show All Banks ({otherBanks.length} more)
        </Button>
      )}

      {/* Payment Info */}
      {selectedBank && (
        <Alert variant="warning">
          <CheckCircleIcon className="h-5 w-5" />
          <div>
            <p className="text-sm">
              You will be redirected to your bank&apos;s secure login page to complete the payment
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
          disabled={!selectedBank || isProcessing}
          loading={isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Redirecting...' : `Pay ${amount.formatted}`}
        </Button>
      </div>
    </form>
  );
};

export default NetBankingForm;
