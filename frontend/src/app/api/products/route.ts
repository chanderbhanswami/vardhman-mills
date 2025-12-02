/**
 * Products API Route
 * 
 * Handles product catalog operations including listing, filtering, searching, and management.
 * Supports advanced filtering, sorting, pagination, and bulk operations.
 * 
 * @module api/products
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const GetProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStock: z.coerce.boolean().optional(),
  onSale: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  newArrival: z.coerce.boolean().optional(),
  tags: z.string().optional(), // Comma-separated
  colors: z.string().optional(), // Comma-separated
  sizes: z.string().optional(), // Comma-separated
  materials: z.string().optional(), // Comma-separated
  discount: z.coerce.number().min(0).max(100).optional(),
  sortBy: z.enum([
    'newest',
    'oldest',
    'price-low',
    'price-high',
    'rating',
    'popular',
    'discount',
    'name-asc',
    'name-desc',
  ]).default('newest'),
  search: z.string().optional(),
  attributes: z.string().optional(), // JSON string of key-value pairs
});

const CreateProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200, 'Name too long'),
  slug: z.string().min(3).max(250).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  shortDescription: z.string().max(500).optional(),
  sku: z.string().min(1, 'SKU is required').max(100),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  brand: z.string().min(1, 'Brand is required'),
  tags: z.array(z.string()).default([]),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string(),
    isPrimary: z.boolean().default(false),
  })).min(1, 'At least one image is required'),
  variants: z.array(z.object({
    sku: z.string(),
    name: z.string(),
    price: z.number().positive().optional(),
    stock: z.number().int().nonnegative(),
    attributes: z.record(z.string(), z.string()),
    image: z.string().url().optional(),
  })).optional(),
  stock: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(10),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(['cm', 'in']).default('cm'),
  }).optional(),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  onSale: z.boolean().default(false),
  saleStartDate: z.string().datetime().optional(),
  saleEndDate: z.string().datetime().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.array(z.string()).optional(),
  published: z.boolean().default(true),
});

const BulkOperationSchema = z.object({
  operation: z.enum(['delete', 'publish', 'unpublish', 'feature', 'unfeature', 'update-stock']),
  productIds: z.array(z.string()).min(1, 'At least one product ID required'),
  data: z.record(z.string(), z.any()).optional(),
});

// Types
interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number | null;
  stock: number;
  attributes: Record<string, string>;
  image: string | null;
}

interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  discount: number;
  category: string;
  categoryId: string;
  subcategory: string | null;
  subcategoryId: string | null;
  brand: string;
  brandId: string;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  stock: number;
  lowStockThreshold: number;
  inStock: boolean;
  weight: number | null;
  dimensions: ProductDimensions | null;
  attributes: Record<string, string | number | boolean | string[]>;
  specifications: Record<string, string>;
  featured: boolean;
  newArrival: boolean;
  onSale: boolean;
  saleStartDate: string | null;
  saleEndDate: string | null;
  averageRating: number;
  totalReviews: number;
  totalSales: number;
  viewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface ProductFilters {
  categories: FilterOption[];
  brands: FilterOption[];
  priceRanges: Array<{
    min: number;
    max: number;
    label: string;
    count: number;
  }>;
  ratings: Array<{
    rating: number;
    count: number;
  }>;
  colors: FilterOption[];
  sizes: FilterOption[];
  materials: FilterOption[];
  tags: FilterOption[];
  inStock: boolean;
}

interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    filters: ProductFilters;
    appliedFilters: Record<string, string | number | boolean | undefined>;
    sorting: {
      current: string;
      options: Array<{
        value: string;
        label: string;
      }>;
    };
  };
  timestamp: string;
}

interface CreateProductResponse {
  success: boolean;
  data: {
    product: Product;
    message: string;
  };
  timestamp: string;
}

interface BulkOperationResponse {
  success: boolean;
  data: {
    affected: number;
    successful: string[];
    failed: Array<{
      productId: string;
      reason: string;
    }>;
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
 * GET /api/products
 * 
 * Get products with advanced filtering, sorting, and pagination
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 12, max: 100)
 * - category: Filter by category
 * - subcategory: Filter by subcategory
 * - brand: Filter by brand
 * - minPrice: Minimum price filter
 * - maxPrice: Maximum price filter
 * - minRating: Minimum rating filter (0-5)
 * - inStock: Filter in-stock products only
 * - onSale: Filter products on sale
 * - featured: Filter featured products
 * - newArrival: Filter new arrivals
 * - tags: Comma-separated tags
 * - colors: Comma-separated colors
 * - sizes: Comma-separated sizes
 * - materials: Comma-separated materials
 * - discount: Minimum discount percentage
 * - sortBy: Sort order (newest, price-low, price-high, rating, popular, etc.)
 * - search: Search query
 * - attributes: JSON string of attribute filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = GetProductsQuerySchema.safeParse(params);

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
    const guestId = cookieStore.get('guest_id')?.value;

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products`
    );

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        backendUrl.searchParams.append(key, String(value));
      }
    });

    if (guestId) {
      backendUrl.searchParams.append('guestId', guestId);
    }

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    // Determine cache duration based on filters
    const hasTimeBasedFilters = queryParams.onSale || queryParams.featured || queryParams.newArrival;
    const cacheRevalidate = hasTimeBasedFilters ? 60 : 300; // 1 min vs 5 min

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      next: {
        revalidate: cacheRevalidate,
        tags: [
          'products',
          `products-category-${queryParams.category}`,
          `products-brand-${queryParams.brand}`,
        ],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch products',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: ProductsResponse = {
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
          brands: [],
          priceRanges: [],
          ratings: [],
          colors: [],
          sizes: [],
          materials: [],
          tags: [],
          inStock: false,
        },
        appliedFilters: queryParams,
        sorting: {
          current: queryParams.sortBy,
          options: [
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'price-low', label: 'Price: Low to High' },
            { value: 'price-high', label: 'Price: High to Low' },
            { value: 'rating', label: 'Highest Rated' },
            { value: 'popular', label: 'Most Popular' },
            { value: 'discount', label: 'Highest Discount' },
            { value: 'name-asc', label: 'Name: A to Z' },
            { value: 'name-desc', label: 'Name: Z to A' },
          ],
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${cacheRevalidate}, stale-while-revalidate=600`,
      },
    });
  } catch (error) {
    console.error('Get Products API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching products',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * 
 * Create a new product (Admin only)
 * 
 * Body: CreateProductSchema
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

    // Validate request body
    const validationResult = CreateProductSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid product data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const productData = validationResult.data;

    // Collect metadata
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const enrichedProductData = {
      ...productData,
      metadata: {
        createdBy: 'admin',
        ipAddress: clientIp,
      },
    };

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${adminToken || authToken}`,
      },
      body: JSON.stringify(enrichedProductData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 403) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Admin privileges required to create products',
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
              code: 'PRODUCT_EXISTS',
              message: 'A product with this SKU or slug already exists',
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
            message: errorData.message || 'Failed to create product',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: CreateProductResponse = {
      success: true,
      data: {
        product: data.data?.product || data.product,
        message: 'Product created successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Create Product API Error:', error);

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
          message: 'An unexpected error occurred while creating product',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products
 * 
 * Bulk operations on products (Admin only)
 * 
 * Body:
 * {
 *   operation: 'delete' | 'publish' | 'unpublish' | 'feature' | 'unfeature' | 'update-stock',
 *   productIds: string[],
 *   data?: Record<string, any>
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
    const validationResult = BulkOperationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid bulk operation data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const operationData = validationResult.data;

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/bulk`;

    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${adminToken || authToken}`,
      },
      body: JSON.stringify(operationData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 403) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Admin privileges required for bulk operations',
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
            message: errorData.message || 'Failed to perform bulk operation',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: BulkOperationResponse = {
      success: true,
      data: {
        affected: data.data?.affected || 0,
        successful: data.data?.successful || [],
        failed: data.data?.failed || [],
        message: `Bulk operation completed: ${data.data?.affected || 0} products affected`,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Bulk Product Operation API Error:', error);

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
          message: 'An unexpected error occurred during bulk operation',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products
 * 
 * Delete multiple products (Admin only)
 * 
 * Query Parameters:
 * - ids: Comma-separated product IDs
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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/bulk`
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
              message: 'Admin privileges required to delete products',
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
            message: errorData.message || 'Failed to delete products',
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
          deleted: data.data?.deleted || productIds.length,
          message: `${data.data?.deleted || productIds.length} product(s) deleted successfully`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Products API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while deleting products',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

