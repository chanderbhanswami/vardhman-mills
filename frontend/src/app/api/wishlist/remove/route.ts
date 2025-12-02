/**
 * Remove from Wishlist API Route
 * 
 * Handles removing products from wishlist.
 * Supports single item removal and bulk removal.
 * 
 * @module api/wishlist/remove
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schema
const removeFromWishlistSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required').optional(),
  itemIds: z.array(z.string().min(1)).optional(),
  productId: z.string().min(1).optional(),
  wishlistId: z.string().optional(),
}).refine(
  (data) => data.itemId || (data.itemIds && data.itemIds.length > 0) || data.productId,
  {
    message: 'Either itemId, itemIds array, or productId is required',
  }
);

// Types
interface RemoveFromWishlistResponse {
  success: boolean;
  data: {
    removed: number;
    wishlist: {
      id: string;
      itemCount: number;
      totalValue: number;
    };
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
 * DELETE /api/wishlist/remove
 * 
 * Remove item(s) from wishlist
 * 
 * Body:
 * - itemId: Single item ID to remove (optional)
 * - itemIds: Array of item IDs to remove (optional)
 * - productId: Product ID to remove (optional, removes from default wishlist)
 * - wishlistId: Specific wishlist ID (optional, uses default if not provided)
 * 
 * Note: Provide one of: itemId, itemIds, or productId
 */
export async function DELETE(request: NextRequest) {
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
            message: 'Authentication or guest session required to remove from wishlist',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    let validatedData;
    try {
      validatedData = removeFromWishlistSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid remove data',
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
        removedAt: new Date().toISOString(),
        guestSession: !authToken,
      },
    };

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/wishlist/remove`;
    
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
      method: 'DELETE',
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
              code: 'ITEM_NOT_FOUND',
              message: 'Item not found in wishlist',
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
              code: 'FORBIDDEN',
              message: 'You do not have permission to remove this item',
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
            code: 'REMOVE_FAILED',
            message: errorData.message || 'Failed to remove from wishlist',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Calculate removed count
    let removedCount = 1;
    if (validatedData.itemIds) {
      removedCount = validatedData.itemIds.length;
    } else if (data.data?.removed !== undefined) {
      removedCount = data.data.removed;
    }

    const responseData: RemoveFromWishlistResponse = {
      success: true,
      data: {
        removed: removedCount,
        wishlist: data.data?.wishlist || {
          id: data.wishlistId || '',
          itemCount: data.itemCount || 0,
          totalValue: data.totalValue || 0,
        },
        message: removedCount === 1 
          ? 'Item removed from wishlist successfully'
          : `${removedCount} items removed from wishlist successfully`,
      },
      timestamp: new Date().toISOString(),
    };

    // Update wishlist count cookie
    if (data.data?.wishlist?.itemCount !== undefined) {
      const cookieStore = await cookies();
      cookieStore.set('wishlist_count', data.data.wishlist.itemCount.toString(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60, // 1 year
      });
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Remove from Wishlist API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while removing from wishlist',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist/remove
 * 
 * Toggle item in wishlist (add if not present, remove if present)
 * 
 * Body:
 * - productId: Product ID (required)
 * - wishlistId: Specific wishlist ID (optional)
 * - selectedVariants: Selected product variants (optional)
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
            message: 'Authentication or guest session required to toggle wishlist',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { productId, wishlistId, selectedVariants } = body;

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

    // Add metadata
    const requestData = {
      productId,
      wishlistId,
      selectedVariants,
      metadata: {
        userAgent: request.headers.get('user-agent') || '',
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        toggledAt: new Date().toISOString(),
        guestSession: !authToken,
      },
    };

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/wishlist/toggle`;
    
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

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'TOGGLE_FAILED',
            message: errorData.message || 'Failed to toggle wishlist',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const wasAdded = data.data?.action === 'added' || data.action === 'added';
    
    const responseData = {
      success: true,
      data: {
        action: wasAdded ? 'added' : 'removed',
        inWishlist: wasAdded,
        item: data.data?.item || data.item,
        wishlist: data.data?.wishlist || {
          id: data.wishlistId || '',
          itemCount: data.itemCount || 0,
          totalValue: data.totalValue || 0,
        },
        message: wasAdded 
          ? 'Product added to wishlist'
          : 'Product removed from wishlist',
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

    // Update wishlist count cookie
    if (data.data?.wishlist?.itemCount !== undefined) {
      const cookieStore = await cookies();
      cookieStore.set('wishlist_count', data.data.wishlist.itemCount.toString(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60, // 1 year
      });
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Toggle Wishlist API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while toggling wishlist',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/wishlist/remove
 * 
 * Update wishlist item (quantity, notes, notification preferences)
 * 
 * Body:
 * - itemId: Item ID (required)
 * - quantity: New quantity (optional)
 * - notes: Updated notes (optional)
 * - notifyOnSale: Notify when on sale (optional)
 * - notifyOnBackInStock: Notify when back in stock (optional)
 * - notifyOnPriceDrop: Notify on price drop (optional)
 * - priceThreshold: Price drop threshold (optional)
 */
export async function PATCH(request: NextRequest) {
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
            message: 'Authentication or guest session required to update wishlist item',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { itemId, ...updateData } = body;

    if (!itemId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Item ID is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/wishlist/item`;
    
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
      method: 'PATCH',
      headers,
      body: JSON.stringify({ itemId, ...updateData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'ITEM_NOT_FOUND',
              message: 'Wishlist item not found',
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
            code: 'UPDATE_FAILED',
            message: errorData.message || 'Failed to update wishlist item',
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
          item: data.data?.item || data.item,
          message: 'Wishlist item updated successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update Wishlist Item API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while updating wishlist item',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

