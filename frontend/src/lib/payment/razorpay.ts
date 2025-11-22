/**
 * Razorpay Integration for Vardhman Mills Frontend
 * Comprehensive Razorpay payment gateway integration
 */

import { toast } from 'react-hot-toast';
import { PaymentRequest, PaymentResponse } from './payment-utils';
import { PaymentValidator } from './payment-validation';

// Razorpay types
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
  handler: (response: RazorpayResponse) => void;
  method?: {
    netbanking?: boolean;
    card?: boolean;
    upi?: boolean;
    wallet?: boolean;
    emi?: boolean;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  close(): void;
  on(event: string, handler: (response: unknown) => void): void;
}

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string;
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
  created_at: number;
}

// Configuration
export const RAZORPAY_CONFIG = {
  keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  currency: 'INR',
  company: {
    name: 'Vardhman Mills',
    logo: '/logo.png',
    color: '#2563eb',
  },
  endpoints: {
    createOrder: '/api/payment/razorpay/create-order',
    verifyPayment: '/api/payment/razorpay/verify',
    refund: '/api/payment/razorpay/refund',
    capture: '/api/payment/razorpay/capture',
  }
} as const;

// Razorpay service class
export class RazorpayService {
  private static instance: RazorpayService;
  private isScriptLoaded = false;

  private constructor() {}

  static getInstance(): RazorpayService {
    if (!RazorpayService.instance) {
      RazorpayService.instance = new RazorpayService();
    }
    return RazorpayService.instance;
  }

  /**
   * Load Razorpay script
   */
  async loadScript(): Promise<boolean> {
    if (this.isScriptLoaded) return true;

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.isScriptLoaded = true;
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Create Razorpay order
   */
  async createOrder(paymentRequest: PaymentRequest): Promise<RazorpayOrder> {
    try {
      const response = await fetch(RAZORPAY_CONFIG.endpoints.createOrder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentRequest.amount * 100, // Convert to paise
          currency: paymentRequest.currency,
          receipt: paymentRequest.orderId,
          notes: {
            orderId: paymentRequest.orderId,
            customerId: paymentRequest.customerInfo.id,
            ...paymentRequest.metadata,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const order: RazorpayOrder = await response.json();
      return order;

    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Initialize payment
   */
  async initiatePayment(
    paymentRequest: PaymentRequest,
    options?: {
      enabledMethods?: string[];
      onSuccess?: (response: PaymentResponse) => void;
      onFailure?: (error: string) => void;
      onDismiss?: () => void;
    }
  ): Promise<void> {
    try {
      // Validate payment request
      const validation = PaymentValidator.validatePaymentData('card', paymentRequest as unknown as Record<string, unknown>);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Load Razorpay script
      const scriptLoaded = await this.loadScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Create order
      const order = await this.createOrder(paymentRequest);

      // Configure payment options
      const razorpayOptions: RazorpayOptions = {
        key: RAZORPAY_CONFIG.keyId,
        amount: order.amount,
        currency: order.currency,
        name: RAZORPAY_CONFIG.company.name,
        description: `Order #${paymentRequest.orderId}`,
        order_id: order.id,
        prefill: {
          name: paymentRequest.customerInfo.name,
          email: paymentRequest.customerInfo.email,
          contact: PaymentValidator.formatPhoneNumber(paymentRequest.customerInfo.phone),
        },
        notes: order.notes,
        theme: {
          color: RAZORPAY_CONFIG.company.color,
        },
        modal: {
          ondismiss: () => {
            options?.onDismiss?.();
            toast.error('Payment cancelled');
          },
        },
        handler: (response: RazorpayResponse) => {
          this.handlePaymentSuccess(response, paymentRequest, options?.onSuccess);
        },
      };

      // Configure enabled payment methods
      if (options?.enabledMethods?.length) {
        razorpayOptions.method = {
          netbanking: options.enabledMethods.includes('netbanking'),
          card: options.enabledMethods.includes('card'),
          upi: options.enabledMethods.includes('upi'),
          wallet: options.enabledMethods.includes('wallet'),
          emi: options.enabledMethods.includes('emi'),
        };
      }

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(razorpayOptions);
      
      razorpay.on('payment.failed', (response: unknown) => {
        const errorResponse = response as { error?: { description?: string } };
        const errorMsg = errorResponse.error?.description || 'Payment failed';
        options?.onFailure?.(errorMsg);
        toast.error(errorMsg);
      });

      razorpay.open();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment initialization failed';
      options?.onFailure?.(errorMessage);
      toast.error(errorMessage);
    }
  }

  /**
   * Handle payment success
   */
  private async handlePaymentSuccess(
    razorpayResponse: RazorpayResponse,
    paymentRequest: PaymentRequest,
    onSuccess?: (response: PaymentResponse) => void
  ): Promise<void> {
    try {
      // Verify payment on server
      const verificationResponse = await fetch(RAZORPAY_CONFIG.endpoints.verifyPayment, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          orderId: paymentRequest.orderId,
        }),
      });

      if (!verificationResponse.ok) {
        throw new Error('Payment verification failed');
      }

      const verificationResult = await verificationResponse.json();

      if (verificationResult.success) {
        const paymentResponse: PaymentResponse = {
          success: true,
          paymentId: razorpayResponse.razorpay_payment_id,
          orderId: paymentRequest.orderId,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          status: 'success',
          gatewayResponse: razorpayResponse as unknown as Record<string, unknown>,
          timestamp: new Date(),
        };

        onSuccess?.(paymentResponse);
        toast.success('Payment successful!');
      } else {
        throw new Error(verificationResult.error || 'Payment verification failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
      toast.error(errorMessage);
      console.error('Payment verification error:', error);
    }
  }

  /**
   * Capture payment (for authorized payments)
   */
  async capturePayment(
    paymentId: string, 
    amount: number, 
    currency: string = 'INR'
  ): Promise<RazorpayPayment> {
    try {
      const response = await fetch(RAZORPAY_CONFIG.endpoints.capture, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          amount: amount * 100, // Convert to paise
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const payment: RazorpayPayment = await response.json();
      return payment;

    } catch (error) {
      console.error('Error capturing payment:', error);
      throw new Error('Failed to capture payment');
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(
    paymentId: string,
    amount?: number,
    notes?: Record<string, string>
  ): Promise<{ id: string; amount: number; status: string }> {
    try {
      const response = await fetch(RAZORPAY_CONFIG.endpoints.refund, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          amount: amount ? amount * 100 : undefined, // Convert to paise if provided
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const refund = await response.json();
      return refund;

    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: string): Promise<RazorpayPayment> {
    try {
      const response = await fetch(`/api/payment/razorpay/payment/${paymentId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const payment: RazorpayPayment = await response.json();
      return payment;

    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  /**
   * Get order details
   */
  async getOrderDetails(orderId: string): Promise<RazorpayOrder> {
    try {
      const response = await fetch(`/api/payment/razorpay/order/${orderId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const order: RazorpayOrder = await response.json();
      return order;

    } catch (error) {
      console.error('Error fetching order details:', error);
      throw new Error('Failed to fetch order details');
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(orderId: string): Promise<{
    status: string;
    paymentId?: string;
    amount?: number;
  }> {
    try {
      const order = await this.getOrderDetails(orderId);
      
      if (order.status === 'paid') {
        // Get payment details for paid orders
        const response = await fetch(`/api/payment/razorpay/order/${orderId}/payments`);
        const payments = await response.json();
        
        if (payments.items && payments.items.length > 0) {
          const payment = payments.items[0];
          return {
            status: 'success',
            paymentId: payment.id,
            amount: payment.amount / 100, // Convert from paise
          };
        }
      }

      return { status: order.status };

    } catch (error) {
      console.error('Error checking payment status:', error);
      return { status: 'unknown' };
    }
  }

  /**
   * Generate payment link
   */
  async createPaymentLink(
    paymentRequest: PaymentRequest,
    options?: {
      expiryMinutes?: number;
      description?: string;
      smsNotify?: boolean;
      emailNotify?: boolean;
    }
  ): Promise<{ id: string; short_url: string; status: string }> {
    try {
      const response = await fetch('/api/payment/razorpay/payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentRequest.amount * 100,
          currency: paymentRequest.currency,
          accept_partial: false,
          expire_by: options?.expiryMinutes ? 
            Math.floor(Date.now() / 1000) + (options.expiryMinutes * 60) : 
            undefined,
          reference_id: paymentRequest.orderId,
          description: options?.description || `Payment for Order #${paymentRequest.orderId}`,
          customer: {
            name: paymentRequest.customerInfo.name,
            email: paymentRequest.customerInfo.email,
            contact: PaymentValidator.formatPhoneNumber(paymentRequest.customerInfo.phone),
          },
          notify: {
            sms: options?.smsNotify ?? true,
            email: options?.emailNotify ?? true,
          },
          reminder_enable: true,
          notes: {
            orderId: paymentRequest.orderId,
            customerId: paymentRequest.customerInfo.id,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const paymentLink = await response.json();
      return paymentLink;

    } catch (error) {
      console.error('Error creating payment link:', error);
      throw new Error('Failed to create payment link');
    }
  }
}

// Export singleton instance
export const razorpayService = RazorpayService.getInstance();

// Utility functions
export const RazorpayUtils = {
  /**
   * Format amount for Razorpay (convert to paise)
   */
  formatAmount: (amount: number): number => Math.round(amount * 100),

  /**
   * Parse amount from Razorpay (convert from paise)
   */
  parseAmount: (amount: number): number => amount / 100,

  /**
   * Validate Razorpay configuration
   */
  validateConfig: (): boolean => {
    return !!(RAZORPAY_CONFIG.keyId && 
             RAZORPAY_CONFIG.keySecret && 
             RAZORPAY_CONFIG.webhookSecret);
  },

  /**
   * Get payment method display name
   */
  getPaymentMethodName: (method: string): string => {
    const methods: Record<string, string> = {
      card: 'Credit/Debit Card',
      netbanking: 'Net Banking',
      upi: 'UPI',
      wallet: 'Digital Wallet',
      emi: 'EMI',
    };
    return methods[method] || method;
  },
};

export default razorpayService;