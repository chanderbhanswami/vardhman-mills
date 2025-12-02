/**
 * OTP Verification API Route
 * 
 * Handles OTP verification with rate limiting, expiry validation,
 * attempt tracking, and multi-purpose OTP support.
 * 
 * @module api/auth/verify-otp
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const VerifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits'),
  purpose: z.enum(['email_verification', 'password_reset', 'login', '2fa', 'phone_verification']).default('email_verification'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
});

const ResendOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  purpose: z.enum(['email_verification', 'password_reset', 'login', '2fa', 'phone_verification']).default('email_verification'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  method: z.enum(['email', 'sms']).default('email'),
});

// Types
interface VerifyOTPRequest {
  email: string;
  otp: string;
  purpose: 'email_verification' | 'password_reset' | 'login' | '2fa' | 'phone_verification';
  phone?: string;
}

interface VerifyOTPResponse {
  success: boolean;
  data: {
    message: string;
    verified: boolean;
    purpose: string;
    email: string;
    token?: string;
    refreshToken?: string;
    user?: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      phoneVerified?: boolean;
      twoFactorEnabled?: boolean;
    };
    nextStep?: string;
    requiresAdditionalVerification?: boolean;
  };
  timestamp: string;
}

interface ResendOTPResponse {
  success: boolean;
  data: {
    message: string;
    email: string;
    purpose: string;
    method: 'email' | 'sms';
    sent: boolean;
    expiresIn: number;
    retryAfter?: number;
    attemptsRemaining?: number;
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
 * POST /api/auth/verify-otp
 * 
 * Verify OTP code
 * 
 * Body:
 * {
 *   email: string,
 *   otp: string,
 *   purpose?: string,
 *   phone?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a resend request
    if (body.resend === true || body.action === 'resend') {
      return handleResendOTP(request, body);
    }

    // Validate request body
    const validationResult = VerifyOTPSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid OTP verification data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { email, otp, purpose, phone } = validationResult.data;

    // Check rate limiting (max 5 attempts per 15 minutes)
    const cookieStore = await cookies();
    const rateLimitKey = `otp_attempts_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${purpose}`;
    const attemptCount = parseInt(cookieStore.get(rateLimitKey)?.value || '0', 10);

    if (attemptCount >= 5) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'TOO_MANY_ATTEMPTS',
            message: 'Too many failed attempts. Please request a new OTP.',
            details: {
              maxAttempts: 5,
              currentAttempts: attemptCount,
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 429 }
      );
    }

    // Prepare verification data
    const verificationData: VerifyOTPRequest = {
      email,
      otp,
      purpose,
      ...(phone && { phone }),
    };

    // Add metadata
    const metadata = {
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                 request.headers.get('x-real-ip') ||
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      attemptNumber: attemptCount + 1,
      timestamp: new Date().toISOString(),
    };

    // Build backend URL
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/verify-otp`;

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
      // Increment attempt counter
      const responseCookies = await cookies();
      responseCookies.set(rateLimitKey, (attemptCount + 1).toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      });

      // Handle specific error codes
      if (response.status === 400) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'INVALID_OTP',
              message: data.message || 'Invalid or expired OTP code',
              details: {
                ...data,
                attemptsRemaining: Math.max(0, 5 - (attemptCount + 1)),
              },
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
              code: 'OTP_NOT_FOUND',
              message: 'No OTP found for this email. Please request a new one.',
              details: data,
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
              code: 'OTP_EXPIRED',
              message: 'OTP has expired. Please request a new one.',
              details: data,
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
            message: data.message || 'Failed to verify OTP',
            details: data,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const responseData = data.data || data;

    // Clear attempt counter on success
    const successCookies = await cookies();
    successCookies.delete(rateLimitKey);

    // Set authentication tokens if provided
    if (responseData.token) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      };

      successCookies.set('auth_token', responseData.token, cookieOptions);

      if (responseData.refreshToken) {
        successCookies.set('refresh_token', responseData.refreshToken, {
          ...cookieOptions,
          maxAge: 90 * 24 * 60 * 60, // 90 days
        });
      }
    }

    const finalResponse: VerifyOTPResponse = {
      success: true,
      data: {
        message: responseData.message || 'OTP verified successfully!',
        verified: true,
        purpose,
        email,
        ...(responseData.token && { token: responseData.token }),
        ...(responseData.refreshToken && { refreshToken: responseData.refreshToken }),
        ...(responseData.user && {
          user: {
            id: responseData.user.id,
            name: responseData.user.name,
            email: responseData.user.email,
            emailVerified: responseData.user.emailVerified || true,
            ...(responseData.user.phoneVerified !== undefined && { phoneVerified: responseData.user.phoneVerified }),
            ...(responseData.user.twoFactorEnabled !== undefined && { twoFactorEnabled: responseData.user.twoFactorEnabled }),
          },
        }),
        ...(responseData.nextStep && { nextStep: responseData.nextStep }),
        ...(responseData.requiresAdditionalVerification !== undefined && {
          requiresAdditionalVerification: responseData.requiresAdditionalVerification,
        }),
      },
      timestamp: new Date().toISOString(),
    };

    // Track OTP verification event (fire and forget)
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/analytics/auth/otp-verified`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: responseData.user?.id,
          email,
          purpose,
          attempts: attemptCount + 1,
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
    console.error('Verify OTP API Error:', error);

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
          message: 'An unexpected error occurred while verifying OTP',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Handle resend OTP request
 */
async function handleResendOTP(request: NextRequest, body: unknown): Promise<NextResponse> {
  try {
    // Validate request body
    const validationResult = ResendOTPSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid resend OTP data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { email, purpose, phone, method } = validationResult.data;

    // Check rate limiting for resend (1 request per 2 minutes)
    const cookieStore = await cookies();
    const rateLimitKey = `resend_otp_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${purpose}`;
    const lastResend = cookieStore.get(rateLimitKey)?.value;

    if (lastResend) {
      const lastResendTime = parseInt(lastResend, 10);
      const timeSinceLastResend = Date.now() - lastResendTime;
      const rateLimitWindow = 2 * 60 * 1000; // 2 minutes

      if (timeSinceLastResend < rateLimitWindow) {
        const retryAfter = Math.ceil((rateLimitWindow - timeSinceLastResend) / 1000);

        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: `Please wait ${retryAfter} seconds before requesting another OTP.`,
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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/resend-otp`;

    // Send request to backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        purpose,
        ...(phone && { phone }),
        method,
        metadata,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
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

      if (response.status === 429) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: data.message || 'Too many OTP requests. Please try again later.',
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
            message: data.message || 'Failed to resend OTP',
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

    // Reset attempt counter
    const attemptKey = `otp_attempts_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${purpose}`;
    responseCookies.delete(attemptKey);

    const finalResponse: ResendOTPResponse = {
      success: true,
      data: {
        message: responseData.message || `OTP has been sent to your ${method}.`,
        email,
        purpose,
        method,
        sent: true,
        expiresIn: responseData.expiresIn || 300,
        ...(responseData.retryAfter && { retryAfter: responseData.retryAfter }),
        ...(responseData.attemptsRemaining !== undefined && { attemptsRemaining: responseData.attemptsRemaining }),
      },
      timestamp: new Date().toISOString(),
    };

    // Track OTP resend event (fire and forget)
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/analytics/auth/otp-resent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          purpose,
          method,
          ...metadata,
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
    console.error('Resend OTP Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while resending OTP',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/verify-otp
 * 
 * Check OTP status and remaining attempts
 * 
 * Query Parameters:
 * - email: User email
 * - purpose: OTP purpose
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const purpose = searchParams.get('purpose') || 'email_verification';

    if (!email) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'MISSING_EMAIL',
            message: 'Email parameter is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Get attempt count from cookies
    const cookieStore = await cookies();
    const rateLimitKey = `otp_attempts_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${purpose}`;
    const attemptCount = parseInt(cookieStore.get(rateLimitKey)?.value || '0', 10);

    // Check resend rate limit
    const resendKey = `resend_otp_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${purpose}`;
    const lastResend = cookieStore.get(resendKey)?.value;

    let canResend = true;
    let retryAfter = 0;

    if (lastResend) {
      const lastResendTime = parseInt(lastResend, 10);
      const timeSinceLastResend = Date.now() - lastResendTime;
      const rateLimitWindow = 2 * 60 * 1000; // 2 minutes

      if (timeSinceLastResend < rateLimitWindow) {
        canResend = false;
        retryAfter = Math.ceil((rateLimitWindow - timeSinceLastResend) / 1000);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          email,
          purpose,
          attemptsUsed: attemptCount,
          attemptsRemaining: Math.max(0, 5 - attemptCount),
          maxAttempts: 5,
          locked: attemptCount >= 5,
          canResend,
          ...(retryAfter > 0 && { retryAfter }),
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
    console.error('Get OTP Status Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while checking OTP status',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

