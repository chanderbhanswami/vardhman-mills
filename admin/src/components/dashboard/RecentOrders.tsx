'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  _id: string;
  orderNumber: string;
  user?: { firstName: string; lastName: string };
  guestEmail?: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockOrders: Order[] = [
      {
        _id: '1',
        orderNumber: 'VM123456',
        user: { firstName: 'John', lastName: 'Doe' },
        total: 2500,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        orderNumber: 'VM123457',
        guestEmail: 'guest@example.com',
        total: 1800,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];

    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        <Link href="/dashboard/orders" className="text-blue-600 hover:text-blue-800 text-sm">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                <p className="text-sm text-gray-600">
                  {order.user ? `${order.user.firstName} ${order.user.lastName}` : order.guestEmail}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
                <span className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}