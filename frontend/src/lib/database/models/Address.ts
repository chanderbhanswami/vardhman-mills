/**
 * Address Model - Comprehensive address management system
 * Frontend-optimized with full TypeScript support and validation
 */

import { ObjectId } from 'mongodb';
import { z } from 'zod';

/**
 * Address Coordinates Schema
 */
export const AddressCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(), // in meters
  source: z.enum(['gps', 'geocoding', 'manual', 'estimated']).default('geocoding'),
  lastUpdated: z.date().default(() => new Date()),
});

export type AddressCoordinates = z.infer<typeof AddressCoordinatesSchema>;

/**
 * Address Validation Schema
 */
export const AddressValidationSchema = z.object({
  isValidated: z.boolean().default(false),
  validatedAt: z.date().optional(),
  validationMethod: z.enum(['postal_service', 'google', 'manual', 'user_confirmed']).optional(),
  validationScore: z.number().min(0).max(100).optional(),
  validationErrors: z.array(z.string()).default([]),
  suggestions: z.array(z.object({
    field: z.string(),
    suggestion: z.string(),
    confidence: z.number().min(0).max(1),
  })).default([]),
  deliverable: z.boolean().optional(),
  residentialFlag: z.boolean().optional(),
  businessFlag: z.boolean().optional(),
});

export type AddressValidation = z.infer<typeof AddressValidationSchema>;

/**
 * Address Usage Stats Schema
 */
export const AddressUsageStatsSchema = z.object({
  orderCount: z.number().nonnegative().default(0),
  lastUsedForOrder: z.date().optional(),
  deliverySuccessRate: z.number().min(0).max(1).default(1),
  deliveryAttempts: z.number().nonnegative().default(0),
  failedDeliveries: z.number().nonnegative().default(0),
  averageDeliveryTime: z.number().positive().optional(), // in hours
  preferredCarriers: z.array(z.string()).default([]),
  deliveryInstructions: z.array(z.object({
    instruction: z.string(),
    addedAt: z.date(),
    addedBy: z.string(), // user id
  })).default([]),
});

export type AddressUsageStats = z.infer<typeof AddressUsageStatsSchema>;

/**
 * Main Address Schema
 */
export const AddressSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.string().min(1, 'User ID is required'),
  type: z.enum(['home', 'work', 'billing', 'shipping', 'other']).default('home'),
  isDefault: z.boolean().default(false),
  isDefaultBilling: z.boolean().default(false),
  isDefaultShipping: z.boolean().default(false),
  
  // Basic address information
  label: z.string().max(50, 'Label too long').optional(), // Custom label like "Mom's House"
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  company: z.string().max(100, 'Company name too long').optional(),
  
  // Address lines
  addressLine1: z.string().min(1, 'Address line 1 is required').max(100, 'Address line 1 too long'),
  addressLine2: z.string().max(100, 'Address line 2 too long').optional(),
  city: z.string().min(1, 'City is required').max(50, 'City name too long'),
  state: z.string().min(1, 'State is required').max(50, 'State name too long'),
  postalCode: z.string().min(1, 'Postal code is required').max(20, 'Postal code too long'),
  country: z.string().min(2, 'Invalid country code').max(3, 'Invalid country code').default('IN'),
  
  // Contact information
  phone: z.string().max(20, 'Phone number too long').optional(),
  email: z.string().email('Invalid email').optional(),
  
  // Delivery preferences
  deliveryInstructions: z.string().max(500, 'Delivery instructions too long').optional(),
  accessCodes: z.object({
    gate: z.string().optional(),
    building: z.string().optional(),
    apartment: z.string().optional(),
  }).optional(),
  
  // Timing preferences
  deliveryPreferences: z.object({
    preferredTimeSlots: z.array(z.object({
      dayOfWeek: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
      startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
      endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    })).default([]),
    noDeliveryDays: z.array(z.number().min(0).max(6)).default([]), // Days to avoid delivery
    specialInstructions: z.string().max(200).optional(),
    authorizedRecipients: z.array(z.string()).default([]), // Names of people who can receive packages
    requireSignature: z.boolean().default(false),
    leaveAtDoor: z.boolean().default(false),
    callOnArrival: z.boolean().default(false),
  }).default(() => ({
    preferredTimeSlots: [],
    noDeliveryDays: [],
    authorizedRecipients: [],
    requireSignature: false,
    leaveAtDoor: false,
    callOnArrival: false,
  })),
  
  // Geographic data
  coordinates: AddressCoordinatesSchema.optional(),
  timezone: z.string().optional(), // e.g., "America/New_York"
  
  // Validation and verification
  validation: AddressValidationSchema.default(() => ({
    isValidated: false,
    validationErrors: [],
    suggestions: [],
  })),
  
  // Usage statistics
  usageStats: AddressUsageStatsSchema.default(() => ({
    orderCount: 0,
    deliverySuccessRate: 1,
    deliveryAttempts: 0,
    failedDeliveries: 0,
    preferredCarriers: [],
    deliveryInstructions: [],
  })),
  
  // Security and privacy
  visibility: z.enum(['private', 'shared', 'public']).default('private'),
  shareWith: z.array(z.string()).default([]), // User IDs who can see this address
  
  // Status and metadata
  status: z.enum(['active', 'inactive', 'archived', 'deleted']).default('active'),
  tags: z.array(z.string()).default([]),
  notes: z.string().max(1000, 'Notes too long').optional(),
  
  // Custom fields for extensibility
  customFields: z.record(z.string(), z.unknown()).default({}),
  
  // Audit trail
  createdBy: z.string().optional(), // User ID
  updatedBy: z.string().optional(), // User ID
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  lastUsedAt: z.date().optional(),
  archivedAt: z.date().optional(),
  deletedAt: z.date().optional(),
});

export type Address = z.infer<typeof AddressSchema>;

/**
 * Create Address Schema
 */
export const CreateAddressSchema = AddressSchema.omit({
  _id: true,
  usageStats: true,
  createdAt: true,
  updatedAt: true,
  lastUsedAt: true,
  archivedAt: true,
  deletedAt: true,
});

export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;

/**
 * Update Address Schema
 */
export const UpdateAddressSchema = AddressSchema.partial().omit({
  _id: true,
  userId: true,
  createdAt: true,
});

export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;

/**
 * Address Filter Schema
 */
export const AddressFilterSchema = z.object({
  userId: z.string().optional(),
  type: z.enum(['home', 'work', 'billing', 'shipping', 'other']).optional(),
  status: z.enum(['active', 'inactive', 'archived', 'deleted']).optional(),
  isDefault: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
  isDefaultShipping: z.boolean().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  validated: z.boolean().optional(),
  hasCoordinates: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  sortBy: z.enum(['name', 'type', 'created_at', 'updated_at', 'last_used', 'city']).default('updated_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeUsageStats: z.boolean().default(false),
});

export type AddressFilter = z.infer<typeof AddressFilterSchema>;

/**
 * Address Statistics Schema
 */
export const AddressStatsSchema = z.object({
  totalAddresses: z.number(),
  activeAddresses: z.number(),
  addressesByType: z.object({
    home: z.number(),
    work: z.number(),
    billing: z.number(),
    shipping: z.number(),
    other: z.number(),
  }),
  addressesByCountry: z.record(z.string(), z.number()),
  validatedAddresses: z.number(),
  averageDeliverySuccessRate: z.number(),
  mostUsedAddresses: z.array(z.object({
    addressId: z.string(),
    label: z.string(),
    orderCount: z.number(),
    successRate: z.number(),
  })),
  addressesByState: z.record(z.string(), z.number()),
  recentlyAddedCount: z.number(),
});

export type AddressStats = z.infer<typeof AddressStatsSchema>;

/**
 * Validation functions
 */
export const validateAddress = (data: unknown): Address => {
  return AddressSchema.parse(data);
};

export const validateCreateAddress = (data: unknown): CreateAddressInput => {
  return CreateAddressSchema.parse(data);
};

export const validateUpdateAddress = (data: unknown): UpdateAddressInput => {
  return UpdateAddressSchema.parse(data);
};

export const validateAddressFilter = (data: unknown): AddressFilter => {
  return AddressFilterSchema.parse(data);
};

/**
 * Address utility functions
 */
export const addressUtils = {
  /**
   * Format address for display
   */
  formatAddress: (address: Address, format: 'single_line' | 'multi_line' | 'compact' = 'multi_line'): string => {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
    ].filter(Boolean);
    
    switch (format) {
      case 'single_line':
        return parts.join(', ');
      case 'compact':
        return `${address.city}, ${address.state} ${address.postalCode}`;
      case 'multi_line':
      default:
        return parts.join('\n');
    }
  },

  /**
   * Get full name
   */
  getFullName: (address: Address): string => {
    return `${address.firstName} ${address.lastName}`.trim();
  },

  /**
   * Get display label
   */
  getDisplayLabel: (address: Address): string => {
    if (address.label) return address.label;
    if (address.company) return address.company;
    return `${address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address`;
  },

  /**
   * Validate postal code format
   */
  validatePostalCode: (postalCode: string, country: string): boolean => {
    const patterns: Record<string, RegExp> = {
      'US': /^\d{5}(-\d{4})?$/,
      'CA': /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
      'GB': /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
      'IN': /^\d{6}$/,
      'AU': /^\d{4}$/,
      'DE': /^\d{5}$/,
      'FR': /^\d{5}$/,
    };
    
    const pattern = patterns[country.toUpperCase()];
    return pattern ? pattern.test(postalCode) : true; // Default to valid if no pattern
  },

  /**
   * Calculate distance between addresses
   */
  calculateDistance: (address1: Address, address2: Address): number | null => {
    if (!address1.coordinates || !address2.coordinates) return null;
    
    const { latitude: lat1, longitude: lon1 } = address1.coordinates;
    const { latitude: lat2, longitude: lon2 } = address2.coordinates;
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in km
  },

  /**
   * Find nearest addresses
   */
  findNearestAddresses: (targetAddress: Address, addresses: Address[], maxDistance: number = 50): Address[] => {
    if (!targetAddress.coordinates) return [];
    
    return addresses
      .map(address => ({
        address,
        distance: addressUtils.calculateDistance(targetAddress, address),
      }))
      .filter(item => item.distance !== null && item.distance <= maxDistance)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .map(item => item.address);
  },

  /**
   * Geocode address
   */
  generateCoordinates: (address: Address): AddressCoordinates | null => {
    // This would typically call a geocoding service
    // Generate mock coordinates based on address for demonstration
    if (!address.city || !address.state || !address.country) {
      return null;
    }
    
    // Create a simple hash from address components
    const addressString = `${address.city},${address.state},${address.country}`.toLowerCase();
    const hash = addressString.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Generate mock coordinates within India's approximate bounds
    const latitude = 20 + (Math.abs(hash) % 20);
    const longitude = 70 + (Math.abs(hash >> 8) % 20);
    
    return {
      latitude,
      longitude,
      accuracy: 100,
      source: 'geocoding' as const,
      lastUpdated: new Date(),
    };
  },

  /**
   * Validate address format
   */
  validateAddressFormat: (address: Partial<Address>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!address.firstName?.trim()) errors.push('First name is required');
    if (!address.lastName?.trim()) errors.push('Last name is required');
    if (!address.addressLine1?.trim()) errors.push('Address line 1 is required');
    if (!address.city?.trim()) errors.push('City is required');
    if (!address.state?.trim()) errors.push('State is required');
    if (!address.postalCode?.trim()) errors.push('Postal code is required');
    if (!address.country?.trim()) errors.push('Country is required');
    
    // Validate postal code format if country is specified
    if (address.postalCode && address.country) {
      if (!addressUtils.validatePostalCode(address.postalCode, address.country)) {
        errors.push('Invalid postal code format for selected country');
      }
    }
    
    // Validate email if provided
    if (address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
      errors.push('Invalid email format');
    }
    
    // Validate phone if provided
    if (address.phone && !/^[\+]?[\d\s\-\(\)]+$/.test(address.phone)) {
      errors.push('Invalid phone number format');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Set as default address
   */
  setAsDefault: (addresses: Address[], targetAddressId: string, defaultType: 'billing' | 'shipping' | 'both' = 'both'): Address[] => {
    return addresses.map(address => {
      const isTarget = address._id?.toString() === targetAddressId;
      
      if (defaultType === 'billing' || defaultType === 'both') {
        address.isDefaultBilling = isTarget;
      }
      
      if (defaultType === 'shipping' || defaultType === 'both') {
        address.isDefaultShipping = isTarget;
      }
      
      if (defaultType === 'both') {
        address.isDefault = isTarget;
      }
      
      if (isTarget) {
        address.updatedAt = new Date();
      }
      
      return address;
    });
  },

  /**
   * Get default addresses
   */
  getDefaultAddresses: (addresses: Address[]): { billing?: Address; shipping?: Address; general?: Address } => {
    return {
      billing: addresses.find(addr => addr.isDefaultBilling && addr.status === 'active'),
      shipping: addresses.find(addr => addr.isDefaultShipping && addr.status === 'active'),
      general: addresses.find(addr => addr.isDefault && addr.status === 'active'),
    };
  },

  /**
   * Filter addresses
   */
  filterAddresses: (addresses: Address[], filter: Partial<AddressFilter>): Address[] => {
    return addresses.filter(address => {
      if (filter.userId && address.userId !== filter.userId) return false;
      if (filter.type && address.type !== filter.type) return false;
      if (filter.status && address.status !== filter.status) return false;
      if (filter.isDefault !== undefined && address.isDefault !== filter.isDefault) return false;
      if (filter.isDefaultBilling !== undefined && address.isDefaultBilling !== filter.isDefaultBilling) return false;
      if (filter.isDefaultShipping !== undefined && address.isDefaultShipping !== filter.isDefaultShipping) return false;
      if (filter.country && address.country !== filter.country) return false;
      if (filter.state && address.state !== filter.state) return false;
      if (filter.city && address.city.toLowerCase() !== filter.city.toLowerCase()) return false;
      if (filter.postalCode && address.postalCode !== filter.postalCode) return false;
      if (filter.validated !== undefined && address.validation.isValidated !== filter.validated) return false;
      if (filter.hasCoordinates !== undefined && !!address.coordinates !== filter.hasCoordinates) return false;
      
      if (filter.tags && filter.tags.length > 0) {
        const hasTag = filter.tags.some(tag => address.tags.includes(tag));
        if (!hasTag) return false;
      }
      
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        const searchableText = [
          address.firstName,
          address.lastName,
          address.company || '',
          address.label || '',
          address.addressLine1,
          address.addressLine2 || '',
          address.city,
          address.state,
          address.postalCode,
          ...address.tags,
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      return true;
    });
  },

  /**
   * Sort addresses
   */
  sortAddresses: (addresses: Address[], sortBy: AddressFilter['sortBy'], sortOrder: AddressFilter['sortOrder']): Address[] => {
    return [...addresses].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          const nameA = `${a.firstName} ${a.lastName}`;
          const nameB = `${b.firstName} ${b.lastName}`;
          comparison = nameA.localeCompare(nameB);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'created_at':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updated_at':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'last_used':
          const lastUsedA = a.lastUsedAt?.getTime() || 0;
          const lastUsedB = b.lastUsedAt?.getTime() || 0;
          comparison = lastUsedA - lastUsedB;
          break;
        case 'city':
          comparison = a.city.localeCompare(b.city);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  },

  /**
   * Format for display
   */
  formatForDisplay: (address: Address) => {
    return {
      id: address._id?.toString(),
      label: addressUtils.getDisplayLabel(address),
      fullName: addressUtils.getFullName(address),
      company: address.company,
      type: address.type,
      isDefault: address.isDefault,
      isDefaultBilling: address.isDefaultBilling,
      isDefaultShipping: address.isDefaultShipping,
      formatted: {
        singleLine: addressUtils.formatAddress(address, 'single_line'),
        multiLine: addressUtils.formatAddress(address, 'multi_line'),
        compact: addressUtils.formatAddress(address, 'compact'),
      },
      address: {
        line1: address.addressLine1,
        line2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      contact: {
        phone: address.phone,
        email: address.email,
      },
      validation: {
        isValidated: address.validation.isValidated,
        deliverable: address.validation.deliverable,
        hasErrors: address.validation.validationErrors.length > 0,
      },
      usage: {
        orderCount: address.usageStats.orderCount,
        successRate: address.usageStats.deliverySuccessRate,
        lastUsed: address.lastUsedAt,
      },
      coordinates: address.coordinates,
      status: address.status,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  },

  /**
   * Calculate address statistics
   */
  calculateStats: (addresses: Address[]): AddressStats => {
    const activeAddresses = addresses.filter(addr => addr.status === 'active');
    
    const addressesByType = {
      home: 0,
      work: 0,
      billing: 0,
      shipping: 0,
      other: 0,
    };
    
    const addressesByCountry: Record<string, number> = {};
    const addressesByState: Record<string, number> = {};
    
    let totalSuccessRate = 0;
    let validatedCount = 0;
    
    addresses.forEach(address => {
      // Count by type
      addressesByType[address.type]++;
      
      // Count by country
      addressesByCountry[address.country] = (addressesByCountry[address.country] || 0) + 1;
      
      // Count by state  
      addressesByState[address.state] = (addressesByState[address.state] || 0) + 1;
      
      // Validation stats
      if (address.validation.isValidated) validatedCount++;
      
      // Success rate
      totalSuccessRate += address.usageStats.deliverySuccessRate;
    });
    
    // Most used addresses
    const mostUsedAddresses = addresses
      .filter(addr => addr.usageStats.orderCount > 0)
      .sort((a, b) => b.usageStats.orderCount - a.usageStats.orderCount)
      .slice(0, 5)
      .map(addr => ({
        addressId: addr._id?.toString() || '',
        label: addressUtils.getDisplayLabel(addr),
        orderCount: addr.usageStats.orderCount,
        successRate: addr.usageStats.deliverySuccessRate,
      }));
    
    // Recently added (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentlyAddedCount = addresses.filter(addr => addr.createdAt > thirtyDaysAgo).length;
    
    return {
      totalAddresses: addresses.length,
      activeAddresses: activeAddresses.length,
      addressesByType,
      addressesByCountry,
      validatedAddresses: validatedCount,
      averageDeliverySuccessRate: addresses.length > 0 ? totalSuccessRate / addresses.length : 0,
      mostUsedAddresses,
      addressesByState,
      recentlyAddedCount,
    };
  },

  /**
   * Export address data
   */
  exportData: (addresses: Address[], format: 'json' | 'csv' = 'json') => {
    const exportData = addresses.map(address => ({
      id: address._id?.toString(),
      fullName: addressUtils.getFullName(address),
      company: address.company,
      type: address.type,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      email: address.email,
      isDefault: address.isDefault,
      isDefaultBilling: address.isDefaultBilling,
      isDefaultShipping: address.isDefaultShipping,
      validated: address.validation.isValidated,
      orderCount: address.usageStats.orderCount,
      successRate: address.usageStats.deliverySuccessRate,
      status: address.status,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    }));
    
    return format === 'json' ? JSON.stringify(exportData, null, 2) : exportData;
  },

  /**
   * Suggest similar addresses
   */
  suggestSimilarAddresses: (targetAddress: Address, addresses: Address[]): Address[] => {
    return addresses.filter(address => {
      if (address._id?.toString() === targetAddress._id?.toString()) return false;
      if (address.userId !== targetAddress.userId) return false;
      
      // Same city and state
      if (address.city === targetAddress.city && address.state === targetAddress.state) return true;
      
      // Same postal code
      if (address.postalCode === targetAddress.postalCode) return true;
      
      // Similar address line
      const similarity = addressUtils.calculateStringSimilarity(
        address.addressLine1.toLowerCase(),
        targetAddress.addressLine1.toLowerCase()
      );
      
      return similarity > 0.7;
    });
  },

  /**
   * Calculate string similarity
   */
  calculateStringSimilarity: (str1: string, str2: string): number => {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;
    
    const distance = addressUtils.levenshteinDistance(str1, str2);
    return (maxLength - distance) / maxLength;
  },

  /**
   * Calculate Levenshtein distance
   */
  levenshteinDistance: (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  },

  /**
   * Update usage stats
   */
  updateUsageStats: (address: Address, orderSuccess: boolean = true): Address => {
    address.usageStats.orderCount++;
    address.usageStats.deliveryAttempts++;
    address.lastUsedAt = new Date();
    address.usageStats.lastUsedForOrder = new Date();
    
    if (orderSuccess) {
      address.usageStats.deliverySuccessRate = 
        ((address.usageStats.deliverySuccessRate * (address.usageStats.orderCount - 1)) + 1) / address.usageStats.orderCount;
    } else {
      address.usageStats.failedDeliveries++;
      address.usageStats.deliverySuccessRate = 
        ((address.usageStats.deliverySuccessRate * (address.usageStats.orderCount - 1)) + 0) / address.usageStats.orderCount;
    }
    
    address.updatedAt = new Date();
    return address;
  },
};

/**
 * Default address values
 */
export const defaultAddress: Partial<Address> = {
  type: 'home',
  country: 'IN',
  isDefault: false,
  isDefaultBilling: false,
  isDefaultShipping: false,
  status: 'active',
  visibility: 'private',
  tags: [],
  shareWith: [],
  customFields: {},
  deliveryPreferences: {
    preferredTimeSlots: [],
    noDeliveryDays: [],
    authorizedRecipients: [],
    requireSignature: false,
    leaveAtDoor: false,
    callOnArrival: false,
  },
  validation: {
    isValidated: false,
    validationErrors: [],
    suggestions: [],
  },
  usageStats: {
    orderCount: 0,
    deliverySuccessRate: 1,
    deliveryAttempts: 0,
    failedDeliveries: 0,
    preferredCarriers: [],
    deliveryInstructions: [],
  },
};

const AddressModel = {
  AddressSchema,
  CreateAddressSchema,
  UpdateAddressSchema,
  AddressFilterSchema,
  AddressStatsSchema,
  AddressCoordinatesSchema,
  AddressValidationSchema,
  AddressUsageStatsSchema,
  validateAddress,
  validateCreateAddress,
  validateUpdateAddress,
  validateAddressFilter,
  addressUtils,
  defaultAddress,
};

export default AddressModel;