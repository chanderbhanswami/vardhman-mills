/**
 * Remove from Cart API Route
 * 
 * Handles removing items from the shopping cart with validation.
 * Supports both authenticated and guest users.
 * Updates cart totals and manages empty cart state.
 * 
 * @module api/cart/remove
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

// Validation schemas
const RemoveFromCartSchema = z.object({
  itemId: z.string().uuid('Invalid item ID format'),
  removeAll: z.boolean().optional().default(false),
});

// Types
interface Cart {
  id: string;
  userId: string | null;
  sessionId: string;
  items: Array<{
    id: string;
    productId: string;
    product: {
      id: string;
      name: string;
      slug: string;
      price: number;
      salePrice: number | null;
      images: Array<{ url: string; alt: string }>;
    };
    quantity: number;
    price: number;
    total: number;
  }>;
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

interface RemoveFromCartResponse {
  success: boolean;
  data: {
    cart: Cart;
    removedItemId: string;
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
 * DELETE /api/cart/remove
 * 
 * Removes an item from the shopping cart
 * 
 * Request Body:
 * - itemId: Cart item ID to remove (required)
 * - removeAll: Remove all instances of the item (optional)
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = RemoveFromCartSchema.safeParse(body);

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

    const { itemId, removeAll } = validationResult.data;

    // Get session ID for guest users
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session_id')?.value;

    if (!sessionId) {
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

    // Get authentication token if exists
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || cookieStore.get('access_token')?.value;

    // Build backend request
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cart/remove`;
    
    const backendRequestBody = {
      itemId,
      removeAll,
      sessionId,
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

    // Handle backend errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'ITEM_NOT_FOUND',
              message: 'Cart item not found',
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
            message: errorData.message || 'Failed to remove item from cart',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Prepare response
    const responseData: RemoveFromCartResponse = {
      success: true,
      data: {
        cart: data.data?.cart || data.cart,
        removedItemId: itemId,
        message: 'Item removed from cart successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Remove from Cart API Error:', error);

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
          message: 'An unexpected error occurred while removing item from cart',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart/remove
 * 
 * Alternative method for removing items (supports POST with _method override)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check for method override
    if (body._method === 'DELETE') {
      return DELETE(request);
    }

    // Validate request body
    const validationResult = RemoveFromCartSchema.safeParse(body);

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

    const { itemId, removeAll } = validationResult.data;

    // Get session ID
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session_id')?.value;

    if (!sessionId) {
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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cart/remove`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({
        itemId,
        removeAll,
        sessionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to remove item from cart',
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
          removedItemId: itemId,
          message: 'Item removed from cart successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove from Cart API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while removing item from cart',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cart/remove
 * 
 * Returns 405 Method Not Allowed
 */
export async function GET() {
  return NextResponse.json<ErrorResponse>(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'GET method is not supported for this endpoint. Use DELETE or POST to remove items from cart.',
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
