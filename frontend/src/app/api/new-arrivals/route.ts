/**
 * New Arrivals API Route
 * 
 * Handles new arrival products with advanced filtering and sorting.
 * Supports date range filtering, category filtering, and stock availability.
 * Includes trending indicators and personalized recommendations.
 * 
 * @module api/new-arrivals
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const NewArrivalsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(24),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).max(100).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  inStock: z.coerce.boolean().optional(),
  daysAgo: z.coerce.number().int().positive().max(90).default(30),
  sortBy: z.enum(['date', 'price', 'popularity', 'rating', 'discount']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  tags: z.string().optional(),
});

// Types
interface NewArrivalProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  salePrice: number | null;
  discount: number | null;
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
    order: number;
  }>;
  thumbnail: string;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  subcategories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  } | null;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  tags: string[];
  attributes: Array<{
    name: string;
    value: string;
  }>;
  variants: Array<{
    id: string;
    name: string;
    options: string[];
  }>;
  sku: string;
  barcode: string | null;
  weight: number | null;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  } | null;
  arrivalInfo: {
    arrivedAt: string;
    daysAgo: number;
    isTrending: boolean;
    viewCount: number;
    addToCartCount: number;
    wishlistCount: number;
    badge: {
      text: string;
      color: string;
      icon: string | null;
    } | null;
  };
  shippingInfo: {
    freeShipping: boolean;
    estimatedDays: {
      min: number;
      max: number;
    };
    shippingCost: number | null;
  };
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    keywords: string[];
  };
  isNew: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NewArrivalsResponse {
  success: boolean;
  data: {
    products: NewArrivalProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    filters: {
      categories: Array<{
        id: string;
        name: string;
        slug: string;
        count: number;
      }>;
      subcategories: Array<{
        id: string;
        name: string;
        slug: string;
        count: number;
      }>;
      brands: Array<{
        id: string;
        name: string;
        slug: string;
        count: number;
      }>;
      priceRange: {
        min: number;
        max: number;
      };
      availableTags: string[];
    };
    statistics: {
      totalNewArrivals: number;
      trendingCount: number;
      lowStockCount: number;
      averageDiscount: number;
      averageRating: number;
    };
    metadata: {
      dateRange: {
        from: string;
        to: string;
      };
      lastUpdated: string;
      cacheExpiry: string;
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
 * GET /api/new-arrivals
 * 
 * Retrieves new arrival products with advanced filtering
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 24, max: 100)
 * - category: Filter by category slug
 * - subcategory: Filter by subcategory slug
 * - brand: Filter by brand slug
 * - priceMin: Minimum price filter
 * - priceMax: Maximum price filter
 * - discount: Minimum discount percentage
 * - rating: Minimum rating filter
 * - inStock: Filter by stock availability
 * - daysAgo: Number of days to look back (default: 30, max: 90)
 * - sortBy: Sort field (date, price, popularity, rating, discount)
 * - sortOrder: Sort direction (asc, desc)
 * - tags: Comma-separated tags filter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = NewArrivalsQuerySchema.safeParse(params);

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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/new-arrivals`
    );

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        backendUrl.searchParams.append(key, String(value));
      }
    });

    // Get user preferences for personalization
    const userPreferences = request.cookies.get('user_preferences')?.value;
    const authToken = request.cookies.get('auth_token')?.value;

    if (userPreferences) {
      backendUrl.searchParams.append('preferences', userPreferences);
    }

    // Fetch from backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Dynamic cache based on sort type
    let revalidateTime = 600; // 10 minutes default
    if (queryParams.sortBy === 'date') {
      revalidateTime = 300; // 5 minutes for newest first
    } else if (queryParams.sortBy === 'popularity') {
      revalidateTime = 180; // 3 minutes for popularity
    }

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      next: {
        revalidate: revalidateTime,
        tags: [
          'new-arrivals',
          'products',
          queryParams.category ? `new-arrivals-${queryParams.category}` : '',
          queryParams.brand ? `brand-${queryParams.brand}` : '',
        ].filter(Boolean),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch new arrivals',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Calculate date range
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - queryParams.daysAgo);

    const responseData: NewArrivalsResponse = {
      success: true,
      data: {
        products: data.data?.products || data.products || [],
        pagination: data.data?.pagination || data.pagination || {
          page: queryParams.page,
          limit: queryParams.limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        filters: data.data?.filters || data.filters || {
          categories: [],
          subcategories: [],
          brands: [],
          priceRange: { min: 0, max: 0 },
          availableTags: [],
        },
        statistics: data.data?.statistics || data.statistics || {
          totalNewArrivals: 0,
          trendingCount: 0,
          lowStockCount: 0,
          averageDiscount: 0,
          averageRating: 0,
        },
        metadata: {
          dateRange: {
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
          },
          lastUpdated: data.data?.metadata?.lastUpdated || new Date().toISOString(),
          cacheExpiry: new Date(Date.now() + revalidateTime * 1000).toISOString(),
        },
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
    console.error('New Arrivals API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching new arrivals',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/new-arrivals
 * 
 * Mark products as new arrivals (Admin only)
 * 
 * Body:
 * {
 *   productIds: string[],
 *   badge?: { text: string, color: string, icon?: string },
 *   isFeatured?: boolean
 * }
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
            message: 'Authentication required to manage new arrivals',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.productIds || !Array.isArray(body.productIds) || body.productIds.length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Product IDs array is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/new-arrivals`;

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
              message: 'You do not have permission to manage new arrivals',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }

      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'PRODUCTS_NOT_FOUND',
              message: 'Some products were not found',
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
            message: errorData.message || 'Failed to mark products as new arrivals',
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
          updatedCount: data.data?.updatedCount || body.productIds.length,
          products: data.data?.products || data.products || [],
          message: 'Products marked as new arrivals successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Mark New Arrivals API Error:', error);

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
          message: 'An unexpected error occurred while marking new arrivals',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/new-arrivals
 * 
 * Remove products from new arrivals (Admin only)
 * 
 * Body: { productIds: string[] }
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication (Admin only)
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to manage new arrivals',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.productIds || !Array.isArray(body.productIds) || body.productIds.length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Product IDs array is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/new-arrivals`;

    const response = await fetch(backendUrl, {
      method: 'DELETE',
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
              message: 'You do not have permission to manage new arrivals',
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
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to remove products from new arrivals',
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
          removedCount: body.productIds.length,
          message: 'Products removed from new arrivals successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove New Arrivals API Error:', error);

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
          message: 'An unexpected error occurred while removing new arrivals',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

