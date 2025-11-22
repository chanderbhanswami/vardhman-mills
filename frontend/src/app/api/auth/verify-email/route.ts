/**
 * Email Verification API Route
 * 
 * Handles email verification with token validation, expiry checking,
 * account activation, and confirmation emails.
 * 
 * @module api/auth/verify-email
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  email: z.string().email('Invalid email address').optional(),
});

const ResendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Types
interface VerifyEmailRequest {
  token: string;
  email?: string;
}

interface VerifyEmailResponse {
  success: boolean;
  data: {
    message: string;
    email: string;
    verified: boolean;
    accountActivated: boolean;
    user?: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
    };
    token?: string;
    autoLogin?: boolean;
  };
  timestamp: string;
}

interface ResendVerificationResponse {
  success: boolean;
  data: {
    message: string;
    email: string;
    sent: boolean;
    expiresIn: number;
    retryAfter?: number;
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
 * POST /api/auth/verify-email
 * 
 * Verify user email with token
 * 
 * Body:
 * {
 *   token: string,
 *   email?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a resend request
    if (body.resend === true || body.action === 'resend') {
      return handleResendVerification(request, body);
    }

    // Validate request body
    const validationResult = VerifyEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid verification data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { token, email } = validationResult.data;

    // Prepare verification data
    const verificationData: VerifyEmailRequest = {
      token,
      ...(email && { email }),
    };

    // Add metadata
    const metadata = {
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                 request.headers.get('x-real-ip') ||
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
    };

    // Build backend URL
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/verify-email`;

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Send verification request to backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...verificationData,
        metadata,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 400) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: data.message || 'Invalid or expired verification token',
              details: data,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User account not found',
              details: data,
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
              code: 'ALREADY_VERIFIED',
              message: 'Email address is already verified',
              details: data,
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
            message: data.message || 'Failed to verify email',
            details: data,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const responseData = data.data || data;

    // Set authentication token if auto-login is enabled
    if (responseData.token) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      };

      const cookieStore = await cookies();
      cookieStore.set('auth_token', responseData.token, cookieOptions);

      if (responseData.refreshToken) {
        cookieStore.set('refresh_token', responseData.refreshToken, {
          ...cookieOptions,
          maxAge: 90 * 24 * 60 * 60, // 90 days
        });
      }
    }

    const finalResponse: VerifyEmailResponse = {
      success: true,
      data: {
        message: responseData.message || 'Email verified successfully!',
        email: responseData.email || email || 'your email',
        verified: true,
        accountActivated: responseData.accountActivated !== false,
        ...(responseData.user && {
          user: {
            id: responseData.user.id,
            name: responseData.user.name,
            email: responseData.user.email,
            emailVerified: true,
          },
        }),
        ...(responseData.token && { token: responseData.token }),
        autoLogin: Boolean(responseData.token),
      },
      timestamp: new Date().toISOString(),
    };

    // Track email verification event (fire and forget)
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/analytics/auth/email-verified`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: responseData.user?.id,
          email: finalResponse.data.email,
          ...metadata,
        }),
      }
    ).catch(() => {
      // Silent fail for analytics
    });

    // Send welcome/confirmation email
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/email/email-verified`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: finalResponse.data.email,
          name: responseData.user?.name,
          userId: responseData.user?.id,
        }),
      }
    ).catch(() => {
      // Silent fail for email
    });

    return NextResponse.json(finalResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Verify Email API Error:', error);

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
          message: 'An unexpected error occurred while verifying email',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Handle resend verification email request
 */
async function handleResendVerification(request: NextRequest, body: unknown): Promise<NextResponse> {
  try {
    // Validate request body
    const validationResult = ResendVerificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email address',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Check rate limiting
    const cookieStore = await cookies();
    const rateLimitKey = `resend_verification_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const lastAttempt = cookieStore.get(rateLimitKey)?.value;

    if (lastAttempt) {
      const lastAttemptTime = parseInt(lastAttempt, 10);
      const timeSinceLastAttempt = Date.now() - lastAttemptTime;
      const rateLimitWindow = 2 * 60 * 1000; // 2 minutes

      if (timeSinceLastAttempt < rateLimitWindow) {
        const retryAfter = Math.ceil((rateLimitWindow - timeSinceLastAttempt) / 1000);

        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: `Please wait ${retryAfter} seconds before requesting another verification email.`,
              details: {
                retryAfter,
              },
            },
            timestamp: new Date().toISOString(),
          },
          { status: 429 }
        );
      }
    }

    // Add metadata
    const metadata = {
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                 request.headers.get('x-real-ip') ||
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
    };

    // Build backend URL
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/resend-verification`;

    // Send request to backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        metadata,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        // For security, return success even if email not found
        return NextResponse.json<ResendVerificationResponse>(
          {
            success: true,
            data: {
              message: 'If an unverified account exists, a verification email has been sent.',
              email,
              sent: true,
              expiresIn: 3600,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      }

      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'ALREADY_VERIFIED',
              message: 'Email address is already verified',
              details: data,
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
            message: data.message || 'Failed to resend verification email',
            details: data,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const responseData = data.data || data;

    // Set rate limiting cookie
    const responseCookies = await cookies();
    responseCookies.set(rateLimitKey, Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60, // 2 minutes
      path: '/',
    });

    const finalResponse: ResendVerificationResponse = {
      success: true,
      data: {
        message: responseData.message || 'Verification email has been sent. Please check your inbox.',
        email,
        sent: true,
        expiresIn: responseData.expiresIn || 3600,
        ...(responseData.retryAfter && { retryAfter: responseData.retryAfter }),
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(finalResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Resend Verification Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while resending verification email',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/verify-email
 * 
 * Validate verification token (optional, for checking before verification)
 * 
 * Query Parameters:
 * - token: Verification token to validate
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'Verification token is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/validate-verification-token`
    );
    backendUrl.searchParams.append('token', token);

    // Send request to backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: {
        revalidate: 0, // Don't cache token validation
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: data.code || 'INVALID_TOKEN',
            message: data.message || 'Invalid or expired verification token',
            details: data,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const responseData = data.data || data;

    return NextResponse.json(
      {
        success: true,
        data: {
          valid: responseData.valid !== false,
          email: responseData.email || 'unknown',
          expiresAt: responseData.expiresAt,
          expired: responseData.expired || false,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Validate Verification Token Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while validating token',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
