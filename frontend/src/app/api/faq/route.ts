/**
 * FAQ API Route
 * 
 * Handles frequently asked questions with search and categorization.
 * Supports question voting, helpful tracking, and dynamic ordering.
 * Includes search functionality with relevance scoring.
 * 
 * @module api/faq
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const FAQQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
  featured: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'helpful', 'order', 'views', 'relevance']).default('order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

const FAQVoteSchema = z.object({
  faqId: z.string().uuid(),
  helpful: z.boolean(),
});

// Types
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  };
  tags: string[];
  order: number;
  featured: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  helpfulPercentage: number;
  views: number;
  relatedQuestions: Array<{
    id: string;
    question: string;
  }>;
  relatedProducts: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  metadata: {
    lastUpdated: string;
    author: string;
    version: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  order: number;
  questionsCount: number;
}

interface FAQResponse {
  success: boolean;
  data: {
    faqs: FAQItem[];
    categories: FAQCategory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    featured?: FAQItem[];
  };
  timestamp: string;
}

interface FAQVoteResponse {
  success: boolean;
  data: {
    faq: FAQItem;
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
 * GET /api/faq
 * 
 * Retrieves FAQ items with optional filtering and search
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - search: Search query for questions and answers
 * - category: Filter by category slug
 * - tags: Comma-separated tags to filter by
 * - featured: Show only featured FAQs
 * - sortBy: Sort field (createdAt, helpful, order, views, relevance)
 * - sortOrder: Sort direction (asc, desc)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = FAQQuerySchema.safeParse(params);

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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/faq`
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
        tags: ['faq', queryParams.category ? `faq-${queryParams.category}` : 'faq-all'],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch FAQ items',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: FAQResponse = {
      success: true,
      data: {
        faqs: data.data?.faqs || data.faqs || [],
        categories: data.data?.categories || data.categories || [],
        pagination: data.data?.pagination || data.pagination || {
          page: queryParams.page,
          limit: queryParams.limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        featured: data.data?.featured || data.featured,
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
    console.error('FAQ API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching FAQ items',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/faq
 * 
 * Handles FAQ voting and creation
 * 
 * For voting, send: { action: 'vote', faqId, helpful }
 * For creation (Admin only), send FAQ data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a vote request
    if (body.action === 'vote') {
      return handleVote(request, body);
    }

    // Otherwise, treat as FAQ creation (Admin only)
    return createFAQ(request, body);
  } catch (error) {
    console.error('FAQ POST API Error:', error);

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
 * Handles helpful/not helpful voting on FAQ items
 */
async function handleVote(request: NextRequest, body: unknown) {
  // Validate request body
  const validationResult = FAQVoteSchema.safeParse(body);

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

  const { faqId, helpful } = validationResult.data;

  // Build backend request
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/faq/vote`;
  
  const response = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ faqId, helpful }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 404) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'FAQ_NOT_FOUND',
            message: 'FAQ item not found',
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
          message: errorData.message || 'Failed to record vote',
          details: errorData,
        },
        timestamp: new Date().toISOString(),
      },
      { status: response.status }
    );
  }

  const data = await response.json();

  const responseData: FAQVoteResponse = {
    success: true,
    data: {
      faq: data.data?.faq || data.faq,
      message: 'Thank you for your feedback!',
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(responseData, { status: 200 });
}

/**
 * Creates a new FAQ item (Admin only)
 */
async function createFAQ(request: NextRequest, body: unknown) {
  // Check authentication (Admin only)
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required to create FAQ items',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  // Make request to backend
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/faq`;
  
  const response = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 403) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to create FAQ items',
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
          message: errorData.message || 'Failed to create FAQ item',
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
        faq: data.data?.faq || data.faq,
        message: 'FAQ item created successfully',
      },
      timestamp: new Date().toISOString(),
    },
    { status: 201 }
  );
}

