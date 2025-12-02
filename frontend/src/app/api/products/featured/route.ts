/**
 * Featured Products API Route
 * 
 * Handles featured products management and listing.
 * Supports featuring/unfeaturing products with priority ordering and time-based expiry.
 * 
 * @module api/products/featured
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const GetFeaturedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  category: z.string().optional(),
  brand: z.string().optional(),
  active: z.coerce.boolean().default(true),
  sortBy: z.enum(['priority', 'newest', 'price-low', 'price-high', 'popular', 'rating']).default('priority'),
});

const FeatureProductSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  priority: z.number().int().min(1).max(1000).default(100),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.string().optional(),
  location: z.enum(['homepage', 'category', 'sidebar', 'banner', 'all']).default('all'),
  badge: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
});

const BulkFeatureSchema = z.object({
  productIds: z.array(z.string()).min(1, 'At least one product ID required'),
  priority: z.number().int().min(1).max(1000).default(100),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.string().optional(),
  location: z.enum(['homepage', 'category', 'sidebar', 'banner', 'all']).default('all'),
});

const UpdateFeaturedSchema = z.object({
  featuredId: z.string().min(1, 'Featured ID is required'),
  priority: z.number().int().min(1).max(1000).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.enum(['homepage', 'category', 'sidebar', 'banner', 'all']).optional(),
  badge: z.string().max(50).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  active: z.boolean().optional(),
});

// Types
interface FeaturedProductInfo {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  price: number;
  compareAtPrice: number | null;
  discount: number;
  averageRating: number;
  totalReviews: number;
  inStock: boolean;
  category: string;
  brand: string;
  tags: string[];
}

interface FeaturedProduct {
  id: string;
  productId: string;
  product: FeaturedProductInfo;
  priority: number;
  startDate: string | null;
  endDate: string | null;
  category: string | null;
  location: 'homepage' | 'category' | 'sidebar' | 'banner' | 'all';
  badge: string | null;
  description: string | null;
  active: boolean;
  isExpired: boolean;
  expiresIn: number | null; // milliseconds
  viewCount: number;
  clickCount: number;
  conversionRate: number;
  createdAt: string;
  updatedAt: string;
}

interface FeaturedProductsResponse {
  success: boolean;
  data: {
    featuredProducts: FeaturedProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    statistics: {
      totalFeatured: number;
      active: number;
      expired: number;
      byLocation: {
        homepage: number;
        category: number;
        sidebar: number;
        banner: number;
        all: number;
      };
      byCategory: Array<{
        category: string;
        count: number;
      }>;
    };
  };
  timestamp: string;
}

interface FeatureProductResponse {
  success: boolean;
  data: {
    featuredProduct: FeaturedProduct;
    message: string;
  };
  timestamp: string;
}

interface BulkFeatureResponse {
  success: boolean;
  data: {
    featured: number;
    featuredProducts: FeaturedProduct[];
    failed: Array<{
      productId: string;
      reason: string;
    }>;
    message: string;
  };
  timestamp: string;
}

interface UnfeatureResponse {
  success: boolean;
  data: {
    unfeatured: number;
    message: string;
  };
  timestamp: string;
}

interface UpdateFeaturedResponse {
  success: boolean;
  data: {
    featuredProduct: FeaturedProduct;
    message: string;
    updatedFields: string[];
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
 * GET /api/products/featured
 * 
 * Get featured products with filtering and pagination
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 12, max: 100)
 * - category: Filter by category
 * - brand: Filter by brand
 * - active: Filter active featured products only (default: true)
 * - sortBy: Sort order (priority, newest, price-low, price-high, popular, rating)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = GetFeaturedQuerySchema.safeParse(params);

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

    // Get authentication (optional)
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/featured`
    );

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        backendUrl.searchParams.append(key, String(value));
      }
    });

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      next: {
        revalidate: 180, // 3 minutes (shorter cache for featured products)
        tags: ['featured-products', 'products', `featured-category-${queryParams.category}`],
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

    const responseData: FeaturedProductsResponse = {
      success: true,
      data: {
        featuredProducts: data.data?.featuredProducts || data.featuredProducts || [],
        pagination: data.data?.pagination || data.pagination || {
          page: queryParams.page,
          limit: queryParams.limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        statistics: data.data?.statistics || data.statistics || {
          totalFeatured: 0,
          active: 0,
          expired: 0,
          byLocation: {
            homepage: 0,
            category: 0,
            sidebar: 0,
            banner: 0,
            all: 0,
          },
          byCategory: [],
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360',
      },
    });
  } catch (error) {
    console.error('Get Featured Products API Error:', error);

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
 * POST /api/products/featured
 * 
 * Feature a product or bulk feature products (Admin only)
 * 
 * Body (Single):
 * {
 *   productId: string,
 *   priority?: number,
 *   startDate?: string,
 *   endDate?: string,
 *   category?: string,
 *   location?: string,
 *   badge?: string,
 *   description?: string
 * }
 * 
 * Body (Bulk):
 * {
 *   productIds: string[],
 *   priority?: number,
 *   startDate?: string,
 *   endDate?: string,
 *   category?: string,
 *   location?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const adminToken = cookieStore.get('admin_token')?.value;

    if (!authToken && !adminToken) {
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

    const body = await request.json();

    // Determine if this is a single or bulk feature request
    const isBulk = Array.isArray(body.productIds);

    if (isBulk) {
      // Validate bulk feature
      const validationResult = BulkFeatureSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid bulk feature data',
              details: validationResult.error.flatten(),
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      const featureData = validationResult.data;

      // Make request to backend
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/featured/bulk`;
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${adminToken || authToken}`,
        },
        body: JSON.stringify(featureData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 403) {
          return NextResponse.json<ErrorResponse>(
            {
              success: false,
              error: {
                code: 'FORBIDDEN',
                message: 'Admin privileges required to feature products',
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
              message: errorData.message || 'Failed to feature products',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      const responseData: BulkFeatureResponse = {
        success: true,
        data: {
          featured: data.data?.featured || featureData.productIds.length,
          featuredProducts: data.data?.featuredProducts || [],
          failed: data.data?.failed || [],
          message: `${data.data?.featured || featureData.productIds.length} product(s) featured successfully`,
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(responseData, { status: 201 });
    } else {
      // Validate single feature
      const validationResult = FeatureProductSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid feature data',
              details: validationResult.error.flatten(),
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      const featureData = validationResult.data;

      // Make request to backend
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/featured`;
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${adminToken || authToken}`,
        },
        body: JSON.stringify(featureData),
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

        if (response.status === 403) {
          return NextResponse.json<ErrorResponse>(
            {
              success: false,
              error: {
                code: 'FORBIDDEN',
                message: 'Admin privileges required to feature products',
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
                code: 'ALREADY_FEATURED',
                message: 'Product is already featured',
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
              message: errorData.message || 'Failed to feature product',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      const responseData: FeatureProductResponse = {
        success: true,
        data: {
          featuredProduct: data.data?.featuredProduct || data.featuredProduct,
          message: 'Product featured successfully',
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(responseData, { status: 201 });
    }
  } catch (error) {
    console.error('Feature Product API Error:', error);

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
          message: 'An unexpected error occurred while featuring product',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/featured
 * 
 * Update featured product settings (Admin only)
 * 
 * Body:
 * {
 *   featuredId: string,
 *   priority?: number,
 *   startDate?: string,
 *   endDate?: string,
 *   location?: string,
 *   badge?: string,
 *   description?: string,
 *   active?: boolean
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const adminToken = cookieStore.get('admin_token')?.value;

    if (!authToken && !adminToken) {
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

    const body = await request.json();

    // Validate request body
    const validationResult = UpdateFeaturedSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid update data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/featured/${updateData.featuredId}`;
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${adminToken || authToken}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'FEATURED_NOT_FOUND',
              message: 'Featured product entry not found',
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
              message: 'Admin privileges required to update featured products',
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
            message: errorData.message || 'Failed to update featured product',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: UpdateFeaturedResponse = {
      success: true,
      data: {
        featuredProduct: data.data?.featuredProduct || data.featuredProduct,
        message: 'Featured product updated successfully',
        updatedFields: Object.keys(updateData).filter(key => key !== 'featuredId'),
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Update Featured Product API Error:', error);

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
          message: 'An unexpected error occurred while updating featured product',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/featured
 * 
 * Unfeature product(s) (Admin only)
 * 
 * Query Parameters:
 * - ids: Comma-separated featured product IDs or product IDs
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Product IDs are required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const productIds = ids.split(',').map(id => id.trim()).filter(Boolean);

    if (productIds.length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'At least one valid product ID required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const adminToken = cookieStore.get('admin_token')?.value;

    if (!authToken && !adminToken) {
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

    // Make request to backend
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/featured`
    );
    backendUrl.searchParams.append('ids', ids);
    
    const response = await fetch(backendUrl.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${adminToken || authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 403) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Admin privileges required to unfeature products',
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
            message: errorData.message || 'Failed to unfeature products',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: UnfeatureResponse = {
      success: true,
      data: {
        unfeatured: data.data?.unfeatured || productIds.length,
        message: `${data.data?.unfeatured || productIds.length} product(s) unfeatured successfully`,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Unfeature Products API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while unfeaturing products',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

