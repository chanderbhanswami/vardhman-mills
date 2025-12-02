/**
 * Forgot Password API Route
 * 
 * Handles password recovery flow with email verification, OTP generation,
 * rate limiting, and secure token handling.
 * 
 * @module api/auth/forgot-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  method: z.enum(['email', 'otp']).default('email'),
  redirectUrl: z.string().url().optional(),
});

// Types
interface ForgotPasswordRequest {
  email: string;
  method: 'email' | 'otp';
  redirectUrl?: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  data: {
    email: string;
    method: 'email' | 'otp';
    message: string;
    expiresIn: number;
    resetToken?: string;
    otpSent?: boolean;
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
 * POST /api/auth/forgot-password
 * 
 * Initiates password recovery process
 * 
 * Body:
 * {
 *   email: string,
 *   method?: 'email' | 'otp',
 *   redirectUrl?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = ForgotPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { email, method, redirectUrl } = validationResult.data;

    // Get rate limiting info from cookies
    const cookieStore = await cookies();
    const rateLimitKey = `forgot_password_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const lastAttempt = cookieStore.get(rateLimitKey)?.value;

    // Check rate limiting (1 attempt per 5 minutes)
    if (lastAttempt) {
      const lastAttemptTime = parseInt(lastAttempt, 10);
      const timeSinceLastAttempt = Date.now() - lastAttemptTime;
      const rateLimitWindow = 5 * 60 * 1000; // 5 minutes

      if (timeSinceLastAttempt < rateLimitWindow) {
        const retryAfter = Math.ceil((rateLimitWindow - timeSinceLastAttempt) / 1000);

        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: `Too many password reset attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
              details: {
                retryAfter,
                retryAfterMinutes: Math.ceil(retryAfter / 60),
              },
            },
            timestamp: new Date().toISOString(),
          },
          { status: 429 }
        );
      }
    }

    // Prepare request data
    const requestData: ForgotPasswordRequest = {
      email,
      method,
      ...(redirectUrl && { redirectUrl }),
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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/forgot-password`;

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Send request to backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...requestData,
        metadata,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 404) {
        // For security, return success even if email not found
        // This prevents email enumeration attacks
        return NextResponse.json<ForgotPasswordResponse>(
          {
            success: true,
            data: {
              email,
              method,
              message: 'If an account exists with this email, you will receive password reset instructions.',
              expiresIn: 3600,
              ...(method === 'otp' && { otpSent: true }),
            },
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: data.message || 'Too many requests. Please try again later.',
              details: data,
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
            message: data.message || 'Failed to process password reset request',
            details: data,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const responseData = data.data || data;

    // Set rate limiting cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 5 * 60, // 5 minutes
      path: '/',
    };

    const responseCookies = await cookies();
    responseCookies.set(rateLimitKey, Date.now().toString(), cookieOptions);

    const finalResponse: ForgotPasswordResponse = {
      success: true,
      data: {
        email,
        method,
        message: responseData.message || 'Password reset instructions have been sent to your email.',
        expiresIn: responseData.expiresIn || 3600,
        ...(responseData.resetToken && { resetToken: responseData.resetToken }),
        ...(method === 'otp' && { otpSent: true }),
        ...(responseData.retryAfter && { retryAfter: responseData.retryAfter }),
      },
      timestamp: new Date().toISOString(),
    };

    // Track password reset request (fire and forget)
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/analytics/auth/password-reset-request`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          method,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          timestamp: metadata.timestamp,
        }),
      }
    ).catch(() => {
      // Silent fail for analytics
    });

    return NextResponse.json(finalResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Forgot Password API Error:', error);

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
          message: 'An unexpected error occurred while processing your request',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/forgot-password
 * 
 * Verify reset token validity (optional, for checking token before showing reset form)
 * 
 * Query Parameters:
 * - token: Reset token to verify
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
            message: 'Reset token is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/verify-reset-token`
    );
    backendUrl.searchParams.append('token', token);

    // Send request to backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: data.code || 'INVALID_TOKEN',
            message: data.message || 'Invalid or expired reset token',
            details: data,
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
          valid: true,
          email: data.data?.email || data.email,
          expiresAt: data.data?.expiresAt || data.expiresAt,
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
    console.error('Verify Reset Token Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while verifying token',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

