/**
 * Compare API Route
 * 
 * Handles product comparison functionality.
 * Supports adding/removing products from comparison, fetching comparison data.
 * Generates specification matrix for side-by-side product comparison.
 * 
 * @module api/compare
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

// Validation schemas
const AddToCompareSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
});

const RemoveFromCompareSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
});

const CompareQuerySchema = z.object({
  productIds: z.string().optional(), // Comma-separated UUIDs
});

// Types
interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
  category: string;
}

interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  stock: number;
  rating: number;
  reviewsCount: number;
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  brand: {
    id: string;
    name: string;
    slug: string;
  } | null;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  specifications: ProductSpecification[];
  features: string[];
  tags: string[];
  inStock: boolean;
  isNew: boolean;
  isFeatured: boolean;
}

interface ComparisonMatrix {
  categories: Array<{
    name: string;
    specifications: Array<{
      name: string;
      unit?: string;
      values: Array<{
        productId: string;
        value: string;
      }>;
    }>;
  }>;
}

interface CompareResponse {
  success: boolean;
  data: {
    products: CompareProduct[];
    matrix: ComparisonMatrix;
    sessionId: string;
  };
  timestamp: string;
}

interface AddToCompareResponse {
  success: boolean;
  data: {
    products: CompareProduct[];
    addedProduct: CompareProduct;
    message: string;
  };
  timestamp: string;
}

interface RemoveFromCompareResponse {
  success: boolean;
  data: {
    products: CompareProduct[];
    removedProductId: string;
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
 * GET /api/compare
 * 
 * Retrieves comparison data for products
 * 
 * Query Parameters:
 * - productIds: Comma-separated product IDs (optional, uses session if not provided)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = CompareQuerySchema.safeParse(params);

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

    // Get or create compare session ID
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('compare_session_id')?.value;

    if (!sessionId && !validationResult.data.productIds) {
      return NextResponse.json<CompareResponse>(
        {
          success: true,
          data: {
            products: [],
            matrix: { categories: [] },
            sessionId: '',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/compare`
    );

    if (validationResult.data.productIds) {
      backendUrl.searchParams.append('productIds', validationResult.data.productIds);
    } else if (sessionId) {
      backendUrl.searchParams.append('sessionId', sessionId);
    }

    // Get authentication token
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || cookieStore.get('access_token')?.value;

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      cache: 'no-store', // Don't cache comparison data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch comparison data',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: CompareResponse = {
      success: true,
      data: {
        products: data.data?.products || data.products || [],
        matrix: data.data?.matrix || data.matrix || { categories: [] },
        sessionId: data.data?.sessionId || data.sessionId || sessionId || '',
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
    console.error('Compare API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching comparison data',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/compare
 * 
 * Adds a product to comparison
 * 
 * Request Body:
 * - productId: Product ID to add (required)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = AddToCompareSchema.safeParse(body);

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

    // Get or create compare session ID
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('compare_session_id')?.value;

    if (!sessionId) {
      sessionId = `compare_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    // Get authentication token
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || cookieStore.get('access_token')?.value;

    // Build backend request
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/compare`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({
        productId,
        sessionId,
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

      if (response.status === 400 && errorData.code === 'MAX_COMPARE_LIMIT') {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'MAX_COMPARE_LIMIT',
              message: 'Maximum comparison limit reached (4 products)',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'PRODUCT_ALREADY_IN_COMPARE',
              message: 'Product is already in comparison list',
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
            message: errorData.message || 'Failed to add product to comparison',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Set compare session cookie if new
    const compareResponse = NextResponse.json<AddToCompareResponse>(
      {
        success: true,
        data: {
          products: data.data?.products || data.products || [],
          addedProduct: data.data?.addedProduct || data.addedProduct,
          message: 'Product added to comparison successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

    if (!cookieStore.get('compare_session_id')?.value) {
      compareResponse.cookies.set('compare_session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    return compareResponse;
  } catch (error) {
    console.error('Add to Compare API Error:', error);

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
          message: 'An unexpected error occurred while adding product to comparison',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/compare
 * 
 * Removes a product from comparison
 * 
 * Request Body:
 * - productId: Product ID to remove (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = RemoveFromCompareSchema.safeParse(body);

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

    // Get compare session ID
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('compare_session_id')?.value;

    if (!sessionId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'NO_COMPARE_SESSION',
            message: 'No active comparison session found',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Get authentication token
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || cookieStore.get('access_token')?.value;

    // Build backend request
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/compare`;
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({
        productId,
        sessionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'PRODUCT_NOT_IN_COMPARE',
              message: 'Product not found in comparison list',
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
            message: errorData.message || 'Failed to remove product from comparison',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: RemoveFromCompareResponse = {
      success: true,
      data: {
        products: data.data?.products || data.products || [],
        removedProductId: productId,
        message: 'Product removed from comparison successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Remove from Compare API Error:', error);

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
          message: 'An unexpected error occurred while removing product from comparison',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

