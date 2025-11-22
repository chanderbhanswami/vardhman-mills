/**
 * Order Tracking Page - Vardhman Mills
 * Search and track orders by order ID or email
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// UI Components
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';

// Layout Components
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// Common Components
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SEOHead from '@/components/common/SEOHead';

// Hooks
import { useToast } from '@/hooks/useToast';

// Icons
import {
  MagnifyingGlassIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  statusColor: string;
  date: string;
  total: number;
  items: number;
}

const RECENT_ORDERS: RecentOrder[] = [
  {
    id: 'ord-001',
    orderNumber: 'VD2024001',
    status: 'Delivered',
    statusColor: 'green',
    date: '2024-10-15',
    total: 15999,
    items: 3,
  },
  {
    id: 'ord-002',
    orderNumber: 'VD2024002',
    status: 'In Transit',
    statusColor: 'blue',
    date: '2024-10-18',
    total: 8999,
    items: 2,
  },
  {
    id: 'ord-003',
    orderNumber: 'VD2024003',
    status: 'Processing',
    statusColor: 'yellow',
    date: '2024-10-20',
    total: 24999,
    items: 5,
  },
];

export default function OrderTrackingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const handleTrackOrder = useCallback(async () => {
    if (!orderNumber.trim()) {
      toast({
        title: 'Required Field',
        description: 'Please enter your order number',
        variant: 'destructive',
      });
      return;
    }

    setIsTracking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to order detail page
      router.push(`/order-tracking/${orderNumber}`);
    } catch (error) {
      console.error('Failed to track order:', error);
      toast({
        title: 'Error',
        description: 'Failed to find order. Please check your order number.',
        variant: 'destructive',
      });
    } finally {
      setIsTracking(false);
    }
  }, [orderNumber, router, toast]);

  const handleQuickTrack = useCallback((orderId: string) => {
    router.push(`/order-tracking/${orderId}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Track Your Order | Vardhman Mills"
        description="Track your order status and delivery information"
        keywords={['order tracking', 'delivery status', 'shipping']}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Order Tracking', href: '/order-tracking' },
          ]}
        />

        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TruckIcon className="w-8 h-8 text-blue-600" />
            Track Your Order
          </h1>
          <p className="mt-2 text-gray-600">
            Enter your order number to get real-time tracking information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tracking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  Find Your Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Order Number *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., VD2024001"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleTrackOrder();
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can find this in your order confirmation email
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address (Optional)
                    </label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleTrackOrder();
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The email used when placing the order
                    </p>
                  </div>

                  <Button
                    onClick={handleTrackOrder}
                    disabled={isTracking}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {isTracking ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Tracking...
                      </>
                    ) : (
                      <>
                        <MagnifyingGlassIcon className="w-5 h-5" />
                        Track Order
                      </>
                    )}
                  </Button>

                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">Having trouble tracking your order?</p>
                        <p>
                          If you cannot find your order number, please check your email or{' '}
                          <a href="/contact" className="underline hover:text-blue-700">
                            contact support
                          </a>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How to Track */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>How to Track Your Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Find Your Order Number</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Check your order confirmation email for your unique order number (e.g., VD2024001)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Enter Details</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Enter your order number and optionally your email address
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Track in Real-Time</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        View your order status, estimated delivery date, and tracking updates
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardDocumentListIcon className="w-5 h-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {RECENT_ORDERS.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => handleQuickTrack(order.orderNumber)}
                      className="w-full p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{order.date}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.statusColor === 'green'
                              ? 'bg-green-100 text-green-800'
                              : order.statusColor === 'blue'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{order.items} items</span>
                        <span className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Free Shipping</p>
                      <p className="text-gray-600">On orders above ₹999</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Fast Delivery</p>
                      <p className="text-gray-600">3-5 business days</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Easy Returns</p>
                      <p className="text-gray-600">30-day return policy</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Our customer support team is here to help you
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
