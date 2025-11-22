/**
 * Order Cancellation API Route
 * 
 * Handles order cancellation with policy validation.
 * Supports partial cancellation, refund initiation, and reason tracking.
 * Validates cancellation eligibility based on order status and time window.
 * 
 * @module api/orders/cancel
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const CancelOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  reason: z.enum([
    'changed-mind',
    'ordered-by-mistake',
    'found-better-price',
    'delivery-time-too-long',
    'incorrect-address',
    'payment-issues',
    'product-not-needed',
    'other',
  ]),
  description: z.string().max(500).optional(),
  cancelType: z.enum(['full', 'partial']).default('full'),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().int().positive(),
  })).optional(), // Required for partial cancellation
  requestRefund: z.boolean().default(true),
  refundMethod: z.enum(['original', 'store-credit', 'bank-transfer']).optional(),
});

// Types
interface CancellationPolicy {
  allowed: boolean;
  reason: string | null;
  timeRemaining: {
    value: number;
    unit: 'hours' | 'minutes';
  } | null;
  refundAmount: number;
  refundPercentage: number;
  cancellationFee: number;
  restockingFee: number;
}

interface CancelledOrder {
  id: string;
  orderNumber: string;
  status: 'cancelled';
  cancellationReason: string;
  cancellationDescription: string | null;
  cancelledAt: string;
  cancelledBy: string | null;
  cancelType: 'full' | 'partial';
  cancelledItems: Array<{
    itemId: string;
    productName: string;
    quantity: number;
    refundAmount: number;
  }> | null;
  refundStatus: 'pending' | 'processing' | 'completed' | 'not-applicable';
  refundAmount: number;
  refundMethod: string | null;
  cancellationFee: number;
  restockingFee: number;
  totalRefund: number;
}

interface CancelOrderResponse {
  success: boolean;
  data: {
    order: CancelledOrder;
    refundProcessing: {
      status: string;
      estimatedTime: {
        min: number;
        max: number;
        unit: 'days' | 'hours';
      };
      method: string;
    } | null;
    message: string;
  };
  timestamp: string;
}

interface PolicyResponse {
  success: boolean;
  data: {
    policy: CancellationPolicy;
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
 * POST /api/orders/cancel
 * 
 * Cancel an order (full or partial)
 * 
 * Body:
 * {
 *   orderId: string,
 *   reason: string,
 *   description?: string,
 *   cancelType: 'full' | 'partial',
 *   items?: array (for partial cancellation),
 *   requestRefund: boolean,
 *   refundMethod?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = CancelOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid cancellation data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const cancellationData = validationResult.data;

    // Validate partial cancellation
    if (cancellationData.cancelType === 'partial') {
      if (!cancellationData.items || cancellationData.items.length === 0) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Items are required for partial cancellation',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
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
            message: 'Authentication required to cancel order',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/cancel`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(cancellationData),
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

      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'CANCELLATION_NOT_ALLOWED',
              message: errorData.message || 'Order cannot be cancelled at this stage',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 409 }
        );
      }

      if (response.status === 410) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'CANCELLATION_WINDOW_EXPIRED',
              message: 'The cancellation window for this order has expired',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 410 }
        );
      }

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to cancel order',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: CancelOrderResponse = {
      success: true,
      data: {
        order: data.data?.order || data.order,
        refundProcessing: data.data?.refundProcessing || (
          cancellationData.requestRefund ? {
            status: 'pending',
            estimatedTime: {
              min: 5,
              max: 7,
              unit: 'days' as const,
            },
            method: cancellationData.refundMethod || 'original',
          } : null
        ),
        message: 'Order cancelled successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Cancel Order API Error:', error);

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
          message: 'An unexpected error occurred while cancelling order',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/cancel
 * 
 * Check cancellation policy for an order
 * 
 * Query Parameters:
 * - orderId: Order ID to check
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
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
            message: 'Authentication required to check cancellation policy',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/cancel/policy`
    );
    backendUrl.searchParams.append('orderId', orderId);

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
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

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch cancellation policy',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: PolicyResponse = {
      success: true,
      data: {
        policy: data.data?.policy || data.policy || {
          allowed: false,
          reason: 'Unknown',
          timeRemaining: null,
          refundAmount: 0,
          refundPercentage: 0,
          cancellationFee: 0,
          restockingFee: 0,
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
    console.error('Check Cancellation Policy API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while checking cancellation policy',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
