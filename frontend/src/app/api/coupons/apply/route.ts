/**
 * Apply Coupon API Route
 * 
 * Handles applying coupon codes to shopping carts.
 * Validates coupon eligibility and calculates discounts.
 * Updates cart with applied coupon information.
 * 
 * @module api/coupons/apply
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

// Validation schemas
const ApplyCouponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  cartId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
});

// Types
interface AppliedCoupon {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed' | 'free-shipping' | 'buy-x-get-y';
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  savings: number;
  appliedAt: string;
}

interface CartWithCoupon {
  id: string;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  appliedCoupon: AppliedCoupon | null;
  summary: {
    itemsCount: number;
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  updatedAt: string;
}

interface ApplyCouponResponse {
  success: boolean;
  data: {
    cart: CartWithCoupon;
    coupon: AppliedCoupon;
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
 * POST /api/coupons/apply
 * 
 * Applies a coupon code to the shopping cart
 * 
 * Request Body:
 * - code: Coupon code (required)
 * - cartId: Cart ID (optional, uses session if not provided)
 * - sessionId: Session ID (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = ApplyCouponSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { code, cartId, sessionId: providedSessionId } = validationResult.data;

    // Get session ID
    const cookieStore = await cookies();
    const sessionId = providedSessionId || cookieStore.get('cart_session_id')?.value;

    if (!sessionId && !cartId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'NO_CART_SESSION',
            message: 'No active cart session found',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Get authentication token
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || cookieStore.get('access_token')?.value;

    // Build backend request
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/coupons/apply`;
    
    const backendRequestBody = {
      code,
      ...(cartId && { cartId }),
      ...(sessionId && { sessionId }),
    };

    // Make request to backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(backendRequestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error cases
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: errorData.code || 'COUPON_NOT_FOUND',
              message: errorData.message || 'Coupon code not found or has expired',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      if (response.status === 400) {
        const errorCode = errorData.code || 'COUPON_INVALID';
        const errorMessages: Record<string, string> = {
          'COUPON_EXPIRED': 'This coupon has expired',
          'COUPON_NOT_STARTED': 'This coupon is not yet active',
          'MIN_ORDER_NOT_MET': `Minimum order value not met. Required: ${errorData.details?.minOrderValue || 'N/A'}`,
          'MAX_USES_EXCEEDED': 'This coupon has reached its usage limit',
          'USER_LIMIT_EXCEEDED': 'You have already used this coupon the maximum number of times',
          'FIRST_ORDER_ONLY': 'This coupon is only valid for first-time orders',
          'NOT_APPLICABLE': 'This coupon is not applicable to items in your cart',
          'ALREADY_APPLIED': 'A coupon is already applied to your cart',
          'NOT_STACKABLE': 'This coupon cannot be combined with other offers',
        };

        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: errorCode,
              message: errorMessages[errorCode] || errorData.message || 'Coupon is not valid for this order',
              details: errorData.details,
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
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to apply coupon',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Prepare response
    const responseData: ApplyCouponResponse = {
      success: true,
      data: {
        cart: data.data?.cart || data.cart,
        coupon: data.data?.coupon || data.coupon,
        message: `Coupon "${code}" applied successfully! You saved ${data.data?.coupon?.savings || data.coupon?.savings || 0}`,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Apply Coupon API Error:', error);

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
          message: 'An unexpected error occurred while applying coupon',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/coupons/apply
 * 
 * Returns 405 Method Not Allowed
 */
export async function GET() {
  return NextResponse.json<ErrorResponse>(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'GET method is not supported for this endpoint. Use POST to apply a coupon.',
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: 405,
      headers: {
        Allow: 'POST',
      },
    }
  );
}
