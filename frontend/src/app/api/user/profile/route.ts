/**
 * User Profile API Route
 * 
 * Manages user profile information:
 * - Personal information (name, email, phone, DOB, gender)
 * - Account settings
 * - Profile picture/avatar
 * - Biography and social links
 * - Account verification
 * - Account deletion (GDPR compliance)
 * 
 * @module api/user/profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(20).optional(),
  alternatePhone: z.string().min(10).max(20).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  socialLinks: z.object({
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional(),
    instagram: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    pinterest: z.string().url().optional(),
  }).optional(),
  company: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  location: z.object({
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
  }).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const changeEmailSchema = z.object({
  newEmail: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password is required for verification'),
});

const verifyAccountSchema = z.object({
  type: z.enum(['email', 'phone']),
  code: z.string().min(4).max(10),
});

const deleteAccountSchema = z.object({
  password: z.string().min(8, 'Password is required for account deletion'),
  reason: z.enum([
    'not-using',
    'privacy-concerns',
    'found-alternative',
    'too-expensive',
    'poor-customer-service',
    'technical-issues',
    'other',
  ]).optional(),
  feedback: z.string().max(1000).optional(),
  confirm: z.literal(true).refine((val) => val === true, {
    message: 'You must confirm account deletion',
  }),
});

// Types
interface UserProfile {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  phone?: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  avatar?: {
    url: string;
    thumbnailUrl: string;
  };
  bio?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    pinterest?: string;
  };
  company?: string;
  jobTitle?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  accountStatus: 'active' | 'suspended' | 'pending-verification' | 'deactivated';
  accountType: 'customer' | 'vendor' | 'admin';
  loyaltyPoints: number;
  memberSince: string;
  lastLogin: string;
  lastActive: string;
  statistics: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    reviewsCount: number;
    wishlistCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProfileResponse {
  success: boolean;
  data: {
    profile: UserProfile;
    message?: string;
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
 * GET /api/user/profile
 * 
 * Get user profile information
 * 
 * Query Parameters:
 * - includeStatistics: Include order statistics (default: true)
 * - includeAddresses: Include saved addresses (default: false)
 * - includePaymentMethods: Include saved payment methods (default: false)
 */
export async function GET(request: NextRequest) {
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
            message: 'Authentication required to view profile',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const includeStatistics = searchParams.get('includeStatistics') !== 'false';
    const includeAddresses = searchParams.get('includeAddresses') === 'true';
    const includePaymentMethods = searchParams.get('includePaymentMethods') === 'true';

    // Build query string
    const queryParams = new URLSearchParams();
    if (includeStatistics) queryParams.append('includeStatistics', 'true');
    if (includeAddresses) queryParams.append('includeAddresses', 'true');
    if (includePaymentMethods) queryParams.append('includePaymentMethods', 'true');

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/user/profile${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
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
              code: 'PROFILE_NOT_FOUND',
              message: 'User profile not found',
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
            code: 'FETCH_FAILED',
            message: errorData.message || 'Failed to fetch profile',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: ProfileResponse = {
      success: true,
      data: {
        profile: data.data?.profile || data.profile,
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
    console.error('Get Profile API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching profile',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * 
 * Update user profile (partial update)
 * 
 * Body: Partial profile object (see updateProfileSchema)
 */
export async function PATCH(request: NextRequest) {
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
            message: 'Authentication required to update profile',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Check for special operations
    if (body.changePassword) {
      // Change password operation
      let validatedData;
      try {
        validatedData = changePasswordSchema.parse(body.changePassword);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json<ErrorResponse>(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid password data',
                details: error.issues,
              },
              timestamp: new Date().toISOString(),
            },
            { status: 400 }
          );
        }
        throw error;
      }

      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/user/profile/password`;
      
      const response = await fetch(backendUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          return NextResponse.json<ErrorResponse>(
            {
              success: false,
              error: {
                code: 'INVALID_PASSWORD',
                message: 'Current password is incorrect',
                details: errorData,
              },
              timestamp: new Date().toISOString(),
            },
            { status: 401 }
          );
        }

        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'PASSWORD_CHANGE_FAILED',
              message: errorData.message || 'Failed to change password',
              details: errorData,
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
            message: 'Password changed successfully',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    if (body.changeEmail) {
      // Change email operation
      let validatedData;
      try {
        validatedData = changeEmailSchema.parse(body.changeEmail);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json<ErrorResponse>(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid email data',
                details: error.issues,
              },
              timestamp: new Date().toISOString(),
            },
            { status: 400 }
          );
        }
        throw error;
      }

      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/user/profile/email`;
      
      const response = await fetch(backendUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 409) {
          return NextResponse.json<ErrorResponse>(
            {
              success: false,
              error: {
                code: 'EMAIL_ALREADY_EXISTS',
                message: 'Email address is already in use',
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
              code: 'EMAIL_CHANGE_FAILED',
              message: errorData.message || 'Failed to change email',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: response.status }
        );
      }

      const emailData = await response.json();

      // Log email change for analytics
      console.log('Email change initiated:', {
        oldEmail: emailData.data?.oldEmail,
        newEmail: validatedData.newEmail,
        verificationSent: emailData.data?.verificationSent,
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            message: 'Verification email sent to new address. Please verify to complete the change.',
            verificationRequired: true,
            newEmail: validatedData.newEmail,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Regular profile update
    let validatedData;
    try {
      validatedData = updateProfileSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid profile data',
              details: error.issues,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/user/profile`;
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'CONFLICT',
              message: 'Email or phone number is already in use',
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
            code: 'UPDATE_FAILED',
            message: errorData.message || 'Failed to update profile',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: ProfileResponse = {
      success: true,
      data: {
        profile: data.data?.profile || data.profile,
        message: 'Profile updated successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Update Profile API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while updating profile',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/profile
 * 
 * Verify account (email or phone) or resend verification
 * 
 * Body:
 * - type: 'email' | 'phone' (required)
 * - code: Verification code (required for verification)
 * - resend: Boolean (for resending verification code)
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
            message: 'Authentication required to verify account',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Check if resending verification
    if (body.resend) {
      const { type } = body;

      if (!type || !['email', 'phone'].includes(type)) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Valid type (email or phone) is required',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/user/profile/verify/resend`;
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'RESEND_FAILED',
              message: errorData.message || 'Failed to resend verification code',
              details: errorData,
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
            message: `Verification code sent to your ${type}`,
            type,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Verify account
    let validatedData;
    try {
      validatedData = verifyAccountSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid verification data',
              details: error.issues,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/user/profile/verify`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 400) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'INVALID_CODE',
              message: 'Invalid or expired verification code',
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
            code: 'VERIFICATION_FAILED',
            message: errorData.message || 'Failed to verify account',
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
          verified: true,
          type: validatedData.type,
          message: `${validatedData.type === 'email' ? 'Email' : 'Phone'} verified successfully`,
          profile: data.data?.profile || data.profile,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify Account API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while verifying account',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/profile
 * 
 * Delete user account (GDPR compliance)
 * 
 * Body:
 * - password: User password (required for verification)
 * - reason: Deletion reason (optional)
 * - feedback: User feedback (optional)
 * - confirm: Confirmation flag (required, must be true)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const deleteCookieStore = await cookies();
    const authToken = deleteCookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to delete account',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    let validatedData;
    try {
      validatedData = deleteAccountSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid account deletion data',
              details: error.issues,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/user/profile`;
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'INVALID_PASSWORD',
              message: 'Password is incorrect',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 401 }
        );
      }

      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'PENDING_ORDERS',
              message: 'Cannot delete account with pending orders. Please wait for orders to complete or contact support.',
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
            code: 'DELETE_FAILED',
            message: errorData.message || 'Failed to delete account',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    // Clear authentication cookies
    const deleteResponseCookies = await cookies();
    deleteResponseCookies.delete('auth_token');
    deleteResponseCookies.delete('refresh_token');
    deleteResponseCookies.delete('user_id');

    return NextResponse.json(
      {
        success: true,
        data: {
          deleted: true,
          message: 'Account deleted successfully. We\'re sorry to see you go.',
          deletedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Account API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while deleting account',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

