/**
 * Payment Utilities for Vardhman Mills Frontend
 * Comprehensive payment processing utilities for e-commerce
 */

import { z } from 'zod';
import { toast } from 'react-hot-toast';

// Types and Interfaces
export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet' | 'emi' | 'cod';
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  fees?: number;
  minAmount?: number;
  maxAmount?: number;
  metadata?: Record<string, unknown>;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerInfo: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    sku?: string;
  }>;
  metadata?: Record<string, unknown>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  gatewayResponse?: Record<string, unknown>;
  error?: string;
  timestamp: Date;
}

export interface EMIOption {
  tenure: number;
  monthlyAmount: number;
  totalAmount: number;
  interestRate: number;
  processingFee: number;
  bank: string;
  available: boolean;
}

// Validation Schemas
export const paymentRequestSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  customerInfo: z.object({
    id: z.string().min(1, 'Customer ID is required'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  }),
  shippingAddress: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(3, 'ZIP code is required'),
    country: z.string().min(2, 'Country is required'),
  }),
  items: z.array(z.object({
    id: z.string().min(1, 'Item ID is required'),
    name: z.string().min(1, 'Item name is required'),
    quantity: z.number().positive('Quantity must be positive'),
    price: z.number().positive('Price must be positive'),
  })).min(1, 'At least one item is required'),
});

// Constants
export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'] as const;
export const PAYMENT_STATUSES = ['pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'] as const;

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, Rupay',
    icon: '💳',
    enabled: true,
    fees: 0,
    minAmount: 1,
    maxAmount: 500000,
  },
  {
    id: 'upi',
    type: 'upi',
    name: 'UPI',
    description: 'Pay using UPI apps',
    icon: '📱',
    enabled: true,
    fees: 0,
    minAmount: 1,
    maxAmount: 100000,
  },
  {
    id: 'netbanking',
    type: 'netbanking',
    name: 'Net Banking',
    description: 'All major banks supported',
    icon: '🏦',
    enabled: true,
    fees: 0,
    minAmount: 1,
    maxAmount: 1000000,
  },
  {
    id: 'wallet',
    type: 'wallet',
    name: 'Digital Wallets',
    description: 'Paytm, PhonePe, Amazon Pay',
    icon: '👛',
    enabled: true,
    fees: 0,
    minAmount: 1,
    maxAmount: 50000,
  },
  {
    id: 'emi',
    type: 'emi',
    name: 'EMI',
    description: 'Easy monthly installments',
    icon: '📊',
    enabled: true,
    fees: 199,
    minAmount: 5000,
    maxAmount: 500000,
  },
  {
    id: 'cod',
    type: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when you receive',
    icon: '💵',
    enabled: true,
    fees: 50,
    minAmount: 1,
    maxAmount: 10000,
  },
];

// Utility Functions
export class PaymentUtils {
  /**
   * Format currency amount
   */
  static formatCurrency(amount: number, currency: string = 'INR'): string {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  }

  /**
   * Calculate payment fees
   */
  static calculatePaymentFees(amount: number, paymentMethod: PaymentMethod): number {
    if (!paymentMethod.fees) return 0;
    
    // Fixed fee
    if (typeof paymentMethod.fees === 'number') {
      return paymentMethod.fees;
    }
    
    // Percentage fee (if implemented in future)
    return 0;
  }

  /**
   * Calculate total amount including fees
   */
  static calculateTotalAmount(amount: number, paymentMethod: PaymentMethod): number {
    const fees = this.calculatePaymentFees(amount, paymentMethod);
    return amount + fees;
  }

  /**
   * Validate payment amount
   */
  static validatePaymentAmount(
    amount: number, 
    paymentMethod: PaymentMethod
  ): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }

    if (paymentMethod.minAmount && amount < paymentMethod.minAmount) {
      return { 
        valid: false, 
        error: `Minimum amount for ${paymentMethod.name} is ${this.formatCurrency(paymentMethod.minAmount)}` 
      };
    }

    if (paymentMethod.maxAmount && amount > paymentMethod.maxAmount) {
      return { 
        valid: false, 
        error: `Maximum amount for ${paymentMethod.name} is ${this.formatCurrency(paymentMethod.maxAmount)}` 
      };
    }

    return { valid: true };
  }

  /**
   * Get available payment methods for amount
   */
  static getAvailablePaymentMethods(amount: number): PaymentMethod[] {
    return PAYMENT_METHODS.filter(method => {
      if (!method.enabled) return false;
      
      const validation = this.validatePaymentAmount(amount, method);
      return validation.valid;
    });
  }

  /**
   * Generate EMI options
   */
  static generateEMIOptions(amount: number): EMIOption[] {
    const baseAmount = amount;
    const options: EMIOption[] = [];

    // Common EMI tenures (months)
    const tenures = [3, 6, 9, 12, 18, 24];
    const banks = ['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak'];

    tenures.forEach(tenure => {
      banks.forEach(bank => {
        // Sample interest rates (vary by bank and tenure)
        const interestRate = this.getInterestRate(bank, tenure);
        const processingFee = Math.floor(amount * 0.02); // 2% processing fee
        
        const monthlyInterest = interestRate / (12 * 100);
        const emi = (baseAmount * monthlyInterest * Math.pow(1 + monthlyInterest, tenure)) / 
                   (Math.pow(1 + monthlyInterest, tenure) - 1);
        
        const totalAmount = (emi * tenure) + processingFee;
        
        options.push({
          tenure,
          monthlyAmount: Math.round(emi),
          totalAmount: Math.round(totalAmount),
          interestRate,
          processingFee,
          bank,
          available: amount >= 5000 && amount <= 500000, // EMI eligibility
        });
      });
    });

    return options.filter(option => option.available);
  }

  /**
   * Get interest rate based on bank and tenure
   */
  private static getInterestRate(bank: string, tenure: number): number {
    const rates: Record<string, Record<number, number>> = {
      'HDFC': { 3: 12, 6: 13, 9: 14, 12: 15, 18: 16, 24: 17 },
      'ICICI': { 3: 12.5, 6: 13.5, 9: 14.5, 12: 15.5, 18: 16.5, 24: 17.5 },
      'SBI': { 3: 11.5, 6: 12.5, 9: 13.5, 12: 14.5, 18: 15.5, 24: 16.5 },
      'Axis': { 3: 13, 6: 14, 9: 15, 12: 16, 18: 17, 24: 18 },
      'Kotak': { 3: 12.5, 6: 13.5, 9: 14.5, 12: 15.5, 18: 16.5, 24: 17.5 },
    };

    return rates[bank]?.[tenure] || 15; // Default rate
  }

  /**
   * Validate payment request
   */
  static validatePaymentRequest(request: PaymentRequest): { valid: boolean; errors: string[] } {
    try {
      paymentRequestSchema.parse(request);
      
      const errors: string[] = [];
      
      // Additional business logic validations
      if (request.items.length === 0) {
        errors.push('Order must contain at least one item');
      }

      const calculatedAmount = request.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      
      if (Math.abs(calculatedAmount - request.amount) > 0.01) {
        errors.push('Order amount does not match item totals');
      }

      return { valid: errors.length === 0, errors };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          valid: false, 
          errors: error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`) 
        };
      }
      return { valid: false, errors: ['Invalid payment request'] };
    }
  }

  /**
   * Generate order receipt
   */
  static generateOrderReceipt(paymentResponse: PaymentResponse): string {
    const receiptData = {
      orderId: paymentResponse.orderId,
      paymentId: paymentResponse.paymentId,
      amount: paymentResponse.amount,
      currency: paymentResponse.currency,
      status: paymentResponse.status,
      timestamp: paymentResponse.timestamp.toISOString(),
    };

    return btoa(JSON.stringify(receiptData));
  }

  /**
   * Parse order receipt
   */
  static parseOrderReceipt(receipt: string): PaymentResponse | null {
    try {
      const data = JSON.parse(atob(receipt));
      return {
        ...data,
        timestamp: new Date(data.timestamp),
      };
    } catch {
      return null;
    }
  }

  /**
   * Handle payment success
   */
  static handlePaymentSuccess(response: PaymentResponse): void {
    toast.success(`Payment successful! Order ID: ${response.orderId}`);
    
    // Store payment info in localStorage for order tracking
    const paymentInfo = {
      orderId: response.orderId,
      paymentId: response.paymentId,
      amount: response.amount,
      timestamp: response.timestamp,
    };
    
    localStorage.setItem(`payment_${response.orderId}`, JSON.stringify(paymentInfo));
  }

  /**
   * Handle payment failure
   */
  static handlePaymentFailure(response: PaymentResponse): void {
    toast.error(`Payment failed: ${response.error || 'Unknown error'}`);
    
    // Log error for debugging
    console.error('Payment failed:', response);
  }

  /**
   * Get payment status color
   */
  static getPaymentStatusColor(status: string): string {
    const colors = {
      pending: 'orange',
      processing: 'blue',
      success: 'green',
      failed: 'red',
      cancelled: 'gray',
      refunded: 'purple',
    };
    return colors[status as keyof typeof colors] || 'gray';
  }

  /**
   * Get payment method icon
   */
  static getPaymentMethodIcon(type: string): string {
    const icons = {
      card: '💳',
      upi: '📱',
      netbanking: '🏦',
      wallet: '👛',
      emi: '📊',
      cod: '💵',
    };
    return icons[type as keyof typeof icons] || '💰';
  }

  /**
   * Format phone number for payment gateway
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    
    return phone;
  }

  /**
   * Check if payment method supports refunds
   */
  static supportsRefund(paymentMethod: string): boolean {
    const refundSupportedMethods = ['card', 'upi', 'netbanking', 'wallet'];
    return refundSupportedMethods.includes(paymentMethod);
  }

  /**
   * Calculate refund amount (considering fees)
   */
  static calculateRefundAmount(originalAmount: number, paymentMethod: string): number {
    // COD refunds might have processing fees deducted
    if (paymentMethod === 'cod') {
      return Math.max(0, originalAmount - 50); // Deduct COD fee
    }
    
    return originalAmount;
  }

  /**
   * Generate payment tracking ID
   */
  static generateTrackingId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `VM_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Mask sensitive payment data
   */
  static maskPaymentData(data: Record<string, unknown>): Record<string, unknown> {
    const masked = { ...data };
    
    // Mask card number
    if (masked.cardNumber && typeof masked.cardNumber === 'string') {
      masked.cardNumber = masked.cardNumber.replace(/\d(?=\d{4})/g, '*');
    }
    
    // Mask CVV
    if (masked.cvv) {
      masked.cvv = '***';
    }
    
    // Remove sensitive fields
    delete masked.cardExpiry;
    delete masked.pin;
    delete masked.otp;
    
    return masked;
  }
}

export default PaymentUtils;