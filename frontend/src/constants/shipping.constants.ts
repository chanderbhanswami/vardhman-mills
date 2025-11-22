/**
 * Shipping Constants - Vardhman Mills Frontend
 * Constants for shipping and delivery management
 */

// Shipping Methods
export const SHIPPING_METHODS = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  OVERNIGHT: 'overnight',
  SAME_DAY: 'same_day',
  PICKUP: 'pickup',
  FREE_SHIPPING: 'free_shipping',
} as const;

// Shipping Status
export const SHIPPING_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  RETURNED: 'returned',
  CANCELLED: 'cancelled',
} as const;

// Delivery Time Frames
export const DELIVERY_TIMEFRAMES = {
  STANDARD: '5-7 business days',
  EXPRESS: '2-3 business days',
  OVERNIGHT: '1 business day',
  SAME_DAY: 'Same day',
  PICKUP: 'Ready for pickup',
} as const;

// Shipping Costs (in INR)
export const SHIPPING_COSTS = {
  STANDARD: 50,
  EXPRESS: 150,
  OVERNIGHT: 300,
  SAME_DAY: 500,
  FREE_THRESHOLD: 2000, // Free shipping above this amount
} as const;

// Shipping Zones
export const SHIPPING_ZONES = {
  LOCAL: 'local',
  REGIONAL: 'regional',
  NATIONAL: 'national',
  INTERNATIONAL: 'international',
} as const;

// Package Types
export const PACKAGE_TYPES = {
  ENVELOPE: 'envelope',
  BOX_SMALL: 'box_small',
  BOX_MEDIUM: 'box_medium',
  BOX_LARGE: 'box_large',
  TUBE: 'tube',
  CUSTOM: 'custom',
} as const;

// Tracking Events
export const TRACKING_EVENTS = {
  ORDER_CREATED: 'order_created',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  PROCESSING: 'processing',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  DELIVERY_ATTEMPTED: 'delivery_attempted',
  EXCEPTION: 'exception',
} as const;

// Shipping Carriers
export const SHIPPING_CARRIERS = {
  INDIA_POST: 'india_post',
  DTDC: 'dtdc',
  BLUE_DART: 'blue_dart',
  FEDEX: 'fedex',
  DHL: 'dhl',
  ARAMEX: 'aramex',
  ECOM_EXPRESS: 'ecom_express',
  DELHIVERY: 'delhivery',
} as const;

// Address Types
export const ADDRESS_TYPES = {
  HOME: 'home',
  OFFICE: 'office',
  WAREHOUSE: 'warehouse',
  OTHER: 'other',
} as const;

export type ShippingMethods = typeof SHIPPING_METHODS;
export type ShippingStatus = typeof SHIPPING_STATUS;
export type DeliveryTimeframes = typeof DELIVERY_TIMEFRAMES;
export type ShippingZones = typeof SHIPPING_ZONES;
export type PackageTypes = typeof PACKAGE_TYPES;
export type TrackingEvents = typeof TRACKING_EVENTS;
export type ShippingCarriers = typeof SHIPPING_CARRIERS;
export type AddressTypes = typeof ADDRESS_TYPES;