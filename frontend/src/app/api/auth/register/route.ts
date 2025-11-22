/**
 * User Registration API Route
 * 
 * Handles user registration with validation, email verification,
 * duplicate checking, password hashing, and welcome email.
 * 
 * @module api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  marketingConsent: z.boolean().optional(),
  referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const CheckEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Types
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
  referralCode?: string;
}

interface RegisterResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      emailVerified: boolean;
      phone?: string;
    };
    token?: string;
    refreshToken?: string;
    requiresVerification: boolean;
    verificationSent: boolean;
    message: string;
  };
  timestamp: string;
}

interface CheckEmailResponse {
  success: boolean;
  data: {
    available: boolean;
    email: string;
    suggestions?: string[];
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
 * POST /api/auth/register
 * 
 * Register a new user account
 * 
 * Body:
 * {
 *   name: string,
 *   email: string,
 *   password: string,
 *   confirmPassword: string,
 *   phone?: string,
 *   acceptTerms: boolean,
 *   marketingConsent?: boolean,
 *   referralCode?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = RegisterSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid registration data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { name, email, password, phone, acceptTerms, marketingConsent, referralCode } = validationResult.data;

    // Get guest ID if exists (for cart migration)
    const cookieStore = await cookies();
    const guestId = cookieStore.get('guest_id')?.value;

    // Prepare registration data
    const registerData: RegisterRequest = {
      name,
      email,
      password,
      acceptTerms,
      ...(phone && { phone }),
      ...(marketingConsent !== undefined && { marketingConsent }),
      ...(referralCode && { referralCode }),
    };

    // Add metadata
    const metadata = {
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                 request.headers.get('x-real-ip') ||
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      registrationSource: 'web',
      guestId,
      timestamp: new Date().toISOString(),
    };

    // Build backend URL
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/register`;

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Send registration request to backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...registerData,
        metadata,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'USER_EXISTS',
              message: 'An account with this email already exists',
              details: data,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 409 }
        );
      }

      if (response.status === 400) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'INVALID_DATA',
              message: data.message || 'Invalid registration data',
              details: data,
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
            message: data.message || 'Failed to register user',
            details: data,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const responseData = data.data || data;

    // Set authentication cookies if auto-login is enabled
    if (responseData.token) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      };

      const responseCookies = await cookies();
      responseCookies.set('auth_token', responseData.token, cookieOptions);

      if (responseData.refreshToken) {
        responseCookies.set('refresh_token', responseData.refreshToken, {
          ...cookieOptions,
          maxAge: 90 * 24 * 60 * 60, // 90 days
        });
      }

      // Remove guest ID cookie if exists
      if (guestId) {
        responseCookies.delete('guest_id');
      }
    }

    const finalResponse: RegisterResponse = {
      success: true,
      data: {
        user: {
          id: responseData.user?.id || responseData.id,
          name: responseData.user?.name || name,
          email: responseData.user?.email || email,
          role: responseData.user?.role || 'user',
          emailVerified: responseData.user?.emailVerified || false,
          ...(phone && { phone }),
        },
        ...(responseData.token && { token: responseData.token }),
        ...(responseData.refreshToken && { refreshToken: responseData.refreshToken }),
        requiresVerification: responseData.requiresVerification !== false,
        verificationSent: responseData.verificationSent !== false,
        message: responseData.message || 'Registration successful! Please check your email to verify your account.',
      },
      timestamp: new Date().toISOString(),
    };

    // Track registration event (fire and forget)
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/analytics/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: finalResponse.data.user.id,
          email,
          name,
          hasReferralCode: Boolean(referralCode),
          marketingConsent: marketingConsent || false,
          ...metadata,
        }),
      }
    ).catch(() => {
      // Silent fail for analytics
    });

    // Send welcome email if not already sent by backend
    if (!responseData.welcomeEmailSent) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/email/welcome`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            name,
            userId: finalResponse.data.user.id,
          }),
        }
      ).catch(() => {
        // Silent fail for email
      });
    }

    return NextResponse.json(finalResponse, {
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Registration API Error:', error);

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
          message: 'An unexpected error occurred during registration',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/register
 * 
 * Check email availability
 * 
 * Query Parameters:
 * - email: Email to check
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

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

    // Validate email format
    const validationResult = CheckEmailSchema.safeParse({ email });

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: 'Invalid email format',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/check-email`
    );
    backendUrl.searchParams.append('email', email);

    // Send request to backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: {
        revalidate: 0, // Don't cache email checks
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: data.message || 'Failed to check email availability',
            details: data,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const responseData = data.data || data;

    const finalResponse: CheckEmailResponse = {
      success: true,
      data: {
        available: responseData.available !== false,
        email,
        ...(responseData.suggestions && { suggestions: responseData.suggestions }),
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
    console.error('Check Email API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while checking email',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
