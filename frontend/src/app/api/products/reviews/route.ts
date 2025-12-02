/**
 * Product Reviews Management API Route
 * 
 * Handles comprehensive product reviews management including CRUD operations,
 * helpful votes, moderation, spam detection, and analytics.
 * 
 * @module api/products/reviews
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
  status: z.enum(['pending', 'approved', 'rejected', 'flagged', 'all']).default('approved'),
  sortBy: z.enum(['recent', 'helpful', 'rating-high', 'rating-low', 'verified', 'oldest']).default('recent'),
  includeReplies: z.coerce.boolean().default(true),
});

const CreateReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  orderId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(100),
  comment: z.string().min(10).max(2000),
  pros: z.array(z.string().max(200)).max(5).optional(),
  cons: z.array(z.string().max(200)).max(5).optional(),
  images: z.array(z.string().url()).max(5).optional(),
  videos: z.array(z.string().url()).max(2).optional(),
  recommendProduct: z.boolean().default(true),
  anonymous: z.boolean().default(false),
  variantId: z.string().optional(),
});

const UpdateReviewSchema = z.object({
  reviewId: z.string().min(1),
  title: z.string().min(3).max(100).optional(),
  comment: z.string().min(10).max(2000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  pros: z.array(z.string().max(200)).max(5).optional(),
  cons: z.array(z.string().max(200)).max(5).optional(),
  images: z.array(z.string().url()).max(5).optional(),
  videos: z.array(z.string().url()).max(2).optional(),
  recommendProduct: z.boolean().optional(),
}).refine(data => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { reviewId, ...rest } = data;
  return Object.keys(rest).length > 0;
}, 'At least one field must be provided for update');

const ModerateReviewSchema = z.object({
  reviewId: z.string().min(1),
  status: z.enum(['approved', 'rejected', 'flagged']),
  moderationNote: z.string().max(500).optional(),
  notifyUser: z.boolean().default(true),
});

const VoteReviewSchema = z.object({
  reviewId: z.string().min(1),
  voteType: z.enum(['helpful', 'not-helpful', 'remove']),
});

const ReportReviewSchema = z.object({
  reviewId: z.string().min(1),
  reason: z.enum(['spam', 'inappropriate', 'offensive', 'fake', 'other']),
  description: z.string().max(500).optional(),
});

const ReplyReviewSchema = z.object({
  reviewId: z.string().min(1),
  comment: z.string().min(3).max(1000),
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
  updatedAt: string;
}

interface ReviewProduct {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  sku: string;
}

interface ProductReview {
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
  verified: boolean;
  helpful: number;
  notHelpful: number;
  userHelpfulVote: 'helpful' | 'not-helpful' | null;
  replies: ReviewReply[];
  variantId: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationNote: string | null;
  moderatedBy: string | null;
  moderatedAt: string | null;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: ProductReview[];
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
      byStatus: {
        pending: number;
        approved: number;
        rejected: number;
        flagged: number;
      };
    };
  };
  timestamp: string;
}

interface CreateReviewResponse {
  success: boolean;
  data: {
    review: ProductReview;
    message: string;
    requiresModeration: boolean;
  };
  timestamp: string;
}

interface UpdateReviewResponse {
  success: boolean;
  data: {
    review: ProductReview;
    message: string;
    updatedFields: string[];
  };
  timestamp: string;
}

interface ModerateReviewResponse {
  success: boolean;
  data: {
    review: ProductReview;
    message: string;
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

interface ReportReviewResponse {
  success: boolean;
  data: {
    reportId: string;
    message: string;
  };
  timestamp: string;
}

interface ReplyReviewResponse {
  success: boolean;
  data: {
    reply: ReviewReply;
    message: string;
  };
  timestamp: string;
}

interface DeleteReviewResponse {
  success: boolean;
  data: {
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
 * GET /api/products/reviews
 * 
 * Get product reviews with advanced filtering and moderation support
 * 
 * Query Parameters:
 * - page, limit, productId, userId, rating, verified, hasMedia
 * - status: Filter by status (pending, approved, rejected, flagged, all)
 * - sortBy: Sort field
 * - includeReplies: Include seller/admin replies
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

    // Get authentication (optional for public, required for admin status)
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const adminToken = cookieStore.get('admin_token')?.value;

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/reviews`
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

    if (adminToken || authToken) {
      headers.Authorization = `Bearer ${adminToken || authToken}`;
    }

    // Determine cache based on status filter
    const cacheRevalidate = queryParams.status === 'pending' || queryParams.status === 'flagged' ? 60 : 300;

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      next: {
        revalidate: cacheRevalidate,
        tags: ['product-reviews', `reviews-product-${queryParams.productId}`, `reviews-status-${queryParams.status}`],
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
          byStatus: {
            pending: 0,
            approved: 0,
            rejected: 0,
            flagged: 0,
          },
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
    console.error('Get Product Reviews API Error:', error);

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
 * POST /api/products/reviews
 * 
 * Create a new product review or perform actions (vote, report, reply)
 * Action is determined by body structure
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
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Determine action type based on body structure
    if (body.voteType) {
      // Vote on review
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

      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/reviews/${voteData.reviewId}/vote`;
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ voteType: voteData.voteType }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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
          message: voteData.voteType === 'remove' ? 'Vote removed' : 'Vote recorded',
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(responseData, { status: 200 });
    } else if (body.reason && !body.productId) {
      // Report review
      const validationResult = ReportReviewSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid report data',
              details: validationResult.error.flatten(),
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      const reportData = validationResult.data;

      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/reviews/${reportData.reviewId}/report`;
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'BACKEND_ERROR',
              message: errorData.message || 'Failed to report review',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      const responseData: ReportReviewResponse = {
        success: true,
        data: {
          reportId: data.data?.reportId || data.reportId || '',
          message: 'Review reported successfully. Our team will review it shortly.',
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(responseData, { status: 201 });
    } else if (body.comment && body.reviewId && !body.productId) {
      // Reply to review
      const validationResult = ReplyReviewSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid reply data',
              details: validationResult.error.flatten(),
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      const replyData = validationResult.data;

      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/reviews/${replyData.reviewId}/reply`;
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ comment: replyData.comment }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'BACKEND_ERROR',
              message: errorData.message || 'Failed to reply to review',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      const responseData: ReplyReviewResponse = {
        success: true,
        data: {
          reply: data.data?.reply || data.reply,
          message: 'Reply added successfully',
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(responseData, { status: 201 });
    } else {
      // Create new review
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

      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/reviews`;
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
                code: 'REVIEW_EXISTS',
                message: 'You have already reviewed this product',
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
              message: errorData.message || 'Failed to create review',
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
          message: data.data?.requiresModeration 
            ? 'Review submitted and pending moderation' 
            : 'Review submitted successfully',
          requiresModeration: data.data?.requiresModeration || false,
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(responseData, { status: 201 });
    }
  } catch (error) {
    console.error('Product Reviews POST API Error:', error);

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
 * PATCH /api/products/reviews
 * 
 * Update or moderate a review
 * Action determined by body structure (status field = moderation, otherwise = update)
 */
export async function PATCH(request: NextRequest) {
  try {
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

    // Determine if this is moderation or update
    if (body.status && ['approved', 'rejected', 'flagged'].includes(body.status)) {
      // Moderate review (Admin only)
      const validationResult = ModerateReviewSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid moderation data',
              details: validationResult.error.flatten(),
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      const moderationData = validationResult.data;

      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/reviews/${moderationData.reviewId}/moderate`;
      
      const response = await fetch(backendUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken || authToken}`,
        },
        body: JSON.stringify(moderationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 403) {
          return NextResponse.json<ErrorResponse>(
            {
              success: false,
              error: {
                code: 'FORBIDDEN',
                message: 'Admin privileges required for moderation',
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
              message: errorData.message || 'Failed to moderate review',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      const responseData: ModerateReviewResponse = {
        success: true,
        data: {
          review: data.data?.review || data.review,
          message: `Review ${moderationData.status} successfully`,
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(responseData, { status: 200 });
    } else {
      // Update review (User's own review)
      const validationResult = UpdateReviewSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid update data',
              details: validationResult.error.flatten(),
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      const updateData = validationResult.data;

      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/reviews/${updateData.reviewId}`;
      
      const response = await fetch(backendUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 403) {
          return NextResponse.json<ErrorResponse>(
            {
              success: false,
              error: {
                code: 'FORBIDDEN',
                message: 'You can only update your own reviews',
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

      const responseData: UpdateReviewResponse = {
        success: true,
        data: {
          review: data.data?.review || data.review,
          message: 'Review updated successfully',
          updatedFields: Object.keys(updateData).filter(key => key !== 'reviewId'),
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(responseData, { status: 200 });
    }
  } catch (error) {
    console.error('Product Reviews PATCH API Error:', error);

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
 * DELETE /api/products/reviews
 * 
 * Delete a review (User can delete own, Admin can delete any)
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

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products/reviews/${reviewId}`;
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
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
              message: 'You can only delete your own reviews',
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

    const responseData: DeleteReviewResponse = {
      success: true,
      data: {
        message: 'Review deleted successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Delete Product Review API Error:', error);

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

