'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCardIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { Price } from '@/types/common.types';
import type { PaymentMethodType, CardBrand } from '@/types/payment.types';
import type { PaymentSuccessResponse, PaymentError } from './PaymentMethods';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CreditCardFormProps {
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
  cardType: PaymentMethodType;
  onSuccess: (response: PaymentSuccessResponse) => void | Promise<void>;
  onError: (error: PaymentError) => void;
  onCancel?: () => void;
  testMode?: boolean;
}

interface CardFormData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  saveCard: boolean;
}

interface CardErrors {
  cardNumber?: string;
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CARD_BRANDS: Record<string, {name: string; pattern: RegExp; color: string}> = {
  visa: {
    name: 'Visa',
    pattern: /^4/,
    color: 'text-blue-600',
  },
  mastercard: {
    name: 'Mastercard',
    pattern: /^5[1-5]/,
    color: 'text-orange-600',
  },
  amex: {
    name: 'American Express',
    pattern: /^3[47]/,
    color: 'text-blue-800',
  },
  rupay: {
    name: 'RuPay',
    pattern: /^(6|60|65|81|82|508)/,
    color: 'text-green-600',
  },
  discover: {
    name: 'Discover',
    pattern: /^6(?:011|5)/,
    color: 'text-orange-500',
  },
  diners: {
    name: 'Diners Club',
    pattern: /^3(?:0[0-5]|[68])/,
    color: 'text-blue-700',
  },
  jcb: {
    name: 'JCB',
    pattern: /^35/,
    color: 'text-red-600',
  },
  maestro: {
    name: 'Maestro',
    pattern: /^(5018|5020|5038|6304|6759|6761|6763)/,
    color: 'text-red-500',
  },
};

const TEST_CARDS = {
  success: '4111111111111111',
  failure: '4000000000000002',
  authRequired: '4000002500003155',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CreditCardForm: React.FC<CreditCardFormProps> = ({
  amount,
  orderId,
  orderDetails,
  cardType,
  onSuccess,
  onError,
  onCancel,
  testMode = false,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: testMode ? TEST_CARDS.success : '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    saveCard: false,
  });

  const [errors, setErrors] = useState<CardErrors>({});
  const [touched, setTouched] = useState<Record<keyof CardFormData, boolean>>({
    cardNumber: false,
    cardholderName: false,
    expiryMonth: false,
    expiryYear: false,
    cvv: false,
    saveCard: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedBrand, setDetectedBrand] = useState<CardBrand | null>(null);
  const [showCVVInfo, setShowCVVInfo] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isFormValid = useMemo(() => {
    return (
      formData.cardNumber.replace(/\s/g, '').length >= 15 &&
      formData.cardholderName.trim().length >= 3 &&
      formData.expiryMonth.length === 2 &&
      formData.expiryYear.length === 2 &&
      formData.cvv.length >= 3 &&
      Object.keys(errors).length === 0
    );
  }, [formData, errors]);

  const formattedCardNumber = useMemo(() => {
    return formData.cardNumber.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  }, [formData.cardNumber]);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateCardNumber = useCallback((cardNumber: string): string | undefined => {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (!cleaned) {
      return 'Card number is required';
    }

    if (!/^\d+$/.test(cleaned)) {
      return 'Card number must contain only digits';
    }

    if (cleaned.length < 15 || cleaned.length > 19) {
      return 'Card number must be 15-19 digits';
    }

    // Luhn algorithm validation
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
    
    if (sum % 10 !== 0) {
      return 'Invalid card number';
    }

    return undefined;
  }, []);

  const validateCardholderName = useCallback((name: string): string | undefined => {
    if (!name.trim()) {
      return 'Cardholder name is required';
    }

    if (name.trim().length < 3) {
      return 'Name must be at least 3 characters';
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return 'Name must contain only letters and spaces';
    }

    return undefined;
  }, []);

  const validateExpiry = useCallback((month: string, year: string): { month?: string; year?: string } => {
    const errors: { month?: string; year?: string } = {};

    if (!month) {
      errors.month = 'Month is required';
    } else {
      const monthNum = parseInt(month, 10);
      if (monthNum < 1 || monthNum > 12) {
        errors.month = 'Invalid month';
      }
    }

    if (!year) {
      errors.year = 'Year is required';
    } else {
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      const yearNum = parseInt(year, 10);

      if (yearNum < currentYear) {
        errors.year = 'Card is expired';
      } else if (yearNum === currentYear && month) {
        const monthNum = parseInt(month, 10);
        if (monthNum < currentMonth) {
          errors.month = 'Card is expired';
        }
      }
    }

    return errors;
  }, []);

  const validateCVV = useCallback((cvv: string, isAmex: boolean): string | undefined => {
    if (!cvv) {
      return 'CVV is required';
    }

    if (!/^\d+$/.test(cvv)) {
      return 'CVV must contain only digits';
    }

    const expectedLength = isAmex ? 4 : 3;
    if (cvv.length !== expectedLength) {
      return `CVV must be ${expectedLength} digits`;
    }

    return undefined;
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Detect card brand
  useEffect(() => {
    const cleaned = formData.cardNumber.replace(/\s/g, '');
    
    if (cleaned.length >= 4) {
      for (const [brand, data] of Object.entries(CARD_BRANDS)) {
        if (data.pattern.test(cleaned)) {
          setDetectedBrand(brand as CardBrand);
          return;
        }
      }
    }
    
    setDetectedBrand(null);
  }, [formData.cardNumber]);

  // Validate on change
  useEffect(() => {
    const newErrors: CardErrors = {};

    if (touched.cardNumber) {
      const error = validateCardNumber(formData.cardNumber);
      if (error) newErrors.cardNumber = error;
    }

    if (touched.cardholderName) {
      const error = validateCardholderName(formData.cardholderName);
      if (error) newErrors.cardholderName = error;
    }

    if (touched.expiryMonth || touched.expiryYear) {
      const expiryErrors = validateExpiry(formData.expiryMonth, formData.expiryYear);
      if (expiryErrors.month) newErrors.expiryMonth = expiryErrors.month;
      if (expiryErrors.year) newErrors.expiryYear = expiryErrors.year;
    }

    if (touched.cvv) {
      const error = validateCVV(formData.cvv, detectedBrand === 'amex');
      if (error) newErrors.cvv = error;
    }

    setErrors(newErrors);
  }, [formData, touched, detectedBrand, validateCardNumber, validateCardholderName, validateExpiry, validateCVV]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleInputChange = useCallback((field: keyof CardFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (typeof value === 'string') {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
  }, []);

  const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '');
    
    // Only allow digits
    value = value.replace(/\D/g, '');
    
    // Limit length
    value = value.substring(0, 19);
    
    handleInputChange('cardNumber', value);
  }, [handleInputChange]);

  const handleExpiryChange = useCallback((field: 'expiryMonth' | 'expiryYear', value: string) => {
    // Only allow digits
    value = value.replace(/\D/g, '');
    
    if (field === 'expiryMonth') {
      value = value.substring(0, 2);
      if (parseInt(value, 10) > 12) {
        value = '12';
      }
    } else {
      value = value.substring(0, 2);
    }
    
    handleInputChange(field, value);
  }, [handleInputChange]);

  const handleCVVChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    const maxLength = detectedBrand === 'amex' ? 4 : 3;
    value = value.substring(0, maxLength);
    handleInputChange('cvv', value);
  }, [detectedBrand, handleInputChange]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      cardNumber: true,
      cardholderName: true,
      expiryMonth: true,
      expiryYear: true,
      cvv: true,
      saveCard: true,
    });

    if (!isFormValid) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In test mode, check card number for success/failure
      if (testMode) {
        const cleaned = formData.cardNumber.replace(/\s/g, '');
        
        if (cleaned === TEST_CARDS.failure) {
          throw new Error('Card declined - insufficient funds');
        }
        
        if (cleaned === TEST_CARDS.authRequired) {
          toast.loading('3D Secure authentication would be required here', { duration: 3000 });
        }
      }

      // Log order details for analytics
      if (orderDetails) {
        console.log('Card Payment Order Details:', {
          orderId,
          items: orderDetails.items,
          customer: {
            name: orderDetails.customerName,
            email: orderDetails.customerEmail,
            phone: orderDetails.customerPhone,
          },
          amount,
          cardBrand: detectedBrand,
        });
      }

      // Success response
      const response: PaymentSuccessResponse = {
        paymentId: `pay_${Date.now()}`,
        orderId,
        paymentMethod: cardType,
        amount,
        status: 'success',
        transactionId: `txn_${Date.now()}`,
        metadata: {
          cardBrand: detectedBrand,
          last4: formData.cardNumber.replace(/\s/g, '').slice(-4),
          saveCard: formData.saveCard,
        },
      };

      await onSuccess(response);
      toast.success('Payment successful!');

    } catch (error) {
      const err = error as Error;
      const paymentError: PaymentError = {
        code: 'CARD_PAYMENT_FAILED',
        message: err.message || 'Card payment failed',
        description: 'Please check your card details and try again',
        step: 'payment',
        metadata: {
          cardBrand: detectedBrand,
        },
      };
      
      onError(paymentError);
    } finally {
      setIsProcessing(false);
    }
  }, [isFormValid, formData, testMode, orderId, cardType, amount, detectedBrand, orderDetails, onSuccess, onError]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCardIcon className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {cardType === 'credit_card' ? 'Credit Card' : 'Debit Card'} Payment
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your card details to complete payment
            </p>
          </div>
        </div>
        {detectedBrand && CARD_BRANDS[detectedBrand] && (
          <Badge variant="secondary">
            <span className={CARD_BRANDS[detectedBrand].color}>
              {CARD_BRANDS[detectedBrand].name}
            </span>
          </Badge>
        )}
      </div>

      {/* Test Mode Info */}
      {testMode && (
        <Alert variant="info">
          <InformationCircleIcon className="h-5 w-5" />
          <div>
            <p className="font-semibold">Test Mode</p>
            <p className="text-sm">
              Use {TEST_CARDS.success} for success, {TEST_CARDS.failure} for failure
            </p>
          </div>
        </Alert>
      )}

      {/* Card Visual */}
      <Card className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="h-8 w-8" />
              {detectedBrand && (
                <span className="text-sm font-medium">
                  {CARD_BRANDS[detectedBrand]?.name}
                </span>
              )}
            </div>
            <LockClosedIcon className="h-5 w-5 opacity-75" />
          </div>

          <div className="font-mono text-xl tracking-wider">
            {formattedCardNumber || '•••• •••• •••• ••••'}
          </div>

          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs opacity-75 mb-1">Cardholder Name</div>
              <div className="font-medium uppercase text-sm">
                {formData.cardholderName || 'YOUR NAME'}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-75 mb-1">Expires</div>
              <div className="font-mono">
                {formData.expiryMonth || 'MM'}/{formData.expiryYear || 'YY'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Card Number *
        </label>
        <Input
          type="text"
          value={formattedCardNumber}
          onChange={handleCardNumberChange}
          placeholder="1234 5678 9012 3456"
          maxLength={23}
          error={touched.cardNumber ? errors.cardNumber : undefined}
          disabled={isProcessing}
          className="font-mono"
        />
        {detectedBrand && (
          <div className="mt-2 flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {CARD_BRANDS[detectedBrand].name} card detected
            </span>
          </div>
        )}
      </div>

      {/* Cardholder Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cardholder Name *
        </label>
        <Input
          type="text"
          value={formData.cardholderName}
          onChange={(e) => handleInputChange('cardholderName', e.target.value.toUpperCase())}
          placeholder="JOHN DOE"
          error={touched.cardholderName ? errors.cardholderName : undefined}
          disabled={isProcessing}
          className="uppercase"
        />
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Month *
          </label>
          <Input
            type="text"
            value={formData.expiryMonth}
            onChange={(e) => handleExpiryChange('expiryMonth', e.target.value)}
            placeholder="MM"
            maxLength={2}
            error={touched.expiryMonth ? errors.expiryMonth : undefined}
            disabled={isProcessing}
            className="font-mono text-center"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Year *
          </label>
          <Input
            type="text"
            value={formData.expiryYear}
            onChange={(e) => handleExpiryChange('expiryYear', e.target.value)}
            placeholder="YY"
            maxLength={2}
            error={touched.expiryYear ? errors.expiryYear : undefined}
            disabled={isProcessing}
            className="font-mono text-center"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
            CVV *
            <button
              type="button"
              onClick={() => setShowCVVInfo(!showCVVInfo)}
              className="text-gray-400 hover:text-gray-600"
            >
              <InformationCircleIcon className="h-4 w-4" />
            </button>
          </label>
          <Input
            type="password"
            value={formData.cvv}
            onChange={handleCVVChange}
            placeholder={detectedBrand === 'amex' ? '1234' : '123'}
            maxLength={detectedBrand === 'amex' ? 4 : 3}
            error={touched.cvv ? errors.cvv : undefined}
            disabled={isProcessing}
            className="font-mono text-center"
          />
          {touched.cvv && errors.cvv && (
            <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <XCircleIcon className="h-3 w-3" />
              <span>{errors.cvv}</span>
            </div>
          )}
        </div>
      </div>

      {/* CVV Info */}
      <AnimatePresence>
        {showCVVInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert variant="info">
              <LockClosedIcon className="h-5 w-5" />
              <div>
                <p className="text-sm">
                  CVV is the {detectedBrand === 'amex' ? '4-digit' : '3-digit'} security code on the{' '}
                  {detectedBrand === 'amex' ? 'front' : 'back'} of your card.
                </p>
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Warnings */}
      {Object.keys(errors).length > 0 && Object.keys(touched).some(key => touched[key as keyof typeof touched]) && (
        <Alert variant="warning">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">Please fix the following errors:</p>
            <ul className="mt-1 text-xs space-y-1">
              {Object.entries(errors).map(([key, value]) => (
                touched[key as keyof typeof touched] && (
                  <li key={key} className={cn("text-orange-700 dark:text-orange-300")}>
                    • {value}
                  </li>
                )
              ))}
            </ul>
          </div>
        </Alert>
      )}

      {/* Save Card */}
      <div className="flex items-start gap-3">
        <Checkbox
          checked={formData.saveCard}
          onChange={(e) => handleInputChange('saveCard', e.target.checked)}
          disabled={isProcessing}
        />
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
            Save card for future payments
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Your card details will be securely encrypted and stored
          </p>
        </div>
      </div>

      {/* Security Info */}
      <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
              Secure Payment
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              Your payment is encrypted and secure. We don&apos;t store your full card details.
            </p>
          </div>
        </div>
      </Card>

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
          disabled={!isFormValid || isProcessing}
          loading={isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Processing...' : `Pay ${amount.formatted}`}
        </Button>
      </div>
    </form>
  );
};

export default CreditCardForm;
