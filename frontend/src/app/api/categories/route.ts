/**
 * Categories API Route
 * 
 * Handles category listings and creation.
 * Supports hierarchical category structure with parent-child relationships.
 * Includes product counts, filtering, and sorting capabilities.
 * 
 * @module api/categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const CategoriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  parentId: z.string().uuid().optional(),
  level: z.coerce.number().int().min(0).max(5).optional(),
  featured: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'createdAt', 'productsCount', 'order']).default('order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  withProducts: z.coerce.boolean().default(false),
  withChildren: z.coerce.boolean().default(true),
  withParent: z.coerce.boolean().default(false),
});

const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(150).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000).optional(),
  parentId: z.string().uuid().optional(),
  image: z.string().url().optional(),
  banner: z.string().url().optional(),
  icon: z.string().optional(),
  level: z.number().int().min(0).max(5).default(0),
  order: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
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
  children?: Category[];
  parent?: {
    id: string;
    name: string;
    slug: string;
  };
  products?: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    images: Array<{ url: string }>;
  }>;
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  success: boolean;
  data: {
    categories: Category[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
  timestamp: string;
}

interface CreateCategoryResponse {
  success: boolean;
  data: {
    category: Category;
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
 * GET /api/categories
 * 
 * Retrieves a list of categories with optional filtering and pagination
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - search: Search term for category names
 * - parentId: Filter by parent category ID
 * - level: Filter by category level (0-5)
 * - featured: Filter featured categories
 * - active: Filter active/inactive categories
 * - sortBy: Sort field (name, createdAt, productsCount, order)
 * - sortOrder: Sort direction (asc, desc)
 * - withProducts: Include products in response
 * - withChildren: Include child categories
 * - withParent: Include parent category details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Convert search params to object
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = CategoriesQuerySchema.safeParse(params);

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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/categories`
    );

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        backendUrl.searchParams.append(key, String(value));
      }
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
        tags: ['categories'],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch categories',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: CategoriesResponse = {
      success: true,
      data: {
        categories: data.data?.categories || data.categories || [],
        pagination: data.data?.pagination || data.pagination || {
          page: queryParams.page,
          limit: queryParams.limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
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
    console.error('Categories API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching categories',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * 
 * Creates a new category (Admin only)
 * 
 * Request Body:
 * - name: Category name (required)
 * - slug: URL-friendly slug (required)
 * - description: Category description (optional)
 * - parentId: Parent category ID (optional)
 * - image: Category image URL (optional)
 * - banner: Category banner URL (optional)
 * - icon: Category icon (optional)
 * - level: Category level in hierarchy (0-5)
 * - order: Display order
 * - featured: Featured category flag
 * - active: Active status
 * - seo: SEO metadata (optional)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to create categories',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = CreateCategorySchema.safeParse(body);

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

    const categoryData = validationResult.data;

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/categories`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
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
            message: errorData.message || 'Failed to create category',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: CreateCategoryResponse = {
      success: true,
      data: {
        category: data.data?.category || data.category,
        message: 'Category created successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Create Category API Error:', error);

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
          message: 'An unexpected error occurred while creating category',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
