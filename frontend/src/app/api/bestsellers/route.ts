/**
 * Best Sellers API Route
 * 
 * Handles fetching best-selling products with filtering, sorting, and pagination.
 * Supports various time periods (daily, weekly, monthly, all-time).
 * Includes cache management and error handling.
 * 
 * @module api/bestsellers
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const BestSellersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  period: z.enum(['daily', 'weekly', 'monthly', 'all-time']).default('monthly'),
  category: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.enum(['sales', 'rating', 'price', 'name']).default('sales'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  inStock: z.coerce.boolean().optional(),
});

// Types
interface BestSellerProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice: number | null;
  discount: number;
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand: {
    id: string;
    name: string;
    slug: string;
  } | null;
  rating: number;
  reviewCount: number;
  stock: number;
  inStock: boolean;
  salesCount: number;
  tags: string[];
  isFeatured: boolean;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BestSellersResponse {
  success: boolean;
  data: {
    products: BestSellerProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    filters: {
      period: string;
      category?: string;
      priceRange?: {
        min?: number;
        max?: number;
      };
      inStock?: boolean;
    };
    sorting: {
      sortBy: string;
      sortOrder: string;
    };
  };
  message: string;
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
 * GET /api/bestsellers
 * 
 * Fetches best-selling products with optional filtering and sorting
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 12, max: 100)
 * - period: Time period (daily, weekly, monthly, all-time)
 * - category: Filter by category ID
 * - minPrice: Minimum price filter
 * - maxPrice: Maximum price filter
 * - sortBy: Sort field (sales, rating, price, name)
 * - sortOrder: Sort order (asc, desc)
 * - inStock: Filter by stock availability
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = BestSellersQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      period: searchParams.get('period'),
      category: searchParams.get('category'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
      inStock: searchParams.get('inStock'),
    });

    if (!queryParams.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: queryParams.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const {
      page,
      limit,
      period,
      category,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      inStock,
    } = queryParams.data;

    // Build query parameters for backend API
    const backendParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      period,
      sortBy,
      sortOrder,
    });

    if (category) backendParams.append('category', category);
    if (minPrice !== undefined) backendParams.append('minPrice', minPrice.toString());
    if (maxPrice !== undefined) backendParams.append('maxPrice', maxPrice.toString());
    if (inStock !== undefined) backendParams.append('inStock', inStock.toString());

    // Fetch from backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/bestsellers?${backendParams}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(request.headers.get('Authorization') && {
          Authorization: request.headers.get('Authorization')!,
        }),
      },
      next: {
        revalidate: period === 'daily' ? 3600 : period === 'weekly' ? 7200 : 14400, // Cache based on period
        tags: ['bestsellers', `bestsellers-${period}`, ...(category ? [`category-${category}`] : [])],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch best sellers from backend',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform backend response to frontend format
    const transformedResponse: BestSellersResponse = {
      success: true,
      data: {
        products: data.data?.products || [],
        pagination: {
          page: data.data?.pagination?.page || page,
          limit: data.data?.pagination?.limit || limit,
          total: data.data?.pagination?.total || 0,
          totalPages: data.data?.pagination?.totalPages || 0,
          hasMore: data.data?.pagination?.hasMore || false,
        },
        filters: {
          period,
          ...(category && { category }),
          ...(minPrice !== undefined || maxPrice !== undefined
            ? {
              priceRange: {
                ...(minPrice !== undefined && { min: minPrice }),
                ...(maxPrice !== undefined && { max: maxPrice }),
              },
            }
            : {}),
          ...(inStock !== undefined && { inStock }),
        },
        sorting: {
          sortBy,
          sortOrder,
        },
      },
      message: 'Best sellers fetched successfully',
      timestamp: new Date().toISOString(),
    };

    // Set cache headers
    const cacheMaxAge = period === 'daily' ? 3600 : period === 'weekly' ? 7200 : 14400;

    return NextResponse.json(transformedResponse, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${cacheMaxAge}, stale-while-revalidate=${cacheMaxAge * 2}`,
        'CDN-Cache-Control': `public, s-maxage=${cacheMaxAge}`,
        'Vercel-CDN-Cache-Control': `public, s-maxage=${cacheMaxAge}`,
      },
    });
  } catch (error) {
    console.error('Best Sellers API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching best sellers',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bestsellers
 * 
 * Advanced filtering with body payload for complex queries
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const bodySchema = z.object({
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(12),
      period: z.enum(['daily', 'weekly', 'monthly', 'all-time']).default('monthly'),
      categories: z.array(z.string()).optional(),
      brands: z.array(z.string()).optional(),
      priceRange: z
        .object({
          min: z.number().positive().optional(),
          max: z.number().positive().optional(),
        })
        .optional(),
      tags: z.array(z.string()).optional(),
      sortBy: z.enum(['sales', 'rating', 'price', 'name']).default('sales'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
      inStock: z.boolean().optional(),
      featured: z.boolean().optional(),
      new: z.boolean().optional(),
    });

    const validatedBody = bodySchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: validatedBody.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Fetch from backend API with POST
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/bestsellers/filter`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(request.headers.get('Authorization') && {
          Authorization: request.headers.get('Authorization')!,
        }),
      },
      body: JSON.stringify(validatedBody.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to filter best sellers',
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
        data,
        message: 'Best sellers filtered successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Best Sellers Filter API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while filtering best sellers',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
