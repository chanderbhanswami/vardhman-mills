/**
 * Refund Request Form Component
 * 
 * Form for creating new refund requests with:
 * - Order selection
 * - Refund type and reason
 * - Items selection (for partial refunds)
 * - Payment method and bank details
 * - Validation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

// Services
import * as refundService from '@/services/refund.service';
import type { CreateRefundData, RefundReason, RefundType, PaymentMethod } from '@/services/refund.service';

// Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/common';

// Utils
import { formatCurrency } from '@/lib/utils';

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

interface OrderItem {
  product: {
    _id: string;
    name: string;
  };
  quantity: number;
  price: number;
}

export interface RefundRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const REFUND_REASONS: { value: RefundReason; label: string }[] = [
  { value: 'defective', label: 'Defective Product' },
  { value: 'wrong_item', label: 'Wrong Item Received' },
  { value: 'not_as_described', label: 'Not As Described' },
  { value: 'damaged', label: 'Damaged in Transit' },
  { value: 'late_delivery', label: 'Late Delivery' },
  { value: 'changed_mind', label: 'Changed Mind' },
  { value: 'better_price', label: 'Better Price Elsewhere' },
  { value: 'duplicate_order', label: 'Duplicate Order' },
  { value: 'other', label: 'Other' },
];

export const RefundRequestForm: React.FC<RefundRequestFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  // Form state
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundType, setRefundType] = useState<RefundType>('full');
  const [reason, setReason] = useState<RefundReason>('defective');
  const [detailedReason, setDetailedReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('original');
  const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number; reason: string }[]>([]);
  
  // Bank details
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    bankName: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  // Load user's orders
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      // Mock data - replace with actual API call
      const mockOrders: Order[] = [
        {
          _id: '1',
          orderNumber: 'ORD-2025-001',
          total: 5999,
          status: 'delivered',
          items: [
            {
              product: { _id: 'p1', name: 'Premium Cotton Shirt' },
              quantity: 2,
              price: 2999,
            },
          ],
          createdAt: new Date().toISOString(),
        },
      ];
      setOrders(mockOrders);
    } catch {
      setError('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const validateStep1 = () => {
    if (!selectedOrder) {
      setError('Please select an order');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!reason) {
      setError('Please select a reason');
      return false;
    }
    if (refundType === 'partial' && selectedItems.length === 0) {
      setError('Please select at least one item for partial refund');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (paymentMethod === 'bank_transfer') {
      if (!bankDetails.accountNumber || !bankDetails.accountHolderName || !bankDetails.ifscCode) {
        setError('Please fill in all bank details');
        return false;
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode)) {
        setError('Invalid IFSC code format');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateStep3()) return;
    if (!selectedOrder) return;

    try {
      setLoading(true);

      const data: CreateRefundData = {
        orderId: selectedOrder._id,
        type: refundType,
        reason,
        detailedReason: detailedReason || undefined,
        paymentMethod,
        requiresReturn: refundType !== 'exchange',
      };

      if (refundType === 'partial' && selectedItems.length > 0) {
        data.items = selectedItems.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          reason: item.reason,
        }));
      }

      if (paymentMethod === 'bank_transfer') {
        data.bankDetails = {
          accountNumber: bankDetails.accountNumber,
          accountHolderName: bankDetails.accountHolderName,
          ifscCode: bankDetails.ifscCode,
          bankName: bankDetails.bankName || undefined,
        };
      }

      await refundService.createRefundRequest(data);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create refund request');
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (productId: string, quantity: number) => {
    setSelectedItems(prev => {
      const exists = prev.find(item => item.productId === productId);
      if (exists) {
        return prev.filter(item => item.productId !== productId);
      } else {
        return [...prev, { productId, quantity, reason: '' }];
      }
    });
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Refund Request Submitted!</h3>
        <p className="text-gray-600 dark:text-gray-400">
          We&apos;ll review your request and get back to you soon.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((num) => (
          <React.Fragment key={num}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= num
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {num}
              </div>
              <div className="text-xs mt-2 text-center">
                {num === 1 && 'Select Order'}
                {num === 2 && 'Refund Details'}
                {num === 3 && 'Payment Info'}
              </div>
            </div>
            {num < 3 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  step > num ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg"
        >
          <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      {/* Step 1: Select Order */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="font-semibold text-lg">Select Order to Refund</h3>
          
          {loadingOrders ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No eligible orders found for refund
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedOrder?._id === order._id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">Order #{order.orderNumber}</div>
                    <div className="font-bold">{formatCurrency(order.total)}</div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {order.items.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Step 2: Refund Details */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h3 className="font-semibold text-lg">Refund Details</h3>

          {/* Refund Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Refund Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['full', 'partial', 'exchange'] as RefundType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setRefundType(type)}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                    refundType === type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  {type === 'full' ? 'Full Refund' : type === 'partial' ? 'Partial' : 'Exchange'}
                </button>
              ))}
            </div>
          </div>

          {/* Items Selection (for partial refund) */}
          {refundType === 'partial' && selectedOrder && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Items</label>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.product._id}
                    onClick={() => toggleItemSelection(item.product._id, item.quantity)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedItems.some(i => i.productId === item.product._id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="font-semibold">{formatCurrency(item.price * item.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-2">Reason for Refund *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as RefundReason)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              {REFUND_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Detailed Reason */}
          <div>
            <label className="block text-sm font-medium mb-2">Additional Details (Optional)</label>
            <textarea
              value={detailedReason}
              onChange={(e) => setDetailedReason(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Please provide any additional details about your refund request..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 resize-none"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {detailedReason.length}/500
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Payment Info */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h3 className="font-semibold text-lg">Payment Information</h3>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium mb-2">Refund Payment Method</label>
            <div className="space-y-2">
              {(['original', 'bank_transfer', 'store_credit'] as PaymentMethod[]).map((method) => (
                <label
                  key={method}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === method
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">
                      {method === 'original' && 'Original Payment Method'}
                      {method === 'bank_transfer' && 'Bank Transfer'}
                      {method === 'store_credit' && 'Store Credit'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {method === 'original' && 'Refund to your original payment method'}
                      {method === 'bank_transfer' && 'Direct bank transfer to your account'}
                      {method === 'store_credit' && 'Get store credit for future purchases'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Bank Details */}
          {paymentMethod === 'bank_transfer' && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium">Bank Account Details</h4>
              
              <div>
                <label className="block text-sm font-medium mb-1">Account Holder Name *</label>
                <Input
                  type="text"
                  value={bankDetails.accountHolderName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Account Number *</label>
                <Input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  placeholder="1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">IFSC Code *</label>
                <Input
                  type="text"
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="SBIN0001234"
                  maxLength={11}
                />
                <div className="text-xs text-gray-500 mt-1">Format: ABCD0123456</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bank Name (Optional)</label>
                <Input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  placeholder="State Bank of India"
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={step === 1 ? onCancel : handleBack}
          disabled={loading}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        {step < 3 ? (
          <Button onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner className="mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Refund Request'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default RefundRequestForm;
