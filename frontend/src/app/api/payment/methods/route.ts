/**
 * Payment Methods API Route
 * 
 * Handles retrieval of available payment methods.
 * Provides method-specific configurations, fees, and availability.
 * Supports region-based filtering and saved payment methods.
 * 
 * @module api/payment/methods
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const PaymentMethodsQuerySchema = z.object({
  amount: z.coerce.number().min(0).optional(),
  currency: z.string().default('INR'),
  country: z.string().optional(),
  includeAll: z.coerce.boolean().default(false), // Include disabled methods (Admin)
});

// Types
interface PaymentMethodConfig {
  id: string;
  name: string;
  type: 'credit-card' | 'debit-card' | 'upi' | 'net-banking' | 'wallet' | 'cod' | 'emi';
  displayName: string;
  description: string | null;
  icon: string;
  enabled: boolean;
  testMode: boolean;
  provider: string | null;
  config: {
    minAmount: number | null;
    maxAmount: number | null;
    processingFee: {
      type: 'percentage' | 'fixed';
      value: number;
    } | null;
    acceptedCurrencies: string[];
    supportedCountries: string[];
  };
  features: {
    supportsRefund: boolean;
    supportsPartialRefund: boolean;
    requiresVerification: boolean;
    instantConfirmation: boolean;
    saveable: boolean;
  };
  availability: {
    available: boolean;
    reason: string | null;
  };
  estimatedProcessingTime: {
    min: number;
    max: number;
    unit: 'minutes' | 'hours' | 'days';
  };
}

interface SavedPaymentMethod {
  id: string;
  type: string;
  provider: string;
  displayName: string;
  last4: string | null;
  brand: string | null;
  expiryMonth: number | null;
  expiryYear: number | null;
  isDefault: boolean;
  isExpired: boolean;
  createdAt: string;
}

interface PaymentMethodsResponse {
  success: boolean;
  data: {
    methods: PaymentMethodConfig[];
    savedMethods: SavedPaymentMethod[];
    recommended: string | null;
    configuration: {
      currency: string;
      country: string;
      testMode: boolean;
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
 * GET /api/payment/methods
 * 
 * Get available payment methods
 * 
 * Query Parameters:
 * - amount: Order amount to check method availability
 * - currency: Currency code (default: INR)
 * - country: Country code for region-specific methods
 * - includeAll: Include disabled methods (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = PaymentMethodsQuerySchema.safeParse(params);

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

    // Get authentication (optional)
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payment/methods`
    );

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        backendUrl.searchParams.append(key, String(value));
      }
    });

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch payment methods',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: PaymentMethodsResponse = {
      success: true,
      data: {
        methods: data.data?.methods || data.methods || [],
        savedMethods: data.data?.savedMethods || [],
        recommended: data.data?.recommended || null,
        configuration: data.data?.configuration || {
          currency: queryParams.currency,
          country: queryParams.country || 'IN',
          testMode: process.env.NODE_ENV !== 'production',
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Payment Methods API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching payment methods',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payment/methods
 * 
 * Save a payment method for future use (requires authentication)
 * 
 * Body:
 * {
 *   type: string,
 *   provider: string,
 *   token: string,
 *   setAsDefault: boolean
 * }
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
            message: 'Authentication required to save payment method',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Basic validation
    if (!body.type || !body.token) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Payment method type and token are required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payment/methods`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to save payment method',
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
          paymentMethod: data.data?.paymentMethod || data.paymentMethod,
          message: 'Payment method saved successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Save Payment Method API Error:', error);

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
          message: 'An unexpected error occurred while saving payment method',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/payment/methods
 * 
 * Delete a saved payment method
 * 
 * Query Parameters:
 * - id: Payment method ID to delete
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const methodId = searchParams.get('id');

    if (!methodId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Payment method ID is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to delete payment method',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Make request to backend
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payment/methods`
    );
    backendUrl.searchParams.append('id', methodId);
    
    const response = await fetch(backendUrl.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'METHOD_NOT_FOUND',
              message: 'Payment method not found',
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
            message: errorData.message || 'Failed to delete payment method',
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
          message: 'Payment method deleted successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Payment Method API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while deleting payment method',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
