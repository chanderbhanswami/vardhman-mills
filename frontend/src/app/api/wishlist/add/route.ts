/**
 * Add to Wishlist API Route
 * 
 * Handles adding products to wishlist with variants support,
 * quantity management, and notification preferences.
 * 
 * @module api/wishlist/add
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schema
const addToWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  wishlistId: z.string().optional(),
  selectedVariants: z.record(z.string(), z.string()).optional(),
  quantity: z.number().min(1).default(1),
  notes: z.string().max(500).optional(),
  notifyOnSale: z.boolean().default(true),
  notifyOnBackInStock: z.boolean().default(true),
  notifyOnPriceDrop: z.boolean().default(true),
  priceThreshold: z.number().min(0).optional(),
});

// Types
interface AddToWishlistRequest {
  productId: string;
  wishlistId?: string;
  selectedVariants?: Record<string, string>;
  quantity?: number;
  notes?: string;
  notifyOnSale?: boolean;
  notifyOnBackInStock?: boolean;
  notifyOnPriceDrop?: boolean;
  priceThreshold?: number;
}

interface WishlistItem {
  id: string;
  productId: string;
  wishlistId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: Array<{ url: string; alt: string }>;
    price: {
      current: number;
      original: number;
      discount: number;
      currency: string;
    };
    rating: {
      average: number;
      count: number;
    };
    availability: {
      inStock: boolean;
      quantity: number;
    };
  };
  selectedVariants?: Record<string, string>;
  quantity: number;
  notes?: string;
  notifyOnSale: boolean;
  notifyOnBackInStock: boolean;
  notifyOnPriceDrop: boolean;
  priceThreshold?: number;
  priceAtAddition: number;
  addedAt: string;
}

interface AddToWishlistResponse {
  success: boolean;
  data: {
    item: WishlistItem;
    wishlist: {
      id: string;
      itemCount: number;
      totalValue: number;
    };
    message: string;
    alreadyInWishlist?: boolean;
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
 * POST /api/wishlist/add
 * 
 * Add product to wishlist
 * 
 * Body:
 * - productId: Product ID (required)
 * - wishlistId: Specific wishlist ID (optional, uses default if not provided)
 * - selectedVariants: Selected product variants (optional)
 * - quantity: Quantity (default: 1)
 * - notes: Personal notes (optional)
 * - notifyOnSale: Notify when on sale (default: true)
 * - notifyOnBackInStock: Notify when back in stock (default: true)
 * - notifyOnPriceDrop: Notify on price drop (default: true)
 * - priceThreshold: Notify when price drops below this value (optional)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const guestSessionId = cookieStore.get('guest_session_id')?.value;

    if (!authToken && !guestSessionId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication or guest session required to add to wishlist',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    let validatedData: AddToWishlistRequest;
    try {
      validatedData = addToWishlistSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid wishlist data',
              details: error.issues,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Add metadata
    const requestData = {
      ...validatedData,
      metadata: {
        userAgent: request.headers.get('user-agent') || '',
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        addedAt: new Date().toISOString(),
        guestSession: !authToken,
      },
    };

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/wishlist/add`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    } else if (guestSessionId) {
      headers['X-Guest-Session-Id'] = guestSessionId;
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'PRODUCT_NOT_FOUND',
              message: 'Product not found',
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
              code: 'ALREADY_IN_WISHLIST',
              message: 'Product is already in wishlist',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 409 }
        );
      }

      if (response.status === 400) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'INVALID_VARIANTS',
              message: 'Invalid product variants selected',
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
            code: 'ADD_FAILED',
            message: errorData.message || 'Failed to add to wishlist',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: AddToWishlistResponse = {
      success: true,
      data: {
        item: data.data?.item || data.item,
        wishlist: data.data?.wishlist || {
          id: data.wishlistId || '',
          itemCount: data.itemCount || 0,
          totalValue: data.totalValue || 0,
        },
        message: 'Product added to wishlist successfully',
        alreadyInWishlist: data.data?.alreadyInWishlist || false,
      },
      timestamp: new Date().toISOString(),
    };

    // Set/update guest session cookie if needed
    if (guestSessionId || data.guestSessionId) {
      const cookieStore = await cookies();
      cookieStore.set('guest_session_id', guestSessionId || data.guestSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60, // 1 year
      });
    }

    // Update wishlist count cookie for quick access
    if (data.data?.wishlist?.itemCount !== undefined) {
      const cookieStore = await cookies();
      cookieStore.set('wishlist_count', data.data.wishlist.itemCount.toString(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60, // 1 year
      });
    }

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Add to Wishlist API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while adding to wishlist',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wishlist/add
 * 
 * Check if product is in wishlist
 * 
 * Query Parameters:
 * - productId: Product ID (required)
 * - wishlistId: Specific wishlist ID (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const guestSessionId = cookieStore.get('guest_session_id')?.value;

    if (!authToken && !guestSessionId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication or guest session required to check wishlist',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const wishlistId = searchParams.get('wishlistId');

    if (!productId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Product ID is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('productId', productId);
    if (wishlistId) queryParams.append('wishlistId', wishlistId);

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/wishlist/check?${queryParams.toString()}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    } else if (guestSessionId) {
      headers['X-Guest-Session-Id'] = guestSessionId;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'CHECK_FAILED',
            message: errorData.message || 'Failed to check wishlist',
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
          inWishlist: data.data?.inWishlist || false,
          wishlistId: data.data?.wishlistId,
          itemId: data.data?.itemId,
        },
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
    console.error('Check Wishlist API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while checking wishlist',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

