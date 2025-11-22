/**
 * Contact API Route
 * 
 * Handles contact form submissions with validation and email notifications.
 * Supports general inquiries, support requests, business inquiries, and feedback.
 * Integrates with backend API and email service.
 * 
 * @module api/contact
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

// Validation schemas
const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number')
    .optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  category: z.enum(['general', 'support', 'business', 'feedback', 'complaint', 'other']).default('general'),
  department: z.enum(['sales', 'support', 'billing', 'technical', 'general']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  orderId: z.string().uuid().optional(),
  attachments: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
      size: z.number().positive(),
      type: z.string(),
    })
  ).max(5).optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to privacy policy',
  }),
  newsletter: z.boolean().default(false),
  metadata: z.object({
    source: z.string().optional(),
    referrer: z.string().optional(),
    userAgent: z.string().optional(),
    pageUrl: z.string().optional(),
  }).optional(),
});

const ContactQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.enum(['general', 'support', 'business', 'feedback', 'complaint', 'other']).optional(),
  status: z.enum(['pending', 'in-progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  sortBy: z.enum(['createdAt', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Types
interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: 'general' | 'support' | 'business' | 'feedback' | 'complaint' | 'other';
  department?: 'sales' | 'support' | 'billing' | 'technical' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  orderId?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  response?: {
    message: string;
    respondedBy: string;
    respondedAt: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  metadata: {
    source?: string;
    referrer?: string;
    userAgent?: string;
    pageUrl?: string;
    ipAddress?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface ContactResponse {
  success: boolean;
  data: {
    submission: ContactSubmission;
    ticket: {
      id: string;
      number: string;
      estimatedResponse: string;
    };
    message: string;
  };
  timestamp: string;
}

interface ContactListResponse {
  success: boolean;
  data: {
    submissions: ContactSubmission[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    statistics: {
      total: number;
      pending: number;
      inProgress: number;
      resolved: number;
      closed: number;
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
 * POST /api/contact
 * 
 * Submits a contact form
 * 
 * Request Body:
 * - name: Full name (required, 2-100 characters)
 * - email: Email address (required, valid email)
 * - phone: Phone number (optional, valid format)
 * - subject: Message subject (required, 5-200 characters)
 * - message: Message content (required, 10-2000 characters)
 * - category: Inquiry category (default: general)
 * - department: Target department (optional)
 * - priority: Urgency level (default: medium)
 * - orderId: Related order ID (optional)
 * - attachments: File attachments (optional, max 5)
 * - consent: Privacy policy agreement (required)
 * - newsletter: Newsletter subscription (default: false)
 * - metadata: Additional context (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = ContactFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid contact form data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const formData = validationResult.data;

    // Get session information
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('contact_session_id')?.value;

    // Get authentication token if exists
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || cookieStore.get('access_token')?.value;

    // Collect metadata
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const referer = request.headers.get('referer') || '';

    const metadata = {
      ...formData.metadata,
      userAgent,
      ipAddress,
      referrer: referer,
      sessionId,
    };

    // Validate attachments size
    if (formData.attachments && formData.attachments.length > 0) {
      const totalSize = formData.attachments.reduce((sum, file) => sum + file.size, 0);
      const maxSize = 10 * 1024 * 1024; // 10MB total

      if (totalSize > maxSize) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'FILE_SIZE_EXCEEDED',
              message: 'Total attachments size exceeds 10MB limit',
              details: { totalSize, maxSize },
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }

    // Build backend request
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/contact`;
    
    const backendRequestBody = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      category: formData.category,
      department: formData.department,
      priority: formData.priority,
      orderId: formData.orderId,
      attachments: formData.attachments,
      newsletter: formData.newsletter,
      metadata,
    };

    // Make request to backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(backendRequestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error cases
      if (response.status === 429) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many contact form submissions. Please try again later.',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 429 }
        );
      }

      if (response.status === 400 && errorData.code === 'SPAM_DETECTED') {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'SPAM_DETECTED',
              message: 'Your submission was flagged as spam. Please try again or contact us directly.',
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
            message: errorData.message || 'Failed to submit contact form',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Prepare response
    const responseData: ContactResponse = {
      success: true,
      data: {
        submission: data.data?.submission || data.submission,
        ticket: data.data?.ticket || data.ticket || {
          id: data.data?.submission?.id || data.submission?.id,
          number: `TKT-${Date.now()}`,
          estimatedResponse: '24-48 hours',
        },
        message: 'Your message has been received successfully. We will get back to you soon.',
      },
      timestamp: new Date().toISOString(),
    };

    // Set contact session cookie if new submission
    const contactResponse = NextResponse.json(responseData, { status: 201 });

    if (!sessionId) {
      const newSessionId = `contact_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      contactResponse.cookies.set('contact_session_id', newSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    return contactResponse;
  } catch (error) {
    console.error('Contact Form API Error:', error);

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
          message: 'An unexpected error occurred while submitting contact form',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contact
 * 
 * Retrieves contact form submissions (Admin only)
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - category: Filter by category
 * - status: Filter by status
 * - priority: Filter by priority
 * - sortBy: Sort field (createdAt, priority, status)
 * - sortOrder: Sort direction (asc, desc)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication (Admin only)
    const authHeader = request.headers.get('Authorization');
    const cookieStore = await cookies();
    const accessToken = authHeader?.replace('Bearer ', '') || cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to view contact submissions',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = ContactQuerySchema.safeParse(params);

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
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/contact`
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
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store', // Don't cache contact submissions
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 403) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to view contact submissions',
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
            message: errorData.message || 'Failed to fetch contact submissions',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: ContactListResponse = {
      success: true,
      data: {
        submissions: data.data?.submissions || data.submissions || [],
        pagination: data.data?.pagination || data.pagination || {
          page: queryParams.page,
          limit: queryParams.limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        statistics: data.data?.statistics || data.statistics || {
          total: 0,
          pending: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Contact List API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching contact submissions',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
