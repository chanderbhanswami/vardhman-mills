/**
 * Razorpay Payment Gateway Configuration
 * Comprehensive payment processing configuration
 * @module config/razorpay
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RazorpayConfig {
  enabled: boolean;
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  options: RazorpayOptions;
  features: PaymentFeatures;
  methods: PaymentMethods;
  currency: CurrencyConfig;
  limits: PaymentLimits;
  checkout: CheckoutConfig;
  webhooks: WebhookConfig;
  refunds: RefundConfig;
  settlements: SettlementConfig;
}

export interface RazorpayOptions {
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  capture: 'automatic' | 'manual';
  captureDelay: number;
  testMode: boolean;
}

export interface PaymentFeatures {
  cards: boolean;
  netbanking: boolean;
  upi: boolean;
  wallets: boolean;
  emi: boolean;
  cardlessEmi: boolean;
  paylater: boolean;
  recurring: boolean;
  international: boolean;
  savedCards: boolean;
  offers: boolean;
  refunds: boolean;
  partialRefunds: boolean;
}

export interface PaymentMethods {
  cards: CardConfig;
  netbanking: NetbankingConfig;
  upi: UPIConfig;
  wallets: WalletConfig;
  emi: EMIConfig;
  paylater: PaylaterConfig;
}

export interface CardConfig {
  enabled: boolean;
  types: {
    credit: boolean;
    debit: boolean;
    prepaid: boolean;
  };
  networks: string[];
  saveCard: boolean;
  cvvRequired: boolean;
}

export interface NetbankingConfig {
  enabled: boolean;
  banks: string[];
  popular: string[];
}

export interface UPIConfig {
  enabled: boolean;
  apps: string[];
  flow: 'collect' | 'intent' | 'qr' | 'auto';
  timeout: number;
}

export interface WalletConfig {
  enabled: boolean;
  providers: string[];
}

export interface EMIConfig {
  enabled: boolean;
  providers: string[];
  minAmount: number;
  tenures: number[];
  subvention: 'customer' | 'merchant';
}

export interface PaylaterConfig {
  enabled: boolean;
  providers: string[];
  minAmount: number;
  maxAmount: number;
}

export interface CurrencyConfig {
  default: string;
  supported: string[];
  precision: number;
  symbol: string;
  position: 'before' | 'after';
}

export interface PaymentLimits {
  minAmount: number;
  maxAmount: number;
  refundWindow: number;
  captureWindow: number;
  settlementCycle: number;
}

export interface CheckoutConfig {
  theme: {
    color: string;
    backdrop_color?: string;
  };
  modal: {
    backdropclose: boolean;
    escape: boolean;
    handleback: boolean;
    animation: boolean;
  };
  readonly: {
    email: boolean;
    contact: boolean;
    name: boolean;
  };
  prefill: {
    email: boolean;
    contact: boolean;
    name: boolean;
    method: boolean;
  };
  remember_customer: boolean;
  config: {
    display: {
      language: string;
      blocks: {
        banks: {
          name: string;
          instruments: Array<{
            method: string;
            flows?: string[];
            banks?: string[];
            wallets?: string[];
          }>;
        };
      };
    };
  };
}

export interface WebhookConfig {
  enabled: boolean;
  url: string;
  secret: string;
  events: string[];
  retryAttempts: number;
  retryDelay: number;
}

export interface RefundConfig {
  enabled: boolean;
  automatic: boolean;
  partialRefunds: boolean;
  instantRefunds: boolean;
  refundSpeed: 'normal' | 'optimum';
  processingTime: {
    cards: number;
    netbanking: number;
    upi: number;
    wallets: number;
  };
}

export interface SettlementConfig {
  enabled: boolean;
  schedule: 'daily' | 'weekly' | 'monthly' | 'custom';
  delay: number;
  holdPeriod: number;
  bankAccount: {
    enabled: boolean;
    verificationRequired: boolean;
  };
}

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxx';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ============================================================================
// MAIN CONFIGURATION
// ============================================================================

export const razorpayConfig: RazorpayConfig = {
  enabled: true,
  keyId: RAZORPAY_KEY_ID,
  keySecret: RAZORPAY_KEY_SECRET,
  webhookSecret: RAZORPAY_WEBHOOK_SECRET,

  // Razorpay Options
  options: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 2000, // 2 seconds
    capture: 'automatic',
    captureDelay: 0,
    testMode: !IS_PRODUCTION,
  },

  // Payment Features
  features: {
    cards: true,
    netbanking: true,
    upi: true,
    wallets: true,
    emi: true,
    cardlessEmi: true,
    paylater: true,
    recurring: false, // Subscriptions
    international: false, // International payments
    savedCards: true,
    offers: true,
    refunds: true,
    partialRefunds: true,
  },

  // Payment Methods Configuration
  methods: {
    // Card Payments
    cards: {
      enabled: true,
      types: {
        credit: true,
        debit: true,
        prepaid: true,
      },
      networks: ['Visa', 'Mastercard', 'RuPay', 'Maestro', 'American Express'],
      saveCard: true,
      cvvRequired: true,
    },

    // Net Banking
    netbanking: {
      enabled: true,
      banks: [
        'HDFC',
        'ICICI',
        'SBI',
        'AXIS',
        'YES',
        'KOTAK',
        'PNB',
        'BOB',
        'BOI',
        'IDBI',
        'UNION',
        'CANARA',
        'INDUSIND',
        'FEDERAL',
        'RBL',
        'SCBL',
        'CITI',
        'HSBC',
      ],
      popular: ['HDFC', 'ICICI', 'SBI', 'AXIS', 'YES', 'KOTAK'],
    },

    // UPI Payments
    upi: {
      enabled: true,
      apps: ['GooglePay', 'PhonePe', 'Paytm', 'BHIM', 'WhatsApp', 'AmazonPay'],
      flow: 'auto', // auto, collect, intent, qr
      timeout: 300000, // 5 minutes
    },

    // Wallet Payments
    wallets: {
      enabled: true,
      providers: [
        'paytm',
        'phonepe',
        'amazonpay',
        'airtel',
        'freecharge',
        'jiomoney',
        'mobikwik',
        'olamoney',
      ],
    },

    // EMI Options
    emi: {
      enabled: true,
      providers: ['HDFC', 'ICICI', 'KOTAK', 'INDUSIND', 'RBL', 'BAJAJ'],
      minAmount: 500000, // ₹5,000 in paise
      tenures: [3, 6, 9, 12, 18, 24],
      subvention: 'customer', // customer or merchant pays interest
    },

    // Cardless EMI / Pay Later
    paylater: {
      enabled: true,
      providers: ['lazypay', 'simpl', 'zestmoney', 'flexmoney', 'walnut369'],
      minAmount: 300000, // ₹3,000 in paise
      maxAmount: 6000000, // ₹60,000 in paise
    },
  },

  // Currency Configuration
  currency: {
    default: 'INR',
    supported: ['INR', 'USD', 'EUR', 'GBP'],
    precision: 2,
    symbol: '₹',
    position: 'before',
  },

  // Payment Limits
  limits: {
    minAmount: 100, // ₹1 in paise
    maxAmount: 10000000, // ₹1,00,000 in paise
    refundWindow: 180 * 24 * 60 * 60, // 180 days in seconds
    captureWindow: 5 * 24 * 60 * 60, // 5 days in seconds
    settlementCycle: 1, // T+1 days
  },

  // Checkout Configuration
  checkout: {
    theme: {
      color: '#3B82F6', // Primary brand color
      backdrop_color: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
      backdropclose: false, // Allow closing on backdrop click
      escape: true, // Allow closing on ESC key
      handleback: true, // Handle browser back button
      animation: true,
    },
    readonly: {
      email: false,
      contact: false,
      name: false,
    },
    prefill: {
      email: true,
      contact: true,
      name: true,
      method: false,
    },
    remember_customer: true,
    config: {
      display: {
        language: 'en',
        blocks: {
          banks: {
            name: 'Most Used Methods',
            instruments: [
              {
                method: 'upi',
              },
              {
                method: 'card',
              },
              {
                method: 'netbanking',
                banks: ['HDFC', 'ICICI', 'SBI', 'AXIS'],
              },
              {
                method: 'wallet',
                wallets: ['paytm', 'phonepe'],
              },
            ],
          },
        },
      },
    },
  },

  // Webhook Configuration
  webhooks: {
    enabled: true,
    url: `${APP_URL}/api/webhooks/razorpay`,
    secret: RAZORPAY_WEBHOOK_SECRET,
    events: [
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
      'settlement.processed',
    ],
    retryAttempts: 5,
    retryDelay: 300, // 5 minutes
  },

  // Refund Configuration
  refunds: {
    enabled: true,
    automatic: false,
    partialRefunds: true,
    instantRefunds: true,
    refundSpeed: 'optimum', // normal or optimum
    processingTime: {
      cards: 5, // 5-7 business days
      netbanking: 5,
      upi: 1, // Instant
      wallets: 1, // Instant
    },
  },

  // Settlement Configuration
  settlements: {
    enabled: true,
    schedule: 'daily',
    delay: 1, // T+1 days
    holdPeriod: 0, // No hold period
    bankAccount: {
      enabled: true,
      verificationRequired: true,
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert amount to paise (smallest currency unit)
 */
export const toPaise = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Convert paise to rupees
 */
export const toRupees = (paise: number): number => {
  return paise / 100;
};

/**
 * Format amount for display
 */
export const formatAmount = (amount: number, includeCurrency: boolean = true): string => {
  const rupees = typeof amount === 'number' && amount > 1000 ? toRupees(amount) : amount;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);

  return includeCurrency ? `₹${formatted}` : formatted;
};

/**
 * Build Razorpay checkout options
 */
export const buildCheckoutOptions = (options: {
  orderId: string;
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  callback_url?: string;
  redirect?: boolean;
}) => ({
  key: razorpayConfig.keyId,
  order_id: options.orderId,
  amount: options.amount,
  currency: options.currency || razorpayConfig.currency.default,
  name: options.name || 'Vardhman Mills',
  description: options.description || 'Order Payment',
  image: options.image || '/logo.png',
  prefill: {
    name: options.prefill?.name || '',
    email: options.prefill?.email || '',
    contact: options.prefill?.contact || '',
  },
  notes: options.notes || {},
  theme: razorpayConfig.checkout.theme,
  modal: razorpayConfig.checkout.modal,
  readonly: razorpayConfig.checkout.readonly,
  remember_customer: razorpayConfig.checkout.remember_customer,
  config: razorpayConfig.checkout.config,
  callback_url: options.callback_url,
  redirect: options.redirect || false,
});

/**
 * Validate payment amount
 */
export const isValidAmount = (amount: number): { valid: boolean; error?: string } => {
  const amountInPaise = amount > 1000 ? amount : toPaise(amount);

  if (amountInPaise < razorpayConfig.limits.minAmount) {
    return {
      valid: false,
      error: `Minimum amount is ${formatAmount(razorpayConfig.limits.minAmount)}`,
    };
  }

  if (amountInPaise > razorpayConfig.limits.maxAmount) {
    return {
      valid: false,
      error: `Maximum amount is ${formatAmount(razorpayConfig.limits.maxAmount)}`,
    };
  }

  return { valid: true };
};

/**
 * Get payment method details
 */
export const getPaymentMethod = (method: string) => {
  const methodMap: Record<string, string> = {
    card: 'Card',
    netbanking: 'Net Banking',
    upi: 'UPI',
    wallet: 'Wallet',
    emi: 'EMI',
    cardless_emi: 'Cardless EMI',
    paylater: 'Pay Later',
  };

  return methodMap[method] || method;
};

/**
 * Verify payment signature
 */
export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  if (typeof window !== 'undefined') {
    throw new Error('verifyPaymentSignature should only be called server-side');
  }

  // Dynamic import for Node.js crypto module
  const crypto = eval('require')('crypto');
  const generatedSignature = crypto
    .createHmac('sha256', razorpayConfig.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

/**
 * Verify webhook signature
 */
export const verifyWebhookSignature = (
  payload: string,
  signature: string
): boolean => {
  if (typeof window !== 'undefined') {
    throw new Error('verifyWebhookSignature should only be called server-side');
  }

  // Dynamic import for Node.js crypto module
  const crypto = eval('require')('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', razorpayConfig.webhookSecret)
    .update(payload)
    .digest('hex');

  return expectedSignature === signature;
};

/**
 * Get EMI details
 */
export const getEMIDetails = (amount: number, tenure: number, rate: number = 0) => {
  const principal = toRupees(amount);
  const monthlyRate = rate / 12 / 100;
  
  let emi: number;
  if (rate === 0) {
    emi = principal / tenure;
  } else {
    emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
          (Math.pow(1 + monthlyRate, tenure) - 1);
  }

  const totalAmount = emi * tenure;
  const interestAmount = totalAmount - principal;

  return {
    emi: Math.round(emi * 100) / 100,
    tenure,
    principal,
    interestAmount: Math.round(interestAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
};

/**
 * Get refund processing time
 */
export const getRefundProcessingTime = (method: string): number => {
  const methodKey = method.toLowerCase() as keyof typeof razorpayConfig.refunds.processingTime;
  return razorpayConfig.refunds.processingTime[methodKey] || 5;
};

/**
 * Check if method is enabled
 */
export const isPaymentMethodEnabled = (method: string): boolean => {
  return razorpayConfig.features[method as keyof typeof razorpayConfig.features] === true;
};

/**
 * Get available payment methods
 */
export const getAvailablePaymentMethods = () => {
  const methods = [];

  if (razorpayConfig.features.cards) methods.push('card');
  if (razorpayConfig.features.netbanking) methods.push('netbanking');
  if (razorpayConfig.features.upi) methods.push('upi');
  if (razorpayConfig.features.wallets) methods.push('wallet');
  if (razorpayConfig.features.emi) methods.push('emi');
  if (razorpayConfig.features.cardlessEmi || razorpayConfig.features.paylater) {
    methods.push('paylater');
  }

  return methods;
};

/**
 * Check if Razorpay is configured
 */
export const isRazorpayConfigured = (): boolean => {
  return !!(
    razorpayConfig.enabled &&
    razorpayConfig.keyId &&
    razorpayConfig.keySecret &&
    razorpayConfig.keyId !== 'rzp_test_xxxxxxxx'
  );
};

/**
 * Get test card details
 */
export const getTestCards = () => ({
  success: {
    number: '4111 1111 1111 1111',
    cvv: '123',
    expiry: '12/25',
    name: 'Test Card',
  },
  failure: {
    number: '4000 0000 0000 0002',
    cvv: '123',
    expiry: '12/25',
    name: 'Test Card',
  },
});

/**
 * Generate order receipt ID
 */
export const generateReceiptId = (prefix: string = 'order'): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Get payment status badge color
 */
export const getPaymentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    created: 'gray',
    authorized: 'blue',
    captured: 'green',
    refunded: 'yellow',
    failed: 'red',
    pending: 'orange',
  };

  return colors[status] || 'gray';
};

// ============================================================================
// PAYMENT STATUS CONSTANTS
// ============================================================================

export const PAYMENT_STATUS = {
  CREATED: 'created',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  REFUNDED: 'refunded',
  FAILED: 'failed',
  PENDING: 'pending',
} as const;

export const PAYMENT_METHOD = {
  CARD: 'card',
  NETBANKING: 'netbanking',
  UPI: 'upi',
  WALLET: 'wallet',
  EMI: 'emi',
  PAYLATER: 'paylater',
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export default razorpayConfig;

export {
  RAZORPAY_KEY_ID,
  NODE_ENV,
  IS_PRODUCTION,
};
