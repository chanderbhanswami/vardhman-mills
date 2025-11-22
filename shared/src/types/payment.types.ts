export interface RazorpayOrderRequest {
  amount: number;
  orderId: string;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

export interface PaymentStatusResponse {
  paymentStatus: PaymentInfo['status'];
  paymentMethod: PaymentInfo['method'];
  transactionId?: string;
  paidAt?: Date;
}

export interface RefundRequest {
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  refundId: string;
  refundAmount: number;
}