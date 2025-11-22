'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { PaymentMethodType, PaymentCard, BankAccount, DigitalWallet } from '@/types/payment.types';
import type { Price } from '@/types/common.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PaymentFormProps {
  /**
   * Payment method type
   */
  paymentType: PaymentMethodType;

  /**
   * Order amount
   */
  amount: Price;

  /**
   * Pre-filled payment details (for edit mode)
   */
  initialData?: PaymentFormData;

  /**
   * Callback when form is submitted
   */
  onSubmit: (data: PaymentFormData) => void | Promise<void>;

  /**
   * Callback when form is cancelled
   */
  onCancel?: () => void;

  /**
   * Show save payment method option
   */
  showSaveOption?: boolean;

  /**
   * Show security badges
   */
  showSecurityInfo?: boolean;

  /**
   * Form variant
   * - default: Full form
   * - compact: Minimal form
   * - inline: Inline form
   */
  variant?: 'default' | 'compact' | 'inline';

  /**
   * Submit button text
   */
  submitText?: string;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Payment form data
 */
export interface PaymentFormData {
  paymentType: PaymentMethodType;
  cardDetails?: PaymentCard;
  bankDetails?: BankAccount;
  walletDetails?: DigitalWallet;
  upiId?: string;
  savePaymentMethod?: boolean;
  nickname?: string;
}

/**
 * Form field errors
 */
interface FormErrors {
  [key: string]: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format card number with spaces
 */
const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ').substring(0, 19); // Max 16 digits + 3 spaces
};

/**
 * Format expiry date
 */
const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
  }
  return cleaned;
};

/**
 * Validate card number using Luhn algorithm
 */
const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Detect card brand from number
 */
const detectCardBrand = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');

  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
  if (/^35/.test(cleaned)) return 'JCB';
  if (/^(?:2131|1800|30[0-5])/.test(cleaned)) return 'Diners Club';

  return 'Unknown';
};

/**
 * Validate expiry date
 */
const validateExpiry = (expiry: string): boolean => {
  const [month, year] = expiry.split('/').map((v) => parseInt(v, 10));
  if (!month || !year) return false;
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

/**
 * Validate CVV
 */
const validateCVV = (cvv: string, cardBrand: string): boolean => {
  const cleaned = cvv.replace(/\D/g, '');
  const expectedLength = cardBrand === 'American Express' ? 4 : 3;
  return cleaned.length === expectedLength;
};

/**
 * Validate IFSC code
 */
const validateIFSC = (ifsc: string): boolean => {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
};

/**
 * Validate UPI ID
 */
const validateUPI = (upi: string): boolean => {
  return /^[\w.-]+@[\w.-]+$/.test(upi);
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * PaymentForm Component
 * 
 * Comprehensive payment form with field validation and security features.
 * Supports multiple payment methods including cards, bank accounts, UPI, and wallets.
 * Features:
 * - Multiple payment method types
 * - Real-time validation
 * - Card number formatting
 * - Luhn algorithm validation
 * - Expiry date validation
 * - Security indicators
 * - Save payment method option
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <PaymentForm
 *   paymentType="credit_card"
 *   amount={{ amount: 15000, currency: 'INR' }}
 *   onSubmit={(data) => processPayment(data)}
 *   showSaveOption={true}
 * />
 * ```
 */
export const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentType,
  amount,
  initialData,
  onSubmit,
  onCancel,
  showSaveOption = true,
  showSecurityInfo = true,
  variant = 'default',
  submitText = 'Pay Now',
  isLoading = false,
  className,
}) => {
  // Form state
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentType,
    savePaymentMethod: false,
    ...initialData,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Card-specific state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardBrand, setCardBrand] = useState('Unknown');

  // Bank-specific state
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIFSCCode] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');

  // UPI state
  const [upiId, setUpiId] = useState('');

  // Wallet state
  const [walletPhone, setWalletPhone] = useState('');
  const [walletEmail, setWalletEmail] = useState('');

  // Load initial data
  useEffect(() => {
    if (initialData?.cardDetails) {
      setCardHolder(initialData.cardDetails.holderName || '');
      if (initialData.cardDetails.last4) {
        setCardNumber(`**** **** **** ${initialData.cardDetails.last4}`);
      }
      if (initialData.cardDetails.expiryMonth && initialData.cardDetails.expiryYear) {
        setCardExpiry(
          `${String(initialData.cardDetails.expiryMonth).padStart(2, '0')}/${String(
            initialData.cardDetails.expiryYear % 100
          ).padStart(2, '0')}`
        );
      }
    }
    if (initialData?.bankDetails) {
      setAccountHolder(initialData.bankDetails.accountHolderName || '');
      setBankName(initialData.bankDetails.bankName || '');
      setIFSCCode(initialData.bankDetails.ifscCode || '');
      if (initialData.bankDetails.accountNumber) {
        setAccountNumber(`******${initialData.bankDetails.accountNumber.slice(-4)}`);
      }
    }
    if (initialData?.upiId) {
      setUpiId(initialData.upiId);
    }
    if (initialData?.walletDetails) {
      setWalletPhone(initialData.walletDetails.phoneNumber || '');
      setWalletEmail(initialData.walletDetails.email || '');
    }
  }, [initialData]);

  // Detect card brand
  useEffect(() => {
    if (paymentType === 'credit_card' || paymentType === 'debit_card') {
      const brand = detectCardBrand(cardNumber);
      setCardBrand(brand);
    }
  }, [cardNumber, paymentType]);

  // Handle field blur
  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  };

  // Validate individual field
  const validateField = (fieldName: string): boolean => {
    const newErrors: FormErrors = { ...errors };

    switch (fieldName) {
      case 'cardNumber':
        if (!cardNumber.trim()) {
          newErrors.cardNumber = 'Card number is required';
        } else if (!validateCardNumber(cardNumber)) {
          newErrors.cardNumber = 'Invalid card number';
        } else {
          delete newErrors.cardNumber;
        }
        break;

      case 'cardExpiry':
        if (!cardExpiry.trim()) {
          newErrors.cardExpiry = 'Expiry date is required';
        } else if (!validateExpiry(cardExpiry)) {
          newErrors.cardExpiry = 'Invalid or expired date';
        } else {
          delete newErrors.cardExpiry;
        }
        break;

      case 'cardCVV':
        if (!cardCVV.trim()) {
          newErrors.cardCVV = 'CVV is required';
        } else if (!validateCVV(cardCVV, cardBrand)) {
          newErrors.cardCVV = `CVV must be ${cardBrand === 'American Express' ? '4' : '3'} digits`;
        } else {
          delete newErrors.cardCVV;
        }
        break;

      case 'cardHolder':
        if (!cardHolder.trim()) {
          newErrors.cardHolder = 'Cardholder name is required';
        } else if (cardHolder.trim().length < 3) {
          newErrors.cardHolder = 'Name must be at least 3 characters';
        } else {
          delete newErrors.cardHolder;
        }
        break;

      case 'accountNumber':
        if (!accountNumber.trim()) {
          newErrors.accountNumber = 'Account number is required';
        } else if (!/^\d{9,18}$/.test(accountNumber.replace(/\D/g, ''))) {
          newErrors.accountNumber = 'Invalid account number';
        } else {
          delete newErrors.accountNumber;
        }
        break;

      case 'ifscCode':
        if (!ifscCode.trim()) {
          newErrors.ifscCode = 'IFSC code is required';
        } else if (!validateIFSC(ifscCode.toUpperCase())) {
          newErrors.ifscCode = 'Invalid IFSC code';
        } else {
          delete newErrors.ifscCode;
        }
        break;

      case 'accountHolder':
        if (!accountHolder.trim()) {
          newErrors.accountHolder = 'Account holder name is required';
        } else if (accountHolder.trim().length < 3) {
          newErrors.accountHolder = 'Name must be at least 3 characters';
        } else {
          delete newErrors.accountHolder;
        }
        break;

      case 'upiId':
        if (!upiId.trim()) {
          newErrors.upiId = 'UPI ID is required';
        } else if (!validateUPI(upiId)) {
          newErrors.upiId = 'Invalid UPI ID (e.g., user@upi)';
        } else {
          delete newErrors.upiId;
        }
        break;

      case 'walletPhone':
        if (!walletPhone.trim()) {
          newErrors.walletPhone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(walletPhone.replace(/\D/g, ''))) {
          newErrors.walletPhone = 'Invalid phone number';
        } else {
          delete newErrors.walletPhone;
        }
        break;

      case 'walletEmail':
        if (walletEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(walletEmail)) {
          newErrors.walletEmail = 'Invalid email address';
        } else {
          delete newErrors.walletEmail;
        }
        break;
    }

    setErrors(newErrors);
    return !newErrors[fieldName];
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const fieldsToValidate: string[] = [];

    if (paymentType === 'credit_card' || paymentType === 'debit_card') {
      fieldsToValidate.push('cardNumber', 'cardExpiry', 'cardCVV', 'cardHolder');
    } else if (paymentType === 'net_banking' || paymentType === 'bank_transfer') {
      fieldsToValidate.push('accountNumber', 'ifscCode', 'accountHolder');
    } else if (paymentType === 'upi') {
      fieldsToValidate.push('upiId');
    } else if (paymentType === 'digital_wallet') {
      fieldsToValidate.push('walletPhone');
    }

    const results = fieldsToValidate.map((field) => validateField(field));
    return results.every((result) => result);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = [
      'cardNumber',
      'cardExpiry',
      'cardCVV',
      'cardHolder',
      'accountNumber',
      'ifscCode',
      'accountHolder',
      'upiId',
      'walletPhone',
      'walletEmail',
    ];
    const touchedFields = allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(touchedFields);

    if (!validateForm()) {
      return;
    }

    // Prepare form data
    const submitData: PaymentFormData = {
      paymentType,
      savePaymentMethod: formData.savePaymentMethod,
      nickname: formData.nickname,
    };

    if (paymentType === 'credit_card' || paymentType === 'debit_card') {
      const [expiryMonth, expiryYear] = cardExpiry.split('/').map((v) => parseInt(v, 10));
      submitData.cardDetails = {
        last4: cardNumber.replace(/\D/g, '').slice(-4),
        brand: cardBrand.toLowerCase().replace(/\s/g, '_') as 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'rupay' | 'maestro' | 'unionpay',
        expiryMonth,
        expiryYear: 2000 + expiryYear,
        holderName: cardHolder,
        cardType: paymentType === 'credit_card' ? 'credit' : 'debit',
        isInternational: false,
      };
    } else if (paymentType === 'net_banking' || paymentType === 'bank_transfer') {
      submitData.bankDetails = {
        accountNumber: accountNumber.replace(/\D/g, ''),
        ifscCode: ifscCode.toUpperCase(),
        bankName: bankName,
        accountHolderName: accountHolder,
        accountType: 'savings',
      };
    } else if (paymentType === 'upi') {
      submitData.upiId = upiId;
    } else if (paymentType === 'digital_wallet') {
      submitData.walletDetails = {
        walletId: `wallet_${Date.now()}`,
        walletProvider: 'Generic',
        phoneNumber: walletPhone.replace(/\D/g, ''),
        email: walletEmail || undefined,
      };
    }

    await onSubmit(submitData);
  };

  // Render card form
  const renderCardForm = () => (
    <div className="space-y-4">
      {/* Card Number */}
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Card Number
        </label>
        <div className="relative">
          <input
            id="cardNumber"
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            onBlur={() => handleBlur('cardNumber')}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              errors.cardNumber && touched.cardNumber ? 'border-red-500' : 'border-gray-300'
            )}
            disabled={isLoading}
          />
          {cardBrand !== 'Unknown' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Badge variant="outline">{cardBrand}</Badge>
            </div>
          )}
        </div>
        {errors.cardNumber && touched.cardNumber && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <ExclamationCircleIcon className="h-4 w-4" />
            {errors.cardNumber}
          </p>
        )}
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date
          </label>
          <input
            id="cardExpiry"
            type="text"
            value={cardExpiry}
            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
            onBlur={() => handleBlur('cardExpiry')}
            placeholder="MM/YY"
            maxLength={5}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              errors.cardExpiry && touched.cardExpiry ? 'border-red-500' : 'border-gray-300'
            )}
            disabled={isLoading}
          />
          {errors.cardExpiry && touched.cardExpiry && (
            <p className="mt-1 text-sm text-red-600">{errors.cardExpiry}</p>
          )}
        </div>

        <div>
          <label htmlFor="cardCVV" className="block text-sm font-medium text-gray-700 mb-1">
            CVV
          </label>
          <input
            id="cardCVV"
            type="password"
            value={cardCVV}
            onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').substring(0, 4))}
            onBlur={() => handleBlur('cardCVV')}
            placeholder="123"
            maxLength={4}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              errors.cardCVV && touched.cardCVV ? 'border-red-500' : 'border-gray-300'
            )}
            disabled={isLoading}
          />
          {errors.cardCVV && touched.cardCVV && (
            <p className="mt-1 text-sm text-red-600">{errors.cardCVV}</p>
          )}
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
          Cardholder Name
        </label>
        <input
          id="cardHolder"
          type="text"
          value={cardHolder}
          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
          onBlur={() => handleBlur('cardHolder')}
          placeholder="JOHN DOE"
          className={cn(
            'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            errors.cardHolder && touched.cardHolder ? 'border-red-500' : 'border-gray-300'
          )}
          disabled={isLoading}
        />
        {errors.cardHolder && touched.cardHolder && (
          <p className="mt-1 text-sm text-red-600">{errors.cardHolder}</p>
        )}
      </div>
    </div>
  );

  // Render bank form
  const renderBankForm = () => (
    <div className="space-y-4">
      {/* Account Number */}
      <div>
        <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Account Number
        </label>
        <input
          id="accountNumber"
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
          onBlur={() => handleBlur('accountNumber')}
          placeholder="Enter account number"
          maxLength={18}
          className={cn(
            'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            errors.accountNumber && touched.accountNumber ? 'border-red-500' : 'border-gray-300'
          )}
          disabled={isLoading}
        />
        {errors.accountNumber && touched.accountNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
        )}
      </div>

      {/* IFSC Code */}
      <div>
        <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-1">
          IFSC Code
        </label>
        <input
          id="ifscCode"
          type="text"
          value={ifscCode}
          onChange={(e) => setIFSCCode(e.target.value.toUpperCase())}
          onBlur={() => handleBlur('ifscCode')}
          placeholder="ABCD0123456"
          maxLength={11}
          className={cn(
            'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            errors.ifscCode && touched.ifscCode ? 'border-red-500' : 'border-gray-300'
          )}
          disabled={isLoading}
        />
        {errors.ifscCode && touched.ifscCode && (
          <p className="mt-1 text-sm text-red-600">{errors.ifscCode}</p>
        )}
      </div>

      {/* Account Holder Name */}
      <div>
        <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-700 mb-1">
          Account Holder Name
        </label>
        <input
          id="accountHolder"
          type="text"
          value={accountHolder}
          onChange={(e) => setAccountHolder(e.target.value)}
          onBlur={() => handleBlur('accountHolder')}
          placeholder="Enter account holder name"
          className={cn(
            'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            errors.accountHolder && touched.accountHolder ? 'border-red-500' : 'border-gray-300'
          )}
          disabled={isLoading}
        />
        {errors.accountHolder && touched.accountHolder && (
          <p className="mt-1 text-sm text-red-600">{errors.accountHolder}</p>
        )}
      </div>

      {/* Bank Name (Optional) */}
      <div>
        <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
          Bank Name <span className="text-gray-400">(Optional)</span>
        </label>
        <input
          id="bankName"
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="Enter bank name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={isLoading}
        />
      </div>
    </div>
  );

  // Render UPI form
  const renderUPIForm = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
          UPI ID
        </label>
        <input
          id="upiId"
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value.toLowerCase())}
          onBlur={() => handleBlur('upiId')}
          placeholder="yourname@upi"
          className={cn(
            'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            errors.upiId && touched.upiId ? 'border-red-500' : 'border-gray-300'
          )}
          disabled={isLoading}
        />
        {errors.upiId && touched.upiId && (
          <p className="mt-1 text-sm text-red-600">{errors.upiId}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Enter your UPI ID (e.g., 9876543210@paytm)</p>
      </div>
    </div>
  );

  // Render wallet form
  const renderWalletForm = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="walletPhone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          id="walletPhone"
          type="tel"
          value={walletPhone}
          onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
          onBlur={() => handleBlur('walletPhone')}
          placeholder="9876543210"
          maxLength={10}
          className={cn(
            'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            errors.walletPhone && touched.walletPhone ? 'border-red-500' : 'border-gray-300'
          )}
          disabled={isLoading}
        />
        {errors.walletPhone && touched.walletPhone && (
          <p className="mt-1 text-sm text-red-600">{errors.walletPhone}</p>
        )}
      </div>

      <div>
        <label htmlFor="walletEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-gray-400">(Optional)</span>
        </label>
        <input
          id="walletEmail"
          type="email"
          value={walletEmail}
          onChange={(e) => setWalletEmail(e.target.value.toLowerCase())}
          onBlur={() => handleBlur('walletEmail')}
          placeholder="your.email@example.com"
          className={cn(
            'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            errors.walletEmail && touched.walletEmail ? 'border-red-500' : 'border-gray-300'
          )}
          disabled={isLoading}
        />
        {errors.walletEmail && touched.walletEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.walletEmail}</p>
        )}
      </div>
    </div>
  );

  // Render payment method form based on type
  const renderPaymentMethodForm = () => {
    switch (paymentType) {
      case 'credit_card':
      case 'debit_card':
        return renderCardForm();
      case 'net_banking':
      case 'bank_transfer':
        return renderBankForm();
      case 'upi':
        return renderUPIForm();
      case 'digital_wallet':
        return renderWalletForm();
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Payment method form not available
          </div>
        );
    }
  };

  const content = (
    <form onSubmit={handleSubmit}>
      <CardContent className={variant === 'inline' ? 'p-0' : undefined}>
        {/* Amount Display */}
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Amount to Pay</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(amount.amount, amount.currency)}
            </span>
          </div>
        </div>

        {/* Payment Form */}
        {renderPaymentMethodForm()}

        {/* Save Payment Method Option */}
        {showSaveOption && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.savePaymentMethod}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, savePaymentMethod: e.target.checked }))
                }
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 rounded border-gray-300"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Save this payment method
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Securely save for faster checkout next time
                </p>
              </div>
            </label>

            {formData.savePaymentMethod && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="text"
                  value={formData.nickname || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nickname: e.target.value }))}
                  placeholder="Nickname (e.g., Primary Card)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </motion.div>
            )}
          </div>
        )}

        {/* Security Info */}
        {showSecurityInfo && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Secure Payment</p>
                <p className="text-xs text-blue-600 mt-1">
                  Your payment information is encrypted and secure. We never store your full card
                  details.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className={cn('flex gap-3', variant === 'inline' ? 'px-0' : undefined)}>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          leftIcon={<LockClosedIcon className="h-4 w-4" />}
          className="flex-1"
        >
          {isLoading ? 'Processing...' : submitText}
        </Button>
      </CardFooter>
    </form>
  );

  if (variant === 'inline') {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <CreditCardIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>
            <p className="text-sm text-gray-500">Enter your payment information</p>
          </div>
        </div>
      </CardHeader>
      {content}
    </Card>
  );
};

export default PaymentForm;
