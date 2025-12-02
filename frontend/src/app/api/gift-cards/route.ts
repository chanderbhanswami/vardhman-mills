/**
 * Gift Cards API Route
 * 
 * Handles gift card operations including listing, purchase, and balance checks.
 * Supports customizable gift cards with various denominations and themes.
 * Includes validation, expiry tracking, and transaction history.
 * 
 * @module api/gift-cards
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const GiftCardsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.enum(['birthday', 'anniversary', 'holiday', 'thank-you', 'general']).optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  available: z.coerce.boolean().optional(),
  sortBy: z.enum(['amount', 'popularity', 'newest']).default('popularity'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

const PurchaseGiftCardSchema = z.object({
  templateId: z.string().uuid(),
  amount: z.number().min(10).max(10000),
  recipientEmail: z.string().email(),
  recipientName: z.string().min(1).max(100),
  senderName: z.string().min(1).max(100),
  message: z.string().max(500).optional(),
  deliveryDate: z.string().datetime().optional(),
  notifySender: z.boolean().default(true),
});

const CheckBalanceSchema = z.object({
  cardNumber: z.string().regex(/^[A-Z0-9]{16}$/, 'Invalid gift card number format'),
  pin: z.string().regex(/^[0-9]{4}$/, 'PIN must be 4 digits'),
});

// Types
interface GiftCardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'birthday' | 'anniversary' | 'holiday' | 'thank-you' | 'general';
  designUrl: string;
  thumbnail: string;
  previewImages: string[];
  denominationOptions: number[];
  customAmountAllowed: boolean;
  minCustomAmount: number | null;
  maxCustomAmount: number | null;
  tags: string[];
  features: string[];
  expiryMonths: number;
  isActive: boolean;
  popularity: number;
  termsAndConditions: string;
  createdAt: string;
  updatedAt: string;
}

interface GiftCard {
  id: string;
  cardNumber: string;
  template: GiftCardTemplate;
  originalAmount: number;
  currentBalance: number;
  currency: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  message: string | null;
  purchasedAt: string;
  deliveredAt: string | null;
  expiresAt: string;
  lastUsedAt: string | null;
  transactionHistory: Array<{
    id: string;
    type: 'purchase' | 'redemption' | 'refund';
    amount: number;
    balance: number;
    orderId: string | null;
    createdAt: string;
  }>;
}

interface GiftCardsResponse {
  success: boolean;
  data: {
    templates: GiftCardTemplate[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    categories: Array<{
      name: string;
      slug: string;
      count: number;
      icon: string;
    }>;
    popularDenominations: number[];
  };
  timestamp: string;
}

interface PurchaseGiftCardResponse {
  success: boolean;
  data: {
    giftCard: GiftCard;
    transaction: {
      id: string;
      amount: number;
      paymentMethod: string | null;
      status: string;
    };
    message: string;
  };
  timestamp: string;
}

interface CheckBalanceResponse {
  success: boolean;
  data: {
    cardNumber: string;
    currentBalance: number;
    originalAmount: number;
    status: string;
    expiresAt: string;
    daysUntilExpiry: number;
    transactionCount: number;
    lastUsedAt: string | null;
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
 * GET /api/gift-cards
 * 
 * Retrieves available gift card templates
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - category: Filter by category (birthday, anniversary, holiday, thank-you, general)
 * - minAmount: Minimum denomination filter
 * - maxAmount: Maximum denomination filter
 * - available: Show only available templates
 * - sortBy: Sort field (amount, popularity, newest)
 * - sortOrder: Sort direction (asc, desc)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = GiftCardsQuerySchema.safeParse(params);

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

    // Build backend URL with query parameters
    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/gift-cards`
    );

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        backendUrl.searchParams.append(key, String(value));
      }
    });

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ['gift-cards', queryParams.category ? `gift-cards-${queryParams.category}` : 'gift-cards-all'],
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: errorData.message || 'Failed to fetch gift card templates',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const responseData: GiftCardsResponse = {
      success: true,
      data: {
        templates: data.data?.templates || data.templates || [],
        pagination: data.data?.pagination || data.pagination || {
          page: queryParams.page,
          limit: queryParams.limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
        categories: data.data?.categories || data.categories || [],
        popularDenominations: data.data?.popularDenominations || data.popularDenominations || [25, 50, 100, 250, 500],
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'CDN-Cache-Control': 'public, s-maxage=3600',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Gift Cards API Error:', error);

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching gift cards',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gift-cards
 * 
 * Handles gift card operations
 * 
 * For purchase: { action: 'purchase', ...purchaseData }
 * For balance check: { action: 'check-balance', cardNumber, pin }
 * For template creation (Admin): { action: 'create-template', ...templateData }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Route based on action
    if (body.action === 'purchase') {
      return handlePurchase(request, body);
    } else if (body.action === 'check-balance') {
      return handleCheckBalance(request, body);
    } else if (body.action === 'create-template') {
      return handleCreateTemplate(request, body);
    }

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Invalid action. Must be one of: purchase, check-balance, create-template',
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
 * Handles gift card purchase
 */
async function handlePurchase(request: NextRequest, body: unknown) {
  // Validate purchase data
  const validationResult = PurchaseGiftCardSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid purchase data',
          details: validationResult.error.flatten(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  const purchaseData = validationResult.data;

  // Get user authentication
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  // Build backend request
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/gift-cards/purchase`;
  
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
    body: JSON.stringify(purchaseData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 404) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Gift card template not found',
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
            code: errorData.code || 'INVALID_AMOUNT',
            message: errorData.message || 'Invalid gift card amount',
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
          code: 'BACKEND_ERROR',
          message: errorData.message || 'Failed to purchase gift card',
          details: errorData,
        },
        timestamp: new Date().toISOString(),
      },
      { status: response.status }
    );
  }

  const data = await response.json();

  const responseData: PurchaseGiftCardResponse = {
    success: true,
    data: {
      giftCard: data.data?.giftCard || data.giftCard,
      transaction: data.data?.transaction || data.transaction,
      message: 'Gift card purchased successfully',
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(responseData, { status: 201 });
}

/**
 * Handles balance check
 */
async function handleCheckBalance(request: NextRequest, body: unknown) {
  // Validate balance check data
  const validationResult = CheckBalanceSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid card details',
          details: validationResult.error.flatten(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  const { cardNumber, pin } = validationResult.data;

  // Build backend request
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/gift-cards/balance`;
  
  const response = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ cardNumber, pin }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 404) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'CARD_NOT_FOUND',
            message: 'Gift card not found or invalid PIN',
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
            message: 'Invalid PIN. Please check and try again.',
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
          message: errorData.message || 'Failed to check balance',
          details: errorData,
        },
        timestamp: new Date().toISOString(),
      },
      { status: response.status }
    );
  }

  const data = await response.json();

  const responseData: CheckBalanceResponse = {
    success: true,
    data: {
      cardNumber: data.data?.cardNumber || cardNumber,
      currentBalance: data.data?.currentBalance || data.currentBalance,
      originalAmount: data.data?.originalAmount || data.originalAmount,
      status: data.data?.status || data.status,
      expiresAt: data.data?.expiresAt || data.expiresAt,
      daysUntilExpiry: data.data?.daysUntilExpiry || data.daysUntilExpiry,
      transactionCount: data.data?.transactionCount || data.transactionCount || 0,
      lastUsedAt: data.data?.lastUsedAt || data.lastUsedAt,
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(responseData, { status: 200 });
}

/**
 * Handles template creation (Admin only)
 */
async function handleCreateTemplate(request: NextRequest, body: unknown) {
  // Check authentication (Admin only)
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required to create gift card templates',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  // Build backend request
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/gift-cards/templates`;
  
  const response = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 403) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to create gift card templates',
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
          message: errorData.message || 'Failed to create template',
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
        template: data.data?.template || data.template,
        message: 'Gift card template created successfully',
      },
      timestamp: new Date().toISOString(),
    },
    { status: 201 }
  );
}

