/**
 * Legal Components Export Hub
 * 
 * Central export file for all legal-related components including common components,
 * policy pages, terms and conditions, and legal utilities.
 * Organized by category for easy navigation and imports.
 */

// ============================================================================
// Common Legal Components
// ============================================================================

export { 
  LegalCard,
  LegalLayout,
  LegalSidebar
} from './common';

export type {
  LegalSection,
  LegalSubsection,
  LegalDocument,
  LegalNavItem,
  LegalCardProps,
  LegalLayoutProps,
  LegalSidebarProps
} from './common';

// Common utility functions and constants
export {
  formatDate,
  generateTableOfContents,
  scrollToSection,
  LEGAL_CATEGORIES,
  LEGAL_STATUS
} from './common';

// ============================================================================
// Cookie Policy Components
// ============================================================================

export { CookiePolicyContent } from './cookie-policy';

export type {
  CookieCategory,
  CookieDetail,
  CookieConsent,
  CookiePolicyData
} from './cookie-policy';

// Cookie management utilities
export {
  getCookieConsent,
  setCookieConsent,
  clearCookieConsent,
  deleteCookie,
  deleteAllCookies,
  defaultCookiePolicyData
} from './cookie-policy';

// ============================================================================
// Privacy Policy Components
// ============================================================================

export { PrivacyPolicyContent } from './privacy-policy';

export type {
  DataCategory,
  DataRight,
  PrivacySection,
  PrivacySubsection,
  PrivacyPolicyData
} from './privacy-policy';

// Privacy policy utilities
export {
  formatDataRetention,
  getLawfulBasisDescription,
  defaultPrivacyPolicyData
} from './privacy-policy';

// ============================================================================
// Return Policy Components
// ============================================================================

export { ReturnPolicyContent } from './return-policy';

export type {
  ReturnTimeframe,
  ReturnCondition,
  ReturnProcess,
  RefundMethod,
  ReturnCategory,
  ReturnPolicyData
} from './return-policy';

// Return policy utilities
export {
  getReturnEligibility,
  formatReturnTimeframe,
  defaultReturnPolicyData
} from './return-policy';

// ============================================================================
// Shipping Policy Components
// ============================================================================

export { ShippingPolicyContent } from './shipping-policy';

export type {
  ShippingZone,
  ShippingOption,
  DeliveryTimeframe,
  ShippingRestriction,
  PackagingInfo,
  ShippingPolicyData
} from './shipping-policy';

// Shipping policy utilities
export {
  calculateShippingCost,
  getDeliveryEstimate,
  formatShippingCost,
  defaultShippingPolicyData
} from './shipping-policy';

// ============================================================================
// Terms & Conditions Components
// ============================================================================

export { TermsConditionsContent } from './terms-conditions';

export type {
  TermsSection,
  TermsSubsection,
  LegalDefinition,
  UserObligation,
  ServiceLimitation,
  DisputeResolution,
  TermsConditionsData
} from './terms-conditions';

// Terms & conditions utilities
export {
  getSectionImportanceColor,
  getSectionImportanceIcon,
  formatLegalDate,
  generateTermsAcceptanceRecord,
  defaultTermsConditionsData
} from './terms-conditions';

// ============================================================================
// Animation Utilities
// ============================================================================

export {
  defaultTransition,
  itemTransition,
  staggerTransition,
  animations,
  hoverAnimations,
  staggerConfig
} from './animations';
