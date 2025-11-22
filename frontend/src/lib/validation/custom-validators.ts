/**
 * Custom Validators for Vardhman Mills Frontend
 * Business-specific validation logic and rules
 */

import { z } from 'zod';
import { VALIDATION_CONSTANTS, validationHelpers } from './common';

// Custom validation functions
export const customValidators = {
  // Validate unique email (would typically check against database)
  uniqueEmail: (email: string): Promise<boolean> => {
    // This would typically make an API call to check email uniqueness
    // For now, return a promise that resolves to true
    return new Promise((resolve) => {
      // Simulate API call
      setTimeout(() => {
        // Common email domains that might be blocked
        const blockedDomains = ['temp-mail.org', '10minutemail.com', 'guerrillamail.com'];
        const domain = email.split('@')[1]?.toLowerCase();
        resolve(!blockedDomains.includes(domain));
      }, 100);
    });
  },

  // Validate product SKU format
  validateSKU: (sku: string): boolean => {
    // SKU format: VM-CATEGORY-XXXX (e.g., VM-SHIRT-0001)
    const skuRegex = /^VM-[A-Z]{3,10}-\d{4}$/;
    return skuRegex.test(sku);
  },

  // Validate coupon code format
  validateCouponCode: (code: string): boolean => {
    // Coupon format: ALPHABETIC, 4-20 characters
    const couponRegex = /^[A-Z0-9]{4,20}$/;
    return couponRegex.test(code);
  },

  // Validate order number format
  validateOrderNumber: (orderNumber: string): boolean => {
    // Order format: VM-YYYYMMDD-XXXX
    const orderRegex = /^VM-\d{8}-\d{4}$/;
    return orderRegex.test(orderNumber);
  },

  // Validate Indian IFSC code
  validateIFSC: (ifsc: string): boolean => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
  },

  // Validate credit card number (Luhn algorithm)
  validateCreditCard: (cardNumber: string): boolean => {
    const cleanedNumber = cardNumber.replace(/\D/g, '');
    
    if (cleanedNumber.length < 13 || cleanedNumber.length > 19) {
      return false;
    }

    let sum = 0;
    let shouldDouble = false;

    for (let i = cleanedNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanedNumber.charAt(i));

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  },

  // Validate Indian bank account number
  validateBankAccount: (accountNumber: string): boolean => {
    const cleanedNumber = accountNumber.replace(/\D/g, '');
    return cleanedNumber.length >= 9 && cleanedNumber.length <= 18;
  },

  // Validate image dimensions
  validateImageDimensions: (
    file: File,
    minWidth?: number,
    minHeight?: number,
    maxWidth?: number,
    maxHeight?: number
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const { width, height } = img;
        URL.revokeObjectURL(url);

        let isValid = true;

        if (minWidth && width < minWidth) isValid = false;
        if (minHeight && height < minHeight) isValid = false;
        if (maxWidth && width > maxWidth) isValid = false;
        if (maxHeight && height > maxHeight) isValid = false;

        resolve(isValid);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };

      img.src = url;
    });
  },

  // Validate business hours format
  validateBusinessHours: (hours: string): boolean => {
    // Format: "09:00-18:00" or "09:00 AM-06:00 PM"
    const timeRegex = /^(([01]?[0-9]|2[0-3]):[0-5][0-9]|([01]?[0-9]|1[0-2]):[0-5][0-9]\s?(AM|PM))-(([01]?[0-9]|2[0-3]):[0-5][0-9]|([01]?[0-9]|1[0-2]):[0-5][0-9]\s?(AM|PM))$/i;
    return timeRegex.test(hours);
  },

  // Validate color hex code
  validateHexColor: (hex: string): boolean => {
    const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
    return hexRegex.test(hex);
  },

  // Validate social media URL
  validateSocialMediaURL: (url: string, platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube'): boolean => {
    const patterns = {
      facebook: /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+$/,
      instagram: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+$/,
      twitter: /^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+$/,
      linkedin: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+$/,
      youtube: /^https?:\/\/(www\.)?youtube\.com\/(channel\/[a-zA-Z0-9_-]+|c\/[a-zA-Z0-9_-]+|user\/[a-zA-Z0-9_-]+)$/,
    };

    return patterns[platform].test(url);
  },

  // Validate Indian vehicle number
  validateVehicleNumber: (vehicleNumber: string): boolean => {
    // Format: KA01AB1234 or KA-01-AB-1234
    const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$|^[A-Z]{2}-[0-9]{2}-[A-Z]{2}-[0-9]{4}$/;
    return vehicleRegex.test(vehicleNumber.toUpperCase());
  },

  // Validate product weight
  validateWeight: (weight: number, unit: 'g' | 'kg' | 'mg'): boolean => {
    const limits = {
      mg: { min: 1, max: 1000000 }, // 1mg to 1kg in mg
      g: { min: 0.001, max: 1000 }, // 1mg to 1kg in g
      kg: { min: 0.000001, max: 1 }, // 1mg to 1kg in kg
    };

    const { min, max } = limits[unit];
    return weight >= min && weight <= max;
  },

  // Validate shipping dimensions
  validateDimensions: (length: number, width: number, height: number): boolean => {
    // All dimensions should be positive and within reasonable limits (in cm)
    const maxDimension = 200; // 2 meters
    const minDimension = 0.1; // 1mm

    return [length, width, height].every(dim => 
      dim >= minDimension && dim <= maxDimension
    );
  },

  // Validate discount percentage
  validateDiscountPercentage: (discount: number, maxDiscount = 90): boolean => {
    return discount >= 0 && discount <= maxDiscount;
  },

  // Validate stock quantity
  validateStockQuantity: (quantity: number): boolean => {
    return Number.isInteger(quantity) && quantity >= 0;
  },
};

// Custom Zod validators
export const zodCustomValidators = {
  // Unique email validator (async)
  uniqueEmail: z.string().refine(
    async (email) => await customValidators.uniqueEmail(email),
    { message: 'This email is already registered' }
  ),

  // SKU validator
  sku: z.string().refine(
    (sku) => customValidators.validateSKU(sku),
    { message: 'Invalid SKU format. Expected: VM-CATEGORY-XXXX' }
  ),

  // Coupon code validator
  couponCode: z.string().refine(
    (code) => customValidators.validateCouponCode(code),
    { message: 'Invalid coupon code format' }
  ),

  // Order number validator
  orderNumber: z.string().refine(
    (orderNumber) => customValidators.validateOrderNumber(orderNumber),
    { message: 'Invalid order number format' }
  ),

  // IFSC code validator
  ifsc: z.string().refine(
    (ifsc) => customValidators.validateIFSC(ifsc),
    { message: 'Invalid IFSC code' }
  ),

  // Credit card validator
  creditCard: z.string().refine(
    (cardNumber) => customValidators.validateCreditCard(cardNumber),
    { message: 'Invalid credit card number' }
  ),

  // Bank account validator
  bankAccount: z.string().refine(
    (accountNumber) => customValidators.validateBankAccount(accountNumber),
    { message: 'Invalid bank account number' }
  ),

  // Business hours validator
  businessHours: z.string().refine(
    (hours) => customValidators.validateBusinessHours(hours),
    { message: 'Invalid business hours format. Expected: 09:00-18:00' }
  ),

  // Hex color validator
  hexColor: z.string().refine(
    (hex) => customValidators.validateHexColor(hex),
    { message: 'Invalid hex color code' }
  ),

  // Vehicle number validator
  vehicleNumber: z.string().refine(
    (vehicleNumber) => customValidators.validateVehicleNumber(vehicleNumber),
    { message: 'Invalid vehicle number format' }
  ),

  // Weight validator
  weight: z.number().refine(
    (weight) => customValidators.validateWeight(weight, 'g'),
    { message: 'Weight must be between 0.001g and 1000g' }
  ),

  // Dimensions validator
  dimensions: z.object({
    length: z.number().min(0.1, 'Length must be at least 0.1cm'),
    width: z.number().min(0.1, 'Width must be at least 0.1cm'),
    height: z.number().min(0.1, 'Height must be at least 0.1cm'),
  }).refine(
    (dims) => customValidators.validateDimensions(dims.length, dims.width, dims.height),
    { message: 'Invalid product dimensions' }
  ),

  // Stock quantity validator
  stock: z.number().refine(
    (quantity) => customValidators.validateStockQuantity(quantity),
    { message: 'Stock quantity must be a non-negative integer' }
  ),

  // Age verification (18+)
  birthDate: z.date().refine(
    (date) => validationHelpers.isAdult(date),
    { message: 'You must be at least 18 years old' }
  ),

  // Indian state validator
  indianState: z.string().refine(
    (state) => validationHelpers.isValidIndianState(state),
    { message: 'Invalid Indian state' }
  ),

  // Social media URL validators
  facebookURL: z.string().refine(
    (url) => customValidators.validateSocialMediaURL(url, 'facebook'),
    { message: 'Invalid Facebook URL' }
  ),

  instagramURL: z.string().refine(
    (url) => customValidators.validateSocialMediaURL(url, 'instagram'),
    { message: 'Invalid Instagram URL' }
  ),

  twitterURL: z.string().refine(
    (url) => customValidators.validateSocialMediaURL(url, 'twitter'),
    { message: 'Invalid Twitter URL' }
  ),

  linkedinURL: z.string().refine(
    (url) => customValidators.validateSocialMediaURL(url, 'linkedin'),
    { message: 'Invalid LinkedIn URL' }
  ),

  youtubeURL: z.string().refine(
    (url) => customValidators.validateSocialMediaURL(url, 'youtube'),
    { message: 'Invalid YouTube URL' }
  ),
};

// Business-specific validation schemas
export const businessValidations = {
  // Product code validation
  productCode: z.string()
    .min(3, 'Product code must be at least 3 characters')
    .max(20, 'Product code must not exceed 20 characters')
    .regex(/^[A-Z0-9-_]+$/, 'Product code can only contain uppercase letters, numbers, hyphens, and underscores'),

  // Category slug validation
  categorySlug: z.string()
    .min(2, 'Category slug must be at least 2 characters')
    .max(50, 'Category slug must not exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Category slug can only contain lowercase letters, numbers, and hyphens'),

  // Tag validation
  tag: z.string()
    .min(1, 'Tag must be at least 1 character')
    .max(30, 'Tag must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Tag can only contain letters, numbers, spaces, and hyphens'),

  // Color name validation
  colorName: z.string()
    .min(2, 'Color name must be at least 2 characters')
    .max(30, 'Color name must not exceed 30 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Color name can only contain letters and spaces'),

  // Size validation
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', 'Free Size'], {
    message: 'Invalid size selection',
  }),

  // Material validation
  material: z.string()
    .min(2, 'Material must be at least 2 characters')
    .max(50, 'Material must not exceed 50 characters')
    .regex(/^[a-zA-Z\s,%-]+$/, 'Material can only contain letters, spaces, commas, and percentage signs'),

  // Care instructions validation
  careInstructions: z.string()
    .max(500, 'Care instructions must not exceed 500 characters'),

  // Warranty period validation
  warrantyPeriod: z.number()
    .min(0, 'Warranty period cannot be negative')
    .max(60, 'Warranty period cannot exceed 60 months'),

  // Return policy validation
  returnPeriod: z.number()
    .min(0, 'Return period cannot be negative')
    .max(90, 'Return period cannot exceed 90 days'),

  // Shipping weight validation
  shippingWeight: z.number()
    .min(0.001, 'Shipping weight must be at least 0.001 kg')
    .max(50, 'Shipping weight cannot exceed 50 kg'),

  // Tax rate validation
  taxRate: z.number()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%'),

  // Commission rate validation
  commissionRate: z.number()
    .min(0, 'Commission rate cannot be negative')
    .max(50, 'Commission rate cannot exceed 50%'),

  // Minimum order quantity validation
  minimumOrderQuantity: z.number()
    .min(1, 'Minimum order quantity must be at least 1')
    .max(100, 'Minimum order quantity cannot exceed 100'),

  // Maximum order quantity validation
  maximumOrderQuantity: z.number()
    .min(1, 'Maximum order quantity must be at least 1')
    .max(1000, 'Maximum order quantity cannot exceed 1000'),
};

// File validation schemas
export const fileValidationSchemas = {
  // Product image validation
  productImage: z.object({
    file: z.instanceof(File),
    name: z.string(),
    size: z.number().max(VALIDATION_CONSTANTS.MAX_IMAGE_SIZE, 'Image size too large'),
    type: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], {
      message: 'Invalid image format. Only JPEG, PNG, and WebP are allowed',
    }),
  }),

  // Document validation
  document: z.object({
    file: z.instanceof(File),
    name: z.string(),
    size: z.number().max(VALIDATION_CONSTANTS.MAX_DOCUMENT_SIZE, 'Document size too large'),
    type: z.enum(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], {
      message: 'Invalid document format. Only PDF and Word documents are allowed',
    }),
  }),

  // CSV file validation
  csvFile: z.object({
    file: z.instanceof(File),
    name: z.string().endsWith('.csv', 'File must be a CSV'),
    size: z.number().max(10 * 1024 * 1024, 'CSV file size too large'), // 10MB
    type: z.literal('text/csv'),
  }),
};

// Complex validation schemas
export const complexValidations = {
  // Price range validation
  priceRange: z.object({
    min: z.number().min(0, 'Minimum price cannot be negative'),
    max: z.number().min(0, 'Maximum price cannot be negative'),
  }).refine(
    (data) => data.max >= data.min,
    {
      message: 'Maximum price must be greater than or equal to minimum price',
      path: ['max'],
    }
  ),

  // Date range validation
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }).refine(
    (data) => data.endDate >= data.startDate,
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  ),

  // Bulk discount validation
  bulkDiscount: z.object({
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    discount: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
  }),

  // Shipping rule validation
  shippingRule: z.object({
    minOrderValue: z.number().min(0, 'Minimum order value cannot be negative'),
    shippingCost: z.number().min(0, 'Shipping cost cannot be negative'),
    freeShippingThreshold: z.number().min(0, 'Free shipping threshold cannot be negative'),
  }).refine(
    (data) => data.freeShippingThreshold >= data.minOrderValue,
    {
      message: 'Free shipping threshold must be greater than or equal to minimum order value',
      path: ['freeShippingThreshold'],
    }
  ),
};

const customValidatorsExport = {
  customValidators,
  zodCustomValidators,
  businessValidations,
  fileValidationSchemas,
  complexValidations,
};

export default customValidatorsExport;
