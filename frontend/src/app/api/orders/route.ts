/**
 * Orders API Route
 * 
 * Handles order listing and management with comprehensive filtering.
 * Supports order history, status tracking, and export functionality.
 * Includes analytics, refund tracking, and customer service integration.
 * 
 * @module api/orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const OrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum([
    'pending',
    'processing',
    'confirmed',
    'shipped',
    'out-for-delivery',
    'delivered',
    'cancelled',
    'refunded',
    'failed',
  ]).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded', 'partially-refunded']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  search: z.string().optional(), // Order ID, customer name, email
  sortBy: z.enum(['createdAt', 'total', 'status', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Types
interface OrderItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string;
    sku: string;
  };
  variantId: string | null;
  variant: {
    id: string;
    name: string;
    attributes: Record<string, string>;
  } | null;
  quantity: number;
  price: number;
  salePrice: number | null;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
}

interface OrderAddress {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string | null;
}

interface OrderShipping {
  method: string;
  provider: string;
  cost: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

interface OrderPayment {
  method: 'credit-card' | 'debit-card' | 'upi' | 'net-banking' | 'wallet' | 'cod';
  provider: string | null;
  transactionId: string | null;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially-refunded';
  amount: number;
  currency: string;
  paidAt: string | null;
  refundedAmount: number;
  refundedAt: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customer: {
    id: string | null;
    name: string;
    email: string;
    phone: string | null;
  };
  items: OrderItem[];
  itemsCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'out-for-delivery' | 'delivered' | 'cancelled' | 'refunded' | 'failed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially-refunded';
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  shipping: OrderShipping;
  payment: OrderPayment;
  appliedCoupons: Array<{
    id: string;
    code: string;
    discount: number;
  }>;
  giftCard: {
    id: string;
    cardNumber: string;
    amount: number;
  } | null;
  notes: string | null;
  customerNotes: string | null;
  internalNotes: string | null;
  statusHistory: Array<{
    status: string;
    note: string | null;
    createdAt: string;
    createdBy: string | null;
  }>;
  isGuestOrder: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  refundRequests: Array<{
    id: string;
    amount: number;
    reason: string;
    status: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    statistics: {
      totalOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
      statusBreakdown: Record<string, number>;
      paymentStatusBreakdown: Record<string, number>;
    };
    filters: {
      availableStatuses: string[];
      availablePaymentMethods: string[];
      dateRange: {
        earliest: string | null;
        latest: string | null;
      };
    };
  };
  timestamp: string;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

/**
 * GET /api/orders
 * 
 * Retrieves order list with filtering (requires authentication)
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - status: Filter by order status
 * - paymentStatus: Filter by payment status
 * - dateFrom: Filter orders from date
 * - dateTo: Filter orders to date
 * - minAmount: Minimum order amount
 * - maxAmount: Maximum order amount
 * - search: Search by order number, customer name, or email
 * - sortBy: Sort field (createdAt, total, status, updatedAt)
 * - sortOrder: Sort direction (asc, desc)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = OrdersQuerySchema.safeParse(params);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const queryParams = validationResult.data;

    // Get authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to view orders',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Build backend URL with query parameters
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/orders`
    );

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        backendUrl.searchParams.append(key, String(value));
      }
    });

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store', // Orders should not be cached
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Invalid or expired authentication token',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 401 }
        );
      }

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch orders',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: OrdersResponse = {
      success: true,
      data: {
        orders: data.data?.orders || data.orders || [],
        pagination: data.data?.pagination || data.pagination || {
          page: queryParams.page,
          limit: queryParams.limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        statistics: data.data?.statistics || data.statistics || {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          statusBreakdown: {},
          paymentStatusBreakdown: {},
        },
        filters: data.data?.filters || data.filters || {
          availableStatuses: [],
          availablePaymentMethods: [],
          dateRange: {
            earliest: null,
            latest: null,
          },
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Orders API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching orders',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders
 * 
 * Bulk update order status (Admin only)
 * 
 * Body:
 * {
 *   orderIds: string[],
 *   status?: string,
 *   paymentStatus?: string,
 *   note?: string
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication (Admin only)
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to update orders',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.orderIds || !Array.isArray(body.orderIds) || body.orderIds.length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Order IDs array is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (!body.status && !body.paymentStatus) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'At least one of status or paymentStatus must be provided',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/orders/bulk-update`;
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 403) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to update orders',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to update orders',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        data: {
          updatedCount: data.data?.updatedCount || body.orderIds.length,
          message: 'Orders updated successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bulk Update Orders API Error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON in request body',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while updating orders',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

