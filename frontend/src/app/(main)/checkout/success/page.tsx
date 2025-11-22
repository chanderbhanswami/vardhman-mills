/**
 * Checkout Success Page - Vardhman Mills Frontend
 * 
 * Order confirmation page with:
 * - Order summary
 * - Order tracking information
 * - Download invoice
 * - Email confirmation
 * - Next steps
 * - Related products
 * - Social sharing
 * 
 * @route /checkout/success
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  EnvelopeIcon,
  TruckIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  CalendarIcon,
  MapPinIcon,
  CreditCardIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { OrderConfirmation } from '@/components/checkout';
import { ProductGrid } from '@/components/products';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { orderApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import type { Order } from '@/types/order.types';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Success page content wrapper
 */
function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');

  // State
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Load order details
   */
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError('Order ID not found');
        setIsLoading(false);
        return;
      }

      try {
        const order = await orderApi.getOrder(orderId);
        
        if (order) {
          setOrder(order as unknown as Order);
          setEmailSent(true);
        } else {
          throw new Error('Order not found');
        }
      } catch (err) {
        console.error('Error loading order:', err);
        setError('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle download invoice
   */
  const handleDownloadInvoice = async () => {
    if (!order) return;

    try {
      toast.success('Downloading invoice...');
      // TODO: Implement invoice download
      // await orderApi.downloadInvoice(order.id);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  /**
   * Handle print order
   */
  const handlePrintOrder = () => {
    window.print();
  };

  /**
   * Handle share order
   */
  const handleShareOrder = async () => {
    if (!order) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Order #${order.orderNumber}`,
          text: `Check out my order from Vardhman Mills!`,
          url: window.location.href,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Order link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing order:', error);
    }
  };

  /**
   * Handle track order
   */
  const handleTrackOrder = () => {
    if (order) {
      router.push(`/account/orders/${order.id}`);
    }
  };

  /**
   * Handle continue shopping
   */
  const handleContinueShopping = () => {
    router.push('/products');
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="p-12 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <InformationCircleIcon className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'We couldn\'t find your order. Please check your email for order confirmation.'}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/account/orders')} variant="outline">
              View My Orders
            </Button>
            <Button onClick={handleContinueShopping}>
              Continue Shopping
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // SUCCESS RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-4"
          >
            <CheckCircleIcon className="h-12 w-12" />
          </motion.div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Thank you for your purchase, {order.user?.firstName || 'valued customer'}!
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="success" size="lg">
              Order #{order.orderNumber}
            </Badge>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              {formatDate(order.createdAt)}
            </span>
          </div>
        </motion.div>

        {/* Email Confirmation Alert */}
        {emailSent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <EnvelopeIcon className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Confirmation email sent!</strong> We&apos;ve sent order details to{' '}
                <span className="font-medium">{order.user?.email || 'your email'}</span>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Quick Actions */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex-col h-auto py-4"
              onClick={handleTrackOrder}
            >
              <TruckIcon className="h-6 w-6 mb-2" />
              <span className="text-sm">Track Order</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-4"
              onClick={handleDownloadInvoice}
            >
              <DocumentArrowDownIcon className="h-6 w-6 mb-2" />
              <span className="text-sm">Download Invoice</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-4"
              onClick={handlePrintOrder}
            >
              <PrinterIcon className="h-6 w-6 mb-2" />
              <span className="text-sm">Print Order</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-4"
              onClick={handleShareOrder}
            >
              <ShareIcon className="h-6 w-6 mb-2" />
              <span className="text-sm">Share</span>
            </Button>
          </div>
        </Card>

        {/* Order Summary */}
        <Card className={cn("p-6 mb-6", "print:shadow-none")}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ShoppingBagIcon className="h-6 w-6 text-primary-600" />
            Order Summary
          </h2>
          
          <OrderConfirmation
            order={order}
            onDownloadInvoice={handleDownloadInvoice}
            onPrint={handlePrintOrder}
            onShare={handleShareOrder}
            onTrackOrder={handleTrackOrder}
            onContinueShopping={handleContinueShopping}
          />
        </Card>

        {/* Delivery Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-gray-600" />
              Delivery Address
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">
                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
              </p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                {order.shippingAddress?.postalCode}
              </p>
              <p className="flex items-center gap-1 mt-2">
                <PhoneIcon className="h-4 w-4" />
                {order.shippingAddress?.phone}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5 text-gray-600" />
              Payment Information
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium text-gray-900">
                  {order.paymentMethod?.type || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <Badge
                  variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                  size="sm"
                >
                  {order.paymentStatus}
                </Badge>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-medium">Total Paid:</span>
                <span className="font-bold text-lg text-gray-900">
                  {formatCurrency(order.total?.amount || 0)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* What's Next */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-600" />
            What Happens Next?
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Order Confirmation
                </h4>
                <p className="text-sm text-gray-600">
                  You&apos;ll receive an email confirmation with your order details.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Order Processing
                </h4>
                <p className="text-sm text-gray-600">
                  We&apos;ll prepare your order for shipment within 1-2 business days.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Shipment & Delivery
                </h4>
                <p className="text-sm text-gray-600">
                  Once shipped, you&apos;ll receive tracking information. Estimated delivery:{' '}
                  <span className="font-medium text-gray-900">
                    5-7 business days
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Continue Shopping */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => router.push('/account/orders')}
            variant="outline"
            size="lg"
          >
            View All Orders
          </Button>
          <Button
            onClick={handleContinueShopping}
            size="lg"
          >
            Continue Shopping
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Button>
        </div>

        {/* Help Section */}
        <Card className="p-6 mt-8 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Need Help?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full mb-3">
                <EnvelopeIcon className="h-6 w-6 text-gray-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Email Support</h4>
              <p className="text-sm text-gray-600">support@vardhmanmills.com</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full mb-3">
                <PhoneIcon className="h-6 w-6 text-gray-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Phone Support</h4>
              <p className="text-sm text-gray-600">+91 1234567890</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full mb-3">
                <InformationCircleIcon className="h-6 w-6 text-gray-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Help Center</h4>
              <Button variant="link" onClick={() => router.push('/help')}>
                Visit Help Center
              </Button>
            </div>
          </div>
        </Card>

        {/* Related Products - using ProductGrid */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h3>
          <ProductGrid
            products={[]}
            isLoading={false}
            onProductClick={(productId) => router.push(`/products/${productId}`)}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
