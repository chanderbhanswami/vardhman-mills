/**
 * Newsletter Unsubscribe API Route
 * 
 * Handles newsletter unsubscription with feedback collection.
 * Supports one-click unsubscribe and resubscription options.
 * Includes unsubscribe reason tracking and retention offers.
 * 
 * @module api/newsletter/unsubscribe
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const UnsubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(32).optional(),
  reason: z.enum([
    'too-frequent',
    'not-relevant',
    'never-subscribed',
    'spam',
    'privacy-concerns',
    'other',
  ]).optional(),
  feedback: z.string().max(1000).optional(),
  unsubscribeAll: z.boolean().default(true),
  keepCategories: z.array(z.string()).optional(),
});

const OneClickUnsubscribeSchema = z.object({
  token: z.string().min(32),
});

// Types
interface UnsubscribeResponse {
  success: boolean;
  data: {
    email: string;
    message: string;
    unsubscribedAt: string;
    retentionOffer?: {
      title: string;
      description: string;
      options: Array<{
        type: 'reduce-frequency' | 'change-preferences' | 'pause-subscription';
        label: string;
        action: string;
      }>;
    };
    resubscribeToken?: string;
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
 * POST /api/newsletter/unsubscribe
 * 
 * Handles newsletter unsubscription
 * 
 * Body:
 * {
 *   email: string,
 *   token?: string,
 *   reason?: string,
 *   feedback?: string,
 *   unsubscribeAll?: boolean,
 *   keepCategories?: string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate unsubscribe data
    const validationResult = UnsubscribeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid unsubscribe data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const unsubscribeData = validationResult.data;

    // Get user metadata for tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Build backend request
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/newsletter/unsubscribe`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        ...unsubscribeData,
        metadata: {
          ipAddress,
          userAgent,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'SUBSCRIBER_NOT_FOUND',
              message: 'Email address not found in our newsletter list',
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
              message: 'Invalid or expired unsubscribe token',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }

      if (response.status === 410) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'ALREADY_UNSUBSCRIBED',
              message: 'This email is already unsubscribed from the newsletter',
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
            message: errorData.message || 'Failed to unsubscribe from newsletter',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Prepare retention offer if user hasn't completely unsubscribed
    const retentionOffer = !unsubscribeData.unsubscribeAll ? undefined : {
      title: "We're sorry to see you go!",
      description: "Before you leave, would you like to try one of these options instead?",
      options: [
        {
          type: 'reduce-frequency' as const,
          label: 'Reduce email frequency',
          action: 'update-frequency',
        },
        {
          type: 'change-preferences' as const,
          label: 'Change email preferences',
          action: 'update-preferences',
        },
        {
          type: 'pause-subscription' as const,
          label: 'Pause for 3 months',
          action: 'pause-subscription',
        },
      ],
    };

    const responseData: UnsubscribeResponse = {
      success: true,
      data: {
        email: unsubscribeData.email,
        message: unsubscribeData.unsubscribeAll 
          ? 'You have been successfully unsubscribed from all newsletters.'
          : 'Your newsletter preferences have been updated.',
        unsubscribedAt: new Date().toISOString(),
        retentionOffer,
        resubscribeToken: data.data?.resubscribeToken || data.resubscribeToken,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Newsletter Unsubscribe API Error:', error);

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
          message: 'An unexpected error occurred while unsubscribing',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/newsletter/unsubscribe
 * 
 * One-click unsubscribe (email client compatibility)
 * 
 * Query parameters:
 * - token: Unsubscribe token from email
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
            message: 'Unsubscribe token is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate token format
    const validationResult = OneClickUnsubscribeSchema.safeParse({ token });

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid unsubscribe token format',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Get user metadata
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/newsletter/unsubscribe/one-click`
    );
    backendUrl.searchParams.append('token', token);

    const response = await fetch(backendUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          ipAddress,
          userAgent,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid or expired unsubscribe token',
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
              code: 'ALREADY_UNSUBSCRIBED',
              message: 'This email is already unsubscribed',
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
            message: errorData.message || 'Failed to process unsubscribe request',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: UnsubscribeResponse = {
      success: true,
      data: {
        email: data.data?.email || 'Your email',
        message: 'You have been successfully unsubscribed from our newsletter.',
        unsubscribedAt: new Date().toISOString(),
        retentionOffer: {
          title: "We're sorry to see you go!",
          description: "Before you leave, would you like to try one of these options instead?",
          options: [
            {
              type: 'reduce-frequency',
              label: 'Reduce email frequency to monthly',
              action: 'update-frequency',
            },
            {
              type: 'change-preferences',
              label: 'Only receive promotional emails',
              action: 'update-preferences',
            },
            {
              type: 'pause-subscription',
              label: 'Pause emails for 3 months',
              action: 'pause-subscription',
            },
          ],
        },
        resubscribeToken: data.data?.resubscribeToken || data.resubscribeToken,
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
    console.error('One-Click Unsubscribe API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while processing unsubscribe',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/newsletter/unsubscribe
 * 
 * Permanent deletion of subscriber data (GDPR compliance)
 * 
 * Body: { email: string, token: string, confirmDeletion: boolean }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email || !body.token) {
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

    if (!body.confirmDeletion) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'DELETION_NOT_CONFIRMED',
            message: 'Data deletion must be explicitly confirmed',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Build backend request
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/newsletter/delete`;
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        token: body.token,
      }),
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
              message: 'Invalid or expired deletion token',
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
            message: errorData.message || 'Failed to delete subscriber data',
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
          message: 'All your newsletter data has been permanently deleted',
          deletedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Subscriber API Error:', error);

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
          message: 'An unexpected error occurred while deleting subscriber data',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

