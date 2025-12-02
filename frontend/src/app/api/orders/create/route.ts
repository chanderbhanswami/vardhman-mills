/**
 * Order Creation API Route
 * 
 * Handles order creation from cart/checkout.
 * Validates inventory, calculates totals, processes payments.
 * Supports guest orders, address validation, and coupon application.
 * 
 * @module api/orders/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schemas
const AddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  company: z.string().max(100).optional(),
  addressLine1: z.string().min(1, 'Address is required').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  country: z.string().min(1, 'Country is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  phone: z.string().min(10, 'Valid phone number is required').max(20),
  email: z.string().email('Valid email is required').optional(),
});

const OrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be positive'),
  customization: z.record(z.string(), z.string()).optional(),
});

const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  useSameAddress: z.boolean().default(true),
  shippingMethod: z.string().min(1, 'Shipping method is required'),
  paymentMethod: z.enum(['credit-card', 'debit-card', 'upi', 'net-banking', 'wallet', 'cod']),
  paymentDetails: z.object({
    provider: z.string().optional(),
    token: z.string().optional(),
    saveCard: z.boolean().default(false),
  }).optional(),
  couponCode: z.string().optional(),
  giftCardCode: z.string().optional(),
  customerNotes: z.string().max(500).optional(),
  isGuestOrder: z.boolean().default(false),
  guestEmail: z.string().email().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to terms and conditions',
  }),
  subscribe: z.boolean().default(false),
  metadata: z.object({
    referrer: z.string().optional(),
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
  }).optional(),
}).refine(
  (data) => {
    if (data.isGuestOrder) {
      return !!data.guestEmail;
    }
    return true;
  },
  {
    message: 'Guest email is required for guest orders',
    path: ['guestEmail'],
  }
);

// Types
interface CreatedOrder {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customer: {
    id: string | null;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    productId: string;
    product: {
      id: string;
      name: string;
      thumbnail: string;
    };
    variantId: string | null;
    variant: {
      name: string;
      attributes: Record<string, string>;
    } | null;
    quantity: number;
    price: number;
    salePrice: number | null;
    discount: number;
    subtotal: number;
    tax: number;
    total: number;
  }>;
  itemsCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  currency: string;
  status: 'pending' | 'processing';
  paymentStatus: 'pending' | 'paid';
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
  };
  shipping: {
    method: string;
    provider: string;
    cost: number;
    estimatedDays: {
      min: number;
      max: number;
    };
  };
  payment: {
    method: string;
    provider: string | null;
    status: string;
    amount: number;
  };
  appliedCoupons: Array<{
    id: string;
    code: string;
    discount: number;
  }>;
  isGuestOrder: boolean;
  createdAt: string;
}

interface CreateOrderResponse {
  success: boolean;
  data: {
    order: CreatedOrder;
    paymentRequired: boolean;
    paymentGatewayData: {
      orderId: string;
      amount: number;
      currency: string;
      key: string;
      redirectUrl: string | null;
    } | null;
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
 * POST /api/orders/create
 * 
 * Create a new order from cart/checkout
 * 
 * Body:
 * {
 *   items: array of order items,
 *   shippingAddress: address object,
 *   billingAddress?: address object,
 *   useSameAddress: boolean,
 *   shippingMethod: string,
 *   paymentMethod: string,
 *   paymentDetails?: object,
 *   couponCode?: string,
 *   giftCardCode?: string,
 *   customerNotes?: string,
 *   isGuestOrder: boolean,
 *   guestEmail?: string,
 *   agreeToTerms: boolean,
 *   subscribe: boolean,
 *   metadata?: object
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = CreateOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid order data',
            details: validationResult.error.flatten(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const orderData = validationResult.data;

    // Use same address for billing if specified
    if (orderData.useSameAddress) {
      orderData.billingAddress = orderData.shippingAddress;
    }

    // Get authentication (optional for guest orders)
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const sessionId = cookieStore.get('session_id')?.value;

    // Collect metadata
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const enrichedOrderData = {
      ...orderData,
      sessionId,
      ipAddress: clientIp,
      userAgent,
    };

    // Make request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/orders/create`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(enrichedOrderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 400) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: errorData.message || 'Invalid order data',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      if (response.status === 409) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'INVENTORY_ERROR',
              message: 'Some items are out of stock or insufficient quantity',
              details: errorData,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 409 }
        );
      }

      if (response.status === 422) {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: {
              code: 'COUPON_INVALID',
              message: 'Invalid or expired coupon code',
              details: errorData,
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
            message: errorData.message || 'Failed to create order',
            details: errorData,
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Set order tracking cookie for guest orders
    if (orderData.isGuestOrder && data.data?.order) {
      const orderTrackingCookie = {
        orderNumber: data.data.order.orderNumber,
        email: orderData.guestEmail,
      };

      const cookieStore = await cookies();
      cookieStore.set('order_tracking', JSON.stringify(orderTrackingCookie), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 90, // 90 days
        path: '/',
      });
    }

    const responseData: CreateOrderResponse = {
      success: true,
      data: {
        order: data.data?.order || data.order,
        paymentRequired: data.data?.paymentRequired !== false,
        paymentGatewayData: data.data?.paymentGatewayData || null,
        message: 'Order created successfully',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Create Order API Error:', error);

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
          message: 'An unexpected error occurred while creating order',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

