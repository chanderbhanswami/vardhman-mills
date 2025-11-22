/**
 * Brands API Route
 * 
 * Handles fetching brand listings with filtering, sorting, and pagination.
 * Supports brand search, featured brands, and brand statistics.
 * Includes cache management and error handling.
 * 
 * @module api/brands
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const BrandsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'products', 'popularity', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  withProducts: z.coerce.boolean().default(false),
  withStats: z.coerce.boolean().default(false),
});

// Types
interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: {
    url: string;
    alt: string;
  } | null;
  banner: {
    url: string;
    alt: string;
  } | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  } | null;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  isFeatured: boolean;
  isActive: boolean;
  productsCount: number;
  stats?: {
    totalProducts: number;
    activeProducts: number;
    totalSales: number;
    averageRating: number;
    totalReviews: number;
  };
  products?: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    images: Array<{ url: string; alt: string }>;
  }>;
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface BrandsResponse {
  success: boolean;
  data: {
    brands: Brand[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    filters: {
      search?: string;
      featured?: boolean;
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
 * GET /api/brands
 * 
 * Fetches brand listings with optional filtering and sorting
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - search: Search term for brand name
 * - featured: Filter featured brands only
 * - sortBy: Sort field (name, products, popularity, createdAt)
 * - sortOrder: Sort order (asc, desc)
 * - withProducts: Include product listings
 * - withStats: Include brand statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = BrandsQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      featured: searchParams.get('featured'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
      withProducts: searchParams.get('withProducts'),
      withStats: searchParams.get('withStats'),
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
      search,
      featured,
      sortBy,
      sortOrder,
      withProducts,
      withStats,
    } = queryParams.data;

    // Build query parameters for backend API
    const backendParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
      withProducts: withProducts.toString(),
      withStats: withStats.toString(),
    });

    if (search) backendParams.append('search', search);
    if (featured !== undefined) backendParams.append('featured', featured.toString());

    // Fetch from backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/brands?${backendParams}`;
    
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
        revalidate: 3600, // Cache for 1 hour
        tags: ['brands', ...(featured ? ['featured-brands'] : []), ...(search ? [`brand-search-${search}`] : [])],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch brands from backend',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform backend response to frontend format
    const transformedResponse: BrandsResponse = {
      success: true,
      data: {
        brands: data.data?.brands || [],
        pagination: {
          page: data.data?.pagination?.page || page,
          limit: data.data?.pagination?.limit || limit,
          total: data.data?.pagination?.total || 0,
          totalPages: data.data?.pagination?.totalPages || 0,
          hasMore: data.data?.pagination?.hasMore || false,
        },
        filters: {
          ...(search && { search }),
          ...(featured !== undefined && { featured }),
        },
        sorting: {
          sortBy,
          sortOrder,
        },
      },
      message: 'Brands fetched successfully',
      timestamp: new Date().toISOString(),
    };

    // Set cache headers
    return NextResponse.json(transformedResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'CDN-Cache-Control': 'public, s-maxage=3600',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Brands API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching brands',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/brands
 * 
 * Creates a new brand (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const bodySchema = z.object({
      name: z.string().min(2).max(100),
      slug: z.string().min(2).max(100),
      description: z.string().min(10).max(5000),
      logo: z
        .object({
          url: z.string().url(),
          alt: z.string(),
        })
        .optional(),
      banner: z
        .object({
          url: z.string().url(),
          alt: z.string(),
        })
        .optional(),
      website: z.string().url().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z
        .object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          country: z.string(),
          postalCode: z.string(),
        })
        .optional(),
      socialLinks: z
        .object({
          facebook: z.string().url().optional(),
          instagram: z.string().url().optional(),
          twitter: z.string().url().optional(),
          linkedin: z.string().url().optional(),
          youtube: z.string().url().optional(),
        })
        .optional(),
      isFeatured: z.boolean().default(false),
      isActive: z.boolean().default(true),
      meta: z.object({
        title: z.string(),
        description: z.string(),
        keywords: z.array(z.string()),
      }),
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

    // Check authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Fetch from backend API with POST
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/brands`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: authHeader,
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
            message: errorData.message || 'Failed to create brand',
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
        message: 'Brand created successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Brand API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while creating brand',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
