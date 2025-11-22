/**
 * Payment Constants - Vardhman Mills Frontend
 * Contains payment-related configuration and constants
 */

// Payment Methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  NET_BANKING: 'net_banking',
  UPI: 'upi',
  WALLET: 'wallet',
  COD: 'cod',
  EMI: 'emi',
  BANK_TRANSFER: 'bank_transfer',
} as const;

// Card Types
export const CARD_TYPES = {
  VISA: 'visa',
  MASTERCARD: 'mastercard',
  AMEX: 'amex',
  DISCOVER: 'discover',
  RUPAY: 'rupay',
  MAESTRO: 'maestro',
} as const;

// Payment Gateways
export const PAYMENT_GATEWAYS = {
  RAZORPAY: 'razorpay',
  STRIPE: 'stripe',
  PAYU: 'payu',
  PAYTM: 'paytm',
  PHONEPE: 'phonepe',
  GPAY: 'gpay',
  CCAvenue: 'ccavenue',
} as const;

// Currency
export const CURRENCIES = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    decimals: 2,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimals: 2,
  },
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
  DISPUTED: 'disputed',
} as const;

// Refund Types
export const REFUND_TYPES = {
  FULL: 'full',
  PARTIAL: 'partial',
  STORE_CREDIT: 'store_credit',
} as const;

// Refund Status
export const REFUND_STATUS = {
  REQUESTED: 'requested',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// EMI Tenures
export const EMI_TENURES = {
  3: { months: 3, label: '3 Months' },
  6: { months: 6, label: '6 Months' },
  9: { months: 9, label: '9 Months' },
  12: { months: 12, label: '12 Months' },
  18: { months: 18, label: '18 Months' },
  24: { months: 24, label: '24 Months' },
} as const;

// Payment Limits
export const PAYMENT_LIMITS = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 200000,
  COD_MAX_AMOUNT: 5000,
  UPI_MAX_AMOUNT: 100000,
  WALLET_MAX_AMOUNT: 50000,
  EMI_MIN_AMOUNT: 3000,
} as const;

// Payment Configuration
export const PAYMENT_CONFIG = {
  RAZORPAY: {
    KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    CURRENCY: 'INR',
    TIMEOUT: 300, // 5 minutes
    RETRY_ATTEMPTS: 3,
  },
  STRIPE: {
    PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    CURRENCY: 'USD',
    TIMEOUT: 300,
    RETRY_ATTEMPTS: 3,
  },
  COD: {
    ENABLED: true,
    CHARGES: 50,
    AVAILABLE_CITIES: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
  },
} as const;

// Tax Configuration
export const TAX_CONFIG = {
  GST: {
    ENABLED: true,
    RATE: 0.18, // 18%
    THRESHOLD: 0, // Apply to all orders
  },
  SERVICE_TAX: {
    ENABLED: false,
    RATE: 0.15,
  },
} as const;

// Discount Types
export const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
  FREE_SHIPPING: 'free_shipping',
  BUY_ONE_GET_ONE: 'bogo',
} as const;

// Coupon Types
export const COUPON_TYPES = {
  WELCOME: 'welcome',
  SEASONAL: 'seasonal',
  CLEARANCE: 'clearance',
  LOYALTY: 'loyalty',
  REFERRAL: 'referral',
  CART_ABANDONMENT: 'cart_abandonment',
} as const;

// Payment Error Codes
export const PAYMENT_ERROR_CODES = {
  CARD_DECLINED: 'CARD_DECLINED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  EXPIRED_CARD: 'EXPIRED_CARD',
  INVALID_CVV: 'INVALID_CVV',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CANCELLED_BY_USER: 'CANCELLED_BY_USER',
} as const;

// Billing Address Fields
export const BILLING_FIELDS = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  EMAIL: 'email',
  PHONE: 'phone',
  ADDRESS_LINE_1: 'addressLine1',
  ADDRESS_LINE_2: 'addressLine2',
  CITY: 'city',
  STATE: 'state',
  POSTAL_CODE: 'postalCode',
  COUNTRY: 'country',
} as const;

// Payment Security
export const PAYMENT_SECURITY = {
  PCI_COMPLIANCE: true,
  SSL_REQUIRED: true,
  TOKENIZATION: true,
  FRAUD_DETECTION: true,
  TWO_FACTOR_AUTH: false,
} as const;

export type PaymentMethods = typeof PAYMENT_METHODS;
export type PaymentStatus = typeof PAYMENT_STATUS;
export type PaymentGateways = typeof PAYMENT_GATEWAYS;
export type CardTypes = typeof CARD_TYPES;
export type RefundTypes = typeof REFUND_TYPES;