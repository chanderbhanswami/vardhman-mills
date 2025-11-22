/**
 * Remove Coupon API Route
 * 
 * Handles removing applied coupon codes from shopping carts.
 * Recalculates cart totals after coupon removal.
 * Updates cart state and returns updated information.
 * 
 * @module api/coupons/remove
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

// Validation schemas
const RemoveCouponSchema = z.object({
  cartId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  couponId: z.string().uuid().optional(),
});

// Types
interface Cart {
  id: string;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  appliedCoupon: null;
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

interface RemoveCouponResponse {
  success: boolean;
  data: {
    cart: Cart;
    message: string;
    removedCoupon?: {
      code: string;
      discountAmount: number;
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
 * DELETE /api/coupons/remove
 * 
 * Removes an applied coupon from the shopping cart
 * 
 * Request Body:
 * - cartId: Cart ID (optional, uses session if not provided)
 * - sessionId: Session ID (optional)
 * - couponId: Specific coupon ID to remove (optional)
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Validate request body
    const validationResult = RemoveCouponSchema.safeParse(body);

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

    const { cartId, sessionId: providedSessionId, couponId } = validationResult.data;

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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/coupons/remove`;
    
    const backendRequestBody = {
      ...(cartId && { cartId }),
      ...(sessionId && { sessionId }),
      ...(couponId && { couponId }),
    };

    // Make request to backend
    const response = await fetch(backendUrl, {
      method: 'DELETE',
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
              code: errorData.code || 'CART_NOT_FOUND',
              message: errorData.message || 'Cart not found or no coupon applied',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      if (response.status === 400 && errorData.code === 'NO_COUPON_APPLIED') {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'NO_COUPON_APPLIED',
              message: 'No coupon is currently applied to this cart',
              details: errorData,
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
            message: errorData.message || 'Failed to remove coupon',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Prepare response
    const responseData: RemoveCouponResponse = {
      success: true,
      data: {
        cart: data.data?.cart || data.cart,
        removedCoupon: data.data?.removedCoupon || data.removedCoupon,
        message: 'Coupon removed successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Remove Coupon API Error:', error);

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
          message: 'An unexpected error occurred while removing coupon',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coupons/remove
 * 
 * Alternative method for removing coupons (supports POST with _method override)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check for method override
    if (body._method === 'DELETE') {
      return DELETE(request);
    }

    // Otherwise, delegate to DELETE
    const validationResult = RemoveCouponSchema.safeParse(body);

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

    const { cartId, sessionId: providedSessionId, couponId } = validationResult.data;

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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/coupons/remove`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({
        ...(cartId && { cartId }),
        ...(sessionId && { sessionId }),
        ...(couponId && { couponId }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to remove coupon',
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
          cart: data.data?.cart || data.cart,
          removedCoupon: data.data?.removedCoupon || data.removedCoupon,
          message: 'Coupon removed successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove Coupon POST API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while removing coupon',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/coupons/remove
 * 
 * Returns 405 Method Not Allowed
 */
export async function GET() {
  return NextResponse.json<ErrorResponse>(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'GET method is not supported for this endpoint. Use DELETE or POST to remove a coupon.',
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: 405,
      headers: {
        Allow: 'DELETE, POST',
      },
    }
  );
}
