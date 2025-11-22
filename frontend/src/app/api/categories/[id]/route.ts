/**
 * Category by ID API Route
 * 
 * Handles individual category operations (GET, PUT, DELETE).
 * Supports category details retrieval, updates, and deletion.
 * Includes hierarchical data and product relationships.
 * 
 * @module api/categories/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(150).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(1000).optional(),
  parentId: z.string().uuid().nullable().optional(),
  image: z.string().url().nullable().optional(),
  banner: z.string().url().nullable().optional(),
  icon: z.string().nullable().optional(),
  level: z.number().int().min(0).max(5).optional(),
  order: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  seo: z.object({
    metaTitle: z.string().max(100).optional(),
    metaDescription: z.string().max(200).optional(),
    metaKeywords: z.array(z.string()).optional(),
  }).optional(),
});

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  image: string | null;
  banner: string | null;
  icon: string | null;
  level: number;
  order: number;
  featured: boolean;
  active: boolean;
  productsCount: number;
  children: Category[];
  parent: {
    id: string;
    name: string;
    slug: string;
  } | null;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    stock: number;
    images: Array<{
      url: string;
      alt: string;
      isPrimary: boolean;
    }>;
  }>;
  breadcrumb: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface CategoryResponse {
  success: boolean;
  data: {
    category: Category;
  };
  timestamp: string;
}

interface UpdateCategoryResponse {
  success: boolean;
  data: {
    category: Category;
    message: string;
  };
  timestamp: string;
}

interface DeleteCategoryResponse {
  success: boolean;
  data: {
    message: string;
    deletedId: string;
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
 * GET /api/categories/[id]
 * 
 * Retrieves details of a specific category
 * 
 * Query Parameters:
 * - withProducts: Include category products (default: false)
 * - withChildren: Include child categories (default: true)
 * - withParent: Include parent category (default: true)
 * - withBreadcrumb: Include breadcrumb trail (default: true)
 * - productsLimit: Limit number of products returned (default: 12)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format
    const uuidSchema = z.string().uuid();
    const idValidation = uuidSchema.safeParse(id);

    if (!idValidation.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'Invalid category ID format',
            details: idValidation.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      withProducts: searchParams.get('withProducts') === 'true',
      withChildren: searchParams.get('withChildren') !== 'false',
      withParent: searchParams.get('withParent') !== 'false',
      withBreadcrumb: searchParams.get('withBreadcrumb') !== 'false',
      productsLimit: parseInt(searchParams.get('productsLimit') || '12'),
    };

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/categories/${id}`
    );

    Object.entries(queryParams).forEach(([key, value]) => {
      backendUrl.searchParams.append(key, String(value));
    });

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ['categories', `category-${id}`],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'CATEGORY_NOT_FOUND',
              message: 'Category not found',
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
            message: errorData.message || 'Failed to fetch category',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: CategoryResponse = {
      success: true,
      data: {
        category: data.data?.category || data.category,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'CDN-Cache-Control': 'public, s-maxage=3600',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Category API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching category',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categories/[id]
 * 
 * Updates a category (Admin only)
 * 
 * Request Body:
 * - name: Category name (optional)
 * - slug: URL-friendly slug (optional)
 * - description: Category description (optional)
 * - parentId: Parent category ID (optional, nullable)
 * - image: Category image URL (optional, nullable)
 * - banner: Category banner URL (optional, nullable)
 * - icon: Category icon (optional, nullable)
 * - level: Category level (optional)
 * - order: Display order (optional)
 * - featured: Featured flag (optional)
 * - active: Active status (optional)
 * - seo: SEO metadata (optional)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to update categories',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Validate ID format
    const uuidSchema = z.string().uuid();
    const idValidation = uuidSchema.safeParse(id);

    if (!idValidation.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'Invalid category ID format',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = UpdateCategorySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid category data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/categories/${id}`;
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: authHeader,
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
              code: 'CATEGORY_NOT_FOUND',
              message: 'Category not found',
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
              code: 'SLUG_EXISTS',
              message: 'A category with this slug already exists',
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
            message: errorData.message || 'Failed to update category',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: UpdateCategoryResponse = {
      success: true,
      data: {
        category: data.data?.category || data.category,
        message: 'Category updated successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Update Category API Error:', error);

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
          message: 'An unexpected error occurred while updating category',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/categories/[id]
 * 
 * Partially updates a category (delegates to PUT)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}

/**
 * DELETE /api/categories/[id]
 * 
 * Deletes a category (Admin only)
 * 
 * Query Parameters:
 * - cascade: Delete child categories (default: false)
 * - moveProducts: Move products to parent category (default: true)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to delete categories',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Validate ID format
    const uuidSchema = z.string().uuid();
    const idValidation = uuidSchema.safeParse(id);

    if (!idValidation.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'Invalid category ID format',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cascade = searchParams.get('cascade') === 'true';
    const moveProducts = searchParams.get('moveProducts') !== 'false';

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/categories/${id}`
    );
    backendUrl.searchParams.append('cascade', String(cascade));
    backendUrl.searchParams.append('moveProducts', String(moveProducts));

    // Make delete request to backend
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
      
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'CATEGORY_NOT_FOUND',
              message: 'Category not found',
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
              code: 'CATEGORY_HAS_CHILDREN',
              message: 'Cannot delete category with child categories. Use cascade=true to delete all children.',
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
            message: errorData.message || 'Failed to delete category',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const responseData: DeleteCategoryResponse = {
      success: true,
      data: {
        message: 'Category deleted successfully',
        deletedId: id,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Delete Category API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while deleting category',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
