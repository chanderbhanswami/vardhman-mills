/**
 * Checkout Confirmation Page - Vardhman Mills Frontend
 * 
 * Final order review and confirmation before payment with:
 * - Complete order summary
 * - Address verification
 * - Payment method display
 * - Terms and conditions
 * - Final price breakdown
 * - Edit capabilities
 * 
 * @route /checkout/confirmation
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  PencilIcon,
  TruckIcon,
  MapPinIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  InformationCircleIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  estimatedDays: string;
  price: number;
}

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  last4?: string;
}

interface OrderData {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: Address | null;
  billingAddress: Address | null;
  shippingMethod: ShippingMethod | null;
  paymentMethod: PaymentMethod | null;
  couponCode?: string;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Confirmation page content wrapper
 */
function ConfirmationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { clearCart } = useCart();
  
  const orderId = searchParams?.get('orderId');

  // State
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Load order data
   */
  useEffect(() => {
    const loadOrderData = async () => {
      setIsLoading(true);
      
      try {
        if (orderId) {
          // Load order from backend
          // const response = await orderApi.getOrder(orderId);
          // setOrderData(response.data);
          
          // Mock data
          setOrderData({
            id: orderId,
            items: [
              {
                id: '1',
                productId: 'prod_1',
                name: 'Premium Cotton Fabric',
                image: '/images/products/fabric-1.jpg',
                price: 499,
                quantity: 2,
                size: 'Standard',
                color: 'Blue',
              },
              {
                id: '2',
                productId: 'prod_2',
                name: 'Silk Blend Material',
                image: '/images/products/fabric-2.jpg',
                price: 899,
                quantity: 1,
                color: 'Red',
              },
            ],
            subtotal: 1897,
            shipping: 0,
            tax: 341.46,
            discount: 189.70,
            total: 2048.76,
            shippingAddress: {
              id: '1',
              fullName: 'John Doe',
              phone: '+91 9876543210',
              addressLine1: '123, Main Street',
              addressLine2: 'Near City Mall',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
              landmark: 'Opposite HDFC Bank',
            },
            billingAddress: {
              id: '1',
              fullName: 'John Doe',
              phone: '+91 9876543210',
              addressLine1: '123, Main Street',
              addressLine2: 'Near City Mall',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
            },
            shippingMethod: {
              id: 'standard',
              name: 'Standard Delivery',
              estimatedDays: '5-7 days',
              price: 0,
            },
            paymentMethod: {
              id: 'upi',
              type: 'upi',
              name: 'UPI Payment',
            },
            couponCode: 'SAVE10',
          });
        }
      } catch (error) {
        console.error('Error loading order data:', error);
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderData();
  }, [orderId]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle place order
   */
  const handlePlaceOrder = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to terms and conditions');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Place order through backend
      // const response = await orderApi.confirmOrder(orderId);
      
      // Simulate order placement
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear cart
      await clearCart();

      // Navigate to payment
      toast.success('Order confirmed! Proceed to payment.');
      router.push(`/checkout/payment?orderId=${orderId}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  /**
   * Handle edit section
   */
  const handleEdit = (section: 'cart' | 'shipping' | 'payment') => {
    if (section === 'cart') {
      router.push('/cart');
    } else if (section === 'shipping') {
      router.push(`/checkout/shipping?orderId=${orderId}`);
    } else if (section === 'payment') {
      router.push(`/checkout/payment?orderId=${orderId}`);
    }
  };

  /**
   * Handle back
   */
  const handleBack = () => {
    router.push(`/checkout/payment?orderId=${orderId}`);
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Button onClick={() => router.push('/checkout')}>
            Back to Checkout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8")}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="link" onClick={handleBack} className="mb-4">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Payment
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Confirm Your Order{user ? `, ${(user as unknown as { firstName?: string }).firstName || 'valued customer'}` : ''}
          </h1>
          <p className="text-gray-600 mt-1">
            Review your order details before proceeding to payment
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="mb-6">
          <InformationCircleIcon className="h-5 w-5" />
          <AlertDescription>
            <strong>Please review your order carefully</strong>
            <p className="mt-1 text-sm text-gray-600">
              Once you proceed to payment, these details cannot be changed. 
              Make sure all information is correct.
            </p>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingBagIcon className="h-6 w-6 text-gray-600" />
                  Order Items ({orderData.items.length})
                </h2>
                <Button variant="link" size="sm" onClick={() => handleEdit('cart')}>
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>

              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 pb-4 border-b last:border-0"
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        Image
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      {item.size && (
                        <p className="text-sm text-gray-600">Size: {item.size}</p>
                      )}
                      {item.color && (
                        <p className="text-sm text-gray-600">Color: {item.color}</p>
                      )}
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MapPinIcon className="h-6 w-6 text-gray-600" />
                  Shipping Address
                </h2>
                <Button variant="link" size="sm" onClick={() => handleEdit('shipping')}>
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>

              {orderData.shippingAddress && (
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">
                    {orderData.shippingAddress.fullName}
                  </p>
                  <p className="text-gray-700">
                    {orderData.shippingAddress.addressLine1}
                    {orderData.shippingAddress.addressLine2 && `, ${orderData.shippingAddress.addressLine2}`}
                  </p>
                  <p className="text-gray-700">
                    {orderData.shippingAddress.city}, {orderData.shippingAddress.state} - {orderData.shippingAddress.pincode}
                  </p>
                  {orderData.shippingAddress.landmark && (
                    <p className="text-gray-600 text-sm">
                      Landmark: {orderData.shippingAddress.landmark}
                    </p>
                  )}
                  <p className="text-gray-700 mt-2">
                    Phone: {orderData.shippingAddress.phone}
                  </p>
                </div>
              )}
            </Card>

            {/* Shipping Method */}
            {orderData.shippingMethod && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <TruckIcon className="h-6 w-6 text-gray-600" />
                  Shipping Method
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {orderData.shippingMethod.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Estimated delivery: {orderData.shippingMethod.estimatedDays}
                    </p>
                  </div>
                  <Badge variant="default">
                    {orderData.shippingMethod.price === 0
                      ? 'FREE'
                      : formatCurrency(orderData.shippingMethod.price)}
                  </Badge>
                </div>
              </Card>
            )}

            {/* Payment Method */}
            {orderData.paymentMethod && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <CreditCardIcon className="h-6 w-6 text-gray-600" />
                    Payment Method
                  </h2>
                  <Button variant="link" size="sm" onClick={() => handleEdit('payment')}>
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Change
                  </Button>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {orderData.paymentMethod.name}
                  </p>
                  {orderData.paymentMethod.last4 && (
                    <p className="text-sm text-gray-600">
                      Card ending in {orderData.paymentMethod.last4}
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Terms and Conditions */}
            <Card className="p-6 bg-gray-50">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 text-primary-600"
                />
                <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                  I agree to the{' '}
                  <a href="/terms" className="text-primary-600 hover:underline">
                    Terms and Conditions
                  </a>
                  ,{' '}
                  <a href="/privacy" className="text-primary-600 hover:underline">
                    Privacy Policy
                  </a>
                  , and{' '}
                  <a href="/return-policy" className="text-primary-600 hover:underline">
                    Return Policy
                  </a>
                  . I understand that my order details are correct and cannot be changed after payment.
                </label>
              </div>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>
              
              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({orderData.items.length} items)</span>
                  <span>{formatCurrency(orderData.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>
                    {orderData.shipping === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      formatCurrency(orderData.shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (GST 18%)</span>
                  <span>{formatCurrency(orderData.tax)}</span>
                </div>
                {orderData.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <TagIcon className="h-4 w-4" />
                      Discount {orderData.couponCode && `(${orderData.couponCode})`}
                    </span>
                    <span>-{formatCurrency(orderData.discount)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                  <span>Total Amount</span>
                  <span>{formatCurrency(orderData.total)}</span>
                </div>

                {/* Place Order Button */}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={!agreedToTerms || isPlacingOrder}
                  size="lg"
                  className="w-full mb-4"
                >
                  {isPlacingOrder ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="h-5 w-5 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </Button>

                {/* Security Badges */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LockClosedIcon className="h-4 w-4 text-green-600" />
                    <span>SSL Encrypted</span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Free Returns & Exchanges
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Return within 30 days for a full refund
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CheckoutConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ConfirmationPageContent />
    </Suspense>
  );
}
