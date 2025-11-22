/**
 * Add to Cart API Route
 * 
 * Handles adding items to the shopping cart with quantity validation,
 * stock checking, variant management, and price calculations.
 * Supports both authenticated and guest users.
 * 
 * @module api/cart/add
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

// Validation schemas
const AddToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.number().int().positive().max(99, 'Maximum quantity is 99'),
  variantId: z.string().uuid().optional(),
  options: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  customization: z
    .object({
      message: z.string().max(500).optional(),
      giftWrap: z.boolean().optional(),
      giftMessage: z.string().max(200).optional(),
    })
    .optional(),
});

// Types
interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    images: Array<{
      url: string;
      alt: string;
    }>;
    inStock: boolean;
    stock: number;
    category: {
      id: string;
      name: string;
    };
    brand: {
      id: string;
      name: string;
    } | null;
  };
  variant: {
    id: string;
    name: string;
    price: number;
    salePrice: number | null;
    stock: number;
    options: Record<string, string>;
  } | null;
  quantity: number;
  price: number;
  subtotal: number;
  discount: number;
  total: number;
  options: Array<{
    name: string;
    value: string;
  }>;
  customization: {
    message?: string;
    giftWrap?: boolean;
    giftMessage?: string;
  } | null;
  addedAt: string;
  updatedAt: string;
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
  coupon: {
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
  } | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

interface AddToCartResponse {
  success: boolean;
  data: {
    cart: Cart;
    addedItem: CartItem;
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
 * POST /api/cart/add
 * 
 * Adds an item to the shopping cart
 * 
 * Request Body:
 * - productId: Product ID (required)
 * - quantity: Quantity to add (required, min: 1, max: 99)
 * - variantId: Product variant ID (optional)
 * - options: Product options array (optional)
 * - customization: Customization options (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = AddToCartSchema.safeParse(body);

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

    const { productId, quantity, variantId, options, customization } = validationResult.data;

    // Get or create session ID for guest users
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('cart_session_id')?.value;
    
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    // Get authentication token if exists
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || cookieStore.get('access_token')?.value;

    // Build backend request
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cart/add`;
    
    const backendRequestBody = {
      productId,
      quantity,
      ...(variantId && { variantId }),
      ...(options && { options }),
      ...(customization && { customization }),
      sessionId,
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

    // Handle backend errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error cases
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'PRODUCT_NOT_FOUND',
              message: 'Product not found or unavailable',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      if (response.status === 400 && errorData.code === 'OUT_OF_STOCK') {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'OUT_OF_STOCK',
              message: 'Product is out of stock',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      if (response.status === 400 && errorData.code === 'INSUFFICIENT_STOCK') {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'INSUFFICIENT_STOCK',
              message: `Only ${errorData.availableStock || 0} items available in stock`,
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
            message: errorData.message || 'Failed to add item to cart',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Prepare response
    const responseData: AddToCartResponse = {
      success: true,
      data: {
        cart: data.data?.cart || data.cart,
        addedItem: data.data?.addedItem || data.item,
        message: 'Item added to cart successfully',
      },
      timestamp: new Date().toISOString(),
    };

    // Set session cookie for guest users
    const responseHeaders = new Headers();
    
    if (!accessToken) {
      responseHeaders.set(
        'Set-Cookie',
        `cart_session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}` // 30 days
      );
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Add to Cart API Error:', error);

    // Handle specific error types
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
          message: 'An unexpected error occurred while adding item to cart',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cart/add
 * 
 * Returns 405 Method Not Allowed
 */
export async function GET() {
  return NextResponse.json<ErrorResponse>(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'GET method is not supported for this endpoint. Use POST to add items to cart.',
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
