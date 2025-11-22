/**
 * Cancel Order Page - Vardhman Mills
 * 
 * Order cancellation page with:
 * - Order details display
 * - Cancellation reason selection
 * - Refund information
 * - Cancellation policy
 * - Terms acceptance
 * 
 * @page
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Orders Components
import {
  OrderInfo,
  OrderItems,
} from '@/components/orders';

// Common Components
import {
  LoadingSpinner,
  SEOHead,
} from '@/components/common';

// UI Components
import { Container } from '@/components/ui/Container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks';

// Types
interface CancelOrderPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

interface CancelState {
  order: { 
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    items: Array<{
      id: string;
      name: string;
      image: string;
      quantity: number;
      price: number;
    }>;
  } | null;
  isLoading: boolean;
  isSubmitting: boolean;
  cancellationReason: string;
  customReason: string;
  agreeToTerms: boolean;
}

const CANCELLATION_REASONS = [
  { value: 'changed_mind', label: 'Changed My Mind' },
  { value: 'found_better_price', label: 'Found Better Price' },
  { value: 'ordered_by_mistake', label: 'Ordered by Mistake' },
  { value: 'delivery_delayed', label: 'Delivery Taking Too Long' },
  { value: 'wrong_product', label: 'Ordered Wrong Product' },
    { value: 'other', label: 'Other Reason' },
];

export default function CancelOrderPage({ params }: CancelOrderPageProps) {
  const resolvedParams = React.use(params);
  const { orderId } = resolvedParams;
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const userName = user?.firstName || user?.email?.split('@')[0] || 'User';

  // State
  const [state, setState] = useState<CancelState>({
    order: null,
    isLoading: true,
    isSubmitting: false,
    cancellationReason: '',
    customReason: '',
    agreeToTerms: false,
  });

  // Helper to convert local Order to cart.types.Order
  const convertToCartOrder = useCallback((order: CancelState['order']): import('@/types/cart.types').Order | null => {
    if (!order) return null;

    const mockAddress: import('@/types/common.types').Address = {
      id: 'addr-1',
      type: 'home',
      name: userName,
      address: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      phone: user?.phone || '+91 9876543210',
      email: user?.email || '',
      isDefault: true,
      deliveryInstructions: '',
    };

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: user?.id || 'user-1',
      user: {
        id: user?.id || 'user-1',
        firstName: user?.firstName || userName,
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
      } as import('@/types/user.types').User,
      items: order.items.map(item => ({
        id: item.id,
        orderId: order.id,
        productId: item.id,
        product: {
          id: item.id,
          name: item.name,
          slug: item.name.toLowerCase().replace(/\s+/g, '-'),
          images: [{ id: '1', url: item.image, alt: item.name, isPrimary: true }],
        } as unknown as import('@/types/product.types').Product,
        quantity: item.quantity,
        unitPrice: { amount: item.price, currency: 'INR', formatted: `₹${item.price}` },
        totalPrice: { amount: item.price * item.quantity, currency: 'INR', formatted: `₹${item.price * item.quantity}` },
        productSnapshot: {
          name: item.name,
          description: '',
          sku: `SKU-${item.id}`,
          image: item.image,
        },
      })) as import('@/types/cart.types').OrderItem[],
      subtotal: { amount: order.total, currency: 'INR', formatted: `₹${order.total}` },
      taxAmount: { amount: 0, currency: 'INR', formatted: '₹0' },
      shippingAmount: { amount: 0, currency: 'INR', formatted: '₹0' },
      discountAmount: { amount: 0, currency: 'INR', formatted: '₹0' },
      total: { amount: order.total, currency: 'INR', formatted: `₹${order.total}` },
      currency: 'INR' as import('@/types/common.types').Currency,
      status: order.status as import('@/types/cart.types').OrderStatus,
      paymentStatus: 'paid' as import('@/types/cart.types').PaymentStatus,
      fulfillmentStatus: 'pending' as import('@/types/cart.types').FulfillmentStatus,
      shippingAddress: mockAddress,
      billingAddress: mockAddress,
      shippingMethod: {
        id: 'ship-1',
        name: 'Standard Shipping',
        description: '5-7 business days',
        cost: { amount: 0, currency: 'INR', formatted: '₹0' },
        estimatedDays: 7,
      } as unknown as import('@/types/cart.types').ShippingMethod,
      paymentMethodId: 'pm-1',
      paymentMethod: 'card' as unknown as import('@/types/cart.types').PaymentMethod,
      appliedCoupons: [],
      appliedDiscounts: [],
      source: 'web' as const,
      channel: 'online' as const,
      placedAt: new Date().toISOString(),
      emailSent: false,
      smsSent: false,
      notifications: [],
      isReturnable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [user, userName]);

  // Convert order for components
  const convertedOrder = useMemo(() => convertToCartOrder(state.order), [state.order, convertToCartOrder]);

  // Load order
  const loadOrder = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockOrder = {
        id: orderId,
        orderNumber: `ORD-${orderId}`,
        status: 'processing',
        total: 5999,
        items: [
          {
            id: 'item-1',
            name: 'Premium Cotton Fabric',
            image: '/images/products/fabric-1.jpg',
            quantity: 2,
            price: 2999,
          },
        ],
      };

      setState(prev => ({
        ...prev,
        order: mockOrder,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Failed to load order:', err);
      toast({
        title: 'Error',
        description: 'Failed to load order details',
        variant: 'error',
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [orderId, toast]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Handlers
  const handleCancelOrder = useCallback(async () => {
    // Validation
    if (!state.cancellationReason) {
      toast({
        title: 'Validation Error',
        description: 'Please select a cancellation reason',
        variant: 'error',
      });
      return;
    }

    if (state.cancellationReason === 'other' && !state.customReason) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a reason for cancellation',
        variant: 'error',
      });
      return;
    }

    if (!state.agreeToTerms) {
      toast({
        title: 'Validation Error',
        description: 'Please agree to the cancellation terms',
        variant: 'error',
      });
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Order Cancelled',
        description: 'Your order has been cancelled successfully. Refund will be processed within 3-5 business days.',
        variant: 'success',
      });

      router.push('/account/orders');
    } catch (err) {
      console.error('Failed to cancel order:', err);
      toast({
        title: 'Error',
        description: 'Failed to cancel order',
        variant: 'error',
      });
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state, toast, router]);

  // Render
  if (state.isLoading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Container>
    );
  }

  if (!state.order) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Order not found</p>
          <Button onClick={() => router.push('/account/orders')}>
            Back to Orders
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <SEOHead
        title={`Cancel Order ${state.order.orderNumber} | Vardhman Mills`}
        description="Cancel your order"
        canonical={`/account/orders/${orderId}/cancel-order`}
      />

      <Container className="py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Cancel Order
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Order #{state.order.orderNumber}
          </p>
        </div>

        {/* Warning Alert */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Are you sure you want to cancel?
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Once cancelled, you will need to place a new order. Refund will be processed to your original payment method.
              </p>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <OrderInfo order={convertedOrder!} className="mb-6" />

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderItems order={convertedOrder!} />
          </CardContent>
        </Card>

        {/* Cancellation Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cancellation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cancellation Reason */}
            <div>
              <Label htmlFor="cancellationReason">Reason for Cancellation *</Label>
              <Select
                id="cancellationReason"
                value={state.cancellationReason}
                onValueChange={(value: string | number) => setState(prev => ({ ...prev, cancellationReason: String(value) }))}
                options={[
                  { value: '', label: 'Select a reason' },
                  ...CANCELLATION_REASONS
                ]}
                placeholder="Select a reason"
                className="mt-1"
              />
            </div>

            {/* Custom Reason */}
            {state.cancellationReason === 'other' && (
              <div>
                <Label htmlFor="customReason">Please specify the reason *</Label>
                <TextArea
                  id="customReason"
                  value={state.customReason}
                  onChange={(e) => setState(prev => ({ ...prev, customReason: e.target.value }))}
                  placeholder="Describe your reason for cancellation..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            )}

            {/* Refund Information */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Refund Information</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Full refund of ₹{state.order.total.toLocaleString()} will be processed</li>
                <li>• Refund will be credited to your original payment method</li>
                <li>• Processing time: 3-5 business days</li>
                <li>• You will receive an email confirmation once processed</li>
              </ul>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="agreeToTerms"
                checked={state.agreeToTerms}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setState(prev => ({ ...prev, agreeToTerms: e.target.checked }))
                }
              />
              <Label htmlFor="agreeToTerms" className="cursor-pointer">
                I understand that this order will be cancelled and I cannot undo this action
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={state.isSubmitting}
          >
            Go Back
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelOrder}
            disabled={state.isSubmitting}
          >
            {state.isSubmitting ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        </div>
      </Container>
    </>
  );
}
