'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ChevronLeftIcon,
  UserIcon,
  TruckIcon,
  CreditCardIcon,
  DocumentCheckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import { GuestContact, type GuestContactData } from './GuestContact';
import { GuestShipping, type ShippingFormData } from './GuestShipping';
import { GuestBilling, type BillingFormData } from './GuestBilling';
import { GuestPayment, type PaymentFormData } from './GuestPayment';
import { GuestReview } from './GuestReview';
import type { CartItem } from '@/types/cart.types';

// Checkout step types
export type CheckoutStep = 'contact' | 'shipping' | 'billing' | 'payment' | 'review';

interface CheckoutStepConfig {
  id: CheckoutStep;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

// Checkout state
interface CheckoutState {
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  contactData: GuestContactData | null;
  shippingData: ShippingFormData | null;
  billingData: BillingFormData | null;
  paymentData: PaymentFormData | null;
}

interface GuestCheckoutProps {
  cartItems: CartItem[];
  onOrderComplete?: (orderId: string) => void;
  onCancel?: () => void;
}

const CHECKOUT_STEPS: CheckoutStepConfig[] = [
  {
    id: 'contact',
    label: 'Contact',
    icon: UserIcon,
    description: 'Contact Information'
  },
  {
    id: 'shipping',
    label: 'Shipping',
    icon: TruckIcon,
    description: 'Shipping Address'
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCardIcon,
    description: 'Billing Information'
  },
  {
    id: 'payment',
    label: 'Payment',
    icon: ShieldCheckIcon,
    description: 'Payment Method'
  },
  {
    id: 'review',
    label: 'Review',
    icon: DocumentCheckIcon,
    description: 'Review & Place Order'
  }
];

export const GuestCheckout: React.FC<GuestCheckoutProps> = ({
  cartItems,
  onOrderComplete,
  onCancel
}) => {
  // Checkout state
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    currentStep: 'contact',
    completedSteps: [],
    contactData: null,
    shippingData: null,
    billingData: null,
    paymentData: null
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingState, setIsSavingState] = useState(false);

  // Load checkout state from sessionStorage on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem('guestCheckout_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setCheckoutState(parsed);
        toast.success('Checkout progress restored');
      } catch (error) {
        console.error('Failed to parse saved checkout state:', error);
        sessionStorage.removeItem('guestCheckout_state');
      }
    }
  }, []);

  // Save checkout state to sessionStorage whenever it changes
  useEffect(() => {
    if (checkoutState.contactData || checkoutState.shippingData || 
        checkoutState.billingData || checkoutState.paymentData) {
      setIsSavingState(true);
      const timer = setTimeout(() => {
        sessionStorage.setItem('guestCheckout_state', JSON.stringify(checkoutState));
        setIsSavingState(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [checkoutState]);

  // Get current step index
  const getCurrentStepIndex = () => {
    return CHECKOUT_STEPS.findIndex(step => step.id === checkoutState.currentStep);
  };

  // Check if step is completed
  const isStepCompleted = (stepId: CheckoutStep) => {
    return checkoutState.completedSteps.includes(stepId);
  };

  // Check if step is accessible
  const isStepAccessible = (stepId: CheckoutStep) => {
    const stepIndex = CHECKOUT_STEPS.findIndex(step => step.id === stepId);
    const currentIndex = getCurrentStepIndex();
    
    if (stepIndex === currentIndex) return true;
    if (stepIndex < currentIndex && isStepCompleted(stepId)) return true;
    if (stepIndex === currentIndex + 1 && isStepCompleted(checkoutState.currentStep)) {
      return true;
    }
    
    return false;
  };

  // Navigate to step
  const navigateToStep = (stepId: CheckoutStep) => {
    if (isStepAccessible(stepId)) {
      setCheckoutState(prev => ({
        ...prev,
        currentStep: stepId
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle form submissions
  const handleContactSubmit = (data: GuestContactData) => {
    setCheckoutState(prev => ({
      ...prev,
      contactData: data,
      completedSteps: Array.from(new Set([...prev.completedSteps, 'contact' as CheckoutStep])) as CheckoutStep[],
      currentStep: 'shipping'
    }));
    toast.success('Contact information saved');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShippingSubmit = (data: ShippingFormData) => {
    setCheckoutState(prev => ({
      ...prev,
      shippingData: data,
      completedSteps: Array.from(new Set([...prev.completedSteps, 'shipping' as CheckoutStep])) as CheckoutStep[],
      currentStep: 'billing'
    }));
    toast.success('Shipping information saved');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBillingSubmit = (data: BillingFormData) => {
    setCheckoutState(prev => ({
      ...prev,
      billingData: data,
      completedSteps: Array.from(new Set([...prev.completedSteps, 'billing' as CheckoutStep])) as CheckoutStep[],
      currentStep: 'payment'
    }));
    toast.success('Billing information saved');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSubmit = (data: PaymentFormData) => {
    setCheckoutState(prev => ({
      ...prev,
      paymentData: data,
      completedSteps: Array.from(new Set([...prev.completedSteps, 'payment' as CheckoutStep])) as CheckoutStep[],
      currentStep: 'review'
    }));
    toast.success('Payment method saved');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!checkoutState.contactData || !checkoutState.shippingData || 
        !checkoutState.billingData || !checkoutState.paymentData) {
      toast.error('Please complete all checkout steps');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data
      const orderData = {
        customer: checkoutState.contactData,
        shippingAddress: checkoutState.shippingData,
        billingAddress: checkoutState.billingData,
        paymentMethod: checkoutState.paymentData,
        items: cartItems,
        createAccount: checkoutState.contactData.createAccount
      };

      // Simulate API call
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Failed to place order');

      const result = await response.json();
      const orderId = result.orderId || result.id;

      // Clear checkout state
      sessionStorage.removeItem('guestCheckout_state');
      sessionStorage.removeItem('guestCheckout_contact');
      sessionStorage.removeItem('guestCheckout_shipping');
      sessionStorage.removeItem('guestCheckout_billing');
      sessionStorage.removeItem('guestCheckout_payment');

      toast.success('Order placed successfully!');

      if (onOrderComplete && orderId) {
        onOrderComplete(orderId);
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle edit action
  const handleEdit = (section: 'contact' | 'shipping' | 'billing' | 'payment') => {
    navigateToStep(section);
  };

  // Calculate order summary
  const calculateOrderSummary = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.totalPrice?.amount || 0), 0);
    // Note: shippingMethod is stored as ID string, actual price would need to be looked up
    // For now, use a default shipping cost or pass 0
    const shipping = 0; // Would need to lookup from availableShippingMethods by ID
    const tax = subtotal * 0.18;
    const discount = 0;
    const total = subtotal + shipping + tax - discount;

    return { subtotal, shipping, tax, discount, total };
  };

  // Calculate progress percentage
  const progressPercentage = ((checkoutState.completedSteps.length) / CHECKOUT_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Guest Checkout</h1>
            {isSavingState && (
              <Badge variant="secondary" size="sm">
                Saving...
              </Badge>
            )}
          </div>
          <p className="text-gray-600">Complete your purchase without creating an account</p>
        </div>

        {/* Progress Steps */}
        <Card className="mb-8 p-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="grid grid-cols-5 gap-2">
            {CHECKOUT_STEPS.map((step) => {
              const isCurrent = step.id === checkoutState.currentStep;
              const isCompleted = isStepCompleted(step.id);
              const isAccessible = isStepAccessible(step.id);
              const StepIcon = step.icon;

              return (
                <button
                  key={step.id}
                  onClick={() => navigateToStep(step.id)}
                  disabled={!isAccessible}
                  className={`
                    flex flex-col items-center p-3 rounded-lg transition-all
                    ${isCurrent ? 'bg-blue-50 border-2 border-blue-600' : ''}
                    ${isCompleted && !isCurrent ? 'bg-green-50 border-2 border-green-600' : ''}
                    ${!isCurrent && !isCompleted ? 'bg-gray-50 border-2 border-gray-200' : ''}
                    ${isAccessible ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-50'}
                  `}
                >
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center mb-2
                      ${isCurrent ? 'bg-blue-600 text-white' : ''}
                      ${isCompleted && !isCurrent ? 'bg-green-600 text-white' : ''}
                      ${!isCurrent && !isCompleted ? 'bg-gray-300 text-gray-600' : ''}
                    `}
                  >
                    {isCompleted && !isCurrent ? (
                      <CheckCircleIcon className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </div>
                  <span
                    className={`
                      text-xs font-medium text-center
                      ${isCurrent ? 'text-blue-600' : ''}
                      ${isCompleted && !isCurrent ? 'text-green-600' : ''}
                      ${!isCurrent && !isCompleted ? 'text-gray-600' : ''}
                    `}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={checkoutState.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {checkoutState.currentStep === 'contact' && (
              <GuestContact
                initialData={checkoutState.contactData || undefined}
                onSubmit={handleContactSubmit}
              />
            )}

            {checkoutState.currentStep === 'shipping' && (
              <GuestShipping
                initialData={checkoutState.shippingData || undefined}
                onSubmit={handleShippingSubmit}
              />
            )}

            {checkoutState.currentStep === 'billing' && (
              <GuestBilling
                initialData={checkoutState.billingData || undefined}
                shippingAddress={checkoutState.shippingData?.shippingAddress}
                onSubmit={handleBillingSubmit}
              />
            )}

            {checkoutState.currentStep === 'payment' && (
              <GuestPayment
                initialData={checkoutState.paymentData || undefined}
                orderTotal={calculateOrderSummary().total}
                onSubmit={handlePaymentSubmit}
              />
            )}

            {checkoutState.currentStep === 'review' && checkoutState.contactData && 
             checkoutState.shippingData && checkoutState.billingData && checkoutState.paymentData && (
              <GuestReview
                contactInfo={{
                  firstName: checkoutState.contactData.firstName,
                  lastName: checkoutState.contactData.lastName,
                  email: checkoutState.contactData.email,
                  phone: checkoutState.contactData.phone,
                  createAccount: checkoutState.contactData.createAccount
                }}
                shippingInfo={{
                  address: checkoutState.shippingData.shippingAddress,
                  method: {
                    id: checkoutState.shippingData.shippingMethod,
                    name: 'Standard Shipping', // Would lookup from available methods
                    price: 0,
                    estimatedDays: '5-7 business days'
                  },
                  deliveryInstructions: checkoutState.shippingData.deliveryInstructions,
                  giftWrap: checkoutState.shippingData.giftWrap,
                  giftMessage: checkoutState.shippingData.giftMessage
                }}
                billingInfo={{
                  address: checkoutState.billingData.billingAddress,
                  sameAsShipping: checkoutState.billingData.sameAsShipping
                }}
                paymentInfo={{
                  method: checkoutState.paymentData.paymentMethod,
                  last4: checkoutState.paymentData.cardData?.cardNumber?.slice(-4),
                  brand: checkoutState.paymentData.cardData ? 'Visa' : undefined,
                  upiId: checkoutState.paymentData.upiData?.upiId,
                  bankName: checkoutState.paymentData.netBankingData?.bankCode,
                  walletName: checkoutState.paymentData.walletData?.walletProvider
                }}
                cartItems={cartItems.map(item => ({
                  id: item.id,
                  name: item.product.name,
                  image: item.product.media?.primaryImage?.url || item.product.media?.images?.[0]?.url,
                  quantity: item.quantity,
                  price: item.totalPrice.amount,
                  variant: item.variant ? `${item.variant.name}` : undefined
                }))}
                orderSummary={calculateOrderSummary()}
                onEdit={handleEdit}
                onPlaceOrder={handlePlaceOrder}
                isProcessing={isProcessing}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {checkoutState.currentStep !== 'review' && (
          <Card className="mt-6 p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  const currentIndex = getCurrentStepIndex();
                  if (currentIndex > 0) {
                    const previousStep = CHECKOUT_STEPS[currentIndex - 1];
                    navigateToStep(previousStep.id);
                  }
                }}
                disabled={getCurrentStepIndex() === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                Back
              </Button>

              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="text-gray-600"
                >
                  Cancel Checkout
                </Button>
              )}

              <div className="text-sm text-gray-600">
                Step {getCurrentStepIndex() + 1} of {CHECKOUT_STEPS.length}
              </div>
            </div>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Secure Checkout</h3>
              <p className="text-sm text-blue-700">
                Your information is encrypted and secure. We never share your data with third parties.
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                <Badge variant="secondary" className="bg-white">
                  🔒 SSL Encrypted
                </Badge>
                <Badge variant="secondary" className="bg-white">
                  ✓ PCI Compliant
                </Badge>
                <Badge variant="secondary" className="bg-white">
                  🛡️ Secure Payment
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GuestCheckout;
