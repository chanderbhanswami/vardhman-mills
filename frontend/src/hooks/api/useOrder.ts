import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useApi from './useApi';
import type { Order, OrderItem, Address } from './useOrders';

export interface OrderUpdate {
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  trackingNumber?: string;
  notes?: string;
  items?: OrderItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
}

export interface OrderNotification {
  id: string;
  type: 'status_change' | 'payment_update' | 'shipment_update' | 'delivery_confirmation';
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface UseOrderOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  onStatusChange?: (oldStatus: Order['status'], newStatus: Order['status']) => void;
  onPaymentUpdate?: (order: Order) => void;
  onShipmentUpdate?: (order: Order) => void;
}

const QUERY_KEYS = {
  order: (id: string) => ['orders', id] as const,
  orderHistory: (id: string) => ['orders', id, 'history'] as const,
  orderTracking: (id: string) => ['orders', id, 'tracking'] as const,
  orderInvoice: (id: string) => ['orders', id, 'invoice'] as const,
  orderNotifications: (id: string) => ['orders', id, 'notifications'] as const,
} as const;

export const useOrder = (orderId: string, options: UseOrderOptions = {}) => {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    refetchInterval,
    onStatusChange,
    onPaymentUpdate,
    onShipmentUpdate,
  } = options;

  const api = useApi();
  const queryClient = useQueryClient();
  const [previousOrder, setPreviousOrder] = useState<Order | null>(null);

  // Main order query
  const orderQuery = useQuery({
    queryKey: QUERY_KEYS.order(orderId),
    queryFn: async () => {
      const response = await api.get<{ order: Order }>(`/orders/${orderId}`);
      return response?.order;
    },
    enabled: enabled && !!orderId,
    refetchOnWindowFocus,
    refetchInterval,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });

  // Order history query
  const orderHistoryQuery = useQuery({
    queryKey: QUERY_KEYS.orderHistory(orderId),
    queryFn: async () => {
      const response = await api.get<{ 
        history: Array<{
          id: string;
          action: string;
          description: string;
          timestamp: Date;
          userId?: string;
          userName?: string;
          metadata?: Record<string, unknown>;
        }> 
      }>(`/orders/${orderId}/history`);
      return response?.history || [];
    },
    enabled: enabled && !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Order tracking query
  const orderTrackingQuery = useQuery({
    queryKey: QUERY_KEYS.orderTracking(orderId),
    queryFn: async () => {
      const response = await api.get<{
        tracking: {
          carrier: string;
          trackingNumber: string;
          status: string;
          estimatedDelivery?: Date;
          events: Array<{
            timestamp: Date;
            location: string;
            description: string;
            status: string;
          }>;
        }
      }>(`/orders/${orderId}/tracking`);
      return response?.tracking;
    },
    enabled: enabled && !!orderId && !!orderQuery.data?.trackingNumber,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Order notifications query
  const orderNotificationsQuery = useQuery({
    queryKey: QUERY_KEYS.orderNotifications(orderId),
    queryFn: async () => {
      const response = await api.get<{ notifications: OrderNotification[] }>(`/orders/${orderId}/notifications`);
      return response?.notifications || [];
    },
    enabled: enabled && !!orderId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (updates: OrderUpdate) => {
      const response = await api.put<{ order: Order }>(`/orders/${orderId}`, updates);
      return response?.order;
    },
    onSuccess: (updatedOrder) => {
      if (updatedOrder) {
        queryClient.setQueryData(QUERY_KEYS.order(orderId), updatedOrder);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orderHistory(orderId) });
        toast.success('Order updated successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order');
    },
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: Order['status']; notes?: string }) => {
      const response = await api.put<{ order: Order }>(`/orders/${orderId}/status`, { status, notes });
      return response?.order;
    },
    onSuccess: (updatedOrder) => {
      if (updatedOrder) {
        queryClient.setQueryData(QUERY_KEYS.order(orderId), updatedOrder);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orderHistory(orderId) });
        toast.success(`Order status updated to ${updatedOrder.status}`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (reason?: string) => {
      const response = await api.put<{ order: Order }>(`/orders/${orderId}/cancel`, { reason });
      return response?.order;
    },
    onSuccess: (updatedOrder) => {
      if (updatedOrder) {
        queryClient.setQueryData(QUERY_KEYS.order(orderId), updatedOrder);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orderHistory(orderId) });
        toast.success('Order cancelled successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel order');
    },
  });

  // Refund order mutation
  const refundOrderMutation = useMutation({
    mutationFn: async ({ amount, reason }: { amount?: number; reason?: string }) => {
      const response = await api.post<{ 
        refund: {
          id: string;
          amount: number;
          status: string;
          reason?: string;
        };
        order: Order;
      }>(`/orders/${orderId}/refund`, { amount, reason });
      return response;
    },
    onSuccess: (response) => {
      if (response?.order) {
        queryClient.setQueryData(QUERY_KEYS.order(orderId), response.order);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orderHistory(orderId) });
        toast.success('Refund initiated successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to initiate refund');
    },
  });

  // Download invoice mutation
  const downloadInvoiceMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      
      // Create blob URL and download
      const blob = new Blob([response as BlobPart], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderQuery.data?.orderNumber || orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response;
    },
    onSuccess: () => {
      toast.success('Invoice downloaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to download invoice');
    },
  });

  // Mark notifications as read
  const markNotificationsReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await api.put(`/orders/${orderId}/notifications/read`, {
        notificationIds,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orderNotifications(orderId) });
    },
  });

  // Watch for order changes and trigger callbacks
  useEffect(() => {
    if (orderQuery.data && previousOrder) {
      // Status change callback
      if (orderQuery.data.status !== previousOrder.status) {
        onStatusChange?.(previousOrder.status, orderQuery.data.status);
      }
      
      // Payment update callback
      if (orderQuery.data.paymentStatus !== previousOrder.paymentStatus) {
        onPaymentUpdate?.(orderQuery.data);
      }
      
      // Shipment update callback
      if (orderQuery.data.trackingNumber !== previousOrder.trackingNumber) {
        onShipmentUpdate?.(orderQuery.data);
      }
    }
    
    if (orderQuery.data) {
      setPreviousOrder(orderQuery.data);
    }
  }, [orderQuery.data, previousOrder, onStatusChange, onPaymentUpdate, onShipmentUpdate]);

  // Computed values
  const canCancel = orderQuery.data?.status === 'pending' || orderQuery.data?.status === 'confirmed';
  const canRefund = orderQuery.data?.paymentStatus === 'paid' && 
                   (orderQuery.data?.status === 'delivered' || orderQuery.data?.status === 'cancelled');
  const isDelivered = orderQuery.data?.status === 'delivered';
  const isPending = orderQuery.data?.status === 'pending';
  const isShipped = orderQuery.data?.status === 'shipped';
  const isCancelled = orderQuery.data?.status === 'cancelled';
  const isRefunded = orderQuery.data?.status === 'refunded';

  const unreadNotifications = orderNotificationsQuery.data?.filter(n => !n.read).length || 0;

  return {
    // Data
    order: orderQuery.data,
    history: orderHistoryQuery.data,
    tracking: orderTrackingQuery.data,
    notifications: orderNotificationsQuery.data,
    unreadNotifications,

    // Loading states
    isLoading: orderQuery.isLoading,
    isLoadingHistory: orderHistoryQuery.isLoading,
    isLoadingTracking: orderTrackingQuery.isLoading,
    isLoadingNotifications: orderNotificationsQuery.isLoading,

    // Error states
    error: orderQuery.error,
    historyError: orderHistoryQuery.error,
    trackingError: orderTrackingQuery.error,
    notificationsError: orderNotificationsQuery.error,

    // Mutation states
    isUpdating: updateOrderMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isCancelling: cancelOrderMutation.isPending,
    isRefunding: refundOrderMutation.isPending,
    isDownloadingInvoice: downloadInvoiceMutation.isPending,

    // Actions
    updateOrder: updateOrderMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    cancelOrder: cancelOrderMutation.mutate,
    refundOrder: refundOrderMutation.mutate,
    downloadInvoice: downloadInvoiceMutation.mutate,
    markNotificationsRead: markNotificationsReadMutation.mutate,

    // Refetch functions
    refetch: orderQuery.refetch,
    refetchHistory: orderHistoryQuery.refetch,
    refetchTracking: orderTrackingQuery.refetch,
    refetchNotifications: orderNotificationsQuery.refetch,

    // Computed states
    canCancel,
    canRefund,
    isDelivered,
    isPending,
    isShipped,
    isCancelled,
    isRefunded,
  };
};

export default useOrder;
