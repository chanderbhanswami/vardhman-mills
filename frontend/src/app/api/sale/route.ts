/**
 * Sale Products API Route
 * 
 * Handles sale/clearance products listing with advanced filtering.
 * Supports time-limited offers, flash sales, and stock tracking.
 * Provides deal expiration, countdown timers, and savings calculations.
 * 
 * @module api/sale
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const SaleProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(24),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  discountMin: z.coerce.number().min(0).max(100).optional(), // Minimum discount percentage
  saleType: z.enum(['clearance', 'seasonal', 'flash', 'end-of-season', 'outlet', 'all']).default('all'),
  inStock: z.coerce.boolean().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  sortBy: z.enum(['discount', 'price', 'popularity', 'expiry', 'newest']).default('discount'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  tags: z.string().optional(), // Comma-separated tags
});

// Types
interface SaleProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  thumbnail: string;
  images: string[];
  sku: string;
  barcode: string | null;
  originalPrice: number;
  salePrice: number;
  discount: number; // Percentage
  savings: number; // Amount saved
  stock: number;
  inStock: boolean;
  isLowStock: boolean;
  lowStockThreshold: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory: {
    id: string;
    name: string;
    slug: string;
  } | null;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  } | null;
  saleInfo: {
    type: 'clearance' | 'seasonal' | 'flash' | 'end-of-season' | 'outlet';
    startDate: string;
    endDate: string | null;
    isExpiring: boolean;
    expiresIn: {
      days: number;
      hours: number;
      minutes: number;
    } | null;
    reason: string | null;
    badge: {
      text: string;
      color: string;
      icon: string | null;
    };
  };
  rating: {
    average: number;
    count: number;
  };
  variants: Array<{
    id: string;
    name: string;
    attributes: Record<string, string>;
    price: number;
    salePrice: number;
    stock: number;
    inStock: boolean;
  }>;
  attributes: Record<string, string[]>;
  tags: string[];
  shipping: {
    freeShipping: boolean;
    estimatedDays: {
      min: number;
      max: number;
    };
    shippingCost: number | null;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'inch';
  } | null;
  weight: {
    value: number;
    unit: 'kg' | 'lb';
  } | null;
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    keywords: string[];
  };
  isFeatured: boolean;
  isBestseller: boolean;
  viewCount: number;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SaleProductsResponse {
  success: boolean;
  data: {
    products: SaleProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    statistics: {
      totalProducts: number;
      averageDiscount: number;
      totalSavings: number;
      expiringToday: number;
      expiringThisWeek: number;
      clearanceCount: number;
      flashSaleCount: number;
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
      saleTypes: Array<{
        type: string;
        label: string;
        count: number;
      }>;
      priceRange: {
        min: number;
        max: number;
      };
      discountRange: {
        min: number;
        max: number;
      };
    };
    deals: {
      flashSales: Array<{
        id: string;
        title: string;
        endsAt: string;
        productCount: number;
      }>;
      featuredDeals: Array<{
        id: string;
        title: string;
        description: string;
        discount: number;
        imageUrl: string;
      }>;
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
 * GET /api/sale
 * 
 * Get sale/clearance products with filtering
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 24, max: 100)
 * - category: Filter by category slug/ID
 * - subcategory: Filter by subcategory slug/ID
 * - brand: Filter by brand slug/ID
 * - priceMin: Minimum price
 * - priceMax: Maximum price
 * - discountMin: Minimum discount percentage
 * - saleType: Type of sale (clearance, seasonal, flash, end-of-season, outlet, all)
 * - inStock: Only show in-stock items
 * - rating: Minimum rating
 * - sortBy: Sort field (discount, price, popularity, expiry, newest)
 * - sortOrder: Sort direction (asc, desc)
 * - tags: Comma-separated tags
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = SaleProductsQuerySchema.safeParse(params);

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

    // Get user preferences for personalization
    const cookieStore = await cookies();
    const userPreferences = cookieStore.get('user_preferences')?.value;

    // Build backend URL with query parameters
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/sale`
    );

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        backendUrl.searchParams.append(key, String(value));
      }
    });

    if (userPreferences) {
      backendUrl.searchParams.append('preferences', userPreferences);
    }

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: {
        revalidate: queryParams.sortBy === 'expiry' ? 60 : // 1 minute for expiry sort (time-sensitive)
                    queryParams.saleType === 'flash' ? 120 : // 2 minutes for flash sales
                    300, // 5 minutes for other sorts
        tags: ['sale-products', 'products', `sale-type-${queryParams.saleType}`],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch sale products',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: SaleProductsResponse = {
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
        statistics: data.data?.statistics || data.statistics || {
          totalProducts: 0,
          averageDiscount: 0,
          totalSavings: 0,
          expiringToday: 0,
          expiringThisWeek: 0,
          clearanceCount: 0,
          flashSaleCount: 0,
        },
        filters: data.data?.filters || data.filters || {
          categories: [],
          brands: [],
          saleTypes: [],
          priceRange: { min: 0, max: 0 },
          discountRange: { min: 0, max: 0 },
        },
        deals: data.data?.deals || data.deals || {
          flashSales: [],
          featuredDeals: [],
        },
      },
      timestamp: new Date().toISOString(),
    };

    // Determine cache duration based on data volatility
    let cacheDuration = 300; // Default 5 minutes
    
    if (queryParams.sortBy === 'expiry') {
      cacheDuration = 60; // 1 minute for expiry sort
    } else if (queryParams.saleType === 'flash') {
      cacheDuration = 120; // 2 minutes for flash sales
    } else if (queryParams.sortBy === 'newest') {
      cacheDuration = 180; // 3 minutes for newest items
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${cacheDuration}, stale-while-revalidate=${cacheDuration * 2}`,
      },
    });
  } catch (error) {
    console.error('Sale Products API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching sale products',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sale
 * 
 * Create or update sale configuration (Admin only)
 * 
 * Body:
 * {
 *   productIds: string[],
 *   saleType: string,
 *   discount: number,
 *   startDate: string,
 *   endDate?: string,
 *   reason?: string
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
            message: 'Authentication required to manage sales',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Basic validation
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

    if (!body.saleType || !body.discount) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Sale type and discount are required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/sale`;
    
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
              message: 'You do not have permission to manage sales',
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
            message: errorData.message || 'Failed to create sale',
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
          message: 'Sale created successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Sale API Error:', error);

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
          message: 'An unexpected error occurred while creating sale',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sale
 * 
 * Remove products from sale (Admin only)
 * 
 * Query Parameters:
 * - productIds: Comma-separated product IDs
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productIdsParam = searchParams.get('productIds');

    if (!productIdsParam) {
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

    // Check authentication (Admin only)
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to manage sales',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Make request to backend
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/sale`
    );
    backendUrl.searchParams.append('productIds', productIdsParam);
    
    const response = await fetch(backendUrl.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: authHeader,
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
              message: 'You do not have permission to manage sales',
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
            message: errorData.message || 'Failed to remove sale',
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
          updatedCount: data.data?.updatedCount || 0,
          message: 'Products removed from sale successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove Sale API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while removing sale',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

