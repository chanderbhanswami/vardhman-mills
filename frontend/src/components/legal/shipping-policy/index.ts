// Shipping Policy components barrel exports
export { default as ShippingPolicyContent } from './ShippingPolicyContent';

// Shipping-specific types and interfaces
export interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  standardDelivery: ShippingOption;
  expressDelivery?: ShippingOption;
  freeShippingThreshold?: number;
  restrictions?: string[];
}

export interface ShippingOption {
  cost: number;
  currency: string;
  timeframe: string;
  description: string;
  trackingIncluded: boolean;
  insuranceIncluded: boolean;
}

export interface DeliveryTimeframe {
  zone: string;
  standard: string;
  express?: string;
  factors?: string[];
}

export interface ShippingRestriction {
  id: string;
  category: string;
  description: string;
  reason: string;
  alternatives?: string[];
}

export interface PackagingInfo {
  id: string;
  name: string;
  description: string;
  suitableFor: string[];
  ecoFriendly: boolean;
  extraCost?: number;
}

export interface ShippingPolicyData {
  lastUpdated: string;
  version: string;
  domesticZones: ShippingZone[];
  internationalZones: ShippingZone[];
  deliveryTimeframes: DeliveryTimeframe[];
  restrictions: ShippingRestriction[];
  packagingOptions: PackagingInfo[];
  shippingTerms: {
    orderProcessingTime: string;
    cutoffTime: string;
    holidayDelay: string;
    weatherDelay: string;
  };
  trackingInfo: {
    domesticTracking: boolean;
    internationalTracking: boolean;
    trackingPortal: string;
    notificationMethods: string[];
  };
  contactInfo: {
    email: string;
    phone: string;
    hours: string;
  };
}

// Utility functions
export const calculateShippingCost = (
  orderValue: number,
  weight: number,
  destination: string,
  shippingData: ShippingPolicyData
): { cost: number; timeframe: string; zone: string } => {
  // Find the appropriate zone
  const domesticZone = shippingData.domesticZones.find(zone => 
    zone.regions.some(region => 
      destination.toLowerCase().includes(region.toLowerCase())
    )
  );
  
  const internationalZone = shippingData.internationalZones.find(zone => 
    zone.regions.some(region => 
      destination.toLowerCase().includes(region.toLowerCase())
    )
  );
  
  const zone = domesticZone || internationalZone;
  
  if (!zone) {
    return { cost: 0, timeframe: 'Contact us for quote', zone: 'Unknown' };
  }
  
  // Check if eligible for free shipping
  if (zone.freeShippingThreshold && orderValue >= zone.freeShippingThreshold) {
    return {
      cost: 0,
      timeframe: zone.standardDelivery.timeframe,
      zone: zone.name
    };
  }
  
  // Calculate cost based on weight and zone
  let baseCost = zone.standardDelivery.cost;
  
  // Add weight-based charges (example logic)
  if (weight > 2) {
    baseCost += Math.ceil((weight - 2) / 0.5) * 50;
  }
  
  return {
    cost: baseCost,
    timeframe: zone.standardDelivery.timeframe,
    zone: zone.name
  };
};

export const getDeliveryEstimate = (
  destination: string,
  expressDelivery: boolean = false
): string => {
  const now = new Date();
  const deliveryDays = expressDelivery ? 2 : 5; // Default estimates
  
  // Skip weekends
  let businessDays = 0;
  const currentDate = new Date(now);
  
  while (businessDays < deliveryDays) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      businessDays++;
    }
  }
  
  return currentDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatShippingCost = (cost: number, currency: string = 'INR'): string => {
  if (cost === 0) return 'Free';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  });
  
  return formatter.format(cost);
};

// Default shipping policy data
export const defaultShippingPolicyData: ShippingPolicyData = {
  lastUpdated: '2024-10-01',
  version: '1.3',
  domesticZones: [
    {
      id: 'metro',
      name: 'Metro Cities',
      regions: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'],
      standardDelivery: {
        cost: 150,
        currency: 'INR',
        timeframe: '2-4 business days',
        description: 'Standard delivery to metro cities',
        trackingIncluded: true,
        insuranceIncluded: true
      },
      expressDelivery: {
        cost: 300,
        currency: 'INR',
        timeframe: '1-2 business days',
        description: 'Express delivery to metro cities',
        trackingIncluded: true,
        insuranceIncluded: true
      },
      freeShippingThreshold: 2500
    },
    {
      id: 'tier1',
      name: 'Tier 1 Cities',
      regions: ['Chandigarh', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam', 'Vadodara', 'Ludhiana'],
      standardDelivery: {
        cost: 200,
        currency: 'INR',
        timeframe: '3-5 business days',
        description: 'Standard delivery to tier 1 cities',
        trackingIncluded: true,
        insuranceIncluded: true
      },
      expressDelivery: {
        cost: 400,
        currency: 'INR',
        timeframe: '2-3 business days',
        description: 'Express delivery to tier 1 cities',
        trackingIncluded: true,
        insuranceIncluded: true
      },
      freeShippingThreshold: 3000
    },
    {
      id: 'tier2',
      name: 'Tier 2 Cities',
      regions: ['Agra', 'Allahabad', 'Amritsar', 'Aurangabad', 'Bareilly', 'Bhubaneswar', 'Coimbatore', 'Faridabad', 'Ghaziabad', 'Guwahati'],
      standardDelivery: {
        cost: 250,
        currency: 'INR',
        timeframe: '4-7 business days',
        description: 'Standard delivery to tier 2 cities',
        trackingIncluded: true,
        insuranceIncluded: false
      },
      freeShippingThreshold: 3500
    },
    {
      id: 'rural',
      name: 'Rural & Remote Areas',
      regions: ['Other locations', 'Rural areas', 'Remote locations'],
      standardDelivery: {
        cost: 350,
        currency: 'INR',
        timeframe: '7-12 business days',
        description: 'Standard delivery to rural and remote areas',
        trackingIncluded: false,
        insuranceIncluded: false
      },
      freeShippingThreshold: 5000,
      restrictions: [
        'Some remote locations may require additional delivery time',
        'Cash on delivery may not be available in all areas'
      ]
    }
  ],
  internationalZones: [
    {
      id: 'south_asia',
      name: 'South Asia',
      regions: ['Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Maldives'],
      standardDelivery: {
        cost: 1500,
        currency: 'INR',
        timeframe: '7-15 business days',
        description: 'Standard international delivery to South Asian countries',
        trackingIncluded: true,
        insuranceIncluded: true
      },
      freeShippingThreshold: 15000,
      restrictions: [
        'Custom duties and taxes apply',
        'Some textile items may be restricted'
      ]
    },
    {
      id: 'middle_east',
      name: 'Middle East',
      regions: ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain'],
      standardDelivery: {
        cost: 2500,
        currency: 'INR',
        timeframe: '10-20 business days',
        description: 'Standard international delivery to Middle East',
        trackingIncluded: true,
        insuranceIncluded: true
      },
      freeShippingThreshold: 25000,
      restrictions: [
        'Custom duties and taxes apply',
        'Import permits required for commercial quantities'
      ]
    },
    {
      id: 'rest_of_world',
      name: 'Rest of World',
      regions: ['USA', 'Canada', 'UK', 'Europe', 'Australia', 'Other countries'],
      standardDelivery: {
        cost: 3500,
        currency: 'INR',
        timeframe: '15-30 business days',
        description: 'Standard international delivery worldwide',
        trackingIncluded: true,
        insuranceIncluded: true
      },
      freeShippingThreshold: 50000,
      restrictions: [
        'Custom duties and taxes apply',
        'Prohibited items list applies',
        'Import regulations vary by country'
      ]
    }
  ],
  deliveryTimeframes: [
    {
      zone: 'Metro Cities',
      standard: '2-4 business days',
      express: '1-2 business days',
      factors: ['Traffic conditions', 'Weather', 'Peak season demand']
    },
    {
      zone: 'Tier 1 Cities',
      standard: '3-5 business days',
      express: '2-3 business days',
      factors: ['Local connectivity', 'Weather conditions', 'Festival seasons']
    },
    {
      zone: 'Tier 2 Cities',
      standard: '4-7 business days',
      factors: ['Transportation availability', 'Local infrastructure', 'Weather delays']
    },
    {
      zone: 'Rural Areas',
      standard: '7-12 business days',
      factors: ['Road conditions', 'Connectivity issues', 'Weather dependency']
    }
  ],
  restrictions: [
    {
      id: 'size_weight',
      category: 'Size & Weight Restrictions',
      description: 'Maximum package dimensions: 150cm x 100cm x 80cm, Maximum weight: 30kg',
      reason: 'Courier limitations and safety requirements',
      alternatives: ['Split large orders into multiple shipments', 'Contact customer service for special arrangements']
    },
    {
      id: 'hazardous',
      category: 'Hazardous Materials',
      description: 'Items containing chemicals, flammable materials, or sharp objects cannot be shipped',
      reason: 'Safety and legal regulations',
      alternatives: ['Local pickup available for restricted items']
    },
    {
      id: 'perishable',
      category: 'Perishable Items',
      description: 'Items that can spoil or deteriorate during transit',
      reason: 'Quality assurance and customer satisfaction',
      alternatives: ['Express delivery for time-sensitive items']
    },
    {
      id: 'high_value',
      category: 'High-Value Items',
      description: 'Orders above ₹1,00,000 require special handling',
      reason: 'Insurance and security requirements',
      alternatives: ['Signature confirmation required', 'Special insurance coverage available']
    }
  ],
  packagingOptions: [
    {
      id: 'standard',
      name: 'Standard Packaging',
      description: 'Basic protective packaging with bubble wrap and cardboard',
      suitableFor: ['Regular textiles', 'Non-fragile items'],
      ecoFriendly: false
    },
    {
      id: 'premium',
      name: 'Premium Packaging',
      description: 'Enhanced packaging with branded boxes and premium protection',
      suitableFor: ['Premium textiles', 'Gift items', 'Fragile products'],
      ecoFriendly: false,
      extraCost: 100
    },
    {
      id: 'eco',
      name: 'Eco-Friendly Packaging',
      description: 'Sustainable packaging using recycled and biodegradable materials',
      suitableFor: ['All textile products', 'Environmentally conscious customers'],
      ecoFriendly: true,
      extraCost: 50
    },
    {
      id: 'gift',
      name: 'Gift Packaging',
      description: 'Beautiful gift wrapping with ribbons and greeting cards',
      suitableFor: ['Gift orders', 'Special occasions'],
      ecoFriendly: false,
      extraCost: 200
    }
  ],
  shippingTerms: {
    orderProcessingTime: '1-2 business days',
    cutoffTime: '2:00 PM IST for same-day processing',
    holidayDelay: 'Additional 1-2 days during national holidays',
    weatherDelay: 'Possible delays during monsoon and extreme weather'
  },
  trackingInfo: {
    domesticTracking: true,
    internationalTracking: true,
    trackingPortal: 'https://vardhmanmills.com/track-order',
    notificationMethods: ['Email', 'SMS', 'WhatsApp', 'Push notifications']
  },
  contactInfo: {
    email: 'shipping@vardhmanmills.com',
    phone: '+91-1234-567890',
    hours: 'Monday-Saturday: 9:00 AM - 7:00 PM IST'
  }
};
