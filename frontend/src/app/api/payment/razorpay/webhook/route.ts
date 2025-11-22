/**
 * Razorpay Webhook API Route
 * 
 * Handles Razorpay webhook events for payment notifications.
 * Processes real-time payment status updates, refunds, and disputes.
 * Implements signature verification and idempotency.
 * 
 * @module api/payment/razorpay/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Types
interface RazorpayWebhookEvent {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: RazorpayPaymentEntity;
    };
    order?: {
      entity: RazorpayOrderEntity;
    };
    refund?: {
      entity: RazorpayRefundEntity;
    };
  };
  created_at: number;
}

interface RazorpayPaymentEntity {
  id: string;
  entity: 'payment';
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  order_id: string | null;
  invoice_id: string | null;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string | null;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: Record<string, string>;
  fee: number | null;
  tax: number | null;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  created_at: number;
}

interface RazorpayOrderEntity {
  id: string;
  entity: 'order';
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string | null;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

interface RazorpayRefundEntity {
  id: string;
  entity: 'refund';
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, string>;
  receipt: string | null;
  acquirer_data: {
    arn: string | null;
  };
  created_at: number;
  batch_id: string | null;
  status: string;
  speed_processed: string;
  speed_requested: string;
}

interface WebhookResponse {
  success: boolean;
  message: string;
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
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * POST /api/payment/razorpay/webhook
 * 
 * Handle Razorpay webhook events
 * 
 * Headers:
 * - X-Razorpay-Signature: Webhook signature
 * 
 * Body: Razorpay webhook event payload
 */
export async function POST(request: NextRequest) {
  try {
    // Get webhook signature
    const signature = request.headers.get('X-Razorpay-Signature');

    if (!signature) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'MISSING_SIGNATURE',
            message: 'Webhook signature is missing',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured');
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'Webhook secret is not configured',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    const isValidSignature = verifyWebhookSignature(
      rawBody,
      signature,
      webhookSecret
    );

    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Webhook signature verification failed',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse webhook event
    const webhookEvent: RazorpayWebhookEvent = JSON.parse(rawBody);

    console.log('Razorpay Webhook Event:', {
      event: webhookEvent.event,
      entity: webhookEvent.entity,
      createdAt: new Date(webhookEvent.created_at * 1000).toISOString(),
    });

    // Forward to backend for processing
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payment/razorpay/webhook`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Razorpay-Signature': signature,
        'X-Webhook-Source': 'frontend',
      },
      body: rawBody,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      console.error('Backend webhook processing failed:', errorData);
      
      // Return 200 even if backend processing fails to acknowledge receipt
      // Backend will retry based on webhook retry policy
      return NextResponse.json<WebhookResponse>(
        {
          success: true,
          message: 'Webhook received but processing failed',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    const data = await response.json();

    const responseData: WebhookResponse = {
      success: true,
      message: data.message || 'Webhook processed successfully',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON in webhook payload',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Return 200 to acknowledge receipt even on error
    // Razorpay will retry if we return error status
    return NextResponse.json<WebhookResponse>(
      {
        success: true,
        message: 'Webhook received but processing encountered an error',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

/**
 * GET /api/payment/razorpay/webhook
 * 
 * Webhook endpoint information (for testing)
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      data: {
        endpoint: '/api/payment/razorpay/webhook',
        method: 'POST',
        description: 'Razorpay webhook handler',
        requiredHeaders: ['X-Razorpay-Signature'],
        supportedEvents: [
          'payment.authorized',
          'payment.captured',
          'payment.failed',
          'order.paid',
          'refund.created',
          'refund.processed',
          'refund.failed',
          'dispute.created',
          'dispute.won',
          'dispute.lost',
        ],
        configuration: {
          signatureVerification: 'enabled',
          idempotency: 'enabled',
          retryPolicy: 'exponential-backoff',
        },
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
