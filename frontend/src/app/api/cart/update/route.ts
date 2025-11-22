/**
 * Update Cart API Route
 * 
 * Handles updating cart item quantities with validation.
 * Supports both authenticated and guest users.
 * Validates stock availability and recalculates totals.
 * 
 * @module api/cart/update
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

// Validation schemas
const UpdateCartItemSchema = z.object({
  itemId: z.string().uuid('Invalid item ID format'),
  quantity: z.number().int().positive().max(99, 'Quantity cannot exceed 99'),
  variantId: z.string().uuid().optional(),
  options: z.array(
    z.object({
      name: z.string().min(1),
      value: z.string().min(1),
    })
  ).optional(),
});

// Types
interface CartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    stock: number;
    images: Array<{
      url: string;
      alt: string;
      isPrimary: boolean;
    }>;
  };
  quantity: number;
  price: number;
  total: number;
  variantId: string | null;
  variant: {
    id: string;
    name: string;
    sku: string;
    stock: number;
  } | null;
  options: Array<{
    name: string;
    value: string;
  }>;
  addedAt: string;
}

interface Cart {
  id: string;
  userId: string | null;
  sessionId: string;
  items: CartItem[];
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

interface UpdateCartResponse {
  success: boolean;
  data: {
    cart: Cart;
    updatedItem: CartItem;
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
 * PATCH /api/cart/update
 * 
 * Updates the quantity of an item in the shopping cart
 * 
 * Request Body:
 * - itemId: Cart item ID to update (required)
 * - quantity: New quantity (1-99, required)
 * - variantId: Product variant ID (optional)
 * - options: Array of selected options (optional)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = UpdateCartItemSchema.safeParse(body);

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

    const { itemId, quantity, variantId, options } = validationResult.data;

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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cart/update`;
    
    const backendRequestBody = {
      itemId,
      quantity,
      sessionId,
      ...(variantId && { variantId }),
      ...(options && { options }),
    };

    // Make request to backend
    const response = await fetch(backendUrl, {
      method: 'PATCH',
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
      
      // Handle specific error cases
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

      if (response.status === 400 && errorData.code === 'INSUFFICIENT_STOCK') {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'INSUFFICIENT_STOCK',
              message: errorData.message || 'Not enough stock available',
              details: errorData.details,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      if (response.status === 400 && errorData.code === 'OUT_OF_STOCK') {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'OUT_OF_STOCK',
              message: 'Product is currently out of stock',
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
            message: errorData.message || 'Failed to update cart item',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Prepare response
    const responseData: UpdateCartResponse = {
      success: true,
      data: {
        cart: data.data?.cart || data.cart,
        updatedItem: data.data?.updatedItem || data.updatedItem,
        message: 'Cart item updated successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Update Cart API Error:', error);

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
          message: 'An unexpected error occurred while updating cart item',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cart/update
 * 
 * Alternative method for updating cart items (delegates to PATCH)
 */
export async function PUT(request: NextRequest) {
  return PATCH(request);
}

/**
 * POST /api/cart/update
 * 
 * Supports POST method with _method override for update operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check for method override
    if (body._method === 'PATCH' || body._method === 'PUT') {
      return PATCH(request);
    }

    // Validate request body
    const validationResult = UpdateCartItemSchema.safeParse(body);

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

    const { itemId, quantity, variantId, options } = validationResult.data;

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

    // Make backend request
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cart/update`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({
        itemId,
        quantity,
        sessionId,
        ...(variantId && { variantId }),
        ...(options && { options }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to update cart item',
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
          updatedItem: data.data?.updatedItem || data.updatedItem,
          message: 'Cart item updated successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update Cart API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while updating cart item',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cart/update
 * 
 * Returns 405 Method Not Allowed
 */
export async function GET() {
  return NextResponse.json<ErrorResponse>(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'GET method is not supported for this endpoint. Use PATCH, PUT, or POST to update cart items.',
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: 405,
      headers: {
        Allow: 'PATCH, PUT, POST',
      },
    }
  );
}
