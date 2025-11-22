/**
 * Individual Product API Route
 * 
 * Handles single product operations including fetching details, updating, and deleting.
 * Supports complete product information with variants, reviews, and related products.
 * 
 * @module api/products/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const GetProductQuerySchema = z.object({
  includeRelated: z.coerce.boolean().default(true),
  includeReviews: z.coerce.boolean().default(true),
  includeVariants: z.coerce.boolean().default(true),
  reviewsLimit: z.coerce.number().int().positive().max(50).default(5),
  relatedLimit: z.coerce.number().int().positive().max(20).default(4),
});

const UpdateProductSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  slug: z.string().min(3).max(250).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().min(20).max(5000).optional(),
  shortDescription: z.string().max(500).optional(),
  sku: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().nullable().optional(),
  costPrice: z.number().positive().nullable().optional(),
  category: z.string().min(1).optional(),
  subcategory: z.string().nullable().optional(),
  brand: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string(),
    isPrimary: z.boolean(),
  })).optional(),
  variants: z.array(z.object({
    id: z.string().optional(),
    sku: z.string(),
    name: z.string(),
    price: z.number().positive().nullable(),
    stock: z.number().int().nonnegative(),
    attributes: z.record(z.string(), z.string()),
    image: z.string().url().nullable(),
  })).optional(),
  stock: z.number().int().nonnegative().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  weight: z.number().positive().nullable().optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(['cm', 'in']),
  }).nullable().optional(),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  featured: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  onSale: z.boolean().optional(),
  saleStartDate: z.string().datetime().nullable().optional(),
  saleEndDate: z.string().datetime().nullable().optional(),
  metaTitle: z.string().max(60).nullable().optional(),
  metaDescription: z.string().max(160).nullable().optional(),
  metaKeywords: z.array(z.string()).optional(),
  published: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
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
  available: boolean;
}

interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

interface BreadcrumbItem {
  name: string;
  slug: string;
  url: string;
}

interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  images: string[];
  createdAt: string;
}

interface RelatedProduct {
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
}

interface FrequentlyBoughtTogether {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  price: number;
  inStock: boolean;
}

interface ProductDetails {
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
  categorySlug: string;
  subcategory: string | null;
  subcategoryId: string | null;
  subcategorySlug: string | null;
  brand: string;
  brandId: string;
  brandSlug: string;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  stock: number;
  lowStockThreshold: number;
  inStock: boolean;
  lowStock: boolean;
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
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  totalSales: number;
  viewCount: number;
  breadcrumbs: BreadcrumbItem[];
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductResponse {
  success: boolean;
  data: {
    product: ProductDetails;
    reviews?: ProductReview[];
    relatedProducts?: RelatedProduct[];
    frequentlyBoughtTogether?: FrequentlyBoughtTogether[];
    userInteraction?: {
      inWishlist: boolean;
      inCart: boolean;
      hasReviewed: boolean;
      hasPurchased: boolean;
    };
  };
  timestamp: string;
}

interface UpdateProductResponse {
  success: boolean;
  data: {
    product: ProductDetails;
    message: string;
    updatedFields: string[];
  };
  timestamp: string;
}

interface DeleteProductResponse {
  success: boolean;
  data: {
    message: string;
    deletedProduct: {
      id: string;
      name: string;
      sku: string;
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
 * GET /api/products/[id]
 * 
 * Get detailed information for a specific product
 * 
 * Path Parameters:
 * - id: Product ID or slug
 * 
 * Query Parameters:
 * - includeRelated: Include related products (default: true)
 * - includeReviews: Include product reviews (default: true)
 * - includeVariants: Include product variants (default: true)
 * - reviewsLimit: Number of reviews to include (default: 5, max: 50)
 * - relatedLimit: Number of related products (default: 4, max: 20)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
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

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = GetProductQuerySchema.safeParse(queryParams);

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

    const query = validationResult.data;

    // Get authentication (optional)
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const guestId = cookieStore.get('guest_id')?.value;

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/${id}`
    );

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
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

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      next: {
        revalidate: 300, // 5 minutes
        tags: ['products', `product-${id}`],
      },
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

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch product',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: ProductResponse = {
      success: true,
      data: {
        product: data.data?.product || data.product,
        reviews: query.includeReviews ? (data.data?.reviews || data.reviews || []) : undefined,
        relatedProducts: query.includeRelated ? (data.data?.relatedProducts || data.relatedProducts || []) : undefined,
        frequentlyBoughtTogether: data.data?.frequentlyBoughtTogether || data.frequentlyBoughtTogether || [],
        userInteraction: data.data?.userInteraction || data.userInteraction || {
          inWishlist: false,
          inCart: false,
          hasReviewed: false,
          hasPurchased: false,
        },
      },
      timestamp: new Date().toISOString(),
    };

    // Track product view
    if (data.data?.product?.id || data.product?.id) {
      const productId = data.data?.product?.id || data.product?.id;
      
      // Fire and forget view tracking
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/${productId}/view`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
          },
          body: JSON.stringify({
            guestId,
            timestamp: new Date().toISOString(),
          }),
        }
      ).catch(() => {
        // Silently fail view tracking
      });
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Get Product API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching product',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/[id]
 * 
 * Update a product (Admin only)
 * 
 * Path Parameters:
 * - id: Product ID
 * 
 * Body: Partial product update data (UpdateProductSchema)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
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
    const validationResult = UpdateProductSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid product update data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Collect metadata
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    const enrichedUpdateData = {
      ...updateData,
      metadata: {
        updatedBy: 'admin',
        ipAddress: clientIp,
      },
    };

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/${id}`;
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${adminToken || authToken}`,
      },
      body: JSON.stringify(enrichedUpdateData),
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
              message: 'Admin privileges required to update products',
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
              code: 'PRODUCT_CONFLICT',
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
            message: errorData.message || 'Failed to update product',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: UpdateProductResponse = {
      success: true,
      data: {
        product: data.data?.product || data.product,
        message: 'Product updated successfully',
        updatedFields: Object.keys(updateData),
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Update Product API Error:', error);

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
          message: 'An unexpected error occurred while updating product',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * 
 * Delete a product (Admin only)
 * 
 * Path Parameters:
 * - id: Product ID
 * 
 * Query Parameters:
 * - permanent: Permanently delete (default: false, soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
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

    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    // Make request to backend
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/${id}`
    );
    
    if (permanent) {
      backendUrl.searchParams.append('permanent', 'true');
    }
    
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
            message: errorData.message || 'Failed to delete product',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: DeleteProductResponse = {
      success: true,
      data: {
        message: permanent ? 'Product permanently deleted' : 'Product deleted successfully',
        deletedProduct: data.data?.product || data.product || {
          id,
          name: 'Unknown',
          sku: 'Unknown',
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Delete Product API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while deleting product',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
