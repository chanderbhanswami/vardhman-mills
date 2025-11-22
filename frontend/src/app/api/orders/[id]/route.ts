/**
 * Individual Order API Route
 * 
 * Handles individual order details retrieval.
 * Provides comprehensive order information including items, addresses, payment, shipping.
 * Supports order updates (admin only) and status history.
 * 
 * @module api/orders/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
  customization: Record<string, string> | null;
  status: string;
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
  signature: string | null;
  shippingLabel: string | null;
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
  paymentDetails: {
    last4: string | null;
    brand: string | null;
    expiryMonth: number | null;
    expiryYear: number | null;
  } | null;
}

interface OrderStatusHistory {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
  createdBy: {
    id: string | null;
    name: string;
    type: 'customer' | 'admin' | 'system';
  };
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
    discountType: 'percentage' | 'fixed';
  }>;
  giftCard: {
    id: string;
    cardNumber: string;
    amount: number;
    balanceUsed: number;
  } | null;
  notes: string | null;
  customerNotes: string | null;
  internalNotes: string | null;
  statusHistory: OrderStatusHistory[];
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
  invoiceUrl: string | null;
  receiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
  expectedDeliveryDate: string | null;
}

interface OrderResponse {
  success: boolean;
  data: {
    order: Order;
    timeline: Array<{
      status: string;
      title: string;
      description: string;
      timestamp: string;
      isCompleted: boolean;
      isCurrent: boolean;
    }>;
    allowedActions: {
      canCancel: boolean;
      canReturn: boolean;
      canRequestRefund: boolean;
      canTrack: boolean;
      canDownloadInvoice: boolean;
      canReorder: boolean;
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
 * GET /api/orders/[id]
 * 
 * Get individual order details
 * 
 * Path Parameters:
 * - id: Order ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Order ID is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Get authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to view order',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Fetch from backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/${id}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'ORDER_NOT_FOUND',
              message: 'Order not found',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to view this order',
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
            message: errorData.message || 'Failed to fetch order',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: OrderResponse = {
      success: true,
      data: {
        order: data.data?.order || data.order,
        timeline: data.data?.timeline || [],
        allowedActions: data.data?.allowedActions || {
          canCancel: false,
          canReturn: false,
          canRequestRefund: false,
          canTrack: false,
          canDownloadInvoice: false,
          canReorder: false,
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
    console.error('Get Order API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching order',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id]
 * 
 * Update order details (Admin only)
 * 
 * Body:
 * {
 *   status?: string,
 *   paymentStatus?: string,
 *   trackingNumber?: string,
 *   internalNotes?: string
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Order ID is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check authentication (Admin only)
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to update order',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/${id}`;
    
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

      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'ORDER_NOT_FOUND',
              message: 'Order not found',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to update order',
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
          order: data.data?.order || data.order,
          message: 'Order updated successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update Order API Error:', error);

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
          message: 'An unexpected error occurred while updating order',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[id]
 * 
 * Delete order (Admin only, soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Order ID is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check authentication (Admin only)
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to delete order',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/${id}`;
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 403) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to delete orders',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }

      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'ORDER_NOT_FOUND',
              message: 'Order not found',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to delete order',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Order deleted successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Order API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while deleting order',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
