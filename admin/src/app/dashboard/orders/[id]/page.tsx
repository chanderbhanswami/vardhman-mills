'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { 
  ArrowLeftIcon,
  TruckIcon,
  CreditCardIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
  };
  variant: {
    size: string;
    color: string;
    sku: string;
  };
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch order');
        }

        setOrder(data.data.order);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
        router.push('/dashboard/orders');
      } finally {
        setLoading(false);
      }
    };

    if (orderId && session?.accessToken) {
      loadOrder();
    }
  }, [orderId, session?.accessToken, router]);

  const updateOrderStatus = async (status: Order['status']) => {
    if (!order || !orderId) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      setOrder({ ...order, status });
      toast.success('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (paymentStatus: Order['paymentStatus']) => {
    if (!order || !orderId) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update payment status');
      }

      setOrder({ ...order, paymentStatus });
      toast.success('Payment status updated successfully!');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
          <p className="mt-2 text-gray-600">The order you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="mt-4 btn btn-primary"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back
            </button>
            <div>
              <h1 className="page-title">Order #{order.orderNumber}</h1>
              <p className="page-description">
                Order ID: {order._id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[order.paymentStatus]}`}>
              Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0">
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-md"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                        <TruckIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                    <div className="mt-1 text-sm text-gray-500">
                      {item.variant.size && <span>Size: {item.variant.size}</span>}
                      {item.variant.size && item.variant.color && <span className="mx-2">•</span>}
                      {item.variant.color && <span>Color: {item.variant.color}</span>}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      SKU: {item.variant.sku}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{item.price.toLocaleString()} × {item.quantity}
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      ₹{item.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">₹{order.subtotal.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Tax</dt>
                  <dd className="text-sm font-medium text-gray-900">₹{order.tax.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Shipping</dt>
                  <dd className="text-sm font-medium text-gray-900">₹{order.shipping.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <dt className="text-base font-medium text-gray-900">Total</dt>
                  <dd className="text-base font-bold text-gray-900">₹{order.total.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Status Updates */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="order-status" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  id="order-status"
                  value={order.status}
                  onChange={(e) => updateOrderStatus(e.target.value as Order['status'])}
                  disabled={updating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Order Status"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label htmlFor="payment-status" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  id="payment-status"
                  value={order.paymentStatus}
                  onChange={(e) => updatePaymentStatus(e.target.value as Order['paymentStatus'])}
                  disabled={updating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Payment Status"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Customer Information
            </h3>
            
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {order.customer.firstName} {order.customer.lastName}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.customer.email}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.customer.phone}</dd>
              </div>
            </dl>
          </div>

          {/* Shipping Address */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Shipping Address
            </h3>
            
            <address className="text-sm text-gray-900 not-italic">
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
              {order.shippingAddress.country}
            </address>
          </div>

          {/* Payment Information */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Payment Information
            </h3>
            
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.paymentMethod}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[order.paymentStatus]}`}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Order Timeline */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Order Timeline
            </h3>
            
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(order.createdAt).toLocaleString()}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(order.updatedAt).toLocaleString()}
                </dd>
              </div>
              
              {order.trackingNumber && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tracking Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{order.trackingNumber}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <p className="text-sm text-gray-900">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
