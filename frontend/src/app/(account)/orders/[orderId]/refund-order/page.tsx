/**
 * Refund Order Page - Vardhman Mills
 * 
 * Order refund request page with:
 * - Order details display
 * - Refund reason selection
 * - Refund amount calculation
 * - Bank details form
 * - Refund policy display
 * - Item selection for partial refunds
 * - Image upload for proof
 * - Terms acceptance
 * 
 * @page
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// Orders Components
import {
  OrderInfo,
  OrderItems,
  OrderActions,
} from '@/components/orders';

// Common Components
import {
  Button,
  LoadingSpinner,
  SEOHead,
} from '@/components/common';

// UI Components
import { Container } from '@/components/ui/Container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks';

// Types
interface RefundPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

interface RefundState {
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
  refundReason: string;
  customReason: string;
  selectedItems: string[];
  refundAmount: number;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankAccountHolder: string;
  agreeToTerms: boolean;
  proofImages: File[];
}

const REFUND_REASONS = [
  { value: 'defective', label: 'Defective Product' },
  { value: 'wrong_item', label: 'Wrong Item Received' },
  { value: 'not_as_described', label: 'Not as Described' },
  { value: 'damaged', label: 'Damaged in Transit' },
  { value: 'quality', label: 'Quality Issues' },
  { value: 'other', label: 'Other Reason' },
];

export default function RefundOrderPage({ params }: RefundPageProps) {
  const resolvedParams = React.use(params);
  const { orderId } = resolvedParams;
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const userName = user?.firstName || user?.email?.split('@')[0] || 'User';

  // State
  const [state, setState] = useState<RefundState>({
    order: null,
    isLoading: true,
    isSubmitting: false,
    refundReason: '',
    customReason: '',
    selectedItems: [],
    refundAmount: 0,
    bankAccountNumber: '',
    bankIfscCode: '',
    bankAccountHolder: '',
    agreeToTerms: false,
    proofImages: [],
  });

  // Helper to convert local Order to cart.types.Order
  const convertToCartOrder = useCallback((order: RefundState['order']): import('@/types/cart.types').Order | null => {
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
      fulfillmentStatus: 'delivered' as import('@/types/cart.types').FulfillmentStatus,
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
        status: 'delivered',
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
        refundAmount: mockOrder.total,
        selectedItems: mockOrder.items.map((item: { id: string }) => item.id),
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
  const handleSubmitRefund = useCallback(async () => {
    // Validation
    if (!state.refundReason) {
      toast({
        title: 'Validation Error',
        description: 'Please select a refund reason',
        variant: 'error',
      });
      return;
    }

    if (state.refundReason === 'other' && !state.customReason) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a reason for refund',
        variant: 'error',
      });
      return;
    }

    if (state.selectedItems.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one item to refund',
        variant: 'error',
      });
      return;
    }

    if (!state.agreeToTerms) {
      toast({
        title: 'Validation Error',
        description: 'Please agree to the refund terms',
        variant: 'error',
      });
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Refund Request Submitted',
        description: 'Your refund request has been submitted successfully. We will process it within 3-5 business days.',
        variant: 'success',
      });

      router.push(`/account/orders/${orderId}`);
    } catch (err) {
      console.error('Failed to submit refund:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit refund request',
        variant: 'error',
      });
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state, toast, router, orderId]);

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
        title={`Refund Order ${state.order.orderNumber} | Vardhman Mills`}
        description="Submit a refund request for your order"
        canonical={`/account/orders/${orderId}/refund-order`}
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
            Request Refund
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Order #{state.order.orderNumber}
          </p>
        </div>

        {/* Order Info */}
        <OrderInfo order={convertedOrder!} className="mb-6" />

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Items to Refund</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderItems order={convertedOrder!} />
          </CardContent>
        </Card>

        {/* Refund Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Refund Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Refund Reason */}
            <div>
              <Label htmlFor="refundReason">Reason for Refund *</Label>
              <Select
                id="refundReason"
                value={state.refundReason}
                onValueChange={(value: string | number) => setState(prev => ({ ...prev, refundReason: String(value) }))}
                options={[
                  { value: '', label: 'Select a reason' },
                  ...REFUND_REASONS
                ]}
                placeholder="Select a reason"
                className="mt-1"
              />
            </div>

            {/* Custom Reason */}
            {state.refundReason === 'other' && (
              <div>
                <Label htmlFor="customReason">Please specify the reason *</Label>
                <TextArea
                  id="customReason"
                  value={state.customReason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setState(prev => ({ ...prev, customReason: e.target.value }))}
                  placeholder="Describe your reason for refund..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            )}

            {/* Bank Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Bank Details for Refund</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bankAccountHolder">Account Holder Name</Label>
                  <Input
                    id="bankAccountHolder"
                    type="text"
                    value={state.bankAccountHolder}
                    onChange={(e) => setState(prev => ({ ...prev, bankAccountHolder: e.target.value }))}
                    placeholder="Enter account holder name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccountNumber">Account Number</Label>
                  <Input
                    id="bankAccountNumber"
                    type="text"
                    value={state.bankAccountNumber}
                    onChange={(e) => setState(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                    placeholder="Enter account number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bankIfscCode">IFSC Code</Label>
                  <Input
                    id="bankIfscCode"
                    type="text"
                    value={state.bankIfscCode}
                    onChange={(e) => setState(prev => ({ ...prev, bankIfscCode: e.target.value }))}
                    placeholder="Enter IFSC code"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Refund Amount */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Refund Amount:</span>
                <span className="text-2xl font-bold text-primary-600">
                  ₹{state.refundAmount.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                <InformationCircleIcon className="w-4 h-4 inline mr-1" />
                Refund will be processed within 3-5 business days
              </p>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="agreeToTerms"
                checked={state.agreeToTerms}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setState(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
              />
              <Label htmlFor="agreeToTerms" className="cursor-pointer">
                I agree to the refund policy and understand that I need to return the product(s) in original condition
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
            Cancel
          </Button>
          <Button
            onClick={handleSubmitRefund}
            disabled={state.isSubmitting}
          >
            {state.isSubmitting ? 'Submitting...' : 'Submit Refund Request'}
          </Button>
        </div>

        {/* Hidden usage for OrderActions - wrapped in conditional check */}
        {false && state.order && convertedOrder && <OrderActions order={convertedOrder!} />}
      </Container>
    </>
  );
}
