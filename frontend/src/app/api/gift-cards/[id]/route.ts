/**
 * Gift Card by ID API Route
 * 
 * Handles individual gift card operations including retrieval, redemption,
 * and transaction history. Supports both card number and database ID lookups.
 * 
 * @module api/gift-cards/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const RedeemGiftCardSchema = z.object({
  amount: z.number().positive(),
  orderId: z.string().uuid(),
  pin: z.string().regex(/^[0-9]{4}$/, 'PIN must be 4 digits').optional(),
});

const UpdateGiftCardSchema = z.object({
  status: z.enum(['active', 'cancelled', 'suspended']).optional(),
  expiryExtension: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
});

// Types
interface GiftCardTransaction {
  id: string;
  type: 'purchase' | 'redemption' | 'refund' | 'adjustment';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  orderId: string | null;
  description: string;
  performedBy: string | null;
  createdAt: string;
}

interface GiftCardDetails {
  id: string;
  cardNumber: string;
  template: {
    id: string;
    name: string;
    description: string;
    category: string;
    designUrl: string;
  };
  originalAmount: number;
  currentBalance: number;
  currency: string;
  status: 'active' | 'used' | 'expired' | 'cancelled' | 'suspended';
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  message: string | null;
  purchasedAt: string;
  deliveredAt: string | null;
  expiresAt: string;
  lastUsedAt: string | null;
  isExpired: boolean;
  daysUntilExpiry: number;
  transactionHistory: GiftCardTransaction[];
  metadata: {
    totalRedemptions: number;
    totalRefunds: number;
    averageTransactionAmount: number;
    firstUsedAt: string | null;
  };
  termsAndConditions: string;
}

interface GiftCardResponse {
  success: boolean;
  data: {
    giftCard: GiftCardDetails;
  };
  timestamp: string;
}

interface RedeemResponse {
  success: boolean;
  data: {
    giftCard: GiftCardDetails;
    transaction: GiftCardTransaction;
    remainingBalance: number;
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
 * GET /api/gift-cards/[id]
 * 
 * Retrieves gift card details by ID or card number
 * 
 * Query parameters:
 * - pin: 4-digit PIN for card number lookups
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const pin = searchParams.get('pin');

    // Determine if ID is a card number or database ID
    const isCardNumber = /^[A-Z0-9]{16}$/.test(id);

    if (isCardNumber && !pin) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'PIN_REQUIRED',
            message: 'PIN is required to view gift card details by card number',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Get user authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    // Build backend URL
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/gift-cards/${id}`
    );

    if (pin) {
      backendUrl.searchParams.append('pin', pin);
    }

    // Fetch from backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store', // Don't cache sensitive gift card data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'CARD_NOT_FOUND',
              message: 'Gift card not found',
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
              code: 'INVALID_PIN',
              message: 'Invalid PIN or unauthorized access',
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
            message: errorData.message || 'Failed to fetch gift card details',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: GiftCardResponse = {
      success: true,
      data: {
        giftCard: data.data?.giftCard || data.giftCard,
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
    console.error('Gift Card Details API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching gift card details',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gift-cards/[id]
 * 
 * Handles gift card operations
 * 
 * For redemption: { action: 'redeem', amount, orderId, pin? }
 * For resend: { action: 'resend' }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Route based on action
    if (body.action === 'redeem') {
      return handleRedeem(request, id, body);
    } else if (body.action === 'resend') {
      return handleResend(request, id);
    }

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Invalid action. Must be one of: redeem, resend',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Gift Card POST API Error:', error);

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
 * PATCH /api/gift-cards/[id]
 * 
 * Updates gift card details (Admin only)
 * 
 * Body:
 * {
 *   status?: 'active' | 'cancelled' | 'suspended',
 *   expiryExtension?: number (months),
 *   notes?: string
 * }
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Check authentication (Admin only)
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to update gift cards',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate update data
    const validationResult = UpdateGiftCardSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid update data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Build backend request
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/gift-cards/${id}`;
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 403) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to update gift cards',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }

      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'CARD_NOT_FOUND',
              message: 'Gift card not found',
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
            message: errorData.message || 'Failed to update gift card',
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
          giftCard: data.data?.giftCard || data.giftCard,
          message: 'Gift card updated successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update Gift Card API Error:', error);

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
          message: 'An unexpected error occurred while updating gift card',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Handles gift card redemption
 */
async function handleRedeem(request: NextRequest, id: string, body: unknown) {
  // Validate redemption data
  const validationResult = RedeemGiftCardSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid redemption data',
          details: validationResult.error.flatten(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  const { amount, orderId, pin } = validationResult.data;

  // Get user authentication
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  // Build backend request
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/gift-cards/${id}/redeem`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(backendUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ amount, orderId, pin }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 404) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'CARD_NOT_FOUND',
            message: 'Gift card not found',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    if (response.status === 400) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: errorData.code || 'INSUFFICIENT_BALANCE',
            message: errorData.message || 'Insufficient gift card balance',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (response.status === 403) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'CARD_INACTIVE',
            message: errorData.message || 'Gift card is not active or has expired',
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
          message: errorData.message || 'Failed to redeem gift card',
          details: errorData,
        },
        timestamp: new Date().toISOString(),
      },
      { status: response.status }
    );
  }

  const data = await response.json();

  const responseData: RedeemResponse = {
    success: true,
    data: {
      giftCard: data.data?.giftCard || data.giftCard,
      transaction: data.data?.transaction || data.transaction,
      remainingBalance: data.data?.remainingBalance || data.remainingBalance,
      message: `Successfully redeemed $${amount}. Remaining balance: $${data.data?.remainingBalance || data.remainingBalance}`,
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(responseData, { status: 200 });
}

/**
 * Handles gift card resend
 */
async function handleResend(request: NextRequest, id: string) {
  // Get user authentication
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (!authToken) {
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required to resend gift cards',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  // Build backend request
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/gift-cards/${id}/resend`;
  
  const response = await fetch(backendUrl, {
    method: 'POST',
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
            code: 'CARD_NOT_FOUND',
            message: 'Gift card not found',
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
            code: 'FORBIDDEN',
            message: 'You do not have permission to resend this gift card',
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
          message: errorData.message || 'Failed to resend gift card',
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
        message: 'Gift card has been resent successfully',
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
