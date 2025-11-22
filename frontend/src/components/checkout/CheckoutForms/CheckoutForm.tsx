'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { ContactForm, type ContactFormData } from './ContactForm';
import { ShippingForm, type ShippingFormData } from './ShippingForm';
import { BillingForm, type BillingFormData } from './BillingForm';
import { PaymentForm, type PaymentFormData } from './PaymentForm';
import { OrderReview } from './OrderReview';
import type { UserAddress } from '@/types/address.types';
import type { CartItem, ShippingMethod } from '@/types/cart.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type CheckoutStep = 'contact' | 'shipping' | 'billing' | 'payment' | 'review';

export interface CheckoutData {
  contact?: ContactFormData;
  shipping?: ShippingFormData;
  billing?: BillingFormData;
  payment?: PaymentFormData;
}

export interface CheckoutFormProps {
  /**
   * Cart items
   */
  cartItems: CartItem[];

  /**
   * Available addresses
   */
  addresses?: UserAddress[];

  /**
   * Available shipping methods
   */
  shippingMethods?: ShippingMethod[];

  /**
   * Order totals
   */
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };

  /**
   * Initial checkout data
   */
  initialData?: Partial<CheckoutData>;

  /**
   * Initial step
   */
  initialStep?: CheckoutStep;

  /**
   * Callback when address is added
   */
  onAddAddress?: (address: Partial<UserAddress>) => Promise<UserAddress>;

  /**
   * Callback when address is edited
   */
  onEditAddress?: (addressId: string, address: Partial<UserAddress>) => Promise<UserAddress>;

  /**
   * Callback when address is deleted
   */
  onDeleteAddress?: (addressId: string) => Promise<void>;

  /**
   * Callback when coupon is applied
   */
  onApplyCoupon?: (code: string) => Promise<boolean>;

  /**
   * Callback when coupon is removed
   */
  onRemoveCoupon?: () => void;

  /**
   * Applied coupon code
   */
  appliedCoupon?: string;

  /**
   * Callback when order is placed
   */
  onPlaceOrder: (data: CheckoutData) => Promise<void>;

  /**
   * Callback when checkout is cancelled
   */
  onCancel?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const STEPS: Array<{ key: CheckoutStep; label: string }> = [
  { key: 'contact', label: 'Contact' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'billing', label: 'Billing' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Review' },
];

const STORAGE_KEY = 'checkout_data';

/**
 * Save checkout data to localStorage
 */
const saveToStorage = (data: CheckoutData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save checkout data:', error);
  }
};

/**
 * Load checkout data from localStorage
 */
const loadFromStorage = (): Partial<CheckoutData> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load checkout data:', error);
    return null;
  }
};

/**
 * Clear checkout data from localStorage
 */
const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear checkout data:', error);
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CheckoutForm Component
 * 
 * Main checkout orchestrator that manages the entire checkout flow.
 * Features:
 * - Multi-step checkout process
 * - Form data aggregation
 * - Step validation
 * - Data persistence (localStorage)
 * - Progress tracking
 * - Navigation controls
 * - Order placement
 * - Error handling
 * 
 * @example
 * ```tsx
 * <CheckoutForm
 *   cartItems={items}
 *   addresses={addresses}
 *   totals={totals}
 *   onPlaceOrder={handlePlaceOrder}
 * />
 * ```
 */
export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  cartItems,
  addresses = [],
  shippingMethods = [],
  totals,
  initialData,
  initialStep = 'contact',
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
  onPlaceOrder,
  onCancel,
  className,
}) => {
  // State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(initialStep);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>(() => {
    // Try to restore from storage or use initialData
    const stored = loadFromStorage();
    return {
      contact: stored?.contact || initialData?.contact,
      shipping: stored?.shipping || initialData?.shipping,
      billing: stored?.billing || initialData?.billing,
      payment: stored?.payment || initialData?.payment,
    };
  });
  const [completedSteps, setCompletedSteps] = useState<Set<CheckoutStep>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Auto-save to storage
  useEffect(() => {
    if (Object.keys(checkoutData).length > 0) {
      saveToStorage(checkoutData);
    }
  }, [checkoutData]);

  // Get current step index
  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  // Handle step completion
  const handleStepComplete = (step: CheckoutStep, data: unknown) => {
    setCheckoutData((prev) => ({
      ...prev,
      [step]: data,
    }));
    setCompletedSteps((prev) => new Set(prev).add(step));
  };

  // Handle next step
  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].key);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].key);
    }
  };

  // Handle step click
  const handleStepClick = (step: CheckoutStep) => {
    const stepIndex = STEPS.findIndex((s) => s.key === step);
    
    // Allow navigation to previous steps
    if (stepIndex <= currentStepIndex) {
      setCurrentStep(step);
      return;
    }

    // For forward navigation, check if previous steps are completed
    const previousSteps = STEPS.slice(0, stepIndex).map((s) => s.key);
    const allPreviousCompleted = previousSteps.every((s) => completedSteps.has(s));

    if (allPreviousCompleted) {
      setCurrentStep(step);
    } else {
      toast.error('Please complete previous steps first');
    }
  };

  // Handle edit section from review
  const handleEditSection = (section: 'contact' | 'shipping' | 'billing' | 'payment') => {
    setCurrentStep(section);
  };

  // Handle contact form submit
  const handleContactSubmit = (data: ContactFormData) => {
    handleStepComplete('contact', data);
    handleNext();
  };

  // Handle shipping form submit
  const handleShippingSubmit = (data: ShippingFormData) => {
    handleStepComplete('shipping', data);
    handleNext();
  };

  // Handle billing form submit
  const handleBillingSubmit = (data: BillingFormData) => {
    handleStepComplete('billing', data);
    handleNext();
  };

  // Handle payment form submit
  const handlePaymentSubmit = (data: PaymentFormData) => {
    handleStepComplete('payment', data);
    handleNext();
  };

  // Handle place order
  const handlePlaceOrderClick = async () => {
    // Validate all data is present
    if (!checkoutData.contact) {
      toast.error('Contact information is missing');
      setCurrentStep('contact');
      return;
    }

    if (!checkoutData.shipping) {
      toast.error('Shipping information is missing');
      setCurrentStep('shipping');
      return;
    }

    if (!checkoutData.billing) {
      toast.error('Billing information is missing');
      setCurrentStep('billing');
      return;
    }

    if (!checkoutData.payment) {
      toast.error('Payment information is missing');
      setCurrentStep('payment');
      return;
    }

    setIsLoading(true);
    try {
      await onPlaceOrder(checkoutData as Required<CheckoutData>);
      
      // Clear storage on success
      clearStorage();
      const newCompleted = new Set(completedSteps);
      newCompleted.add('review');
      setCompletedSteps(newCompleted);
      
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'contact':
        return (
          <ContactForm
            initialData={checkoutData.contact}
            onSubmit={handleContactSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
          />
        );

      case 'shipping':
        return (
          <ShippingForm
            addresses={addresses}
            shippingMethods={shippingMethods}
            initialData={checkoutData.shipping}
            onSubmit={handleShippingSubmit}
            onCancel={handlePrevious}
            onAddAddress={onAddAddress ? async (addr) => {
              await onAddAddress(addr);
            } : undefined}
            onEditAddress={onEditAddress ? async (addr) => {
              await onEditAddress(addr.id, addr);
            } : undefined}
            onDeleteAddress={onDeleteAddress}
            isLoading={isLoading}
          />
        );

      case 'billing':
        return (
          <BillingForm
            addresses={addresses}
            shippingAddress={checkoutData.shipping?.shippingAddress}
            initialData={checkoutData.billing}
            onSubmit={handleBillingSubmit}
            onCancel={handlePrevious}
            onAddAddress={onAddAddress ? async (addr) => {
              await onAddAddress(addr);
            } : undefined}
            onEditAddress={onEditAddress ? async (addr) => {
              await onEditAddress(addr.id, addr);
            } : undefined}
            onDeleteAddress={onDeleteAddress}
            isLoading={isLoading}
          />
        );

      case 'payment':
        return (
          <PaymentForm
            amount={totals.total}
            initialData={checkoutData.payment}
            onSubmit={handlePaymentSubmit}
            onCancel={handlePrevious}
            isLoading={isLoading}
          />
        );

      case 'review':
        if (!checkoutData.contact || !checkoutData.shipping || !checkoutData.billing || !checkoutData.payment) {
          toast.error('Please complete all previous steps');
          setCurrentStep('contact');
          return null;
        }

        return (
          <OrderReview
            cartItems={cartItems}
            contactInfo={checkoutData.contact}
            shippingInfo={checkoutData.shipping}
            billingInfo={checkoutData.billing}
            paymentMethod={checkoutData.payment.paymentMethod}
            totals={totals}
            appliedCoupon={appliedCoupon}
            onEditSection={handleEditSection}
            onApplyCoupon={onApplyCoupon}
            onRemoveCoupon={onRemoveCoupon}
            onPlaceOrder={handlePlaceOrderClick}
            onCancel={handlePrevious}
            isLoading={isLoading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Simple Progress Steps */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div
              key={step.key}
              className="flex flex-col items-center flex-1"
            >
              <button
                type="button"
                onClick={() => handleStepClick(step.key)}
                disabled={index > currentStepIndex && !completedSteps.has(STEPS[index - 1]?.key)}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                  currentStep === step.key
                    ? 'bg-primary-600 text-white'
                    : completedSteps.has(step.key)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600',
                  index <= currentStepIndex || completedSteps.has(STEPS[index - 1]?.key)
                    ? 'cursor-pointer hover:opacity-80'
                    : 'cursor-not-allowed opacity-50'
                )}
              >
                {completedSteps.has(step.key) ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  index + 1
                )}
              </button>
              <span className={cn(
                'mt-2 text-xs font-medium',
                currentStep === step.key ? 'text-primary-600' : 'text-gray-600'
              )}>
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  'absolute top-5 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-0.5 -z-10',
                  completedSteps.has(step.key) ? 'bg-green-500' : 'bg-gray-200'
                )} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Step Content */}
      <Card className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step Header */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    completedSteps.has(currentStep)
                      ? 'bg-green-100'
                      : 'bg-primary-100'
                  )}>
                    {completedSteps.has(currentStep) ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    ) : (
                      <span className="text-lg font-semibold text-primary-600">
                        {currentStepIndex + 1}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {STEPS[currentStepIndex].label}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Step {currentStepIndex + 1} of {STEPS.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Step Form */}
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Data Summary (Optional - for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 bg-gray-50">
          <details>
            <summary className="cursor-pointer font-semibold text-sm text-gray-700">\n              Checkout Data (Dev Only)
            </summary>
            <pre className="mt-2 text-xs text-gray-600 overflow-auto">
              {JSON.stringify(checkoutData, null, 2)}
            </pre>
          </details>
        </Card>
      )}
    </div>
  );
};

export default CheckoutForm;
