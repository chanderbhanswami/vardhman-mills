/**
 * Coupons API Route
 * 
 * Handles coupon listings, validation, and management.
 * Supports percentage and fixed amount discounts.
 * Includes usage tracking and expiration validation.
 * 
 * @module api/coupons
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

// Validation schemas
const CouponsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  type: z.enum(['percentage', 'fixed', 'free-shipping', 'buy-x-get-y']).optional(),
  status: z.enum(['active', 'inactive', 'expired', 'scheduled']).optional(),
  category: z.string().optional(),
  minOrder: z.coerce.number().positive().optional(),
  sortBy: z.enum(['createdAt', 'expiresAt', 'discountValue', 'usageCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  public: z.coerce.boolean().optional(),
});

const ValidateCouponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  cartTotal: z.number().positive(),
  userId: z.string().uuid().optional(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
      categoryId: z.string().uuid().optional(),
    })
  ).optional(),
});

const CreateCouponSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['percentage', 'fixed', 'free-shipping', 'buy-x-get-y']),
  discountValue: z.number().positive(),
  maxDiscount: z.number().positive().optional(),
  minOrderValue: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerUser: z.number().int().positive().optional(),
  startDate: z.string().datetime(),
  expiresAt: z.string().datetime(),
  applicableCategories: z.array(z.string().uuid()).optional(),
  applicableProducts: z.array(z.string().uuid()).optional(),
  excludedCategories: z.array(z.string().uuid()).optional(),
  excludedProducts: z.array(z.string().uuid()).optional(),
  firstOrderOnly: z.boolean().default(false),
  stackable: z.boolean().default(false),
  public: z.boolean().default(true),
  targetUserSegment: z.enum(['all', 'new', 'returning', 'vip', 'custom']).default('all'),
  customUserIds: z.array(z.string().uuid()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Types
interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: 'percentage' | 'fixed' | 'free-shipping' | 'buy-x-get-y';
  discountValue: number;
  maxDiscount: number | null;
  minOrderValue: number | null;
  maxUses: number | null;
  maxUsesPerUser: number | null;
  usageCount: number;
  startDate: string;
  expiresAt: string;
  status: 'active' | 'inactive' | 'expired' | 'scheduled';
  applicableCategories: string[];
  applicableProducts: string[];
  excludedCategories: string[];
  excludedProducts: string[];
  firstOrderOnly: boolean;
  stackable: boolean;
  public: boolean;
  targetUserSegment: 'all' | 'new' | 'returning' | 'vip' | 'custom';
  customUserIds: string[];
  metadata: Record<string, unknown>;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CouponValidation {
  valid: boolean;
  coupon?: Coupon;
  discount?: {
    amount: number;
    type: 'percentage' | 'fixed';
    finalTotal: number;
  };
  reason?: string;
  errors?: string[];
}

interface CouponsResponse {
  success: boolean;
  data: {
    coupons: Coupon[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    statistics?: {
      active: number;
      expired: number;
      scheduled: number;
      totalUsage: number;
    };
  };
  timestamp: string;
}

interface ValidateCouponResponse {
  success: boolean;
  data: CouponValidation;
  timestamp: string;
}

interface CreateCouponResponse {
  success: boolean;
  data: {
    coupon: Coupon;
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
 * GET /api/coupons
 * 
 * Retrieves available coupons
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - search: Search by code or name
 * - type: Filter by coupon type
 * - status: Filter by status
 * - category: Filter by applicable category
 * - minOrder: Filter by minimum order value
 * - sortBy: Sort field (createdAt, expiresAt, discountValue, usageCount)
 * - sortOrder: Sort direction (asc, desc)
 * - public: Show only public coupons
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = CouponsQuerySchema.safeParse(params);

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

    // Get authentication token
    const authHeader = request.headers.get('Authorization');
    const cookieStore = await cookies();
    const accessToken = authHeader?.replace('Bearer ', '') || cookieStore.get('access_token')?.value;

    // Build backend URL with query parameters
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/coupons`
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
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      next: {
        revalidate: 1800, // Cache for 30 minutes
        tags: ['coupons'],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch coupons',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: CouponsResponse = {
      success: true,
      data: {
        coupons: data.data?.coupons || data.coupons || [],
        pagination: data.data?.pagination || data.pagination || {
          page: queryParams.page,
          limit: queryParams.limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        statistics: data.data?.statistics || data.statistics,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        'CDN-Cache-Control': 'public, s-maxage=1800',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=1800',
      },
    });
  } catch (error) {
    console.error('Coupons API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching coupons',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coupons
 * 
 * Creates a new coupon (Admin only) OR validates a coupon code
 * 
 * For validation, send: { action: 'validate', ...ValidateCouponSchema }
 * For creation, send: CreateCouponSchema
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a validation request
    if (body.action === 'validate') {
      return validateCoupon(request, body);
    }

    // Otherwise, treat as coupon creation (Admin only)
    return createCoupon(request, body);
  } catch (error) {
    console.error('Coupons POST API Error:', error);

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
          message: 'An unexpected error occurred',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Validates a coupon code
 */
async function validateCoupon(request: NextRequest, body: unknown) {
  // Validate request body
  const validationResult = ValidateCouponSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid coupon validation data',
          details: validationResult.error.flatten(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  const validationData = validationResult.data;

  // Get authentication token
  const authHeader = request.headers.get('Authorization');
  const cookieStore = await cookies();
  const accessToken = authHeader?.replace('Bearer ', '') || cookieStore.get('access_token')?.value;

  // Build backend request
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/coupons/validate`;
  
  const response = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(validationData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 404) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'COUPON_NOT_FOUND',
            message: 'Coupon code not found or has expired',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    if (response.status === 400) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: errorData.code || 'COUPON_INVALID',
            message: errorData.message || 'Coupon is not valid for this order',
            details: errorData,
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
          code: 'BACKEND_ERROR',
          message: errorData.message || 'Failed to validate coupon',
          details: errorData,
        },
        timestamp: new Date().toISOString(),
      },
      { status: response.status }
    );
  }

  const data = await response.json();

  const responseData: ValidateCouponResponse = {
    success: true,
    data: data.data || data,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(responseData, { status: 200 });
}

/**
 * Creates a new coupon (Admin only)
 */
async function createCoupon(request: NextRequest, body: unknown) {
  // Check authentication (Admin only)
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required to create coupons',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  // Validate request body
  const validationResult = CreateCouponSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid coupon data',
          details: validationResult.error.flatten(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  const couponData = validationResult.data;

  // Validate date range
  const startDate = new Date(couponData.startDate);
  const expiresAt = new Date(couponData.expiresAt);

  if (expiresAt <= startDate) {
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INVALID_DATE_RANGE',
          message: 'Expiry date must be after start date',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  // Make request to backend
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/coupons`;
  
  const response = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(couponData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 409) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'COUPON_EXISTS',
            message: 'A coupon with this code already exists',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    if (response.status === 403) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to create coupons',
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
          message: errorData.message || 'Failed to create coupon',
          details: errorData,
        },
        timestamp: new Date().toISOString(),
      },
      { status: response.status }
    );
  }

  const data = await response.json();

  const responseData: CreateCouponResponse = {
    success: true,
    data: {
      coupon: data.data?.coupon || data.coupon,
      message: 'Coupon created successfully',
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(responseData, { status: 201 });
}

