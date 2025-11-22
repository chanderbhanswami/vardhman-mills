
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  type: ShippingType;
  price: number;
  freeThreshold?: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  isActive: boolean;
  restrictions?: ShippingRestriction[];
  icon?: string;
}

export type ShippingType = 'standard' | 'express' | 'overnight' | 'same_day' | 'pickup';

export interface ShippingRestriction {
  type: 'weight' | 'dimensions' | 'location' | 'product_type';
  value: any;
  message: string;
}

export interface ShippingRate {
  methodId: string;
  price: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  isAvailable: boolean;
  restrictions?: string[];
}

export interface ShippingCalculation {
  address: Partial<Address>;
  items: {
    productId: string;
    variantId: string;
    quantity: number;
    weight?: number;
    dimensions?: ProductDimensions;
  }[];
  subtotal: number;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: TrackingStatus;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  timeline: TrackingEvent[];
  currentLocation?: string;
}

export type TrackingStatus = 
  | 'label_created'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'returned';

export interface TrackingEvent {
  status: TrackingStatus;
  message: string;
  location?: string;
  timestamp: Date;
}

export interface DeliverySlot {
  id: string;
  date: Date;
  timeSlot: {
    start: string;
    end: string;
  };
  isAvailable: boolean;
  additionalCharge?: number;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: Address;
  phone: string;
  hours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  instructions?: string;
}
