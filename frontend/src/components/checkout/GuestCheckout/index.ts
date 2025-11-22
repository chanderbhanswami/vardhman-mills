/**
 * Guest Checkout Components
 * 
 * Complete guest checkout flow with step-by-step components and quick checkout.
 * Supports multi-step checkout process and streamlined quick checkout experience.
 * 
 * @module components/checkout/GuestCheckout
 * @version 1.0.0
 */

// ============================================================================
// MAIN GUEST CHECKOUT FLOW
// ============================================================================

/**
 * Main Guest Checkout Component
 * Multi-step checkout flow for guest users (contact → shipping → billing → payment → review)
 */
export { GuestCheckout, type CheckoutStep } from './GuestCheckout';
export type { default as GuestCheckoutType } from './GuestCheckout';

// ============================================================================
// INDIVIDUAL STEP COMPONENTS
// ============================================================================

/**
 * Guest Contact Information Component
 * Collects guest contact details, communication preferences, and optional account creation
 */
export { 
  GuestContact, 
  type GuestContactData,
  type GuestContactProps 
} from './GuestContact';
export { default as GuestContactComponent } from './GuestContact';

/**
 * Guest Shipping Information Component
 * Collects shipping address, method selection, delivery instructions, and gift options
 */
export { 
  GuestShipping, 
  type ShippingFormData,
  type ShippingFormData as GuestShippingData 
} from './GuestShipping';

/**
 * Guest Billing Information Component
 * Collects billing address with option to use shipping address, company info, and tax ID
 */
export { 
  GuestBilling, 
  type BillingFormData,
  type BillingFormData as GuestBillingData 
} from './GuestBilling';

/**
 * Guest Payment Information Component
 * Supports multiple payment methods: card, UPI, net banking, wallet, EMI, and COD
 */
export { 
  GuestPayment, 
  type PaymentFormData,
  type PaymentFormData as GuestPaymentData 
} from './GuestPayment';

/**
 * Guest Order Review Component
 * Final review step showing all order details, terms acceptance, and order placement
 */
export { 
  GuestReview 
} from './GuestReview';

// ============================================================================
// UNIFIED GUEST FORM
// ============================================================================

/**
 * Unified Guest Form Component
 * Single-page form combining all guest checkout information
 * Alternative to multi-step checkout flow
 */
export { 
  GuestForm, 
  type GuestFormData, 
  type GuestFormProps 
} from './GuestForm';
export { default as GuestFormComponent } from './GuestForm';

// ============================================================================
// QUICK CHECKOUT
// ============================================================================

/**
 * Quick Checkout Component
 * Streamlined single-page checkout for faster guest purchases
 * Minimal fields with essential information only
 */
export { 
  QuickCheckout 
} from './QuickCheckout';
export { default as QuickCheckoutComponent } from './QuickCheckout';
