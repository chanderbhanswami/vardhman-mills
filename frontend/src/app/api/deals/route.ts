/**
 * Deals API Route
 * 
 * Handles daily deals, flash sales, and special offers.
 * Supports time-limited deals with countdown timers.
 * Includes stock tracking and purchase limits.
 * 
 * @module api/deals
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const DealsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: z.enum(['daily', 'flash', 'weekly', 'seasonal', 'clearance']).optional(),
  status: z.enum(['active', 'upcoming', 'expired']).optional(),
  category: z.string().optional(),
  minDiscount: z.coerce.number().min(0).max(100).optional(),
  sortBy: z.enum(['discount', 'startsAt', 'endsAt', 'popularity', 'price']).default('startsAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  featured: z.coerce.boolean().optional(),
});

// Types
interface Deal {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: 'daily' | 'flash' | 'weekly' | 'seasonal' | 'clearance';
  status: 'active' | 'upcoming' | 'expired';
  product: {
    id: string;
    name: string;
    slug: string;
    originalPrice: number;
    dealPrice: number;
    discount: number;
    discountPercentage: number;
    images: Array<{
      url: string;
      alt: string;
      isPrimary: boolean;
    }>;
    rating: number;
    reviewsCount: number;
    stock: number;
    categories: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
    brand: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  startsAt: string;
  endsAt: string;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } | null;
  maxQuantityPerUser: number | null;
  totalQuantityAvailable: number | null;
  quantitySold: number;
  quantityRemaining: number | null;
  featured: boolean;
  badge: string | null;
  terms: string | null;
  metadata: {
    views: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface DealsResponse {
  success: boolean;
  data: {
    deals: Deal[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    statistics: {
      active: number;
      upcoming: number;
      expired: number;
      totalSavings: number;
    };
    featured?: Deal[];
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
 * GET /api/deals
 * 
 * Retrieves available deals and special offers
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - type: Filter by deal type (daily, flash, weekly, seasonal, clearance)
 * - status: Filter by status (active, upcoming, expired)
 * - category: Filter by product category
 * - minDiscount: Minimum discount percentage
 * - sortBy: Sort field (discount, startsAt, endsAt, popularity, price)
 * - sortOrder: Sort direction (asc, desc)
 * - featured: Show only featured deals
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = DealsQuerySchema.safeParse(params);

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

    // Build backend URL with query parameters
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/deals`
    );

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        backendUrl.searchParams.append(key, String(value));
      }
    });

    // Determine cache duration based on deal type
    let revalidateTime = 300; // 5 minutes default for active deals
    if (queryParams.type === 'flash') {
      revalidateTime = 60; // 1 minute for flash sales
    } else if (queryParams.status === 'upcoming') {
      revalidateTime = 3600; // 1 hour for upcoming deals
    } else if (queryParams.status === 'expired') {
      revalidateTime = 86400; // 24 hours for expired deals
    }

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: {
        revalidate: revalidateTime,
        tags: ['deals', `deals-${queryParams.type || 'all'}`],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch deals',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: DealsResponse = {
      success: true,
      data: {
        deals: data.data?.deals || data.deals || [],
        pagination: data.data?.pagination || data.pagination || {
          page: queryParams.page,
          limit: queryParams.limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        statistics: data.data?.statistics || data.statistics || {
          active: 0,
          upcoming: 0,
          expired: 0,
          totalSavings: 0,
        },
        featured: data.data?.featured || data.featured,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${revalidateTime}, stale-while-revalidate=${revalidateTime * 2}`,
        'CDN-Cache-Control': `public, s-maxage=${revalidateTime}`,
        'Vercel-CDN-Cache-Control': `public, s-maxage=${revalidateTime}`,
      },
    });
  } catch (error) {
    console.error('Deals API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching deals',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/deals
 * 
 * Creates a new deal (Admin only)
 * 
 * Request Body:
 * - title: Deal title (required)
 * - description: Deal description (optional)
 * - type: Deal type (required)
 * - productId: Product ID (required)
 * - dealPrice: Discounted price (required)
 * - startsAt: Start date/time (required)
 * - endsAt: End date/time (required)
 * - maxQuantityPerUser: Purchase limit per user (optional)
 * - totalQuantityAvailable: Total available quantity (optional)
 * - featured: Featured deal flag (default: false)
 * - badge: Deal badge text (optional)
 * - terms: Terms and conditions (optional)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication (Admin only)
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to create deals',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/deals`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 403) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to create deals',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }

      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'DEAL_EXISTS',
              message: 'An active deal already exists for this product',
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
            message: errorData.message || 'Failed to create deal',
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
          deal: data.data?.deal || data.deal,
          message: 'Deal created successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Deal API Error:', error);

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
          message: 'An unexpected error occurred while creating deal',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

