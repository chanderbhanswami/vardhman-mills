/**
 * Common Validation Utilities for Vardhman Mills Frontend
 * Shared validation functions and constants
 */

import { z } from 'zod';

// Common validation constants
export const VALIDATION_CONSTANTS = {
  // String lengths
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_COMMENT_LENGTH: 1,
  MAX_COMMENT_LENGTH: 1000,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_ADDRESS_LENGTH: 200,
  
  // Numeric limits
  MIN_RATING: 1,
  MAX_RATING: 5,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 999,
  MIN_PRICE: 0.01,
  MAX_PRICE: 999999.99,
  MIN_DISCOUNT: 0,
  MAX_DISCOUNT: 100,
  
  // File sizes (in bytes)
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Phone number format
  INDIAN_PHONE_REGEX: /^(?:\+91|91)?[6-9]\d{9}$/,
  
  // Pincode format
  INDIAN_PINCODE_REGEX: /^[1-9][0-9]{5}$/,
  
  // GST number format
  GST_REGEX: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  
  // PAN number format
  PAN_REGEX: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  
  // Aadhar number format
  AADHAR_REGEX: /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/,
  
  // Password strength regex
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  
  // URL regex
  URL_REGEX: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  
  // Allowed image formats
  ALLOWED_IMAGE_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  
  // Allowed document formats
  ALLOWED_DOCUMENT_FORMATS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// Common validation messages
export const VALIDATION_MESSAGES = {
  // Required fields
  REQUIRED: 'This field is required',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  NAME_REQUIRED: 'Name is required',
  PHONE_REQUIRED: 'Phone number is required',
  ADDRESS_REQUIRED: 'Address is required',
  
  // Format errors
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid Indian phone number',
  INVALID_PINCODE: 'Please enter a valid Indian pincode',
  INVALID_GST: 'Please enter a valid GST number',
  INVALID_PAN: 'Please enter a valid PAN number',
  INVALID_AADHAR: 'Please enter a valid Aadhar number',
  INVALID_URL: 'Please enter a valid URL',
  
  // Length errors
  NAME_TOO_SHORT: `Name must be at least ${VALIDATION_CONSTANTS.MIN_NAME_LENGTH} characters`,
  NAME_TOO_LONG: `Name must not exceed ${VALIDATION_CONSTANTS.MAX_NAME_LENGTH} characters`,
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_CONSTANTS.MIN_PASSWORD_LENGTH} characters`,
  PASSWORD_TOO_LONG: `Password must not exceed ${VALIDATION_CONSTANTS.MAX_PASSWORD_LENGTH} characters`,
  COMMENT_TOO_SHORT: `Comment must be at least ${VALIDATION_CONSTANTS.MIN_COMMENT_LENGTH} character`,
  COMMENT_TOO_LONG: `Comment must not exceed ${VALIDATION_CONSTANTS.MAX_COMMENT_LENGTH} characters`,
  
  // Password strength
  PASSWORD_WEAK: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  
  // Numeric validation
  INVALID_RATING: `Rating must be between ${VALIDATION_CONSTANTS.MIN_RATING} and ${VALIDATION_CONSTANTS.MAX_RATING}`,
  INVALID_QUANTITY: `Quantity must be between ${VALIDATION_CONSTANTS.MIN_QUANTITY} and ${VALIDATION_CONSTANTS.MAX_QUANTITY}`,
  INVALID_PRICE: `Price must be between ₹${VALIDATION_CONSTANTS.MIN_PRICE} and ₹${VALIDATION_CONSTANTS.MAX_PRICE}`,
  INVALID_DISCOUNT: `Discount must be between ${VALIDATION_CONSTANTS.MIN_DISCOUNT}% and ${VALIDATION_CONSTANTS.MAX_DISCOUNT}%`,
  
  // File validation
  FILE_TOO_LARGE: 'File size is too large',
  INVALID_FILE_FORMAT: 'Invalid file format',
  IMAGE_TOO_LARGE: `Image size must not exceed ${VALIDATION_CONSTANTS.MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
  DOCUMENT_TOO_LARGE: `Document size must not exceed ${VALIDATION_CONSTANTS.MAX_DOCUMENT_SIZE / (1024 * 1024)}MB`,
  
  // Business rules
  TERMS_REQUIRED: 'You must agree to the terms and conditions',
  PRIVACY_REQUIRED: 'You must agree to the privacy policy',
  AGE_REQUIREMENT: 'You must be at least 18 years old',
  
  // Date validation
  INVALID_DATE: 'Please enter a valid date',
  DATE_IN_PAST: 'Date cannot be in the past',
  DATE_IN_FUTURE: 'Date cannot be in the future',
} as const;

// Common validation schemas
export const commonValidations = {
  // String validations
  name: (fieldName = 'Name') => 
    z.string()
      .min(VALIDATION_CONSTANTS.MIN_NAME_LENGTH, `${fieldName} ${VALIDATION_MESSAGES.NAME_TOO_SHORT.split(' ').slice(1).join(' ')}`)
      .max(VALIDATION_CONSTANTS.MAX_NAME_LENGTH, `${fieldName} ${VALIDATION_MESSAGES.NAME_TOO_LONG.split(' ').slice(1).join(' ')}`)
      .regex(/^[a-zA-Z\s'.-]+$/, `${fieldName} can only contain letters, spaces, apostrophes, periods, and hyphens`),

  email: z.string()
    .min(1, VALIDATION_MESSAGES.EMAIL_REQUIRED)
    .email(VALIDATION_MESSAGES.INVALID_EMAIL)
    .toLowerCase(),

  password: z.string()
    .min(VALIDATION_CONSTANTS.MIN_PASSWORD_LENGTH, VALIDATION_MESSAGES.PASSWORD_TOO_SHORT)
    .max(VALIDATION_CONSTANTS.MAX_PASSWORD_LENGTH, VALIDATION_MESSAGES.PASSWORD_TOO_LONG)
    .regex(VALIDATION_CONSTANTS.PASSWORD_REGEX, VALIDATION_MESSAGES.PASSWORD_WEAK),

  phone: z.string()
    .min(1, VALIDATION_MESSAGES.PHONE_REQUIRED)
    .regex(VALIDATION_CONSTANTS.INDIAN_PHONE_REGEX, VALIDATION_MESSAGES.INVALID_PHONE)
    .transform((val) => val.replace(/\D/g, '')), // Remove non-digits

  pincode: z.string()
    .min(1, 'Pincode is required')
    .regex(VALIDATION_CONSTANTS.INDIAN_PINCODE_REGEX, VALIDATION_MESSAGES.INVALID_PINCODE),

  gst: z.string()
    .regex(VALIDATION_CONSTANTS.GST_REGEX, VALIDATION_MESSAGES.INVALID_GST)
    .toUpperCase(),

  pan: z.string()
    .regex(VALIDATION_CONSTANTS.PAN_REGEX, VALIDATION_MESSAGES.INVALID_PAN)
    .toUpperCase(),

  aadhar: z.string()
    .regex(VALIDATION_CONSTANTS.AADHAR_REGEX, VALIDATION_MESSAGES.INVALID_AADHAR),

  url: z.string()
    .regex(VALIDATION_CONSTANTS.URL_REGEX, VALIDATION_MESSAGES.INVALID_URL),

  // Numeric validations
  rating: z.number()
    .min(VALIDATION_CONSTANTS.MIN_RATING, VALIDATION_MESSAGES.INVALID_RATING)
    .max(VALIDATION_CONSTANTS.MAX_RATING, VALIDATION_MESSAGES.INVALID_RATING),

  quantity: z.number()
    .min(VALIDATION_CONSTANTS.MIN_QUANTITY, VALIDATION_MESSAGES.INVALID_QUANTITY)
    .max(VALIDATION_CONSTANTS.MAX_QUANTITY, VALIDATION_MESSAGES.INVALID_QUANTITY),

  price: z.number()
    .min(VALIDATION_CONSTANTS.MIN_PRICE, VALIDATION_MESSAGES.INVALID_PRICE)
    .max(VALIDATION_CONSTANTS.MAX_PRICE, VALIDATION_MESSAGES.INVALID_PRICE),

  discount: z.number()
    .min(VALIDATION_CONSTANTS.MIN_DISCOUNT, VALIDATION_MESSAGES.INVALID_DISCOUNT)
    .max(VALIDATION_CONSTANTS.MAX_DISCOUNT, VALIDATION_MESSAGES.INVALID_DISCOUNT),

  // Boolean validations
  terms: z.boolean()
    .refine((val) => val === true, VALIDATION_MESSAGES.TERMS_REQUIRED),

  privacy: z.boolean()
    .refine((val) => val === true, VALIDATION_MESSAGES.PRIVACY_REQUIRED),

  // Date validations
  date: z.date()
    .refine((date) => !isNaN(date.getTime()), VALIDATION_MESSAGES.INVALID_DATE),

  pastDate: z.date()
    .refine((date) => date <= new Date(), VALIDATION_MESSAGES.DATE_IN_FUTURE),

  futureDate: z.date()
    .refine((date) => date >= new Date(), VALIDATION_MESSAGES.DATE_IN_PAST),

  // Text with length limits
  comment: z.string()
    .min(VALIDATION_CONSTANTS.MIN_COMMENT_LENGTH, VALIDATION_MESSAGES.COMMENT_TOO_SHORT)
    .max(VALIDATION_CONSTANTS.MAX_COMMENT_LENGTH, VALIDATION_MESSAGES.COMMENT_TOO_LONG)
    .trim(),

  description: z.string()
    .max(VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH, `Description must not exceed ${VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH} characters`)
    .trim(),

  address: z.string()
    .min(1, VALIDATION_MESSAGES.ADDRESS_REQUIRED)
    .max(VALIDATION_CONSTANTS.MAX_ADDRESS_LENGTH, `Address must not exceed ${VALIDATION_CONSTANTS.MAX_ADDRESS_LENGTH} characters`)
    .trim(),
};

// File validation functions
export const fileValidations = {
  image: (file: File): boolean => {
    return (VALIDATION_CONSTANTS.ALLOWED_IMAGE_FORMATS as readonly string[]).includes(file.type) &&
           file.size <= VALIDATION_CONSTANTS.MAX_IMAGE_SIZE;
  },

  document: (file: File): boolean => {
    return (VALIDATION_CONSTANTS.ALLOWED_DOCUMENT_FORMATS as readonly string[]).includes(file.type) &&
           file.size <= VALIDATION_CONSTANTS.MAX_DOCUMENT_SIZE;
  },

  imageSize: (file: File): boolean => {
    return file.size <= VALIDATION_CONSTANTS.MAX_IMAGE_SIZE;
  },

  documentSize: (file: File): boolean => {
    return file.size <= VALIDATION_CONSTANTS.MAX_DOCUMENT_SIZE;
  },
};

// Validation helper functions
export const validationHelpers = {
  // Clean phone number
  cleanPhoneNumber: (phone: string): string => {
    return phone.replace(/\D/g, '').replace(/^91/, '');
  },

  // Format phone number for display
  formatPhoneNumber: (phone: string): string => {
    const cleaned = validationHelpers.cleanPhoneNumber(phone);
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  },

  // Check if email domain is allowed
  isAllowedEmailDomain: (email: string, allowedDomains?: string[]): boolean => {
    if (!allowedDomains || allowedDomains.length === 0) return true;
    const domain = email.split('@')[1]?.toLowerCase();
    return allowedDomains.some(allowedDomain => domain === allowedDomain.toLowerCase());
  },

  // Password strength checker
  checkPasswordStrength: (password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[@$!%*?&]/.test(password)) score += 1;
    else feedback.push('Add special characters');

    return {
      score,
      feedback,
      isStrong: score >= 4,
    };
  },

  // Validate Indian business documents
  validateBusinessDocument: (type: 'gst' | 'pan' | 'aadhar', value: string): boolean => {
    switch (type) {
      case 'gst':
        return VALIDATION_CONSTANTS.GST_REGEX.test(value);
      case 'pan':
        return VALIDATION_CONSTANTS.PAN_REGEX.test(value);
      case 'aadhar':
        return VALIDATION_CONSTANTS.AADHAR_REGEX.test(value);
      default:
        return false;
    }
  },

  // Age validation
  calculateAge: (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  },

  isAdult: (birthDate: Date): boolean => {
    return validationHelpers.calculateAge(birthDate) >= 18;
  },

  // Custom validation for Indian states
  indianStates: [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
    'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep',
    'Puducherry'
  ] as const,

  isValidIndianState: (state: string): boolean => {
    return validationHelpers.indianStates.includes(state as typeof validationHelpers.indianStates[number]);
  },
};

// Zod transformers for common data types
export const zodTransformers = {
  // Transform string to number
  stringToNumber: z.string().transform((val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  }),

  // Transform string to date
  stringToDate: z.string().transform((val) => {
    const date = new Date(val);
    return isNaN(date.getTime()) ? new Date() : date;
  }),

  // Transform string to boolean
  stringToBoolean: z.string().transform((val) => {
    return val.toLowerCase() === 'true' || val === '1';
  }),

  // Trim and clean string
  cleanString: z.string().transform((val) => {
    return val.trim().replace(/\s+/g, ' ');
  }),

  // Convert to lowercase
  toLowerCase: z.string().transform((val) => val.toLowerCase()),

  // Convert to uppercase
  toUpperCase: z.string().transform((val) => val.toUpperCase()),
};

// Schema composition helpers
export const schemaHelpers = {
  // Create password confirmation schema
  passwordConfirmation: (passwordField = 'password', confirmField = 'confirmPassword') => ({
    [passwordField]: commonValidations.password,
    [confirmField]: z.string(),
  }),

  // Add password confirmation refinement
  addPasswordConfirmation: <T extends Record<string, unknown>>(
    schema: z.ZodType<T>,
    passwordField = 'password',
    confirmField = 'confirmPassword'
  ) => {
    return schema.refine(
      (data) => (data as Record<string, unknown>)[passwordField] === (data as Record<string, unknown>)[confirmField],
      {
        message: VALIDATION_MESSAGES.PASSWORDS_NOT_MATCH,
        path: [confirmField],
      }
    );
  },

  // Create optional field
  optional: <T>(schema: z.ZodType<T>) => z.optional(schema),

  // Create nullable field
  nullable: <T>(schema: z.ZodType<T>) => z.nullable(schema),

  // Create array with minimum length
  minArray: <T>(schema: z.ZodType<T>, min: number, message?: string) => 
    z.array(schema).min(min, message || `At least ${min} item${min > 1 ? 's' : ''} required`),
};

const validationCommon = {
  VALIDATION_CONSTANTS,
  VALIDATION_MESSAGES,
  commonValidations,
  fileValidations,
  validationHelpers,
  zodTransformers,
  schemaHelpers,
};

export default validationCommon;
