/**
 * Razorpay Create Order API Route
 * 
 * Handles Razorpay order creation for payment processing.
 * Generates Razorpay order ID and prepares payment parameters.
 * Supports partial payments, offers, and custom notes.
 * 
 * @module api/payment/razorpay/create-order
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const CreateRazorpayOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('INR'),
  receipt: z.string().optional(),
  notes: z.record(z.string(), z.string()).optional(),
  partialPayment: z.boolean().default(false),
  firstPaymentMinAmount: z.number().positive().optional(),
  offerId: z.string().optional(),
});

// Types
interface RazorpayOrderData {
  id: string; // Razorpay order ID
  entity: 'order';
  amount: number; // Amount in smallest currency unit (paise for INR)
  amountPaid: number;
  amountDue: number;
  currency: string;
  receipt: string | null;
  offerId: string | null;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: Record<string, string>;
  createdAt: number; // Unix timestamp
}

interface CreateOrderResponse {
  success: boolean;
  data: {
    razorpayOrder: RazorpayOrderData;
    order: {
      id: string;
      orderNumber: string;
      amount: number;
      currency: string;
    };
    paymentConfig: {
      key: string; // Razorpay key ID
      orderId: string; // Razorpay order ID
      amount: number;
      currency: string;
      name: string;
      description: string;
      image: string | null;
      prefill: {
        name: string | null;
        email: string | null;
        contact: string | null;
      };
      theme: {
        color: string;
      };
      modal: {
        ondismiss: string | null;
      };
      callback_url: string | null;
      redirect: boolean;
      handler: string;
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
 * POST /api/payment/razorpay/create-order
 * 
 * Create Razorpay order for payment processing
 * 
 * Body:
 * {
 *   orderId: string,
 *   amount: number,
 *   currency: string,
 *   receipt?: string,
 *   notes?: object,
 *   partialPayment?: boolean,
 *   firstPaymentMinAmount?: number,
 *   offerId?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = CreateRazorpayOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid order data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const orderData = validationResult.data;

    // Validate partial payment configuration
    if (orderData.partialPayment && !orderData.firstPaymentMinAmount) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'firstPaymentMinAmount is required for partial payments',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

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

    const enrichedOrderData = {
      ...orderData,
      metadata: {
        ipAddress: clientIp,
        userAgent,
      },
    };

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payment/razorpay/create-order`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(enrichedOrderData),
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
              code: 'ORDER_ALREADY_PAID',
              message: 'Order has already been paid',
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
            message: errorData.message || 'Failed to create Razorpay order',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: CreateOrderResponse = {
      success: true,
      data: {
        razorpayOrder: data.data?.razorpayOrder || data.razorpayOrder,
        order: data.data?.order || data.order,
        paymentConfig: data.data?.paymentConfig || data.paymentConfig || {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
          orderId: data.razorpayOrder?.id || '',
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Vardhman Mills',
          description: `Payment for Order #${data.order?.orderNumber || orderData.orderId}`,
          image: '/logo.png',
          prefill: {
            name: null,
            email: null,
            contact: null,
          },
          theme: {
            color: '#3399cc',
          },
          modal: {
            ondismiss: null,
          },
          callback_url: null,
          redirect: false,
          handler: 'handlePaymentSuccess',
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Create Razorpay Order API Error:', error);

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
          message: 'An unexpected error occurred while creating Razorpay order',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/razorpay/create-order
 * 
 * Get Razorpay order status
 * 
 * Query Parameters:
 * - razorpayOrderId: Razorpay order ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const razorpayOrderId = searchParams.get('razorpayOrderId');

    if (!razorpayOrderId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Razorpay order ID is required',
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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payment/razorpay/order-status`
    );
    backendUrl.searchParams.append('razorpayOrderId', razorpayOrderId);

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
              code: 'ORDER_NOT_FOUND',
              message: 'Razorpay order not found',
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
            message: errorData.message || 'Failed to fetch order status',
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
    console.error('Get Razorpay Order Status API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching order status',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
