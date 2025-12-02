/**
 * Newsletter Subscribe API Route
 * 
 * Handles newsletter subscription with double opt-in support.
 * Includes preference management, frequency selection, and segmentation.
 * Supports welcome email automation and subscriber analytics.
 * 
 * @module api/newsletter/subscribe
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const SubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1).max(100).optional(),
  preferences: z.object({
    newArrivals: z.boolean().default(true),
    promotions: z.boolean().default(true),
    productUpdates: z.boolean().default(true),
    blog: z.boolean().default(false),
    exclusiveOffers: z.boolean().default(true),
  }).optional(),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).default('weekly'),
  categories: z.array(z.string()).optional(),
  source: z.enum(['website', 'popup', 'checkout', 'footer', 'account']).default('website'),
  referralCode: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to terms and conditions',
  }),
});

const VerifySubscriptionSchema = z.object({
  token: z.string().min(32),
});

const UpdatePreferencesSchema = z.object({
  email: z.string().email(),
  token: z.string().min(32).optional(),
  preferences: z.object({
    newArrivals: z.boolean().optional(),
    promotions: z.boolean().optional(),
    productUpdates: z.boolean().optional(),
    blog: z.boolean().optional(),
    exclusiveOffers: z.boolean().optional(),
  }),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).optional(),
  categories: z.array(z.string()).optional(),
});

// Types
interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  status: 'pending' | 'active' | 'unsubscribed' | 'bounced';
  preferences: {
    newArrivals: boolean;
    promotions: boolean;
    productUpdates: boolean;
    blog: boolean;
    exclusiveOffers: boolean;
  };
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  categories: string[];
  source: string;
  referralCode: string | null;
  verifiedAt: string | null;
  subscribedAt: string;
  lastEmailSentAt: string | null;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  openRate: number;
  clickRate: number;
  metadata: {
    ipAddress: string | null;
    userAgent: string | null;
    country: string | null;
    city: string | null;
  };
}

interface SubscribeResponse {
  success: boolean;
  data: {
    subscriber?: NewsletterSubscriber;
    message: string;
    requiresVerification: boolean;
    verificationEmailSent: boolean;
  };
  timestamp: string;
}

interface VerifyResponse {
  success: boolean;
  data: {
    subscriber: NewsletterSubscriber;
    message: string;
    welcomeEmailSent: boolean;
  };
  timestamp: string;
}

interface UpdatePreferencesResponse {
  success: boolean;
  data: {
    subscriber: NewsletterSubscriber;
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
 * POST /api/newsletter/subscribe
 * 
 * Handles newsletter subscription and preference updates
 * 
 * For new subscription:
 * {
 *   email: string,
 *   name?: string,
 *   preferences?: object,
 *   frequency?: string,
 *   categories?: string[],
 *   source?: string,
 *   referralCode?: string,
 *   agreeToTerms: boolean
 * }
 * 
 * For verification:
 * { action: 'verify', token: string }
 * 
 * For preference update:
 * { action: 'update-preferences', email: string, token?: string, preferences: object, frequency?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Route based on action
    if (body.action === 'verify') {
      return handleVerify(request, body);
    } else if (body.action === 'update-preferences') {
      return handleUpdatePreferences(request, body);
    }

    // Default to subscription
    return handleSubscribe(request, body);
  } catch (error) {
    console.error('Newsletter Subscribe API Error:', error);

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
 * Handles new subscription
 */
async function handleSubscribe(request: NextRequest, body: unknown) {
  // Validate subscription data
  const validationResult = SubscribeSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid subscription data',
          details: validationResult.error.flatten(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  const subscriptionData = validationResult.data;

  // Get user metadata
  const ipAddress = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Get or create newsletter session
  const cookieStore = await cookies();
  let newsletterSessionId = cookieStore.get('newsletter_session_id')?.value;

  if (!newsletterSessionId) {
    newsletterSessionId = `nsl_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    cookieStore.set('newsletter_session_id', newsletterSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }

  // Build backend request
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/newsletter/subscribe`;
  
  const response = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      ...subscriptionData,
      metadata: {
        ipAddress,
        userAgent,
        sessionId: newsletterSessionId,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 409) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'ALREADY_SUBSCRIBED',
            message: 'This email is already subscribed to the newsletter',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    if (response.status === 429) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many subscription attempts. Please try again later.',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 429 }
      );
    }

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'BACKEND_ERROR',
          message: errorData.message || 'Failed to subscribe to newsletter',
          details: errorData,
        },
        timestamp: new Date().toISOString(),
      },
      { status: response.status }
    );
  }

  const data = await response.json();

  const responseData: SubscribeResponse = {
    success: true,
    data: {
      subscriber: data.data?.subscriber || data.subscriber,
      message: data.data?.requiresVerification 
        ? 'Subscription successful! Please check your email to verify your subscription.'
        : 'Successfully subscribed to newsletter!',
      requiresVerification: data.data?.requiresVerification ?? true,
      verificationEmailSent: data.data?.verificationEmailSent ?? true,
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(responseData, { status: 201 });
}

/**
 * Handles subscription verification
 */
async function handleVerify(request: NextRequest, body: unknown) {
  // Validate verification data
  const validationResult = VerifySubscriptionSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid verification token',
          details: validationResult.error.flatten(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  const { token } = validationResult.data;

  // Build backend request
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/newsletter/verify`;
  
  const response = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 404) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired verification token',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    if (response.status === 410) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Verification token has expired. Please subscribe again.',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 410 }
      );
    }

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'BACKEND_ERROR',
          message: errorData.message || 'Failed to verify subscription',
          details: errorData,
        },
        timestamp: new Date().toISOString(),
      },
      { status: response.status }
    );
  }

  const data = await response.json();

  const responseData: VerifyResponse = {
    success: true,
    data: {
      subscriber: data.data?.subscriber || data.subscriber,
      message: 'Email verified successfully! Welcome to our newsletter.',
      welcomeEmailSent: data.data?.welcomeEmailSent ?? true,
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(responseData, { status: 200 });
}

/**
 * Handles preference updates
 */
async function handleUpdatePreferences(request: NextRequest, body: unknown) {
  // Validate update data
  const validationResult = UpdatePreferencesSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid preference data',
          details: validationResult.error.flatten(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  const updateData = validationResult.data;

  // Build backend request
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/newsletter/preferences`;
  
  const response = await fetch(backendUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 404) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'SUBSCRIBER_NOT_FOUND',
            message: 'Subscriber not found',
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
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired update token',
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
          message: errorData.message || 'Failed to update preferences',
          details: errorData,
        },
        timestamp: new Date().toISOString(),
      },
      { status: response.status }
    );
  }

  const data = await response.json();

  const responseData: UpdatePreferencesResponse = {
    success: true,
    data: {
      subscriber: data.data?.subscriber || data.subscriber,
      message: 'Preferences updated successfully',
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(responseData, { status: 200 });
}

/**
 * GET /api/newsletter/subscribe
 * 
 * Get subscription status by email (requires token)
 * 
 * Query parameters:
 * - email: Subscriber email
 * - token: Verification/update token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'Email and token are required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/newsletter/status`
    );
    backendUrl.searchParams.append('email', email);
    backendUrl.searchParams.append('token', token);

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'SUBSCRIBER_NOT_FOUND',
              message: 'Subscriber not found',
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
            message: errorData.message || 'Failed to get subscription status',
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
          subscriber: data.data?.subscriber || data.subscriber,
        },
        timestamp: new Date().toISOString(),
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Newsletter Status API Error:', error);

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

