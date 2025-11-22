/**
 * Reviews API Route
 * 
 * Handles product reviews and ratings management.
 * Supports review creation, listing, moderation, and analytics.
 * Implements verification, helpful voting, and media uploads.
 * 
 * @module api/reviews
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const GetReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  productId: z.string().optional(),
  userId: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  verified: z.coerce.boolean().optional(),
  hasMedia: z.coerce.boolean().optional(),
  sortBy: z.enum(['recent', 'helpful', 'rating-high', 'rating-low', 'verified']).default('recent'),
  status: z.enum(['pending', 'approved', 'rejected', 'all']).default('approved'),
});

const CreateReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  orderId: z.string().optional(),
  rating: z.number().int().min(1, 'Minimum rating is 1').max(5, 'Maximum rating is 5'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must not exceed 100 characters'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(2000, 'Comment must not exceed 2000 characters'),
  pros: z.array(z.string().max(200)).max(5).optional(),
  cons: z.array(z.string().max(200)).max(5).optional(),
  images: z.array(z.string().url()).max(5).optional(),
  videos: z.array(z.string().url()).max(2).optional(),
  recommendProduct: z.boolean().default(true),
  anonymous: z.boolean().default(false),
});

// Types
interface ReviewUser {
  id: string;
  name: string;
  avatar: string | null;
  verified: boolean;
  reviewCount: number;
  helpfulVotes: number;
}

interface ReviewProduct {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  sku: string;
}

interface Review {
  id: string;
  productId: string;
  product: ReviewProduct;
  userId: string;
  user: ReviewUser;
  orderId: string | null;
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  images: string[];
  videos: string[];
  recommendProduct: boolean;
  anonymous: boolean;
  verified: boolean; // Verified purchase
  helpful: number; // Helpful votes count
  notHelpful: number; // Not helpful votes count
  userHelpfulVote: 'helpful' | 'not-helpful' | null; // Current user's vote
  replies: Array<{
    id: string;
    userId: string;
    userName: string;
    userType: 'customer' | 'seller' | 'admin';
    comment: string;
    createdAt: string;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  moderationNote: string | null;
  moderatedBy: string | null;
  moderatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    statistics: {
      totalReviews: number;
      averageRating: number;
      ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
      verifiedPurchases: number;
      withMedia: number;
      recommendationRate: number;
    };
    filters: {
      availableRatings: number[];
      hasVerified: boolean;
      hasMedia: boolean;
    };
  };
  timestamp: string;
}

interface CreateReviewResponse {
  success: boolean;
  data: {
    review: Review;
    message: string;
    requiresModeration: boolean;
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
 * GET /api/reviews
 * 
 * Get reviews with filtering and pagination
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - productId: Filter by product ID
 * - userId: Filter by user ID
 * - rating: Filter by rating (1-5)
 * - verified: Filter verified purchases only
 * - hasMedia: Filter reviews with images/videos
 * - sortBy: Sort field (recent, helpful, rating-high, rating-low, verified)
 * - status: Filter by status (pending, approved, rejected, all) - Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = GetReviewsQuerySchema.safeParse(params);

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

    // Get authentication (optional for public reviews)
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews`
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
        revalidate: queryParams.status === 'pending' ? 60 : 300, // 1 min for pending, 5 min for approved
        tags: ['reviews', `reviews-product-${queryParams.productId}`, `reviews-user-${queryParams.userId}`],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch reviews',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: ReviewsResponse = {
      success: true,
      data: {
        reviews: data.data?.reviews || data.reviews || [],
        pagination: data.data?.pagination || data.pagination || {
          page: queryParams.page,
          limit: queryParams.limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        statistics: data.data?.statistics || data.statistics || {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          verifiedPurchases: 0,
          withMedia: 0,
          recommendationRate: 0,
        },
        filters: data.data?.filters || data.filters || {
          availableRatings: [],
          hasVerified: false,
          hasMedia: false,
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': `public, s-maxage=${queryParams.status === 'pending' ? 60 : 300}, stale-while-revalidate=600`,
      },
    });
  } catch (error) {
    console.error('Get Reviews API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching reviews',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * 
 * Create a new review (requires authentication)
 * 
 * Body:
 * {
 *   productId: string,
 *   orderId?: string,
 *   rating: number (1-5),
 *   title: string,
 *   comment: string,
 *   pros?: string[],
 *   cons?: string[],
 *   images?: string[],
 *   videos?: string[],
 *   recommendProduct: boolean,
 *   anonymous: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to submit a review',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = CreateReviewSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid review data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const reviewData = validationResult.data;

    // Collect metadata
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const enrichedReviewData = {
      ...reviewData,
      metadata: {
        ipAddress: clientIp,
        userAgent,
      },
    };

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(enrichedReviewData),
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

      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'REVIEW_ALREADY_EXISTS',
              message: 'You have already reviewed this product',
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
              code: 'PURCHASE_REQUIRED',
              message: 'You must purchase this product before reviewing it',
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
            message: errorData.message || 'Failed to submit review',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: CreateReviewResponse = {
      success: true,
      data: {
        review: data.data?.review || data.review,
        message: 'Review submitted successfully',
        requiresModeration: data.data?.requiresModeration || false,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Create Review API Error:', error);

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
          message: 'An unexpected error occurred while submitting review',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reviews
 * 
 * Update review or moderate review (Admin only for moderation)
 * 
 * Body:
 * {
 *   reviewId: string,
 *   // For user updates:
 *   title?: string,
 *   comment?: string,
 *   rating?: number,
 *   pros?: string[],
 *   cons?: string[],
 *   // For admin moderation:
 *   status?: 'approved' | 'rejected',
 *   moderationNote?: string
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to update review',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.reviewId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Review ID is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews/${body.reviewId}`;
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'REVIEW_NOT_FOUND',
              message: 'Review not found',
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
              message: 'You do not have permission to update this review',
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
            message: errorData.message || 'Failed to update review',
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
          review: data.data?.review || data.review,
          message: 'Review updated successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update Review API Error:', error);

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
          message: 'An unexpected error occurred while updating review',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews
 * 
 * Delete a review (User can delete own review, Admin can delete any)
 * 
 * Query Parameters:
 * - reviewId: Review ID to delete
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Review ID is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to delete review',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews/${reviewId}`;
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'REVIEW_NOT_FOUND',
              message: 'Review not found',
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
              message: 'You do not have permission to delete this review',
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
            message: errorData.message || 'Failed to delete review',
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
          message: 'Review deleted successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Review API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while deleting review',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
