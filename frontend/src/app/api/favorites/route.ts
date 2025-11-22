/**
 * Favorites/Wishlist API Route
 * 
 * Handles user wishlist management including add, remove, and list operations.
 * Supports both authenticated users and guest users via session.
 * Includes product availability tracking and price change notifications.
 * 
 * @module api/favorites
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const FavoritesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
  sortBy: z.enum(['addedAt', 'price', 'name', 'rating']).default('addedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const AddFavoriteSchema = z.object({
  productId: z.string().uuid(),
  notifyOnPriceChange: z.boolean().default(false),
  notifyOnBackInStock: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

const RemoveFavoriteSchema = z.object({
  productId: z.string().uuid(),
});

const BulkFavoriteSchema = z.object({
  action: z.enum(['add', 'remove']),
  productIds: z.array(z.string().uuid()).min(1).max(50),
});

// Types
interface FavoriteProduct {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    discount: number | null;
    images: Array<{
      url: string;
      alt: string;
      isPrimary: boolean;
    }>;
    rating: number;
    reviewCount: number;
    inStock: boolean;
    stockQuantity: number;
    categories: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
    brand: {
      id: string;
      name: string;
      logo: string | null;
    } | null;
  };
  notifyOnPriceChange: boolean;
  notifyOnBackInStock: boolean;
  notes: string | null;
  priceAtAddition: number;
  priceChanged: boolean;
  priceChangePercentage: number | null;
  wasInStock: boolean;
  stockStatusChanged: boolean;
  addedAt: string;
  lastCheckedAt: string;
}

interface FavoritesResponse {
  success: boolean;
  data: {
    favorites: FavoriteProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    statistics: {
      total: number;
      inStock: number;
      outOfStock: number;
      priceDrops: number;
      backInStock: number;
      totalValue: number;
      potentialSavings: number;
    };
  };
  timestamp: string;
}

interface AddFavoriteResponse {
  success: boolean;
  data: {
    favorite: FavoriteProduct;
    message: string;
  };
  timestamp: string;
}

interface RemoveFavoriteResponse {
  success: boolean;
  data: {
    message: string;
    removedProductId: string;
  };
  timestamp: string;
}

interface BulkFavoriteResponse {
  success: boolean;
  data: {
    message: string;
    processedCount: number;
    failedCount: number;
    failed: Array<{
      productId: string;
      reason: string;
    }>;
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
 * GET /api/favorites
 * 
 * Retrieves user's favorite products
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - category: Filter by category slug
 * - priceMin: Minimum price filter
 * - priceMax: Maximum price filter
 * - inStock: Filter by stock availability
 * - sortBy: Sort field (addedAt, price, name, rating)
 * - sortOrder: Sort direction (asc, desc)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = FavoritesQuerySchema.safeParse(params);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const queryParams = validationResult.data;

    // Get user session
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('favorites_session_id')?.value;
    const authToken = cookieStore.get('auth_token')?.value;

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/favorites`
    );

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        backendUrl.searchParams.append(key, String(value));
      }
    });

    if (sessionId) {
      backendUrl.searchParams.append('sessionId', sessionId);
    }

    // Fetch from backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      next: {
        revalidate: 300, // Cache for 5 minutes
        tags: ['favorites', sessionId ? `favorites-${sessionId}` : 'favorites-guest'],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch favorites',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Create session if guest user
    if (!authToken && !sessionId) {
      const newSessionId = `fav_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      cookieStore.set('favorites_session_id', newSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 90, // 90 days
        path: '/',
      });
    }

    const responseData: FavoritesResponse = {
      success: true,
      data: {
        favorites: data.data?.favorites || data.favorites || [],
        pagination: data.data?.pagination || data.pagination || {
          page: queryParams.page,
          limit: queryParams.limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        statistics: data.data?.statistics || data.statistics || {
          total: 0,
          inStock: 0,
          outOfStock: 0,
          priceDrops: 0,
          backInStock: 0,
          totalValue: 0,
          potentialSavings: 0,
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'private, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Favorites API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching favorites',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/favorites
 * 
 * Adds product to favorites or handles bulk operations
 * 
 * Body for single add:
 * {
 *   productId: string,
 *   notifyOnPriceChange?: boolean,
 *   notifyOnBackInStock?: boolean,
 *   notes?: string
 * }
 * 
 * Body for bulk operations:
 * {
 *   action: 'add' | 'remove',
 *   productIds: string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if bulk operation
    if (body.action && Array.isArray(body.productIds)) {
      return handleBulkOperation(request, body);
    }

    // Validate request body
    const validationResult = AddFavoriteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid favorite data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const favoriteData = validationResult.data;

    // Get user session
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('favorites_session_id')?.value;
    const authToken = cookieStore.get('auth_token')?.value;

    // Create session if guest user
    if (!authToken && !sessionId) {
      sessionId = `fav_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      cookieStore.set('favorites_session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 90, // 90 days
        path: '/',
      });
    }

    // Build backend request
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/favorites`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...favoriteData,
        sessionId: sessionId || undefined,
      }),
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
              code: 'ALREADY_IN_FAVORITES',
              message: 'Product is already in your favorites',
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
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to add product to favorites',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: AddFavoriteResponse = {
      success: true,
      data: {
        favorite: data.data?.favorite || data.favorite,
        message: 'Product added to favorites successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Add Favorite API Error:', error);

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
          message: 'An unexpected error occurred while adding to favorites',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/favorites
 * 
 * Removes product from favorites
 * 
 * Body: { productId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = RemoveFavoriteSchema.safeParse(body);

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

    const { productId } = validationResult.data;

    // Get user session
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('favorites_session_id')?.value;
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken && !sessionId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'NO_SESSION',
            message: 'No favorites session found',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Build backend request
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/favorites`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({
        productId,
        sessionId: sessionId || undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'NOT_IN_FAVORITES',
              message: 'Product not found in favorites',
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
            message: errorData.message || 'Failed to remove product from favorites',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const responseData: RemoveFavoriteResponse = {
      success: true,
      data: {
        message: 'Product removed from favorites successfully',
        removedProductId: productId,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Remove Favorite API Error:', error);

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
          message: 'An unexpected error occurred while removing from favorites',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Handles bulk add/remove operations
 */
async function handleBulkOperation(request: NextRequest, body: unknown) {
  // Validate bulk operation
  const validationResult = BulkFavoriteSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid bulk operation data',
          details: validationResult.error.flatten(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  const { action, productIds } = validationResult.data;

  // Get user session
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('favorites_session_id')?.value;
  const authToken = cookieStore.get('auth_token')?.value;

  // Build backend request
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/favorites/bulk`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(backendUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action,
      productIds,
      sessionId: sessionId || undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'BACKEND_ERROR',
          message: errorData.message || `Failed to ${action} products in bulk`,
          details: errorData,
        },
        timestamp: new Date().toISOString(),
      },
      { status: response.status }
    );
  }

  const data = await response.json();

  const responseData: BulkFavoriteResponse = {
    success: true,
    data: {
      message: data.data?.message || `Successfully ${action === 'add' ? 'added' : 'removed'} ${productIds.length} products`,
      processedCount: data.data?.processedCount || productIds.length,
      failedCount: data.data?.failedCount || 0,
      failed: data.data?.failed || [],
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(responseData, { status: 200 });
}
