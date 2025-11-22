import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { 
  ApiResponse, 
  PaginationParams,
  SearchParams 
} from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildPaginationParams, buildSearchParams } from './utils';

/**
 * Shipping API Service
 * Handles shipping methods, zones, rates, and logistics
 */

interface ShippingZone {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  priority: number;
  
  // Location criteria
  locations: Array<{
    type: 'country' | 'state' | 'city' | 'zipcode' | 'postal_code';
    values: string[];
    exclude?: boolean;
  }>;
  
  // Special conditions
  conditions?: Array<{
    type: 'order_weight' | 'order_value' | 'item_count' | 'customer_type' | 'product_category';
    operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
    value: string | number | Array<string | number>;
  }>;
  
  createdAt: string;
  updatedAt: string;
}

interface ShippingMethod {
  id: string;
  zoneId: string;
  name: string;
  description: string;
  type: 'flat_rate' | 'free' | 'calculated' | 'pickup' | 'local_delivery' | 'express' | 'overnight';
  status: 'active' | 'inactive';
  priority: number;
  
  // Rate calculation
  rateCalculation: {
    method: 'fixed' | 'weight_based' | 'price_based' | 'quantity_based' | 'dimensional' | 'api_based';
    baseRate: number;
    
    // Weight-based rates
    weightRates?: Array<{
      minWeight: number;
      maxWeight?: number;
      rate: number;
      additionalRate?: number; // per additional unit
    }>;
    
    // Price-based rates
    priceRates?: Array<{
      minPrice: number;
      maxPrice?: number;
      rate: number;
      percentage?: number;
    }>;
    
    // Dimensional rates
    dimensionalRates?: {
      lengthRate: number;
      widthRate: number;
      heightRate: number;
      volumeRate: number;
      dimensionalWeight?: {
        divisor: number;
        unit: 'cm' | 'inch';
      };
    };
    
    // API-based calculation
    apiSettings?: {
      provider: 'ups' | 'fedex' | 'dhl' | 'usps' | 'canada_post' | 'royal_mail' | 'custom';
      apiKey: string;
      serviceCode?: string;
      packageType?: string;
      fallbackRate?: number;
    };
  };
  
  // Delivery estimates
  deliveryEstimate: {
    minDays: number;
    maxDays: number;
    businessDaysOnly: boolean;
    cutoffTime?: string; // HH:MM format
    sameDay?: boolean;
    nextDay?: boolean;
    excludedDays?: number[]; // 0-6 (Sunday-Saturday)
  };
  
  // Requirements & restrictions
  requirements: {
    minOrderValue?: number;
    maxOrderValue?: number;
    minWeight?: number;
    maxWeight?: number;
    maxDimensions?: {
      length: number;
      width: number;
      height: number;
      unit: 'cm' | 'inch';
    };
    requiredProductTypes?: string[];
    excludedProductTypes?: string[];
    signatureRequired?: boolean;
    insuranceRequired?: boolean;
  };
  
  // Special features
  features: {
    tracking: boolean;
    insurance: boolean;
    signature: boolean;
    saturdayDelivery: boolean;
    holidayDelivery: boolean;
    packaging: Array<{
      type: 'box' | 'envelope' | 'tube' | 'custom';
      dimensions: {
        length: number;
        width: number;
        height: number;
        weight: number;
        unit: 'cm' | 'inch';
      };
      cost: number;
    }>;
  };
  
  // Tax settings
  taxSettings: {
    taxable: boolean;
    taxClass?: string;
    includedInPrice: boolean;
  };
  
  zone: {
    id: string;
    name: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

interface ShippingRate {
  methodId: string;
  methodName: string;
  rate: number;
  currency: string;
  deliveryEstimate: {
    minDays: number;
    maxDays: number;
    estimatedDate: string;
  };
  features: string[];
  metadata: Record<string, unknown>;
}

interface ShippingCalculation {
  destination: {
    country: string;
    state?: string;
    city?: string;
    zipcode?: string;
    address?: string;
  };
  package: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
      unit: 'cm' | 'inch';
    };
    value: number;
    items: Array<{
      productId: string;
      quantity: number;
      weight: number;
      dimensions: {
        length: number;
        width: number;
        height: number;
      };
      value: number;
      category: string;
    }>;
  };
  availableRates: ShippingRate[];
  recommendedRate?: ShippingRate;
  errors: Array<{
    methodId: string;
    error: string;
  }>;
}

interface ShippingCarrier {
  id: string;
  name: string;
  code: string;
  type: 'courier' | 'postal' | 'freight' | 'local' | 'international';
  status: 'active' | 'inactive' | 'testing';
  
  // API configuration
  apiConfig: {
    baseUrl: string;
    apiKey: string;
    apiSecret?: string;
    accountNumber?: string;
    meterNumber?: string;
    testMode: boolean;
    timeout: number;
    retryAttempts: number;
  };
  
  // Supported services
  services: Array<{
    serviceCode: string;
    serviceName: string;
    description: string;
    type: 'ground' | 'air' | 'express' | 'overnight' | 'international';
    features: string[];
    maxWeight: number;
    maxDimensions: {
      length: number;
      width: number;
      height: number;
    };
  }>;
  
  // Coverage areas
  coverage: {
    domestic: string[];
    international: string[];
    restrictions: Array<{
      location: string;
      reason: string;
      alternativeCarriers?: string[];
    }>;
  };
  
  // Default settings
  defaults: {
    packageType: string;
    serviceCode: string;
    insuranceThreshold: number;
    signatureThreshold: number;
  };
  
  // Tracking configuration
  tracking: {
    enabled: boolean;
    baseUrl?: string;
    webhookUrl?: string;
    events: string[];
  };
  
  logo?: string;
  website?: string;
  supportContact?: {
    phone: string;
    email: string;
    hours: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

interface ShippingLabel {
  id: string;
  orderId: string;
  carrierCode: string;
  serviceCode: string;
  trackingNumber: string;
  
  // Label details
  labelFormat: 'pdf' | 'png' | 'zpl' | 'epl';
  labelSize: '4x6' | '8x11' | 'a4' | 'custom';
  labelUrl: string;
  labelData?: string; // base64 encoded
  
  // Shipment details
  shipment: {
    from: {
      name: string;
      company?: string;
      address: string;
      city: string;
      state: string;
      zipcode: string;
      country: string;
      phone?: string;
      email?: string;
    };
    to: {
      name: string;
      company?: string;
      address: string;
      city: string;
      state: string;
      zipcode: string;
      country: string;
      phone?: string;
      email?: string;
    };
    package: {
      weight: number;
      dimensions: {
        length: number;
        width: number;
        height: number;
        unit: 'cm' | 'inch';
      };
      value: number;
      description: string;
      contents: Array<{
        description: string;
        quantity: number;
        value: number;
        weight: number;
        harmonizedCode?: string;
        countryOfOrigin?: string;
      }>;
    };
  };
  
  // Costs
  costs: {
    shippingCost: number;
    insuranceCost: number;
    labelCost: number;
    totalCost: number;
    currency: string;
  };
  
  // Status
  status: 'created' | 'purchased' | 'printed' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
  
  // Features
  features: {
    insurance: boolean;
    signature: boolean;
    tracking: boolean;
    deliveryConfirmation: boolean;
  };
  
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

interface TrackingEvent {
  timestamp: string;
  status: string;
  statusCode: string;
  description: string;
  location?: {
    city: string;
    state: string;
    country: string;
    zipcode?: string;
  };
  carrier: string;
  carrierStatus: string;
  estimatedDelivery?: string;
}

interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  service: string;
  status: 'pre_transit' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'exception' | 'unknown';
  estimatedDelivery?: string;
  actualDelivery?: string;
  signedBy?: string;
  
  // Package info
  package: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
  
  // Addresses
  from: {
    city: string;
    state: string;
    country: string;
  };
  to: {
    city: string;
    state: string;
    country: string;
  };
  
  // Events
  events: TrackingEvent[];
  
  // Metadata
  metadata: {
    lastUpdated: string;
    refreshCount: number;
    nextRefresh?: string;
  };
}

class ShippingApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Shipping Zones

  // Get shipping zones
  async getShippingZones(params?: SearchParams & PaginationParams & {
    status?: 'active' | 'inactive';
    sortBy?: 'name' | 'priority' | 'created' | 'updated';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<ShippingZone[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.status && { status: params.status }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    };
    
    return this.client.get<ShippingZone[]>(endpoints.shipping.zones.list, { params: queryParams });
  }

  // Get zone by ID
  async getShippingZoneById(zoneId: string): Promise<ApiResponse<ShippingZone>> {
    return this.client.get<ShippingZone>(endpoints.shipping.zones.byId(zoneId));
  }

  // Create shipping zone
  async createShippingZone(zoneData: {
    name: string;
    description: string;
    priority?: number;
    locations: ShippingZone['locations'];
    conditions?: ShippingZone['conditions'];
  }): Promise<ApiResponse<ShippingZone>> {
    return this.client.post<ShippingZone>(endpoints.shipping.zones.create, zoneData);
  }

  // Update shipping zone
  async updateShippingZone(zoneId: string, updates: {
    name?: string;
    description?: string;
    status?: 'active' | 'inactive';
    priority?: number;
    locations?: ShippingZone['locations'];
    conditions?: ShippingZone['conditions'];
  }): Promise<ApiResponse<ShippingZone>> {
    return this.client.put<ShippingZone>(endpoints.shipping.zones.update(zoneId), updates);
  }

  // Delete shipping zone
  async deleteShippingZone(zoneId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.shipping.zones.delete(zoneId));
  }

  // Test zone coverage
  async testZoneCoverage(zoneId: string, testAddress: {
    country: string;
    state?: string;
    city?: string;
    zipcode?: string;
  }): Promise<ApiResponse<{
    covered: boolean;
    matchedRules: string[];
    conflictingZones?: Array<{
      zoneId: string;
      zoneName: string;
      priority: number;
    }>;
  }>> {
    return this.client.post<{
      covered: boolean;
      matchedRules: string[];
      conflictingZones?: Array<{
        zoneId: string;
        zoneName: string;
        priority: number;
      }>;
    }>(endpoints.shipping.zones.testCoverage(zoneId), { address: testAddress });
  }

  // Shipping Methods

  // Get shipping methods
  async getShippingMethods(params?: SearchParams & PaginationParams & {
    zoneId?: string;
    type?: 'flat_rate' | 'free' | 'calculated' | 'pickup' | 'local_delivery' | 'express' | 'overnight';
    status?: 'active' | 'inactive';
    sortBy?: 'name' | 'priority' | 'created' | 'rate';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<ShippingMethod[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.zoneId && { zoneId: params.zoneId }),
      ...(params?.type && { type: params.type }),
      ...(params?.status && { status: params.status }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    };
    
    return this.client.get<ShippingMethod[]>(endpoints.shipping.methods.list, { params: queryParams });
  }

  // Get method by ID
  async getShippingMethodById(methodId: string): Promise<ApiResponse<ShippingMethod>> {
    return this.client.get<ShippingMethod>(endpoints.shipping.methods.byId(methodId));
  }

  // Create shipping method
  async createShippingMethod(methodData: {
    zoneId: string;
    name: string;
    description: string;
    type: 'flat_rate' | 'free' | 'calculated' | 'pickup' | 'local_delivery' | 'express' | 'overnight';
    priority?: number;
    rateCalculation: ShippingMethod['rateCalculation'];
    deliveryEstimate: ShippingMethod['deliveryEstimate'];
    requirements?: ShippingMethod['requirements'];
    features?: Partial<ShippingMethod['features']>;
    taxSettings?: ShippingMethod['taxSettings'];
  }): Promise<ApiResponse<ShippingMethod>> {
    return this.client.post<ShippingMethod>(endpoints.shipping.methods.create, methodData);
  }

  // Update shipping method
  async updateShippingMethod(methodId: string, updates: {
    name?: string;
    description?: string;
    status?: 'active' | 'inactive';
    priority?: number;
    rateCalculation?: ShippingMethod['rateCalculation'];
    deliveryEstimate?: ShippingMethod['deliveryEstimate'];
    requirements?: ShippingMethod['requirements'];
    features?: Partial<ShippingMethod['features']>;
    taxSettings?: ShippingMethod['taxSettings'];
  }): Promise<ApiResponse<ShippingMethod>> {
    return this.client.put<ShippingMethod>(endpoints.shipping.methods.update(methodId), updates);
  }

  // Delete shipping method
  async deleteShippingMethod(methodId: string): Promise<ApiResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(endpoints.shipping.methods.delete(methodId));
  }

  // Rate Calculation

  // Calculate shipping rates
  async calculateShippingRates(calculationData: {
    destination: {
      country: string;
      state?: string;
      city?: string;
      zipcode?: string;
    };
    package: {
      weight: number;
      dimensions: {
        length: number;
        width: number;
        height: number;
        unit: 'cm' | 'inch';
      };
      value: number;
      items: Array<{
        productId: string;
        quantity: number;
        weight: number;
        dimensions: {
          length: number;
          width: number;
          height: number;
        };
        value: number;
        category?: string;
      }>;
    };
    options?: {
      methodIds?: string[];
      carrierCodes?: string[];
      excludePickup?: boolean;
      insuranceRequired?: boolean;
      signatureRequired?: boolean;
    };
  }): Promise<ApiResponse<ShippingCalculation>> {
    return this.client.post<ShippingCalculation>(endpoints.shipping.calculate, calculationData);
  }

  // Get cheapest rate
  async getCheapestRate(calculationData: {
    destination: {
      country: string;
      state?: string;
      city?: string;
      zipcode?: string;
    };
    package: {
      weight: number;
      dimensions: {
        length: number;
        width: number;
        height: number;
        unit: 'cm' | 'inch';
      };
      value: number;
    };
  }): Promise<ApiResponse<ShippingRate>> {
    return this.client.post<ShippingRate>(endpoints.shipping.cheapest, calculationData);
  }

  // Get fastest rate
  async getFastestRate(calculationData: {
    destination: {
      country: string;
      state?: string;
      city?: string;
      zipcode?: string;
    };
    package: {
      weight: number;
      dimensions: {
        length: number;
        width: number;
        height: number;
        unit: 'cm' | 'inch';
      };
      value: number;
    };
  }): Promise<ApiResponse<ShippingRate>> {
    return this.client.post<ShippingRate>(endpoints.shipping.fastest, calculationData);
  }

  // Carriers

  // Get carriers
  async getCarriers(params?: SearchParams & PaginationParams & {
    type?: 'courier' | 'postal' | 'freight' | 'local' | 'international';
    status?: 'active' | 'inactive' | 'testing';
    sortBy?: 'name' | 'type' | 'created';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<ShippingCarrier[]>> {
    const queryParams = {
      ...buildSearchParams(params || {}),
      ...buildPaginationParams(params || {}),
      ...(params?.type && { type: params.type }),
      ...(params?.status && { status: params.status }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    };
    
    return this.client.get<ShippingCarrier[]>(endpoints.shipping.carriers.list, { params: queryParams });
  }

  // Get carrier by ID
  async getCarrierById(carrierId: string): Promise<ApiResponse<ShippingCarrier>> {
    return this.client.get<ShippingCarrier>(endpoints.shipping.carriers.byId(carrierId));
  }

  // Test carrier connection
  async testCarrierConnection(carrierId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    services: Array<{
      serviceCode: string;
      serviceName: string;
      available: boolean;
    }>;
  }>> {
    return this.client.post<{
      success: boolean;
      message: string;
      services: Array<{
        serviceCode: string;
        serviceName: string;
        available: boolean;
      }>;
    }>(endpoints.shipping.carriers.test(carrierId), {});
  }

  // Labels

  // Create shipping label
  async createLabel(labelData: {
    orderId: string;
    carrierCode: string;
    serviceCode: string;
    from: ShippingLabel['shipment']['from'];
    to: ShippingLabel['shipment']['to'];
    package: ShippingLabel['shipment']['package'];
    labelFormat?: 'pdf' | 'png' | 'zpl' | 'epl';
    labelSize?: '4x6' | '8x11' | 'a4';
    features?: {
      insurance?: boolean;
      signature?: boolean;
      deliveryConfirmation?: boolean;
    };
  }): Promise<ApiResponse<ShippingLabel>> {
    return this.client.post<ShippingLabel>(endpoints.shipping.labels.create, labelData);
  }

  // Get label by ID
  async getLabelById(labelId: string): Promise<ApiResponse<ShippingLabel>> {
    return this.client.get<ShippingLabel>(endpoints.shipping.labels.byId(labelId));
  }

  // Get labels for order
  async getOrderLabels(orderId: string): Promise<ApiResponse<ShippingLabel[]>> {
    return this.client.get<ShippingLabel[]>(endpoints.shipping.labels.byOrder(orderId));
  }

  // Cancel label
  async cancelLabel(labelId: string): Promise<ApiResponse<{
    success: boolean;
    refund?: {
      amount: number;
      currency: string;
    };
    message: string;
  }>> {
    return this.client.post<{
      success: boolean;
      refund?: {
        amount: number;
        currency: string;
      };
      message: string;
    }>(endpoints.shipping.labels.cancel(labelId), {});
  }

  // Download label
  async downloadLabel(labelId: string, format?: 'pdf' | 'png'): Promise<ApiResponse<{
    url: string;
    data: string; // base64
    contentType: string;
  }>> {
    const params = format ? { format } : {};
    return this.client.get<{
      url: string;
      data: string;
      contentType: string;
    }>(endpoints.shipping.labels.download(labelId), { params });
  }

  // Tracking

  // Track shipment
  async trackShipment(trackingNumber: string, carrier?: string): Promise<ApiResponse<TrackingInfo>> {
    const params = carrier ? { carrier } : {};
    return this.client.get<TrackingInfo>(endpoints.shipping.tracking.track(trackingNumber), { params });
  }

  // Get tracking info
  async getTrackingInfo(trackingNumbers: string[]): Promise<ApiResponse<TrackingInfo[]>> {
    return this.client.post<TrackingInfo[]>(endpoints.shipping.tracking.batch, { trackingNumbers });
  }

  // Update tracking webhook
  async updateTrackingWebhook(trackingNumber: string, webhookUrl: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.client.put<{
      success: boolean;
      message: string;
    }>(endpoints.shipping.tracking.webhook(trackingNumber), { webhookUrl });
  }

  // Addresses

  // Validate address
  async validateAddress(address: {
    name?: string;
    company?: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  }): Promise<ApiResponse<{
    valid: boolean;
    normalized?: typeof address;
    suggestions?: typeof address[];
    errors?: string[];
  }>> {
    return this.client.post<{
      valid: boolean;
      normalized?: typeof address;
      suggestions?: typeof address[];
      errors?: string[];
    }>(endpoints.shipping.addresses.validate, { address });
  }

  // Get address suggestions
  async getAddressSuggestions(partial: {
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    country: string;
  }): Promise<ApiResponse<Array<{
    address: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
    confidence: number;
  }>>> {
    return this.client.post<Array<{
      address: string;
      city: string;
      state: string;
      zipcode: string;
      country: string;
      confidence: number;
    }>>(endpoints.shipping.addresses.suggestions, { partial });
  }

  // Bulk Operations

  // Bulk create labels
  async bulkCreateLabels(labelsData: Array<{
    orderId: string;
    carrierCode: string;
    serviceCode: string;
    from: ShippingLabel['shipment']['from'];
    to: ShippingLabel['shipment']['to'];
    package: ShippingLabel['shipment']['package'];
  }>): Promise<ApiResponse<{
    createdCount: number;
    labels: ShippingLabel[];
    errors: Array<{
      orderId: string;
      error: string;
    }>;
  }>> {
    return this.client.post<{
      createdCount: number;
      labels: ShippingLabel[];
      errors: Array<{
        orderId: string;
        error: string;
      }>;
    }>(endpoints.shipping.labels.bulkCreate, { labels: labelsData });
  }

  // Bulk update methods
  async bulkUpdateMethods(updates: Array<{
    methodId: string;
    updates: {
      status?: 'active' | 'inactive';
      priority?: number;
    };
  }>): Promise<ApiResponse<{
    updatedCount: number;
    errors: Array<{
      methodId: string;
      error: string;
    }>;
  }>> {
    return this.client.put<{
      updatedCount: number;
      errors: Array<{
        methodId: string;
        error: string;
      }>;
    }>(endpoints.shipping.methods.bulkUpdate, { updates });
  }

  // Analytics

  // Get shipping analytics
  async getShippingAnalytics(params?: {
    dateRange?: {
      start: string;
      end: string;
    };
    granularity?: 'day' | 'week' | 'month';
    methodIds?: string[];
    carrierCodes?: string[];
  }): Promise<ApiResponse<{
    overview: {
      totalShipments: number;
      totalRevenue: number;
      averageShippingCost: number;
      averageDeliveryTime: number;
      onTimeDeliveryRate: number;
    };
    performance: {
      byMethod: Record<string, {
        shipments: number;
        revenue: number;
        averageCost: number;
        deliveryTime: number;
      }>;
      byCarrier: Record<string, {
        shipments: number;
        revenue: number;
        deliveryTime: number;
        onTimeRate: number;
      }>;
      byDestination: Record<string, {
        shipments: number;
        averageCost: number;
        deliveryTime: number;
      }>;
    };
    trends: Array<{
      date: string;
      shipments: number;
      revenue: number;
      averageCost: number;
    }>;
  }>> {
    const queryParams = {
      ...(params?.dateRange && {
        startDate: params.dateRange.start,
        endDate: params.dateRange.end,
      }),
      ...(params?.granularity && { granularity: params.granularity }),
      ...(params?.methodIds && { methodIds: params.methodIds.join(',') }),
      ...(params?.carrierCodes && { carrierCodes: params.carrierCodes.join(',') }),
    };
    
    return this.client.get<{
      overview: {
        totalShipments: number;
        totalRevenue: number;
        averageShippingCost: number;
        averageDeliveryTime: number;
        onTimeDeliveryRate: number;
      };
      performance: {
        byMethod: Record<string, {
          shipments: number;
          revenue: number;
          averageCost: number;
          deliveryTime: number;
        }>;
        byCarrier: Record<string, {
          shipments: number;
          revenue: number;
          deliveryTime: number;
          onTimeRate: number;
        }>;
        byDestination: Record<string, {
          shipments: number;
          averageCost: number;
          deliveryTime: number;
        }>;
      };
      trends: Array<{
        date: string;
        shipments: number;
        revenue: number;
        averageCost: number;
      }>;
    }>(endpoints.shipping.analytics, { params: queryParams });
  }
}

// Create service instance
const shippingApiService = new ShippingApiService();

// React Query Hooks

// Shipping Zones
export const useShippingZones = (params?: SearchParams & PaginationParams & {
  status?: 'active' | 'inactive';
  sortBy?: 'name' | 'priority' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['shipping', 'zones', params],
    queryFn: () => shippingApiService.getShippingZones(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useShippingZone = (zoneId: string) => {
  return useQuery({
    queryKey: ['shipping', 'zones', 'detail', zoneId],
    queryFn: () => shippingApiService.getShippingZoneById(zoneId),
    enabled: !!zoneId,
    staleTime: 15 * 60 * 1000,
  });
};

// Shipping Methods
export const useShippingMethods = (params?: SearchParams & PaginationParams & {
  zoneId?: string;
  type?: 'flat_rate' | 'free' | 'calculated' | 'pickup' | 'local_delivery' | 'express' | 'overnight';
  status?: 'active' | 'inactive';
  sortBy?: 'name' | 'priority' | 'created' | 'rate';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['shipping', 'methods', params],
    queryFn: () => shippingApiService.getShippingMethods(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useShippingMethod = (methodId: string) => {
  return useQuery({
    queryKey: ['shipping', 'methods', 'detail', methodId],
    queryFn: () => shippingApiService.getShippingMethodById(methodId),
    enabled: !!methodId,
    staleTime: 15 * 60 * 1000,
  });
};

// Carriers
export const useCarriers = (params?: SearchParams & PaginationParams & {
  type?: 'courier' | 'postal' | 'freight' | 'local' | 'international';
  status?: 'active' | 'inactive' | 'testing';
  sortBy?: 'name' | 'type' | 'created';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['shipping', 'carriers', params],
    queryFn: () => shippingApiService.getCarriers(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCarrier = (carrierId: string) => {
  return useQuery({
    queryKey: ['shipping', 'carriers', 'detail', carrierId],
    queryFn: () => shippingApiService.getCarrierById(carrierId),
    enabled: !!carrierId,
    staleTime: 30 * 60 * 1000,
  });
};

// Labels
export const useLabel = (labelId: string) => {
  return useQuery({
    queryKey: ['shipping', 'labels', 'detail', labelId],
    queryFn: () => shippingApiService.getLabelById(labelId),
    enabled: !!labelId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useOrderLabels = (orderId: string) => {
  return useQuery({
    queryKey: ['shipping', 'labels', 'order', orderId],
    queryFn: () => shippingApiService.getOrderLabels(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
  });
};

// Tracking
export const useTrackingInfo = (trackingNumber: string, carrier?: string) => {
  return useQuery({
    queryKey: ['shipping', 'tracking', trackingNumber, carrier],
    queryFn: () => shippingApiService.trackShipment(trackingNumber, carrier),
    enabled: !!trackingNumber,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
};

// Analytics
export const useShippingAnalytics = (params?: {
  dateRange?: {
    start: string;
    end: string;
  };
  granularity?: 'day' | 'week' | 'month';
  methodIds?: string[];
  carrierCodes?: string[];
}) => {
  return useQuery({
    queryKey: ['shipping', 'analytics', params],
    queryFn: () => shippingApiService.getShippingAnalytics(params),
    staleTime: 15 * 60 * 1000,
  });
};

// Mutation Hooks

// Zones
export const useCreateShippingZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (zoneData: {
      name: string;
      description: string;
      priority?: number;
      locations: ShippingZone['locations'];
      conditions?: ShippingZone['conditions'];
    }) => shippingApiService.createShippingZone(zoneData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'zones'] });
    },
  });
};

export const useUpdateShippingZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ zoneId, updates }: {
      zoneId: string;
      updates: {
        name?: string;
        description?: string;
        status?: 'active' | 'inactive';
        priority?: number;
        locations?: ShippingZone['locations'];
        conditions?: ShippingZone['conditions'];
      };
    }) => shippingApiService.updateShippingZone(zoneId, updates),
    onSuccess: (_, { zoneId }) => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'zones', 'detail', zoneId] });
      queryClient.invalidateQueries({ queryKey: ['shipping', 'zones'] });
    },
  });
};

export const useDeleteShippingZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (zoneId: string) => shippingApiService.deleteShippingZone(zoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'zones'] });
    },
  });
};

export const useTestZoneCoverage = () => {
  return useMutation({
    mutationFn: ({ zoneId, testAddress }: {
      zoneId: string;
      testAddress: {
        country: string;
        state?: string;
        city?: string;
        zipcode?: string;
      };
    }) => shippingApiService.testZoneCoverage(zoneId, testAddress),
  });
};

// Methods
export const useCreateShippingMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (methodData: {
      zoneId: string;
      name: string;
      description: string;
      type: 'flat_rate' | 'free' | 'calculated' | 'pickup' | 'local_delivery' | 'express' | 'overnight';
      priority?: number;
      rateCalculation: ShippingMethod['rateCalculation'];
      deliveryEstimate: ShippingMethod['deliveryEstimate'];
      requirements?: ShippingMethod['requirements'];
      features?: Partial<ShippingMethod['features']>;
      taxSettings?: ShippingMethod['taxSettings'];
    }) => shippingApiService.createShippingMethod(methodData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'methods'] });
    },
  });
};

export const useUpdateShippingMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ methodId, updates }: {
      methodId: string;
      updates: {
        name?: string;
        description?: string;
        status?: 'active' | 'inactive';
        priority?: number;
        rateCalculation?: ShippingMethod['rateCalculation'];
        deliveryEstimate?: ShippingMethod['deliveryEstimate'];
        requirements?: ShippingMethod['requirements'];
        features?: Partial<ShippingMethod['features']>;
        taxSettings?: ShippingMethod['taxSettings'];
      };
    }) => shippingApiService.updateShippingMethod(methodId, updates),
    onSuccess: (_, { methodId }) => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'methods', 'detail', methodId] });
      queryClient.invalidateQueries({ queryKey: ['shipping', 'methods'] });
    },
  });
};

export const useDeleteShippingMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (methodId: string) => shippingApiService.deleteShippingMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'methods'] });
    },
  });
};

// Rate Calculation
export const useCalculateShippingRates = () => {
  return useMutation({
    mutationFn: (calculationData: {
      destination: {
        country: string;
        state?: string;
        city?: string;
        zipcode?: string;
      };
      package: {
        weight: number;
        dimensions: {
          length: number;
          width: number;
          height: number;
          unit: 'cm' | 'inch';
        };
        value: number;
        items: Array<{
          productId: string;
          quantity: number;
          weight: number;
          dimensions: {
            length: number;
            width: number;
            height: number;
          };
          value: number;
          category?: string;
        }>;
      };
      options?: {
        methodIds?: string[];
        carrierCodes?: string[];
        excludePickup?: boolean;
        insuranceRequired?: boolean;
        signatureRequired?: boolean;
      };
    }) => shippingApiService.calculateShippingRates(calculationData),
  });
};

export const useGetCheapestRate = () => {
  return useMutation({
    mutationFn: (calculationData: {
      destination: {
        country: string;
        state?: string;
        city?: string;
        zipcode?: string;
      };
      package: {
        weight: number;
        dimensions: {
          length: number;
          width: number;
          height: number;
          unit: 'cm' | 'inch';
        };
        value: number;
      };
    }) => shippingApiService.getCheapestRate(calculationData),
  });
};

export const useGetFastestRate = () => {
  return useMutation({
    mutationFn: (calculationData: {
      destination: {
        country: string;
        state?: string;
        city?: string;
        zipcode?: string;
      };
      package: {
        weight: number;
        dimensions: {
          length: number;
          width: number;
          height: number;
          unit: 'cm' | 'inch';
        };
        value: number;
      };
    }) => shippingApiService.getFastestRate(calculationData),
  });
};

// Carriers
export const useTestCarrierConnection = () => {
  return useMutation({
    mutationFn: (carrierId: string) => shippingApiService.testCarrierConnection(carrierId),
  });
};

// Labels
export const useCreateLabel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (labelData: {
      orderId: string;
      carrierCode: string;
      serviceCode: string;
      from: ShippingLabel['shipment']['from'];
      to: ShippingLabel['shipment']['to'];
      package: ShippingLabel['shipment']['package'];
      labelFormat?: 'pdf' | 'png' | 'zpl' | 'epl';
      labelSize?: '4x6' | '8x11' | 'a4';
      features?: {
        insurance?: boolean;
        signature?: boolean;
        deliveryConfirmation?: boolean;
      };
    }) => shippingApiService.createLabel(labelData),
    onSuccess: (data) => {
      if (data.data) {
        queryClient.invalidateQueries({ queryKey: ['shipping', 'labels', 'order', data.data.orderId] });
      }
    },
  });
};

export const useCancelLabel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (labelId: string) => shippingApiService.cancelLabel(labelId),
    onSuccess: (_, labelId) => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'labels', 'detail', labelId] });
    },
  });
};

export const useBulkCreateLabels = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (labelsData: Array<{
      orderId: string;
      carrierCode: string;
      serviceCode: string;
      from: ShippingLabel['shipment']['from'];
      to: ShippingLabel['shipment']['to'];
      package: ShippingLabel['shipment']['package'];
    }>) => shippingApiService.bulkCreateLabels(labelsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'labels'] });
    },
  });
};

// Address Validation
export const useValidateAddress = () => {
  return useMutation({
    mutationFn: (address: {
      name?: string;
      company?: string;
      address: string;
      city: string;
      state: string;
      zipcode: string;
      country: string;
    }) => shippingApiService.validateAddress(address),
  });
};

export const useGetAddressSuggestions = () => {
  return useMutation({
    mutationFn: (partial: {
      address?: string;
      city?: string;
      state?: string;
      zipcode?: string;
      country: string;
    }) => shippingApiService.getAddressSuggestions(partial),
  });
};

// Bulk Operations
export const useBulkUpdateMethods = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Array<{
      methodId: string;
      updates: {
        status?: 'active' | 'inactive';
        priority?: number;
      };
    }>) => shippingApiService.bulkUpdateMethods(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'methods'] });
    },
  });
};

export default shippingApiService;