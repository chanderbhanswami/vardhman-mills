import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useApi from '../api/useApi';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  variantId?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface OrderFilters {
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'created' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateOrderData {
  customerId: string;
  items: Omit<OrderItem, 'id'>[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  notes?: string;
}

const QUERY_KEYS = {
  orders: ['orders'] as const,
  order: (id: string) => ['orders', id] as const,
} as const;

export const useOrders = (filters: OrderFilters = {}) => {
  const api = useApi();
  const queryClient = useQueryClient();

  const [localFilters, setLocalFilters] = useState<OrderFilters>(filters);
  const activeFilters = useMemo(() => ({ ...filters, ...localFilters }), [filters, localFilters]);

  // Query for orders list
  const ordersQuery = useQuery({
    queryKey: [...QUERY_KEYS.orders, activeFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<{
        orders: Order[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>(`/orders?${params.toString()}`);
      
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get single order
  const getOrder = useCallback(async (id: string) => {
    const response = await api.get<{ order: Order }>(`/orders/${id}`);
    return response?.order;
  }, [api]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: CreateOrderData) => {
      const response = await api.post<{ order: Order }>('/orders', data);
      return response?.order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      toast.success('Order created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create order');
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: Order['status']; notes?: string }) => {
      const response = await api.put<{ order: Order }>(`/orders/${id}/status`, { status, notes });
      return response?.order;
    },
    onSuccess: (order) => {
      if (order) {
        queryClient.setQueryData(QUERY_KEYS.order(order.id), order);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
        toast.success('Order status updated');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await api.put<{ order: Order }>(`/orders/${id}/cancel`, { reason });
      return response?.order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      toast.success('Order cancelled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel order');
    },
  });

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setLocalFilters({});
  }, []);

  // Computed values
  const computed = useMemo(() => {
    const data = ordersQuery.data;
    
    return {
      orders: data?.orders || [],
      pagination: data?.pagination || null,
      totalOrders: data?.pagination?.total || 0,
      hasOrders: (data?.orders?.length || 0) > 0,
    };
  }, [ordersQuery.data]);

  return {
    // Query data
    ...computed,
    
    // Query states
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    
    // Actions
    getOrder,
    createOrder: createOrderMutation.mutate,
    updateOrderStatus: updateOrderStatusMutation.mutate,
    cancelOrder: cancelOrderMutation.mutate,
    refetch: ordersQuery.refetch,
    
    // Mutation states
    isCreating: createOrderMutation.isPending,
    isUpdating: updateOrderStatusMutation.isPending,
    isCancelling: cancelOrderMutation.isPending,
    
    // Filtering
    filters: activeFilters,
    updateFilters,
    clearFilters,
  };
};

export default useOrders;
