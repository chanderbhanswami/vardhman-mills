'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import OrderTable from '@/components/tables/OrderTable';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    image?: string;
  };
  variant: {
    size: string;
    color: string;
    sku: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  guestEmail?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentInfo: {
    method: string;
    status: string;
    transactionId?: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const { data: session } = useSession();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocalSearch, setIsLocalSearch] = useState(true);
  const [searchTimeoutRef, setSearchTimeoutRef] = useState<NodeJS.Timeout | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const fetchOrders = useCallback(async (page = 1, search = '', filters = {}) => {
    if (!session?.accessToken) return;
    
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...filters,
      });

      const response = await fetch(
        `/api/orders/admin?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const fetchedOrders = data.orders || [];
        setOrders(fetchedOrders);
        // Only update allOrders when not searching (initial load or reset)
        if (!search) {
          setAllOrders(fetchedOrders);
        }
        setPagination({
          page: data.page || 1,
          pages: data.pages || 1,
          total: data.total || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]); // fetchOrders is stable due to useCallback

  const handleView = (order: Order) => {
    // Navigate to order details page
    console.log('View order:', order);
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchOrders(pagination.page);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleEdit = (order: Order) => {
    // Navigate to edit page or open edit modal
    console.log('Edit order:', order);
  };

  // Local filtering function
  const filterOrdersLocally = (query: string) => {
    if (!query.trim()) {
      setOrders(allOrders);
      return allOrders;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allOrders.filter(order => {
      const orderNumber = order.orderNumber.toLowerCase();
      const userEmail = order.user?.email.toLowerCase() || order.guestEmail?.toLowerCase() || '';
      const userName = order.user ? `${order.user.firstName} ${order.user.lastName}`.toLowerCase() : '';
      const status = order.status.toLowerCase();
      
      return orderNumber.includes(lowerQuery) || 
             userEmail.includes(lowerQuery) || 
             userName.includes(lowerQuery) ||
             status.includes(lowerQuery);
    });
    
    setOrders(filtered);
    return filtered;
  };

  const handlePageChange = (page: number) => {
    if (isLocalSearch && searchQuery) {
      // For local search, don't change page
      return;
    }
    fetchOrders(page, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Cancel any pending search
    if (searchTimeoutRef) {
      clearTimeout(searchTimeoutRef);
      setSearchTimeoutRef(null);
    }
    
    if (!query.trim()) {
      // Reset to show all orders when search is cleared
      setOrders(allOrders);
      setIsLocalSearch(true);
      return;
    }

    // Always start with local filtering for immediate feedback
    setIsLocalSearch(true);
    filterOrdersLocally(query);
    
    // For queries longer than 1 character, trigger server search faster
    if (query.length > 1) {
      // Set timeout for server search with faster timing
      const timeoutId = setTimeout(() => {
        setIsLocalSearch(false);
        fetchOrders(1, query);
        setSearchTimeoutRef(null);
      }, 500);
      setSearchTimeoutRef(timeoutId);
    }
  };

  const handleFilter = (filters: { status?: string; dateRange?: string }) => {
    fetchOrders(1, '', filters);
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    console.log('Sort by:', field, direction);
    // Implement sorting logic
  };

  const handleResetSearch = () => {
    // Cancel any pending search
    if (searchTimeoutRef) {
      clearTimeout(searchTimeoutRef);
      setSearchTimeoutRef(null);
    }
    
    // Reset all search-related state to show all orders
    setSearchQuery('');
    setOrders(allOrders);
    setIsLocalSearch(true);
  };

  return (
    <div className="page-container">
      <OrderTable
        orders={orders}
        loading={loading}
        onView={handleView}
        onUpdateStatus={handleUpdateStatus}
        onEdit={handleEdit}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        searchQuery={searchQuery}
        onResetSearch={handleResetSearch}
      />
    </div>
  );
}
