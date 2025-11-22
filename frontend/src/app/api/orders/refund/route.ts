/**
 * Order Refund API Route
 * 
 * Handles refund requests for orders.
 * Supports partial and full refunds with reason tracking.
 * Includes refund policy validation and admin approval workflow.
 * 
 * @module api/orders/refund
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const RefundRequestSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  reason: z.enum([
    'defective-product',
    'wrong-item',
    'not-as-described',
    'damaged-in-shipping',
    'arrived-late',
    'changed-mind',
    'better-price-found',
    'duplicate-order',
    'other',
  ]),
  description: z.string().max(1000).optional(),
  refundType: z.enum(['full', 'partial']),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().int().positive(),
    reason: z.string().optional(),
  })).optional(), // Required for partial refunds
  refundAmount: z.number().min(0).optional(), // Required for partial refunds
  returnShipping: z.boolean().default(false), // Whether customer wants return shipping label
  returnMethod: z.enum(['pickup', 'drop-off', 'self-ship']).optional(),
  images: z.array(z.string().url()).max(5).optional(), // Evidence images
  bankDetails: z.object({
    accountHolder: z.string(),
    accountNumber: z.string(),
    ifscCode: z.string().optional(),
    bankName: z.string().optional(),
  }).optional(), // For bank transfer refunds
}).refine(
  (data) => {
    if (data.refundType === 'partial') {
      return data.items && data.items.length > 0;
    }
    return true;
  },
  {
    message: 'Items are required for partial refunds',
    path: ['items'],
  }
);

const ProcessRefundSchema = z.object({
  refundRequestId: z.string().min(1),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
  approvedAmount: z.number().min(0).optional(),
  refundMethod: z.enum(['original', 'bank-transfer', 'store-credit']).optional(),
  processingNote: z.string().max(500).optional(),
});

// Types
interface RefundRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  description: string | null;
  refundType: 'full' | 'partial';
  requestedAmount: number;
  approvedAmount: number | null;
  items: Array<{
    itemId: string;
    productName: string;
    quantity: number;
    price: number;
    reason: string | null;
  }> | null;
  returnShipping: boolean;
  returnMethod: string | null;
  returnTrackingNumber: string | null;
  images: string[];
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    ifscCode: string | null;
    bankName: string | null;
  } | null;
  status: 'pending' | 'under-review' | 'approved' | 'rejected' | 'processed' | 'completed';
  refundMethod: 'original' | 'bank-transfer' | 'store-credit' | null;
  rejectionReason: string | null;
  processingNote: string | null;
  processedBy: string | null;
  processedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RefundRequestResponse {
  success: boolean;
  data: {
    refundRequest: RefundRequest;
    message: string;
    estimatedProcessingTime: {
      min: number;
      max: number;
      unit: 'days' | 'hours';
    };
  };
  timestamp: string;
}

interface ProcessRefundResponse {
  success: boolean;
  data: {
    refundRequest: RefundRequest;
    message: string;
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
 * POST /api/orders/refund
 * 
 * Submit a refund request for an order
 * 
 * Body:
 * {
 *   orderId: string,
 *   reason: string,
 *   description?: string,
 *   refundType: 'full' | 'partial',
 *   items?: array (for partial refunds),
 *   refundAmount?: number (for partial refunds),
 *   returnShipping: boolean,
 *   returnMethod?: string,
 *   images?: string[],
 *   bankDetails?: object
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = RefundRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid refund request data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const refundData = validationResult.data;

    // Get authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to request refund',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/refund`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(refundData),
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
              code: 'REFUND_NOT_ALLOWED',
              message: 'Refund request cannot be processed for this order',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 409 }
        );
      }

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to submit refund request',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: RefundRequestResponse = {
      success: true,
      data: {
        refundRequest: data.data?.refundRequest || data.refundRequest,
        message: 'Refund request submitted successfully',
        estimatedProcessingTime: data.data?.estimatedProcessingTime || {
          min: 3,
          max: 7,
          unit: 'days' as const,
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Refund Request API Error:', error);

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
          message: 'An unexpected error occurred while submitting refund request',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/refund
 * 
 * Process a refund request (Admin only)
 * 
 * Body:
 * {
 *   refundRequestId: string,
 *   action: 'approve' | 'reject',
 *   rejectionReason?: string,
 *   approvedAmount?: number,
 *   refundMethod?: 'original' | 'bank-transfer' | 'store-credit',
 *   processingNote?: string
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
            message: 'Authentication required to process refund',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = ProcessRefundSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid refund processing data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const processData = validationResult.data;

    // Validate action-specific requirements
    if (processData.action === 'reject' && !processData.rejectionReason) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Rejection reason is required when rejecting refund',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (processData.action === 'approve' && !processData.refundMethod) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refund method is required when approving refund',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/refund/process`;
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(processData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 403) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to process refunds',
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
              code: 'REFUND_REQUEST_NOT_FOUND',
              message: 'Refund request not found',
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
            message: errorData.message || 'Failed to process refund',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: ProcessRefundResponse = {
      success: true,
      data: {
        refundRequest: data.data?.refundRequest || data.refundRequest,
        message: `Refund request ${processData.action === 'approve' ? 'approved' : 'rejected'} successfully`,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Process Refund API Error:', error);

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
          message: 'An unexpected error occurred while processing refund',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/refund
 * 
 * Get refund requests (Admin: all requests, User: their requests)
 * 
 * Query Parameters:
 * - orderId: Filter by order ID
 * - status: Filter by refund status
 * - page: Page number
 * - limit: Items per page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to view refund requests',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Build backend URL with query parameters
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/refund`
    );

    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

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

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch refund requests',
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
        data: data.data || data,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Get Refund Requests API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching refund requests',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
