import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderItem, OrderTracking, OrderInvoice, OrderStatus, PaymentStatus, OrderFilters } from '@/types/order.types';
import { Address, PaginationMeta } from '@/types';

// Payment interface
export interface Payment {
  id: string;
  orderId: string;
  method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'upi' | 'wallet' | 'cod';
  status: PaymentStatus;
  amount: number;
  currency: string;
  transactionId?: string;
  processedAt?: string;
  failureReason?: string;
  gatewayResponse?: Record<string, unknown>;
}

// Enhanced order interface
export interface OrderDetails extends Order {
  shippingAddress: Address;
  billingAddress: Address;
  payment: Payment;
  items: OrderItem[];
  tracking?: OrderTracking;
  invoice?: OrderInvoice;
}

// Use imported OrderFilters from order.types.ts

// Order summary interface
export interface OrderSummary {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusCounts: Record<OrderStatus, number>;
  recentOrders: Order[];
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
}

// Async thunks for order operations
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (params: {
    page?: number;
    limit?: number;
    filters?: OrderFilters;
  } = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    if (params.filters) {
      if (params.filters.status?.length) {
        queryParams.append('status', params.filters.status.join(','));
      }
      if (params.filters.paymentStatus?.length) {
        queryParams.append('paymentStatus', params.filters.paymentStatus.join(','));
      }
      if (params.filters.dateRange) {
        const fromDate = typeof params.filters.dateRange.from === 'string' ? new Date(params.filters.dateRange.from) : params.filters.dateRange.from;
        const toDate = typeof params.filters.dateRange.to === 'string' ? new Date(params.filters.dateRange.to) : params.filters.dateRange.to;
        queryParams.append('startDate', fromDate.toISOString());
        queryParams.append('endDate', toDate.toISOString());
      }
      if (params.filters.amountRange?.min) {
        queryParams.append('minAmount', params.filters.amountRange.min.toString());
      }
      if (params.filters.amountRange?.max) {
        queryParams.append('maxAmount', params.filters.amountRange.max.toString());
      }
      if (params.filters.customerId) {
        queryParams.append('customerId', params.filters.customerId);
      }
      if (params.filters.search) {
        queryParams.append('search', params.filters.search);
      }
    }

    const response = await fetch(`/api/orders?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return response.json();
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId: string) => {
    const response = await fetch(`/api/orders/${orderId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }
    return response.json();
  }
);

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData: {
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
      variant?: Record<string, string>;
    }>;
    shippingAddress: Address;
    billingAddress?: Address;
    paymentMethod: string;
    shippingMethod: string;
    couponCode?: string;
    notes?: string;
  }) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }

    return response.json();
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async (params: { orderId: string; status: OrderStatus; notes?: string }) => {
    const response = await fetch(`/api/orders/${params.orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: params.status,
        notes: params.notes,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    return response.json();
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async (params: { orderId: string; reason: string }) => {
    const response = await fetch(`/api/orders/${params.orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: params.reason }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel order');
    }

    return response.json();
  }
);

export const trackOrder = createAsyncThunk(
  'order/trackOrder',
  async (orderId: string) => {
    const response = await fetch(`/api/orders/${orderId}/tracking`);
    if (!response.ok) {
      throw new Error('Failed to fetch tracking information');
    }
    return response.json();
  }
);

export const downloadInvoice = createAsyncThunk(
  'order/downloadInvoice',
  async (orderId: string) => {
    const response = await fetch(`/api/orders/${orderId}/invoice`);
    if (!response.ok) {
      throw new Error('Failed to download invoice');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { orderId, downloaded: true };
  }
);

export const requestReturn = createAsyncThunk(
  'order/requestReturn',
  async (params: {
    orderId: string;
    items: Array<{
      orderItemId: string;
      quantity: number;
      reason: string;
    }>;
    returnReason: string;
    comments?: string;
  }) => {
    const response = await fetch(`/api/orders/${params.orderId}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to request return');
    }

    return response.json();
  }
);

export const fetchOrderSummary = createAsyncThunk(
  'order/fetchOrderSummary',
  async (params: { dateRange?: { start: string; end: string } } = {}) => {
    const queryParams = new URLSearchParams();

    if (params.dateRange) {
      queryParams.append('startDate', params.dateRange.start);
      queryParams.append('endDate', params.dateRange.end);
    }

    const response = await fetch(`/api/orders/summary?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order summary');
    }

    return response.json();
  }
);

export const processPayment = createAsyncThunk(
  'order/processPayment',
  async (params: {
    orderId: string;
    paymentMethod: string;
    paymentData: Record<string, unknown>;
  }) => {
    const response = await fetch(`/api/orders/${params.orderId}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethod: params.paymentMethod,
        paymentData: params.paymentData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment processing failed');
    }

    return response.json();
  }
);

interface OrderState {
  // Orders
  orders: Order[];
  currentOrder: OrderDetails | null;
  recentOrders: Order[];

  // Order management
  orderSummary: OrderSummary | null;
  tracking: Record<string, OrderDetails['tracking']>;

  // Pagination
  pagination: PaginationMeta;

  // Filters and search
  filters: OrderFilters;
  searchQuery: string;

  // Loading states
  isLoading: boolean;
  isCreatingOrder: boolean;
  isUpdatingOrder: boolean;
  isCancellingOrder: boolean;
  isProcessingPayment: boolean;
  isDownloadingInvoice: boolean;
  isRequestingReturn: boolean;
  isLoadingTracking: boolean;

  // UI state
  selectedOrders: string[];
  viewMode: 'list' | 'grid' | 'detailed';
  showFilters: boolean;
  expandedOrders: string[];

  // Error handling
  error: string | null;
  createOrderError: string | null;
  paymentError: string | null;
  trackingError: string | null;

  // Cache
  lastFetch: number;
  orderCache: Record<string, { order: OrderDetails; timestamp: number }>;

  // Notifications
  pendingNotifications: Array<{
    orderId: string;
    type: 'status_update' | 'payment_success' | 'payment_failed' | 'shipped' | 'delivered';
    message: string;
    timestamp: number;
  }>;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  recentOrders: [],
  orderSummary: null,
  tracking: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  filters: {
    status: [],
    paymentStatus: [],
  },
  searchQuery: '',
  isLoading: false,
  isCreatingOrder: false,
  isUpdatingOrder: false,
  isCancellingOrder: false,
  isProcessingPayment: false,
  isDownloadingInvoice: false,
  isRequestingReturn: false,
  isLoadingTracking: false,
  selectedOrders: [],
  viewMode: 'list',
  showFilters: false,
  expandedOrders: [],
  error: null,
  createOrderError: null,
  paymentError: null,
  trackingError: null,
  lastFetch: 0,
  orderCache: {},
  pendingNotifications: [],
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Filter management
    setFilters: (state, action: PayloadAction<OrderFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearFilters: (state) => {
      state.filters = {
        status: [],
        paymentStatus: [],
      };
    },

    // Search
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // Selection management
    selectOrder: (state, action: PayloadAction<string>) => {
      if (!state.selectedOrders.includes(action.payload)) {
        state.selectedOrders.push(action.payload);
      }
    },

    deselectOrder: (state, action: PayloadAction<string>) => {
      state.selectedOrders = state.selectedOrders.filter(id => id !== action.payload);
    },

    selectAllOrders: (state) => {
      const allIds = state.orders.map(order => order.id);
      state.selectedOrders = Array.from(new Set([...state.selectedOrders, ...allIds]));
    },

    deselectAllOrders: (state) => {
      state.selectedOrders = [];
    },

    toggleOrderSelection: (state, action: PayloadAction<string>) => {
      const orderId = action.payload;
      if (state.selectedOrders.includes(orderId)) {
        state.selectedOrders = state.selectedOrders.filter(id => id !== orderId);
      } else {
        state.selectedOrders.push(orderId);
      }
    },

    // Order expansion
    toggleOrderExpansion: (state, action: PayloadAction<string>) => {
      const orderId = action.payload;
      if (state.expandedOrders.includes(orderId)) {
        state.expandedOrders = state.expandedOrders.filter(id => id !== orderId);
      } else {
        state.expandedOrders.push(orderId);
      }
    },

    expandOrder: (state, action: PayloadAction<string>) => {
      if (!state.expandedOrders.includes(action.payload)) {
        state.expandedOrders.push(action.payload);
      }
    },

    collapseOrder: (state, action: PayloadAction<string>) => {
      state.expandedOrders = state.expandedOrders.filter(id => id !== action.payload);
    },

    // UI state
    setViewMode: (state, action: PayloadAction<'list' | 'grid' | 'detailed'>) => {
      state.viewMode = action.payload;
    },

    setShowFilters: (state, action: PayloadAction<boolean>) => {
      state.showFilters = action.payload;
    },

    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },

    // Order management
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },

    updateOrderInList: (state, action: PayloadAction<Partial<Order> & { id: string }>) => {
      const index = state.orders.findIndex(order => order.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], ...action.payload };
      }
    },

    // Notifications
    addNotification: (state, action: PayloadAction<OrderState['pendingNotifications'][0]>) => {
      state.pendingNotifications.push(action.payload);
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.pendingNotifications = state.pendingNotifications.filter(
        notification => notification.orderId !== action.payload
      );
    },

    clearNotifications: (state) => {
      state.pendingNotifications = [];
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
      state.createOrderError = null;
      state.paymentError = null;
      state.trackingError = null;
    },

    // Cache management
    invalidateCache: (state) => {
      state.lastFetch = 0;
      state.orderCache = {};
    },

    invalidateOrderCache: (state, action: PayloadAction<string>) => {
      delete state.orderCache[action.payload];
    },
  },
  extraReducers: (builder) => {
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders || action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      });

    // Fetch order by ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        const order = action.payload.order || action.payload;
        state.currentOrder = order;

        // Cache the order
        if (order?.id) {
          state.orderCache[order.id] = {
            order,
            timestamp: Date.now(),
          };
        }

        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch order';
      });

    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.isCreatingOrder = true;
        state.createOrderError = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isCreatingOrder = false;
        const newOrder = action.payload.order || action.payload;
        state.orders.unshift(newOrder);
        state.currentOrder = newOrder;
        state.createOrderError = null;

        // Add success notification
        state.pendingNotifications.push({
          orderId: newOrder.id,
          type: 'status_update',
          message: 'Order created successfully',
          timestamp: Date.now(),
        });
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isCreatingOrder = false;
        state.createOrderError = action.error.message || 'Failed to create order';
      });

    // Update order status
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.isUpdatingOrder = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isUpdatingOrder = false;
        const updatedOrder = action.payload.order || action.payload;

        // Update order in list
        const index = state.orders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], ...updatedOrder };
        }

        // Update current order
        if (state.currentOrder?.id === updatedOrder.id) {
          state.currentOrder = { ...state.currentOrder, ...updatedOrder };
        }

        // Add notification
        state.pendingNotifications.push({
          orderId: updatedOrder.id,
          type: 'status_update',
          message: `Order status updated to ${updatedOrder.status}`,
          timestamp: Date.now(),
        });
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isUpdatingOrder = false;
        state.error = action.error.message || 'Failed to update order status';
      });

    // Cancel order
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.isCancellingOrder = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isCancellingOrder = false;
        const cancelledOrder = action.payload.order || action.payload;

        // Update order in list
        const index = state.orders.findIndex(order => order.id === cancelledOrder.id);
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], status: 'cancelled' };
        }

        // Update current order
        if (state.currentOrder?.id === cancelledOrder.id) {
          if (state.currentOrder) {
            state.currentOrder.status = 'cancelled';
          }
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isCancellingOrder = false;
        state.error = action.error.message || 'Failed to cancel order';
      });

    // Track order
    builder
      .addCase(trackOrder.pending, (state) => {
        state.isLoadingTracking = true;
        state.trackingError = null;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.isLoadingTracking = false;
        const { orderId, tracking } = action.payload;
        state.tracking[orderId] = tracking;

        // Update current order if it matches
        if (state.currentOrder?.id === orderId) {
          if (state.currentOrder) {
            state.currentOrder.tracking = tracking;
          }
        }

        state.trackingError = null;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.isLoadingTracking = false;
        state.trackingError = action.error.message || 'Failed to fetch tracking information';
      });

    // Download invoice
    builder
      .addCase(downloadInvoice.pending, (state) => {
        state.isDownloadingInvoice = true;
      })
      .addCase(downloadInvoice.fulfilled, (state) => {
        state.isDownloadingInvoice = false;
      })
      .addCase(downloadInvoice.rejected, (state, action) => {
        state.isDownloadingInvoice = false;
        state.error = action.error.message || 'Failed to download invoice';
      });

    // Request return
    builder
      .addCase(requestReturn.pending, (state) => {
        state.isRequestingReturn = true;
      })
      .addCase(requestReturn.fulfilled, (state, action) => {
        state.isRequestingReturn = false;
        const returnRequest = action.payload;

        // Add notification
        state.pendingNotifications.push({
          orderId: returnRequest.orderId,
          type: 'status_update',
          message: 'Return request submitted successfully',
          timestamp: Date.now(),
        });
      })
      .addCase(requestReturn.rejected, (state, action) => {
        state.isRequestingReturn = false;
        state.error = action.error.message || 'Failed to request return';
      });

    // Fetch order summary
    builder
      .addCase(fetchOrderSummary.fulfilled, (state, action) => {
        state.orderSummary = action.payload.summary || action.payload;
        state.recentOrders = action.payload.recentOrders || [];
      });

    // Process payment
    builder
      .addCase(processPayment.pending, (state) => {
        state.isProcessingPayment = true;
        state.paymentError = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.isProcessingPayment = false;
        const paymentResult = action.payload;

        // Update order payment status
        if (state.currentOrder && paymentResult.orderId === state.currentOrder.id) {
          state.currentOrder.payment = { ...state.currentOrder.payment, ...paymentResult.payment };
        }

        // Add notification
        state.pendingNotifications.push({
          orderId: paymentResult.orderId,
          type: paymentResult.success ? 'payment_success' : 'payment_failed',
          message: paymentResult.success ? 'Payment processed successfully' : 'Payment failed',
          timestamp: Date.now(),
        });

        state.paymentError = null;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.isProcessingPayment = false;
        state.paymentError = action.error.message || 'Payment processing failed';
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSearchQuery,
  selectOrder,
  deselectOrder,
  selectAllOrders,
  deselectAllOrders,
  toggleOrderSelection,
  toggleOrderExpansion,
  expandOrder,
  collapseOrder,
  setViewMode,
  setShowFilters,
  toggleFilters,
  clearCurrentOrder,
  updateOrderInList,
  addNotification,
  removeNotification,
  clearNotifications,
  clearError,
  invalidateCache,
  invalidateOrderCache,
} = orderSlice.actions;

// Selectors
export const selectOrders = (state: { order: OrderState }) => state.order.orders;
export const selectCurrentOrder = (state: { order: OrderState }) => state.order.currentOrder;
export const selectOrderSummary = (state: { order: OrderState }) => state.order.orderSummary;
export const selectOrderPagination = (state: { order: OrderState }) => state.order.pagination;
export const selectOrderFilters = (state: { order: OrderState }) => state.order.filters;
export const selectOrderLoading = (state: { order: OrderState }) => state.order.isLoading;
export const selectOrderError = (state: { order: OrderState }) => state.order.error;
export const selectSelectedOrders = (state: { order: OrderState }) => state.order.selectedOrders;
export const selectPendingNotifications = (state: { order: OrderState }) => state.order.pendingNotifications;

// Complex selectors
export const selectOrderById = (state: { order: OrderState }, orderId: string) =>
  state.order.orders.find(order => order.id === orderId) ||
  state.order.orderCache[orderId]?.order;

export const selectOrdersByStatus = (state: { order: OrderState }, status: OrderStatus) =>
  state.order.orders.filter(order => order.status === status);

export const selectRecentOrders = (state: { order: OrderState }, limit: number = 5) =>
  state.order.orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

export const selectOrderStats = (state: { order: OrderState }) => {
  const { orders } = state.order;
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);

  const totalRevenue = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total.amount, 0);

  return {
    totalOrders: orders.length,
    totalRevenue,
    averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    statusCounts,
  };
};

export const selectFilteredOrders = (state: { order: OrderState }) => {
  const { orders, filters, searchQuery } = state.order;

  return orders.filter(order => {
    // Status filter
    if (filters.status?.length && !filters.status.includes(order.status)) return false;

    // Payment status filter
    if (filters.paymentStatus?.length && !filters.paymentStatus.includes(order.paymentStatus)) return false;

    // Date range filter
    if (filters.dateRange) {
      const orderDate = new Date(order.createdAt);
      const startDate = typeof filters.dateRange.from === 'string' ? new Date(filters.dateRange.from) : filters.dateRange.from;
      const endDate = typeof filters.dateRange.to === 'string' ? new Date(filters.dateRange.to) : filters.dateRange.to;
      if (orderDate < startDate || orderDate > endDate) return false;
    }

    // Amount filters
    if (filters.amountRange?.min && order.total.amount < filters.amountRange.min) return false;
    if (filters.amountRange?.max && order.total.amount > filters.amountRange.max) return false;

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesOrderNumber = order.orderNumber.toLowerCase().includes(query);
      const customerName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim();
      const matchesCustomerName = customerName.toLowerCase().includes(query);
      const matchesCustomerEmail = order.user?.email?.toLowerCase().includes(query);

      if (!matchesOrderNumber && !matchesCustomerName && !matchesCustomerEmail) return false;
    }

    return true;
  });
};

export default orderSlice.reducer;
