/**
 * Order Context - Vardhman Mills Frontend
 * Manages order lifecycle, tracking, and order management
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

// Types
interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSKU: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  size?: string;
  color?: string;
  customization?: Record<string, unknown>;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
}

interface ShippingAddress {
  id: string;
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
  type: 'home' | 'office' | 'other';
  landmark?: string;
  instructions?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partial';
  
  // Items and pricing
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  shippingCost: number;
  tax: number;
  total: number;
  
  // Addresses
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  
  // Payment
  paymentMethod: string;
  paymentTransactionId?: string;
  
  // Shipping
  shippingMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  
  // Additional info
  notes?: string;
  customerNotes?: string;
  cancellationReason?: string;
  returnReason?: string;
  
  // Metadata
  source: 'web' | 'mobile' | 'admin' | 'api';
  metadata?: Record<string, unknown>;
}

interface OrderHistory {
  id: string;
  orderId: string;
  status: Order['status'];
  timestamp: Date;
  notes?: string;
  updatedBy?: string;
}

interface OrderState {
  // Orders
  orders: Order[];
  currentOrder?: Order;
  
  // Order creation
  draft: {
    items: OrderItem[];
    shippingAddress?: ShippingAddress;
    billingAddress?: ShippingAddress;
    paymentMethod?: string;
    shippingMethod?: string;
    notes?: string;
    discountCode?: string;
  };
  
  // UI state
  loading: boolean;
  creating: boolean;
  updating: boolean;
  error: string | null;
  
  // Filters and pagination
  filters: {
    status?: Order['status'][];
    dateRange?: { start: Date; end: Date };
    paymentStatus?: Order['paymentStatus'][];
    search?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Statistics
  stats: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    topProducts: { productId: string; quantity: number; revenue: number }[];
    statusDistribution: Record<Order['status'], number>;
  };
  
  lastUpdated: Date | null;
}

type OrderAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CREATING'; payload: boolean }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: { id: string; updates: Partial<Order> } }
  | { type: 'SET_CURRENT_ORDER'; payload: Order }
  | { type: 'CLEAR_CURRENT_ORDER' }
  | { type: 'UPDATE_DRAFT'; payload: Partial<OrderState['draft']> }
  | { type: 'CLEAR_DRAFT' }
  | { type: 'SET_FILTERS'; payload: Partial<OrderState['filters']> }
  | { type: 'SET_PAGINATION'; payload: Partial<OrderState['pagination']> }
  | { type: 'SET_STATS'; payload: OrderState['stats'] };

interface OrderContextType {
  state: OrderState;
  
  // Order management
  loadOrders: () => Promise<void>;
  loadOrder: (id: string) => Promise<Order | null>;
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  cancelOrder: (id: string, reason?: string) => Promise<void>;
  
  // Order status management
  confirmOrder: (id: string) => Promise<void>;
  shipOrder: (id: string, trackingNumber: string) => Promise<void>;
  deliverOrder: (id: string) => Promise<void>;
  
  // Draft order management
  updateDraft: (updates: Partial<OrderState['draft']>) => void;
  clearDraft: () => void;
  saveDraftOrder: () => Promise<void>;
  loadDraftOrder: () => void;
  
  // Order tracking
  trackOrder: (orderNumber: string) => Promise<OrderHistory[]>;
  getOrderHistory: (orderId: string) => Promise<OrderHistory[]>;
  
  // Filtering and search
  setFilters: (filters: Partial<OrderState['filters']>) => void;
  searchOrders: (query: string) => Promise<void>;
  
  // Pagination
  setPagination: (pagination: Partial<OrderState['pagination']>) => void;
  nextPage: () => void;
  previousPage: () => void;
  
  // Statistics
  loadStats: () => Promise<void>;
  
  // Utilities
  calculateOrderTotal: (items: OrderItem[], shippingCost?: number, tax?: number, discount?: number) => number;
  generateOrderNumber: () => string;
  validateOrder: (orderData: Partial<Order>) => { valid: boolean; errors: string[] };
  
  // Export and reporting
  exportOrders: (format: 'csv' | 'pdf' | 'excel') => Promise<void>;
  generateInvoice: (orderId: string) => Promise<Blob>;
  
  // Customer orders
  getCustomerOrders: (customerId: string) => Promise<Order[]>;
  
  // Inventory integration
  checkInventoryAvailability: (items: OrderItem[]) => Promise<{ available: boolean; unavailableItems: string[] }>;
  
  // Notifications
  sendOrderConfirmation: (orderId: string) => Promise<void>;
  sendShippingNotification: (orderId: string) => Promise<void>;
  sendDeliveryNotification: (orderId: string) => Promise<void>;
}

// Initial state
const initialState: OrderState = {
  orders: [],
  draft: {
    items: [],
  },
  loading: false,
  creating: false,
  updating: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  stats: {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    topProducts: [],
    statusDistribution: {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
      returned: 0,
    },
  },
  lastUpdated: null,
};

// Utility functions
const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `VM${year}${month}${day}${random}`;
};

const calculateOrderTotal = (
  items: OrderItem[], 
  shippingCost = 0, 
  tax = 0, 
  discount = 0
): number => {
  const subtotal = items.reduce((total, item) => total + item.totalPrice, 0);
  return subtotal + shippingCost + tax - discount;
};

const validateOrder = (orderData: Partial<Order>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!orderData.items || orderData.items.length === 0) {
    errors.push('Order must have at least one item');
  }
  
  if (!orderData.shippingAddress) {
    errors.push('Shipping address is required');
  }
  
  if (!orderData.paymentMethod) {
    errors.push('Payment method is required');
  }
  
  if (orderData.items) {
    orderData.items.forEach((item, index) => {
      if (!item.productId) {
        errors.push(`Item ${index + 1}: Product ID is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Valid quantity is required`);
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        errors.push(`Item ${index + 1}: Valid unit price is required`);
      }
    });
  }
  
  return { valid: errors.length === 0, errors };
};

// Reducer
const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_CREATING':
      return { ...state, creating: action.payload };
    
    case 'SET_UPDATING':
      return { ...state, updating: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_ORDERS':
      return {
        ...state,
        orders: action.payload,
        lastUpdated: new Date(),
      };
    
    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        lastUpdated: new Date(),
      };
    
    case 'UPDATE_ORDER': {
      const updatedOrders = state.orders.map(order =>
        order.id === action.payload.id
          ? { ...order, ...action.payload.updates, updatedAt: new Date() }
          : order
      );
      
      return {
        ...state,
        orders: updatedOrders,
        currentOrder: state.currentOrder?.id === action.payload.id 
          ? { ...state.currentOrder, ...action.payload.updates, updatedAt: new Date() }
          : state.currentOrder,
        lastUpdated: new Date(),
      };
    }
    
    case 'SET_CURRENT_ORDER':
      return { ...state, currentOrder: action.payload };
    
    case 'CLEAR_CURRENT_ORDER':
      return { ...state, currentOrder: undefined };
    
    case 'UPDATE_DRAFT':
      return {
        ...state,
        draft: { ...state.draft, ...action.payload },
      };
    
    case 'CLEAR_DRAFT':
      return {
        ...state,
        draft: { items: [] },
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    default:
      return state;
  }
};

// Context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Provider
export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  
  // Load data on mount
  useEffect(() => {
    loadOrders();
    loadStats();
    loadDraftOrder();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.draft.items.length > 0) {
        saveDraftOrder();
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.draft]);
  
  // Context methods
  const loadOrders = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const queryParams = new URLSearchParams();
      
      // Add filters to query
      if (state.filters.status?.length) {
        queryParams.append('status', state.filters.status.join(','));
      }
      if (state.filters.paymentStatus?.length) {
        queryParams.append('paymentStatus', state.filters.paymentStatus.join(','));
      }
      if (state.filters.search) {
        queryParams.append('search', state.filters.search);
      }
      if (state.filters.dateRange) {
        queryParams.append('startDate', state.filters.dateRange.start.toISOString());
        queryParams.append('endDate', state.filters.dateRange.end.toISOString());
      }
      
      // Add pagination
      queryParams.append('page', state.pagination.page.toString());
      queryParams.append('limit', state.pagination.limit.toString());
      
      const response = await fetch(`/api/orders?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const orders = data.orders.map((order: Order) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          confirmedAt: order.confirmedAt ? new Date(order.confirmedAt) : undefined,
          shippedAt: order.shippedAt ? new Date(order.shippedAt) : undefined,
          deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined,
          estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
          actualDelivery: order.actualDelivery ? new Date(order.actualDelivery) : undefined,
        }));
        
        dispatch({ type: 'SET_ORDERS', payload: orders });
        dispatch({ 
          type: 'SET_PAGINATION', 
          payload: { 
            total: data.total, 
            totalPages: data.totalPages 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load orders' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const loadOrder = async (id: string): Promise<Order | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`/api/orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        const order: Order = {
          ...data.order,
          createdAt: new Date(data.order.createdAt),
          updatedAt: new Date(data.order.updatedAt),
          confirmedAt: data.order.confirmedAt ? new Date(data.order.confirmedAt) : undefined,
          shippedAt: data.order.shippedAt ? new Date(data.order.shippedAt) : undefined,
          deliveredAt: data.order.deliveredAt ? new Date(data.order.deliveredAt) : undefined,
          estimatedDelivery: data.order.estimatedDelivery ? new Date(data.order.estimatedDelivery) : undefined,
          actualDelivery: data.order.actualDelivery ? new Date(data.order.actualDelivery) : undefined,
        };
        
        dispatch({ type: 'SET_CURRENT_ORDER', payload: order });
        return order;
      }
      return null;
    } catch (error) {
      console.error('Failed to load order:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load order' });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    try {
      dispatch({ type: 'SET_CREATING', payload: true });
      
      // Validate order
      const validation = validateOrder(orderData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          orderNumber: generateOrderNumber(),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const order: Order = {
          ...data.order,
          createdAt: new Date(data.order.createdAt),
          updatedAt: new Date(data.order.updatedAt),
        };
        
        dispatch({ type: 'ADD_ORDER', payload: order });
        dispatch({ type: 'CLEAR_DRAFT' });
        
        toast.success(`Order ${order.orderNumber} created successfully`);
        
        // Send confirmation email
        await sendOrderConfirmation(order.id);
        
        return order;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      const message = error instanceof Error ? error.message : 'Failed to create order';
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_CREATING', payload: false });
    }
  };
  
  const updateOrder = async (id: string, updates: Partial<Order>): Promise<void> => {
    try {
      dispatch({ type: 'SET_UPDATING', payload: true });
      
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        dispatch({ type: 'UPDATE_ORDER', payload: { id, updates } });
        toast.success('Order updated successfully');
      } else {
        throw new Error('Failed to update order');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order');
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
    }
  };
  
  const cancelOrder = async (id: string, reason?: string): Promise<void> => {
    try {
      const response = await fetch(`/api/orders/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      
      if (response.ok) {
        dispatch({ 
          type: 'UPDATE_ORDER', 
          payload: { 
            id, 
            updates: { 
              status: 'cancelled', 
              cancellationReason: reason 
            } 
          } 
        });
        toast.success('Order cancelled successfully');
      } else {
        throw new Error('Failed to cancel order');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Failed to cancel order');
    }
  };
  
  const confirmOrder = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/orders/${id}/confirm`, {
        method: 'POST',
      });
      
      if (response.ok) {
        dispatch({ 
          type: 'UPDATE_ORDER', 
          payload: { 
            id, 
            updates: { 
              status: 'confirmed', 
              confirmedAt: new Date() 
            } 
          } 
        });
        toast.success('Order confirmed successfully');
      } else {
        throw new Error('Failed to confirm order');
      }
    } catch (error) {
      console.error('Failed to confirm order:', error);
      toast.error('Failed to confirm order');
    }
  };
  
  const shipOrder = async (id: string, trackingNumber: string): Promise<void> => {
    try {
      const response = await fetch(`/api/orders/${id}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber }),
      });
      
      if (response.ok) {
        dispatch({ 
          type: 'UPDATE_ORDER', 
          payload: { 
            id, 
            updates: { 
              status: 'shipped', 
              trackingNumber,
              shippedAt: new Date() 
            } 
          } 
        });
        
        // Send shipping notification
        await sendShippingNotification(id);
        
        toast.success('Order shipped successfully');
      } else {
        throw new Error('Failed to ship order');
      }
    } catch (error) {
      console.error('Failed to ship order:', error);
      toast.error('Failed to ship order');
    }
  };
  
  const deliverOrder = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/orders/${id}/deliver`, {
        method: 'POST',
      });
      
      if (response.ok) {
        dispatch({ 
          type: 'UPDATE_ORDER', 
          payload: { 
            id, 
            updates: { 
              status: 'delivered', 
              deliveredAt: new Date(),
              actualDelivery: new Date()
            } 
          } 
        });
        
        // Send delivery notification
        await sendDeliveryNotification(id);
        
        toast.success('Order delivered successfully');
      } else {
        throw new Error('Failed to deliver order');
      }
    } catch (error) {
      console.error('Failed to deliver order:', error);
      toast.error('Failed to deliver order');
    }
  };
  
  const updateDraft = (updates: Partial<OrderState['draft']>): void => {
    dispatch({ type: 'UPDATE_DRAFT', payload: updates });
  };
  
  const clearDraft = (): void => {
    dispatch({ type: 'CLEAR_DRAFT' });
    localStorage.removeItem('order_draft');
  };
  
  const saveDraftOrder = async (): Promise<void> => {
    try {
      localStorage.setItem('order_draft', JSON.stringify(state.draft));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };
  
  const loadDraftOrder = (): void => {
    try {
      const saved = localStorage.getItem('order_draft');
      if (saved) {
        const draft = JSON.parse(saved);
        dispatch({ type: 'UPDATE_DRAFT', payload: draft });
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  };
  
  const trackOrder = async (orderNumber: string): Promise<OrderHistory[]> => {
    try {
      const response = await fetch(`/api/orders/track/${orderNumber}`);
      if (response.ok) {
        const data = await response.json();
        return data.history.map((item: OrderHistory) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to track order:', error);
      return [];
    }
  };
  
  const getOrderHistory = async (orderId: string): Promise<OrderHistory[]> => {
    try {
      const response = await fetch(`/api/orders/${orderId}/history`);
      if (response.ok) {
        const data = await response.json();
        return data.history.map((item: OrderHistory) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get order history:', error);
      return [];
    }
  };
  
  const setFilters = (filters: Partial<OrderState['filters']>): void => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };
  
  const searchOrders = async (query: string): Promise<void> => {
    dispatch({ type: 'SET_FILTERS', payload: { search: query } });
    await loadOrders();
  };
  
  const setPagination = (pagination: Partial<OrderState['pagination']>): void => {
    dispatch({ type: 'SET_PAGINATION', payload: pagination });
  };
  
  const nextPage = (): void => {
    if (state.pagination.page < state.pagination.totalPages) {
      dispatch({ 
        type: 'SET_PAGINATION', 
        payload: { page: state.pagination.page + 1 } 
      });
    }
  };
  
  const previousPage = (): void => {
    if (state.pagination.page > 1) {
      dispatch({ 
        type: 'SET_PAGINATION', 
        payload: { page: state.pagination.page - 1 } 
      });
    }
  };
  
  const loadStats = async (): Promise<void> => {
    try {
      const response = await fetch('/api/orders/stats');
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_STATS', payload: data.stats });
      }
    } catch (error) {
      console.error('Failed to load order stats:', error);
    }
  };
  
  const exportOrders = async (format: 'csv' | 'pdf' | 'excel'): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`/api/orders/export?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters: state.filters }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_export_${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast.success('Orders exported successfully');
      } else {
        throw new Error('Failed to export orders');
      }
    } catch (error) {
      console.error('Failed to export orders:', error);
      toast.error('Failed to export orders');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const generateInvoice = async (orderId: string): Promise<Blob> => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`);
      if (response.ok) {
        return await response.blob();
      }
      throw new Error('Failed to generate invoice');
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      throw error;
    }
  };
  
  const getCustomerOrders = async (customerId: string): Promise<Order[]> => {
    try {
      const response = await fetch(`/api/customers/${customerId}/orders`);
      if (response.ok) {
        const data = await response.json();
        return data.orders.map((order: Order) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get customer orders:', error);
      return [];
    }
  };
  
  const checkInventoryAvailability = async (items: OrderItem[]): Promise<{ available: boolean; unavailableItems: string[] }> => {
    try {
      const response = await fetch('/api/inventory/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      return { available: false, unavailableItems: [] };
    } catch (error) {
      console.error('Failed to check inventory:', error);
      return { available: false, unavailableItems: [] };
    }
  };
  
  const sendOrderConfirmation = async (orderId: string): Promise<void> => {
    try {
      await fetch(`/api/orders/${orderId}/confirm-email`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
    }
  };
  
  const sendShippingNotification = async (orderId: string): Promise<void> => {
    try {
      await fetch(`/api/orders/${orderId}/shipping-notification`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to send shipping notification:', error);
    }
  };
  
  const sendDeliveryNotification = async (orderId: string): Promise<void> => {
    try {
      await fetch(`/api/orders/${orderId}/delivery-notification`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to send delivery notification:', error);
    }
  };
  
  // Auto-reload orders when filters or pagination change
  useEffect(() => {
    loadOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filters, state.pagination.page, state.pagination.limit]);
  
  return (
    <OrderContext.Provider value={{
      state,
      loadOrders,
      loadOrder,
      createOrder,
      updateOrder,
      cancelOrder,
      confirmOrder,
      shipOrder,
      deliverOrder,
      updateDraft,
      clearDraft,
      saveDraftOrder,
      loadDraftOrder,
      trackOrder,
      getOrderHistory,
      setFilters,
      searchOrders,
      setPagination,
      nextPage,
      previousPage,
      loadStats,
      calculateOrderTotal,
      generateOrderNumber,
      validateOrder,
      exportOrders,
      generateInvoice,
      getCustomerOrders,
      checkInventoryAvailability,
      sendOrderConfirmation,
      sendShippingNotification,
      sendDeliveryNotification,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

// Hook
export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;
export type { Order, OrderItem, ShippingAddress, OrderHistory, OrderState };