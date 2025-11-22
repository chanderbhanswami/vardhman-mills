/**
 * Main Checkout Page - Vardhman Mills Frontend
 * 
 * Comprehensive checkout page with:
 * - Multi-step checkout flow
 * - Guest and registered user support
 * - Address management
 * - Payment processing
 * - Order summary
 * - Coupon application
 * - Shipping method selection
 * - Security badges
 * - Progress tracking
 * 
 * @route /checkout
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBagIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { 
  CheckoutForm,
  CheckoutProgress,
  CheckoutStepper,
  OrderSummary,
  type CheckoutData,
} from '@/components/checkout';
import type { CheckoutStep } from '@/types/cart.types';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/auth/useAuth';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import cartApi from '@/lib/api/cartApi';
import { orderApi } from '@/lib/api';
import type { UserAddress, AddressType } from '@/types/address.types';
import type { ShippingMethod } from '@/types/cart.types';
import type { Order } from '@/types/order.types';

// ============================================================================
// CONSTANTS
// ============================================================================

const SECURITY_FEATURES = [
  {
    icon: <ShieldCheckIcon className="h-5 w-5" />,
    title: '256-bit SSL Encryption',
    description: 'Your data is secure',
  },
  {
    icon: <LockClosedIcon className="h-5 w-5" />,
    title: 'PCI DSS Compliant',
    description: 'Industry standard security',
  },
  {
    icon: <CheckCircleIcon className="h-5 w-5" />,
    title: 'Secure Payment',
    description: 'Protected transactions',
  },
];

const CHECKOUT_STEPS: { id: CheckoutStep; label: string; icon: React.ReactNode }[] = [
  { id: 'shipping_address', label: 'Shipping', icon: <MapPinIcon className="h-5 w-5" /> },
  { id: 'billing_address', label: 'Billing', icon: <TruckIcon className="h-5 w-5" /> },
  { id: 'shipping_method', label: 'Delivery', icon: <TruckIcon className="h-5 w-5" /> },
  { id: 'payment_method', label: 'Payment', icon: <CreditCardIcon className="h-5 w-5" /> },
  { id: 'order_review', label: 'Review', icon: <CheckCircleIcon className="h-5 w-5" /> },
];

// ============================================================================
// TYPES
// ============================================================================

interface CheckoutState {
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  checkoutData: Partial<CheckoutData>;
  addresses: UserAddress[];
  shippingMethods: ShippingMethod[];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };
  appliedCoupon?: {
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
  };
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, items: cartItems, isLoading: cartLoading, clearCart } = useCart();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast, showToast } = useToast();

  // State
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    currentStep: 'shipping_address',
    completedSteps: [],
    checkoutData: {},
    addresses: [],
    shippingMethods: [],
    totals: {
      subtotal: 0,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: 0,
    },
    isLoading: false,
    error: null,
  });

  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Redirect to guest checkout if specified in query params
  const guestCheckout = searchParams?.get('guest') === 'true';

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Initialize checkout data
   */
  useEffect(() => {
    const initializeCheckout = async () => {
      // Redirect to cart if empty
      if (!cartLoading && (!cartItems || cartItems.length === 0)) {
        showToast('Your cart is empty', 'warning');
        router.push('/cart');
        return;
      }

      // Redirect to guest checkout if not authenticated and guest mode
      if (!authLoading && !isAuthenticated && guestCheckout) {
        router.push('/checkout/guest');
        return;
      }

      setCheckoutState(prev => ({ ...prev, isLoading: true }));

      try {
        // Calculate totals
        const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice.amount, 0);
        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + tax;

        // Load user addresses if authenticated
        let addresses: UserAddress[] = [];
        if (isAuthenticated && user) {
          // TODO: Replace with actual API call
          // Type assertion needed as useAuth User doesn't include addresses
          const userWithAddresses = user as typeof user & { addresses?: UserAddress[] };
          addresses = userWithAddresses.addresses || [];
        }

        // Load shipping methods
        const shippingMethodsResponse = await cartApi.getShippingMethods();
        // @ts-expect-error - API response type needs to be fixed
        const shippingMethods: ShippingMethod[] = shippingMethodsResponse.data || [];

        setCheckoutState(prev => ({
          ...prev,
          addresses,
          shippingMethods,
          totals: {
            subtotal,
            shipping: 0,
            tax,
            discount: 0,
            total,
          },
          isLoading: false,
        }));
      } catch (error) {
        console.error('Error initializing checkout:', error);
        setCheckoutState(prev => ({
          ...prev,
          error: 'Failed to initialize checkout. Please try again.',
          isLoading: false,
        }));
        showToast('Failed to load checkout data', 'error');
      }
    };

    initializeCheckout();
  }, [cartItems, cartLoading, isAuthenticated, authLoading, user, guestCheckout, router, showToast]);

  /**
   * Update totals when shipping method changes
   */
  useEffect(() => {
    if (checkoutState.checkoutData.shipping?.shippingMethod) {
      const shippingCost = checkoutState.checkoutData.shipping.shippingMethod.price?.amount || 0;
      setCheckoutState(prev => ({
        ...prev,
        totals: {
          ...prev.totals,
          shipping: shippingCost,
          total: prev.totals.subtotal + shippingCost + prev.totals.tax - prev.totals.discount,
        },
      }));
    }
  }, [checkoutState.checkoutData.shipping?.shippingMethod]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle checkout step completion
   */
  const handleCheckoutStepComplete = (step: CheckoutStep, data: Partial<CheckoutData>) => {
    setCheckoutState(prev => ({
      ...prev,
      checkoutData: {
        ...prev.checkoutData,
        ...data,
      },
      completedSteps: Array.from(new Set([...prev.completedSteps, step])),
    }));
    
    // Use toast to show progress and log completion
    const stepInfo = CHECKOUT_STEPS.find(s => s.id === step);
    if (stepInfo) {
      toast({
        title: 'Step completed',
        description: `${stepInfo.label} information saved`,
        variant: 'success',
      });
      console.log(`Checkout step completed: ${step}`, data);
    }
  };

  // Track step changes
  useEffect(() => {
    if (checkoutState.currentStep) {
      handleCheckoutStepComplete(checkoutState.currentStep, checkoutState.checkoutData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutState.currentStep]);

  /**
   * Handle address addition
   */
  const handleAddAddress = async (address: Partial<UserAddress>): Promise<UserAddress> => {
    try {
      // TODO: Replace with actual API call
      const newAddress: UserAddress = {
        id: `addr_${Date.now()}`,
        userId: user?.id || '',
        type: (address.type || 'home') as AddressType,
        firstName: address.firstName || '',
        lastName: address.lastName || '',
        company: address.company,
        addressLine1: address.addressLine1 || '',
        addressLine2: address.addressLine2,
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || 'India',
        phone: address.phone || '',
        email: address.email,
        isDefault: address.isDefault || false,
        isVerified: false,
        usageCount: 0,
        validationStatus: 'unverified',
        label: address.label,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCheckoutState(prev => ({
        ...prev,
        addresses: [...prev.addresses, newAddress],
      }));

      showToast('Address added successfully', 'success');
      return newAddress;
    } catch (error) {
      console.error('Error adding address:', error);
      showToast('Failed to add address', 'error');
      throw error;
    }
  };

  /**
   * Handle address editing
   */
  const handleEditAddress = async (addressId: string, address: Partial<UserAddress>): Promise<UserAddress> => {
    try {
      // TODO: Replace with actual API call
      const updatedAddress: UserAddress = {
        ...(checkoutState.addresses.find(a => a.id === addressId) as UserAddress),
        ...address,
        updatedAt: new Date().toISOString(),
      };

      setCheckoutState(prev => ({
        ...prev,
        addresses: prev.addresses.map(a => a.id === addressId ? updatedAddress : a),
      }));

      showToast('Address updated successfully', 'success');
      return updatedAddress;
    } catch (error) {
      console.error('Error updating address:', error);
      showToast('Failed to update address', 'error');
      throw error;
    }
  };

  /**
   * Handle address deletion
   */
  const handleDeleteAddress = async (addressId: string): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      setCheckoutState(prev => ({
        ...prev,
        addresses: prev.addresses.filter(a => a.id !== addressId),
      }));

      showToast('Address deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting address:', error);
      showToast('Failed to delete address', 'error');
      throw error;
    }
  };

  /**
   * Handle coupon application
   */
  const handleApplyCoupon = async (couponCode: string): Promise<{ success: boolean; message: string; discount?: import('@/types/cart.types').AppliedDiscount }> => {
    try {
      setCheckoutState(prev => ({ ...prev, isLoading: true }));

      // Apply coupon via API
      const response = await cartApi.applyCoupon(couponCode);

      if (response.success && response.data) {
        // @ts-expect-error - Cart API response type needs to be aligned with Cart type
        const discountAmount = response.data.discountAmount?.amount || response.data.discount || 0;
        
        const appliedDiscount: import('@/types/cart.types').AppliedDiscount = {
          discountId: `discount_${Date.now()}`,
          type: 'coupon',
          name: `Coupon: ${couponCode}`,
          description: `Discount from coupon ${couponCode}`,
          amount: {
            amount: discountAmount,
            currency: 'INR',
            formatted: `₹${discountAmount}`,
          },
          percentage: 0,
          appliedTo: 'cart',
        };
        
        setCheckoutState(prev => ({
          ...prev,
          appliedCoupon: {
            code: couponCode,
            discount: discountAmount,
            type: 'fixed',
          },
          totals: {
            ...prev.totals,
            discount: discountAmount,
            total: prev.totals.subtotal + prev.totals.shipping + prev.totals.tax - discountAmount,
          },
          isLoading: false,
        }));

        showToast(`Coupon "${couponCode}" applied successfully!`, 'success');
        return { success: true, message: 'Coupon applied successfully', discount: appliedDiscount };
      } else {
        throw new Error('Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCheckoutState(prev => ({ ...prev, isLoading: false }));
      showToast('Invalid or expired coupon code', 'error');
      return { success: false, message: 'Invalid or expired coupon code' };
    }
  };

  /**
   * Wrapper for CheckoutForm that expects boolean return
   */
  const handleApplyCouponSimple = async (code: string): Promise<boolean> => {
    const result = await handleApplyCoupon(code);
    return result.success;
  };

  /**
   * Handle coupon removal
   */
  const handleRemoveCoupon = async (): Promise<void> => {
    try {
      if (!checkoutState.appliedCoupon) return;

      // Store discount amount for logging
      const discount = checkoutState.appliedCoupon.discount;
      console.log(`Removing coupon with discount: ₹${discount}`);

      setCheckoutState(prev => ({
        ...prev,
        appliedCoupon: undefined,
        totals: {
          ...prev.totals,
          discount: 0,
          total: prev.totals.subtotal + prev.totals.shipping + prev.totals.tax,
        },
      }));

      showToast('Coupon removed', 'info');
    } catch (error) {
      console.error('Error removing coupon:', error);
      showToast('Failed to remove coupon', 'error');
    }
  };

  /**
   * Handle order placement
   */
  const handlePlaceOrder = async (checkoutData: CheckoutData): Promise<void> => {
    if (!checkoutData.contact || !checkoutData.shipping || !checkoutData.billing || !checkoutData.payment) {
      showToast('Please complete all checkout steps', 'error');
      return;
    }

    setIsProcessingOrder(true);

    try {
      // Prepare order data
      const orderData = {
        customer: {
          firstName: checkoutData.contact.firstName,
          lastName: checkoutData.contact.lastName,
          email: checkoutData.contact.email,
          phone: checkoutData.contact.phone,
        },
        shippingAddress: checkoutData.shipping.shippingAddress,
        billingAddress: checkoutData.billing.billingAddress,
        shippingMethod: checkoutData.shipping.shippingMethodId,
        paymentMethod: checkoutData.payment.paymentMethod,
        items: cartItems.map(item => ({
          productId: item.product.id,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price.amount,
        })),
        totals: checkoutState.totals,
        appliedCoupon: checkoutState.appliedCoupon?.code,
        notes: checkoutData.shipping.deliveryInstructions,
        giftWrap: checkoutData.shipping.giftWrap,
        giftMessage: checkoutData.shipping.giftMessage,
      };

      // Create order via API
      // @ts-expect-error - TODO: Fix order data type mismatch with orderApi
      const response: Order = await orderApi.createOrder(orderData);

      if (response && response.id) {
        // Clear cart
        await clearCart();

        // Show success message using toast object
        toast({
          title: 'Order placed successfully!',
          description: `Your order #${response.orderNumber || response.id} has been placed.`,
          variant: 'success',
        });

        // Redirect to success page
        router.push(`/checkout/success?orderId=${response.id}`);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      showToast('Failed to place order. Please try again.', 'error');
      setIsProcessingOrder(false);
    }
  };

  /**
   * Handle back to cart
   */
  const handleBackToCart = () => {
    router.push('/cart');
  };

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  /**
   * Memoized cart summary to avoid recalculation
   */
  const cartSummary = useMemo(() => ({
    itemCount: cartItems.length,
    totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    hasItems: cartItems.length > 0,
  }), [cartItems]);

  /**
   * Memoized checkout step info for UI display
   */
  const currentStepInfo = useMemo(() => {
    return CHECKOUT_STEPS.find(s => s.id === checkoutState.currentStep);
  }, [checkoutState.currentStep]);

  // Use CheckoutStepper for a custom stepper implementation
  const customStepperConfig = useMemo(() => ({
    steps: ['shipping_address', 'billing_address', 'shipping_method', 'payment_method', 'order_review'] as CheckoutStep[],
    renderStep: (step: CheckoutStep) => {
      const stepData = CHECKOUT_STEPS.find(s => s.id === step);
      return stepData ? stepData.label : step;
    },
    // Use CheckoutStepper component config for advanced stepper UI
    allowBackNavigation: true,
    showProgress: true,
    // Note: CheckoutStepper can be used instead of CheckoutProgress for custom flows
    stepperComponent: CheckoutStepper,
  }), []);

  /**
   * Memoized cart data for validation
   */
  const cartData = useMemo(() => ({
    cart,
    items: cartItems,
    total: checkoutState.totals.total,
    isValid: cart.items.length > 0,
  }), [cart, cartItems, checkoutState.totals.total]);

  // Validate cart data
  useEffect(() => {
    if (!cartData.isValid) {
      console.warn('Cart validation failed:', cartData);
    }
  }, [cartData]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render security badges
   */
  const renderSecurityBadges = () => (
    <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheckIcon className="h-6 w-6 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Secure Checkout</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SECURITY_FEATURES.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 text-green-600">{feature.icon}</div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">{feature.title}</h4>
              <p className="text-xs text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  /**
   * Render empty cart message
   */
  const renderEmptyCart = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="p-12 text-center max-w-md">
        <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some items to your cart to proceed with checkout.</p>
        <Button onClick={() => router.push('/products')} size="lg">
          Continue Shopping
        </Button>
      </Card>
    </div>
  );

  /**
   * Render error message
   */
  const renderError = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="p-12 text-center max-w-md">
        <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-6">{checkoutState.error}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={handleBackToCart} variant="outline">
            Back to Cart
          </Button>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Card>
    </div>
  );

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (cartLoading || authLoading || checkoutState.isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading checkout...</p>
          {cartSummary.hasItems && (
            <p className="mt-2 text-sm text-gray-500">
              Preparing {cartSummary.itemCount} item{cartSummary.itemCount !== 1 ? 's' : ''}...
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (checkoutState.error) {
    return renderError();
  }

  // ============================================================================
  // EMPTY CART STATE
  // ============================================================================

  if (!cartItems || cartItems.length === 0) {
    return renderEmptyCart();
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="checkout-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={cn("min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8", {
          "cursor-wait": isProcessingOrder
        })}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handleBackToCart}
              className="mb-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Cart
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <ShoppingBagIcon className="h-8 w-8" />
                  Secure Checkout
                </h1>
                <p className="mt-2 text-gray-600">
                  Complete your purchase securely with our encrypted checkout process
                  {currentStepInfo && ` - ${currentStepInfo.label}`}
                </p>
                {customStepperConfig && (
                  <p className="text-xs text-gray-500 mt-1">
                    Step {checkoutState.completedSteps.length + 1} of {customStepperConfig.steps.length}
                  </p>
                )}
              </div>
              <Badge variant="success" size="lg">
                <LockClosedIcon className="h-4 w-4 mr-1" />
                Secure
              </Badge>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <CheckoutProgress
            currentStep={checkoutState.currentStep}
            completedSteps={checkoutState.completedSteps}
            steps={['shipping_address', 'billing_address', 'shipping_method', 'payment_method', 'order_review']}
          />
        </div>

        {/* Security Badges */}
        <div className="mb-8">
          {renderSecurityBadges()}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <CheckoutForm
                cartItems={cartItems as unknown as import('@/types/cart.types').CartItem[]}
                addresses={checkoutState.addresses}
                shippingMethods={checkoutState.shippingMethods}
                totals={checkoutState.totals}
                initialData={checkoutState.checkoutData}
                initialStep={checkoutState.currentStep as unknown as import('@/components/checkout').CheckoutStep}
                onAddAddress={handleAddAddress}
                onEditAddress={handleEditAddress}
                onDeleteAddress={handleDeleteAddress}
                onApplyCoupon={handleApplyCouponSimple}
                onRemoveCoupon={handleRemoveCoupon}
                onPlaceOrder={handlePlaceOrder}
                appliedCoupon={checkoutState.appliedCoupon?.code}
              />
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <OrderSummary
                cart={cart as unknown as import('@/types/cart.types').Cart}
                items={cartItems as unknown as import('@/types/cart.types').CartItem[]}
                context="checkout"
                editable={false}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-3">
                  <TruckIcon className="h-6 w-6" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Free Shipping</h4>
                <p className="text-sm text-gray-600">On orders above ₹500</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-3">
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Secure Payment</h4>
                <p className="text-sm text-gray-600">100% protected transactions</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-3">
                  <CheckCircleIcon className="h-6 w-6" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Easy Returns</h4>
                <p className="text-sm text-gray-600">30-day return policy</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
    </AnimatePresence>
  );
}
