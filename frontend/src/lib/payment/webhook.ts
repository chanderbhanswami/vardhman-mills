/**
 * Payment Webhook Handler for Vardhman Mills Frontend
 * Handles payment gateway webhooks and notifications
 */

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Webhook event types
export type WebhookEventType = 
  | 'payment.authorized'
  | 'payment.captured' 
  | 'payment.failed'
  | 'order.paid'
  | 'refund.created'
  | 'refund.processed'
  | 'subscription.charged'
  | 'subscription.cancelled';

// Webhook payload interfaces
export interface WebhookPayload {
  account_id: string;
  event: WebhookEventType;
  entity: string;
  created_at: number;
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
}

export interface RazorpayPaymentEntity {
  id: string;
  entity: 'payment';
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  order_id: string;
  method: 'card' | 'netbanking' | 'wallet' | 'upi' | 'emi';
  captured: boolean;
  description: string;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email: string;
  contact: string;
  notes: Record<string, string>;
  fee: number;
  tax: number;
  error_code?: string;
  error_description?: string;
  created_at: number;
}

export interface RazorpayOrderEntity {
  id: string;
  entity: 'order';
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayRefundEntity {
  id: string;
  entity: 'refund';
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, string>;
  receipt: string;
  status: 'pending' | 'processed' | 'failed';
  speed: 'normal' | 'optimum';
  created_at: number;
}

// Webhook handler class
export class WebhookHandler {
  private webhookSecret: string;

  constructor(webhookSecret: string) {
    this.webhookSecret = webhookSecret;
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Process webhook event
   */
  async processWebhook(
    payload: WebhookPayload,
    handlers: WebhookHandlers
  ): Promise<WebhookProcessResult> {
    try {
      const { event, payload: eventPayload } = payload;

      switch (event) {
        case 'payment.authorized':
          return await this.handlePaymentAuthorized(eventPayload.payment?.entity, handlers);
          
        case 'payment.captured':
          return await this.handlePaymentCaptured(eventPayload.payment?.entity, handlers);
          
        case 'payment.failed':
          return await this.handlePaymentFailed(eventPayload.payment?.entity, handlers);
          
        case 'order.paid':
          return await this.handleOrderPaid(eventPayload.order?.entity, handlers);
          
        case 'refund.created':
          return await this.handleRefundCreated(eventPayload.refund?.entity, handlers);
          
        case 'refund.processed':
          return await this.handleRefundProcessed(eventPayload.refund?.entity, handlers);
          
        default:
          console.warn(`Unhandled webhook event: ${event}`);
          return { success: true, message: 'Event not handled' };
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Handle payment authorized event
   */
  private async handlePaymentAuthorized(
    payment: RazorpayPaymentEntity | undefined,
    handlers: WebhookHandlers
  ): Promise<WebhookProcessResult> {
    if (!payment) {
      return { success: false, error: 'Payment data missing' };
    }

    console.log(`Payment authorized: ${payment.id}`);

    if (handlers.onPaymentAuthorized) {
      await handlers.onPaymentAuthorized(payment);
    }

    // Update order status in database
    await this.updatePaymentStatus(payment.id, 'authorized', {
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount / 100, // Convert from paise
      method: payment.method,
      captured: payment.captured,
    });

    return { success: true, message: 'Payment authorized processed' };
  }

  /**
   * Handle payment captured event
   */
  private async handlePaymentCaptured(
    payment: RazorpayPaymentEntity | undefined,
    handlers: WebhookHandlers
  ): Promise<WebhookProcessResult> {
    if (!payment) {
      return { success: false, error: 'Payment data missing' };
    }

    console.log(`Payment captured: ${payment.id}`);

    if (handlers.onPaymentCaptured) {
      await handlers.onPaymentCaptured(payment);
    }

    // Update order status and trigger fulfillment
    await this.updatePaymentStatus(payment.id, 'captured', {
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount / 100,
      method: payment.method,
      captured: true,
    });

    // Trigger order fulfillment
    await this.triggerOrderFulfillment(payment.order_id, payment);

    return { success: true, message: 'Payment captured processed' };
  }

  /**
   * Handle payment failed event
   */
  private async handlePaymentFailed(
    payment: RazorpayPaymentEntity | undefined,
    handlers: WebhookHandlers
  ): Promise<WebhookProcessResult> {
    if (!payment) {
      return { success: false, error: 'Payment data missing' };
    }

    console.log(`Payment failed: ${payment.id}`);

    if (handlers.onPaymentFailed) {
      await handlers.onPaymentFailed(payment);
    }

    // Update order status and notify customer
    await this.updatePaymentStatus(payment.id, 'failed', {
      paymentId: payment.id,
      orderId: payment.order_id,
      error: payment.error_description,
      errorCode: payment.error_code,
    });

    // Send failure notification
    await this.sendPaymentFailureNotification(payment);

    return { success: true, message: 'Payment failure processed' };
  }

  /**
   * Handle order paid event
   */
  private async handleOrderPaid(
    order: RazorpayOrderEntity | undefined,
    handlers: WebhookHandlers
  ): Promise<WebhookProcessResult> {
    if (!order) {
      return { success: false, error: 'Order data missing' };
    }

    console.log(`Order paid: ${order.id}`);

    if (handlers.onOrderPaid) {
      await handlers.onOrderPaid(order);
    }

    // Mark order as paid and initiate processing
    await this.updateOrderStatus(order.id, 'paid', {
      orderId: order.id,
      amount: order.amount / 100,
      paidAmount: order.amount_paid / 100,
    });

    return { success: true, message: 'Order paid processed' };
  }

  /**
   * Handle refund created event
   */
  private async handleRefundCreated(
    refund: RazorpayRefundEntity | undefined,
    handlers: WebhookHandlers
  ): Promise<WebhookProcessResult> {
    if (!refund) {
      return { success: false, error: 'Refund data missing' };
    }

    console.log(`Refund created: ${refund.id}`);

    if (handlers.onRefundCreated) {
      await handlers.onRefundCreated(refund);
    }

    // Update refund status
    await this.updateRefundStatus(refund.id, 'created', {
      refundId: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount / 100,
      status: refund.status,
    });

    return { success: true, message: 'Refund created processed' };
  }

  /**
   * Handle refund processed event
   */
  private async handleRefundProcessed(
    refund: RazorpayRefundEntity | undefined,
    handlers: WebhookHandlers
  ): Promise<WebhookProcessResult> {
    if (!refund) {
      return { success: false, error: 'Refund data missing' };
    }

    console.log(`Refund processed: ${refund.id}`);

    if (handlers.onRefundProcessed) {
      await handlers.onRefundProcessed(refund);
    }

    // Update refund status and notify customer
    await this.updateRefundStatus(refund.id, 'processed', {
      refundId: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount / 100,
      status: 'processed',
    });

    // Send refund confirmation
    await this.sendRefundConfirmation(refund);

    return { success: true, message: 'Refund processed' };
  }

  /**
   * Update payment status in database
   */
  private async updatePaymentStatus(
    paymentId: string,
    status: string,
    data: Record<string, unknown>
  ): Promise<void> {
    try {
      await fetch('/api/payment/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, status, ...data }),
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  }

  /**
   * Update order status in database
   */
  private async updateOrderStatus(
    orderId: string,
    status: string,
    data: Record<string, unknown>
  ): Promise<void> {
    try {
      await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, ...data }),
      });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }

  /**
   * Update refund status in database
   */
  private async updateRefundStatus(
    refundId: string,
    status: string,
    data: Record<string, unknown>
  ): Promise<void> {
    try {
      await fetch('/api/refunds/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refundId, status, ...data }),
      });
    } catch (error) {
      console.error('Error updating refund status:', error);
    }
  }

  /**
   * Trigger order fulfillment
   */
  private async triggerOrderFulfillment(
    orderId: string,
    payment: RazorpayPaymentEntity
  ): Promise<void> {
    try {
      await fetch('/api/orders/fulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId, 
          paymentId: payment.id,
          paymentMethod: payment.method,
          amount: payment.amount / 100,
        }),
      });
    } catch (error) {
      console.error('Error triggering order fulfillment:', error);
    }
  }

  /**
   * Send payment failure notification
   */
  private async sendPaymentFailureNotification(
    payment: RazorpayPaymentEntity
  ): Promise<void> {
    try {
      await fetch('/api/notifications/payment-failed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: payment.order_id,
          paymentId: payment.id,
          email: payment.email,
          error: payment.error_description,
          amount: payment.amount / 100,
        }),
      });
    } catch (error) {
      console.error('Error sending payment failure notification:', error);
    }
  }

  /**
   * Send refund confirmation
   */
  private async sendRefundConfirmation(refund: RazorpayRefundEntity): Promise<void> {
    try {
      await fetch('/api/notifications/refund-processed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundId: refund.id,
          paymentId: refund.payment_id,
          amount: refund.amount / 100,
        }),
      });
    } catch (error) {
      console.error('Error sending refund confirmation:', error);
    }
  }
}

// Webhook handler interfaces
export interface WebhookHandlers {
  onPaymentAuthorized?: (payment: RazorpayPaymentEntity) => Promise<void>;
  onPaymentCaptured?: (payment: RazorpayPaymentEntity) => Promise<void>;
  onPaymentFailed?: (payment: RazorpayPaymentEntity) => Promise<void>;
  onOrderPaid?: (order: RazorpayOrderEntity) => Promise<void>;
  onRefundCreated?: (refund: RazorpayRefundEntity) => Promise<void>;
  onRefundProcessed?: (refund: RazorpayRefundEntity) => Promise<void>;
}

export interface WebhookProcessResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Next.js API route handler
export async function handleWebhookRequest(
  request: NextRequest,
  handlers?: WebhookHandlers
): Promise<NextResponse> {
  try {
    // Verify request method
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Get webhook signature
    const signature = request.headers.get('X-Razorpay-Signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.text();
    if (!body) {
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    // Initialize webhook handler
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const webhookHandler = new WebhookHandler(webhookSecret);

    // Verify signature
    if (!webhookHandler.verifySignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload: WebhookPayload = JSON.parse(body);

    // Process webhook
    const result = await webhookHandler.processWebhook(payload, handlers || {});

    if (result.success) {
      return NextResponse.json({ message: result.message || 'Webhook processed' });
    } else {
      return NextResponse.json(
        { error: result.error || 'Webhook processing failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Utility functions
export const WebhookUtils = {
  /**
   * Create webhook handler instance
   */
  createHandler: (webhookSecret: string): WebhookHandler => {
    return new WebhookHandler(webhookSecret);
  },

  /**
   * Validate webhook payload
   */
  validatePayload: (payload: unknown): payload is WebhookPayload => {
    if (typeof payload !== 'object' || payload === null) return false;
    
    const p = payload as Record<string, unknown>;
    return !!(
      p.account_id &&
      p.event &&
      p.entity &&
      p.created_at &&
      p.payload
    );
  },

  /**
   * Extract order ID from webhook payload
   */
  extractOrderId: (payload: WebhookPayload): string | null => {
    const payment = payload.payload.payment?.entity;
    const order = payload.payload.order?.entity;
    
    return payment?.order_id || order?.id || null;
  },

  /**
   * Extract payment ID from webhook payload
   */
  extractPaymentId: (payload: WebhookPayload): string | null => {
    const payment = payload.payload.payment?.entity;
    const refund = payload.payload.refund?.entity;
    
    return payment?.id || refund?.payment_id || null;
  },
};

export default WebhookHandler;