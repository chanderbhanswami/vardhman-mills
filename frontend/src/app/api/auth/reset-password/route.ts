/**
 * Reset Password API Route
 * 
 * Handles password reset functionality with token validation,
 * password strength checking, and account security measures.
 * 
 * @module api/auth/reset-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  email: z.string().email('Invalid email address').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const ValidateTokenSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
});

// Types
interface ResetPasswordRequest {
  token: string;
  password: string;
  email?: string;
}

interface ResetPasswordResponse {
  success: boolean;
  data: {
    message: string;
    email: string;
    passwordChanged: boolean;
    requiresLogin: boolean;
    sessionInvalidated: boolean;
  };
  timestamp: string;
}

interface ValidateTokenResponse {
  success: boolean;
  data: {
    valid: boolean;
    email: string;
    expiresAt: string;
    expired: boolean;
    remainingTime?: number;
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
 * POST /api/auth/reset-password
 * 
 * Reset user password with token
 * 
 * Body:
 * {
 *   token: string,
 *   password: string,
 *   confirmPassword: string,
 *   email?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = ResetPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid password reset data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { token, password, email } = validationResult.data;

    // Prepare reset data
    const resetData: ResetPasswordRequest = {
      token,
      password,
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
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/reset-password`;

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Send reset password request to backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...resetData,
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
              message: data.message || 'Invalid or expired reset token',
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

      if (response.status === 422) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'WEAK_PASSWORD',
              message: data.message || 'Password does not meet security requirements',
              details: data,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 422 }
        );
      }

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: data.message || 'Failed to reset password',
            details: data,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const responseData = data.data || data;

    // Clear authentication cookies for security
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    cookieStore.delete('refresh_token');
    cookieStore.delete('admin_token');

    // Clear any password reset rate limiting
    const rateLimitKeys = ['forgot_password_', 'reset_password_'];
    for (const key of rateLimitKeys) {
      const cookieNames = (await cookies()).getAll()
        .filter((cookie) => cookie.name.startsWith(key))
        .map((cookie) => cookie.name);

      for (const name of cookieNames) {
        cookieStore.delete(name);
      }
    }

    const finalResponse: ResetPasswordResponse = {
      success: true,
      data: {
        message: responseData.message || 'Password has been reset successfully',
        email: responseData.email || email || 'your account',
        passwordChanged: true,
        requiresLogin: true,
        sessionInvalidated: true,
      },
      timestamp: new Date().toISOString(),
    };

    // Track password reset event (fire and forget)
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/analytics/auth/password-reset`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: finalResponse.data.email,
          ...metadata,
        }),
      }
    ).catch(() => {
      // Silent fail for analytics
    });

    // Send password changed confirmation email
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/email/password-changed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: finalResponse.data.email,
          timestamp: new Date().toISOString(),
          ipAddress: metadata.ipAddress,
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
    console.error('Reset Password API Error:', error);

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
          message: 'An unexpected error occurred while resetting password',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/reset-password
 * 
 * Validate reset token
 * 
 * Query Parameters:
 * - token: Reset token to validate
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

    // Validate token format
    const validationResult = ValidateTokenSchema.safeParse({ token });

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN_FORMAT',
            message: 'Invalid token format',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/validate-reset-token`
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
            message: data.message || 'Invalid or expired reset token',
            details: data,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const responseData = data.data || data;

    // Calculate remaining time
    let remainingTime: number | undefined;
    if (responseData.expiresAt) {
      const expiresAt = new Date(responseData.expiresAt).getTime();
      const now = Date.now();
      remainingTime = Math.max(0, Math.floor((expiresAt - now) / 1000));
    }

    const finalResponse: ValidateTokenResponse = {
      success: true,
      data: {
        valid: responseData.valid !== false,
        email: responseData.email || 'unknown',
        expiresAt: responseData.expiresAt || new Date(Date.now() + 3600000).toISOString(),
        expired: responseData.expired || false,
        ...(remainingTime !== undefined && { remainingTime }),
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
    console.error('Validate Reset Token Error:', error);

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
