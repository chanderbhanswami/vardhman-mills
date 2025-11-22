/**
 * Featured Products API Route
 * 
 * Handles featured product listings with various filtering options.
 * Supports sections like new arrivals, trending, editor's choice, and bestsellers.
 * Includes dynamic caching and personalization support.
 * 
 * @module api/featured
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const FeaturedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  section: z.enum([
    'new-arrivals',
    'trending',
    'editors-choice',
    'bestsellers',
    'seasonal',
    'recommended',
    'on-sale',
    'limited-edition'
  ]).optional(),
  category: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
  discount: z.coerce.number().min(0).max(100).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  sortBy: z.enum(['relevance', 'price', 'name', 'rating', 'featured', 'newest']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Types
interface FeaturedProduct {
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
  featured: {
    section: string;
    priority: number;
    badge: string | null;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
  };
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
  isNew: boolean;
  isTrending: boolean;
  isBestseller: boolean;
  isLimitedEdition: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeaturedSection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  products: FeaturedProduct[];
  totalProducts: number;
  badge: {
    text: string;
    color: string;
    icon: string | null;
  } | null;
  settings: {
    autoRotate: boolean;
    rotateInterval: number | null;
    showTimer: boolean;
    expiresAt: string | null;
  };
}

interface FeaturedResponse {
  success: boolean;
  data: {
    products: FeaturedProduct[];
    sections: FeaturedSection[];
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
    };
    metadata: {
      lastUpdated: string;
      cacheExpiry: string;
      personalized: boolean;
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
 * GET /api/featured
 * 
 * Retrieves featured products with optional filtering
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - section: Featured section filter (new-arrivals, trending, etc.)
 * - category: Filter by category slug
 * - priceMin: Minimum price filter
 * - priceMax: Maximum price filter
 * - inStock: Filter by stock availability
 * - discount: Minimum discount percentage
 * - rating: Minimum rating filter
 * - sortBy: Sort field (relevance, price, name, rating, featured, newest)
 * - sortOrder: Sort direction (asc, desc)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = FeaturedQuerySchema.safeParse(params);

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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/featured`
    );

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        backendUrl.searchParams.append(key, String(value));
      }
    });

    // Get user preferences for personalization
    const userPreferences = request.cookies.get('user_preferences')?.value;
    if (userPreferences) {
      backendUrl.searchParams.append('preferences', userPreferences);
    }

    // Fetch from backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add auth token if available for personalization
    const authToken = request.cookies.get('auth_token')?.value;
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Dynamic cache duration based on section
    let revalidateTime = 600; // 10 minutes default
    if (queryParams.section === 'trending') {
      revalidateTime = 300; // 5 minutes for trending
    } else if (queryParams.section === 'new-arrivals') {
      revalidateTime = 1800; // 30 minutes for new arrivals
    } else if (queryParams.section === 'on-sale') {
      revalidateTime = 180; // 3 minutes for sales
    } else if (queryParams.section === 'seasonal') {
      revalidateTime = 3600; // 1 hour for seasonal
    }

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      next: {
        revalidate: revalidateTime,
        tags: [
          'featured',
          queryParams.section ? `featured-${queryParams.section}` : 'featured-all',
          queryParams.category ? `featured-cat-${queryParams.category}` : '',
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
            message: errorData.message || 'Failed to fetch featured products',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: FeaturedResponse = {
      success: true,
      data: {
        products: data.data?.products || data.products || [],
        sections: data.data?.sections || data.sections || [],
        pagination: data.data?.pagination || data.pagination || {
          page: queryParams.page,
          limit: queryParams.limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        filters: data.data?.filters || data.filters || {
          categories: [],
          brands: [],
          priceRange: { min: 0, max: 0 },
        },
        metadata: {
          lastUpdated: data.data?.metadata?.lastUpdated || new Date().toISOString(),
          cacheExpiry: new Date(Date.now() + revalidateTime * 1000).toISOString(),
          personalized: !!authToken || !!userPreferences,
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
    console.error('Featured Products API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching featured products',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/featured
 * 
 * Creates or updates featured products (Admin only)
 * 
 * Body:
 * {
 *   productId: string,
 *   section: string,
 *   priority: number,
 *   badge?: string,
 *   startDate?: string,
 *   endDate?: string
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
            message: 'Authentication required to manage featured products',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/featured`;
    
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
              message: 'You do not have permission to manage featured products',
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
              code: 'ALREADY_FEATURED',
              message: 'Product is already featured in this section',
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
            message: errorData.message || 'Failed to add featured product',
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
          featured: data.data?.featured || data.featured,
          message: 'Featured product added successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add Featured Product API Error:', error);

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
          message: 'An unexpected error occurred while adding featured product',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/featured
 * 
 * Removes product from featured (Admin only)
 * 
 * Body: { productId: string, section?: string }
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
            message: 'Authentication required to manage featured products',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.productId) {
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

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/featured`;
    
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
              message: 'You do not have permission to manage featured products',
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
              code: 'NOT_FEATURED',
              message: 'Product is not in featured list',
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
            message: errorData.message || 'Failed to remove featured product',
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
          message: 'Featured product removed successfully',
          productId: body.productId,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove Featured Product API Error:', error);

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
          message: 'An unexpected error occurred while removing featured product',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
