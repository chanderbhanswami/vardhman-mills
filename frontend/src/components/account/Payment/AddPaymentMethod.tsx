'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  WalletIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/lib/utils';
import { useNotification } from '@/hooks/notification/useNotification';
import type { PaymentMethod, PaymentMethodType, PaymentProvider, CardBrand } from '@/types/payment.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AddPaymentMethodProps {
  /** Show modal */
  isOpen: boolean;
  
  /** Close modal callback */
  onClose: () => void;
  
  /** Save payment method callback */
  onSave: (method: Partial<PaymentMethod>) => Promise<void>;
  
  /** Default payment method type */
  defaultType?: PaymentMethodType;
  
  /** Show set as default option */
  showSetDefault?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

export interface PaymentFormData {
  type: PaymentMethodType;
  provider: PaymentProvider;
  nickname: string;
  
  // Card details
  cardNumber: string;
  cardHolderName: string;
  cardExpiryMonth: string;
  cardExpiryYear: string;
  cardCvv: string;
  cardBrand?: CardBrand;
  
  // Bank details
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  bankName: string;
  accountType: 'savings' | 'current';
  
  // UPI details
  upiId: string;
  
  // Wallet details
  walletId: string;
  walletPhone: string;
  walletEmail: string;
  
  // Common
  isDefault: boolean;
  saveForFuture: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_TYPES: Array<{
  value: PaymentMethodType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: 'credit_card', label: 'Credit Card', icon: CreditCardIcon },
  { value: 'debit_card', label: 'Debit Card', icon: CreditCardIcon },
  { value: 'net_banking', label: 'Net Banking', icon: BanknotesIcon },
  { value: 'upi', label: 'UPI', icon: DevicePhoneMobileIcon },
  { value: 'digital_wallet', label: 'Digital Wallet', icon: WalletIcon },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: BanknotesIcon },
];

const CARD_PROVIDERS: PaymentProvider[] = [
  'visa',
  'mastercard',
  'amex',
  'rupay',
];

const BANK_PROVIDERS: PaymentProvider[] = [
  'sbi',
  'hdfc',
  'icici',
  'axis',
  'kotak',
];

const UPI_PROVIDERS: PaymentProvider[] = [
  'googlepay',
  'phonepe',
  'paytm',
  'amazon_pay',
];

const WALLET_PROVIDERS: PaymentProvider[] = [
  'paytm',
  'phonepe',
  'amazon_pay',
  'googlepay',
  'apple_pay',
];

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

const validateCardNumber = (number: string): boolean => {
  // Luhn algorithm
  const digits = number.replace(/\s/g, '');
  if (!/^\d+$/.test(digits)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

const detectCardBrand = (number: string): CardBrand | undefined => {
  const cleaned = number.replace(/\s/g, '');
  
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';
  if (/^3(?:0[0-5]|[68])/.test(cleaned)) return 'diners';
  if (/^35/.test(cleaned)) return 'jcb';
  if (/^6/.test(cleaned)) return 'rupay';
  
  return undefined;
};

const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(' ');
};

const validateIFSC = (code: string): boolean => {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(code);
};

const validateUPI = (id: string): boolean => {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(id);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AddPaymentMethod Component
 * 
 * Comprehensive payment method addition modal with features including:
 * - Multiple payment types (card, bank, UPI, wallet)
 * - Dynamic form fields based on type
 * - Real-time validation
 * - Card number formatting with Luhn algorithm
 * - Card brand detection
 * - IFSC code validation
 * - UPI ID validation
 * - Secure input handling
 * - Set as default option
 * - Save for future use
 * - Provider selection
 * - Nickname/alias
 * 
 * @example
 * ```tsx
 * <AddPaymentMethod
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onSave={handleSavePaymentMethod}
 * />
 * ```
 */
export const AddPaymentMethod: React.FC<AddPaymentMethodProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultType = 'credit_card',
  showSetDefault = true,
  className,
}) => {
  // Hooks
  const toast = useNotification();

  // State
  const [formData, setFormData] = useState<PaymentFormData>({
    type: defaultType,
    provider: 'visa',
    nickname: '',
    cardNumber: '',
    cardHolderName: '',
    cardExpiryMonth: '',
    cardExpiryYear: '',
    cardCvv: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    bankName: '',
    accountType: 'savings',
    upiId: '',
    walletId: '',
    walletPhone: '',
    walletEmail: '',
    isDefault: false,
    saveForFuture: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Computed values
  const availableProviders = useMemo(() => {
    switch (formData.type) {
      case 'credit_card':
      case 'debit_card':
        return CARD_PROVIDERS;
      case 'net_banking':
      case 'bank_transfer':
        return BANK_PROVIDERS;
      case 'upi':
        return UPI_PROVIDERS;
      case 'digital_wallet':
        return WALLET_PROVIDERS;
      default:
        return [];
    }
  }, [formData.type]);

  // Handlers
  const handleTypeChange = useCallback((type: PaymentMethodType) => {
    setFormData(prev => ({
      ...prev,
      type,
      provider: type === 'credit_card' || type === 'debit_card' ? 'visa' :
                type === 'upi' ? 'googlepay' :
                type === 'digital_wallet' ? 'paytm' :
                type === 'net_banking' || type === 'bank_transfer' ? 'sbi' :
                prev.provider,
    }));
    setErrors({});
  }, []);

  const handleInputChange = useCallback((field: keyof PaymentFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Special handling for card number
    if (field === 'cardNumber' && typeof value === 'string') {
      const formatted = formatCardNumber(value);
      const brand = detectCardBrand(formatted);
      setFormData(prev => ({
        ...prev,
        cardNumber: formatted,
        cardBrand: brand,
      }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Common validation
    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Please enter a nickname';
    }

    // Type-specific validation
    switch (formData.type) {
      case 'credit_card':
      case 'debit_card':
        if (!formData.cardNumber.replace(/\s/g, '')) {
          newErrors.cardNumber = 'Card number is required';
        } else if (!validateCardNumber(formData.cardNumber)) {
          newErrors.cardNumber = 'Invalid card number';
        }
        
        if (!formData.cardHolderName.trim()) {
          newErrors.cardHolderName = 'Cardholder name is required';
        }
        
        if (!formData.cardExpiryMonth) {
          newErrors.cardExpiryMonth = 'Expiry month is required';
        }
        
        if (!formData.cardExpiryYear) {
          newErrors.cardExpiryYear = 'Expiry year is required';
        } else {
          const currentYear = new Date().getFullYear();
          const year = parseInt(formData.cardExpiryYear);
          if (year < currentYear || year > currentYear + 20) {
            newErrors.cardExpiryYear = 'Invalid expiry year';
          }
        }
        
        if (!formData.cardCvv) {
          newErrors.cardCvv = 'CVV is required';
        } else if (formData.cardCvv.length < 3 || formData.cardCvv.length > 4) {
          newErrors.cardCvv = 'CVV must be 3 or 4 digits';
        }
        break;

      case 'net_banking':
      case 'bank_transfer':
        if (!formData.accountNumber.trim()) {
          newErrors.accountNumber = 'Account number is required';
        }
        
        if (!formData.accountHolderName.trim()) {
          newErrors.accountHolderName = 'Account holder name is required';
        }
        
        if (!formData.ifscCode.trim()) {
          newErrors.ifscCode = 'IFSC code is required';
        } else if (!validateIFSC(formData.ifscCode)) {
          newErrors.ifscCode = 'Invalid IFSC code';
        }
        
        if (!formData.bankName.trim()) {
          newErrors.bankName = 'Bank name is required';
        }
        break;

      case 'upi':
        if (!formData.upiId.trim()) {
          newErrors.upiId = 'UPI ID is required';
        } else if (!validateUPI(formData.upiId)) {
          newErrors.upiId = 'Invalid UPI ID format';
        }
        break;

      case 'digital_wallet':
        if (!formData.walletId.trim() && !formData.walletPhone.trim()) {
          newErrors.walletId = 'Wallet ID or phone number is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast?.error('Please fix the errors in the form');
      return;
    }

    setIsSaving(true);
    try {
      const paymentMethod: Partial<PaymentMethod> = {
        type: formData.type,
        provider: formData.provider,
        nickname: formData.nickname,
        isDefault: formData.isDefault,
        isActive: true,
        isVerified: false,
      };

      // Add type-specific details
      if (formData.type === 'credit_card' || formData.type === 'debit_card') {
        paymentMethod.cardDetails = {
          last4: formData.cardNumber.replace(/\s/g, '').slice(-4),
          brand: formData.cardBrand || 'visa',
          expiryMonth: parseInt(formData.cardExpiryMonth),
          expiryYear: parseInt(formData.cardExpiryYear),
          holderName: formData.cardHolderName,
          cardType: formData.type === 'credit_card' ? 'credit' : 'debit',
          isInternational: false,
        };
      } else if (formData.type === 'net_banking' || formData.type === 'bank_transfer') {
        paymentMethod.bankDetails = {
          accountNumber: formData.accountNumber.slice(-4),
          accountType: formData.accountType as 'savings' | 'current' | 'nri',
          bankName: formData.bankName,
          ifscCode: formData.ifscCode,
          accountHolderName: formData.accountHolderName,
          branchName: '',
        };
      } else if (formData.type === 'upi') {
        paymentMethod.walletDetails = {
          walletId: formData.upiId,
          walletProvider: formData.provider,
        };
      } else if (formData.type === 'digital_wallet') {
        paymentMethod.walletDetails = {
          walletId: formData.walletId || formData.walletPhone,
          walletProvider: formData.provider,
          phoneNumber: formData.walletPhone,
          email: formData.walletEmail,
        };
      }

      await onSave(paymentMethod);
      toast?.success('Payment method added successfully');
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add payment method';
      toast?.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [formData, validateForm, onSave, onClose, toast]);

  const handleCancel = useCallback(() => {
    setFormData({
      type: defaultType,
      provider: 'visa',
      nickname: '',
      cardNumber: '',
      cardHolderName: '',
      cardExpiryMonth: '',
      cardExpiryYear: '',
      cardCvv: '',
      accountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      bankName: '',
      accountType: 'savings',
      upiId: '',
      walletId: '',
      walletPhone: '',
      walletEmail: '',
      isDefault: false,
      saveForFuture: true,
    });
    setErrors({});
    onClose();
  }, [defaultType, onClose]);

  // Render nothing if not open
  if (!isOpen) return null;

  // Render component
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn('w-full max-w-2xl max-h-[90vh] overflow-y-auto', className)}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Add Payment Method</h2>
                  <p className="text-sm text-gray-500 mt-1">Securely save your payment information</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent>
                <div className="space-y-6">
                  {/* Payment Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {PAYMENT_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isSelected = formData.type === type.value;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleTypeChange(type.value)}
                            className={cn(
                              'flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all',
                              isSelected
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <Icon className={cn(
                              'w-8 h-8 mb-2',
                              isSelected ? 'text-primary-600' : 'text-gray-600'
                            )} />
                            <span className={cn(
                              'text-sm font-medium',
                              isSelected ? 'text-primary-900' : 'text-gray-900'
                            )}>
                              {type.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nickname */}
                  <div>
                    <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                      Nickname (e.g., &quot;My Primary Card&quot;)
                    </label>
                    <Input
                      id="nickname"
                      type="text"
                      value={formData.nickname}
                      onChange={(e) => handleInputChange('nickname', e.target.value)}
                      error={errors.nickname}
                      placeholder="Enter a nickname"
                    />
                  </div>

                  {/* Provider Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provider
                    </label>
                    <Select
                      value={formData.provider}
                      onValueChange={(value) => handleInputChange('provider', value as PaymentProvider)}
                      options={availableProviders.map(p => ({ value: p, label: p.toUpperCase() }))}
                    />
                  </div>

                  {/* Card-specific fields */}
                  {(formData.type === 'credit_card' || formData.type === 'debit_card') && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <div className="relative">
                          <Input
                            id="cardNumber"
                            type="text"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                            error={errors.cardNumber}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                          {formData.cardBrand && (
                            <Badge className="absolute right-3 top-1/2 -translate-y-1/2">
                              {formData.cardBrand.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name
                        </label>
                        <Input
                          id="cardHolderName"
                          type="text"
                          value={formData.cardHolderName}
                          onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                          error={errors.cardHolderName}
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="cardExpiryMonth" className="block text-sm font-medium text-gray-700 mb-2">
                            Month
                          </label>
                          <Select
                            value={formData.cardExpiryMonth}
                            onValueChange={(value) => handleInputChange('cardExpiryMonth', String(value))}
                            options={Array.from({ length: 12 }, (_, i) => ({
                              value: String(i + 1).padStart(2, '0'),
                              label: String(i + 1).padStart(2, '0'),
                            }))}
                            placeholder="MM"
                          />
                          {errors.cardExpiryMonth && (
                            <p className="text-red-600 text-sm mt-1">{errors.cardExpiryMonth}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="cardExpiryYear" className="block text-sm font-medium text-gray-700 mb-2">
                            Year
                          </label>
                          <Select
                            value={formData.cardExpiryYear}
                            onValueChange={(value) => handleInputChange('cardExpiryYear', String(value))}
                            options={Array.from({ length: 20 }, (_, i) => {
                              const year = new Date().getFullYear() + i;
                              return { value: String(year), label: String(year) };
                            })}
                            placeholder="YYYY"
                          />
                          {errors.cardExpiryYear && (
                            <p className="text-red-600 text-sm mt-1">{errors.cardExpiryYear}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <Input
                            id="cardCvv"
                            type="password"
                            value={formData.cardCvv}
                            onChange={(e) => handleInputChange('cardCvv', e.target.value)}
                            error={errors.cardCvv}
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank-specific fields */}
                  {(formData.type === 'net_banking' || formData.type === 'bank_transfer') && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Account Number
                        </label>
                        <Input
                          id="accountNumber"
                          type="text"
                          value={formData.accountNumber}
                          onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                          error={errors.accountNumber}
                          placeholder="Enter account number"
                        />
                      </div>

                      <div>
                        <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-2">
                          Account Holder Name
                        </label>
                        <Input
                          id="accountHolderName"
                          type="text"
                          value={formData.accountHolderName}
                          onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                          error={errors.accountHolderName}
                          placeholder="Enter name as per bank records"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-2">
                            IFSC Code
                          </label>
                          <Input
                            id="ifscCode"
                            type="text"
                            value={formData.ifscCode}
                            onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                            error={errors.ifscCode}
                            placeholder="SBIN0001234"
                            maxLength={11}
                          />
                        </div>

                        <div>
                          <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Name
                          </label>
                          <Input
                            id="bankName"
                            type="text"
                            value={formData.bankName}
                            onChange={(e) => handleInputChange('bankName', e.target.value)}
                            error={errors.bankName}
                            placeholder="Bank name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Type
                        </label>
                        <Select
                          value={formData.accountType}
                          onValueChange={(value) => handleInputChange('accountType', value as 'savings' | 'current')}
                          options={[
                            { value: 'savings', label: 'Savings' },
                            { value: 'current', label: 'Current' },
                          ]}
                        />
                      </div>
                    </div>
                  )}

                  {/* UPI-specific fields */}
                  {formData.type === 'upi' && (
                    <div>
                      <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-2">
                        UPI ID
                      </label>
                      <Input
                        id="upiId"
                        type="text"
                        value={formData.upiId}
                        onChange={(e) => handleInputChange('upiId', e.target.value)}
                        error={errors.upiId}
                        placeholder="yourname@upi"
                      />
                    </div>
                  )}

                  {/* Wallet-specific fields */}
                  {formData.type === 'digital_wallet' && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="walletId" className="block text-sm font-medium text-gray-700 mb-2">
                          Wallet ID
                        </label>
                        <Input
                          id="walletId"
                          type="text"
                          value={formData.walletId}
                          onChange={(e) => handleInputChange('walletId', e.target.value)}
                          error={errors.walletId}
                          placeholder="Enter wallet ID"
                        />
                      </div>

                      <div>
                        <label htmlFor="walletPhone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          id="walletPhone"
                          type="tel"
                          value={formData.walletPhone}
                          onChange={(e) => handleInputChange('walletPhone', e.target.value)}
                          placeholder="+91 9876543210"
                        />
                      </div>

                      <div>
                        <label htmlFor="walletEmail" className="block text-sm font-medium text-gray-700 mb-2">
                          Email (optional)
                        </label>
                        <Input
                          id="walletEmail"
                          type="email"
                          value={formData.walletEmail}
                          onChange={(e) => handleInputChange('walletEmail', e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-3 pt-4 border-t">
                    {showSetDefault && (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">Set as default</span>
                          <p className="text-sm text-gray-500">Use this payment method by default</p>
                        </div>
                        <Switch
                          checked={formData.isDefault}
                          onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">Save for future use</span>
                        <p className="text-sm text-gray-500">Remember this payment method</p>
                      </div>
                      <Switch
                        checked={formData.saveForFuture}
                        onCheckedChange={(checked) => handleInputChange('saveForFuture', checked)}
                      />
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <LockClosedIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        Your data is secure
                      </p>
                      <p className="text-sm text-blue-700 mt-1 flex items-start gap-2">
                        <ExclamationCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>All payment information is encrypted and securely stored. We never share your data with third parties.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <div className="flex gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={isSaving}
                    loading={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? 'Adding...' : 'Add Payment Method'}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddPaymentMethod;
