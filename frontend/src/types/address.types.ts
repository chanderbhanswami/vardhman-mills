import { 
  ID, 
  Timestamp, 
  BaseEntity 
} from './common.types';

// Simple Address Type for pages (compatible with component props)
export interface Address {
  id: string;
  type: AddressType;
  isDefault: boolean;
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  landmark?: string;
  instructions?: string;
}

// Address Management Types
export interface AddressBook {
  userId: ID;
  addresses: UserAddress[];
  defaultShippingAddressId?: ID;
  defaultBillingAddressId?: ID;
}

export interface UserAddress extends BaseEntity {
  userId: ID;
  
  // Address Type
  type: AddressType;
  label?: string;
  
  // Contact Information
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  email?: string;
  
  // Address Details
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
  
  // Preferences
  isDefault: boolean;
  isVerified: boolean;
  
  // Usage Tracking
  lastUsedAt?: Timestamp;
  usageCount: number;
  
  // Delivery Instructions
  deliveryInstructions?: string;
  specialInstructions?: string;
  
  // Validation
  validationStatus: AddressValidationStatus;
  validationNotes?: string;
}

export type AddressType = 
  | 'home'
  | 'office'
  | 'work'
  | 'apartment'
  | 'business'
  | 'po_box'
  | 'hotel'
  | 'other';

export type AddressValidationStatus = 
  | 'valid'
  | 'invalid'
  | 'unverified'
  | 'requires_correction'
  | 'delivery_failed';

export interface AddressForm {
  type: AddressType;
  label?: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
  isDefault: boolean;
  deliveryInstructions?: string;
  specialInstructions?: string;
}

// Address Validation and Suggestions
export interface AddressValidationResult {
  isValid: boolean;
  suggestions: AddressSuggestion[];
  errors: AddressValidationError[];
  warnings: AddressValidationWarning[];
  standardizedAddress?: UserAddress;
}

export interface AddressSuggestion {
  id: string;
  address: Partial<UserAddress>;
  confidence: number;
  type: 'exact_match' | 'close_match' | 'partial_match';
  provider: 'google' | 'postal_service' | 'internal';
}

export interface AddressValidationError {
  field: keyof UserAddress;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface AddressValidationWarning {
  field: keyof UserAddress;
  code: string;
  message: string;
  suggestion?: string;
}

// Location and Geolocation
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: Timestamp;
}

export interface LocationInfo {
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  city: string;
  postalCode: string;
  coordinates?: GeoLocation;
  timezone?: string;
}

// Delivery Area and Serviceability
export interface DeliveryArea {
  id: ID;
  name: string;
  type: 'city' | 'zone' | 'pincode' | 'custom';
  
  // Coverage
  postalCodes: string[];
  cities: string[];
  states: string[];
  countries: string[];
  
  // Service Options
  isServiceable: boolean;
  deliveryMethods: DeliveryMethod[];
  
  // Restrictions
  restrictions: DeliveryRestriction[];
  
  // Timing
  standardDeliveryDays: number;
  expressDeliveryDays?: number;
  
  // Charges
  deliveryCharge: number;
  minimumOrderValue?: number;
  freeDeliveryThreshold?: number;
  
  // Special Services
  codAvailable: boolean;
  installationAvailable: boolean;
  assemblyAvailable: boolean;
}

export interface DeliveryMethod {
  id: ID;
  name: string;
  type: 'standard' | 'express' | 'same_day' | 'scheduled' | 'pickup';
  description: string;
  
  // Timing
  estimatedDays: number;
  cutoffTime?: string; // HH:MM format
  
  // Charges
  baseCharge: number;
  weightMultiplier?: number;
  distanceMultiplier?: number;
  
  // Availability
  isAvailable: boolean;
  availableDays: string[]; // ['monday', 'tuesday', ...]
  blackoutDates: Timestamp[];
  
  // Restrictions
  maxWeight?: number;
  maxDimensions?: {
    length: number;
    width: number;
    height: number;
  };
  
  // Features
  isTrackable: boolean;
  requiresSignature: boolean;
  hasInsurance: boolean;
}

export interface DeliveryRestriction {
  type: 'product_category' | 'product_type' | 'value_limit' | 'weight_limit' | 'dimension_limit';
  value: string | number;
  description: string;
  isBlocked: boolean;
}

// Address Book Management
export interface AddressBookSettings {
  userId: ID;
  
  // Limits
  maxAddresses: number;
  currentAddressCount: number;
  
  // Auto-fill Settings
  autoFillFromProfile: boolean;
  autoSaveNewAddresses: boolean;
  autoValidateAddresses: boolean;
  
  // Privacy Settings
  shareAddressBook: boolean;
  allowAddressSuggestions: boolean;
  
  // Notification Settings
  notifyOnNewAddress: boolean;
  notifyOnAddressChanges: boolean;
  notifyOnValidationIssues: boolean;
}

// Quick Address Selection
export interface QuickAddress {
  id: ID;
  userId: ID;
  name: string;
  icon?: string;
  color?: string;
  
  // Quick Access
  isQuickAccess: boolean;
  order: number;
  
  // Associated Address
  addressId: ID;
  address: UserAddress;
  
  // Usage
  usageCount: number;
  lastUsed: Timestamp;
}

// Address Import/Export
export interface AddressImport {
  source: 'csv' | 'excel' | 'google_contacts' | 'apple_contacts' | 'outlook';
  file?: File;
  data?: AddressImportData[];
  mapping: AddressFieldMapping;
  
  // Options
  skipDuplicates: boolean;
  validateAddresses: boolean;
  setAsDefault?: boolean;
}

export interface AddressImportData {
  [key: string]: string | undefined;
}

export interface AddressFieldMapping {
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
  type?: string;
  label?: string;
}

// Recent Addresses
export interface RecentAddress {
  address: UserAddress;
  lastUsed: Timestamp;
  usageCount: number;
  context: 'order' | 'quote' | 'inquiry' | 'support';
}

// Address Analytics
export interface AddressAnalytics {
  userId: ID;
  
  // Usage Statistics
  totalAddresses: number;
  activeAddresses: number;
  mostUsedAddress: UserAddress;
  averageUsagePerAddress: number;
  
  // Geographic Distribution
  cityDistribution: Array<{
    city: string;
    count: number;
    percentage: number;
  }>;
  
  stateDistribution: Array<{
    state: string;
    count: number;
    percentage: number;
  }>;
  
  // Address Types
  typeDistribution: Array<{
    type: AddressType;
    count: number;
    percentage: number;
  }>;
  
  // Validation Statistics
  validationStats: {
    validAddresses: number;
    invalidAddresses: number;
    unverifiedAddresses: number;
    validationSuccessRate: number;
  };
  
  // Delivery Performance
  deliveryStats: {
    successfulDeliveries: number;
    failedDeliveries: number;
    averageDeliveryTime: number;
    deliverySuccessRate: number;
  };
}
