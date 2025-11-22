'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCardIcon,
  BuildingLibraryIcon,
  DevicePhoneMobileIcon,
  WalletIcon,
  BanknotesIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { PaymentMethodType } from '@/types/payment.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PaymentFormData {
  paymentMethod: PaymentMethodType;
  
  // Card Details
  cardNumber?: string;
  cardHolderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  
  // UPI Details
  upiId?: string;
  
  // Net Banking Details
  bankCode?: string;
  
  // Digital Wallet
  walletProvider?: string;
  
  // EMI Details
  emiTenure?: number;
  emiInterestRate?: number;
  
  // Save for future
  savePaymentMethod?: boolean;
  nickname?: string;
}

export interface PaymentFormProps {
  /**
   * Order amount
   */
  amount: number;

  /**
   * Available payment methods
   */
  availablePaymentMethods?: PaymentMethodType[];

  /**
   * Initial data
   */
  initialData?: Partial<PaymentFormData>;

  /**
   * Callback when form is submitted
   */
  onSubmit: (data: PaymentFormData) => void | Promise<void>;

  /**
   * Callback when cancel is clicked
   */
  onCancel?: () => void;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Show save payment method option
   */
  showSaveOption?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_METHODS = [
  {
    type: 'credit_card' as PaymentMethodType,
    name: 'Credit Card',
    description: 'Visa, Mastercard, RuPay, Amex',
    icon: CreditCardIcon,
    popular: true,
  },
  {
    type: 'debit_card' as PaymentMethodType,
    name: 'Debit Card',
    description: 'All major debit cards accepted',
    icon: CreditCardIcon,
    popular: true,
  },
  {
    type: 'upi' as PaymentMethodType,
    name: 'UPI',
    description: 'Google Pay, PhonePe, Paytm',
    icon: DevicePhoneMobileIcon,
    popular: true,
  },
  {
    type: 'net_banking' as PaymentMethodType,
    name: 'Net Banking',
    description: 'All Indian banks',
    icon: BuildingLibraryIcon,
    popular: false,
  },
  {
    type: 'digital_wallet' as PaymentMethodType,
    name: 'Digital Wallet',
    description: 'Paytm, Amazon Pay, etc.',
    icon: WalletIcon,
    popular: false,
  },
  {
    type: 'emi' as PaymentMethodType,
    name: 'EMI / Pay Later',
    description: 'Convert to easy installments',
    icon: CreditCardIcon,
    popular: false,
  },
  {
    type: 'cash_on_delivery' as PaymentMethodType,
    name: 'Cash on Delivery',
    description: 'Pay when you receive',
    icon: BanknotesIcon,
    popular: false,
  },
];

const INDIAN_BANKS = [
  { code: 'SBI', name: 'State Bank of India' },
  { code: 'HDFC', name: 'HDFC Bank' },
  { code: 'ICICI', name: 'ICICI Bank' },
  { code: 'AXIS', name: 'Axis Bank' },
  { code: 'KOTAK', name: 'Kotak Mahindra Bank' },
  { code: 'PNB', name: 'Punjab National Bank' },
  { code: 'BOB', name: 'Bank of Baroda' },
  { code: 'CANARA', name: 'Canara Bank' },
  { code: 'IDBI', name: 'IDBI Bank' },
  { code: 'YES', name: 'Yes Bank' },
];

const EMI_TENURES = [
  { months: 3, interestRate: 12, description: '3 Months' },
  { months: 6, interestRate: 13, description: '6 Months' },
  { months: 9, interestRate: 14, description: '9 Months' },
  { months: 12, interestRate: 15, description: '12 Months' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format card number
 */
const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ');
};

/**
 * Validate card number (Luhn algorithm)
 */
const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Validate UPI ID
 */
const validateUPI = (upiId: string): boolean => {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return upiRegex.test(upiId);
};

/**
 * Calculate EMI amount
 */
const calculateEMI = (principal: number, tenure: number, rate: number): number => {
  const monthlyRate = rate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
               (Math.pow(1 + monthlyRate, tenure) - 1);
  return Math.round(emi);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * PaymentForm Component
 * 
 * Comprehensive payment form with multiple payment methods.
 * Features:
 * - Multiple payment methods (Card, UPI, Net Banking, Wallets, EMI, COD)
 * - Card validation with Luhn algorithm
 * - UPI ID validation
 * - EMI calculator
 * - Save payment method option
 * - Secure payment indicators
 * - Real-time validation
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <PaymentForm
 *   amount={1500}
 *   onSubmit={handleSubmit}
 *   showSaveOption={true}
 * />
 * ```
 */
export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  availablePaymentMethods,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  showSaveOption = true,
  className,
}) => {
  // Filter payment methods
  const paymentMethods = availablePaymentMethods
    ? PAYMENT_METHODS.filter((m) => availablePaymentMethods.includes(m.type))
    : PAYMENT_METHODS;

  // State
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(
    initialData?.paymentMethod || paymentMethods[0]?.type || 'credit_card'
  );
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethod: selectedMethod,
    cardNumber: initialData?.cardNumber || '',
    cardHolderName: initialData?.cardHolderName || '',
    expiryMonth: initialData?.expiryMonth || '',
    expiryYear: initialData?.expiryYear || '',
    cvv: initialData?.cvv || '',
    upiId: initialData?.upiId || '',
    bankCode: initialData?.bankCode || '',
    walletProvider: initialData?.walletProvider || '',
    emiTenure: initialData?.emiTenure || 3,
    emiInterestRate: initialData?.emiInterestRate || 12,
    savePaymentMethod: initialData?.savePaymentMethod ?? false,
    nickname: initialData?.nickname || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle method change
  const handleMethodChange = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
    setErrors({});
    setTouched({});
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    let processedValue = value;

    // Format card number
    if (name === 'cardNumber') {
      processedValue = formatCardNumber(value.replace(/\s/g, ''));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue,
    }));

    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name as keyof PaymentFormData]);
  };

  // Validate field
  const validateField = (name: string, value: unknown) => {
    let error = '';

    switch (name) {
      case 'cardNumber':
        if (!value || typeof value !== 'string') {
          error = 'Card number is required';
        } else if (!validateCardNumber(value)) {
          error = 'Invalid card number';
        }
        break;

      case 'cardHolderName':
        if (!value || typeof value !== 'string' || !value.trim()) {
          error = 'Cardholder name is required';
        }
        break;

      case 'expiryMonth':
        if (!value) {
          error = 'Required';
        } else {
          const month = parseInt(value as string);
          if (month < 1 || month > 12) error = 'Invalid month';
        }
        break;

      case 'expiryYear':
        if (!value) {
          error = 'Required';
        } else {
          const year = parseInt(value as string);
          const currentYear = new Date().getFullYear() % 100;
          if (year < currentYear) error = 'Card expired';
        }
        break;

      case 'cvv':
        if (!value || typeof value !== 'string') {
          error = 'CVV is required';
        } else if (!/^\d{3,4}$/.test(value)) {
          error = 'Invalid CVV';
        }
        break;

      case 'upiId':
        if (!value || typeof value !== 'string' || !value.trim()) {
          error = 'UPI ID is required';
        } else if (!validateUPI(value)) {
          error = 'Invalid UPI ID format';
        }
        break;

      case 'bankCode':
        if (!value || typeof value !== 'string') {
          error = 'Please select a bank';
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;

    if (selectedMethod === 'credit_card' || selectedMethod === 'debit_card') {
      isValid = validateField('cardNumber', formData.cardNumber) && isValid;
      isValid = validateField('cardHolderName', formData.cardHolderName) && isValid;
      isValid = validateField('expiryMonth', formData.expiryMonth) && isValid;
      isValid = validateField('expiryYear', formData.expiryYear) && isValid;
      isValid = validateField('cvv', formData.cvv) && isValid;
    } else if (selectedMethod === 'upi') {
      isValid = validateField('upiId', formData.upiId) && isValid;
    } else if (selectedMethod === 'net_banking') {
      isValid = validateField('bankCode', formData.bankCode) && isValid;
    }

    return isValid;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all relevant fields as touched
    setTouched({
      cardNumber: true,
      cardHolderName: true,
      expiryMonth: true,
      expiryYear: true,
      cvv: true,
      upiId: true,
      bankCode: true,
    });

    if (!validateForm()) {
      toast.error('Please fix all errors');
      return;
    }

    try {
      await onSubmit(formData);
      toast.success('Payment information saved');
    } catch (error) {
      console.error('Error submitting payment form:', error);
      toast.error('Failed to save payment information');
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
    >
      {/* Payment Method Selection */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <LockClosedIcon className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
              <p className="text-sm text-gray-600">Select your preferred payment method</p>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-green-600" />
              <span className="text-xs text-gray-600">Secure Payment</span>
            </div>
          </div>

          {/* Payment Methods Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.type;

              return (
                <motion.button
                  key={method.type}
                  type="button"
                  onClick={() => handleMethodChange(method.type)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'relative p-4 rounded-lg border-2 transition-all text-left',
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  {method.popular && (
                    <Badge 
                      variant="default" 
                      className="absolute -top-2 -right-2 text-xs"
                    >
                      Popular
                    </Badge>
                  )}
                  <Icon className={cn(
                    'h-6 w-6 mb-2',
                    isSelected ? 'text-primary-600' : 'text-gray-400'
                  )} />
                  <div className="text-sm font-semibold text-gray-900">
                    {method.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {method.description}
                  </div>
                  {isSelected && (
                    <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-primary-600" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Payment Details Form */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMethod}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Card Payment Form */}
          {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
            <Card className="p-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Enter Card Details</h4>

                {/* Card Number */}
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="1234 5678 9012 3456"
                      className={cn(
                        'pl-10',
                        errors.cardNumber && touched.cardNumber && 'border-red-500'
                      )}
                      maxLength={19}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.cardNumber && touched.cardNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      {errors.cardNumber}
                    </p>
                  )}
                </div>

                {/* Cardholder Name */}
                <div>
                  <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="cardHolderName"
                    name="cardHolderName"
                    type="text"
                    value={formData.cardHolderName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Name as on card"
                    className={cn(
                      errors.cardHolderName && touched.cardHolderName && 'border-red-500'
                    )}
                    disabled={isLoading}
                  />
                  {errors.cardHolderName && touched.cardHolderName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      {errors.cardHolderName}
                    </p>
                  )}
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-1">
                      Month <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="expiryMonth"
                      name="expiryMonth"
                      type="text"
                      value={formData.expiryMonth}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="MM"
                      maxLength={2}
                      className={cn(
                        errors.expiryMonth && touched.expiryMonth && 'border-red-500'
                      )}
                      disabled={isLoading}
                    />
                    {errors.expiryMonth && touched.expiryMonth && (
                      <p className="mt-1 text-xs text-red-600">{errors.expiryMonth}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-1">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="expiryYear"
                      name="expiryYear"
                      type="text"
                      value={formData.expiryYear}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="YY"
                      maxLength={2}
                      className={cn(
                        errors.expiryYear && touched.expiryYear && 'border-red-500'
                      )}
                      disabled={isLoading}
                    />
                    {errors.expiryYear && touched.expiryYear && (
                      <p className="mt-1 text-xs text-red-600">{errors.expiryYear}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="cvv"
                      name="cvv"
                      type="password"
                      value={formData.cvv}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="123"
                      maxLength={4}
                      className={cn(
                        errors.cvv && touched.cvv && 'border-red-500'
                      )}
                      disabled={isLoading}
                    />
                    {errors.cvv && touched.cvv && (
                      <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                {showSaveOption && (
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="savePaymentMethod"
                      checked={formData.savePaymentMethod}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      disabled={isLoading}
                      aria-label="Save this card for future purchases"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Save this card for future purchases
                      </span>
                      <p className="text-xs text-gray-500">
                        Securely save card details for faster checkout
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </Card>
          )}

          {/* UPI Payment Form */}
          {selectedMethod === 'upi' && (
            <Card className="p-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Enter UPI ID</h4>

                <div>
                  <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
                    UPI ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DevicePhoneMobileIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="upiId"
                      name="upiId"
                      type="text"
                      value={formData.upiId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="yourname@upi"
                      className={cn(
                        'pl-10',
                        errors.upiId && touched.upiId && 'border-red-500'
                      )}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.upiId && touched.upiId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      {errors.upiId}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                    <InformationCircleIcon className="h-3 w-3" />
                    You&apos;ll receive a payment request on your UPI app
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Net Banking Form */}
          {selectedMethod === 'net_banking' && (
            <Card className="p-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Select Your Bank</h4>

                <div>
                  <label htmlFor="bankCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Bank <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="bankCode"
                    name="bankCode"
                    value={formData.bankCode}
                    onChange={handleChange}
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                      errors.bankCode && touched.bankCode && 'border-red-500'
                    )}
                    disabled={isLoading}
                  >
                    <option value="">Select Bank</option>
                    {INDIAN_BANKS.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  {errors.bankCode && touched.bankCode && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      {errors.bankCode}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* EMI Options */}
          {selectedMethod === 'emi' && (
            <Card className="p-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Choose EMI Tenure</h4>

                <div className="space-y-3">
                  {EMI_TENURES.map((tenure) => {
                    const emiAmount = calculateEMI(amount, tenure.months, tenure.interestRate);
                    const totalAmount = emiAmount * tenure.months;
                    const isSelected = formData.emiTenure === tenure.months;

                    return (
                      <button
                        key={tenure.months}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            emiTenure: tenure.months,
                            emiInterestRate: tenure.interestRate,
                          }));
                        }}
                        className={cn(
                          'w-full p-4 rounded-lg border-2 transition-all text-left',
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {tenure.description}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              ₹{emiAmount.toLocaleString('en-IN')}/month
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Total: ₹{totalAmount.toLocaleString('en-IN')} 
                              (Interest: {tenure.interestRate}% p.a.)
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Cash on Delivery */}
          {selectedMethod === 'cash_on_delivery' && (
            <Card className="p-6">
              <div className="flex items-start gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <InformationCircleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Cash on Delivery
                  </h4>
                  <p className="text-sm text-gray-700">
                    Pay in cash when you receive your order. Please keep exact change ready.
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Note:</strong> COD may have additional charges and is subject to order value limits.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Form Actions */}
      <div className="flex items-center gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
          >
            Back
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Processing...
            </>
          ) : (
            <>
              <LockClosedIcon className="h-4 w-4 mr-2" />
              Pay ₹{amount.toLocaleString('en-IN')}
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
};

export default PaymentForm;
