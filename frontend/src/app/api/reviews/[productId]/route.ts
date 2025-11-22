/**
 * Product Reviews API Route
 * 
 * Handles reviews for a specific product.
 * Supports review listing, creation, and statistics for individual products.
 * 
 * @module api/reviews/[productId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const GetProductReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  verified: z.coerce.boolean().optional(),
  hasMedia: z.coerce.boolean().optional(),
  sortBy: z.enum(['recent', 'helpful', 'rating-high', 'rating-low', 'verified']).default('helpful'),
  includeReplies: z.coerce.boolean().default(true),
});

const CreateProductReviewSchema = z.object({
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
  variantId: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
});

const VoteReviewSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  voteType: z.enum(['helpful', 'not-helpful', 'remove']),
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

interface ReviewReply {
  id: string;
  userId: string;
  userName: string;
  userType: 'customer' | 'seller' | 'admin';
  userAvatar: string | null;
  comment: string;
  createdAt: string;
}

interface ProductReview {
  id: string;
  productId: string;
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
  verified: boolean;
  helpful: number;
  notHelpful: number;
  userHelpfulVote: 'helpful' | 'not-helpful' | null;
  replies: ReviewReply[];
  variantId: string | null;
  size: string | null;
  color: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

interface ProductReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  verifiedPurchases: number;
  withMedia: number;
  recommendationRate: number;
  percentages: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ProductInfo {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  sku: string;
  brand: string;
  category: string;
  averageRating: number;
  totalReviews: number;
}

interface ProductReviewsResponse {
  success: boolean;
  data: {
    product: ProductInfo;
    reviews: ProductReview[];
    statistics: ProductReviewStatistics;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    userCanReview: boolean;
    userHasReviewed: boolean;
    userPurchased: boolean;
  };
  timestamp: string;
}

interface CreateProductReviewResponse {
  success: boolean;
  data: {
    review: ProductReview;
    message: string;
    requiresModeration: boolean;
    updatedStatistics: ProductReviewStatistics;
  };
  timestamp: string;
}

interface VoteReviewResponse {
  success: boolean;
  data: {
    reviewId: string;
    helpful: number;
    notHelpful: number;
    userVote: 'helpful' | 'not-helpful' | null;
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
 * GET /api/reviews/[productId]
 * 
 * Get reviews for a specific product with statistics
 * 
 * Path Parameters:
 * - productId: Product ID
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - rating: Filter by rating (1-5)
 * - verified: Filter verified purchases only
 * - hasMedia: Filter reviews with images/videos
 * - sortBy: Sort field (recent, helpful, rating-high, rating-low, verified)
 * - includeReplies: Include seller/admin replies (default: true)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    if (!productId) {
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
    const validationResult = GetProductReviewsQuerySchema.safeParse(queryParams);

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

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews/product/${productId}`
    );

    Object.entries(query).forEach(([key, value]) => {
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
        revalidate: 300, // 5 minutes
        tags: ['reviews', `product-reviews-${productId}`, `product-${productId}`],
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
            message: errorData.message || 'Failed to fetch product reviews',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Calculate percentages for rating distribution
    const statistics = data.data?.statistics || data.statistics;
    const totalReviews = statistics?.totalReviews || 0;
    const ratingDistribution = statistics?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    const percentages = {
      1: totalReviews > 0 ? (ratingDistribution[1] / totalReviews) * 100 : 0,
      2: totalReviews > 0 ? (ratingDistribution[2] / totalReviews) * 100 : 0,
      3: totalReviews > 0 ? (ratingDistribution[3] / totalReviews) * 100 : 0,
      4: totalReviews > 0 ? (ratingDistribution[4] / totalReviews) * 100 : 0,
      5: totalReviews > 0 ? (ratingDistribution[5] / totalReviews) * 100 : 0,
    };

    const responseData: ProductReviewsResponse = {
      success: true,
      data: {
        product: data.data?.product || data.product || {
          id: productId,
          name: 'Unknown Product',
          slug: '',
          thumbnail: '',
          sku: '',
          brand: '',
          category: '',
          averageRating: 0,
          totalReviews: 0,
        },
        reviews: data.data?.reviews || data.reviews || [],
        statistics: {
          ...statistics,
          percentages,
        },
        pagination: data.data?.pagination || data.pagination || {
          page: query.page,
          limit: query.limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        userCanReview: data.data?.userCanReview ?? data.userCanReview ?? !authToken,
        userHasReviewed: data.data?.userHasReviewed ?? data.userHasReviewed ?? false,
        userPurchased: data.data?.userPurchased ?? data.userPurchased ?? false,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Get Product Reviews API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching product reviews',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews/[productId]
 * 
 * Create a review for a specific product (requires authentication)
 * 
 * Path Parameters:
 * - productId: Product ID
 * 
 * Body:
 * {
 *   orderId?: string,
 *   rating: number (1-5),
 *   title: string,
 *   comment: string,
 *   pros?: string[],
 *   cons?: string[],
 *   images?: string[],
 *   videos?: string[],
 *   recommendProduct: boolean,
 *   anonymous: boolean,
 *   variantId?: string,
 *   size?: string,
 *   color?: string
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    if (!productId) {
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
    const validationResult = CreateProductReviewSchema.safeParse(body);

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
      productId,
      metadata: {
        ipAddress: clientIp,
        userAgent,
      },
    };

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews/product/${productId}`;
    
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

    const responseData: CreateProductReviewResponse = {
      success: true,
      data: {
        review: data.data?.review || data.review,
        message: data.data?.requiresModeration 
          ? 'Review submitted and pending moderation' 
          : 'Review submitted successfully',
        requiresModeration: data.data?.requiresModeration || false,
        updatedStatistics: data.data?.updatedStatistics || data.statistics,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Create Product Review API Error:', error);

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
 * PATCH /api/reviews/[productId]
 * 
 * Vote on review (helpful/not helpful) or remove vote
 * 
 * Path Parameters:
 * - productId: Product ID
 * 
 * Body:
 * {
 *   reviewId: string,
 *   voteType: 'helpful' | 'not-helpful' | 'remove'
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    if (!productId) {
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

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to vote on reviews',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = VoteReviewSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid vote data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const voteData = validationResult.data;

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reviews/${voteData.reviewId}/vote`;
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ voteType: voteData.voteType }),
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

      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'DUPLICATE_VOTE',
              message: 'You have already voted on this review',
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
            message: errorData.message || 'Failed to vote on review',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: VoteReviewResponse = {
      success: true,
      data: {
        reviewId: voteData.reviewId,
        helpful: data.data?.helpful || 0,
        notHelpful: data.data?.notHelpful || 0,
        userVote: data.data?.userVote || null,
        message: voteData.voteType === 'remove' 
          ? 'Vote removed successfully' 
          : 'Vote recorded successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Vote Review API Error:', error);

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
          message: 'An unexpected error occurred while voting on review',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
