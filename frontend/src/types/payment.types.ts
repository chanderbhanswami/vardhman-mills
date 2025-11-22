import { 
  ID, 
  Timestamp, 
  BaseEntity, 
  Price, 
  Currency, 
  Status
} from './common.types';
import type { User } from './user.types';
import type { Order } from './cart.types';

// Payment Method Types
export interface PaymentMethod extends BaseEntity {
  userId: ID;
  type: PaymentMethodType;
  provider: PaymentProvider;
  
  // Card Details (for card payments)
  cardDetails?: PaymentCard;
  
  // Bank Details (for bank transfers)
  bankDetails?: BankAccount;
  
  // Digital Wallet Details
  walletDetails?: DigitalWallet;
  
  // Status
  isActive: boolean;
  isDefault: boolean;
  isVerified: boolean;
  
  // Security
  fingerprint: string; // unique identifier for the payment method
  
  // Metadata
  nickname?: string;
  lastUsedAt?: Timestamp;
  expiresAt?: Timestamp;
}

export type PaymentMethodType = 
  | 'credit_card'
  | 'debit_card'
  | 'net_banking'
  | 'upi'
  | 'digital_wallet'
  | 'emi'
  | 'cash_on_delivery'
  | 'gift_card'
  | 'store_credit'
  | 'bank_transfer'
  | 'cryptocurrency'
  | 'buy_now_pay_later';

export type PaymentProvider = 
  | 'razorpay'
  | 'stripe'
  | 'paypal'
  | 'payu'
  | 'ccavenue'
  | 'instamojo'
  | 'phonepe'
  | 'googlepay'
  | 'paytm'
  | 'amazon_pay'
  | 'apple_pay'
  | 'samsung_pay'
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'rupay'
  | 'sbi'
  | 'hdfc'
  | 'icici'
  | 'axis'
  | 'kotak';

export interface PaymentCard {
  last4: string;
  brand: CardBrand;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  country?: string;
  issuer?: string;
  cardType: 'credit' | 'debit' | 'prepaid';
  isInternational: boolean;
  issuingBank?: string;
}

export type CardBrand = 
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'diners'
  | 'jcb'
  | 'rupay'
  | 'maestro'
  | 'unionpay';

export interface BankAccount {
  accountNumber: string; // last 4 digits only
  ifscCode: string;
  bankName: string;
  branchName?: string;
  accountHolderName: string;
  accountType: 'savings' | 'current' | 'nri';
}

export interface DigitalWallet {
  walletId: string;
  walletProvider: string;
  phoneNumber?: string;
  email?: string;
  balance?: Price;
}

// Payment Processing
export interface PaymentIntent extends BaseEntity {
  orderId: ID;
  amount: Price;
  currency: Currency;
  
  // Status
  status: PaymentIntentStatus;
  
  // Payment Details
  paymentMethodId?: ID;
  paymentMethod?: PaymentMethod;
  
  // Provider Details
  providerIntentId: string;
  providerDetails: Record<string, string | number | boolean>;
  
  // Processing
  attempts: PaymentAttempt[];
  capturedAmount?: Price;
  refundedAmount?: Price;
  
  // Metadata
  description?: string;
  metadata: Record<string, string>;
  
  // Dates
  confirmedAt?: Timestamp;
  cancelledAt?: Timestamp;
  capturedAt?: Timestamp;
}

export type PaymentIntentStatus = 
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'cancelled'
  | 'succeeded'
  | 'failed';

export interface PaymentAttempt {
  id: ID;
  paymentIntentId: ID;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  amount: Price;
  
  // Error Details
  errorCode?: string;
  errorMessage?: string;
  failureReason?: PaymentFailureReason;
  
  // Provider Response
  providerResponse: Record<string, string | number | boolean>;
  
  // Timestamps
  attemptedAt: Timestamp;
  completedAt?: Timestamp;
}

export type PaymentFailureReason = 
  | 'insufficient_funds'
  | 'card_declined'
  | 'expired_card'
  | 'incorrect_cvc'
  | 'processing_error'
  | 'authentication_required'
  | 'card_not_supported'
  | 'currency_not_supported'
  | 'duplicate_transaction'
  | 'fraud_detected'
  | 'generic_decline'
  | 'incorrect_number'
  | 'invalid_account'
  | 'invalid_amount'
  | 'invalid_cvc'
  | 'invalid_expiry_month'
  | 'invalid_expiry_year'
  | 'issuer_not_available'
  | 'lost_card'
  | 'new_account_information_available'
  | 'no_action_taken'
  | 'not_permitted'
  | 'pickup_card'
  | 'pin_try_exceeded'
  | 'processing_error'
  | 'reenter_transaction'
  | 'restricted_card'
  | 'revocation_of_all_authorizations'
  | 'revocation_of_authorization'
  | 'security_violation'
  | 'service_not_allowed'
  | 'stolen_card'
  | 'stop_payment_order'
  | 'testmode_decline'
  | 'transaction_not_allowed'
  | 'try_again_later'
  | 'withdrawal_count_limit_exceeded';

// EMI (Equated Monthly Installments)
export interface EMIOption {
  id: ID;
  provider: string;
  duration: number; // months
  interestRate: number;
  processingFee: Price;
  emiAmount: Price;
  totalAmount: Price;
  minimumAmount: Price;
  maximumAmount: Price;
  isAvailable: boolean;
  terms?: string;
}

export interface EMIApplication extends BaseEntity {
  orderId: ID;
  userId: ID;
  emiOptionId: ID;
  
  // Application Details
  status: EMIStatus;
  applicationNumber: string;
  
  // Loan Details
  loanAmount: Price;
  duration: number;
  interestRate: number;
  emiAmount: Price;
  
  // Approval
  approvedAmount?: Price;
  approvedDuration?: number;
  approvedEmiAmount?: Price;
  approvedAt?: Timestamp;
  rejectedAt?: Timestamp;
  rejectionReason?: string;
  
  // Documentation
  documents: EMIDocument[];
  
  // Repayment Schedule
  repaymentSchedule: EMIRepayment[];
}

export type EMIStatus = 
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'completed'
  | 'defaulted'
  | 'cancelled';

export interface EMIDocument {
  id: ID;
  type: 'identity_proof' | 'address_proof' | 'income_proof' | 'bank_statement';
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: Timestamp;
  verifiedAt?: Timestamp;
}

export interface EMIRepayment {
  id: ID;
  emiApplicationId: ID;
  installmentNumber: number;
  dueDate: Timestamp;
  amount: Price;
  principalAmount: Price;
  interestAmount: Price;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  paidAt?: Timestamp;
  paidAmount?: Price;
  lateFee?: Price;
}

// Refunds
export interface Refund extends BaseEntity {
  orderId: ID;
  paymentIntentId: ID;
  amount: Price;
  currency: Currency;
  
  // Status
  status: RefundStatus;
  
  // Reason
  reason: RefundReason;
  description?: string;
  
  // Processing
  providerRefundId: string;
  refundMethod: 'original_payment_method' | 'bank_transfer' | 'store_credit';
  
  // Dates
  requestedAt: Timestamp;
  processedAt?: Timestamp;
  completedAt?: Timestamp;
  
  // Metadata
  initiatedBy: ID; // user or admin
  metadata: Record<string, string>;
}

export type RefundStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'requires_action';

export type RefundReason = 
  | 'requested_by_customer'
  | 'duplicate'
  | 'fraudulent'
  | 'order_cancelled'
  | 'product_not_received'
  | 'product_defective'
  | 'product_not_as_described'
  | 'return_approved'
  | 'exchange_approved'
  | 'goodwill'
  | 'chargeback'
  | 'other';

// Gift Cards
export interface GiftCard extends BaseEntity {
  code: string;
  
  // Values
  initialValue: Price;
  currentBalance: Price;
  currency: Currency;
  
  // Status
  status: GiftCardStatus;
  
  // Validity
  expiresAt?: Timestamp;
  isExpired: boolean;
  
  // Purchase Information
  purchasedBy?: ID;
  purchaseOrderId?: ID;
  
  // Recipient
  recipientEmail?: string;
  recipientName?: string;
  personalMessage?: string;
  
  // Design
  design?: GiftCardDesign;
  
  // Usage
  transactions: GiftCardTransaction[];
  
  // Activation
  activatedAt?: Timestamp;
  activationCode?: string;
}

export type GiftCardStatus = 
  | 'pending'
  | 'active'
  | 'partially_used'
  | 'fully_used'
  | 'expired'
  | 'cancelled'
  | 'suspended';

export interface GiftCardDesign {
  id: ID;
  name: string;
  imageUrl: string;
  category: 'birthday' | 'wedding' | 'anniversary' | 'holiday' | 'general';
  isCustom: boolean;
}

export interface GiftCardTransaction {
  id: ID;
  giftCardId: ID;
  type: 'credit' | 'debit' | 'void' | 'refund';
  amount: Price;
  orderId?: ID;
  description: string;
  balanceAfter: Price;
  createdAt: Timestamp;
}

// Store Credit
export interface StoreCredit extends BaseEntity {
  userId: ID;
  
  // Balance
  balance: Price;
  currency: Currency;
  
  // Status
  status: 'active' | 'suspended' | 'expired';
  
  // Validity
  expiresAt?: Timestamp;
  
  // Source
  source: StoreCreditSource;
  sourceOrderId?: ID;
  sourceRefundId?: ID;
  
  // Transactions
  transactions: StoreCreditTransaction[];
}

export type StoreCreditSource = 
  | 'refund'
  | 'return'
  | 'cancellation'
  | 'goodwill'
  | 'loyalty_reward'
  | 'promotion'
  | 'adjustment'
  | 'gift'
  | 'compensation';

export interface StoreCreditTransaction {
  id: ID;
  storeCreditId: ID;
  type: 'credit' | 'debit' | 'adjustment' | 'expiry';
  amount: Price;
  orderId?: ID;
  description: string;
  balanceAfter: Price;
  createdAt: Timestamp;
}

// Coupons and Discounts
export interface Coupon extends BaseEntity {
  // Basic Information
  code: string;
  title: string;
  description?: string;
  
  // Discount Configuration
  discountType: DiscountType;
  discountValue: number;
  maximumDiscount?: Price;
  minimumOrderValue?: Price;
  
  // Usage Limits
  usageLimit?: number; // total usage limit
  usageLimitPerCustomer?: number;
  currentUsageCount: number;
  
  // Validity
  startsAt: Timestamp;
  expiresAt?: Timestamp;
  isActive: boolean;
  
  // Conditions
  conditions: CouponCondition[];
  
  // Applicable Items
  applicableProducts?: ID[];
  applicableCategories?: ID[];
  applicableBrands?: ID[];
  excludedProducts?: ID[];
  excludedCategories?: ID[];
  excludedBrands?: ID[];
  
  // Customer Restrictions
  customerEligibility: CustomerEligibility;
  
  // Marketing
  isPublic: boolean;
  isAutomaticallyApplied: boolean;
  campaignId?: ID;
  
  // Analytics
  usageAnalytics: CouponUsageAnalytics;
}

export type DiscountType = 
  | 'percentage'        // % off
  | 'fixed_amount'      // flat amount off
  | 'free_shipping'     // free shipping
  | 'buy_x_get_y'       // buy X get Y free/discounted
  | 'tiered'            // different discounts for different amounts
  | 'bundle'            // bundle discount
  | 'loyalty_points'    // pay with loyalty points
  | 'cashback';         // cashback offer

export interface CouponCondition {
  type: ConditionType;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'between';
  value: string | number | string[] | number[];
  description: string;
}

export type ConditionType = 
  | 'minimum_amount'
  | 'maximum_amount'
  | 'minimum_quantity'
  | 'customer_group'
  | 'customer_tag'
  | 'product_category'
  | 'product_brand'
  | 'product_tag'
  | 'order_count'
  | 'customer_spent'
  | 'day_of_week'
  | 'time_of_day'
  | 'shipping_method'
  | 'payment_method'
  | 'location';

export interface CustomerEligibility {
  type: 'all' | 'specific_customers' | 'customer_groups' | 'new_customers' | 'returning_customers';
  customerIds?: ID[];
  customerGroups?: string[];
  registrationDateRange?: {
    from?: Timestamp;
    to?: Timestamp;
  };
  totalSpentRange?: {
    min?: number;
    max?: number;
  };
  orderCountRange?: {
    min?: number;
    max?: number;
  };
}

export interface CouponUsageAnalytics {
  totalUsage: number;
  uniqueCustomers: number;
  totalDiscountGiven: Price;
  averageDiscountPerOrder: Price;
  conversionRate: number;
  usageByDate: Array<{
    date: string;
    usage: number;
    discount: Price;
  }>;
  topCustomers: Array<{
    customerId: ID;
    customerName: string;
    usage: number;
    discount: Price;
  }>;
}

export interface CouponUsage extends BaseEntity {
  couponId: ID;
  coupon: Coupon;
  userId: ID;
  user: User;
  orderId: ID;
  order: Order;
  
  // Usage Details
  discountAmount: Price;
  usageCount: number; // nth usage by this customer
  
  // Status
  status: 'applied' | 'used' | 'refunded' | 'cancelled';
  
  // Dates
  appliedAt: Timestamp;
  usedAt?: Timestamp;
  refundedAt?: Timestamp;
}

// Deals and Promotions
export interface Deal extends BaseEntity {
  // Basic Information
  title: string;
  description?: string;
  shortDescription?: string;
  
  // Deal Type
  type: DealType;
  
  // Discount Configuration
  discountType: DiscountType;
  discountValue: number;
  originalPrice?: Price;
  dealPrice?: Price;
  savingsAmount?: Price;
  savingsPercentage?: number;
  
  // Products
  applicableProducts: ID[];
  featuredProductId?: ID;
  
  // Validity
  startsAt: Timestamp;
  expiresAt: Timestamp;
  isActive: boolean;
  
  // Quantity Limits
  stockLimit?: number;
  stockRemaining?: number;
  limitPerCustomer?: number;
  
  // Display
  badge?: string;
  urgencyText?: string;
  featuredImage?: string;
  bannerImage?: string;
  
  // Visibility
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder?: number;
  
  // Analytics
  viewCount: number;
  conversionCount: number;
  conversionRate: number;
  
  // Marketing
  campaignId?: ID;
  promotionCode?: string;
}

export type DealType = 
  | 'flash_sale'
  | 'daily_deal'
  | 'weekend_deal'
  | 'seasonal_sale'
  | 'clearance'
  | 'bulk_discount'
  | 'bundle_deal'
  | 'loyalty_exclusive'
  | 'new_customer_deal'
  | 'category_sale'
  | 'brand_sale'
  | 'limited_time_offer'
  | 'buy_one_get_one'
  | 'early_bird'
  | 'last_chance';

// Payment Analytics
export interface PaymentAnalytics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  totalTransactions: number;
  totalAmount: Price;
  averageTransactionValue: Price;
  
  // Success Rates
  successRate: number;
  failureRate: number;
  
  // Payment Methods
  paymentMethodBreakdown: Array<{
    method: PaymentMethodType;
    count: number;
    amount: Price;
    percentage: number;
  }>;
  
  // Providers
  providerBreakdown: Array<{
    provider: PaymentProvider;
    count: number;
    amount: Price;
    successRate: number;
  }>;
  
  // Failure Analysis
  topFailureReasons: Array<{
    reason: PaymentFailureReason;
    count: number;
    percentage: number;
  }>;
  
  // Geographic Distribution
  geographicBreakdown: Array<{
    country: string;
    state?: string;
    count: number;
    amount: Price;
  }>;
  
  // Trends
  dailyTrends: Array<{
    date: string;
    transactions: number;
    amount: Price;
    successRate: number;
  }>;
  
  // Refunds
  refundMetrics: {
    totalRefunds: number;
    refundAmount: Price;
    refundRate: number;
    averageRefundTime: number; // hours
  };
}

// ===== TYPE USAGE TO AVOID WARNINGS =====
export interface PaymentTypeUsage {
  status: Status;
}
