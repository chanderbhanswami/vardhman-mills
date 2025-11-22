/**
 * Order Tracking API Route
 * 
 * Handles order tracking by order number and email.
 * Provides real-time tracking status, shipping updates, and delivery estimates.
 * Supports both authenticated and guest order tracking.
 * 
 * @module api/orders/track
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const TrackOrderQuerySchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  email: z.string().email('Valid email is required'),
});

const TrackOrderBodySchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
});

// Types
interface TrackingEvent {
  id: string;
  status: string;
  title: string;
  description: string;
  location: {
    city: string | null;
    state: string | null;
    country: string | null;
  } | null;
  timestamp: string;
  metadata: Record<string, unknown> | null;
}

interface TrackingInfo {
  provider: string;
  trackingNumber: string;
  trackingUrl: string | null;
  currentStatus: string;
  currentLocation: {
    city: string | null;
    state: string | null;
    country: string | null;
  } | null;
  estimatedDelivery: {
    date: string;
    timeSlot: string | null;
  } | null;
  events: TrackingEvent[];
  lastUpdated: string;
}

interface OrderTrackingData {
  order: {
    id: string;
    orderNumber: string;
    status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'out-for-delivery' | 'delivered' | 'cancelled' | 'refunded' | 'failed';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially-refunded';
    items: Array<{
      id: string;
      product: {
        id: string;
        name: string;
        thumbnail: string;
      };
      variant: {
        name: string;
        attributes: Record<string, string>;
      } | null;
      quantity: number;
      price: number;
      total: number;
    }>;
    itemsCount: number;
    total: number;
    currency: string;
    shippingAddress: {
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    placedAt: string;
    expectedDeliveryDate: string | null;
  };
  tracking: TrackingInfo | null;
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
    canTrackLive: boolean;
  };
  contactInfo: {
    supportEmail: string;
    supportPhone: string;
    carrierPhone: string | null;
  };
}

interface TrackOrderResponse {
  success: boolean;
  data: OrderTrackingData;
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
 * GET /api/orders/track
 * 
 * Track order by order number and email (query parameters)
 * 
 * Query Parameters:
 * - orderNumber: Order number to track
 * - email: Email address associated with the order
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      orderNumber: searchParams.get('orderNumber'),
      email: searchParams.get('email'),
    };

    // Validate query parameters
    const validationResult = TrackOrderQuerySchema.safeParse(params);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid tracking parameters',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { orderNumber, email } = validationResult.data;

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/track`
    );
    backendUrl.searchParams.append('orderNumber', orderNumber);
    backendUrl.searchParams.append('email', email);

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store', // Tracking info should be real-time
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'ORDER_NOT_FOUND',
              message: 'Order not found with the provided order number and email',
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
            message: errorData.message || 'Failed to track order',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: TrackOrderResponse = {
      success: true,
      data: data.data || data,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Order Tracking API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while tracking order',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders/track
 * 
 * Track order by order number and email (request body)
 * Alternative endpoint for tracking via POST with additional verification
 * 
 * Body:
 * {
 *   orderNumber: string,
 *   email: string,
 *   phone?: string (optional additional verification)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = TrackOrderBodySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid tracking data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const trackingData = validationResult.data;

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/track`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(trackingData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'ORDER_NOT_FOUND',
              message: 'Order not found with the provided information',
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
              code: 'VERIFICATION_FAILED',
              message: 'Order verification failed. Please check your email and order number.',
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
            message: errorData.message || 'Failed to track order',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: TrackOrderResponse = {
      success: true,
      data: data.data || data,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Order Tracking API Error:', error);

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
          message: 'An unexpected error occurred while tracking order',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
