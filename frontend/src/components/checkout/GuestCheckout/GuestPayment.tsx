'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  LockClosedIcon,
  QrCodeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

type PaymentMethodType = 'card' | 'upi' | 'netbanking' | 'wallet' | 'emi' | 'cod';

interface CardPaymentData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

interface UPIPaymentData {
  upiId: string;
}

interface NetBankingPaymentData {
  bankCode: string;
}

interface WalletPaymentData {
  walletProvider: string;
}

interface EMIPaymentData {
  bankCode: string;
  tenure: number;
}

export interface PaymentFormData {
  paymentMethod: PaymentMethodType;
  cardData?: CardPaymentData;
  upiData?: UPIPaymentData;
  netBankingData?: NetBankingPaymentData;
  walletData?: WalletPaymentData;
  emiData?: EMIPaymentData;
  savePaymentMethod?: boolean;
}

interface GuestPaymentProps {
  initialData?: Partial<PaymentFormData>;
  orderTotal: number;
  onSubmit: (data: PaymentFormData) => void;
  onBack?: () => void;
  allowAccountCreation?: boolean;
}

interface FormErrors {
  cardNumber?: string;
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  upiId?: string;
  bankCode?: string;
  walletProvider?: string;
  tenure?: string;
}

const paymentMethods = [
  { id: 'card' as PaymentMethodType, name: 'Credit/Debit Card', icon: CreditCardIcon },
  { id: 'upi' as PaymentMethodType, name: 'UPI', icon: QrCodeIcon },
  { id: 'netbanking' as PaymentMethodType, name: 'Net Banking', icon: BuildingLibraryIcon },
  { id: 'wallet' as PaymentMethodType, name: 'Digital Wallet', icon: DevicePhoneMobileIcon },
  { id: 'emi' as PaymentMethodType, name: 'EMI', icon: CalendarIcon },
  { id: 'cod' as PaymentMethodType, name: 'Cash on Delivery', icon: BanknotesIcon },
];

const banks = [
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

const wallets = [
  { code: 'PAYTM', name: 'Paytm' },
  { code: 'PHONEPE', name: 'PhonePe' },
  { code: 'GOOGLEPAY', name: 'Google Pay' },
  { code: 'AMAZONPAY', name: 'Amazon Pay' },
  { code: 'FREECHARGE', name: 'FreeCharge' },
  { code: 'MOBIKWIK', name: 'MobiKwik' },
];

const emiTenures = [
  { months: 3, interestRate: 12 },
  { months: 6, interestRate: 13 },
  { months: 9, interestRate: 14 },
  { months: 12, interestRate: 15 },
  { months: 18, interestRate: 16 },
  { months: 24, interestRate: 17 },
];

export const GuestPayment: React.FC<GuestPaymentProps> = ({
  initialData,
  orderTotal,
  onSubmit,
  onBack,
  allowAccountCreation = true,
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethod: initialData?.paymentMethod || 'card',
    cardData: initialData?.cardData || {
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    },
    upiData: initialData?.upiData || { upiId: '' },
    netBankingData: initialData?.netBankingData || { bankCode: '' },
    walletData: initialData?.walletData || { walletProvider: '' },
    emiData: initialData?.emiData || { bankCode: '', tenure: 3 },
    savePaymentMethod: initialData?.savePaymentMethod || false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [cardBrand, setCardBrand] = useState<string>('');

  // Load from session storage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem('guestCheckout_payment');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Don't restore sensitive payment data for security
        setFormData((prev) => ({
          ...prev,
          paymentMethod: parsed.paymentMethod || 'card',
        }));
      } catch (error) {
        console.error('Failed to load payment data from session storage:', error);
      }
    }
  }, []);

  // Save to session storage on change (excluding sensitive data)
  useEffect(() => {
    const dataToSave = {
      paymentMethod: formData.paymentMethod,
      // Don't save sensitive payment details
    };
    sessionStorage.setItem('guestCheckout_payment', JSON.stringify(dataToSave));
  }, [formData.paymentMethod]);

  // Detect card brand from number
  useEffect(() => {
    if (formData.cardData?.cardNumber) {
      const number = formData.cardData.cardNumber.replace(/\s/g, '');
      if (/^4/.test(number)) {
        setCardBrand('Visa');
      } else if (/^5[1-5]/.test(number)) {
        setCardBrand('Mastercard');
      } else if (/^3[47]/.test(number)) {
        setCardBrand('American Express');
      } else if (/^6(?:011|5)/.test(number)) {
        setCardBrand('Discover');
      } else if (/^60/.test(number)) {
        setCardBrand('RuPay');
      } else {
        setCardBrand('');
      }
    } else {
      setCardBrand('');
    }
  }, [formData.cardData?.cardNumber]);

  // Validation functions
  const validateCardNumber = (cardNumber: string): boolean => {
    // Remove spaces
    const number = cardNumber.replace(/\s/g, '');
    
    // Check if it's numeric and has valid length
    if (!/^\d{13,19}$/.test(number)) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i), 10);
      
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

  const validateCardholderName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    return name.length >= 3 && name.length <= 50 && nameRegex.test(name);
  };

  const validateExpiryMonth = (month: string): boolean => {
    const monthNum = parseInt(month, 10);
    return monthNum >= 1 && monthNum <= 12;
  };

  const validateExpiryYear = (year: string): boolean => {
    const currentYear = new Date().getFullYear() % 100;
    const yearNum = parseInt(year, 10);
    return yearNum >= currentYear && yearNum <= currentYear + 20;
  };

  const validateExpiry = (month: string, year: string): boolean => {
    if (!validateExpiryMonth(month) || !validateExpiryYear(year)) {
      return false;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (yearNum === currentYear) {
      return monthNum >= currentMonth;
    }
    
    return yearNum > currentYear;
  };

  const validateCVV = (cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv);
  };

  const validateUPIId = (upiId: string): boolean => {
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    return upiRegex.test(upiId);
  };

  const validateField = (name: string, value: string | number | boolean): void => {
    const newErrors: FormErrors = { ...errors };

    switch (name) {
      case 'cardNumber':
        if (typeof value === 'string') {
          if (!value || !validateCardNumber(value)) {
            newErrors.cardNumber = 'Please enter a valid card number';
          } else {
            delete newErrors.cardNumber;
          }
        }
        break;

      case 'cardholderName':
        if (typeof value === 'string') {
          if (!value || !validateCardholderName(value)) {
            newErrors.cardholderName = 'Name must be 3-50 characters and contain only letters';
          } else {
            delete newErrors.cardholderName;
          }
        }
        break;

      case 'expiryMonth':
        if (typeof value === 'string') {
          if (!value || !validateExpiryMonth(value)) {
            newErrors.expiryMonth = 'Invalid month';
          } else if (formData.cardData?.expiryYear) {
            if (!validateExpiry(value, formData.cardData.expiryYear)) {
              newErrors.expiryMonth = 'Card has expired';
            } else {
              delete newErrors.expiryMonth;
            }
          } else {
            delete newErrors.expiryMonth;
          }
        }
        break;

      case 'expiryYear':
        if (typeof value === 'string') {
          if (!value || !validateExpiryYear(value)) {
            newErrors.expiryYear = 'Invalid year';
          } else if (formData.cardData?.expiryMonth) {
            if (!validateExpiry(formData.cardData.expiryMonth, value)) {
              newErrors.expiryYear = 'Card has expired';
            } else {
              delete newErrors.expiryYear;
            }
          } else {
            delete newErrors.expiryYear;
          }
        }
        break;

      case 'cvv':
        if (typeof value === 'string') {
          if (!value || !validateCVV(value)) {
            newErrors.cvv = 'CVV must be 3-4 digits';
          } else {
            delete newErrors.cvv;
          }
        }
        break;

      case 'upiId':
        if (typeof value === 'string') {
          if (!value || !validateUPIId(value)) {
            newErrors.upiId = 'Please enter a valid UPI ID (e.g., user@paytm)';
          } else {
            delete newErrors.upiId;
          }
        }
        break;

      case 'bankCode':
        if (!value) {
          newErrors.bankCode = 'Please select a bank';
        } else {
          delete newErrors.bankCode;
        }
        break;

      case 'walletProvider':
        if (!value) {
          newErrors.walletProvider = 'Please select a wallet';
        } else {
          delete newErrors.walletProvider;
        }
        break;

      case 'tenure':
        if (!value) {
          newErrors.tenure = 'Please select EMI tenure';
        } else {
          delete newErrors.tenure;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    switch (formData.paymentMethod) {
      case 'card':
        if (!formData.cardData?.cardNumber || !validateCardNumber(formData.cardData.cardNumber)) {
          newErrors.cardNumber = 'Valid card number is required';
        }
        if (!formData.cardData?.cardholderName || !validateCardholderName(formData.cardData.cardholderName)) {
          newErrors.cardholderName = 'Valid cardholder name is required';
        }
        if (!formData.cardData?.expiryMonth || !validateExpiryMonth(formData.cardData.expiryMonth)) {
          newErrors.expiryMonth = 'Valid expiry month is required';
        }
        if (!formData.cardData?.expiryYear || !validateExpiryYear(formData.cardData.expiryYear)) {
          newErrors.expiryYear = 'Valid expiry year is required';
        }
        if (formData.cardData?.expiryMonth && formData.cardData?.expiryYear) {
          if (!validateExpiry(formData.cardData.expiryMonth, formData.cardData.expiryYear)) {
            newErrors.expiryMonth = 'Card has expired';
            newErrors.expiryYear = 'Card has expired';
          }
        }
        if (!formData.cardData?.cvv || !validateCVV(formData.cardData.cvv)) {
          newErrors.cvv = 'Valid CVV is required';
        }
        break;

      case 'upi':
        if (!formData.upiData?.upiId || !validateUPIId(formData.upiData.upiId)) {
          newErrors.upiId = 'Valid UPI ID is required';
        }
        break;

      case 'netbanking':
        if (!formData.netBankingData?.bankCode) {
          newErrors.bankCode = 'Please select a bank';
        }
        break;

      case 'wallet':
        if (!formData.walletData?.walletProvider) {
          newErrors.walletProvider = 'Please select a wallet';
        }
        break;

      case 'emi':
        if (!formData.emiData?.bankCode) {
          newErrors.bankCode = 'Please select a bank';
        }
        if (!formData.emiData?.tenure) {
          newErrors.tenure = 'Please select EMI tenure';
        }
        break;

      case 'cod':
        // No validation needed for COD
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentMethodChange = (method: PaymentMethodType) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
    setErrors({});
    setTouched({});
  };

  const handleCardDataChange = (field: keyof CardPaymentData, value: string) => {
    // Format card number with spaces
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    setFormData((prev) => ({
      ...prev,
      cardData: {
        ...prev.cardData!,
        [field]: value,
      },
    }));

    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleUPIDataChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      upiData: { upiId: value },
    }));

    if (touched.upiId) {
      validateField('upiId', value);
    }
  };

  const handleNetBankingDataChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      netBankingData: { bankCode: value },
    }));

    if (touched.bankCode) {
      validateField('bankCode', value);
    }
  };

  const handleWalletDataChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      walletData: { walletProvider: value },
    }));

    if (touched.walletProvider) {
      validateField('walletProvider', value);
    }
  };

  const handleEMIDataChange = (field: keyof EMIPaymentData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      emiData: {
        ...prev.emiData!,
        [field]: value,
      },
    }));

    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    switch (formData.paymentMethod) {
      case 'card':
        if (formData.cardData) {
          validateField(field, formData.cardData[field as keyof CardPaymentData] || '');
        }
        break;
      case 'upi':
        if (field === 'upiId' && formData.upiData) {
          validateField(field, formData.upiData.upiId);
        }
        break;
      case 'netbanking':
        if (field === 'bankCode' && formData.netBankingData) {
          validateField(field, formData.netBankingData.bankCode);
        }
        break;
      case 'wallet':
        if (field === 'walletProvider' && formData.walletData) {
          validateField(field, formData.walletData.walletProvider);
        }
        break;
      case 'emi':
        if (formData.emiData) {
          validateField(field, formData.emiData[field as keyof EMIPaymentData] || '');
        }
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    // Mark all relevant fields as touched
    const fieldsToTouch: Record<string, boolean> = {};
    switch (formData.paymentMethod) {
      case 'card':
        fieldsToTouch.cardNumber = true;
        fieldsToTouch.cardholderName = true;
        fieldsToTouch.expiryMonth = true;
        fieldsToTouch.expiryYear = true;
        fieldsToTouch.cvv = true;
        break;
      case 'upi':
        fieldsToTouch.upiId = true;
        break;
      case 'netbanking':
        fieldsToTouch.bankCode = true;
        break;
      case 'wallet':
        fieldsToTouch.walletProvider = true;
        break;
      case 'emi':
        fieldsToTouch.bankCode = true;
        fieldsToTouch.tenure = true;
        break;
    }
    setTouched(fieldsToTouch);

    if (validateForm()) {
      try {
        await onSubmit(formData);
        toast.success('Payment information saved!');
      } catch {
        toast.error('Failed to save payment information. Please try again.');
      }
    } else {
      toast.error('Please fix all errors before continuing');
    }

    setIsValidating(false);
  };

  const calculateEMI = (tenure: number): number => {
    const emiOption = emiTenures.find((t) => t.months === tenure);
    if (!emiOption) return 0;

    const principal = orderTotal;
    const rate = emiOption.interestRate / 100 / 12;
    const n = tenure;

    const emi = (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
    return Math.round(emi);
  };

  const isFieldValid = (field: string): boolean => {
    return touched[field] && !errors[field as keyof FormErrors];
  };

  const isFieldInvalid = (field: string): boolean => {
    return touched[field] && !!errors[field as keyof FormErrors];
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <Card className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCardIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                  <Badge variant="secondary" size="sm">Secure</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Choose your preferred payment method
                </p>
              </div>
            </div>
            <LockClosedIcon className="h-6 w-6 text-green-600" />
          </div>

          {/* Payment Method Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <motion.button
                  key={method.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePaymentMethodChange(method.id)}
                  className={cn(
                    'relative p-4 border-2 rounded-lg transition-all text-center',
                    formData.paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-6 w-6 mx-auto mb-2',
                      formData.paymentMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs font-medium',
                      formData.paymentMethod === method.id ? 'text-blue-900' : 'text-gray-700'
                    )}
                  >
                    {method.name}
                  </span>
                  {formData.paymentMethod === method.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Payment Forms */}
          <AnimatePresence mode="wait">
            {/* Card Payment */}
            {formData.paymentMethod === 'card' && (
              <motion.div
                key="card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                  <span>Your card details are encrypted and secure</span>
                </div>

                {/* Card Number */}
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      type="text"
                      value={formData.cardData?.cardNumber}
                      onChange={(e) => handleCardDataChange('cardNumber', e.target.value)}
                      onBlur={() => handleBlur('cardNumber')}
                      className={cn(
                        'pr-20',
                        isFieldValid('cardNumber') && 'border-green-500',
                        isFieldInvalid('cardNumber') && 'border-red-500'
                      )}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2 pointer-events-none">
                      {cardBrand && (
                        <Badge variant="secondary" size="sm">
                          {cardBrand}
                        </Badge>
                      )}
                      {isFieldValid('cardNumber') && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      )}
                      {isFieldInvalid('cardNumber') && (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  {errors.cardNumber && touched.cardNumber && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    >
                      <ExclamationCircleIcon className="h-4 w-4" />
                      {errors.cardNumber}
                    </motion.p>
                  )}
                </div>

                {/* Cardholder Name */}
                <div>
                  <label
                    htmlFor="cardholderName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Cardholder Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="cardholderName"
                      type="text"
                      value={formData.cardData?.cardholderName}
                      onChange={(e) => handleCardDataChange('cardholderName', e.target.value.toUpperCase())}
                      onBlur={() => handleBlur('cardholderName')}
                      className={cn(
                        'pr-10 uppercase',
                        isFieldValid('cardholderName') && 'border-green-500',
                        isFieldInvalid('cardholderName') && 'border-red-500'
                      )}
                      placeholder="JOHN DOE"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {isFieldValid('cardholderName') && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      )}
                      {isFieldInvalid('cardholderName') && (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  {errors.cardholderName && touched.cardholderName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    >
                      <ExclamationCircleIcon className="h-4 w-4" />
                      {errors.cardholderName}
                    </motion.p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Name as it appears on the card</p>
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="expiryMonth"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Month <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="expiryMonth"
                      type="text"
                      value={formData.cardData?.expiryMonth}
                      onChange={(e) => handleCardDataChange('expiryMonth', e.target.value)}
                      onBlur={() => handleBlur('expiryMonth')}
                      className={cn(
                        isFieldValid('expiryMonth') && 'border-green-500',
                        isFieldInvalid('expiryMonth') && 'border-red-500'
                      )}
                      placeholder="MM"
                      maxLength={2}
                    />
                    {errors.expiryMonth && touched.expiryMonth && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-red-600"
                      >
                        {errors.expiryMonth}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="expiryYear"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Year <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="expiryYear"
                      type="text"
                      value={formData.cardData?.expiryYear}
                      onChange={(e) => handleCardDataChange('expiryYear', e.target.value)}
                      onBlur={() => handleBlur('expiryYear')}
                      className={cn(
                        isFieldValid('expiryYear') && 'border-green-500',
                        isFieldInvalid('expiryYear') && 'border-red-500'
                      )}
                      placeholder="YY"
                      maxLength={2}
                    />
                    {errors.expiryYear && touched.expiryYear && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-red-600"
                      >
                        {errors.expiryYear}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="cvv"
                      type="password"
                      value={formData.cardData?.cvv}
                      onChange={(e) => handleCardDataChange('cvv', e.target.value)}
                      onBlur={() => handleBlur('cvv')}
                      className={cn(
                        isFieldValid('cvv') && 'border-green-500',
                        isFieldInvalid('cvv') && 'border-red-500'
                      )}
                      placeholder="123"
                      maxLength={4}
                    />
                    {errors.cvv && touched.cvv && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-red-600"
                      >
                        {errors.cvv}
                      </motion.p>
                    )}
                  </div>
                </div>

                {allowAccountCreation && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={formData.savePaymentMethod}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, savePaymentMethod: e.target.checked }))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="saveCard" className="text-sm text-gray-700">
                      Save this card for future purchases (requires account)
                    </label>
                  </div>
                )}
              </motion.div>
            )}

            {/* UPI Payment */}
            {formData.paymentMethod === 'upi' && (
              <motion.div
                key="upi"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <QrCodeIcon className="h-6 w-6 text-purple-600" />
                  <div className="text-sm">
                    <p className="font-medium text-purple-900">Quick & Easy UPI Payment</p>
                    <p className="text-purple-700">Enter your UPI ID for instant payment</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
                    UPI ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="upiId"
                      type="text"
                      value={formData.upiData?.upiId}
                      onChange={(e) => handleUPIDataChange(e.target.value)}
                      onBlur={() => handleBlur('upiId')}
                      className={cn(
                        'pr-10',
                        isFieldValid('upiId') && 'border-green-500',
                        isFieldInvalid('upiId') && 'border-red-500'
                      )}
                      placeholder="yourname@paytm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {isFieldValid('upiId') && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      )}
                      {isFieldInvalid('upiId') && <XCircleIcon className="h-5 w-5 text-red-500" />}
                    </div>
                  </div>
                  {errors.upiId && touched.upiId && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    >
                      <ExclamationCircleIcon className="h-4 w-4" />
                      {errors.upiId}
                    </motion.p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                    <InformationCircleIcon className="h-4 w-4" />
                    Supported: Paytm, PhonePe, Google Pay, BHIM, and more
                  </p>
                </div>
              </motion.div>
            )}

            {/* Net Banking */}
            {formData.paymentMethod === 'netbanking' && (
              <motion.div
                key="netbanking"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Your Bank <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="bank"
                    value={formData.netBankingData?.bankCode}
                    onChange={(e) => handleNetBankingDataChange(e.target.value)}
                    onBlur={() => handleBlur('bankCode')}
                    className={cn(
                      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                      isFieldValid('bankCode') && 'border-green-500',
                      isFieldInvalid('bankCode') && 'border-red-500'
                    )}
                  >
                    <option value="">Choose your bank</option>
                    {banks.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  {errors.bankCode && touched.bankCode && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    >
                      <ExclamationCircleIcon className="h-4 w-4" />
                      {errors.bankCode}
                    </motion.p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    You will be redirected to your bank&apos;s secure login page
                  </p>
                </div>
              </motion.div>
            )}

            {/* Digital Wallet */}
            {formData.paymentMethod === 'wallet' && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {wallets.map((wallet) => (
                    <motion.button
                      key={wallet.code}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleWalletDataChange(wallet.code)}
                      className={cn(
                        'relative p-4 border-2 rounded-lg transition-all',
                        formData.walletData?.walletProvider === wallet.code
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <span
                        className={cn(
                          'text-sm font-medium',
                          formData.walletData?.walletProvider === wallet.code
                            ? 'text-blue-900'
                            : 'text-gray-700'
                        )}
                      >
                        {wallet.name}
                      </span>
                      {formData.walletData?.walletProvider === wallet.code && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2"
                        >
                          <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
                {errors.walletProvider && touched.walletProvider && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600 flex items-center gap-1"
                  >
                    <ExclamationCircleIcon className="h-4 w-4" />
                    {errors.walletProvider}
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* EMI */}
            {formData.paymentMethod === 'emi' && (
              <motion.div
                key="emi"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="emiBank" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Your Bank <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="emiBank"
                    value={formData.emiData?.bankCode}
                    onChange={(e) => handleEMIDataChange('bankCode', e.target.value)}
                    onBlur={() => handleBlur('bankCode')}
                    className={cn(
                      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                      isFieldValid('bankCode') && 'border-green-500',
                      isFieldInvalid('bankCode') && 'border-red-500'
                    )}
                  >
                    <option value="">Choose your bank</option>
                    {banks.slice(0, 5).map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  {errors.bankCode && touched.bankCode && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 flex items-center gap-1"
                    >
                      <ExclamationCircleIcon className="h-4 w-4" />
                      {errors.bankCode}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose EMI Tenure <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {emiTenures.map((tenure) => {
                      const emiAmount = calculateEMI(tenure.months);
                      return (
                        <motion.button
                          key={tenure.months}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleEMIDataChange('tenure', tenure.months)}
                          className={cn(
                            'relative p-4 border-2 rounded-lg transition-all text-left',
                            formData.emiData?.tenure === tenure.months
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {tenure.months} Months
                            </span>
                            <span className="text-xs text-gray-600">
                              ₹{emiAmount.toLocaleString('en-IN')}/month
                            </span>
                            <span className="text-xs text-gray-500">
                              {tenure.interestRate}% interest
                            </span>
                          </div>
                          {formData.emiData?.tenure === tenure.months && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2"
                            >
                              <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                  {errors.tenure && touched.tenure && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 flex items-center gap-1"
                    >
                      <ExclamationCircleIcon className="h-4 w-4" />
                      {errors.tenure}
                    </motion.p>
                  )}
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-900">
                    <strong>Total Amount:</strong> ₹
                    {formData.emiData?.tenure
                      ? (calculateEMI(formData.emiData.tenure) * formData.emiData.tenure).toLocaleString('en-IN')
                      : '0'}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Includes interest charges. Subject to bank approval.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Cash on Delivery */}
            {formData.paymentMethod === 'cod' && (
              <motion.div
                key="cod"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                  <BanknotesIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-green-900 mb-2">Cash on Delivery</h4>
                  <p className="text-sm text-green-700 mb-4">
                    Pay with cash when your order is delivered to your doorstep
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Amount to pay: ₹{orderTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Important Notes:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li>Please keep exact change ready</li>
                        <li>COD may not be available for all pin codes</li>
                        <li>Additional COD charges may apply</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Badge */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <LockClosedIcon className="h-5 w-5 text-green-600" />
                <span>PCI DSS Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span>100% Secure</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        {onBack ? (
          <Button type="button" variant="outline" onClick={onBack} className="flex-1 md:flex-none">
            Back
          </Button>
        ) : (
          <div />
        )}

        <Button
          type="submit"
          variant="default"
          disabled={isValidating}
          className="flex-1 md:flex-none min-w-[200px]"
        >
          {isValidating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            'Continue to Review'
          )}
        </Button>
      </div>
    </motion.form>
  );
};
