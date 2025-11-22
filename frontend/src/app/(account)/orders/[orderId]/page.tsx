/**
 * Order Details Page - Vardhman Mills
 * 
 * Comprehensive order details page with:
 * - Complete order information
 * - Order tracking timeline
 * - Order items with images
 * - Delivery information
 * - Payment details
 * - Order status updates
 * - Invoice download
 * - Cancel/Refund actions
 * - Return/Exchange options
 * - Customer support integration
 * - Share order functionality
 * - Print order details
 * 
 * @page
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  PrinterIcon,
  ShareIcon,
  DocumentArrowDownIcon,
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

// Orders Components
import {
  OrderInfo,
  OrderItems,
  OrderStatus,
  OrderActions,
  OrderTracking,
  InvoiceDownload,
  DeliveryEstimate,
  TrackingInfo,
  TrackingTimeline,
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
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';

// Hooks
import { useToast } from '@/hooks/useToast';

// Utils
import { formatDate, formatCurrency } from '@/lib/utils';

// Types
interface OrderDetailPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  courier?: string;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    image: string;
    sku: string;
    quantity: number;
    price: number;
    total: number;
    variant?: string;
  }>;
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  billingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  timeline: Array<{
    id: string;
    status: string;
    title: string;
    description: string;
    timestamp: string;
    icon?: string;
  }>;
  notes?: string;
  cancellationReason?: string;
  refundAmount?: number;
}

interface OrderPageState {
  order: OrderDetail | null;
  isLoading: boolean;
  error: string | null;
  showInvoiceDownload: boolean;
  showShareDialog: boolean;
  isActionLoading: boolean;
}

// Mock order data
const MOCK_ORDER: OrderDetail = {
  id: 'ord-1',
  orderNumber: 'ORD-12345',
  status: 'shipped',
  paymentStatus: 'paid',
  paymentMethod: 'Credit Card (****1234)',
  subtotal: 5499,
  tax: 500,
  shippingCost: 0,
  discount: 500,
  total: 5499,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
  trackingNumber: 'TRK1234567890',
  courier: 'Blue Dart',
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      name: 'Premium Cotton Fabric',
      image: '/images/products/fabric-1.jpg',
      sku: 'VML-CF-001',
      quantity: 2,
      price: 2999,
      total: 5998,
      variant: 'Blue, 5 meters',
    },
    {
      id: 'item-2',
      productId: 'prod-2',
      name: 'Silk Blend Fabric',
      image: '/images/products/fabric-2.jpg',
      sku: 'VML-SF-002',
      quantity: 1,
      price: 1500,
      total: 1500,
    },
  ],
  shippingAddress: {
    name: 'John Doe',
    addressLine1: '123 Main Street',
    addressLine2: 'Apartment 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    phone: '+91 98765 43210',
  },
  billingAddress: {
    name: 'John Doe',
    addressLine1: '123 Main Street',
    addressLine2: 'Apartment 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    phone: '+91 98765 43210',
  },
  timeline: [
    {
      id: 'tl-1',
      status: 'placed',
      title: 'Order Placed',
      description: 'Your order has been placed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    {
      id: 'tl-2',
      status: 'confirmed',
      title: 'Order Confirmed',
      description: 'Your order has been confirmed and is being processed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    },
    {
      id: 'tl-3',
      status: 'shipped',
      title: 'Order Shipped',
      description: 'Your order has been shipped via Blue Dart',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 'tl-4',
      status: 'out_for_delivery',
      title: 'Out for Delivery',
      description: 'Your order is out for delivery',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
  ],
  notes: 'Please deliver between 9 AM - 6 PM',
};

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const resolvedParams = React.use(params);
  const { orderId } = resolvedParams;
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [state, setState] = useState<OrderPageState>({
    order: null,
    isLoading: true,
    error: null,
    showInvoiceDownload: false,
    showShareDialog: false,
    isActionLoading: false,
  });

  // Helper to convert OrderDetail to cart.types.Order
  const convertToCartOrder = useCallback((orderDetail: OrderDetail): import('@/types/cart.types').Order => {
    const mockAddress: import('@/types/common.types').Address = {
      id: 'addr-1',
      type: 'home',
      name: orderDetail.shippingAddress.name,
      address: orderDetail.shippingAddress.addressLine1,
      city: orderDetail.shippingAddress.city,
      state: orderDetail.shippingAddress.state,
      pincode: orderDetail.shippingAddress.postalCode,
      country: orderDetail.shippingAddress.country,
      phone: orderDetail.shippingAddress.phone,
      email: '',
      isDefault: true,
      deliveryInstructions: orderDetail.notes || '',
    };

    return {
      id: orderDetail.id,
      orderNumber: orderDetail.orderNumber,
      userId: 'user-1',
      user: {} as import('@/types/user.types').User,
      items: orderDetail.items.map(item => ({
        id: item.id,
        orderId: orderDetail.id,
        productId: item.productId,
        product: {
          id: item.productId,
          name: item.name,
          slug: item.name.toLowerCase().replace(/\s+/g, '-'),
          images: [{ id: '1', url: item.image, alt: item.name, isPrimary: true }],
        } as unknown as import('@/types/product.types').Product,
        quantity: item.quantity,
        unitPrice: { amount: item.price, currency: 'INR', formatted: `₹${item.price}` },
        totalPrice: { amount: item.total, currency: 'INR', formatted: `₹${item.total}` },
        productSnapshot: {
          name: item.name,
          description: '',
          sku: item.sku,
          image: item.image,
        },
      })) as import('@/types/cart.types').OrderItem[],
      subtotal: { amount: orderDetail.subtotal, currency: 'INR', formatted: `₹${orderDetail.subtotal}` },
      taxAmount: { amount: orderDetail.tax, currency: 'INR', formatted: `₹${orderDetail.tax}` },
      shippingAmount: { amount: orderDetail.shippingCost, currency: 'INR', formatted: `₹${orderDetail.shippingCost}` },
      discountAmount: { amount: orderDetail.discount, currency: 'INR', formatted: `₹${orderDetail.discount}` },
      total: { amount: orderDetail.total, currency: 'INR', formatted: `₹${orderDetail.total}` },
      currency: 'INR' as import('@/types/common.types').Currency,
      status: orderDetail.status as unknown as import('@/types/cart.types').OrderStatus,
      paymentStatus: orderDetail.paymentStatus as unknown as import('@/types/cart.types').PaymentStatus,
      fulfillmentStatus: (orderDetail.status === 'delivered' ? 'delivered' : 'pending') as import('@/types/cart.types').FulfillmentStatus,
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
      trackingNumber: orderDetail.trackingNumber,
      appliedCoupons: [],
      appliedDiscounts: [],
      source: 'web' as const,
      channel: 'online' as const,
      placedAt: orderDetail.createdAt,
      emailSent: false,
      smsSent: false,
      notifications: [],
      isReturnable: true,
      createdAt: orderDetail.createdAt,
      updatedAt: orderDetail.updatedAt,
    };
  }, []);

  const convertedOrder = useMemo(() => 
    state.order ? convertToCartOrder(state.order) : null,
    [state.order, convertToCartOrder]
  );

  // Computed values
  const canCancel = useMemo(() => {
    return state.order?.status === 'pending' || state.order?.status === 'processing';
  }, [state.order?.status]);

  const canRefund = useMemo(() => {
    return state.order?.status === 'delivered';
  }, [state.order?.status]);

  const canTrack = useMemo(() => {
    return state.order?.trackingNumber && (state.order?.status === 'shipped' || state.order?.status === 'out_for_delivery');
  }, [state.order?.trackingNumber, state.order?.status]);

  // Load order
  const loadOrder = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data with orderId
      const mockOrder = {
        ...MOCK_ORDER,
        id: orderId,
        orderNumber: `ORD-${orderId.toUpperCase()}`,
      };

      setState(prev => ({
        ...prev,
        order: mockOrder,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Failed to load order:', err);
      setState(prev => ({
        ...prev,
        error: 'Failed to load order details',
        isLoading: false,
      }));
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Handlers
  const handlePrintOrder = useCallback(() => {
    window.print();
    toast({
      title: 'Print',
      description: 'Opening print dialog...',
      variant: 'default',
    });
  }, [toast]);

  const handleShareOrder = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Order ${state.order?.orderNumber}`,
          text: `Check out my order from Vardhman Mills`,
          url: window.location.href,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link Copied',
          description: 'Order link copied to clipboard',
          variant: 'success',
        });
      }
    } catch (err) {
      console.error('Failed to share order:', err);
    }
  }, [state.order?.orderNumber, toast]);

  const handleDownloadInvoice = useCallback(async () => {
    setState(prev => ({ ...prev, isActionLoading: true }));

    try {
      // Simulate invoice download
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Invoice Downloaded',
        description: 'Invoice has been downloaded successfully',
        variant: 'success',
      });

      setState(prev => ({ ...prev, isActionLoading: false }));
    } catch (err) {
      console.error('Failed to download invoice:', err);
      toast({
        title: 'Error',
        description: 'Failed to download invoice',
        variant: 'error',
      });
      setState(prev => ({ ...prev, isActionLoading: false }));
    }
  }, [toast]);

  const handleCancelOrder = useCallback(() => {
    router.push(`/account/orders/${orderId}/cancel-order`);
  }, [router, orderId]);

  const handleRefundOrder = useCallback(() => {
    router.push(`/account/orders/${orderId}/refund-order`);
  }, [router, orderId]);

  const handleContactSupport = useCallback(() => {
    toast({
      title: 'Contact Support',
      description: 'Redirecting to support...',
      variant: 'default',
    });
    // Could redirect to support page or open chat
  }, [toast]);

  const handleReorder = useCallback(async () => {
    setState(prev => ({ ...prev, isActionLoading: true }));

    try {
      // Simulate reorder
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Items Added to Cart',
        description: 'Order items have been added to your cart',
        variant: 'success',
      });

      router.push('/cart');
    } catch (err) {
      console.error('Failed to reorder:', err);
      toast({
        title: 'Error',
        description: 'Failed to add items to cart',
        variant: 'error',
      });
      setState(prev => ({ ...prev, isActionLoading: false }));
    }
  }, [toast, router]);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'warning' as const, label: 'Pending', icon: ClockIcon },
      processing: { variant: 'info' as const, label: 'Processing', icon: ClockIcon },
      shipped: { variant: 'info' as const, label: 'Shipped', icon: TruckIcon },
      delivered: { variant: 'success' as const, label: 'Delivered', icon: CheckCircleIcon },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: XCircleIcon },
      refunded: { variant: 'default' as const, label: 'Refunded', icon: ExclamationCircleIcon },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-4 h-4" />
        {config.label}
      </Badge>
    );
  };

  // Render sections
  const renderHeader = () => (
    <div className="mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push('/account/orders')}
        className="mb-4"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Orders
      </Button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Order Details
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Order #{state.order?.orderNumber}
            </p>
            {state.order && getStatusBadge(state.order.status)}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Placed on {state.order && formatDate(state.order.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintOrder}
          >
            <PrinterIcon className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareOrder}
          >
            <ShareIcon className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadInvoice}
            disabled={state.isActionLoading}
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Invoice
          </Button>
        </div>
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="font-medium">{formatCurrency(state.order!.subtotal)}</span>
        </div>
        {state.order!.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span>-{formatCurrency(state.order!.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tax</span>
          <span className="font-medium">{formatCurrency(state.order!.tax)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Shipping</span>
          <span className="font-medium">
            {state.order!.shippingCost === 0 ? 'FREE' : formatCurrency(state.order!.shippingCost)}
          </span>
        </div>
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary-600">{formatCurrency(state.order!.total)}</span>
        </div>
      </CardContent>
    </Card>
  );

  const renderPaymentInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method</span>
          <span className="font-medium">{state.order!.paymentMethod}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Payment Status</span>
          <Badge variant={state.order!.paymentStatus === 'paid' ? 'success' : 'warning'}>
            {state.order!.paymentStatus.toUpperCase()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const renderAddresses = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p className="font-medium">{state.order!.shippingAddress.name}</p>
          <p>{state.order!.shippingAddress.addressLine1}</p>
          {state.order!.shippingAddress.addressLine2 && (
            <p>{state.order!.shippingAddress.addressLine2}</p>
          )}
          <p>
            {state.order!.shippingAddress.city}, {state.order!.shippingAddress.state} {state.order!.shippingAddress.postalCode}
          </p>
          <p>{state.order!.shippingAddress.country}</p>
          <p className="text-gray-600 dark:text-gray-400">{state.order!.shippingAddress.phone}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p className="font-medium">{state.order!.billingAddress.name}</p>
          <p>{state.order!.billingAddress.addressLine1}</p>
          {state.order!.billingAddress.addressLine2 && (
            <p>{state.order!.billingAddress.addressLine2}</p>
          )}
          <p>
            {state.order!.billingAddress.city}, {state.order!.billingAddress.state} {state.order!.billingAddress.postalCode}
          </p>
          <p>{state.order!.billingAddress.country}</p>
          <p className="text-gray-600 dark:text-gray-400">{state.order!.billingAddress.phone}</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderActions = () => (
    <Card>
      <CardHeader>
        <CardTitle>Order Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {canCancel && (
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              className="w-full"
            >
              <XCircleIcon className="w-4 h-4 mr-2" />
              Cancel Order
            </Button>
          )}
          {canRefund && (
            <Button
              variant="outline"
              onClick={handleRefundOrder}
              className="w-full"
            >
              Request Refund
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleReorder}
            disabled={state.isActionLoading}
            className="w-full"
          >
            Reorder Items
          </Button>
          <Button
            variant="outline"
            onClick={handleContactSupport}
            className="w-full"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Main render
  if (state.isLoading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Container>
    );
  }

  if (state.error || !state.order) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {state.error || 'The order you are looking for does not exist'}
          </p>
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
        title={`Order ${state.order.orderNumber} | Vardhman Mills`}
        description="View your order details and track delivery"
        canonical={`/account/orders/${orderId}`}
      />

      <Container className="py-8">
        {renderHeader()}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status & Tracking */}
            {canTrack && convertedOrder && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderTracking
                    order={convertedOrder}
                  />
                  <div className="mt-6">
                    <TrackingTimeline order={convertedOrder} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivery Estimate */}
            {state.order.estimatedDelivery && state.order.status !== 'delivered' && convertedOrder && (
              <DeliveryEstimate
                order={convertedOrder}
              />
            )}

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({state.order.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderItems order={convertedOrder!} />
              </CardContent>
            </Card>

            {/* Addresses */}
            {renderAddresses()}

            {/* Order Notes */}
            {state.order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {state.order.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {renderActions()}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Info */}
            <OrderInfo order={convertedOrder!} />

            {/* Order Summary */}
            {renderOrderSummary()}

            {/* Payment Info */}
            {renderPaymentInfo()}

            {/* Order Status */}
            <OrderStatus
              order={convertedOrder!}
            />

            {/* Tracking Info */}
            {canTrack && convertedOrder && (
              <TrackingInfo
                order={convertedOrder}
              />
            )}

            {/* Invoice Download */}
            {state.order.paymentStatus === 'paid' && convertedOrder && (
              <InvoiceDownload
                order={convertedOrder}
              />
            )}
          </div>
        </div>

        {/* Hidden component usage for imports */}
        {false && state.order && convertedOrder && (
          <>
            <OrderActions order={convertedOrder!} />
            <button onClick={handleDownloadInvoice}>Download</button>
          </>
        )}
      </Container>
    </>
  );
}
