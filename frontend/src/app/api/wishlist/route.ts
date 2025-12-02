/**
 * Wishlist API Route
 * 
 * Manages user wishlist/favorites:
 * - Get wishlist items
 * - Create/manage multiple wishlists
 * - Share wishlists
 * - Move items between wishlists
 * - Wishlist analytics
 * 
 * @module api/wishlist
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const createWishlistSchema = z.object({
  name: z.string().min(1, 'Wishlist name is required').max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
  isDefault: z.boolean().default(false),
});

const updateWishlistSchema = z.object({
  wishlistId: z.string().min(1, 'Wishlist ID is required'),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

const moveItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  fromWishlistId: z.string().min(1, 'Source wishlist ID is required'),
  toWishlistId: z.string().min(1, 'Destination wishlist ID is required'),
});

const shareWishlistSchema = z.object({
  wishlistId: z.string().min(1, 'Wishlist ID is required'),
  shareWith: z.array(z.string().email()).optional(),
  shareType: z.enum(['link', 'email', 'social']).default('link'),
  allowEditing: z.boolean().default(false),
});

// Types
interface WishlistItem {
  id: string;
  productId: string;
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
    variants?: Array<{
      id: string;
      name: string;
      value: string;
    }>;
  };
  selectedVariants?: Record<string, string>;
  quantity: number;
  notes?: string;
  addedAt: string;
  priceAtAddition: number;
  priceChange?: {
    amount: number;
    percentage: number;
    direction: 'up' | 'down';
  };
  notifyOnSale: boolean;
  notifyOnBackInStock: boolean;
}

interface Wishlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  shareLink?: string;
  items: WishlistItem[];
  itemCount: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
  sharedWith?: Array<{
    email: string;
    canEdit: boolean;
    sharedAt: string;
  }>;
}

interface WishlistResponse {
  success: boolean;
  data: {
    wishlists: Wishlist[];
    defaultWishlist?: Wishlist;
    total: number;
    statistics?: {
      totalItems: number;
      totalValue: number;
      itemsOnSale: number;
      itemsOutOfStock: number;
      averageItemValue: number;
    };
  };
  timestamp: string;
}

interface SingleWishlistResponse {
  success: boolean;
  data: {
    wishlist: Wishlist;
    message?: string;
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
 * GET /api/wishlist
 * 
 * Get user wishlists
 * 
 * Query Parameters:
 * - wishlistId: Specific wishlist ID (optional)
 * - includeItems: Include items in response (default: true)
 * - includePublic: Include public wishlists (default: false)
 * - page: Page number for items (default: 1)
 * - limit: Items per page (default: 20)
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
            message: 'Authentication or guest session required to view wishlist',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const wishlistId = searchParams.get('wishlistId');
    const includeItems = searchParams.get('includeItems') !== 'false';
    const includePublic = searchParams.get('includePublic') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Build query string
    const queryParams = new URLSearchParams();
    if (wishlistId) queryParams.append('wishlistId', wishlistId);
    if (includeItems) queryParams.append('includeItems', 'true');
    if (includePublic) queryParams.append('includePublic', 'true');
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/wishlist?${queryParams.toString()}`;
    
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

      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'WISHLIST_NOT_FOUND',
              message: 'Wishlist not found',
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
            code: 'FETCH_FAILED',
            message: errorData.message || 'Failed to fetch wishlist',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: WishlistResponse = {
      success: true,
      data: {
        wishlists: data.data?.wishlists || [],
        defaultWishlist: data.data?.defaultWishlist,
        total: data.data?.total || 0,
        statistics: data.data?.statistics,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Get Wishlist API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching wishlist',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist
 * 
 * Create new wishlist or share existing wishlist
 * 
 * Body (for creating):
 * - name: Wishlist name (required)
 * - description: Description (optional)
 * - isPublic: Public visibility (default: false)
 * - isDefault: Set as default (default: false)
 * 
 * Body (for sharing):
 * - wishlistId: Wishlist ID to share (required)
 * - shareWith: Array of email addresses (optional)
 * - shareType: 'link' | 'email' | 'social' (default: 'link')
 * - allowEditing: Allow recipients to edit (default: false)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to create or share wishlist',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Check if this is a share operation
    if (body.wishlistId && (body.shareWith || body.shareType)) {
      let validatedData;
      try {
        validatedData = shareWishlistSchema.parse(body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json<ErrorResponse>(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid share data',
                details: error.issues,
              },
              timestamp: new Date().toISOString(),
            },
            { status: 400 }
          );
        }
        throw error;
      }

      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/wishlist/share`;
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'SHARE_FAILED',
              message: errorData.message || 'Failed to share wishlist',
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
            wishlist: data.data?.wishlist || data.wishlist,
            shareLink: data.data?.shareLink,
            message: 'Wishlist shared successfully',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Create new wishlist
    let validatedData;
    try {
      validatedData = createWishlistSchema.parse(body);
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

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/wishlist`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'WISHLIST_EXISTS',
              message: 'A wishlist with this name already exists',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 409 }
        );
      }

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'CREATE_FAILED',
            message: errorData.message || 'Failed to create wishlist',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: SingleWishlistResponse = {
      success: true,
      data: {
        wishlist: data.data?.wishlist || data.wishlist,
        message: 'Wishlist created successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Create/Share Wishlist API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while processing wishlist',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/wishlist
 * 
 * Update wishlist or move items between wishlists
 * 
 * Body (for updating wishlist):
 * - wishlistId: Wishlist ID (required)
 * - name: New name (optional)
 * - description: New description (optional)
 * - isPublic: Public visibility (optional)
 * - isDefault: Set as default (optional)
 * 
 * Body (for moving items):
 * - itemId: Item ID to move (required)
 * - fromWishlistId: Source wishlist (required)
 * - toWishlistId: Destination wishlist (required)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to update wishlist',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Check if this is a move operation
    if (body.itemId && body.fromWishlistId && body.toWishlistId) {
      let validatedData;
      try {
        validatedData = moveItemSchema.parse(body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json<ErrorResponse>(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid move data',
                details: error.issues,
              },
              timestamp: new Date().toISOString(),
            },
            { status: 400 }
          );
        }
        throw error;
      }

      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/wishlist/move`;
      
      const response = await fetch(backendUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'MOVE_FAILED',
              message: errorData.message || 'Failed to move item',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: response.status }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            message: 'Item moved successfully',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Update wishlist
    let validatedData;
    try {
      validatedData = updateWishlistSchema.parse(body);
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

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/wishlist`;
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'WISHLIST_NOT_FOUND',
              message: 'Wishlist not found',
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
            message: errorData.message || 'Failed to update wishlist',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: SingleWishlistResponse = {
      success: true,
      data: {
        wishlist: data.data?.wishlist || data.wishlist,
        message: 'Wishlist updated successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Update Wishlist API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while updating wishlist',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wishlist
 * 
 * Delete wishlist or clear all items
 * 
 * Body:
 * - wishlistId: Wishlist ID (required)
 * - clearOnly: Only clear items, don't delete wishlist (default: false)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to delete wishlist',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { wishlistId, clearOnly = false } = body;

    if (!wishlistId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Wishlist ID is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/wishlist`;
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ wishlistId, clearOnly }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'WISHLIST_NOT_FOUND',
              message: 'Wishlist not found',
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
              code: 'CANNOT_DELETE_DEFAULT',
              message: 'Cannot delete default wishlist',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 409 }
        );
      }

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: errorData.message || 'Failed to delete wishlist',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          message: clearOnly 
            ? 'Wishlist cleared successfully'
            : 'Wishlist deleted successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Wishlist API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while deleting wishlist',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

