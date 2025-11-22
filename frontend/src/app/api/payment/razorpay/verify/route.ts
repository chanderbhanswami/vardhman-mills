/**
 * Razorpay Payment Verification API Route
 * 
 * Handles Razorpay payment signature verification.
 * Validates payment authenticity and updates order status.
 * Implements security checks and idempotency.
 * 
 * @module api/payment/razorpay/verify
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const VerifyPaymentSchema = z.object({
  razorpayPaymentId: z.string().min(1, 'Payment ID is required'),
  razorpayOrderId: z.string().min(1, 'Order ID is required'),
  razorpaySignature: z.string().min(1, 'Signature is required'),
  orderId: z.string().min(1, 'Order ID is required'), // Our order ID
});

// Types
interface VerifiedPayment {
  id: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  status: 'authorized' | 'captured' | 'failed';
  method: string;
  verified: boolean;
  verifiedAt: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
  };
  transaction: {
    id: string;
    transactionId: string;
    gateway: 'razorpay';
    status: string;
  };
}

interface VerifyPaymentResponse {
  success: boolean;
  data: {
    payment: VerifiedPayment;
    order: {
      id: string;
      orderNumber: string;
      status: string;
      total: number;
    };
    message: string;
    redirectUrl: string | null;
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
 * POST /api/payment/razorpay/verify
 * 
 * Verify Razorpay payment signature
 * 
 * Body:
 * {
 *   razorpayPaymentId: string,
 *   razorpayOrderId: string,
 *   razorpaySignature: string,
 *   orderId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = VerifyPaymentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid payment verification data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const verificationData = validationResult.data;

    // Get authentication (optional for guest orders)
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    // Collect metadata for security
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const enrichedVerificationData = {
      ...verificationData,
      metadata: {
        ipAddress: clientIp,
        userAgent,
        verifiedAt: new Date().toISOString(),
      },
    };

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payment/razorpay/verify`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(enrichedVerificationData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 400) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'SIGNATURE_VERIFICATION_FAILED',
              message: 'Payment signature verification failed. This payment may be fraudulent.',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
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

      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'PAYMENT_ALREADY_VERIFIED',
              message: 'Payment has already been verified',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 409 }
        );
      }

      if (response.status === 503) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'PAYMENT_GATEWAY_ERROR',
              message: 'Payment gateway is temporarily unavailable',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 503 }
        );
      }

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to verify payment',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: VerifyPaymentResponse = {
      success: true,
      data: {
        payment: data.data?.payment || data.payment,
        order: data.data?.order || data.order,
        message: 'Payment verified successfully',
        redirectUrl: data.data?.redirectUrl || `/orders/${verificationData.orderId}`,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Verify Payment API Error:', error);

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
          message: 'An unexpected error occurred while verifying payment',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/razorpay/verify
 * 
 * Get payment verification status
 * 
 * Query Parameters:
 * - razorpayPaymentId: Razorpay payment ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const razorpayPaymentId = searchParams.get('razorpayPaymentId');

    if (!razorpayPaymentId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Razorpay payment ID is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Get authentication (optional)
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payment/razorpay/payment-status`
    );
    backendUrl.searchParams.append('razorpayPaymentId', razorpayPaymentId);

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'PAYMENT_NOT_FOUND',
              message: 'Payment not found',
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
            message: errorData.message || 'Failed to fetch payment status',
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
    console.error('Get Payment Status API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching payment status',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
