/**
 * Checkout Components
 * 
 * Comprehensive checkout system for Vardhman Mills.
 * Includes guest checkout, registered user checkout, payment processing,
 * address management, order summary, and confirmation components.
 * 
 * @module components/checkout
 * @version 1.0.0
 */

// ============================================================================
// GUEST CHECKOUT COMPONENTS
// ============================================================================

/**
 * Guest Checkout Flow Components
 * Multi-step and quick checkout experiences for guest users
 */
export {
  // Main Flow
  GuestCheckout,
  type CheckoutStep,
  
  // Step Components
  GuestContact,
  type GuestContactData,
  type GuestContactProps,
  
  GuestShipping,
  type ShippingFormData as GuestShippingFormData,
  
  GuestBilling,
  type BillingFormData as GuestBillingFormData,
  
  GuestPayment,
  type PaymentFormData as GuestPaymentFormData,
  
  GuestReview,
  
  // Unified Form
  GuestForm,
  type GuestFormData,
  type GuestFormProps,
  
  // Quick Checkout
  QuickCheckout,
} from './GuestCheckout';

// ============================================================================
// CHECKOUT FORMS (REGISTERED USERS)
// ============================================================================

/**
 * Checkout Forms for Registered Users
 * Forms for billing, shipping, payment, contact, and order review
 */
export {
  BillingForm,
  type BillingFormProps,
  type BillingFormData,
  
  CheckoutForm,
  type CheckoutFormProps,
  type CheckoutData,
  
  ContactForm,
  type ContactFormProps,
  type ContactFormData,
  
  OrderReview,
  type OrderReviewProps,
  
  PaymentForm,
  type PaymentFormProps,
  type PaymentFormData,
  
  ShippingForm,
  type ShippingFormProps,
  type ShippingFormData,
} from './CheckoutForms';

// ============================================================================
// ADDRESS MANAGEMENT
// ============================================================================

/**
 * Address Components
 * Display, select, and manage shipping/billing addresses
 */
export {
  AddressCard,
  type AddressCardProps,
  
  AddressForm,
  type AddressFormProps,
  
  AddressList,
  type AddressListProps,
  
  AddressSelector,
  type AddressSelectorProps,
} from './AddressForms';

// ============================================================================
// CHECKOUT FLOW & NAVIGATION
// ============================================================================

/**
 * Checkout Flow Components
 * Step navigation, progress tracking, and checkout stepper
 */
export {
  CheckoutNavigation,
  type CheckoutNavigationProps,
  
  CheckoutProgress,
  type CheckoutProgressProps,
  
  CheckoutStepper,
  type CheckoutStepperProps,
  type StepHelpers,
  type StepValidationResult,
} from './CheckoutFlow';

// ============================================================================
// PAYMENT METHODS
// ============================================================================

/**
 * Payment Processing Components
 * Support for multiple payment methods and gateways
 * - Credit/Debit Cards (Visa, Mastercard, Amex, RuPay, etc.)
 * - UPI (ID, QR Code, Intent-based)
 * - Net Banking (20+ Indian banks)
 * - Digital Wallets (Paytm, PhonePe, Google Pay, etc.)
 * - Cash on Delivery (COD)
 * - Razorpay Gateway Integration
 */
export {
  // Main Component
  PaymentMethods,
  type PaymentMethodsProps,
  type PaymentSuccessResponse,
  type PaymentError,
  
  // Individual Payment Forms
  CreditCardForm,
  type CreditCardFormProps,
  
  UPIForm,
  type UPIFormProps,
  
  NetBankingForm,
  type NetBankingFormProps,
  
  WalletForm,
  type WalletFormProps,
  
  CODForm,
  type CODFormProps,
  
  // Gateway Integration
  RazorpayButton,
  type RazorpayButtonProps,
} from './PaymentMethods';

// ============================================================================
// ORDER SUMMARY
// ============================================================================

/**
 * Order Summary Components
 * Display cart items, totals, discounts, and order calculations
 */
export {
  OrderItems,
  OrderTotals,
  OrderDiscounts,
  OrderSummary,
} from './OrderSummary';

// ============================================================================
// ORDER CONFIRMATION
// ============================================================================

/**
 * Order Confirmation Component
 * Post-checkout order confirmation and details
 */
export {
  OrderConfirmation,
} from './OrderConfirmation';
