/**
 * Collections API Route
 * 
 * Handles product collection listings and management.
 * Supports seasonal collections, featured collections, and custom groupings.
 * Includes filtering, sorting, and product relationship management.
 * 
 * @module api/collections
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const CollectionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  type: z.enum(['seasonal', 'featured', 'sale', 'new', 'bestsellers', 'custom']).optional(),
  featured: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'createdAt', 'productsCount', 'order', 'startDate']).default('order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  withProducts: z.coerce.boolean().default(false),
  productsLimit: z.coerce.number().int().positive().max(50).default(12),
});

const CreateCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(150).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(2000).optional(),
  type: z.enum(['seasonal', 'featured', 'sale', 'new', 'bestsellers', 'custom']),
  image: z.string().url().optional(),
  banner: z.string().url().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  products: z.array(z.string().uuid()).optional(),
  rules: z.object({
    categoryIds: z.array(z.string().uuid()).optional(),
    brandIds: z.array(z.string().uuid()).optional(),
    tags: z.array(z.string()).optional(),
    minPrice: z.number().positive().optional(),
    maxPrice: z.number().positive().optional(),
    inStock: z.boolean().optional(),
    featured: z.boolean().optional(),
    new: z.boolean().optional(),
    onSale: z.boolean().optional(),
  }).optional(),
  seo: z.object({
    metaTitle: z.string().max(100).optional(),
    metaDescription: z.string().max(200).optional(),
    metaKeywords: z.array(z.string()).optional(),
  }).optional(),
});

// Types
interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: 'seasonal' | 'featured' | 'sale' | 'new' | 'bestsellers' | 'custom';
  image: string | null;
  banner: string | null;
  startDate: string | null;
  endDate: string | null;
  featured: boolean;
  active: boolean;
  order: number;
  productsCount: number;
  products?: Array<{
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
  }>;
  rules: {
    categoryIds: string[];
    brandIds: string[];
    tags: string[];
    minPrice: number | null;
    maxPrice: number | null;
    inStock: boolean | null;
    featured: boolean | null;
    new: boolean | null;
    onSale: boolean | null;
  };
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface CollectionsResponse {
  success: boolean;
  data: {
    collections: Collection[];
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

interface CreateCollectionResponse {
  success: boolean;
  data: {
    collection: Collection;
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
 * GET /api/collections
 * 
 * Retrieves a list of collections with optional filtering and pagination
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - search: Search term for collection names
 * - type: Filter by collection type
 * - featured: Filter featured collections
 * - active: Filter active/inactive collections
 * - sortBy: Sort field (name, createdAt, productsCount, order, startDate)
 * - sortOrder: Sort direction (asc, desc)
 * - withProducts: Include products in response
 * - productsLimit: Limit number of products per collection (max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Convert search params to object
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = CollectionsQuerySchema.safeParse(params);

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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/collections`
    );

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        backendUrl.searchParams.append(key, String(value));
      }
    });

    // Determine cache duration based on collection type
    let revalidateTime = 3600; // Default 1 hour
    if (queryParams.type === 'sale' || queryParams.type === 'new') {
      revalidateTime = 1800; // 30 minutes for sale/new collections
    } else if (queryParams.type === 'seasonal') {
      revalidateTime = 7200; // 2 hours for seasonal
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
        tags: ['collections'],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch collections',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: CollectionsResponse = {
      success: true,
      data: {
        collections: data.data?.collections || data.collections || [],
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
        'Cache-Control': `public, s-maxage=${revalidateTime}, stale-while-revalidate=${revalidateTime * 2}`,
        'CDN-Cache-Control': `public, s-maxage=${revalidateTime}`,
        'Vercel-CDN-Cache-Control': `public, s-maxage=${revalidateTime}`,
      },
    });
  } catch (error) {
    console.error('Collections API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching collections',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/collections
 * 
 * Creates a new collection (Admin only)
 * 
 * Request Body:
 * - name: Collection name (required)
 * - slug: URL-friendly slug (required)
 * - description: Collection description (optional)
 * - type: Collection type (required)
 * - image: Collection image URL (optional)
 * - banner: Collection banner URL (optional)
 * - startDate: Collection start date (optional)
 * - endDate: Collection end date (optional)
 * - featured: Featured collection flag
 * - active: Active status
 * - order: Display order
 * - products: Array of product IDs (optional)
 * - rules: Automatic collection rules (optional)
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
            message: 'Authentication required to create collections',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = CreateCollectionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid collection data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const collectionData = validationResult.data;

    // Validate date range if both dates provided
    if (collectionData.startDate && collectionData.endDate) {
      const start = new Date(collectionData.startDate);
      const end = new Date(collectionData.endDate);
      
      if (end <= start) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'End date must be after start date',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/collections`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(collectionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'SLUG_EXISTS',
              message: 'A collection with this slug already exists',
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
            message: errorData.message || 'Failed to create collection',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: CreateCollectionResponse = {
      success: true,
      data: {
        collection: data.data?.collection || data.collection,
        message: 'Collection created successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Create Collection API Error:', error);

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
          message: 'An unexpected error occurred while creating collection',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
