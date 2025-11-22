/**
 * Order Tracking Detail Page - Vardhman Mills
 * Detailed tracking information for a specific order
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// UI Components
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

// Layout Components
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// Common Components
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SEOHead from '@/components/common/SEOHead';

// Hooks
import { useToast } from '@/hooks/useToast';

// Utils
import { formatCurrency } from '@/lib/utils';

// Icons
import {
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface OrderDetailPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: 'processing' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  placedDate: string;
  estimatedDelivery: string;
  trackingNumber: string;
  carrier: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  billingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  payment: {
    method: string;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  timeline: Array<{
    status: string;
    description: string;
    timestamp: string;
    location?: string;
  }>;
}

export default function OrderTrackingDetailPage({ params }: OrderDetailPageProps) {
  const resolvedParams = React.use(params);
  const { orderId } = resolvedParams;
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock order data
        const mockOrder: OrderDetail = {
          id: orderId,
          orderNumber: orderId,
          status: 'shipped',
          placedDate: '2024-10-20',
          estimatedDelivery: '2024-10-25',
          trackingNumber: 'VDT2024001234',
          carrier: 'Blue Dart',
          items: [
            {
              id: '1',
              name: 'Premium Cotton Bedsheet',
              quantity: 2,
              price: 2499,
              image: '/api/placeholder/100/100',
            },
            {
              id: '2',
              name: 'Luxury Towel Set',
              quantity: 1,
              price: 1999,
              image: '/api/placeholder/100/100',
            },
          ],
          shippingAddress: {
            name: 'John Doe',
            street: '123, MG Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            phone: '+91 98765 43210',
          },
          billingAddress: {
            name: 'John Doe',
            street: '123, MG Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
          },
          payment: {
            method: 'Credit Card',
            subtotal: 6997,
            shipping: 0,
            tax: 700,
            total: 7697,
          },
          timeline: [
            {
              status: 'Order Placed',
              description: 'Your order has been placed successfully',
              timestamp: '2024-10-20T10:00:00',
              location: 'Mumbai',
            },
            {
              status: 'Order Confirmed',
              description: 'Your order has been confirmed and is being prepared',
              timestamp: '2024-10-20T12:30:00',
              location: 'Mumbai Warehouse',
            },
            {
              status: 'Shipped',
              description: 'Your order has been shipped',
              timestamp: '2024-10-21T09:00:00',
              location: 'Mumbai Distribution Center',
            },
            {
              status: 'In Transit',
              description: 'Package is on the way to destination',
              timestamp: '2024-10-22T14:00:00',
              location: 'Delhi Hub',
            },
          ],
        };

        setOrderDetail(mockOrder);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, toast]);

  const handleCopyTracking = () => {
    if (orderDetail?.trackingNumber) {
      navigator.clipboard.writeText(orderDetail.trackingNumber);
      toast({
        title: 'Copied!',
        description: 'Tracking number copied to clipboard',
        variant: 'success',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <TruckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              We could not find an order with this number
            </p>
            <Button onClick={() => router.push('/order-tracking')}>
              Back to Tracking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={`Order ${orderDetail.orderNumber} | Vardhman Mills`}
        description="Track your order status and delivery"
        keywords={['order tracking', 'delivery', 'shipping']}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Order Tracking', href: '/order-tracking' },
            { label: orderDetail.orderNumber, href: `/order-tracking/${orderDetail.orderNumber}` },
          ]}
        />

        <div className="mt-6 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/order-tracking')}
            className="gap-2 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Tracking
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{orderDetail.orderNumber}
              </h1>
              <p className="mt-2 text-gray-600">
                Placed on {new Date(orderDetail.placedDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Badge className={`px-4 py-2 ${getStatusColor(orderDetail.status)}`}>
              {orderDetail.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TruckIcon className="w-5 h-5" />
                  Tracking Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {orderDetail.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index === orderDetail.timeline.length - 1
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-green-100 text-green-600'
                        }`}>
                          <CheckCircleIconSolid className="w-6 h-6" />
                        </div>
                        {index < orderDetail.timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-300 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <h4 className="font-semibold text-gray-900">{event.status}</h4>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        {event.location && (
                          <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(event.timestamp).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Estimate */}
            <Card>
              <CardHeader>
                <CardTitle>Estimated Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TruckIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Estimated Delivery</p>
                      <p className="text-2xl font-bold text-blue-600 mb-2">
                        {new Date(orderDetail.estimatedDelivery).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Carrier:</span> {orderDetail.carrier}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Tracking:</span> {orderDetail.trackingNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleCopyTracking}
                  className="mt-4 gap-2 w-full"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  Copy Tracking Number
                </Button>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetail.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.price)}
                        </p>
                        <p className="text-sm text-gray-600">per item</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(orderDetail.payment.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {orderDetail.payment.shipping === 0 ? 'Free' : formatCurrency(orderDetail.payment.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatCurrency(orderDetail.payment.tax)}</span>
                  </div>
                  <div className="pt-3 border-t flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-purple-600">
                      {formatCurrency(orderDetail.payment.total)}
                    </span>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      Paid via {orderDetail.payment.method}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-900">{orderDetail.shippingAddress.name}</p>
                  <p className="text-gray-600">{orderDetail.shippingAddress.street}</p>
                  <p className="text-gray-600">
                    {orderDetail.shippingAddress.city}, {orderDetail.shippingAddress.state}
                  </p>
                  <p className="text-gray-600">{orderDetail.shippingAddress.pincode}</p>
                  <div className="pt-3 border-t mt-3 flex items-center gap-2 text-gray-600">
                    <PhoneIcon className="w-4 h-4" />
                    {orderDetail.shippingAddress.phone}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <EnvelopeIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Questions about your order? We are here to help!
                  </p>
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
