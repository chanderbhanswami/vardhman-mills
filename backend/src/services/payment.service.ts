import razorpay from '../config/razorpay.js';

export interface CreateOrderOptions {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RefundOptions {
  paymentId: string;
  amount?: number;
  notes?: Record<string, string>;
}

export class PaymentService {
  static async createOrder(options: CreateOrderOptions) {
    if (!razorpay) {
      throw new Error('Payment service is not available');
    }
    
    const { amount, currency = 'INR', receipt, notes } = options;
    
    return await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      payment_capture: true,
      notes
    });
  }

  static async fetchOrder(orderId: string) {
    if (!razorpay) {
      throw new Error('Payment service is not available');
    }
    return await razorpay.orders.fetch(orderId);
  }

  static async fetchPayment(paymentId: string) {
    if (!razorpay) {
      throw new Error('Payment service is not available');
    }
    return await razorpay.payments.fetch(paymentId);
  }

  static async refundPayment(options: RefundOptions) {
    if (!razorpay) {
      throw new Error('Payment service is not available');
    }
    
    const { paymentId, amount, notes } = options;
    
    const refundData: any = {
      speed: 'normal',
      notes
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to paise
    }

    return await razorpay.payments.refund(paymentId, refundData);
  }

  static async fetchRefund(paymentId: string, refundId: string) {
    if (!razorpay) {
      throw new Error('Payment service is not available');
    }
    return await razorpay.payments.fetchRefund(paymentId, refundId);
  }
}